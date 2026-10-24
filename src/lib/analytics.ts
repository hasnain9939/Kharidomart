// E-commerce Analytics Helper for Kharido Mart
// Dispatches custom events to Vercel Web Analytics and GA4

import { track } from "@vercel/analytics";

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export function trackEvent(action: string, params: Record<string, any> = {}) {
  if (typeof window === "undefined") return;

  // 1. Dispatch to Vercel Analytics custom events
  try {
    // Vercel Analytics track accepts strings, numbers, booleans
    const flattened: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        flattened[key] = value;
      } else if (Array.isArray(value)) {
        flattened[key] = value.length;
      } else if (value && typeof value === "object") {
        flattened[key] = JSON.stringify(value).slice(0, 255);
      }
    }
    track(action, flattened);
  } catch {
    // Fail silently
  }

  // 2. Dispatch to Google Analytics (gtag / dataLayer)
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", action, params);
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: action, ...params });
    }
  } catch {
    // Fail silently
  }
}

export function trackViewItem(product: {
  id: string;
  title: string;
  category: string;
  price: number;
}) {
  trackEvent("view_item", {
    currency: "INR",
    value: product.price,
    productId: product.id,
    productTitle: product.title,
    category: product.category,
    price: product.price,
  });
}

export function trackAddToCart(
  product: {
    id: string;
    title: string;
    category?: string;
    price: number;
  },
  quantity = 1
) {
  trackEvent("add_to_cart", {
    currency: "INR",
    value: product.price * quantity,
    productId: product.id,
    productTitle: product.title,
    category: product.category || "General",
    price: product.price,
    quantity,
  });
}

export function trackBeginCheckout(items: any[], totalValue: number) {
  trackEvent("begin_checkout", {
    currency: "INR",
    value: totalValue,
    itemCount: items.length,
  });
}

export function trackPurchase(order: {
  orderId: string;
  grandTotal: number;
  items: any[];
  shippingFee?: number;
  paymentMethod?: string;
}) {
  trackEvent("purchase", {
    orderId: order.orderId,
    currency: "INR",
    value: order.grandTotal,
    itemCount: order.items?.length || 0,
    shipping: order.shippingFee || 0,
    paymentMethod: order.paymentMethod || "COD",
  });
}
