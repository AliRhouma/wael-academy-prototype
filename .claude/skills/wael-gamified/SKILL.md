---
name: wael-gamified
description: Apply the gamified `play` skin — Duolingo/Brilliant-grade "game feel" on the Wael brand — to ANY surface of the Wael Academy élève space (`/student-v2`). A new card, button, list, chip, progress, empty state, celebration or whole screen must look and feel like the rest of the skin: pressable lips, 2 px outlines, one lime moment per screen, colour as state, chunky progress, stamps, one earned burst, a character in the empty state, sound on the same frame as the visual. Triggers whenever the user says "gamified", "gamification", "game feel", "Duolingo-style", "Brilliant-style", "chunky button", "3D button", "lip", "juicy", "celebration", "confetti", "burst", "stamp", "ring", "ladder", "collectible", "mascot", "the play skin", "data-skin", "make it more fun / playful / alive", "restyle", or touches `src/styles/skins/play.css`, the `.v2-*` hook classes, `Ring`, `Num`, `Burst`, `useShake`, `useAllTaken`, `tileClass`, `ctaClass`. Use it for every élève-space surface built or restyled, even a single button, so the whole space reads as one game — never childish, never nagging, never fake progress. Sibling of `wael-mobile-ios` and `wael-mobile-android` (the platform chrome); the brand itself is `wael-design-system-soft`.
---

# Wael Academy — the `play` skin (gamified)

How the élève space feels by default: the existing features restyled toward game feel —
depth you can press, flat colour with one darker edge per hue, a character that reacts,
feedback on the frame of the action — without adding a mechanic. No XP, points, levels,
leagues, streaks, hearts or energy; completion only from real or session data. `play` is
the default (`<html data-skin="play">`); `?skin=soft` is the flat Figma look for
comparison. The research is `docs/mobile/gamification-design.md`; this is the operational
half, written against the code as built.

## Start here, every time

1. **Read, in this order:** `src/styles/skins/play.css` (every rule; the header lists the
   hooks) · `src/styles/v2.css` (tokens; the base side of the hooks) ·
   `src/features/student-v2/ui.tsx` (the primitives) · `src/features/student-v2/downloads.tsx`
   (`useDownloads`, `useAllTaken`) · `src/app/platform.ts` (`data-skin`, `useSkin()`) ·
   `docs/sound-effects.md` §4–§5 · the closest built surface (table below).
2. **Look at it.** `npm run dev` → `http://localhost:5173/student-v2`; add `?skin=soft` for
   the flat look (`data-skin` is stamped once at boot — reload with the parameter to
   switch); `http://localhost:5173/mobile` shows both phones with a « لعب / هادي » switch.
3. **Screenshot:** `npm run shot -- "http://localhost:5173/student-v2" 1440 900 out.png`
   (`<url> [width] [height] [out.png] [js-expression] [waitMs]`, CSS px); also 390 × 844.
4. **Build with the hooks and primitives below**, the space's tokens (`text-v2-ink`,
   `bg-v2-surface`, `bg-v2-cta`, `text-v2-brand`, `border-v2-ink/15`), sizes as
   `text-[calc(Npx*var(--ts))]`, a `data-uisfx` cue on every clickable. Then `npx tsc -b`
   and `npm run check:sounds`.
5. **Copy from `references/recipes.md`.**

## The skin in one paragraph

Everything that takes a tap stands on a **lip** — a zero-blur `box-shadow` in its hue's own
darker edge (4 px under lime, 3 px under a white tile, 2 px under a chip) that collapses in
80 ms under the finger and springs back in 180 ms; everything that only informs is **flat**
with a 2 px border. The hues are the space's own; the skin adds only derived edges. **Lime
means one thing** — selected, done, or the primary action — so each screen has one lime
moment. **Grey is locked or past, colour is active, lime is done.** Progress is a 12 px
striped bar or a stroke-10 ring; an end is a tilted stamp; a real completion earns **one**
burst with `achievement`; a locked door shakes and plays `blocked`; a matière's character
looks at the empty box; the badge squashes when its card is held. Copy is warm derja,
second person, verbs first. Nothing animates on mount but a 240 ms stagger; nothing loops
but the live halo.

## How the skins layer

```
index.css:  tailwind → v2.css (tokens) → skins/play.css (content look, data-skin="play", default)
            → platform/ios.css → platform/android.css (chrome + conventions) → mobile.css
```

Later wins, and each layer owns a different thing:

- **`play` owns the content look:** outlines and lips, the chunky CTA, chips, progress bars
  and rings, stamps, bursts, the ladder, the mascot squash, empty-state characters, the
  press physics, the tone of voice.
