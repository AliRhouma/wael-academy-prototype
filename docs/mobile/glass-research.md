# Liquid Glass on the web: research, diagnosis, recommendation

> Why our iOS `ios-glass` doesn't read as glass, how public projects build Apple's Liquid Glass
> (iOS 26/27) in the browser, and what a prototype that must also run in **Safari on a real
> iPhone** can realistically ship. Researched **2026-11-15**.
> Live comparison: **`docs/mobile/glass-demo.html`** (open it from the dev server at
> `http://localhost:5173/docs/mobile/glass-demo.html`, or as a local file).
> Nothing under `src/` was changed. §6 lists the code changes this would mean.

---

## 1. TL;DR

- **Why ours looks like a white circle.** It's a 70 % white fill under a 22 px blur, with a
  uniform 60 % white 1 px rim and a shadow so tight it hides under the disc. On our light pages
  that adds up to an almost opaque white disc whose white rim disappears into its white body.
  On the login screen nothing sits behind it except a flat mint grid, so there is nothing to
  see through it at all.
- **What makes something read as Liquid Glass, in order of impact:** (1) a **directional
  specular rim** (bright on the top-left bevel and on the bottom-right bounce, dark on the
  other sides), (2) a **thin fill** so the backdrop's colour comes through, with high saturation
  and a little brightness, (3) a **darkened edge and a contact shadow** so the silhouette holds on a
  flat page, (4) a **light blur**, a lens rather than frost, (5) **lensing at the edge**
  (refraction).
- **Points 1–4 are plain CSS and render the same in Safari iOS and in Chrome.** Point 5 needs an SVG
  `feDisplacementMap` used inside `backdrop-filter: url(#…)`, which **only Chromium** renders.
  Safari and Firefox ignore it, and `@supports` wrongly reports support for it. On a real iPhone
  refraction is out of reach without WebGL. WebGL libraries work by snapshotting the DOM, so they
  don't suit a live React app.
- **Recommendation.** Ship a new `ios-glass` (regular) and `ios-glass-clear` built from points
  1–4. Treat refraction as an optional Chromium-only extra for desktop demos (§5.4), or leave it
  out.

## 2. What Apple says the material does

From WWDC25 *Meet Liquid Glass* (session 219) and the HIG *Materials* page, as summarised in
`ios-patterns.md` §1 [S-1, S-2]:

| Property | Apple's description (paraphrased; short quotes) | Web consequence |
|---|---|---|
| **Lensing** | Earlier materials *scattered* light. Liquid Glass "bends, shapes, and concentrates light" | Edge refraction, not heavy blur. Small controls stay fairly sharp |
| **Specular highlights** | Highlights "respond to geometry"; light travels round the silhouette; sometimes follows device motion | A rim that's bright on the lit bevels, not an even outline |
| **Touch response** | The material "illuminates from within" on touch, with an elastic swell | Pressing should glow and scale up, never fade (we use `active:opacity-50`) |
| **Adaptive shadow** | Shadow gets stronger over text and weaker over solid light backgrounds; bigger glass casts deeper shadows | A real contact shadow plus an ambient one. Scale it with size |
| **Adaptive tint** | Each layer adapts to what's behind it. Small elements flip light↔dark and their glyphs flip with them | We can't sample pixels in CSS. Choose per screen (light glass with ink, or clear with white glyphs) |
| **iOS 27** | "darkened edge with brighter specular highlights", better diffusion, a user slider from ultra-clear to tinted (`ios-patterns.md` timeline) | The dark bevel is what holds the shape on light pages |
| **Regular vs Clear** | Regular "works in any size, over any content". Clear is "permanently more transparent", "needs a dimming layer", and only goes over media-rich content with bold, bright content on top. Never mix the two | Two utilities. Clear only on media, with a scrim under it and white bold glyphs |
| **Legibility** | Avoid glass on glass; keep content out from under glass in steady states; scroll-edge effect | As today (skill rule 6) |
| **Accessibility** | Reduce Transparency → "frostier"; Increase Contrast → mostly black or white "with a contrasting border"; Reduce Motion → no elastic effects | `prefers-reduced-transparency`, `prefers-contrast: more`, `prefers-reduced-motion` |

