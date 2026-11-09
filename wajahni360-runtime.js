(() => {
  const init = () => {
    const loader = document.querySelector('#w360-loader');
    const images = [...document.querySelectorAll('[data-w360-panel] img')];
    const dismissLoader = () => window.requestAnimationFrame(() => loader?.classList.add('is-hidden'));
    const firstPanel = images[0];
    // Show the actual site as soon as its first visual is ready; the remaining
    // panels continue warming the cache without blocking the visitor.
    if (!firstPanel || firstPanel.complete) dismissLoader();
    else {
      firstPanel.addEventListener('load', dismissLoader, { once: true });
      firstPanel.addEventListener('error', dismissLoader, { once: true });
    }
    window.setTimeout(dismissLoader, 4000);
  };

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init, { once: true });
})();
