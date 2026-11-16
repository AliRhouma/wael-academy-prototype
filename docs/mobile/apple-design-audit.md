## Design review: Wael Academy, the student space (`/student-v2`) on iPhone

> **Fix status (2026-11-03, same day).**
> - ✅ **C1** solid secondary/tertiary/teal-text tokens (`--v2-ink-2/-3`, `--v2-brand-text` in `v2.css`); 112 faded-ink uses replaced; red text `--v2-live-strong` → `#c8191c`; tab labels re-coloured.
> - ✅ **C2** every text-bearing `bg-v2-grad` → lime fill + navy text; notification badge navy; menu/search/file/« الكل » icons solid `text-v2-brand-text`. Decorative gradients (progress, ticks) kept.
> - ✅ **C3** Dynamic Type: `platform.ts` reads `-apple-system-body` into `--dt-scale`; `ios.css` multiplies `--ts` by it.
> - ✅ **C4** scrubber 44 pt touch band, player buttons, month arrows, sheet close (+ Arabic label), « وثيقة » pill, filter pills and file buttons → 44 pt.
> - ✅ **C5** iOS tab bar no longer minimizes; labels always present.
> - ✅ **I2** `PhoneBack` in the phone header on every non-tab screen; in-page back links desktop-only.
> - ✅ **I3** theme follows `prefers-color-scheme` until someone picks one.
> - ✅ **I4** files sheet padded and safe-area aware; grabber is a 44 pt drag-to-dismiss zone; no blur under iOS sheets.
> - ⏸ **Awaiting a decision:** I1 (one large title per screen instead of the greeting on every tab), I5 (lime as both "selected" and "primary"), #21 (states dock inside the frames — kept on purpose for demos). Remaining Medium/Low items (I6–I19) not started.

> Reviewed 2026-11-03 with the `apple-design` skill (HIG pages pulled into `.claude/skills/apple-design/references/`).
> **Artifact:** 11 provided screenshots at 428 × 926 CSS px (1 px = 1 pt) plus 3 I captured myself (`13-avatar-menu-mine`, `14-docs-sheet-mine`, `15-notifs-mine`; the provided `07-avatar-menu` shows the menu closed). Dark mode uses the re-captured `11-home-dark` and `12-matieres-dark`.
> **Measurement:** contrast ratios are WCAG 2.x, computed from the **rendered** colors. A headless-Chrome script blended every text color, including Tailwind `/NN` opacities, over its real background. Sizes are computed `font-size` under `[data-platform="ios"]`, where `--ts: 1.6`. Targets are `getBoundingClientRect()`. Text on gradients (badges, ribbons) was computed by hand against both gradient ends.
> **Limits:** a web app can't show me the real status bar or Dynamic Type at AX sizes, and I couldn't test VoiceOver. Where a finding depends on one of these, it says so.
>
> **References opened:** accessibility, layout, typography, color, designing-for-ios, cross-platform, tab-bars, toolbars, sheets, search-fields, lists-and-tables, buttons, segmented-controls, materials, liquid-glass, right-to-left, motion, playing-haptics, progress-indicators, loading, feedback, writing, dark-mode, playing-video, menus, context-menus, design-principles, branding.

### Summary

**Overall rating: Critical issues.**

**Thesis.** The student space is a warm, game-like study companion. A 14-to-19-year-old opens it to catch the next live class or rewatch a recording. **The one thing it will be remembered by** is Wael, the teacher caricature, drawn in a different costume for each subject. He looks out of every subject card, together with the chunky lime "game" buttons. It has a real point of view and is not a template.

**What drags it down is legibility and native fit.**
- **The secondary text tier fails contrast.** The light theme writes it as navy at 45–60 % opacity, which measures **2.5–3.9 : 1**. That includes the tab bar labels.
- **Lime and the teal-to-lime ramp are used as foreground colors** (white on lime, lime strokes on white), down to **1.27 : 1**.
- **Type is px times a fixed multiplier**, so it ignores the person's text size.
- **Several controls are below the 28 pt minimum.**
- **On the native side:**
  - The same greeting, logo and search sit at the top of every tab, in place of a screen title.
  - Detail screens have no standard Back.
  - The files sheet ignores the safe area and can't be swiped away.
  - The app ignores the system appearance.

---

### Critical

#### C1. Secondary text fails contrast across the light theme

**What.** All values below are measured on the rendered page, light theme.

| Text | Size and weight | Color on background | Ratio | Needs |
| --- | --- | --- | --- | --- |
| Unselected tab labels | 11 pt, 500 | `#74829d` on the glass ≈ `#fff` | **3.87 : 1** | 4.5 |
| Selected tab label | 11 pt, 600 | `#0491a5` on its 12 % tint `#e0f2f4` | **3.25 : 1** | 4.5 |
| Search placeholder "ابحث الآن" | 16 pt | `#8e99af` on `#eff0f4` | **2.52 : 1** | 4.5 |
| French kicker on Home cards ("Nombres complexes — …") | 12 pt | `#808ca5` on white | **3.37 : 1** | 4.5 |
| Panel and section meta ("18 مواد · 104 محتوى", "· 9 فيديو", "السعر") | 12–12.8 pt | `#8b96ad` | **2.97 : 1** | 4.5 |
| Empty-state body ("كي تبدا حصّة مباشرة…") | 13.6 pt | `#6e809b` on `#f0f9fa` | **3.77 : 1** | 4.5 |
| Lesson-row actions "فيديو" / "وثيقة" (Subject screen) | 16 pt, 500 | — | **3.87 : 1** | 4.5 |
| Locked matière "يهبط غدوة · الإربعاء" | 13.6 pt | — | **2.54 : 1** | 4.5 |
| Struck-through old price "2950" (Offers) | 15.2 pt, regular | `#ff3b3e` | **3.53 : 1** | 4.5 |
| "خروج" in the account menu | 15.2 pt, 500 | `#ff0004` | **4.0 : 1** | 4.5 |

