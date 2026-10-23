"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import {
  Lock,
  ShieldCheck,
  ArrowLeft,
  Phone,
  Check,
  CheckCircle,
  TruckFast,
  Location,
} from "reicon-react";

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    subtotal,
    freeShippingThreshold,
    discountCode,
    discountAmount,
    finalTotal,
    clearCart,
    showToast,
    user,
  } = useStore();

  // Contact form state
  const [phone, setPhone] = useState(user?.phone?.replace("+91", "").trim() || "");
  const [email, setEmail] = useState(user?.email || "");
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);

  // Address form state
  const [firstName, setFirstName] = useState(user?.name ? user.name.split(" ")[0] : "");
  const [lastName, setLastName] = useState(user?.name ? user.name.split(" ").slice(1).join(" ") : "");
  const [address, setAddress] = useState(user?.address?.addressLine || "");
  const [pincode, setPincode] = useState(user?.address?.pincode || "");
  const [city, setCity] = useState(user?.address?.city || "");
  const [state, setState] = useState(user?.address?.state || "");
  const [landmark, setLandmark] = useState("");
  const [addressType, setAddressType] = useState<"home" | "office">("home");
  const [saveAddress, setSaveAddress] = useState(true);

  // Auto-sync when user logs in or updates profile, or load saved pincode
  useEffect(() => {
    if (user) {
      if (user.name) {
        const parts = user.name.split(" ");
        setFirstName(parts[0] || "");
        setLastName(parts.slice(1).join(" ") || "");
      }
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone.replace("+91", "").trim());
      if (user.address) {
        if (user.address.addressLine) setAddress(user.address.addressLine);
        if (user.address.city) setCity(user.address.city);
        if (user.address.state) setState(user.address.state);
        if (user.address.pincode) setPincode(user.address.pincode);
      }
    } else {
      try {
        const savedPin = localStorage.getItem("km_user_pincode");
        if (savedPin && savedPin.length === 6) {
          setPincode(savedPin);
          const pin = parseInt(savedPin, 10);
          if (pin >= 110000 && pin <= 119999) {
            setCity("New Delhi");
            setState("Delhi");
          } else if (pin >= 400000 && pin <= 400099) {
            setCity("Mumbai");
            setState("Maharashtra");
          } else if (pin >= 560000 && pin <= 560099) {
            setCity("Bengaluru");
            setState("Karnataka");
          }
        }
      } catch {
        // ignore
      }
    }
  }, [user]);

  // Payment selection
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "upi" | "card">("upi");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-populate city & state from pincode
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setPincode(val);
    if (val.length === 6) {
      const pin = parseInt(val, 10);
      if (pin >= 110000 && pin <= 119999) {
        setCity("New Delhi");
        setState("Delhi");
      } else if (pin >= 400000 && pin <= 400099) {
        setCity("Mumbai");
        setState("Maharashtra");
      } else if (pin >= 560000 && pin <= 560099) {
        setCity("Bengaluru");
        setState("Karnataka");
      } else if (pin >= 700000 && pin <= 700099) {
        setCity("Kolkata");
        setState("West Bengal");
      } else if (pin >= 600000 && pin <= 600099) {
        setCity("Chennai");
        setState("Tamil Nadu");
      }
    }
  };

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateCheckout = () => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "Please enter your first name.";
    if (!lastName.trim()) errs.lastName = "Please enter your last name.";

    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length !== 10) {
      errs.phone = "Please enter a valid 10-digit Indian phone number.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      errs.email = "Please enter a valid email for order updates & receipt.";
    }

    if (!address.trim() || address.trim().length < 8) {
      errs.address = "Please enter complete house/flat no. and street name.";
    }

    if (!pincode.trim() || pincode.trim().length !== 6) {
      errs.pincode = "Please enter a valid 6-digit Indian PIN code.";
    }

    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Calculations
  const shippingFee = subtotal >= freeShippingThreshold ? 0 : 79;
  const upiDiscount = paymentMethod === "upi" ? 50 : 0;
  const grandTotal = Math.max(0, finalTotal + shippingFee - upiDiscount);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCheckout()) {
      showToast("Please fix the highlighted required fields to proceed.", "warning");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: {
            firstName,
            lastName,
            email,
            phone,
            whatsappOptIn,
          },
          address: {
            address,
            city,
            state,
            pincode,
            landmark,
            addressType,
          },
          items: cart,
          paymentMethod,
          subtotal,
          discountAmount,
          shippingFee,
          grandTotal,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to place order. Please try again.");
      }

      const createdOrder = data.order;
      const finalOrderId = createdOrder.orderNumber;

      try {
        localStorage.setItem("km_latest_order", JSON.stringify({
          orderId: createdOrder.orderNumber,
          date: createdOrder.createdAt,
          createdAt: createdOrder.createdAt,
          awbNumber: createdOrder.awbNumber,
          status: createdOrder.status,
          courier: createdOrder.courier,
          customer: {
            firstName,
            lastName,
            email,
            phone,
            whatsappOptIn,
          },
          address: {
            address,
            city,
            state,
            pincode,
            landmark,
            addressType,
          },
          items: cart,
          paymentMethod,
          shippingMethod: "standard",
          subtotal,
          discountAmount,
          shippingFee,
          upiDiscount,
          grandTotal,
        }));

        const existing = localStorage.getItem("km_all_orders");
        const list = existing ? JSON.parse(existing) : [];
        list.unshift(createdOrder);
        localStorage.setItem("km_all_orders", JSON.stringify(list));
      } catch {
        // ignore storage quota issues
      }

      clearCart();
      showToast("🎉 Order Placed Successfully!");
      router.push(`/checkout/success?orderId=${finalOrderId}`);
    } catch (err: any) {
      console.error("Order error:", err);
      showToast(err.message || "Failed to place order. Please try again.", "warning");
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-[#f8f9ff]">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-[#e2e8f0] shadow-sm space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 text-[#ea580c] flex items-center justify-center mx-auto">
            <ShieldCheck size={32} weight="Filled" />
          </div>
          <h2 className="text-xl font-bold text-[#0b1c30]">Your Cart is Empty</h2>
          <p className="text-sm text-[#584237]">
            Please add items to your cart before proceeding to checkout.
          </p>
          <Link
            href="/shop"
            className="inline-block px-6 py-3 bg-[#f97316] text-white font-bold rounded-xl text-sm"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f8f9ff]">
      {/* Checkout Minimal Sub-Header */}
      <div className="w-full bg-white border-b border-[#e2e8f0] shadow-xs">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          {/* Stepper */}
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <Link
              href="/cart"
              className="flex items-center gap-1.5 text-[#15803d] font-bold hover:underline"
            >
              <CheckCircle size={18} weight="Filled" />
              <span>1. Cart</span>
            </Link>
            <span className="text-[#584237]/40">→</span>
            <div className="flex items-center gap-1.5 text-[#ea580c] bg-[#ffedd5] px-3 py-1 rounded-full font-bold">
              <span className="w-2 h-2 rounded-full bg-[#ea580c] animate-ping"></span>
              <span>2. Shipping & Payment</span>
            </div>
            <span className="text-[#584237]/40">→</span>
            <div className="flex items-center gap-1.5 text-[#584237]/60">
              <span className="w-4 h-4 rounded-full border border-dashed border-[#584237]/60 inline-block"></span>
              <span>3. Order Confirmed</span>
            </div>
          </div>

          {/* Security & Support */}
          <div className="flex items-center gap-4 text-xs text-[#584237]">
            <Link
              href="/contact"
              className="flex items-center gap-1.5 text-[#0b1c30] hover:text-[#f97316] font-medium transition-colors"
            >
              <ShieldCheck size={16} weight="Filled" className="text-[#15803d]" />
              <span>Help &amp; Support Desk</span>
            </Link>
            <div className="hidden sm:flex items-center gap-1 text-[#15803d] bg-[#f8fafc] px-3 py-1 rounded-full border border-[#e2e8f0]">
              <Lock size={14} weight="Filled" />
              <span className="font-semibold">256-Bit SSL Encrypted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Checkout Layout */}
      <div className="max-w-[1360px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Customer, Shipping & Payment (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* STEP 1: Contact Information */}
            <div className="bg-white rounded-3xl shadow-xs border border-[#e2e8f0] p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#ffedd5] text-[#ea580c] flex items-center justify-center font-space font-bold text-sm">
                    1
                  </span>
                  <h2 className="text-lg font-bold text-[#0b1c30]">
                    Contact Information
                  </h2>
                </div>
                <span className="text-xs text-[#15803d] font-semibold flex items-center gap-1">
                  <Check size={14} weight="Filled" /> Verified Checkout
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#584237]">
                    Mobile Number (for live dispatch tracking) *
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-sm font-space font-bold text-[#0b1c30] select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value.replace(/\D/g, ""));
                        if (formErrors.phone) {
                          setFormErrors((prev) => {
                            const copy = { ...prev };
                            delete copy.phone;
                            return copy;
                          });
                        }
                      }}
                      aria-invalid={!!formErrors.phone}
                      className={`w-full h-12 pl-13 pr-3 rounded-xl text-sm font-space font-semibold border transition-all ${
                        formErrors.phone
                          ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-200"
                          : "border-[#ebdcd3] bg-[#f8fafc] text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#e06b5b]"
                      }`}
                    />
                  </div>
                  {formErrors.phone && (
                    <span className="text-[11px] text-rose-600 font-semibold block mt-1">
                      ⚠️ {formErrors.phone}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#584237]">
                    Email Address (for tax invoice & receipts) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="yourname@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (formErrors.email) {
                        setFormErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.email;
                          return copy;
                        });
                      }
                    }}
                    aria-invalid={!!formErrors.email}
                    className={`w-full h-12 px-3.5 rounded-xl text-sm border transition-all ${
                      formErrors.email
                        ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-200"
                        : "border-[#ebdcd3] bg-[#f8fafc] text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#e06b5b]"
                    }`}
                  />
                  {formErrors.email && (
                    <span className="text-[11px] text-rose-600 font-semibold block mt-1">
                      ⚠️ {formErrors.email}
                    </span>
                  )}
                </div>
              </div>

              {/* WhatsApp opt-in notification toggle */}
              <label className="flex items-center gap-3 p-3 bg-[#f8fafc] rounded-2xl cursor-pointer border border-[#ebdcd3]/80">
                <input
                  type="checkbox"
                  checked={whatsappOptIn}
                  onChange={(e) => setWhatsappOptIn(e.target.checked)}
                  className="w-4 h-4 rounded text-[#15803d] accent-[#15803d] cursor-pointer"
                />
                <span className="text-xs font-medium text-[#0b1c30] flex items-center gap-1.5">
                  Send me order updates & doorstep delivery notifications on WhatsApp
                  <span className="w-2 h-2 rounded-full bg-[#15803d]"></span>
                </span>
              </label>
            </div>

            {/* STEP 2: Delivery / Shipping Address */}
            <div className="bg-white rounded-3xl shadow-xs border border-[#ebdcd3] p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#fbe8e4] text-[#e06b5b] flex items-center justify-center font-space font-bold text-sm">
                    2
                  </span>
                  <h2 className="text-lg font-bold text-[#0b1c30]">
                    Delivery Address
                  </h2>
                </div>
                <span className="text-xs text-[#15803d] font-semibold flex items-center gap-1">
                  <Location size={14} weight="Filled" /> 24,000+ Pincodes Serviced
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#584237]">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (formErrors.firstName) {
                        setFormErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.firstName;
                          return copy;
                        });
                      }
                    }}
                    aria-invalid={!!formErrors.firstName}
                    className={`w-full h-12 px-3.5 rounded-xl text-sm border transition-all ${
                      formErrors.firstName
                        ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-200"
                        : "border-[#ebdcd3] bg-[#f8fafc] text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#e06b5b]"
                    }`}
                  />
                  {formErrors.firstName && (
                    <span className="text-[11px] text-rose-600 font-semibold block mt-1">
                      ⚠️ {formErrors.firstName}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#584237]">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (formErrors.lastName) {
                        setFormErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.lastName;
                          return copy;
                        });
                      }
                    }}
                    aria-invalid={!!formErrors.lastName}
                    className={`w-full h-12 px-3.5 rounded-xl text-sm border transition-all ${
                      formErrors.lastName
                        ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-200"
                        : "border-[#ebdcd3] bg-[#f8fafc] text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#e06b5b]"
                    }`}
                  />
                  {formErrors.lastName && (
                    <span className="text-[11px] text-rose-600 font-semibold block mt-1">
                      ⚠️ {formErrors.lastName}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#584237]">
                  Flat, House no., Building, Street address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Flat / House No., Apartment name, Street or Lane"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (formErrors.address) {
                      setFormErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.address;
                        return copy;
                      });
                    }
                  }}
                  aria-invalid={!!formErrors.address}
                  className={`w-full h-12 px-3.5 rounded-xl text-sm border transition-all ${
                    formErrors.address
                      ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-200"
                      : "border-[#ebdcd3] bg-[#f8fafc] text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#e06b5b]"
                  }`}
                />
                {formErrors.address && (
                  <span className="text-[11px] text-rose-600 font-semibold block mt-1">
                    ⚠️ {formErrors.address}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#584237]">
                    Pincode *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="6-digit PIN"
                      value={pincode}
                      onChange={(e) => {
                        handlePincodeChange(e);
                        if (formErrors.pincode) {
                          setFormErrors((prev) => {
                            const copy = { ...prev };
                            delete copy.pincode;
                            return copy;
                          });
                        }
                      }}
                      aria-invalid={!!formErrors.pincode}
                      className={`w-full h-12 px-3.5 rounded-xl text-sm font-space font-bold border transition-all ${
                        formErrors.pincode
                          ? "border-rose-400 bg-rose-50/20 text-rose-900 focus:outline-none focus:ring-2 focus:ring-rose-200"
                          : "border-[#ebdcd3] bg-[#f8fafc] text-[#0b1c30] focus:outline-none focus:ring-2 focus:ring-[#e06b5b]"
                      }`}
                    />
                    {pincode.length === 6 && !formErrors.pincode && (
                      <span className="absolute right-3 text-[#15803d]">
                        <CheckCircle size={18} weight="Filled" />
                      </span>
                    )}
                  </div>
                  {formErrors.pincode && (
                    <span className="text-[11px] text-rose-600 font-semibold block mt-1">
                      ⚠️ {formErrors.pincode}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#584237]">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="City / District"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-12 px-3.5 bg-[#f1f5f9] rounded-xl text-[#0b1c30] text-sm border border-[#e2e8f0] focus:outline-none font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#584237]">
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full h-12 px-3.5 bg-[#f1f5f9] rounded-xl text-[#0b1c30] text-sm border border-[#e2e8f0] focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#584237]">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Nearby landmark (e.g. Near ICICI Bank or Park)"
                  className="w-full h-12 px-3.5 bg-[#f8fafc] rounded-xl text-[#0b1c30] text-sm border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                />
              </div>

              {/* Address Type Selector */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold text-[#584237]">
                  Address Type
                </span>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setAddressType("home")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                      addressType === "home"
                        ? "bg-[#0b1c30] text-white shadow-xs"
                        : "bg-[#f1f5f9] text-[#584237] hover:bg-slate-200"
                    }`}
                  >
                    <span>🏠 Home (All day delivery)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddressType("office")}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all ${
                      addressType === "office"
                        ? "bg-[#0b1c30] text-white shadow-xs"
                        : "bg-[#f1f5f9] text-[#584237] hover:bg-slate-200"
                    }`}
                  >
                    <span>🏢 Office (10 AM - 6 PM)</span>
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                  className="w-4 h-4 rounded text-[#f97316] accent-[#f97316]"
                />
                <span className="text-xs text-[#584237]">
                  Save this address to my Kharido Mart address book
                </span>
              </label>
            </div>

            {/* STEP 3: Payment Method Selection */}
            <div className="bg-white rounded-3xl shadow-xs border border-[#e2e8f0] p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#ffedd5] text-[#ea580c] flex items-center justify-center font-space font-bold text-sm">
                    3
                  </span>
                  <h2 className="text-lg font-bold text-[#0b1c30]">
                    Payment Options
                  </h2>
                </div>
                <div className="flex items-center gap-1 text-[#15803d] text-xs font-bold">
                  <ShieldCheck size={16} weight="Filled" /> 100% Refund Guarantee
                </div>
              </div>

              {/* Incentive Promo Banner */}
              <div className="p-3.5 bg-[#ffedd5]/60 rounded-2xl flex items-center justify-between border border-[#f97316]/20">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">🎁</span>
                  <p className="text-xs font-bold text-[#ea580c]">
                    Pay via UPI & Save ₹50 instantly on this order!
                  </p>
                </div>
                <span className="text-[10px] font-space font-extrabold uppercase px-2 py-0.5 bg-[#ea580c] text-white rounded-md">
                  Active
                </span>
              </div>

              <div className="space-y-3">
                {/* UPI Option */}
                <label
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-4 rounded-2xl cursor-pointer border-2 transition-all block ${
                    paymentMethod === "upi"
                      ? "border-[#15803d] bg-[#15803d]/5 shadow-xs"
                      : "border-[#e2e8f0] bg-[#f8fafc]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_type"
                        checked={paymentMethod === "upi"}
                        onChange={() => setPaymentMethod("upi")}
                        className="accent-[#15803d]"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#0b1c30]">
                            UPI / QR (GPay, PhonePe, Paytm)
                          </span>
                          <span className="text-[10px] uppercase font-space font-bold bg-[#15803d] text-white px-2 py-0.5 rounded">
                            Save ₹50
                          </span>
                        </div>
                        <p className="text-xs text-[#584237] mt-0.5">
                          Instant verification & zero transaction charges
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#15803d]">Recommended</span>
                  </div>
                </label>

                {/* COD Option */}
                <label
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-4 rounded-2xl cursor-pointer border-2 transition-all block ${
                    paymentMethod === "cod"
                      ? "border-[#f97316] bg-orange-50/20 shadow-xs"
                      : "border-[#e2e8f0] bg-[#f8fafc]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_type"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                        className="accent-[#f97316]"
                      />
                      <div>
                        <span className="text-sm font-bold text-[#0b1c30]">
                          Cash on Delivery (COD)
                        </span>
                        <p className="text-xs text-[#584237] mt-0.5">
                          Pay cash or UPI directly when your courier arrives at your doorstep
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-[#584237]">Doorstep</span>
                  </div>
                </label>

                {/* Card / NetBanking */}
                <label
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 rounded-2xl cursor-pointer border-2 transition-all block ${
                    paymentMethod === "card"
                      ? "border-[#f97316] bg-orange-50/20 shadow-xs"
                      : "border-[#e2e8f0] bg-[#f8fafc]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment_type"
                        checked={paymentMethod === "card"}
                        onChange={() => setPaymentMethod("card")}
                        className="accent-[#f97316]"
                      />
                      <div>
                        <span className="text-sm font-bold text-[#0b1c30]">
                          Credit / Debit Card & NetBanking
                        </span>
                        <p className="text-xs text-[#584237] mt-0.5">
                          Visa, Mastercard, RuPay, ICICI, HDFC, SBI
                        </p>
                      </div>
                    </div>
                  </div>
                </label>
              </div>

              {/* Payment info note */}
              {paymentMethod !== "cod" && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-2.5">
                  <span className="text-blue-500 text-base mt-0.5">ℹ️</span>
                  <p className="text-xs text-blue-700 font-medium leading-relaxed">
                    <strong>Payment before dispatch:</strong> After placing your order, our team will reach out on your WhatsApp / phone to collect payment via GPay, PhonePe, or Paytm before your order is shipped.
                  </p>
                </div>
              )}
              {paymentMethod === "cod" && (
                <div className="p-3.5 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-2.5">
                  <span className="text-base mt-0.5">💵</span>
                  <p className="text-xs text-green-700 font-medium leading-relaxed">
                    <strong>Cash on Delivery:</strong> Pay cash or scan our UPI QR directly to the delivery agent when your order arrives at your door. No advance payment needed.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e2e8f0] space-y-4">
              <h3 className="text-lg font-bold text-[#0b1c30] pb-3 border-b border-[#f1f5f9]">
                Order Items ({cart.reduce((total, i) => total + i.quantity, 0)})
              </h3>

              {/* Items Compact List */}
              <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3.5 py-1">
                    <div className="w-14 h-14 rounded-xl bg-[#f8fafc] overflow-hidden shrink-0 relative border border-[#e2e8f0]">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.shortTitle}
                        fill
                        className="object-cover"
                      />
                      <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#0b1c30] text-white text-[10px] font-space font-bold flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#0b1c30] truncate">
                        {item.product.shortTitle}
                      </h4>
                      <p className="text-[11px] text-[#584237]">{item.product.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-space font-bold text-xs text-[#0b1c30]">
                        ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="pt-4 border-t border-[#f1f5f9] space-y-2.5 text-xs text-[#584237]">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-space font-semibold text-[#0b1c30]">
                    ₹{subtotal.toLocaleString("en-IN")}.00
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#15803d]">
                    <span>Coupon Savings ({discountCode})</span>
                    <span className="font-space font-bold">-₹{discountAmount}.00</span>
                  </div>
                )}

                {upiDiscount > 0 && (
                  <div className="flex justify-between text-[#15803d]">
                    <span>Instant UPI Discount</span>
                    <span className="font-space font-bold">-₹50.00</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-space font-semibold text-[#0b1c30]">
                    {shippingFee === 0 ? (
                      <span className="text-[#15803d] font-bold">FREE</span>
                    ) : (
                      `₹${shippingFee}.00`
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-[#f1f5f9] flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-extrabold text-[#0b1c30]">
                      Grand Total
                    </span>
                    <p className="text-[10px] text-[#584237]">All taxes included</p>
                  </div>
                  <span className="font-space font-extrabold text-2xl text-[#ea580c]">
                    ₹{grandTotal.toLocaleString("en-IN")}.00
                  </span>
                </div>
              </div>

              {/* Place Order CTA Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-13 bg-[#f97316] hover:bg-[#ea580c] active:scale-[0.98] text-white font-bold text-sm rounded-2xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Lock size={16} weight="Filled" />
                  <span>
                    {isSubmitting
                      ? "Confirming Order..."
                      : `Place Order — ₹${grandTotal.toLocaleString("en-IN")}`}
                  </span>
                </button>
              </div>

              <div className="p-3 bg-[#f8fafc] rounded-2xl text-center border border-[#e2e8f0]">
                <p className="text-[11px] text-[#584237] leading-relaxed">
                  🔒 By placing this order, you agree to Kharido Mart&apos;s 24-Hour Replacement (unboxing video mandatory) and Privacy policies.
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/cart"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#584237] hover:text-[#f97316]"
              >
                <ArrowLeft size={14} weight="Outline" />
                <span>Return to Shopping Cart</span>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
