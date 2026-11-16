# Platform pattern audit — iOS & Android skins vs. the current platform direction

Audit date **2026-11-15**. Scope: `.claude/skills/wael-mobile-ios/{SKILL.md,references/recipes.md}`,
`.claude/skills/wael-mobile-android/{SKILL.md,references/recipes.md}`, `docs/mobile/{ios-patterns,android-patterns,trends-2026,device-specs}.md`,
`src/features/mobilegame/platformUi.ts` (plus the landscape insets in `MobileGameLayout.tsx`, which `platformUi.ts` depends on).
Report only — none of those files was edited.

Verdicts: ✅ current · ⚠️ partly outdated / needs nuance · ❌ outdated or wrong · ❓ not verifiable from a primary source.
Source tags: **[P]** primary (Apple / Google / Samsung docs, release notes, token files) · **[S]** secondary (press, community measurement) only.
Pages read through Apple's DocC JSON (`developer.apple.com/tutorials/data/design/human-interface-guidelines/<page>.json`) carry their own change logs; dates below are those.

---

## 1. Summary

**iOS: mostly current, with three structural gaps.** The iOS 26 → 27 story, type scale, targets, tab-bar rules, sheet button placement and haptics all still match Apple's guidance. Three things fall behind: (a) partial-height sheets in iOS 26+ are *inset, floating Liquid Glass*, not full-width opaque panels; (b) the HIG's June 2026 scroll-edge update prefers the *automatic, more opaque* style, and iOS 27 adds a uniform bar background when content scrolls under floating bars, so a transparent header with "no fill" is no longer the default; (c) menus, popovers and source-anchored action sheets are glass and inline in iOS 26+, which the skill's "no glass on menus" and bottom action-sheet rules don't reflect. The pixel numbers (64 pt capsule, 38 pt sheet, 51 × 31 switch, 44/12 input) have no Apple source. Measure them in the iOS 27 UI kit.

**Android: specs current, version framing out of date.** Navigation bar, sheet, switch, button, state-layer, spring and shape numbers match the Material token sources. The framing has moved on: the Galaxy A55 started getting **One UI 9 / Android 17** on 21 Oct 2026, Pixels are on **Android 17 QPR1** (Sept 2026), and Compose Material 3 1.5.0 (rc01, 4 Nov 2026) has made most Expressive APIs non-experimental. Two pattern updates are missing: the Expressive **vertical menu**, which has rounded corners, tonal selection and gaps (the 4 dp baseline menu is still allowed), and One UI 8.5/9's **floating tab bar** in Samsung's own apps.

**Landscape and games: missing entirely.** `/mobilegame` is landscape-first, but neither skill says anything about compact height, landscape insets, immersive mode, iPhone Duo's vertical bars, Android 17's orientation override (and its games exemption) or Apple's games and touch-control guidance.

### Top 10 fixes, ranked by impact

1. **iOS sheets.** Medium/custom detents are inset from the screen edges on a Liquid Glass background, with corners following the device. At the large detent the sheet goes opaque and attaches to the edges. Fix rule 6 ("never glass on… sheets"), the Sheets row and recipe 4 (full-width `bg-v2-surface`).
2. **iOS headers / scroll edge.** Replace "transparent, no fill, soft band" with Apple's *automatic* scroll-edge style: more opaque when text such as the collapsed title sits outside glass controls. iOS 27 also draws a uniform toolbar background when content scrolls under floating bars.
3. **Add landscape and games guidance** to both skills and to `platformUi.ts`. Phones in landscape are *compact height* (< 480 dp). That means no iOS large title in compact height, tab-bar labels beside icons, top app bar optional (Android sample code hides it), immersive mode for games on Android, side-axis bars on iPhone Duo, a 44 pt / 28 pt control floor (Apple games), and the Android 17 orientation override (`appCategory="game"` is exempt).
4. **Android version framing.** "One UI 8.5 on the A55, Oct 2026" → One UI 9 (Android 17), stable from 21 Oct 2026 in Korea and then India; a global or European date is unconfirmed. Samsung's design barely changed from 8.5. Pixels run Android 17 QPR1. "Android 16 QPR1 folded into Android 17" should say M3E shipped in 16 QPR1 (Sept 2025) and carried into 17.
5. **`platformUi.ts` iOS secondary button (44) vs CTA (50).** Apple: "Use style — not size — to visually distinguish the preferred choice". The skill's recipe 5 also makes the secondary 50. Align both buttons, at 50 (or 44 together in a compact-height landscape row). Also make `back` a 44 pt glass circle, as iOS 26+ draws bar buttons on glass.
6. **iOS menus and action sheets.** In iOS 26+ context menus and popovers use the regular Liquid Glass material. An action sheet started from a control appears *over the originating view*, with no Cancel row. Update rules 6, 14 and 15 and recipe 9, or record them as deliberate deviations.
7. **Android menus.** M3 Expressive *vertical menus* (Nov 2025; Compose expressive menu APIs promoted May 2026) use rounded corners, a `surface-container-low` container, `tertiary-container` selection and gaps instead of dividers. Keep the baseline 4 dp menu only as a stated choice.
8. **iOS tab-bar geometry.** A secondary measurement of the iOS 26 kit gives a **21 pt** inset from left, right *and bottom* (the home-indicator box). Ours is 16 sides and `--sai-bottom + 8` = 42 pt from the bottom edge, so the bar floats about 20 pt too high. The label is measured as 11 pt **regular**; ours is semibold. Verify in the iOS 27 kit.
9. **One UI's floating tab bar.** Samsung's own apps (Phone, Gallery, My Files…) use a floating, translucent pill bar in One UI 8.5/9. The skill's "docked and tonal, not floating glass" is right for stock M3E but not "as One UI shows it on a Galaxy". Choose one and state why.
10. **Internal contradictions to clean up.** Android checklist (SKILL L240) says the bar hides "still under reduced motion", while rule L120/L161 says never. `ios-patterns.md` rule 6 still prescribes tab-bar minimise on scroll, which the skill and the HIG reject. `ios-patterns.md` uses a 24 px panel radius vs the skill's 22. `trends-2026.md` says "Rubik variable" while the skills say Cairo only. `android-patterns.md` rule 6 lists a profile tab that the skill removed.

---

## 2. iOS — claim by claim

