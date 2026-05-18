'use client'

import React from 'react'

interface OverSummaryCardProps {
  overNumber?: number
  runs?: number
  wickets?: number
  dots?: number
  economy?: string
  commentary?: string
}

export function OverSummaryCard({ 
  overNumber = 14, 
  runs = 12,
  wickets = 1,
  dots = 2,
  economy = '12.0',
  commentary 
}: OverSummaryCardProps) {
  const displayOver = overNumber === 0 ? 14 : overNumber

  return (
    <>
      <div className="sec-head reveal-fast in">
        <span className="sec-num">02</span>
        <span className="sec-line"></span>
        <span className="sec-title">AI Commentary</span>
      </div>
      <div className="commentary-wrap reveal in">
        <div className="commentary-card rounded-2xl backdrop-blur-md bg-gradient-to-br from-slate-900/90 via-[#0d0c0a]/95 to-black border border-[#00e5ff]/30 shadow-2xl shadow-[#00e5ff]/10 overflow-hidden transition-all duration-300 hover:border-[#00e5ff]/60 hover:shadow-[#00e5ff]/20">
          <div className="commentary-header bg-gradient-to-r from-black via-slate-900 to-black border-b border-[#00e5ff]/20 px-5 py-3 flex items-center justify-between">
            <span className="commentary-over font-barlow-condensed text-xl font-extrabold text-white tracking-wider">Over {displayOver} recap</span>
            <span className="gemini-tag px-2.5 py-1 rounded-full bg-[#b8860b]/20 border border-[#b8860b]/40 text-[#ffd700] font-mono text-xs font-bold flex items-center gap-1.5 shadow-lg">
              <span>✦</span> Gemini AI
            </span>
          </div>
          <div className="commentary-body p-6 bg-slate-950/40">
            <p className="commentary-text font-serif text-lg line-height-relaxed text-slate-100 tracking-wide leading-relaxed">
              {commentary ? (
                <span>{commentary}</span>
              ) : (
                <span>
                  <strong className="text-[#00e5ff] font-sans font-bold">Bumrah was unplayable</strong> — three consecutive dots, a wide, then Kohli&apos;s wicket for 67. Wankhede went silent. MI need 34 from 33 to clinch their record sixth IPL title tonight.
                </span>
              )}
            </p>
          </div>
          <div className="commentary-footer grid grid-cols-4 border-t border-slate-800/80 bg-black/60 divide-x divide-slate-800/80 p-1">
            <div className="c-stat py-3 px-2 flex flex-col items-center justify-center transition-colors hover:bg-slate-900/50">
              <span className="c-stat-val font-barlow-condensed text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">{runs}</span>
              <span className="c-stat-key font-mono text-[9px] uppercase tracking-widest text-slate-400 mt-1">Runs</span>
            </div>
            <div className="c-stat py-3 px-2 flex flex-col items-center justify-center transition-colors hover:bg-slate-900/50">
              <span className="c-stat-val font-barlow-condensed text-3xl font-extrabold text-[#ff3366]">{wickets}</span>
              <span className="c-stat-key font-mono text-[9px] uppercase tracking-widest text-slate-400 mt-1">Wickets</span>
            </div>
            <div className="c-stat py-3 px-2 flex flex-col items-center justify-center transition-colors hover:bg-slate-900/50">
              <span className="c-stat-val font-barlow-condensed text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00e5ff] to-[#00ff88]">{dots}</span>
              <span className="c-stat-key font-mono text-[9px] uppercase tracking-widest text-slate-400 mt-1">Dots</span>
            </div>
            <div className="c-stat py-3 px-2 flex flex-col items-center justify-center transition-colors hover:bg-slate-900/50">
              <span className="c-stat-val font-barlow-condensed text-3xl font-extrabold text-[#ffd700]">{economy}</span>
              <span className="c-stat-key font-mono text-[9px] uppercase tracking-widest text-slate-400 mt-1">Economy</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
