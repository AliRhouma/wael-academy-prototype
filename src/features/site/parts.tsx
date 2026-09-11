import { useState, type ReactNode } from "react"
import { ChevronLeft, ChevronRight, Play, Star } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { DEMO_VIDEO_URL, youtubeId } from "@/data/media"
import { useScrollEdges } from "@/lib/hooks"
import { cn } from "@/lib/utils"
import { STATS } from "./content"

/**
 * The public site's building blocks, measured off the two frames (1440 wide):
 *   container  1200px, 120px margins
 *   buttons    ~56px tall, 12px corners — lime (primary) or navy outline
 *   titles     section 48px bold navy, subtitle 20px muted
 *   badges     dashed lime circles, white, a soft green glow, tilted
 */

export const container = "mx-auto w-full max-w-[75rem] px-4 sm:px-6 lg:px-8"

export const btnLime =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-v2-cta px-7 text-[calc(10px*var(--ts))] font-bold text-v2-on-cta transition hover:shadow-lg hover:shadow-v2-cta/50 hover:brightness-[.97] active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v2-brand md:min-h-14 md:px-9"
export const btnOutline =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-v2-ink px-7 text-[calc(10px*var(--ts))] font-bold text-v2-ink transition hover:bg-v2-ink hover:text-white active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v2-brand md:min-h-14 md:px-9"

export function SectionTitle({
  title,
  sub,
  align = "center",
  className,
  children,
}: {
  title: ReactNode
  sub?: ReactNode
  align?: "center" | "start"
  className?: string
  /** Trailing controls (carousel arrows) — sit on the end side of a start-aligned title. */
  children?: ReactNode
}) {
  return (
    <div className={cn("flex flex-wrap items-end gap-4", align === "center" ? "justify-center text-center" : "justify-between", className)}>
      <div className={cn(align === "center" && "mx-auto")}>
        <h2 className="text-[calc(20px*var(--ts))] font-bold leading-tight text-v2-ink md:text-[calc(28px*var(--ts))] lg:text-[calc(32px*var(--ts))]">
          {title}
        </h2>
        {sub && <p className="mt-2 text-[calc(10px*var(--ts))] text-v2-ink/70 md:text-[calc(12px*var(--ts))]">{sub}</p>}
      </div>
      {children}
    </div>
  )
}

/** The frame's floating stat: a white disc in a dashed lime ring, tilted, glowing. */
export function FloatBadge({
  children,
  className,
  delay = 0,
  tilt = -8,
}: {
  children: ReactNode
  className?: string
  delay?: number
  tilt?: number
}) {
  return (
    <div
      aria-hidden
      className={cn("v2-float pointer-events-none absolute z-20", className)}
      style={{ ["--d" as string]: `${delay}s` }}
    >
      <div
        className="grid size-24 place-items-center rounded-full border-2 border-dashed border-v2-cta bg-white/95 text-center text-v2-ink shadow-[0_0_40px_-6px_rgb(138_255_107/0.55)] md:size-32 lg:size-36"
        style={{ rotate: `${tilt}deg` }}
      >
        <div className="leading-tight">{children}</div>
      </div>
    </div>
  )
}

export function Rating() {
  return (
    <>
      <span className="flex items-center justify-center gap-1 text-[calc(15px*var(--ts))] font-black md:text-[calc(20px*var(--ts))]">
        4.8 <Star className="size-4 fill-[#F4B400] text-[#F4B400] md:size-5" />
      </span>
      {/* #F4B400: the star's gold is the one non-palette ink in the frame. */}
      <span className="block text-[calc(7px*var(--ts))] text-v2-ink/70 md:text-[calc(9px*var(--ts))]">تقييم عالي</span>
    </>
  )
}

/** The frame's play button: a ramp disc in a translucent white halo. */
export function PlayOrb({ className, size = "md" }: { className?: string; size?: "md" | "lg" }) {
  return (
    <span
      className={cn(
        "grid place-items-center rounded-full bg-white/45 backdrop-blur-sm transition group-hover:scale-105",
        size === "lg" ? "size-24 md:size-28" : "size-20",
        className,
      )}
    >
      <span className={cn("grid place-items-center rounded-full bg-v2-grad text-white shadow-lg", size === "lg" ? "size-[4.5rem] md:size-20" : "size-16")}>
        <Play className={cn("translate-x-0.5 fill-current", size === "lg" ? "size-8" : "size-7")} />
      </span>
    </span>
  )
}

