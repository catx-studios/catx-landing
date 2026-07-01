// Marching squares over LEVELS iso-levels per grid cell. All 16 case handlers
// (including the two saddle cases 5 & 10) are ported verbatim. Vertices are
// warped by the cursor pull as they're emitted.
import { LEVELS } from '../config';
import { pullX, pullY, type Mouse } from './glow';

const lerp = (a: number, b: number, L: number): number => (L - a) / (b - a);

// Scratch state reused every frame — a single object so cross-module reads stay
// live regardless of bundler. `seg` holds [ax, ay, bx, by, ...]; `n` is its length.
export const scratch = { seg: new Float64Array(LEVELS * 8), n: 0 };

function push(m: Mouse, ax: number, ay: number, bx: number, by: number): void {
  const s = scratch.seg;
  s[scratch.n++] = pullX(m, ax, ay);
  s[scratch.n++] = pullY(m, ax, ay);
  s[scratch.n++] = pullX(m, bx, by);
  s[scratch.n++] = pullY(m, bx, by);
}

// Emits the contour segments for cell (i, j) into `scratch`; returns the crossing
// count (used for the local density boost).
export function cellSegments(
  field: Float64Array, m: Mouse, i: number, j: number, cell: number, cols: number,
): number {
  scratch.n = 0;
  const w1 = cols + 1, x = i * cell, y = j * cell;
  const tl = field[j * w1 + i], tr = field[j * w1 + i + 1];
  const br = field[(j + 1) * w1 + i + 1], bl = field[(j + 1) * w1 + i];
  let crossings = 0;

  for (let l = 1; l <= LEVELS; l++) {
    const L = l / (LEVELS + 1);
    const idx =
      (tl > L ? 8 : 0) | (tr > L ? 4 : 0) | (br > L ? 2 : 0) | (bl > L ? 1 : 0);
    if (idx === 0 || idx === 15) continue;

    const Tx = x + cell * lerp(tl, tr, L), Ty = y;
    const Rx = x + cell,                   Ry = y + cell * lerp(tr, br, L);
    const Bx = x + cell * lerp(bl, br, L), By = y + cell;
    const Lx = x,                          Ly = y + cell * lerp(tl, bl, L);

    switch (idx) {
      case 1:  push(m, Lx, Ly, Bx, By); crossings++; break;
      case 2:  push(m, Bx, By, Rx, Ry); crossings++; break;
      case 3:  push(m, Lx, Ly, Rx, Ry); crossings++; break;
      case 4:  push(m, Tx, Ty, Rx, Ry); crossings++; break;
      case 5:  push(m, Tx, Ty, Lx, Ly); push(m, Bx, By, Rx, Ry); crossings += 2; break;
      case 6:  push(m, Tx, Ty, Bx, By); crossings++; break;
      case 7:  push(m, Tx, Ty, Lx, Ly); crossings++; break;
      case 8:  push(m, Tx, Ty, Lx, Ly); crossings++; break;
      case 9:  push(m, Tx, Ty, Bx, By); crossings++; break;
      case 10: push(m, Tx, Ty, Rx, Ry); push(m, Lx, Ly, Bx, By); crossings += 2; break;
      case 11: push(m, Tx, Ty, Rx, Ry); crossings++; break;
      case 12: push(m, Lx, Ly, Rx, Ry); crossings++; break;
      case 13: push(m, Bx, By, Rx, Ry); crossings++; break;
      case 14: push(m, Lx, Ly, Bx, By); crossings++; break;
    }
  }
  return crossings;
}
