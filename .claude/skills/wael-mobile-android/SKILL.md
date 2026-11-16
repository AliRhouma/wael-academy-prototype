---
name: wael-mobile-android
description: Apply Android conventions (Material 3 Expressive components with One UI layout, on a Galaxy A55 running One UI 9 / Android 17, Nov 2026) to ANY surface of the Wael Academy élève space (`/student-v2`) seen on an Android phone — in the mobile gallery's Galaxy A55 frame (`/mobile`), with `?platform=android`, or on a real Android phone — while keeping the Wael brand (teal/lime/navy, Cairo, Arabic RTL) and the gamified `play` skin underneath. Triggers whenever the user says "Android", "Material", "Material 3", "M3 Expressive", "Material You", "Galaxy", "Samsung", "One UI", "native feel", "the Galaxy frame", "mobile gallery", "platform skin", "on Android it should…", or names a Material piece — navigation bar, top app bar, FAB, ripple, state layer, tonal surface, bottom sheet, drag handle, scrim, button group, switch, search bar, menu, progress indicator, spring, predictive back, status bar, gesture bar, haptics — or touches `src/styles/platform/android.css`, `src/app/platform.ts`, `usePlatform()`, `AndroidNavBar`, `m3-ripple`, the `--m3-*` roles, `--sai-top` / `--sai-bottom`. Use it for every élève-space screen, sheet, menu or control built or restyled for the phone, even a single button. Sibling of `wael-mobile-ios` (the iPhone) and `wael-gamified` (the `play` skin); the brand itself is `wael-design-system-soft`.
---

# Wael Academy — Android skin (Material 3 Expressive on One UI)

What the élève space wears inside a Galaxy. Material 3 Expressive (announced May 2025; on
Pixel since Android 16 QPR1, Sept 2025; carried into Android 17, June 2026, and 17 QPR1,
Sept 2026) made Material springy and tonal — a navigation bar whose selection is a pill,
surfaces that step up in tone instead of casting shadows, 28 dp sheets, physics springs, a
ripple from the touch — and One UI 9 (Android 17; A55 stable from 21 Oct 2026, design
largely as One UI 8.5) shows it on the A55 with a big title that collapses and a status bar
that clears the punch hole. One UI keeps its own components, so the skin is M3E *components*
with One UI *layout* (reachability, the collapsing title). This skill says how to build that
on our brand — teal tint, one lime action, navy ink, Cairo, right-to-left — without turning
the space into a Pixel settings page. It covers every `/student-v2` surface a Galaxy shows;
not the back-office, the site, or the iPhone (`wael-mobile-ios`). The research is
`docs/mobile/android-patterns.md`; this is the operational half.

## Start here, every time

1. **Read, in this order:** `docs/mobile/README.md`; `src/app/platform.ts` (`usePlatform()`,
   `getDevice()`, `data-platform` / `data-skin` / `data-framed`, `--sai-top` / `--sai-bottom`);
   `src/styles/platform/android.css` (the whole skin: `--m3-*` roles, `bg-m3-*` utilities,
   `m3-ripple`, the `[data-platform="android"] [data-space="v2"]` scope, the sheet rules);
   `src/features/student-v2/V2Shell.tsx` (`BottomBar` → `AndroidNavBar`, `data-space="v2"`,
   the platform-sized greeting); `src/app/nav/studentV2.ts` (`studentV2Tabs`);
   `src/features/student-v2/header/SearchBox.tsx`; `src/components/ui/sheet.tsx`
   (`SheetGrabber`, `data-side`); `src/features/student-v2/ui.tsx` (`ctaClass`, `btnClass`,
   `tileClass`, `iconBtnClass`, `Panel`); `src/styles/v2.css` (`--ts`); `src/lib/hooks.ts`
   (`useScrollingDown`); `docs/sound-effects.md` §4.
2. **Look at it.** `npm run dev`, then `http://localhost:5173/mobile` (both phones, screen
   picker, skin, theme) or the Galaxy alone:
   `http://localhost:5173/student-v2?platform=android&insets=36,24`. The platform lives in
   `window.name` and survives in-app navigation — open a fresh tab for the web look;
   `?skin=soft` shows the flat look under the same chrome.
3. **Screenshot at the phone's size:**
   `npm run shot -- "http://localhost:5173/student-v2?platform=android&insets=36,24" 384 832 out.png`
   (CSS px; a 5th argument is a JS expression to print, e.g.
   `"document.querySelector('nav ul').getBoundingClientRect().height"`). The app must hold
   at **384** — narrower than CLAUDE.md's 390; check 412 × 892 too.
