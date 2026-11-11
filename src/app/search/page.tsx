import React, { Suspense } from 'react';
import AnnouncementBar from '@/components/storefront/AnnouncementBar';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import MobileBottomNav from '@/components/storefront/MobileBottomNav';
import ShopCatalog from '@/components/storefront/ShopCatalog';
import { getProductsPaginated, getCategories } from '@/lib/db';
import { parseStorefrontSearchParams } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export default async function SearchPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await props.searchParams;
  const filters = parseStorefrontSearchParams(sp);
  const query = filters.search || '';

  const [catalog, categories] = await Promise.all([
    getProductsPaginated(filters),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff]">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-20 text-center text-xs font-semibold text-slate-400">Loading search results...</div>}>
          <ShopCatalog
            key={query}
            initialProducts={catalog.items}
            totalCount={catalog.total}
            currentPage={catalog.page}
            totalPages={catalog.totalPages}
            availableBrands={catalog.brands}
            categories={categories}
            initialSearchQuery={query}
            title={query ? `Search Results for "${query}"` : 'Search All Products'}
            subtitle={
              query
                ? `Displaying products matching "${query}". Adjust your filters on the left to refine.`
                : 'Search through our full catalog by typing keywords above.'
            }
          />
        </Suspense>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
