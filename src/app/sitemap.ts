import type { MetadataRoute } from 'next';
import { getProducts, getCategories } from '@/lib/db';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPaths = [
    { path: '', priority: 1, changeFrequency: 'daily' as const },
    { path: '/shop', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/new-arrivals', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/best-sellers', priority: 0.8, changeFrequency: 'daily' as const },
    { path: '/about', priority: 0.4, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.4, changeFrequency: 'monthly' as const },
    { path: '/faq', priority: 0.4, changeFrequency: 'monthly' as const },
    { path: '/track-order', priority: 0.3, changeFrequency: 'monthly' as const },
  ].map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));

  let productEntries: MetadataRoute.Sitemap = [];
  let categoryEntries: MetadataRoute.Sitemap = [];

  try {
    const [products, categories] = await Promise.all([
      getProducts(),
      getCategories(),
    ]);

    productEntries = products.map((p: any) => ({
      url: `${SITE_URL}/product/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    categoryEntries = categories.map((c: any) => ({
      url: `${SITE_URL}/category/${c.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (e) {
    console.error('Sitemap generation failed:', e);
  }

  return [...staticPaths, ...categoryEntries, ...productEntries];
}
