// One partner, by ?id=.
// GET: profile + history. PATCH: edit details, reset password, enable/disable.
// DELETE: remove the account and its history.
const {
  redis, pipeline, keys, getPartner, hashPassword, readBody, httpError, send, handler,
  requireAdmin, publicPartner, hashToObject
} = require('../_lib/core');

function clean(value, max) {
  return String(value || '').trim().slice(0, max);
}

module.exports = handler(['GET', 'PATCH', 'DELETE'], async (req, res) => {
  await requireAdmin(req);
  const id = new URL(req.url, 'http://x').searchParams.get('id');
  const partner = await getPartner(id);
  if (!partner) throw httpError(404, 'Partenaire introuvable.');

  if (req.method === 'GET') {
    const [stats, history] = await pipeline([
      ['HGETALL', keys.stats(id)],
      ['LRANGE', keys.history(id), '0', '-1']
    ]);
    return send(res, 200, {
      partner: publicPartner(partner, hashToObject(stats)),
      history: (history || []).map(row => { try { return JSON.parse(row); } catch { return null; } }).filter(Boolean)
    });
  }

  if (req.method === 'DELETE') {
    await pipeline([
      ['DEL', keys.partner(id), keys.stats(id), keys.history(id), keys.user(partner.username)],
      ['SREM', keys.partners, id]
    ]);
    return send(res, 200, { ok: true });
  }

  const body = await readBody(req);
  if ('name' in body) {
    const name = clean(body.name, 80);
    if (!name) throw httpError(400, 'Indiquez le nom du partenaire.');
    partner.name = name;
  }
  if ('company' in body) partner.company = clean(body.company, 120);
  if ('email' in body) partner.email = clean(body.email, 120);
  if ('phone' in body) partner.phone = clean(body.phone, 40);
  if ('disabled' in body) {
    partner.disabled = !!body.disabled;
    if (partner.disabled) partner.sv = (partner.sv || 1) + 1;
  }
  if (body.password != null) {
    if (String(body.password).length < 8) throw httpError(400, 'Le mot de passe doit faire au moins 8 caractères.');
    partner.passHash = hashPassword(String(body.password));
    partner.sv = (partner.sv || 1) + 1; // signs the partner out everywhere
  }
  await redis('SET', keys.partner(id), JSON.stringify(partner));
  const stats = await redis('HGETALL', keys.stats(id));
  send(res, 200, { partner: publicPartner(partner, hashToObject(stats)) });
});
