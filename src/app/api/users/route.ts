import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminSessionToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("km_admin_session")?.value;
    if (!(await verifyAdminSessionToken(sessionCookie))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Administrator access required", users: [] },
        { status: 401 }
      );
    }
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        state: true,
        pincode: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            total: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      users: users.map((u) => {
        const totalSpent = u.orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone ? (u.phone.startsWith("+91") ? u.phone : `+91 ${u.phone}`) : "N/A",
          city: u.city || "India",
          state: u.state || "",
          ordersCount: u.orders.length,
          lifetimeValue: totalSpent,
          lastOrderDate: new Date(u.createdAt).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
          }),
          tier: u.orders.length > 1 ? "Repeat Buyer" : u.orders.length === 1 ? "First-Time" : "Registered Member",
        };
      }),
    });
  } catch (err: any) {
    console.error("Fetch users error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch users", users: [] },
      { status: 500 }
    );
  }
}
