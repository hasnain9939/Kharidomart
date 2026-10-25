"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import ProductCard from "@/components/ProductCard";
import {
  Star,
  ShoppingBag,
  Heart,
  TruckFast,
  ShieldCheck,
  Check,
  CheckCircle,
  Share,
  Location,
  ArrowRight,
  Sparkles,
  TicketDiscount,
  Clock,
  VideoPlay,
} from "reicon-react";
import { getVideoEmbed } from "@/lib/media";
import { trackViewItem, trackAddToCart } from "@/lib/analytics";

// Real customer reviews are stored per-product and submitted by verified purchasers

interface ProductDetailsClientProps {
  product: Product;
  relatedProducts: Product[];
  initialReviews?: any[];
}

export default function ProductDetailsClient({
  product,
  relatedProducts,
  initialReviews = [],
}: ProductDetailsClientProps) {
  const { addToCart, toggleWishlist, isWishlisted, openCart, showToast } = useStore();

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const videoEmbed = product.videoUrl ? getVideoEmbed(product.videoUrl) : null;
  const [quantity, setQuantity] = useState(1);

  // Clean raw markdown if present in highlights
  const cleanHighlights = (product.highlights || [])
    .map((h) => h.replace(/^[#*\s-]+/, "").replace(/\*\*/g, "").trim())
    .filter(
      (h) =>
        h.length > 0 &&
        !h.toLowerCase().startsWith("key features") &&
        !h.toLowerCase().startsWith("what’s included") &&
        !h.toLowerCase().startsWith("safety:")
    );

  // Clean raw markdown syntax from product description
  const cleanDescription = (product.description || "")
    .replace(/^##+\s*/gm, "")
    .replace(/\*\*/g, "")
    .trim();

  // Concise lead hook for the hero buy-box section
  const heroHook = React.useMemo(() => {
    const lines = cleanDescription
      .split("\n")
      .map((l) => l.trim().replace(/\s+/g, " "))
      .filter((l) => l.length > 0 && !l.startsWith("#") && !l.toLowerCase().startsWith("key features"));
    if (lines.length === 0) return "";
    let res = lines[0];
    if (lines[0].length < 35 && lines.length > 1) {
      res = lines[1];
    } else if (res.length < 75 && lines.length > 1) {
      res = `${res} ${lines[1]}`;
    }
    return res;
  }, [cleanDescription]);

  // Dynamic colors: strictly from product.colors data
  const colorVariants = product.colors && product.colors.length > 0 ? product.colors : [];

  const [userSelectedColor, setUserSelectedColor] = useState<string | null>(null);
  const selectedColor =
    userSelectedColor && colorVariants.some((c) => c.name === userSelectedColor)
      ? userSelectedColor
      : (colorVariants[0]?.name || "");
  const setSelectedColor = (colorName: string) => setUserSelectedColor(colorName);

  const [pincode, setPincode] = useState("");
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [pincodeLocation, setPincodeLocation] = useState<{ district: string; state: string } | null>(null);
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(
    !initialReviews || initialReviews.length === 0
  );
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [liveRating, setLiveRating] = useState<number>(product.rating || 5);
  const [liveReviewsCount, setLiveReviewsCount] = useState<number>(
    product.reviewsCount || (initialReviews ? initialReviews.length : 0)
  );

  const [userReviews, setUserReviews] = useState<
    Array<{
      id?: string;
      name: string;
      customerName?: string;
      city: string;
      rating: number;
      title?: string;
      comment: string;
      date: string;
      verified?: boolean;
    }>
  >(
    (initialReviews || []).map((r: any) => ({
      id: r.id,
      name: r.customerName || r.name || "Verified Customer",
      customerName: r.customerName || r.name || "Verified Customer",
      city: r.city || "India",
      rating: r.rating || 5,
      title: r.title || "",
      comment: r.comment || "",
      date: r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Recent purchase",
      verified: r.verified ?? true,
    }))
  );
  const [reviewForm, setReviewForm] = useState({
    name: "",
    city: "",
    rating: 5,
    title: "",
    comment: "",
  });

  const bundleTiers = [
    {
      tier: 1,
      qty: 1,
      title: "1x Single Unit",
      subtitle: "Standard Pack",
      unitPrice: product.price,
      totalPrice: product.price,
      discountLabel: null,
      badge: null,
    },
    {
      tier: 2,
      qty: 2,
      title: "2x Value Pack (Save 15%)",
      subtitle: "Most Popular for Siblings / Gifts",
      unitPrice: Math.round(product.price * 0.85),
      totalPrice: Math.round(product.price * 2 * 0.85),
      discountLabel: "Extra 15% OFF",
      badge: "🔥 MOST POPULAR",
    },
    {
      tier: 3,
      qty: 3,
      title: "3x Super Saver Pack (Save 25%)",
      subtitle: "Best Deal + Free Express Sourcing",
      unitPrice: Math.round(product.price * 0.75),
      totalPrice: Math.round(product.price * 3 * 0.75),
      discountLabel: "Extra 25% OFF",
      badge: "🎁 BEST VALUE",
    },
  ];

  const activeTier = bundleTiers.find((b) => b.qty === quantity);
  const currentTotalPrice = activeTier ? activeTier.totalPrice : product.price * quantity;

  // Countdown to custom or default 5:00 PM same-day dispatch
  const cutoffTimeDisplay = product.dispatchCutoff || "5:00 PM";
  const dispatchLeadTime = product.dispatchTime || "24–48 hrs";

  const [dispatchCountdown, setDispatchCountdown] = useState<{ hours: string; minutes: string; seconds: string }>({
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  React.useEffect(() => {
    const parseCutoff = (cutoffStr: string) => {
      const match = cutoffStr.match(/(\d+)(?::(\d+))?\s*(AM|PM)?/i);
      if (!match) return { hour: 17, minute: 0 };
      let hour = parseInt(match[1], 10);
      const minute = match[2] ? parseInt(match[2], 10) : 0;
      const period = match[3]?.toUpperCase();
      if (period === "PM" && hour < 12) hour += 12;
      if (period === "AM" && hour === 12) hour = 0;
      return { hour, minute };
    };

    const calculateTimeLeft = () => {
      const now = new Date();
      const cutoff = new Date();
      const { hour, minute } = parseCutoff(cutoffTimeDisplay);
      cutoff.setHours(hour, minute, 0, 0);

      let diff = cutoff.getTime() - now.getTime();
      if (diff <= 0) {
        cutoff.setDate(cutoff.getDate() + 1);
        diff = cutoff.getTime() - now.getTime();
      }

      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setDispatchCountdown({
        hours: String(h).padStart(2, "0"),
        minutes: String(m).padStart(2, "0"),
        seconds: String(s).padStart(2, "0"),
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [cutoffTimeDisplay]);

  // Pincode saved in localStorage with live district lookup
  React.useEffect(() => {
    let isMounted = true;
    try {
      const savedPin = localStorage.getItem("km_user_pincode");
      if (savedPin && savedPin.length === 6) {
        setPincode(savedPin);
        setPincodeChecked(true);
        fetch(`/api/pincode/${savedPin}`)
          .then((res) => res.json())
          .then((data) => {
            if (isMounted && data.success && data.city && data.state) {
              setPincodeLocation({ district: data.city, state: data.state });
            }
          })
          .catch(() => {});
      }
    } catch {
      // ignore
    }
    return () => {
      isMounted = false;
    };
  }, []);

  // Show mobile sticky Add to Bag bar after scrolling past the hero fold
  React.useEffect(() => {
    const handleScroll = () => {
      setShowStickyBar(window.scrollY > 380);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Quick metro pincode checker
  const handleQuickPincode = async (code: string) => {
    setPincode(code);
    setIsPincodeLoading(true);
    try {
      const res = await fetch(`/api/pincode/${code}`);
      const data = await res.json();
      if (data.success && data.city && data.state) {
        setPincodeLocation({ district: data.city, state: data.state });
        setPincodeChecked(true);
        try {
          localStorage.setItem("km_user_pincode", code);
        } catch {}
      } else {
        setPincodeChecked(true);
      }
    } catch {
      setPincodeChecked(true);
    } finally {
      setIsPincodeLoading(false);
    }
  };

  // Helper for delivery dates estimation
  const getDeliveryEstimate = (pin: string) => {
    const firstDigit = pin[0];
    let daysMin = 2;
    let daysMax = 3;
    let region = "Metro Hub";

    if (["1", "2"].includes(firstDigit)) {
      region = "Delhi NCR & Northern Region";
      daysMin = 2;
      daysMax = 3;
    } else if (["4"].includes(firstDigit)) {
      region = "Mumbai, Pune & Western Region";
      daysMin = 2;
      daysMax = 3;
    } else if (["5", "6"].includes(firstDigit)) {
      region = "Bengaluru, Hyderabad & South Region";
      daysMin = 3;
      daysMax = 4;
    } else if (["7", "8"].includes(firstDigit)) {
      region = "Kolkata, Bihar & Eastern Region";
      daysMin = 3;
      daysMax = 5;
    } else {
      region = "Central & Western India";
      daysMin = 3;
      daysMax = 4;
    }

    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + daysMin);
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + daysMax);

    const options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
    return {
      region,
      startDate: minDate.toLocaleDateString("en-IN", options),
      endDate: maxDate.toLocaleDateString("en-IN", options),
    };
  };

  // Fetch real reviews from Neon PostgreSQL on mount only if not already provided
  React.useEffect(() => {
    if (initialReviews && initialReviews.length > 0) return;
    let isMounted = true;
    const loadProductReviews = async () => {
      setIsLoadingReviews(true);
      try {
        const query = product.id ? `productId=${encodeURIComponent(product.id)}` : `slug=${encodeURIComponent(product.slug)}`;
        const res = await fetch(`/api/reviews?${query}`);
        const data = await res.json();
        if (isMounted && data.success && Array.isArray(data.reviews)) {
          setUserReviews(data.reviews);
          if (typeof data.averageRating === "number") setLiveRating(data.averageRating);
          if (typeof data.count === "number") setLiveReviewsCount(data.count);
        }
      } catch (err) {
        console.warn("Failed to load reviews from API:", err);
      } finally {
        if (isMounted) setIsLoadingReviews(false);
      }
    };

    loadProductReviews();
    return () => {
      isMounted = false;
    };
  }, [product.id, product.slug, initialReviews]);

  // Submit verified customer review to PostgreSQL
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) {
      showToast("Please provide your name and review details", "warning");
      return;
    }
    if (reviewForm.comment.trim().length < 5) {
      showToast("Review must be at least 5 characters long", "warning");
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          slug: product.slug,
          customerName: reviewForm.name.trim(),
          rating: reviewForm.rating,
          title: reviewForm.title.trim(),
          comment: reviewForm.comment.trim(),
          city: reviewForm.city.trim() || "India",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.error || "Failed to submit review", "warning");
        setIsSubmittingReview(false);
        return;
      }

      if (data.review) {
        setUserReviews((prev) => [data.review, ...prev.filter((r) => r.id !== data.review.id)]);
      }
      if (data.product) {
        if (typeof data.product.rating === "number") setLiveRating(data.product.rating);
        if (typeof data.product.reviewsCount === "number") setLiveReviewsCount(data.product.reviewsCount);
      }

      setIsReviewModalOpen(false);
      setReviewForm({ name: "", city: "", rating: 5, title: "", comment: "" });
      showToast("Thank you! Your verified review has been published. 🎉");
    } catch (err: any) {
      console.error("Submit review error:", err);
      showToast("Network error. Please try again.", "warning");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  React.useEffect(() => {
    if (product) {
      trackViewItem(product);
    }
  }, [product]);

  const wishlisted = isWishlisted(product.id);
  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const handleAddToCart = () => {
    const discountedProduct = activeTier && activeTier.unitPrice !== product.price
      ? { ...product, price: activeTier.unitPrice }
      : product;
    addToCart(discountedProduct, quantity);
    trackAddToCart(discountedProduct, quantity);
    openCart();
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      showToast("Product link copied to clipboard! 🔗");
    }
  };

  const handleCheckPincode = async () => {
    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      setIsPincodeLoading(true);
      try {
        const res = await fetch(`/api/pincode/${pincode}`);
        const data = await res.json();
        if (data.success && data.city && data.state) {
          setPincodeLocation({ district: data.city, state: data.state });
          setPincodeChecked(true);
          try {
            localStorage.setItem("km_user_pincode", pincode);
          } catch {}
          showToast(`Express Delivery available to ${data.city}, ${data.state} (${pincode})! 🚀`);
        } else {
          setPincodeChecked(true);
          showToast(`Express Delivery available to Pincode ${pincode}! 🚀`);
        }
      } catch {
        setPincodeChecked(true);
        showToast(`Express Delivery available to Pincode ${pincode}! 🚀`);
      } finally {
        setIsPincodeLoading(false);
      }
    } else {
      showToast("Please enter a valid 6-digit Indian PIN code", "warning");
    }
  };


  return (
    <div className="w-full bg-[#fdfbf7] min-h-screen pb-24 sm:pb-0">
      {/* Top Breadcrumb & Flash Social Proof Banner */}
      <section className="w-full bg-[#fbf7f0] border-b border-[#eddcd1]/80 py-2.5">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-[#6b5850]">
          <nav className="flex items-center flex-wrap gap-2 text-[#6b5850]/80">
            <Link href="/" className="hover:text-[#e06b5b] transition-colors">
              Home
            </Link>
            <span className="opacity-40">/</span>
            <Link href="/shop" className="hover:text-[#e06b5b] transition-colors">
              {product.category}
            </Link>
            <span className="opacity-40">/</span>
            <span className="font-semibold text-[#2b1f1a] truncate max-w-xs md:max-w-md">
              {product.shortTitle}
            </span>
          </nav>
          <div className="inline-flex items-center gap-2 text-[#4f775d] font-semibold bg-white px-3 py-1 rounded-full shadow-2xs text-xs border border-[#d2e7d7]">
            <ShieldCheck size={14} weight="Filled" />
            <span>Quality Inspected • 100% Genuine &amp; Certified</span>
          </div>
        </div>
      </section>

      {/* Main Product Showcase Section */}
      <section className="w-full py-8 sm:py-12 bg-[#fdfbf7]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Gallery & Trust Proof (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Main Display Image */}
              <div className="relative bg-white rounded-3xl p-3 sm:p-6 shadow-xs border border-[#eddcd1] overflow-hidden flex flex-col items-center justify-center min-h-[300px] sm:min-h-[420px] md:min-h-[520px]">
                {/* Floating Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  {product.badge && (
                    <span className="px-3 py-1 bg-[#e06b5b] text-white font-space font-bold text-[11px] rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                      {product.badge}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="px-3 py-1 bg-[#4f775d] text-white font-space font-bold text-[11px] rounded-full uppercase tracking-wider shadow-sm">
                      Save {discountPercent}%
                    </span>
                  )}
                </div>

                {/* Quick Action Wishlist & Share */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    aria-label="Add to wishlist"
                    className={`w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center transition-all ${
                      wishlisted ? "text-rose-600 scale-105" : "text-[#584237] hover:text-rose-500"
                    }`}
                  >
                    <Heart size={20} weight={wishlisted ? "Filled" : "Outline"} />
                  </button>
                  <button
                    onClick={handleShare}
                    aria-label="Share product"
                    className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#584237] hover:text-[#f97316] shadow-md flex items-center justify-center transition-all"
                  >
                    <Share size={18} weight="Outline" />
                  </button>
                </div>

                {/* Floating Watch Video Button (when photo is shown) */}
                {videoEmbed && !showVideo && (
                  <button
                    type="button"
                    onClick={() => setShowVideo(true)}
                    className="absolute top-4 left-4 z-10 bg-black/85 hover:bg-black text-white px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-xs transition-all hover:scale-105 cursor-pointer"
                  >
                    <VideoPlay size={14} weight="Filled" className="text-[#f97316]" />
                    <span>Watch Video Demo</span>
                  </button>
                )}

                {/* Main Product Image or Video */}
                {showVideo && videoEmbed ? (
                  <div className="relative w-full h-[280px] sm:h-[380px] md:h-[460px] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setShowVideo(false)}
                      className="absolute top-3 right-3 z-20 bg-white/90 hover:bg-white text-[#0b1c30] px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>✕ Back to Photos</span>
                    </button>
                    {videoEmbed.type === "youtube" || videoEmbed.type === "vimeo" ? (
                      <iframe
                        src={`${videoEmbed.embedUrl}?autoplay=1`}
                        title={`${product.title} video`}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={videoEmbed.embedUrl}
                        controls
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                ) : (
                  <div className="relative w-full h-[280px] sm:h-[380px] md:h-[460px] flex items-center justify-center">
                    <Image
                      src={product.images[selectedImageIdx] || product.images[0]}
                      alt={product.title}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                      className="object-contain rounded-2xl transition-all duration-300 hover:scale-[1.03]"
                    />
                  </div>
                )}

                {/* Zoom Cue */}
                {!showVideo && (
                  <div className="absolute bottom-4 right-4 bg-white/85 backdrop-blur-xs px-3 py-1.5 rounded-full text-[#584237] text-xs font-semibold flex items-center gap-1.5 shadow-2xs border border-[#e2e8f0]/60">
                    <span>🔍 Hover to inspect high-resolution detail</span>
                  </div>
                )}
              </div>

              {/* Thumbnails Strip (Photos + Video) */}
              {(product.images.length > 1 || Boolean(videoEmbed)) && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {product.images.slice(0, 6).map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setShowVideo(false);
                        setSelectedImageIdx(idx);
                      }}
                      className={`relative aspect-square rounded-2xl overflow-hidden p-1 bg-white border-2 transition-all cursor-pointer ${
                        !showVideo && selectedImageIdx === idx
                          ? "border-[#f97316] ring-3 ring-orange-200 scale-95 shadow-sm"
                          : "border-[#e2e8f0] hover:border-orange-300 opacity-80 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.shortTitle} thumbnail ${idx + 1}`}
                        fill
                        sizes="96px"
                        className="object-cover rounded-xl"
                      />
                    </button>
                  ))}

                  {videoEmbed && (
                    <button
                      type="button"
                      onClick={() => setShowVideo(true)}
                      className={`relative aspect-square rounded-2xl overflow-hidden p-1 bg-[#0b1c30] text-white border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        showVideo
                          ? "border-[#f97316] ring-3 ring-orange-200 scale-95 shadow-sm"
                          : "border-[#e2e8f0] hover:border-orange-300 opacity-90 hover:opacity-100"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#f97316] text-white flex items-center justify-center shadow-md">
                        <VideoPlay size={16} weight="Filled" />
                      </div>
                      <span className="text-[10px] font-bold text-white tracking-tight">
                        Video Demo
                      </span>
                    </button>
                  )}
                </div>
              )}

              {/* Trust & Quality Assurance Banner */}
              <div className="bg-[#f8fafc] rounded-3xl p-5 border border-[#e2e8f0] grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#15803d] flex items-center justify-center shrink-0">
                    <ShieldCheck size={22} weight="Filled" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0b1c30]">100% Quality Inspected</p>
                    <p className="text-[11px] text-[#584237]">Pre-checked before dispatch</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#ffedd5] text-[#ea580c] flex items-center justify-center shrink-0">
                    <TruckFast size={22} weight="Filled" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0b1c30]">Priority Express Shipping</p>
                    <p className="text-[11px] text-[#584237]">Ships in {dispatchLeadTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#eff4ff] text-[#0b1c30] flex items-center justify-center shrink-0">
                    <CheckCircle size={22} weight="Filled" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0b1c30]">Verified Authentic</p>
                    <p className="text-[11px] text-[#584237]">24-Hour doorstep replacement</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Buy Engine (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Category & Stock Tag */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs uppercase tracking-wider text-[#ea580c] bg-[#ffedd5] px-3 py-1 rounded-full font-bold">
                  {product.category} • Kharido Mart Verified
                </span>
                <span className="text-xs text-[#15803d] font-bold uppercase tracking-wide flex items-center gap-1">
                  <CheckCircle size={15} weight="Filled" /> In Stock (Dispatches in 24 hrs)
                </span>
              </div>

              {/* Product Title & Hook */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0b1c30] leading-tight">
                  {product.title}
                </h1>
                <p className="text-sm text-[#584237] mt-2.5 leading-relaxed">
                  {heroHook}
                </p>
              </div>

              {/* Star Rating & Social Proof */}
              <div className="flex items-center flex-wrap gap-2.5 bg-white p-3 rounded-2xl border border-[#e2e8f0] shadow-2xs">
                <div className="flex items-center text-[#f59e0b]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} weight="Filled" />
                  ))}
                </div>
                <span className="font-space font-bold text-sm text-[#0b1c30]">
                  {liveRating.toFixed(1)}
                </span>
                <span className="text-xs text-[#584237]">
                  ({liveReviewsCount} verified {liveReviewsCount === 1 ? "review" : "reviews"})
                </span>
                <span className="text-[#584237]/30">|</span>
                <span className="text-xs font-semibold text-[#15803d] flex items-center gap-1">
                  <Check size={14} weight="Filled" /> 98% Customer Satisfaction
                </span>
              </div>

              {/* Price Display Section */}
              <div className="bg-white p-5 rounded-3xl border border-[#e2e8f0] shadow-xs space-y-3">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="font-space font-extrabold text-3xl sm:text-4xl text-[#0b1c30]">
                    ₹{product.price.toLocaleString("en-IN")}.00
                  </span>
                  <span className="font-space text-sm sm:text-base text-[#584237]/60 line-through">
                    ₹{product.originalPrice.toLocaleString("en-IN")}.00
                  </span>
                  <span className="px-2.5 py-1 bg-[#ef4444]/10 text-[#ef4444] font-space font-bold text-xs rounded-lg uppercase">
                    Save ₹{(product.originalPrice - product.price).toLocaleString("en-IN")} ({discountPercent}% OFF)
                  </span>
                </div>
                <p className="text-xs text-[#584237]">
                  Inclusive of all taxes. Free express shipping on all orders today.
                </p>

                {/* Quality & Safe Packaging Assurance */}
                <div className="bg-[#f0fdf4] border border-emerald-200/90 rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#15803d] flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} weight="Filled" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-[#0b1c30]">
                      Quality-Checked &amp; Sanitized Packaging
                    </p>
                    <p className="text-[11px] text-[#584237] mt-0.5">
                      Inspected, sterilized, and bubble-wrapped for 100% damage-free doorstep transit.
                    </p>
                  </div>
                </div>

                {/* UPI / Prepaid Extra ₹50 Discount Incentive */}
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <TicketDiscount size={18} weight="Filled" className="text-[#15803d] shrink-0" />
                    <span className="text-[#0b1c30] font-semibold">
                      Pay via <strong>UPI / GPay / Cards</strong> &amp; get <strong>Instant ₹50 OFF</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#15803d] bg-emerald-100/70 px-2 py-0.5 rounded-md shrink-0">
                    Auto Applied
                  </span>
                </div>

                {/* Live Same-Day Dispatch Countdown Timer */}
                <div className="bg-[#fdedeb] border border-[#f5c7c1] rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#e06b5b] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Clock size={16} weight="Filled" />
                    </div>
                    <div>
                      <p className="font-bold text-[#2b1f1a] flex items-center gap-1.5">
                        <span>Same-Day Dispatch Cutoff:</span>
                        <span className="text-[#e06b5b] font-space font-extrabold">{cutoffTimeDisplay}</span>
                      </p>
                      <p className="text-[11px] text-[#6b5850]">
                        Order in the next window for priority warehouse handoff
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-1 self-stretch sm:self-auto bg-white px-2.5 py-1.5 rounded-xl border border-[#eddcd1] shadow-2xs font-space font-bold text-xs text-[#e06b5b] tabular-nums">
                    <span className="bg-[#fdfbf7] px-1.5 py-0.5 rounded border border-[#eddcd1]/70">{dispatchCountdown.hours}h</span>
                    <span>:</span>
                    <span className="bg-[#fdfbf7] px-1.5 py-0.5 rounded border border-[#eddcd1]/70">{dispatchCountdown.minutes}m</span>
                    <span>:</span>
                    <span className="bg-[#fdfbf7] px-1.5 py-0.5 rounded border border-[#eddcd1]/70">{dispatchCountdown.seconds}s</span>
                  </div>
                </div>
              </div>

              {/* Color Finish Selector */}
              {colorVariants.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0b1c30]">Select Color Finish:</span>
                    <span className="text-xs font-bold text-[#ea580c]">{selectedColor}</span>
                  </div>
                  <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
                    {colorVariants.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setSelectedColor(color.name)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                          selectedColor === color.name
                            ? "border-[#f97316] bg-orange-50/40 shadow-xs"
                            : "border-[#e2e8f0] bg-white hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shadow-inner shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-[#0b1c30]">{color.label || color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Bundle Deals (WideBundle dropshipping pattern) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0b1c30] flex items-center gap-1.5">
                    <Sparkles size={15} weight="Filled" className="text-[#f97316]" />
                    <span>Select Bundle &amp; Save (Direct Factory Deals):</span>
                  </span>
                  <span className="text-[11px] font-bold text-[#ea580c] bg-orange-100/70 px-2 py-0.5 rounded-full">
                    Save up to 25% OFF
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {bundleTiers.map((tier) => {
                    const isSelected = quantity === tier.qty;
                    return (
                      <div
                        key={tier.tier}
                        onClick={() => {
                          setQuantity(tier.qty);
                        }}
                        className={`relative p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? "border-[#f97316] bg-orange-50/40 shadow-xs"
                            : "border-[#e2e8f0] bg-white hover:border-orange-200 hover:bg-[#fafafa]"
                        }`}
                      >
                        {tier.badge && (
                          <div className="absolute -top-2.5 right-4 bg-[#f97316] text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                            {tier.badge}
                          </div>
                        )}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isSelected ? "border-[#f97316] bg-[#f97316]" : "border-[#cbd5e1] bg-white"
                            }`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center flex-wrap gap-1.5">
                              <span className="font-bold text-xs text-[#0b1c30]">{tier.title}</span>
                              {tier.discountLabel && (
                                <span className="text-[10px] font-bold text-[#15803d] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                                  {tier.discountLabel}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#584237]/80 block truncate">{tier.subtitle}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 pl-2">
                          <span className="font-space font-extrabold text-sm text-[#0b1c30] block">
                            ₹{tier.totalPrice.toLocaleString("en-IN")}
                          </span>
                          {tier.qty > 1 && (
                            <span className="text-[10px] text-[#584237]/70 line-through block">
                              ₹{(product.price * tier.qty).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Highlights Feature Bullets */}
              {cleanHighlights.length > 0 && (
                <div className="bg-[#f8fafc] p-4 rounded-2xl border border-[#e2e8f0] space-y-2">
                  {cleanHighlights.slice(0, 5).map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#0b1c30]">
                      <CheckCircle size={16} weight="Filled" className="text-[#15803d] shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity Stepper & Dual Action Buttons */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-white rounded-2xl p-1 shadow-xs border border-[#e2e8f0] shrink-0">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-[#0b1c30] hover:bg-slate-100 transition-colors font-bold text-sm cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-9 text-center font-space font-bold text-sm text-[#0b1c30]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-[#0b1c30] hover:bg-slate-100 transition-colors font-bold text-sm cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex-1 min-w-0 text-[11px] sm:text-xs text-[#584237] leading-tight">
                    <span className="flex items-start sm:items-center gap-1.5 font-medium">
                      <TruckFast size={16} weight="Filled" className="text-[#f97316] shrink-0 mt-0.5 sm:mt-0" />
                      <span>Dispatches in <strong>{dispatchLeadTime}</strong> with WhatsApp live tracking</span>
                    </span>
                  </div>
                </div>

                {/* Primary Full-Width Action Button */}
                <div>
                  <button
                    onClick={handleAddToCart}
                    className="w-full h-13 bg-[#e06b5b] hover:bg-[#c95444] active:scale-[0.98] text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-[#e06b5b]/25 transition-all cursor-pointer"
                  >
                    <ShoppingBag size={20} weight="Filled" />
                    <span>Add to Bag — ₹{currentTotalPrice.toLocaleString("en-IN")}</span>
                  </button>
                </div>
              </div>

              {/* Live Pincode Check & Delivery Estimator Widget */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#eddcd1] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#2b1f1a]">
                    Estimate Delivery Date &amp; COD:
                  </label>
                  <span className="text-[11px] text-[#4f775d] font-semibold flex items-center gap-1">
                    <TruckFast size={14} weight="Filled" /> All India Express
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Location size={16} weight="Outline" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b5850]/70" />
                    <input
                      type="text"
                      maxLength={6}
                      value={pincode}
                      onChange={async (e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setPincode(val);
                        if (val.length === 6) {
                          setIsPincodeLoading(true);
                          try {
                            const res = await fetch(`/api/pincode/${val}`);
                            const data = await res.json();
                            if (data.success && data.city && data.state) {
                              setPincodeLocation({ district: data.city, state: data.state });
                              setPincodeChecked(true);
                              try {
                                localStorage.setItem("km_user_pincode", val);
                              } catch {}
                            } else {
                              setPincodeChecked(true);
                            }
                          } catch {
                            setPincodeChecked(true);
                          } finally {
                            setIsPincodeLoading(false);
                          }
                        }
                      }}
                      placeholder="Enter 6-digit Pincode"
                      className="w-full pl-9 pr-8 py-2.5 bg-[#fdfbf7] rounded-xl text-xs font-space font-semibold text-[#2b1f1a] border border-[#eddcd1] focus:outline-none focus:ring-2 focus:ring-[#e06b5b]"
                    />
                    {isPincodeLoading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-[#e06b5b]/30 border-t-[#e06b5b] rounded-full animate-spin" />
                    )}
                  </div>
                  <button
                    onClick={handleCheckPincode}
                    disabled={isPincodeLoading}
                    className="px-4 py-2.5 bg-[#2b1f1a] hover:bg-[#3d2c25] active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-60 flex items-center gap-1.5"
                  >
                    {isPincodeLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : null}
                    <span>Check</span>
                  </button>
                </div>

                {/* Instant Metro Quick Chips when pincode is not yet checked */}
                {!pincodeChecked && (
                  <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-[#6b5850]">
                    <span className="font-semibold text-[#2b1f1a]">Quick check:</span>
                    {[
                      { city: "Delhi", pin: "110001" },
                      { city: "Mumbai", pin: "400001" },
                      { city: "Bengaluru", pin: "560001" },
                      { city: "Kolkata", pin: "700001" },
                    ].map((m) => (
                      <button
                        key={m.pin}
                        type="button"
                        onClick={() => handleQuickPincode(m.pin)}
                        className="px-2 py-0.5 rounded-lg bg-[#fbf7f0] hover:bg-[#fdedeb] text-[#2b1f1a] hover:text-[#e06b5b] border border-[#eddcd1] font-medium transition-colors cursor-pointer"
                      >
                        {m.city} ({m.pin})
                      </button>
                    ))}
                  </div>
                )}

                {pincodeChecked && pincode.length === 6 && (
                  <div className="bg-[#fdfbf7] p-3 rounded-2xl border border-[#eddcd1] space-y-2 text-xs animate-in fade-in duration-200">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle size={16} weight="Filled" className="text-[#4f775d] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-[#2b1f1a]">
                          Expected Delivery:{" "}
                          <span className="text-[#e06b5b] font-space font-extrabold underline underline-offset-2">
                            {getDeliveryEstimate(pincode).startDate} – {getDeliveryEstimate(pincode).endDate}
                          </span>
                        </p>
                        <p className="text-[11px] text-[#6b5850] mt-0.5">
                          Shipping to{" "}
                          <strong>
                            {pincodeLocation
                              ? `${pincodeLocation.district}, ${pincodeLocation.state}`
                              : getDeliveryEstimate(pincode).region}{" "}
                            ({pincode})
                          </strong>{" "}
                          via Priority Express Delivery
                        </p>
                      </div>
                    </div>

                    {/* Dispatch Urgency Alert */}
                    <div className="flex items-center gap-1.5 text-[11px] text-[#4f775d] font-bold bg-[#eaf3ed] p-2 rounded-xl">
                      <Sparkles size={14} weight="Filled" className="shrink-0 text-[#4f775d]" />
                      <span>Order in next {dispatchCountdown.hours}h {dispatchCountdown.minutes}m for priority same-day warehouse handoff!</span>
                    </div>

                    <div className="pt-2 border-t border-[#eddcd1]/70 flex flex-wrap gap-2 text-[11px]">
                      <span className="bg-white text-[#2c4a35] border border-[#eddcd1] font-semibold px-2 py-0.5 rounded-md">
                        ✓ Cash on Delivery (COD) Available
                      </span>
                      <span className="bg-white text-[#2c4a35] border border-[#eddcd1] font-semibold px-2 py-0.5 rounded-md">
                        ✓ Free Express Delivery
                      </span>
                      <span className="bg-white text-[#2c4a35] border border-[#eddcd1] font-semibold px-2 py-0.5 rounded-md">
                        ✓ 24-Hr Doorstep Replacement
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Reassurance Badges */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-[#fdfbf7] p-3 rounded-2xl flex items-center gap-2 border border-[#eddcd1]">
                  <TruckFast size={20} weight="Filled" className="text-[#e06b5b]" />
                  <span className="text-xs font-semibold text-[#2b1f1a]">24-Hr Replacement (Video Req.)</span>
                </div>
                <div className="bg-[#fdfbf7] p-3 rounded-2xl flex items-center gap-2 border border-[#eddcd1]">
                  <ShieldCheck size={20} weight="Filled" className="text-[#4f775d]" />
                  <span className="text-xs font-semibold text-[#2b1f1a]">100% Quality Inspected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details, Specs & Verified Reviews Section */}
      <section className="w-full py-12 sm:py-16 bg-white border-t border-[#e2e8f0]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-center justify-center gap-6 border-b border-[#e2e8f0] pb-4">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-2 text-sm font-bold transition-all relative ${
                activeTab === "description"
                  ? "text-[#f97316]"
                  : "text-[#584237] hover:text-[#0b1c30]"
              }`}
            >
              <span>Description</span>
              {activeTab === "description" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f97316]"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-2 text-sm font-bold transition-all relative ${
                activeTab === "specs"
                  ? "text-[#f97316]"
                  : "text-[#584237] hover:text-[#0b1c30]"
              }`}
            >
              <span>Specifications</span>
              {activeTab === "specs" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f97316]"></span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-2 text-sm font-bold transition-all relative ${
                activeTab === "reviews"
                  ? "text-[#f97316]"
                  : "text-[#584237] hover:text-[#0b1c30]"
              }`}
            >
              <span>Customer Reviews ({liveReviewsCount})</span>
              {activeTab === "reviews" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#f97316]"></span>
              )}
            </button>
          </div>

          {activeTab === "description" && (
            <div className="max-w-4xl mx-auto space-y-6 pt-2">
              <div className="bg-[#f8fafc] rounded-3xl p-6 sm:p-8 border border-[#e2e8f0]">
                <h3 className="font-extrabold text-base text-[#0b1c30] mb-3">
                  About {product.shortTitle || product.title}
                </h3>
                <div className="text-xs sm:text-sm text-[#584237] leading-relaxed whitespace-pre-line">
                  {cleanDescription}
                </div>
              </div>

              {cleanHighlights.length > 0 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e2e8f0] shadow-xs space-y-4">
                  <h3 className="font-extrabold text-base text-[#0b1c30]">
                    Key Highlights &amp; Features
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cleanHighlights.map((hl, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0]"
                      >
                        <CheckCircle size={18} weight="Filled" className="text-[#15803d] shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold text-[#0b1c30] leading-snug">{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "specs" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-[#f8fafc] rounded-3xl p-6 sm:p-8 border border-[#e2e8f0] shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-[#e2e8f0]">
                  <h3 className="font-bold text-base text-[#0b1c30]">
                    Technical Specifications
                  </h3>
                  <span className="text-xs font-semibold text-[#15803d] flex items-center gap-1">
                    <CheckCircle size={14} weight="Filled" /> QC Certified
                  </span>
                </div>
                <dl className="divide-y divide-[#e2e8f0]">
                  {product.specs.map((spec, i) => (
                    <div key={i} className="py-3 flex justify-between text-xs sm:text-sm">
                      <dt className="text-[#584237] font-medium">{spec.label}</dt>
                      <dd className="font-bold text-[#0b1c30] text-right">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6 pt-2">
              {/* Header with Write a Review Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#e2e8f0] shadow-xs">
                <div>
                  <h3 className="font-extrabold text-lg text-[#0b1c30]">
                    Verified Customer Reviews
                  </h3>
                  <p className="text-xs text-[#584237] mt-0.5">
                    Reviews from customers who purchased this item on Kharido Mart
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-5 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
                >
                  <Star size={14} weight="Filled" />
                  <span>Write a Review</span>
                </button>
              </div>

              {/* User Submitted Reviews */}
              {userReviews.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#ea580c]">
                    Recent Community Feedback
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {userReviews.map((rev, idx) => (
                      <div
                        key={idx}
                        className="p-5 bg-white rounded-3xl border border-orange-200 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[#f59e0b]">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} size={15} weight="Filled" />
                            ))}
                          </div>
                          <span className="text-[11px] text-[#584237] font-medium">{rev.date}</span>
                        </div>
                        {rev.title && (
                          <h4 className="font-bold text-sm text-[#0b1c30]">&quot;{rev.title}&quot;</h4>
                        )}
                        <p className="text-xs text-[#584237] leading-relaxed">{rev.comment}</p>
                        <p className="text-[11px] font-bold text-[#0b1c30] pt-1 flex items-center gap-1">
                          <CheckCircle size={13} weight="Filled" className="text-[#15803d]" />
                          <span>{rev.name} — Verified Buyer, {rev.city || "India"}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Loading State */}
              {isLoadingReviews && userReviews.length === 0 && (
                <div className="p-8 text-center bg-[#f8fafc] rounded-3xl border border-[#e2e8f0] max-w-lg mx-auto flex flex-col items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-[#584237]">Loading verified customer reviews...</p>
                </div>
              )}

              {/* Empty state when no reviews submitted yet */}
              {!isLoadingReviews && userReviews.length === 0 && (
                <div className="p-8 sm:p-12 text-center bg-[#f8fafc] rounded-3xl border border-[#e2e8f0] max-w-lg mx-auto space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-[#f97316] flex items-center justify-center mx-auto">
                    <Star size={24} weight="Filled" />
                  </div>
                  <h4 className="font-bold text-base text-[#0b1c30]">No reviews yet for this product</h4>
                  <p className="text-xs text-[#584237]">
                    Be the first verified customer to share your experience with this product!
                  </p>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setIsReviewModalOpen(true)}
                      className="px-5 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-bold text-xs rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Star size={14} weight="Filled" />
                      <span>Write First Review</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interactive Write Review Modal */}
          {isReviewModalOpen && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#e2e8f0] space-y-5 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
                  <div>
                    <h3 className="text-lg font-bold text-[#0b1c30]">
                      Write a Verified Customer Review
                    </h3>
                    <p className="text-xs text-[#584237]">
                      Share your experience with {product.shortTitle}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsReviewModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-[#0b1c30] flex items-center justify-center font-bold text-sm"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-[#0b1c30] mb-1">
                      Rating (1 to 5 Stars) *
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className={`p-1 transition-transform ${
                            star <= reviewForm.rating
                              ? "text-[#f59e0b] scale-110"
                              : "text-slate-300"
                          }`}
                        >
                          <Star size={24} weight="Filled" />
                        </button>
                      ))}
                      <span className="font-space font-bold text-sm text-[#0b1c30] ml-2">
                        {reviewForm.rating} / 5 Stars
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#0b1c30] mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={reviewForm.name}
                        onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                        placeholder="Your full name"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] text-xs font-semibold focus:outline-none focus:border-[#f97316]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#0b1c30] mb-1">
                        City / State
                      </label>
                      <input
                        type="text"
                        value={reviewForm.city}
                        onChange={(e) => setReviewForm({ ...reviewForm, city: e.target.value })}
                        placeholder="e.g. Pune, MH"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] text-xs font-semibold focus:outline-none focus:border-[#f97316]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#0b1c30] mb-1">
                      Headline / Title
                    </label>
                    <input
                      type="text"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                      placeholder="e.g. Excellent build quality, works exactly as described!"
                      className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] text-xs font-semibold focus:outline-none focus:border-[#f97316]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#0b1c30] mb-1">
                      Your Detailed Review *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      placeholder="What did you like or dislike? How does it perform in daily use?"
                      className="w-full px-3 py-2.5 rounded-xl border border-[#e2e8f0] text-xs font-semibold focus:outline-none focus:border-[#f97316]"
                    ></textarea>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsReviewModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-[#e2e8f0] font-bold text-xs text-[#584237]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="px-6 py-2.5 bg-[#f97316] hover:bg-[#ea580c] active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      {isSubmittingReview ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          <span>Publishing Review...</span>
                        </>
                      ) : (
                        <span>Submit Review</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Products Recommendation Carousel/Grid */}
      {relatedProducts.length > 0 && (
        <section className="w-full py-12 sm:py-16 bg-[#f8f9ff]">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-[#ea580c] bg-[#ffedd5] px-3 py-1 rounded-full font-bold">
                  Recommended For You
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0b1c30] mt-2">
                  Customers Also Viewed
                </h2>
              </div>
              <Link
                href="/shop"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#f97316] hover:underline"
              >
                <span>View Full Catalog</span>
                <ArrowRight size={14} weight="Outline" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sticky Mobile Add to Bag Bottom Bar with Scroll Awareness & iOS Safe Area */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#ebdcd3] px-3.5 py-2.5 shadow-[0_-8px_24px_rgba(43,31,26,0.12)] flex items-center justify-between gap-3 transition-transform duration-300 pb-[max(0.65rem,env(safe-area-inset-bottom))] ${
          showStickyBar ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#fbe8e4]/50 border border-[#ebdcd3] shrink-0">
            <Image
              src={product.images[0]}
              alt={product.shortTitle || product.title}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#2b1f1a] truncate leading-tight">
              {product.shortTitle || product.title}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-space font-extrabold text-sm text-[#e06b5b]">
                ₹{currentTotalPrice.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-[#6b5850]/70 line-through">
                ₹{(product.originalPrice * quantity).toLocaleString("en-IN")}
              </span>
              <span className="text-[9px] font-bold text-[#4f775d] bg-[#eaf3ed] px-1 rounded">
                Free COD
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAddToCart}
            className="h-10 px-5 bg-[#e06b5b] hover:bg-[#c25445] active:scale-[0.97] text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-md shadow-[#e06b5b]/25 transition-all cursor-pointer"
          >
            <ShoppingBag size={15} weight="Filled" />
            <span>Add to Bag</span>
          </button>
        </div>
      </div>
    </div>
  );
}
