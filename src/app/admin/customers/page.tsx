"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Phone,
  Location,
  CloseCircle,
} from "reicon-react";
import { ADMIN_CUSTOMERS, AdminCustomer } from "@/data/adminData";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[]>(ADMIN_CUSTOMERS);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState("All");
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const [ordersRes, usersRes] = await Promise.all([
          fetch("/api/orders").then((r) => r.json()).catch(() => ({ success: false, orders: [] })),
          fetch("/api/users").then((r) => r.json()).catch(() => ({ success: false, users: [] })),
        ]);

        const map = new Map<string, AdminCustomer>();

        // 1. Add all registered members from Postgres database
        if (usersRes.success && Array.isArray(usersRes.users)) {
          usersRes.users.forEach((u: AdminCustomer) => {
            const key = u.email || u.phone || u.id;
            map.set(key, u);
          });
        }

        // 2. Add or update with order records
        if (ordersRes.success && Array.isArray(ordersRes.orders)) {
          ordersRes.orders.forEach((o: any) => {
            const key = o.customerEmail || o.customerPhone || o.customerName;
            if (map.has(key)) {
              const existing = map.get(key)!;
              existing.ordersCount += 1;
              existing.lifetimeValue += Number(o.total || 0);
              existing.tier = existing.ordersCount > 1 ? "Repeat Buyer" : "First-Time";
            } else {
              map.set(key, {
                id: `cust-${o.id}`,
                name: o.customerName || "Customer",
                phone: o.customerPhone ? `+91 ${o.customerPhone}` : "N/A",
                email: o.customerEmail || "N/A",
                city: o.city || "India",
                state: o.state || "",
                ordersCount: 1,
                lifetimeValue: Number(o.total || 0),
                lastOrderDate: new Date(o.createdAt).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                }),
                tier: "First-Time",
              });
            }
          });
        }

        setCustomers(Array.from(map.values()));
      } catch {
        setCustomers([]);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    if (tierFilter !== "All" && c.tier !== tierFilter) return false;
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchEmail = c.email.toLowerCase().includes(q);
      const matchPhone = c.phone.includes(q);
      const matchCity = c.city.toLowerCase().includes(q);
      return matchName || matchEmail || matchPhone || matchCity;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#565e74] mb-1">
            <Link href="/admin" className="hover:text-[#f97316]">
              Dashboard
            </Link>
            <span>/</span>
            <span className="font-bold text-[#0b1c30]">Customers &amp; CRM</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0b1c30] tracking-tight">
            Customer Directory &amp; Lifetime Value
          </h1>
          <p className="text-xs text-[#565e74] mt-0.5">
            Real customer records generated from placed store orders.
          </p>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-[#565e74]">Total Verified Customers</span>
          <div className="my-2">
            <div className="text-2xl font-black text-[#0b1c30] tracking-tight">
              {customers.length}
            </div>
            <span className="text-xs text-[#15803d] font-bold">From database orders</span>
          </div>
          <span className="text-[11px] text-[#565e74]">Phone &amp; address recorded</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-[#565e74]">Repeat Purchase Rate</span>
          <div className="my-2">
            <div className="text-2xl font-black text-[#f97316] tracking-tight">
              {customers.length > 0
                ? ((customers.filter((c) => c.ordersCount > 1).length / customers.length) * 100).toFixed(0) + "%"
                : "0%"}
            </div>
            <span className="text-xs text-[#565e74]">Repeat buyers</span>
          </div>
          <span className="text-[11px] text-[#15803d] font-bold">Real database metric</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-[#565e74]">Average Lifetime Value (LTV)</span>
          <div className="my-2">
            <div className="text-2xl font-black text-[#0b1c30] tracking-tight">
              ₹{customers.length > 0
                ? Math.round(customers.reduce((sum, c) => sum + c.lifetimeValue, 0) / customers.length).toLocaleString("en-IN")
                : 0}
            </div>
            <span className="text-xs text-[#565e74]">Revenue per customer</span>
          </div>
          <span className="text-[11px] text-[#565e74]">Calculated across all orders</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-[#565e74]">Repeat Buyers</span>
          <div className="my-2">
            <div className="text-2xl font-black text-[#15803d] tracking-tight">
              {customers.filter((c) => c.ordersCount > 1).length}
            </div>
            <span className="text-xs text-[#565e74]">Multiple orders</span>
          </div>
          <span className="text-[11px] text-[#ea580c] font-bold">Loyal customers</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} weight="Outline" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#565e74]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, email, phone, or city..."
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#f8fafc] text-xs text-[#0b1c30] placeholder-[#565e74]/70 border border-transparent focus:border-[#f97316]/30 focus:bg-white focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs font-semibold text-[#0b1c30] focus:outline-none"
          >
            <option value="All">All Customer Tiers</option>
            <option value="VIP Customer">VIP Customer</option>
            <option value="Repeat Buyer">Repeat Buyer</option>
            <option value="First-Time">First-Time</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="bg-[#f8fafc] text-[#565e74] font-bold uppercase tracking-wider text-[11px] border-b border-[#e2e8f0]">
                <th className="py-3.5 px-4">Customer Name &amp; Contact</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Total Orders</th>
                <th className="py-3.5 px-4">Lifetime Value (LTV)</th>
                <th className="py-3.5 px-4">Segment Tier</th>
                <th className="py-3.5 px-4">Last Order</th>
                <th className="py-3.5 px-4 text-right">Care Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f5f9]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#565e74]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users size={32} weight="Outline" className="text-[#94a3b8]" />
                      <span className="font-bold text-sm text-[#0b1c30]">No customer accounts found</span>
                      <span className="max-w-xs text-[#64748b]">
                        Customer profiles are created automatically when real shoppers place orders on your store.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    onClick={() => setSelectedCustomer(cust)}
                    className="hover:bg-[#f8f9ff] cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#0b1c30] hover:text-[#f97316]">
                          {cust.name}
                        </span>
                        <span className="text-[#565e74] text-[11px]">
                          {cust.email}
                        </span>
                        <span className="text-[#565e74] text-[11px] font-mono">
                          {cust.phone}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-[#0b1c30] font-medium">
                        <Location size={13} weight="Outline" className="text-[#f97316]" />
                        <span>{cust.city}, {cust.state}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#0b1c30]">
                      {cust.ordersCount} Orders
                    </td>
                    <td className="py-3.5 px-4 font-black text-sm text-[#0b1c30]">
                      ₹{cust.lifetimeValue.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          cust.tier === "VIP Customer"
                            ? "bg-[#ffedd5] text-[#ea580c]"
                            : cust.tier === "Repeat Buyer"
                            ? "bg-[#caecbf]/70 text-[#1d3819]"
                            : "bg-[#eff4ff] text-[#0b1c30]"
                        }`}
                      >
                        {cust.tier}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#565e74]">
                      {cust.lastOrderDate}
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={`https://wa.me/${cust.phone.replace(/[^0-9]/g, "")}?text=Hello%20${encodeURIComponent(
                          cust.name
                        )},%20thank%20you%20for%20shopping%20with%20Kharido%20Mart!`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#15803d]/10 hover:bg-[#15803d]/20 text-[#15803d] font-bold text-xs transition-colors"
                      >
                        <Phone size={12} weight="Filled" />
                        <span>WhatsApp</span>
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#e2e8f0] mb-5">
                <div>
                  <h3 className="font-black text-base text-[#0b1c30]">
                    {selectedCustomer.name}
                  </h3>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedCustomer.tier === "VIP Customer"
                        ? "bg-[#ffedd5] text-[#ea580c]"
                        : "bg-[#caecbf]/70 text-[#1d3819]"
                    }`}
                  >
                    {selectedCustomer.tier}
                  </span>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="text-[#565e74]">
                  <CloseCircle size={22} weight="Outline" />
                </button>
              </div>

              {/* LTV Snapshot */}
              <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] mb-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#565e74]">Lifetime Value</span>
                  <div className="text-xl font-black text-[#0b1c30]">
                    ₹{selectedCustomer.lifetimeValue.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#565e74]">Total Purchases</span>
                  <div className="text-xl font-black text-[#f97316]">
                    {selectedCustomer.ordersCount} Orders
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div className="flex flex-col gap-2.5 text-xs text-[#0b1c30] mb-6">
                <div className="flex items-center gap-2">
                  <Phone size={14} weight="Outline" className="text-[#f97316]" />
                  <span className="font-mono font-bold">{selectedCustomer.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Location size={14} weight="Outline" className="text-[#f97316]" />
                  <span>{selectedCustomer.city}, {selectedCustomer.state}</span>
                </div>
                <div className="text-[#565e74] text-xs">
                  Email: {selectedCustomer.email}
                </div>
              </div>

              {/* Order history note */}
              <div className="p-3.5 rounded-xl bg-[#eff4ff] text-xs text-[#565e74]">
                Customer frequently purchases <strong>Mom &amp; Baby Care</strong> collections. Eligible for exclusive WhatsApp retention offers.
              </div>
            </div>

            <div className="pt-4 border-t border-[#e2e8f0]">
              <a
                href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="w-full h-11 rounded-xl bg-[#15803d] hover:bg-[#166534] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Phone size={16} weight="Filled" />
                <span>Message on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
