export type OutcomeType = 
  | 'dot' 
  | 'single' 
  | 'boundary_4' 
  | 'boundary_6' 
  | 'wicket' 
  | 'wide'

export interface Match {
  id: string
  title: string
  team_a: string
  team_b: string
  team_a_short: string
  team_b_short: string
  score_a: string
  score_b: string
  current_over: number
  current_ball: number
  total_overs: number
  status: 'upcoming' | 'live' | 'completed'
  batting_team: string
  venue: string
  last_6: OutcomeType[]
}

export interface Delivery {
  id: string
  match_id: string
  over_number: number
  ball_number: number
  outcome: OutcomeType
  runs_scored: number
  batsman?: string
  bowler?: string
  created_at: string
}

export interface MatchScore {
  user_id: string
  match_id: string
  points: number
  correct_predictions: number
  total_predictions: number
  current_streak: number
  best_streak: number
  profiles?: { display_name: string; avatar_url: string }
}

export interface Profile {
  id: string
  display_name: string
  avatar_url?: string
  total_points: number
  best_streak: number
  matches_played: number
  created_at: string
}

export interface Reaction {
  id: string
  user_id: string
  match_id: string
  emoji: string
  created_at: string
}

export interface Poll {
  id: string
  match_id: string
  question: string
  options: string[]
  closes_at?: string
  created_at: string
}

export interface PollVote {
  id: string
  poll_id: string
  user_id: string
  option_index: number
  created_at: string
}
