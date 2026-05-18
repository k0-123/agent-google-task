-- ====================================================================
-- CRICKETPULSE SUPABASE SCHEMA & MIGRATION
-- ====================================================================

-- PROFILES (auto-created on signup via trigger)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text not null default 'Fan',
  avatar_url text,
  total_points integer not null default 0,
  best_streak integer not null default 0,
  matches_played integer not null default 0,
  created_at timestamptz default now()
);

-- MATCHES
create table public.matches (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  team_a text not null,
  team_b text not null,
  team_a_short text not null,  -- e.g. "IND"
  team_b_short text not null,  -- e.g. "AUS"
  score_a text default '0/0',
  score_b text default '0/0',
  current_over integer default 0,
  current_ball integer default 0,
  total_overs integer default 20,
  status text default 'upcoming',  -- upcoming | live | completed
  batting_team text,
  venue text,
  last_6 jsonb default '[]',  -- array of last 6 ball outcomes for display
  created_at timestamptz default now()
);

-- DELIVERIES (each ball bowled)
create table public.deliveries (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references public.matches(id) on delete cascade,
  over_number integer not null,
  ball_number integer not null,
  outcome text not null,  -- dot|single|boundary_4|boundary_6|wicket|wide
  runs_scored integer default 0,
  batsman text,
  bowler text,
  created_at timestamptz default now()
);

-- PREDICTIONS (one per user per delivery)
create table public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  match_id uuid references public.matches(id) on delete cascade,
  delivery_id uuid references public.deliveries(id) on delete cascade,
  predicted_outcome text not null,
  actual_outcome text,
  is_correct boolean,
  points_earned integer default 0,
  streak_at_time integer default 0,
  created_at timestamptz default now(),
  unique(user_id, delivery_id)
);

-- REACTIONS (emoji bursts)
create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  match_id uuid references public.matches(id) on delete cascade,
  emoji text not null,
  created_at timestamptz default now()
);

-- POLLS (AI-generated per over)
create table public.polls (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references public.matches(id) on delete cascade,
  question text not null,
  options jsonb not null,  -- ["Yes", "No", "Maybe"]
  closes_at timestamptz,
  created_at timestamptz default now()
);

-- POLL VOTES
create table public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid references public.polls(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  option_index integer not null,
  created_at timestamptz default now(),
  unique(poll_id, user_id)
);

-- MATCH SCORES (leaderboard per match)
create table public.match_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  match_id uuid references public.matches(id) on delete cascade,
  points integer default 0,
  correct_predictions integer default 0,
  total_predictions integer default 0,
  current_streak integer default 0,
  best_streak integer default 0,
  unique(user_id, match_id)
);

-- ENABLE RLS ON ALL TABLES
alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.deliveries enable row level security;
alter table public.predictions enable row level security;
alter table public.reactions enable row level security;
alter table public.polls enable row level security;
alter table public.poll_votes enable row level security;
alter table public.match_scores enable row level security;

-- RLS POLICIES
create policy "profiles_public_read" on public.profiles for select using (true);
create policy "profiles_own_update" on public.profiles for update using (auth.uid() = id);

create policy "matches_public_read" on public.matches for select using (true);
create policy "deliveries_public_read" on public.deliveries for select using (true);
create policy "polls_public_read" on public.polls for select using (true);
create policy "poll_votes_public_read" on public.poll_votes for select using (true);
create policy "match_scores_public_read" on public.match_scores for select using (true);

create policy "predictions_own_insert" on public.predictions 
  for insert with check (auth.uid() = user_id);
create policy "predictions_own_read" on public.predictions 
  for select using (auth.uid() = user_id);

create policy "reactions_own_insert" on public.reactions 
  for insert with check (auth.uid() = user_id);
create policy "reactions_public_read" on public.reactions for select using (true);

create policy "poll_votes_own_insert" on public.poll_votes 
  for insert with check (auth.uid() = user_id);

-- ENABLE REALTIME
alter publication supabase_realtime add table public.matches;
alter publication supabase_realtime add table public.deliveries;
alter publication supabase_realtime add table public.reactions;
alter publication supabase_realtime add table public.match_scores;
alter publication supabase_realtime add table public.polls;

-- AUTO CREATE PROFILE TRIGGER
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Fan#' || floor(random()*9999)::text),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ====================================================================
-- PHASE 4 RPC: UPDATE MATCH SCORE (ATOMIC POINTS & STREAK TRACKER)
-- ====================================================================
create or replace function update_match_score(
  p_user_id uuid, p_match_id uuid,
  p_points integer, p_correct boolean
) returns void as $$
declare
  v_current_streak integer;
begin
  insert into match_scores (user_id, match_id, points, correct_predictions,
    total_predictions, current_streak, best_streak)
  values (p_user_id, p_match_id, p_points,
    case when p_correct then 1 else 0 end, 1,
    case when p_correct then 1 else 0 end,
    case when p_correct then 1 else 0 end)
  on conflict (user_id, match_id) do update set
    points = match_scores.points + p_points,
    total_predictions = match_scores.total_predictions + 1,
    correct_predictions = match_scores.correct_predictions + 
      case when p_correct then 1 else 0 end,
    current_streak = case when p_correct 
      then match_scores.current_streak + 1 else 0 end,
    best_streak = greatest(match_scores.best_streak,
      case when p_correct then match_scores.current_streak + 1 else 0 end);
end;
$$ language plpgsql security definer;

-- ====================================================================
-- PHASE 10: INITIAL DEMO MATCH DATA
-- ====================================================================
INSERT INTO matches (title, team_a, team_b, team_a_short, team_b_short,
  score_a, status, batting_team, venue, total_overs)
VALUES ('India vs Australia T20 Final', 'India', 'Australia', 
  'IND', 'AUS', '0/0', 'live', 'India', 
  'Narendra Modi Stadium, Ahmedabad', 20);
