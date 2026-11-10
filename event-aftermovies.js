// Shared after-movie section for the event pages (Caravan, Edu-Career, Roadshow).
// Replaces the three Figma after-movie cards with real cards. A card that has a
// video plays it inline: autoplay, muted (browsers block autoplay with sound),
// looped, playsinline for iPhone. The frame takes the video's own aspect ratio,
// so a vertical reel is shown upright and whole, never cropped into a 16:9 box.
// Clicking the video opens it large, with sound.
(() => {
  const film = (label, file, width, height) => ({
    label, src: `assets/videos/${file}.mp4`, poster: `assets/videos/${file}-poster.jpg`, width, height
  });
  function rs(label, file, poster) {
    return { label, src: `assets/videos/roadshow-${file}.mp4`, poster: `assets/videos/roadshow-${poster}-poster.jpg`, width: 720, height: 1280 };
  }
  const PAGES = {
    // One after-movie only on Edu-Career (the 2026 edition), centred.
    educareer: {
      name: 'WAJAHNI Edu-Career Summit',
      fallback: 'assets/edu/n237-8280.png',
      films: [film('2026', 'educareer-aftermovie', 360, 640)]
    },
    caravan: {
      name: 'WAJAHNI CARAVAN',
      fallback: 'assets/car/n210-3417.png',
      films: [
        film('TUNIS', 'caravan-tunis-aftermovie', 720, 1280),
        film('SFAX', 'caravan-sfax-aftermovie', 720, 1280),
        film('SOUSSE', 'caravan-sousse-aftermovie', 720, 1280)
      ]
    },
    // Same nine city cards as the Figma page, five then four. Some videos cover
    // two cities: each of those cards plays only its own city's part (start/end
    // in seconds), looped. Cards without their own video show "Bientôt disponible".
    roadshow: {
      name: 'WAJAHNI ROADSHOW',
      fallback: 'assets/rs/n247-11431.png',
      layout: { columns: 5, gap: 28, rowGap: 34, pad: 12, title: 66, font: 16 },
      films: [
        { ...rs('Bizerte', 'nabeul-bizerte', 'bizerte'), start: 30.1 },
        { ...rs('Nabeul', 'nabeul-bizerte', 'nabeul'), end: 30.1 },
        rs('Jendouba', 'jendouba', 'jendouba'),
        { label: 'Monastir' },
        { label: 'Mahdia' },
        { label: 'Kairouan' },
        { ...rs('Gafsa', 'gafsa-gabes', 'gafsa'), start: 27.4 },
        { ...rs('Gabes', 'gafsa-gabes', 'gabes'), end: 27.4 },
        { ...rs('Medenine', 'medenine', 'medenine'), width: 360, height: 640 }
      ]
    }
  };

  // Design px inside the 1440px canvas. Row spans the same 1330px as the Figma cards.
  const ROW = { left: 55, width: 1330, pad: 18, title: 92 };
  const LANDSCAPE = { width: 386, height: 245 };

  const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ICON_MUTED = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16.5 9.5l5 5m0-5l-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';
  const ICON_SOUND = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 010 7M18.5 6a8.5 8.5 0 010 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/></svg>';
  const ICON_EXPAND = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>';

  // Frame size follows the first video's format; with no video, keep the Figma landscape frame.
  function layout(page) {
    const video = page.films.find((film) => film.src);
    const ratio = video ? video.width / video.height : LANDSCAPE.width / LANDSCAPE.height;
    const count = page.films.length;
    if (page.layout?.columns) {
      // Grid of small upright cards (Roadshow: 9 cities), last row centred.
      const { columns, gap, rowGap, pad, title } = page.layout;
      const cardW = (ROW.width - (columns - 1) * gap) / columns;
      const frameW = cardW - pad * 2;
      const frameH = Math.round(frameW / ratio);
      const cardH = frameH + pad * 2 + title;
      const rows = Math.ceil(count / columns);
      return { ratio, frameW, frameH, cardW, cardH, gap, rowGap, pad, title, height: rows * cardH + (rows - 1) * rowGap };
    }
    let frameW;
    if (ratio < 1) frameW = count === 1 ? 380 : 344; // vertical reel: tall cards
    else if (ratio > 1.2) frameW = (ROW.width - (count - 1) * 32) / count - ROW.pad * 2; // landscape
    else frameW = 340;
    const frameH = Math.round(frameW / ratio);
    const cardW = frameW + ROW.pad * 2;
    const cardH = frameH + ROW.pad * 2 + ROW.title;
    const gap = count > 1 ? (ROW.width - cardW * count) / (count - 1) : 0; // one card: centred by CSS
    return { ratio, frameW, frameH, cardW, cardH, gap, rowGap: 0, pad: ROW.pad, title: ROW.title, height: cardH };
  }

  function renderCard(page, film) {
    const title = `<b>${esc(page.name)} <span>${esc(film.label)}</span></b>`;
    const media = film.src
      ? `<video class="event-films__video" muted loop playsinline preload="none" poster="${esc(film.poster || '')}" aria-label="Aftermovie ${esc(page.name)} ${esc(film.label)}">
           <source src="${esc(film.src)}" type="video/mp4">
         </video>
         <button class="event-films__open" type="button" aria-label="Regarder l’aftermovie ${esc(film.label)} en grand, avec le son"></button>
         <button class="event-films__sound" type="button" aria-pressed="false" aria-label="Activer le son">${ICON_MUTED}</button>
         <span class="event-films__expand" aria-hidden="true">${ICON_EXPAND}</span>`
      : `<img class="event-films__img" src="${esc(film.image || page.fallback)}" alt="">
         <span class="event-films__soon">Bientôt disponible</span>`;
    return `<article class="event-films__card${film.src ? ' has-video' : ''}">
      <div class="event-films__frame">${media}</div>
      <h3 class="event-films__title">${title}</h3>
    </article>`;
  }

  let lightbox;
  function openLightbox(film, inline) {
    if (!lightbox) {
      lightbox = document.createElement('div');
      lightbox.className = 'event-films-lightbox';
      lightbox.setAttribute('role', 'dialog');
      lightbox.setAttribute('aria-modal', 'true');
      lightbox.innerHTML = `<button class="event-films-lightbox__close" type="button" aria-label="Fermer">×</button><video class="event-films-lightbox__video" controls playsinline loop></video>`;
      document.body.append(lightbox);
      const close = () => {
        const video = lightbox.querySelector('video');
        video.pause();
        lightbox.classList.remove('is-open');
        document.documentElement.style.overflow = '';
        lightbox.returnTo?.play().catch(() => {});
        lightbox.returnFocus?.focus({ preventScroll: true });
      };
      lightbox.close = close;
      lightbox.addEventListener('click', (event) => { if (event.target === lightbox) close(); });
      lightbox.querySelector('.event-films-lightbox__close').addEventListener('click', close);
      document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && lightbox.classList.contains('is-open')) close(); });
    }
    const video = lightbox.querySelector('video');
    lightbox.style.setProperty('--film-ratio', `${film.width} / ${film.height}`);
    if (video.getAttribute('src') !== film.src) video.src = film.src;
    video.poster = film.poster || '';
    video.currentTime = inline.currentTime || 0;
    video.muted = false;
    lightbox.returnTo = inline;
    lightbox.returnFocus = document.activeElement;
    inline.pause();
    lightbox.classList.add('is-open');
    document.documentElement.style.overflow = 'hidden';
    video.play().catch(() => { video.muted = true; video.play().catch(() => {}); });
    lightbox.querySelector('.event-films-lightbox__close').focus({ preventScroll: true });
  }

  // options: { page, parent, top, remove: [node ids] } → returns the section height (design px)
  function mount({ page: pageName, parent, top, remove = [] }) {
    const page = PAGES[pageName];
    if (!page || !parent) return null;
    remove.forEach((id) => document.querySelector(`#figma-canvas [data-node-id="${id}"]`)?.remove());
    document.querySelector('#aftermovies')?.remove();
    const size = layout(page);
    const section = document.createElement('section');
    section.id = 'aftermovies';
    section.className = `event-films ${size.ratio < 1 ? 'is-portrait' : 'is-landscape'}${page.films.length === 1 ? ' is-single' : ''}${page.layout?.columns ? ' is-grid' : ''}`;
    section.setAttribute('aria-label', 'Aftermovies');
    Object.assign(section.style, {
      top: `${top}px`, left: `${ROW.left}px`, width: `${ROW.width}px`, height: `${size.height}px`
    });
    Object.entries({ '--film-card-w': size.cardW, '--film-frame-w': size.frameW, '--film-frame-h': size.frameH, '--film-gap': size.gap, '--film-row-gap': size.rowGap, '--film-pad': size.pad, '--film-title-h': size.title, '--film-title-size': page.layout?.font || 20 })
      .forEach(([key, value]) => section.style.setProperty(key, `${value}px`));
    section.innerHTML = page.films.map((film) => renderCard(page, film)).join('');
    parent.append(section);

    section.querySelectorAll('.event-films__card.has-video').forEach((card, index) => {
      const film = page.films.filter((item) => item.src)[index];
      const video = card.querySelector('video');
      const sound = card.querySelector('.event-films__sound');
      video.muted = true; // the property, not only the attribute, is what allows autoplay
      // Two-city videos: keep this card on its own city's part of the video.
      if (film.start || film.end) {
        const start = film.start || 0;
        video.addEventListener('loadedmetadata', () => { video.currentTime = start; });
        video.addEventListener('timeupdate', () => {
          const end = film.end || video.duration;
          if (video.currentTime >= end - .08 || video.currentTime < start - .5) video.currentTime = start;
        });
      }
      const play = () => video.play().catch(() => {});
      // Starts by itself as soon as it is on screen and pauses when scrolled
      // away, so the videos below the fold are not downloaded with the page.
      new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (lightbox?.classList.contains('is-open')) return;
        if (entry.isIntersecting) play(); else video.pause();
      }), { threshold: .2 }).observe(video);
      sound.addEventListener('click', (event) => {
        event.stopPropagation();
        video.muted = !video.muted;
        if (!video.muted) play();
        sound.setAttribute('aria-pressed', String(!video.muted));
        sound.setAttribute('aria-label', video.muted ? 'Activer le son' : 'Couper le son');
        sound.innerHTML = video.muted ? ICON_MUTED : ICON_SOUND;
      });
      card.querySelector('.event-films__open').addEventListener('click', () => openLightbox(film, video));
    });
    return size.height;
  }

  const topOf = (element) => {
    const inline = Number.parseFloat(element.style.top || '');
    if (!Number.isNaN(inline)) return inline;
    const match = String(element.className).match(/top-\[(-?[\d.]+)px\]/);
    return match ? Number.parseFloat(match[1]) : null;
  };
  // Cards taller than the Figma ones: move every layer that starts at or below
  // `from` down by `growth` and stretch the section background over the gap.
  function pushBelow({ containers, from, growth, background }) {
    if (!growth) return;
    const seen = new Set();
    containers.filter(Boolean).forEach((container) => [...container.children].forEach((element) => {
      if (seen.has(element) || element.id === 'aftermovies' || element.contains(document.querySelector('#aftermovies'))) return;
      seen.add(element);
      const top = topOf(element);
      if (top !== null && top >= from) element.style.top = `${top + growth}px`;
    }));
    const bg = background && document.querySelector(`#figma-canvas [data-node-id="${background}"]`);
    if (bg) bg.style.height = `${bg.offsetHeight + growth}px`;
  }

  window.WajahniAftermovies = { mount, pushBelow, PAGES };
})();
