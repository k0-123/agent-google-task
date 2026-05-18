'use client'

import React from 'react'
import type { OutcomeType } from '@/lib/types'

interface BallTrackerProps {
  last6: OutcomeType[]
  currentOver: number
  secondsRemaining?: number
}

const OUTCOME_CONFIG: Record<OutcomeType, { label: string; className: string }> = {
  boundary_6: { label: '6', className: 'bball six' },
  boundary_4: { label: '4', className: 'bball four' },
  wicket: { label: 'W', className: 'bball wicket' },
  dot: { label: '·', className: 'bball dot' },
  single: { label: '1', className: 'bball dot' },
  wide: { label: 'Wd', className: 'bball wide' }
}

export function BallTracker({ last6 = [] }: BallTrackerProps) {
  // If Supabase initial/dummy data has empty last6, fallback to Image 2's exact sequence
  const activeBalls = last6.length > 0 ? last6 : ['dot', 'boundary_4', 'boundary_6', 'wide', 'dot', 'wicket'] as OutcomeType[]
  
  const paddedBalls: (OutcomeType | null)[] = [...activeBalls]
  while (paddedBalls.length < 6) {
    paddedBalls.push(null)
  }
  const displayBalls = paddedBalls.slice(-6)

  return (
    <div className="ball-seq-wrap reveal in">
      <div className="ball-seq-label">Last 6 balls this over</div>
      <div className="ball-seq">
        {displayBalls.map((outcome, index) => {
          if (!outcome) {
            return (
              <div key={`empty-${index}`} className="bball dot opacity-40">
                ·
              </div>
            )
          }

          const config = OUTCOME_CONFIG[outcome] || { label: '·', className: 'bball dot' }

          return (
            <div key={`ball-${index}-${outcome}`} className={config.className}>
              {config.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}
