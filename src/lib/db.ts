import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

async function moveToRecycleBin(entityType: string, id: string, entityTitle: string, data: any) {
  try {
    await prisma.recycleBin.create({
      data: {
        entityType,
        entityId: id,
        entityTitle,
        originalData: JSON.parse(JSON.stringify(data))
      }
    });
  } catch (err) {
    console.error('Failed to move to recycle bin:', err);
  }
}

// ==========================================
// PRODUCTS API
// ==========================================

export interface ProductFiltersDef {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  rating?: number;
  inStock?: boolean;
  color?: string;
  sortBy?:
    | 'featured'
    | 'best-selling'
    | 'newest'
    | 'price-low-high'
    | 'price-high-low'
    | 'rating';
}

export async function getProducts(filters?: ProductFiltersDef) {
  let where: Prisma.ProductWhereInput = { isPublished: true };

  if (filters?.category) {
    where = {
      ...where,
      OR: [
        { categoryId: { equals: filters.category } },
        { categoryName: { equals: filters.category } },
      ],
    };
  }
  if (filters?.brand) {
    where.brand = { equals: filters.brand };
  }
  if (filters?.search) {
    const originalTerms = filters.search.trim().toLowerCase().split(/\s+/);
    
    // Synonym mapping for basic semantic search feel
    const synonyms: Record<string, string[]> = {
      'clothes': ['apparel', 'fashion', 't-shirt', 'shirt', 'pant', 'wear'],
      'cloth': ['apparel', 'fashion', 't-shirt', 'shirt', 'pant', 'wear'],
      'clothing': ['apparel', 'fashion', 't-shirt', 'shirt', 'pant', 'wear'],
      'gadget': ['electronic', 'smart', 'device', 'audio'],
      'gadgets': ['electronic', 'smart', 'device', 'audio'],
      'skin': ['skincare', 'serum', 'beauty', 'grooming', 'lotion'],
      'shoe': ['sneaker', 'footwear', 'boot', 'runner'],
      'shoes': ['sneaker', 'footwear', 'boot', 'runner'],
      'pc': ['computer', 'laptop', 'desktop', 'workstation'],
      'computer': ['pc', 'laptop', 'desktop', 'workstation'],
      'phone': ['smartphone', 'mobile', 'cellphone'],
      'bag': ['briefcase', 'backpack', 'tote', 'luggage', 'pouch'],
      'bags': ['briefcase', 'backpack', 'tote', 'luggage', 'pouch'],
    };

    const termConditions = originalTerms.map(term => {
      const termGroup = [term];
      if (synonyms[term]) {
        termGroup.push(...synonyms[term]);
      }

      const orConditions = termGroup.map(t => {
        let stem = t;
        if (stem.length > 3) {
          if (stem.endsWith('ies')) stem = stem.slice(0, -3) + 'y';
          else if (stem.endsWith('es') && !stem.endsWith('shoes')) stem = stem.slice(0, -2);
          else if (stem.endsWith('s') && !stem.endsWith('ss')) stem = stem.slice(0, -1);
          else if (stem.endsWith('ing')) stem = stem.slice(0, -3);
          else if (stem.endsWith('e')) stem = stem.slice(0, -1);
        }
        if (stem.length < 3) stem = t;

        return {
          OR: [
            { name: { contains: stem, mode: 'insensitive' as any } },
            { brand: { contains: stem, mode: 'insensitive' as any } },
            { shortDescription: { contains: stem, mode: 'insensitive' as any } },
            { description: { contains: stem, mode: 'insensitive' as any } },
            { categoryName: { contains: stem, mode: 'insensitive' as any } },
          ]
        };
      });

      return { OR: orConditions };
    });

    if (where.OR) {
      where.AND = [{ OR: where.OR }, ...termConditions];
      delete where.OR;
    } else {
      where.AND = termConditions;
    }
  }
  if (filters?.minPrice !== undefined) {
    where.basePrice = { ...((where.basePrice as any) || {}), gte: filters.minPrice };
  }
  if (filters?.maxPrice !== undefined) {
    where.basePrice = { ...((where.basePrice as any) || {}), lte: filters.maxPrice };
  }
  if (filters?.rating !== undefined && filters.rating > 0) {
    where.rating = { gte: filters.rating };
  }
  if (filters?.inStock) {
    where.stock = { gt: 0 };
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = {};
  switch (filters?.sortBy) {
    case 'best-selling':
      orderBy = { salesCount: 'desc' };
      break;
    case 'newest':
      orderBy = { createdAt: 'desc' };
      break;
    case 'price-low-high':
      orderBy = { basePrice: 'asc' };
      break;
    case 'price-high-low':
      orderBy = { basePrice: 'desc' };
      break;
    case 'rating':
      orderBy = { rating: 'desc' };
      break;
    case 'featured':
    default:
      orderBy = { isFeatured: 'desc' };
      break;
  }

  const products = await prisma.product.findMany({
    where,
    orderBy,
    include: { variants: true },
  });
  return products as unknown as import('@/types').Product[];
}

export async function getAllProductsAdmin() {
  return prisma.product.findMany({ include: { variants: true } }) as unknown as Promise<import('@/types').Product[]>;
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: { variants: true, reviews: true },
  }) as unknown as Promise<import('@/types').Product & { reviews: import('@/types').Review[] } | null>;
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { variants: true, reviews: true },
  }) as unknown as Promise<import('@/types').Product & { reviews: import('@/types').Review[] } | null>;
}

