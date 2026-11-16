import { useEffect, useState, type CSSProperties, type ComponentType, type ReactNode } from "react"
import { Link, type LinkProps } from "react-router-dom"
import { SubjectIcon } from "@/components/icons/subjects"
import { cn } from "@/lib/utils"

/**
 * The new space's building blocks, measured off the Figma frame:
 *   panel   white, 24px corners, 1px ink @ 15 %, no shadow — the frame is flat
 *   inner   16px corners, ink @ 20 %
 *   button  pill, lime fill, navy text, ~46px tall
 *   chip    52px circle behind a panel's white glyph
 *
 * Every block also carries a SKIN HOOK (`v2-cta`, `v2-panel`, `v2-tile`…):
 * a class that does nothing here and everything in `styles/skins/play.css`,
 * where the gamified skin gives it a lip, a bolder border, a press. The same
 * tree renders under both skins; only the CSS reads differently.
 */

/**
 * The brand ramp as a paint server, mounted ONCE by the shell so any icon can
 * be stroked with it (`stroke-v2-grad`). `userSpaceOnUse` in Lucide's 24×24
 * box, not `objectBoundingBox`: a straight line has a zero-width box and an
 * object-bbox gradient paints it as NOTHING — half of every icon would vanish.
 */
export function V2GradientDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" className="absolute">
      <defs>
        <linearGradient id="v2-grad" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
          {/* The --v2-brand → --v2-cta pair from v2.css, read through var() so
              the ramp follows the theme. Bottom-start teal, top-end lime — the
              direction every icon gradient in the Figma file runs. */}
          <stop offset="0" style={{ stopColor: "var(--v2-brand)" }} />
          <stop offset="1" style={{ stopColor: "var(--v2-cta)" }} />
        </linearGradient>
      </defs>
    </svg>
  )
}

type Icon = ComponentType<{ className?: string; strokeWidth?: number }>

/** A panel's round glyph chip — sky for live, violet for documents. */
export function IconChip({ icon: Glyph, className }: { icon: Icon; className?: string }) {
  return (
    <span className={cn("grid size-11 shrink-0 place-items-center rounded-full text-white md:size-12", className)}>
      <Glyph className="size-5 md:size-6" strokeWidth={1.75} />
    </span>
  )
}

export function Panel({
  icon,
  chip,
  title,
  meta,
  action,
  children,
  className,
}: {
  icon?: Icon
  chip?: string
  title: ReactNode
  meta?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn(
        "v2-panel flex min-w-0 flex-col rounded-3xl border border-v2-ink/15 bg-v2-surface p-4 sm:p-5 md:p-6",
        className,
      )}
    >
      <header className="mb-4 flex min-h-11 items-center gap-3 md:mb-5">
        {icon && <IconChip icon={icon} className={chip} />}
        <div className="min-w-0">
          <h2 className="line-clamp-2 text-[calc(13px*var(--ts))] font-bold leading-tight text-v2-ink md:text-[calc(14.5px*var(--ts))]">
            {title}
          </h2>
          {meta && <p className="text-[calc(8px*var(--ts))] text-v2-ink-2">{meta}</p>}
        </div>
        {action && <div className="ms-auto shrink-0">{action}</div>}
      </header>
      {children}
    </section>
  )
}

/**
 * A one-line FRENCH string (a séance title, a kicker) inside the Arabic page.
 * Left in the RTL flow, a Latin run that overflows is clipped at its START —
 * « …e la vie et de la terre ». Laid out LTR it clips at its end instead, and
 * `text-right` keeps it hugging the same edge as the Arabic around it (this
 * space is RTL-only, so the physical side is the reading start).
 */
export function LatinLine({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p dir="ltr" className={cn("truncate text-right", className)}>
      {children}
    </p>
  )
}

