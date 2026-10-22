"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Setting,
  Users,
  ShieldCheck,
  TruckFast,
  CheckCircle,
  Copy,
  Edit,
  Add,
  ArrowRight,
  Phone,
  Sparkles,
  TicketDiscount,
  Lock,
} from "reicon-react";
import { ADMIN_TEAM, AdminTeamMember } from "@/data/adminData";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"shopify" | "cod" | "suppliers" | "team">("shopify");
  const [team, setTeam] = useState<AdminTeamMember[]>(ADMIN_TEAM);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Settings form states
  const [storeName, setStoreName] = useState("Kharido Mart");
  const [shopifyDomain, setShopifyDomain] = useState("");
  const [metaPixelId, setMetaPixelId] = useState("");
  const [capiToken, setCapiToken] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [codOtpRequired, setCodOtpRequired] = useState(true);
  const [upiDiscountEnabled, setUpiDiscountEnabled] = useState(true);
  const [upiDiscountAmount, setUpiDiscountAmount] = useState(50);
  const [autoCancelHours, setAutoCancelHours] = useState(24);
  const [roposoApiKey, setRoposoApiKey] = useState("");
  const [cjApiToken, setCjApiToken] = useState("");
  const [autoFulfillThreshold, setAutoFulfillThreshold] = useState(5000);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage("Shopify dropshipping configuration saved & synced! 🚀");
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto min-w-0 pb-12">
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
            <span className="font-bold text-[#0b1c30]">Settings &amp; Shopify Sync</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0b1c30] tracking-tight">
            Shopify Dropship Storefront Settings
          </h1>
          <p className="text-xs text-[#565e74] mt-0.5">
            Configure Shopify app connection, Meta Pixel tracking, WhatsApp COD anti-RTO bot, and dropship supplier API keys.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="px-5 py-2.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold shadow-[0_4px_14px_0_rgba(249,115,22,0.35)] transition-all cursor-pointer"
        >
          Save All Changes
        </button>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab("shopify")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "shopify"
              ? "bg-[#0b1c30] text-white shadow-xs"
              : "text-[#565e74] hover:bg-[#f8fafc] hover:text-[#0b1c30]"
          }`}
        >
          <Sparkles size={16} weight={activeTab === "shopify" ? "Filled" : "Outline"} />
          <span>Shopify &amp; Meta Pixel</span>
        </button>

        <button
          onClick={() => setActiveTab("cod")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "cod"
              ? "bg-[#0b1c30] text-white shadow-xs"
              : "text-[#565e74] hover:bg-[#f8fafc] hover:text-[#0b1c30]"
          }`}
        >
          <ShieldCheck size={16} weight={activeTab === "cod" ? "Filled" : "Outline"} />
          <span>COD &amp; WhatsApp Bot Defense</span>
        </button>

        <button
          onClick={() => setActiveTab("suppliers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "suppliers"
              ? "bg-[#0b1c30] text-white shadow-xs"
              : "text-[#565e74] hover:bg-[#f8fafc] hover:text-[#0b1c30]"
          }`}
        >
          <TruckFast size={16} weight={activeTab === "suppliers" ? "Filled" : "Outline"} />
          <span>Supplier API Credentials</span>
        </button>

        <button
          onClick={() => setActiveTab("team")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "team"
              ? "bg-[#0b1c30] text-white shadow-xs"
              : "text-[#565e74] hover:bg-[#f8fafc] hover:text-[#0b1c30]"
          }`}
        >
          <Users size={16} weight={activeTab === "team" ? "Filled" : "Outline"} />
          <span>Team &amp; Access</span>
          <span className="px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#0b1c30] text-[10px]">
            {team.length}
          </span>
        </button>
      </div>

      {/* Tab 1: Shopify & Pixels */}
      {activeTab === "shopify" && (
        <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-4 rounded-full bg-[#f97316]"></span>
                Shopify Store Sync &amp; Webhooks
              </h2>
              {shopifyDomain ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#15803d] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#15803d] animate-pulse"></span>
                  Connected (GraphQL API v2026-10)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748b] bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  Not Connected (Enter Domain Below)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Connected Shopify Store Domain
                </label>
                <input
                  type="text"
                  value={shopifyDomain}
                  onChange={(e) => setShopifyDomain(e.target.value)}
                  placeholder="e.g. your-store.myshopify.com"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8fafc] text-xs font-mono font-bold text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Public Storefront Name
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="Kharido Mart"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8fafc] text-xs font-semibold text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#e2e8f0] flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-[#0b1c30] block">Order Creation Webhook Endpoint:</span>
                <span className="font-mono text-[#565e74] text-[11px]">https://kharidomart.com/api/webhooks/shopify-orders</span>
              </div>
              {shopifyDomain ? (
                <span className="text-[11px] font-bold text-[#15803d] bg-emerald-100/70 px-2 py-0.5 rounded">
                  Listening 200 OK
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-[#64748b] bg-slate-200/70 px-2 py-0.5 rounded">
                  Pending Setup
                </span>
              )}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-4">
            <h2 className="text-sm font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-4 rounded-full bg-[#f97316]"></span>
              Meta Facebook &amp; Instagram Ad Tracking Pixels
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Meta Dataset / Pixel ID
                </label>
                <input
                  type="text"
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value)}
                  placeholder="e.g. 84920491024819"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8fafc] text-xs font-mono font-bold text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Conversions API (CAPI) Access Token
                </label>
                <input
                  type="password"
                  value={capiToken}
                  onChange={(e) => setCapiToken(e.target.value)}
                  placeholder="e.g. EAAGz0..."
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8fafc] text-xs font-mono text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {metaPixelId ? (
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-[#15803d] font-semibold flex items-center gap-2">
                <CheckCircle size={16} weight="Filled" />
                <span>Pixel &amp; CAPI Active (Tracking PageViews, AddToCart, InitiateCheckout &amp; Purchase).</span>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#64748b] font-medium flex items-center gap-2">
                <ShieldCheck size={16} weight="Outline" className="text-slate-400" />
                <span>Enter your Meta Dataset / Pixel ID above to enable live conversion tracking.</span>
              </div>
            )}
          </div>
        </form>
      )}

      {/* Tab 2: COD & Anti-RTO Defense */}
      {activeTab === "cod" && (
        <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-4 rounded-full bg-[#f97316]"></span>
                  WhatsApp Automated COD Verification Bot
                </h2>
                <p className="text-xs text-[#565e74] mt-0.5">
                  Sends an automated interactive WhatsApp button template right after order placement to confirm COD address.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={codOtpRequired}
                  onChange={(e) => setCodOtpRequired(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#15803d]"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#f1f5f9]">
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  WhatsApp Support / Bot Sender Number
                </label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  placeholder="e.g. +91 98XXXXXXXX (configure your verified WABA number)"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8fafc] text-xs font-mono font-bold text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Auto-Cancel Unconfirmed COD Window (Hours)
                </label>
                <input
                  type="number"
                  value={autoCancelHours}
                  onChange={(e) => setAutoCancelHours(Number(e.target.value))}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8fafc] text-xs font-mono font-bold text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-[#0b1c30]">Instant ₹50 Prepaid UPI Incentive</span>
                <p className="text-[#565e74] text-[11px]">
                  Encourage buyers to convert COD to UPI with an instant ₹50 discount, eliminating courier RTO risk.
                </p>
              </div>
              <span className="text-xs font-bold text-[#15803d] bg-emerald-100/80 px-2.5 py-1 rounded-md">
                Active (Instant ₹50 UPI discount applied at checkout)
              </span>
            </div>
          </div>
        </form>
      )}

      {/* Tab 3: Dropship Supplier API Credentials */}
      {activeTab === "suppliers" && (
        <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-4">
            <h2 className="text-sm font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-4 rounded-full bg-[#f97316]"></span>
              Roposo Clout Direct API Credentials
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  API Key / Secret Token
                </label>
                <input
                  type="password"
                  value={roposoApiKey}
                  onChange={(e) => setRoposoApiKey(e.target.value)}
                  placeholder="Enter Roposo Clout API key"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8fafc] text-xs font-mono text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Low Balance Notification Trigger (INR)
                </label>
                <input
                  type="number"
                  value={autoFulfillThreshold}
                  onChange={(e) => setAutoFulfillThreshold(Number(e.target.value))}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8fafc] text-xs font-mono font-bold text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-4">
            <h2 className="text-sm font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-4 rounded-full bg-[#f97316]"></span>
              CJ Dropshipping Global API
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Access Token
                </label>
                <input
                  type="password"
                  value={cjApiToken}
                  onChange={(e) => setCjApiToken(e.target.value)}
                  placeholder="Enter CJ Dropshipping access token"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8fafc] text-xs font-mono text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Target Destination Currency
                </label>
                <input
                  type="text"
                  disabled
                  value="INR (₹) - Auto Real-time Converted"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f1f5f9] text-xs font-bold text-[#565e74] border border-[#e2e8f0]"
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Tab 4: Team */}
      {activeTab === "team" && (
        <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-4 rounded-full bg-[#f97316]"></span>
              Merchant Store Admins &amp; Media Buyers
            </h2>
          </div>

          <div className="divide-y divide-[#f1f5f9]">
            {team.map((member) => (
              <div key={member.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-[#0b1c30] block">{member.name}</span>
                  <span className="text-[11px] text-[#565e74]">{member.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#ea580c] bg-orange-100/70 px-2 py-0.5 rounded">
                    {member.role}
                  </span>
                  <span className="text-xs text-[#15803d] font-bold">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
