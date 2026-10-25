"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Send2,
  CloseCircle,
  Sparkles,
} from "reicon-react";
import { ThinkingOrb } from "thinking-orbs";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  time: string;
  action?: {
    label: string;
    href: string;
    isExternal?: boolean;
  };
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome-1",
    sender: "bot",
    text: "Namaste! 🙏 I'm your Kharido Mart shopping & care concierge.",
    time: "Just now",
  },
  {
    id: "welcome-2",
    sender: "bot",
    text: "How can I help you today? Tap any topic below or ask me about baby safety, COD, express delivery, or doorstep replacements.",
    time: "Just now",
  },
];

const QUICK_CHIPS = [
  { label: "📦 Track My Order", query: "How do I track my order?" },
  { label: "🔄 24h Replacement", query: "What is your replacement policy?" },
  { label: "🚚 Delivery Timeline", query: "How long does delivery take?" },
  { label: "🍼 Baby Safety & Quality", query: "Are your baby toys and feeding sets safe?" },
  { label: "💬 Speak to Human", query: "I want to chat with a human support agent" },
];

export default function SupportChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const messageCounterRef = useRef(10);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isThinking]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const generateBotReply = (query: string): { text: string; action?: Message["action"] } => {
    const q = query.toLowerCase().trim();

    // 1. Order Tracking
    if (
      q.includes("track") ||
      q.includes("where is my order") ||
      q.includes("status") ||
      q.includes("courier") ||
      q.includes("shipment") ||
      q.includes("bluedart") ||
      q.includes("delhivery")
    ) {
      return {
        text: "You can track your parcel live anytime using your Order ID and phone number! Our orders ship same-day before 5 PM via BlueDart and Delhivery express air.",
        action: {
          label: "Track Order Live →",
          href: "/track-order",
        },
      };
    }

    // 2. Replacement / Returns / Damaged Item
    if (
      q.includes("replace") ||
      q.includes("replacement") ||
      q.includes("return") ||
      q.includes("refund") ||
      q.includes("broken") ||
      q.includes("damaged") ||
      q.includes("defect") ||
      q.includes("wrong item")
    ) {
      return {
        text: "We offer a 24-Hour Doorstep Replacement Guarantee for items that arrive defective or transit-damaged.\n\nTo initiate, simply take an uncut unboxing video when your package arrives and share it with us on WhatsApp within 24 hours. We'll courier a brand new identical replacement free of charge!",
        action: {
          label: "View Replacement Guidelines →",
          href: "/policies/refund-policy",
        },
      };
    }

    // 3. Cash on Delivery (COD) & Discounts
    if (
      q.includes("cod") ||
      q.includes("cash on delivery") ||
      q.includes("cash") ||
      q.includes("pay") ||
      q.includes("payment") ||
      q.includes("discount") ||
      q.includes("upi") ||
      q.includes("gpay") ||
      q.includes("phonepe") ||
      q.includes("coupon")
    ) {
      return {
        text: "Yes! 100% Cash on Delivery (COD) is available across 26,000+ Indian pincodes with zero advance payment.\n\n💡 Pro-Tip: Pay online via UPI (GPay/PhonePe/Paytm) or cards at checkout to instantly save ₹50 on orders above ₹499!",
        action: {
          label: "Shop Baby Essentials →",
          href: "/shop",
        },
      };
    }

    // 4. Delivery Speed & Shipping
    if (
      q.includes("delivery") ||
      q.includes("shipping") ||
      q.includes("how long") ||
      q.includes("days") ||
      q.includes("fast") ||
      q.includes("time") ||
      q.includes("dispatch")
    ) {
      return {
        text: "Orders placed before 5:00 PM IST are handed to our express air couriers the very same day:\n\n• Metro Cities: 2 to 3 business days\n• Rest of India: 3 to 5 business days\n• Free delivery on all prepaid orders above ₹499!",
        action: {
          label: "Read Shipping Policy →",
          href: "/policies/shipping-policy",
        },
      };
    }

    // 5. Baby Safety & Materials
    if (
      q.includes("safe") ||
      q.includes("safety") ||
      q.includes("material") ||
      q.includes("bpa") ||
      q.includes("silicone") ||
      q.includes("toxic") ||
      q.includes("baby") ||
      q.includes("infant") ||
      q.includes("newborn") ||
      q.includes("quality")
    ) {
      return {
        text: "Every single product at Kharido Mart is vetted with strict safety standards:\n\n• 100% BPA-Free & Non-Toxic\n• Food-grade silicone & gentle rounded edges\n• Screen-free Montessori discovery tools\n• Individually inspected before packaging",
        action: {
          label: "Our Mission & Safety →",
          href: "/about",
        },
      };
    }

    // 6. Human Support / WhatsApp
    if (
      q.includes("human") ||
      q.includes("agent") ||
      q.includes("whatsapp") ||
      q.includes("talk") ||
      q.includes("call") ||
      q.includes("phone") ||
      q.includes("support") ||
      q.includes("contact") ||
      q.includes("help") ||
      q.includes("email")
    ) {
      return {
        text: "You can connect directly with our human support team on WhatsApp at +91 85400 17572 (Monday to Saturday, 10:00 AM – 7:00 PM IST).\n\nOr email us anytime at kharidomartsupport@gmail.com.",
        action: {
          label: "Open WhatsApp Chat →",
          href: "https://wa.me/918540017572?text=Hi%20Kharido%20Mart%20Support%2C%20I%20have%20a%20question%20about%20an%20order",
          isExternal: true,
        },
      };
    }

    // Default friendly answer
    return {
      text: "Thank you for reaching out! We are committed to making your baby shopping completely stress-free. You can track your parcel live, browse our collections, or connect with our support desk on WhatsApp (+91 85400 17572).",
      action: {
        label: "Browse Collections →",
        href: "/shop",
      },
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const nextId = messageCounterRef.current++;
    const userMsg: Message = {
      id: `user-${nextId}`,
      sender: "user",
      text: text.trim(),
      time: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue("");
    setIsThinking(true);

    // Realistic intelligent response latency (450ms)
    setTimeout(() => {
      const reply = generateBotReply(text);
      const botId = messageCounterRef.current++;
      const botMsg: Message = {
        id: `bot-${botId}`,
        sender: "bot",
        text: reply.text,
        time: "Just now",
        action: reply.action,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsThinking(false);
    }, 450);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chatbot Launcher FAB (Right bottom - compact circular orb) */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-[#1a1615] hover:bg-[#25201e] text-white rounded-full shadow-2xl border border-white/[0.15] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-black/10"
            aria-label="Open Customer Support Chatbot"
            title="Chat with AI Concierge"
          >
            <ThinkingOrb size={20} state="breathing" theme="dark" />

            {/* Subtle live indicator dot */}
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 ring-2 ring-[#1a1615]" />
            </span>
          </button>
        )}
      </div>

      {/* Chatbot Window */}
      {isOpen && (
        <div
          className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-[calc(100vw-32px)] sm:w-[410px] h-[580px] max-h-[82vh] flex flex-col bg-[#fdfbf7] rounded-3xl shadow-2xl border border-stone-300/80 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300"
          role="dialog"
          aria-label="Customer Care AI Chatbot"
        >
          {/* Header */}
          <div className="bg-[#1a1615] text-white p-4 flex items-center justify-between border-b border-white/[0.08] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/[0.08] border border-white/[0.15] flex items-center justify-center relative p-1 shadow-inner">
                <ThinkingOrb
                  size={20}
                  state={isThinking ? "solving" : "breathing"}
                  theme="dark"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#1a1615]" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                  <span>Kharido Mart Concierge</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#e06b5b]/20 text-[#f5a195]">
                    AI Bot
                  </span>
                </h3>
                <p className="text-[11px] text-stone-400">
                  {isThinking ? (
                    <span className="text-amber-300 font-medium animate-pulse">
                      Searching store knowledge...
                    </span>
                  ) : (
                    <span>Online • 24/7 Instant Answers</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white hover:bg-white/[0.08] rounded-full transition-colors cursor-pointer"
                aria-label="Close Chatbot"
              >
                <CloseCircle size={22} weight="Outline" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-radial from-[#ffffff] to-[#fdfbf7]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs ${
                    msg.sender === "user"
                      ? "bg-[#e06b5b] text-white rounded-tr-xs"
                      : "bg-white border border-[#eddcd1] text-[#2b1f1a] rounded-tl-xs"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Optional Action Button */}
                  {msg.action && (
                    <div className="mt-2.5 pt-2 border-t border-black/[0.06]">
                      {msg.action.isExternal ? (
                        <a
                          href={msg.action.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold rounded-lg text-[11px] shadow-xs transition-all active:scale-[0.98]"
                        >
                          <span>{msg.action.label}</span>
                        </a>
                      ) : (
                        <Link
                          href={msg.action.href}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1615] hover:bg-black text-white font-bold rounded-lg text-[11px] shadow-xs transition-all active:scale-[0.98]"
                        >
                          <span>{msg.action.label}</span>
                        </Link>
                      )}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-stone-400 mt-1 px-1 font-mono">
                  {msg.time}
                </span>
              </div>
            ))}

            {/* Thinking Indicator */}
            {isThinking && (
              <div className="flex items-start gap-2">
                <div className="bg-white border border-[#eddcd1] rounded-2xl rounded-tl-xs p-3 shadow-2xs flex items-center gap-2.5 text-xs text-stone-600">
                  <ThinkingOrb size={20} state="working" theme="light" />
                  <span className="font-medium">Finding answer...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Intent Chips (Shown on fresh chat or for convenience) */}
          <div className="px-3 py-2 bg-[#f5ede2]/60 border-t border-[#eddcd1]/80">
            <div className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1.5 px-1 flex items-center gap-1">
              <Sparkles size={11} weight="Filled" className="text-[#e06b5b]" />
              <span>Suggested Questions</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {QUICK_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.query)}
                  className="px-2.5 py-1 bg-white hover:bg-[#faebe6] border border-[#eddcd1] hover:border-[#e06b5b]/40 text-[#2b1f1a] text-[11px] font-semibold rounded-lg transition-all active:scale-[0.97] cursor-pointer shadow-2xs truncate"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-[#eddcd1] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question (e.g., 'Track order')..."
                className="flex-1 bg-[#fdfbf7] border border-[#eddcd1] focus:border-[#e06b5b] focus:ring-1 focus:ring-[#e06b5b] rounded-xl px-3.5 py-2 text-xs text-[#2b1f1a] placeholder:text-stone-400 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isThinking}
                className="h-9 w-9 bg-[#e06b5b] hover:bg-[#c95444] disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-all active:scale-[0.95] cursor-pointer shrink-0 shadow-sm"
                aria-label="Send message"
              >
                <Send2 size={16} weight="Filled" />
              </button>
            </form>

            {/* Direct WhatsApp escalation strip */}
            <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500 px-1">
              <span>Need human agent?</span>
              <a
                href="https://wa.me/918540017572?text=Hi%20Kharido%20Mart%20Support%2C%20I%20need%20human%20assistance"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#097939] hover:underline font-bold flex items-center gap-1"
              >
                <span>WhatsApp: +91 85400 17572</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
