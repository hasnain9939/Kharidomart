"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
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
  ArrowRight,
  Sparkles,
} from "reicon-react";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, wishlist, openCart, user, products, addToCart, showToast } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchFocused, setIsMobileSearchFocused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [headerBottom, setHeaderBottom] = useState(112);
  const headerRef = useRef<HTMLElement | null>(null);
  const desktopSearchRef = useRef<HTMLDivElement | null>(null);
  const mobileSearchRef = useRef<HTMLDivElement | null>(null);

  // Close search and mobile menu on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) {
        setIsMobileSearchFocused(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchFocused(false);
        setIsMobileSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Matching products for live search preview
  const matchingProducts = searchQuery.trim().length >= 2
    ? products.filter((p) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          p.title.toLowerCase().includes(q) ||
          p.shortTitle?.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.highlights?.some((h) => h.toLowerCase().includes(q))
        );
      }).slice(0, 4)
    : [];

  const popularSearches = [
    "Baby Nail Trimmer",
    "Sound Books",
    "Silicone Feeder",
    "Montessori Busy Board",
    "Nursery Night Lamp",
  ];

  // Dynamically calculate the bottom edge of the sticky header
  const updateHeaderBottom = useCallback(() => {
    if (headerRef.current) {
      const rect = headerRef.current.getBoundingClientRect();
      setHeaderBottom(Math.round(rect.bottom));
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    updateHeaderBottom();
  }, [updateHeaderBottom]);

  const toggleMobileMenu = () => {
    if (!mobileMenuOpen) {
      updateHeaderBottom();
    }
    setMobileMenuOpen((prev) => !prev);
  };

  // Close mobile menu and search popovers on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setIsSearchFocused(false);
    setIsMobileSearchFocused(false);
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

  // Keep dropdown top position aligned and prevent background scroll while open
  useEffect(() => {
    if (mobileMenuOpen) {
      updateHeaderBottom();
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      window.addEventListener("resize", updateHeaderBottom);
      window.addEventListener("scroll", updateHeaderBottom);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("resize", updateHeaderBottom);
        window.removeEventListener("scroll", updateHeaderBottom);
      };
    }
  }, [mobileMenuOpen, updateHeaderBottom]);

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
    <header
      ref={headerRef}
      className="relative w-full bg-white/95 backdrop-blur-md border-b border-[#eddcd1]/80 sticky top-0 z-[70] transition-all shadow-xs"
    >
      {/* Main Row: Logo, Search, Action Icons */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          {/* Mobile Menu Button & Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-xl text-[#0b1c30] hover:bg-[#f8fafc] transition-colors lg:hidden cursor-pointer"
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

          {/* Search Bar - Center with Instant Autocomplete */}
          <div ref={desktopSearchRef} className="relative flex-1 max-w-2xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <span className="absolute left-4 text-[#584237]/70 pointer-events-none">
                <Search size={18} weight="Outline" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                }}
                placeholder="Search baby nail trimmer, sensory busy board, sound books, nursery lamp..."
                className="w-full pl-11 pr-24 py-2.5 bg-[#fbf8f3] hover:bg-[#f6eee5] rounded-full font-sans text-sm text-[#2b1f1a] placeholder:text-[#6b5850]/60 border border-[#eddcd1] focus:border-[#e06b5b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#e06b5b]/20 transition-all"
              />
              <button
                type="submit"
                className="absolute right-1 px-4 py-1.5 bg-[#e06b5b] hover:bg-[#c95444] active:scale-95 text-white font-medium text-xs rounded-full transition-all flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <span>Search</span>
              </button>
            </form>

            {/* Desktop Instant Search Results Dropdown */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-[#eddcd1] p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {searchQuery.trim().length >= 2 ? (
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#eddcd1]/70 text-xs font-bold text-[#2b1f1a]">
                      <span className="flex items-center gap-1.5">
                        <Sparkles size={14} weight="Filled" className="text-[#e06b5b]" />
                        Matching Products ({matchingProducts.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsSearchFocused(false)}
                        className="text-[#6b5850]/70 hover:text-[#2b1f1a] text-[11px] cursor-pointer"
                      >
                        Close
                      </button>
                    </div>

                    {matchingProducts.length > 0 ? (
                      <div className="space-y-2">
                        {matchingProducts.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#fbf7f0] transition-colors group cursor-pointer border border-transparent hover:border-[#eddcd1]/80"
                            onClick={() => {
                              setIsSearchFocused(false);
                              router.push(`/products/${p.slug}`);
                            }}
                          >
                            <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-[#fdfbf7] shrink-0 border border-[#eddcd1]">
                              <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-bold text-[#2b1f1a] truncate group-hover:text-[#e06b5b] transition-colors">
                                {p.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5 font-space">
                                <span className="text-[10px] text-[#4f775d] font-semibold bg-[#eaf3ed] px-1.5 py-0.2 rounded font-sans">
                                  {p.category}
                                </span>
                                <span className="text-xs font-bold text-[#2b1f1a] tabular-nums">
                                  ₹{p.price.toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(p, 1);
                                showToast(`Added ${p.shortTitle || p.title} to bag! 🍼`);
                              }}
                              className="px-2.5 py-1 bg-[#fdedeb] hover:bg-[#e06b5b] hover:text-white text-[#c95444] rounded-lg text-xs font-bold transition-all active:scale-95 shrink-0 cursor-pointer"
                            >
                              + Add
                            </button>
                          </div>
                        ))}
                        <Link
                          href={`/shop?q=${encodeURIComponent(searchQuery.trim())}`}
                          onClick={() => setIsSearchFocused(false)}
                          className="mt-2 pt-2 border-t border-[#eddcd1]/70 block text-center text-xs font-bold text-[#e06b5b] hover:text-[#c95444] py-1 cursor-pointer"
                        >
                          View all results for &quot;{searchQuery}&quot; →
                        </Link>
                      </div>
                    ) : (
                      <div className="py-4 text-center">
                        <p className="text-xs text-[#6b5850]">No matching products found.</p>
                        <Link
                          href="/shop"
                          onClick={() => setIsSearchFocused(false)}
                          className="text-xs font-bold text-[#e06b5b] underline mt-1.5 inline-block cursor-pointer"
                        >
                          Browse all mom favorites →
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-[11px] font-bold text-[#6b5850] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles size={13} weight="Filled" className="text-[#e06b5b]" />
                      Popular Searches
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {popularSearches.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => {
                            setSearchQuery(term);
                            router.push(`/shop?q=${encodeURIComponent(term)}`);
                            setIsSearchFocused(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#fbf7f0] hover:bg-[#fdedeb] hover:text-[#e06b5b] text-[#2b1f1a] text-xs font-medium border border-[#eddcd1] transition-colors cursor-pointer active:scale-95"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
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

        {/* Mobile Search Input with Instant Autocomplete */}
        <div ref={mobileSearchRef} className="relative mt-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <span className="absolute left-3.5 text-[#6b5850]/70 pointer-events-none">
              <Search size={16} weight="Outline" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsMobileSearchFocused(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsMobileSearchFocused(true);
              }}
              placeholder="Search baby nail trimmer, sensory toys..."
              className="w-full pl-10 pr-20 py-2 bg-[#fbf8f3] rounded-full text-xs text-[#2b1f1a] placeholder:text-[#6b5850]/60 border border-[#eddcd1] focus:border-[#e06b5b] focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-1 px-3 py-1 bg-[#e06b5b] text-white text-xs font-medium rounded-full cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Mobile Instant Search Results Dropdown */}
          {isMobileSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-[#eddcd1] p-3 z-50 animate-in fade-in duration-200">
              {searchQuery.trim().length >= 2 ? (
                <div>
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#eddcd1]/70 text-xs font-bold text-[#2b1f1a]">
                    <span className="flex items-center gap-1">
                      <Sparkles size={13} weight="Filled" className="text-[#e06b5b]" />
                      Matches ({matchingProducts.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsMobileSearchFocused(false)}
                      className="text-[#6b5850]/70 hover:text-[#2b1f1a] text-[11px] cursor-pointer"
                    >
                      Close
                    </button>
                  </div>

                  {matchingProducts.length > 0 ? (
                    <div className="space-y-1.5">
                      {matchingProducts.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[#fbf7f0] transition-colors group cursor-pointer"
                          onClick={() => {
                            setIsMobileSearchFocused(false);
                            router.push(`/products/${p.slug}`);
                          }}
                        >
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#fdfbf7] shrink-0 border border-[#eddcd1]">
                            <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-[#2b1f1a] truncate">
                              {p.title}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] text-[#4f775d] font-semibold bg-[#eaf3ed] px-1 py-0.2 rounded">
                                {p.category}
                              </span>
                              <span className="text-xs font-space font-bold text-[#2b1f1a] tabular-nums">
                                ₹{p.price.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(p, 1);
                              showToast(`Added ${p.shortTitle || p.title} to bag! 🍼`);
                            }}
                            className="px-2 py-1 bg-[#fdedeb] hover:bg-[#e06b5b] hover:text-white text-[#c95444] rounded-lg text-[11px] font-bold transition-all active:scale-95 shrink-0 cursor-pointer"
                          >
                            + Add
                          </button>
                        </div>
                      ))}
                      <Link
                        href={`/shop?q=${encodeURIComponent(searchQuery.trim())}`}
                        onClick={() => setIsMobileSearchFocused(false)}
                        className="mt-2 pt-1.5 border-t border-[#eddcd1]/70 block text-center text-xs font-bold text-[#e06b5b] py-1 cursor-pointer"
                      >
                        View all results →
                      </Link>
                    </div>
                  ) : (
                    <div className="py-3 text-center">
                      <p className="text-xs text-[#6b5850]">No matching products found.</p>
                      <Link
                        href="/shop"
                        onClick={() => setIsMobileSearchFocused(false)}
                        className="text-xs font-bold text-[#e06b5b] underline mt-1 inline-block cursor-pointer"
                      >
                        Browse all mom favorites →
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-[10px] font-bold text-[#6b5850] uppercase tracking-wider mb-2 flex items-center gap-1">
                    <Sparkles size={12} weight="Filled" className="text-[#e06b5b]" />
                    Popular Searches
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {popularSearches.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          setSearchQuery(term);
                          router.push(`/shop?q=${encodeURIComponent(term)}`);
                          setIsMobileSearchFocused(false);
                        }}
                        className="px-2 py-1 rounded-lg bg-[#fbf7f0] hover:bg-[#fdedeb] hover:text-[#e06b5b] text-[#2b1f1a] text-[11px] font-medium border border-[#eddcd1] transition-colors cursor-pointer active:scale-95"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
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

      {/* Mobile Dropdown Menu rendered via Portal (bypasses header backdrop-filter, zero layout shift) */}
      {mounted && mobileMenuOpen && createPortal(
        <div className="lg:hidden">
          {/* Fullscreen Backdrop: attached directly to <body>, covers 100% of viewport - clicking anywhere outside closes the menu */}
          <div
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
            onTouchEnd={(e) => {
              if (e.target === e.currentTarget) {
                setMobileMenuOpen(false);
              }
            }}
            aria-hidden="true"
          />

          {/* Floating Dropdown Panel on top of page */}
          <div
            style={{ top: `${headerBottom}px` }}
            onClick={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
            className="fixed left-0 right-0 z-[65] bg-white border-b border-[#eddcd1] shadow-[0_24px_48px_rgba(43,31,26,0.28)] rounded-b-3xl overflow-hidden max-h-[calc(100dvh-130px)] flex flex-col animate-in slide-in-from-top-2 fade-in duration-200"
          >
            <div className="overflow-y-auto px-4 py-3.5 space-y-3">
              {/* Shop Collections */}
              <nav className="flex flex-col space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b5850]/70 px-3 pb-0.5">
                  Shop Collections
                </span>
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                        isActive
                          ? "bg-[#fdedeb] text-[#e06b5b] font-bold shadow-2xs"
                          : "text-[#2b1f1a] hover:bg-[#fbf7f0] hover:text-[#e06b5b]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-[#e06b5b]" : "bg-[#eddcd1]"}`} />
                        <span>{link.label}</span>
                      </div>
                      <ArrowRight size={13} weight="Outline" className={isActive ? "text-[#e06b5b]" : "text-[#6b5850]/40"} />
                    </Link>
                  );
                })}
              </nav>

              {/* Customer Services & Help */}
              <div className="pt-2 border-t border-[#eddcd1]/80">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6b5850]/70 px-3 pb-0.5 block">
                  Customer Services &amp; Help
                </span>
                <div className="flex flex-col space-y-0.5 mt-0.5">
                  {mobileUtilityLinks.map((u) => (
                    <Link
                      key={u.href}
                      href={u.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-[#6b5850] hover:text-[#e06b5b] hover:bg-[#fbf7f0] transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>{u.label}</span>
                      <ArrowRight size={12} weight="Outline" className="text-[#6b5850]/40" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Bottom Account & Wishlist strip */}
              <div className="pt-2.5 border-t border-[#eddcd1] grid grid-cols-2 gap-2">
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 px-3 rounded-xl bg-[#fbf7f0] hover:bg-[#fdedeb] text-[#2b1f1a] hover:text-[#e06b5b] border border-[#eddcd1] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <User size={15} weight={user ? "Filled" : "Outline"} className={user ? "text-[#e06b5b]" : ""} />
                  <span className="truncate">{user ? `Hi, ${user.name.split(" ")[0]}` : "Account / Sign In"}</span>
                </Link>

                <Link
                  href="/shop?filter=wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 px-3 rounded-xl bg-[#fbf7f0] hover:bg-[#fdedeb] text-[#2b1f1a] hover:text-rose-500 border border-[#eddcd1] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Heart size={15} weight={wishlist.length > 0 ? "Filled" : "Outline"} className={wishlist.length > 0 ? "text-rose-500" : ""} />
                  <span>Wishlist ({wishlist.length})</span>
                </Link>
              </div>

              {/* Bottom Pull Handle Indicator */}
              <div className="pt-0.5 pb-0 flex justify-center">
                <span className="w-10 h-1 rounded-full bg-[#eddcd1]" />
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
