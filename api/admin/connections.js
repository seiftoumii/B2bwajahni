// Partner connection dates, for the "Date de connection 1…7" columns of the
// partners sheet.
//
// GET  ?format=json|csv  &per=day|login  &max=7
//   per=day (default): one date per day the partner logged in (first login of
//   that day); per=login: every login. Oldest first, at most `max` dates.
//   Auth: the admin session (for the /admin download) or ?key=<sync key>
//   (for the Google Sheets script, which has no session).
// POST {action:'key'}: the admin reads the sync key (created on first use).
// POST {action:'rotate'}: the admin replaces it; the old key stops working.
const crypto = require('crypto');
const {
  redis, pipeline, keys, readBody, httpError, send, handler, requireAdmin, safeEqual, currentUser
} = require('../_lib/core');

const TZ = 'Africa/Tunis';

function newKey() {
  return 'wjs_' + crypto.randomBytes(24).toString('base64url');
}

async function authorised(req, url) {
  const given = url.searchParams.get('key');
  if (given) {
    const stored = process.env.SYNC_KEY || await redis('GET', keys.syncKey);
    if (stored && safeEqual(given, stored)) return true;
    throw httpError(401, 'Clé de synchronisation invalide. Copiez la clé actuelle depuis /admin.');
  }
  const user = await currentUser(req);
  if (!user || user.role !== 'admin') throw httpError(401, 'Connexion administrateur requise.');
  return true;
}

// "2026-11-17" and "17/11/2026 11:31" in Tunis time.
function tunisParts(iso) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date(iso)).map(p => [p.type, p.value]));
  return {
    day: `${parts.year}-${parts.month}-${parts.day}`,
    text: `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`
  };
}

function loginTimes(loginList, history) {
  const seen = new Set();
  (loginList || []).forEach(at => seen.add(at));
  // Logins from before the dedicated list existed are still in the history.
  (history || []).forEach(row => {
    try { const e = JSON.parse(row); if (e && e.type === 'login' && e.at) seen.add(e.at); } catch {}
  });
  return [...seen].filter(at => !isNaN(Date.parse(at))).sort();
}

function pickDates(times, per, max) {
  const out = [], days = new Set();
  for (const at of times) {
    const { day } = tunisParts(at);
    if (per === 'day') { if (days.has(day)) continue; days.add(day); }
    out.push(at);
    if (out.length >= max) break;
  }
  return out;
}

function csvCell(value) {
  const s = String(value == null ? '' : value);
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

module.exports = handler(['GET', 'POST'], async (req, res) => {
  const url = new URL(req.url, 'http://x');

  if (req.method === 'POST') {
    await requireAdmin(req);
    const body = await readBody(req);
    if (process.env.SYNC_KEY) return send(res, 200, { key: process.env.SYNC_KEY, fromEnv: true });
    if (body.action === 'rotate') {
      const key = newKey();
      await redis('SET', keys.syncKey, key);
      return send(res, 200, { key });
    }
    let key = await redis('GET', keys.syncKey);
    if (!key) {
      key = newKey();
      const claimed = await redis('SET', keys.syncKey, key, 'NX');
      if (!claimed) key = await redis('GET', keys.syncKey);
    }
    return send(res, 200, { key });
  }

  await authorised(req, url);
  const per = url.searchParams.get('per') === 'login' ? 'login' : 'day';
  const max = Math.min(50, Math.max(1, parseInt(url.searchParams.get('max'), 10) || 7));

  const ids = (await redis('SMEMBERS', keys.partners)) || [];
  const rows = ids.length ? await pipeline(ids.flatMap(id => [
    ['GET', keys.partner(id)],
    ['LRANGE', keys.logins(id), '0', '-1'],
    ['LRANGE', keys.history(id), '0', '-1']
  ])) : [];

  const partners = [];
  ids.forEach((id, i) => {
    const raw = rows[i * 3];
    if (!raw) return;
    const p = JSON.parse(raw);
    const times = loginTimes(rows[i * 3 + 1], rows[i * 3 + 2]);
    const dates = pickDates(times, per, max);
    partners.push({
      username: p.username, name: p.name, company: p.company || '',
      logins: times.length, dates, datesText: dates.map(at => tunisParts(at).text)
    });
  });
  partners.sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  if (url.searchParams.get('format') === 'csv') {
    const head = ['Nom de l\'établissement', 'Identifiant'];
    for (let n = 1; n <= max; n++) head.push(`Date de connection ${n}`);
    const lines = [head].concat(partners.map(p => {
      const cells = [p.name, p.username];
      for (let n = 0; n < max; n++) cells.push(p.datesText[n] || '');
      return cells;
    })).map(cells => cells.map(csvCell).join(';'));
    const stamp = tunisParts(new Date().toISOString()).day;
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Disposition', `attachment; filename="connexions-partenaires-${stamp}.csv"`);
    // BOM + ";" so Excel (French settings) opens it straight into columns.
    return res.end('﻿' + lines.join('\r\n') + '\r\n');
  }

  send(res, 200, { generatedAt: new Date().toISOString(), timeZone: TZ, per, max, partners });
});
