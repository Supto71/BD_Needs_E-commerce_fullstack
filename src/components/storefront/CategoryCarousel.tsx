'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Category } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

interface CategoryCarouselProps {
  categories: Category[];
}

export default function CategoryCarousel({ categories }: CategoryCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-4 sm:py-6 md:py-8 bg-[#ffffff] border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading with Carousel Controls */}
        <div className="flex items-end justify-between mb-3 sm:mb-4 md:mb-8">
          <div>
            <div className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-blue-600 mb-0.5 md:mb-1">
              {t('curatedCollections')}
            </div>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-[#0B132B] tracking-tight">
              {t('shopByDepartment')}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/shop"
              className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1 mr-1 md:mr-2"
            >
              {t('allProducts')} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => scroll('left')}
              className="hidden sm:block p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="hidden sm:block p-2 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-colors shadow-2xs"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex items-center gap-3.5 sm:gap-5 md:gap-8 overflow-x-auto no-scrollbar scroll-smooth pb-1 md:pb-4"
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className="group flex flex-col items-center text-center shrink-0 w-[72px] sm:w-20 md:w-32"
            >
              {/* Circular Visual Item */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-28 md:h-28 rounded-full overflow-hidden p-0.5 md:p-1 border-2 border-slate-100 group-hover:border-blue-600 transition-all duration-300 shadow-2xs md:shadow-sm group-hover:shadow-md">
                <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-50">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 64px, 112px"
                  />
                </div>
              </div>

              {/* Title & Count */}
              <span className="mt-1.5 md:mt-3 text-[11px] sm:text-xs md:text-sm font-bold text-[#0B132B] group-hover:text-blue-600 transition-colors line-clamp-1 w-full text-center">
                {category.name}
              </span>
              <span className="hidden md:block text-[11px] text-slate-400 font-medium">
                {category.productCount} {t('productsCount')}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
