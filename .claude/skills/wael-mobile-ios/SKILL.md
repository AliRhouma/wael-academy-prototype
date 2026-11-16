---
name: wael-mobile-ios
description: Apply iOS conventions (the iOS 26/27 Liquid Glass era, Apple's HIG) to ANY surface of the Wael Academy élève space (`/student-v2`) that will be seen on an iPhone — in the mobile gallery's iPhone 13 Pro Max frame (`/mobile`), with `?platform=ios`, or on a real iPhone — while keeping the Wael brand (teal/lime/navy, Cairo, Arabic RTL) and the gamified `play` skin underneath. Triggers whenever the user says "iOS", "iPhone", "Apple style", "HIG", "Liquid Glass", "native feel", "the iPhone frame", "mobile gallery", "platform skin", "on iOS it should…", or names an iOS piece — tab bar, large title, navigation bar, bottom sheet, detents, grabber, action sheet, context menu, segmented control, switch, safe area, notch, home indicator, status bar, haptics — or touches `src/styles/platform/ios.css`, `src/app/platform.ts`, `usePlatform()`, `IosTabBar`, `--sai-top` / `--sai-bottom`. Use it for every élève-space screen, sheet, menu or control built or restyled for the phone, even a single button, so the whole space reads as one native app. Sibling of `wael-mobile-android` (the Galaxy) and `wael-gamified` (the `play` skin); the brand itself is `wael-design-system-soft`.
---

# Wael Academy — iOS skin (Liquid Glass era)

What the élève space wears inside an iPhone. iOS 26 made the chrome float — a glass tab-bar
capsule, bars that content scrolls under, partial-height sheets inset on glass with a
grabber, concentric radii, 17 pt body — and iOS 27 (14 Sep 2026) kept it with sturdier glass
— darker edges, brighter highlights, better diffusion, a user slider from ultra clear to
fully tinted, and a uniform top-bar background when content scrolls under floating bars; the
compatibility opt-out is ignored for apps linked against the iOS 27 SDK. This skill says how
to build that on our brand — teal tint, one lime action, navy ink, Cairo, right-to-left —
without a grey Apple clone. Scope: every `/student-v2` surface an iPhone shows; not the
back-office, the site, or the Galaxy (`wael-mobile-android`). Research and sources:
`docs/mobile/ios-patterns.md`; this is the operational half.

## Start here, every time

1. **Read, in this order:** `docs/mobile/README.md` · `src/app/platform.ts` (`usePlatform()`,
   `getDevice()`, `data-platform` / `data-skin` / `data-framed`, `--sai-top` / `--sai-bottom`) ·
   `src/styles/platform/ios.css` (the whole skin today: `ios-glass`, `ios-hairline`, the
   `[data-platform="ios"] [data-space="v2"]` scope, radius overrides, sheet grabber) ·
   `src/features/student-v2/V2Shell.tsx` (`BottomBar` → `IosTabBar`, `data-space="v2"`) ·
   `src/app/nav/studentV2.ts` (`studentV2Tabs`) · `src/components/ui/sheet.tsx` (`SheetGrabber`,
   `data-side`) · `src/features/student-v2/ui.tsx` (`ctaClass`, `iconBtnClass`, `Panel`) ·
   `src/styles/v2.css` (tokens) · `docs/sound-effects.md` §4.
2. **Look at it.** `npm run dev`, then `http://localhost:5173/mobile` (both phones, screen
   picker, theme) or one phone full-window:
   `http://localhost:5173/student-v2?platform=ios&insets=47,34` — the platform persists in
   `window.name` across in-app navigation (a fresh tab = the web look). `?skin=soft` = the flat
   Figma look.
3. **Screenshot at the phone's size:**
   `npm run shot -- "http://localhost:5173/student-v2?platform=ios&insets=47,34" 428 926 out.png`
   (CSS px; a 5th argument is a JS expression to measure, e.g.
   `"document.querySelector('nav ul').getBoundingClientRect().height"`). Check 390 × 844 too.
4. **Build with the space's tokens** — `text-v2-ink`, `bg-v2-surface`, `bg-v2-cta`,
   `text-v2-brand`, `border-v2-ink/15` — every font size as `text-[calc(Npx*var(--ts))]`.
   Then `npx tsc -b` and `npm run check:sounds`.
5. **Copy from `references/recipes.md`**, written in this codebase's idiom.

## The system in one paragraph

The frame paints the 47 px status band and the 34 px home-indicator band and hands their
heights to the app as `--sai-top` / `--sai-bottom`; the app lays out edge to edge and keeps
clear of them, never reading `env()` (0 inside an iframe). Chrome floats: a 64 px glass tab-bar
capsule above the home indicator, headers whose large title collapses to a 44 px bar over
Apple's automatic scroll-edge effect, partial-height sheets inset from the screen edges on
glass (opaque and edge-attached at the large detent). Content is opaque, inset and concentric — a 22 px
panel inside a 38 px sheet, 14 px cards inside the panel — separated by hairlines, never glass.
Type is Dynamic Type Large in Cairo (17 body, 34 large title, 11 floor). **Teal** is the tint
(selected tab, links, meaningful icons); **lime** is the one prominent action per screen; red
and orange mean status. Everything mirrors for Arabic except what depicts the physical world
(clocks, play, the magnifying glass). Every control answers with a `uisfx` cue standing in for
the haptic iOS would play.

## How the skins layer

```
index.css:  tailwind → v2.css (tokens) → skins/play.css (content look, data-skin="play", default)
            → platform/ios.css (chrome + conventions, data-platform="ios") → platform/android.css → mobile.css
```

Later wins, and each layer owns a different thing:

- **The iOS skin owns chrome and system conventions:** tab bar, headers and large title, sheets
  (grabber, detents, 38 px top), alerts / action sheets / context menus, the insets (`--sai-*`),
  the text scale (`--ts: 1.6`), the radii of chrome, motion timing, haptics → sound.
- **The `play` skin owns how content looks:** card borders and outlines, the chunky pressable
  CTA, progress visuals, the mascot (Wael's eyes), celebration moments.

Where a research rule touches **content** — rule 11's "drop the border on cream", rule 14's
gradient capsule — `play` wins and the iOS skin fixes only radius, size and placement (22 px
panel, 50 px CTA, one prominent action, capsule shape). Where it touches **chrome** — tab bar,
sheets, headers, system bars — the platform wins, whatever the skin.

## How the skin is wired

`installDevice()` (`main.tsx`, before React) stamps `<html data-platform="ios" data-skin="play"
data-framed style="--sai-top:47px;--sai-bottom:34px">`; `V2Shell` adds `data-space="v2"`, so
`ios.css` scopes to `[data-platform="ios"] [data-space="v2"]` and nothing outside the space
moves. Sheets and menus portal to `<body>`, hence `[data-platform="ios"] [data-slot="sheet-content"]`.

- **CSS override in `ios.css`** when the *same DOM* needs different numbers: radii
  (`.rounded-3xl` → 22, `.rounded-2xl` → 14, `.rounded-t-3xl` → 38), hairlines, `--ts`, the
  grabber, the glass material. No component changes; `play` and `soft` stay intact.
- **`usePlatform()` branch** when the *DOM differs*: `IosTabBar` vs `AndroidNavBar` vs
  `WebTabBar`, a large-title header vs the web greeting, an action sheet vs a dropdown. Branch
  at a component boundary as `BottomBar` does — no conditionals sprinkled through JSX, no
  `*Ios.tsx` page. The value is constant for the document.

`useIsMobile()` (viewport < 768) and `usePlatform()` (conventions) are different axes: a
narrowed desktop browser is `web` + mobile, the iPhone frame is `ios` + mobile. Keep both.

## The numbers (iPhone 13 Pro Max, CSS px = pt)

| Thing | Value |
|---|---|
| Screen · insets | 428 × 926; status 47 (`--sai-top`), home indicator 34 (`--sai-bottom`), sides 0; display radius 53 (the frame clips; the app draws no screen corners) |
| Tab bar | Capsule ≈**64** tall (no Apple number — measure in the iOS 27 kit), ≈**21** pt from the left, right and bottom screen edges (kit measurement, inside the home-indicator box — measure in the iOS 27 kit); five 44 × 44 tabs, icon 26 (stroke 1.75 → 2.25 selected), label 11 regular (medium when selected); selected `bg-v2-brand/[0.12] text-v2-brand-text`, unselected `text-v2-ink-2`; labels **always shown — no minimize on scroll** (Apple keeps that for bars with an accessory, and it left the tabs unnamed: `docs/mobile/apple-design-audit.md` C5) |
| Back | Any screen that is not one of the five tabs: the phone header's leading corner is `PhoneBack` (V2Shell) — 44 pt, `ChevronRight` (points right in RTL), `text-v2-brand-text`, named for the parent; never a back link inside the page body (it scrolls away) |
| Text colours | Secondary `text-v2-ink-2` (5.5 : 1), tertiary/placeholder `text-v2-ink-3` (≥ 13 pt), teal as text or meaningful icon `text-v2-brand-text`, red as text `text-v2-live-strong`. Never `text-v2-ink/45…65` (2.5–3.9 : 1); `/40` only for disabled. Never white on lime or on `bg-v2-grad` — lime fill takes `text-v2-on-cta` |
| Nav bar | 44 collapsed; large-title bar 96 (classic UIKit — verify in the iOS 27 kit); title ≤ 15 characters; one tinted trailing action |
| Margins · targets | content margin 16 (our `px-4`; Apple's default at this width is 20); hit targets ≥ 44 × 44, floor 28, ~12 px between neighbours |
| Radii | sheet top 38 → panel 22 → inner card 14 (concentric: minus the padding); context menu ≈ 22–26 (glass — measure in the iOS 27 kit); capsules `rounded-full`; list rows ≥ 52 with 0.5 px hairlines |
| Controls | CTA 50 tall; search 36 capsule; form input 44 tall, radius 12, text ≥ 16 px; segmented 32 track in a 44 hit; switch 51 × 31, thumb 27; badge 16–18 capsule, 13 semibold |
| Sheets | grabber 36 × 5 at 8 from the top; detents medium ≈ 50 %, large `100% − var(--sai-top) − 10px`; dim 40 %. Medium/custom detents: inset ~8–10 px from the sides and bottom, corners following the 53 px display radius, `ios-glass` body; large detent: full width, opaque `bg-v2-surface`, 38 top corners (unverified — measure in the iOS 27 kit) |
| Glass (`ios-glass`) — **our default is CLEAR** | Product decision 2026-11-15 (demo column (c)): almost no fill (`--glass-alpha` 0 % by default), top sheen, `blur(2.5px) saturate(160%) brightness(1.12)`; a 1.5 px directional specular rim (`::after`, bright top-left / bottom-right, does not mirror in RTL) over a darkened edge; shadow `0 8px 22px -8px`; press = inner glow + `scale 1.06`, **never fade the opacity**. Apple keeps clear glass for media, so we compensate: a bar or control that must stay legible over busy or dark content adds a touch of fill with `[--glass-alpha:15%]` (raise only as needed); over media add a `bg-black/25`–`/35` dim under it and white glyphs. Fallbacks in the utility: 92 % opaque without `backdrop-filter`, 94 % under `prefers-reduced-transparency` (Chromium only — Safari lacks the query), opaque + 1.5 px ink border under `prefers-contrast: more` (works in Safari), no press scale under reduced motion. The thicker "regular" recipe (36 % fill, blur 10) is documented in `docs/mobile/glass-research.md` §5.2 if a surface ever needs it. Demo: `docs/mobile/glass-demo.html` |
| `ios-glass-clear` | The same clear material under an explicit name, for controls over media (`VideoStage`'s prev / next circles on iOS), always with the dim and white glyphs |
| Refraction | Edge lensing (SVG `feDisplacementMap` in `backdrop-filter`) renders **only in Chromium** — every iPhone browser is WebKit, so it is not part of the shipped skin. A flat light background makes any glass read as a pearl (Apple's too): the rim, edge and shadow carry it; give a showcase control something behind it |
| Motion | `cubic-bezier(.2,.8,.2,1)`; press 150 (scale .97, 80 % opacity), state 250, push 350, sheet 400–450; reduced motion → fades |
| Contrast | 4.5:1 up to 17 px; 3:1 from 18 px or bold; dark mode aims at 7:1 on small text |

## Type scale → our idiom

Under the iOS skin `--ts` is 1.6 (1.5 on the web), so N = pt ÷ 1.6; the same class renders
~6 % smaller on desktop, by design.

| iOS style | pt / leading | N → `text-[calc(Npx*var(--ts))]` |
|---|---|---|
| Large Title | 34 / 41 | `text-[calc(21.25px*var(--ts))] font-bold leading-tight` |
| Title 1 · 2 · 3 | 28 · 22 · 20 | `17.5px` · `13.75px` · `12.5px`, bold / semibold |
| Headline / Body | 17 / 22 | `text-[calc(10.6px*var(--ts))]` (semibold for Headline) |
| Callout · Subhead | 16 · 15 | `10px` · `9.4px` |
| Footnote · Caption 1 · 2 | 13 · 12 · 11 | `8.1px` · `7.5px` · `6.9px` — nothing below 6.9 |
| Any input | ≥ 16 | `text-[max(16px,calc(10px*var(--ts)))]` — Safari zooms below 16 |

Cairo stays the only family; weights 400–700, never light; `letter-spacing: 0`; Arabic body
line-height 1.35–1.45; Western digits with `tabular-nums` for countdowns and clocks.

## Non-negotiables (each checkable at 428 × 926)

1. **Insets come from `--sai-top` / `--sai-bottom`, never `env()`** — `pt-safe` / `pb-safe`,
   `pt-[max(1rem,var(--sai-top))]`, `pb-[max(1.25rem,var(--sai-bottom))]`.
2. **Nothing is drawn in the status band** (the frame paints it). Content scrolls under the
   bars; the last row clears the tab bar (`padding-bottom ≥` the bar's bottom offset + 64 +
   a margin — today's code: `var(--sai-bottom) + 8 + 64`).
3. **Exactly five tabs** (`studentV2Tabs`), single-word labels. No sixth tab, no "More":
   العروض lives in the avatar menu and is where every `blocked` lock state leads. Never hide
   or disable a tab — show an empty state.
4. **The tab bar is `IosTabBar`** — extend it, never fork it; its spec is in the table above.
5. **Chrome is the platform's, content is the skin's.** Never restyle cards, CTAs, progress or
   the mascot in `ios.css`; never restyle the tab bar, sheets, headers or system bars in `play.css`.
6. **Glass only on chrome** — tab bar, collapsed header band, player controls, a sheet's bar,
   44 px icon circles. Never on cards, lists or the page. Partial-height sheets, menus and
   popovers are glass in iOS 26+ (regular variant, opaque text rows inside); never glass on
   glass; small text on glass needs enough contrast behind it (add `[--glass-alpha:15%]` or more).
   `ios-glass` (our default, the CLEAR material) and `ios-glass-clear` (its alias over media, with a
   dim and white glyphs) are the definitions, in `ios.css`; their `@supports`,
   reduced-transparency, increased-contrast and reduced-motion fallbacks live there, not in
   components. The glass owns its press (glow + swell): no `active:opacity-*` on a glass control.
7. **Headers:** a tab-root screen opens with a large title collapsing to a 44 px bar (17 px
   semibold centred title). The scroll-edge effect is Apple's *automatic* style — opaque
   enough behind the collapsed title (text outside glass controls); a soft fade only where
   nothing but glass buttons sits in the bar; no border. A pushed
   screen uses the collapsed bar only: back on the leading (right) edge, chevron **pointing
   right**, `data-uisfx="back"`, at most one tinted trailing action.
8. **Search is inline under the large title** (الدروس, تسجيلات): 36 px capsule, clear button
   trailing, results filter as you type — not a search tab.
9. **Lists are inset-grouped**: 22 px panel, rows ≥ 52 px, hairlines starting at the text,
   sentence-case 13 px headers, chevrons only on rows that navigate. The panel's border is
   `play`'s decision.
10. **One prominent CTA per screen**: a 50 px capsule on `ctaClass`. Secondary = navy 8 % fill,
    tertiary = plain teal text, destructive = red. Icon-only buttons: 44 px circles, `aria-label`.
11. **Teal is the tint**: selected tab, links, meaningful icons. Toolbar symbols stay
    monochrome; never tint more than one control per view.
12. **Segmented controls** switch views of one dataset: ≤ 5 equal text segments, white
    indicator on a navy 6 % track (filter chips with counts keep the `play` look).
    **Switches only inside list rows** (51 × 31, teal when on); elsewhere a toggle button
    with `aria-pressed`.
13. **Sheets**: grabber + medium/large detents, "سكّر" leading, "تم" trailing, one at a time,
    closable by overlay and Esc — a drag gesture is a bonus, never the only way out.
14. **Destructive choices go through an action sheet.** Started from a control, it is anchored
    over that control (iOS 26: no Cancel row; tapping outside cancels); started from a sheet or
    with no anchor, it is the bottom action sheet (red row first, separate "إلغاء" capsule).
    Alerts only for unexpected problems, two side-by-side buttons, default trailing.
15. **Context menus**: glass container, ≈ 22–26 px radius (measure in the iOS 27 kit), 44 px rows with icons, ≤ 3 groups, destructive last,
    unavailable items hidden not dimmed, every item also reachable from a visible "…". No
    hover-only, long-press-only or swipe-only actions (CLAUDE.md).
16. **The player is full-screen**: no tab bar; transport icons never mirror; the scrubber fills
    right → left; controls on clear glass over a 35 % dim, auto-hidden after 3 s.
17. **Inputs ≥ 16 px**, `inputMode` set, label above plus placeholder; `100dvh` for full-height
    layouts (`overscroll-behavior` is already on the root in `ios.css`). **Motion is brief and
    cancellable**: the timings above, `prefers-reduced-motion` → fades, nothing animates on load.
18. **Every control plays its cue** (table below); sound is never the only feedback. Contrast
    holds at 4.5:1 / 3:1 in both themes; dark mode lifts surfaces, it doesn't invert the brand.

## Landscape (compact height)

Where it applies: the landscape game app **`/mobilegame`** (`src/features/mobilegame/`; the
per-platform control sizes live in `platformUi.ts`, the landscape insets in
`MobileGameLayout.tsx`). `/student-v2` stays portrait. Lay out by size class, not by
orientation (HIG Layout): a phone on its side is *compact height*, and even a landscape-only
game must resize well.

- **No large title** in compact height — the standard 44 px bar, or none in a full-screen game.
- **Tab bar** (if one shows): icon and label side by side, not stacked.
- **Insets** on the 13 Pro Max: 47 / 47 on both long edges, 21 for the home indicator
  (`--gs-left` / `--gs-right` / `--gs-bottom`). Controls stay clear of the home indicator and
  of the notch side (HIG Game controls: off the Home indicator and the Dynamic Island).
- **iPhone Duo-style layouts**: bars move to the side (vertical axis) — Back / Close at the
  top, then the prominent action under it; fill the screen as the pose changes, change aspect
  ratio rather than letterbox, no fixed widths.
- **Games (HIG Designing for games · Game controls):** text ≥ **11 pt** (default 17);
  frequent controls ≥ **44 pt** near the thumbs, secondary controls such as menus ≥ **28 pt**
  **at the top**; full-screen, distraction-free; hide controls that aren't available now.
- **A visible press state** the player sees even under the finger, with sound — the `play`
  lip plus the `uisfx` cue already do it.
- **Rows stay short:** a 50 px CTA and a 64 px bar eat a third of a 428 px-tall screen. A
  primary and a secondary in one row share a height (both 50, or both 44 in a compact row).

## RTL (Arabic) — what mirrors, what doesn't

| Mirror | Keep |
|---|---|
| Layout order, the nav bar, back (chevron points **right**), next/previous | Logos, photos, illustrations, the mascot |
| Progress bars and sliders fill right → left; counting direction, pagination dots, carousels, the calendar's flow of days | Clocks, the checkmark, the magnifying glass, pencils and tools |
| Toggles and segmented controls; badge position (top-trailing = top-left); ordered lists | Digits inside a number (541, phone numbers); the slash in a glyph |
| Icons depicting motion or reading direction (speaker waves, text alignment) | Playback transport — play / next / previous stay unmirrored |

Paragraphs of 3+ lines align by their language, shorter text follows the interface; one
alignment per list; Western digits (Tunisia); the pop gesture starts at the **right** edge.
Logical utilities only (`ps-`/`pe-`, `ms-`/`me-`, `start-`/`end-`), `rtl:-translate-x-*` when
a transform must flip.

## Haptics → `uisfx` cues

No haptics on the web: each Apple pattern maps to one cue from `docs/sound-effects.md` §4 —
`data-uisfx="<cue>"` on the clickable element, `sfx("<cue>")` for non-click outcomes, never both.

| Apple pattern (meaning) | Cue |
|---|---|
| Notification · success (task completed) | `success` (`achievement` for rare milestones) |
| Notification · warning | `warning` |
| Notification · error | `error` (`blocked` when a lock is the cause) |
| Impact · light (small object) | `press` / `select` |
| Impact · medium | `open` / `close` |
| Impact · heavy | `drop` / `delete` |
| Impact · rigid | `snap` / `lock` |
| Impact · soft | `swipe` / `focus` |
| Selection (a value is changing) | `select` (pickers, day chips) · `toggle-on` / `toggle-off` (switches, segments) |

## Before calling an iOS surface done

- [ ] Viewed in the iPhone frame at 428 × 926 and at 390 × 844; both bands clear; no `env()`.
- [ ] Five tabs with labels always visible, selected one teal-filled; pushed screens show `PhoneBack`.
- [ ] Every text/background pair ≥ 4.5 : 1 (secondary is `text-v2-ink-2`, never a faded ink); every control ≥ 44 pt.
- [ ] Re-audit with the `apple-design` skill after a big change; record the result in `docs/mobile/apple-design-audit.md`.
- [ ] Large title → 44 px bar; back chevron points right; one trailing action.
- [ ] Lists inset-grouped, inset hairlines, rows ≥ 52, chevrons only where rows navigate.
- [ ] One 50 px CTA; targets ≥ 44 with ~12 px between; icon buttons labelled.
- [ ] Sheets: grabber + detents + سكّر/تم; medium detent inset on glass, large detent opaque and edge-attached; destructive flows use an action sheet (anchored over its control when started from one).
- [ ] Glass only on chrome, partial-height sheets, menus and popovers; reduced-transparency / reduced-motion fallbacks checked.
- [ ] Landscape (`/mobilegame`): checked at 926 × 428; no large title; controls clear of the home indicator and the notch side; frequent controls ≥ 44 pt, menus ≥ 28 pt at the top; text ≥ 11 pt; visible press state.
- [ ] Inputs ≥ 16 px; contrast passes in both themes; Western digits, `tabular-nums`.
- [ ] Every control has its cue; `npm run check:sounds` and `npx tsc -b` pass; one line
      stating the screen's main UX decision (CLAUDE.md).

## Known code drift (as of 2026-11-15)

The rules above were updated from `docs/mobile/pattern-audit-2026-11.md`; this `/student-v2`
code does not match them yet. Fix it there, then strike the line.

- **`IosTabBar`** (`V2Shell.tsx`): `px-4` (16 side margins) and
  `pb-[calc(var(--sai-bottom)+8px)]` (≈ 42 pt off the bottom edge) vs the ≈ 21 pt inset on
  all three sides; labels `font-semibold` selected / `font-medium` unselected vs 11 regular
  (medium when selected). The pages' bottom padding follows the old offset.
- **Sheets** (`src/components/ui/sheet.tsx`, plus the `[data-slot="sheet-content"]` rule in
  `ios.css`): every bottom sheet is full-width (`inset-x-0 bottom-0`), opaque, 38 px top
  corners, at every detent — no inset glass medium detent (`DocsSheet.tsx`,
  `matieres/parts.tsx`).
- **Menus** (`header/ProfileMenu.tsx`, `header/NotificationsMenu.tsx`,
  `dashboard/CalendarPanel.tsx`): opaque `bg-v2-surface` with a border and `shadow-xl`, not
  glass; they portal without `data-space="v2"`, so `ios.css`'s radius and `--ts` don't reach
  them (Tailwind's own 24 px `rounded-3xl`).
- **Action sheets**: none built yet; no control-anchored form either.
- **Header** (`TopBar` in `V2Shell.tsx`): an in-flow header with the greeting at large-title
  size that scrolls away — no fixed bar the title collapses into, so no scroll-edge effect
  (soft or automatic) is drawn. Recipe 2 is the target.
- **Back** (`PhoneBack` in `V2Shell.tsx`): chevron + "رجوع" text, no glass circle (recipe 10).
- `ios.css`'s header comment still says "10 pt tab labels".

## Go deeper

`references/recipes.md` — TSX for the eleven patterns above. `docs/mobile/ios-patterns.md` —
what Apple says (cited), what we do, the 28 rules this distils, sources. `docs/mobile/README.md`
— gallery, platform layer, deploying `mobile.<host>`. `docs/sound-effects.md` — the sound grammar.
