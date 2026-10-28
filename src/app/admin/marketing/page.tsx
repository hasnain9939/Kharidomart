"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TicketDiscount,
  Add,
  CheckCircle,
  Copy,
  Phone,
  ShoppingBag,
  Edit,
  ArrowRight,
} from "reicon-react";
import { AdminDiscount } from "@/data/adminData";

export default function AdminMarketingPage() {
  const [discounts, setDiscounts] = useState<AdminDiscount[]>([]);
  const [activeTab, setActiveTab] = useState<"vouchers" | "bundles" | "cart_recovery">("vouchers");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [abandonedCheckouts, setAbandonedCheckouts] = useState<any[]>([]);
  const [abandonedMetrics, setAbandonedMetrics] = useState({
    totalAbandoned: 0,
    totalRecovered: 0,
    abandonedRevenue: 0,
    recoveredRevenue: 0,
    recoveryRate: 0,
  });
  const [isLoadingAbandoned, setIsLoadingAbandoned] = useState(false);

  const fetchAbandonedCheckouts = async () => {
    setIsLoadingAbandoned(true);
    try {
      const res = await fetch("/api/abandoned-checkout");
      const data = await res.json();
      if (data.success) {
        setAbandonedCheckouts(data.checkouts || []);
        if (data.metrics) setAbandonedMetrics(data.metrics);
      }
    } catch (e) {
      console.warn("Failed to load abandoned checkouts:", e);
    } finally {
      setIsLoadingAbandoned(false);
    }
  };


  React.useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const res = await fetch("/api/discounts");
        const data = await res.json();
        if (data.success && Array.isArray(data.discounts)) {
          setDiscounts(
            data.discounts.map((d: any) => ({
              id: d.id,
              code: d.code,
              type: d.type === "fixed" ? "fixed_amount" : "percentage",
              value: d.value,
              status: d.active ? "Active" : "Expired",
              usageCount: d.usageCount || 0,
              minSpend: d.minOrder || 0,
              validTill: d.expiresAt
                ? new Date(d.expiresAt).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "No Expiry",
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load discounts from database", err);
      }
    };
    fetchDiscounts();

    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else if (Array.isArray(data)) {
          setOrders(data);
        }
      } catch (e) {
        console.error("Failed to load orders for marketing", e);
      }
    };
    fetchOrders();
    fetchAbandonedCheckouts();
  }, []);

  const discountedOrders = orders.filter((o) => Number(o.discountAmount || 0) > 0);
  const totalDiscountSavings = discountedOrders.reduce(
    (sum, o) => sum + Number(o.discountAmount || 0),
    0
  );
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleStatus = (id: string) => {
    setDiscounts((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: d.status === "Active" ? "Expired" : "Active" }
          : d
      )
    );
    setToastMessage("Discount status updated");
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto min-w-0">
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
            <Link href="/admin" className="hover:text-[#f97316]">
              Dashboard
            </Link>
            <span>/</span>
            <span className="font-bold text-[#0b1c30]">Marketing &amp; Discounts</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0b1c30] tracking-tight">
            Marketing &amp; Promotional Engine
          </h1>
          <p className="text-xs text-[#565e74] mt-0.5">
            Manage discount vouchers, volume tier bundles, and automated WhatsApp recovery drips.
          </p>
        </div>

        <Link
          href="/admin/discounts/new"
          className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold shadow-[0_4px_14px_0_rgba(249,115,22,0.35)] transition-all shrink-0"
        >
          <Add size={16} weight="Outline" />
          <span>Create New Discount</span>
        </Link>
      </div>

      {/* 4 Performance KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-[#565e74]">Total Store Sales</span>
          <div className="my-2">
            <div className="text-2xl font-black text-[#0b1c30] tracking-tight">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </div>
            <span className="text-xs text-[#15803d] font-bold">{orders.length} Total verified orders</span>
          </div>
          <span className="text-[11px] text-[#565e74]">From live checkout orders</span>
        </div>

        {/* KPI 2 */}
        <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-[#565e74]">Customer Discount Savings</span>
          <div className="my-2">
            <div className="text-2xl font-black text-[#0b1c30] tracking-tight">
              ₹{totalDiscountSavings.toLocaleString("en-IN")}
            </div>
            <span className="text-xs text-[#565e74]">{discountedOrders.length} orders used promo codes</span>
          </div>
          <span className="text-[11px] font-bold text-[#f97316]">Active on storefront</span>
        </div>

        {/* KPI 3 */}
        <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-[#565e74]">Active Promotional Coupons</span>
          <div className="my-2">
            <div className="text-2xl font-black text-[#ea580c] tracking-tight">
              {discounts.filter((d) => d.status === "Active").length} Codes
            </div>
            <span className="text-xs text-[#15803d] font-bold">Ready for buyers at checkout</span>
          </div>
          <span className="text-[11px] text-[#565e74]">Including MOMFIRST &amp; KHARIDO10</span>
        </div>

        {/* KPI 4 */}
        <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-[#565e74]">Automated WhatsApp Cart Drip</span>
          <div className="my-2">
            <div className="text-2xl font-black text-[#15803d] tracking-tight">
              Enabled
            </div>
            <span className="text-xs text-[#565e74]">45-min abandonment trigger</span>
          </div>
          <span className="text-[11px] text-[#15803d] font-bold">Anti-RTO Protection Active</span>
        </div>
      </div>

      {/* Tab Strip */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab("vouchers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "vouchers"
              ? "bg-[#0b1c30] text-white shadow-xs"
              : "text-[#565e74] hover:bg-[#f8fafc] hover:text-[#0b1c30]"
          }`}
        >
          <TicketDiscount size={16} weight={activeTab === "vouchers" ? "Filled" : "Outline"} />
          <span>Discount Codes &amp; Vouchers</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px]">
            {discounts.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("bundles")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "bundles"
              ? "bg-[#0b1c30] text-white shadow-xs"
              : "text-[#565e74] hover:bg-[#f8fafc] hover:text-[#0b1c30]"
          }`}
        >
          <ShoppingBag size={16} weight={activeTab === "bundles" ? "Filled" : "Outline"} />
          <span>Automatic Bundle Sets</span>
          <span className="px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#0b1c30] text-[10px]">
            3 Sets
          </span>
        </button>

        <button
          onClick={() => setActiveTab("cart_recovery")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "cart_recovery"
              ? "bg-[#0b1c30] text-white shadow-xs"
              : "text-[#565e74] hover:bg-[#f8fafc] hover:text-[#0b1c30]"
          }`}
        >
          <Phone size={16} weight={activeTab === "cart_recovery" ? "Filled" : "Outline"} />
          <span>WhatsApp Abandoned Drips</span>
          <span className="px-2 py-0.5 rounded-full bg-[#caecbf]/70 text-[#1d3819] text-[10px]">
            2 Active
          </span>
        </button>
      </div>

      {/* Tab 1: Vouchers Table */}
      {activeTab === "vouchers" && (
        <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead>
                <tr className="bg-[#f8fafc] text-[#565e74] font-bold uppercase tracking-wider text-[11px] border-b border-[#e2e8f0]">
                  <th className="py-3.5 px-4">Coupon Code</th>
                  <th className="py-3.5 px-4">Discount Value</th>
                  <th className="py-3.5 px-4">Min Spend</th>
                  <th className="py-3.5 px-4">Usage Analytics</th>
                  <th className="py-3.5 px-4">Valid Until</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {discounts.map((discount) => (
                  <tr key={discount.id} className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm font-mono text-[#f97316]">
                          {discount.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(discount.code)}
                          className="text-[#565e74] hover:text-[#0b1c30]"
                          title="Copy Code"
                        >
                          <Copy size={13} weight="Outline" />
                        </button>
                        {copiedCode === discount.code && (
                          <span className="text-[10px] text-[#15803d] font-bold">
                            Copied!
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#0b1c30]">
                      {discount.type === "percentage"
                        ? `${discount.value}% OFF`
                        : discount.type === "fixed_amount"
                        ? `Flat ₹${discount.value} OFF`
                        : "FREE SHIPPING"}
                    </td>
                    <td className="py-3.5 px-4 text-[#565e74]">
                      {discount.minSpend > 0 ? `₹${discount.minSpend}` : "No minimum"}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#0b1c30]">
                          {discount.usageCount} used
                        </span>
                        {discount.usageLimit && (
                          <span className="text-[11px] text-[#565e74]">
                            of {discount.usageLimit} max limit
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#565e74]">
                      {discount.expiryDate}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(discount.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                          discount.status === "Active"
                            ? "bg-[#caecbf]/70 text-[#1d3819]"
                            : "bg-[#f1f5f9] text-[#565e74]"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            discount.status === "Active" ? "bg-[#15803d]" : "bg-[#94a3b8]"
                          }`}
                        ></span>
                        {discount.status}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/discounts/new?edit=${discount.id}`}
                        className="p-1.5 rounded-lg text-[#565e74] hover:text-[#f97316] hover:bg-[#ffedd5] inline-block transition-colors"
                      >
                        <Edit size={16} weight="Outline" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Bundles */}
      {activeTab === "bundles" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
            <div>
              <span className="px-2 py-0.5 rounded-full bg-[#ffedd5] text-[#ea580c] text-[10px] font-bold uppercase">
                Active Upsell
              </span>
              <h3 className="text-base font-bold text-[#0b1c30] mt-2">
                Trimmer + 6 Replacement Pads
              </h3>
              <p className="text-xs text-[#565e74] mt-1">
                Customer gets ₹100 instant bundle discount when adding replacement discs.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-xs font-bold">
              <span className="text-[#15803d]">Ready on Storefront</span>
              <span className="text-[#0b1c30]">₹100 Off</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
            <div>
              <span className="px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#0b1c30] text-[10px] font-bold uppercase">
                Family Safety Set
              </span>
              <h3 className="text-base font-bold text-[#0b1c30] mt-2">
                Nail Trimmer + Teether + Sound Book
              </h3>
              <p className="text-xs text-[#565e74] mt-1">
                Complete nursery bundle with free gift packaging.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-xs font-bold">
              <span className="text-[#15803d]">Ready on Storefront</span>
              <span className="text-[#0b1c30]">₹250 Off</span>
            </div>
          </div>
        </div>
      )}

            {/* Tab 3: Live Abandoned Checkouts & WhatsApp Recovery */}
      {activeTab === "cart_recovery" && (
        <div className="space-y-6">
          {/* Recovery Performance Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-[#eddcd1] shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b5850]">
                Abandoned Sessions
              </span>
              <div className="text-2xl font-black text-[#2b1f1a] font-mono mt-1">
                {abandonedMetrics.totalAbandoned}
              </div>
              <span className="text-[11px] text-[#e06b5b] font-medium">Potential customers</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#eddcd1] shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b5850]">
                Lost Revenue Pool
              </span>
              <div className="text-2xl font-black text-[#e06b5b] font-mono mt-1">
                ₹{abandonedMetrics.abandonedRevenue.toLocaleString("en-IN")}
              </div>
              <span className="text-[11px] text-[#6b5850]">Pending in carts</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#eddcd1] shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b5850]">
                Recovered Orders
              </span>
              <div className="text-2xl font-black text-[#4f775d] font-mono mt-1">
                {abandonedMetrics.totalRecovered}
              </div>
              <span className="text-[11px] text-[#4f775d] font-medium">Successfully completed</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#eddcd1] shadow-2xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b5850]">
                Recovery Rate
              </span>
              <div className="text-2xl font-black text-[#2b1f1a] font-mono mt-1">
                {abandonedMetrics.recoveryRate}%
              </div>
              <span className="text-[11px] text-[#4f775d] font-medium">Cart-to-order wins</span>
            </div>
          </div>

          {/* Abandoned Checkouts Table Card */}
          <div className="bg-white rounded-2xl border border-[#eddcd1] shadow-xs overflow-hidden">
            <div className="p-5 border-b border-[#eddcd1] flex flex-wrap items-center justify-between gap-3 bg-[#fbf7f0]/60">
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-[#2b1f1a]">
                  Recent Abandoned Checkout Sessions ({abandonedCheckouts.length})
                </h3>
                <p className="text-xs text-[#6b5850] mt-0.5">
                  High-intent shoppers who entered contact info. Send 1-click personalized WhatsApp reminders to recover them.
                </p>
              </div>

              <button
                type="button"
                onClick={fetchAbandonedCheckouts}
                disabled={isLoadingAbandoned}
                className="px-3 py-1.5 bg-white border border-[#eddcd1] hover:bg-stone-50 text-[#2b1f1a] text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoadingAbandoned ? "Refreshing..." : "↻ Refresh List"}</span>
              </button>
            </div>

            {abandonedCheckouts.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#6b5850] space-y-2">
                <ShoppingBag size={32} weight="Outline" className="mx-auto text-stone-300" />
                <p className="font-bold text-[#2b1f1a]">No abandoned checkouts recorded yet</p>
                <p className="text-[11px] text-stone-400">
                  When shoppers enter phone or email on checkout and leave, they will appear here with 1-click WhatsApp recovery links.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#2b1f1a]">
                  <thead className="bg-[#fdfbf7] text-[#6b5850] font-bold border-b border-[#eddcd1] uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Shopper</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Cart Contents</th>
                      <th className="py-3 px-4">Cart Value</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Recovery Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#eddcd1]/70">
                    {abandonedCheckouts.map((cart) => {
                      const recoveryUrl = `https://kharidomart.com/checkout?recover=${cart.recoveryToken}`;
                      const firstName = (cart.customerName || "there").split(" ")[0];
                      const waText = encodeURIComponent(
                        `Hi ${firstName}! Your Kharido Mart cart is reserved with Free Express Delivery. Complete your order now and save an extra ₹50 with UPI: ${recoveryUrl}`
                      );
                      const waLink = cart.customerPhone
                        ? `https://wa.me/91${cart.customerPhone.replace(/\D/g, "")}?text=${waText}`
                        : null;

                      return (
                        <tr key={cart.id} className="hover:bg-[#fbf7f0]/50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-[#2b1f1a]">
                            <div>{cart.customerName}</div>
                            {cart.city && (
                              <div className="text-[11px] text-[#6b5850] font-normal">
                                {cart.city} {cart.pincode ? `(${cart.pincode})` : ""}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px]">
                            {cart.customerPhone && (
                              <div className="font-semibold text-[#2b1f1a]">{cart.customerPhone}</div>
                            )}
                            {cart.customerEmail && (
                              <div className="text-[11px] text-[#6b5850] truncate max-w-[180px]">
                                {cart.customerEmail}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-[#2b1f1a]">
                              {cart.itemsCount} {cart.itemsCount === 1 ? "item" : "items"}
                            </div>
                            <div className="text-[11px] text-[#6b5850] truncate max-w-[200px]" title={cart.itemsPreview?.join(", ")}>
                              {cart.itemsPreview?.slice(0, 2).join(", ")}
                              {cart.itemsPreview?.length > 2 ? ` + ${cart.itemsPreview.length - 2} more` : ""}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-sm text-[#2b1f1a]">
                            ₹{cart.subtotal.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3.5 px-4">
                            {cart.status === "recovered" ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#eaf3ed] text-[#4f775d] text-[10px] font-extrabold uppercase">
                                ✓ Recovered ({cart.orderNumber || "Order"})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fdedeb] text-[#e06b5b] text-[10px] font-extrabold uppercase">
                                Abandoned
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {cart.status !== "recovered" && waLink && (
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4f775d] hover:bg-[#3d6049] text-white text-xs font-bold rounded-lg shadow-2xs transition active:scale-95"
                                >
                                  <span>WhatsApp</span>
                                  <ArrowRight size={13} weight="Outline" />
                                </a>
                              )}
                              <button
                                type="button"
                                onClick={() => handleCopyCode(recoveryUrl)}
                                className="p-1.5 text-[#6b5850] hover:text-[#2b1f1a] hover:bg-stone-100 rounded-lg transition"
                                title="Copy Recovery Cart Link"
                              >
                                <Copy size={15} weight="Outline" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}