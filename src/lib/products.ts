import { Product } from "@/data/products";

// Safely parse JSON or return fallback
function safeJsonParse<T>(val: unknown, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val !== "string") {
    return (val as T) ?? fallback;
  }
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

/**
 * Formats a raw database Product record from Prisma into the frontend Product interface.
 * Consolidates JSON parsing for images, highlights, and specs with graceful fallbacks.
 */
export function formatProduct(dbProduct: any): Product {
  if (!dbProduct) {
    throw new Error("formatProduct: dbProduct cannot be null or undefined");
  }

  // Parse images safely
  const parsedImages = safeJsonParse<string[]>(dbProduct.images, []);
  const images = Array.isArray(parsedImages) && parsedImages.length > 0
    ? parsedImages
    : ["/assets/stitch/hero_showcase.jpg"];

  // Parse highlights safely
  const parsedHighlights = safeJsonParse<string[]>(dbProduct.highlights, []);
  const highlights = Array.isArray(parsedHighlights) ? parsedHighlights : [];

  // Parse specs safely (supports array or key-value object, checks both specs and specifications)
  const rawSpecs = dbProduct.specs ?? dbProduct.specifications;
  const parsedSpecs = safeJsonParse<any>(rawSpecs, []);
  let specs: { label: string; value: string }[] = [];
  if (Array.isArray(parsedSpecs)) {
    specs = parsedSpecs.map((s) => ({
      label: String(s?.label ?? ""),
      value: String(s?.value ?? ""),
    }));
  } else if (typeof parsedSpecs === "object" && parsedSpecs !== null) {
    specs = Object.entries(parsedSpecs).map(([label, value]) => ({
      label,
      value: String(value),
    }));
  }

  return {
    id: String(dbProduct.id),
    slug: String(dbProduct.slug),
    title: String(dbProduct.title),
    shortTitle: dbProduct.shortTitle ? String(dbProduct.shortTitle) : String(dbProduct.title),
    price: Number(dbProduct.price) || 0,
    originalPrice: Number(dbProduct.originalPrice) || Number(dbProduct.price) || 0,
    rating: Number(dbProduct.rating) || 5,
    reviewsCount: Number(dbProduct.reviewsCount) || 0,
    category: String(dbProduct.category || "General"),
    categorySlug: String(dbProduct.categorySlug || "general"),
    badge: dbProduct.badge ? String(dbProduct.badge) : undefined,
    stock: Number(dbProduct.stockCount ?? dbProduct.stock ?? 25),
    featured: Boolean(dbProduct.isFeatured ?? dbProduct.featured ?? false),
    images,
    videoUrl: dbProduct.videoUrl ? String(dbProduct.videoUrl) : specs.find((s) => s.label.toLowerCase() === "videourl" || s.label.toLowerCase() === "video")?.value || undefined,
    description: String(dbProduct.description || ""),
    highlights,
    specs,
    createdAt: dbProduct.createdAt ? new Date(dbProduct.createdAt).toISOString() : undefined,
    updatedAt: dbProduct.updatedAt ? new Date(dbProduct.updatedAt).toISOString() : undefined,
  };
}
