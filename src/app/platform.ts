/**
 * Which phone the app is being looked at on — and so which platform's
 * conventions it wears (`data-platform` on <html>), which skin it is drawn in
 * (`data-skin`), and how much of the screen the system bars take
 * (`--sai-top` / `--sai-bottom`, the safe-area insets).
 *
 * Three sources, in order:
 *   1. the URL — `?platform=ios&insets=47,34&skin=play`. The mobile gallery's
 *      iframes start here (src/features/mobile), and so can anyone who wants
 *      to see the iOS look on a desktop browser.
 *   2. `window.name` — the one per-frame storage that survives in-app
 *      navigation. React Router drops the query string on the first link, and
 *      sessionStorage is shared by every same-origin frame in a tab, so two
 *      phones side by side would overwrite each other's platform.
 *   3. the user agent — a real iPhone or Android phone opening the app.
 * Anything else is `web`: the desktop look, no system bars to keep clear of.
 *
 * `env(safe-area-inset-*)` is 0 inside an iframe, so a framed document is told
 * its bars' heights in px; a real device keeps `env()` (see index.css, App base).
 */

export type Platform = "ios" | "android" | "web"

/**
 * The look of the élève space: `play` is the gamified restyle, `soft` the flat
 * Figma-faithful one. Default `play`; `?skin=soft` to compare.
 */
export type Skin = "play" | "soft"

export interface DeviceContext {
  platform: Platform
  skin: Skin
  /** System-bar heights to keep clear of, in CSS px — `null` on a real device (env() rules). */
  insets: { top: number; bottom: number } | null
  /** True inside a device frame (the mobile gallery) or when the URL asked for a platform. */
  framed: boolean
}

const NAME_PREFIX = "wael-device:"
const PLATFORMS: readonly Platform[] = ["ios", "android", "web"]
const SKINS: readonly Skin[] = ["play", "soft"]

/** `platform=ios;top=47;bottom=34` → a record. */
function parsePairs(source: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const pair of source.split(";")) {
    const i = pair.indexOf("=")
    if (i > 0) out[pair.slice(0, i).trim()] = pair.slice(i + 1).trim()
  }
  return out
}

function fromUserAgent(): Platform {
  const ua = navigator.userAgent
  // iPadOS reports itself as a Mac — the touch points give it away.
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios"
  if (/Android/.test(ua)) return "android"
  return "web"
}

const isPlatform = (v: string | undefined): v is Platform => PLATFORMS.includes(v as Platform)
const isSkin = (v: string | undefined): v is Skin => SKINS.includes(v as Skin)

export function detectDevice(): DeviceContext {
  const url = new URLSearchParams(window.location.search)
  const named = window.name.startsWith(NAME_PREFIX) ? parsePairs(window.name.slice(NAME_PREFIX.length)) : {}
  const pick = (key: string) => url.get(key) ?? named[key]

  const asked = pick("platform")
  const platform = isPlatform(asked) ? asked : fromUserAgent()
  const skinAsked = pick("skin")
  const skin = isSkin(skinAsked) ? skinAsked : "play"

  const insetsParam = url.get("insets")
  const [topRaw, bottomRaw] = insetsParam ? insetsParam.split(",") : [named.top, named.bottom]
  const top = Number(topRaw)
  const bottom = Number(bottomRaw)
  const explicit = asked !== undefined
  const framed = explicit || window.self !== window.top
  const insets = framed ? { top: Number.isFinite(top) ? top : 0, bottom: Number.isFinite(bottom) ? bottom : 0 } : null

  // Remember it on the frame itself, so the next in-app navigation still knows.
  if (framed) {
    window.name = `${NAME_PREFIX}platform=${platform};skin=${skin};top=${insets?.top ?? 0};bottom=${insets?.bottom ?? 0}`
  }

  return { platform, skin, insets, framed }
}

let current: DeviceContext | null = null

/** Detect once and stamp <html>; call before the first render (main.tsx). */
export function installDevice(): DeviceContext {
  const ctx = detectDevice()
  const root = document.documentElement
  root.setAttribute("data-platform", ctx.platform)
  root.setAttribute("data-skin", ctx.skin)
  if (ctx.framed) root.setAttribute("data-framed", "")
  if (ctx.insets) {
    root.style.setProperty("--sai-top", `${ctx.insets.top}px`)
    root.style.setProperty("--sai-bottom", `${ctx.insets.bottom}px`)
  }
  if (ctx.platform === "ios") trackDynamicType()
  current = ctx
  return ctx
}

/**
 * Dynamic Type: the text size the person chose in iOS Settings.
 *
 * WebKit sizes the `-apple-system-body` font from it — 17 px at the default
 * setting, up to ~53 px at the largest accessibility size — so a hidden
 * probe set in that font reads the setting. The ratio to 17 lands in
 * `--dt-scale`, which the iOS skin multiplies into `--ts`
 * (src/styles/platform/ios.css). Browsers that don't know the font (every
 * non-Apple one, i.e. the desktop gallery) skip it and keep 1. Re-read when
 * the page comes back to the foreground: that is when the setting changes.
 */
function trackDynamicType() {
  if (typeof CSS === "undefined" || !CSS.supports("font", "-apple-system-body")) return
  const probe = document.createElement("span")
  probe.setAttribute("aria-hidden", "true")
  probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;font:-apple-system-body"
  probe.textContent = "x"
  document.body.appendChild(probe)
  const read = () => {
    const px = parseFloat(getComputedStyle(probe).fontSize)
    if (px > 0) document.documentElement.style.setProperty("--dt-scale", String(px / 17))
  }
  read()
  document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && read())
  window.addEventListener("resize", read)
}

/** The context stamped at boot — constant for the life of the document. */
export function getDevice(): DeviceContext {
  return current ?? installDevice()
}

/** `ios` · `android` · `web` — for the few places that render DIFFERENT components per platform. */
export function usePlatform(): Platform {
  return getDevice().platform
}

export function useSkin(): Skin {
  return getDevice().skin
}
