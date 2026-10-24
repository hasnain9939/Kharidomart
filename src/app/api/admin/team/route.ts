import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ADMIN_TEAM, AdminTeamMember } from "@/data/adminData";
import { verifyAdminSessionToken } from "@/lib/auth";

const TEAM_SETTING_KEY = "store_team_members";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("km_admin_session")?.value;
    if (!(await verifyAdminSessionToken(sessionCookie))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Administrator access required", team: [] },
        { status: 401 }
      );
    }

    const setting = await prisma.storeSetting.findUnique({
      where: { key: TEAM_SETTING_KEY },
    });


    if (!setting) {
      // Return default initial team from adminData
      return NextResponse.json({
        success: true,
        team: ADMIN_TEAM,
      });
    }

    const team = JSON.parse(setting.value);
    return NextResponse.json({
      success: true,
      team: Array.isArray(team) ? team : ADMIN_TEAM,
    });
  } catch (err: any) {
    console.error("Failed to fetch team members:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch team members" },
      { status: 500 }
    );
  }
}

// POST /api/admin/team (Admin only)
export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("km_admin_session")?.value;
    if (!(await verifyAdminSessionToken(sessionCookie))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Administrator access required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, email, role, hubAccess } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Load existing team
    const setting = await prisma.storeSetting.findUnique({
      where: { key: TEAM_SETTING_KEY },
    });

    const currentTeam: AdminTeamMember[] = setting ? JSON.parse(setting.value) : [...ADMIN_TEAM];

    const newMember: AdminTeamMember = {
      id: "team-" + Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: (role as AdminTeamMember["role"]) || "Fulfillment Agent",
      hubAccess: hubAccess?.trim() || "All Warehouses & Logistics Hubs",
      status: "Invited",
      lastActive: "Just invited",
    };

    currentTeam.push(newMember);

    await prisma.storeSetting.upsert({
      where: { key: TEAM_SETTING_KEY },
      update: { value: JSON.stringify(currentTeam) },
      create: { key: TEAM_SETTING_KEY, value: JSON.stringify(currentTeam) },
    });

    return NextResponse.json({
      success: true,
      member: newMember,
    });
  } catch (err: any) {
    console.error("Failed to add team member:", err);
    return NextResponse.json(
      { success: false, error: "Failed to add team member" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/team (Admin only)
export async function DELETE(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("km_admin_session")?.value;
    if (!(await verifyAdminSessionToken(sessionCookie))) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Administrator access required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("id");

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: "Member ID required" },
        { status: 400 }
      );
    }

    const setting = await prisma.storeSetting.findUnique({
      where: { key: TEAM_SETTING_KEY },
    });

    if (!setting) {
      return NextResponse.json({ success: true, message: "Member removed" });
    }

    const currentTeam: AdminTeamMember[] = JSON.parse(setting.value);
    const updatedTeam = currentTeam.filter((m) => m.id !== memberId);

    await prisma.storeSetting.update({
      where: { key: TEAM_SETTING_KEY },
      data: { value: JSON.stringify(updatedTeam) },
    });

    return NextResponse.json({
      success: true,
      message: "Team member removed successfully",
    });
  } catch (err: any) {
    console.error("Failed to remove team member:", err);
    return NextResponse.json(
      { success: false, error: "Failed to remove team member" },
      { status: 500 }
    );
  }
}
