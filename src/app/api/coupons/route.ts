import { NextResponse } from 'next/server';
import { getCoupons, createCoupon, deleteCoupon, updateCoupon } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const coupons = await getCoupons();
    return NextResponse.json(coupons);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.code || !data.discountValue) {
      return NextResponse.json(
        { error: 'Coupon code and discount value are required' },
        { status: 400 }
      );
    }

    const newCoupon = await createCoupon({
      code: data.code,
      discountType: data.discountType || 'PERCENTAGE',
      discountValue: Number(data.discountValue),
      minOrderValue: Number(data.minOrderValue || 0),
      maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : undefined,
      expiryDate: data.expiryDate || '2027-12-31T23:59:59Z',
      usageLimit: Number(data.usageLimit || 1000),
      isActive: data.isActive ?? true,
    });

    return NextResponse.json(newCoupon, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    if (!data.id || !data.code || !data.discountValue) {
      return NextResponse.json(
        { error: 'ID, Coupon code and discount value are required' },
        { status: 400 }
      );
    }

    const updatedCoupon = await updateCoupon(data.id, {
      code: data.code,
      discountType: data.discountType || 'PERCENTAGE',
      discountValue: Number(data.discountValue),
      minOrderValue: Number(data.minOrderValue || 0),
      maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : undefined,
      expiryDate: data.expiryDate || '2027-12-31T23:59:59Z',
      usageLimit: Number(data.usageLimit || 1000),
      isActive: data.isActive ?? true,
    });

    return NextResponse.json(updatedCoupon, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Coupon ID is required' }, { status: 400 });
    }
    const success = await deleteCoupon(id);
    return NextResponse.json({ success });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}
