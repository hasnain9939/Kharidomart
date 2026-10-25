import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { verifyUserSessionToken } from "@/lib/session";

// In-memory rate limiting: max 5 attempts per email per 15 minutes
const resetAttempts = new Map<string, { count: number; expiresAt: number }>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, newPassword, currentPassword, phone } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid registered email address" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const now = Date.now();

    // Check rate limit
    const attemptRecord = resetAttempts.get(cleanEmail);
    if (attemptRecord && attemptRecord.expiresAt > now) {
      if (attemptRecord.count >= 5) {
        return NextResponse.json(
          { success: false, error: "Too many password reset attempts. Please wait 15 minutes before trying again." },
          { status: 429 }
        );
      }
      attemptRecord.count += 1;
    } else {
      resetAttempts.set(cleanEmail, { count: 1, expiresAt: now + 15 * 60 * 1000 });
    }

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "New password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, name: true, phone: true, passwordHash: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No account found with this email address. Please create an account." },
        { status: 404 }
      );
    }

    // Identity Verification Challenge: Prevent account takeover
    const sessionCookie = req.cookies.get("km_user_session")?.value;
    const session = await verifyUserSessionToken(sessionCookie);
    const isSessionOwner = session && session.email.toLowerCase() === cleanEmail;

    let isVerified = false;

    if (isSessionOwner) {
      if (user.passwordHash) {
        isVerified = !!currentPassword && typeof currentPassword === "string" && verifyPassword(currentPassword, user.passwordHash);
      } else {
        // Authenticated OAuth user setting their first password
        isVerified = true;
      }
    } else if (user.passwordHash && currentPassword && typeof currentPassword === "string") {
      isVerified = verifyPassword(currentPassword, user.passwordHash);
    }

    if (!isVerified) {
      return NextResponse.json(
        {
          success: false,
          error: "Identity verification failed. Please provide your current password to authorize this password change.",
        },
        { status: 401 }
      );
    }

    // Hash and update the password
    const newPasswordHash = hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newPasswordHash },
    });

    // Clear rate limit record upon success
    resetAttempts.delete(cleanEmail);

    return NextResponse.json({
      success: true,
      message: "Password updated successfully. You can now sign in with your new password.",
    });

  } catch (err: any) {
    console.error("Password reset error:", err);
    return NextResponse.json(
      { success: false, error: "Unable to reset password. Please try again." },
      { status: 500 }
    );
  }
}
