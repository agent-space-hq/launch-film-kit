// A wide ribbon twists through 3D space. Its centreline is a travelling wave across
// the frame; the ribbon's width direction is rotated around that centreline by a
// twist that grows along its length and turns over time. It is drawn as ~170 quads,
// each shaded from its own normal (two-sided Lambert plus a Blinn highlight) over a
// brand gradient that runs along the ribbon, and painter-sorted by depth.
export const meta = {
  id: 'hero3d.ribbon-flow',
  name: 'Ribbon Flow',
  category: 'hero3d',
  duration: 5,
  summary: 'A wide brand-gradient ribbon draws itself across the frame, twisting and catching a specular highlight as a wave travels along it, then draws off to the right.',
  bestFor: ['transition moment', 'brand texture', 'hero backdrop'],
  slots: ['headline'],
  params: {
    title: { default: false, label: 'Show headline on top' },
    twist: { default: 1.6, min: 0.5, max: 3, label: 'Twist (half turns)' },
  },
  sfx: [{ t: 0.05, type: 'whoosh', dur: 1.1, gain: 0.4 }, { t: D_EXIT_HINT(), type: 'whoosh', dur: 0.4, gain: 0.25 }],
  prompt: `Centreline: x runs from -75% to +75% of the frame width; y = 16% of the short side x sin(2.2 pi s + phase) and z = 0.35 x cos(1.7 pi s + phase), with the phase advancing 0.9 rad/s so a wave travels along the ribbon. Width 17% of the short side, along the curve normal rotated about the tangent by twist(s, t) = 1.6 pi s + 0.7 t. Build 170 quads, project with focal 2.6, sort far to near. Shade each quad: colour = accent mixed toward the secondary accent along s; diffuse = 0.3 + 0.7 |n . L| with the key light from upper left front; back faces 25% darker; Blinn highlight |n . H|^40 x 0.55 in white; fill plus a same-colour 1 px stroke to close seams. 0-1200 ms the ribbon draws on from the left end (outExpo); the last 450 ms it draws off toward the right (inCubic).`,
};
function D_EXIT_HINT() { return 4.55; }

