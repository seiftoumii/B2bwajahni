(() => {
  const width = 1440;
  const height = 5513;
  const viewport = document.querySelector('#figma-viewport');
  const canvas = document.querySelector('#figma-canvas');
  const dialog = document.querySelector('#contact-dialog');
  const toast = document.querySelector('.figma-toast');

  function updateScale() {
    const scale = window.innerWidth / width;
    document.documentElement.style.setProperty('--canvas-scale', String(scale));
    viewport.style.width = `${width * scale}px`;
    fitServiceArtboard(viewport, scale, height, 1018, 1018);
  }

  function toastMessage(message) {
    toast.textContent = message;
    toast.classList.add('is-visible');
    window.clearTimeout(toastMessage.timeout);
    toastMessage.timeout = window.setTimeout(() => toast.classList.remove('is-visible'), 3400);
  }

  function scrollToNode(nodeId) {
    const target = canvas.querySelector(`[data-node-id="${nodeId}"]`);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function addHotspot(className, label, action) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `figma-hotspot ${className}`;
    button.setAttribute('aria-label', label);
    button.addEventListener('click', action);
    (className === 'figma-hotspot--hero' ? canvas.querySelector('.fitted-artboard') : canvas).append(button);
  }

  function hydrate() {
    if (!canvas.firstElementChild) { window.setTimeout(hydrate, 50); return; }
    updateScale();
    window.addEventListener('resize', updateScale, { passive: true });

    addHotspot('figma-hotspot--hero', 'Découvrir les packs Wajahni', () => scrollToNode('210:3440'));
    ['Tunis', 'Sfax', 'Sousse'].forEach((city, index) => addHotspot('figma-hotspot--aftermovie', `Voir l’after-movie Wajahni Caravan ${city}`, () => toastMessage(`L’after-movie ${city} sera bientôt disponible.`)));

    const cardSelectors = [
      '[data-node-id="201:2032"]', '[data-node-id="201:2193"]', '[data-node-id="201:2146"]',
      '[data-node-id="210:3417"]', '[data-node-id="210:3418"]', '[data-node-id="210:3420"]',
      '[data-node-id="210:3469"] > [data-name="Background+Shadow"]',
      '[data-node-id="210:3937"] > [data-name="Background+Shadow"]',
      '[data-node-id="210:5070"]', '[data-node-id="210:5080"]', '[data-node-id="210:5090"]', '[data-node-id="210:5100"]', '[data-node-id="210:5110"]',
      '[data-node-id="215:5193"]', '[data-node-id="215:5248"]',
    ];
    canvas.querySelectorAll(cardSelectors.join(',')).forEach((card) => card.classList.add('interactive-card'));

    const conceptCards = [
      '[data-node-id="210:2485"]', '[data-node-id="210:2493"]',
      '[data-node-id="210:2503"]', '[data-node-id="210:2507"]',
    ].map((selector) => canvas.querySelector(selector)).filter(Boolean);
    conceptCards.forEach((card) => {
      card.classList.add('concept-card');
    });

    const textObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      textObserver.unobserve(entry.target);
    }), { threshold: .1 });
    canvas.querySelectorAll('p').forEach((text, index) => {
      text.classList.add('text-reveal');
      text.style.setProperty('--text-delay', `${(index % 7) * 35}ms`);
      textObserver.observe(text);
    });

    function counterDetails(text) {
      const match = text.match(/^(\+?)(\d[\d\s]*)(K)?(\s*DT HT|m)?$/);
      if (!match) return null;
      const value = Number(match[2].replace(/\s/g, ''));
      if (!Number.isFinite(value)) return null;
      return { prefix: match[1], value, compact: Boolean(match[3]), suffix: match[4] || '' };
    }
    function animateCount(element, details) {
      const duration = Math.min(2600, Math.max(1450, details.value > 1000 ? 2200 : 1700));
      const start = performance.now();
      const formatter = new Intl.NumberFormat('fr-FR');
      const frame = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(details.value * eased);
        const digits = details.compact ? String(current) : formatter.format(current);
        element.textContent = `${details.prefix}${digits}${details.compact ? 'K' : ''}${details.suffix}`;
        if (progress < 1) window.requestAnimationFrame(frame);
      };
      window.requestAnimationFrame(frame);
    }
    const counterObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const details = counterDetails(entry.target.dataset.countTarget);
      if (details) animateCount(entry.target, details);
      counterObserver.unobserve(entry.target);
    }), { threshold: .45 });
    canvas.querySelectorAll('p').forEach((text) => {
      const value = text.textContent.trim();
      if (value === '2027') return;
      if (!counterDetails(value)) return;
      text.dataset.countTarget = value;
      text.textContent = text.dataset.countTarget.includes('K') ? '+0K' : `0${text.dataset.countTarget.includes('DT HT') ? ' DT HT' : text.dataset.countTarget.endsWith('m') ? 'm' : ''}`;
      text.classList.add('count-up');
      counterObserver.observe(text);
    });

    function statCounterDetails(value) {
      const match = value.match(/^(\d+(?:\.\d+)?)([KM%])?$/);
      if (!match) return null;
      const numeric = Number(match[1]);
      if (!Number.isFinite(numeric)) return null;
      return { value: numeric, suffix: match[2] || '', decimals: (match[1].split('.')[1] || '').length };
    }
    function animateStatCount(element, details) {
      const duration = 1650;
      const start = performance.now();
      const frame = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = details.value * eased;
        const numeric = details.decimals ? current.toFixed(details.decimals) : String(Math.round(current));
        element.textContent = `${numeric}${details.suffix}`;
        if (progress < 1) window.requestAnimationFrame(frame);
      };
      window.requestAnimationFrame(frame);
    }
    const statsCounterObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.target.dataset.statsCounted === 'true') return;
      const details = statCounterDetails(entry.target.dataset.statsTarget || '');
      if (details) {
        entry.target.dataset.statsCounted = 'true';
        animateStatCount(entry.target, details);
      }
      statsCounterObserver.unobserve(entry.target);
    }), { threshold: .45 });
    canvas.querySelectorAll('.stats-count').forEach((stat) => {
      const value = stat.textContent.trim();
      if (!statCounterDetails(value)) return;
      stat.dataset.statsTarget = value;
      stat.textContent = `0${value.endsWith('%') ? '%' : value.endsWith('K') ? 'K' : value.endsWith('M') ? 'M' : ''}`;
      statsCounterObserver.observe(stat);
    });

    const investmentSections = canvas.querySelectorAll('[data-investment-section]');
    let investmentSwitching = false;
    function selectInvestment(tab) {
      const next = canvas.querySelector(`[data-investment-section="${tab}"]`);
      const current = [...investmentSections].find((section) => !section.classList.contains('is-hidden'));
      if (investmentSwitching || !next || current === next) return;
      investmentSwitching = true;
      current.classList.remove('is-entering');
      current.classList.add('is-leaving');
      canvas.querySelectorAll('[data-investment-tab]').forEach((control) => {
        control.setAttribute('aria-pressed', String(control.dataset.investmentTab === tab));
      });
      window.setTimeout(() => {
        current.classList.add('is-hidden');
        current.classList.remove('is-leaving');
        current.setAttribute('aria-hidden', 'true');
        next.classList.remove('is-hidden');
        next.setAttribute('aria-hidden', 'false');
        next.classList.remove('is-entering');
        window.requestAnimationFrame(() => next.classList.add('is-entering'));
        investmentSwitching = false;
      }, 150);
    }
    const statsSections = canvas.querySelectorAll('[data-stats-section]');
    let statsSwitching = false;
    function selectStats(tab) {
      const next = canvas.querySelector(`[data-stats-section="${tab}"]`);
      const current = [...statsSections].find((section) => !section.classList.contains('is-hidden'));
      if (statsSwitching || !next || current === next) return;
      statsSwitching = true;
      current.classList.remove('is-entering');
      current.classList.add('is-leaving');
      canvas.querySelectorAll('[data-stats-tab]').forEach((control) => {
        control.setAttribute('aria-pressed', String(control.dataset.statsTab === tab));
      });
      window.setTimeout(() => {
        current.classList.add('is-hidden');
        current.classList.remove('is-leaving');
        current.setAttribute('aria-hidden', 'true');
        next.classList.remove('is-hidden');
        next.setAttribute('aria-hidden', 'false');
        next.classList.remove('is-entering');
        window.requestAnimationFrame(() => next.classList.add('is-entering'));
        statsSwitching = false;
      }, 150);
    }
    canvas.querySelectorAll('[data-stats-tab]').forEach((control) => {
      const choose = () => selectStats(control.dataset.statsTab);
      control.addEventListener('click', choose);
      control.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(); }
      });
    });

    canvas.querySelectorAll('[data-investment-tab]').forEach((control) => {
      const choose = () => selectInvestment(control.dataset.investmentTab);
      control.addEventListener('click', choose);
      control.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(); }
      });
    });
    investmentSections.forEach((section) => section.setAttribute('aria-hidden', String(section.classList.contains('is-hidden'))));
    canvas.querySelectorAll('[data-investment-tab]').forEach((control) => {
      control.setAttribute('aria-pressed', String(control.dataset.investmentTab === 'exposant'));
    });

    ['201:1321', '201:1374', '210:3462', '215:5178'].forEach((id) => {
      const element = canvas.querySelector(`[data-node-id="${id}"]`);
      if (element) element.classList.add('figma-fade');
    });
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: .08 });
    canvas.querySelectorAll('.figma-fade').forEach((element) => observer.observe(element));
  }

  document.querySelector('.figma-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = form.get('name');
    const email = form.get('email');
    const message = form.get('message');
    const subject = encodeURIComponent(`Demande Wajahni Caravan — ${name}`);
    const body = encodeURIComponent(`Nom : ${name}\nEmail : ${email}\n\nMessage :\n${message}`);
    dialog.close();
    window.location.href = `mailto:rayen.mohsni@wajahni.tn?subject=${subject}&body=${body}`;
    toastMessage('Votre application e-mail s’ouvre avec votre demande préremplie.');
  });
  window.addEventListener('load', hydrate, { once: true });
})();
