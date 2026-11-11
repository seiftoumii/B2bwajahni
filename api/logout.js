const { currentUser, clearSession, logEvent, send, handler } = require('./_lib/core');

module.exports = handler(['POST'], async (req, res) => {
  const user = await currentUser(req).catch(() => null);
  if (user && user.role === 'partner') await logEvent(user.id, { type: 'logout' });
  clearSession(req, res);
  send(res, 200, { ok: true });
});
