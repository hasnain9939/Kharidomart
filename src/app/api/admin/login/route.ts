import { NextRequest, NextResponse } from "next/server";
import { createAdminSessionToken } from "@/lib/session";

// In-memory rate limiting: max 5 failed attempts per email per 15 minutes
const adminLoginAttempts = new Map<string, { count: number; expiresAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter your administrator email and password." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const now = Date.now();

    // Check rate limit
    const attemptRecord = adminLoginAttempts.get(cleanEmail);
    if (attemptRecord && attemptRecord.expiresAt > now) {
      if (attemptRecord.count >= 5) {
        return NextResponse.json(
          {
            success: false,
            error: "Too many failed login attempts. For security, please wait 15 minutes before trying again.",
          },
          { status: 429 }
        );
      }
    }

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
    ];

    const matchedAdmin = validAdmins.find(
      (a) =>
        a.email === cleanEmail &&
        a.password === password
    );

    if (!matchedAdmin) {
      // Record failed attempt
      const current = adminLoginAttempts.get(cleanEmail);
      if (current && current.expiresAt > now) {
        current.count += 1;
      } else {
        adminLoginAttempts.set(cleanEmail, { count: 1, expiresAt: now + 15 * 60 * 1000 });
      }

      return NextResponse.json(
        {
          success: false,
          error: "Invalid email or password. Please verify your administrator credentials.",
        },
        { status: 401 }
      );
    }

    // Reset rate limiter on successful authentication
    adminLoginAttempts.delete(cleanEmail);

    // Session payload with HMAC signature
    const sessionToken = await createAdminSessionToken({
      email: matchedAdmin.email,
      role: "admin",
      issuedAt: Date.now(),
    });

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
      httpOnly: true, // Secure against XSS cookie theft
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
