// A staircase path climbs up and to the right, drawn by a glowing head. Each time it
// reaches a new step a flag pops on the corner with a date and milestone, and the camera
// rises with the climb. The top step carries the real headline number from copy.stats.
export const meta = {
  id: 'data.milestone-stairs',
  name: 'Milestone Stairs',
  category: 'data',
  duration: 6,
  summary: 'A stepped accent path climbs with a glowing head while the camera follows upward; flags with dates and milestones pop at each step and the top step lands the copy.stats number; holds, then fades in the last 0.45 s.',
  bestFor: ['journey', 'timeline', 'momentum'],
  slots: ['stats'],
  params: {
    milestones: {
      default: [
        { date: 'Spring 2023', label: 'Private beta' },
        { date: 'Autumn 2023', label: 'Public launch' },
        { date: 'Early 2024', label: 'Team workspaces' },
        { date: 'Late 2024', label: 'One-click releases' },
      ],
      label: 'SAMPLE DATA: earlier steps [{date, label}] (top step comes from copy.stats)',
    },
    topDate: { default: 'Today', label: 'Date label on the top step' },
    stat: { default: 0, min: 0, max: 2, label: 'copy.stats index for the top step' },
    stepDur: { default: 0.72, min: 0.5, max: 1, label: 'Seconds per step' },
  },
  sfx: [{ t: 0.95, type: 'pop', gain: 0.4 }, { t: 1.67, type: 'pop', gain: 0.4 }, { t: 2.39, type: 'pop', gain: 0.4 }, { t: 3.11, type: 'pop', gain: 0.4 }, { t: 3.85, type: 'shimmer', gain: 0.6 }],
  prompt: `Journey staircase, 6 s. Five steps rise to the right across the right ~68% of the frame; each riser is ~21% of frame height (15% on 9:16), so the climb is taller than the frame. Draw all steps first as a faint dashed ghost. From 400 ms an accent stroke (4 px, round joins) traces riser then tread, 720 ms per step with inOutCubic, led by a glowing head, with a faint accent gradient filling beneath. A camera translate follows the continuous climb, keeping the head near 55% of frame height. As the stroke reaches each corner a flag pops (pole outExpo 300 ms, pennant outBack); right-aligned left of the corner sit a 26 px mono date and a 38 px label. The fifth flag is the hero: accent pennant, the copy.stats number in ~120 px display plus its label, and a glow pulse. Labels fade near the frame edges. Hold, then fade over 450 ms inCubic.`,
};

function fmt(v, d = 0) {
  return v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
}

