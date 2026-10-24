import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shopParam = searchParams.get("shop") || "cgxx12-ek.myshopify.com";
  const sanitizedShop = shopParam.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const clientId = process.env.SHOPIFY_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "SHOPIFY_CLIENT_ID is not configured in environment variables." },
      { status: 500 }
    );
  }
  const scopes = "read_orders,write_orders,read_fulfillments,write_fulfillments,read_products,write_products,read_inventory,write_inventory";
  
  const host = request.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const redirectUri = `${protocol}://${host}/api/shopify/callback`;

  const installUrl = `https://${sanitizedShop}/admin/oauth/authorize?client_id=${clientId}&scope=${encodeURIComponent(
    scopes
  )}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return NextResponse.redirect(installUrl);
}
