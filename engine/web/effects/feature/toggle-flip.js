// The whole frame starts in a desaturated "off" world: grey ground, grey toggle,
// muted label. The big toggle flips; its knob stretches as it travels and lands on a
// spring, and a circular wave of colour spreads from the knob, repainting the scene
// in the brand accent. Ends held in the "on" state.
export const meta = {
  id: 'feature.toggle-flip',
  name: 'Toggle Flip',
  category: 'feature',
  duration: 4.2,
  ownsBackground: true,
  summary: 'A large toggle flips with a spring (stretching knob) and a circular colour wave repaints the scene from off-grey to the brand accent; holds on the on state.',
  bestFor: ['turn it on', 'feature switch', 'before/after moment'],
  slots: ['features'],
  params: {
    label: { default: null, label: 'Label (defaults to the second feature)' },
    flipAt: { default: 1.15, min: 0.5, max: 2.5, label: 'Flip time (s)' },
  },
  sfx: [{ t: 1.15, type: 'click', gain: 0.7 }, { t: 1.2, type: 'swell', dur: 0.8, gain: 0.35 }],
  prompt: `Own the background. Draw two complete versions of the scene: "off" (neutral grey ground, grey toggle track, muted label) and "on" (brand background with a soft accent bloom, accent track, full-colour label and a small "On for every project" line). Centre a 340x184 px toggle above a 76 px display label. At 1150 ms the knob travels across with a spring (stiffness 300, damping 20) and stretches to 128% width mid-travel. The "on" scene is revealed through a circle centred on the knob whose radius grows to the frame diagonal over 900 ms (outQuint), so colour washes outward from the switch; a thin accent ring rides the edge. A soft ring pulses once from the toggle. The off state holds 1.1 s first so the label reads; hold the on state to the end.`,
};

