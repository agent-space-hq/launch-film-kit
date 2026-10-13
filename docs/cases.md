# Claude Opus 5.5 code-rendered videos on X: case library

Window: 2026-09-22 (Opus 5.5 release) to 2026-10-12. Metrics are from api.fxtwitter.com, fetched 2026-10-11/12 (raw JSON cached in `raw/fx/`). Machine-readable version: `cases.json`.

**Method.** 4,050 candidate post IDs were pooled from 15 sources: the yihui-dev, athemeroy, joeseesun and zhuyansen repos; the OpenChamber, claudevideo.org and skillry aggregators; and roundup threads. All 4,050 were fetched: 3,987 were live and 63 were deleted or protected. Of the live posts, 3,199 in-window videos mention Opus or Claude and are not games. They were ranked by:

`score = 0.4*log10(views)/7 + 0.35*log10(bookmarks)/4.5 + 0.25*log10(likes)/5`

About 550 of the top-ranked posts, plus launch and brand keyword hits from deeper in the list, were reviewed by hand. I excluded:
- posts made mainly with AI video models (Seedance, Runway, Higgsfield video);
- games;
- other Claude models (Fable, Sonnet or Haiku 5.5);
- posts whose Opus attribution was unclear;
- paid ads.

The final set is 125 video cases plus 29 resource-share posts. Each required category has a guaranteed minimum; logo-reveal is the exception, with only 4 qualifying posts found. Launch and brand formats get extra slots. All "One-line" and "What to learn" text is my own. Prompts are linked, never copied. In the tables, "prompt link" means `prompt_location` in the JSON points to the post, an aggregator page or a repo where the prompt can be read.

**Coverage (cases.json):** product-launch 28 · brand-teaser 14 · logo-reveal 4 · saas-ui-demo 7 · kinetic-typography 6 · data-viz 6 · explainer 17 · 3d-scene 8 · music-video 14 · showreel 11 · story-animation 6 · generative-art 4 · resource-share 29.

**Median views by category (curated set):** music-video 773K · showreel 572K · 3d-scene 465K · explainer 425K · saas-ui-demo 370K · data-viz 274K · kinetic-typography 133K · product-launch 130K · resource-share 75K · brand-teaser 64K · logo-reveal 25K. Bookmark-to-like is highest for resource-share (1.66), showreel (1.15), product-launch (1.13) and saas-ui-demo (1.02). These are the formats people save to copy.

The `#` column is the overall rank within cases.json.

## Product launch (28)

