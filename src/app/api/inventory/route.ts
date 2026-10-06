import { NextResponse } from 'next/server';
import { getInventoryStatus, updateStock } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const inventory = await getInventoryStatus();
    return NextResponse.json(inventory);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { productId, variantId, stock, threshold } = await request.json();

    if (!productId || (stock === undefined && threshold === undefined)) {
      return NextResponse.json(
        { error: 'Product ID and at least one field to update are required' },
        { status: 400 }
      );
    }

    const newStock = stock !== undefined ? Number(stock) : undefined;
    const newThreshold = threshold !== undefined ? Number(threshold) : undefined;

    const success = await updateStock(productId, variantId, newStock, newThreshold);
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update stock. Product or variant not found.' },
        { status: 404 }
      );
    }
    revalidatePath('/', 'layout');
    return NextResponse.json({ success: true, stock: newStock, threshold: newThreshold });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
  }
}
