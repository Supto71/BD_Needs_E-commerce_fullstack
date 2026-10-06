import { PrismaClient } from '@prisma/client';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_BANNERS, INITIAL_COUPONS, INITIAL_REVIEWS, INITIAL_ORDERS, INITIAL_USERS } from '../src/lib/seed-data';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();

  // Users
  for (const user of INITIAL_USERS) {
    await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password || 'password',
        role: user.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER',
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt ? new Date(user.createdAt) : undefined,
      }
    });
  }

  // Categories
  for (const cat of INITIAL_CATEGORIES) {
    await prisma.category.create({
      data: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        image: cat.image,
        icon: cat.icon,
        productCount: cat.productCount,
        isActive: cat.isActive,
        isFeatured: cat.isFeatured,
        order: cat.order,
      }
    });
  }

  // Banners
  for (const banner of INITIAL_BANNERS) {
    await prisma.banner.create({
      data: {
        id: banner.id,
        title: banner.title,
        subtitle: banner.subtitle,
        badge: banner.badge,
        description: banner.description,
        price: banner.price,
        discount: banner.discount,
        image: banner.image,
        ctaText: banner.ctaText,
        ctaLink: banner.ctaLink,
        isActive: banner.isActive,
        order: banner.order,
      }
    });
  }

  // Coupons
  for (const coupon of INITIAL_COUPONS) {
    await prisma.coupon.create({
      data: {
        id: coupon.id,
        code: coupon.code,
        discountType: coupon.discountType === 'PERCENTAGE' ? 'PERCENTAGE' : 'FIXED',
        discountValue: coupon.discountValue,
        minOrderValue: coupon.minOrderValue,
        maxDiscount: coupon.maxDiscount,
        expiryDate: coupon.validUntil ? new Date(coupon.validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: coupon.isActive,
        usageLimit: coupon.usageLimit,
        usedCount: coupon.usedCount,
      }
    });
  }

  // Products
  for (const prod of INITIAL_PRODUCTS) {
    const createdProduct = await prisma.product.create({
      data: {
        id: prod.id,
        name: prod.name,
        slug: prod.slug,
        brand: prod.brand,
        categoryId: prod.categoryId,
        categoryName: prod.categoryName,
        basePrice: prod.basePrice,
        originalPrice: prod.originalPrice,
        discount: prod.discount,
        stock: prod.stock,
        sku: prod.sku,
        shortDescription: prod.shortDescription,
        description: prod.description,
        features: prod.features,
        specifications: prod.specifications as any,
        images: prod.images,
        tags: prod.tags,
        rating: prod.rating,
        reviewCount: prod.reviewCount,
        salesCount: prod.salesCount,
        isFeatured: prod.isFeatured,
        isBestSeller: prod.isBestSeller,
        isNew: prod.isNew,
        isPublished: prod.isPublished,
        createdAt: prod.createdAt ? new Date(prod.createdAt) : undefined,
      }
    });

    if (prod.variants && prod.variants.length > 0) {
      for (const variant of prod.variants) {
        await prisma.productVariant.create({
          data: {
            id: variant.id,
            productId: createdProduct.id,
            sku: variant.sku,
            colorName: variant.colorName,
            colorHex: variant.colorHex,
            size: variant.size,
            storage: variant.storage,
            price: variant.price,
            stock: variant.stock,
            lowStockThreshold: variant.lowStockThreshold,
            images: variant.images,
          }
        });
      }
    }
  }

  // Orders
  for (const ord of INITIAL_ORDERS) {
    const createdOrder = await prisma.order.create({
      data: {
        id: ord.id,
        orderNumber: ord.orderNumber,
        userId: ord.userId,
        customerName: ord.customerName,
        customerEmail: ord.customerEmail,
        customerPhone: ord.customerPhone,
        shippingAddress: ord.shippingAddress,
        deliveryNote: ord.deliveryNote,
        subtotal: ord.subtotal,
        discount: ord.discount,
        couponCode: ord.couponCode,
        shippingFee: ord.shippingFee,
        tax: ord.tax,
        total: ord.total,
        paymentMethod: ord.paymentMethod === 'COD' ? 'COD' : 'CARD',
        paymentStatus: ord.paymentStatus === 'PAID' ? 'PAID' : 'PENDING',
        orderStatus: ord.orderStatus === 'DELIVERED' ? 'DELIVERED' : 'PENDING',
        trackingNumber: ord.trackingNumber,
        timeline: ord.timeline as any,
        createdAt: ord.createdAt ? new Date(ord.createdAt) : undefined,
      }
    });

    if (ord.items && ord.items.length > 0) {
      for (const item of ord.items) {
        await prisma.orderItem.create({
          data: {
            id: item.id,
            orderId: createdOrder.id,
            productId: item.productId,
            productName: item.productName,
            productSlug: item.productSlug,
            productImage: item.productImage,
            variantId: item.variantId,
            variantSku: item.variantSku,
            variantColor: item.variantColor,
            variantSize: item.variantSize,
            variantStorage: item.variantStorage,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
          }
        });
      }
    }
  }

  // Reviews
  for (const review of INITIAL_REVIEWS) {
    await prisma.review.create({
      data: {
        id: review.id,
        productId: review.productId,
        userId: review.userId,
        customerName: review.customerName,
        customerAvatar: review.customerAvatar,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        images: review.images,
        isVerifiedPurchase: review.isVerifiedPurchase,
        isApproved: review.isApproved,
        createdAt: review.createdAt ? new Date(review.createdAt) : undefined,
      }
    });
  }

  console.log('Database seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
