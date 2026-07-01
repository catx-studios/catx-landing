import './styles.css';
import { initTopo } from './topo/topo';
import { initBoxes } from './boxes/boxes';

const topo = document.getElementById('topo');
if (topo instanceof HTMLCanvasElement) initTopo(topo);

const boxes = document.querySelector('.boxes');
if (boxes instanceof HTMLElement) initBoxes(boxes);
