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
        <div className="lb-head-row">
          <span className="lb-col-label">#</span>
          <span className="lb-col-label"></span>
          <span className="lb-col-label">Player</span>
          <span className="lb-col-label" style={{ textAlign: 'right' }}>Pts</span>
        </div>

        {!hasValidScores ? (
          DEFAULT_LEADERBOARD.map((item) => (
            <div key={`default-lb-${item.id}`} className={`lb-row ${item.isMe ? 'me' : ''}`}>
              <div className={`lb-rank ${item.rankClass}`}>{item.rank}</div>
              <div className="lb-av">{item.avatar}</div>
              <div>
                <div className="lb-info-name">{item.name}</div>
                <div className="lb-info-streak">{item.streak}</div>
              </div>
              <div>
                <div className="lb-pts-num">{item.pts}</div>
                <div className="lb-pts-lbl">pts</div>
              </div>
            </div>
          ))
        ) : (
          topList.map((score: any, index) => {
            const isCurrentUser = score.user_id === currentUserId
            const rankNum = index + 1
            let rankStr: string = rankNum.toString()
            let rankClass = 'rank-n'
            
            if (rankNum === 1) { rankStr = '👑'; rankClass = 'rank-1'; }
            else if (rankNum === 2) { rankClass = 'rank-2'; }
            else if (rankNum === 3) { rankClass = 'rank-3'; }

            const avatar = rankNum === 1 ? '🦁' : rankNum === 2 ? '🐯' : rankNum === 3 ? '🦅' : '🏏'

            return (
              <div
                key={`leaderboard-${score.user_id}`}
                className={`lb-row ${isCurrentUser ? 'me' : ''}`}
              >
                <div className={`lb-rank ${rankClass}`}>{rankStr}</div>
                <div className="lb-av">{avatar}</div>
                <div>
                  <div className="lb-info-name">
                    {score.profiles?.display_name || 'Fan'} {isCurrentUser ? '(You)' : ''}
                  </div>
                  <div className="lb-info-streak">
                    🔥 {score.current_streak || 0} streak · {score.best_streak || 0} max
                  </div>
                </div>
                <div>
                  <div className="lb-pts-num">{score.points.toLocaleString()}</div>
                  <div className="lb-pts-lbl">pts</div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
