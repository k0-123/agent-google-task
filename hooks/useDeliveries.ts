import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Delivery } from '@/lib/types'

const DUMMY_DELIVERIES: Delivery[] = [
  { id: 'd1', match_id: 'demo-ipl-final', over_number: 18, ball_number: 1, outcome: 'dot', runs_scored: 0, batsman: 'Hardik Pandya', bowler: 'Jasprit Bumrah', created_at: new Date(Date.now() - 300000).toISOString() },
  { id: 'd2', match_id: 'demo-ipl-final', over_number: 18, ball_number: 2, outcome: 'boundary_6', runs_scored: 6, batsman: 'Hardik Pandya', bowler: 'Jasprit Bumrah', created_at: new Date(Date.now() - 240000).toISOString() },
  { id: 'd3', match_id: 'demo-ipl-final', over_number: 18, ball_number: 3, outcome: 'single', runs_scored: 1, batsman: 'Hardik Pandya', bowler: 'Jasprit Bumrah', created_at: new Date(Date.now() - 180000).toISOString() },
  { id: 'd4', match_id: 'demo-ipl-final', over_number: 18, ball_number: 4, outcome: 'wicket', runs_scored: 0, batsman: 'Rohit Sharma', bowler: 'Jasprit Bumrah', created_at: new Date(Date.now() - 120000).toISOString() },
  { id: 'd5', match_id: 'demo-ipl-final', over_number: 18, ball_number: 5, outcome: 'boundary_4', runs_scored: 4, batsman: 'Suryakumar Yadav', bowler: 'Jasprit Bumrah', created_at: new Date(Date.now() - 60000).toISOString() },
  { id: 'd6', match_id: 'demo-ipl-final', over_number: 18, ball_number: 6, outcome: 'dot', runs_scored: 0, batsman: 'Suryakumar Yadav', bowler: 'Jasprit Bumrah', created_at: new Date().toISOString() }
]

export function useDeliveries(matchId: string) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!matchId) return

    let isMounted = true

    async function fetchDeliveries() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('deliveries')
          .select('*')
          .eq('match_id', matchId)
          .order('created_at', { ascending: true })

        if (error) throw error
        if (isMounted) {
          if (!data || data.length === 0) {
            throw new Error('No deliveries found')
          }
          setDeliveries(data as Delivery[])
        }
      } catch (err: any) {
        if (isMounted) {
          console.warn('Supabase deliveries fetch failed, falling back to DUMMY_DELIVERIES:', err.message)
          setDeliveries(DUMMY_DELIVERIES.map(d => ({ ...d, match_id: matchId })))
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchDeliveries()

    const channel = supabase
      .channel(`deliveries-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'deliveries',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          if (isMounted) {
            setDeliveries((prev) => [...prev, payload.new as Delivery])
          }
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [matchId, supabase])

  const latestDelivery = deliveries.length > 0 ? deliveries[deliveries.length - 1] : null

  return { deliveries, latestDelivery, loading }
}
