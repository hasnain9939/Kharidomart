import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Mom & Baby Essentials",
  description:
    "Browse our complete catalog of gentle electric baby nail trimmers, Montessori sound books, sensory busy boards, and nursery lights. Pan-India COD available.",
  alternates: {
    canonical: "https://kharidomart.com/shop",
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