- The source is about **118 uses** of `text-v2-ink/40…/65` across `src/features/student-v2/**` (45: 17, 50: 19, 55: 38, 60: 35).
- Dark mode mostly passes: tab labels 6.0 : 1, meta 4.7–5.4 : 1. So the light theme is the one that breaks.

**Why.**
- `accessibility.md › Vision`: "Strive to meet color contrast minimum standards… Up to 17 pts | All | 4.5:1."
- `dark-mode.md › Dark Mode colors`: "For custom foreground and background colors, strive for a contrast ratio of 7:1, especially in small text."

**Fix.** Stop deriving secondary text from opacity. Add solid semantic tokens in `src/styles/v2.css`:

```css
:root {
  --v2-ink-2: #586989;  /* secondary: 5.53:1 on white, 5.17:1 on #f0f9fa */
  --v2-ink-3: #687794;  /* tertiary, ≥ 13 pt only: 4.51:1 */
  --v2-brand-text: #036b7a;  /* teal as TEXT: 6.2:1 on white, 5.37:1 on its tint */
}
[data-theme="dark"] {
  --v2-ink-2: #a6aec1;
  --v2-ink-3: #919aad;
  --v2-brand-text: #29b8cc;
}
```

- Expose them as `text-v2-ink-2`, `text-v2-ink-3` and `text-v2-brand-text` in the `@theme inline` block.
- Replace `text-v2-ink/45|50|55|60|65` with `text-v2-ink-2`. Keep `/40` only for *disabled* controls.
- `placeholder:text-v2-ink/45` in `header/SearchBox.tsx` becomes `placeholder:text-v2-ink-3`.
- In `V2Shell.tsx › IosTabBar`:
  - Unselected tab label: `text-v2-ink/60` becomes `text-v2-ink-2`.
  - Selected tab label: `text-v2-brand` becomes `text-v2-brand-text`.
- Old price: change to `#c8191c` (5.81 : 1). Keep the strike-through, which already carries the meaning.
- Logout: `text-v2-live-strong` becomes the same `#c8191c`.

#### C2. Lime and the brand ramp are used as foreground, down to 1.27 : 1

**What.**
- **Text on gradient badges.** The notification badge "5", the "NEW" ribbon on Home and the "شعبتك" chip on Matières are **white text on `bg-v2-grad`** (`#0491a5 → #8aff6b`).
  - White on the lime end: **1.27 : 1**.
  - White on the midpoint `#47c888`: 2.12 : 1.
  - White on the teal end: 3.75 : 1.
  - The source has 19 such pairings.
- **Gradient-stroked icons.** 18 `stroke-v2-grad` icons are stroked teal→lime on white: the account-menu glyphs, search-result glyphs, the "الكل" arrow and the empty-state glyphs.
  - Their lime half measures **1.27 : 1** against white.
  - In `13-avatar-menu-mine` the menu icons are visibly washed out.
- **Text on lime.**
  - The "بخطوة" word of the Offers logo chip is teal on lime: 2.96 : 1.
  - The group-count "9" inside the lime chip passes, at 4.74 : 1.

**Why.**
- `accessibility.md › Vision`: "it's important that there's enough contrast between foreground text and icons and background colors."
- `color.md › Inclusive color`: "insufficient contrast can cause icons and text to blend with the background."

**Fix.**
- **Lime is a fill, never a foreground on white.** Apply the rule the brand already uses for buttons: lime fill with navy text (10.5 : 1).
  - "NEW" (`dashboard/RecentSection.tsx`) and "شعبتك" (`matieres/SubjectsScreen.tsx`): use `bg-v2-cta text-v2-on-cta`.
- **Notification badge** (`header/NotificationsMenu.tsx`): use `bg-v2-ink text-white` (13.3 : 1).
  - The iOS convention is a red oval (`tab-bars.md › Best practices`: "a red oval containing white text").
  - Here, though, red already means *live*, so navy is the honest choice.
- **`stroke-v2-grad`** in `src/styles/v2.css`:
  - Keep it only on decorative glyphs whose meaning is carried by adjacent text (empty-state circles, the desktop rail).
  - For menu and search icons, and for the "الكل" arrow in `ui.tsx › SeeAll`, use solid `text-v2-brand-text`.
  - If the ramp must stay on these, end it at a 3 : 1-safe green such as `#2f8f3f` instead of `#8aff6b`.

#### C3. Text doesn't follow the person's text size (no Dynamic Type)

**What.**
- Every size in the space is `calc(Npx * var(--ts))`.
- `--ts` is a constant 1.6 under iOS (`src/styles/platform/ios.css`) and 1.5 at the root (`src/styles/index.css`).
- Nothing reads the system text size, so a student who sets Larger Text gets exactly the same 11–13.6 pt meta text.
- The code's own comment in `index.css` warns that boxes don't scale with `--ts`, so larger values crowd chips.

**Why.**
- `accessibility.md › Vision`: "Support larger text sizes… Ideally, give people the option to enlarge text by at least 200 percent."
- `layout.md › Adaptability`: "Apps that don't respond to this setting can be difficult or impossible to use for people who rely on this feature."

