import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const sessionCookie = request.cookies.get("km_admin_session")?.value;

    let isAuthenticated = false;
    if (sessionCookie) {
      try {
        const decoded = JSON.parse(Buffer.from(sessionCookie, "base64").toString("utf-8"));
        if (decoded && decoded.role === "admin") {
          isAuthenticated = true;
        }
      } catch {
        isAuthenticated = false;
      }
    }

    // If accessing login page while already authenticated -> redirect to dashboard
    if (pathname === "/admin/login") {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    // For all protected admin routes -> redirect to login if unauthenticated
    if (!isAuthenticated) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
