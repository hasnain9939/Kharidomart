import React from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Product } from "@/data/products";
import { formatProduct } from "@/lib/products";
import ProductDetailsClient from "@/components/ProductDetailsClient";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const dbProduct = await prisma.product.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
  });

  if (!dbProduct) {
    return {
      title: "Product Not Found | Kharido Mart",
      description: "This item is currently not available at Kharido Mart.",
    };
  }

  const product = formatProduct(dbProduct);
  const primaryImage = product.images[0] || "/assets/stitch/hero_showcase.jpg";
  const title = `${product.title} | Kharido Mart India`;
  const description =
    product.description.slice(0, 155) +
    " — 100% Quality Inspected, Pan-India Cash on Delivery & Free 7-Day Replacement.";

  return {
    title,
    description,
    keywords: [
      product.title,
      product.category,
      product.shortTitle,
      "online shopping India",
      "Kharido Mart",
      "buy online India COD",
    ],
    alternates: {
      canonical: `https://kharidomart.com/products/${product.slug}`,
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: `https://kharidomart.com/products/${product.slug}`,
      siteName: "Kharido Mart",
      title,
      description,
      images: [
        {
          url: primaryImage,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [primaryImage],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const dbProduct = await prisma.product.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
  });

  if (!dbProduct) {
    notFound();
  }

  const product = formatProduct(dbProduct);

  const relatedDb = await prisma.product.findMany({
    where: {
      id: { not: dbProduct.id },
    },
    take: 3,
  });

  const relatedProducts = relatedDb.map(formatProduct);

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.title,
    "image": product.images.map((img) =>
      img.startsWith("http") ? img : `https://kharidomart.com${img}`
    ),
    "description": product.description,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "Kharido Mart",
    },
    "offers": {
      "@type": "Offer",
      "url": `https://kharidomart.com/products/${product.slug}`,
      "priceCurrency": "INR",
      "price": product.price,
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Kharido Mart",
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": product.price >= 499 ? 0 : 79,
          "currency": "INR",
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 0,
            "maxValue": 1,
            "unitCode": "d",
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 2,
            "maxValue": 4,
            "unitCode": "d",
          },
        },
      },
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating || 4.9,
      "reviewCount": product.reviewsCount || 128,
      "bestRating": 5,
      "worstRating": 1,
    },
  };

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
        "name": product.category,
        "item": "https://kharidomart.com/shop",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.title,
        "item": `https://kharidomart.com/products/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ProductDetailsClient
        product={product}
        relatedProducts={relatedProducts}
      />
    </>
  );
}
