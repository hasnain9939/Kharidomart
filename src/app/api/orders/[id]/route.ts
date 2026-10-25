import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSessionToken, verifyUserSessionToken } from "@/lib/session";

// In-memory rate limiting
// Per IP: max 15 requests per 10 minutes
const trackIpRateLimits = new Map<string, { count: number; expiresAt: number }>();
// Per order ID: max 6 requests per 10 minutes
const trackOrderRateLimits = new Map<string, { count: number; expiresAt: number }>();

async function enforceConstantTime(startTime: number, targetMs = 300) {
  const elapsed = Date.now() - startTime;
  if (elapsed < targetMs) {
    await new Promise((resolve) => setTimeout(resolve, targetMs - elapsed));
  }
}

// GET /api/orders/[id] - Secure track order
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const now = Date.now();

  try {
    const { id } = await params;
    const cleanId = (id || "").trim();

    // 1. IP Rate Limiting Check
    const ipRecord = trackIpRateLimits.get(ip);
    if (ipRecord && ipRecord.expiresAt > now) {
      if (ipRecord.count >= 15) {
        await enforceConstantTime(startTime, 300);
        return NextResponse.json(
          { success: false, error: "Too many tracking attempts. Please wait 10 minutes before trying again." },
          { status: 429 }
        );
      }
      ipRecord.count += 1;
    } else {
      trackIpRateLimits.set(ip, { count: 1, expiresAt: now + 10 * 60 * 1000 });
    }

    // 2. Order Number Rate Limiting Check
    const orderRecord = trackOrderRateLimits.get(cleanId);
    if (orderRecord && orderRecord.expiresAt > now) {
      if (orderRecord.count >= 6) {
        await enforceConstantTime(startTime, 300);
        return NextResponse.json(
          { success: false, error: "Too many requests for this order number. Please wait a few minutes." },
          { status: 429 }
        );
      }
      orderRecord.count += 1;
    } else {
      trackOrderRateLimits.set(cleanId, { count: 1, expiresAt: now + 10 * 60 * 1000 });
    }

    const { searchParams } = new URL(req.url);
    const contactParam = (searchParams.get("contact") || searchParams.get("phone") || searchParams.get("email") || "").trim().toLowerCase();

    // 3. Check for Admin or User Session
    const adminSessionCookie = req.cookies.get("km_admin_session")?.value;
    const userSessionCookie = req.cookies.get("km_user_session")?.value;

    const [admin, userSession] = await Promise.all([
      verifyAdminSessionToken(adminSessionCookie),
      verifyUserSessionToken(userSessionCookie),
    ]);

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { orderNumber: cleanId },
        ],
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const genericNotFound = {
      success: false,
      error: "No order matching the provided Order Number and Phone/Email was found. Please verify your details.",
    };

    // If order is not found, delay and return generic error
    if (!order) {
      await enforceConstantTime(startTime, 300);
      return NextResponse.json(genericNotFound, { status: 404 });
    }

    // Admin has full authorized access
    if (admin) {
      await enforceConstantTime(startTime, 300);
      return NextResponse.json({ success: true, order });
    }

    // Authenticated user owns the order
    const isOwner =
      userSession &&
      ((order.userId && userSession.userId === order.userId) ||
        (order.customerEmail && userSession.email.toLowerCase() === order.customerEmail.toLowerCase()));

    if (isOwner) {
      await enforceConstantTime(startTime, 300);
      return NextResponse.json({ success: true, order });
    }

    // Guest / Public Tracking: Requires Order Number AND matching Phone or Email
    if (!contactParam) {
      await enforceConstantTime(startTime, 300);
      return NextResponse.json(
        {
          success: false,
          error: "To protect customer privacy, both Order Number and matching Phone Number/Email are required to track an order.",
        },
        { status: 400 }
      );
    }

    const cleanInputDigits = contactParam.replace(/\D/g, "");
    const cleanOrderDigits = (order.customerPhone || "").replace(/\D/g, "");
    const isPhoneMatch =
      cleanInputDigits.length >= 10 &&
      cleanOrderDigits.length >= 10 &&
      cleanOrderDigits.endsWith(cleanInputDigits.slice(-10));

    const isEmailMatch =
      order.customerEmail &&
      contactParam.includes("@") &&
      order.customerEmail.toLowerCase() === contactParam;

    if (!isPhoneMatch && !isEmailMatch) {
      // Intentionally return the EXACT same error message and status code to prevent order enumeration
      await enforceConstantTime(startTime, 300);
      return NextResponse.json(genericNotFound, { status: 404 });
    }

    // Valid credential match: Return MINIMAL fields only (Zero PII: no customer name, address, full phone, email)
    await enforceConstantTime(startTime, 300);
    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt,
        courier: order.courier,
        awbNumber: order.awbNumber,
        trackingUrl: order.awbNumber
          ? `https://shiprocket.co/tracking/${encodeURIComponent(order.awbNumber)}`
          : null,
        items: order.items.map((it) => ({
          id: it.id,
          title: it.title,
          quantity: it.quantity,
          price: it.price,
          image: it.image,
        })),
        total: order.total,
        subtotal: order.subtotal,
        discountAmount: order.discountAmount,
        paymentMethod: order.paymentMethod,
      },
    });
  } catch (error: unknown) {
    console.error("GET /api/orders/[id] error:", error);
    await enforceConstantTime(startTime, 300);
    return NextResponse.json(
      { success: false, error: "Unable to retrieve order details. Please try again later." },
      { status: 500 }
    );
  }
}


// PUT /api/orders/[id] - update order status, courier, or tracking (Admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionCookie = req.cookies.get("km_admin_session")?.value;
    if (!(await verifyAdminSessionToken(sessionCookie))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Administrator access required" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.courier !== undefined) updateData.courier = body.courier;
    if (body.awbNumber !== undefined) updateData.awbNumber = body.awbNumber;

    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: updateData,
      include: { items: true },
    });

    return NextResponse.json({
      success: true,
      order: updated,
    });
  } catch (error: any) {
    console.error("PUT /api/orders/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order" },
      { status: 500 }
    );
  }
}
