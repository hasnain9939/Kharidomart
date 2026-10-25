"use client";

import React, { useState } from "react";
import Link from "next/link";
import KharidoMartLogo from "@/components/KharidoMartLogo";
import { useStore } from "@/context/StoreContext";
import { TruckFast, ShieldCheck, ArrowRight, Heart } from "reicon-react";

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
    <footer className="w-full bg-white border-t border-[#eddcd1]">
      {/* 1. Newsletter & Value Hook Section */}
      <div className="bg-[#fbf7f0] border-b border-[#eddcd1] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1360px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e06b5b]">
              Kharido Mart Parent Community
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#2b1f1a] tracking-tight">
              {/* TODO(owner): Replace with audited subscriber count once verified */}
              Join Our Community of Caring Parents Getting Weekly Parenting Tips &amp; VIP Flash Deals
            </h3>
            <p className="text-xs sm:text-sm text-[#6b5850]">
              Gentle bedtime routines, screen-free activity ideas, and exclusive secret discounts on baby-safe essentials.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full max-w-md flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address..."
              required
              disabled={isSubmitting}
              className="flex-1 bg-white text-[#2b1f1a] placeholder:text-[#6b5850]/60 text-xs sm:text-sm px-4 py-3 rounded-xl border border-[#eddcd1] focus:outline-none focus:border-[#e06b5b] transition-colors shadow-2xs disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#e06b5b] hover:bg-[#c95444] active:scale-95 disabled:opacity-60 text-white font-bold px-6 py-3 rounded-xl transition-all text-xs uppercase tracking-wider shrink-0 shadow-xs"
            >
              {isSubmitting ? "Subscribing..." : "Get 10% Off"}
            </button>
          </form>
        </div>
      </div>

      {/* 2. Main Footer Directory */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#eddcd1]">
          {/* Brand Bio */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block py-1" aria-label="KharidoMart Home">
              <KharidoMartLogo className="h-8 sm:h-9 w-auto hover:opacity-90 transition-opacity" />
            </Link>

            <p className="text-xs sm:text-sm font-semibold text-[#e06b5b] flex items-center gap-1.5">
              <Heart size={15} weight="Filled" className="text-[#e06b5b]" />
              <span>Gentle Care for Little Ones. Peace of Mind for Moms.</span>
            </p>

            <p className="text-xs sm:text-sm text-[#6b5850] leading-relaxed max-w-sm">
              Carefully vetted baby-safe grooming, screen-free Montessori discovery tools, and nourishing mealtime essentials designed to make daily parenting calm and joyful.
            </p>

            <div className="pt-2 text-xs text-[#6b5850] space-y-2">
              <p className="text-xs text-[#6b5850] leading-relaxed">
                Need help with your baby care essentials or order?
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fbf7f0] text-[#2b1f1a] hover:bg-[#f5ece0] text-xs font-bold rounded-lg border border-[#eddcd1] transition-colors"
                >
                  <span>Customer Support</span>
                  <ArrowRight size={13} weight="Outline" />
                </Link>
                <Link
                  href="/track-order"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fdedeb] text-[#c95444] hover:bg-[#fbdcd7] text-xs font-bold rounded-lg border border-[#f5c7c1] transition-colors"
                >
                  <span>Track Your Order</span>
                  <ArrowRight size={13} weight="Outline" />
                </Link>
              </div>
            </div>
          </div>

          {/* Explore Collections */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2b1f1a]">
              Shop by Milestone
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#6b5850]">
              <li>
                <Link href="/collections/mom-baby" className="hover:text-[#e06b5b] transition-colors">
                  Mom &amp; Newborn Care (0–12M)
                </Link>
              </li>
              <li>
                <Link href="/collections/fun-clever-finds" className="hover:text-[#e06b5b] transition-colors">
                  Screen-Free Montessori (1–4Y)
                </Link>
              </li>
              <li>
                <Link href="/collections/smart-gadgets" className="hover:text-[#e06b5b] transition-colors">
                  Nursery &amp; Bedside Lamps
                </Link>
              </li>
              <li>
                <Link href="/collections/home-kitchen" className="hover:text-[#e06b5b] transition-colors">
                  Healthy Baby Purees &amp; Feeding
                </Link>
              </li>
              <li>
                <Link href="/shop?filter=deals" className="hover:text-[#e06b5b] font-semibold text-[#e06b5b] transition-colors">
                  Mom Favorites 🔥
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2b1f1a]">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#6b5850]">
              <li>
                <Link href="/track-order" className="hover:text-[#e06b5b] font-bold text-[#e06b5b] transition-colors">
                  📦 Track Your Order
                </Link>
              </li>
              <li>
                <a
                  href="https://wa.me/918540017572?text=Hi%20Kharido%20Mart%20Support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#25D366] transition-colors inline-flex items-center gap-1"
                >
                  <span>💬 WhatsApp: +91 85400 17572</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:kharidomartsupport@gmail.com"
                  className="hover:text-[#e06b5b] transition-colors inline-flex items-center gap-1 truncate max-w-full"
                >
                  <span>✉️ kharidomartsupport@gmail.com</span>
                </a>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#e06b5b] transition-colors">
                  Help Center &amp; Contact Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#e06b5b] transition-colors">
                  About Our Mission
                </Link>
              </li>
            </ul>
          </div>

          {/* Our Policies & Legals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2b1f1a]">
              Policies &amp; Trust
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-[#6b5850]">
              <li>
                <Link href="/policies/refund-policy" className="hover:text-[#e06b5b] transition-colors">
                  24-Hour Replacement Policy
                </Link>
              </li>
              <li>
                <Link href="/policies/shipping-policy" className="hover:text-[#e06b5b] transition-colors">
                  Shipping &amp; COD Guidelines
                </Link>
              </li>
              <li>
                <Link href="/policies/privacy-policy" className="hover:text-[#e06b5b] transition-colors">
                  Privacy Policy (DPDPA 2023)
                </Link>
              </li>
              <li>
                <Link href="/policies/terms-of-service" className="hover:text-[#e06b5b] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/policies/legal-notice" className="hover:text-[#e06b5b] font-semibold transition-colors">
                  Statutory Legal Disclosures
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Statutory E-Commerce Compliance Block (Consumer Protection E-Commerce Rules, 2020) */}
        <div className="mt-8 pt-6 border-t border-[#eddcd1] text-[11px] text-[#6b5850] bg-[#fbf7f0]/60 p-4 rounded-xl space-y-2">
          <p className="font-bold text-[#2b1f1a] uppercase tracking-wider text-[10px]">
            Statutory E-Commerce Compliance &amp; Consumer Grievance
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <span className="font-semibold text-[#2b1f1a]">Seller / Legal Entity:</span>
              <p className="text-[#6b5850]">
                {/* TODO(owner): Update legal business name in .env or settings */}
                {process.env.NEXT_PUBLIC_SELLER_LEGAL_NAME || "Kharido Mart Retail (OPC) Private Limited"}
              </p>
            </div>
            <div>
              <span className="font-semibold text-[#2b1f1a]">GSTIN:</span>
              <p className="font-mono text-[#6b5850]">
                {/* TODO(owner): Provide registered GSTIN */}
                {process.env.NEXT_PUBLIC_SELLER_GSTIN || "07AAAAA0000A1Z5 (Pending Verification)"}
              </p>
            </div>
            <div>
              <span className="font-semibold text-[#2b1f1a]">Registered Address:</span>
              <p className="text-[#6b5850]">
                {/* TODO(owner): Update registered business address */}
                {process.env.NEXT_PUBLIC_SELLER_ADDRESS || "New Delhi, Delhi - 110001, India"}
              </p>
            </div>
            <div>
              <span className="font-semibold text-[#2b1f1a]">Grievance Officer:</span>
              <p className="text-[#6b5850]">
                {/* TODO(owner): Update grievance officer name and direct contact */}
                {process.env.NEXT_PUBLIC_GRIEVANCE_OFFICER_NAME || "Nodal Grievance Officer"}<br />
                Email: {process.env.NEXT_PUBLIC_GRIEVANCE_OFFICER_EMAIL || "kharidomartsupport@gmail.com"}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#6b5850]">
          <div className="flex items-center gap-6 font-medium">
            <div className="flex items-center gap-1.5 text-[#4f775d]">
              <ShieldCheck size={16} weight="Filled" />
              <span>BPA-Free Materials &amp; Child-Safe Design</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#e06b5b]">
              <TruckFast size={16} weight="Filled" />
              <span>BlueDart &amp; Delhivery Fast Dispatch</span>
            </div>
          </div>

          <div className="text-center md:text-right text-[11px] space-y-0.5">
            <p className="font-bold text-[#2b1f1a]">
              © 2026 Kharido Mart. All rights reserved.
            </p>
            <p className="text-[#6b5850]/80">
              India&apos;s trusted destination for gentle baby care, screen-free learning, and peaceful parenting.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
