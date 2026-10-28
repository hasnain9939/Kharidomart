import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRazorpayClient } from "@/lib/razorpay";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = (id || "").trim();

    if (!cleanId) {
      return NextResponse.json(
        { success: false, error: "Missing order ID." },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ orderNumber: cleanId }, { id: cleanId }],
      },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found in database." },
        { status: 404 }
      );
    }

    const isAlreadyPrepaid =
      String(order.paymentMethod).toLowerCase().includes("upi") ||
      String(order.paymentMethod).toLowerCase().includes("card");

    if (isAlreadyPrepaid) {
      return NextResponse.json({
        success: false,
        error: "This order is already verified as prepaid.",
        alreadyPrepaid: true,
      });
    }

    // Apply ₹50 discount for upgrading from COD to UPI prepaid
    const discountAmount = 50;
    const discountedTotal = Math.max(1, Math.round(order.total - discountAmount));
    const amountInPaise = discountedTotal * 100;

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const razorpay = getRazorpayClient();

    if (!razorpay || !keyId || keyId.includes("YOUR_KEY_ID")) {
      return NextResponse.json({
        success: true,
        useManualFallback: true,
        discountedTotal,
        discountAmount,
        originalTotal: order.total,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
      });
    }

    const cleanOrderNumber = order.orderNumber.replace(/[^a-zA-Z0-9]/g, "_");
    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `km_upg_${cleanOrderNumber}_${Date.now()}`.slice(0, 40),
      notes: {
        originalOrder: order.orderNumber,
        action: "cod_to_prepaid_upgrade",
        customerPhone: order.customerPhone,
      },
    });

    return NextResponse.json({
      success: true,
      keyId,
      order_id: rzpOrder.id,
      amount: amountInPaise,
      discountedTotal,
      discountAmount,
      currency: "INR",
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
    });
  } catch (err: any) {
    console.error("convert-to-prepaid error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to initiate prepaid upgrade." },
      { status: 500 }
    );
  }
}
