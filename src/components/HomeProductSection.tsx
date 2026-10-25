"use client";

import React, { useState } from "react";
import { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Sparkles, ShoppingBag, ArrowRight, Headphones } from "reicon-react";

interface HomeProductSectionProps {
  initialProducts: Product[];
}

export default function HomeProductSection({
  initialProducts = [],
}: HomeProductSectionProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const categoryFilters = [
    { label: "All Mom Favorites", key: "all", count: initialProducts.length },
    {
      label: "Mom & Newborn Care",
      key: "mom-baby",
      count: initialProducts.filter((p) => p.categorySlug === "mom-baby").length,
    },
    {
      label: "Screen-Free Learning",
      key: "fun-clever-finds",
      count: initialProducts.filter((p) => p.categorySlug === "fun-clever-finds").length,
    },
    {
      label: "Nursery & Night Lights",
      key: "smart-gadgets",
      count: initialProducts.filter((p) => p.categorySlug === "smart-gadgets").length,
    },
    {
      label: "Healthy Feeding & Home",
      key: "home-kitchen",
      count: initialProducts.filter((p) => p.categorySlug === "home-kitchen").length,
    },
  ];

  const filteredProducts =
    activeCategory === "all"
      ? initialProducts
      : initialProducts.filter((p) => p.categorySlug === activeCategory);

  return (
    <section className="w-full py-12 sm:py-20 bg-[#fdfbf7]" id="featured-products">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[#e06b5b] text-xs uppercase tracking-wider font-bold mb-2">
              <Sparkles size={14} weight="Filled" />
              <span>Trending Mom-Approved Essentials</span>
            </div>
            <h2 className="text-2xl sm:text-4xl text-[#2b1f1a] font-black tracking-tight">
              Featured Parenting Bestsellers
            </h2>
            <p className="text-sm sm:text-base text-[#6b5850] mt-1">
              Verified for 100% child-safe materials, durability, and stress-free daily use.
            </p>
          </div>

          {/* Filter Tabs - Horizontal touch-scrollable rail on mobile, wrapping on desktop */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x sm:flex-wrap -mx-3 px-3 sm:mx-0 sm:px-0 pb-1.5 sm:pb-0 w-full md:w-auto">
            {categoryFilters
              .filter((tab) => tab.key === "all" || tab.count > 0)
              .map((tab) => {
              const isActive = activeCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveCategory(tab.key)}
                  className={`shrink-0 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-150 active:scale-95 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-[#e06b5b] text-white shadow-sm"
                      : "bg-white text-[#6b5850] hover:text-[#2b1f1a] hover:bg-[#fbf7f0] border border-[#eddcd1]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono tabular-nums ${
                      isActive ? "bg-white/20 text-white" : "bg-[#fbf7f0] text-[#6b5850]"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Instant SSR-Rendered Product Grid - 2 columns on mobile, 4 on desktop */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#eddcd1] shadow-xs max-w-3xl mx-auto text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#fdedeb] text-[#e06b5b] flex items-center justify-center mx-auto shadow-2xs">
              <Sparkles size={32} weight="Filled" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-[#2b1f1a] tracking-tight">
                New Handpicked Arrivals Dropping This Week
              </h3>
              <p className="text-sm text-[#6b5850] max-w-lg mx-auto leading-relaxed">
                Our quality team is currently inspecting and prepping the next batch of BPA-free, child-safe essentials. Explore our milestone collections below or get in touch for custom requests.
              </p>
            </div>

            {/* Quick Collection Jump Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-left">
              <Link
                href="/collections/mom-baby"
                className="p-3.5 rounded-xl bg-[#fbf7f0] border border-[#eddcd1] hover:border-[#e06b5b] transition-all group"
              >
                <p className="text-[11px] font-bold text-[#e06b5b] uppercase tracking-wider">0–12M</p>
                <p className="text-xs font-black text-[#2b1f1a] group-hover:text-[#e06b5b] transition-colors mt-0.5">Mom &amp; Baby</p>
              </Link>
              <Link
                href="/collections/fun-clever-finds"
                className="p-3.5 rounded-xl bg-[#eaf3ed] border border-[#d2e7d7] hover:border-[#4f775d] transition-all group"
              >
                <p className="text-[11px] font-bold text-[#4f775d] uppercase tracking-wider">1–4Y</p>
                <p className="text-xs font-black text-[#2b1f1a] group-hover:text-[#4f775d] transition-colors mt-0.5">Montessori Play</p>
              </Link>
              <Link
                href="/collections/home-kitchen"
                className="p-3.5 rounded-xl bg-[#fbf7f0] border border-[#eddcd1] hover:border-[#e06b5b] transition-all group"
              >
                <p className="text-[11px] font-bold text-[#4f775d] uppercase tracking-wider">Feeding</p>
                <p className="text-xs font-black text-[#2b1f1a] group-hover:text-[#4f775d] transition-colors mt-0.5">Baby Purees</p>
              </Link>
              <Link
                href="/collections/smart-gadgets"
                className="p-3.5 rounded-xl bg-[#f6f1eb] border border-[#eddcd1] hover:border-[#2b1f1a] transition-all group"
              >
                <p className="text-[11px] font-bold text-[#6b5850] uppercase tracking-wider">Bedtime</p>
                <p className="text-xs font-black text-[#2b1f1a] group-hover:text-[#e06b5b] transition-colors mt-0.5">Nursery Lamps</p>
              </Link>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#e06b5b] hover:bg-[#c95444] text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm active:scale-95"
              >
                <ShoppingBag size={16} weight="Filled" />
                <span>Browse Full Catalog</span>
                <ArrowRight size={15} weight="Outline" />
              </Link>
              <a
                href="https://wa.me/918540017572?text=Hi%20Kharido%20Mart,%20I'm%20looking%20for%20a%20baby%20product"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white hover:bg-stone-50 text-[#2b1f1a] text-xs sm:text-sm font-bold rounded-xl border border-[#eddcd1] transition-all shadow-2xs active:scale-95"
              >
                <Headphones size={16} weight="Outline" />
                <span>Ask Support on WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
