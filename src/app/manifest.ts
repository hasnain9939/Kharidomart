import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kharido Mart | Gentle Baby Care & Montessori Finds",
    short_name: "Kharido Mart",
    description:
      "India's trusted online store for gentle baby care, electric nail trimmers, screen-free Montessori learning, and mother essentials.",
    start_url: "/",
    display: "standalone",
    background_color: "#fdfbf7",
    theme_color: "#e06b5b",
    icons: [
      {
        src: "/assets/images/kharidomart-cart-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/assets/images/kharidomart-cart-icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/assets/images/kharidomart-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/favicon.ico",
        sizes: "48x48 32x32 16x16",
        type: "image/x-icon",
      },
    ],
  };
}
