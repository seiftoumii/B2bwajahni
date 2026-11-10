(() => {
  if (window.location.hash === '#top') {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }
  const width = 1440;
  // The canvas is 6998 design px, but the sections below the stats moved up
  // by 1650 px (one packs tab frame), which left ~540 px of empty page under
  // the contact form. End the page the same distance below it as Roadshow.
  const height = 6462;
  const viewport = document.querySelector('#figma-viewport');
  const canvas = document.querySelector('#figma-canvas');

  function updateScale() {
    const scale = window.innerWidth / width;
    document.documentElement.style.setProperty('--canvas-scale', String(scale));
    viewport.style.width = (width * scale) + 'px';
    fitServiceArtboard(viewport, scale, height, 1018, 1018, [162, 960]);
  }

  function hydrate() {
    if (!canvas.firstElementChild) { window.setTimeout(hydrate, 50); return; }
    updateScale();
    window.addEventListener('resize', updateScale, { passive: true });

    const textObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      textObserver.unobserve(entry.target);
    }), { threshold: .1 });
    canvas.querySelectorAll('p').forEach((text, index) => {
      text.classList.add('text-reveal');
      text.style.setProperty('--text-delay', ((index % 7) * 35) + 'ms');
      textObserver.observe(text);
    });

    const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }), { threshold: .12 });

    const revealNodes = [
      '237:8062', '237:8233', '237:8269', '237:8286', '237:8871', '237:9548', '237:9671'
    ];
    revealNodes.forEach((id, index) => {
      const node = canvas.querySelector(`[data-node-id="${id}"]`);
      if (!node) return;
      node.classList.add('summit-section-reveal');
      node.style.setProperty('--section-delay', `${(index % 3) * 70}ms`);
      revealObserver.observe(node);
    });

    const cardNodes = [
      '237:8314', '237:8449', '237:8584', '237:8719',
      '237:8902', '237:9040', '237:9178', '237:9318',
      '237:9583', '237:9593', '237:9603', '237:9613', '237:9623'
    ];
    cardNodes.forEach((id) => canvas.querySelector(`[data-node-id="${id}"]`)?.classList.add('summit-card'));
    ['237:8234', '237:8235', '237:8236', '237:8242', '237:8280', '237:8281', '237:8282'].forEach((id) => {
      canvas.querySelector(`[data-node-id="${id}"]`)?.classList.add('summit-image-card');
    });

    const counterTargets = [
      { id: '237:8069', value: 5, prefix: '+', suffix: 'K' },
      { id: '237:8077', value: 80, suffix: '' },
      { id: '237:8086', value: 18, suffix: '' },
      { id: '237:8095', value: 18, suffix: '' }
    ];
    const counterObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const detail = counterTargets.find((item) => item.node === entry.target);
      if (detail) animateCounter(detail);
      counterObserver.unobserve(entry.target);
    }), { threshold: .6 });
    counterTargets.forEach((detail) => {
      const node = canvas.querySelector(`[data-node-id="${detail.id}"] p`);
      if (!node) return;
      detail.node = node;
      node.classList.add('summit-counter');
      counterObserver.observe(node);
    });

    function animateCounter(detail) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) { detail.node.textContent = `${detail.prefix || ''}${detail.value}${detail.suffix || ''}`; return; }
      const duration = 1750;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        detail.node.textContent = `${detail.prefix || ''}${Math.round(detail.value * eased)}${detail.suffix || ''}`;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }

    const exhibitor = canvas.querySelector('[data-node-id="237:8286"]');
    const partner = canvas.querySelector('[data-node-id="237:8871"]');
    const exhibitorTab = canvas.querySelector('[data-node-id="237:8311"]');
    const partnerTab = canvas.querySelector('[data-node-id="237:8309"]');
    if (exhibitor && partner && exhibitorTab && partnerTab) {
      exhibitor.classList.add('summit-investment', 'is-active');
      partner.classList.add('summit-investment', 'is-inactive');
      exhibitorTab.classList.add('summit-investment-tab');
      partnerTab.classList.add('summit-investment-tab');
      exhibitorTab.setAttribute('role', 'button'); exhibitorTab.setAttribute('tabindex', '0');
      partnerTab.setAttribute('role', 'button'); partnerTab.setAttribute('tabindex', '0');
      const setInvestment = (kind) => {
        const partnerIsActive = kind === 'partner';
        exhibitor.classList.toggle('is-active', !partnerIsActive);
        exhibitor.classList.toggle('is-inactive', partnerIsActive);
        partner.classList.toggle('is-active', partnerIsActive);
        partner.classList.toggle('is-inactive', !partnerIsActive);
        partner.style.top = partnerIsActive ? '4697.1px' : '5535.76px';
        partner.style.left = partnerIsActive ? '115px' : '-1.93px';
        exhibitorTab.setAttribute('aria-pressed', String(!partnerIsActive));
        partnerTab.setAttribute('aria-pressed', String(partnerIsActive));
      };
      const bindTab = (element, kind) => {
        element.addEventListener('click', () => setInvestment(kind));
        element.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setInvestment(kind); }
        });
      };
      bindTab(exhibitorTab, 'exhibitor'); bindTab(partnerTab, 'partner'); setInvestment('exhibitor');
      const partnerActiveTab = canvas.querySelector('[data-node-id="237:8897"]');
      const partnerExhibitorTab = canvas.querySelector('[data-node-id="237:8899"]');
      if (partnerActiveTab && partnerExhibitorTab) {
        partnerActiveTab.classList.add('summit-investment-tab');
        partnerExhibitorTab.classList.add('summit-investment-tab');
        partnerActiveTab.setAttribute('role', 'button'); partnerActiveTab.setAttribute('tabindex', '0');
        partnerExhibitorTab.setAttribute('role', 'button'); partnerExhibitorTab.setAttribute('tabindex', '0');
        bindTab(partnerActiveTab, 'partner'); bindTab(partnerExhibitorTab, 'exhibitor');
      }
    }

    const pageRoot = canvas.firstElementChild;
    // The Figma export places the four Exposant feature lists as sibling layers.
    // Mount them in their real cards so their coordinates are local to the card,
    // rather than page-level coordinates that drift when the canvas is scaled.
    const attachPackageItems = (firstId, lastId, cardId) => {
      const card = canvas.querySelector(`[data-node-id="${cardId}"]`);
      if (!card) return;
      const items = [...pageRoot.children].filter((element) => {
        const [fileId, nodeId] = (element.dataset.nodeId || '').split(':').map(Number);
        return fileId === 239 && nodeId >= firstId && nodeId <= lastId;
      });
      const scale = window.innerWidth / width;
      const cardTop = card.getBoundingClientRect().top;
      items.forEach((item) => {
        const visualTop = item.getBoundingClientRect().top;
        item.classList.add('summit-package-source-item');
        item.style.position = 'absolute';
        item.style.zIndex = '2';
        item.style.top = `${(visualTop - cardTop) / scale}px`;
        item.style.left = '16px';
        item.style.right = '16px';
        item.style.width = 'auto';
        pageRoot.removeChild(item);
        card.append(item);
      });
    };
    attachPackageItems(10514, 10598, '237:8314');
    attachPackageItems(10606, 10690, '237:8449');
    attachPackageItems(10698, 10782, '237:8584');
    attachPackageItems(10790, 10874, '237:8719');
    // The Partner Figma frame uses the same four benefit columns, but its export
    // leaves them outside the card subtree. Copy the imported Figma layers into
    // the corresponding Partner cards, preserving their original styling.
    [
      ['237:8314', '237:8902'], ['237:8449', '237:9040'],
      ['237:8584', '237:9178'], ['237:8719', '237:9318']
    ].forEach(([sourceId, targetId]) => {
      const source = canvas.querySelector(`[data-node-id="${sourceId}"]`);
      const target = canvas.querySelector(`[data-node-id="${targetId}"]`);
      if (!source || !target) return;
      source.querySelectorAll('.summit-package-source-item').forEach((item) => {
        const copy = item.cloneNode(true);
        copy.removeAttribute('data-node-id');
        target.append(copy);
      });
    });
    const partnerGrid = canvas.querySelector('[data-node-id="237:8901"]');
    if (partnerGrid) {
      partnerGrid.style.left = '67px';
      partnerGrid.style.transform = 'none';
    }
    // These Figma layers are the Silver badge and duplicate page-level prices.
    // The price is already inside each card; only the badge belongs in the card.
    ['237:10044', '237:10047', '237:10050'].forEach((id) => canvas.querySelector(`[data-node-id="${id}"]`)?.remove());
    const silverBadge = canvas.querySelector('[data-node-id="237:10038"]');
    const silverCard = canvas.querySelector('[data-node-id="237:8584"]');
    if (silverBadge && silverCard) {
      silverBadge.style.position = 'absolute';
      silverBadge.style.zIndex = '3';
      silverBadge.style.top = '21.16px';
      silverBadge.style.right = '0';
      silverBadge.style.left = 'auto';
      silverCard.append(silverBadge);
    }
    const getTop = (element) => {
      const inlineTop = Number.parseFloat(element.style.top || '');
      if (!Number.isNaN(inlineTop)) return inlineTop;
      const match = element.className.match(/top-\[(-?[\d.]+)px\]/);
      return match ? Number.parseFloat(match[1]) : 0;
    };
    const stats2026 = [...pageRoot.children].filter((element) => {
      const top = getTop(element); return top >= 3076 && top < 3887;
    });
    const stats2025 = [...pageRoot.children].filter((element) => {
      const top = getTop(element); return top >= 3887 && top < 4697;
    });
    // Replace both Figma stats frames (2025–2026 and 2023–2024) by the shared
    // stats section with 2025 | 2026 tabs, same on all event pages.
    [...stats2026, ...stats2025].forEach((node) => node.remove());
    window.WajahniStats?.mount({ page: 'educareer', parent: pageRoot, top: 3076, height: 811 });

    const dialog = document.querySelector('#contact-dialog');
    const toast = document.querySelector('.figma-toast');
    const showToast = (message) => {
      toast.textContent = message; toast.classList.add('is-visible');
      window.clearTimeout(showToast.timeout); showToast.timeout = window.setTimeout(() => toast.classList.remove('is-visible'), 2600);
    };
    const addHotspot = (className, label, action) => {
      const button = document.createElement('button'); button.type = 'button'; button.className = `figma-hotspot ${className}`; button.setAttribute('aria-label', label);
      button.addEventListener('click', action); (className === 'figma-hotspot--hero' ? canvas.querySelector('.fitted-artboard') : canvas).append(button);
      return button;
    };
    // The hero button reads "Découvrir nos packs": take the visitor to the packs, as on Caravan and Roadshow.
    addHotspot('figma-hotspot--hero', 'Découvrir nos packs', () => window.WajahniPacks?.scrollToPacks());
    ['2024', '2025', '2026'].forEach((year, index) => {
      addHotspot('figma-hotspot--aftermovie', `Voir l’aftermovie ${year}`, () => showToast(`L’aftermovie ${year} arrive bientôt.`)).dataset.card = index;
    });
    document.querySelector('.figma-close')?.addEventListener('click', () => dialog?.close());
    document.querySelector('.figma-form')?.addEventListener('submit', (event) => {
      event.preventDefault(); dialog?.close(); showToast('Merci — votre demande a bien été envoyée.'); event.currentTarget.reset();
    });

    // Rebuild the two Figma offer frames as one stable tabbed section. The raw
    // export spreads package rows over the page root, which made both frames
    // overlap when tabs were changed. Keeping the exact Figma dimensions here
    // makes the offer a single, reliable layer immediately after the stats.
    ['237:8286', '237:8871'].forEach((id) => canvas.querySelector(`[data-node-id="${id}"]`)?.remove());
    [...pageRoot.children].forEach((element) => {
      const [fileId, nodeId] = (element.dataset.nodeId || '').split(':').map(Number);
      if (fileId === 239 || fileId === 257 || (fileId === 237 && nodeId >= 10038 && nodeId <= 10899)) element.remove();
    });

    // The original file reserved one full frame for each tab. There is now one
    // tabbed frame, so bring the following Figma sections up by that spare slot.
    [...pageRoot.children].forEach((element) => {
      const top = getTop(element);
      if (top >= 6376) element.style.top = `${top - 1650}px`;
    });

    // Shared packs section (event-packs.js), identical on all three event pages.
    window.WajahniPacks?.mount({ page: 'educareer', parent: canvas, top: 3887, height: 839.566 });
  }

  function enhance(tries = 0) {
    const pageRoot = canvas.firstElementChild;
    if (!pageRoot || (!document.querySelector('.event-packs') && tries < 40)) { window.setTimeout(() => enhance(tries + 1), 100); return; }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const byId = (id) => canvas.querySelector(`[data-node-id="${id}"]`);
    const sized = (el) => ({ w: el.offsetWidth, h: el.offsetHeight });

    [...canvas.querySelectorAll('[class*="from-[#f4671f]"],[class*="from-[#f7861d]"],[class*="bg-[#f4622a]"]')].forEach((el) => {
      const { w, h } = sized(el);
      if (w > 120 && w < 460 && h > 36 && h < 96 && el.textContent.trim()) el.classList.add('fx-cta');
    });
    canvas.querySelectorAll('[class*="bg-[#fbfbfd]"][class*="rounded-[16.01px]"]').forEach((el) => el.classList.add('fx-card'));
    document.querySelectorAll('.figma-hotspot--hero').forEach((el) => el.classList.add('fx-cta'));

    const getY = (el) => { const t = Number.parseFloat(el.style.top || ''); if (!Number.isNaN(t)) return t; const m = el.className.match(/top-\[(-?[\d.]+)px\]/); return m ? Number.parseFloat(m[1]) : 0; };
    if (!reduce) {
      const heroItems = [...pageRoot.querySelector('.fitted-artboard').children].filter((el) => {
        const y = getY(el); return y > 120 && y < 960 && el.dataset.nodeId !== '237:8061' && el.offsetWidth < 1300;
      });
      heroItems.forEach((el, i) => { el.style.setProperty('--fx-delay', `${120 + i * 90}ms`); el.classList.add('fx-hero-in'); });
    }

    const parseStat = (text) => {
      const m = text.trim().match(/^(\+?)(\d+(?:[.,]\d+)?)([KM%]?)$/);
      return m ? { prefix: m[1], raw: m[2], value: Number.parseFloat(m[2].replace(',', '.')), decimals: (m[2].split(/[.,]/)[1] || '').length, suffix: m[3] } : null;
    };
    const countUp = (el) => {
      const info = parseStat(el.dataset.fxFinal);
      if (!info || reduce) return;
      const start = performance.now(); const duration = 1300;
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1); const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = `${info.prefix}${(info.value * eased).toFixed(info.decimals)}${info.suffix}`;
        if (p < 1) requestAnimationFrame(tick); else el.textContent = el.dataset.fxFinal;
      };
      requestAnimationFrame(tick);
    };
    const statObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) countUp(entry.target);
    }), { threshold: .6 });
    const panels = [...document.querySelectorAll('.summit-stats-panel')];
    panels.forEach((panel) => {
      panel.querySelectorAll('p').forEach((p) => {
        if (p.children.length || !parseStat(p.textContent)) return;
        p.dataset.fxFinal = p.textContent.trim(); p.style.fontVariantNumeric = 'tabular-nums'; statObserver.observe(p);
      });
      panel.querySelectorAll('[class*="rounded-["]').forEach((el) => {
        const { w, h } = sized(el);
        if (w > 120 && w < 200 && h > 50 && h < 90 && el.textContent.trim()) el.classList.add('stats-hover-block');
      });
    });
    document.querySelector('.summit-stats-tabs')?.addEventListener('click', () => window.setTimeout(() => {
      document.querySelectorAll('.summit-stats-panel.is-active [data-fx-final]').forEach((p) => { statObserver.unobserve(p); statObserver.observe(p); });
    }, 60));

    const bar = document.querySelector('.fx-progress');
    if (bar) {
      const update = () => { const max = document.documentElement.scrollHeight - window.innerHeight; bar.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`; };
      window.addEventListener('scroll', update, { passive: true }); update();
    }
  }

  window.addEventListener('load', () => { hydrate(); enhance(); }, { once: true });
})();
