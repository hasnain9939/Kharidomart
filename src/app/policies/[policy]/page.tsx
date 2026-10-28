import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { POLICIES } from "@/data/policies";
import { ArrowLeft, ShieldCheck, CheckCircle } from "reicon-react";
import type { Metadata } from "next";

export function generateStaticParams() {
  return Object.keys(POLICIES).map((policy) => ({
    policy,
  }));
}

interface PolicyPageProps {
  params: Promise<{ policy: string }>;
}

export async function generateMetadata({ params }: PolicyPageProps): Promise<Metadata> {
  const { policy: policySlug } = await params;
  const policy = POLICIES[policySlug];

  if (!policy) {
    return {
      title: "Store Policy | Kharido Mart",
    };
  }

  const canonicalUrl = `https://kharidomart.com/policies/${policySlug}`;

  return {
    title: `${policy.title} | Kharido Mart Legal & Compliance`,
    description: policy.summary || `${policy.title} of Kharido Mart Direct`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${policy.title} | Kharido Mart Legal & Compliance`,
      description: policy.summary || `${policy.title} of Kharido Mart Direct`,
      url: canonicalUrl,
      images: [{ url: "/assets/stitch/hero_showcase.jpg", width: 1200, height: 630, alt: policy.title }],
    },
  };
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { policy: policySlug } = await params;
  const policy = POLICIES[policySlug];

  if (!policy) {
    notFound();
  }

  const allPolicyLinks = [
    { label: "Privacy Policy", slug: "privacy-policy" },
    { label: "Replacement Policy (No Refund)", slug: "refund-policy" },
    { label: "Terms of Service", slug: "terms-of-service" },
    { label: "Shipping Policy", slug: "shipping-policy" },
    { label: "Legal Notice & Disclosures", slug: "legal-notice" },
    { label: "Customer Support & Contact", slug: "contact-information" },
  ];

  return (
    <div className="w-full bg-[#fdfbf7] min-h-screen py-10 sm:py-16">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#584237] hover:text-[#e06b5b] transition-colors bg-white px-3.5 py-2 rounded-xl border border-[#eddcd1] shadow-2xs"
          >
            <ArrowLeft size={16} weight="Outline" />
            <span>Back to Store</span>
          </Link>

          <span className="text-xs font-space font-semibold text-[#4f775d] bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full flex items-center gap-1.5">
            <ShieldCheck size={14} weight="Filled" /> Verified Legal Documentation
          </span>
        </div>

        {/* Main Document Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#eddcd1] shadow-xs space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-space font-bold uppercase tracking-wider text-[#e06b5b] bg-[#f6eee5] px-3.5 py-1 rounded-full">
              Kharido Mart Direct
            </span>
            <span className="text-xs text-[#584237]">
              Effective Date: {policy.lastUpdated || "October 2026"}
            </span>
            {policySlug === "refund-policy" && (
              <span className="text-xs font-space font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                Strict Replacement-Only
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2b1f1a] tracking-tight">
            {policy.title}
          </h1>

          {policySlug === "refund-policy" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 text-xs text-rose-900 space-y-1">
                <span className="font-extrabold text-sm text-rose-700 block flex items-center gap-1.5">
                  ⏱️ 24-Hour Strict Deadline
                </span>
                <p className="text-rose-800 leading-relaxed">
                  Replacement claims must be reported within <strong>24 hours</strong> of courier confirmed delivery. Late requests are strictly ineligible.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-extrabold text-sm text-amber-700 block flex items-center gap-1.5">
                  📹 Uncut Unboxing Video Mandatory
                </span>
                <p className="text-amber-800 leading-relaxed">
                  A single-take, continuous video showing the outer shipping label and opening of the parcel is required to process any replacement.
                </p>
              </div>
            </div>
          )}

          {policy.summary && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#eff4ff]/70 border border-[#eddcd1] text-xs sm:text-sm text-[#2b1f1a] leading-relaxed font-medium">
              {policy.summary}
            </div>
          )}
        </div>

        {/* Legal Document Sections Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Quick Table of Contents / Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
            <div className="bg-white rounded-3xl p-5 border border-[#eddcd1] shadow-xs space-y-3">
              <h3 className="font-space font-bold text-xs uppercase tracking-wider text-[#2b1f1a]">
                All Legal Policies
              </h3>
              <nav className="flex flex-col gap-1.5">
                {allPolicyLinks.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/policies/${item.slug}`}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                      item.slug === policySlug
                        ? "bg-[#e06b5b] text-white shadow-xs"
                        : "text-[#584237] hover:bg-slate-50 hover:text-[#2b1f1a]"
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.slug === policySlug && (
                      <CheckCircle size={14} weight="Filled" />
                    )}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Primary Policy Content (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-[#eddcd1] p-6 sm:p-10 shadow-xs space-y-8 text-sm text-[#2b1f1a] leading-relaxed">
            {policy.sections && policy.sections.length > 0 ? (
              policy.sections.map((section, idx) => (
                <div key={idx} className="space-y-3 pb-6 border-b border-[#eddcd1] last:border-0 last:pb-0">
                  <h2 className="font-extrabold text-base sm:text-lg text-[#2b1f1a]">
                    {section.title}
                  </h2>
                  <div className="space-y-2.5 text-[#584237] leading-relaxed">
                    {section.paragraphs.map((para, pIdx) => (
                      <p key={pIdx}>{para}</p>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="space-y-4 text-[#584237]">
                {policy.content.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            )}

            {/* Assistance Box */}
            <div className="pt-6 border-t border-[#eddcd1] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#eff4ff]/60 -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 p-6 sm:p-8 rounded-b-3xl">
              <div>
                <h4 className="font-bold text-sm text-[#2b1f1a]">
                  Need Help With Your Order?
                </h4>
                <p className="text-xs text-[#584237] mt-0.5">
                  Our customer support team is available to assist you with order queries and replacements.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href="/contact"
                  className="px-4 py-2.5 bg-[#e06b5b] hover:bg-[#c95444] text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                >
                  Contact Support
                </Link>
                <Link
                  href="/track-order"
                  className="px-4 py-2.5 bg-white text-[#2b1f1a] border border-[#eddcd1] hover:bg-slate-50 font-bold text-xs rounded-xl shadow-2xs transition-all"
                >
                  Track Your Order
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
