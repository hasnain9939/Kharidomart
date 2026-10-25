import React from "react";
import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/data/categories";
import { Sparkles, ArrowRight } from "reicon-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Milestone Collections | Kharido Mart India",
  description:
    "Explore all curated collections of baby grooming essentials, screen-free Montessori toys, nursery night lights, and mom care products.",
  alternates: {
    canonical: "https://kharidomart.com/collections",
  },
  openGraph: {
    title: "All Milestone Collections | Kharido Mart India",
    description:
      "Explore all curated collections of quality-vetted baby grooming essentials, screen-free Montessori toys, and nursery night lights.",
    url: "https://kharidomart.com/collections",
    images: [{ url: "/assets/stitch/hero_showcase.jpg", width: 1200, height: 630, alt: "Kharido Mart Collections" }],
  },
};

export default function CollectionsPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://kharidomart.com",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Collections",
        "item": "https://kharidomart.com/collections",
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 bg-[#fdfbf7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-[#6b5850]">
        <Link href="/" className="hover:text-[#e06b5b] transition-colors">
          Home
        </Link>
        <span className="text-stone-300">/</span>
        <span className="text-[#2b1f1a] font-bold">Collections</span>
      </nav>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#fdedeb] via-[#fbf7f0] to-white p-8 sm:p-12 rounded-3xl border border-[#eddcd1] space-y-3 shadow-2xs">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#e06b5b] bg-white px-3 py-1 rounded-full border border-[#f5c7c1]">
          <Sparkles size={13} weight="Filled" />
          <span>Curated For Little Milestones</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#2b1f1a] tracking-tight">
          Explore Our Milestone Collections
        </h1>
        <p className="text-base sm:text-lg text-[#2b1f1a] font-medium max-w-2xl leading-relaxed">
          From tear-free grooming to screen-free sensory wonder, discover thoughtfully crafted essentials for babies, toddlers, and moms.
        </p>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/collections/${cat.slug}`}
            className="group block bg-white rounded-3xl border border-[#eddcd1] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1"
          >
            <div className="relative aspect-4/3 w-full bg-[#fbf7f0] overflow-hidden">
              <Image
                src={cat.image || "/assets/stitch/hero_showcase.jpg"}
                alt={`${cat.name} Collection`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#e06b5b] bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full border border-[#eddcd1] shadow-2xs">
                  {cat.tag}
                </span>
              </div>
            </div>
            <div className="p-6 space-y-2">
              <h2 className="text-xl font-bold text-[#2b1f1a] group-hover:text-[#e06b5b] transition-colors">
                {cat.name}
              </h2>
              <p className="text-xs sm:text-sm text-[#6b5850] line-clamp-2">
                {cat.subtitle}
              </p>
              <div className="pt-2 flex items-center text-xs font-bold text-[#e06b5b] gap-1 group-hover:gap-2 transition-all">
                <span>View Collection</span>
                <ArrowRight size={14} weight="Outline" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
