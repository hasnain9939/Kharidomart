import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// Rate limiting: max 5 requests per IP per hour
const newsletterRateLimit = new Map<string, { count: number; resetAt: number }>();

const NewsletterSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address").max(100),
  turnstileToken: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const now = Date.now();

    // Check rate limit
    const record = newsletterRateLimit.get(ip);
    if (record && record.resetAt > now) {
      if (record.count >= 5) {
        return NextResponse.json(
          {
            success: false,
            error: "Too many requests. Please try again later.",
          },
          { status: 429 }
        );
      }
      record.count += 1;
    } else {
      newsletterRateLimit.set(ip, { count: 1, resetAt: now + 3600000 });
    }

    const rawBody = await req.json().catch(() => ({}));
    const parseResult = NewsletterSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.issues[0]?.message || "Invalid email address format.",
        },
        { status: 400 }
      );
    }

    const { email, turnstileToken } = parseResult.data;
    const cleanEmail = email.toLowerCase().trim();

    // Optional Turnstile bot verification if secret is configured in environment
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret && !turnstileSecret.includes("YOUR_") && turnstileToken) {
      try {
        const formData = new URLSearchParams();
        formData.append("secret", turnstileSecret);
        formData.append("response", turnstileToken);
        formData.append("remoteip", ip);

        const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
          method: "POST",
          body: formData,
        });

        const outcome = await verifyRes.json();
        if (!outcome.success) {
          return NextResponse.json(
            { success: false, error: "Bot verification failed. Please refresh and try again." },
            { status: 403 }
          );
        }
      } catch (cfErr) {
        console.warn("Turnstile verification check failed:", cfErr);
      }
    }

    // Check if customer exists in user database (prevent duplicate customer creation)
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, name: true, email: true },
    });

    // Check if a single-use welcome coupon was already issued to this email
    const existingCoupon = await prisma.discount.findFirst({
      where: {
        description: { contains: cleanEmail },
        code: { startsWith: "KM10-" },
      },
    });

    if (existingCoupon) {
      return NextResponse.json({
        success: true,
        code: existingCoupon.code,
        alreadySubscribed: true,
        message: `You're already subscribed! Your 10% welcome coupon is: ${existingCoupon.code}`,
      });
    }

    // Generate unique single-use code per email
    const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
    const uniqueCode = `KM10-${randomSuffix}`;

    const discount = await prisma.discount.create({
      data: {
        code: uniqueCode,
        type: "percentage",
        value: 10,
        minOrder: 299,
        description: `Single-use 10% welcome coupon for ${cleanEmail}`,
        active: true,
        usageCount: 0,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // If user record doesn't exist, create customer record only if requested or leave creation for checkout
    // to avoid phantom duplicate customer records without addresses or orders
    if (!existingUser) {
      try {
        await prisma.user.create({
          data: {
            email: cleanEmail,
            name: cleanEmail.split("@")[0] || "Subscriber",
          },
        });
      } catch (uErr: any) {
        // In case of race condition or existing unique email, ignore
        console.log("Customer record exists or race condition handled:", uErr?.message);
      }
    }

    return NextResponse.json({
      success: true,
      code: discount.code,
      message: `Welcome to Kharido Mart! Use coupon code ${discount.code} for 10% off your order.`,
    });
  } catch (error: any) {
    console.error("POST /api/newsletter error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Unable to complete newsletter subscription. Please try again.",
      },
      { status: 500 }
    );
  }
}
