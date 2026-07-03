// "About" overlay — a brief bio card that resolves in like smoke (blur + fade)
// on top of the scene. Opened from the brand mark; dismissed by the close button,
// a backdrop click, or Escape. Enter/exit are CSS transitions (see .about in
// styles.css), so the smoke reverses symmetrically on close.
import { installHaptic, tapHaptic } from '../haptics';

const ABOUT_HTML = `
  <div class="about__backdrop"></div>
  <div class="about__panel" role="dialog" aria-modal="true" aria-label="About">
    <button class="about__close" type="button" aria-label="Close">×</button>
    <p class="about__eyebrow">about</p>
    <p class="about__body">
      Placeholder bio — a line or two about catx-studios lives here.
      Swap this copy for the real thing.
    </p>
  </div>
`;

export function initAbout(trigger: HTMLElement): void {
  const root = document.createElement('div');
  root.className = 'about';
  root.hidden = true;
  root.innerHTML = ABOUT_HTML;
  document.body.appendChild(root);

  const panel = root.querySelector('.about__panel') as HTMLElement;
  const closeBtn = root.querySelector('.about__close') as HTMLElement;
  const backdrop = root.querySelector('.about__backdrop') as HTMLElement;
  let hideTimer = 0;

  function open(): void {
    if (root.classList.contains('is-open')) return; // ignore rapid re-taps while open
    window.clearTimeout(hideTimer);
    root.hidden = false;
    void root.offsetWidth; // force reflow so the transition runs from the hidden state
    root.classList.add('is-open');
    tapHaptic(); // same crisp tick as everywhere else
  }

  function close(): void {
    if (root.hidden || !root.classList.contains('is-open')) return;
    root.classList.remove('is-open');
    // Hide once the smoke-out transition ends; the timer is a safety net for
    // reduced-motion / interrupted transitions where transitionend may not fire.
    const hide = (): void => { window.clearTimeout(hideTimer); root.hidden = true; };
    panel.addEventListener('transitionend', hide, { once: true });
    hideTimer = window.setTimeout(hide, 1000);
  }

  trigger.style.cursor = 'pointer';
  installHaptic(trigger); // iOS haptic when tapping the brand to open
  trigger.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}
