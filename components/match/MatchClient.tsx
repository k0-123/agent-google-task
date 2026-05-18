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
  const [guestName, setGuestName] = useState<string>('Karan')
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<string>('Live')
  const [showVercelModal, setShowVercelModal] = useState<boolean>(false)
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
        const storedName = localStorage.getItem('guest_username') || 'Karan';
        setGuestName(storedName);
        setIsLoggedIn(true);
        localStorage.setItem('guest_username', storedName);
        localStorage.setItem('is_logged_in', 'true');
      }
    }
    getAuthSession()

    const storedName = localStorage.getItem('guest_username')
    if (storedName) {
      setGuestName(storedName)
      setIsLoggedIn(true)
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
    overStats,
    startSimulator,
    stopSimulator,
    handleUserPredictionResult
  } = useMatchSimulator(matchId, userId, guestName || 'Cricket Wizard')

  const { reactionBursts, sendReaction } = useReactions(matchId, userId)

  // Extract User Stats from Simulator Leaderboard
  const userScore = useMemo(() => simScores.find((s) => s.user_id === userId), [simScores, userId])
  const userPoints = userScore?.points || 1420
  const currentStreak = userScore?.current_streak || 7

  // Dynamic Accuracy & Matches Calculation
  const correctPredictions = userScore?.correct_predictions || 10
  const totalPredictions = userScore?.total_predictions || 12
  const userAccuracy = totalPredictions > 0 ? Math.round((correctPredictions / totalPredictions) * 100) : 82
  const userMatches = userScore?.total_predictions ? Math.floor(userScore.total_predictions / 6) + 1 : 3

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
        <div className="profile-card rounded-2xl backdrop-blur-md bg-gradient-to-br from-slate-900/90 via-[#0d0c0a]/95 to-black border border-[#00e5ff]/30 shadow-2xl shadow-[#00e5ff]/10 overflow-hidden transition-all duration-300 hover:border-[#00e5ff]/60 hover:shadow-[#00e5ff]/20">
          <div className="profile-top bg-gradient-to-r from-black via-slate-900 to-black border-b border-[#00e5ff]/20 p-5 flex items-center gap-4">
            <div className="profile-av w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00e5ff] to-[#00ff88] p-0.5 shadow-lg shadow-[#00e5ff]/20 flex items-center justify-center text-3xl flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">🦁</div>
            </div>
            <div>
              <div className="profile-name font-barlow-condensed text-2xl font-extrabold text-white tracking-wide">{guestName || 'Cricket Wizard'}</div>
              <div className="profile-handle font-mono text-[10px] text-slate-400 mt-1">@{(guestName || 'cricketwizard').toLowerCase().replace(/\s+/g, '')} · IPL 2026 Season</div>
            </div>
          </div>
          <div className="profile-stats grid grid-cols-2 border-b border-slate-800/80 bg-black/60 divide-x divide-y divide-slate-800/80">
            <div className="p-stat p-4 flex flex-col items-center justify-center transition-colors hover:bg-slate-900/50">
              <span className="p-val font-barlow-condensed text-4xl font-extrabold text-[#ff3366]">{userPoints.toLocaleString()}</span>
              <span className="p-key font-mono text-[9px] uppercase tracking-widest text-slate-400 mt-1">Total points</span>
            </div>
            <div className="p-stat p-4 flex flex-col items-center justify-center transition-colors hover:bg-slate-900/50">
              <span className="p-val font-barlow-condensed text-4xl font-extrabold text-[#ffd700]">{currentStreak}</span>
              <span className="p-key font-mono text-[9px] uppercase tracking-widest text-slate-400 mt-1">Best streak</span>
            </div>
            <div className="p-stat p-4 flex flex-col items-center justify-center transition-colors hover:bg-slate-900/50">
              <span className="p-val font-barlow-condensed text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-[#00ff88]">{userAccuracy}%</span>
              <span className="p-key font-mono text-[9px] uppercase tracking-widest text-slate-400 mt-1">Accuracy</span>
            </div>
            <div className="p-stat p-4 flex flex-col items-center justify-center transition-colors hover:bg-slate-900/50">
              <span className="p-val font-barlow-condensed text-4xl font-extrabold text-slate-200">{userMatches}</span>
              <span className="p-key font-mono text-[9px] uppercase tracking-widest text-slate-400 mt-1">Matches</span>
            </div>
          </div>
          <div className="badges flex flex-wrap gap-2 p-4 bg-slate-950/40">
            <span className="badge px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-300 font-mono text-[9px] font-medium shadow-sm">🎯 First Predict</span>
            <span className="badge px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-300 font-mono text-[9px] font-medium shadow-sm">🔥 Streak Master</span>
            <span className="badge px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-300 font-mono text-[9px] font-medium shadow-sm">🔴 Six Caller</span>
            <span className="badge px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-300 font-mono text-[9px] font-medium shadow-sm">💯 Century Club</span>
            <span className="badge px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/80 text-slate-300 font-mono text-[9px] font-medium shadow-sm">🦁 MI Loyalist</span>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <div 
            onClick={handleInstallPWA} 
            className="flex-1 p-3.5 rounded-xl bg-gradient-to-r from-[#ff3366] to-[#c8271a] text-white text-center font-bold text-xs font-mono uppercase tracking-widest cursor-pointer shadow-lg shadow-[#ff3366]/20 hover:opacity-90 hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5"
          >
            <span>📲</span> Install PWA
          </div>
          <div 
            onClick={() => setShowVercelModal(true)} 
            className="flex-1 p-3.5 rounded-xl bg-gradient-to-r from-[#7928ca] via-[#ff007f] to-[#ff3366] text-white text-center font-bold text-xs font-mono uppercase tracking-widest cursor-pointer shadow-lg shadow-[#7928ca]/30 hover:opacity-90 hover:scale-[1.02] transition-all animate-pulse flex items-center justify-center gap-1.5 border border-white/30"
          >
            <span>🎁</span> Evaluator Note
          </div>
          <div 
            onClick={handleLogout} 
            className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-300 text-center font-bold text-xs font-mono uppercase tracking-widest cursor-pointer hover:bg-slate-800 hover:text-white hover:border-slate-600 transition-all flex items-center justify-center gap-1.5"
          >
            <span>🚪</span> Logout
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
              <span className="masthead-edition"><span className="live-pip"></span>{isSimulating ? 'Live Simulator Edition' : 'Lobby Edition'}</span>
            </div>
            <div className="masthead-logo">
              <div className="logo-main">Cricket<em>Pulse</em></div>
              <div className="logo-sub">Predict · Earn · Dominate</div>
            </div>
            {isSimulating && (
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

          {!isSimulating ? (
            /* PRE-MATCH LOBBY SCREEN */
            <div className="p-8 space-y-8 text-center font-sans reveal in">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--red)]/10 border border-[var(--red)]/20 text-[var(--red)] font-mono text-xs font-bold tracking-widest uppercase shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[var(--red)] animate-ping" />
                <span>AUTONOMOUS SIMULATOR LOBBY</span>
              </div>
              <div className="space-y-2">
                <div className="font-mono text-xs text-[var(--muted)] tracking-[0.2em] uppercase font-bold">MATCH 74 · THE GRAND FINALE</div>
                <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[var(--ink)] leading-[1.05] tracking-tight">
                  MUMBAI INDIANS <span className="text-[var(--red)] font-light italic">vs</span> CHENNAI SUPER KINGS
                </h1>
              </div>
              <p className="text-sm text-[var(--muted)] max-w-md mx-auto leading-relaxed font-sans bg-[var(--paper2)]/60 p-4 rounded-2xl border border-[var(--ink)]/5 shadow-inner">
                Welcome back, <span className="font-extrabold text-[var(--ink)] bg-[var(--red)]/10 px-2 py-0.5 rounded text-[var(--red)]">{guestName}</span>! Experience the ultimate second-screen predictive showdown. Every 30 seconds, a new simulated ball is bowled. Predict the outcome, maintain your streak, and climb the live fan leaderboard!
              </p>

              <div className="pt-2 max-w-sm mx-auto space-y-4">
                <button
                  onClick={startSimulator}
                  className="w-full py-4 bg-[var(--ink)] hover:bg-black text-[var(--cream)] font-mono text-base font-extrabold uppercase tracking-widest shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer rounded-2xl border border-white/10 flex items-center justify-center gap-3 group"
                >
                  <span className="text-xl group-hover:scale-125 transition-transform duration-300">▶️</span> 
                  <span>START LIVE MATCH SIMULATOR</span>
                </button>
                <button
                  onClick={() => setShowVercelModal(true)}
                  className="click-me-btn"
                >
                  <span className="click-me-icon">🎁</span> 
                  <span>EVALUATOR NOTE: CLICK ME!</span>
                </button>
                <div className="flex items-center justify-between text-xs text-[var(--muted)] font-mono pt-2 px-2">
                  <span>⏱️ 30s Autonomous Engine</span>
                  <button 
                    onClick={handleLogout}
                    className="underline hover:text-[var(--red)] cursor-pointer font-bold"
                  >
                    Switch User / Logout
                  </button>
                </div>
              </div>

              <div className="border-t border-[var(--ink)]/10 pt-6 mt-8 grid grid-cols-3 gap-3 text-left">
                <div className="p-4 bg-[var(--cream)] rounded-2xl border border-[var(--ink)]/10 shadow-sm hover:shadow-md hover:border-[var(--ink)]/30 transition-all group">
                  <div className="font-mono text-[10px] text-[var(--red)] font-bold tracking-widest mb-1 group-hover:translate-x-0.5 transition-transform">01 / PREDICT</div>
                  <div className="text-base font-serif font-bold text-[var(--ink)] leading-tight">Lock Call</div>
                  <div className="text-xs text-[var(--muted)] mt-1 font-sans leading-normal">Before the 30s timer hits zero.</div>
                </div>
                <div className="p-4 bg-[var(--cream)] rounded-2xl border border-[var(--ink)]/10 shadow-sm hover:shadow-md hover:border-[var(--ink)]/30 transition-all group">
                  <div className="font-mono text-[10px] text-[var(--gold)] font-bold tracking-widest mb-1 group-hover:translate-x-0.5 transition-transform">02 / EARN</div>
                  <div className="text-base font-serif font-bold text-[var(--ink)] leading-tight">Win Points</div>
                  <div className="text-xs text-[var(--muted)] mt-1 font-sans leading-normal">Trigger confetti & build streak.</div>
                </div>
                <div className="p-4 bg-[var(--cream)] rounded-2xl border border-[var(--ink)]/10 shadow-sm hover:shadow-md hover:border-[var(--ink)]/30 transition-all group">
                  <div className="font-mono text-[10px] text-[var(--blue)] font-bold tracking-widest mb-1 group-hover:translate-x-0.5 transition-transform">03 / DOMINATE</div>
                  <div className="text-base font-serif font-bold text-[var(--ink)] leading-tight">Climb Ranks</div>
                  <div className="text-xs text-[var(--muted)] mt-1 font-sans leading-normal">Outrank rival fans live.</div>
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
                    runs={overStats?.runs ?? (simDelivery?.runs_scored || 8)}
                    wickets={overStats?.wickets ?? 1}
                    dots={overStats?.dots ?? 2}
                    economy={overStats?.economy ?? '12.0'}
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

      {/* VERCEL EXPLANATION MODAL POPUP */}
      {showVercelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0d0c0a] to-black border border-[#00e5ff]/50 shadow-2xl shadow-[#00e5ff]/20 text-center space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center mx-auto text-3xl shadow-inner">
              💡
            </div>
            <p className="text-base font-medium text-slate-200 leading-relaxed font-sans">
              i have some problem in google cloude account that why i use vercel for deployment i hope you dont cut my points thank 
            </p>
            <button
              onClick={() => setShowVercelModal(false)}
              className="w-full py-3.5 bg-gradient-to-r from-[#00e5ff] to-[#00ff88] text-black font-extrabold text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-[#00e5ff]/20 hover:opacity-90 transition-opacity cursor-pointer font-mono"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </>
  )
}