4. **Build with the space's tokens** — `text-v2-ink`, `bg-v2-surface`, `bg-v2-cta`,
   `text-v2-brand`, `border-v2-ink/15` — plus the Material roles for chrome:
   `bg-m3-surface-container` (bars), `-low` (sheets, grouped lists), `-high` (search,
   dialogs), `-highest` (filled cards), `bg-m3-secondary-container` (the selected pill),
   `bg-m3-primary`, `border-m3-outline-variant`. Every font size as
   `text-[calc(Npx*var(--ts))]`. Then `npx tsc -b` and `npm run check:sounds`.
5. **Copy from `references/recipes.md`.**

## The system in one paragraph

The Galaxy frame paints One UI's 36 px status band (AOSP's is 24; One UI clears the punch
hole) and the 24 px gesture band, and hands their heights to the app as `--sai-top` /
`--sai-bottom`; the app lays out edge to edge beneath them and never reads `env()` (0
inside an iframe). Chrome is docked and tonal (stock M3E). One UI 8.5+ Samsung apps float a
translucent pill tab bar; we keep the docked M3E bar on purpose — the five fixed destinations
with the lime pill are built and match the brand, the floating glass capsule stays the
iPhone's identity so the two platforms read differently, and One UI's floating bar is
Samsung-app styling, not an Android platform rule. So: a 64 dp navigation bar
on `surface-container` that slides away on scroll-down, a 64 dp app bar a section's
headline collapses into, sheets with a 32 × 4 handle and 28 dp corners over a 32 % scrim.
Depth is tone — four `surface-container` steps tinted with the teal — never a blurred
shadow; every press answers with a ripple and a state layer; shapes come from the scale
(4 menus, 8 chips, 12 cards, 16 lists and tiles, 20 large-increased — the medium FAB, 28
sheets and panels, full for buttons and the pill). Type is the Material scale in Cairo through `--ts: 1.55`. **Teal** is
`primary` — the filled control, the active track, the focus ring; **lime** is the one
selected thing — the prominent CTA and, tinted, the nav pill; red means live, orange means
ended. Spatial springs may overshoot, effects never. Everything mirrors for Arabic except
what depicts the physical world, and every control plays a `uisfx` cue in place of the
haptic Android would give.

## How the skins layer

```
index.css:  tailwind → v2.css (tokens) → skins/play.css (content look, data-skin="play", default)
            → platform/ios.css → platform/android.css (chrome + conventions, data-platform="android") → mobile.css
```

Later wins, and each layer owns a different thing:

- **The Android skin owns chrome and system conventions:** navigation bar, app bar and
  headline, sheets, menus and dialogs, snackbars, system-bar insets, the text scale
  (`--ts: 1.55`), the radii of chrome, state layers and the ripple, motion, haptics → sound.
- **The `play` skin owns how content looks:** card outlines and the pressable lip, the
  chunky lime CTA, progress-as-score (`.v2-bar`, `.v2-ring`), the mascot, celebrations.

Where a research rule touches **content** — "cards 12 dp outlined", "buttons 40 dp filled
primary", "selected chips `secondary-container`" — `play` wins and Android fixes only
radius, size and placement. Where it touches **chrome** the platform wins, whatever the
skin. The lip on a `.v2-tile` is a pressable's edge, not elevation: it stays; blurred card
shadows go.

## How the skin is wired

`installDevice()` runs in `main.tsx` before React and stamps `<html data-platform="android"
data-skin="play" data-framed style="--sai-top:36px;--sai-bottom:24px">`. `V2Shell` puts
`data-space="v2"` on the space's root, so `android.css` scopes to
`[data-platform="android"] [data-space="v2"]` and the back-office never changes. Sheets
and menus portal to `<body>`: their shape, body and scrim come from the document-wide
`[data-slot="sheet-…"]` rules, but `--ts`, the radius overrides and the `play` hooks reach
inside only if the content carries `data-space="v2"` too — stamp it.

The `--m3-*` roles are **derived, not generated**: `primary` = `--v2-brand`;
`secondary-container` = lime at 42 % over the surface (28 % dark), ink as its `on-`
colour; the `surface-container` steps = teal at 3 / 5 / 8 / 12 % over `--v2-surface`;
`outline-variant` = ink at 18 %. Material says secondary is a second hue — the research
proposed an apricot pill — but here orange means « ended », so the selection tint is lime.
No `--m3-tertiary`: that job is `--v2-cta`.

