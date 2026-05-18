import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { calculatePoints } from '@/lib/points/calculator'
import type { Delivery, OutcomeType } from '@/lib/types'
import confetti from 'canvas-confetti'

export interface PredictionResult {
  outcome: OutcomeType
  predicted: OutcomeType
  isCorrect: boolean
  pointsEarned: number
}

export function playAudioChime(type: 'lock' | 'success' | 'advance') {
  if (typeof window === 'undefined') return
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    const now = ctx.currentTime
    if (type === 'lock') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(400, now)
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.1)
      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
      osc.start(now)
      osc.stop(now + 0.1)
    } else if (type === 'success') {
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(523.25, now) // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1) // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2) // G5
      osc.frequency.setValueAtTime(1046.50, now + 0.3) // C6
      gain.gain.setValueAtTime(0.4, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5)
      osc.start(now)
      osc.stop(now + 0.5)
    } else if (type === 'advance') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(300, now)
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.15)
      gain.gain.setValueAtTime(0.3, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
      osc.start(now)
      osc.stop(now + 0.15)
    }
  } catch (e) {
    // Ignore audio context errors
  }
}

export function usePrediction(
  matchId: string, 
  currentUserId?: string, 
  currentStreak: number = 0,
  latestDelivery?: Delivery | null,
  onResult?: (pointsEarned: number, isCorrect: boolean) => void
) {
  const [currentPrediction, setCurrentPrediction] = useState<OutcomeType | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [lastResult, setLastResult] = useState<PredictionResult | null>(null)
  const supabase = useMemo(() => createClient(), [])

  const lockPrediction = useCallback(async (outcome: OutcomeType) => {
    if (!matchId || !currentUserId || isLocked) return

    // Optimistic UI lock & sensory feedback
    setIsLocked(true)
    setCurrentPrediction(outcome)
    setLastResult(null) // clear previous result dialog/animation

    if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50)
    }
    playAudioChime('lock')

    try {
      await supabase.from('predictions').insert({
        user_id: currentUserId,
        match_id: matchId,
        predicted_outcome: outcome,
        streak_at_time: currentStreak
      })
    } catch (err) {
      console.error('Failed to lock prediction:', err)
      // On failure, we maintain the optimistic state for demo continuity unless explicitly requested
    }
  }, [matchId, currentUserId, isLocked, currentStreak, supabase])

  useEffect(() => {
    if (!latestDelivery || !currentPrediction || !currentUserId || !matchId) return

    async function processOutcome() {
      if (!latestDelivery || !currentPrediction || !currentUserId || !matchId) return

      const actualOutcome = latestDelivery.outcome
      const isCorrect = actualOutcome === currentPrediction
      const pointsEarned = calculatePoints(actualOutcome, currentPrediction, currentStreak)

      setLastResult({
        outcome: actualOutcome,
        predicted: currentPrediction,
        isCorrect,
        pointsEarned
      })

      if (onResult) {
        onResult(pointsEarned, isCorrect)
      }

      // Sensory feedback on outcome evaluation
      if (isCorrect) {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate([100, 50, 100])
        }
        playAudioChime('success')
        try {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
        } catch (e) {
          console.error('Confetti error:', e)
        }
      } else {
        if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(100)
        }
      }

      setIsLocked(false)
      setCurrentPrediction(null)

      try {
        await supabase.rpc('update_match_score', {
          p_user_id: currentUserId,
          p_match_id: matchId,
          p_points: pointsEarned,
          p_correct: isCorrect
        })
      } catch (err) {
        console.error('Failed to update match score RPC:', err)
      }
    }

    processOutcome()
  }, [latestDelivery, currentPrediction, currentUserId, matchId, currentStreak, supabase, onResult])

  return { lockPrediction, currentPrediction, isLocked, lastResult }
}

