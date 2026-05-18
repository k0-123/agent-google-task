'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Match, Delivery, OutcomeType } from '@/lib/types'

interface AdminClientProps {
  matchId: string
}

export function AdminClient({ matchId }: AdminClientProps) {
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [bowler, setBowler] = useState('Pat Cummins')
  const [batsman, setBatsman] = useState('Virat Kohli')
  const [actionStatus, setActionStatus] = useState<string | null>(null)

  // AI Test States
  const [aiCommentary, setAiCommentary] = useState<string | null>(null)
  const [aiPoll, setAiPoll] = useState<any | null>(null)
  const [aiHint, setAiHint] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState<string | null>(null)

  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    let isMounted = true

    async function fetchMatch() {
      try {
        const { data, error } = await supabase
          .from('matches')
          .select('*')
          .eq('id', matchId)
          .single()

        if (error) throw error
        if (isMounted) {
          setMatch(data as Match)
          setLoading(false)
        }
      } catch (err) {
        console.error('Error fetching match:', err)
        if (isMounted) setLoading(false)
      }
    }

    fetchMatch()

    const channel = supabase
      .channel(`admin-match-${matchId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches', filter: `id=eq.${matchId}` }, (payload) => {
        if (isMounted) setMatch(payload.new as Match)
      })
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [matchId, supabase])

  const updateStatus = async (newStatus: string) => {
    try {
      setActionStatus(`Updating status to ${newStatus}...`)
      await supabase.from('matches').update({ status: newStatus }).eq('id', matchId)
      setActionStatus(`Match status updated to ${newStatus}!`)
      setTimeout(() => setActionStatus(null), 3000)
    } catch (err: any) {
      setActionStatus(`Error: ${err.message}`)
    }
  }

  const advanceBall = async (outcome: OutcomeType) => {
    if (!match) return

    setActionStatus(`Advancing ball: ${outcome}...`)

    // Parse current score e.g. "154/2"
    const [runsStr, wktsStr] = (match.score_a || '0/0').split('/')
    let runs = parseInt(runsStr || '0', 10)
    let wkts = parseInt(wktsStr || '0', 10)
    let over = match.current_over || 0
    let ball = match.current_ball || 0

    let runsScored = 0
    if (outcome === 'boundary_6') runsScored = 6
    if (outcome === 'boundary_4') runsScored = 4
    if (outcome === 'single') runsScored = 1
    if (outcome === 'wide') runsScored = 1

    runs += runsScored
    if (outcome === 'wicket') wkts += 1

    // Increment ball unless wide
    if (outcome !== 'wide') {
      ball += 1
      if (ball >= 6) {
        ball = 0
        over += 1
      }
    }

    const newScore = `${runs}/${wkts}`
    const last6 = [...(match.last_6 || [])]
    if (last6.length >= 6) last6.shift()

    let badge = '•'
    if (outcome === 'boundary_6') badge = '6'
    if (outcome === 'boundary_4') badge = '4'
    if (outcome === 'wicket') badge = 'W'
    if (outcome === 'single') badge = '1'
    if (outcome === 'wide') badge = 'WD'

    last6.push(outcome)

    try {
      // 1. Update Match
      await supabase.from('matches').update({
        score_a: newScore,
        current_over: over,
        current_ball: ball,
        last_6: last6
      }).eq('id', matchId)

      // 2. Insert Delivery (Triggers client useDeliveries & usePrediction)
      await supabase.from('deliveries').insert({
        match_id: matchId,
        over_number: over === match.current_over && ball === 0 ? over + 1 : over, // handle over rollover
        ball_number: ball === 0 ? 6 : ball,
        outcome: outcome,
        runs_scored: runsScored,
        batsman: batsman,
        bowler: bowler
      })

      setActionStatus(`Ball advanced successfully! (${badge})`)
      setTimeout(() => setActionStatus(null), 3000)
    } catch (err: any) {
      setActionStatus(`Error advancing ball: ${err.message}`)
    }
  }

  const generateAICommentary = async () => {
    if (!match) return
    setAiLoading('commentary')
    setAiCommentary(null)
    try {
      const res = await fetch('/api/gemini/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchState: match,
          last6Balls: match.last_6 || []
        })
      })
      const data = await res.json()
      setAiCommentary(data.commentary)
    } catch (err: any) {
      setAiCommentary(`Error generating commentary: ${err.message}`)
    } finally {
      setAiLoading(null)
    }
  }

  const generateAIPoll = async () => {
    if (!match) return
    setAiLoading('poll')
    setAiPoll(null)
    try {
      const res = await fetch('/api/gemini/poll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchState: match })
      })
      const data = await res.json()
      const newPoll = data.poll

      setAiPoll(newPoll)

      // Insert into Supabase so fans see it live
      await supabase.from('polls').insert({
        match_id: matchId,
        question: newPoll.question,
        options: newPoll.options
      })

      setActionStatus('Smart poll generated & published to fans!')
      setTimeout(() => setActionStatus(null), 4000)
    } catch (err: any) {
      setAiPoll({ error: err.message })
    } finally {
      setAiLoading(null)
    }
  }

  const generateAIHint = async () => {
    if (!match) return
    setAiLoading('hint')
    setAiHint(null)
    try {
      const res = await fetch('/api/gemini/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchState: match,
          batsman,
          bowler
        })
      })
      const data = await res.json()
      setAiHint(data.hint)
    } catch (err: any) {
      setAiHint(`Error generating hint: ${err.message}`)
    } finally {
      setAiLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-screen font-sans bg-[#080c10] text-white">
        <div className="w-10 h-10 border-4 border-cyan border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-white/60 animate-pulse">Loading Admin Engine...</p>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-screen font-sans bg-[#080c10] text-white text-center">
        <div className="text-red text-4xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-2">Match Not Found</h2>
        <p className="text-white/60 mb-6">Could not load match data for ID: {matchId}</p>
        <a href="/" className="px-6 py-2.5 bg-cyan text-black font-bold rounded-full shadow-lg shadow-cyan/20">Return Home</a>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-8 space-y-8 font-sans bg-[#080c10] text-white min-h-screen pb-24">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6 font-sans">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red/20 text-red border border-red/30 text-xs font-bold uppercase tracking-wider mb-2">
            <span>⚙️</span> MATCH ADMIN CONTROLLER
          </div>
          <h1 className="text-3xl font-bebas font-bold tracking-wider text-white">
            {match.title}
          </h1>
          <p className="text-xs text-white/50 font-medium mt-1">
            Venue: {match.venue} | Match ID: {match.id}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bebas font-bold text-cyan tracking-wider">
            {match.score_a}
          </div>
          <div className="text-xs text-white/60 font-medium">
            Over {match.current_over}.{match.current_ball} / {match.total_overs}
          </div>
        </div>
      </div>

      {/* Action Status Toast */}
      {actionStatus && (
        <div className="p-4 rounded-xl bg-cyan/20 border border-cyan/40 text-cyan text-sm font-bold flex items-center gap-2 animate-pulse shadow-lg shadow-cyan/10">
          <span>⚡</span> {actionStatus}
        </div>
      )}

      {/* Section 1: Match Status Control */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
        <h2 className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2">
          <span>🏷️</span> 1. Match Status Control
        </h2>
        <div className="flex items-center gap-3">
          {['upcoming', 'live', 'completed'].map((status) => (
            <button
              key={`status-${status}`}
              onClick={() => updateStatus(status)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold border capitalize transition-all duration-200 ${
                match.status === status
                  ? 'bg-cyan text-black border-cyan shadow-md shadow-cyan/20'
                  : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Section 2: Advance Ball Simulator */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2">
            <span>🏏</span> 2. Advance Ball Simulator
          </h2>
          <span className="text-[10px] bg-white/10 text-white/60 px-2 py-0.5 rounded-full font-medium">
            Triggers Fan Predictions
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 font-sans">
          <div>
            <label className="block text-xs text-white/60 mb-1.5 font-medium">Bowler Name</label>
            <input 
              type="text" 
              value={bowler} 
              onChange={(e) => setBowler(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-white/60 mb-1.5 font-medium">Batsman Name</label>
            <input 
              type="text" 
              value={batsman} 
              onChange={(e) => setBatsman(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs text-white/60 font-medium">Select Next Ball Outcome</label>
          <div className="grid grid-cols-3 gap-3 font-bebas">
            <button 
              onClick={() => advanceBall('boundary_6')}
              className="py-3 rounded-xl bg-cyan/20 text-cyan border border-cyan/30 hover:bg-cyan/30 font-bold text-lg tracking-wider transition-all shadow-md shadow-cyan/10 cursor-pointer"
            >
              6 RUNS (SIX)
            </button>
            <button 
              onClick={() => advanceBall('boundary_4')}
              className="py-3 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 font-bold text-lg tracking-wider transition-all shadow-md shadow-blue-500/10 cursor-pointer"
            >
              4 RUNS (FOUR)
            </button>
            <button 
              onClick={() => advanceBall('wicket')}
              className="py-3 rounded-xl bg-red/20 text-red border border-red/30 hover:bg-red/30 font-bold text-lg tracking-wider transition-all shadow-md shadow-red/10 cursor-pointer"
            >
              WICKET (OUT)
            </button>
            <button 
              onClick={() => advanceBall('dot')}
              className="py-3 rounded-xl bg-white/5 text-white border border-white/10 hover:bg-white/10 font-bold text-lg tracking-wider transition-all cursor-pointer"
            >
              DOT BALL (0)
            </button>
            <button 
              onClick={() => advanceBall('single')}
              className="py-3 rounded-xl bg-white/5 text-white border border-white/10 hover:bg-white/10 font-bold text-lg tracking-wider transition-all cursor-pointer"
            >
              1 RUN (SINGLE)
            </button>
            <button 
              onClick={() => advanceBall('wide')}
              className="py-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 font-bold text-lg tracking-wider transition-all cursor-pointer"
            >
              WIDE / NO BALL
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: AI Engine Triggers */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 space-y-5 shadow-xl font-sans">
        <h2 className="text-sm font-bold text-white/80 uppercase tracking-wider flex items-center gap-2">
          <span>🤖</span> 3. Gemini / ChatGPT AI Engine Triggers
        </h2>

        {/* AI Commentary Button */}
        <div className="space-y-3 p-4 rounded-xl bg-black/30 border border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white">Over Summary Commentary</div>
              <div className="text-xs text-white/50 font-medium">Generates Harsha Bhogle style dramatic analysis</div>
            </div>
            <button
              onClick={generateAICommentary}
              disabled={aiLoading === 'commentary'}
              className="px-4 py-2 rounded-xl bg-cyan text-black font-bold text-xs shadow-md shadow-cyan/20 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {aiLoading === 'commentary' ? 'Generating...' : 'Trigger Commentary'}
            </button>
          </div>
          {aiCommentary && (
            <div className="p-3.5 rounded-xl bg-cyan/10 border border-cyan/30 text-xs text-white/90 leading-relaxed italic">
              🎙️ "{aiCommentary}"
            </div>
          )}
        </div>

        {/* AI Smart Poll Button */}
        <div className="space-y-3 p-4 rounded-xl bg-black/30 border border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white">Smart Fan Poll Generation</div>
              <div className="text-xs text-white/50 font-medium">Generates contextual poll & publishes to fans</div>
            </div>
            <button
              onClick={generateAIPoll}
              disabled={aiLoading === 'poll'}
              className="px-4 py-2 rounded-xl bg-cyan text-black font-bold text-xs shadow-md shadow-cyan/20 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {aiLoading === 'poll' ? 'Generating...' : 'Spawn Smart Poll'}
            </button>
          </div>
          {aiPoll && !aiPoll.error && (
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs space-y-2 font-sans">
              <div className="font-bold text-cyan">📊 {aiPoll.question}</div>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {aiPoll.options?.map((opt: string, idx: number) => (
                  <div key={`poll-opt-preview-${idx}`} className="p-2 rounded-lg bg-white/5 border border-white/10 text-center text-[10px] text-white/80 truncate">
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          )}
          {aiPoll?.error && (
            <div className="p-3 rounded-xl bg-red/20 text-red text-xs border border-red/30">
              Error: {aiPoll.error}
            </div>
          )}
        </div>

        {/* AI Prediction Hint Button */}
        <div className="space-y-3 p-4 rounded-xl bg-black/30 border border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-white">Tactical Prediction Hint</div>
              <div className="text-xs text-white/50 font-medium">Generates 1-line tactical bowling/batting hint</div>
            </div>
            <button
              onClick={generateAIHint}
              disabled={aiLoading === 'hint'}
              className="px-4 py-2 rounded-xl bg-cyan text-black font-bold text-xs shadow-md shadow-cyan/20 hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
            >
              {aiLoading === 'hint' ? 'Generating...' : 'Trigger Hint'}
            </button>
          </div>
          {aiHint && (
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-200 leading-relaxed font-medium">
              💡 {aiHint}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
