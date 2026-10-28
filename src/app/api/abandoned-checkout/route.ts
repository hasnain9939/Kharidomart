import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSessionToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      customerPhone,
      customerEmail,
      customerName,
      address,
      city,
      state,
      pincode,
      items,
      subtotal = 0,
      discountCode,
      status = "abandoned",
      orderNumber,
    } = body;

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing required sessionId." },
        { status: 400 }
      );
    }

    const cleanPhone = customerPhone ? String(customerPhone).replace(/\D/g, "") : "";
    const cleanEmail = customerEmail ? String(customerEmail).trim() : "";

    // If marking as recovered from checkout
    if (status === "recovered") {
      const existing = await prisma.abandonedCheckout.findUnique({
        where: { sessionId },
      });

      if (existing) {
        const updated = await prisma.abandonedCheckout.update({
          where: { sessionId },
          data: {
            status: "recovered",
            orderNumber: orderNumber || undefined,
            recoveredAt: new Date(),
          },
        });
        return NextResponse.json({ success: true, recovered: true, checkout: updated });
      }

      // If record wasn't created yet, create it directly as recovered
      const created = await prisma.abandonedCheckout.create({
        data: {
          sessionId,
          customerPhone: cleanPhone || null,
          customerEmail: cleanEmail || null,
          customerName: customerName || null,
          address: address || null,
          city: city || null,
          state: state || null,
          pincode: pincode || null,
          cartData: JSON.stringify(items || []),
          subtotal: Number(subtotal) || 0,
          discountCode: discountCode || null,
          status: "recovered",
          orderNumber: orderNumber || null,
          recoveredAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, recovered: true, checkout: created });
    }

    // Require at least 6-digit phone or valid email to consider an abandoned draft
    if ((!cleanPhone || cleanPhone.length < 6) && (!cleanEmail || !cleanEmail.includes("@"))) {
      return NextResponse.json(
        { success: false, error: "Phone number or email required to save abandoned checkout." },
        { status: 422 }
      );
    }

    const serializedCart = typeof items === "string" ? items : JSON.stringify(items || []);

    const upserted = await prisma.abandonedCheckout.upsert({
      where: { sessionId },
      create: {
        sessionId,
        customerPhone: cleanPhone || null,
        customerEmail: cleanEmail || null,
        customerName: customerName || null,
        address: address || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        cartData: serializedCart,
        subtotal: Number(subtotal) || 0,
        discountCode: discountCode || null,
        status: "abandoned",
      },
      update: {
        customerPhone: cleanPhone || undefined,
        customerEmail: cleanEmail || undefined,
        customerName: customerName || undefined,
        address: address || undefined,
        city: city || undefined,
        state: state || undefined,
        pincode: pincode || undefined,
        cartData: serializedCart,
        subtotal: Number(subtotal) || undefined,
        discountCode: discountCode || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: upserted.sessionId,
      recoveryToken: upserted.recoveryToken,
    });
  } catch (err: any) {
    console.error("POST /api/abandoned-checkout error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to save abandoned checkout." },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const recoveryToken = searchParams.get("token");

    // 1. Public single recovery retrieval by token
    if (recoveryToken) {
      const checkout = await prisma.abandonedCheckout.findUnique({
        where: { recoveryToken },
      });

      if (!checkout) {
        return NextResponse.json(
          { success: false, error: "Abandoned checkout session not found or expired." },
          { status: 404 }
        );
      }

      let parsedItems = [];
      try {
        parsedItems = JSON.parse(checkout.cartData);
      } catch {
        parsedItems = [];
      }

      return NextResponse.json({
        success: true,
        checkout: {
          ...checkout,
          items: parsedItems,
        },
      });
    }

    // 2. Admin dashboard checkouts list
    const sessionCookie = req.cookies.get("km_admin_session")?.value;
    if (!(await verifyAdminSessionToken(sessionCookie))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin session required." },
        { status: 401 }
      );
    }

    const checkouts = await prisma.abandonedCheckout.findMany({
      orderBy: { updatedAt: "desc" },
      take: 100,
    });

    let totalAbandoned = 0;
    let totalRecovered = 0;
    let abandonedRevenue = 0;
    let recoveredRevenue = 0;

    for (const c of checkouts) {
      if (c.status === "recovered") {
        totalRecovered++;
        recoveredRevenue += c.subtotal;
      } else {
        totalAbandoned++;
        abandonedRevenue += c.subtotal;
      }
    }

    const totalCount = totalAbandoned + totalRecovered;
    const recoveryRate = totalCount > 0 ? Math.round((totalRecovered / totalCount) * 100) : 0;

    return NextResponse.json({
      success: true,
      metrics: {
        totalAbandoned,
        totalRecovered,
        abandonedRevenue,
        recoveredRevenue,
        recoveryRate,
      },
      checkouts: checkouts.map((c) => {
        let itemsCount = 0;
        let itemsPreview = [];
        try {
          const parsed = JSON.parse(c.cartData);
          itemsCount = Array.isArray(parsed) ? parsed.reduce((acc, i) => acc + (i.quantity || 1), 0) : 0;
          itemsPreview = Array.isArray(parsed) ? parsed.map((i) => i.title || i.product?.title || "Item") : [];
        } catch {}

        return {
          id: c.id,
          sessionId: c.sessionId,
          customerName: c.customerName || "Anonymous Customer",
          customerPhone: c.customerPhone,
          customerEmail: c.customerEmail,
          city: c.city,
          pincode: c.pincode,
          subtotal: c.subtotal,
          status: c.status,
          recoveryToken: c.recoveryToken,
          orderNumber: c.orderNumber,
          itemsCount,
          itemsPreview,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        };
      }),
    });
  } catch (err: any) {
    console.error("GET /api/abandoned-checkout error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to retrieve abandoned checkouts." },
      { status: 500 }
    );
  }
}
