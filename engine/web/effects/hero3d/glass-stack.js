// Four glass cards lie stacked like layers, seen from above in perspective. They
// rise in, fan apart vertically, settle to an even rhythm, and a specular band
// sweeps across each pane in turn. The top pane carries the mark. Each card is a
// real 3D quad (projected, depth-sorted); in-plane content uses the affine map of
// the projected corners, which is accurate at this mild perspective.
export const meta = {
  id: 'hero3d.glass-stack',
  name: 'Glass Stack',
  category: 'hero3d',
  duration: 5,
  ownsBackground: false,
  summary: 'Four translucent glass panes rise in as a tight stack, fan apart, settle and catch a sweeping highlight; the top pane carries the mark. Ends with a short drop-and-fade exit.',
  bestFor: ['platform / layers story', 'hero object', 'brand reveal'],
  slots: ['headline'],
  params: {
    caption: { default: true, label: 'Show headline under the stack' },
    yaw: { default: -0.62, min: -1.2, max: 1.2, label: 'Yaw (rad)' },
  },
  sfx: [{ t: 0.1, type: 'whoosh', dur: 0.5, gain: 0.35 }, { t: 1.0, type: 'swell', dur: 1.0, gain: 0.4 }, { t: 2.3, type: 'shimmer', gain: 0.45 }],
  prompt: `Four glass panes (aspect 1.5:1, 54% of the short side wide) lie flat, stacked vertically, viewed from 34 degrees above with a -36 degree yaw and focal length 4.2x the pane width. 0-900 ms: panes rise 18% of the frame from below, staggered 80 ms, outExpo, gap 4%. 900-1900 ms: the gap opens to 24% (emphasized ease) while yaw drifts 8 degrees. 1900-2700 ms: settle to 14% (inOutCubic). From 2200 ms a soft white specular band (20% of the pane) sweeps corner to corner across each pane, 120 ms apart, 700 ms each. Panes: hairline border, top edge brighter, accent tint rising with height, soft shadow on light brands, glow under the stack on dark. The top pane shows the mark via the affine map of its projected corners. Headline fades up beneath at 1600 ms (display 64 ref px). Exit in the last 450 ms: inCubic drop of 6% and fade.`,
};

