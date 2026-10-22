"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  User,
  Lock,
  Eye,
  EyeSlash,
  ArrowRight,
  CheckCircle,
  CloseCircle,
} from "reicon-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!email || !email.includes("@")) {
      setAuthError("Please provide a valid administrator email address.");
      return;
    }
    if (!password) {
      setAuthError("Please enter your administrator password.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          rememberMe,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setAuthError(
          data.error || "Authentication failed. Please verify your administrator email and password."
        );
        setIsLoading(false);
        return;
      }

      setAuthSuccess(true);
      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 500);
    } catch {
      setAuthError("Network error while connecting to authentication service. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#071321] text-[#e2e8f0] relative flex flex-col justify-between selection:bg-[#f97316] selection:text-white font-sans overflow-x-hidden">
      {/* Ambient background glow & subtle radial grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(249,115,22,0.15),rgba(255,255,255,0))] pointer-events-none"></div>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-indigo-500/10 blur-3xl pointer-events-none rounded-full"></div>
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      ></div>

      {/* Top Header */}
      <header className="relative z-20 px-6 py-5 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 group transition-transform active:scale-95"
          title="Return to Customer Storefront"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] flex items-center justify-center font-black text-white text-xl shadow-[0_4px_16px_rgba(249,115,22,0.4)] ring-2 ring-white/10 group-hover:ring-[#f97316]/50 transition-all">
            K
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-white leading-none">
              Kharido Mart
            </span>
            <span className="text-[10px] text-[#ffedd5] font-bold uppercase tracking-wider mt-1">
              Store Administrator Console
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/80">
            <span className="w-2 h-2 rounded-full bg-[#15803d] animate-pulse"></span>
            <span>Database Online</span>
            <span className="text-white/30">•</span>
            <span className="text-white/60">Prisma Engine</span>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors flex items-center gap-1.5"
          >
            <span>Customer Store</span>
            <ArrowRight size={12} weight="Outline" />
          </Link>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="relative rounded-3xl bg-[#0b1c30]/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] p-6 sm:p-9 overflow-hidden">
            {/* Top decorative accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#f97316] to-transparent"></div>

            {/* Header info */}
            <div className="text-center mb-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f97316]/10 border border-[#f97316]/20 text-[#ffedd5] text-xs font-semibold mb-3">
                <ShieldCheck size={14} weight="Filled" className="text-[#f97316]" />
                <span>Restricted Access Console</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Store Administrator Login
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-sm mx-auto">
                Sign in with your verified administrator credentials to manage inventory, fulfill customer orders, and control store settings.
              </p>
            </div>

            {/* Error / Success Banners */}
            {authError && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex items-center gap-2.5">
                <CloseCircle size={16} weight="Filled" className="text-red-400 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {authSuccess && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2.5">
                <CheckCircle size={16} weight="Filled" className="text-emerald-400 shrink-0" />
                <span className="font-semibold">
                  Administrator verified. Redirecting to Management Console...
                </span>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Work Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Administrator Email
                </label>
                <div className="relative">
                  <User
                    size={18}
                    weight="Outline"
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@kharidomart.com"
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Administrator Password
                  </label>
                </div>
                <div className="relative">
                  <Lock
                    size={18}
                    weight="Outline"
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full h-11 pl-10 pr-11 rounded-xl bg-white/5 border border-white/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#f97316] focus:ring-1 focus:ring-[#f97316] transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeSlash size={18} weight="Outline" />
                    ) : (
                      <Eye size={18} weight="Outline" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-white/10 border-white/20 text-[#f97316] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#f97316]"
                  />
                  <span>Keep me logged in for 30 days</span>
                </label>
                <span className="text-[11px] text-slate-400">TLS 1.3 Encrypted</span>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading || authSuccess}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#f97316] to-[#ea580c] hover:from-[#ea580c] hover:to-[#c2410c] text-white font-bold text-sm shadow-[0_4px_20px_rgba(249,115,22,0.35)] transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Verifying Credentials...</span>
                  </>
                ) : authSuccess ? (
                  <>
                    <CheckCircle size={18} weight="Filled" />
                    <span>Access Granted</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Admin Console</span>
                    <ArrowRight size={16} weight="Outline" />
                  </>
                )}
              </button>
            </form>


          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 py-4 px-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Kharido Mart India. All administrative sessions are logged and encrypted.</p>
      </footer>
    </div>
  );
}