**Fix.**
- In `src/app/platform.ts`, when the platform is iOS:
  - Measure a hidden probe styled `font: -apple-system-body`. WebKit sizes it from Dynamic Type: 17 px at the default setting.
  - Set `document.documentElement.style.setProperty('--ts', String(1.6 * probePx / 17))`.
  - Re-measure on `visibilitychange` and `resize`.
- In the webview wrapper, pass `UIFontMetrics` or `preferredContentSizeCategory` the same way.
- Then fix what breaks at about 2×:
  - Chips and segmented pills: `min-h-11` instead of a fixed `h-*`, and `flex-wrap`.
  - Lesson rows: let titles wrap to 2–3 lines (see I9).
  - Week strip (`dashboard/CalendarPanel.tsx`): drop to a scrollable row past the AX sizes.

#### C4. Controls below the 28 pt minimum, and one nested inside a larger target

**What.**
- **Video scrubber** (`src/components/kit/VideoStage.tsx`, `h-4`): **16 pt tall**.
- **Files close button** in the bottom sheet (`components/ui/sheet.tsx`): a 16 pt icon with no padding, so **about 16 × 16 pt**.
- **"وثيقة" (files) button inside each lesson row** (`matieres/SubjectScreen.tsx`): **66 × 26 pt**, sitting inside a row that is itself a link.
  - A slightly-off tap plays the video instead of opening the files.
- **Below the 44 pt default, above the minimum:**
  - Previous / next video: 36 pt.
  - Play and fullscreen: 40 pt.
  - Month arrows: 40 pt.
  - Filter pills ("الكل · 116", "دروس / تمارين"): 40 pt tall.

**Why.**
- `accessibility.md › Mobility`: "iOS, iPadOS | 44x44 pt | 28x28 pt", and "Consider spacing between controls as important as size."
- `buttons.md › Best practices`: "a button needs a hit region of at least 44x44 pt."

**Fix.**
- **Scrubber.** Wrap the range input in a `relative h-11 flex items-center` container and give the `<input>` `h-11` with a transparent track. Keep the visible bar at 4 px.
- **Sheet close.** `SheetPrimitive.Close` gets `grid size-11 place-items-center rounded-full`, and its `sr-only` text becomes Arabic: `"سكّر"`.
- **"وثيقة".** Add `min-h-11 px-2 -mx-2 rounded-full`. Better, move it out of the row link into a trailing 44 pt icon button with `aria-label="وثائق"`.
- **The rest.** Video controls get `size-11`; the month arrows go from `size-10` to `size-11`; pills get `min-h-11`.

#### C5. The minimized tab bar leaves its tabs without names

**What.**
- When `useScrollingDown()` minimizes the iOS tab bar, the label span gets `hidden` (`display: none`) in `V2Shell.tsx › IosTabBar`.
- Each `NavLink` then contains only an unlabeled Lucide `<svg>`, so VoiceOver announces "link" five times.
- The labels also vanish visually. Compare `02-home-scrolled` and `10-video-scrolled`, which show icons only.

**Why.**
- `tab-bars.md › Best practices`: "Include tab labels to help with navigation."
- The skill's Lens 1: every icon-only control needs a text label for screen readers.
- `tab-bars.md › Phone (iOS)`: minimizing is described "for tab bars with an attached accessory, like the MiniPlayer in Music". This bar has no accessory.

**Fix.**
- Add `aria-label={label}` on the `NavLink`.
- Swap `minimized && "hidden"` for `minimized && "sr-only"`.
- Better still, drop the minimize behaviour, since there is no accessory to make room for. Keep the 64 pt capsule and its labels at all times.

---

### Improvements

#### I1. [High] Every tab is titled by the greeting, not by the screen

**What.**
- On all five tabs, Offers, Subject and Video, the top 160 pt (y = 47–205) is the same stack:
  - the logo, sound, bell and avatar row;
  - "نهارك زين محمد، 👋" set as a 33.6 pt `h1`, the large-title size;
  - the search field.
- The actual screen title ("الدروس", "روزنامتي", "تسجيلات") comes after it, as a second `h1` at 24 pt.
- On Subject (`08`) the matière name is pushed to y = 236.
- A student switching tabs sees the same top third every time, and the place they are in is the third-loudest text.

**Why.**
- `toolbars.md › Titles`: "A title helps people confirm their location as they navigate your app."
- `layout.md › Visual hierarchy`: "place the most important items near the top."
- `designing-for-ios.md › Best practices`: "limiting the number of onscreen controls."

**Fix.** In `V2Shell.tsx › TopBar`:
- Render `Greeting` only on the index route (`useMatch(BASE)`).
- Everywhere else, render the screen's own title as the large title: `text-[calc(21px*var(--ts))]` (34 pt), one `h1` per page.
  - Move the titles out of the screens into a `title` prop or route `handle`.
- Keep the avatar and bell as trailing bar items.
- Optionally collapse the large title into a 17 pt inline title in a glass bar once the page scrolls.

#### I2. [High] Detail screens have no standard Back control

**What.**
- **Subject (`/matieres/:id`)** has no back affordance at all. The only ways out are the tab bar or browser history.
- **Video and recordings-by-subject** use a 13.6 pt text link, "→ تسجيلات · Mathématiques". It sits *below* the greeting and search at y ≈ 243, outside any bar, and scrolls away.
- No edge-swipe back is implemented. In a wrapped webview it is off unless `allowsBackForwardNavigationGestures` is set.

