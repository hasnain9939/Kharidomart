import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyUserSessionToken, verifyAdminSessionToken } from "@/lib/session";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, phone, address } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "User email is required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify caller session to prevent IDOR / Account Hijacking
    const userSessionCookie = req.cookies.get("km_user_session")?.value;
    const adminSessionCookie = req.cookies.get("km_admin_session")?.value;

    const userSession = await verifyUserSessionToken(userSessionCookie);
    const adminSession = await verifyAdminSessionToken(adminSessionCookie);

    const isAuthorized =
      (userSession && userSession.email.toLowerCase() === cleanEmail) ||
      Boolean(adminSession);

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Active user session required to modify profile." },
        { status: 401 }
      );
    }


    const updated = await prisma.user.update({
      where: { email: cleanEmail },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(phone !== undefined ? { phone: phone?.trim() || null } : {}),
        ...(address
          ? {
              address: address.addressLine || null,
              city: address.city || null,
              state: address.state || null,
              pincode: address.pincode || null,
            }
          : {}),
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

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone || "",
        provider: "email",
        joinedDate: new Date(updated.createdAt).toLocaleDateString("en-IN", {
          month: "short",
          year: "numeric",
        }),
        address: updated.address
          ? {
              addressLine: updated.address,
              city: updated.city || "",
              state: updated.state || "",
              pincode: updated.pincode || "",
            }
          : undefined,
      },
    });
  } catch (err: any) {
    console.error("Profile update error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
