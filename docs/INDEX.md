# Effect library — 108 launch-film effects

Each effect: live preview in `previews/<id>.mp4`, source in `engine/web/effects/<category>/<name>.js`, full prompt in `index.json`.

## Hooks (9)

| id | Name | Seconds | What the viewer sees | Best for |
|---|---|---|---|---|
| `hook.countdown` | Countdown | 4.6 | Digits 3-2-1-0 trace in as outlines and fill on a ticking 60-tick dial; zero collapses into a point that blooms into the logo and wordmark, which hold to the end. | cold open, launch tease, reveal |
| `hook.myth-fact-flip` | Myth / Fact | 5 | A Myth card is readable from frame 0; it winds up, flips in perspective with a lift and shading, and lands on the Fact side with an accent tag that pops in; holds on the fact. | cold open, objection handling, reframe |
| `hook.notification-flood` | Notification Flood | 5 | Notification cards (icon, title, line, time) spring onto the frame at an accelerating rate until it is full, freeze, then blow outward and leave the headline alone on a clean frame; holds on the headline. | cold open, pain point, noise vs calm |
| `hook.number-slam` | Number Slam | 4 | A giant stat counts up fast while scaling toward camera, lands with an overshoot impact and a short shake, then its label tucks in beneath; holds, then shrinks away in the last 0.45 s. | cold open, traction hook, big stat |
| `hook.pixel-zoom-out` | Zoom From a Pixel | 4.8 | One glowing accent pixel; the camera pulls out ~25x through a cell grid until the headline appears as lit cells, which then resolve into crisp type with the accent full stop. Holds on the headline. | cold open, detail-to-big-picture, headline reveal |
| `hook.price-strike` | Price Strike | 4.2 | The old price/timeline is slashed by a tapered marker stroke, shrinks to grey, and the new value springs up beneath; holds on the clean pair, then lifts away in the last 0.4 s. | cold open, before/after claim, pricing hook |
| `hook.question-type` | Question Type-on | 4.8 | copy.question types character by character over its own faint ghost with a caret, then the last word turns accent with an underline sweep; holds on the clean question. | cold open, question hook, problem statement |
| `hook.search-query` | Search Query | 4.8 | A search bar types the query, four suggestion rows drop down, and a highlight steps down to settle on the brand row (logo, name, tagline) with an Enter hint; holds on that state. | cold open, problem/solution, discovery |
| `hook.split-contrast` | Split Contrast | 4.4 | Two panels, before vs after (copy.before / copy.after), split 50/50 from frame 0; the divider then slides so the after side takes 70% of the frame and its value grows. Holds on the final split. | cold open, before/after, time saved |

## Logo reveals (9)

| id | Name | Seconds | What the viewer sees | Best for |
|---|---|---|---|---|
| `logo.glass-bevel` | Glass Bevel | 5 | The mark appears as thick tinted glass on a slow 3D tilt, refracting the hairline backdrop, with a bevel highlight and a moving specular band; it settles, glides left and the wordmark joins. | premium brand reveal, hardware or design-led launch, end card |
| `logo.grid-snap` | Grid Snap | 4.4 | Square tiles cut from the mark fly in from scattered positions and snap into place in stepped diagonal waves; the wordmark snaps in beside it and the lockup holds. | opening ident, tech brand reveal, end card |
| `logo.ink-bloom` | Ink Bloom | 4.8 | Noise-edged ink blobs in the brand colours bloom outward from the mark; a lagging clear bloom eats them from inside, uncovering the mark, then the wordmark joins and the lockup holds. | creative brand reveal, organic or design-led brands, opening ident |
| `logo.light-sweep` | Light Sweep | 4.2 | A tilted specular band crosses a barely-visible lockup, lighting mark and wordmark in its wake; a top-left rim light lands last and the lockup holds. | opening ident, end card, premium reveal |
| `logo.liquid-fill` | Liquid Fill | 4.8 | A hairline outline of the mark fills from the bottom with a two-layer wavy liquid surface that settles flat; the mark lifts and the wordmark rises beneath it, then holds. | playful brand reveal, end card, product with flow or energy |
| `logo.orbit-lock` | Orbit Lock | 4.6 | Three perspective rings with travelling beads orbit and collapse inward until they coincide and lock with a pulse; the mark appears at the lock, the ring fades and the wordmark joins. | tech brand reveal, platform or network product, opening ident |
| `logo.particle-assemble` | Particle Assemble | 4.2 | A cloud of particles converges into the logo, which resolves solid and is joined by the wordmark. | opening ident, end card, brand reveal |
| `logo.shard-assemble` | Shard Assemble | 4.6 | Triangular shards of the mark tumble in from depth with perspective shading and lock together at one instant with a soft flash; the mark glides left and the wordmark joins, then holds. | opening ident, bold brand reveal, chapter opener |
| `logo.stroke-draw` | Stroke Draw | 4.7 | Each outline of the mark draws on with a glowing lead point, a soft diagonal wipe fills it, then the wordmark rises letter-staggered beside it and the lockup holds. | opening ident, end card, brand reveal |

