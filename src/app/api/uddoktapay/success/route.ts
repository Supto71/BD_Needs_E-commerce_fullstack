import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  const origin = new URL(request.url).origin;
  
  if (orderId) {
    return NextResponse.redirect(`${origin}/order-success?orderId=${orderId}`, 302);
  }
  return NextResponse.redirect(`${origin}/`, 302);
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');
  const origin = new URL(request.url).origin;
  
  if (orderId) {
    return NextResponse.redirect(`${origin}/order-success?orderId=${orderId}`, 303);
  }
  return NextResponse.redirect(`${origin}/`, 303);
}
