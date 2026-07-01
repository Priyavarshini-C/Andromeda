// =============================================================================
// Andromeda — Split-Panel Auth Shell Layout (Rose Gold Overhaul)
// =============================================================================

import React from "react";
import Link from "next/link";
import { Gem } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 w-full bg-[#FAF6F2] text-charcoal">
      
      {/* ── LEFT PANEL: Starfield & Testimonial (Obsidian Canvas) ── */}
      <div 
        className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 bg-[#0E0A09] relative overflow-hidden text-[#FAF6F2]"
        style={{
          backgroundImage: "radial-gradient(rgba(200,120,64,0.10) 1px, transparent 1px)",
          backgroundSize: "28px 28px"
        }}
      >
        {/* Brand logo */}
        <Link href="/" className="flex items-center gap-2 group w-fit relative z-10">
          <Gem className="h-5 w-5 text-rose group-hover:scale-110 transition-transform" />
          <span className="font-sans font-semibold text-lg text-ivory tracking-wide">
            ANDROMEDA
          </span>
        </Link>

        {/* Center Quote */}
        <div className="my-auto relative z-10 max-w-sm">
          <p className="text-3xl md:text-4xl font-serif italic text-[#FAF6F2] leading-snug font-normal">
            &ldquo;Uncover the optimal value index. Compare *everything* in seconds.&rdquo;
          </p>
          <p className="text-[#E8C99A]/60 text-xs uppercase tracking-widest font-sans mt-4 block">
            — Andromeda Calibration Engine
          </p>
        </div>

        {/* Footer Statistics & Avatars */}
        <div className="relative z-10 border-t border-white/5 pt-8 flex items-center justify-between gap-6">
          <div className="flex flex-col">
            <span className="font-serif italic text-[#FAF6F2] text-2xl">100K+</span>
            <span className="text-[#E8C99A]/50 text-[10px] uppercase tracking-widest mt-1">Calibrated Users</span>
          </div>

          {/* Avatar circles stack */}
          <div className="flex -space-x-3">
            {[1, 2, 3].map((val) => (
              <div 
                key={val} 
                className="h-8 w-8 rounded-full border-2 border-[#8B3A52] bg-ember flex items-center justify-center font-bold text-[9px] text-[#E8C99A]"
              >
                U{val}
              </div>
            ))}
          </div>
        </div>

        {/* Subtle bottom blur */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-rose/5 blur-3xl pointer-events-none" />
      </div>

      {/* ── RIGHT PANEL: Auth Forms (Parchment/Ivory Canvas) ── */}
      <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-8 sm:p-12 lg:p-20 bg-[#FAF6F2]">
        <div className="max-w-md w-full bg-ivory p-8 rounded-xl border border-[#E8D8CE] shadow-luxury-light">
          {children}
        </div>
      </div>

    </div>
  );
}