## Kinetic type (9)

| id | Name | Seconds | What the viewer sees | Best for |
|---|---|---|---|---|
| `type.baseline-rise` | Baseline Rise | 3.6 | Each word slides up from behind its own baseline mask with a short stagger, holds, then lifts away. | headline, chapter title, value proposition |
| `type.beat-words` | Beat Words | 4.7 | The headline plays one big word per beat on a 120 BPM grid; after a one-beat rest the final word lands in accent, holds, then lifts out in the last 0.4 s. | hook, manifesto line, music-cut opener |
| `type.echo-stack` | Echo Stack | 4.4 | Outlined copies of the headline fan out above and below it, receding in depth, then collapse back into the centre line, which fills solid as they land; the solid line holds to the end. | headline, emphasis beat, chapter title |
| `type.highlighter` | Highlighter | 4.4 | The headline settles and holds; an accent band then sweeps under the key phrase and the phrase inverts to the background colour on the band while the rest of the line recedes slightly; the composition holds to the end. | headline, key message, quote emphasis |
| `type.oversize-pan` | Oversize Pan | 5 | A single word several times larger than the frame pans slowly across it, cropped on purpose; its enclosed counters are filled with the accent gradient so the crop reads as brand-coloured shapes. Continuous drift, no exit. | brand interstitial, section opener, texture behind VO |
| `type.scramble-decode` | Scramble Decode | 4.2 | Monospaced placeholder characters cycle in every letter slot, then resolve left to right into the display-set headline with a brief accent flash per glyph; the clean line holds to the end. | headline, tech reveal, product name |
| `type.split-flap` | Split Flap | 4.4 | A split-flap board riffles every tile through its character drum, left to right and row by row, until the headline is spelled out; the last word lands in accent and the board holds to the end. | headline, announcement, launch date |
| `type.tracking-breathe` | Tracking Breathe | 5 | Widely tracked capitals contract to a tight display setting as they fade up from the centre outward; the line then breathes gently in its tracking while the supporting line settles beneath, held to the end. | headline, premium title card, tagline |
| `type.weight-morph` | Weight Morph | 4.6 | A hairline headline gains weight word by word while its tracking tightens; then one emphasis word swells to heavy in the accent colour and the line holds to the end. | headline, brand statement, emphasis |

## Product UI (9)

