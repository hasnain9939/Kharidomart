import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createDatabaseOrder } from "@/lib/orders";

export async function POST(req: NextRequest) {
  try {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret || keySecret.includes("YOUR_KEY_SECRET")) {
      return NextResponse.json(
        { success: false, error: "Server RAZORPAY_KEY_SECRET is not configured." },
        { status: 500 }
      );
    }

    const body = await req.json();

    // Support both Razorpay callback naming conventions
    const orderId = body.razorpay_order_id || body.order_id;
    const paymentId = body.razorpay_payment_id || body.payment_id;
    const signature = body.razorpay_signature || body.signature;

    // Validate required fields
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: order_id, payment_id, or signature.",
        },
        { status: 400 }
      );
    }

    // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const expectedBuf = Buffer.from(expectedSignature, "utf-8");
    const receivedBuf = Buffer.from(String(signature), "utf-8");
    const isSignatureValid =
      expectedBuf.length === receivedBuf.length &&
      crypto.timingSafeEqual(expectedBuf, receivedBuf);

    if (!isSignatureValid) {
      console.error("Razorpay signature verification failed");
      return NextResponse.json(
        {
          success: false,
          error: "Signature mismatch. Payment verification failed.",
        },
        { status: 400 }
      );
    }

    // If checkout order payload is included, create the confirmed order in the database
    let createdOrder = null;
    if (body.customer && body.address && Array.isArray(body.items) && body.items.length > 0) {
      createdOrder = await createDatabaseOrder({
        userId: body.userId,
        customer: body.customer,
        address: body.address,
        items: body.items,
        paymentMethod: body.paymentMethod || "UPI",
        paymentId,
        subtotal: body.subtotal,
        discountAmount: body.discountAmount,
        shippingFee: body.shippingFee,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully.",
      order_id: orderId,
      payment_id: paymentId,
      order: createdOrder,
    });
  } catch (error: any) {
    console.error("POST /api/verify-payment error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to verify payment signature.",
      },
      { status: 500 }
    );
  }
}
