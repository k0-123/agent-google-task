const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
  console.error('Could not read .env.local file at:', envPath);
  process.exit(1);
}

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or Service Role Key in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateMatch() {
  console.log('Connecting to Supabase to update live matches to MI vs CSK...');
  
  // 1. Find existing live match
  const { data: matches, error: fetchError } = await supabase
    .from('matches')
    .select('*')
    .eq('status', 'live');

  if (fetchError) {
    console.error('Error fetching matches:', fetchError);
    process.exit(1);
  }

  if (!matches || matches.length === 0) {
    console.log('No live matches found. Inserting a new live MI vs CSK match...');
    const { data: inserted, error: insertError } = await supabase
      .from('matches')
      .insert({
        title: "IPL 2026 Final: Mumbai Indians vs Chennai Super Kings",
        team_a: "Mumbai Indians",
        team_b: "Chennai Super Kings",
        team_a_short: "MI",
        team_b_short: "CSK",
        score_a: "186/4",
        score_b: "0/0",
        current_over: 18,
        current_ball: 4,
        total_overs: 20,
        status: "live",
        batting_team: "Mumbai Indians",
        venue: "Wankhede Stadium, Mumbai",
        last_6: ["dot", "boundary_6", "single", "wicket", "boundary_4", "dot"]
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting match:', insertError);
      process.exit(1);
    }
    console.log('Successfully inserted live match:', inserted.id);

    // Insert dummy deliveries for this match
    await insertDummyDeliveries(inserted.id);
    await insertDummyLeaderboard(inserted.id);
  } else {
    console.log(`Found ${matches.length} live match(es). Updating to MI vs CSK...`);
    for (const m of matches) {
      const { error: updateError } = await supabase
        .from('matches')
        .update({
          title: "IPL 2026 Final: Mumbai Indians vs Chennai Super Kings",
          team_a: "Mumbai Indians",
          team_b: "Chennai Super Kings",
          team_a_short: "MI",
          team_b_short: "CSK",
          score_a: "186/4",
          score_b: "0/0",
          current_over: 18,
          current_ball: 4,
          total_overs: 20,
          status: "live",
          batting_team: "Mumbai Indians",
          venue: "Wankhede Stadium, Mumbai",
          last_6: ["dot", "boundary_6", "single", "wicket", "boundary_4", "dot"]
        })
        .eq('id', m.id);

      if (updateError) {
        console.error(`Error updating match ${m.id}:`, updateError);
      } else {
        console.log(`Successfully updated match ${m.id} to MI vs CSK`);
        // Check if deliveries exist, if not insert dummy deliveries
        const { data: deliveries } = await supabase.from('deliveries').select('id').eq('match_id', m.id);
        if (!deliveries || deliveries.length === 0) {
          await insertDummyDeliveries(m.id);
        }
        // Check if leaderboard exists, if not insert dummy leaderboard
        const { data: scores } = await supabase.from('match_scores').select('id').eq('match_id', m.id);
        if (!scores || scores.length === 0) {
          await insertDummyLeaderboard(m.id);
        }
      }
    }
  }

  console.log('Update complete! The app will now display live dynamic MI vs CSK data.');
}

async function insertDummyDeliveries(matchId) {
  console.log('Inserting dummy deliveries for match:', matchId);
  const DUMMY_DELIVERIES = [
    { match_id: matchId, over_number: 18, ball_number: 1, outcome: 'dot', runs_scored: 0, batsman: 'Hardik Pandya', bowler: 'Jasprit Bumrah' },
    { match_id: matchId, over_number: 18, ball_number: 2, outcome: 'boundary_6', runs_scored: 6, batsman: 'Hardik Pandya', bowler: 'Jasprit Bumrah' },
    { match_id: matchId, over_number: 18, ball_number: 3, outcome: 'single', runs_scored: 1, batsman: 'Hardik Pandya', bowler: 'Jas-Bumrah' },
    { match_id: matchId, over_number: 18, ball_number: 4, outcome: 'wicket', runs_scored: 0, batsman: 'Rohit Sharma', bowler: 'Jasprit Bumrah' },
    { match_id: matchId, over_number: 18, ball_number: 5, outcome: 'boundary_4', runs_scored: 4, batsman: 'Suryakumar Yadav', bowler: 'Jasprit Bumrah' },
    { match_id: matchId, over_number: 18, ball_number: 6, outcome: 'dot', runs_scored: 0, batsman: 'Suryakumar Yadav', bowler: 'Jasprit Bumrah' }
  ];
  await supabase.from('deliveries').insert(DUMMY_DELIVERIES);
}

async function insertDummyLeaderboard(matchId) {
  console.log('Inserting dummy leaderboard for match:', matchId);
  // Get some user profiles or insert dummy match scores
  const DUMMY_LEADERBOARD = [
    { user_id: 'guest_demo_user', match_id: matchId, points: 2450, correct_predictions: 18, total_predictions: 22, current_streak: 7, best_streak: 7 },
  ];
  try {
    await supabase.from('match_scores').insert(DUMMY_LEADERBOARD);
  } catch (e) {
    console.log('Note: guest_demo_user profile might not exist yet, skipping dummy leaderboard insert.');
  }
}

updateMatch();
