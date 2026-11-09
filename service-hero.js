// The remaining panels retain the original width-based canvas scale. Move
// their shell by only the difference introduced by fitting the first panel.
function fitServiceArtboard(viewport, canvasScale, canvasHeight, heroHeight, nextPanelTop) {
  const headerBottom = document.querySelector('.site-header').getBoundingClientRect().bottom;
  const available = Math.max(1, document.documentElement.clientHeight - headerBottom);
  const heroScale = Math.min(canvasScale, available / heroHeight);
  const artboard = viewport.querySelector('.fitted-artboard');

  document.body.style.paddingTop = headerBottom + 'px';
  if (!artboard) {
    const offset = heroHeight * heroScale - nextPanelTop * canvasScale;
    viewport.style.height = (canvasHeight * canvasScale + offset) + 'px';
    viewport.firstElementChild.style.top = offset + 'px';
    viewport.style.setProperty('--first-panel-top', (-offset / canvasScale) + 'px');
    viewport.style.setProperty('--first-panel-scale', heroScale / canvasScale);
    return;
  }

  // Full-screen hero: the hero box always spans the whole viewport below the
  // header. The artwork's content is scaled to fit inside it (centred), and
  // its background photo is stretched to cover the full box.
  const viewportWidth = 1440 * canvasScale;
  const contentLeft = (viewportWidth - 1440 * heroScale) / 2;
  const contentTop = (available - heroHeight * heroScale) / 2;
  const offset = available - nextPanelTop * canvasScale;

  viewport.style.height = (canvasHeight * canvasScale + offset) + 'px';
  viewport.firstElementChild.style.top = offset + 'px';
  viewport.style.setProperty('--first-panel-top', ((contentTop - offset) / canvasScale) + 'px');
  viewport.style.setProperty('--first-panel-scale', heroScale / canvasScale);

  // Hero box in the artboard's own (unscaled) coordinates. The photo stays
  // aligned with the artwork where it can, and fills the rest of the box.
  const left = -contentLeft / heroScale;
  const top = -contentTop / heroScale;
  const width = viewportWidth / heroScale;
  const height = available / heroScale;
  artboard.style.clipPath = `inset(${top}px ${left}px ${heroHeight - top - height}px ${left}px)`;
  artboard.style.setProperty('--hero-box-left', left + 'px');
  artboard.style.setProperty('--hero-box-top', top + 'px');
  artboard.style.setProperty('--hero-box-width', width + 'px');
  artboard.style.setProperty('--hero-box-height', height + 'px');
  const photo = artboard.firstElementChild && artboard.firstElementChild.querySelector('img');
  if (photo) artboard.style.setProperty('--hero-photo', `url("${photo.currentSrc || photo.src}")`);
  // Wide screens: blurred side fill keeps the photo aligned with the text.
  // Tall screens (phones): the sharp photo itself covers the whole box.
  const coverPhoto = contentTop > 1;
  artboard.classList.toggle('has-side-fill', contentLeft > 1 && !coverPhoto);
  artboard.classList.toggle('has-cover-photo', coverPhoto);
  const background = artboard.firstElementChild;
  if (background) Object.assign(background.style, coverPhoto
    ? { left: left + 'px', top: top + 'px', width: width + 'px', height: height + 'px' }
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
