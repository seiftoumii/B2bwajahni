const wajahniPages = [
  { key: 'home', label: 'Accueil', href: 'home' },
  { key: 'caravan', label: 'WAJAHNI Caravan', href: 'caravan' },
  { key: 'educareer', label: 'WAJAHNI Edu-Career Summit', href: 'educareer' },
  { key: 'roadshow', label: 'WAJAHNI Roadshow', href: 'roadshow' },
  { key: 'platform', label: 'WAJAHNI Platform', href: 'platform' },
  { key: '360', label: 'WAJAHNI 360°', href: 'wajahni360' }
];

(() => {
  const header = document.querySelector('.site-header');
  const home = wajahniPages[0].href;
  const current = location.pathname.split('/').pop().replace(/\.html$/, '');
  const page = wajahniPages.find(item => item.key === document.body.dataset.page || item.href === current) || wajahniPages[0];
  header.innerHTML = `
    <a class="site-logo" href="${home}#top" aria-label="Accueil Wajahni"><img src="assets/home/n265-14033.png" alt="Wajahni"></a>
    <button type="button" aria-expanded="false" aria-controls="site-links">Menu ☰</button>
    <nav id="site-links" aria-label="Navigation principale">
      ${wajahniPages.map(item => `<a href="${item.href}#top" ${item === page ? 'aria-current="page"' : ''}>${item.label}</a>`).join('')}
    </nav>
    <a class="site-contact" href="${home}#contact">Contactez-nous ↗</a>`;
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
  matchMedia('(max-width: 1050px)').addEventListener('change', () => setOpen(false));
  window.addEventListener('pageshow', () => setOpen(false));
})();