- **The platform skins own the chrome:** the tab bar (`BottomBar` → `IosTabBar` /
  `AndroidNavBar` / `WebTabBar`; five tabs from `studentV2Tabs`, six links on the desktop
  rail), headers, sheets' radii / grabber / scrim, the insets, `--ts` (1.6 / 1.55), the chrome
  radii (`.rounded-3xl` → 22 / 28, `.rounded-2xl` → 14 / 16, `.rounded-t-3xl` → 38 / 28).

`play.css` never restyles the tab bar, headers, sheet chrome or system bars; the platform
files never restyle cards, CTAs, progress or the mascot. Platform CSS comes after `play.css`
and owns the radius overrides; the skin hard-sets only corners of its own (stamp 10 px,
plates and day tiles 12 px).

## How the skin is wired

`installDevice()` (`main.tsx`, before React) stamps `data-skin`. `V2Shell` puts
`data-space="v2"` on the root, and **every rule lives under
`[data-skin="play"] [data-space="v2"]`**; sheets and dialogs portal to `<body>` and stamp
`data-space="v2"` themselves (`DocsSheet`, `FilesSheet`, the offers sheet). **Components
never branch on the skin** — one tree renders under both; they expose hook classes, plus
`.v2-play` (hidden by `v2.css`, `display: revert-layer` under play) or `.v2-soft` (hidden
under play) for an element that exists in one skin only. `useSkin()` is the gallery's.
Dark values sit under `[data-skin="play"][data-theme="dark"]`.

## The hooks (as built)

| Hook | Marks | Under `play` | Carried by |
|---|---|---|---|
| `.v2-cta` · `.v2-cta-ghost` · `.v2-cta-live` | the lime pill · the pill after its job · the red outline | 800 at `calc(10.5px*var(--ts))`, 4 px `--v2-edge-cta` lip, hover `brightness(1.03)`, disabled = no lip · white, 2 px line, 3 px tile lip · 2 px border, 2 px live lip | `ctaClass`, `CtaLink`, `ctaGhostClass`, `liveOutlineClass`, the live « يلّا، ادخل للمباشر » link |
| `.v2-btn` | a secondary pill | 2 px `--v2-line`, 700, 3 px tile lip; disabled = none | `btnClass`, `StepButton` |
| `.v2-panel` | a section that informs | **flat**: 2 px border, no shadow, `> header h2` 800 / 14 px | `Panel`, `SessionCard`, `PlaylistPanel` |
| `.v2-tile` + `data-taken` / `data-locked` | anything tappable | 2 px `--v2-tile-line` border, 3 px `--v2-lip` (default `--v2-edge-tile`), hover lifts 2 px and the lip grows to 5 (`hover: hover`), press collapses. Taken: no lip, brand/40 border. Locked: dashed, ink/50, no lip | `tileClass` — doc cards and sheet rows, subject cards (`--v2-lip` = `subjectTint().dot`), chapitres, `ItemCard`, day tiles, month cells, playlist rows, replays |
| `.v2-rail` · `.v2-contents` · `.v2-playlist` · `.v2-sheet-row` | lists of tiles; a sheet's file row | bottom padding for the last lip · min-height 48 | DocsPanel, SubjectScreen, PlaylistPanel, the sheets |
| `.v2-chip` (+ `aria-selected` / `aria-pressed` / `data-on`) · `.v2-chip-count` · `.v2-seg` | pills, filters, segments; the segmented frame | 2 px border, 700; the one in force lime + 2 px lip, 800, no gradient; no border inside `.v2-seg` | `Chip`, filter tabs, group pills, `ViewSwitch` |
| `.v2-bar` · `.v2-bar-fill` | progress | 12 px (14 at md), `--v2-track`, lime fill, inset white stripe, width 500 ms | DocsPanel; `.v2-play .v2-bar` in the sheets |
| `.v2-ring` · `-track` · `-fill` · `-digits` | the countdown | surface disc, ink/10 track, lime round-capped fill, 900 ms per tick; digits 900 tabular | `Ring` in `LivePanel` |
| `.v2-num` · `.v2-num-tick` | a number that changes | rolls up 0.45 em, 300 ms, on change only | `Num` |
| `.v2-stamp` (+ `data-tone="cta"`) | « انتهت » / « كمّلت الحصّة » | −6°, 2 px `--v2-done`, `--v2-edge-done` ink, 800; cta = lime border, navy | `StateChip`, LivePanel `Ended`, the finish |
| `.v2-quest[data-tone]` | the live panel's box | 2 px border per tone (`live` · `calm` · `done` · `off`); only `live` gets a 4 px lip | LivePanel `Box` |
| `.v2-day` (+ `aria-pressed`, `data-today`, `data-past`) · `.v2-coin` · `.v2-block` | week-strip tiles, the séance dot, a week-grid block | 12 px radius; selected lime + lip, today 2 px ink, past grey `scale .96`; coin 6 px · 2 px lip | `WeekStrip`, `WeekGrid` |
| `.v2-tick` · `.v2-doc-plate[data-kind]` · `.v2-doc-inner` | the collected mark; a document's plate; its inner box | 24 px lime plate, `v2-pop` 320 ms (18 px in a row disc) · 40 px square in the kind colour · border dropped inside a tile | doc cards, sheet rows, playlist rows |
| `.v2-play-plate` · `.v2-play-badge` · `.v2-row-disc[data-on]` | a replay's play mark; the poster badge; a playlist disc | 40 px teal plate, brand lip · lime plate, 4 px lip, pressed with the `group` · lime when playing | `RecentSection`, VideoScreen, `PlaylistPanel` |
| `.v2-stage` · `.v2-finish` | the `VideoStage` wrapper; the finish overlay | 12 px timeline, stripe, 20 px scrubber with a lime lip · deep 72 % scrim, 200 ms fade, stamp pop | VideoScreen |
| `.v2-count[data-on]` | a count as a plate badge | 8 px radius, ink/6 (brand/12 on), 800 | SubjectsScreen |
| `.v2-squash` | the subject badge | `scale 1.06 .94` in 80 ms while `.group:active`, back in 180 | `PortraitStage` |
| `.v2-ladder` · `.v2-ladder-step[data-state]` · `.v2-ladder-node[data-state]` · `.v2-node-mark[data-kind]` · `.v2-chapter-open` | the chapitres | 3 px `--v2-track` rail from the steps' pseudo-elements, dashed into `locked`; nodes locked ink/6 · open white + 3 px teal + teal lip · current lime + 4 px lip + caret; mark `lock` / `done` (pops); the open panel's shadow → 4 px deep lip | `ChapterList`, `Disc` |
| `.v2-kind-{cours,exercice,serie,resume,quiz}` · `.v2-plate` | a contenu's kind | border in the kind at 35 % (quiz 55 %), lip in its edge; 40 px glyph plate at md+ | `ItemCard` |
| `.v2-empty` | an empty state | 2 px dashed border | `PanelEmpty`, `DayList` |
| `.v2-burst` · `.v2-shake` | the one celebration · a locked thing's answer | 16 particles, 620 ms · ±4 px, 320 ms | `Burst`, `useShake` |
| `.rise` | first-load stagger | 240 ms, `--i` × 40 ms (base 460 / 70) | list items with `style={{ "--i": i }}` |

