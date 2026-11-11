// Shared helpers for the login API: Redis (Upstash REST), sessions, passwords.
// No npm dependencies: Node's crypto + fetch only.
const crypto = require('crypto');

const COOKIE = 'wj_session';
const SESSION_DAYS = 7;
const HISTORY_MAX = 2000;

// Vercel names the Upstash settings KV_REST_API_URL/TOKEN or
// UPSTASH_REDIS_REST_URL/TOKEN, sometimes with a custom prefix
// (e.g. STORAGE_KV_REST_API_URL). Accept any of them.
function findEnv(suffixes) {
  for (const suffix of suffixes) if (process.env[suffix]) return process.env[suffix];
  const key = Object.keys(process.env).find(k => suffixes.some(suffix => k.endsWith('_' + suffix)) && process.env[k]);
  return key ? process.env[key] : '';
}

function redisConfig() {
  const url = findEnv(['KV_REST_API_URL', 'UPSTASH_REDIS_REST_URL']);
  const token = findEnv(['KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_TOKEN']);
  if (!url || !token) {
    const other = Object.keys(process.env).some(k => /REDIS_URL$|^KV_URL$/.test(k));
    throw httpError(503, other
      ? 'Une base Redis est connectée, mais pas Upstash (adresse REST introuvable). Connectez « Upstash for Redis » au projet.'
      : 'La base de données n’est pas encore configurée.');
  }
  return { url: url.replace(/\/$/, ''), token };
}

async function redisFetch(path, body) {
  const { url, token } = redisConfig();
  const res = await fetch(url + path, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) throw new Error('Redis: ' + (data.error || res.status));
  return data;
}

async function redis(...command) {
  return (await redisFetch('', command)).result;
}

async function pipeline(commands) {
  if (!commands.length) return [];
  const rows = await redisFetch('/pipeline', commands);
  return rows.map(row => {
    if (row.error) throw new Error('Redis: ' + row.error);
    return row.result;
  });
}

// SESSION_SECRET if set; otherwise derived from the (server-only) Upstash
// token, so the site works with nothing but the database connected.
function secret() {
  const value = process.env.SESSION_SECRET;
  if (value && value.length >= 16) return value;
  const token = findEnv(['KV_REST_API_TOKEN', 'UPSTASH_REDIS_REST_TOKEN']);
  if (!token) throw httpError(503, 'La base de données n’est pas encore configurée.');
  return 'wj-session:' + token;
}

// Built-in admin, used when ADMIN_USERNAME/ADMIN_PASSWORD are not set in Vercel.
// Only a scrypt hash lives here; the admin can change the password from /admin
// (the new hash is stored in the database under wj:admin:hash).
const BUILTIN_ADMIN = 'admin';
const BUILTIN_ADMIN_HASH = 'scrypt$ktgpDIF_-SEQZADmQJdkhw$kzSJDlI-iubY30UpPsteS7xLLmKK_lDPkXAkhxgC14A';

async function checkAdmin(username, password) {
  const envUser = process.env.ADMIN_USERNAME, envPass = process.env.ADMIN_PASSWORD;
  if (envUser && envPass) {
    return username.toLowerCase() === envUser.toLowerCase() ? { match: true, ok: safeEqual(password, envPass), username: envUser } : { match: false };
  }
  if (username.toLowerCase() !== BUILTIN_ADMIN) return { match: false };
  const stored = (await redis('GET', 'wj:admin:hash')) || BUILTIN_ADMIN_HASH;
  return { match: true, ok: checkPassword(password, stored), username: BUILTIN_ADMIN };
}

function adminUsername() {
  return process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD ? process.env.ADMIN_USERNAME : BUILTIN_ADMIN;
}

function signSession(payload) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + SESSION_DAYS * 864e5 })).toString('base64url');
  const mac = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  return `${body}.${mac}`;
}

