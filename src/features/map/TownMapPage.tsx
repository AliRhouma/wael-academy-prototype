import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { CheckCircle2, ChevronLeft, Hand, LocateFixed, Minus, Navigation2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/lib/hooks"
import { mountSound, sfx } from "@/features/student-v2/sound"
import { gBtn, gCta } from "@/features/game/shared/ui"
import { BuildingPanel, KIND_UI, type UpgradeState } from "./BuildingPanel"
import { BuildingVisual, topHeight } from "./BuildingArt"
import { diamond, iso } from "./iso"
import { C } from "./palette"
import { BUILDINGS, SCHOOL_ID, type Building } from "./townLayout"
import { TownMap, WORLDS, buildingAnchor } from "./TownMap"
import { SPACES, SpaceLayer } from "./Space"
import type { TownShape } from "./townLayout"
import { useCamera } from "./useCamera"
import "./map.css"

/**
 * `/map` — « مدينتي », the student's isometric town (game version).
 *
 * Full-screen, drawn entirely in code (SVG). Pan / zoom with the camera hook,
 * tap a building to open its card; « Améliorer » bumps its level in page state
 * (the school caps everyone else — a display rule, no real engine), « Entrer »
 * goes to the building's placeholder (`/map?entrer=<id>`, an overlay over the
 * town so the camera is where you left it).
 *
 * The town floats in a finite field of stars (`Space.tsx`): you can drift away
 * from it, up to the edge of space, and a « Retour à ma ville » button — its
 * arrow pointing at the town — brings you home.
 *
 * Two shapes of the same town (`shape`): the square island at `/map`, the
 * small round planet at `/map/planete`.
 */
export default function TownMapPage({ shape = "island" }: { shape?: TownShape }) {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const location = useLocation()
  const [params, setParams] = useSearchParams()

  useEffect(() => mountSound(), [])
  useEffect(() => {
    const before = document.title
    document.title = "Ma ville — Wael Academy"
    return () => {
      document.title = before
    }
  }, [])

  /* ---- data: levels live in page state; one object per building, rebuilt only when ITS level moves */
  const [levels, setLevels] = useState<Record<string, number>>(() => Object.fromEntries(BUILDINGS.map((b) => [b.id, b.level])))
  const cache = useRef(new Map<string, Building>())
  const buildings = useMemo(
    () =>
      BUILDINGS.map((b) => {
        const prev = cache.current.get(b.id)
        if (prev && prev.level === levels[b.id]) return prev
        const next = { ...b, level: levels[b.id] }
        cache.current.set(b.id, next)
        return next
      }),
    [levels],
  )
  const byId = useMemo(() => new Map(buildings.map((b) => [b.id, b])), [buildings])
  const schoolLevel = levels[SCHOOL_ID]
  const townLevel = buildings.reduce((sum, b) => sum + b.level, 0)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [touched, setTouched] = useState(false)
  /** null while the town is on screen; the direction to it while you are out in space */
  const [away, setAway] = useState<number | null>(null)
  const selected = selectedId ? byId.get(selectedId) ?? null : null

  /* ---- toast (top, so it never sits on the sheet) */
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2400)
    return () => clearTimeout(t)
  }, [toast])
  const say = (text: string) => setToast({ id: Date.now(), text })

  /* ---- camera */
  const idFrom = (t: EventTarget | null) => (t instanceof Element ? t.closest("[data-bid]")?.getAttribute("data-bid") ?? null : null)
  const selectRef = useRef<(id: string | null) => void>(() => {})
  const camera = useCamera({
    bounds: WORLDS[shape],
    space: SPACES[shape],
    minFit: 0.5,
    maxScale: 2.6,
    initial: (vw, vh, minS) => {
      // phones: a close, readable slice around the school and the plaza
      if (vw < 768) {
        const c = iso(12, 11.4)
        return { cx: c.x - 70, cy: c.y - 60, s: Math.max(minS, vw / 490) }
      }
      if (shape === "planet") {
        // desktop: the whole little planet, underside included
        const c = iso(12, 12)
        return { cx: c.x, cy: c.y + 70, s: Math.max(minS, Math.min(vw / 1250, vh / 980)) }
      }
      // desktop: most of the island
      const c = iso(12, 11.4)
      return { cx: c.x, cy: c.y - 20, s: Math.max(minS, Math.min(vw / 1250, vh / 760)) }
    },
    onTap: (t) => selectRef.current(idFrom(t)),
    onHover: (t) => {
      const id = idFrom(t)
      setHoveredId((prev) => (prev === id ? prev : id))
    },
    onView: ({ townVisible, angle }) => {
      setAway(townVisible ? null : angle)
      if (!townVisible) setTouched(true) // they found the drag — the hint can go
    },
  })

  const select = useCallback(
    (id: string | null) => {
      if (!id) {
        if (selectedId) sfx("deselect")
        setSelectedId(null)
        return
      }
      const b = byId.get(id)
      if (!b) return
      sfx("select")
      setSelectedId(id)
      setTouched(true)
      // keep the building in the part of the screen the card does not cover
      const { w, h } = camera.getSize()
      const a = buildingAnchor(b)
      const region = w < 768 ? { x: 0, y: 64, w, h: h * 0.5 - 64 } : { x: 0, y: 64, w: w - 400, h: h - 64 }
      camera.focus(a.x, a.y, region, w < 768 ? 0.8 : 0)
    },
    [byId, camera, selectedId],
  )
  selectRef.current = select
  const onKeySelect = useCallback((id: string) => selectRef.current(id), [])

  useEffect(() => {
    if (!selectedId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") select(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [selectedId, select])

  /* ---- upgrade: display rules only (max level, the school's cap, the arena's gate) */
  const upgradeOf = (b: Building): UpgradeState => {
    const school = byId.get(SCHOOL_ID)!
    if (b.level >= b.maxLevel) return { kind: "max", label: "Niveau max" }
    if (b.unlockAt && b.level === 0 && schoolLevel < b.unlockAt)
      return { kind: "gate", label: "Construire", reason: `Le chantier démarre quand ${school.name.fr} atteint le niveau ${b.unlockAt}.` }
    if (b.id !== SCHOOL_ID && b.level + 1 > schoolLevel)
      return { kind: "cap", label: "Améliorer", reason: `Améliore d'abord ${school.name.fr} : son niveau (${schoolLevel}) plafonne la ville.` }
    return { kind: "ok", label: b.level === 0 ? "Construire" : `Améliorer · niv. ${b.level + 1}` }
  }

  const upgrade = (b: Building): boolean => {
    const st = upgradeOf(b)
    if (st.kind !== "ok") {
      sfx("blocked")
      if (st.kind !== "max") say(st.reason)
      return false
    }
    setLevels((l) => ({ ...l, [b.id]: l[b.id] + 1 }))
    sfx("level-up")
    say(b.level === 0 ? `${b.name.fr} est construit !` : `${b.name.fr} passe au niveau ${b.level + 1}`)
    return true
  }

  const entering = params.get("entrer")
  const enterB = entering ? byId.get(entering) ?? null : null
  const leave = () => {
    if (location.key !== "default") navigate(-1)
    else setParams({}, { replace: true })
  }

  return (
    <div lang="fr" dir="ltr" className="map-space-bg relative h-dvh w-full overflow-hidden" >
      {/* the map */}
      <div ref={camera.viewportRef} className="map-viewport absolute inset-0" tabIndex={0} aria-label="Ville — glisser pour explorer, molette ou pincer pour zoomer">
        <div ref={camera.worldRef} className="map-world">
          <SpaceLayer shape={shape} />
          <TownMap shape={shape} buildings={buildings} selectedId={selectedId} hoveredId={isMobile ? null : hoveredId} onKeySelect={onKeySelect} />
        </div>
      </div>

      {/* top bar */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start gap-2 px-3 pt-[max(0.75rem,var(--sai-top))] md:gap-3 md:px-5 md:pt-5">
        <Link to="/webgame" data-uisfx="back" aria-label="Retour au jeu" className={cn(gBtn, "pointer-events-auto size-12 shrink-0 rounded-full p-0")}>
          <ChevronLeft className="size-6" />
        </Link>
        <div className="pointer-events-auto flex min-w-0 items-center gap-3 rounded-full border-2 border-v2-ink/10 bg-v2-surface/95 py-1.5 pe-2 ps-4 backdrop-blur">
          <div className="min-w-0 leading-tight">
            <h1 className="truncate font-display text-[calc(12px*var(--ts))] font-bold text-v2-ink">
              Ma ville{" "}
              <span dir="rtl" lang="ar" className="font-sans text-[calc(9px*var(--ts))] font-bold text-v2-ink-2">
                · مدينتي
              </span>
            </h1>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-v2-cta px-3 py-1.5 text-[calc(8px*var(--ts))] font-extrabold text-v2-on-cta shadow-[inset_0_-2px_0_var(--v2-edge-cta,#5bcd3f)]" title="Somme des niveaux des bâtiments">
            Niv. ville <span className="tabular-nums">{townLevel}</span>
          </span>
        </div>
      </header>

      {/* zoom controls — top end on phones (the sheet owns the bottom), bottom end on desktop */}
      <div className="absolute end-3 top-[calc(max(0.75rem,var(--sai-top))+4rem)] z-20 flex flex-col gap-2.5 md:bottom-6 md:end-6 md:top-auto">
        <button type="button" onClick={camera.zoomIn} data-uisfx="press" aria-label="Zoomer" className={cn(gBtn, "size-12 rounded-2xl p-0")}>
          <Plus className="size-5" strokeWidth={2.75} />
        </button>
        <button type="button" onClick={camera.zoomOut} data-uisfx="press" aria-label="Dézoomer" className={cn(gBtn, "size-12 rounded-2xl p-0")}>
          <Minus className="size-5" strokeWidth={2.75} />
        </button>
        <button type="button" onClick={camera.recenter} data-uisfx="snap" aria-label="Recentrer la ville" title="Recentrer" className={cn(gBtn, "size-12 rounded-2xl p-0")}>
          <LocateFixed className="size-5" />
        </button>
      </div>

      {/* first-visit hint */}
      {!touched && !selected && away === null && (
        <p className="pointer-events-none absolute inset-x-0 bottom-[max(1.25rem,calc(var(--sai-bottom)+0.75rem))] z-10 flex justify-center px-4">
          <span className="flex items-center gap-2 rounded-full border-2 border-v2-ink/10 bg-v2-surface/95 px-4 py-2.5 text-[calc(8.5px*var(--ts))] font-semibold text-v2-ink shadow-[0_6px_20px_rgb(21_58_45/0.12)] motion-safe:animate-[game-float_3s_ease-in-out_infinite]">
            <Hand className="size-4 text-v2-brand" />
            <span className="md:hidden">Touche un bâtiment · glisse pour explorer</span>
            <span className="hidden md:inline">Clique sur un bâtiment · glisse pour explorer · molette pour zoomer</span>
          </span>
        </p>
      )}

      {/* out in space: the way home, its arrow pointing at the town */}
      {away !== null && (
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 z-30 flex justify-center px-4",
            selected && isMobile ? "top-[calc(max(0.75rem,var(--sai-top))+4rem)]" : "bottom-[max(1.25rem,calc(var(--sai-bottom)+0.75rem))]",
          )}
        >
          <button
            type="button"
            onClick={camera.recenter}
            data-uisfx="snap"
            className={cn(gCta, "pointer-events-auto h-12 gap-2.5 px-5 text-[calc(9.5px*var(--ts))] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-200")}
          >
            <Navigation2 className="size-5 shrink-0 transition-transform duration-300" style={{ transform: `rotate(${away + Math.PI / 2}rad)` }} fill="currentColor" aria-hidden />
            Retour à ma ville
            <span dir="rtl" lang="ar" className="font-sans opacity-75">
              · مدينتي
            </span>
          </button>
        </div>
      )}

      {selected && (
        <BuildingPanel
          key={selected.id}
          b={selected}
          upgrade={upgradeOf(selected)}
          onUpgrade={() => upgrade(selected)}
          onEnter={() => setParams({ entrer: selected.id })}
          onClose={() => select(null)}
        />
      )}

      {toast && (
        <div key={toast.id} role="status" className="pointer-events-none absolute inset-x-0 top-[calc(max(0.75rem,var(--sai-top))+4rem)] z-[70] flex justify-center px-16 md:top-6">
          <div className="flex max-w-md items-center gap-2.5 rounded-full border-2 border-v2-ink/10 bg-v2-surface px-4 py-2.5 text-[calc(8.5px*var(--ts))] font-semibold text-v2-ink shadow-[0_8px_24px_rgb(21_58_45/0.16)] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-3 motion-safe:duration-200">
            <CheckCircle2 className="size-5 shrink-0 text-[var(--v2-edge-cta,#5bcd3f)]" />
            {toast.text}
          </div>
        </div>
      )}

      {enterB && <Interior b={enterB} onBack={leave} />}
    </div>
  )
}

/** « Entrer » — the inside of a building is the next step; a warm placeholder until then. */
function Interior({ b, onBack }: { b: Building; onBack: () => void }) {
  const ui = KIND_UI[b.kind]
  const l = iso(b.x, b.y + b.h)
  const r = iso(b.x + b.w, b.y)
  const bottom = iso(b.x + b.w, b.y + b.h)
  const top = iso(b.x + b.w / 2, b.y + b.h / 2, topHeight(b))
  const pad = 26
  const vb = `${l.x - pad} ${top.y - pad} ${r.x - l.x + pad * 2} ${bottom.y - top.y + pad * 2}`
  return (
    <div className="fixed inset-0 z-[65] overflow-y-auto bg-v2-mint-grid motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200">
      <div className="mx-auto flex min-h-full max-w-lg flex-col items-center justify-center px-5 pb-[max(2rem,var(--sai-bottom))] pt-[max(2rem,var(--sai-top))] text-center">
        <div className="w-full rounded-[28px] border-2 border-v2-ink/10 bg-v2-surface p-6 shadow-[0_12px_32px_rgb(21_58_45/0.12)]">
          <svg viewBox={vb} className="mx-auto h-44 w-auto max-w-full" aria-hidden style={{ direction: "ltr" }}>
            <polygon points={diamond(b.x - 0.3, b.y - 0.3, b.w + 0.6, b.h + 0.6)} fill={C.grass} />
            <BuildingVisual b={b} />
          </svg>
          <p className="mt-4 text-[calc(7.5px*var(--ts))] font-bold uppercase tracking-[.1em] text-v2-brand-text">{ui.kicker} · niveau {b.level}</p>
          <h1 className="mt-1 font-display text-[calc(18px*var(--ts))] font-bold text-v2-ink">
            <bdi dir="rtl" lang="ar">{b.name.ar}</bdi>
          </h1>
          <p className="text-[calc(9px*var(--ts))] font-semibold text-v2-ink-2">{b.name.fr}</p>
          <p className="mx-auto mt-4 max-w-sm text-[calc(9px*var(--ts))] leading-relaxed text-v2-ink-2">
            L'intérieur arrive bientôt : on y retrouvera {b.subjects.length ? "les contenus de ces matières" : "ton camarade et sa progression"}.
          </p>
          {b.subjects.length > 0 && (
            <ul className="mt-3 flex flex-wrap justify-center gap-1.5">
              {b.subjects.map((s) => (
                <li key={s} className="rounded-full border-2 border-v2-ink/10 px-2.5 py-1 text-[calc(8px*var(--ts))] font-bold text-v2-ink">
                  {s}
                </li>
              ))}
            </ul>
          )}
          <button type="button" onClick={onBack} data-uisfx="back" className={cn(gCta, "mt-6 h-12 w-full px-6 text-[calc(9.5px*var(--ts))]")}>
            <ChevronLeft className="size-5" /> Retour à la ville
          </button>
        </div>
      </div>
    </div>
  )
}
