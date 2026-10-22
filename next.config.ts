import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [375, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      {
        source: "/privacy-policy",
        destination: "/policies/privacy-policy",
        permanent: true,
      },
      {
        source: "/terms-and-conditions",
        destination: "/policies/terms-of-service",
        permanent: true,
      },
      {
        source: "/terms-of-service",
        destination: "/policies/terms-of-service",
        permanent: true,
      },
      {
        source: "/auth",
        destination: "/account",
        permanent: true,
      },
      {
        source: "/login",
        destination: "/account",
        permanent: true,
      },
      {
        source: "/thank-you",
        destination: "/checkout/success",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