## Tokens — derived edges, no new hue

On `[data-skin="play"]` (dark on `[data-skin="play"][data-theme="dark"]`): each is an
existing hue at −18 to −22 % lightness. A tile may name its own lip with `--v2-lip` and its
border with `--v2-tile-line`.

| Token | Light | Dark | Under |
|---|---|---|---|
| `--v2-edge-cta` | `#5bcd3f` | `#4fb338` | lime: CTA, selected chip / day, current node, tick, scrubber |
| `--v2-edge-brand` | `#036b7a` | `#1b8899` | teal: play plate, open node, cours tiles |
| `--v2-edge-deep` | `#052a30` | `#020f14` | the open chapitre panel, série tiles |
| `--v2-edge-live` | `#c92c2f` | `#cc3f42` | the red outline, the live quest card |
| `--v2-edge-done` | `#b9680b` | `#c47320` | the stamp's ink |
| `--v2-edge-violet` · `--v2-edge-ink` | `#5a35ae` · `#0e1d3c` | `#6d4bc8` · `#37539a` | résumé · exercice tiles |
| `--v2-edge-tile` | `rgb(23 46 91 / .14)` | `rgb(0 0 0 / .45)` | a white tile, `.v2-btn`, the ghost, `.v2-block` |
| `--v2-line` | `rgb(23 46 91 / .15)` | `rgb(255 255 255 / .16)` | 2 px borders |
| `--v2-track` | `rgb(23 46 91 / .10)` | `rgb(255 255 255 / .12)` | bar and ring tracks, the rail |

## The primitives (`ui.tsx` unless noted)

- `ctaClass` / `ctaGhostClass` / `liveOutlineClass` / `btnClass` / `iconBtnClass` (flat in
  both skins) / `tileClass` (= `"v2-tile"`, on the element that takes the tap).
