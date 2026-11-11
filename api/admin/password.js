// POST {current, password}: the built-in admin changes their own password.
const { redis, readBody, httpError, send, handler, requireAdmin, checkAdmin, hashPassword } = require('../_lib/core');

module.exports = handler(['POST'], async (req, res) => {
  const admin = await requireAdmin(req);
  if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
    throw httpError(409, 'Le mot de passe admin est défini dans Vercel (ADMIN_PASSWORD) : changez-le là-bas.');
  }
  const body = await readBody(req);
  const password = String(body.password || '');
  const check = await checkAdmin(admin.username, String(body.current || ''));
  if (!check.ok) throw httpError(400, 'Le mot de passe actuel est incorrect.');
  if (password.length < 10) throw httpError(400, 'Le nouveau mot de passe doit faire au moins 10 caractères.');
  await redis('SET', 'wj:admin:hash', hashPassword(password));
  send(res, 200, { ok: true });
});
