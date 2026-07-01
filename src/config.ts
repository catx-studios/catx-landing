// Hand-tuned constants captured verbatim from the prototype. Do not re-derive —
// these are the visual contract. See wkt-docs/catx-landing/plans for the spec.

// --- Topographic contour field ---
export const LEVELS = 34; // iso-levels (contour rings)
export const SCALE = 0.0042; // terrain frequency
export const FLOW = 0.000015; // ambient drift speed

export const GLOW_SPAN = 1.5; // glow radius = viewport diagonal * this (>1 reaches whole page)
export const AMBIENT = 0.035; // very dim baseline line brightness
export const GLOW_BASE = 0.68; // near-white peak at the cursor
export const GLOW_GAMMA = 2.6; // brightness falloff steepness
export const DENS_NORM = 3; // line crossings for a full local-density boost
export const NB = 30; // brightness buckets (one Path2D stroke per band)

export const PULL_RADIUS = 150; // local vertex-pull radius (px) — stays local
export const MOUSE_PULL = 6; // local vertex-pull strength

export const CELL_DESKTOP = 28; // grid cell size (px)
export const CELL_MOBILE = 34;

export const AMP_EASE = 0.05; // glow amplitude ease-in/out per frame
export const MOBILE_RELEASE_MS = 600; // glow hold after touch release
export const RESIZE_DEBOUNCE_MS = 150;
export const MAX_DPR = 2; // device-pixel-ratio cap (perf)

export const MAX_ALPHA = AMBIENT + GLOW_BASE * 1.15;

// --- Floating WebGL pattern boxes ---
export const HOVER_EASE = 0.09; // box hover-morph ease-in/out per frame

export interface BoxDef {
  cls: string; // CSS class carrying position / size / drift keyframes
  pattern: number; // 0 diag stripes · 1 grid · 2 anti-diag · 3 dots · 4 h-lines
  period: number; // pattern period (px)
  color: [number, number, number]; // reserved accent, 0..255
}

export const BOX_LAYOUT: BoxDef[] = [
  { cls: 'b1', pattern: 0, period: 12, color: [255, 70, 70] },
  { cls: 'b2', pattern: 1, period: 10, color: [70, 120, 255] },
  { cls: 'b3', pattern: 2, period: 16, color: [70, 200, 110] },
  { cls: 'b4', pattern: 3, period: 12, color: [255, 205, 70] },
  { cls: 'b5', pattern: 4, period: 20, color: [210, 215, 230] },
];
