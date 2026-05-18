'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ReactionBurst } from '@/hooks/useReactions'

interface ReactionBarProps {
  onSend: (emoji: string) => void
  bursts: ReactionBurst[]
}

const EMOJIS = [
  { emoji: '🏏', count: '1.2k' },
  { emoji: '💥', count: '847' },
  { emoji: '🔥', count: '2.4k' },
  { emoji: '😱', count: '392' },
  { emoji: '💛', count: '1.8k' },
]

export function ReactionBar({ onSend, bursts = [] }: ReactionBarProps) {
  const handleFire = (emoji: string, e: React.MouseEvent<HTMLDivElement>) => {
    onSend(emoji)
    const countEl = e.currentTarget.querySelector('.rx-count')
    if (countEl && countEl.textContent) {
      const val = countEl.textContent
      if (val.includes('k')) {
        const n = parseFloat(val) + 0.1
        countEl.textContent = n.toFixed(1) + 'k'
      } else {
        countEl.textContent = (parseInt(val) + 1).toString()
      }
    }
  }

  return (
    <>
      <div className="sec-head reveal-fast in">
        <span className="sec-num">05</span>
        <span className="sec-line"></span>
        <span className="sec-title">Live Reactions</span>
      </div>

      <div className="rx-wrap reveal in relative">
        {/* Floating Animation Overlay */}
        <div className="absolute bottom-full left-0 right-0 h-64 pointer-events-none overflow-hidden z-50">
          <AnimatePresence>
            {bursts.map((burst) => (
              <motion.div
                key={`burst-${burst.id}`}
                initial={{ opacity: 1, y: 0, scale: 0.8 }}
                animate={{ 
                  opacity: [1, 1, 0], 
                  y: -180, 
                  scale: [0.8, 1.4, 1],
                  x: burst.x % 2 === 0 ? [0, -20, 20] : [0, 20, -20]
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2.2, ease: 'easeOut' }}
                style={{ left: `${burst.x}%` }}
                className="absolute bottom-2 text-3xl filter drop-shadow-lg select-none pointer-events-none"
              >
                {burst.emoji}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="rx-bar">
          {EMOJIS.map(({ emoji, count }) => (
            <div
              key={`reaction-btn-${emoji}`}
              onClick={(e) => handleFire(emoji, e)}
              className="rx-btn cursor-pointer"
            >
              <span className="rx-emoji">{emoji}</span>
              <span className="rx-count">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