**Why.**
- `toolbars.md › Navigation`: "Use the standard Back and Close buttons… Prefer the standard symbols for each, and don't use a text label that says Back."
- `designing-for-ios.md › Best practices`: "it's especially important to let people swipe to navigate back."
- `right-to-left.md › Controls`: "a back button must point to the right."

**Fix.**
- On pushed routes, replace the greeting row with a navigation-bar row in `V2Shell.tsx`:
  - A 44 pt `ChevronRight` back button at the leading (right) edge, `aria-label="رجوع"`.
  - The parent title is optional.
  - The screen title in the center or as the large title below.
- Delete the in-content breadcrumb links in `video/VideoScreen.tsx` and `recordings/SubjectRecordingsScreen.tsx`.
- In the iOS wrapper, enable back-swipe.

#### I3. [High] The app ignores the system appearance

**What.**
- `src/app/providers.tsx › initTheme()` returns `"light"` unless `localStorage["wael-theme"] === "dark"`.
- It never reads `prefers-color-scheme`.
- The only switches are the gallery's moon and the PaletteDock, both authoring tools.
- A student whose iPhone is in Dark Mode gets a white app at night. The dark theme exists and is good (I12).

**Why.**
- `dark-mode.md` (introduction): "they generally expect all apps and games to respect their preference."
- `dark-mode.md › Best practices`: "they may think your app is broken because it doesn't respond to their systemwide appearance choice."

**Fix.**
- In `initTheme()`, use `saved ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')`.
- Subscribe to the media query's `change` event.
- Only write `localStorage` when the demo toggle is used, and scope that toggle to the gallery.

#### I4. [High] The files bottom sheet ignores safe area, padding and swipe-to-dismiss

**What.** The sheet is `matieres/parts.tsx › FilesSheet` on mobile, shown in `14-docs-sheet-mine`.
- The computed `padding` is **0 / 0 / 0**:
  - the title and subtitle run into the screen's right edge;
  - the file row's bottom edge is at about y = 915, inside the 34 pt home-indicator zone (y > 892).
- It renders on the kit's `bg-background` (`#f2f6fc`) with an unstyled 16 px `SheetTitle`, not the space's surface and type.
- The grabber is drawn but purely decorative (`aria-hidden`, no gesture), and the sheet can't be dragged down.
- The backdrop **blurs** the whole page 8 px, where iOS only dims.
- (`DocsSheet.tsx` does set `px-4` and `pb-[max(1.25rem,var(--sai-bottom))]`. The two sheets disagree.)

**Why.**
- `layout.md › Guides and safe areas`: "Respecting the safe area is essential to make sure system UI and hardware features… don't obstruct content and controls."
- `sheets.md › Mobile (iOS, iPadOS)`: "Support swiping to dismiss a sheet."

**Fix.**
- Make `FilesSheet` reuse `DocsSheet`'s `SheetContent` classes: `bg-v2-surface px-4 pt-3 pb-[max(1.25rem,var(--sai-bottom))]` and the v2 title/description classes.
- Better, extract one `V2Sheet` in `features/student-v2/ui.tsx` and use it in both places.
- In `components/ui/sheet.tsx`:
  - Add a pointer-drag handler on the grabber and sheet header (translateY; dismiss past 30 % or on a fast flick).
  - Drop `backdrop-blur-sm` from `SheetOverlay` under `[data-platform="ios"]`.

#### I5. [High] One color means two things: lime is both "selected" and "primary action"

**What.**
- On Video (`09`) lime fills four elements at once:
  - the play button;
  - the selected group chip "Rattrapage";
  - the current playlist row's play disc;
  - the "اضغط للتحميل" CTA.
- On Subject (`08`): the selected "دروس" segment and the chapter disc "01.".
- On Matières: the selected filter and the "شعبتك" chip.
- The gamified skill's own rule is "one lime moment per screen". The tokens file says lime is both "the lime of every primary button" and "the one selected thing".

**Why.**
- `color.md › Best practices`: "Avoid using the same color to mean different things."
- `buttons.md › Style`: "Keep the number of prominent buttons to one or two per view."

**Fix.** Choose one meaning per screen.
- Keep lime for the primary action.
- Show selection with the navy fill already used for selected text (`bg-v2-ink text-white`, 13.3 : 1), or a 2 px teal outline, on:
  - chips (`.v2-chip[aria-pressed=true]` in `src/styles/skins/play.css`);
  - segments;
  - the current playlist row (`video/PlaylistPanel.tsx`).
- The chapter disc does not need lime. Use `bg-v2-brand-text text-white`.

#### I6. [Medium] Search is a full-width field on every screen, with a vague scope

**What.**
- The 36 pt search field sits under the greeting on every tab.
- The placeholder "ابحث الآن" ("search now") doesn't say what it searches. It actually covers pages, matières and séances.
- Matière hits all open `/matieres`, not the matière (`header/SearchBox.tsx`, `to: \`${BASE}/matieres\``).

**Why.**
- `search-fields.md › Best practices`: "Use placeholder text to help people know what they can search for."
- `search-fields.md › Phone (iOS)`: "Place search at the bottom if there's room… Search at the bottom is useful in any situation where search is a priority."

**Fix.**
- Make the placeholder "ابحث على مادّة ولّا حصّة".
- Route matière hits to `${BASE}/matieres/${s.id}`.
- On iOS, move search out of the header into the tab bar as a separate trailing search button (iOS 26 "button appearance" search tab). It opens the same `SearchBox` focused above the keyboard.
- Keep the field inline only on Home.

