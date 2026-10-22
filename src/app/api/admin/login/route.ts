import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, rememberMe } = body;

    // Supported Admin Accounts (Configurable via .env)
    const validAdmins = [
      {
        email: (process.env.ADMIN_EMAIL || "admin@kharidomart.com").trim().toLowerCase(),
        password: process.env.ADMIN_PASSWORD || "admin",
        name: "Store Administrator",
      },
      ...(process.env.ADMIN_EMAIL_2
        ? [
            {
              email: process.env.ADMIN_EMAIL_2.trim().toLowerCase(),
              password: process.env.ADMIN_PASSWORD_2 || "admin",
              name: "Operations Administrator",
            },
          ]
        : []),
      ...(process.env.NODE_ENV !== "production"
        ? [
            {
              email: "admin@kharidomart.com",
              password: "admin",
              name: "Store Administrator (Dev)",
            },
          ]
        : []),
    ];

    const matchedAdmin = validAdmins.find(
      (a) =>
        a.email === email.trim().toLowerCase() &&
        a.password === password
    );

    if (!matchedAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password. Please verify your administrator credentials.",
        },
        { status: 401 }
      );
    }

    // Session payload
    const sessionData = {
      email: matchedAdmin.email,
      role: "admin",
      name: matchedAdmin.name,
      issuedAt: Date.now(),
    };
    const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString("base64");

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;

    const res = NextResponse.json({
      success: true,
      user: {
        email: matchedAdmin.email,
        role: "admin",
        name: matchedAdmin.name,
      },
    });

    res.cookies.set("km_admin_session", sessionToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Authentication failed" },
      { status: 500 }
    );
  }
}
