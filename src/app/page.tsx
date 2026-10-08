import React from 'react';
import AnnouncementBar from '@/components/storefront/AnnouncementBar';
import Header from '@/components/storefront/Header';
import HeroCarousel from '@/components/storefront/HeroCarousel';
import CategoryCarousel from '@/components/storefront/CategoryCarousel';
import BestSellersSection from '@/components/storefront/BestSellersSection';
import CampaignBanner from '@/components/storefront/CampaignBanner';
import NewArrivalsSection from '@/components/storefront/NewArrivalsSection';
import Footer from '@/components/storefront/Footer';
import MobileBottomNav from '@/components/storefront/MobileBottomNav';
import SeoDirectory from '@/components/storefront/SeoDirectory';
import { getBanners, getCategories, getProducts } from '@/lib/db';
import { SITE_URL, SITE_NAME } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [banners, categories, products] = await Promise.all([
    getBanners(),
    getCategories(),
    getProducts(),
  ]);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        sameAs: [
          'https://www.facebook.com/profile.php?id=61589093341884',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: 'en-BD',
        publisher: { '@id': `${SITE_URL}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#ffffff]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <AnnouncementBar />
      <Header />

      <main className="flex-1">
        {/* Dynamic Hero Carousel */}
        <HeroCarousel banners={banners.filter(b => b.type === 'HERO')} />

        {/* Dynamic Circular Category Slider */}
        <CategoryCarousel categories={categories} />

        {/* Best Sellers Section */}
        <BestSellersSection products={products} />

        {/* Editorial Campaign Banner */}
        <CampaignBanner banner={banners.find(b => b.type === 'CAMPAIGN')} />

        {/* New Arrivals Section */}
        <NewArrivalsSection products={products} />

      </main>

      <SeoDirectory />
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
