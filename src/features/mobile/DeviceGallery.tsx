import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { ExternalLink, Layers, Moon, RotateCw, Sun } from "lucide-react"
import type { Skin } from "@/app/platform"
import { useTheme } from "@/app/providers"
import { cn } from "@/lib/utils"
import { DemoStatesProvider, StatesPanel } from "@/features/student-v2/demoStates"
import { mountSound } from "@/features/student-v2/sound"
import mark from "@/assets/v2/logo-mark.png"
import { DEVICES, deviceSrc, outerSize } from "./devices"
import { DeviceFrame } from "./DeviceFrame"

/**
 * The mobile gallery — what `mobile.<host>` opens on (and `/mobile` anywhere):
 * the élève space running live on an iPhone 13 Pro Max and a Galaxy A55, side
 * by side, each wearing its platform's conventions.
 *
 * One job: LOOK at the app on a phone. So the phones are the page; the chrome
 * is a single line — the mark, which screen to open, the theme, reload. The
 * phones navigate on their own once a screen is in them.
 *
 * Beside them, the space's states panel — open, not a floating button inside
 * each phone: one set of switches drives both phones at once (see
 * `StatesSync` in student-v2/demoStates). Below `lg` there is no room to keep
 * it open, so a header button slides it in as a drawer.
 *
 * Side by side from `md`; below that a snap scroller, one phone per swipe —
 * the gallery is itself read on phones, at the academy, over someone's
 * shoulder.
 */

const SCREENS = [
  { label: "الرئيسية", path: "/student-v2" },
  { label: "الدروس", path: "/student-v2/matieres" },
  { label: "الرزنامة", path: "/student-v2/calendrier" },
  { label: "تسجيلات", path: "/student-v2/seances" },
  { label: "العروض", path: "/student-v2/offres" },
  { label: "الدخول", path: "/connexion" },
]

/** Room kept for the caption under each phone, and around the stage. */
const CAPTION = 72
const GAP = 56
const PAD = 24

/**
 * The one scale that fits both phones in the stage — never above 1, so a px
 * in the app is a pt on the phone whenever the screen has the room.
 */
function fitScale(stage: { w: number; h: number }, sideBySide: boolean): number {
  const sizes = DEVICES.map(outerSize)
  const maxH = Math.max(...sizes.map((s) => s.h))
  const maxW = Math.max(...sizes.map((s) => s.w))
  const rowW = sizes.reduce((sum, s) => sum + s.w, 0) + GAP * (sizes.length - 1)
  const byH = (stage.h - CAPTION - 2 * PAD) / maxH
  const byW = (stage.w - 2 * PAD) / (sideBySide ? rowW : maxW)
  const s = Math.min(1, byH, byW)
  return Number.isFinite(s) && s > 0 ? s : 1
}

