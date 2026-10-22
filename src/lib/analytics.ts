// E-commerce Analytics Helper for Kharido Mart
// Safely dispatches standard GA4 e-commerce events

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export function trackEvent(action: string, params: Record<string, any> = {}) {
  if (typeof window === "undefined") return;

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
    items: [
      {
        item_id: product.id,
        item_name: product.title,
        item_category: product.category,
        price: product.price,
        quantity: 1,
      },
    ],
  });
}

export function trackAddToCart(product: {
  id: string;
  title: string;
  category: string;
  price: number;
}, quantity = 1) {
  trackEvent("add_to_cart", {
    currency: "INR",
    value: product.price * quantity,
    items: [
      {
        item_id: product.id,
        item_name: product.title,
        item_category: product.category,
        price: product.price,
        quantity,
      },
    ],
  });
}

export function trackBeginCheckout(items: any[], totalValue: number) {
  trackEvent("begin_checkout", {
    currency: "INR",
    value: totalValue,
    items: items.map((item) => ({
      item_id: item.product?.id || item.id,
      item_name: item.product?.title || item.title,
      price: item.product?.price || item.price,
      quantity: item.quantity || 1,
    })),
  });
}

export function trackPurchase(order: {
  orderId: string;
  grandTotal: number;
  items: any[];
  shippingFee?: number;
}) {
  trackEvent("purchase", {
    transaction_id: order.orderId,
    currency: "INR",
    value: order.grandTotal,
    shipping: order.shippingFee || 0,
    items: order.items.map((item) => ({
      item_id: item.product?.id || item.id,
      item_name: item.product?.title || item.title,
      price: item.product?.price || item.price,
      quantity: item.quantity || 1,
    })),
  });
}
