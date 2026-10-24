import type { Metadata } from "next";
import { Suspense } from "react";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import StorefrontLayoutWrapper from "@/components/StorefrontLayoutWrapper";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const fontSpace = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kharidomart.com"),
  title: {
    default: "Kharido Mart | Gentle Baby Care, Montessori Play & Mom Essentials",
    template: "%s | Kharido Mart India",
  },
  description:
    "India's trusted online store for gentle baby care, tear-free electric trimmers, screen-free Montessori sound books, and cozy nursery lights. 100% Baby-Safe, Cash on Delivery pan-India.",
  keywords: [
    "baby nail trimmer India",
    "electric baby nail file",
    "screen-free learning toys",
    "interactive sound book for kids",
    "montessori busy board India",
    "kids and moms products online",
    "baby care essentials COD India",
    "kharido mart",
    "pediatrician approved baby products",
  ],
  authors: [{ name: "Kharido Mart Team" }],
  creator: "Kharido Mart",
  publisher: "Kharido Mart",
  alternates: {
    canonical: "https://kharidomart.com",
  },
  icons: {
    icon: [
      { url: "/assets/images/kharidomart-cart-icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/assets/images/kharidomart-cart-icon.svg",
    shortcut: "/assets/images/kharidomart-cart-icon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://kharidomart.com",
    siteName: "Kharido Mart",
    title: "Kharido Mart | Gentle Baby Care, Montessori Play & Mom Essentials",
    description:
      "India's trusted store for gentle baby grooming, screen-free sensory discovery, and pure homemade nutrition. Quality checked & delivered Pan-India.",
    images: [
      {
        url: "/assets/stitch/hero_showcase.jpg",
        width: 1200,
        height: 630,
        alt: "Kharido Mart - Gentle Care for Little Ones, Peace of Mind for Moms",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kharido Mart | Gentle Baby Care & Montessori Toys",
    description:
      "Tear-free grooming, screen-free sound books, and non-toxic nursery essentials. Pan-India Cash on Delivery.",
    images: ["/assets/stitch/hero_showcase.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://kharidomart.com/#organization",
        "name": "Kharido Mart",
        "url": "https://kharidomart.com",
        "logo": "https://kharidomart.com/assets/images/kharidomart-cart-icon.svg",
        "description": "India's trusted online store for gentle baby care, Montessori toys, and mom essentials.",
        "areaServed": "IN"
      },
      {
        "@type": "WebSite",
        "@id": "https://kharidomart.com/#website",
        "url": "https://kharidomart.com",
        "name": "Kharido Mart",
        "description": "Gentle baby care, Montessori play, and nursery essentials with pan-India Cash on Delivery.",
        "publisher": {
          "@id": "https://kharidomart.com/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://kharidomart.com/shop?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": ["LocalBusiness", "Store"],
        "@id": "https://kharidomart.com/#localbusiness",
        "name": "Kharido Mart",
        "url": "https://kharidomart.com",
        "logo": "https://kharidomart.com/assets/images/kharidomart-cart-icon.svg",
        "image": "https://kharidomart.com/assets/stitch/hero_showcase.jpg",
        "description": "India's trusted online store for gentle baby care, tear-free electric trimmers, screen-free Montessori sound books, and postpartum mom wellness.",
        "telephone": "+91 85400 17572",
        "email": "kharidomartsupport@gmail.com",
        "priceRange": "₹₹",
        "currenciesAccepted": "INR",
        "paymentAccepted": "Cash on Delivery, UPI, Credit Card, Debit Card, Net Banking",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Plot 42, Marol Industrial Area, Andheri East",
          "addressLocality": "Mumbai",
          "addressRegion": "Maharashtra",
          "postalCode": "400093",
          "addressCountry": "IN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": "19.1197",
          "longitude": "72.8841"
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "opens": "09:00",
            "closes": "21:00"
          }
        ],
        "sameAs": [
          "https://kharidomart.com"
        ]
      }
    ]
  };

  return (
    <html lang="en" className={`${fontSans.variable} ${fontSpace.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-[#fdfbf7] text-[#2b1f1a] selection:bg-[#e06b5b] selection:text-white">
        <StoreProvider>
          <StorefrontLayoutWrapper>{children}</StorefrontLayoutWrapper>
        </StoreProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
