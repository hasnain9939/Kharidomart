"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ShoppingBag,
  Sparkles,
  ShieldCheck,
  Heart,
  TruckFast,
  Refresh,
} from "reicon-react";

interface HeroSlide {
  id: string;
  category: string;
  title: string;
  highlightWords: string;
  description: string;
  src: string;
  alt: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  trustPoints: string[];
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "sound-books",
    category: "Featured Milestone • 1–4 Years",
    title: "Interactive Sound Books That Spark Early Wonder",
    highlightWords: "Spark Early Wonder",
    description:
      "Screen-free musical storytelling with tactile audio buttons, lively animal sounds, and rhymes. Thoughtfully designed to build early vocabulary and joyful parent-child bonding.",
    src: "/assets/stitch/hero_sound_book_kids.jpg",
    alt: "Happy Indian child and smiling mother playing together with interactive musical sound book on nursery rug",
    primaryCtaText: "Shop Sound Books",
    primaryCtaLink:
      "/products/interactive-intelligence-sound-book-for-kids-screen-free-learning-toy",
    secondaryCtaText: "Explore Montessori Toys",
    secondaryCtaLink: "/collections/toys-games",
    trustPoints: [
      "Screen-Free Learning",
      "Child-Safe Rounded Corners",
      "Durable Board Pages",
    ],
  },
  {
    id: "baby-grooming",
    category: "Parent Favorite • 0–12 Months",
    title: "Tear-Free Baby Nail Grooming With Zero Snags",
    highlightWords: "Zero Snags or Nicks",
    description:
      "Whisper-quiet electric trimmer with 6 gentle cushioned filing heads and soft LED night light. Safely smooths tiny cuticles without nicking delicate newborn skin.",
    src: "/assets/stitch/hero_baby_grooming.jpg",
    alt: "Indian mother gently trimming infant nails with electric baby nail trimmer in nursery",
    primaryCtaText: "Shop Electric Trimmer",
    primaryCtaLink:
      "/products/electric-baby-nail-trimmer-with-led-light-6-interchangeable-filing-heads-adjustable-speed-quiet-motor-gentle-baby-nail-care-kit",
    secondaryCtaText: "View Mom & Baby Care",
    secondaryCtaLink: "/collections/mom-baby",
    trustPoints: [
      "Whisper-Quiet Motor",
      "6 Color-Coded Filing Pads",
      "Soft LED Night Light",
    ],
  },
  {
    id: "mother-baby-care",
    category: "Newborn Essentials • 0–6 Months",
    title: "Gentle Care For Little Ones. Peace Of Mind For Moms.",
    highlightWords: "Peace Of Mind For Moms",
    description:
      "Everyday baby essentials crafted to take the anxiety out of modern parenting—from gentle hygiene to soothing bedtime snuggles. 100% non-toxic and mom-vetted.",
    src: "/assets/stitch/hero_mother_baby_care.jpg",
    alt: "Loving Indian mother smiling and cuddling her happy 5-month-old baby in warm natural light",
    primaryCtaText: "Shop Mom Favorites",
    primaryCtaLink: "/collections/mom-baby",
    secondaryCtaText: "Explore All Products",
    secondaryCtaLink: "/shop",
    trustPoints: [
      "24-Hr Doorstep Replacement",
      "Pan-India Fast Dispatch",
      "Cash on Delivery Available",
    ],
  },
  {
    id: "tummy-time",
    category: "Early Development • 3–12 Months",
    title: "Tummy Time & Motor Milestones Made Truly Joyful",
    highlightWords: "Motor Milestones",
    description:
      "Ultra-soft organic quilted playmats and sensory toys designed to build neck strength, crawling confidence, and curious minds without cold floors or harsh synthetics.",
    src: "/assets/stitch/hero_tummy_time_play.jpg",
    alt: "Indian mother encouraging infant during tummy time on organic quilted pastel playmat",
    primaryCtaText: "Explore Sensory Play",
    primaryCtaLink: "/collections/toys-games",
    secondaryCtaText: "View Stages & Collections",
    secondaryCtaLink: "/shop",
    trustPoints: [
      "Pure Organic Cotton",
      "Non-Slip Cushioned Base",
      "Machine-Washable",
    ],
  },
  {
    id: "baby-feeding",
    category: "Weaning Essentials • 6–24 Months",
    title: "100% Food-Grade Silicone For Mess-Free Weaning",
    highlightWords: "Mess-Free Weaning",
    description:
      "Deep suction bowls that stay firmly anchored to highchairs, accompanied by gum-gentle flexible spoons and catch-all bibs. BPA-free, odorless, and microwave-safe.",
    src: "/assets/stitch/hero_baby_feeding.jpg",
    alt: "Happy infant self-feeding with food-grade silicone baby suction bowl and soft spoon",
    primaryCtaText: "Shop Feeding Essentials",
    primaryCtaLink: "/collections/mom-baby",
    secondaryCtaText: "Browse Collection",
    secondaryCtaLink: "/shop",
    trustPoints: [
      "100% Food-Grade Silicone",
      "BPA, PVC & Phthalate-Free",
      "Microwave & Dishwasher Safe",
    ],
  },
  {
    id: "peaceful-sleep",
    category: "Calm Sleep • 0–12 Months",
    title: "Serene Sleep Wrapped In Pure Organic Muslin",
    highlightWords: "Pure Organic Muslin",
    description:
      "Breathable, lightweight swaddles and soothing sleep essentials that prevent the startle reflex while keeping tiny bodies cozy, calm, and naturally temperature-balanced.",
    src: "/assets/stitch/hero_peaceful_sleep.jpg",
    alt: "Peaceful newborn baby sleeping serenely wrapped in organic muslin swaddle blanket in nursery",
    primaryCtaText: "Shop Bedtime Essentials",
    primaryCtaLink: "/collections/mom-baby",
    secondaryCtaText: "Discover Newborn Range",
    secondaryCtaLink: "/shop",
    trustPoints: [
      "Ultra-Breathable Weave",
      "Gets Softer With Every Wash",
      "Gentle On Eczema-Prone Skin",
    ],
  },
];

