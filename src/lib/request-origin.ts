/**
 * Public origin of the incoming request.
 *
 * Behind cPanel (LiteSpeed / Passenger) the app receives requests as
 * `http://localhost:3000/...`, so `request.url` must NEVER be used to build
 * redirects or absolute links. We use the `x-forwarded-host` / `host` header
 * instead and force `https` in production (`x-forwarded-proto` is not trusted
 * because the proxy/framework may overwrite it with `http`).
 */
type HeaderSource = { headers: { get(name: string): string | null } };

const LOCAL_HOST = /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])(:\d+)?$/i;

export function getPublicOrigin(request: HeaderSource): string {
  const configured = (process.env.APP_URL || process.env.NEXTAUTH_URL || '').replace(/\/$/, '');

  const rawHost =
    request.headers.get('x-forwarded-host')?.split(',')[0].trim() ||
    request.headers.get('host')?.trim() ||
    '';

  if (!rawHost || (LOCAL_HOST.test(rawHost) && process.env.NODE_ENV === 'production')) {
    // Proxy did not pass a usable host — fall back to the configured public URL.
    return configured || `http://${rawHost || 'localhost:3000'}`;
  }

  const proto = LOCAL_HOST.test(rawHost) ? 'http' : 'https';
  return `${proto}://${rawHost}`;
}

