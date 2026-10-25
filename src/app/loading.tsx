import React from "react";

export default function Loading() {
  return (
    <div
      className="w-full min-h-[calc(100vh-140px)] bg-[#14100e] flex flex-col items-center justify-center relative overflow-hidden"
      role="status"
      aria-label="Loading content"
    >
      {/* Top subtle hairline progress indicator */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10 overflow-hidden">
        <div className="h-full w-1/3 bg-[#e06b5b] rounded-full animate-pulse" />
      </div>

      {/* Hero skeleton placeholder (preserves exact fold height so footer is never visible at top) */}
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 flex flex-col items-center text-center space-y-4 opacity-40">
        <div className="h-5 w-40 bg-white/20 rounded-full animate-pulse" />
        <div className="h-10 sm:h-12 w-3/4 max-w-xl bg-white/20 rounded-2xl animate-pulse" />
        <div className="h-4 w-2/3 max-w-md bg-white/15 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
