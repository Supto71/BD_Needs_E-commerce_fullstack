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
  title: 'New Arrivals – Latest Products in Bangladesh',
  description:
    'Discover the latest new arrivals at BDNEEDS. Fresh electronics, fashion, footwear and beauty products at best prices in Bangladesh with Cash on Delivery.',
  alternates: { canonical: '/new-arrivals' },
  openGraph: {
    title: 'New Arrivals – Latest Products in Bangladesh | BDNEEDS',
    description:
      'Fresh new arrivals at best prices in Bangladesh. Cash on Delivery available.',
    url: '/new-arrivals',
  },
};

export default async function NewArrivalsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await props.searchParams;
  const filters = parseStorefrontSearchParams(sp);

  const [catalog, categories] = await Promise.all([
    getProductsPaginated({ ...filters, isNew: true }),
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
            presetFilter="new-arrivals"
            categories={categories}
            title="New Arrivals"
            subtitle="Latest innovations, runway fashion, and refined workspace tech."
          />
        </Suspense>
      </main>
      <SeoContentBlock pageType="new-arrivals" />
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
