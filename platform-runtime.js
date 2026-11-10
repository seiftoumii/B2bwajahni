// WAJAHNI Platform page (Nov 2026).
// The 19 presentation slides used to be stacked full width, one under the
// other, each taller than the screen. They are now grouped into 5 chapters.
// Each chapter is one screen: a menu of its slides on the left, and one
// slide at a time on the right, sized to fit the screen. Styles: platform-chapters.css.
(() => {
  const slide = (n, title) => ({ src: `assets/platform/slides/slide-${String(n).padStart(2, '0')}.jpg`, title });
  const chapters = [
    {
      id: 'pourquoi', kicker: 'Pourquoi WAJAHNI', title: 'L’orientation en Tunisie : un enjeu national',
      slides: [
        slide(2, 'La plateforme N°1 des institutions'),
        slide(3, 'L’orientation, un enjeu national'),
        slide(4, 'Pourquoi WAJAHNI est essentiel'),
        slide(5, 'Être présent là où les étudiants cherchent'),
        slide(6, 'Le point d’entrée de l’orientation'),
      ],
    },
    {
      id: 'plateforme', kicker: 'La plateforme', title: 'La première plateforme d’orientation académique et professionnelle en Tunisie',
      slides: [
        slide(7, 'Qu’est-ce que WAJAHNI Platform ?'),
        slide(8, 'Ce que vous pouvez accomplir'),
        slide(9, 'Fonctionnalités & capacités'),
      ],
    },
    {
      id: 'fonctionnalites', kicker: 'Fonctionnalités', title: 'Votre espace dédié pour piloter votre présence',
      slides: [
        slide(10, 'Tableau de bord partenaire'),
        slide(11, 'Page institution'),
        slide(12, 'Pages programmes & formations'),
        slide(13, 'Contenus & mises à jour'),
        slide(14, 'Prospects & contacts'),
        slide(15, 'Simple, accompagnée & sécurisée'),
        slide(16, 'Recherche, filtres & découverte'),
      ],
    },
    {
      id: 'tarifs', kicker: 'Tarifs', title: 'Une tarification juste, accessible et stratégique',
      slides: [
        slide(17, 'Notre logique tarifaire'),
        slide(18, 'Universités & écoles de formation pro'),
        slide(19, 'Centres de langue & de formation'),
      ],
    },
    {
      id: 'rejoindre', kicker: 'Rejoindre WAJAHNI', title: 'Les premiers à nous rejoindre prennent une longueur d’avance',
      slides: [slide(20, 'Pourquoi nous rejoindre maintenant ?')],
      cta: true,
    },
  ];

  const root = document.querySelector('#platform-chapters');
  const loader = document.querySelector('.platform-loader');
  const ready = () => loader && loader.classList.add('is-ready');
  const heroImage = document.querySelector('.ph__bg');
  if (heroImage) {
    if (heroImage.complete) ready();
    heroImage.addEventListener('load', ready, { once: true });
    heroImage.addEventListener('error', ready, { once: true });
  }
  window.setTimeout(ready, 4500);
  if (!root) return;

  const esc = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  root.innerHTML = chapters.map((chapter, c) => {
    const num = String(c + 1).padStart(2, '0');
    const many = chapter.slides.length > 1;
    return `
    <section class="pc${c % 2 ? ' pc--tint' : ''}" id="${chapter.id}" aria-labelledby="pc-title-${c}" data-chapter>
      <div class="pc__side">
        <p class="pc__kicker"><span>${num}</span>${esc(chapter.kicker)}</p>
        <h2 class="pc__title" id="pc-title-${c}">${esc(chapter.title)}</h2>
        ${many ? `<ol class="pc__menu" role="tablist" aria-label="${esc(chapter.kicker)}">
          ${chapter.slides.map((s, i) => `<li role="presentation"><button type="button" role="tab" id="pc-tab-${c}-${i}" aria-controls="pc-stage-${c}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-index="${i}"><b>${String(i + 1).padStart(2, '0')}</b><span>${esc(s.title)}</span></button></li>`).join('')}
        </ol>` : ''}
        ${chapter.cta ? `<a class="pc__cta" href="mailto:contact@wajahni.tn?subject=${encodeURIComponent('WAJAHNI Platform')}">Devenir partenaire <span aria-hidden="true">→</span></a>` : ''}
      </div>
      <div class="pc__main">
        <figure class="pc__stage" id="pc-stage-${c}" ${many ? `role="tabpanel" aria-labelledby="pc-tab-${c}-0"` : ''}>
          ${chapter.slides.map((s, i) => `<img src="${s.src}" alt="${esc(s.title)}" decoding="async" loading="${c === 0 && i === 0 ? 'eager' : 'lazy'}" class="${i === 0 ? 'is-on' : ''}" data-index="${i}">`).join('')}
          <button class="pc__zoom" type="button" aria-label="Agrandir la diapositive"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>
        </figure>
        ${many ? `<div class="pc__nav">
          <button class="pc__arrow" type="button" data-step="-1" aria-label="Diapositive précédente">←</button>
          <span class="pc__count" aria-live="polite"><b>1</b> / ${chapter.slides.length}</span>
          <span class="pc__bar" aria-hidden="true"><i style="width:${100 / chapter.slides.length}%"></i></span>
          <button class="pc__arrow" type="button" data-step="1" aria-label="Diapositive suivante">→</button>
        </div>` : ''}
      </div>
    </section>`;
  }).join('');

  // Full-size view of the current slide.
  const lightbox = document.createElement('dialog');
  lightbox.className = 'pc-lightbox';
  lightbox.innerHTML = '<button type="button" class="pc-lightbox__close" aria-label="Fermer">×</button><img alt="">';
  document.body.append(lightbox);
  const lbImg = lightbox.querySelector('img');
  lightbox.querySelector('button').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });

  root.querySelectorAll('[data-chapter]').forEach((section) => {
    const tabs = [...section.querySelectorAll('[role="tab"]')];
    const images = [...section.querySelectorAll('.pc__stage img')];
    const stage = section.querySelector('.pc__stage');
    const count = section.querySelector('.pc__count b');
    const bar = section.querySelector('.pc__bar i');
    let current = 0;

    function go(index, focus = false) {
      const next = (index + images.length) % images.length;
      if (next === current) return;
      images[current].classList.remove('is-on');
      images[next].classList.add('is-on');
      images[(next + 1) % images.length].loading = 'eager';
      tabs.forEach((tab, i) => {
        tab.setAttribute('aria-selected', String(i === next));
        tab.tabIndex = i === next ? 0 : -1;
      });
      if (tabs[next]) stage.setAttribute('aria-labelledby', tabs[next].id);
      if (focus && tabs[next]) tabs[next].focus();
      if (count) count.textContent = String(next + 1);
      if (bar) bar.style.width = `${((next + 1) / images.length) * 100}%`;
      const menu = section.querySelector('.pc__menu');
      if (menu && tabs[next] && menu.scrollWidth > menu.clientWidth) {
        menu.scrollTo({ left: tabs[next].offsetLeft - 20, behavior: 'smooth' });
      }
      current = next;
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => go(i));
      tab.addEventListener('keydown', (event) => {
        const keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
        if (keys[event.key]) { event.preventDefault(); go(current + keys[event.key], true); }
        if (event.key === 'Home') { event.preventDefault(); go(0, true); }
        if (event.key === 'End') { event.preventDefault(); go(images.length - 1, true); }
      });
    });
    section.querySelectorAll('.pc__arrow').forEach((arrow) => arrow.addEventListener('click', () => go(current + Number(arrow.dataset.step))));

    // Swipe between slides on touch screens.
    let startX = null;
    stage.addEventListener('touchstart', (event) => { startX = event.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', (event) => {
      if (startX === null || images.length < 2) return;
      const dx = event.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) go(current + (dx < 0 ? 1 : -1));
      startX = null;
    });

    const open = () => {
      lbImg.src = images[current].src;
      lbImg.alt = images[current].alt;
      lightbox.showModal();
    };
    section.querySelector('.pc__zoom').addEventListener('click', open);
    images.forEach((img) => img.addEventListener('click', open));
  });
})();