export async function getRelatedProducts(productId: string, categoryId: string, limit = 4) {
  return prisma.product.findMany({
    where: { categoryId, id: { not: productId }, isPublished: true },
    take: limit,
    include: { variants: true },
  }) as unknown as Promise<import('@/types').Product[]>;
}

export async function createProduct(data: any) {
  const { variants, ...productData } = data;
  return prisma.product.create({
    data: {
      ...productData,
      ...(variants && {
        variants: {
          create: variants.map((v: any) => {
            const { id, productId, ...rest } = v;
            return rest;
          })
        }
      })
    }
  });
}

export async function updateProduct(id: string, data: any) {
  const { variants, ...productData } = data;
  return prisma.product.update({
    where: { id },
    data: {
      ...productData,
      ...(variants && {
        variants: {
          deleteMany: {},
          create: variants.map((v: any) => {
            const { id: vId, productId, ...rest } = v;
            return rest;
          })
        }
      })
    }
  });
}

export async function deleteProduct(id: string) {
  const prod = await prisma.product.findUnique({ where: { id }, include: { variants: true } });
  if (prod) await moveToRecycleBin('Product', id, prod.name, prod);
  await prisma.product.delete({ where: { id } });
  return true;
}

// ==========================================
// CATEGORIES API
// ==========================================

export async function getCategories() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    include: {
      subcategories: true,
      _count: {
        select: { products: true }
      }
    }
  });
  return categories.map(c => ({
    ...c,
    productCount: c._count.products
  }));
}

export async function getAllCategoriesAdmin() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      subcategories: true,
      _count: {
        select: { products: true }
      }
    }
  });
  return categories.map(c => ({
    ...c,
    productCount: c._count.products
  }));
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function createCategory(data: any) {
  return prisma.category.create({ data });
}

export async function updateCategory(id: string, data: any) {
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  const cat = await prisma.category.findUnique({ where: { id } });
  if (cat) await moveToRecycleBin('Category', id, cat.name, cat);
  await prisma.category.delete({ where: { id } });
  return true;
}

// ==========================================
// BANNERS API
// ==========================================

export async function getBanners() {
  return prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });
}

export async function getAllBannersAdmin() {
  return prisma.banner.findMany({ orderBy: { order: 'asc' } });
}

export async function createBanner(data: any) {
  return prisma.banner.create({ data });
}

export async function updateBanner(id: string, data: any) {
  return prisma.banner.update({ where: { id }, data });
}

export async function deleteBanner(id: string) {
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (banner) await moveToRecycleBin('Banner', id, banner.title, banner);
  await prisma.banner.delete({ where: { id } });
  return true;
}

// ==========================================
// ORDERS & CHECKOUT ENGINE
// ==========================================

