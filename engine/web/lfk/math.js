// Small deterministic math toolkit. Everything here is pure: same input, same output.

export const TAU = Math.PI * 2;
export const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, x) => (x - a) / (b - a);
export const fract = (x) => x - Math.floor(x);
export const smoothstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
// Map x from [a,b] to [c,d], clamped by default.
export const remap = (x, a, b, c, d, clamped = true) => {
  let t = (x - a) / (b - a);
  if (clamped) t = clamp(t);
  return c + (d - c) * t;
};
// Progress of t through the window [start, start + dur], clamped to 0..1.
export const seg = (t, start, dur) => (dur <= 0 ? (t >= start ? 1 : 0) : clamp((t - start) / dur));
// 0 -> 1 -> 0 envelope: rises over [a, a+inDur], holds, falls over [b-outDur, b].
export const envelope = (t, a, b, inDur, outDur) => Math.min(seg(t, a, inDur), 1 - seg(t, b - outDur, outDur));
export const mix2 = (p, q, t) => [lerp(p[0], q[0], t), lerp(p[1], q[1], t)];
export const dist = (x0, y0, x1, y1) => Math.hypot(x1 - x0, y1 - y0);
export const angleLerp = (a, b, t) => {
  let d = ((b - a + Math.PI) % TAU) - Math.PI;
  if (d < -Math.PI) d += TAU;
  return a + d * t;
};
// Stagger helper: local progress for item i of n inside [0,1] with overlap.
// spread = fraction of the total window used to offset items (0 = all together).
export const stagger = (p, i, n, spread = 0.5) => {
  if (n <= 1) return clamp(p);
  const dur = 1 - spread;
  const start = (spread * i) / (n - 1);
  return clamp((p - start) / dur);
};

// mulberry32 PRNG with helpers. Seeded, so renders are repeatable.
export function rng(seed = 1) {
  let a = (seed >>> 0) || 0x9e3779b9;
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  next.range = (lo, hi) => lo + (hi - lo) * next();
  next.int = (lo, hi) => Math.floor(lo + (hi - lo + 1) * next());
  next.pick = (arr) => arr[Math.floor(next() * arr.length)];
  next.sign = () => (next() < 0.5 ? -1 : 1);
  next.gauss = () => {
    const u = Math.max(1e-9, next()), v = next();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v);
  };
  next.shuffle = (arr) => {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(next() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  return next;
}

// Stateless hash -> [0,1). Good for per-index randomness inside draw loops.
export function hash(i, seed = 0) {
  let h = Math.imul((i | 0) ^ 0x27d4eb2d, 0x165667b1) ^ Math.imul(seed | 0, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
export const hash2 = (x, y, seed = 0) => hash((x | 0) * 73856093 ^ (y | 0) * 19349663, seed);

// Seeded 3D gradient noise (improved-Perlin style), range about -1..1, plus fbm.
export function makeNoise(seed = 7) {
  const r = rng(seed);
  const p = new Uint8Array(512);
  const perm = r.shuffle([...Array(256).keys()]);
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
  const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
  const grad = (h, x, y, z) => {
    const g = h & 15;
    const u = g < 8 ? x : y;
    const v = g < 4 ? y : g === 12 || g === 14 ? x : z;
    return ((g & 1) ? -u : u) + ((g & 2) ? -v : v);
  };
  function n3(x, y = 0, z = 0) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
    x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
    const u = fade(x), v = fade(y), w = fade(z);
    const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z;
    const B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
    return lerp(
      lerp(lerp(grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z), u),
        lerp(grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z), u), v),
      lerp(lerp(grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1), u),
        lerp(grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1), u), v),
      w);
  }
  n3.fbm = (x, y = 0, z = 0, oct = 4, lac = 2, gain = 0.5) => {
    let a = 1, f = 1, s = 0, norm = 0;
    for (let i = 0; i < oct; i++) {
      s += a * n3(x * f, y * f, z * f);
      norm += a; a *= gain; f *= lac;
    }
    return s / norm;
  };
  // Curl of a 2D potential built from noise (divergence-free flow field).
  n3.curl = (x, y, z = 0, e = 0.01) => {
    const dx = (n3(x, y + e, z) - n3(x, y - e, z)) / (2 * e);
    const dy = (n3(x + e, y, z) - n3(x - e, y, z)) / (2 * e);
    return [dx, -dy];
  };
  return n3;
}

// Halton sequence (used for sub-frame jitter and blue-ish point sets).
export function halton(i, base) {
  let f = 1, r = 0;
  while (i > 0) { f /= base; r += f * (i % base); i = Math.floor(i / base); }
  return r;
}

// Golden-angle (Vogel) disc distribution: evenly spread points in a unit disc.
export function vogel(i, n) {
  const ga = Math.PI * (3 - Math.sqrt(5));
  const r = Math.sqrt((i + 0.5) / n);
  return [r * Math.cos(i * ga), r * Math.sin(i * ga)];
}

// Fibonacci sphere: n evenly spread unit vectors.
export function fibSphere(i, n) {
  const y = 1 - (2 * (i + 0.5)) / n;
  const r = Math.sqrt(1 - y * y);
  const th = i * Math.PI * (3 - Math.sqrt(5));
  return [r * Math.cos(th), y, r * Math.sin(th)];
}

// Simple perspective projection for 2.5D/3D effects.
// Camera at z = -dist looking toward +z; returns [sx, sy, scale].
export function project(x, y, z, cx, cy, focal, dist) {
  const d = z + dist;
  const s = focal / Math.max(1e-3, d);
  return [cx + x * s, cy + y * s, s];
}
export function rotX([x, y, z], a) { const c = Math.cos(a), s = Math.sin(a); return [x, y * c - z * s, y * s + z * c]; }
export function rotY([x, y, z], a) { const c = Math.cos(a), s = Math.sin(a); return [x * c + z * s, y, -x * s + z * c]; }
export function rotZ([x, y, z], a) { const c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c, z]; }
