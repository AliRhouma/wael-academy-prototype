import { createContext, useContext, useEffect, useState, type CSSProperties, type ReactNode } from "react"
import { Link, Outlet, useSearchParams } from "react-router-dom"
import { RotateCcw, Smartphone } from "lucide-react"
import { cn } from "@/lib/utils"
import { useGameDocument } from "@/features/game/shared/parts"
import { gCta } from "@/features/game/shared/ui"
import { GALAXY_A55, IPHONE_13_PRO_MAX, type DeviceSpec } from "@/features/mobile/devices"

/**
 * `/mobilegame` — the game app, a phone held SIDEWAYS (landscape-first).
 *
 * One component, three situations:
 *  - a desktop browser (fine pointer, wide): the app runs inside one of the
 *    mobile gallery's two phones turned on its side — iPhone 13 Pro Max
 *    (926 × 428 pt) or Galaxy A55 (832 × 384 dp), switched with « ?device= » —
 *    at true size (scaled down only if the window is too small), with the
 *    notch / punch-hole on the left edge and the home bar at the bottom;
 *  - a real phone held sideways: the app fills the screen and keeps clear of
 *    the notch / home bar through `env(safe-area-inset-*)`;
 *  - a real phone held upright: a « دوّر تلفونك » card, with a way past it.
 *
 * Screens never look at which one they're in: they read the insets through
 * `--gs-top / --gs-left / --gs-right / --gs-bottom` (see `MobileScreen`), and
 * the platform through `useGamePlatform()` for the few conventions that differ
 * (the back arrow, for now).
 */

export type GamePlatform = "ios" | "android"
const PlatformCtx = createContext<GamePlatform>("ios")
/** iOS or Android — the frame's on a desktop, the real phone's otherwise. */
export const useGamePlatform = () => useContext(PlatformCtx)

function useMedia(query: string) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [query])
  return match
}

/**
 * Each phone on its side (turned so the cutout is on the LEFT). Landscape safe
 * areas: iOS keeps 47 pt clear on BOTH long-side edges and 21 pt for the home
 * indicator; Android keeps the cutout edge clear (its status-bar height, 36 dp)
 * and 24 dp for the gesture handle.
 *
 * The Android values ASSUME IMMERSIVE MODE (status bar hidden, as Android
 * recommends for games): a non-immersive app in landscape keeps the status
 * bar across the top (24–36 dp) — wrap the app with immersive mode on, or
 * raise --gs-top to the status-bar height.
 */
const LANDSCAPE: Record<GamePlatform, { spec: DeviceSpec; label: string; insets: CSSProperties }> = {
  ios: {
    spec: IPHONE_13_PRO_MAX,
    label: "iPhone",
    insets: { "--gs-top": "8px", "--gs-left": "47px", "--gs-right": "47px", "--gs-bottom": "21px" } as CSSProperties,
  },
  android: {
    spec: GALAXY_A55,
    label: "Galaxy",
    insets: { "--gs-top": "8px", "--gs-left": "36px", "--gs-right": "12px", "--gs-bottom": "24px" } as CSSProperties,
  },
}

/** The platform text scale (wael-mobile-ios / -android): iOS body 17 pt, Android 16 sp. */
const TS: Record<GamePlatform, number> = { ios: 1.6, android: 1.55 }

const DEVICE_INSETS = {
  "--gs-top": "max(env(safe-area-inset-top), 8px)",
  "--gs-left": "max(env(safe-area-inset-left), 12px)",
  "--gs-right": "max(env(safe-area-inset-right), 12px)",
  "--gs-bottom": "max(env(safe-area-inset-bottom), 8px)",
} as CSSProperties

