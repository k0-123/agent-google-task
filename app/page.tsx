import React from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col justify-between selection:bg-[#00e5ff] selection:text-black overflow-x-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-[#00e5ff]/10 via-[#ff3366]/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Top Navigation */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-800/60 backdrop-blur-md bg-slate-950/40 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00e5ff] to-[#00ff88] flex items-center justify-center text-xl shadow-lg shadow-[#00e5ff]/20 animate-pulse">
            <span className="text-black font-extrabold">⚡</span>
          </div>
          <div>
            <span className="font-serif font-black text-2xl tracking-wider text-white">Cricket<em className="not-italic text-[#00e5ff]">Pulse</em></span>
            <span className="block font-mono text-[9px] uppercase tracking-widest text-[#00ff88] font-bold">Autonomous PWA</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/match/ipl-final-2026"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00e5ff] to-[#00ff88] text-black font-mono text-xs font-extrabold uppercase tracking-widest shadow-lg shadow-[#00e5ff]/20 hover:opacity-90 hover:scale-[1.02] transition-all cursor-pointer"
          >
            Launch Arena 🚀
          </Link>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 md:py-24 flex flex-col items-center justify-center text-center space-y-12 my-auto">
        {/* Live Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#ff3366]/20 to-transparent border border-[#ff3366]/40 text-[#ff3366] font-mono text-xs font-bold uppercase tracking-widest shadow-lg shadow-[#ff3366]/10 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#ff3366] animate-ping" />
          IPL 2026 Final · Live Simulation Engine Active
        </div>

        {/* Hero Title */}
        <div className="space-y-6 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif font-black tracking-tight leading-tight md:leading-none text-white">
            The Ultimate Second-Screen <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] via-[#00ff88] to-[#ffd700]">
              Predictive Showdown.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-sans max-w-2xl mx-auto leading-relaxed">
            Experience cricket like never before. An autonomous 30-second simulation engine powered by real-time Gemini AI commentary, live fan leaderboards, and high-stakes prediction streaks.
          </p>
        </div>

        {/* Main CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md mx-auto">
          <Link
            href="/match/ipl-final-2026"
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#00e5ff] via-[#00ff88] to-[#00e5ff] bg-[length:200%_auto] animate-[gradient_4s_linear_infinite] text-black font-mono text-base font-extrabold uppercase tracking-widest shadow-2xl shadow-[#00e5ff]/30 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-3"
          >
            <span className="text-xl">▶️</span> Enter Live Match Arena
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto pt-12">
          <div className="p-8 rounded-2xl backdrop-blur-md bg-gradient-to-br from-slate-900/80 via-[#0d0c0a]/90 to-black border border-slate-800 hover:border-[#00e5ff]/40 transition-all text-left space-y-4 shadow-xl group">
            <div className="w-12 h-12 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner">
              🤖
            </div>
            <h3 className="font-serif font-bold text-xl text-white">Autonomous Engine</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-sans">
              Every 30 seconds, a new delivery is simulated with realistic probabilities, pitch conditions, and player matchups.
            </p>
          </div>

          <div className="p-8 rounded-2xl backdrop-blur-md bg-gradient-to-br from-slate-900/80 via-[#0d0c0a]/90 to-black border border-slate-800 hover:border-[#ff3366]/40 transition-all text-left space-y-4 shadow-xl group">
            <div className="w-12 h-12 rounded-xl bg-[#ff3366]/10 border border-[#ff3366]/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner">
              👑
            </div>
            <h3 className="font-serif font-bold text-xl text-white">Live Leaderboard</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-sans">
              Compete against rival fans in real-time. Build your prediction streaks, maintain high accuracy, and claim the #1 crown.
            </p>
          </div>

          <div className="p-8 rounded-2xl backdrop-blur-md bg-gradient-to-br from-slate-900/80 via-[#0d0c0a]/90 to-black border border-slate-800 hover:border-[#ffd700]/40 transition-all text-left space-y-4 shadow-xl group">
            <div className="w-12 h-12 rounded-xl bg-[#ffd700]/10 border border-[#ffd700]/30 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner">
              ✦
            </div>
            <h3 className="font-serif font-bold text-xl text-white">Gemini AI Commentary</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-sans">
              Immersive, context-aware AI commentary summarizing every over with strategic insights and dramatic flair.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/60 bg-slate-950/80 backdrop-blur-md py-8 px-6 text-center text-xs text-slate-500 font-mono mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 CricketPulse PWA. Built for Vercel Deployment.</div>
          <div className="flex gap-6">
            <span className="hover:text-[#00e5ff] transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#00e5ff] transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#00e5ff] transition-colors cursor-pointer">API Docs</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
