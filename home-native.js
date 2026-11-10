(() => {
const serviceCards = [
  ['educareer', 'Le grand salon de l’orientation en Tunisie.', '9639', '#f4671f'],
  ['roadshow', 'Une série de salons dans 9 régions de la Tunisie.', '9641', '#17b0c4'],
  ['caravan', 'Le plus grand événement de l’orientation en Tunisie.', '9643', '#fbaa17'],
  ['platform', 'La plateforme N°1 d’orientation en Tunisie.', '9645', '#17b0c4'],
  ['360', 'L’expert de communication dédié au secteur de l’éducation.', '9647', '#8b3fe0']
];
document.querySelector('.summit-grid').innerHTML = serviceCards.map(([key, copy, icon, color]) => {
  const page = wajahniPages.find(item => item.key === key);
  return `<a class="summit-card" href="${page.href}#top" style="--badge:${color}">
    <img class="summit-photo" src="assets/edu/n237-9584.png" width="251" height="139" alt="" loading="lazy">
    <img class="summit-badge" src="assets/edu/n237-${icon}.png" width="72" height="72" alt="" loading="lazy">
    <h3>WAJAHNI<br>${page.label.replace('WAJAHNI ', '')}</h3><p>${copy}</p>
    <span class="summit-arrow" aria-hidden="true">→</span>
  </a>`;
}).join('');
if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.06});document.querySelectorAll('.quote,.service,.contact-columns').forEach((el,i)=>{el.classList.add('reveal');el.style.setProperty('--delay',(i%5*40)+'ms');observer.observe(el);});}
document.querySelector('form').onsubmit=e=>{e.preventDefault();const d=new FormData(e.currentTarget);const body=d.get('message')+'\n\n'+d.get('firstName')+' '+d.get('lastName')+'\nEmail : '+d.get('email')+'\nTéléphone : '+d.get('phone');location.href='mailto:rayen.mohsni@wajahni.tn?cc=jamila.moalla%40wajahni.tn&subject='+encodeURIComponent(d.get('subject'))+'&body='+encodeURIComponent(body);document.querySelector('.status').textContent='Message préparé. Envoyez-le depuis votre application e-mail.';};
})();
