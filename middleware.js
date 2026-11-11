// Optional site lock. When the Vercel environment variable REQUIRE_LOGIN is
// "1", every page asks visitors to log in first (partners and the admin).
// Without it the site stays public and this does nothing.
export const config = {
  matcher: ['/((?!api/|assets/|login).*)']
};

const PUBLIC_FILE = /\.(?!html?$)[a-z0-9]+$/i;

function b64urlToBytes(value) {
  const base = value.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(base + '='.repeat((4 - (base.length % 4)) % 4));
  return Uint8Array.from(bin, c => c.charCodeAt(0));
}

async function readSession(request) {
  const secret = process.env.SESSION_SECRET;
  const cookie = request.headers.get('cookie') || '';
  const match = cookie.match(/(?:^|;\s*)wj_session=([^;]+)/);
  if (!secret || !match) return null;
  const [body, mac] = decodeURIComponent(match[1]).split('.');
  if (!body || !mac) return null;
  try {
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const ok = await crypto.subtle.verify('HMAC', key, b64urlToBytes(mac), new TextEncoder().encode(body));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(body)));
    return payload.exp > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

// Partners are re-checked in the database so a disabled account is locked out at once.
async function partnerIsActive(session) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return false;
  try {
    const res = await fetch(url.replace(/\/$/, ''), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(['GET', `wj:partner:${session.id}`])
    });
    const { result } = await res.json();
    const partner = result ? JSON.parse(result) : null;
    return !!partner && !partner.disabled && partner.sv === session.sv;
  } catch {
    return false;
  }
}

export default async function middleware(request) {
  if (process.env.REQUIRE_LOGIN !== '1') return;
  const url = new URL(request.url);
  if (PUBLIC_FILE.test(url.pathname)) return;

  const session = await readSession(request);
  if (session && (session.role === 'admin' || await partnerIsActive(session))) return;

  const login = new URL('/login', url);
  login.searchParams.set('next', url.pathname + url.search);
  return Response.redirect(login, 307);
}
