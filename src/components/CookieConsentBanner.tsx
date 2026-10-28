"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "reicon-react";

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only check after hydration
    try {
      const consent = localStorage.getItem("kharidomart_cookie_consent");
      if (!consent) {
        // Small delay to prevent layout jump on immediate load
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Local storage disabled or error
    }
  }, []);

  const handleConsent = (level: "all" | "essential") => {
    try {
      localStorage.setItem("kharidomart_cookie_consent", level);
      localStorage.setItem("kharidomart_cookie_consent_date", new Date().toISOString());
    } catch {
      // ignore
    }
    setIsVisible(false);

    if (typeof window !== "undefined") {
      if (level === "all") {
        if ((window as any).gtag) {
          (window as any).gtag("consent", "update", {
            analytics_storage: "granted",
            ad_storage: "granted",
          });
        }
        if (typeof (window as any).fbq === "function") {
          (window as any).fbq("consent", "grant");
        }
      } else {
        if (typeof (window as any).fbq === "function") {
          (window as any).fbq("consent", "revoke");
        }
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#ebdcd3] shadow-[0_16px_36px_rgba(43,31,26,0.12)] space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-[#2b1f1a]">
            <div className="w-8 h-8 rounded-lg bg-[#fbe8e4] text-[#e06b5b] flex items-center justify-center shrink-0">
              <ShieldCheck weight="Filled" className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-black tracking-tight">Your Privacy & Cookie Choices</h3>
          </div>
          <button
            onClick={() => handleConsent("essential")}
            aria-label="Close cookie banner"
            className="text-[#6b584f]/60 hover:text-[#2b1f1a] transition-colors p-1"
          >
            <X weight="Outline" className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[#6b584f] leading-relaxed">
          We use essential cookies to remember your bag and deliver a smooth Cash on Delivery checkout.
          With your permission, we also use anonymous analytics to refine our mom & baby collections.
          Read our{" "}
          <Link
            href="/policies/privacy-policy"
            className="text-[#e06b5b] underline font-semibold hover:text-[#c25445]"
          >
            Privacy Policy
          </Link>
          .
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleConsent("all")}
            className="flex-1 bg-[#e06b5b] hover:bg-[#c25445] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm active:scale-[0.98]"
          >
            Accept All
          </button>
          <button
            type="button"
            onClick={() => handleConsent("essential")}
            className="flex-1 bg-[#fcf9f5] hover:bg-[#f6eee9] text-[#2b1f1a] border border-[#ebdcd3] text-xs font-bold py-2.5 px-4 rounded-xl transition-all active:scale-[0.98]"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
}
