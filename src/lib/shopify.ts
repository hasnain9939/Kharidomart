/**
 * Shopify Admin REST API Integration for Kharido Mart
 * Pushes confirmed customer orders (COD & Prepaid) directly to the Shopify warehouse
 * and tracks live fulfillment status & AWB courier tracking.
 */

interface SyncOrderInput {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string | null;
  paymentMethod: string;
  subtotal: number;
  discountAmount?: number;
  shippingFee?: number;
  total: number;
  items: Array<{
    title: string;
    price: number;
    quantity: number;
  }>;
}

export interface ShopifyOrderResult {
  success: boolean;
  shopifyOrderId?: number;
  shopifyOrderName?: string;
  error?: string;
}

import { prisma } from "@/lib/prisma";

/**
 * Normalizes Shopify domain (e.g., "my-store" -> "my-store.myshopify.com")
 * Supports process.env with automatic fallback to database storeSetting table for cloud deployments.
 */
async function getShopifyUrl(): Promise<{ domain: string; token: string; version: string } | null> {
  let rawDomain = process.env.SHOPIFY_STORE_DOMAIN?.trim();
  let token = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN?.trim();
  const version = process.env.SHOPIFY_API_VERSION?.trim() || "2024-01";

  // Fallback to database storeSetting if environment variables are not set in cloud host
  if (!rawDomain || !token) {
    try {
      const settings = await prisma.storeSetting.findMany({
        where: { key: { in: ["shopifyDomain", "shopifyAdminAccessToken"] } },
      });
      for (const s of settings) {
        if (!rawDomain && s.key === "shopifyDomain" && s.value) rawDomain = s.value.trim();
        if (!token && s.key === "shopifyAdminAccessToken" && s.value) token = s.value.trim();
      }
    } catch (err) {
      console.error("[Shopify] Failed to load credentials from DB storeSetting:", err);
    }
  }

  if (!rawDomain || !token) {
    return null;
  }

  const cleanDomain = rawDomain
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .trim();

  const domain = cleanDomain.includes(".") ? cleanDomain : `${cleanDomain}.myshopify.com`;

  return { domain, token, version };
}

/**
 * Checks if Shopify credentials are fully configured in .env or DB
 */
export async function isShopifyConfigured(): Promise<boolean> {
  return (await getShopifyUrl()) !== null;
}

/**
 * Push confirmed order to Shopify Warehouse for dropshipping fulfillment
 */
export async function pushOrderToShopify(order: SyncOrderInput): Promise<ShopifyOrderResult> {
  const config = await getShopifyUrl();
  if (!config) {
    console.log("[Shopify] SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_ACCESS_TOKEN not set. Skipping remote push.");
    return {
      success: false,
      error: "Shopify credentials not configured in environment.",
    };
  }

  try {
    const isPaid = !order.paymentMethod.toLowerCase().includes("cod");

    // Parse first and last name from customer full name
    const nameParts = (order.customerName || "Valued Customer").trim().split(" ");
    const firstName = nameParts[0] || "Valued";
    const lastName = nameParts.slice(1).join(" ") || "Customer";

    // Clean Indian 10-digit phone
    const cleanDigits = order.customerPhone.replace(/\D/g, "");
    const formattedPhone = cleanDigits.length === 10 ? `+91${cleanDigits}` : cleanDigits.startsWith("91") ? `+${cleanDigits}` : order.customerPhone;

    const payload = {
      order: {
        email: order.customerEmail || undefined,
        phone: formattedPhone,
        financial_status: isPaid ? "paid" : "pending",
        fulfillment_status: null,
        send_receipt: false,
        send_fulfillment_receipt: false,
        note: `Kharido Mart Order: ${order.orderNumber} | Payment: ${order.paymentMethod} | Address Landmark: ${order.landmark || "N/A"}`,
        tags: `KharidoMart, ${isPaid ? "Prepaid" : "COD"}, WebOrder`,
        line_items: order.items.map((item) => ({
          title: item.title,
          price: (item.price || 0).toFixed(2),
          quantity: Math.max(1, item.quantity),
          requires_shipping: true,
        })),
        shipping_address: {
          first_name: firstName,
          last_name: lastName,
          address1: order.address,
          address2: order.landmark || undefined,
          city: order.city,
          province: order.state,
          zip: order.pincode,
          country: "India",
          country_code: "IN",
          phone: formattedPhone,
        },
        billing_address: {
          first_name: firstName,
          last_name: lastName,
          address1: order.address,
          city: order.city,
          province: order.state,
          zip: order.pincode,
          country: "India",
          country_code: "IN",
          phone: formattedPhone,
        },
      },
    };

    const endpoint = `https://${config.domain}/admin/api/${config.version}/orders.json`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": config.token,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Shopify] Failed to create order in Shopify warehouse:", data);
      return {
        success: false,
        error: data.errors ? JSON.stringify(data.errors) : "Shopify API returned an error",
      };
    }

    const createdShopifyOrder = data.order;
    console.log(`[Shopify] Successfully synced order ${order.orderNumber} -> Shopify #${createdShopifyOrder.name} (ID: ${createdShopifyOrder.id})`);

    return {
      success: true,
      shopifyOrderId: createdShopifyOrder.id,
      shopifyOrderName: createdShopifyOrder.name,
    };
  } catch (err: any) {
    console.error("[Shopify] Network exception while syncing order:", err);
    return {
      success: false,
      error: err.message || "Failed to communicate with Shopify API",
    };
  }
}

/**
 * Tests connection with Shopify Admin API using shop.json endpoint
 */
export async function testShopifyConnection(): Promise<{
  connected: boolean;
  shopName?: string;
  myshopifyDomain?: string;
  currency?: string;
  error?: string;
}> {
  const config = await getShopifyUrl();
  if (!config) {
    return {
      connected: false,
      error: "Shopify domain or access token is not configured in .env",
    };
  }

  try {
    const endpoint = `https://${config.domain}/admin/api/${config.version}/shop.json`;
    const res = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": config.token,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        connected: false,
        error: data.errors || "Invalid Access Token or Store URL",
      };
    }

    return {
      connected: true,
      shopName: data.shop?.name,
      myshopifyDomain: data.shop?.myshopify_domain,
      currency: data.shop?.currency,
    };
  } catch (err: any) {
    return {
      connected: false,
      error: err.message || "Could not reach Shopify API",
    };
  }
}

/**
 * Fetches all products from Shopify Admin API
 */
export async function fetchShopifyProducts(): Promise<{
  success: boolean;
  products?: any[];
  error?: string;
  scopeNeeded?: boolean;
}> {
  const config = await getShopifyUrl();
  if (!config) {
    return {
      success: false,
      error: "Shopify domain or access token is not configured in .env",
    };
  }

  try {
    const endpoint = `https://${config.domain}/admin/api/${config.version}/products.json?limit=50`;
    const res = await fetch(endpoint, {
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": config.token,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      if (res.status === 403) {
        return {
          success: false,
          scopeNeeded: true,
          error: "Shopify read_products scope authorization required.",
        };
      }
      return {
        success: false,
        error: data.errors ? JSON.stringify(data.errors) : "Failed to fetch products from Shopify",
      };
    }

    return {
      success: true,
      products: data.products || [],
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to communicate with Shopify API",
    };
  }
}


