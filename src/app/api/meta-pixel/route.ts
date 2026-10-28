import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Check environment variable first
    const envPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim();
    if (envPixelId && /^\d+$/.test(envPixelId)) {
      return NextResponse.json(
        { success: true, pixelId: envPixelId },
        {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        }
      );
    }

    // 2. Fall back to database StoreSetting table
    const setting = await prisma.storeSetting.findUnique({
      where: { key: "metaPixelId" },
    });

    const pixelId = setting?.value?.trim() || null;
    const validPixelId = pixelId && /^\d+$/.test(pixelId) ? pixelId : null;

    return NextResponse.json(
      { success: true, pixelId: validPixelId },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err: unknown) {
    console.error("Failed to load Meta Pixel ID:", err);
    return NextResponse.json(
      { success: false, pixelId: null },
      { status: 500 }
    );
  }
}
