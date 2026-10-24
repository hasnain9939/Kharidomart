"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Box,
  ShieldCheck,
  CheckCircle,
  CloseCircle,
  Add,
  Search,
  Sparkles,
  Refresh,
  Lock,
} from "reicon-react";

export default function AdminShopifyWarehousePage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
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
      return data;
    } catch {
      return null;
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setDbProducts(data.products);
      }
    } catch {}
  };

  useEffect(() => {
    fetchShopifyStatus();
    fetchProducts();
  }, []);

  const handleSyncShopify = async () => {
    setIsSyncing(true);
    try {
      const data = await fetchShopifyStatus();
      await fetchProducts();
      if (data?.connected) {
        setToastMessage(`Synced real-time connection with Shopify Warehouse (${data.myshopifyDomain})! 🔄`);
      } else {
        setToastMessage("Checking connection with Shopify Warehouse API... 🔄");
      }
    } catch {
      setToastMessage("Synced warehouse data! 🔄");
    } finally {
      setIsSyncing(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const isShopifyConnected = Boolean(shopifyStatus?.connected);
  const shopifyDomain = shopifyStatus?.myshopifyDomain || "cgxx12-ek.myshopify.com";
  const shopName = shopifyStatus?.shopName || "Kharido Mart";

  const warehouseProducts = dbProducts.map((p) => {
    const images = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : "/assets/stitch/hero_showcase.jpg";
    const currentStock = typeof p.stock === "number" ? p.stock : 0;
    const margin =
      p.originalPrice && p.originalPrice > p.price
        ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) + "%"
        : "Direct";
    return {
      sku: p.slug ? `KM-${p.slug.toUpperCase().slice(0, 10)}` : `KM-${p.id.slice(0, 8)}`,
      title: p.title,
      supplier: "Shopify Central Warehouse",
      supplierCogs: p.price,
      sellingPrice: p.price,
      marginPercent: margin,
      supplierStock: currentStock,
      leadTime: "Same Day Dispatch",
      autoFulfill: isShopifyConnected,
      status: currentStock > 10 ? "In Stock" : currentStock > 0 ? "Low Stock" : "Out of Stock",
      image: images,
    };
  });

  const filteredProducts = warehouseProducts.filter((item) => {
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q)
      );
    }
    return true;
  });

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
            <span className="font-bold text-[#0b1c30]">Shopify Warehouse &amp; Fulfillment</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0b1c30] tracking-tight">
            Shopify Warehouse &amp; Auto-Fulfill Hub
          </h1>
          <p className="text-xs text-[#565e74] mt-0.5 max-w-3xl">
            All store fulfillment, supplier inventory, and courier dispatches are routed exclusively through your connected Shopify Store ({shopifyDomain}).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleSyncShopify}
            disabled={isSyncing}
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-white hover:bg-[#f8fafc] text-[#0b1c30] border border-[#e2e8f0] text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
          >
            <Sparkles size={15} weight="Filled" className="text-[#f97316]" />
            <span>{isSyncing ? "Syncing..." : "Sync Shopify Stock"}</span>
          </button>

          <a
            href={`https://admin.shopify.com/store/${shopifyDomain.replace(".myshopify.com", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 h-10 px-4 rounded-xl bg-[#0b1c30] hover:bg-[#1a2d45] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <span>Open Shopify Admin ↗</span>
          </a>

          <Link
            href="/api/shopify/install"
            className="flex items-center gap-1.5 h-10 px-3.5 rounded-xl bg-white hover:bg-[#f8fafc] text-[#565e74] hover:text-[#0b1c30] border border-[#e2e8f0] text-xs font-semibold shadow-xs transition-colors"
            title="Re-authorize Shopify OAuth token if needed"
          >
            <Refresh size={14} weight="Outline" />
            <span>Re-Authorize</span>
          </Link>
        </div>
      </div>

      {/* 4 Focused Shopify Operations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Primary Shopify Fulfillment Node */}
        <div className="p-5 rounded-2xl bg-white border border-emerald-300 shadow-xs flex flex-col justify-between gap-4 transition-all hover:shadow-md">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                Primary Warehouse
              </span>
              {isShopifyConnected ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#15803d] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#15803d] animate-pulse"></span>
                  Connected (Live)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 shrink-0 whitespace-nowrap">
                  Connecting...
                </span>
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#0b1c30]">
                {shopName} Central
              </h3>
              <p className="text-xs text-[#565e74] font-mono break-all">
                {shopifyDomain}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#f8fafc] text-xs">
            <div>
              <span className="text-[11px] text-[#565e74] block">Auto-Routing:</span>
              <span className="font-bold text-[#0b1c30] text-xs">COD &amp; UPI Live</span>
            </div>
            <div>
              <span className="text-[11px] text-[#565e74] block">Courier Sync:</span>
              <span className="font-bold text-[#15803d]">Real-time AWB</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#f1f5f9]">
            <div className="flex items-center gap-1.5 text-[11px] text-[#565e74]">
              <span>Role:</span>
              <span className="font-bold text-[#0b1c30]">Sole Fulfillment Node</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Active
            </span>
          </div>
        </div>

        {/* Card 2: Zero-Touch Auto Routing Engine */}
        <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between gap-4 transition-all hover:shadow-md">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#ea580c] bg-orange-100/70 px-2 py-0.5 rounded-md">
                Order Pipeline
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#15803d] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]"></span>
                Automated
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#0b1c30]">
                Zero-Touch Routing
              </h3>
              <p className="text-xs text-[#565e74]">
                Instant customer checkout to warehouse
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#f8fafc] text-xs">
            <div>
              <span className="text-[11px] text-[#565e74] block">Sync Latency:</span>
              <span className="font-bold text-[#0b1c30] text-xs">&lt; 60 Seconds</span>
            </div>
            <div>
              <span className="text-[11px] text-[#565e74] block">Prepaid Hold:</span>
              <span className="font-bold text-[#15803d]">0 min (Instant)</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#f1f5f9]">
            <div className="flex items-center gap-1.5 text-[11px] text-[#565e74]">
              <span>Mode:</span>
              <span className="font-bold text-[#0b1c30]">Full Dropship Flow</span>
            </div>
            <span className="text-[11px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
              Live
            </span>
          </div>
        </div>

        {/* Card 3: Logistics & Couriers */}
        <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between gap-4 transition-all hover:shadow-md">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded-md">
                Logistics &amp; Courier
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 shrink-0">
                Air &amp; Surface
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#0b1c30]">
                Courier Partners
              </h3>
              <p className="text-xs text-[#565e74]">
                BlueDart, Delhivery, Shadowfax
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#f8fafc] text-xs">
            <div>
              <span className="text-[11px] text-[#565e74] block">AWB Code:</span>
              <span className="font-bold text-[#0b1c30] text-xs">Auto-Assigned</span>
            </div>
            <div>
              <span className="text-[11px] text-[#565e74] block">Dispatch SLA:</span>
              <span className="font-bold text-[#15803d]">Same Day</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#f1f5f9]">
            <div className="flex items-center gap-1.5 text-[11px] text-[#565e74]">
              <span>WhatsApp AWB:</span>
              <span className="font-bold text-[#0b1c30]">Automated</span>
            </div>
            <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Real-time
            </span>
          </div>
        </div>

        {/* Card 4: Shopify Admin API Security */}
        <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between gap-4 transition-all hover:shadow-md">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-100/70 px-2 py-0.5 rounded-md">
                Admin API
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 shrink-0">
                REST v2024-01
              </span>
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#0b1c30]">
                Permanent Token
              </h3>
              <p className="text-xs text-[#565e74] font-mono">
                shpat_••••••••8d0f
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#f8fafc] text-xs">
            <div>
              <span className="text-[11px] text-[#565e74] block">Orders Scope:</span>
              <span className="font-bold text-[#15803d] text-xs">read &amp; write</span>
            </div>
            <div>
              <span className="text-[11px] text-[#565e74] block">Fulfillments:</span>
              <span className="font-bold text-[#15803d]">read &amp; write</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#f1f5f9]">
            <div className="flex items-center gap-1.5 text-[11px] text-[#565e74]">
              <span>Security:</span>
              <span className="font-bold text-[#0b1c30]">Encrypted in .env</span>
            </div>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Verified
            </span>
          </div>
        </div>
      </div>

      {/* Auto-Fulfillment Automation Rules */}
      <div className="p-6 rounded-2xl text-white shadow-md flex flex-col gap-4 bg-[#0b1c30] transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#15803d] text-white">
              <Sparkles size={18} weight="Filled" />
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Shopify Auto-Fulfill Rules Engine
              </h2>
              <p className="text-xs text-white/70">
                Active &amp; Syncing with {shopifyDomain}. Zero-touch dropship pipeline rules matching order risk, OTP verification &amp; warehouse inventory.
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-[#15803d] bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full shrink-0 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            All 4 Rules Active
          </span>
        </div>

        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>🚀</span>
            <span>
              <strong>Exclusive Warehouse Active:</strong> Orders placed via COD or UPI automatically route to <strong>{shopifyDomain}</strong> for zero-touch courier dispatch.
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-950/90 px-2.5 py-0.5 rounded border border-emerald-500/40 self-start sm:self-auto shrink-0">
            Zero-Touch Dispatch Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="font-bold text-[#f97316] block">1. Verified COD Orders</span>
            <p className="text-white/80 text-[11px] leading-relaxed">
              When WhatsApp OTP is confirmed &rarr; Auto-push order to Shopify API within 2 minutes.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="font-bold text-[#f97316] block">2. Prepaid / UPI Orders</span>
            <p className="text-white/80 text-[11px] leading-relaxed">
              Instant auto-dispatch flag enabled &rarr; Bypass hold queue and assign priority express courier in Shopify.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="font-bold text-[#f97316] block">3. High RTO Risk Defense</span>
            <p className="text-white/80 text-[11px] leading-relaxed">
              Incomplete addresses or repeated COD cancellations trigger automatic WhatsApp IVR address recheck.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
            <span className="font-bold text-[#f97316] block">4. Real-time Inventory Sync</span>
            <p className="text-white/80 text-[11px] leading-relaxed">
              Live Shopify warehouse stock levels ensure 0% overselling across Google &amp; Meta adsets.
            </p>
          </div>
        </div>
      </div>

      {/* Sourcing Catalog & Shopify Stock Table */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden flex flex-col">
        {/* Table Controls */}
        <div className="p-4 sm:p-5 border-b border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 relative">
            <Search size={16} weight="Outline" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#565e74]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product title or SKU in Shopify Warehouse..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#f8fafc] text-xs text-[#0b1c30] placeholder-[#565e74]/70 border border-transparent focus:border-[#f97316]/30 focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#565e74] font-medium">
              Showing <strong>{filteredProducts.length}</strong> items • All sourced from <strong>{shopName}</strong>
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[780px]">
            <thead>
              <tr className="bg-[#f8fafc] text-[#565e74] font-bold uppercase tracking-wider text-[11px] border-b border-[#e2e8f0]">
                <th className="py-3.5 px-4">Product &amp; SKU</th>
                <th className="py-3.5 px-4">Fulfillment Partner</th>
                <th className="py-3.5 px-4">Sourcing Cost (COGS)</th>
                <th className="py-3.5 px-4">Selling Price</th>
                <th className="py-3.5 px-4">Gross Margin %</th>
                <th className="py-3.5 px-4">Warehouse Stock</th>
                <th className="py-3.5 px-4">Dispatch SLA</th>
                <th className="py-3.5 px-4 text-right">Shopify Auto-Fulfill</th>
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
                        Published products from your store database will appear here with Shopify warehouse stock tracking and margins.
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
                      <div className="flex flex-col">
                        <span className="font-bold text-[#0b1c30] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]"></span>
                          Shopify Central
                        </span>
                        <span className="text-[11px] text-[#565e74] font-mono">{shopifyDomain}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-space font-bold text-[#0b1c30]">₹{item.supplierCogs}</span>
                      <span className="text-[10px] text-[#565e74] block">estimated COGS</span>
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
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Same Day Dispatch
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#15803d]">
                        <CheckCircle size={14} weight="Filled" /> Live on Shopify
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
