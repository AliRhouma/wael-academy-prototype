import { useEffect, useRef, useState, type ComponentType } from "react"
import { ArrowUp, BookOpen, Coffee, DoorOpen, FlaskConical, House, Lock, Music, School, Sigma, Sprout, Store, Swords, Trophy, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { gBtn, gCta } from "@/features/game/shared/ui"
import { C } from "./palette"
import type { Building, BuildingKind } from "./townLayout"

/**
 * The selected building's card. One component, two placements by breakpoint
 * (pure Tailwind): a bottom sheet on phones (grabber, safe-area padding), a
 * side card at the inline end on md+. It is NOT modal — the map stays
 * pannable behind it, and tapping another building just swaps the content.
 */
export type UpgradeState =
  | { kind: "ok"; label: string }
  | { kind: "max"; label: string }
  | { kind: "cap" | "gate"; label: string; reason: string }

export const KIND_UI: Record<BuildingKind, { icon: ComponentType<{ className?: string }>; color: string; kicker: string }> = {
  school: { icon: School, color: C.brand, kicker: "Bâtiment principal" },
  library: { icon: BookOpen, color: C.violetDeep, kicker: "Langues" },
  lab: { icon: FlaskConical, color: C.physics, kicker: "Sciences" },
  mathTower: { icon: Sigma, color: C.leaf, kicker: "Maths" },
  music: { icon: Music, color: C.violet, kicker: "Arts" },
  stadium: { icon: Trophy, color: C.brand, kicker: "Sport" },
  greenhouse: { icon: Sprout, color: C.leaf, kicker: "SVT" },
  cafe: { icon: Coffee, color: C.done, kicker: "Ensemble" },
  arena: { icon: Swords, color: C.done, kicker: "Défis" },
  house: { icon: House, color: C.ink, kicker: "Camarade" },
  shop: { icon: Store, color: C.live, kicker: "Boutique" },
}

export function BuildingPanel({
  b,
  upgrade,
  onUpgrade,
  onEnter,
  onClose,
}: {
  b: Building
  upgrade: UpgradeState
  onUpgrade: () => boolean
  onEnter: () => void
  onClose: () => void
}) {
  const ui = KIND_UI[b.kind]
  const Icon = ui.icon
  const [shake, setShake] = useState(false)
  const shakeTimer = useRef(0)
  useEffect(() => () => clearTimeout(shakeTimer.current), [])
  const pct = Math.round((b.level / b.maxLevel) * 100)

  const press = () => {
    if (onUpgrade()) return
    setShake(false)
    requestAnimationFrame(() => setShake(true))
    clearTimeout(shakeTimer.current)
    shakeTimer.current = window.setTimeout(() => setShake(false), 340)
  }

  return (
    <section
      aria-label={`${b.name.fr} — fiche`}
      onPointerDown={(e) => e.stopPropagation()}
      className={cn(
        "fixed inset-x-0 bottom-0 z-[60] max-h-[64dvh] overflow-y-auto rounded-t-[28px] border-t-2 border-v2-ink/10 bg-v2-surface px-4 pb-[max(1rem,var(--sai-bottom))] pt-2",
        "shadow-[0_-10px_30px_rgb(21_58_45/0.14)]",
        "md:absolute md:inset-x-auto md:bottom-auto md:end-5 md:top-5 md:w-[23rem] md:max-h-[calc(100%-2.5rem)] md:rounded-3xl md:border-2 md:p-5 md:shadow-[0_12px_32px_rgb(21_58_45/0.16)]",
        "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-6 motion-safe:duration-200",
      )}
    >
      <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-v2-ink/15 md:hidden" aria-hidden />

      <header className="flex items-start gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl text-white shadow-[0_3px_0_rgb(23_46_91/0.18)]" style={{ background: ui.color }}>
          <Icon className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[calc(7.5px*var(--ts))] font-bold uppercase tracking-[.1em] text-v2-brand-text">{ui.kicker}</p>
          <h2 className="truncate font-display text-[calc(14px*var(--ts))] font-bold leading-tight text-v2-ink">
            <bdi dir="rtl" lang="ar">{b.name.ar}</bdi>
          </h2>
          <p className="truncate text-[calc(8.5px*var(--ts))] font-semibold text-v2-ink-2">{b.name.fr}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          data-uisfx="close"
          aria-label="Fermer la fiche"
          className="-me-1 -mt-1 grid size-11 shrink-0 place-items-center rounded-full text-v2-ink-2 transition hover:bg-v2-ink/5 hover:text-v2-ink focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-v2-brand"
        >
          <X className="size-5" />
        </button>
      </header>

      {/* level */}
      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-[calc(9px*var(--ts))] font-extrabold text-v2-ink">
            {b.level === 0 ? "En chantier" : <>Niveau <span className="tabular-nums">{b.level}</span></>}
          </span>
          <span className="text-[calc(8px*var(--ts))] font-semibold tabular-nums text-v2-ink-2">
            {b.level} / {b.maxLevel}
          </span>
        </div>
        <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-v2-ink/10" role="progressbar" aria-valuemin={0} aria-valuemax={b.maxLevel} aria-valuenow={b.level} aria-label="Niveau">
          <div
            className="h-full rounded-full bg-v2-cta transition-[width] duration-500 ease-[cubic-bezier(.22,1,.36,1)]"
            style={{
              width: `${Math.max(pct, b.level ? 6 : 0)}%`,
              backgroundImage: "repeating-linear-gradient(135deg, rgb(255 255 255 / .35) 0 6px, transparent 6px 12px)",
              boxShadow: "inset 0 -3px 0 var(--v2-edge-cta, #5bcd3f)",
            }}
          />
        </div>
      </div>

      {/* subjects */}
      <div className="mt-4">
        <p className="text-[calc(7.5px*var(--ts))] font-bold uppercase tracking-[.08em] text-v2-ink-3">Matières</p>
        {b.subjects.length ? (
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {b.subjects.map((s) => (
              <li key={s} className="rounded-full border-2 border-v2-ink/10 bg-v2-surface px-2.5 py-1 text-[calc(8px*var(--ts))] font-bold text-v2-ink">
                {s}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-[calc(8.5px*var(--ts))] text-v2-ink-2">Pas de matière ici — c'est la maison d'un camarade.</p>
        )}
      </div>

      <p className="mt-3 text-[calc(8.5px*var(--ts))] leading-relaxed text-v2-ink-2">{b.blurb}</p>

      {upgrade.kind === "cap" || upgrade.kind === "gate" ? (
        <p className="mt-3 flex items-start gap-2 rounded-2xl border-2 border-dashed border-v2-ink/15 px-3 py-2 text-[calc(8px*var(--ts))] font-semibold text-v2-ink-2">
          <Lock className="mt-0.5 size-4 shrink-0" /> {upgrade.reason}
        </p>
      ) : null}

      <div className="mt-4 flex gap-2.5">
        <button
          type="button"
          onClick={press}
          disabled={upgrade.kind === "max"}
          aria-disabled={upgrade.kind === "cap" || upgrade.kind === "gate" ? true : undefined}
          className={cn(
            gCta,
            "h-12 flex-1 px-4 text-[calc(9.5px*var(--ts))]",
            (upgrade.kind === "cap" || upgrade.kind === "gate") && "bg-v2-ink/10 text-v2-ink-2 shadow-[0_4px_0_rgb(23_46_91/0.14)]",
            shake && "map-shake",
          )}
        >
          {upgrade.kind === "cap" || upgrade.kind === "gate" ? <Lock className="size-4" /> : <ArrowUp className="size-5" strokeWidth={2.75} />}
          {upgrade.label}
        </button>
        <button type="button" onClick={onEnter} data-uisfx="open" className={cn(gBtn, "h-12 px-4 text-[calc(9.5px*var(--ts))]")}>
          <DoorOpen className="size-5" /> Entrer
        </button>
      </div>
    </section>
  )
}
