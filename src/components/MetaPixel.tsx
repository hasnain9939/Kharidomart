"use client";

import { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

export default function MetaPixel() {
  const [pixelId, setPixelId] = useState<string | null>(
    process.env.NEXT_PUBLIC_META_PIXEL_ID && /^\d+$/.test(process.env.NEXT_PUBLIC_META_PIXEL_ID.trim())
      ? process.env.NEXT_PUBLIC_META_PIXEL_ID.trim()
      : null
  );
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  // Fetch active Pixel ID from store settings if not provided via environment variable
  useEffect(() => {
    if (pixelId) return;

    let isMounted = true;
    fetch("/api/meta-pixel")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.success && data?.pixelId && /^\d+$/.test(data.pixelId)) {
          setPixelId(data.pixelId);
        }
      })
      .catch(() => {
        // Silently fail if settings endpoint is unreachable
      });

    return () => {
      isMounted = false;
    };
  }, [pixelId]);

  // Track PageView on client-side route changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "PageView");
    }
  }, [pathname, searchParams]);

  if (!pixelId) {
    return null;
  }

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            
            // Respect cookie consent
            try {
              var consent = localStorage.getItem('kharidomart_cookie_consent');
              if (consent === 'essential') {
                fbq('consent', 'revoke');
              } else {
                fbq('consent', 'grant');
              }
            } catch (e) {}

            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
