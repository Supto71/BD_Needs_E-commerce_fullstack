import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const cartSyncSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().optional().nullable(),
      quantity: z.number().int().min(1),
    })
  ),
});

async function enrichCartItems(dbItems: any[]) {
  if (!dbItems || dbItems.length === 0) return [];
  
  const enriched = await Promise.all(dbItems.map(async (item) => {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      include: { variants: true }
    });
    
    if (!product) return null;
    
    let price = product.basePrice;
    let variantSku: string | null = null;
    let variantColor: string | null = null;
    let variantSize: string | null = null;
    let variantStorage: string | null = null;
    
    if (item.variantId) {
       const variant = product.variants.find(v => v.id === item.variantId);
       if (variant) {
         price = variant.price;
         variantSku = variant.sku;
         variantColor = variant.colorName;
         variantSize = variant.size ?? null;
         variantStorage = variant.storage ?? null;
       }
    }
    
    const productImages = product.images as string[];
    const image = Array.isArray(productImages) && productImages.length > 0 ? productImages[0] : '';
    
    return {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price,
      quantity: item.quantity,
      image,
      variantId: item.variantId || undefined,
      color: variantColor || undefined,
      size: variantSize || undefined,
      storage: variantStorage || undefined,
    };
  }));
  
  return enriched.filter(Boolean);
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ items: [] }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!cart || cart.items.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const enrichedItems = await enrichCartItems(cart.items);
    return NextResponse.json({ items: enrichedItems });
  } catch (error) {
    console.error('Fetch cart error:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const validation = cartSyncSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid cart format' }, { status: 400 });
    }

    const localItems = validation.data.items;

    // Use transaction to sync cart
    const syncedCart = await prisma.$transaction(async (tx) => {
      // 1. Get or create cart for user
      let cart = await tx.cart.findUnique({ where: { userId } });
      if (!cart) {
        cart = await tx.cart.create({ data: { userId } });
      }

      // 2. Fetch existing items
      const existingItems = await tx.cartItem.findMany({ where: { cartId: cart.id } });

      // 3. Merge items (If local item exists in DB, keep DB or update? For now, we update quantity)
      for (const local of localItems) {
        const existing = existingItems.find(
          (e) => e.productId === local.productId && e.variantId === (local.variantId || null)
        );

        if (existing) {
          await tx.cartItem.update({
            where: { id: existing.id },
            data: { quantity: local.quantity }, // Or max(existing.quantity, local.quantity)
          });
        } else {
          await tx.cartItem.create({
            data: {
              cartId: cart.id,
              productId: local.productId,
              variantId: local.variantId || null,
              quantity: local.quantity,
            },
          });
        }
      }

      // 4. Return updated items
      return await tx.cart.findUnique({
        where: { id: cart.id },
        include: { items: true },
      });
    });

    // 5. Enrich and return updated items
    const finalCart = await prisma.cart.findUnique({
      where: { id: syncedCart!.id },
      include: { items: true },
    });
    
    const enrichedItems = await enrichCartItems(finalCart?.items || []);
    return NextResponse.json({ success: true, items: enrichedItems });
  } catch (error) {
    console.error('Sync cart error:', error);
    return NextResponse.json({ error: 'Failed to sync cart' }, { status: 500 });
  }
}
