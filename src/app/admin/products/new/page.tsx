"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Add,
  Check,
  CheckCircle,
  Copy,
  Box,
  TruckFast,
  ShieldCheck,
  CloseCircle,
  Trash,
  Image as ImageIcon,
  VideoPlay,
} from "reicon-react";
import { useStore } from "@/context/StoreContext";

function getVideoEmbed(url: string) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const ytShorts = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i);
  if (ytShorts && ytShorts[1]) {
    return { type: "youtube" as const, embedUrl: `https://www.youtube-nocookie.com/embed/${ytShorts[1]}` };
  }

  const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return { type: "youtube" as const, embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}` };
  }

  const vimeoMatch = trimmed.match(/vimeo\.com\/(\d+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return { type: "vimeo" as const, embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  }

  return { type: "direct" as const, embedUrl: trimmed };
}

function AddProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams ? searchParams.get("edit") : null;
  const isEditing = Boolean(editId);

  const { refreshProducts } = useStore();

  const [title, setTitle] = useState("");
  const [handle, setHandle] = useState("");
  const [sellingPrice, setSellingPrice] = useState<number | "">("");
  const [compareAtPrice, setCompareAtPrice] = useState<number | "">("");
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [category, setCategory] = useState("Mom & Baby");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState<number>(25);
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [customImageInput, setCustomImageInput] = useState("");

  // Trust badges
  const [badgeBestseller, setBadgeBestseller] = useState(true);
  const [badgeCod, setBadgeCod] = useState(true);
  const [featured, setFeatured] = useState(true);

  const [copiedSlug, setCopiedSlug] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!editId) return;
    const loadProductForEdit = async () => {
      try {
        const res = await fetch(`/api/products/${editId}`);
        const data = await res.json();
        if (data.success && data.product) {
          const p = data.product;
          setTitle(p.title || "");
          setHandle(p.slug || "");
          setSellingPrice(p.price ?? "");
          setCompareAtPrice(p.originalPrice ?? "");
          setCategory(p.category || "Mom & Baby");
          setStock(p.stock ?? 25);
          setDescription(p.description || "");
          if (Array.isArray(p.images) && p.images.length > 0) {
            setImageUrl(p.images[0]);
            setGalleryImages(p.images.slice(1));
          }
          if (p.videoUrl) {
            setVideoUrl(p.videoUrl);
          }
          setFeatured(Boolean(p.featured));
          setBadgeBestseller(p.badge === "Bestseller");
          setBadgeCod(p.badge === "COD Available");
          if (Array.isArray(p.specs)) {
            const skuSpec = p.specs.find((s: any) => s.label === "SKU");
            if (skuSpec) setSku(skuSpec.value);
          }
        }
      } catch (err) {
        console.error("Failed to load product for editing:", err);
      }
    };
    loadProductForEdit();
  }, [editId]);

  // Auto slug generation from title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!handle || handle === title.toLowerCase().replace(/[^a-z0-9]+/g, "-")) {
      setHandle(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  };

  // Derived margin calculations
  const priceNum = typeof sellingPrice === "number" ? sellingPrice : 0;
  const costNum = typeof costPrice === "number" ? costPrice : 0;
  const grossProfit = Math.max(0, priceNum - costNum);
  const marginPercentage =
    priceNum > 0 ? ((grossProfit / priceNum) * 100).toFixed(1) : "0";

  const handleCopySlug = () => {
    navigator.clipboard.writeText(`https://kharidomart.com/products/${handle}`);
    setCopiedSlug(true);
    setTimeout(() => setCopiedSlug(false), 2000);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !sellingPrice) {
      alert("Please enter a valid product title and selling price.");
      return;
    }

    const finalImages = [imageUrl.trim(), ...galleryImages.map((g) => g.trim())].filter(Boolean);
    if (finalImages.length === 0) {
      alert("Please provide at least one product image URL.");
      return;
    }

    setIsPublishing(true);

    const categorySlugMap: Record<string, string> = {
      "Mom & Baby": "mom-baby",
      "Toys & Games": "fun-clever-finds",
      "Home & Kitchen": "home-kitchen",
      "Smart Gadgets": "smart-gadgets",
    };

    const catSlug = categorySlugMap[category] || category.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const highlights = description
      ? description
          .split("\n")
          .map((s) => s.replace(/^[-•*]\s*/, "").trim())
          .filter(Boolean)
      : [
          "100% Certified Safe & High Quality Materials",
          "Fast Dispatch via BlueDart Express Air Courier",
          "Cash on Delivery & Easy 7-Day Replacement Support",
        ];

    try {
      const url = isEditing ? `/api/products/${editId}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          shortTitle: title.trim().slice(0, 48),
          slug: handle.trim() || undefined,
          price: priceNum,
          originalPrice: typeof compareAtPrice === "number" && compareAtPrice > 0 ? compareAtPrice : priceNum,
          stock: stock || 0,
          category,
          categorySlug: catSlug,
          badge: badgeBestseller ? "Bestseller" : badgeCod ? "COD Available" : undefined,
          featured,
          images: finalImages,
          videoUrl: videoUrl.trim() || undefined,
          description:
            description.trim() ||
            `${title.trim()} is carefully curated and inspected for genuine everyday utility and supreme build quality. Order now with pan-India Cash on Delivery.`,
          highlights,
          specs: [
            { label: "Country of Origin", value: "India" },
            { label: "SKU", value: sku || "KM-" + Math.floor(1000 + Math.random() * 9000) },
            { label: "Warranty", value: "7-Day Replacement Guarantee" },
            { label: "MRP Declaration", value: "Inclusive of all Taxes" },
          ],
        }),
      });

      const data = await res.json();
      if (data.success) {
        await refreshProducts();
        setToastMessage(isEditing ? `Product updated successfully! 🚀` : `Product "${title}" added to database successfully! 🎉`);
        setTimeout(() => {
          router.push("/admin/products");
        }, 1200);
      } else {
        alert(data.error || "Failed to save product");
        setIsPublishing(false);
      }
    } catch (err: any) {
      alert("Error saving product: " + err.message);
      setIsPublishing(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!editId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/products/${editId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        await refreshProducts();
        setToastMessage(`Product "${title}" removed from database.`);
        setTimeout(() => {
          router.push("/admin/products");
        }, 1000);
      } else {
        alert(data.error || "Failed to delete product");
        setIsDeleting(false);
      }
    } catch (err: any) {
      alert("Error deleting product: " + err.message);
      setIsDeleting(false);
    }
  };

  return (
    <form onSubmit={handlePublish} className="flex flex-col gap-6 w-full max-w-6xl mx-auto min-w-0 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0b1c30] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-bold border border-[#f97316] animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle size={16} weight="Filled" className="text-[#15803d]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#565e74] mb-1">
            <Link href="/admin/products" className="hover:text-[#f97316] flex items-center gap-1 font-semibold">
              <ArrowLeft size={12} weight="Outline" /> Back to Products
            </Link>
            <span>/</span>
            <span className="font-bold text-[#0b1c30]">{isEditing ? "Edit Product" : "Add New Product"}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#0b1c30] tracking-tight">
            {isEditing ? `Edit Product: ${title || "Listing"}` : "Create Real Product Listing"}
          </h1>
          <p className="text-xs text-[#565e74] mt-0.5">
            This saves directly into your store database and goes live on your storefront instantly.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/products"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#f8fafc] text-[#565e74] border border-[#e2e8f0] text-xs font-bold transition-colors"
          >
            Cancel
          </Link>
          {isEditing && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-red-200 text-xs font-bold transition-colors cursor-pointer"
            >
              <Trash size={15} weight="Outline" />
              <span>Delete</span>
            </button>
          )}
          <button
            type="submit"
            disabled={isPublishing}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold shadow-[0_4px_14px_0_rgba(249,115,22,0.35)] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isPublishing ? (
              <span>Saving to Database...</span>
            ) : (
              <>
                <Check size={16} weight="Outline" />
                <span>{isEditing ? "Update Product" : "Save & Publish Product"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 8 cols */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* 1. Basic Details */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-4 rounded-full bg-[#f97316]"></span>
                Basic Details
              </h2>
              <span className="text-[11px] font-semibold text-[#15803d] bg-[#f0fdf4] px-2.5 py-0.5 rounded-full border border-[#bbf7d0]">
                Prisma Database Sync
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                Product Title <span className="text-[#ef4444]">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Wireless Portable Electric Chopper 250ml"
                className="w-full h-11 px-3.5 rounded-xl bg-[#f8fafc] text-xs font-medium text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none transition-all"
              />
            </div>

            {/* URL Slug Preview */}
            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-xs text-[#565e74] flex items-center gap-1 font-mono">
                <span>kharidomart.com/products/</span>
                <span className="text-[#f97316] font-bold">{handle || "your-product-slug"}</span>
              </div>
              <button
                type="button"
                onClick={handleCopySlug}
                className="text-xs font-bold text-[#0b1c30] hover:text-[#f97316] flex items-center gap-1 shrink-0"
              >
                <Copy size={13} weight="Outline" />
                <span>{copiedSlug ? "Copied!" : "Copy URL"}</span>
              </button>
            </div>

            {/* Product Description */}
            <div>
              <label className="block text-xs font-bold text-[#0b1c30] mb-1.5">
                Product Description &amp; Highlights (One feature per line)
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={`• Whisper-Quiet 35dB motor for nighttime trimming\n• 6 Cushioned interchangeable grinding heads\n• 100% Baby-safe BPA-free materials\n• Fast USB rechargeable battery`}
                className="w-full p-3.5 bg-[#f8fafc] text-xs text-[#0b1c30] rounded-xl border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none font-sans"
              />
            </div>
          </div>

          {/* 2. Media Image Selection */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-4 rounded-full bg-[#f97316]"></span>
                Product Images
              </h2>
              <span className="text-[11px] text-[#565e74]">
                Paste image URL or local asset path
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                Main Image URL <span className="text-[#ef4444]">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or /assets/..."
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8fafc] text-xs text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none font-mono transition-all"
                />
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="h-10 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#565e74] text-xs font-bold shrink-0 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Main Image Live Preview */}
            {imageUrl ? (
              <div className="relative p-3.5 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-white border border-[#e2e8f0] shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Main product preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='1.5'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Ccircle cx='9' cy='9' r='2'/%3E%3Cpath d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21'/%3E%3C/svg%3E";
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#15803d]/10 text-[#15803d]">
                      Cover Image
                    </span>
                    <span className="text-[11px] text-[#565e74] truncate">
                      {imageUrl}
                    </span>
                  </div>
                  <p className="text-xs text-[#565e74] mt-1.5">
                    This primary image is displayed on the storefront catalog, search results, and hero section.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl border-2 border-dashed border-[#e2e8f0] bg-[#f8fafc] text-center flex flex-col items-center justify-center gap-1.5">
                <div className="w-10 h-10 rounded-full bg-orange-50 text-[#f97316] flex items-center justify-center">
                  <ImageIcon size={20} weight="Outline" />
                </div>
                <p className="text-xs font-bold text-[#0b1c30]">No image provided yet</p>
                <p className="text-[11px] text-[#565e74]">
                  Paste a direct image URL above to see live preview.
                </p>
              </div>
            )}

            {/* Additional Gallery Images */}
            <div className="pt-2 border-t border-[#f1f5f9] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#0b1c30]">
                    Additional Gallery Images (Optional)
                  </span>
                  <p className="text-[11px] text-[#565e74]">
                    Add extra angles, close-ups, or unboxing photos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setGalleryImages([...galleryImages, ""])}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#ea580c] text-xs font-bold transition-colors cursor-pointer"
                >
                  <Add size={14} weight="Outline" />
                  <span>Add Another Image</span>
                </button>
              </div>

              {galleryImages.map((img, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#565e74] w-6 text-center">
                    #{idx + 2}
                  </span>
                  <input
                    type="text"
                    value={img}
                    onChange={(e) => {
                      const updated = [...galleryImages];
                      updated[idx] = e.target.value;
                      setGalleryImages(updated);
                    }}
                    placeholder={`Gallery photo URL #${idx + 2}`}
                    className="flex-1 h-9 px-3 rounded-xl bg-[#f8fafc] text-xs text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none font-mono"
                  />
                  {img && (
                    <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-100 border border-[#e2e8f0] shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`Gallery ${idx + 2}`} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setGalleryImages(galleryImages.filter((_, i) => i !== idx));
                    }}
                    className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-[#565e74] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                    title="Remove image"
                  >
                    <CloseCircle size={16} weight="Outline" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Product Video Section */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-4 rounded-full bg-[#15803d]"></span>
                Product Video (Optional)
              </h2>
              <span className="text-[11px] font-bold text-[#15803d] bg-[#f0fdf4] px-2.5 py-0.5 rounded-full border border-[#bbf7d0]">
                Interactive Video Player
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                Video URL (YouTube, YouTube Shorts, Vimeo, or Direct .mp4 / .webm)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/... or .mp4 link"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8fafc] text-xs text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none font-mono transition-all"
                />
                {videoUrl && (
                  <button
                    type="button"
                    onClick={() => setVideoUrl("")}
                    className="h-10 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#565e74] text-xs font-bold shrink-0 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#565e74] mt-1.5">
                Supports YouTube links, YouTube Shorts, Vimeo, or direct MP4/WebM files. Shoppers can watch the product video directly on the product detail page.
              </p>
            </div>

            {/* Video Live Preview */}
            {videoUrl ? (
              <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0b1c30] flex items-center gap-1.5">
                    <VideoPlay size={15} weight="Filled" className="text-[#ea580c]" />
                    Live Video Player Preview
                  </span>
                  <span className="text-[10px] font-mono text-[#565e74] truncate max-w-xs">
                    {videoUrl}
                  </span>
                </div>
                <div className="w-full aspect-video rounded-xl overflow-hidden bg-black/90 shadow-sm border border-slate-700/30 flex items-center justify-center">
                  {(() => {
                    const embed = getVideoEmbed(videoUrl);
                    if (!embed) return null;
                    if (embed.type === "youtube" || embed.type === "vimeo") {
                      return (
                        <iframe
                          src={embed.embedUrl}
                          title="Product video preview"
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      );
                    }
                    return (
                      <video
                        src={embed.embedUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] text-xs text-[#565e74] flex items-center gap-2.5">
                <VideoPlay size={18} weight="Outline" className="text-[#565e74] shrink-0" />
                <span>Paste a YouTube or video link above to see the interactive video player preview here.</span>
              </div>
            )}
          </div>

          {/* 3. Pricing & Profit Margin */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-4">
            <h2 className="text-sm font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-4 rounded-full bg-[#f97316]"></span>
              Pricing &amp; Cost Analysis
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Selling Price (₹) <span className="text-[#ef4444]">*</span>
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 699"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value ? Number(e.target.value) : "")}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8fafc] text-xs font-extrabold text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Compare-At Price / MRP (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 1499"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value ? Number(e.target.value) : "")}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8fafc] text-xs font-medium text-[#565e74] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1c30] mb-1">
                  Procurement Cost (₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 250"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value ? Number(e.target.value) : "")}
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8fafc] text-xs font-medium text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Live Margin Calculation Card */}
            <div className="p-3.5 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#565e74]">Estimated Gross Profit</span>
                <div className="text-lg font-black text-[#0b1c30]">
                  ₹{grossProfit}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#565e74]">Gross Margin</span>
                <div className="text-lg font-black text-[#15803d]">
                  {marginPercentage}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 4 cols */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Organization & Category */}
          <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-3">
            <h2 className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider">
              Category
            </h2>
            <div>
              <label className="block text-xs font-semibold text-[#565e74] mb-1">
                Store Collection
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#f8fafc] text-xs font-semibold text-[#0b1c30] border border-[#e2e8f0] focus:outline-none"
              >
                <option value="Mom & Baby">Mom &amp; Baby</option>
                <option value="Toys & Games">Toys &amp; Games</option>
                <option value="Home & Kitchen">Home &amp; Kitchen</option>
                <option value="Smart Gadgets">Smart Gadgets</option>
              </select>
            </div>
          </div>

          {/* Stock & SKU */}
          <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-3">
            <h2 className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider">
              Inventory &amp; SKU
            </h2>
            <div>
              <label className="block text-xs font-semibold text-[#565e74] mb-1">
                Available Stock Units
              </label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl bg-[#f8fafc] text-xs font-extrabold text-[#0b1c30] border border-[#e2e8f0] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#565e74] mb-1">
                SKU (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. KM-ELC-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#f8fafc] text-xs font-mono text-[#0b1c30] border border-[#e2e8f0] focus:outline-none"
              />
            </div>
          </div>

          {/* Badges & Trust Markers */}
          <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-3">
            <h2 className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider">
              Badges &amp; Display Options
            </h2>
            <div className="flex flex-col gap-2">
              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-[#f8fafc] cursor-pointer text-xs font-semibold text-[#0b1c30]">
                <span>Show Bestseller Badge</span>
                <input
                  type="checkbox"
                  checked={badgeBestseller}
                  onChange={(e) => setBadgeBestseller(e.target.checked)}
                  className="accent-[#f97316] w-4 h-4 rounded"
                />
              </label>
              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-[#f8fafc] cursor-pointer text-xs font-semibold text-[#0b1c30]">
                <span>Cash on Delivery Available</span>
                <input
                  type="checkbox"
                  checked={badgeCod}
                  onChange={(e) => setBadgeCod(e.target.checked)}
                  className="accent-[#f97316] w-4 h-4 rounded"
                />
              </label>
              <label className="flex items-center justify-between p-2 rounded-xl hover:bg-[#f8fafc] cursor-pointer text-xs font-semibold text-[#0b1c30]">
                <span>Featured on Homepage</span>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="accent-[#f97316] w-4 h-4 rounded"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* In-App Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-[#0b1c30]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e2e8f0] animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <Trash size={24} weight="Filled" />
            </div>
            <h3 className="text-base font-bold text-[#0b1c30]">
              Delete Product?
            </h3>
            <p className="text-xs text-[#565e74] mt-2 leading-relaxed">
              Are you sure you want to delete <strong className="text-[#0b1c30]">&ldquo;{title}&rdquo;</strong>? This will permanently remove it from your live storefront and database.
            </p>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#e2e8f0] text-xs font-bold text-[#565e74] hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteProduct}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/20 disabled:opacity-50 transition-colors"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

export default function AdminProductNewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12 text-xs text-[#565e74]">
          Loading product editor...
        </div>
      }
    >
      <AddProductForm />
    </Suspense>
  );
}
