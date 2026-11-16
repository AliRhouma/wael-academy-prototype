# Android design language for Wael Academy — Material 3 Expressive, One UI, and a web "Android skin"

Research date: 2026-10-26. Target: the `/student-v2` web prototype shown inside a Samsung Galaxy A55 frame in a browser (Vite + React 19 + Tailwind v4, RTL, Tunisian Arabic, Cairo type). Each section separates **what Google / Samsung say** (with `[S#]` citations, list at the end) from **what we do**. Values are dp/sp as published; on the web 1 dp = 1 CSS px and 1 sp = 1 rem-scaled px.

---

## 1. What is current (Oct 2026)

**What Google says.** Material 3 Expressive (M3E) was announced on 13 May 2025 as an *expansion* of M3 — "not M4", M3 is not deprecated [S1][S2]. It rests on 46 studies with 18,000+ participants; in lab tests people spotted key UI elements up to 4× faster, and 18–24-year-olds preferred expressive designs most strongly (up to 87%) [S3]. The changes:

| Area | M3 (2021–24) | M3 Expressive (2025→) |
|---|---|---|
| Motion | duration + easing tokens (50–1000 ms, cubic-beziers) | **motion physics**: springs; *spatial* springs (position/size/shape, may overshoot) vs *effects* springs (colour/opacity, never overshoot); `fast`/`default`/`slow` speeds; two schemes, *expressive* (default, bouncy) and *standard* [S2][S27] |
| Shape | corner scale xs–xl + full | adds `large-increased 20`, `extra-large-increased 32`, `extra-extra-large 48`; **35-shape library** with built-in shape morphing; `full` now means fully rounded, not "50%" [S22][S23][S24] |
| Type | 15 baseline styles | **+15 emphasized styles** (same size/line height, heavier weight) [S18][S19] |
| Colour | roles + dynamic colour | expanded palette, Expressive FAB/nav colour sets; nav-bar active label becomes `secondary` [S2][S34] |
| Components | — | **5 new**: button groups, FAB menu, loading indicator, split button, toolbars (docked + floating). **9 updated**: app bars, carousel, common buttons, extended FAB, FAB, icon buttons, navigation bar, navigation rail, progress indicators (Google says "14" in one place and "15" in another) [S2][S4] |
| Deprecations | — | baseline nav bar → *flexible/short* nav bar; navigation drawer → *expanded nav rail*; bottom app bar → *docked toolbar*; segmented buttons → *connected button group*; speed-dial FABs → *FAB menu*; indeterminate spinner for <5 s → *loading indicator* [S34][S37][S42][S44][S52][S93] |

System UI shipped on Pixel with **Android 16 QPR1 on 3 Sep 2025** (Pixel 6+, Pixel Tablet): blurred notification shade / Quick Settings / Recents, resizable QS tiles, pill buttons at the bottom of the shade, new status-bar icons, lock-screen clock/date re-layout, springy notification "detach" with haptics, Live Updates [S4][S5][S6]. Libraries: Compose Material 3 **1.4.0 stable** carries M3E as `@ExperimentalMaterial3ExpressiveApi`; **1.5.0** will promote it to stable "later in 2026" — as of 4 Nov 2026 the channel is **1.5.0-rc01**; most Expressive APIs (app bars, FAB / FAB menu, buttons, button group, split button, floating toolbar, expressive lists and menus, search bar) graduated during the 1.5 alphas, while `LoadingIndicator` and `MaterialShapes` are still experimental (their promotions were reverted) [S8][S13]. **Material Views (MDC-Android) 1.14.0** is the final feature release and is now in maintenance mode; Material Android is "Compose-first" [S8].

**Google I/O 2026 (19–20 May) and Android 17 — verified vs. uncertain.** Verified from Google's own posts: an *expressive layout system* with a new scaffold for all device classes, a *new spacing system built on 8 dp*, *expressive lists and menus*, a *contained* search style, Compose-first, the Styles API for Compose, and a new "Glimmer" design system for AI glasses [S7][S8]. **Android 17 (API 37) shipped 16 Jun 2026**: Compose-first (Fragments/RecyclerView/ViewPager in maintenance), App Bubbles for any app, large-screen orientation/resizability restrictions ignored at sw ≥ 600 dp, fewer activity restarts [S9]; reviewers report it mostly bundles the QPR Expressive work and extends system blur (toggle in *Accessibility → Colour and motion*) [S10]. **Android 17 QPR1** reached Pixels from mid-Sept 2026 with more system blur (volume panel, power menu, folders); QPR2 is expected Dec 2026. Android 17's orientation override (apps targeting API 37 on sw > 600 dp) **exempts games** that declare `android:appCategory="game"`; phones (sw < 600) are unaffected. *Press reports, not Google docs*: Google publicly ruled out an iOS-style "Liquid Glass" redesign [S11]; a May 2026 leak showed a custom Material You colour picker with preset variants [S12]. Treat the last two as unconfirmed.

---

## 2. Colour

**What Google says.** A scheme is built from tonal palettes (primary, secondary, tertiary, neutral, neutral-variant, error) in HCT; roles map to tones [S14]:

| Role | Light | Dark | Role | Light | Dark |
|---|---|---|---|---|---|
| primary / on-primary | P40 / white | P80 / P20 | surface (= background) | N98 | N6 |
| primary-container / on- | P90 / P10 | P30 / P90 | surface-dim / surface-bright | N87 / N98 | N6 / N24 |
| secondary / on- | S40 / white | S80 / S20 | surface-container-lowest | white | N4 |
| secondary-container / on- | S90 / S10 | S30 / S90 | surface-container-low | N96 | N10 |
| tertiary / on- | T40 / white | T80 / T20 | surface-container | N94 | N12 |
| tertiary-container / on- | T90 / T10 | T30 / T90 | surface-container-high | N92 | N17 |
| error / on-error | E40 / white | E80 / E20 | surface-container-highest | N90 | N22 |
| error-container / on- | E90 / E10 | E30 / E90 | on-surface / on-surface-variant | N10 / NV30 | N90 / NV80 |
| *-fixed / *-fixed-dim | X90 / X80 (both themes) | | outline / outline-variant | NV50 / NV80 | NV60 / NV30 |
| inverse-surface / inverse-on-surface / inverse-primary | N20 / N95 / P80 | N90 / N20 / P40 | scrim | 32% black (dialog dim, sheet scrim) [S48][S49] |

Dark theme is **tonal, not black**: surfaces N4–N24, containers at tone 30, accents at tone 80. Elevation levels are 0/1/3/6/8/12 dp and in M3 are expressed mainly by *surface-container level*, not shadows [S16]. Dynamic colour (Android 12+, API 31) derives the whole scheme from wallpaper; `@material/material-color-utilities` (npm) gives the same HCT/TonalPalette/DynamicScheme maths on the web [S91].

**State layers** (one at a time, never stacked): hover **8%**, focus **10%**, pressed **10%**, dragged **16%** of the content colour over the container [S15]; Compose uses the same numbers [S16]; `@material/web` tokens v0.192 use 12% for focus/pressed [S17] — we follow the spec (8/10/10/16). Disabled: content 38%, container 12% [S16]. Ripple colour = the component's text/icon colour [S41].

**What we do — mapping our fixed brand colours onto M3 roles.**

