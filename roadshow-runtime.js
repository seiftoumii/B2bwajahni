(() => {
  const width = 1440;
  const height = 6460;
  const viewport = document.querySelector('#figma-viewport');
  const canvas = document.querySelector('#figma-canvas');
  const updateScale = () => {
    const scale = window.innerWidth / width;
    document.documentElement.style.setProperty('--canvas-scale', String(scale));
    viewport.style.width = `${width * scale}px`;
    fitServiceArtboard(viewport, scale, height, 1018, 1018);
  };
  const hydrate = () => {
    if (!canvas.firstElementChild) return window.setTimeout(hydrate, 50);
    updateScale();
    window.addEventListener('resize', updateScale, { passive: true });
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible'); observer.unobserve(entry.target);
    }), { threshold: .08 });
    canvas.querySelectorAll('p').forEach((node, index) => {
      node.classList.add('roadshow-reveal');
      node.style.setProperty('--reveal-delay', `${(index % 8) * 38}ms`);
      observer.observe(node);
    });
    const cardNodes = ['247:11385', '247:11386', '247:11465', '247:11648', '247:11785', '247:11922', '247:12059', '247:12196'];
    cardNodes.forEach((id) => canvas.querySelector(`[data-node-id="${id}"]`)?.classList.add('roadshow-card'));
    // Figma cards retain rounded corners and a shadow in the exported markup.
    // Add the shared, non-layout-breaking hover treatment to every such card.
    canvas.querySelectorAll('[data-node-id]').forEach((node) => {
      const className = typeof node.className === 'string' ? node.className : '';
      if (className.includes('rounded-') && className.includes('shadow-')) {
        node.classList.add('roadshow-card');
      }
    });

    const counterObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.target.dataset.counted) return;
      entry.target.dataset.counted = 'true';
      const node = entry.target;
      const source = node.dataset.counterSource;
      const match = source?.match(/^\s*(\d+(?:[.,]\d+)?)\s*([KM%]?)\s*$/);
      if (!match) return;
      const target = Number.parseFloat(match[1].replace(',', '.'));
      const suffix = match[2];
      const decimals = match[1].includes('.') || match[1].includes(',') ? 1 : 0;
      const duration = 1600;
      const started = performance.now();
      const draw = (now) => {
        const progress = Math.min((now - started) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        node.textContent = `${(target * eased).toFixed(decimals)}${suffix}`;
        if (progress < 1) requestAnimationFrame(draw);
        else node.textContent = source.trim();
      };
      requestAnimationFrame(draw);
      counterObserver.unobserve(node);
    }), { threshold: .6 });
    canvas.querySelectorAll('p').forEach((node) => {
      const value = node.textContent.trim();
      if (/^20\d{2}$/.test(value) || !/^\d+(?:[.,]\d+)?\s*[KM%]?$/.test(value)) return;
      if (Number.parseFloat(value) < 10 && !/[KM%]$/.test(value)) return;
      node.dataset.counterSource = value;
      node.classList.add('roadshow-counter');
      counterObserver.observe(node);
    });
    const packs = canvas.querySelector('[data-node-id="247:11437"]');
    canvas.querySelector('[data-node-id="252:13596"]')?.addEventListener('click', () => packs?.scrollIntoView({ behavior: 'smooth', block: 'start' }));

    const exhibitorPack = packs;
    const partnerPack = canvas.querySelector('[data-node-id="247:12022"]');
    exhibitorPack?.classList.add('roadshow-pack--exhibitor');
    partnerPack?.classList.add('roadshow-pack--partner');
    partnerPack?.setAttribute('hidden', '');
    const setPack = (variant) => {
      const partnerActive = variant === 'partner';
      exhibitorPack?.toggleAttribute('hidden', partnerActive);
      partnerPack?.toggleAttribute('hidden', !partnerActive);
    };
    canvas.querySelector('[data-node-id="247:11460"]')?.addEventListener('click', () => setPack('partner'));
    canvas.querySelector('[data-node-id="247:11462"]')?.addEventListener('click', () => setPack('exhibitor'));
    canvas.querySelector('[data-node-id="247:12048"]')?.addEventListener('click', () => setPack('partner'));
    canvas.querySelector('[data-node-id="247:12050"]')?.addEventListener('click', () => setPack('exhibitor'));

    // Remove the blank space produced by the inactive Figma-artboard export and
    // keep the content that follows directly after the unified tab panel.
    const root = canvas.querySelector('[data-node-id="247:11211"]');
    Array.from(root?.children || []).forEach((node) => {
      if (Number.parseFloat(getComputedStyle(node).top) >= 5566) node.classList.add('roadshow-after-packs');
    });
  };
  window.addEventListener('load', hydrate, { once: true });
})();
