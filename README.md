# catx-landing

The catx-studios landing site — a dark, monospace single page: an interactive
topographic contour background (Canvas2D) behind five floating WebGL pattern
boxes, a vignette, and a pulsing wordmark.

Rebuilt from the single-file prototype into a modular, type-checked, minified
static site. The prototype remains the visual contract; this renders identically.

## Develop

```sh
npm install
npm run dev        # Vite dev server
npm run build      # typecheck + minified static build → dist/
npm run preview    # serve the production build locally
```

## Structure

```
index.html            shell: #topo canvas, .boxes, .vignette, .brand
src/
  main.ts             boot: mount topo + boxes
  config.ts           box layout + all hand-tuned constants (single source)
  env.ts              isMobile / prefers-reduced-motion / DPR cap helpers
  styles.css          reset, layout, box drift keyframes, brand, media queries
  topo/
    field.ts          integer-hash value noise → fbm terrain
    marching.ts       marching squares: cell → contour segments (16 cases)
    glow.ts           cursor model: page-wide brightness + local vertex pull
    topo.ts           canvas / DPR / resize, RAF loop, Path2D brightness bucketing
  boxes/
    shaders.ts        vertex + fragment source, pattern set (0..4)
    box.ts            per-box WebGL renderer + hover easing
    boxes.ts          build boxes from config, drive the draw loop
```

## Accessibility & fallbacks

- `prefers-reduced-motion: reduce` freezes all motion and renders one static frame.
- Boxes whose WebGL context can't be created are skipped and keep their CSS border;
  the Canvas2D topo background always renders.
