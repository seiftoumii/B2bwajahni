/* Home "Ils partagent leur expérience avec WAJAHNI" testimonials.
   Fills the two carousels (large quote cards, then compact "other partners"
   cards) from the lists below and wires their arrows. The arrows move one
   card at a time and wrap around at the ends; the tracks also scroll by
   swipe, trackpad and keyboard (scroll snapping keeps cards aligned).

   The compact cards list the same partners; clicking one brings that
   partner's testimonial into view in the large carousel.
   To change the content, edit TESTIMONIALS only. */
(() => {
  const DIR = 'assets/home/testimonials/';

  // Partner testimonials, copied from https://b2b.wajahni.tn/home-2/.
  // The site gives each person's organisation but no job title, so the card
  // shows the organisation under the name. Logo null = organisation name.
  const TESTIMONIALS = [
    { name: "Malik Hichri", org: "EBS", logo: "logo-ebs.webp", photo: "malik-hichri-ebs.webp",
      quote: "En trois mots, le salon WAJAHNI : Organisation : Très bien organisé Qualité : Des étudiants de haute qualité Convivialité : Une atmosphère très conviviale et dynamique" },
    { name: "Jouda Sfaxi", org: "EIGHT University", logo: null, photo: "jouda-sfaxi-eight-university.webp",
      quote: "Nous sommes vraiment ravis de participer à WAJAHNI, car c’est une occasion unique de faire connaître notre université ainsi que les parcours que nous proposons. Cette rencontre est véritablement enrichissante, conviviale, riche et incontournable." },
    { name: "Jihen Boubakri", org: "ULT", logo: null, photo: "jihen-boubakri-ult.webp",
      quote: "Je n’avais jamais visité un tel événement auparavant. Nous apprécions vraiment la manière dont il a été organisé, et pratiquement, nous avons trouvé exactement ce que nous cherchions." },
    { name: "Elyes Mdimegh", org: "SEASAM", logo: null, photo: "elyes-mdimegh-seasam.webp",
      quote: "Il y a une diversité de public cible, ce qui est bien pour nous, vu qu’on s’oriente vers tous ces cibles : bacheliers, licenciés, master, reconversion" },
    { name: "Khalil Zahmoul", org: "Horizon School", logo: "logo-horizon-school.webp", photo: "khalil-zahmoul-horizon-school.webp",
      quote: "Je trouve qu’il y a une diversité de calibres remarquable parmi les étudiants présents. Merci pour la qualité de l’organisation, c’est une bonne opportunité pour établir des contacts et se rapprocher des bacheliers." },
    { name: "Mohamed Aziz Azzebi", org: "Université Centrale", logo: "logo-universite-centrale.webp", photo: "mohamed-aziz-azzebi-universite-centrale.webp",
      quote: "Wajahni est un excellent événement qui a offert à notre institution l’opportunité de se connecter directement avec les jeunes, d’une manière qui était auparavant impossible à réaliser par d’autres outils de communication ou de recrutement." },
    { name: "Jihen Redissi", org: "UTC", logo: "logo-utc.webp", photo: "jihen-redissi-utc.webp",
      quote: "Wajahni est une belle organisation, une occasion et une opportunité pour que les étudiants ainsi que leurs parents se réunissent avec les universités au même endroit pour répondre à leurs questions, les orienter et les accompagner afin de faire le bon choix et lever leur incertitude." },
    { name: "Ghosn Ennaem", org: "GFI University", logo: "gfi-university.webp", photo: "ghosn-ennaem-gfi.webp",
      quote: "C’est notre deuxième participation à WAJAHNI et je dois avouer être agréablement surprise par l’évolution continue de l’événement, d’autant plus que l’équipe est exclusivement composée de jeunes. C’est un excellent départ pour un début prometteur." },
    { name: "Mariem Maater", org: "IIT Sfax", logo: null, photo: "mariem-maater-iit-sfax.webp",
      quote: "C’est notre deuxième participation à WAJAHNI, et l’expérience a été vraiment enrichissante. Je tiens à féliciter toute l’équipe pour sa coordination et son organisation impeccables. Cet événement offre une opportunité unique de rencontrer de nombreux étudiants, universités et partenaires." },
    { name: "Saif Hmida", org: "inlingua", logo: null, photo: "saif-hmida-inlingua.webp",
      quote: "Wajahni est un événement exceptionnel qui nous a permis de rencontrer des milliers de jeunes en seulement deux jours. Ces étudiants ont eu l’opportunité d’interagir avec des universités et des centres de formation dans divers, tant tunisiens qu’internationaux, une possibilité qui n’existait pas dans notre époque" },
    { name: "Oumaima Cherni", org: "Coding Dojo", logo: "logo-coding-dojo.webp", photo: "oumaima-cherni-coding-dojo.webp",
      quote: "Participer à Wajahni a été une expérience enrichissante. Nous sommes fiers de revenir pour la deuxième fois à WAJAHNI et ravis d’interagir à nouveau avec les jeunes et les parents. WAJAHNI offre une expérience exceptionnelle, avec une diversité de composants. C’est une belle initiative et une expérience inoubliable." },
    { name: "Takwa Gannouma", org: "Educaro", logo: "logo-educaro.webp", photo: "takwa-gannouma-educaro.webp",
      quote: "Wajahni est un événement très intéressant où les étudiants et professionnels intéressés par l’étude en Allemagne se réunissent. Wajahni est le seul endroit où toute personne intéressée par l’Allemagne trouve des opportunités." },
    { name: "Ahmed Sayeh", org: "Wall Street English", logo: "logo-wall-street-english.webp", photo: "ahmed-sayeh-wall-street-english.webp",
      quote: "Wajahni est un excellent événement qui a offert à notre institution l’opportunité de se connecter directement avec les jeunes, d’une manière qui était auparavant impossible à réaliser par d’autres outils de communication ou de recrutement." },
    { name: "Dorsaf Zemni", org: "Three Alfa", logo: "logo-three-alfa.webp", photo: "dorsaf-zemni-three-alfa.webp",
      quote: "Wajahni est un excellent événement. Ce que j’ai le plus apprécié, c’est leur professionnalisme et leur ponctualité. Nous avons rencontré de nombreux jeunes à la recherche de formations variées." },
    { name: "Aymen Ben Hsin", org: "RBK", logo: "logo-rbk.webp", photo: "aymen-ben-hsin-rbk.webp",
      quote: "Nous avons été ravis de participer à cet événement exceptionnel, organisé. Il a offert une opportunité aux jeunes en quête d’orientation, les aidant à aligner leurs aspirations avec leurs intérêts, tout en fournissant une plateforme pour les guider vers les choix les plus judicieux." },
    { name: "Nadia Cherif", org: "Boosteno", logo: null, photo: "nadia-cherif-boosteno.webp",
      quote: "J’ai été agréablement surprise et ravie en même temps. Cet événement est bien organisé, avec des stands impeccables, un programme riche et une abondance d’informations disponibles. Wajahni incarne parfaitement son nom. C’est une ressource précieuse où chaque question trouve sa réponse." },
  ].map(t => ({ ...t, photo: DIR + t.photo, logo: t.logo && DIR + t.logo }));

  const CHAT = DIR + 'chat.webp';
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const main = document.getElementById('tm-main');
  const others = document.getElementById('tm-others');
  if (!main || !others) return;

  main.innerHTML = TESTIMONIALS.map((t, i) => `
    <article class="tm-card" id="tm-card-${i}" aria-roledescription="témoignage" aria-label="${i + 1} sur ${TESTIMONIALS.length}">
      <div class="tm-card__top">
        <img class="tm-card__chat" src="${CHAT}" alt="" width="160" height="139" loading="lazy">
        ${t.logo
          ? `<img class="tm-card__logo" src="${esc(t.logo)}" alt="${esc(t.org)}" loading="lazy">`
          : `<span class="tm-card__org">${esc(t.org)}</span>`}
      </div>
      <div class="tm-card__person">
        <img class="tm-card__photo" src="${esc(t.photo)}" alt="" width="240" height="240" loading="lazy">
        <div><h3 class="tm-card__name">${esc(t.name)}</h3><p class="tm-card__role">${esc(t.org)}</p></div>
      </div>
      <blockquote class="tm-card__quote">“${esc(t.quote)}”</blockquote>
    </article>`).join('');

  others.innerHTML = TESTIMONIALS.map((t, i) => `
    <button class="tm-mini" type="button" data-card="${i}" aria-controls="tm-main" aria-label="Lire le témoignage de ${esc(t.name)}, ${esc(t.org)}">
      <img class="tm-mini__photo" src="${esc(t.photo)}" alt="" width="240" height="240" loading="lazy">
      <span class="tm-mini__text"><span class="tm-mini__name">${esc(t.name)}</span><span class="tm-mini__role">${esc(t.org)}</span></span>
      <img class="tm-mini__chat" src="${CHAT}" alt="" width="160" height="139" loading="lazy">
    </button>`).join('');

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

  // A compact card brings its testimonial into view and highlights it.
  others.addEventListener('click', e => {
    const mini = e.target.closest('.tm-mini');
    if (!mini) return;
    const card = document.getElementById('tm-card-' + mini.dataset.card);
    const max = main.scrollWidth - main.clientWidth;
    main.scrollTo({ left: Math.min(card.offsetLeft - main.firstElementChild.offsetLeft, max), behavior: reduce.matches ? 'auto' : 'smooth' });
    main.querySelectorAll('.is-picked').forEach(c => c.classList.remove('is-picked'));
    card.classList.add('is-picked');
    clearTimeout(card._t);
    card._t = setTimeout(() => card.classList.remove('is-picked'), 1800);
  });
})();
