// The remaining panels retain the original width-based canvas scale. Move
// their shell by only the difference introduced by fitting the first panel.
function fitServiceArtboard(viewport, canvasScale, canvasHeight, heroHeight, nextPanelTop) {
  const headerBottom = document.querySelector('.site-header').getBoundingClientRect().bottom;
  const available = Math.max(1, document.documentElement.clientHeight - headerBottom);
  const heroScale = Math.min(canvasScale, available / heroHeight);
  const offset = heroHeight * heroScale - nextPanelTop * canvasScale;

  document.body.style.paddingTop = headerBottom + 'px';
  viewport.style.height = (canvasHeight * canvasScale + offset) + 'px';
  viewport.firstElementChild.style.top = offset + 'px';
  viewport.style.setProperty('--first-panel-top', (-offset / canvasScale) + 'px');
  viewport.style.setProperty('--first-panel-scale', heroScale / canvasScale);
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
