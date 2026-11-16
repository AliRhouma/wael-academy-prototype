# Device specs for the `mobile.` device gallery — iPhone 13 Pro Max & Samsung Galaxy A55 5G

Research date: 2026-10-26. Purpose: draw two realistic frames in CSS/SVG around a same-origin `<iframe>` of `/student-v2` (Arabic RTL) and emulate the system chrome (status bar, notch / punch-hole, home indicator / gesture bar, safe areas).

Legend: **[A]** Apple primary source · **[S]** Samsung primary source · **[M]** measured by a third party · **[D]** derived by arithmetic from a sourced number · **[E]** estimate (photos / UI kits / memory) — verify on a device before relying on it.

Unit conventions: iOS **pt** = 3 physical px on the iPhone (@3x); Android **dp** = 2.8125 px on the A55 at its shipped 450 dpi density (see §2.3). In the gallery, 1 pt / 1 dp = 1 CSS px inside the iframe, and the whole frame is scaled with `transform: scale()`.

---

## 1. iPhone 13 Pro Max (A2643 family, Sept 2021)

### 1.1 Core numbers

| Item | Value | Src |
|---|---|---|
| Display | 6.7" Super Retina XDR OLED, ProMotion 10–120 Hz, 1000 nits typ / 1200 HDR; "6.68 inches measured as a standard rectangle" | [A] tech specs |
| Native resolution | 2778 × 1284 px @3x → **428 × 926 pt**, 458 ppi | [A] + ios-resolution.com |
| Body (Apple drawing) | **160.84 × 78.07 × 7.65 mm** (spec sheet rounds to 160.8 × 78.1); 240 g | [A] dimensional drawing 2021-09-28 |
| Cover glass | 158.74 × 75.97 mm (housing band visible around glass ≈ 1.05 mm) | [A] drawing |
| Display active area | **153.90 × 71.13 mm** → 1 pt = 0.1662 mm, 1 mm = 6.02 pt | [A] drawing |
| Bezel (housing edge → active area) | **3.47 mm all around ≈ 20.9 pt** (so the body is ≈ 470 × 968 pt) | [A] drawing |
| Flat-side start | 1.15 mm all around (edge radius of the stainless band) | [A] drawing |
| Display corner radius | **53.33 pt ≈ 8.86 mm**, continuous (squircle) curve | [M] `_displayCornerRadius` via kylebshr/ScreenCorners |
| Body corner | Continuous curve; tangent points 17.32 mm from the corner, 45° point 3.81 mm from each edge → circle-equivalent **R ≈ 13.0 mm ≈ 78 pt** | [A] drawing Detail A, [D] |
| Notch ("active area cutout") | **26.93 mm wide × 5.60 mm deep → 162 × 33.7 pt**, centred (centre at 39.04 mm); bottom corners R 3.80 mm (22.9 pt); top fillets R 0.95 mm (5.7 pt). Apple's "20 % narrower than iPhone 12" claim ↔ 12-series ≈ 34.8 mm (209 pt) | [A] drawing; MacRumors/Macworld for the 20 % |
| Status bar | **47 pt** (notch models 12/13 non-mini); safe-area insets portrait top 47 / bottom 34; landscape left/right 47, bottom 21 | useyourloaf iPhone 13 screen sizes |
| Home indicator | 34 pt reserved area; bar ≈ **148 × 5 pt**, radius 2.5, ≈ 8 pt above the glass edge (134 pt on 375-pt phones, 139 on 390) | [E] from Apple UI kits, ±2 pt |
| Nav bar / tab bar | UINavigationBar 44 pt (+47 status = 91); large-title bar 96 pt; UITabBar 49 pt (+34 home = 83) | HIG metrics (stable since iPhone X) |
| Keyboard, portrait | ≈ **346 pt with QuickType bar, 301 pt without** (includes the 34-pt home area); measured on the 414/428-pt class | [M] Apple Developer Forums thread 798087 (iPhone 11, iOS 26 beta) |
| Finishes | Graphite, Gold, Silver, Sierra Blue, Alpine Green (Alpine Green added March 2022); "Ceramic Shield front, textured matte glass back and stainless steel design" | [A] tech specs |
| Rear camera plateau | ≈ 35.0 × 36.2 mm, 1.68 mm proud of the back glass, inset 4.27 mm from the top and (back-view) left edges; three Ø 15.53 mm lens rings (centres at 13.43/13.43, 13.43/31.35, 30.08/22.39 mm from the housing corner), lenses 3.60 mm proud of the back glass; flash Ø 6.28 mm at 30.08/9.42; LiDAR lower-right; MagSafe ring Ø 57.5 mm centred 80.42 mm from top | [A] drawing Detail D, [D] |

