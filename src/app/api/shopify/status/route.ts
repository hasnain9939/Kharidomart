import { NextRequest, NextResponse } from "next/server";
import { testShopifyConnection, isShopifyConfigured } from "@/lib/shopify";
import { verifyAdminSessionToken } from "@/lib/session";

export async function GET(req: NextRequest) {
  const sessionCookie = req.cookies.get("km_admin_session")?.value;
  if (!(await verifyAdminSessionToken(sessionCookie))) {
    return NextResponse.json(
      { error: "Unauthorized: Admin session required" },
      { status: 401 }
    );
  }

  const configured = await isShopifyConfigured();
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