export function create(k, p) {
  const { m, ease } = k;
  const D = p.duration ?? meta.duration;
  const c = k.brand.colors;
  const NQ = 170;
  const head = k.copy('headline', k.brand.name);
  const tO = { size: k.pick({ wide: 88, square: 80, tall: 72 }), weight: 640, tracking: -0.03 };
  const tl = k.text.balance(head, tO, k.safe.w * 0.8);
  const cA = k.color.parse(c.accent), cB = k.color.parse(c.accent2 || c.accent);
  const mixRGB = (u) => [cA.r + (cB.r - cA.r) * u, cA.g + (cB.g - cA.g) * u, cA.b + (cB.b - cA.b) * u];
  const Lr = (() => { const v = [-0.45, -0.6, -0.65]; const n = Math.hypot(...v); return v.map((x) => x / n); })();
  const H = (() => { const v = [Lr[0], Lr[1], Lr[2] - 1]; const n = Math.hypot(...v); return v.map((x) => x / n); })();
  const P = new Float32Array((NQ + 1) * 6); // two edge points (x,y,z) per station
  return {
    draw(g, t) {
      const inP = ease.outExpo(m.seg(t, 0, 1.2));
      const outP = ease.inCubic(m.seg(t, D - 0.45, 0.45));
      const s0 = outP, s1 = inP;
      if (s1 - s0 <= 0.002) return;
      const V = k.vmin;
      const halfX = k.W * 0.75;
      const amp = 0.16 * V, depth = 0.35;
      const ph = t * 0.9;
      const w = 0.17 * V;
      const focal = 2.6;
      const cen = (s) => [(-1 + 2 * s) * halfX, amp * Math.sin(2.2 * Math.PI * s + ph), depth * Math.cos(1.7 * Math.PI * s + ph)];
      for (let i = 0; i <= NQ; i++) {
        const s = s0 + (s1 - s0) * (i / NQ);
        const a = cen(s), b = cen(Math.min(1, s + 0.002)), b0 = cen(Math.max(0, s - 0.002));
        // tangent in a mixed space: x,y in px, z in units -> scale z by V for the frame
        let tx = b[0] - b0[0], ty = b[1] - b0[1], tz = (b[2] - b0[2]) * V;
        const tn = Math.hypot(tx, ty, tz) || 1; tx /= tn; ty /= tn; tz /= tn;
        // reference normal: world up projected off the tangent
        let nx = -tx * ty, ny = 1 - ty * ty, nz = -tz * ty;
        const nn = Math.hypot(nx, ny, nz) || 1; nx /= nn; ny /= nn; nz /= nn;
        // binormal = t x n
        const bx = ty * nz - tz * ny, by = tz * nx - tx * nz, bz = tx * ny - ty * nx;
        const th = p.twist * Math.PI * s + 0.7 * t;
        const ct = Math.cos(th), st = Math.sin(th);
        const wx = nx * ct + bx * st, wy = ny * ct + by * st, wz = nz * ct + bz * st;
        const o = i * 6;
        P[o] = a[0] + wx * w / 2; P[o + 1] = a[1] + wy * w / 2; P[o + 2] = a[2] + (wz * w / 2) / V;
        P[o + 3] = a[0] - wx * w / 2; P[o + 4] = a[1] - wy * w / 2; P[o + 5] = a[2] - (wz * w / 2) / V;
      }
      const pr = (x, y, z) => { const sc = focal / (focal + z); return [k.cx + x * sc, k.cy + y * sc]; };
      const quads = [];
      for (let i = 0; i < NQ; i++) {
        const o = i * 6, q = o + 6;
        const A = [P[o], P[o + 1], P[o + 2] * V], B = [P[o + 3], P[o + 4], P[o + 5] * V], C2 = [P[q + 3], P[q + 4], P[q + 5] * V], D2 = [P[q], P[q + 1], P[q + 2] * V];
        // face normal from the quad diagonals
        const e1 = [C2[0] - A[0], C2[1] - A[1], C2[2] - A[2]], e2 = [D2[0] - B[0], D2[1] - B[1], D2[2] - B[2]];
        let nx = e1[1] * e2[2] - e1[2] * e2[1], ny = e1[2] * e2[0] - e1[0] * e2[2], nz = e1[0] * e2[1] - e1[1] * e2[0];
        const nn = Math.hypot(nx, ny, nz) || 1; nx /= nn; ny /= nn; nz /= nn;
        const z = (P[o + 2] + P[o + 5] + P[q + 2] + P[q + 5]) / 4;
        const s = s0 + (s1 - s0) * ((i + 0.5) / NQ);
        quads.push({ i, z, nx, ny, nz, s });
      }
      quads.sort((a, b) => b.z - a.z);
      g.save();
      g.lineJoin = 'round';
      for (const Q of quads) {
        const o = Q.i * 6, q = o + 6;
        const p0 = pr(P[o], P[o + 1], P[o + 2]), p1 = pr(P[o + 3], P[o + 4], P[o + 5]);
        const p2 = pr(P[q + 3], P[q + 4], P[q + 5]), p3 = pr(P[q], P[q + 1], P[q + 2]);
        const front = Q.nz < 0; // facing the camera (camera looks toward +z)
        const nd = Math.abs(Q.nx * Lr[0] + Q.ny * Lr[1] + Q.nz * Lr[2]);
        const sp = Math.pow(Math.abs(Q.nx * H[0] + Q.ny * H[1] + Q.nz * H[2]), 40) * 0.55;
        const base = mixRGB(Q.s);
        const dif = (0.3 + 0.7 * nd) * (front ? 1 : 0.75);
        const r = Math.min(1, base[0] * dif + sp), gg = Math.min(1, base[1] * dif + sp), bb = Math.min(1, base[2] * dif + sp);
        const col = `rgb(${(r * 255) | 0},${(gg * 255) | 0},${(bb * 255) | 0})`;
        g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.lineTo(p2[0], p2[1]); g.lineTo(p3[0], p3[1]); g.closePath();
        g.fillStyle = col; g.fill();
        g.strokeStyle = col; g.lineWidth = 1 * k.u; g.stroke();
      }
      g.restore();
      if (p.title) {
        const a = ease.outCubic(m.seg(t, 0.8, 0.6)) * (1 - outP);
        const lh = tO.size * 1.08 * k.u;
        const top = k.cy - ((tl.length - 1) * lh) / 2;
        tl.forEach((ln, i) => k.text.draw(g, ln, k.cx, top + i * lh, { ...tO, align: 'center', baseline: 'middle', alpha: a, qaGroup: head, shadow: k.isDark ? { color: 'rgba(0,0,0,0.5)', blur: 30 } : { color: 'rgba(255,255,255,0.6)', blur: 30 } }));
      }
    },
  };
}