| id | Name | Seconds | What the viewer sees | Best for |
|---|---|---|---|---|
| `ui.bento-build` | Bento Build | 4.8 | Six bento tiles (hero, stat, four features) spring in with a stepped stagger, icons draw on and labels settle; holds on the complete grid. | feature overview, what is new, product summary |
| `ui.chat-thread` | Chat Thread | 6.2 | A message is typed and sent, a three-dot typing indicator pulses, and the assistant reply streams word by word into a growing bubble with a feature checklist; holds at the end. | AI assistant, chat feature, copilot demo |
| `ui.cursor-walkthrough` | Cursor Walkthrough | 5 | A pointer glides on a bezier to a button, hovers, clicks with a ripple, and the card switches to its published state with a toast; holds on the final state. | feature demo, one-click flow, product walkthrough |
| `ui.phone-orbit` | Phone Orbit | 5 | A code-drawn phone swings in with a 3D yaw (perspective slab with visible edge) while its app home screen animates to life; holds on a slow drift. | mobile app launch, hero device, app showcase |
| `ui.scroll-reel` | Scroll Reel | 6.4 | A landing page scrolls inside a phone in two inertial flicks with layered parallax and velocity-trailing cards; holds on the final CTA section. | landing page, mobile site, website launch |
| `ui.state-morph` | State Morph | 7.8 | A single container morphs button to card to modal to toast, changing size, radius, fill and content without a cut (content fades through between states, never reflowing mid-move); holds on the toast. | interaction flow, design system, product polish |
| `ui.terminal-run` | Terminal Run | 5.4 | A command types into a code-drawn terminal, steps stream and resolve, a progress bar fills and a green check lands on the live URL; holds on the result. | developer tool, CLI launch, deploy flow |
| `ui.window-tilt` | Window Tilt | 4.8 | A code-drawn browser window rotates from a steep 3D tilt to flat while its dashboard blocks cascade in; holds on the clean final composition. | product reveal, hero UI, dashboard intro |
| `ui.zoom-to-feature` | Zoom to Feature | 5.2 | A dashboard assembles, the camera pushes into one card while the rest blurs and dims, the card comes alive and a feature label pops beneath; holds at the end. | feature focus, metric highlight, dashboard tour |

## Feature callouts (9)

| id | Name | Seconds | What the viewer sees | Best for |
|---|---|---|---|---|
| `feature.before-after-wipe` | Before/After Wipe | 5 | A pointer drags a divider handle across a panel, wiping a grey cluttered "before" UI into the clean accented "after"; holds on the after state. | transformation, old way vs new way, redesign |
| `feature.callout-lines` | Callout Lines | 5.6 | Hairline leader lines draw one by one from pulsing anchor dots on a UI mock out to numbered feature labels; holds on the annotated mock. | feature tour, annotated screenshot, anatomy of the product |
| `feature.card-carousel` | Card Carousel | 6.8 | Feature cards on a cylinder carousel spin in and step through three stops; the card at the front lights up (accent border, icon, mini-visual) and its label reads, with pagination dots tracking the stop; ends with a short spin-and-fade exit. | feature tour, product overview, capabilities list |
| `feature.checklist` | Checklist | 5 | Checklist rows appear, then get checked one by one (box fills, check draws on, row slides slightly); the last item lands in the accent; holds on the finished list. | what is included, launch readiness, requirements met |
| `feature.icon-grid` | Icon Grid | 4.4 | Four to six line icons draw on with a stroke animation in a staggered grid, each tile warming to the accent, labels beneath; holds on the grid. | feature list, capabilities, what is included |
| `feature.magnifier` | Magnifier | 5.6 | A circular glass lens glides over dense UI and reveals 2.2x magnified, readable detail inside it at three stops; holds on the last stop. | detail shot, power features, under the hood |
| `feature.spotlight` | Spotlight | 6.4 | The UI dims except a soft-edged spotlight that travels and reshapes between three regions while a caption card follows; holds on the last stop. | guided tour, feature focus, onboarding |
| `feature.steps-123` | Steps 1-2-3 | 5 | Three numbered steps light up in turn as an accent fill travels the connecting line; finished steps become checks; holds on the final step. | how it works, onboarding, process |
| `feature.toggle-flip` | Toggle Flip | 4.2 | A large toggle flips with a spring (stretching knob) and a circular colour wave repaints the scene from off-grey to the brand accent; holds on the on state. | turn it on, feature switch, before/after moment |

## Data & proof (9)

