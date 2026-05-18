'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface StreakBadgeProps {
  streak: number
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <div className="streak-badge">
      <span className="streak-fire">🔥</span>
      <span className="streak-num">{streak}x</span>
      <span className="streak-label">STREAK</span>
    </div>
  )
}
