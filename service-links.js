(() => {
  const destinations = wajahniPages.filter(page => page.key !== "home");

  const style = document.createElement('style');
  style.textContent = `
    .service-link { cursor: pointer; transition: transform 280ms cubic-bezier(.22,1,.36,1), box-shadow 280ms ease; }
    .service-link:hover, .service-link:focus-visible { z-index: 9; transform: translateY(-7px) scale(1.02); box-shadow: 0 20px 38px rgba(13,42,82,.18); }
    .service-link:focus-visible { outline: 3px solid #f4671f; outline-offset: 4px; }
    .service-link:active { transform: translateY(-3px) scale(1.01); }
    .service-more { cursor: pointer; }
  `;
  document.head.append(style);

  const go = (href) => { window.location.href = href; };
  const bind = (el, href, label) => {
    el.classList.add('service-link');
    el.setAttribute('role', 'link');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', label);
    el.addEventListener('click', () => go(href));
    el.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); go(href); }
    });
  };

  function findCards() {
    const candidates = [...document.querySelectorAll('[class*="bg-[#fbfbfd]"][class*="overflow-clip"][class*="shadow-["]')];
    const group = candidates.find((el) => candidates.filter((other) => other.parentElement === el.parentElement).length === 5);
    return group ? candidates.filter((el) => el.parentElement === group.parentElement) : [];
  }

  function enhance(tries = 0) {
    const cards = findCards();
    if (cards.length !== 5) {
      if (tries < 80) window.setTimeout(() => enhance(tries + 1), 150);
      return;
    }
    const here = window.location.pathname.split('/').pop() || 'index.html';
    cards.forEach((card) => {
      const text = card.textContent;
      const target = destinations.find((item) => text.toLowerCase().includes(item.label.replace('WAJAHNI ', '').toLowerCase()));
      if (target) bind(card, target.href + "#top", target.label);
    });

    const section = cards[0].closest('[data-node-id]') || cards[0].parentElement;
    const more = [...document.querySelectorAll('p')].find((p) => /en savoir plus sur nos services/i.test(p.textContent));
    const button = more && (more.closest('[class*="bg-gradient-to-r"]') || more.parentElement);
    if (button) {
      button.classList.add('service-more');
      button.setAttribute('role', 'link');
      button.setAttribute('tabindex', '0');
      const open = () => {
        if (here === 'home' || here === 'home.html') cards[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        else go(wajahniPages[0].href + '#services');
      };
      button.addEventListener('click', open);
      button.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); open(); }
      });
    }
    void section;
  }

  window.addEventListener('load', () => enhance());
})();
