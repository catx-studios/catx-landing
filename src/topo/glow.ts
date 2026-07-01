// Cursor model: a page-wide brightness gradient plus a purely-local vertex pull.
// The two effects are independent — the glow reaches the whole page while the
// positional pull stays within PULL_RADIUS.
import {
  PULL_RADIUS, MOUSE_PULL, AMBIENT, GLOW_BASE, GLOW_GAMMA, DENS_NORM,
} from '../config';

export interface Mouse {
  x: number;
  y: number;
  amp: number; // eased current amplitude
  targetAmp: number; // 0 or 1
}

export const createMouse = (): Mouse => ({ x: -9999, y: -9999, amp: 0, targetAmp: 0 });

// Local radial nudge — a continuous function of position, so it warps existing
// contour vertices without spawning new lines. Quadratic falloff to the radius.
export function pullX(m: Mouse, x: number, y: number): number {
  if (m.amp < 0.001) return x;
  const dx = x - m.x, dy = y - m.y, d = Math.hypot(dx, dy);
  if (d > PULL_RADIUS || d < 0.0001) return x;
  return x + (dx / d) * (1 - d / PULL_RADIUS) ** 2 * MOUSE_PULL * m.amp;
}

export function pullY(m: Mouse, x: number, y: number): number {
  if (m.amp < 0.001) return y;
  const dx = x - m.x, dy = y - m.y, d = Math.hypot(dx, dy);
  if (d > PULL_RADIUS || d < 0.0001) return y;
  return y + (dy / d) * (1 - d / PULL_RADIUS) ** 2 * MOUSE_PULL * m.amp;
}

// Brightness for one cell: page-wide radial gradient (gamma falloff) combined
// with the local line-density boost. Caller gates this on an active cursor.
export function cellAlpha(
  m: Mouse, cx: number, cy: number, glowRadius: number, crossings: number,
): number {
  const dist = Math.hypot(cx - m.x, cy - m.y);
  let distF = Math.max(0, 1 - dist / glowRadius); // page-wide gradient
  distF = Math.pow(distF, GLOW_GAMMA); // steeper = harder contrast
  const densF = Math.min(1, crossings / DENS_NORM); // local line density
  return AMBIENT + GLOW_BASE * m.amp * distF * (0.15 + densF);
}
