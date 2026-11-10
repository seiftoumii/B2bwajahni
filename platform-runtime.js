// Platform page: hides the loader once the hero photo is ready, and runs the
// price tabs (Université / École de Formation Pro vs Centre de langue /
// Centre de Formation). The sections themselves are plain HTML in
// platform.html, styled by platform-sections.css.
(() => {
  const loader = document.querySelector('.platform-loader');
  const ready = () => loader && loader.classList.add('is-ready');
  const heroImage = document.querySelector('.ph__bg');
  if (!heroImage || heroImage.complete) ready();
  else {
    heroImage.addEventListener('load', ready, { once: true });
    heroImage.addEventListener('error', ready, { once: true });
  }
  window.setTimeout(ready, 4500);

  const tabs = [...document.querySelectorAll('.pf-tab')];
  const panel = document.querySelector('#pf-tarifs-grid');
  if (!tabs.length || !panel) return;
  function select(tab, focus = false) {
    const plan = tab.dataset.plan;
    tabs.forEach((other) => {
      const on = other === tab;
      other.setAttribute('aria-selected', String(on));
      other.tabIndex = on ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', tab.id);
    if (panel.dataset.plan !== plan) {
      panel.dataset.plan = plan;
      panel.querySelectorAll('b[data-uni]').forEach((price) => { price.textContent = price.dataset[plan]; });
      panel.classList.remove('is-switching');
      void panel.offsetWidth;
      panel.classList.add('is-switching');
    }
    if (focus) tab.focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      event.preventDefault();
      const step = event.key === 'ArrowRight' ? 1 : -1;
      select(tabs[(index + step + tabs.length) % tabs.length], true);
    });
  });
})();
