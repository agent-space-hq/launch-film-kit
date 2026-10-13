// Three thin rings orbit in perspective, each carrying a bright bead. They shrink
// and untilt until all three coincide into one flat circle around the centre; at
// that instant they lock (pulse) and the mark appears inside. Wordmark follows.
export const meta = {
  id: 'logo.orbit-lock',
  name: 'Orbit Lock',
  category: 'logo',
  duration: 4.6,
  summary: 'Three perspective rings with travelling beads orbit and collapse inward until they coincide and lock with a pulse; the mark appears at the lock, the ring fades and the wordmark joins.',
  bestFor: ['tech brand reveal', 'platform or network product', 'opening ident'],
  slots: [],
  params: {
    lock: { default: 2.2, min: 1.4, max: 3.2, label: 'Lock time (s)' },
    wordmark: { default: true, label: 'Show wordmark' },
  },
  sfx: [{ t: 0.1, type: 'swell', dur: 2.0, gain: 0.5 }, { t: 2.2, type: 'impact', gain: 0.55 }, { t: 2.2, type: 'shimmer', gain: 0.45 }, { t: 2.75, type: 'whoosh', dur: 0.45, gain: 0.3 }],
  prompt: `Three circles in 3D share the frame centre. Each starts with radius 42% of the short side, its own tilt (0.9-1.25 rad about X, then a yaw that precesses at 0.6 rad/s) and draws on around its circumference in 500 ms (outQuint, 80 ms stagger). Project with perspective (focal 3 radii) and draw the far half thinner at 30% opacity, the near half 1.6 px at 90%; ring one is the accent, rings two and three the foreground at 55% and 35% (75% and 50% on light backgrounds). Each carries a bright bead with a short comet tail orbiting at about 1.8 rad/s. From 200 ms to the lock at 2200 ms (inOutCubic) radii shrink to 0.75 mark heights, while tilts and precession hold until 800 ms and then go to zero (inOutCubic, 1400 ms), so the rings coincide exactly at the lock. At lock: ring width pulses, a glow blooms, and the mark (about 23% of frame height) scales 0.86 to 1 with outExpo over 600 ms. The merged ring fades out with inCubic by 2670 ms, the mark glides left (emphasized, 850 ms, from 2550 ms) and the name fades up glyph-staggered. Hold 1.2 s.`,
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

export function create(k, p) {
  const { ease, m } = k;
  const lk = lockup(k, p.wordmark);
  const { markH } = lk;
  const R0 = 0.42 * k.vmin, R1 = markH * 0.75;
  const rings = [
    { tx: 1.05, ty: 0.2, yaw0: 0.0, bead: 0.0, w: 1.9 },
    { tx: 1.25, ty: -0.5, yaw0: 2.1, bead: 2.3, w: -1.7 },
    { tx: 0.9, ty: 0.9, yaw0: 4.2, bead: 4.4, w: 1.6 },
  ];
  const N = 120;
  return {
    draw(g, t) {
      const c = k.brand.colors, C = k.color;
      const T = p.lock;
      const col = [c.accent, C.alpha(c.fg, k.isDark ? 0.55 : 0.75), C.alpha(c.fg, k.isDark ? 0.35 : 0.5)];
      const slide = lk.L ? ease.emphasized(m.seg(t, T + 0.35, 0.85)) : 0;
      const mcx = m.lerp(k.cx, lk.markX, slide), mcy = k.cy;
      const col2 = ease.inOutCubic(m.seg(t, 0.2, T - 0.2));
      const R = m.lerp(R0, R1, col2);
      const F = R0 * 3;
      const fade = 1 - ease.inCubic(m.seg(t, T + 0.12, 0.35));
      const pulse = Math.max(0, 1 - m.seg(t, T, 0.5)) * (t >= T ? 1 : 0);
      const locked = t >= T;

      // lock glow
      if (locked && k.isDark) k.draw.glow(g, mcx, mcy, R1 * 2.4, c.accent, 0.35 * ease.outCubic(pulse));

      if (fade > 0) {
        g.save();
        g.lineCap = 'round';
        rings.forEach((rg, ri) => {
          const draw = ease.outQuint(m.seg(t, 0.05 + ri * 0.08, 0.5));
          if (draw <= 0) return;
          const tilt = 1 - ease.inOutCubic(m.seg(t, 0.8, T - 0.8));
          const ax = rg.tx * tilt, ay = rg.ty * tilt;
          const yaw = (rg.yaw0 + t * 0.6) * tilt;
          // project ring points
          const pts = [];
          for (let i = 0; i <= N; i++) {
            const a = (i / N) * m.TAU + rg.bead;
            let v = [Math.cos(a) * R, Math.sin(a) * R, 0];
            v = m.rotX(v, ax); v = m.rotY(v, ay); v = m.rotZ(v, yaw);
            const s = F / (F + v[2]);
            pts.push([mcx + v[0] * s, mcy + v[1] * s, v[2]]);
          }
          const nDraw = Math.max(1, Math.round(N * draw));
          // two passes: far then near
          for (const far of [true, false]) {
            g.beginPath();
            let pen = false;
            for (let i = 0; i < nDraw; i++) {
              const q0 = pts[i], q1 = pts[i + 1];
              const isFar = (q0[2] + q1[2]) / 2 > 0;
              if (isFar !== far || (locked && false)) { pen = false; continue; }
              if (!pen) { g.moveTo(q0[0], q0[1]); pen = true; }
              g.lineTo(q1[0], q1[1]);
            }
            const lw = (far ? 1 : 1.6 + 2.2 * pulse) * k.u;
            g.lineWidth = lw;
            g.strokeStyle = col[ri];
            g.globalAlpha = fade * (far ? (k.isDark ? 0.3 : 0.4) : 0.9);
            g.stroke();
          }
          // bead with comet tail (travels along the ring)
          if (!locked) {
            const live = draw * (1 - m.seg(t, T - 0.25, 0.25));
            const ba = t * rg.w;
            const pos = (u) => {
              const a = ba + rg.bead + u;
              let v = [Math.cos(a) * R, Math.sin(a) * R, 0];
              v = m.rotX(v, ax); v = m.rotY(v, ay); v = m.rotZ(v, yaw);
              const s = F / (F + v[2]);
              return [mcx + v[0] * s, mcy + v[1] * s, v[2]];
            };
            const head = pos(0);
            const dir = Math.sign(rg.w);
            g.beginPath();
            for (let j = 0; j <= 12; j++) { const q = pos(-dir * j * 0.035); if (j === 0) g.moveTo(q[0], q[1]); else g.lineTo(q[0], q[1]); }
            g.globalAlpha = live * (head[2] > 0 ? 0.5 : 1);
            g.strokeStyle = ri === 0 ? c.accent : C.alpha(c.fg, 0.9);
            g.lineWidth = 2.6 * k.u;
            g.stroke();
            if (k.isDark) k.draw.glow(g, head[0], head[1], 30 * k.u, ri === 0 ? c.accent : c.fg, 0.5 * live);
            g.globalAlpha = live;
            k.draw.circle(g, head[0], head[1], 4 * k.u, ri === 0 ? (k.isDark ? '#ffffff' : c.accent) : c.fg);
          }
        });
        g.restore();
      }

      // the mark appears at the lock
      if (locked) {
        const e = ease.outExpo(m.seg(t, T, 0.6));
        k.logo.draw(g, mcx, mcy, markH * m.lerp(0.86, 1, e), { alpha: m.seg(t, T, 0.12) });
      }

      if (lk.L && t > T + 0.5) {
        k.text.glyphs(g, k.brand.name, lk.wordX, mcy, { ...lk.wo, baseline: 'middle' }, (i) => {
          const e = ease.outQuint(m.seg(t, T + 0.55 + i * 0.05, 0.7));
          return { y: (1 - e) * lk.L.cap * 0.3, a: e };
        });
      }
    },
  };
}
