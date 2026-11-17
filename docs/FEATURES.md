# Wael Academy — Feature reference

> **The single source of truth for what this project is building.** Every feature we want, where it lives, and how far it got.
> **Rule for every session:** after you add, change or remove a feature, update this file (status, notes, changelog — each changelog line ends with `— *session: <session name>*`), then run `npm run features:html` to refresh the readable copy `docs/features.html`.

**Last updated:** 2026-11-16

## How to read this file

| Mark | Meaning |
|---|---|
| ✅ | Built and working (in the prototype or the app named in the column) |
| 🟡 | In progress, or partly built (a placeholder screen exists) |
| 🔲 | Planned, not started |
| 💡 | Idea under discussion — not decided |
| ⛔ | Dropped (kept here with the reason) |
| — | Not applicable to that surface |

## 1. Surfaces — the apps and pages

| Surface | URL | Code | Status | Notes |
|---|---|---|---|---|
| Public site | `/site`, `/site/a-propos` | `src/features/site/` | ✅ | Figma landing + About; old landing at `/landing-ancien`. Moved from `/` on 2026-11-16 (`/` is the project hub) |
| Login · sign-up · reset | `/connexion`, `/inscription`, `/mot-de-passe-oublie` | `src/features/auth/` | ✅ | Demo account `29340118` / `wael1234`; reset code `123456` |
| Student space (new) | `/student-v2` | `src/features/student-v2/` | 🟡 | Figma redesign, gamified `play` skin, Arabic RTL; some tabs still placeholders |
| Role spaces | `/admin`, `/teacher`, `/parent`, `/student`, picker at `/roles` | `src/features/<role>/` | 🟡 | One shared dataset; several nav items are "coming soon" |
| Mobile gallery | `/mobile` or `mobile.localhost:5173` | `src/features/mobile/` | ✅ | Student space inside iPhone 13 Pro Max and Galaxy A55 frames |
| Next-update docs | `/next-update/` (Vercel: `wael-academy-prototype.vercel.app/next-update/`) | `public/next-update/` (source `docs/next-update/`) | ✅ | HTML prototypes, critique, cahier des charges |
| Game app (phone, landscape) | `/mobilegame` (`?device=galaxy`) | `src/features/mobilegame/` | 🟡 | Splash, first-launch game, sign-up and login done; login lands in the town (`/mobilegame/accueil`, the `/map` town framed in the phone) |
| Game web (responsive) | `/webgame` | `src/features/webgame/` | 🟡 | Landing + login done |
| Town map (test page) | `/map` (island) · `/map/planete` (planet) · `/mobilegame/accueil` | `src/features/map/` | 🟡 | Zoomable isometric town, floating in space; two shapes to compare; now the game app's home after login (`framed` mode); `/webgame` still to do |
| Art atelier (asset checks) | `/map/atelier` | `src/features/map/ArtAtelier.tsx`, `art.ts` | ✅ | Checks the artist's PNGs against the guide and tries them in the town; bundled art goes in `src/assets/town/` . First set bundled: 11 buildings + 10 props, generated in Scenario (`scripts/town-art/`) |
| Design system page | `/design-system` | `src/features/styleguide/` | ✅ | |
| Project hub | `/` and `/hub/` (every host; on `mobile.` only `/hub/`) | `scripts/build-hub.mjs` → `public/hub/` | ✅ | The project's front door: map of every page, skill and doc; regenerated before `dev` / `build` or with `npm run hub` |

## 2. Existing product (today's features)

### 2.1 Student space — `/student-v2`

| Feature | Status | Notes |
|---|---|---|
| Dashboard (live panel, calendar, documents, recent) | ✅ | |
| Live session page (séance) | ✅ | |
| Video player with comments, documents sheet | ✅ | |
| Offers (العروض) | ✅ | |
| Calendar (week grid) | ✅ | |
| Recordings by subject | ✅ | |
| Subjects → chapters → contents (الدروس) | ✅ | |
| Groups (مجموعاتي) | 🟡 | Placeholder, waiting for its design |
| Exercises, profile, settings, wallet, favourites, codes | 🟡 | Placeholders that link to the old `/student` screens |
| Sound on every action (`uisfx`) | ✅ | Rules in `docs/sound-effects.md`; `npm run check:sounds` |