| Ours | M3 role | Notes |
|---|---|---|
| teal `#0491A5` | **primary** (source colour of the primary tonal palette) | Filled buttons, active slider track, primary tab indicator, selected date. Tone-40 primary derived from this hue is a slightly darker teal; keep the raw hex only for the hero gradient. |
| lime `#8AFF6B` | **tertiary** (and `tertiary-container` for FAB / FAB-menu items) | The one high-emphasis CTA colour. Text on lime must be navy (`on-tertiary-container` = tone 10). Never use lime as a text colour. |
| navy `#172E5B` | **on-surface** (tone ~10) and the *hue* of the neutral palette | Gives slightly blue-tinted surfaces (N96/N94/N92) instead of grey. Our "1 px navy at 15%" borders become `outline-variant` (NV80). |
| live red `#FF3B3E` | **error** family + a custom "live" role | Live badges/dots use `error`/`error-container`; keep contrast ≥ 3:1 on white. |
| done orange `#F28B14` | **secondary** family via custom-colour harmonisation | `secondary-container` (tone 90, a pale apricot) becomes the nav-bar active pill and the "done" chips — exactly where M3E puts secondary. |
| teal→lime gradient | *not* a role | Allowed on one surface per screen (the live-séance hero / primary CTA). Everything else flat. |

---

## 3. Typography

**What Google says.** Type scale (sp; line height; tracking; weight) and the Expressive *emphasized* weights [S16][S18][S19]:

| Style | L | M | S | Emphasized weight |
|---|---|---|---|---|
| Display | 57/64, −0.2, 400 | 45/52, 0, 400 | 36/44, 0, 400 | 500 |
| Headline | 32/40, 0, 400 | 28/36, 0, 400 | 24/32, 0, 400 | 500 |
| Title | 22/28, 0, 400 | 16/24, +0.15, 500 | 14/20, +0.1, 500 | 500 (L) / **700** (M, S) |
| Body | 16/24, +0.5, 400 | 14/20, +0.25, 400 | 12/16, +0.4, 400 | 500 |
| Label | 14/20, +0.1, 500 | 12/16, +0.5, 500 | 11/16, +0.5, 500 | **700** |

Display/Headline/Title-L use the *brand* typeface, the rest the *plain* typeface; Roboto is the default for both and Roboto Flex is the variable alternative; emphasized styles are for selection, actions, headlines, badges, primary buttons, extended FABs and selected list/menu items — components do not use them by default [S19]. The scale is Major Second (1.125) from a 14 base. Android's system Arabic font is **Noto Naskh Arabic** (and the compact *UI* cut for system chrome); AOSP ships no Noto Sans Arabic [S20]. Samsung's default since One UI 6 is **One UI Sans**, but third-party apps still render Roboto unless they bundle fonts [S74]. Text sizes must be in **sp**; Android 14+ scales up to **200 % non-linearly** (large text grows less) — never use sp for padding or box heights [S82].

**What we do.** Keep **Cairo** (Kufi-style Arabic paired with a Titillium-derived Latin, OFL, variable) [S21] — it is our brand voice and nothing in M3 forbids a custom brand/plain typeface. But adopt the M3 *scale and roles*: `body-large 16/24` for derja body copy, `title-medium 16/24 ·600` for card titles, `label-large 14/20 ·600` for buttons/tabs/nav, `headline-small 24/32` for screen titles, `display-small 36/44` only for the live countdown. Cairo's tall Arabic marks need the M3 line heights *as minimums* (never below 1.4). Emphasized = Cairo 600/700 (not 800+). Latin digits and ASCII inherit Cairo's Latin, so no second font. Use `rem` for type and `px` for containers so that browser/system text scaling behaves like sp vs dp.

---

## 4. Shape

**What Google says.** Corner scale [S16][S22][S23]: none 0 · extra-small **4** · small **8** · medium **12** · large **16** · *large-increased 20* · extra-large **28** · *extra-large-increased 32* · *extra-extra-large 48* · full (pill/circle). Typical assignments: buttons/chips-as-pills/FAB-menu items/toolbars/search bar/nav indicator = full; chips, list images = 8; cards = 12; FAB 16 (small 12, medium 20, large 28); bottom sheets, dialogs, date/time pickers, carousel items = 28; menus, snackbar, tooltips = 4 [S16]. Buttons **morph** to a smaller radius when pressed (small → `small 8`, medium → `medium 12`, large/xl → `large 16`) and toggle round↔square when selected [S41][S43]. The 35 `MaterialShapes` (Circle, Square, Slanted, Arch, Fan, Arrow, SemiCircle, Oval, Pill, Triangle, Diamond, ClamShell, Pentagon, Gem, Sunny, VerySunny, Cookie 4/6/7/9/12-sided, Ghostish, Clover 4/8, Burst, SoftBurst, Boom, SoftBoom, Flower, Puffy, PuffyDiamond, PixelCircle, PixelTriangle, Bun, Heart) are for avatars, image crops, decoration, loading and *state changes*, used sparingly [S23][S24].

**What we do.** Our 24 px panel radius is off-scale: use **28** for sheets/hero panels, **16** for grouped list containers, **12** for content cards, **full** for every button and the nav pill. Crop the illustrated subject badges with one or two `MaterialShapes` (e.g. `Cookie9Sided`, `Sunny`) and morph to `Circle` on press.

---

## 5. Components and dimensions (dp)

Sources: Compose token files and MDC-Android docs/tokens [S16][S34]–[S59]. "M3E" = Material 3 Expressive variant.

