"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Product } from "@/data/products";
import { CATEGORIES } from "@/data/categories";
import { useStore } from "@/context/StoreContext";
import ProductCard from "@/components/ProductCard";
import { Search, ShoppingBag, ArrowRight } from "reicon-react";

function ShopContent() {
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get("filter") || "all";
  const { wishlist, products, isLoadingProducts } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialFilter === "wishlist" ? "wishlist" : "all"
  );
  const [sortBy, setSortBy] = useState<string>("featured");
  const [searchTerm, setSearchTerm] = useState<string>("");

  let filtered: Product[] = [...products];

  // Category or Wishlist filter
  if (selectedCategory === "wishlist") {
    filtered = filtered.filter((p) => wishlist.includes(p.id));
  } else if (selectedCategory !== "all") {
    filtered = filtered.filter((p) => p.categorySlug === selectedCategory);
  }

  // Search keyword filter
  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (sortBy === "price-asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortBy === "price-desc") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sortBy === "rating") {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#e06b5b]/15 via-[#e06b5b]/5 to-transparent p-6 sm:p-10 rounded-3xl border border-[#eddcd1]">
        <span className="text-xs font-bold uppercase tracking-widest text-[#e06b5b]">
          Kharido Mart Store
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2b1f1a] mt-1">
          {selectedCategory === "wishlist" ? "Your Wishlist Items ❤️" : "Explore All Products"}
        </h1>
        <p className="text-sm text-[#6b5850] mt-2 max-w-xl">
          Discover smart lifestyle gadgets, thoughtful baby essentials, and interactive screen-free learning products for happy everyday living.
        </p>
      </div>

      {/* Control Bar: Search, Category Pills & Sort */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#eddcd1]">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              selectedCategory === "all"
                ? "bg-[#2b1f1a] text-white shadow-sm"
                : "bg-[#fbf7f0] text-[#6b5850] hover:text-[#2b1f1a] hover:bg-[#f3ede4] border border-[#eddcd1]/70"
            }`}
          >
            All Products ({products.length})
          </button>

          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                selectedCategory === cat.slug
                  ? "bg-[#e06b5b] text-white shadow-sm"
                  : "bg-[#fbf7f0] text-[#6b5850] hover:text-[#2b1f1a] hover:bg-[#f3ede4] border border-[#eddcd1]/70"
              }`}
            >
              {cat.name}
            </button>
          ))}

          <button
            onClick={() => setSelectedCategory("wishlist")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              selectedCategory === "wishlist"
                ? "bg-[#e06b5b] text-white shadow-sm"
                : "bg-[#fbf7f0] text-[#6b5850] hover:text-[#2b1f1a] hover:bg-[#f3ede4] border border-[#eddcd1]/70"
            }`}
          >
            Saved Items ({wishlist.length})
          </button>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1 sm:w-60">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search in shop..."
              className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 rounded-xl bg-[#fbf7f0] border border-[#eddcd1] focus:outline-none focus:border-[#e06b5b] text-[#2b1f1a]"
            />
            <div className="absolute left-3 top-2.5 text-stone-400">
              <Search size={14} weight="Outline" />
            </div>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs sm:text-sm px-3 py-2 rounded-xl bg-[#fbf7f0] border border-[#eddcd1] text-[#2b1f1a] font-medium focus:outline-none focus:border-[#e06b5b] shrink-0"
          >
            <option value="featured">Featured First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {isLoadingProducts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-5 border border-stone-200 animate-pulse space-y-4">
              <div className="w-full aspect-square bg-stone-100 rounded-2xl" />
              <div className="h-4 bg-stone-100 rounded w-3/4" />
              <div className="h-3 bg-stone-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 sm:py-20 text-center space-y-4 bg-white rounded-3xl border border-[#eddcd1] max-w-xl mx-auto p-6">
          <div className="w-16 h-16 rounded-2xl bg-[#fbf7f0] text-[#e06b5b] flex items-center justify-center mx-auto">
            <ShoppingBag size={32} weight="Filled" />
          </div>
          {products.length === 0 ? (
            <>
              <p className="text-xl font-bold text-stone-900">New Arrivals Coming Soon</p>
              <p className="text-sm text-stone-500 max-w-md mx-auto">
                Our team is currently certifying new batches of child-safe essentials. Explore our milestone collections or contact support on WhatsApp for special requests.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/#collections-bento"
                  className="inline-flex items-center gap-2 bg-[#e06b5b] hover:bg-[#c95444] text-white font-bold px-6 py-3 rounded-xl text-xs transition-all shadow-sm active:scale-95"
                >
                  <span>Explore Milestone Collections</span>
                  <ArrowRight size={14} weight="Outline" />
                </Link>
                <a
                  href="https://wa.me/918540017572?text=Hi%20Kharido%20Mart,%20I'm%20inquiring%20about%20products"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-800 font-bold px-5 py-3 rounded-xl text-xs border border-stone-200 transition-all shadow-2xs active:scale-95"
                >
                  <span>Ask on WhatsApp</span>
                </a>
              </div>
            </>
          ) : (
            <>
              <p className="text-lg font-bold text-stone-800">No products match your selection</p>
              <p className="text-xs text-stone-500">
                {selectedCategory === "wishlist"
                  ? "You haven't saved any products to your wishlist yet."
                  : "Try adjusting your search terms or filters."}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchTerm("");
                }}
                className="bg-[#e06b5b] hover:bg-[#c95444] text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all active:scale-95 shadow-sm"
              >
                Reset Filters
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-12 text-center text-stone-500">Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
