import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES } from "@/data/categories";
import { getCachedAllProducts } from "@/lib/data-cache";
import { Product } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import { ArrowLeft, Sparkles, ShoppingBag, ArrowRight } from "reicon-react";
import type { Metadata } from "next";

export function generateStaticParams() {
  return CATEGORIES.map((cat) => ({
    category: cat.slug,
  }));
}

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = CATEGORIES.find((c) => c.slug === categorySlug);

  if (!category) {
    return {
      title: "Collection Not Found",
      description: "Collection not found at Kharido Mart.",
    };
  }

  const title = `${category.name} | Kharido Mart India`;
  const description = `${category.subtitle}. Explore gentle, child-safe essentials with pan-India Cash on Delivery and 24-hour doorstep replacements.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://kharidomart.com/collections/${category.slug}`,
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: `https://kharidomart.com/collections/${category.slug}`,
      siteName: "Kharido Mart",
      title,
      description,
      images: [
        {
          url: category.image || "/assets/stitch/hero_showcase.jpg",
          width: 800,
          height: 600,
          alt: category.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [category.image || "/assets/stitch/hero_showcase.jpg"],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = CATEGORIES.find((c) => c.slug === categorySlug);

  if (!category) {
    notFound();
  }

  const allProducts = await getCachedAllProducts();
  const categoryProducts = allProducts.filter((p) => p.categorySlug === categorySlug);

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
        "name": "Shop",
        "item": "https://kharidomart.com/shop",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": category.name,
        "item": `https://kharidomart.com/collections/${category.slug}`,
      },
    ],
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 bg-[#fdfbf7]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {/* Back button & Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-[#6b5850]">
        <Link
          href="/"
          className="hover:text-[#e06b5b] transition-colors"
        >
          Home
        </Link>
        <span className="text-stone-300">/</span>
        <Link
          href="/shop"
          className="hover:text-[#e06b5b] transition-colors"
        >
          Shop
        </Link>
        <span className="text-stone-300">/</span>
        <span className="text-[#2b1f1a] font-bold">{category.name}</span>
      </nav>

      {/* Category Hero Header with Warm Mom & Baby Tokens */}
      <div className="bg-gradient-to-r from-[#fdedeb] via-[#fbf7f0] to-white p-8 sm:p-12 rounded-3xl border border-[#eddcd1] space-y-3 shadow-2xs">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#e06b5b] bg-white px-3 py-1 rounded-full border border-[#f5c7c1]">
          <Sparkles size={13} weight="Filled" />
          <span>Milestone Collection • {category.tag}</span>
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#2b1f1a] tracking-tight">
          {category.name}
        </h1>
        <p className="text-base sm:text-lg text-[#2b1f1a] font-medium max-w-2xl leading-relaxed">
          {category.subtitle}
        </p>
        <p className="text-xs sm:text-sm text-[#6b5850] max-w-xl">
          {category.description}
        </p>
      </div>

      {/* Product List */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs sm:text-sm font-bold text-[#2b1f1a]">
            Showing {categoryProducts.length} Mom-Approved Products
          </p>
        </div>

        {categoryProducts.length === 0 ? (
          <div className="p-12 text-center space-y-4 bg-white rounded-3xl border border-[#eddcd1] max-w-xl mx-auto shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-[#fdedeb] text-[#e06b5b] flex items-center justify-center mx-auto">
              <ShoppingBag size={28} weight="Filled" />
            </div>
            <p className="text-base font-bold text-[#2b1f1a]">New Items Coming Soon to {category.name}</p>
            <p className="text-xs text-[#6b5850] max-w-sm mx-auto leading-relaxed">
              Our safety inspection team is currently verifying the next batch of certified essentials for this collection.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e06b5b] hover:bg-[#c95444] text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-95"
              >
                <span>Browse All Collections</span>
                <ArrowRight size={14} weight="Outline" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-all active:scale-95"
              >
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
