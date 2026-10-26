import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSessionToken } from "@/lib/auth";

// Keys containing sensitive credentials or tokens that must NEVER be returned to the client browser
const SENSITIVE_KEYS = new Set([
  "shopifyAdminAccessToken",
  "capiToken",
  "metaCapiToken",
  "adminPassword",
  "jwtSecret",
  "secret",
  "token",
]);

// Keys that are forbidden from being written via the public settings API
const BLOCKED_POST_KEYS = new Set([
  "shopifyAdminAccessToken",
  "capiToken",
  "metaCapiToken",
  "adminPassword",
  "password",
]);

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("km_admin_session")?.value;
    if (!(await verifyAdminSessionToken(sessionCookie))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Administrator access required" },
        { status: 401 }
      );
    }

    const settings = await prisma.storeSetting.findMany();
    const dictionary: Record<string, string> = {};
    for (const item of settings) {
      const lower = item.key.toLowerCase();
      // Block any sensitive backend secrets, tokens, or credentials from frontend network responses
      if (
        SENSITIVE_KEYS.has(item.key) ||
        lower.includes("token") ||
        lower.includes("secret") ||
        lower.includes("password")
      ) {
        continue;
      }
      dictionary[item.key] = item.value;
    }

    return NextResponse.json({
      success: true,
      settings: dictionary,
    });
  } catch (err: unknown) {
    console.error("Failed to fetch store settings:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// POST /api/admin/settings (Admin only)
export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("km_admin_session")?.value;
    if (!(await verifyAdminSessionToken(sessionCookie))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Administrator access required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid settings payload" },
        { status: 400 }
      );
    }

    const updates = Object.entries(body);
    for (const [key, rawValue] of updates) {
      // Ignore any sensitive credentials submitted from the frontend
      if (BLOCKED_POST_KEYS.has(key)) {
        continue;
      }

      let stringValue = typeof rawValue === "string" ? rawValue.trim() : JSON.stringify(rawValue);

      // Validate metaPixelId: must only contain numeric digits or empty (never email addresses)
      if (key === "metaPixelId") {
        if (stringValue && !/^\d+$/.test(stringValue)) {
          stringValue = "";
        }
      }

      await prisma.storeSetting.upsert({
        where: { key },
        update: { value: stringValue },
        create: { key, value: stringValue },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Settings saved successfully",
    });
  } catch (err: any) {
    console.error("Failed to save store settings:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save settings" },
      { status: 500 }
    );
  }
}
