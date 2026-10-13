// The mark is cut into triangular shards on a jittered lattice. Each shard tumbles in
// from depth (true 3D rotation + perspective, mapped exactly with an affine per
// triangle), all lock at the same instant with a soft flash, then the wordmark joins.
export const meta = {
  id: 'logo.shard-assemble',
  name: 'Shard Assemble',
  category: 'logo',
  duration: 4.6,
  summary: 'Triangular shards of the mark tumble in from depth with perspective shading and lock together at one instant with a soft flash; the mark glides left and the wordmark joins, then holds.',
  bestFor: ['opening ident', 'bold brand reveal', 'chapter opener'],
  slots: [],
  params: {
    density: { default: 5, min: 4, max: 12, label: 'Lattice rows across the mark' },
    lock: { default: 2.1, min: 1.4, max: 3, label: 'Lock time (s)' },
    wordmark: { default: true, label: 'Show wordmark' },
  },
  sfx: [{ t: 0.2, type: 'swell', dur: 1.9, gain: 0.55 }, { t: 2.1, type: 'impact', gain: 0.6 }, { t: 2.1, type: 'shimmer', gain: 0.4 }, { t: 2.5, type: 'whoosh', dur: 0.45, gain: 0.3 }],
  prompt: `Render the logo (about 23% of frame height) to a bitmap and cut its bounding box into a jittered triangular lattice of 5 rows; keep triangles that contain ink. Give each shard a 3D start offset (depth from 0.7 mark heights in front of to 1.6 behind the logo plane, lateral spread 0.6-1.9 mark heights) and a random rotation axis with 1.5-3.5 rad of spin. Every shard starts between 150 and 750 ms and all of them finish at exactly 2100 ms: position uses an emphasized curve (cubic-bezier 0.3,0,0,1), spin outCubic. Rotate the three vertices in 3D, project with focal length 2.4 mark heights, and map the bitmap triangle onto the projected one with an exact affine transform. Shade each shard by its facing ratio (darker when edge-on) and draw a fading hairline edge. On lock, swap to one seamless bitmap with a 450 ms additive flash and glow (white wash on light). At 2450 ms the mark glides left (emphasized, 850 ms) and the name fades in glyph-staggered. Hold 1.3 s.`,
};

function lockup(k, withWord) {
  const name = withWord ? k.brand.name || '' : '';
  let markH = k.pick({ wide: 250, square: 230, tall: 210 }) * k.u;
  const wo = { size: k.pick({ wide: 150, square: 126, tall: 112 }), weight: 620, tracking: -0.035 };
  let L = name ? k.text.layout(name, wo) : null;
  let gap = markH * 0.17;
  let total = markH * k.logo.aspect + (L ? gap + L.width : 0);
  const maxW = k.safe.w * 0.86;
  if (total > maxW) {
    const f = maxW / total;
    markH *= f; gap *= f; wo.size *= f;
    L = k.text.layout(name, wo);
    total = markH * k.logo.aspect + gap + L.width;
  }
  const markW = markH * k.logo.aspect;
  return { markH, markW, gap, wo, L, total, markX: k.cx - total / 2 + markW / 2, wordX: k.cx - total / 2 + markW + gap };
}

// rotate vector v around unit axis a by angle th (Rodrigues)
function rot(v, a, th) {
  const c = Math.cos(th), s = Math.sin(th), d = v[0] * a[0] + v[1] * a[1] + v[2] * a[2];
  return [
    v[0] * c + (a[1] * v[2] - a[2] * v[1]) * s + a[0] * d * (1 - c),
    v[1] * c + (a[2] * v[0] - a[0] * v[2]) * s + a[1] * d * (1 - c),
    v[2] * c + (a[0] * v[1] - a[1] * v[0]) * s + a[2] * d * (1 - c),
  ];
}

