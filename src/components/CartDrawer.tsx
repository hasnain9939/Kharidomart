"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import {
  CloseCircle,
  ShoppingCart,
  ShoppingBag,
  TruckFast,
  Trash,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Gift,
} from "reicon-react";

export default function CartDrawer() {
  const {
    products,
    cart,
    cartCount,
    subtotal,
    freeShippingThreshold,
    discountCode,
    discountAmount,
    finalTotal,
    isCartOpen,
    closeCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    showToast,
  } = useStore();

  const [couponInput, setCouponInput] = useState("");

  if (!isCartOpen) return null;

  const giftThreshold = 999;
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 79;
  const grandTotal = finalTotal + shippingFee;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const amountToFreeGift = Math.max(0, giftThreshold - subtotal);

  // Overall multi-tier progress percentage (up to 999)
  const tierProgress = Math.min(100, Math.round((subtotal / giftThreshold) * 100));

  // Available cross-sells
  const crossSellProducts = products.filter(
    (p) => !cart.some((c) => c.product.id === p.id)
  ).slice(0, 3);

  const handleAddCrossSell = (product: any) => {
    addToCart(product, 1);
    showToast(`Added ${product.shortTitle || product.title} to your bag! 🍼`);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    if (applyCoupon(couponInput)) {
      setCouponInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#eddcd1] flex items-center justify-between bg-[#fbf7f0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#fdedeb] text-[#e06b5b] flex items-center justify-center">
              <ShoppingBag size={18} weight="Filled" />
            </div>
            <h2 className="font-bold text-base text-[#2b1f1a]">
              Mom Care Cart <span className="font-space font-semibold text-sm text-[#6b5850]">({cartCount})</span>
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-full text-[#6b5850]/70 hover:text-[#2b1f1a] hover:bg-[#eddcd1]/50 transition-colors cursor-pointer"
            aria-label="Close cart drawer"
          >
            <CloseCircle size={22} weight="Outline" />
          </button>
        </div>

        {/* Tiered Multi-Milestone Freebie Progress Meter */}
        <div className="bg-[#fbf7f0] px-5 py-3.5 border-b border-[#eddcd1]/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-[#2b1f1a]">
            <span className="flex items-center gap-1.5">
              {subtotal >= giftThreshold ? (
                <span className="text-[#4f775d] font-bold flex items-center gap-1">
                  <Gift size={16} weight="Filled" />
                  🎉 Unlocked: FREE Express Air + Baby Gift!
                </span>
              ) : subtotal >= freeShippingThreshold ? (
                <span className="text-[#4f775d] font-bold flex items-center gap-1">
                  <TruckFast size={16} weight="Filled" />
                  Free Delivery Unlocked! Add ₹{amountToFreeGift} for Free Baby Gift 🎁
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <TruckFast size={16} weight="Filled" className="text-[#e06b5b]" />
                  Add <strong className="text-[#e06b5b] font-space font-bold">₹{amountToFreeShipping}</strong> for FREE Delivery
                </span>
              )}
            </span>
            <span className="font-space text-xs font-bold text-[#e06b5b]">
              {tierProgress}%
            </span>
          </div>

          <div className="relative w-full h-2.5 bg-[#eddcd1] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#e06b5b] to-[#4f775d] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${tierProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#6b5850]/80 pt-0.5">
            <span className={subtotal >= freeShippingThreshold ? "text-[#4f775d] font-bold" : ""}>
              ✓ ₹499 Free Delivery
            </span>
            <span className={subtotal >= giftThreshold ? "text-[#4f775d] font-bold" : ""}>
              🎁 ₹999 Free Baby Gift
            </span>
          </div>
        </div>

        {/* Cart Items Area */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-[#fdfbf7]">
            <div className="w-16 h-16 rounded-2xl bg-[#fdedeb] text-[#e06b5b] flex items-center justify-center">
              <ShoppingCart size={32} weight="Outline" />
            </div>
            <h3 className="font-bold text-lg text-[#2b1f1a]">Your Cart is Empty</h3>
            <p className="text-xs text-[#6b5850] max-w-xs leading-relaxed">
              Explore our best-selling whisper-quiet baby trimmers, interactive sound books, and non-toxic nursery essentials.
            </p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="px-6 py-2.5 bg-[#e06b5b] hover:bg-[#c95444] text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Scrollable Items List */}
            <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#f7ede8] space-y-4 bg-white">
              {cart.map((item) => (
                <div key={item.product.id} className="pt-4 first:pt-0 flex gap-3.5 items-start">
                  {/* Thumbnail */}
                  <div className="relative w-18 h-18 rounded-xl overflow-hidden bg-[#fdfbf7] shrink-0 border border-[#eddcd1]">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.shortTitle}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#2b1f1a] leading-snug line-clamp-2">
                      <Link
                        href={`/products/${item.product.slug}`}
                        onClick={closeCart}
                        className="hover:text-[#e06b5b] transition-colors"
                      >
                        {item.product.title}
                      </Link>
                    </h4>
                    <p className="text-[11px] text-[#4f775d] font-semibold mt-0.5">
                      {item.product.category}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#eddcd1] rounded-lg overflow-hidden bg-[#fdfbf7]">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2.5 py-0.5 text-[#2b1f1a] hover:bg-[#eddcd1]/40 transition-colors font-bold text-xs"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-space font-bold text-[#2b1f1a]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2.5 py-0.5 text-[#2b1f1a] hover:bg-[#eddcd1]/40 transition-colors font-bold text-xs"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="text-xs font-space font-bold text-[#2b1f1a]">
                          ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-[10px] text-[#6b5850]/60 font-space">
                            (₹{item.product.price} each)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-[#6b5850]/50 hover:text-[#e06b5b] p-1 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash size={16} weight="Outline" />
                  </button>
                </div>
              ))}

              {/* Frequently Bought Together / Moms Also Added (Special Bundle Offer) */}
              {crossSellProducts.length > 0 && (
                <div className="mt-6 pt-5 border-t border-[#eddcd1]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#2b1f1a]">
                      <Sparkles size={14} weight="Filled" className="text-[#e06b5b]" />
                      <span>Moms Frequently Added</span>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#fdedeb] text-[#e06b5b]">
                      Special Add-on
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {crossSellProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-3 p-2.5 rounded-xl border border-[#eddcd1] bg-[#fdfbf7] hover:border-[#e06b5b]/40 transition-colors"
                      >
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white shrink-0 border border-[#eddcd1]/80">
                          <Image
                            src={product.images[0]}
                            alt={product.shortTitle}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-[11px] font-bold text-[#2b1f1a] truncate">
                            {product.shortTitle}
                          </h5>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs font-space font-bold text-[#2b1f1a]">
                              ₹{product.price}
                            </span>
                            {product.originalPrice && (
                              <span className="text-[10px] text-[#6b5850]/50 line-through font-space">
                                ₹{product.originalPrice}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddCrossSell(product)}
                          className="shrink-0 px-3 py-1.5 bg-[#e06b5b] hover:bg-[#c95444] text-white text-[11px] font-bold rounded-lg transition-all shadow-xs active:scale-[0.98] cursor-pointer"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Summary & Two Dedicated Links */}
            <div className="p-5 border-t border-[#eddcd1] bg-[#fbf7f0] space-y-3.5">
              {/* Promo code badge or mini form */}
              {discountCode ? (
                <div className="flex items-center justify-between bg-[#eaf3ed] text-[#2c4a35] text-xs px-3 py-2 rounded-xl border border-[#d2e7d7] font-semibold">
                  <span>Coupon Applied: <strong>{discountCode}</strong> (-₹{discountAmount})</span>
                  <button
                    onClick={removeCoupon}
                    className="text-[#c95444] hover:underline text-[11px]"
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
                    placeholder="Coupon (e.g. KHARIDO10)"
                    className="flex-1 bg-white text-xs px-3 py-2 rounded-xl border border-[#eddcd1] focus:outline-none focus:ring-1 focus:ring-[#e06b5b] uppercase font-space font-bold text-[#2b1f1a]"
                  />
                  <button
                    type="submit"
                    className="bg-[#2b1f1a] hover:bg-[#3d2c25] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors active:scale-95"
                  >
                    Apply
                  </button>
                </form>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#6b5850]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-space font-semibold text-[#2b1f1a]">
                    ₹{subtotal.toLocaleString("en-IN")}.00
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#4f775d] font-semibold">
                    <span>Discount</span>
                    <span className="font-space">-₹{discountAmount.toLocaleString("en-IN")}.00</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-space font-semibold text-[#2b1f1a]">
                    {shippingFee === 0 ? (
                      <span className="text-[#4f775d] font-bold">FREE</span>
                    ) : (
                      `₹${shippingFee}.00`
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-[#eddcd1] flex justify-between items-baseline font-bold text-[#2b1f1a]">
                  <span className="text-sm">Estimated Total</span>
                  <span className="font-space font-extrabold text-base text-[#e06b5b]">
                    ₹{grandTotal.toLocaleString("en-IN")}.00
                  </span>
                </div>
              </div>

              {/* Action Buttons: 1. Checkout (Primary), 2. View Full Cart (Secondary) */}
              <div className="space-y-2 pt-1">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full bg-[#e06b5b] hover:bg-[#c95444] active:scale-95 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_14px_rgba(224,107,91,0.3)] text-sm flex items-center justify-center gap-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} weight="Outline" />
                </Link>

                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="w-full bg-white hover:bg-[#fbf7f0] active:scale-95 text-[#2b1f1a] font-bold py-2.5 rounded-xl transition-all border border-[#eddcd1] text-xs flex items-center justify-center gap-1.5"
                >
                  <span>View Full Cart Page</span>
                </Link>
              </div>

              <div className="text-center pt-0.5">
                <p className="text-[10px] text-[#6b5850] flex items-center justify-center gap-1">
                  <ShieldCheck size={13} weight="Filled" className="text-[#4f775d]" />
                  <span>Free doorstep exchange • 100% Baby-Safe Guarantee</span>
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
