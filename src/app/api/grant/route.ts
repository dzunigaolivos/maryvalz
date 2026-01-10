import { NextResponse } from 'next/server';

// POST handler: accept form or JSON { key, to }
export async function POST(req: Request) {
  const keyEnv = process.env.PROTECT_KEY; // expected hex SHA-256

  // parse form or json
  let key: string | null = null;
  let to = '/';
  try {
    const ct = req.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const body = await req.json();
      key = body.key ?? null;
      to = body.to ?? to;
    } else {
      const form = await req.formData();
      key = form.get('key')?.toString() ?? null;
      to = form.get('to')?.toString() ?? to;
    }
  } catch (e) {
    // ignore
  }

  if (!key || !keyEnv) {
    const redirectTo = new URL(`/enter?error=1&from=${encodeURIComponent(to)}`, req.url);
    return NextResponse.redirect(redirectTo);
  }

  // Hash helper
  async function sha256Hex(input: string) {
    const enc = new TextEncoder();
    const data = enc.encode(input);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  const hashed = await sha256Hex(key);
  if (hashed === keyEnv) {
    const res = NextResponse.redirect(new URL(to, req.url));
    res.cookies.set('access_granted', hashed, {
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
      secure: false,
      maxAge: 60 * 60 * 24 * 7,
    });
    res.headers.set('x-api-grant', 'granted');
    return res;
  }

  const redirectTo = new URL(`/enter?error=1&from=${encodeURIComponent(to)}`, req.url);
  return NextResponse.redirect(redirectTo);
}
