import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Secure Checkout",
  description:
    "Complete your order with Cash on Delivery (COD) or Instant UPI with an extra ₹50 discount. 256-Bit SSL Encrypted & 100% Buyer Protection.",
  alternates: {
    canonical: "https://kharidomart.com/checkout",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
