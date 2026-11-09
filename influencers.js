/* Home "Influenceurs & partenaires médiatiques" section (under the partner
   testimonials). Same layout as the testimonials section: a carousel of large
   influencer cards, then a carousel of compact media partner cards.
   The arrows move one card at a time and wrap around at the ends; the tracks
   also scroll by swipe, trackpad and keyboard.
   To change the content, edit INFLUENCERS and MEDIA only. */
(() => {
  const DIR = 'assets/home/influencers/';

  // Influencers ("NOS INFLUENCEUR") and their Instagram accounts, copied from
  // https://b2b.wajahni.tn/home-2/. The two Khormologia cards are named after
  // the people in their photos (from the site's image descriptions).
  // Walid Bouheni's photo on the site is a Facebook link that no longer
  // loads, so his card shows his initials. photo null = initials.
  const INFLUENCERS = [
    { name: 'Samy Chaffai', ig: 'samy.chaffai', photo: 'samy-chaffai.webp' },
    { name: 'Skander', ig: 'khormologia', photo: 'skander-khormologia.webp' },
    { name: 'Fatma Bououn', ig: 'fatma.bououn', photo: 'fatma-bououn.webp' },
    { name: 'Hamdi Hadda', ig: 'hamdi_hadda', photo: 'hamdi-hadda.webp' },
    { name: 'Nourchene Cheguenni', ig: 'nourchenne_cheguenni', photo: 'nourchene-cheguenni.webp' },
    { name: 'Rayen Bouajaja', ig: 'khormologia', photo: 'rayen-bouajaja-khormologia.webp' },
    { name: 'Lina Toumi', ig: 'toumi_lina', photo: 'lina-toumi.webp' },
    { name: 'Khouloud Moalla', ig: 'moalla_khouloud', photo: 'khouloud-moalla.webp' },
    { name: 'Hamza Belloumi', ig: 'hamza_belloumi', photo: 'hamza-belloumi.webp' },
    { name: 'Yoldez Atitallah', ig: 'yoldezly', photo: 'yoldez-atitallah.webp' },
    { name: 'Abir Abdelmalek', ig: 'abir_abdelmalek_', photo: 'abir-abdelmalek.webp' },
    { name: 'Emna Naili', ig: 'emna_naili_', photo: 'emna-naili.webp' },
    { name: 'Jihen Miled', ig: 'jihenemiled', photo: 'jihen-miled.webp' },
    { name: 'Walid Bouheni', ig: 'walid_bouheni', photo: null },
    { name: 'Rayhane Dhaoadi', ig: 'rayhanettee', photo: 'rayhane-dhaoadi.webp' },
    { name: 'Raja Jomni', ig: 'jomniraja', photo: 'raja-jomni.webp' },
  ];

  // Media partners ("NOS PARTENAIRES MÉDIATIQUES"), logos from the same page.
  const MEDIA = [
    { name: 'Mosaïque FM', kind: 'Radio', logo: 'logo-mosaique-fm.webp' },
    { name: 'El Wataniya 1', kind: 'Télévision', logo: 'logo-el-wataniya-1.webp' },
    { name: 'Diwan FM', kind: 'Radio', logo: 'logo-diwan-fm.webp' },
    { name: 'Express FM', kind: 'Radio', logo: 'logo-express-fm.webp' },
    { name: 'Carthage+', kind: 'Télévision', logo: 'logo-carthage-plus.webp' },
    { name: 'IFM', kind: 'Radio', logo: 'logo-ifm.webp' },
    { name: 'Jawhara FM', kind: 'Radio', logo: 'logo-jawhara-fm.webp' },
    { name: 'Al Janoubiya TV', kind: 'Télévision', logo: 'logo-al-janoubiya-tv.webp' },
    { name: 'Knooz FM', kind: 'Radio', logo: 'logo-knooz-fm.webp' },
    { name: 'Telvza TV', kind: 'Télévision', logo: 'logo-telvza-tv.webp' },
    { name: 'Managers', kind: 'Magazine', logo: 'logo-managers.webp' },
  ];

  // The gradient is defined once (IG_DEFS) and shared by every icon.
  const IG_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><linearGradient id="im-ig-grad" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#f9a23b"/><stop offset=".5" stop-color="#ee2a7b"/><stop offset="1" stop-color="#6228d7"/></linearGradient></defs></svg>`;
  const IG_ICON = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="url(#im-ig-grad)"/><rect x="6" y="6" width="12" height="12" rx="3.6" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="12" cy="12" r="2.9" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="16.6" cy="7.4" r="1.05" fill="#fff"/></svg>`;

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const initials = name => name.split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const main = document.getElementById('im-main');
  const others = document.getElementById('im-others');
  if (!main || !others) return;

  main.insertAdjacentHTML('beforebegin', IG_DEFS);
  main.innerHTML = INFLUENCERS.map((p, i) => {
    const url = `https://www.instagram.com/${encodeURIComponent(p.ig)}/`;
    return `
    <article class="im-card" aria-roledescription="influenceur" aria-label="${i + 1} sur ${INFLUENCERS.length} : ${esc(p.name)}">
      <div class="im-card__top">
        <span class="im-card__ig">${IG_ICON}</span>
        <span class="im-card__tag">Instagram</span>
      </div>
      <a class="im-card__media" href="${url}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">
        ${p.photo
          ? `<img class="im-card__photo" src="${DIR + esc(p.photo)}" alt="" width="480" height="480" loading="lazy">`
          : `<span class="im-card__initials">${esc(initials(p.name))}</span>`}
      </a>
      <div class="im-card__person">
        <div class="im-card__who"><h3 class="im-card__name">${esc(p.name)}</h3><p class="im-card__handle">@${esc(p.ig)}</p></div>
        <a class="im-card__follow" href="${url}" target="_blank" rel="noopener" aria-label="Voir le profil Instagram de ${esc(p.name)}">Voir le profil</a>
      </div>
    </article>`;
  }).join('');

  others.innerHTML = MEDIA.map(m => `
    <div class="im-mini">
      <span class="im-mini__logo"><img src="${DIR + esc(m.logo)}" alt="" loading="lazy"></span>
      <span class="im-mini__text"><span class="im-mini__name">${esc(m.name)}</span><span class="im-mini__kind">${esc(m.kind)}</span></span>
    </div>`).join('');

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  main.closest('.im').querySelectorAll('.tm__carousel').forEach(carousel => {
    const track = carousel.querySelector('.tm__track');
    const step = () => {
      const cards = track.children;
      return cards.length < 2 ? track.clientWidth : cards[1].offsetLeft - cards[0].offsetLeft;
    };
    const go = dir => {
      const max = track.scrollWidth - track.clientWidth;
      let left = track.scrollLeft + dir * step();
      if (dir > 0 && track.scrollLeft >= max - 2) left = 0;
      else if (dir < 0 && track.scrollLeft <= 2) left = max;
      track.scrollTo({ left, behavior: reduce.matches ? 'auto' : 'smooth' });
    };
    carousel.querySelector('.tm__arrow--prev').addEventListener('click', () => go(-1));
    carousel.querySelector('.tm__arrow--next').addEventListener('click', () => go(1));
    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    });
  });
})();
