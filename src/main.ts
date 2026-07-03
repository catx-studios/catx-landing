import './styles.css';
import { initTopo } from './topo/topo';
import { initBoxes } from './boxes/boxes';

const topo = document.getElementById('topo');
if (topo instanceof HTMLCanvasElement) initTopo(topo);

const boxes = document.querySelector('.boxes');
if (boxes instanceof HTMLElement) initBoxes(boxes);

// About/me modal disabled for now (kept in src/about/about.ts) — will be replaced by a
// linked bio + "4 Ps" floating-letters page. See docs.local/ideas.
