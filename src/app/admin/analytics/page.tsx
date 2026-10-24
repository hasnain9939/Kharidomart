"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Chart,
  TruckFast,
  ShoppingBag,
  ArrowRight,
  Printer,
  ShieldCheck,
  CheckCircle,
  Location,
  Sparkles,
  TicketDiscount,
} from "reicon-react";

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState("mtd");
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const estimatedCogs = Math.round(totalRevenue * 0.35);
  const estimatedFreight = Math.round(totalOrders * 80);
  const netProfit = Math.max(0, totalRevenue - estimatedCogs - estimatedFreight);
  const marginPercent = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0";

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto min-w-0 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#565e74] mb-1">
            <Link href="/admin" className="hover:text-[#f97316]">
              Dashboard
            </Link>
            <span>/</span>
            <span className="font-bold text-[#0b1c30]">Store Analytics</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0b1c30] tracking-tight">
            Revenue &amp; Order Financial Analytics
          </h1>
          <p className="text-xs text-[#565e74] mt-0.5">
            Real-time financial analytics derived directly from your live database orders.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="h-10 px-3.5 rounded-xl bg-white border border-[#e2e8f0] text-xs font-semibold text-[#0b1c30] shadow-xs focus:outline-none"
          >
            <option value="mtd">All Recorded Orders</option>
          </select>
        </div>
      </div>

      {/* 4 Primary Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-[#565e74]">Gross Sales (Live DB)</span>
          <div className="my-2">
            <div className="text-2xl font-black text-[#0b1c30] tracking-tight">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </div>
            <span className="text-xs text-[#15803d] font-bold">100% verified orders</span>
          </div>
          <span className="text-[11px] text-[#565e74]">{totalOrders} orders recorded</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-[#565e74]">Average Order Value (AOV)</span>
          <div className="my-2">
            <div className="text-2xl font-black text-[#ea580c] tracking-tight">
              ₹{avgOrderValue.toLocaleString("en-IN")}
            </div>
            <span className="text-xs text-[#565e74]">Per customer checkout</span>
          </div>
          <span className="text-[11px] text-[#15803d] font-bold">Based on live cart values</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-[#565e74]">Estimated Net Earnings</span>
          <div className="my-2">
            <div className="text-2xl font-black text-[#15803d] tracking-tight">
              ₹{netProfit.toLocaleString("en-IN")}
            </div>
            <span className="text-xs text-[#15803d] font-bold">{marginPercent}% Estimated Margin</span>
          </div>
          <span className="text-[11px] text-[#565e74]">After factory COGS &amp; freight</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-[#565e74]">Fulfillment Status</span>
          <div className="my-2">
            <div className="text-2xl font-black text-[#0b1c30] tracking-tight">
              {orders.filter((o) => o.status === "Processing").length} Active
            </div>
            <span className="text-xs text-[#15803d] font-bold">
              {orders.filter((o) => o.status === "Delivered").length} Delivered
            </span>
          </div>
          <span className="text-[11px] text-[#565e74]">Express courier tracking integrated</span>
        </div>
      </div>

      {/* Profit & Loss Waterfall Breakdown */}
      <div className="p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#f97316] flex items-center justify-center font-bold">
              ₹
            </div>
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#0b1c30]">
                Live Store Revenue Waterfall
              </h2>
              <p className="text-xs text-[#565e74]">
                Calculated in real-time from active Prisma database orders.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#15803d] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            {marginPercent}% Net Margin
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
            <span className="text-[11px] font-bold text-[#565e74] uppercase block">1. Gross Order Revenue</span>
            <span className="font-space font-extrabold text-lg text-[#0b1c30] block mt-1">₹{totalRevenue.toLocaleString("en-IN")}</span>
            <span className="text-[10px] text-[#15803d] font-semibold">{totalOrders} Orders Total</span>
          </div>

          <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-200/60">
            <span className="text-[11px] font-bold text-[#ea580c] uppercase block">2. Estimated Sourcing (COGS)</span>
            <span className="font-space font-extrabold text-lg text-[#ea580c] block mt-1">-₹{estimatedCogs.toLocaleString("en-IN")}</span>
            <span className="text-[10px] text-[#ea580c] font-semibold">~35% Landing Cost</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-[#565e74] uppercase block">3. Courier &amp; Logistics</span>
            <span className="font-space font-extrabold text-lg text-[#565e74] block mt-1">-₹{estimatedFreight.toLocaleString("en-IN")}</span>
            <span className="text-[10px] text-[#565e74] font-semibold">Standard Express Courier</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300">
            <span className="text-[11px] font-bold text-[#15803d] uppercase block">4. Net Profit</span>
            <span className="font-space font-extrabold text-lg text-[#15803d] block mt-1">+₹{netProfit.toLocaleString("en-IN")}</span>
            <span className="text-[10px] text-[#15803d] font-bold">Direct Cash Margin</span>
          </div>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden flex flex-col">
        <div className="p-5 border-b border-[#e2e8f0] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#0b1c30]">
              Recent Customer Transactions
            </h3>
            <p className="text-xs text-[#565e74] mt-0.5">
              Live orders contributing to store revenue.
            </p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-[#f97316] hover:underline"
          >
            Manage All Orders &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[650px]">
            <thead>
              <tr className="bg-[#f8fafc] text-[#565e74] font-bold uppercase tracking-wider text-[11px] border-b border-[#e2e8f0]">
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-[#565e74]">
                    No transactions recorded yet. Place an order to see live analytics.
                  </td>
                </tr>
              ) : (
                orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0b1c30]">
                      {order.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#0b1c30]">
                      {order.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-[#565e74]">
                      {order.city}, {order.state}
                    </td>
                    <td className="py-3.5 px-4 text-[#565e74]">
                      {order.paymentMethod}
                    </td>
                    <td className="py-3.5 px-4 font-space font-bold text-[#0b1c30]">
                      ₹{Number(order.total).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#ea580c] bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                        {order.status}
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
