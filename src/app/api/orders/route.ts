import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSessionToken } from "@/lib/auth";
import { createDatabaseOrder } from "@/lib/orders";

// GET /api/orders - list orders (Admin gets all with filters, Customers scoped to their phone/email/userId)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const phone = searchParams.get("phone");
    const email = searchParams.get("email");
    const userId = searchParams.get("userId");

    const sessionCookie = req.cookies.get("km_admin_session")?.value;
    const isAdmin = Boolean(await verifyAdminSessionToken(sessionCookie));

    const where: any = {};

    if (isAdmin) {
      // Full administrative access with filters
      if (status && status !== "all") {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { orderNumber: { contains: search } },
          { customerName: { contains: search } },
          { customerPhone: { contains: search } },
          { customerEmail: { contains: search } },
          { city: { contains: search } },
        ];
      }
    } else {
      // Customer access: strictly isolate orders to caller's identity
      if (phone) {
        const cleanPhone = phone.trim().replace(/^\+91/, "").trim();
        where.OR = [
          { customerPhone: phone.trim() },
          { customerPhone: cleanPhone },
          { customerPhone: `+91 ${cleanPhone}` },
          { customerPhone: `+91${cleanPhone}` },
        ];
      } else if (email) {
        where.customerEmail = email.trim();
      } else if (userId) {
        where.userId = userId.trim();
      } else {
        // Unauthenticated and no customer identifier supplied -> empty response
        return NextResponse.json({
          success: true,
          count: 0,
          orders: [],
        });
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error: any) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// Rate limit order creation: max 20 orders per hour per IP
const orderRateLimit = new Map<string, { count: number; resetAt: number }>();

// POST /api/orders - create a real order on checkout
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const now = Date.now();
    const rateRecord = orderRateLimit.get(ip);
    if (rateRecord && rateRecord.resetAt > now) {
      if (rateRecord.count >= 20) {
        return NextResponse.json(
          { success: false, error: "Too many order requests. Please wait a moment." },
          { status: 429 }
        );
      }
      rateRecord.count += 1;
    } else {
      orderRateLimit.set(ip, { count: 1, resetAt: now + 3600000 });
    }

    const body = await req.json();

    const {
      userId,
      customer,
      address,
      items,
      paymentMethod = "COD",
      discountCode,
      subtotal = 0,
      discountAmount = 0,
      shippingFee = 0,
    } = body;

    if (!customer?.phone || String(customer.phone).replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    if (!address?.address || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required order information." },
        { status: 400 }
      );
    }

    const newOrder = await createDatabaseOrder({
      userId,
      customer,
      address,
      items,
      paymentMethod,
      discountCode,
      subtotal,
      discountAmount,
      shippingFee,
    });

    return NextResponse.json(
      {
        success: true,
        order: newOrder,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