### 2.2 Roles

| Role | Built | Coming soon |
|---|---|---|
| Admin | Dashboard, curriculum (year → subject → chapter), users, groups, sessions, live sessions, calendar, messages, offers (+ access, promo codes), payments + subscription detail, teacher pay | Courses, settings |
| Teacher | Dashboard, my sessions, my pay, my codes | My courses, my students |
| Parent | Dashboard, my codes | My children, sessions, payments |
| Student (old) | Dashboard, offers, subjects, calendar, recordings, homework, video player, wallet + subscriptions, codes, chat widget | Favourites |

## 3. Next update — the game version

Where each feature exists: the **HTML prototype** (`docs/next-update/prototype-*.html`, demo only), the **game app** `/mobilegame`, the **game web** `/webgame`.

### 3.1 Access to the game apps

| Feature | HTML prototype | /mobilegame | /webgame | Notes |
|---|---|---|---|---|
| Landing page | — | — | ✅ | Hero, 3 steps, town, playing with friends, parents' promise, app band |
| Splash screen | — | ✅ | — | No fake loading bar; signed out → « يلّا نبداو » (the first-launch game) or « عندي كونط »; layout B « presenter beside his town » (3D knowledge base § 6): floating 3D town + 3D وائل at its inner edge, waving to a new guest then presenting the CTA, blink, < 600 ms entrance |
| First launch: Wael's welcome | — | ✅ | 🔲 | `/mobilegame/bienvenue` — Wael's bubble, the 3 steps as a route, « عندي كونط » on every step |
| First launch: level + section | — | ✅ | 🔲 | `/mobilegame/niveau` — 4 tiles (أولى → باك), sections open in place, auto-advance after 300 ms; from `years.json` |
| First launch: favourite matière | — | ✅ | 🔲 | `/mobilegame/matiere` — the year's subject badges; Wael sums up « باك علوم · رياضيات · 3 أسئلة · دقيقة » before « يلّا نلعبو » |
| First launch: 3-question game | — | ✅ | 🔲 | `/mobilegame/defi` — questions from the official programme (`src/data/seed/onboarding-quiz.json`, 94 sets, all 120 level × matière pairs); sciences in French; no timer; right = lime + tick, wrong = grey + shake + the right answer shown; one-line explanation |
| First launch: result | — | ✅ | 🔲 | `/mobilegame/resultat` — big score, answer marks, points, stamp, one burst at 2/3+; rounds 2–3 locked; « احفظ نتيجتك » and « عاود العب » lead to the account (sheet with a quiet « مبعد ») |
| Sign-up | — | ✅ | 🟡 | `/mobilegame/inscription` — shows what's kept (matière, score, points, level); name + phone (+216) → SMS code (banner, tap to fill, code `123456`, resend after 60 s) → password + parent's number under 18; then the town greets with the saved score and « العب الجولة الثانية » (new questions) |
| Forgot password | — | 🟡 | 🟡 | Placeholder screen |
| iPhone / Galaxy versions | ✅ | ✅ | — | Landscape frames, per-platform controls (`platformUi.ts`) |

### 3.2 Coins and unlocking content

| Feature | HTML prototype | /mobilegame | /webgame | Notes |
|---|---|---|---|---|
| Wallet: balance + history | ✅ | 🔲 | 🔲 | |
| Coin price + duration on each material | ✅ | 🔲 | 🔲 | |
| Buy with coins → unlock with countdown, extend | ✅ | 🔲 | 🔲 | |
| Buy coins with real money | 💡 | 💡 | 💡 | Open question: store billing rules (Apple/Google IAP) |
| Earn: watch a platform ad | ✅ | 🔲 | 🔲 | Opt-in, capped 3/day |
| Earn: tasks (survey, complete profile, notifications) | ✅ | 🔲 | 🔲 | |
| Earn: rate the app for coins | ⛔ | ⛔ | ⛔ | Forbidden by Google Play and Apple — replaced by in-app feedback task |
| Earn: referral | ✅ | 🔲 | 🔲 | |

### 3.3 Wael Library (store)

