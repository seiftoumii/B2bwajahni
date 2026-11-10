// Platform page: hides the loader once the hero photo is ready. The slide
// sections are plain HTML in platform.html (slide picture plus real text),
// styled by platform-sections.css.
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
})();
