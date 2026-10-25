import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createUserSessionToken } from "@/lib/session";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { accessToken } = body;

    // 1. Mandatory Token Verification: accessToken is strictly required
    if (!accessToken || typeof accessToken !== "string") {
      return NextResponse.json(
        { success: false, error: "Google authentication token is required." },
        { status: 401 }
      );
    }

    let verifiedEmail = "";
    let verifiedName = "";

    try {
      const googleRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!googleRes.ok) {
        return NextResponse.json(
          { success: false, error: "Invalid or expired Google authentication token." },
          { status: 401 }
        );
      }

      const googleData = await googleRes.json();
      if (!googleData.email || typeof googleData.email !== "string" || !googleData.email.includes("@")) {
        return NextResponse.json(
          { success: false, error: "Unable to verify email address from Google." },
          { status: 400 }
        );
      }

      verifiedEmail = googleData.email.trim().toLowerCase();
      verifiedName = (googleData.name || verifiedEmail.split("@")[0]).trim();
    } catch (err: unknown) {
      console.error("Google token verification network error:", err);
      return NextResponse.json(
        { success: false, error: "Google authentication service unavailable. Please try again." },
        { status: 502 }
      );
    }

    // 2. Query user record in database
    const existingUser = await prisma.user.findUnique({
      where: { email: verifiedEmail },
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

    let user = existingUser;

    // If user does not exist, create a new record
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: verifiedName || verifiedEmail.split("@")[0],
          email: verifiedEmail,
          passwordHash: null, // OAuth-authenticated user
        },
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
    }

    // 3. Issue signed user session token
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
        provider: "google",
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
    console.error("Google auth error:", err);
    return NextResponse.json(
      { success: false, error: "Google authentication failed. Please try again." },
      { status: 500 }
    );
  }
}

