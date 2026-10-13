// Frosted glass blobs float over soft brand-coloured light. Everything is one
// fragment shader: the blobs are a smooth union of moving circles (a 2D SDF); a
// lens-like thickness profile gives each blob a surface normal, which bends
// (refracts) and softens the colour field behind it, adds a frost tint, a thin
// fresnel rim, a top-left specular sheen and a soft shadow below. Every circle runs
// a closed orbit with whole-number frequencies, so the loop is seamless.
export const meta = {
  id: 'background.glass-blobs',
  name: 'Glass Blobs',
  category: 'background',
  duration: 12,
  loop: true,
  ownsBackground: true,
  summary: 'Frosted glass blobs merge and drift over soft colour light, bending it with refraction and catching a rim highlight; seamless loop with the headline on top.',
  bestFor: ['backdrop', 'title card', 'product hero'],
  slots: ['headline'],
  params: {
    title: { default: true, label: 'Show headline on top' },
    frost: { default: 1, min: 0, max: 2, label: 'Frost amount' },
  },
  prompt: `Seamless 12000 ms loop, one full-resolution fragment shader. Background: the brand background with three soft colour pools (accent, secondary, and accent nudged 30% toward the tertiary; gaussian radius 30-45% of the short side) orbiting slowly. Blobs: six circles of radius 9-17% of the short side, each on a closed Lissajous orbit with whole-number frequencies, merged with a polynomial smooth-min (k = 0.09). Thickness h = smoothstep over the inside distance (0 to 7%); normal = gradient of h. Inside, sample the colour field at p - normal x 0.07 (refraction), reduce its contrast by 35% (frosted), add an 8% white frost on dark or 30% on light, a top-left specular term (normal . light)^4 x 0.16 (normal = minus the thickness gradient), and a 1 px fresnel rim brightest toward the light. Outside, a soft shadow from the same SDF offset 2.5% downward. Static centred headline: display 92 ref px, weight 620, tracking -0.03 em.`,
};

