import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface ReactionBurst {
  id: string
  emoji: string
  x: number // random horizontal starting position for animation
  timestamp: number
}

export function useReactions(matchId: string, currentUserId?: string) {
  const [reactionBursts, setReactionBursts] = useState<ReactionBurst[]>([])
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (!matchId) return

    let isMounted = true

    const channel = supabase
      .channel(`reactions-${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reactions',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          if (isMounted) {
            if (payload.new.user_id === currentUserId) return

            const newBurst: ReactionBurst = {
              id: payload.new.id || Math.random().toString(),
              emoji: payload.new.emoji,
              x: Math.random() * 80 + 10, // 10% to 90% width
              timestamp: Date.now(),
            }
            setReactionBursts((prev) => [...prev, newBurst])
          }
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [matchId, currentUserId, supabase])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setReactionBursts((prev) => prev.filter((b) => now - b.timestamp < 4000))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const sendReaction = useCallback(
    async (emoji: string) => {
      if (!matchId || !currentUserId) return

      const optimisticBurst: ReactionBurst = {
        id: Math.random().toString(),
        emoji,
        x: Math.random() * 80 + 10,
        timestamp: Date.now(),
      }
      setReactionBursts((prev) => [...prev, optimisticBurst])

      try {
        await supabase.from('reactions').insert({
          user_id: currentUserId,
          match_id: matchId,
          emoji,
        })
      } catch (err) {
        console.error('Failed to send reaction:', err)
      }
    },
    [matchId, currentUserId, supabase]
  )

  return { reactionBursts, sendReaction }
}
