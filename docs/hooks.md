# Hooks: how the top Opus 5.5 video posts open

**Scope**
- The first lines of the **top 40 video cases** in `cases.json`: ranks 1 to 44, skipping resource-share posts.
- **All 29 resource-share posts**: repo lists, prompt libraries, guides and galleries.
- Metrics come from fxtwitter on 2026-10-11/12 and are given as views / bookmarks / likes (B/L = bookmark-to-like ratio).
- Each example quotes at most one short first line. Everything else is paraphrased.

Baselines:
- Top-40 videos: median B/L 0.70, median caption 145 characters.
- Resource-share posts: median B/L 1.66, median caption 478 characters.
- Wider pool of 2,975 posts: median B/L 0.80 for the top 10% and 0.50 for the rest.

---

## 1. Hook patterns in the top 40 video posts (hand-labelled)

| Hook pattern | Count | Median views | Median B/L | Example (first line, URL, metrics) |
|---|---|---|---|---|
| Process narrative ("I asked / I gave / had it make…") | 10 | 1.13M | 0.70 | "I gave Opus 5.5 one prompt + music." [minchoi](https://x.com/minchoi/status/2106027834217259394) 796K / 3,050 / 5,246 |
| Verdict or superlative about the model | 9 | 585K | 0.70 | "So, UI slop is pretty much fixed with Opus 5.5 I guess" [fayazara](https://x.com/fayazara/status/2104915749206896758) 370K / 4,108 / 5,856 |
| Raw reaction or expletive | 6 | 764K | 0.64 | "holy shit" [IterIntellectus](https://x.com/IterIntellectus/status/2103212539895017864) 15.1M / 33,793 / 61,507 |
| Product announcement | 3 | 435K | 0.98 | "Claude Dashboards and Claude Motion are in beta today." [claudeai](https://x.com/claudeai/status/2108271552991252810) 11.0M / 39,903 / 59,924 |
| Subject or metaphor tease (no AI in line 1) | 3 | 1.35M | 0.66 | "Industrial software doesn't have to feel like industrial software" [DilumSanjaya](https://x.com/DilumSanjaya/status/2106426962738880879) 2.26M / 20,197 / 24,463 |
| Bare credit ("Made with…", "drew every frame in JS") | 3 | 891K | 0.49 | "Made with @claudeai Opus 5.5" [devteamdrew](https://x.com/devteamdrew/status/2102436464323661880) 1.83M / 4,239 / 9,797 |
| One-line-prompt reveal in line 1 | 2 | 1.69M | **1.46** | Effort setting plus the quoted one-sentence brief: [stephanlivera](https://x.com/stephanlivera/status/2103315922098470926) 2.27M / 13,090 / 17,144 |
| Receipt (exact cost or time) | 2 | 1.02M | 0.73 | "Ever wonder what $1874.40 of Opus 5.5 tokens looks like?" [dangreenheck](https://x.com/dangreenheck/status/2102878170089169235) 894K / 3,421 / 5,862 |
| Confession by an expert | 1 | 1.80M | 1.00 | A design-studio founder "hates to admit" the model is good at launch videos: [uxmiles](https://x.com/uxmiles/status/2104618175803609305) 1.80M / 4,707 / 4,719 |
| Remix credit ("this video inspired me…") | 1 | 750K | 0.79 | [pleometric](https://x.com/pleometric/status/2103082510607610023) 750K / 4,037 / 5,079 |

**Takeaways**
- Among videos, reach is driven by the clip and the subject, not by clever hook wording. Reaction-only and bare-credit lines reach millions when the first frame is strong. They earn the lowest B/L (0.49 to 0.64), so the posts are watched but not saved.
- Process narratives are the workhorse: the largest group with the highest median reach. They work because they sound like a reproducible recipe ("I gave it X, it made Y").
- The prompt-reveal hook is the only video hook whose B/L runs well above 1. Putting the full brief in the first line makes the post a tool, not just a demo.

## 2. Hook patterns in the 29 resource-share posts

| Hook pattern | Count | Median views | Median B/L | Example |
|---|---|---|---|---|
| Discovery ("someone built / I found…") | 6 | 51K | 1.68 | "🚨 Someone just built a library of 389 Opus 5.5 videos." [charliejhills](https://x.com/charliejhills/status/2105226228437508496) 189K / 3,831 / 2,100 |
| Myth-bust or contrarian | 4 | 82K | **1.98** | Admits their own one-prompt try "looked mid", then gives the real workflow: [rexan_wong](https://x.com/rexan_wong/status/2103707054108299437) 633K / 18,172 / 6,869 (B/L 2.65) |
| Creator offer ("I built / we open-sourced") | 4 | 98K | 1.59 | Gallery pairing each video with its prompt or skill: [p4nthera_](https://x.com/p4nthera_/status/2107175720086589633) 1.19M / 22,860 / 9,952 |
| Authority claim (big company or official doc) | 3 | 79K | 1.83 | "this is pure f*cking treasure" [N01ennn](https://x.com/N01ennn/status/2108182955671580771) 437K / 13,714 / 5,651. The "Netflix engineers" attribution in the body is unverified. |
| Verdict ("X solved motion graphics") | 3 | 143K | 1.45 | "Opus 5.5 solved motion graphics" [moritzkremb](https://x.com/moritzkremb/status/2103115037334262241) 42K / 1,335 / 725 |
| Number-led list | 3 | 56K | 2.01 | "475 Claude Opus 5.5 video demos in one GitHub repo. 🤯" [jurlycat](https://x.com/jurlycat/status/2106339141558608002) 56K / 1,613 / 989 |
| Effort receipt | 2 | 124K | 1.77 | Ten-plus hours spent perfecting a workflow, then numbered tips: [deedydas](https://x.com/deedydas/status/2104957026199900220) 154K / 4,341 / 2,074 |
| Label ("TUTORIAL", "save-worthy site") | 2 | 167K | 1.54 | [gabrielbuzziv](https://x.com/gabrielbuzziv/status/2103590703289057430) 82K / 2,210 / 1,417 |
| Superlative prompt ("the only prompt you need") | 1 | 126K | **2.69** | [everestchris6](https://x.com/everestchris6/status/2104965415164399895) 126K / 2,852 / 1,060 |
| Question to the reader | 1 | 14K | 1.44 | [GoSailGlobal](https://x.com/GoSailGlobal/status/2107675558117097905) 14K / 239 / 166 |

**Takeaways**
- In resource posts, contrarian and "only one you need" framings get the most saves per like.
- Discovery framing ("someone built…") is the most common pattern but has the weakest median reach. It has become a template that readers recognise.

## 3. Structures

| Structure | Top-40 videos (n, median views, B/L) | Resource posts (n, median views, B/L) | Notes |
|---|---|---|---|
| **List** (numbered, arrows, bullets) | 2 · 1.26M · 1.16 | 16 · 77K · 1.76 | Lists are the native resource format; showcases almost never use them. Long arrow lists of what-you-get turn a link into a checklist people save. |
| **Before/after, side-by-side** | 2 · 1.52M · 1.30 | 1 (original vs remake site) | Best video example: two models given the same brief, side by side, [shneural](https://x.com/shneural/status/2103151003272962130) 1.89M / 6,477 / 6,813. In launch videos, synced remakes of a known startup film reach B/L above 2: [notdwd](https://x.com/notdwd/status/2103959324385300552) 123K / 1,442 / 630. |
| **Cost/time contrast** | 8 · 1.02M · 0.87 | 3 · 142K · 1.64 | The most common receipt types are "12 hours later", "in 15 minutes" and an exact dollar amount. Also old-price versus new-price anchors (a $1,000+ freelance video versus 30 minutes). |
| **Confession** | 1 · 1.80M · 1.00 | 1 · 633K · 2.65 | Rare but high-yield. Admitting a disappointing first try, or an expert admitting surprise, both build trust. |
| **One-line-prompt reveal** | 5 · 1.10M · 1.16 | 1 · 82K · 1.56 | The 15-second self-showreel brief spawned dozens of reposts in several languages. The ones that worked added a local twist, such as a language, effort level or persona. |

## 4. How numbers are used

- 24 of the top-40 video posts contain a number somewhere, but only 9 put one in the first line. First-line numbers barely change B/L in this set (0.76 vs 0.70). 27 of 29 resource posts use numbers, and 10 put one in the first line.
- Five kinds of number recur:
  1. **Collection size**: 475 demos, 389 videos, 230+, 637 techniques, 20 repos. These signal "complete", which drives saves.
  2. **Money**: $25.66, $1,874.40, $2 versus $1,000+, $3,000 spent. Odd, precise amounts read as receipts; round numbers read as hype.
  3. **Time**: 15 minutes, 1h26m, 12 hours later, a 14-hour run. Short times sell ease; long autonomous times sell power.
  4. **Effort setting or plan**: Max, xhigh, Ultracode, "Pro plan, 5% of quota". These help reproducibility and draw replies from people trying it.
  5. **Input count**: 1 prompt, 3 prompts, 2 edits. A small prompt count is still common, but "one prompt" alone has saturated. In the wider pool it appears more in the bottom 90% (17%) than in the top 10% (11%).

## 5. CTAs

- **Showcase videos mostly skip CTAs.** 29 of the top 40 have none (median 1.08M views, B/L 0.70). Where present:
  - prompt-below or steal-the-prompt CTAs (4) lift B/L to 1.25;
  - repo or link-in-comments CTAs (3) lift it to 1.64;
  - live "try it" links (4) do not lift saves (0.59), since people click out instead of bookmarking.
- **Resource posts use CTAs heavily**:
  - a live link or try-it (14): B/L 2.02;
  - link in comments (10): 1.58;
  - an explicit "save this / bookmark this" (8): 1.68;
  - follow or repost asks (2): 1.73.
  The explicit save prompt is the signature of the high-bookmark list posts, usually at the end ("save this and come back when you need it").
- Asking for opinions ("which do you prefer?") was rare and earned low B/L, but it can be useful for replies on A/B launch-video posts.

## 6. Bookmark-to-like ratios: what to expect

| Content | Median B/L |
|---|---|
| Resource-share posts (lists, galleries, prompt dumps) | 1.66 (range 0.85 to 2.69) |
| Showreels (most quote their brief) | 1.15 |
| Product-launch videos | 1.13 |
| SaaS/UI motion with a template | 1.02 (twoclipping's square UI reel: 1.66) |
| Brand teasers | 0.83 |
| Explainers, music videos, 3D scenes | 0.59 to 0.62 |
| Stories and art | 0.46 to 0.69 |

**Rule of thumb:** if B/L is above 1, people want to reproduce the post; if it is below 0.6, they are being entertained. A launch post should aim for both: an entertaining clip, plus a reusable artifact (the brief, a template or a repo) to push B/L above 1.

---

## 7. Twelve reusable hook templates (my wording)

1. **Receipt opener:** "[Exact time] and $[exact cost] later, [model] turned [plain input] into this."
2. **Reluctant expert:** "I run a [relevant profession] shop, and I didn't want this to be true: [specific capability]."
3. **Effort ratio:** "I talked for [short time]. It worked for [long time]. This is what was waiting for me."
4. **Old-price anchor:** "Last year this [asset type] cost me [price] and [weeks]. Today: [minutes], from code."
5. **Same-brief duel:** "Same one-sentence brief, two models. Left is [A], right is [B]. Not close."
6. **Remake proof:** "[Famous launch film] on the left. My rebuild for [my product] on the right, synced frame for frame."
7. **Big-topic compression:** "[Thousands of years / an entire field] in [N] minutes, every frame drawn in code."
8. **Myth-bust then method:** "Everyone says it's one prompt. Mine looked mediocre too, until I changed [one thing]. Here's the method:"
9. **The brief is the hook:** "[Effort setting] + this one sentence: "[short brief paraphrase]". That's the whole prompt."
10. **Reframe the boring category:** "[Dull category] doesn't have to feel like [dull category]. So I made [it] feel like [a fun metaphor]."
11. **Library drop:** "[N] [items] made with [model], each next to the exact prompt or skill that made it. Save this before you build your next one."
12. **Meta self-portrait:** "I asked [model] to show [its own life / its inner world / its own launch]. I wasn't ready for the ending."

**Use with care:**
- Vague "one prompt" or "insane" claims with no receipt have saturated.
- Authority claims you can't verify ("engineers at [big company] posted…") can earn saves now and cost credibility later.
