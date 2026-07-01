// Shared program for every pattern box. Patterns are selected by uPattern (0..4);
// hover drives a dramatic radial morph-out. Ported verbatim from the prototype.

export const VERT = `
  attribute vec2 aPos; varying vec2 vUv;
  void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

export const FRAG = `
  precision mediump float;
  varying vec2 vUv;
  uniform float uTime; uniform vec2 uSize; uniform float uPeriod;
  uniform int uPattern; uniform vec3 uColor; uniform float uHover;
  void main(){
    vec2 px = vUv * uSize;
    vec2 ctr = uSize * 0.5;
    vec2 rel = px - ctr;
    float rr = length(rel) / max(length(ctr), 1.0);
    float pulse = 0.5 + 0.5 * sin(uTime * 1.3);
    float m = uHover;                                              // effect gated to hover
    px = ctr + rel * (1.0 + m * (0.8 + pulse * 1.6) * rr * rr);    // DRAMATIC morph OUT on hover
    float t = uTime * 0.7;
    px += vec2(sin(px.y*0.045 + t), cos(px.x*0.045 + t*0.9)) * (5.0 * m);
    float thick = 1.0, p = uPeriod, v = 0.0;
    if (uPattern == 0) { float f = fract((px.x+px.y)/p); v = smoothstep(thick,0.0,min(f,1.0-f)*p); }
    else if (uPattern == 1) { float fx=fract(px.x/p), fy=fract(px.y/p);
      v = max(smoothstep(thick,0.0,min(fx,1.0-fx)*p), smoothstep(thick,0.0,min(fy,1.0-fy)*p)); }
    else if (uPattern == 2) { float f = fract((px.x-px.y)/p); v = smoothstep(thick,0.0,min(f,1.0-f)*p); }
    else if (uPattern == 3) { vec2 g = fract(px/p)-0.5; v = smoothstep(2.0,1.0,length(g)*p); }
    else { float fy = fract(px.y/p); v = smoothstep(thick,0.0,min(fy,1.0-fy)*p); }
    vec3 base = mix(vec3(0.26), uColor, 0.14);          // dark grey, slight primary tint
    vec3 col  = mix(base, base + vec3(0.22), v);        // lighter pattern lines on dark
    col *= 1.0 - 0.30 * rr * rr * m;                    // stronger dome while morphing
    float alpha = 0.55 - 0.16 * m;                      // semi-transparent, more so on hover
    gl_FragColor = vec4(col, alpha);
  }`;
