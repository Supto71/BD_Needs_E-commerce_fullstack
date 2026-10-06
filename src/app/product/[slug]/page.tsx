import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import AnnouncementBar from '@/components/storefront/AnnouncementBar';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import MobileBottomNav from '@/components/storefront/MobileBottomNav';
import ProductDetailView from '@/components/storefront/ProductDetailView';
import { getProductBySlug, getReviews, getRelatedProducts, getCategories } from '@/lib/db';
import { SITE_URL } from '@/lib/site';
import { getProductSeo, breadcrumbJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  const seo = getProductSeo(product);
  const fullTitle = `${seo.title} | BDNEEDS`;

  return {
    title: { absolute: fullTitle },
    description: seo.description,
    alternates: { canonical: `/product/${slug}` },
    openGraph: {
      type: 'website',
      url: `/product/${slug}`,
      title: fullTitle,
      description: seo.description,
      images: ((product.images as string[]) || [])
        .slice(0, 1)
        .map((url) => ({ url, alt: seo.imageAlt })),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: seo.description,
    },
  };
}

export default async function ProductPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [reviews, relatedProducts, categories] = await Promise.all([
    getReviews(product.id),
    getRelatedProducts(product.id, product.categoryId),
    getCategories(),
  ]);

  const productCategory = categories.find((c) => c.id === product.categoryId);
  const breadcrumb = breadcrumbJsonLd(SITE_URL, [
    { name: 'Home', path: '/' },
    ...(productCategory
      ? [{ name: productCategory.name, path: `/category/${productCategory.slug}` }]
      : []),
    { name: product.name, path: `/product/${slug}` },
  ]);

  const seo = getProductSeo(product);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: seo.description,
    image: (product.images as string[]) || [],
    sku: product.sku,
    brand: (product as any).brand
      ? { '@type': 'Brand', name: (product as any).brand }
      : undefined,
    url: `${SITE_URL}/product/${slug}`,
    aggregateRating:
      product.reviewCount > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          }
        : undefined,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'BDT',
      price: (product as any).basePrice,
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: `${SITE_URL}/product/${slug}`,
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumb).replace(/</g, '\\u003c'),
        }}
      />
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <ProductDetailView
          product={product}
          reviews={reviews as unknown as import('@/types').Review[]}
          relatedProducts={relatedProducts}
        />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
