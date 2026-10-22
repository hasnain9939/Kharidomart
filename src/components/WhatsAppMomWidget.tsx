"use client";

import React, { useState } from "react";
import { MessageDots, CloseCircle, CheckCircle, ShieldCheck, ArrowRight, Sparkles } from "reicon-react";

export default function WhatsAppMomWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);

  const quickFaqs = [
    {
      q: "Is this 100% safe for newborns & infants?",
      a: "Yes! Every single toy, groomer, and nursery item at Kharido Mart is BPA-free, made with food-grade silicone or non-toxic materials, and certified baby-safe.",
    },
    {
      q: "How does Cash on Delivery (COD) work?",
      a: "You simply pay cash to the courier partner upon doorstep delivery. No advance payment required! We also accept UPI at delivery.",
    },
    {
      q: "What is your 7-Day Replacement Policy?",
      a: "If any item arrives damaged or defective, we provide an immediate free doorstep pickup and fresh unit replacement within 7 days of delivery.",
    },
    {
      q: "How fast is express dispatch?",
      a: "Orders placed before 5:00 PM are handed over to express air couriers (Bluedart / Delhivery) the very same day. Delivery takes 2-4 business days across India.",
    },
  ];

  return (
    <>
      {/* Floating Mom Support Launcher (Compact 48px FAB on mobile right, pill on desktop left) */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:left-6 md:right-auto z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="w-12 h-12 md:w-auto md:h-auto md:px-4 md:py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-lg shadow-[#25D366]/25 transition-all duration-200 active:scale-[0.96] cursor-pointer group flex items-center justify-center gap-2.5"
            aria-label="Open Mom Care Support"
          >
            {/* Pulsing online indicator */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
            </span>

            <MessageDots size={20} weight="Filled" />

            <span className="hidden md:inline text-xs font-bold font-sans tracking-wide">
              Mom Support <span className="opacity-80 font-normal">• Online</span>
            </span>
          </button>
        )}
      </div>

      {/* Support Modal with Dimmed Backdrop for Mobile & Desktop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-[380px] bg-white rounded-3xl shadow-2xl border border-[#eddcd1] overflow-hidden animate-in slide-in-from-bottom-6 duration-300 mb-16 sm:mb-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#20bd5a] to-[#25D366] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <ShieldCheck size={20} weight="Filled" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">Mom Concierge Desk</h3>
                  <p className="text-[11px] text-white/90 flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    Online • Typical reply &lt; 5 mins
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close Mom Support"
              >
                <CloseCircle size={22} weight="Outline" />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 bg-[#fdfbf7] space-y-3 max-h-[380px] overflow-y-auto">
              <div className="bg-white p-3 rounded-2xl border border-[#eddcd1] shadow-2xs">
                <p className="text-xs text-[#2b1f1a] font-medium leading-relaxed">
                  👋 <strong>Namaste Supermom!</strong> Have a question about baby sizing, nursery safety, or COD delivery to your city? Tap any query below for instant answers:
                </p>
              </div>

              {/* Quick FAQ Accordeon */}
              <div className="space-y-2">
                {quickFaqs.map((faq, index) => {
                  const isExpanded = selectedFaq === index;
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-2xl border border-[#eddcd1] overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => setSelectedFaq(isExpanded ? null : index)}
                        className="w-full p-3 text-left flex items-center justify-between gap-2 cursor-pointer hover:bg-[#fbf7f0] transition-colors"
                      >
                        <span className="text-xs font-bold text-[#2b1f1a] flex items-center gap-1.5">
                          <Sparkles size={13} weight="Filled" className="text-[#e06b5b] shrink-0" />
                          <span>{faq.q}</span>
                        </span>
                        <span className="text-xs font-bold text-[#6b5850]">
                          {isExpanded ? "−" : "+"}
                        </span>
                      </button>
                      {isExpanded && (
                        <div className="px-3 pb-3 pt-1 text-xs text-[#6b5850] bg-[#fbf7f0]/60 border-t border-[#eddcd1]/40 leading-relaxed animate-in fade-in duration-150">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Direct Reassurance Note */}
              <div className="bg-[#eaf3ed] p-3 rounded-2xl border border-[#d2e7d7] text-[11px] text-[#2c4a35] space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <CheckCircle size={14} weight="Filled" /> 100% Secure Shopping
                </p>
                <p className="text-[#2c4a35]/80">
                  Every order includes automated SMS/WhatsApp dispatch alerts with live tracking links.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-[#fbf7f0] border-t border-[#eddcd1] text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-2 bg-[#2b1f1a] hover:bg-[#3d2c25] active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
