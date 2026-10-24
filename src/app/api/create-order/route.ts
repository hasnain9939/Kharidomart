import { NextRequest, NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
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
    const { amount, currency = "INR", receipt, notes } = body;

    // Determine amount in paise (minimum 100 paise = 1 INR)
    // If client passes amount in rupees (e.g. 499), convert to paise (49900).
    // If client explicitly passes amount in paise (already >= 100 and has isPaise flag, or amount > 1000000), handle properly.
    let amountInPaise: number;
    if (body.isPaise) {
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