| id | Name | Seconds | What the viewer sees | Best for |
|---|---|---|---|---|
| `data.bar-rise` | Bar Rise | 5 | Bars grow from a zero baseline with staggered counts; the brand bar wins in accent while the rest dim, holds, then bars retract in the last 0.45 s. | comparison, benchmark, proof |
| `data.counter-roll` | Odometer Stats | 4.4 | Rolling-digit counters land on your real metrics one after another, labels settle underneath. | traction, proof, results |
| `data.donut-fill` | Donut Fill | 4.8 | A track ring draws, the accent arc sweeps to the percentage while the centre number counts and outer ticks light; a legend settles, holds, then the ring fades and eases back in the last 0.45 s. | share, rate, proportion |
| `data.dot-globe` | Dot Globe | 5.4 | A slowly turning dot-sphere globe resolves, pins rise with pulse rings, two lifted arcs travel between them while the reach number settles; holds, then fades in the last 0.45 s while still turning. | global reach, scale, network |
| `data.kpi-tiles` | KPI Tiles | 4.8 | Metric tiles spring in staggered; values count, delta chips pop and sparklines draw; holds, then tiles drop away in sequence over the last 0.5 s. | dashboard, traction, proof |
| `data.line-draw` | Line Draw | 5.4 | A smooth growth line draws across a zero-based chart with a glowing lead dot; area fill fades in beneath and a milestone card pins at the end, holds, then everything fades down in the last 0.45 s. | growth, traction, momentum |
| `data.milestone-stairs` | Milestone Stairs | 6 | A stepped accent path climbs with a glowing head while the camera follows upward; flags with dates and milestones pop at each step and the top step lands the copy.stats number; holds, then fades in the last 0.45 s. | journey, timeline, momentum |
| `data.rank-race` | Rank Race | 5.6 | Horizontal bars on a fixed zero baseline animate through sample periods, rows glide past each other as values change and the brand climbs to #1 with a lit badge; holds, then bars retract over the last 0.45 s. | competitive, momentum, leaderboard |
| `data.unit-dots` | Unit Dots | 4.8 | An empty 10x10 dot grid ripples in, dots fill bottom-up one per percent while the number counts, a wave rolls through the filled block; holds, then fades and settles in the last 0.45 s. | proportion, share, adoption |

## Social proof (9)

| id | Name | Seconds | What the viewer sees | Best for |
|---|---|---|---|---|
| `social.avatar-crowd` | Avatar Crowd | 5 | Fictional initials avatars pop into a growing golden-angle ring, accelerating outward, while the centre count climbs in step and lands on the copy.stats number with its label; a soft pulse rolls through the crowd; holds, then fades in the last 0.45 s. | community, adoption, waitlist |
| `social.case-flip` | Case Flip | 5.4 | A fictional customer card rises in showing company and its "before"; it flips in 3D (squash, shading, shadow stretch) to the result side where the copy.stats metric counts up beside the "after"; holds, then sinks and fades in the last 0.45 s. | case study, results, customer story |
| `social.logo-wall` | Logo Wall | 5 | A hairline grid of fictional geometric company marks ripples in from the centre under a headline; one dashed cell fills with an accent glow reading "Your team" while the rest dim slightly; holds, then fades in the last 0.45 s. | social proof, customers, trust |
| `social.post-cascade` | Post Cascade | 5.6 | Two parallax columns of fictional social posts stream downward and ease to a stop; the centred hero post gets a like (heart fills, count rolls); holds, then fades in the last 0.45 s. | social proof, community, buzz |
| `social.press-ticker` | Press Ticker | 6 | Serif pull-quotes attributed to invented publications drift across a hairline-ruled band at constant speed; glyphs dissolve at the edges and the quote passing centre brightens; fades in over 0.6 s and out in the last 0.45 s. | press, credibility, buzz |
| `social.quote-card` | Quote Card | 5.4 | A large quote mark strokes on and fills, quote lines rise from line masks with a stagger, then an initials avatar with name and role slides in; holds, then lines lift away and the rest fades in the last 0.5 s. | testimonial, social proof, customer voice |
| `social.review-marquee` | Review Marquee | 5.6 | Rows of fictional review cards scroll in opposite directions with faded frame edges, slow down, and one card lifts to centre at ~1.4x while the others dim; holds, then fades in the last 0.45 s. | reviews, social proof, testimonials |
| `social.star-rating` | Star Rating | 4.6 | Outlined stars rise in, a single accent sweep fills them to the rating (partial last star) while the score counts and each star pulses as it fills; the review count line follows; holds, then fades in the last 0.45 s. | ratings, reviews, social proof |
| `social.wall-zoom` | Wall Zoom | 5.6 | A wall of tiny skeleton testimonial cards ripples in, the camera dives into one card with an exponential zoom while the wall dims, and the card resolves into the real quote, name and role; holds, then fades in the last 0.45 s. | social proof, volume of love, testimonial |

