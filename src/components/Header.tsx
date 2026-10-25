"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import KharidoMartLogo from "@/components/KharidoMartLogo";
import { useStore } from "@/context/StoreContext";
import {
  ShoppingBag,
  Search,
  Heart,
  User,
  Flame,
  Menu,
  CloseCircle,
} from "reicon-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, wishlist, openCart, user, products } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/shop");
    }
  };

  // Curated category and shopping navigation links tailored for moms & kids (hides empty collections)
  const categorySlugsWithProducts = new Set(products.map((p) => p.categorySlug));

  const allCategoryNavLinks = [
    { label: "Home", href: "/", showAlways: true },
    { label: "Mom & Baby Care", href: "/collections/mom-baby", slug: "mom-baby" },
    { label: "Screen-Free Learning", href: "/collections/fun-clever-finds", slug: "fun-clever-finds" },
    { label: "Nursery & Night Lamps", href: "/collections/smart-gadgets", slug: "smart-gadgets" },
    { label: "Healthy Feeding & Home", href: "/collections/home-kitchen", slug: "home-kitchen" },
    { label: "Shop All", href: "/shop", showAlways: true },
  ];

  const navLinks = allCategoryNavLinks.filter((link) => {
    if (link.showAlways) return true;
    if (products.length === 0) return true;
    return link.slug ? categorySlugsWithProducts.has(link.slug) : true;
  });

  const mobileUtilityLinks = [
    { label: "Track Your Order", href: "/track-order" },
    { label: "Help & Contact Us", href: "/contact" },
    { label: "About KharidoMart", href: "/about" },
  ];

  return (
    <header className="relative w-full bg-white/95 backdrop-blur-md border-b border-[#eddcd1]/80 sticky top-0 z-50 transition-all shadow-xs">
      {/* Main Row: Logo, Search, Action Icons */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          {/* Mobile Menu Button & Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#0b1c30] hover:bg-[#f8fafc] transition-colors lg:hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <CloseCircle size={24} weight="Outline" />
              ) : (
                <Menu size={24} weight="Outline" />
              )}
            </button>

            {/* Brand Logo - Vector SVG (Cart with K as the K for KharidoMart) */}
            <Link href="/" className="flex items-center group py-1 shrink-0" aria-label="KharidoMart Home">
              <KharidoMartLogo className="h-8 sm:h-9 md:h-10 w-auto group-hover:opacity-90 transition-opacity" />
            </Link>
          </div>

          {/* Search Bar - Center */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <span className="absolute left-4 text-[#584237]/70 pointer-events-none">
                <Search size={18} weight="Outline" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search baby nail trimmer, sensory busy board, sound books, nursery lamp..."
                className="w-full pl-11 pr-24 py-2.5 bg-[#fbf8f3] hover:bg-[#f6eee5] rounded-full font-sans text-sm text-[#2b1f1a] placeholder:text-[#6b5850]/60 border border-[#eddcd1] focus:border-[#e06b5b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e06b5b]/20 transition-all"
              />
              <button
                type="submit"
                className="absolute right-1 px-4 py-1.5 bg-[#e06b5b] hover:bg-[#c95444] active:scale-95 text-white font-medium text-xs rounded-full transition-all flex items-center gap-1 shadow-xs"
              >
                <span>Search</span>
              </button>
            </form>
          </div>

          {/* User Utility Actions */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Wishlist */}
            <Link
              href="/shop?filter=wishlist"
              className="relative hidden sm:flex items-center gap-1.5 text-[#0b1c30] hover:text-[#f97316] p-2 rounded-xl hover:bg-[#f8fafc] transition-all"
              aria-label="Wishlist"
            >
              <Heart
                size={20}
                weight={wishlist.length > 0 ? "Filled" : "Outline"}
                className={wishlist.length > 0 ? "text-rose-500" : ""}
              />
              <span className="hidden xl:inline text-xs font-semibold">Wishlist</span>
              {wishlist.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center font-space">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Account / Authentication */}
            <Link
              href="/account"
              className={`hidden lg:flex items-center gap-1.5 p-2 rounded-xl transition-all ${
                user
                  ? "text-[#e06b5b] bg-[#fdedeb] hover:bg-[#fedbd6] font-bold"
                  : "text-[#2b1f1a] hover:text-[#e06b5b] hover:bg-[#fbf8f3] font-semibold"
              }`}
              aria-label={user ? `Account of ${user.name}` : "Sign In or Register"}
            >
              <User size={20} weight={user ? "Filled" : "Outline"} className={user ? "text-[#e06b5b]" : ""} />
              <span className="text-xs">
                {user ? `Hi, ${user.name.split(" ")[0]}` : "Account"}
              </span>
            </Link>

            {/* Cart Pill Button */}
            <button
              onClick={openCart}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 bg-[#fdedeb] text-[#c95444] hover:bg-[#e06b5b] hover:text-white rounded-full cursor-pointer transition-all active:scale-95 shadow-xs font-sans"
              aria-label={`Shopping cart with ${cartCount} items`}
            >
              <ShoppingBag size={20} weight="Filled" />
              <span className="text-xs sm:text-sm font-bold tracking-tight">
                Cart <span className="font-space">({cartCount})</span>
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="mt-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <span className="absolute left-3.5 text-[#6b5850]/70 pointer-events-none">
              <Search size={16} weight="Outline" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search baby nail trimmer, sensory toys..."
              className="w-full pl-10 pr-20 py-2 bg-[#fbf8f3] rounded-full text-xs text-[#2b1f1a] placeholder:text-[#6b5850]/60 border border-[#eddcd1] focus:border-[#e06b5b] focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-1 px-3 py-1 bg-[#e06b5b] text-white text-xs font-medium rounded-full"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Secondary Category Navigation Strip */}
      <div className="hidden lg:block border-t border-[#eddcd1]/80 bg-white">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-11">
          <nav className="flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[13px] font-semibold transition-colors hover:text-[#e06b5b] ${
                    isActive
                      ? "text-[#e06b5b] font-bold"
                      : "text-[#2b1f1a]/85"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div>
            <Link
              href="/shop?filter=deals"
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fdedeb] text-[#c95444] hover:bg-[#e06b5b] hover:text-white rounded-full font-space text-[11px] font-bold uppercase tracking-wider transition-all"
            >
              <Flame size={13} weight="Filled" />
              <span>Trending Mom Deals 🔥</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu Floating On Top (No Layout Shift / Pushing Page Down) */}
      {mobileMenuOpen && (
        <>
          {/* Fullscreen Backdrop overlay - clicking anywhere closes the menu */}
          <div
            className="fixed inset-0 z-40 bg-[#2b1f1a]/40 backdrop-blur-[2px] animate-in fade-in duration-200 lg:hidden cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Floating Dropdown Panel on top */}
          <div
            className="absolute top-full left-0 right-0 z-50 bg-white border-b border-[#eddcd1] shadow-[0_20px_40px_rgba(43,31,26,0.18)] px-4 sm:px-6 py-5 space-y-4 max-h-[calc(100vh-130px)] overflow-y-auto animate-in slide-in-from-top-2 fade-in duration-200 lg:hidden"
          >
            {/* Main Categories */}
            <nav className="flex flex-col space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b5850]/70 px-3 pb-1">
                Shop Collections
              </span>
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between ${
                      isActive
                        ? "bg-[#fdedeb] text-[#e06b5b] font-bold"
                        : "text-[#2b1f1a] hover:bg-[#fbf7f0]"
                    }`}
                  >
                    <span>{link.label}</span>
                    <span className="text-xs text-[#6b5850]/40">→</span>
                  </Link>
                );
              })}
            </nav>

            {/* Quick Help & Tracking */}
            <div className="pt-2 border-t border-[#eddcd1]/80">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b5850]/70 px-3 pb-1 block">
                Customer Services &amp; Help
              </span>
              <div className="flex flex-col space-y-1 mt-1">
                {mobileUtilityLinks.map((u) => (
                  <Link
                    key={u.href}
                    href={u.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-[#6b5850] hover:text-[#e06b5b] hover:bg-[#fbf7f0] transition-colors"
                  >
                    {u.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Bottom Account & Wishlist strip */}
            <div className="pt-3 border-t border-[#eddcd1] flex items-center justify-between px-2">
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs text-[#2b1f1a] hover:text-[#e06b5b] font-bold flex items-center gap-1.5 py-1"
              >
                <User size={16} weight={user ? "Filled" : "Outline"} className={user ? "text-[#e06b5b]" : ""} />
                <span>{user ? `Hi, ${user.name.split(" ")[0]}` : "Account / Sign In"}</span>
              </Link>

              <Link
                href="/shop?filter=wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs text-[#2b1f1a] hover:text-[#e06b5b] font-semibold flex items-center gap-1"
              >
                <Heart size={15} weight={wishlist.length > 0 ? "Filled" : "Outline"} className={wishlist.length > 0 ? "text-rose-500" : ""} />
                <span>Wishlist ({wishlist.length})</span>
              </Link>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
