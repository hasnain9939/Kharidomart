import React from "react";

export default function Loading() {
  return (
    <div
      className="w-full h-1 bg-transparent overflow-hidden pointer-events-none fixed top-0 left-0 right-0 z-50"
      role="status"
      aria-label="Loading content"
    >
      <div className="h-full w-1/3 bg-[#e06b5b] rounded-full animate-pulse" />
    </div>
  );
}
