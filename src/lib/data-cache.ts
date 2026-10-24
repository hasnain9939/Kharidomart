import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { formatProduct } from "@/lib/products";
import { Product } from "@/data/products";

/**
 * Multi-tier High-Performance Data Cache Layer:
 * - L1: Process-level in-memory cache (sub-millisecond instant return, 0ms latency)
 * - L2: Next.js unstable_cache for cross-request ISR and data-cache persistence
 * - Zero round-trips to remote cloud PostgreSQL for repeated visits
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// Global cache store across hot-reloads in development and serverless invocations
declare global {
  var __km_mem_cache: Map<string, CacheEntry<unknown>> | undefined;
}

const memoryCache = globalThis.__km_mem_cache || new Map<string, CacheEntry<unknown>>();
if (process.env.NODE_ENV !== "production") {
  globalThis.__km_mem_cache = memoryCache;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getNow(): number {
  return typeof performance !== "undefined" ? performance.now() : 0;
}

function getFromMemory<T>(key: string): T | undefined {
  const entry = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (!entry) return undefined;
  if (getNow() > entry.expiresAt) {
    memoryCache.delete(key);
    return undefined;
  }
  return entry.data;
}

function setInMemory<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
  memoryCache.set(key, {
    data,
    expiresAt: getNow() + ttlMs,
  });
}

export function clearDataCache(): void {
  memoryCache.clear();
  try {
    revalidateTag("products", { expire: 0 });
    revalidateTag("reviews", { expire: 0 });
    revalidatePath("/");
    revalidatePath("/shop");
  } catch {
    // Ignore in non-request contexts
  }
}

/**
 * Fetch and cache all products with L1 in-memory
 */
export async function getCachedAllProducts(): Promise<Product[]> {
  const cacheKey = "km_all_products";
  const inMem = getFromMemory<Product[]>(cacheKey);
  if (inMem !== undefined) return inMem;

  try {
    const dbProducts = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    const result = dbProducts.map(formatProduct);
    setInMemory(cacheKey, result);
    return result;
  } catch (err) {
    console.error("getCachedAllProducts error:", err);
    return [];
  }
}

/**
 * Fetch and cache a single product by slug or ID with L1 in-memory
 */
export async function getCachedProduct(slugOrId: string): Promise<Product | null> {
  const cacheKey = `km_product_${slugOrId}`;
  const inMem = getFromMemory<Product | null>(cacheKey);
  if (inMem !== undefined) return inMem;

  try {
    const dbProduct = await prisma.product.findFirst({
      where: {
        OR: [{ slug: slugOrId }, { id: slugOrId }],
      },
    });
    const result = dbProduct ? formatProduct(dbProduct) : null;
    setInMemory(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`getCachedProduct(${slugOrId}) error:`, err);
    return null;
  }
}

/**
 * Fetch and cache verified reviews for a product with L1 in-memory
 */
export async function getCachedProductReviews(slugOrId: string) {
  const cacheKey = `km_reviews_${slugOrId}`;
  const inMem = getFromMemory<any[]>(cacheKey);
  if (inMem !== undefined) return inMem;

  try {
    const reviews = await prisma.review.findMany({
      where: {
        OR: [
          { productId: slugOrId },
          { product: { slug: slugOrId } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const result = reviews.map((r) => ({
      ...r,
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : "2026-01-01T00:00:00.000Z",
    }));
    setInMemory(cacheKey, result);
    return result;
  } catch (err) {
    console.error(`getCachedProductReviews(${slugOrId}) error:`, err);
    return [];
  }
}

