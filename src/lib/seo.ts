import type { Product } from '@/types';

/**
 * Smart SEO fallbacks: if admin leaves SEO fields empty, we still generate
 * long-tail, keyword-rich strings from product data.
 */
export function getProductSeo(product: Product) {
  const firstSentence = (product.shortDescription || '').trim();

  const title =
    product.seoTitle?.trim() ||
    `${product.name} Price in Bangladesh`;

  const description =
    product.seoDescription?.trim() ||
    `Buy ${product.name}${product.brand ? ` by ${product.brand}` : ''} at best price in Bangladesh (৳${product.basePrice}). ${firstSentence} Cash on Delivery available. Order from BDNEEDS.`
      .replace(/\s+/g, ' ')
      .slice(0, 160);

  const imageAlt =
    product.imageAlt?.trim() ||
    `${product.name}${product.brand ? ` - ${product.brand}` : ''} price in Bangladesh`;

  return { title, description, imageAlt };
}

export function breadcrumbJsonLd(
  siteUrl: string,
  items: { name: string; path: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}
