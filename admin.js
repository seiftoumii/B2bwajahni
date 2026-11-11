// Admin panel: list, create and manage partner accounts and read their history.
(() => {
  const $ = id => document.getElementById(id);
  const state = { partners: [], query: '', current: null, history: [], filter: 'all', lastFocus: null };
  const PAGES = {
    '/': 'WAJAHNI Caravan', '/index': 'WAJAHNI Caravan', '/caravan': 'WAJAHNI Caravan', '/home': 'Accueil',
    '/educareer': 'WAJAHNI Edu-Career Summit', '/roadshow': 'WAJAHNI Roadshow', '/platform': 'WAJAHNI Platform',
    '/wajahni360': 'WAJAHNI 360°'
  };

  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtDate = iso => iso ? new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const fmtDateTime = iso => iso ? new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Jamais';
  const fmtTime = iso => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const fmtDay = iso => {
    const d = new Date(iso), today = new Date(), yesterday = new Date(Date.now() - 864e5);
    if (d.toDateString() === today.toDateString()) return 'Aujourd’hui';
    if (d.toDateString() === yesterday.toDateString()) return 'Hier';
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };
  const pageName = path => PAGES[String(path || '/').replace(/\.html$/, '').split(/[?#]/)[0]] || path;

  function device(ua) {
    ua = ua || '';
    const os = /iPhone|iPad/.test(ua) ? (/iPad/.test(ua) ? 'iPad' : 'iPhone') : /Android/.test(ua) ? 'Android' : /Mac OS X/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : '';
    const browser = /Edg\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : '';
    return [browser, os].filter(Boolean).join(' sur ');
  }

  function makePassword() {
    const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = crypto.getRandomValues(new Uint8Array(12));
    return Array.from(bytes, b => chars[b % chars.length]).join('');
  }

  function slug(name) {
    return name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '').slice(0, 40);
  }

  async function api(path, options = {}) {
    const res = await fetch(path, {
      credentials: 'same-origin', ...options,
      headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401) { location.replace('/login?next=/admin'); throw new Error('Session expirée.'); }
    if (!res.ok) throw new Error(data.error || 'L’action a échoué. Réessayez dans un instant.');
    return data;
  }

  function toast(message) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast('Copié dans le presse-papiers'); }
    catch { toast('Sélectionnez le texte pour le copier'); }
  }

  function credentialsText(p, password) {
    return `Bonjour ${p.name},\n\nVoici vos accès à l’espace partenaires Wajahni :\nAdresse : ${location.origin}/login\nIdentifiant : ${p.username}\nMot de passe : ${password}`;
  }

  /* ---------- List ---------- */
  function renderList() {
    const q = state.query.toLowerCase();
    const list = state.partners.filter(p => !q || [p.name, p.company, p.username, p.email].some(v => String(v || '').toLowerCase().includes(q)));
    const active = state.partners.filter(p => !p.disabled).length;
    $('kpi-accounts').textContent = active;
    $('kpi-logins').textContent = state.partners.reduce((n, p) => n + p.logins, 0);
    $('kpi-views').textContent = state.partners.reduce((n, p) => n + p.views, 0);
    $('count').textContent = `${list.length} partenaire${list.length > 1 ? 's' : ''}`;
    $('empty').hidden = state.partners.length > 0;
    $('no-match').hidden = !state.partners.length || list.length > 0;
    document.querySelector('table.partners').hidden = !list.length;
    $('rows').innerHTML = list.map(p => `
      <tr data-id="${esc(p.id)}" tabindex="0" aria-label="Ouvrir ${esc(p.name)}">
        <td class="who"><b>${esc(p.name)}</b>${p.company ? `<span>${esc(p.company)}</span>` : ''}</td>
        <td class="mono" data-label="Identifiant">${esc(p.username)}</td>
        <td data-label="Dernière connexion">${esc(fmtDateTime(p.lastLogin))}</td>
        <td class="num" data-label="Connexions">${p.logins}</td>
        <td class="num" data-label="Pages vues">${p.views}</td>
        <td><span class="badge ${p.disabled ? 'badge-off' : 'badge-ok'}">${p.disabled ? 'Désactivé' : 'Actif'}</span></td>
      </tr>`).join('');
  }

  async function loadPartners() {
    const data = await api('/api/admin/partners');
    state.partners = data.partners;
    renderList();
  }

  function upsert(partner) {
    const i = state.partners.findIndex(p => p.id === partner.id);
    if (i >= 0) state.partners[i] = partner; else state.partners.unshift(partner);
    renderList();
  }

  /* ---------- Drawer ---------- */
  function openDrawer(title, sub, html) {
    state.lastFocus = state.lastFocus || document.activeElement;
    $('drawer-title').textContent = title;
    $('drawer-sub').textContent = sub || '';
    $('drawer-body').innerHTML = html;
    const root = $('drawer-root');
    root.hidden = false;
    requestAnimationFrame(() => document.body.classList.add('drawer-open'));
    const first = $('drawer-body').querySelector('input, button, [href]');
    (first || root.querySelector('.close')).focus();
  }

  function closeDrawer() {
    document.body.classList.remove('drawer-open');
    state.current = null;
    setTimeout(() => { if (!document.body.classList.contains('drawer-open')) $('drawer-root').hidden = true; }, 240);
    if (state.lastFocus) state.lastFocus.focus();
    state.lastFocus = null;
  }

  document.addEventListener('keydown', event => {
    if ($('drawer-root').hidden) return;
    if (event.key === 'Escape') closeDrawer();
    if (event.key === 'Tab') {
      const items = [...document.querySelectorAll('.drawer input, .drawer button, .drawer [href], .drawer select')].filter(el => !el.disabled && el.offsetParent);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { last.focus(); event.preventDefault(); }
      else if (!event.shiftKey && document.activeElement === last) { first.focus(); event.preventDefault(); }
    }
  });

  function fieldError(form, name, message) {
    const input = form.elements[name];
    input.setAttribute('aria-invalid', 'true');
    const el = form.querySelector(`[data-error-for="${name}"]`);
    if (el) el.textContent = message;
  }

  function clearErrors(form) {
    form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
    form.querySelectorAll('.field-error').forEach(el => { el.textContent = ''; });
    const alert = form.querySelector('.alert');
    if (alert) alert.hidden = true;
  }

  /* ---------- Create ---------- */
  function openCreate() {
    openDrawer('Nouveau partenaire', 'Le partenaire pourra se connecter et consulter le site.', `
      <form id="create-form" novalidate>
        <div class="field"><label for="c-name">Nom du contact</label><input class="input" id="c-name" name="name" required autocomplete="off"><span class="field-error" data-error-for="name"></span></div>
        <div class="field"><label for="c-company">Société</label><input class="input" id="c-company" name="company" autocomplete="off"></div>
        <div class="grid-2">
          <div class="field"><label for="c-email">E-mail</label><input class="input" id="c-email" name="email" type="email" autocomplete="off"></div>
          <div class="field"><label for="c-phone">Téléphone</label><input class="input" id="c-phone" name="phone" type="tel" autocomplete="off"></div>
        </div>
        <div class="field"><label for="c-username">Identifiant de connexion</label><input class="input mono" id="c-username" name="username" required autocapitalize="none" spellcheck="false" autocomplete="off"><span class="hint">3 à 40 caractères : lettres, chiffres, point, tiret ou @.</span><span class="field-error" data-error-for="username"></span></div>
        <div class="field"><label for="c-password">Mot de passe</label>
          <div class="input-row"><input class="input mono" id="c-password" name="password" required autocomplete="new-password"><button class="btn btn-ghost btn-sm" type="button" data-action="gen">Générer</button></div>
          <span class="hint">8 caractères minimum. Vous le verrez une seule fois, après la création.</span><span class="field-error" data-error-for="password"></span></div>
        <div class="alert alert-error" role="alert" hidden></div>
        <button class="btn btn-primary" type="submit">Créer le compte</button>
      </form>`);
    const form = $('create-form');
    form.password.value = makePassword();
    let usernameTouched = false;
    form.username.addEventListener('input', () => { usernameTouched = true; });
    form.name.addEventListener('input', () => { if (!usernameTouched) form.username.value = slug(form.name.value); });
    form.querySelector('[data-action=gen]').onclick = () => { form.password.value = makePassword(); form.password.removeAttribute('aria-invalid'); };
    form.addEventListener('input', event => {
      event.target.removeAttribute('aria-invalid');
      const el = form.querySelector(`[data-error-for="${event.target.name}"]`);
      if (el) el.textContent = '';
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      clearErrors(form);
      const body = Object.fromEntries(new FormData(form));
      let bad = false;
      if (!body.name.trim()) { fieldError(form, 'name', 'Indiquez le nom du contact.'); bad = true; }
      if (!/^[a-z0-9][a-z0-9._@-]{2,39}$/i.test(body.username.trim())) { fieldError(form, 'username', 'Utilisez 3 à 40 caractères : lettres, chiffres, point, tiret ou @.'); bad = true; }
      if (body.password.length < 8) { fieldError(form, 'password', 'Utilisez au moins 8 caractères.'); bad = true; }
      if (bad) { form.querySelector('[aria-invalid]').focus(); return; }
      const button = form.querySelector('[type=submit]');
      button.disabled = true; button.textContent = 'Création…';
      try {
        const { partner } = await api('/api/admin/partners', { method: 'POST', body });
        upsert(partner);
        showCreated(partner, body.password);
      } catch (err) {
        if (/identifiant/i.test(err.message)) fieldError(form, 'username', err.message);
        else { const alert = form.querySelector('.alert'); alert.textContent = err.message; alert.hidden = false; }
        button.disabled = false; button.textContent = 'Créer le compte';
      }
    });
  }

  function credsBlock(p, password, intro) {
    return `<div class="creds">
        <p><b>${esc(intro)}</b> Notez ou envoyez ces accès maintenant : le mot de passe ne sera plus affiché.</p>
        <pre id="creds-text">${esc(credentialsText(p, password))}</pre>
        <div class="actions"><button class="btn btn-primary btn-sm" type="button" data-action="copy-creds">Copier les accès</button></div>
      </div>`;
  }

  function showCreated(p, password) {
    openDrawer('Compte créé', `${p.name}${p.company ? ' · ' + p.company : ''}`, `
      ${credsBlock(p, password, 'Le compte est prêt.')}
      <div class="actions">
        <button class="btn btn-ghost" type="button" data-action="open" data-id="${esc(p.id)}">Voir le partenaire</button>
        <button class="btn btn-ghost" type="button" data-action="new">Créer un autre compte</button>
      </div>`);
  }

  /* ---------- Detail ---------- */
  async function openPartner(id) {
    const p = state.partners.find(x => x.id === id);
    state.current = id; state.filter = 'all'; state.history = [];
    openDrawer(p ? p.name : 'Partenaire', p && p.company, `<span class="skeleton" style="width:70%"></span><span class="skeleton" style="width:50%"></span>`);
    try {
      const data = await api(`/api/admin/partner?id=${encodeURIComponent(id)}`);
      if (state.current !== id) return;
      upsert(data.partner);
      state.history = data.history;
      renderPartner(data.partner);
    } catch (err) {
      $('drawer-body').innerHTML = `<div class="alert alert-error">${esc(err.message)}</div>`;
    }
  }

  function renderPartner(p, notice) {
    $('drawer-title').textContent = p.name;
    $('drawer-sub').textContent = p.company || '';
    $('drawer-body').innerHTML = `
      ${notice || ''}
      <div class="facts">
        <div><b>${p.logins}</b><span>Connexions</span></div>
        <div><b>${p.views}</b><span>Pages vues</span></div>
        <div><b style="font-size:14px;line-height:1.35">${esc(fmtDateTime(p.lastSeen))}</b><span>Dernière activité</span></div>
      </div>
      <section>
        <h3 class="section-title">Compte</h3>
        <dl class="details">
          <dt>Identifiant</dt><dd class="mono">${esc(p.username)}</dd>
          <dt>E-mail</dt><dd>${p.email ? `<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>` : '—'}</dd>
          <dt>Téléphone</dt><dd>${esc(p.phone || '—')}</dd>
          <dt>Créé le</dt><dd>${esc(fmtDate(p.createdAt))}</dd>
          <dt>Statut</dt><dd><span class="badge ${p.disabled ? 'badge-off' : 'badge-ok'}">${p.disabled ? 'Désactivé' : 'Actif'}</span></dd>
        </dl>
      </section>
      <div class="actions">
        <button class="btn btn-ghost btn-sm" type="button" data-action="edit">Modifier les infos</button>
        <button class="btn btn-ghost btn-sm" type="button" data-action="reset">Nouveau mot de passe</button>
        <button class="btn btn-ghost btn-sm" type="button" data-action="toggle">${p.disabled ? 'Réactiver le compte' : 'Désactiver le compte'}</button>
        <button class="btn btn-danger btn-sm" type="button" data-action="delete">Supprimer</button>
      </div>
      <div id="inline-slot"></div>
      <section>
        <h3 class="section-title">Historique</h3>
        <div class="filters" role="group" aria-label="Filtrer l’historique">
          <button class="chip" type="button" data-filter="all" aria-pressed="true">Tout</button>
          <button class="chip" type="button" data-filter="login" aria-pressed="false">Connexions</button>
          <button class="chip" type="button" data-filter="view" aria-pressed="false">Pages consultées</button>
        </div>
        <div id="history"></div>
      </section>`;
    renderHistory();
  }

  function renderHistory() {
    document.querySelectorAll('.chip[data-filter]').forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.filter === state.filter)));
    const events = state.history.filter(e => state.filter === 'all' || e.type === state.filter || (state.filter === 'login' && e.type === 'logout'));
    if (!events.length) {
      $('history').innerHTML = `<p style="margin:0;color:var(--wj-muted)">${state.history.length ? 'Rien dans ce filtre.' : 'Ce partenaire ne s’est pas encore connecté.'}</p>`;
      return;
    }
    let day = '';
    $('history').innerHTML = events.map(e => {
      const label = fmtDay(e.at);
      const heading = label !== day ? `<div class="day">${esc(label)}</div>` : '';
      day = label;
      let icon = '•', text = '', meta = '';
      if (e.type === 'login') { icon = '↪'; text = 'Connexion'; meta = [device(e.ua), e.place].filter(Boolean).join(' · '); }
      else if (e.type === 'logout') { icon = '↩'; text = 'Déconnexion'; }
      else { icon = '◉'; text = esc(pageName(e.path)); meta = e.path; }
      return `${heading}<div class="event ${esc(e.type)}"><time datetime="${esc(e.at)}">${esc(fmtTime(e.at))}</time><span class="dot" aria-hidden="true">${icon}</span><div>${text}${meta ? `<small>${esc(meta)}</small>` : ''}</div></div>`;
    }).join('');
  }

  function current() {
    return state.partners.find(p => p.id === state.current);
  }

  function inline(html) {
    const slot = $('inline-slot');
    slot.innerHTML = html;
    const first = slot.querySelector('input, button');
    if (first) first.focus();
    return slot.firstElementChild;
  }

  async function patch(body, okMessage) {
    const p = current();
    const { partner } = await api(`/api/admin/partner?id=${encodeURIComponent(p.id)}`, { method: 'PATCH', body });
    upsert(partner);
    return partner;
  }

  function showEdit() {
    const p = current();
    const box = inline(`<form class="inline-box" novalidate>
        <div class="field"><label for="e-name">Nom du contact</label><input class="input" id="e-name" name="name" value="${esc(p.name)}" required><span class="field-error" data-error-for="name"></span></div>
        <div class="field"><label for="e-company">Société</label><input class="input" id="e-company" name="company" value="${esc(p.company)}"></div>
        <div class="grid-2">
          <div class="field"><label for="e-email">E-mail</label><input class="input" id="e-email" name="email" type="email" value="${esc(p.email)}"></div>
          <div class="field"><label for="e-phone">Téléphone</label><input class="input" id="e-phone" name="phone" type="tel" value="${esc(p.phone)}"></div>
        </div>
        <div class="alert alert-error" role="alert" hidden></div>
        <div class="actions"><button class="btn btn-primary btn-sm" type="submit">Enregistrer</button><button class="btn btn-ghost btn-sm" type="button" data-action="cancel-inline">Annuler</button></div>
      </form>`);
    box.addEventListener('submit', async event => {
      event.preventDefault();
      clearErrors(box);
      const body = Object.fromEntries(new FormData(box));
      if (!body.name.trim()) { fieldError(box, 'name', 'Indiquez le nom du contact.'); box.name.focus(); return; }
      try { renderPartner(await patch(body)); toast('Informations enregistrées'); }
      catch (err) { const a = box.querySelector('.alert'); a.textContent = err.message; a.hidden = false; }
    });
  }

  function showReset() {
    const box = inline(`<form class="inline-box" novalidate>
        <div class="field"><label for="r-password">Nouveau mot de passe</label>
          <div class="input-row"><input class="input mono" id="r-password" name="password" value="${makePassword()}" autocomplete="new-password"><button class="btn btn-ghost btn-sm" type="button" data-action="regen">Générer</button></div>
          <span class="hint">Le partenaire sera déconnecté de tous ses appareils.</span><span class="field-error" data-error-for="password"></span></div>
        <div class="alert alert-error" role="alert" hidden></div>
        <div class="actions"><button class="btn btn-primary btn-sm" type="submit">Changer le mot de passe</button><button class="btn btn-ghost btn-sm" type="button" data-action="cancel-inline">Annuler</button></div>
      </form>`);
    box.querySelector('[data-action=regen]').onclick = () => { box.password.value = makePassword(); };
    box.addEventListener('submit', async event => {
      event.preventDefault();
      clearErrors(box);
      const password = box.password.value;
      if (password.length < 8) { fieldError(box, 'password', 'Utilisez au moins 8 caractères.'); box.password.focus(); return; }
      try {
        const partner = await patch({ password });
        renderPartner(partner, credsBlock(partner, password, 'Mot de passe changé.'));
      } catch (err) { const a = box.querySelector('.alert'); a.textContent = err.message; a.hidden = false; }
    });
  }

  async function toggleDisabled() {
    const p = current();
    try {
      const partner = await patch({ disabled: !p.disabled });
      renderPartner(partner);
      toast(partner.disabled ? 'Compte désactivé : le partenaire ne peut plus se connecter' : 'Compte réactivé');
    } catch (err) { toast(err.message); }
  }

  function showDelete() {
    const p = current();
    const box = inline(`<form class="inline-box" novalidate style="border-color:#f0c5c1;background:var(--wj-err-bg)">
        <p style="margin:0;font-size:14px">Supprimer <b>${esc(p.name)}</b> efface le compte et tout son historique. Cette action est définitive.</p>
        <div class="field"><label for="d-confirm">Tapez l’identifiant <span class="mono">${esc(p.username)}</span> pour confirmer</label><input class="input mono" id="d-confirm" name="confirm" autocomplete="off" autocapitalize="none" spellcheck="false"></div>
        <div class="alert alert-error" role="alert" hidden></div>
        <div class="actions"><button class="btn btn-danger btn-sm" type="submit" disabled>Supprimer ${esc(p.name)}</button><button class="btn btn-ghost btn-sm" type="button" data-action="cancel-inline">Annuler</button></div>
      </form>`);
    const submit = box.querySelector('[type=submit]');
    box.confirm.addEventListener('input', () => { submit.disabled = box.confirm.value.trim().toLowerCase() !== p.username; });
    box.addEventListener('submit', async event => {
      event.preventDefault();
      if (submit.disabled) return;
      try {
        await api(`/api/admin/partner?id=${encodeURIComponent(p.id)}`, { method: 'DELETE' });
        state.partners = state.partners.filter(x => x.id !== p.id);
        renderList();
        closeDrawer();
        toast(`${p.name} a été supprimé`);
      } catch (err) { const a = box.querySelector('.alert'); a.textContent = err.message; a.hidden = false; }
    });
  }

  /* ---------- Events ---------- */
  document.addEventListener('click', event => {
    const row = event.target.closest('#rows tr[data-id]');
    if (row) { state.lastFocus = row; return openPartner(row.dataset.id); }
    const chip = event.target.closest('.chip[data-filter]');
    if (chip) { state.filter = chip.dataset.filter; return renderHistory(); }
    const el = event.target.closest('[data-action]');
    if (!el) return;
    const action = el.dataset.action;
    if (action === 'close') closeDrawer();
    else if (action === 'new') openCreate();
    else if (action === 'open') openPartner(el.dataset.id);
    else if (action === 'clear-search') { $('search').value = ''; state.query = ''; renderList(); $('search').focus(); }
    else if (action === 'copy-creds') copy($('creds-text').textContent);
    else if (action === 'edit') showEdit();
    else if (action === 'reset') showReset();
    else if (action === 'toggle') toggleDisabled();
    else if (action === 'delete') showDelete();
    else if (action === 'cancel-inline') $('inline-slot').innerHTML = '';
  });
  $('rows').addEventListener('keydown', event => {
    const row = event.target.closest('tr[data-id]');
    if (row && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); state.lastFocus = row; openPartner(row.dataset.id); }
  });
  $('new-partner').onclick = openCreate;
  $('search').addEventListener('input', event => { state.query = event.target.value.trim(); renderList(); });
  $('logout').onclick = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
    location.replace('/login');
  };

  /* ---------- Start ---------- */
  (async () => {
    try {
      const me = await fetch('/api/me', { credentials: 'same-origin' }).then(r => r.json());
      if (!me.user || me.user.role !== 'admin') return location.replace('/login?next=/admin');
      $('app').hidden = false;
      await loadPartners();
    } catch (err) {
      $('fatal').textContent = 'Impossible de joindre le serveur : ' + err.message;
      $('fatal').hidden = false;
    }
  })();
})();
