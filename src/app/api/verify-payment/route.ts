import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { pushOrderToShopify } from "@/lib/shopify";

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

    // Signature mismatch: return 400, do NOT mark as paid
    if (expectedSignature !== signature) {
      console.error("Razorpay signature mismatch:", {
        expected: expectedSignature,
        received: signature,
      });
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
      const {
        userId,
        customer,
        address,
        items,
        subtotal = 0,
        discountAmount = 0,
        shippingFee = 0,
        grandTotal = 0,
        paymentMethod = "UPI",
      } = body;

      let computedSubtotal = 0;
      const sanitizedItems = items.map((item: any) => {
        const title = String(item.product?.title || item.title || "Product").trim();
        const rawPrice = Number(item.product?.price ?? item.price ?? 0);
        const cleanPrice = isNaN(rawPrice) || rawPrice < 0 ? 0 : rawPrice;
        const rawQty = Number(item.quantity);
        const cleanQuantity = isNaN(rawQty) || rawQty < 1 ? 1 : Math.floor(rawQty);

        computedSubtotal += cleanPrice * cleanQuantity;

        return {
          productId: item.product?.id || item.productId || null,
          title,
          price: cleanPrice,
          quantity: cleanQuantity,
          image: item.product?.images?.[0] || item.image || null,
        };
      });

      const finalSubtotal = computedSubtotal > 0 ? computedSubtotal : Math.max(0, parseFloat(subtotal) || 0);
      const cleanDiscount = Math.min(finalSubtotal, Math.max(0, parseFloat(discountAmount) || 0));
      const cleanShipping = Math.max(0, parseFloat(shippingFee) || 0);
      const upiDiscount = String(paymentMethod).toLowerCase().includes("upi") ? 50 : 0;
      const finalGrandTotal = Math.max(0, finalSubtotal - cleanDiscount + cleanShipping - upiDiscount);

      let linkedUserId: string | null = null;
      if (userId) {
        const existingUser = await prisma.user.findUnique({
          where: { id: String(userId) },
          select: { id: true },
        });
        if (existingUser) {
          linkedUserId = existingUser.id;
        }
      }

      const orderNumber =
        "KM-" +
        new Date().getFullYear() +
        "-" +
        Math.floor(10000 + Math.random() * 90000);

      const awbNumber =
        "KM-BLU-" + Math.floor(10000000 + Math.random() * 90000000) + "-IN";

      const customerFullName = [customer.firstName, customer.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

      const landmarkWithRef = address.landmark
        ? `${address.landmark} (Razorpay: ${paymentId})`
        : `Razorpay Payment ID: ${paymentId}`;

      createdOrder = await prisma.order.create({
        data: {
          userId: linkedUserId,
          orderNumber,
          customerName: customerFullName || "Valued Customer",
          customerPhone: String(customer.phone).trim(),
          customerEmail: customer.email ? String(customer.email).trim() : "",
          address: String(address.address).trim(),
          city: String(address.city || "").trim(),
          state: String(address.state || "").trim(),
          pincode: String(address.pincode || "").trim(),
          landmark: landmarkWithRef,
          subtotal: finalSubtotal,
          discountAmount: cleanDiscount,
          shippingFee: cleanShipping,
          total: finalGrandTotal,
          paymentMethod: String(paymentMethod).toLowerCase().includes("card") ? "Card (Razorpay)" : "UPI (Razorpay)",
          status: "Processing",
          courier: "BlueDart Express",
          awbNumber,
          items: {
            create: sanitizedItems,
          },
        },
        include: {
          items: true,
        },
      });

      // Synchronize confirmed prepaid order to Shopify warehouse (non-blocking)
      pushOrderToShopify({
        orderNumber: createdOrder.orderNumber,
        customerName: createdOrder.customerName,
        customerPhone: createdOrder.customerPhone,
        customerEmail: createdOrder.customerEmail,
        address: createdOrder.address,
        city: createdOrder.city,
        state: createdOrder.state,
        pincode: createdOrder.pincode,
        landmark: createdOrder.landmark,
        paymentMethod: createdOrder.paymentMethod,
        subtotal: createdOrder.subtotal,
        discountAmount: createdOrder.discountAmount,
        shippingFee: createdOrder.shippingFee,
        total: createdOrder.total,
        items: createdOrder.items.map((i: any) => ({
          title: i.title,
          price: i.price,
          quantity: i.quantity,
        })),
      }).catch((err) => console.warn("[Shopify Sync Error on Prepaid]:", err));
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
