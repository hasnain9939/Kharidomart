import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
          { customerPhone: id },
          { customerPhone: { contains: id } },
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

// PUT /api/orders/[id] - update order status, courier, or tracking
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
