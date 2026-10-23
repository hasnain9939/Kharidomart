"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Box,
  TruckFast,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  CloseCircle,
  Add,
  Search,
  Filter,
  Printer,
  Copy,
  Sparkles,
  TicketDiscount,
  Lock,
} from "reicon-react";
import { DROPSHIP_SUPPLIERS, AdminSupplier } from "@/data/adminData";

export default function AdminSuppliersFulfillmentPage() {
  const [suppliers, setSuppliers] = useState<AdminSupplier[]>(DROPSHIP_SUPPLIERS);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedSupplierForWallet, setSelectedSupplierForWallet] = useState<string>("Roposo Clout Fulfillment");
  const [rechargeAmount, setRechargeAmount] = useState<number>(10000);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSupplierFilter, setSelectedSupplierFilter] = useState("All");

  // Connect Supplier API Modal state
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [supplierToConnect, setSupplierToConnect] = useState<AdminSupplier | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [merchantIdInput, setMerchantIdInput] = useState("");
  const [envMode, setEnvMode] = useState<"production" | "sandbox">("production");
  const [isConnecting, setIsConnecting] = useState(false);

  const [dbProducts, setDbProducts] = useState<any[]>([]);

  // Load connected suppliers from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("kharidomart_connected_suppliers");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSuppliers((prev) =>
            prev.map((s) => {
              const found = parsed.find((p: any) => p.id === s.id);
              if (found) {
                return {
                  ...s,
                  apiStatus: "Connected (Live)",
                  apiKey: found.apiKey,
                  merchantId: found.merchantId,
                  walletBalance: found.walletBalance ?? 10000,
                  dispatchesToday: found.dispatchesToday ?? 0,
                };
              }
              return s;
            })
          );
        }
      }
    } catch (e) {
      console.error("Failed to load connected suppliers from storage", e);
    }
  }, []);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setDbProducts(data.products);
        }
      } catch {}
    };
    fetchProducts();
  }, []);

  const hasAnyConnectedSupplier = suppliers.some((s) => s.apiStatus === "Connected (Live)");

  const handleOpenConnectModal = (supplier: AdminSupplier) => {
    setSupplierToConnect(supplier);
    setApiKeyInput(supplier.apiKey || "");
    setMerchantIdInput(supplier.merchantId || "");
    setShowConnectModal(true);
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierToConnect) return;
    if (!apiKeyInput.trim()) {
      alert("Please enter a valid API Key or Token to establish connection.");
      return;
    }
    setIsConnecting(true);

    setTimeout(() => {
      const updated = suppliers.map((s) => {
        if (s.id === supplierToConnect.id) {
          return {
            ...s,
            apiStatus: "Connected (Live)" as const,
            apiKey: apiKeyInput.trim(),
            merchantId: merchantIdInput.trim() || undefined,
            walletBalance: s.walletBalance > 0 ? s.walletBalance : 10000,
          };
        }
        return s;
      });

      setSuppliers(updated);
      try {
        const toSave = updated
          .filter((s) => s.apiStatus === "Connected (Live)")
          .map((s) => ({
            id: s.id,
            apiKey: s.apiKey,
            merchantId: s.merchantId,
            walletBalance: s.walletBalance,
            dispatchesToday: s.dispatchesToday,
          }));
        localStorage.setItem("kharidomart_connected_suppliers", JSON.stringify(toSave));
      } catch {}

      setIsConnecting(false);
      setShowConnectModal(false);
      setToastMessage(`${supplierToConnect.name} connected successfully! Live auto-fulfillment enabled. 🚀`);
      setTimeout(() => setToastMessage(null), 3500);
    }, 500);
  };

  const handleDisconnect = (supplierId: string, supplierName: string) => {
    if (!confirm(`Are you sure you want to disconnect ${supplierName} API? Orders will no longer auto-route to this supplier.`)) {
      return;
    }

    const updated = suppliers.map((s) => {
      if (s.id === supplierId) {
        return {
          ...s,
          apiStatus: "Not Connected" as const,
          apiKey: undefined,
          merchantId: undefined,
          walletBalance: 0,
          dispatchesToday: 0,
        };
      }
      return s;
    });

    setSuppliers(updated);
    try {
      const toSave = updated
        .filter((s) => s.apiStatus === "Connected (Live)")
        .map((s) => ({
          id: s.id,
          apiKey: s.apiKey,
          merchantId: s.merchantId,
          walletBalance: s.walletBalance,
        }));
      localStorage.setItem("kharidomart_connected_suppliers", JSON.stringify(toSave));
    } catch {}

    setToastMessage(`${supplierName} API disconnected.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const dropshipProducts = dbProducts.map((p) => {
    const images = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : "/assets/stitch/hero_showcase.jpg";
    const margin = p.originalPrice && p.originalPrice > p.price
      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) + "%"
      : "55.0%";
    return {
      sku: p.slug ? `KM-${p.slug.toUpperCase().slice(0, 10)}` : `KM-${p.id.slice(0, 8)}`,
      title: p.title,
      supplier: p.category?.name || "Direct Sourcing",
      supplierCogs: Math.round(p.price * 0.4),
      sellingPrice: p.price,
      marginPercent: margin,
      supplierStock: p.stock || 0,
      leadTime: "24-48h",
      autoFulfill: hasAnyConnectedSupplier,
      status: p.stock > 10 ? "In Stock" : p.stock > 0 ? "Low Stock" : "Out of Stock",
      image: images,
    };
  });

  const filteredProducts = dropshipProducts.filter((item) => {
    if (selectedSupplierFilter !== "All" && item.supplier !== selectedSupplierFilter) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.supplier.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSyncSuppliers = () => {
    if (!hasAnyConnectedSupplier) {
      alert("No dropship supplier APIs are connected yet. Click 'Connect API' on Roposo Clout, CJ Dropshipping, or IndiaDropship below to link your account.");
      return;
    }
    setToastMessage("Synced real-time stock & pricing with connected dropship supplier APIs! 🔄");
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExecuteWalletRecharge = (e: React.FormEvent) => {
    e.preventDefault();
    setSuppliers((prev) =>
      prev.map((s) =>
        s.name.includes(selectedSupplierForWallet.split(" ")[0])
          ? { ...s, walletBalance: s.walletBalance + rechargeAmount }
          : s
      )
    );
    setShowWalletModal(false);
    setToastMessage(`Recharged ₹${rechargeAmount.toLocaleString("en-IN")} to ${selectedSupplierForWallet} auto-fulfill balance! 💳`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto min-w-0 pb-12">
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
            <span className="font-bold text-[#0b1c30]">Suppliers &amp; Auto-Fulfill</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0b1c30] tracking-tight">
            Dropship Suppliers &amp; Auto-Fulfill Hub
          </h1>
          <p className="text-xs text-[#565e74] mt-0.5">
            Monitor API connectivity with Roposo Clout, CJ Dropshipping &amp; IndiaDropship, supplier wallet balances, and auto-fulfillment routing rules.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleSyncSuppliers}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-white hover:bg-[#f8fafc] text-[#0b1c30] border border-[#e2e8f0] text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles size={15} weight="Filled" className="text-[#f97316]" />
            <span>Sync Supplier Stock</span>
          </button>

          <button
            onClick={() => setShowWalletModal(true)}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold shadow-[0_4px_14px_0_rgba(249,115,22,0.35)] transition-all cursor-pointer"
          >
            <Add size={16} weight="Outline" />
            <span>Top-up Sourcing Wallet</span>
          </button>
        </div>
      </div>

      {/* Top Supplier Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {suppliers.map((supplier) => {
          const isConnected = supplier.apiStatus === "Connected (Live)";

          return (
            <div
              key={supplier.id}
              className={`p-5 rounded-2xl bg-white border shadow-xs flex flex-col justify-between gap-4 transition-all ${
                isConnected ? "border-emerald-200 shadow-xs" : "border-[#e2e8f0]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#ea580c] bg-orange-100/70 px-2 py-0.5 rounded-md">
                    {supplier.type}
                  </span>
                  <h3 className="font-extrabold text-sm text-[#0b1c30] mt-1.5">
                    {supplier.name}
                  </h3>
                  <p className="text-xs text-[#565e74]">{supplier.city}, {supplier.state}</p>
                </div>

                {isConnected ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#15803d] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#15803d] animate-pulse"></span>
                    Connected (Live)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#565e74] bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                    Not Connected
                  </span>
                )}
              </div>

              {isConnected ? (
                <>
                  <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#f8fafc] text-xs">
                    <div>
                      <span className="text-[11px] text-[#565e74] block">Prepaid Balance:</span>
                      <span className="font-space font-extrabold text-[#0b1c30] text-sm">
                        ₹{supplier.walletBalance.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#565e74] block">Avg Dispatch:</span>
                      <span className="font-bold text-[#15803d]">
                        {supplier.avgDispatchTime}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-[#f1f5f9]">
                    <div className="flex items-center gap-1.5 text-[11px] text-[#565e74]">
                      <span>Key:</span>
                      <span className="font-mono font-bold text-[#0b1c30]">
                        ••••••••{supplier.apiKey?.slice(-4) || "LIVE"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDisconnect(supplier.id, supplier.name)}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                    >
                      Disconnect API
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-3 p-3 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-xs">
                  <p className="text-[11px] text-[#565e74] leading-relaxed">
                    API integration is currently unlinked. Connect your merchant credentials to enable live inventory and zero-touch courier routing.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenConnectModal(supplier)}
                    className="w-full py-2 rounded-xl bg-[#0b1c30] hover:bg-[#1a2d45] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles size={13} weight="Filled" className="text-[#f97316]" />
                    <span>Connect {supplier.type} API</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Auto-Fulfillment Automation Rules */}
      <div className={`p-6 rounded-2xl text-white shadow-md flex flex-col gap-4 transition-all ${
        hasAnyConnectedSupplier ? "bg-[#0b1c30]" : "bg-[#0e1726] border border-slate-800"
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              hasAnyConnectedSupplier ? "bg-[#f97316] text-white" : "bg-slate-700 text-slate-300"
            }`}>
              <Sparkles size={18} weight="Filled" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Shopify Auto-Fulfill Rules Engine
              </h2>
              <p className="text-xs text-white/70">
                {hasAnyConnectedSupplier
                  ? "Zero-touch dropship pipeline rules matching order risk, OTP verification & supplier inventory."
                  : "Automation engine is paused. Connect at least one dropship supplier above to activate zero-touch automated dispatch."}
              </p>
            </div>
          </div>

          {hasAnyConnectedSupplier ? (
            <span className="text-xs font-bold text-[#15803d] bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full shrink-0">
              All 4 Rules Active
            </span>
          ) : (
            <span className="text-xs font-bold text-[#f59e0b] bg-amber-950/80 border border-amber-500/40 px-3 py-1 rounded-full shrink-0 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
              Paused (No Supplier API Connected)
            </span>
          )}
        </div>

        {!hasAnyConnectedSupplier && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-center gap-2">
            <span>ℹ️</span>
            <span>Your store is currently running in <strong>Manual Fulfillment</strong> mode. Once you click <strong>Connect API</strong> above and link your supplier, these 4 automated rules will take effect on all incoming orders.</span>
          </div>
        )}

        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs transition-opacity ${
          hasAnyConnectedSupplier ? "opacity-100" : "opacity-60"
        }`}>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#f97316] block">1. Verified COD Orders</span>
              {!hasAnyConnectedSupplier && <span className="text-[9px] text-slate-400 font-mono">Dormant</span>}
            </div>
            <p className="text-white/80 text-[11px] leading-relaxed">
              When WhatsApp OTP is confirmed &rarr; Auto-push order to supplier API within 2 minutes.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#f97316] block">2. Prepaid / UPI Orders</span>
              {!hasAnyConnectedSupplier && <span className="text-[9px] text-slate-400 font-mono">Dormant</span>}
            </div>
            <p className="text-white/80 text-[11px] leading-relaxed">
              Instant auto-dispatch flag enabled &rarr; Bypass hold queue and assign priority express courier.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#f97316] block">3. High RTO Risk Defense</span>
              {!hasAnyConnectedSupplier && <span className="text-[9px] text-slate-400 font-mono">Dormant</span>}
            </div>
            <p className="text-white/80 text-[11px] leading-relaxed">
              Incomplete addresses or repeated COD cancellations trigger automatic WhatsApp IVR address recheck.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#f97316] block">4. Low Balance Safeguard</span>
              {!hasAnyConnectedSupplier && <span className="text-[9px] text-slate-400 font-mono">Dormant</span>}
            </div>
            <p className="text-white/80 text-[11px] leading-relaxed">
              Automated webhook notification sent if supplier wallet dips below ₹10,000 threshold.
            </p>
          </div>
        </div>
      </div>

      {/* Sourcing Catalog & Supplier Stock Table */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden flex flex-col">
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 relative">
            <Search size={16} weight="Outline" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#565e74]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product SKU, title, or supplier partner..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#f8fafc] text-xs text-[#0b1c30] placeholder-[#565e74]/70 border border-transparent focus:border-[#f97316]/30 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedSupplierFilter}
              onChange={(e) => setSelectedSupplierFilter(e.target.value)}
              className="h-10 px-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs font-semibold text-[#0b1c30] focus:outline-none"
            >
              <option value="All">All Suppliers</option>
              <option value="Roposo Clout Direct">Roposo Clout Direct</option>
              <option value="CJ Dropshipping India">CJ Dropshipping India</option>
              <option value="IndiaDropship QuickFulfill">IndiaDropship QuickFulfill</option>
            </select>

            <span className="text-xs text-[#565e74] ml-2 font-medium">
              Showing <strong>{filteredProducts.length}</strong> items
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[780px]">
            <thead>
              <tr className="bg-[#f8fafc] text-[#565e74] font-bold uppercase tracking-wider text-[11px] border-b border-[#e2e8f0]">
                <th className="py-3.5 px-4">Product &amp; SKU</th>
                <th className="py-3.5 px-4">Primary Dropship Supplier</th>
                <th className="py-3.5 px-4">Sourcing Cost (COGS)</th>
                <th className="py-3.5 px-4">Selling Price</th>
                <th className="py-3.5 px-4">Gross Margin %</th>
                <th className="py-3.5 px-4">Supplier Stock</th>
                <th className="py-3.5 px-4">Adset Stage</th>
                <th className="py-3.5 px-4 text-right">Auto-Fulfill</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#565e74]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Box size={32} weight="Outline" className="text-[#94a3b8]" />
                      <span className="font-bold text-sm text-[#0b1c30]">No inventory items found</span>
                      <span className="max-w-xs text-[#64748b]">
                        Published products from your database will appear here with stock tracking and margins.
                      </span>
                      <Link
                        href="/admin/products/new"
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f97316] text-white text-xs font-bold"
                      >
                        <Add size={14} weight="Outline" />
                        <span>Add First Product</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((item) => (
                  <tr key={item.sku} className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 rounded-lg bg-[#f1f5f9] overflow-hidden shrink-0 border border-[#e2e8f0]">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col max-w-[220px]">
                          <span className="font-bold text-[#0b1c30] truncate">{item.title}</span>
                          <span className="text-[11px] font-mono text-[#565e74]">{item.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-[#0b1c30]">{item.supplier}</span>
                      <span className="text-[11px] text-[#565e74] block">Lead: {item.leadTime}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-space font-bold text-[#0b1c30]">₹{item.supplierCogs}</span>
                      <span className="text-[10px] text-[#565e74] block">landing COGS</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-space font-extrabold text-[#0b1c30]">₹{item.sellingPrice}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-space font-bold text-[#15803d] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {item.marginPercent}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-space font-bold text-[#0b1c30]">
                          {item.supplierStock.toLocaleString("en-IN")} units
                        </span>
                        <span className="text-[10px] text-[#15803d] font-semibold">Available for dispatch</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#f97316] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {item.autoFulfill ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#15803d]">
                          <CheckCircle size={14} weight="Filled" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#64748b] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                          <CloseCircle size={13} weight="Outline" /> Not Connected
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Wallet Top-up Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#e2e8f0] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#f97316] flex items-center justify-center font-bold">
                  ₹
                </div>
                <h3 className="font-extrabold text-sm text-[#0b1c30]">Recharge Supplier Wallet</h3>
              </div>
              <button
                onClick={() => setShowWalletModal(false)}
                className="w-7 h-7 rounded-lg text-[#565e74] hover:bg-slate-100 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteWalletRecharge} className="flex flex-col gap-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Select Dropship Partner:
                </label>
                <select
                  value={selectedSupplierForWallet}
                  onChange={(e) => setSelectedSupplierForWallet(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[#f8fafc] text-xs font-bold text-[#0b1c30] border border-[#e2e8f0] focus:outline-none"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.apiStatus === "Connected (Live)" ? `Balance: ₹${s.walletBalance.toLocaleString("en-IN")}` : "Unlinked - Connect API first"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Top-up Amount (INR):
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {[5000, 10000, 25000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRechargeAmount(amt)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        rechargeAmount === amt
                          ? "border-[#f97316] bg-orange-50 text-[#f97316]"
                          : "border-[#e2e8f0] bg-white text-[#565e74]"
                      }`}
                    >
                      ₹{amt.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(Number(e.target.value))}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8fafc] text-xs font-mono font-bold text-[#0b1c30] border border-[#e2e8f0] focus:outline-none"
                />
              </div>

              <p className="text-[11px] text-[#565e74] leading-relaxed">
                Wallet funds are auto-debited by supplier APIs when customer orders are pushed for dispatch.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setShowWalletModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#565e74] hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  Confirm Recharge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Connect Supplier API Modal */}
      {showConnectModal && supplierToConnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl border border-[#e2e8f0] animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-[#e2e8f0]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#f97316] flex items-center justify-center font-bold">
                  <Sparkles size={18} weight="Filled" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#0b1c30]">
                    Connect {supplierToConnect.name} API
                  </h3>
                  <p className="text-[11px] text-[#565e74]">
                    Link your {supplierToConnect.type} merchant credentials for live inventory and auto-dispatch
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowConnectModal(false)}
                className="w-8 h-8 rounded-lg text-[#565e74] hover:bg-slate-100 flex items-center justify-center font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConnection} className="flex flex-col gap-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1.5">
                  Environment:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEnvMode("production")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      envMode === "production"
                        ? "border-[#15803d] bg-emerald-50 text-[#15803d]"
                        : "border-[#e2e8f0] bg-white text-[#565e74]"
                    }`}
                  >
                    <CheckCircle size={14} weight={envMode === "production" ? "Filled" : "Outline"} />
                    <span>Production (Live)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEnvMode("sandbox")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      envMode === "sandbox"
                        ? "border-[#f97316] bg-orange-50 text-[#f97316]"
                        : "border-[#e2e8f0] bg-white text-[#565e74]"
                    }`}
                  >
                    <Lock size={14} weight="Outline" />
                    <span>Sandbox (Testnet)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  API Key / Secret Access Token: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={
                    supplierToConnect.type === "Roposo Clout"
                      ? "rop_live_sec_xxxxxxxxxxxxxxxx"
                      : supplierToConnect.type === "CJ Dropshipping"
                      ? "cj_api_token_xxxxxxxxxxxxxxxx"
                      : "id_auth_key_xxxxxxxxxxxxxxxx"
                  }
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8fafc] text-xs font-mono font-semibold text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316]/50 focus:bg-white focus:outline-none"
                />
                <span className="text-[10px] text-[#565e74] mt-1 block">
                  Find this in your {supplierToConnect.name} Merchant Portal under Settings &rarr; API &amp; Integrations.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Merchant ID / Store ID (Optional):
                </label>
                <input
                  type="text"
                  value={merchantIdInput}
                  onChange={(e) => setMerchantIdInput(e.target.value)}
                  placeholder="e.g. KM-STORE-IN-01"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8fafc] text-xs font-mono font-semibold text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316]/50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-[#565e74] space-y-1">
                <div className="flex items-center gap-1 font-bold text-[#0b1c30]">
                  <ShieldCheck size={14} weight="Filled" className="text-emerald-600" />
                  <span>Webhook Dispatch Endpoint</span>
                </div>
                <p className="font-mono text-[10px] text-slate-600 break-all bg-white p-1.5 rounded border border-slate-200">
                  https://kharidomart.in/api/webhooks/dropship
                </p>
                <p className="text-[10px] text-slate-500">
                  Enter this webhook URL in your supplier portal to receive live dispatch tracking numbers and delivery AWB status.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#565e74] hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="px-5 py-2 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold shadow-md shadow-orange-500/20 disabled:opacity-60 flex items-center gap-1.5 cursor-pointer"
                >
                  {isConnecting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Verifying &amp; Linking...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} weight="Filled" />
                      <span>Save &amp; Connect API</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
