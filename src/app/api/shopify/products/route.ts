import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSessionToken } from "@/lib/session";
import { fetchShopifyProducts } from "@/lib/shopify";

// GET /api/shopify/products - List products from Shopify and mark which ones are in Kharido Mart
export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("km_admin_session")?.value;
    if (!(await verifyAdminSessionToken(sessionCookie))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin session required" },
        { status: 401 }
      );
    }

    const shopifyResult = await fetchShopifyProducts();

    if (!shopifyResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: shopifyResult.error,
          scopeNeeded: shopifyResult.scopeNeeded,
        },
        { status: shopifyResult.scopeNeeded ? 403 : 502 }
      );
    }

    const shopifyProducts = shopifyResult.products || [];

    // Get existing products from database to compare
    const existingProducts = await prisma.product.findMany({
      select: { id: true, slug: true, title: true },
    });

    const existingSlugs = new Set(existingProducts.map((p) => p.slug.toLowerCase()));
    const existingTitles = new Set(existingProducts.map((p) => p.title.toLowerCase().trim()));

    const items = shopifyProducts.map((sp: any) => {
      const firstVariant = sp.variants?.[0] || {};
      const price = parseFloat(firstVariant.price || "0");
      const comparePrice = parseFloat(firstVariant.compare_at_price || "0");
      const images = Array.isArray(sp.images) ? sp.images.map((img: any) => img.src) : [];
      const stock = sp.variants?.reduce(
        (sum: number, v: any) => sum + (typeof v.inventory_quantity === "number" ? v.inventory_quantity : 0),
        0
      ) ?? 25;

      const slug = sp.handle || sp.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const isAlreadyImported =
        existingSlugs.has(slug.toLowerCase()) || existingTitles.has(sp.title.toLowerCase().trim());

      return {
        id: sp.id,
        title: sp.title,
        handle: sp.handle,
        slug,
        vendor: sp.vendor || "Shopify Warehouse",
        productType: sp.product_type || "Mom & Baby",
        price,
        originalPrice: comparePrice > price ? comparePrice : Math.round(price * 1.4),
        stock: stock > 0 ? stock : 25,
        sku: firstVariant.sku || `SHP-${sp.id}`,
        imageUrl: images[0] || "/assets/images/img_1_box-full-of-childrens-toys.jpg",
        imagesCount: images.length,
        status: sp.status,
        isAlreadyImported,
      };
    });

    return NextResponse.json({
      success: true,
      count: items.length,
      products: items,
    });
  } catch (error: any) {
    console.error("GET /api/shopify/products error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch Shopify products" },
      { status: 500 }
    );
  }
}

// POST /api/shopify/products - 1-Click Import selected products from Shopify into Kharido Mart DB
export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("km_admin_session")?.value;
    if (!(await verifyAdminSessionToken(sessionCookie))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Admin session required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { productIds, importAll = false } = body;

    const shopifyResult = await fetchShopifyProducts();
    if (!shopifyResult.success || !shopifyResult.products) {
      return NextResponse.json(
        { success: false, error: shopifyResult.error || "Could not retrieve Shopify catalog" },
        { status: 502 }
      );
    }

    const allShopifyProducts = shopifyResult.products;
    const targetProducts = importAll
      ? allShopifyProducts
      : allShopifyProducts.filter((p: any) => productIds?.includes(p.id));

    if (targetProducts.length === 0) {
      return NextResponse.json(
        { success: false, error: "No matching Shopify products found to import" },
        { status: 400 }
      );
    }

    let importedCount = 0;
    const importedTitles: string[] = [];

    for (const sp of targetProducts) {
      const firstVariant = sp.variants?.[0] || {};
      const price = parseFloat(firstVariant.price || "499");
      const comparePrice = parseFloat(firstVariant.compare_at_price || "0");
      const originalPrice = comparePrice > price ? comparePrice : Math.round(price * 1.4);

      const totalStock = sp.variants?.reduce(
        (sum: number, v: any) => sum + (typeof v.inventory_quantity === "number" ? v.inventory_quantity : 0),
        0
      );
      const stock = totalStock && totalStock > 0 ? totalStock : 25;

      const slug = (sp.handle || sp.title)
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const images = Array.isArray(sp.images) && sp.images.length > 0
        ? sp.images.map((img: any) => img.src)
        : ["https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80"];

      // Strip basic HTML tags from description if needed
      const rawDesc = sp.body_html || "";
      const cleanDesc =
        rawDesc.replace(/<[^>]*>?/gm, " ").trim() ||
        `${sp.title} is carefully inspected and sourced directly from our verified central warehouse. Order today with Pan-India express Cash on Delivery.`;

      const category = sp.product_type?.trim() || "Mom & Baby";
      const categorySlug = category
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-");

      const specs = [
        { label: "SKU", value: firstVariant.sku || `KM-SHP-${sp.id}` },
        { label: "Fulfillment Partner", value: "Shopify Central Warehouse" },
        { label: "Shopify Product ID", value: String(sp.id) },
        { label: "Vendor", value: sp.vendor || "Kharido Mart" },
        { label: "Country of Origin", value: "India" },
        { label: "Dispatch Time", value: "24–48 hrs" },
      ];

      const highlights = [
        "100% Quality Inspected & Certified",
        "Direct Express Dispatch via Shopify Warehouse",
        "Pan-India Cash on Delivery Available",
        "Easy 24-Hour Replacement Warranty",
      ];

      // Upsert into Prisma PostgreSQL database
      await prisma.product.upsert({
        where: { slug },
        update: {
          title: sp.title.trim(),
          shortTitle: sp.title.trim().slice(0, 48),
          price,
          originalPrice,
          stock,
          category,
          categorySlug,
          images: JSON.stringify(images),
          description: cleanDesc,
          specs: JSON.stringify(specs),
          highlights: JSON.stringify(highlights),
          badge: sp.tags?.toLowerCase().includes("bestseller") ? "Bestseller" : "COD Available",
        },
        create: {
          slug,
          title: sp.title.trim(),
          shortTitle: sp.title.trim().slice(0, 48),
          price,
          originalPrice,
          stock,
          category,
          categorySlug,
          badge: sp.tags?.toLowerCase().includes("bestseller") ? "Bestseller" : "COD Available",
          featured: false,
          images: JSON.stringify(images),
          description: cleanDesc,
          highlights: JSON.stringify(highlights),
          specs: JSON.stringify(specs),
        },
      });

      importedCount++;
      importedTitles.push(sp.title);
    }

    return NextResponse.json({
      success: true,
      importedCount,
      importedTitles,
      message: `Successfully synced ${importedCount} product${importedCount === 1 ? "" : "s"} from Shopify Warehouse!`,
    });
  } catch (error: any) {
    console.error("POST /api/shopify/products error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to import Shopify products" },
      { status: 500 }
    );
  }
}
