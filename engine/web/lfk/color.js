// Color utilities: parse, mix in OKLab (perceptual), alpha, contrast.

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);

export function parse(input) {
  if (typeof input === 'object' && input) return { r: input.r, g: input.g, b: input.b, a: input.a ?? 1 };
  let s = String(input).trim();
  if (s.startsWith('#')) {
    s = s.slice(1);
    if (s.length === 3 || s.length === 4) s = s.split('').map((ch) => ch + ch).join('');
    const n = parseInt(s.slice(0, 6), 16);
    const a = s.length === 8 ? parseInt(s.slice(6, 8), 16) / 255 : 1;
    return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255, a };
  }
  const m = s.match(/rgba?\(([^)]+)\)/i);
  if (m) {
    const p = m[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
    return { r: p[0] / 255, g: p[1] / 255, b: p[2] / 255, a: p[3] ?? 1 };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
}

export function css(c, alpha) {
  const k = parse(c);
  const a = alpha === undefined ? k.a : k.a * alpha;
  return `rgba(${Math.round(clamp01(k.r) * 255)},${Math.round(clamp01(k.g) * 255)},${Math.round(clamp01(k.b) * 255)},${+clamp01(a).toFixed(4)})`;
}
export const alpha = (c, a) => css(c, a);
export function hex(c) {
  const k = parse(c);
  const h = (x) => Math.round(clamp01(x) * 255).toString(16).padStart(2, '0');
  return `#${h(k.r)}${h(k.g)}${h(k.b)}`;
}

const toLin = (u) => (u <= 0.04045 ? u / 12.92 : ((u + 0.055) / 1.055) ** 2.4);
const toSrgb = (u) => (u <= 0.0031308 ? 12.92 * u : 1.055 * u ** (1 / 2.4) - 0.055);

function rgbToOklab({ r, g, b }) {
  r = toLin(r); g = toLin(g); b = toLin(b);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
function oklabToRgb([L, A, B]) {
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return {
    r: clamp01(toSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s)),
    g: clamp01(toSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s)),
    b: clamp01(toSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)),
  };
}

// Perceptual mix of two colors (t = 0 -> a, 1 -> b). Returns a css string.
export function mix(a, b, t, alphaOut) {
  const ca = parse(a), cb = parse(b);
  const la = rgbToOklab(ca), lb = rgbToOklab(cb);
  const L = [la[0] + (lb[0] - la[0]) * t, la[1] + (lb[1] - la[1]) * t, la[2] + (lb[2] - la[2]) * t];
  const out = oklabToRgb(L);
  out.a = alphaOut ?? ca.a + (cb.a - ca.a) * t;
  return css(out);
}
// Lighten/darken in OKLab lightness (amount -1..1).
export function shade(c, amount) {
  const k = parse(c);
  const L = rgbToOklab(k);
  L[0] = clamp01(L[0] + amount);
  const out = oklabToRgb(L);
  out.a = k.a;
  return css(out);
}
// Scale chroma (0 = gray, 1 = same, >1 = more saturated).
export function saturate(c, f) {
  const k = parse(c);
  const L = rgbToOklab(k);
  L[1] *= f; L[2] *= f;
  const out = oklabToRgb(L);
  out.a = k.a;
  return css(out);
}
export function luminance(c) {
  const k = parse(c);
  return 0.2126 * toLin(k.r) + 0.7152 * toLin(k.g) + 0.0722 * toLin(k.b);
}
export function contrast(a, b) {
  const la = luminance(a), lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}
export const isDark = (c) => luminance(c) < 0.2;
// Pick whichever of the candidates contrasts best with the background.
export function onColor(bg, candidates = ['#ffffff', '#0b0b0c']) {
  let best = candidates[0], bestC = 0;
  for (const c of candidates) { const r = contrast(bg, c); if (r > bestC) { bestC = r; best = c; } }
  return best;
}
// Multi-stop gradient sample: stops = [[t, color], ...] sorted by t.
export function ramp(stops, t) {
  if (t <= stops[0][0]) return css(stops[0][1]);
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const [t0, c0] = stops[i - 1], [t1, c1] = stops[i];
      return mix(c0, c1, (t - t0) / (t1 - t0));
    }
  }
  return css(stops[stops.length - 1][1]);
}
