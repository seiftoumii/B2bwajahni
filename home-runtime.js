(() => {
  const width = 1440;
  const height = 8450;
  const viewport = document.querySelector('#home-viewport');
  const canvas = document.querySelector('#home-canvas');
  const updateScale = () => {
    const scale = window.innerWidth / width;
    document.documentElement.style.setProperty('--canvas-scale', String(scale));
    viewport.style.width = `${width * scale}px`;
    viewport.style.height = `${height * scale}px`;
  };
  const hydrate = () => {
    if (!canvas.firstElementChild) return window.setTimeout(hydrate, 50);
    updateScale();
    window.addEventListener('resize', updateScale, { passive: true });

    const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }), { threshold: .08 });
    canvas.querySelectorAll('p').forEach((node, index) => {
      node.classList.add('home-reveal');
      node.style.setProperty('--reveal-delay', `${(index % 8) * 36}ms`);
      revealObserver.observe(node);
    });

    // A shared crossfade for the large Figma panels makes every section handoff
    // feel intentional without changing the export's pixel-accurate geometry.
    const panelObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      panelObserver.unobserve(entry.target);
    }), { threshold: .12 });
    ['265:13994', '265:14043', '268:14045', '269:14046', '270:14068', '273:14157'].forEach((id) => {
      const panel = canvas.querySelector(`[data-node-id="${id}"]`);
      if (!panel) return;
      panel.classList.add('home-panel');
      panelObserver.observe(panel);
    });

    const metrics = canvas.querySelector('[data-home-section="metrics"]');
    const metricsObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      metrics.classList.add('home-metrics-visible');
      metricsObserver.unobserve(entry.target);
    }), { threshold: .35 });
    if (metrics) metricsObserver.observe(metrics);

    const logoGrid = canvas.querySelector('[data-home-logo-grid]');
    if (logoGrid) {
      const tunisianLogos = Array.from({ length: 55 }, (_, index) => `assets/Tunisie/${index + 1}.png`);
      const internationalLogos = Array.from({ length: 31 }, (_, index) => `assets/International/${index + 1}.png`);
      const visibleLogos = [];
      const maxLogos = Math.max(tunisianLogos.length, internationalLogos.length);
      for (let index = 0; index < maxLogos; index += 1) {
        if (tunisianLogos[index]) visibleLogos.push(tunisianLogos[index]);
        if (internationalLogos[index]) visibleLogos.push(internationalLogos[index]);
      }
      visibleLogos.forEach((source, index) => {
        const slot = document.createElement('div');
        slot.className = 'home-logo-slot';
        slot.style.setProperty('--logo-delay', `${(index % 11) * 42 + Math.floor(index / 11) * 55}ms`);
        const logo = new Image();
        logo.alt = 'Logo partenaire Wajahni';
        logo.src = source;
        logo.addEventListener('load', () => slot.classList.add('is-loaded'), { once: true });
        slot.append(logo);
        logoGrid.append(slot);
      });
      const logoObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        logoGrid.querySelectorAll('.home-logo-slot').forEach((slot) => slot.classList.add('is-visible'));
        logoObserver.unobserve(entry.target);
      }), { threshold: .2 });
      logoObserver.observe(logoGrid);
    }

    // Establish breathing room between the large image chapters. We only offset
    // top-level Figma layers, keeping each panel's internal artwork intact.
    const root = canvas.querySelector('[data-node-id="262:13991"]');
    root?.querySelectorAll('[data-node-id]').forEach((node) => {
      const parent = node.parentElement;
      const top = Number.parseFloat(getComputedStyle(node).top);
      if (!Number.isFinite(top) || top < 2160 || getComputedStyle(node).position !== 'absolute') return;
      if (parent !== root && getComputedStyle(parent).display !== 'contents') return;
      const offset = top >= 4230 ? 520 : 120;
      node.style.setProperty('--page-offset', `${offset}px`);
      node.classList.add('home-spaced');
    });

    canvas.querySelectorAll('[data-node-id]').forEach((node) => {
      const className = typeof node.className === 'string' ? node.className : '';
      if (className.includes('rounded-') && className.includes('shadow-')) node.classList.add('home-card');
    });

    const link = (id, href) => {
      const node = canvas.querySelector(`[data-node-id="${id}"]`);
      if (!node) return;
      node.classList.add('home-action', 'home-link');
      node.setAttribute('role', 'link');
      node.setAttribute('tabindex', '0');
      const navigate = () => { window.location.href = href; };
      node.addEventListener('click', (event) => { event.preventDefault(); navigate(); });
      node.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); navigate(); }
      });
    };
    link('265:14033', 'home.html#top');
    link('265:14023', 'index.html#top');
    link('265:14027', 'roadshow.html#top');
    link('265:14029', 'platform.html#top');
    link('265:14031', 'wajahni360.html#top');
    canvas.querySelector('[data-node-id="265:14025"] a')?.setAttribute('href', 'educareer.html');
    canvas.querySelector('[data-node-id="265:14025"] a')?.removeAttribute('target');
    canvas.querySelector('[data-node-id="265:14029"] a')?.setAttribute('href', 'platform.html#top');
    canvas.querySelector('[data-node-id="265:14029"] a')?.removeAttribute('target');
    link('273:14192', 'educareer.html#top');
    link('273:14202', 'roadshow.html#top');
    link('273:14212', 'index.html#top');
    link('273:14222', 'platform.html#top');
    link('273:14232', 'wajahni360.html#top');
    link('273:14242', 'home.html#contact');
    canvas.querySelector('[data-node-id="265:14016"]')?.addEventListener('click', () => { window.location.href = 'home.html#contact'; });
    canvas.querySelector('[data-node-id="265:14037"]')?.addEventListener('click', () => canvas.querySelector('[data-node-id="268:14045"]')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  window.addEventListener('load', hydrate, { once: true });
})();
