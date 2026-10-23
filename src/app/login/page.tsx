"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = searchParams.toString();
    const target = params ? `/account?${params}` : "/account";
    router.replace(target);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
      <div className="w-10 h-10 border-3 border-orange-500/20 border-t-[#ea580c] rounded-full animate-spin mb-3" />
      <p className="text-xs font-medium text-[#584237]">Opening customer login...</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-orange-500/20 border-t-[#ea580c] rounded-full animate-spin" />
        </div>
      }
    >
      <LoginRedirectContent />
    </Suspense>
  );
}
