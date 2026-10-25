import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getCachedAllProducts } from "@/lib/data-cache";
import HomeProductSection from "@/components/HomeProductSection";
import {
  ArrowRight,
  ShieldCheck,
  TruckFast,
  Refresh,
  Award,
  Heart,
  TicketDiscount,
  ShoppingBag,
  Sparkles,
  Layers,
  Check,
  Headphones,
} from "reicon-react";

export default async function Home() {
  const products = await getCachedAllProducts();

  return (
    <div className="flex flex-col w-full bg-[#fdfbf7] text-[#2b1f1a]">
      {/* 1. TOP VALUE HIGHLIGHTS & TRUST STRIP (WARM BUTTERCREAM & EUCALYPTUS SAGE) */}
      <section className="w-full bg-[#fbf7f0] border-b border-[#eddcd1]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-xs">
            <div className="flex items-center justify-center gap-2 py-1">
              <TruckFast size={17} weight="Filled" className="text-[#e06b5b] shrink-0" />
              <span className="font-semibold text-[#2b1f1a]">
                Pan-India COD &amp; Fast Dispatch
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 py-1">
              <TicketDiscount size={17} weight="Filled" className="text-[#4f775d] shrink-0" />
              <span className="font-bold text-[#4f775d]">
                Extra ₹50 Instant OFF via UPI
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 py-1">
              <ShieldCheck size={17} weight="Filled" className="text-[#4f775d] shrink-0" />
              <span className="font-semibold text-[#2b1f1a]">
                Food-Grade &amp; BPA-Free Materials
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 py-1">
              <Refresh size={17} weight="Outline" className="text-[#6b5850] shrink-0" />
              <span className="font-semibold text-[#2b1f1a]">
                24-Hour Doorstep Replacement
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BESPOKE MOM & BABY HERO SECTION */}
      <section className="relative w-full bg-gradient-to-b from-[#fdfbf7] via-[#fbf7f0] to-[#f7f0e6]/70 overflow-hidden py-10 sm:py-16 lg:py-20">
        {/* Warm ambient peach & sage glows */}
        <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-[#fdedeb]/80 blur-3xl pointer-events-none -z-0" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[#eaf3ed]/70 blur-3xl pointer-events-none -z-0" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Hero Text Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Trust Badge Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#fdedeb] text-[#c95444] rounded-full border border-[#f5c7c1] shadow-2xs">
                <Heart size={14} weight="Filled" className="text-[#e06b5b]" />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  🍼 Gentle Care for Little Ones • Quality Tested
                </span>
              </div>

              {/* Display Header */}
              <h1 className="text-3xl sm:text-5xl lg:text-[54px] font-black text-[#2b1f1a] tracking-tight leading-[1.08]">
                Gentle care for{" "}
                <span className="text-[#e06b5b]">little ones</span>.{" "}
                Peace of mind for{" "}
                <span className="text-[#4f775d]">moms</span>.
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-[#6b5850] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Tear-free baby grooming, screen-free sensory discovery, and pure homemade nutrition—thoughtfully crafted to take the anxiety out of modern parenting.
              </p>

              {/* Action Buttons with Emil Kowalski Spring Physics */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <Link
                  href="/shop"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-[#e06b5b] hover:bg-[#c95444] active:scale-[0.97] text-white text-sm font-bold rounded-xl shadow-[0_4px_16px_rgba(224,107,91,0.35)] hover:shadow-[0_8px_24px_rgba(224,107,91,0.45)] transition-all duration-150"
                >
                  <ShoppingBag size={18} weight="Filled" />
                  <span>Shop Mom Favorites</span>
                  <ArrowRight size={16} weight="Outline" />
                </Link>

                <a
                  href="#collections-bento"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-[#fbf7f0] active:scale-[0.97] text-[#2b1f1a] text-sm font-bold rounded-xl border border-[#eddcd1] shadow-2xs hover:border-[#e06b5b]/50 transition-all duration-150"
                >
                  <Layers size={17} weight="Outline" />
                  <span>Explore Stages &amp; Play</span>
                </a>
              </div>

              {/* Real Metric Proof with Tabular Numerals */}
              <div className="pt-4 grid grid-cols-3 gap-3 max-w-lg mx-auto lg:mx-0">
                <div className="bg-white/90 p-3.5 rounded-2xl border border-[#eddcd1] shadow-2xs text-center lg:text-left">
                  <p className="font-mono text-xl sm:text-2xl text-[#e06b5b] font-black tabular-nums">
                    24 Hrs
                  </p>
                  <p className="text-xs text-[#6b5850] font-medium mt-0.5">Replacement Guarantee</p>
                </div>

                <div className="bg-white/90 p-3.5 rounded-2xl border border-[#eddcd1] shadow-2xs text-center lg:text-left">
                  <p className="font-mono text-xl sm:text-2xl text-[#2b1f1a] font-black tabular-nums">
                    24/7
                  </p>
                  <p className="text-xs text-[#6b5850] font-medium mt-0.5">WhatsApp Support</p>
                </div>

                <div className="bg-white/90 p-3.5 rounded-2xl border border-[#eddcd1] shadow-2xs text-center lg:text-left">
                  <p className="font-mono text-xl sm:text-2xl text-[#4f775d] font-black tabular-nums">
                    100%
                  </p>
                  {/* TODO(owner): Add lab test certificate if claiming 3rd-party certification */}
                  <p className="text-xs text-[#6b5850] font-medium mt-0.5">Food-Grade &amp; BPA-Free</p>
                </div>
              </div>
            </div>

            {/* Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative w-full aspect-square max-w-[480px] mx-auto rounded-3xl bg-white p-3 shadow-xl border border-[#eddcd1] overflow-hidden group">
                <Image
                  src="/assets/stitch/story_mother_child.jpg"
                  alt="Loving Indian mother caring gently for her baby with Kharido Mart essentials"
                  width={600}
                  height={600}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 480px"
                  className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700 ease-out"
                  priority
                />

                {/* Genuine Lab Safety & Non-Toxic Assurance Badge */}
                <div className="absolute top-6 left-6 right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-[#eddcd1] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#eaf3ed] text-[#4f775d] flex items-center justify-center shrink-0">
                      <ShieldCheck size={18} weight="Filled" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#2b1f1a] truncate">
                        100% Food-Grade &amp; Non-Toxic
                      </p>
                      <p className="text-[11px] text-[#6b5850] truncate">
                        BPA-Free Materials • Rounded Safety Edges
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 px-2.5 py-1 bg-[#eaf3ed] text-[#4f775d] text-[10px] font-bold uppercase rounded-full">
                    Curated Quality
                  </span>
                </div>

                {/* Bottom Parent Approved Badge */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-[#eddcd1] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#fdedeb] flex items-center justify-center text-[#e06b5b] shrink-0">
                      <Award size={22} weight="Filled" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#2b1f1a] leading-tight">
                        Tear-Free Guarantee
                      </p>
                      <p className="text-xs text-[#6b5850]">
                        Safe for sensitive skin &amp; tiny fingers
                      </p>
                    </div>
                  </div>
                  {/* TODO(owner): Add clinical report if claiming pediatric testing */}
                  <span className="px-2.5 py-1 bg-[#eaf3ed] text-[#4f775d] text-[10px] font-black uppercase tracking-wider rounded-full">
                    GENTLE ON SENSITIVE NAILS
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BENTO GRID CATEGORIES ("STAGE & PLAY COLLECTIONS") */}
      <section className="w-full py-14 sm:py-20 bg-white" id="collections-bento">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[#e06b5b] text-xs uppercase tracking-wider font-bold mb-2">
                <Sparkles size={14} weight="Filled" />
                <span>Curated by Indian Moms</span>
              </div>
              <h2 className="text-2xl sm:text-4xl text-[#2b1f1a] font-black tracking-tight">
                Designed for Every Parenting Milestone
              </h2>
              <p className="text-sm sm:text-base text-[#6b5850] mt-1 max-w-xl">
                Thoughtfully handpicked essentials that eliminate daily tears, encourage curious minds, and create calmer days.
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 text-[#e06b5b] hover:text-[#c95444] text-sm font-bold group"
            >
              <span>View all categories</span>
              <ArrowRight size={16} weight="Outline" className="transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Bento Grid 4 Curated Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            {/* 1. MOM & NEWBORN CARE (Col span 7) */}
            <div className="lg:col-span-7 bg-[#fdedeb]/70 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between group border border-[#eddcd1] shadow-2xs hover:shadow-xl transition-all duration-300 min-h-[380px]">
              <div className="z-10 max-w-md">
                <span className="px-3 py-1 bg-[#fdedeb] text-[#c95444] text-[11px] rounded-full font-bold uppercase tracking-wider border border-[#f5c7c1]">
                  Newborn &amp; Infant 0–12M
                </span>
                <h3 className="text-2xl sm:text-3xl text-[#2b1f1a] font-black mt-3 mb-2 tracking-tight">
                  Mom &amp; Baby Gentle Care
                </h3>
                <p className="text-sm text-[#6b5850] mb-6 leading-relaxed">
                  Whisper-quiet electric nail trimmers, soft LED lights, and ergonomic baby care aids that prevent cuts and bring tear-free tranquility.
                </p>
                <Link
                  href="/collections/mom-baby"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2b1f1a] text-white hover:bg-[#3d2c25] active:scale-[0.97] text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs"
                >
                  <span>Shop newborn care</span>
                  <ArrowRight size={15} weight="Outline" />
                </Link>
              </div>
              <div className="absolute right-0 bottom-0 w-3/5 h-4/5 pointer-events-none opacity-90 group-hover:scale-105 transition-transform duration-500 ease-out">
                <Image
                  src="/assets/stitch/bento_mom_baby.jpg"
                  alt="Mom and Baby Essentials"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 450px"
                  className="object-cover object-left rounded-tl-3xl"
                />
              </div>
            </div>

            {/* 2. Healthy Feeding & Home (Col span 5) */}
            <div className="lg:col-span-5 bg-[#fbf7f0] rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between group border border-[#eddcd1] shadow-2xs hover:shadow-xl transition-all duration-300 min-h-[380px]">
              <div className="z-10 max-w-xs">
                <span className="px-3 py-1 bg-white text-[#4f775d] text-[11px] rounded-full font-bold uppercase tracking-wider border border-[#d2e7d7]">
                  Wholesome Nutrition
                </span>
                <h3 className="text-2xl sm:text-3xl text-[#2b1f1a] font-black mt-3 mb-2 tracking-tight">
                  Purees &amp; Feeding
                </h3>
                <p className="text-sm text-[#6b5850] mb-6 leading-relaxed">
                  Rechargeable mini puree choppers and hygienic water dispensers for fresh, healthy baby meals in seconds.
                </p>
                <Link
                  href="/collections/home-kitchen"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2b1f1a] text-white hover:bg-[#3d2c25] active:scale-[0.97] text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs"
                >
                  <span>Shop baby feeding</span>
                  <ArrowRight size={15} weight="Outline" />
                </Link>
              </div>
              <div className="absolute -right-4 -bottom-4 w-1/2 h-3/4 pointer-events-none group-hover:scale-105 transition-transform duration-500 ease-out">
                <Image
                  src="/assets/stitch/bento_home_kitchen.jpg"
                  alt="Home and Kitchen Organizers"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 320px"
                  className="object-cover rounded-tl-3xl shadow-md"
                />
              </div>
            </div>

            {/* 3. Screen-Free Montessori & Play (Col span 5) */}
            <div className="lg:col-span-5 bg-[#eaf3ed] rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between group border border-[#d2e7d7] shadow-2xs hover:shadow-xl transition-all duration-300 min-h-[360px]">
              <div className="z-10 max-w-xs">
                <span className="px-3 py-1 bg-white text-[#4f775d] text-[11px] rounded-full font-bold uppercase tracking-wider border border-[#d2e7d7]">
                  Toddlers 1–4 Years
                </span>
                <h3 className="text-2xl sm:text-3xl text-[#2b1f1a] font-black mt-3 mb-2 tracking-tight">
                  Screen-Free Montessori
                </h3>
                <p className="text-sm text-[#6b5850] mb-6 leading-relaxed">
                  Interactive phonics sound books, sensory busy boards, and cognitive developmental tools that replace screen time with active imagination.
                </p>
                <Link
                  href="/collections/fun-clever-finds"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2b1f1a] text-white hover:bg-[#3d2c25] active:scale-[0.97] text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs"
                >
                  <span>Shop Montessori play</span>
                  <ArrowRight size={15} weight="Outline" />
                </Link>
              </div>
              <div className="absolute -right-4 -bottom-4 w-1/2 h-3/4 pointer-events-none group-hover:scale-105 transition-transform duration-500 ease-out">
                <Image
                  src="/assets/stitch/bento_fun_clever.jpg"
                  alt="Fun and Clever Educational Toys"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 320px"
                  className="object-cover rounded-tl-3xl shadow-md"
                />
              </div>
            </div>

            {/* 4. Nursery & Night Lighting (Col span 7) */}
            <div className="lg:col-span-7 bg-[#f6f1eb] rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between group border border-[#eddcd1] shadow-2xs hover:shadow-xl transition-all duration-300 min-h-[360px]">
              <div className="z-10 max-w-md">
                <span className="px-3 py-1 bg-white text-[#2b1f1a] text-[11px] rounded-full font-bold uppercase tracking-wider border border-[#eddcd1]">
                  Nursery Bedtime
                </span>
                <h3 className="text-2xl sm:text-3xl text-[#2b1f1a] font-black mt-3 mb-2 tracking-tight">
                  Cozy Nursery Lamps
                </h3>
                <p className="text-sm text-[#6b5850] mb-6 leading-relaxed">
                  Touch-dimmable, warm ambient bedside lights with zero blue-light flicker. Ideal for midnight nursing sessions and soothing bedtime stories.
                </p>
                <Link
                  href="/collections/smart-gadgets"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2b1f1a] text-white hover:bg-[#3d2c25] active:scale-[0.97] text-xs sm:text-sm font-bold rounded-xl transition-all shadow-xs"
                >
                  <span>Shop nursery lights</span>
                  <ArrowRight size={15} weight="Outline" />
                </Link>
              </div>
              <div className="absolute right-0 bottom-0 w-3/5 h-4/5 pointer-events-none group-hover:scale-105 transition-transform duration-500 ease-out">
                <Image
                  src="/assets/stitch/bento_smart_gadgets.jpg"
                  alt="Smart Gadgets and Desk Lamps"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 450px"
                  className="object-cover object-left rounded-tl-3xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED PRODUCTS & BEST-SELLERS */}
      <HomeProductSection initialProducts={products} />

      {/* 5. UPI / PREPAID INCENTIVE BANNER (WARM ROASTED ESPRESSO & CORAL ACCENTS) */}
      <section className="w-full py-8 bg-[#fdfbf7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-[#2c1e19] via-[#3a2720] to-[#2c1e19] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-2 z-10 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#4f775d]/40 text-[#a3e0b5] border border-[#a3e0b5]/30 rounded-full text-xs font-bold uppercase tracking-wider">
                <Check size={14} weight="Filled" />
                <span>Zero Cash Hassle • Express Priority Packing</span>
              </div>
              <h3 className="text-xl sm:text-3xl font-black tracking-tight text-white">
                Pay with UPI or GPay &amp; Get an <span className="text-[#f5a195]">Instant ₹50 Discount</span>
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
                Skip searching for exact cash change on delivery. Every prepaid order gets pushed straight to our priority safe-packaging queue.
              </p>
            </div>

            <div className="z-10 shrink-0">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#e06b5b] hover:bg-[#c95444] active:scale-[0.97] text-white text-xs sm:text-sm font-black rounded-xl shadow-lg transition-all"
              >
                <span>Shop with Instant UPI Discount</span>
                <ArrowRight size={16} weight="Outline" />
              </Link>
            </div>

            {/* Background design flourish */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#e06b5b]/20 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* 6. FOUR PILLARS OF TRUST FOR MOMS */}
      <section className="w-full py-14 sm:py-20 bg-[#fbf7f0] border-t border-[#eddcd1]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 bg-white rounded-2xl border border-[#eddcd1] shadow-2xs flex flex-col justify-between group hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#fdedeb] text-[#e06b5b] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <ShieldCheck size={24} weight="Filled" />
                </div>
                <h3 className="text-base font-black text-[#2b1f1a] mb-1.5">BPA-Free &amp; Child-Friendly Materials</h3>
                <p className="text-xs text-[#6b5850] leading-relaxed">
                  Food-grade silicone, smooth rounded edges, and non-toxic materials curated for sensitive little hands.
                </p>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#eddcd1] shadow-2xs flex flex-col justify-between group hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#eaf3ed] text-[#4f775d] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <TruckFast size={24} weight="Filled" />
                </div>
                <h3 className="text-base font-black text-[#2b1f1a] mb-1.5">24-48h Pan-India Dispatch</h3>
                <p className="text-xs text-[#6b5850] leading-relaxed">
                  Real-time WhatsApp dispatch alerts with fast express shipping via BlueDart &amp; Delhivery across 19,000+ pin codes.
                </p>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#eddcd1] shadow-2xs flex flex-col justify-between group hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#fbf7f0] text-[#c95444] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Award size={24} weight="Filled" />
                </div>
                {/* TODO(owner): Add pediatrician testing documentation if reinstating claim */}
                <h3 className="text-base font-black text-[#2b1f1a] mb-1.5">Parent Tested &amp; Curated</h3>
                <p className="text-xs text-[#6b5850] leading-relaxed">
                  Every product is curated specifically for safe, ergonomic handling to eliminate stress and crying for both baby and parent.
                </p>
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-[#eddcd1] shadow-2xs flex flex-col justify-between group hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#f5f0ea] text-[#2b1f1a] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  <Headphones size={24} weight="Filled" />
                </div>
                <h3 className="text-base font-black text-[#2b1f1a] mb-1.5">24-Hour Doorstep Replacement</h3>
                <p className="text-xs text-[#6b5850] leading-relaxed">
                  Prompt replacement if any item arrives damaged or defective. Simply share an unboxing video within 24 hours on WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. MARQUEE CONTINUITY STRIP (WARM ESPRESSO & CORAL) */}
      <section className="w-full bg-[#2c1e19] text-white py-3.5 overflow-hidden border-t border-[#eddcd1]/20">
        <div className="animate-marquee items-center gap-8 text-xs font-mono uppercase tracking-widest tabular-nums">
          <div className="flex items-center gap-8 shrink-0">
            <span className="text-[#f5a195]">🍼 Kharido Mart • Kids &amp; Moms Curated Discoveries</span>
            <span className="text-white/40">•</span>
            <span className="text-white">Pan-India Cash on Delivery (COD)</span>
            <span className="text-white/40">•</span>
            <span className="text-[#a3e0b5]">Extra ₹50 Instant Discount on UPI Payments</span>
            <span className="text-white/40">•</span>
            <span className="text-white">Gentle &amp; Non-Toxic Materials</span>
            <span className="text-white/40">•</span>
          </div>
          <div className="flex items-center gap-8 shrink-0" aria-hidden="true">
            <span className="text-[#f5a195]">🍼 Kharido Mart • Kids &amp; Moms Curated Discoveries</span>
            <span className="text-white/40">•</span>
            <span className="text-white">Pan-India Cash on Delivery (COD)</span>
            <span className="text-white/40">•</span>
            <span className="text-[#a3e0b5]">Extra ₹50 Instant Discount on UPI Payments</span>
            <span className="text-white/40">•</span>
            <span className="text-white">Gentle &amp; Non-Toxic Materials</span>
            <span className="text-white/40">•</span>
          </div>
        </div>
      </section>
    </div>
  );
}
