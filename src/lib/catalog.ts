import type { ProductFiltersDef } from '@/lib/db';

export const STOREFRONT_PAGE_SIZE = 24;
export const ADMIN_PAGE_SIZE = 24;

type SearchParamValue = string | string[] | undefined;

function firstParam(val: SearchParamValue): string | undefined {
  if (Array.isArray(val)) return val[0];
  return val;
}

export function parseStorefrontSearchParams(
  params: Record<string, SearchParamValue>
): ProductFiltersDef {
  const pageRaw = Number(firstParam(params.page) || '1');
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1;

  const minPriceRaw = firstParam(params.minPrice);
  const maxPriceRaw = firstParam(params.maxPrice);
  const minPrice = minPriceRaw && Number(minPriceRaw) > 0 ? Number(minPriceRaw) : undefined;
  const maxPrice = maxPriceRaw && Number(maxPriceRaw) < 200000 ? Number(maxPriceRaw) : undefined;

  const sortByRaw = firstParam(params.sort) || firstParam(params.sortBy) || 'featured';
  const validSorts = new Set([
    'featured',
    'best-selling',
    'newest',
    'price-low-high',
    'price-high-low',
    'rating',
  ]);

  const search = firstParam(params.q) || firstParam(params.search) || undefined;

  return {
    page,
    limit: STOREFRONT_PAGE_SIZE,
    category: firstParam(params.category) || undefined,
    subcategory: firstParam(params.subcategory) || undefined,
    brand: firstParam(params.brand) || undefined,
    minPrice,
    maxPrice,
    inStock: firstParam(params.inStock) === 'true' ? true : undefined,
    search: search?.trim() || undefined,
    sortBy: (validSorts.has(sortByRaw) ? sortByRaw : 'featured') as ProductFiltersDef['sortBy'],
  };
}