function verifySession(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [body, mac] = token.split('.');
  const expected = crypto.createHmac('sha256', secret()).update(body).digest('base64url');
  if (!safeEqual(mac, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    return payload.exp > Date.now() ? payload : null;
  } catch { return null; }
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('base64url');
  const hash = crypto.scryptSync(String(password), salt, 32).toString('base64url');
  return `scrypt$${salt}$${hash}`;
}

function checkPassword(password, stored) {
  const [, salt, hash] = String(stored || '').split('$');
  if (!salt || !hash) return false;
  return safeEqual(crypto.scryptSync(String(password), salt, 32).toString('base64url'), hash);
}

function parseCookies(req) {
  const out = {};
  String(req.headers.cookie || '').split(';').forEach(part => {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

function isLocal(req) {
  return /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(String(req.headers.host || ''));
}

function sessionCookie(req, value, maxAge) {
  return [`${COOKIE}=${value}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAge}`]
    .concat(isLocal(req) ? [] : ['Secure']).join('; ');
}

function setSession(req, res, payload) {
  res.setHeader('Set-Cookie', sessionCookie(req, signSession(payload), SESSION_DAYS * 86400));
}

function clearSession(req, res) {
  res.setHeader('Set-Cookie', sessionCookie(req, '', 0));
}

const keys = {
  partner: id => `wj:partner:${id}`,
  user: username => `wj:user:${String(username).toLowerCase()}`,
  partners: 'wj:partners',
  history: id => `wj:hist:${id}`,
  stats: id => `wj:stats:${id}`,
  lastView: (id, path) => `wj:lv:${id}:${path}`,
  attempts: (ip, username) => `wj:try:${ip}:${String(username).toLowerCase()}`
};

async function getPartner(id) {
  const raw = id ? await redis('GET', keys.partner(id)) : null;
  return raw ? JSON.parse(raw) : null;
}

// The signed-in user. Partners are re-checked against the database, so a
// disabled, deleted or password-reset account is signed out at once.
async function currentUser(req) {
  const session = verifySession(parseCookies(req)[COOKIE]);
  if (!session) return null;
  if (session.role === 'admin') return { role: 'admin', id: 'admin', name: 'Administrateur', username: session.username };
  const partner = await getPartner(session.id);
  if (!partner || partner.disabled || partner.sv !== session.sv) return null;
  return { role: 'partner', id: partner.id, name: partner.name, company: partner.company || '', username: partner.username };
}

function clientInfo(req) {
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  let city = '';
  try { city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : ''; } catch {}
  const country = req.headers['x-vercel-ip-country'] || '';
  return { ip, place: [city, country].filter(Boolean).join(', '), ua: String(req.headers['user-agent'] || '').slice(0, 300) };
}

async function logEvent(id, event) {
  const now = new Date().toISOString();
  const commands = [
    ['LPUSH', keys.history(id), JSON.stringify({ ...event, at: now })],
    ['LTRIM', keys.history(id), '0', String(HISTORY_MAX - 1)],
    ['HSET', keys.stats(id), 'lastSeen', now]
  ];
  if (event.type === 'login') commands.push(['HINCRBY', keys.stats(id), 'logins', '1'], ['HSET', keys.stats(id), 'lastLogin', now]);
  if (event.type === 'view') commands.push(['HINCRBY', keys.stats(id), 'views', '1']);
  await pipeline(commands);
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return {}; } }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  try { return JSON.parse(Buffer.concat(chunks).toString() || '{}'); } catch { return {}; }
}

function httpError(status, message) {
  return Object.assign(new Error(message), { status });
}

function send(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

// Wraps a handler: method check, same-origin check on writes, JSON errors.
function handler(methods, fn) {
  return async (req, res) => {
    try {
      if (!methods.includes(req.method)) throw httpError(405, 'Méthode non autorisée.');
      if (req.method !== 'GET' && req.headers.origin) {
        let host = '';
        try { host = new URL(req.headers.origin).host; } catch {}
        if (host !== req.headers.host) throw httpError(403, 'Origine refusée.');
      }
      await fn(req, res);
    } catch (err) {
      if (!err.status) console.error(err);
      send(res, err.status || 500, { error: err.status ? err.message : 'Erreur serveur. Réessayez dans un instant.' });
    }
  };
}

async function requireAdmin(req) {
  const user = await currentUser(req);
  if (!user || user.role !== 'admin') throw httpError(401, 'Connexion administrateur requise.');
  return user;
}

function publicPartner(p, stats) {
  stats = stats || {};
  return {
    id: p.id, username: p.username, name: p.name, company: p.company || '', email: p.email || '',
    phone: p.phone || '', createdAt: p.createdAt, disabled: !!p.disabled,
    logins: Number(stats.logins || 0), views: Number(stats.views || 0),
    lastLogin: stats.lastLogin || null, lastSeen: stats.lastSeen || null
  };
}

function hashToObject(value) {
  if (value && !Array.isArray(value) && typeof value === 'object') return value;
  const out = {};
  for (let i = 0; Array.isArray(value) && i < value.length; i += 2) out[value[i]] = value[i + 1];
  return out;
}

module.exports = {
  redis, pipeline, keys, getPartner, currentUser, setSession, clearSession, hashPassword,
  checkPassword, safeEqual, clientInfo, logEvent, readBody, httpError, send, handler,
  requireAdmin, publicPartner, hashToObject, checkAdmin, adminUsername
};
