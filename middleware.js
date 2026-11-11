// The whole site is private: only signed-in partners and the admin can see it.
// Everything except the login page (and the few files it needs) and the API
// asks for a valid session. Pages send visitors to /login; other files answer 401.
export const config = {
  matcher: ['/((?!api/).*)']
};

const OPEN_PATHS = new Set([
  '/login', '/login.html', '/auth.css', '/robots.txt', '/favicon.ico',
  '/assets/home/wajahni-logo-white.png', '/assets/home/n265-14033.png', '/assets/home/hero/accueil-hero-bg.jpg'
]);
const FILE = /\.(?!html?$)[a-z0-9]+$/i;

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

// Same lookup as api/_lib/core.js: plain names first, then any prefixed name.
function findEnv(suffixes, direct) {
  const hit = direct.find(Boolean);
  if (hit) return hit;
  try {
    const key = Object.keys(process.env).find(k => suffixes.some(suffix => k.endsWith('_' + suffix)) && process.env[k]);
    return key ? process.env[key] : '';
  } catch {
    return '';
  }
}

// On page loads, partners are re-checked in the database so a disabled,
// deleted or password-reset account is locked out at once.
async function partnerIsActive(session) {
  const url = findEnv(['KV_REST_API_URL', 'UPSTASH_REDIS_REST_URL'], [process.env.KV_REST_API_URL, process.env.UPSTASH_REDIS_REST_URL]);
  const token = findEnv(['KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_TOKEN'], [process.env.KV_REST_API_TOKEN, process.env.UPSTASH_REDIS_REST_TOKEN]);
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
  const url = new URL(request.url);
  if (OPEN_PATHS.has(url.pathname)) return;
  const isFile = FILE.test(url.pathname);

  const session = await readSession(request);
  if (session && (session.role === 'admin' || isFile || await partnerIsActive(session))) return;

  if (isFile) return new Response('Connexion requise.', { status: 401, headers: { 'Cache-Control': 'no-store' } });
  const login = new URL('/login', url);
  if (url.pathname !== '/' || url.search) login.searchParams.set('next', url.pathname + url.search);
  return Response.redirect(login, 307);
}
