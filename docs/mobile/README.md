# Wael Academy on the phone — `mobile.` gallery, platform skins, gamified theme

> Start here. This folder holds the research, the decisions and the how-to for
> the **mobile version** of the élève space (`/student-v2`): how it is shown on
> an iPhone and a Galaxy side by side, how it wears each platform's conventions,
> and how its look was pushed toward a gamified learning app **without adding
> features**. Written for developers and AI coding agents alike.

---

## 1. What exists

| Thing | Where | What it is |
|---|---|---|
| **The device gallery** | `/mobile` on any host · the root of `mobile.<host>` | Two realistic phone frames — **iPhone 13 Pro Max** (428×926 pt) and **Samsung Galaxy A55 5G** (384×832 dp — Samsung ships the A5x at 450 dpi, see `device-specs.md` §2.3; the app must hold at 384 px) — each with the live app in a same-origin `<iframe>`. A screen picker, a `play`/`soft` skin switch, light/dark, reload, "open in a window". |
| **The platform layer** | `src/app/platform.ts` | Detects `ios` / `android` / `web` (URL → `window.name` → user agent), stamps `data-platform`, `data-skin`, `data-framed` on `<html>` and the system-bar insets as `--sai-top` / `--sai-bottom`. |
| **Frame geometry** | `src/features/mobile/devices.ts` | Every number of both phones (screen, bezels, radii, cut-out, keys, bars) as data; `DeviceFrame.tsx` draws it, `SystemBars.tsx` paints the status bar / notch / hole / home bar over the app. Material (metal ring, glass, keys) in `src/styles/mobile.css`. |
| **iOS skin** | `src/styles/platform/ios.css` + `usePlatform()` branches (`IosTabBar`, the large-title greeting, the 38 pt search capsule, sheet grabbers) | What the app wears inside the iPhone: iOS 26/27 Liquid Glass chrome — a floating 64 pt glass tab bar (labels always on), a back button in the header on pushed screens, text-size that follows Dynamic Type, 22/14 px concentric radii, 38 px sheets. See `ios-patterns.md` and the skill `.claude/skills/wael-mobile-ios`. |
| **Android skin** | `src/styles/platform/android.css` + `usePlatform()` branches (`AndroidNavBar`, headline greeting, 56 dp search bar) | What the app wears inside the Galaxy: Material 3 Expressive chrome — a 64 dp flexible navigation bar with a 56×32 lime pill and ripple that hides on scroll-down, tonal `--m3-*` surfaces derived from the brand, 28/16 dp radii, 28 dp sheets with a 32×4 handle. See `android-patterns.md` and the skill `.claude/skills/wael-mobile-android`. |
| **Gamified skin (`play`)** | `src/styles/skins/play.css` (+ hook classes `.v2-*` on the student-v2 components, primitives `Ring` / `Num` / `Burst` / `useShake` in `ui.tsx`) | The restyle of the EXISTING élève features toward Duolingo/Brilliant-grade game feel — chunky pressable CTAs and tiles with a lip, flat 2 px panels, countdown ring, collectible documents, chapter ladder, finish stamps, one earned burst per screen, warmer derja. No new features, no XP. Default; `?skin=soft` (or the gallery's « هادي ») shows the flat Figma look. See `gamification-design.md` and the skill `.claude/skills/wael-gamified`. |
| **Feature catalogue** | `docs/features-catalog.html` (+ `features-research.md`) | 104 cards (97 features + 7 anti-features) across exam prep, exercises, live & replays, shared/social, habits, organisation, per-subject programme design, teacher/admin counterparts and a roadmap — filterable by section/effort/impact/role/horizon, each with EN/AR/FR names, the learning-science rationale, reference apps and the data it needs. Open the file locally; no network needed. |
| **Sound contract** | `docs/sound-effects.md` §5 | Updated with the skin's new moments: locked chapitre → `blocked` + shake, last file → `achievement` + burst, video end → stamp + `achievement`. |
| **Screenshot tool** | `scripts/shot.mjs` · `npm run shot -- <url> <w> <h> <out.png> [js] [waitMs]` | Headless-Chrome screenshots/measurements at an exact CSS viewport (device-metrics emulation, so a 125 % display doesn't skew widths). |

## 2. Run it

```bash
npm run dev
# the gallery
open http://localhost:5173/mobile
# the subdomain, locally — browsers resolve *.localhost to the machine and Vite
# accepts any .localhost host by default, so nothing to configure:
open http://mobile.localhost:5173/
# one phone, full window, iOS conventions on a desktop browser:
open "http://localhost:5173/student-v2?platform=ios&insets=47,34"
# the flat (pre-gamification) look, for comparison:
open "http://localhost:5173/student-v2?skin=soft"
```

## 3. How the pieces talk

```
mobile.<host>/            DeviceGallery (src/features/mobile)
  ├─ <iframe name="wael-device:platform=ios;top=47;bottom=34"
  │          src="/student-v2?platform=ios&insets=47,34">   ← iPhone frame
  └─ <iframe name="wael-device:platform=android;top=34;bottom=24"
             src="/student-v2?platform=android&insets=34,24"> ← Galaxy frame

inside each iframe, before React renders (main.tsx → installDevice()):
  <html data-platform="ios" data-skin="play" data-framed
        style="--sai-top:47px; --sai-bottom:34px">
```

* **Why `window.name`?** React Router drops the query string on the first
  navigation, and `sessionStorage` is shared by every same-origin frame in the
  tab — two phones side by side would overwrite each other. `window.name` is
  per-frame and survives navigation. The gallery sets it through the iframe's
  `name` attribute; `platform.ts` also writes it back after reading the URL.
* **Why `--sai-*`?** `env(safe-area-inset-*)` is **0 inside an iframe**. The
  frame therefore tells the app its bar heights in px, and every fixed bar in
  the app reads `var(--sai-top)` / `var(--sai-bottom)` (the `pt-safe`/`pb-safe`
  utilities and the inline `max(1rem, var(--sai-top))` paddings). On a real
  phone the variables default to `env()`, so nothing changes there.
* **Scaling.** Each frame is laid out at true size (1 CSS px = 1 pt/dp) and the
  whole body is `transform: scale()`d to fit the stage — never above 1. The
  app inside is therefore pixel-true to the device whenever the screen has room.
* **Theme.** The gallery's moon/sun toggles the shared `wael-theme` in
  `localStorage` and remounts both iframes (the app reads the theme at boot).
* **The docks.** Inside a frame the palette/type docks are not rendered
  (`getDevice().framed`); on the gallery page itself they are hidden
  (`[data-gallery] [data-dock]`). The élève space's own « حالات » states dock
  stays — it is how demo states are shown on a phone.

## 4. Deploying the subdomain

Nothing in the build is host-specific: the same static bundle serves the site,
the app and the gallery. `mobile.<domain>` only needs to **reach the same
deployment with SPA fallback**, and the router does the rest
(`/^mobile\./.test(location.hostname)` → the root route is the gallery).

* DNS: `mobile  CNAME  <the host the main domain points to>` (or the same A
  record).
* Vercel / Netlify / Cloudflare Pages: add `mobile.<domain>` as an extra domain
  of the same project; keep the SPA rewrite (`/* → /index.html`).
* Nginx: add `mobile.<domain>` to `server_name` of the same `server` block
  (same `root`, same `try_files $uri /index.html`).
* Cross-origin note: the frames load `/student-v2` from the **same origin** as
  the gallery, so no CORS, no `X-Frame-Options` exception is needed. If the app
  is ever served from a different origin than the gallery, set
  `Content-Security-Policy: frame-ancestors 'self' https://mobile.<domain>` on
  the app.

## 5. Reading order

1. `device-specs.md` — the two phones in numbers; where the frame geometry comes from.
2. `ios-patterns.md` — what iOS 26 expects; the iOS-skin rules.
3. `android-patterns.md` — what Material 3 Expressive / One UI expect; the Android-skin rules.
4. `gamification-design.md` — the case studies, the toolkit, and the screen-by-screen restyle.
5. `trends-2026.md` — what is current, what is fading, what it means for us.
6. `features-research.md` → `../features-catalog.html` — what to build next.

The three skills in `.claude/skills/` (`wael-mobile-ios`, `wael-mobile-android`,
`wael-gamified`) are the **operational** distillation of 2–4: read the skill
before building a surface, the research when you need the why.

A fourth, third-party skill, `apple-design` (vendored from
github.com/dickwu/apple-design-skill — see its `VENDORED.md`), is a **reviewer**: it
audits a screen against Apple's own HIG wording (123 pages) and cites the page.
Build with `wael-mobile-ios`, audit with `apple-design`, fix through
`wael-mobile-ios`. Its last audit of the iPhone skin is `apple-design-audit.md`.
