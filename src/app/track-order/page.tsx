"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  TruckFast,
  ShieldCheck,
  CheckCircle,
  Location,
  Copy,
  Printer,
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
} from "reicon-react";
import { useStore } from "@/context/StoreContext";

interface OrderCustomer {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  pincode?: string;
  state?: string;
}

interface StoredOrder {
  orderId: string;
  date: string;
  createdAt?: string;
  customer: OrderCustomer;
  items: Array<{
    product: {
      id: string;
      title: string;
      shortTitle?: string;
      price: number;
      images: string[];
    };
    quantity: number;
  }>;
  paymentMethod: string;
  shippingMethod?: string;
  subtotal?: number;
  discountAmount?: number;
  grandTotal: number;
  status?: string;
  awbNumber?: string;
  courier?: string;
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams?.get("orderId") || "";
  const { showToast } = useStore();

  const [orderIdQuery, setOrderIdQuery] = useState(initialOrderId);
  const [contactQuery, setContactQuery] = useState("");
  const [searchedOrder, setSearchedOrder] = useState<StoredOrder | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSavedOrder, setRecentSavedOrder] = useState<StoredOrder | null>(null);

  // Check for any recently placed order by this browser
  useEffect(() => {
    try {
      const latest = localStorage.getItem("km_latest_order");
      if (latest) {
        const parsed = JSON.parse(latest);
        setRecentSavedOrder(parsed);
        if (parsed.customer?.phone && !contactQuery) {
          setContactQuery(parsed.customer.phone);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanOrderId = orderIdQuery.trim();
    const cleanContact = contactQuery.trim();

    if (!cleanOrderId) {
      showToast("Please enter your Order ID (#KM-2026-XXXXX)", "warning");
      return;
    }
    if (!cleanContact) {
      showToast("Please enter your matching 10-digit mobile number or email", "warning");
      return;
    }

    setHasSearched(true);
    setSearchError(null);
    setIsSearching(true);

    try {
      const res = await fetch(
        `/api/orders/${encodeURIComponent(cleanOrderId)}?contact=${encodeURIComponent(cleanContact)}`
      );
      const data = await res.json();

      if (res.ok && data.success && data.order) {
        const dbOrder = data.order;
        const mappedOrder: StoredOrder = {
          orderId: dbOrder.orderNumber,
          date: dbOrder.createdAt,
          createdAt: dbOrder.createdAt,
          awbNumber: dbOrder.awbNumber,
          status: dbOrder.status,
          courier: dbOrder.courier,
          customer: {
            fullName: "Verified Customer",
            phone: "",
            email: "",
            address: "Verified Delivery Destination",
          },
          items: (dbOrder.items || []).map((it: any) => ({
            product: {
              id: it.productId || it.id,
              title: it.title,
              shortTitle: it.title,
              price: it.price,
              images: it.image ? [it.image] : ["/assets/stitch/hero_showcase.jpg"],
            },
            quantity: it.quantity,
          })),
          paymentMethod: dbOrder.paymentMethod || "COD",
          subtotal: dbOrder.subtotal,
          discountAmount: dbOrder.discountAmount,
          grandTotal: dbOrder.total,
        };

        setSearchedOrder(mappedOrder);
        showToast("Order tracking details found! 📦");
      } else {
        setSearchedOrder(null);
        setSearchError(data.error || "No order matching the provided Order Number and Contact was found.");
        showToast(data.error || "No order found with matching credentials.", "warning");
      }
    } catch {
      setSearchedOrder(null);
      setSearchError("Unable to retrieve tracking details. Please check your network connection.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleCopyAWB = (awb: string) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(awb);
      showToast("AWB tracking code copied to clipboard! 📋");
    }
  };

  interface TrackingStep {
    title: string;
    desc: string;
    status: "completed" | "current" | "upcoming";
    time: string;
    location?: string;
  }

  function getDynamicTrackingSteps(order: StoredOrder): TrackingStep[] {
    const rawDate = order.createdAt || order.date;
    const createdDate = rawDate ? new Date(rawDate) : new Date();
    const formattedCreated = !isNaN(createdDate.getTime())
      ? `${createdDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}, ${createdDate.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`
      : "Order Booked";

    const courierName = order.courier || "Standard Express Delivery";
    const awbStr = order.awbNumber ? `(AWB: ${order.awbNumber})` : "";
    const isCancelled = order.status === "Cancelled";
    const isDelivered = order.status === "Delivered";
    const isShipped = order.status === "Shipped";
    const isProcessing = !isCancelled && !isDelivered && !isShipped;

    if (isCancelled) {
      return [
        {
          title: "Order Placed",
          desc: "Order initially submitted by customer",
          status: "completed",
          time: formattedCreated,
          location: "Online Store",
        },
        {
          title: "Order Cancelled",
          desc: "Order was cancelled prior to shipment dispatch. No cargo pickup generated.",
          status: "current",
          time: "Cancelled",
          location: "Central Warehouse",
        },
      ];
    }

    return [
      {
        title: "Order Confirmed",
        desc: "Order verified and queued for warehouse picking",
        status: "completed",
        time: formattedCreated,
        location: "Shopify Central Warehouse",
      },
      {
        title: "Packed & Quality Inspected",
        desc: isProcessing
          ? "Inspection & barcode scanning in progress at Central Warehouse"
          : "3-point quality check completed & protective packaging sealed",
        status: isProcessing ? "current" : "completed",
        time: isProcessing ? "In Progress" : "Completed",
        location: "Central Warehouse",
      },
      {
        title: `Handed to Courier (${courierName})`,
        desc: isProcessing
          ? `Courier dispatch scheduled with ${courierName}`
          : `Shipment handed over to logistics partner ${awbStr}`,
        status: isProcessing ? "upcoming" : isShipped ? "current" : "completed",
        time: isShipped ? "In Transit" : isDelivered ? "Dispatched" : "Scheduled",
        location: isShipped || isDelivered ? "In Transit" : "Logistics Hub",
      },
      {
        title: "Out for Doorstep Delivery",
        desc: isDelivered
          ? "Courier delivery partner delivered package to recipient address"
          : isShipped
          ? "Shipment reaching destination delivery station"
          : "Delivery partner will be assigned upon regional hub arrival",
        status: isDelivered ? "completed" : "upcoming",
        time: isDelivered ? "Completed" : "Expected in 2–4 Days",
        location: "Destination Station",
      },
      {
        title: "Delivered & Handed Over",
        desc: isDelivered
          ? "Package successfully handed over to customer"
          : "Pending final delivery & doorstep OTP verification",
        status: isDelivered ? "completed" : "upcoming",
        time: isDelivered ? "Delivered" : "Pending Delivery",
        location: "Doorstep",
      },
    ];
  }

  const trackingSteps = searchedOrder ? getDynamicTrackingSteps(searchedOrder) : [];

  return (
    <div className="w-full bg-[#f8f9ff] min-h-screen py-10 sm:py-16">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#584237] hover:text-[#f97316] transition-colors bg-white px-3.5 py-2 rounded-xl border border-[#e2e8f0] shadow-2xs"
          >
            <ArrowLeft size={16} weight="Outline" />
            <span>Back to Store</span>
          </Link>

          <span className="text-xs font-space font-semibold text-[#15803d] bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full flex items-center gap-1.5">
            <TruckFast size={14} weight="Filled" /> Live Courier Dispatch Gateway
          </span>
        </div>

        {/* Hero Search Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#e2e8f0] shadow-xs text-center max-w-2xl mx-auto space-y-4">
          <span className="text-xs font-space font-bold uppercase tracking-wider text-[#ea580c] bg-[#ffedd5] px-3.5 py-1.5 rounded-full inline-block">
            Real-Time Logistics Tracking
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0b1c30]">
            Track Your Kharido Mart Order
          </h1>
          <p className="text-xs sm:text-sm text-[#584237] max-w-md mx-auto">
            To protect your privacy, enter your Order ID (#KM-2026-XXXXX) along with your matching registered mobile number or email.
          </p>

          <form onSubmit={handleSearch} className="flex flex-col gap-3 pt-2 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#0b1c30] uppercase tracking-wider mb-1">
                  Order ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={orderIdQuery}
                  onChange={(e) => setOrderIdQuery(e.target.value)}
                  placeholder="e.g. KM-2026-84912"
                  className="w-full px-4 py-3 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] text-xs sm:text-sm font-space font-semibold text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#0b1c30] uppercase tracking-wider mb-1">
                  Mobile Number or Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={contactQuery}
                  onChange={(e) => setContactQuery(e.target.value)}
                  placeholder="10-digit Phone or Email"
                  className="w-full px-4 py-3 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0] text-xs sm:text-sm font-space font-semibold text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="w-full py-3.5 bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
            >
              <span>{isSearching ? "Verifying Credentials..." : "Secure Track Order"}</span>
              <ArrowRight size={14} weight="Outline" />
            </button>
          </form>

          {/* Real Recent Order Pill if placed in this browser */}
          {recentSavedOrder && !searchedOrder && (
            <div className="pt-2 text-xs text-[#584237] flex items-center justify-center gap-1.5 flex-wrap">
              <span>Your recent order:</span>
              <button
                type="button"
                onClick={() => {
                  setOrderIdQuery(recentSavedOrder.orderId);
                  if (recentSavedOrder.customer?.phone) {
                    setContactQuery(recentSavedOrder.customer.phone);
                  }
                }}
                className="font-space font-bold text-[#ea580c] hover:underline inline-flex items-center gap-1 bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200/80 cursor-pointer"
              >
                <span>📦 {recentSavedOrder.orderId}</span>
                <span className="text-[10px] text-slate-500 font-sans font-normal">(Click to fill)</span>
              </button>
            </div>
          )}
        </div>

        {/* Search Results Display */}
        {hasSearched && searchedOrder && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Order Status Banner */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e8f0] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-space text-[#584237]">
                  Order Placed: {searchedOrder.date}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0b1c30]">
                  Order {searchedOrder.orderId}
                </h2>
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold ${
                      searchedOrder.status === "Delivered"
                        ? "bg-emerald-100 text-[#15803d]"
                        : searchedOrder.status === "Shipped"
                        ? "bg-blue-100 text-blue-700"
                        : searchedOrder.status === "Cancelled"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-[#b45309]"
                    }`}
                  >
                    {searchedOrder.status === "Delivered"
                      ? "Delivered to Doorstep"
                      : searchedOrder.status === "Shipped"
                      ? "In Transit — On the way"
                      : searchedOrder.status === "Cancelled"
                      ? "Order Cancelled"
                      : "Processing & Quality Inspection"}
                  </span>
                  <span className="text-[#584237]">•</span>
                  <span className="text-[#15803d] font-semibold flex items-center gap-1">
                    <CheckCircle size={13} weight="Filled" /> Verified Order
                  </span>
                </div>
              </div>

              {/* Courier AWB Pill */}
              <div className="bg-[#f8fafc] p-4 rounded-2xl border border-[#e2e8f0] space-y-1 text-left sm:text-right w-full sm:w-auto">
                <span className="text-[11px] font-bold text-[#584237] block">
                  Courier Partner: {searchedOrder.courier || "Standard Express Delivery"}
                </span>
                <div className="flex items-center justify-between sm:justify-end gap-2">
                  <span className="font-space font-bold text-xs sm:text-sm text-[#0b1c30]">
                    {searchedOrder.awbNumber ? `AWB: ${searchedOrder.awbNumber}` : "AWB: Pending Dispatch"}
                  </span>
                  {searchedOrder.awbNumber && (
                    <button
                      onClick={() => handleCopyAWB(searchedOrder.awbNumber!)}
                      className="p-1 text-[#f97316] hover:bg-orange-50 rounded-lg transition-colors"
                      title="Copy AWB Number"
                    >
                      <Copy size={16} weight="Outline" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 5-Step Timeline Tracker */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e8f0] shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#e2e8f0]/80">
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-[#0b1c30]">
                    Live Shipment Milestones
                  </h3>
                  <p className="text-xs text-[#584237]/70 mt-0.5">
                    Real-time telemetry synced with Central Warehouse &amp; Logistics Network
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full text-xs font-semibold self-start sm:self-auto">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Active Live Tracking</span>
                </div>
              </div>

              {/* Robust Flex Timeline (Physically Impossible to Overlap) */}
              <div className="pt-2">
                {trackingSteps.map((step, idx) => {
                  const isCompleted = step.status === "completed";
                  const isCurrent = step.status === "current";
                  const isLast = idx === trackingSteps.length - 1;

                  return (
                    <div key={idx} className="flex items-start gap-4 sm:gap-5">
                      {/* Left Column: Indicator Badge + Connecting Vertical Spine */}
                      <div className="flex flex-col items-center shrink-0 w-8 sm:w-9">
                        <div
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                            isCompleted
                              ? "bg-[#15803d] text-white shadow-xs ring-4 ring-emerald-50"
                              : isCurrent
                              ? "bg-[#ea580c] text-white shadow-sm ring-4 ring-orange-100"
                              : "bg-slate-100 text-slate-400 border border-slate-200"
                          }`}
                        >
                          {isCompleted ? (
                            <Check size={16} weight="Filled" className="text-white" />
                          ) : isCurrent ? (
                            <TruckFast size={16} weight="Filled" className="text-white" />
                          ) : (
                            <span className="text-xs font-bold font-space text-slate-400">{idx + 1}</span>
                          )}
                        </div>

                        {!isLast && (
                          <div
                            className={`w-0.5 my-1.5 transition-colors ${
                              isCompleted
                                ? "bg-[#15803d]"
                                : isCurrent
                                ? "bg-gradient-to-b from-[#ea580c] to-slate-200"
                                : "bg-slate-200"
                            }`}
                            style={{ minHeight: "44px", height: "100%" }}
                          />
                        )}
                      </div>

                      {/* Right Column: Milestone Content Details */}
                      <div className={`flex-1 min-w-0 ${!isLast ? "pb-7 sm:pb-8" : "pb-1"}`}>
                        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4
                              className={`font-bold text-sm sm:text-base ${
                                isCompleted
                                  ? "text-[#0b1c30]"
                                  : isCurrent
                                  ? "text-[#ea580c]"
                                  : "text-slate-400"
                              }`}
                            >
                              {step.title}
                            </h4>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-[#c2410c] border border-orange-200/80 inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#ea580c] animate-pulse"></span>
                                Current Stage
                              </span>
                            )}
                          </div>

                          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-space font-medium text-[#584237]/80 bg-[#f8fafc] px-2.5 py-0.5 rounded-md border border-[#e2e8f0] shrink-0 self-start sm:self-auto">
                            <Clock size={12} weight="Outline" className="text-[#584237]/70" />
                            <span>{step.time}</span>
                          </div>
                        </div>

                        <p
                          className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${
                            isCompleted || isCurrent ? "text-[#584237]" : "text-slate-400"
                          }`}
                        >
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Package Contents & Destination Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left: Items (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e8f0] shadow-xs space-y-4">
                <h3 className="font-bold text-base text-[#0b1c30]">
                  Package Contents ({searchedOrder.items.length} Item)
                </h3>

                <div className="divide-y divide-[#e2e8f0]">
                  {searchedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-[#e2e8f0] shrink-0">
                        <Image
                          src={item.product.images[0] || "/assets/images/baby-nail-trimmer-345704.jpg"}
                          alt={item.product.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-[#0b1c30] truncate">
                          {item.product.title}
                        </h4>
                        <p className="text-xs text-[#584237] mt-0.5">
                          Quantity: {item.quantity} • Qty Verified
                        </p>
                      </div>
                      <div className="font-space font-bold text-sm text-[#0b1c30]">
                        ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}.00
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-between text-sm font-bold text-[#0b1c30]">
                  <span>Total Payable:</span>
                  <span className="font-space text-lg text-[#ea580c]">
                    ₹{searchedOrder.grandTotal.toLocaleString("en-IN")}.00
                  </span>
                </div>
              </div>

              {/* Right: Destination Card (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e8f0] shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-[#0b1c30] font-bold text-base">
                  <Location size={18} weight="Filled" className="text-[#ea580c]" />
                  <span>Delivery Destination</span>
                </div>

                <div className="text-xs text-[#584237] space-y-2 leading-relaxed bg-[#f8fafc] p-4 rounded-2xl border border-[#e2e8f0]">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                    <ShieldCheck size={16} weight="Filled" />
                    <span>Customer Privacy Protected</span>
                  </div>
                  <p className="text-slate-600">
                    Shipment dispatched for registered customer via verified express logistics. Exact delivery address and contact details are redacted for security.
                  </p>
                  {searchedOrder.courier && (
                    <p className="pt-1 text-[#0b1c30] font-semibold">
                      🚚 Logistics Partner: <strong>{searchedOrder.courier}</strong>
                    </p>
                  )}
                  {searchedOrder.awbNumber && (
                    <p className="text-[#0b1c30] font-mono text-xs">
                      AWB Code: <strong>{searchedOrder.awbNumber}</strong>
                    </p>
                  )}
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href={`/contact?orderId=${searchedOrder.orderId}`}
                    className="w-full py-2.5 bg-[#0b1c30] hover:bg-black text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all"
                  >
                    <ShieldCheck size={16} weight="Filled" className="text-[#f97316]" />
                    <span>Need Help with this Order?</span>
                  </Link>

                  <button
                    onClick={() => window.print()}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-[#0b1c30] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Printer size={16} weight="Outline" />
                    <span>Print Order Invoice</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty state when no order found */}
        {hasSearched && !searchedOrder && (
          <div className="bg-white rounded-3xl p-8 border border-[#e2e8f0] text-center max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 text-[#ea580c] flex items-center justify-center mx-auto font-bold text-xl">
              ?
            </div>
            <h3 className="font-bold text-base text-[#0b1c30]">
              No Matching Order Found
            </h3>
            <p className="text-xs text-[#584237] leading-relaxed">
              {searchError || "We could not find an active order matching the provided Order Number and Mobile/Email credentials. Please verify your details."}
            </p>
            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-block px-4 py-2 bg-[#0b1c30] text-white font-bold text-xs rounded-xl"
              >
                Contact Customer Care
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center">Loading tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
