'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { OutcomeType } from '@/lib/types'
import type { PredictionResult } from '@/hooks/usePrediction'

interface PredictionPanelProps {
  onPredict: (outcome: OutcomeType) => void
  currentPrediction: OutcomeType | null
  isLocked: boolean
  lastResult: PredictionResult | null
  secondsRemaining?: number
}

const BUTTONS_CONFIG: { outcome: OutcomeType; label: string; pts: string; icon: string }[] = [
  { outcome: 'dot', label: 'Dot', pts: '10 pts', icon: '🟤' },
  { outcome: 'single', label: '1–3 Runs', pts: '10 pts', icon: '🏃' },
  { outcome: 'boundary_4', label: 'Four', pts: '20 pts', icon: '🔵' },
  { outcome: 'boundary_6', label: 'Six', pts: '30 pts', icon: '🔴' },
  { outcome: 'wicket', label: 'Wicket', pts: '25 pts', icon: '❌' },
  { outcome: 'wide', label: 'Wide', pts: '15 pts', icon: '〰️' },
]

const OUTCOME_LABELS: Record<OutcomeType, string> = {
  boundary_6: 'SIX',
  boundary_4: 'FOUR',
  wicket: 'WICKET',
  dot: 'DOT',
  single: '1–3 RUNS',
  wide: 'WIDE'
}

export function PredictionPanel({ onPredict, currentPrediction, isLocked, lastResult, secondsRemaining }: PredictionPanelProps) {
  return (
    <>
      <div className="sec-head reveal-fast in">
        <span className="sec-num">01</span>
        <span className="sec-line"></span>
        <span className="sec-title">Predict Next Ball</span>
      </div>

      <div className="predict-wrap reveal in">
        <div className="predict-head">
          <div className="predict-hed">What&apos;s Next?</div>
          <div className="flex items-center gap-2">
            {secondsRemaining !== undefined && (
              <div className="px-2.5 py-1 bg-[var(--red)] text-white font-mono text-xs font-bold uppercase tracking-wider animate-pulse shadow-sm">
                ⏳ {secondsRemaining}s REMAINING
              </div>
            )}
            <div className="streak-tag">🔥 7 streak</div>
          </div>
        </div>

        <div className="ai-insight">
          <span className="ai-tag">GEMINI</span>
          <span className="ai-text">
            <strong>Bumrah bowling outside off</strong> — dot or wide likely on this dry Wankhede pitch. 3 dots already this over.
          </span>
        </div>

        {/* Result Dialog Popup */}
        <AnimatePresence>
          {lastResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className={`p-4 rounded-xl border mb-4 ${
                lastResult.isCorrect 
                  ? 'bg-[var(--paper2)] border-[var(--ink)] text-[var(--ink)]' 
                  : 'bg-[var(--red2)] border-[var(--red)] text-[var(--red)]'
              }`}
            >
              <div className="space-y-1">
                <div className="text-xs font-semibold uppercase tracking-widest font-mono">
                  {lastResult.isCorrect ? '🎯 PREDICTION CORRECT!' : '💔 PREDICTION INCORRECT'}
                </div>
                <div className="text-sm font-medium">
                  ACTUAL: <span className="font-bold">{OUTCOME_LABELS[lastResult.outcome]}</span> 
                  {' '}(YOU PREDICTED {OUTCOME_LABELS[lastResult.predicted]})
                </div>
              </div>
              <div className="mt-2 flex justify-end font-serif italic text-2xl font-bold">
                {lastResult.isCorrect ? `+${lastResult.pointsEarned}` : '0'} PTS
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pred-grid">
          {BUTTONS_CONFIG.map(({ outcome, label, pts, icon }) => {
            const isSelected = currentPrediction === outcome
            const isDisabled = isLocked

            return (
              <div
                key={`pred-btn-${outcome}`}
                onClick={() => !isDisabled && onPredict(outcome)}
                className={`pred-opt ${isSelected ? 'chosen' : ''} ${isDisabled && !isSelected ? 'dimmed' : ''}`}
              >
                <span className="pred-icon">{icon}</span>
                <span className="pred-label">{label}</span>
                <span className="pred-pts">{pts}</span>
              </div>
            )
          })}
        </div>

        {isLocked && currentPrediction && (
          <div className="locked-bar" style={{ display: 'flex' }}>
            <div className="locked-info">
              <span className="locked-ico">✅</span>
              <div>
                <div className="locked-main">{OUTCOME_LABELS[currentPrediction]} LOCKED IN</div>
                <div className="locked-sub">Awaiting delivery...</div>
              </div>
            </div>
            <div className="locked-count">{secondsRemaining !== undefined ? secondsRemaining : 3}</div>
          </div>
        )}
      </div>
    </>
  )
}
