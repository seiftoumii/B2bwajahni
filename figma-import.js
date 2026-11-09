document.querySelector('.hotspot--discover')?.addEventListener('click', (event) => {
  event.preventDefault();
  document.querySelector('#presentation')?.scrollIntoView({ behavior: 'smooth' });
});
document.querySelector('.hotspot--contact')?.addEventListener('click', (event) => {
  event.preventDefault();
  document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
});
