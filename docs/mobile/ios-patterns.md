# iOS design language for a web prototype — iOS 26 "Liquid Glass" → iOS 27

> Research notes for restyling the élève space (`/student-v2`) as an **iOS skin** shown inside an
> iPhone 13 Pro Max frame in a browser. Researched **2026-10-26**. Apple's HIG pages are JS-rendered,
> so they were read through Apple's DocC JSON endpoint
> (`developer.apple.com/tutorials/data/design/human-interface-guidelines/<page>.json`); dates in
> brackets are the pages' own change-log dates. Each section separates **what Apple says** (cited,
> `[S-n]` → Sources) from **what we do**. Numbers are points (pt); on the web 1 pt = 1 CSS px.

---

## 1. What's current — Liquid Glass (iOS 26) and the iOS 27 refinements

### Timeline (verified)

| Date | Event | Source |
|---|---|---|
| 2025-06-09 | WWDC25: Liquid Glass announced; HIG Materials/Color/Buttons/Toolbars rewritten; Navigation-bar guidance folded into Toolbars (the old `navigation-bars` page now 404s) | S-1, S-4, S-7 |
| 2025-09 | iOS 26 ships; HIG Materials updated 2025-09-09 | S-1 |
| 2025-11-03 | iOS 26.1: Settings › Display & Brightness › **Liquid Glass: Clear / Tinted** (binary) | S-30 |
| 2025-12-16 | HIG: "Updated guidance for Liquid Glass" (Buttons, Color, Toolbars); emphasized weights added to the Dynamic Type tables | S-4, S-5, S-7 |
| 2026-06-08 | WWDC26: **iOS 27** announced. Slider "from ultra clear to fully tinted"; glass "diffuses content behind it much more effectively"; "darkened edge with brighter specular highlights"; app icons "sharper and more defined"; **opt-out removed** — `UIDesignRequiresCompatibility` "is ignored when you build for iOS 27 or later"; new toolbar `visibilityPriority` + overflow menu; new **prominent tab role** "pinning the tab to the trailing edge"; HIG Search fields: "refined guidance for search as a tab" | S-20, S-21, S-22, S-23, S-11 |
| 2026-03-24 | HIG Sheets: a Done button is always paired with Cancel or Back | HIG Sheets |
| 2026-06-08 | HIG Scroll views: prefer the **automatic** scroll-edge effect style (more opaque behind text outside glass controls); soft style only after testing legibility | HIG Scroll views |
| 2026-09-09 | HIG **Designing for iPhone Duo** (toolbars and tab bars move to the vertical axis; Back/Close at the top, then the prominent action); HIG Layout and Branding updated (size classes, not orientation; brand colour in the content layer) | HIG Designing for iPhone Duo, Layout, Branding |
| 2026-09-14 | iOS 27 released (27.0.1 on 09-28; 27.1 with iPhone Duo, 10-23). Uniform top-bar background when content scrolls under floating bars | [S] (pattern-audit-2026-11.md §2) |