/**
 * Every play button on the site opens the same demo film in a dialog — the
 * frames' videos are placeholders, and a button that does nothing is worse
 * than one that plays the academy's own clip.
 */
export function useVideo() {
  const [open, setOpen] = useState(false)
  const id = youtubeId(DEMO_VIDEO_URL)
  const dialog = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[min(64rem,calc(100vw-2rem))] gap-0 overflow-hidden rounded-3xl border-0 bg-black p-0 sm:max-w-[min(64rem,calc(100vw-2rem))]">
        <DialogTitle className="sr-only">فيديو وائل أكاديمي</DialogTitle>
        {open && (
          <iframe
            className="aspect-video w-full"
            src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
            title="Wael Academy"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        )}
      </DialogContent>
    </Dialog>
  )
  return { play: () => setOpen(true), dialog }
}

/**
 * A horizontal rail with the frame's arrow pair: the live arrow is the big
 * outlined one, the dead one fades. Scroll-snap does the moving, so a phone
 * swipes it and a mouse clicks it; at a width where everything fits, both
 * arrows go quiet instead of pretending.
 */
export function useRail<T extends HTMLElement>() {
  const { ref, edges } = useScrollEdges<T>("x")
  // RTL: « next » runs toward the END — the physical LEFT — so it is live when
  // there is more to the left (`before`, the hook's edges being physical), and
  // it scrolls by a negative delta.
  const step = (dir: 1 | -1) => ref.current?.scrollBy({ left: -dir * ref.current.clientWidth * 0.8, behavior: "smooth" })
  return { ref, step, canPrev: edges.after, canNext: edges.before }
}

export function RailArrows({ onPrev, onNext, canPrev, canNext }: { onPrev: () => void; onNext: () => void; canPrev: boolean; canNext: boolean }) {
  const cls = (on: boolean, big: boolean) =>
    cn(
      "grid place-items-center rounded-full border transition",
      big ? "size-14" : "size-11",
      on ? "border-v2-ink text-v2-ink hover:bg-v2-ink hover:text-white" : "border-v2-ink/25 text-v2-ink/30",
    )
  return (
    <div className="flex items-center gap-3">
      <button type="button" onClick={onPrev} disabled={!canPrev} aria-label="اللّي قبل" className={cls(canPrev, false)}>
        <ChevronRight className="size-5" />
      </button>
      <button type="button" onClick={onNext} disabled={!canNext} aria-label="اللّي بعد" className={cls(canNext, true)}>
        <ChevronLeft className="size-6" />
      </button>
    </div>
  )
}

/** « أرقام تصنع الفارق.. وتثبت جدارتنا » — shared by the home and about pages. */
export function StatsSection() {
  return (
    <section className={cn(container, "py-16 md:py-24")}>
      <SectionTitle title="أرقام تصنع الفارق.. وتثبت جدارتنا" />
      <ul className="mt-10 grid grid-cols-2 gap-4 md:mt-14 md:gap-6 lg:grid-cols-4">
        {STATS.map(({ icon: Icon, value, label }, i) => (
          <li
            key={value}
            className="rise flex flex-col items-center rounded-2xl bg-white px-4 py-6 text-center shadow-[0_6px_24px_-8px_rgb(23_46_91/0.25)] transition hover:-translate-y-1 md:px-6 md:py-8"
            style={{ ["--i" as string]: i }}
          >
            <span className="grid size-16 place-items-center rounded-full bg-v2-grad text-white md:size-24">
              <Icon className="size-8 md:size-11" strokeWidth={1.6} />
            </span>
            <p className="mt-4 text-[calc(18px*var(--ts))] font-black text-v2-ink md:text-[calc(24px*var(--ts))]" dir="auto">
              {value}
            </p>
            <p className="mt-1 text-[calc(9px*var(--ts))] leading-relaxed text-v2-ink/80 md:text-[calc(12px*var(--ts))]">{label}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ---------- Brand marks lucide doesn't draw ---------- */

export function TikTok({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-2.59-2.59c.27 0 .53.04.78.12V9.77a5.7 5.7 0 1 0 4.9 5.63V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.28 4.28 0 0 1-3.24-1.48Z" />
    </svg>
  )
}
export function Facebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M13.5 21v-7.5h2.52l.38-2.93H13.5V8.7c0-.85.24-1.43 1.45-1.43h1.55V4.65A20.6 20.6 0 0 0 14.24 4.5c-2.24 0-3.77 1.37-3.77 3.88v2.19H7.94v2.93h2.53V21h3.03Z" />
    </svg>
  )
}
export function Instagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
