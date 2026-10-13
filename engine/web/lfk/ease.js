// Easing library. Each function maps 0..1 -> 0..1 (back/elastic/spring may overshoot).
// Naming: in* accelerates, out* decelerates, inOut* does both.

const { pow, sin, cos, sqrt, PI, exp } = Math;
const c = (t) => (t < 0 ? 0 : t > 1 ? 1 : t);

export const linear = (t) => c(t);
export const inQuad = (t) => (t = c(t), t * t);
export const outQuad = (t) => (t = c(t), 1 - (1 - t) * (1 - t));
export const inOutQuad = (t) => (t = c(t), t < 0.5 ? 2 * t * t : 1 - pow(-2 * t + 2, 2) / 2);
export const inCubic = (t) => (t = c(t), t * t * t);
export const outCubic = (t) => (t = c(t), 1 - pow(1 - t, 3));
export const inOutCubic = (t) => (t = c(t), t < 0.5 ? 4 * t * t * t : 1 - pow(-2 * t + 2, 3) / 2);
export const inQuart = (t) => (t = c(t), t ** 4);
export const outQuart = (t) => (t = c(t), 1 - pow(1 - t, 4));
export const inOutQuart = (t) => (t = c(t), t < 0.5 ? 8 * t ** 4 : 1 - pow(-2 * t + 2, 4) / 2);
export const inQuint = (t) => (t = c(t), t ** 5);
export const outQuint = (t) => (t = c(t), 1 - pow(1 - t, 5));
export const inOutQuint = (t) => (t = c(t), t < 0.5 ? 16 * t ** 5 : 1 - pow(-2 * t + 2, 5) / 2);
export const inSine = (t) => (t = c(t), 1 - cos((t * PI) / 2));
export const outSine = (t) => (t = c(t), sin((t * PI) / 2));
export const inOutSine = (t) => (t = c(t), -(cos(PI * t) - 1) / 2);
export const inExpo = (t) => (t = c(t), t === 0 ? 0 : pow(2, 10 * t - 10));
export const outExpo = (t) => (t = c(t), t === 1 ? 1 : 1 - pow(2, -10 * t));
export const inOutExpo = (t) => (t = c(t), t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? pow(2, 20 * t - 10) / 2 : (2 - pow(2, -20 * t + 10)) / 2);
export const inCirc = (t) => (t = c(t), 1 - sqrt(1 - t * t));
export const outCirc = (t) => (t = c(t), sqrt(1 - pow(t - 1, 2)));
export const inOutCirc = (t) => (t = c(t), t < 0.5 ? (1 - sqrt(1 - pow(2 * t, 2))) / 2 : (sqrt(1 - pow(-2 * t + 2, 2)) + 1) / 2);
// Back: overshoots by about 10% at s = 1.70158.
export const outBack = (t, s = 1.70158) => (t = c(t), 1 + (s + 1) * pow(t - 1, 3) + s * pow(t - 1, 2));
export const inBack = (t, s = 1.70158) => (t = c(t), (s + 1) * t * t * t - s * t * t);
export const inOutBack = (t, s = 1.70158) => {
  t = c(t);
  const s2 = s * 1.525;
  return t < 0.5 ? (pow(2 * t, 2) * ((s2 + 1) * 2 * t - s2)) / 2 : (pow(2 * t - 2, 2) * ((s2 + 1) * (t * 2 - 2) + s2) + 2) / 2;
};
// Gentle elastic for UI pops (few, small oscillations). amp ~ overshoot, per ~ period.
export const outElastic = (t, amp = 1, per = 0.35) => {
  t = c(t);
  if (t === 0 || t === 1) return t;
  const s = (per / (2 * PI)) * Math.asin(1 / Math.max(1, amp));
  return amp * pow(2, -10 * t) * sin(((t - s) * (2 * PI)) / per) + 1;
};

// Critically/under-damped spring response from 0 to 1 over time (seconds).
// stiffness k, damping d, mass m. Returns value at time t (unclamped, settles at 1).
export function spring(t, { stiffness = 170, damping = 26, mass = 1, velocity = 0 } = {}) {
  if (t <= 0) return 0;
  const w0 = sqrt(stiffness / mass);
  const zeta = damping / (2 * sqrt(stiffness * mass));
  const x0 = -1; // start displaced by -1 from the rest position 1
  const v0 = velocity;
  let x;
  if (zeta < 1) {
    const wd = w0 * sqrt(1 - zeta * zeta);
    x = exp(-zeta * w0 * t) * (x0 * cos(wd * t) + ((v0 + zeta * w0 * x0) / wd) * sin(wd * t));
  } else if (zeta === 1) {
    x = exp(-w0 * t) * (x0 + (v0 + w0 * x0) * t);
  } else {
    const r1 = -w0 * (zeta - sqrt(zeta * zeta - 1));
    const r2 = -w0 * (zeta + sqrt(zeta * zeta - 1));
    const c2 = (v0 - r1 * x0) / (r2 - r1);
    const c1 = x0 - c2;
    x = c1 * exp(r1 * t) + c2 * exp(r2 * t);
  }
  return 1 + x;
}
// Time (s) for a spring to settle within eps of rest; handy to size a shot.
export function springDuration(opts = {}, eps = 0.001) {
  for (let t = 0; t < 10; t += 1 / 240) {
    let ok = true;
    for (let k = 0; k < 24; k++) if (Math.abs(spring(t + k / 240, opts) - 1) > eps) { ok = false; break; }
    if (ok) return t;
  }
  return 10;
}

// CSS-style cubic-bezier(x1, y1, x2, y2) easing.
export function bezier(x1, y1, x2, y2) {
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  const sx = (t) => ((ax * t + bx) * t + cx) * t;
  const sy = (t) => ((ay * t + by) * t + cy) * t;
  const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    x = c(x);
    let t = x;
    for (let i = 0; i < 8; i++) {
      const e = sx(t) - x;
      if (Math.abs(e) < 1e-6) break;
      const d = dx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= e / d;
    }
    if (t < 0 || t > 1) { // fall back to bisection
      let lo = 0, hi = 1; t = x;
      for (let i = 0; i < 30; i++) { const v = sx(t); if (v < x) lo = t; else hi = t; t = (lo + hi) / 2; }
    }
    return sy(t);
  };
}

// A few named curves used across the kit (consistent motion language).
export const standard = bezier(0.2, 0, 0, 1);      // UI moves: quick start, long settle
export const emphasized = bezier(0.3, 0, 0, 1);    // hero moves
export const decel = bezier(0, 0, 0, 1);           // entrances
export const accel = bezier(0.3, 0, 1, 1);         // exits
export const anticipate = bezier(0.36, -0.2, 0.2, 1); // slight wind-up before moving

// Look up by name, e.g. ease.get('outExpo').
const table = {
  linear, inQuad, outQuad, inOutQuad, inCubic, outCubic, inOutCubic, inQuart, outQuart, inOutQuart,
  inQuint, outQuint, inOutQuint, inSine, outSine, inOutSine, inExpo, outExpo, inOutExpo,
  inCirc, outCirc, inOutCirc, outBack, inBack, inOutBack, outElastic,
  standard, emphasized, decel, accel, anticipate,
};
export const get = (name) => table[name] || linear;
export const names = Object.keys(table);
