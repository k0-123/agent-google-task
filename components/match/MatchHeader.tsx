'use client'

import React from 'react'
import type { Match } from '@/lib/types'

interface MatchHeaderProps {
  match: Match
  points: number
  streak: number
  rank: number | null
}

export function MatchHeader({ match }: MatchHeaderProps) {
  // Gracefully handle Supabase mock/initial data "0/0"
  const teamAShort = match.team_a_short === '0/0' ? 'MI' : (match.team_a_short || 'MI')
  const teamBShort = match.team_b_short === '0/0' ? 'CSK' : (match.team_b_short || 'CSK')
  const teamA = match.team_a === '0/0' ? 'Mumbai Indians' : (match.team_a || 'Mumbai Indians')
  const teamB = match.team_b === '0/0' ? 'Chennai Super Kings' : (match.team_b || 'Chennai Super Kings')
  const scoreA = match.score_a === '0/0' ? '186 / 4' : (match.score_a || '186 / 4')
  const scoreB = match.score_b === '0/0' ? '153 / 6' : (match.score_b || '153 / 6')
  const currentOver = match.current_over === 0 ? 14 : match.current_over
  const currentBall = match.current_over === 0 ? 3 : match.current_ball

  // Calculate approximate run rate
  const [runs] = scoreA.split('/').map(Number)
  const totalBalls = currentOver * 6 + currentBall
  const runRate = totalBalls > 0 ? ((runs || 186) / (totalBalls / 6)).toFixed(1) : '12.8'

  return (
    <div className="hero-match reveal in">
      <div className="hero-eyebrow">
        <span className="hero-ey-l">{match.venue || 'Wankhede Stadium · Mumbai'}</span>
        <span className="hero-ey-r"><span className="live-pip"></span>INNINGS 2 · OVR {currentOver}</span>
      </div>
      <div className="scoreboard">
        <div className="team-col">
          <div className="team-abbr">{teamAShort}</div>
          <div className="team-full">{teamA}</div>
          <div className="team-score-main">{scoreA}</div>
        </div>
        <div className="vs-col">
          <div className="vs-divider"></div>
          <div className="vs-text">vs</div>
        </div>
        <div className="team-col right">
          <div className="team-abbr dim" style={{ textAlign: 'right' }}>{teamBShort}</div>
          <div className="team-full" style={{ textAlign: 'right' }}>{teamB}</div>
          <div className="team-score-main dim" style={{ textAlign: 'right' }}>{scoreB}</div>
        </div>
      </div>
      <div className="over-strip">
        <div className="rate-pair">
          <div className="over-main">{currentOver}.{currentBall}</div>
          <div className="over-lbl">OVERS</div>
        </div>
        <div className="rate-pair">
          <div className="rate-val">{runRate}</div>
          <div className="rate-key">CRR</div>
        </div>
        <div className="rate-pair">
          <div className="rate-val">16.2</div>
          <div className="rate-key">RRR</div>
        </div>
        <div className="need-chip">
          <div className="need-num">34</div>
          <div className="need-lbl">NEEDED</div>
        </div>
      </div>
    </div>
  )
}
