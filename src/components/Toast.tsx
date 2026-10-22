"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { CloseCircle, ShieldCheck } from "reicon-react";

export default function Toast() {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 border ${
            toast.type === "success"
              ? "bg-emerald-950/90 text-emerald-100 border-emerald-500/30"
              : toast.type === "warning"
              ? "bg-amber-950/90 text-amber-100 border-amber-500/30"
              : "bg-slate-900/90 text-slate-100 border-slate-700/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-emerald-400">
              <ShieldCheck size={20} weight="Filled" />
            </span>
            <p className="text-sm font-medium leading-snug">{toast.message}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-white transition-colors p-1"
            aria-label="Dismiss notification"
          >
            <CloseCircle size={16} weight="Outline" />
          </button>
        </div>
      ))}
    </div>
  );
}
