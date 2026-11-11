import { NextResponse } from 'next/server';
import { getPublicOrigin } from '@/lib/request-origin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const origin = getPublicOrigin(request);
  return NextResponse.redirect(`${origin}/checkout`, 302);
}

export async function POST(request: Request) {
  const origin = getPublicOrigin(request);
  return NextResponse.redirect(`${origin}/checkout`, 303);
}