#### I7. [Medium] The tab bar loses orientation on sections reached from elsewhere

**What.**
- On Video (`09`, `/video/...`) and Offers (`06`), **no tab is selected**.
- Video belongs to "تسجيلات", but its URL isn't under `/seances`.
- Offers, a top-level destination on desktop (the rail's 2nd item), is reachable on the phone only from inside the avatar menu.

**Why.**
- `tab-bars.md › Best practices`: "If you hide the tab bar, people can forget which area of the app they're in." The same applies when no tab is lit.
- `menus.md › Organization`: "Prefer listing important or frequently used menu items first." On the phone, Offers is the 5th of 9 items in the account menu.

**Fix.**
- In `IosTabBar`, compute `isActive` with a section map (`/video/seance/*` → `/seances`, `/video/lesson/*` → `/matieres`), not just NavLink's path prefix.
- For Offers, either:
  - make it a tab and fold the placeholder "مجموعاتي" into the account menu until it is designed; or
  - keep it in the menu and show a back bar on it (I2).

#### I8. [Medium] Text sits under the status bar with no scroll-edge effect

**What.**
- When the page scrolls (`02`, `10`), cards slide under the 47 pt status-bar inset with nothing between them and the clock and battery glyphs.
- The header is not sticky, and no top fade or blur exists.

**Why.** `layout.md › Visual hierarchy`: "use a scroll edge effect to visually elevate controls above content."

**Fix.** In `V2Shell.tsx`, add a fixed, `pointer-events-none` top strip under iOS:
- `fixed inset-x-0 top-0 z-20 h-[calc(var(--sai-top)+12px)]`;
- a `linear-gradient(var(--v2-canvas-base), transparent)` background plus `backdrop-blur-sm`, masked to fade out.

The same band, inverted, can sit behind the tab bar.

#### I9. [Medium] Key text is truncated to one line where it is the content

**What.**
- Subject (`08`):
  - the open chapter title "Chapitre 1 : La fonction rep…" at 22.4 pt;
  - the lesson titles "La fonction reproductric…" and "Contrôle de l'activité tes…".
- Home cards cut the *lesson* title ("NOMBRES COMPLEXES — FORME TRIGO…", 12 pt grey uppercase), while the *subject* name, which the illustration already says, gets the bold 17.6 pt line.

**Why.**
- `typography.md › Supporting Dynamic Type`: "Avoid truncating text in scrollable regions unless people can open a separate view to read the rest."
- `lists-and-tables.md › Content`: "Keep item text succinct so row content is comfortable to read."

**Fix.**
- In `matieres/SubjectScreen.tsx`, change `truncate` to `line-clamp-2` on the chapter title and lesson `h3` (the 6 rem row height already allows it).
- In `dashboard/RecentSection.tsx`, swap the hierarchy:
  - the lesson title becomes the bold line (`line-clamp-2`, 15–16 pt);
  - the matière becomes the small kicker;
  - drop `uppercase` on the French title.

#### I10. [Medium] The group switcher on Video wraps like a tag cloud

**What.**
- "Rattrapage · 9 / Élite · 2 / Intermédiaire · 1" are three 40 pt pills of unequal width. They wrap to two rows next to a separate collapse chevron (`09`).
- It's a single choice among closely related views of the same list.

**Why.**
- `segmented-controls.md › Mobile (iOS, iPadOS)`: "Consider a segmented control to switch between closely related subviews."
- `segmented-controls.md › Best practices`: "keep segment size consistent."

**Fix.** In `video/PlaylistPanel.tsx`, render one `grid grid-cols-3` segmented control: 44 pt tall, equal segments, counts as a second line or dropped. Past three groups, use a pull-down menu.

#### I11. [Medium] No answer to Increase Contrast; sound without a haptic or visual double

**What.**
- There is no `@media (prefers-contrast: more)` anywhere in `src/styles`. Hairlines at ink/14 % and the 15 % card borders stay as they are.
- Every action plays a UI sound (`data-uisfx`), on by default with a speaker toggle in the header, and nothing is felt.

**Why.**
- `color.md › Best practices`: "supply light and dark variants, and an increased contrast option for each."
- `accessibility.md › Hearing`: "Use haptics in addition to audio cues."
- `playing-haptics.md › Best practices`: "Make haptics optional."

**Fix.**
- **Increase Contrast.** Add a `prefers-contrast: more` block to `src/styles/platform/ios.css`:
  - `--v2-ink-2: var(--v2-ink)`;
  - borders to 2 px ink/40;
  - `.ios-glass` at 92 % opacity.
- **Haptics.** In the wrapper, bridge `sfx(cue)` in `src/features/student-v2/sound.ts` to `UIImpactFeedbackGenerator` (`select` → selection, `press` → light impact, success → notification) with its own toggle in Settings.
- **The sound toggle.** Move it from the header into Settings (`/parametres`). It's a preference, not a per-screen action.

#### I12. [Medium] Names change between the tab, the title and the content

**What.**
- The tab says **"الرزنامة"** and the screen title says **"روزنامتي"**: a different spelling (رزنامة vs روزنامة) plus a possessive.
- The same subject is **"Maths"** on Matières, **"Mathématiques"** on Recordings and Home, and **"Bac Sciences - Maths"** in notifications.
- SVT is "SVT", "Sciences de la vie et de la terre" and "Bac Sciences - SVT".
- Philosophy is "فلسفة" on one grid and "Philosophie" on the next.
- Ribbons and labels switch script: "NEW", "COURS" and "EXERCICE" (uppercase Latin), while the sheet's close button is read out in English ("Close").

**Why.**
- `writing.md › Getting started`: "Create a list of common terms, and reference that list to keep your language consistent."
- `writing.md › Best practices`: "Use possessive pronouns sparingly… use them consistently."
- `right-to-left.md › Controls`: "Arabic or Hebrew text can appear too small when next to uppercased Latin text."

**Fix.**
- Use one label per destination in `src/app/nav/studentV2.ts` and the screen `h1` ("الرزنامة" in both).
- Use one display name per subject from `lib.ts › frenchName` (short form on grids, long form on detail).
- Make the ribbons Arabic ("جديد", "درس", "تمرين") in `matieres/matieres.ts` and `RecentSection.tsx`.
- Make the `sr-only` close label "سكّر".

#### I13. [Medium] The Calendar tab opens on a copy of Home's empty live panel

**What.**
- `04-calendar` starts with the same "الحصّة المباشرة / ما فمّاش حصّة مباشرة توّا" panel as Home.
- Its CTA, **"شوف الرزنامة"** ("see the calendar"), points to the screen the student is already on.
- The week strip, the actual job of the tab, starts at y = 680, behind the tab bar.

**Why.**
- `writing.md › Best practices`: "Consider each screen's purpose… put the most important information first."
- `writing.md › Best practices`: an empty state should "guide people on actions they can take."

**Fix.** In `calendar/CalendarScreen.tsx`, put the week or month grid first. Show the live panel only when a class is live or about to start, and without the self-referencing CTA.

#### I14. [Low] Tab icons are outline glyphs; the selected tab only gets a heavier stroke

**What.** Lucide outline icons with `strokeWidth` 1.75 → 2.25 on the selected tab.

**Why.** `tab-bars.md › Best practices`: "Prefer filled symbols or icons for consistency with the platform."

**Fix.** In `IosTabBar`, render the selected tab with `fill="currentColor"` and `fillOpacity={0.18}` on the Lucide glyph, or swap to filled variants. Keep the 12 % capsule.

#### I15. [Low] The logo repeats on every screen and duplicates the Home tab

**What.** The mark sits at the leading edge of the top row on every screen and links to Home, which is also the first tab.

**Why.** `branding.md › Best practices`: "Resist the temptation to display your logo throughout your app or game unless it's essential for providing context."

**Fix.** Remove `Logo compact` from `TopBar` on phone. Spend the space on the screen title (I1).

#### I16. [Low] The speaker icon isn't mirrored for RTL

**What.** `Volume2` / `VolumeX` show the sound waves leaving to the right.

**Why.** `right-to-left.md › Interface icons`: "In the RTL context, the icon needs to flip to show the waves coming from the right."

**Fix.** In `V2Shell.tsx › SoundToggle`, add `className="… rtl:-scale-x-100"` (or `-scale-x-100`, since the space is RTL-only). That's moot if the toggle moves to Settings (I11).

#### I17. [Low] Nested corners aren't concentric

**What.**
- `ios.css` sets `rounded-3xl` to 22 px and `rounded-2xl` to 14 px.
- Panels are inset 16 pt (`p-4`), so the inner card's concentric radius would be 22 − 16 = **6**, not 14.
- The comment in `ios.css` claims concentricity.

**Why.** `toolbars.md › Best practices`: "ensure that its corner radius is also concentric with the bar's corners." The same principle applies to the content containers.

**Fix.** Either raise the outer radius to 30 (30 − 16 = 14), or set inner cards inside `.v2-panel` to `calc(22px - 16px)`. The former keeps the soft look.

#### I18. [Low] Dark mode: the white logo tile and light illustration grounds glow

**What.** In `11-home-dark` and `12-matieres-dark`:
- The masked logo renders as a near-white tile (`--v2-ink: #e6edfb`).
- The philosophy and SVT portraits have pale circular grounds that glow on `#0a1428`.

**Why.** `dark-mode.md › Dark Mode colors`: "Soften the color of white backgrounds… consider slightly darkening the image."

**Fix.**
- In the `[data-theme=dark]` block in `v2.css`, add `filter: brightness(.88)` on `.v2-portrait` and subject icons.
- The logo goes with I15.

#### I19. [Low] The files sheet's progress bar has no label

**What.** In `14-docs-sheet-mine` a grey 12 px track sits above the file list with no text. It shows the fraction downloaded but says nothing.

**Why.** `progress-indicators.md › Best practices`: "If it's helpful, display a description that provides additional context for the task."

**Fix.** In `matieres/parts.tsx`, add a caption next to `.v2-bar`: "`{taken}/{total}` محمّلين". Hide the bar when `taken === 0`.

---

### Craft notes

#### [Medium] Boldness is spent everywhere instead of in one place

The space has a real signature: Wael in costume, per subject. But on any given screen four or five things compete with him:
- lime pills;
- teal→lime stroked icons;
- gradient badges;
- a 3D lip on every card;
- the 34 pt greeting.

`branding.md › Best practices` says it directly: "Minimize its use on controls and instead use it intentionally for primary actions or status indicators."

Let Wael and one lime action carry each screen. Make the rest quiet:
- solid navy and teal-dark icons;
- lips only on pressables that start something (CTA, play), not on every tile;
- see C2 and I5.

#### [Low] Remove one accessory

The **header sound toggle** is the clearest candidate. It's a setting shown as a primary control on every screen. Next is the logo (I15). Removing both frees the top row for the title and Back (I1 and I2).

#### Typography

- Cairo carries both Arabic and the French course titles well, and weight does the hierarchy work (800 titles, 500–600 labels).
- The scale is coherent: 34 / 24 / 22.4 / 17.6 / 13.6 / 12 pt.
- The weak tier is everything at 12–13.6 pt in grey, which is a contrast problem (C1), not a size problem.
- Body copy rarely reaches the 17 pt default. That's acceptable for card UI, but long text (offer descriptions, notification bodies) should sit at 17 pt (`calc(10.6px*var(--ts))`).

#### Not a template

None of the three generated looks apply here (cream and serif, black with one acid accent, hairline broadsheet). The navy, teal and lime palette and the illustrated mascot are rooted in the brand's own materials. Keep them.

---

### What works

- **Wael per subject.** It's a defining moment, and it answers `design-principles.md › Delight` ("Create defining moments"). The illustrations also do real wayfinding on the Matières and Recordings grids.
- **RTL is genuinely mirrored**, not just right-aligned:
  - "→" back arrows point right; "الكل ←" points forward-left.
  - The month arrows are swapped (`ChevronRight` for previous at the start edge).
  - Previous and next video swap their skip icons.
  - French titles are isolated with `LatinLine` (`dir="ltr"` + `text-right`), so they clip at their end.
  - This matches `right-to-left.md › Controls`.
- **Liquid Glass discipline.** Glass is used on exactly one surface, the floating tab bar.
  - `.ios-glass` uses a 70 % fill, `blur(22px) saturate(170%)` and an inner hairline.
  - Content cards are opaque.
  - There is a `prefers-reduced-transparency` fallback and a `@supports not (backdrop-filter)` fallback.
  - That passes items 1–3 and 5 (transparency) of the `liquid-glass.md › Review checklist`.
- **Reduced motion is honoured.** `play.css` turns off the burst, shake, pop and roll, and zeroes the press transitions under `prefers-reduced-motion`. `v2.css` gates the floating badges and the live halo the same way.
- **Empty states invite the next step.** For example "ما فمّاش حصّة مباشرة توّا" plus the reason plus one CTA, and "ما لقينا شي لـ «…»" plus a hint. That matches `writing.md › Best practices` ("Provide clear next steps on any blank screens"). The voice (derja, warm, direct) fits a 14–19 audience.
- **The account menu** puts the destructive "خروج" last and in red, separated from the rest (`context-menus.md › Best practices`). Its rows are 44 pt.
- **Header icon buttons and CTAs meet 44 pt** (`iconBtnClass` `size-11`, `ctaClass` `min-h-11`). Navy on lime CTAs measure 10.5 : 1.
- **The dark theme's tokens are good.** Secondary text is 4.7–7.5 : 1 and tab labels 6.0 : 1. Only the light theme needs C1.
- **The tab bar geometry is right for iOS 26:** a 64 pt capsule, 16 pt side insets, 8 pt above the home indicator, a concentric inner capsule and five tabs.

### Platform notes

- **This is a web app emulating iOS 26.** The foundations apply fully (accessibility, color, type, layout, writing). The iOS conventions apply because the product claims them. In React and Tailwind terms:
  - "navigation bar" is the top row in `V2Shell.tsx › TopBar`;
  - "sheet" is `components/ui/sheet.tsx` (Radix Dialog);
  - "Dynamic Type" is the root `--ts` multiplier (`cross-platform.md › Vocabulary`).
- **When wrapped (WKWebView or PWA):**
  - Back-swipe needs `allowsBackForwardNavigationGestures`.
  - Haptics need a native bridge, since Safari has no Vibration API.
  - Dynamic Type needs either `-apple-system-body` probing or the native content size category passed in (C3).
- **The floating "حالات الشاشة" (screen states) button** (`demoStates.tsx › StatesDock`) appears in every phone screenshot at the bottom-left, overlapping content just above the tab bar.
  - It's authoring chrome, not product UI, so it isn't scored here.
  - Hide it inside the device frames (gate on `IN_GALLERY` or `?platform`) so reviewers see the real thumb zone.
- **"مجموعاتي" is a placeholder route.** A tab that leads to "page coming" is acceptable for a prototype. `tab-bars.md › Best practices` would rather explain why the content is unavailable than hide the tab, and the placeholder does explain it.
- **Android parity.** The same token fixes (C1, C2) carry over to the Galaxy frame. `AndroidNavBar` already keeps its labels visible (no C5 issue there).

---

### Fix list

Ordered by severity, deduplicated.

1. **Secondary-text tokens (C1).**
   - Add `--v2-ink-2` (#586989 light / #a6aec1 dark), `--v2-ink-3` (#687794) and `--v2-brand-text` (#036b7a / #29b8cc) to `src/styles/v2.css`, with utilities in its `@theme inline`.
   - Replace `text-v2-ink/45…/65` (about 118 uses) across `src/features/student-v2/**`.
   - Placeholder → `placeholder:text-v2-ink-3` (`header/SearchBox.tsx`).
   - Old price and logout red → `#c8191c` (`offers/OffersScreen.tsx`, `header/ProfileMenu.tsx`).
2. **Tab label contrast (C1).** Unselected `text-v2-ink-2`, selected `text-v2-brand-text`, in `src/features/student-v2/V2Shell.tsx › IosTabBar`.
3. **No white on lime or gradient (C2).**
   - "NEW" → `bg-v2-cta text-v2-on-cta` (`dashboard/RecentSection.tsx`).
   - "شعبتك" → same (`matieres/SubjectsScreen.tsx`).
   - Notification badge → `bg-v2-ink text-white` (`header/NotificationsMenu.tsx`).
   - Audit the remaining 16 `bg-v2-grad … text-white` pairings.
4. **Meaningful icons solid, not ramp (C2).** Replace `stroke-v2-grad` with `text-v2-brand-text` on menu, search and SeeAll icons:
   - `header/ProfileMenu.tsx`;
   - `header/SearchBox.tsx`;
   - `ui.tsx › SeeAll`;
   - `matieres/parts.tsx`.

   Or end `#v2-grad` at `#2f8f3f` in `ui.tsx › V2GradientDefs`.
5. **Dynamic Type (C3).**
   - In `src/app/platform.ts`, probe `font: -apple-system-body` and set `--ts = 1.6 × probe / 17` on iOS; re-measure on `visibilitychange`.
   - Then let pills grow with `min-h-11` instead of fixed heights, and `flex-wrap`: the filter in `matieres/SubjectsScreen.tsx` and `recordings/RecordingsScreen.tsx`, and the segments in `matieres/SubjectScreen.tsx`.
6. **Hit targets (C4).**
   - Scrubber `h-11` wrapper (`src/components/kit/VideoStage.tsx`).
   - Video buttons `size-11` (same file).
   - Sheet close `size-11` plus Arabic label (`src/components/ui/sheet.tsx`).
   - "وثيقة" button `min-h-11 px-2 -mx-2` or a trailing icon button (`matieres/SubjectScreen.tsx`).
   - Month arrows `size-11` (`dashboard/CalendarPanel.tsx`).
7. **Tab names when minimized (C5).** `aria-label={label}` on each `NavLink`, and `sr-only` not `hidden`. Or remove the minimize behaviour (`V2Shell.tsx › IosTabBar`).
8. **Screen titles (I1).** Greeting on Home only; elsewhere the page title is the 34 pt large title and the single `h1`; drop the logo on phone (I15). Files: `V2Shell.tsx › TopBar` (+ a `title` via route `handle` in `src/app/router.tsx`).
9. **Back navigation (I2).**
   - Add a 44 pt `ChevronRight` back bar for pushed routes (`/matieres/:id`, `/seances/:id`, `/video/*`, `/offres`) in `V2Shell.tsx`.
   - Remove the breadcrumb links in `video/VideoScreen.tsx` and `recordings/SubjectRecordingsScreen.tsx`.
10. **Follow the system appearance (I3).** `initTheme()` falls back to `prefers-color-scheme` and listens for changes (`src/app/providers.tsx`).
11. **One sheet, done right (I4).**
    - Make `matieres/parts.tsx › FilesSheet` use the `DocsSheet.tsx` classes (`bg-v2-surface px-4 pb-[max(1.25rem,var(--sai-bottom))]`, v2 title styles), or a shared `V2Sheet` in `ui.tsx`.
    - Add drag-to-dismiss on the grabber and drop the overlay blur under iOS (`components/ui/sheet.tsx`).
12. **Lime means one thing (I5).** Selected chips, segments and the current playlist row move to a navy fill or teal outline:
    - `src/styles/skins/play.css` (`.v2-chip` pressed state);
    - `video/PlaylistPanel.tsx`;
    - `matieres/SubjectScreen.tsx`.
13. **Search (I6).**
    - Placeholder "ابحث على مادّة ولّا حصّة"; matière hits route to `/matieres/:id` (`header/SearchBox.tsx`).
    - Optionally a trailing search button in `IosTabBar`.
14. **Tab selection map (I7).** `/video/seance/*` → تسجيلات, `/video/lesson/*` → الدروس (`V2Shell.tsx`, `src/app/nav/studentV2.ts`). Decide Offers' place (tab or back-bar page).
15. **Status-bar scroll edge (I8).** Fixed top fade and blur strip of `var(--sai-top) + 12px` under iOS (`V2Shell.tsx`, `src/styles/platform/ios.css`).
16. **Truncation and card hierarchy (I9).**
    - `line-clamp-2` on chapter and lesson titles (`matieres/SubjectScreen.tsx`).
    - Lesson title as the bold line, matière as the kicker, no uppercase (`dashboard/RecentSection.tsx`).
17. **Group switcher (I10).** A 3-segment equal-width control, 44 pt (`video/PlaylistPanel.tsx`).
18. **Increase Contrast and haptics (I11).**
    - `@media (prefers-contrast: more)` block (`src/styles/platform/ios.css`).
    - A haptic bridge for `sfx()` (`src/features/student-v2/sound.ts`).
    - Move the sound toggle to Settings (`V2Shell.tsx`).
19. **Copy consistency (I12, I13).**
    - "الرزنامة" everywhere (`src/app/nav/studentV2.ts`, `calendar/CalendarScreen.tsx`).
    - One name per subject (`lib.ts`).
    - Arabic ribbons (`matieres/matieres.ts`, `RecentSection.tsx`).
    - Calendar grid first, no self-link CTA (`calendar/CalendarScreen.tsx`).
20. **Polish (I14, I16–I19).**
    - Filled selected tab icon (`IosTabBar`).
    - Mirror the speaker icon (`V2Shell.tsx › SoundToggle`).
    - Concentric radii, outer 30 (`src/styles/platform/ios.css`).
    - Dim portraits in dark mode (`src/styles/v2.css`).
    - Caption on the files progress bar (`matieres/parts.tsx`).
21. **Review hygiene (not scored).** Hide `StatesDock` inside the phone frames (`features/student-v2/demoStates.tsx`).
