'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Banner } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface HeroCarouselProps {
  banners: Banner[];
}

export default function HeroCarousel({ banners }: HeroCarouselProps) {
  const { t, language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeBanners = banners.filter((b) => b.isActive);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused || isDragging) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeBanners.length, isPaused, isDragging]);

  if (activeBanners.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? activeBanners.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (activeBanners.length <= 1) return;
    setIsDragging(true);
    setIsPaused(true);
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    isHorizontalSwipeRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || activeBanners.length <= 1) return;

    const deltaX = e.touches[0].clientX - touchStartRef.current.x;
    const deltaY = e.touches[0].clientY - touchStartRef.current.y;

    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(deltaX) > 6 || Math.abs(deltaY) > 6) {
        isHorizontalSwipeRef.current = Math.abs(deltaX) > Math.abs(deltaY);
      }
    }

    if (isHorizontalSwipeRef.current) {
      // Elastic resistance at carousel boundaries
      let offset = deltaX;
      if (
        (currentIndex === 0 && deltaX > 0) ||
        (currentIndex === activeBanners.length - 1 && deltaX < 0)
      ) {
        offset = deltaX * 0.35;
      }
      setDragOffset(offset);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setIsPaused(false);

    const threshold = 45;
    if (dragOffset < -threshold) {
      handleNext();
    } else if (dragOffset > threshold) {
      handlePrev();
    }

    setDragOffset(0);
    isHorizontalSwipeRef.current = null;
  };

  return (
    <div
      className="relative w-full bg-gradient-to-b from-slate-50 to-white overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-4 md:py-16">
        <div
          className="relative rounded-2xl md:rounded-3xl bg-[#0B132B] text-[#ffffff] overflow-hidden shadow-xl md:shadow-2xl min-h-[175px] sm:min-h-[200px] md:min-h-[520px] flex items-center select-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Smooth Horizontal Sliding Flex Track */}
          <div
            className="flex w-full will-change-transform"
            style={{
              transform: `translate3d(calc(-${currentIndex * 100}% + ${dragOffset}px), 0, 0)`,
              transition:
                isDragging || prefersReducedMotion
                  ? 'none'
                  : 'transform 380ms cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            {activeBanners.map((banner, idx) => (
              <div
                key={banner.id || idx}
                className="w-full shrink-0 flex-none relative z-10 flex flex-row items-center justify-between py-2.5 pr-2.5 pl-4 sm:py-4 sm:pr-4 sm:pl-6 md:grid md:grid-cols-12 md:gap-8 md:p-12 lg:p-16"
                aria-hidden={currentIndex !== idx}
              >
                {/* Left Copy Info */}
                <div className="w-[52%] sm:w-[55%] md:w-auto md:col-span-7 flex flex-col justify-center space-y-1 sm:space-y-1.5 md:space-y-5 pr-1.5 sm:pr-2 md:pr-0">
                  {/* Premium Luxury Eyebrow Tag without icons */}
                  <div className="inline-flex items-center px-2 sm:px-2.5 md:px-4 py-0.5 sm:py-1 md:py-1.5 rounded-full bg-[#ffffff]/[0.07] backdrop-blur-md border border-[#ffffff]/20 shadow-xs md:shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all duration-300 hover:border-[#ffffff]/30 self-start">
                    <span className="text-[9px] sm:text-[11px] md:text-xs font-bold tracking-[0.16em] sm:tracking-[0.22em] uppercase bg-gradient-to-r from-white via-sky-100 to-blue-200 bg-clip-text text-transparent">
                      {language === 'bn' && banner.badge === 'NEW FLAGSHIP RELEASE'
                        ? 'নতুন ফ্ল্যাগশিপ রিলিজ ২০২৬'
                        : language === 'bn' && banner.badge?.includes('FLASH SALE')
                        ? 'বিশেষ অফার • ২৫% ছাড়'
                        : language === 'bn' && banner.badge === 'LIMITED EDITION'
                        ? 'লিমিটেড এডিশন কালেকশন'
                        : banner.badge || 'EXCLUSIVE RELEASE'}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="space-y-0.5 sm:space-y-1 md:space-y-2">
                    <p className="text-slate-400 font-semibold text-[10px] sm:text-sm md:text-base tracking-wide uppercase truncate">
                      {banner.subtitle}
                    </p>
                    <h1 className="text-lg sm:text-2xl md:text-5xl lg:text-6xl font-black tracking-tight text-[#ffffff] leading-tight line-clamp-2 md:line-clamp-none">
                      {banner.title}
                    </h1>
                  </div>

                  {/* Description (desktop/tablet) */}
                  <p className="hidden md:block text-slate-300 text-sm md:text-base max-w-xl leading-relaxed">
                    {banner.description}
                  </p>

                  {/* Price & CTA */}
                  <div className="pt-0.5 sm:pt-1 md:pt-2 flex flex-wrap items-center gap-1.5 sm:gap-2.5 md:gap-5">
                    {banner.price > 0 && (
                      <div className="flex items-baseline gap-1 sm:gap-1.5 md:gap-2">
                        <span className="text-base sm:text-xl md:text-3xl font-black text-[#ffffff]">
                          {formatPrice(banner.price)}
                        </span>
                        {banner.discount > 0 && (
                          <span className="text-[9px] sm:text-[11px] md:text-sm font-semibold text-emerald-400 bg-emerald-950/60 px-1 sm:px-1.5 md:px-2 py-0.5 rounded border border-emerald-500/30">
                            Save {banner.discount}%
                          </span>
                        )}
                      </div>
                    )}

                    <Link
                      href={banner.ctaLink || '/shop'}
                      className="px-2.5 sm:px-3.5 md:px-7 py-1.5 sm:py-2 md:py-3.5 bg-blue-600 hover:bg-blue-500 text-[#ffffff] font-bold text-xs sm:text-sm rounded-lg md:rounded-xl transition-all shadow-md md:shadow-lg hover:shadow-blue-500/30 flex items-center gap-1 sm:gap-1.5 md:gap-2 group/cta"
                    >
                      {banner.ctaText || 'Shop Collection'}
                      <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover/cta:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Right Product 3D Hero Render Presentation */}
                <div className="w-[45%] sm:w-[45%] md:w-auto md:col-span-5 flex items-center justify-center relative shrink-0 pl-1">
                  <div className="relative w-44 h-44 sm:w-52 sm:h-52 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-xl md:rounded-2xl overflow-hidden shadow-md md:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[#ffffff]/10 group-hover:scale-102 transition-transform duration-500">
                    <Image
                      src={banner.image}
                      alt={banner.title}
                      fill
                      priority={idx === 0}
                      className="object-cover object-center pointer-events-none select-none"
                      sizes="(max-width: 768px) 150px, (max-width: 1024px) 80vw, 450px"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows (Desktop) */}
          {activeBanners.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#ffffff]/10 hover:bg-[#ffffff]/20 text-[#ffffff] backdrop-blur-md items-center justify-center transition-colors focus:outline-none"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-[#ffffff]/10 hover:bg-[#ffffff]/20 text-[#ffffff] backdrop-blur-md items-center justify-center transition-colors focus:outline-none"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Pagination Indicators */}
          {activeBanners.length > 1 && (
            <div className="absolute bottom-1.5 sm:bottom-2.5 md:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-1.5 md:space-x-2">
              {activeBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 md:h-2 rounded-full transition-all duration-300 focus:outline-none ${
                    currentIndex === idx
                      ? 'w-5 md:w-8 bg-blue-500'
                      : 'w-1.5 md:w-2 bg-[#ffffff]/30 hover:bg-[#ffffff]/50'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
