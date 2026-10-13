# Writing an effect for the Launch Film Kit engine

Each effect is one ES module, `web/effects/<category>/<name>.js`. It draws one shot as a
**pure function of time**. The engine handles fonts, motion blur (sub-frames), bloom,
grain, dithering, encoding and the QA checks.

Read these before you write anything:
- the reference effects in `web/effects/logo/particle-assemble.js`, `type/baseline-rise.js`, `data/counter-roll.js` and `background/gradient-mesh.js`
- the helper sources in `web/lfk/` (`text.js`, `draw.js`, `logo.js`, `ease.js`, `math.js`, `color.js`, `stage.js`)

## Module shape

```js
export const meta = {
  id: 'category.kebab-name',          // must match folder/category
  name: 'Human Name',
  category: 'category',
  duration: 4,                        // seconds, 2.5–6 typical
  loop: false,                        // true only if frame(duration) == frame(0)
  ownsBackground: false,              // true if you paint the full frame yourself
  summary: 'One sentence: what the viewer sees (mechanism, not adjectives).',
  bestFor: ['headline', 'feature callout'],
  slots: ['headline'],                // which brand copy keys you read (see below)
  params: { name: { default: 1, min: 0, max: 2, label: '...' } },
  sfx: [{ t: 0.4, type: 'whoosh', dur: 0.5, gain: 0.5 }],  // sound cues, relative to shot start
  prompt: `Copy-paste recipe (80–160 words) a coding agent could follow to rebuild this effect
from scratch in any stack: the mechanism, timings in ms, easings, sizes as % of frame,
colour roles, and the hold for reading. Original wording, no brand or company names.`,
};
export function create(k, p) {   // p = params with defaults applied
  // precompute here (seeded random only: k.m.rng(seed), k.m.hash(i))
  return { draw(g, t) { /* t in seconds, 0..duration */ } };
}
```

Transitions (`category: 'transition'`) are called as `draw(g, t, { a, b, dur })`. Here `a` and `b`
are full-frame canvases of the outgoing and incoming shot. The result must show `a` at t=0 and `b` at
t=duration.

**Shot length can change.** When the composer places an effect in a film, it may stretch or shorten the shot. The real length arrives as `p.duration`. Always time exits and loop phases from `const D = p.duration ?? meta.duration`, never from `meta.duration` directly.

## The kit context `k`

| Field | What it is |
|---|---|
| `k.W`, `k.H` | Frame size in px |
| `k.u` | Unit scale. **Every size is reference px × k.u**; the reference short side is 1080 |
| `k.cx`, `k.cy` | Frame centre |
| `k.aspect` | `W / H` |
| `k.isPortrait`, `k.isWide`, `k.isSquareish` | Aspect flags |
| `k.pick({wide, square, tall})` | Responsive value. Effects MUST work at 16:9, 4:5 and 9:16 |
| `k.safe` | `{x, y, w, h}`, the title-safe area. Keep resting text inside it |
| `k.brand` | `{name, colors:{bg, fg, muted, surface, line, accent, accent2, accent3}, fonts}` |
| `k.isDark` | Use it to adapt (e.g. glow only on dark, shadows on light) |
| `k.copy(key, fallback)` | Brand copy. See "Brand copy keys" below |
| `k.text.draw(g, str, x, y, {role:'display'\|'text'\|'mono'\|'serif', size, weight, tracking(em), align, baseline:'middle'\|'top'\|'alphabetic'\|'xmiddle', color, alpha, italic, qaOffstage, qaOverlap, qaGroup})` | Draw text |
| `k.text.glyphs(g, str, x, y, opts, (i, n, glyph) => ({x, y, sx, sy, r, a, color, blur, ch}))` | Per-glyph animation |
| `k.text.layout(str, opts)` | Returns `{width, cap, xh, px, glyphs}` |
| `k.text.balance(str, opts, maxW)` | Balanced line wrap. Use for all headlines |
| `k.text.fit(str, opts, maxW)` | Size that fits |
| `k.text.block(...)` | Multi-line text |
| `k.draw.*` | `rrect`, `rrectPath`, `squirclePath`, `circle`, `line`, `polyline` (partial stroke), `icon(g, name, cx, cy, size, color, {p})`, `pointer`, `ripple`, `shadow`, `glass`, `glow`, `pill`, `dotGrid`, `lineGrid`, `background`, `browser` (generic window chrome, returns content rect), `phone` (returns screen rect). Icon names: see `ICONS` in draw.js |
| `k.logo.draw(g, cx, cy, h, {color, colors, alpha, stroke:{color, width, dash, offset}, fill:false})` | Draw the mark |
| `k.logo.points(n, {mode:'fill'\|'edge', seed})` | Points in normalized mark space (height = 1) |
| `k.logo.aspect` | Mark aspect ratio |
| `k.ease.*` | `outExpo`, `outQuint`, `inOutCubic`, `standard`, `emphasized`, `decel`, `accel`, `outBack`, `spring(t, {stiffness, damping})`, `bezier(...)`, … |
| `k.m.*` | `seg(t, start, dur)` → 0..1, `envelope`, `stagger(p, i, n, spread)`, `lerp`, `clamp`, `remap`, `smoothstep`, `rng(seed)`, `hash(i)`, `makeNoise(seed)` (3D noise, `.fbm`, `.curl`), `vogel`, `fibSphere`, `project(x, y, z, cx, cy, focal, dist)`, `rotX/Y/Z` |
| `k.color.*` | `mix(a, b, t)` (OKLab), `alpha(c, a)`, `shade(c, amt)`, `saturate`, `contrast`, `onColor(bg)` |
| `k.layer(name)` | A reusable offscreen full-frame canvas; get its context with `k.ctx(canvas)` |
| `k.shader(fragBody, scale)` | GPU fragment shader → canvas. Uniforms: `res`, `t`, `seed`, `c0..c3`, `bg`, `pA`, `pB` (vec4). Pass colours with `k.vec4(css)` |
| `k.qa.allowOffstage(fn)` / `k.qa.allowOverlap(fn)` | Wrap intentional cases, e.g. oversized cropped type or stacked echoes |

