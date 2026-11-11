import { NextResponse } from 'next/server';
import { getOrders, getOrdersPaginated, createOrder } from '@/lib/db';
import { createReceiptToken, sendOrderChalanEmail } from '@/lib/chalan';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    let sessionUser: any = null;
    const session = await getServerSession(authOptions);
    
    if (session && session.user) {
      sessionUser = (session.user as any).dbUser || session.user;
    } else {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('bdneeds_session');
      if (sessionCookie?.value) {
        try {
          sessionUser = JSON.parse(decodeURIComponent(sessionCookie.value));
        } catch (e) {}
      }
    }

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('userId') || undefined;
    
    // Normal users can only fetch their own orders
    if (sessionUser.role !== 'ADMIN' && userIdParam && sessionUser.id !== userIdParam) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Determine whose orders to fetch
    const effectiveUserId = sessionUser.role === 'ADMIN' ? userIdParam : sessionUser.id;
    const isPaginated =
      searchParams.get('paginated') === 'true' ||
      searchParams.has('page') ||
      searchParams.has('limit');
    const isExport = searchParams.get('export') === 'true';

    if (isPaginated || isExport) {
      const result = await getOrdersPaginated({
        userId: effectiveUserId,
        clientEmail: searchParams.get('clientEmail') || undefined,
        search: searchParams.get('search') || undefined,
        status: searchParams.get('status') || undefined,
        categoryId: searchParams.get('categoryId') || undefined,
        timeFilter: searchParams.get('timeFilter') || undefined,
        selectedMonth: searchParams.get('selectedMonth') || undefined,
        selectedYear: searchParams.get('selectedYear') || undefined,
        page: isExport ? 1 : searchParams.get('page') ? Number(searchParams.get('page')) : 1,
        limit: isExport ? 10000 : searchParams.get('limit') ? Number(searchParams.get('limit')) : 24,
      });
      return NextResponse.json(isExport ? result.items : result);
    }

    const orders = await getOrders(effectiveUserId);
    return NextResponse.json(orders);
  } catch (error) {
    console.error("API ORDERS ERROR:", error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

const orderSchema = z.object({
  userId: z.string().optional().nullable(),
  customerName: z.string().min(1, 'Customer name is required'),
  customerEmail: z
    .string()
    .trim()
    .optional()
    .default('')
    .refine((val) => val === '' || z.string().email().safeParse(val).success, {
      message: 'Invalid email address',
    }),
  customerPhone: z.string().min(1, 'Phone number is required'),
  shippingAddress: z.object({
    fullName: z.string().min(1).optional(),
    phone: z.string().min(1).optional(),
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
  }),
  deliveryNote: z.string().optional().nullable(),
  couponCode: z.string().optional().nullable(),
  paymentMethod: z.enum(['COD', 'ONLINE']).optional().default('COD'),
  items: z.array(
    z.object({
      productId: z.string().min(1),
      variantId: z.string().optional().nullable(),
      quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    })
  ).min(1, 'Cart is empty, cannot place an empty order'),
  adminDiscountPercentage: z.number().min(0).max(100).optional(),
  adminShippingFee: z.number().min(0).optional(),
});

export async function POST(request: Request) {
  try {
    const jsonBody = await request.json();
    
    // Validate request body using Zod
    const validationResult = orderSchema.safeParse(jsonBody);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const body = validationResult.data;

    // Check auth for admin fields
    let isAdmin = false;
    const session = await getServerSession(authOptions);
    let sessionUser: any = null;
    if (session && session.user) {
      sessionUser = (session.user as any).dbUser || session.user;
    } else {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('bdneeds_session');
      if (sessionCookie?.value) {
        try { sessionUser = JSON.parse(decodeURIComponent(sessionCookie.value)); } catch (e) {}
      }
    }
    if (sessionUser && sessionUser.role === 'ADMIN') {
      isAdmin = true;
    }

    const order = await createOrder({
      userId: body.userId,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      shippingAddress: body.shippingAddress,
      deliveryNote: body.deliveryNote,
      items: body.items,
      couponCode: body.couponCode,
      paymentMethod: body.paymentMethod || 'COD',
      adminDiscountPercentage: isAdmin ? body.adminDiscountPercentage : undefined,
      adminShippingFee: isAdmin ? body.adminShippingFee : undefined,
    });

    const origin =
      request.headers.get('origin') ||
      process.env.NEXTAUTH_URL ||
      'http://localhost:3000';
    const receiptToken = createReceiptToken(order.id);

    if (body.paymentMethod === 'ONLINE') {
      const uddoktaPayApiKey = process.env.UDDOKTAPAY_API_KEY;
      const uddoktaPayBaseUrl = process.env.UDDOKTAPAY_BASE_URL;

      if (uddoktaPayApiKey && uddoktaPayBaseUrl) {
        const paymentData = {
          full_name: body.customerName,
          email: body.customerEmail || 'guest@bdneeds.com.bd',
          amount: order.total, // using total from DB, it's safer
          metadata: { order_id: order.id },
          redirect_url: `${origin}/api/uddoktapay/success?orderId=${order.id}`,
          cancel_url: `${origin}/api/uddoktapay/cancel`,
          webhook_url: `${origin}/api/uddoktapay/webhook`,
        };

        try {
          const upRes = await fetch(`${uddoktaPayBaseUrl}/api/checkout-v2`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'RT-UDDOKTAPAY-API-KEY': uddoktaPayApiKey,
            },
            body: JSON.stringify(paymentData),
          });

          const upData = await upRes.json();
          console.log("UddoktaPay Response:", upData);

          if (upData.status && upData.payment_url) {
            return NextResponse.json(
              { ...order, receiptToken, paymentUrl: upData.payment_url },
              { status: 201 }
            );
          } else {
            console.error('UddoktaPay API Error:', upData);
            return NextResponse.json({ error: 'Payment gateway error', details: upData }, { status: 400 });
          }
        } catch (err) {
          console.error('UddoktaPay creation error:', err);
          return NextResponse.json({ error: 'Failed to connect to payment gateway' }, { status: 500 });
        }
      }
    }

    // Send Order Chalan email if customer provided an email address
    await sendOrderChalanEmail(order, origin);

    return NextResponse.json({ ...order, receiptToken }, { status: 201 });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to place order' },
      { status: 400 }
    );
  }
}
