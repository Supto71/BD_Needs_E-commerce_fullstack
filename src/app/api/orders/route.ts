import { NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/lib/db';
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
  customerEmail: z.string().email('Invalid email address'),
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
    });

    if (body.paymentMethod === 'ONLINE') {
      const uddoktaPayApiKey = process.env.UDDOKTAPAY_API_KEY;
      const uddoktaPayBaseUrl = process.env.UDDOKTAPAY_BASE_URL;

      if (uddoktaPayApiKey && uddoktaPayBaseUrl) {
        const origin = request.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const paymentData = {
          full_name: body.customerName,
          email: body.customerEmail,
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
            return NextResponse.json({ ...order, paymentUrl: upData.payment_url }, { status: 201 });
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

    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to place order' },
      { status: 400 }
    );
  }
}