## 3. Public implementations

Licences were checked against each repo's LICENSE file or `package.json` through the GitHub API on 2026-11-15.

| Project / article | Technique | Browser support | Cost | A11y / fallback | Licence |
|---|---|---|---|---|---|
| [rdev/liquid-glass-react](https://github.com/rdev/liquid-glass-react) (~6.7k ★) | SVG filter: displacement map → three `feDisplacementMap` passes (one per RGB channel, giving chromatic aberration) plus `feColorMatrix`, applied as `filter: url()` on a layer that also has `backdrop-filter: blur() saturate()`. Elastic mouse response | README: "Safari and Firefox only partially support the effect (displacement will not be visible)" | Medium: three displacement passes, repaints on mouse move | Plain blur where the displacement isn't supported. No reduced-transparency handling | MIT |
| [shuding/liquid-glass](https://github.com/shuding/liquid-glass) | Builds the displacement map on a `<canvas>` (SDF of a rounded rect) → `feImage` (data URL) → `feDisplacementMap`, applied as `backdrop-filter: url(#f) blur(.25px) contrast(1.2) brightness(1.05) saturate(1.1)`, with shadow `0 4px 8px rgb(0 0 0/.25), inset 0 -10px 25px rgb(0 0 0/.15)` | Chromium only | Low–medium. The map has to be rebuilt when the size changes | None | MIT |
| [kube.io — Liquid Glass in the browser: refraction with CSS and SVG](https://kube.io/blog/liquid-glass-css-svg/) | The physically grounded write-up: Snell's law (n = 1.5); bezel height profiles (convex circle, **convex squircle** `(1−(1−x)^4)^¼`, concave, lip); a displacement map encoded as R/G around 128; a **specular rim** from the surface normal against a fixed light (−60°), composited with `feImage` + `feBlend`; applied with `backdrop-filter: url()` | The interactive pieces work in Chrome only (SVG filters in `backdrop-filter` aren't in the spec). Safari and Firefox get inline simulations on `filter` | Animating `scale` is cheap; a size or shape change means a full map rebuild | Suggests layered blur as the fallback | Blog post; code not released (no licence). Ideas only |
| [naughtyduk/liquidGL](https://github.com/naughtyduk/liquidGL) (v3) | WebGPU → WebGL2 → WebGL1 → CSS `backdrop-filter` chain. Snapshots the page offscreen and refracts it in a shader: bevel, specular, frost, tint, chromatic aberration, tilt, "fluid" touch | All modern browsers, Safari included. Only on `fixed`/`sticky` elements. Doesn't refract CSS animations; dynamic content has to be registered | High: a full-page snapshot plus a GPU canvas. Content that re-renders has to be re-captured | CSS fallback at the end of the chain | MIT |
| [archisvaze/liquid-glass](https://github.com/archisvaze/liquid-glass) | Two engines: SVG `feDisplacementMap` + `backdrop-filter` (physics-based map: thickness, bezel, IOR, specular, inner and outer shadow, tint), and Three.js GLSL ray refraction | SVG engine: Chromium only. WebGL engine: all browsers | SVG cheap; WebGL full-screen shader | The demo nudges non-Chromium browsers to the WebGL engine | MIT |
| [dashersw/liquid-glass-js](https://github.com/dashersw/liquid-glass-js) | WebGL 2 shaders. Samples the page with **html2canvas**. Nested glass samples its parent | Cross-browser (WebGL) | High (html2canvas snapshots) | — | MIT |
| [ybouane/liquidglass](https://github.com/ybouane/liquidglass) | WebGL: refraction, blur, chromatic aberration, lighting. Captures sibling elements; `data-dynamic` marks content to re-capture every frame | Cross-browser (WebGL) | High when content is dynamic | — | MIT in `package.json`, no LICENSE file |
| [lucasromerodb/liquid-glass-effect-macos](https://github.com/lucasromerodb/liquid-glass-effect-macos) | `feTurbulence` + `feDisplacementMap` on `filter`, plus layered inset shadows. The base of many CodePen remixes | `filter: url()` works everywhere; the backdrop variants are Chromium only | Low | — | **None** (all rights reserved): reference only |
| [Atlas Pup Labs — Liquid Glass, but in CSS](https://atlaspuplabs.com/blog/liquid-glass-but-in-css) | **Stacked inset `box-shadow`s per corner pair** to fake the Fresnel edge, `blur(20px)`, `contrast(80%) saturate(120%)`, and an SVG gradient distortion map on `filter` | The author says it "will not function properly" outside Chrome. Fallback: drop the SVG and keep blur and shadows | Low | Fallback described | Blog |
| [DEV — Liquid Glass on the web: 6 ways](https://dev.to/devyatov/liquid-glass-on-the-web-6-ways-to-build-it-with-css-and-svg-3m07) | A survey: plain glassmorphism; feathered mask; progressive blur (about 7 masked layers); SVG displacement on `filter`; **SVG in `backdrop-filter` (Chromium only, and `@supports` gives a false positive)**; Apple's private material | As noted per technique | Progressive blur costs one composited pass per layer | Blur/saturate fallback | Blog |
| [LogRocket — liquid glass effects with CSS and SVG](https://blog.logrocket.com/how-create-liquid-glass-effects-css-and-svg/) | `feTurbulence` / `feDisplacementMap` tutorial | Chromium for the backdrop variant | Low | — | Blog |
| [Alastair Coote — Apple's private CSS property](https://alastair.is/apple-has-a-private-css-property-to-add-liquid-glass-effects-to-web-content/) | `-apple-visual-effect: -apple-system-glass-material` (WebKit-internal) | **Not enabled for web content in Safari.** WKWebView needs a private setting (App Review risk). Reportedly doesn't combine with `backdrop-filter` | Native | Native | n/a. **Can't use** |

**What the field agrees on.** Real refraction on the web means one of two things:

- **(a)** An SVG displacement filter inside `backdrop-filter`. It looks great, but only in Chromium.
- **(b)** A WebGL or WebGPU shader fed by a DOM snapshot. It works everywhere, but it's heavy and
  fragile with live content, and limited to fixed or sticky panes.

Projects that care about Safari fall back to blur, saturate, inset highlights and shadows. That fallback is what this
recommendation makes as good as it can be.

## 4. Diagnosis: why ours reads as a plain white circle

Our utility (`src/styles/platform/ios.css`):
`surface 70 %` · `blur(22px) saturate(170%)` · `inset 0 0 0 1px rgb(255 255 255/.6)` ·
`0 10px 30px -12px rgb(8 67 75/.35)` · `0 1px 2px rgb(0 0 0/.05)` · dark: 62 % with a 12 % rim.

1. **The fill hides the glass.** Only 30 % of the backdrop gets through. Over the login's
   `#def7e5` the disc comes out as about `rgb(245 253 247)`, which is simply white. Over the
   student-v2 page (white cards, a very light mint gradient) it's white on white.
2. **There's nothing behind it.** Blur and saturation of a flat colour give back the same flat colour.
   On the login screen (`bg-v2-mint-grid`) the only detail is a 9 % grid line. Even Apple's glass
   looks like a pale bead over a flat page; there, the edges have to carry the effect.
3. **The rim is invisible and has no direction.** A 60 % white line on a 70 % white body
   is about 1.02 : 1. It's also even all the way round, so there's no light source, no bevel and
   no specular. That directional light is the single strongest "this is glass" cue.
4. **No depth.** With a −12 px spread the 35 % shadow shrinks to a 20 px blob under a 44 px disc
   and mostly hides behind it. There's no contact shadow, no darkened outer edge and no shading
   on the lower bevel, so nothing separates the disc from a light page.
5. **Frost, not lens.** A 22 px blur on a 44 px control averages the whole backdrop into one
   colour. Even over busy content the disc shows a milky smudge (see column (a) of the demo, busy
   background), not a lens. Apple's small controls stay quite clear.
6. **The press fights the material.** `active:opacity-50` (platformUi `back`) makes the glass
   *disappear* on tap. Apple's glass lights up and swells.
7. *(Not fixable in CSS)* No refraction, no adaptive light/dark flip, no motion-driven specular.

## 5. Recommendation

### 5.1 What to add, ranked by visual impact against cost

| # | Change | Impact | Cost | Safari iOS |
|---|---|---|---|---|
| 1 | **Directional specular rim** (1.5 px gradient ring: bright top-left, softer bottom-right, nothing on the other sides) | ★★★★★ | Low (one `::after`) | ✅ (`mask-composite`, Safari ≥ 15.4; `-webkit-mask-composite: xor` too) |
| 2 | **Thin fill** (70 → 36 %, 50 % on bars with text labels), with `saturate(190%) brightness(1.06)` and a top sheen gradient | ★★★★ over content | None | ✅ |
| 3 | **Darkened edge + lower-bevel shade + contact & ambient shadow** | ★★★★ on flat pages | None | ✅ |
| 4 | **Lighter blur** (22 → 10 px regular, about 2.5 px clear), which is also cheaper on the GPU | ★★★ | None (a saving) | ✅ |
| 5 | **Press = inner glow + scale 1.06** instead of opacity 50 % | ★★★ (feel) | Low | ✅ |
| 6 | **`ios-glass-clear`** for the video player and other controls over media, with a scrim under it and white bold glyphs | ★★★ where it applies | Low | ✅ |
| 7 | `prefers-contrast: more`: opaque surface plus a contrasting border (Apple's Increase Contrast) | a11y | Low | ✅ |
| 8 | Edge refraction (SVG `feDisplacementMap` in `backdrop-filter`) | ★★★★★ | Medium: JS builds a map per element size and rebuilds it on resize. Repaints on every scroll frame | ❌ **Chromium only** |
| 9 | Motion-driven specular (`deviceorientation`) | ★★ | Medium. iOS asks for permission on a tap | ✅ but needs the prompt. Skip |
| 10 | Adaptive light/dark flip from the backdrop | ★★★ | High (can't read pixels behind an element without a snapshot) | Skip. Decide per screen |
| 11 | WebGL/WebGPU glass (liquidGL & co.) | ★★★★★ | High: a DOM snapshot, fixed/sticky only, breaks with React re-renders | ✅ but unsuitable. Skip |

**Realistic for this prototype:** items 1–7 (all Safari-safe). Item 8 only as a progressive
extra that real iPhones never see. Don't depend on it for the look.

### 5.2 `ios-glass` (regular): drop-in replacement for `src/styles/platform/ios.css`

Tailwind v4. Tokens: `--v2-surface`, `--v2-shadow-rgb`, `--v2-ink`. The ring needs its host to be
a containing block. Putting `position: relative` in **`@layer base`** means any `absolute` or
`fixed` utility on the same element still wins (a utility-vs-utility clash would come down to
Tailwind's sort order).

```css
/* Liquid Glass, regular. Thin fill + light blur + vibrancy, a directional
   specular rim, a darkened edge, contact and ambient shadow. Safari-safe. */
@utility ios-glass {
  /* 36 % for icon-only controls; a bar that carries text labels sets
     [--glass-alpha:50%] (legibility over dark content). */
  --glass-fill: color-mix(in srgb, var(--v2-surface) var(--glass-alpha, 36%), transparent);
  --glass-glow: rgb(255 255 255 / .22);
  background:
    linear-gradient(180deg, rgb(255 255 255 / .34) 0%, rgb(255 255 255 / .06) 46%, rgb(255 255 255 / .14) 100%),
    var(--glass-fill);
  -webkit-backdrop-filter: blur(10px) saturate(190%) brightness(1.06);
  backdrop-filter: blur(10px) saturate(190%) brightness(1.06);
  box-shadow:
    inset 0 0 0 .5px rgb(255 255 255 / .4),                 /* thin even rim */
    inset 0 0 16px var(--glass-glow),                       /* glass thickness */
    inset 0 -10px 14px -12px rgb(var(--v2-shadow-rgb) / .2),/* lower bevel in shade */
    0 0 0 .5px rgb(var(--v2-shadow-rgb) / .16),             /* darkened outer edge */
    0 1px 3px rgb(var(--v2-shadow-rgb) / .14),              /* contact */
    0 10px 28px -8px rgb(var(--v2-shadow-rgb) / .28);       /* ambient lift */
  transition: box-shadow .25s cubic-bezier(.2,.8,.2,1), scale .25s cubic-bezier(.2,.8,.2,1);

  /* The specular rim: key light top-left, bounce bottom-right, over a faint
     dark bevel (iOS 27's "darkened edge"). Physical light, so it doesn't mirror in RTL. */
  &::after {
    content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
    padding: 1.5px;
    background:
      linear-gradient(135deg,
        rgb(255 255 255 / var(--glass-rim-a, .95)) 0%, rgb(255 255 255 / .2) 20%, transparent 42%,
        transparent 58%, rgb(255 255 255 / .18) 80%, rgb(255 255 255 / calc(var(--glass-rim-a, .95) * .75)) 100%),
      linear-gradient(rgb(var(--v2-shadow-rgb) / var(--glass-edge, .14)) 0 0);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask-composite: exclude;
  }
  /* Press: the glass lights up from inside and swells. It never fades. */
  &:active { --glass-glow: rgb(255 255 255 / .55); scale: 1.06; }
}
@layer base {
  :where(.ios-glass, .ios-glass-clear) { position: relative; }
}

[data-theme="dark"] .ios-glass {
  --glass-fill: color-mix(in srgb, var(--v2-surface) calc(var(--glass-alpha, 36%) + 10%), transparent);
  --glass-glow: rgb(255 255 255 / .06);
  --glass-rim-a: .45;
  --glass-edge: .5;
  background:
    linear-gradient(180deg, rgb(255 255 255 / .12) 0%, rgb(255 255 255 / 0) 50%, rgb(255 255 255 / .04) 100%),
    var(--glass-fill);
  -webkit-backdrop-filter: blur(12px) saturate(170%) brightness(.92);
  backdrop-filter: blur(12px) saturate(170%) brightness(.92);
  box-shadow:
    inset 0 0 0 .5px rgb(255 255 255 / .12),
    inset 0 0 16px var(--glass-glow),
    inset 0 -10px 14px -12px rgb(0 0 0 / .2),
    0 0 0 .5px rgb(0 0 0 / .5),
    0 1px 3px rgb(0 0 0 / .3),
    0 10px 28px -8px rgb(0 0 0 / .55);
}
[data-theme="dark"] .ios-glass:active { --glass-glow: rgb(255 255 255 / .16); }
```

### 5.3 `ios-glass-clear`: media only

```css
/* Liquid Glass, clear. Almost no fill or blur: a lens. Only over media
   (video, photos, the player), always with a dim layer underneath
   (`bg-black/25`–`/35` over the media) and bold white glyphs on top
   (`text-white` + `drop-shadow(0 1px 2px rgb(0 0 0/.35))`). Never on a sheet,
   a menu or anything carrying body text. */
@utility ios-glass-clear {
  --glass-glow: rgb(255 255 255 / .16);
  --glass-edge: .18;
  background: linear-gradient(180deg, rgb(255 255 255 / .2) 0%, rgb(255 255 255 / .02) 50%, rgb(255 255 255 / .08) 100%);
  -webkit-backdrop-filter: blur(2.5px) saturate(160%) brightness(1.12);
  backdrop-filter: blur(2.5px) saturate(160%) brightness(1.12);
  box-shadow:
    inset 0 0 0 .5px rgb(255 255 255 / .3),
    inset 0 0 14px var(--glass-glow),
    0 0 0 .5px rgb(0 0 0 / .14),
    0 8px 22px -8px rgb(0 0 0 / .4);
  transition: box-shadow .25s cubic-bezier(.2,.8,.2,1), scale .25s cubic-bezier(.2,.8,.2,1);
  &::after { /* the same ring as ios-glass */ }
  &:active { --glass-glow: rgb(255 255 255 / .45); scale: 1.06; }
}
```

(In the app, write the ring once and share it, for example with `.ios-glass::after, .ios-glass-clear::after { … }`
in the same file, rather than copying it into both utilities.)

### 5.4 Fallbacks (replace the two blocks at the end of `ios.css`)

```css
@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .ios-glass { --glass-fill: color-mix(in srgb, var(--v2-surface) 92%, transparent); }
  .ios-glass-clear { background: rgb(20 30 50 / .55); }
}
/* Reduce Transparency: "frostier", near-opaque. Keep the rim and shadow, so it's still a shape. */
@media (prefers-reduced-transparency: reduce) {
  [data-platform="ios"] .ios-glass {
    --glass-fill: color-mix(in srgb, var(--v2-surface) 94%, transparent);
    -webkit-backdrop-filter: blur(20px); backdrop-filter: blur(20px);
  }
  [data-platform="ios"] .ios-glass-clear {
    background: rgb(20 30 50 / .72); -webkit-backdrop-filter: blur(20px); backdrop-filter: blur(20px);
  }
}
/* Increase Contrast: opaque, with a contrasting border. */
@media (prefers-contrast: more) {
  [data-platform="ios"] :is(.ios-glass, .ios-glass-clear) {
    background: var(--v2-surface); -webkit-backdrop-filter: none; backdrop-filter: none;
    box-shadow: 0 0 0 1.5px color-mix(in srgb, var(--v2-ink) 70%, transparent), 0 6px 18px -8px rgb(0 0 0 / .4);
  }
  [data-platform="ios"] :is(.ios-glass, .ios-glass-clear)::after { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  :is(.ios-glass, .ios-glass-clear):active { scale: 1; }
}
```

### 5.5 Optional: Chromium-only refraction, with a Safari-safe fallback

Use it only if desktop Chrome demos are worth the extra code. A real iPhone **never** shows it. The demo's
column (d) is a working reference (about 50 lines of JS).

1. **Gate it in JS, not CSS.** `@supports (backdrop-filter: url(#x))` comes back true in Safari and
   Firefox. Sniff the engine instead and set a class:
   `navigator.userAgentData?.brands.some(b => /Chromium/.test(b.brand))` → `html.svg-backdrop`
   (Safari and Firefox have no `userAgentData`, so they get the fallback).
2. **One filter per element size.** Draw a displacement map on a canvas: for each pixel within
   `bezel` (≤ 14 px) of the rounded-rect edge, an inward vector along the edge normal with
   magnitude `1 − h(t)`, where `h(t) = (1 − (1 − t)^4)^¼` (kube.io's convex squircle) and
   `t = distanceFromEdge / bezel`. Encode R = 128 + x·127, G = 128 + y·127.
3. **The filter** (`filterUnits="userSpaceOnUse"`, `x=0 y=0 width=w height=h`,
   `color-interpolation-filters="sRGB"`):
   ```xml
   <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="soft"/>  <!-- 5 for bars, 6 for sheets -->
   <feImage href="data:image/png;base64,…" width="w" height="h" preserveAspectRatio="none" result="map"/>
   <feDisplacementMap in="soft" in2="map" scale="≈ bezel × 2.4" xChannelSelector="R" yChannelSelector="G"/>
   ```
4. **The CSS**, layered over regular glass, so the fallback is free:
   ```css
   html.svg-backdrop .ios-glass-refract {
     --glass-fill: color-mix(in srgb, var(--v2-surface) calc(var(--glass-alpha, 36%) - 14%), transparent);
     backdrop-filter: var(--lg-filter) saturate(180%) brightness(1.05); /* --lg-filter: url(#lgN) set by JS */
   }
   ```
5. Rebuild the map from a `ResizeObserver`. Animating only `scale` is cheap; changing size or
   shape means a rebuild (kube.io). Keep it to a few elements: each one is a backdrop repaint on
   every scroll frame.

### 5.6 When to use which, and what background each needs

| Situation | Material | Notes |
|---|---|---|
| Tab-bar capsule, collapsed header band, 44 px icon circles, partial-height sheets, menus, popovers | **`ios-glass`** | The default. Bars with text labels: `[--glass-alpha:50%]` |
| Video player transport, controls over a photo or illustration, a full-bleed hero | **`ios-glass-clear`** | Only with a scrim under it (`bg-black/25`–`/35`) and white bold glyphs. In the demo, the clear sheet over busy content shows why Apple never uses clear on sheets |
| Cards, lists, page sections, anything in the content layer | **Neither** | HIG: no glass in the content layer (skill rule 6, unchanged) |
| A control on a flat, light page (the login screen, empty states) | `ios-glass` | Expect a "pearl", not see-through glass. It's authentic: iOS glass looks the same over a flat white page. The rim, dark edge and contact shadow do the work. If the screen should *show off* glass, give it something behind the control (the illustration, a gradient, scrolling content) |
| Large detent sheet | Opaque `bg-v2-surface` | Unchanged (skill table) |

**What glass needs from the background in order to look like glass:** contrast and movement.
Edges, text, saturated colour and photos scrolling under it make the thin fill, the saturation
boost and (in Chromium) the lensing visible. On a flat background only the rim, edge and shadow
can sell it. That's why they rank above the fill.

## 6. What would change in our code (not done here; `src/` is untouched)

| File | Change |
|---|---|
| `src/styles/platform/ios.css` | Replace the `ios-glass` utility and its dark rule with §5.2. Add `ios-glass-clear` (§5.3) and the shared `::after` ring. Add `@layer base { :where(.ios-glass, .ios-glass-clear) { position: relative } }`. Replace the `@supports` / reduced-transparency blocks with §5.4 (adds `prefers-contrast: more` and reduced motion) |
| `src/features/mobilegame/platformUi.ts` (line 57, `IOS.back`) | Drop `transition-opacity active:opacity-50`: the utility now owns the press (glow + scale). Consider `text-v2-ink` for the chevron, since bar symbols are monochrome by default on iOS 26+ (`ios-patterns.md` S-44); keep teal if the brand rule wins |
| `src/features/student-v2/V2Shell.tsx` (line 281, `IosTabBar` `<ul>`) | Add `[--glass-alpha:50%]` (labels on glass). Nothing else: no position change needed |
| `src/components/kit/VideoStage.tsx` (lines 223/236, prev/next circles) | On iOS, swap `bg-neutral-900/60 backdrop-blur` for `ios-glass-clear text-white` over the existing dim. They're `absolute`, which still wins over the base-layer `relative` |
| `src/features/mobilegame/LoginScreen.tsx` | No change needed. With the new rim and edge the back button reads as a glass bead on the mint grid |
| `.claude/skills/wael-mobile-ios/SKILL.md` (rule 6 + the "Glass" row of the numbers table) and `docs/mobile/ios-patterns.md` (§1 "What we do", the components table) | New numbers (36 / 50 % fill, 10 px blur, saturate 190 %, directional rim, darkened edge). Add `ios-glass-clear` and its three conditions (media, scrim, bold white). Press = glow + scale, not opacity. Note that refraction is Chromium-only and not part of the shipped skin |

Verify after the change: `/mobilegame/connexion` (flat background), `/student-v2?platform=ios&insets=47,34`
(tab bar over cards), both themes, and macOS/iOS *Reduce Transparency* and *Increase Contrast*
(`prefers-reduced-transparency` and `prefers-contrast` can be emulated in Chrome DevTools › Rendering).

## 7. Browser-support caveats (summary)

- `backdrop-filter`: unprefixed in Safari 18+, Chrome 76+, Firefox 103+. Keep `-webkit-` for
  older iOS. All of §5.2–5.4 is supported on iOS 17+ Safari.
- `mask-composite: exclude`: Safari 15.4+, Chrome 120+, Firefox 53+. `-webkit-mask-composite: xor`
  covers older WebKit and Blink.
- `color-mix()` with `calc()` percentages: Safari 16.2+, Chrome 111+. Already used throughout
  the codebase.
- **SVG filters in `backdrop-filter: url()`: Chromium only.** Safari and Firefox drop them, and
  `@supports` reports a false positive. Gate in JS. A real iPhone (every iOS browser runs WebKit)
  never refracts.
- `-apple-visual-effect: -apple-system-glass-material`: private and not exposed to Safari web
  content. Don't use it.
- Performance: each `backdrop-filter` element over scrolling content re-samples on every frame.
  The lighter blur (10 px rather than 22 px) is cheaper. Refraction adds a displacement pass per element.
- **`prefers-reduced-transparency` is Chromium only (118+).** caniuse marks Safari and iOS Safari
  unsupported through 27.x (WebKit bug 175497, with privacy cited). So on a real iPhone our
  Reduce Transparency fallback, the current one included, **never fires**. iOS users with the
  setting on still get glass. Keep the rule (it costs nothing, and the gallery runs in Chromium), but
  don't count it as accessibility coverage on iOS. `prefers-contrast: more` *is* supported in
  Safari (14.1+), so §5.4's Increase Contrast rule does reach iPhones.
  Sources: https://caniuse.com/mdn-css_at-rules_media_prefers-reduced-transparency ·
  https://developer.chrome.com/blog/css-prefers-reduced-transparency

## Sources

- Apple, WWDC25 session 219 *Meet Liquid Glass*: https://developer.apple.com/videos/play/wwdc2025/219/
- Apple HIG *Materials* and the iOS 27 notes: see `docs/mobile/ios-patterns.md` [S-1, S-2, S-20–S-23]
- kube.io, *Liquid Glass in the Browser: Refraction with CSS and SVG*: https://kube.io/blog/liquid-glass-css-svg/
- rdev/liquid-glass-react (MIT): https://github.com/rdev/liquid-glass-react
- shuding/liquid-glass (MIT): https://github.com/shuding/liquid-glass
- naughtyduk/liquidGL (MIT): https://github.com/naughtyduk/liquidGL
- archisvaze/liquid-glass (MIT): https://github.com/archisvaze/liquid-glass
- dashersw/liquid-glass-js (MIT): https://github.com/dashersw/liquid-glass-js
- ybouane/liquidglass (MIT per package.json): https://github.com/ybouane/liquidglass
- lucasromerodb/liquid-glass-effect-macos (no licence): https://github.com/lucasromerodb/liquid-glass-effect-macos
- Atlas Pup Labs, *Liquid Glass, but in CSS*: https://atlaspuplabs.com/blog/liquid-glass-but-in-css
- DEV, *Liquid Glass on the web: 6 ways to build it with CSS and SVG*: https://dev.to/devyatov/liquid-glass-on-the-web-6-ways-to-build-it-with-css-and-svg-3m07
- LogRocket, *How to create liquid glass effects with CSS and SVG*: https://blog.logrocket.com/how-create-liquid-glass-effects-css-and-svg/
- Alastair Coote, *Apple has a private CSS property to add Liquid Glass effects to web content*: https://alastair.is/apple-has-a-private-css-property-to-add-liquid-glass-effects-to-web-content/
- WebKit Bugzilla 294497 (`-apple-visual-effect` parsing): https://bugs.webkit.org/show_bug.cgi?id=294497
