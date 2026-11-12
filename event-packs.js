// Shared "Sélectionnez votre investissement" section for the three event pages
// (Caravan, Edu-Career Summit, Roadshow). Every page renders the same markup and
// styles (event-packs.css); only the packs data below differs.
//
// Both tab panels are rendered once and stacked in the same place, so switching
// between PARTNER and EXPOSANT never moves the tabs, the cards or the page below.
(() => {
  const ICONS = ['assets/car/n210-3556.svg', 'assets/car/n210-3664.svg', 'assets/car/n210-3772.svg', 'assets/car/n210-3882.svg'];
  const TIERS = [
    { name: 'IRON', tone: 'iron', area: 4 },
    { name: 'BRONZE', tone: 'bronze', area: 6 },
    { name: 'SILVER', tone: 'silver', area: 8, recommended: true },
    { name: 'GOLD', tone: 'gold', area: 12 }
  ];

  const PAGES = {
    caravan: {
      art: { left: 'assets/car/n210-3441.png', corner: 'assets/car/n210-3444.svg', arrow: 'assets/car/n210-5007.svg' },
      features: [
        'Stand personnalisé',
        'Insertion du logo de votre institution à la fin de l’after movie',
        'Promotion de votre institution sur nos réseaux sociaux',
        'Insertion de votre logo dans la bannière de la page d’inscription de l’événement',
        'Insertion de votre logo sur les affiches urbaines',
        'Animation d’un atelier',
        'Intégration de votre logo sur le mur de presse',
        'Intégration de votre logo dans la vidéo promotionnelle',
        'Partage de la base de données',
        'Interview exclusive pour votre institution qui sera partagée sur nos réseaux sociaux',
        'Diffusion d’une vidéo (1 min Max) entre les discours des conférenciers',
        'Intervention lors de la conférence (10 min)'
      ],
      labels: ['TUNIS', 'SFAX OU SOUSSE', 'CARAVAN (3 RÉGIONS)'],
      enabled: [4, 6, 9, 12],
      exhibitor: [['5 500', '4 900', '14 900'], ['6 600', '5 900', '17 900'], ['7 700', '6 900', '20 900'], ['8 800', '7 900', '23 900']],
      partner: [['4 900', '4 400', '13 500'], ['5 900', '5 500', '16 500'], ['6 900', '6 600', '19 500'], ['7 900', '7 700', '22 500']]
    },
    educareer: {
      art: { left: 'assets/edu/n237-8287.png', corner: 'assets/edu/n237-8289.svg', arrow: 'assets/edu/n237-8855.svg' },
      features: [
        'Stand personnalisé',
        'Insertion du logo de votre institution à la fin de l’after movie',
        'Promotion de votre institution sur nos réseaux sociaux',
        'Insertion de votre logo dans la bannière de la page d’inscription de l’événement',
        'Insertion de votre logo sur les affiches urbaines',
        'Animation d’un atelier',
        'Intégration de votre logo sur le mur de presse',
        'Intégration de votre logo dans la vidéo promotionnelle',
        'Partage de la base de données',
        'Interview exclusive pour votre institution qui sera partagée sur nos réseaux sociaux',
        'Diffusion d’une vidéo (1 min Max) entre les discours des conférenciers',
        'Intervention lors de la conférence (10 min)'
      ],
      labels: [''],
      enabled: [4, 6, 9, 12],
      exhibitor: [['4 900'], ['5 500'], ['5 900'], ['6 500']],
      partner: [['4 500'], ['5 000'], ['5 500'], ['6 000']]
    },
    roadshow: {
      art: { left: 'assets/rs/n247-11438.png', corner: 'assets/rs/n247-11440.svg', arrow: 'assets/rs/n247-12029.svg' },
      features: [
        'Stand personnalisé',
        'Insertion du logo de votre institution à la fin de l’after movie',
        'Promotion de votre institution sur nos réseaux sociaux',
        'Intégration de votre logo sur le mur de presse',
        'Insertion de votre logo dans la bannière de la page d’inscription de l’événement',
        'Animation d’un atelier',
        'Partage de la base de données'
      ],
      labels: ['VILLE', 'SECTEUR', 'ROADSHOW (9 VILLES)'],
      enabled: [4, 6, 7],
      exhibitor: [['4 500', '12 900', '37 900'], ['5 000', '13 900', '39 900'], ['5 500', '14 900', '41 900']],
      partner: [['4 000', '11 900', '34 900'], ['4 500', '12 900', '37 900'], ['4 900', '13 900', '39 900']]
    }
  };

  const TABS = [
    { id: 'partner', label: 'PARTNER' },
    { id: 'exhibitor', label: 'EXPOSANT' }
  ];

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));

  function renderCard(page, prices, index) {
    const tier = TIERS[index];
    const rows = page.labels.map((label, i) => `<div class="event-pack__price"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(prices[i])} DT HT</dd></div>`).join('');
    const features = page.features.map((feature, i) => {
      const included = i < page.enabled[index];
      return `<li class="${included ? 'is-included' : 'is-unavailable'}"><span class="visually-hidden">${included ? 'Inclus : ' : 'Non inclus : '}</span>${escapeHtml(feature)}</li>`;
    }).join('');
    return `<article class="event-pack event-pack--${tier.tone}">
      <header class="event-pack__head">
        <div class="event-pack__icon"><img alt="" src="${ICONS[index]}"><span class="event-pack__area">${tier.area}m<sup>2</sup></span></div>
        <h3 class="event-pack__name">${tier.name}</h3>
        ${tier.recommended ? '<span class="event-pack__badge">RECOMMANDÉ</span>' : ''}
      </header>
      <dl class="event-pack__prices">${rows}</dl>
      <ul class="event-pack__features">${features}</ul>
    </article>`;
  }

  // options: { page: 'caravan' | 'educareer' | 'roadshow', parent, top, height }
  function mount({ page: pageName, parent, top, height }) {
    const page = PAGES[pageName];
    if (!page || !parent) return null;
    document.querySelector('#packs')?.remove();
    const uid = `event-packs-${pageName}`;
    const section = document.createElement('section');
    section.id = 'packs';
    section.className = 'event-packs';
    section.style.top = `${top}px`;
    section.style.height = `${height}px`;
    section.style.setProperty('--event-pack-columns', String(page.exhibitor.length));
    section.setAttribute('aria-labelledby', `${uid}-title`);
    section.innerHTML = `
      <img class="event-packs__left-art" alt="" src="${page.art.left}">
      <span class="event-packs__arrow" aria-hidden="true"><img alt="" src="${page.art.arrow}"></span>
      <img class="event-packs__corner-art" alt="" src="${page.art.corner}">
      <h2 class="event-packs__title" id="${uid}-title">Sélectionnez votre <span>investissement</span></h2>
      <div class="event-packs__tabs" role="tablist" aria-label="Type d’investissement">
        ${TABS.map((tab) => `<button class="event-packs__tab" type="button" role="tab" id="${uid}-tab-${tab.id}" aria-controls="${uid}-panel-${tab.id}" data-pack-tab="${tab.id}">${tab.label}</button>`).join('')}
      </div>
      ${TABS.map((tab) => `<div class="event-packs__panel" role="tabpanel" id="${uid}-panel-${tab.id}" aria-labelledby="${uid}-tab-${tab.id}" data-pack-panel="${tab.id}">${page[tab.id].map((prices, i) => renderCard(page, prices, i)).join('')}</div>`).join('')}`;
    parent.append(section);

    const tabs = [...section.querySelectorAll('[data-pack-tab]')];
    const panels = [...section.querySelectorAll('[data-pack-panel]')];

    // Give every card on both tabs the height of the tallest one, so the two
    // tabs show identical card frames and nothing resizes when switching.
    const equalise = () => {
      section.style.removeProperty('--event-pack-height');
      const tallest = Math.max(...[...section.querySelectorAll('.event-pack')].map((card) => card.offsetHeight));
      if (tallest > 0) section.style.setProperty('--event-pack-height', `${tallest}px`);
    };

    const select = (id, focus = false) => {
      tabs.forEach((tab) => {
        const active = tab.dataset.packTab === id;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        if (active && focus) tab.focus();
      });
      panels.forEach((panel) => {
        const active = panel.dataset.packPanel === id;
        panel.classList.toggle('is-active', active);
        panel.toggleAttribute('inert', !active);
        panel.setAttribute('aria-hidden', String(!active));
      });
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab.dataset.packTab));
      tab.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const next = tabs[(index + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        select(next.dataset.packTab, true);
      });
    });
    select('exhibitor');
    equalise();
    document.fonts?.ready.then(equalise);
    return section;
  }

  // Scroll to the packs with the section title just under the floating
  // navbar (scrollIntoView put the title behind the navbar).
  function scrollToPacks() {
    const section = document.querySelector('#packs');
    if (!section) return;
    const header = document.querySelector('.site-header');
    const offset = header ? header.getBoundingClientRect().bottom + 12 : 0;
    // When the packs fill exactly one screen (event-fit.js), show that screen.
    const screenTop = window.WajahniFit?.screenTop(section);
    const top = screenTop ?? section.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  window.WajahniPacks = { mount, scrollToPacks };
})();
