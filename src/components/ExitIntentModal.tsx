"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/context/StoreContext";
import { CloseCircle, TicketDiscount, Sparkles, ShoppingBag, ArrowRight, Gift } from "reicon-react";

export default function ExitIntentModal() {
  const { cartCount, applyCoupon, openCart, showToast } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Only show if not previously dismissed in this session
    try {
      if (sessionStorage.getItem("km_exit_intent_dismissed")) {
        return;
      }
    } catch {
      // ignore
    }

    // Trigger 1: Desktop mouse leaving the window upwards
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 15) {
        triggerModal();
      }
    };

    // Trigger 2: Inactivity timer after 45s if user has items in cart
    const timer = setTimeout(() => {
      if (cartCount > 0) {
        triggerModal();
      }
    }, 45000);

    const triggerModal = () => {
      try {
        if (sessionStorage.getItem("km_exit_intent_dismissed")) return;
        sessionStorage.setItem("km_exit_intent_dismissed", "true");
      } catch {
        // ignore
      }
      setIsOpen(true);
    };

    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(timer);
    };
  }, [cartCount]);

  const handleClaim = () => {
    applyCoupon("MOMFIRST");
    setIsOpen(false);
    openCart();
    showToast("Voucher MOMFIRST applied! ₹50 deducted from your cart. 🍼");
  };

  const handleCopyCode = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText("MOMFIRST");
      setCopied(true);
      showToast("Coupon MOMFIRST copied to clipboard! 📋");
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleDismiss = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={handleDismiss}
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      {/* Modal Card */}
      <div className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl border border-[#eddcd1] overflow-hidden z-10 animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 z-20 text-[#6b5850]/70 hover:text-[#2b1f1a] p-1.5 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
          aria-label="Close discount modal"
        >
          <CloseCircle size={22} weight="Outline" />
        </button>

        {/* Top Header Banner */}
        <div className="bg-[#fdedeb] p-6 text-center border-b border-[#f5c7c1]/60 relative">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#e06b5b] text-white flex items-center justify-center shadow-md shadow-[#e06b5b]/25">
            <Gift size={28} weight="Filled" />
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-widest text-[#e06b5b] bg-white px-3 py-1 rounded-full border border-[#f5c7c1] shadow-2xs">
            <Sparkles size={12} weight="Filled" /> Mom Special Gift
          </span>
          <h3 className="font-bold text-xl sm:text-2xl text-[#2b1f1a] mt-2">
            Wait Supermom! Don&apos;t Leave Empty Handed 🍼
          </h3>
          <p className="text-xs text-[#6b5850] mt-1 max-w-xs mx-auto">
            Take an extra <strong>Flat ₹50 OFF</strong> on your baby care order before stock sells out today!
          </p>
        </div>

        {/* Voucher & Action */}
        <div className="p-6 bg-[#fdfbf7] space-y-4">
          {/* Coupon Display Box */}
          <div className="bg-white p-3.5 rounded-2xl border-2 border-dashed border-[#e06b5b]/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#fdedeb] text-[#e06b5b] flex items-center justify-center shrink-0">
                <TicketDiscount size={18} weight="Filled" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#6b5850]/80 tracking-wider">
                  Promo Code
                </span>
                <p className="text-sm font-space font-extrabold text-[#2b1f1a] tracking-wider">
                  MOMFIRST
                </p>
              </div>
            </div>
            <button
              onClick={handleCopyCode}
              className="text-xs font-bold text-[#e06b5b] hover:text-[#c95444] px-3 py-1.5 rounded-lg border border-[#f5c7c1] hover:bg-[#fdedeb] transition-colors cursor-pointer"
            >
              {copied ? "Copied! ✓" : "Copy Code"}
            </button>
          </div>

          <div className="space-y-1.5 text-xs text-[#6b5850]">
            <p className="flex items-center gap-1.5">
              <span className="text-[#4f775d] font-bold">✓</span> Valid on all orders across India
            </p>
            <p className="flex items-center gap-1.5">
              <span className="text-[#4f775d] font-bold">✓</span> Free Cash on Delivery (COD) Available
            </p>
            <p className="flex items-center gap-1.5">
              <span className="text-[#4f775d] font-bold">✓</span> Same-Day Express Dispatch Guarantee
            </p>
          </div>

          {/* Primary CTA */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleClaim}
              className="w-full py-3.5 bg-[#e06b5b] hover:bg-[#c95444] active:scale-[0.98] text-white font-bold text-sm rounded-2xl shadow-lg shadow-[#e06b5b]/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingBag size={18} weight="Filled" />
              <span>Claim ₹50 Off &amp; View Cart</span>
              <ArrowRight size={16} weight="Filled" />
            </button>

            <button
              onClick={handleDismiss}
              className="w-full py-2 text-center text-xs font-semibold text-[#6b5850]/70 hover:text-[#2b1f1a] transition-colors cursor-pointer"
            >
              No thanks, I will pay full price
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
