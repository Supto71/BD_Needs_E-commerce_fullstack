import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/db';
import { SITE_URL, SITE_NAME } from '@/lib/site';
import { getProductSeo } from '@/lib/seo';

export const dynamic = 'force-dynamic';

const esc = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

// Google Merchant Center product feed (RSS 2.0 + g: namespace)
// Submit this URL in Merchant Center > Products > Feeds.
export async function GET() {
  try {
    const products = await getProducts();

    const items = products
      .map((p) => {
        const images = (p.images as string[]) || [];
        if (!images[0]) return '';
        const seo = getProductSeo(p);
        const link = `${SITE_URL}/product/${p.slug}`;
        const price = `${Number(p.basePrice).toFixed(2)} BDT`;
        const availability = p.stock > 0 ? 'in_stock' : 'out_of_stock';
        const extraImages = images
          .slice(1, 11)
          .map((u) => `<g:additional_image_link>${esc(u)}</g:additional_image_link>`)
          .join('');

        return `<item>
<g:id>${esc(p.sku || p.id)}</g:id>
<title>${esc(seo.title.slice(0, 150))}</title>
<description>${esc((p.description || p.shortDescription || '').slice(0, 5000))}</description>
<link>${esc(link)}</link>
<g:image_link>${esc(images[0])}</g:image_link>
${extraImages}
<g:availability>${availability}</g:availability>
<g:price>${price}</g:price>
<g:condition>new</g:condition>
${p.brand ? `<g:brand>${esc(p.brand)}</g:brand>` : ''}
<g:identifier_exists>no</g:identifier_exists>
<g:product_type>${esc(p.categoryName)}</g:product_type>
</item>`;
      })
      .filter(Boolean)
      .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
<title>${esc(SITE_NAME)}</title>
<link>${esc(SITE_URL)}</link>
<description>${esc(SITE_NAME)} product feed</description>
${items}
</channel>
</rss>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Shopping feed error:', error);
    return NextResponse.json({ error: 'Failed to generate feed' }, { status: 500 });
  }
}
