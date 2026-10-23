import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatProduct } from "../route";

// GET /api/products/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        reviews: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product: {
        ...formatProduct(product),
        reviews: product.reviews,
      },
    });
  } catch (error: any) {
    console.error("GET /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.shortTitle !== undefined) updateData.shortTitle = body.shortTitle.trim();
    if (body.slug !== undefined) updateData.slug = body.slug.trim();
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.originalPrice !== undefined) updateData.originalPrice = parseFloat(body.originalPrice);
    if (body.category !== undefined) updateData.category = body.category.trim();
    if (body.categorySlug !== undefined) updateData.categorySlug = body.categorySlug.trim();
    if (body.badge !== undefined) updateData.badge = body.badge?.trim() || null;
    if (body.stock !== undefined) updateData.stock = parseInt(body.stock, 10);
    if (body.featured !== undefined) updateData.featured = Boolean(body.featured);
    if (body.description !== undefined) updateData.description = body.description;
    if (body.images !== undefined) {
      updateData.images = JSON.stringify(Array.isArray(body.images) ? body.images : [body.images]);
    }
    if (body.videoUrl !== undefined) {
      updateData.videoUrl = body.videoUrl?.trim() || null;
    }
    if (body.highlights !== undefined) {
      updateData.highlights = JSON.stringify(Array.isArray(body.highlights) ? body.highlights : []);
    }
    if (body.specs !== undefined) {
      updateData.specs = JSON.stringify(Array.isArray(body.specs) ? body.specs : []);
    }

    const updated = await prisma.product.update({
      where: { id: existing.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      product: formatProduct(updated),
    });
  } catch (error: any) {
    console.error("PUT /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    // Unlink any order items referencing this product to keep order history intact
    await prisma.orderItem.updateMany({
      where: { productId: existing.id },
      data: { productId: null },
    });

    // Clean up any reviews for this product
    await prisma.review.deleteMany({
      where: { productId: existing.id },
    });

    await prisma.product.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/products/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
