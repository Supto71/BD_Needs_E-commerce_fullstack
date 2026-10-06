import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

async function verifyAndProcessPayment(invoiceId: string, orderId: string) {
  const apiKey = process.env.UDDOKTAPAY_API_KEY;
  const baseUrl = process.env.UDDOKTAPAY_BASE_URL;

  if (!apiKey || !baseUrl) return false;

  try {
    const res = await fetch(`${baseUrl}/api/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'RT-UDDOKTAPAY-API-KEY': apiKey,
      },
      body: JSON.stringify({ invoice_id: invoiceId }),
    });

    const data = await res.json();
    
    // SECURITY: Ensure the verified invoice actually belongs to the requested orderId
    if (data.metadata?.order_id !== orderId) {
      console.error('Security alert: Invoice belongs to a different order');
      return false;
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return false;

    // Idempotent check
    if (order.paymentStatus === 'PAID') return true;
    
    if (data.status === 'COMPLETED') {
      // Amount validation safely using Math.abs for float comparison
      if (data.amount && Math.abs(Number(data.amount) - order.total) > 0.01) {
        console.error(`Payment amount mismatch! Expected ${order.total}, got ${data.amount}`);
        return false;
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
      return true;
    } else if (data.status === 'FAILED' || data.status === 'CANCELED') {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'FAILED',
          uddoktaInvoiceId: invoiceId,
          paymentDetails: data,
        },
      });
      return false;
    }

    return false;
  } catch (err) {
    console.error('Verify error:', err);
    return false;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  const invoiceId = searchParams.get('invoice_id');
  const origin = new URL(request.url).origin;
  
  if (orderId && invoiceId) {
    await verifyAndProcessPayment(invoiceId, orderId);
    return NextResponse.redirect(`${origin}/order-success?orderId=${orderId}`, 302);
  }
  
  if (orderId) {
    return NextResponse.redirect(`${origin}/order-success?orderId=${orderId}`, 302);
  }
  return NextResponse.redirect(`${origin}/`, 302);
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  const origin = new URL(request.url).origin;
  
  try {
    // UddoktaPay POST callback could be JSON or form-data
    const clonedReq = request.clone();
    let invoiceId;
    try {
      const body = await clonedReq.json();
      invoiceId = body.invoice_id;
    } catch {
      const formData = await request.formData();
      invoiceId = formData.get('invoice_id') as string;
    }

    if (orderId && invoiceId) {
      await verifyAndProcessPayment(invoiceId, orderId);
    }
  } catch (e) {
    console.error('Error parsing success POST data', e);
  }
  
  if (orderId) {
    return NextResponse.redirect(`${origin}/order-success?orderId=${orderId}`, 303);
  }
  return NextResponse.redirect(`${origin}/`, 303);
}
