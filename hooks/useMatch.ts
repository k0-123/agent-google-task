import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Match } from '@/lib/types'

const DUMMY_MATCH_DATA: Match = {
  id: "demo-ipl-final",
  title: "IPL 2026 Final: Mumbai Indians vs Chennai Super Kings",
  team_a: "Mumbai Indians",
  team_b: "Chennai Super Kings",
  team_a_short: "MI",
  team_b_short: "CSK",
  score_a: "186/4",
  score_b: "0/0",
  current_over: 18,
  current_ball: 4,
  total_overs: 20,
  status: "live",
  batting_team: "Mumbai Indians",
  venue: "Wankhede Stadium, Mumbai",
  last_6: ["dot", "boundary_6", "single", "wicket", "boundary_4", "dot"]
}

export function useMatch(matchId: string) {
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!matchId) return

    let isMounted = true

    async function fetchMatch() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('matches')
          .select('*')
          .eq('id', matchId)
          .single()

        if (error) throw error
        if (isMounted) {
          setMatch(data as Match)
          setError(null)
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Supabase match fetch failed, falling back to DUMMY_MATCH_DATA:', err.message)
          setMatch({ ...DUMMY_MATCH_DATA, id: matchId })
          setError(null)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchMatch()

    const channel = supabase
      .channel(`match-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`,
        },
        (payload) => {
          if (isMounted) {
            setMatch(payload.new as Match)
          }
        }
      )
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' && isMounted) {
          console.warn('Realtime connection error, maintaining current match state')
        }
      })

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [matchId, supabase])

  return { match, loading, error }
}
