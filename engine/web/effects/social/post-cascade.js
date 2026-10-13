// Two columns of generic social posts (initials avatars, invented people) cascade
// downward at parallax speeds, the far column smaller and slower. The feed decelerates
// to rest with one hero post centred, whose heart fills and count ticks up.
export const meta = {
  id: 'social.post-cascade',
  name: 'Post Cascade',
  category: 'social',
  duration: 5.6,
  summary: 'Two parallax columns of fictional social posts stream downward and ease to a stop; the centred hero post gets a like (heart fills, count rolls); holds, then fades in the last 0.45 s.',
  bestFor: ['social proof', 'community', 'buzz'],
  slots: ['posts'],
  params: {
    posts: {
      default: [
        { name: 'Priya Raman', handle: '@priya.builds', text: 'Our launch checklist finally lives in one place. The whole team can see what ships next.', likes: 248 },
        { name: 'Diego Alvarez', handle: '@diegoships', text: 'Changelog wrote itself while we were still celebrating. Wild.', likes: 131 },
        { name: 'Amara Nwosu', handle: '@amara.pm', text: 'Approvals used to stall in DMs. Now they happen right next to the work.', likes: 412 },
        { name: 'Kenji Watanabe', handle: '@kenji_w', text: 'First release where nobody stayed late. Calm launch days are underrated.', likes: 89 },
        { name: 'Lena Fischer', handle: '@lenafischer', text: 'Roadmap, release notes and sign-off in one view. Exactly what we needed.', likes: 176 },
        { name: 'Omar Haddad', handle: '@omar.dev', text: 'Shipped on a Friday and still had a quiet weekend.', likes: 305 },
        { name: 'Sofia Rossi', handle: '@sofiarossi', text: 'The release timeline is the first thing I open every morning.', likes: 64 },
        { name: 'Tomás Herrera', handle: '@tomas.h', text: 'Our design and eng teams finally agree on what launch day looks like.', likes: 157 },
      ],
      label: 'SAMPLE DATA: fictional posts [{name, handle, text, likes}]',
    },
    hero: { default: 2, label: 'Index of the post that lands centred (in the near column)' },
  },
  sfx: [{ t: 0.1, type: 'whoosh', dur: 1.2, gain: 0.3 }, { t: 3.85, type: 'pop', gain: 0.6 }],
  prompt: `Social feed cascade, 5.6 s. Post cards (radius 24 px, surface fill, hairline border, self-cast soft shadow) hold a 56 px initials avatar in a rotating brand tint, name (26 px, 600) and muted handle, up to three lines of 28 px body text, and a footer with heart and reply icons plus mono counts. A near column (~28% of frame width) is flanked by far columns on 16:9 (one far column on tall); far columns sit at 90% scale and 85% opacity, offset vertically. All scroll downward on one decelerating curve, y = distance x (1 - (1 - t/3.8)^3), far columns travelling 60% as far, until the hero post rests at centre. Cards fade within 110 px of the title-safe edges. At 3.8 s the hero's heart pops (outBack) and fills accent, its count rolls up by one, and the card lifts 3% with an accent hairline. Hold, then fade over 450 ms inCubic.`,
};