| Feature | HTML prototype | /mobilegame | /webgame | Notes |
|---|---|---|---|---|
| Product grid, search, categories | ✅ | 🔲 | 🔲 | |
| Product details (stock, quantity) | ✅ | 🔲 | 🔲 | |
| Cart + checkout (address → payment → review) | ✅ | 🔲 | 🔲 | Coins or cash on delivery |
| Orders + delivery tracking | ✅ | 🔲 | 🔲 | |
| Parent confirms orders from minors | 💡 | 💡 | 💡 | Recommended by the critique |

### 3.4 Game mode — the town

| Feature | HTML prototype | /mobilegame | /webgame | Notes |
|---|---|---|---|---|
| Town with buildings (one per subject group) | ✅ | 🔲 | 🔲 | Test page `/map`: isometric 24×24 town, auto-tiled roads, 14 buildings (incl. the Wael shop), zoom/pan/pinch, tap → building card. Buildings and props now use illustrated art (Scenario, Tunisian whitewash style) with the code drawing as fallback; free asset options in `docs/town-assets.md` |
| Upgrade with points (general + subject points) | ✅ | 🔲 | 🔲 | Wael's house caps the others; `/map` has a demo « Améliorer » (page state only) |
| Points: how they are earned + log | ✅ | 🔲 | 🔲 | Critique: reward evidence of learning, not time |
| League: small group, weekly, tiers | ✅ | 🔲 | 🔲 | National view as percentile |
| Levels and badges | ✅ | 🔲 | 🔲 | |

### 3.5 Community and events

| Feature | HTML prototype | /mobilegame | /webgame | Notes |
|---|---|---|---|---|
| Groups: mine, open groups, create | ✅ | 🔲 | 🔲 | |
| Live challenge room (question → reveal → podium) + chat | ✅ | 🔲 | 🔲 | Chat moderation for minors is an open question |
| "Read together" room | ✅ | 🔲 | 🔲 | |
| Events / tournaments with coin prizes | ✅ | 🔲 | 🔲 | Bracket or ranking |

### 3.6 Live sessions (with the update's additions)

| Feature | HTML prototype | /mobilegame | /webgame | Notes |
|---|---|---|---|---|
| Live sessions list (now, upcoming, recordings) | ✅ | 🔲 | 🔲 | Exists today in `/student-v2` |
| Quick poll inside the live + chat | ✅ | 🔲 | 🔲 | +5 points for a correct answer |
| Attendance points | ✅ | 🔲 | 🔲 | +30 general, +10 subject |
| Warm-up quiz before a live | ✅ | 🔲 | 🔲 | +10 points |
| Unlock a live or recording with coins | ✅ | 🔲 | 🔲 | When not in the student's offer |

### 3.7 Smart guidance

| Feature | HTML prototype | /mobilegame | /webgame | Notes |
|---|---|---|---|---|
| My level per subject (radar, study time) | ✅ | 🔲 | 🔲 | |
| Recommendations ("because you…") | ✅ | 🔲 | 🔲 | Start with simple rules; vectors later |
| Goals, today's tasks, weekly planner | ✅ | 🔲 | 🔲 | |
| Focus timer | ✅ | 🔲 | 🔲 | |
| Event tracking + student/content vectors | 💡 | 🔲 | 🔲 | Backend work; profiling minors needs legal review |

### 3.8 AI

| Feature | HTML prototype | /mobilegame | /webgame | Notes |
|---|---|---|---|---|
| Photo of an answer → corrected lines | ✅ | 🔲 | 🔲 | Pilot with teacher checks (handwriting accuracy) |
| Generate a quiz for me | ✅ | 🔲 | 🔲 | Generated content reviewed by teachers |

### 3.9 Admin for the update

| Feature | HTML prototype | /mobilegame | /webgame | Notes |
|---|---|---|---|---|
| Ads configuration (placement, frequency, audience, reward) | ✅ | — | 🔲 | Web prototype only |
| Launch an event / tournament | ✅ | — | 🔲 | |

## 4. Decisions

