"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  TruckFast,
  ShoppingBag,
  Box,
  Users,
  TicketDiscount,
  Chart,
  Setting,
  Search,
  Notification,
  Add,
  ArrowRight,
  Menu,
  CloseCircle,
  ShieldCheck,
  Logout,
} from "reicon-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [adminUser, setAdminUser] = useState<{ email: string; name: string } | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (pathname === "/admin/login") return;

    let isMounted = true;

    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/me");
        const data = await res.json();
        if (isMounted) {
          if (res.ok && data.authenticated) {
            setIsAuthenticated(true);
            setAdminUser(data.user);
          } else {
            setIsAuthenticated(false);
            router.push("/admin/login");
          }
        }
      } catch {
        if (isMounted) {
          setIsAuthenticated(false);
          router.push("/admin/login");
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  const handleSignOut = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout
    }
    router.push("/admin/login");
    router.refresh();
  };

  const navItems = [
    {
      title: "Dashboard / Overview",
      href: "/admin",
      exact: true,
      icon: Activity,
    },
    {
      title: "Orders & Fulfillment",
      href: "/admin/orders",
      icon: TruckFast,
    },
    {
      title: "Product Inventory",
      href: "/admin/products",
      icon: ShoppingBag,
    },
    {
      title: "Shopify Warehouse",
      href: "/admin/inventory",
      icon: Box,
    },
    {
      title: "Customer Directory",
      href: "/admin/customers",
      icon: Users,
    },
    {
      title: "Marketing & Coupons",
      href: "/admin/marketing",
      icon: TicketDiscount,
    },
    {
      title: "Store Analytics",
      href: "/admin/analytics",
      icon: Chart,
    },
    {
      title: "Settings & Store Profile",
      href: "/admin/settings",
      icon: Setting,
    },
  ];

  const isActive = (href: string, exact = false) => {
    if (exact) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  // If on login page, render children directly without admin shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // Redirecting state if authentication check failed
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#071321] text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#f97316] to-[#ea580c] flex items-center justify-center font-bold text-white text-xl shadow-[0_4px_20px_rgba(249,115,22,0.4)] animate-pulse mb-4">
          K
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
          <span className="w-3.5 h-3.5 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin"></span>
          <span>Redirecting to Administrator Login...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col lg:flex-row antialiased w-full max-w-full overflow-x-hidden">
      {/* Mobile Header Bar */}
      <div className="lg:hidden sticky top-0 z-50 bg-[#0b1c30] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#f97316] flex items-center justify-center font-bold text-white shadow-sm">
            K
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight">Kharido Mart</span>
            <span className="text-[10px] text-[#ffedd5] font-semibold uppercase tracking-wider">
              Admin HQ
            </span>
          </div>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? (
            <CloseCircle size={22} weight="Outline" />
          ) : (
            <Menu size={22} weight="Outline" />
          )}
        </button>
      </div>

      {/* Mobile Slide-out Drawer */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 bg-[#0b1c30] text-[#eaf1ff] h-full p-4 flex flex-col justify-between overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#f97316] flex items-center justify-center font-bold text-white">
                    K
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">Kharido Mart</div>
                    <div className="text-[10px] text-[#ffedd5] font-semibold uppercase tracking-wider">
                      Merchant Console
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#15803d]/30 text-[#4ade80] text-[10px] font-bold border border-[#4ade80]/30">
                  LIVE
                </span>
              </div>

              {/* Store Status */}
              <div className="mb-4 p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#15803d] animate-pulse"></span>
                  <span className="text-xs text-white/90 font-medium">Store Online</span>
                </div>
                <Link
                  href="/"
                  target="_blank"
                  className="text-xs text-[#ffedd5] hover:underline flex items-center gap-1 font-semibold"
                >
                  View Store <ArrowRight size={12} weight="Outline" />
                </Link>
              </div>

              {/* Navigation */}
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => {
                  const active = isActive(item.href, item.exact);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all ${
                        active
                          ? "bg-[#f97316] text-white font-semibold shadow-sm"
                          : "text-white/70 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} weight={active ? "Filled" : "Outline"} />
                        <span>{item.title}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Profile footer in mobile */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f97316] to-[#ea580c] flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  AD
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Store Admin</div>
                  <div className="text-[11px] text-white/50">{adminUser?.email || "admin@kharidomart.com"}</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Link href="/admin/settings" className="text-white/50 hover:text-white p-1">
                  <Setting size={18} weight="Outline" />
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="text-white/50 hover:text-[#ef4444] p-1 cursor-pointer"
                  title="Sign Out"
                >
                  <Logout size={18} weight="Outline" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-72 bg-[#0b1c30] text-[#eaf1ff] z-50 flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Header Brand */}
          <div className="p-5 flex items-center justify-between border-b border-white/5">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#f97316] flex items-center justify-center font-extrabold text-white text-base shadow-[0_2px_8px_rgba(249,115,22,0.4)]">
                K
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white leading-none">
                  Kharido Mart
                </span>
                <span className="text-[10px] text-[#ffedd5] font-bold uppercase tracking-wider mt-1">
                  Store Admin HQ
                </span>
              </div>
            </Link>
            <span className="px-2 py-0.5 rounded-full bg-[#15803d]/30 text-[#4ade80] text-[10px] font-bold tracking-wider border border-[#4ade80]/30">
              PRISMA
            </span>
          </div>

          {/* Store Live Pill */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#15803d] animate-pulse"></span>
                <span className="text-xs text-white/90 font-medium">Store Online</span>
              </div>
              <Link
                href="/"
                target="_blank"
                className="text-xs text-[#ffedd5] hover:text-white hover:underline flex items-center gap-1 font-semibold transition-colors"
              >
                View Store <ArrowRight size={12} weight="Outline" />
              </Link>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-2 flex flex-col gap-1.5">
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 group ${
                    active
                      ? "bg-[#f97316] text-white font-semibold shadow-[0_4px_14px_0_rgba(249,115,22,0.35)]"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={19} weight={active ? "Filled" : "Outline"} />
                    <span className="tracking-tight">{item.title}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Card */}
        <div className="p-4 border-t border-white/5 bg-[#081524]">
          <div className="p-2.5 rounded-xl bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                AD
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-white leading-tight truncate">
                  Store Administrator
                </span>
                <span className="text-[11px] text-white/60 truncate">{adminUser?.email || "admin@kharidomart.com"}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Link
                href="/admin/settings"
                className="text-white/60 hover:text-white p-1 rounded-lg transition-colors"
                title="Settings"
              >
                <Setting size={18} weight="Outline" />
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-white/60 hover:text-[#ef4444] p-1 rounded-lg transition-colors cursor-pointer"
                title="Sign Out to Admin Login"
              >
                <Logout size={18} weight="Outline" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area with Top Header */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen w-full min-w-0 max-w-full">
        {/* Sticky Desktop Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-[#e2e8f0] px-4 lg:px-6 xl:px-8 flex items-center justify-between gap-3 shadow-xs w-full min-w-0">
          {/* Universal Search Input */}
          <div className="flex-1 max-w-sm sm:max-w-md lg:max-w-lg min-w-0">
            <div className="relative flex items-center">
              <Search
                size={18}
                weight="Outline"
                className="absolute left-3.5 text-[#565e74]"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search orders, customers, products..."
                className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#f8fafc] text-xs lg:text-sm text-[#0b1c30] placeholder-[#565e74]/70 border border-transparent focus:border-[#f97316]/30 focus:bg-white focus:outline-none transition-all truncate"
              />
            </div>
          </div>

          {/* Quick Stats & Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Database Engine Status */}
            <div className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f8fafc] border border-[#e2e8f0] text-xs font-semibold text-[#15803d]">
              <span className="w-2 h-2 rounded-full bg-[#15803d] animate-ping"></span>
              <span>Database: Prisma • PostgreSQL</span>
            </div>

            {/* Store Currency */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs font-semibold text-[#0b1c30]">
              <ShieldCheck size={16} weight="Filled" className="text-[#15803d]" />
              <span>Currency: INR (₹)</span>
            </div>

            {/* + Add New Product Button */}
            <Link
              href="/admin/products/new"
              className="flex items-center gap-1.5 px-3 sm:px-3.5 h-9 rounded-xl bg-[#f97316] hover:bg-[#ea580c] text-white text-xs font-bold shadow-[0_3px_10px_rgba(249,115,22,0.3)] transition-all shrink-0"
            >
              <Add size={16} weight="Outline" />
              <span className="hidden sm:inline">New Product</span>
            </Link>

            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-9 h-9 rounded-xl bg-[#f8fafc] hover:bg-[#e2e8f0] border border-[#e2e8f0] flex items-center justify-center text-[#565e74] relative transition-colors cursor-pointer"
                title="Notifications"
                aria-label="Notifications"
              >
                <Notification size={18} weight="Outline" />
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#e2e8f0] p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
                    <span className="font-bold text-sm text-[#0b1c30]">
                      Store Alerts
                    </span>
                    <span className="text-[11px] font-semibold text-[#15803d]">
                      System Healthy
                    </span>
                  </div>
                  <div className="flex flex-col gap-2.5 py-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#ffedd5]/50 border border-[#f97316]/20">
                      <div className="font-bold text-[#ea580c]">
                        Fulfillment Engine Ready
                      </div>
                      <div className="text-[#565e74] mt-0.5">
                        Shopify Warehouse integration and courier tracking active.
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/admin/orders"
                    onClick={() => setShowNotifications(false)}
                    className="block text-center text-xs font-bold text-[#f97316] pt-2 border-t border-[#e2e8f0] hover:underline"
                  >
                    View All Orders &rarr;
                  </Link>
                </div>
              )}
            </div>

            {/* Profile Avatar with Sign Out */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#f8fafc] hover:bg-[#fee2e2] text-xs font-semibold text-[#565e74] hover:text-[#dc2626] border border-[#e2e8f0] transition-colors cursor-pointer"
              title="Logout from Admin"
            >
              <Logout size={15} weight="Outline" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 xl:p-8 w-full min-w-0">{children}</main>
      </div>
    </div>
  );
}