| # | Post | Views | Bookmarks | What to learn |
|---|---|---|---|---|
| 2 | [@claudeai](https://x.com/claudeai/status/2108271552991252810): Anthropic's own launch film for Claude Motion and Dashboards beta. <sub>2026-10-08, 82s 16:9</sub> | 11.0M | 40K | A launch shows the product making the video; the medium proves the claim. |
| 20 | [@uxmiles](https://x.com/uxmiles/status/2104618175803609305): Design-studio founder admits a three-prompt launch film rivals studio work. <sub>2026-09-28, 15s 16:9</sub> | 1.8M | 4,707 | A reluctant-expert confession hook adds authority to a launch-video demo. |
| 38 | [@deedydas](https://x.com/deedydas/status/2102787937482252537): Launch video for an inference startup made in a minute for two dollars. <sub>2026-09-23, 26s 16:9 · prompt link</sub> | 349K | 4,696 | State the old cost versus new cost to make the value instantly obvious. |
| 64 | [@twoclipping](https://x.com/twoclipping/status/2103835273813496100): Launch video billed as zero cost and fully code. <sub>2026-09-26, 29s 1:1 · prompt link</sub> | 136K | 3,768 | Calling out competitors' gated prompts positions you as the generous source. |
| 86 | [@gauravsbuilding](https://x.com/gauravsbuilding/status/2104370091672711402): Launch film produced after a twelve-hour unattended run. <sub>2026-09-28, 15s 16:9</sub> | 427K | 1,172 | Long autonomous runtimes are a headline in themselves. |
| 91 | [@virgilerietsch](https://x.com/virgilerietsch/status/2107463995070291985): Launch video for a free open-source Mac cleanup utility. <sub>2026-10-06, 15s 16:9</sub> | 154K | 2,087 | Pair a free tool with a slick video; the reason-why list builds trust. |
| 92 | [@Miguel07Code](https://x.com/Miguel07Code/status/2102441708395041170): Launch video for a startup made in under twenty minutes. <sub>2026-09-22, 58s 16:9 · prompt link</sub> | 154K | 1,694 | Tagging the tool and the product spreads the post to both audiences. |
| 94 | [@joshaeeee](https://x.com/joshaeeee/status/2103386096411553888): Re-edit of an Instagram launch video, offered as a poll. <sub>2026-09-25, 25s 1:1</sub> | 164K | 1,338 | Asking viewers to pick a version invites replies. |
| 96 | [@trymirage](https://x.com/trymirage/status/2102502794003677373): Cost comparison of two models recreating a launch video. <sub>2026-09-22, 32s 4:5</sub> | 207K | 798 | Show costs on-screen to make comparisons concrete. |
| 97 | [@tdinh_me](https://x.com/tdinh_me/status/2103703135902740699): Product promo compared against a thousand-dollar freelance quote. <sub>2026-09-26, 15s 16:9 · prompt link</sub> | 195K | 1,047 | An old-price anchor is the clearest value proposition for founders. |
| 98 | [@LexnLin](https://x.com/LexnLin/status/2104148233106723099): Fake calendar app launch where name, logo, UI and soundtrack are all code. <sub>2026-09-27, 33s 16:9</sub> | 99K | 1,402 | A fictional product removes client constraints and showcases range. |
| 100 | [@kaolti](https://x.com/kaolti/status/2103481296018092204): Launch film for a product built in two prompts without references. <sub>2026-09-25, 40s 16:9 · prompt link</sub> | 81K | 1,812 | Claiming no references contrasts with reference-heavy workflows. |
| 101 | [@DanielSmidstrup](https://x.com/DanielSmidstrup/status/2104013515623170390): Startup promo made in twenty minutes without After Effects. <sub>2026-09-27, 30s 16:9</sub> | 112K | 1,214 | Name the replaced tool to define the value in one phrase. |
| 102 | [@LuxAlgo](https://x.com/LuxAlgo/status/2104668775798739107): Launch edit for an open-source trade journal. <sub>2026-09-28, 30s 16:9</sub> | 144K | 1,373 | Brands can use the model for quick edits of existing projects. |
| 107 | [@notdwd](https://x.com/notdwd/status/2103959324385300552): Rebuilt a known startup launch video for another brand, synced side by side. <sub>2026-09-26, 65s 16:9 · prompt link</sub> | 123K | 1,442 | Side-by-side sync proves fidelity and teaches reference-driven direction. |
| 112 | [@ann_nnng](https://x.com/ann_nnng/status/2103723183899852885): Product promo replacing a four-week freelancer back-and-forth. <sub>2026-09-26, 15s 16:9 · prompt link</sub> | 102K | 1,116 | Compare against a painful old process the audience recognizes. |
| 113 | [@jerryjliu0](https://x.com/jerryjliu0/status/2102479924032577686): Teaser for an open-source document-classification tool. <sub>2026-09-22, 31s 16:9</sub> | 93K | 1,223 | Founders with reach can launch with a model-made teaser same day. |
| 118 | [@shownotover](https://x.com/shownotover/status/2104124596957933687): Thirty-second product video on the cheapest paid plan. <sub>2026-09-27, 30s 16:9 · prompt link</sub> | 148K | 600 | Low-tier plan proof makes the result feel accessible. |
| 119 | [@samuel_spitz](https://x.com/samuel_spitz/status/2103293794594816100): Launch video made in under thirty minutes with a tool integration. <sub>2026-09-25, 28s 16:9 · prompt link</sub> | 64K | 987 | Tool-plus-model formulas in the hook attract both communities. |
| 120 | [@ajith_io](https://x.com/ajith_io/status/2103469807375208546): Forty-second product video after the model researched the product itself. <sub>2026-09-25, 40s 16:9 · prompt link</sub> | 108K | 849 | Letting the model research the brand removes the briefing step. |
| 122 | [@Tanjim38](https://x.com/Tanjim38/status/2102666513409036770): Product promo made in about an hour. <sub>2026-09-23, 111s 16:9</sub> | 105K | 804 | A direct call to designers sparks debate in replies. |
| 124 | [@javiiarchive](https://x.com/javiiarchive/status/2103501151438323850): Fifteen-second SaaS trailer. <sub>2026-09-25, 15s 16:9</sub> | 57K | 896 | Short trailers are the simplest launch asset to copy. |
| 125 | [@op7418](https://x.com/op7418/status/2103148288400924827): Promo film for a coding app, feeding into a product-video skill. <sub>2026-09-24, 50s 16:9</sub> | 181K | 579 | Turning wins into a reusable skill builds a following. |
| 126 | [@trymirage](https://x.com/trymirage/status/2103542300844474452): Editable motion piece with layer and animation counts. <sub>2026-09-25, 15s 16:9</sub> | 52K | 1,015 | Editable output answers the client-revision objection. |
| 128 | [@moritzkremb](https://x.com/moritzkremb/status/2103066071838466494): Model picked a SaaS and made a professional launch video. <sub>2026-09-24, 46s 16:9 · prompt link</sub> | 96K | 979 | Letting the model choose the subject proves autonomy. |
| 131 | [@israelfemiojo](https://x.com/israelfemiojo/status/2102642002613481939): Two models make a launch video for a rival's own product. <sub>2026-09-23, 40s 16:9</sub> | 199K | 307 | Making a competitor's launch video is cheeky and shareable. |
| 134 | [@gonahmias](https://x.com/gonahmias/status/2102893439159251247): Vertical promo for an expense app from one prompt. <sub>2026-09-23, 38s 9:16</sub> | 107K | 540 | Native-language creators can repeat a format for their market. |
| 136 | [@ultimaxbt](https://x.com/ultimaxbt/status/2108210884799549714): Single-take product launch film for a food-ordering idea. <sub>2026-10-08, 16s 16:9 · prompt link</sub> | 40K | 831 | One-continuous-take structure feels premium and cohesive. |

## Brand teaser / ad (14)

| # | Post | Views | Bookmarks | What to learn |
|---|---|---|---|---|
| 43 | [@runable_hq](https://x.com/runable_hq/status/2103501063202771440): Near frame-accurate remake of the official Opus launch promo. <sub>2026-09-25, 23s 1:1</sub> | 1.5M | 1,113 | Remaking a famous brand film invites direct comparison and curiosity. |
| 45 | [@VictorTaelin](https://x.com/VictorTaelin/status/2104568082169749982): Title-sequence intro for a programming language. <sub>2026-09-28, 90s 4:3</sub> | 401K | 1,837 | An intro for your own project is a natural, credible brand-teaser format. |
| 55 | [@lucian__03](https://x.com/lucian__03/status/2103494418477260830): Product-style film diving into a GPU and data center. <sub>2026-09-25, 49s 0.86:1</sub> | 334K | 2,056 | Spec-film tributes to famous hardware show brand-film skills without a client. |
| 99 | [@gastypm](https://x.com/gastypm/status/2102863204472799549): Airline marketing email turned into a punchy vertical ad. <sub>2026-09-23, 20s 9:16</sub> | 151K | 989 | Repurposing a real brand email demonstrates instant ad creation. |
| 109 | [@notdwd](https://x.com/notdwd/status/2104401208958230764): Rebuilt a creator's brand motion to argue for taste and references. <sub>2026-09-28, 12s 16:9 · prompt link</sub> | 63K | 1,767 | A contrarian STOP opener paired with proof drives saves. |
| 110 | [@LexnLin](https://x.com/LexnLin/status/2106101651010449796): Claude makes its own ad in vertical format. <sub>2026-10-02, 14s 9:16 · prompt link</sub> | 83K | 1,112 | Self-promotion by the model is a neat meta brand-teaser. |
| 111 | [@achxvi](https://x.com/achxvi/status/2104118566450593880): Vertical motion promo tagged to the model's brand account. <sub>2026-09-27, 42s 9:16</sub> | 86K | 1,113 | Tagging the brand can earn reposts and extra reach. |
| 130 | [@twoclipping](https://x.com/twoclipping/status/2106526359589675085): Brand film template anchored against a two-thousand-dollar studio price. <sub>2026-10-03, 22s 1:1 · prompt link</sub> | 40K | 1,364 | Drop-your-brand-in templates turn a demo into a utility. |
| 132 | [@Lucas_IA_](https://x.com/Lucas_IA_/status/2103152093733253544): Tutorial on making near-free ads with code and voiceover. <sub>2026-09-24, 72s 9:16</sub> | 64K | 1,149 | Cost-per-ad framing appeals to marketers. |
| 140 | [@PancaSeptiana](https://x.com/PancaSeptiana/status/2103024285174673413): Animated brand guideline presentation. <sub>2026-09-24, 14s 4:3</sub> | 41K | 557 | Brand systems in motion are a new deliverable to showcase. |
| 146 | [@ladprofit](https://x.com/ladprofit/status/2103148835270971419): Animated ad for a coffee brand with no image or video generation. <sub>2026-09-24, 55s 9:16</sub> | 24K | 339 | Testing on a real consumer brand shows ad potential. |
| 147 | [@davidmarcus](https://x.com/davidmarcus/status/2103275618045686217): Punchy vertical social promo for a fintech brand. <sub>2026-09-25, 23s 9:16 · prompt link</sub> | 26K | 276 | A founder-level account sharing a five-minute result gives social proof. |
| 148 | [@bridgemindai](https://x.com/bridgemindai/status/2102462889160286423): Merch launch video built with Remotion. <sub>2026-09-22, 30s 16:9 · prompt link</sub> | 33K | 127 | Merch drops are a lightweight brand-film use case. |
| 149 | [@ajaypv4](https://x.com/ajaypv4/status/2103061895725080692): Model recreates its own launch video from scratch. <sub>2026-09-24, 20s 16:9</sub> | 45K | 119 | Recreating famous launch films is a recurring viral format. |

## Logo reveal (4)

| # | Post | Views | Bookmarks | What to learn |
|---|---|---|---|---|
| 145 | [@tdinh_me](https://x.com/tdinh_me/status/2103704250329301409): Slow-reveal transition that assembles a product logo. <sub>2026-09-26, 21s 16:9 · prompt link</sub> | 24K | 420 | A short reusable logo-reveal prompt is very easy to copy. |
| 152 | [@_3912657840](https://x.com/_3912657840/status/2103417471063736729): Particles flowing from a logo into a helix and a figure in Unity. <sub>2026-09-25, 7s 16:9</sub> | 24K | 105 | Particle morphs are a classic logo-reveal technique. |
| 153 | [@fire_ozgur](https://x.com/fire_ozgur/status/2103459971174130104): Intro video built from just a logo upload. <sub>2026-09-25, 15s 4:5 · prompt link</sub> | 27K | 67 | A logo is enough input for an intro. |
| 154 | [@nusretuzman](https://x.com/nusretuzman/status/2103582679358718050): Short JSON-based brand animation offered to followers. <sub>2026-09-25, 4s 1:1</sub> | 26K | 67 | Offering to brand followers converts reach into leads. |

## SaaS / UI demo (7)

| # | Post | Views | Bookmarks | What to learn |
|---|---|---|---|---|
| 4 | [@DilumSanjaya](https://x.com/DilumSanjaya/status/2106426962738880879): Warehouse management software reimagined as a strategy-game interface. <sub>2026-10-03, 72s 16:9</sub> | 2.3M | 20K | Reframe a dull B2B category with a playful metaphor; the contrast line does the selling. |
| 8 | [@twoclipping](https://x.com/twoclipping/status/2103273003555402193): Square UI-morph launch reel, pure code, with an open-sourced prompt template. <sub>2026-09-24, 14s 1:1 · prompt link</sub> | 1.2M | 21K | Offering the reusable template drove a 1.7 bookmark-to-like ratio. |
| 14 | [@cambreedesigns](https://x.com/cambreedesigns/status/2104999693113766152): Portfolio site for a merch brand, built in three prompts and screen-recorded. <sub>2026-09-29, 19s 1.60:1</sub> | 1.2M | 8,173 | A clean site recording plus a tiny prompt count reads as achievable. |
| 35 | [@fayazara](https://x.com/fayazara/status/2104915749206896758): Polished app UI walk-through claiming generic AI design is solved. <sub>2026-09-29, 28s 1.55:1</sub> | 370K | 4,108 | A provocative one-line claim invites quote-tweets that extend reach. |
| 39 | [@sab8a](https://x.com/sab8a/status/2104627757766578399): Open-source tool that turns generated videos into editable browser projects. <sub>2026-09-28, 60s 1:1</sub> | 341K | 4,761 | Solving the next pain (editing) of a trend gets heavy bookmarks. |
| 77 | [@motion_conquest](https://x.com/motion_conquest/status/2103510103622308152): Square UI motion demo framed as a we-are-done moment. <sub>2026-09-25, 16s 1:1 · prompt link</sub> | 175K | 2,071 | Short, square UI clips fit timelines and invite rewatch. |
| 90 | [@Onethirdesigner](https://x.com/Onethirdesigner/status/2103749509616648627): Designer's static UI brought to life as motion. <sub>2026-09-26, 7s 1.08:1 · prompt link</sub> | 120K | 1,876 | Position the model as a collaborator that fills your skill gap. |

## Kinetic typography (6)

| # | Post | Views | Bookmarks | What to learn |
|---|---|---|---|---|
| 42 | [@8co28](https://x.com/8co28/status/2102572322016370781): Lyric-text music video generator where timing is tapped to the song. <sub>2026-09-23, 106s 0.46:1</sub> | 435K | 3,093 | Turning a one-off effect into a tool multiplies the post's usefulness. |
| 74 | [@aicreataro](https://x.com/aicreataro/status/2103757144789221819): Dance footage drives text and light effects through model-controlled After Effects. <sub>2026-09-26, 32s 16:9</sub> | 380K | 1,568 | Documenting materials, steps and lessons in a structured caption earns saves. |
| 105 | [@yoshifujidesign](https://x.com/yoshifujidesign/status/2107488624644411615): HTML slide motion built on a government design system, compared with another style. <sub>2026-10-06, 29s 16:9</sub> | 131K | 1,186 | Using a public design system shows brand-consistent motion. |
| 106 | [@nokonoko_1203](https://x.com/nokonoko_1203/status/2105922366190784915): Thirty-second type-driven motion piece telling today's weekday. <sub>2026-10-02, 30s 16:9 · prompt link</sub> | 134K | 903 | Trivial prompts with big production make funny, shareable contrast. |
| 139 | [@blueemi99](https://x.com/blueemi99/status/2104323319365275785): Lyric video for a well-known song. <sub>2026-09-27, 358s 16:9</sub> | 45K | 420 | Famous songs give typography a built-in audience. |
| 141 | [@sundyme](https://x.com/sundyme/status/2106742177879732629): Variable dot-matrix font with a type specimen video. <sub>2026-10-04, 31s 0.67:1</sub> | 45K | 484 | Font specimens make strong kinetic-type showcases. |

## Data visualization (6)

| # | Post | Views | Bookmarks | What to learn |
|---|---|---|---|---|
| 37 | [@MatoToushi](https://x.com/MatoToushi/status/2103643548163928183): Tokyo last-train map animated from one request, with a live site. <sub>2026-09-26, 62s 1.60:1</sub> | 895K | 2,199 | Local, practical data viz with a live link drives saves and quote-tweets. |
| 40 | [@uchita_success](https://x.com/uchita_success/status/2103786580838420912): Animated slides that expand evidence and recalculate on interaction. <sub>2026-09-26, 31s 16:9</sub> | 585K | 3,757 | Show the viewer experience, not just the creator's speed, to stand out. |
| 75 | [@devteamdrew](https://x.com/devteamdrew/status/2105353836638744578): Visualization comparing every Claude effort level side by side. <sub>2026-09-30, 59s 16:9</sub> | 223K | 1,181 | Visualizing the product's own settings is useful content for its fans. |
| 80 | [@thebuggeddev](https://x.com/thebuggeddev/status/2104402407358919124): Electromagnetic field visualization pitched as a better way to learn physics. <sub>2026-09-28, 71s 1.61:1</sub> | 195K | 1,563 | Lead with the learning benefit, then reveal the tool. |
| 116 | [@Lattice_Node](https://x.com/Lattice_Node/status/2106313749846249487): Visual answer to how many tries a one-percent chance needs. <sub>2026-10-03, 42s 4:5</sub> | 326K | 383 | Correcting a common misconception draws quote-tweets. |
| 129 | [@intangiblecoins](https://x.com/intangiblecoins/status/2103895476319969685): Three-minute bitcoin history driven by a private on-chain database. <sub>2026-09-26, 215s 16:9 · prompt link</sub> | 100K | 561 | Feeding proprietary data creates visuals nobody else can copy. |

## Explainer (17)

| # | Post | Views | Bookmarks | What to learn |
|---|---|---|---|---|
| 1 | [@IterIntellectus](https://x.com/IterIntellectus/status/2103212539895017864): Two-minute sweep of Western civilization requested in one casual sentence. <sub>2026-09-24, 136s 16:9</sub> | 15.1M | 34K | Huge, familiar topics plus a deadpan two-line caption can out-reach any polished launch film. |
| 6 | [@RyanSael](https://x.com/RyanSael/status/2102591147927654847): Interactive camera-focus lab, recorded as an explainer, with exact runtime and dollar cost. <sub>2026-09-23, 32s 16:9</sub> | 3.5M | 10K | Exact time and cost receipts make an impressive demo feel reproducible and bookmark-worthy. |
| 19 | [@konstantinsaifo](https://x.com/konstantinsaifo/status/2104094723887501736): Rocket engine you can take apart, recorded as a guided explainer. <sub>2026-09-27, 35s 16:9 · prompt link</sub> | 1.2M | 5,145 | Exploded-view mechanics are a strong visual hook for engineering explainers. |
| 22 | [@andrewjiang](https://x.com/andrewjiang/status/2102987981695132140): Four-minute speculative video on the next fifty years. <sub>2026-09-24, 240s 16:9</sub> | 1.1M | 3,723 | Big-future framing with a personal stance invites debate and replies. |
| 26 | [@DotCSV](https://x.com/DotCSV/status/2102737776219168939): Pixel-art animation of a neural network learning, in Spanish. <sub>2026-09-23, 56s 16:9</sub> | 576K | 3,262 | Native-language creators can own a niche by explaining AI with charming visuals. |
| 31 | [@deedydas](https://x.com/deedydas/status/2103141339651350646): Eight-minute math-style explainer generated from a research paper. <sub>2026-09-24, 519s 16:9</sub> | 333K | 5,411 | Name a beloved style plus a universal input to promise repeatable value. |
| 53 | [@WinterArc2125](https://x.com/WinterArc2125/status/2103116235009347650): Five-minute animated breakdown of a single Napoleonic battle. <sub>2026-09-24, 301s 16:9 · prompt link</sub> | 647K | 1,656 | History micro-documentaries are evergreen and reshareable. |
| 60 | [@HindolSengupta](https://x.com/HindolSengupta/status/2103906559109787845): Four-minute tour of how gods are named across Indian history. <sub>2026-09-26, 292s 16:9</sub> | 276K | 2,626 | Compressing thousands of years into minutes is a proven explainer hook. |
| 62 | [@brivael](https://x.com/brivael/status/2104216601864106226): Viral written essay converted into an animated video essay. <sub>2026-09-27, 332s 16:9</sub> | 722K | 1,091 | Repurposing your own proven content lowers risk and brings an existing audience. |
| 63 | [@moguzbulbul](https://x.com/moguzbulbul/status/2104206095313215591): Animated UX case study for job interviews, with the skill offered. <sub>2026-09-27, 42s 4:3 · prompt link</sub> | 205K | 2,885 | Career-use framing plus an offer of the skill drives replies. |
| 66 | [@AndrewOnXYZ](https://x.com/AndrewOnXYZ/status/2103865359988125706): Explainer animation on a major superintelligence risk. <sub>2026-09-26, 316s 16:9</sub> | 457K | 1,232 | Topical AI-safety stories travel within the AI community itself. |
| 71 | [@Skylartkitchen](https://x.com/Skylartkitchen/status/2103522230957420843): 3D tutorial for automating raised garden beds. <sub>2026-09-25, 41s 1:1 · prompt link</sub> | 199K | 2,254 | Personal practical projects show non-tech uses and widen the audience. |
| 72 | [@addyosmani](https://x.com/addyosmani/status/2103009037164110327): How browsers work explained in forty seconds of JS animation. <sub>2026-09-24, 40s 16:9</sub> | 217K | 1,764 | A respected author plus a tight runtime makes technical explainers shareable. |
| 73 | [@kimmonismus](https://x.com/kimmonismus/status/2102844654169575547): History of AI from Attention to AGI, without stock footage. <sub>2026-09-23, 180s 16:9 · prompt link</sub> | 203K | 1,647 | Listing absent ingredients reinforces the pure-code claim. |
| 76 | [@HindolSengupta](https://x.com/HindolSengupta/status/2103489466841362886): Five thousand years of India compressed into three minutes. <sub>2026-09-25, 222s 16:9</sub> | 103K | 2,041 | Follow up a hit with a sibling topic while attention is warm. |
| 78 | [@LLMJunky](https://x.com/LLMJunky/status/2106411941497389342): Thirty-six-minute educational cartoon that cost over two hundred dollars. <sub>2026-10-03, 2138s 16:9 · prompt link</sub> | 157K | 2,166 | Admitting a funny cost overrun makes a long video post approachable. |
| 87 | [@ivanainai](https://x.com/ivanainai/status/2105764877986099545): Wordless visual essay about humanity's biggest scam. <sub>2026-10-01, 15s 21:9</sub> | 425K | 672 | No-words constraints create curiosity and work across languages. |

## 3D scene (8)

| # | Post | Views | Bookmarks | What to learn |
|---|---|---|---|---|
| 15 | [@victormustar](https://x.com/victormustar/status/2103110908444631120): LEGO duck designed from real parts, shown as an animated build. <sub>2026-09-24, 24s 1:1</sub> | 1.4M | 5,727 | Grounding the output in real-world constraints makes a 3D demo more credible. |
| 17 | [@RyanSael](https://x.com/RyanSael/status/2108203997480063196): Endless procedural city running in the browser on WebGPU. <sub>2026-10-08, 52s 16:9</sub> | 694K | 6,418 | Pair the video with a live link so viewers can verify it is real code. |
| 24 | [@dangreenheck](https://x.com/dangreenheck/status/2102878170089169235): Long cinematic 3D piece framed by its four-figure token bill. <sub>2026-09-23, 227s 16:9</sub> | 894K | 3,421 | A shocking cost figure in the first line is a reliable curiosity hook. |
| 28 | [@MengTo](https://x.com/MengTo/status/2102760783344189761): Playable boat ride through Japanese landscapes with dynamic water. <sub>2026-09-23, 60s 4:3 · prompt link</sub> | 483K | 3,814 | Specific craft details in the caption signal expertise to developer audiences. |
| 56 | [@Aurelien_Gz](https://x.com/Aurelien_Gz/status/2102786378282987591): Open-sourced 3D water after followers asked to buy it. <sub>2026-09-23, 27s 4:3</sub> | 257K | 2,644 | Releasing what people asked for converts attention into goodwill and bookmarks. |
| 57 | [@DilumSanjaya](https://x.com/DilumSanjaya/status/2104253761137127597): Sci-fi creature turned robot concept, shown as a 3D turntable. <sub>2026-09-27, 79s 16:9</sub> | 447K | 1,340 | Pop-culture mashups give 3D experiments instant context. |
| 65 | [@techartist_](https://x.com/techartist_/status/2102503719762018434): House evolving from sketch to finished building in four stages. <sub>2026-09-22, 19s 1.51:1</sub> | 329K | 2,003 | Staged build-up sequences are a clean structure for 3D reveals. |
| 69 | [@alexalbert__](https://x.com/alexalbert__/status/2102458348511879448): Blender claymation made from a single chat prompt. <sub>2026-09-22, 22s 1.49:1</sub> | 267K | 1,583 | Showing a familiar tool (Blender) driven by chat lowers perceived barriers. |

## Music video (14)

| # | Post | Views | Bookmarks | What to learn |
|---|---|---|---|---|
| 3 | [@anabology](https://x.com/anabology/status/2103534482930491441): Five-minute music video built overnight from a reused prompt plus a moodboard. <sub>2026-09-25, 306s 16:9 · prompt link</sub> | 20.0M | 14K | Crediting the source prompt and showing a 12-hour wait turns a remix into a story. |
| 5 | [@donaldjewkes](https://x.com/donaldjewkes/status/2102801274173587569): Voice-dictated brief became a two-minute music video after a 12-hour agent run. <sub>2026-09-23, 142s 16:9 · prompt link</sub> | 4.0M | 12K | Tell the effort ratio: five minutes talking versus twelve hours of agent work. |
| 12 | [@other__reality](https://x.com/other__reality/status/2102514581684052169): Cute lyric-driven pop video about AI doom, drawn in p5.js. <sub>2026-09-22, 157s 16:9</sub> | 2.9M | 4,636 | Self-referential AI humor gives tech audiences a reason to share beyond the craft. |
| 23 | [@_brightmirror](https://x.com/_brightmirror/status/2104078568137675107): Five-minute anti-doom anthem with animated visuals. <sub>2026-09-27, 300s 16:9</sub> | 891K | 3,950 | Ending with a share-to-a-friend line turns opinion content into distribution. |
| 25 | [@pleometric](https://x.com/pleometric/status/2103082510607610023): Follow-up music video built on another creator's published workflow. <sub>2026-09-24, 157s 16:9</sub> | 750K | 4,037 | Building on a viral post and tagging it rides the original's momentum. |
| 29 | [@minchoi](https://x.com/minchoi/status/2106027834217259394): One prompt plus a music track produced a four-minute video overnight. <sub>2026-10-02, 270s 16:9</sub> | 796K | 3,050 | The overnight-wake-up framing is a reusable narrative for long agent runs. |
| 30 | [@aug5thmusic](https://x.com/aug5thmusic/status/2102758849619062796): Bach-style fugue written and visualized as a scrolling score. <sub>2026-09-23, 130s 16:9 · prompt link</sub> | 1.1M | 2,702 | Pairing a hard creative benchmark with a previous model's result frames progress. |
| 34 | [@eudaemonea](https://x.com/eudaemonea/status/2102610626321490404): Video for a song written from an Anthropic research paper. <sub>2026-09-23, 373s 16:9</sub> | 1.1M | 2,437 | Layering a known paper, a song and a video creates a layered story. |
| 44 | [@qibiz_me](https://x.com/qibiz_me/status/2102594977264234578): Japanese song and video made by pairing the model with a vocal synth. <sub>2026-09-23, 143s 16:9</sub> | 610K | 2,376 | Combining the model with a niche creative tool shows unexpected range. |
| 67 | [@elliotarledge](https://x.com/elliotarledge/status/2104096029847277687): Music video teaching CUDA kernel optimization. <sub>2026-09-27, 190s 16:9</sub> | 578K | 1,068 | Absurd pairings of dry tech topics with music create memorable shares. |
| 68 | [@_brightmirror](https://x.com/_brightmirror/status/2105714071681343654): Sequel song playing on doomer fears about Claude. <sub>2026-10-01, 378s 16:9</sub> | 295K | 1,574 | Series content builds returning viewers; reference the previous hit. |
| 70 | [@__gsk__](https://x.com/__gsk__/status/2104832372164444162): Short music piece where both picture and sound are code. <sub>2026-09-29, 30s 16:9</sub> | 166K | 1,867 | Highlighting that sound is code too impresses audio-aware viewers. |
| 84 | [@kevin_t_ngo](https://x.com/kevin_t_ngo/status/2105304249060274631): Piano music composed in Python with a Blender-rendered animation. <sub>2026-09-30, 72s 1:1</sub> | 193K | 1,289 | Show the full stack (music, animation, render) all driven by code. |
| 85 | [@Avenoxai](https://x.com/Avenoxai/status/2104131419853160477): Model writes and visualizes its own song after being asked to self-express. <sub>2026-09-27, 193s 16:9</sub> | 305K | 1,128 | Asking the model about itself yields emotionally resonant outputs. |

## Showreel (self-promo reel) (11)

| # | Post | Views | Bookmarks | What to learn |
|---|---|---|---|---|
| 7 | [@stephanlivera](https://x.com/stephanlivera/status/2103315922098470926): The 15-second self-showreel that started the copy-this-prompt wave. <sub>2026-09-25, 15s 16:9 · prompt link</sub> | 2.3M | 13K | A short, quotable one-line prompt in the post is the strongest share trigger. |
| 11 | [@achxvi](https://x.com/achxvi/status/2103918792845963545): Abstract 15-second motion piece with a 15-minute build claim. <sub>2026-09-26, 15s 16:9</sub> | 1.1M | 8,152 | Short time-to-result claims plus a tight 15-second runtime travel well. |
| 13 | [@shneural](https://x.com/shneural/status/2103151003272962130): Same showreel prompt run on two models, shown side by side. <sub>2026-09-24, 32s 16:9 · prompt link</sub> | 1.9M | 6,477 | Head-to-head comparisons borrow attention from both model fanbases. |
| 21 | [@crvdesign0](https://x.com/crvdesign0/status/2103817034618339682): Arabic repost of the showreel prompt with a localized call to copy it. <sub>2026-09-26, 15s 16:9 · prompt link</sub> | 1.1M | 6,135 | Localizing a proven prompt for another language audience can reach a million views. |
| 27 | [@ajith_io](https://x.com/ajith_io/status/2103449416325890146): Another 15-second self-showreel with the prompt quoted in full. <sub>2026-09-25, 15s 16:9 · prompt link</sub> | 633K | 4,757 | Even tiny accounts can break out by republishing a proven prompt with their own render. |
| 36 | [@kenn](https://x.com/kenn/status/2103337314021937232): Single-prompt motion reel flagged with the effort setting used. <sub>2026-09-25, 15s 16:9 · prompt link</sub> | 533K | 3,407 | Stating the effort setting helps others reproduce and boosts bookmarks. |
| 46 | [@tkm_hmng8](https://x.com/tkm_hmng8/status/2105255710531674358): Three-day motion piece showing how far iteration pushes quality. <sub>2026-09-30, 50s 16:9</sub> | 572K | 2,277 | Admitting the real time spent builds trust against one-shot hype. |
| 49 | [@johncodunayo](https://x.com/johncodunayo/status/2105270766996701686): Motion reel with all prompts promised in the comments. <sub>2026-09-30, 24s 1:1 · prompt link</sub> | 264K | 3,762 | Promising every prompt in comments drives bookmarks over likes. |
| 50 | [@aiehon_aya](https://x.com/aiehon_aya/status/2103403361022419005): Motion reel with the model explaining its own render pipeline. <sub>2026-09-25, 15s 16:9</sub> | 228K | 3,714 | Explaining the html-to-frames pipeline in the caption earns saves from builders. |
| 79 | [@himanshutwtxs](https://x.com/himanshutwtxs/status/2103495232637882858): Showreel prompt rerun on max effort with sound-on callout. <sub>2026-09-25, 15s 16:9 · prompt link</sub> | 291K | 1,727 | Sound-on reminders matter because synced audio is half the effect. |
| 81 | [@yasinozmeen](https://x.com/yasinozmeen/status/2104086740600254919): Twenty animation styles compiled into one reel with timestamps. <sub>2026-09-27, 226s 16:9</sub> | 126K | 2,777 | Catalog reels with timestamps become reference material people save. |

## Story animation (extra) (6)

| # | Post | Views | Bookmarks | What to learn |
|---|---|---|---|---|
| 16 | [@devteamdrew](https://x.com/devteamdrew/status/2102436464323661880): Flat-vector journey through science and the cosmos, entirely JavaScript. <sub>2026-09-22, 32s 16:9</sub> | 1.8M | 4,239 | A launch-day post with zero copy can win if the first frame is striking. |
| 32 | [@kevin_t_ngo](https://x.com/kevin_t_ngo/status/2102437977435893771): Short story of a girl sending Claude a question, every frame in JS. <sub>2026-09-22, 28s 1:1</sub> | 664K | 3,008 | Emotional micro-stories make a technical feat feel human and shareable. |
| 52 | [@AndrewOnXYZ](https://x.com/AndrewOnXYZ/status/2102512879258009818): Four-minute short film built by four agents with no voice API. <sub>2026-09-22, 239s 16:9</sub> | 387K | 2,235 | Listing what was not used makes the pure-code claim feel bigger. |
| 54 | [@shfred0](https://x.com/shfred0/status/2102495989194236158): Model animates its own life story with procedural brush strokes. <sub>2026-09-22, 30s 16:9</sub> | 375K | 1,739 | Explicitly saying no video or image model was used pre-empts skeptics. |
| 61 | [@pleometric](https://x.com/pleometric/status/2102572941699354900): Vertical parody of what the model's own TikTok feed would look like. <sub>2026-09-23, 47s 9:16</sub> | 412K | 1,338 | Native vertical format and platform parody suit short-video audiences. |
| 82 | [@NFT_Chen](https://x.com/NFT_Chen/status/2102681172367323300): Claude character edits its own cartoon inside a fake editing app. <sub>2026-09-23, 30s 16:9</sub> | 450K | 1,196 | Meta stories about the tool itself are catnip for AI audiences. |

## Generative art (extra) (4)

| # | Post | Views | Bookmarks | What to learn |
|---|---|---|---|---|
| 33 | [@ann_nnng](https://x.com/ann_nnng/status/2104159923886244176): Glitter-sticker effect compared across two models. <sub>2026-09-27, 13s 4:5</sub> | 474K | 4,025 | Tactile material effects are irresistible bookmarks for UI designers. |
| 47 | [@majidmanzarpour](https://x.com/majidmanzarpour/status/2102476258948927543): Animated pixel-art wizard drawn entirely in code. <sub>2026-09-22, 11s 1.21:1 · prompt link</sub> | 456K | 2,682 | Prompt-below teasers push readers into the thread and lift engagement. |
| 51 | [@trikcode](https://x.com/trikcode/status/2106599643014414696): Visual tour of the model's imagined inner mind. <sub>2026-10-04, 152s 16:9</sub> | 279K | 2,037 | Self-portrait prompts spark curiosity because viewers project meaning onto them. |
| 83 | [@Skoorbkaz](https://x.com/Skoorbkaz/status/2103407920650297689): Abstract visual piece teased as possibly showing model weights. <sub>2026-09-25, 156s 16:9</sub> | 546K | 1,004 | Mystery framing makes viewers watch to the end. |

## Resource-share posts (repos, prompt libraries, guides) (29)

| # | Post | Views | Bookmarks | What to learn |
|---|---|---|---|---|
| 9 | [@p4nthera_](https://x.com/p4nthera_/status/2107175720086589633): Growing gallery of model-made motion pieces, each beside its prompt or skill. <sub>2026-10-05, 13s 16:9</sub> | 1.2M | 23K | A gallery that pairs output with its recipe earns twice as many bookmarks as likes. |
| 10 | [@rexan_wong](https://x.com/rexan_wong/status/2103707054108299437): Thread explaining why one-prompt videos look generic and how to direct with references. <sub>2026-09-26, 11s 4:3</sub> | 633K | 18K | Debunking the one-prompt myth, then giving numbered fixes, is the top bookmark pattern. |
| 18 | [@N01ennn](https://x.com/N01ennn/status/2108182955671580771): Numbered list of twenty GitHub repos for motion work with the model. <sub>2026-10-08, 23s 1:1</sub> | 437K | 14K | Authority framing plus a numbered repo list is bookmark bait; verify the attribution claims. |
| 41 | [@minchoi](https://x.com/minchoi/status/2104227722377757031): Numbered roundup thread of the week's standout results. <sub>2026-09-27, 157s 16:9</sub> | 504K | 2,962 | Big accounts aggregating others' work gain from the trend without making videos. |
| 48 | [@tetumemo](https://x.com/tetumemo/status/2105055757326831668): Japanese recommendation of a case-library site with original-versus-remake comparisons. <sub>2026-09-29, 83s 16:9</sub> | 252K | 3,999 | An explicit save-this nudge in the first line lifts bookmarks. |
| 58 | [@charliejhills](https://x.com/charliejhills/status/2105226228437508496): Arrow-list announcement of a 389-video library with ideas and prompts. <sub>2026-09-30, 10s 16:9</sub> | 189K | 3,831 | Arrow bullets that say exactly what you get convert scrollers to savers. |
| 59 | [@deedydas](https://x.com/deedydas/status/2104957026199900220): Ten-hour distilled workflow tips for video generation with the model. <sub>2026-09-29, 240s 16:9</sub> | 154K | 4,341 | Numbered hard-won tips plus a demo reel earn high bookmark ratios. |
| 88 | [@everestchris6](https://x.com/everestchris6/status/2104965415164399895): Long structured prompt posted in full as the only one you need. <sub>2026-09-29, 40s 16:9</sub> | 126K | 2,852 | Posting a full structured prompt inline gets nearly three bookmarks per like. |
| 89 | [@RoundtableSpace](https://x.com/RoundtableSpace/status/2108456177029845346): List of twenty repos framed as a motion design stack. <sub>2026-10-09</sub> | 130K | 2,655 | Framing tools as a stack, not a prompt, reframes the problem. |
| 93 | [@charliejhills](https://x.com/charliejhills/status/2103893708550914076): Three-step method with sixteen motion examples. <sub>2026-09-26 4:5</sub> | 143K | 1,826 | A short numbered method plus many examples is highly savable. |
| 95 | [@gabrielbuzziv](https://x.com/gabrielbuzziv/status/2103590703289057430): Portuguese step-by-step tutorial: install a skill, paste the prompt. <sub>2026-09-25, 15s 16:9</sub> | 82K | 2,210 | Quota-usage numbers make tutorials feel affordable. |
| 103 | [@0xMovez](https://x.com/0xMovez/status/2108170313557016623): Site pitched as Pinterest for model-made motion videos. <sub>2026-10-08, 15s 16:9</sub> | 70K | 1,634 | A familiar product analogy explains a new resource instantly. |
| 104 | [@laobaishare](https://x.com/laobaishare/status/2108533494725103926): Chinese repost of the twenty-repo list with an article link. <sub>2026-10-09, 23s 1:1</sub> | 79K | 1,621 | Translating a viral list into another language can match the original's saves. |
| 108 | [@beamnxw](https://x.com/beamnxw/status/2108953385189732416): Agent skill packaging 637 animation techniques for solo designers. <sub>2026-10-10, 20s 4:5</sub> | 63K | 1,728 | A large specific count signals depth. |
| 114 | [@LufzzLiz](https://x.com/LufzzLiz/status/2107408409859359211): Open-source project update adding nine explainer video styles. <sub>2026-10-06, 45s 16:9</sub> | 68K | 1,479 | Updating an already-starred repo with visual proof re-activates its audience. |
| 115 | [@jurlycat](https://x.com/jurlycat/status/2106339141558608002): GitHub repo with 475 demos and their shared prompts. <sub>2026-10-03, 31s 1.46:1</sub> | 56K | 1,613 | Repo posts work when the caption lists the categories inside. |
| 117 | [@Voxyz_ai](https://x.com/Voxyz_ai/status/2108543002830360775): Summary of Anthropic's getting-started guide for Claude Motion. <sub>2026-10-09</sub> | 75K | 1,360 | Summarizing official docs right after release captures search-like demand. |
| 121 | [@socialwithaayan](https://x.com/socialwithaayan/status/2105271130215064056): Ten repos from the release week, from motion to games. <sub>2026-09-30, 10s 16:9</sub> | 63K | 1,260 | Time-boxed roundups (this week) add urgency. |
| 123 | [@yihui_indie](https://x.com/yihui_indie/status/2104122905961595267): 301 effect remakes and workflows open-sourced after spending three thousand dollars. <sub>2026-09-27, 818s 16:9</sub> | 95K | 899 | Spend-receipt plus giveaway is a powerful resource-share hook. |
| 127 | [@moritzkremb](https://x.com/moritzkremb/status/2103115037334262241): Long tutorial on five business use cases with chapter timestamps. <sub>2026-09-24, 1380s 16:9</sub> | 42K | 1,335 | Chapter timestamps in the post make long videos bookmarkable. |
| 133 | [@0xKento_](https://x.com/0xKento_/status/2104734035675111823): Spanish discovery story leading to a library of 389 videos with prompts. <sub>2026-09-29, 33s 16:9</sub> | 39K | 1,151 | A search-journey narrative makes a link share feel like a find. |
| 135 | [@GoSailGlobal](https://x.com/GoSailGlobal/status/2104562514088398967): Curated database of 962 works with strict inclusion rules and prompt sourcing. <sub>2026-09-28, 44s 16:9</sub> | 128K | 535 | Stating curation rules builds trust in a resource. |
| 137 | [@Voxyz_ai](https://x.com/Voxyz_ai/status/2107868554209235257): Site with 230+ videos, each with the prompt or skill. <sub>2026-10-07, 16s 16:9</sub> | 33K | 786 | Listing per-item features sells a directory. |
| 138 | [@damkina7](https://x.com/damkina7/status/2108905681763934346): List of open-source repos with star counts for a motion stack. <sub>2026-10-10, 25s 1:1</sub> | 31K | 877 | Star counts act as social proof inside a list. |
| 142 | [@ishuagra02](https://x.com/ishuagra02/status/2108250410221781009): Creator releases the skill behind their animations after many requests. <sub>2026-10-08, 62s 16:9</sub> | 26K | 741 | Releasing a tool after repeated requests frames it as demanded. |
| 143 | [@euboid](https://x.com/euboid/status/2103929518868316413): Hot take that most demos won't convert, plus a skill for selling videos. <sub>2026-09-26, 114s 16:9</sub> | 34K | 617 | A contrarian hot take plus a fix attracts marketers. |
| 144 | [@Voxyz_ai](https://x.com/Voxyz_ai/status/2108905392776360333): List of fifteen repos name-checking well-known video companies. <sub>2026-10-10</sub> | 22K | 736 | Name-dropping known companies inside a list adds credibility. |
| 150 | [@NFT_Chen](https://x.com/NFT_Chen/status/2104090502840963508): Open skill for one-continuous-take product motion. <sub>2026-09-27, 30s 16:9</sub> | 32K | 155 | Naming a single principle (each shot grows from the last) makes a skill memorable. |
| 151 | [@GoSailGlobal](https://x.com/GoSailGlobal/status/2107675558117097905): Top-ten prompts ranked by bookmarks, only with verified sources. <sub>2026-10-07, 146s 16:9</sub> | 14K | 239 | Ranking resources by bookmarks is meta-proof of usefulness. |

## What separates the top 10% from the rest

This section uses the wider pool, not just the curated cases. The pool is 2,975 in-window Opus-attributed video posts, excluding games, AI-video-model clips, official Anthropic accounts and other Claude models. Top 10% means the 297 highest-scoring posts.

| Signal | Top 10% | Rest |
|---|---|---|
| Median views | 184K | 4.4K |
| Median bookmarks / likes | 1,238 / 1,677 | 16 / 30 |
| Bookmark-to-like ratio (median) | 0.80 | 0.50 |
| Author followers (median) | 11.2K | 2.3K |
| Video length (median) | 33 s | 35 s |
| Longer than 120 s | 19.5% | 15.2% |
| Vertical 9:16-ish | 10.4% | 15.0% |
| Square-ish | 12.1% | 7.8% |
| English | 76% | 67% |
| Caption ≤ 80 characters | 20.5% | 16.6% |
| Median caption length | 170 chars | 194 chars |
| Says "one prompt / one shot" | 11.4% | 17.1% |
| Opens with "I asked / I gave / I made" | 9.1% | 6.2% |
| States a $ cost | 7.1% | 4.7% |
| Shares or promises the prompt | 10.4% | 16.1% |

**Patterns supported by the data:**

1. **Bookmarks decide the top tier, not likes.** Top posts collect about 0.8 bookmarks per like, against 0.5 for the rest. Among posts above 50K views, sharing the prompt barely changes reach (110K vs 105K median views). It does raise the bookmark-to-like ratio from 0.67 to 1.12. Prompts buy saves, not distribution.
2. **The "one prompt" claim has saturated.** It shows up more often in the rest than in the top (17% vs 11%). The winners lead with a story, a striking subject or a specific receipt instead, such as "1 hour 26 minutes, $25.66", "12 hours later" or "$1,874 of tokens".
3. **Subject beats craft for reach.** The biggest videos tackle huge, familiar topics: Western civilization, the next 50 years, human history. Next come emotional or AI-self-referential music videos and stories. These outdraw abstract motion reels by 2 to 10 times. Music videos and explainers have the highest median views in the pool (about 45K and 43K, versus about 31K for motion graphics).
4. **Launch videos travel as a claim, not as an ad.** Product-promo posts have a modest median (34K views; p90 133K) but a high bookmark-to-like ratio (0.89). The launch videos that broke out were framed as proof that a designer is no longer needed: a reluctant expert, an old-price anchor, or a side-by-side remake of a known launch film. Posts that simply announced a product rarely broke out. The one mega-hit launch (Claude Motion, 11M views) is the vendor's own product.
5. **Short captions and wide or square video.** Top posts use slightly shorter captions. Square-ish clips are over-represented in the top tier (12% vs 8%), and vertical ones are under-represented (10% vs 15%). On X, 16:9 and 1:1 outperform 9:16.
6. **Followers help, but small accounts over-index per follower.** Accounts with 1K–10K followers averaged 3.3 views per follower, versus 0.2 for accounts over 100K. Several top-20 posts came from accounts with about 3K followers or fewer (for example @ajith_io, @shneural and @p4nthera_), usually by remixing a proven prompt or format within days of it trending.
7. **Timing.** 70% of qualifying posts landed in launch week (Sep 22–28), and both top and rest are dominated by week-1 posts. By week 3 the median dropped to 1.7K views. Treat this with caution, because the aggregator inclusion filters bias later weeks. The window for "first to show X" content is about 7 to 10 days.
8. **The meta layer wins bookmarks.** Several of the most-bookmarked posts are not videos of something new. They are galleries, workflows and repo lists that explain how others made their videos (@p4nthera_ 22.9K bookmarks, @rexan_wong 18.2K, @N01ennn 13.7K). Their bookmark-to-like ratios run between 2.3 and 2.6.

**Caveats.**
- Views are fxtwitter snapshots from 2026-10-11/12.
- The candidate pool comes from aggregators that apply their own view thresholds, so low-performing posts are under-sampled.
- Opus attribution is taken from the post text or aggregator data. It was not independently verified.
