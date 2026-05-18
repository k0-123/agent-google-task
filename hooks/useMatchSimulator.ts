import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Match, Delivery, Poll, MatchScore, OutcomeType } from '@/lib/types';
import { playAudioChime } from './usePrediction';

const BALL_OUTCOMES: { outcome: OutcomeType; runs: number; comm: (userName: string) => string; batsman: string; bowler: string }[] = [
  { 
    outcome: 'boundary_6', 
    runs: 6, 
    comm: (u) => `Bumrah misses the yorker by an inch, Hardik Pandya gets under it and dispatches it over long-on for a colossal SIX! The Wankhede crowd erupts! Fantastic predictive call by ${u} who locked in SIX just in time!`,
    batsman: "Hardik Pandya",
    bowler: "Jasprit Bumrah"
  },
  { 
    outcome: 'dot', 
    runs: 0, 
    comm: (u) => `Absolute perfection from Bumrah. 144 km/h searing yorker right at the base of middle stump. Pandya jams your bat down just in time. ${u} read the pitch perfectly to predict a Dot ball!`,
    batsman: "Hardik Pandya",
    bowler: "Jasprit Bumrah"
  },
  { 
    outcome: 'boundary_4', 
    runs: 4, 
    comm: (u) => `Slight width outside off, Suryakumar Yadav opens the face of the blade and slices it past backward point for a boundary! Pure wizardry! ${u} is climbing the live leaderboard with that 20 pt call!`,
    batsman: "Suryakumar Yadav",
    bowler: "Jasprit Bumrah"
  },
  { 
    outcome: 'wicket', 
    runs: 0, 
    comm: (u) => `BOWLED HIM! Jasprit Bumrah strikes! The off-cutter grips and knocks back the off-stump. Rohit Sharma departs after a masterclass! High stakes call by ${u} pays off big time!`,
    batsman: "Rohit Sharma",
    bowler: "Jasprit Bumrah"
  },
  { 
    outcome: 'single', 
    runs: 1, 
    comm: (u) => `Tucked away off the pads to deep square leg. Sensible batting, rotating the strike. ${u} maintains the streak with a smart 1-3 Runs call!`,
    batsman: "Suryakumar Yadav",
    bowler: "Jasprit Bumrah"
  },
  { 
    outcome: 'wide', 
    runs: 1, 
    comm: (u) => `Bumrah tries the wide yorker but pushes it well beyond the tramline. Umpire stretches his arms. Wide ball. ${u} spotted the pressure and nailed the Wide prediction!`,
    batsman: "Hardik Pandya",
    bowler: "Jasprit Bumrah"
  },
];

const INITIAL_LEADERBOARD: MatchScore[] = [
  { user_id: 'vikram_sharma', match_id: 'demo', points: 2450, correct_predictions: 18, total_predictions: 22, current_streak: 5, best_streak: 8, profiles: { display_name: 'Vikram Sharma', avatar_url: '' } },
  { user_id: 'arjun_mehta', match_id: 'demo', points: 2310, correct_predictions: 17, total_predictions: 22, current_streak: 3, best_streak: 6, profiles: { display_name: 'Arjun Mehta', avatar_url: '' } },
  { user_id: 'priya_patel', match_id: 'demo', points: 2180, correct_predictions: 15, total_predictions: 22, current_streak: 4, best_streak: 7, profiles: { display_name: 'Priya Patel', avatar_url: '' } },
  { user_id: 'rohan_gupta', match_id: 'demo', points: 1950, correct_predictions: 14, total_predictions: 22, current_streak: 2, best_streak: 5, profiles: { display_name: 'Rohan Gupta', avatar_url: '' } },
  { user_id: 'neha_deshmukh', match_id: 'demo', points: 1820, correct_predictions: 13, total_predictions: 22, current_streak: 1, best_streak: 4, profiles: { display_name: 'Neha Deshmukh', avatar_url: '' } },
];

