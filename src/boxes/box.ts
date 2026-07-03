// Per-box WebGL renderer. Returns a draw(time) closure, or null if this context
// can't be created (caller filters those out — the box degrades to its CSS border).
import { VERT, FRAG } from './shaders';
import { currentDPR } from '../env';
import { HOVER_EASE, BURST_DECAY, type BoxDef } from '../config';
import { installHaptic, tapHaptic } from '../haptics';

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

export type DrawBox = (time: number) => void;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

export function makeBox(canvas: HTMLCanvasElement, def: BoxDef, animate: boolean): DrawBox | null {
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false, antialias: true });
  if (!gl) return null;

  const prog = gl.createProgram();
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  if (!prog || !vs || !fs) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'uTime');
  const uSize = gl.getUniformLocation(prog, 'uSize');
  const uPeriod = gl.getUniformLocation(prog, 'uPeriod');
  const uPattern = gl.getUniformLocation(prog, 'uPattern');
  const uColor = gl.getUniformLocation(prog, 'uColor');
  const uHover = gl.getUniformLocation(prog, 'uHover');
  const uTouch = gl.getUniformLocation(prog, 'uTouch');
  const uBurst = gl.getUniformLocation(prog, 'uBurst');

  const color: [number, number, number] = [
    def.color[0] / 255, def.color[1] / 255, def.color[2] / 255,
  ];
  let w = 0, h = 0, hover = 0, hoverAmp = 0;
  let touchU = 0.5, touchV = 0.5, burst = 0;
  const host = canvas.parentElement;
  if (host) {
    installHaptic(host); // iOS: covering `switch` overlay; real touch fires the base Taptic tick

    const setTouch = (e: PointerEvent): void => {
      const r = host.getBoundingClientRect();
      touchU = clamp01((e.clientX - r.left) / Math.max(r.width, 1));
      touchV = clamp01(1 - (e.clientY - r.top) / Math.max(r.height, 1)); // flip: WebGL uv.y is bottom-up
    };

    // Touch feedback fires regardless of reduced motion (it gates visual motion, not
    // haptics). The shockwave/hover uniforms only matter when the render loop runs.
    host.addEventListener('pointerdown', (e) => {
      setTouch(e);
      burst = 1;    // fire the shockwave from the touch point
      hover = 1;
      if (e.pointerType === 'touch') tapHaptic(); // uniform crisp tick; per-box identity is visual
    });
    if (animate) {
      const release = (): void => { hover = 0; };
      host.addEventListener('pointermove', (e) => { if (hover || burst > 0.05) setTouch(e); });
      host.addEventListener('pointerenter', () => { hover = 1; }); // desktop hover
      host.addEventListener('pointerup', release);
      host.addEventListener('pointerleave', release);
      host.addEventListener('pointercancel', release); // iOS canceled the gesture — don't stick "pressed"
    }
  }

  return function draw(time: number): void {
    const dpr = currentDPR(), cw = canvas.clientWidth, ch = canvas.clientHeight;
    if (cw !== w || ch !== h) {
      w = cw; h = ch;
      canvas.width = Math.max(1, Math.round(cw * dpr));
      canvas.height = Math.max(1, Math.round(ch * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    hoverAmp += (hover - hoverAmp) * HOVER_EASE; // ease hover in/out
    burst *= BURST_DECAY;                        // decay the touch shockwave
    if (burst < 0.002) burst = 0;
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uTime, time * 0.001);
    gl.uniform2f(uSize, cw, ch);
    gl.uniform1f(uPeriod, def.period);
    gl.uniform1i(uPattern, def.pattern);
    gl.uniform3f(uColor, color[0], color[1], color[2]);
    gl.uniform1f(uHover, hoverAmp);
    gl.uniform2f(uTouch, touchU, touchV);
    gl.uniform1f(uBurst, burst);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
}
