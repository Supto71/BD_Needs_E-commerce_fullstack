import { NextResponse } from 'next/server';
import { getOrderById, updateOrderStatus, deleteOrder } from '@/lib/db';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

import { cookies } from 'next/headers';

async function getSessionUser() {
  const session = await getServerSession(authOptions);
  let sessionUser: any = null;
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
  return sessionUser;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const sessionUser = await getSessionUser();
    const isAdmin = sessionUser?.role === 'ADMIN';
    const isOwner = sessionUser?.id && order.userId === sessionUser.id;

    if (isAdmin || isOwner) {
      return NextResponse.json(order);
    }

    // Sanitize order for public tracking (guest)
    const sanitizedOrder = {
      ...order,
      customerName: '***',
      customerEmail: '***',
      customerPhone: '***',
      shippingAddress: order.shippingAddress && typeof order.shippingAddress === 'object' ? {
        ...(order.shippingAddress as any),
        fullName: '***',
        phone: '***',
        street: '***',
        city: '***',
      } : null
    };

    return NextResponse.json(sanitizedOrder);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (sessionUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;
    const { status, note, paymentStatus } = await request.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const updated = await updateOrderStatus(id, status, note, paymentStatus);
    if (!updated) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (sessionUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;
    await deleteOrder(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
