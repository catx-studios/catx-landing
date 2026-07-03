// Cross-platform touch haptics — deliberately UNIFORM (one crisp tick per tap on every
// box and every platform). This is a consistency choice, not a limitation we settled for:
// on modern iOS the web can only fire a single fixed Taptic tick per real touch (Apple
// patched programmatic/timed haptics in iOS 26.5 — no length, intensity, or per-box
// variation possible), so Android matches it with one short vibration. Per-box identity
// lives in the visuals, not the haptics.
//
// iOS mechanism: overlay a covering <input type="checkbox" switch> (iOS 17.4+) whose REAL
// touch fires the tick. We deliberately do NOT force position:relative on the host (the
// way the ios-haptics npm package does) — that clobbers our absolutely-positioned boxes
// and fixed brand. Our targets are already positioned, so the absolute switch anchors
// to them directly and the layout is untouched.

const SWITCH_CSS =
  'position:absolute;inset:0;width:100%;height:100%;margin:0;border:0;' +
  'opacity:0;clip-path:inset(0 round 999px);touch-action:manipulation;';

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // iPadOS 13+ reports as Mac
}

// iOS only: overlay a covering switch so a real touch fires the tick. Assumes the host is
// already positioned (absolute/fixed/relative) — true for the boxes and the brand — so no
// position override is needed and the layout is left untouched.
export function installHaptic(element: HTMLElement): void {
  if (!isIos() || element.querySelector(':scope > input[switch]')) return;
  const sw = document.createElement('input');
  sw.type = 'checkbox';
  sw.setAttribute('switch', '');
  sw.setAttribute('aria-hidden', 'true');
  sw.tabIndex = -1;
  sw.style.cssText = SWITCH_CSS;
  sw.style.setProperty('-webkit-tap-highlight-color', 'transparent');
  element.insertAdjacentElement('beforeend', sw);
}

// One crisp tap, identical everywhere. On iOS the covering switch already fired the tick
// from the real touch, so this only drives the Android/Vibration-API path — kept to a
// single short pulse to match iOS exactly.
export function tapHaptic(): void {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(12);
  }
}