export async function getOrders(userId?: string) {
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    const email = user?.email;

    return prisma.order.findMany({
      where: {
        OR: [
          { userId },
          ...(email ? [{ customerEmail: email }] : [])
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: { 
        items: {
          include: {
            product: { select: { categoryId: true } }
          }
        }, 
        user: { select: { isFraud: true } } 
      },
    });
  }
  return prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { 
      items: {
        include: {
          product: { select: { categoryId: true } }
        }
      }, 
      user: { select: { isFraud: true } } 
    },
  });
}

export async function getOrderById(id: string) {
  return prisma.order.findFirst({
    where: {
      OR: [
        { id },
        { orderNumber: id },
        { trackingNumber: id },
      ],
    },
    include: { items: true, user: { select: { isFraud: true } } },
  });
}

export async function createOrder(input: any) {
  const orderNumber = `NC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const trackingNumber = `NV-${Math.floor(10000000 + Math.random() * 90000000)}-US`;

  return await prisma.$transaction(async (tx) => {
    // Step 1: Fetch real prices, lock rows, and deduct stock
    const enrichedItems = await Promise.all(
      input.items.map(async (item: any) => {
        // Row-level lock on Product to prevent race conditions
        const productsRaw = await tx.$queryRaw`SELECT * FROM \`Product\` WHERE id = ${item.productId} FOR UPDATE`;
        const productLocked = (productsRaw as any)[0];
        if (!productLocked) throw new Error(`Product not found: ${item.productId}`);

        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { variants: true },
        });
        if (!product) throw new Error(`Product not found: ${item.productId}`);

        let price = product.basePrice;
        let variantSku: string | null = null;
        let variantColor: string | null = null;
        let variantSize: string | null = null;
        let variantStorage: string | null = null;

        if (item.variantId) {
          // Row-level lock on ProductVariant
          const variantsRaw = await tx.$queryRaw`SELECT * FROM \`ProductVariant\` WHERE id = ${item.variantId} FOR UPDATE`;
          const variantLocked = (variantsRaw as any)[0];
          if (!variantLocked) throw new Error(`Variant not found: ${item.variantId}`);

          const variant = product.variants.find((v) => v.id === item.variantId);
          if (variant) {
            if (variant.stock < item.quantity) {
              throw new Error(`Insufficient stock for variant of ${product.name}`);
            }
            price = variant.price;
            variantSku = variant.sku;
            variantColor = variant.colorName;
            variantSize = variant.size ?? null;
            variantStorage = variant.storage ?? null;

            // Deduct stock safely
            await tx.productVariant.update({
              where: { id: variant.id },
              data: { stock: variant.stock - item.quantity },
            });
          }
        } else {
          if (product.stock < item.quantity) {
            throw new Error(`Insufficient stock for ${product.name}`);
          }
          // Deduct stock safely
          await tx.product.update({
            where: { id: product.id },
            data: { stock: product.stock - item.quantity },
          });
        }

        const productImages = product.images as string[];
        const productImage = Array.isArray(productImages) && productImages.length > 0
          ? productImages[0]
          : '';

        // Also increment sales count
        await tx.product.update({
          where: { id: product.id },
          data: { salesCount: product.salesCount + item.quantity },
        });

        return {
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          productImage,
          variantId: item.variantId || null,
          variantSku,
          variantColor,
          variantSize,
          variantStorage,
          price,
          quantity: item.quantity,
          total: price * item.quantity,
        };
      })
    );

    // Step 2: Calculate financials
    const subtotal = enrichedItems.reduce((acc, item) => acc + item.total, 0);

    // Apply coupon discount (or admin discount)
    let discount = 0;
    let couponCode: string | null = null;
    if (input.adminDiscountPercentage !== undefined && input.adminDiscountPercentage > 0) {
      discount = Math.round((subtotal * (input.adminDiscountPercentage / 100)) * 100) / 100;
    } else if (input.couponCode) {
      const couponRaw = await tx.$queryRaw`SELECT * FROM \`Coupon\` WHERE code = ${input.couponCode} FOR UPDATE`;
      const couponLocked = (couponRaw as any)[0];
      if (couponLocked) {
        const coupon = await tx.coupon.findUnique({ where: { code: input.couponCode } });
        if (coupon && coupon.isActive && coupon.usedCount < coupon.usageLimit) {
          couponCode = coupon.code;
          if (coupon.discountType === 'PERCENTAGE') {
            discount = Math.min(subtotal * (coupon.discountValue / 100), coupon.maxDiscount ?? Infinity);
          } else {
            discount = coupon.discountValue;
          }
          discount = Math.round(discount * 100) / 100;
          // Increment usage
          await tx.coupon.update({ where: { id: coupon.id }, data: { usedCount: coupon.usedCount + 1 } });
        }
      }
    }

    // Fetch Store Settings for Shipping rules
    let shippingFee = 0;
    if (input.adminShippingFee !== undefined) {
      shippingFee = input.adminShippingFee;
    } else {
      const settings = await tx.settings.findFirst();
      const feeInside = settings?.shippingFeeInsideDhaka ?? 70;
      const feeOutside = settings?.shippingFeeOutsideDhaka ?? 130;
      const freeThreshold = settings?.freeShippingThreshold ?? 5000;
      
      const city: string = (input.shippingAddress?.city || '').toLowerCase();
      const isDhaka = city === 'dhaka';
      shippingFee = isDhaka ? feeInside : feeOutside;
      if (subtotal >= freeThreshold) shippingFee = 0;
    }

    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = 0; // Number((taxableAmount * 0.05).toFixed(2));
    const total = Number((taxableAmount + shippingFee + tax).toFixed(2));

    // Step 3: Build userId relation safely
    let userConnect = {};
    if (input.userId) {
      const userExists = await tx.user.findUnique({ where: { id: input.userId } });
      if (userExists) {
        userConnect = { user: { connect: { id: input.userId } } };
      }
    }

    const order = await tx.order.create({
      data: {
        orderNumber,
        ...userConnect,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        shippingAddress: input.shippingAddress,
        deliveryNote: input.deliveryNote || '',
        subtotal,
        discount,
        couponCode,
        shippingFee,
        tax,
        total,
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentMethod === 'COD' ? 'PENDING' : 'PAID',
        orderStatus: 'PENDING',
        trackingNumber,
        timeline: [
          {
            status: 'PENDING',
            title: 'Order Placed',
            timestamp: new Date().toISOString(),
            note: `Order registered successfully via ${input.paymentMethod}.`,
          },
        ],
        items: {
          create: enrichedItems,
        },
      },
      include: { items: true },
    });

    return order;
  });
}

