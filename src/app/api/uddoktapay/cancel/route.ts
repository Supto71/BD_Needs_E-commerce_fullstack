import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/checkout`, 302);
}

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  return NextResponse.redirect(`${origin}/checkout`, 303);
}
