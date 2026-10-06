import React, { Suspense } from 'react';
import AnnouncementBar from '@/components/storefront/AnnouncementBar';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import MobileBottomNav from '@/components/storefront/MobileBottomNav';
import ShopCatalog from '@/components/storefront/ShopCatalog';
import { getProducts, getCategories } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await props.searchParams;
  const query = q || '';

  const [products, categories] = await Promise.all([
    getProducts({ search: query }),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff]">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-20 text-center text-xs font-semibold text-slate-400">Loading search results...</div>}>
          <ShopCatalog
            initialProducts={products}
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
