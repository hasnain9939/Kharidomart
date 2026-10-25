import { NextRequest, NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay";

const orderCreationRateLimit = new Map<string, { count: number; resetAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const now = Date.now();
    const rateRecord = orderCreationRateLimit.get(ip);
    if (rateRecord && rateRecord.resetAt > now) {
      if (rateRecord.count >= 30) {
        return NextResponse.json(
          { success: false, error: "Too many order requests. Please wait a moment." },
          { status: 429 }
        );
      }
      rateRecord.count += 1;
    } else {
      orderCreationRateLimit.set(ip, { count: 1, resetAt: now + 3600000 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || keyId.includes("YOUR_KEY_ID") || keySecret.includes("YOUR_KEY_SECRET")) {
      return NextResponse.json(
        {
          success: false,
          error: "Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env",
        },
        { status: 401 }
      );
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return NextResponse.json(
        { success: false, error: "Failed to initialize Razorpay client. Check credentials." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { amount, currency = "INR", receipt, notes, items, discountCode, paymentMethod } = body;

    let amountInPaise: number;

    // Server-Side Verification: If items are passed, recalculate totals from Prisma database
    if (Array.isArray(items) && items.length > 0) {
      const { prisma } = await import("@/lib/prisma");
      const pIds = items.map((i: any) => i.productId || i.id).filter(Boolean);
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: pIds } },
        select: { id: true, price: true },
      });
      const priceMap = new Map(dbProducts.map((p) => [p.id, p.price]));

      let computedSubtotal = 0;
      for (const item of items) {
        const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
        const pId = item.productId || item.id;
        // Database price strictly takes precedence over client-supplied price
        const itemPrice = priceMap.has(pId) ? priceMap.get(pId)! : Math.max(0, Number(item.price) || 0);
        computedSubtotal += itemPrice * qty;
      }

      let discountAmount = 0;
      if (discountCode && typeof discountCode === "string") {
        const cleanCode = discountCode.trim().toUpperCase();
        const dbDiscount = await prisma.discount.findUnique({ where: { code: cleanCode } });
        if (
          dbDiscount &&
          dbDiscount.active &&
          (!dbDiscount.expiresAt || new Date(dbDiscount.expiresAt) >= new Date())
        ) {
          if (computedSubtotal >= dbDiscount.minOrder) {
            discountAmount =
              dbDiscount.type === "fixed"
                ? dbDiscount.value
                : (computedSubtotal * dbDiscount.value) / 100;
            discountAmount = Math.min(computedSubtotal, Math.max(0, discountAmount));
          }
        }
      }

      const shippingFee = computedSubtotal >= 499 ? 0 : 79;
      const isUpi = String(paymentMethod || notes?.paymentType || "").toLowerCase().includes("upi");
      const upiDiscount = isUpi && computedSubtotal >= 299 ? 50 : 0;

      const serverGrandTotal = Math.max(1, computedSubtotal - discountAmount + shippingFee - upiDiscount);
      amountInPaise = Math.round(serverGrandTotal * 100);
    } else if (body.isPaise) {
      amountInPaise = Math.round(Number(amount));
    } else {
      // Standard Kharido Mart checkout passes Rupees: convert to paise
      amountInPaise = Math.round(Number(amount) * 100);
    }

    if (isNaN(amountInPaise) || amountInPaise < 100) {
      return NextResponse.json(
        {
          success: false,
          error: "Amount must be at least 100 paise (₹1.00).",
        },
        { status: 400 }
      );
    }

    const orderReceipt = receipt || `km_rcpt_${Date.now()}`;

    // Call Razorpay API to create the order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: currency || "INR",
      receipt: String(orderReceipt).substring(0, 40),
      notes: {
        store: "Kharido Mart",
        ...(notes || {}),
      },
    });

    return NextResponse.json({
      success: true,
      order_id: order.id,
      orderId: order.id, // compatibility
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
      keyId: keyId, // compatibility
    });
  } catch (error: any) {
    console.error("POST /api/create-order error:", error);

    // If Razorpay returns an auth error
    if (error?.statusCode === 401 || error?.error?.code === "BAD_REQUEST_ERROR_UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Razorpay authentication failed. Verify API Key ID and Secret." },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error?.error?.description || error?.message || "Failed to create Razorpay order.",
      },
      { status: 500 }
    );
  }
}