### 1.2 Edge controls (mm from the top edge of the body; centre ± half-length) [A] drawing

| Control | Edge | Centre | Length | Span | In pt (centre / length) | Protrusion |
|---|---|---|---|---|---|---|
| Ring/Silent switch | left | 32.22 | 5.80 | 29.3 – 35.1 | 194 / 35 | 0.60 mm |
| Volume + | left | 45.53 | 11.60 | 39.7 – 51.3 | 274 / 70 | 0.45 mm |
| Volume − | left | 58.53 | 11.60 | 52.7 – 64.3 | 352 / 70 | 0.45 mm |
| SIM tray | left | 80.28 | 16.14 | 72.2 – 88.3 | 483 / 97 | flush |
| Side button | right | 52.53 | 18.10 | 43.5 – 61.6 | 316 / 109 | 0.45 mm |
| Lightning port | bottom | centred (39.04) | — | — | — | — |

Button width across the 7.65 mm edge ≈ 3.1 mm (≈ 40 % of the edge). Speaker/mic holes: six on the right of the port, mic holes on the left (Ø 1.53 mm).

### 1.3 Safari / CSS viewport
- CSS viewport **428 × 926** (`-webkit-device-pixel-ratio: 3`). In a Home-Screen web app (`display: standalone`) there is no browser chrome: full 926 pt, `env(safe-area-inset-top) = 47`, `-bottom = 34` with `viewport-fit=cover`.
- In Safari the toolbars are dynamic: `100lvh` = toolbars retracted, `100svh` = expanded, `100dvh` follows them in steps (bram.us; Apple forum 803987 reports a 100dvh gap regression in iOS 26.0, fixed in 26.1 beta). Exact bar heights vary by iOS version — measure, don't hard-code. The gallery should emulate **standalone** mode, with an optional "show Safari chrome" toggle. **[M]**
- Chrome DevTools presets (verified in `front_end/models/emulation/EmulatedDevices.ts`): **no "iPhone 13 Pro Max"**. Exact logical twin = **"iPhone 14 Plus" (428 × 926 @3)**. Others: iPhone SE 375×667 @2, XR 414×896 @2, 12 Pro 390×844 @3, 14 390×844, 14 Pro 393×852, 14 Pro Max 430×932, 15/15 Pro 393×852, 15 Plus/Pro Max 430×932, 16e 390×844, 16 393×852, 16 Plus 430×932, 16 Pro 402×874, 16 Pro Max 440×956. Add a custom device "iPhone 13 Pro Max" 428×926 @3 with the iOS UA if you want the name.

---

## 2. Samsung Galaxy A55 5G (SM-A556B/E/V, March 2024)

### 2.1 Core numbers

