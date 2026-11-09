// Design px between the page edge and the hero text on the 1440px artboards.
const HERO_LEFT_MARGIN = 46;

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

  // One-screen, full-width hero. The hero box is exactly the screen: full
  // page width and full screen height, starting behind the floating navbar.
  // The photo covers the whole box. The hero content (contentBounds, in
  // design px) is scaled so all of it, button included, fits between the
  // navbar and the bottom of the screen; it never grows past the page's own
  // width-based scale, and it stays anchored to the page's left margin.
  document.body.style.paddingTop = '0px';
  const vw = 1440 * canvasScale;
  const vh = Math.max(1, document.documentElement.clientHeight);
  const [boundsTop, boundsBottom] = contentBounds || [0, heroHeight];
  const gap = Math.max(12, vh * 0.025);
  const room = Math.max(1, vh - headerBottom - 2 * gap);
  const scale = Math.min(canvasScale, room / (boundsBottom - boundsTop));
  const x = HERO_LEFT_MARGIN * (canvasScale - scale);
  const y = headerBottom + gap + (room - (boundsBottom - boundsTop) * scale) / 2 - boundsTop * scale;
  const offset = vh - nextPanelTop * canvasScale;

  viewport.style.height = (canvasHeight * canvasScale + offset) + 'px';
  viewport.firstElementChild.style.top = offset + 'px';
  viewport.style.setProperty('--first-panel-top', ((y - offset) / canvasScale) + 'px');
  artboard.style.transformOrigin = '0 0';
  artboard.style.transform = `translateX(${x / canvasScale}px) scale(${scale / canvasScale})`;

  // Hero box in the artboard's own (unscaled) coordinates.
  const left = -x / scale;
  const top = -y / scale;
  const width = vw / scale;
  const height = vh / scale;
  artboard.style.clipPath = `inset(${top}px ${1440 - left - width}px ${heroHeight - top - height}px ${left}px)`;
  artboard.classList.add('has-cover-photo');
  const background = artboard.firstElementChild;
  if (background) Object.assign(background.style, {
    left: left + 'px', top: top + 'px', width: width + 'px', height: height + 'px',
  });
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