Two tools, one rule each: a **CSS override in `android.css`** when the *same DOM* needs
different numbers (`--ts`, `.rounded-3xl` → 28, `.rounded-2xl` → 16, outline-variant
borders, the sheet rules; a new number for a shared piece goes here too, keyed on a hook
class like `.v2-menu` or a `data-slot` — no component changes); a **`usePlatform()`
branch** when the *DOM differs* (`AndroidNavBar` vs `IosTabBar` vs `WebTabBar`, a
collapsing headline vs the web greeting, a menu + dialog vs an iOS action sheet) — at a
component boundary as `BottomBar` does, never conditionals through JSX or an
`*Android.tsx` page. `useIsMobile()` (viewport < 768) is a different axis: the Galaxy frame
is `android` + mobile; a narrowed desktop browser is `web` + mobile. Keep both.

## The numbers (Galaxy A55, CSS px = dp)

| Thing | Value |
|---|---|
| Screen · insets | 384 × 832 (450 dpi); status **36** (`--sai-top`), gesture **24** (`--sai-bottom`; 48 in 3-button mode, not built); display radius 22 — the frame clips, the app never draws screen corners |
| Navigation bar | `AndroidNavBar`: docked, **64** + `var(--sai-bottom)`, `bg-m3-surface-container`; 24 px Lucide icon, stroke 2 → 2.4 active; label 12 sp / 500, always visible, never bold; active pill **56 × 32** `bg-m3-secondary-container`; `m3-ripple`; off after 24 px of downward scroll (`useScrollingDown`), back on any upward scroll, 250 ms, never under reduced motion |
| Top app bar | **64**; nav icon at the start (back chevron pointing right), ≤ 2 actions at the end in `text-v2-ink/70`; `surface` → `surface-container` once content scrolls under; section roots open with a 28 sp headline collapsing into it over 56 px |
| Margins · targets | 16 (`px-4`), 8 px rhythm; targets ≥ **48 × 48** (CLAUDE.md's 44 is the floor); icon buttons 40 visual in 48, chips 32 in 48 |
| Shape | 4 menus (baseline), snackbar · 8 chips, inner corners · 12 passive cards (`rounded-xl`) · 16 grouped lists, tiles, FAB (`rounded-2xl`) · 20 large-increased: medium FAB (`rounded-[20px]`) · 28 sheets, panels, dialogs (`rounded-3xl`) · full buttons, pill, search. Menus: the baseline 4 dp menu, one style app-wide; the Expressive vertical menu (rounded, `surface-container-low`, selection tint, gaps instead of dividers) is an allowed future change, not the current rule |
| Lists | rows **56 / 72 / 88**, 16 px side padding, icon 24 or avatar 40, chevron pointing left; grouped: 16 outer radius, 2 px gaps |
| Controls | buttons 40, the one prominent **56**; button group 40, 2 px gaps; search **56** `surface-container-high`; switch **52 × 32** (thumb 16 / 24 / 28 pressed); text field 56; player slider track 16 |
| Sheets | top 28, `surface-container-low`, handle 32 × 4 in a 48 hit area, 32 % scrim, max height 90 % |
| State layers | hover 8 %, focus 10 %, pressed 10 %, dragged 16 % of the content colour, one at a time; disabled 38 % / container 12 %; `m3-ripple` 12 %, 320 ms |
| Springs (expressive) | fast spatial 0.6 / 800 → **250 ms**, +9 % (switches, chips, pill) · default 0.8 / 380 → **350 ms** (sheets, menus) · slow 0.8 / 200 → **450 ms** (screen moves) · effects 1.0 / 3800 · 1600 · 800 → 150 / 200 / 250 ms, no overshoot (colour, opacity; keep ≤ 150); nothing over 600 ms |
| Contrast | 4.5 : 1 under 18 sp (14 bold), 3 : 1 above; icons 3 : 1 against the bar; lime never carries text |

## Type scale → our idiom

Under the Android skin `--ts` is 1.55 (1.5 on the web), so N = sp ÷ 1.55. Material says
Roboto and Noto Naskh; a brand typeface is allowed and Cairo is ours — the only family.
Sizes in the class, boxes in px (sp vs dp).

| M3 style | sp / weight | Class |
|---|---|---|
| Display small (the countdown only) | 36 / 400 | `text-[calc(23.2px*var(--ts))]` |
| Headline medium · small | 28 · 24 / 400 (600 emphasized) | `18px` · `15.5px` |
| Title large · medium · small | 22 · 16 · 14 / 400 · 500 · 500 | `14.2px` · `10.3px` · `9px` |
| Body large · medium · small | 16 · 14 · 12 / 400 | `10.3px` · `9px` · `7.75px` |
| Label large · medium · small | 14 · 12 · 11 / 500 | `9px` · `7.75px` · `7.1px` — nothing below 7.1 |
| Any input | ≥ 16 | `text-[max(16px,calc(10.3px*var(--ts)))]` |

Emphasized = Cairo 600 / 700 (the `play` CTA's 800 is the skin's); never light;
`letter-spacing: 0`; leading never below 1.4 — the root's 1.6 for body, `leading-[1.4]` at
the tightest for headlines (Material's 1.29 clips Cairo's marks); Western digits with
`tabular-nums` for clocks.

## Non-negotiables (each checkable at 384 × 832)

1. **Insets from `--sai-top` / `--sai-bottom`, never `env()`** — `pt-safe` / `pb-safe`,
   `pt-[max(1rem,var(--sai-top))]`; nothing painted in the status band; the last row
   clears the nav bar (`var(--sai-bottom) + 64 + 16`).
2. **Exactly five destinations** (`studentV2Tabs`), from the right: الرئيسية · الدروس ·
   الرزنامة · تسجيلات · مجموعاتي — the same as iOS. No sixth, no profile tab (العروض is in
   the avatar menu, where every `blocked` lock leads); never hide or disable one.
3. **The bar is `AndroidNavBar`** — extend, never fork: label 12 sp / 500, never bold; the
   lime-tinted pill carries the selection, never apricot; hides on scroll-down only, never
   under reduced motion.
4. **Tone, not shadow**: `bg-m3-surface-container-*` steps; no blurred `shadow-*` on cards,
   lists or panels — the `play` lip is the only hard edge, on tappables only; menus and
   sheets float (`shadow-v2-lift`).
5. **A state layer on every tappable**: `m3-ripple`, `hover:bg-v2-ink/[0.08]`, a 3 px teal
   `focus-visible:` ring, `active:` 10 %; disabled `opacity-[.38]`, never a greyed colour.
6. **Corners only from the scale** (4 / 8 / 12 / 16 / 20 / 28 / full — 20 is M3E's
   large-increased, the medium FAB); `rounded-3xl` / `rounded-2xl` already map; no hand-set
   `rounded-[24px]`.
7. **Section roots open with a 28 sp headline** collapsing into the 64 dp bar; pushed
   screens use the bar alone — back chevron pointing right (`data-uisfx="back"`), ≤ 2
   trailing actions; `surface` until content scrolls under, then `surface-container`;
   never a border or a blur.
8. **Search is the 56 dp `surface-container-high` pill**, magnifier leading (`SearchBox`);
   no search tab, no full-screen search view (not built — verify).
9. **Lists are 56 / 72 / 88 rows**, 16 px padding; grouped lists `rounded-2xl` with 2 px
   gaps; a left-pointing chevron only where a row navigates; selected row
   `bg-m3-secondary-container`.
10. **One prominent action per screen** — the lime `ctaClass` at 56 px (filled teal is not
    a button colour here); secondary = outlined `btnClass` (40), tertiary = teal text,
    destructive = red text; icon-only buttons 48 px (`cn(iconBtnClass, "size-12")`) with a
    derja `aria-label`.
11. **Filters over one dataset are a connected button group** (40, 2 px gaps, inner
    corners 8); the selected member is solid lime (`play`), not `secondary-container`, and
    morphs to a pill; exactly one per group.
12. **Switches only inside list rows** (52 × 32, teal on, outlined off); elsewhere a toggle
    button with `aria-pressed`.
13. **Sheets**: `SheetGrabber` in a 48 dp hit area, `max-h-[90dvh]`, `data-space="v2"` on
    the content, closable by scrim and Esc; no Cancel / Done header (that is iOS) — a
    button row at the bottom; one at a time; back should close it before navigating (not
    wired — verify).
14. **Destructive choices confirm in a dialog** (28 dp, `surface-container-high`, text
    actions, destructive last and red), not an action sheet. Overflow actions sit behind a
    visible 48 px "⋮" (`EllipsisVertical`) opening a menu with 48 dp rows — the baseline
    4 dp menu, one style app-wide (the Expressive vertical menu is an allowed future change,
    never mixed with the baseline); long-press
    may open the same menu, never alone; no hover-only, swipe-only or long-press-only
    actions.
15. **Progress**: activity (download, buffering) = the 4 dp teal linear indicator with gap
    and stop dot; score (files taken, chapitres done) = the `play` bar. Nothing spins
    under 200 ms; 0.2–5 s shows activity inside the control, never a page spinner.
16. **The player is full-screen**, `dir="ltr"` on its control bar: transport never
    mirrors, seek bar left → right, Western digits, controls fade after 3 s.
17. **One FAB at most** (56, `rounded-2xl`, lime), bottom-left in RTL, above the nav bar;
    ≥ 2 actions → a FAB menu. None is built — add one only for a true creation action.
18. **Motion is springs** (the table; `linear()` easings in `references/recipes.md` §14):
    spatial may overshoot, effects never; nothing over 600 ms; reduced motion → effects
    curves or none; nothing animates on load. **Every control plays its cue** (below);
    sound is never the only feedback; `npm run check:sounds` passes; contrast holds light
    and dark — dark lifts surfaces, it doesn't invert the brand.

## Landscape (compact height)

Where it applies: the landscape game app **`/mobilegame`** (`src/features/mobilegame/`; the
per-platform control sizes live in `platformUi.ts`, the landscape insets in
`MobileGameLayout.tsx`). `/student-v2` stays portrait. A phone on its side is **compact
height (< 480 dp)** — 99.78 % of phones in landscape; lay out by window size class, not
orientation, and never two panes.

- **No headline collapse** — the 64 dp bar only, or none in a game (Google's sample hides the
  top app bar below medium height).
- **Navigation bar** may stay (`NavigationSuiteScaffold` keeps a bar while width or height is
  compact), but a **game screen runs immersive** (`BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE`):
  no status bar, the cutout inset on the cutout edge (36), the gesture inset 24 at the bottom.
  `MobileGameLayout.tsx`'s Android insets assume immersive mode; a non-immersive app keeps the
  status bar across the top (24–36 dp). In desktop windowing the insets include the caption bar.
- **Android 17 orientation override:** apps targeting API 37 have `screenOrientation`,
  resizability and aspect-ratio limits ignored on displays with smallest width > 600 dp
  (tablets, foldables), unless the app declares **`android:appCategory="game"`** (or the user
  opts in). Phones such as the A55 are unaffected. Relevant if `/mobilegame` is ever wrapped
  (Capacitor).
- **Targets ≥ 48 dp**; text ≥ 11 sp. A primary and a secondary in one row share a height
  (`platformUi.ts`: both 56). Material has no games spec, so borrow Apple's: frequent
  controls near the thumbs, menus at the top, a visible press state (the `play` lip + the
  ripple + the `uisfx` cue). Samsung's Game Booster overlays a panel from a screen edge — keep
  one edge free of critical controls (inference).

## RTL (Arabic) — what mirrors, what doesn't

| Mirror | Keep |
|---|---|
| Layout order; the app bar (nav icon start, actions end); back (chevron points **right**); forward / send | Logos, photos, illustrations, the mascot |
| Linear progress and sliders fill right → left (not in the player); pagination, carousels, the week's days | Clocks, circular progress, the checkmark, the magnifying glass, pencils and tools |
| Switch travel (logical `start-*` does it); chip trailing icons; badge corner (upper-left); the FAB (bottom-left); list chevrons (point left); icons depicting motion or reading direction | Digits inside a number (541, phones, URLs); the slash in a glyph; media transport (play / next / ±10 s); the help `?` |

Western digits (Tunisia); `unicode-bidi: isolate` (the `.num` utility or `<bdi>`) around
numbers and Latin tokens; logical utilities only — `ps-`/`pe-`, `ms-`/`me-`, `start-`/`end-`.

## Haptics → `uisfx` cues

No vibration on the web: each `HapticFeedbackConstants` pattern maps to one cue from
`docs/sound-effects.md` §4 — `data-uisfx="<cue>"` on the clickable element, `sfx("<cue>")`
for outcomes that are not clicks, never both for one click.

| Android haptic (meaning) | Cue |
|---|---|
| `VIRTUAL_KEY` · `KEYBOARD_TAP` (a tap on a control) | `press` / `select` |
| `CONTEXT_CLICK` · `LONG_PRESS` (a menu opens) | `open` (`close` on dismiss) |
| `CONFIRM` / `REJECT` | `success` (`achievement` for rare milestones) / `error` (`blocked` when a lock is the cause) |
| `TOGGLE_ON` / `TOGGLE_OFF` | `toggle-on` / `toggle-off` |
| `SEGMENT_TICK` · `SEGMENT_FREQUENT_TICK` · `CLOCK_TICK` (stepping a value) | `select` (day chips, pickers) · `seek` (the scrubber) — throttled ≥ 80 ms |
| `GESTURE_THRESHOLD_ACTIVATE` / `_DEACTIVATE` (a pull or swipe crosses the line / backs out) | `snap` / `cancel` |
| `DRAG_START` → the drop | `drag-start` → `drop` (`reorder` for a list) |
| `GESTURE_START` / `GESTURE_END` · `NO_HAPTICS` | silent |

## Before calling an Android surface done

- [ ] Viewed in the Galaxy frame at 384 × 832 and 412 × 892; both bands clear; no `env()`.
- [ ] Five destinations; pill lime-tinted; label 12 sp / 500; bar slides off on scroll-down, back on scroll-up, never under reduced motion.
- [ ] Headline collapses into the 64 dp bar; back chevron points right; bar turns `surface-container` under content.
- [ ] Tone not shadow; borders outline-variant; corners only 4 / 8 / 12 / 16 / 28 / full; ripple + state layer on every tappable; 48 px targets.
- [ ] One 56 px lime action; secondary outlined; text buttons teal; disabled at 38 %; icon buttons labelled in derja.
- [ ] Sheets 28 dp, handle in 48, 90 % max, 32 % scrim, `data-space="v2"` on the content; menus 4 dp / 48 dp rows behind a visible ⋮.
- [ ] Springs from the table; effects ≤ 150 ms; nothing over 600 ms; reduced motion checked.
- [ ] Inputs ≥ 16 px; contrast light and dark; Western digits; player LTR.
- [ ] Landscape (`/mobilegame`): checked at 832 × 384; no headline collapse; immersive (no status bar), cutout edge and gesture inset clear; 48 dp targets; a row's buttons share a height; one edge free of critical controls.
- [ ] Every control has its cue; `npm run check:sounds` and `npx tsc -b` pass; one line stating the screen's main UX decision (CLAUDE.md).

## Known code drift (as of 2026-11-15)

The rules above were updated from `docs/mobile/pattern-audit-2026-11.md`; this `/student-v2`
code does not match them yet. Fix it there, then strike the line.

- **Menus** (`header/ProfileMenu.tsx`, `header/NotificationsMenu.tsx`,
  `dashboard/CalendarPanel.tsx`): `rounded-3xl` with a border and `shadow-xl` on
  `bg-v2-surface`, portalled without `data-space="v2"` — so they render at Tailwind's 24 px,
  neither the baseline 4 dp on `surface-container` nor the Expressive vertical menu. No
  `.v2-menu` hook class exists and `android.css` has no menu rule yet (recipe 10's CSS is the
  target).
- **Comments** still describe the old bar: `android.css`'s header ("an 80 dp navigation bar
  whose selected destination sits in a 64 × 32 pill; 40 dp pill buttons", "Android 16, 2025")
  and `BottomBar`'s doc comment in `V2Shell.tsx` ("80 dp … 64 × 32 pill"). The code itself is
  64 dp with a 56 × 32 pill.
- **Sheets**: back does not close an open sheet before navigating (predictive back not wired).
- **Shape 20**: no medium FAB exists, so the new step is unused — nothing to fix until one is built.
- `AndroidNavBar` itself matches (docked, 64 dp, lime pill, hides on scroll-down, not under
  reduced motion) — the docked bar is the decision, not drift.

## Go deeper

`references/recipes.md` — fourteen copy-adaptable recipes. `docs/mobile/android-patterns.md`
— what Google and Samsung say (cited) and the 30 rules this skill adjusts (rule 1: roles
derived, not generated; rules 6–7: five fixed destinations, no profile tab, a lime pill).
`docs/mobile/device-specs.md` §2 — the A55 in numbers. `wael-mobile-ios` — the sibling;
where the platforms differ: glass capsule vs docked tonal bar; 34 pt large title vs 28 sp
headline; sheets 38 with Cancel / Done vs 28 with a button row; action sheet vs dialog;
segmented control vs connected button group; `--ts` 1.6 vs 1.55.
