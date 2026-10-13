// Aurora: three soft light curtains hang in the upper sky. Each curtain is a wavy
// ribbon with a crisp, bright lower hem and long vertical rays that fade upward, the
// way real aurora looks. Everything moves on closed time loops (noise sampled on a
// circle), so the 10 s loop is seamless. The headline sits in the darker sky below.
export const meta = {
  id: 'background.aurora',
  name: 'Aurora',
  category: 'background',
  duration: 10,
  loop: true,
  ownsBackground: true,
  summary: 'Three rayed light curtains sway slowly in the upper sky in brand hues; seamless loop with a headline held in the calm lower sky.',
  bestFor: ['backdrop', 'title card', 'launch teaser'],
  slots: ['headline'],
  params: {
    title: { default: true, label: 'Show headline on top' },
    intensity: { default: 1, min: 0.3, max: 1.6, label: 'Light intensity' },
  },
  prompt: `Seamless 10000 ms aurora loop rendered in a fragment shader at half resolution. Three curtains at different depths; each is a horizontal ribbon whose hem height (30-40% from the top) is displaced by a broad sway, a fold wave and looped value noise (noise sampled on a circle of radius 0.6 so time wraps). Brightness profile per curtain: a sharp hem (exp falloff 1.4% of height below the line) and an upward tail (exp falloff 11-21% of height), multiplied by soft vertical rays (1D noise across x, 14-30 cycles per frame, sliding sideways on the loop) and a looped span mask so each curtain covers only part of the sky. Colour: accent at the hem fading to a 40% mix of accent and the secondary accent in the tail; composite additively in linear light on dark brands, and on light brands as a hue-normalised dye capped at 50% strength. Add a faint sky gradient and a horizon falloff. The headline sits static at 64% height: display 88 ref px, weight 620, tracking -0.03 em, balanced to 64% width.`,
};

const FRAG = `
vec3 lin(vec3 c){ return pow(c, vec3(2.2)); }
float h1(float n){ return fract(sin(n * 127.1 + seed) * 43758.5453); }
float h3(vec3 p){ return fract(sin(dot(p, vec3(127.1, 311.7, 74.7)) + seed) * 43758.5453); }
float vn(vec3 p){
  vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h3(i), h3(i + vec3(1,0,0)), f.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), f.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), f.x), f.y), f.z);
}
// time loop: sample noise on a circle in (y,z) so phase 0 == phase 1
float ln(float x, float k, float r){ float a = 6.2831853 * t; return vn(vec3(x, cos(a) * r + k, sin(a) * r + k * 1.7)); }
void main(){
  float asp = res.x / res.y;
  vec2 p = vec2(uv.x * asp, 1.0 - uv.y); // y down from top, 0..1
  float a = 6.2831853 * t;
  vec3 sky = lin(bg.rgb);
  vec3 acc = vec3(0.0);
  float tall = pB.x; // 1 on portrait frames: curtains sit a little higher
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float depth = 1.0 - fi * 0.3;
    float x = p.x * (0.8 + fi * 0.3) + fi * 3.1;
    // hem line: broad sway + folds + looped noise
    float hem = mix(0.30, 0.24, tall) + fi * 0.05
      + 0.050 * sin(x * 1.5 + a + fi * 2.0)
      + 0.022 * sin(x * 4.6 - a * 2.0 + fi * 1.3)
      + 0.070 * (ln(x * 1.4, fi * 5.0, 0.6) - 0.5);
    float d = p.y - hem; // >0 below the hem
    float prof = d > 0.0 ? exp(-d / 0.014) : exp(d / (0.11 + 0.05 * fi));
    // vertical rays: soft 1D noise across x, sliding on the loop
    float rx = x * (14.0 + fi * 8.0);
    float rays = 0.5 + 0.5 * vn(vec3(rx + 3.0 * sin(a + fi), fi * 9.0, 0.0));
    rays = mix(rays, 0.5 + 0.5 * vn(vec3(rx * 2.7 + 2.0 * cos(a), fi * 4.0, 1.0)), 0.3);
    // each curtain only exists along part of the sky; its extent breathes on the loop
    float span = smoothstep(0.38, 0.72, ln(x * 0.55 + 11.0, fi * 2.3 + 20.0, 0.45));
    float hemGlow = exp(-abs(d) / 0.005) * 0.45;
    float w = (prof * rays + hemGlow) * span * depth;
    vec3 col = mix(lin(c0.rgb), lin(c1.rgb), clamp(-d * 3.0, 0.0, 1.0) * 0.5 + fi * 0.12);
    acc += col * w;
  }
  acc *= smoothstep(0.0, 0.22, p.y + 0.06); // the upper sky thins out
  float inten = pA.x;
  vec3 col;
  // faint sky glow toward the top
  vec3 skyTop = mix(sky, lin(c2.rgb), 0.008 * pA.y);
  sky = mix(skyTop, sky, smoothstep(0.0, 0.8, p.y));
  if (pA.y > 0.5) col = sky + acc * inten * 0.7;           // dark: additive light
  else { // light: the curtains read as a soft dye in the paper-white sky
    float l = dot(acc, vec3(0.3333));
    vec3 hue = acc / max(max(acc.r, max(acc.g, acc.b)), 1e-4);
    col = mix(sky, hue * 0.9, clamp(l * inten * 2.2, 0.0, 0.5));
  }
  o = vec4(pow(col, vec3(1.0/2.2)), 1.0);
}`;

export function create(k, p) {
  const D = p.duration ?? meta.duration;
  const c = k.brand.colors;
  const sh = k.shader(FRAG, 0.5);
  const str = k.copy('headline', k.brand.name);
  const to = { size: k.pick({ wide: 88, square: 82, tall: 78 }), weight: 620, tracking: -0.03 };
  const lines = k.text.balance(str, to, k.safe.w * k.pick({ wide: 0.64, square: 0.82, tall: 0.88 }));
  const ty = k.H * k.pick({ wide: 0.66, square: 0.64, tall: 0.6 });
  const u = {
    c0: k.vec4(c.accent), c1: k.vec4(c.accent3 || c.accent2 || c.accent), c2: k.vec4(c.accent), bg: k.vec4(c.bg),
    pA: [p.intensity, k.isDark ? 1 : 0, 0, 0], pB: [k.isPortrait ? 1 : 0, 0, 0, 0], seed: 3.7,
  };
  return {
    draw(g, t) {
      u.t = (t / D) % 1;
      g.imageSmoothingQuality = 'high';
      g.drawImage(sh(u), 0, 0, k.W, k.H);
      if (p.title) {
        const lh = to.size * 1.08 * k.u;
        const top = ty - ((lines.length - 1) * lh) / 2;
        lines.forEach((ln, i) => k.text.draw(g, ln, k.cx, top + i * lh, { ...to, align: 'center', baseline: 'middle', qaGroup: str }));
      }
    },
  };
}
