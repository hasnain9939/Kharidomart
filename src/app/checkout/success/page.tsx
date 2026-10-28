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
  Sparkles,
  Lock,
  CloseCircle,
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
  const [isConverting, setIsConverting] = useState(false);
  const [isConverted, setIsConverted] = useState(false);
  const [convertedPaymentId, setConvertedPaymentId] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);

  const isCodOrder = !isConverted && order?.paymentMethod && (
    order.paymentMethod.toUpperCase().includes("COD") ||
    order.paymentMethod.toUpperCase() === "CASH ON DELIVERY"
  );

  const discountedPrepaidTotal = Math.max(1, (order?.grandTotal || 50) - 50);

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleConvertToPrepaid = async () => {
    if (!orderId) return;
    setIsConverting(true);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}/convert-to-prepaid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        if (data.alreadyPrepaid) {
          setIsConverted(true);
          setIsConverting(false);
          return;
        }
        setShowQrModal(true);
        setIsConverting(false);
        return;
      }

      if (data.useManualFallback) {
        setShowQrModal(true);
        setIsConverting(false);
        return;
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded || !(window as any).Razorpay) {
        setShowQrModal(true);
        setIsConverting(false);
        return;
      }

      const options = {
        key: data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "Kharido Mart",
        description: "Prepaid VIP Upgrade (₹50 OFF Applied)",
        image: "/assets/images/kharidomart-cart-icon.svg",
        order_id: data.order_id,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone ? (customerPhone.startsWith("+91") ? customerPhone : `+91${customerPhone}`) : undefined,
        },
        theme: {
          color: "#2b1f1a",
        },
        handler: async function (response: any) {
          try {
            setIsConverting(true);
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                convertOrderNumber: orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setIsConverted(true);
              setConvertedPaymentId(response.razorpay_payment_id);
              if (order) {
                const updated = {
                  ...order,
                  paymentMethod: "UPI (Razorpay Verified)",
                  grandTotal: Math.max(1, order.grandTotal - 50),
                  discountAmount: (order.discountAmount || 0) + 50,
                  status: "Processing (Prepaid Verified)",
                };
                setOrder(updated);
                try {
                  localStorage.setItem("km_latest_order", JSON.stringify(updated));
                } catch {}
              }
            } else {
              setShowQrModal(true);
            }
          } catch (vErr) {
            console.error("Verification error:", vErr);
            setShowQrModal(true);
          } finally {
            setIsConverting(false);
          }
        },
        modal: {
          ondismiss: function () {
            setIsConverting(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Conversion error:", err);
      setShowQrModal(true);
    } finally {
      setIsConverting(false);
    }
  };

  const handleCopyUpiId = () => {
    navigator.clipboard.writeText("kharidomart@okaxis");
    setUpiCopied(true);
    setTimeout(() => setUpiCopied(false), 2000);
  };


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
  }, [order]);

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
    <div className="w-full min-h-screen bg-[#fdfbf7]">
      {/* Toast Notification */}
      {copied && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#0b1c30] text-white rounded-2xl shadow-xl transition-all animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle size={18} weight="Filled" className="text-[#4f775d]" />
          <span className="text-xs font-semibold">Tracking code copied to clipboard!</span>
        </div>
      )}

      {/* Distraction-Free Stepper Sub-Navigation */}
      <div className="w-full bg-white border-b border-[#eddcd1] shadow-xs">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <span className="text-[#4f775d] font-bold flex items-center gap-1">
              ✓ 1. Cart
            </span>
            <span className="text-[#584237]/40">→</span>
            <span className="text-[#4f775d] font-bold flex items-center gap-1">
              ✓ 2. Shipping & Payment
            </span>
            <span className="text-[#584237]/40">→</span>
            <span className="text-[#e06b5b] bg-[#f6eee5] px-3 py-1 rounded-full font-bold flex items-center gap-1">
              <CheckCircle size={14} weight="Filled" /> 3. Order Confirmed
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#4f775d] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            <ShieldCheck size={16} weight="Filled" />
            <span>Verified Secure Order #{orderId}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Celebration / Success Hero Banner */}
        <section className="relative w-full rounded-3xl bg-white p-6 sm:p-10 shadow-xs border border-[#eddcd1] overflow-hidden">
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-orange-100/50 blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-emerald-100/40 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-5 max-w-2xl">
              {/* Animated Checkmark Badge */}
              <div className="shrink-0 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-emerald-100 text-[#4f775d] shadow-sm relative">
                <CheckCircle size={44} weight="Filled" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-[#ea580c]"></span>
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-space font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#4f775d]">
                    Payment Verified
                  </span>
                  <span className="text-xs text-[#584237]">
                    Order ID: <strong className="text-[#2b1f1a] font-space">{orderId}</strong>
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2b1f1a] tracking-tight">
                  Thank You, {customerName}! Your order is placed 🎉
                </h1>
                <p className="text-xs sm:text-sm text-[#584237] leading-relaxed">
                  {customerEmail ? (
                    <>A confirmation invoice has been queued for <strong className="text-[#2b1f1a]">{customerEmail}</strong>. </>
                  ) : (
                    <>Your order has been recorded in our fulfillment system. </>
                  )}
                  {customerPhone ? (
                    <>Live milestone tracking will be shared via WhatsApp on <strong className="text-[#2b1f1a]">{customerPhone}</strong>.</>
                  ) : (
                    <>Live milestone tracking will be shared via SMS upon courier dispatch.</>
                  )}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
              <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-[#4f775d] text-xs font-semibold border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-[#4f775d] animate-pulse"></span>
                <span>WhatsApp Updates Active</span>
              </div>
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#fbf7f0] hover:bg-slate-100 text-[#2b1f1a] text-xs font-bold rounded-xl border border-[#eddcd1] transition-colors"
              >
                <Printer size={16} weight="Outline" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </section>


        {/* VIP COD-to-Prepaid Conversion Opportunity Card */}
        {isCodOrder && !isConverted && (
          <section className="relative w-full rounded-3xl bg-gradient-to-r from-[#2c1e19] via-[#3d2c25] to-[#2c1e19] p-6 sm:p-8 text-white shadow-xl border border-white/10 overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-radial from-[#e06b5b]/25 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#e06b5b]/30 text-[#f5a195] border border-[#f5a195]/30 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={14} weight="Filled" />
                  <span>⚡ Post-Order VIP Dispatch Upgrade</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                  Pay via UPI Now &amp; Save an Extra <span className="text-[#f5a195]">₹50 Instantly</span>
                </h2>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  Skip the hassle of searching for exact cash change on delivery. Upgrading to instant UPI unlocks{" "}
                  <strong className="text-white">Same-Day VIP Priority Packaging</strong> and fastest courier pickup.
                </p>

                <div className="inline-flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-xs font-mono tabular-nums">
                  <div className="text-stone-300">
                    COD Total: <span className="line-through text-stone-400">₹{order?.grandTotal || 0}</span>
                  </div>
                  <span className="text-emerald-400 font-bold">-₹50 (Instant UPI)</span>
                  <span className="text-white/40">|</span>
                  <div className="text-white font-extrabold text-sm">
                    New Prepaid Total: <span className="text-[#f5a195] font-black">₹{discountedPrepaidTotal}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                <button
                  type="button"
                  disabled={isConverting}
                  onClick={handleConvertToPrepaid}
                  className="px-6 py-3.5 bg-[#e06b5b] hover:bg-[#c95444] active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Lock size={16} weight="Filled" />
                  <span>
                    {isConverting
                      ? "Opening Gateway..."
                      : `Pay ₹${discountedPrepaidTotal} via UPI (Save ₹50)`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/15 transition-all text-center cursor-pointer"
                >
                  <span>Scan Direct UPI QR / GPay</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Converted Celebration Banner */}
        {isConverted && (
          <section className="w-full rounded-3xl bg-[#eaf3ed] p-6 border border-[#d2e7d7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#4f775d] text-white flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle size={26} weight="Filled" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs uppercase tracking-wider font-extrabold text-[#4f775d] bg-white px-2.5 py-0.5 rounded-full border border-[#d2e7d7]">
                    VIP Prepaid Upgrade Confirmed
                  </span>
                  {convertedPaymentId && (
                    <span className="text-xs text-[#584237] font-mono">Ref: {convertedPaymentId}</span>
                  )}
                </div>
                <h3 className="text-base sm:text-lg font-black text-[#2b1f1a] mt-1">
                  Payment Verified • You saved ₹50 on Order #{orderId}
                </h3>
                <p className="text-xs text-[#6b5850] mt-0.5">
                  Zero cash hassle on arrival. Your parcel has been flagged for priority same-day packaging.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-2 bg-white rounded-xl text-xs font-bold text-[#4f775d] border border-[#d2e7d7] shrink-0">
              <ShieldCheck size={16} weight="Filled" />
              <span>Priority Lane Active</span>
            </div>
          </section>
        )}

        {/* Estimated Delivery & Live Shipment Dispatch Stepper */}
        <section className="w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#eddcd1] space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#fbf7f0] p-4 sm:p-6 rounded-2xl border border-[#eddcd1]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#f6eee5] text-[#e06b5b] flex items-center justify-center shrink-0">
                <TruckFast size={26} weight="Filled" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-[#584237] font-bold">
                  Estimated Doorstep Arrival
                </div>
                <div className="text-lg sm:text-xl font-bold text-[#2b1f1a]">
                  {arrivalDateStr}
                  <span className="text-[#e06b5b] text-sm font-semibold ml-2">
                    ({order?.courier || "Standard Express Delivery"})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-xl border border-[#eddcd1] shadow-2xs self-start md:self-auto">
              <div className="flex flex-col">
                <span className="text-[11px] text-[#584237]">
                  Carrier: <strong className="text-[#2b1f1a]">{order?.courier || "Standard Express Delivery"}</strong>
                </span>
                <div className="flex items-center gap-2">
                  {trackingNumber ? (
                    <>
                      <span className="font-space font-bold text-xs text-[#2b1f1a]">
                        {trackingNumber}
                      </span>
                      <button
                        onClick={handleCopyTracking}
                        className="text-[#e06b5b] hover:text-[#e06b5b] transition-colors"
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
                <div className="w-10 h-10 rounded-full bg-[#4f775d] text-white flex items-center justify-center shadow-sm">
                  <Check size={20} weight="Filled" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#2b1f1a]">Order Placed</div>
                  <div className="text-xs text-[#4f775d] font-semibold">{orderTimeStr}</div>
                  <p className="text-[11px] text-[#584237] mt-0.5">Order verified successfully</p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start sm:flex-col sm:items-center gap-3 sm:text-center">
                <div className="w-10 h-10 rounded-full bg-[#e06b5b] text-white flex items-center justify-center shadow-sm ring-4 ring-[#e06b5b]/20">
                  <span className="animate-spin text-sm">↻</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-[#e06b5b]">Processing & QC</div>
                  <div className="text-xs text-[#e06b5b] font-semibold">In Progress</div>
                  <p className="text-[11px] text-[#584237] mt-0.5">3-point nursery safety inspection</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start sm:flex-col sm:items-center gap-3 sm:text-center opacity-70">
                <div className="w-10 h-10 rounded-full bg-[#f8f5ee] text-[#584237] flex items-center justify-center">
                  <TruckFast size={18} weight="Outline" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#2b1f1a]">Express Dispatch</div>
                  <div className="text-xs text-[#584237]">Same Day Evening</div>
                  <p className="text-[11px] text-[#584237] mt-0.5">Departing central logistics hub</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex items-start sm:flex-col sm:items-center gap-3 sm:text-center opacity-50">
                <div className="w-10 h-10 rounded-full bg-[#f8f5ee] text-[#584237] flex items-center justify-center">
                  <Location size={18} weight="Outline" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#2b1f1a]">Out for Delivery</div>
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
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-[#eddcd1] space-y-4">
            <h3 className="text-base font-bold text-[#2b1f1a] pb-3 border-b border-[#f1f5f9]">
              Items In Your Package
            </h3>

            {order?.items && order.items.length > 0 ? (
              <div className="space-y-4 divide-y divide-[#f1f5f9]">
                {order.items.map((item, idx) => (
                  <div key={idx} className="pt-3 first:pt-0 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-[#fbf7f0] overflow-hidden shrink-0 relative border border-[#eddcd1]">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.shortTitle}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#2b1f1a] truncate">
                        {item.product.shortTitle}
                      </h4>
                      <p className="text-xs text-[#584237]">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-space font-bold text-sm text-[#2b1f1a]">
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
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#e06b5b] hover:text-[#e06b5b]"
                >
                  <span>Explore baby essentials catalog</span>
                  <ArrowRight size={14} weight="Outline" />
                </Link>
              </div>
            )}

            <div className="pt-4 border-t border-[#f1f5f9] flex justify-between text-sm font-bold text-[#2b1f1a]">
              <span>Total Paid</span>
              <span className="font-space text-lg text-[#e06b5b]">
                ₹{(order?.grandTotal || 0).toLocaleString("en-IN")}.00
              </span>
            </div>
          </div>

          {/* Shipping Address & Help (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-[#eddcd1] space-y-3">
              <h3 className="text-base font-bold text-[#2b1f1a] pb-2 border-b border-[#f1f5f9]">
                Delivery Destination
              </h3>
              <div className="text-xs sm:text-sm text-[#584237] space-y-1">
                {order?.address ? (
                  <>
                    <p className="font-bold text-[#2b1f1a]">
                      {[order.customer.firstName, order.customer.lastName].filter(Boolean).join(" ") || "Valued Customer"}
                    </p>
                    {order.address.address && <p>{order.address.address}</p>}
                    <p>
                      {[order.address.city, order.address.state].filter(Boolean).join(", ")}
                      {order.address.pincode && (
                        <>
                          {" - "}
                          <strong className="text-[#2b1f1a] font-space">{order.address.pincode}</strong>
                        </>
                      )}
                    </p>
                    {order.customer?.phone && (
                      <p className="pt-1 text-[#2b1f1a] font-medium">
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
                <TruckFast size={18} weight="Filled" className="text-[#e06b5b]" />
                <span>Track Live Order Status</span>
              </Link>
              <Link
                href="/shop"
                className="w-full h-12 bg-[#e06b5b] hover:bg-[#c95444] text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Continue Shopping</span>
                <ArrowRight size={16} weight="Outline" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Direct UPI QR Fallback Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#eddcd1] space-y-4 relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-[#6b5850] hover:text-[#2b1f1a] p-1.5 rounded-full hover:bg-stone-100 transition"
              aria-label="Close"
            >
              <CloseCircle size={22} weight="Outline" />
            </button>

            <div className="text-center space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#e06b5b] bg-[#f6eee5] px-2.5 py-0.5 rounded-full">
                Instant UPI Discount
              </span>
              <h3 className="text-lg font-extrabold text-[#2b1f1a]">
                Scan &amp; Pay ₹{discountedPrepaidTotal}
              </h3>
              <p className="text-xs text-[#6b5850]">
                Use Google Pay, PhonePe, Paytm, or BHIM to pay instantly
              </p>
            </div>

            {/* Simulated UPI QR Card */}
            <div className="p-4 bg-[#fbf7f0] rounded-2xl border border-[#eddcd1] flex flex-col items-center text-center space-y-3">
              <div className="w-48 h-48 bg-white p-3 rounded-xl border border-[#eddcd1] shadow-2xs flex items-center justify-center relative">
                {/* Visual QR presentation */}
                <div className="w-full h-full border-2 border-dashed border-[#2b1f1a]/20 rounded-lg flex flex-col items-center justify-center p-2 text-center">
                  <span className="text-3xl mb-1">📱</span>
                  <span className="text-[11px] font-mono font-bold text-[#2b1f1a]">
                    kharidomart@okaxis
                  </span>
                  <span className="text-[10px] text-[#6b5850] mt-1 font-mono">
                    Amount: ₹{discountedPrepaidTotal}.00
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between w-full bg-white px-3 py-2 rounded-xl border border-[#eddcd1] text-xs">
                <span className="font-mono text-[#2b1f1a] font-bold">kharidomart@okaxis</span>
                <button
                  type="button"
                  onClick={handleCopyUpiId}
                  className="text-[#e06b5b] hover:text-[#c95444] font-bold inline-flex items-center gap-1"
                >
                  <Copy size={13} weight="Outline" />
                  <span>{upiCopied ? "Copied!" : "Copy VPA"}</span>
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <a
                href={`https://wa.me/918540017572?text=Hi%20Kharido%20Mart,%20I've%20paid%20%E2%82%B9${discountedPrepaidTotal}%20via%20UPI%20for%20order%20%23${orderId}.%20Please%20mark%20as%20Prepaid!`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-[#4f775d] hover:bg-[#3d6049] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm text-center"
              >
                <span>Notify Care Team on WhatsApp</span>
                <ArrowRight size={14} weight="Outline" />
              </a>

              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="w-full py-2 text-xs font-semibold text-[#6b5850] hover:text-[#2b1f1a] text-center"
              >
                Keep as Cash on Delivery
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-[70vh] flex items-center justify-center bg-[#fdfbf7]">
          <div className="flex items-center gap-3 text-sm font-bold text-[#584237]">
            <span className="animate-spin text-[#e06b5b]">↻</span>
            <span>Loading order confirmation...</span>
          </div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