## Transitions (9)

| id | Name | Seconds | What the viewer sees | Best for |
|---|---|---|---|---|
| `transition.iris` | Iris | 1.2 | A circular aperture closes onto A's focal point (A pushes in 6%), holds shut for about 70 ms, then opens from B's focal point as B settles from 106%; a thin accent ring rides the aperture edge. | chapter break, focus on a detail, playful reset |
| `transition.light-flash` | Light Flash | 0.9 | A over-exposes (self-added highlights plus a centred bloom) to a near-white peak tinted by the accent; B is swapped in under the peak and develops out of the exposure. | big reveal, logo hit, energy beat |
| `transition.liquid-wipe` | Liquid Wipe | 1.2 | A wavy, noise-displaced edge sweeps up the frame revealing B beneath it, led by a translucent accent band; wave height swells mid-move and calms at the ends. | soft scene change, fluid brand moment, lifestyle cut |
| `transition.mask-wipe` | Mask Wipe | 1 | A tilted, soft-edged wipe crosses the frame left to right with a thin accent line on its leading edge; A drifts back slightly while B settles from a 4% over-scale. | section change, before to after, fast cut with polish |
| `transition.object-bridge` | Object Bridge | 1.2 | A rounded card holding a miniature of B pops up at the centre of A, then expands to full frame while its corners square off; A recedes and dims behind it. | product to detail, scene change with continuity, app open |
| `transition.pixel-dissolve` | Pixel Dissolve | 1.1 | A mosaics into growing square blocks in discrete steps; the blocks switch from A to B in an 8x8 ordered-dither order; B then resolves back to full sharpness. | tech / digital cut, data to product, playful change |
| `transition.shape-morph` | Shape Morph | 1.3 | A circular window onto B opens at the centre of A, morphs smoothly into a rounded rectangle, then expands to fill the frame; B de-zooms slightly inside the mask. | reveal, chapter change, logo to scene |
| `transition.shared-axis-push` | Shared-Axis Push | 0.95 | B slides in from the right as a shadowed card while A parallaxes left at 32% speed, scales to 94%, rounds its corners and dims beneath it. | next step, sequence of features, story progression |
| `transition.zoom-through` | Zoom Through | 1 | A accelerates toward the camera (scale up to 2.6x) and fades while thin radial streaks sweep outward; B grows in from 90% and settles at full size. | energy cut, into the product, act change |

## Backgrounds (9)

| id | Name | Seconds | What the viewer sees | Best for |
|---|---|---|---|---|
| `background.aurora` | Aurora | 10 ↻ | Three rayed light curtains sway slowly in the upper sky in brand hues; seamless loop with a headline held in the calm lower sky. | backdrop, title card, launch teaser |
| `background.contours` | Contours | 12 ↻ | Topographic iso-lines of a slowly evolving height field, with index contours and one accent elevation line; seamless loop with the headline on top. | backdrop, title card, data / mapping themes |
| `background.depth-field` | Depth Field | 10 ↻ | A point volume drifts toward the camera with depth-of-field: crisp at the focus plane, soft bokeh near the lens; seamless loop with the headline on top. | backdrop, title card, intro |
| `background.dot-parallax` | Dot Parallax | 8 ↻ | Three rotated dot lattices drift at depth-scaled speeds under an orbiting key light; seamless loop with the headline held on top. | backdrop, title card, section divider |
| `background.flow-lines` | Flow Lines | 10 ↻ | Fine streamlines follow a curling flow field like combed silk; an anisotropic sheen rolls across them as the weave sways; seamless loop with the headline on top. | backdrop, title card, premium texture |
| `background.fog-noise` | Fog Noise | 12 ↻ | Two parallax layers of soft fog drift and re-form, side-lit by an accent key light from the left; seamless loop with the headline on top. | backdrop, title card, moody intro |
| `background.glass-blobs` | Glass Blobs | 12 ↻ | Frosted glass blobs merge and drift over soft colour light, bending it with refraction and catching a rim highlight; seamless loop with the headline on top. | backdrop, title card, product hero |
| `background.gradient-mesh` | Gradient Mesh Drift | 6 ↻ | Three or four brand-coloured light fields drift and blend; seamless loop, made for sitting behind titles. | backdrop, title card, hero loop |
| `background.horizon-grid` | Horizon Grid | 8 ↻ | A hairline floor grid recedes into haze and a soft accent horizon glow while scrolling forward; seamless loop with the headline above the horizon. | backdrop, title card, product intro |

