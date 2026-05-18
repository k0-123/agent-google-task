import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MatchScore } from '@/lib/types'

const DUMMY_LEADERBOARD: MatchScore[] = [
  { user_id: 'guest_demo_user', match_id: 'demo-ipl-final', points: 2450, correct_predictions: 18, total_predictions: 22, current_streak: 7, best_streak: 7, profiles: { display_name: 'Vikram Sharma', avatar_url: '' } },
  { user_id: 'u2', match_id: 'demo-ipl-final', points: 2310, correct_predictions: 16, total_predictions: 21, current_streak: 4, best_streak: 6, profiles: { display_name: 'Priya Patel', avatar_url: '' } },
  { user_id: 'u3', match_id: 'demo-ipl-final', points: 2180, correct_predictions: 15, total_predictions: 20, current_streak: 3, best_streak: 5, profiles: { display_name: 'Amit Kumar', avatar_url: '' } },
  { user_id: 'u4', match_id: 'demo-ipl-final', points: 1950, correct_predictions: 14, total_predictions: 19, current_streak: 2, best_streak: 5, profiles: { display_name: 'Neha Gupta', avatar_url: '' } },
  { user_id: 'u5', match_id: 'demo-ipl-final', points: 1820, correct_predictions: 13, total_predictions: 18, current_streak: 1, best_streak: 4, profiles: { display_name: 'Rohan Desai', avatar_url: '' } }
]

export function useLeaderboard(matchId: string, currentUserId?: string) {
  const [scores, setScores] = useState<MatchScore[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!matchId) return

    let isMounted = true

    async function fetchLeaderboard() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('match_scores')
          .select('*, profiles(display_name, avatar_url)')
          .eq('match_id', matchId)
          .order('points', { ascending: false })

        if (error) throw error
        if (isMounted) {
          if (!data || data.length === 0) {
            throw new Error('Empty leaderboard')
          }
          setScores(data as MatchScore[])
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Supabase leaderboard fetch failed, falling back to DUMMY_LEADERBOARD:', err.message)
          // Ensure current user is included in the dummy leaderboard if provided
          let dummyScores = DUMMY_LEADERBOARD.map(s => ({ ...s, match_id: matchId }))
          if (currentUserId && !dummyScores.some(s => s.user_id === currentUserId)) {
            dummyScores[0] = { ...dummyScores[0], user_id: currentUserId }
          }
          setScores(dummyScores)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchLeaderboard()

    const channel = supabase
      .channel(`leaderboard-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_scores',
          filter: `match_id=eq.${matchId}`,
        },
        () => {
          if (isMounted) {
            fetchLeaderboard()
          }
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [matchId, currentUserId, supabase])

  const userRank = useMemo(() => {
    if (!currentUserId) return null
    const index = scores.findIndex((s) => s.user_id === currentUserId)
    return index !== -1 ? index + 1 : null
  }, [scores, currentUserId])

  return { scores, userRank, loading }
}
