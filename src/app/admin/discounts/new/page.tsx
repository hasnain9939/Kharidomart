"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  TicketDiscount,
  CheckCircle,
  Copy,
  Clock,
  ShieldCheck,
  Check,
} from "reicon-react";

export default function CreateDiscountPage() {
  const router = useRouter();

  const [code, setCode] = useState("KHARIDO100");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed_amount" | "free_shipping">("fixed_amount");
  const [value, setValue] = useState(100);
  const [minSpend, setMinSpend] = useState(599);
  const [eligibility, setEligibility] = useState("all");
  const [limitTotal, setLimitTotal] = useState(1000);
  const [limitPerCustomer, setLimitPerCustomer] = useState(true);
  const [hasEndDate, setHasEndDate] = useState(true);
  const [expiryDate, setExpiryDate] = useState("31 Dec 2026");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const generateCode = () => {
    const prefixes = ["SAVE", "FESTIVE", "DEAL", "OFFER", "WELCOME", "VIP"];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(100 + Math.random() * 900);
    setCode(`${randomPrefix}${randomNum}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          type: discountType === "percentage" ? "percentage" : "fixed",
          value,
          minOrder: minSpend,
          description: `${value}${discountType === "percentage" ? "%" : "₹"} Off (Min Order ₹${minSpend})`,
          active: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage(`Discount code ${code} saved to database & activated!`);
        setTimeout(() => {
          router.push("/admin/marketing");
        }, 1200);
      } else {
        setToastMessage(data.error || "Failed to create discount");
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch {
      setToastMessage("Failed to reach server to create discount");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-5xl mx-auto pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0b1c30] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-[#f97316] animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle size={16} weight="Filled" className="text-[#15803d]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#565e74] mb-1">
            <Link href="/admin/marketing" className="hover:text-[#f97316] flex items-center gap-1 font-semibold">
              <ArrowLeft size={12} weight="Outline" /> Back to Discounts
            </Link>
            <span>/</span>
            <span className="font-bold text-[#0b1c30]">Create Discount</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0b1c30] tracking-tight">
            Create Promotional Coupon
          </h1>
          <p className="text-xs text-[#565e74] mt-0.5">
            Configure discount values, minimum purchase cart criteria, and usage quotas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/marketing"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#f8fafc] text-[#565e74] border border-[#e2e8f0] text-xs font-bold transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold shadow-[0_4px_14px_0_rgba(249,115,22,0.35)] transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Saving...</span>
            ) : (
              <>
                <Check size={16} weight="Outline" />
                <span>Save &amp; Activate</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: 8 cols */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Coupon Code Input */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-4 rounded-full bg-[#f97316]"></span>
                Coupon Code
              </h2>
              <button
                type="button"
                onClick={generateCode}
                className="text-xs font-bold text-[#f97316] hover:underline"
              >
                Generate Random Code
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                Customer Promo Code <span className="text-[#ef4444]">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. FESTIVE20"
                className="w-full h-11 px-3.5 rounded-xl bg-[#f8fafc] text-sm font-black font-mono tracking-wider text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none transition-all uppercase"
              />
              <span className="text-[11px] text-[#565e74] mt-1 block">
                Customers will enter this exact code during checkout.
              </span>
            </div>
          </div>

          {/* Discount Type */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-4">
            <h2 className="text-sm font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-4 rounded-full bg-[#f97316]"></span>
              Discount Type
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setDiscountType("percentage")}
                className={`p-4 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  discountType === "percentage"
                    ? "border-[#f97316] bg-[#ffedd5]/30 text-[#0b1c30]"
                    : "border-[#e2e8f0] bg-[#f8fafc] text-[#565e74] hover:bg-white"
                }`}
              >
                <span className="font-extrabold text-sm text-[#0b1c30]">Percentage Off</span>
                <span className="text-[11px] text-[#565e74]">e.g. 10% or 15% off basket</span>
              </button>

              <button
                type="button"
                onClick={() => setDiscountType("fixed_amount")}
                className={`p-4 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  discountType === "fixed_amount"
                    ? "border-[#f97316] bg-[#ffedd5]/30 text-[#0b1c30]"
                    : "border-[#e2e8f0] bg-[#f8fafc] text-[#565e74] hover:bg-white"
                }`}
              >
                <span className="font-extrabold text-sm text-[#0b1c30]">Fixed Amount Off</span>
                <span className="text-[11px] text-[#565e74]">e.g. Flat ₹100 discount</span>
              </button>

              <button
                type="button"
                onClick={() => setDiscountType("free_shipping")}
                className={`p-4 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  discountType === "free_shipping"
                    ? "border-[#f97316] bg-[#ffedd5]/30 text-[#0b1c30]"
                    : "border-[#e2e8f0] bg-[#f8fafc] text-[#565e74] hover:bg-white"
                }`}
              >
                <span className="font-extrabold text-sm text-[#0b1c30]">Free Shipping</span>
                <span className="text-[11px] text-[#565e74]">Waives standard shipping</span>
              </button>
            </div>

            {discountType !== "free_shipping" && (
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Discount Value {discountType === "percentage" ? "(%)" : "(₹)"}
                </label>
                <input
                  type="number"
                  min={1}
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8fafc] text-sm font-extrabold text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Minimum Purchase Requirements */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-4">
            <h2 className="text-sm font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-4 rounded-full bg-[#f97316]"></span>
              Minimum Purchase Requirements
            </h2>

            <div>
              <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                Minimum Cart Total (₹)
              </label>
              <input
                type="number"
                value={minSpend}
                onChange={(e) => setMinSpend(Number(e.target.value))}
                placeholder="0 for no minimum"
                className="w-full h-10 px-3.5 rounded-xl bg-[#f8fafc] text-xs font-semibold text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none"
              />
              <span className="text-[11px] text-[#565e74] mt-1 block">
                Applies only when cart subtotal is at least ₹{minSpend}.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                Customer Eligibility
              </label>
              <select
                value={eligibility}
                onChange={(e) => setEligibility(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#f8fafc] text-xs font-semibold text-[#0b1c30] border border-[#e2e8f0]"
              >
                <option value="all">All Shoppers</option>
                <option value="vip">VIP Cohort Only (LTV &gt; ₹3,000)</option>
                <option value="first_time">First-Time Customers Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: 4 cols */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Live Customer Preview */}
          <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-3">
            <h3 className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider">
              Customer Checkout Preview
            </h3>

            <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-sm text-[#f97316] bg-[#ffedd5] px-2 py-0.5 rounded">
                  {code}
                </span>
                <span className="text-[11px] font-bold text-[#15803d]">APPLIED</span>
              </div>
              <div className="text-xs text-[#0b1c30] font-semibold mt-1">
                {discountType === "percentage"
                  ? `${value}% off entire order`
                  : discountType === "fixed_amount"
                  ? `Flat ₹${value} off subtotal`
                  : "Free delivery applied"}
              </div>
              {minSpend > 0 && (
                <div className="text-[11px] text-[#565e74]">
                  Minimum cart threshold: ₹{minSpend}
                </div>
              )}
            </div>
          </div>

          {/* Usage Limits */}
          <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-3">
            <h3 className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider">
              Usage Limits &amp; Expiry
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#565e74] mb-1">
                Total Redemptions Limit
              </label>
              <input
                type="number"
                value={limitTotal}
                onChange={(e) => setLimitTotal(Number(e.target.value))}
                className="w-full h-9 px-3 rounded-lg bg-[#f8fafc] text-xs font-bold text-[#0b1c30] border border-[#e2e8f0]"
              />
            </div>

            <label className="flex items-center justify-between pt-1 cursor-pointer text-xs font-semibold text-[#0b1c30]">
              <span>Limit to 1 use per customer</span>
              <input
                type="checkbox"
                checked={limitPerCustomer}
                onChange={(e) => setLimitPerCustomer(e.target.checked)}
                className="accent-[#f97316] w-4 h-4 rounded"
              />
            </label>

            <div className="pt-2 border-t border-[#f1f5f9]">
              <label className="block text-xs font-semibold text-[#565e74] mb-1">
                Expiry Date
              </label>
              <input
                type="text"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-[#f8fafc] text-xs font-bold text-[#0b1c30] border border-[#e2e8f0]"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
