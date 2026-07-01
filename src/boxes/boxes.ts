// Builds the 5 pattern boxes from BOX_LAYOUT, wires each to a WebGL renderer,
// and drives them from one RAF loop. Boxes whose context fails are skipped
// (they keep their CSS border). Reduced motion renders one static frame.
import { BOX_LAYOUT } from '../config';
import { prefersReducedMotion } from '../env';
import { makeBox, type DrawBox } from './box';

export function initBoxes(container: HTMLElement): void {
  const animate = !prefersReducedMotion();
  const draws: DrawBox[] = [];

  for (const def of BOX_LAYOUT) {
    const box = document.createElement('div');
    box.className = `box ${def.cls}`;
    const canvas = document.createElement('canvas');
    box.appendChild(canvas);
    container.appendChild(box);

    const draw = makeBox(canvas, def, animate);
    if (draw) draws.push(draw);
  }

  if (!animate) {
    for (const draw of draws) draw(0); // single static frame
    return;
  }

  function loop(t: number): void {
    for (const draw of draws) draw(t);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