| Item | Value | Src |
|---|---|---|
| Display | 6.6" Super AMOLED, **1080 × 2340**, 19.5:9, ~390 ppi (Samsung says ~390, Wikipedia 396, DXOMARK 396), 120 Hz, 1000 nits HBM, 106.9 cm², ~85.8 % screen-to-body | [S] emulator-skin page, GSMArena |
| Body | **161.1 × 77.4 × 8.2 mm**, 213 g | GSMArena, Wikipedia |
| Materials | Flat **aluminium frame** (first metal frame in the A-series relaunch), Gorilla Glass Victus+ front and back, IP67 | Wikipedia, GSMArena |
| Active area | 1080/390 × 25.4 = **70.3 mm × 152.4 mm** (checks against 106.9 cm²) | [D] |
| Bezels | sides (77.4 − 70.3)/2 ≈ **3.5 mm**; top + chin total 8.7 mm → top ≈ 3.6 mm, **chin ≈ 5.1 mm** (visibly thicker) | [D] + [E] split |
| Infinity-O hole | Ø ≈ **3.8 mm (≈ 58 px ≈ 21 dp)**, centre ≈ 3.3 mm (≈ 50 px ≈ 18 dp) below the top of the active area, horizontally centred (front camera 32 MP f/2.2). Samsung publishes no diameter | [E] from front photos; ±0.4 mm |
| Display corner radius | ≈ **4.0 mm ≈ 61 px ≈ 22 dp** | [E] ±0.5 mm |
| Body corner radius | ≈ 7.5 mm (display radius + bezel) | [E] |
| "Key Island" | Raised strip on the **right** edge carrying volume rocker + power key. Island ≈ 34–78 mm from top; volume rocker ≈ 37–59 mm (centre 48, 22 mm long); power key ≈ 64.5–75.5 mm (centre 70, 11 mm long); ≈ 0.5 mm proud of the frame. Left edge: nothing. Bottom: SIM tray, mic, USB-C (centred), speaker. Top: mic | [E] from product photos, ±3 mm |
| Rear cameras | Three separate vertically stacked rings (no island) top-left of the back: each Ø ≈ 11.5 mm, pitch ≈ 15 mm, first centre ≈ 8 mm from top and left edges; LED flash right of the top ring | [E] |
| Colours | **Awesome Iceblue, Awesome Lilac, Awesome Navy, Awesome Lemon** | [S], Wikipedia |
| Software | Launch **Android 14 / One UI 6.1** (announced 11 Mar 2024, released 15 Mar 2024). **One UI 7 / Android 15: May 2025.** **One UI 8 / Android 16: late Sept 2025 (Korea, as Galaxy Quantum5) → broad rollout from ~2 Oct 2025.** One UI 8.5: May 2026. One UI 9 / Android 17: stable from 21 Oct 2026 (Korea), India after; Europe unconfirmed (Android Authority, TechRepublic). Policy: 4 OS upgrades + 5 years security (to 2029) | Wikipedia, SamMobile, 9to5Google |

### 2.2 Android system UI metrics (One UI)

| Item | Value | Src |
|---|---|---|
| Status bar | AOSP default **24 dp**; One UI on hole-punch phones enlarges it to clear the cutout: ≈ **34–38 dp (≈ 96–106 px)** on 1080-wide A-series (NamuWiki measured "102 px class" for the A21s; A5x similar) | Material (24 dp); [M]/[E] |
| 3-button nav bar | **48 dp** | AOSP `navigation_bar_height` |
| Gesture nav inset | AOSP gestural overlay **16 dp** (Android 10–11); Pixels report **24 dp** on Android 13–16; One UI ≈ 16–24 dp depending on version — read `WindowInsets.navigationBars` on a device | AOSP overlay (CSDN mirror), App Inventor thread; [E] for One UI |
| Gesture handle | AOSP pill ≈ 72 dp (Android 10–11) → 108 dp (12+) × 4 dp, R 2 dp, ≈ 8–10 dp above the edge; One UI handle is longer and thinner (≈ 150–190 × 3 dp), ≈ 8 dp above the edge; gesture hints removed in One UI 6.1+ (hint bar still drawn) | [E]; Samsung support page for the 6.1 note |
| App bar | 56 dp (One UI uses an "expandable app bar": big centred title that collapses on scroll) | One UI Design Guidelines pp. 16–20 |
| Screen margins | One UI recommends **≥ 24 dp side margins** | One UI Design Guidelines p. 13 |
| Keyboard (Samsung Keyboard) | ≈ 260–300 dp portrait depending on toolbar / number row | [E] |

### 2.3 CSS viewport & DPR — the 412-vs-393 question, answered
Candidates and evidence:

| Viewport (CSS px) | DPR | Density | Where it comes from | Weight |
|---|---|---|---|---|
| **384 × 832** | **2.8125** | **450 dpi** | DeviceAtlas, browser-measured traffic (20.4 M records, May 2026): "the A-series and the Ultra models report 384"; its **Galaxy A54 row (same 1080×2340 panel, same series) = 384 × 832**; droid10 lists the A54 at 450 dpi / 384 × 832 dp. 1080/2.8125 and 2340/2.8125 are exact integers | **Best supported (measured)** |
| 412 × 892 | 2.625 | 420 dpi | yesviz, screenresolutionchecker — aggregated from "different top relevant websites", not measured; matches Chrome's old "Galaxy A51/71" preset (A51 shipped at 420 dpi) | Plausible only if the user lowers **Screen zoom** one step |
| 360 × 780 | 3 | 480 dpi | 1440px.com (internally inconsistent page) | Flagship S-series default, not A-series |
| 393 × 851 | 2.75 | 440 dpi | no source found | Discard |
| 360 × 800 | 2.25 | — | **Chrome DevTools "Samsung Galaxy A55" preset** (verified in source: `show-by-default: true`, UA `Linux; Android 14; SM-A556B`) — but 360×800 is 20:9 and 2.25 × 360 = 810 px: it cannot be this panel. Treat as a Chrome data error | Don't rely on it |