**Uncertainty flags.** Press reports (Tom's Guide, TechTimes, June 2026) say Apple's own apps re-merged
Search into the tab row in iOS 27 [S-24]. Apple's materials don't say this; what Apple *did* ship is
the HIG choice between a **standard search tab** ("Tapping the search tab navigates people to a search
landing page with a search field at the top") and a **button appearance** ("a separate button… brings
focus to the search field and displays the keyboard") [S-11], plus the generalised prominent-tab role
[S-21, S-25]. Treat "search looks like a normal tab again" as *an option Apple now endorses*, not a mandate.

### Materials — what Apple says [S-1, S-2]

| | Regular | Clear |
|---|---|---|
| Behaviour | "blurs and adjusts the luminosity of background content to maintain legibility"; adapts, can flip light/dark; "the one you will be using the most" | "highly translucent"; "does not have adaptive behaviors"; "permanently more transparent" |
| Use when | Anything with text or many controls (alerts, sidebars, popovers, bars) | "**Only** … for components that appear over visually rich backgrounds" (photos, video) and all three hold: media-rich content, a dimming layer is acceptable, foreground is "bold and bright" |
| Dimming | — | over bright content "add a dark dimming layer at **35% opacity**"; none needed over dark content or with AVKit controls |

Hard rules, quoted: "**Don't use Liquid Glass in the content layer**"; "**Use Liquid Glass effects
sparingly**"; "always avoid glass on glass" (use fills/vibrancy on top of glass instead); tinting
"should only be used to bring emphasis to primary elements and actions… when every element is tinted,
nothing stands out"; the two variants "should never be mixed". Accessibility: Reduce Transparency
makes glass "frostier"; Increase Contrast renders elements "predominantly black or white" with a
border; Reduce Motion "disables any elastic properties" [S-2].

**Concentric corner radii** [S-3]: three shape kinds — "fixed shapes have a constant corner radius",
"Capsules use a radius that's half the height of the container", "concentric shapes calculate their
radius by subtracting padding from the parent's" (inner r = outer r − padding). On phones Apple uses
"a capsule with extra margin near the screen edge"; the display's own corner is the outermost reference.

**What else changed automatically in iOS 26** [S-3, S-8, S-9, S-10]: tab bar floats, can
`minimize on scroll down` and re-expands on scroll up; dedicated Search tab at the bottom; bars are
transparent by default ("Remove any background customization… Using UIBarAppearance or backgroundColor
interferes with the glass appearance"); bar buttons auto-group into shared glass pills, text buttons and
Done/Close get their own; **scroll edge effect** (soft on iOS, hard on macOS; "Apply one scroll edge
effect per view") replaces hard dividers; sheets get "an increased corner radius, and half sheets are
inset from the edge"; lists "have a larger row height and padding. Sections have an increased corner
radius"; "section headers no longer render entirely in capital letters"; bordered buttons are capsules;
action sheets on iPhone now "appear directly over the originating view" with no Cancel when inline;
typography "now bolder and left-aligned… in key moments like alerts and onboarding".

**What we do.** Target the *iOS 27 reading* of the language: glass only on the navigation layer (tab
bar, header, floating player controls), everything else opaque; stronger edges and less transparency
than the first iOS 26 betas; no `url()` refraction tricks.

---

## 2. Navigation

**Tab bar — Apple says** [S-6, S-25]: it's "to support navigation, not to provide actions"; keep it
visible across sections (modal views excepted); "Don't disable or hide tab bar buttons"; labels
"single words whenever possible"; prefer "filled symbols or icons"; badge = "a red oval containing
white text" reserved for "critical information"; "Avoid overflow tabs". The HIG no longer prints a
number, but UIKit does: "If you add six or more custom view controllers… the tab bar controller displays
only the first four items plus the standard More item" → **five visible slots maximum on iPhone**.
iOS 27 adds the prominent tab (trailing edge, e.g. Search). On iPad the tab bar sits at the top / becomes a sidebar.

**Navigation bar / toolbar — Apple says** [S-7, S-8]: "Use a large title to help people stay
oriented… a large title transitions to a standard title as people begin scrolling"; keep titles
"under 15 characters"; "Prefer simple, recognizable symbols… except for actions like edit"; "Only
specify one primary action, and put it on the trailing side"; "aim for a maximum of three" groups;
"Keep actions with text labels separate" from symbol buttons (add fixed space); bar buttons use
`labelColor` by default — tint only when colour carries meaning; a `subtitle` can sit under the title.
Back is a chevron on the leading edge (the system pop gesture starts from the leading screen edge).

**Sheets — Apple says** [S-12, S-13]: two system detents — large ("fully expanded") and medium
("about half") — plus custom ones; show the **grabber** on resizable sheets ("they can also tap it to
cycle through the detents"); "People expect to swipe vertically to dismiss"; unsaved changes → confirm
with an action sheet; Cancel on the **leading** edge, Done on the **trailing** edge; in multi-step
flows Back replaces Cancel, Done activates on the last step; "Display only one sheet at a time";
"Avoid showing Cancel, Done, and Back together". Use **full-screen modal** for "videos, photos, or
camera views, or… a multistep task like marking up a document". Modality in general: "Present content
modally only when there's a clear benefit"; "Always give people an obvious way to dismiss"; never
"an app within your app"; alerts may stack on anything but "never… more than one alert at the same time" [S-14].

**Alerts / action sheets / context menus** [S-15, S-16, S-17]: alert buttons — most likely choice on
the trailing side (row) or top (stack), Cancel leading/bottom, destructive style red, "Avoid using OK
as the default button title unless the alert is purely informational"; use an **action sheet, not an
alert, for choices related to an intentional action**, destructive buttons at the top, Cancel at the
bottom; context menus open on touch-and-hold, "no more than about three groups", destructive items
last in red, "Hide unavailable menu items, don't dim them".

**What we do.** Push screens inside each tab (tab bar stays), sheets for scoped tasks (documents,
comments, filters), full-screen for the video player, action sheet for "delete comment". No "More" tab.

---

## 3. Layout & safe areas — iPhone 13 Pro Max

| Metric | Value | Source |
|---|---|---|
| Logical screen | **428 × 926 pt @3x** = 1284 × 2778 px, 458 ppi | S-26 |
| Safe-area insets, portrait | top **47** (status bar, notch device), bottom **34** (home indicator), sides 0 | S-27, S-28 |
| Safe-area insets, landscape | top 0, bottom 21, sides 47 | S-28 (community table) |
| Display corner radius | **53.33 pt**, continuous (superellipse) curve; 55 pt on 14 Pro–16, 62 pt on 16 Pro / 17 / Air — read from a private API, not an Apple spec | S-29 |
| Newer references | 17 Pro Max 440 × 956 pt; 17 Pro 402 × 874 pt; Air 420 × 912 pt | S-26 |
| Navigation bar | 44 pt standard; large-title bar 96 pt (44 + 52) — classic UIKit metrics, still what kits measure | community; verify in Apple's kit S-31 |
| Tab bar | 49 pt (classic, edge-to-edge). iOS 26 floating capsule: no official number; a community recreation uses a **≈64 px** capsule sitting **22 px** above the bottom edge | S-32 |
| Layout margins | 16 pt on narrow iPhones, **20 pt on 414/428-pt-wide models** (UIKit default layout margins; the HIG no longer prints numbers) | UIKit convention |
| Hit target | "at least **44x44 pt**"; accessibility page: default 44, minimum 28; "about 12 points of padding around elements that include a bezel… about 24 points… without a bezel" | S-4, S-18 |

Apple on safe areas [S-19]: the safe area "isn't covered on the edge by a hardware feature or another
view… like a toolbar, tab bar, or status bar"; "extend [background content] underneath sidebars,
toolbars, and tab bars to fit the entire screen"; "Instead of applying a solid or semi-opaque background
color beneath controls, use a scroll edge effect".

**What we do.** The device frame is 428 × 926 CSS px; the frame — not the app — paints the 47 px
status band and the 34 px home-indicator band, and publishes them to the app as CSS variables (§11).

---

## 4. Typography

**Dynamic Type, iOS, Large (default)** — verified [S-5]:

| Style | Weight | Size | Leading | Emphasized |
|---|---|---|---|---|
| Large Title | Regular | 34 | 41 | Bold |
| Title 1 | Regular | 28 | 34 | Bold |
| Title 2 | Regular | 22 | 28 | Bold |
| Title 3 | Regular | 20 | 25 | Semibold |
| Headline | **Semibold** | 17 | 22 | Semibold |
| Body | Regular | 17 | 22 | Semibold |
| Callout | Regular | 16 | 21 | Semibold |
| Subhead | Regular | 15 | 20 | Semibold |
| Footnote | Regular | 13 | 18 | Semibold |
| Caption 1 | Regular | 12 | 16 | Semibold |
| Caption 2 | Regular | 11 | 13 | Semibold |

Size categories (Body / Large Title): xSmall 14/31 · Small 15/32 · Medium 16/33 · **Large 17/34** ·
xLarge 19/36 · xxLarge 21/38 · xxxLarge 23/40 · AX1 28/44 · AX2 33/48 · AX3 40/52 · AX4 47/56 · AX5 53/60.
Default 17 pt, **minimum 11 pt**. SF Pro tracking (1/1000 em): 11 → +6, 12 → 0, 13 → −6, 15 → −16,
16 → −20, 17 → −26, 20 → −23, 22 → −12, 28 → +14, 34 → +12 ("the system font dynamically adjusts
tracking at every point size"). "In general, avoid light font weights" — use Regular/Medium/Semibold/Bold [S-5].

**SF Arabic** [S-33, S-34, S-35]: "a contemporary interpretation of the Naskh style", nine weights
Ultralight→Black, **optical sizes** (Text: "higher stroke contrast and wider spacing"; Display:
"simpler geometry"), SF Arabic Rounded; "Paragraphs should be always aligned to the right"; Arabic is
"slightly taller, especially with the use of dots, vocalization, and diacritic marks" → give it more
vertical space (Apple's system styles apply extra leading for Arabic automatically); next to all-caps
Latin "increase the RTL font size by about 2 points" (HIG) / "by 10%" (WWDC22); "use 0 tracking"
for Arabic unless the font is tuned for it; apply opacity "to the entire word or phrase".
Tunisia uses **Western Arabic numerals** ("Morocco, Algeria, and Tunisia") [S-34].

**What we do (web).** Keep **Cairo** (variable) as the only family — Apple itself says "Minimize the
number of typefaces" — but adopt the Dynamic Type *scale*: 34/41 title, 22/28 section, 17/22 body,
15/20 subhead, 13/18 footnote, 11 minimum; weights 400/600/700 only; `letter-spacing: 0`; Arabic
line-height 1.35–1.45 (SF's 22/17 = 1.29 is too tight for Cairo's ascenders); `font-variant-numeric:
tabular-nums` for countdowns; Western digits. Latin fallbacks for Windows demos:
`font-family: Cairo, -apple-system, system-ui, "Segoe UI", sans-serif` (SF is never web-licensed;
`system-ui` yields SF on Apple devices and Segoe on Windows).

---

## 5. Components

| Component | Apple says (iOS 26/27) | Numbers / web notes |
|---|---|---|
| **Buttons** | Styles: UIKit `plain / gray / tinted / filled` + `glass / prominentGlass / clearGlass / prominentClearGlass`; SwiftUI `.glass`, `.glassProminent`; "Bordered buttons now have a capsule shape by default"; sizes mini → extra large ("Large controls will now use capsule shapes, alongside with the new X-Large size"); "Keep the number of prominent buttons to one or two per view"; "Use style — not size — to visually distinguish the preferred choice"; show an activity indicator inside the button for slow actions ("Checking out…") [S-4, S-9, S-10, S-3] | Hit ≥ 44 × 44; visionOS heights published (mini 28, small 32, regular 44, large 52, XL 64) — iOS large CTA ≈ 50 pt in kits (unverified). Label starts with a verb. |
| **Segmented control** | "no more than about five segments on iPhone"; "either text or images — not a mix"; equal widths; capsule/glass selection in iOS 26; "For switching between completely separate sections… use a tab bar instead" [S-36] | 32 pt tall track, 44 pt hit. |
| **Switch** | "Use the switch toggle style only in a list row"; "The default green color tends to work well… you might want to use your app's accent color"; outside lists "use a button that behaves like a toggle, not a switch" [S-37]. Sizes "updated slightly" in iOS 26 [S-9] | Classic **51 × 31 pt**, thumb 27 pt (community; `intrinsicContentSize` famously reports 49 × 31) [S-38]. |
| **Lists (inset grouped)** | Grouped style "uses headers, footers, and additional space"; chevron = "reveals the next level in a hierarchy"; info button never for navigation; edit mode for reorder; persistent highlight for hierarchy rows, brief highlight + checkmark for option rows; iOS 26: taller rows, more padding, larger section radius, headers no longer uppercased [S-39, S-10] | Rows ≥ 44 pt (classic), ~52 pt feels iOS 26; separators inset to text start; section radius ≈ control radius (we use 24). |
| **Search field** | Icon + clear button + placeholder; "start search immediately when a person types"; suggestions; scope bar; tokens; iOS placement: tab (standard vs button), toolbar ("Place search at the bottom if there's room"), or inline "above the list it searches… pin it to the top toolbar when scrolling" [S-11] | 36 pt tall capsule, 17 pt text. |
| **Alerts / action sheets** | See §2. Alert titles ≤ 2 lines; action sheet titles one line; "Avoid letting an action sheet scroll" [S-15, S-16] | Two-button alerts side by side; default trailing. |
| **Context menu** | Touch-and-hold, graphical preview, ≤ 3 groups, destructive last/red, same icons as system (Copy, Share, Delete) [S-17] | 44 pt rows, 13 pt radius menu. |
| **Pull to refresh** | A refresh control is "hidden by default, becoming visible when people drag down"; "Perform automatic content updates" so people aren't "responsible for initiating every update" [S-40] | We have no network: **don't fake it**; kill browser overscroll instead (§11). |
| **Progress** | "When possible, use a determinate progress indicator"; "Keep progress indicators moving"; "Don't switch from the circular style to the bar style"; iOS 26 sliders can be `thumbless` to read as progress [S-40, S-9] | Bars fill leading → trailing (right → left in RTL). |
| **Badges** | Red oval, white text, number or "!" — critical info only [S-6] | 16–18 pt tall capsule, 13 pt semibold, top-trailing of the icon. |
| **Pickers** | Date picker styles: compact (button → modal calendar), inline, wheels, automatic; "Consider using a picker to offer medium-to-long lists"; "Avoid switching views to show a picker" [S-41] | `<input type="date">` on iOS renders the compact style natively. |
| **Text fields** | Placeholder *plus* a separate label; Clear button at the trailing end; "show the appropriate keyboard type"; validate email on leaving the field, passwords before; secure field for passwords [S-42] | **Safari zooms into any input whose rendered font-size < 16 px** — keep inputs at ≥ 16 px (`text-base`), don't use `maximum-scale=1` as the fix [S-43]. |

---

## 6. Color & dark mode

**System colours (RGB, light / dark)** [S-44]: Red 255,56,60 / 255,66,69 · Orange 255,141,40 /
255,146,48 · Yellow 255,204,0 / 255,214,0 · Green 52,199,89 / 48,209,88 · Mint 0,200,179 / 0,218,195 ·
Teal 0,195,208 / 0,210,224 · Cyan 0,192,232 / 60,211,254 · Blue 0,136,255 / 0,145,255 · Indigo
97,85,245 / 109,124,255 · Purple 203,48,224 / 219,52,242 · Pink 255,45,85 / 255,55,95 · Brown
172,127,94 / 183,138,102 (values "may fluctuate from release to release").

**Semantics** [S-44, S-45]: `systemBackground` set for plain views vs `systemGroupedBackground` set
"when you have a grouped table view" (primary = whole view, secondary = groups, tertiary = groups
within groups); labels `label / secondaryLabel / tertiaryLabel / quaternaryLabel`, `placeholderText`,
`separator`, `link`. Dark Mode uses "base" and "elevated" background sets ("elevated colors are
brighter, making foreground interfaces appear to advance"); "Avoid offering an app-specific appearance
setting"; "Soften the color of white backgrounds".

**Contrast** [S-18, S-45]: text up to 17 pt **4.5:1**, 18 pt+ or bold **3:1**; Dark Mode "no lower
than 4.5:1… strive for… 7:1, especially in small text"; "Convey information with more than color alone".

**Colour on glass** [S-44]: "Liquid Glass has no inherent color"; "reserve it for elements that truly
benefit from emphasis, such as status indicators or primary actions. To emphasize primary actions,
apply color to the background rather than to symbols or text… Refrain from adding color to the
background of multiple controls"; bar symbols are monochrome by default; "If your app already has
bright, colorful content… prefer using the default monochromatic appearance of toolbars"; "Even if your
app ships in a single appearance mode, provide both light and dark colors". Vibrancy levels on
materials: label/secondary/tertiary/quaternary — "avoid using quaternary on top of the thin and ultraThin materials" [S-1].

**What we do.** Map ink navy → `label`; navy 60% → `secondaryLabel`; navy 30% → tertiary; navy 15%
→ `separator`; our cream/off-white → `systemGroupedBackground`; white → `secondarySystemGroupedBackground`;
**teal = tint** (links, selected tab, icons that carry meaning); **lime gradient = the one prominent
CTA per screen**; live red / done orange = status only. Dark mode stays optional; if added, don't
invert the brand — lift elevated surfaces.

---

## 7. Iconography — SF Symbols 7 and Lucide

**Apple says** [S-46, S-47, S-31]: nine weights Ultralight→Black matched to the text weights; three
scales (small / medium default / large) "defined relative to the cap height"; rendering modes
monochrome, hierarchical, palette, multicolor; **SF Symbols 7** adds "gradient rendering [that]
generates a smooth linear gradient from a single source color" and **Draw On / Draw Off** ("draws along
guide points, all at once, staggered, or per layer"), **Variable Draw** for progress, and Magic
Replace that preserves shared enclosures; "Magic Replace [is] the new default replace animation";
"Apply symbol animations judiciously". The Design Resources page now lists the app as "SF Symbols 27"
with "over 7,000 symbols" (naming appears to have jumped to the OS number — observed 2026-10-26).
Custom icons must match "size, level of detail, stroke thickness (or weight), and perspective",
"match the weights of interface icons and adjacent text", ship as SVG/PDF, and "include a flipped
version… when the context is right-to-left" for anything depicting text [S-48]. Tab bars prefer **filled** glyphs [S-6].

**What we do with Lucide** (stroke-based, so it reads as the Regular/Medium symbol weights):

| Place | Size | `strokeWidth` | Notes |
|---|---|---|---|
| Tab bar | 26 px | 1.75 (unselected) / 2.25 + `fill="currentColor"` at 18% (selected) | Approximates SF's filled selected state; label 11 px semibold below |
| Nav bar / 44-pt glass circles | 22 px | 2 | Semibold feel next to 17 pt semibold text |
| List rows, chips | 20 px | 1.75 | Match Body regular |
| Inline with 13–15 pt text | 16–18 px | 1.5–1.75 | |

Never animate icons on load; a single `success` check may use a draw-on (`stroke-dasharray`) ≤ 400 ms.

---

## 8. Motion & haptics

**Motion — Apple says** [S-49, S-50]: "Aim for brevity and precision in feedback animations";
"generally avoid adding motion to UI interactions that occur frequently"; "Let people cancel motion";
glass "responds to direct touch interaction with greater emphasis… more subdued… using a trackpad".
Springs are defined by **duration + bounce** ("duration… is a perceptual duration"), bounce range −1…1,
"you should be cautious about using values higher than around 0.4", "When you're not sure, use a
spring with bounce 0"; presets `.smooth` (no bounce), `.snappy` ("small amount of bounce"), `.bouncy`
— the session's worked examples are 0.5 s with bounce 0 / 0.15 / 0.3. Springs keep velocity on
interruption, which is why sheets and back-swipes feel continuous. Reduce Motion: "reducing automatic
and repetitive animations, including zooming, scaling, and peripheral motion", tighten springs, "replace
x/y/z transitions with fades", avoid animating into/out of blurs [S-18].

**What we do.** `--ease-ios: cubic-bezier(.2,.8,.2,1)`; 150 ms press (scale .97), 250 ms state
changes, 350 ms push/pop, 400–450 ms sheet present (spring-like via `linear()` easing or WAAPI);
dismissals are gesture-driven where feasible; `prefers-reduced-motion` → crossfade only.

**Haptics → sound cues.** Apple's meanings are fixed ("Use system-provided haptic patterns according
to their documented meanings… avoid using the pattern to mean something else"; "synchronize sound with
haptics"; "Let people turn off or mute haptics") [S-51]. The web has no haptics, so each pattern maps
to one `uisfx` cue from `docs/sound-effects.md`:

| Apple pattern | Documented meaning | Our cue |
|---|---|---|
| Notification · success | "a task or action has completed" | `success` (`achievement` for rare milestones) |
| Notification · warning | "a warning of some kind" | `warning` |
| Notification · error | "an error has occurred" | `error` (`blocked` when the cause is a lock) |
| Impact · light | "collision between small or lightweight UI objects" | `press` / `select` |
| Impact · medium | "medium-sized or medium-weight UI objects" | `open` / `close` |
| Impact · heavy | "large or heavyweight UI objects" | `drop` / `delete` |
| Impact · rigid | "hard or inflexible UI objects" | `snap` / `lock` |
| Impact · soft | "soft or flexible UI objects" | `swipe` / `focus` |
| Selection | "a UI element's values are changing" | `select` (pickers, day chips), `toggle-on/off` (switches) |

---

## 9. Accessibility (what the skin must keep)

Apple [S-18, S-5, S-2]: "give people the option to enlarge text by at least 200 percent"; layouts
must survive AX sizes (stack horizontally adjacent views, "Increase the size of meaningful interface
icons as font size increases"); contrast as in §6; targets 44 / min 28 with 12–24 pt spacing; "Offer
alternatives to gestures" (a button next to every swipe); VoiceOver labels for every custom icon;
Reduce Motion / Reduce Transparency / Increase Contrast / Bold Text are system-wide and glass adapts to
them ("frostier", black-or-white with border); iOS 27's "show borders" environment (Button Shapes) is
now shared with macOS [S-21]. **Web equivalents:** `prefers-reduced-motion`,
`prefers-reduced-transparency`, `prefers-contrast: more`, `prefers-color-scheme`, `rem`-based type so
browser zoom scales it, `aria-label` on icon-only buttons, visible focus rings for keyboard demos.

---

## 10. Right-to-left on iOS (Arabic)

Apple's RTL page and "Design for Arabic" [S-35, S-34, S-48]:

| Flip (mirror) | Do **not** flip |
|---|---|
| Layout order, navigation bar, "a back button must point to the right", next/previous | Logos "even if it includes text"; photos/illustrations; "the sun always rises from the east" |
| Progress bars, sliders "including the glyphs at their beginning and end"; order of numerals "that show progress or a counting direction" | Clocks ("clock hands… match the physical clock"); checkmark ("Universal symbols"); the magnifying glass (right-hand angle); tools like pencils |
| Icons "that depict forward or backward motion" (speaker waves, reading-direction icons, text-alignment icons) | "a control that refers to an actual direction or points to an onscreen area"; the slash in SF Symbols; digits inside a number ("Don't reverse the order of numerals… 541, phone numbers") |
| Carousels, pagination dots, calendars ("the progress and the flow of dates, months, and years is from right to left"); toggles and segmented controls | Playback transport — not addressed by the HIG page; SF Symbols only ships RTL variants for reading-direction glyphs (300+ Arabic/RTL symbols), none for `play`/`forward`, so **keep play / next / previous unmirrored** |
| Badge position (top-trailing) and list-item order when order is meaningful | Charts: "dependent on the country, so you would want to double-check" |

Text: "Align a paragraph based on its language" (3+ lines), shorter text follows the interface
direction; "Use a consistent alignment for all text items in a list". Numerals: Tunisia → Western
digits; "all mathematical calculations happens from right to left". Gestures: UIKit's pop gesture
is on the leading edge, i.e. **the right edge in RTL**; sheets are vertical and unaffected.

---

## 11. Web implementation notes (emulating iOS inside a browser / device frame)

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="color-scheme" content="light">
```

```css
:root { --sai-top: env(safe-area-inset-top, 0px); --sai-bottom: env(safe-area-inset-bottom, 0px); } /* src/styles/index.css, App base */
/* inside the device frame env() is useless → src/app/platform.ts stamps the frame's bars on <html> (sides are 0 in portrait) */
html[data-framed] { --sai-top: 47px; --sai-bottom: 34px; }
.app { height: 100vh; height: 100dvh; overscroll-behavior: none; -webkit-tap-highlight-color: transparent; }
.tabbar { padding-bottom: max(8px, var(--sai-bottom)); }
/* Glass: OUR DEFAULT IS THE CLEAR MATERIAL (decision 2026-11-15): `ios-glass` = near-zero fill,
   blur 2.5 + saturate 160 % + brightness 1.12, rim + edge + shadow; add [--glass-alpha:15%] where
   labels must stay legible. The thicker regular recipe below is kept for reference.
   Previously shipped: `ios-glass` / `ios-glass-clear` in src/styles/platform/ios.css
   (2026-11-15, from docs/mobile/glass-research.md): 36 % fill (50 % on labelled bars), blur 10
   + saturate 190 % + brightness 1.06, a directional specular rim over a darkened edge, contact +
   ambient shadow, press = glow + scale (never fade). The earlier 72 % / blur 16 recipe read as a
   plain white disc: too opaque to show what's behind, no rim light, no edge. */
input, select, textarea { font-size: max(16px, 1rem); }  /* no Safari focus-zoom */
```

| Fact | Detail | Source |
|---|---|---|
| `viewport-fit=cover` | Without it every `env(safe-area-inset-*)` is 0 and Safari letterboxes with the page `background-color`; combine with `max(12px, env(...))` | S-52, S-53 |
| **Inside an iframe** | Unspecified: "Chrome seems to be 0 in embedded (child) document… Safari seem be same value for parent"; CSSWG issue #4670 still open → the host must pass insets as CSS variables / URL params | S-54 |
| Status bar meta | `default`/`black` keep content below the bar; `black-translucent` shows "web content… on the entire screen, partially obscured by the status bar"; only in standalone mode | S-55 |
| `100dvh` | Safari 15.4+; declare `100vh` first as fallback | S-56 |
| `overscroll-behavior` | Safari 16 / iOS 16+; `none` on the app root removes rubber-banding and browser pull-to-refresh, `contain` on inner scrollers stops scroll chaining | S-57 |
| Momentum scroll | `-webkit-overflow-scrolling: touch` obsolete since iOS 13 ("eliminating the need to set -webkit-overflow-scrolling: touch") | S-58 |
| Input zoom | Safari zooms when the *rendered* input font-size < 16 px (transforms count) | S-43 |
| Glass | `backdrop-filter` blur 8–24 px + `saturate(140–180%)` + 1 px light rim + inset top highlight; `backdrop-filter: url(#svg)` is Chromium-only and **Safari drops the whole declaration if any part is invalid** → gate with `@supports`; blur is the main cost, never on scrolling list items | S-59 |
| Taps | `touch-action: manipulation` removes double-tap zoom delay; style your own `:active` since the highlight is disabled | — |
| PWA | `window.navigator.standalone` detects standalone; `@media (display-mode: standalone)`; reported WebKit bugs with stale insets after client-side navigation (bug 274773) | S-55, S-53 |

---

## 12. Open-source & tools worth knowing (checked 2026-10-26)

| Tool | What / status | Fit for us |
|---|---|---|
| **Apple Design Resources** [S-31] | Official **iOS 27 & iPadOS 27 UI kit** (Figma + Sketch), app-icon template 27, fonts (SF Pro, SF Compact, SF Mono, New York, **SF Arabic**, SF Hebrew…), **SF Symbols 27** app (macOS Sonoma+). The iOS 26 Figma kit (community file 1527721578857867021) was last updated 2026-07-24 [S-60]. Fonts are licensed for Apple-platform design/development only — never ship SF on the web. | The single source for exact bar/sheet/list metrics — measure there, not from blogs. |
| **Konsta UI** v5.5.0, 2026-09-28, MIT [S-61, S-62] | "Pixel perfect mobile UI components built with Tailwind CSS… iOS and Material"; v5 has "updated iOS 26 and Material Design 2025 look and feel"; React/Vue/Svelte; "mostly designed to be used with 'parent' frameworks like Ionic or Framework7". Tailwind v4 compatibility not verified. | Best reference for iOS list/sheet/segmented CSS in a Tailwind codebase; copy patterns, don't adopt (CLAUDE.md forbids UI kits). |
| **Framework7** v9.2.0, 2026-09-28, MIT [S-63] | Full mobile framework (router, views) with iOS theme; Core/React/Vue/Svelte. | Too heavy next to React Router; good for studying iOS transitions. |
| **Ionic** `@ionic/core` 9.0.9, MIT [S-64, S-65] | `mode="ios"` styles components after iOS; docs don't mention Liquid Glass. | Reference only. |
| **nikdelvin/liquid-glass** MIT [S-66] | CSS + SVG displacement, "Safari automatically falls back to a blurred glassmorphism effect"; Astro/Tailwind demo. | Nice demo; refraction unnecessary for us. |
| **Amir-Abushanab/liquid-glass-js** MIT [S-67] | SVG `feDisplacementMap` applied to live DOM "so it works in every modern browser" (Safari/Firefox paint nothing for `backdrop-filter: url()`); WebGL fallback for video. | If refraction is ever wanted on the player, this is the one that works in Safari. |
| DEV "Liquid glass CSS" recipe [S-59] | Pure-CSS frosted pane: `blur(8px) saturate(180%)`, inset highlights, light-mode variant (white ≈ 0.45, blur 12–16, saturate ≈ 140%), `@supports` gating, perf and `prefers-reduced-transparency`. | Our glass recipe is derived from it. |

---

## 13. Rules for Wael Academy (iOS skin)

Scope: `/student-v2`, RTL, Cairo, brand palette unchanged. Every rule is checkable at 428 × 926.

**Frame, status bar, home indicator**
1. The iPhone 13 Pro Max frame renders a **47 px status band** (time at the leading edge, no mirroring unless verified on a device) and a **34 px home-indicator band** (black pill 134 × 5, radius 2.5, centred, 8 px above the bottom); the app receives `--sai-top:47px; --sai-bottom:34px` on `<html>` (sides are 0 in portrait; `src/app/platform.ts`) and must never read `env()` directly (it is 0 inside a frame/iframe).
2. App content scrolls **under** the status band and the tab bar (they are glass); the scroll container has `padding-top: var(--sai-top)` only where no header exists, and `padding-bottom: calc(var(--sai-bottom) + 8px + 64px)` so the last row clears the floating bar.
3. The app's outermost corner radius equals the frame's screen radius (53.33 px, `corner-shape: superellipse` where supported, else plain radius); the frame clips, the app never draws its own screen corners.

**Tab bar (6 → 5)**
4. The bottom bar shows exactly **five** tabs, in reading order from the right: الرئيسية · الدروس · الرزنامة · تسجيلات · مجموعاتي. **العروض leaves the bar** and becomes the first row of the profile/avatar sheet ("اشتراكي والعروض", with a `warning`-coloured dot when the subscription is expiring) and the destination of every `blocked` lock state (locked recording, locked matière) — offers are reached from an upsell moment, not browsed daily by a 14–19-year-old. No "More" tab, ever; a sixth section goes to the profile sheet.
5. Geometry: a floating capsule (`border-radius: 999px`), **≈ 64 px tall**, ≈ 21 px from the left, right and bottom edges (iOS 26 kit measurement, secondary — measure in the iOS 27 kit; the code still has 16 px sides and `calc(var(--sai-bottom) + 8px)`); glass per §11 with our 1 px navy/15% border; each tab a 44 × 44 hit area with a 26 px Lucide icon (stroke 1.75) over an 11 px regular label (medium when selected); the selected tab gets a teal capsule fill at 12% and the icon switches to stroke 2.25 + 18% fill; `data-uisfx="select"` on each tab.
6. No minimize on scroll (HIG: only for tab bars with an accessory; minimising also left the tabs unnamed — `apple-design-audit.md` C5). Never hide a tab or disable it — an empty section shows an empty state instead.
7. Badges on tabs: red (iOS `255,56,60`) capsule, 13 px semibold white, top-trailing (top-left in RTL) of the icon — notifications count only, never decoration.

**Headers**
8. Every top-level tab screen opens with a **large title**: Cairo 700, 34/41 px, right-aligned, 16 px side margin, that collapses on scroll to a **44 px bar** with a 17 px semibold centred title; behind it, Apple's **automatic** scroll-edge style (HIG Scroll views, 2026-06-08) — opaque enough behind the collapsed title, since it is text outside glass controls (`bg-v2-surface/80` + blur with a short mask); a soft, fill-less fade only for a bar holding nothing but glass buttons; no bottom border. No large title in compact height (landscape).
9. Pushed screens use the collapsed bar only: a **44 × 44 glass circle with a chevron pointing right** on the leading (right) edge, `data-uisfx="back"`, plus the browser back gesture; at most one tinted "primary" action on the trailing (left) edge; symbol buttons grouped in one glass pill, text buttons in their own.
10. Search lives **inline under the large title** of الدروس and تسجيلات (36 px capsule, placeholder in derja, clear button at the trailing end, results filter as you type, pinned to the bar on scroll) — not a search tab, because we have no global search landing page.

**Lists & cards**
11. Replace bordered white panels inside screens with **inset grouped lists**: section background white on the cream page, **radius 22 px** (concentric: 38 − 16), **no border**, 0.5 px navy/15% separators inset to the text start, section headers 13 px regular sentence-case (never uppercase).
12. Rows are **≥ 52 px** tall, 17 px body, 15 px secondary, a `chevron-left` (pointing in the navigation direction) at 15 px navy/30% on navigable rows only; press feedback = navy/8% background for 150 ms; swipe actions only where a visible "…" overflow exists too (CLAUDE.md: no hover-/gesture-only actions).
13. Dashboard "live séance" and subject badges stay **cards** (they are hero content, not lists) but adopt the 22 px radius, remove the border when sitting on cream, and keep one prominent CTA each.

**Buttons & controls**
14. Primary CTA = **capsule, 50 px tall, 17 px semibold**, lime→teal gradient background (our "tinted prominent"), **one per screen**; secondary = capsule navy/8% fill with navy text; tertiary = plain teal text; destructive = iOS red text/fill. Icon-only buttons are 44 px glass circles. Pressed state: scale .97 + 80% opacity, 150 ms — except glass controls, which light up and swell (`scale 1.06`, inner glow) instead of fading.
15. Segmented controls (week/month, filter tabs) are capsules with a sliding white glass indicator (200 ms), ≤ 5 segments, text only, equal widths, `toggle-on` cue.
16. Switches are 51 × 31 capsules, green (`52,199,89`) or teal, **only inside list rows**; elsewhere use a toggle button.
17. Inputs: 44 px tall, 16 px+ text, 12 px radius, clear button, `inputmode` set, label above the field in addition to the placeholder.

**Sheets, alerts, menus**
18. Bottom sheets (documents, comments, filters, profile): grabber 36 × 5 px navy/30% 8 px from the top, **top radius 38 px**, detents medium (50%) and large (`100% − var(--sai-top) − 10px`) — the medium detent inset from the sides and bottom on glass (corners following the display), the large detent opaque and edge-attached (radii unverified — measure in the iOS 27 kit), drag to dismiss, dim backdrop 40% navy; "سكّر" (Cancel) on the leading edge of the sheet's bar, "تم" (Done) on the trailing edge; never two sheets at once; `open` / `close` cues.
19. Destructive choices (delete comment, leave group) use an **action sheet**: started from a control, it appears over that control as a glass popover with no Cancel row (iOS 26; tapping outside cancels); started from a sheet or with no anchor, a grouped list rising from the bottom, destructive row in red at the top, "إلغاء" as a separate capsule below; unsaved-changes dismissals confirm the same way. Alerts only for unexpected problems, two side-by-side buttons, default on the trailing side.
20. Long-press on replay, document and séance cards opens a **context menu** (glass container, ≈ 22–26 px radius — measure in the iOS 27 kit, icons on every row, ≤ 3 groups, destructive last, `open` cue) — and every item in it is also reachable from a visible control.

**Video player, calendar, matières**
21. The player is a **full-screen modal** (no tab bar): transport icons never mirror; the scrubber fills right→left with elapsed time at the right; controls sit on *clear* glass with a 35% black dimming layer that auto-hides after 3 s; playlist = inset grouped list; comments = medium/large sheet with the composer pinned above the keyboard (`100dvh`).
22. Calendar: week strip flows right→left, today in a teal capsule, 44 px day chips, week/month in a segmented control, horizontal swipe + `swipe` cue, Western digits with `tabular-nums`.
23. Matières: subject tiles in a 2-column grid (radius 22 (concentric: 38 − 16), 20 px gutter); chapters as an inset grouped list with chevrons; content-type chips as capsules; completion bars fill right→left; the eye-following badges stay but respect `prefers-reduced-motion`.

**Type, colour, glass, motion, sound**
24. Type scale = Dynamic Type Large (34/41, 22/28, 20/25, 17/22, 15/20, 13/18, 12/16, 11 min) in Cairo 400/600/700, Arabic line-height ≥ 1.35, `letter-spacing: 0`, all sizes in `rem` so browser zoom ≈ Dynamic Type; nothing below 11 px.
25. Colour roles: navy = label, navy/60 = secondary, navy/30 = tertiary, navy/15 = separator, teal = tint, lime gradient = the one prominent action, red/orange = status. Every text/background pair ≥ 4.5:1 (≤ 17 px) or 3:1 (≥ 18 px / bold).
26. Glass appears only on the tab bar, headers, player controls, sheets' bars, and — iOS 26+ — partial-height sheets, menus and popovers (opaque text rows inside) — never on cards, lists or the page; never glass on glass; under `prefers-reduced-transparency` it becomes 96% white.
27. Motion: springs-feel easing, 150 / 250 / 350 / 450 ms for press / state / push / sheet; dismissals follow the finger; `prefers-reduced-motion` → fades only; no motion on load.
28. Every new control carries a `uisfx` cue per the haptic mapping in §8 (`success`/`warning`/`error`/`select`/`press`/`open`/`close`) and sound is never the only feedback.

### Checklist (before calling a screen "iOS")
- [ ] Frame shows status band 47 px + home band 34 px; app reads `--sai-*` vars, not `env()`.
- [ ] Five tabs, العروض reachable from profile sheet and from lock states; selected tab filled; labels single words.
- [ ] Large title → 44 px collapsed bar; back chevron points right; one tinted action max.
- [ ] Lists inset-grouped, radius 22 (concentric: 38 − 16), no border, inset separators, rows ≥ 52 px, chevrons only on navigable rows.
- [ ] One prominent capsule CTA per screen; all hit areas ≥ 44 px; 12 px between adjacent targets.
- [ ] Sheets have grabber + detents + drag dismiss; medium detent inset on glass, large detent opaque; destructive flows use action sheets (anchored over their control when started from one).
- [ ] Player full-screen; transport unmirrored; scrubber mirrored.
- [ ] Inputs ≥ 16 px (no Safari zoom); `overscroll-behavior: none` on root; `100dvh`.
- [ ] Glass only on bars/controls; reduced-transparency and reduced-motion fallbacks verified.
- [ ] Contrast 4.5:1 / 3:1 passes; icon-only buttons have `aria-label`.
- [ ] Each control plays its cue; `npm run check:sounds` and `npx tsc -b` pass; verified at 428 × 926 and 390 × 844.

---

## Sources (all accessed 2026-10-26)

- S-1 HIG — Materials — https://developer.apple.com/design/human-interface-guidelines/materials (JSON: …/tutorials/data/design/human-interface-guidelines/materials.json)
- S-2 WWDC25 219 — Meet Liquid Glass — https://developer.apple.com/videos/play/wwdc2025/219/
- S-3 WWDC25 356 — Get to know the new design system — https://developer.apple.com/videos/play/wwdc2025/356/
- S-4 HIG — Buttons — https://developer.apple.com/design/human-interface-guidelines/buttons
- S-5 HIG — Typography — https://developer.apple.com/design/human-interface-guidelines/typography
- S-6 HIG — Tab bars — https://developer.apple.com/design/human-interface-guidelines/tab-bars
- S-7 HIG — Toolbars (absorbed Navigation bars, 2025-06-09) — https://developer.apple.com/design/human-interface-guidelines/toolbars
- S-8 WWDC25 284 — Build a UIKit app with the new design — https://developer.apple.com/videos/play/wwdc2025/284/
- S-9 (same session as S-8; control sizes, glass configurations, action sheets)
- S-10 Apple — Adopting Liquid Glass (Technology Overviews) — https://developer.apple.com/documentation/TechnologyOverviews/adopting-liquid-glass
- S-11 HIG — Search fields (updated 2026-06-08) — https://developer.apple.com/design/human-interface-guidelines/search-fields
- S-12 HIG — Sheets (updated 2026-03-24) — https://developer.apple.com/design/human-interface-guidelines/sheets
- S-13 WWDC25 323 — Build a SwiftUI app with the new design — https://developer.apple.com/videos/play/wwdc2025/323/
- S-14 HIG — Modality — https://developer.apple.com/design/human-interface-guidelines/modality
- S-15 HIG — Alerts — https://developer.apple.com/design/human-interface-guidelines/alerts
- S-16 HIG — Action sheets — https://developer.apple.com/design/human-interface-guidelines/action-sheets
- S-17 HIG — Context menus — https://developer.apple.com/design/human-interface-guidelines/context-menus
- S-18 HIG — Accessibility — https://developer.apple.com/design/human-interface-guidelines/accessibility
- S-19 HIG — Layout — https://developer.apple.com/design/human-interface-guidelines/layout
- S-20 Apple Newsroom, 2026-06-08 — Apple unveils next generation of Apple Intelligence, Siri AI, and more — https://www.apple.com/newsroom/2026/06/apple-unveils-next-generation-of-apple-intelligence-siri-ai-and-more/
- S-21 WWDC26 102 — Platforms State of the Union — https://developer.apple.com/videos/play/wwdc2026/102/
- S-22 Meet with Apple 277 — Discover what's next: The biggest updates from WWDC26 — https://developer.apple.com/videos/play/meet-with-apple/277/
- S-23 Apple — UIDesignRequiresCompatibility (Info.plist key) — https://developer.apple.com/documentation/BundleResources/Information-Property-List/UIDesignRequiresCompatibility
- S-24 TechTimes, 2026-06-08 — Apple Liquid Glass iOS 27: WWDC 2026 brings refinements — https://www.techtimes.com/articles/317975/20260608/apple-liquid-glass-ios-27-wwdc-2026-brings-refinements-developers-must-adopt-today.htm (press reports; also Tom's Guide "iOS 27 has a bunch of changes…", not fetchable here)
- S-25 Apple — UITabBarController (More item, prominentTabIdentifier, UISearchTab) — https://developer.apple.com/documentation/uikit/uitabbarcontroller
- S-26 iOS Ref — Device resolutions — https://iosref.com/res
- S-27 Fatbobman — SwiftUI Safe Area (logged insets 47/34) — https://fatbobman.com/en/posts/safearea/
- S-28 Use Your Loaf — iPhone 13 Screen Sizes (via search excerpt; site not fetchable here) — https://useyourloaf.com/blog/iphone-13-screen-sizes/
- S-29 kylebshr/ScreenCorners — display corner radii — https://github.com/kylebshr/ScreenCorners
- S-30 MacRumors, 2025-10-20 — iOS 26.1 transparency option — https://www.macrumors.com/2025/10/20/ios-26-1-transparency-option-liquid-glass/ ; Engadget — How to adjust the Liquid Glass effect in iOS 26.1 — https://www.engadget.com/mobile/smartphones/how-to-adjust-the-liquid-glass-effect-in-ios-261-203634681.html
- S-31 Apple Design Resources — https://developer.apple.com/design/resources/
- S-32 Codefronts — iOS 26 Floating Tab Bar (community CSS recreation) — https://codefronts.com/navigation/css-liquid-glass-navbars/ios-26-floating-tab-bar/
- S-33 WWDC22 110381 — Meet the expanded San Francisco font family — https://developer.apple.com/videos/play/wwdc2022/110381/
- S-34 WWDC22 10034 — Design for Arabic — https://developer.apple.com/videos/play/wwdc2022/10034/
- S-35 HIG — Right to left — https://developer.apple.com/design/human-interface-guidelines/right-to-left
- S-36 HIG — Segmented controls — https://developer.apple.com/design/human-interface-guidelines/segmented-controls
- S-37 HIG — Toggles — https://developer.apple.com/design/human-interface-guidelines/toggles
- S-38 Open Radar 31777116 — UISwitch intrinsic content size (49 vs 51 × 31) — https://openradar.appspot.com/31777116
- S-39 HIG — Lists and tables — https://developer.apple.com/design/human-interface-guidelines/lists-and-tables
- S-40 HIG — Progress indicators (incl. refresh content controls) — https://developer.apple.com/design/human-interface-guidelines/progress-indicators
- S-41 HIG — Pickers — https://developer.apple.com/design/human-interface-guidelines/pickers
- S-42 HIG — Text fields — https://developer.apple.com/design/human-interface-guidelines/text-fields
- S-43 Defensive CSS — Input zoom on iOS Safari — https://defensivecss.dev/tip/input-zoom-safari/ ; Jeffery To — No input zoom in Safari on iPhone — https://thingsthemselves.com/no-input-zoom-in-safari-on-iphone-the-pixel-perfect-way/
- S-44 HIG — Color (updated 2025-12-16) — https://developer.apple.com/design/human-interface-guidelines/color
- S-45 HIG — Dark Mode — https://developer.apple.com/design/human-interface-guidelines/dark-mode
- S-46 HIG — SF Symbols (updated 2025-07-28) — https://developer.apple.com/design/human-interface-guidelines/sf-symbols
- S-47 WWDCNotes — What's new in SF Symbols 7 (WWDC25 337) — https://wwdcnotes.com/documentation/wwdc25-337-whats-new-in-sf-symbols-7/ ; Apple session — https://developer.apple.com/videos/play/wwdc2025/337/
- S-48 HIG — Icons — https://developer.apple.com/design/human-interface-guidelines/icons
- S-49 HIG — Motion (updated 2025-09-09) — https://developer.apple.com/design/human-interface-guidelines/motion
- S-50 WWDC23 10158 — Animate with springs — https://developer.apple.com/videos/play/wwdc2023/10158/
- S-51 HIG — Playing haptics — https://developer.apple.com/design/human-interface-guidelines/playing-haptics
- S-52 WebKit blog — Designing Websites for iPhone X — https://webkit.org/blog/7929/designing-websites-for-iphone-x/
- S-53 Mironsoft, 2025-04-23 — CSS env() and Safe Area Insets — https://www.mironsoft.de/en/blog/css-safe-area-insets-iphone-notch-dynamic-island
- S-54 CSSWG issue #4670 — safe-area-insets-* for embedded document by iframe — https://github.com/w3c/csswg-drafts/issues/4670
- S-55 Apple — Safari HTML Reference: Supported Meta Tags — https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariHTMLRef/Articles/MetaTags.html ; Configuring Web Applications — https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html
- S-56 Bramus — The Large, Small, and Dynamic Viewports — https://www.bram.us/2021/07/08/the-large-small-and-dynamic-viewports/ (dvh in Safari 15.4 confirmed by multiple compat tables)
- S-57 WebKit blog — WebKit Features in Safari 16.0 — https://webkit.org/blog/13152/webkit-features-in-safari-16-0/ ; MDN — overscroll-behavior — https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior
- S-58 Apple Developer Forums — momentum scrolling in iOS 13 (quoting Safari 13 release notes) — https://developer.apple.com/forums/thread/127392
- S-59 DEV Community — Liquid glass CSS — https://dev.to/vitalbadjo/liquid-glass-css-the-apple-liquid-glass-effect-with-css-only-plus-svg-refraction-1hkd
- S-60 Figma Community — iOS and iPadOS 26 (Apple) — https://www.figma.com/community/file/1527721578857867021/ios-and-ipados-26 ; iOS and iPadOS 27 — https://www.figma.com/community/file/1651309003795292092/ios-and-ipados-27
- S-61 Konsta UI — https://konstaui.com/ ; GitHub — https://github.com/konstaui/konsta
- S-62 npm registry — konsta@latest — https://registry.npmjs.org/konsta/latest
- S-63 Framework7 — https://github.com/framework7io/framework7 ; npm — https://registry.npmjs.org/framework7/latest
- S-64 Ionic — Platform styles — https://ionicframework.com/docs/theming/platform-styles
- S-65 npm registry — @ionic/core@latest — https://registry.npmjs.org/@ionic/core/latest
- S-66 nikdelvin/liquid-glass — https://github.com/nikdelvin/liquid-glass
- S-67 Amir-Abushanab/liquid-glass-js — https://github.com/Amir-Abushanab/liquid-glass-js
- Project inputs: `docs/sound-effects.md` (uisfx cue grammar), `src/app/nav/studentV2.ts` (current six tabs).
