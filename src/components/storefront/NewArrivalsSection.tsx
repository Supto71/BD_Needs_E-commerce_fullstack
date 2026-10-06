'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import { useLanguage } from '@/context/LanguageContext';

interface NewArrivalsSectionProps {
  products: Product[];
}

export default function NewArrivalsSection({ products }: NewArrivalsSectionProps) {
  const { t } = useLanguage();

  const newReleases = [...products]
    .filter((p) => p.isNew)
    .slice(0, 4);

  const displayList = newReleases.length >= 4 ? newReleases : products.slice(0, 4);

  return (
    <section className="py-16 bg-[#ffffff] border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-emerald-600 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              {t('newSeasonArrivals')}
            </div>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-[#0B132B] tracking-tight">
              {t('newArrivals')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              {t('newArrivalsDesc')}
            </p>
          </div>

          <Link
            href="/new-arrivals"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors self-start sm:self-auto"
          >
            {t('exploreCollection')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-6">
          {displayList.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
