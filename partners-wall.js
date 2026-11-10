/* Home partners wall: fills the tiles with the partner logos and, since there
   are more logos than tiles, swaps them in waves of 3D flips that sweep across
   the grid (diagonal, from the centre, then from the other corner). Each wave
   brings the next batch of logos, so every partner shows up in turn.
   The wall pauses only while it is off screen or the tab is hidden (not on
   hover). Logos are preloaded once so no wave waits on the network.
   With reduced motion the logos cross-fade instead. */
(() => {
  const grid = document.querySelector('.pw__grid');
  if (!grid) return;

  const tunisia = Array.from({ length: 55 }, (_, i) => `assets/partners/tunisie-${i + 1}.webp`);
  const world = Array.from({ length: 31 }, (_, i) => `assets/partners/international-${i + 1}.webp`);
  // Spread the international partners evenly among the Tunisian ones so every
  // wave mixes both.
  const deck = [];
  for (let t = 0, w = 0; t < tunisia.length || w < world.length;) {
    if (w < world.length && (t >= tunisia.length || (w + 1) / world.length <= (t + 1) / tunisia.length)) deck.push(world[w++]);
    else deck.push(tunisia[t++]);
  }

  const TILES = 50;
  const HOLD = 800;           // pause between waves (ms)
  const FLIP = 600;           // flip duration, matches the CSS transition
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  const makeImg = src => {
    const img = new Image();
    img.alt = '';
    img.decoding = 'async';
    img.loading = 'lazy';
    img.draggable = false;
    img.src = src;
    return img;
  };

  const tiles = [];
  for (let i = 0; i < TILES; i++) {
    const tile = document.createElement('div');
    tile.className = 'pw-tile';
    tile.dataset.front = 'a';
    tile.innerHTML = '<div class="pw-card"><div class="pw-face pw-face--a"></div><div class="pw-face pw-face--b"></div></div>';
    const card = tile.firstChild;
    const [a, b] = card.children;
    a.append(makeImg(deck[i % deck.length]));
    b.append(makeImg(deck[(i + TILES) % deck.length]));
    tiles.push({ tile, card, a, b, rot: 0 });
    grid.append(tile);
  }

  // Visible tiles depend on the breakpoint (50 / 30 / 15).
  const visibleTiles = () => tiles.filter(t => t.tile.offsetParent !== null);
  const columns = () => parseInt(getComputedStyle(grid.closest('.pw')).getPropertyValue('--pw-cols'), 10) || 10;

  let next = TILES;            // index in the deck of the next logo to show
  let wave = 0;
  let timer = 0;
  let running = false;
  let visible = false;

  const patterns = [
    (r, c) => (r + c) * 30,                                   // top-left to bottom-right
    (r, c, R, C) => Math.hypot(c - (C - 1) / 2, (r - (R - 1) / 2) * 1.4) * 55, // from the centre out
    (r, c, R, C) => (r + (C - 1 - c)) * 30                     // top-right to bottom-left
  ];

  // Download and decode every logo once, as soon as the wall is near, so
  // later waves never wait on the network.
  let warmed = null;
  const warm = () => warmed || (warmed = Promise.all(deck.map(src => {
    const img = new Image();
    img.src = src;
    return img.decode ? img.decode().catch(() => {}) : Promise.resolve();
  })));
  // Wait for this wave's logos, but never longer than a moment.
  const ready = srcs => Promise.race([
    Promise.all(srcs.map(src => { const img = new Image(); img.src = src; return img.decode ? img.decode().catch(() => {}) : 0; })),
    new Promise(r => setTimeout(r, 250))
  ]);

  async function runWave() {
    timer = 0;
    if (!canRun()) { running = false; return; }
    const list = visibleTiles();
    const C = columns();
    const R = Math.ceil(list.length / C);
    const started = performance.now();
    const srcs = list.map((_, i) => deck[(next + i) % deck.length]);
    next = (next + list.length) % deck.length;
    await ready(srcs);
    if (!canRun()) { running = false; return; }

    const delayOf = patterns[wave++ % patterns.length];
    const calm = reduce.matches;
    let longest = 0;
    list.forEach((t, i) => {
      const r = Math.floor(i / C), c = i % C;
      const delay = calm ? i * 25 : Math.round(delayOf(r, c, R, C));
      longest = Math.max(longest, delay);
      // Put the new logo on the hidden face, then turn the card.
      const hidden = t.tile.dataset.front === 'a' ? t.b : t.a;
      hidden.firstChild.src = srcs[i];
      setTimeout(() => {
        t.tile.dataset.front = t.tile.dataset.front === 'a' ? 'b' : 'a';
        if (calm) return;
        t.rot += 180;
        t.card.style.setProperty('--rot', `${t.rot}deg`);
        t.tile.classList.add('is-lit');
        setTimeout(() => t.tile.classList.remove('is-lit'), FLIP);
      }, delay);
    });
    // Keep a steady rhythm: the next wave is timed from this one's start.
    const cycle = longest + FLIP + (calm ? HOLD * 3 : HOLD);
    timer = setTimeout(runWave, Math.max(200, cycle - (performance.now() - started)));
  }

  const canRun = () => visible && !document.hidden;
  function sync() {
    if (canRun() && !running) {
      running = true;
      timer = setTimeout(runWave, wave === 0 ? 600 : 300);
    } else if (!canRun() && running && timer) {
      clearTimeout(timer);
      timer = 0;
      running = false;
    }
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      sync();
    }, { threshold: .15 }).observe(grid);
    // Start downloading the logos a little before the wall scrolls in.
    new IntersectionObserver((entries, io) => {
      if (entries[0].isIntersecting) { warm(); io.disconnect(); }
    }, { rootMargin: '600px 0px' }).observe(grid);
  } else {
    visible = true;
    warm();
  }
  document.addEventListener('visibilitychange', sync);
  sync();
})();
