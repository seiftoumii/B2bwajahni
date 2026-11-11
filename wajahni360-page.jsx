// Slide 1 of the deck is rebuilt as HTML: the full-screen hero (#w360-hero)
// and the "Pourquoi WAJAHNI 360° ?" section under it. Styles: w360-hero.css.
const panels360 = [
  "assets/w360/slide-02.jpg",
  "assets/w360/slide-03.jpg",
  "assets/w360/slide-04.jpg",
  "assets/w360/slide-05.jpg",
  "assets/w360/slide-06.jpg",
  "assets/w360/slide-07.jpg",
  "assets/w360/slide-08.jpg",
  "assets/w360/slide-09.jpg",
  "assets/w360/slide-10.jpg",
  "assets/w360/slide-11.jpg",
  "assets/w360/slide-12.jpg",
  "assets/w360/slide-13.jpg",
];

const reasons360 = [
  { title: "Leader du marché", text: "WAJAHNI est une référence dans l’orientation académique en Tunisie.", tone: "orange" },
  { title: "Crédibilité forte", text: "Une marque reconnue et appréciée par les jeunes, les élèves, les étudiants et les parents.", tone: "teal" },
  { title: "Expertise éducation", text: "Une compréhension concrète du marché des universités, centres de formation et centres de langues.", tone: "orange" },
  { title: "Connaissance de l’audience", text: "Nous savons parler à la Gen Z avec les bons formats, les bons messages et les bons canaux.", tone: "teal" },
  { title: "Expérience terrain", text: "Des années d’expérience à travailler avec cette audience à travers événements, digital et contenus.", tone: "orange" },
  { title: "Objectif business", text: "Une communication orientée visibilité, engagement et attractivité pour vos formations.", tone: "teal" },
];

function Wajahni360Page() {
  return (
    <div className="w360-page">
      <section className="w3h" id="w360-hero" aria-labelledby="w3h-title">
        <div className="w3h__photo" aria-hidden="true">
          <div className="w3h__ring"></div>
          <img src="assets/w360/hero/students.jpg" alt="" fetchPriority="high" decoding="async" />
        </div>
        <img className="w3h__corner" src="assets/w360/hero/corner-left.png" alt="" aria-hidden="true" />
        <div className="w3h__content">
          <div className="w3h__brand">
            <img className="w3h__logo" src="assets/w360/hero/logo.png" alt="Wajahni" />
            <img className="w3h__dots" src="assets/w360/hero/dots.png" alt="" aria-hidden="true" />
          </div>
          <h1 className="w3h__title" id="w3h-title">
            <span className="w3h__word">WAJAHNI</span> <span className="w3h__deg">360°</span>
          </h1>
          <p className="w3h__sub">L’agence de communication spécialisée dans l’éducation</p>
          <p className="w3h__lead">
            WAJAHNI 360° accompagne les universités privées, centres de formation et professionnelle et
            centres de langues avec une communication pensée pour le marché de l’éducation. Notre force
            réside dans notre connaissance du secteur, notre proximité avec l’audience jeune et la
            crédibilité construite par la marque WAJAHNI en Tunisie.
          </p>
          <a className="w3h__cue" href="#pourquoi">Pourquoi WAJAHNI 360° ?<span aria-hidden="true">↓</span></a>
        </div>
      </section>

      <section className="w3w" id="pourquoi" aria-labelledby="w3w-title">
        <h2 className="w3w__title" id="w3w-title"><span>Pourquoi&nbsp; WAJAHNI 360° ?</span></h2>
        <ul className="w3w__cards">
          {reasons360.map((reason, index) => (
            <li className={`w3w__card w3w__card--${reason.tone}`} key={reason.title}>
              <img src={`assets/w360/hero/icon-${index + 1}.png`} alt="" aria-hidden="true" />
              <h3>{reason.title}</h3>
              <p>{reason.text}</p>
            </li>
          ))}
        </ul>
        <div className="w3w__quote">
          <span className="w3w__mark" aria-hidden="true">“</span>
          <p>Vous connaissez votre établissement. Nous connaissons votre marché et votre future audience.</p>
          <span className="w3w__mark w3w__mark--end" aria-hidden="true">”</span>
        </div>
        <p className="w3w__sign"><strong>WAJAHNI 360°</strong> <span aria-hidden="true">—</span> <em>Votre communication, pensée par des experts de l’éducation.</em></p>
        <img className="w3w__corner" src="assets/w360/hero/corner-right.png" alt="" aria-hidden="true" />
      </section>

      <main>
        {panels360.map((src, index) => (
          <section className="w360-section" data-w360-panel key={src} aria-label={`Présentation Wajahni 360, section ${index + 2}`} style={{ '--side': `url(${src.replace('w360/', 'w360/sides/')})` }}>
            <img src={src} alt="" loading="eager" decoding="async" />
          </section>
        ))}
      </main>

      <section className="w360-contact-section" id="contact" aria-labelledby="w360-contact-title">
        <p>WAJAHNI 360°</p>
        <h2 id="w360-contact-title">Construisons votre prochaine campagne.</h2>
        <a href="mailto:contact@wajahni.tn">Parlons de votre projet <span aria-hidden="true">→</span></a>
      </section>
    </div>
  );
}
