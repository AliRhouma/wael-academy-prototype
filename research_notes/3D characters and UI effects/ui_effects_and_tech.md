# 3D UI effects and 3D components for a React web app wrapped as a mobile app (Nov 2026)

Scope: catalogue of 3D/depth UI techniques (what, when, how, perf cost, a11y) and implementation recipes for Vite + React + Tailwind v4, running in a landscape phone frame (926x428 / 832x384) and on real phones (webview/PWA). Research done 2026-11-16. Code snippets marked "recipe" are engineering synthesis built on the cited docs, not quotes.

---

## 1. Visual styles: which 3D/depth styles are current in 2026 and which feel dated?

### Takeaway
Depth is back: 2026 trend writing describes a return of "physical qualities" (layering, translucency, tactile buttons) after the flat era, with Apple's Liquid Glass and Material 3 Expressive as the platform anchors. Claymorphism / soft inflated 3D is still used (especially for education and onboarding) but its peak is placed in 2025, so it reads as "established" rather than fresh; the safe 2026 recipe is tactile pressable controls + soft depth + glass reserved for chrome, not glass or clay everywhere.

### Cited Findings
- A mid-2026 trends piece says flat design "dominated for so long that depth began to feel unnecessary" and that physical qualities are now returning, listing layering, translucent surfaces and tactile-looking buttons — [Designity, Jul 2026](https://www.designity.com/blog/ui-ux-design-trends)
- Claymorphism is listed among "3D tactile" trends bringing clay, metal, fabric, rubber textures into UI, credited to generative AI and accessible 3D rendering tools — [Pixso, 7 UI/UX trends](https://pixso.net/articles/7-ui-ux-design-trends/)
- Soft inflated volume is described as giving "onboarding, education, and friendly consumer products a tactile personality" — [Pixso, glass vs neu vs clay](https://pixso.net/articles/glassmorphism-vs-neumorphism-vs-claymorphism/)
- A skeuomorphism guide places claymorphism's peak in the past ("swept consumer brands in 2025") — [Clay, Skeuomorphism best practices 2026](https://clay.global/blog/skeuomorphism-ui)
- Claymorphism definition/background (soft, puffy, inner + outer shadows, pastel) — [LogRocket](https://blog.logrocket.com/ux-design/what-is-claymorphism-web-design)
- Liquid Glass is a "dynamic material" forming "a distinct functional layer for controls and navigation elements — like tab bars and sidebars — that floats above the content layer" — [Apple HIG, Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- Apple: "Don't use Liquid Glass in the content layer" and "Use Liquid Glass effects sparingly" — [Apple HIG, Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- One report says WWDC26 kept the Liquid Glass name but adjusted how it handles complex backgrounds for the 2027 OS releases (secondary source, verify) — [macmyths](https://macmyths.com/wwdc-2026-apple-refines-liquid-glass-across-its-next-generation-operating-systems/)
- Material 3 Expressive (announced May 2025 with Android 16) is an evolution of M3, not "M4": springier physics-based motion, 15 new/updated components, configurable shapes, bolder type — [9to5Google](https://9to5google.com/2025/05/13/android-16-material-3-expressive-redesign/); [Android Authority](https://www.androidauthority.com/google-material-3-expressive-features-changes-availability-supported-devices-3556392/)
- Material You / expressive variants move "away from paper-like realism" toward stronger type, contrasting shapes and energetic motion — [daisyUI trends, material & dimensional UI](https://trends.daisyui.com/material-dimensional-ui/)
- Tactile "pushable" 3D button (raised face on a darker edge, press closes the gap) is a mainstream, well-documented web pattern — [Josh W. Comeau, Building a Magical 3D Button](https://www.joshwcomeau.com/animation/3d-button/); [dev.to, Art of making satisfying buttons](https://dev.to/ammadeo/art-of-making-satisfying-buttons-1407)
- Rive's characters (e.g. Duolingo) are the reference for interactive mascot/3D-ish characters; Rive reports Duolingo got a 15x file-size reduction moving to Rive (vendor-reported) — [Rive blog](https://rive.app/blog/rive-as-a-lottie-alternative)
- "Metallic sheens and edge reflections" on high-end components are noted as a 2026 accent (rim-light-like edges) — [daisyUI 18 UI trends 2026](https://trends.daisyui.com/ui-design-trends-2026/)

### Inferences
- Style status matrix for 2026 (synthesis of the above):
  - **Current / safe:** tactile pressable buttons with a lip (Duolingo/Brilliant game feel); soft layered depth (elevation via soft green-tinted shadows + contact shadows); glass reserved for floating chrome (tab bar, sheet header) over rich backgrounds; pre-rendered 3D characters/illustrations with consistent lighting; subtle rim light / edge highlight on hero objects; spring-physics motion.
  - **Established, use with taste:** claymorphism/soft inflated 3D icons — still fits an education product (friendly, child-safe), but full clay UI (every card puffy) now reads as 2023-2025 Dribbble. Use clay for illustrations/icons, not for the whole surface system.
  - **Dated / risky:** neumorphism (low-contrast extruded cards, poor legibility); glassmorphism over everything (frosted cards in the content layer, which Apple's own guidance now argues against); heavy perspective "card flip" galleries; gyroscope parallax on every screen; autoplaying WebGL hero scenes on mobile.
  - **Niche but on-trend for game-like apps:** 2.5D isometric scenes and floating islands/dioramas (map/home "world" metaphors) — strong in gamified learning apps, best delivered as pre-rendered layered art, not live 3D.
- For Wael Academy specifically (soft cream/green/gold brand + `play` skin): the coherent 2026 look is pre-rendered clay-lite 3D characters and props + pressable lips + soft contact shadows; glass only on the bottom tab bar/top chrome under iOS skin.

### Gaps
- No primary/survey data quantifying which styles "feel dated"; trend sources are vendor blogs/opinion. Treat the matrix as informed opinion.
- Could not retrieve the official m3.material.io Expressive pages (client-rendered); details come from press and developer coverage.

---

## 2. Implementation options and trade-offs (bundle, GPU/battery, cold start, webview caveats)

### Takeaway
For a webview/PWA on mid-range Android, the cheapest-to-best ladder is: (1) pre-rendered 3D art as AVIF/WebP + CSS transforms (near-zero JS, compositor-only animation) → (2) Rive or dotLottie for interactive/state-driven characters (~78-150 KB WASM runtimes, lazy-loaded) → (3) transparent video for cinematic loops (stacked-alpha best) → (4) live 3D (React Three Fiber / model-viewer / Spline) only for an opt-in, lazily-loaded interactive moment. Live WebGL on a splash or on every screen is the wrong default.

### Cited Findings

**Pre-rendered images + CSS**
- Animate only `transform` (translate/rotate/scale) and `opacity` so work stays on the compositor; "Avoid any property that triggers layout or paint unless it's absolutely necessary"; blurs and shadows are costly paint effects — [web.dev, How to create high-performance CSS animations](https://web.dev/articles/animations-guide)
- `will-change` should be used sparingly, only when you see issues; for occasional changes add it just before and remove after; layer creation has its own costs — [web.dev animations guide](https://web.dev/articles/animations-guide)
- `<picture>` with `media="(prefers-reduced-motion: no-preference)"` can serve animated AVIF/WebP only to users without reduced motion, static image as fallback — [web.dev, prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion)

**CSS 3D transforms**
- `perspective` sets distance between z=0 plane and viewer; smaller = stronger effect; any value other than `none` creates a new stacking context and a containing block for `position: fixed` descendants; vanishing point moved with `perspective-origin` — [MDN, perspective](https://developer.mozilla.org/en-US/docs/Web/CSS/perspective)

**Tactile 3D button (CSS)**
- Comeau's pushable button: three layers (blurred shadow, dark gradient edge, front face); front rests at `translateY(-4px)`, hover `-6px`, active `-2px`; shadow moves opposite (2px / 4px / 1px); release 600ms `cubic-bezier(0.3, 0.7, 0.4, 1)`, hover 250ms `cubic-bezier(0.3, 0.7, 0.4, 1.5)` (overshoot), press 34ms (~2 frames); uses transforms instead of box-shadow/border because they are cheaper and hardware-accelerated; `-webkit-tap-highlight-color: transparent`, `user-select: none` for mobile — [Josh W. Comeau](https://www.joshwcomeau.com/animation/3d-button/)
- Typical pushable pattern: hard offset shadow as the raised edge (~5px depth); pressed state moves surface down 2-4px and shadow to ~0; press transitions 30-100ms — [dev.to, Art of making satisfying buttons](https://dev.to/ammadeo/art-of-making-satisfying-buttons-1407); [dev.to, pushable 3D button](https://dev.to/danielzotti/learnedtoday-pushable-3d-button-203m)

**Rive**
- Web packages: `@rive-app/webgl2` (Rive Renderer, recommended, matches editor, vector feathering, all blend modes but non-Normal blend modes costly; subject to browser WebGL context cap), `@rive-app/canvas` (Canvas2D, blend modes free, no practical per-page limit, feathered gradients may band), `@rive-app/canvas-lite` (smallest; drops text, layout, audio, scripting, feathering), `@rive-app/canvas-single` (WASM inlined in JS: one request, bigger bundle), `@rive-app/webgl` deprecated after v2.37.0 — [Rive docs, Canvas vs WebGL](https://rive.app/docs/runtimes/web/canvas-vs-webgl)
- Browsers cap WebGL contexts per page (oldest dropped); `useOffscreenRenderer: true` makes webgl2 instances share one offscreen context; Rive says canvas may be meaningfully faster on mobile when blend modes are used; measure on real devices — [Rive docs, Canvas vs WebGL](https://rive.app/docs/runtimes/web/canvas-vs-webgl)
- Rive WASM module ~78 KB; lazy-load it in a separate chunk — [Pixelpoint, Rive React optimizations](https://pixelpoint-website-6l3rd8f5q-pixelpoint.vercel.app/blog/rive-react-optimizations)
- Callstack (React Native, Sony Xperia Z3): Lottie ~17 FPS vs Rive ~60 FPS; Rive lower Java/native memory but higher graphics memory (184 vs 123 MB); one recreated animation Lottie ~24.37 KB vs Rive ~2 KB (from a Rive CEO tweet). Note the article's memory totals are internally inconsistent, and this is native RN, not web — [Callstack](https://callstack.com/blog/lottie-vs-rive-optimizing-mobile-app-animation)
- "Runtime size" is listed as a Rive weakness in a 2026 comparison — [Toolradar](https://toolradar.com/compare/rive-vs-lottie)

**Lottie / dotLottie**
- dotLottie web runtime uses ThorVG compiled to WebAssembly; core ~150 KB; `.lottie` is compressed and "significantly smaller than a bundle of raw JSON plus assets"; supports state machines (hover/pressed/success) and themes (light/dark/brand) inside the file; can render in a Web Worker; React package `@lottiefiles/dotlottie-react`, core `@lottiefiles/dotlottie-web` (Dec 19 2025) — [LottieFiles blog](https://lottiefiles.com/blog/dotlottie/how-dotlottie-runtimes-solve-lottie.md)
- dotlottie-web also ships WebGL and WebGPU renderers — [LottieFiles blog (linked article)](https://lottiefiles.com/blog/dotlottie/how-dotlottie-runtimes-solve-lottie.md)
- Classic Lottie is JSON parsed at runtime; performance depends heavily on animation complexity — [dev.to, Rive vs Lottie 2025](https://dev.to/uianimation/rive-vs-lottie-which-animation-tool-should-you-use-in-2025-p4m)

**Spline**
- Spline's export Performance Panel shows export-size estimate and loading-time score; reuse components (one geometry for 100 instances), reduce textures/images, avoid multiple complex embeds on one page, choose "Performance" geometry quality, enable mesh/texture compression in Play Settings — [Spline docs, How to optimize your scene](https://docs.spline.design/doc/how-to-optimize-your-scene/doczPMIye7Ko); [Spline docs, CAD optimization](https://docs.spline.design/importing-content/cad-to-spline-optimization-best-practices)
- Community guidance: keep mobile scenes under ~50k polygons, wrap `@splinetool/react-spline` in `React.lazy` with a custom fallback — [vp0, Spline React component](https://vp0.com/blogs/spline-3d-react-component-ai-prompt/); [skills.sh spline-interactive](https://skills.sh/freshtechbro/claudedesignskills/spline-interactive)
- Spline has published performance optimization changelogs (runtime improves over time) — [Spline updates](https://updates.spline.design/changelog/performance-optimization-update)

**three.js / React Three Fiber / drei**
- `<Canvas frameloop="demand">` renders only when something changes (saves battery); call `invalidate()` for mutations React can't see (e.g. controls) — it requests, not forces, a frame — [R3F docs, Scaling performance](https://r3f.docs.pmnd.rs/advanced/scaling-performance)
- Each mesh is a draw call; stay "well under 1000, ideally a few hundred or fewer"; use `InstancedMesh`, shared geometries/materials (`useLoader` caches by URL), drei `<Detailed>` LOD, nested `<Suspense>` low→high quality — [R3F docs](https://r3f.docs.pmnd.rs/advanced/scaling-performance)
- `<PerformanceMonitor onIncline onDecline>` adapts quality to average FPS (with `flipflops`/`onFallback`); `<Canvas performance={{ min: 0.5 }}>` + `regress()` lowers quality during movement; `dpr` prop controls pixel ratio — [R3F docs](https://r3f.docs.pmnd.rs/advanced/scaling-performance)
- `frameloop="demand"` reportedly dropped idle GPU usage to near zero (anecdotal) — [hontran.dev, three.js perf](https://www.hontran.dev/blog/three-js-performance-optimization)
- WebGL frame rate is bounded by vertex count, draw calls and texture size — asset optimization matters as much as the library — [neural4d, optimize 3D for WebGL](https://blog.neural4d.com/user-guide/optimize-3d-models-for-webgl/)

**`<model-viewer>` (glTF)**
- three.js is a peer dependency, pin it to model-viewer's tested version — [model-viewer README v4.2.0](https://cdn.jsdelivr.net/npm/@google/model-viewer@4.2.0/README.md)
- Eagerly loading `model-viewer.min.js` hurts Lighthouse because the bundle takes time to parse; their example scored 93 mobile vs 100 desktop; lazy-load / poster-first — [modelviewer.dev Lighthouse example](https://modelviewer.dev/examples/lighthouse2.html); [Cloud Four, embedding 3D models](https://cloudfour.com/thinks/how-to-embed-3d-models-on-the-web/)
- ~280 KB gzipped cited by one tutorial (unverified) — [svilenkovic tutorial](https://svilenkovic.com/3d/model-viewer-google-tutorial)

**Video with alpha**
- Same example clip: VP9-alpha WebM 1.1 MB (Chrome/Firefox); HEVC-alpha MOV 3.4 MB (Safari); stacked AV1 + WebGL 460 KB; stacked HEVC + WebGL 1.14 MB; animated AVIF 504 KB but slow in Chrome/Firefox, a few fps on Android, broken in Safari — [Jake Archibald, Video with alpha transparency on the web (2024)](https://jakearchibald.com/2024/video-with-transparency/)
- Safari does not support VP9 transparency; Chrome Android had alpha bugs with VP9 and Firefox Android stalls; recommended: `<stacked-alpha-video>` with AV1 primary + HEVC fallback; use native VP9/HEVC only if no-JS is required — [Jake Archibald](https://jakearchibald.com/2024/video-with-transparency/)
- Native fallback markup: HEVC source first with `type='video/mp4; codecs="hvc1"'`, then WebM; ffmpeg can drop Apple's alpha from HEVC, verify output — [Rotato, transparent videos 2026](https://rotato.app/blog/transparent-videos-for-the-web); [hontran.dev, HEVC alpha ffmpeg](https://www.hontran.dev/blog/transparent-video-web-hevc-alpha-ffmpeg)

**Gyroscope tilt (webview caveat)**
- iOS requires `DeviceOrientationEvent.requestPermission()` from a transient user activation (button tap); feature-detect it; non-iOS browsers skip the prompt — [MDN, requestPermission](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static)
- `requestPermission` does not exist in cross-origin iframes (iOS 14 report, no workaround) — a phone-frame preview inside an iframe will silently lack gyro — [WebKit Bugzilla 221399](https://bugs.webkit.org/show_bug.cgi?id=221399)
- Serve over HTTPS and ask after interaction, not on load — [OpenReplay, Device Orientation API](https://blog.openreplay.com/understanding-device-orientation-api/)

### Inferences

#### Comparison table (synthesis; sizes from sources above, "cost" is qualitative)
| Technique | JS added | GPU/battery idle | Cold start risk on mid Android | Best for |
|---|---|---|---|---|
| Pre-rendered AVIF/WebP + CSS transform | ~0 | none when static | low (image bytes only) | characters, props, isometric scenes, icons, splash |
| CSS 3D transforms (perspective/preserve-3d) | ~0 | low; compositor | low | tilt cards, flip, layered parallax |
| Pressable lip button (CSS) | 0 | none | none | every primary CTA |
| Rive (canvas/webgl2) | ~78 KB WASM + JS | low if paused offscreen | medium (WASM fetch+compile) | interactive mascot with states (idle/happy/sad), toggles |
| dotLottie | ~150 KB WASM core | low-medium | medium | celebratory one-shots, icon micro-animations, themed |
| Transparent video (stacked alpha) | small component | video decode (HW) | low-medium (bytes) | cinematic character loop, intro |
| R3F + drei | three.js + R3F (hundreds of KB) | high unless `frameloop="demand"` | high | opt-in interactive 3D (rotate a trophy, 3D map) |
| model-viewer | lib + three peer | medium | high if eager | product-style glTF viewer, AR |
| Spline embed | runtime + scene | medium-high | high | marketing/landing hero only |

- Mid-range Android webviews pay for JS parse + WASM compile + WebGL context creation on first use; all three should be off the critical path (lazy `import()` after first paint, or on intent such as tap).
- Never mount more than ~1-2 WebGL contexts on one screen (Rive webgl2 instances, R3F canvas, model-viewer each may hold one); prefer Rive `canvas` package or `useOffscreenRenderer` for lists of animated items.
- Pause everything offscreen: IntersectionObserver → `rive.pause()` / dotLottie `pause()` / R3F `frameloop="never"`; and pause on `visibilitychange` (webview backgrounding).
- Landscape phone frame (926x428 / 832x384): vertical space is ~400px, so 3D art must be compact; render character art at 2x the CSS box (e.g. 320px box → 640px AVIF) and cap `dpr` at 2 for any canvas to save fill-rate.

#### Recipe A — pressable lip button (Tailwind v4 + CSS vars; transforms only)
```css
/* recipe */
.btn-lip { position: relative; border: 0; background: none; padding: 0;
  -webkit-tap-highlight-color: transparent; user-select: none; }
.btn-lip > .edge { position: absolute; inset: 0; border-radius: 16px;
  background: var(--color-brand-800); }               /* the lip */
.btn-lip > .face { position: relative; display: block; border-radius: 16px;
  padding: 12px 24px; min-height: 44px; background: var(--color-brand-600);
  transform: translateY(-4px);
  transition: transform 250ms cubic-bezier(.3,.7,.4,1.5); }
.btn-lip:active > .face { transform: translateY(-1px); transition-duration: 34ms; }
.btn-lip:focus-visible { outline: 3px solid var(--color-gold-500); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) { .btn-lip > .face { transition: none; } }
```
(Press feel stays even with reduced motion because the 3px displacement is state feedback, not decorative motion; only the overshoot spring is removed.)

#### Recipe B — pointer/gyro tilt card (CSS vars driven by JS, rAF-throttled)
```tsx
// recipe
function useTilt(ref: React.RefObject<HTMLElement>, max = 8) {
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const set = (x: number, y: number) => { cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--rx', `${(-y * max).toFixed(2)}deg`);
        el.style.setProperty('--ry', `${(x * max).toFixed(2)}deg`); }); };
    const onMove = (e: PointerEvent) => { const r = el.getBoundingClientRect();
      set((e.clientX - r.left) / r.width - .5, (e.clientY - r.top) / r.height - .5); };
    const reset = () => set(0, 0);
    el.addEventListener('pointermove', onMove); el.addEventListener('pointerleave', reset);
    return () => { el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', reset); cancelAnimationFrame(raf); };
  }, [ref, max]);
}
// CSS: .tilt{transform:perspective(800px) rotateX(var(--rx,0)) rotateY(var(--ry,0));
//            transition:transform 200ms ease-out}
//      .tilt > .layer-fg{transform:translateZ(30px)} (needs transform-style:preserve-3d)
```
Gyro variant: only after an explicit user tap ("Activer l'effet 3D"), feature-detect `DeviceOrientationEvent.requestPermission`, map `gamma`/`beta` clamped to ±15° into the same `set()`. Will not work inside a cross-origin iframe on iOS.

#### Recipe C — layered parallax diorama from pre-rendered PNG/AVIF layers
```tsx
// recipe: 3-4 layers, each translated by depth factor; compositor-only
<div className="relative overflow-hidden [perspective:1000px]">
  {layers.map(l => (
    <img key={l.src} src={l.src} alt="" aria-hidden decoding="async"
      className="absolute inset-0 will-change-transform"
      style={{ transform: `translate3d(calc(var(--px,0)*${l.depth}px),0,0)` }} />
  ))}
  <div className="contact-shadow" />  {/* radial-gradient ellipse under the hero */}
</div>
```
Contact shadow: `background: radial-gradient(closest-side, rgb(0 0 0 / .22), transparent); filter` not animated; scale it (transform) when the character hops so the shadow shrinks as it rises.

#### Recipe D — Rive character, lazy and paused offscreen
```tsx
// recipe
const RiveMascot = lazy(() => import('./RiveMascot')); // chunk contains @rive-app/react-canvas
<Suspense fallback={<img src={mascotPoster} alt="" />}><RiveMascot /></Suspense>
// inside RiveMascot: useRive({ src, stateMachines:'Main', autoplay:true });
// IntersectionObserver -> rive.pause()/play(); reduced motion -> show static poster frame
```

#### Recipe E — transparent video loop
```html
<!-- recipe: native fallback order (Safari picks HEVC first) -->
<video autoplay muted loop playsinline poster="hero.avif">
  <source src="hero-hevc.mp4" type='video/mp4; codecs="hvc1"'>
  <source src="hero-vp9.webm" type="video/webm">
</video>
```
Prefer Jake Archibald's `<stacked-alpha-video>` (AV1 + HEVC) for 2-3x smaller files and fewer Android alpha bugs. Must be `muted playsinline` for autoplay in iOS webviews.

#### Recipe F — R3F only when opted in
```tsx
// recipe
<Canvas frameloop="demand" dpr={[1, 2]} gl={{ antialias: false, powerPreference: 'low-power' }}
        performance={{ min: 0.5 }}>
  <PerformanceMonitor onDecline={() => setDpr(1)} />
  <Suspense fallback={null}><Model url="/trophy-draco.glb" /></Suspense>
  <ContactShadows opacity={0.35} blur={2.5} frames={1} /> {/* bake once */}
</Canvas>
```
(`frames={1}` on drei ContactShadows renders the shadow once instead of per frame — drei API; verify against the installed drei version.)

### Gaps
- No independent, current measurement of cold-start time for Rive/dotLottie/R3F/Spline on a Galaxy A55 or recent iPhone was found; must be measured in-project (Chrome remote debugging Performance panel on the real device).
- No authoritative gzipped size for `@splinetool/react-spline`, `@rive-app/react-canvas`, or current model-viewer; figures above are partial (Rive WASM 78 KB, dotLottie core 150 KB, model-viewer ~280 KB unverified).
- No 2025-2026 benchmark of Rive vs dotLottie on the web specifically (Callstack's numbers are React Native on a 2014 phone).
- Whether Chrome Android VP9-alpha bug is fixed in stable as of late 2026 was not re-verified (Archibald's 2024 note said fixed in Canary).

---

## 3. Motion rules: entrance choreography, idle loops, springs, reduced motion, frame budgets, splash/launch

### Takeaway
Motion must be purposeful, brief, cancellable and optional; both Apple and Google moved to spring/physics feel, but Apple explicitly says the launch screen is not for artistic expression or animation, and that frequent interactions should not carry extra motion. Put a branded animated moment (if any) after launch as a short, skippable splash at the start of onboarding, not on every cold start.

### Cited Findings
- "Add motion purposefully… Don't add motion for the sake of adding motion. Gratuitous or excessive animation can distract people and may make them feel disconnected or physically uncomfortable." — [Apple HIG, Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- "Make motion optional" — don't use motion as the only way to communicate; supplement with haptics and audio — [Apple HIG, Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- "Aim for brevity and precision in feedback animations"; "In apps, generally avoid adding motion to UI interactions that occur frequently"; "Let people cancel motion" — [Apple HIG, Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- Games: "maintaining a consistent frame rate of 30 to 60 fps typically results in a smooth" experience; let people trade visual quality for performance/battery — [Apple HIG, Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- Avoid sustained oscillation, especially around 0.2 Hz; keep amplitude low (stated for visionOS, relevant to idle loops) — [Apple HIG, Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- Liquid Glass motion responds to direct touch "with greater emphasis to reinforce the feeling of a tactile experience" — [Apple HIG, Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- "Launch instantly"; launch screen should be "nearly identical to the first screen"; "Avoid including text on your launch screen"; "Don't advertise. The launch screen isn't a branding opportunity"; it "isn't an opportunity for artistic expression" — [Apple HIG, Launching](https://developer.apple.com/design/human-interface-guidelines/launching)
- "If you need a splash screen, consider displaying it at the beginning of your onboarding flow" — [Apple HIG, Launching](https://developer.apple.com/design/human-interface-guidelines/launching)
- Landscape-only: launch in landscape and respond correctly whether rotated left or right — [Apple HIG, Launching](https://developer.apple.com/design/human-interface-guidelines/launching)
- M3 Expressive replaces duration/easing curves with a spring-based physics system, exposed as a "motion scheme" token layer (expressive vs standard) — [9to5Google](https://9to5google.com/2025/05/13/android-16-material-3-expressive-redesign/); [besthub, M3 motion as theme](https://www.besthub.dev/articles/why-google-s-material-3-update-turns-motion-into-a-theme-it-s-not-about-the-bounce-9436fce4a345); [Google codelab](https://codelabs.developers.google.com/codelabs/mdc-102-objc)
- Community M3E token values (inconsistent across libraries; treat as illustrative): expressive spatial default stiffness 380, damping ratio ~0.73-0.8; standard spatial default 700 / 0.9; fast spatial 1400 / 0.9; effects springs damping 1 (no bounce) — [material_expressive (pub.dev)](https://pub.dev/documentation/material_expressive/0.8.0/); [M3EMotion (pub.dev)](https://pub.dev/documentation/m3e_slider/0.0.2/common_m3e_common/M3EMotion-class.html)
- Pushable button timings: press ~34ms, hover 250ms overshoot, release 600ms ease-out — [Josh W. Comeau](https://www.joshwcomeau.com/animation/3d-button/)
- `prefers-reduced-motion` CSS and `matchMedia` JS; JS animations must be stopped manually and listen for `change`; "reduce, don't remove" — keep feedback like progress, drop parallax, zoom, background video — [web.dev, prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion)
- React time-slicing (`startTransition`) spreads heavy 3D object creation across frames (510 TextGeometry: ~5 fps at once vs ~20 fps spread) — [R3F docs](https://r3f.docs.pmnd.rs/advanced/scaling-performance)

### Inferences
- Frame budget: 60 Hz = 16.7 ms/frame total (browser needs part of it, so ~10 ms for app work); 120 Hz phones = 8.3 ms. Keep continuous animation compositor-only (transform/opacity) so it survives main-thread work. (Arithmetic, not a cited figure.)
- **Entrance choreography recipe:** hero (character) first, then primary CTA, then secondary; stagger 40-60 ms, each 250-400 ms, translateY 8-16px + opacity; total under ~600 ms; skip entirely on repeat visits within a session and under reduced motion (crossfade only).
- **Idle loops:** low amplitude (2-4px bob or 1-2° sway), slow (3-6 s period ≈ 0.17-0.33 Hz — note this sits near Apple's 0.2 Hz sensitivity warning, so keep amplitude tiny or make idle loops event-driven: blink every few seconds rather than continuous bob); pause offscreen and after ~10-20 s of no interaction; none under reduced motion.
- **Springs on the web without a library:** CSS `linear()` easing can approximate a spring (generated curve), or use a tiny spring in rAF; libraries like Motion (framer-motion) are acceptable per project rules only if a screen genuinely needs gesture springs. Example approximation: `transition: transform 500ms linear(0, 0.6 12%, 1.04 24%, 1.01 36%, 0.99 52%, 1)` (recipe; tune visually).
- **Splash/launch for the wrapped app:** native launch screen = solid brand cream colour (matching first screen background), no logo text; the web app's first paint should match it; then optional ≤1.5 s skippable branded moment only on first launch/onboarding; never block input on an animation; preload the first screen's art during it.
- Under reduced motion: keep pressed-state displacement and progress fills (state feedback), remove parallax, tilt, idle loops, entrance staggers, confetti bursts (replace with a static stamp + sound/haptic).

### Gaps
- Official M3 Expressive spring token values could not be retrieved from m3.material.io (client-rendered); only community libraries' values, which disagree.
- No authoritative source found for "ideal" stagger/entrance durations for web apps in 2026; the choreography numbers above are craft conventions.

---

## 4. Accessibility & legibility: text over 3D art, focus, reduced motion, vestibular issues

### Takeaway
Treat parallax, tilt, zoom and scroll-linked 3D as non-essential motion that must switch off with `prefers-reduced-motion` (WCAG 2.3.3, AAA, but widely expected); keep text off busy 3D art or put it on a dimmed/opaque material; 3D art is decorative (`alt=""`, `aria-hidden`) unless it carries meaning.

### Cited Findings
- WCAG 2.3.3 Animation from Interactions (AAA): "Motion animation triggered by interaction can be disabled" unless essential; non-essential scroll-triggered movement can cause vestibular reactions "dizziness, nausea and headaches"; parallax scrolling is named as a common non-essential animation; sufficient techniques C39 (CSS prefers-reduced-motion) and SCR40 (JS) — [W3C, Understanding SC 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
- Android maps "Remove animations" and macOS "Reduce motion" to `prefers-reduced-motion: reduce`; author motion inside `no-preference` so unsupported browsers don't get surprised — [web.dev, prefers-reduced-motion](https://web.dev/articles/prefers-reduced-motion)
- Apple: clear Liquid Glass only over visually rich backgrounds; if underlying content is bright, "consider adding a dark dimming layer of 35% opacity"; regular variant blurs and adjusts luminosity for legibility; use for components with significant text — [Apple HIG, Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- Apple: thicker (more opaque) materials provide better contrast for text with fine features; thinner ones preserve context; avoid lowest-contrast (quaternary) labels on thin materials; system settings like Reduce Transparency / Increase Contrast change glass appearance — [Apple HIG, Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- Apple: make motion optional and pair with haptics/audio — [Apple HIG, Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- Comeau's button keeps keyboard focus outlines via `:focus-visible` while hiding them for mouse — [Josh W. Comeau](https://www.joshwcomeau.com/animation/3d-button/)
- Gyro permission must come from a user gesture — so tilt can be an explicit opt-in — [MDN requestPermission](https://developer.mozilla.org/en-US/docs/Web/API/DeviceOrientationEvent/requestPermission_static)

### Inferences
- Text over 3D art: place text on a solid/near-solid panel (cream card) or a scrim gradient; measure contrast against the busiest pixel region, not the average; ≥4.5:1 for body, ≥3:1 for large text/icons (WCAG 1.4.3/1.4.11 — standard thresholds, not fetched here).
- Web equivalents of Reduce Transparency: `@media (prefers-reduced-transparency: reduce)` (Chromium support; not Safari as far as known) and `prefers-contrast: more` → swap `backdrop-filter` glass for opaque surface. Verify browser support before relying on it.
- `backdrop-filter: blur()` is a paint-heavy effect (web.dev lists blurs as costly); on mid Android webviews limit to one fixed bar, small blur radius, never animate the blur.
- Provide an in-app "Effets 3D / animations" toggle (WCAG technique Gx) that also defaults off when the OS reports reduced motion; children with vestibular sensitivity or ADHD benefit.
- Pressable buttons: 3D lip must not reduce hit area — keep the whole button (face+edge) ≥44px tall; focus ring outside the lip with offset.
- Decorative 3D characters: `alt=""` + `aria-hidden`; if a character conveys state (sad = wrong answer), also convey with text/sound.

### Gaps
- Did not fetch WebKit/Chromium support status of `prefers-reduced-transparency` for Nov 2026.
- No research found specifically on vestibular impact of gyroscope tilt in phone UIs (as opposed to scroll parallax).

---

## 5. Official guidance summary (Apple HIG, Material 3, web.dev)

### Takeaway
Apple: launch screen is a fast, near-identical placeholder (no text, no logo, no animation), splash belongs to onboarding; motion purposeful, brief, optional, cancellable; Liquid Glass only for the floating control layer, sparingly, with dimming for legibility. Material 3 Expressive: spring-based motion schemes and more shape/type expressiveness. web.dev: animate transform/opacity only, avoid layout/paint (blur, shadows), use will-change sparingly, honour prefers-reduced-motion by reducing rather than removing.

### Cited Findings
- Apple Launching (updated Jun 2024: splash guidance) — launch instantly; downplay launch; nearly identical to first screen; no text; don't advertise; splash at start of onboarding; restore previous state — [Apple HIG, Launching](https://developer.apple.com/design/human-interface-guidelines/launching)
- Apple Motion (updated Sep 2025 for Liquid Glass) — purposeful, optional, realistic, brief, avoid on frequent interactions, cancellable, 30-60 fps for games, power-mode options — [Apple HIG, Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- Apple Materials (Liquid Glass guidance added Jun 2025, updated Sep 9 2025) — two material families (Liquid Glass vs standard ultra-thin/thin/regular/thick), no glass in content layer, sparingly, clear variant only over rich media, 35% dimming over bright content — [Apple HIG, Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- Material 3 Expressive (May 2025): spring physics motion system replacing easing/duration, motion scheme tokens, 15 components updated, shape morphing — [9to5Google](https://9to5google.com/2025/05/13/android-16-material-3-expressive-redesign/); [Android Authority](https://www.androidauthority.com/google-material-3-expressive-features-changes-availability-supported-devices-3556392/); [Supercharge Design, M3 Expressive](https://supercharge.design/blog/material-3-expressive)
- web.dev high-performance animations — transform/opacity, avoid layout/paint triggers, blurs/shadows costly, will-change sparingly, DevTools paint flashing / FPS meter — [web.dev](https://web.dev/articles/animations-guide)
- web.dev prefers-reduced-motion — CSS/JS patterns, `<picture>` for animated images, reduce not remove — [web.dev](https://web.dev/articles/prefers-reduced-motion)
- W3C WCAG 2.3.3 — interaction-triggered motion can be disabled; parallax named — [W3C](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

### Inferences
- For the wrapped Wael app: the iOS/Android native launch screen should be a plain cream (`--color-cream`-like) screen identical to the first web screen's background; any animated mascot "Bienvenue" belongs to onboarding/first-run, skippable.
- Platform skin split: iOS skin → glass only on tab bar/nav (with dimming over bright art), springy but subdued; Android skin → M3E-style springs (expressive scheme for hero moments, standard for utility), tonal surfaces instead of glass.
- A practical 3D budget per screen: one hero 3D asset (pre-rendered or Rive), at most one live canvas, no continuous animation competing with the primary action.

### Gaps
- m3.material.io content (motion, elevation pages) could not be fetched (JS-rendered); elevation guidance for M3 (tonal vs shadow elevation) is from general knowledge and not cited here.
- Apple's "Reduce Motion" web mapping (iOS Safari → `prefers-reduced-motion`) is widely known but the fetched web.dev article only names macOS and Android.
