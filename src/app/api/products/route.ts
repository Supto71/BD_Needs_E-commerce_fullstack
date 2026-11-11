import { NextResponse } from 'next/server';
import {
  getProducts,
  getProductsPaginated,
  getAllProductsAdmin,
  createProduct,
  type ProductFiltersDef,
} from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';
    const isPaginated =
      searchParams.get('paginated') === 'true' ||
      searchParams.has('page') ||
      searchParams.has('limit');

    const idsParam = searchParams.get('ids');
    const ids = idsParam ? idsParam.split(',').map((id) => id.trim()).filter(Boolean) : undefined;

    const filters = {
      category: searchParams.get('category') || undefined,
      subcategory: searchParams.get('subcategory') || undefined,
      search: searchParams.get('search') || undefined,
      minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
      maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
      brand: searchParams.get('brand') || undefined,
      rating: searchParams.get('rating') ? Number(searchParams.get('rating')) : undefined,
      inStock: searchParams.get('inStock') === 'true',
      color: searchParams.get('color') || undefined,
      isBestSeller: searchParams.get('isBestSeller') === 'true' ? true : undefined,
      isNew: searchParams.get('isNew') === 'true' ? true : undefined,
      includeUnpublished: isAdmin,
      ids,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 24,
      sortBy: ((searchParams.get('sortBy') as ProductFiltersDef['sortBy']) || (isAdmin ? 'newest' : 'featured')),
    };

    if (isPaginated) {
      const result = await getProductsPaginated(filters);
      return NextResponse.json(result);
    }

    if (isAdmin) {
      const all = await getAllProductsAdmin();
      return NextResponse.json(all);
    }

    const products = await getProducts(filters);
    return NextResponse.json(products);
  } catch (error) {
    console.error('Products GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.name || !data.categoryId || !data.basePrice) {
      return NextResponse.json(
        { error: 'Missing required product fields (name, category, price)' },
        { status: 400 }
      );
    }

    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const newProduct = await createProduct({
      ...data,
      slug,
      salesCount: 0,
      rating: 5.0,
      reviewCount: 0,
      isPublished: data.isPublished ?? true,
      variants: data.variants || [],
      features: data.features || [],
      specifications: data.specifications || {},
      images: data.images?.length > 0 ? data.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
      tags: data.tags || [],
    });

    revalidatePath('/', 'layout');

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Products POST error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