## Brand copy keys (sample brand: `web/brands/vela.json`; light variant: `vela-light.json`)

| Key | Content |
|---|---|
| `headline` | Short value proposition |
| `sub` | Supporting line |
| `cta` | Button text |
| `url` | Domain |
| `question` | Hook question |
| `features` | 4 short feature names |
| `stats` | `[{value, suffix, label, decimals}]` |
| `quote` | `{text, name, role}` |
| `price` | `{currency, amount, period, plan}` |
| `before` / `after` | Contrast pair, e.g. "6 weeks" / "1 afternoon" |
| `launchDate` | Date string |

If you need something else, read it with `k.copy('yourKey', 'sensible default')`, list it in `meta.slots`, and keep the default generic and fictional.

## Quality bar: launch-film grade, not template grade

1. **One idea per shot.** The mechanism should be readable in a single viewing.
2. **Motion language.**
   - Entrances use `outExpo`, `outQuint` or `emphasized` (400–900 ms).
   - Moves use `inOutCubic` or `standard`.
   - Exits are faster than entrances: `inCubic`, 250–450 ms.
   - Stagger 40–90 ms.
   - **Never linear** except constant drifts.
   - Use springs only for UI elements, with damping ≥ 18.
3. **Hold every readable line at least 1.2 s at full opacity.** Allow 300–600 ms of stillness before a key reveal.
4. **Typography.**
   - Display text at -0.02 to -0.045 em tracking; weight 560–700.
   - Body text 28–40 ref px.
   - Never below 22 ref px for anything a viewer must read.
   - Use `balance()` for headlines.
5. **Colour.**
   - Neutral surface plus one accent per shot. accent2/accent3 are for small secondary marks only.
   - Must look right on **both** dark (`vela.json`) and light (`vela-light.json`) brands.
6. **Depth and finish.**
   - Use soft shadows on light, glows on dark.
   - Hairline borders on cards.
   - Subtle parallax between layers when the camera moves.
   - The engine adds grain and motion blur — don't add your own blur to fake motion.
7. **Exit cleanly.**
   - End the shot either held at a clean final composition or with a short exit in the last ~0.5 s.
   - Document which one in `summary`.
8. **Banned defaults:**
   - centered title on a gradient fading in (unless the mechanism is something more)
   - everything bouncing
   - particles with no job
   - corner HUD/telemetry text
   - lens flares
   - emoji
   - neon-everything
   - random glitch for no reason
   - invented claims or numbers (always use copy keys)
   - real brand or company names, logos or UI

## Hard rules (zero copyright risk, model-native)

- **100% original code.**
  - No libraries, no copied snippets, no CDN fetches, no images or fonts beyond the engine's.
  - Everything is drawn with Canvas2D / Path2D / the shader helper.
- **No external services**, no network, and no `Math.random()` (use `k.m.rng(seed)` or `k.m.hash`). **Never** use `Date` or `performance.now()` to drive animation.
- **English-only visible text.**
- **Deterministic:** the same `t` gives the same pixels, whatever frame was rendered before. Precompute in `create`; never mutate state in `draw` that a later `t` depends on.
- **Performance:** about 10 ms or less per draw at 1080p. Cap particle counts around 6k. Cache Path2D objects and gradients in `create` where possible.

## Loop

Run all commands from `/Users/rentamac/Documents/matrix-dept/engine`, after `export PATH="$HOME/.local/bin:$PATH"`.

```
node render/render.mjs sheet --effect=ID --n=8                                            # 16:9 contact sheet → out/sheets/ID.png
node render/render.mjs sheet --effect=ID --n=4 --w=1080 --h=1920                          # tall check
node render/render.mjs sheet --effect=ID --n=4 --brand=web/brands/vela-light.json --out=sheets/ID_light.png
node render/render.mjs qa --effect=ID --v                                                 # counters must all read 0 at 16:9, 4:5, 9:16
node render/render.mjs video --effect=ID --sub=6                                          # 1080p60 MP4 → out/previews/ID.mp4 (optional spot check)
```

Then **look** at every sheet: open the PNG with the Read tool and check composition, legibility and polish at 100%. Iterate until the effect would not look out of place in a top-tier product keynote.

A GPU lock serialises renders between agents; waiting a few seconds is normal. Never delete `/tmp/lfk-gpu.lock` while another render's process is alive.
