const panels360 = [
  "assets/w360/slide-01.jpg",
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

function Wajahni360Page() {
  return (
    <div className="w360-page">

      <main>
        {panels360.map((src, index) => (
          <section className="w360-section" data-w360-panel key={src} aria-label={`Présentation Wajahni 360, section ${index + 1}`}>
            <img src={src} alt="" loading="eager" decoding="async" fetchPriority="high" />
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