export default function DeviceGallery() {
  const { theme, toggle } = useTheme()
  const [path, setPath] = useState(SCREENS[0].path)
  // The look inside the phones: the gamified restyle, or the flat Figma look
  // it grew out of — side by side is how the difference gets decided.
  const [skin, setSkin] = useState<Skin>("play")
  const [reloadKey, setReloadKey] = useState(0)
  const stageRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [sideBySide, setSideBySide] = useState(true)
  const [statesOpen, setStatesOpen] = useState(false)

  // The panel's switches play their cues here, on the gallery's own page.
  useEffect(() => mountSound(), [])

  // The page is the two phones: the title says so, and the floating authoring
  // docks (palette, type) step aside — they re-point the OLD space anyway.
  useEffect(() => {
    const previous = document.title
    document.title = "أكاديمية وائل — على الهاتف"
    document.documentElement.setAttribute("data-gallery", "")
    return () => {
      document.title = previous
      document.documentElement.removeAttribute("data-gallery")
    }
  }, [])

  useLayoutEffect(() => {
    const el = stageRef.current
    if (!el) return
    const measure = () => {
      const r = el.getBoundingClientRect()
      // Never wider than the viewport: a stage stretched by an overflow would
      // ask for a scale the window cannot show.
      const w = Math.min(r.width, document.documentElement.clientWidth)
      const wide = w >= 768
      setSideBySide(wide)
      setScale(fitScale({ w, h: r.height }, wide))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const dark = theme === "dark"
  const reload = () => setReloadKey((k) => k + 1)
  const switchTheme = () => {
    toggle()
    reload()
  }

  const actions = (
    <div className="flex items-center gap-1">
      <div role="group" aria-label="المظهر" className="me-2 flex rounded-full border border-white/20 p-0.5">
        {(
          [
            { id: "play", label: "لعب" },
            { id: "soft", label: "هادي" },
          ] as { id: Skin; label: string }[]
        ).map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={skin === s.id}
            onClick={() => setSkin(s.id)}
            className={cn(
              "min-h-9 rounded-full px-3 text-[calc(9px*var(--ts))] font-semibold transition focus-visible:outline-2 focus-visible:outline-v2-cta",
              skin === s.id ? "bg-white/15 text-white" : "text-white/60 hover:text-white",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setStatesOpen(true)}
        aria-label="حالات الشاشة"
        title="حالات الشاشة"
        className="grid size-11 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white active:scale-95 focus-visible:outline-2 focus-visible:outline-v2-cta lg:hidden"
      >
        <Layers className="size-5" />
      </button>
      <button
        type="button"
        onClick={switchTheme}
        aria-label={dark ? "الوضع النهاري" : "الوضع الليلي"}
        title={dark ? "الوضع النهاري" : "الوضع الليلي"}
        className="grid size-11 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white active:scale-95 focus-visible:outline-2 focus-visible:outline-v2-cta"
      >
        {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
      </button>
      <button
        type="button"
        onClick={reload}
        aria-label="أعد تحميل الهاتفين"
        title="أعد تحميل الهاتفين"
        className="grid size-11 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white active:scale-95 focus-visible:outline-2 focus-visible:outline-v2-cta"
      >
        <RotateCw className="size-5" />
      </button>
    </div>
  )

  return (
    // `h-dvh`, not `min-h-`: the stage's height must come from the window,
    // never from the phones in it, or the fit-to-height would chase itself.
    <DemoStatesProvider sync="lead">
      <div className="flex h-dvh flex-col bg-v2-stage text-white">
        <header className="flex flex-col gap-2 px-4 pb-2 pt-[max(1rem,var(--sai-top))] sm:flex-row sm:items-center sm:gap-5 sm:px-6 lg:px-10">
          <div className="flex items-center gap-3">
            <span
              role="img"
              aria-label="Wael Academy"
              className="v2-mask block h-9 w-11 shrink-0 !bg-white"
              style={{ maskImage: `url(${mark})`, WebkitMaskImage: `url(${mark})` }}
            />
            <div className="min-w-0 leading-tight">
              <h1 className="text-[calc(14px*var(--ts))] font-bold">على الهاتف</h1>
              <p className="truncate text-[calc(9px*var(--ts))] text-white/60">iPhone 13 Pro Max · Galaxy A55 — نفس التطبيق، حيّ</p>
            </div>
            {/* Phone: the actions share the title row; the screens scroll below. */}
            <div className="ms-auto sm:hidden">{actions}</div>
          </div>

          <nav aria-label="الشاشة" className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-1 sm:justify-center sm:px-0">
            {SCREENS.map((s) => {
              const active = s.path === path
              return (
                <button
                  key={s.path}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setPath(s.path)}
                  className={cn(
                    "min-h-10 shrink-0 rounded-full px-4 text-[calc(10px*var(--ts))] font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v2-cta",
                    active ? "bg-v2-cta text-v2-on-cta" : "text-white/75 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {s.label}
                </button>
              )
            })}
          </nav>

          <div className="hidden sm:block">{actions}</div>
        </header>

        <div className="flex min-h-0 flex-1">
          <div ref={stageRef} className="flex min-w-0 flex-1">
            <div
              className={cn(
                "flex w-full items-start overflow-auto scroll-touch",
                sideBySide ? "justify-center" : "snap-x snap-mandatory",
              )}
              style={{ gap: GAP * scale, padding: PAD }}
            >
              {DEVICES.map((d) => (
                <figure key={d.id} className={cn("m-0 flex shrink-0 flex-col items-center", !sideBySide && "w-full snap-center")}>
                  <DeviceFrame device={d} path={path} skin={skin} scale={scale} dark={dark} reloadKey={reloadKey} />
                  <figcaption className="mt-4 flex items-center gap-3 text-[calc(10px*var(--ts))]">
                    <span className="font-bold">{d.name}</span>
                    <span className="rounded-full border border-white/20 px-2 py-0.5 text-[calc(8.5px*var(--ts))] text-white/70" dir="ltr">
                      {d.os} · {d.screen.w}×{d.screen.h}
                    </span>
                    <a
                      href={deviceSrc(d, path, skin)}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`افتح ${d.name} في نافذة`}
                      title="افتح في نافذة"
                      className="grid size-9 place-items-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
          <StatesPanel className="mb-6 me-6 hidden w-80 shrink-0 lg:flex" />
        </div>

        {statesOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50 lg:hidden" onClick={() => setStatesOpen(false)}>
            <div className="flex p-3" onClick={(e) => e.stopPropagation()}>
              <StatesPanel onClose={() => setStatesOpen(false)} className="w-[min(22rem,calc(100vw-1.5rem))] bg-v2-stage shadow-2xl" />
            </div>
          </div>
        )}
      </div>
    </DemoStatesProvider>
  )
}