| Date | Decision |
|---|---|
| 2026-11-16 | In the game app (`/mobilegame`), وائل is the 3D presenter on every first-launch screen (splash → welcome → level → subject → quiz → result → sign-up, login): the shared `Wael3D` pose set replaces the 2D `Caracter.png`, poses react to the student's choices (A1 of the 3D knowledge base, for the game app) — *session: MCP reconnect scenario* |
| 2026-11-16 | For the game-app splash, three `wael-gamified` rules are relaxed (amendments A2–A4 of the 3D knowledge base): one entrance under 600 ms, one ambient loop and a blink; soft contact shadows tinted with the deep teal under illustrations only; a non-tappable chip is flat (no lip). The other screens and A1, A5–A7 are not decided yet — *session: MCP reconnect scenario* |
| 2026-11-05 | The update is specified as the client wrote it; the critique's changes are recommended options, not decided scope |
| 2026-11-05 | "Rate the app for coins" is dropped (store rules) and replaced by an in-app feedback task |
| 2026-11-15 | The game version lives in **separate apps**: `/mobilegame` (phone, landscape) and `/webgame` (responsive), because its flow differs too much from `/student-v2` |
| 2026-11-15 | The game apps are allowed points, levels and leagues (the `wael-gamified` skill still forbids them in `/student-v2`) |
| 2026-11-15 | Every `/mobilegame` screen follows the iOS and Android skills per platform (`wael-mobile-ios`, `wael-mobile-android`) |
| 2026-11-15 | This file is the project's feature reference and is updated after every change |
| 2026-11-15 | Pattern audit applied. iOS: inset glass sheets at medium height, automatic scroll-edge headers, glass menus anchored over their control, glass back circle; buttons in a row share one height. Android: framed as One UI 9 / Android 17 |
| 2026-11-15 | iOS glass default = the **clear** material (near-zero fill, rim light, darkened edge — Safari-safe); add a little fill only where labels need it; edge refraction is not shipped because it only renders in Chromium, never on a real iPhone |
| 2026-11-15 | Android keeps the **docked** Material nav bar (not One UI's floating bar) and the classic **4 dp menu** app-wide — the newer rounded menu is an allowed later change |
| 2026-11-15 | `/mobilegame` first launch **plays before it asks**: welcome → level + section (one step) → matière → 3 questions → result; the account is asked for at the result as « save your score », and playing again requires it (the sheet's « مبعد » only closes it, no guilt copy) — *session: Splash screen and auth pages* |
| 2026-11-15 | Onboarding questions follow the language Tunisian lycées teach in (sciences in French, arabe / philo / history in Arabic, English in English); the first question is easy, no timer, no game over — *session: Splash screen and auth pages* |
| 2026-11-16 | `/` opens the **project hub**, not the public site; the site moves to `/site` (`mobile.` keeps the phone gallery at `/`) — *session: Project hub* |
| 2026-11-16 | The project hub is **generated, never hand-edited**: it reads the router, nav menus, `docs/` and `.claude/skills/`, and `public/hub/` stays out of git. The vendored `apple-design` HIG pages are not published (licence) — *session: Project hub* |
| 2026-11-15 | Game-app sign-up = name + phone + SMS code + password (the app signs in by password like `/connexion`); under 18 asks a parent's number — legal process to confirm with a Tunisian lawyer — *session: Splash screen and auth pages* |
| 2026-11-16 | Town art follows the artist's guide (2:1 iso, 1024 px per tile, fixed anchors, guide file names); delivered files live in `src/assets/town/` and the code drawing stays as the fallback — *session: Project overview* |

## 5. Open questions

- Can coins be bought with real money? (Apple/Google in-app purchase, commission, coins can't buy physical goods)
- What does a coin unlock, and for how long — one file for N days, or a chapter until the end of the year? What stays subscription-only?
- Minors' data under Tunisian law 2004-63: INPDP declaration, guardian consent, transfers to foreign AI/analytics providers.
- Chat between minors: moderation, preset phrases first?
- The tagged question bank (chapter, skill, difficulty) behind quizzes and exercises — a prerequisite for the town, leagues, rooms, recommendations and AI.
- Delivery company and cash-on-delivery refusals for the Wael Library.
- Update the `wael-gamified` skill to allow mechanics in the game apps — and Wael speaking in bubbles (it says « no neutral Wael » and « never speaks »; the game apps use `svg icons/Caracter.png` with a bubble).
- `years.json` has no **Sport** section for 3ème / Bac — add it to the level picker or leave it out?
- The onboarding quiz's Bac Lettres arabe set cites a play from the 2025–2028 rotation — refresh when the rotation changes; have a teacher review the 282 questions.
- Bring `/student-v2` code in line with the updated skills (listed under « Known code drift » in each skill): iOS tab bar position and label weight, inset glass sheets, glass menus, glass back circle; Android menus at 4 dp. Not done yet.

## 6. Design rules that apply

- Brand and tokens: `.claude/skills/wael-design-system-soft/`, `src/styles/v2.css`
- Gamified look: `.claude/skills/wael-gamified/SKILL.md`
- iPhone: `.claude/skills/wael-mobile-ios/SKILL.md` · Galaxy: `.claude/skills/wael-mobile-android/SKILL.md`
- Sound on every action in `/student-v2`: `docs/sound-effects.md`

## 7. Reference documents

- **[Project hub](/hub/)** (`/hub/` in the running app) — every page, design system and document of the project, as clickable pages

- [Next-update index](next-update/index.html) — prototypes, critique, cahier des charges
- [Critique & propositions](next-update/critique.html)
- [Cahier des charges — client](next-update/cahier-des-charges-client.html) · [PDF](next-update/cahier-des-charges-client.pdf) · [dev](next-update/cahier-des-charges-dev.html)
- [Mobile prototype](next-update/prototype-mobile.html) · [Web prototype](next-update/prototype-web.html)
- [3D characters and 3D UI — knowledge base](3d/3d-characters-and-ui-effects.md) · [HTML](3d/3d-characters-and-ui-effects.html) — how to use the 3D Wael and 3D effects in the game apps: principles, 12-pose character system, Scenario pipeline, effect catalogue and tech ladder, animation budgets, splash blueprint (3 layouts), checklists, 36 inspiration links, the 7 `wael-gamified` amendments to approve
- [Town assets research](town-assets.md) · [gallery](town-assets.html) — free isometric art packs, licences, gaps
- [Feature research catalogue](features-catalog.html) — candidate ideas from research, not commitments
- [Mobile research](mobile/README.md) — iOS / Android patterns, device specs, gamification research
- [Liquid Glass research](mobile/glass-research.md) · [side-by-side demo](mobile/glass-demo.html)
- [Onboarding — UX best practices](onboarding/ux-best-practices.html) · [Inspiration from other apps](onboarding/inspiration.html) · [UI tips & components](onboarding/ui-tips.html) — research behind the `/mobilegame` first launch
- [Pattern audit vs 2026 trends](mobile/pattern-audit-2026-11.md) — iOS mostly current (sheets, headers, menus need updating); Android specs current, version framing outdated; landscape and games guidance missing

## 8. Changelog

Newest first. One line per change: date — what changed — where — *session: name of the Claude session that made it*.

- **2026-11-17** — Project hub `/hub/`: the landscape game apps get two start cards (« Le jeu — téléphone » → `/mobilegame`, « Le jeu — web » → `/webgame`) and their own section « Le jeu » (phone and web flows, the town pages, the assets atelier, iPhone / Galaxy / login→town shortcuts), split from « Les deux téléphones »; the town screen is labelled « La ville (après le login) »; new docs group « 3D — personnages et effets » (`scripts/build-hub.mjs`). — *session: MCP reconnect scenario*
- **2026-11-16** — `/mobilegame`: login now lands in the town. `/mobilegame/accueil` is the `/map` town in a new `framed` mode (fills the phone, keeps its header and zoom controls clear of the notch and home bar via the frame's `--gs-*` insets, the « Entrer » overlay stays in the phone, the back button returns to the door); it replaces the « coming soon » home. Prototype shortcut: tapping « ادخل لمدينتك » with both fields empty signs in the demo student (`demoWhenEmpty` on `GameLoginForm`). Fix for both maps: the town's box is `overflow: clip`, because `overflow: hidden` let the browser scroll it to a focused building and slid the « Entrer » overlay off screen (`src/features/map/TownMapPage.tsx`, `src/features/mobilegame/screens.tsx`, `LoginScreen.tsx`, `src/features/game/shared/parts.tsx`, `src/app/router.tsx`). — *session: MCP reconnect scenario*
- **2026-11-16** — 3D وائل carried through the whole `/mobilegame` first launch: a shared `Wael3D` component (`src/features/game/shared/Wael3D.tsx`) with 9 Scenario poses — wave, present, curious, nod, think, cheer, hmm (gentle shrug), proud, celebrate — each with an eye-only blink patch, all on one 512 × 768 canvas with the feet on one anchor so swaps never jump (`src/assets/characters/web/`, 512 KB together, built by `scripts/town-art/blink.py`). `WaelAside` puts him on a cream plinth with a navy edge: welcome waves then presents; level curious → nod on a pick; subject presents → nod; quiz thinks → cheers (right) / shrugs (wrong); result proud, celebrating on the burst frame; sign-up presents → thinks on the SMS code → nods; login: the floating 3D town + وائل presenting the form. The splash now uses the same component. Fixed in the art scripts: a paste that multiplied colour by alpha twice (dark soft edges) and lossy WebP blink patches (dark feather). Not done: subject-dressed variants, `/webgame` still 2D (`onboarding/parts.tsx`, `onboarding/*Screen.tsx`, `LoginScreen.tsx`, `RegisterScreen.tsx`, `SplashScreen.tsx`). — *session: MCP reconnect scenario*
- **2026-11-16** — `/mobilegame` splash rebuilt as layout B of the 3D knowledge base: flat `--v2-deep` first paint (the OS launch colour) with the chapter gradient, grid and a lime glow fading in; the floating town at the end side (bobs after the entrance, pauses after 20 s); 3D وائل at the art's inner edge on one feet anchor — waving at a new guest, turning after ~5 s to an open-palm « presenting » pose toward the CTA (finished guests and signed-in students start presenting); a blink every 4–7 s from eye patches; entrance under 600 ms on the first visit of the session only; nothing moves under reduced motion; the +30 chip is flat. New Scenario poses `wael_present` + both blink patches (`src/assets/splash/`), made by `scripts/town-art/blink.py`; motion in `src/features/mobilegame/splash.css` (`SplashScreen.tsx`). — *session: MCP reconnect scenario*
- **2026-11-16** — Knowledge base on 3D characters and 3D UI for the game apps, from 7 research tracks (the project and the « Splash screen and auth pages » session, mascots in apps and pedagogical-agent research, 3D UI effects and tech, splash/title layouts and RTL, community voices, Behance/Dribbble inspiration, character animation): 3D as one illustration layer over the flat lipped `play` UI, a 12-pose Wael on the guide canvas, stills → alpha video → Rive (no WebGL in the flow), splash blueprint with 3 landscape layouts, screen-by-screen plan through sign-up, checklists, and 7 proposed amendments to `wael-gamified` awaiting approval. Reddit / X / LinkedIn / YouTube transcripts were not readable by the research tools (`docs/3d/3d-characters-and-ui-effects.md` + `.html`, notes in `research_notes/3D characters and UI effects/`). — *session: MCP reconnect scenario*
- **2026-11-16** — `/mobilegame` splash: the flat SVG town is replaced by two Scenario renders in the town's 3D style — a floating island (school, library, maths tower, greenhouse, roads, fountain) that bobs slowly (`v2-float`, off under reduced motion) and وائل in 3D waving the player in, made from his 2D character (`svg icons/Caracter.png`) as the identity reference. Web copies in `src/assets/splash/` (webp, 160 KB together); وائل's master on the guide's large-character canvas (1024 × 1536, feet on 512, 1472) in `src/assets/characters/wael_base.png`, ready for blink / talk layers (`src/features/mobilegame/SplashScreen.tsx`). — *session: MCP reconnect scenario*
- **2026-11-16** — First illustrated town set, made in Scenario by following the artist's guide: one style anchor (the school, Gemini 3.0 Pro), then every other asset edited from it as a reference (same camera, light from the top left, cream plinth with a navy tile border, whitewash + teal). 11 buildings (`school`, `library`, `lab`, `math_tower`, `music`, `stadium`, `greenhouse`, `cafe`, `shop`, `house`, `arena_l0` building site) and 10 props (`tree_01` leafy, `tree_02` olive, `pine`, `bush`, `flowers`, `rocks`, `lamp`, `bench`, `parasol`, `fountain`); backgrounds cut out with Photoroom, then fitted onto the guide's canvases and anchors by `scripts/town-art/fit.py` (plinth corners → tile diamond, so rectangular footprints line up). `/map` and `/map/planete` now show them; the code drawings stay as fallback. Known gaps: one file per building (no per-level art yet), the four houses share one picture, the maths tower master was upscaled 9 %, assets are not yet in Scenario collections tagged `approved` (`src/assets/town/`, `scripts/town-art/`). — *session: MCP reconnect scenario*
- **2026-11-16** — Town art pipeline from the artist's guide (`art.zip` → `village-art-guide.md`): the town reads delivered PNGs by the guide's names (`building_<name>[_l<level>]`, `prop_<name>_<nn>`), places them on the guide's anchors at 1024 px per tile, picks the file for each level and keeps the code drawing when nothing is delivered (`src/features/map/art.ts`, `src/assets/town/`). New checking page `/map/atelier`: drop PNGs or load samples, automatic checks (name, canvas, transparency, edges, footprint), template guides, fit / 200 % / 64 px, flip test, layer toggle test, « Essayer dans la ville » (`ArtAtelier.tsx`). — *session: Project overview*

- **2026-11-16** — `/` now opens the project hub; the public site moved to `/site` and `/site/a-propos` (every link to it follows: site header/footer and nav, login frame, old landing, game web footer, sign-out). `vercel.json` added: `/` redirects to `/hub/` (not on `mobile.`), and every app URL falls back to the app — direct links such as `/student-v2` returned 404 on Vercel before (`src/app/router.tsx`, `src/features/site/`, `scripts/build-hub.mjs`, `vercel.json`). — *session: Project hub*
- **2026-11-16** — Project hub `/hub/`: one page linking every app page (read from the router and the nav menus, built vs « à venir »), every design-system skill (iOS, Android, play, soft, subject eyes, Apple reviewer) and every doc; all `.md` (docs, skills, `CLAUDE.md`) become HTML pages with a « Plan du projet » bar, designed `.html` pages are copied with a back button. Search, light/dark, works on every host incl. `mobile.` (`scripts/build-hub.mjs`, `npm run hub`, runs before dev/build → `public/hub/`, git-ignored; `scripts/md-html.mjs` is now also a module; `vite.config.ts` serves folder index pages in dev; `/hub` route in `src/app/router.tsx`). — *session: Project hub*
- **2026-11-15** — Two shapes of the town: `/map` is back to the square island floating in space; the round planet (كوكب) moved to its own page `/map/planete`. Same buildings, camera, sounds and return button; the shape is a `shape` prop (`TownMapPage`, `TownMap`, `Ground`, `Space`, `townLayout`, `src/app/router.tsx`). — *session: Project overview*

- **2026-11-15** — `/mobilegame` first launch built, on both phones (iOS and Galaxy controls per `platformUi.ts`): splash → Wael's welcome → level + section → favourite matière → 3 questions from the programme → result → sign-up (phone + SMS code + password, parent's number under 18) → the town greets with the saved score; round 2 draws new questions (`src/features/mobilegame/onboarding/`, `RegisterScreen.tsx`, `src/data/seed/onboarding-quiz.json`, `game.css`). `npm run check:sounds` now also scans the game apps. Not committed. — *session: Splash screen and auth pages*
- **2026-11-15** — Onboarding research: UX best practices, 20 apps' first launches, UI tips and components, each as `.md` + `.html` with images (`docs/onboarding/`); generic converter `scripts/md-html.mjs`. — *session: Splash screen and auth pages*

- **2026-11-15** — `/map`: the town is now a little round planet (كوكب) — a round disc of ground (tiles and trees past the rim removed), a half-sphere underside with grass lip, soil strata, stones and sphere shading, a curved light on the surface and an atmosphere ring; the desktop opening view shows the whole planet (`src/features/map/Ground.tsx`, `townLayout.ts`, `TownMap.tsx`, `Space.tsx`). — *session: Project overview*

- **2026-11-15** — `/map`: the town floats in space — navy starry sky with twinkling sparkles, nebulae, three planets and a glow under the island; the camera roams a finite space around the town (zoom out to half the town size) and a « Retour à ma ville · مدينتي » button, its arrow pointing at the town, appears once the town leaves the screen (`src/features/map/Space.tsx`, `useCamera.ts`, `TownMapPage.tsx`, `map.css`). — *session: Project overview*

- **2026-11-15** — `/map`: building names hidden on the map — each building shows only its level badge (lime ring when selected); the name stays in the building card (`src/features/map/TownMap.tsx`, `map.css`). — *session: Project overview*

- **2026-11-15** — `/map`: new « متجر وائل · Boutique Wael » building (kind `shop`), drawn after the client's reference: grey brick top, striped fabric wings with portholes, red & white wrap-around awning, cross windows, red door; the upper storey grows with the level (`src/features/map/BuildingArt.tsx`, `townLayout.ts`). — *session: Project overview*

- **2026-11-15** — Town assets gallery: every researched isometric pack with live previews, licence badges, style score and filters (2D / 3D / CC0 / style 4–5 / rejected) (`docs/town-assets.html`). — *session: Project overview*

- **2026-11-15** — Town map test page `/map`: isometric SVG town with auto-tiled roads, 13 buildings, zoom / pan / pinch, tap → card with Améliorer / Entrer, sprite slot per building (`src/features/map/`). Free isometric asset research: KayKit + Kenney + Quaternius (CC0, 3D to render) or Penzilla (2D, custom licence); education buildings missing everywhere (`docs/town-assets.md`). Not committed. — *session: Project overview*

- **2026-11-15** — iOS glass default switched to the **clear** variant (demo column c): near-zero fill, light blur, rim light; the tab bar dropped its 50 % fill; `[--glass-alpha:N%]` adds fill where labels need it (`ios.css`, iOS skill).
- **2026-11-15** — New iOS glass applied: `ios-glass` (36 % fill, directional rim, darkened edge, glow-and-swell press) + `ios-glass-clear` for media, with contrast / reduced-motion fallbacks (`src/styles/platform/ios.css`); used by the `/mobilegame` back button, the `/student-v2` iOS tab bar (50 % fill) and the video player prev / next on iOS. iOS skill + `ios-patterns.md` updated.
- **2026-11-15** — Glass research: why our iOS glass reads as a white circle, and a recommended regular + clear glass (`docs/mobile/glass-research.md`, demo `docs/mobile/glass-demo.html`). Applied the same day.
- **2026-11-15** — Pattern audit applied: iOS/Android skills + recipes gained the 2026 updates, a « Landscape (compact height) » section and a « Known code drift » list; research docs de-contradicted; `/mobilegame` buttons in a row share one height (iOS 50, Android 56), iOS back is a glass circle, Android landscape documented as immersive.
- **2026-11-15** — Pattern audit finished (`docs/mobile/pattern-audit-2026-11.md`): top 10 fixes proposed, not applied yet.
- **2026-11-15** — Created this feature reference (`docs/FEATURES.md` + `docs/features.html`, `npm run features:html`) and the rule in `CLAUDE.md`.
- **2026-11-15** — Started an audit of the iOS/Android pattern files against 2026 platform trends (report: `docs/mobile/pattern-audit-2026-11.md`).
- **2026-11-15** — `/mobilegame`: splash, login and placeholder screens follow the iOS and Android skills per platform (`platformUi.ts`).
- **2026-11-15** — `/mobilegame`: iPhone 13 Pro Max / Galaxy A55 switch, both landscape at true size (`?device=galaxy`).
- **2026-11-15** — New game apps: `/mobilegame` (splash, login) and `/webgame` (landing, login), shared town art and game buttons in `src/features/game/shared/`. Not committed yet.
- **2026-11-07** — Client cahier des charges exported to PDF (`docs/next-update/cahier-des-charges-client.pdf`).
- **2026-11-05** — Live sessions added to both HTML prototypes (list, live class with poll and points, warm-up, recordings, coin unlock); published to Vercel.
- **2026-11-05** — Next-update documents: critique, mobile + web HTML prototypes, cahier des charges (client + dev), index page; published at `/next-update/` on Vercel.
