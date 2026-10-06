import { NextResponse } from 'next/server';
import { getBanners, getAllBannersAdmin, createBanner } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';

    const banners = isAdmin
      ? await getAllBannersAdmin()
      : await getBanners();

    return NextResponse.json(banners);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.title) {
      return NextResponse.json({ error: 'Banner title is required' }, { status: 400 });
    }
    if (data.type !== 'ANNOUNCEMENT' && !data.image) {
      return NextResponse.json({ error: 'Image is required for this banner type' }, { status: 400 });
    }

    const newBanner = await createBanner({
      title: data.title,
      subtitle: data.subtitle || '',
      type: data.type || 'HERO',
      badge: data.badge || 'EXCLUSIVE',
      description: data.description || '',
      price: data.price ? Number(data.price) : 0,
      discount: data.discount ? Number(data.discount) : 0,
      image: data.image || '',
      ctaText: data.ctaText || 'Shop Collection',
      ctaLink: data.ctaLink || '/shop',
      isActive: data.isActive ?? true,
      order: data.order ?? 99,
      startDate: data.startDate,
      endDate: data.endDate,
    });

    return NextResponse.json(newBanner, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create banner' }, { status: 500 });
  }
}
