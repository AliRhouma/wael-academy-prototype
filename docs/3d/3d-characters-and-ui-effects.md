# Turn Wael into one reusable 3D guide

The Wael game app should treat 3D as **one coherent illustration layer**: a stylised, soft-matte 3D caricature of Wael with a small set of poses on one fixed canvas, plus the floating town. That layer sits on top of the flat, lipped `play` UI that already exists. It should not be real-time 3D, and the chrome should not be claymorphic. The evidence points the same way. Pedagogical agents bring a small learning benefit (g ≈ 0.20), **2D agents beat 3D agents (g+ ≈ 0.38 vs ≈ 0.11)**, and the persona benefit comes from **gestures and facial expressions**, not rendering fidelity ([Castro-Alonso et al. 2021](https://doi.org/10.1007/s10648-020-09587-1); [Davis, Park & Vincent 2021](https://informahealthcare.com/doi/full/10.1080/15391523.2020.1830894)). So the budget should go into Wael's *reactions* (a dozen poses that change with each choice) rather than more polygons. Keep the rendering deliberately stylised, because Duolingo itself called a fully textured 3D Duo "creepier" ([Design Week](https://www.designweek.co.uk/issues/2-6-january-2019/duolingo-owl-receives-makeover-as-app-becomes-more-gamified)) and Gen Z punishes anything that looks AI-made ([Klaviyo](https://klaviyo.com/blog/how-gen-z-use-ai)). For this Vite + React stack in a webview, the recommended technology path runs cheapest first: pre-rendered WebP stills composited with CSS (almost no JavaScript) for every screen now, stacked-alpha video for two or three hero gestures, a Rive puppet only once Wael speaks with real audio, and no React Three Fiber or Spline anywhere in the flow. The rebuilt splash keeps the project's "a door, not a wait" stance: a flat launch colour, Wael on the end side facing the lime CTA in the right-thumb zone with the island behind him, an entrance under 600 ms, one ambient loop, and sound on the first tap. The same Wael then carries through welcome, level, subject, quiz, result and sign-up by swapping a single component (`WaelAside`). This plan requires the owner to approve **seven amendments to the `wael-gamified` skill** (listed in section 1). The weakest evidence covers mid-range Android performance, teen and MENA reactions to mascots, and community opinion, because Reddit, X, LinkedIn and YouTube were unreadable to the research tools.

> **How to use this file.** Sections 1–2 explain *why* and set the rules. Sections 3–6 are the *how*: the character system, the effect catalogue, animation, and the splash blueprint. Section 7 applies the treatment screen by screen. Section 8 holds the checklists to run before merging anything. Sections 9–10 hold inspiration and open questions. Every claim links to its source. Lines marked *(proposal)* are design synthesis built on the cited evidence, not measured facts.

### The rules on one page

| # | Rule | Why (detail in section) |
|---|---|---|
| 1 | Depth lives in two places only: in the **art** (renders, contact shadows, parallax) and on **things you tap** (lips). Cards and panels stay flat, with a 2 px border. | §1, §4 |
| 2 | One Wael, one canvas (1024 × 1536, feet at 512, 1472), one camera, one light (top-left), every pose. | §3 |
| 3 | Wael *reacts*. Every choice changes his pose or his bubble. A pose that never changes is decoration. | §2, §3 |
| 4 | Wael looks at the content or the CTA. He makes eye contact only to greet and to celebrate. | §2 |
| 5 | In RTL, **re-pose, never mirror**. Each facing is its own render. Never use CSS `scaleX(-1)`. | §2 |
| 6 | Stylised caricature, soft-matte material, expression ceiling. No photoreal skin, no plastic sheen. | §2 |
| 7 | Pre-rendered first. A runtime (Rive, video) only when a state machine or real motion pays for it. No live WebGL in the flow. | §4, §5 |
| 8 | Motion is brief, compositor-only (transform and opacity) and cancellable. Each screen gets one ambient loop at most, and all of it is off under reduced motion. | §4, §6 |
| 9 | Sound starts on the first tap and lands on the same frame as the visual. Nothing plays on load. | §6 |
| 10 | Get Wael's written consent, keep a log of human cleanup, and test with real Tunisian teens before scaling the cast. | §2, §10 |

---

## 1. The owner wants an experience led by Wael, and the skills currently forbid it in seven places

### What the owner asked for

The owner's brief is play-first and character-led: "a welcoming from wael caracter, then next the user pick his nivaux 1ere to bac … then he pick his subject favorite then a game for 3 screen", and afterwards "to play again he should autheficate". The key taste signal is that it should be "like expirience interactive with the user until reach the auth screen he will be encourazged to create the account" ([session transcript "Splash screen and auth pages"](ccd-session://local_83a10635-9b1a-465e-9a50-49441d00e38e)). The owner also asked that each phone follow its own platform skill (http://localhost:5173/mobilegame and http://localhost:5173/mobilegame?device=galaxy). The recorded decisions set the flow's skeleton: **plays before it asks**, no fake loading bar, level and section in one step, questions in the language each lycée subject is taught in, no timer and no game over, and sign-up = name + phone + SMS code + password, plus a parent's number under 18 ([FEATURES.md](file:///C:/Projects/Wael%20Academy%20Prototype/docs/FEATURES.md)). The owner gave no negative feedback on that logic, so treat the routes and the gate as settled. This rebuild concerns the **visual and character layer and the layout**, not the flow.

After seeing the 3D splash, the owner asked, in the session "MCP reconnect scenario" (2026-11-16): « why the other screens have not the wael and 3d effects », showing the login screen with the flat 2D Wael. The intent is clear: one consistent 3D treatment from the splash to sign-up. The 3D Wael and the floating island were made in Scenario with Gemini 3.0 Pro (the 2D `Caracter.png` as identity reference, the town's school render as style reference), cut out with Photoroom.

### What exists today: one 3D screen and seven flat ones

`/mobilegame` is a landscape React app. On desktop it is drawn inside a true-size iPhone 13 Pro Max (926 × 428 pt) or Galaxy A55 (832 × 384 dp) frame; on a real phone it runs full-screen. Safe areas are exposed as `--gs-top/left/right/bottom`: iOS 8/47/47/21 and Android 8/36/12/24 in immersive mode ([MobileGameLayout.tsx](file:///C:/Projects/Wael%20Academy%20Prototype/src/features/mobilegame/MobileGameLayout.tsx)). Each platform has its own controls: an iOS 50 pt lime capsule with a lip, an Android 56 dp full-round lime button with lip and ripple, inputs of at least 16 px, a 3 px teal focus ring, and a `data-uisfx` cue on every control ([platformUi.ts](file:///C:/Projects/Wael%20Academy%20Prototype/src/features/mobilegame/platformUi.ts)).

**The splash is the only 3D screen.** It uses a `bg-v2-chapter` teal-to-petrol gradient with a 7 % graph-paper grid. The start column holds the logo, the « وضع اللعب » pill, the title « مدينة وائل », a one-line promise, and the CTAs « يلّا نبداو » / « عندي كونط » (or « ادخل لمدينتك » when signed in, « شوف نتيجتك » for a guest who has already played). The end column holds `town_island.webp` bobbing slowly (`v2-float`: −8 px over 6 s, motion-safe only), `wael_wave.webp` anchored at the bottom start, both with **black blurred drop-shadows**, plus a flat « +30 نقطة » sticker with a 3 px navy lip ([SplashScreen.tsx](file:///C:/Projects/Wael%20Academy%20Prototype/src/features/mobilegame/SplashScreen.tsx); [v2.css](file:///C:/Projects/Wael%20Academy%20Prototype/src/styles/v2.css)). The code states the philosophy: "the splash is a door, not a wait".

Every other screen still uses the **flat 2D `Caracter.png`** (185 × 328, arms crossed, one pose) on a dark teal panel ([Caracter.png](file:///C:/Projects/Wael%20Academy%20Prototype/svg%20icons/Caracter.png)). On the five onboarding screens that panel is `WaelAside`: 27 % of the width, with a speech bubble that pops (320 ms) when the line changes. "Wael's reaction" there is only the bubble text ([onboarding/parts.tsx](file:///C:/Projects/Wael%20Academy%20Prototype/src/features/mobilegame/onboarding/parts.tsx)). Login also uses the flat SVG `TownArt` ([LoginScreen.tsx](file:///C:/Projects/Wael%20Academy%20Prototype/src/features/mobilegame/LoginScreen.tsx); [TownArt.tsx](file:///C:/Projects/Wael%20Academy%20Prototype/src/features/game/shared/TownArt.tsx)). Sign-up shows the 2D Wael at 62 % height ([RegisterScreen.tsx](file:///C:/Projects/Wael%20Academy%20Prototype/src/features/mobilegame/RegisterScreen.tsx); [screens.tsx](file:///C:/Projects/Wael%20Academy%20Prototype/src/features/mobilegame/screens.tsx)). `/webgame` uses `TownArt` and the 2D Wael too ([LandingPage.tsx](file:///C:/Projects/Wael%20Academy%20Prototype/src/features/webgame/LandingPage.tsx); [LoginPage.tsx](file:///C:/Projects/Wael%20Academy%20Prototype/src/features/webgame/LoginPage.tsx)).

The individual screens are [WelcomeScreen.tsx](file:///C:/Projects/Wael%20Academy%20Prototype/src/features/mobilegame/onboarding/WelcomeScreen.tsx), [LevelScreen.tsx](file:///C:/Projects/Wael%20Academy%20Prototype/src/features/mobilegame/onboarding/LevelScreen.tsx), [QuizScreen.tsx](file:///C:/Projects/Wael%20Academy%20Prototype/src/features/mobilegame/onboarding/QuizScreen.tsx) and [ResultScreen.tsx](file:///C:/Projects/Wael%20Academy%20Prototype/src/features/mobilegame/onboarding/ResultScreen.tsx). The guest store is seeded from 282 questions across all 120 level × subject pairs ([flow.ts](file:///C:/Projects/Wael%20Academy%20Prototype/src/features/mobilegame/onboarding/flow.ts)). The shared pressables (`gCta` with a 4 px lip, `gBtn`, flat `gPanel`) live in [ui.ts](file:///C:/Projects/Wael%20Academy%20Prototype/src/features/game/shared/ui.ts) and [shared/parts.tsx](file:///C:/Projects/Wael%20Academy%20Prototype/src/features/game/shared/parts.tsx). The keyframes (`game-pop`, `game-stamp`, `game-burst`…) all sit behind `motion-safe:` in [game.css](file:///C:/Projects/Wael%20Academy%20Prototype/src/features/game/shared/game.css).

**The 3D assets made so far** (session "MCP reconnect scenario", 2026-11-16, recorded in the changelog) are these:

- `town_island.webp`: 1100 × 947, 122 KB.
- `wael_wave.webp`: 335 × 760, 39 KB. Used only by the splash.
- `wael_base.png`: the master Wael, a soft Pixar-like render, right hand waving, on the guide's large-character canvas (1024 × 1536, RGBA, 579 KB). No screen uses it yet.
- 11 buildings and 10 props fitted by `fit.py`.

No blink or mouth layers exist yet. The code that would read them does: `art.ts` recognises `base | eyes_half | eyes_closed | mouth_(rest|a|e|o|u|f)`, and `/map/atelier` already has a toggle test and a blink preview ([FEATURES.md](file:///C:/Projects/Wael%20Academy%20Prototype/docs/FEATURES.md); [wael_base.png](file:///C:/Projects/Wael%20Academy%20Prototype/src/assets/characters/wael_base.png); [town_island.webp](file:///C:/Projects/Wael%20Academy%20Prototype/src/assets/splash/town_island.webp); [src/assets/splash](file:///C:/Projects/Wael%20Academy%20Prototype/src/assets/splash/); [src/assets/characters](file:///C:/Projects/Wael%20Academy%20Prototype/src/assets/characters/); [art.ts](file:///C:/Projects/Wael%20Academy%20Prototype/src/features/map/art.ts); [ArtAtelier.tsx](file:///C:/Projects/Wael%20Academy%20Prototype/src/features/map/ArtAtelier.tsx)).

The practical consequence: **`WaelAside` is the single choke point** for five screens. Make it pose-aware, then swap `Caracter.png` in `LoginScreen`, `RegisterScreen` and `/webgame/LoginPage`. Together those changes deliver most of the consistency the owner asked for.

The stack is Vite + React 19 + TypeScript + Tailwind v4, with no 3D or animation runtime installed. The installed packages are class-variance-authority, clsx, lucide-react, nanoid, radix-ui, react-router-dom 7.18, sonner, tailwind-merge, uisfx 0.4.0 and zustand 5 ([package.json](file:///C:/Projects/Wael%20Academy%20Prototype/package.json)). Capability libraries are allowed "when a screen genuinely needs one" ([CLAUDE.md](file:///C:/Projects/Wael%20Academy%20Prototype/CLAUDE.md)). There is a precedent to respect: the iOS skill rejected glass refraction because it renders only in Chromium and "every iPhone browser is WebKit" ([wael-mobile-ios SKILL.md](file:///C:/Projects/Wael%20Academy%20Prototype/.claude/skills/wael-mobile-ios/SKILL.md)). **Every 3D effect must work in Safari and WKWebView.**

### The rules a 3D treatment collides with

Four skills stack on this app:

- `wael-design-system-soft`, the brand. It is warm and its "every shadow is green-tinted (`rgb(21 58 45 / ...)`)" ([soft SKILL.md](file:///C:/Projects/Wael%20Academy%20Prototype/.claude/skills/wael-design-system-soft/SKILL.md)).
- `wael-gamified`, the `play` look: lips, one lime moment, one burst, strict reduced motion ([wael-gamified SKILL.md](file:///C:/Projects/Wael%20Academy%20Prototype/.claude/skills/wael-gamified/SKILL.md)).
- `wael-mobile-ios` and `wael-mobile-android`, the platform chrome. Android: "Depth is tone … never a blurred shadow" ([wael-mobile-android SKILL.md](file:///C:/Projects/Wael%20Academy%20Prototype/.claude/skills/wael-mobile-android/SKILL.md)).

The game apps already have an exemption for points, levels and leagues. Wael speaking in bubbles is already logged as an open question ([FEATURES.md](file:///C:/Projects/Wael%20Academy%20Prototype/docs/FEATURES.md)). The skill text itself is unchanged, though, so the amendments below need the owner's explicit approval before anyone builds against them.

| # | Rule as written today | Why a 3D Wael treatment breaks it | Amendment to approve (scope: `/mobilegame`, `/webgame`) |
|---|---|---|---|
| A1 | Non-negotiable 17: "A character only where a matière is honestly in context … there is no neutral Wael. The badge squashes, never speaks or nags" | Wael greets, guides and reacts on every first-launch screen, including ones with no matière | **Wael is the presenter of the game apps.** Neutral and pose-set Wael is allowed. He speaks in **bubbles of 8–12 words** (length from [ux-best-practices.md](file:///C:/Projects/Wael%20Academy%20Prototype/docs/onboarding/ux-best-practices.md)). A voice comes only with real recorded or TTS audio, always mutable. He never nags or guilt-trips. |
| A2 | Non-negotiable 13: "Nothing animates on mount except `.rise`; nothing loops except the live halo". iOS skill: "nothing animates on load" | A character entrance, an idle blink and the already-shipped island bob all break it | On the splash and onboarding screens only: **one entrance choreography under 600 ms**, **one ambient loop per screen** (the island bob), and an **event-driven blink**. All of it sits inside `prefers-reduced-motion: no-preference` and pauses when hidden or after inactivity. No continuous body bob on Wael. |
| A3 | Non-negotiable 3: "No blurred shadow under play except the live halo" | A rendered character standing on UI needs a soft contact shadow. The splash already uses black blurred drop-shadows | **Static, soft contact shadows under illustrations only** (Wael, island, stamped objects), tinted with the brand's green/teal (`rgb(21 58 45 / …)` on light grounds, `--v2-edge-deep`-based on dark grounds). Never under controls or cards, never an animated blur. Replace today's black `rgba(0,0,0,…)` shadows. |
| A4 | Non-negotiable 1: "Depth = pressable. A lip only on what takes a tap" | Renders and parallax layers are full of depth. The « +30 نقطة » sticker has a lip but is not tappable | Clarify that **illustration depth is art, not UI depth**. Informational chips stay **flat with a 2 px border** (flatten the sticker's lip, or explicitly declare "stickers" an exception). |
| A5 | Out of scope: eye expressions belong to the eyes pipeline (`wael-subject-eyes`); "a neutral Wael for matière-less empty states" is not commissioned | A blinking and talking Wael needs its own eye and mouth layers | **Wael's blink and mouth layers form a separate character pipeline** (`art.ts` parts, `/map/atelier`). The subject-eyes pipeline stays for the badges. |
| A6 | "Proposed but not built: `canvas-confetti`, NumberFlow and **Motion** … replaced by `Burst`, `Num`, CSS" | Rive or `stacked-alpha-video` would be the first animation runtimes | Record adopting any runtime as a **new-dependency decision**, lazy-loaded on the game routes only, after a device benchmark (see §5 and §10). |
| A7 | Non-negotiable 11: one celebration per screen visit, one `Burst`, gone in 700 ms | A cheering Wael on top of a burst could read as two celebrations | Define **Wael's cheer pose as part of the same celebration** as the burst: same frame, same cue. It never adds a second moment. |

Two existing rules stay as they are and *help*. "Keep (do not mirror) logos, photos, illustrations, the mascot" in RTL ([wael-mobile-ios SKILL.md](file:///C:/Projects/Wael%20Academy%20Prototype/.claude/skills/wael-mobile-ios/SKILL.md)) gets one addition: *ship facing-specific renders*. The sound rules (a semantic `uisfx` cue per action, no sounds on load, "sound and visual on the same frame") apply unchanged ([sound-effects.md](file:///C:/Projects/Wael%20Academy%20Prototype/docs/sound-effects.md)). The tone rules also stay unchanged: second person singular, at most one exclamation per screen, no emoji, Western digits in `<bdi dir="ltr">`.

Some ground is already covered and this file does not repeat it: onboarding psychology and the auth gate ([ux-best-practices.md](file:///C:/Projects/Wael%20Academy%20Prototype/docs/onboarding/ux-best-practices.md)), the 20-app teardown ([docs/onboarding/inspiration.md](file:///C:/Projects/Wael%20Academy%20Prototype/docs/onboarding/inspiration.md)), mascot placement, motion tables and the CSS/SVG/Rive/Lottie comparison ([ui-tips.md](file:///C:/Projects/Wael%20Academy%20Prototype/docs/onboarding/ui-tips.md)), gamification values ([gamification-design.md](file:///C:/Projects/Wael%20Academy%20Prototype/docs/mobile/gamification-design.md)) and the 2026 trend radar ([trends-2026.md](file:///C:/Projects/Wael%20Academy%20Prototype/docs/mobile/trends-2026.md); folder [docs/mobile](file:///C:/Projects/Wael%20Academy%20Prototype/docs/mobile/)). Font and token sources are [fonts.css](file:///C:/Projects/Wael%20Academy%20Prototype/src/styles/fonts.css) and [v2.css](file:///C:/Projects/Wael%20Academy%20Prototype/src/styles/v2.css).

---

## 2. Stylised, reactive and facing the content: principles for a 3D teacher

### Faces and gestures earn the benefit, not polygons

The research gives a **small, reliable learning effect and a larger liking effect**. The multimedia-agent meta-analysis (32 effect sizes, N = 2104) found g ≈ 0.20 overall, with 2D agents (g+ ≈ 0.38) well ahead of 3D agents (g+ ≈ 0.11) ([Castro-Alonso et al. 2021](https://doi.org/10.1007/s10648-020-09587-1)). Gesturing agents produce a persona effect of g ≈ 0.44 ([Davis 2018](https://data.zhenzhi.com/details/1/913707970)). Facial expressions and gestures moderate persona more than voice or agent type does ([Davis, Park & Vincent 2021](https://informahealthcare.com/doi/full/10.1080/15391523.2020.1830894)). Faces added to learning graphics help learning and enjoyment ([Brom, Stárková & D'Mello 2018](https://artemis.ms.mff.cuni.cz/main/papers/emodesign_manuscript_1rev_180928_FINAL_norev.pdf); [Smart Learning Environments 2024](https://slejournal.springeropen.com/articles/10.1186/s40561-024-00332-7)). Agent effects shrink with age, being larger for K-12 than for post-secondary learners ([Schroeder, Adesope & Gilbert 2013](https://doi.org/10.2190/EC.49.1.a)). For 15–19-year-olds, sell Wael as an **engagement and emotional-safety device**, not as a score booster.

The strongest steelman *against* a 3D Wael is the 2D-beats-3D finding itself. The answer is that "3D" in that literature mostly meant more realistic agents. A soft, caricatured, consistently lit render that behaves like a 2D mascot (few poses, crisp silhouette, reactions) keeps the 2D virtues while meeting the owner's wish for volume. Duolingo's experience matches: the team moved away from an iOS-7-era fully textured 3D Duo it found "creepier", toward a flatter, more expressive and more scalable owl ([Design Week](https://www.designweek.co.uk/issues/2-6-january-2019/duolingo-owl-receives-makeover-as-app-becomes-more-gamified); [Creative Bloq](https://creativebloq.com/news/duolingos-redesigned-mascot-is-a-hoot)). One report links animating Duo to about a 5 % rise in sessions, but its original source could not be re-opened, so treat it as unverified.

Synthetic presenters that are *realistic* hold test scores level but lose engagement. Studies report "low video engagement", plus discomfort and disconnection ([IRRODL 2024](https://www.irrodl.org/index.php/irrodl/article/view/7815/6135)), a slight preference for human video in a 447-person study ([arXiv 2412.10384](https://arxiv.org/pdf/2412.10384)), and students who "strongly refrain from the synthetic avatar" ([ICERI 2023](https://library.iated.org/view/GAL2023AVA)). **A caricature of a real teacher is safer than a near-photoreal double.**

### What makes a character worth its cost: it reacts

Duolingo built its characters as a state machine, not as more static art. Idle loops (nods, blinks, brows) run alongside 20+ personality-styled mouth shapes, and right and wrong answers each have an end state, all in one Rive file ([Duolingo: world character visemes](https://blog.duolingo.com/world-character-visemes)). Lily's video call combines 8 head and 8 body clips into more than 64 idle variations, so she never loops visibly. The file stays under 1 MB. When testers found her wide-open eyes "too happy" for her deadpan persona, the team dialled them back ([Rive: Lily video call](https://rive.app/blog/duolingo-s-ai-powered-video-call-brings-lily-to-life)). That gives two rules:

- **Give Wael an expression ceiling** matched to his real temperament.
- **Spend animation on reactions to the student's state.**

Duolingo's widget shows the same principle in still form: Duo's mood illustrations follow time of day and streak status, and widget users retained much better ([Duolingo: widget](https://blog.duolingo.com/widget-feature/)). Silhouette came first in Duo's design: "if the overall silhouette isn't appealing, the details can't complement it" ([Duolingo: Reshaping Duo](https://blog.duolingo.com/reshaping-duo/)). Rewards, not characters, were Duolingo's entry point into Rive ([Rive: creative technologists](https://rive.app/blog/creative-technologists-duolingo-s-solution-to-the-designer-to-developer-handoff)). Elsewhere, Khan Academy Kids' Kodi guides and celebrates through body language ([Khan Kids help](https://khankids.zendesk.com/hc/en-us/articles/360049358751-Learn-more-about-the-characters-inside-Khan-Academy-Kids); [Khan Academy blog](https://blog.khanacademy.org/supporting-english-language-acquisition-with-khan-academy-kids/)). Finch creates ownership by having users hatch and name a pet ([screensdesign: Finch](https://screensdesign.com/articles/finch-app-onboarding-design/)). Royal Match's King Robert is "barely a character", more of a marketing hook ([orcz review](https://orcz.com/royal-match-review-the-puzzle-king-that-refuses-to-be-dethroned/)).

### The Clippy line: presence must be skippable

The Clippy concept was sound, but its invasiveness drove people away. The lesson drawn is to "optimize for repeated use, not just first time use" ([Command AI](https://www.commandbar.com/blog/what-clippy-taught-us-all); [TwentyBN](https://medium.com/twentybn/5-lessons-from-clippys-failure-efc69297eac1); [Nextgov](https://www.nextgov.com/artificial-intelligence/2018/08/microsoft-wants-nudge-us-be-more-productive-do-we-want-its-help/150830/)). Clash Royale lets players mute an opponent's emotes ([itechguides](https://www.itechguides.com/are-clash-royale-emotes-cosmetic-only-what-they-actually-do/)). Guilt mechanics backfire publicly: Duolingo's "sick" icon worried users, and the "dead Duo" stunt drew criticism alongside its 1.7 billion impressions ([Creative Bloq](https://creativebloq.com/design/logos-icons/is-duolingo-okay); [MediaPost](https://www.mediapost.com/publications/article/403787/duolingos-mascot-killing-stunt-generated-engageme.html); [Fast Company](https://www.fastcompany.com/91313082/duolingo-dead-duo-owl-social-media-campaign)). For baccalauréat students under stress, Wael **never looks desperate, never guilt-trips, and can be muted or skipped**. That matches the existing « مبعد » choice, which carries no guilt copy.

### Gaze and gesture steer attention, so point Wael at the work

Gaze-cueing studies find that a face looking *toward* a product raises attention to it and memory for it, while mutual gaze pulls attention onto the face ([Palcu et al. 2017](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5454066/); [Sajjacholapunt & Ball 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC3941030); [Hutton & Nolte 2011](https://zendy.io/title/10.1002/acp.1763)). One thesis dissents ([Univie thesis](https://utheses-gateway.univie.ac.at/api/document/get/file/26825)). In content screens, Wael's head and eyes turn toward the question card, the tiles or the CTA. **Direct eye contact is reserved for the greeting (splash, welcome) and the celebration (result, sign-up complete)**, where Wael himself is the message.

For gestures in the Arab world, avoid index-finger pointing (widely considered rude) and use the open hand ([Irish Times](https://www.irishtimes.com/news/how-to-lose-friends-and-alienate-people-1.1275324); [Wikivoyage: Gestures](https://en.wikivoyage.org/wiki/Gestures)). Sources conflict on the thumbs-up ([Wikipedia: Obscene gesture](https://www.wikipedia.org/wiki/Obscene_gesture)), and the OK sign can read as "zero" or as an insult ([englishtoarabic guide](https://englishtoarabic-org.pages.dev/culture/gestures/)). The standard Wael vocabulary is therefore:

- **open palm** to present
- **both hands raised** to celebrate
- **hand on chin** to think
- **gentle shrug** for "not quite"

Thumbs-up waits until Tunisian teens have been tested.

### Tone for 15–19: dry, warm, peer-like

The "childish" risk for teenagers comes from **tone, not volume**: baby talk, constant cheering, guilt. Duolingo's Gen Z lead says the audience "wants to be entertained, not sold to" ([business.com interview](https://www.business.com/b-newsletter/content/duolingo-tiktok/); [HubSpot](https://blog.hubspot.com/marketing/duolingo-unhinged-content)). Lily's sarcasm shows that a cartoon can be "cool" through attitude ([Duolingo fandom: Lily](https://duolingo.fandom.com/wiki/Lily); [duoplanet](https://duoplanet.com/duolingo-character-names/)). Wael's voice should stay closer to Lily than to Kodi: Tunisian derja, verbs first, at most one exclamation.

### RTL: re-pose, never mirror

Platform guidance agrees on most of it. Mirror the layout, navigation, progress direction and depictions of forward motion. Do **not** flip logos, clocks, real-world objects or general artwork: Apple says "Avoid flipping images like photographs, illustrations, and general artwork" ([Apple HIG: Right to left](https://developer.apple.com/design/human-interface-guidelines/right-to-left); [Material M1: Bidirectionality](https://m1.material.io/usability/bidirectionality.html); [Material M2](https://m2.material.io/go/design-bidirectionality); [Wikimedia Codex](https://doc.wikimedia.org/codex/main/style-guide/bidirectionality.html)). Some illustrations "may require a version for each direction" ([Cloudscape](https://cloudscape.design/foundation/core-principles/bidirectionality/)). Material says a walking figure faces left in RTL. Sources disagree on media controls: Wikimedia mirrors them, while Material, Mozilla, Microsoft and Adobe do not ([Codex v1.18](https://doc.wikimedia.org/codex/v1.18.0/style-guide/bidirectionality.html); [Mozilla](https://firefox-source-docs.mozilla.org/code-quality/coding-style/rtl_guidelines.html); [Microsoft Learn](https://learn.microsoft.com/en-us/globalization/input/mirroring); [Adobe Spectrum](https://spectrum.adobe.com/page/bi-directionality)).

For Wael this means: **each "present" or "point" pose ships as a left-facing and a right-facing render, chosen by layout side, never by CSS `scaleX(-1)`.** Mirroring would reverse his parted beard, a watch, a writing hand or any text on a prop. In `/mobilegame` the screen is always `dir="rtl"` and Wael lives on the end (left) side, so the *right-facing* set comes first. The left-facing set is only needed for LTR layouts such as a French `/webgame`.

### Consent, authorship and the "AI look"

Three non-visual risks matter more than any frame rate.

**Consent.** A person's likeness is protected by privacy and publicity rights, not copyright ([rightofpublicityroadmap](https://rightofpublicityroadmap.com/news_commentary/copyright-office-calls-for-congressional-action-on-digital-replicas/); [Jenner & Block](https://www.jenner.com/en/news-insights/client-alerts/us-copyright-office-issues-digital-replica-report-finding-urgent-need-for-new-federal-legislation); [Authors Alliance](https://authorsalliance.substack.com/p/some-initial-thoughts-on-the-us-copyright)). **Get Wael's written consent** to the caricature and its uses.

**Authorship.** Purely AI-generated art is not copyrightable in the US. Prompting alone is not authorship, and only human post-generation edits are registrable ([Carlton Fields](https://www.carltonfields.com/insights/publications/2025/no-copyright-protection-for-ai-assisted-creations-thaler-v-perlmutter); [Mondaq: Thaler](https://www.mondaq.com/unitedstates/new-technology/1704524/dr-thaler-is-right-in-part); [Mondaq: Allen v. Perlmutter](https://www.mondaq.com/unitedstates/copyright/1735886/when-600-prompts-still-arent-enough-what-allen-vs-perlmutter-means-for-ownership-copyright-and-creative-contracts); [Troutman](https://www.troutman.com/insights/copyright-office-advises-on-copyrightability-of-generative-ai-works/)). **Keep a log of human cleanup and edits** for the brand asset. Tunisian law was not researched.

**The AI look.** Gen Z is about 28 % more likely than average to lose trust in brands using AI content, and 41 % trust brands less when AI is visible ([Klaviyo](https://klaviyo.com/blog/how-gen-z-use-ai)). 73 % of US teens want AI images labelled ([TechCrunch](https://techcrunch.com/2025/01/29/report-majority-of-u-s-teens-have-lost-trust-in-big-tech/)). Young people's excitement about AI fell 14 points in a year ([Fast Company](https://fastcompany.com/91577499/gen-z-ai-every-day-less-trust)). Gamers punish even suspected AI art ([itch.io thread](https://itch.io/t/6518855/do-you-struggle-with-ai-art-consistency-in-your-games); [strayspark](https://www.strayspark.studio/blog/ai-slop-game-development-using-ai-responsibly); [itch.io post](https://itch.io/post/12983810); [itch.io post](https://itch.io/post/9880911); [Steam forum](https://steamcommunity.com/discussions/forum/12/601905718689404150/?ctp=2)). The tell-tales are a plastic sheen, drifting details between poses, broken hands and over-smooth symmetric faces ([kyndrify](https://kyndrify.com/articles/why-ai-faces-look-distorted); [ryla.ai](https://ryla.ai/en/blog/how-to-make-ai-generated-people-look-more-realistic/)). The current `wael_base.png` is described as "soft, Pixar-like CGI". *(proposal)* Steer the material toward **soft matte clay** (subsurface warmth, less specular gloss), as in the clay references E2–E3 in §9, and make a human retouch pass on face and hands mandatory.

---

## 3. A twelve-pose Wael on one canvas: the character system

### The starter pose and expression set

Published systems give only rough anchors: 20+ visemes, 8 + 8 idle clips, about 25 widget illustrations per batch ([Duolingo: visemes](https://blog.duolingo.com/world-character-visemes); [Rive: Lily](https://rive.app/blog/duolingo-s-ai-powered-video-call-brings-lily-to-life); [Duolingo: widget](https://blog.duolingo.com/widget-feature/)). Practitioners recommend **2–4 core states, each with a job** ([svgapp.ai](https://svgapp.ai/blog/app-mascot-design-product-moments/); [characteranimationai](https://www.characteranimationai.com/blog/app-mascot-design-guide); [WisdomAI digest of @adamlyttleapps](https://www.wisdomai.com/insights/adamlyttleapps/app-mascot-ai-design-swiftui-character-animation-54218ce5)). Locally, `ui-tips.md` §2 already assigns one pose per step: welcome waving, level curious, section nodding, subject dressed, question focused, right "fist up", wrong "shrug", result proud ([ui-tips.md](file:///C:/Projects/Wael%20Academy%20Prototype/docs/onboarding/ui-tips.md)). The set below *(proposal)* merges those sources into about a dozen stills, enough for splash, onboarding, rewards, errors and empty states.

| Pose id (file stem) | Used on | Gesture and expression | Gaze | Facings | Layers |
|---|---|---|---|---|---|
| `wael_wave` *(exists: `wael_base.png`)* | Splash (new user), welcome | Smile, right hand raised waving | Student (greeting) | One, body turned toward the CTA side | Blink + mouth |
| `wael_present` | Splash (returning), welcome route cards, login | Open palm toward the content | Content / CTA | R first, L later | Blink + mouth |
| `wael_curious` | Level | Head tilt, slight lean toward the tiles | Tiles | R | Blink |
| `wael_nod` | Reaction to a level or section pick | Head dipped, closed-mouth smile | Picked tile | R | Blink |
| `wael_subject_<family>` | Subject | Dressed or holding a prop per subject family (e.g. lab coat for sciences, book for Arabic/philo, globe for history-geo, headphones for languages) | Badges | R | Blink |
| `wael_think` | Quiz question, SMS-code wait | Hand on chin | Question card | R | Blink |
| `wael_cheer` | Correct answer, small wins | Both hands raised (no thumbs-up yet) | Student, briefly | One | Blink |
| `wael_hmm` | Wrong answer | Gentle shrug, soft smile, never mocking | The revealed right answer | R | Blink |
| `wael_proud` | Result | Arms crossed, smile (echoes the 2D `Caracter.png`) | Score | One | Blink + mouth |
| `wael_form` | Sign-up, login form | Open palm toward the form / saved-score panel | Form | R first, L later | Blink |
| `wael_celebrate` | Sign-up complete / town greeting (once) | Big two-arm celebration | Student | One | Blink |
| `wael_calm` | Empty states, errors, offline | Relaxed, hands at the sides | Content | One | Blink |

The subject variants answer the spirit of non-negotiable 17 ("a character only where a matière is honestly in context") on the one screen where the subject *is* the context. Start with four families rather than one variant per subject. Compose poses so that **hands sit at the sides, hold an object, or form a simple silhouette**, because hands are where AI output breaks most often ([glbgpt](https://www.glbgpt.com/hub/why-ai-video-gets-hands-and-faces-wrong); [emazzanti](https://www.emazzanti.net/blogs/articles/ai-extra-fingers-digital-art)).

### Canvas, anchor and light: the artist's guide already defines the rules

The project's art guide was written for the town, but its character rules fit Wael exactly ([village-art-guide.md](file:///C:/Users/USER/AppData/Local/Temp/claude/d19e79e29968456c/fc0fda62-1e96-448a-9539-5c3319c0e1a3/scratchpad/artzip/art/village-art-guide.md)). These rules are fixed:

- **Canvas:** the large character (presenter) canvas is **1024 × 1536 with the anchor at 512, 1472**, between the feet. Every pose, frame and layer uses the same canvas, the same anchor pixel and one scale for all characters of a kind.
- **Light:** **light from the top left** "in every image, video and frame", because "the app adds its own shading and effects in this direction". The iOS clear-glass specular rim is also bright top-left, so art and chrome already agree.
- **Content:** no text, letters, logos or watermarks. Transparent PNG-32 sRGB, never JPEG for sprites. Shadows stay inside the canvas, and a soft contact shadow is fine.
- **Resolution:** generate at 2K/4K and only scale down. Check at 200 % (no AI noise) and at 64 px wide (the silhouette must read).
- **Variants:** make each variant by editing an approved image, never by regenerating from scratch (Nano Banana Pro, shown as "Gemini 3.0 Pro" in Scenario, is recommended).
- **Delivery:** lowercase underscore names. Finals live in Scenario collections tagged **`approved`**.

The town's own canvases follow the same logic (building 1536 × 2048 with the anchor at 768, 1728; prop 1024 × 1024 at 512, 832; 1 tile = 1024 px, drawn at 1/16 on the map) ([town README](file:///C:/Projects/Wael%20Academy%20Prototype/src/assets/town/README.md); [src/assets/town](file:///C:/Projects/Wael%20Academy%20Prototype/src/assets/town/)). The guide's isometric camera rules apply to the town, not to Wael. He is a front or three-quarter presenter. The light rule binds both, so the composite reads as one scene. Inconsistent light direction is the most common failure in 2.5D composites, per the inspiration synthesis in §9.

*(proposal)* Two refinements apply to this app. First, **never trim the transparent margins** of a web export, because the anchor must survive so that pose swaps don't jump. Second, export **one web size per pose, 512 × 768 WebP** (half the master). That covers both the splash slot (about 340 CSS px tall, about 680 device px at 2×) and the 27 % aside slot. Decoded, it costs about 1.6 MB per pose (w × h × 4) ([imagecompressor.com](https://imagecompressor.com/blog/how-browsers-handle-images)). With 12 poses that is about 19 MB if everything is decoded at once, so **preload only the current and next screen's poses** with `img.decode()`.

### Blink and mouth layers stacked on each pose

The guide defines layered characters precisely ([village-art-guide.md](file:///C:/Users/USER/AppData/Local/Temp/claude/d19e79e29968456c/fc0fda62-1e96-448a-9539-5c3319c0e1a3/scratchpad/artzip/art/village-art-guide.md)):

- `<name>_base.png` with eyes open and mouth closed
- `_eyes_half`, `_eyes_closed`
- `_mouth_rest` (M/B/P), `_mouth_a` (A/I), `_mouth_e` (E), `_mouth_o` (O), `_mouth_u` (U/W), `_mouth_f` (F/V)

Every patch is full-canvas and transparent outside the face. Each is made by editing the base ("same image, identical in every way, except the eyes are closed"), and the toggle test allows only the eyes and mouth to change. `art.ts` already parses exactly these names ([art.ts](file:///C:/Projects/Wael%20Academy%20Prototype/src/features/map/art.ts)).

The community adds craft rules for avoiding flicker ([Spritefy](https://spritefy.com/blog/consistent-ai-pixel-art-characters); [neolemon](https://www.neolemon.com/blog/ultimate-guide-to-creating-consistent-characters/)):

- Derive patches from the same render so light and AO match.
- Feather patch edges by 2–4 px.
- Keep patches on integer pixel positions.
- Swap by toggling the opacity of **pre-mounted** layers rather than changing `src`, which can blank a frame.

*(proposal)* Budget the layers by need. **Blink layers on every pose** (2 patches × 12) are cheap and give the most life per byte. **Mouth layers only on the 2–3 talking poses** (`wael_wave`, `wael_present`, `wael_proud`), and only once Wael has a real voice (see §5). Blink timing in the local toolkit is **90 ms every 4–7 s** ([gamification-design.md](file:///C:/Projects/Wael%20Academy%20Prototype/docs/mobile/gamification-design.md)).

### The Scenario production pipeline

The pipeline below reuses what exists: `wael_base.png`, `Caracter.png` as the identity reference, the town's Photoroom → `fit.py` route, and `/map/atelier`. It adds the identity-lock discipline practitioners converge on: lock the identity once, re-pose by editing **from the master**, and judge results side by side on a grid ([Scenario: turnarounds](https://www.scenario.com/blog/generate-character-turnarounds-scenario); [Scenario help: character variations](https://help.scenario.com/articles/4310019350-generate-character-variations-with-image-to-image); [neolemon](https://www.neolemon.com/blog/ultimate-guide-to-creating-consistent-characters/)).

| Step | What to do | Tool / where | Check before moving on |
|---|---|---|---|
| 1. Lock identity and consent | Approve `wael_base.png` as the master with the owner *and Wael*. Record written consent and Wael's temperament (it sets the expression ceiling). | Owner | Signed consent; "too much / too little" notes |
| 2. Style bible | Half a page: soft matte clay, light top-left, warm key, subtle cool rim, caricature ratios (bigger head, simplified features), fixed outfit (black polo, rolled blue jeans, black-and-white sneakers, round dark glasses, short beard). "Pixar style" alone is a weak anchor ([neolemon Pixar guide](https://www.neolemon.com/blog/ai-pixar-generator-copyright-safe-guide/); [selfielabstudio](https://selfielabstudio.com/blog/3d-stylized-characters-minimal-pixar-prompts-20260219)). Never name studios or artists in prompts (guide rule). | Doc in `src/assets/characters/` | Everyone prompts from the same text |
| 3. Reference pack | Front, both three-quarters, profile, face close-ups, neutral A-pose, same light. One snippet prompt for such a sheet is front/back/profile plus close-ups on a neutral background in an A-pose ([YouTube: Nano Banana Pro character sheets](https://www.youtube.com/watch?v=aoynusO5PUc)). | Scenario, Nano Banana Pro / "Gemini 3.0 Pro"; Nano Banana 2.1 accepts up to 14 references ([Scenario changelog](https://www.scenario.com/changelog); [Scenario: Nano Banana use cases](https://www.scenario.com/blog/nano-banana-use-cases-ai-content-creation)) | Grid review: same face in every view |
| 4. Re-pose | Edit from the master (or the nearest *approved* pose), never from the latest unapproved output, to stop cumulative drift ([Spritefy](https://spritefy.com/blog/consistent-ai-pixel-art-characters)). Change one variable at a time. Prompt the background as flat and say "solo, no background" ([Scenario: hyper-casual characters](https://www.scenario.com/blog/creating-hyper-casual-mobile-characters)). | Scenario "Edit with prompt" | Side-by-side with master at the same scale |
| 5. Cut out | Remove the background. Photoroom was used for the town. BRIA RMBG-2.0 is CC BY-NC and needs a commercial licence ([RMBG-2.0](https://github.com/Bria-AI/RMBG-2.0); [BRIA commercial](https://bria.ai/rmbg-for-commercial-use); [Runware: RMBG 2.0](https://runware.ai/models/bria-rmbg-2-0-open)) | Photoroom | Clean alpha on teal `--v2-chapter` *and* mint grid |
| 6. Fit to canvas | `fit.py` handles only `building\|prop` today and only scales down ([fit.py](file:///C:/Projects/Wael%20Academy%20Prototype/scripts/town-art/fit.py)). *(proposal)* Add a `character` mode: find the feet's bottom centre, scale to one fixed body height shared by all poses, place it at 512, 1472. | `python -I scripts/town-art/fit.py … character wael_<pose>` | Anchor within 4 px; no upscale warning |
| 7. Blink (and mouth) layers | Edit the fitted pose: "identical except the eyes are closed", mask, export full-canvas patches | Scenario edit + mask | Toggle test in `/map/atelier` ([ArtAtelier.tsx](file:///C:/Projects/Wael%20Academy%20Prototype/src/features/map/ArtAtelier.tsx)) |
| 8. Human retouch | Face and hands pass (Scenario Retouch focuses there ([Scenario: turnarounds](https://www.scenario.com/blog/generate-character-turnarounds-scenario))); low-strength regeneration of a bad hand ([itch.io thread](https://itch.io/t/6518855/do-you-struggle-with-ai-art-consistency-in-your-games)). Log what was changed by hand. | Krita/Photoshop | Authorship log updated |
| 9. QA | Guide checklist (§8): 200 % / 64 px, flip test, alpha on dark and light, no text, light top-left | `/map/atelier`, grid sheet | All boxes ticked |
| 10. Export and file | Master PNG-32 → `src/assets/characters/wael_<pose>[_r\|_l].png`; web `512×768` WebP; Scenario collection `characters`, tag `approved` | Repo + Scenario | Name matches guide convention |
| Later: character model | After 15–30 approved poses, train a **character model** (not a style model, which "does not guarantee" identity) ([Scenario help: multi-character scenes](https://help.scenario.com/articles/8459982289-generate-multi-character-scenes)). Ask before training, because it costs credits. | Scenario training | Owner approval |
| Later: gestures from video | See §5: key-colour start frame, Kling or PixVerse, extract, key, stacked-alpha encode | Scenario video models | Guide rejection rules |

Scenario's official videos cover the same ground: [custom-trained models talk](https://www.youtube.com/watch?v=Ag2Ta-N7OEU), [train a character model](https://www.youtube.com/watch?v=aQZpeeLUXWs), [character reference](https://www.youtube.com/watch?v=rdGe376gR40) and [turnaround workflow templates](https://www.youtube.com/watch?v=7u2FBSB3vck). Only their titles could be verified. Other titles found but unverified: [Nano Banana proportions and re-posing](https://www.youtube.com/watch?v=Nn8G9zJlW8o), [consistent characters with Nano Banana 2](https://www.youtube.com/watch?v=q2HrtCCmzdc), [consistent edits across scenes](https://www.youtube.com/watch?v=YafeGI4ZGt0). If Midjourney is ever used, `--oref` takes one image, weights of about 100–400 suit illustration, outputs can't be inpainted, and it costs 2× GPU ([prompt-architects](https://prompt-architects.com/blog/92-midjourney-character-consistency-cref-oref); [aicreative.tools](https://aicreative.tools/guides/midjourney-character-consistency); [tegutegu](https://note.com/tegutegu_cat/n/naa3d9e546b68?hl=en)). Lighting drift between separately generated images is the hardest thing to fix afterwards ([evartology comments](https://evartology.substack.com/p/image-and-video-ai-character-consistency-step-by-step-beginner-guide/comments); [imagine.art](https://www.imagine.art/blogs/character-design-essentials-maintaining-consistency-in-visual-storytelling)), which is why the light clause stays fixed in every prompt.

---

## 4. Depth belongs to the art and the buttons: a catalogue of 3D UI effects

### What reads current in 2026 and what reads dated

Mid-2026 trend writing describes a return of "physical qualities" (layering, translucency, tactile buttons) after the flat era ([Designity](https://www.designity.com/blog/ui-ux-design-trends); [daisyUI: material and dimensional UI](https://trends.daisyui.com/material-dimensional-ui/); [daisyUI 2026 trends](https://trends.daisyui.com/ui-design-trends-2026/)). Claymorphism still gives "onboarding, education, and friendly consumer products a tactile personality" ([Pixso](https://pixso.net/articles/glassmorphism-vs-neumorphism-vs-claymorphism/); [Pixso trends](https://pixso.net/articles/7-ui-ux-design-trends/); [LogRocket](https://blog.logrocket.com/ux-design/what-is-claymorphism-web-design)), but its peak is placed in 2025 ([Clay](https://clay.global/blog/skeuomorphism-ui)).

Practitioners are split. A blog post listed 3D characters first among trends its author was "sick of": overexposed, heavy, decorative ([Pixeldarts](https://www.pixeldarts.com/post/2024-design-trends-i-am-sick-of)). Others warn against 3D outside playful brands ([ManyPixels](https://www.manypixels.co/blog/illustrations/icon-trends)) or say chrome 3D is overdone ([techyheaven](https://techyheaven.com/ui-design-trends-2026/)). Still others say 3D "makes products feel expensive" ([softwaretestinghelp](https://www.softwaretestinghelp.com/ui-ux-design-trends/)). The craft consensus is **restraint plus coherence**: the same light, angle, material and softness across all 3D pieces, depth only on key actions, and not too much "puffiness" ([Megabant](https://www.megabant.com/3d-social-media-icons-design-trends-and-best-practices/); [DiCristina Creative](https://dicristinaphoto.com/soft-and-tactile-the-designers-guide-to-claymorphism/)).

| Status in 2026 | Treatment | For Wael Academy |
|---|---|---|
| **Current, safe** | Tactile pressable buttons with a lip; pre-rendered 3D characters and props with consistent lighting; soft contact shadows; subtle rim light on hero objects; spring motion; glass only on floating chrome | The core of the treatment |
| **Established, use with taste** | Clay or soft-inflated 3D for illustrations and icons | Wael, the island, subject props: yes. Puffy cards everywhere: no |
| **Niche but on-trend for game apps** | 2.5D isometric scenes, floating islands and dioramas | The town already is one. Deliver it as pre-rendered layers |
| **Dated or risky** | Neumorphism; glass over content cards; perspective card-flip galleries; gyroscope parallax on every screen; autoplaying WebGL heroes on mobile | Avoid |

Platform anchors confirm the split. Apple's Liquid Glass forms "a distinct functional layer for controls and navigation", "Don't use Liquid Glass in the content layer", "Use Liquid Glass effects sparingly", and Apple suggests a 35 % dimming layer over bright content ([Apple HIG: Materials](https://developer.apple.com/design/human-interface-guidelines/materials)). One secondary report says WWDC26 refined glass for complex backgrounds ([macmyths](https://macmyths.com/wwdc-2026-apple-refines-liquid-glass-across-its-next-generation-operating-systems/)). Material 3 Expressive replaces duration curves with spring motion schemes and more expressive shapes ([9to5Google](https://9to5google.com/2025/05/13/android-16-material-3-expressive-redesign/); [Android Authority](https://www.androidauthority.com/google-material-3-expressive-features-changes-availability-supported-devices-3556392/); [Supercharge Design](https://supercharge.design/blog/material-3-expressive)). Community token values are illustrative and inconsistent ([material_expressive](https://pub.dev/documentation/material_expressive/0.8.0/); [M3EMotion](https://pub.dev/documentation/m3e_slider/0.0.2/common_m3e_common/M3EMotion-class.html); [besthub](https://www.besthub.dev/articles/why-google-s-material-3-update-turns-motion-into-a-theme-it-s-not-about-the-bounce-9436fce4a345); [Google codelab](https://codelabs.developers.google.com/codelabs/mdc-102-objc)).

### Component catalogue

"Rule status" refers to the amendments in §1. Costs are qualitative.

| Effect / component | Use it for | Don't use it for | Cost | Accessibility | Rule status |
|---|---|---|---|---|---|
| **Pressable lip button** (face on a darker zero-blur edge; collapses in 80 ms, springs back in 180 ms) | Every tap target: CTA, tiles, chips that act | Information-only surfaces | 0 JS; transform-only press is cheapest ([Josh W. Comeau](https://www.joshwcomeau.com/animation/3d-button/); [dev.to: satisfying buttons](https://dev.to/ammadeo/art-of-making-satisfying-buttons-1407); [dev.to: pushable button](https://dev.to/danielzotti/learnedtoday-pushable-3d-button-203m)) | Keep the press displacement under reduced motion (it is state feedback); 3 px teal focus ring *outside* the lip; whole button ≥ 44 pt / 48 dp | Core rule; already built (`gCta`, platform CTAs) |
| **Pre-rendered 3D character still** | Splash hero, `WaelAside`, sign-up/login panels, empty states | Inline in dense lists | Image bytes only | `alt=""` + `aria-hidden` when decorative; anything a pose conveys (wrong answer) must also be in text and sound | A1 |
| **Contact shadow** (static radial-gradient ellipse under feet or island) | Grounding Wael and the island; shrink it (transform) when Wael hops | Under cards or buttons | ~0; never animate `filter`/blur ([web.dev: animations](https://web.dev/articles/animations-guide)) | None | A3 |
| **Layered depth / parallax diorama** (3–5 PNG/WebP layers translated by depth factor) | Splash only, gently | Content screens, scroll-linked effects | Low, compositor-only; `perspective` creates a stacking context ([MDN: perspective](https://developer.mozilla.org/en-US/docs/Web/CSS/perspective)) | Parallax is named as non-essential motion under WCAG 2.3.3: off under reduced motion ([W3C](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)) | A2 |
| **Floating island bob** | The splash's single ambient loop (exists: 8 px / 6 s) | A second loop on the same screen | Compositor-only | 6 s ≈ 0.17 Hz sits near Apple's 0.2 Hz warning, so keep amplitude tiny ([Apple HIG: Motion](https://developer.apple.com/design/human-interface-guidelines/motion)) | Already accepted; formalise in A2 |
| **Floating reward chips** (« +30 نقطة », a level tag) | 1–3 chips near the hero's shoulder line or the island; static, or one pop at entrance | Over the face or the CTA; float loops | ~0 | Real text; contrast ≥ 4.5:1 | A4 (flat, 2 px border) |
| **Tilt card** (pointer, or gyro after an explicit tap) | Optional delight on the result score card or a collectible; desktop gallery pointer only | Default on phones; every card | Low; gyro needs `DeviceOrientationEvent.requestPermission()` from a tap and is absent in cross-origin iframes ([MDN](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static); [WebKit bug 221399](https://bugs.webkit.org/show_bug.cgi?id=221399); [OpenReplay](https://blog.openreplay.com/understanding-device-orientation-api/)) | Opt-in; off under reduced motion | Owner decision |
| **Glass** | iOS controls only: back button (`ios-glass` exists), sheet header; 35 % dim over bright art | Content cards over the 3D art; Android (use tonal surfaces) | `backdrop-filter` is paint-heavy; one surface, small radius, never animated | Swap to opaque under `prefers-reduced-transparency` / `prefers-contrast` (support to verify) | iOS skill already |
| **Burst and stamp** | One earned celebration (exists: 16 particles, 700 ms; tilted stamp) | Arrival, generic praise | ~0 | Hidden under reduced motion; replace with a static stamp + sound | A7 |
| **Card flip** (`rotateY`, 400 ms, from the local toolkit) | A single reveal (e.g. the right answer, a locked round) | Galleries | Low | Crossfade under reduced motion | Fine within existing rules |
| **Rim light / edge highlight** | Baked into renders, matching the top-left key | CSS glows on UI | 0 (in the art) | None | Art guide |
| **Claymorphic surfaces, neumorphism, live WebGL heroes** | — | Anywhere in the flow | High | Legibility (neumorphism), vestibular, battery | Avoid |

The **text-over-3D rule** for the whole catalogue: put text on a solid or near-solid surface (cream card, chapter panel, button face), measure contrast against the busiest pixels (≥ 4.5:1 body, ≥ 3:1 large), and give Arabic display text about **2 pt** more than its Latin equivalent ([Apple HIG: Right to left](https://developer.apple.com/design/human-interface-guidelines/right-to-left)).

### The technology ladder, and where this stack should stop

| Rung | What | JS added | Idle GPU/battery | Cold-start risk on mid Android | Use in the Wael app |
|---|---|---|---|---|---|
| 1 | **Pre-rendered AVIF/WebP + CSS transforms** | ~0 | None when static | Low (bytes only) | **Everything now**: poses, island, props, chips, splash ([web.dev: animations](https://web.dev/articles/animations-guide)) |
| 2a | **Rive** (canvas or webgl2) | WASM ~78 KB ([Pixelpoint](https://pixelpoint-website-6l3rd8f5q-pixelpoint.vercel.app/blog/rive-react-optimizations)), or ~200 KB gzipped runtime by another estimate ([aidxn](https://aidxn.com/engineering/lottie-animations-vs-css-vs-rive-2026/)) | Low if paused offscreen | Medium (WASM fetch + compile) | **Later**, when Wael talks with audio or needs combinable idles |
| 2b | **dotLottie** | ~150 KB WASM core ([LottieFiles](https://lottiefiles.com/blog/dotlottie/how-dotlottie-runtimes-solve-lottie.md)) | Low–medium | Medium | Vector micro-animations only. A poor fit for a raster render |
| 3 | **Transparent video** (stacked alpha: AV1 + HEVC) | Small component | Hardware decode | Low–medium (bytes) | **2–3 hero gestures** (splash wave, result cheer), lazy and motion-safe |
| 4 | **R3F / three.js** | Hundreds of KB | High unless `frameloop="demand"` ([R3F docs](https://r3f.docs.pmnd.rs/advanced/scaling-performance)) | High | Not in the flow. Maybe an opt-in trophy viewer later |
| 4 | **`<model-viewer>`** | Lib + three peer, ~280 KB gz (unverified) ([README](https://cdn.jsdelivr.net/npm/@google/model-viewer@4.2.0/README.md); [svilenkovic](https://svilenkovic.com/3d/model-viewer-google-tutorial)) | Medium | High if eager ([modelviewer.dev Lighthouse](https://modelviewer.dev/examples/lighthouse2.html); [Cloud Four](https://cloudfour.com/thinks/how-to-embed-3d-models-on-the-web/)) | No |
| 4 | **Spline** | Runtime + scene; embeds reported at about 1.5 MB ([Webflow forum](https://discourse.webflow.com/t/spline-has-a-bad-effect-on-pagespeed-issue/259849)) | Medium–high | High | No; at most a `/webgame` marketing hero, lazy |

The heaviest real-time options draw the most community complaints. Spline scenes have been called "extremely laggy" with about 6 s to appear on GPU-less laptops ([Framer community](https://www.framer.community/c/support/spline-3d-models-slows-website-on-some-pcs)), "brutal on mobile" ([fabric.so](https://fabric.so/comparison/spline-review); [designtools.fyi](https://designtools.fyi/tools/spline)), and costly to LCP/TBT ([Hedrick](https://hedrick.io/post/spline-3d-guide)). The runtime is improving ([splinetime3d](https://splinetime3d.substack.com/p/spline-womp-and-unicorn-studio-updates); [Spline updates](https://updates.spline.design/changelog/performance-optimization-update)), and Spline's own advice is to reuse geometry, compress, and stay under about 50k polygons on mobile ([Spline docs: optimize](https://docs.spline.design/doc/how-to-optimize-your-scene/doczPMIye7Ko); [Spline docs: CAD](https://docs.spline.design/importing-content/cad-to-spline-optimization-best-practices); [vp0](https://vp0.com/blogs/spline-3d-react-component-ai-prompt/); [skills.sh](https://skills.sh/freshtechbro/claudedesignskills/spline-interactive)). Real-time frame rate is bounded by vertices, draw calls and texture size ([neural4d](https://blog.neural4d.com/user-guide/optimize-3d-models-for-webgl/); [hontran.dev](https://www.hontran.dev/blog/three-js-performance-optimization)), and GPU-compressed KTX2 textures cut memory 4–8× ([Don McCurdy](https://www.donmccurdy.com/2024/02/11/web-texture-formats/)).

The Coastal World site is the best argument for the hybrid approach: Blender was its level editor and **its UI animations are CSS-only** ([Awwwards: Coastal World](https://www.awwwards.com/coastal-world-by-merci-michel-wins-site-of-the-month-august-2022.html)).

**Recommendation for this stack:** stay on rung 1 for the prototype rebuild, and add rung 3 for at most three gesture clips. Adopt rung 2a (Rive canvas, lazy-loaded on the game routes) only when a talking Wael is approved. Rungs 4 stay out of the first-launch flow.

### Recipes that fit the existing code

The lip button already exists in `ui.ts` and `platformUi.ts`. Comeau's timings (press about 34 ms, release 600 ms `cubic-bezier(.3,.7,.4,1)`) are the external reference, but the `play` skin's 80/180 ms values win ([Josh W. Comeau](https://www.joshwcomeau.com/animation/3d-button/)). Three small additions cover the rest of the 3D look *(recipe, built on [web.dev](https://web.dev/articles/animations-guide) and [web.dev: reduced motion](https://web.dev/articles/prefers-reduced-motion))*:

```css
/* Contact shadow under a render: static, tinted, never blurred by filter */
.wael-ground { position:absolute; inset-inline:18%; bottom:2%; height:7%;
  background: radial-gradient(closest-side, rgb(21 58 45 / .28), transparent);
  /* on the dark chapter ground use a deeper teal: rgb(5 42 48 / .45) */ }

/* Pose stack: all layers pre-mounted on the same 2:3 box, swap by opacity */
.wael-stack { position:relative; aspect-ratio:2/3; }
.wael-stack > img { position:absolute; inset:0; width:100%; height:100%;
  object-fit:contain; opacity:0; }
.wael-stack > img[data-on] { opacity:1; }
@media (prefers-reduced-motion: no-preference) {
  .wael-stack > img { transition: opacity 120ms linear; } }

/* Parallax layer: pointer-driven on desktop gallery only */
@media (prefers-reduced-motion: no-preference) and (hover: hover) {
  .depth { transform: translate3d(calc(var(--px,0) * var(--d) * 1px), 0, 0); } }
```

Use `<picture media="(prefers-reduced-motion: no-preference)">` to serve animated media only to users who allow motion ([web.dev: prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion)). For gyro tilt, ask only after a tap labelled as an effects opt-in, and clamp to ±15°.

---

## 5. Stills now, clips for moments, Rive when Wael talks: animation and budgets

### Options compared for one pre-rendered teacher

| Approach | Best for | Weak at | Cost to make | Runtime | Verdict for Wael |
|---|---|---|---|---|---|
| **Layered sprites in React/CSS** (pose stills + eye/mouth patches + transforms) | Blink, 6 mouths, pose swaps per state, tiny breathing scale | Real body motion | Low: Scenario edits + masks | None | **Now**. The prototype standard |
| **AI image-to-video clips** (Kling / PixVerse, start/end frames) | 1–2.5 s expressive gestures: wave, cheer | Real-time reaction, infinite idles; drift, flicker, no native alpha | Medium: generation + keying + QA | `<video>` / stacked-alpha | **Soon**, for 2–3 moments |
| **Rive 2.5D puppet** (mesh + bones over the render, layered state machines) | Always-on mascot with idle, blink, visemes and reactions in one file | Needs a rigging pass and a layer-split render | Medium–high: a Rive animator | WASM, lazy | **When Wael gets a voice** |
| **Live2D** | Strong face rigs | Proprietary Cubism Core, release licence, ageing web plugin ([pixi-live2d-display](https://github.com/guansss/pixi-live2d-display); [listing](https://awesome.ecosyste.ms/projects/github.com%2Fguansss%2Fpixi-live2d-display); [README](https://github.com/RaSan147/pixi-live2d-display/blob/master/README.md); [Live2D licence](https://www.live2d.com/en/sdk/license/); [Cubism SDK for Web](https://docs.live2d.com/en/cubism-sdk-manual/cubism-sdk-for-web)) | High | Proprietary | No |
| **Real-time glTF** (three.js/R3F, Azure blend shapes) | A character that must turn or walk in 3D | Needs a real 3D model; heaviest on phones | Highest | three.js | No |

Rive's raster meshes deform a single image, which is why Rive fits a 3D render better than Lottie does. Rive supports meshes with weighted vertices, bones, IK and state machines ([Rive docs: Meshes](https://rive.app/docs/editor/manipulating-shapes/meshes); [Rive docs: Bones](https://rive.app/docs/editor/manipulating-shapes/bones); [Rive: intro to meshes](https://rive.app/blog/intro-to-meshes); [Rive: character animation](https://rive.app/use-cases/character-animation)). The known pitfall is that a 100 % smile expression stopped lip-sync until idle, expression and mouth were split into **layered** state machines. Keep bone counts modest and test on low-end phones ([Rive forum](https://rive.app/community/forums/support/fsnLLkXUaA62/blending-between-inputs/ftNEp8TkjtJb); [DEV: interactive mascots](https://dev.to/uianimation/engineering-interactive-mascots-with-rives-state-machine-and-runtime-architecture-4e2h); [80.lv: facial rigging](https://80.lv/articles/animating-speech-mastering-facial-rigging-guidelines-for-game-developers)). Practitioners drive the mouth with a single `mouthOpen` 0–1 input or with ten viseme states ([Freelancer: Rive mascot rig](https://www.freelancer.com/projects/2d-animation/interactive-rive-mascot-rig); [Contra: lip sync](https://contra.com/p/AAQksb6B-lip-sync-animation)).

On the web, use `@rive-app/canvas` (no WebGL context cap) or `webgl2` with `useOffscreenRenderer`. Embed rasters as WebP, and note that unused assets don't add size ([Rive: canvas vs WebGL](https://rive.app/docs/runtimes/web/canvas-vs-webgl); [same, .md](https://rive.app/docs/runtimes/web/canvas-vs-webgl.md); [Rive: optimizing files](https://rive.app/blog/a-designer-s-guide-to-optimizing-files-and-workflows); [Rive best practices](https://rive.app/docs/getting-started/best-practices)). The Rive-versus-Lottie numbers are vendor-adjacent. Rive reports a 15× size reduction for Duolingo ([Rive](https://rive.app/blog/rive-as-a-lottie-alternative)). Callstack measured Rive at about 60 FPS against Lottie's 17, but on React Native on a 2014 phone, with internally inconsistent memory numbers ([Callstack](https://callstack.com/blog/lottie-vs-rive-optimizing-mobile-app-animation); [Callstack, www](https://www.callstack.com/blog/lottie-vs-rive-optimizing-mobile-app-animation)). Runtime size is Rive's listed weakness ([Toolradar](https://toolradar.com/compare/rive-vs-lottie); [yokaify](https://yokaify.com/blog/rive-vs-lottie); [unicornicons](https://unicornicons.com/learn/rive-vs-lottie); [LottieFiles vs Rive](https://lottiefiles.com/blog/lottie-animations/lottiefiles-or-rive); [dev.to: Rive vs Lottie](https://dev.to/uianimation/rive-vs-lottie-which-animation-tool-should-you-use-in-2025-p4m)). dotLottie stores rasters compressed and embeds state machines ([dotLottie format](https://docs.lottiefiles.com/en/format/dotlottie); [why dotLottie](https://docs.lottiefiles.com/en/format/dotlottie/why-dotlottie.md); [dotlottie.io](https://dotlottie.io/intro/)).

### Memory, formats and file budgets

In Jake Archibald's test, the same clip came out as follows:

| Format | Size | Notes |
|---|---|---|
| **Stacked AV1** (colour on top, alpha as greyscale below, recombined in WebGL) | **460 KB** | Alpha half adds about 8 KB |
| Animated AVIF | 504 KB | Slow; a few fps on Android; broken in Safari |
| VP9-alpha WebM | 1.1 MB | No Safari support |
| Stacked HEVC | 1.14 MB | Apple fallback without AV1 decode |
| Native HEVC-alpha MOV | 3.4 MB | |

The recommendation is the `<stacked-alpha-video>` component with AV1 first and an HEVC fallback ([Jake Archibald 2024](https://jakearchibald.com/2024/video-with-transparency/)). In 2026 Safari still lacked WebM alpha. List the HEVC source first in native fallbacks, and verify that ffmpeg kept Apple's alpha ([Rotato](https://rotato.app/blog/transparent-videos-for-the-web); [hontran.dev: HEVC alpha](https://www.hontran.dev/blog/transparent-video-web-hevc-alpha-ffmpeg)). Safari's HEVC alpha dates from iOS 13 ([CSS-Tricks](https://css-tricks.com/?p=328311); [Ben Frain](https://benfrain.com/?p=4422)). Animated WebP decodes faster than AVIF on low-end phones ([imageupload.app](https://imageupload.app/blog/2026-03-13-webp-vs-avif-browser-support-and-encoding-trade-offs); [smallpics.io](https://www.smallpics.io/blog/avif-vs-webp)).

Memory is set by **decoded pixels (w × h × 4)**, not by file size, and an image shown small is still decoded at full size ([imagecompressor.com](https://imagecompressor.com/blog/how-browsers-handle-images)). A 2 s gesture at 12 fps held as 24 decoded 768 × 1152 frames costs about 85 MB, which is too much for a mid-range webview. Video decodes only a few frames at a time, so **anything longer than about 1 s should be video, not a frame set**.

| Item | Budget *(proposal, to validate on device)* | Basis |
|---|---|---|
| Wael pose, web export | 512 × 768 WebP; ≈ 1.6 MB decoded each; preload current + next screen only | w × h × 4 rule |
| Splash art total (island + Wael + chips) | ≤ ~200 KB transferred | Today's pair is 160 KB ([FEATURES.md](file:///C:/Projects/Wael%20Academy%20Prototype/docs/FEATURES.md)) |
| Gesture clip | 1–2.5 s; stacked AV1 + stacked HEVC; ~150–300 KB per second at 512–768 px | Archibald's order of magnitude; guide lengths |
| Frame-sequence fallback | ≤ 12 frames, animated WebP | Decode memory |
| Rive file (when adopted) | < 300–500 KB `.riv` with 6–10 WebP layers | Duolingo's Lily file < 1 MB ([Rive: Lily](https://rive.app/blog/duolingo-s-ai-powered-video-call-brings-lily-to-life)) |
| Live canvases per screen | ≤ 1–2 WebGL contexts | Browser context caps ([Rive docs](https://rive.app/docs/runtimes/web/canvas-vs-webgl)) |
| Device pixel ratio for any canvas | Capped at 2 | Fill-rate |

### Gestures from video: the guide's route, with the pitfalls named

The guide's route works like this ([village-art-guide.md](file:///C:/Users/USER/AppData/Local/Temp/claude/d19e79e29968456c/fc0fda62-1e96-448a-9539-5c3319c0e1a3/scratchpad/artzip/art/village-art-guide.md)):

1. Put the start frame on the template over a flat key colour.
2. Use a video model with start/end control (PixVerse or Kling in Scenario).
3. Lock the camera. Loops and gestures start and end on the same frame. Keep loops to 1–2 s and gestures to 2.5 s or less ("Every extra second costs memory on the phone").
4. Deliver the raw MP4 plus the start and end images.
5. Extract at 12 fps (up to 24 for close-up gestures), key out the colour, and pack.

Reject a clip if the camera moves, the anchor drifts or the subject changes. Kling supports start and end frames up to 4K ([Scenario: Kling O1](https://www.scenario.com/models/kling-o1-i2v); [fal.ai](https://fal.ai/models/fal-ai/kling-video/o1/image-to-video); [Eachlabs](https://www.eachlabs.ai/ai-models/kling-v3-pro-image-to-video); [ComfyUI node](https://docs.comfy.org/built-in-nodes/partner-node/video/kwai_vgi/kling-start-end-frame-to-video.md); [kling.ai](https://kling.ai/blog/how-can-i-make-animation-video); [Luma: Kling 4.0](https://lumalabs.ai/learning-center/articles/kling-4-complete-guide); [Futurepedia lesson](https://www.futurepedia.io/courses/creating-movies-with-ai-complete-course/lessons/start-and-end-frames-in-kling)). Identical start and end frames make a seamless loop point, but an identical image can produce a near-still video. Prompt continuous motion and keep camera instructions minimal ([Higgsfield](https://higgsfield.ai/blog/Kling-Start-End-Frames); [Higgsfield 2](https://higgsfield.ai/blog/FepbaEyNStzJLJivRIOFg)). Scenario's spritesheet recipe renders neutral → action, then swaps the frames to render action → neutral and merges the two, warning that several video models are deprecated ([Scenario: spritesheets](https://help.scenario.com/articles/9088582240-create-spritesheets-with-scenario)).

The LayrKits pipeline lists the failure modes ([LayrKits](https://www.layrkits.com/guides/sprite-sheet); [GitHub](https://github.com/LayrKits/Sprite-Pipeline); [X article](https://x.com/LayrKits/article/2050277473116619240); [TamerinTECH skill](https://github.com/TamerinTECH/claude-skill-klingai-animation)):

- Video models animate wider than the first frame, so leave margins.
- Chroma key eats green and cyan details.
- Per-frame recentering fakes motion.
- Contact with the canvas edge can't be recovered later.

"Veo 3 does not solve the character consistency problem" ([winterspeak](https://winterspeak.substack.com/p/veo-3-does-not-solve-the-character)).

Wael's outfit has no green, but the brand and the props are teal and lime. *(proposal)* Default to a **magenta `#FF00FF` key**. Key with `colorkey` (RGB, for flat generated backgrounds) rather than `chromakey` (YUV, for filmed footage), and starting similarity is 0.1–0.2. Magenta has no `despill` mode, so clean its fringe with a 1 px alpha erode ([FFmpeg colorkey patch](https://lists.ffmpeg.org/pipermail/ffmpeg-devel/2015-June/174085.html); [DEV: chromakey](https://dev.to/javidjamae/ffmpeg-chromakey-filter-remove-green-screen-backgrounds-pjk); [FFmpeg cookbook](https://ffmpeg-cookbook.pages.dev/en/articles/chromakey-filter/); [Transloadit](https://transloadit.com/blog/2023/06/removing-a-green-screen/); [despill source](https://roundup.ffmpeg.org/doxygen/7.1/vf__despill_8c_source.html); [FFmpeg filters](https://ffmpeg.org/ffmpeg-filters.html); [ffmpeg skill page](https://agent-skills.md/skills/josiahsiegel/claude-plugin-marketplace/ffmpeg-color-grading-chromakey)). If the generator's background isn't truly flat, use a temporal matting model, because per-frame still matting "boils" at fingers ([VRMBG-3.0 card](https://cloudfare-proxy.pages.dev/briaai/VRMBG-3.0)). Then encode stacked alpha:

```bash
# AV1 stacked alpha (two-pass) — from Jake Archibald (2024)
ffmpeg -y -i in.mov -filter_complex "[0:v]format=pix_fmts=yuva444p[main]; [main]split[main][alpha]; [alpha]alphaextract[alpha]; [main][alpha]vstack" -pix_fmt yuv420p -an -c:v libaom-av1 -cpu-used 3 -crf 45 -pass 1 -f null /dev/null
ffmpeg -y -i in.mov -filter_complex "...same..." -pix_fmt yuv420p -an -c:v libaom-av1 -cpu-used 3 -crf 45 -pass 2 -movflags +faststart av1.mp4
# Apple fallback
ffmpeg -y -i in.mov -filter_complex "...same..." -pix_fmt yuv420p -an -c:v libx265 -preset veryslow -crf 30 -tag:v hvc1 -movflags +faststart hevc.mp4
```

Crossfade 2–4 frames between the still pose and the clip, start and end every clip on that pose's exact neutral frame, and colour-grade clips back to the master.

### Lip-sync for Tunisian Arabic, if and when Wael speaks

**Azure TTS is the only researched option that returns visemes for `ar-TN`**. It offers the voices `ar-TN-ReemNeural` and `ar-TN-HediNeural`, and returns viseme IDs only, no blend shapes. French (`fr-FR`) gets both. Events carry an ID from 0 to 21 and an audio offset in 100 ns ticks (divide by 10,000 for ms) ([Azure: visemes](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/how-to-speech-synthesis-viseme); [Azure: language support](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts)). ElevenLabs returns character-level timestamps from `POST https://api.elevenlabs.io/v1/text-to-speech/{voice_id}/with-timestamps`, so visemes have to be derived from them ([ElevenLabs docs](https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps)). For recorded audio, Rhubarb's language-independent `phonetic` recognizer outputs mouth cues A–F plus G, H and X ([Rhubarb Lip Sync](https://github.com/DanielSWolf/rhubarb-lip-sync)). Duolingo derived timings with in-house speech models and built audit tools ([Duolingo](https://blog.duolingo.com/world-character-visemes)). The cheapest fallback is amplitude: a Web Audio analyser feeds RMS into 3–4 mouth sizes.

Arabic pharyngeals and emphatics (ع ح ق ص ض ط ظ) barely show on the lips. The visible distinctions are bilabial (ب م), labiodental (ف), rounded (ُ و), open (َ ا) and spread (ِ ي), so **the guide's six mouths are enough**. *(proposal, adapted from the notes' 22→8 mapping to `art.ts`'s six names)*:

| Guide mouth | Arabic cue | Azure viseme IDs |
|---|---|---|
| `mouth_rest` (M/B/P) | ب م, silence | 0, 21 |
| `mouth_a` (A/I) | َ ا | 1, 2, 4, 9, 11, 12 |
| `mouth_e` (E) | ِ ي, most consonants | 6, 13, 14, 15, 16, 17, 19, 20 |
| `mouth_o` (O) | — | 3, 5, 8, 10 |
| `mouth_u` (U/W) | ُ و | 7 |
| `mouth_f` (F/V) | ف | 18 |

Schedule the mouths against `audio.currentTime` and hold each shape for at least 60–80 ms to avoid chatter. Local guidance already says **lip-sync only with real audio** ([ui-tips.md](file:///C:/Projects/Wael%20Academy%20Prototype/docs/onboarding/ui-tips.md)). Until there is a voice, Wael "speaks" through the popping bubble and keeps his mouth at rest.

### The recommended path

| Phase | Scope | Assets | Tech | Gate to the next phase |
|---|---|---|---|---|
| **0. Consistency (now)** | Splash rebuild; `WaelAside`, login, sign-up, `/webgame` login swapped to 3D Wael | 12 pose stills (R-facing first) + blink patches; island; tinted contact shadows | Rung 1: WebP + CSS; event-driven blink | Owner approves amendments A1–A5 |
| **1. Moments** | Splash wave on first launch; result cheer; sign-up celebrate | 2–3 clips ≤ 2.5 s, stacked AV1 + HEVC, posters = the still poses | `stacked-alpha-video`, lazy, motion-safe | Measured on a real A55 + iPhone (§10) |
| **2. Voice** | Wael greets and explains with audio (mutable) | Mouth patches on 2–3 poses, or a Rive rig | Azure `ar-TN` visemes or Rhubarb on recorded audio; Rive canvas, lazy (A6) | Voice casting / consent; teen test |

---

## 6. The splash rebuilt: a door with a presenter beside it

### What the platforms allow before your splash

Apple says to "Launch instantly". The launch screen should be "nearly identical to the first screen", should "Avoid including text", and "isn't a branding opportunity". If you need a splash, "consider displaying it at the beginning of your onboarding flow", shown "just long enough for people to absorb the information at a glance" ([Apple HIG: Launching](https://developer.apple.com/design/human-interface-guidelines/launching); [Apple HIG: Onboarding](https://developer.apple.com/design/human-interface-guidelines/onboarding)). Other Apple rules: landscape-only apps must work rotated either way; restore the previous state; games should "teach through play"; text is at least 11 pt; touch targets are 44 × 44 pt by default; background art bleeds under the bars while controls respect the safe area ([Apple HIG: Designing for games](https://developer.apple.com/design/human-interface-guidelines/designing-for-games); [Apple HIG: Layout](https://developer.apple.com/design/human-interface-guidelines/layout)).

Android 12+ always shows a system splash: an app icon on one opaque colour. An animated icon should stay under 1,000 ms, and a branding image is discouraged. The splash dismisses on the first frame, and an exit animation (for example a 200 ms slide) can bridge into the app. "Perceived startup time is less when viewing an animation" ([Android Developers: Splash screens](https://developer.android.com/develop/ui/views/launch/splash-screen)).

The resulting sequence:

1. **OS launch.** iOS shows a flat colour. Android shows the icon on the same flat colour.
2. **In-app splash/title.** Wael, the island, the logo and one CTA, interactive from the first frame.
3. **Welcome.**

*(proposal)* Make the splash's base layer the **flat `--v2-deep` `#08434b`** and use the same value for both OS launch screens. The chapter gradient and the radial glow then fade in as part of the entrance, so the hand-off never flashes. The PWA's first paint is that same flat colour.

### The canvas: 832 × 399 and 784 × 352 usable

From the insets in `MobileGameLayout.tsx`:

| Device | Full screen | Insets (left / right / top / bottom) | Usable area |
|---|---|---|---|
| iPhone 13 Pro Max | 926 × 428 | 47 / 47 / 8 / 21 | **832 × 399** |
| Galaxy A55, immersive | 832 × 384 | 36 / 12 / 8 / 24 | **784 × 352** |

Design to the smaller area. Background layers bleed to the full screen, and only the UI is confined. The cutout side flips with rotation, so keep **art, not controls**, nearest the short edges, and recompute insets on rotation ([Cursa](https://cursa.app/en/page/mobile-screen-resolution-aspect-ratios-and-safe-areas); [Sizzy](https://sizzy.co/blog/safe-area-insets); [Game Developer: notch](https://www.gamedeveloper.com/game-platforms/mobile-games-issues-with-frontal-camera-notch)). In landscape the comfortable thumb zones are the lower corners ([Packt: thumb zone](https://packtpub.com/en-dk/product/mastering-ui-development-with-unity-9781787125520/chapter/mobile-specific-ui-10/section/the-thumb-zone-ch10lvl1sec73); [Game Developer: thumbs](https://gamedeveloper.com/design/how-to-design-for-thumbs-in-the-era-of-huge-screens)), though thumb-reach models disagree ([CMS Conferences 2024](https://openaccess-api.cms-conferences.org/articles/download/978-1-964867-13-7_13)). Keep the CTA above the bottom inset and **off-centre** so it stays clear of the home indicator. The native platform CTAs are 50 pt (iOS) and 56 dp (Android).

### Three layouts, and which to build

The citable patterns are a split layout with art on one half and the menu on the other ([Godot docs](https://docs.godotengine.org/en/3.2/getting_started/step_by_step/ui_main_menu.html)), a dominant logo with minimal options ([Medium: game UI](https://medium.com/@a_kill_/video-game-ui-the-design-process-explained-14c23fa70d37)), the start control as the most prominent element ([Bitesize Byte](https://bitesizebyte.blogspot.com/2026/03/the-art-of-creating-compelling-title.html)), and press-Play-and-go ([Game Developer: intros](https://www.gamedeveloper.com/design/how-to-create-immersive-game-intros)). Character art large enough to convey the premise also helps ([itch.io devlog](https://projectlevel.itch.io/bubblegum-zombie-hunter/devlog/335493/designing-a-title-screen)). Side art that doesn't match the scene weakens the whole ([r/Unity3D mirror](https://lr.in.psf.lt/r/Unity3D/comments/1gghlsa/is_this_a_good_title_screen)). Duolingo's welcome is a mascot, a tagline, "Get Started" and a quiet "I already have an account" ([ScreensDesign](https://screensdesign.com/explore/apps/duolingo/onboarding/)). Some builders reposition the logo and Start button separately per screen shape ([Guroo Academy help](https://help.guroo.academy/editing-screen-settings-title-screen)).

The wireframes use English labels because Arabic breaks alignment in monospace. RTL means the right side is *start*. The real strings are « مدينة وائل », « وضع اللعب », « يلّا نبداو », « عندي كونط », « ادخل لمدينتك », « شوف نتيجتك ».

**Option B — "Presenter beside his town" (recommended).** This evolves today's split. Wael stands at the inner edge of the art column, turned **toward the CTA**, with the island behind him.

```
 ┌───────────────────────────────── 926 x 428 (art bleeds to every edge) ─────────────────────────────┐
 │47│                       END (left)                │              START (right)                │47│
 │  │   . cloud               [chip +30]               │                         [GAME LOGO]       │  │
 │  │        _________________                         │                     ( play-mode pill )    │  │
 │  │      /  floating town   \        O  <- Wael      │                  TITLE: Wael's town       │  │
 │  │      \     island        /      /|\    faces ->  │            one-line promise (muted)       │  │
 │  │        \_______________/        / \   (right)    │                                           │  │
 │  │          ~ soft shadow ~      ~shadow~           │        [######  PRIMARY CTA  ######] lime │  │
 │  │                                                  │              secondary: I have an account │  │
 │  └──────────────── ~52% ────────────────────────────┴───────────────── ~48% ─────────────────────┘  │
 │                                   ▔▔▔ home indicator (keep clear) ▔▔▔                             │
 └────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

Why B wins: **Wael occupies the same end side as `WaelAside`** on the five onboarding screens. The tap can therefore turn into a shared-element move (Wael scales from the splash slot into the 27 % aside) instead of a jump. Only right-facing poses are needed. The CTA stays under the right thumb. Wael's gaze runs from the art across the title and down to the CTA.

**Option A — "Presenter leads".** Wael stands at the start (right) edge facing *left*, across the title, toward a CTA in the bottom-left. The island is small, top-left or behind.

```
 ┌────────────────────────────────────────────────────────────────────────────────────┐
 │   [small island, top-left]          [GAME LOGO]  TITLE                │     O      │
 │        ~shadow~                     one-line promise                  │    /|\  <- │
 │                                                                       │    / \     │
 │   [######  PRIMARY CTA  ######]   secondary link                      │  ~shadow~  │
 └────────────────────────────────────────────────────────────────────────────────────┘
```

This option matches the bidi reading of "character at inline-start, gesturing toward the CTA at inline-end" most literally. But Wael would have to cross to the other side for onboarding, it needs left-facing renders, and it moves the CTA to the left thumb, a cost no source tested.

**Option C — "Centre stage lobby".** Wael stands centred in front of the island (Brawl Stars-style), the logo is top-start, the CTA bottom-start, and 1–2 chips flank him.

```
 ┌────────────────────────────────────────────────────────────────────────────────────┐
 │                                              [chip]                    [GAME LOGO] │
 │                    ________  O  ________                                           │
 │                   /  island /|\  town   \                                          │
 │                   \________ / \ ________/                                          │
 │                       ~~ shadow ~~                    [###### CONTINUE ######]     │
 └────────────────────────────────────────────────────────────────────────────────────┘
```

C is the strongest "world" image and suits a **returning player's** "continue" splash later, once the town is the home. It competes with the text, though, and lobbies are busier than a splash should be ([samurai-gamers: Brawl Stars](https://samurai-gamers.com/brawl-stars/main-menu-guide/)).

### Layer stack

| Layer | Content | Bleeds under insets? | Motion (motion-safe only) |
|---|---|---|---|
| L0 | Flat `--v2-deep` (matches the OS launch colour) | Yes | None |
| L1 | Chapter gradient + radial glow behind the hero (teal/lime, low opacity) + 7 % grid | Yes | Fades in during the entrance |
| L2 | Far clouds (optional, 1–2) | Yes | Pointer parallax ±2 px on desktop only |
| L3 | Island + its tinted contact shadow | Partly | Rise on entrance, then the 6 s / 8 px bob (the one loop) |
| L4 | Wael pose stack + tinted contact shadow | Feet may sit near the bottom inset | Rise on entrance; event-driven blink |
| L5 | 1–2 flat chips | No | One pop at entrance, then static |
| L6 | Logo, pill, title, promise, CTAs | No (inside the safe area) | Rise, staggered 40 ms |
| L7 | Burst, sheets, toasts | — | Per existing rules |

### Character size and CTA placement

*(proposal)* In Option B, Wael's pose box is **80–85 % of the usable height (about 300–340 CSS px)**, shown full body. His feet sit on the art column's ground line just above the bottom inset, and his head falls in the upper third with "look room" in front of his face. The inspiration synthesis suggests a full-body hero at about 70 % height, or 60–85 % when cropped at the waist (a design rule of thumb, not measured from any source). In landscape, full body reads better against the town's miniature scale: a presenter beside his model town. The island takes 35–50 % of the width and sits behind and above Wael's shoulder, never behind his face.

The primary CTA sits bottom-start (right) in the text column at the native height (50 pt / 56 dp), with the secondary « عندي كونط » below it at the same height as a quiet ghost or outlined button. There is **one lime moment** on the screen.

### Motion choreography with timings

Motion should be purposeful, brief, optional and cancellable, and "In apps, generally avoid adding motion to UI interactions that occur frequently" ([Apple HIG: Motion](https://developer.apple.com/design/human-interface-guidelines/motion)). The local order is **Wael → bubble +120 ms → tiles +200 ms**, animating only transform and opacity ([ui-tips.md](file:///C:/Projects/Wael%20Academy%20Prototype/docs/onboarding/ui-tips.md)). Platform motion: iOS push 350 ms and `cubic-bezier(.2,.8,.2,1)`; Android default spring 350 ms with nothing over 600 ms ([wael-mobile-ios SKILL.md](file:///C:/Projects/Wael%20Academy%20Prototype/.claude/skills/wael-mobile-ios/SKILL.md); [wael-mobile-android SKILL.md](file:///C:/Projects/Wael%20Academy%20Prototype/.claude/skills/wael-mobile-android/SKILL.md)). *(proposal, requires A2)*

| Time | What happens | Spec |
|---|---|---|
| 0 ms | First paint: L0 flat colour; everything is laid out; **the CTA is tappable from frame one** | Never block input on animation |
| 0–240 ms | L1 glow fades in; island rises | translateY 12→0 px + opacity, 240 ms |
| 0–320 ms | Wael rises | translateY 16→0 + scale .96→1, 320 ms, `cubic-bezier(.34,1.56,.64,1)` (the `play` pop curve) |
| 120–360 ms | Logo, pill, title, promise | `.rise` 240 ms, 40 ms apart |
| 200–440 ms | CTA pair, then chips pop | Rise 240 ms; chip pop `scale .6→1.15→1` 320 ms, once |
| ~560 ms | Entrance done (under 600 ms) | — |
| After the entrance | Island bob starts; blink scheduler starts | Bob −8 px / 6 s; blink 90 ms every 4–7 s (random) |
| ~4–6 s idle (optional) | Wael's gaze shifts to the CTA **once** (pose swap `wael_wave → wael_present`, 120 ms crossfade) | One nudge, no pulsing CTA loop |
| ~20 s idle | Pause the bob and the blink; also pause on `visibilitychange` | Battery; Clippy rule |
| CTA tap, frame 0 | Lip collapses (80 ms) + `forward` cue + `AudioContext.resume()`, same frame | Sound unlock ([Chrome: autoplay](https://developer.chrome.com/blog/autoplay)) |
| Tap +0–350 ms | Push to `/mobilegame/bienvenue`: island slides out, Wael scales from the splash slot into `WaelAside`, the welcome bubble pops at +120 ms | iOS push 350 ms / Android 350 ms spring |

Repeat visits in the same session skip the entrance and crossfade only. Genshin's login scene changes with time of day, its music matched ([Genshin wiki](https://genshin-impact.fandom.com/wiki/File:Login_Menu_Dusk.png); [Extra Credits episode](https://thetvdb.com/series/extra-credits/episodes/10407945)). That is a nice later idea for the island (dawn, day, dusk renders), not for v1.

### Reduced motion, sound and returning users

Under `prefers-reduced-motion: reduce`, the splash renders the **final composite statically**: no rise, bob, blink, parallax or chip pop. Pose swaps become instant, or a 150 ms or shorter opacity change, which is an "effect", not motion. The push becomes a fade. Press feedback and progress fills stay, following "reduce, don't remove" ([web.dev: prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion); [W3C 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)). An in-app "effects" toggle that defaults to the OS setting is a cheap extra.

**Sound:** nothing plays on load (the browser wouldn't allow it anyway, and `sound-effects.md` forbids it). The first CTA tap resumes the single `AudioContext` that `sound.ts` owns and plays `forward` on the same frame.

| Visitor | Primary CTA | Secondary | Wael pose | Destination |
|---|---|---|---|---|
| New guest | « يلّا نبداو » | « عندي كونط » | `wael_wave` (eye contact) | `/mobilegame/bienvenue` |
| Guest who finished the 3 questions | « شوف نتيجتك » | « عندي كونط » | `wael_present` toward the CTA | Result |
| Signed in | « ادخل لمدينتك » | — | `wael_present` | `/mobilegame/accueil`, restoring the last state |

Starting with the product and asking for the account later is the Duolingo pattern ([Appcues GoodUX](https://goodux.appcues.com/blog/duolingo-user-onboarding); [UX Collective](https://uxdesign.cc/the-duolingo-diaries-an-honest-ux-review-part-1-onboarding-ed0165d44c58); [Medium: Duolingo onboarding](https://medium.com/learning-ux/how-duolingo-converted-me-into-a-user-with-their-awesome-on-boarding-process-f8de2d109c17)). Rosetta Stone did the opposite ([UX Planet](https://uxplanet.org/the-ux-of-mobile-app-onboarding-rosetta-stone-vs-duolingo-fc662f50d0e4)). Early prompts push players out ([Segwise](https://segwise.ai/blog/mobile-gaming-app-user-retention-strategies)). Benchmarks are coarse and vendor-sourced: about 70 % of players are gone after day 1, top games keep 26–28 % at D1, and the targets are a first win within about 3 minutes and tutorial completion of at least 75 % ([Adrian Crook](https://adriancrook.com/?p=8145); [MAF churn](https://maf.ad/en/blog/analyze-and-decrease-churn-rate/); [Playio](https://blog.playio.co/mobile-game-kpi-performance-goals-retention-strategy); [MAF retention](https://maf.ad/en/blog/game-retention/); [Juego Studio](https://www.juegostudio.com/blog/how-to-increase-user-retention-and-increase-your-games-lifetime); [AppFollow](https://appfollow.io/blog/mobile-game-retention)). **The splash adds zero time before the CTA is tappable.**

---

## 7. Carrying the same Wael through welcome, level, subject, quiz, result and sign-up

Consistency comes from four constants on every screen: **the same pose set, the same side (end), the same contact shadow and the same light**. *(proposal)* Seat Wael in `WaelAside` on a small cream plinth with a navy edge, echoing the town buildings' "cream plinth with a navy tile border" ([FEATURES.md](file:///C:/Projects/Wael%20Academy%20Prototype/docs/FEATURES.md)). That ties the aside to the island without drawing a whole scene in 27 % of the width. Test the renders' alpha on both grounds the flow uses: the dark chapter panel and the mint grid.

| Screen | Wael pose → reaction | Gaze | Size and placement | 3D/UI moment | Motion and sound |
|---|---|---|---|---|---|
| **Welcome** `/bienvenue` | `wael_wave` → `wael_present` when the route cards are on screen; bubble « أهلا، أنا وائل! … » | Student, then cards | Aside 27 %, Wael ~66 % height on a plinth | Route cards flat (2 px); one lime CTA « يلّا نبداو » | Shared-element arrival from the splash; bubble pop 320 ms; CTA `forward` |
| **Level** `/niveau` | `wael_curious` → `wael_nod` on pick, plus a bubble reacting to the level | Tiles, then the picked tile | Same | Lipped tiles; selected = lime; sections open in place | Pose swap on the pick frame + `select`; auto-advance 300 ms |
| **Subject** `/matiere` | `wael_subject_<family>` swaps in when a badge is picked; summary bubble « باك علوم · رياضيات · 3 أسئلة · دقيقة » | Badges | Same | The existing badges with following eyes; Wael "dressed" for the subject | `select`, then `forward` on « يلّا نلعبو » |
| **Quiz** `/defi` | `wael_think` while reading → `wael_cheer` (right) / `wael_hmm` (wrong) | Question card; the revealed answer when wrong | *(proposal)* scale Wael to ~85 % or narrow the aside so the task dominates (a character should shrink during focused problem-solving; design inference, unsourced) | Right: lime + tick pop; wrong: grey + shake + answer revealed (no red) | Pose swap on the answer frame + `success` / `error`; no timer |
| **Result** `/resultat` | `wael_proud`; at ≥ 2/3, `wael_cheer` on the burst frame, then back to proud | Score | Aside or larger panel | Big score, stamp, **one** burst; rounds 2–3 locked (shake) | Burst + cheer + cue on one frame (A7); « احفظ نتيجتك » → sign-up |
| **Replay sheet** | No Wael (keep the sheet clean) | — | — | `GameSheet` per platform | `open`/`close`; quiet « مبعد » |
| **Sign-up** `/inscription` | `wael_form` presenting the saved-score panel → `wael_think` on the SMS step → `wael_celebrate` once at the town greeting | Form, then student | Panel at ~62 % height | What is saved (badge, score, points, level) as flat chips | `forward` per step; `achievement` once at the end |
| **Login** | `wael_present` with the bubble « مرحبا! مدينتك تستنّى فيك — ادخل نكمّلو نبنيو. »; the island replaces the flat `TownArt` | Form | Art panel (end side) | Island + Wael + contact shadows; form on solid surfaces | `forward` on submit |
| **`/webgame` login** | Same assets; left-facing renders only if the page is LTR | Form | md: larger panel | Same | Same |

Two cross-cutting rules apply. First, **bubble text is real text** (screen readers, contrast), and Wael's pose never carries information alone. Second, **pre-decode the next screen's poses** during the current screen, so a swap never blanks.

---

## 8. Checklists

### Performance

- [ ] Every continuous animation touches only `transform` and `opacity`; no animated `filter`, `box-shadow` or blur ([web.dev: animations](https://web.dev/articles/animations-guide)).
- [ ] `will-change` added only where a jank was measured, then removed ([web.dev](https://web.dev/articles/animations-guide)).
- [ ] Pose layers pre-mounted and swapped by opacity; next-screen poses `img.decode()`d in advance; only the current and next screen's poses held in memory.
- [ ] Web exports at 2× the CSS box, at most (512 × 768 for Wael); no trimmed margins; decoded-memory total checked (w × h × 4).
- [ ] Splash first paint needs no JS runtime; splash art ≤ ~200 KB; nothing lazy-loaded blocks the CTA.
- [ ] Any runtime (Rive, video component) is in a lazy chunk on the game routes only, behind a poster still ([Pixelpoint](https://pixelpoint-website-6l3rd8f5q-pixelpoint.vercel.app/blog/rive-react-optimizations)).
- [ ] At most 1–2 WebGL contexts per screen; Rive `canvas` or `useOffscreenRenderer` for several instances ([Rive docs](https://rive.app/docs/runtimes/web/canvas-vs-webgl)).
- [ ] Everything pauses offscreen (IntersectionObserver), on `visibilitychange`, and after about 20 s idle.
- [ ] Video: `muted playsinline`, HEVC source first in native fallbacks, stacked alpha preferred ([Jake Archibald](https://jakearchibald.com/2024/video-with-transparency/)).
- [ ] Canvas DPR capped at 2; R3F, if ever used: `frameloop="demand"`, `PerformanceMonitor`, draw calls in the hundreds ([R3F docs](https://r3f.docs.pmnd.rs/advanced/scaling-performance)).
- [ ] Measured on a **real Galaxy A55 and an iPhone** via remote debugging (Performance panel), in the webview, in landscape. Not only in the desktop frame.
- [ ] Works in Safari / WKWebView, not only Chromium.

### Accessibility

- [ ] All motion authored inside `prefers-reduced-motion: no-preference`; under `reduce`: static composite, no loops, no parallax, no tilt, no burst (static stamp + sound instead); press feedback kept ([web.dev](https://web.dev/articles/prefers-reduced-motion); [W3C 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)).
- [ ] At most one ambient loop per screen, tiny amplitude, no sustained oscillation near 0.2 Hz at large amplitude ([Apple HIG: Motion](https://developer.apple.com/design/human-interface-guidelines/motion)).
- [ ] Decorative Wael and island: `alt=""` + `aria-hidden`; any state a pose shows is also in text and sound.
- [ ] Text never sits directly on busy art; contrast ≥ 4.5:1 body / ≥ 3:1 large measured on the busiest pixels; Arabic about 2 pt larger.
- [ ] Glass only on iOS controls, with a 35 % dim over bright art; opaque fallback for reduced transparency / increased contrast ([Apple HIG: Materials](https://developer.apple.com/design/human-interface-guidelines/materials)).
- [ ] Tap targets ≥ 44 pt / 48 dp including the lip; 3 px teal focus ring outside the lip.
- [ ] Gyro or tilt only after an explicit tap; never required.
- [ ] Sound never the only signal; mute toggle reachable; Wael's voice (later) mutable and skippable.
- [ ] Bubble ≤ 8–12 words, no typewriter, at most one exclamation per screen.

### Before shipping an asset

- [ ] Written consent from Wael on file for the likeness and its uses; human retouch logged.
- [ ] Canvas 1024 × 1536, anchor between the feet at **512, 1472**, within 4 px of the previous pose ([village-art-guide.md](file:///C:/Users/USER/AppData/Local/Temp/claude/d19e79e29968456c/fc0fda62-1e96-448a-9539-5c3319c0e1a3/scratchpad/artzip/art/village-art-guide.md)).
- [ ] Light from the top left; same camera, lens and rim as the master; colour-graded to the master.
- [ ] Identity checked side by side with the master on a grid (face, glasses, beard, outfit, sneakers).
- [ ] Hands correct (count, shape); face not over-smooth; no plastic sheen beyond the style bible.
- [ ] Gesture vocabulary respected: open palm, no index pointing, no OK sign, no thumbs-up until tested.
- [ ] Facing correct for its slot; **no mirrored render**.
- [ ] Checked at 200 % (no AI noise) and at 64 px wide (silhouette reads).
- [ ] Flip test against the previous pose and the blink patches: only the eyes and mouth change.
- [ ] Clean alpha edges on the dark chapter teal **and** the mint grid; no key-colour fringe.
- [ ] No text, letters, numbers, logos or watermarks in the image.
- [ ] PNG-32 sRGB master + 512 × 768 WebP web copy; lowercase underscore name (`wael_present_r.png`, `wael_eyes_closed.png`, `wael_mouth_o.png`).
- [ ] Clips: camera locked, anchor steady, starts and ends on the neutral pose, ≤ 2.5 s, stacked AV1 + HEVC, poster = the still.
- [ ] Stored in Scenario collection `characters`, final version tagged **`approved`**.

---

## 9. Annotated inspiration list

Status flags come from the research notes. **[snippet]** means the URL and title came from a search result and the images were *not* viewed (Dribbble, Behance and Mobbin render client-side). **[memory]** means a well-known URL that was not opened. Borrow the composition and the behaviour, never another studio's look.

| # | Reference | Borrow | Caveat | Link |
|---|---|---|---|---|
| E1 | Clay Character Avatars, Kashish Arora | Costume variants on one base body → `wael_subject_<family>` | Avatars, likely bust-only [snippet] | [Dribbble](https://dribbble.com/shots/24727368-Clay-Character-Avatars) |
| E2 | 3D Cartoon Character – Clay Style, funchiao | Soft subsurface clay material over glossy plastic | Thin description [snippet] | [Dribbble](https://dribbble.com/shots/21083138-3D-Cartoon-Character-Design-Clay-Style) |
| E3 | Avatar One – Clay, Reijo | Big-head caricature ratio for a real person | 2022 [snippet] | [Dribbble](https://dribbble.com/shots/17395348-Avatar-One-Clay) |
| E4 | SplashLearn, "Meet OOLZOOs" | Character idle as the splash/loading moment | Too childish for 15–19 [snippet] | [Dribbble](https://dribbble.com/splashlearn) |
| E5 | Talking Duo mascots, Aleksandra Gornago (2025) | One expression set spanning onboarding → gamification | 2D vector [snippet] | [Behance](https://www.behance.net/gallery/235742943/Talking-Duo-Vector-Mascots-for-Kids-Learning-App) |
| E6 | "Mascote 3D" search (Slott 3D onboarding) | Character entering on the first screen | Listing page [snippet] | [Behance](https://www.behance.net/search/projects/mascote%203d) |
| E7 | Library Game, launchcode | Blender characters composited as a separate layer into the UI | [snippet] | [Dribbble](https://dribbble.com/launchcode/projects/3127059-Library-Game?page=2) |
| E8 | Learn Guitar Game (splash + menu) | Hero stays put while the menu slides in (→ shared-element splash) | Tag page [snippet] | [Dribbble](https://dribbble.com/tags/splash_learn) |
| E9 | Splash Screen Animation tag | Short scale-with-overshoot entrance; glow behind the hero | [snippet] | [Dribbble](https://dribbble.com/tags/splash_screen_animation) |
| E10 | "Teacher character" (Feezy) | Teacher guide gesturing to the CTA | Search page only [snippet] | [Dribbble](https://dribbble.com/search/teacher-character) |
| E11 | "Classroom 3D" | Small props (books, board) instead of text | [snippet] | [Dribbble](https://dribbble.com/search/classroom-3d) |
| E12 | Android Mobile Game Landscape, Mobin M. Bahrami | Landscape HUD: CTA lower trailing corner | Unverified [snippet] | [Dribbble](https://dribbble.com/shots/14103820-Android-Mobile-Game-Landscape) |
| E13 | Game Main Menu tag | World-plus-hero composition settling into a menu | Dark tone [snippet] | [Dribbble](https://dribbble.com/tags/game-main-menu) |
| E14 | Landscape Mobile tag | Landscape island compositions | Mixed quality [snippet] | [Dribbble](https://dribbble.com/tags/landscape%20mobile) |
| E15 | Game maps mobile UI search | Island props' silhouette readability | [snippet] | [Behance](https://www.behance.net/search/projects/game%20maps%20%20mobile%20ui) |
| E16 | "Arabic Apps" search (Aseel, Wahaj, Bousla…) | RTL hierarchy with illustration; Arabic display type next to art | No 3D [snippet] | [Behance](https://www.behance.net/search/projects/arabic%20apps?locale=en_US) |
| E17 | Learn Arabic iPhone App, Naima MM (2013) | Letter as a game object | Dated, flat [snippet] | [Behance](https://www.behance.net/gallery/9502147/Learn-Arabic-iPhone-APP-(UI-Design)) |
| E18 | Game UI Database: Title Screen | Logo + one prompt + hero art; filter Mobile + Landscape | [snippet] | [gameuidatabase](https://www.gameuidatabase.com/index.php?scrn=1) |
| E19 | Game UI Database: mobile title screens | Compare logo/CTA stacking | [snippet] | [gameuidatabase](https://gameuidatabase.com/index.php?set=1&vid=1&scrn=1) |
| E20 | Game UI Database: Mobile Controls | Thumb-zone placement | [snippet] | [gameuidatabase](https://gameuidatabase.com/index.php?scrn=147&tag=2) |
| E21 | Interface In Game: Brawl Stars | Lobby composition | [snippet] | [interfaceingame](https://interfaceingame.com/games/brawl-stars/) |
| E22 | Brawl Stars main-menu guide | Hero centred, stat chips around it (Option C) | Busy [snippet] | [samurai-gamers](https://samurai-gamers.com/brawl-stars/main-menu-guide/) |
| E23 | Interface In Game: Clash Royale | Bevelled lip buttons = the `play` lip; arena as framed stage | [snippet] | [interfaceingame](https://interfaceingame.com/games/clash-royale/) |
| E24 | Brawl Stars menu study, V. González Artigas | What a busy lobby can lose | Fan redesign [snippet] | [itch.io](https://thewolfg.itch.io/uiux-braw) |
| E25 | Messenger, Abeto (Awwwards Developer SOTY 2025) | Small floating world filling about half the frame | Heavy WebGL; fake it with layers [snippet, award confirmed] | [Awwwards SOTY](https://www.awwwards.com/websites/sites_of_the_year/); [Wikipedia](https://en.wikipedia.org/wiki/Messenger_(video_game)); [site, memory](https://messenger.abeto.co) |
| E26 | Coastal World, Merci-Michel (SOTM Aug 2022) | CSS-only UI over a 3D island; precomputed tricks | 2022 [award confirmed] | [Awwwards article](https://www.awwwards.com/coastal-world-by-merci-michel-wins-site-of-the-month-august-2022.html); [video](https://www.awwwards.com/inspiration/3d-game-and-marketplace-for-digital-banking) |
| E27 | Bruno Simon portfolio (SOTD Jan 2026) | Toy-diorama lighting, coloured shadows | Heavy [snippet] | [Awwwards](https://www.awwwards.com/sites/brunos-portfolio) |
| E28 | Igloo Inc | Isolated object on a dark gradient, rim light (navy-sky version) | Dark, premium [memory] | [dappasol](https://dappasol.com/guides/websites-like-igloo-inc/); [site, memory](https://www.igloo.inc) |
| E29 | Lando Norris, OFF+BRAND (SOTY 2025) | A real person turned into a brand object | Interaction unverified | [Awwwards SOTY](https://www.awwwards.com/websites/sites_of_the_year/); [site, memory](https://landonorris.com) |
| E30 | Spline: mouse-following 3D avatar | Head and eyes turning to the pointer | [snippet] | [Spline community](https://app.spline.design/community); [3D-Avatar file](https://community.spline.design/file/7f1979de-4c20-4589-9d95-a674451cfcd8) |
| E31 | Spline Follow event | Damping (lag) + View Reset for touch | [snippet] | [Spline docs](https://docs.spline.design/doc/follow-event/doc5CVQiJtfM) |
| E32 | threesided "Spline Look Lab" | Several objects reacting together | [snippet] | [threesided](https://threesided.com/lab/spline-scene/) |
| E33 | Rive animated login bear | Character reacting to UI state (focus, typing) → Wael looks at the form | [snippet] | [Rive blog](https://rive.app/blog/animated-login-screen-design) |
| E34 | Rive Marketplace eyes and faces | Random blinks + pupil tracking on a separate eye layer | [snippet] | [Interactive face](https://rive.app/marketplace/21307-40024-interactive-face/); [Color Eyes](https://www.rive.app/marketplace/24258-45320-color-eyes-interaction/); [Eye roll](https://rive.app/marketplace/20345-38249-interactive-eye-roll-animation-cursor-follower/); [Rive Masterclass](https://www.rivemasterclass.com/rive-animations/character) |
| E35 | Awwwards eyes-follow-cursor set | Small, eased eye range = "cute, not creepy" | Mostly 2D [snippet] | [Ochi](https://www.awwwards.com/inspiration/animated-eyes-follow-mouse-cursor); [Khoa Le](https://www.awwwards.com/inspiration/animated-eyes-follow-mouse-cursor-khoa-le); [Luccianos](https://www.awwwards.com/inspiration/luccianos-contact-page-eyes-follow-mouse-cursor); [Collection](https://www.awwwards.com/awwwards/collections/hovers-cursors-and-cute-interactions/) |
| E36 | Needle CursorFollow; nina-ai robot | Eye-anchor empties if Wael ever becomes a GLB | [snippet] | [Needle docs](https://engine.needle.tools/docs/how-to-guides/components/cursor-follow.html); [nina-ai](https://www.nina-ai.nl/en/toolkit/cinematic) |
| — | Pinterest "Splash screen" pin | — | Not verified | [Pinterest](https://www.pinterest.com/pin/311381761734085158/) |

More references found, mostly titles only: Spline TikToks on the Follow event ([1](https://www.tiktok.com/@splinedesign/video/7332624652331666694), [2](https://www.tiktok.com/@splinedesign/video/7254258107600096517)); Spline tutorials ([cursor-interactive site](https://www.youtube.com/watch?v=wK7ZfZLWhJ4), [3D robot with Next.js](https://www.youtube.com/watch?v=7_seu9xcXo8)); Spline tips ([splinetime3d: 31 things](https://splinetime3d.substack.com/p/31-things-i-wish-i-knew-when-i-started)); AI-mascot threads on X ([3D icon prompt](https://x.com/edizkan_/status/2047188097327042992), [mascot apps with ChatGPT Image 2.0](https://x.com/askwhykartik/article/2069041508121186685)).

The cross-set pattern: **one dominant hero, 3–5 depth layers, one chunky pill CTA in the thumb zone, a gradient sky with a glow behind the hero, a few chips, and one consistent light direction**. Game lobbies supply the chip and button language but are too dense for a splash.

Arabic-market context is thin. War Dragons' Arabic localisation tripled installs from Arabic speakers in 2017 ([Android Developers Blog](https://android-developers.googleblog.com/2017/05/why-you-should-localize-your-app-or.html?hl=id)). Vendors claim Arabic content is scarce ([FoxData](https://foxdata.com/en/blogs/how-to-localize-your-game-for-arab-markets-a-comprehensive-guide/); [Tarjama](https://tarjama.com/why-you-should-invest-in-mena-mobile-games/)). Lamsa and Abjadiyat use cartoon casts for young children, which is not the Wael audience ([The National](https://www.thenationalnews.com/lifestyle/family/arabic-language-app-lamsa-leads-the-way-in-digital-learning-for-kids-1.221923); [Lamsa listing](https://mwm.ai/apps/lamsa-kids-learning-app/517583488); [Alef: Abjadiyat](https://www.alefeducation.com/products/abjadiyat); [App Store: Abjadiyat](https://apps.apple.com/us/app/id1235509585)). Other character case studies: Habitica's avatar changes with real tasks ([Trophy](https://trophy.so/blog/habitica-gamification-case-study)); Finch's attachment correlates with retention ([Appbot](https://appbot.co/blog/finch-app-reviews-emotional-attachment-user-retention-product-loyalty/); [Deconstructor of Fun](https://www.deconstructoroffun.com/blog/x0hd2ssr80y5n7gv0w967pg7hwd7tl)), though pet care can feel like "another task" ([habi.app](https://habi.app/insights/finch-alternatives/)); Royal Kingdom extended the cast with a sibling king ([Deconstructor of Fun 2023](https://www.deconstructoroffun.com/blog/2023/05/09/royal-kingdom-will-it-usurp-the-throne); [2024](https://www.deconstructoroffun.com/blog/2024/07/01/royal-kingdom-will-it-outgrow-its-big-brothers-influence)); Royal Match's cast ([Dream Games](https://dreamgames.com/games/royal-match)); Kodi drawn from simple shapes ([classx](https://classx.org/how-to-draw-kodi-the-bear-character-drawing-for-kids-circle-time-with-khan-academy-kids/)); the Laughing King meme ([AFK Gaming](https://afkgaming.com/gaming/general/clash-royale-king-laughing-meme-explained)); the "dead Duo" reach and backlash ([Meltwater](https://www.meltwater.com/en/blog/duolingo-dead-mascot-campaign); [TechCrunch](https://techcrunch.com/2025/02/18/duolingo-killed-its-mascot-with-a-cybertruck-and-its-going-weirdly-well); [PR Daily](https://www.prdaily.com/duolingo-shares-pr-secrets-of-viral-death-of-duo-campaign/); [Outlook India](https://outlookindia.com/international/us/duolingos-new-sick-app-icon-why-users-are-concerned-and-how-to-change-it-explained)).

---

## 10. Gaps, and what to verify next

The evidence has clear holes, and three of them change decisions.

**Community voices are largely missing.** Reddit refused the research tool, X returned HTTP 402, LinkedIn returned nothing, and YouTube pages held no transcripts. Opinion in this file therefore comes from forums (itch.io, Framer, Webflow, Steam), blogs and search snippets. Many points in §2 and §4 were **not opened directly** ([community notes: itch.io thread](https://itch.io/t/6518855/do-you-struggle-with-ai-art-consistency-in-your-games)).

**No mid-range Android benchmark exists.** There are no cold-start or memory measurements for Rive, dotLottie, stacked-alpha video or R3F on a Galaxy A55 or a recent iPhone. The authoritative Rive web runtime size conflicts (78 KB WASM vs ~200 KB gzipped). It is unconfirmed whether Safari shipped WebM alpha or Chrome Android fixed VP9 alpha by November 2026. Support for `prefers-reduced-transparency` was not checked. The official M3 Expressive spring tokens couldn't be fetched.

**No audience data exists** on how Tunisian or MENA 15–19-year-olds perceive a 3D teacher mascot. There is no edtech case study of a founder or teacher turned into a 3D caricature with outcomes, no title-screen A/B data (character vs none, live scene vs static), and no Tunisia-specific gesture source. The most recent agent meta-analyses predate 2023.

No assets are tagged `approved` in Scenario yet, and Dribbble/Behance images were not viewed. Tunisian law on likeness, AI-output ownership and parental consent (law 2004-63) needs a lawyer.

| Verify next | How | Unblocks |
|---|---|---|
| Owner approval of amendments A1–A7 | Review §1 table; update `wael-gamified` SKILL.md and the FEATURES.md decisions | Phase 0 build |
| Wael's consent and temperament | Short session with Wael: consent form, "how far" expression references | Pose set, expression ceiling |
| Teen reaction to 3D Wael (AI look, tone, gestures incl. thumbs-up) | 5–8 Tunisian lycée students, the splash + 3 poses, think-aloud | Style bible, gesture list |
| Device performance | Test page with stills, a stacked-alpha clip and a Rive file, measured on a real A55 + iPhone in the webview (remote-debug Performance panel) | Phases 1–2, A6 |
| Video alpha support in Safari / Chrome Android (late 2026) | Feature test page on both | Clip encoding choices |
| Scenario video outputs: flat background or alpha? | One test clip from Kling and from PixVerse on a magenta key | Gesture pipeline |
| `fit.py` character mode | Implement and run on `wael_base.png` + 2 new poses; toggle test in `/map/atelier` | Pose swaps without jumps |
| Manual community pass | Logged-in search of Reddit (r/UI_Design, r/gamedev), X, LinkedIn, YouTube transcripts for "3D mascot", "Spline performance", "AI mascot" | Confidence in §2/§4 opinion |
| Legal check (Tunisia) | Lawyer: likeness consent, AI authorship, minors' data | Public launch |

---

## Conclusion

The question was never really "3D or flat". It was **where depth is allowed to live**. In this design, depth lives in the art: renders, contact shadows, a gently layered diorama. The UI keeps the volume it already has, the lip under what you tap. Under that division the owner's wish and the `play` skin stop contradicting each other. Only seven targeted amendments are needed, not a new design language. The second shift concerns what the 3D Wael *is*. He is not an illustration to be placed but a **small state machine made of stills**: a dozen poses, each tied to a moment in the flow, all sharing one canvas, one anchor and one light. The research says that is where his value comes from (gesture and expression, gaze toward the work, reactions to the student). It also means the project's existing artist guide, `art.ts` and `/map/atelier` already form most of a character pipeline. They need a `character` mode in `fit.py`, not a 3D engine.

The real risks sit outside the render loop: an unconsented or uncanny likeness, a mascot that looks AI-made to a generation primed to distrust that, and a presenter who nags. They are cheap to prevent now (consent, a matte caricature style, a human retouch log, a mute) and expensive to repair after launch. Teach the pipeline on the splash and the five `WaelAside` screens first. Then let device measurements decide whether clips and a voice earn their bytes.
