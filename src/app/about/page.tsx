import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star, ShieldCheck, Heart } from "reicon-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Kharido Mart India",
  description:
    "Learn about Kharido Mart's mission to bring gentle baby care essentials, screen-free Montessori educational toys, and postpartum mom wellness to families across India.",
  alternates: {
    canonical: "https://kharidomart.com/about",
  },
  openGraph: {
    title: "About Kharido Mart | Gentle Baby Care & Montessori Toys",
    description:
      "Tear-free grooming, screen-free sound books, and non-toxic nursery essentials with Pan-India delivery.",
    url: "https://kharidomart.com/about",
    images: [{ url: "/assets/stitch/hero_showcase.jpg", width: 1200, height: 630, alt: "About Kharido Mart" }],
  },
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-extrabold uppercase tracking-widest text-amber-700 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200">
          Our Story & Mission
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-stone-900 tracking-tight">
          Know Us! 💛
        </h1>
        <p className="text-base sm:text-lg text-stone-600 font-medium leading-relaxed">
          Welcome to <strong className="text-stone-900">Kharido Mart</strong>, your destination for fun, learning, and everyday discovery!
        </p>
      </div>

      {/* Main Story Card */}
      <div className="rounded-3xl bg-white border border-stone-200 p-8 sm:p-12 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 text-stone-700 leading-relaxed text-sm sm:text-base">
            <h2 className="text-2xl font-bold text-stone-900">
              Making Every Moment More Exciting
            </h2>
            <p>
              We bring you a delightful collection of kids’ educational books, interactive sound books, sensory learning toys, and smart gadgets designed to make every little moment more engaging.
            </p>
            <p>
              Our aim is to help parents find fun, durable, and thoughtfully crafted products that inspire children’s curiosity, creativity, and love for learning—without relying on smartphones or tablet screens.
            </p>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 font-bold text-sm">
              &ldquo;Kharidomart – Explore More, Learn More, Smile More! 💛&rdquo;
            </div>
          </div>

          <div className="relative aspect-square rounded-2xl overflow-hidden shadow-md">
            <Image
              src="/assets/images/img_12_box-full-of-childrens-toys.jpg"
              alt="Kids learning toys"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Brand Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center">
            <Star size={24} weight="Filled" />
          </div>
          <h3 className="font-bold text-base text-stone-900">Quality First</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            We obsess over every detail and strive to deliver the highest quality, child-safe products at the best prices every time.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 mx-auto flex items-center justify-center">
            <ShieldCheck size={24} weight="Filled" />
          </div>
          <h3 className="font-bold text-base text-stone-900">Customer Care</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            We are always on your side. Keeping our loyal customers happy is our top priority and daily goal.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 mx-auto flex items-center justify-center">
            <Heart size={24} weight="Filled" />
          </div>
          <h3 className="font-bold text-base text-stone-900">Parent Approved</h3>
          <p className="text-xs text-stone-600 leading-relaxed">
            Every product is tested for safety, non-toxicity, and genuine everyday utility before being featured.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pt-6">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold px-8 py-3.5 rounded-2xl shadow-md transition-all text-sm"
        >
          <span>Explore Our Latest Arrivals</span>
          <ArrowRight size={16} weight="Outline" />
        </Link>
      </div>
    </div>
  );
}