| Claim | File:line | Verdict | Current fact | Source |
|---|---|---|---|---|
| iOS 26 introduced Liquid Glass; iOS 27 kept it | ios SKILL:3,8 · ios-patterns:18-23 | ✅ | iOS 27 released **14 Sep 2026**; 27.0.1 on 28 Sep; iPhone Duo ships with 27.1 (23 Oct 2026). Same device support as iOS 26 (iPhone 11+), so the 13 Pro Max frame is still a valid iOS 27 device | [S] iPhoneinCanada 2026-09-09; MacRumors 2026-09-09; 9to5Mac 2026-06-08 |
| iOS 27 "sturdier glass (darker edge, less transparency)" | ios SKILL:10 | ✅ | "darkened edge", "brighter specular highlights", glass "more effectively diffuses complex content"; user slider "ultra clear to fully tinted"; existing apps get it without recompiling | [S] MacRumors 2026-06-10 (quotes Apple); Apple newsroom cited in ios-patterns S-20 |
| iOS 27 "opt-out gone" | ios SKILL:11 | ⚠️ | `UIDesignRequiresCompatibility` is ignored only when the app is **linked against the iOS 27 SDK**. Apps built with the 26 SDK keep the opt-out on iOS 27 devices. No SDK-requirement date announced (Apple DTS, forums). Irrelevant to the web skin, but the wording is too absolute | [P] Apple Developer Forums 832543 (DTS reply) |
| Floating glass tab-bar capsule | ios SKILL:46,98 | ✅ | HIG: "A tab bar floats above content at the bottom of the screen. Its items rest on a Liquid Glass background" | [P] HIG Tab bars (upd. 2026-06-08) |
| Capsule **64 pt** tall | ios SKILL:98 · recipes:29 · ios-patterns:119 | ❓ | Apple publishes no iOS tab-bar height (the HIG's only number, 68 pt, is tvOS). Community figures range 62–64 | [P] HIG Tab bars; [S] Codefronts, Apple forums 796299 |
| 16 pt side margins, bottom edge at `--sai-bottom + 8` | ios SKILL:98 · recipes:29-30 | ⚠️ | Measured from Apple's iOS 26 kit: bar inset **21 pt left, right and bottom**, inside the 21 pt home-indicator box. Ours sits about 42 pt off the bottom edge | [S] Learn UI Design (upd. 2026-04-22) |
| Five tabs, single-word labels, never hide/disable, no More | ios SKILL:98,133-135 | ✅ | HIG: single words, "Don't disable or hide tab bar buttons", "Avoid overflow tabs"; "aim for a default list of five or fewer"; the trailing tab becomes More when space runs out | [P] HIG Tab bars |
| Labels 11 **semibold** | ios SKILL:98 | ⚠️ | Kit measurement: tab labels 11 pt **regular**. 11 pt is the platform minimum (confirmed) | [S] Learn UI Design; [P] HIG Designing for games (11 pt min) |
| No minimise on scroll (only with an accessory) | ios SKILL:98 · recipes:50-52 | ✅ | HIG: "For tab bars with an attached accessory… you can choose to minimize the tab bar" | [P] HIG Tab bars |
| Selected tab tinted (brand teal) | ios SKILL:98,154 | ✅ | HIG Branding (2026-09-09): use brand colour "for primary actions or status indicators… an icon for the selected tab"; "consider moving it into the content layer" | [P] HIG Branding |
| iOS 27 prominent tab pinned to trailing edge | ios-patterns:22,77 | ✅ | `UITabBarController.prominentTabIdentifier` exists in the iOS 27 SDK. The HIG calls the search variant "button appearance", not "prominent" | [S] ikyle.me UIKit iOS 27 diff; [P] HIG Search fields (2026-06-08) |
| Inline search under large title, 36 pt capsule | ios SKILL:147 · recipes:229 | ✅ / ❓ | Placement endorsed: "position an inline search field above the list it searches, and consider pinning it to the top toolbar". HIG also says "Place search at the bottom if there's room". 36 pt has no Apple source | [P] HIG Search fields |
| Large title 34 pt → 44 pt bar; large-title bar 96 | ios SKILL:101,143 · ios-patterns:118 | ✅ / ❓ | 34/41 Large Title confirmed (Dynamic Type table). 44 / 96 are classic UIKit metrics with no current Apple number. iOS 27 adds `UINavigationItem.barMinimizeBehavior` (nav bars can minimise on scroll) | [P] HIG Typography; [S] ikyle.me |
| Header transparent with soft scroll-edge band, "no fill, no border" | ios SKILL:144-145 · recipes:74-75 · ios-patterns:393 | ⚠️ | HIG (2026-06-08): "Prefer the automatic scroll edge effect style… more opaque visual separation for top toolbars that contain… text that appears outside of Liquid Glass controls". Soft style only after testing legibility. iOS 27: "a uniform toolbar now appears across the top when content scrolls under floating bars" | [P] HIG Scroll views; [S] MacRumors 2026-06-10 |
| Sheets: grabber, medium/large detents, swipe to dismiss, tap grabber cycles detents | ios SKILL:105,160 · recipes:137-139 | ✅ | HIG Sheets, verbatim | [P] HIG Sheets (upd. 2026-03-24) |
| Sheets: Cancel leading, Done trailing; never all three | ios SKILL:160 · recipes:143-156 | ✅ | Confirmed. Added in 2026-03: "If you provide a Done button, always pair it with a Cancel button… or a Back button". A Done-only sheet is wrong, and so is a read-only sheet with "سكّر" only *if* it also has Done | [P] HIG Sheets |
| Sheet top radius **38**, full-width at medium | ios SKILL:9,103,105 · recipes:135-136 | ❌ (shape) / ❓ (38) | iOS 26+: partial-height sheets "appear to float", edges "don't touch the screen", corners "follow the shape of the device", **Liquid Glass background by default**; at the large detent they go opaque and attach to the edges. No Apple radius value | [S] Nil Coalescing; ios-patterns:57-58 (WWDC25 S-3, S-10) already says "half sheets are inset" |
| Glass only on chrome; never on menus / sheets | ios SKILL:139-142 · recipes:260-261 | ⚠️ | "Don't use Liquid Glass in the content layer" still holds. But in iOS 26+ sheets (partial height), popovers, menus and alerts sit on regular glass. Apple lists alerts and popovers among regular-glass uses | [P] HIG Materials (ios-patterns S-1, S-2) |
| Destructive → action sheet from the bottom with separate Cancel | ios SKILL:162 · recipes:270-279 | ⚠️ | iOS 26: action sheets "appear directly over the originating view", with no Cancel when inline. The bottom-anchored form remains for sheets not tied to a control. HIG: confirm unsaved-changes dismissal with an action sheet (unchanged) | ios-patterns:60 (WWDC25 S-9); [P] HIG Sheets |
| Context menu radius 13, no glass | ios SKILL:103,164 | ⚠️ | Menus in iOS 26 are glass with a larger radius (Apple gives no number). HIG Menus updated 2026-06-08 (menu item icons). ≤ 3 groups, destructive last, hide unavailable items: still current | [P] HIG what's-new log; ios-patterns S-17 |
| Back: chevron pointing right in RTL, 44 pt | ios SKILL:99,145 · recipes:292-305 | ⚠️ | RTL direction correct (HIG RTL). iOS 26+ draws bar buttons, including back, as a chevron in a **glass circle**. Recipe 10's text label "رجوع" is a web-look leftover. Ios-patterns rule 9 already says "glass circle" | ios-patterns:394; [P] HIG Right to left |
| CTA 50 pt capsule; one prominent action | ios SKILL:104,152 | ❓ / ✅ | HIG: "Keep the number of prominent buttons to one or two per view". Large controls are capsules. 50 pt is a kit measurement (Apple prints no iOS button heights) | [P] HIG Buttons |
| Form input 44 pt, radius 12; text ≥ 16 px | ios SKILL:104 · recipes:243-244 | ❓ / ✅ | 44/12 unsourced. Safari's < 16 px input zoom still applies | ios-patterns S-43 |
| Switch 51 × 31, thumb 27 | ios SKILL:104 · recipes:210 | ❓ | Classic UIKit size. WWDC25 says iOS 26 control sizes were "updated slightly". No current Apple number; community reports differ. Measure in the iOS 27 kit | ios-patterns S-9, S-38 |
| Switch only in list rows | ios SKILL:157 | ✅ | HIG Toggles | ios-patterns S-37 |
| Segmented 32 track in 44 hit | ios SKILL:104 | ❓ | No Apple number; capsule selection is current | — |
| Targets 44 × 44, floor 28 | ios SKILL:102 | ✅ | HIG games tables: iOS default 44 × 44, minimum 28 × 28; game controls: frequent ≥ 44, menus ≥ 28 | [P] HIG Designing for games; Game controls |
| Content margin 16 (Apple 20 at this width) | ios SKILL:102 | ✅ (documented deviation) | HIG Layout (2026-09-09) prints no margins and no longer carries device spec tables | [P] HIG Layout |
| Dynamic Type Large scale (34/28/22/20/17/16/15/13/12/11) | ios SKILL:117-121 · ios-patterns:137-149 | ✅ | Unchanged; emphasized weights added 2025-12-16 | [P] HIG Typography |
| Cairo as the only family | ios SKILL:124 | ⚠️ (allowed) | HIG Branding: a custom font must support Bold Text and Dynamic Type; "custom font for headlines… system fonts for body copy". On the web, `system-ui` resolves to SF Arabic on Apple devices: an option for body text, not a rule | [P] HIG Branding |
| `--ts` 1.6 (N = pt ÷ 1.6) | ios SKILL:112 | ✅ (internal) | Project convention, arithmetic consistent (17 / 1.6 = 10.6) | — |
| Glass recipe: 70 % + blur 22 + saturate 170 %, reduced-transparency fallback | ios SKILL:106 | ✅ | Web approximation; HIG says Reduce Transparency makes glass frostier and Increase Contrast adds borders. Also honour `prefers-contrast: more` (iOS 27 "show borders") | ios-patterns S-2, S-21 |
| Motion: brief, cancellable, reduced-motion → fades | ios SKILL:107,170 | ✅ | HIG Motion / Accessibility | ios-patterns S-49, S-18 |
| Contrast 4.5 : 1 / 3 : 1, dark 7 : 1 small text | ios SKILL:108 | ✅ | HIG Accessibility / Dark Mode | ios-patterns S-18, S-45 |
| Haptic patterns → cue table | ios SKILL:194-204 | ✅ | Feedback-generator meanings unchanged | ios-patterns S-51 |
| iPhone 13 Pro Max 428 × 926, insets 47/34, landscape 47/47/21 | ios SKILL:97 · device-specs:27 · MobileGameLayout:53 | ✅ [S] | Community-measured; Apple's Layout page no longer lists device sizes | [S] useyourloaf (device-specs) |
| iOS 27 kit and SF Symbols 27 exist | ios SKILL:101 · ios-patterns:367 | ✅ | Design Resources lists "iOS 27 and iPadOS 27 UI Kit", "SF Symbols 27", SF Arabic. Product bezels: iPhone Duo, 18, 17, 16 | [P] Apple Design Resources |
| iOS 26 tab bars "shrink while scrolling" (as a trend) | trends-2026:32,38 | ⚠️ | Only when the bar has an accessory | [P] HIG Tab bars |
| Tab bar minimises after 24 px to 52 px | ios-patterns:389 (rule 6) | ❌ | Contradicts the HIG (accessory only) and the skill (L98) | [P] HIG Tab bars |
| Panel radius 24 | ios-patterns:398,416,429 | ⚠️ | The skill moved to 22 (concentric with 38 − 16). Docs stale | internal |
| "iOS 27 adds nothing for Home-Screen web apps" | trends-2026:68 | ❓ | Not verified from WebKit release notes | — |

## 3. Android — claim by claim

| Claim | File:line | Verdict | Current fact | Source |
|---|---|---|---|---|
| M3 Expressive announced May 2025 | android SKILL:8 · android-patterns:9 | ✅ | 13 May 2025 | android-patterns S1, S2 |
| "Android 16 QPR1, folded into Android 17 in June 2026" | android SKILL:8-9 | ⚠️ | M3E system UI shipped on Pixel with **Android 16 QPR1 (Sept 2025)**. **Android 17 stable 16 Jun 2026**. **Android 17 QPR1 on Pixels from mid-Sept 2026** (more blur: volume panel, power menu, folders). QPR2 expected Dec 2026 | [S] Android Authority, 9to5Google 2026-09-15; android-patterns S9 |
| "One UI 8.5 shows it on the A55" / "Oct 2026" | android SKILL:3,11 · android-patterns:146 | ⚠️ | A55: One UI 8.5 stable late May 2026. **One UI 9 (Android 17) stable from 21 Oct 2026** (Korea), then India; no confirmed European date as of 23 Oct. Design "not a lot… fundamentally different compared to One UI 8.5" | [S] Android Authority 2026-10-21; TechRepublic 2026-10-23; SamMobile 2026-05-14 |
| One UI 9 / Android 17 for the A55 "Oct 2026 (verify)" | device-specs:71 | ✅ | Verified (Korea 21 Oct 2026) | [S] Android Authority |
| Chrome "docked and tonal, not floating glass" | android SKILL:54 · recipes:79 | ⚠️ | Correct for stock M3E. But One UI 8.5+ Samsung apps (Phone, Gallery, Quick Share, My Files) use a **floating, translucent pill "tab bar"**, and the One UI 9.5 leaks push further. Recipe 2's "One UI 8.5's translucency is the system's, not the app's" is no longer accurate | [S] Gizmochina 2026-05-19; Beebom; Android Authority hands-on |
| Material Expressive status | android-patterns:20 | ⚠️ | Compose Material 3 latest stable still 1.4.0; **1.5.0-rc01 (4 Nov 2026)**. App bars, FAB/FAB menu, buttons, button group, split button, floating toolbar, expressive lists and menus, search bar all graduated during the 1.5 alphas. `MaterialShapes` / `LoadingIndicator` promotions were reverted | [P] Compose Material3 release notes |
| Nav bar 64 dp, pill 56 × 32, label not bold, `secondary-container` pill, 3–5 destinations | android SKILL:120 · recipes:32-38 | ✅ | MDC: "Height: From 80dp to 64dp"; indicator 56 × 32; "Expressive removes the bolding"; active label → `secondary`; 3–5 items | [P] MDC BottomNavigation.md |
| Nav bar container `surface-container` | android SKILL:120 | ✅ (nuance) | Attribute table `colorSurfaceContainer`; the Views style table says `colorSurface` (inconsistent upstream) | [P] MDC BottomNavigation.md |
| Hide on scroll-down, never with reduced motion | android SKILL:120,161 | ✅ | Permitted by M3 (not with a screen reader) | android-patterns S35 |
| Checklist: hides "still under reduced motion" | android SKILL:240 | ❌ | Contradicts L120/L161 (typo for "never") | internal |
| Top app bar 64; headline 28 sp collapsing (flexible medium 112 → 64) | android SKILL:121 | ✅ | `MediumFlexibleTopAppBar` graduated in 1.5.0-alpha23 | [P] Compose release notes; android-patterns S38 |
| Targets ≥ 48 dp; icon buttons 40 in 48; chips 32 in 48 | android SKILL:122 | ✅ | — | android-patterns S81, S46 |
| Shape scale 4/8/12/16/28/full | android SKILL:59,123,167 | ⚠️ | Missing the M3E steps **20** (large-increased; medium FAB), 32, 48. Research rule 4 includes 20 | android-patterns S22 |
| Lists 56/72/88, grouped 16 radius, 2 dp gaps | android SKILL:124 · recipes:103-124 | ✅ | Expressive list items graduated (1.5.0-alpha23), plus "segmented list item" variants | [P] Compose release notes |
| Buttons 40, prominent 56; button group 2 dp gaps, inner 8 | android SKILL:125 | ✅ | M3E S = 40, M = 56; `ButtonGroup` stable in 1.5 | [P] Compose release notes; android-patterns S41 |
| Search 56 dp `surface-container-high`; no full-screen view | android SKILL:125,173 | ✅ | Slot-based `SearchBar` stable (alpha24). Expressive "search app bar" (thicker, menu/avatar outside the bar) in Google apps | [P] Compose release notes; [S] 9to5Google |
| Switch 52 × 32, thumb 16/24/28 | android SKILL:125 · recipes:211-214 | ✅ | Colours confirmed (track `primary` / `surfaceContainerHighest`, outline `colorOutline`, thumb `onPrimary` / `outline`); icon 16 | [P] MDC Switch.md; android-patterns S16 |
| Text field 56 | android SKILL:125 · platformUi:71 | ✅ | Outlined field corner extra-small 4 dp | android-patterns S16 |
| Sheets 28 dp, `surface-container-low`, handle 32 × 4 in 48, scrim 32 %, max width 640 | android SKILL:56,126 | ✅ | MDC: shape `cornerExtraLarge` (28), `colorSurfaceContainerLow`, handle min 48 dp, max width 640, modal predictive back built in | [P] MDC BottomSheet.md |
| Sheets max height 90 % | android SKILL:126 | ❓ | Not a Material rule (project choice) | — |
| Menus 4 dp, 48 dp rows, `surface-container` | android SKILL:59,193 · recipes:253-283 · android-patterns:110 | ⚠️ | Baseline menu still valid (`MenuTokens.ContainerShape = CornerExtraSmall`, `SurfaceContainer`). M3E **vertical menus** (Nov 2025; expressive menu APIs promoted 1.5.0-alpha19): rounded container (value not confirmed from a primary source), `SurfaceContainerLow` container, `TertiaryContainer` selected item, gaps instead of dividers ("limit… one or two per menu"), "vibrant" variant | [P] androidx MenuTokens.kt, StandardMenuTokens.kt; [S] 9to5Google 2025-11-22 |
| State layers 8/10/10/16; disabled 38 / 12 | android SKILL:127 | ✅ | — | android-patterns S15, S16 |
| Ripple 12 %, 320 ms from centre | android SKILL:127 · recipes:316-331 | ⚠️ (documented deviation) | Material web ripple grows from the touch point over 450 ms with a 150 ms touch delay; the skill acknowledges this | android-patterns S78 |
| Spring tokens (0.6/800, 0.8/380, 0.8/200; effects 1.0/3800/1600/800) | android SKILL:128 · recipes:356-381 | ✅ | Token values as cited. Millisecond conversions are ours | android-patterns S26 |
| Contrast 4.5 / 3; icons 3 : 1 | android SKILL:129 | ✅ | — | android-patterns S81 |
| Type scale & `--ts` 1.55 | android SKILL:133-149 | ✅ | Scale unchanged; 16 / 1.55 = 10.3 consistent | android-patterns S18, S19 |
| FAB 56, `rounded-2xl`; FAB menu replaces speed dial | android SKILL:201 | ✅ | FAB / FAB menu graduated (1.5.0-alpha19) | [P] Compose release notes |
| Linear progress 4 dp, gap, stop dot; loading indicator for 0.2–5 s | android SKILL:196 · recipes:290-312 | ✅ | `WavyProgressIndicator` promoted; `LoadingIndicator` still experimental | [P] Compose release notes |
| Haptic constants → cues | android SKILL:226-235 | ✅ | `HapticFeedbackConstants` unchanged | android-patterns S80 |
| Status bar 36 (One UI), gesture 24 | android SKILL:51,119 · device-specs:77-79 | ❓ | AOSP 24 / 24 confirmed. One UI values are estimates; measure on a device | android-patterns S63 |
| Galaxy A55 384 × 832 CSS px | android SKILL:119 | ✅ [S] | 1080 / 2.8125 (450 dpi default) | device-specs |
| I/O 2026: expressive layout, 8 dp spacing, contained search | android-patterns:22 | ❓ | Could not load m3.material.io (JS-rendered); no secondary confirmation found | — |
| Android 17: large-screen orientation/resizability ignored at sw ≥ 600 | android-patterns:22 · trends-2026:56 | ✅ | For apps targeting API 37: `screenOrientation`, `resizeableActivity`, min/max aspect ratio ignored on displays with smallest width > 600 dp; Android 16's opt-out removed. **Exceptions: games (`android:appCategory`)**, user opt-in, sw < 600 (phones such as the A55 are unaffected) | [P] Android 17 behaviour change page |
| Google ruled out Liquid Glass; Android 17 system blur toggle | android-patterns:22 · 184 | ❓ / ⚠️ | Press only. Android 17 QPR1 *adds* more system blur | [S] |
| "Samsung's One UI 7/8 does **not** adopt M3E" | trends-2026:34 | ⚠️ | Conflicts with the skill's premise ("M3E as One UI shows it"). One UI keeps its own components (expandable app bar, floating tab bar). State that the skin is M3E *components* with One UI *layout* (reachability, collapsing title) | internal; [S] |
| One UI 24 dp side margins | trends-2026:34 · device-specs:82 | ⚠️ | From the One UI Design Guidelines PDF, which looks like a One UI 1–2-era document (unverified). Skill uses 16 (M3). Record the choice | device-specs source |
| Five destinations incl. "أنا" profile, apricot pill | android-patterns:218-219 | ⚠️ | Superseded by the skill (five fixed `studentV2Tabs`, lime pill). Docs stale | internal |

## 4. `platformUi.ts` vs. findings

| Line | Value | Verdict | Note |
|---|---|---|---|
| 38 / 58 | `ts` 1.6 / 1.55 | ✅ | Matches both skills |
| 39 | iOS CTA `h-[50px] rounded-full` | ✅ (kit value) | Unverified 50 pt but consistent with the skill |
| 41, 46 | iOS secondary `h-11` (44) | ⚠️ | The skill's recipe 5 gives secondary 50. Apple: "Use style — not size — to visually distinguish the preferred choice". Make it 50 (or both 44 on a compact-height row) |
| 50 | iOS back: plain 44 chevron, no glass | ⚠️ | iOS 26+ bar buttons are glass circles. Add `ios-glass` (game screens sit over art, so the glass also helps legibility). Keep 44 |
| 51 | iOS input `h-11 rounded-xl` (44 / 12) | ❓ | No Apple number; fine as kit approximation |
| 52 / 72 | input text `max(16px, …)` | ✅ | Safari zoom rule |
| 53 / 73 | link `min-h-11` / `min-h-12` | ✅ | 44 / 48 targets |
| 59 | Android CTA `h-14` (56) | ✅ | M3E M button |
| 61, 66 | Android secondary `h-12` outlined (48) | ⚠️ (minor) | M3 outlined S = **40 visual / 48 target**. Next to a 56 primary, M3E favours matching sizes in a row (both M = 56) over 48. Pick 40-in-48 or 56 |
| 70 | Android back `size-12` (48) | ✅ | Icon button S 40 in 48 target |
| 71 | Android input `h-14 rounded-sm` (56 / 4) | ✅ | Outlined text field |
| 35 | focus ring 3 px teal | ✅ | M3 focus indicator is 3 dp (colour `secondary` in M3; teal is our choice) |
| — | No landscape adjustments | ⚠️ | At 384 / 428 px height, a 56 CTA plus 64 bars consume about a third of the screen. Add compact-height variants (see §5) |
| MobileGameLayout:53 | iOS landscape insets 8 / 47 / 47 / 21 | ✅ [S] | Matches community-measured landscape safe areas |
| MobileGameLayout:58 | Android landscape top 8, cutout side 36 | ⚠️ | Correct only if the game hides the status bar (immersive mode). A non-immersive Android app in landscape keeps the status bar across the top (about 24–36 dp) and the cutout inset on the cutout edge. State the assumption |

---

## 5. Missing from our files

**Landscape (both platforms) — needed by `/mobilegame`**
- **Size classes, not orientation.** HIG Layout (upd. 2026-09-09): "Determine layout based on size classes, not device type or orientation"; "Even if your app is locked to… a landscape-only game, it's still important to ensure your interface resizes well". Android: a landscape phone is **compact height (< 480 dp)**, "99.78 % of phones in landscape"; "two pane layouts are not practical"; the sample hides the top app bar below medium height. `NavigationSuiteScaffold` keeps a *navigation bar* when width or height is compact.
- **iOS landscape chrome (UIKit behaviour, [S]).** No large title in compact height (the bar shows the standard title). In regular-width views tab-bar icons and labels sit **side by side** (HIG Tab bars), as on Pro Max landscape.
- **iPhone Duo (HIG page, 2026-09-09; device shipped 23 Oct 2026).** Toolbars and tab bars **move to the side (vertical axis)** in most poses, landscape included. "Reserve the top of the vertical axis for primary navigation controls, like Back or Close, followed by prominent actions, like Done". Games may lock orientation but must "fill the screen as the device pose changes" and prefer changing aspect ratio over letterboxing. "Avoid fixed widths and display-specific dependencies". This is a direct model for a landscape learning game: a side rail with back at the top and the prominent action under it.
- **Android 17 orientation override** (above): phones are unaffected, but tablets and foldables ignore a landscape lock unless the app declares `android:appCategory="game"`. Relevant if `/mobilegame` is ever wrapped with Capacitor.
- **Immersive mode (Android)**: recommended for games and video, `BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE`. Insets must include the caption bar in desktop windowing.

**Games guidance (Apple, primary)**
- HIG *Designing for games*: iOS text default 17 / **minimum 11 pt**. Buttons 44 × 44 default / 28 × 28 minimum. "In-game menus need to remain legible… at various aspect ratios (16:10, 19.5:9, 4:3)". Full-screen, distraction-free. Let players customise type size, motion intensity and sound balance.
- HIG *Game controls*: keep buttons off the Home indicator and Dynamic Island. Frequent controls near the thumb, **secondary controls such as menus at the top**. Frequent ≥ 44 pt, menus ≥ 28 pt. A visible press state "that they can see even when their finger is covering the control", combined "with sound and haptics" (our `uisfx` + `play` lip already fit). Hide controls that aren't currently available.
- Android has no Material games spec. Samsung's Game Booster (One UI 8.5/9) overlays a panel in games, so keep a screen edge free of critical controls (inference).

**Platform changes in 2026 not covered**
- iOS 27: nav-bar minimise (`barMinimizeBehavior`); toolbar `visibilityPriority` + overflow; uniform top-bar background under floating bars; HIG "Design principles" reintroduced (2026-06-08); HIG Branding: brand colour in the content layer, not on controls (2026-09-09); Sheets: "always pair Done with Cancel or Back" (2026-03-24).
- iOS 26 sheet and button roles: partial-height glass sheets (inset). Toolbar symbol buttons are grouped on shared glass.
- Android: M3E **vertical menus**, **segmented / non-interactive list items**, **expressive time picker**, **toggle buttons**, **search app bar**; Compose M3 1.5 graduations; Android 17 QPR1 system blur; One UI 8.5/9 floating tab bar; One UI 9 status-bar network-speed and background-location indicators (system chrome the frame could draw).
- Web: Safari 17.4+ `<input type="checkbox" switch>` renders the native iOS switch *with a real haptic*. Consider it for the iOS skin's list-row switches instead of a `<button role="switch">` (behaviour on Safari 26/27 not re-verified here).

---

## 6. Recommended edits (proposed, not applied)

### `.claude/skills/wael-mobile-ios/SKILL.md`
- **L10-11** — old: "iOS 27 kept it with sturdier glass (darker edge, less transparency, opt-out gone)" → new: "iOS 27 (14 Sep 2026) kept it with sturdier glass — darker edges, brighter highlights, better diffusion, a user slider from ultra clear to fully tinted, and a uniform top-bar background when content scrolls under floating bars; the compatibility opt-out is ignored for apps linked against the iOS 27 SDK".
- **L46-47** — old: "transparent headers whose large title collapses to a 44 px bar, sheets with a grabber and 38 px corners" → new: "headers whose large title collapses to a 44 px bar over Apple's automatic scroll-edge effect, partial-height sheets inset from the screen edges on glass (opaque and edge-attached at the large detent)".
- **L98** — old: "Capsule **64** tall, 16 side margins, bottom edge at `calc(var(--sai-bottom) + 8px)`… label 11 semibold" → new: "Capsule ≈64 tall (no Apple number — measure in the iOS 27 kit), ≈21 pt from the left, right and bottom screen edges (kit measurement), label 11 regular (medium when selected)".
- **L103/105 (Sheets row)** — old: "grabber 36 × 5 at 8 from the top; detents medium ≈ 50 %, large…; dim 40 %" → append: "medium/custom detents: inset ~8–10 px from the sides and bottom, corners following the 53 px display radius, `ios-glass` body; large detent: full width, opaque `bg-v2-surface`, 38 top corners (unverified)".
- **L139-142 (rule 6)** — old: "Never on cards, lists, menus or the page" → new: "Never on cards, lists or the page. Partial-height sheets, menus and popovers are glass in iOS 26+ (regular variant, opaque text rows inside); never glass on glass; never small text directly on clear glass".
- **L143-145 (rule 7)** — old: "transparent with a scroll-edge fade — no fill, no border" → new: "the scroll-edge effect is Apple's *automatic* style — opaque enough behind the collapsed title (text outside glass controls); soft fade only where nothing but glass buttons sits in the bar; no border".
- **L162-163 (rule 14)** — old: "Destructive choices go through an action sheet (red row first, separate "إلغاء" capsule)" → new: "Destructive choices started from a control open an action sheet anchored over that control (iOS 26: no Cancel row; tap outside cancels); started from a sheet or with no anchor, the bottom action sheet with a separate "إلغاء" capsule".
- **L164 (rule 15)** — old: "Context menus: 13 px radius" → new: "Context menus: glass container, ≈ 22–26 px radius (measure in the kit), 44 px rows with icons".
- **New section "Landscape (compact height)"** — "No large title (standard 44 bar, or none in a full-screen game); tab-bar items icon + label side by side; insets 47 / 47 / 21 on the 13 Pro Max; controls clear of the home indicator and the notch side; on iPhone Duo-style layouts bars move to the side, Back/Close at the top, then the prominent action; frequent controls ≥ 44 pt near the thumbs, menus ≥ 28 pt at the top (HIG Game controls); text ≥ 11 pt".

### `.claude/skills/wael-mobile-ios/references/recipes.md`
- **Recipe 2, L74-75** — replace the "24 px blurred band … no fill" comment and classes with an automatic-style band: `bg-v2-surface/80 backdrop-blur-md` with a short mask (opaque behind the title), shown once collapsed.
- **Recipe 4, L135-136** — old: `rounded-t-3xl … bg-v2-surface … h-[50dvh]` → new: medium = `inset-x-2 bottom-2 rounded-[44px] ios-glass h-[50dvh]`; large = `inset-x-0 bottom-0 rounded-t-3xl bg-v2-surface h-[calc(100dvh-var(--sai-top)-10px)]`.
- **Recipe 5, L168** — keep secondary at 50 (already); add the rule "Primary and secondary in one row share a height — style, not size, marks the preferred choice".
- **Recipe 9, L260-261** — old: "opaque — menus are not chrome, so no glass" → new: "glass container (`ios-glass`), opaque-enough rows; radius from the kit". **L270** — note the anchored (popover) form for control-started confirmations.
- **Recipe 10, L292-305** — old: chevron + "رجوع" text → new: under iOS, a 44 px `ios-glass` circle with `ChevronRight`, label as `aria-label` only.

### `.claude/skills/wael-mobile-android/SKILL.md`
- **L3** — old: "(Material 3 Expressive as Samsung's One UI shows it on a Galaxy, Oct 2026)" → new: "(Material 3 Expressive components with One UI layout, on a Galaxy A55 running One UI 9 / Android 17, Nov 2026)".
- **L8-12** — old: "Material 3 Expressive (May 2025; Android 16 QPR1, folded into Android 17 in June 2026)… One UI 8.5 shows it on the A55" → new: "Material 3 Expressive (announced May 2025; on Pixel since Android 16 QPR1, Sept 2025; carried into Android 17, June 2026, and 17 QPR1, Sept 2026)… One UI 9 (Android 17; A55 stable from 21 Oct 2026, design largely as One UI 8.5) shows it on the A55".
- **L54** — old: "Chrome is docked and tonal, not floating glass" → new: "Chrome is docked and tonal (stock M3E). One UI 8.5+ Samsung apps float a translucent pill tab bar; we keep the docked M3E bar on purpose — [reason]".
- **L59/L123/L167** — old: "4 menus, 8 chips, 12 cards, 16 lists…, 28…, full" → new: add "20 (large-increased: medium FAB)" to the scale and "menus: baseline 4, or the Expressive vertical menu (rounded, `surface-container-low`, `tertiary-container` selection, gaps)".
- **L193** — old: "opening a 4 dp menu with 48 dp rows" → new: "opening a menu with 48 dp rows — baseline 4 dp, or the Expressive vertical menu; one style app-wide".
- **L240** — old: "still under reduced motion" → new: "never under reduced motion".
- **New section "Landscape (compact height)"** — "Height < 480 dp: no headline collapse (bar only, or none in a game); nav bar may stay (`NavigationSuiteScaffold` default) but a game screen uses immersive mode — no status bar, cutout inset on the cutout edge, gesture inset 24 at the bottom; Android 17 ignores orientation locks on sw > 600 dp unless `appCategory="game"`; targets 48".

### `.claude/skills/wael-mobile-android/references/recipes.md`
- **Recipe 2, L79-80** — old: "One UI 8.5's translucency is the system's, not the app's" → new: "One UI 8.5/9 apps use translucent floating bars; ours stays tonal and opaque (M3E) — a choice, not a platform rule".
- **Recipe 10, L260-283** — add an Expressive-menu variant (`rounded-2xl`, `bg-m3-surface-container-low`, selected `bg-[tertiary-container]` → our lime-tinted `secondary-container` mapping, `gap-0.5` groups) and state which one the app uses.

### `docs/mobile/ios-patterns.md`
- **L23** — old: "2026 fall | iOS 27 released… point-release dates not verified from Apple" → new: "2026-09-14 | iOS 27 released (27.0.1 on 09-28; 27.1 with iPhone Duo, 10-23) | [S]".
- **Add rows**: "2026-03-24 HIG Sheets: Done always paired with Cancel/Back"; "2026-06-08 HIG Scroll views: prefer automatic scroll-edge style"; "2026-09-09 HIG Designing for iPhone Duo (bars on the vertical axis); Layout and Branding updated".
- **L389 (rule 6)** — old: "Minimize on scroll-down: after 24 px…" → new: "No minimize on scroll (HIG: only for tab bars with an accessory)".
- **L398 / L416 / L429** — "radius 24" → "radius 22 (concentric: 38 − 16)".
- **L409 (rule 18)** — add "medium detent inset on glass; large detent opaque".

### `docs/mobile/android-patterns.md`
- **L20** — old: "as of 21 Oct 2026 the channel is 1.5.0-beta02" → new: "as of 4 Nov 2026 1.5.0-rc01; most Expressive APIs graduated during the 1.5 alphas (LoadingIndicator, MaterialShapes still experimental)".
- **L22** — add: "Android 17 QPR1 on Pixel from mid-Sept 2026 (more system blur)"; "Android 17's orientation override exempts games (`appCategory`)".
- **L110** — append Expressive vertical menus.
- **L146** — append: "One UI 9 (Android 17): A55 stable from 21 Oct 2026; floating translucent tab bars in Samsung apps since 8.5".
- **L218-219 (rules 6-7)** — mark as superseded by the skill (fixed five `studentV2Tabs`, lime pill).

### `docs/mobile/trends-2026.md`
- **L38** — old: "iOS 26 tab bars that minimise on scroll" → new: "iOS 26 tab bars that minimise on scroll when they carry an accessory".
- **L34** — reconcile with the skill: "One UI keeps its own components; our Android skin = M3E components + One UI layout".
- **L82 / L104** — old: "Rubik variable for Arabic + Latin… line-height ≥ 1.6" → new: "Cairo (the skins' only family) … leading ≥ 1.35–1.4 per skill".
- **L91 / L113** — add "landscape-first game screens: compact-height rules (see skills)".

### `docs/mobile/device-specs.md`
- **L71** — old: "One UI 9 / Android 17: Oct 2026 (Wikipedia infobox — fresh, verify)" → new: "One UI 9 / Android 17: stable from 21 Oct 2026 (Korea), India after; Europe unconfirmed (Android Authority, TechRepublic)".
- **L217** — bezel list now "iPhone Duo, 18, 17, 16" (confirmed).

### `src/features/mobilegame/platformUi.ts`
- **L41, L46** — `h-11` → `h-[50px]` (iOS secondary matches the CTA), or add a compact-height variant where both are 44.
- **L50** — add `ios-glass` to `back`.
- **L61, L66** — `h-12` → `h-10` inside a `min-h-12` hit wrapper (M3 S), or `h-14` to match the CTA.
- **Comment L11-16** — add a "landscape (compact height)" row once the skills define it.
- `MobileGameLayout.tsx` **L45-48 comment** — add "Android values assume immersive mode (status bar hidden)".

---

## 7. Sources (accessed 2026-11-15)

**Apple — primary**
- HIG What's new (change log) — https://developer.apple.com/design/whats-new/
- HIG Tab bars (2026-06-08) — https://developer.apple.com/design/human-interface-guidelines/tab-bars
- HIG Scroll views (2026-06-08) — https://developer.apple.com/design/human-interface-guidelines/scroll-views
- HIG Search fields (2026-06-08) — https://developer.apple.com/design/human-interface-guidelines/search-fields
- HIG Sheets (2026-03-24) — https://developer.apple.com/design/human-interface-guidelines/sheets
- HIG Layout (2026-09-09) — https://developer.apple.com/design/human-interface-guidelines/layout
- HIG Branding (2026-09-09) — https://developer.apple.com/design/human-interface-guidelines/branding
- HIG Designing for iPhone Duo (2026-09-09) — https://developer.apple.com/design/human-interface-guidelines/designing-for-iphone-duo
- HIG Designing for games — https://developer.apple.com/design/human-interface-guidelines/designing-for-games
- HIG Game controls — https://developer.apple.com/design/human-interface-guidelines/game-controls
- Apple Design Resources (iOS 27 kit, SF Symbols 27, bezels) — https://developer.apple.com/design/resources/
- Apple Developer Forums 832543 (DTS on `UIDesignRequiresCompatibility`) — https://developer.apple.com/forums/thread/832543

**Apple — secondary**
- MacRumors, "Here's How Liquid Glass Is Changing in iOS 27" (2026-06-10) — https://macrumors.com/2026/06/10/how-liquid-glass-is-changing-in-ios-27
- MacRumors, "iPhone Duo Will Ship With iOS 27.1" (2026-09-09) — https://www.macrumors.com/2026/09/09/iphone-duo-ios-27-1/
- iPhone in Canada, "Apple Confirms iOS 27 Release Date" (2026-09-09) — https://www.iphoneincanada.ca/2026/09/09/apple-confirms-ios-27-release-date/
- 9to5Mac, iOS 27 compatible iPhones (2026-06-08) — https://9to5mac.com/2026/06/08/ios-27-here-are-all-the-compatible-iphone-models/
- ikyle.me, "What's New in UIKit in iOS 27" — https://www.ikyle.me/blog/2026/whats-new-in-uikit-ios-27
- Learn UI Design, iOS design guidelines (iOS 26, upd. 2026-04-22) — https://learnui.design/blog/ios-design-guidelines-templates.html
- Nil Coalescing, "Presenting Liquid Glass sheets in SwiftUI on iOS 26" — https://nilcoalescing.com/blog/PresentingLiquidGlassSheetsInSwiftUI
- Apple Developer Forums 796299 (iOS 26 tab-bar size) — https://developer.apple.com/forums/thread/796299

**Google / Android — primary**
- Compose Material 3 release notes (1.5.0-rc01, 2026-11-04) — https://developer.android.com/jetpack/androidx/releases/compose-material3
- MDC-Android BottomNavigation.md — https://github.com/material-components/material-components-android/blob/master/docs/components/BottomNavigation.md
- MDC-Android BottomSheet.md — https://github.com/material-components/material-components-android/blob/master/docs/components/BottomSheet.md
- MDC-Android Switch.md — https://github.com/material-components/material-components-android/blob/master/docs/components/Switch.md
- androidx MenuTokens.kt / StandardMenuTokens.kt — https://github.com/androidx/androidx/tree/androidx-main/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens
- Android 17 — Restrictions on orientation and resizability are ignored — https://developer.android.com/about/versions/17/changes/ff-restrictions-ignored
- Android 17 release notes — https://developer.android.com/about/versions/17/release-notes
- Use window size classes — https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes
- Build adaptive navigation (NavigationSuiteScaffold) — https://developer.android.com/develop/ui/compose/layouts/adaptive/build-adaptive-navigation
- Hide system bars for immersive mode — https://developer.android.com/develop/ui/views/layout/immersive

**Google / Samsung — secondary**
- 9to5Google, Android 17 QPR1 for Pixel (2026-09-15) — https://9to5google.com/2026/09/15/android-17-qpr1-pixel/
- Android Authority, Android 17 QPR1 rollout — https://androidauthority.com/android-17-qpr1-rollout-3711654
- Android Authority, Android 17 release date — https://androidauthority.com/android-17-release-date-3639790
- 9to5Google, Material 3 Expressive menus (2025-11-22) — https://9to5google.com/2025/11/22/material-3-expressive-menus/
- Android Authority, Galaxy A55 stable One UI 9 (2026-10-21) — https://www.androidauthority.com/samsung-galaxy-a55-stable-one-ui-9-rollout-3725983/
- TechRepublic, Galaxy A55/A35 get One UI 9 (2026-10-23) — https://www.techrepublic.com/article/news-galaxy-a55-a35-one-ui-9/
- SamMobile, Galaxy A55 stable One UI 8.5 (2026-05-26) — https://www.sammobile.com/news/galaxy-a55-grabs-stable-one-ui-8-5-update/
- SamMobile, One UI 9 design changes (2026-05-14) — https://www.sammobile.com/news/look-one-ui-9-design-changes-new-features/
- Gizmochina, One UI 8.5 vs 8.0 (floating tab bar, 2026-05-19) — https://www.gizmochina.com/2026/05/19/one-ui-8-5-vs-one-ui-8-0-5-major-upgrades-you-cant-miss/
- Android Authority, One UI 8.5 hands-on — https://www.androidauthority.com/one-ui-8-5-hands-on-3601412/
- Android Authority, One UI 9.5 leak (design) — https://androidauthority.com/samsung-one-ui-9-5-leak-galaxy-design-changes-3698833

**Not verifiable this pass:** iOS tab-bar capsule height, sheet / menu radii, iOS 26+ switch and segmented sizes (measure in the iOS 27 Figma kit); One UI status / gesture inset heights on the A55 (measure on a device); Material I/O 2026 blog details (m3.material.io is JS-rendered); the Expressive vertical-menu corner value.
