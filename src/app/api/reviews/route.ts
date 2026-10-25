import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { clearDataCache } from "@/lib/data-cache";

// GET /api/reviews?productId=... or ?slug=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const slug = searchParams.get("slug");

    if (!productId && !slug) {
      return NextResponse.json(
        { success: false, error: "Please provide either productId or slug query parameter" },
        { status: 400 }
      );
    }

    let targetProductId = productId;

    // If only slug is provided, resolve productId
    if (!targetProductId && slug) {
      const product = await prisma.product.findUnique({
        where: { slug: slug.trim() },
        select: { id: true },
      });
      if (!product) {
        return NextResponse.json(
          { success: false, error: "Product not found" },
          { status: 404 }
        );
      }
      targetProductId = product.id;
    }

    const reviews = await prisma.review.findMany({
      where: { productId: targetProductId! },
      orderBy: { createdAt: "desc" },
    });

    const count = reviews.length;
    const averageRating =
      count > 0
        ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1))
        : 5.0;

    return NextResponse.json({
      success: true,
      productId: targetProductId,
      count,
      averageRating,
      reviews: reviews.map((r) => ({
        id: r.id,
        name: r.customerName,
        customerName: r.customerName,
        rating: r.rating,
        comment: r.comment,
        city: r.city || "Verified Buyer, India",
        verified: r.verified,
        date: new Date(r.createdAt).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        createdAt: r.createdAt,
      })),
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
      },
    });
  } catch (error: any) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch product reviews" },
      { status: 500 }
    );
  }
}

import { z } from "zod";

// Rate limiting: max 3 review submissions per IP per hour
const reviewIpRateLimit = new Map<string, { count: number; expiresAt: number }>();

const ReviewSubmissionSchema = z.object({
  productId: z.string().optional(),
  slug: z.string().optional(),
  customerName: z.string().optional(),
  name: z.string().optional(),
  rating: z.coerce.number().min(1).max(5).default(5),
  comment: z.string().min(5, "Review must be at least 5 characters long").max(1000),
  title: z.string().max(100).optional(),
  city: z.string().max(50).optional(),
});

// POST /api/reviews - submit a new customer review
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const now = Date.now();
    const rateRecord = reviewIpRateLimit.get(ip);
    if (rateRecord && rateRecord.expiresAt > now) {
      if (rateRecord.count >= 3) {
        return NextResponse.json(
          { success: false, error: "Too many review submissions. Please wait an hour before submitting another." },
          { status: 429 }
        );
      }
      rateRecord.count += 1;
    } else {
      reviewIpRateLimit.set(ip, { count: 1, expiresAt: now + 60 * 60 * 1000 });
    }

    const rawJson = await req.json().catch(() => ({}));
    const parseResult = ReviewSubmissionSchema.safeParse(rawJson);
    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, error: parseResult.error.issues[0]?.message || "Invalid review data" },
        { status: 400 }
      );
    }

    const { productId, slug, customerName, name, rating, comment, title, city } = parseResult.data;

    const authorName = (customerName || name || "").trim();
    if (!authorName) {
      return NextResponse.json(
        { success: false, error: "Please enter your name" },
        { status: 400 }
      );
    }

    const cleanRating = Math.min(5, Math.max(1, Math.round(Number(rating) || 5)));
    const cleanComment = comment.trim();

    // Combine optional headline/title with comment
    const finalComment = title && title.trim()
      ? `"${title.trim()}" - ${cleanComment}`
      : cleanComment;

    // Resolve target product
    let product = null;
    if (productId) {
      product = await prisma.product.findUnique({
        where: { id: String(productId).trim() },
        select: { id: true, title: true, rating: true, reviewsCount: true },
      });
    }

    if (!product && slug) {
      product = await prisma.product.findUnique({
        where: { slug: String(slug).trim() },
        select: { id: true, title: true, rating: true, reviewsCount: true },
      });
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found. Cannot attach review." },
        { status: 404 }
      );
    }

    // Unauthenticated public review submissions are set to verified: false
    const newReview = await prisma.review.create({
      data: {
        productId: product.id,
        customerName: authorName,
        rating: cleanRating,
        comment: finalComment,
        city: city ? city.trim() : "India",
        verified: false,
      },
    });

    // 2. Recompute product average rating & total reviews via database aggregate
    const agg = await prisma.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const totalCount = agg._count.rating;
    const computedAvg = agg._avg.rating ? Number(agg._avg.rating.toFixed(1)) : cleanRating;

    await prisma.product.update({
      where: { id: product.id },
      data: {
        rating: computedAvg,
        reviewsCount: totalCount,
      },
    });

    // Invalidate product memory cache so updated reviews reflect immediately
    clearDataCache();

    return NextResponse.json({
      success: true,
      message: "Thank you! Your review has been submitted for verification.",
      review: {
        id: newReview.id,
        name: newReview.customerName,
        customerName: newReview.customerName,
        rating: newReview.rating,
        comment: newReview.comment,
        city: newReview.city,
        verified: newReview.verified,
        date: "Just now",
        createdAt: newReview.createdAt,
      },
      product: {
        id: product.id,
        rating: computedAvg,
        reviewsCount: totalCount,
      },
    });
  } catch (error: unknown) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit review. Please try again later." },
      { status: 500 }
    );
  }
}
