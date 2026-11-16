# Gamified design for Wael Academy — research & the restyle brief

> Research dated **2026-10-26**. Scope: make the élève space (`/student-v2`) *look and feel* like a
> gamified learning app by **restyling what already exists** — tokens, shape, depth, type, motion,
> sound pairing, tone of voice. **No XP, points, levels, leagues, streaks, hearts, energy or new
> screens.** The result is the `play` skin (`<html data-skin="play">`, file to create:
> `src/styles/skins/play.css`; `?skin=soft` keeps the flat Figma look for comparison — see
> `README.md` in this folder and `src/app/platform.ts`). Written for developers and AI coding agents.
> Every claim dated after 2024 was verified online today; secondary or reconstructed sources are
> flagged as such. Reddit could not be crawled by our agent (blocked), so community sentiment comes
> from Hacker News threads and design newsletters instead.

**One-paragraph thesis.** What separates a "game" surface from a SaaS surface is not features, it is
four physical qualities: (1) **depth you can press** — a darker bottom edge that collapses on tap;
(2) **flat, saturated colour with one darker shade per hue** doing the work of shadows; (3) **a
character that reacts**; (4) **feedback that lands at the moment of action** — a pop, a tick, a
sound, a rare burst. Duolingo's own February 2026 refresh moved its tabs toward *flatter cards and
whitespace instead of boxed containers* while keeping the depth on the things you press — proof that
"game feel" lives in the interactive elements and the characters, not in decorating every panel.

---

## 1. Case studies — the visual language

