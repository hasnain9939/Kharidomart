import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSessionToken } from "@/lib/auth";

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
      const stringValue = typeof rawValue === "string" ? rawValue : JSON.stringify(rawValue);
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
