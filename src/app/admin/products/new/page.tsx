"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
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
  Upload,
  Clock,
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

  // Color Finish Variants
  interface ColorOption {
    name: string;
    hex: string;
    label: string;
  }
  const [colors, setColors] = useState<ColorOption[]>([]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#B8E2D8");
  const [newColorLabel, setNewColorLabel] = useState("");

  // Custom Dispatch & Delivery Timing
  const [dispatchTime, setDispatchTime] = useState("24–48 hrs");
  const [dispatchCutoff, setDispatchCutoff] = useState("5:00 PM");

  const handleAddColor = () => {
    if (!newColorName.trim()) {
      alert("Please enter a color name (e.g. Pastel Mint Green)");
      return;
    }
    const colorToAdd: ColorOption = {
      name: newColorName.trim(),
      hex: newColorHex.trim() || "#B8E2D8",
      label: newColorLabel.trim() || newColorName.trim(),
    };
    setColors((prev) => [...prev, colorToAdd]);
    setNewColorName("");
    setNewColorLabel("");
    setNewColorHex("#B8E2D8");
  };

  const handleRemoveColor = (indexToRemove: number) => {
    setColors((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleLoadColorPreset = (presetType: "baby" | "neutral" | "vibrant") => {
    if (presetType === "baby") {
      setColors([
        { name: "Pastel Mint Green", hex: "#B8E2D8", label: "Pastel Mint (Most Popular)" },
        { name: "Soft Blush Pink", hex: "#F7C6D0", label: "Blush Pink" },
        { name: "Cloud White", hex: "#FAFAFC", label: "Cloud White" },
      ]);
    } else if (presetType === "neutral") {
      setColors([
        { name: "Matte Black", hex: "#1C1917", label: "Matte Black" },
        { name: "Crisp White", hex: "#FFFFFF", label: "Crisp White" },
        { name: "Slate Grey", hex: "#94A3B8", label: "Slate Grey" },
      ]);
    } else if (presetType === "vibrant") {
      setColors([
        { name: "Ocean Blue", hex: "#0284C7", label: "Ocean Blue" },
        { name: "Crimson Red", hex: "#DC2626", label: "Crimson Red" },
        { name: "Sunshine Yellow", hex: "#EAB308", label: "Sunshine Yellow" },
      ]);
    }
  };

  // Trust badges
  const [badgeBestseller, setBadgeBestseller] = useState(true);
  const [badgeCod, setBadgeCod] = useState(true);
  const [featured, setFeatured] = useState(true);

  const [copiedSlug, setCopiedSlug] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Local File Upload Refs & States
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const uploadFileToServer = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        return data.url;
      }
      if (data.error) {
        console.warn("Upload API error:", data.error);
      }
    } catch (err) {
      console.warn("Upload endpoint failed, falling back to base64 Data URL", err);
    }

    // Client-side fallback to Data URL (works 100% reliably in any environment)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const handleMainFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingMain(true);
    try {
      const url = await uploadFileToServer(file);
      setImageUrl(url);
      setToastMessage(`Cover image "${file.name}" uploaded! 📸`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert("Failed to upload image: " + err.message);
    } finally {
      setUploadingMain(false);
      if (mainFileInputRef.current) mainFileInputRef.current.value = "";
    }
  };

  const handleGalleryFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingGallery(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const url = await uploadFileToServer(file);
        uploadedUrls.push(url);
      }
      setGalleryImages((prev) => [...prev.filter(Boolean), ...uploadedUrls]);
      setToastMessage(`${uploadedUrls.length} gallery image${uploadedUrls.length > 1 ? "s" : ""} uploaded! ✨`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert("Failed to upload gallery images: " + err.message);
    } finally {
      setUploadingGallery(false);
      if (galleryFileInputRef.current) galleryFileInputRef.current.value = "";
    }
  };

  const handleVideoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const url = await uploadFileToServer(file);
      setVideoUrl(url);
      setToastMessage(`Video "${file.name}" uploaded! 🎬`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err: any) {
      alert("Failed to upload video: " + err.message);
    } finally {
      setUploadingVideo(false);
      if (videoFileInputRef.current) videoFileInputRef.current.value = "";
    }
  };

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
          if (p.colors && Array.isArray(p.colors) && p.colors.length > 0) {
            setColors(p.colors);
          } else if (Array.isArray(p.specs)) {
            const colorSpec = p.specs.find((s: any) => s.label?.toLowerCase() === "colors" || s.label?.toLowerCase() === "colorvariants");
            if (colorSpec) {
              try {
                const parsed = JSON.parse(colorSpec.value);
                if (Array.isArray(parsed)) setColors(parsed);
              } catch {
                // ignore
              }
            }
          }
          if (p.dispatchTime) {
            setDispatchTime(p.dispatchTime);
          } else if (Array.isArray(p.specs)) {
            const dtSpec = p.specs.find((s: any) => s.label?.toLowerCase() === "dispatch time");
            if (dtSpec) setDispatchTime(dtSpec.value);
          }
          if (p.dispatchCutoff) {
            setDispatchCutoff(p.dispatchCutoff);
          } else if (Array.isArray(p.specs)) {
            const dcSpec = p.specs.find((s: any) => s.label?.toLowerCase() === "dispatch cutoff");
            if (dcSpec) setDispatchCutoff(dcSpec.value);
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
          "Cash on Delivery & 24-Hour Replacement Support",
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
            { label: "Warranty", value: "24-Hour Replacement Guarantee" },
            { label: "MRP Declaration", value: "Inclusive of all Taxes" },
            ...(colors.length > 0 ? [{ label: "Colors", value: JSON.stringify(colors) }] : []),
            { label: "Dispatch Time", value: dispatchTime.trim() || "24–48 hrs" },
            { label: "Dispatch Cutoff", value: dispatchCutoff.trim() || "5:00 PM" },
          ],
          colors: colors.length > 0 ? colors : undefined,
          dispatchTime: dispatchTime.trim() || "24–48 hrs",
          dispatchCutoff: dispatchCutoff.trim() || "5:00 PM",
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
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-5">
            {/* Hidden native file pickers */}
            <input
              ref={mainFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleMainFileChange}
            />
            <input
              ref={galleryFileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleGalleryFilesChange}
            />

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-4 rounded-full bg-[#f97316]"></span>
                  Product Images
                </h2>
                <p className="text-[11px] text-[#565e74] mt-0.5">
                  Upload directly from your computer/device or paste an image link.
                </p>
              </div>
              <button
                type="button"
                onClick={() => mainFileInputRef.current?.click()}
                disabled={uploadingMain}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#ea580c] text-xs font-bold transition-all cursor-pointer border border-orange-200"
              >
                <Upload size={14} weight="Outline" />
                <span>{uploadingMain ? "Uploading..." : "Upload from Device"}</span>
              </button>
            </div>

            {/* Main Cover Image Uploader & Dropzone */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#0b1c30]">
                  Main Cover Image <span className="text-[#ef4444]">*</span>
                </label>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => mainFileInputRef.current?.click()}
                    className="text-[11px] font-bold text-[#ea580c] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Change / Replace photo
                  </button>
                )}
              </div>

              {imageUrl ? (
                <div className="relative p-4 rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-white border border-[#e2e8f0] shrink-0 shadow-xs">
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
                        Cover Image Active
                      </span>
                      <span className="text-[11px] text-[#565e74] truncate">
                        {imageUrl.startsWith("data:") ? "Uploaded local image file" : imageUrl}
                      </span>
                    </div>
                    <p className="text-xs text-[#565e74] mt-1.5">
                      This primary image is displayed on the storefront catalog, search results, and hero section.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        type="button"
                        onClick={() => mainFileInputRef.current?.click()}
                        disabled={uploadingMain}
                        className="px-3 py-1.5 rounded-lg bg-white border border-[#e2e8f0] text-[#0b1c30] text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        {uploadingMain ? "Uploading..." : "Upload New File"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="px-3 py-1.5 rounded-lg bg-white border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => mainFileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith("image/")) {
                      const pseudoEvent = { target: { files: [file] } } as any;
                      handleMainFileChange(pseudoEvent);
                    }
                  }}
                  className="p-8 rounded-2xl border-2 border-dashed border-[#fed7aa] hover:border-[#f97316] bg-orange-50/20 hover:bg-orange-50/40 text-center flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 rounded-full bg-orange-100/70 text-[#ea580c] flex items-center justify-center group-hover:scale-105 transition-transform">
                    {uploadingMain ? (
                      <div className="w-5 h-5 border-2 border-[#ea580c] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload size={22} weight="Outline" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#0b1c30]">
                      {uploadingMain ? "Uploading cover image..." : "Click to select a photo from your computer / device"}
                    </p>
                    <p className="text-[11px] text-[#565e74] mt-0.5">
                      or drag & drop your image file here (PNG, JPG, WEBP)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      mainFileInputRef.current?.click();
                    }}
                    disabled={uploadingMain}
                    className="mt-1 px-4 py-2 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    📁 Browse Local Files
                  </button>
                </div>
              )}

              {/* Or paste link option */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[#565e74] shrink-0">Or enter image URL:</span>
                <input
                  type="text"
                  value={imageUrl.startsWith("data:") ? "" : imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or /assets/..."
                  className="flex-1 h-8 px-3 rounded-lg bg-[#f8fafc] text-xs text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none font-mono"
                />
              </div>
            </div>

            {/* Additional Gallery Images */}
            <div className="pt-3 border-t border-[#f1f5f9] flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-[#0b1c30]">
                    Additional Gallery Images (Optional)
                  </span>
                  <p className="text-[11px] text-[#565e74]">
                    Add extra angles, close-ups, or unboxing photos.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => galleryFileInputRef.current?.click()}
                    disabled={uploadingGallery}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#ea580c] text-xs font-bold transition-colors cursor-pointer border border-orange-200"
                  >
                    <Upload size={13} weight="Outline" />
                    <span>{uploadingGallery ? "Uploading..." : "Upload Photos"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryImages([...galleryImages, ""])}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0b1c30] text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Add size={13} weight="Outline" />
                    <span>Add by URL</span>
                  </button>
                </div>
              </div>

              {galleryImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-1">
                  {galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-[#e2e8f0] shadow-xs"
                    >
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={img}
                          alt={`Gallery photo ${idx + 2}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                          <input
                            type="text"
                            placeholder="URL..."
                            value={img}
                            onChange={(e) => {
                              const updated = [...galleryImages];
                              updated[idx] = e.target.value;
                              setGalleryImages(updated);
                            }}
                            className="w-full text-[10px] p-1 bg-white border border-[#e2e8f0] rounded"
                          />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setGalleryImages(galleryImages.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-600/90 text-white flex items-center justify-center opacity-80 group-hover:opacity-100 hover:scale-110 transition-all cursor-pointer shadow-sm"
                        title="Remove image"
                      >
                        <CloseCircle size={14} weight="Filled" />
                      </button>
                      <span className="absolute bottom-1 left-1.5 text-[9px] font-bold font-mono px-1 rounded bg-black/60 text-white">
                        #{idx + 2}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 3. Product Video Section */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-4">
            {/* Hidden native video file picker */}
            <input
              ref={videoFileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.mov,.mkv"
              className="hidden"
              onChange={handleVideoFileChange}
            />

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-4 rounded-full bg-[#15803d]"></span>
                  Product Video (Optional)
                </h2>
                <p className="text-[11px] text-[#565e74] mt-0.5">
                  Upload a video from your computer or paste a YouTube / Vimeo link.
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#15803d] bg-[#f0fdf4] px-2.5 py-0.5 rounded-full border border-[#bbf7d0]">
                Interactive Video Player
              </span>
            </div>

            {/* Video Upload or Link Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <button
                type="button"
                onClick={() => videoFileInputRef.current?.click()}
                disabled={uploadingVideo}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#15803d] text-xs font-bold transition-all cursor-pointer border border-emerald-200 shrink-0"
              >
                {uploadingVideo ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#15803d] border-t-transparent rounded-full animate-spin" />
                    <span>Uploading Video...</span>
                  </>
                ) : (
                  <>
                    <Upload size={14} weight="Outline" />
                    <span>📁 Upload Video File (.mp4, .webm)</span>
                  </>
                )}
              </button>

              <div className="relative flex-1 flex items-center">
                <input
                  type="text"
                  value={videoUrl.startsWith("data:") ? "" : videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Or paste YouTube, Shorts, Vimeo, or .mp4 link"
                  className="w-full h-10 px-3.5 rounded-xl bg-[#f8fafc] text-xs text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none font-mono transition-all"
                />
                {videoUrl && (
                  <button
                    type="button"
                    onClick={() => setVideoUrl("")}
                    className="absolute right-1.5 h-7 px-2.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-[#565e74] text-xs font-bold transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Video Live Preview */}
            {videoUrl ? (
              <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0b1c30] flex items-center gap-1.5">
                    <VideoPlay size={15} weight="Filled" className="text-[#ea580c]" />
                    Live Video Player Preview
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#565e74] truncate max-w-xs">
                      {videoUrl.startsWith("data:") ? "Uploaded local video file" : videoUrl}
                    </span>
                    <button
                      type="button"
                      onClick={() => setVideoUrl("")}
                      className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
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
              <div
                onClick={() => videoFileInputRef.current?.click()}
                className="p-6 rounded-2xl border-2 border-dashed border-[#e2e8f0] hover:border-emerald-400 bg-[#f8fafc] hover:bg-emerald-50/20 text-center flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#15803d] flex items-center justify-center">
                  <VideoPlay size={20} weight="Outline" />
                </div>
                <p className="text-xs font-bold text-[#0b1c30]">
                  Click to choose a video file from your computer or paste a link above
                </p>
                <p className="text-[11px] text-[#565e74]">
                  Supports MP4, WebM, MOV, or YouTube/Shorts/Vimeo links.
                </p>
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

          {/* 4. Color Variants & Finishes */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-4 rounded-full bg-[#f97316]"></span>
                  Color Variants &amp; Finishes (Optional)
                </h2>
                <p className="text-[11px] text-[#565e74] mt-0.5">
                  Configure selectable color options (like Pastel Mint, Blush Pink) displayed on the live product page.
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-[#565e74] uppercase tracking-wider">Presets:</span>
                <button
                  type="button"
                  onClick={() => handleLoadColorPreset("baby")}
                  className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#ea580c] text-[11px] font-bold transition-colors cursor-pointer border border-orange-200"
                >
                  👶 Baby Pastels
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadColorPreset("neutral")}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0b1c30] text-[11px] font-bold transition-colors cursor-pointer"
                >
                  🖤 Neutrals
                </button>
                {colors.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setColors([])}
                    className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Configured Colors List & Live Preview */}
            {colors.length > 0 ? (
              <div className="flex flex-col gap-3">
                <div className="p-4 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                  <span className="text-[11px] font-bold text-[#565e74] uppercase tracking-wider block mb-2">
                    Active Color Variants ({colors.length}):
                  </span>
                  <div className="flex items-center flex-wrap gap-2.5">
                    {colors.map((c, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#e2e8f0] shadow-xs text-xs"
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-black/15 shadow-inner shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="font-bold text-[#0b1c30]">{c.name}</span>
                        {c.label && c.label !== c.name && (
                          <span className="text-[10px] text-[#ea580c] font-semibold bg-orange-50 px-1.5 py-0.5 rounded">
                            {c.label}
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-[#565e74]">{c.hex}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(idx)}
                          className="w-5 h-5 rounded-full hover:bg-red-50 text-red-500 flex items-center justify-center transition-colors cursor-pointer ml-1"
                          title="Remove color"
                        >
                          <CloseCircle size={14} weight="Filled" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Customer View Simulation Preview */}
                <div className="p-3.5 rounded-xl bg-[#fffaf5] border border-[#fed7aa]/60">
                  <span className="text-[11px] font-bold text-[#ea580c] uppercase tracking-wider block mb-2">
                    Customer Product Page Preview:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {colors.map((c, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                          idx === 0
                            ? "border-[#f97316] bg-orange-50/50 shadow-xs"
                            : "border-[#e2e8f0] bg-white"
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-[#0b1c30]">{c.label || c.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#f8fafc] border border-dashed border-[#cbd5e1] text-center">
                <p className="text-xs font-semibold text-[#565e74]">
                  No color variants added yet.
                </p>
                <p className="text-[11px] text-[#94a3b8] mt-0.5">
                  If left empty, the color finish selector will be hidden on the product page. Use the form below or pick a preset to add color finishes.
                </p>
              </div>
            )}

            {/* Add New Color Form */}
            <div className="pt-3 border-t border-[#f1f5f9]">
              <span className="text-xs font-bold text-[#0b1c30] block mb-2">
                Add a Color Option:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                <div className="sm:col-span-4">
                  <label className="block text-[11px] font-semibold text-[#565e74] mb-1">
                    Color Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pastel Mint Green"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-[#f8fafc] text-xs text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-[#565e74] mb-1">
                    Color Swatch
                  </label>
                  <div className="flex items-center gap-1.5 h-9 px-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-6 h-6 rounded-md border-0 p-0 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      placeholder="#B8E2D8"
                      className="w-full bg-transparent text-xs font-mono text-[#0b1c30] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-[#565e74] mb-1">
                    Button Label (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pastel Mint (Most Popular)"
                    value={newColorLabel}
                    onChange={(e) => setNewColorLabel(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl bg-[#f8fafc] text-xs text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="w-full h-9 px-3 rounded-xl bg-[#f97316] hover:bg-[#ea580c] active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-1 shadow-xs transition-all cursor-pointer"
                  >
                    <Add size={14} weight="Outline" />
                    <span>Add Color</span>
                  </button>
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

          {/* Shipping & Dispatch Timing */}
          <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#0b1c30] uppercase tracking-wider flex items-center gap-1.5">
                <TruckFast size={15} weight="Filled" className="text-[#f97316]" />
                Dispatch &amp; Delivery Timing
              </h2>
              <span className="text-[10px] font-bold text-[#15803d] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live on Store
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#565e74]">
                  Dispatch Lead Time
                </label>
                <span className="text-[10px] text-[#94a3b8]">Shown beside truck icon</span>
              </div>
              <input
                type="text"
                value={dispatchTime}
                onChange={(e) => setDispatchTime(e.target.value)}
                placeholder="e.g. 24–48 hrs, Same-Day Dispatch, 1–2 Days"
                className="w-full h-10 px-3 rounded-xl bg-[#f8fafc] text-xs font-bold text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none"
              />
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {["24–48 hrs", "Same-Day Dispatch", "1–2 Days", "2–3 Days"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDispatchTime(preset)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                      dispatchTime === preset
                        ? "bg-orange-50 border-orange-200 text-[#ea580c]"
                        : "bg-slate-50 border-slate-200 text-[#565e74] hover:bg-slate-100"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#565e74]">
                  Same-Day Dispatch Cutoff
                </label>
                <span className="text-[10px] text-[#94a3b8]">Countdown cutoff time</span>
              </div>
              <input
                type="text"
                value={dispatchCutoff}
                onChange={(e) => setDispatchCutoff(e.target.value)}
                placeholder="e.g. 5:00 PM, 2:00 PM, 6:00 PM"
                className="w-full h-10 px-3 rounded-xl bg-[#f8fafc] text-xs font-bold text-[#0b1c30] border border-[#e2e8f0] focus:border-[#f97316] focus:bg-white focus:outline-none"
              />
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                {["5:00 PM", "2:00 PM", "4:00 PM", "6:00 PM"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDispatchCutoff(preset)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-colors cursor-pointer ${
                      dispatchCutoff === preset
                        ? "bg-orange-50 border-orange-200 text-[#ea580c]"
                        : "bg-slate-50 border-slate-200 text-[#565e74] hover:bg-slate-100"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Store Preview of Dispatch info */}
            <div className="p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs space-y-2 mt-1">
              <div className="flex items-center gap-2 text-[#584237]">
                <TruckFast size={14} weight="Filled" className="text-[#f97316] shrink-0" />
                <span>
                  Dispatches in <strong className="text-[#0b1c30]">{dispatchTime || "24–48 hrs"}</strong> with WhatsApp tracking
                </span>
              </div>
              <div className="flex items-center gap-2 text-[#2b1f1a] pt-1.5 border-t border-[#e2e8f0]/60">
                <Clock size={14} weight="Filled" className="text-[#e06b5b] shrink-0" />
                <span>
                  Cutoff: <strong className="text-[#e06b5b]">{dispatchCutoff || "5:00 PM"}</strong> (Countdown active)
                </span>
              </div>
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