const POLLS: Poll[] = [
  {
    id: 'poll_1',
    match_id: 'demo',
    question: 'Will MS Dhoni finish the match with a Six?',
    options: ['Yes, definitely! 🚁', 'No, Bumrah will bowl him 🎯', 'Match will go to Super Over ⚡'],
    created_at: new Date().toISOString()
  },
  {
    id: 'poll_2',
    match_id: 'demo',
    question: 'Who will win Player of the Match?',
    options: ['Jasprit Bumrah 🌟', 'Suryakumar Yadav 🔥', 'Hardik Pandya 💥'],
    created_at: new Date().toISOString()
  },
  {
    id: 'poll_3',
    match_id: 'demo',
    question: 'What will be the outcome of this death over?',
    options: ['15+ runs scored 🚀', '2+ wickets fall 🔴', 'Tight over under 8 runs 🛡️'],
    created_at: new Date().toISOString()
  }
];

export function useMatchSimulator(matchId: string, currentUserId?: string, currentUserName?: string) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(30); // 30 seconds interval
  const [secondsRemaining, setSecondsRemaining] = useState(30);

  // Match State
  const [match, setMatch] = useState<Match>({
    id: matchId,
    title: 'IPL 2026 Final: Mumbai Indians vs Chennai Super Kings',
    team_a: 'Mumbai Indians',
    team_b: 'Chennai Super Kings',
    team_a_short: 'MI',
    team_b_short: 'CSK',
    score_a: '0/0',
    score_b: '0/0',
    current_over: 0,
    current_ball: 0,
    total_overs: 20,
    status: 'upcoming',
    batting_team: 'Mumbai Indians',
    venue: 'Wankhede Stadium, Mumbai',
    last_6: []
  });

  const [latestDelivery, setLatestDelivery] = useState<Delivery | null>(null);
  const [commentary, setCommentary] = useState("Welcome to the IPL 2026 Final at Wankhede Stadium. The atmosphere is electric as Mumbai Indians take on Chennai Super Kings. Click 'Start Live Match Simulator' to begin the autonomous ball-by-ball showdown!");
  const [pollIndex, setPollIndex] = useState(0);

  // Leaderboard State
  const [scores, setScores] = useState<MatchScore[]>([]);

  useEffect(() => {
    setScores(currentScores => {
      let updated = [...(currentScores.length > 0 ? currentScores : INITIAL_LEADERBOARD)];
      if (currentUserId && !updated.some(s => s.user_id === currentUserId)) {
        updated.push({
          user_id: currentUserId,
          match_id: matchId,
          points: 1420,
          correct_predictions: 10,
          total_predictions: 15,
          current_streak: 7,
          best_streak: 7,
          profiles: { display_name: currentUserName || 'Cricket Wizard', avatar_url: '' }
        });
      } else if (currentUserId) {
        updated = updated.map(s => {
          if (s.user_id === currentUserId) {
            return { ...s, profiles: { display_name: currentUserName || 'Cricket Wizard', avatar_url: '' } };
          }
          return s;
        });
      }
      updated.sort((a, b) => (b.points || 0) - (a.points || 0));
      return updated;
    });
  }, [currentUserId, matchId, currentUserName]);

  const userRank = useMemo(() => {
    if (!currentUserId) return 1;
    const index = scores.findIndex(s => s.user_id === currentUserId);
    return index >= 0 ? index + 1 : 1;
  }, [scores, currentUserId]);

  const startSimulator = useCallback(() => {
    setIsSimulating(true);
    setSecondsRemaining(simulationSpeed);
    setMatch(prev => ({
      ...prev,
      status: 'live',
      score_a: '180/2',
      current_over: 18,
      current_ball: 0,
      last_6: ['dot', 'boundary_4', 'single', 'boundary_6', 'dot', 'single']
    }));
    setCommentary(`Jasprit Bumrah marks his run-up for the 19th over. 38 runs needed off 12 balls. The Wankhede crowd is chanting 'Bumrah! Bumrah!'. ${currentUserName || 'Cricket Wizard'} is currently locked in on the leaderboard. Make your predictions now!`);
    playAudioChime('advance');
  }, [simulationSpeed, currentUserName]);

  const stopSimulator = useCallback(() => {
    setIsSimulating(false);
    setMatch(prev => ({
      ...prev,
      status: 'upcoming',
      score_a: '0/0',
      current_over: 0,
      current_ball: 0,
      last_6: []
    }));
    setCommentary("Welcome to the IPL 2026 Final at Wankhede Stadium. Click 'Start Live Match Simulator' to begin the autonomous ball-by-ball showdown!");
  }, []);

  // Autonomous Simulation Loop
  useEffect(() => {
    if (!isSimulating) return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          // Trigger next delivery!
          const randomOutcome = BALL_OUTCOMES[Math.floor(Math.random() * BALL_OUTCOMES.length)];
          
          setMatch(currentMatch => {
            const [runsStr, wktsStr] = (currentMatch.score_a || '180/2').split('/');
            let runs = parseInt(runsStr || '180', 10);
            let wkts = parseInt(wktsStr || '2', 10);
            let over = currentMatch.current_over || 18;
            let ball = currentMatch.current_ball || 0;

            runs += randomOutcome.runs;
            if (randomOutcome.outcome === 'wicket') wkts += 1;

            if (randomOutcome.outcome !== 'wide') {
              ball += 1;
              if (ball >= 6) {
                ball = 0;
                over += 1;
              }
            }

            const newScore = `${runs}/${wkts}`;
            const last6 = [...(currentMatch.last_6 || [])];
            if (last6.length >= 6) last6.shift();
            last6.push(randomOutcome.outcome);

            // Also cycle poll every over change
            if (ball === 0) {
              setPollIndex(pi => (pi + 1) % POLLS.length);
            }

            return {
              ...currentMatch,
              score_a: newScore,
              current_over: over,
              current_ball: ball,
              last_6: last6
            };
          });

          setLatestDelivery({
            id: 'del_' + Math.random().toString(36).substr(2, 9),
            match_id: matchId,
            over_number: 18,
            ball_number: 1,
            outcome: randomOutcome.outcome,
            runs_scored: randomOutcome.runs,
            batsman: randomOutcome.batsman,
            bowler: randomOutcome.bowler,
            created_at: new Date().toISOString()
          });

          setCommentary(randomOutcome.comm(currentUserName || 'Cricket Wizard'));
          playAudioChime('advance');

          // Shift rival leaderboard scores dynamically
          setScores(currentScores => {
            return currentScores.map(s => {
              if (s.user_id !== currentUserId && Math.random() > 0.3) {
                const added = Math.floor(Math.random() * 40) + 10;
                const newStreak = Math.random() > 0.5 ? (s.current_streak || 0) + 1 : 0;
                const bestStreak = Math.max(s.best_streak || 0, newStreak);
                return { 
                  ...s, 
                  points: (s.points || 0) + added,
                  current_streak: newStreak,
                  best_streak: bestStreak,
                  profiles: s.profiles
                };
              }
              if (s.user_id === currentUserId) {
                return {
                  ...s,
                  profiles: { display_name: currentUserName || 'Cricket Wizard', avatar_url: '' }
                };
              }
              return s;
            }).sort((a, b) => (b.points || 0) - (a.points || 0));
          });

          return simulationSpeed;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSimulating, simulationSpeed, matchId, currentUserId, currentUserName]);

  const handleUserPredictionResult = useCallback((pointsEarned: number, isCorrect: boolean) => {
    if (!currentUserId) return;
    setScores(currentScores => {
      return currentScores.map(s => {
        if (s.user_id === currentUserId) {
          const newPoints = (s.points || 0) + pointsEarned;
          const newStreak = isCorrect ? (s.current_streak || 0) + 1 : 0;
          const bestStreak = Math.max(s.best_streak || 0, newStreak);
          return {
            ...s,
            points: newPoints,
            current_streak: newStreak,
            best_streak: bestStreak,
            correct_predictions: (s.correct_predictions || 0) + (isCorrect ? 1 : 0),
            total_predictions: (s.total_predictions || 0) + 1,
            profiles: { display_name: currentUserName || 'Cricket Wizard', avatar_url: '' }
          };
        }
        return s;
      }).sort((a, b) => (b.points || 0) - (a.points || 0));
    });
  }, [currentUserId, currentUserName]);

  return {
    isSimulating,
    simulationSpeed,
    secondsRemaining,
    match,
    latestDelivery,
    commentary,
    poll: POLLS[pollIndex],
    scores,
    userRank,
    startSimulator,
    stopSimulator,
    setSimulationSpeed,
    handleUserPredictionResult
  };
}
