// Shared after-movie section for the event pages (Caravan, Edu-Career, Roadshow).
// Replaces the three Figma after-movie cards with real cards. A card that has a
// video plays it inline: autoplay, muted (browsers block autoplay with sound),
// looped, playsinline for iPhone. The frame takes the video's own aspect ratio,
// so a vertical reel is shown upright and whole, never cropped into a 16:9 box.
// Clicking the video opens it large, with sound.
(() => {
  const PAGES = {
    educareer: {
      name: 'WAJAHNI Edu-Career Summit',
      fallback: 'assets/edu/n237-8280.png',
      films: [
        { label: '2024' },
        { label: '2025' },
        {
          label: '2026',
          src: 'assets/videos/educareer-aftermovie.mp4',
          poster: 'assets/videos/educareer-aftermovie-poster.jpg',
          width: 360,
          height: 640
        }
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
    let frameW;
    if (ratio < 1) frameW = 344; // vertical reel: tall cards, one row of three
    else if (ratio > 1.2) frameW = (ROW.width - (count - 1) * 32) / count - ROW.pad * 2; // landscape
    else frameW = 340;
    const frameH = Math.round(frameW / ratio);
    const cardW = frameW + ROW.pad * 2;
    const cardH = frameH + ROW.pad * 2 + ROW.title;
    const gap = count > 1 ? (ROW.width - cardW * count) / (count - 1) : 0;
    return { ratio, frameW, frameH, cardW, cardH, gap };
  }

  function renderCard(page, film) {
    const title = `<b>${esc(page.name)} <span>${esc(film.label)}</span></b>`;
    const media = film.src
      ? `<video class="event-films__video" muted loop playsinline autoplay preload="auto" poster="${esc(film.poster || '')}" aria-label="Aftermovie ${esc(page.name)} ${esc(film.label)}">
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
    section.className = `event-films ${size.ratio < 1 ? 'is-portrait' : 'is-landscape'}`;
    section.setAttribute('aria-label', 'Aftermovies');
    Object.assign(section.style, {
      top: `${top}px`, left: `${ROW.left}px`, width: `${ROW.width}px`, height: `${size.cardH}px`
    });
    Object.entries({ '--film-card-w': size.cardW, '--film-frame-w': size.frameW, '--film-frame-h': size.frameH, '--film-gap': size.gap, '--film-pad': ROW.pad })
      .forEach(([key, value]) => section.style.setProperty(key, `${value}px`));
    section.innerHTML = page.films.map((film) => renderCard(page, film)).join('');
    parent.append(section);

    section.querySelectorAll('.event-films__card.has-video').forEach((card, index) => {
      const film = page.films.filter((item) => item.src)[index];
      const video = card.querySelector('video');
      const sound = card.querySelector('.event-films__sound');
      video.muted = true; // the property, not only the attribute, is what allows autoplay
      const play = () => video.play().catch(() => {});
      // Play while on screen, pause when scrolled away (saves battery on phones).
      new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (lightbox?.classList.contains('is-open')) return;
        if (entry.isIntersecting) play(); else video.pause();
      }), { threshold: .2 }).observe(video);
      play();
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
    return size.cardH;
  }

  window.WajahniAftermovies = { mount, PAGES };
})();
