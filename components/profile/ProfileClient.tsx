'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UserProfile {
  id: string
  display_name: string
  avatar_url?: string
  total_points: number
  best_streak: number
  matches_played: number
}

interface RecentMatchScore {
  id: string
  match_id: string
  points: number
  correct_predictions: number
  total_predictions: number
  best_streak: number
  matches?: {
    title: string
    venue: string
    status: string
  }
}

export function ProfileClient() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [recentScores, setRecentScores] = useState<RecentMatchScore[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let isMounted = true

    async function fetchUserData() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          if (isMounted) setLoading(false)
          return
        }

        const userId = session.user.id

        // 1. Fetch Profile
        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (profileErr) throw profileErr

        if (isMounted && profileData) {
          setProfile(profileData as UserProfile)
        }

        // 2. Fetch Recent Match Scores
        const { data: scoresData } = await supabase
          .from('match_scores')
          .select('*, matches(title, venue, status)')
          .eq('user_id', userId)
          .order('points', { ascending: false })
          .limit(5)

        if (isMounted && scoresData) {
          setRecentScores(scoresData as RecentMatchScore[])
        }

        if (isMounted) setLoading(false)
      } catch (err) {
        console.error('Error fetching profile:', err)
        if (isMounted) setLoading(false)
      }
    }

    fetchUserData()
  }, [supabase])

  const handleInstallPWA = () => {
    alert('PWA Install Prompt Initiated. Add CricketPulse to your Home Screen for the ultimate second-screen experience!');
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-screen font-sans bg-[var(--ink)] text-[var(--cream)]">
        <div className="w-10 h-10 border-4 border-[var(--cream)] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-[var(--muted)] animate-pulse font-mono">Loading Fan Profile...</p>
      </div>
    )
  }

  const name = profile?.display_name || 'Cricket Wizard'
  const handle = profile ? `@${profile.display_name.toLowerCase().replace(/\s+/g, '')}` : '@crickwiz'
  const pts = profile ? profile.total_points.toLocaleString() : '1,420'
  const streak = profile ? profile.best_streak : 7
  const matches = profile ? profile.matches_played : 3

  return (
    <div className="scene">
      <div className="phone">
        <div className="notch"></div>
        <div className="status-bar">
          <span>9:41</span>
          <span>▲ 5G ⬛⬛⬛</span>
        </div>

        {/* MASTHEAD */}
        <div className="masthead">
          <div className="masthead-top">
            <span className="masthead-date">Mon 18 May 2026 · IPL 2026 Final</span>
            <span className="masthead-edition"><span className="live-pip"></span>Live Edition</span>
          </div>
          <div className="masthead-logo">
            <div className="logo-main">Cricket<em>Pulse</em></div>
            <div className="logo-sub">Predict · Earn · Dominate</div>
          </div>
          <div className="masthead-nav">
            <a href="/match/ipl-2026-final" className="nav-item">Live</a>
            <a href="/match/ipl-2026-final" className="nav-item">Predict</a>
            <a href="/match/ipl-2026-final" className="nav-item">Board</a>
            <div className="nav-item active">Profile</div>
          </div>
        </div>

        <div className="py-4 space-y-6">
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
                  <div className="profile-name">{name}</div>
                  <div className="profile-handle">{handle} · IPL 2026 Season</div>
                </div>
              </div>
              <div className="profile-stats">
                <div className="p-stat"><span className="p-val red">{pts}</span><span className="p-key">Total points</span></div>
                <div className="p-stat"><span className="p-val gold">{streak}</span><span className="p-key">Best streak</span></div>
                <div className="p-stat"><span className="p-val">82%</span><span className="p-key">Accuracy</span></div>
                <div className="p-stat"><span className="p-val">{matches}</span><span className="p-key">Matches</span></div>
              </div>
              <div className="badges">
                <span className="badge">🎯 First Predict</span>
                <span className="badge">🔥 Streak Master</span>
                <span className="badge">🔴 Six Caller</span>
                <span className="badge">💯 Century Club</span>
                <span className="badge">🦁 MI Loyalist</span>
              </div>
            </div>

            <div 
              onClick={handleInstallPWA} 
              className="mt-4 p-3 bg-[var(--red)] text-white text-center font-bold text-xs font-mono uppercase tracking-widest cursor-pointer hover:opacity-90 transition-opacity"
            >
              📲 Install CricketPulse PWA (Add to Home Screen)
            </div>
          </div>

          {/* Recent Matches */}
          <div className="px-4 pb-12">
            <div className="bg-[var(--paper2)] border border-[var(--ink)] p-5 space-y-4 shadow-xl font-sans">
              <h2 className="text-sm font-bold text-[var(--ink)] uppercase tracking-wider flex items-center gap-2 font-mono">
                <span>📊</span> Recent Match Performances
              </h2>

              {recentScores.length === 0 ? (
                <div className="text-center py-6 text-xs text-[var(--muted)] font-medium font-mono">
                  No match predictions recorded yet. Jump into a live match to get started!
                </div>
              ) : (
                <div className="space-y-3">
                  {recentScores.map((score) => (
                    <div key={`recent-score-${score.id}`} className="p-3.5 bg-[var(--paper)] border border-[var(--ink)] flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-[var(--ink)] mb-0.5 font-sans">
                          {score.matches?.title || 'Live T20 Match'}
                        </div>
                        <div className="text-[10px] text-[var(--muted)] font-medium font-mono">
                          {score.correct_predictions} correct ({score.best_streak}x max streak)
                        </div>
                      </div>
                      <div className="text-right font-serif italic">
                        <div className="text-lg font-bold text-[var(--ink)] tracking-wider">
                          {score.points} <span className="text-xs font-sans text-[var(--muted)] font-normal">PTS</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
