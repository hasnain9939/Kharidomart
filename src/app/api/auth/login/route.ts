import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { createUserSessionToken } from "@/lib/session";

// In-memory rate limiting: max 5 failed attempts per email per 15 minutes
const loginAttempts = new Map<string, { count: number; expiresAt: number }>();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter your email and password" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const now = Date.now();

    // Check rate limit
    const attemptRecord = loginAttempts.get(cleanEmail);
    if (attemptRecord && attemptRecord.expiresAt > now) {
      if (attemptRecord.count >= 5) {
        return NextResponse.json(
          {
            success: false,
            error: "Too many failed login attempts. Please wait 15 minutes before trying again.",
          },
          { status: 429 }
        );
      }
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        createdAt: true,
      },
    });

    const recordFailedAttempt = () => {
      const current = loginAttempts.get(cleanEmail);
      if (current && current.expiresAt > now) {
        current.count += 1;
      } else {
        loginAttempts.set(cleanEmail, { count: 1, expiresAt: now + 15 * 60 * 1000 });
      }
    };

    if (!user || !user.passwordHash) {
      recordFailedAttempt();
      return NextResponse.json(
        { success: false, error: "Invalid email or password. Please check your credentials." },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      recordFailedAttempt();
      return NextResponse.json(
        { success: false, error: "Invalid email or password. Please check your credentials." },
        { status: 401 }
      );
    }

    // Reset failed counter on success
    loginAttempts.delete(cleanEmail);

    // Create signed user session token
    const token = await createUserSessionToken({
      userId: user.id,
      email: user.email,
      role: "user",
      issuedAt: Date.now(),
    });

    const res = NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        provider: "email",
        joinedDate: new Date(user.createdAt).toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        }),
        address: user.address
          ? {
              addressLine: user.address,
              city: user.city || "",
              state: user.state || "",
              pincode: user.pincode || "",
            }
          : undefined,
      },
    });

    res.cookies.set("km_user_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return res;

  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json(
      { success: false, error: "Unable to sign in. Please try again." },
      { status: 500 }
    );
  }
}
