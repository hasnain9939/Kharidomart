import React from "react";

export default function Loading() {
  return (
    <div className="w-full min-h-[70vh] bg-[#fdfbf7] flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-md w-full mx-auto flex flex-col items-center text-center space-y-6">
        {/* Soft pulse icon badge */}
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-[#fbe8e4] flex items-center justify-center animate-pulse">
            <span className="text-2xl animate-bounce">🧸</span>
          </div>
          <div className="absolute -inset-2 rounded-3xl border border-[#e06b5b]/20 animate-ping pointer-events-none" />
        </div>

        {/* Text cues */}
        <div className="space-y-2">
          <h2 className="text-xl font-black text-[#2b1f1a] tracking-tight">
            Curating gentle baby finds...
          </h2>
          <p className="text-xs text-[#6b584f]/80 max-w-xs mx-auto">
            Checking latest inventory, certified safety standards, and doorstep COD availability.
          </p>
        </div>

        {/* Skeleton progress cards */}
        <div className="w-full space-y-3 pt-2">
          <div className="h-2.5 w-full bg-[#ebdcd3]/50 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#e06b5b] via-[#4f775d] to-[#e06b5b] rounded-full w-2/3 animate-[shimmer_1.5s_infinite]" />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="h-32 rounded-2xl bg-[#ebdcd3]/30 animate-pulse border border-[#ebdcd3]/40 p-3 flex flex-col justify-between">
              <div className="w-8 h-8 rounded-lg bg-[#ebdcd3]/60" />
              <div className="space-y-1.5">
                <div className="h-3 bg-[#ebdcd3]/60 rounded w-4/5" />
                <div className="h-2.5 bg-[#ebdcd3]/40 rounded w-1/2" />
              </div>
            </div>
            <div className="h-32 rounded-2xl bg-[#ebdcd3]/30 animate-pulse border border-[#ebdcd3]/40 p-3 flex flex-col justify-between">
              <div className="w-8 h-8 rounded-lg bg-[#ebdcd3]/60" />
              <div className="space-y-1.5">
                <div className="h-3 bg-[#ebdcd3]/60 rounded w-4/5" />
                <div className="h-2.5 bg-[#ebdcd3]/40 rounded w-1/2" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
