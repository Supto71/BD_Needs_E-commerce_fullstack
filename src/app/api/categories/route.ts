import { NextResponse } from 'next/server';
import { getCategories, getAllCategoriesAdmin, createCategory } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';

    const categories = isAdmin
      ? await getAllCategoriesAdmin()
      : await getCategories();

    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    const newCategory = await createCategory({
      name: data.name,
      slug,
      description: data.description || '',
      image: data.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
      icon: data.icon || 'Folder',
      productCount: 0,
      isActive: data.isActive ?? true,
      isFeatured: data.isFeatured ?? false,
      order: data.order ?? 99,
      subcategories: data.subcategories && data.subcategories.length > 0 ? {
        create: data.subcategories.map((s: string) => ({
          name: s.trim(),
          slug: s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          isFeatured: (data.featuredSubcategories || []).includes(s.trim())
        }))
      } : undefined,
    });

    revalidatePath('/', 'layout');

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