export function create(k, p) {
  const { ease, m } = k;
  const lk = lockup(k, p.wordmark);
  const { markH, markW } = lk;
  const pad = 2;
  const can = document.createElement('canvas');
  can.width = Math.ceil(markW + pad * 2); can.height = Math.ceil(markH + pad * 2);
  const cg = can.getContext('2d', { willReadFrequently: true });
  k.logo.draw(cg, can.width / 2, can.height / 2, markH);
  const data = cg.getImageData(0, 0, can.width, can.height).data;
  const inkAt = (x, y) => {
    const xi = Math.round(x), yi = Math.round(y);
    return xi >= 0 && yi >= 0 && xi < can.width && yi < can.height && data[(yi * can.width + xi) * 4 + 3] > 30;
  };
  // jittered lattice in bitmap coords
  const r = m.rng(77);
  const rows = p.density, step = can.height / rows, cols = Math.max(2, Math.round(can.width / step));
  const sx = can.width / cols;
  const P = [];
  for (let j = 0; j <= rows; j++) {
    P.push([]);
    for (let i = 0; i <= cols; i++) {
      const edge = i === 0 || j === 0 || i === cols || j === rows;
      const jx = edge ? 0 : (r() - 0.5) * sx * 0.55, jy = edge ? 0 : (r() - 0.5) * step * 0.55;
      P[j].push([i * sx + jx + (j % 2 ? sx * 0.0 : 0), j * step + jy]);
    }
  }
  const shards = [];
  const addTri = (a, b, c) => {
    // ink test on a few barycentric samples
    let ink = 0;
    for (const [u, v] of [[1 / 3, 1 / 3], [0.7, 0.15], [0.15, 0.7], [0.15, 0.15], [0.45, 0.45], [0.1, 0.45], [0.45, 0.1]]) {
      const w = 1 - u - v;
      if (inkAt(a[0] * u + b[0] * v + c[0] * w, a[1] * u + b[1] * v + c[1] * w)) ink++;
    }
    if (!ink) return;
    const cx = (a[0] + b[0] + c[0]) / 3, cy = (a[1] + b[1] + c[1]) / 3;
    const ax = [r() - 0.5, r() - 0.5, (r() - 0.5) * 0.6];
    const al = Math.hypot(...ax) || 1;
    const ang = r() * m.TAU;
    const spread = (0.6 + r() * 1.3) * markH;
    shards.push({
      src: [a, b, c], c: [cx, cy],
      rel: [a, b, c].map((q) => [q[0] - cx, q[1] - cy, 0]),
      axis: ax.map((x) => x / al), spin: (1.5 + r() * 2) * (r() < 0.5 ? -1 : 1),
      off: [Math.cos(ang) * spread * (k.isWide ? 1.3 : 1), Math.sin(ang) * spread, (-0.7 + r() * 2.3) * markH],
      t0: 0.15 + r() * 0.6,
    });
  };
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const a = P[j][i], b = P[j][i + 1], c = P[j + 1][i], d = P[j + 1][i + 1];
    if ((i + j) % 2) { addTri(a, b, d); addTri(a, d, c); } else { addTri(a, b, c); addTri(b, d, c); }
  }
  const F = markH * 2.4;

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const T = p.lock;
      const slide = lk.L ? ease.emphasized(m.seg(t, T + 0.35, 0.85)) : 0;
      const mcx = m.lerp(k.cx, lk.markX, slide), mcy = k.cy;
      const bx = mcx - can.width / 2, by = mcy - can.height / 2; // bitmap origin on screen

      if (t < T) {
        // sort far-to-near so nearer shards paint on top
        const list = [];
        for (const q of shards) {
          const d = T - q.t0;
          const lin = m.seg(t, q.t0, d);
          if (lin <= 0) continue;
          const pr = ease.emphasized(lin), sp = ease.outCubic(lin);
          const th = q.spin * (1 - sp);
          const o = [q.off[0] * (1 - pr), q.off[1] * (1 - pr), q.off[2] * (1 - pr)];
          const pts = q.rel.map((v) => {
            const w = rot(v, q.axis, th);
            const X = w[0] + q.c[0] - can.width / 2 + o[0], Y = w[1] + q.c[1] - can.height / 2 + o[1], Z = w[2] + o[2];
            const s = F / (F + Z);
            return [mcx + X * s, mcy + Y * s];
          });
          const n = rot([0, 0, 1], q.axis, th);
          list.push({ q, pts, z: o[2], face: Math.abs(n[2]), spec: Math.max(0, n[0] * -0.5 + n[1] * -0.6 + n[2] * 0.62), a: m.seg(lin, 0, 0.12), pr });
        }
        list.sort((A, B) => B.z - A.z);
        for (const it of list) {
          const [s0, s1, s2] = it.q.src, [d0, d1, d2] = it.pts;
          // affine mapping src triangle -> dest triangle
          const ux = s1[0] - s0[0], uy = s1[1] - s0[1], vx = s2[0] - s0[0], vy = s2[1] - s0[1];
          const det = ux * vy - vx * uy;
          if (Math.abs(det) < 1e-6) continue;
          const pxu = d1[0] - d0[0], pyu = d1[1] - d0[1], pxv = d2[0] - d0[0], pyv = d2[1] - d0[1];
          const a = (pxu * vy - pxv * uy) / det, b = (pyu * vy - pyv * uy) / det;
          const cc = (pxv * ux - pxu * vx) / det, d = (pyv * ux - pyu * vx) / det;
          const e = d0[0] - a * s0[0] - cc * s0[1], f = d0[1] - b * s0[0] - d * s0[1];
          g.save();
          g.setTransform(a, b, cc, d, e, f);
          g.globalAlpha = it.a;
          // slightly grown clip hides lattice seams
          const gx = it.q.c[0], gy = it.q.c[1], grow = 1.012;
          g.beginPath();
          g.moveTo(gx + (s0[0] - gx) * grow, gy + (s0[1] - gy) * grow);
          g.lineTo(gx + (s1[0] - gx) * grow, gy + (s1[1] - gy) * grow);
          g.lineTo(gx + (s2[0] - gx) * grow, gy + (s2[1] - gy) * grow);
          g.closePath();
          g.save();
          g.clip();
          g.drawImage(can, 0, 0);
          // facing shade + specular glint, only on ink
          g.globalCompositeOperation = 'source-atop';
          const shade = (1 - it.face) * 0.65 * (1 - it.pr);
          if (shade > 0.01) { g.fillStyle = `rgba(0,0,0,${shade.toFixed(3)})`; g.fill(); }
          const glint = Math.pow(it.spec, 6) * 0.7 * (1 - it.pr);
          if (glint > 0.01) { g.fillStyle = `rgba(255,255,255,${glint.toFixed(3)})`; g.fill(); }
          g.restore();
          // hairline edge while in flight
          const edge = (1 - it.pr) * (k.isDark ? 0.35 : 0.3);
          if (edge > 0.01) {
            g.setTransform(1, 0, 0, 1, 0, 0);
            g.beginPath(); g.moveTo(d0[0], d0[1]); g.lineTo(d1[0], d1[1]); g.lineTo(d2[0], d2[1]); g.closePath();
            g.strokeStyle = k.color.alpha(k.isDark ? '#ffffff' : c.fg, edge);
            g.lineWidth = Math.max(1, 0.9 * k.u);
            g.stroke();
          }
          g.restore();
        }
      } else {
        // locked: one seamless bitmap + flash
        const fl = 1 - ease.outCubic(m.seg(t, T, 0.45));
        if (fl > 0 && k.isDark) k.draw.glow(g, mcx, mcy, markH * 1.6, c.accent, 0.4 * fl);
        g.drawImage(can, bx, by);
        if (fl > 0) {
          g.save();
          if (k.isDark) { g.globalCompositeOperation = 'lighter'; g.globalAlpha = 0.7 * fl; g.drawImage(can, bx, by); }
          else {
            k.draw.glow(g, mcx, mcy, markH * 1.3, '#ffffff', 0.9 * fl);
          }
          g.restore();
        }
      }

      if (lk.L && t > T + 0.5) {
        k.text.glyphs(g, k.brand.name, lk.wordX, mcy, { ...lk.wo, baseline: 'middle' }, (i) => {
          const e = ease.outQuint(m.seg(t, T + 0.55 + i * 0.05, 0.7));
          return { x: (1 - e) * lk.L.cap * 0.25, a: e };
        });
      }
    },
  };
}
