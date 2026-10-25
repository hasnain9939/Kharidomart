"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  TruckFast,
  ShoppingBag,
  Box,
  Add,
  ShieldCheck,
  CheckCircle,
  CloseCircle,
  Clock,
  Location,
  Copy,
  Refresh,
} from "reicon-react";
import { useStore } from "@/context/StoreContext";

interface DbOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  total: number;
  paymentMethod: string;
  status: string;
  courier: string;
  awbNumber: string;
  createdAt: string;
  items: Array<{
    id: string;
    title: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
}

export default function AdminDashboardPage() {
  const { products } = useStore();
  const [orders, setOrders] = useState<DbOrder[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "processing" | "shipped" | "delivered" | "cancelled">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cancelConfirmOrder, setCancelConfirmOrder] = useState<DbOrder | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [shopifyStatus, setShopifyStatus] = useState<{
    configured: boolean;
    connected: boolean;
    shopName?: string;
    myshopifyDomain?: string;
  } | null>(null);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error("Failed to fetch admin orders", e);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetch("/api/shopify/status")
      .then((r) => r.json())
      .then((d) => setShopifyStatus(d))
      .catch(() => {});
  }, []);

  const cancelledOrders = orders.filter((o) => o.status?.toLowerCase() === "cancelled");
  const cancelledCount = cancelledOrders.length;
  const cancelledValue = cancelledOrders.reduce((acc, o) => acc + (o.total || 0), 0);

  const activeOrders = orders.filter((o) => o.status?.toLowerCase() !== "cancelled");
  const totalRevenue = activeOrders.reduce((acc, o) => acc + (o.total || 0), 0);
  const pendingOrders = orders.filter(
    (o) => o.status === "Processing" || o.status === "Pending Dispatch"
  ).length;
  const inTransitOrders = orders.filter(
    (o) => o.status === "In Transit" || o.status === "Shipped"
  ).length;
  const deliveredOrders = orders.filter((o) => o.status === "Delivered").length;

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "processing")
      return order.status === "Processing" || order.status === "Pending Dispatch";
    if (activeTab === "shipped")
      return order.status === "In Transit" || order.status === "Shipped";
    if (activeTab === "delivered") return order.status === "Delivered";
    if (activeTab === "cancelled") return order.status?.toLowerCase() === "cancelled";
    return true;
  });

  const handleCancelOrder = async (order: DbOrder) => {
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, status: "Cancelled" } : o))
        );
        setToastMessage(`Order #${order.orderNumber} successfully cancelled before shipping.`);
        setCancelConfirmOrder(null);
      } else {
        setToastMessage(`Failed to cancel order: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error cancelling order:", err);
      setToastMessage("Network error while cancelling order.");
    } finally {
      setIsCancelling(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleCopyAwb = (awb: string) => {
    navigator.clipboard.writeText(awb);
    setToastMessage(`Tracking code copied: ${awb}`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto min-w-0">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0b1c30] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-[#f97316] animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle size={16} weight="Filled" className="text-[#15803d]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Operations Header & Context Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full bg-[#ffedd5] text-[#ea580c] text-[11px] font-bold tracking-wider uppercase">
                Store Operations Live
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-[#565e74] text-xs font-medium border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]"></span>
                Prisma • PostgreSQL
              </span>
              {shopifyStatus?.connected && (
                <Link
                  href="/admin/inventory"
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#15803d] animate-pulse"></span>
                  Shopify Warehouse Live ({shopifyStatus.myshopifyDomain})
                </Link>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b1c30] tracking-tight">
              Kharido Mart Store Overview &amp; Control
            </h1>
          </div>

          {/* Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
            <button
              onClick={fetchOrders}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-white hover:bg-[#f8fafc] text-[#565e74] hover:text-[#0b1c30] border border-[#e2e8f0] shadow-xs text-xs font-semibold transition-colors"
            >
              <Refresh size={14} weight="Outline" />
              <span>Refresh</span>
            </button>
            <Link
              href="/admin/products/new"
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <Add size={16} weight="Outline" />
              <span>+ Add New Product</span>
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1.5 h-9 px-3.5 rounded-xl bg-[#0b1c30] hover:bg-[#1a2d47] text-white text-xs font-bold shadow-xs transition-all"
            >
              <TruckFast size={15} weight="Outline" />
              <span>Manage Orders ({orders.length})</span>
            </Link>
          </div>
        </div>

      </div>

      {/* 5 Primary Real KPI Cards (Includes Cancelled Orders Card) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Metric 1: Real Total Store Sales */}
        <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#565e74]">Net Store Sales</span>
            <span className="px-2 py-0.5 rounded-full bg-[#caecbf]/60 text-[#1d3819] text-[10px] font-bold">
              Database Live
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-[#0b1c30] tracking-tight font-mono">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </div>
            <span className="text-xs text-[#565e74]">
              From {activeOrders.length} active orders
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#15803d] font-semibold">
            <CheckCircle size={14} weight="Filled" />
            <span>Excludes cancelled</span>
          </div>
        </div>

        {/* Metric 2: Total Real Orders */}
        <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#565e74]">Total Orders</span>
            <span className="px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#0b1c30] text-[10px] font-bold">
              Prisma DB
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-[#0b1c30] tracking-tight font-mono">
              {orders.length}
            </div>
            <span className="text-xs text-[#565e74]">
              {pendingOrders} awaiting fulfillment
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#565e74]">
            <TruckFast size={14} weight="Outline" className="text-[#f97316]" />
            <span>{inTransitOrders} in transit • {deliveredOrders} delivered</span>
          </div>
        </div>

        {/* Metric 3: Cancelled Orders Card (Requested by User) */}
        <div
          onClick={() => setActiveTab("cancelled")}
          className="p-5 rounded-2xl bg-white border border-[#fecdd3] hover:border-rose-400 shadow-xs flex flex-col justify-between cursor-pointer transition-all hover:shadow-md group relative overflow-hidden"
          title="Click to view all cancelled orders"
        >
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#565e74] group-hover:text-rose-700 transition-colors">
              Cancelled Orders
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#ba1a1a] text-[10px] font-bold">
              Pre-Shipping
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-[#ba1a1a] tracking-tight font-mono flex items-baseline gap-2">
              <span>{cancelledCount}</span>
              <span className="text-xs font-bold text-[#ba1a1a]/70 font-sans">
                (₹{cancelledValue.toLocaleString("en-IN")})
              </span>
            </div>
            <span className="text-xs text-[#565e74]">
              Saved from courier &amp; RTO costs
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-[#ba1a1a] font-semibold text-[11px]">
              <CloseCircle size={13} weight="Filled" />
              <span>Cancelled before dispatch</span>
            </span>
            <span className="text-[10px] text-rose-600 font-bold underline opacity-0 group-hover:opacity-100 transition-opacity">
              View &rarr;
            </span>
          </div>
        </div>

        {/* Metric 4: Active Catalog Products */}
        <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#565e74]">Catalog Products</span>
            <span className="px-2 py-0.5 rounded-full bg-[#ffedd5] text-[#ea580c] text-[10px] font-bold">
              Live in Shop
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-[#0b1c30] tracking-tight font-mono">
              {products.length}
            </div>
            <span className="text-xs text-[#565e74]">
              {products.filter((p) => p.stock > 0).length} in stock right now
            </span>
          </div>
          <Link
            href="/admin/products"
            className="text-xs text-[#ea580c] font-bold hover:underline flex items-center gap-1"
          >
            Manage Products &rarr;
          </Link>
        </div>

        {/* Metric 5: Warehouse & Fulfillment Sync */}
        <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-[#565e74]">Warehouse Sync</span>
            <span className="px-2 py-0.5 rounded-full bg-[#caecbf]/60 text-[#1d3819] text-[10px] font-bold">
              Shopify Central
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl sm:text-3xl font-black text-[#0b1c30] tracking-tight font-mono">
              {orders.filter((o) => o.status === "Delivered" || o.status === "In Transit" || o.status === "Shipped").length}/{orders.length}
            </div>
            <span className="text-xs text-[#565e74]">
              Orders dispatched or delivered
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-[#565e74]">
            <ShieldCheck size={14} weight="Filled" className="text-[#15803d]" />
            <span>Fulfillment SLA Active</span>
          </div>
        </div>
      </div>

      {/* Orders Table Section */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-[#0b1c30]">Recent Customer Orders</h2>
            <p className="text-xs text-[#565e74] mt-0.5">
              Live orders received from customer checkouts across India. Pre-shipping orders can be cancelled directly.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-[#ea580c] hover:underline flex items-center gap-1"
          >
            <span>View All in Fulfillment View &rarr;</span>
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 border-b border-[#f1f5f9]">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "all"
                ? "bg-[#0b1c30] text-white shadow-xs"
                : "bg-[#f8fafc] text-[#565e74] hover:bg-[#e2e8f0]"
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("processing")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "processing"
                ? "bg-[#0b1c30] text-white shadow-xs"
                : "bg-[#f8fafc] text-[#565e74] hover:bg-[#e2e8f0]"
            }`}
          >
            Processing ({pendingOrders})
          </button>
          <button
            onClick={() => setActiveTab("shipped")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "shipped"
                ? "bg-[#0b1c30] text-white shadow-xs"
                : "bg-[#f8fafc] text-[#565e74] hover:bg-[#e2e8f0]"
            }`}
          >
            In Transit ({inTransitOrders})
          </button>
          <button
            onClick={() => setActiveTab("delivered")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              activeTab === "delivered"
                ? "bg-[#0b1c30] text-white shadow-xs"
                : "bg-[#f8fafc] text-[#565e74] hover:bg-[#e2e8f0]"
            }`}
          >
            Delivered ({deliveredOrders})
          </button>
          <button
            onClick={() => setActiveTab("cancelled")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "cancelled"
                ? "bg-[#ba1a1a] text-white shadow-xs"
                : "bg-[#f8fafc] text-[#565e74] hover:bg-rose-50 hover:text-[#ba1a1a]"
            }`}
          >
            <CloseCircle size={13} weight={activeTab === "cancelled" ? "Filled" : "Outline"} />
            <span>Cancelled ({cancelledCount})</span>
          </button>
        </div>

        {/* Orders Table */}
        {isLoadingOrders ? (
          <div className="py-12 text-center text-xs text-[#565e74] animate-pulse">
            Loading real orders from database...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-14 text-center space-y-3 bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
            <ShoppingBag size={32} weight="Filled" className="text-[#94a3b8] mx-auto" />
            <p className="text-sm font-bold text-[#0b1c30]">No orders found in this view</p>
            <p className="text-xs text-[#565e74] max-w-sm mx-auto">
              {orders.length === 0
                ? "Your database is empty and ready. Place a test order from the checkout page to see it appear here!"
                : "Try selecting a different tab."}
            </p>
            {orders.length === 0 && (
              <div className="pt-1">
                <Link
                  href="/shop"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0b1c30] hover:bg-[#1a2d47] text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                >
                  <span>Open Storefront &rarr;</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto w-full rounded-xl">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead>
                <tr className="bg-[#f8fafc] text-[#565e74] font-bold uppercase tracking-wider text-[11px] border-b border-[#e2e8f0]">
                  <th className="py-3 px-4 rounded-l-xl">Order &amp; Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Amount &amp; Payment</th>
                  <th className="py-3 px-4">AWB &amp; Logistics</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filteredOrders.slice(0, 8).map((order) => {
                  const isPreShipping = order.status === "Processing" || order.status === "Pending Dispatch";
                  const isCancelled = order.status?.toLowerCase() === "cancelled";

                  return (
                    <tr key={order.id} className="hover:bg-[#f8f9ff] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-[#f97316]">
                            {order.orderNumber}
                          </span>
                          <span className="font-bold text-[#0b1c30] mt-0.5">
                            {order.customerName}
                          </span>
                          <span className="text-[#565e74] text-[11px] flex items-center gap-1">
                            <Location size={11} weight="Outline" /> {order.city}, {order.state} - {order.pincode}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#0b1c30] line-clamp-1 max-w-[220px]">
                            {order.items[0]?.title || "Store Item"}
                          </span>
                          <span className="text-[#565e74] text-[11px]">
                            {order.items.length} {order.items.length === 1 ? "item" : "items"} (Total Qty: {order.items.reduce((s, it) => s + it.quantity, 0)})
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#0b1c30] font-mono">
                            ₹{order.total}
                          </span>
                          <span
                            className={`text-[11px] font-bold flex items-center gap-0.5 ${
                              order.paymentMethod === "UPI"
                                ? "text-[#15803d]"
                                : "text-[#ea580c]"
                            }`}
                          >
                            {order.paymentMethod === "UPI" ? (
                              <CheckCircle size={12} weight="Filled" />
                            ) : (
                              <Clock size={12} weight="Outline" />
                            )}
                            {order.paymentMethod}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          {order.awbNumber ? (
                            <button
                              onClick={() => handleCopyAwb(order.awbNumber)}
                              className="font-mono text-[11px] text-[#0b1c30] hover:text-[#ea580c] flex items-center gap-1 text-left"
                              title="Click to copy AWB"
                            >
                              <span>{order.awbNumber}</span>
                              <Copy size={11} weight="Outline" />
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#565e74] italic">Pending Dispatch</span>
                          )}
                          <span className="text-[#565e74] text-[11px]">
                            {order.courier || "Standard Delivery"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            order.status === "Delivered"
                              ? "bg-[#caecbf]/70 text-[#1d3819]"
                              : order.status === "In Transit" || order.status === "Shipped"
                              ? "bg-[#d3e4fe] text-[#0b1c30]"
                              : isCancelled
                              ? "bg-[#ffdad6] text-[#ba1a1a]"
                              : "bg-[#ffedd5] text-[#ea580c]"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          {isPreShipping && (
                            <button
                              onClick={() => setCancelConfirmOrder(order)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-[#ba1a1a] font-bold text-xs transition-all border border-rose-200 cursor-pointer active:scale-95 shadow-2xs"
                              title="Cancel order before shipping"
                            >
                              <CloseCircle size={13} weight="Filled" />
                              <span>Cancel</span>
                            </button>
                          )}
                          <Link
                            href="/admin/orders"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#f8fafc] hover:bg-[#ffedd5] text-[#0b1c30] hover:text-[#ea580c] font-bold text-xs transition-colors border border-[#e2e8f0]"
                          >
                            Manage &rarr;
                          </Link>
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

      {/* Catalog & Inventory Overview */}
      <div className="grid grid-cols-1 gap-5">
        {/* Live Catalog */}
        <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Box size={20} weight="Filled" className="text-[#ea580c]" />
                <h3 className="font-extrabold text-base text-[#0b1c30]">
                  Live Products Catalog ({products.length})
                </h3>
              </div>
              <Link
                href="/admin/products"
                className="text-xs font-bold text-[#ea580c] hover:underline"
              >
                View all &rarr;
              </Link>
            </div>
            <p className="text-xs text-[#565e74] mb-4">
              Real inventory items currently published in your store database.
            </p>

            {products.length === 0 ? (
              <div className="p-6 text-center bg-[#f8fafc] rounded-xl border border-[#e2e8f0] space-y-2">
                <p className="text-xs font-bold text-[#0b1c30]">No products added yet</p>
                <p className="text-[11px] text-[#565e74]">
                  Click below to publish your first product with price, description, and images.
                </p>
                <div className="pt-1">
                  <Link
                    href="/admin/products/new"
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#ea580c] text-white rounded-lg text-xs font-bold"
                  >
                    + Add Product Now
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {products.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-white overflow-hidden relative shrink-0 border border-[#e2e8f0]">
                        <Image
                          src={p.images[0] || "/assets/stitch/hero_showcase.jpg"}
                          alt={p.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#0b1c30] truncate block">
                          {p.title}
                        </span>
                        <span className="text-[10px] text-[#565e74] block">
                          Stock: {p.stock}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-[#0b1c30] shrink-0 ml-2">
                      ₹{p.price}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-xs">
            <span className="text-[#565e74]">Need to add new inventory?</span>
            <Link
              href="/admin/products/new"
              className="font-bold text-[#ea580c] hover:underline"
            >
              + Create Product
            </Link>
          </div>
        </div>
      </div>

      {/* Cancel Order Confirmation Modal */}
      {cancelConfirmOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => !isCancelling && setCancelConfirmOrder(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-rose-200 animate-in fade-in zoom-in-95 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-[#ba1a1a] flex items-center justify-center shrink-0">
                <CloseCircle size={26} weight="Filled" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#0b1c30]">
                  Cancel Order Before Shipping?
                </h3>
                <p className="text-xs text-[#565e74]">
                  Order #{cancelConfirmOrder.orderNumber}
                </p>
              </div>
            </div>

            <div className="bg-[#f8fafc] rounded-2xl p-4 border border-[#e2e8f0] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#565e74]">Customer:</span>
                <span className="font-bold text-[#0b1c30]">{cancelConfirmOrder.customerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#565e74]">Phone:</span>
                <span className="font-mono font-medium text-[#0b1c30]">{cancelConfirmOrder.customerPhone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#565e74]">Order Total:</span>
                <span className="font-bold font-mono text-[#0b1c30]">₹{cancelConfirmOrder.total} ({cancelConfirmOrder.paymentMethod})</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#565e74]">Current Status:</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px]">
                  {cancelConfirmOrder.status}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#565e74] leading-relaxed">
              Cancelling this order now marks it as <strong>Cancelled (Pre-Shipment)</strong> in the database. This halts fulfillment, stops courier pickup, and avoids courier RTO loss.
            </p>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setCancelConfirmOrder(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#e2e8f0] bg-white hover:bg-slate-50 text-[#0b1c30] text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                No, Keep Order
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => handleCancelOrder(cancelConfirmOrder)}
                className="flex-1 py-2.5 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isCancelling ? (
                  <span>Cancelling...</span>
                ) : (
                  <>
                    <CloseCircle size={14} weight="Filled" />
                    <span>Confirm Cancel</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
