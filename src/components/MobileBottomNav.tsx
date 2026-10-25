"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/context/StoreContext";
import {
  Shop,
  Category,
  Search,
  Heart,
  ShoppingBag,
} from "reicon-react";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cartCount, wishlist, openCart } = useStore();

  const handleSearchClick = () => {
    // Smoothly scroll to the top where the search input lives and focus it
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => {
      const searchInputs = document.querySelectorAll<HTMLInputElement>('input[type="text"]');
      if (searchInputs.length > 0) {
        // Focus the mobile search input (typically the last or second input)
        const mobileInput = searchInputs[searchInputs.length - 1];
        mobileInput?.focus();
      }
    }, 250);
  };

  const isHomeActive = pathname === "/";
  const isWishlistActive = pathname === "/shop" && typeof window !== "undefined" && window.location.search.includes("wishlist");
  const isShopActive = pathname === "/shop" && !isWishlistActive;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-[65] md:hidden bg-white/95 backdrop-blur-md border-t border-[#eddcd1]/80 shadow-[0_-4px_24px_rgba(43,31,26,0.08)] px-2 pt-2 pb-[calc(env(safe-area-inset-bottom,0px)+8px)]"
      aria-label="Mobile Navigation Dock"
    >
      <div className="grid grid-cols-5 items-center justify-items-center max-w-md mx-auto">
        {/* 1. Home / Explore */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center gap-1 py-1 w-full text-center transition-all duration-150 active:scale-90 cursor-pointer ${
            isHomeActive
              ? "text-[#e06b5b] font-bold"
              : "text-[#6b5850] hover:text-[#2b1f1a] font-medium"
          }`}
          aria-label="Home"
        >
          <div className="relative">
            <Shop
              size={22}
              weight={isHomeActive ? "Filled" : "Outline"}
              className={isHomeActive ? "text-[#e06b5b]" : "text-[#6b5850]"}
            />
          </div>
          <span className="text-[10px] tracking-tight leading-none">Home</span>
        </Link>

        {/* 2. Categories / Collections */}
        <Link
          href="/shop#collections-bento"
          className={`flex flex-col items-center justify-center gap-1 py-1 w-full text-center transition-all duration-150 active:scale-90 cursor-pointer ${
            isShopActive
              ? "text-[#e06b5b] font-bold"
              : "text-[#6b5850] hover:text-[#2b1f1a] font-medium"
          }`}
          aria-label="Collections and Categories"
        >
          <div className="relative">
            <Category
              size={22}
              weight={isShopActive ? "Filled" : "Outline"}
              className={isShopActive ? "text-[#e06b5b]" : "text-[#6b5850]"}
            />
          </div>
          <span className="text-[10px] tracking-tight leading-none">Categories</span>
        </Link>

        {/* 3. Search Trigger */}
        <button
          type="button"
          onClick={handleSearchClick}
          className="flex flex-col items-center justify-center gap-1 py-1 w-full text-center text-[#6b5850] hover:text-[#e06b5b] transition-all duration-150 active:scale-90 cursor-pointer font-medium"
          aria-label="Search Kharido Mart"
        >
          <div className="relative">
            <Search size={22} weight="Outline" className="text-[#6b5850]" />
          </div>
          <span className="text-[10px] tracking-tight leading-none">Search</span>
        </button>

        {/* 4. Wishlist with Count Badge */}
        <Link
          href="/shop?filter=wishlist"
          className="flex flex-col items-center justify-center gap-1 py-1 w-full text-center text-[#6b5850] hover:text-rose-500 transition-all duration-150 active:scale-90 cursor-pointer font-medium"
          aria-label={`Wishlist (${wishlist.length} saved)`}
        >
          <div className="relative">
            <Heart
              size={22}
              weight={wishlist.length > 0 ? "Filled" : "Outline"}
              className={wishlist.length > 0 ? "text-rose-500" : "text-[#6b5850]"}
            />
            {wishlist.length > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold font-space flex items-center justify-center shadow-xs">
                {wishlist.length}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight leading-none">Wishlist</span>
        </Link>

        {/* 5. Cart Drawer Trigger with Vibrant Pill Badge */}
        <button
          type="button"
          onClick={openCart}
          className="flex flex-col items-center justify-center gap-1 py-1 w-full text-center text-[#e06b5b] hover:text-[#c95444] transition-all duration-150 active:scale-90 cursor-pointer font-bold"
          aria-label={`Open shopping cart with ${cartCount} items`}
        >
          <div className="relative">
            <ShoppingBag
              size={22}
              weight="Filled"
              className="text-[#e06b5b]"
            />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#e06b5b] text-white text-[9px] font-bold font-space flex items-center justify-center shadow-xs animate-in zoom-in-50 duration-200">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight leading-none">
            Cart {cartCount > 0 && `(${cartCount})`}
          </span>
        </button>
      </div>
    </nav>
  );
}
