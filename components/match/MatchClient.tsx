'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useMatchSimulator } from '@/hooks/useMatchSimulator'
import { useReactions } from '@/hooks/useReactions'
import { usePrediction, playAudioChime } from '@/hooks/usePrediction'
import { MatchHeader } from './MatchHeader'
import { BallTracker } from './BallTracker'
import { PredictionPanel } from './PredictionPanel'
import { LiveLeaderboard } from './LiveLeaderboard'
import { ReactionBar } from './ReactionBar'
import { OverSummaryCard } from './OverSummaryCard'
import { PollCard } from './PollCard'
import type { Poll } from '@/lib/types'

interface MatchClientProps {
  matchId: string
}

export function MatchClient({ matchId }: MatchClientProps) {
  const [userId, setUserId] = useState<string | undefined>(undefined)
  const [guestName, setGuestName] = useState<string>('')
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>('Live')
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    async function getAuthSession() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUserId(session.user.id)
        if (session.user.user_metadata?.display_name) {
          setGuestName(session.user.user_metadata.display_name)
          setIsLoggedIn(true)
        }
      } else {
        const guestId = localStorage.getItem('guest_user_id') || 'guest_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('guest_user_id', guestId);
        setUserId(guestId);
      }
    }
    getAuthSession()

    const storedName = localStorage.getItem('guest_username')
    const storedLoggedIn = localStorage.getItem('is_logged_in')
    if (storedName) {
      setGuestName(storedName)
      if (storedLoggedIn === 'true') {
        setIsLoggedIn(true)
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.id) {
        setUserId(session.user.id)
        if (session.user.user_metadata?.display_name) {
          setGuestName(session.user.user_metadata.display_name)
          setIsLoggedIn(true)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  // Autonomous Simulator Hooks
  const {
    isSimulating,
    simulationSpeed,
    secondsRemaining,
    match: simMatch,
    latestDelivery: simDelivery,
    commentary: simCommentary,
    poll: simPoll,
    scores: simScores,
    userRank: simUserRank,
    startSimulator,
    stopSimulator,
    handleUserPredictionResult
  } = useMatchSimulator(matchId, userId, guestName || 'Cricket Wizard')

  const { reactionBursts, sendReaction } = useReactions(matchId, userId)

  // Extract User Stats from Simulator Leaderboard
  const userScore = useMemo(() => simScores.find((s) => s.user_id === userId), [simScores, userId])
  const userPoints = userScore?.points || 1420
  const currentStreak = userScore?.current_streak || 7

  const { lockPrediction, currentPrediction, isLocked, lastResult } = usePrediction(
    matchId,
    userId,
    currentStreak,
    simDelivery,
    handleUserPredictionResult
  )

  // Poll Voting State
  const [userVote, setUserVote] = useState<number | null>(null)
  const [voteCounts, setVoteCounts] = useState<Record<number, number>>({ 0: 42, 1: 18, 2: 12 })

  const handleVote = async (optionIndex: number) => {
    if (!simPoll || !userId || userVote !== null) return

    // Optimistic UI update & sensory feedback
    setUserVote(optionIndex)
    setVoteCounts((prev) => ({ ...prev, [optionIndex]: (prev[optionIndex] || 0) + 1 }))

    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(40)
    }
    playAudioChime('lock')
  }

  const handleInstallPWA = () => {
    alert('PWA Install Prompt Initiated. Add CricketPulse to your Home Screen for the ultimate second-screen experience!')
  }

  const handleLogout = () => {
    localStorage.removeItem('is_logged_in')
    setIsLoggedIn(false)
  }

  const renderProfileCard = () => (
    <>
      <div className="sec-head reveal-fast in">
        <span className="sec-num">06</span>
        <span className="sec-line"></span>
        <span className="sec-title">Your Profile</span>
      </div>
      <div className="profile-wrap reveal in">
        <div className="profile-card">
          <div className="profile-top">
            <div className="profile-av">🦁</div>
            <div>
              <div className="profile-name">{guestName || 'Cricket Wizard'}</div>
              <div className="profile-handle">@{(guestName || 'cricketwizard').toLowerCase().replace(/\s+/g, '')} · IPL 2026 Season</div>
            </div>
          </div>
          <div className="profile-stats">
            <div className="p-stat"><span className="p-val red">{userPoints.toLocaleString()}</span><span className="p-key">Total points</span></div>
            <div className="p-stat"><span className="p-val gold">{currentStreak}</span><span className="p-key">Best streak</span></div>
            <div className="p-stat"><span className="p-val">82%</span><span className="p-key">Accuracy</span></div>
            <div className="p-stat"><span className="p-val">3</span><span className="p-key">Matches</span></div>
          </div>
          <div className="badges">
            <span className="badge">🎯 First Predict</span>
            <span className="badge">🔥 Streak Master</span>
            <span className="badge">🔴 Six Caller</span>
            <span className="badge">💯 Century Club</span>
            <span className="badge">🦁 MI Loyalist</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <div 
            onClick={handleInstallPWA} 
            className="flex-1 p-3 bg-[var(--red)] text-white text-center font-bold text-xs font-mono uppercase tracking-widest cursor-pointer hover:opacity-90 transition-opacity"
          >
            📲 Install PWA
          </div>
          <div 
            onClick={handleLogout} 
            className="p-3 bg-[var(--paper2)] border border-[var(--ink)] text-[var(--ink)] text-center font-bold text-xs font-mono uppercase tracking-widest cursor-pointer hover:bg-[var(--ink)] hover:text-[var(--cream)] transition-all"
          >
            🚪 Logout
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* TICKER */}
      <div className="ticker-wrap">
        <div className="ticker-inner" id="tickerInner">
          <span className="ticker-item">🏏 LIVE: {simMatch.team_a_short || 'MI'} {simMatch.score_a || '180/2'} ({simMatch.current_over}.{simMatch.current_ball}) vs {simMatch.team_b_short || 'CSK'} · RRR: 16.2 · 38 needed off 12 balls</span>
          <span className="ticker-item">🔥 Bumrah bowling death over · 42% probability of yorker</span>
          <span className="ticker-item">🏆 Leaderboard Top: Vikram Sharma (2,450 pts)</span>
          <span className="ticker-item">📊 Fan Poll: 68% believe Dhoni will finish the match</span>
          <span className="ticker-item">⚡ Predict next ball & win 30 pts</span>
        </div>
      </div>

      <div className="wrapper">
        <div className="phone">

          {/* MASTHEAD */}
          <div className="masthead">
            <div className="masthead-top">
              <span className="masthead-date">Mon 18 May 2026 · IPL 2026 Final</span>
              <span className="masthead-edition"><span className="live-pip"></span>{isSimulating ? 'Live Simulator Edition' : !isLoggedIn ? 'Fan Access' : 'Lobby Edition'}</span>
            </div>
            <div className="masthead-logo">
              <div className="logo-main">Cricket<em>Pulse</em></div>
              <div className="logo-sub">Predict · Earn · Dominate</div>
            </div>
            {isSimulating && isLoggedIn && (
              <div className="masthead-nav">
                {['Live', 'Predict', 'Board', 'Profile'].map((tab) => (
                  <div 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={`nav-item ${activeTab === tab ? 'active' : ''}`}
                  >
                    {tab}
                  </div>
                ))}
              </div>
            )}
          </div>

          {!isLoggedIn ? (
            /* DEDICATED GUEST LOGIN SCREEN */
            <div className="p-8 space-y-8 text-center font-sans flex flex-col items-center justify-center min-h-[65vh]">
              <div className="inline-block px-3 py-1 bg-[var(--red)]/10 text-[var(--red)] border border-[var(--red)]/20 text-xs font-mono uppercase tracking-widest font-bold">
                🏏 CRICKETPULSE FAN ACCESS
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-serif font-bold text-[var(--ink)] italic leading-tight">
                  ENTER THE ARENA
                </h1>
                <p className="text-sm text-[var(--muted)] max-w-xs mx-auto leading-relaxed font-sans">
                  No passwords, no complex signups. Enter your fan username to join the live predictive leaderboard.
                </p>
              </div>

              <div className="w-full max-w-xs p-6 bg-[var(--paper2)] border-2 border-[var(--ink)] text-left space-y-4 shadow-xl">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest font-bold text-[var(--ink)] mb-2 flex items-center gap-2">
                    <span>🏷️</span> CHOOSE USERNAME
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Karan"
                    className="w-full px-4 py-3 bg-[var(--paper)] border-2 border-[var(--ink)] text-base font-bold text-[var(--ink)] focus:outline-none focus:border-[var(--red)] transition-colors font-sans"
                  />
                </div>

                <button
                  onClick={() => {
                    if (!guestName.trim()) {
                      alert('Please enter a valid username')
                      return
                    }
                    localStorage.setItem('guest_username', guestName.trim())
                    localStorage.setItem('is_logged_in', 'true')
                    setIsLoggedIn(true)
                  }}
                  className="w-full py-4 bg-[var(--ink)] text-[var(--cream)] font-mono text-sm font-bold uppercase tracking-widest shadow-lg hover:bg-[var(--ink)]/90 transition-all cursor-pointer border-2 border-[var(--ink)] flex items-center justify-center gap-2"
                >
                  <span>⚡</span> LOG IN AS GUEST
                </button>
              </div>

              <div className="text-xs text-[var(--muted)] font-mono max-w-xs mx-auto leading-normal">
                🔒 Your session is securely stored locally and synced with the live simulation engine.
              </div>
            </div>
          ) : !isSimulating ? (
            /* PRE-MATCH LOBBY SCREEN */
            <div className="p-8 space-y-8 text-center font-sans">
              <div className="inline-block px-3 py-1 bg-[var(--red)]/10 text-[var(--red)] border border-[var(--red)]/20 text-xs font-mono uppercase tracking-widest font-bold">
                ⚡ AUTONOMOUS SIMULATOR LOBBY
              </div>
              <h1 className="text-4xl font-serif font-bold text-[var(--ink)] italic leading-tight">
                IPL 2026 FINAL: MUMBAI INDIANS VS CHENNAI SUPER KINGS
              </h1>
              <p className="text-sm text-[var(--muted)] max-w-md mx-auto leading-relaxed font-sans">
                Welcome back, <span className="font-bold text-[var(--ink)]">{guestName}</span>! Experience the ultimate second-screen predictive showdown. Every 30 seconds, a new simulated ball is bowled. Predict the outcome, maintain your streak, and climb the live fan leaderboard!
              </p>

              <div className="pt-4 max-w-sm mx-auto space-y-3">
                <button
                  onClick={startSimulator}
                  className="w-full py-5 bg-[var(--ink)] text-[var(--cream)] font-mono text-base font-bold uppercase tracking-widest shadow-xl hover:bg-[var(--ink)]/90 transition-all cursor-pointer border-2 border-[var(--ink)] flex items-center justify-center gap-3"
                >
                  <span className="text-xl">▶️</span> START LIVE MATCH SIMULATOR
                </button>
                <div className="flex items-center justify-between text-xs text-[var(--muted)] font-mono pt-2 px-1">
                  <span>⏱️ 30s Autonomous Engine</span>
                  <button 
                    onClick={handleLogout}
                    className="underline hover:text-[var(--red)] cursor-pointer"
                  >
                    Switch User / Logout
                  </button>
                </div>
              </div>

              <div className="border-t border-[var(--ink)]/10 pt-6 mt-8 grid grid-cols-3 gap-4 text-left">
                <div className="p-4 bg-[var(--paper2)] border border-[var(--ink)]/10">
                  <div className="text-lg font-bold font-serif text-[var(--ink)]">01. PREDICT</div>
                  <div className="text-xs text-[var(--muted)] mt-1 font-sans">Lock your call before the 30s timer hits zero.</div>
                </div>
                <div className="p-4 bg-[var(--paper2)] border border-[var(--ink)]/10">
                  <div className="text-lg font-bold font-serif text-[var(--ink)]">02. EARN</div>
                  <div className="text-xs text-[var(--muted)] mt-1 font-sans">Win points, trigger confetti, and build your streak.</div>
                </div>
                <div className="p-4 bg-[var(--paper2)] border border-[var(--ink)]/10">
                  <div className="text-lg font-bold font-serif text-[var(--ink)]">03. DOMINATE</div>
                  <div className="text-xs text-[var(--muted)] mt-1 font-sans">Outrank rival fans on the real-time leaderboard.</div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'Live' && (
                <>
                  {/* HERO SCOREBOARD */}
                  <MatchHeader 
                    match={simMatch} 
                    points={userPoints} 
                    streak={currentStreak} 
                    rank={simUserRank} 
                  />

                  {/* BALL SEQUENCE */}
                  <BallTracker 
                    last6={simMatch.last_6 || []} 
                    currentOver={simMatch.current_over} 
                    secondsRemaining={secondsRemaining}
                  />

                  {/* PREDICT */}
                  <PredictionPanel 
                    onPredict={lockPrediction} 
                    currentPrediction={currentPrediction} 
                    isLocked={isLocked} 
                    lastResult={lastResult} 
                    secondsRemaining={secondsRemaining}
                  />

                  {/* AI COMMENTARY */}
                  <OverSummaryCard 
                    overNumber={simMatch.current_over} 
                    runs={simDelivery?.runs_scored || 8} 
                    commentary={simCommentary} 
                  />

                  {/* POLL */}
                  <PollCard 
                    poll={simPoll} 
                    userVote={userVote} 
                    onVote={handleVote} 
                    voteCounts={voteCounts} 
                  />

                  {/* LEADERBOARD */}
                  <LiveLeaderboard 
                    scores={simScores} 
                    currentUserId={userId} 
                  />

                  {/* REACTIONS */}
                  <ReactionBar onSend={sendReaction} bursts={reactionBursts} />

                  {/* PROFILE */}
                  {renderProfileCard()}
                </>
              )}

              {activeTab === 'Predict' && (
                <div className="py-4 space-y-6">
                  <PredictionPanel 
                    onPredict={lockPrediction} 
                    currentPrediction={currentPrediction} 
                    isLocked={isLocked} 
                    lastResult={lastResult} 
                    secondsRemaining={secondsRemaining}
                  />
                </div>
              )}

              {activeTab === 'Board' && (
                <div className="py-4 space-y-6">
                  <LiveLeaderboard 
                    scores={simScores} 
                    currentUserId={userId} 
                  />
                </div>
              )}

              {activeTab === 'Profile' && (
                <div className="py-4 space-y-6">
                  {renderProfileCard()}
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </>
  )
}