/** The lime pill. Navy text on lime is the frame's one call-to-action style. */
export const ctaClass =
  "v2-cta inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-v2-cta px-5 text-[calc(9.5px*var(--ts))] font-semibold text-v2-on-cta transition hover:shadow-lg hover:shadow-v2-cta/40 hover:brightness-[.97] active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v2-brand disabled:pointer-events-none disabled:opacity-50"

/**
 * The same pill once its job is done — « تحمّل » on a file already taken:
 * outlined, transparent. Pair it with `ctaClass`; the play skin reads the
 * `v2-cta-ghost` hook and drops the lip to a quiet secondary.
 */
export const ctaGhostClass = "v2-cta-ghost border border-v2-ink/20 bg-transparent hover:shadow-none"

/** The red outline — « شوف التسجيل ». */
export const liveOutlineClass =
  "v2-cta-live inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-v2-live bg-v2-live/15 px-5 text-[calc(9.5px*var(--ts))] font-semibold text-v2-live-strong transition hover:bg-v2-live/25 active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v2-live"

/** A secondary pill — outlined, ink text (« رجوع للرئيسية », « تفاصيل الدفع »). */
export const btnClass =
  "v2-btn inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-v2-ink/20 bg-v2-surface px-5 text-[calc(9.5px*var(--ts))] font-semibold text-v2-ink transition hover:border-v2-brand/50 hover:text-v2-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v2-brand disabled:pointer-events-none disabled:opacity-50"

/** A quiet round icon button (bell, gear, arrows). Flat in both skins. */
export const iconBtnClass =
  "relative grid size-11 shrink-0 place-items-center rounded-full text-v2-ink transition 2xl:size-12 [&>svg]:2xl:size-7 hover:bg-v2-ink/[0.06] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v2-brand"

/**
 * A tappable card. Add it to the element that takes the tap (the Link, the
 * button) — under the play skin it gets the 2 px border, the 3 px lip and
 * the press. `data-taken` / `data-locked` on the same element tell the skin
 * which state the tile is in.
 */
export const tileClass = "v2-tile"

export function CtaLink({ className, ...props }: LinkProps) {
  return <Link {...props} className={cn(ctaClass, className)} />
}

/** « الكل ← » — the frame's section link, teal arrow, ink label. */
export function SeeAll({ to, label = "الكل" }: { to: string; label?: string }) {
  return (
    <Link
      to={to}
      data-uisfx="forward"
      className="group inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-2 text-[calc(11px*var(--ts))] font-medium text-v2-ink transition hover:text-v2-brand"
    >
      {label}
      {/* Solid text-safe teal, not the ramp the frame drew: the ramp's lime
          end is 1.3 : 1 on white, and this arrow is the link's only cue. */}
      <svg viewBox="0 0 24 24" className="size-6 text-v2-brand-text transition group-hover:-translate-x-1" fill="none" aria-hidden>
        <path d="M20 12H4m0 0 6-6m-6 6 6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor" />
      </svg>
    </Link>
  )
}

/**
 * The dashed empty box used inside a panel when it has nothing to say.
 *
 * `character` names a matière when one is honestly in context (a subject's
 * recordings, a chapitre with no files, the matière of the next séance): the
 * play skin then shows Wael dressed for it in place of the glyph, looking at
 * the empty space. There is no neutral Wael drawing yet, so an empty state
 * with no matière keeps its glyph in both skins rather than borrowing one.
 */
