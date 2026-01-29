import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Helper: SHA-256 -> hex
async function sha256Hex(input: string) {
  const enc = new TextEncoder();
  const data = enc.encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Verificar acceso para /chat usando token y device_id de cookies
async function verifyChatAccess(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get('maryvalz_token')?.value;
  const deviceId = req.cookies.get('maryvalz_device_id')?.value;

  if (!token || !deviceId) {
    return false;
  }

  try {
    // Decodificar y validar estructura del token
    const decoded = JSON.parse(atob(token));
    if (!decoded.device_id || !decoded.created_at) {
      return false;
    }

    // Verificar que el device_id del token coincide con la cookie
    if (decoded.device_id !== deviceId) {
      return false;
    }

    // Llamar al API para verificar contra Supabase
    const verifyUrl = new URL('/api/verify-access', req.url);
    const response = await fetch(verifyUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device_id: deviceId, token }),
    });

    const data = await response.json();
    return data.valid === true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignorar activos de next, api y assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/static')) {
    const r = NextResponse.next();
    r.headers.set('x-mw-ran', '1');
    return r;
  }

  // Protección para /chat - usa token del cuestionario
  if (pathname === '/chat' || pathname.startsWith('/chat/')) {
    const hasAccess = await verifyChatAccess(req);

    if (hasAccess) {
      const r = NextResponse.next();
      r.headers.set('x-mw-ran', '1');
      return r;
    }

    // Redirigir a la página principal si no tiene acceso
    const redirectUrl = new URL('/', req.url);
    const r = NextResponse.redirect(redirectUrl);
    r.headers.set('x-mw-ran', '1');
    return r;
  }

  // Protección para /qr y /demo - usa PROTECT_KEY
  const protectedPaths = ['/qr', '/demo'];
  const isProtected = protectedPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (!isProtected) return NextResponse.next();

  const keyEnv = process.env.PROTECT_KEY;
  const cookieVal = req.cookies.get('access_granted')?.value ?? null;
  const queryKey = req.nextUrl.searchParams.get('key');

  if (cookieVal && keyEnv && cookieVal === keyEnv) {
    const r = NextResponse.next();
    r.headers.set('x-mw-ran', '1');
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
      return res;
    }
  }

  const redirectUrl = new URL('/enter', req.url);
  redirectUrl.searchParams.set('from', pathname);

  if (process.env.FORCE_MW_BLOCK === '1') {
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
  return r;
}

export const config = {
  matcher: ['/chat', '/chat/:path*', '/qr', '/qr/:path*', '/demo', '/demo/:path*'],
};
