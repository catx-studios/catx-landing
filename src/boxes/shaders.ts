// Shared program for every pattern box. Patterns are selected by uPattern (0..4).
// Ambient state morphs subtly with uHover; a touch fires a position-aware SHOCKWAVE
// from uTouch whose amplitude is uBurst (1 at tap -> 0 as it decays in JS). Each
// pattern gets a distinct burst character (ripple / shatter / swirl / bloom / glitch),
// so every box reacts differently — coordinated with its per-box haptic signature.

export const VERT = `
  attribute vec2 aPos; varying vec2 vUv;
  void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

export const FRAG = `
  precision mediump float;
  varying vec2 vUv;
  uniform float uTime; uniform vec2 uSize; uniform float uPeriod;
  uniform int uPattern; uniform vec3 uColor; uniform float uHover;
  uniform vec2 uTouch;   // burst origin in UV (0..1)
  uniform float uBurst;  // burst amplitude, 1 at tap -> 0

  float patternVal(vec2 px, float p){
    float thick = 1.0, v = 0.0;
    if (uPattern == 0) { float f = fract((px.x+px.y)/p); v = smoothstep(thick,0.0,min(f,1.0-f)*p); }
    else if (uPattern == 1) { float fx=fract(px.x/p), fy=fract(px.y/p);
      v = max(smoothstep(thick,0.0,min(fx,1.0-fx)*p), smoothstep(thick,0.0,min(fy,1.0-fy)*p)); }
    else if (uPattern == 2) { float f = fract((px.x-px.y)/p); v = smoothstep(thick,0.0,min(f,1.0-f)*p); }
    else if (uPattern == 3) { vec2 g = fract(px/p)-0.5; v = smoothstep(2.0,1.0,length(g)*p); }
    else { float fy = fract(px.y/p); v = smoothstep(thick,0.0,min(fy,1.0-fy)*p); }
    return v;
  }

  void main(){
    vec2 uv = vUv;
    vec2 px = uv * uSize;
    vec2 ctr = uSize * 0.5;
    vec2 rel = px - ctr;
    float rr = length(rel) / max(length(ctr), 1.0);

    // aspect-corrected field around the touch point
    float aspect = uSize.x / max(uSize.y, 1.0);
    vec2 duv = uv - uTouch; duv.x *= aspect;
    float d = length(duv);
    vec2 dir = duv / max(d, 1e-3);

    // expanding shockwave — radius grows as the burst fades
    float e = 1.0 - uBurst;
    float R = e * 1.35;
    float ring = smoothstep(0.12, 0.0, abs(d - R)) * uBurst;
    float flash = smoothstep(0.32, 0.0, d) * uBurst;

    // per-box burst displacement — each pattern reacts with its own character
    vec2 warp = vec2(0.0);
    if (uPattern == 0)      warp = dir * ring * 46.0;                                          // ripple: shove along the wavefront
    else if (uPattern == 1) warp = dir * uBurst * 70.0 * smoothstep(1.3, 0.0, d);              // shatter: explosive zoom-out
    else if (uPattern == 2) warp = vec2(-dir.y, dir.x) * uBurst * 34.0 * smoothstep(1.1, 0.0, d); // swirl: rotate around touch
    else if (uPattern == 3) warp = -dir * uBurst * 30.0 * smoothstep(0.85, 0.0, d);            // bloom: pull inward
    else                    warp = vec2(sin(uv.y*70.0 + uTime*22.0) * uBurst * 34.0 * smoothstep(0.55, 0.0, abs(duv.y)), 0.0); // glitch: horizontal tear

    float t = uTime * 0.7;
    vec2 pxd = px + warp;
    pxd += vec2(sin(pxd.y*0.045 + t), cos(pxd.x*0.045 + t*0.9)) * (5.0 * uHover); // ambient drift

    float v = patternVal(pxd, uPeriod);

    vec3 base = mix(vec3(0.36), uColor, 0.22);
    vec3 col  = mix(base, base + vec3(0.30), v);

    // coordinate color with the burst: pattern floods to its accent, ring flashes white-hot
    col = mix(col, uColor, ring * 0.9);
    col += uColor * flash * 0.9;
    col += vec3(0.30) * ring;
    col *= 1.0 - 0.30 * rr * rr * uHover;
    col += col * uBurst * 0.5;

    // Higher, steadier opacity so the boxes read consistently regardless of what's behind
    // them or device transparency/contrast settings — not a faint overlay on the backdrop.
    float alpha = clamp(0.82 - 0.08 * uHover + ring * 0.45 + flash * 0.45, 0.0, 1.0);
    gl_FragColor = vec4(col, alpha);
  }`;
