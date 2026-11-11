import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import AnnouncementBar from '@/components/storefront/AnnouncementBar';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import MobileBottomNav from '@/components/storefront/MobileBottomNav';
import ShopCatalog from '@/components/storefront/ShopCatalog';
import SeoContentBlock from '@/components/storefront/SeoContentBlock';
import { getProductsPaginated, getCategories, getCategoryBySlug } from '@/lib/db';
import { parseStorefrontSearchParams } from '@/lib/catalog';
import { SITE_URL } from '@/lib/site';
import { breadcrumbJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<import('next').Metadata> {
  const { slug } = await props.params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: 'Category Not Found' };
  const description =
    category.description || `Shop ${category.name} at BDNEEDS. Best prices and fast delivery across Bangladesh.`;
  return {
    title: category.name,
    description,
    alternates: { canonical: `/category/${slug}` },
    openGraph: { title: `${category.name} | BDNEEDS`, description, url: `/category/${slug}` },
  };
}

export default async function CategoryPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, sp] = await Promise.all([props.params, props.searchParams]);
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const filters = parseStorefrontSearchParams(sp);
  const [catalog, categories] = await Promise.all([
    getProductsPaginated({ ...filters, category: category.id }),
    getCategories(),
  ]);

  const breadcrumb = breadcrumbJsonLd(SITE_URL, [
    { name: 'Home', path: '/' },
    { name: category.name, path: `/category/${slug}` },
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumb).replace(/</g, '\\u003c'),
        }}
      />
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="p-20 text-center text-xs font-semibold text-slate-400">Loading department...</div>}>
          <ShopCatalog
            key={category.id}
            initialProducts={catalog.items}
            totalCount={catalog.total}
            currentPage={catalog.page}
            totalPages={catalog.totalPages}
            availableBrands={catalog.brands}
            categories={categories}
            initialCategorySlug={category.id}
            title={category.name}
            subtitle={category.description || `Explore our curated selection of ${category.name}.`}
          />
        </Suspense>
      </main>
      
      <SeoContentBlock pageType="category" categoryName={category.name} />

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
