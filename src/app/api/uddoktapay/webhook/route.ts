import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const uddoktaPayApiKey = process.env.UDDOKTAPAY_API_KEY;
    const uddoktaPayBaseUrl = process.env.UDDOKTAPAY_BASE_URL;
    const headerApiKey = request.headers.get('RT-UDDOKTAPAY-API-KEY');

    // Basic verification: check if the API key in the header matches ours.
    if (headerApiKey && uddoktaPayApiKey && headerApiKey !== uddoktaPayApiKey) {
      return NextResponse.json({ error: 'Unauthorized webhook' }, { status: 401 });
    }

    const body = await request.json();

    const orderId = body.metadata?.order_id;
    const invoiceId = body.invoice_id; // Webhook payload usually includes invoice_id

    if (!orderId || !invoiceId) {
      return NextResponse.json({ error: 'Order ID or Invoice ID missing' }, { status: 400 });
    }

    // Verify payment from server
    if (!uddoktaPayApiKey || !uddoktaPayBaseUrl) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const res = await fetch(`${uddoktaPayBaseUrl}/api/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'RT-UDDOKTAPAY-API-KEY': uddoktaPayApiKey,
      },
      body: JSON.stringify({ invoice_id: invoiceId }),
    });

    const data = await res.json();
    
    // SECURITY: Ensure the verified invoice actually belongs to the requested orderId
    if (data.metadata?.order_id !== orderId) {
      return NextResponse.json({ error: 'Order ID mismatch' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Idempotent check
    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    if (data.status === 'COMPLETED') {
      // Amount validation safely using Math.abs for float comparison
      if (data.amount && Math.abs(Number(data.amount) - order.total) > 0.01) {
        return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
      }

      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          uddoktaInvoiceId: invoiceId,
          uddoktaTransactionId: data.transaction_id || null,
          paymentDetails: data,
        },
      });
      console.log(`Order ${orderId} marked as PAID via Webhook verify`);
    } else if (data.status === 'FAILED' || data.status === 'CANCELED') {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'FAILED',
          uddoktaInvoiceId: invoiceId,
          paymentDetails: data,
        },
      });
      console.log(`Order ${orderId} marked as FAILED via Webhook verify`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('UddoktaPay Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

