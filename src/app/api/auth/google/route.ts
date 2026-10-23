import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, googleId, picture } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid Google email address is required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (name && typeof name === "string" && name.trim()) ? name.trim() : cleanEmail.split("@")[0];

    // Find existing user by email
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        createdAt: true,
      },
    });

    // If user does not exist, create a new record
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: cleanName,
          email: cleanEmail,
          passwordHash: null, // OAuth-authenticated user
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
          city: true,
          state: true,
          pincode: true,
          createdAt: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
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
  } catch (err: any) {
    console.error("Google auth error:", err);
    return NextResponse.json(
      { success: false, error: "Google authentication failed. Please try again." },
      { status: 500 }
    );
  }
}
