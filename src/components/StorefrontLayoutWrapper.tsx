"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import QuickViewModal from "@/components/QuickViewModal";
import Toast from "@/components/Toast";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import SupportChatbot from "@/components/SupportChatbot";
import ExitIntentModal from "@/components/ExitIntentModal";
import MobileBottomNav from "@/components/MobileBottomNav";

function StorefrontLayoutInner({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  // Prevent browser from restoring scroll position down to the footer during page reload/refresh
  React.useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  if (isAdmin) {
    return (
      <>
        <div className="min-h-screen flex flex-col">{children}</div>
        <Toast />
      </>
    );
  }

  return (
    <>
      <AnnouncementBar />
      <Suspense fallback={<div className="h-16 sm:h-20 bg-white border-b border-slate-100" />}>
        <Header />
      </Suspense>
      <main className="flex-1 min-h-[calc(100vh-140px)] pb-16 md:pb-0">{children}</main>
      <Footer />

      {/* Interactive Modals, Drawers & Mobile Dock */}
      <MobileBottomNav />
      <CartDrawer />
      <QuickViewModal />
      <ExitIntentModal />
      <SupportChatbot />
      <Toast />

      {/* Compliance & Analytics */}
      <CookieConsentBanner />
      <GoogleAnalytics />
    </>
  );
}

export default function StorefrontLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen flex flex-col">{children}</div>}>
      <StorefrontLayoutInner>{children}</StorefrontLayoutInner>
    </Suspense>
  );
}
