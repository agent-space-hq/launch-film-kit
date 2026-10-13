// An orthographic dot globe (Fibonacci points, invented noise "landmasses") turns
// slowly. Location pins rise along the surface normal with pulse rings, a lifted
// great-circle arc travels between them, and the reach stat from copy.stats settles.
export const meta = {
  id: 'data.dot-globe',
  name: 'Dot Globe',
  category: 'data',
  duration: 5.4,
  summary: 'A slowly turning dot-sphere globe resolves, pins rise with pulse rings, two lifted arcs travel between them while the reach number settles; holds, then fades in the last 0.45 s while still turning.',
  bestFor: ['global reach', 'scale', 'network'],
  slots: ['stats'],
  params: {
    stat: { default: 0, min: 0, max: 2, label: 'copy.stats index shown beside the globe' },
    points: { default: 5200, min: 1500, max: 6000, label: 'Globe dots' },
    spin: { default: 0.14, min: 0, max: 0.4, label: 'Rotation (rad/s, constant drift)' },
    caption: { default: 'Shipping from every time zone', label: 'Kicker line above the number' },
  },
  sfx: [{ t: 0.1, type: 'swell', dur: 1.2, gain: 0.4 }, { t: 1.2, type: 'pop', gain: 0.45 }, { t: 1.4, type: 'pop', gain: 0.45 }, { t: 1.6, type: 'pop', gain: 0.45 }, { t: 2.0, type: 'whoosh', dur: 0.8, gain: 0.3 }],
  prompt: `Globe for reach, 5.4 s. Place ~5200 Fibonacci-sphere points, tilt the sphere 18 degrees toward the viewer and yaw it at a constant 0.14 rad/s; project orthographically (radius 36% of the short side). Mark invented "land" where 3D fbm noise of the unit position passes a threshold: land dots larger and brighter, sea dots faint; shade by facing and skip the far side. The globe resolves from 94% scale with outExpo over 900 ms while dots fade in as a top-to-bottom latitude sweep. From 1.1 s five pins rise along their surface normals (outBack, 500 ms, staggered 120 ms) with repeating pulse rings. From 1.9 s two great-circle arcs lifted 22% above the surface draw over 900 ms (inOutCubic) with a glowing head. A kicker, the copy.stats number (display ~136 px) and its label rise beside the globe on wide, below on tall. Hold, then fade over 450 ms inCubic.`,
};

function fmt(v, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}
const toVec = (lat, lon) => [Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon)];

