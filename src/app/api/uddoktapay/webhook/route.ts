import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const uddoktaPayApiKey = process.env.UDDOKTAPAY_API_KEY;
    const headerApiKey = request.headers.get('RT-UDDOKTAPAY-API-KEY');

    // Basic verification: check if the API key in the header matches ours.
    // If your webhook doesn't send the API key, you can implement server-to-server verification via verify-payment API
    if (headerApiKey && uddoktaPayApiKey && headerApiKey !== uddoktaPayApiKey) {
      return NextResponse.json({ error: 'Unauthorized webhook' }, { status: 401 });
    }

    const body = await request.json();

    const status = body.status;
    const orderId = body.metadata?.order_id;
    const transactionId = body.transaction_id;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID missing' }, { status: 400 });
    }

    if (status === 'COMPLETED') {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
        },
      });
      console.log(`Order ${orderId} marked as PAID via UddoktaPay trx ${transactionId}`);
    } else if (status === 'FAILED' || status === 'CANCELED') {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'FAILED',
        },
      });
      console.log(`Order ${orderId} marked as FAILED via UddoktaPay trx ${transactionId}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('UddoktaPay Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
