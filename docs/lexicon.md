# Prompt Keyword Lexicon

*The Launch Film Kit, version 1.0.0, 380 entries in 17 categories.*

## Describe the mechanism, not the vibe

"Make it feel premium" gives the model nothing to compute. "Words rise 40 px from behind a baseline mask, 60 ms stagger, 520 ms outExpo, hold 1.2 s" can only be rendered one way. Each entry in this lexicon turns an industry term into an instruction with numbers in it: distance in px or % of frame, duration in ms or frames, the easing curve or spring constants, counts, stagger and hold.

Everything here can be built natively with Canvas2D, SVG, CSS, WebGL/GLSL and Web Audio. That means no stock footage, no licensed music, no external generation services, and only Open Font License (OFL) fonts. When a term usually implies an outside asset, the entry gives the code-native version instead.

**How to use it.** Find the term, copy the *Say it like this* sentence, then change the numbers to fit the shot. `lexicon.json` holds the full fields for every entry: aka, best_for, pitfalls and native_impl.

**Defaults assumed below:** 30 fps, a 1920x1080 master (other aspects reflow from normalized layout), time measured from the frame index, and all randomness seeded.

## Contents

1. [camera-and-lens](#camera-and-lens) (24)
2. [motion-and-easing](#motion-and-easing) (25)
3. [timing-and-rhythm](#timing-and-rhythm) (21)
4. [transitions](#transitions) (22)
5. [typography-motion](#typography-motion) (22)
6. [layout-and-composition](#layout-and-composition) (22)
7. [light-and-materials](#light-and-materials) (23)
8. [color-and-grade](#color-and-grade) (22)
9. [texture-and-finish](#texture-and-finish) (21)
10. [data-viz-motion](#data-viz-motion) (22)
11. [ui-motion](#ui-motion) (23)
12. [depth-and-3d](#depth-and-3d) (22)
13. [particles-and-fields](#particles-and-fields) (22)
14. [sound-design-in-code](#sound-design-in-code) (23)
15. [story-beats](#story-beats) (22)
16. [quality-and-qa](#quality-and-qa) (22)
17. [banned-defaults](#banned-defaults) (22)
18. [Prompt sentence builder](#prompt-sentence-builder)

## camera-and-lens

Virtual camera moves, lens behavior and shutter: how the frame itself travels and sees.

| Term | Definition | Say it like this |
|---|---|---|
| **Locked-off shot** | Camera holds perfectly still so only the subject moves; motion reads as intentional and type stays crisp. | Camera transform fixed for the full 3.0 s shot; only the product rotates 12° on Y with inOutSine. |
| **Dolly in** | Camera physically moves toward the subject, enlarging it while perspective between near and far layers shifts. | Camera dollies in from z=10 to z=8.6 over 4.0 s, inOutSine, subject centered, background layers scale 4% less than foreground. |
| **Dolly out** | Camera retreats from subject to reveal surrounding context or scale. | Camera pulls back from 1.25x to 1.00x framing over 3.5 s, outCubic, revealing 3 surrounding cards by 2.0 s. |
| **Truck** | Camera slides sideways parallel to the subject plane, producing parallax between depth layers. | Camera trucks left 6% of frame width over 5 s, linear, foreground layer moves 1.6x, background 0.4x. |
| **Pedestal** | Camera rises or lowers vertically without tilting, keeping horizon lines parallel. | Camera pedestals up 120 px over 2.4 s, inOutQuad, horizon stays level, title enters from below frame at 1.2 s. |
| **Pan** | Camera rotates around its vertical axis, sweeping the view left or right from a fixed position. | Camera pans 18° right over 3.0 s, inOutSine, no parallax between layers because the pivot is the lens. |
| **Tilt** | Camera rotates on its horizontal axis, sweeping the view up or down from a fixed point. | Camera tilts up 10° over 2.0 s, outQuart, ending with the headline at 38% from top. |
| **Zoom (FOV change)** | Field of view narrows or widens without moving the camera, magnifying everything uniformly with no parallax. | Field of view narrows from 50° to 38° over 2.5 s, inOutCubic, camera position fixed. |
| **Dolly zoom** | Camera dollies while FOV changes oppositely, so the subject stays fixed size while background perspective stretches or compresses. | Camera dollies from z=6 to z=12 over 2.0 s while FOV narrows to keep the subject at exactly 40% frame height; inOutSine. |
| **Orbit** | Camera circles the subject at a constant radius while staying aimed at it, showing multiple sides. | Camera orbits 40° around the product at radius 5 over 6 s, inOutSine, elevation fixed at 12°. |
| **Crane up reveal** | Camera rises and tilts down simultaneously, revealing a layout from above. | Camera cranes up 2.5 units while pitching from 0° to -35° over 3.5 s, inOutCubic, grid of 12 tiles revealed by 2.8 s. |
| **Rack focus** | Focus shifts from one depth plane to another, transferring attention without cutting. | Focus racks from foreground card (blur 0→8 px) to background title (blur 8→0 px) over 600 ms, inOutSine, starting at 1.4 s. |
| **Shallow depth of field** | Only a thin depth slice is sharp; foreground and background fall into soft circles of confusion. | Focus plane at subject depth, blur radius grows 1.2 px per 0.1 depth units, capped at 14 px; highlights bloom into 6-blade discs. |
| **Telephoto compression** | Narrow field of view flattens depth so distant objects appear stacked close behind the subject. | Use FOV 18° with camera distance 22 units so the 5 background panels stack tightly behind the product, size ratio under 1.3x. |
| **Wide-angle perspective** | Wide field of view exaggerates depth: near objects loom large and lines converge strongly. | Use FOV 75° with camera 2.2 units from the hero object so it fills 55% of frame and edges converge visibly. |
| **Handheld drift** | Subtle low-frequency noise on camera position and rotation that suggests a living operator without shake. | Add camera drift from 2-octave value noise at 0.15 Hz, amplitude 0.4% of frame width and 0.25° roll, seeded per shot. |
| **Dutch angle** | Camera rolled around its lens axis so horizon is diagonal, creating unease or energy. | Roll the camera 7° clockwise for the 1.2 s glitch beat, then settle to 0° over 400 ms outBack(1.2). |
| **Whip pan** | Extremely fast pan that smears the frame into directional blur, often hiding a cut. | Whip pan right over 8 frames at 30 fps: horizontal blur peaks at 6% of frame width on frame 4, cut hidden at peak. |
| **Crash zoom** | Abrupt fast zoom onto a detail with a hard stop, often with a slight overshoot. | Scale 1.0→2.4 over 180 ms outExpo onto the stat, overshoot 3% and settle in 120 ms, 2-frame radial blur during the move. |
| **Shutter angle** | Fraction of each frame interval the virtual shutter is open; controls motion blur length. | Render with 180° shutter: average 8 subframes spanning the first half of each 1/30 s frame interval. |
| **Overhead shot** | Camera looks straight down onto a flat arrangement, turning the scene into a graphic layout. | Camera pitched -90°, orthographic, 9 cards arranged on a 3x3 grid with 4% gutters, slow 3° rotation over 6 s. |
| **Low-angle hero shot** | Camera below the subject looking up, making it feel large and powerful. | Camera at 15% frame height below the product's base, pitched up 14°, product top touches 12% from frame top. |
| **Anamorphic look** | Emulates squeezed-lens traits: horizontal streak flares, oval bokeh, wide aspect. | Bokeh discs scaled 0.6x horizontally, highlights over 0.9 luminance get a 1-px-tall horizontal streak 40% of frame wide at 30% opacity. |
| **Camera settle** | Camera arrives at its final framing with a tiny damped overshoot instead of a dead stop. | Camera move ends with spring settle: stiffness 120, damping 18, overshoot under 1.5% of travel, rest within 450 ms. |

## motion-and-easing

Easing curves, spring stiffness/damping values and the classic animation principles applied to code.

| Term | Definition | Say it like this |
|---|---|---|
| **Linear** | Value changes at a constant rate with no acceleration; mechanical and continuous. | Ticker strip scrolls left at a constant 90 px/s linear for the whole 8 s shot, no ease at the ends because it never stops on screen. |
| **Ease in-out sine** | Very soft symmetrical acceleration and deceleration based on a half cosine. | Background gradient drifts 8% across the frame over 6 s, inOutSine. |
| **Ease out cubic** | Starts fast and decelerates to rest; the default for elements arriving on screen. | Card slides up 48 px and fades 0→1 over 420 ms outCubic. |
| **Ease out quart** | Stronger deceleration than cubic; most of the travel happens in the first third. | Headline slides in 120 px over 600 ms outQuart, 80% of travel done by 220 ms. |
| **Ease out expo** | Exponential deceleration: explosive start, very long gentle settle; signature of crisp launch typography. | Words rise 40 px from behind a baseline mask, 60 ms stagger, 520 ms outExpo, hold 1.2 s. |
| **Ease in-out expo** | Slow start, violent middle, slow finish; makes moves feel like a cut with motion. | Panel swaps position over 700 ms inOutExpo so the middle 200 ms carries 80% of the travel. |
| **Ease in cubic** | Starts slow and accelerates away; correct for elements leaving the frame. | Old caption exits down 30 px and fades out over 260 ms inCubic. |
| **Ease out back** | Decelerates past the target then returns, giving a small overshoot. | Icon scales 0→1 over 480 ms outBack with overshoot constant 1.4 (peaks at about 1.08x). |
| **Ease in back** | Briefly moves backward before accelerating forward; built-in anticipation. | Arrow pulls back 6% then launches right over 450 ms inBack (s=1.7). |
| **Ease out elastic** | Overshoots and oscillates with decaying amplitude before resting. | Notification dot scales to 1.0 with outElastic, period 0.35, amplitude 1.0, total 900 ms. |
| **Ease out bounce** | Simulates a rigid object hitting a floor and bouncing with decaying height. | Coin drops 200 px onto the shelf with outBounce over 800 ms, 3 bounces visible. |
| **Custom cubic-bezier** | Easing defined by two control points so velocity profile can be tuned exactly. | Use cubic-bezier(0.16, 1, 0.3, 1) for all entrances, 500 ms; exits use cubic-bezier(0.7, 0, 0.84, 0), 300 ms. |
| **Spring (critically damped)** | Physics spring with damping exactly sufficient to stop without overshoot; fastest clean settle. | Panel moves with spring mass 1, stiffness 170, damping 26 (zeta 1.0), settles under 0.5 px in 420 ms. |
| **Spring (snappy)** | Stiff spring with light overshoot that feels responsive and precise. | Toggle knob uses spring stiffness 400, damping 28, mass 1: overshoot about 4%, settled by 280 ms. |
| **Spring (bouncy)** | Low-damping spring with visible oscillations before rest. | Sticker lands with spring stiffness 220, damping 10, mass 1: 2 visible oscillations, rest by 900 ms. |
| **Spring (gentle)** | Low-stiffness, well-damped spring producing a slow, floaty arrival. | Background shapes drift into place with spring stiffness 60, damping 14, mass 1, about 1.1 s to rest. |
| **Anticipation** | Animation principle: a small opposite move before the main action signals what is coming. | Before the card flies right, it dips 8 px left over 120 ms inOutSine, then travels 600 px over 380 ms outExpo. |
| **Follow-through and overlapping action** | Animation principle: parts of an object stop at different times, trailing the main body. | Card body stops at 400 ms; its label stops 70 ms later and its shadow 120 ms later, each outCubic. |
| **Squash and stretch** | Animation principle: an object deforms along its motion while keeping area constant, conveying elasticity and speed. | Dot stretches to scaleY 1.25, scaleX 0.8 at peak speed and squashes to 1.2x0.83 on impact for 3 frames. |
| **Arc motion** | Animation principle: natural movement follows curved paths rather than straight lines. | Icon travels from bottom-left to center along a quadratic arc with control point 18% above the chord, 600 ms outCubic. |
| **Slow in and slow out** | Animation principle: motion clusters frames near start and end poses, accelerating through the middle. | All position keys use inOutCubic over 500-800 ms; no linear segments except continuous scrolls. |
| **Secondary action** | Animation principle: smaller motion that supports the main action without competing. | As the phone rises 60 px, its reflection sweeps across the screen 400 ms later at 20% opacity. |
| **Exaggeration** | Animation principle: amplify motion beyond realism so it reads clearly at speed and small size. | Scale pulse peaks at 1.12x instead of 1.03x, 240 ms outBack, so it reads on a 6-inch phone. |
| **Inertial decay** | Motion that starts at a velocity and decays exponentially, like a flicked scroll. | List flings with initial velocity 2400 px/s and friction 0.92 per frame at 60 fps, stopping after about 900 ms. |
| **Velocity matching** | Ending one move at the same velocity the next begins with, so chained motions feel like one gesture. | Segment A ends at 900 px/s; segment B starts at 900 px/s and decelerates outCubic over 400 ms; no visible hitch at the 1.6 s join. |

## timing-and-rhythm

Beat grids, holds, staggers and pacing that make picture and sound feel composed.

| Term | Definition | Say it like this |
|---|---|---|
| **Beat grid** | A fixed timeline grid derived from tempo so every cut and accent lands on musical subdivisions. | Set tempo 120 BPM (500 ms per beat, 15 frames at 30 fps); every cut lands on a beat, every type accent on an eighth (250 ms). |
| **Downbeat hit** | A key visual event aligned exactly with the first beat of a bar for maximum impact. | Logo snaps to full scale on bar 9 beat 1 (16.0 s at 120 BPM), with the kick sample triggered on the same frame. |
| **Reading time** | Minimum on-screen hold so a viewer can read text, scaled to word count. | Hold each line for 0.4 s + 0.25 s per word, minimum 1.2 s after the animation settles. |
| **Stagger** | Successive elements start the same animation with a fixed delay, creating a flowing sequence. | 6 tiles enter with 50 ms stagger, each 450 ms outCubic, total group duration 700 ms. |
| **Stagger order** | The rule determining which element animates first: left-to-right, center-out, by distance, or random-seeded. | Grid of 24 dots staggers center-out by Euclidean distance, 18 ms per grid unit, 400 ms outQuart each. |
| **Accent frame** | A single frame or very short moment of emphasis such as a flash, scale bump or color pop. | On the 3.0 s hit, flash a full-frame white at 18% opacity for 2 frames, then decay over 6 frames. |
| **Rest beat** | A deliberate moment of near-stillness between busy sections so the viewer can absorb. | After the feature montage, hold the empty gradient for 0.8 s with only 1% ambient drift before the headline. |
| **Cut on action** | Cutting during a movement so the motion carries the eye across the edit. | Cut from shot A to shot B at the frame where the card is 40% through its 500 ms slide, continuing the motion in B. |
| **Animating on twos** | Updating the drawing every second frame (or fewer) for a crisp, handmade cadence. | Doodle accents update on twos at 30 fps (15 drawings/s), quantize time with floor(frame/2)*2. |
| **Speed ramp** | Playback speed changes within a shot, e.g. fast-to-slow, to emphasize a moment. | Particle burst plays at 1.0x, ramps to 0.2x over 300 ms inOutSine around 2.4 s, holds 0.2x for 600 ms, ramps back. |
| **Tempo acceleration** | Shots get progressively shorter to build energy toward a climax. | Feature cuts last 1.6, 1.2, 0.8, 0.5, 0.5, 0.25 s, all on beat, landing the logo on the downbeat at 6.0 s. |
| **Ritardando** | Tempo or motion slows toward the end of a sequence, signaling closure. | Final 2 s: tempo eases from 120 to 96 BPM, motion durations lengthen 1.3x, last move 900 ms outQuart. |
| **Long-short-short rhythm** | Alternating shot or animation durations in a pattern to avoid monotony. | Cut pattern 1.5 s, 0.75 s, 0.75 s repeated 3 times, on 120 BPM beats. |
| **Overlap handoff** | Next element begins entering before the previous one finishes leaving. | Outgoing title exits over 300 ms; incoming title starts 150 ms into that exit, 450 ms outExpo. |
| **Minimum on-screen duration** | No element should appear for less time than it takes to perceive it. | No graphic element stays on screen under 0.5 s; text under 1.2 s; logos under 1.5 s. |
| **Audio pre-lap** | Next scene's sound begins before its picture, pulling the viewer forward. | Next scene's riser starts 400 ms before the visual cut and peaks at the cut frame. |
| **Audio post-lap** | Previous scene's sound continues after the visual cut, smoothing transition. | Previous pad tail continues 600 ms past the cut, fading -12 dB with an exponential ramp. |
| **Cue sheet** | A single list of timestamps that drives both visuals and audio so they cannot drift. | Define a cue sheet: title_in 0.5 s, feature_1 3.0 s, swell 13.5 s, logo_hit 14.0 s; visuals and audio both read it. |
| **Motion density** | The number of independently moving elements at any moment; controls clarity. | Keep at most 3 primary moving elements at once; ambient layers under 5% opacity change per second. |
| **Offbeat accent** | A visual accent placed between beats to create surprise and groove. | Small icons pop on the 'and' of beats 2 and 4 (750 ms and 1750 ms in each 2 s bar at 120 BPM), 200 ms outBack. |
| **Phrase length** | Grouping beats into musical phrases (usually 4 or 8 bars) and changing scenes on phrase boundaries. | At 120 BPM, change scenes every 4 bars (8.0 s) in a 30 s film: intro 0-8, problem 8-16, solution 16-24, end card 24-30. |

## transitions

Ways to get from one shot to the next, each with exact duration and easing.

| Term | Definition | Say it like this |
|---|---|---|
| **Hard cut** | Instant change from one shot to the next with no blending frames. | Hard cut at 4.0 s on the downbeat; shot B's subject sits within 10% of shot A's subject position. |
| **Crossfade** | Outgoing and incoming frames blend by opacity over a short interval. | Crossfade A to B over 400 ms inOutSine centered on 6.0 s. |
| **Dip to black** | Outgoing shot fades to black, then incoming fades up from black. | Fade A to black over 300 ms inQuad, hold black 4 frames, fade B up over 400 ms outQuad. |
| **Flash cut** | A short bright flash bridges two shots and punctuates the change. | At the cut, overlay white at 85% for 1 frame, decaying to 0 over 5 frames outQuad. |
| **Linear wipe** | A straight edge travels across the frame replacing shot A with shot B. | Hard-edged wipe left-to-right over 500 ms inOutCubic, edge angled 12°, 2 px accent line in brand color. |
| **Iris wipe** | Incoming shot appears inside an expanding circle from a chosen point. | Circle expands from the button's center to cover the frame diagonal over 600 ms inOutExpo. |
| **Clock wipe** | A line sweeps around a center point like a clock hand, revealing the new shot. | Clock wipe 360° clockwise from 12 o'clock over 700 ms inOutSine. |
| **Push** | Incoming shot pushes outgoing shot off-frame in the same direction. | B pushes A left by 100% frame width over 550 ms inOutExpo with 8-subframe motion blur. |
| **Slide over** | Incoming shot slides over a stationary or slightly receding outgoing shot. | B slides up over A in 500 ms outQuart; A scales to 0.94 and darkens 30% beneath. |
| **Match cut** | Cut between two shots where a shape, color or motion lines up exactly across the cut. | Circular gauge in shot A at center, 22% frame width, cuts to circular planet in shot B at identical position and size. |
| **Shape morph** | One shape continuously transforms into another, carrying the eye between scenes. | Square card morphs into the circular avatar over 600 ms inOutCubic, corner radius 0→50%, then the scene expands from it. |
| **Zoom-through** | Camera zooms into an element until it fills the frame and becomes the next scene. | Scale the screen element 1x→12x over 700 ms inExpo; at 60% fill, crossfade to scene B over 6 frames. |
| **Object mask reveal** | A moving foreground object passes the frame and the new scene appears behind it. | A dark bar sweeps across the frame in 400 ms; scene B is revealed in its trailing edge. |
| **Luma wipe** | Transition driven by a grayscale map: pixels switch when their map value passes a moving threshold. | Luma wipe using a radial-plus-noise map, threshold 0→1 over 800 ms, 4% soft edge. |
| **Blur dissolve** | Outgoing shot blurs out while incoming blurs in, crossfading at peak blur. | A blurs 0→20 px over 300 ms, crossfade to B at peak, B un-blurs 20→0 px over 350 ms outCubic. |
| **Mosaic transition** | Image breaks into growing blocks, swaps, then resolves into the next shot. | Block size grows 1→48 px over 250 ms, swap at peak, shrink 48→1 px over 250 ms. |
| **Shape burst** | A brand-colored shape expands from a point to fill the frame, then becomes the next background. | Brand-color circle bursts from the tapped icon to fill the frame in 450 ms outExpo; next scene's content fades in at 300 ms. |
| **Split screen** | Frame divides into panels showing multiple shots at once, usually animating the dividers. | Frame splits into 3 vertical panels, dividers slide in over 500 ms outQuart, 12 px gutters, each panel plays its own shot. |
| **Light sweep transition** | A bright soft band crosses the frame; the cut is hidden at its peak brightness. | Warm white band 25% frame width sweeps left-to-right in 500 ms, additive, peak 90% at 250 ms where the cut occurs. |
| **Noise dissolve** | Pixels switch from A to B according to a seeded noise field, creating a granular dissolve. | Seeded value-noise dissolve over 600 ms, 3 px noise scale, 2% soft edge. |
| **Card flip** | The frame rotates 180° around an axis, revealing the next shot on its back. | Frame flips around Y over 700 ms inOutCubic, perspective 1200 px, B drawn when angle passes 90°. |
| **Slat transition** | The frame divides into strips that rotate or slide in staggered order to reveal the next shot. | 8 horizontal slats slide right with 40 ms stagger, each 400 ms inOutExpo. |

## typography-motion

Kinetic type mechanisms, type scale and masking rules for on-screen text.

| Term | Definition | Say it like this |
|---|---|---|
| **Baseline mask rise** | Text rises into view from behind an invisible mask aligned to its baseline, appearing to emerge from a slot. | Each word rises 110% of cap height from behind a baseline mask, 60 ms stagger, 520 ms outExpo, hold 1.2 s. |
| **Per-character stagger** | Each glyph animates individually with a small offset, creating a ripple through the word. | Letters fade 0→1 and rise 16 px with 25 ms stagger, 400 ms outCubic each, left to right. |
| **Per-word reveal** | Words animate in one at a time, matching spoken cadence. | Words fade and rise 24 px, 90 ms stagger, 450 ms outQuart, synced to voice-free beat at 120 BPM eighths. |
| **Line-by-line reveal** | Each line of a multi-line block enters separately with an offset. | Three lines rise 32 px from baseline masks, 120 ms stagger, 600 ms outExpo. |
| **Tracking expand** | Letter spacing animates from tight to open (or reverse), giving text a breathing reveal. | Title tracking animates from -2% to +12% of font size over 2.4 s outQuart while opacity goes 0→1 in first 600 ms. |
| **Weight morph** | A variable font's weight axis animates continuously, making text thicken or thin. | Headline weight animates from 200 to 800 on the wght axis over 700 ms inOutCubic, using an OFL variable font. |
| **Typewriter** | Characters appear one by one at a steady rate, often with a blinking cursor. | Type on at 28 characters per second, cursor 2 px wide blinking 530 ms on/off, hold 1.0 s after last char. |
| **Decode scramble** | Characters cycle through random glyphs before locking into the final text left to right. | Each character cycles seeded random glyphs every 2 frames for 300 ms, then locks; lock order left-to-right, 30 ms stagger. |
| **Scale slam** | A word arrives oversized and snaps to its final size with a hard stop, often with a beat hit. | Word scales 2.6x→1.0x over 160 ms outExpo with 1-frame white flash at 18% and 4 px camera shake decaying over 200 ms. |
| **Text on path** | Glyphs are positioned and rotated along a curve and can travel along it. | Tagline flows along a cubic arc, offset animating 0→100% over 3 s inOutSine, glyphs rotate to tangent. |
| **Highlight sweep** | A colored band sweeps behind a word as if drawn with a highlighter. | Highlight band at 35% cap height behind 'faster' sweeps left-to-right in 380 ms outCubic, 2 px rounded ends. |
| **Underline draw** | An underline draws itself under a word from one end to the other. | Underline 3 px thick, 6 px below baseline, draws 0→100% in 300 ms outQuart starting 200 ms after word settles. |
| **Odometer roll** | Each digit scrolls vertically through intermediate numbers to its final value, like a mechanical counter. | Each digit column rolls to its target over 900 ms outCubic, right column fastest, 40 ms stagger leftward, tabular figures. |
| **Word swap** | One word in a sentence cycles through alternatives while the rest stays fixed. | Last word cycles 4 options every 900 ms: old word exits up 100% in 220 ms inCubic, new enters from below 320 ms outExpo. |
| **Focus-in** | Text resolves from blurred and slightly scaled to sharp, like a lens finding focus. | Title blurs 12→0 px, scales 1.06→1.0 and fades 0→1 over 700 ms outCubic. |
| **Outline-to-fill** | Glyph outlines draw on first, then the interior fills. | Glyph outlines draw over 900 ms linear at 1.5 px, then fill fades in over 300 ms outQuad. |
| **Center split reveal** | Text is revealed by a mask opening from its horizontal center outward. | Mask opens from center to full word width over 450 ms outExpo, text static behind it. |
| **Fill wipe** | Text color fills from one side like liquid, changing from outline or gray to brand color. | Word fills from gray #8A8F98 to white left-to-right over 600 ms inOutSine, synced with progress bar. |
| **Optical size and kerning** | Adjusting spacing and design for size: display text needs tighter tracking and kerning than small text. | Headlines over 96 px set at -2% tracking with font kerning on; captions under 28 px at +1%. |
| **Type scale** | A fixed ratio between type sizes so headline, subhead and caption feel related. | Use a 1.333 ratio: caption 24 px, body 32 px, subhead 43 px, headline 76 px, hero 135 px at 1080 px frame height. |
| **Type lockup** | A fixed composed group of text elements whose spacing never changes during animation. | Lockup: headline 76 px, 24 px gap, subhead 32 px at 70% opacity; the group animates as one unit, 500 ms outExpo. |
| **Mask overflow guard** | Masks around animated text extended so ascenders, descenders and accents are never clipped. | Extend all line masks 30% of font size above cap height and 30% below baseline. |

## layout-and-composition

Framing, grids, hierarchy and reflow across 16:9, 1:1, 4:5 and 9:16.

| Term | Definition | Say it like this |
|---|---|---|
| **16:9 landscape layout** | Wide horizontal frame for keynote screens and desktop players; supports side-by-side text and visual. | Render 1920x1080; text column occupies left 40% with 7% outer margin, hero visual centered at 65% x. |
| **1:1 square layout** | Square frame that centers composition and favors stacked text above visual. | Render 1080x1080; headline top 18-32% band, visual 40-85%, margins 8%. |
| **4:5 portrait layout** | Slightly tall frame that maximizes feed real estate while keeping comfortable stacking room. | Render 1080x1350; headline in top 25%, visual centered at 55% y filling 70% width, CTA in bottom 12%. |
| **9:16 vertical layout** | Full-phone vertical frame; content stacks vertically and must avoid platform UI overlays. | Render 1080x1920; keep text between 14% and 72% height, horizontal margins 8%, nothing critical in bottom 20% or right 12%. |
| **Aspect-ratio reflow** | One scene described in normalized units that re-lays out per aspect rather than cropping one master. | Define anchors in 0-1 space per aspect: 16:9 text-left/visual-right, 1:1 and 4:5 stacked, 9:16 stacked with type +12%. |
| **Title-safe area** | Inner frame region where text and essential elements are guaranteed visible. | Keep all text inside a 90% title-safe box (5% inset each side) and key visuals inside 95%. |
| **Platform UI safe zone** | Areas of vertical frames covered by app buttons, captions and usernames on social platforms. | On 9:16, reserve bottom 20% and right 12% as no-text zones; top 10% only for non-critical decor. |
| **Rule of thirds** | Place key subjects on lines or intersections dividing the frame into a 3x3 grid. | Product centered on the right-third vertical (x=66.7%), headline baseline on the lower-third line (y=66.7%). |
| **Centered symmetry** | Subject placed exactly at frame center with mirrored balance, conveying stability and confidence. | Logo centered at 50%/48% (optical center slightly above), 30% frame width, equal empty space on all sides. |
| **Negative space** | Intentional empty area that isolates the subject and signals premium restraint. | Keep at least 55% of the frame empty around the single headline; no decorative elements in that zone. |
| **Layout grid** | Invisible columns and gutters to which all elements align. | Use a 12-column grid with 6% outer margins and 1.5% gutters at 16:9; 4 columns at 9:16. |
| **Visual hierarchy** | Size, contrast, position and motion rank elements so the eye reads them in a planned order. | Rank 3 levels: headline 1.0 size full white, subhead 0.42 size 70% opacity, caption 0.32 size 55%; only level 1 animates at full energy. |
| **Focal point** | The single location the eye should land first in a frame. | One focal point per shot: brightest value (L 95), highest contrast and first motion all at the product screen. |
| **Leading lines** | Lines in the composition that guide the eye toward the subject. | Three perspective grid lines converge on the logo at frame center; lines fade from 25% to 0% opacity toward edges. |
| **Scale contrast** | Pairing very large and very small elements to create drama and hierarchy. | Hero number at 46% frame height paired with a 2.2% label beside it. |
| **Z-pattern reading path** | Arrange elements so the eye scans top-left, top-right, diagonally to bottom-left, then bottom-right. | Logo at top-left (6%,6%), headline top-right, product center-left, CTA bottom-right at (88%,88%). |
| **Frame within a frame** | Using an element such as a device screen or window to frame the subject inside the shot. | Content plays inside a rounded device screen occupying 48% frame height, 1.5% bezel, rest of frame darkened to 20%. |
| **Horizon placement** | Where the floor or horizon line sits, affecting perceived weight and grandeur. | Place the floor horizon at 72% height for a grounded hero, or 30% for a sky-dominant opener. |
| **Edge tension** | Elements placed so close to frame edges they feel cramped or cut; avoid unless intentional. | Keep every element at least 5% from frame edges, or bleed it at least 15% off-frame; never 1-4%. |
| **Layered depth stacking** | Composing distinct foreground, midground and background planes to create depth. | Three planes: blurred foreground shapes at 8 px blur, sharp product midground, background gradient at 60% luminance. |
| **Baseline alignment** | Aligning text baselines and element edges to common lines across the frame. | Align the headline baseline and the stat's baseline to y=58% exactly; snap to a 8 px baseline grid. |
| **Optical center** | The point slightly above the geometric center where a centered element looks balanced. | Center lockups at 47-48% frame height instead of 50%. |

## light-and-materials

Lighting setups and surface materials built in shaders or Canvas2D, no photo assets.

| Term | Definition | Say it like this |
|---|---|---|
| **Key light** | The dominant light source that defines form and the direction of shadows. | Key light from upper-left at 45° azimuth, 35° elevation, intensity 1.0, color temperature about 5600K (#FFF4E8). |
| **Fill light** | Secondary softer light opposite the key that lifts shadow detail. | Fill from right at 30% of key intensity, slightly cool #E8F0FF, no specular contribution. |
| **Rim light** | Light from behind the subject that outlines its silhouette against the background. | Rim light from behind-above at 150% key intensity, producing a 2-4 px bright edge on the product outline. |
| **Three-point lighting** | Classic setup of key, fill and rim lights giving shape, readable shadows and separation. | Key 1.0 upper-left, fill 0.3 right, rim 1.5 behind-top; background 1.5 stops darker than subject. |
| **Softbox light** | Large light source producing soft gradual shadows and broad smooth highlights. | Simulate a softbox: rectangular highlight reflection 30% of product width, shadows with 40 px penumbra. |
| **Hard light** | Small light source producing sharp-edged shadows and contrasty highlights. | Single hard light at 70° elevation, shadow edge under 2 px, background in 10% gray. |
| **Fresnel effect** | Surfaces reflect more at grazing angles, brightening edges of glass, water and coatings. | Reflectance rises from 4% facing to 100% at grazing via Schlick (F0=0.04, power 5). |
| **Specular sweep** | A bright highlight band moves across a surface, revealing gloss and form. | Highlight band 18% surface width sweeps diagonally across the device in 1.2 s inOutSine, peak +40% brightness. |
| **Procedural environment lighting** | Lighting and reflections derived from an environment map generated in code rather than a photo. | Generate a 256x128 equirect environment in code: dark gray base, two softbox rectangles at luminance 8 and 3, horizon gradient. |
| **Ambient occlusion** | Darkening where surfaces are close together and ambient light is blocked. | Apply SDF ambient occlusion with 5 samples at 0.02-0.1 step, strength 0.6, darkening creases and floor contact. |
| **Contact shadow** | Small dark soft shadow where an object meets a surface, anchoring it. | Ellipse contact shadow 90% object width, 0.35 opacity at center to 0 at edge, shrinks 30% as object lifts 40 px. |
| **Glass refraction** | Transparent material bending the background behind it, with fresnel edges and highlights. | Glass panel refracts background with IOR 1.45, 6 px offset at edges, 4% tint, fresnel edge highlight 1.5 px. |
| **Frosted glass** | Translucent material that blurs and lightens whatever is behind it. | Panel blurs backdrop 24 px, adds white at 12%, 1 px inner border at 20% white, 20 px corner radius. |
| **Brushed metal** | Metal with fine directional grooves that stretch highlights along one axis. | Aluminum base #C9CCD1, roughness 0.35 along x and 0.08 along y, plus 1-px seeded line noise at 6% contrast. |
| **Matte plastic** | Low-gloss material with broad soft highlight and strong diffuse color. | Base color #2B2F36, roughness 0.7, specular F0 0.04, very soft highlight peak 15% above base. |
| **Subsurface glow** | Light scatters inside a material, softening shadows and adding warm translucency at thin edges. | Wrap-lighting term 0.4 and thickness-based back-light tint #FF8A6A at 25% on thin edges. |
| **Emissive glow** | Surfaces that emit light themselves, staying bright regardless of scene lighting. | Screen surface emits at luminance 1.6 (above 1.0 white) so it blooms subtly; bezel stays unlit. |
| **Bloom** | Bright areas bleed soft light into surrounding pixels, simulating lens and eye scatter. | Bloom threshold 0.9, 5-level downsampled blur, intensity 0.25, warm tint 5%. |
| **Light shafts** | Visible beams of light through haze, emanating from a bright source past occluders. | Light shafts from top-left source, 64 radial samples, decay 0.96, density 0.8, exposure 0.18. |
| **Thin-film iridescence** | Surface color shifts with viewing angle, cycling through hues like a soap bubble. | Hue shifts across 240° as viewing angle goes 0→70°, film thickness 380 nm simulated, mixed 30% over base. |
| **Caustics** | Bright moving patterns of focused light cast through water or glass. | Animated caustic pattern on the floor from 3 octaves of warped Voronoi, 0.4 speed, additive at 20%. |
| **Clearcoat** | A thin glossy layer over a base material, adding a sharp reflection above a softer one. | Base roughness 0.5 colored, plus clearcoat layer roughness 0.05 at F0 0.04 strength 0.8. |
| **Infinite cyclorama** | A curved floor-to-wall backdrop with no visible horizon, for studio-style product shots. | Seamless backdrop curving with 1.5-unit radius, base #EDEEF0, gradient to 85% at top, soft shadow under product. |

## color-and-grade

Palettes, perceptual color math, tonemapping and the final grade pass.

| Term | Definition | Say it like this |
|---|---|---|
| **Filmic tonemapping** | Mapping high-dynamic-range light values into display range with a soft shoulder instead of hard clipping. | Render in linear float, exposure 1.0, apply a filmic curve with shoulder starting at 0.8, then sRGB encode. |
| **Exposure** | Global brightness multiplier applied before tonemapping, measured in stops (each doubles light). | Set exposure +0.5 stops (x1.41) for the opener, ramp to 0 stops over 2 s as the logo appears. |
| **S-curve contrast** | Tone curve that darkens shadows and brightens highlights while keeping midtones, adding punch. | Apply S-curve pivot at 0.45: shadows -6%, highlights +5%, midtones unchanged. |
| **Lift-gamma-gain** | Independent color and level adjustments for shadows, midtones and highlights. | Lift shadows toward blue +0.02, gamma neutral, gain highlights warm (+0.03 R, -0.02 B). |
| **Split toning** | Shadows and highlights tinted with opposing hues, often cool shadows and warm highlights. | Tint shadows below 0.3 luminance toward #1E3A5F at 12%, highlights above 0.7 toward #FFD9A8 at 8%. |
| **Accent-only color** | Entire frame is near-neutral with a single saturated accent drawing all attention. | Desaturate everything to 8% chroma; only the CTA button keeps full brand color. |
| **Limited palette** | Using a small fixed set of colors for the whole film for coherence. | Palette locked to 4 values: background #0E1116, surface #1C222B, text #F2F4F7, accent #5B8CFF; no other hues. |
| **Color temperature** | Overall warmth or coolness of light, measured in kelvin; drives mood. | Grade the problem act cool (white point near 7500K, #E6EEFF) and the solution act warm (near 4500K, #FFF1E0), 1 s transition. |
| **Saturation restraint** | Keeping average saturation low so accents and brand colors stand out. | Keep background chroma under 0.04 in OKLCH and only accents above 0.15. |
| **Perceptual interpolation** | Blending colors in a perceptually uniform space so gradients do not pass through muddy or gray midpoints. | Interpolate the blue-to-orange gradient in OKLCH with 64 stops, hue taking the shorter arc. |
| **Color script** | A planned sequence of dominant colors across the film's beats. | Color script for 30 s: 0-8 s desaturated navy, 8-18 s brightening teal, 18-26 s warm white, 26-30 s brand accent on black. |
| **Brand color fidelity** | Brand colors must render at their exact sRGB values in the final encode. | Draw brand color #5B8CFF ungraded, encode with bt709 tags so sampled output stays within 2 delta-E. |
| **Near-black base** | Using a dark tinted gray instead of pure #000 to keep depth and avoid compression blocking. | Background #0B0D10 (not #000000), gradient to #151922 at the focal area. |
| **Highlight rolloff** | How brightest values approach white: smoothly rather than abruptly clipping. | Highlights above 0.85 compress with a soft shoulder so nothing exceeds 0.98 except intentional flashes. |
| **Analogous palette** | Colors neighboring on the hue wheel, giving harmonious low-tension looks. | Use hues 200°, 225° and 250° in OKLCH with lightness 0.25/0.55/0.85 for background, surface and highlight. |
| **Complementary accent** | An accent from the opposite side of the hue wheel to make one element pop. | Blue-dominant scene (hue 240°) with a single orange accent at hue 60°, covering under 5% of frame. |
| **Duotone** | Image luminance mapped to a gradient between two colors. | Map luminance to a 2-stop gradient: shadows #10233D, highlights #7FD4C1, applied to procedural textures. |
| **Black point** | The lowest luminance in the frame; raising or crushing it changes mood and legibility. | Set black point at 4% luminance so shadows hold detail; never crush below 2% under UI. |
| **Mesh gradient** | Smooth color field defined by several colored points blended in two dimensions. | 4-point mesh gradient: corners #1B2A49, #2E5E8C, #0E1726, #4A3C7A, control points drifting 3% over 8 s. |
| **Value structure** | Planning the frame in grayscale values so it reads clearly before color is added. | Frame reads in 3 values: background 15% luminance, surfaces 35%, subject and type 90%. |
| **Gamut clamp** | Ensuring computed colors stay within displayable sRGB to avoid harsh clipping. | Reduce OKLCH chroma in 0.005 steps until all sRGB channels sit within 0-1, keeping lightness fixed; never clip channels independently. |
| **Color grade pass** | A single final full-frame shader pass applying all color corrections in a fixed order. | Order: exposure, white balance, tonemap, S-curve 0.3, split tone, saturation 0.92, sRGB encode, dither. |

## texture-and-finish

Grain, dither, vignette, edges and finishing passes that survive video encoding.

| Term | Definition | Say it like this |
|---|---|---|
| **Film grain** | Fine random luminance noise over the frame that adds organic texture and hides banding. | Add monochrome grain at 3.5% amplitude, 1.5 px grain size, new seed per frame from frame index, stronger in midtones. |
| **Dither** | Tiny structured noise added before quantization to break up 8-bit gradient banding. | Add ±0.5/255 triangular dither to every pixel in the final pass before writing 8-bit output. |
| **Vignette** | Gradual darkening toward the frame edges that focuses attention inward. | Radial vignette starting at 55% of half-diagonal, 18% darkening at corners, smooth quadratic falloff. |
| **Chromatic aberration** | Red and blue channels slightly offset toward edges, simulating lens dispersion. | Offset R outward and B inward by 0.15% of frame width at corners, zero at center. |
| **Halation** | Warm reddish glow around bright highlights, as from light scattering back through film. | Highlights above 0.85 get a 12 px warm (#FF5A3A) blur added at 10% intensity. |
| **Scanlines** | Horizontal line pattern simulating old display rasters. | Scanlines every 3 px at 8% darkening, with 0.5% vertical roll at 0.2 Hz. |
| **Paper texture** | Subtle paper-like fiber and tooth texture over flat graphics for a tactile print feel. | Overlay 3-octave value noise at 4% multiply plus 1-px seeded fibers at 2%, static across frames. |
| **Grainy gradient** | A smooth color gradient finished with visible fine grain for a tactile, non-digital feel. | Two-color OKLCH gradient with 5% static monochrome grain at 1 px, grain re-seeded every 2 frames. |
| **Halftone** | Image rendered as a grid of dots whose size encodes tone. | Halftone at 45° screen angle, 8 px cell, dot radius proportional to sqrt(darkness). |
| **Gate weave** | Tiny frame-to-frame positional drift simulating film moving through a projector. | Shift the whole frame by seeded noise of ±0.6 px x and ±0.4 px y per frame. |
| **Exposure flicker** | Small frame-to-frame brightness variation simulating analog exposure instability. | Global brightness flickers ±1.5% with seeded per-frame noise, smoothed over 3 frames. |
| **Diffusion glow** | Gentle overall glow that softens contrast and blooms highlights like a diffusion filter. | Blend a 20 px blurred copy of the frame at 15% screen mode; highlights get an extra 8%. |
| **Edge anti-aliasing** | Smoothing jagged pixel steps along shape edges. | Render at 2x resolution (3840x2160) and downsample with a box filter, or use 1-px smoothstep SDF edges. |
| **Continuous corners** | Rounded corners with gradually increasing curvature instead of a circular arc join. | Cards use superellipse corners exponent 4, radius 4% of card width. |
| **Inner shadow** | Shadow cast inside an element's edge, suggesting a recessed surface. | Inset shadow 0 2 px 6 px at 25% black on input fields. |
| **Layered drop shadow** | Several soft shadows of different size stacked to approximate realistic diffuse occlusion. | Card shadow stack: 0 1 px 2 px at 8%, 0 6 px 16 px at 10%, 0 24 px 48 px at 12%. |
| **Hairline border** | Very thin edge stroke that defines surfaces on dark backgrounds. | 1 px inner border at 10% white on dark cards, aligned to pixel grid with 0.5 px offset. |
| **Light leak** | Warm colored glows bleeding in from frame edges, simulating stray light on film. | Warm orange-to-magenta glow enters from the right edge over 800 ms, peaks at 35% screen blend, drifts and exits in 1.2 s; seeded noise shape. |
| **Posterize** | Reducing tones to a few flat levels for a graphic, poster-like look. | Posterize luminance to 5 levels with 1 px soft steps, then map to palette. |
| **Misregistration** | Color layers slightly offset as in imperfect multi-pass printing. | Offset the accent ink layer by 2 px right, 1 px down, multiply blend, static. |
| **Encode-safe texture** | Choosing texture scale and amplitude that survives video compression instead of turning into blocks. | Keep texture features 2 px or larger and amplitude 3-5%; test at 8 Mbps H.264 and compare against the master frame. |

## data-viz-motion

Animated charts and numbers that stay honest while they move.

| Term | Definition | Say it like this |
|---|---|---|
| **Bar grow** | Bars rise from the baseline to their values, staggered so comparison is felt. | 7 bars grow from the x-axis with 70 ms stagger, 600 ms outCubic each; value labels fade in 150 ms after each bar settles. |
| **Line draw-on** | A line chart's path draws progressively from left to right along its length. | Line draws left-to-right over 1.6 s inOutSine, 3 px stroke, leading dot 8 px riding the tip. |
| **Number count-up** | A number animates from a start value to its final value. | Count from 0 to 2,400,000 over 1.4 s outExpo, tabular figures, thousands separators, final value holds 1.5 s. |
| **Donut sweep** | Arc segments sweep clockwise from 12 o'clock to their proportions. | Donut 28% stroke width sweeps from -90° clockwise over 900 ms outCubic; segments start sequentially, 2° gaps. |
| **Axis build** | Axes and tick marks draw in before data, setting up the frame of reference. | X axis draws left-to-right in 400 ms outQuart, ticks pop with 30 ms stagger, data begins at 500 ms. |
| **Gridline fade** | Faint gridlines appear quietly behind data to support reading values. | Gridlines at 8% opacity fade in over 300 ms with 40 ms stagger bottom-up, 1 px. |
| **Point pop** | Data markers scale in at their positions, usually after the line passes them. | Each marker scales 0→1 in 240 ms outBack (1.5) the moment the drawing line reaches its x. |
| **Chart morph** | One chart type continuously transforms into another, preserving data identity. | Bars morph into a donut over 900 ms inOutCubic: each bar's height maps to its arc angle, colors constant. |
| **Series highlight** | One data series stays bright while all others dim, isolating the story. | All lines dim to 20% opacity over 300 ms; the highlighted series thickens 2→4 px and turns accent color. |
| **Annotation callout** | A label connected by a short line to a specific data point, explaining it. | Leader line draws 40 px in 200 ms from the peak point, then label fades and slides 8 px over 250 ms outCubic. |
| **Stacked area reveal** | Layers of a stacked area chart grow upward from the baseline one series at a time. | Each layer wipes in left-to-right over 800 ms inOutSine, layers start 200 ms apart, bottom first. |
| **Swarm arrival** | Scatter points travel from a cluster into their plotted positions. | 200 points fly from center to their positions over 900 ms outExpo, seeded per-point delay 0-300 ms. |
| **Route trace** | A path draws across a stylized map, with a moving head marking progress. | Route draws along a vector map over 2.5 s inOutSine with a 10 px glowing head and fading 20% trail. |
| **Ranking race** | Horizontal bars resort by value over time, with smooth position swaps. | 12 bars update every 500 ms; value tweens 450 ms linear, rank swaps tween y over 300 ms inOutCubic. |
| **Progress ring** | Circular stroke filling to represent percentage or completion. | Ring 10 px stroke, round cap, fills 0→72% over 1.1 s outCubic, percentage counts up in the center. |
| **Sparkline** | A tiny wordless line showing trend shape inline with text or a number. | Sparkline 120x32 px, 2 px stroke, draws in 500 ms after the number lands, last point dot 4 px. |
| **Before-after compare** | Two states shown in sequence or side by side so change is obvious. | Before bar at 40% height in gray, after bar grows to 85% in accent over 700 ms outExpo; delta label '+112%' pops at 750 ms. |
| **Unit chart** | Quantities shown as counts of identical small units in a grid. | 10x10 dot grid, 37 dots fill accent color one by one at 15 ms stagger in reading order. |
| **Axis rescale** | Axis range animates to a new scale while data repositions accordingly. | Y axis domain animates from 0-100 to 0-1000 over 800 ms inOutCubic; tick labels crossfade, bars shrink proportionally. |
| **Delta badge** | A small label with arrow showing increase or decrease, attached to a figure. | Delta badge '▲ 38%' slides 12 px up and fades in over 250 ms outCubic, 300 ms after the counter lands; green #3DDC97. |
| **Waterfall build** | Sequential bars show how increments and decrements move a start value to an end value. | Each step bar drops from the previous running total over 400 ms outCubic, 150 ms stagger, connectors draw 120 ms after. |
| **Data-honest easing** | Animate data so no intermediate frame shows false values that could be mistaken for truth. | Hold final values at least 1.5 s; overshoot easings forbidden on data bars and numbers; use outCubic only. |

## ui-motion

Simulated product interfaces: cursors, taps, sheets, lists and state changes.

| Term | Definition | Say it like this |
|---|---|---|
| **Scripted cursor** | A code-drawn pointer moving along eased curves to demonstrate interactions. | Cursor travels along a gentle arc between targets in 600-800 ms inOutCubic, pauses 250 ms before each click, never moves linearly. |
| **Press feedback** | Visual response to a press: brief scale-down and color shift, then release. | On click, button scales to 0.96 in 80 ms outQuad, darkens 8%, releases to 1.0 with spring stiffness 400, damping 25. |
| **Touch indicator** | A translucent circle showing where a simulated finger touches a phone UI. | Tap dot 44 px diameter, white at 35% with 2 px ring, scales 0.6→1.0 in 120 ms, fades out over 250 ms after release. |
| **Click ripple** | A circle expands and fades from the press point, confirming the interaction. | Ring expands from tap point 0→120 px radius in 450 ms outCubic while opacity 0.4→0. |
| **Hover lift** | Element rises slightly with a larger shadow when the cursor approaches. | Card translates -4 px and shadow blur grows 12→24 px over 180 ms outCubic when cursor enters. |
| **Modal present** | A dialog appears above content with a dimmed backdrop. | Backdrop fades to 50% black over 200 ms; dialog scales 0.94→1.0 and fades in over 260 ms outCubic. |
| **Sheet slide-up** | Panel slides up from the bottom edge to partial height. | Sheet rises from 100% to 45% screen height with spring stiffness 300, damping 30; handle bar 36x5 px. |
| **Toast drop** | Small message slides in from the top, stays briefly, then leaves. | Toast drops 64 px from top in 350 ms outBack(1.2), holds 1.8 s, exits up in 220 ms inCubic. |
| **Shared element transition** | An element in one screen grows and moves to become its counterpart in the next screen. | Thumbnail expands to full-screen detail over 500 ms inOutCubic, corner radius 16→0 px, other items fade to 0 in first 150 ms. |
| **List insertion** | A new item enters a list while existing items move to make room. | Existing rows shift down 72 px over 300 ms outCubic; new row fades and slides from -12 px starting at 120 ms. |
| **Skeleton shimmer** | Gray placeholder shapes with a moving light band suggesting loading content. | Placeholders #1E232B with a 30%-wide band at +6% brightness sweeping every 1.2 s linear, swap to content with 200 ms crossfade. |
| **Toggle switch** | A knob slides across a track that changes color. | Knob travels 20 px with spring stiffness 500, damping 30; track color crossfades gray to accent over 150 ms. |
| **Simulated scroll** | Content scrolls as if flicked or dragged, with realistic momentum. | Scroll 1200 px: accelerate 120 ms, cruise, decelerate over 700 ms with exponential decay time-constant 325 ms. |
| **Typed input** | Characters appear in a text field as if typed, with caret and natural timing. | Type at 14 chars/s with seeded ±30% jitter per key, caret blinks 530 ms when idle, field focus ring appears 150 ms before typing. |
| **Focus ring** | Highlight outline indicating which control is active. | Focus ring 2 px accent with 3 px offset, grows from 0 to full in 150 ms outCubic. |
| **Tab indicator slide** | Active indicator glides between tabs, stretching slightly while moving. | Indicator moves to the new tab over 320 ms inOutCubic, width lerps between tab widths, leading edge 40 ms ahead. |
| **Drag and drop** | An item lifts, follows the pointer, and settles into a new slot as others reflow. | Item lifts scale 1.04 and shadow +16 px in 120 ms, follows path over 700 ms, drops with spring stiffness 260, damping 22. |
| **Pill expansion** | A small capsule morphs smoothly into a larger card containing live content. | Capsule 120x36 px expands to 360x120 px with spring stiffness 280, damping 24, content fades in after 60% of expansion. |
| **Menu cascade** | A menu opens and its items appear in a short stagger from the anchor. | Menu scales from 0.9 at the anchor corner in 200 ms outCubic; 6 items fade in with 25 ms stagger. |
| **Success check** | A check mark draws itself inside a circle to confirm completion. | Circle fills accent in 200 ms outCubic, then 4 px check stroke draws over 280 ms outQuart, scale bump 1.06 at end. |
| **Device frame** | UI content rendered inside a code-drawn device outline rather than a supplied product photo. | Draw a generic device: rounded rect radius 11% width, 2% bezel #111, screen content clipped, 3D tilt 8° on Y. |
| **Magnify callout** | A region of UI is enlarged in a circle or card to show small details. | Circular loupe 30% frame height shows the 2.5x enlarged button region, grows from 0 in 350 ms outBack(1.3). |
| **Chat bubble arrival** | A message bubble grows from its tail corner and settles, with typing dots preceding it. | Typing dots bounce 3x at 400 ms period, then bubble scales 0.8→1.0 from the tail corner in 260 ms outBack(1.4). |

## depth-and-3d

Parallax, projection, raymarching and 3D staging with WebGL or 2.5D Canvas.

| Term | Definition | Say it like this |
|---|---|---|
| **2.5D parallax layers** | Flat layers at assigned depths move at different speeds to fake 3D space. | Five layers at depths 1, 1.5, 2.5, 4, 8; camera drift of 60 px moves each layer by 60/depth px over 5 s inOutSine. |
| **Fanned card stack** | Multiple cards arranged in depth, offset and rotated, suggesting a collection. | 5 cards stacked with 24 px z-offset, each rotated 4° further, fanning out over 700 ms with 50 ms stagger outExpo. |
| **Perspective tilt** | A flat element rotated in 3D with perspective, giving depth to UI. | Screen tilts to rotateX 12°, rotateY -18° with perspective 1600 px over 900 ms inOutCubic. |
| **Isometric projection** | Parallel projection with equal axis angles so objects keep size regardless of depth. | Isometric grid at 30° axes, 64 px tile, blocks extrude upward 0→target height over 500 ms outBack(1.2) staggered 40 ms. |
| **Extrusion** | A flat shape given thickness along depth, turning a 2D mark into a solid. | Logo outline extruded 6% of its width, bevel 0.8%, side faces 25% darker, rotates 25° on Y over 3 s. |
| **SDF raymarching** | Rendering 3D shapes defined by distance functions by stepping rays through a fragment shader. | Raymarch with max 96 steps, epsilon 0.001, max distance 30; scene from smooth-union of 3 primitives with k=0.25. |
| **Atmospheric perspective** | Distant objects shift toward background color and lose contrast, conveying depth. | Exponential fog density 0.08 toward #1A2230; objects at distance 20 retain 20% of their contrast. |
| **Depth sorting** | Drawing elements back to front so nearer ones correctly occlude farther ones. | Sort all 2.5D items by z each frame, stable sort with id tiebreaker, draw far to near. |
| **Exploded view** | An object's components separate along axes to reveal internal structure. | 6 layers separate along Z by 1.2 units each over 1.4 s inOutCubic with 80 ms stagger, labels draw on after 1.6 s. |
| **Turntable** | Object rotates on a vertical axis in place, presenting all sides. | Product rotates 360° on Y over 8 s linear for a seamless loop, camera elevation 15°. |
| **Billboard sprites** | Flat sprites always rotated to face the camera, used for particles and labels in 3D. | Labels render as camera-facing quads at fixed 28 px screen size regardless of depth. |
| **Normal mapping** | Per-pixel surface normals perturbed to fake fine geometric detail under lighting. | Procedural normal map from 4-octave noise at strength 0.3 on the metal surface, 0.2 mm scale feel. |
| **Instancing** | Drawing thousands of identical meshes in one call with per-instance attributes. | Render 20,000 cubes with one instanced draw call, per-instance offset and seeded scale 0.5-1.5. |
| **Idle float** | Gentle continuous bobbing and rotation keeping a hero object alive during holds. | Product bobs ±6 px at 0.25 Hz sine and rotates ±2° at 0.17 Hz, phase-offset so the motion never repeats visibly in 10 s. |
| **Reflective floor** | Ground plane showing a faded, blurred reflection of the object. | Reflection at 25% opacity, fading to 0 over 30% of object height, blurred 4 px, floor color #0D0F12. |
| **Depth cueing** | Combining size, blur, brightness and parallax to communicate distance in 2D. | Far particles: 0.4x size, 4 px blur, 40% brightness, 0.3x parallax; near: 1.4x size, 6 px blur, full brightness, 1.6x parallax. |
| **Shadow mapping** | Computing shadows by rendering depth from the light's point of view. | 2048x2048 shadow map, 5x5 PCF filter, bias 0.0015, soft radius 2 texels. |
| **Orthographic camera** | Projection with no perspective shrinking; sizes stay constant with distance. | Use orthographic projection with view height 10 units for the diagram scene; rotate camera 35°/45° for isometric feel. |
| **Cursor-follow tilt** | Element tilts toward a simulated pointer position, reinforcing depth. | Card tilts up to 8° toward the scripted cursor with spring stiffness 150, damping 20, highlight spot follows. |
| **Smooth union** | Shapes merge with a smooth fillet where they meet, producing organic blobs. | Three spheres merge with polynomial smooth-min k=0.35, orbiting at 0.2 Hz with radius 1.2. |
| **Displacement terrain** | A plane displaced by a height function to form landscape or abstract surface. | 256x256 grid displaced by 5-octave fbm, amplitude 1.5 units, scrolling 0.05 units/s, wireframe at 15% opacity. |
| **Volumetric fog** | Light scattering through a 3D density field rendered by stepping through volume. | March 48 steps through a noise density field, scattering 0.6, absorption 0.2, light step 6 samples. |

## particles-and-fields

Seeded particle systems, noise fields and simulations that render deterministically.

| Term | Definition | Say it like this |
|---|---|---|
| **Curl noise flow** | Particles advected by the curl of a noise field, producing swirling, non-clumping motion like smoke. | Advect 40,000 particles through 3D curl noise at scale 0.8, speed 0.12 units/s, time offset 0.05/s, trails 0.92 decay. |
| **Flow field streaks** | Many short strokes following a 2D vector field, revealing its structure like wind lines. | Draw 3,000 seeded streamlines of 40 steps each through an angle field (noise * 2PI), 1 px at 30% opacity. |
| **Particle burst** | Many particles emitted at once from a point with randomized velocities that decelerate and fade. | Emit 400 particles from the logo center, speed 300-900 px/s seeded, drag 3.0/s, life 0.9-1.4 s, fade outQuad. |
| **Particle convergence** | Scattered particles travel to points sampled on a target shape, assembling it. | 6,000 particles sampled from logo pixels converge from a seeded cloud over 1.8 s outExpo with per-particle 0-400 ms delay. |
| **Dust motes** | Sparse, slow, softly lit specks drifting in the air, adding depth and atmosphere. | 120 motes, 1-3 px, 10-40% opacity, drifting 4-12 px/s with 0.1 Hz noise, brightest in the light beam. |
| **Sparks** | Small bright particles with streaked motion, gravity and fast fade. | Emit 80 sparks per hit, initial speed 600 px/s, gravity 900 px/s², streak length = velocity × 1/60 s, life 600 ms. |
| **Confetti** | Flat colored pieces tumbling with flutter, gravity and air drag. | 300 confetti rects 6x10 px in palette colors, gravity 500 px/s², drag 1.6, flutter rotation 3-8 rad/s, 2.5 s life. |
| **Flocking** | Agents following separation, alignment and cohesion rules, moving like a flock. | 300 agents with separation radius 20 px, alignment 50 px, cohesion 80 px, max speed 140 px/s, fixed dt 1/120 s. |
| **Attractor field** | Points that pull or push particles, shaping motion around key elements. | Logo acts as repulsor radius 180 px, strength 400; particles bend around it with falloff 1/r². |
| **Accumulation trails** | Each frame draws over a faded previous frame, leaving fading trails behind moving elements. | Fade the previous frame by multiplying 0.9 each frame, then draw particles; trails ~10 frames long. |
| **GPU particle simulation** | Particle positions stored in float textures and updated by shaders, enabling hundreds of thousands of particles. | Simulate 262,144 particles (512x512 float texture), update positions in a fragment shader each frame, render as 1.5 px points. |
| **Point cloud morph** | Particle set transitions between sampled shapes, preserving count. | 20,000 points morph from sphere to logo over 1.5 s inOutCubic, sorted by angle so paths do not cross. |
| **Voronoi cells** | Space divided into cells around seed points, giving organic, crystalline or biological patterns. | Voronoi with 48 seeded points drifting 6 px/s, cell edges 1.5 px at 25% white, cells shaded by distance. |
| **Reaction-diffusion** | Simulated two-chemical system producing organic spots, stripes and maze patterns. | Gray-Scott with feed 0.037, kill 0.06, 20 iterations per frame on 512x512, seeded with logo mask. |
| **Starfield warp** | Stars stream outward from a center, stretching into lines as speed increases. | 2,000 stars, speed ramps 0.2→6 units/s over 1.2 s inExpo, streak length proportional to speed, fade near center. |
| **Snowfall** | Particles falling slowly with sideways drift and depth variation. | 600 flakes, 3 depth layers, fall 30-90 px/s, sway ±12 px at 0.3 Hz, size and blur by depth. |
| **Orbit rings** | Particles or small objects circling a center on tilted elliptical paths. | 3 rings tilted 15°, 30°, 60°, 80 particles each, periods 6, 9 and 14 s, back half dimmed 50%. |
| **Seeded randomness** | All randomness derived from a seeded generator so every render of a frame is identical. | Use one 32-bit seeded PRNG (seed 1337) per system; per-particle values from hash(id, seed); never Math.random. |
| **Poisson disk distribution** | Random points spaced with a minimum distance, giving even but natural scatter. | Scatter 180 icons using Poisson disk sampling with minimum spacing 70 px, 30 attempts, seed 42. |
| **Plexus network** | Moving points connected by lines whose opacity falls off with distance. | 90 nodes drifting 8 px/s; connect pairs under 140 px with 1 px lines at opacity (1 - d/140)*0.4. |
| **Fluid simulation** | Grid-based velocity and dye simulation producing realistic swirling liquid or smoke. | Stable-fluids sim at 256x256, 20 pressure iterations, dye dissipation 0.98, vorticity 25, deterministic forcing from cue times. |
| **Glow particles** | Soft, out-of-focus round lights drifting slowly in the background. | 40 orbs, 20-90 px radius, radial gradients at 6-18% opacity, additive, drifting 5 px/s. |

## sound-design-in-code

Web Audio recipes for hits, risers, beds and mastering, rendered offline.

| Term | Definition | Say it like this |
|---|---|---|
| **Offline audio render** | Rendering the whole soundtrack faster than real time into a buffer, then encoding to WAV for muxing. | Render 30 s stereo at 48 kHz in an OfflineAudioContext(2, 48000*30, 48000), encode to 16-bit WAV, mux with ffmpeg -c:a aac -b:a 192k. |
| **Synth kick** | A low thump made from a sine whose pitch drops rapidly, with a short amplitude envelope. | Sine oscillator 150→45 Hz exponential over 120 ms, gain 1.0→0.001 over 400 ms, plus a 3 ms noise click at -18 dB. |
| **Sub impact** | Deep low-frequency hit felt more than heard, used under major reveals. | Sine 55→30 Hz over 900 ms, gain envelope 5 ms attack, 1.6 s exponential decay, plus lowpassed noise at 200 Hz -20 dB. |
| **Noise riser** | Filtered noise whose filter cutoff and volume rise into a hit, building anticipation. | White noise through bandpass Q 4 sweeping 300→8000 Hz exponentially over 2.0 s, gain -30→-8 dB, cut silent 1 frame before the hit. |
| **Downlifter** | Descending filtered noise or pitch that releases tension after a hit. | Noise lowpass sweeping 6000→200 Hz over 1.2 s with gain -12→-40 dB, starting on the hit. |
| **Whoosh** | A short noise sweep with panning that accompanies fast motion on screen. | Pink noise, bandpass 800→3000→600 Hz over 350 ms, gain peak -10 dB at 150 ms, pan -0.6→+0.6 matching on-screen direction. |
| **UI tick** | A very short high transient confirming a UI interaction. | Sine 2400 Hz with 1 ms attack, 25 ms exponential decay, gain -20 dB, plus 2 ms highpassed noise at -28 dB. |
| **Bubble pop** | A short rising pitched blip for elements appearing. | Sine sweeping 400→1200 Hz over 60 ms, gain envelope 2 ms attack, 120 ms decay, -16 dB. |
| **Detuned pad** | Sustained chord from several slightly detuned sawtooth oscillators through a lowpass filter. | Four-note chord, 3 saw oscillators per note detuned -7/0/+7 cents, lowpass 1200 Hz Q 0.7, attack 1.5 s, release 2 s, -24 dB. |
| **Shimmer layer** | Quiet high-pitched sustained partials adding air and sparkle. | Sine partials at 2x and 3x chord frequencies, tremolo 5 Hz depth 30%, -32 dB, highpassed at 3 kHz. |
| **Sidechain duck** | Lowering the bed volume momentarily whenever a hit plays so hits cut through. | On each kick, duck pad gain by 8 dB in 10 ms, recover over 250 ms exponential. |
| **Generated reverb** | Reverb produced by convolving with an impulse response generated from decaying noise in code. | Generate a 2.4 s stereo impulse from seeded noise with exponential decay (RT60 2.4 s), predelay 20 ms, wet -14 dB. |
| **Echo delay** | Repeating echoes of a sound at a tempo-synced interval. | Dotted-eighth delay (375 ms at 120 BPM), feedback 0.35, lowpass 3 kHz in the loop, wet -16 dB. |
| **Clap** | A short burst of bandpassed noise, often with several tiny retriggers, used as backbeat. | 3 noise bursts 10 ms apart, bandpass 1500 Hz Q 1.5, final decay 180 ms, -12 dB, on beats 2 and 4. |
| **Hi-hat** | Very short highpassed noise burst providing rhythmic subdivision. | Noise highpassed at 7 kHz, 40 ms decay, -22 dB on every eighth note, odd hats 3 dB quieter. |
| **FM chime** | Bell-like tone from frequency modulation with a non-integer ratio. | Carrier 880 Hz, modulator ratio 3.5, index 400 Hz decaying to 0 over 1.2 s, amplitude decay 2 s, -18 dB. |
| **Bass pluck** | Short low note with a filter envelope giving a plucky attack. | Saw 55-110 Hz, lowpass from 2000→200 Hz over 180 ms, Q 6, amp decay 300 ms, on root notes per bar. |
| **Step sequencer** | Notes scheduled from a pattern array against the beat grid. | 16-step pattern at 120 BPM sixteenths (125 ms), scale degrees from minor pentatonic, schedule all notes up front in the offline context. |
| **Loudness target** | Matching integrated loudness to a delivery target so the film is not too quiet or too loud. | Normalize the mix to -14 LUFS integrated with true peak at most -1 dBTP using ffmpeg loudnorm two-pass. |
| **Master limiter** | A compressor/limiter on the master bus that controls peaks and glues the mix. | DynamicsCompressor threshold -6 dB, knee 0, ratio 20, attack 3 ms, release 120 ms, then gain makeup +2 dB. |
| **Stereo placement** | Positioning sounds left-right to match their on-screen origin. | Pan each UI sound to its element's x: pan = (x/width)*1.6 - 0.8; keep kick and bass at 0. |
| **Tape stop** | Playback pitch and speed drop to zero, like a tape machine stopping, signaling an abrupt halt. | Pitch bend the music bus down 24 semitones over 600 ms via playbackRate 1→0.05 exponential, then silence. |
| **Pre-hit silence** | Cutting all sound for a short moment right before a big hit to maximize contrast. | Mute everything for 250 ms (all buses gain to 0 in 10 ms) immediately before the logo hit at 14.0 s. |

## story-beats

Beat structures for 6/15/30/60-second launch films and the moments inside them.

| Term | Definition | Say it like this |
|---|---|---|
| **Cold-open hook** | A striking image or motion in the first second that stops scrolling before any branding. | Frame 0 already shows motion: the hero shape is mid-transform at 40% scale, high contrast; first readable words by 0.8 s; no logo before 2 s. |
| **15-second structure** | Three-beat micro-story: hook, one proof, branded close. | 0-2 s hook, 2-10 s single demo or claim with one supporting visual, 10-13 s tagline, 13-15 s end card with logo and CTA. |
| **30-second structure** | Four-act arc: hook, problem or context, solution with 2-3 features, close. | 0-3 s hook, 3-8 s problem, 8-22 s solution with 3 feature beats of about 4.5 s each, 22-26 s tagline, 26-30 s end card. |
| **60-second structure** | Fuller arc with setup, escalation, demo sequences, emotional peak and close. | 0-4 s hook, 4-14 s world and problem, 14-40 s three demo chapters of about 8.5 s, 40-50 s montage crescendo, 50-55 s tagline, 55-60 s end card. |
| **6-second bumper** | One idea, one visual, one brand mark in six seconds. | 0-1 s motion hook, 1-4.5 s single message line held at least 2 s, 4.5-6 s logo lockup. |
| **Problem beat** | Shows the friction or limit the product solves, in visual terms rather than words. | Show the clutter: 14 overlapping windows cascade in at 40 ms stagger, desaturated 60%, slight 0.5° jitter, for 3.5 s. |
| **Turn** | The single moment the film flips from problem to solution, usually marked visually and sonically. | At 8.0 s: pre-hit silence 250 ms, all clutter collapses to one point in 300 ms inExpo, grade warms over 600 ms. |
| **Solution reveal** | The first clear look at the product or core idea, given space and time. | Product emerges from darkness via rim light over 1.5 s, camera dollies in 6%, hold 2 s with idle float. |
| **Feature trio** | Exactly three features, each with one visual and one short line, in a consistent template. | Three feature beats of 4.0 s each: 0.5 s title in, 3 s demo, 0.5 s transition; same layout and motion for all three. |
| **Proof beat** | A number, comparison or demo that makes the claim believable. | Hero stat '3.2x faster' counts up over 1.2 s outExpo, before-after bars grow beneath, hold 2 s. |
| **Demo moment** | Showing the product doing one real task from start to finish. | Single uncut 5 s UI sequence: cursor clicks, panel opens 300 ms, result fills 800 ms, success check at 4.2 s. |
| **Crescendo montage** | Accelerating sequence of quick shots building to the climax. | 8 shots shortening from 1.0 s to 0.25 s on beats, scale and brightness rising 5% per shot, landing on the hero at the downbeat. |
| **Tagline land** | The key line of the film appears alone, with silence or a sustained chord. | Tagline enters with baseline mask rise, 60 ms word stagger, 520 ms outExpo, holds 2.5 s on near-black. |
| **End card** | Final held frame with logo, product name, CTA and date or URL. | Logo centered at 47% height, 22% frame width; CTA line 40% below logo in 32 px; holds at least 3 s, last 0.5 s static. |
| **Call to action** | One clear instruction telling the viewer what to do next. | CTA 'Available today' fades and rises 12 px over 400 ms at end-card +0.6 s, accent underline draws 300 ms later. |
| **Logo sting** | A short, consistent animated logo reveal with a signature sound. | Logo builds from 3 strokes drawing on in 600 ms, fill snaps at 700 ms with kick and FM chime, total 1.5 s. |
| **Seamless loop** | Film's last frame flows perfectly into its first for looping platforms. | All periodic motions use periods dividing 10 s exactly; frame 299 to frame 0 differ by under 1% pixel delta. |
| **Sound-off storytelling** | Structuring the story to work fully without audio, since many feeds autoplay muted. | Every claim appears as on-screen text at least 48 px at 1080 wide; audio only reinforces, never carries information. |
| **Bookend** | The closing shot echoes the opening shot, changed to show transformation. | Open on a gray circle at center 20% frame width; close on the same circle in brand color at the same position and size. |
| **Teaser withhold** | Showing only fragments of the product to build curiosity before a full reveal. | Show only 15% of the product at a time via rim light slivers across 3 shots of 1.5 s, full reveal never shown, date card last. |
| **Countdown structure** | Film organized as a numbered sequence leading to a reveal. | Numbers 5 to 1, one per beat at 120 BPM (500 ms each), each slamming 1.6x→1.0x in 150 ms, reveal on the next downbeat. |
| **Energy curve** | Planned rise and fall of visual and audio intensity across the film. | Energy curve on a 0-10 scale: hook 7, problem 4, turn 8, features 6-7, crescendo 9 at 75% of runtime, end card 3. |

## quality-and-qa

Determinism, seam, legibility, contrast, overlap, phone and contact-sheet checks before delivery.

| Term | Definition | Say it like this |
|---|---|---|
| **Deterministic render** | Every frame is a pure function of its frame index, so re-rendering gives identical pixels. | Drive all animation from t = frame/30; ban Date.now, performance.now and Math.random; render frame 137 twice and require 0 differing pixels. |
| **Fixed-timestep simulation** | Simulations advance with constant steps from frame 0, never by measured elapsed time. | Step physics at dt = 1/120 s, 4 substeps per 30 fps frame; to render frame n, simulate from 0 or from cached checkpoints every 30 frames. |
| **Loop seam check** | Verifying the last frame flows into the first with no jump. | Render frames N-1, 0 and 1; mean absolute pixel difference N-1→0 must be within 20% of the 0→1 difference. |
| **Contact sheet** | A grid of frames sampled across the film viewed as one image to judge rhythm, composition and consistency. | Sample 1 frame every 0.5 s into a 10-column contact sheet at 320 px wide per frame; review for repetition, empty frames and off-palette colors. |
| **Legibility floor** | Minimum text size and hold time that remains readable when viewed on a phone. | Body text at least 3.5% of frame height (38 px at 1080p), headlines at least 6%; check at 360 px wide downscale. |
| **Contrast ratio check** | Measuring luminance contrast between text and its actual rendered background. | Sample the rendered background behind each text box; require contrast at least 4.5:1 for body and 3:1 for 48 px+ headlines. |
| **Overlap detection** | Automated check that text and key elements do not overlap each other unintentionally on any frame. | Every 5th frame, export bounding boxes of all text and logos; flag any intersection over 2% of the smaller box area. |
| **Phone test** | Viewing the film at real phone size to judge readability and focus. | Downscale to 360x640 (9:16) or 640x360 (16:9) and view at 100%; every line must be readable and the focal point obvious within 1 s. |
| **Safe-zone overlay check** | Rendering debug frames with safe-area and platform UI guides to verify placement. | Render 6 key frames with 5% title-safe box and 9:16 platform zones (bottom 20%, right 12%) drawn at 30% red; zero text inside zones. |
| **AV sync check** | Verifying audio hits align with visual events to the frame. | For each cue, compare audio onset (energy rise above -30 dB) to the visual event frame; tolerance ±1 frame at 30 fps. |
| **Banding check** | Inspecting smooth gradients after encoding for visible stepped bands. | Encode a test clip at the delivery bitrate, crop dark gradient regions, boost contrast 4x and look for steps wider than 20 px. |
| **Font load gate** | Waiting for all fonts to be loaded before rendering any frame, so fallback fonts never appear. | Await document.fonts.load for every family and weight used, then document.fonts.ready; render frame 0 only after document.fonts.check passes for 100% of specs. |
| **Font license audit** | Confirming every font used is under the Open Font License (OFL) or written in code. | List every font file used with its license text; 100% must be Open Font License (OFL); embed files locally, no runtime CDN loads. |
| **Black frame scan** | Automatic detection of unintended black or empty frames. | Run ffmpeg blackdetect with pixel threshold 0.08 and minimum duration 0.05 s; any hit outside planned dips fails. |
| **Delivery encode spec** | Fixed encoding settings that play everywhere and preserve quality. | H.264 High profile, yuv420p, CRF 16, preset slow, 30 fps constant, bt709 tags, +faststart; AAC 192 kb/s 48 kHz. |
| **Frame cadence check** | Verifying each output frame is unique and evenly spaced, with no stutters or repeats. | Compute per-frame difference; flag any consecutive pair with 0 difference during motion, and confirm count equals duration x 30. |
| **Key frame review** | Rendering and inspecting stills at the most important moments as images before full renders. | Render PNG stills at each cue time plus 0.5 s after; view each as an image and check composition, type, contrast and brand color. |
| **Grayscale value check** | Viewing frames in grayscale to confirm hierarchy and separation without color. | Convert key frames to grayscale; focal element must be at least 30 L* points brighter or darker than its surroundings. |
| **Flash safety check** | Ensuring flashes and rapid contrast changes stay below seizure-risk thresholds. | No more than 3 full-frame luminance flashes per second; flagged when mean luminance swings over 10% and back within 333 ms. |
| **Visual regression diff** | Comparing new renders against approved stills to catch unintended changes. | After every code change, re-render 8 approved frames; flag any frame with more than 0.5% pixels differing by over 8/255. |
| **Audio peak check** | Measuring the final mix for clipping and loudness against target. | Measure the muxed file: true peak at most -1.0 dBTP, integrated loudness -14 ±1 LUFS, no samples at full scale. |
| **Text content audit** | Extracting every rendered string to check spelling, wording and forbidden content. | Log every fillText string and SVG text node with its first and last frame; require 0 spelling errors, 0 placeholder strings and 0 disallowed names. |

## banned-defaults

Common giveaways of default machine-made video, each paired with its exact fix.

| Term | Definition | Say it like this |
|---|---|---|
| **Fade-in-everything** | Every element simply fades from 0 to 1 at center; the most common sign of default machine-made motion. | Replace opacity-only entrances with masked rises: 32 px travel from a baseline mask, 500 ms outExpo, opacity reaching 1 within the first 200 ms. |
| **Linear easing everywhere** | Moves start and stop at full speed, looking mechanical. | Ban linear on any move that starts or stops on screen; use outCubic 400-600 ms for entrances and inCubic 250-350 ms for exits. |
| **Uniform stagger syndrome** | Every group in the film uses the same stagger and duration, making motion monotonous. | Vary stagger by role: letters 20-30 ms, words 60-90 ms, cards 50 ms, grid items by distance 15 ms/unit; group totals 300-900 ms. |
| **Purple-blue default gradient** | A saturated violet-to-blue diagonal gradient used regardless of brand. | Derive background from the brand palette: two OKLCH stops within 25° hue of the primary, chroma under 0.06, lightness 0.14-0.22. |
| **Glow on everything** | Bloom and outer glows applied to every element so nothing stands out. | Restrict glow to one emissive element per shot; bloom threshold 0.9, intensity under 0.25; text gets zero glow. |
| **Ambient plexus wallpaper** | Generic drifting dots-and-lines network used as background filler with no meaning. | Replace with a background derived from the story: e.g. 3 slow brand-colored gradient fields at 0.05 Hz, or remove it and use negative space. |
| **Particles ignoring content** | Particles float over or behind text without reacting, cluttering and reducing contrast. | Particles must avoid text: repulsor radius 1.3x text box, max opacity 15% within 100 px of text, and react to cue hits with a 20% speed pulse. |
| **Elastic on serious content** | Bouncy or elastic easing on data, pricing or enterprise messaging, undermining credibility. | Use critically damped springs (stiffness 170, damping 26) or outCubic for data and text; reserve outBack(1.2) for at most 2 icon accents. |
| **Unmotivated camera shake** | Shake added for energy without a corresponding impact. | Only shake on a scripted impact cue: 4-6 px amplitude, 18 Hz seeded noise, exponential decay to 0 in 250 ms. |
| **Slow zoom on everything** | Every shot slowly scales up regardless of content, a filler move that signals no idea. | Give each shot one motivated move chosen from the shot list: truck, orbit, rack focus or locked-off; at most 2 consecutive shots may push in. |
| **Lens flare spam** | Multiple bright flares and streaks without a light source in frame. | Allow at most 1 flare per film, only from a visible light source, streak 30% frame width at 25% opacity, lasting under 1 s. |
| **Placeholder copy** | Fake Latin filler, generic names or '1,234' sample numbers left in UI or titles. | Every string must come from the approved copy deck; UI mockups use 6-12 realistic, product-relevant lines; QA scan returns 0 placeholder strings. |
| **Fallback system font** | Text rendered in whatever default sans-serif the browser picks because no font was specified or loaded. | Load one OFL display family and one OFL text family locally; set explicit weights (e.g. 600 headline, 400 body) and tracking -2% above 96 px. |
| **Pure white on pure black** | Text #FFFFFF on #000000 with no tonal nuance, causing glare and encode blocking. | Use text #F2F4F7 on #0B0D10; secondary text at 64% opacity; keep contrast at least 12:1. |
| **Everything moves at once** | All elements animate simultaneously, so the eye has no entry point. | Sequence by hierarchy: headline first at 0 ms, visual at 200 ms, supporting text at 450 ms; at most 3 primary motions active per frame. |
| **Identical shot lengths** | Every shot lasts the same duration, giving a flat, mechanical rhythm. | Vary shot lengths on the beat grid in long-short-short patterns (e.g. 2.0, 1.0, 1.0 s), and give the hero shot at least 2x the average. |
| **Glitch transition default** | Chromatic glitch and slice transitions used as generic 'tech' energy. | Replace with a motivated transition: match cut or push 550 ms inOutExpo; allow glitch only for a story beat about errors, max 6 frames. |
| **Translucent glass on everything** | Every card is a frosted translucent panel, reducing contrast and readability. | Use frosted glass for at most 1 surface per shot; other cards solid #1C222B with 1 px 10% white hairline; text contrast stays at least 4.5:1. |
| **Spinning globe filler** | A rotating wireframe planet used to mean 'global' with no specific data. | Show specific places instead: 3-5 labeled points on a flat custom-drawn map with route traces, or remove the globe beat entirely. |
| **Sparkle icon overload** | Star and sparkle glyphs scattered to imply magic or intelligence. | Remove decorative sparkles; express capability through a concrete before-after demo of 3-5 s showing the actual output. |
| **Silent or loop-only soundtrack** | A single repeating music loop with no hits, whooshes or UI sounds synced to picture. | Score from the cue sheet: pad bed at -24 dB, kick on every downbeat cut, whoosh on each push, UI tick on each click, 250 ms silence before the logo hit. |
| **Abrupt last frame** | Film ends on a moving frame or cuts to black mid-motion. | All motion settles at least 2.5 s before the end; final 0.5 s fully static; audio tail fades -60 dB by the last frame. |

## Prompt sentence builder

Build every shot instruction from these parts, in this order. Leave out a part only when it truly doesn't apply.

```
[SUBJECT] [ACTION] [AMOUNT: px | % of frame | degrees | scale]
  [MECHANISM: from behind a mask | camera dolly | shader wipe | spring]
  over [DURATION: ms | frames] [EASING: curve name | spring stiffness/damping]
  [ORDER: stagger ms, direction]  [HOLD: s]  [SYNC: cue name or beat]
  [GUARDRAILS: safe area, min type size, contrast, aspect variant]
```

Quick checks: every sentence has at least one duration, one easing and one size or amount. It names how the effect is built, not how it should feel. It also says when the motion stops.

### Worked examples

1. **Cold-open hook (16:9, 0-2 s).** Frame 0 opens mid-motion: 900 seeded particles already converging on the product silhouette at 40% assembly, finishing over 1.4 s outExpo with per-particle 0-300 ms delays; camera dollies in from scale 1.00 to 1.06, inOutSine; no text before 0.8 s; kick on the 2.0 s downbeat.

2. **Product reveal (16:9, 8-12 s).** Product emerges from #0B0D10 darkness as a rim light from behind-above ramps 0 to 1.5 intensity over 1.5 s inOutCubic, then key light at 45 degrees fades up to 1.0 over 600 ms; camera orbits 30 degrees at radius 5 over 4 s inOutSine; contact shadow at 35% opacity; sub impact at the 8.0 s turn, 250 ms silence before it.

3. **UI demo (9:16, 12-17 s).** Phone UI fills 78% of frame width inside a code-drawn device frame; tap dot 44 px presses the primary button at 12.6 s (scale 0.96 in 80 ms, spring back stiffness 400, damping 25); a sheet slides up to 45% height with spring stiffness 300, damping 30; three result rows insert with 60 ms stagger, 300 ms outCubic; all text sits between 14% and 72% of frame height; UI tick panned to the button's x.

4. **Proof stat (1:1, 17-21 s).** Hero number counts from 0 to 3.2x over 1.2 s outExpo in tabular figures at 22% frame height, centered at 47% height; before bar (gray, 40%) and after bar (accent, 85%) grow beneath with 120 ms stagger, 700 ms outCubic, no overshoot; label at 3.5% frame height; hold 2.0 s; contrast at least 7:1.

5. **Feature-to-feature transition (16:9, on beat at 16.0 s).** Shot B pushes shot A left by 100% frame width over 550 ms inOutExpo with 8-subframe 180-degree motion blur; a whoosh pans -0.6 to +0.6 peaking at 150 ms; the incoming title starts its baseline mask rise 200 ms after the push lands, 60 ms word stagger, 520 ms outExpo.

6. **End card (4:5, last 4 s).** Logo lockup centered at 47% height, 22% frame width, built with a 1.5 s logo sting (strokes draw 600 ms, fill snaps at 700 ms with FM chime); tagline rises 24 px from its baseline mask at +0.4 s, 520 ms outExpo; CTA fades in at +0.9 s with a 300 ms underline draw; all motion settles by 2.5 s before the end, the final 0.5 s is fully static, and the audio tail reaches -60 dB on the last frame.