## 3D heroes (9)

| id | Name | Seconds | What the viewer sees | Best for |
|---|---|---|---|---|
| `hero3d.cube-wave` | Cube Wave | 5.4 | An isometric grid of columns rises in a ripple from the centre, rolls as a travelling wave with accent crests, calms from the centre outward into a seamless flat plane, then the mark rises out of the plane as a solid slab under a sweeping light ring; ends with a short drop-and-fade exit. | platform / foundation story, brand reveal, section opener |
| `hero3d.exploded-layers` | Exploded Layers | 6 | A UI card tilts into isometric view, separates into labelled layers along depth, holds, then recomposes and returns to a clean front view, which it holds to the end. | how it is built, design system, product architecture |
| `hero3d.extruded-type` | Extruded Type | 5 | The headline extrudes into a solid block, swings gently in yaw so its side walls turn and its face catches a passing highlight, then exits with a short drop-and-fade. | headline, chapter title, hero statement |
| `hero3d.glass-stack` | Glass Stack | 5 | Four translucent glass panes rise in as a tight stack, fan apart, settle and catch a sweeping highlight; the top pane carries the mark. Ends with a short drop-and-fade exit. | platform / layers story, hero object, brand reveal |
| `hero3d.holo-panel` | Holo Panel | 5 | A translucent panel unfolds from a bright line, sways gently in 3D with quiet scanlines and an edge light, and a scan wipe reveals the headline and sub line; folds back into the line to exit. | headline, feature announcement, AI / future themes |
| `hero3d.orbit-cards` | Orbit Cards | 5.5 | The mark appears, then feature cards slide out onto a tilted orbit around it and circle slowly with depth scale and dimming; ends with the cards collapsing inward and fading. | feature overview, platform story, integrations |
| `hero3d.particle-sphere` | Particle Sphere | 5.5 | A depth-shaded sphere of points rotates and breathes, then folds point by point into the logo, which resolves solid; ends with a short fade. | brand reveal, opening ident, AI / data themes |
| `hero3d.pedestal-sweep` | Pedestal Sweep | 5.5 | The mark, as a thick plate, settles onto a lit pedestal while a rim light sweeps around the set, running along the pedestal edge and glinting off the plate; holds, then dims out. | brand reveal, product hero, end card |
| `hero3d.ribbon-flow` | Ribbon Flow | 5 | A wide brand-gradient ribbon draws itself across the frame, twisting and catching a specular highlight as a wave travels along it, then draws off to the right. | transition moment, brand texture, hero backdrop |

## Offers & CTAs (9)