export function PanelEmpty({
  icon: Glyph,
  title,
  body,
  action,
  character,
  className,
}: {
  icon: Icon
  title: string
  body?: string
  action?: ReactNode
  character?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "v2-empty flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-v2-brand/40 bg-v2-brand/[0.06] px-5 py-8 text-center",
        className,
      )}
    >
      <span className={cn("grid size-14 place-items-center rounded-full bg-v2-surface/80", character && "v2-soft")}>
        <Glyph className="size-7 stroke-v2-grad" strokeWidth={1.6} />
      </span>
      {character && (
        <span className="v2-play group relative size-28 md:size-32" aria-hidden>
          <SubjectIcon name={character} className="size-full" />
        </span>
      )}
      <p className="mt-1 text-[calc(10.5px*var(--ts))] font-bold text-v2-ink">{title}</p>
      {body && <p className="max-w-xs text-[calc(8.5px*var(--ts))] leading-relaxed text-v2-ink-2">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Game-feel primitives — built in-house, no library. Each one renders the
 * same under both skins; `play.css` is where they come alive.
 * ------------------------------------------------------------------ */

/**
 * A progress ring. `fraction` 0…1 is how much is LEFT (the countdown
 * depletes); the arc runs clockwise from twelve in both reading directions —
 * rotation is not a reading-direction cue. Digits go in `children`.
 */
export function Ring({
  fraction,
  size = 116,
  stroke = 10,
  className,
  children,
}: {
  fraction: number
  size?: number
  stroke?: number
  className?: string
  children?: ReactNode
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const f = Math.min(1, Math.max(0, fraction))
  return (
    <span className={cn("v2-ring", className)} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <circle className="v2-ring-track" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle
          className="v2-ring-fill"
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - f)}
        />
      </svg>
      <span className="relative">{children}</span>
    </span>
  )
}

/**
 * A number that changes — « 2 » of « 2/5 », the seconds of a countdown. The
 * node is re-keyed on every change so the play skin's roll replays; the first
 * value never animates (nothing moves on mount). Western digits, pinned LTR.
 */
export function Num({ value, className }: { value: number | string; className?: string }) {
  // Adjusting state during render — React's own pattern for "derive a
  // counter from a prop": the re-render happens before anything is painted.
  const [seen, setSeen] = useState({ value, tick: 0 })
  if (seen.value !== value) setSeen({ value, tick: seen.tick + 1 })
  return (
    <bdi key={seen.tick} dir="ltr" className={cn("v2-num tabular-nums", seen.tick > 0 && "v2-num-tick", className)}>
      {value}
    </bdi>
  )
}

/**
 * Sixteen particles, four palette colours, one burst from the centre of the
 * positioned parent. `at` is WHEN (a timestamp): a new value fires it, and it
 * clears itself 700 ms later so nothing lingers in the DOM. The soft skin
 * never shows it; reduced motion kills it in CSS.
 */
const PARTICLES = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2 + (i % 2 ? 0.2 : -0.1)
  const dist = 52 + (i % 4) * 11
  return {
    dx: `${(Math.cos(angle) * dist).toFixed(1)}px`,
    dy: `${(Math.sin(angle) * dist).toFixed(1)}px`,
    s: `${6 + (i % 3) * 2}px`,
    r: i % 3 === 0 ? "50%" : "2px",
    c: ["var(--v2-cta)", "var(--v2-brand)", "var(--v2-ink)", "#ffffff"][i % 4],
  }
})

export function Burst({ at, className }: { at: number; className?: string }) {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (!at) return
    setShown(at)
    const t = window.setTimeout(() => setShown(0), 700)
    return () => window.clearTimeout(t)
  }, [at])
  if (!shown) return null
  return (
    <span aria-hidden className={cn("v2-burst", className)}>
      {PARTICLES.map((p, i) => (
        <i
          key={i}
          style={{ "--dx": p.dx, "--dy": p.dy, "--s": p.s, "--r": p.r, "--c": p.c } as CSSProperties}
        />
      ))}
    </span>
  )
}

/**
 * The 320 ms shake a locked thing answers a tap with. Returns the class to
 * put on the element and the function to call from the tap (which also plays
 * nothing — the tap's own `data-uisfx="blocked"` does).
 */
export function useShake(): [string, () => void] {
  const [at, setAt] = useState(0)
  useEffect(() => {
    if (!at) return
    const t = window.setTimeout(() => setAt(0), 320)
    return () => window.clearTimeout(t)
  }, [at])
  return [at ? "v2-shake" : "", () => setAt(Date.now())]
}
