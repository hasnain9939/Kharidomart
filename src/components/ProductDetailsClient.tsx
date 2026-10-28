"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  TicketDiscount,
  Refresh,
  VideoPlay,
} from "reicon-react";
import { getVideoEmbed } from "@/lib/media";
import { getDeliveryEstimate } from "@/lib/pincode";
import { trackViewItem, trackAddToCart } from "@/lib/analytics";

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
  const router = useRouter();
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

  const [activeTab, setActiveTab] = useState<"description" | "specs" | "shipping" | "reviews">("description");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [_isLoadingReviews, setIsLoadingReviews] = useState(
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

  const currentTotalPrice = product.price * quantity;
  const dispatchLeadTime = product.dispatchTime || "24–48 hrs";

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

  // Fetch real reviews from DB on mount only if not already provided
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
        console.error("Failed to load reviews:", err);
      } finally {
        if (isMounted) setIsLoadingReviews(false);
      }
    };
    loadProductReviews();
    return () => {
      isMounted = false;
    };
  }, [product.id, product.slug, initialReviews]);

  // Track product view for analytics
  React.useEffect(() => {
    if (product) {
      trackViewItem({
        id: product.id,
        title: product.title,
        category: product.category,
        price: product.price,
      });
    }
  }, [product]);

  const wishlisted = isWishlisted(product.id);
  const discountPercent = Math.round(
    ((product.originalPrice - product.price) / product.originalPrice) * 100
  );

  const handleAddToCart = () => {
    addToCart(product, quantity);
    trackAddToCart(product, quantity);
    openCart();
    showToast(`Added ${quantity}x ${product.shortTitle || product.title} to your bag! 🍼`);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    trackAddToCart(product, quantity);
    router.push("/checkout");
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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name || !reviewForm.comment) {
      showToast("Please provide your name and review details", "warning");
      return;
    }
    setIsSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          customerName: reviewForm.name,
          city: reviewForm.city || "India",
          rating: reviewForm.rating,
          comment: reviewForm.title ? `${reviewForm.title}: ${reviewForm.comment}` : reviewForm.comment,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserReviews((prev) => [data.review, ...prev]);
        setLiveReviewsCount((prev) => prev + 1);
        setIsReviewModalOpen(false);
        setReviewForm({ name: "", city: "", rating: 5, title: "", comment: "" });
        showToast("Thank you! Your verified review has been published.");
      } else {
        showToast(data.error || "Unable to submit review right now", "warning");
      }
    } catch {
      showToast("Unable to submit review. Please try again later.", "warning");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const deliveryEstimate = pincode && pincode.length === 6 ? getDeliveryEstimate(pincode) : null;

  return (
    <div className="w-full bg-[#fdfbf7] min-h-screen pb-24 sm:pb-0 text-[#2b1f1a]">
      {/* Top Breadcrumb & Value Highlights */}
      <section className="w-full bg-[#fbf7f0] border-b border-[#eddcd1]/80 py-2.5">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-3 text-xs text-[#6b5850]">
          <nav className="flex items-center gap-2">
            <Link href="/" className="hover:text-[#e06b5b] transition-colors">
              Home
            </Link>
            <span className="opacity-40">/</span>
            <Link href="/shop" className="hover:text-[#e06b5b] transition-colors">
              Shop
            </Link>
            <span className="opacity-40">/</span>
            <Link
              href={`/collections/${product.categorySlug}`}
              className="hover:text-[#e06b5b] transition-colors"
            >
              {product.category}
            </Link>
            <span className="opacity-40">/</span>
            <span className="font-bold text-[#2b1f1a] truncate max-w-[200px] sm:max-w-xs">
              {product.shortTitle || product.title}
            </span>
          </nav>
          <div className="hidden sm:flex items-center gap-4 text-[11px] font-medium text-[#4f775d]">
            <span className="flex items-center gap-1">
              <ShieldCheck size={14} weight="Filled" />
              100% Food-Grade &amp; BPA-Free Materials
            </span>
            <span className="text-[#eddcd1]">•</span>
            <span className="flex items-center gap-1 text-[#e06b5b]">
              <TruckFast size={14} weight="Filled" />
              Pan-India Cash on Delivery
            </span>
          </div>
        </div>
      </section>

      {/* Hero Section: Product Visuals & Buy Engine */}
      <section className="w-full py-8 sm:py-12 bg-[#fdfbf7]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Gallery & Trust Proof (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Main Display Image */}
              <div className="relative bg-white rounded-3xl p-3 sm:p-6 shadow-xs border border-[#eddcd1] overflow-hidden flex flex-col items-center justify-center min-h-[300px] sm:min-h-[420px] md:min-h-[500px]">
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
                    className={`w-10 h-10 rounded-full bg-white/95 hover:bg-white border border-[#eddcd1] shadow-xs flex items-center justify-center transition-all cursor-pointer ${
                      wishlisted ? "text-rose-600 scale-105" : "text-[#6b5850] hover:text-rose-500"
                    }`}
                  >
                    <Heart size={20} weight={wishlisted ? "Filled" : "Outline"} />
                  </button>
                  <button
                    onClick={handleShare}
                    aria-label="Share product"
                    className="w-10 h-10 rounded-full bg-white/95 hover:bg-white border border-[#eddcd1] text-[#6b5850] hover:text-[#e06b5b] shadow-xs flex items-center justify-center transition-all cursor-pointer"
                  >
                    <Share size={18} weight="Outline" />
                  </button>
                </div>

                {/* Floating Watch Video Button (when photo is shown) */}
                {videoEmbed && !showVideo && (
                  <button
                    type="button"
                    onClick={() => setShowVideo(true)}
                    className="absolute top-4 left-4 z-10 bg-[#2b1f1a]/90 hover:bg-[#2b1f1a] text-white px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-xs transition-all hover:scale-105 cursor-pointer"
                  >
                    <VideoPlay size={14} weight="Filled" className="text-[#e06b5b]" />
                    <span>Watch Video Demo</span>
                  </button>
                )}

                {/* Main Product Image or Video */}
                {showVideo && videoEmbed ? (
                  <div className="relative w-full h-[280px] sm:h-[380px] md:h-[460px] rounded-2xl overflow-hidden bg-black flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setShowVideo(false)}
                      className="absolute top-3 right-3 z-20 bg-white/95 hover:bg-white text-[#2b1f1a] px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1"
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
                      className="object-contain rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                    />
                  </div>
                )}

                {/* Zoom Cue */}
                {!showVideo && (
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-full text-[#6b5850] text-xs font-semibold flex items-center gap-1.5 shadow-2xs border border-[#eddcd1]/80">
                    <span>🔍 High-resolution photography</span>
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
                          ? "border-[#e06b5b] ring-3 ring-[#fdedeb] scale-95 shadow-sm"
                          : "border-[#eddcd1] hover:border-[#e06b5b]/50 opacity-80 hover:opacity-100"
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
                      className={`relative aspect-square rounded-2xl overflow-hidden p-1 bg-[#2b1f1a] text-white border-2 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                        showVideo
                          ? "border-[#e06b5b] ring-3 ring-[#fdedeb] scale-95 shadow-sm"
                          : "border-[#eddcd1] hover:border-[#e06b5b]/50 opacity-90 hover:opacity-100"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#e06b5b] text-white flex items-center justify-center shadow-md">
                        <VideoPlay size={16} weight="Filled" />
                      </div>
                      <span className="text-[10px] font-bold text-white tracking-tight">
                        Video Demo
                      </span>
                    </button>
                  )}
                </div>
              )}

              {/* Quality & Safety Assurance Bar */}
              <div className="bg-[#fbf7f0] rounded-3xl p-5 border border-[#eddcd1] grid grid-cols-1 sm:grid-cols-3 gap-4 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#eaf3ed] text-[#4f775d] flex items-center justify-center shrink-0">
                    <ShieldCheck size={22} weight="Filled" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#2b1f1a]">Quality Inspected</p>
                    <p className="text-[11px] text-[#6b5850]">Pre-checked before dispatch</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#fdedeb] text-[#e06b5b] flex items-center justify-center shrink-0">
                    <TruckFast size={22} weight="Filled" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#2b1f1a]">Express Delivery</p>
                    <p className="text-[11px] text-[#6b5850]">Dispatches in {dispatchLeadTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#fbf7f0] text-[#4f775d] flex items-center justify-center shrink-0 border border-[#eddcd1]">
                    <Refresh size={20} weight="Filled" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#2b1f1a]">24-Hr Doorstep Replace</p>
                    <p className="text-[11px] text-[#6b5850]">Hassle-free guarantee</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Buy Engine (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Category & Stock Tag */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs uppercase tracking-wider text-[#e06b5b] bg-[#fdedeb] px-3 py-1 rounded-full font-bold border border-[#f5c7c1]">
                  {product.category} • Kharido Mart Verified
                </span>
                <span className="text-xs text-[#4f775d] font-bold uppercase tracking-wide flex items-center gap-1">
                  <CheckCircle size={15} weight="Filled" /> In Stock &amp; Ready to Ship
                </span>
              </div>

              {/* Product Title & Hook */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#2b1f1a] leading-tight tracking-tight">
                  {product.title}
                </h1>
                {heroHook && (
                  <p className="text-sm text-[#6b5850] mt-2.5 leading-relaxed">
                    {heroHook}
                  </p>
                )}
              </div>

              {/* Star Rating & Social Proof */}
              <div className="flex items-center flex-wrap gap-2.5 bg-white p-3.5 rounded-2xl border border-[#eddcd1] shadow-2xs">
                <div className="flex items-center text-[#f59e0b]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} weight="Filled" />
                  ))}
                </div>
                <span className="font-space font-bold text-sm text-[#2b1f1a] tabular-nums">
                  {liveRating.toFixed(1)}
                </span>
                <span className="text-xs text-[#6b5850]">
                  ({liveReviewsCount} verified {liveReviewsCount === 1 ? "review" : "reviews"})
                </span>
                <span className="text-[#eddcd1]">•</span>
                <span className="text-xs font-semibold text-[#4f775d] flex items-center gap-1">
                  <Check size={14} weight="Filled" /> 98% Parent Satisfaction
                </span>
              </div>

              {/* Price Display Section */}
              <div className="bg-white p-5 rounded-3xl border border-[#eddcd1] shadow-xs space-y-3">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="font-space font-extrabold text-3xl sm:text-4xl text-[#2b1f1a] tabular-nums">
                    ₹{product.price.toLocaleString("en-IN")}.00
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="font-space text-sm sm:text-base text-[#6b5850]/60 line-through tabular-nums">
                      ₹{product.originalPrice.toLocaleString("en-IN")}.00
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="px-2.5 py-1 bg-[#4f775d]/10 text-[#4f775d] font-space font-bold text-xs rounded-lg uppercase">
                      Save ₹{(product.originalPrice - product.price).toLocaleString("en-IN")} ({discountPercent}% OFF)
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6b5850]">
                  Inclusive of all taxes. Free express shipping on all orders ₹499+.
                </p>

                {/* Safe Materials Assurance */}
                <div className="bg-[#eaf3ed] border border-[#d2e7d7] rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#4f775d] text-white flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} weight="Filled" />
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-[#2b1f1a]">
                      Certified Child-Safe &amp; BPA-Free Materials
                    </p>
                    <p className="text-[11px] text-[#6b5850] mt-0.5">
                      Smooth rounded edges and food-grade components curated for sensitive baby care.
                    </p>
                  </div>
                </div>

                {/* UPI / Prepaid Extra ₹50 Discount Incentive */}
                <div className="bg-[#fbf7f0] border border-[#eddcd1] rounded-2xl p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <TicketDiscount size={18} weight="Filled" className="text-[#4f775d] shrink-0" />
                    <span className="text-[#2b1f1a] font-medium">
                      Pay via <strong>UPI / GPay / Cards</strong> &amp; get <strong>Instant ₹50 OFF</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#4f775d] bg-[#eaf3ed] px-2 py-0.5 rounded-md shrink-0">
                    Auto-Applied
                  </span>
                </div>

                {/* Calm Same-Day Dispatch Commitment */}
                <div className="bg-[#fdedeb]/60 border border-[#eddcd1] rounded-2xl p-3 flex items-center gap-3 text-xs">
                  <div className="w-8 h-8 rounded-xl bg-[#e06b5b] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <TruckFast size={16} weight="Filled" />
                  </div>
                  <div>
                    <p className="font-bold text-[#2b1f1a]">
                      Fast Pan-India Dispatch: Orders before 3:00 PM IST ship same day
                    </p>
                    <p className="text-[11px] text-[#6b5850]">
                      Dispatched via BlueDart / Delhivery Express with real-time WhatsApp updates.
                    </p>
                  </div>
                </div>
              </div>

              {/* Color Finish Selector (if applicable) */}
              {colorVariants.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2b1f1a]">Select Color Finish:</span>
                    <span className="text-xs font-bold text-[#e06b5b]">{selectedColor}</span>
                  </div>
                  <div className="flex items-center flex-wrap gap-2 sm:gap-2.5">
                    {colorVariants.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setSelectedColor(color.name)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                          selectedColor === color.name
                            ? "border-[#e06b5b] bg-[#fdedeb]/50 shadow-xs text-[#2b1f1a]"
                            : "border-[#eddcd1] bg-white hover:bg-stone-50 text-[#6b5850]"
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/10 shadow-inner shrink-0"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span>{color.label || color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Clean Quantity Selector & Real Subtotal */}
              <div className="bg-white p-4 rounded-3xl border border-[#eddcd1] shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#2b1f1a]">Quantity:</span>
                  <div className="flex items-center gap-2">
                    {currentTotalPrice >= 499 ? (
                      <span className="text-[11px] font-bold text-[#4f775d] bg-[#eaf3ed] px-2 py-0.5 rounded-full">
                        🎉 Free Express Delivery Unlocked
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#6b5850]">
                        Add ₹{499 - currentTotalPrice} more for Free Shipping
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center bg-[#fdfbf7] rounded-2xl p-1 border border-[#eddcd1] shrink-0">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-[#2b1f1a] hover:bg-white transition-colors font-bold text-sm cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-space font-bold text-sm text-[#2b1f1a] tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-[#2b1f1a] hover:bg-white transition-colors font-bold text-sm cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-[#6b5850] block">Subtotal:</span>
                    <span className="text-lg sm:text-xl font-space font-extrabold text-[#2b1f1a] tabular-nums">
                      ₹{currentTotalPrice.toLocaleString("en-IN")}.00
                    </span>
                  </div>
                </div>
              </div>

              {/* Highlights Feature Bullets */}
              {cleanHighlights.length > 0 && (
                <div className="bg-[#fbf7f0] p-4 rounded-2xl border border-[#eddcd1] space-y-2">
                  {cleanHighlights.slice(0, 4).map((h, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-[#2b1f1a]">
                      <CheckCircle size={16} weight="Filled" className="text-[#4f775d] shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{h}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Dual Action Buttons (Add to Bag + Buy Now / Direct Checkout) */}
              <div className="space-y-2.5 pt-1">
                <button
                  onClick={handleAddToCart}
                  className="w-full h-13 bg-[#e06b5b] hover:bg-[#c95444] active:scale-[0.98] text-white font-bold text-sm sm:text-base rounded-2xl flex items-center justify-center gap-2.5 shadow-lg shadow-[#e06b5b]/25 transition-all cursor-pointer"
                >
                  <ShoppingBag size={20} weight="Filled" />
                  <span>Add to Bag — ₹{currentTotalPrice.toLocaleString("en-IN")}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  className="w-full h-12 bg-[#2b1f1a] hover:bg-[#3d2c25] active:scale-[0.98] text-white font-bold text-xs sm:text-sm rounded-2xl flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>⚡ Buy Now (Cash on Delivery / UPI)</span>
                  <ArrowRight size={16} weight="Outline" />
                </button>
              </div>

              {/* Live Pincode Check & Delivery Estimator Widget */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#eddcd1] shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#2b1f1a]">
                    Check Pincode &amp; Delivery Timeline:
                  </label>
                  <span className="text-[11px] text-[#4f775d] font-semibold flex items-center gap-1">
                    <TruckFast size={14} weight="Filled" /> Pan-India Express
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
                            {deliveryEstimate ? `${deliveryEstimate.startDate} – ${deliveryEstimate.endDate}` : `${getDeliveryEstimate(pincode).startDate} – ${getDeliveryEstimate(pincode).endDate}`}
                          </span>
                        </p>
                        <p className="text-[11px] text-[#6b5850] mt-0.5">
                          Shipping to{" "}
                          <strong>
                            {pincodeLocation
                              ? `${pincodeLocation.district}, ${pincodeLocation.state}`
                              : (deliveryEstimate ? deliveryEstimate.region : getDeliveryEstimate(pincode).region)}{" "}
                            ({pincode})
                          </strong>{" "}
                          via Priority Express Courier
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#eddcd1]/70 flex flex-wrap gap-2 text-[11px]">
                      <span className="bg-white text-[#4f775d] border border-[#eddcd1] font-semibold px-2 py-0.5 rounded-md">
                        ✓ Cash on Delivery (COD) Available
                      </span>
                      <span className="bg-white text-[#4f775d] border border-[#eddcd1] font-semibold px-2 py-0.5 rounded-md">
                        ✓ Free Express Delivery (₹499+)
                      </span>
                      <span className="bg-white text-[#4f775d] border border-[#eddcd1] font-semibold px-2 py-0.5 rounded-md">
                        ✓ 24-Hr Doorstep Replacement Guarantee
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Transparent Reassurance Badges */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-white p-3 rounded-2xl flex items-center gap-2 border border-[#eddcd1] shadow-2xs">
                  <Refresh size={20} weight="Filled" className="text-[#e06b5b]" />
                  <span className="text-xs font-semibold text-[#2b1f1a]">24-Hr Replacement Guarantee</span>
                </div>
                <div className="bg-white p-3 rounded-2xl flex items-center gap-2 border border-[#eddcd1] shadow-2xs">
                  <ShieldCheck size={20} weight="Filled" className="text-[#4f775d]" />
                  <span className="text-xs font-semibold text-[#2b1f1a]">100% Quality Inspected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Details, Specs, Shipping & Verified Reviews Tabs */}
      <section className="w-full py-12 sm:py-16 bg-white border-t border-[#eddcd1]">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-center justify-center flex-wrap gap-3 sm:gap-6 border-b border-[#eddcd1] pb-4">
            <button
              onClick={() => setActiveTab("description")}
              className={`pb-2 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
                activeTab === "description"
                  ? "text-[#e06b5b]"
                  : "text-[#6b5850] hover:text-[#2b1f1a]"
              }`}
            >
              <span>Overview &amp; Benefits</span>
              {activeTab === "description" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e06b5b]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("specs")}
              className={`pb-2 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
                activeTab === "specs"
                  ? "text-[#e06b5b]"
                  : "text-[#6b5850] hover:text-[#2b1f1a]"
              }`}
            >
              <span>Specifications &amp; Materials</span>
              {activeTab === "specs" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e06b5b]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("shipping")}
              className={`pb-2 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
                activeTab === "shipping"
                  ? "text-[#e06b5b]"
                  : "text-[#6b5850] hover:text-[#2b1f1a]"
              }`}
            >
              <span>Shipping &amp; 24h Replacement</span>
              {activeTab === "shipping" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e06b5b]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-2 text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
                activeTab === "reviews"
                  ? "text-[#e06b5b]"
                  : "text-[#6b5850] hover:text-[#2b1f1a]"
              }`}
            >
              <span>Verified Reviews ({liveReviewsCount})</span>
              {activeTab === "reviews" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e06b5b]" />
              )}
            </button>
          </div>

          {/* TAB 1: Overview & Benefits */}
          {activeTab === "description" && (
            <div className="max-w-4xl mx-auto space-y-6 pt-2">
              <div className="bg-[#fbf7f0] rounded-3xl p-6 sm:p-8 border border-[#eddcd1]">
                <h3 className="font-black text-base sm:text-lg text-[#2b1f1a] mb-3 tracking-tight">
                  About {product.shortTitle || product.title}
                </h3>
                <div className="text-xs sm:text-sm text-[#6b5850] leading-relaxed whitespace-pre-line">
                  {cleanDescription}
                </div>
              </div>

              {cleanHighlights.length > 0 && (
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#eddcd1] shadow-xs space-y-4">
                  <h3 className="font-black text-base text-[#2b1f1a] tracking-tight">
                    Key Highlights &amp; Features
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cleanHighlights.map((hl, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#fdfbf7] border border-[#eddcd1]"
                      >
                        <CheckCircle size={18} weight="Filled" className="text-[#4f775d] shrink-0 mt-0.5" />
                        <span className="text-xs font-semibold text-[#2b1f1a] leading-snug">{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Specifications & Materials */}
          {activeTab === "specs" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-[#fbf7f0] rounded-3xl p-6 sm:p-8 border border-[#eddcd1] shadow-xs">
                <div className="flex items-center justify-between pb-4 border-b border-[#eddcd1]">
                  <h3 className="font-black text-base text-[#2b1f1a] tracking-tight">
                    Technical Specifications &amp; Quality Check
                  </h3>
                  <span className="text-xs font-semibold text-[#4f775d] flex items-center gap-1">
                    <CheckCircle size={14} weight="Filled" /> Verified Safe
                  </span>
                </div>
                <dl className="divide-y divide-[#eddcd1]">
                  {product.specs && product.specs.length > 0 ? (
                    product.specs.map((spec, i) => (
                      <div key={i} className="py-3 flex justify-between text-xs sm:text-sm">
                        <dt className="text-[#6b5850] font-medium">{spec.label}</dt>
                        <dd className="font-bold text-[#2b1f1a] text-right">{spec.value}</dd>
                      </div>
                    ))
                  ) : (
                    <div className="py-3 text-xs text-[#6b5850]">
                      Standard baby care safety specifications apply. Food-grade, BPA-free, and certified child-friendly.
                    </div>
                  )}
                </dl>
              </div>
            </div>
          )}

          {/* TAB 3: Shipping, COD & 24h Replacement */}
          {activeTab === "shipping" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-[#fbf7f0] rounded-3xl p-6 sm:p-8 border border-[#eddcd1] shadow-xs space-y-5">
                <h3 className="font-black text-base sm:text-lg text-[#2b1f1a] tracking-tight">
                  Transparent Delivery, COD &amp; Doorstep Replacement
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-[#eddcd1] space-y-2">
                    <div className="flex items-center gap-2 text-[#e06b5b]">
                      <TruckFast size={18} weight="Filled" />
                      <h4 className="font-bold text-xs sm:text-sm text-[#2b1f1a]">Express Pan-India Delivery</h4>
                    </div>
                    <p className="text-xs text-[#6b5850] leading-relaxed">
                      Orders placed before 3:00 PM IST dispatch same day. Delivery takes 2–3 days for metro cities (Delhi NCR, Mumbai, Bengaluru, Kolkata) and 3–5 days across India via BlueDart, Delhivery, or Xpressbees.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-[#eddcd1] space-y-2">
                    <div className="flex items-center gap-2 text-[#4f775d]">
                      <TicketDiscount size={18} weight="Filled" />
                      <h4 className="font-bold text-xs sm:text-sm text-[#2b1f1a]">Cash on Delivery &amp; UPI</h4>
                    </div>
                    <p className="text-xs text-[#6b5850] leading-relaxed">
                      Cash on Delivery (COD) is available across 28,000+ pin codes. Prefer prepaid? Pay via UPI (GPay/PhonePe/Paytm) to receive an automatic ₹50 instant discount at checkout.
                    </p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#eaf3ed] border border-[#d2e7d7] space-y-2">
                  <div className="flex items-center gap-2 text-[#4f775d]">
                    <ShieldCheck size={20} weight="Filled" />
                    <h4 className="font-bold text-xs sm:text-sm text-[#2b1f1a]">24-Hour Doorstep Replacement Guarantee</h4>
                  </div>
                  <p className="text-xs text-[#6b5850] leading-relaxed">
                    If an item arrives damaged, defective, or missing parts, share a short unboxing video with our WhatsApp care team (+91 85400 17572) within 24 hours of delivery. We promptly dispatch a brand-new replacement at zero extra cost.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Verified Reviews */}
          {activeTab === "reviews" && (
            <div className="space-y-6 pt-2 max-w-4xl mx-auto">
              {/* Header with Write a Review Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#fbf7f0] p-5 rounded-3xl border border-[#eddcd1] shadow-2xs">
                <div>
                  <h3 className="font-black text-lg text-[#2b1f1a] tracking-tight">
                    Verified Customer Reviews
                  </h3>
                  <p className="text-xs text-[#6b5850] mt-0.5">
                    Real feedback from customers who purchased this item on Kharido Mart
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-5 py-2.5 bg-[#e06b5b] hover:bg-[#c95444] active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Star size={14} weight="Filled" />
                  <span>Write a Review</span>
                </button>
              </div>

              {/* User Submitted Reviews */}
              {userReviews.length > 0 ? (
                <div className="space-y-3">
                  {userReviews.map((r, idx) => (
                    <div
                      key={r.id || idx}
                      className="bg-white p-5 rounded-2xl border border-[#eddcd1] shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#2b1f1a]">
                            {r.customerName || r.name}
                          </span>
                          {r.verified && (
                            <span className="text-[10px] text-[#4f775d] bg-[#eaf3ed] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <CheckCircle size={12} weight="Filled" /> Verified Purchase
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#6b5850]">{r.date}</span>
                      </div>

                      <div className="flex items-center text-[#f59e0b]">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            weight={i < r.rating ? "Filled" : "Outline"}
                          />
                        ))}
                      </div>

                      {r.title && (
                        <p className="font-bold text-xs text-[#2b1f1a]">{r.title}</p>
                      )}

                      <p className="text-xs text-[#6b5850] leading-relaxed">
                        {r.comment}
                      </p>

                      {r.city && (
                        <span className="text-[10px] text-[#6b5850]/70 block">
                          Purchased in {r.city}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-3xl border border-[#eddcd1] text-center space-y-3">
                  <p className="text-sm font-bold text-[#2b1f1a]">No reviews yet for this product</p>
                  <p className="text-xs text-[#6b5850]">
                    Be the first parent to share your experience and receive an extra discount coupon!
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(true)}
                    className="px-4 py-2 bg-[#2b1f1a] text-white text-xs font-bold rounded-xl"
                  >
                    Write the First Review
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Review Submission Modal */}
          {isReviewModalOpen && (
            <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#eddcd1] space-y-4 animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-[#eddcd1]">
                  <h3 className="text-base font-black text-[#2b1f1a]">
                    Write a Verified Review
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="text-[#6b5850] hover:text-[#2b1f1a] cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-[#2b1f1a] mb-1">
                      Rating (1 to 5 Stars) *
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className={`p-1 transition-transform cursor-pointer ${
                            star <= reviewForm.rating
                              ? "text-[#f59e0b] scale-110"
                              : "text-slate-300"
                          }`}
                        >
                          <Star size={24} weight="Filled" />
                        </button>
                      ))}
                      <span className="font-space font-bold text-sm text-[#2b1f1a] ml-2 tabular-nums">
                        {reviewForm.rating} / 5 Stars
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-[#2b1f1a] mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={reviewForm.name}
                        onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                        placeholder="Your full name"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#eddcd1] text-xs font-semibold focus:outline-none focus:border-[#e06b5b]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#2b1f1a] mb-1">
                        City / State
                      </label>
                      <input
                        type="text"
                        value={reviewForm.city}
                        onChange={(e) => setReviewForm({ ...reviewForm, city: e.target.value })}
                        placeholder="e.g. Pune, MH"
                        className="w-full px-3 py-2.5 rounded-xl border border-[#eddcd1] text-xs font-semibold focus:outline-none focus:border-[#e06b5b]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#2b1f1a] mb-1">
                      Headline / Title
                    </label>
                    <input
                      type="text"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                      placeholder="e.g. Excellent build quality, gentle on baby nails!"
                      className="w-full px-3 py-2.5 rounded-xl border border-[#eddcd1] text-xs font-semibold focus:outline-none focus:border-[#e06b5b]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-[#2b1f1a] mb-1">
                      Your Detailed Review *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      placeholder="What did you like or dislike? How does it perform in daily baby care?"
                      className="w-full px-3 py-2.5 rounded-xl border border-[#eddcd1] text-xs font-semibold focus:outline-none focus:border-[#e06b5b]"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsReviewModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-[#eddcd1] font-bold text-xs text-[#6b5850] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="px-6 py-2.5 bg-[#e06b5b] hover:bg-[#c95444] active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
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

      {/* Related Products Recommendation Grid */}
      {relatedProducts.length > 0 && (
        <section className="w-full py-12 sm:py-16 bg-[#fbf7f0] border-t border-[#eddcd1]">
          <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#e06b5b]">
                  Complete The Care Routine
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#2b1f1a] mt-1 tracking-tight">
                  Parents Also Bought Together
                </h2>
              </div>
              <Link
                href="/shop"
                className="text-xs sm:text-sm font-bold text-[#e06b5b] hover:text-[#c95444] flex items-center gap-1"
              >
                <span>Browse All</span>
                <ArrowRight size={14} weight="Outline" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Mobile Sticky Add to Bag & Buy Bar */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#eddcd1] px-4 py-2.5 shadow-[0_-8px_24px_rgba(43,31,26,0.12)] flex items-center justify-between gap-3 transition-transform duration-300 pb-[max(0.75rem,env(safe-area-inset-bottom))] ${
          showStickyBar ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#fbf7f0] border border-[#eddcd1] shrink-0">
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
              <span className="font-space font-extrabold text-sm text-[#e06b5b] tabular-nums">
                ₹{currentTotalPrice.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-[#4f775d] font-bold bg-[#eaf3ed] px-1 rounded">
                Free COD
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAddToCart}
            className="h-10 px-4 bg-[#e06b5b] hover:bg-[#c95444] active:scale-[0.98] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-[#e06b5b]/25 transition-all cursor-pointer"
          >
            <ShoppingBag size={14} weight="Filled" />
            <span>Add</span>
          </button>
          <button
            onClick={handleBuyNow}
            className="h-10 px-4 bg-[#2b1f1a] hover:bg-[#3d2c25] active:scale-[0.98] text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-sm transition-all cursor-pointer"
          >
            <span>Buy</span>
            <ArrowRight size={13} weight="Outline" />
          </button>
        </div>
      </div>
    </div>
  );
}
