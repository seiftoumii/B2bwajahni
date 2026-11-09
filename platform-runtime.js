(() => {
  const canvasWidth = 1440;
  const canvasHeight = 18729;
  const transitionOverlap = 92;
  const canvas = document.querySelector('#platform-canvas');
  const viewport = document.querySelector('#platform-viewport');
  const loader = document.querySelector('.platform-loader');
  const panels = [
    ['assets/platform/panel-01.png', 0, 1024.56], ['assets/platform/panel-02.png', 1025, 1024.56],
    ['assets/platform/panel-03.png', 2050, 1024.56], ['assets/platform/panel-04.png', 3075, 1024.56],
    ['assets/platform/panel-05.png', 4100, 1024.56], ['assets/platform/panel-06.png', 5125, 1024.56],
    ['assets/platform/panel-07.png', 6150, 1028], ['assets/platform/panel-08.png', 7178, 1028.117],
    ['assets/platform/panel-09.png', 8206, 1024.56], ['assets/platform/panel-10.png', 9231, 1028.117],
    ['assets/platform/panel-11.png', 10259, 1024.56], ['assets/platform/panel-12.png', 11284, 1025.249],
    ['assets/platform/panel-13.png', 12309, 1024.56], ['assets/platform/panel-14.png', 13334, 1024.559],
    ['assets/platform/panel-15.png', 14359, 1026], ['assets/platform/panel-16.png', 15385, 1025.249],
    ['assets/platform/panel-17.png', 16410, 1025.983], ['assets/platform/panel-18.png', 17436, 1024.56],
    ['assets/platform/panel-19.png', 18461, 1024.56], ['assets/platform/panel-20.png', 19451, 1025.983]
  ];
  const overlayLogo = 'assets/platform/panel-overlay.png';
  const overlays = [[54,8289],[54,9293],[54,10301],[54,11350],[54,12406],[54,13430],[44,14455],[44,15481]];

  panels.forEach(([source, top, height], index) => {
    const section = document.createElement('section');
    section.className = 'platform-panel';
    if (index) section.classList.add('platform-panel--blended');
    section.style.top = `${top - (index * transitionOverlap)}px`;
    section.style.height = `${height}px`;
    section.style.zIndex = String(index + 1);
    section.dataset.panel = String(index + 1);
    const image = new Image();
    image.src = source;
    image.alt = index === 0 ? 'Présentation de WAJAHNI Platform' : '';
    image.decoding = 'async';
    image.loading = 'eager';
    image.fetchPriority = index < 3 ? 'high' : 'auto';
    if (index === 0) {
      image.addEventListener('load', () => loader.classList.add('is-ready'), { once: true });
      image.addEventListener('error', () => loader.classList.add('is-ready'), { once: true });
    }
    section.append(image);
    canvas.append(section);
    const preload = document.createElement('link');
    preload.rel = 'preload'; preload.as = 'image'; preload.href = source;
    document.head.append(preload);
  });
  overlays.forEach(([left, top]) => {
    const image = document.createElement('img');
    image.className = 'platform-overlay-logo'; image.alt = ''; image.src = overlayLogo;
    const panelIndex = panels.reduce((activeIndex, [, panelTop], index) => panelTop <= top ? index : activeIndex, 0);
    image.style.left = `${left}px`; image.style.top = `${top - (panelIndex * transitionOverlap)}px`;
    canvas.append(image);
  });

  function updateScale() {
    const scale = window.innerWidth / canvasWidth;
    document.documentElement.style.setProperty('--platform-scale', String(scale));
    viewport.style.width = `${canvasWidth * scale}px`;
    fitServiceArtboard(viewport, scale, canvasHeight, 1024.56, 933);
  }
  updateScale();
  window.addEventListener('resize', updateScale, { passive: true });
  window.setTimeout(() => loader.classList.add('is-ready'), 4500);

  const dialog = document.querySelector('#platform-contact');
  const toast = document.querySelector('.platform-toast');
  document.querySelector('.platform-dialog__close').addEventListener('click', () => dialog.close());
  document.querySelector('.platform-form').addEventListener('submit', (event) => {
    event.preventDefault(); dialog.close(); event.currentTarget.reset();
    toast.textContent = 'Merci — votre demande a bien été envoyée.'; toast.classList.add('is-visible');
    window.setTimeout(() => toast.classList.remove('is-visible'), 2800);
  });
})();
