import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSessionToken, verifyUserSessionToken } from "@/lib/session";

// GET /api/orders/[id] - by orderNumber or cuid
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id },
          { orderNumber: id },
          { awbNumber: id },
        ],
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // Authorization & PII Redaction
    const adminSessionCookie = req.cookies.get("km_admin_session")?.value;
    const userSessionCookie = req.cookies.get("km_user_session")?.value;

    const [admin, userSession] = await Promise.all([
      verifyAdminSessionToken(adminSessionCookie),
      verifyUserSessionToken(userSessionCookie),
    ]);

    const isAuthorized =
      Boolean(admin) ||
      (userSession &&
        ((order.userId && userSession.userId === order.userId) ||
          (order.customerEmail && userSession.email.toLowerCase() === order.customerEmail.toLowerCase())));

    if (!isAuthorized) {
      // Mask PII for public guest tracking to protect customer privacy
      const maskedPhone = order.customerPhone
        ? order.customerPhone.replace(/(\d{2})\d{4,6}(\d{2})/, "$1******$2")
        : "";
      const maskedEmail = order.customerEmail
        ? order.customerEmail.replace(/(.{2})(.*)(@.*)/, "$1***$3")
        : "";

      return NextResponse.json({
        success: true,
        order: {
          ...order,
          customerPhone: maskedPhone,
          customerEmail: maskedEmail,
          address: "*** Redacted for Privacy ***",
        },
      });
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch order" },
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
