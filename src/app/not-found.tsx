import React from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Search, Sparkles, Heart } from "reicon-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found | Kharido Mart",
  description: "The page you are looking for cannot be found. Explore our baby-safe essentials, Montessori learning toys, and parenting bestsellers at Kharido Mart.",
};

export default function NotFound() {
  return (
    <div className="min-h-[75vh] w-full bg-[#fdfbf7] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full text-center space-y-8 bg-white p-8 sm:p-12 rounded-3xl border border-[#eddcd1] shadow-sm">
        {/* Playful Tag & Icon */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-3xl bg-[#fdedeb] text-[#e06b5b] flex items-center justify-center shadow-xs">
            <span className="text-3xl font-black font-space">404</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#eaf3ed] text-[#4f775d] text-xs font-bold uppercase tracking-wider rounded-full border border-[#d2e7d7]">
            <Heart size={14} weight="Filled" />
            <span>Curious Wanderer</span>
          </span>
        </div>

        {/* Headline & Friendly Message */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#2b1f1a] tracking-tight">
            This page wandered off like a curious toddler! 🧸
          </h1>
          <p className="text-sm sm:text-base text-[#6b5850] leading-relaxed max-w-md mx-auto">
            We couldn&apos;t find the exact link you were looking for. It might have been moved, renamed, or is currently taking a peaceful nap.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#e06b5b] hover:bg-[#c95444] active:scale-[0.98] text-white text-sm font-bold rounded-xl shadow-[0_4px_14px_rgba(224,107,91,0.3)] transition-all"
          >
            <ArrowLeft size={16} weight="Outline" />
            <span>Back to Safe Harbor (Home)</span>
          </Link>

          <Link
            href="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#fbf7f0] hover:bg-[#f5ece0] active:scale-[0.98] text-[#2b1f1a] text-sm font-bold rounded-xl border border-[#eddcd1] transition-all"
          >
            <ShoppingBag size={16} weight="Filled" className="text-[#e06b5b]" />
            <span>Explore Bestsellers</span>
          </Link>
        </div>

        {/* Quick Milestone Links for Moms */}
        <div className="pt-6 border-t border-[#eddcd1] space-y-3">
          <p className="text-xs font-bold text-[#2b1f1a] uppercase tracking-wider flex items-center justify-center gap-1.5">
            <Sparkles size={14} weight="Filled" className="text-[#e06b5b]" />
            <span>Popular Mom &amp; Baby Collections</span>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <Link
              href="/collections/mom-baby"
              className="px-3 py-1.5 bg-[#fdfbf7] hover:bg-[#fdedeb] text-[#2b1f1a] hover:text-[#e06b5b] rounded-lg border border-[#eddcd1] transition-colors font-medium"
            >
              Mom &amp; Newborn Care (0–12M)
            </Link>
            <Link
              href="/collections/fun-clever-finds"
              className="px-3 py-1.5 bg-[#fdfbf7] hover:bg-[#eaf3ed] text-[#2b1f1a] hover:text-[#4f775d] rounded-lg border border-[#eddcd1] transition-colors font-medium"
            >
              Screen-Free Montessori (1–4Y)
            </Link>
            <Link
              href="/collections/smart-gadgets"
              className="px-3 py-1.5 bg-[#fdfbf7] hover:bg-[#fbf7f0] text-[#2b1f1a] rounded-lg border border-[#eddcd1] transition-colors font-medium"
            >
              Nursery Night Lamps
            </Link>
            <Link
              href="/track-order"
              className="px-3 py-1.5 bg-[#fdfbf7] hover:bg-[#fbf7f0] text-[#2b1f1a] rounded-lg border border-[#eddcd1] transition-colors font-medium"
            >
              Track an Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
