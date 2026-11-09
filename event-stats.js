// Shared "4 Années d'impact" stats section for the three event pages
// (Caravan, Edu-Career Summit, Roadshow). Same markup and styles
// (event-stats.css) everywhere; only the numbers below differ per page.
//
// One tab switch (2025 | 2026) sits in a fixed slot; both year panels are
// stacked in the same place, so switching never moves the tabs or the page.
(() => {
  const ICON = (name) => `assets/stats-icons/icon-${name}.png`;
  const YEARS = {
    2025: { accent: '#f96b28', header: 'assets/stats-2025-header.png' },
    2026: { accent: '#02aad3', header: 'assets/stats-2026-header.png' }
  };
  const PERCENT_LABELS = [
    'À la recherche d’une licence',
    'À la recherche d’une formation linguistique',
    'À la recherche d’une formation professionnelle',
    'À la recherche d’un master',
    'À la recherche d’une opportunité à l’étranger',
    'Est accompagné de leurs parents'
  ];
  const KEY_LABELS = {
    inscriptions: ['inscriptions', 'Inscriptions'],
    portee: ['portee-rs', 'Portée sur les R.S'],
    conferences: ['conferences', 'Conférences'],
    workshops: ['workshops', 'Workshops'],
    massMedias: ['mass-medias', 'Mass Médias'],
    influenceurs: ['influenceurs', 'Influenceurs']
  };

  const PAGES = {
    caravan: {
      event: 'WAJAHNI Caravan',
      years: {
        2025: { place: ['Tunis - Sfax - Sousse'], keys: { inscriptions: '22K', portee: '4.0M', conferences: '122', workshops: '44', massMedias: '10', influenceurs: '22' }, percents: ['71%', '68%', '49%', '24%', '68%', '33%'], stands: '152', age: '95%' },
        2026: { place: ['Sfax - Tunis - Sousse'], keys: { inscriptions: '26K', portee: '15.7M', conferences: '140', workshops: '60', massMedias: '10', influenceurs: '22' }, percents: ['81%', '69%', '60%', '19%', '78%', '32%'], stands: '155', age: '95%' }
      }
    },
    educareer: {
      event: 'WAJAHNI Edu-Career Summit',
      note: 'Édition de 2 jours avec espace de job fair',
      years: {
        2025: { place: ['Tunis : Cité de la culture'], keys: { inscriptions: '5K', portee: '2.6M', conferences: '24', workshops: '32', massMedias: '10', influenceurs: '12' }, percents: ['49%', '67%', '41%', '51%', '70%', '35%'], stands: '99', age: '85%' },
        2026: { place: ['Tunis : Palais des congrès'], keys: { inscriptions: '5K', portee: '2.6M', conferences: '28', workshops: '34', massMedias: '10', influenceurs: '12' }, percents: ['45%', '70%', '50%', '52%', '85%', '37%'], stands: '60', age: '88%' }
      }
    },
    roadshow: {
      event: 'WAJAHNI Roadshow',
      years: {
        2025: { place: ['Bizerte - Nabeul - Kairouan', 'Mahdia - Gafsa - Gabes'], keys: { inscriptions: '5K', portee: '4.0M', workshops: '51' }, percents: ['70%', '70%', '40%', '15%', '85%', '18%'], stands: '72', age: '98%' },
        2026: { place: ['Bizerte - Nabeul - Jendouba', 'Kairouan - Mahdia - Monastir', 'Gafsa - Gabes - Medenine'], keys: { inscriptions: '6K', portee: '8M', workshops: '78' }, percents: ['72%', '77%', '45%', '12%', '88%', '20%'], stands: '117', age: '95%' }
      }
    }
  };
  const TABS = ['2025', '2026'];
  const DEFAULT_TAB = '2026';

  const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c]));
  const num = (value) => `<span class="event-stats__num" data-count="${esc(value)}">${esc(value)}</span>`;

  function renderCard(page, year) {
    const data = page.years[year];
    const look = YEARS[year];
    const keys = Object.entries(data.keys).map(([key, value]) => {
      const [icon, label] = KEY_LABELS[key];
      return `<li class="event-stats__chip"><img alt="" src="${ICON(icon)}"><span><strong>${num(value)}</strong><small>${esc(label)}</small></span></li>`;
    }).join('');
    const percents = data.percents.map((value, i) => `<li class="event-stats__chip event-stats__chip--percent"><strong>${num(value)}</strong><small>${esc(PERCENT_LABELS[i])}</small></li>`).join('');
    return `<article class="event-stats__card" style="--accent:${look.accent}">
      <header class="event-stats__head" style="background-image:url('${look.header}')">
        <span class="event-stats__year">${year}</span>
        <span class="event-stats__where"><span>${esc(page.event)}</span>${data.place.map((line) => `<span>${esc(line)}</span>`).join('')}</span>
        ${page.note ? `<span class="event-stats__note">${esc(page.note)}</span>` : ''}
      </header>
      <div class="event-stats__body">
        <h3 class="event-stats__label"><img alt="" src="${ICON('key')}">CHIFFRES CLÉS</h3>
        <ul class="event-stats__grid">${keys}</ul>
        <h3 class="event-stats__label"><img alt="" src="${ICON('percent')}">STATISTIQUES DES VISITEURS</h3>
        <ul class="event-stats__grid">${percents}</ul>
        <div class="event-stats__stands">
          <img alt="" src="${ICON('stands')}">
          <span class="event-stats__stands-count"><strong>${num(data.stands)}</strong><small>Stands</small></span>
          <span class="event-stats__stands-age"><strong>${num(data.age)}</strong><small>Âgés entre 16 et 21 ans<br>(à l’exception des parents)</small></span>
        </div>
      </div>
    </article>`;
  }

  // Count numbers up from zero the first time a year panel is seen.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function countUp(panel) {
    if (reduceMotion || panel.dataset.counted) return;
    panel.dataset.counted = 'true';
    panel.querySelectorAll('[data-count]').forEach((node) => {
      const match = node.dataset.count.match(/^(\d+(?:\.\d+)?)(.*)$/);
      if (!match) return;
      const target = Number.parseFloat(match[1]);
      const decimals = (match[1].split('.')[1] || '').length;
      const started = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - started) / 1200, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        node.textContent = progress < 1 ? `${(target * eased).toFixed(decimals)}${match[2]}` : node.dataset.count;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  // options: { page: 'caravan' | 'educareer' | 'roadshow', parent, top, height }
  function mount({ page: pageName, parent, top, height }) {
    const page = PAGES[pageName];
    if (!page || !parent) return null;
    document.querySelector('#stats')?.remove();
    const uid = `event-stats-${pageName}`;
    const section = document.createElement('section');
    section.id = 'stats';
    section.className = 'event-stats';
    section.style.top = `${top}px`;
    section.style.height = `${height}px`;
    section.setAttribute('aria-labelledby', `${uid}-title`);
    section.innerHTML = `
      <span class="event-stats__eyebrow">${esc(page.event)}</span>
      <h2 class="event-stats__title" id="${uid}-title">4 Années d’impact,<br><span>des opportunités infinies</span></h2>
      <div class="event-stats__tabs" role="tablist" aria-label="Année">
        ${TABS.map((year) => `<button class="event-stats__tab" type="button" role="tab" id="${uid}-tab-${year}" aria-controls="${uid}-panel-${year}" data-stats-year="${year}">${year}</button>`).join('')}
      </div>
      ${TABS.map((year) => `<div class="event-stats__panel" role="tabpanel" id="${uid}-panel-${year}" aria-labelledby="${uid}-tab-${year}" data-stats-panel="${year}">${renderCard(page, year)}</div>`).join('')}`;
    parent.append(section);

    const tabs = [...section.querySelectorAll('[data-stats-year]')];
    const panels = [...section.querySelectorAll('[data-stats-panel]')];
    let seen = false;
    const select = (year, focus = false) => {
      tabs.forEach((tab) => {
        const active = tab.dataset.statsYear === year;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        if (active && focus) tab.focus();
      });
      panels.forEach((panel) => {
        const active = panel.dataset.statsPanel === year;
        panel.classList.toggle('is-active', active);
        panel.toggleAttribute('inert', !active);
        panel.setAttribute('aria-hidden', String(!active));
        if (active && seen) countUp(panel);
      });
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab.dataset.statsYear));
      tab.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        select(tabs[(index + 1) % tabs.length].dataset.statsYear, true);
      });
    });
    select(DEFAULT_TAB);
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      seen = true;
      observer.disconnect();
      countUp(section.querySelector('.event-stats__panel.is-active'));
    }), { threshold: .25 });
    observer.observe(section);
    return section;
  }

  window.WajahniStats = { mount };
})();
