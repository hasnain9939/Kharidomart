import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/orders - list all orders for admin
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
        { customerEmail: { contains: search } },
        { city: { contains: search } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error: any) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/orders - create a real order on checkout
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      customer,
      address,
      items,
      paymentMethod = "COD",
      subtotal = 0,
      discountAmount = 0,
      shippingFee = 0,
      grandTotal = 0,
    } = body;

    if (!customer?.phone || !address?.address || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required order information." },
        { status: 400 }
      );
    }

    // Generate clean real Indian ecommerce order number
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

    const newOrder = await prisma.order.create({
      data: {
        orderNumber,
        customerName: customerFullName || "Valued Customer",
        customerPhone: customer.phone,
        customerEmail: customer.email || "",
        address: address.address,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        landmark: address.landmark || null,
        subtotal: parseFloat(subtotal),
        discountAmount: parseFloat(discountAmount),
        shippingFee: parseFloat(shippingFee),
        total: parseFloat(grandTotal),
        paymentMethod: paymentMethod === "upi" ? "UPI" : "COD",
        status: "Processing",
        courier: "BlueDart Express",
        awbNumber,
        items: {
          create: items.map((item: any) => ({
            productId: item.product?.id || null,
            title: item.product?.title || item.title || "Product",
            price: parseFloat(item.product?.price || item.price || 0),
            quantity: parseInt(item.quantity || 1, 10),
            image: item.product?.images?.[0] || item.image || null,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        order: newOrder,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order" },
      { status: 500 }
    );
  }
}