/** The phone body around a landscape screen — band, glass, cutout, keys, home bar. */
function LandscapePhone({ platform, scale, children }: { platform: GamePlatform; scale: number; children: ReactNode }) {
  const { spec, insets } = LANDSCAPE[platform]
  const sw = spec.screen.h // landscape: the long side is the width
  const sh = spec.screen.w
  // Portrait top bezel → landscape left; portrait bottom (the chin) → right.
  const bz = { left: spec.bezel.top, right: spec.bezel.bottom, top: spec.bezel.side, bottom: spec.bezel.side }
  const ow = sw + bz.left + bz.right
  const oh = sh + bz.top + bz.bottom
  return (
    <div dir="ltr" style={{ width: ow * scale, height: oh * scale }}>
      <div className="relative" style={{ width: ow, height: oh, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        {/* keys: the portrait right edge is the landscape top, the left edge the bottom */}
        {spec.keys.map((k, i) => (
          <span
            key={i}
            aria-hidden
            className="absolute rounded-full"
            style={{
              background: spec.colors.band,
              left: k.top,
              width: k.h,
              height: k.kind === "switch" ? 6 : 5,
              ...(k.side === "right" ? { top: -4 } : { bottom: -4 }),
            }}
          />
        ))}
        <div
          className="absolute inset-0 shadow-[0_40px_90px_-30px_rgb(0_0_0/.6)]"
          style={{ borderRadius: spec.bodyRadius, background: spec.colors.band, padding: spec.band }}
        >
          <div className="h-full w-full" style={{ borderRadius: spec.bodyRadius - spec.band, background: spec.colors.glass }} />
        </div>
        <div
          dir="rtl"
          className="absolute overflow-hidden bg-v2-canvas-base"
          style={{ left: bz.left, top: bz.top, width: sw, height: sh, borderRadius: spec.screen.radius, ...insets, "--ts": TS[platform] } as CSSProperties}
        >
          {children}
          {spec.cutout.kind === "notch" ? (
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 top-1/2 z-50 -translate-y-1/2"
              style={{ width: spec.cutout.h, height: spec.cutout.w, background: spec.colors.glass, borderRadius: `0 ${spec.cutout.radius}px ${spec.cutout.radius}px 0` }}
            />
          ) : (
            <span
              aria-hidden
              className="pointer-events-none absolute top-1/2 z-50 -translate-y-1/2 rounded-full"
              style={{ left: spec.cutout.top, width: spec.cutout.d, height: spec.cutout.d, background: spec.colors.glass }}
            />
          )}
          <span
            aria-hidden
            className="pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 rounded-full bg-v2-ink/75"
            style={{ bottom: spec.homeBar.bottom, width: spec.homeBar.w, height: spec.homeBar.h }}
          />
        </div>
      </div>
    </div>
  )
}

/** Fit the phone in the window: true size when it fits, scaled down when not. */
function useFitScale(platform: GamePlatform) {
  const { spec } = LANDSCAPE[platform]
  const ow = spec.screen.h + spec.bezel.top + spec.bezel.bottom
  const oh = spec.screen.w + 2 * spec.bezel.side
  const calc = () => Math.min(1, (window.innerWidth - 48) / ow, (window.innerHeight - 170) / oh)
  const [scale, setScale] = useState(calc)
  useEffect(() => {
    const on = () => setScale(calc())
    on()
    window.addEventListener("resize", on)
    return () => window.removeEventListener("resize", on)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform])
  return scale
}

export default function MobileGameLayout() {
  useGameDocument("مدينة وائل — التطبيق")
  const framed = useMedia("(hover: hover) and (pointer: fine) and (min-width: 960px) and (min-height: 540px)")
  const portrait = useMedia("(orientation: portrait)")
  const [pastRotate, setPastRotate] = useState(false)
  const [params, setParams] = useSearchParams()
  // Seeded from « ?device=galaxy » (shareable), then kept in state: the layout
  // stays mounted while the screens change, so links needn't carry the param.
  const [chosen, setChosen] = useState<GamePlatform>(() => (params.get("device") === "galaxy" ? "android" : "ios"))
  const scale = useFitScale(chosen)
  const realPlatform: GamePlatform = /android/i.test(navigator.userAgent) ? "android" : "ios"

  if (framed) {
    const { spec } = LANDSCAPE[chosen]
    return (
      <PlatformCtx.Provider value={chosen}>
        <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-v2-chapter px-6 py-8">
          <div role="radiogroup" aria-label="الجهاز" className="flex rounded-2xl border-2 border-white/15 bg-white/10 p-1">
            {(["ios", "android"] as const).map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={chosen === p}
                data-uisfx="select"
                onClick={() => {
                  setChosen(p)
                  const next = new URLSearchParams(params)
                  if (p === "android") next.set("device", "galaxy")
                  else next.delete("device")
                  setParams(next, { replace: true })
                }}
                className={cn(
                  "min-h-10 rounded-xl px-4 text-[calc(8.5px*var(--ts))] font-bold transition",
                  chosen === p ? "bg-v2-cta text-v2-on-cta shadow-[0_3px_0_var(--v2-edge-cta,#5bcd3f)]" : "text-white/75 hover:text-white",
                )}
              >
                {LANDSCAPE[p].label}
              </button>
            ))}
          </div>
          <LandscapePhone platform={chosen} scale={scale}>
            <Outlet />
          </LandscapePhone>
          <p className="text-center text-[calc(8px*var(--ts))] text-white/70">
            {spec.name} · <bdi dir="ltr">{spec.screen.h} × {spec.screen.w}</bdi> {chosen === "ios" ? "pt" : "dp"} · بالعرض — على تلفون حقيقي: افتح الرابط ودوّر التلفون ·{" "}
            <Link to="/webgame" className="font-bold text-white underline decoration-v2-cta decoration-2 underline-offset-4">
              النسخة متاع الويب
            </Link>
          </p>
        </div>
      </PlatformCtx.Provider>
    )
  }

  return (
    <PlatformCtx.Provider value={realPlatform}>
    <div className="relative h-dvh w-full overflow-hidden bg-v2-canvas-base" style={{ ...DEVICE_INSETS, "--ts": TS[realPlatform] } as CSSProperties}>
      <Outlet />
      {portrait && !pastRotate && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-v2-chapter p-8 text-center text-white">
          <div className="max-w-xs">
            <span className="mx-auto grid size-20 place-items-center rounded-3xl border-2 border-white/25 bg-white/10">
              <Smartphone className="size-9 rotate-90" strokeWidth={1.8} />
            </span>
            <h1 className="mt-5 text-[calc(14px*var(--ts))] font-extrabold">دوّر تلفونك</h1>
            <p className="mt-2 text-[calc(9px*var(--ts))] leading-relaxed text-white/75">مدينة وائل مصنوعة بالعرض، باش المدينة والأزرار يجيو تحت صوابعك.</p>
            <button type="button" data-uisfx="forward" onClick={() => setPastRotate(true)} className={cn(gCta, "mt-6 h-12 px-6 text-[calc(9.5px*var(--ts))]")}>
              <RotateCcw className="size-4" strokeWidth={2.2} /> كمّل هكّا
            </button>
          </div>
        </div>
      )}
    </div>
    </PlatformCtx.Provider>
  )
}

/**
 * A full-bleed screen: the background runs under the notch and the home bar,
 * the content keeps clear of them.
 */
export function MobileScreen({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <div
        className="relative h-full"
        style={{
          paddingTop: "var(--gs-top)",
          paddingLeft: "var(--gs-left)",
          paddingRight: "var(--gs-right)",
          paddingBottom: "var(--gs-bottom)",
        }}
      >
        {children}
      </div>
    </div>
  )
}
