'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Banner } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useLanguage } from '@/context/LanguageContext';

interface CampaignBannerProps {
  banner?: Banner;
}

export default function CampaignBanner({ banner }: CampaignBannerProps) {
  const { language } = useLanguage();

  if (!banner) return null;

  return (
    <section className="py-2 sm:py-4 md:py-8 bg-[#ffffff]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl md:rounded-3xl bg-[#0B132B] text-[#ffffff] overflow-hidden shadow-xl md:shadow-2xl flex flex-row md:grid md:grid-cols-12 md:gap-8 items-center justify-between min-h-[175px] sm:min-h-[200px] md:min-h-[480px] py-2.5 pl-2.5 pr-4 sm:py-4 sm:pl-4 sm:pr-6 md:p-0">
          
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-transparent to-transparent pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Left Column Image */}
          <div className="w-[45%] sm:w-[45%] md:w-auto md:col-span-5 flex items-center justify-center relative shrink-0 md:pl-12 lg:pl-16 z-10 pr-1">
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-xl md:rounded-2xl overflow-hidden shadow-md md:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[#ffffff]/10 group-hover:scale-102 transition-transform duration-500">
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover object-center pointer-events-none select-none"
                sizes="(max-width: 768px) 150px, (max-width: 1024px) 350px, 450px"
              />
            </div>
          </div>

          {/* Right Column Text */}
          <div className="w-[55%] sm:w-[55%] md:w-auto md:col-span-7 flex flex-col justify-center text-right space-y-1 sm:space-y-1.5 md:space-y-5 md:pr-12 lg:pr-16 z-10 pl-1.5 sm:pl-2">
            {/* Badge */}
            <div className="inline-flex items-center px-2 sm:px-2.5 md:px-4 py-0.5 sm:py-1 md:py-1.5 rounded-full bg-[#ffffff]/[0.07] backdrop-blur-md border border-[#ffffff]/20 shadow-xs md:shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all duration-300 hover:border-[#ffffff]/30 self-end">
              <span className="text-[9px] sm:text-[11px] md:text-xs font-bold tracking-[0.16em] sm:tracking-[0.22em] uppercase bg-gradient-to-r from-white via-sky-100 to-blue-200 bg-clip-text text-transparent">
                {banner.badge || 'SPECIAL CAMPAIGN'}
              </span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-0.5 sm:space-y-1 md:space-y-2">
              {banner.subtitle && (
                <p className="text-slate-400 font-semibold text-[10px] sm:text-sm md:text-base tracking-wide uppercase truncate">
                  {banner.subtitle}
                </p>
              )}
              <h2 className="text-lg sm:text-2xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight line-clamp-2 md:line-clamp-none">
                {banner.title}
              </h2>
            </div>

            <p className="hidden md:block text-slate-300 text-sm md:text-base max-w-xl ml-auto leading-relaxed">
              {banner.description}
            </p>

            {/* Price & CTA */}
            <div className="pt-0.5 sm:pt-1 md:pt-2 flex flex-wrap items-center justify-end gap-1.5 sm:gap-2.5 md:gap-5">
              <Link
                href={banner.ctaLink || '/shop'}
                className="px-2.5 sm:px-3.5 md:px-7 py-1.5 sm:py-2 md:py-3.5 bg-blue-600 hover:bg-blue-500 text-[#ffffff] font-bold text-xs sm:text-sm md:text-sm rounded-lg md:rounded-xl transition-all shadow-md md:shadow-lg hover:shadow-blue-500/30 flex items-center gap-1 sm:gap-1.5 md:gap-2 group/cta"
              >
                {banner.ctaText || 'Shop Now'}
                <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover/cta:translate-x-1 transition-transform" />
              </Link>

              {banner.price > 0 && (
                <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                  {banner.discount > 0 && (
                    <span className="text-[9px] sm:text-[11px] md:text-sm font-semibold text-emerald-400 bg-emerald-950/60 px-1 sm:px-1.5 md:px-2 py-0.5 rounded border border-emerald-500/30">
                      Save {banner.discount}%
                    </span>
                  )}
                  <span className="text-base sm:text-xl md:text-3xl font-black text-[#ffffff] leading-none">
                    {formatPrice(banner.price)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

