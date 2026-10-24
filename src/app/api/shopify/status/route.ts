import { NextResponse } from "next/server";
import { testShopifyConnection, isShopifyConfigured } from "@/lib/shopify";

export async function GET() {
  const configured = isShopifyConfigured();
  if (!configured) {
    return NextResponse.json({
      configured: false,
      message: "Shopify credentials are not yet set in .env (SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_ACCESS_TOKEN)",
    });
  }

  const result = await testShopifyConnection();
  return NextResponse.json({
    configured: true,
    ...result,
  });
}
