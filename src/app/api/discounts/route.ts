import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSessionToken } from "@/lib/auth";

const DEFAULT_SEED_DISCOUNTS = [
  {
    code: "MOMFIRST",
    type: "percentage",
    value: 15,
    minOrder: 499,
    description: "15% Welcome Discount for New Moms",
    active: true,
  },
  {
    code: "FIRST10",
    type: "percentage",
    value: 10,
    minOrder: 299,
    description: "10% Off on First Order",
    active: true,
  },
  {
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    minOrder: 399,
    description: "Welcome 10% Off Pan-India",
    active: true,
  },
  {
    code: "PREPAID50",
    type: "fixed",
    value: 50,
    minOrder: 499,
    description: "₹50 Instant Discount on Prepaid UPI Orders",
    active: true,
  },
  {
    code: "FREESHIP",
    type: "fixed",
    value: 49,
    minOrder: 0,
    description: "Free Express Shipping Across India",
    active: true,
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const codeQuery = searchParams.get("code")?.trim().toUpperCase();

    // Specific coupon lookup for checkout validation
    if (codeQuery) {
      const discount = await prisma.discount.findUnique({
        where: { code: codeQuery },
      });

      if (!discount || !discount.active) {
        return NextResponse.json(
          { success: false, error: "Invalid or inactive coupon code" },
          { status: 404 }
        );
      }

      if (discount.expiresAt && new Date(discount.expiresAt) < new Date()) {
        return NextResponse.json(
          { success: false, error: "This coupon code has expired" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        discount: {
          code: discount.code,
          type: discount.type,
          value: discount.value,
          minOrder: discount.minOrder,
          description: discount.description,
        },
      });
    }

    // List all discounts for admin marketing overview
    let discounts = await prisma.discount.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Auto-seed initial defaults if table is freshly created
    if (discounts.length === 0) {
      for (const d of DEFAULT_SEED_DISCOUNTS) {
        await prisma.discount.create({
          data: d,
        });
      }
      discounts = await prisma.discount.findMany({
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({
      success: true,
      discounts,
    });
  } catch (err: any) {
    console.error("Failed to query discounts:", err);
    return NextResponse.json(
      { success: false, error: "Failed to query discounts" },
      { status: 500 }
    );
  }
}

// POST /api/discounts (Admin only)
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
    const { code, type, value, minOrder, description, expiresAt, active } = body;

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json(
        { success: false, error: "Coupon code is required" },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    const numValue = Number(value);

    if (isNaN(numValue) || numValue <= 0) {
      return NextResponse.json(
        { success: false, error: "Discount value must be greater than 0" },
        { status: 400 }
      );
    }

    const existing = await prisma.discount.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Coupon code '${cleanCode}' already exists.` },
        { status: 409 }
      );
    }

    const newDiscount = await prisma.discount.create({
      data: {
        code: cleanCode,
        type: type === "fixed" ? "fixed" : "percentage",
        value: numValue,
        minOrder: minOrder ? Number(minOrder) : 0,
        description: description || `${numValue}${type === "fixed" ? "₹" : "%"} Off`,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    return NextResponse.json({
      success: true,
      discount: newDiscount,
    });
  } catch (err: any) {
    console.error("Failed to create discount:", err);
    return NextResponse.json(
      { success: false, error: "Failed to create discount coupon" },
      { status: 500 }
    );
  }
}
