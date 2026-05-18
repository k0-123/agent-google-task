'use client'

import React from 'react'
import type { MatchScore } from '@/lib/types'

interface LiveLeaderboardProps {
  scores: MatchScore[]
  currentUserId?: string
}

const DEFAULT_LEADERBOARD = [
  { id: '1', name: 'You', avatar: '🦁', streak: '🔥 7 streak · 82% acc', pts: '1,420', rank: '👑', rankClass: 'rank-1', isMe: true },
  { id: '2', name: 'RohitFan99', avatar: '🐯', streak: '⚡ 5 streak · 74%', pts: '1,280', rank: '2', rankClass: 'rank-2', isMe: false },
  { id: '3', name: 'CSKtillDeath', avatar: '🦅', streak: '✨ 3 streak · 68%', pts: '1,140', rank: '3', rankClass: 'rank-3', isMe: false },
  { id: '4', name: 'ViratArmy007', avatar: '🏏', streak: '— · 61%', pts: '990', rank: '4', rankClass: 'rank-n', isMe: false },
  { id: '5', name: 'BumrahBhai', avatar: '⚡', streak: '— · 55%', pts: '870', rank: '5', rankClass: 'rank-n', isMe: false },
]

export function LiveLeaderboard({ scores = [], currentUserId }: LiveLeaderboardProps) {
  const hasValidScores = scores && scores.length > 0
  const topList = hasValidScores ? scores.slice(0, 5) : DEFAULT_LEADERBOARD

  return (
    <>
      <div className="sec-head reveal-fast in">
        <span className="sec-num">04</span>
        <span className="sec-line"></span>
        <span className="sec-title">Leaderboard</span>
      </div>

      <div className="lb-wrap reveal in">
        <div className="lb-head-row grid grid-cols-[28px_42px_1fr_68px] gap-3 items-center pb-3 border-b border-slate-800/80 mb-3 px-2">
          <span className="lb-col-label font-mono text-[9px] uppercase tracking-widest text-slate-400 text-center">#</span>
          <span className="lb-col-label"></span>
          <span className="lb-col-label font-mono text-[9px] uppercase tracking-widest text-slate-400">Player</span>
          <span className="lb-col-label font-mono text-[9px] uppercase tracking-widest text-slate-400 text-right">Pts</span>
        </div>

        <div className="space-y-2">
          {!hasValidScores ? (
            DEFAULT_LEADERBOARD.map((item) => (
              <div 
                key={`default-lb-${item.id}`} 
                className={`grid grid-cols-[28px_42px_1fr_68px] gap-3 items-center py-2.5 px-2 rounded-xl transition-all duration-200 border border-transparent hover:bg-slate-900/60 hover:border-[#00e5ff]/20 hover:scale-[1.01] ${
                  item.isMe ? 'bg-gradient-to-r from-[#ff3366]/10 via-slate-900/50 to-transparent border-[#ff3366]/30 shadow-lg shadow-[#ff3366]/5' : ''
                }`}
              >
                <div className={`lb-rank font-barlow-condensed text-xl font-extrabold text-center ${item.rankClass}`}>{item.rank}</div>
                <div className="lb-av w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700/80 flex items-center justify-center text-lg shadow-inner">{item.avatar}</div>
                <div>
                  <div className="lb-info-name font-barlow-condensed text-lg font-extrabold text-white tracking-wide">{item.name}</div>
                  <div className="lb-info-streak font-mono text-[10px] text-slate-400 mt-0.5">{item.streak}</div>
                </div>
                <div className="text-right">
                  <div className="lb-pts-num font-barlow-condensed text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-[#00ff88]">{item.pts}</div>
                  <div className="lb-pts-lbl font-mono text-[8px] uppercase tracking-widest text-slate-500">pts</div>
                </div>
              </div>
            ))
          ) : (
            topList.map((score: any, index) => {
              const isCurrentUser = score.user_id === currentUserId
              const rankNum = index + 1
              let rankStr: string = rankNum.toString()
              let rankClass = 'text-slate-400 font-semibold text-base'
              
              if (rankNum === 1) { rankStr = '👑'; rankClass = 'text-[#ffd700] text-xl drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]'; }
              else if (rankNum === 2) { rankClass = 'text-slate-300 text-lg'; }
              else if (rankNum === 3) { rankClass = 'text-[#cd7f32] text-lg'; }

              const avatar = rankNum === 1 ? '🦁' : rankNum === 2 ? '🐯' : rankNum === 3 ? '🦅' : '🏏'
              
              // Dynamic Accuracy Calculation
              const correct = score.correct_predictions || 10
              const total = score.total_predictions || 12
              const accuracy = total > 0 ? Math.round((correct / total) * 100) : 82

              return (
                <div
                  key={`leaderboard-${score.user_id}`}
                  className={`grid grid-cols-[28px_42px_1fr_68px] gap-3 items-center py-2.5 px-2 rounded-xl transition-all duration-200 border border-transparent hover:bg-slate-900/60 hover:border-[#00e5ff]/20 hover:scale-[1.01] ${
                    isCurrentUser ? 'bg-gradient-to-r from-[#00e5ff]/15 via-slate-900/80 to-transparent border-[#00e5ff]/40 shadow-lg shadow-[#00e5ff]/10' : ''
                  }`}
                >
                  <div className={`lb-rank font-barlow-condensed font-extrabold text-center ${rankClass}`}>{rankStr}</div>
                  <div className="lb-av w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700/80 flex items-center justify-center text-lg shadow-inner">{avatar}</div>
                  <div>
                    <div className="lb-info-name font-barlow-condensed text-lg font-extrabold text-white tracking-wide flex items-center gap-1.5">
                      <span>{score.profiles?.display_name || 'Fan'}</span>
                      {isCurrentUser && (
                        <span className="px-1.5 py-0.5 rounded bg-[#00e5ff]/20 border border-[#00e5ff]/40 text-[#00e5ff] font-mono text-[9px] uppercase tracking-widest">You</span>
                      )}
                    </div>
                    <div className="lb-info-streak font-mono text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>🔥 {score.current_streak || 0} streak</span>
                      <span>·</span>
                      <span className="text-[#00ff88] font-semibold">{accuracy}% acc</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="lb-pts-num font-barlow-condensed text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-[#00ff88]">{score.points.toLocaleString()}</div>
                    <div className="lb-pts-lbl font-mono text-[8px] uppercase tracking-widest text-slate-500">pts</div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
