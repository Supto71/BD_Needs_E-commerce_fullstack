import { NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();
    const sub = Number(subtotal || 0);

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Please provide a coupon code.' }, { status: 400 });
    }

    const result = await validateCoupon(code, sub);
    if (!result.valid || !result.coupon) {
      return NextResponse.json(result, { status: 400 });
    }

    const { coupon } = result;
    let discount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discount = Math.min(sub * (coupon.discountValue / 100), coupon.maxDiscount || Infinity);
    } else {
      discount = coupon.discountValue;
    }
    discount = Math.round(discount * 100) / 100;

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discount
    });
  } catch (error) {
    return NextResponse.json({ valid: false, error: 'Failed to validate coupon' }, { status: 500 });
  }
}
