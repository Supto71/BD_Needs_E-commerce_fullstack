import React, { Suspense } from 'react';
import AnnouncementBar from '@/components/storefront/AnnouncementBar';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import MobileBottomNav from '@/components/storefront/MobileBottomNav';
import ShopCatalog from '@/components/storefront/ShopCatalog';
import SeoContentBlock from '@/components/storefront/SeoContentBlock';
import { getProductsPaginated, getCategories } from '@/lib/db';
import { parseStorefrontSearchParams } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export const metadata: import('next').Metadata = {
  title: 'Shop Online in Bangladesh – All Products',
  description:
    'Browse all products at BDNEEDS: electronics, fashion, footwear, beauty and more. Best prices in Bangladesh, Cash on Delivery and fast delivery.',
  alternates: { canonical: '/shop' },
  openGraph: {
    title: 'Shop Online in Bangladesh – All Products | BDNEEDS',
    description:
      'Browse all products at BDNEEDS. Best prices in Bangladesh with Cash on Delivery.',
    url: '/shop',
  },
};

export default async function ShopPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await props.searchParams;
  const filters = parseStorefrontSearchParams(sp);

  const [catalog, categories] = await Promise.all([
    getProductsPaginated(filters),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff]">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-20 text-center text-xs font-semibold text-slate-400">Loading catalog...</div>}>
          <ShopCatalog
            initialProducts={catalog.items}
            totalCount={catalog.total}
            currentPage={catalog.page}
            totalPages={catalog.totalPages}
            availableBrands={catalog.brands}
            categories={categories}
            title="All Collections"
            subtitle="Engineered audio, contemporary fashion, performance runners, and horology essentials."
          />
        </Suspense>
      </main>

      <SeoContentBlock pageType="shop" />

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
