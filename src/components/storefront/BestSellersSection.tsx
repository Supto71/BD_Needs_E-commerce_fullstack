'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import { useLanguage } from '@/context/LanguageContext';

interface BestSellersSectionProps {
  products: Product[];
}

export default function BestSellersSection({ products }: BestSellersSectionProps) {
  const { t } = useLanguage();

  // Sort by salesCount
  const bestSellers = [...products]
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 8);

  return (
    <section className="py-6 sm:py-8 md:py-16 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-6 md:mb-10 gap-3 sm:gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-orange-600 mb-1">
              <Flame className="w-4 h-4 fill-orange-500" />
              {t('bestsellerRank')}
            </div>
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-[#0B132B] tracking-tight">
              {t('bestSellers')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              {t('bestSellersDesc')}
            </p>
          </div>

          <Link
            href="/best-sellers"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors self-start sm:self-auto"
          >
            {t('exploreCollection')}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
