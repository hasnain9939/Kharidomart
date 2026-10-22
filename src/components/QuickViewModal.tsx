"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import {
  CloseCircle,
  Star,
  ShoppingBag,
  Heart,
  TruckFast,
  ArrowRight,
} from "reicon-react";

export default function QuickViewModal() {
  const {
    quickViewProduct,
    closeQuickView,
    addToCart,
    toggleWishlist,
    isWishlisted,
  } = useStore();

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!quickViewProduct) return null;

  const wishlisted = isWishlisted(quickViewProduct.id);
  const discountPercent = Math.round(
    ((quickViewProduct.originalPrice - quickViewProduct.price) /
      quickViewProduct.originalPrice) *
      100
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 md:p-10 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={closeQuickView}
        className="fixed inset-0 bg-[#2b1f1a]/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#eddcd1] z-10 animate-in zoom-in-95 duration-200 my-8">
        {/* Close Button */}
        <button
          onClick={closeQuickView}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-[#fbf7f0] text-[#6b5850] hover:text-[#2b1f1a] transition-colors shadow-xs"
          aria-label="Close modal"
        >
          <CloseCircle size={22} weight="Outline" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
          {/* Left: Gallery Images */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#fdfbf7] border border-[#eddcd1]">
              <Image
                src={
                  quickViewProduct.images[selectedImageIdx] ||
                  quickViewProduct.images[0]
                }
                alt={quickViewProduct.title}
                fill
                className="object-cover"
                priority
              />
              {quickViewProduct.badge && (
                <span className="absolute top-3 left-3 bg-[#e06b5b] text-white text-xs font-extrabold uppercase px-3 py-1 rounded-full shadow-xs">
                  {quickViewProduct.badge}
                </span>
              )}
            </div>

            {/* Thumbnail selector */}
            {quickViewProduct.images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {quickViewProduct.images.slice(0, 6).map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      selectedImageIdx === idx
                        ? "border-[#e06b5b] ring-2 ring-[#e06b5b]/20"
                        : "border-[#eddcd1] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${quickViewProduct.title} preview thumbnail ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Details & Purchase */}
          <div className="flex flex-col justify-between space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#e06b5b]">
                {quickViewProduct.category}
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#2b1f1a] mt-1 leading-snug">
                {quickViewProduct.title}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2.5">
                <div className="flex text-[#f59e0b]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} weight="Filled" />
                  ))}
                </div>
                <span className="text-sm font-bold text-[#2b1f1a]">
                  {quickViewProduct.rating}
                </span>
                <span className="text-xs text-[#6b5850]">
                  {quickViewProduct.reviewsCount > 0
                    ? `(${quickViewProduct.reviewsCount} customer reviews)`
                    : "(100% Quality Inspected)"}
                </span>
              </div>

              {/* Price & Savings */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#2b1f1a]">
                  ₹{quickViewProduct.price.toLocaleString("en-IN")}.00
                </span>
                {quickViewProduct.originalPrice > quickViewProduct.price && (
                  <>
                    <span className="text-base text-[#6b5850]/60 line-through">
                      ₹{quickViewProduct.originalPrice.toLocaleString("en-IN")}.00
                    </span>
                    <span className="text-xs font-bold text-[#4f775d] bg-[#eaf3ed] px-2.5 py-0.5 rounded-full border border-[#d2e7d7]">
                      Save {discountPercent}%
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="mt-3.5 text-xs sm:text-sm text-[#6b5850] leading-relaxed">
                {quickViewProduct.description}
              </p>

              {/* Key Bullet Highlights */}
              <div className="mt-4 space-y-1.5 bg-[#fdfbf7] p-3.5 rounded-xl border border-[#eddcd1]">
                <p className="text-xs font-bold text-[#2b1f1a] uppercase tracking-wide">
                  Top Mom-Approved Highlights:
                </p>
                <ul className="text-xs text-[#6b5850] space-y-1 list-disc list-inside">
                  {quickViewProduct.highlights.slice(0, 3).map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-3 border-t border-[#eddcd1]">
              <div className="flex items-center gap-3">
                {/* Quantity */}
                <div className="flex items-center border border-[#eddcd1] rounded-xl overflow-hidden bg-[#fdfbf7]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-2 text-[#2b1f1a] hover:bg-[#eddcd1]/40 font-bold"
                  >
                    -
                  </button>
                  <span className="px-4 text-sm font-bold text-[#2b1f1a]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 py-2 text-[#2b1f1a] hover:bg-[#eddcd1]/40 font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={() => {
                    addToCart(quickViewProduct, quantity);
                    closeQuickView();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#e06b5b] hover:bg-[#c95444] active:scale-95 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-[0_4px_14px_rgba(224,107,91,0.3)] text-sm"
                >
                  <ShoppingBag size={18} weight="Filled" />
                  <span>Add to Bag • ₹{quickViewProduct.price * quantity}</span>
                </button>

                {/* Wishlist */}
                <button
                  onClick={() => toggleWishlist(quickViewProduct.id)}
                  className={`p-3 rounded-xl border transition-colors ${
                    wishlisted
                      ? "bg-[#fdedeb] border-[#f5c7c1] text-[#e06b5b]"
                      : "border-[#eddcd1] text-[#6b5850] hover:border-[#f5c7c1] hover:text-[#e06b5b]"
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart size={20} weight={wishlisted ? "Filled" : "Outline"} />
                </button>
              </div>

              {/* View Full Product Link */}
              <div className="flex items-center justify-between text-xs text-[#6b5850] pt-1">
                <span className="flex items-center gap-1.5">
                  <TruckFast size={14} weight="Filled" className="text-[#4f775d]" />
                  Free Express Delivery on orders ₹499+
                </span>
                <Link
                  href={`/products/${quickViewProduct.slug}`}
                  onClick={closeQuickView}
                  className="font-bold text-[#e06b5b] hover:underline flex items-center gap-1"
                >
                  <span>Full Details</span>
                  <ArrowRight size={14} weight="Outline" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
