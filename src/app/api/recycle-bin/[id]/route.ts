import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await prisma.recycleBin.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to permanently delete item' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const item = await prisma.recycleBin.findUnique({ where: { id } });
    
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const data = item.originalData as any;
    
    // We cannot blindly restore relations because related items might be deleted.
    // For simplicity, we restore the root item.
    // We should remove any relational lists like variants, items, etc. from data if they exist.
    const cleanData = { ...data };
    
    if (item.entityType === 'Order') {
      const { items, user, ...orderData } = cleanData;
      if (orderData.userId) {
        const userExists = await prisma.user.findUnique({ where: { id: orderData.userId } });
        if (!userExists) {
          orderData.userId = null;
        }
      }
      await prisma.order.create({
        data: {
          ...orderData,
          items: items?.length > 0 ? {
            create: items.map((i: any) => {
              const { orderId, ...itemData } = i;
              return itemData;
            })
          } : undefined
        }
      });
    } else if (item.entityType === 'Product') {
      const { variants, reviews, orderItems, ...productData } = cleanData;
      await prisma.product.create({
        data: {
          ...productData,
          variants: variants?.length > 0 ? {
            create: variants.map((v: any) => {
              const { productId, ...variantData } = v;
              return variantData;
            })
          } : undefined
        }
      });
    } else if (item.entityType === 'Category') {
      delete cleanData.products;
      await prisma.category.create({ data: cleanData });
    } else if (item.entityType === 'Banner') {
      await prisma.banner.create({ data: cleanData });
    } else if (item.entityType === 'Review') {
      delete cleanData.product;
      delete cleanData.user;
      await prisma.review.create({ data: cleanData });
    } else if (item.entityType === 'Coupon') {
      await prisma.coupon.create({ data: cleanData });
    } else if (item.entityType === 'User') {
      const { orders, reviews, ...userData } = cleanData;
      await prisma.user.create({
        data: {
          ...userData,
          orders: orders?.length > 0 ? {
            create: orders.map((o: any) => {
              const { items, userId, ...orderData } = o;
              return {
                ...orderData,
                items: items?.length > 0 ? {
                  create: items.map((i: any) => {
                    const { orderId, ...itemData } = i;
                    return itemData;
                  })
                } : undefined
              };
            })
          } : undefined,
          reviews: reviews?.length > 0 ? {
            create: reviews.map((r: any) => {
              const { userId, ...reviewData } = r;
              return reviewData;
            })
          } : undefined
        }
      });
    } else {
      return NextResponse.json({ error: 'Unsupported entity type for restoration' }, { status: 400 });
    }

    // If restore was successful, remove from recycle bin
    await prisma.recycleBin.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Restore Error:', error);
    return NextResponse.json({ error: 'Failed to restore item. It may have conflicting unique constraints.' }, { status: 500 });
  }
}
