// Two layers of fbm fog drift sideways and slowly re-form, lit from the left by a
// low accent-coloured key light. Lighting is the classic cheap volumetric trick:
// density sampled again one step toward the light gives self-shadowing, so the
// edges facing the light glow and the backs fall into shade. Noise is periodic in
// its time axis and the drift uses a two-phase crossfade, so the loop is seamless.
export const meta = {
  id: 'background.fog-noise',
  name: 'Fog Noise',
  category: 'background',
  duration: 12,
  loop: true,
  ownsBackground: true,
  summary: 'Two parallax layers of soft fog drift and re-form, side-lit by an accent key light from the left; seamless loop with the headline on top.',
  bestFor: ['backdrop', 'title card', 'moody intro'],
  slots: ['headline'],
  params: {
    title: { default: true, label: 'Show headline on top' },
    density: { default: 1, min: 0.4, max: 1.6, label: 'Fog density' },
  },
  prompt: `Seamless 12000 ms loop, fragment shader at 40% resolution. Density = 4-octave value-noise fbm (gain 0.42) whose lattice is periodic along its time axis; time walks that axis once per loop so the fog re-forms seamlessly. Sideways drift uses two copies offset by half a cycle, each sliding 0.6 noise units then crossfading with a triangle weight. Two layers, squashed 1.7x vertically so they read as banks: far (scale 1.3, drift 1x, 75% coverage) and near (scale 0.75, drift 2x, 90%); coverage = smoothstep(0.46, 0.72, density); fog brightness comes almost entirely from the light. Light: sample density again 0.05 units toward the light (left, slightly up); the difference gives a lit rim, mixed from a neutral tone to the accent and multiplied by an exp falloff from the left edge (exp falloff with a 50% of width scale) plus a soft source glow off-frame left at 35% height. Dark brands add light; light brands shade the fog to 72% of the paper tone and tint lit rims with 20% accent. Static centred headline: display 92 ref px, weight 620, tracking -0.03 em.`,
};

const FRAG = `
vec3 lin(vec3 c){ return pow(c, vec3(2.2)); }
const vec3 PER = vec3(64.0, 64.0, 2.0);
float hp(vec3 i, vec3 per){ i = mod(i, per); return fract(sin(dot(i, vec3(127.1, 311.7, 74.7)) + seed) * 43758.5453); }
float pn(vec3 p, vec3 per){
  vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hp(i, per), hp(i + vec3(1,0,0), per), f.x), mix(hp(i + vec3(0,1,0), per), hp(i + vec3(1,1,0), per), f.x), f.y),
             mix(mix(hp(i + vec3(0,0,1), per), hp(i + vec3(1,0,1), per), f.x), mix(hp(i + vec3(0,1,1), per), hp(i + vec3(1,1,1), per), f.x), f.y), f.z);
}
float fbm(vec3 p){
  float s = 0.0, a = 0.5, n = 0.0; vec3 per = PER;
  for (int i = 0; i < 4; i++) { s += a * pn(p, per); n += a; p *= 2.0; per *= 2.0; a *= 0.42; }
  return s / n;
}
// drifting density with a two-phase crossfade (flow-map style) -> seamless drift
float dens(vec2 q, float drift, float tz){
  float f1 = fract(t * drift), f2 = fract(t * drift + 0.5);
  float w = abs(2.0 * f1 - 1.0); // 1 at f1=0/1 (copy 2 at its midpoint), 0 at f1=0.5
  float n1 = fbm(vec3(q.x - f1 * 0.6, q.y + 0.13 * f1, tz));
  float n2 = fbm(vec3(q.x - f2 * 0.6 + 17.3, q.y + 0.13 * f2 + 5.1, tz));
  float n = mix(n1, n2, w);
  // restore contrast lost in the blend
  float k = 1.0 / sqrt(w * w + (1.0 - w) * (1.0 - w));
  return 0.5 + (n - 0.5) * k;
}
void main(){
  float asp = res.x / res.y;
  vec2 p = uv * res / min(res.x, res.y); // short side = 1 unit in every aspect
  float tz = t * PER.z; // walks the periodic time axis once per loop
  vec3 base = lin(bg.rgb);
  vec3 acc = lin(c0.rgb), neu = lin(c1.rgb);
  bool dark = pA.y > 0.5;
  vec3 col = base;
  // light: falloff from the left edge plus an off-frame source glow
  float fall = exp(-uv.x / 0.5);
  float glow = exp(-length((uv - vec2(-0.08, 0.62)) * vec2(1.4, 1.4)) * 2.2);
  vec2 L = normalize(vec2(-1.0, 0.25)) * 0.05;
  for (int i = 0; i < 2; i++) {
    float fi = float(i);
    float sc = mix(1.3, 0.75, fi);
    float drift = mix(1.0, 2.0, fi);
    vec2 q = p * sc + vec2(fi * 7.7, fi * 3.3);
    // stretch sideways so the forms read as banks and wisps, not blotches
    q.y *= 1.7;
    float d0 = dens(q, drift, tz + fi * 2.0);
    float d1 = dens(q + L * sc, drift, tz + fi * 2.0);
    float shape = smoothstep(0.52 - 0.06 * pA.x, 0.72, d0) * mix(0.8, 0.95, fi) * min(pA.x, 1.2);
    float lit = clamp((d0 - d1) * 9.0 + 0.25, 0.0, 1.0);
    float light = lit * (0.15 + 0.85 * fall) + glow * 0.35;
    vec3 fogLit = mix(neu, acc, 0.35 + 0.65 * fall);
    if (dark) {
      vec3 fc = base + fogLit * (0.0035 + light * 0.3 * (0.15 + 0.85 * fall));
      col = mix(col, fc, shape);
    } else {
      vec3 shade = mix(base * 0.72, neu * 0.9, 0.12);
      vec3 fc = mix(shade, base * 0.8 + acc * 0.2, clamp(light * 0.7, 0.0, 1.0));
      col = mix(col, fc, shape * 0.6);
    }
  }
  // the light source itself, very soft
  col += (dark ? 0.025 : 0.0) * acc * glow;
  float v = length((uv - 0.5) * vec2(asp, 1.0));
  col *= 1.0 - 0.18 * smoothstep(0.4, 1.1, v);
  o = vec4(pow(col, vec3(1.0/2.2)), 1.0);
}`;

export function create(k, p) {
  const D = p.duration ?? meta.duration;
  const c = k.brand.colors;
  const sh = k.shader(FRAG, 0.4);
  const str = k.copy('headline', k.brand.name);
  const to = { size: k.pick({ wide: 92, square: 84, tall: 80 }), weight: 620, tracking: -0.03 };
  const lines = k.text.balance(str, to, k.safe.w * k.pick({ wide: 0.62, square: 0.8, tall: 0.86 }));
  const u = {
    c0: k.vec4(c.accent), c1: k.vec4(k.isDark ? k.color.mix(c.fg, c.accent, 0.15) : c.muted), bg: k.vec4(c.bg),
    pA: [p.density, k.isDark ? 1 : 0, 0, 0], seed: 1.3,
  };
  return {
    draw(g, t) {
      u.t = (t / D) % 1;
      g.imageSmoothingQuality = 'high';
      g.drawImage(sh(u), 0, 0, k.W, k.H);
      if (p.title) {
        const lh = to.size * 1.08 * k.u;
        const top = k.cy - ((lines.length - 1) * lh) / 2;
        lines.forEach((ln, i) => k.text.draw(g, ln, k.cx, top + i * lh, { ...to, align: 'center', baseline: 'middle', qaGroup: str }));
      }
    },
  };
}
