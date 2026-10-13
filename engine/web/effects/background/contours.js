// Topographic contour map of a slowly breathing landscape. A smooth noise height
// field (periodic along its time axis, so the loop is seamless) is drawn as
// anti-aliased iso-lines: thin minor contours, a heavier index contour every fifth
// level, and a single accent-coloured elevation that wanders through the terrain.
export const meta = {
  id: 'background.contours',
  name: 'Contours',
  category: 'background',
  duration: 12,
  loop: true,
  ownsBackground: true,
  summary: 'Topographic iso-lines of a slowly evolving height field, with index contours and one accent elevation line; seamless loop with the headline on top.',
  bestFor: ['backdrop', 'title card', 'data / mapping themes'],
  slots: ['headline'],
  params: {
    title: { default: true, label: 'Show headline on top' },
    levels: { default: 44, min: 12, max: 80, label: 'Contour levels' },
  },
  prompt: `Seamless 12000 ms loop drawn in a full-resolution fragment shader. Height = 3-octave value-noise fbm at 1.1 cycles per short side, domain-warped once, with a lattice that is periodic along its time axis; time walks that axis exactly once per loop. Contours: v = height x 44; line mask = 1 - smoothstep(0, 1, |fract(v - 0.5) - 0.5| / fwidth(v) / w), with w = 0.7 px for minor lines and 1.5 px for every fifth (index) level. Minor lines 16% foreground, index lines 34%; one chosen level is drawn in the accent at 85% with a soft 6 px glow on dark brands. Add a faint hillshade (height gradient dotted with a light from the top left, ±3%). Fade lines to 25% inside an ellipse behind the static centred headline (display 92 ref px, weight 620, tracking -0.03 em).`,
};

const FRAG = `
vec3 lin(vec3 c){ return pow(c, vec3(2.2)); }
const vec3 PER = vec3(256.0, 256.0, 3.0);
float hp(vec3 i, vec3 per){ i = mod(i, per); return fract(sin(dot(i, vec3(127.1, 311.7, 74.7)) + seed) * 43758.5453); }
float pn(vec3 p, vec3 per){
  vec3 i = floor(p), f = fract(p); f = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(mix(mix(hp(i, per), hp(i + vec3(1,0,0), per), f.x), mix(hp(i + vec3(0,1,0), per), hp(i + vec3(1,1,0), per), f.x), f.y),
             mix(mix(hp(i + vec3(0,0,1), per), hp(i + vec3(1,0,1), per), f.x), mix(hp(i + vec3(0,1,1), per), hp(i + vec3(1,1,1), per), f.x), f.y), f.z);
}
float fbm(vec3 p){
  float s = 0.0, a = 0.5, n = 0.0; vec3 per = PER;
  for (int i = 0; i < 3; i++) { s += a * pn(p, per); n += a; p.xy *= 2.03; p.z *= 2.0; per.z *= 2.0; a *= 0.45; }
  return s / n;
}
float height(vec2 q, float tz){
  vec2 w = vec2(fbm(vec3(q * 0.7 + 4.1, tz)), fbm(vec3(q * 0.7 + 9.3, tz + 1.0))) - 0.5;
  return fbm(vec3(q + w * 0.9, tz));
}
float iso(float v, float w){
  float fw = max(fwidth(v), 1e-4);
  float d = abs(fract(v - 0.5) - 0.5) / fw;
  return 1.0 - smoothstep(w * 0.5, w * 0.5 + 1.0, d);
}
void main(){
  vec2 q = (uv - 0.5) * res / min(res.x, res.y);
  float tz = t * PER.z;
  float h = height(q * 1.1 + vec2(3.0, 1.0), tz);
  float N = pA.x;
  float v = h * N;
  float minor = iso(v, 0.7 * pA.w);
  float major = iso(v / 5.0, 1.5 * pA.w);
  // one accent elevation (a level just above the median height)
  float accV = (h - (0.5 + 0.035)) * N;
  float accD = abs(accV) / max(fwidth(accV), 1e-4); // pixels from that single level
  float acc = 1.0 - smoothstep(0.8 * pA.w, 0.8 * pA.w + 1.0, accD);
  float accGlow = exp(-accD / (6.0 * pA.w));
  // hillshade
  vec2 gr = vec2(dFdx(h), dFdy(h)) / max(fwidth(q.x), 1e-5);
  float shade = clamp(dot(gr, normalize(vec2(-1.0, 1.0))) * 0.25, -1.0, 1.0);
  // calm area behind the title
  vec2 e = (uv - 0.5) / pB.xy;
  float calm = mix(1.0, 0.25 + 0.75 * smoothstep(0.55, 1.6, dot(e, e)), pB.z);
  vec3 base = lin(bg.rgb);
  vec3 fgc = lin(c1.rgb), ac = lin(c0.rgb);
  bool dark = pA.y > 0.5;
  vec3 col = base * (1.0 + shade * (dark ? 0.6 : 0.03)) + (dark ? fgc * 0.004 * shade : vec3(0.0));
  float ln = max(minor * 0.16, major * 0.34) * calm;
  col = mix(col, fgc, ln * (dark ? 0.55 : 1.0));
  if (dark) col += ac * accGlow * 0.04 * calm;
  col = mix(col, ac, acc * 0.85 * calm * calm);
  float vg = length((uv - 0.5) * vec2(res.x / res.y, 1.0));
  col *= 1.0 - 0.15 * smoothstep(0.45, 1.1, vg);
  o = vec4(pow(max(col, 0.0), vec3(1.0/2.2)), 1.0);
}`;

export function create(k, p) {
  const D = p.duration ?? meta.duration;
  const c = k.brand.colors;
  const sh = k.shader(FRAG, 1);
  const str = k.copy('headline', k.brand.name);
  const to = { size: k.pick({ wide: 92, square: 84, tall: 80 }), weight: 620, tracking: -0.03 };
  const lines = k.text.balance(str, to, k.safe.w * k.pick({ wide: 0.62, square: 0.8, tall: 0.86 }));
  const ex = k.pick({ wide: 0.34, square: 0.42, tall: 0.46 }), ey = k.pick({ wide: 0.17, square: 0.14, tall: 0.1 });
  const u = {
    c0: k.vec4(c.accent), c1: k.vec4(c.fg), bg: k.vec4(c.bg),
    pA: [p.levels, k.isDark ? 1 : 0, 0, Math.max(1, k.u)], pB: [ex, ey, p.title ? 1 : 0, 0], seed: 2.1,
  };
  return {
    draw(g, t) {
      u.t = (t / D) % 1;
      g.drawImage(sh(u), 0, 0, k.W, k.H);
      if (p.title) {
        const lh = to.size * 1.08 * k.u;
        const top = k.cy - ((lines.length - 1) * lh) / 2;
        lines.forEach((ln, i) => k.text.draw(g, ln, k.cx, top + i * lh, { ...to, align: 'center', baseline: 'middle', qaGroup: str }));
      }
    },
  };
}
