/* Home "Ils partagent leur expérience avec WAJAHNI" testimonials.
   Fills the two carousels (large quote cards, then compact "other partners"
   cards) from the lists below and wires their arrows. The arrows move one
   card at a time and wrap around at the ends; the tracks also scroll by
   swipe, trackpad and keyboard (scroll snapping keeps cards aligned).

   To change the content, edit TESTIMONIALS and OTHERS only.
   NOTE: these entries are placeholders (the one testimonial already on the
   site, repeated) until the real ones from b2b.wajahni.tn are added. */
(() => {
  const DIR = 'assets/home/testimonials/';

  const TESTIMONIALS = Array.from({ length: 6 }, () => ({
    name: 'Mme. Ghosn ennaem',
    role: 'Directrice d’admission',
    org: 'GFI University',
    logo: DIR + 'gfi-university.webp',
    photo: DIR + 'ghosn-ennaem.webp',
    quote: 'C’est notre deuxième participation à WAJAHNI et je dois avouer être agréablement surprise par l’évolution continue de l’événement, d’autant plus que l’équipe est exclusivement composée de jeunes. C’est un excellent départ pour un début prometteur.',
  }));

  const OTHERS = Array.from({ length: 6 }, () => ({
    name: 'Mme. Ghosn ennaem',
    role: 'Directrice d’admission',
    photo: DIR + 'ghosn-ennaem.webp',
  }));

  const CHAT = DIR + 'chat.webp';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const main = document.getElementById('tm-main');
  const others = document.getElementById('tm-others');
  if (!main || !others) return;

  main.innerHTML = TESTIMONIALS.map((t, i) => `
    <article class="tm-card" aria-roledescription="témoignage" aria-label="${i + 1} sur ${TESTIMONIALS.length}">
      <div class="tm-card__top">
        <img class="tm-card__chat" src="${CHAT}" alt="" width="160" height="139" loading="lazy">
        ${t.logo ? `<img class="tm-card__logo" src="${esc(t.logo)}" alt="${esc(t.org || '')}" loading="lazy">` : ''}
      </div>
      <div class="tm-card__person">
        <img class="tm-card__photo" src="${esc(t.photo)}" alt="" width="240" height="240" loading="lazy">
        <div><h3 class="tm-card__name">${esc(t.name)}</h3><p class="tm-card__role">${esc(t.role)}</p></div>
      </div>
      <blockquote class="tm-card__quote">“${esc(t.quote)}”</blockquote>
    </article>`).join('');

  others.innerHTML = OTHERS.map(o => `
    <article class="tm-mini">
      <img class="tm-mini__photo" src="${esc(o.photo)}" alt="" width="240" height="240" loading="lazy">
      <div class="tm-mini__text"><h3 class="tm-mini__name">${esc(o.name)}</h3><p class="tm-mini__role">${esc(o.role)}</p></div>
      <img class="tm-mini__chat" src="${CHAT}" alt="" width="160" height="139" loading="lazy">
    </article>`).join('');

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('.tm__carousel').forEach(carousel => {
    const track = carousel.querySelector('.tm__track');
    const step = () => {
      const cards = track.children;
      if (cards.length < 2) return track.clientWidth;
      return cards[1].offsetLeft - cards[0].offsetLeft;
    };
    const go = dir => {
      const max = track.scrollWidth - track.clientWidth;
      let left = track.scrollLeft + dir * step();
      // Wrap around at either end.
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
