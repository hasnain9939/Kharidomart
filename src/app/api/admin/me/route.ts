import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSessionToken } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("km_admin_session")?.value;
    const adminUser = await verifyAdminSessionToken(sessionCookie);

    if (!adminUser) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: adminUser,
    });
  } catch (err: any) {
    return NextResponse.json(
      { authenticated: false, error: err.message },
      { status: 500 }
    );
  }
}
