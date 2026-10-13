// A ground-plane grid seen from a low camera, receding into atmospheric haze and a
// soft horizon glow, scrolling gently toward the viewer. Drawn per pixel in a
// shader: each pixel below the horizon is projected onto the floor and grid lines
// are anti-aliased with screen-space derivatives, then faded with distance so the
// far field never shimmers. The floor moves exactly two cells per loop.
export const meta = {
  id: 'background.horizon-grid',
  name: 'Horizon Grid',
  category: 'background',
  duration: 8,
  loop: true,
  ownsBackground: true,
  summary: 'A hairline floor grid recedes into haze and a soft accent horizon glow while scrolling forward; seamless loop with the headline above the horizon.',
  bestFor: ['backdrop', 'title card', 'product intro'],
  slots: ['headline'],
  params: {
    title: { default: true, label: 'Show headline on top' },
    horizon: { default: 0.58, min: 0.4, max: 0.75, label: 'Horizon height (0 top, 1 bottom)' },
  },
  prompt: `Seamless 8000 ms loop, full-resolution fragment shader. Horizon at 58% of frame height. For each pixel below it, project onto a floor: depth z = camera height / (screen y - horizon), floor x = screen x times z. Grid cells of 0.5 units; the floor scrolls toward the camera by exactly 2 cells per loop (constant linear dolly). Lines: 1 - smoothstep on distance to the nearest line divided by fwidth, 1 px wide, foreground at 22% near the camera fading with exp(-z/9) and to zero 4% above the horizon so the distance never aliases. Haze: mix the floor toward the horizon colour with depth. Horizon glow: accent, a thin band (gaussian, 1.2% of height) plus a broad bloom (6% above, 9% below), 22% band and 3% bloom strength on dark, 14% on light. Sky: very gentle gradient. Static headline centred at 36% height: display 92 ref px, weight 620, tracking -0.03 em.`,
};

const FRAG = `
vec3 lin(vec3 c){ return pow(c, vec3(2.2)); }
float gridLine(float v){
  float fw = max(fwidth(v), 1e-5);
  float d = abs(fract(v - 0.5) - 0.5) / fw;
  return 1.0 - smoothstep(0.0, 1.0, d - 0.1);
}
void main(){
  float asp = res.x / res.y;
  float y = 1.0 - uv.y;          // 0 top, 1 bottom
  float hz = pA.x;
  float mn = min(res.x, res.y);
  float sx = (uv.x - 0.5) * res.x / mn; // short-side units in every aspect
  bool dark = pA.y > 0.5;
  vec3 base = lin(bg.rgb), ac = lin(c0.rgb), fgc = lin(c1.rgb);
  // sky
  vec3 sky = mix(base, mix(base, ac, dark ? 0.008 : 0.01), smoothstep(0.0, hz, y));
  vec3 col = sky;
  float dy = y - hz;
  if (dy > 0.0) {
    float camH = pA.z; // 0.32 x max(1, H/W): tall frames see the floor from higher up
    float z = camH / (dy * res.y / mn);  // depth along the floor
    float fx = sx * z;                   // floor x
    float fz = z * 2.0 + t * 2.0;        // half-unit cells; scroll: two cells per loop
    float gx = gridLine(fx * 2.0), gz = gridLine(fz);
    float g = max(gx, gz);
    float fade = exp(-z / 9.0) * smoothstep(0.004, 0.04, dy);
    vec3 floorC = mix(base, mix(base, ac, dark ? 0.01 : 0.015), exp(-z / 6.0));
    // haze toward the horizon
    floorC = mix(floorC, sky, 1.0 - exp(-z / 14.0));
    col = mix(floorC, fgc, g * fade * (dark ? 0.22 : 0.34));
  }
  // horizon glow: thin band + broad bloom (symmetric, slightly stronger below)
  float band = exp(-pow(dy / 0.012, 2.0));
  float bloom = exp(-abs(dy) / (dy > 0.0 ? 0.09 : 0.06));
  float gs = dark ? 0.3 : 0.3;
  if (dark) col += ac * (band * 0.22 + bloom * 0.03);
  else col = mix(col, mix(base, ac, 0.55), clamp((band * 0.6 + bloom * 0.35) * gs, 0.0, 1.0));
  float vg = length((uv - 0.5) * vec2(asp, 1.0));
  col *= 1.0 - 0.18 * smoothstep(0.45, 1.1, vg);
  o = vec4(pow(max(col, 0.0), vec3(1.0/2.2)), 1.0);
}`;

export function create(k, p) {
  const D = p.duration ?? meta.duration;
  const c = k.brand.colors;
  const sh = k.shader(FRAG, 1);
  const str = k.copy('headline', k.brand.name);
  const to = { size: k.pick({ wide: 92, square: 84, tall: 80 }), weight: 620, tracking: -0.03 };
  const lines = k.text.balance(str, to, k.safe.w * k.pick({ wide: 0.62, square: 0.8, tall: 0.86 }));
  const u = { c0: k.vec4(c.accent), c1: k.vec4(c.fg), bg: k.vec4(c.bg), pA: [p.horizon, k.isDark ? 1 : 0, 0.32 * Math.max(1, k.H / k.W), 0], seed: 0 };
  return {
    draw(g, t) {
      u.t = (t / D) % 1;
      g.drawImage(sh(u), 0, 0, k.W, k.H);
      if (p.title) {
        const lh = to.size * 1.08 * k.u;
        const cy = k.H * Math.min(p.horizon - 0.2, 0.38);
        const top = cy - ((lines.length - 1) * lh) / 2;
        lines.forEach((ln, i) => k.text.draw(g, ln, k.cx, top + i * lh, { ...to, align: 'center', baseline: 'middle', qaGroup: str }));
      }
    },
  };
}
