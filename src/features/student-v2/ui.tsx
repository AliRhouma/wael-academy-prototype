import type { ComponentType, ReactNode } from "react"
import { Link, type LinkProps } from "react-router-dom"
import { cn } from "@/lib/utils"

/**
 * The new space's building blocks, measured off the Figma frame:
 *   panel   white, 24px corners, 1px ink @ 15 %, no shadow — the frame is flat
 *   inner   16px corners, ink @ 20 %
 *   button  pill, lime fill, navy text, ~46px tall
 *   chip    52px circle behind a panel's white glyph
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
        "flex min-w-0 flex-col rounded-3xl border border-v2-ink/15 bg-v2-surface p-4 sm:p-5 md:p-6",
        className,
      )}
    >
      <header className="mb-4 flex min-h-11 items-center gap-3 md:mb-5">
        {icon && <IconChip icon={icon} className={chip} />}
        <div className="min-w-0">
          <h2 className="line-clamp-2 text-[calc(13px*var(--ts))] font-bold leading-tight text-v2-ink md:text-[calc(14.5px*var(--ts))]">
            {title}
          </h2>
          {meta && <p className="text-[calc(8px*var(--ts))] text-v2-ink/55">{meta}</p>}
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
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-v2-cta px-5 text-[calc(9.5px*var(--ts))] font-semibold text-v2-on-cta transition hover:shadow-lg hover:shadow-v2-cta/40 hover:brightness-[.97] active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v2-brand disabled:pointer-events-none disabled:opacity-50"

/** The red outline — « شوف التسجيل ». */
export const liveOutlineClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-v2-live bg-v2-live/15 px-5 text-[calc(9.5px*var(--ts))] font-semibold text-v2-live-strong transition hover:bg-v2-live/25 active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v2-live"

/** A quiet round icon button (bell, gear, arrows). */
export const iconBtnClass =
  "relative grid size-11 shrink-0 place-items-center rounded-full text-v2-ink transition 2xl:size-12 [&>svg]:2xl:size-7 hover:bg-v2-ink/[0.06] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v2-brand"

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
      {/* A hand-set arrow so the stroke can take the ramp like the frame's. */}
      <svg viewBox="0 0 24 24" className="size-6 transition group-hover:-translate-x-1" fill="none" aria-hidden>
        <path d="M20 12H4m0 0 6-6m-6 6 6 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="url(#v2-grad)" />
      </svg>
    </Link>
  )
}

/** The dashed empty box used inside a panel when it has nothing to say. */
export function PanelEmpty({
  icon: Glyph,
  title,
  body,
  action,
  className,
}: {
  icon: Icon
  title: string
  body?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-v2-brand/40 bg-v2-brand/[0.06] px-5 py-8 text-center",
        className,
      )}
    >
      <span className="grid size-14 place-items-center rounded-full bg-v2-surface/80">
        <Glyph className="size-7 stroke-v2-grad" strokeWidth={1.6} />
      </span>
      <p className="mt-1 text-[calc(10.5px*var(--ts))] font-bold text-v2-ink">{title}</p>
      {body && <p className="max-w-xs text-[calc(8.5px*var(--ts))] leading-relaxed text-v2-ink/60">{body}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
