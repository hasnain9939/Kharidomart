"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Check,
  CheckCircle,
  TruckFast,
  Printer,
  Copy,
  ArrowRight,
  ShieldCheck,
  Location,
} from "reicon-react";
import { trackPurchase } from "@/lib/analytics";

// Real tracking helper: returns real AWB if assigned, otherwise null
function getOrderTrackingNumber(awb?: string | null): string | null {
  if (awb && typeof awb === "string" && awb.trim() !== "") {
    return awb.trim();
  }
  return null;
}

interface SavedOrder {
  orderId: string;
  date: string;
  createdAt?: string;
  awbNumber?: string;
  status?: string;
  courier?: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    whatsappOptIn: boolean;
  };
  address: {
    address: string;
    pincode: string;
    city: string;
    state: string;
    landmark?: string;
    addressType: string;
  };
  items: Array<{
    product: {
      id: string;
      title: string;
      shortTitle: string;
      price: number;
      images: string[];
      category: string;
    };
    quantity: number;
  }>;
  paymentMethod: string;
  shippingMethod: string;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  upiDiscount: number;
  grandTotal: number;
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const queryOrderId = searchParams.get("orderId");
  const [order, setOrder] = useState<SavedOrder | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      if (queryOrderId) {
        try {
          const res = await fetch(`/api/orders/${encodeURIComponent(queryOrderId)}`);
          const data = await res.json();
          if (res.ok && data.success && data.order) {
            const dbOrder = data.order;
            const nameParts = (dbOrder.customerName || "").split(" ");
            setOrder({
              orderId: dbOrder.orderNumber,
              date: dbOrder.createdAt,
              createdAt: dbOrder.createdAt,
              awbNumber: dbOrder.awbNumber,
              status: dbOrder.status,
              courier: dbOrder.courier,
              customer: {
                firstName: nameParts[0] || "Customer",
                lastName: nameParts.slice(1).join(" ") || "",
                email: dbOrder.customerEmail || "",
                phone: dbOrder.customerPhone || "",
                whatsappOptIn: true,
              },
              address: {
                address: dbOrder.address,
                pincode: dbOrder.pincode,
                city: dbOrder.city,
                state: dbOrder.state,
                landmark: dbOrder.landmark || "",
                addressType: "Delivery Address",
              },
              items: (dbOrder.items || []).map((it: any) => ({
                product: {
                  id: it.productId || it.id,
                  title: it.title,
                  shortTitle: it.title,
                  price: it.price,
                  images: it.image ? [it.image] : ["/assets/stitch/hero_showcase.jpg"],
                  category: "Store Item",
                },
                quantity: it.quantity,
              })),
              paymentMethod: dbOrder.paymentMethod,
              shippingMethod: "Standard Express",
              subtotal: dbOrder.subtotal,
              discountAmount: dbOrder.discountAmount,
              shippingFee: dbOrder.shippingFee,
              upiDiscount: 0,
              grandTotal: dbOrder.total,
            });
            return;
          }
        } catch (e) {
          console.error("Failed to load order from db", e);
        }
      }

      try {
        const saved = localStorage.getItem("km_latest_order");
        if (saved) {
          setOrder(JSON.parse(saved));
        }
      } catch {
        // ignore
      }
    }

    loadOrder();
  }, [queryOrderId]);

  const orderId = order?.orderId || queryOrderId || "";
  const trackingNumber = getOrderTrackingNumber(order?.awbNumber);
  const customerName = [order?.customer.firstName, order?.customer.lastName].filter(Boolean).join(" ") || "Customer";
  const customerEmail = order?.customer.email || "";
  const customerPhone = order?.customer.phone || "";

  // Dynamic delivery estimate (3 business days ahead)
  const [arrivalDateStr, setArrivalDateStr] = useState("In 3–4 Business Days");
  const [orderTimeStr, setOrderTimeStr] = useState("Just now");

  useEffect(() => {
    if (order) {
      trackPurchase({
        orderId: order.orderId,
        grandTotal: order.grandTotal,
        items: order.items,
        shippingFee: order.shippingFee,
        paymentMethod: order.paymentMethod,
      });
    }
  }, [order?.orderId]);

  useEffect(() => {
    const arrival = new Date();
    arrival.setDate(arrival.getDate() + 3);
    setArrivalDateStr(arrival.toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" }));
    if (order?.createdAt) {
      setOrderTimeStr(new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }));
    } else {
      setOrderTimeStr(new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }));
    }
  }, [order]);

  const handleCopyTracking = () => {
    if (!trackingNumber) return;
    navigator.clipboard.writeText(trackingNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full min-h-screen bg-[#f8f9ff]">
      {/* Toast Notification */}
      {copied && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#0b1c30] text-white rounded-2xl shadow-xl transition-all animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle size={18} weight="Filled" className="text-[#15803d]" />
          <span className="text-xs font-semibold">Tracking code copied to clipboard!</span>
        </div>
      )}

      {/* Distraction-Free Stepper Sub-Navigation */}
      <div className="w-full bg-white border-b border-[#e2e8f0] shadow-xs">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="text-[#15803d] font-bold flex items-center gap-1">
              ✓ 1. Cart
            </span>
            <span className="text-[#584237]/40">→</span>
            <span className="text-[#15803d] font-bold flex items-center gap-1">
              ✓ 2. Shipping & Payment
            </span>
            <span className="text-[#584237]/40">→</span>
            <span className="text-[#ea580c] bg-[#ffedd5] px-3 py-1 rounded-full font-bold flex items-center gap-1">
              <CheckCircle size={14} weight="Filled" /> 3. Order Confirmed
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#15803d] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <ShieldCheck size={16} weight="Filled" />
            <span>Verified Secure Order #{orderId}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Celebration / Success Hero Banner */}
        <section className="relative w-full rounded-3xl bg-white p-6 sm:p-10 shadow-xs border border-[#e2e8f0] overflow-hidden">
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-orange-100/50 blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-emerald-100/40 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-5 max-w-2xl">
              {/* Animated Checkmark Badge */}
              <div className="shrink-0 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-emerald-100 text-[#15803d] shadow-sm relative">
                <CheckCircle size={44} weight="Filled" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-[#ea580c]"></span>
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-space font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#15803d]">
                    Payment Verified
                  </span>
                  <span className="text-xs text-[#584237]">
                    Order ID: <strong className="text-[#0b1c30] font-space">{orderId}</strong>
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] tracking-tight">
                  Thank You, {customerName}! Your order is placed 🎉
                </h1>
                <p className="text-xs sm:text-sm text-[#584237] leading-relaxed">
                  {customerEmail ? (
                    <>A confirmation invoice has been queued for <strong className="text-[#0b1c30]">{customerEmail}</strong>. </>
                  ) : (
                    <>Your order has been recorded in our fulfillment system. </>
                  )}
                  {customerPhone ? (
                    <>Live milestone tracking will be shared via WhatsApp on <strong className="text-[#0b1c30]">{customerPhone}</strong>.</>
                  ) : (
                    <>Live milestone tracking will be shared via SMS upon courier dispatch.</>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
              <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-[#15803d] text-xs font-semibold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-[#15803d] animate-pulse"></span>
                <span>WhatsApp Updates Active</span>
              </div>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#f8fafc] hover:bg-slate-100 text-[#0b1c30] text-xs font-bold rounded-xl border border-[#e2e8f0] transition-colors"
              >
                <Printer size={16} weight="Outline" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </section>

        {/* Estimated Delivery & Live Shipment Dispatch Stepper */}
        <section className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#e2e8f0] space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#f8fafc] p-4 sm:p-6 rounded-2xl border border-[#e2e8f0]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#ffedd5] text-[#ea580c] flex items-center justify-center shrink-0">
                <TruckFast size={26} weight="Filled" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-[#584237] font-bold">
                  Estimated Doorstep Arrival
                </div>
                <div className="text-lg sm:text-xl font-bold text-[#0b1c30]">
                  {arrivalDateStr}
                  <span className="text-[#ea580c] text-sm font-semibold ml-2">
                    ({order?.courier || "Standard Express Delivery"})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-[#e2e8f0] shadow-2xs self-start md:self-auto">
              <div className="flex flex-col">
                <span className="text-[11px] text-[#584237]">
                  Carrier: <strong className="text-[#0b1c30]">{order?.courier || "Standard Express Delivery"}</strong>
                </span>
                <div className="flex items-center gap-2">
                  {trackingNumber ? (
                    <>
                      <span className="font-space font-bold text-xs text-[#0b1c30]">
                        {trackingNumber}
                      </span>
                      <button
                        onClick={handleCopyTracking}
                        className="text-[#f97316] hover:text-[#ea580c] transition-colors"
                        title="Copy tracking number"
                      >
                        <Copy size={14} weight="Outline" />
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-[#584237] italic">
                      Assigned upon dispatch (Sent via SMS)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stepper Visualizer */}
          <div className="py-2">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative">
              {/* Step 1 */}
              <div className="flex items-start sm:flex-col sm:items-center gap-3 sm:text-center">
                <div className="w-10 h-10 rounded-full bg-[#15803d] text-white flex items-center justify-center shadow-sm">
                  <Check size={20} weight="Filled" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0b1c30]">Order Placed</div>
                  <div className="text-xs text-[#15803d] font-semibold">{orderTimeStr}</div>
                  <p className="text-[11px] text-[#584237] mt-0.5">Order verified successfully</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start sm:flex-col sm:items-center gap-3 sm:text-center">
                <div className="w-10 h-10 rounded-full bg-[#f97316] text-white flex items-center justify-center shadow-sm ring-4 ring-orange-200">
                  <span className="animate-spin text-sm">↻</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#ea580c]">Processing & QC</div>
                  <div className="text-xs text-[#ea580c] font-semibold">In Progress</div>
                  <p className="text-[11px] text-[#584237] mt-0.5">3-point nursery safety inspection</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start sm:flex-col sm:items-center gap-3 sm:text-center opacity-70">
                <div className="w-10 h-10 rounded-full bg-[#f1f5f9] text-[#584237] flex items-center justify-center">
                  <TruckFast size={18} weight="Outline" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0b1c30]">Express Dispatch</div>
                  <div className="text-xs text-[#584237]">Same Day Evening</div>
                  <p className="text-[11px] text-[#584237] mt-0.5">Departing central logistics hub</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start sm:flex-col sm:items-center gap-3 sm:text-center opacity-50">
                <div className="w-10 h-10 rounded-full bg-[#f1f5f9] text-[#584237] flex items-center justify-center">
                  <Location size={18} weight="Outline" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#0b1c30]">Out for Delivery</div>
                  <div className="text-xs text-[#584237]">{arrivalDateStr}</div>
                  <p className="text-[11px] text-[#584237] mt-0.5">Delivered safely to your door</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Order Details & Delivery Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items Purchased (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#e2e8f0] space-y-4">
            <h3 className="text-base font-bold text-[#0b1c30] pb-3 border-b border-[#f1f5f9]">
              Items In Your Package
            </h3>

            {order?.items && order.items.length > 0 ? (
              <div className="space-y-4 divide-y divide-[#f1f5f9]">
                {order.items.map((item, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-[#f8fafc] overflow-hidden shrink-0 relative border border-[#e2e8f0]">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.shortTitle}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#0b1c30] truncate">
                        {item.product.shortTitle}
                      </h4>
                      <p className="text-xs text-[#584237]">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-space font-bold text-sm text-[#0b1c30]">
                      ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-[#584237]">
                <p className="text-sm font-medium">No order package was found in this browser session.</p>
                <Link
                  href="/shop"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#f97316] hover:text-[#ea580c]"
                >
                  <span>Explore baby essentials catalog</span>
                  <ArrowRight size={14} weight="Outline" />
                </Link>
              </div>
            )}

            <div className="pt-4 border-t border-[#f1f5f9] flex justify-between text-sm font-bold text-[#0b1c30]">
              <span>Total Paid</span>
              <span className="font-space text-lg text-[#ea580c]">
                ₹{(order?.grandTotal || 0).toLocaleString("en-IN")}.00
              </span>
            </div>
          </div>

          {/* Shipping Address & Help (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-[#e2e8f0] space-y-3">
              <h3 className="text-base font-bold text-[#0b1c30] pb-2 border-b border-[#f1f5f9]">
                Delivery Destination
              </h3>
              <div className="text-xs sm:text-sm text-[#584237] space-y-1">
                {order?.address ? (
                  <>
                    <p className="font-bold text-[#0b1c30]">
                      {[order.customer.firstName, order.customer.lastName].filter(Boolean).join(" ") || "Valued Customer"}
                    </p>
                    {order.address.address && <p>{order.address.address}</p>}
                    <p>
                      {[order.address.city, order.address.state].filter(Boolean).join(", ")}
                      {order.address.pincode && (
                        <>
                          {" - "}
                          <strong className="text-[#0b1c30] font-space">{order.address.pincode}</strong>
                        </>
                      )}
                    </p>
                    {order.customer?.phone && (
                      <p className="pt-1 text-[#0b1c30] font-medium">
                        Contact: {order.customer.phone}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-[#584237]/80 italic">Delivery details will be confirmed upon courier dispatch.</p>
                )}
              </div>
            </div>

            <div className="text-center pt-2 space-y-2">
              <Link
                href={`/track-order?orderId=${orderId}`}
                className="w-full h-12 bg-[#0b1c30] hover:bg-black text-white font-bold text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <TruckFast size={18} weight="Filled" className="text-[#f97316]" />
                <span>Track Live Order Status</span>
              </Link>
              <Link
                href="/shop"
                className="w-full h-12 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Continue Shopping</span>
                <ArrowRight size={16} weight="Outline" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[70vh] flex items-center justify-center bg-[#f8f9ff]">
          <div className="flex items-center gap-3 text-sm font-bold text-[#584237]">
            <span className="animate-spin text-[#f97316]">↻</span>
            <span>Loading order confirmation...</span>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
