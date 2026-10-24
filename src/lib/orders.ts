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



export function sanitizeOrderItems(rawItems: any[]): {
  sanitizedItems: SanitizedOrderItem[];
  computedSubtotal: number;
} {
  let computedSubtotal = 0;

  const sanitizedItems: SanitizedOrderItem[] = (rawItems || []).map((item: any) => {
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

  const isUpi = String(paymentMethod).toLowerCase().includes("upi");
  const upiDiscount = isUpi ? 50 : 0;

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