| App | What makes it read as a game, not SaaS | Values / facts (source type) |
|---|---|---|
| **Duolingo** | Rounded, friendly vector shapes with "the fewest details needed", clear silhouettes framed by white negative space; chunky buttons with a flat darker lip that press down; one saturated colour family per concept; characters that cheer along a single guided path; celebration as a *transformation* of the mascot. | Shape-language post (2 Jul 2020, official): the round/bright style was born in **Duolingo KIDS (2018)** and moved into the main app's 2018 redesign ("vibrant colours and rounded buttons on a white background"). Path post (6 May 2022, official; live 1 Nov 2022): unfinished nodes **grey and blank**, completed **gold**, Legendary per unit, characters cheer along the path. Streak-milestone post (21 Jan 2022, official): "Fire Duo" phoenix chosen as a cross-cultural image; the balloon version was rejected as "not quite celebratory enough, energy-wise"; "Timing is everything in animation." Energy (3 Jul 2025, official): pink **battery** metaphor, "Small wins get rewarded." Core-tabs refresh (4 Feb 2026, official): tiered header sizes, fewer type styles, **flatter card styling and whitespace instead of boxed containers**; four directions explored — Punchy, Soft, Modular, Flat; engagement up, learning metrics flat. Rive (20 Mar 2025, Rive blog): Lily driven by a state machine, 8 head × 8 body idles → 64+ combinations, file < 1 MB. Type: Feather Bold (Johnson Banks + Fontsmith, 2019; proprietary) for display, DIN Round for UI. **Unofficial token reconstruction** (shadcn.io/design/duolingo): green #58CC02 with pressed #58A700, blue #1CB0F6, red #FF4B4B, yellow #FFC800, purple #CE82FF, orange #FF9600; lip ≈ 3–4 px flat shadow; 2 px borders on secondary buttons/inputs; radii 8/12/16; DIN Round 500/700 only; uppercase button label 15 px/700/0.8 px tracking. |
| **Brilliant** | "Interactive-first": the problem *is* the UI; progress drawn as a colour-coded path with node types; restrained, geometric illustration (PIX: straight-edged line segments) rather than cartoon mascots; dark mode; springy 3-D mascot and particle bursts only at streak rewards. | Rive case study (2 May 2024): early-2023 **game-mechanics redesign**; path nodes and connectors built in Rive with "many colour variants and node types"; streak counter animation tied to Rive events; "We embrace complexity because we know Rive can handle it." ustwo case study: a **"Game Feel"** vision — level gameboard, learning-path page, learning companion — a ten-week exploration, up to six concepts tested with gamers and non-gamers; in-lesson celebrations on correct answers and "encouraging moments when learners are struggling". Brand refresh with Koto (Medium, ~2024, not fetchable today — summary only). 60fps.design catalogue: spring-physics mascot, particle bursts on streak rewards. |
| **Kahoot!** | LOUD colour, geometric shape language, flat lighting with occasional hard-edged shadows, bold grotesque type, a tone that is playful **but explicitly not childish**. | Brand guide PDF (Apr 2019, official): "LOUD!!!, colorful, bold, energetic and inclusive"; palette purple #46178F (default), red #E21B3C, blue #1368CE, green #26890C, yellow #FFA602, orange #EB670F, teal #0AA3A3, text #333333, grey #F2F2F2; **Montserrat** in four weights (light/regular/bold/black), "black to SHOUT… or as titles"; illustration has "both curved and geometric edges… lighting is flat, but sometimes… simple hard-edged shadows"; "use circles, triangles, diamonds and squares to add interest"; stick to 2 (max 3) colours per design; WCAG 2.1. Tone DO: informal, friendly, playful, inclusive, curious — DON'T: **formal, patronizing, childish**, distant, complex. The guide's own buttons carry a darker bottom lip. |
| **Khan Academy** | Mastery as colour-state per skill — each skill a square that fills through named levels; structure over spectacle. | Help center: levels **Attempted → Familiar → Proficient → Mastered** (thresholds <70 %, 70–99 %, 100 %, then a mixed assessment); unit pages show one square per skill; community mentions purple crown icons. No official colour map found. |
| **Headspace / Calm / Finch** | Soft gamification: rounded characters, cream surfaces, warm orange/yellow; rewards that decorate rather than rank; "no shaming tone". | Headspace (third-party extractions, hex values conflict — #FFAC1D orange vs #0061EF blue — treat as unverified): simple rounded characters with closed eyes; illustration is *functional* (teaches posture, visualises breathing). Finch: a bird that grows as you do tasks, "rainbow stones" to decorate it, reviewers note the absence of shame; critics ask whether it builds intrinsic motivation. |
| **Habitica / Forest** | Habitica: retro **pixel art**, chibi avatar, gear instead of badges. Forest: one living object (a tree) as the progress metaphor; a dead tree stays in your forest — loss made visible but without a nag. | Game Developer overview; Forest reviews (gearbrain, UX Planet). |
| **Mimo / Sololearn / Elevate** | Mimo: each track its own colour, lessons go from **greyed-out to fully illustrated** as you progress, light-grey canvas, encouraging cues on correct answers. Elevate: flat, colourful icons on white, each game its own look. | DesignRush breakdowns (secondary). Sololearn redesign: no reliable source found. |
| **Memrise / Busuu** | Little verified design material; a 2025 eye-tracking comparison (Duolingo, Memrise, Busuu, Mondly) rated Duolingo highest for gamification/motivation. | Pollub JCSI paper (2025). |
| **Strava / Nike Run Club** | Progress as rings/circles and trophies for personal records; a victory screen animated in Rive. | NRC release notes ("Trophies and Achievement badges are back!"); Hello Monday's Strava 2022 "circle" campaign; a 2023 NRC victory-screen Rive project. |
| **MENA: Noon Academy, Abwaab, Baims, Nafham** | Live-class-first products; gamification is social (chat, mic, groups, "Full marks with friends"), not a visual language. No design teardown of their Arabic UI exists online; Baims/Nafham sites were unreachable or JS-only today. | Noon App Store listing (encouraging, exclamation-mark tone; chat/mic in live classes; groups with votes); Abwaab × thoughtbot case study (research with Tawjihi students; animated video lessons, Q&A, a challenge mode leaderboard). A Mostaql "Athar" concept shows a fully RTL learning app but is a portfolio piece. **Implication:** there is no regional convention to copy for *playful Arabic UI*; Wael can set it. |

**Pattern across the winners.** Depth only on pressables; one accent that means one thing (Duolingo gold = done, Kahoot purple = brand, Wael lime = selected); a character whose *state* changes; celebrations rare, short and tied to a real completion; and — in 2026 — less boxing, more whitespace.

---

## 2. Theory, only where it changes a design decision

| Theory | What it says | Design consequence for Wael |
|---|---|---|
| **Octalysis** (Yu-kai Chou) — 8 core drives; white hat (Meaning, Accomplishment, Creativity/Feedback) vs black hat (Scarcity, Unpredictability, Loss) | "A badge or trophy means little without a challenge behind it." Black-hat drives create urgency but "users may feel anxious and leave once the pressure lifts." | Lean on **Accomplishment & Feedback** (visible completion of real things: files taken, séance watched) and **Ownership** (the élève's collection of documents, their subjects). Avoid Loss/Scarcity theatrics — no "you'll lose…" copy, no countdown anxiety beyond the real séance clock. |
| **Self-Determination Theory** (Ryan, Rigby & Przybylski 2006; Gao et al. 2024) | Competence and autonomy predict enjoyment; relatedness via leaderboards did not, and leaderboards demotivate the bottom. | Feedback must say *"you did it"*, never *"you rank 14th"*. Keep choice visible (filters, playlist, calendar) — the Duolingo path backlash ("worst update ever", "Candy Crush") was about **removed autonomy**. |
| **Juice / game feel** (Jonasson & Purho, GDC 2012; Nijman 2013; Lin et al. 2022) | Tweening, squash-and-stretch, particles "sparingly", sound coherence; a 50–100 ms hit-stop reads best; "juice should echo the core gameplay" (Kelly). | Every tap gets ≤ 100 ms of physical response; particles only at the one real milestone per screen; sound and motion start on the same frame. |
| **Flow** (Csíkszentmihályi; Schell's four elements: clear goals, no distractions, direct feedback, continuous challenge) | Anxiety when challenge outruns skill, boredom when skill outruns challenge. | The dashboard's one job is "where do I have to be?" — the quest card must be the loudest object, everything else quieter. |
| **Hooked** (Eyal) & Growth.Design's Duolingo teardown | Trigger → action → variable reward → investment; Zeigarnik (unfinished things nag), Hick's law (one highlighted option). | Show unfinished state (2/5 files) honestly; one primary CTA per card; **no** fabricated variability (random rewards). |
| **Streak lessons** (Shuttleworth on Lenny's, Dec 2024) | "Streaks… can't make up for a weak product"; copy matters ("commit to my goal" lifted retention); "retention is most fragile in the first seven days". | Copy in derja that commits and encourages; polish the first-run screens (dashboard, matières) hardest. |

---

## 3. The toolkit of gamified UI — catalogue with values

| Pattern | How it is built | Recommended values |
|---|---|---|
| **Chunky 3-D button** | Flat colour + `box-shadow: 0 4px 0 0 <edge>`; `:active { transform: translateY(4px); box-shadow: 0 0 0 0 <edge>; }`; `transition: transform 80ms, box-shadow 80ms`; release with overshoot `180ms cubic-bezier(.34,1.56,.64,1)`. Secondary = 2 px border + 2 px lip. | Lip 4 px primary, 3 px tiles, 2 px chips; radius 12–16 px (or pill); label 700–800; min-height 44 px + lip. Add `touch-action: manipulation` and `-webkit-tap-highlight-color: transparent`. |
| **Edge shade per hue** | One darker shade per colour, same hue, −18 to −22 % lightness in OKLCH, chroma kept. | e.g. Duolingo #58CC02 → #58A700 (unofficial). |
| **Thick outlines** | 2 px borders at ~15 % ink on white; never 1 px hairlines on tappables. | 2 px; dashed (`2 6`) for locked/empty. |
| **Big rounded type** | Display 800, UI 600–700; two weights only per family (DIN Round 500/700). | Headings 1.3 line-height; never letter-space Arabic. |
| **Progress bar** | Track 10 % ink, fill in brand colour, rounded ends, an inner highlight stripe `inset 0 3px 0 rgb(255 255 255/.35)`; width animates. | Height 12 px mobile / 14 px desktop; 500 ms `cubic-bezier(.22,1,.36,1)`. |
| **Progress ring** | SVG circle, `stroke-linecap: round`, rotated −90°, number inside in tabular digits. | 104 px, stroke 10; 56 px, stroke 6 in lists. |
| **Nodes / path** | Discs on a rail; three states by colour: locked grey, open brand, done gold/lime; connectors dashed when locked. | Node 44/56 px; rail 3 px; gap 12 px. Avoid the winding "candy" path for teens. |
| **Badges & stickers** | Rounded-square glyph plates in the kind colour; a tick plate when collected. | 40 px plate, radius 12; tick 24 px. |
| **Mascot with expressions** | Eyes track pointer; pupils dilate on hover; squint on press; idle blink; Rive state machine for real expressions. | Blink 90 ms every 4–7 s; squint 160 ms in / 240 ms out. |
| **Confetti / particles** | canvas-confetti one burst from the element; disabled under reduced motion. | `particleCount 60–80, spread 70–75, startVelocity 32, scalar .9, ticks 160, disableForReducedMotion: true`. |
| **Number ticker** | NumberFlow (digits spin; `respectMotionPreference` default true). | spin 300–400 ms; `tabular-nums`. |
| **Pop / shake / bounce** | Spring or keyframes on `scale`/`translate`. | Pop `scale .6→1.15→1` 320 ms; shake ±4 px 320 ms; tab bounce `1→1.18→.96→1` 360 ms. Motion springs: `{ type: "spring", visualDuration: 0.3, bounce: 0.25 }` (Motion defaults: bounce 0.25, tween 0.3 s). |
| **Full-screen celebration** | Stamp/overlay + confetti + one sound; once per real completion; dismiss on tap. | ≤ 1.2 s before the next action is available. |
| **Streak flame** | Not applicable (no streaks) — colour-as-state covers it. | — |
| **Colour-as-state** | Grey = locked, colour = active, gold/lime = done. | Keep lime = selected/done, grey = locked, kind colours = type. |
| **Sound pairing** | Semantic cue on the same frame as the visual. | See §7 table. |
| **Haptics** | Android: "Less is more"; clear > rich > never buzzy; co-design with visuals/audio; subtle for frequent events, stronger for important ones. Web: `navigator.vibrate` only (Android Chrome); nothing on iOS web — rely on sound + motion. | 10–20 ms tick on select; 30 ms on success; none on scroll. |
| **Empty state as character** | A character looking at the empty area + one warm line + one action. | Figure 96–120 px; text 2 lines max. |
| **Skeleton → reveal / stagger** | Items rise 8 px and fade in with a 40 ms stagger, first load only. | ≤ 8 items staggered (320 ms total). |
| **Tap-to-reveal / card flip** | 3-D flip (`rotateY`) 400 ms; use for "answer" surfaces only. | Not needed for Wael's current features. |
| **Onboarding tone** | Human, informal, encouraging; never patronizing (Kahoot's explicit "DON'T: childish"). | See §7 strings. |

---

## 4. Communities & open source

**What designers say.** Hacker News, 2023–2026: praise for the habit ("it was the nag features that got me to practice every day"), and sharp criticism — "a corporate-designed psychological trap", "nagware", the mascot "so widely known as annoying that they play it for laughs in their ads", "Gamification… convinces us that we're making progress but it's completely artificial" (Sept–Oct 2025 thread); a 2026 Show HN sought "a retention mechanic that isn't Duolingo manipulation" and commenters pointed to Anki as proof that intrinsic learning sustains itself. NBC (2022) on the path redesign: "the worst update ever", compared to Candy Crush; von Ahn: "people are change averse". Lenny's Newsletter documents the growth side (leaderboards, notifications, streak) — the same mechanics the critics name. Gen-Z commentary (Fisk 2025, HerCampus): the owl's "intentionally absurd — borderline cringe" voice works only because it is self-aware; forced slang is "instantly called out as cringe". **Takeaway:** teens accept bold game aesthetics; they reject nagging and fake progress.

**Open-source building blocks (licences verified today unless noted).**

| Library / asset | Use | Licence & notes |
|---|---|---|
| `uisfx` (already in the app) | Semantic UI sounds, `arcade` pack | MIT code, CC0 audio (see `docs/sound-effects.md`) |
| `canvas-confetti` | One-shot bursts | **ISC**; 12.8k★; `disableForReducedMotion` off by default — set it |
| `react-rewards` | Confetti/emoji/balloons from an element | **MIT**; ~7 kB gz; WebGL2 + canvas fallback; React 18+; "quiet for people who prefer reduced motion" |
| `party-js` (yiliansource) | Confetti/sparkles | **MIT**; maintenance unclear (82 commits, no releases shown) |
| `@number-flow/react` | Animated digits (countdown, "2/5") | **MIT** (npm); `respectMotionPreference` default true |
| `motion` (motion.dev) | Springs, layout, `AnimatePresence` | MIT; spring `bounce` default 0.25, `visualDuration` preferred for UI |
| `roughjs` | Hand-drawn strokes (if a sketchy accent is ever wanted) | **MIT**; < 9 kB; `roughness`, `bowing`, `fillStyle` hachure/zigzag/cross-hatch/dots |
| `@rive-app/react-canvas` | State-machine characters | **MIT** runtime; editor has a free tier; community "Learning state machine" file is CC BY; Duolingo's characters are **not** reusable |
| `lottie-web` / LottieFiles | Prebaked motion | lottie-web **MIT**; free LottieFiles assets under the "Lottie Simple License" **but licence varies by creator** — check each file |
| Kenney assets | Characters/sounds in the "lingo" clone | CC0 |
| "lingo" — Code With Antonio `next14-duolingo-clone` (2024) | Reference for hearts/XP/shop/leaderboard UI | **No LICENSE file visible** → study, don't copy |
| Figma kits (Golingo $37, Elingo $35, Quizzo $38) | Reference only | Paid; no free gamified learning kit found |
| Mobbin — "Gamification" collection, Game UI and Achievements pages (710+ screens) | Pattern reference | Paid service |

---

## 5. Arabic & RTL in a playful style

| Typeface (Google Fonts, OFL) | Weights | Playful register | Notes |
|---|---|---|---|
| **Cairo** (Mohamed Gaber) — *current* | variable 200–1000 + slnt ±11 | 700–800 bold & friendly; 900–1000 clots at small sizes | Kufi-based, wide counters, compact ascenders — ideal UI face. Use **800 for display, 900 only for big counters**. |
| **Changa** (Eduardo Tunni) | variable 200–800 | "Bold, playful, contemporary" (Lemonade) | Geometric Kufi; strong candidate for a *display-only* accent if one is wanted. |
| **Baloo Bhaijaan 2** (Ek Type) | variable 400–800 | Heaviest "bubbly" option | Jovial, spurless; closest Arabic analogue to Duolingo's rounded display. Risks reading childish for 17-year-olds — use sparingly. |
| **Rubik** (Hubert & Fischer et al.) | variable 300–900 | Rounded corners, calm | Latin+Arabic+Hebrew; good for mixed FR/AR lines. |
| **Tajawal** (Boutros) | static 200–900 | Clean, modern | Good body alternative; no variable file. |
| **Lalezar** | 400 only | Retro display | Poster-only; no weight range. |

**Rendering caveats.** Never letter-space Arabic — it breaks the joined baseline (there is no tracking tradition in Arabic typography; alreq discusses justification by kashida, not spacing). Set `font-synthesis: none` on `:lang(ar)` so browsers never fake bold or oblique (the CSS Fonts spec uses exactly this Arabic example). Keep uppercase/`text-transform` for Latin kickers only. Give Arabic 1.6 body / 1.3 display line-height (marks need room). Variable weight axes are fine for animation (`font-variation-settings` tween 200 ms on hover), but keep end weights to 600↔800.

**Mirroring.** Progress bars, rails, chevrons and path connectors flow **right → left** under `dir="rtl"`; use logical utilities (`ps-/pe-/start/end`), and let `translate`/`box-shadow` stay physical (a bottom lip has no side). Keep the corner flag physically left only because the Figma frame does; mirror everything that encodes order. Countdown rings should fill clockwise in both directions — rotation is not a reading-direction cue.

**Numerals.** The Maghreb writes European digits (0–9); Eastern Arabic-Indic digits belong to the Mashriq (W3C alreq wiki; Maghreb-specific sources are forum-level but unanimous). Keep **Western digits**, wrapped in `<bdi dir="ltr">` as `Disc` already does; use `tabular-nums` for anything that animates.

---

## 6. Age-appropriateness, dark patterns, accessibility

**Childish vs cool at 15–19.** Kahoot's rule is the sharpest: playful and informal — never childish or patronizing. Brilliant reads "cool" to older teens through restraint (geometric illustration, dark mode, interactivity, no cheering mascot); Duolingo reads younger through round mascots, saturated green and constant praise, and its 2026 refresh deliberately **flattened** the chrome. For Wael: bold shapes, confident depth, strong type, **no exclamation storms**, celebration *earned* and brief, the character badges reactive but quiet.

**Dark patterns to avoid** (what the critics name): guilt-trip notifications, reverse-psychology copy ("or don't"), countdown pressure that isn't the real séance clock, paywall interruptions dressed as game events, fake progress or random rewards. Lost-streak theatre is irrelevant here (no streaks) — keep it that way.

**Accessibility.** WCAG 2.3.3 (AAA): motion triggered by interaction must be disable-able unless essential — use `@media (prefers-reduced-motion: reduce)` (W3C technique C39) **and** honour the existing in-app motion/sound toggles; confetti, shakes, bounces and staggers become opacity-only; number spinning becomes a swap. Contrast on saturated fills: navy #172E5B on lime #8AFF6B ≈ 9.5:1 (good); **white on lime fails** — never white text on lime; white on teal #0491A5 ≈ 3.9:1 (large text/icons only; prefer navy or white on the deep petrol #08434B ≈ 9:1); white on live red #FF3B3E ≈ 3.6:1 → use `--v2-live-strong` text on tints, white only on large labels. Keep focus rings 3 px brand with 3 px offset above the lip. Touch targets ≥ 44 px *plus* the lip.

---

## 7. Restyling Wael Academy's existing features (no new features, no XP)

### 7.1 Tokens — add, never replace (scope: `[data-skin="play"]` in `src/styles/skins/play.css`)

| Token | Value | Why |
|---|---|---|
| `--v2-cta-edge` | `#5BCD3F` (lime −20 % L) | the lip under every lime CTA |
| `--v2-brand-edge` | `#036B7A` | teal pressables, selected filter tabs |
| `--v2-deep-edge` | `#052A30` | the open chapitre panel's lip |
| `--v2-live-edge` | `#C92C2F` | live panel border/lip in the "live" state |
| `--v2-done-edge` | `#B9680B` | the « انتهت » stamp |
| `--v2-ink-edge` | `#0E1D3C` | navy (exercice) plates |
| `--v2-kind-resume-edge` | `#5A35AE` | violet plates |
| `--v2-tile-edge` | `rgb(23 46 91 / .14)` | the lip under white tappable tiles (≈ #DCE0E8 on white) |
| `--v2-line` | `rgb(23 46 91 / .15)` at **2 px** | borders on cards (was 1 px) |
| `--v2-track` | `rgb(23 46 91 / .10)` | progress tracks and rails |
| Dark theme | lime edge `#4FB338`; tile edge `rgb(0 0 0 / .45)`; track `rgb(255 255 255 / .12)` | the lip must still read on night navy |

Rules baked into the tokens: **depth = pressable** (lip only on things that react to a tap; informational panels stay flat with a 2 px border); hues unchanged — no new colour, only derived edges; lime keeps its single meaning (selected / done / the primary action).

### 7.2 Buttons

`ctaClass` (lime pill, 46 px) → **chunky pill**: `bg-v2-cta text-v2-on-cta font-extrabold`, `box-shadow: 0 4px 0 0 var(--v2-cta-edge)`, min-height 44 px + 4 px lip, label `calc(10.5px*var(--ts))`/800, `:hover { filter: brightness(1.03) }`, `:active { translate: 0 4px; box-shadow: 0 0 0 0 }` in 80 ms, release 180 ms overshoot; drop the current `hover:shadow-lg` glow (soft shadows read SaaS). `liveOutlineClass` → 2 px live border + 2 px lip in `--v2-live-edge`, text `--v2-live-strong`. `iconBtnClass` (bell, gear, arrows) stays flat — press = `scale(.92)` 80 ms. Secondary/outline buttons: 2 px `--v2-line` border + 3 px `--v2-tile-edge` lip. Disabled: no lip, 50 % opacity (a button without depth cannot be pressed — the metaphor explains itself).

### 7.3 Cards & panels

`Panel` (24 px, 1 px ink/15, flat) → keep 24 px and **flat**, border 2 px; header title 800. Tappable cards (replay cards, subject cards, document cards, contenu tiles, calendar tiles, playlist rows on desktop) → 16 px radius, 2 px border, **3 px lip** `--v2-tile-edge`, hover `translate: 0 -2px` with lip growing to 5 px, press collapses the lip. Retire `shadow-v2-card`/`shadow-v2-lift` inside the play skin except on the open chapitre panel (`shadow-v2-panel` → replace with a 4 px `--v2-deep-edge` lip). No blurred shadows anywhere else.

### 7.4 Bottom tab bar (phone) & rail (desktop)

Six items unchanged. Active: icon gets a **duotone fill** (`[&_*]:fill-v2-brand/15` + gradient stroke — LayoutGrid, CalendarDays, Users, LibraryBig have closed shapes that take a fill), label 800, a 3 px × 20 px lime "lip" bar under the icon (`rounded-full`). On select: icon bounce `scale 1→1.18→.96→1` over 360 ms `cubic-bezier(.34,1.56,.64,1)` — the icon only, never the label; cue `select` (already wired). Inactive: ink/55, stroke 1.75. Bar: 2 px top border, `pb-safe`, height 56 px + inset. Rail: same active treatment; the active row gets a 2 px brand border and a 3 px lip.

### 7.5 Dashboard

- **Live panel = the quest card.** Border 2 px in the state colour; in `live`: `--v2-live` border + 4 px `--v2-live-edge` lip, the existing `v2-onair` halo kept, CTA « أدخل للمباشر » chunky lime with a `connect` cue. `countdown`/`soon`: replace the text clock with a **chunky ring** (104 px, stroke 10, track `--v2-track`, fill lime, round caps) that depletes over the last 60 min (SOON_MS flips to mm:ss as now), digits in Cairo 900 `tabular-nums` via NumberFlow (one spin per second, `spinTiming 300`). `ended`: an « انتهت » stamp — 2 px `--v2-done` border, `--v2-done-edge` text, rotated −6°, 800 — plus the calm hand-over to docs/replay as now. `postponed`: amber stays. `none`: quiet teal, with the Wael character looking at the empty box (see 7.11).
- **Week calendar = tiles.** Day chips → 44 × 56 px tiles, 2 px border, 12 px radius; selected = lime fill + 3 px `--v2-cta-edge` lip; today = 2 px ink ring; past = ink/40, no lip but still tappable (press = `scale(.96)`); a séance dot becomes a 6 px solid "coin" (live red if live today, brand otherwise). Week swipe: content slides 24 px with the `swipe` cue.
- **Documents = collectible cards.** Each file a tile with a top band in its kind colour and a 40 px kind plate; untaken = 3 px lip; **taken** = lip removed, 24 px lime tick plate pops in (`scale .6→1.15→1`, 320 ms) with `success`; header count « 2/5 » animates with NumberFlow; the top progress bar grows from 6 px to **12 px** with the highlight stripe. When the last file is taken: existing `achievement` cue (380 ms after `success`, as today) + **one** confetti burst from the card (`particleCount 70, spread 75, startVelocity 32, scalar .9, colors ['#8AFF6B','#0491A5','#172E5B','#FFFFFF'], disableForReducedMotion: true`) + header line swap. No fake download progress — the prototype has no network and fakes none.
- **Recent replays.** Tiles with a 40 px play plate in teal; press → `play`. Nothing else.

### 7.6 Matières (subject cards & character badges)

- Cards → game tiles: 16 px, 2 px border, 3 px lip in the **subject tint** (`subjectTint.ts` already exists), title 800, count as a plate badge « 12 درس ». Grid stagger on first load (40 ms × ≤ 8).
- `PortraitStage` → **mascot behaviour** (eyes already follow the pointer; keep the `wael-subject-eyes` fill-opacity convention): stage grows ~15 %; hover → pupils dilate 1.12 (200 ms) and the existing 1.04 scale; press → squash `scaleX 1.06 / scaleY .94` for 80 ms then spring back; card open → "happy squint" (eye group `scaleY .55`, 160 ms in / 240 ms out) with the `open` cue; idle **blink** every 4–7 s (`scaleY .1`, 90 ms), off under reduced motion and when eyes are "asleep" (`sleep` cue already exists). No speech bubbles.
- Filter segmented control: active pill lime with 2 px `--v2-cta-edge` lip; `toggle-on` as now.

### 7.7 Chapitres as a ladder (existing data only)

Keep the accordion and its data. Draw a **3 px vertical rail** (`--v2-track`) at the reading start linking the `Disc`s; rail segments to a « قريباً » chapitre are dashed (`2 6`). Disc states: **locked** (no content) = ink/6 fill, ink/40 digits, a 14 px lock glyph, no lip; **open** (has content, closed) = white disc, 3 px brand border, brand digits, 3 px lip; **current** (expanded) = lime disc + 4 px `--v2-cta-edge` lip + a 6 px lime caret pointing at the title. There is **no completion data** — do not fabricate "done". The only honest "done" is session-scoped (all the chapitre's files taken via `useDownloads`) and may show as a tick on the disc; it resets on refresh like everything else. Node 44 px mobile / 56 px desktop; gap 12 px. The open panel keeps the deep gradient with a 4 px `--v2-deep-edge` lip; its inner rail turns white/16.

### 7.8 Contenus as collectible tiles

White tiles on the deep panel: 16 px radius, 2 px border in the **kind colour at 35 %**, 3 px lip in the kind's edge shade (`--v2-brand-edge` cours, `--v2-ink-edge` exercice, `--v2-deep-edge` série, `--v2-kind-resume-edge` résumé, `--v2-cta-edge` quiz); the `Ribbon` corner flag stays and a 40 px kind **plate** (kind fill, white glyph; navy glyph on lime) sits beside `ItemDisc`. « قريباً » tiles: flat, dashed 2 px border, ink/50, `blocked` on tap with a ±4 px shake (320 ms). Video contenus pop their play plate on `play`.

### 7.9 Video player

Progress bar → **12 px**, lime fill with the highlight stripe over `--v2-track`, 20 px white scrubber with a 2 px lime lip; buffered state none (no network). « السابق / الجاي » → chunky secondary. Playlist: current row lime disc, rows opened this session get a tick plate (session UI state only). **Finished celebration** (on the real `ended` event): stamp overlay « كمّلت الحصّة » (2 px lime border, 800), the existing `achievement` cue, one confetti burst from the player's centre, and the chunky « الجاي » CTA — fires once per video per session, auto-dismisses in 1.2 s or on tap, respects reduced motion (stamp only).

### 7.10 Downloads elsewhere (`DocsSheet`, files sheets)

Same tile rule as 7.5: lip until taken, tick pop + `success`, `press` on a repeat tap (already), sheet rows 48 px tall. The sheet's own progress bar 12 px.

### 7.11 Empty states

`PanelEmpty` (dashed box, gradient line icon) → dashed **2 px** border, the **subject's character** (96–120 px) where a matière is in context (recordings of a subject, a chapitre with no files), otherwise the Wael character; eyes idle down-start toward the empty area; one warm derja line and one chunky action. Empty-after-delete states (comments) use the same component.

### 7.12 Typography (Cairo, unchanged family)

Section titles `calc(14px*var(--ts))`/**800** (was 13/700); CTA labels `calc(10.5px*var(--ts))`/800; counters and ring digits `calc(24px*var(--ts))`/900 `tabular-nums`; body `calc(9px*var(--ts))`/500, line-height 1.6; meta `calc(8px*var(--ts))`/600 ink/60. `font-synthesis: none` on `:lang(ar)`. No letter-spacing on Arabic; Latin kickers (`LatinLine`) may keep `tracking-wide` uppercase.

### 7.13 Motion

Press in 80 ms linear; release 180 ms `cubic-bezier(.34,1.56,.64,1)`; toggles/segments 160 ms; expand/collapse 240 ms `cubic-bezier(.22,1,.36,1)` (keep the grid-rows trick); tile enter 240 ms `translateY 8→0` + fade, 40 ms stagger, first load only; pop 320 ms; shake 320 ms; tab bounce 360 ms; sheets `{ type:"spring", visualDuration:.4, bounce:.15 }`; pops `{ visualDuration:.35, bounce:.4 }`. Nothing animates on mount except the first-load stagger; nothing loops except the live halo. Reduced motion: durations → 0 except opacity 120 ms; confetti/shake/bounce/blink off.

### 7.14 Sound pairing (cues already in `docs/sound-effects.md`)

| Visual | Cue | Timing |
|---|---|---|
| Lip collapses on a tile/CTA | `select` / `open` / `play` / `forward` as today | same frame as the press |
| Tick plate pops | `success` | same frame |
| Last file / video finished: stamp + confetti | `achievement` | 380 ms after `success` (existing) / on `ended` |
| Locked tile shake | `blocked` | same frame |
| Error flash (2 px red border, 240 ms) | `error` | same frame |
| Week slide 24 px | `swipe` | same frame |
| Chapitre grid-rows expand/collapse | `expand` / `collapse` | start of motion |
| Tab icon bounce | `select` | same frame |
| Eyes squint / wake / sleep | `open` (card) / `wake` / `sleep` | same frame |
| **Never used**: `level-up`, `streak`, `badge`, `bonus`, `reward` | — | they would promise mechanics that do not exist |

### 7.15 What NOT to change

Palette hues and their meanings (lime = selected/primary, red = live only, orange = ended); the 24 px panel radius; the six-tab IA and route tree; RTL/logical layout and `LatinLine`; Western digits; the `--ts` type-scale mechanism; the sound grammar (one meaning = one cue); the states dock; the no-network rule (no fake loading, no spinners); and above all **no XP, points, levels, leagues, streaks, hearts, energy, notifications or new screens**.

### 7.16 Tone — 10 strings, before → after (Tunisian derja)

| # | Where | Before (in code) | After | Why |
|---|---|---|---|---|
| 1 | Live CTA | أدخل للمباشر | يلّا، ادخل للمباشر | "yalla" = momentum, still an instruction |
| 2 | Live panel, soon | تبدا بعد شويّة | تبدا توّا… حضّر روحك | anticipation without alarm |
| 3 | Live panel, ended | الحصّة وفات | الحصّة كمّلت — التسجيل جاي | "completed" not "over"; promises the replay |
| 4 | Live panel, none | الحصّة المباشرة (+ empty box) | اليوم راحة. أقرب حصّة: {يوم} {وقت} | a rest day is a state, not an absence |
| 5 | Docs header | 2/5 تحمّلو | هزّيت 2 من 5 | "you grabbed" — collecting, not downloading |
| 6 | Docs, all taken | (calm thank-you line) | الكل عندك. جاهز للحصّة | ownership + readiness, no exclamation |
| 7 | Chapitre, soon | قريباً | مسكّر توّا — يحلّ قريب | a locked door, game vocabulary, no blame |
| 8 | Replay button | شوف التسجيل | عاود شوف الحصّة | "watch it again" is a verb of mastery |
| 9 | Video finished (new stamp) | — | كمّلت الحصّة! الجاية؟ | one exclamation, then a question that moves on |
| 10 | Locked recording (`blocked`) | (blocked tap) | هالتسجيل للمشتركين — شوف العروض | explains the lock, offers the door, no shame |

Register rules: second person singular, verbs first, one exclamation mark per screen at most, no diminutives, no emoji in UI strings, no "don't lose…" constructions.

---

## 8. Rules for Wael Academy (gamified skin)

1. Every tappable element has a bottom lip (2–4 px) in its hue's edge shade; every non-tappable surface has none.
2. The lip collapses on `:active` within 80 ms and returns with overshoot in ≤ 200 ms.
3. No blurred drop shadows inside `[data-skin="play"]` except the live halo.
4. Borders on cards and tiles are 2 px; hairlines (1 px) only as dividers.
5. Panels keep 24 px radius; tiles and plates use 16 px and 12 px; buttons stay pills.
6. No new hue is introduced; every new token is a derived edge shade of an existing hue (same hue, −18 to −22 % lightness).
7. Lime means exactly one thing: selected, done, or the primary action — never decoration.
8. Red appears only when something is live; orange only when something has ended.
9. Grey (ink ≤ 40 %) means locked or past; locked things shake and play `blocked`, never open a paywall silently.
10. Progress bars are 12 px (14 px desktop), rounded, with an inner highlight stripe; rings are stroke 10 at 104 px.
11. Every number that changes animates with tabular digits; numbers are Western digits in `<bdi dir="ltr">`.
12. One celebratory moment per screen visit at most, and only on a real completion (last file taken, video ended).
13. A celebration lasts ≤ 1.2 s before the next action is available and is dismissible on tap.
14. Confetti is a single burst (≤ 80 particles) from the element that earned it, never a loop or a rain.
15. Sound and motion start on the same frame; a visual without its cue, or a cue without its visual, is a bug.
16. `level-up`, `streak`, `badge`, `bonus`, `reward` cues are never used.
17. Nothing animates on mount except a first-load stagger ≤ 320 ms total; nothing loops except the live halo.
18. Under `prefers-reduced-motion: reduce` or the in-app toggle: no confetti, shake, bounce or blink; transitions become opacity-only.
19. Character badges react (gaze, dilate, squint, blink) but never speak, point or nag.
20. Idle blinks occur every 4–7 s at most and never while eyes are "asleep".
21. Section titles are Cairo 800, counters 900, body 500–600; weights 1000 and 200–300 are not used in UI.
22. Arabic text is never letter-spaced, never faux-bold (`font-synthesis: none`), and has ≥ 1.5 line-height in body copy.
23. Text on lime is navy; text on teal is white only at ≥ 18 px/700 or as icons; contrast ≥ 4.5:1 for body everywhere.
24. Touch targets are ≥ 44 px *before* the lip; focus rings are 3 px brand with 3 px offset.
25. The active tab shows a duotone fill, an 800 label and a 3 px lime bar; only the icon bounces.
26. Tiles encode order with a rail that flows right-to-left; direction cues use logical properties.
27. Empty states show a character, one line of derja and one chunky action — never a bare dashed box.
28. No fake progress, spinners, loading bars or "syncing" states — the prototype has no network and pretends none.
29. No XP, points, levels, leagues, streaks, hearts, energy, timers beyond the real séance clock, or notifications.
30. Copy uses second-person verbs, at most one exclamation mark per screen, no diminutives, no "don't lose" framing.
31. "Done" states are shown only from real or session data; nothing claims persistence the store does not have.
32. The `soft` skin must still render correctly: every play-skin rule lives under `[data-skin="play"]`.

### Checklist (per screen, before calling it done)

- [ ] Phone (≈390 px) and desktop both checked; RTL mirrors order cues; lips still visible at 1× DPR.
- [ ] Every button/tile: lip present, collapses on press, cue fires on the same frame.
- [ ] Flat panels have no lip or blur; borders 2 px.
- [ ] Progress bar 12 px with stripe; ring stroke 10; digits tabular + `<bdi>`.
- [ ] Exactly one possible celebration on this screen; confetti burst ≤ 80 particles; `disableForReducedMotion: true`.
- [ ] Reduced-motion run: no confetti/shake/bounce/blink; sound toggle respected.
- [ ] Contrast checked on lime, teal, red fills; focus ring visible above the lip.
- [ ] Characters: gaze, dilate, squint, blink implemented; idle off when asleep.
- [ ] Empty state uses a character and one derja line; delete-to-empty path tested.
- [ ] Strings reviewed against §7.16 register; one exclamation max; Western digits.
- [ ] `npm run check:sounds` and `npx tsc -b` pass; `?skin=soft` still renders the flat look.

---

## Sources (accessed 2026-10-26)

**Duolingo (official)** — Shape Language: Duolingo's art style — https://blog.duolingo.com/shape-language-duolingos-art-style/ — 2 Jul 2020 · New home screen design (the path) — https://blog.duolingo.com/new-duolingo-home-screen-design — 6 May 2022 · You're on fire! Streak milestone design — https://blog.duolingo.com/streak-milestone-design-animation — 21 Jan 2022 · Duolingo Energy — https://blog.duolingo.com/duolingo-energy/ — 3 Jul 2025 · Elevating craft: how we refreshed our core tabs — https://blog.duolingo.com/core-tabs-redesign — 4 Feb 2026 · Reshaping Duo — https://blog.duolingo.com/reshaping-duo/ — 20 Nov 2013 · Design hub — https://blog.duolingo.com/hub/design/ · Rive: Duolingo's AI-powered Video Call brings Lily to life — https://rive.app/blog/duolingo-s-ai-powered-video-call-brings-lily-to-life — 20 Mar 2025 · Creative Bloq, Feather Bold (2019; body not retrievable today) — https://www.creativebloq.com/news/feather-bold · Unofficial token reconstruction — https://www.shadcn.io/design/duolingo · NBC News, path backlash & von Ahn interview — https://www.nbcnews.com/tech/tech-news/duolingos-update-redesign-luis-von-ahn-interview-rcna44655 — 2022.

**Brilliant** — Rive: How Brilliant.org motivates learners with Rive animations — https://rive.app/blog/how-brilliant-org-motivates-learners-with-rive-animations — 2 May 2024 · ustwo × Brilliant ("Game Feel") — https://ustwo.com/work/brilliant/ · A Brilliant brand refresh (Koto, PIX; Medium, ~2024; not fetchable today) — https://pcho.medium.com/a-brilliant-brand-refresh-4af021c11486 · 60fps.design Brilliant catalogue — https://60fps.design/apps/brilliant.

**Other apps** — Kahoot! Brand Guidelines PDF (Apr 2019) — https://kahoot.com/files/2017/08/Kahoot-BrandGuide-July2019.pdf · Khan Academy, How do Mastery levels work? — https://support.khanacademy.org/hc/en-us/articles/5548760867853 · Khan Academy, Course and Unit Mastery — https://support.khanacademy.org/hc/en-us/articles/115002552631 · Headspace (third-party extraction) — https://www.webdesignhot.com/design.md/headspace/ · Finch review (Internet Matters) — https://www.internetmatters.org/advice/apps-and-platforms/wellbeing/finch/ · Habitica RPG overview (Game Developer) — https://www.gamedeveloper.com/design/gamified-productivity-habitica-rpg-overview · Forest gamification (UX Planet) — https://uxplanet.org/what-to-learn-from-the-forest-apps-gamification-5d8fe48eb4f4 · Mimo (DesignRush) — https://www.designrush.com/best-designs/apps/mimo · Elevate (DesignRush) — https://www.designrush.com/best-designs/apps/elevate · Language-app comparison incl. Memrise/Busuu (JCSI 2025) — https://ph.pollub.pl/index.php/jcsi/article/view/7909 · Nike Run Club release notes — https://www.apkmirror.com/apk/nike-inc/nike-run-club/nike-run-club-2-7-1-release/ · Hello Monday, Strava 2022 — https://www.hellomonday.com/work/strava-2022 · Noon Academy (App Store) — https://apps.apple.com/us/app/noon-academy/id1214874641 · Abwaab × thoughtbot — https://thoughtbot.com/case-studies/Abwaab · Athar RTL concept (Mostaql) — https://mostaql.com/portfolio/3666366-athar-arabic-learning-experience-uiux-case-study.

**Theory** — Octalysis complete framework (Yu-kai Chou) — https://yukaichou.com/gamification-examples/octalysis-complete-gamification-framework/ · Streak design (Chou) — https://yukaichou.com/gamification-study/master-the-art-of-streak-design-for-short-term-engagement-and-long-term-success/ · Ryan, Rigby & Przybylski, The Motivational Pull of Video Games (2006) — https://www.rochester.edu/warner/lida/wp-content/uploads/2022/11/02bfe513dd59366750000000.pdf · Gao et al. 2024 leaderboard study (NSF PAR) — https://par.nsf.gov/servlets/purl/10591267 · Juice it or lose it (Jonasson & Purho, GDC 2012; summaries) — https://gamedeveloper.com/design/squeezing-more-juice-out-of-your-game-design- and https://rpgplayground.com/research-making-a-juicy-game/ · Game feedback feel incl. Lin et al. 2022 — https://eastondev.com/blog/en/posts/dev/20260521-game-feedback-feel/ — 21 May 2026 · Flow channel (Game Developer) — https://www.gamedeveloper.com/design/understanding-the-flow-channel-in-game-design · Hooked summary — https://fs.blog/2014/03/hooked/ · Growth.Design, Duolingo's User Retention — https://growth.design/case-studies/duolingo-user-retention · Lenny's Newsletter, How Duolingo reignited user growth — https://www.lennysnewsletter.com/p/how-duolingo-reignited-user-growth · Lenny's, Behind the product: Duolingo streaks — https://www.lennysnewsletter.com/p/behind-the-product-duolingo-streaks — 15 Dec 2024.

**Communities** — HN: An opinionated critique of Duolingo — https://news.ycombinator.com/item?id=45425061 — 30 Sep 2025 · HN 2023 thread — https://news.ycombinator.com/item?id=34978260 · HN: It's quite hard to lose a Duolingo streak — https://news.ycombinator.com/item?id=31966919 — 2022 · HN 2025 quit thread — https://news.ycombinator.com/item?id=44100258 · Show HN: a retention mechanic that isn't Duolingo manipulation — https://news.ycombinator.com/item?id=47317677 — 2026 · Peter Fisk, Engaging Gen Z — https://www.peterfisk.com/2025/09/engaging-gen-z-consumers-from-polished-to-playful-aspiration-to-irony-message-to-meme-bilibili-to-duolingo-rappi-and-ryanair-and-the-rise-of-cringe-culture/ — Sep 2025 · HerCampus, Deserting Duolingo — https://www.hercampus.com/school/ucla/deserting-duolingo-how-duolingo-fumbled-gen-z/ · Duolingo: when gamification becomes manipulation — https://ashleyeleftheriou.com/2025/01/13/duolingo-when-gamification-becomes-manipulation/ — 13 Jan 2025 · Mobbin gamification collection — https://mobbin.com/collections/4f87de40-89ae-4ec8-bdc9-8129fbaa75bd/mobile/screens · Mobbin Achievements — https://mobbin.com/explore/mobile/screens/achievements-awards · NN/g, Don't Trick Users (deceptive patterns) — https://www.nngroup.com/videos/avoid-deceptive-patterns/.

**Open source & tooling** — canvas-confetti — https://github.com/catdad/canvas-confetti · react-rewards — https://github.com/thedevelobear/react-rewards · party-js — https://github.com/yiliansource/party-js · NumberFlow — https://number-flow.barvian.me/ and https://www.npmjs.com/package/@number-flow/react · Motion transitions (springs) — https://motion.dev/docs/react-transitions · Rough.js — https://github.com/rough-stuff/rough · rive-react — https://github.com/rive-app/rive-react · Rive community "Learning state machine" (CC BY) — https://rive.app/community/7904-15240-learning-state-machine · lottie-web — https://github.com/airbnb/lottie-web · LottieFiles licensing basics — https://help.lottiefiles.com/animation-licensing-basics- · Code With Antonio, next14-duolingo-clone — https://github.com/AntonioErdeljac/next14-duolingo-clone · 3-D CSS button technique — https://schier.co/blog/clicky-3d-buttons-with-css · uisfx — https://github.com/romainsimon/uisfx (see `docs/sound-effects.md`).

**Arabic, RTL, accessibility, haptics** — google/fonts METADATA: Cairo — https://raw.githubusercontent.com/google/fonts/main/ofl/cairo/METADATA.pb · Changa — https://raw.githubusercontent.com/google/fonts/main/ofl/changa/METADATA.pb · Baloo Bhaijaan 2 — https://raw.githubusercontent.com/google/fonts/main/ofl/baloobhaijaan2/METADATA.pb · Rubik — https://raw.githubusercontent.com/google/fonts/main/ofl/rubik/METADATA.pb · Tajawal — https://raw.githubusercontent.com/google/fonts/main/ofl/tajawal/METADATA.pb · Cairo repo (Mohamed Gaber) — https://github.com/Gue3bara/Cairo · Lemonade, eight Arabic fonts — https://lemonadedigitalmedia.com/en/arabic-fonts-for-web-design-from-google/ · CSS font-synthesis (CSS-Tricks) — https://css-tricks.com/?p=318556 · W3C alreq, Arabic numerals (draft) — https://github.com/w3c/alreq/wiki/Arabic-numerals-%28Draft%29 · W3C Arabic script resources — https://www.w3.org/TR/2024/DNOTE-arab-lreq-20240716/ · Western digits in the Maghreb (forum-level) — https://discuss.kde.org/t/force-date-summary-in-arabic-to-use-western-arabic-numerals/13842 · WCAG 2.3.3 Understanding — https://w3c.github.io/wcag/understanding/animation-from-interactions · Technique C39 — https://w3.org/WAI/WCAG22/Techniques/css/C39 · Android haptics design principles — https://developer.android.com/develop/ui/views/haptics/haptics-principles · Apple HIG, Playing haptics (JS-rendered; not fetchable today) — https://developer.apple.com/design/human-interface-guidelines/playing-haptics.
