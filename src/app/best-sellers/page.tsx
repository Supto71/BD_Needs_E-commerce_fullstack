import React, { Suspense } from 'react';
import AnnouncementBar from '@/components/storefront/AnnouncementBar';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import MobileBottomNav from '@/components/storefront/MobileBottomNav';
import ShopCatalog from '@/components/storefront/ShopCatalog';
import SeoContentBlock from '@/components/storefront/SeoContentBlock';
import { getProducts, getCategories } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const metadata: import('next').Metadata = {
  title: 'Best Sellers – Top Selling Products in Bangladesh',
  description:
    'Shop the top-selling products at BDNEEDS, loved by thousands of customers across Bangladesh. Best prices, genuine quality and Cash on Delivery.',
  alternates: { canonical: '/best-sellers' },
  openGraph: {
    title: 'Best Sellers – Top Selling Products in Bangladesh | BDNEEDS',
    description:
      'Top-selling products loved by customers across Bangladesh. Cash on Delivery available.',
    url: '/best-sellers',
  },
};

export default async function BestSellersPage() {
  const [allProducts, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  const bestSellers = allProducts.filter((p) => p.isBestSeller);

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff]">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-20 text-center text-xs font-semibold text-slate-400">Loading catalog...</div>}>
          <ShopCatalog
            initialProducts={bestSellers}
            categories={categories}
            title="Best Sellers"
            subtitle="Top-ranking essentials loved by thousands of verified customers worldwide."
          />
        </Suspense>
      </main>
      <SeoContentBlock pageType="best-sellers" />
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
