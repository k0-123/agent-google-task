# CricketPulse Implementation Plan

## Goal
Build CricketPulse — a premium mobile-first Progressive Web App (PWA) where cricket fans use their phone as an interactive second screen while watching live TV broadcasts. Powered by **Supabase Realtime** for instant pub/sub state synchronization and **ChatGPT (OpenAI GPT-4o-mini)** for intelligent match commentary, smart polls, and tactical hints.

## Phases

### Phase 1: Project Setup & Auth (Completed)
- [x] Task 1: Initialize Next.js 15 with TypeScript and Tailwind CSS v4 → Verify: Next.js project structure created
- [x] Task 2: Install dependencies (`@supabase/ssr`, `@supabase/supabase-js`, `framer-motion`) → Verify: `package.json` has dependencies
- [x] Task 3: Create `.env.local` with Supabase URL, Supabase Anon Key, Supabase Service Role Key, and OpenAI API Key → Verify: `.env.local` exists and contains active `OPENAI_API_KEY`
- [x] Task 4: Create `lib/supabase/client.ts` (browser client) → Verify: `createClient` exported correctly
- [x] Task 5: Create `lib/supabase/server.ts` (server client using cookies) → Verify: `createClient` exported correctly
- [x] Task 6: Create middleware to protect authenticated routes → Verify: Middleware redirects unauthenticated users
- [x] Task 7: Build `app/(auth)/login/page.tsx` with OAuth and Guest Login → Verify: Login page renders with functional guest session initialization

### Phase 2: Database Schema & Realtime Config (Completed)
- [x] Task 1: Execute SQL schema for `profiles`, `matches`, `deliveries`, `predictions`, `reactions`, `polls`, `poll_votes`, and `match_scores` → Verify: Tables created in Supabase
- [x] Task 2: Enable Row Level Security (RLS) policies across all tables → Verify: RLS active with appropriate public read and authenticated insert rules
- [x] Task 3: Enable Supabase Realtime publication for `matches`, `deliveries`, `reactions`, `match_scores`, and `polls` → Verify: Realtime active in PostgreSQL publication
- [x] Task 4: Create `handle_new_user` trigger for automatic profile generation → Verify: Trigger executes on `auth.users` insert

### Phase 3: Types & Points Calculation Engine (Completed)
- [x] Task 1: Create `lib/types/index.ts` defining `Match`, `Delivery`, `MatchScore`, `OutcomeType`, `Poll` → Verify: TypeScript interfaces exported cleanly
- [x] Task 2: Create `lib/points/calculator.ts` with base points and streak multiplier logic → Verify: Points calculation functions exported
- [x] Task 3: Create Supabase RPC function `update_match_score` for atomic points and streak tracking → Verify: RPC deployed and callable

### Phase 4: Realtime Custom Hooks (Completed)
- [x] Task 1: Create `hooks/useMatch.ts` for live match state subscription → Verify: Hook manages live match updates
- [x] Task 2: Create `hooks/useDeliveries.ts` for live ball-by-ball delivery stream → Verify: Hook appends new deliveries via Realtime
- [x] Task 3: Create `hooks/useLeaderboard.ts` for live rank tracking → Verify: Hook sorts scores by points descending
- [x] Task 4: Create `hooks/useReactions.ts` for live emoji bursts → Verify: Hook aggregates incoming emoji reactions
- [x] Task 5: Create `hooks/usePrediction.ts` for prediction lock-in and result dialog state → Verify: Hook handles prediction locking and correct/incorrect evaluation

### Phase 5: Match Page UI Components (Completed)
- [x] Task 1: Build `MatchHeader.tsx` displaying live score, over, run rate, points, and streak badge → Verify: Renders premium scoreboard
- [x] Task 2: Build `BallTracker.tsx` displaying last 6 balls sequence → Verify: Renders colored delivery circles
- [x] Task 3: Build `PredictionPanel.tsx` with 6 interactive prediction buttons and animated result dialogs → Verify: Handles lock-in states and streak insights
- [x] Task 4: Build `LiveLeaderboard.tsx` displaying top fans and current user rank → Verify: Renders live leaderboard rankings
- [x] Task 5: Build `ReactionBar.tsx` with floating emoji burst animations → Verify: Sends and animates real-time emoji bursts
- [x] Task 6: Build `OverSummaryCard.tsx` displaying over stats and AI commentary → Verify: Renders dramatic commentary cards
- [x] Task 7: Build `PollCard.tsx` displaying active fan polls and live voting percentages → Verify: Handles voting and percentage updates
- [x] Task 8: Assemble all components in `components/match/MatchClient.tsx` and `app/match/[id]/page.tsx` → Verify: Full second-screen experience renders beautifully