- `Panel` (flat section) · `PanelEmpty` (`icon`, `title`, `body`, `action`, **`character`** =
  a matière name when one is honestly in context → Wael dressed for it, 112–128 px, in
  place of the glyph).
- `Ring({ fraction, size = 116, stroke = 10 })` — `fraction` is how much is LEFT; children
  are the digits. `Num({ value })` — re-keys on change, never animates the first value,
  `<bdi dir="ltr">`. `Burst({ at })` — fires on a new timestamp, clears at 700 ms, inside a
  `relative` parent. `useShake()` → `[className, trigger]`.
- `useAllTaken(done, live = true)` (`downloads.tsx`) → the instant the last file was taken by
  hand: `achievement` 380 ms after the download's `success`; never on load, never for a
  demo-forced « done ». `useDownloads()` → `has(id)`, `download(id, name)` (`success`, then
  `press` on a repeat). `Chip`, `Disc`, `Ribbon` in `matieres/parts.tsx`.

## Motion

| Move | Value |
|---|---|
| Press / release | 80 ms linear → 180 ms `cubic-bezier(.34,1.56,.64,1)` on `translate`, `scale`, `box-shadow`; colour 150 ms — one shared block in `play.css` |
| Hover lift | tile −2 px, lip 3 → 5 px, `@media (hover: hover)` only |
| Pop (`v2-pop`) · shake | `scale .6 → 1.15 → 1`, 320 ms · ±4 / ±3 px, 320 ms |
| Number · bar · ring | 300 ms `cubic-bezier(.22,1,.36,1)` · width 500 ms · dashoffset 900 ms linear |
| Burst · finish · squash | 620 ms, removed at 700 · fade 200 ms, gone at 1 200 ms or on tap · 80 ms in, 180 back |
| First load | `.rise` 240 ms, 40 ms apart; nothing else on mount; only `.v2-onair` loops |
| Reduced motion | `play.css`: burst hidden; shake / tick / mark / num / stamp off; finish 120 ms; press, lift, squash, bar, ring transitions 0 ms. New keyframes join that block |

## Sound pairing (`docs/sound-effects.md` §4 — cue on the frame of the visual)

| Visual | Cue | Where |
|---|---|---|
| A lip collapses | the tap's meaning: `select`, `open`, `play`, `forward`, `connect`, `toggle-on`, `expand` / `collapse` | `data-uisfx` on the clickable |
| A tick pops onto a file | `success` (`press` when taken again) | `download()` |
| Last file of a list: burst + « الكل عندك » | `achievement` | 380 ms after `success`, `useAllTaken` |
| Video ends: stamp + burst | `achievement` · tap away `close` · « الجاي » `skip-next` | once per video per session (`fired` ref) |
| A locked chapitre / recording shakes | `blocked` | same frame; the recording then goes to `/offres` after 320 ms (0 under reduced motion) |
| Week slides · chapitre opens / folds · badge wakes / sleeps | `swipe` · `expand` / `collapse` · `wake` / `sleep` | arrows · the grid-rows move · the states dock |
| **Never** | `level-up`, `streak`, `badge`, `bonus`, `reward` | they promise mechanics that do not exist |

## Tone

