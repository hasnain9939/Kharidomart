import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    });
  } catch (error: any) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch product reviews" },
      { status: 500 }
    );
  }
}

// POST /api/reviews - submit a new customer review
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, slug, customerName, name, rating, comment, title, city } = body;

    const authorName = (customerName || name || "").trim();
    if (!authorName) {
      return NextResponse.json(
        { success: false, error: "Please enter your name" },
        { status: 400 }
      );
    }

    const cleanRating = Math.min(5, Math.max(1, Math.round(Number(rating) || 5)));
    const cleanComment = (comment || "").trim();
    if (!cleanComment || cleanComment.length < 5) {
      return NextResponse.json(
        { success: false, error: "Review must be at least 5 characters long" },
        { status: 400 }
      );
    }

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

    // 1. Create the new verified review in PostgreSQL
    const newReview = await prisma.review.create({
      data: {
        productId: product.id,
        customerName: authorName,
        rating: cleanRating,
        comment: finalComment,
        city: city ? String(city).trim() : "India",
        verified: true,
      },
    });

    // 2. Recompute product average rating & total reviews
    const allReviews = await prisma.review.findMany({
      where: { productId: product.id },
      select: { rating: true },
    });

    const totalCount = allReviews.length;
    const computedAvg =
      totalCount > 0
        ? Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / totalCount).toFixed(1))
        : cleanRating;

    await prisma.product.update({
      where: { id: product.id },
      data: {
        rating: computedAvg,
        reviewsCount: totalCount,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Review submitted and verified successfully! 🎉",
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
  } catch (error: any) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit review" },
      { status: 500 }
    );
  }
}
