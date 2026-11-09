(() => {
const overview=document.querySelector('img[src="assets/home/n268-14045.png"]').parentElement;
overview.classList.add('overview');
const metrics=[
['13','événements','orange'],
['15','villes touchées','teal'],
['+3500','stands','gold'],
['+50K','visiteurs','teal'],
['500K','utilisateurs<br>sur le site web','orange'],
['10M','de portée sur<br>les réseaux sociaux','teal']
];
const metricsBand=document.createElement('div');
metricsBand.className='metrics-band';
metricsBand.id='chiffres-attendus';
metricsBand.setAttribute('aria-label','Chiffres attendus');
const metricGeometry=[
{x:201.5,cy:69,d:108,y:110,label:153,font:43,glyph:'calendar',w:35,h:39,gy:44},
{x:419,cy:51,d:116,y:99,label:141,font:41,glyph:'pin',w:32,h:48,gy:27},
{x:630,cy:51,d:116,y:100,label:141,font:39,glyph:'stand',w:42,h:41,gy:31},
{x:841.5,cy:51,d:108,y:102,label:143,font:39,glyph:'people',w:47,h:38,gy:32},
{x:1049,cy:53,d:110,y:97,label:137,font:38,glyph:'laptop',w:44,h:36,gy:35},
{x:1267,cy:59,d:104,y:105,label:142,font:34,glyph:'bars',w:38,h:37,gy:41}
];
metricsBand.innerHTML='<svg class="metrics-connectors" viewBox="0 0 1472 226.6" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="metric-line"><stop stop-color="#f6bf66"/><stop offset=".5" stop-color="#ffab36"/><stop offset="1" stop-color="#ff7527"/></linearGradient></defs><path d="M248 75C290 93 325 86 370 56M466 45C500 45 526 52 570 59M680 75C732 77 773 57 790 54M895 53C936 57 973 85 1006 92M1103 80C1154 100 1185 96 1227 76" fill="none" stroke="url(#metric-line)" stroke-width="1.1"/><circle cx="313" cy="76" r="6" fill="#ff5214"/><circle cx="735" cy="73" r="6" fill="#ffa615"/><circle cx="933" cy="61" r="5" fill="#f54c18"/></svg>'+metrics.map(([value,label,tone],i)=>{
 const g=metricGeometry[i];
 return '<div class="metric metric--'+(i===2?'gold':tone)+'" style="--x:'+g.x+';--cy:'+g.cy+';--diameter:'+g.d+';--number-y:'+g.y+';--label-y:'+g.label+';--number-font:'+g.font+';--glyph-w:'+g.w+';--glyph-h:'+g.h+';--glyph-y:'+g.gy+'"><div class="metric-orb" aria-hidden="true"></div><img class="metric-glyph" src="assets/home/metric-'+g.glyph+'.svg" alt="" aria-hidden="true" width="'+g.w+'" height="'+g.h+'"><strong>'+value+'</strong><span>'+label+'</span></div>';
}).join('');
overview.append(metricsBand);
const benefits=[
 {title:'Leader de l’industrie',text:'Notre statut de leader se traduit également par notre capacité à innover constamment, en lançant des initiatives adaptées aux tendances émergentes du secteur éducatif.',tone:'orange',icon:'<path d="M8 4h16v9a8 8 0 0 1-16 0V4Z"/><path d="M8 7H4v5a6 6 0 0 0 6 6M24 7h4v5a6 6 0 0 1-6 6M16 21v6M11 28h10"/>'},
 {title:'Expertise',text:'Nous savons identifier les tendances et anticiper les évolutions du marché pour fournir des solutions sur mesure adaptées à chaque segment.',tone:'teal',icon:'<path d="M10 21c0-4-5-5-5-11a11 11 0 0 1 22 0c0 6-5 7-5 11l-1 3H11l-1-3Z"/><path d="M11 27h10M13 30h6M11 8a6 6 0 0 1 6-4"/>'},
 {title:'Professionnalisme',text:'Nous nous engageons à offrir à nos partenaires une collaboration transparente, rigoureuse et basée sur des standards de qualité élevés.',tone:'gold',icon:'<path d="m3 9 5-3 5 3 5-3 6 2 5 9-5 3-6 6-4-1-7-5-4-11Z"/><path d="m13 9-4 5c-1 2 1 3 3 2l5-3 8 7M8 6l-5 3 4 11M24 8l5 9M14 21l4 4M17 18l5 5"/>'}
];
const benefitGrid=document.createElement('div');benefitGrid.className='benefit-grid';
benefitGrid.innerHTML=benefits.map((b,i)=>'<article class="benefit benefit--'+b.tone+'"><div class="benefit-icon"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+b.icon+'</svg></div><span class="benefit-number" aria-hidden="true">0'+(i+1)+'</span><h3>'+b.title+'</h3><span class="benefit-rule" aria-hidden="true"></span><p>'+b.text+'</p></article>').join('');
overview.append(benefitGrid);
// Mobile uses two cropped art regions around a readable, three-column metric
// layout. Neither crop contains any of the baked-in metric text or icons.
const metricArtTop=document.createElement('div');
metricArtTop.className='metric-art-top';
metricArtTop.setAttribute('aria-hidden','true');
metricArtTop.innerHTML='<img src="assets/home/n268-14045.png" alt="" width="1472" height="1069" loading="lazy">';
overview.prepend(metricArtTop);
const metricArtBottom=document.createElement('div');
metricArtBottom.className='metric-art-bottom';
metricArtBottom.innerHTML='<img src="assets/home/n268-14045.png" alt="" aria-hidden="true" width="1472" height="1069" loading="lazy">';
overview.append(metricArtBottom);
const metricMobile=matchMedia('(max-width:760px)');
const positionBenefits=()=>{(metricMobile.matches?metricArtBottom:overview).append(benefitGrid);};
positionBenefits();
metricMobile.addEventListener('change',positionBenefits);
const quote="“C'est notre deuxième participation à WAJAHNI et je dois avouer être agréablement surprise par l'évolution continue de l'événement, d'autant plus que l'équipe est exclusivement composée de jeunes. C'est un excellent départ pour un début prometteur.”";
document.querySelector('.quotes').innerHTML=Array.from({length:3},()=>'<article class="quote"><div class="quote-meta"><img src="assets/home/n272-14087.png" alt="Logo partenaire" width="56" height="56"><img src="assets/home/n272-14089.png" alt="" width="65" height="65"></div><div class="person"><img src="assets/home/n272-14088.png" alt="Mme Ghosn Ennaem" width="92" height="92"><div><h3>Mme. Ghosn ennaem</h3><p>Directrice d’admission</p></div></div><blockquote>'+quote+'</blockquote></article>').join('');
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
