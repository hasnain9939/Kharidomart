"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import {
  ShoppingCart,
  ShoppingBag,
  Trash,
  Heart,
  TruckFast,
  ShieldCheck,
  Check,
  ArrowRight,
  ArrowLeft,
  Location,
  Star,
  Gift,
} from "reicon-react";

export default function CartPage() {
  const {
    products,
    cart,
    cartCount,
    subtotal,
    freeShippingThreshold,
    freeShippingProgress,
    discountCode,
    discountAmount,
    finalTotal,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    addToCart,
    toggleWishlist,
    isWishlisted,
    showToast,
  } = useStore();

  const [couponInput, setCouponInput] = useState("");
  const [giftWrap, setGiftWrap] = useState(false);
  const [pincode, setPincode] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [pincodeCity, setPincodeCity] = useState("");

  // Sync saved user pincode from storage if previously entered
  useEffect(() => {
    try {
      const savedPin = localStorage.getItem("km_user_pincode");
      if (savedPin && savedPin.length === 6) {
        setPincode(savedPin);
        const pin = parseInt(savedPin, 10);
        if (pin >= 110000 && pin <= 119999) setPincodeCity("Delhi NCR Hub");
        else if (pin >= 400000 && pin <= 400099) setPincodeCity("Mumbai Hub");
        else if (pin >= 560000 && pin <= 560099) setPincodeCity("Bengaluru Central");
        else if (pin >= 700000 && pin <= 700099) setPincodeCity("Kolkata Metro");
        else setPincodeCity("Verified Express Hub");
        setPincodeChecked(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Frequently bought together / essential cross-sell
  const crossSellProduct = products.find((p) => p.id !== cart[0]?.product.id) || (products.length > 1 ? products[1] : undefined);
  const isCrossSellInCart = crossSellProduct ? cart.some((item) => item.product.id === crossSellProduct.id) : false;

  const giftWrapFee = giftWrap ? 49 : 0;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 79;
  const grandTotal = finalTotal + giftWrapFee + shippingFee;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const totalSavings = (cart.reduce((acc, item) => acc + (item.product.originalPrice - item.product.price) * item.quantity, 0)) + discountAmount;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    if (applyCoupon(couponInput)) {
      setCouponInput("");
    }
  };

  const handlePincodeCheck = () => {
    if (pincode.length !== 6) {
      showToast("Please enter a valid 6-digit Pincode", "warning");
      return;
    }
    const pin = parseInt(pincode, 10);
    if (pin >= 110000 && pin <= 119999) setPincodeCity("Delhi NCR Hub");
    else if (pin >= 400000 && pin <= 400099) setPincodeCity("Mumbai Hub");
    else if (pin >= 560000 && pin <= 560099) setPincodeCity("Bengaluru Central");
    else if (pin >= 700000 && pin <= 700099) setPincodeCity("Kolkata Metro");
    else setPincodeCity("Verified Express Hub");

    setPincodeChecked(true);
    try {
      localStorage.setItem("km_user_pincode", pincode);
    } catch {
      // ignore
    }
    showToast(`Express Delivery available to Pincode ${pincode}! 🚀`);
  };

  return (
    <div className="w-full min-h-screen bg-[#f8f9ff]">
      {/* Micro Progress & Global Reassurance Strip */}
      <section className="w-full bg-[#eff4ff] border-b border-[#e2e8f0]/60 py-3">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-[#584237]">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} weight="Filled" className="text-[#15803d]" />
            <span className="font-semibold text-[#0b1c30]">
              Doctor & Pediatrician Approved Nursery Grade Safe
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#15803d] animate-pulse"></span>
              Dispatches today before 4:00 PM
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <TruckFast size={16} weight="Filled" className="text-[#f97316]" />
              7-Day Doorstep Replacement Guarantee
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-[#584237]/80 mb-6">
          <Link href="/" className="hover:text-[#f97316] transition-colors">
            Home
          </Link>
          <span className="opacity-40">/</span>
          <Link href="/shop" className="hover:text-[#f97316] transition-colors">
            Shop
          </Link>
          <span className="opacity-40">/</span>
          <span className="font-bold text-[#0b1c30]">
            Shopping Cart ({cartCount} {cartCount === 1 ? "item" : "items"})
          </span>
        </nav>

        {/* Empty Cart State */}
        {cart.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 sm:p-16 text-center max-w-2xl mx-auto shadow-sm border border-[#e2e8f0] space-y-6">
            <div className="w-24 h-24 mx-auto rounded-3xl bg-[#ffedd5] text-[#ea580c] flex items-center justify-center shadow-inner">
              <ShoppingBag size={48} weight="Outline" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30]">
                Your Cart is Empty
              </h1>
              <p className="text-sm text-[#584237] max-w-md mx-auto leading-relaxed">
                Looks like you haven&apos;t added any baby grooming, clever gadgets, or home essentials yet. Explore our top curated finds!
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold rounded-full shadow-lg shadow-orange-500/25 transition-all active:scale-95 text-sm"
              >
                <span>Explore Trending Products</span>
                <ArrowRight size={18} weight="Outline" />
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Dynamic Free Shipping Unlock Banner */}
            <div className="w-full bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-[#e2e8f0] mb-8 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ffedd5] text-[#ea580c] flex items-center justify-center shrink-0">
                    <TruckFast size={22} weight="Filled" />
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-bold text-[#0b1c30]">
                      {amountToFreeShipping === 0 ? (
                        <span className="text-[#15803d]">
                          🎉 Congratulations! You have unlocked FREE Express Delivery!
                        </span>
                      ) : (
                        <>
                          Add{" "}
                          <span className="text-[#ea580c] font-space font-extrabold">
                            ₹{amountToFreeShipping}
                          </span>{" "}
                          more to unlock{" "}
                          <span className="text-[#15803d] font-bold">
                            FREE Express Delivery!
                          </span>
                        </>
                      )}
                    </p>
                    <p className="text-xs text-[#584237]">
                      Free shipping threshold: ₹{freeShippingThreshold}. Current eligible cart value:{" "}
                      <strong className="text-[#0b1c30] font-space">₹{subtotal}</strong>
                    </p>
                  </div>
                </div>
                <span className="self-start sm:self-auto text-xs uppercase tracking-wider px-3 py-1 bg-[#15803d]/10 text-[#15803d] rounded-full font-space font-bold">
                  {freeShippingProgress}% Unlocked
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-2.5 bg-[#f1f5f9] rounded-full overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-[#f97316] to-[#15803d] rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>

            {/* Main Columns: 8 Cols Cart Items & Recommendations / 4 Cols Sticky Order Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN: Items List, Cross-sell, Trust & Pincode (8 cols) */}
              <div className="lg:col-span-8 space-y-6">
                {/* Cart Items Card */}
                <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xs border border-[#e2e8f0] divide-y divide-[#f1f5f9]">
                  {cart.map((item) => {
                    const discountPct = Math.round(
                      ((item.product.originalPrice - item.product.price) /
                        item.product.originalPrice) *
                        100
                    );
                    const wishlisted = isWishlisted(item.product.id);

                    return (
                      <div
                        key={item.product.id}
                        className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-5"
                      >
                        {/* Product Image Holder */}
                        <div className="w-full sm:w-36 h-40 sm:h-36 rounded-2xl bg-[#f8fafc] overflow-hidden shrink-0 relative flex items-center justify-center border border-[#e2e8f0]">
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.title}
                            fill
                            className="object-cover object-center hover:scale-105 transition-transform duration-300"
                          />
                          {discountPct > 0 && (
                            <span className="absolute top-2 left-2 bg-[#ef4444] text-white text-[10px] font-bold font-space px-2 py-0.5 rounded-full uppercase">
                              {discountPct}% OFF
                            </span>
                          )}
                          <span className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-xs text-[#0b1c30] text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#15803d]"></span> Ready to Ship
                          </span>
                        </div>

                        {/* Product Info & Actions */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#ea580c] bg-[#ffedd5] px-2 py-0.5 rounded">
                                  {item.product.category}
                                </span>
                                <h2 className="text-base sm:text-lg font-bold text-[#0b1c30] mt-1 leading-snug">
                                  <Link
                                    href={`/products/${item.product.slug}`}
                                    className="hover:text-[#f97316] transition-colors"
                                  >
                                    {item.product.title}
                                  </Link>
                                </h2>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.product.id)}
                                aria-label="Remove item"
                                className="text-[#584237]/60 hover:text-[#ef4444] p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                <Trash size={18} weight="Outline" />
                              </button>
                            </div>

                            {/* Meta & Badges */}
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-[#584237]">
                              <span>SKU: <strong>KM-{item.product.id}00</strong></span>
                              <span className="opacity-40">•</span>
                              <span className="text-[#15803d] font-semibold flex items-center gap-1">
                                Dispatches in 24 hrs
                              </span>
                            </div>
                          </div>

                          {/* Pricing & Quantity Controls Row */}
                          <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex flex-wrap items-end justify-between gap-4">
                            <div>
                              <div className="flex items-baseline gap-2">
                                <span className="font-space font-bold text-xl text-[#0b1c30]">
                                  ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                                </span>
                                <span className="font-space text-xs text-[#584237]/60 line-through">
                                  ₹{(item.product.originalPrice * item.quantity).toLocaleString("en-IN")}
                                </span>
                              </div>
                              <p className="text-xs text-[#15803d] font-semibold mt-0.5">
                                Save ₹{((item.product.originalPrice - item.product.price) * item.quantity).toLocaleString("en-IN")} on this item
                              </p>
                            </div>

                            {/* Quantity Stepper & Save for Later */}
                            <div className="flex items-center gap-3">
                              <div className="flex items-center bg-[#f1f5f9] rounded-xl p-1 shadow-inner border border-[#e2e8f0]/60">
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                  className="w-8 h-8 rounded-lg bg-white text-[#0b1c30] flex items-center justify-center font-bold hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-40 shadow-xs"
                                  aria-label="Decrease quantity"
                                >
                                  -
                                </button>
                                <span className="w-9 text-center font-space font-bold text-sm text-[#0b1c30]">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                  className="w-8 h-8 rounded-lg bg-white text-[#0b1c30] flex items-center justify-center font-bold hover:bg-slate-100 transition-all active:scale-95 shadow-xs"
                                  aria-label="Increase quantity"
                                >
                                  +
                                </button>
                              </div>

                              <button
                                onClick={() => toggleWishlist(item.product.id)}
                                className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 ${
                                  wishlisted
                                    ? "bg-rose-50 text-rose-600"
                                    : "text-[#584237] hover:text-[#0b1c30] hover:bg-[#f1f5f9]"
                                }`}
                                type="button"
                              >
                                <Heart
                                  size={16}
                                  weight={wishlisted ? "Filled" : "Outline"}
                                  className={wishlisted ? "text-rose-500" : ""}
                                />
                                <span>{wishlisted ? "Saved" : "Save for later"}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Festive Gift Packaging Option */}
                  <div className="pt-5 mt-5">
                    <div className="p-3.5 bg-[#f8fafc] rounded-2xl flex items-start gap-3 border border-[#e2e8f0]">
                      <input
                        type="checkbox"
                        id="gift-wrap-check"
                        checked={giftWrap}
                        onChange={(e) => setGiftWrap(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded text-[#f97316] accent-[#f97316] cursor-pointer"
                      />
                      <label htmlFor="gift-wrap-check" className="flex-1 cursor-pointer select-none">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-[#0b1c30] flex items-center gap-1.5">
                            <Gift size={18} weight="Filled" className="text-[#ea580c]" />
                            Add Festive Gift Packaging & Custom Note Card
                          </span>
                          <span className="font-space font-bold text-sm text-[#ea580c]">
                            + ₹49
                          </span>
                        </div>
                        <p className="text-xs text-[#584237] mt-0.5 leading-relaxed">
                          Delightful festive gift box packaging, custom ribbons, and a personalized celebration greeting card.
                        </p>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Frequently Bought Together / Essential Cross-Sell */}
                {crossSellProduct && !isCrossSellInCart && (
                  <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-[#e2e8f0] relative overflow-hidden">
                    <div className="flex items-center justify-between mb-3.5">
                      <div className="flex items-center gap-2">
                        <Star size={18} weight="Filled" className="text-[#f59e0b]" />
                        <h3 className="font-bold text-base text-[#0b1c30]">
                          Recommended Add-on for Your Cart
                        </h3>
                      </div>
                      <span className="text-[11px] uppercase tracking-wider text-[#ea580c] bg-[#ffedd5] px-2.5 py-0.5 rounded-full font-bold">
                        Frequently Bought Together
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3.5 bg-[#f8fafc] rounded-2xl border border-[#e2e8f0]/80">
                      <div className="flex items-center gap-3.5 w-full sm:w-auto">
                        <div className="w-16 h-16 rounded-xl bg-white overflow-hidden shrink-0 relative flex items-center justify-center p-1 border border-[#e2e8f0] shadow-xs">
                          <Image
                            src={crossSellProduct.images[0]}
                            alt={crossSellProduct.shortTitle}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#0b1c30] leading-tight">
                            {crossSellProduct.shortTitle}
                          </h4>
                          <p className="text-xs text-[#584237] mt-0.5 line-clamp-1">
                            {crossSellProduct.highlights[0] || crossSellProduct.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-space font-bold text-sm text-[#0b1c30]">
                              ₹{crossSellProduct.price}
                            </span>
                            <span className="font-space text-xs text-[#584237]/60 line-through">
                              ₹{crossSellProduct.originalPrice}
                            </span>
                            <span className="text-[10px] text-[#ef4444] bg-[#ef4444]/10 px-1.5 py-0.2 rounded font-space font-bold">
                              Sale
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Add Button */}
                      <button
                        onClick={() => addToCart(crossSellProduct, 1)}
                        className="w-full sm:w-auto px-5 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 shrink-0"
                        type="button"
                      >
                        <ShoppingCart size={16} weight="Filled" />
                        <span>+ Add to Cart</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Triple Trust Guarantee Strip */}
                <div className="bg-[#f8fafc] rounded-3xl p-5 sm:p-6 border border-[#e2e8f0] grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#15803d]/10 text-[#15803d] flex items-center justify-center shrink-0">
                      <ShieldCheck size={22} weight="Filled" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-[#0b1c30]">100% Anti-Pinch Safe</h5>
                      <p className="text-xs text-[#584237] mt-0.5">
                        Child-grade components tested for delicate fingertips and sensitive nursery care.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#ffedd5] text-[#ea580c] flex items-center justify-center shrink-0">
                      <TruckFast size={22} weight="Filled" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-[#0b1c30]">7-Day Free Replacement</h5>
                      <p className="text-xs text-[#584237] mt-0.5">
                        Zero hassle doorstep pickup and replacement if anything arrives defective.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] text-[#0b1c30] flex items-center justify-center shrink-0">
                      <Check size={22} weight="Filled" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-[#0b1c30]">1-Year Kharido Warranty</h5>
                      <p className="text-xs text-[#584237] mt-0.5">
                        Comprehensive hardware warranty valid across verified service partners in India.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pincode Check & Delivery Estimation Widget */}
                <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#e2e8f0]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#f97316] flex items-center justify-center shrink-0">
                        <Location size={22} weight="Outline" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0b1c30]">
                          Check Express Delivery Speed to Your Pincode
                        </p>
                        {pincodeChecked && pincode ? (
                          <p className="text-xs text-[#584237]">
                            Delivering to <strong>{pincode} ({pincodeCity})</strong> in{" "}
                            <span className="text-[#15803d] font-bold">2-3 Days via BlueDart Express</span>
                          </p>
                        ) : (
                          <p className="text-xs text-[#584237]">
                            Enter your 6-digit PIN code to check doorstep delivery eligibility.
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={pincode}
                        placeholder="PIN Code"
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                        className="w-28 px-3 py-2 bg-[#f1f5f9] rounded-xl text-sm text-[#0b1c30] font-space font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#f97316]"
                      />
                      <button
                        onClick={handlePincodeCheck}
                        className="px-4 py-2 bg-[#0b1c30] text-white text-xs font-bold rounded-xl hover:bg-black transition-colors"
                        type="button"
                      >
                        Check
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Sticky Order Summary & Checkout Card (4 cols) */}
              <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#e2e8f0] relative">
                  <h3 className="text-lg font-bold text-[#0b1c30] pb-3 border-b border-[#f1f5f9]">
                    Order Summary
                  </h3>

                  {/* Price Breakdown */}
                  <div className="py-4 space-y-3 text-sm">
                    <div className="flex items-center justify-between text-[#584237]">
                      <span>Subtotal ({cartCount} {cartCount === 1 ? "item" : "items"})</span>
                      <span className="font-space font-semibold text-[#0b1c30]">
                        ₹{subtotal.toLocaleString("en-IN")}.00
                      </span>
                    </div>

                    {giftWrap && (
                      <div className="flex items-center justify-between text-[#584237]">
                        <span className="flex items-center gap-1">
                          <Gift size={16} weight="Filled" className="text-[#ea580c]" />
                          Festive Gift Packaging
                        </span>
                        <span className="font-space font-semibold text-[#0b1c30]">
                          ₹49.00
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[#584237]">
                      <div className="flex items-center gap-1">
                        <span>Shipping Charges</span>
                      </div>
                      <span className="font-space font-semibold">
                        {shippingFee === 0 ? (
                          <span className="text-[#15803d] font-bold">FREE</span>
                        ) : (
                          `₹${shippingFee}.00`
                        )}
                      </span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex items-center justify-between text-[#15803d] font-medium">
                        <span className="flex items-center gap-1">
                          <span>Coupon: {discountCode}</span>
                        </span>
                        <span className="font-space font-bold">-₹{discountAmount.toLocaleString("en-IN")}.00</span>
                      </div>
                    )}
                  </div>

                  {/* Coupon Input Field */}
                  <div className="pt-2 pb-4 border-t border-[#f1f5f9]">
                    {discountCode ? (
                      <div className="flex items-center justify-between bg-emerald-50 text-emerald-800 text-xs px-3 py-2.5 rounded-xl border border-emerald-200 font-semibold">
                        <span>Code Applied: <strong>{discountCode}</strong> (-₹{discountAmount})</span>
                        <button
                          onClick={removeCoupon}
                          className="text-rose-600 hover:underline text-[11px]"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          placeholder="Coupon code (KHARIDO10)"
                          className="flex-1 bg-[#f8fafc] text-xs px-3 py-2.5 rounded-xl border border-[#e2e8f0] focus:outline-none focus:ring-2 focus:ring-[#f97316] uppercase font-space font-bold"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2.5 bg-[#0b1c30] hover:bg-black text-white text-xs font-bold rounded-xl transition-all"
                        >
                          Apply
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Total Amount Card */}
                  <div className="pt-4 border-t border-[#f1f5f9]">
                    <div className="flex items-baseline justify-between mb-1">
                      <div>
                        <span className="text-base font-extrabold text-[#0b1c30]">
                          Total Amount
                        </span>
                        <p className="text-[11px] text-[#584237]">Inclusive of all taxes</p>
                      </div>
                      <span className="font-space font-bold text-2xl text-[#ea580c]">
                        ₹{grandTotal.toLocaleString("en-IN")}.00
                      </span>
                    </div>

                    {/* Total Savings Pill */}
                    {totalSavings > 0 && (
                      <div className="mt-3 py-2 px-3 bg-[#15803d]/10 rounded-xl flex items-center justify-between">
                        <span className="text-xs text-[#15803d] font-bold flex items-center gap-1.5">
                          <Check size={16} weight="Filled" />
                          Your Total Savings
                        </span>
                        <span className="font-space text-xs font-bold text-[#15803d]">
                          ₹{totalSavings.toLocaleString("en-IN")}.00
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Primary Checkout CTA Button */}
                  <div className="mt-6 space-y-3">
                    <Link
                      href="/checkout"
                      className="w-full h-13 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-sm rounded-2xl shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
                    >
                      <span>Proceed to Secure Checkout</span>
                      <ArrowRight size={18} weight="Outline" className="group-hover:translate-x-1 transition-transform" />
                    </Link>

                    {/* Express UPI Pill */}
                    <div className="pt-2 text-center">
                      <p className="text-[11px] uppercase tracking-wider text-[#584237]/70 font-bold mb-2">
                        Guaranteed Safe & Instant Checkout
                      </p>
                      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#584237] bg-[#f8fafc] py-2 rounded-xl border border-[#e2e8f0]">
                        <ShieldCheck size={16} weight="Filled" className="text-[#15803d]" />
                        <span>UPI • COD Available • 256-Bit SSL Encrypted</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Continue Shopping Link */}
                <div className="text-center">
                  <Link
                    href="/shop"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#584237] hover:text-[#f97316] transition-colors"
                  >
                    <ArrowLeft size={14} weight="Outline" />
                    <span>Continue Browsing Products</span>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
