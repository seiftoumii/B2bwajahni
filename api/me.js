// GET: who is signed in. POST {path, title}: same, and records a page view
// in the partner's history (the same page within a minute counts once).
const { redis, keys, currentUser, clearSession, logEvent, readBody, send, handler } = require('./_lib/core');

module.exports = handler(['GET', 'POST'], async (req, res) => {
  const user = await currentUser(req);
  if (!user) {
    if (String(req.headers.cookie || '').includes('wj_session=')) clearSession(req, res);
    return send(res, 200, { user: null });
  }
  if (req.method === 'POST' && user.role === 'partner') {
    const body = await readBody(req);
    const path = String(body.path || '/').slice(0, 200);
    const title = String(body.title || '').slice(0, 160);
    const fresh = await redis('SET', keys.lastView(user.id, path), '1', 'EX', '60', 'NX');
    if (fresh) await logEvent(user.id, { type: 'view', path, title });
  }
  send(res, 200, { user });
});
