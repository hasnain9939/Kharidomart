"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { Star, Heart, ShoppingBag, Eye, Check } from "reicon-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, isWishlisted, openQuickView } = useStore();
  const wishlisted = isWishlisted(product.id);

  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  return (
    <div className="group relative bg-white rounded-2xl p-3.5 sm:p-4 border border-[#eddcd1]/80 shadow-[0_2px_8px_rgba(43,31,26,0.04),0_12px_24px_rgba(43,31,26,0.05)] hover:shadow-[0_4px_16px_rgba(43,31,26,0.08),0_20px_36px_rgba(224,107,91,0.15)] hover:border-[#e06b5b]/50 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
      {/* Product Image Box */}
      <div className="relative aspect-square w-full bg-[#fbf8f3] rounded-xl overflow-hidden mb-3">
        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          {product.featured && (
            <span className="bg-[#4f775d] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
              <span>⭐</span> MOM FAVORITE
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-[#e06b5b] text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-xs">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist Button with Tactile Feedback */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-100 ease-out active:scale-90 shadow-sm ${
            wishlisted
              ? "bg-rose-500 text-white"
              : "bg-white/90 text-[#0b1c30]/70 hover:text-rose-500 hover:bg-white"
          }`}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            size={16}
            weight={wishlisted ? "Filled" : "Outline"}
          />
        </button>

        {/* Product Image Link */}
        <Link
          href={`/products/${product.slug}`}
          className="block w-full h-full relative"
        >
          <Image
            src={product.images[0] || "/assets/images/baby-nail-trimmer-345704.jpg"}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
          {product.images[1] && (
            <Image
              src={product.images[1]}
              alt={`${product.title} - alternate angle`}
              fill
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out absolute inset-0"
            />
          )}
        </Link>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-x-3 bottom-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openQuickView(product);
            }}
            className="w-full py-2 bg-white/95 hover:bg-white active:scale-[0.98] text-[#0b1c30] text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <Eye size={15} weight="Outline" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 justify-between gap-3">
        <div>
          {/* Star Rating Row with Tabular Numbers */}
          <div className="flex items-center gap-1 text-[#f59e0b] mb-1.5">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={13}
                  weight={i < Math.floor(product.rating) ? "Filled" : "Outline"}
                  className="text-[#f59e0b]"
                />
              ))}
            </div>
            <span className="text-xs text-[#2b1f1a]/70 font-mono font-semibold ml-1 tabular-nums">
              {product.reviewsCount > 0 ? `${product.rating} (${product.reviewsCount.toLocaleString("en-IN")})` : "New Arrival"}
            </span>
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="font-bold text-sm sm:text-base text-[#2b1f1a] line-clamp-2 leading-snug group-hover:text-[#e06b5b] transition-colors">
              {product.title}
            </h3>
          </Link>

          {/* Short Highlight / Category Tag */}
          <p className="text-xs text-[#6b5850] line-clamp-1 mt-1 font-medium">
            {product.highlights?.[0] || product.category}
          </p>
        </div>

        {/* Pricing & Cart Action with Tabular Numbers */}
        <div className="pt-2 border-t border-[#eddcd1]/80">
          <div className="flex items-baseline gap-2 mb-2 font-mono tabular-nums">
            <span className="text-base sm:text-lg text-[#2b1f1a] font-black tracking-tight">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-[#6b5850]/60 line-through">
                ₹{product.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
            {discountPercent > 0 && (
              <span className="text-[11px] text-[#4f775d] font-bold bg-[#eaf3ed] px-1.5 py-0.5 rounded">
                Save {discountPercent}%
              </span>
            )}
          </div>

          {/* Stock Delivery Indicator */}
          <div className="flex items-center justify-between mb-3 text-[11px]">
            <div className="flex items-center gap-1.5 text-[#4f775d] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4f775d] animate-pulse"></span>
              <span>Baby-Safe • Fast COD</span>
            </div>
            <span className="text-[#6b5850] text-[10px] font-mono tabular-nums">
              {product.reviewsCount > 0 ? `${product.reviewsCount}+ happy moms` : "Verified Quality"}
            </span>
          </div>

          {/* Quick Add Button with Emil Kowalski spring feedback */}
          <button
            onClick={() => addToCart(product, 1)}
            className="w-full py-2.5 bg-[#e06b5b] hover:bg-[#c95444] active:scale-[0.97] text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(224,107,91,0.28)] hover:shadow-[0_6px_20px_rgba(224,107,91,0.38)] transition-all duration-150"
          >
            <ShoppingBag size={16} weight="Filled" />
            <span>Quick Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
