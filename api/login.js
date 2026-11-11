const {
  redis, pipeline, keys, getPartner, setSession, checkPassword, checkAdmin, clientInfo,
  logEvent, readBody, httpError, send, handler
} = require('./_lib/core');

const MAX_TRIES = 8;
const WINDOW_SECONDS = 15 * 60;

module.exports = handler(['POST'], async (req, res) => {
  const body = await readBody(req);
  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  if (!username || !password) throw httpError(400, 'Saisissez votre identifiant et votre mot de passe.');

  const info = clientInfo(req);
  const attemptsKey = keys.attempts(info.ip || 'unknown', username);
  const [tries] = await pipeline([['INCR', attemptsKey], ['EXPIRE', attemptsKey, String(WINDOW_SECONDS)]]);
  if (Number(tries) > MAX_TRIES) throw httpError(429, 'Trop de tentatives. Réessayez dans 15 minutes.');

  const admin = await checkAdmin(username, password);
  if (admin.match) {
    if (!admin.ok) throw httpError(401, 'Identifiant ou mot de passe incorrect.');
    await redis('DEL', attemptsKey);
    setSession(req, res, { role: 'admin', username: admin.username });
    return send(res, 200, { user: { role: 'admin', name: 'Administrateur', username: admin.username } });
  }

  const id = await redis('GET', keys.user(username));
  const partner = await getPartner(id);
  if (!partner || !checkPassword(password, partner.passHash)) throw httpError(401, 'Identifiant ou mot de passe incorrect.');
  if (partner.disabled) throw httpError(403, 'Ce compte est désactivé. Contactez l’équipe Wajahni.');

  await redis('DEL', attemptsKey);
  setSession(req, res, { role: 'partner', id: partner.id, sv: partner.sv });
  await logEvent(partner.id, { type: 'login', ip: info.ip, place: info.place, ua: info.ua });
  send(res, 200, { user: { role: 'partner', name: partner.name, company: partner.company || '', username: partner.username } });
});
