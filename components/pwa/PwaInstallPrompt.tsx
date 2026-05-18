'use client'

import React, { useState, useEffect } from 'react'

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto p-4 rounded-2xl bg-cyan/20 backdrop-blur-xl border border-cyan/40 text-white shadow-2xl z-50 flex items-center justify-between gap-3 animate-fadeIn font-sans">
      <div className="flex items-center gap-3 truncate">
        <span className="text-2xl">📲</span>
        <div className="truncate">
          <div className="text-xs font-bold text-cyan">Install CricketPulse PWA</div>
          <div className="text-[10px] text-white/70 truncate">Add to Home Screen for full screen second-screen experience</div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button 
          onClick={handleInstall} 
          className="px-3 py-1.5 bg-cyan text-black font-bold rounded-xl text-xs shadow-md shadow-cyan/20 cursor-pointer"
        >
          Install
        </button>
        <button 
          onClick={() => setShowPrompt(false)} 
          className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/60 hover:bg-white/20 cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