const FRAG = `
vec3 lin(vec3 c){ return pow(c, vec3(2.2)); }
float A;
vec2 orb(vec2 base, vec2 amp, vec2 fr, float ph){ return base + amp * vec2(cos(A * fr.x + ph), sin(A * fr.y + ph * 1.3)); }
float smin(float a, float b, float k){ float h = max(k - abs(a - b), 0.0) / k; return min(a, b) - h * h * k * 0.25; }
float sdf(vec2 p){
  vec2 s = pB.xy; // half extents of the frame in short-side units
  float d = 1e3;
  d = smin(d, length(p - orb(vec2(-0.55, -0.22) * s, vec2(0.12, 0.10), vec2(1.0, 1.0), 0.0)) - 0.17, 0.09);
  d = smin(d, length(p - orb(vec2(-0.30, -0.42) * s, vec2(0.10, 0.08), vec2(1.0, 2.0), 1.7)) - 0.10, 0.09);
  d = smin(d, length(p - orb(vec2( 0.58,  0.28) * s, vec2(0.10, 0.12), vec2(1.0, 1.0), 3.1)) - 0.16, 0.09);
  d = smin(d, length(p - orb(vec2( 0.36,  0.48) * s, vec2(0.12, 0.06), vec2(2.0, 1.0), 4.4)) - 0.09, 0.09);
  d = smin(d, length(p - orb(vec2( 0.70, -0.52) * s, vec2(0.08, 0.10), vec2(1.0, 1.0), 5.2)) - 0.12, 0.09);
  d = smin(d, length(p - orb(vec2(-0.72,  0.55) * s, vec2(0.09, 0.08), vec2(1.0, 1.0), 2.4)) - 0.13, 0.09);
  return d;
}
vec3 field(vec2 p, float soft){
  vec2 s = pB.xy;
  vec3 col = lin(bg.rgb);
  vec2 q0 = vec2(-0.5 * s.x + 0.15 * cos(A), -0.1 + 0.12 * sin(A));
  vec2 q1 = vec2( 0.55 * s.x + 0.12 * cos(A + 2.0), 0.15 + 0.10 * sin(A + 2.0));
  vec2 q2 = vec2( 0.05 + 0.18 * sin(A + 4.0), 0.45 * s.y * cos(A + 0.7));
  float r = 1.0 + soft;
  col = mix(col, lin(c0.rgb), exp(-dot(p - q0, p - q0) / (0.20 * r)) * pA.x);
  col = mix(col, lin(c1.rgb), exp(-dot(p - q1, p - q1) / (0.15 * r)) * pA.x * 0.8);
  col = mix(col, lin(c2.rgb), exp(-dot(p - q2, p - q2) / (0.10 * r)) * pA.x * 0.6);
  return col;
}
void main(){
  A = 6.2831853 * t;
  float mn = min(res.x, res.y);
  vec2 p = (uv - 0.5) * res / mn;
  bool dark = pA.y > 0.5;
  float px = 1.0 / mn;
  float d = sdf(p);
  vec3 col = field(p, 0.0);
  // soft shadow beneath the glass
  float ds = sdf(p + vec2(0.0, 0.025));
  float sh = (1.0 - smoothstep(-0.02, 0.06, ds)) * step(0.0, d);
  col *= 1.0 - sh * (dark ? 0.35 : 0.12);
  if (d < 2.0 * px) {
    float e = 0.004;
    float h = smoothstep(0.0, 0.07, -d);
    vec2 n = vec2(smoothstep(0.0, 0.07, -sdf(p + vec2(e, 0.0))) - smoothstep(0.0, 0.07, -sdf(p - vec2(e, 0.0))),
                  smoothstep(0.0, 0.07, -sdf(p + vec2(0.0, e))) - smoothstep(0.0, 0.07, -sdf(p - vec2(0.0, e)))) / (2.0 * e) * -0.07; // surface faces outward: -grad(thickness)
    vec3 g = field(p - n * 0.07, 0.9);
    vec3 avg = lin(bg.rgb) * 0.6 + g * 0.4;
    g = mix(g, avg, 0.35);
    float frost = (dark ? 0.06 : 0.3) * pA.z;
    g = mix(g, vec3(1.0), frost * (0.6 + 0.4 * h));
    vec2 L = normalize(vec2(-0.6, 0.8));
    float spec = pow(max(dot(n, L), 0.0), 4.0) * 0.16;
    g += vec3(spec) * (dark ? 0.6 : 1.0);
    // inner edge darkening (thickness at the rim bends light away)
    g *= 1.0 - (1.0 - h) * (dark ? 0.25 : 0.06);
    // fresnel hairline, brighter toward the light
    float rim = (1.0 - smoothstep(0.0, 1.5 * px, abs(d + 0.6 * px))) * (0.35 + 0.65 * max(dot(normalize(n + 1e-5), L), 0.0));
    g = mix(g, vec3(1.0), rim * (dark ? 0.45 : 0.8));
    float cov = 1.0 - smoothstep(-px, px, d);
    col = mix(col, g, cov);
  }
  float vg = length((uv - 0.5) * vec2(res.x / res.y, 1.0));
  col *= 1.0 - 0.16 * smoothstep(0.45, 1.1, vg);
  o = vec4(pow(max(col, 0.0), vec3(1.0/2.2)), 1.0);
}`;

export function create(k, p) {
  const D = p.duration ?? meta.duration;
  const c = k.brand.colors;
  const sh = k.shader(FRAG, 1);
  const str = k.copy('headline', k.brand.name);
  const to = { size: k.pick({ wide: 92, square: 84, tall: 80 }), weight: 620, tracking: -0.03 };
  const lines = k.text.balance(str, to, k.safe.w * k.pick({ wide: 0.62, square: 0.8, tall: 0.86 }));
  const u = {
    c0: k.vec4(c.accent), c1: k.vec4(c.accent2 || c.accent), c2: k.vec4(k.color.mix(c.accent, c.accent3 || c.accent, 0.3)), bg: k.vec4(c.bg),
    pA: [k.isDark ? 0.4 : 0.3, k.isDark ? 1 : 0, p.frost, 0], pB: [k.W / k.vmin / 2, k.H / k.vmin / 2, 0, 0], seed: 0,
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
