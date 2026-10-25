/**
 * E-commerce Order Utilities for Kharido Mart
 * Consolidates order number generation, AWB tracking, item validation, and total calculations.
 */

export interface SanitizedOrderItem {
  productId: string | null;
  title: string;
  price: number;
  quantity: number;
  image: string | null;
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `KM-${year}-${randomSuffix}`;
}



export function sanitizeOrderItems(
  rawItems: any[],
  priceMap?: Map<string, number>
): {
  sanitizedItems: SanitizedOrderItem[];
  computedSubtotal: number;
} {
  let computedSubtotal = 0;

  const sanitizedItems: SanitizedOrderItem[] = (rawItems || []).map((item: any) => {
    const title = String(item.product?.title || item.title || "Product").trim();
    const pId = item.product?.id || item.productId || item.id || null;
    
    // If the product exists in our database, enforce the database price
    let cleanPrice: number;
    if (pId && priceMap && priceMap.has(pId)) {
      cleanPrice = priceMap.get(pId)!;
    } else {
      const rawPrice = Number(item.product?.price ?? item.price ?? 0);
      cleanPrice = isNaN(rawPrice) || rawPrice < 0 ? 0 : rawPrice;
    }

    const rawQty = Number(item.quantity);
    const cleanQuantity = isNaN(rawQty) || rawQty < 1 ? 1 : Math.floor(rawQty);

    computedSubtotal += cleanPrice * cleanQuantity;

    return {
      productId: pId,
      title,
      price: cleanPrice,
      quantity: cleanQuantity,
      image: item.product?.images?.[0] || item.image || null,
    };
  });

  return { sanitizedItems, computedSubtotal };
}

export function calculateOrderTotals({
  subtotal = 0,
  computedSubtotal = 0,
  discountAmount = 0,
  shippingFee = 0,
  paymentMethod = "COD",
}: {
  subtotal?: number | string;
  computedSubtotal?: number;
  discountAmount?: number | string;
  shippingFee?: number | string;
  paymentMethod?: string;
}) {
  const finalSubtotal =
    computedSubtotal > 0
      ? computedSubtotal
      : Math.max(0, typeof subtotal === "string" ? parseFloat(subtotal) || 0 : subtotal);

  const parsedDiscount = typeof discountAmount === "string" ? parseFloat(discountAmount) || 0 : discountAmount;
  const cleanDiscount = Math.min(finalSubtotal, Math.max(0, parsedDiscount));

  const parsedShipping = typeof shippingFee === "string" ? parseFloat(shippingFee) || 0 : shippingFee;
  const cleanShipping = Math.max(0, parsedShipping);

  // ₹50 UPI discount is validated for subtotal >= ₹299
  const isUpi = String(paymentMethod).toLowerCase().includes("upi");
  const upiDiscount = isUpi && finalSubtotal >= 299 ? 50 : 0;

  const finalGrandTotal = Math.max(
    0,
    finalSubtotal - cleanDiscount + cleanShipping - upiDiscount
  );

  return {
    finalSubtotal,
    cleanDiscount,
    cleanShipping,
    upiDiscount,
    finalGrandTotal,
  };
}

export interface CreateDatabaseOrderParams {
  userId?: string | null;
  customer: {
    firstName?: string;
    lastName?: string;
    name?: string;
    phone: string;
    email?: string;
  };
  address: {
    address: string;
    city?: string;
    state?: string;
    pincode?: string;
    landmark?: string | null;
  };
  items: any[];
  paymentMethod?: string;
  status?: string;
  paymentId?: string;
  discountCode?: string;
  subtotal?: number | string;
  discountAmount?: number | string;
  shippingFee?: number | string;
}

/**
 * Centralized database order creation routine.
 * Handles validation, user linking, total calculation, Prisma insertion, and Shopify sync.
 */