export function create(k, p) {
  const { ease, m, color: C } = k;
  const c = k.brand.colors;
  const dark = k.isDark;
  const U = k.u;
  const label = p.label || (k.copy('features', null) || ['Auto releases'])[Math.min(1, (k.copy('features', null) || ['x']).length - 1)];
  const offBg = dark ? '#0e0e10' : '#e7e6e3';
  const offTrack = dark ? '#2a2b2f' : '#cfceca';
  const onA = C.onColor(c.accent);
  const tw = k.pick({ wide: 340, square: 380, tall: 440 }) * U, th = tw * 0.54;
  const tcx = k.cx, tcy = k.cy - k.pick({ wide: 80, square: 90, tall: 110 }) * U;
  const kr = th / 2 - 12 * U;
  const xOff = tcx - tw / 2 + th / 2, xOn = tcx + tw / 2 - th / 2;
  const labS = { role: 'display', size: k.pick({ wide: 80, square: 80, tall: 88 }), weight: 640, tracking: -0.035 };
  const labSize = k.text.fit(label, labS, k.safe.w * 0.9, 40);
  const subS = { role: 'text', size: 32, weight: 460 };
  const diag = Math.hypot(k.W, k.H);

  function scene(g, on, t, knobX, stretch) {
    // ground
    if (!on) { g.fillStyle = offBg; g.fillRect(0, 0, k.W, k.H); }
    else {
      k.draw.background(g);
      k.draw.glow(g, tcx, tcy, Math.max(k.W, k.H) * 0.55, c.accent, dark ? 0.32 : 0.16);
    }
    // track
    g.save();
    if (on) { g.shadowColor = C.alpha(c.accent, dark ? 0.55 : 0.4); g.shadowBlur = 50 * U; g.shadowOffsetY = 12 * U; }
    else { g.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.12)'; g.shadowBlur = 30 * U; g.shadowOffsetY = 10 * U; }
    k.draw.rrect(g, tcx - tw / 2, tcy - th / 2, tw, th, th / 2, on ? c.accent : offTrack);
    g.restore();
    // inner shade on track
    const ig = g.createLinearGradient(0, tcy - th / 2, 0, tcy + th / 2);
    ig.addColorStop(0, 'rgba(0,0,0,0.10)'); ig.addColorStop(0.4, 'rgba(0,0,0,0)');
    k.draw.rrect(g, tcx - tw / 2, tcy - th / 2, tw, th, th / 2, ig);
    // knob (stretches while travelling)
    const kw = kr * 2 * stretch;
    g.save();
    g.shadowColor = 'rgba(0,0,0,0.35)'; g.shadowBlur = 18 * U; g.shadowOffsetY = 6 * U;
    k.draw.rrect(g, knobX - kw / 2, tcy - kr, kw, kr * 2, kr, '#ffffff');
    g.restore();
    const kg = g.createLinearGradient(0, tcy - kr, 0, tcy + kr);
    kg.addColorStop(0, 'rgba(255,255,255,0)'); kg.addColorStop(1, 'rgba(0,0,0,0.06)');
    k.draw.rrect(g, knobX - kw / 2, tcy - kr, kw, kr * 2, kr, kg);
    // label
    const ly = tcy + th / 2 + 120 * U;
    k.text.draw(g, label, k.cx, ly, { ...labS, size: labSize, align: 'center', baseline: 'middle', color: on ? c.fg : (dark ? '#8a8b8f' : '#6a6a6e'), qaGroup: 'label' });
    if (on) {
      const sa = ease.outCubic(m.seg(t, p.flipAt + 0.55, 0.5));
      g.save(); g.globalAlpha *= sa;
      k.draw.circle(g, k.cx - k.text.layout('On for every project', subS).width / 2 - 22 * U, ly + 90 * U + (1 - sa) * 10 * U, 7 * U, c.accent3 || c.accent, null);
      g.restore();
      k.text.draw(g, 'On for every project', k.cx + 0 * U, ly + 90 * U + (1 - sa) * 10 * U, { ...subS, align: 'center', baseline: 'middle', color: c.muted, alpha: sa });
    }
  }

  return {
    draw(g, t) {
      const T = t - p.flipAt;
      const sp = ease.spring(T, { stiffness: 300, damping: 20 });
      const knobX = m.lerp(xOff, xOn, sp);
      const travel = m.clamp(T / 0.35);
      const stretch = 1 + 0.28 * Math.sin(Math.PI * travel) * (T > 0 ? 1 : 0);
      const press = m.seg(t, p.flipAt - 0.12, 0.1) * (1 - m.seg(t, p.flipAt, 0.15));
      const intro = ease.outQuint(m.seg(t, 0, 0.6));
      const R = diag * ease.outQuint(m.seg(t, p.flipAt + 0.05, 0.9));
      g.save();
      // off scene
      g.save();
      if (intro < 1) { g.fillStyle = offBg; g.fillRect(0, 0, k.W, k.H); g.globalAlpha *= intro; g.translate(0, (1 - intro) * 24 * U); }
      scene(g, false, t, knobX, stretch * (1 + 0.06 * press));
      g.restore();
      // on scene through the expanding circle
      if (R > 0.5) {
        g.save();
        g.beginPath(); g.arc(knobX, tcy, R, 0, Math.PI * 2); g.clip();
        scene(g, true, t, knobX, stretch);
        g.restore();
        if (R < diag * 0.98) {
          g.save(); g.globalAlpha *= 0.6 * (1 - R / diag);
          k.draw.circle(g, knobX, tcy, R, null, c.accent, 2);
          g.restore();
        }
      }
      // pulse ring from the toggle
      const pr = m.seg(t, p.flipAt + 0.25, 0.9);
      if (pr > 0 && pr < 1) {
        g.save(); g.globalAlpha *= (1 - pr) * 0.6;
        const gr = 40 * U * ease.outCubic(pr);
        k.draw.rrect(g, tcx - tw / 2 - gr, tcy - th / 2 - gr, tw + gr * 2, th + gr * 2, th / 2 + gr, null, c.accent, 2);
        g.restore();
      }
      g.restore();
    },
  };
}
