// GET: every partner with their activity counts. POST: create a partner account.
const crypto = require('crypto');
const {
  redis, pipeline, keys, hashPassword, readBody, httpError, send, handler,
  requireAdmin, publicPartner, hashToObject, adminUsername
} = require('../_lib/core');

const USERNAME = /^[a-z0-9][a-z0-9._@-]{2,39}$/i;

function clean(value, max) {
  return String(value || '').trim().slice(0, max);
}

module.exports = handler(['GET', 'POST'], async (req, res) => {
  await requireAdmin(req);

  if (req.method === 'GET') {
    const ids = (await redis('SMEMBERS', keys.partners)) || [];
    if (!ids.length) return send(res, 200, { partners: [] });
    const rows = await pipeline(ids.flatMap(id => [['GET', keys.partner(id)], ['HGETALL', keys.stats(id)]]));
    const partners = [];
    ids.forEach((id, i) => {
      const raw = rows[i * 2];
      if (raw) partners.push(publicPartner(JSON.parse(raw), hashToObject(rows[i * 2 + 1])));
    });
    partners.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    return send(res, 200, { partners });
  }

  const body = await readBody(req);
  const name = clean(body.name, 80);
  const username = clean(body.username, 40).toLowerCase();
  const password = String(body.password || '');
  if (!name) throw httpError(400, 'Indiquez le nom du partenaire.');
  if (!USERNAME.test(username)) throw httpError(400, 'L’identifiant doit faire 3 à 40 caractères : lettres, chiffres, point, tiret, @.');
  if (username === adminUsername().toLowerCase()) throw httpError(409, 'Cet identifiant est déjà utilisé.');
  if (password.length < 8) throw httpError(400, 'Le mot de passe doit faire au moins 8 caractères.');

  const id = crypto.randomUUID();
  const claimed = await redis('SET', keys.user(username), id, 'NX');
  if (!claimed) throw httpError(409, 'Cet identifiant est déjà utilisé.');

  const partner = {
    id, username, name,
    company: clean(body.company, 120), email: clean(body.email, 120), phone: clean(body.phone, 40),
    passHash: hashPassword(password), createdAt: new Date().toISOString(), disabled: false, sv: 1
  };
  await pipeline([['SET', keys.partner(id), JSON.stringify(partner)], ['SADD', keys.partners, id]]);
  send(res, 201, { partner: publicPartner(partner) });
});
