// Site-wide motion: scroll reveals, staggered entrances, hero load-in,
// count-ups, ambient drift and button shine (styles in site-motion.css).
// It only adds classes and CSS variables; it never moves or resizes layout,
// so the pages' own scripts (tabs, carousels, counters, hero fitting) keep
// working. Nothing runs when the visitor prefers reduced motion.
(() => {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const html = document.documentElement;
  html.classList.add('mo-on');

  /* ---------- Reveal engine ---------- */
  const io = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    show(entry.target);
    io.unobserve(entry.target);
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0 });

  const pending = new Set();
  function show(el) {
    pending.delete(el);
    el.classList.add('mo-in');
    (el.moGroup || []).forEach((child) => child.classList.add('mo-in'));
    (el.moThen || []).forEach((fn) => fn());
  }

  function watch(trigger) {
    if (trigger.moWatched) return;
    trigger.moWatched = true;
    pending.add(trigger);
    io.observe(trigger);
  }

  // At the very bottom of the page the bottom margin above can never be
  // crossed, so reveal whatever is left on screen.
  window.addEventListener('scroll', () => {
    if (!pending.size || window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 2) return;
    pending.forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) { show(el); io.unobserve(el); }
    });
  }, { passive: true });

  // Mark an element for an entrance. `trigger` reveals a whole group at once
  // (useful for stagger and for content that is hidden behind a tab).
  function mark(el, kind, delay = 0, trigger = null, vars = null) {
    if (!el || el.classList.contains('mo-r')) return el;
    el.classList.add('mo-r', `mo-${kind}`);
    if (delay) el.style.setProperty('--mo-d', `${Math.round(delay)}ms`);
    if (vars) Object.entries(vars).forEach(([key, value]) => el.style.setProperty(key, value));
    if (trigger && trigger !== el) {
      (trigger.moGroup ||= []).push(el);
      watch(trigger);
    } else watch(el);
    return el;
  }

  function onShow(trigger, fn) {
    (trigger.moThen ||= []).push(fn);
    watch(trigger);
  }

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const rand = (min, max) => min + Math.random() * (max - min);

  /* ---------- Ambient helpers ---------- */
  function float(el, size = 12) {
    el.classList.add('mo-float');
    el.style.setProperty('--mo-fdur', `${rand(5, 8).toFixed(2)}s`);
    el.style.setProperty('--mo-fy', `${-rand(size * .6, size).toFixed(1)}px`);
    el.style.setProperty('--mo-fx', `${rand(-size / 3, size / 3).toFixed(1)}px`);
    el.style.setProperty('--mo-fr', `${rand(-2.5, 2.5).toFixed(2)}deg`);
  }

  function shine(el, glow = false) {
    if (!el || el.classList.contains('mo-shine')) return;
    if (getComputedStyle(el, '::after').content !== 'none') return;
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.classList.add('mo-shine');
    el.style.setProperty('--mo-sd', `${rand(1.2, 3.2).toFixed(2)}s`);
    if (glow) el.classList.add('mo-glow');
  }

  function kenBurns(img, origin) {
    if (!img) return;
    img.classList.add('mo-kb');
    if (origin) img.style.setProperty('--mo-kb-origin', origin);
  }

  // Count a number up from 0 when it scrolls into view ("9K", "144", "+3500").
  function countUp(el) {
    const raw = el.textContent.trim();
    const match = raw.match(/^([^\d]*)(\d[\d\s.,]*)(.*)$/);
    if (!match) return;
    const digits = match[2].replace(/[\s,]/g, '');
    const value = Number(digits);
    if (!Number.isFinite(value) || value === 0) return;
    const decimals = (digits.split('.')[1] || '').length;
    el.style.fontVariantNumeric = 'tabular-nums';
    el.textContent = `${match[1]}0${match[3]}`;
    onShow(el, () => {
      const start = performance.now();
      const duration = 1700;
      const frame = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const current = value * (1 - Math.pow(1 - t, 3));
        el.textContent = `${match[1]}${decimals ? current.toFixed(decimals) : Math.round(current)}${match[3]}`;
        if (t < 1) requestAnimationFrame(frame);
        else el.textContent = raw;
      };
      requestAnimationFrame(frame);
    });
  }

  function stagger(items, kind, { base = 0, step = 90, trigger = null, max = 10, vars = null } = {}) {
    items.forEach((el, i) => mark(el, kind, base + Math.min(i, max) * step, trigger, vars));
  }

  function heading(el, delay = 0, trigger = null) { return mark(el, 'title', delay, trigger); }

  /* ---------- Scroll progress bar ---------- */
  function progressBar() {
    const bar = document.createElement('div');
    bar.className = 'mo-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.append(bar);
    let queued = false;
    const update = () => {
      queued = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty('--mo-p', max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : '0');
    };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue, { passive: true });
    update();
  }

  /* ---------- Shared event sections (packs and stats) ---------- */
  function eventSections() {
    $$('.event-packs, .event-stats').forEach((section) => {
      $$('.event-packs__panel, .event-stats__panel', section).forEach((panel) => {
        [...panel.children].forEach((card, i) => card.style.setProperty('--mo-i', String(i)));
      });
      watch(section);
      heading($('.event-packs__title, .event-stats__title', section), 0, section);
      mark($('.event-stats__eyebrow', section), 'rise', 0, section, { '--mo-y': '20px' });
      mark($('.event-packs__tabs, .event-stats__tabs', section), 'pop', 180, section);
      $$('.event-packs__left-art, .event-packs__arrow, .event-packs__corner-art', section).forEach((art, i) => {
        mark(art, 'zoom', 150 + i * 120, section);
        float(art, 14);
      });
      // After the first entrance, tab switches replay the cards without the long delay.
      section.addEventListener('click', (event) => {
        if (event.target.closest('[role="tab"], .event-packs__tab, .event-stats__tab')) section.classList.add('mo-tabbed');
      });
    });
  }

  /* ---------- Figma canvas pages (Caravan, Edu-Career, Roadshow) ---------- */
  const SKIP = ['fitted-artboard', 'event-packs', 'event-stats', 'text-reveal', 'roadshow-reveal', 'figma-fade', 'fx-hero-in', 'figma-hotspot', 'summit-investment'];
  const ORANGE = /rgba?\((2[2-5]\d),\s*(\d+),\s*(\d+)/g;

  function isOrange(style) {
    const text = `${style.backgroundColor} ${style.backgroundImage}`;
    for (const [, r, g, b] of text.matchAll(ORANGE)) {
      if (Number(r) > 220 && Number(g) > 60 && Number(g) < 175 && Number(b) < 100) return true;
    }
    return false;
  }

  function canvasLayers(root) {
    const layers = [];
    const collect = (parent, depth) => {
      for (const el of parent.children) {
        const style = getComputedStyle(el);
        if (style.display === 'contents') { collect(el, depth); continue; }
        if (style.display === 'none' || style.visibility === 'hidden') continue;
        // Sections that already fade in as a block: animate what is inside them.
        if (el.classList.contains('summit-section-reveal') && !el.classList.contains('summit-investment')) { collect(el, depth + 1); continue; }
        if (SKIP.some((name) => el.classList.contains(name))) continue;
        layers.push({ el, depth });
      }
    };
    collect(root, 0);
    return layers;
  }

  function animateCanvas(canvas) {
    const root = canvas.firstElementChild;
    if (!root) return;
    const box = root.getBoundingClientRect();
    const scale = box.width / 1440 || 1;
    const measure = (el) => {
      const r = el.getBoundingClientRect();
      return { x: (r.left - box.left) / scale, y: (r.top - box.top) / scale, w: r.width / scale, h: r.height / scale };
    };

    let items = canvasLayers(root).map(({ el }) => ({ el, ...measure(el) }));
    // A full-width background that holds a whole section: open it up so its
    // cards and text animate one by one instead of as a single block.
    for (let pass = 0; pass < 2; pass += 1) {
      items = items.flatMap((item) => {
        if (item.w >= 1100 && item.h >= 300 && item.el.children.length > 3) {
          return canvasLayers(item.el).map(({ el }) => ({ el, ...measure(el) }));
        }
        return [item];
      });
    }
    items = items.filter((item) => item.w > 0 && item.h > 0);

    items.forEach((item) => {
      const { el } = item;
      item.hasImg = el.matches('img, svg') || !!el.querySelector('img, svg, video, picture');
      item.hasText = /\S/.test(el.textContent);
      item.bg = item.w >= 1100 && item.h >= 260;
      if (item.bg) item.kind = 'fade';
      else if (item.w < 6 || item.h < 6) item.kind = 'fade';
      else if (item.hasText && !item.hasImg && el.querySelector('p')) item.kind = null; // text has its own effect
      else if (item.hasImg && !item.hasText && item.w <= 150 && item.h <= 150) item.kind = 'pop';
      else if (item.hasImg && !item.hasText) item.kind = 'zoom';
      else item.kind = 'rise';
    });

    // Headings: give the existing per-paragraph reveal a stronger mask-rise.
    $$('p', root).forEach((p) => {
      if (p.closest('.fitted-artboard, .event-packs, .event-stats') || p.dataset.countTarget || p.classList.contains('stats-count')) return;
      if (parseFloat(getComputedStyle(p).fontSize) >= 34) p.classList.add('mo-head');
    });

    // Stagger: rows of layers that start at about the same height enter left to right.
    const solid = items.filter((item) => item.kind && !item.bg).sort((a, b) => a.y - b.y || a.x - b.x);
    let rowTop = -Infinity;
    let row = [];
    const flush = () => {
      row.sort((a, b) => a.x - b.x).forEach((item, i) => {
        item.delay = Math.min(i, 7) * 95 + (item.kind === 'pop' ? 160 : 0);
      });
      row = [];
    };
    solid.forEach((item) => {
      if (item.y - rowTop > 70) { flush(); rowTop = item.y; }
      row.push(item);
    });
    flush();

    // Isolated decorations (arrows, stars, icons that sit alone) drift gently.
    const overlaps = (a, b) => a.x < b.x + b.w - 4 && b.x < a.x + a.w - 4 && a.y < b.y + b.h - 4 && b.y < a.y + a.h - 4;
    let floats = 0;
    items.forEach((item) => {
      if (!item.kind) return;
      mark(item.el, item.kind, item.delay || 0, null, item.bg ? { '--mo-t': '1.4s' } : null);
      const decor = (item.kind === 'pop' || item.kind === 'zoom') && item.w <= 420 && item.h <= 420
        && !item.el.matches('.interactive-card, .roadshow-card, .concept-card, .summit-card, .roadshow-concept-card');
      if (decor && floats < 16 && !solid.some((other) => other !== item && overlaps(item, other))) {
        float(item.el, item.w > 160 ? 16 : 10);
        floats += 1;
      }
      // Rounded photo frames: the photo zooms a little on hover.
      if (item.kind === 'zoom' && !item.bg) {
        const style = getComputedStyle(item.el);
        if (style.overflow !== 'visible' && style.pointerEvents !== 'none' && item.el.querySelectorAll('img').length === 1) item.el.classList.add('mo-zoomable');
      }
    });

    // Orange buttons shine; the hero's main call to action also glows.
    $$('div, a, button', root).forEach((el) => {
      if (el.closest('.event-packs, .event-stats')) return;
      const r = measure(el);
      if (r.w < 110 || r.w > 480 || r.h < 30 || r.h > 100 || !/\S/.test(el.textContent)) return;
      const style = getComputedStyle(el);
      if (parseFloat(style.borderTopLeftRadius) < 6 || !isOrange(style)) return;
      shine(el, !!el.closest('.fitted-artboard'));
    });

    // Hero photo: slow breathing zoom (the hero box clips it).
    const artboard = $('.fitted-artboard', root);
    if (artboard) {
      kenBurns($('img', artboard.firstElementChild), '65% 40%');
      // Hero content enters on load unless the page already animates it.
      if (!$('.fx-hero-in', artboard)) {
        const heroItems = [...artboard.children].slice(1).filter((el) => !el.matches('button, .figma-hotspot') && el.getBoundingClientRect().height > 0);
        heroItems.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
        heroItems.forEach((el, i) => {
          el.classList.add('mo-hero-item');
          mark(el, 'rise', 150 + i * 110, null, { '--mo-y': '30px' });
        });
      }
    }
  }

  function whenCanvasReady(canvas, done) {
    const started = performance.now();
    const check = () => {
      const ready = canvas.firstElementChild && (canvas.querySelector('.text-reveal, .roadshow-reveal') || performance.now() - started > 4000);
      if (ready) setTimeout(done, 120);
      else if (performance.now() - started < 15000) setTimeout(check, 100);
    };
    check();
  }

  /* ---------- Accueil ---------- */
  function home() {
    const hero = $('.hero');
    if (hero) {
      kenBurns($('.hero__bg', hero), '70% 45%');
      const heroItems = [
        ['.hero__logo', 'drop'], ['.hero__eyebrow', 'rise'],
        ...$$('.hero__line', hero).map((line) => [line, 'title']),
        ['.hero__lead', 'rise'], ['.hero__year', 'pop'], ['.hero__scroll', 'fade'],
      ];
      heroItems.forEach(([target, kind], i) => mark(typeof target === 'string' ? $(target, hero) : target, kind, 150 + i * 120, null, { '--mo-y': '28px' }));
    }

    const vid = $('.vid');
    if (vid) {
      mark($('.vid__kicker', vid), 'rise', 0, null, { '--mo-y': '20px' });
      heading($('.vid__title', vid), 120);
      mark($('.vid__frame', vid), 'zoom', 200);
    }

    const chf = $('.chf');
    if (chf) {
      const intro = $('.chf__intro', chf);
      mark($('.chf__kicker', intro), 'rise', 0, intro, { '--mo-y': '20px' });
      heading($('.chf__title', intro), 120, intro);
      mark($('.chf__bar', intro), 'draw', 320, intro);
      mark($('.chf__lead', intro), 'rise', 380, intro, { '--mo-y': '26px' });
      $$('.chf__note', chf).forEach((note, i) => { mark(note, 'pop', 500 + i * 180); float(note, 8); });
      const band = $('.chf__band', chf);
      watch(band);
      mark($('.chf__pill', band), 'pop', 0, band);
      stagger($$('.chf__metric', band), 'pop', { base: 200, step: 130, trigger: band });
      $$('.chf__num', band).forEach(countUp);
      const why = $('.chf__why', chf);
      mark($('.chf__kicker', why), 'rise', 0, why, { '--mo-y': '20px' });
      heading($('.chf__subtitle', why), 120, why);
      const cards = $('.chf__cards', chf);
      stagger([...cards.children], 'rise', { base: 150, step: 140, trigger: cards, vars: { '--mo-y': '56px' } });
      mark($('.chf__tagline', chf), 'fade', 300);
    }

    const pw = $('.pw');
    if (pw) {
      mark($('.pw__kicker', pw), 'rise', 0, null, { '--mo-y': '20px' });
      heading($('.pw__title', pw), 100);
      mark($('.pw__sub', pw), 'rise', 220);
      mark($('.pw__underline', pw), 'draw', 380);
      mark($('.pw__panel', pw), 'rise', 250, null, { '--mo-y': '60px' });
      mark($('.pw__foot', pw), 'fade', 200);
    }

    $$('.tm').forEach((section) => {
      mark($('.tm__kicker', section), 'rise', 0, null, { '--mo-y': '20px' });
      heading($('.tm__title', section), 100);
      mark($('.tm__sub', section), 'rise', 220);
      mark($('.tm__carousel--main', section), 'rise', 200, null, { '--mo-y': '60px' });
      mark($('.tm__more', section), 'fade', 100);
      mark($('.tm__carousel--others', section), 'rise', 150);
    });

    const services = $('#services');
    if (services) {
      const arabic = mark($('.arabic', services), 'pop');
      if (arabic) float(arabic, 8);
      mark($('.services-underline', services), 'draw', 250);
      heading($('h2', services), 120);
      mark($('.intro', services), 'rise', 240);
      const grid = $('.summit-grid', services);
      if (grid) stagger([...grid.children], 'rise', { base: 150, step: 110, trigger: grid, vars: { '--mo-y': '56px' } });
      const more = $('.summit-more', services);
      mark(more, 'rise', 150);
      shine(more);
    }

    const contact = $('.contact');
    if (contact) {
      const banner = $('.contact-banner', contact);
      mark(banner, 'rise');
      shine(banner);
      const details = $$('.detail, .tagline', contact);
      stagger(details, 'right', { base: 250, step: 120, trigger: $('aside', contact), vars: { '--mo-x': '40px' } });
      shine($('.button', contact));
    }
    mark($('body > footer'), 'fade');
  }

  /* ---------- Roadshow hero (HTML) ---------- */
  function roadshowHero() {
    const hero = $('#roadshow-hero');
    if (!hero) return;
    kenBurns($('.rs-hero__bg', hero), '60% 60%');
    let delay = 150;
    const next = (step = 110) => { const d = delay; delay += step; return d; };
    mark($('.rs-hero__tagline', hero), 'left', next(), null, { '--mo-x': '40px' });
    heading($('.rs-hero__wajahni', hero), next(140));
    heading($('.rs-hero__line2', hero), next(140));
    mark($('.rs-hero__subtitle', hero), 'rise', next(), null, { '--mo-y': '24px' });
    mark($('.rs-hero__lead', hero), 'rise', next(), null, { '--mo-y': '24px' });
    const timeline = $('.rs-hero__timeline', hero);
    if (timeline) { timeline.style.transformOrigin = '0 50%'; mark(timeline, 'draw', delay); }
    stagger($$('.rs-city', hero), 'drop', { base: next(0), step: 85 });
    delay += 85 * 9;
    stagger($$('.rs-stat', hero), 'rise', { base: next(0) - 300, step: 110, vars: { '--mo-y': '24px' } });
    $$('.rs-stat__value', hero).forEach(countUp);
    const cta = $('.rs-hero__cta', hero);
    mark(cta, 'pop', delay + 100);
    shine(cta, true);
  }

  /* ---------- Platform sections and 360° ---------- */
  function platform() {
    const hero = $('#platform-hero');
    if (hero) {
      kenBurns($('.ph__bg', hero), '80% 45%');
      const items = [
        ['.ph__eyebrow', 'rise'], ...$$('.ph__line', hero).map((line) => [line, 'title']),
        ['.ph__sub', 'rise'], ['.ph__lead', 'rise'],
      ];
      items.forEach(([target, kind], i) => mark(typeof target === 'string' ? $(target, hero) : target, kind, 150 + i * 120, null, { '--mo-y': '28px' }));
      stagger($$('.ph__card', hero), 'pop', { base: 150 + items.length * 120, step: 110 });
      mark($('.ph__tag', hero), 'fade', 150 + items.length * 120 + 520);
    }
    const page = $('main.pf');
    if (!page) return;
    $$('.pf-sec', page).forEach((section) => {
      $$('.pf-head, .pf-intro__text > *, .pf-exp__text > *', section).forEach((el, i) => mark(el, 'rise', i * 90, null, { '--mo-y': '26px' }));
      $$('.pf-feat__shot, .pf-split__media, .pf-intro__bg', section).forEach((el) => mark(el, 'zoom', 0));
      const groups = ['.pf-cols3', '.pf-rows', '.pf-ref', '.pf-bubble', '.pf-timeline', '.pf-pos', '.pf-aud', '.pf-do', '.pf-feat__list', '.pf-tiles', '.pf-plans', '.pf-benefits'];
      groups.forEach((selector) => $$(selector, section).forEach((group) => {
        stagger([...group.children], 'rise', { base: 120, step: 90, trigger: group, vars: { '--mo-y': '30px' } });
      }));
      $$('.pf-feat__body > :not(.pf-feat__list)', section).forEach((el, i) => mark(el, 'rise', i * 90, null, { '--mo-y': '24px' }));
      $$('.pf-warn, .pf-punch, .pf-script, .pf-pill--center, .pf-join__cta', section).forEach((el) => mark(el, 'pop', 150));
      $$('.pf-head__mascot, .pf-head__deco', section).forEach((el) => { mark(el, 'pop', 300); float(el, 10); });
    });
    $$('.pf-btn', page).forEach((btn) => shine(btn, true));
  }

  function w360() {
    const hero = $('#w360-hero');
    if (hero) {
      kenBurns($('.w3h__photo img', hero), '70% 40%');
      mark($('.w3h__photo', hero), 'fade', 0);
      const items = [['.w3h__brand', 'drop'], ['.w3h__title', 'title'], ['.w3h__sub', 'rise'], ['.w3h__lead', 'rise'], ['.w3h__cue', 'pop']];
      items.forEach(([target, kind], i) => mark($(target, hero), kind, 150 + i * 130, null, { '--mo-y': '28px' }));
      shine($('.w3h__cue', hero), true);
    }
    const why = $('#pourquoi');
    if (why) {
      heading($('.w3w__title', why));
      stagger($$('.w3w__card', why), 'rise', { base: 150, step: 110, trigger: $('.w3w__cards', why), vars: { '--mo-y': '36px' } });
      mark($('.w3w__quote', why), 'pop', 0);
      mark($('.w3w__sign', why), 'rise', 200, $('.w3w__quote', why), { '--mo-y': '20px' });
    }
    const sections = $$('[data-w360-panel]');
    sections.forEach((section) => {
      mark($('img', section), 'rise', 0, section, { '--mo-y': '60px', '--mo-t': '1.1s' });
    });
    const contact = $('.w360-contact-section');
    if (contact) {
      stagger([...contact.children], 'rise', { base: 0, step: 140, trigger: contact });
      shine($('a', contact));
    }
  }

  /* ---------- Start ---------- */
  function start() {
    progressBar();
    const figma = $('#figma-canvas');
    if (figma) {
      whenCanvasReady(figma, () => { animateCanvas(figma); eventSections(); });
    }
    if ($('#roadshow-hero')) roadshowHero();
    if ($('main > .hero') || $('.vid')) home();
    if ($('#platform-hero')) platform();
    if ($('#w360-root') || $('.w360-page') || document.querySelector('script[src*="wajahni360"]')) {
      const started = performance.now();
      const wait = () => ($$('[data-w360-panel]').length ? w360() : performance.now() - started < 15000 && setTimeout(wait, 120));
      wait();
    }
  }

  // Runs as soon as it loads (at the end of <body>), so HTML heroes are
  // marked before they paint; canvas pages wait for their own scripts.
  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start, { once: true });
})();
