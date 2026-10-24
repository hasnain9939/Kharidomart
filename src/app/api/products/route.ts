import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatProduct } from "@/lib/products";
import { verifyAdminSessionToken } from "@/lib/auth";

export { formatProduct };

// GET /api/products
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const featured = searchParams.get("featured");

    const where: any = {};

    if (category && category !== "all") {
      where.categorySlug = category;
    }

    if (featured === "true") {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { category: { contains: search } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: products.length,
      products: products.map(formatProduct),
    });
  } catch (error: any) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// POST /api/products (Admin only)
export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("km_admin_session")?.value;
    if (!(await verifyAdminSessionToken(sessionCookie))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Administrator access required" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      title,
      shortTitle,
      slug,
      price,
      originalPrice,
      category,
      categorySlug,
      badge,
      stock = 0,
      featured = false,
      images = [],
      videoUrl,
      description,
      highlights = [],
      specs = [],
    } = body;

    if (!title || !price || !category) {
      return NextResponse.json(
        { success: false, error: "Title, price, and category are required." },
        { status: 400 }
      );
    }

    // Auto-generate slug if not provided
    const cleanSlug =
      slug?.trim() ||
      title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

    const newProduct = await prisma.product.create({
      data: {
        title: title.trim(),
        shortTitle: shortTitle?.trim() || title.trim(),
        slug: cleanSlug,
        price: parseFloat(price),
        originalPrice: parseFloat(originalPrice || price),
        category: category.trim(),
        categorySlug: categorySlug?.trim() || category.toLowerCase().replace(/\s+/g, "-"),
        badge: badge?.trim() || null,
        stock: parseInt(stock, 10) || 0,
        featured: Boolean(featured),
        images: JSON.stringify(Array.isArray(images) ? images : [images]),
        videoUrl: videoUrl?.trim() || null,
        description: description || "",
        highlights: JSON.stringify(Array.isArray(highlights) ? highlights : []),
        specs: JSON.stringify(Array.isArray(specs) ? specs : []),
      },
    });

    return NextResponse.json(
      { success: true, product: formatProduct(newProduct) },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/products error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "A product with this slug already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
