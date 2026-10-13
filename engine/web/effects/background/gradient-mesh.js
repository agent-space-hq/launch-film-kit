// Slow, soft colour fields drifting under a fine grain: a living backdrop for text.
// Rendered on the GPU at half resolution and upscaled (it is all low frequency).
export const meta = {
  id: 'background.gradient-mesh',
  name: 'Gradient Mesh Drift',
  category: 'background',
  duration: 6,
  loop: true,
  ownsBackground: true,
  summary: 'Three or four brand-coloured light fields drift and blend; seamless loop, made for sitting behind titles.',
  bestFor: ['backdrop', 'title card', 'hero loop'],
  prompt: `Render a full-frame fragment shader at half resolution, then upscale. Start from the brand background, and blend in three soft gaussian light fields in the accent, secondary and tertiary brand colours, radii about 30-35% of frame height. Each field moves on a closed orbit (circle or figure-eight) driven by phase = t / duration, so the loop is seamless with no jump at the wrap. Mix in linear light, at about 75% intensity on dark backgrounds and 45% on light. Darken slightly toward the corners (a radial term). Grain and dithering come from the post pass to prevent banding. Optionally centre the brand headline on top at display weight 620, fitted to 90% of the safe width. The background must stay low-frequency and slow (one orbit per 6 s) so text above it always reads.`,
  params: { intensity: { default: 0.85, label: 'Colour intensity' }, title: { default: true, label: 'Show headline on top' } },
};

const FRAG = `
// fields move on closed orbits so the loop is seamless (t is 0..1 phase)
vec3 lin(vec3 c){ return pow(c, vec3(2.2)); }
void main(){
  vec2 p = uv - 0.5; p.x *= res.x / res.y;
  float a = 6.2831853 * t;
  vec2 q0 = vec2(cos(a) * 0.35 - 0.25, sin(a) * 0.22 + 0.10);
  vec2 q1 = vec2(cos(a + 2.1) * 0.40 + 0.30, sin(a * 2.0 + 1.0) * 0.18 - 0.12);
  vec2 q2 = vec2(sin(a + 4.0) * 0.30, cos(a + 0.7) * 0.28 + 0.05);
  vec3 col = lin(bg.rgb);
  float w0 = exp(-dot(p - q0, p - q0) / 0.10);
  float w1 = exp(-dot(p - q1, p - q1) / 0.12);
  float w2 = exp(-dot(p - q2, p - q2) / 0.08);
  col = mix(col, lin(c0.rgb), w0 * pA.x);
  col = mix(col, lin(c1.rgb), w1 * pA.x * 0.9);
  col = mix(col, lin(c2.rgb), w2 * pA.x * 0.7);
  col *= 1.0 - 0.25 * dot(p, p);
  o = vec4(pow(col, vec3(1.0/2.2)), 1.0);
}`;

export function create(k, p) {
  const sh = k.shader(FRAG, 0.5);
  const c = k.brand.colors;
  return {
    draw(g, t) {
      const phase = t / (p.duration ?? meta.duration);
      const can = sh({ t: phase, bg: k.vec4(c.bg), c0: k.vec4(c.accent), c1: k.vec4(c.accent2 || c.accent), c2: k.vec4(c.accent3 || c.fg), pA: [p.intensity * (k.isDark ? 0.75 : 0.45), 0, 0, 0] });
      g.imageSmoothingQuality = 'high';
      g.drawImage(can, 0, 0, k.W, k.H);
      if (p.title) {
        k.text.draw(g, k.copy('headline', k.brand.name), k.cx, k.cy, { size: k.text.fit(k.copy('headline', k.brand.name), { size: k.pick({ wide: 96, square: 84, tall: 76 }), weight: 620 }, k.safe.w * 0.9), weight: 620, align: 'center', baseline: 'middle' });
      }
    },
  };
}
