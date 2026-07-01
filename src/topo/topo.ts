// Topographic contour background: DPR-aware canvas, RAF loop, and the
// performance-critical Path2D brightness bucketing (one stroke per band).
import {
  SCALE, FLOW, GLOW_SPAN, AMBIENT, NB, MAX_ALPHA,
  CELL_DESKTOP, CELL_MOBILE, AMP_EASE, MOBILE_RELEASE_MS, RESIZE_DEBOUNCE_MS,
} from '../config';
import { isMobile, prefersReducedMotion, currentDPR } from '../env';
import { fbm } from './field';
import { createMouse, cellAlpha } from './glow';
import { scratch, cellSegments } from './marching';

export function initTopo(canvas: HTMLCanvasElement): void {
  const context = canvas.getContext('2d');
  if (!context) return; // Canvas2D unavailable — nothing to render, page stays dark.
  const ctx: CanvasRenderingContext2D = context;

  let width = 0, height = 0, cell = CELL_DESKTOP, cols = 0, rows = 0, glowRadius = 0;
  let field = new Float64Array(0);
  const mouse = createMouse();

  function resize(): void {
    const dpr = currentDPR();
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cell = isMobile() ? CELL_MOBILE : CELL_DESKTOP;
    cols = Math.ceil(width / cell);
    rows = Math.ceil(height / cell);
    glowRadius = Math.hypot(width, height) * GLOW_SPAN;
    field = new Float64Array((cols + 1) * (rows + 1));
  }

  function render(t: number): void {
    ctx.clearRect(0, 0, width, height);
    mouse.amp += (mouse.targetAmp - mouse.amp) * AMP_EASE;
    const tz = t * FLOW, w1 = cols + 1;

    for (let j = 0; j <= rows; j++)
      for (let i = 0; i <= cols; i++)
        field[j * w1 + i] = fbm(i * cell * SCALE + tz, j * cell * SCALE - tz);

    // One bucket Path2D per brightness band — batches every same-brightness
    // segment into a single stroke(), which is what keeps 34 levels cheap.
    const paths: Path2D[] = new Array(NB);
    for (let b = 0; b < NB; b++) paths[b] = new Path2D();

    const active = mouse.amp > 0.02;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const crossings = cellSegments(field, mouse, i, j, cell, cols);
        if (crossings === 0) continue;

        let alpha = AMBIENT;
        if (active) {
          const cx = i * cell + cell / 2, cy = j * cell + cell / 2;
          alpha = cellAlpha(mouse, cx, cy, glowRadius, crossings);
        }

        let b = (alpha / MAX_ALPHA * NB) | 0;
        if (b >= NB) b = NB - 1;
        const p = paths[b];
        const seg = scratch.seg;
        for (let k = 0; k < scratch.n; k += 4) {
          p.moveTo(seg[k], seg[k + 1]);
          p.lineTo(seg[k + 2], seg[k + 3]);
        }
      }
    }

    ctx.lineWidth = 1;
    for (let b = 0; b < NB; b++) {
      const a = (b + 0.5) / NB * MAX_ALPHA;
      ctx.strokeStyle = `rgba(255,255,255,${a})`;
      ctx.stroke(paths[b]);
    }
  }

  // Reduced motion: render a single static frame (no drift, no cursor glow) and
  // only re-render on resize.
  if (prefersReducedMotion()) {
    resize();
    render(0);
    window.addEventListener('resize', () => { resize(); render(0); });
    return;
  }

  function tick(t: number): void {
    render(t);
    requestAnimationFrame(tick);
  }

  window.addEventListener('pointermove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.targetAmp = 1;
  });
  window.addEventListener('pointerleave', () => { mouse.targetAmp = 0; });
  window.addEventListener('pointerdown', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.targetAmp = 1;
  });
  window.addEventListener('pointerup', () => {
    if (isMobile()) window.setTimeout(() => { mouse.targetAmp = 0; }, MOBILE_RELEASE_MS);
  });

  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, RESIZE_DEBOUNCE_MS);
  });

  resize();
  requestAnimationFrame(tick);
}
