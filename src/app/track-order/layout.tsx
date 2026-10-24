import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Order",
  description:
    "Track your Kharido Mart order in real time. Enter your Order ID and phone number or AWB number to check dispatch, transit, and express courier delivery status.",
  alternates: {
    canonical: "https://kharidomart.com/track-order",
  },
};

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
