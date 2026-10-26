"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  CheckCircle,
  Copy,
  Add,
  Sparkles,
  Refresh,
  Box,
} from "reicon-react";
import { AdminTeamMember } from "@/data/adminData";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"shopify" | "pixel" | "cod" | "team">("shopify");
  const [team, setTeam] = useState<AdminTeamMember[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingShopify, setIsTestingShopify] = useState(false);

  // Settings form states
  const [storeName, setStoreName] = useState("Kharido Mart");
  const [shopifyDomain, setShopifyDomain] = useState("cgxx12-ek.myshopify.com");
  const [metaPixelId, setMetaPixelId] = useState("");
  const [testEventCode, setTestEventCode] = useState("");
  const [supportEmail, setSupportEmail] = useState("kharidomartsupport@gmail.com");
  const [supportPhone, setSupportPhone] = useState("+91 85400 17572");
  const [codOtpRequired, setCodOtpRequired] = useState(true);
  const [upiDiscountEnabled, setUpiDiscountEnabled] = useState(true);
  const [upiDiscountAmount, setUpiDiscountAmount] = useState(50);
  const [autoCancelHours, setAutoCancelHours] = useState(24);
  const [autoPushCod, setAutoPushCod] = useState(true);
  const [autoPushPrepaid, setAutoPushPrepaid] = useState(true);

  // Live Shopify connection status
  const [shopifyStatus, setShopifyStatus] = useState<{
    configured: boolean;
    connected: boolean;
    shopName?: string;
    myshopifyDomain?: string;
    currency?: string;
  } | null>(null);

  const fetchShopifyStatus = async () => {
    try {
      const res = await fetch("/api/shopify/status");
      const data = await res.json();
      setShopifyStatus(data);
      if (data?.myshopifyDomain) {
        setShopifyDomain((prev) => prev || data.myshopifyDomain);
      }
      if (data?.shopName) {
        setStoreName((prev) => (prev === "Kharido Mart" ? data.shopName : prev));
      }
      return data;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    fetchShopifyStatus();

    const loadSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.success && data.settings) {
          const s = data.settings;
          if (s.storeName) setStoreName(s.storeName);
          if (s.shopifyDomain) setShopifyDomain(s.shopifyDomain);
          if (s.metaPixelId) setMetaPixelId(s.metaPixelId);
          if (s.testEventCode) setTestEventCode(s.testEventCode);
          if (s.supportEmail) setSupportEmail(s.supportEmail);
          if (s.supportPhone) setSupportPhone(s.supportPhone);
          if (s.codOtpRequired !== undefined) setCodOtpRequired(s.codOtpRequired === "true");
          if (s.upiDiscountEnabled !== undefined) setUpiDiscountEnabled(s.upiDiscountEnabled === "true");
          if (s.upiDiscountAmount) setUpiDiscountAmount(Number(s.upiDiscountAmount));
          if (s.autoCancelHours) setAutoCancelHours(Number(s.autoCancelHours));
          if (s.autoPushCod !== undefined) setAutoPushCod(s.autoPushCod === "true");
          if (s.autoPushPrepaid !== undefined) setAutoPushPrepaid(s.autoPushPrepaid === "true");
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }

      try {
        const teamRes = await fetch("/api/admin/team");
        const teamData = await teamRes.json();
        if (teamData.success && Array.isArray(teamData.team)) {
          setTeam(teamData.team);
        }
      } catch (err) {
        console.error("Failed to load team:", err);
      }
    };
    loadSettings();
  }, []);

  const handleTestShopify = async () => {
    setIsTestingShopify(true);
    try {
      const data = await fetchShopifyStatus();
      if (data?.connected) {
        setToastMessage(`Shopify connection verified! Store: ${data.shopName} (${data.myshopifyDomain}) 🚀`);
      } else {
        setToastMessage("Shopify connection check: Pending or error.");
      }
    } catch {
      setToastMessage("Could not verify Shopify API connection.");
    } finally {
      setIsTestingShopify(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Sanitize metaPixelId: prevent accidental email entries
    if (metaPixelId && !/^\d+$/.test(metaPixelId.trim())) {
      setToastMessage("Invalid Meta Pixel ID. Must be a numeric dataset ID (e.g. 84920491024819).");
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName,
          shopifyDomain,
          metaPixelId: metaPixelId.trim(),
          testEventCode: testEventCode.trim(),
          supportEmail,
          supportPhone,
          codOtpRequired: String(codOtpRequired),
          upiDiscountEnabled: String(upiDiscountEnabled),
          upiDiscountAmount: String(upiDiscountAmount),
          autoCancelHours: String(autoCancelHours),
          autoPushCod: String(autoPushCod),
          autoPushPrepaid: String(autoPushPrepaid),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage("Settings saved & synced to PostgreSQL database! 🚀");
      } else {
        setToastMessage("Failed to save settings: " + (data.error || "Unknown error"));
      }
    } catch {
      setToastMessage("Error saving settings to server");
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setToastMessage(`${label} copied to clipboard! 📋`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const isConnected = Boolean(shopifyStatus?.connected);
  const activeDomain = shopifyStatus?.myshopifyDomain || shopifyDomain || "cgxx12-ek.myshopify.com";

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
            <span className="font-bold text-[#0b1c30]">Settings &amp; Warehouse Sync</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0b1c30] tracking-tight">
            Store &amp; Shopify Warehouse Settings
          </h1>
          <p className="text-xs text-[#565e74] mt-0.5">
            Manage your connected Shopify store fulfillment, Meta Pixel CAPI tracking, WhatsApp anti-RTO bot, and staff access.
          </p>
        </div>

        <button
          onClick={() => handleSaveSettings()}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold shadow-[0_4px_14px_0_rgba(249,115,22,0.35)] transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
        >
          {isSaving ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              <span>Saving Changes...</span>
            </>
          ) : (
            <span>Save All Changes</span>
          )}
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
          <Box size={16} weight={activeTab === "shopify" ? "Filled" : "Outline"} />
          <span>Shopify Warehouse</span>
          {isConnected && (
            <span className="w-2 h-2 rounded-full bg-[#15803d]"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("pixel")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "pixel"
              ? "bg-[#0b1c30] text-white shadow-xs"
              : "text-[#565e74] hover:bg-[#f8fafc] hover:text-[#0b1c30]"
          }`}
        >
          <Sparkles size={16} weight={activeTab === "pixel" ? "Filled" : "Outline"} />
          <span>Meta Pixel &amp; CAPI</span>
          {metaPixelId && (
            <span className="w-2 h-2 rounded-full bg-[#15803d]"></span>
          )}
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

      {/* Tab 1: Shopify Warehouse Integration */}
      {activeTab === "shopify" && (
        <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
          {/* Live Status Card */}
          <div className="p-6 rounded-2xl bg-white border border-emerald-300 shadow-xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                  Exclusive Fulfillment Partner
                </span>
                <h2 className="text-base font-extrabold text-[#0b1c30] mt-1.5 flex items-center gap-2">
                  <span>Shopify Store &amp; Warehouse Sync</span>
                </h2>
                <p className="text-xs text-[#565e74] font-mono mt-0.5">
                  Connected Domain: <strong>{activeDomain}</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {isConnected ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#15803d] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-[#15803d] animate-pulse"></span>
                    Connected (Live)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    Connecting...
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleTestShopify}
                  disabled={isTestingShopify}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0b1c30] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Refresh size={13} weight="Outline" className={isTestingShopify ? "animate-spin" : ""} />
                  <span>{isTestingShopify ? "Testing..." : "Test Connection"}</span>
                </button>

                <a
                  href={`https://admin.shopify.com/store/${activeDomain.replace(".myshopify.com", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-[#0b1c30] hover:bg-[#1a2d45] text-white text-xs font-bold transition-all"
                >
                  Shopify Admin ↗
                </a>

                <Link
                  href="/api/shopify/install"
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-[#565e74] border border-[#e2e8f0] text-xs font-semibold transition-colors"
                >
                  Re-Authorize
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#f8fafc] text-xs">
              <div>
                <span className="text-[11px] text-[#565e74] block">Store Name:</span>
                <span className="font-bold text-[#0b1c30]">{shopifyStatus?.shopName || storeName}</span>
              </div>
              <div>
                <span className="text-[11px] text-[#565e74] block">Admin API Token:</span>
                <span className="font-mono font-bold text-[#15803d]">shpat_•••••••••••• (Configured)</span>
              </div>
              <div>
                <span className="text-[11px] text-[#565e74] block">API Version:</span>
                <span className="font-mono text-[#0b1c30]">2024-01 REST API</span>
              </div>
            </div>
          </div>

          {/* Store Details Form */}
          <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-4">
            <h2 className="text-sm font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-4 rounded-full bg-[#f97316]"></span>
              Store &amp; Domain Configuration
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Connected Shopify Store Domain
                </label>
                <input
                  type="text"
                  value={shopifyDomain}
                  onChange={(e) => setShopifyDomain(e.target.value)}
                  placeholder="e.g. cgxx12-ek.myshopify.com"
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

            {/* Auto-Dispatch Rules Toggles */}
            <div className="pt-3 border-t border-[#f1f5f9] flex flex-col gap-3">
              <span className="text-xs font-bold text-[#0b1c30]">Automated Dispatch Rules:</span>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <div>
                  <span className="text-xs font-bold text-[#0b1c30] block">Auto-Push Verified COD Orders</span>
                  <span className="text-[11px] text-[#565e74]">When WhatsApp OTP is confirmed, automatically push order into Shopify warehouse for courier booking.</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoPushCod}
                  onChange={(e) => setAutoPushCod(e.target.checked)}
                  className="w-4 h-4 accent-[#f97316] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                <div>
                  <span className="text-xs font-bold text-[#0b1c30] block">Auto-Push Prepaid / UPI Orders</span>
                  <span className="text-[11px] text-[#565e74]">Instantly push Razorpay/UPI paid orders into Shopify with zero delay for priority express packing.</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoPushPrepaid}
                  onChange={(e) => setAutoPushPrepaid(e.target.checked)}
                  className="w-4 h-4 accent-[#f97316] cursor-pointer"
                />
              </div>
            </div>

            {/* Webhook Endpoint */}
            <div className="p-4 rounded-xl bg-[#eff4ff] border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-[#0b1c30] block">Shopify Order &amp; Fulfillment Webhook:</span>
                <span className="font-mono text-[#565e74] text-[11px]">https://www.kharidomart.com/api/webhooks/shopify</span>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard("https://www.kharidomart.com/api/webhooks/shopify", "Webhook URL")}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-[#0b1c30] text-xs font-bold border border-[#e2e8f0] flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
              >
                <Copy size={13} weight="Outline" />
                <span>Copy URL</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Meta Pixel & CAPI */}
      {activeTab === "pixel" && (
        <form onSubmit={handleSaveSettings} className="flex flex-col gap-6">
          <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-4">
            <h2 className="text-sm font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-4 rounded-full bg-[#f97316]"></span>
              Meta Facebook &amp; Instagram Ad Tracking Pixels
            </h2>
            <p className="text-xs text-[#565e74]">
              Feed high-intent conversion data back to Meta Ads Manager for Purchase, AddToCart, and InitiateCheckout events.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Meta Dataset / Pixel ID
                </label>
                <input
                  type="text"
                  value={metaPixelId}
                  onChange={(e) => setMetaPixelId(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 84920491024819"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8fafc] text-xs font-mono font-bold text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none"
                />
                <span className="text-[11px] text-[#565e74] mt-1 block">
                  Numeric Dataset ID from Meta Events Manager.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Test Event Code (Optional)
                </label>
                <input
                  type="text"
                  value={testEventCode}
                  onChange={(e) => setTestEventCode(e.target.value.trim().toUpperCase())}
                  placeholder="e.g. TEST12345"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8fafc] text-xs font-mono text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none"
                />
                <span className="text-[11px] text-[#565e74] mt-1 block">
                  From Meta Test Events tab for debugging events.
                </span>
              </div>
            </div>

            {/* Backend Security Info Banner for Meta CAPI */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0b1c30]">
                <ShieldCheck size={16} weight="Filled" className="text-[#f97316]" />
                <span>Backend Isolated Security: Meta Conversions API (CAPI)</span>
              </div>
              <p className="text-[11px] text-[#565e74] leading-relaxed">
                For maximum security, your CAPI access token is configured exclusively on the server backend (via <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#e2e8f0] text-[#0b1c30]">META_CAPI_TOKEN</code> in Vercel / environment settings). Secret access tokens are never exposed in browser HTML, network responses, or client JavaScript bundles.
              </p>
            </div>

            {metaPixelId ? (
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-[#15803d] font-semibold flex items-center gap-2">
                <CheckCircle size={16} weight="Filled" />
                <span>Pixel &amp; CAPI Active (Tracking PageViews, ViewContent, AddToCart, InitiateCheckout &amp; Purchase).</span>
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

      {/* Tab 3: COD & WhatsApp Bot Defense */}
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
                  Customer Support WhatsApp / Helpline Number
                </label>
                <input
                  type="text"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  placeholder="+91 85400 17572"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8fafc] text-xs font-mono font-bold text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Customer Support Email Address
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  placeholder="kharidomartsupport@gmail.com"
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

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Instant Prepaid UPI Discount (INR)
                </label>
                <input
                  type="number"
                  value={upiDiscountAmount}
                  onChange={(e) => setUpiDiscountAmount(Number(e.target.value))}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8fafc] text-xs font-mono font-bold text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-[#0b1c30]">Instant ₹{upiDiscountAmount} Prepaid UPI Incentive</span>
                <p className="text-[#565e74] text-[11px]">
                  Encourage buyers to convert COD to UPI with an instant ₹{upiDiscountAmount} discount, eliminating courier RTO risk.
                </p>
              </div>
              <span className="text-xs font-bold text-[#15803d] bg-emerald-100/80 px-2.5 py-1 rounded-md">
                Active at checkout
              </span>
            </div>
          </div>
        </form>
      )}

      {/* Tab 4: Team */}
      {activeTab === "team" && (
        <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-4 rounded-full bg-[#f97316]"></span>
                Merchant Store Admins &amp; Staff
              </h2>
              <p className="text-xs text-[#565e74]">
                Staff members with access to your store orders, inventory, and analytics.
              </p>
            </div>
            <Link
              href="/admin/settings/team"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Add size={15} weight="Outline" />
              <span>Invite Team Member</span>
            </Link>
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
                  <span className="text-xs text-[#15803d] font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]"></span>
                    Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