| id | Name | Seconds | What the viewer sees | Best for |
|---|---|---|---|---|
| `cta.button-press` | Button Press | 4.4 | copy.cta button springs in, is hovered and pressed by a pointer (depress + ripple), then collapses into a circle whose check draws on, with a pulse ring and a short confirmation line; holds. | call to action, sign-up, end card |
| `cta.date-lockup` | Date Lockup | 4.6 | A calendar tile rises; its accent month band flips down, day pages tear upward three times, decelerating onto copy.launchDate's day; the tagline rises beneath. Holds on the lockup. | launch date, event, end card |
| `cta.end-lockup` | End Lockup | 4.2 | Mark scales in, the wordmark slides out from behind it, the tagline rises word by word and a URL pill lands; micro-staggered, then holds under a 2.5% slow push. | end card, closing frame, sign-off |
| `cta.free-stamp` | Free Stamp | 4 | A double-bordered stamp ("FREE" or copy.stamp) falls from 2.4x scale, hits with a squash, 120 ms shake and ink ring, leaving a textured, rotated impression; copy.sub fades up beneath. Holds. | offer, free plan, end card |
| `cta.launch-countdown` | Launch Countdown | 5 | Split-flap DD:HH:MM:SS tiles rise in, roll onto the start time, then tick each second with true top/bottom flap flips (seconds wrap into minutes); "Launching <copy.launchDate>" sits above. Holds. | launch tease, event date, end card |
| `cta.plan-cards` | Plan Cards | 4.8 | Three plan cards rise in staggered; the middle (copy.price) card lifts, scales, gets an accent border and a "Most popular" chip while the others dim; holds on that state. | pricing, offer, plan comparison |
| `cta.price-reveal` | Price Reveal | 4.2 | Plan chip rises, the price slams down from 1.25x with odometer digits rolling to copy.price.amount, currency and period slide in, a "per month" line settles; holds on the clean lockup. | pricing, offer, end card |
| `cta.url-type` | URL Type-on | 4.4 | The domain (copy.url) types into a big pill address bar under a short lead line; a pointer arcs in, hovers and clicks Go (press + ripple) and the pill glows accent. Holds on the lit pill. | end card, call to action, visit site |
| `cta.waitlist-counter` | Waitlist Counter | 4.8 | Initial-avatars pop into an overlapping stack while a tabular counter climbs to copy.waitlist ("N people on the waitlist"; falls back to the first copy.stats entry and its label), a "+N" bubble caps the stack and a "Join them" button springs in; holds. | waitlist, social proof, end card |

## Loops & social formats (9)

| id | Name | Seconds | What the viewer sees | Best for |
|---|---|---|---|---|
| `loop.badge-pulse` | Badge Pulse | 3.2 ↻ | A static feature-name lockup with an accent "NEW" pill that beats twice per loop (scale tick plus two pill-shaped ring waves rippling out and fading) and catches one specular glint; static camera, seamless loop. | feature announcement, changelog post, social loop |
| `loop.caption-burst` | Caption Burst | 6 ↻ | Headline word-groups pop onto stacked lines with a short stagger, the keyword gets a tilted accent highlight box, the caption holds, lifts away and the loop restarts; frame 0 shows the full caption. | vertical social video, reel caption, hook line |
| `loop.expectation-reality` | Expectation vs Reality | 6 ↻ | Left panel: a chaotic grey Gantt that slips and stretches past its deadline with blinking warnings and copy.before; right panel: three clean tasks fill in the accent and land a check with copy.after; seamless loop. | social comparison post, problem / solution beat, before and after |
| `loop.logo-loop` | Logo Loop | 6 ↻ | The centred mark flips like a coin three times per loop; at each edge-on moment a new colourway (brand, accent, inverse) expands from behind it as a circular wipe; seamless 6 s loop with a static camera. | social avatar loop, GIF ident, end card loop |
| `loop.quad-loop` | Quad Loop | 4 ↻ | Four feature tiles in a 2x2 grid each run a synced mini-animation (chasing progress ring, pointer click with ripple, feed stepping up, approvals ticking in) under their labels; seamless 4 s loop. | feature overview loop, social grid post, product summary |
| `loop.sticker-pop` | Sticker Pop | 6 ↻ | Die-cut stickers (mark + icon/word features) spring onto the frame with small tilts and a white border, hold, then peel off corner-first with a folding backing flap; seamless loop, frame 0 is the full board. | playful social loop, feature list with personality, launch teaser |
| `loop.story-bars` | Story Bars | 7.2 ↻ | Four story-style progress segments fill in turn while four feature cards (icon, index, name) push through one by one; the bars drain during the final push so the loop is seamless. | vertical social video, feature tour, story ad |
| `loop.swipe-carousel` | Swipe Carousel | 7.2 ↻ | Four square slides (brand, headline, key stat, call to action) swipe horizontally on an endless ring with peeking neighbours and a stretching pagination pill; each slide holds 1.2 s; seamless loop. | carousel-style social post, feed video, product summary |
| `loop.ticker-tape` | Ticker Tape | 6 ↻ | Two tilted marquee bands (accent and inverse) carrying the brand name and features, separated by the mark, cross in an X and scroll in opposite directions forever; seamless loop. | social loop, event or launch hype, section break |
