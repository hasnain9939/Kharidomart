import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSessionToken } from "@/lib/auth";
import { pushOrderToShopify } from "@/lib/shopify";

// GET /api/orders - list orders (Admin gets all with filters, Customers scoped to their phone/email/userId)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const phone = searchParams.get("phone");
    const email = searchParams.get("email");
    const userId = searchParams.get("userId");

    const sessionCookie = req.cookies.get("km_admin_session")?.value;
    const isAdmin = Boolean(await verifyAdminSessionToken(sessionCookie));

    const where: any = {};

    if (isAdmin) {
      // Full administrative access with filters
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
    } else {
      // Customer access: strictly isolate orders to caller's identity
      if (phone) {
        const cleanPhone = phone.trim().replace(/^\+91/, "").trim();
        where.OR = [
          { customerPhone: phone.trim() },
          { customerPhone: cleanPhone },
          { customerPhone: `+91 ${cleanPhone}` },
          { customerPhone: `+91${cleanPhone}` },
        ];
      } else if (email) {
        where.customerEmail = email.trim();
      } else if (userId) {
        where.userId = userId.trim();
      } else {
        // Unauthenticated and no customer identifier supplied -> empty response
        return NextResponse.json({
          success: true,
          count: 0,
          orders: [],
        });
      }
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
      userId,
      customer,
      address,
      items,
      paymentMethod = "COD",
      subtotal = 0,
      discountAmount = 0,
      shippingFee = 0,
      grandTotal = 0,
    } = body;

    if (!customer?.phone || String(customer.phone).replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    if (!address?.address || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required order information." },
        { status: 400 }
      );
    }

    // Sanitize and validate all items
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
    const upiDiscount = paymentMethod === "upi" ? 50 : 0;
    const finalGrandTotal = Math.max(0, finalSubtotal - cleanDiscount + cleanShipping - upiDiscount);

    // Verify valid user reference if provided
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
        userId: linkedUserId,
        orderNumber,
        customerName: customerFullName || "Valued Customer",
        customerPhone: String(customer.phone).trim(),
        customerEmail: customer.email ? String(customer.email).trim() : "",
        address: String(address.address).trim(),
        city: String(address.city || "").trim(),
        state: String(address.state || "").trim(),
        pincode: String(address.pincode || "").trim(),
        landmark: address.landmark ? String(address.landmark).trim() : null,
        subtotal: finalSubtotal,
        discountAmount: cleanDiscount,
        shippingFee: cleanShipping,
        total: finalGrandTotal,
        paymentMethod: paymentMethod === "upi" ? "UPI" : paymentMethod === "card" ? "Card" : "COD",
        status: paymentMethod === "cod" ? "Processing" : "Pending Payment",
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
 
    // Synchronize to Shopify warehouse (non-blocking)
    pushOrderToShopify({
      orderNumber: newOrder.orderNumber,
      customerName: newOrder.customerName,
      customerPhone: newOrder.customerPhone,
      customerEmail: newOrder.customerEmail,
      address: newOrder.address,
      city: newOrder.city,
      state: newOrder.state,
      pincode: newOrder.pincode,
      landmark: newOrder.landmark,
      paymentMethod: newOrder.paymentMethod,
      subtotal: newOrder.subtotal,
      discountAmount: newOrder.discountAmount,
      shippingFee: newOrder.shippingFee,
      total: newOrder.total,
      items: newOrder.items.map((i) => ({
        title: i.title,
        price: i.price,
        quantity: i.quantity,
      })),
    }).catch((err) => console.warn("[Shopify Sync Error]:", err));

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
