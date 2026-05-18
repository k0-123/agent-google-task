# Dynamic Components & UI/UX Enhancement Plan

## Goal
Make AI Commentary, Leaderboard, and Profile components fully dynamic, enhance the visual UI/UX aesthetics, add a custom "Click me" popup button explaining Vercel deployment, verify the production build, and push the changes to GitHub.

## Tasks
- [ ] Task 1: Update `useMatchSimulator.ts` to calculate and expose dynamic stats (runs, wickets, dots, economy, accuracy) for the current over and leaderboard players. → Verify: Check that `useMatchSimulator` returns these dynamic metrics correctly.
- [ ] Task 2: Update `OverSummaryCard.tsx` to accept dynamic props (runs, wickets, dots, economy) instead of hardcoded numbers, and enhance its UI cards with glassmorphism and glowing borders. → Verify: Check `OverSummaryCard` renders dynamic props and improved styles.
- [ ] Task 3: Update `LiveLeaderboard.tsx` to display real-time dynamic accuracy and prediction stats for each player, improving avatar containers and row hover aesthetics. → Verify: Check leaderboard displays accurate percentages and enhanced visuals.
- [ ] Task 4: Update `MatchClient.tsx` to pass dynamic over stats to `OverSummaryCard`, calculate dynamic accuracy/matches for "Your Profile", and improve profile UI/UX. → Verify: Profile tab shows real user accuracy and match counts.
- [ ] Task 5: Add "Click me" button below "START LIVE MATCH SIMULATOR" in `MatchClient.tsx` that triggers a premium modal popup with the exact Vercel explanation text. → Verify: Clicking the button opens the custom modal displaying the required text.
- [ ] Task 6: Update `app/page.tsx` landing page to replace default Next.js template with a premium CricketPulse hero landing experience and direct stadium CTA. → Verify: Root page looks premium and matches the app's rich aesthetic.
- [ ] Task 7: Run `npm run build` to verify there are no TypeScript, linting, or Next.js build errors. → Verify: Build completes successfully with 0 errors.
- [ ] Task 8: Commit and push all changes to the remote GitHub repository. → Verify: `git push` succeeds and changes are live on remote.

## Done When
- [ ] AI Commentary footer shows dynamic over stats.
- [ ] Live Leaderboard shows dynamic player accuracy and stats.
- [ ] Your Profile shows dynamic user accuracy and match counts.
- [ ] "Click me" button opens the Vercel explanation modal popup.
- [ ] UI/UX is polished with premium glassmorphic and glowing aesthetic.
- [ ] Production build succeeds and code is pushed to GitHub.
