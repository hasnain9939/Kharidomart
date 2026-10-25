import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminSessionToken } from "@/lib/session";

// In-memory rate limiting: max 5 failed attempts per IP:email per 15 minutes
const adminLoginAttempts = new Map<string, { count: number; expiresAt: number }>();

function safeTimingCompare(a: string, b: string): boolean {
  try {
    const aBuf = Buffer.from(a, "utf-8");
    const bBuf = Buffer.from(b, "utf-8");
    if (aBuf.length !== bBuf.length) {
      crypto.timingSafeEqual(aBuf, aBuf);
      return false;
    }
    return crypto.timingSafeEqual(aBuf, bBuf);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const body = await req.json().catch(() => ({}));
    const { email, password, rememberMe } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Please enter your administrator email and password." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const now = Date.now();
    const rateLimitKey = `${ip}:${cleanEmail}`;

    // Check rate limit per IP + email
    const attemptRecord = adminLoginAttempts.get(rateLimitKey);
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

    const envAdminPassword = process.env.ADMIN_PASSWORD;
    if (process.env.NODE_ENV === "production" && (!envAdminPassword || envAdminPassword === "admin")) {
      return NextResponse.json(
        {
          success: false,
          error: "Administrator login is disabled: ADMIN_PASSWORD must be configured in production environment.",
        },
        { status: 503 }
      );
    }

    // Supported Admin Accounts (Configurable via .env)
    const validAdmins = [
      {
        email: (process.env.ADMIN_EMAIL || "admin@kharidomart.com").trim().toLowerCase(),
        password: envAdminPassword || "admin",
        name: "Store Administrator",
      },
      ...(process.env.ADMIN_EMAIL_2 && process.env.ADMIN_PASSWORD_2
        ? [
            {
              email: process.env.ADMIN_EMAIL_2.trim().toLowerCase(),
              password: process.env.ADMIN_PASSWORD_2,
              name: "Operations Administrator",
            },
          ]
        : []),
      ...(process.env.ADMIN_EMAIL_3 && process.env.ADMIN_PASSWORD_3
        ? [
            {
              email: process.env.ADMIN_EMAIL_3.trim().toLowerCase(),
              password: process.env.ADMIN_PASSWORD_3,
              name: "Store Administrator",
            },
          ]
        : []),
    ];

    const matchedAdmin = validAdmins.find(
      (a) =>
        a.email === cleanEmail &&
        safeTimingCompare(a.password, password)
    );

    if (!matchedAdmin) {
      // Record failed attempt
      const current = adminLoginAttempts.get(rateLimitKey);
      if (current && current.expiresAt > now) {
        current.count += 1;
      } else {
        adminLoginAttempts.set(rateLimitKey, { count: 1, expiresAt: now + 15 * 60 * 1000 });
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
    adminLoginAttempts.delete(rateLimitKey);

    // Session payload with HMAC signature
    const sessionToken = await createAdminSessionToken({
      email: matchedAdmin.email,
      role: "admin",
      issuedAt: Date.now(),
    });

    const maxAge = rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60; // Max 7 days

    const res = NextResponse.json({
      success: true,
      user: {
        email: matchedAdmin.email,
        role: "admin",
        name: matchedAdmin.name,
      },
    });

    res.cookies.set("km_admin_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    });

    return res;
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: "Authentication failed. Please try again later." },
      { status: 500 }
    );
  }
}