export async function deleteOrder(id: string) {
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (order) await moveToRecycleBin('Order', id, `Order #${order.orderNumber}`, order);
  return prisma.order.delete({ where: { id } });
}

export async function updateOrderStatus(orderId: string, newStatus: any, note?: string, paymentStatus?: any) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return null;
  
  const timeline = order.timeline as any[];
  timeline.push({
    status: newStatus,
    title: newStatus,
    timestamp: new Date().toISOString(),
    note: note || `Status updated to ${newStatus}.`,
  });

  return prisma.order.update({
    where: { id: orderId },
    data: {
      orderStatus: newStatus,
      paymentStatus: paymentStatus || order.paymentStatus,
      timeline,
    },
    include: { items: true }
  });
}

// ==========================================
// INVENTORY & STOCK MANAGEMENT
// ==========================================

export async function getInventoryStatus() {
  const products = await prisma.product.findMany({ include: { variants: true } });
  const inventoryItems: any[] = [];

  for (const p of products) {
    if (p.variants && p.variants.length > 0) {
      for (const v of p.variants) {
        inventoryItems.push({
          productId: p.id,
          productName: p.name,
          variantId: v.id,
          sku: v.sku,
          colorName: v.colorName,
          size: v.size,
          stock: v.stock,
          lowStockThreshold: v.lowStockThreshold || 5,
          isLowStock: v.stock > 0 && v.stock <= (v.lowStockThreshold || 5),
          isOutOfStock: v.stock <= 0,
        });
      }
    } else {
      inventoryItems.push({
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        stock: p.stock,
        lowStockThreshold: p.lowStockThreshold,
        isLowStock: p.stock > 0 && p.stock <= p.lowStockThreshold,
        isOutOfStock: p.stock <= 0,
      });
    }
  }
  return inventoryItems;
}