**Conclusion:** correct the provisional 412 × 892 to **384 × 832 CSS px @ 2.8125** as the default A55 viewport (Samsung ships the A5x at 450 dpi; users can change it in Settings › Display › Screen zoom, which moves the page width to 412 or 360). Design consequence: **the app must hold at 384 px wide** — narrower than the 390-px base in CLAUDE.md. Confirm once on a real A55 with `window.innerWidth`/`devicePixelRatio`. Chrome's closest sane presets: "Galaxy A51/71" (412×914 @2.625) or add a custom "Galaxy A55 — 384×832 @2.8125" device.

In dp (450 dpi; 1 mm = 5.46 dp): body ≈ **423 × 880 dp**, screen 384 × 832 dp, side bezel ≈ 19 dp, top ≈ 20 dp, chin ≈ 28 dp, hole Ø ≈ 21 dp at y ≈ 18 dp.

---

## 3. Side-by-side

| | iPhone 13 Pro Max | Galaxy A55 5G |
|---|---|---|
| Body (mm) | 160.84 × 78.07 × 7.65 | 161.1 × 77.4 × 8.2 |
| Weight | 240 g | 213 g |
| Panel | 2778×1284 @3 → 428×926 pt | 2340×1080 @2.8125 → 384×832 dp (default) |
| Density | 458 ppi | ~390 ppi |
| Bezel | 3.47 mm uniform | ≈ 3.5 sides / 3.6 top / 5.1 chin |
| Display radius | 53.33 pt ≈ 8.9 mm (continuous) | ≈ 4.0 mm ≈ 22 dp [E] |
| Body radius | ≈ 13 mm circle-equivalent (squircle) | ≈ 7.5 mm [E] |
| Cutout | Notch 162 × 33.7 pt, R 22.9 bottom corners | Hole Ø ≈ 21 dp, centre y ≈ 18 dp [E] |
| Status bar | 47 pt | ≈ 36 dp (AOSP 24) |
| Bottom system area | 34 pt home indicator (148 × 5 pt bar) | gesture 16–24 dp (pill) / 3-button 48 dp |
| Frame material | Stainless band, flat sides | Flat aluminium, Key Island on right |
| Buttons | Mute + 2× volume left; side button right | Volume rocker + power on right (Key Island) |
| Colours | Graphite, Gold, Silver, Sierra Blue, Alpine Green | Iceblue, Lilac, Navy, Lemon |
| OS today | iOS 26.x (shipped iOS 15) | One UI 8/8.5, Android 16 (shipped Android 14) |

Colour hexes for CSS (all **[E]**, tuned by eye against Apple/Samsung product pages): Graphite `#54534F` band `#3F3F41`; Gold `#F3E4CA` band `#D9BC8E`; Silver `#EFEFEB` band `#D7D7D5`; Sierra Blue `#A7C1DA` band `#8FA9C5`; Alpine Green `#596A58` band `#4C5C4B`. Iceblue `#CFE3F5` frame `#B8CEE0`; Lilac `#D9CCE6` frame `#C3B5D3`; Navy `#1F2A3A` frame `#2B3443`; Lemon `#F4E8A4` frame `#E0D28A`.

---

## 4. CSS frame recipes

Both frames are built at "1 pt/dp = 1 CSS px" and scaled as a whole, so the iframe keeps a real 428- or 384-px-wide viewport (media queries and `useIsMobile()` behave exactly as on the phone).

