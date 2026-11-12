// One screen per section on the event pages (Caravan, Edu-Career, Roadshow).
//
// The pages are one 1440 px Figma canvas scaled to the window width, so on a
// laptop or a wide screen most sections came out taller than the window and
// had to be scrolled through. After the page's own runtime has built the
// canvas, this script splits it into its sections and, for every section that
// does not fit on one screen, gives it a box exactly one screen tall (full
// window width) and shrinks its content until all of it fits between the
// navbar and the bottom of the screen. Nothing is cut: the content keeps its
// layout and is only scaled. The section background keeps the full window
// width. Sections that already fit (phones, small sections) are not changed.
//
// Each runtime calls WajahniFit.init() at the end of its set-up and
// WajahniFit.layout() at the end of its updateScale().
(() => {
  // Where each section starts, after the hero (design px 1018). Node ids are
  // the full-width background of a section, or the section itself.
  const PAGES = {
    caravan: ['210:2958', '#stats', '#packs', '210:5035', '210:2533'],
    educareer: ['237:8269', '#stats', '#packs', '237:9548', '237:9648'],
    roadshow: ['247:11420', '#stats', '#packs', '247:12699', '247:12799'],
  };
  const HERO_END = 1018;
  let state = null;

  const find = (canvas, key) => canvas.querySelector(key.startsWith('#') ? key : `[data-node-id="${key}"]`);

  function collect(canvas) {
    const root = canvas.firstElementChild;
    const items = [];
    const walk = (parent) => {
      [...parent.children].forEach((el) => {
        if (el.classList.contains('fitted-artboard') || el.classList.contains('fit-layer')) return;
        if (getComputedStyle(el).display === 'contents') { walk(el); return; }
        items.push(el);
      });
    };
    walk(root);
    [...canvas.children].forEach((el) => {
      if (el === root) return;
      if (getComputedStyle(el).display === 'contents') walk(el); else items.push(el);
    });
    return items;
  }

  function init({ page, canvas, viewport, end }) {
    const keys = PAGES[page];
    const root = canvas?.firstElementChild;
    if (!keys || !root) return;
    const rect = (el) => {
      const box = root.getBoundingClientRect();
      const k = box.width / 1440;
      const r = el.getBoundingClientRect();
      return { x: (r.left - box.left) / k, y: (r.top - box.top) / k, w: r.width / k, h: r.height / k };
    };

    const tops = [HERO_END, ...keys.map((key) => find(canvas, key)).filter(Boolean).map((el) => Math.round(rect(el).y))]
      .sort((a, b) => a - b);
    const sections = tops.map((top) => ({ top, layers: [], items: [], minY: Infinity, maxY: -Infinity }));
    const sectionAt = (y) => {
      if (y < HERO_END) return null;
      for (let i = sections.length - 1; i >= 0; i -= 1) if (y >= sections[i].top) return sections[i];
      return null;
    };

    // A full-width block with text (the stats and packs sections, the Figma
    // services and contact frames) is content, but its own background must
    // still cover the whole width: copy that background to a backdrop that is
    // sized like the other section backgrounds.
    const backdropFor = (el, r) => {
      const style = getComputedStyle(el);
      const hasColor = !/rgba\(0, 0, 0, 0\)|transparent/.test(style.backgroundColor);
      if (style.backgroundImage === 'none' && !hasColor) return null;
      const backdrop = document.createElement('div');
      backdrop.className = 'fit-backdrop';
      Object.assign(backdrop.style, {
        position: 'absolute', left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px`,
        backgroundColor: style.backgroundColor, backgroundImage: style.backgroundImage,
        backgroundSize: style.backgroundSize, backgroundPosition: style.backgroundPosition,
        backgroundRepeat: style.backgroundRepeat, zIndex: style.zIndex, pointerEvents: 'none',
      });
      el.before(backdrop);
      el.style.background = 'transparent';
      return backdrop;
    };
    // Extent of what a block shows: its visible descendants, not its padding.
    const contentRect = (el, r) => {
      let top = Infinity; let bottom = -Infinity;
      el.querySelectorAll('*').forEach((child) => {
        const b = rect(child);
        if (!b.w || !b.h || getComputedStyle(child).visibility === 'hidden') return;
        if (b.w >= 1380 && (child.children.length || !child.textContent.trim())) return;
        if (child.closest('[hidden]')) return;
        top = Math.min(top, b.y); bottom = Math.max(bottom, b.y + b.h);
      });
      return Number.isFinite(top) ? { x: r.x, w: r.w, y: Math.max(r.y, top), h: Math.min(r.y + r.h, bottom) - Math.max(r.y, top) } : r;
    };

    let last = null;
    const place = (el, section, kind) => {
      const pointer = getComputedStyle(el).pointerEvents;
      let layer = last && last.section === section && last.kind === kind && el.previousElementSibling === last.node ? last : null;
      if (!layer) {
        const node = document.createElement('div');
        node.className = `fit-layer fit-layer--${kind}`;
        node.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
        el.before(node);
        layer = { node, kind, section };
        section.layers.push(layer);
      }
      if (pointer !== 'none') el.style.pointerEvents = 'auto';
      layer.node.append(el);
      last = layer;
    };
    collect(canvas).forEach((el) => {
      const r = rect(el);
      const section = sectionAt(r.y + r.h / 2);
      if (!section) return;
      const text = (el.textContent || '').trim();
      const interactive = el.querySelector('a, button, input, textarea, video, iframe');
      if (r.w >= 1380 && !text && !interactive) { place(el, section, 'bg'); return; }
      const kind = r.x <= 4 && r.x + r.w < 1300 ? 'left'
        : r.x + r.w >= 1436 && r.x > 140 ? 'right'
        : 'center';
      const panel = r.w >= 1380;
      if (panel) {
        const backdrop = backdropFor(el, r);
        if (backdrop) place(backdrop, section, 'bg');
      }
      section.items.push({ el, panel });
      place(el, section, kind);
    });

    // Measure what each section shows, with the fitting undone. Done again
    // once fonts and late scripts (contact form fields) have settled.
    const measure = () => {
      sections.forEach((section) => section.layers.forEach(({ node }) => { node.style.transform = ''; }));
      // Entrance and ambient animations move elements for a moment: measure
      // every element at rest, then put the animations back where they were.
      const animations = (document.getAnimations?.() || []).filter((a) => a.effect && a.playState !== 'finished');
      const times = animations.map((a) => a.currentTime);
      animations.forEach((a) => {
        const end = a.effect.getComputedTiming().endTime;
        a.currentTime = Number.isFinite(end) ? end : 0;
      });
      sections.forEach((section) => {
        section.minY = Infinity; section.maxY = -Infinity;
        section.items.forEach(({ el, panel }) => {
          const r = rect(el);
          const box = panel ? contentRect(el, r) : r;
          if (!box.w || box.h <= 0) return;
          section.minY = Math.min(section.minY, box.y);
          section.maxY = Math.max(section.maxY, box.y + box.h);
        });
      });
      animations.forEach((a, i) => { a.currentTime = times[i]; });
    };

    state = { canvas, viewport, end, sections, measure, applied: null };
    measure();
    layout();
    const remeasure = () => { if (state) { state.measure(); layout(); } };
    document.fonts?.ready.then(remeasure);
    window.setTimeout(remeasure, 1500);
  }

  function layout() {
    if (!state) return;
    const { viewport, sections } = state;
    const c = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--canvas-scale')) || (window.innerWidth / 1440);
    const vh = Math.max(1, document.documentElement.clientHeight);
    const header = Math.max(0, document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0);
    const V = vh / c;
    const top = header / c;
    const gap = Math.max(12, vh * 0.025) / c;
    const room = Math.max(1, V - top - 2 * gap);
    const end = state.end();

    let cursor = sections[0].top;
    sections.forEach((section, i) => {
      const a = section.top;
      const b = i + 1 < sections.length ? Math.min(sections[i + 1].top, end) : end;
      if (a >= end) { section.layers.forEach(({ node }) => { node.style.transform = `translateY(${cursor - end}px)`; }); return; }
      const natural = b - a;
      const p = Math.max(a, Number.isFinite(section.minY) ? section.minY : a);
      const q = Math.min(b, Number.isFinite(section.maxY) ? section.maxY : b);
      const h = Math.max(1, q - p);
      // A section that already takes most of a screen gets exactly one screen,
      // with its content between the navbar and the bottom of the screen.
      // Small sections (phones, portrait tablets) keep their natural size.
      const fit = natural > V * 0.75 || h > room + 1;
      const boxHeight = fit ? V : natural;
      const s = fit ? Math.min(1, room / h) : 1;
      const contentTop = fit ? cursor + top + gap + (room - h * s) / 2 : cursor + (p - a);
      section.layers.forEach(({ node, kind }) => {
        if (kind === 'bg') {
          const sb = Math.max(1, boxHeight / natural);
          node.style.transformOrigin = `720px ${a}px`;
          node.style.transform = `translateY(${cursor - a}px) scale(${sb})`;
          node.style.clipPath = fit ? `inset(${a}px -100vw calc(100% - ${a + boxHeight / sb}px) -100vw)` : '';
          return;
        }
        const ox = kind === 'left' ? 0 : kind === 'right' ? 1440 : 720;
        node.style.transformOrigin = `${ox}px ${p}px`;
        node.style.transform = `translateY(${contentTop - p}px) scale(${s})`;
      });
      section.box = { top: cursor, height: boxHeight, scale: s };
      cursor += boxHeight;
    });

    // The runtime sets the page height in updateScale(); take away what the
    // sections lost (or add what they gained). Remember the runtime's value so
    // that a call without a fresh updateScale() does not apply it twice.
    const current = Number.parseFloat(viewport.style.height) || viewport.offsetHeight;
    const base = state.applied && Math.abs(current - state.applied.result) < 0.5 ? state.applied.base : current;
    const result = base - (end - cursor) * c;
    viewport.style.height = `${result}px`;
    state.applied = { base, result };
  }

  // Section boxes in page px (top from the top of the page), for scripts and checks.
  function boxes() {
    if (!state) return [];
    const c = Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--canvas-scale")) || 1;
    const origin = state.canvas.getBoundingClientRect().top + window.scrollY;
    return state.sections.filter((s) => s.box).map((s) => ({ top: origin + s.box.top * c, height: s.box.height * c, scale: s.box.scale }));
  }

  // Page px where the one-screen box holding `el` starts, or null when that
  // section kept its natural size (then scroll to the element as before).
  function screenTop(el) {
    if (!state || !el) return null;
    const r = el.getBoundingClientRect();
    const y = r.top + window.scrollY + Math.min(r.height / 2, 40);
    const box = boxes().find((b) => y >= b.top && y < b.top + b.height);
    return box && Math.abs(box.height - document.documentElement.clientHeight) < 2 ? box.top : null;
  }

  window.WajahniFit = { init, layout, boxes, screenTop };
})();
