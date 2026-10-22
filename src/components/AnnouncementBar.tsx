"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Heart, Globe, Sparkles } from "reicon-react";
import { useStore } from "@/context/StoreContext";

const ANNOUNCEMENTS = [
  { text: "🍼 Gentle Baby Care & Montessori Play", subtext: "Quality-tested, gentle, and 100% BPA-free essentials", link: "/shop" },
  { text: "🌿 100% Baby-Safe & BPA-Free Materials", subtext: "Smooth child-safe edges & non-toxic finishes", link: "/shop" },
  { text: "⚡ Extra ₹50 Instant Discount on UPI Payments", subtext: "Zero COD fees + priority dispatch to your doorstep", link: "/shop" },
  { text: "🛡️ Cash on Delivery (COD) Pan-India", subtext: "Easy 7-day doorstep replacement guarantee", link: "/policies/refund-policy" },
];

export default function AnnouncementBar() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const { wishlist } = useStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const item = ANNOUNCEMENTS[currentIdx];

  return (
    <div className="bg-gradient-to-r from-[#2c1e19] via-[#3a2720] to-[#2c1e19] text-[#fef3ee] text-xs py-2 px-4 transition-colors duration-300 border-b border-white/10">
      <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-4">
        {/* Left / Center Rotating Announcement */}
        <div className="flex-1 flex items-center justify-center sm:justify-start gap-3">
          <Link
            href={item.link}
            className="inline-flex items-center gap-2 group text-white font-medium hover:text-[#fed7d0] transition-colors"
          >
            <span className="font-semibold text-[#fed7d0] inline-flex items-center gap-1.5">
              <Sparkles size={14} weight="Filled" className="text-[#e06b5b]" />
              {item.text}
            </span>
            <span className="opacity-30 hidden md:inline">|</span>
            <span className="opacity-90 hidden md:inline text-xs text-[#fbeae5]">{item.subtext}</span>
            <ArrowRight size={13} weight="Outline" className="inline-block shrink-0 text-[#e06b5b] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Right Info: Region & Wishlist */}
        <div className="hidden sm:flex items-center gap-4 text-xs text-[#eaf1ff]/80">
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
            <Globe size={14} weight="Outline" />
            <span className="font-space font-medium text-[11px]">IN / ₹ (INR)</span>
          </div>

          <span className="opacity-30">•</span>

          <Link href="/track-order" className="hover:text-white transition-colors text-[11px] font-medium">
            Track Order
          </Link>

          <span className="opacity-30">•</span>

          <Link href="/about" className="hover:text-white transition-colors text-[11px]">
            About Us
          </Link>

          <span className="opacity-30">•</span>

          <Link href="/contact" className="hover:text-white transition-colors text-[11px]">
            Contact
          </Link>

          <span className="opacity-30">•</span>

          <Link
            href="/shop?filter=wishlist"
            className="hover:text-white flex items-center gap-1.5 transition-colors text-[11px]"
          >
            <Heart
              size={14}
              weight={wishlist.length > 0 ? "Filled" : "Outline"}
              className={wishlist.length > 0 ? "text-rose-400" : ""}
            />
            <span>Wishlist ({wishlist.length})</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
