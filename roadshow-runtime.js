(() => {
  const width = 1440;
  const height = 6460;
  const viewport = document.querySelector('#figma-viewport');
  const canvas = document.querySelector('#figma-canvas');
  const hero = document.querySelector('#roadshow-hero');
  const heroHeight = 1018;
  const updateScale = () => {
    const scale = window.innerWidth / width;
    document.documentElement.style.setProperty('--canvas-scale', String(scale));
    viewport.style.width = `${width * scale}px`;
    // The hero is the HTML section above (#roadshow-hero), so the canvas
    // starts at its second panel: skip the exported hero's 1018 design px.
    viewport.style.height = `${(height - heroHeight) * scale}px`;
    viewport.firstElementChild.style.top = `${-heroHeight * scale}px`;
    const header = document.querySelector('.site-header');
    if (header) hero?.style.setProperty('--rs-header', `${header.getBoundingClientRect().bottom}px`);
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
    // "Le concept" cards: Figma exported each card as four loose layers
    // (photo, white fade, icon, text). Hovering one layer lifted it above the
    // others, so the white fade covered the icon and text. Group the layers
    // of each card in one box and lift the whole card instead.
    const groupCard = (ids) => {
      const layers = ids.map((id) => canvas.querySelector(`[data-node-id="${id}"]`));
      if (layers.some((layer) => !layer)) return;
      const boxes = layers.map((layer) => ({ layer, left: layer.offsetLeft, top: layer.offsetTop }));
      const left = Math.min(...layers.map((layer) => layer.offsetLeft));
      const top = Math.min(...layers.map((layer) => layer.offsetTop));
      const right = Math.max(...layers.map((layer) => layer.offsetLeft + layer.offsetWidth));
      const bottom = Math.max(...layers.map((layer) => layer.offsetTop + layer.offsetHeight));
      const card = document.createElement('div');
      card.className = 'roadshow-card roadshow-concept-card';
      Object.assign(card.style, { position: 'absolute', left: `${left}px`, top: `${top}px`, width: `${right - left}px`, height: `${bottom - top}px` });
      layers[0].before(card);
      boxes.forEach(({ layer, left: x, top: y }) => {
        layer.classList.remove('roadshow-card');
        layer.style.left = `${x - left}px`;
        layer.style.top = `${y - top}px`;
        card.append(layer);
      });
    };
    groupCard(['247:11385', '247:11388', '247:11389', '247:11390']);
    groupCard(['247:11386', '247:11399', '247:11400', '247:11401']);

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
    // Replace the Figma stats frame (2025 and 2026 cards) by the shared stats
    // section with 2025 | 2026 tabs, same on all event pages.
    const statsRoot = canvas.querySelector('[data-node-id="247:11211"]');
    if (statsRoot && window.WajahniStats) {
      [...statsRoot.children].forEach((node) => {
        const top = Number.parseFloat(getComputedStyle(node).top);
        if (top >= 3076 && top < 3887) node.remove();
      });
      window.WajahniStats.mount({ page: 'roadshow', parent: statsRoot, top: 3076, height: 811 });
    }
    // Replace the two Figma pack frames (one per tab, each with its own tab
    // switch) by the shared packs section, identical on all three event pages.
    const packsFrame = canvas.querySelector('[data-node-id="247:11437"]');
    if (packsFrame && window.WajahniPacks) {
      const packsParent = packsFrame.parentElement;
      ['247:11437', '247:12022'].forEach((id) => canvas.querySelector(`[data-node-id="${id}"]`)?.remove());
      window.WajahniPacks.mount({ page: 'roadshow', parent: packsParent, top: 3887.1, height: 839.566 });
    }
    hero?.querySelector('.rs-hero__cta')?.addEventListener('click', (event) => {
      if (!document.querySelector('#packs') || !window.WajahniPacks?.scrollToPacks) return;
      event.preventDefault();
      window.WajahniPacks.scrollToPacks();
    });

    // Remove the blank space produced by the inactive Figma-artboard export and
    // keep the content that follows directly after the unified tab panel.
    const root = canvas.querySelector('[data-node-id="247:11211"]');
    Array.from(root?.children || []).forEach((node) => {
      if (Number.parseFloat(getComputedStyle(node).top) >= 5566) node.classList.add('roadshow-after-packs');
    });
  };
  window.addEventListener('load', hydrate, { once: true });
})();
