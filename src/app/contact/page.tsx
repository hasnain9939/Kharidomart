"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { ShieldCheck, TruckFast } from "reicon-react";

export default function ContactPage() {
  const { showToast } = useStore();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    orderId: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = "Please enter your full name (minimum 2 characters).";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email address (e.g. you@gmail.com).";
    }

    if (form.phone.trim()) {
      const cleanPhone = form.phone.replace(/\D/g, "");
      if (cleanPhone.length !== 10) {
        newErrors.phone = "Please enter a valid 10-digit Indian mobile number.";
      }
    }

    if (!form.message.trim() || form.message.trim().length < 10) {
      newErrors.message = "Please describe your question or issue in detail (at least 10 characters).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true, orderId: true, message: true });

    if (!validate()) {
      showToast("Please check the form for errors before submitting.", "warning");
      return;
    }

    setSubmitted(true);
    showToast("Message sent! Our support team will get back to you shortly.");
  };

  const faqs = [
    {
      q: "How do I track my order?",
      a: "As soon as your package is dispatched from our fulfillment center, we send an SMS and WhatsApp update with your live tracking number (BlueDart, Delhivery, or Shadowfax).",
    },
    {
      q: "Is Cash on Delivery (COD) available?",
      a: "Yes! We offer 100% Cash on Delivery across almost all pin codes in India. You only pay when your parcel is delivered to your doorstep.",
    },
    {
      q: "What is your replacement policy?",
      a: "We follow a strict Replacement-Only policy (no returns or refunds). If your item arrives damaged or defective, report it within 24 hours of delivery with a mandatory uncut unboxing video for a free replacement.",
    },
    {
      q: "How long does shipping take?",
      a: "Orders are dispatched within 24 hours. Standard transit time is 3 to 5 business days across metro and non-metro cities in India.",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      {/* Title */}
      <div className="text-center space-y-3 max-w-xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-3 py-1 rounded-full">
          Customer Support
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight">
          We&apos;re Here to Help!
        </h1>
        <p className="text-sm text-stone-600">
          Have a question about an order, delivery, or a product? Reach out to us and our support team will respond promptly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Contact Information & Channels (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
            <h3 className="font-extrabold text-xl text-stone-900">
              Customer Support
            </h3>

            <div className="space-y-5 text-sm text-stone-600">
              <div className="flex items-start gap-3.5">
                <span className="text-xl">📦</span>
                <div>
                  <p className="font-bold text-stone-900">Order Tracking &amp; Delivery</p>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                    Have an existing order? You can track its live courier status directly using your Order ID and phone number.
                  </p>
                  <Link
                    href="/track-order"
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 mt-2"
                  >
                    <span>Track Your Package →</span>
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="text-xl">🔄</span>
                <div>
                  <p className="font-bold text-stone-900">24-Hour Replacement Support</p>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                    Damaged or defective item? Contact us within 24 hours with your Order ID and mandatory uncut unboxing video for a quick replacement.
                  </p>
                  <Link
                    href="/policies/refund-policy"
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 mt-2"
                  >
                    <span>View Replacement Terms →</span>
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="text-xl">⏱️</span>
                <div>
                  <p className="font-bold text-stone-900">Support Working Hours</p>
                  <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                    Monday to Saturday: 10:00 AM – 6:00 PM IST<br />
                    Inquiries submitted on Sunday are addressed on the next business day.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-emerald-700 font-semibold">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={18} weight="Filled" />
                <span>100% Buyer Protection &amp; Doorstep Exchange</span>
              </span>
            </div>
          </div>

          {/* Quick FAQ summary */}
          <div className="bg-stone-100/70 p-6 rounded-3xl space-y-4">
            <h4 className="font-bold text-sm text-stone-900 uppercase tracking-wide">
              Quick FAQs
            </h4>
            <div className="space-y-3 text-xs text-stone-700">
              {faqs.map((f, i) => (
                <div key={i} className="space-y-1">
                  <p className="font-bold text-stone-900">{f.q}</p>
                  <p className="text-stone-500">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Form (7 cols) */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-3xl border border-stone-200 shadow-sm">
          {submitted ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <ShieldCheck size={36} weight="Filled" />
              </div>
              <h3 className="text-2xl font-bold text-stone-900">
                Message Received!
              </h3>
              <p className="text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
                Thank you for reaching out, <strong>{form.name}</strong>. Our support team will review your query and reply to <strong>{form.email}</strong> shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: "", email: "", phone: "", orderId: "", message: "" });
                }}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold px-6 py-2.5 rounded-xl text-xs"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="font-extrabold text-xl text-stone-900">
                Send Us a Message
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2b1f1a] mb-1.5">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anjali Nair"
                    value={form.name}
                    onBlur={() => handleBlur("name")}
                    onChange={(e) => {
                      setForm({ ...form, name: e.target.value });
                      if (errors.name) validate();
                    }}
                    aria-invalid={!!(touched.name && errors.name)}
                    className={`w-full text-sm p-3 rounded-xl border transition-all ${
                      touched.name && errors.name
                        ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-200"
                        : "border-[#ebdcd3] bg-white focus:outline-none focus:ring-2 focus:ring-[#e06b5b]"
                    }`}
                  />
                  {touched.name && errors.name && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <span>⚠️</span> {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2b1f1a] mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@gmail.com"
                    value={form.email}
                    onBlur={() => handleBlur("email")}
                    onChange={(e) => {
                      setForm({ ...form, email: e.target.value });
                      if (errors.email) validate();
                    }}
                    aria-invalid={!!(touched.email && errors.email)}
                    className={`w-full text-sm p-3 rounded-xl border transition-all ${
                      touched.email && errors.email
                        ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-200"
                        : "border-[#ebdcd3] bg-white focus:outline-none focus:ring-2 focus:ring-[#e06b5b]"
                    }`}
                  />
                  {touched.email && errors.email && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <span>⚠️</span> {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2b1f1a] mb-1.5">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit Indian phone number"
                    value={form.phone}
                    onBlur={() => handleBlur("phone")}
                    onChange={(e) => {
                      setForm({ ...form, phone: e.target.value });
                      if (errors.phone) validate();
                    }}
                    aria-invalid={!!(touched.phone && errors.phone)}
                    className={`w-full text-sm p-3 rounded-xl border transition-all ${
                      touched.phone && errors.phone
                        ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-200"
                        : "border-[#ebdcd3] bg-white focus:outline-none focus:ring-2 focus:ring-[#e06b5b]"
                    }`}
                  />
                  {touched.phone && errors.phone && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                      <span>⚠️</span> {errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2b1f1a] mb-1.5">
                    Order ID (if applicable)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. KM-8492"
                    value={form.orderId}
                    onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                    className="w-full text-sm p-3 rounded-xl border border-[#ebdcd3] bg-white focus:outline-none focus:ring-2 focus:ring-[#e06b5b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2b1f1a] mb-1.5">
                  How can we help you? *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us about your question or request..."
                  value={form.message}
                  onBlur={() => handleBlur("message")}
                  onChange={(e) => {
                    setForm({ ...form, message: e.target.value });
                    if (errors.message) validate();
                  }}
                  aria-invalid={!!(touched.message && errors.message)}
                  className={`w-full text-sm p-3 rounded-xl border transition-all ${
                    touched.message && errors.message
                      ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-200"
                      : "border-[#ebdcd3] bg-white focus:outline-none focus:ring-2 focus:ring-[#e06b5b]"
                  }`}
                />
                {touched.message && errors.message && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                    <span>⚠️</span> {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-[#e06b5b] hover:bg-[#c25445] active:scale-[0.98] text-white font-extrabold py-3.5 rounded-xl transition-all shadow-md text-sm uppercase tracking-wider"
              >
                Send Message
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
