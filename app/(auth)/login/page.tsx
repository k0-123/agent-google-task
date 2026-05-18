"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [loading, setLoading] = useState<"guest" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleGuestSignIn = () => {
    setLoading("guest");
    setError(null);
    document.cookie = "guest_mode=true; path=/; max-age=86400";
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('guest_user_id')) {
        localStorage.setItem('guest_user_id', 'guest_' + Math.random().toString(36).substr(2, 9));
      }
    }
    router.push("/match/latest");
    router.refresh();
  };

  return (
    <div className="flex-1 flex flex-col justify-center px-6 py-12 relative overflow-hidden min-h-screen bg-[#080c10]">
      {/* Stadium atmosphere background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#00e5ff15,transparent_50%)] pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#00e5ff]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#00ff88]/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center text-center mb-12"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#080c10] to-slate-800 p-0.5 shadow-2xl shadow-[#00e5ff]/20 mb-6 border border-[#00e5ff]/30 flex items-center justify-center"
        >
          <span className="text-5xl">🏏</span>
        </motion.div>

        <h1 className="font-bebas text-6xl tracking-wider text-white mb-2">
          CRICKET<span className="text-[#00e5ff]">PULSE</span>
        </h1>
        <p className="text-slate-400 text-base max-w-xs mx-auto">
          Your live second screen & ball-by-ball prediction engine.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10 flex flex-col gap-4 w-full max-w-sm mx-auto"
      >
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-xl bg-[#ff3366]/10 border border-[#ff3366]/30 text-[#ff3366] text-sm text-center font-medium"
          >
            {error}
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGuestSignIn}
          disabled={loading !== null}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#00e5ff] to-[#00ff88] text-black font-extrabold text-base flex items-center justify-center gap-2 shadow-xl shadow-[#00e5ff]/20 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading === "guest" ? (
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Watch as Guest</span>
              <span className="text-xl">⚡</span>
            </>
          )}
        </motion.button>

        <div className="flex items-center gap-3 my-2 text-slate-600 text-sm">
          <div className="flex-1 h-px bg-slate-800" />
          <span>STADIUM ACCESS</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm text-center">
          <p className="text-xs text-slate-400 leading-relaxed">
            By entering, you join live synced commentary, ball tracking, and the prediction leaderboard.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
