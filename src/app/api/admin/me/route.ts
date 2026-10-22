import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("km_admin_session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    try {
      const decoded = JSON.parse(Buffer.from(sessionCookie, "base64").toString("utf-8"));
      if (decoded && decoded.role === "admin") {
        return NextResponse.json({
          authenticated: true,
          user: decoded,
        });
      }
    } catch {
      // Invalid token
    }

    return NextResponse.json({ authenticated: false }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json(
      { authenticated: false, error: err.message },
      { status: 500 }
    );
  }
}