### Phase 6: ChatGPT (OpenAI) AI Integration (Completed)
- [x] Task 1: Create `app/api/gemini/analysis/route.ts` powered by OpenAI `gpt-4o-mini` for dramatic over summaries → Verify: Route returns Harsha Bhogle style commentary
- [x] Task 2: Create `app/api/gemini/poll/route.ts` powered by OpenAI `gpt-4o-mini` for smart fan polls → Verify: Route returns structured JSON poll question and options
- [x] Task 3: Create `app/api/gemini/hint/route.ts` powered by OpenAI `gpt-4o-mini` for tactical prediction hints → Verify: Route returns contextual prediction hints

### Phase 7: Admin Broadcast Controller (Completed)
- [x] Task 1: Build `components/admin/AdminClient.tsx` and `app/admin/match/[id]/page.tsx` → Verify: Renders match status controls, advance ball simulator, and AI trigger buttons
- [x] Task 2: Wire Advance Ball Simulator to update `matches` and insert `deliveries` in Supabase → Verify: Instantly triggers fan view updates
- [x] Task 3: Wire AI Engine buttons to trigger ChatGPT endpoints and publish commentary/polls to Supabase → Verify: Instantly pushes AI cards to fan view

### Phase 8: Profile & PWA Integration (Completed)
- [x] Task 1: Build `app/profile/page.tsx` displaying user stats, accuracy, streak, and badges → Verify: Renders profile dashboard
- [x] Task 2: Create `public/manifest.json` with PWA standalone configuration → Verify: Manifest contains icons, colors, and display settings
- [x] Task 3: Add PWA meta tags and install prompt banner to `app/layout.tsx` and `MatchClient.tsx` → Verify: PWA install prompt is functional

### Phase 9: Polish, Performance, Optimistic UI & IPL Dummy Fallback (Completed)
- [x] Task 1: Implement optimistic state updates for prediction lock-in and poll voting to eliminate perceived network latency → Verify: UI responds instantly on tap
- [x] Task 2: Integrate Canvas Confetti (`canvas-confetti`) for correct prediction celebrations and milestone streaks → Verify: Confetti fires on correct predictions
- [x] Task 3: Add Web Audio API / Haptic Vibration feedback triggers on prediction lock-in and ball advance → Verify: Mobile devices provide haptic/audio feedback
- [x] Task 4: Add comprehensive error boundaries and loading skeleton states for all dynamic widgets → Verify: Clean fallback UI during network slowdowns
- [x] Task 5: Implement `DUMMY_MATCH_DATA` Fallback Mode featuring premium **IPL Matches (e.g., MI vs CSK at Wankhede Stadium)** in `useMatch`, `useDeliveries`, and `useLeaderboard` → Verify: App loads an immersive, high-stakes IPL rivalry demo match when no live match is found in Supabase

### Phase 10: Autonomous Live Match Simulator & Lobby Architecture (Completed)
- [x] Task 1: Create Pre-Match Lobby Screen in `MatchClient.tsx` removing all static/dummy match data when `status === 'upcoming'` → Verify: Renders a pristine pre-match lobby with a prominent "Start Live Match Simulator" action button
- [x] Task 2: Implement Autonomous Simulation Loop Hook (`useMatchSimulator.ts`) with a customizable 30-second interval timer and live countdown ticker → Verify: Countdown accurately ticks down from 30s to 0s
- [x] Task 3: Wire simulation loop to automatically generate and dispatch new delivery outcomes (dot, 4, 6, wicket, wide, single) every 30 seconds → Verify: Automatically advances over/ball and updates match score
- [x] Task 4: Synchronize all 6 core components (`MatchHeader`, `BallTracker`, `PredictionPanel`, `OverSummaryCard`, `PollCard`, `LiveLeaderboard`) to reactively update on simulated delivery events, including Guest Fan Pass username sync → Verify: Leaderboard ranks shift, AI commentary updates, ball tracker pushes outcomes, and prediction panel evaluates user choices with confetti/haptic/audio feedback

### Phase 11: Production Deployment & Live Demo Verification (Upcoming)
- [ ] Task 1: Verify Supabase Realtime WebSocket connection stability under simulated multi-tab load → Verify: No status disconnects during rapid ball advances
- [ ] Task 2: Prepare a 90-second end-to-end interactive demo script showcasing Fan View and Admin Controller side-by-side → Verify: Flawless execution from ball 1 to over completion
- [ ] Task 3: Perform final verification of Vercel deployment build and environment variable bindings → Verify: Production build passes `next build` without lint/type errors

## Done When
- [ ] Phase 10 and Phase 11 are fully implemented, tested side-by-side, and approved by the user.

