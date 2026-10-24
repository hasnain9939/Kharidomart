import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

/**
 * POST /api/webhooks/shopify
 * Receives automated fulfillment and order updates from Shopify warehouse
 * (e.g., fulfillments/create, orders/fulfilled).
 * Automatically updates courier name and AWB tracking in Neon PostgreSQL.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const topic = req.headers.get("x-shopify-topic") || "fulfillments/create";
    const hmacHeader = req.headers.get("x-shopify-hmac-sha256");

    // Optional HMAC verification if SHOPIFY_WEBHOOK_SECRET is set
    const webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;
    if (webhookSecret && hmacHeader) {
      const generatedHash = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody, "utf8")
        .digest("base64");

      if (generatedHash !== hmacHeader) {
        console.warn("[Shopify Webhook] Invalid HMAC signature detected.");
        return NextResponse.json({ error: "Unauthorized webhook request" }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);

    // Case 1: Fulfillment event (fulfillments/create, fulfillments/update)
    const trackingCompany =
      payload.tracking_company ||
      payload.fulfillment?.tracking_company ||
      payload.tracking_companies?.[0] ||
      "Express Logistics";

    const trackingNumber =
      payload.tracking_number ||
      payload.fulfillment?.tracking_number ||
      payload.tracking_numbers?.[0] ||
      payload.tracking_info?.[0]?.number;

    // Look for Kharido Mart order reference inside notes or tags
    const noteText = payload.note || payload.order?.note || "";
    const match = noteText.match(/KM-\d{4}-\d{5}/i);
    const orderNumberFromNote = match ? match[0] : null;

    if (orderNumberFromNote && trackingNumber) {
      const updated = await prisma.order.updateMany({
        where: { orderNumber: orderNumberFromNote },
        data: {
          status: "Shipped",
          courier: trackingCompany,
          awbNumber: String(trackingNumber),
        },
      });

      console.log(`[Shopify Webhook] Updated order ${orderNumberFromNote} -> Courier: ${trackingCompany}, AWB: ${trackingNumber} (${updated.count} records updated)`);
      return NextResponse.json({ success: true, updated: updated.count, orderNumber: orderNumberFromNote });
    }

    // Case 2: Match by customer phone and recent order
    if (payload.customer?.phone && trackingNumber) {
      const cleanPhone = payload.customer.phone.replace(/\D/g, "");
      const phoneTail = cleanPhone.slice(-10);

      const recentOrder = await prisma.order.findFirst({
        where: {
          customerPhone: { contains: phoneTail },
          status: { in: ["Processing", "Pending Payment"] },
        },
        orderBy: { createdAt: "desc" },
      });

      if (recentOrder) {
        await prisma.order.update({
          where: { id: recentOrder.id },
          data: {
            status: "Shipped",
            courier: trackingCompany,
            awbNumber: String(trackingNumber),
          },
        });

        console.log(`[Shopify Webhook] Matched order ${recentOrder.orderNumber} via phone -> AWB: ${trackingNumber}`);
        return NextResponse.json({ success: true, matchedOrderId: recentOrder.orderNumber });
      }
    }

    return NextResponse.json({ success: true, message: `Webhook received (${topic}). No matching order found to update.` });
  } catch (error: any) {
    console.error("[Shopify Webhook] Error processing event:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
