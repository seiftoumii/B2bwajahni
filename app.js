const header = document.querySelector('.site-header');
const revealItems = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } }), { threshold: 0.16 });
revealItems.forEach((item) => observer.observe(item));

window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 40), { passive: true });

const track = document.querySelector('.location-track');
const cards = [...document.querySelectorAll('.location-card')];
let locationIndex = 0;
function updateLocations(direction = 0) {
  locationIndex = (locationIndex + direction + cards.length) % cards.length;
  const cardWidth = cards[0].getBoundingClientRect().width;
  const gap = 32;
  track.style.transform = `translateX(-${locationIndex * (cardWidth + gap)}px)`;
  cards.forEach((card, i) => card.classList.toggle('active', i === locationIndex));
}
document.querySelector('.carousel-next').addEventListener('click', () => updateLocations(1));
document.querySelector('.carousel-prev').addEventListener('click', () => updateLocations(-1));
window.addEventListener('resize', () => updateLocations(0));
document.querySelector('.play-button').addEventListener('click', () => alert('The Caravan film is coming soon.'));
document.querySelectorAll('.round-play').forEach((button) => button.addEventListener('click', () => alert('Location preview is coming soon.')));
