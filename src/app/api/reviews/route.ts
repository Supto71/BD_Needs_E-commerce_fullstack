import { NextResponse } from 'next/server';
import { getReviews, getAllReviewsAdmin, createReview } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const isAdmin = searchParams.get('admin') === 'true';

    if (isAdmin) {
      const allReviews = await getAllReviewsAdmin();
      return NextResponse.json(allReviews);
    }

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const reviews = await getReviews(productId);
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.productId || !data.customerName || !data.rating || !data.comment) {
      return NextResponse.json(
        { error: 'Missing required review fields' },
        { status: 400 }
      );
    }

    const newReview = await createReview({
      productId: data.productId,
      userId: data.userId,
      customerName: data.customerName,
      customerAvatar: data.customerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&q=80',
      rating: Math.max(1, Math.min(5, Number(data.rating))),
      title: data.title || '',
      comment: data.comment,
      images: data.images || [],
      isVerifiedPurchase: !!data.isVerifiedPurchase,
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