export function create(k, p) {
  const { m, ease } = k;
  const D = p.duration ?? meta.duration;
  const c = k.brand.colors;
  const N = 4;
  const str = k.copy('headline', k.brand.name);
  const capO = { size: k.pick({ wide: 64, square: 60, tall: 58 }), weight: 620, tracking: -0.03 };
  const capLines = k.text.balance(str, capO, k.safe.w * k.pick({ wide: 0.7, square: 0.86, tall: 0.9 }));
  const PW = 1, PH = 0.66;
  // far-left, far-right, near-right, near-left: pane-space v runs from the far edge to the near edge
  const corners = [[-PW / 2, PH / 2], [PW / 2, PH / 2], [PW / 2, -PH / 2], [-PW / 2, -PH / 2]];
  const glassTop = k.isDark ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.72)';
  const glassBot = k.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.38)';
  return {
    draw(g, t) {
      const exit = ease.inCubic(m.seg(t, D - 0.45, 0.45));
      const open = ease.emphasized(m.seg(t, 0.9, 1.0));
      const settle = ease.inOutCubic(m.seg(t, 1.9, 0.8));
      const gap = m.lerp(m.lerp(0.04, 0.24, open), 0.14, settle);
      const yaw = p.yaw + 0.14 * ease.inOutCubic(m.seg(t, 0.6, 2.4));
      const pitch = 0.6;
      const scale = k.vmin * k.pick({ wide: 0.54, square: 0.6, tall: 0.68 });
      const cx = k.cx, cy = k.cy - (p.caption ? k.pick({ wide: 0.05, square: 0.06, tall: 0.05 }) * k.H : 0) + exit * 0.06 * k.H;
      const focal = 4.2;
      const proj = (x, y, z) => {
        let v = m.rotY([x, y, z], yaw);
        v = m.rotX(v, pitch); // look down onto the stack
        const s = focal / (focal + v[2]);
        return [cx + v[0] * s * scale, cy + v[1] * s * scale, v[2]];
      };
      // floor glow / shadow under the stack
      const baseY = proj(0, (N - 1) * gap * 0.5 + 0.05, 0)[1];
      const vis = (1 - exit) * ease.outCubic(m.seg(t, 0.1, 0.8));
      g.save();
      g.globalAlpha = vis;
      g.translate(cx, baseY); g.scale(1, 0.32);
      const fr = scale * 0.85;
      const grd = g.createRadialGradient(0, 0, 0, 0, 0, fr);
      grd.addColorStop(0, k.isDark ? k.color.alpha(c.accent, 0.22) : 'rgba(20,30,60,0.14)');
      grd.addColorStop(1, k.isDark ? k.color.alpha(c.accent, 0) : 'rgba(20,30,60,0)');
      g.fillStyle = grd; g.fillRect(-fr, -fr, fr * 2, fr * 2);
      g.restore();
      // build panes
      const panes = [];
      for (let i = 0; i < N; i++) {
        const rise = ease.outExpo(m.seg(t, 0.05 + i * 0.08, 0.9));
        const y = ((N - 1) / 2 - i) * gap + (1 - rise) * 0.55; // i = 0 bottom
        const pts = corners.map(([x, z]) => proj(x, y, z));
        const depth = pts.reduce((s, q) => s + q[2], 0) / 4;
        panes.push({ i, pts, depth, a: Math.min(1, rise * 1.4) * (1 - exit) });
      }
      panes.sort((a, b) => b.depth - a.depth);
      for (const P of panes) {
        if (P.a <= 0.01) continue;
        const [p0, p1, p2, p3] = P.pts;
        const path = new Path2D();
        path.moveTo(p0[0], p0[1]); path.lineTo(p1[0], p1[1]); path.lineTo(p2[0], p2[1]); path.lineTo(p3[0], p3[1]); path.closePath();
        g.save();
        g.globalAlpha = P.a;
        if (!k.isDark) { g.shadowColor = 'rgba(20,30,60,0.16)'; g.shadowBlur = 40 * k.u; g.shadowOffsetY = 16 * k.u; }
        // tint grows with height
        const h = P.i / (N - 1);
        const lg = g.createLinearGradient(p0[0], p0[1], p2[0], p2[1]);
        lg.addColorStop(0, glassTop);
        lg.addColorStop(1, glassBot);
        g.fillStyle = lg; g.fill(path);
        g.shadowColor = 'transparent';
        g.fillStyle = k.color.alpha(c.accent, (k.isDark ? 0.06 : 0.05) + h * (k.isDark ? 0.12 : 0.08));
        g.fill(path);
        // content in pane space via the affine map of the projected corners
        const U = 1000, V = 660;
        g.save();
        g.clip(path);
        g.transform((p1[0] - p0[0]) / U, (p1[1] - p0[1]) / U, (p3[0] - p0[0]) / V, (p3[1] - p0[1]) / V, p0[0], p0[1]);
        // inner top-edge light
        const ig = g.createLinearGradient(0, 0, 0, V * 0.35);
        ig.addColorStop(0, k.isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.5)');
        ig.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = ig; g.fillRect(0, 0, U, V);
        if (P.i === N - 1) {
          const la = ease.outCubic(m.seg(t, 0.7, 0.6));
          k.logo.draw(g, U / 2, V / 2, V * 0.42, { alpha: la });
        } else {
          // a soft accent light pooled in each lower pane (light passing through the stack)
          const rg = g.createRadialGradient(U * 0.5, V * 0.55, 0, U * 0.5, V * 0.55, U * 0.5);
          rg.addColorStop(0, k.color.alpha(c.accent, k.isDark ? 0.16 : 0.1));
          rg.addColorStop(1, k.color.alpha(c.accent, 0));
          g.fillStyle = rg; g.fillRect(0, 0, U, V);
        }
        // specular sweep
        const sw = ease.inOutCubic(m.seg(t, 2.2 + (N - 1 - P.i) * 0.12, 0.7));
        if (sw > 0 && sw < 1) {
          const bx = m.lerp(-U * 0.6, U * 1.6, sw);
          const sg = g.createLinearGradient(bx - 200, 0, bx + 200, V * 0.5);
          sg.addColorStop(0, 'rgba(255,255,255,0)');
          sg.addColorStop(0.5, `rgba(255,255,255,${k.isDark ? 0.22 : 0.55})`);
          sg.addColorStop(1, 'rgba(255,255,255,0)');
          g.fillStyle = sg; g.fillRect(0, 0, U, V);
        }
        g.restore();
        // hairline border, brighter on the near/top edge
        const bg2 = g.createLinearGradient(p0[0], p0[1], p2[0], p2[1]);
        bg2.addColorStop(0, k.isDark ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,1)');
        bg2.addColorStop(1, k.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(20,30,60,0.12)');
        g.strokeStyle = bg2; g.lineWidth = Math.max(1, 1.2 * k.u); g.lineJoin = 'round';
        g.stroke(path);
        // pane thickness: a lit front edge
        g.beginPath(); g.moveTo(p3[0], p3[1]); g.lineTo(p2[0], p2[1]);
        g.strokeStyle = k.isDark ? k.color.alpha(c.accent, 0.35 + h * 0.3) : k.color.alpha(c.accent, 0.25 + h * 0.3);
        g.lineWidth = 2 * k.u; g.stroke();
        g.restore();
      }
      if (p.caption) {
        const ca = ease.outCubic(m.seg(t, 1.6, 0.7)) * (1 - exit);
        const lh = capO.size * 1.1 * k.u;
        const y0 = k.H * k.pick({ wide: 0.8, square: 0.8, tall: 0.74 }) - ((capLines.length - 1) * lh) / 2 + (1 - ca) * 14 * k.u;
        capLines.forEach((ln, i) => k.text.draw(g, ln, k.cx, y0 + i * lh, { ...capO, align: 'center', baseline: 'middle', alpha: ca, qaGroup: str }));
      }
    },
  };
}