export function create(k, p) {
  const { ease, m, color: C } = k;
  const noise = m.makeNoise(31);
  const N = p.points;
  const pts = [];
  for (let i = 0; i < N; i++) {
    const [x, y, z] = m.fibSphere(i, N);
    const land = noise.fbm(x * 1.7 + 3.1, y * 1.7, z * 1.7 - 1.3, 4) + 0.08 * Math.cos(y * 3) > 0.02 && Math.abs(y) < 0.86;
    pts.push({ x, y, z, land, lat: Math.asin(y) });
  }
  // pins: lat/lon in radians, chosen to face the camera mid-shot
  const D = p.duration ?? meta.duration;
  const midRot = p.spin * D * 0.5;
  const pinLL = [[0.62, -0.55], [0.2, 0.05], [0.5, 0.62], [-0.32, -0.25], [-0.15, 0.55]];
  const pins = pinLL.map(([la, lo]) => toVec(la, lo - midRot));
  const arcs = [[0, 2], [3, 4]];
  const stats = k.copy('stats', null) || [{ value: 10000, suffix: '+', label: 'customers' }];
  const st = stats[Math.min(p.stat, stats.length - 1)];
  const tilt = 0.32;

  const xf = (v, rot) => {
    let q = m.rotY(v, rot);
    q = m.rotX(q, tilt);
    return q;
  };
  const slerp = (a, b, s) => {
    const dot = m.clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1);
    const om = Math.acos(dot);
    if (om < 1e-4) return a;
    const sa = Math.sin((1 - s) * om) / Math.sin(om), sb = Math.sin(s * om) / Math.sin(om);
    return [a[0] * sa + b[0] * sb, a[1] * sa + b[1] * sb, a[2] * sa + b[2] * sb];
  };

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const u = k.u;
      const wide = k.isWide;
      const exitP = ease.inCubic(m.seg(t, D - 0.45, 0.45));
      const fade = 1 - exitP;
      const R0 = k.pick({ wide: 390, square: 380, tall: 420 }) * u;
      const textW = 640 * u;
      let gx, gy, tx, ty, align;
      if (wide) {
        const total = R0 * 2 + 140 * u + textW;
        gx = k.cx - total / 2 + R0; gy = k.cy;
        tx = gx + R0 + 140 * u; ty = k.cy; align = 'left';
      } else {
        gx = k.cx; gy = k.cy - (k.isPortrait ? 230 : 150) * u;
        tx = k.cx; ty = gy + R0 + (k.isPortrait ? 230 : 170) * u; align = 'center';
      }
      const inP = ease.outExpo(m.seg(t, 0, 0.9));
      const R = R0 * (0.94 + 0.06 * inP);
      const rot = p.spin * t;

      // atmosphere / rim
      g.save();
      g.globalAlpha = fade;
      if (k.isDark) k.draw.glow(g, gx, gy, R * 1.5, c.accent, 0.12 * inP);
      const disc = g.createRadialGradient(gx - R * 0.3, gy - R * 0.35, R * 0.1, gx, gy, R);
      disc.addColorStop(0, C.alpha(c.fg, k.isDark ? 0.05 : 0.03));
      disc.addColorStop(1, C.alpha(c.fg, k.isDark ? 0.015 : 0.05));
      g.globalAlpha = fade * inP;
      k.draw.circle(g, gx, gy, R, disc, C.alpha(c.fg, k.isDark ? 0.12 : 0.14), 1.2);
      g.restore();

      // dots, bucketed by depth for batched fills
      const buckets = 5;
      const paths = [];
      for (let b = 0; b < buckets * 2; b++) paths.push(new Path2D());
      const sweep = m.seg(t, 0.05, 1.1);
      for (const q of pts) {
        const v = xf([q.x, q.y, q.z], rot);
        if (v[2] <= 0.02) continue;
        const latF = (1 - q.y) / 2; // 0 top .. 1 bottom
        if (latF > sweep * 1.25) continue;
        const b = Math.min(buckets - 1, Math.floor(v[2] * buckets));
        const r = (q.land ? 2.9 : 1.7) * u * (0.55 + 0.45 * v[2]);
        const sx = gx + v[0] * R, sy = gy - v[1] * R;
        const path = paths[b * 2 + (q.land ? 1 : 0)];
        path.moveTo(sx + r, sy); path.arc(sx, sy, r, 0, Math.PI * 2);
      }
      g.save();
      g.globalAlpha = fade * m.seg(t, 0.05, 0.4);
      for (let b = 0; b < buckets; b++) {
        const depth = (b + 0.5) / buckets;
        g.fillStyle = C.alpha(c.fg, (k.isDark ? 0.2 : 0.2) * (0.35 + 0.65 * depth));
        g.fill(paths[b * 2]);
        g.fillStyle = C.alpha(k.isDark ? C.mix(c.fg, c.accent, 0.25) : C.mix(c.fg, c.accent, 0.15), (k.isDark ? 0.95 : 0.75) * (0.25 + 0.75 * depth));
        g.fill(paths[b * 2 + 1]);
      }
      g.restore();

      // arcs (behind pins)
      arcs.forEach(([a, b], ai) => {
        const ap = ease.inOutCubic(m.seg(t, 1.9 + ai * 0.45, 0.9));
        if (ap <= 0) return;
        const steps = 64;
        const scr = [];
        for (let s = 0; s <= steps; s++) {
          const f = (s / steps) * ap;
          const base = slerp(pins[a], pins[b], f);
          const lift = 1.09 + 0.22 * Math.sin(Math.PI * f);
          const v = xf([base[0] * lift, base[1] * lift, base[2] * lift], rot);
          scr.push([gx + v[0] * R, gy - v[1] * R, v[2]]);
        }
        g.save();
        g.globalAlpha = fade;
        g.lineCap = 'round';
        for (let s = 1; s < scr.length; s++) {
          if (scr[s][2] < -0.05) continue;
          g.beginPath(); g.moveTo(scr[s - 1][0], scr[s - 1][1]); g.lineTo(scr[s][0], scr[s][1]);
          g.strokeStyle = C.alpha(c.accent, 0.35 + 0.65 * (s / scr.length));
          g.lineWidth = 2.5 * u; g.stroke();
        }
        const head = scr[scr.length - 1];
        if (ap < 1 && head[2] > 0) {
          if (k.isDark) k.draw.glow(g, head[0], head[1], 30 * u, c.accent, 0.8);
          k.draw.circle(g, head[0], head[1], 4.5 * u, k.isDark ? '#ffffff' : c.accent);
        }
        g.restore();
      });

      // pins
      pins.forEach((pv, i) => {
        const pt = 1.1 + i * 0.12;
        const rise = ease.outBack(m.seg(t, pt, 0.5), 1.3);
        if (rise <= 0) return;
        const v = xf(pv, rot);
        if (v[2] < 0.05) return;
        const h = 0.09 * rise;
        const bx = gx + v[0] * R, by = gy - v[1] * R;
        const tv = xf([pv[0] * (1 + h), pv[1] * (1 + h), pv[2] * (1 + h)], rot);
        const hx = gx + tv[0] * R, hy = gy - tv[1] * R;
        const face = m.smoothstep(0.05, 0.3, v[2]);
        g.save();
        g.globalAlpha = fade * face * m.clamp(rise * 2);
        // pulse rings on the surface (flattened by facing)
        const ph = ((t - pt) / 1.6) % 1;
        if (t > pt) {
          for (const off of [0, 0.5]) {
            const q = (ph + off) % 1;
            g.save();
            g.globalAlpha *= (1 - q) * 0.7;
            g.translate(bx, by);
            const ang = Math.atan2(-v[1], v[0]);
            g.rotate(ang);
            g.scale(Math.max(0.15, v[2]), 1);
            k.draw.circle(g, 0, 0, (8 + 34 * q) * u, null, c.accent, 1.6);
            g.restore();
          }
        }
        k.draw.line(g, bx, by, hx, hy, C.alpha(c.accent, 0.9), 2, 'round');
        if (k.isDark) k.draw.glow(g, hx, hy, 26 * u, c.accent, 0.55);
        k.draw.circle(g, hx, hy, 7 * u, c.accent, k.isDark ? '#ffffff' : c.surface, 2);
        g.restore();
      });

      // text block
      const kick = ease.outExpo(m.seg(t, 1.3, 0.8)) * fade;
      const nIn = ease.outExpo(m.seg(t, 1.45, 0.9)) * fade;
      const la = ease.outExpo(m.seg(t, 1.65, 0.8)) * fade;
      const finalStr = fmt(st.value, st.decimals || 0) + (st.suffix || '');
      const o = { size: k.pick({ wide: 136, square: 120, tall: 130 }), weight: 650, tracking: -0.045 };
      o.size = k.text.fit(finalStr, o, wide ? textW : k.safe.w);
      const L = k.text.layout(finalStr, o);
      const kickY = ty - L.cap / 2 - 40 * u;
      if (kick > 0) {
        const ko = { role: 'text', size: 30, weight: 500 };
        k.text.draw(g, p.caption, tx, kickY + (1 - kick) * 14 * u, { ...ko, size: k.text.fit(p.caption, ko, wide ? textW : k.safe.w, 22), color: k.isDark ? C.mix(c.accent, c.fg, 0.35) : C.shade(c.accent, -0.08), align, baseline: 'bottom', alpha: kick });
      }
      if (nIn > 0) k.text.draw(g, finalStr, tx, ty + (1 - nIn) * 22 * u, { ...o, align, baseline: 'middle', alpha: nIn });
      if (la > 0) k.text.draw(g, st.label, tx, ty + L.cap / 2 + 30 * u + (1 - la) * 12 * u, { role: 'text', size: 36, weight: 470, color: c.muted, align, baseline: 'top', alpha: la });
    },
  };
}
