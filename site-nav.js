const wajahniPages = [
  { key: 'home', label: 'Accueil', href: 'home' },
  { key: 'caravan', label: 'WAJAHNI Caravan', href: 'caravan' },
  { key: 'educareer', label: 'WAJAHNI Edu-Career Summit', href: 'educareer' },
  { key: 'roadshow', label: 'WAJAHNI Roadshow', href: 'roadshow' },
  { key: 'platform', label: 'WAJAHNI Platform', href: 'platform', isNew: true },
  { key: '360', label: 'WAJAHNI 360°', href: 'wajahni360', isNew: true }
];

(() => {
  const header = document.querySelector('.site-header');
  const home = wajahniPages[0].href;
  const current = location.pathname.split('/').pop().replace(/\.html$/, '');
  const page = wajahniPages.find(item => item.key === document.body.dataset.page || item.href === current) || wajahniPages[0];
  header.innerHTML = `
    <a class="site-logo" href="${home}#top" aria-label="Accueil Wajahni"><img src="assets/home/wajahni-logo-white.png" alt="Wajahni"></a>
    <button type="button" aria-expanded="false" aria-controls="site-links">Menu ☰</button>
    <nav id="site-links" aria-label="Navigation principale">
      ${wajahniPages.map(item => `<a href="${item.href}#top" ${item === page ? 'aria-current="page"' : ''}>${item.label}${item.isNew ? '<span class="site-new">New</span>' : ''}</a>`).join('')}
      <div class="site-nav-account"><a href="login">Espace partenaires · Se connecter</a></div>
    </nav>
    <div class="site-end">
      <a class="site-contact" href="${home}#contact">Contactez-nous ↗</a>
      <div class="site-account">
        <a class="site-account-btn" href="login" aria-label="Espace partenaires : se connecter" title="Espace partenaires">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
        </a>
      </div>
    </div>`;
  const toggle = header.querySelector('button');
  function setOpen(open) {
    header.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  }
  toggle.onclick = () => setOpen(!header.classList.contains('is-open'));
  document.addEventListener('click', event => {
    if (!header.contains(event.target) || event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header.classList.contains('is-open')) {
      setOpen(false);
      toggle.focus();
    }
  });
  setupAccount(header.querySelector('.site-account'), header.querySelector('.site-nav-account'));
  matchMedia('(max-width: 1050px)').addEventListener('change', () => setOpen(false));
  window.addEventListener('pageshow', () => setOpen(false));
})();

// Partner/admin account button. Asks the server who is signed in and, for a
// partner, records this page in their history (see api/me.js).
function setupAccount(slot, navSlot) {
  const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  fetch('/api/me', {
    method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path: location.pathname, title: document.title })
  })
    .then(res => res.ok ? res.json() : null)
    .then(data => {
      const user = data && data.user;
      if (!user) return;
      const initials = String(user.name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
      slot.innerHTML = `
        <button type="button" class="site-account-btn is-in" aria-expanded="false" aria-controls="site-account-menu" aria-label="Mon compte : ${esc(user.name)}" title="${esc(user.name)}">${esc(initials)}</button>
        <div class="site-account-menu" id="site-account-menu" hidden>
          <p><b>${esc(user.name)}</b><span>${esc(user.role === 'admin' ? 'Accès administrateur' : (user.company || 'Partenaire'))}</span></p>
          ${user.role === 'admin' ? '<a href="admin">Administration</a>' : ''}
          <button type="button" data-logout>Se déconnecter</button>
        </div>`;
      // Phones and tablets: the same entries live at the end of the Menu list.
      navSlot.innerHTML = `
        <span>Connecté : <b>${esc(user.name)}</b></span>
        ${user.role === 'admin' ? '<a href="admin">Administration</a>' : ''}
        <button type="button" data-logout>Se déconnecter</button>`;
      const logout = async () => {
        await fetch('/api/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => {});
        location.reload();
      };
      navSlot.querySelector('[data-logout]').onclick = logout;
      const button = slot.querySelector('.site-account-btn');
      const menu = slot.querySelector('.site-account-menu');
      const setOpen = open => { menu.hidden = !open; button.setAttribute('aria-expanded', String(open)); };
      button.onclick = event => { event.stopPropagation(); setOpen(menu.hidden); };
      document.addEventListener('click', event => { if (!slot.contains(event.target)) setOpen(false); });
      document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) { setOpen(false); button.focus(); } });
      menu.querySelector('[data-logout]').onclick = logout;
    })
    .catch(() => {});
}