| Component | Key specs |
|---|---|
| **Top app bar** | small/center-aligned **64**; medium **112** (collapses to 64); large **152**. M3E *flexible* medium **112** (136 with subtitle), large **120** (152 with subtitle); titles title-large → headline-medium (medium flexible) → display-small (large flexible); container `surface`, on-scroll `surface-container`; 4 dp side padding, 16 dp title inset; nav icon `on-surface`, actions `on-surface-variant`. |
| **Navigation bar** | M3 baseline: **80** high, pill **64×32**, icon 24, label label-medium 12 sp, padding 12/16, container `surface`. **M3E flexible/short: 64 high**, pill **56×32**, padding 6/6, label not bolded, active label `secondary`, active icon `on-secondary-container` on `secondary-container` pill, container `surface-container`, elevation 3; 3–5 destinations on compact (3–6 on medium with *horizontal* items: pill height 40, 16 dp side space). Labels always visible, 1–2 words, never truncated; filled icon when active; re-selecting scrolls to top; may hide on scroll-down (not with a screen reader). |
| **Navigation rail / drawer** | rail 80 wide (M3E **96**), 3–7 items, pill 56×32; expanded rail 220–360 wide replaces the drawer; drawer 360 wide, item pill 336×56. |
| **FAB** | small **40** (r 12, icon 24) · default **56** (r 16, icon 24) · M3E medium **80** (r 20, icon 28) · large **96** (r 28, icon 36); elevation 6 (hover 8); `primary-container`/`secondary-container`/`tertiary-container` or M3E `primary`/`secondary`/`tertiary`; surface FABs deprecated. **Extended FAB** 56 (M3E 80 / 96), label label-large, icon 24, min width 80. **FAB menu** (replaces speed dial): 2–6 items, item **56 high**, pill, 4 dp apart, 24 dp side padding, icon 24 + title-medium label, close button 56 circle with 20 icon; FAB morphs into the close button; 16 dp margins (24 on large windows); mirrored to the leading edge in RTL. |
| **Buttons** | M3 default **40 high**, pill, label-large, icon 18, padding 24 (16 for icon side). **M3E sizes**: XS **32** (icon 20, pad 16), S **40** (icon 20, pad 16), M **56** (icon 24, pad 24), L **96** (icon 32, pad 48), XL **136** (icon 40, pad 64); outline 1/1/1/2/3; round = full, square = 12/12/16/28/28; pressed shape 8/8/12/16/16; min touch 48. Five styles: filled (`primary`), tonal (`secondary-container`), elevated (`surface-container-low` + 1 dp), outlined (1 dp), text. **Icon buttons**: XS 32 (icon 20) · S 40 (icon 24, 48 touch) · M 56 · L 96 (icon 32) · XL 136 (icon 40); widths narrow/default/wide. **Button groups**: standard 12 dp gaps, pressed child grows ~15% while neighbours shrink; connected 2 dp gaps, inner corners 8 (4 when pressed, 50% when selected), replaces segmented buttons. **Split button**: 2 dp gap, trailing menu icon spins and morphs. |
| **Toolbars (M3E)** | floating **64**, pill, 16 dp from the window edge (vertical ≥ 24), 8 dp inner padding, 4 dp between actions, *standard* `surface-container` / *vibrant* `primary-container`, optional paired FAB (8 dp gap); docked **64**, full width, no corners, 16 dp side padding; bottom app bar (80) not recommended. |
| **Chips** | **32** high, r 8, 1 dp outline, icon 18, label-large, 48 touch; selected `secondary-container`. |
| **Cards** | r 12; elevated `surface-container-low` +1 dp; filled `surface-container-highest` 0 dp; outlined `surface` + 1 dp `outline-variant`; 8 dp between cards on mobile; dragged elevation 6–8. |
| **Lists** | one/two/three-line **56/72/88**; 16 dp side padding, 10 top/bottom, 12–16 between elements; leading icon 24 (M3E 20), avatar 40, image 56 (M3E r 8), video 114×64; headline body-large, supporting body-medium, overline label-small; selected `secondary-container`; divider inset 16; M3E lists can be grouped with 2 dp gaps and 16 dp outer corners. |
| **Dialogs** | r **28**, `surface-container-high`, elevation 6, padding 24, width 280–560, title headline-small, body body-medium, actions text buttons label-large `primary` (8 dp apart), icon 24 `secondary`, dim 32%. |
| **Bottom sheets** | top r 28, `surface-container-low`, drag handle **32×4** `on-surface-variant` inside a 48 dp hit area, max width 640, elevation 1; modal has 32% scrim, dismiss by tap-outside/drag; modal sheets get predictive back for free. |
| **Snackbar** | **48** (one line) / **68** (two), r 4, `inverse-surface`, body-medium `inverse-on-surface`, action `inverse-primary`, 8–16 dp margins, above nav bar/FAB, swipe to dismiss. |
| **Switch** | track **52×32**, outline 2, thumb 16 (off) / 24 (on) / 28 (pressed), optional 16 icon; on = `primary`, off = `surface-container-highest` + `outline`. |
| **Slider (M3E)** | track **16** high, handle **4×44** (2 wide pressed), 6 dp gap each side of the handle, 4 dp stop dot, full corners, value indicator 12 dp above. |
| **Progress** | linear 4 thick (M3E thick 8), 4 dp gap between active and track, 4 dp stop dot; circular 40 (stroke 4; wavy 48; range 24–240). **Wavy**: linear amplitude 3, wavelength 40 (indeterminate 20); circular amplitude 1.6, wavelength 15. **Loading indicator**: 48 container, 38 shape, morphs through SoftBurst → Cookie9 → Pentagon → Pill → Sunny → Cookie4 → Oval every 650 ms (spring 0.6/200) while rotating 360° per 4.67 s; contained variant on `primary-container`. Rule: <200 ms nothing; 200 ms–5 s loading indicator; >5 s progress indicator. |
| **Tabs** | 48 high (64 with icon + label); primary indicator **3** rounded, secondary **2** full-width + 1 dp divider; label title-small; scrollable min 72 / max 264. |
| **Search** | bar **56**, pill, `surface-container-high`, 16 dp margins, avatar 30, body-large; search view full-screen, predictive back automatic; M3E adds a bouncy "contained" style. |
| **Badges** | dot **6**, count **16** (label-small), `error`, upper-trailing corner of the icon. |
| **Tooltips / menus** | plain tooltip r 4 `inverse-surface` body-small; menu r 4 `surface-container` elevation 3, items **48**, min 112 / max 280 wide, 12 dp item padding, 48 dp from screen edge. **M3E vertical menus** (Nov 2025; Compose expressive menu APIs promoted in 1.5.0-alpha19): rounded container (value not confirmed from a primary source), `surface-container-low`, selected item `tertiary-container`, gaps instead of dividers (one or two per menu), a "vibrant" variant; the baseline 4 dp menu remains valid. We keep the baseline, one style app-wide; the vertical menu is an allowed future change. |
| **Date / time pickers** | date dialog 360×568, r 28, `surface-container-high`, day cells **40×40** circles, today 1 dp `primary` outline, selected `primary`, range `secondary-container`; time dial 256, selector 48, hour/minute fields 96×80 (display-large), r 8. |
| **Pull-to-refresh** | threshold **80**, indicator 40 circle `surface-container-high` elevation 3, 16 spinner; M3E uses the contained loading indicator (48) with determinate morph while pulling. |
| **Carousel** | multi-browse (default) / hero / uncontained / full-screen; small items 40–56; items r 28; snap one item per fling. |

---

## 6. Motion

**What Google says.** Spring tokens, `md.sys.motion.spring.[speed].[type]` — scheme chosen at product level [S26][S27]:

| Token | Expressive (default) | Standard | Use |
|---|---|---|---|
| fast spatial | damping **0.6**, stiffness **800** | 0.9 / 1400 | switches, buttons, chips |
| default spatial | **0.8 / 380** | 0.9 / 700 | sheets, menus, expanding items |
| slow spatial | **0.8 / 200** | 0.9 / 300 | full-screen moves |
| fast / default / slow effects | 1.0 / **3800** · 1.0 / **1600** · 1.0 / **800** | same | colour, opacity (no overshoot) |

MDC-Android (Views) ships only the standard-like set (0.9 damping) [S25]. Legacy tokens still exist: durations short1–4 **50/100/150/200**, medium1–4 **250–400**, long1–4 **450–600**, extra-long1–4 **700–1000** ms; easings standard `cubic-bezier(.2,0,0,1)`, standard-decelerate `(0,0,0,1)`, standard-accelerate `(.3,0,1,1)`, emphasized-decelerate `(.05,.7,.1,1)`, emphasized-accelerate `(.3,0,.8,.15)` [S25]. Transition patterns: container transform (card → detail), shared axis (forward/back, with a fade on Android), lateral (tabs), fade-through (top-level destinations), enter/exit, skeleton loaders [S28]. **Predictive back**: system animations (back-to-home, cross-activity, cross-task) are on by default from Android 15; for apps targeting Android 16 they cannot be disabled and `onBackPressed`/`KEYCODE_BACK` are no longer dispatched; modal bottom sheets, side sheets, search view and nav drawer animate with the gesture for free [S29][S30][S33].

**What we do.** Use the *expressive* scheme: convert each spring to a CSS `linear()` easing (as community M3E ports do [S90]) or sample it into WAAPI keyframes; keep effects (opacity/colour) at ≤ 150 ms with no overshoot. Emulate predictive back: a back gesture/button first scales the open sheet/menu down with the gesture, then navigates; cards open with a container transform; nav-bar destinations fade-through; honour `prefers-reduced-motion` by switching to the standard scheme and dropping overshoot.

---

## 7. Layout and system UI

