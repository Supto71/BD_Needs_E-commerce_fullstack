import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

const ratelimit = redis
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
    })
  : null;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate Limiting Logic for Auth & Webhooks (Brute-force prevention)
  if (
    ratelimit &&
    (pathname.startsWith('/api/auth') || pathname.startsWith('/api/uddoktapay/webhook'))
  ) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const { success, limit, remaining } = await ratelimit.limit(`ratelimit_${ip}`);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too Many Requests', message: 'Rate limit exceeded, please try again later.' },
        { 
          status: 429, 
          headers: { 
            'X-RateLimit-Limit': limit.toString(), 
            'X-RateLimit-Remaining': remaining.toString() 
          } 
        }
      );
    }
  }

  // Shudhu /admin routes check korbo (login page bade)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    // Cookie theke user info check korbo
    const userCookie = request.cookies.get('bdneeds_session');

    if (!userCookie) {
      // Cookie nai — login page e redirect
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const user = JSON.parse(decodeURIComponent(userCookie.value));
      if (user?.role !== 'ADMIN' && user?.role !== 'MODERATOR') {
        // ADMIN ba MODERATOR na — home e redirect
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch {
      // Cookie invalid — login page e redirect
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect API routes from MODERATOR mutations except for orders
  if (pathname.startsWith('/api/') && request.method !== 'GET') {
    const userCookie = request.cookies.get('bdneeds_session');
    if (userCookie) {
      try {
        const user = JSON.parse(decodeURIComponent(userCookie.value));
        if (user?.role === 'MODERATOR') {
          // Allow specific mutations for moderators
          const isOrderUpdate = pathname.startsWith('/api/orders/') && request.method === 'PATCH';
          const isCustomerFraudUpdate = pathname.startsWith('/api/customers/') && request.method === 'PATCH';
          const isAvatarUpdate = pathname === '/api/user/update-avatar' && request.method === 'POST';
          const isAuthRoute = pathname.startsWith('/api/auth/');
          
          if (!isOrderUpdate && !isCustomerFraudUpdate && !isAvatarUpdate && !isAuthRoute) {
            return NextResponse.json({ error: 'Moderators are not allowed to perform this action' }, { status: 403 });
          }
        }
      } catch (e) {
        // Ignore JSON parse errors here, let the API route handle invalid auth if needed
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