export default function HeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = HERO_SLIDES.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  // Autoplay slideshow with smooth 5s transition, pauses on hover or touch
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  const currentSlide = HERO_SLIDES[currentIndex];

  return (
    <section
      className="relative w-full overflow-hidden bg-[#14100e]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Kharido Mart Featured Milestones Slideshow"
    >
      {/* Expansive Full Display Image Carousel Background */}
      <div className="relative w-full min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] xl:min-h-[740px] flex items-center">
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-0" : "opacity-0 -z-10 pointer-events-none"
              }`}
              aria-hidden={!isActive}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={idx === 0}
                sizes="100vw"
                className={`w-full h-full object-cover transition-transform duration-10000 ease-out ${
                  isActive ? "scale-105" : "scale-100"
                }`}
              />
            </div>
          );
        })}

        {/* Cinematic Gradient Scrim (No box! Direct gradient over image for effortless WCAG readability) */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/35 lg:bg-gradient-to-r lg:from-black/90 lg:via-black/60 lg:to-black/25 pointer-events-none z-1"
          aria-hidden="true"
        />

        {/* Ambient Warm Color Vignette */}
        <div
          className="absolute inset-0 bg-radial from-transparent via-transparent to-black/60 pointer-events-none z-1"
          aria-hidden="true"
        />

        {/* Main Content Floating Directly Over The Image — Absolutely NO BOX */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="max-w-3xl space-y-6 text-left">
            {/* Unboxed Category / Milestone Pill */}
            <div className="inline-flex items-center gap-2 text-[#ff9e92] text-xs sm:text-sm font-bold uppercase tracking-wider drop-shadow-sm">
              <Sparkles size={16} weight="Filled" className="text-[#ff9e92]" />
              <span>{currentSlide.category}</span>
            </div>

            {/* Display Headline — Floating directly on the image */}
            <h1 className="text-3xl sm:text-5xl lg:text-[58px] font-black text-white tracking-tight leading-[1.08] drop-shadow-md">
              {currentSlide.title}
            </h1>

            {/* Subtitle Description — Floating directly on the image */}
            <p className="text-base sm:text-lg lg:text-xl text-stone-200 leading-relaxed font-normal max-w-2xl drop-shadow-sm">
              {currentSlide.description}
            </p>

            {/* Direct Trust Highlights List (NO BOXES, just clean unboxed typography with icons) */}
            <div className="pt-1 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs sm:text-sm text-stone-200">
              {currentSlide.trustPoints.map((point) => (
                <div key={point} className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck size={16} weight="Filled" className="text-[#88d49e]" />
                  <span>{point}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons with tactile press effect (Emil Kowalski spring physics) */}
            <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link
                href={currentSlide.primaryCtaLink}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[#e06b5b] hover:bg-[#c95444] active:scale-[0.98] text-white text-sm sm:text-base font-bold rounded-xl shadow-[0_8px_24px_rgba(224,107,91,0.4)] hover:shadow-[0_12px_28px_rgba(224,107,91,0.5)] transition-all duration-150"
              >
                <ShoppingBag size={20} weight="Filled" />
                <span>{currentSlide.primaryCtaText}</span>
                <ArrowRight size={17} weight="Outline" />
              </Link>

              <Link
                href={currentSlide.secondaryCtaLink}
                className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white text-sm sm:text-base font-bold rounded-xl border border-white/30 hover:border-white/60 backdrop-blur-xs transition-all duration-150"
              >
                <span>{currentSlide.secondaryCtaText}</span>
                <ArrowRight size={16} weight="Outline" />
              </Link>
            </div>

            {/* Kharido Mart Core Assurances Strip (Clean, unboxed inline stats) */}
            <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-stone-300/90 font-medium border-t border-white/15">
              <div className="flex items-center gap-2">
                <TruckFast size={16} weight="Filled" className="text-[#ff9e92]" />
                <span>Pan-India Fast Dispatch (COD Available)</span>
              </div>
              <div className="flex items-center gap-2">
                <Refresh size={16} weight="Outline" className="text-stone-300" />
                <span>24-Hour Doorstep Replacement</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart size={16} weight="Filled" className="text-[#e06b5b]" />
                <span>Curated by Indian Moms</span>
              </div>
            </div>
          </div>
        </div>


      </div>
    </section>
  );
}
