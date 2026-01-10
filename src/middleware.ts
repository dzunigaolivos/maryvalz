import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/static')) {
    const r = NextResponse.next();
    r.headers.set('x-mw-ran', '1');
    console.log('[middleware-src] skipped asset/api path:', pathname);
    return r;
  }

  const protectedPaths = ['/qr', '/demo'];
  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (!isProtected) return NextResponse.next();

  const keyEnv = process.env.PROTECT_KEY; // expected to be hex SHA-256 of the secret
  const cookieVal = req.cookies.get('access_granted')?.value ?? null;
  const queryKey = req.nextUrl.searchParams.get('key');

  async function sha256Hex(input: string) {
    const enc = new TextEncoder();
    const data = enc.encode(input);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  if (cookieVal && keyEnv && cookieVal === keyEnv) {
    const r = NextResponse.next();
    r.headers.set('x-mw-ran', '1');
    console.log('[middleware-src] allowed by cookie:', pathname);
    return r;
  }

  if (queryKey && keyEnv) {
    const hashed = await sha256Hex(queryKey);
    if (hashed === keyEnv) {
      const res = NextResponse.next();
      res.cookies.set('access_granted', hashed, {
        httpOnly: true,
        path: '/',
        sameSite: 'strict',
        secure: false,
        maxAge: 60 * 60 * 24 * 7,
      });
      res.headers.set('x-mw-ran', '1');
      console.log('[middleware-src] allowed by key param:', pathname);
      return res;
    }
  }

  const redirectUrl = new URL('/enter', req.url);
  redirectUrl.searchParams.set('from', pathname);

  if (process.env.FORCE_MW_BLOCK === '1') {
    console.log('[middleware-src] FORCE_MW_BLOCK active, returning 401 for:', pathname);
    return NextResponse.json(
      { message: 'blocked' },
      {
        status: 401,
        headers: {
          'x-mw-ran': '1',
          'x-mw-debug': `blocked-from:${pathname}`,
        },
      }
    );
  }

  const r = NextResponse.redirect(redirectUrl);
  r.headers.set('x-mw-ran', '1');
  r.headers.set('x-mw-debug', `redirected-from:${pathname}`);
  console.log('[middleware-src] redirecting to /enter from:', pathname);
  return r;
}

export const config = {
  matcher: ['/qr', '/qr/:path*', '/demo', '/demo/:path*'],
};
