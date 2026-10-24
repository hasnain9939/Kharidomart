"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  CheckCircle,
  Check,
  Box,
} from "reicon-react";

export default function InviteTeamMemberPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<
    "Super Admin" | "Operations Lead" | "Catalog Manager" | "Customer Support Lead"
  >("Operations Lead");
  const [hubAccess, setHubAccess] = useState("Shopify Central Warehouse");
  const [enforce2FA, setEnforce2FA] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setToastMessage("Please provide member name and work email.");
      return;
    }
    setIsSending(true);
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, hubAccess, enforce2FA }),
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage(`Team member ${name} added & credentials dispatched!`);
        setTimeout(() => {
          router.push("/admin/settings");
        }, 1200);
      } else {
        setToastMessage(data.error || "Failed to add team member");
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch {
      setToastMessage("Failed to reach server to save team member");
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSendInvite} className="flex flex-col gap-6 max-w-3xl mx-auto pb-12">
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
            <Link href="/admin/settings" className="hover:text-[#f97316] flex items-center gap-1 font-semibold">
              <ArrowLeft size={12} weight="Outline" /> Back to Settings
            </Link>
            <span>/</span>
            <span className="font-bold text-[#0b1c30]">Invite Team Member</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0b1c30] tracking-tight">
            Invite Operator to Merchant HQ
          </h1>
          <p className="text-xs text-[#565e74] mt-0.5">
            Grant granular role-based access for logistics leads, catalog managers, and customer support.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/settings"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#f8fafc] text-[#565e74] border border-[#e2e8f0] text-xs font-bold transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSending}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold shadow-[0_4px_14px_0_rgba(249,115,22,0.35)] transition-all disabled:opacity-50"
          >
            {isSending ? (
              <span>Sending Invite...</span>
            ) : (
              <>
                <Check size={16} weight="Outline" />
                <span>Send Invitation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Invitation Form Card */}
      <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-5">
        <h2 className="text-sm font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-4 rounded-full bg-[#f97316]"></span>
          Operator Details &amp; Identity
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#0b1c30] mb-1">
              Full Legal Name <span className="text-[#ef4444]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sneha Patel"
              className="w-full h-10 px-3.5 rounded-xl bg-[#f8fafc] text-xs font-semibold text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0b1c30] mb-1">
              Professional Work Email <span className="text-[#ef4444]">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. member@store.local"
              className="w-full h-10 px-3.5 rounded-xl bg-[#f8fafc] text-xs font-semibold text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Role Selector */}
        <div className="pt-3 border-t border-[#f1f5f9]">
          <label className="block text-xs font-bold text-[#0b1c30] mb-2">
            Role &amp; Privilege Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                id: "Operations Lead",
                title: "Operations & Logistics Lead",
                desc: "Fulfillment queues, courier AWB generation, and warehouse transfers.",
              },
              {
                id: "Catalog Manager",
                title: "Catalog & Product Manager",
                desc: "Add & edit products, pricing, multi-channel listings, and images.",
              },
              {
                id: "Customer Support Lead",
                title: "Customer Support Specialist",
                desc: "Order lookup, WhatsApp customer chat, tracking status assistance.",
              },
              {
                id: "Super Admin",
                title: "Super Admin (Full Access)",
                desc: "Complete storefront ownership, payout gateways, and API tokens.",
              },
            ].map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id as any)}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  role === r.id
                    ? "border-[#f97316] bg-[#ffedd5]/30"
                    : "border-[#e2e8f0] bg-[#f8fafc] hover:bg-white"
                }`}
              >
                <div className="font-bold text-xs text-[#0b1c30]">{r.title}</div>
                <div className="text-[11px] text-[#565e74] mt-0.5">{r.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Hub Access Scope */}
        <div className="pt-3 border-t border-[#f1f5f9]">
          <label className="block text-xs font-bold text-[#0b1c30] mb-1">
            Warehouse Hub Scope
          </label>
          <select
            value={hubAccess}
            onChange={(e) => setHubAccess(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs font-semibold text-[#0b1c30]"
          >
            <option value="Shopify Central Warehouse">Primary: Shopify Central Warehouse (cgxx12-ek.myshopify.com)</option>
            <option value="All Hubs">All Regional Hubs &amp; Fulfillment Centers</option>
            <option value="Gurugram Central Hub">North Hub (Gurugram)</option>
            <option value="Mumbai Bhiwandi Hub">West Hub (Mumbai)</option>
            <option value="Bengaluru Whitefield Hub">South Hub (Bengaluru)</option>
          </select>
        </div>

        {/* Security Controls */}
        <div className="pt-3 border-t border-[#f1f5f9]">
          <label className="flex items-center justify-between cursor-pointer text-xs font-semibold text-[#0b1c30]">
            <div className="flex flex-col">
              <span>Mandate Two-Factor Authentication (2FA)</span>
              <span className="text-[11px] text-[#565e74]">
                Requires SMS OTP or Authenticator token on login to protect merchant operations.
              </span>
            </div>
            <input
              type="checkbox"
              checked={enforce2FA}
              onChange={(e) => setEnforce2FA(e.target.checked)}
              className="accent-[#f97316] w-4 h-4 rounded"
            />
          </label>
        </div>
      </div>
    </form>
  );
}
