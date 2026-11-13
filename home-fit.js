// One screen per section on the Accueil page (home.html).
//
// On a laptop or desktop screen, every section under the hero gets a box
// exactly one screen tall and the full window width. If its content is taller
// than the space between the navbar and the bottom of the screen, the content
// is scaled down until all of it fits; nothing is cut. Backgrounds keep
// covering the whole box. Phones and portrait tablets are left as they are:
// there the sections stack in one column and shrinking them to one screen
// would make the text too small to read.
(() => {
  const MIN_WIDTH = 1024;
  const sections = [];

  // The element that holds a section's content: its artwork "stage" when it
  // has one (chiffres, partners, testimonials, influencers), else the section.
  const holderOf = (section) => {
    const only = section.children.length === 1 ? section.firstElementChild : null;
    return only && /__stage\b/.test(only.className) ? only : section;
  };
  const isBackground = (el, holder) => {
    if (/__bg\b/.test(el.className)) return true;
    if (el.textContent.trim() || el.querySelector('a, button, input, video, iframe')) return false;
    const a = el.getBoundingClientRect(); const b = holder.getBoundingClientRect();
    return getComputedStyle(el).position === 'absolute' && a.width >= b.width * 0.95 && a.height >= b.height * 0.9;
  };

  function setup() {
    document.querySelectorAll('main > section').forEach((section, index) => {
      if (index === 0 || section.classList.contains('hero')) return;
      const holder = holderOf(section);
      const wrap = document.createElement('div');
      wrap.className = 'home-fit';
      // Until the fit applies (phones), the wrapper adds no box at all.
      wrap.style.display = 'contents';
      const content = [...holder.children].filter((el) => !isBackground(el, holder));
      if (!content.length) return;
      content[0].before(wrap);
      content.forEach((el) => wrap.append(el));
      sections.push({ section, holder, wrap });
    });
  }

  // Top and bottom of what the wrapper shows, relative to the wrapper.
  function extent({ wrap }) {
    const base = wrap.getBoundingClientRect().top;
    let top = Infinity; let bottom = -Infinity;
    wrap.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const style = getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none') return;
      top = Math.min(top, r.top - base); bottom = Math.max(bottom, r.bottom - base);
    });
    return Number.isFinite(top) ? [top, bottom] : null;
  }

  function layout() {
    if (!sections.length) return;
    // Measure every section at rest: undo the fit and park running animations.
    sections.forEach(({ section, holder, wrap }) => {
      section.style.height = ''; section.style.overflow = '';
      holder.style.height = '';
      wrap.style.cssText = 'display:contents;';
    });
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    if (vw < MIN_WIDTH || vw <= vh) return;
    // On wide screens the artwork stages place their content absolutely, so
    // the wrapper takes the stage's whole box; other sections keep their flow.
    sections.forEach(({ section, holder, wrap }) => {
      wrap.style.cssText = holder !== section ? 'position:absolute;inset:0;' : 'position:relative;';
    });
    const animations = (document.getAnimations?.() || []).filter((a) => a.effect && a.playState !== 'finished');
    const times = animations.map((a) => a.currentTime);
    animations.forEach((a) => {
      const end = a.effect.getComputedTiming().endTime;
      a.currentTime = Number.isFinite(end) ? end : 0;
    });
    const header = Math.max(0, document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0);
    const gap = Math.max(12, vh * 0.025);
    const room = Math.max(1, vh - header - 2 * gap);
    const plans = sections.map((entry) => ({ entry, box: extent(entry), offset: entry.wrap.getBoundingClientRect().top - entry.section.getBoundingClientRect().top }));
    animations.forEach((a, i) => { a.currentTime = times[i]; });

    plans.forEach(({ entry: { section, holder, wrap }, box, offset }) => {
      if (!box) return;
      const [top, bottom] = box;
      const h = Math.max(1, bottom - top);
      const s = Math.min(1, room / h);
      const target = header + gap + (room - h * s) / 2;
      section.style.height = `${vh}px`;
      section.style.overflow = 'hidden';
      if (holder !== section) holder.style.height = '100%';
      wrap.style.transformOrigin = `50% ${top}px`;
      wrap.style.transform = `translateY(${target - offset - top}px) scale(${s})`;
    });
  }

  function start() {
    setup();
    layout();
    let timer = 0;
    window.addEventListener('resize', () => { window.clearTimeout(timer); timer = window.setTimeout(layout, 120); }, { passive: true });
    document.fonts?.ready.then(layout);
    window.setTimeout(layout, 1500);
  }

  window.HomeFit = { layout };
  if (document.readyState === 'complete') start(); else window.addEventListener('load', start, { once: true });
})();
