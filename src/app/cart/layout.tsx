import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Shopping Bag",
  description:
    "Review your curated baby care and Montessori learning products. Enjoy free shipping on orders over ₹499 and extra ₹50 discount on UPI payments.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
