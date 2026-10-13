# House Rules (every agent reads this before touching a film)

Each rule exists because a film failed without it. Add new rules at the bottom with a date.

## Making
1. **A frame is a function of time.**
   - No timers, no CSS transitions, no `Math.random()` without a seed, no clock reads.
   - The same `t` always gives the same pixels.
2. **Native only.**
   - Picture: Canvas/SVG/WebGL/GLSL code. Sound: Web Audio code.
   - Never: stock footage, licensed music, AI video/image/voice services, or third-party code or assets other than the classic infrastructure in the charter.
3. **Real data only.** Every number, quote, customer and UI element comes from the client's own material (recorded in `brand-notes.md`), or is clearly a fictional demo.
4. **Their brand, nobody else's.**
   - No other companies' logos, products, characters or signature looks.
   - No proprietary fonts. Map them to OFL fonts.
5. **Library first.** Compose from tested library shots. New code is the exception, and it joins the library when done.

## Looking
6. **One idea per shot.** If you need "and" to describe a shot, split it.
7. **Hold to read.**
   - Each readable line stays at full opacity ≥ 1.2 s (≥ 0.3 s per word for longer lines).
   - Allow 300–600 ms of stillness before the hero reveal.
8. **Type does the heavy lifting.**
   - Display text: tracking −0.02 to −0.045 em. Balanced line breaks.
   - Nothing a viewer must read is under 22 px at 1080.
9. **One accent per shot.** Colour must have a job: neutral surfaces, with the accent marking only what matters.
10. **Motion language.**
    - Entrances decelerate (outExpo/outQuint, 400–900 ms).
    - Exits are faster (250–450 ms).
    - Stagger 40–90 ms.
    - Springs only on UI, never on everything.
11. **Continuity beats cuts.** Prefer a transition that reuses an on-screen object. Use at most 2 transition styles per film.
12. **Banned defaults:**
    - a centred title on a gradient that just fades in
    - everything bouncing
    - particles without a job
    - corner HUD text
    - lens flares
    - emoji
    - neon-everything
    - glitch for no reason
    - stacks of feature bullets
13. **Frame 0 is the thumbnail.** The first frame must already carry the hook.
14. **Muted-first.** The story must work with the sound off. Sound must make it better, never carry it.

## Shipping
15. **Nothing ships unchecked.** All counters in `CHECKS.md` read 0 at every delivered aspect, and the independent checker says SHIP.
16. **Maker ≠ checker.** The agent that made a film never approves it.
17. **Fix the harness, not the output.** When the same problem appears twice, add a rule here or a check to `CHECKS.md`.


# Checks — the sensors

## Computational (engine: `node render/render.mjs qa ...`) — every counter must read 0

| Counter | What it catches | How it's measured |
|---|---|---|
| `errors` | Runtime exceptions and console errors | Page error listeners |
| `offstage` | Opaque text crossing the frame edge or the 3% safe margin | Recorded text boxes vs. frame |
| `overlap` | Two different opaque strings overlapping by more than 12% | Pairwise box intersection |
| `tiny` | Opaque text under 18 px at 1080 (legibility floor) | Recorded font size × transform scale |
| `contrast` | Text too close in luminance to what's behind it (< 3.6:1 body, < 2.6:1 display) | Text colour vs. median of a ring of final pixels around the box |
| `cjk` | Unintended CJK characters on screen (English deliverables) | Regex over every drawn string |
| `blank` | Unintended empty frames | Pixel variance |
| `nondeterministic` | A frame that differs when rendered after another frame | Hash of the same frame rendered twice in different orders |
| `seam` | Loops that jump at the wrap point | Frame 0 vs. frame N |

Intentional exceptions (oversized cropped type, stacked echo text) must be wrapped in `k.qa.allowOffstage` / `k.qa.allowOverlap` inside the effect. They are never waived at the film level.

## File checks (ffprobe / ffmpeg)
- Duration matches the plan within ±0.1 s.
- 60 fps (or the requested rate), yuv420p, bt709 tags, `+faststart`.
- `blackdetect=d=0.1:pix_th=0.02` reports no black stretches except intended fades.
- `ebur128` integrated loudness is −14 ±1 LUFS, true peak ≤ −1 dBTP.

## Inferential (the independent checker reads contact sheets)
For each aspect, look at a 12-frame sheet at 100%:
- Is frame 0 the hook?
- Can each line be read once?
- Is the hierarchy obvious?
- Is the brand correct?
- Is every claim sourced?
- Does anything look like a template?

Report findings as P0/P1/P2, each with a timestamp and an exact fix.