### 4.1 iPhone 13 Pro Max
```css
.frame-ip13pm {
  --w: 470px; --h: 968px;           /* 78.07 × 160.84 mm at 6.02 px/mm */
  --bezel: 21px;                    /* 3.47 mm */
  --band: 6px;                      /* 1.05 mm stainless band outside the glass */
  --r-body: 78px;                   /* circle-equivalent of Apple's continuous corner */
  --r-screen: 53.33px;
  --notch-w: 162px; --notch-h: 34px; --notch-r: 23px;
  --status: 47px; --home: 34px;
  width: var(--w); height: var(--h); position: relative;
  border-radius: var(--r-body); corner-shape: squircle;   /* Chromium 139+; harmless elsewhere */
  background: var(--band-color);                           /* stainless band */
  box-shadow: inset 0 0 0 var(--band) var(--band-color), inset 0 0 0 calc(var(--band) + 1px) #0b0b0b;
}
.frame-ip13pm .screen {              /* the iframe lives here */
  position: absolute; inset: var(--bezel);                 /* → 428 × 926 */
  border-radius: var(--r-screen); corner-shape: squircle; overflow: hidden; background: #000;
}
.frame-ip13pm .notch {
  position: absolute; top: 0; left: 50%; translate: -50% 0;
  width: var(--notch-w); height: var(--notch-h); background: #000;
  border-radius: 0 0 var(--notch-r) var(--notch-r);
}
/* ears: fillet R 5.7px where the notch meets the top edge → two 6px pseudo-elements with a concave corner */
.frame-ip13pm .home-indicator {
  position: absolute; bottom: 8px; left: 50%; translate: -50% 0;
  width: 148px; height: 5px; border-radius: 2.5px; background: currentColor; opacity: .9;
}
/* side controls: absolutely positioned on the frame box, top = centre − length/2 */
.frame-ip13pm .btn-mute   { left: -4px;  top: 176px; width: 4px; height: 35px;  }  /* 32.22 ± 2.90 mm */
.frame-ip13pm .btn-volup  { left: -3px;  top: 239px; width: 3px; height: 70px;  }  /* 45.53 ± 5.80 */
.frame-ip13pm .btn-voldn  { left: -3px;  top: 317px; width: 3px; height: 70px;  }  /* 58.53 ± 5.80 */
.frame-ip13pm .btn-side   { right: -3px; top: 262px; width: 3px; height: 109px; }  /* 52.53 ± 9.05 */
```
Status-bar overlay (positioned inside `.screen`, `pointer-events: none`, 47 px tall, items vertically centred ≈ 18 px from the top, i.e. at the notch's mid-height): **time** "9:41" SF Pro Text Semibold 17 pt centred in the left ear (ear width = (428 − 162)/2 = 133 pt); right ear: cellular (4 bars, ≈ 19 × 12 pt), Wi‑Fi (≈ 17 × 12), battery (≈ 27 × 13: 25 × 13 body, R 4.3, 1-pt outline at 35 % opacity, fill inset 2 pt, cap 1.5 × 4), gaps ≈ 5–7 pt. Glyph sizes are **[E]** from Apple's iOS UI kits (±1 pt). **RTL:** with an Arabic *system* language iOS mirrors the status bar — time in the **right** ear, cellular/Wi‑Fi/battery in the **left** ear (observed on Arabic devices; not documented by Apple — verify). Digits: `ar-TN` uses Western digits (9:41), `ar-SA`/`ar-EG` may use ٩:٤١ — the gallery should offer both. The web app alone (`dir="rtl"` inside the iframe) does **not** flip the OS status bar; only the device language does.

### 4.2 Galaxy A55 5G
```css
.frame-a55 {
  --w: 423px; --h: 880px;           /* 77.4 × 161.1 mm at 5.46 px/mm (450 dpi) */
  --bezel-x: 19px; --bezel-top: 20px; --bezel-chin: 28px;
  --r-body: 41px; --r-screen: 22px;
  --hole-d: 21px; --hole-y: 18px;   /* centre of the punch hole from the screen top */
  --status: 36px; --gesture: 16px; --navbar3: 48px;
  width: var(--w); height: var(--h); position: relative;
  border-radius: var(--r-body); background: var(--frame-color);     /* flat aluminium */
  box-shadow: inset 0 0 0 2px color-mix(in oklab, var(--frame-color), white 25%);
}
.frame-a55 .screen { position: absolute; inset: var(--bezel-top) var(--bezel-x) var(--bezel-chin); /* → 384 × 832 */
  border-radius: var(--r-screen); overflow: hidden; background: #000; }
.frame-a55 .hole { position: absolute; top: calc(var(--hole-y) - var(--hole-d)/2); left: 50%; translate: -50% 0;
  width: var(--hole-d); height: var(--hole-d); border-radius: 50%; background: #000;
  box-shadow: inset 0 0 0 1.5px #1a1a1a; }
.frame-a55 .key-island { position: absolute; right: -3px; top: 186px; width: 4px; height: 240px; border-radius: 2px; background: var(--frame-color); }
.frame-a55 .btn-volume { right: -4px; top: 202px; height: 120px; }   /* 37–59 mm  [E] */
.frame-a55 .btn-power  { right: -4px; top: 352px; height: 60px;  }   /* 64.5–75.5 mm [E] */
.frame-a55 .gesture-handle { position: absolute; bottom: 8px; left: 50%; translate: -50% 0; width: 170px; height: 3px; border-radius: 2px; background: currentColor; opacity: .8; }
```
Status-bar overlay (One UI, 36 px, transparent background because Android 15/16 apps are edge-to-edge): LTR → **clock left** ("12:45", One UI Sans/Roboto 14 sp, 16 dp inset) followed by notification icons; **right** cluster Wi‑Fi, signal bars, battery (icon ≈ 14 × 8 dp with optional %), 16–18 dp icons, 4–6 dp gaps. **RTL** (Arabic system language): Android mirrors the bar — clock on the **right**, icons on the **left** (observed; verify). Hole sits between the two clusters, so keep ≥ 40 dp clear around the centre. 3-button mode: 48-dp bar with `|||  ○  <` (Samsung order: Recents left, Home, Back right — mirrored in RTL).

### 4.3 Fitting two frames on a desktop
Keep the frames unscaled in layout (`470 × 968` and `423 × 880` boxes in a flex row with a 64-px gap) inside a sizing wrapper, then scale the **wrapper**, not the iframes: `transform: scale(var(--s)); transform-origin: top center;` with `--s = min(1, (100svh − 2·margin) / 968, (100vw − gutter) / (470 + 64 + 423))`. Compute `--s` in JS with a `ResizeObserver` (dividing lengths in `calc()` is not yet reliable cross-browser); reserve the scaled height with a spacer (`height: calc(968px * var(--s))`) so the page doesn't scroll. Don't use CSS `zoom` here — it changes the iframe's laid-out CSS size and therefore the app's breakpoints; `transform` keeps the viewport at exactly 428 × 926 / 384 × 832. Add `will-change: transform` only while the window is being resized; iframes inside a scaled layer stay crisp at ≥ 0.6.

### 4.4 Passing safe areas into the iframe

> **As implemented** (supersedes the parameter names proposed below): the gallery loads each frame as
> `/student-v2?platform=ios&insets=47,34&skin=play` (Galaxy: `platform=android&insets=36,24`) and also
> sets the iframe's `name` to `wael-device:platform=…;skin=…;top=…;bottom=…` so the values survive in-app
> navigation. `src/app/platform.ts` reads them before the first render and writes `--sai-top` /
> `--sai-bottom` on `<html>` (defaults: `env(safe-area-inset-*)` on a real phone); every fixed bar reads
> those variables (`pt-safe`, `pb-safe`, inline `max(1rem, var(--sai-top))`). Theme is shared through
> `localStorage` (`wael-theme`) and the frames are remounted when it changes. See `README.md` §3.

`env(safe-area-inset-*)` is **0 inside an iframe** (only the top-level document gets the UA values), so the skin must inject them: load the app as `/student-v2?skin=ios&sat=47&sab=34&sal=0&sar=0` (or `skin=android&sat=36&sab=16`) and have the app set `document.documentElement.style.setProperty('--sim-sat', …)`. In the app's CSS use `--sat: max(env(safe-area-inset-top, 0px), var(--sim-sat, 0px));` and pad fixed bars with `padding-top: var(--sat)` / `padding-bottom: var(--sab)` (keep the existing `pt-safe`/`pb-safe` utilities but point them at these variables). Also pass `theme=dark|light` and `lang=ar-TN` so the status-bar clock digits and icon tint match. Use `postMessage` for live toggles (dark mode, RTL, 3-button vs gesture). The skin's own overlays stay `pointer-events: none` except the gesture-handle hit area if you want a "swipe up = home" demo.

---

## 5. Open-source frame assets — what exists, what you may reuse

| Asset | Licence | iPhone 13 Pro Max? | Galaxy A55? | Notes |
|---|---|---|---|---|
| picturepan2/devices.css | MIT | No — iPhone 14 Pro, 14, X, 8; Pixel 2 XL, Pixel; Galaxy S8; iPads, Macs, Watch | No | Pure CSS, clean structure (`device-frame`, `device-stripe`, `device-header`). Good template for how to structure our own. |
| marvelapp/devices.css | MIT | No — iPhone X, 8, 8 Plus, 5s, 5c, 4s; Galaxy Note 8, S5; Nexus 5; Lumia 920; HTC One; iPad Mini; MacBook Pro | No | Unmaintained; notch model only iPhone X. |
| zheeeng/react-device-frameset | MIT | No (wraps the Marvel set) | No | React wrapper; children can be an iframe but undocumented. |
| pixelsign/html5-device-mockups | MIT | No (newest iPhone X) | No | Bitmap mockups (86 images), dated. |
| **aloisdeniel `device_frame`** (Flutter, in `flutter_device_preview`) | **MIT** | **Yes** — `iphone_13_pro_max` (+ 12 Pro Max, 13, 13 mini, 15 Pro/Max, 16 series) | No — Galaxy A50, Note20/Ultra, S20, S25, Pixel 9 | Frames are vector `Path` data drawn from a Figma file; the 13 Pro Max screen path (notch + squircle) can be ported to SVG. Best open geometry source. |
| Design at Meta "Devices" | Meta's own terms: free, "please do not repackage and redistribute these as your own"; Meta disclaims ownership of the product designs; separate licence page | **Yes** — Gold, Graphite, Sierra Blue, Silver (bitmaps + Sketch) | No (Samsung S20/S21/Note only) | Fine as a *visual reference*; bitmaps don't scale well around a live iframe. |
| Apple Design Resources — Product Bezels | Apple's bezel terms: use "as is", only to show your App Store app in marketing, no modification | **Not any more** (bezel list now iPhone Duo, 18, 17, 16 — confirmed 2026-11-15) | — | Avoid. |
| Apple Accessory Design Guidelines — dimensional drawings | "Informational purposes only", IP retained by Apple | Yes (`iphone-13-pro-max.pdf`, 2021-09-28) | — | Use the **numbers** (this doc), not the artwork. |
| Samsung Developers — Galaxy emulator skins | Samsung Developer Terms; **Samsung-account login required**; made for Android Studio AVDs | — | **Yes** — official "Galaxy A55 5G" skin (PNG frame + layout) | Good visual reference for bezel/hole proportions; don't redistribute the PNG. |
| Samsung One UI design downloads (design.samsung.com) | — | — | No device frames (design guide PDF only) | — |
| MockUPhone (oursky, open source generator) | per-image credits (13 Pro Max images are Meta's) | Yes | No | Marketing images only. |
| Figma Community (e.g., "Device Mockups Library 100+", "Device Frames for Mockups") / Mockuuups / LS Graphics / Resource Boy | per file (often CC BY 4.0; vendor "free" licences forbid redistribution of source files) | Yes, common | **None found**; only a paid A55 vinyl-skin PSD (DesignBundles) | Check each licence; nothing A55-specific that is free and redistributable. |

**Recommendation: build both frames ourselves in CSS + inline SVG** from the numbers above (Apple's drawing is exact; the A55 is derived + estimated), keep them as two small components (`DeviceFrameIOS`, `DeviceFrameAndroid`) with CSS variables for colour/skin, and optionally port the `device_frame` 13 Pro Max screen path (MIT) for a pixel-faithful notch. No existing kit ships a usable Galaxy A55, and the only "official" artwork (Apple bezels, Samsung skin) comes with reuse restrictions.

### To verify on real hardware (10 minutes)
1. A55: `window.innerWidth × innerHeight`, `devicePixelRatio`, `WindowInsets` status/nav heights via a tiny APK or Chrome `env()` with `viewport-fit=cover`; measure the hole from a 1080-px screenshot.
2. Both: status-bar layout with the system language set to Arabic (which side the clock lands on; digit style for `ar-TN`).
3. iPhone: `100svh/100lvh` in Safari 26 vs standalone; keyboard height with and without QuickType in iOS 26.

## Sources (accessed 2026-10-26)
- Apple — iPhone 13 Pro Max Tech Specs — https://support.apple.com/en-us/111870
- Apple — Dimensional drawing iPhone 13 Pro Max (PDF, 2021-09-28) — https://developer.apple.com/download/files/accessories/dimensional-drawings/iphone-13-pro-max.pdf (index: https://developer.apple.com/accessories/dimensional-drawings/)
- Apple — App Store Marketing Guidelines (product images/bezels) — https://developer.apple.com/app-store/marketing/guidelines/ ; Design Resources — https://developer.apple.com/design/resources/
- ios-resolution.com — https://www.ios-resolution.com/
- Use Your Loaf — iPhone 13 Screen Sizes — https://useyourloaf.com/blog/iphone-13-screen-sizes/
- kylebshr/ScreenCorners (display corner radius 53.33) — https://github.com/kylebshr/ScreenCorners
- MacRumors — iPhone 13 notch 20 % smaller — https://www.macrumors.com/2021/09/14/iphone-13-models-notch-taller/ ; phonesized notch tool — https://phonesized.com/notch/
- Apple Developer Forums — keyboard 346/301 pt — https://developer.apple.com/forums/thread/798087 ; 100dvh regression — https://developer.apple.com/forums/thread/803987
- bram.us — large/small/dynamic viewports — https://www.bram.us/2021/07/08/the-large-small-and-dynamic-viewports/
- Chrome DevTools device list (source) — https://github.com/ChromeDevTools/devtools-frontend/blob/main/front_end/models/emulation/EmulatedDevices.ts ; custom devices — https://developer.chrome.com/docs/devtools/settings/devices
- Samsung Developers — Galaxy A emulator skins — https://developer.samsung.com/galaxy-emulator-skin/galaxy-a.html (guide: https://developer.samsung.com/galaxy-emulator-skin/guide.html)
- GSMArena — Samsung Galaxy A55 — https://www.gsmarena.com/samsung_galaxy_a55-12824.php
- Wikipedia — Samsung Galaxy A55 5G — https://en.wikipedia.org/wiki/Samsung_Galaxy_A55_5G
- SamMobile — One UI 8 for Galaxy A55 — https://www.sammobile.com/news/stable-one-ui-8-update-galaxy-a55-out-now/ ; 9to5Google — https://9to5google.com/2025/09/29/samsung-rolls-out-one-ui-8-android-16-update-to-galaxy-s23-tab-s10-a55-more/
- DeviceAtlas — Viewport, resolution, DPI of popular smartphones (May 2026) — https://deviceatlas.com/blog/viewport-resolution-diagonal-screen-size-and-dpi-most-popular-smartphones
- droid10 — Galaxy A54 DPI/viewport — https://droid10.com/devices/galaxy-a54/ ; yesviz — Galaxy A55 — https://yesviz.com/devices/samsung-a55/
- Material Design — Android bars (24 dp status bar) — https://m2.material.io/design/platform-guidance/android-bars.html
- Samsung — One UI Design Guidelines (PDF; margins p.13, app bar pp.16–20, navigation bar p.51) — https://design.samsung.com/global/contents/one-ui/download/oneui_design_guide_eng.pdf
- Samsung support — Customize the Navigation bar (gesture hints removed in One UI 6.1) — https://www.samsung.com/us/support/answer/ANS10002427/
- NamuWiki — punch-hole display (status-bar px classes) — https://en.namu.wiki/w/펀치홀%20디스플레이
- CSDN mirror of AOSP gestural overlay dimens (16 dp) — https://blog.csdn.net/Keep_Holding_On/article/details/112271371 ; App Inventor thread (24 dp on Pixel A13/A16) — https://community.appinventor.mit.edu/t/nav-bar-height-without-extensions/174318
- picturepan2/devices.css — https://github.com/picturepan2/devices.css ; marvelapp/devices.css — https://github.com/marvelapp/devices.css ; react-device-frameset — https://github.com/zheeeng/react-device-frameset ; html5-device-mockups — https://github.com/pixelsign/html5-device-mockups
- device_frame (Flutter) — https://pub.dev/packages/device_frame ; repo tree — https://github.com/aloisdeniel/flutter_device_preview
- Design at Meta — Devices — https://www.meta.com/design-at-meta/tools/devices/ ; MockUPhone device list — https://mockuphone.com/deviceList/
