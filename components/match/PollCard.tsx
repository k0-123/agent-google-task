'use client'

import React from 'react'
import type { Poll } from '@/lib/types'

interface PollCardProps {
  poll: Poll | null
  userVote: number | null
  onVote: (optionIndex: number) => void
  voteCounts: Record<number, number>
}

export function PollCard({ poll, userVote, onVote, voteCounts = {} }: PollCardProps) {
  const activePoll = poll || {
    id: 'poll-1',
    match_id: 'match-1',
    question: 'Can MI clinch their 6th IPL title tonight?',
    options: [
      'Yes — Hardik takes them home',
      'No — CSK bowling too tight',
      'Super Over time'
    ],
    created_at: new Date().toISOString()
  }

  const totalVotes = Object.values(voteCounts).reduce((a, b) => a + b, 0) || 12847

  return (
    <>
      <div className="sec-head reveal-fast in">
        <span className="sec-num">03</span>
        <span className="sec-line"></span>
        <span className="sec-title">Fan Poll</span>
      </div>

      <div className="poll-wrap reveal in">
        <div className="poll-q">{activePoll.question}</div>

        <div className="poll-opts">
          {activePoll.options.map((option, index) => {
            const count = voteCounts[index] || (index === 0 ? 7451 : index === 1 ? 3597 : 1799)
            const percentage = Math.round((count / totalVotes) * 100)
            const isSelected = userVote === index
            const hasVoted = userVote !== null

            return (
              <div
                key={`poll-opt-${index}`}
                onClick={() => !hasVoted && onVote(index)}
                className={`poll-row ${isSelected ? 'voted' : ''}`}
                style={hasVoted && isSelected ? { outline: '2px solid rgba(13,12,10,0.3)' } : {}}
              >
                <div 
                  className="poll-fill" 
                  style={{ width: `${percentage}%` }}
                />
                <div className="poll-inner">
                  <span className="poll-text">{option}</span>
                  <span className="poll-pct">{percentage}%</span>
                </div>
              </div>
            )
          })}
        </div>
        <div className="poll-total">{totalVotes.toLocaleString()} votes · updates live</div>
      </div>
    </>
  )
}