export async function createDatabaseOrder(params: CreateDatabaseOrderParams) {
  const { prisma } = await import("@/lib/prisma");
  const { pushOrderToShopify } = await import("@/lib/shopify");

  const {
    userId,
    customer,
    address,
    items,
    paymentMethod = "COD",
    status,
    paymentId,
    discountCode,
    subtotal = 0,
    shippingFee = 0,
  } = params;

  // 1. Fetch real prices from database to prevent client price tampering
  const productIds = (items || [])
    .map((item: any) => item.product?.id || item.productId || item.id)
    .filter(Boolean);

  const priceMap = new Map<string, number>();
  if (productIds.length > 0) {
    try {
      const dbProducts = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, price: true },
      });
      for (const p of dbProducts) {
        priceMap.set(p.id, p.price);
      }
    } catch (e: any) {
      console.warn("Could not query DB products for price verification:", e?.message);
    }
  }

  const { sanitizedItems, computedSubtotal } = sanitizeOrderItems(items, priceMap);

  // 2. Server-side discount coupon validation
  let validatedDiscount = 0;
  if (discountCode && typeof discountCode === "string") {
    const cleanCode = discountCode.trim().toUpperCase();
    try {
      const dbDiscount = await prisma.discount.findUnique({
        where: { code: cleanCode },
      });
      if (
        dbDiscount &&
        dbDiscount.active &&
        (!dbDiscount.expiresAt || new Date(dbDiscount.expiresAt) >= new Date())
      ) {
        if (computedSubtotal >= dbDiscount.minOrder) {
          validatedDiscount =
            dbDiscount.type === "fixed"
              ? dbDiscount.value
              : (computedSubtotal * dbDiscount.value) / 100;
          validatedDiscount = Math.min(computedSubtotal, Math.max(0, validatedDiscount));

          // Increment coupon usage
          await prisma.discount.update({
            where: { id: dbDiscount.id },
            data: { usageCount: { increment: 1 } },
          }).catch(() => {});
        }
      }
    } catch (dErr: any) {
      console.warn("Discount validation warning:", dErr?.message);
    }
  } else if (params.discountAmount) {
    // If discount code was not provided directly, verify bounds on discountAmount
    const rawDisc = typeof params.discountAmount === "string" ? parseFloat(params.discountAmount) : params.discountAmount;
    validatedDiscount = Math.min(computedSubtotal, Math.max(0, rawDisc || 0));
  }

  const { finalSubtotal, cleanDiscount, cleanShipping, upiDiscount, finalGrandTotal } =
    calculateOrderTotals({
      subtotal,
      computedSubtotal,
      discountAmount: validatedDiscount,
      shippingFee,
      paymentMethod,
    });

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

  const orderNumber = generateOrderNumber();

  const customerFullName =
    [customer.firstName, customer.lastName].filter(Boolean).join(" ").trim() ||
    customer.name ||
    "Customer";

  const landmarkWithRef = paymentId
    ? address.landmark
      ? `${address.landmark} (Razorpay: ${paymentId})`
      : `Razorpay Payment ID: ${paymentId}`
    : address.landmark
    ? String(address.landmark).trim()
    : null;

  const formattedPaymentMethod = paymentId
    ? String(paymentMethod).toLowerCase().includes("card")
      ? "Card (Razorpay)"
      : "UPI (Razorpay)"
    : paymentMethod === "upi"
    ? "UPI"
    : paymentMethod === "card"
    ? "Card"
    : "COD";

  const initialStatus =
    status ||
    (paymentId
      ? "Processing"
      : paymentMethod.toLowerCase() === "cod"
      ? "Processing"
      : "Pending Payment");

  const newOrder = await prisma.order.create({
    data: {
      userId: linkedUserId,
      orderNumber,
      customerName: customerFullName,
      customerPhone: String(customer.phone).trim(),
      customerEmail: customer.email ? String(customer.email).trim() : "",
      address: String(address.address).trim(),
      city: String(address.city || "").trim(),
      state: String(address.state || "").trim(),
      pincode: String(address.pincode || "").trim(),
      landmark: landmarkWithRef,
      subtotal: finalSubtotal,
      discountAmount: cleanDiscount + upiDiscount,
      shippingFee: cleanShipping,
      total: finalGrandTotal,
      paymentMethod: formattedPaymentMethod,
      status: initialStatus,
      courier: "Standard Express Delivery",
      awbNumber: null,
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
  }).catch((e) => console.warn("Shopify sync background warning:", e?.message));

  return newOrder;
}