**What Google says.** Spacing on an **8 dp grid** (M3's 2026 spacing system is built on 8 dp) [S7]; margins **16 dp** on compact, **24 dp** on medium+ [S61]. Window size classes: compact < 600 dp (nav bar), medium 600–839 (nav bar with horizontal items or rail), expanded 840–1199, large 1200–1599, extra-large ≥ 1600 (expanded rail); heights compact < 480, medium 480–899, expanded ≥ 900 [S60][S61][S62]. Touch targets ≥ 48×48 dp [S81]. System chrome: status bar **24 dp**; 3-button nav bar **48 dp**; gesture nav bar **24 dp** (48 dp frame, 32 dp gesture-exclusion zone); taskbar 56 dp [S63]. Edge-to-edge is **enforced for apps targeting Android 15** (status bar transparent, gesture bar transparent, 3-button bar 80 % scrim; `statusBarColor`/`navigationBarColor` disabled) and the opt-out is removed when targeting Android 16 [S31][S30][S32].

**Galaxy A55.** 6.6″ Super AMOLED 120 Hz, **1080×2340**, 19.5:9, ~390 ppi, centered Infinity-O punch hole, launched on Android 14 / One UI 6.1, on One UI 8.5 from May 2026 and One UI 9 / Android 17 from 21 Oct 2026 [S64][S65][S71]. The CSS viewport depends on the user's *Display size* setting: device databases list **412×892 @ DPR 2.625** [S66], DeviceAtlas samples 384 px wide for FHD+ Galaxy A phones [S66]; the brief's 393×851 @ 2.75 is a plausible middle value. Design fluid for 360–412 px and test at 384, 393 and 412.

**What we do.** Phone layout = 16 px margins, 8 px rhythm, one pane; ≥ 600 px switch to the rail (we already have a right-side rail on desktop — correct for RTL). Inside the device frame the host paints a 24 px status area and a 24 px (gesture) or 48 px (3-button) nav area *over* our page, and passes their sizes as CSS variables (see §13); our fixed bars pad by those variables.

---

## 8. Samsung One UI (A55: 6.1 → 7 → 8 → 8.5)

**What Samsung says.** Principles: *focus on the task, interact naturally, be visibly comfortable, make things responsive*. The screen is split into a top **viewing area** (titles, non-interactive content, wide margins, centred text) and a lower **interaction area** (all touch controls) so controls stay within reach; actions are grouped in logical order; interaction-area grids are list, card, 2- and 3-column; "focus blocks" group content [S67]. One UI 7 (Apr 2025; A55 May 2025) is described as "stripped-back, bold and emotional", with the **Now Bar** showing live activities (timer, media, workouts, Interpreter) at the bottom of the lock screen plus a status-bar pill, redesigned widgets/lock screen, split notification and quick panels [S68][S69]. One UI 8 (Sep 2025; A55 Oct 2025) extends the Now Bar to more third-party apps and the Flip's cover screen [S70][S71]. One UI 8.5 (A55 May–Jun 2026) adds *floating bottom bars with rounded sides*, a floating back button in Settings, more translucency — reviewers call it Liquid-Glass-inspired, while Samsung avoids heavy transparency for readability [S72]. **One UI 9 (Android 17)**: A55 stable from 21 Oct 2026 (Korea, then India; Europe unconfirmed as of 23 Oct), design largely as 8.5; floating translucent tab bars in Samsung's own apps (Phone, Gallery, My Files…) since 8.5. We keep the docked M3E bar on purpose (see the skill). The default font is **One UI Sans** (since One UI 6) [S74].

**Where it departs from stock Material** [S72][S73]: near-monochrome palette with one or two accents (Google's apps are colourful); big grouped, rounded "card" lists in Settings-style screens; large top title that collapses on scroll (the viewing area); controls pushed to the bottom; Quick Settings tiles all the same size and a separate notification page; floating pill bars instead of Google's docked/floating toolbars; iOS-like back button. **What a Galaxy user expects that pure Material does not give**: reachability (first interactive element in the lower half), generous rounded containers, calm colour with strong black type, swipe-down-anywhere gestures, One UI Sans / Roboto rather than a brand font, and a Now-Bar-style live chip for ongoing activity.

**What we do.** Keep Material 3 Expressive as the component language (it is what Android 16/17 and every Google app look like) but borrow One UI's *reachability*: a large title block at the top of each screen that collapses into a 64 dp app bar, primary actions in the bottom 40 % of the screen, and a bottom "live" chip modelled on the Now Bar for the running séance.

---

## 9. Iconography

**What Google says.** Material Symbols are variable fonts with axes **FILL 0–1**, **wght 100–700** (regular 400), **GRAD −50…200** (0 default; −25 for light-on-dark to reduce glare), **opsz 20–48** (24 default); three families Outlined / Rounded / Sharp, no separate filled font [S75]. Icons sit on a **24 dp** canvas with a **20 dp live area** (2 dp padding), **2 dp strokes**, **2 dp corner radius** (Rounded rounds interiors too), squared terminals, face-forward, whole-pixel alignment; 20 dp for dense UI, 40/48 for display sizes [S76]. Navigation bars use the *filled* glyph for the active destination [S35].

**Lucide** [S77]: 24×24 canvas, 2 px centred strokes, **round** joins and caps, 1 px safe zone, 2 px minimum gaps, 2 px radius on corners ≥ 8 px. **What we do.** Lucide is visually closest to *Material Symbols Rounded, weight 400, grade 0*: render at `size=24 strokeWidth=2` (never scale below 20; use `absoluteStrokeWidth` when enlarging to 32/40 so strokes stay 2 px), tint with `on-surface-variant`, and switch to the filled Lucide variant (`fill="currentColor"`, stroke kept) for the active nav destination to imitate `FILL 1`. Reserve the illustrated subject badges for content, not navigation.

---

## 10. Interaction

**What Google says.** Ripple = state layer that grows from the touch point: `@material/web` grows over **450 ms** (standard easing) from 20 % of the largest side to the hypotenuse + 10 px with a soft edge (35 % of size, min 75 px), waits **150 ms** on touch before starting (so scrolls don't ripple), holds the pressed state ≥ **225 ms**, fades in over 105 ms and out over 375 ms; hover layer 15 ms [S78]. Gestures: tap navigates; **long press** selects a list item or gives extra options; swipe reveals row actions or switches peers; drag reorders; pick-up-and-move; swipe-to-dismiss for snackbars/notifications; don't swipe between nav destinations [S35][S79]. Back closes the top-most transient surface first (menu → sheet → dialog → search), then navigates [S29][S33]. Haptics: "less is more", clear not buzzy, matched to importance, co-designed with sound and visuals; a key click should last 10–20 ms [S80].

**What we do — haptic constants → our `uisfx` cues** (web can't vibrate inside an iframe) [S80]:

| Android `HapticFeedbackConstants` | Meaning | Sound cue |
|---|---|---|
| `VIRTUAL_KEY`, `KEYBOARD_TAP` | tap on a control | the quiet `tap` |
| `CONTEXT_CLICK`, `LONG_PRESS` | long-press/context action | short `pop` |
| `CONFIRM` / `REJECT` | success / failure | `success` chord / `error` buzz |
| `TOGGLE_ON` / `TOGGLE_OFF` | switch state | two-tone up / down |
| `SEGMENT_TICK` / `SEGMENT_FREQUENT_TICK` / `CLOCK_TICK` | stepping values (slider, picker) | very soft `tick` (throttled) |
| `GESTURE_THRESHOLD_ACTIVATE` / `_DEACTIVATE` | pull-to-refresh or swipe crosses the threshold | `snap` / softer `release` |
| `DRAG_START` | item picked up | `lift` |
| `GESTURE_START` / `GESTURE_END` | gesture begins/ends | none (silent) |
| `NO_HAPTICS` | none | none |

---

## 11. Accessibility

**What Google says.** Targets ≥ **48×48 dp**; text contrast **4.5:1** below 18 sp (or 14 sp bold), **3:1** otherwise; nav icons ≥ 3:1 against the bar [S35][S81]. TalkBack: every control gets a purpose-stating `contentDescription` (no "button" suffix, unique per list row), decorative images hidden, text not double-described [S81]. Font scaling to **200 %** (non-linear) — test at the maximum [S82]. Motion: Android's *Remove animations* setting is the counterpart of `prefers-reduced-motion`, which Chrome honours [S83]; Android 17 lets users turn off system blur [S10]. **What we do**: 48 px hit areas everywhere (chips 32 px visually, 48 px hit), `aria-label` in derja on every icon button, labels on all five nav items, test at 200 % text and in `prefers-reduced-motion`.

---

## 12. RTL / bidirectionality

**What Google says** [S84]: mirror the layout, navigation (rail on the right, back arrow pointing right, "forward"/"send" flipped), toolbars (FAB on the left), chips' trailing icons, badges, swipe-to-reveal and predictive-back directions, text fields' icons, 12-hour AM/PM position, and *linear progress* (fills right-to-left — except Hebrew). **Do not mirror**: media playback controls and media progress (always LTR), clocks and circular refresh/progress, charts for Persian/Urdu, email addresses, phone numbers/URLs/digits (digit order stays LTR), physical objects, slashes; the help icon flips only in Urdu/Persian; checkmarks and non-directional icons stay as they are (M1/M3 principle: mirror only icons that imply direction or passage of time).

**What we do.** `dir="rtl"` on `<html>`, only logical properties (`ps-/pe-/ms-/me-/start-/end-`). Back chevron → ; list chevrons point left; nav rail stays on the right (desktop); FAB and FAB menu on the bottom-*left*; linear progress and skeleton shimmer run right-to-left; the video seek bar, play/skip/replay-10 icons and timestamps stay **LTR**; Western digits (0–9) as used in Tunisian apps, with `unicode-bidi: isolate` around numbers and Latin tokens (e.g. "4ème Math"); clock/calendar icons unmirrored.

---

## 13. Web implementation notes

- **Ripple + state layers** without a library: `position:relative; overflow:hidden; isolation:isolate` on the control, `::before` hover layer (`background: color-mix(in srgb, var(--m3-on-surface) 8%, transparent)`, 15 ms), `::after` press layer (radial gradient to transparent, animated with WAAPI from scale .2 to the hypotenuse over 450 ms with `cubic-bezier(.2,0,0,1)`, min visible 225 ms, 150 ms touch delay) [S78]. `color-mix()` is supported in Chrome 111+, Safari 16.2+, Firefox 113+, Samsung Internet 22+ [S88]. Pressed opacity 10 %, focus ring 3 px `secondary` (M3 focus indicator colour).
- **Theme & chrome**: `<meta name="theme-color" media="(prefers-color-scheme: light)" content="#F7F9FC">` + a dark twin colour the real browser toolbar/status bar when the prototype is opened directly on a phone; `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` opts into Chrome's edge-to-edge (Chrome 135+, phones only), where `env(safe-area-inset-bottom)` changes as the browser "chin" hides; put the inset in `bottom:` not `padding-bottom` and use `safe-area-max-inset-bottom` for the reserved height [S85].
- **Insets inside the device frame**: the spec defines `safe-area-inset-*` relative to the *viewport*, so a page inside an `<iframe>` does not see the device's insets (they resolve to 0) [S86]. The frame host must publish them — as implemented in `src/app/platform.ts`: `--sai-top: 36px; --sai-bottom: 24px /* gesture */ | 48px /* 3-button, not built */` on `<html>`, and our `pt-safe/pb-safe` utilities read `var(--sai-top)` / `var(--sai-bottom)`, which default to `env(safe-area-inset-*)` on `:root` (index.css) for a real phone.
- **PWA**: `display: "standalone"` hides browser UI (keeps the status bar), `fullscreen` hides everything, `minimal-ui` keeps back/reload; `display_override` for fallbacks; `background_color` paints the splash [S87].
- **Libraries (state in Oct 2026)**: `@material/web` has been in maintenance mode since 10 Jun 2024 (no Expressive, issue #5888 open) [S89]; community ports: `material-esm/material` (fork), `m3-expressive-web` (Lit, Apache-2.0, springs → `linear()`), `mdui` v2 (v3 targets M3E), Beer CSS 5.0 (claims M3E support), `m3-svelte` [S90]; Material Tailwind v3 is "Material-inspired", not M3 tokens [S92]. Theming maths: `@material/material-color-utilities` (HCT, tonal palettes, dynamic schemes) and the Material Theme Builder web tool / Figma plugin for exporting a scheme from our teal [S91]. Recommendation for this prototype: no component library — tokens as CSS custom properties generated once with material-color-utilities, components restyled in Tailwind.

---

## 14. Rules for Wael Academy (Android skin)

Testable rules for restyling `/student-v2` to feel like Material 3 Expressive on a Galaxy A55 while keeping teal/lime/navy, Cairo and RTL.

**Tokens**
1. Generate an M3 scheme from teal `#0491A5` (primary), orange `#F28B14` (secondary), lime `#8AFF6B` (tertiary), red `#FF3B3E` (error) with navy-hued neutrals; expose every role as `--m3-*` custom properties in light and dark. *Test:* no component uses a raw hex except the single hero gradient.
2. Surfaces use the five container levels (page `surface` N98, grouped lists `surface-container-low`, bars `surface-container`, sheets/search `surface-container-high`), not shadows; the 1 px 15 % navy border is replaced by `outline-variant` or by a tonal step. *Test:* at most one box-shadow per screen (FAB).
3. State layers: hover 8 %, focus 10 %, pressed 10 %, dragged 16 % via `color-mix()`; disabled 38 %/12 %. *Test:* every interactive element shows a visible pressed layer on touch.
4. Corners come only from the scale 4/8/12/16/20/28/full. *Test:* grep for `rounded-[24px]` returns nothing.
5. Type uses Cairo mapped to the M3 scale (`body-large 16/24`, `label-large 14/20·600`, `title-medium 16/24·600`, `headline-small 24/32`, `display-small 36/44` for the countdown only); emphasized = 600/700; sizes in `rem`, boxes in `px`. *Test:* the UI stays usable at 200 % browser text zoom.

**Navigation**
6. *(Superseded by the skill `wael-mobile-android`: five fixed `studentV2Tabs` — الرئيسية · الدروس · الرزنامة · تسجيلات · مجموعاتي — no profile tab, العروض in the avatar menu.)* ~~Five destinations, in this RTL order from the right: **الرئيسية** (home) · **موادي** (matières) · **التسجيلات** (replays) · **الرزنامة** (calendar) · **أنا** (profile). Offers/subscriptions move under profile plus an upsell card on home when the plan is near expiry; groups (placeholder) is a card on home and a row in profile. *Test:* every former tab is reachable in ≤ 2 taps.~~
7. *(Superseded by the skill: the pill is lime-tinted `secondary-container`, not apricot; the bar stays docked and tonal on purpose, not One UI's floating pill.)* Bottom nav = M3E flexible bar: 64 px high + the bottom inset, `surface-container`, 24 px Lucide icons (filled variant when active), labels always visible in label-medium, active pill 56×32 `secondary-container` (apricot) with `on-secondary-container` icon and `secondary` label, fade-through between destinations, hides on scroll-down and returns on scroll-up (never when reduced-motion/screen-reader). *Test:* re-tapping the active item scrolls to top.
8. At ≥ 600 px width the bar becomes the 96 px collapsed rail on the right; ≥ 840 px it may expand to 220 px. *Test:* resize the frame — no second nav component is ever visible at the same time.
9. Top app bar: 64 px, `surface`, becomes `surface-container` once content scrolls under it; section roots (matières, calendar) use the *large flexible* variant (120 px → 64 px) with the title in headline-medium/display-small to echo One UI's viewing area; detail screens use the small bar with a right-pointing back chevron. *Test:* title collapses smoothly over the first 56 px of scroll.
10. Back (frame button, swipe from either edge, browser back) closes menu → sheet → dialog → search before navigating; the sheet scales to 90 % and follows the gesture (predictive-back emulation). *Test:* with a sheet open, back never changes the route.

**Content surfaces**
11. Cards: 12 px radius, filled (`surface-container-highest`) for passive info, outlined (`surface` + `outline-variant`) for tappable cards; 8 px gaps; tap opens with a container transform. *Test:* no card has both a border and a shadow.
12. Lists: 56/72/88 px rows, 16 px side padding, 40 px avatar or 56 px badge image (r 8), chevron on the left, selected row `secondary-container`, grouped lists with 16 px outer radius and 2 px gaps (M3E lists). *Test:* row height does not change when text scales until 130 %.
13. Chapitres/contenus use **connected button groups** (40 px, pill outer, 8 px inner corners) for *cours · exercice · série · résumé · quiz* filters instead of segmented controls; selected button morphs round→square. *Test:* exactly one selected state visible per group.
14. Subject badges stay illustrated but sit in a `MaterialShapes` crop (one shape per subject family), morph to a circle on press; eyes keep tracking. *Test:* badge hit area ≥ 48 px.
15. Live séance panel = the one gradient surface (teal→lime), 28 px radius, countdown in display-small, a 56 px filled **tertiary** (lime) "دخول" button with navy label; a Now-Bar-style 40 px pill chip "مباشر الآن" docked above the nav bar on other screens. *Test:* live red is used only for the live dot/badge.
16. Documents: list rows with a 20 px type icon, a trailing icon button (40 px, 48 hit), downloads show the **wavy linear** indicator (4 px, 4 px gap, stop dot) and finish with `CONFIRM` → success cue. *Test:* nothing spins for less than 200 ms; waits of 0.2–5 s use the morphing loading indicator.

**Actions**
17. Buttons: pill, 40 px default, 56 px for the single primary action of a screen; filled = `primary` teal, tonal = `secondary-container`, text for tertiary actions; pressed shape morphs to r 8/12; 16/24 px horizontal padding; labels label-large Cairo 600, one line. *Test:* no screen has two filled buttons visible at once.
18. One FAB maximum (56 px, r 16, `tertiary-container`); if it needs ≥ 2 actions use a **FAB menu** (2–6 items, 56 px pills, 4 px apart) anchored bottom-left in RTL, 16 px from the edges and above the nav bar. *Test:* FAB never overlaps the nav bar.
19. Overflow actions live behind a 40 px "⋮" icon button opening a 4 px-radius menu (48 px items, 112–280 px wide, `surface-container`); long-press on a list row opens the same menu with the `pop` cue. *Test:* no hover-only actions.
20. Snackbars: 48/68 px, `inverse-surface` (navy), 4 px radius, 16 px margins, docked above the nav bar, 4 s (10 s with action), swipe-to-dismiss horizontally. *Test:* snackbar never covers the FAB (FAB lifts).

**Sheets, dialogs, pickers**
21. Mobile forms and filters are modal bottom sheets: top radius 28, `surface-container-low`, 32×4 handle, 32 % scrim, max height 90 %, dismiss by drag/scrim/back; on desktop the same props render a 28 px-radius dialog 280–560 px wide. *Test:* `useIsMobile()` is the only branch.
22. Calendar: week strip as 40 px circular day cells (today = 1 px `primary` outline, selected = filled `primary`, sessions = 6 px `error` dot), month view from the date-picker tokens (360 px grid, 28 px radius card), the day's sessions as 72 px list rows below. *Test:* a tap on a day updates the list without a route change; swipe between weeks uses the lateral transition.

**Video player**
23. Player chrome is LTR inside the RTL page (`dir="ltr"` on the control bar): play/pause/±10 s icons unmirrored, M3E slider seek bar (16 px track, 4×44 handle, 6 px gaps) with buffered track in `secondary-container`, timestamps in Western digits; controls fade (effects spring, ≤ 150 ms) after 3 s; 48 px targets; landscape fullscreen respects the punch-hole inset on the start side. *Test:* seek handle is reachable with the thumb (bottom 25 % of the screen).
24. Playlist + comments below the player use **primary tabs** (48 px, 3 px indicator) and the comment composer is a 56 px pill text field (`surface-container-high`) above the keyboard; the lesson title uses title-large and the subject chip 32 px.

**System UI inside the frame**
25. The frame host draws a 36 px status bar (One UI clears the punch hole; AOSP's is 24) and a 24 px gesture area (switchable to 48 px 3-button); our page is edge-to-edge beneath them and reads `--sai-top/--sai-bottom`. Status icons are dark on our light surfaces (light theme) and the page background continues behind the status bar; in 3-button mode the nav area gets an 80 % `surface-container` scrim. *Test:* toggling gesture/3-button never moves content, only padding.
26. Pressing the frame's back pill or swiping from an edge triggers rule 10; the home gesture resets to the role switcher.

**Motion & feedback**
27. Spatial changes use the expressive springs (fast 0.6/800 for switches and chips, default 0.8/380 for sheets and menus, slow 0.8/200 for screen transitions) rendered as `linear()` easings; colour/opacity use effects springs (no overshoot); `prefers-reduced-motion` switches to the standard scheme and removes overshoot. *Test:* no CSS transition longer than 600 ms except the loading indicator.
28. Every action maps to one cue from §10 and the ripple; ticks are throttled to ≥ 80 ms. *Test:* `npm run check:sounds` passes and no element plays two cues.

**Accessibility & RTL**
29. 48 px targets, 4.5:1 text contrast (lime never carries text), unique derja `aria-label`s on icon buttons, labels on all nav items, focus ring 3 px `secondary`. *Test:* axe/Lighthouse mobile ≥ 95 on each screen.
30. Only logical CSS properties; numbers and Latin tokens isolated with `unicode-bidi: isolate`; mirrored icons limited to back/forward/send/chevrons; progress and skeletons run right-to-left except in the player. *Test:* flipping `dir` to `ltr` produces a correct mirror with zero code changes.

### Checklist
- [ ] Scheme generated from the four brand colours; all roles exist in light and dark; raw hex only in the hero gradient
- [ ] Nav reduced to 5 items, 64 px flexible bar, 56×32 apricot pill, filled active icons, labels visible
- [ ] App bars 64 / 120→64 flexible; back chevron points right
- [ ] Cards 12, sheets/dialogs 28, buttons/chips/pills full; no 24 px radius left
- [ ] Buttons 40/56, pressed shape morph, one filled button per screen; FAB/FAB-menu bottom-left
- [ ] Lists 56/72/88, grouped with 16 px outer radius; menus 4 px, 48 px items
- [ ] Loading indicator for 0.2–5 s waits; wavy linear for downloads; stop dot present
- [ ] Springs: 0.6/800 · 0.8/380 · 0.8/200; effects 1.0/3800–800; reduced-motion fallback
- [ ] State layers 8/10/10/16; ripple 450 ms / 150 ms touch delay; disabled 38 %
- [ ] Frame passes `--sai-top: 36px`, `--sai-bottom: 24px|48px`; page edge-to-edge; `viewport-fit=cover`; `theme-color` light/dark
- [ ] Player LTR, unmirrored media icons, Western digits; progress bars RTL elsewhere
- [ ] 48 px targets, 4.5:1 text, derja aria-labels, 200 % text, TalkBack order = visual order
- [ ] Verified at 384 / 393 / 412 CSS px wide and at ≥ 600 px (rail)
- [ ] Sound cue per action per §10; `npm run check:sounds` green

### Sources (accessed 2026-10-26)
- [S1] Google — Google launches Material 3 Expressive redesign for Android, Wear OS devices (13 May 2025) — https://blog.google/products-and-platforms/platforms/android/material-3-expressive-android-wearos-launch/
- [S2] Material Design blog — Start building with Material 3 Expressive (13 May 2025) — https://m3.material.io/blog/building-with-m3-expressive
- [S3] Google Design — Expressive Design: Google's UX Research — https://design.google/library/expressive-material-design-google-research
- [S4] 9to5Google — Google announces Android 16's Material 3 Expressive redesign (13 May 2025) — https://9to5google.com/2025/05/13/android-16-material-3-expressive-redesign/
- [S5] 9to5Google — Google rolling out Android 16 QPR1 with Material 3 Expressive redesign for Pixel (3 Sep 2025) — https://9to5google.com/2025/09/03/android-16-qpr1-pixel/
- [S6] Google — Material 3 Expressive updates and more in the latest Pixel Drop (4 Sep 2025) — https://blog.google/products-and-platforms/devices/pixel/september-2025-pixel-drop/
- [S7] Material Design blog — What's new at Google I/O 2026 (19 May 2026) — https://m3.material.io/blog/whats-new-at-io26
- [S8] Material Design blog — Material Android is Compose-first (19 May 2026) — https://m3.material.io/blog/material-is-compose-first
- [S9] Android Developers Blog — Android 17 is Here (16 Jun 2026) — https://developer.android.com/blog/posts/android-17-is-here
- [S10] Android Central — Android 17 review (2026) — https://www.androidcentral.com/apps-software/android-17-review
- [S11] Android Headlines — Google Officially Says 'No' to Liquid Glass on Android 17 (May 2026) — https://www.androidheadlines.com/2026/05/google-denies-android-17-liquid-glass-redesign.html
- [S12] 9to5Google — Material 3 Expressive guide / article index (incl. 12 May 2026 Android 17 leak) — https://9to5google.com/guides/material-3-expressive/
- [S13] Android Developers — Compose Material 3 releases (1.4.0 stable; 1.5.0-beta02, 21 Oct 2026) — https://developer.android.com/jetpack/androidx/releases/compose-material3
- [S14] MDC-Android docs — Color theming (role → tone table, dynamic colour) — https://github.com/material-components/material-components-android/blob/master/docs/theming/Color.md
- [S15] Material 3 — States: state layers — https://m3.material.io/foundations/interaction/states/state-layers
- [S16] androidx Compose Material 3 token sources (Shape, TypeScale, State, Elevation, NavigationBar*, AppBar*, Fab*, FabMenu, Button*, *IconButton, FloatingToolbar, DockedToolbar, List, Dialog, SheetBottom, Snackbar, SearchBar, Switch, Slider, *ProgressIndicator, LoadingIndicator, Tabs, Badge, Menu, PlainTooltip, DatePickerModal, TimePicker, NavigationDrawer, *Card, ButtonGroup*) — https://github.com/androidx/androidx/tree/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens
- [S17] material-web tokens v0.192 (md-sys-state, md-sys-typescale) — https://github.com/material-components/material-web/tree/main/tokens
- [S18] MDC-Android docs — Typography theming (baseline vs emphasized weights) — https://github.com/material-components/material-components-android/blob/master/docs/theming/Typography.md
- [S19] Material 3 — Type scale tokens — https://m3.material.io/styles/typography/type-scale-tokens
- [S20] AOSP frameworks/base fonts.xml (Roboto, Roboto Flex, Noto Naskh Arabic / UI) — https://github.com/aosp-mirror/platform_frameworks_base/blob/main/data/fonts/fonts.xml
- [S21] Cairo typeface (Mohamed Gaber) README — https://github.com/Gue3bara/Cairo
- [S22] MDC-Android docs — Shape theming (corner scale incl. 20/32/48) — https://github.com/material-components/material-components-android/blob/master/docs/theming/Shape.md
- [S23] Material 3 — Shape overview & principles (35 shapes, morphing) — https://m3.material.io/styles/shape/overview-principles
- [S24] androidx MaterialShapes.kt — https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/MaterialShapes.kt
- [S25] MDC-Android docs — Motion theming (spring, duration, easing tokens) — https://github.com/material-components/material-components-android/blob/master/docs/theming/Motion.md
- [S26] androidx ExpressiveMotionTokens.kt / StandardMotionTokens.kt / MotionScheme.kt — same tokens directory as [S16]
- [S27] Material 3 — Motion overview (motion physics, schemes) — https://m3.material.io/styles/motion/overview
- [S28] Material 3 — Transition patterns — https://m3.material.io/styles/motion/transitions/transition-patterns
- [S29] Android Developers — Add support for the predictive back gesture — https://developer.android.com/guide/navigation/custom-back/predictive-back-gesture
- [S30] Android Developers — Behavior changes: apps targeting Android 16 (edge-to-edge opt-out removed, predictive back default) — https://developer.android.com/about/versions/16/behavior-changes-16
- [S31] Android Developers — Behavior changes: apps targeting Android 15 (edge-to-edge enforcement) — https://developer.android.com/about/versions/15/behavior-changes-15
- [S32] Android Developers — Display content edge-to-edge in views — https://developer.android.com/develop/ui/views/layout/edge-to-edge
- [S33] MDC-Android docs — Predictive back — https://github.com/material-components/material-components-android/blob/master/docs/foundations/PredictiveBack.md
- [S34] MDC-Android docs — Navigation bar (BottomNavigation.md, incl. Expressive changes) — https://github.com/material-components/material-components-android/blob/master/docs/components/BottomNavigation.md
- [S35] Material 3 — Navigation bar guidelines — https://m3.material.io/components/navigation-bar/guidelines
- [S36] Material 3 — Navigation bar specs — https://m3.material.io/components/navigation-bar/specs
- [S37] MDC-Android docs — Navigation rail (incl. Expressive 96 dp, expanded rail) — https://github.com/material-components/material-components-android/blob/master/docs/components/NavigationRail.md
- [S38] MDC-Android — Top app bar docs and appbar tokens.xml (64/112/152; flexible 112/120; 136/152 with subtitle) — https://github.com/material-components/material-components-android/blob/master/docs/components/TopAppBar.md ; https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/appbar/res/values/tokens.xml
- [S39] MDC-Android docs — FloatingActionButton.md, FloatingActionButtonMenu.md, ExtendedFloatingActionButton.md — https://github.com/material-components/material-components-android/tree/master/docs/components
- [S40] Material 3 — FAB menu guidelines — https://m3.material.io/components/fab-menu/guidelines
- [S41] MDC-Android — CommonButton.md and button tokens.xml (XS–XL icon sizes, paddings, shapes) — https://github.com/material-components/material-components-android/blob/master/docs/components/CommonButton.md ; https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/button/res/values/tokens.xml
- [S42] MDC-Android docs — ButtonGroup.md, SplitButton.md, IconButton.md — https://github.com/material-components/material-components-android/tree/master/docs/components
- [S43] Material 3 — Button groups guidelines — https://m3.material.io/components/button-groups/guidelines
- [S44] MDC-Android docs — FloatingToolbar.md, DockedToolbar.md — https://github.com/material-components/material-components-android/tree/master/docs/components
- [S45] Material 3 — Toolbars guidelines — https://m3.material.io/components/toolbars/guidelines
- [S46] MDC-Android docs — Chip.md — https://github.com/material-components/material-components-android/blob/master/docs/components/Chip.md
- [S47] MDC-Android docs — Card.md — https://github.com/material-components/material-components-android/blob/master/docs/components/Card.md
- [S48] MDC-Android docs — Dialog.md; androidx AlertDialog.kt (280/560, 24 dp padding) — https://github.com/material-components/material-components-android/blob/master/docs/components/Dialog.md
- [S49] MDC-Android docs — BottomSheet.md — https://github.com/material-components/material-components-android/blob/master/docs/components/BottomSheet.md
- [S50] MDC-Android docs — Snackbar.md — https://github.com/material-components/material-components-android/blob/master/docs/components/Snackbar.md
- [S51] MDC-Android docs — Switch.md — https://github.com/material-components/material-components-android/blob/master/docs/components/Switch.md
- [S52] MDC-Android docs — ProgressIndicator.md, LoadingIndicator.md — https://github.com/material-components/material-components-android/tree/master/docs/components
- [S53] Material 3 — Progress indicators guidelines — https://m3.material.io/components/progress-indicators/guidelines
- [S54] androidx LoadingIndicator.kt (polygon sequence, 650 ms, 4666 ms rotation) — https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/LoadingIndicator.kt
- [S55] MDC-Android docs — Tabs.md — https://github.com/material-components/material-components-android/blob/master/docs/components/Tabs.md
- [S56] MDC-Android docs — Search.md — https://github.com/material-components/material-components-android/blob/master/docs/components/Search.md
- [S57] MDC-Android docs — Carousel.md; androidx carousel/Carousel.kt (40–56 dp small items) — https://github.com/material-components/material-components-android/blob/master/docs/components/Carousel.md
- [S58] androidx Menu.kt (48 dp items, 112–280 dp) — https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Menu.kt
- [S59] androidx pulltorefresh/PullToRefresh.kt (80 dp threshold) — https://github.com/androidx/androidx/blob/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/pulltorefresh/PullToRefresh.kt
- [S60] Android Developers — Use window size classes — https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes
- [S61] Material 3 — Applying layout: window size classes, compact (16 dp margins), medium (24 dp) — https://m3.material.io/foundations/layout/applying-layout/window-size-classes ; https://m3.material.io/foundations/layout/applying-layout/compact ; https://m3.material.io/foundations/layout/applying-layout/medium
- [S62] Android Developers — Build adaptive navigation (NavigationSuiteScaffold) — https://developer.android.com/develop/ui/compose/layouts/adaptive/build-adaptive-navigation
- [S63] AOSP core dimens.xml (status_bar_height 24, navigation_bar_height 48, taskbar 56) and NavigationBarModeGesturalOverlay dimens.xml (24 / frame 48 / gesture 32) — https://github.com/aosp-mirror/platform_frameworks_base/blob/main/core/res/res/values/dimens.xml ; https://github.com/aosp-mirror/platform_frameworks_base/blob/main/packages/overlays/NavigationBarModeGesturalOverlay/res/values/dimens.xml
- [S64] GSMArena — Samsung Galaxy A55 full specifications — https://www.gsmarena.com/samsung_galaxy_a55-12824.php
- [S65] Samsung Mobile Press — Galaxy A55 5G specs — https://www.samsungmobilepress.com/media-assets/galaxy-a55-5g?tab=specs
- [S66] YesViz — Samsung Galaxy A55 viewport (412×892 @2.625) — https://yesviz.com/devices/samsung-a55/ ; DeviceAtlas — Viewport, resolution, diagonal screen size and DPI for the most popular smartphones — https://deviceatlas.com/blog/viewport-resolution-diagonal-screen-size-and-dpi-most-popular-smartphones
- [S67] Samsung Developer — One UI design overview and Basic layout — https://developer.samsung.com/one-ui/index.html ; https://developer.samsung.com/one-ui/layout/basic.html
- [S68] Samsung Newsroom — Samsung Announces Official Rollout of One UI 7 Starting From April 7 (2025) — https://news.samsung.com/us/samsung-one-ui-7-announces-official-rollout-starting-from-april-7-2025/
- [S69] Samsung Support — Set up the Now brief and Now bar on your Galaxy device — https://www.samsung.com/us/support/answer/ANS10004605/
- [S70] Samsung Newsroom — Samsung Begins Official Rollout of One UI 8 to Galaxy Devices (Sep 2025) — https://news.samsung.com/global/samsung-begins-official-rollout-of-one-ui-8-to-galaxy-devices
- [S71] SamMobile — Stable One UI 8 update for Galaxy A55 is out now (Oct 2025) — https://www.sammobile.com/news/stable-one-ui-8-update-galaxy-a55-out-now/ ; Android Headlines — Galaxy A55 and A35 Get One UI 8.5 in Big Rollout Expansion (May 2026) — https://www.androidheadlines.com/2026/05/samsung-one-ui-8-5-rollout-expansion-galaxy-devices.html
- [S72] 9to5Google — Liquid Glass-like redesigns coming to your Samsung Galaxy phone next year (9 Dec 2025) — https://9to5google.com/2025/12/09/samsung-one-ui-8-5-liquid-glass-inspiration/
- [S73] 9to5Google — One UI 8 versus Android 16's Material 3 Expressive (29 May 2025) — https://9to5google.com/2025/05/29/one-ui-8-versus-android-16/
- [S74] SamMobile — One UI 6's new font (One UI Sans) not looking good? Switch back to the old one — https://www.sammobile.com/news/one-ui-6-new-font-not-looking-good-switch-back-old-one/
- [S75] Google — Material Symbols guide and material-design-icons README (axes) — https://developers.google.com/fonts/docs/material_symbols ; https://github.com/google/material-design-icons
- [S76] Material 3 — Designing icons — https://m3.material.io/styles/icons/designing-icons
- [S77] Lucide — Icon design guide — https://lucide.dev/contribute/icon-design-guide
- [S78] material-web ripple implementation (ripple.ts, _ripple.scss) — https://github.com/material-components/material-web/tree/main/ripple/internal
- [S79] Material 3 — Gestures — https://m3.material.io/foundations/interaction/gestures
- [S80] Android Developers — Haptics design principles; AOSP HapticFeedbackConstants.java — https://developer.android.com/develop/ui/views/haptics/haptics-principles ; https://github.com/aosp-mirror/platform_frameworks_base/blob/main/core/java/android/view/HapticFeedbackConstants.java
- [S81] Android Developers — Accessibility in Compose: key steps (48 dp, 4.5:1 / 3:1) — https://developer.android.com/guide/topics/ui/accessibility/apps
- [S82] Android Developers — Android 14 features: non-linear font scaling to 200% — https://developer.android.com/about/versions/14/features
- [S83] web.dev — prefers-reduced-motion: Sometimes less movement is more — https://web.dev/articles/prefers-reduced-motion
- [S84] Material 3 — Bidirectionality & RTL; Material (M1) — Bidirectionality — https://m3.material.io/foundations/layout/bidirectionality-rtl ; https://m1.material.io/usability/bidirectionality.html
- [S85] Chrome for Developers — Edge-to-edge on Android (Chrome 135, viewport-fit, safe-area-max-inset) — https://developer.chrome.com/docs/css-ui/edge-to-edge
- [S86] CSS Environment Variables Module Level 1 (safe-area-inset-*) — https://drafts.csswg.org/css-env-1/
- [S87] web.dev — Add a web app manifest (display modes, theme_color) — https://web.dev/articles/add-manifest
- [S88] caniuse — CSS color-mix() — https://caniuse.com/mdn-css_types_color_color-mix
- [S89] material-web README (maintenance mode), discussion #5642 (10 Jun 2024), issue #5888 — https://github.com/material-components/material-web ; https://github.com/material-components/material-web/discussions/5642 ; https://github.com/material-components/material-web/issues/5888
- [S90] Beer CSS — https://github.com/beercss/beercss ; mdui — https://github.com/zdhxiong/mdui ; m3-svelte — https://github.com/KTibow/m3-svelte ; m3-expressive-web — https://github.com/lobsterbs/m3-expressive-web ; material-esm/material — https://github.com/material-esm/material
- [S91] material-color-utilities (npm `@material/material-color-utilities`) — https://github.com/material-foundation/material-color-utilities ; Material Theme Builder — https://material-foundation.github.io/material-theme-builder/
- [S92] Material Tailwind v3 — https://www.material-tailwind.com/blog/introducing-material-tailwind-v3-pro
- [S93] 9to5Google — Material 3 Expressive navigation changes (14 May 2025) — https://9to5google.com/2025/05/14/material-3-expressive-navigation/
