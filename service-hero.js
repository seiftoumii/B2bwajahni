// The remaining panels retain the original width-based canvas scale. Move
// their shell by only the difference introduced by fitting the first panel.
function fitServiceArtboard(viewport, canvasScale, canvasHeight, heroHeight, nextPanelTop, contentBounds) {
  const headerBottom = document.querySelector('.site-header').getBoundingClientRect().bottom;
  const artboard = viewport.querySelector('.fitted-artboard');

  if (!artboard) {
    const available = Math.max(1, document.documentElement.clientHeight - headerBottom);
    const heroScale = Math.min(canvasScale, available / heroHeight);
    document.body.style.paddingTop = headerBottom + 'px';
    const offset = heroHeight * heroScale - nextPanelTop * canvasScale;
    viewport.style.height = (canvasHeight * canvasScale + offset) + 'px';
    viewport.firstElementChild.style.top = offset + 'px';
    viewport.style.setProperty('--first-panel-top', (-offset / canvasScale) + 'px');
    viewport.style.setProperty('--first-panel-scale', heroScale / canvasScale);
    return;
  }

  // Full-width hero: the artwork uses the same width-based scale as the rest
  // of the page, so its content spans the full page width. The hero box is
  // at least the screen height. When the artwork is taller
  // than the screen, the empty sky above and below its content (outside
  // contentBounds, in design px) is trimmed so the content fits; on tall
  // screens (phones) the content is centred and the photo covers the box.
  // The hero starts at the very top of the page, behind the floating navbar
  // (no white strip above it); its content is only trimmed down to just below
  // the navbar so nothing hides under it.
  document.body.style.paddingTop = '0px';
  const available = Math.max(1, document.documentElement.clientHeight);
  const [contentTopBound, boundsBottom] = contentBounds || [0, heroHeight];
  const scale = canvasScale;
  const boundsTop = Math.max(0, contentTopBound - headerBottom / scale);
  const fullHeight = heroHeight * scale;
  const boxHeight = Math.min(fullHeight, Math.max(available, (boundsBottom - boundsTop) * scale));
  let contentTop;
  if (fullHeight <= available) {
    contentTop = (available - fullHeight) / 2;
  } else {
    const trim = fullHeight - boxHeight;
    const spareGap = (boundsTop + heroHeight - boundsBottom) * scale - trim;
    contentTop = -Math.min(trim, Math.max(0, boundsTop * scale - spareGap / 2));
  }
  const height = Math.max(available, boxHeight);
  const offset = height - nextPanelTop * scale;

  viewport.style.height = (canvasHeight * scale + offset) + 'px';
  viewport.firstElementChild.style.top = offset + 'px';
  viewport.style.setProperty('--first-panel-top', ((contentTop - offset) / scale) + 'px');
  viewport.style.setProperty('--first-panel-scale', 1);

  // Hero box in the artboard's own (unscaled) coordinates.
  const boxTop = -contentTop / scale;
  const boxHeightLocal = height / scale;
  artboard.style.clipPath = `inset(${boxTop}px 0 ${heroHeight - boxTop - boxHeightLocal}px 0)`;
  const coverPhoto = contentTop > 0.5;
  artboard.classList.toggle('has-cover-photo', coverPhoto);
  const background = artboard.firstElementChild;
  if (background) Object.assign(background.style, coverPhoto
    ? { left: '0px', top: boxTop + 'px', width: '1440px', height: boxHeightLocal + 'px' }
    : { left: '', top: '', width: '', height: '' });
}

// The 360° deck uses ordinary images in document flow.
function fitFirstSlide() {
  const header = document.querySelector('.site-header');
  if (document.getElementById('w360-root') && header) {
    document.documentElement.style.setProperty('--hero-header', header.getBoundingClientRect().bottom + 'px');
  }
}
document.addEventListener('DOMContentLoaded', fitFirstSlide);
window.addEventListener('resize', fitFirstSlide);
