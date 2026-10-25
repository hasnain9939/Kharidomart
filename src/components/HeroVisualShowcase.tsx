"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  Award,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "reicon-react";

interface HeroSlide {
  id: string;
  title: string;
  tag: string;
  src: string;
  alt: string;
  topBadge: string;
  topSub: string;
  bottomBadgeTitle: string;
  bottomBadgeSub: string;
  pill: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "grooming",
    title: "Tear-Free Grooming",
    tag: "Electric Baby Groomer",
    src: "/assets/stitch/hero_baby_grooming.jpg",
    alt: "Indian mother safely trimming infant nails with gentle electric baby nail trimmer in nursery",
    topBadge: "Tear-Free Nail Grooming",
    topSub: "Whisper-Quiet Motor • 6 Gentle Filing Heads",
    bottomBadgeTitle: "Zero Snags or Nicks",
    bottomBadgeSub: "Safe for tiny cuticles & soft newborn nails",
    pill: "GENTLE GROOMING",
  },
  {
    id: "bonding",
    title: "Gentle Newborn Care",
    tag: "0–12M Milestones",
    src: "/assets/stitch/hero_mother_baby_care.jpg",
    alt: "Loving Indian mother smiling and cuddling her happy 5-month-old baby on a cozy sofa",
    topBadge: "100% Food-Grade & Non-Toxic",
    topSub: "BPA-Free Materials • Rounded Safety Edges",
    bottomBadgeTitle: "Peace of Mind for Moms",
    bottomBadgeSub: "Safe for sensitive skin & tiny fingers",
    pill: "NEWBORN ESSENTIALS",
  },
  {
    id: "montessori",
    title: "Screen-Free Discovery",
    tag: "1–4Y Sensory Play",
    src: "/assets/stitch/hero_montessori_play.jpg",
    alt: "Indian mother and toddler playing with colorful Montessori wooden sensory toys and rainbow puzzle",
    topBadge: "Montessori Sensory Play",
    topSub: "Tactile Learning • Screen-Free Discovery",
    bottomBadgeTitle: "Curiosity & Motor Growth",
    bottomBadgeSub: "Natural wood, smooth edges & non-toxic colors",
    pill: "MONTESSORI TOYS",
  },
  {
    id: "feeding",
    title: "Mess-Free Feeding",
    tag: "Weaning Essentials",
    src: "/assets/stitch/hero_baby_feeding.jpg",
    alt: "Indian mother feeding smiling infant with food-grade silicone baby bib and spoon",
    topBadge: "100% Food-Grade Silicone",
    topSub: "BPA-Free • Microwave & Dishwasher Safe",
    bottomBadgeTitle: "Self-Feeding Sets",
    bottomBadgeSub: "Gentle suction bowls & soft flexible spoons",
    pill: "FEEDING ESSENTIALS",
  },
];

export default function HeroVisualShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance every 6 seconds unless user is interacting/hovering
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const currentSlide = HERO_SLIDES[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  return (
    <div
      className="relative w-full max-w-[520px] mx-auto space-y-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Main Hero Card Container */}
      <div className="relative w-full aspect-square rounded-3xl bg-white p-3 shadow-2xl border border-[#eddcd1] overflow-hidden group">
        {/* Active Scene Image with smooth transition */}
        <div className="relative w-full h-full rounded-2xl overflow-hidden bg-stone-100">
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={idx === 0}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 520px"
                className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
          ))}

          {/* Top Glassmorphic Safety Badge */}
          <div className="absolute top-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl shadow-lg border border-[#eddcd1] flex items-center justify-between gap-3 transition-all">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#eaf3ed] text-[#4f775d] flex items-center justify-center shrink-0">
                <ShieldCheck size={18} weight="Filled" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#2b1f1a] truncate">
                  {currentSlide.topBadge}
                </p>
                <p className="text-[11px] text-[#6b5850] truncate">
                  {currentSlide.topSub}
                </p>
              </div>
            </div>
            <span className="shrink-0 px-2.5 py-1 bg-[#eaf3ed] text-[#4f775d] text-[10px] font-bold uppercase rounded-full">
              Curated Quality
            </span>
          </div>

          {/* Navigation Chevrons (Visible on hover & mobile) */}
          <div className="absolute inset-y-0 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
            <button
              onClick={handlePrev}
              className="pointer-events-auto w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#2b1f1a] shadow-md border border-[#eddcd1] flex items-center justify-center opacity-85 hover:opacity-100 transition-all active:scale-95 cursor-pointer"
              aria-label="Previous Hero Image"
            >
              <ArrowLeft size={16} weight="Outline" />
            </button>
            <button
              onClick={handleNext}
              className="pointer-events-auto w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#2b1f1a] shadow-md border border-[#eddcd1] flex items-center justify-center opacity-85 hover:opacity-100 transition-all active:scale-95 cursor-pointer"
              aria-label="Next Hero Image"
            >
              <ArrowRight size={16} weight="Outline" />
            </button>
          </div>

          {/* Bottom Glassmorphic Parent Approved Badge */}
          <div className="absolute bottom-4 left-4 right-4 z-20 bg-white/95 backdrop-blur-md p-3 sm:p-3.5 rounded-2xl shadow-lg border border-[#eddcd1] flex items-center justify-between transition-all">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#fdedeb] flex items-center justify-center text-[#e06b5b] shrink-0">
                <Award size={22} weight="Filled" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-black text-[#2b1f1a] leading-tight truncate">
                  {currentSlide.bottomBadgeTitle}
                </p>
                <p className="text-[11px] text-[#6b5850] truncate">
                  {currentSlide.bottomBadgeSub}
                </p>
              </div>
            </div>
            <span className="shrink-0 px-2.5 py-1 bg-[#eaf3ed] text-[#4f775d] text-[10px] font-black uppercase tracking-wider rounded-full">
              {currentSlide.pill}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Thumbnail Carousel Strip (Add more images from the web) */}
      <div className="grid grid-cols-4 gap-2.5 pt-1">
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={slide.id}
              onClick={() => setCurrentIndex(idx)}
              className={`relative rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer text-left group ${
                isActive
                  ? "border-[#e06b5b] ring-2 ring-[#e06b5b]/30 shadow-md scale-[1.03]"
                  : "border-stone-200 hover:border-stone-300 opacity-70 hover:opacity-100"
              }`}
              aria-label={`Show ${slide.title}`}
            >
              <div className="relative aspect-square w-full bg-stone-100">
                <Image
                  src={slide.src}
                  alt={slide.title}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
                <div
                  className={`absolute inset-0 bg-black/10 transition-opacity ${
                    isActive ? "opacity-0" : "opacity-30 group-hover:opacity-10"
                  }`}
                />
                {isActive && (
                  <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#e06b5b] ring-1 ring-white" />
                )}
              </div>
              <div className="p-1.5 bg-white text-center">
                <p className="text-[10px] font-bold text-[#2b1f1a] truncate leading-tight">
                  {slide.title}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Slide Indicator Strip */}
      <div className="flex items-center justify-between text-[11px] text-[#6b5850] px-1 font-medium">
        <span className="flex items-center gap-1.5">
          <Sparkles size={12} weight="Filled" className="text-[#e06b5b]" />
          <span>Tap any scene to explore curated milestones</span>
        </span>
        <span className="font-mono text-stone-500 tabular-nums">
          0{currentIndex + 1} / 0{HERO_SLIDES.length}
        </span>
      </div>
    </div>
  );
}
