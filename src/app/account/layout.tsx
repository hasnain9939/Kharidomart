import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account & Orders",
  description:
    "Manage your profile, view live order history, check shipment tracking, and manage saved delivery addresses at Kharido Mart.",
  alternates: {
    canonical: "https://kharidomart.com/account",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