function initials(name) {
  return String(name).split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

// Card fill that casts its own soft shadow. (k.draw.shadow paints an opaque black
// shape under the card, which shows through whenever the card is faded.)
function softCard(k, g, x, y, w, h, r, fill, color, blur, oy) {
  g.save();
  g.shadowColor = color; g.shadowBlur = blur * k.u; g.shadowOffsetY = oy * k.u;
  k.draw.rrect(g, x, y, w, h, r, fill);
  g.restore();
}

export function create(k, p) {
  const { ease, m, color: C } = k;
  const posts = k.copy('posts', null) || p.posts;
  const D = p.duration ?? meta.duration;
  const u = k.u;
  const tall = k.isPortrait;
  const colW = k.pick({ wide: 540, square: 470, tall: 455 }) * u;
  const gap = k.pick({ wide: 40, square: 28, tall: 26 }) * u;
  const bodySize = k.pick({ wide: 28, square: 26, tall: 26 });
  const pad = 28 * u;
  const bodyO = { role: 'text', size: bodySize, weight: 440 };
  const layoutCard = (post) => {
    let lines = k.text.wrap(post.text, bodyO, colW - pad * 2);
    if (lines.length > 3) { lines = lines.slice(0, 3); lines[2] = lines[2].replace(/\s+\S*$/, '') + '…'; }
    const lh = bodySize * 1.32 * u;
    const h = pad + 56 * u + 18 * u + lines.length * lh + 22 * u + 30 * u + pad;
    return { post, lines, lh, h };
  };
  const heroIdx = Math.min(p.hero, posts.length - 1);
  // near column: hero post plus neighbours; far column: the rest
  const near = [], far = [], far2 = [];
  const wide3 = k.isWide;
  posts.forEach((post, i) => {
    if (i % 2 === heroIdx % 2) near.push(i);
    else if (wide3 && far.length > far2.length) far2.push(i);
    else far.push(i);
  });
  if (wide3 && !far2.length) far2.push(...far);
  const build = (ids, reps) => {
    const out = [];
    for (let r = 0; r < reps; r++) ids.forEach((i) => out.push({ ...layoutCard(posts[i]), id: i, rep: r }));
    return out;
  };
  const nearCards = build(near, 3), farCards = build(far, 4), far2Cards = wide3 ? build([...far2].reverse(), 4) : [];
  const stack = (cards) => { let y = 0; cards.forEach((c) => { c.y = y; y += c.h + gap; }); return y; };
  stack(nearCards); stack(farCards); stack(far2Cards);
  // hero = the hero post in the middle repetition
  const hero = nearCards.find((c) => c.id === heroIdx && c.rep === 1) || nearCards[0];
  const tints = (c) => [c.accent, c.accent2 || c.accent, c.accent3 || c.accent, C.mix(c.accent, c.accent2 || c.accent, 0.5), C.mix(c.accent3 || c.accent, c.accent, 0.5)];

  return {
    draw(g, t) {
      const c = k.brand.colors;
      const S = k.safe;
      const exitP = ease.inCubic(m.seg(t, D - 0.45, 0.45));
      const fade = 1 - exitP;
      const totalW = colW * 2 + gap * 1.4;
      const farScale = 0.9;
      const nearX = wide3 ? k.cx - colW / 2 : k.cx - totalW / 2;
      const farX = nearX + colW + gap * 1.4;
      const far2X = nearX - gap * 1.4 - colW;
      const travel = ease.outCubic(m.seg(t, 0, 3.8));
      // near column: hero centred at rest; far column: parallax at 60% of the travel
      const nearDist = k.H * 1.25, farDist = nearDist * 0.6;
      const nearRest = k.cy - (hero.y + hero.h / 2);
      const nearOff = nearRest - nearDist * (1 - travel);
      const farOff = nearRest - hero.h * 0.5 - farDist * (1 - travel);
      const far2Off = nearRest - hero.h * 0.9 - farDist * 0.8 * (1 - travel);
      const appear = ease.outCubic(m.seg(t, 0, 0.5));
      const likeT = 3.8;
      const edgeA = (y0, y1) => m.smoothstep(S.y - 10 * u, S.y + 110 * u, y0) * m.smoothstep(S.y + S.h + 10 * u, S.y + S.h - 110 * u, y1);

      const drawCard = (cd, x, y, scale, dim, isHero) => {
        const w = colW, h = cd.h;
        const ey0 = y, ey1 = y + h * scale;
        const a = edgeA(ey0, ey1) * appear * fade * dim;
        if (a <= 0.01) return;
        g.save();
        g.translate(x, y); g.scale(scale, scale);
        g.globalAlpha = a;
        const R = 24 * u;
        softCard(k, g, 0, 0, w, h, R, k.isDark ? C.mix(c.surface, c.bg, 0.15) : c.surface, k.isDark ? 'rgba(0,0,0,0.45)' : 'rgba(20,30,60,0.10)', 40, k.isDark ? 18 : 14);
        k.draw.rrect(g, 0.5, 0.5, w - 1, h - 1, R, null, isHero && t > likeT - 0.3 ? C.mix(C.alpha(c.fg, k.isDark ? 0.09 : 0.07), C.alpha(c.accent, 0.55), m.seg(t, likeT - 0.3, 0.5)) : C.alpha(c.fg, k.isDark ? 0.09 : 0.07), 1);
        const post = cd.post;
        const tint = tints(c)[cd.id % 5];
        const avR = 28 * u;
        k.draw.circle(g, pad + avR, pad + avR, avR, tint);
        k.text.draw(g, initials(post.name), pad + avR, pad + avR, { role: 'text', size: 22, weight: 650, color: k.color.onColor(tint), align: 'center', baseline: 'middle', alpha: m.smoothstep(0.7, 0.95, a), qaGroup: 'card' + cd.id + '-' + cd.rep });
        const nx = pad + avR * 2 + 18 * u;
        k.text.draw(g, post.name, nx, pad + avR - 3 * u, { role: 'text', size: 26, weight: 600, baseline: 'bottom', qaGroup: 'card' + cd.id + '-' + cd.rep });
        k.text.draw(g, post.handle, nx, pad + avR + 5 * u, { role: 'text', size: 22, weight: 450, color: c.muted, baseline: 'top', qaGroup: 'card' + cd.id + '-' + cd.rep });
        let by = pad + avR * 2 + 18 * u;
        cd.lines.forEach((ln, i) => k.text.draw(g, ln, pad, by + i * cd.lh + cd.lh / 2, { ...bodyO, baseline: 'xmiddle', qaGroup: 'card' + cd.id + '-' + cd.rep }));
        by += cd.lines.length * cd.lh + 22 * u;
        // footer
        const fy = by + 15 * u;
        const liked = isHero ? m.seg(t, likeT, 0.25) : 0;
        const pop = isHero ? ease.outBack(m.seg(t, likeT, 0.4), 2.2) : 1;
        const hs = 28 * u * (isHero && t >= likeT ? 0.7 + 0.3 * pop : 1);
        if (liked > 0) k.draw.icon(g, 'heart', pad + 14 * u, fy, hs, c.accent, { fill: true });
        k.draw.icon(g, 'heart', pad + 14 * u, fy, hs, liked > 0 ? c.accent : c.muted, { stroke: 1.9 });
        // count (rolls up by one for the hero)
        const base = post.likes;
        const cx0 = pad + 40 * u;
        if (isHero) {
          const r = ease.outQuint(m.seg(t, likeT + 0.05, 0.5));
          g.save(); g.beginPath(); g.rect(cx0 - 4 * u, fy - 16 * u, 120 * u, 32 * u); g.clip();
          const col = liked > 0.5 ? (k.isDark ? c.fg : C.shade(c.accent, -0.1)) : c.muted;
          if (r < 1) k.text.draw(g, String(base), cx0, fy - r * 30 * u, { role: 'mono', size: 22, weight: 500, color: c.muted, baseline: 'middle', alpha: 1 - r, qaGroup: 'like' });
          if (r > 0) k.text.draw(g, String(base + 1), cx0, fy + (1 - r) * 30 * u, { role: 'mono', size: 22, weight: 500, color: col, baseline: 'middle', alpha: r, qaGroup: 'like' });
          g.restore();
        } else {
          k.text.draw(g, String(base), cx0, fy, { role: 'mono', size: 22, weight: 500, color: c.muted, baseline: 'middle', qaGroup: 'card' + cd.id + '-' + cd.rep });
        }
        k.draw.icon(g, 'chat', pad + 160 * u, fy, 26 * u, c.muted, { stroke: 1.9 });
        k.text.draw(g, String(Math.round(base / 9) + 2), pad + 186 * u, fy, { role: 'mono', size: 22, weight: 500, color: c.muted, baseline: 'middle', qaGroup: 'card' + cd.id + '-' + cd.rep });
        g.restore();
      };

      // far columns first (behind), smaller and dimmer
      far2Cards.forEach((cd) => {
        const y = far2Off + cd.y * farScale;
        if (y > k.H || y + cd.h * farScale < 0) return;
        drawCard(cd, far2X + colW * (1 - farScale) / 2, y, farScale, 0.85, false);
      });
      farCards.forEach((cd) => {
        const y = farOff + cd.y * farScale;
        if (y > k.H || y + cd.h * farScale < 0) return;
        drawCard(cd, farX + colW * (1 - farScale) / 2, y, farScale, 0.85, false);
      });
      nearCards.forEach((cd) => {
        const y = nearOff + cd.y;
        if (y > k.H || y + cd.h < 0) return;
        if (cd === hero) {
          const lift = ease.inOutCubic(m.seg(t, likeT - 0.4, 0.6));
          if (k.isDark && lift > 0) k.draw.glow(g, nearX + colW / 2, y + cd.h / 2, colW * 0.75, c.accent, 0.12 * lift * fade);
          const sc = 1 + 0.03 * lift;
          drawCard(cd, nearX - colW * (sc - 1) / 2, y - cd.h * (sc - 1) / 2, sc, 1, true);
        } else drawCard(cd, nearX, y, 1, 1, false);
      });
    },
  };
}