export async function updateStock(productId: string, variantId: string | undefined, newStock?: number, newThreshold?: number) {
  if (variantId) {
    const data: any = {};
    if (newStock !== undefined) data.stock = Math.max(0, newStock);
    if (newThreshold !== undefined) data.lowStockThreshold = Math.max(0, newThreshold);
    await prisma.productVariant.update({
      where: { id: variantId },
      data
    });
  } else {
    const data: any = {};
    if (newStock !== undefined) data.stock = Math.max(0, newStock);
    if (newThreshold !== undefined) data.lowStockThreshold = Math.max(0, newThreshold);
    await prisma.product.update({
      where: { id: productId },
      data
    });
  }
  return true;
}

// ==========================================
// REVIEWS
// ==========================================

export async function getReviews(productId: string) {
  return prisma.review.findMany({
    where: { productId, isApproved: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllReviewsAdmin() {
  return prisma.review.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function syncProductRating(productId: string) {
  const reviews = await prisma.review.findMany({
    where: { productId, isApproved: true },
    select: { rating: true }
  });
  const reviewCount = reviews.length;
  const rating = reviewCount > 0 
    ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1)) 
    : 0;

  await prisma.product.update({
    where: { id: productId },
    data: { rating, reviewCount }
  });
}

export async function createReview(data: any) {
  const review = await prisma.review.create({ data });
  if (review.isApproved) await syncProductRating(review.productId);
  return review;
}

export async function moderateReview(id: string, isApproved: boolean) {
  const review = await prisma.review.update({
    where: { id },
    data: { isApproved }
  });
  await syncProductRating(review.productId);
  return true;
}

export async function deleteReview(id: string) {
  const review = await prisma.review.findUnique({ where: { id } });
  if (review) {
    await moveToRecycleBin('Review', id, review.title, review);
    await prisma.review.delete({ where: { id } });
    await syncProductRating(review.productId);
  }
  return true;
}

// ==========================================
// COUPONS
// ==========================================

export async function getCoupons() {
  return prisma.coupon.findMany();
}

export async function validateCoupon(code: string, subtotal: number) {
  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon || !coupon.isActive) return { valid: false, error: 'Invalid or inactive coupon' };
  
  if (coupon.minOrderValue > subtotal) {
    return { valid: false, error: `Minimum order value is ${coupon.minOrderValue}` };
  }
  
  if (coupon.expiryDate < new Date()) {
    return { valid: false, error: 'Coupon has expired' };
  }
  
  if (coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, error: 'Coupon usage limit reached' };
  }
  
  return { valid: true, coupon };
}

export async function createCoupon(data: any) {
  return prisma.coupon.create({ data });
}

export async function updateCoupon(id: string, data: any) {
  return prisma.coupon.update({ where: { id }, data });
}

export async function deleteCoupon(id: string) {
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (coupon) await moveToRecycleBin('Coupon', id, coupon.code, coupon);
  await prisma.coupon.delete({ where: { id } });
  return true;
}

// ==========================================
// USERS & AUTH
// ==========================================

export async function getUsers() {
  return prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function getUserByIdentifier(identifier: string) {
  return prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { phone: identifier },
      ],
    },
  });
}

export async function createUser(data: any) {
  return prisma.user.create({ data });
}

// ==========================================
// ANALYTICS
// ==========================================

export async function getAdminAnalytics() {
  const [totalRevenueResult, orderCount, productCount, userCount, recentOrders] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID' } }),
    prisma.order.count(),
    prisma.product.count(),
    prisma.user.count(),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { items: true } })
  ]);
  
  return {
    totalRevenue: totalRevenueResult._sum.total || 0,
    orderCount,
    productCount,
    userCount,
    recentOrders
  };
}