export function create(k, p) {
  const { ease, m, color: C } = k;
  const stats = k.copy('stats', null) || [{ value: 10000, suffix: '+', label: 'customers' }];
  const st = stats[Math.min(p.stat, stats.length - 1)];
  const steps = [...p.milestones.map((s) => ({ ...s })), { date: p.topDate, label: st.label, value: fmt(st.value, st.decimals || 0) + (st.suffix || ''), hero: true }];
  const n = steps.length;
  const D = p.duration ?? meta.duration;
  const T0 = 0.4, SD = p.stepDur;

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const u = k.u;
      const S = k.safe;
      const exitP = ease.inCubic(m.seg(t, D - 0.45, 0.45));
      const fade = 1 - exitP;
      const stairX0 = S.x + S.w * k.pick({ wide: 0.32, square: 0.44, tall: 0.46 });
      const stairX1 = S.x + S.w - 10 * u;
      const sw = (stairX1 - stairX0) / n;
      const sh = k.H * k.pick({ wide: 0.21, square: 0.2, tall: 0.15 });
      // world coords: corner i at (stairX0 + i*sw, baseY - (i+1)*sh); path starts at (stairX0, baseY)
      const baseY = 0;
      const corner = (i) => [stairX0 + i * sw, baseY - (i + 1) * sh];
      const pts = [[stairX0 - sw * 0.6, baseY], [stairX0, baseY]];
      for (let i = 0; i < n; i++) {
        const [cx, cy] = corner(i);
        pts.push([cx, cy]);
        pts.push([cx + (i === n - 1 ? sw * 0.6 : sw), cy]);
      }
      // progress: first lead-in, then each step riser+tread
      const lead = ease.inOutCubic(m.seg(t, T0 - 0.25, 0.4));
      const sp = m.clamp((t - T0) / SD, 0, n); // continuous steps
      const si = Math.min(n - 1, Math.floor(sp));
      const sf = sp >= n ? 1 : ease.inOutCubic(sp - Math.floor(sp));
      const climb = sp >= n ? n : Math.floor(sp) + sf; // eased continuous step count

      // camera: keep head near 55% height, clamp to start/end framing
      const headWorldY = baseY - climb * sh;
      const camStart = baseY - k.H * 0.78; // start: base at 78% of frame
      const camEnd = corner(n - 1)[1] - k.H * 0.42;
      const camY = m.clamp(headWorldY - k.H * 0.55, camEnd, camStart);
      const camF = camY; // world y at screen top
      const toS = (y) => y - camF;

      // ghost stairs
      g.save();
      g.globalAlpha = fade * ease.outCubic(m.seg(t, 0.05, 0.5));
      g.setLineDash([3 * u, 9 * u]);
      g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, toS(y)) : g.moveTo(x, toS(y))));
      g.strokeStyle = C.alpha(c.fg, k.isDark ? 0.18 : 0.22); g.lineWidth = 2 * u; g.lineCap = 'round'; g.stroke();
      g.setLineDash([]);
      g.restore();

      // traced path
      const traced = [[pts[0][0], toS(pts[0][1])]];
      const leadEnd = [m.lerp(pts[0][0], pts[1][0], lead), toS(pts[1][1])];
      traced.push(leadEnd);
      let head = leadEnd;
      if (lead >= 1) {
        for (let i = 0; i <= si; i++) {
          const f = i < si ? 1 : sf;
          if (i === si && sp <= 0) break;
          const [cx, cy] = corner(i);
          const ty = cy;
          const tx1 = cx + (i === n - 1 ? sw * 0.6 : sw);
          // riser first 45%, tread after
          const rf = m.clamp(f / 0.45), tf = m.clamp((f - 0.45) / 0.55);
          const ry = m.lerp(cy + sh, ty, rf);
          traced.push([cx, toS(ry)]);
          head = [cx, toS(ry)];
          if (tf > 0) { const x = m.lerp(cx, tx1, tf); traced.push([x, toS(ty)]); head = [x, toS(ty)]; }
        }
      }
      // soft mass under the traced steps
      if (traced.length > 2) {
        g.save();
        g.globalAlpha = fade;
        g.beginPath(); g.moveTo(traced[0][0], k.H);
        traced.forEach(([x, y]) => g.lineTo(x, y));
        g.lineTo(head[0], k.H); g.closePath();
        const grd = g.createLinearGradient(0, head[1], 0, k.H);
        grd.addColorStop(0, C.alpha(c.accent, k.isDark ? 0.13 : 0.09));
        grd.addColorStop(1, C.alpha(c.accent, 0));
        g.fillStyle = grd; g.fill();
        g.restore();
      }
      g.save();
      g.globalAlpha = fade;
      if (k.isDark) { g.shadowColor = C.alpha(c.accent, 0.6); g.shadowBlur = 16 * u; }
      g.beginPath(); traced.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.strokeStyle = c.accent; g.lineWidth = 4 * u; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke();
      g.restore();
      // head
      const moving = t > T0 - 0.25 && sp < n;
      const ha = fade * (moving ? 1 : 1 - m.seg(t, T0 + n * SD, 0.4));
      if (ha > 0) {
        g.save(); g.globalAlpha = ha;
        if (k.isDark) k.draw.glow(g, head[0], head[1], 36 * u, c.accent, 0.7);
        k.draw.circle(g, head[0], head[1], 7 * u, k.isDark ? '#ffffff' : c.surface, c.accent, 3);
        g.restore();
      }

      // flags
      steps.forEach((s, i) => {
        const reach = T0 + i * SD + SD * 0.42; // stroke reaches the corner
        const pole = ease.outExpo(m.seg(t, reach, 0.3));
        if (pole <= 0) return;
        const [cx, cyW] = corner(i);
        const cy = toS(cyW);
        const poleH = (s.hero ? 120 : 84) * u;
        const pa = fade;
        g.save(); g.globalAlpha = pa;
        k.draw.line(g, cx, cy, cx, cy - poleH * pole, C.alpha(s.hero ? c.accent : c.fg, s.hero ? 0.9 : 0.45), 2, 'round');
        const pen = ease.outBack(m.seg(t, reach + 0.12, 0.45), 1.6);
        if (pen > 0) {
          const py = cy - poleH * pole;
          const pw = (s.hero ? 40 : 28) * u * pen, ph = (s.hero ? 28 : 20) * u;
          g.beginPath(); g.moveTo(cx, py); g.lineTo(cx + pw, py + ph / 2 * pen); g.lineTo(cx, py + ph * pen); g.closePath();
          g.fillStyle = s.hero ? c.accent : C.mix(c.fg, c.bg, 0.25); g.fill();
        }
        k.draw.circle(g, cx, cy, 6 * u, s.hero ? c.accent : (k.isDark ? c.fg : c.surface), c.accent, 2.5);
        if (s.hero) {
          const pulse = Math.sin(Math.PI * m.seg(t, reach, 0.9));
          if (k.isDark && pulse > 0) k.draw.glow(g, cx, cy, 90 * u, c.accent, 0.5 * pulse);
          else if (pulse > 0) { g.globalAlpha = pa * pulse * 0.5; k.draw.circle(g, cx, cy, (10 + 40 * m.seg(t, reach, 0.9)) * u, null, c.accent, 2); }
        }
        g.restore();

        // text, right-aligned left of the corner
        // text fades as the camera carries it toward the frame edge (stays inside title-safe)
        const edge = m.smoothstep(S.y + S.h + 10 * u, S.y + S.h - 90 * u, cy + 40 * u) * m.smoothstep(k.H * 0.02, S.y + 60 * u, cy - 200 * u);
        const ta = ease.outExpo(m.seg(t, reach + 0.08, 0.6)) * fade * edge;
        if (ta <= 0) return;
        const tx = cx - 30 * u;
        const maxW = tx - S.x;
        const dx = (1 - ta) * 18 * u;
        if (s.hero) {
          const vo = { size: k.pick({ wide: 120, square: 96, tall: 88 }), weight: 650, tracking: -0.045 };
          vo.size = k.text.fit(s.value, vo, maxW);
          const VL = k.text.layout(s.value, vo);
          const vy = cy - 40 * u;
          k.text.draw(g, s.date, tx - dx, vy - VL.cap - 22 * u, { role: 'mono', size: 24, weight: 500, color: k.isDark ? C.mix(c.accent, c.fg, 0.3) : C.shade(c.accent, -0.06), align: 'right', baseline: 'bottom', alpha: ta });
          k.text.draw(g, s.value, tx - dx, vy, { ...vo, align: 'right', baseline: 'alphabetic', alpha: ta });
          k.text.draw(g, s.label, tx - dx, vy + 22 * u, { role: 'text', size: 34, weight: 480, color: c.muted, align: 'right', baseline: 'top', alpha: ta });
        } else {
          const lo = { role: 'text', size: k.pick({ wide: 38, square: 34, tall: 34 }), weight: 540 };
          const ls = k.text.fit(s.label, lo, maxW, 24);
          k.text.draw(g, s.date, tx - dx, cy - (k.isWide ? 74 : 66) * u, { role: 'mono', size: 26, color: c.muted, align: 'right', baseline: 'bottom', alpha: ta, qaGroup: 'f' + i });
          k.text.draw(g, s.label, tx - dx, cy - 22 * u, { ...lo, size: ls, align: 'right', baseline: 'alphabetic', alpha: ta, qaGroup: 'f' + i });
        }
      });
    },
  };
}