Second person singular, verbs first, at most one exclamation mark per screen, no
diminutives, no emoji, no "don't lose…" framing, Western digits in `<bdi dir="ltr">`. The
strings warmed in the code: « يلّا، ادخل للمباشر » · « تبدا توّا… حضّر روحك » ·
« الحصّة كمّلت — التسجيل جاي » · « اليوم راحة » · « هزّيت N من M » · « الكل عندك. جاهز للحصّة » ·
« مسكّر توّا » (the locked chapitre's accessible name; its flag still reads « قريباً » — the
research's « — يحلّ قريب » tail is not in the code) · « عاود شوف الحصّة » ·
« كمّلت الحصّة! الجاية؟ » · « هالتسجيل للمشتركين — شوف العروض ».

## Non-negotiables (each checkable in the browser)

1. **Depth = pressable.** A lip only on what takes a tap; `.v2-panel` and `PanelEmpty` stay
   flat with a 2 px border.
2. Press physics come from the shared block in `play.css`; never a second one in a
   component (the soft `active:scale-[.98]` stays — the hook's `:active` wins under play).
3. **No blurred shadow** under play except the live halo; menus and sheets are the
   platform's. `shadow-v2-*` on a hooked element is overridden — add no new ones.
4. Borders 2 px on tiles, chips, panels; 1 px only as dividers.
5. **No new hue.** A new colour is a derived edge of an existing one, in the token block,
   with a dark value.
6. **Lime = selected / done / the primary action**: one chunky lime CTA per card, never
   decoration, never white text on it.
7. Red only when live; orange only when ended; grey (ink ≤ 50 %) is locked or past.
8. Locked things carry `data-locked="true"` + `data-uisfx="blocked"` + `useShake`, explain
   in words and may lead to العروض — never a silent paywall, never a disabled-looking row.
9. Progress is `.v2-bar` or `Ring`; never a hairline, a spinner or fake loading.
10. A number that changes is `<Num>`; nothing rolls on mount.
11. **One celebration per screen visit**, only on a real completion (`useAllTaken`, the
    video's end): one `Burst` from the element that earned it, gone in 700 ms; a stamp
    dismisses in 1.2 s or on tap; the next action never waits.
12. Sound and visual on the same frame; a visual without its cue, or a cue without its
    visual, is a bug; `level-up` / `streak` / `badge` / `bonus` / `reward` never.
13. Nothing animates on mount except `.rise`; nothing loops except the live halo; reduced
    motion is `play.css`'s job — never re-enable a burst, shake or pop inline.
14. Components never branch on the skin: hooks + CSS, `.v2-play` / `.v2-soft`; every rule
    under `[data-skin="play"] [data-space="v2"]`; a portaled surface stamps `data-space="v2"`.
15. Chrome is the platform's: no tab-bar, header, sheet-chrome or system-bar rule in
    `play.css`; no hand-set radius where the platform maps one; the 24 px panel radius and
    the Figma geometry stay — the skin changes borders, lips, weights and motion, not layout.
16. « Done » only from real or session data (`useDownloads`, the playlist's `seen`, the
    video's end); never a stored flag, never a celebration from a demo-forced state
    (`useAllTaken(done, !allTaken)`).
17. A character only where a matière is honestly in context; otherwise the glyph — there
    is no neutral Wael. The badge squashes, never speaks or nags; its eyes are the
    pipeline's.
18. Type: panel titles 800 / 14 px, CTA 800, counters 900 tabular; never 1000, never
    letter-spaced Arabic, `font-synthesis: none`.
19. Targets ≥ 44 px before the lip; lists leave room under the last lip; the focus ring is
    3 px brand at 3 px offset, above the lip; hover gated on `hover: hover`, so a tapped
    tile never stays lifted.
20. Copy follows the tone rules; one exclamation per screen at most.
21. No XP, points, levels, leagues, streaks, hearts, energy, timers beyond the real séance
    clock, notifications, or new screens for the skin's sake.
22. `?skin=soft` still renders the flat look — a play rule that leaks into it is a bug.

## Before calling a play surface done

- [ ] Checked at ~390 px and desktop, `play` and `?skin=soft`, light and dark.
- [ ] Every tappable: lip present, collapses on press, springs back, cue on the same frame.
- [ ] Flat panels have no lip or blur; borders 2 px; one lime CTA; nothing white on lime.
- [ ] Progress 12 px with stripe or a stroke-10 ring; `<Num>` on every changing number.
- [ ] At most one `Burst`, reachable only by a real completion.
- [ ] Locked things shake + `blocked` + explain; nothing claims « done » the data lacks.
- [ ] Reduced-motion run: no burst / shake / pop / roll; sound toggle respected.
- [ ] Empty state: a character where a matière is in context, one derja line, one action.
- [ ] `npm run check:sounds`, `npx tsc -b`; §5 of `docs/sound-effects.md` updated; one line
      stating the screen's main UX decision (CLAUDE.md).

## Out of scope — not built, to commission

- **Eye expressions** (dilate, squint, blink): the eyes pipeline (`wael-subject-eyes`) owns
  `src/components/icons/subjects/Eyes.tsx` and `subjects.tsx`; the skin squashes the whole
  badge only.
- **A neutral Wael** for matière-less empty states: every portrait is matière-dressed, so
  `PanelEmpty` keeps its glyph without a `character`.
- **A rail inside the open chapitre panel** (research §7.7): the path resumes beneath it.
- Proposed, not built: the active tab's duotone fill and bounce (the tab bar is the
  platform's); `canvas-confetti`, NumberFlow and Motion (replaced by `Burst`, `Num`, CSS);
  the six-tab IA (five on the phone, six on the desktop rail).

## Go deeper

`references/recipes.md` — fifteen copy-adaptable recipes. `docs/mobile/gamification-design.md`
— case studies, toolkit values, §7 the screen-by-screen brief, §8 the 32 rules.
`docs/mobile/README.md` — gallery and platform layer. `docs/sound-effects.md` — the sound
grammar. `wael-mobile-ios` / `wael-mobile-android` — the chrome around this.
