import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Support & Help Center",
  description:
    "Have questions about your order, replacement, or baby products? Reach out to Kharido Mart customer support via WhatsApp or email. Fast, friendly assistance for parents.",
  alternates: {
    canonical: "https://kharidomart.com/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
