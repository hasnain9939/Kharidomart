"use client";

import React, { useState } from "react";
import Link from "next/link";
import KharidoMartLogo from "@/components/KharidoMartLogo";
import { useStore } from "@/context/StoreContext";
import {
  TruckFast,
  ShieldCheck,
  Lock,
  ArrowRight,
  Heart,
} from "reicon-react";

export default function Footer() {
  const { showToast } = useStore();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      showToast("Please enter a valid email address.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || "Subscription failed. Please try again.", "warning");
        return;
      }
      showToast(data.message || `🎉 Welcome! Use coupon code ${data.code} for 10% off.`);
      setEmail("");
    } catch {
      showToast("Unable to subscribe right now. Please try again later.", "warning");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="w-full bg-[#140e0b] border-t border-white/[0.08] text-stone-300">
      {/* 1. Newsletter & VIP Parent Community */}
      <div className="bg-[#1c1410] border-b border-white/[0.08] py-10 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1360px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e06b5b]/15 border border-[#e06b5b]/30 text-xs font-bold uppercase tracking-wider text-[#f5a195]">
              <span className="w-2 h-2 rounded-full bg-[#e06b5b] animate-ping" />
              <span>Join 25,000+ Caring Parents</span>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              Get 10% Off Your First Order + Weekly Parenting Tips
            </h3>
            <p className="text-xs sm:text-sm text-stone-300/85 leading-relaxed">
              Gentle bedtime routines, screen-free discovery ideas, and secret subscriber-only VIP flash deals on baby essentials.
            </p>
          </div>

          <div className="w-full max-w-md space-y-2.5">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  required
                  disabled={isSubmitting}
                  className="w-full bg-white/[0.07] text-white placeholder:text-stone-400 text-xs sm:text-sm px-4 py-3 rounded-xl border border-white/[0.12] focus:outline-none focus:border-[#e06b5b] focus:bg-white/[0.1] transition-all shadow-inner disabled:opacity-60"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#e06b5b] hover:bg-[#c95444] active:scale-[0.98] disabled:opacity-60 text-white font-bold px-6 py-3 rounded-xl transition-all text-xs uppercase tracking-wider shrink-0 shadow-md flex items-center justify-center gap-1.5"
              >
                <span>{isSubmitting ? "Subscribing..." : "Get 10% Off"}</span>
                <ArrowRight size={14} weight="Outline" />
              </button>
            </form>
            <p className="text-[11px] text-stone-400 flex items-center justify-center sm:justify-start gap-1.5">
              <Lock size={12} weight="Outline" className="text-stone-400 shrink-0" />
              <span>We respect your privacy. No spam ever. Unsubscribe anytime with 1 click.</span>
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Directory (4-Column Balanced Grid) */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/[0.08]">
          {/* Brand Info (Col 1: 4 cols on lg) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block py-1" aria-label="KharidoMart Home">
              <KharidoMartLogo inverted className="h-8 sm:h-9 w-auto hover:opacity-90 transition-opacity" />
            </Link>

            <p className="text-xs sm:text-sm font-semibold text-[#f5a195] flex items-center gap-1.5">
              <Heart size={15} weight="Filled" className="text-[#e06b5b] shrink-0" />
              <span>Gentle Care for Little Ones. Peace of Mind for Moms.</span>
            </p>

            <p className="text-xs sm:text-sm text-stone-300/80 leading-relaxed">
              India&apos;s curated baby care destination. Baby-safe grooming kits, screen-free Montessori discovery tools, and nourishing feeding essentials crafted for peaceful parenting.
            </p>

            <div className="pt-1 flex flex-wrap gap-2 text-[11px]">
              <span className="px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/[0.08] text-stone-300 font-medium">
                🌱 BPA-Free Materials
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/[0.08] text-stone-300 font-medium">
                🍼 Food-Grade Safe
              </span>
            </div>
          </div>

          {/* Shop by Milestone (Col 2: 3 cols on lg) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Shop Milestones
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-300">
              <li>
                <Link href="/collections/mom-baby" className="hover:text-white transition-colors flex items-center justify-between group">
                  <span>Mom &amp; Baby (0–12M)</span>
                  <span className="text-stone-500 group-hover:text-stone-300 text-xs">→</span>
                </Link>
              </li>
              <li>
                <Link href="/collections/fun-clever-finds" className="hover:text-white transition-colors flex items-center justify-between group">
                  <span>Montessori (1–4Y)</span>
                  <span className="text-stone-500 group-hover:text-stone-300 text-xs">→</span>
                </Link>
              </li>
              <li>
                <Link href="/collections/smart-gadgets" className="hover:text-white transition-colors flex items-center justify-between group">
                  <span>Nursery Lamps</span>
                  <span className="text-stone-500 group-hover:text-stone-300 text-xs">→</span>
                </Link>
              </li>
              <li>
                <Link href="/collections/home-kitchen" className="hover:text-white transition-colors flex items-center justify-between group">
                  <span>Feeding Sets</span>
                  <span className="text-stone-500 group-hover:text-stone-300 text-xs">→</span>
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=deals" className="hover:text-white font-semibold text-[#f5a195] transition-colors flex items-center justify-between group">
                  <span>Mom Deals 🔥</span>
                  <span className="text-[#f5a195] text-xs">HOT</span>
                </Link>
              </li>
              <li className="pt-1">
                <Link href="/shop" className="hover:text-white text-stone-400 hover:underline transition-colors text-xs inline-block">
                  All Products →
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care (Col 3: 3 cols on lg) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-300">
              <li>
                <Link href="/track-order" className="hover:text-white font-bold text-[#f5a195] transition-colors flex items-center gap-1.5">
                  <span>Track Order</span>
                  <span className="px-1.5 py-0.5 text-[9px] rounded bg-[#e06b5b]/20 text-[#f5a195] font-semibold">LIVE</span>
                </Link>
              </li>
              <li>
                <Link href="/policies/refund-policy" className="hover:text-white transition-colors">
                  24h Replacement
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping-policy" className="hover:text-white transition-colors">
                  Shipping Guidelines
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Help Desk &amp; Contact
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Our Mission &amp; Safety
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies & Trust (Col 4: 2 cols on lg) */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Policies &amp; Trust
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-stone-300">
              <li>
                <Link href="/policies/refund-policy" className="hover:text-white transition-colors">
                  Replacement Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping-policy" className="hover:text-white transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy-policy" className="hover:text-white transition-colors">
                  Privacy (DPDPA 2023)
                </Link>
              </li>
              <li>
                <Link href="/policies/terms-of-service" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/policies/legal-notice" className="hover:text-white font-semibold transition-colors">
                  Statutory Disclosures
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 3. Accepted Payment Methods & Security Compliance Bar */}
        <div className="py-8 border-b border-white/[0.08] flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-300 shrink-0">
              100% Secure Payments:
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {/* UPI Badge */}
              <div className="h-7 px-2.5 rounded bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-[11px] font-bold text-white tracking-wider">
                <span className="text-[#097939]">U</span><span className="text-[#ea7924]">P</span><span className="text-[#0083ca]">I</span>
                <span className="text-[9px] text-stone-400 ml-1.5 font-normal">GPay · PhonePe · Paytm</span>
              </div>
              {/* Visa */}
              <div className="h-7 px-2.5 rounded bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-xs font-extrabold italic text-blue-400 tracking-wider">
                VISA
              </div>
              {/* Mastercard */}
              <div className="h-7 px-2.5 rounded bg-white/[0.08] border border-white/[0.12] flex items-center justify-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EB001B] inline-block -mr-1.5"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#F79E1B]/90 inline-block"></span>
                <span className="text-[10px] font-bold text-white ml-1">Mastercard</span>
              </div>
              {/* RuPay */}
              <div className="h-7 px-2.5 rounded bg-white/[0.08] border border-white/[0.12] flex items-center justify-center text-[11px] font-extrabold tracking-wider">
                <span className="text-[#1A3E92]">Ru</span><span className="text-[#F15A24]">Pay</span>
              </div>
            </div>
          </div>

          {/* Security Certifications */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-stone-300">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Lock size={14} weight="Filled" />
              <span className="font-semibold text-stone-200">256-Bit SSL Encrypted</span>
            </div>
            <span className="text-stone-600 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck size={14} weight="Filled" />
              <span className="font-semibold text-stone-200">Razorpay Verified</span>
            </div>
            <span className="text-stone-600 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5 text-[#f5a195]">
              <TruckFast size={14} weight="Filled" />
              <span className="font-semibold text-stone-200">100% Insured Transit</span>
            </div>
          </div>
        </div>

        {/* 4. Bottom Copyright & Quick Legal Strip */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div className="text-center md:text-left space-y-0.5">
            <p className="font-bold text-stone-200">
              © 2026 Kharido Mart (kharidomart.com). All rights reserved.
            </p>
            <p className="text-stone-400/80 text-[11px]">
              India&apos;s trusted destination for gentle baby care, screen-free learning, and peaceful parenting. Made with ❤️ in India.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-stone-400">
            <Link href="/policies/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/policies/terms-of-service" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/policies/refund-policy" className="hover:text-white transition-colors">
              Replacement Policy
            </Link>
            <span>•</span>
            <Link href="/policies/shipping-policy" className="hover:text-white transition-colors">
              Shipping Guidelines
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
