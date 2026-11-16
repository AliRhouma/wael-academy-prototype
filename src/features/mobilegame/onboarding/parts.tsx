import { useEffect, useState, type CSSProperties, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import character from "../../../../svg icons/Caracter.png"
import { MobileScreen, useGamePlatform } from "../MobileGameLayout"
import { usePlatformUi } from "../platformUi"

/**
 * The first-launch frame, shared by every step: a header (back · the one
 * progress bar · one quiet link), the step's content on the START side (under
 * the right thumb in RTL), Wael and his bubble on the END side.
 *
 * Landscape means ~350 px of height: nothing stacks that can sit side by side,
 * and the header stays one 48 px row. The per-platform numbers (back control,
 * CTA, radii, sheet) come from `platformUi.ts` and `usePlatformCorners()`.
 */

/** The flow's steps, for the one progress bar (welcome counts: endowed progress). */
export const STEPS = { welcome: 1, level: 2, subject: 3, q1: 4, q2: 5, q3: 6, result: 7 } as const
const TOTAL = 7

/** Corners per platform: iOS 22 / 14 (concentric), Android 28 / 16 (the M3 scale). */
export function usePlatformCorners() {
  const ios = useGamePlatform() === "ios"
  return { ios, panel: ios ? "rounded-[22px]" : "rounded-[28px]", card: ios ? "rounded-[14px]" : "rounded-2xl" }
}

export function FlowScreen({
  step,
  progress,
  back,
  backLabel = "رجوع",
  end,
  aside,
  children,
  overlay,
}: {
  step: number
  /** Overrides `step / TOTAL` (the sign-up runs its own three steps). */
  progress?: number
  back?: string
  backLabel?: string
  end?: ReactNode
  aside?: ReactNode
  children: ReactNode
  overlay?: ReactNode
}) {
  const ui = usePlatformUi()
  const ios = useGamePlatform() === "ios"
  return (
    <MobileScreen className="bg-v2-mint-grid">
      <div className="flex h-full flex-col">
        <header className="flex h-12 shrink-0 items-center gap-3 ps-1 pe-1">
          {back ? (
            <Link to={back} data-uisfx="back" aria-label={backLabel} className={ui.back}>
              <ChevronRight className="size-6" strokeWidth={ios ? 2.4 : 2} />
            </Link>
          ) : (
            <span className={cn(ui.target, "w-2")} aria-hidden />
          )}
          <FlowProgress value={progress ?? step / TOTAL} />
          <div className="flex shrink-0 items-center">{end}</div>
        </header>
        <div className={cn("grid min-h-0 flex-1 gap-3 pb-1", aside ? "grid-cols-[1fr_minmax(0,27%)]" : "grid-cols-1")}>
          <main className="flex min-h-0 min-w-0 flex-col">{children}</main>
          {aside}
        </div>
      </div>
      {overlay}
    </MobileScreen>
  )
}

/** The one progress bar — 12 px, lime, striped, fills from the start edge (right in RTL). */
export function FlowProgress({ value }: { value: number }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div
      role="progressbar"
      aria-label="التقدّم"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className="relative h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-v2-ink/10"
    >
      <span className="game-bar-fill absolute inset-y-0 start-0 rounded-full" style={{ width: `${pct}%` }} />
    </div>
  )
}

/**
 * Wael on the end side with what he says. The bubble pops when the line
 * changes (his "reaction"), with its text already in place — no typewriter.
 * `tone`: `yay` gives the bubble the lime edge (a right answer, a choice made).
 */
export function WaelAside({ say, tone = "calm", children }: { say: ReactNode; tone?: "calm" | "yay"; children?: ReactNode }) {
  const { panel } = usePlatformCorners()
  // The bubble re-keys on its line so the pop replays on every reaction.
  const [k, setK] = useState(0)
  const sayKey = typeof say === "string" ? say : ""
  useEffect(() => setK((n) => n + 1), [sayKey])
  return (
    <aside className={cn("relative min-h-0 overflow-hidden border-2 border-[#052a30] bg-v2-chapter", panel)}>
      {/* #052a30 = --v2-edge-deep, the chapter's own edge (as on the login's art panel) */}
      <div
        key={k}
        aria-live="polite"
        className="absolute inset-x-2.5 top-2.5 z-10 origin-bottom-left rounded-2xl rounded-es-sm border-2 border-v2-ink bg-v2-surface px-3 py-2 text-[calc(7.5px*var(--ts))] font-bold leading-snug text-v2-ink shadow-[0_3px_0_var(--v2-ink)] motion-safe:animate-[game-pop_320ms_cubic-bezier(.34,1.56,.64,1)_both] data-[tone=yay]:border-[#5bcd3f] data-[tone=yay]:shadow-[0_3px_0_#5bcd3f]"
        data-tone={tone}
        // #5bcd3f = --v2-edge-cta's light value (the lime's own edge); the bubble sits outside the play scope
      >
        {say}
      </div>
      <img
        src={character}
        alt="وائل"
        className="absolute bottom-0 start-1/2 h-[66%] -translate-x-1/2 object-contain drop-shadow-[0_8px_16px_rgb(0_0_0/.35)] rtl:translate-x-1/2"
      />
      {children}
    </aside>
  )
}

/**
 * A choice tile — the play skin's pressable: 2 px line, a lip in the hue's
 * edge that collapses under the finger. Selected = lime (lime means "the one
 * selected thing").
 */
export function tileClass(selected: boolean, card: string) {
  return cn(
    "relative flex flex-col items-center justify-center border-2 text-center transition-[translate,box-shadow,background-color,border-color] duration-200 ease-[cubic-bezier(.34,1.56,.64,1)] active:translate-y-[3px] active:shadow-none active:duration-75",
    "focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-v2-brand",
    card,
    selected
      ? "border-[#5bcd3f] bg-v2-cta text-v2-on-cta shadow-[0_4px_0_var(--v2-edge-cta,#5bcd3f)]"
      : "border-v2-ink/15 bg-v2-surface text-v2-ink shadow-[0_3px_0_var(--v2-edge-tile,rgb(23_46_91/.14))] hover:border-v2-brand/40",
  )
}

/**
 * The one celebration — 16 particles out of the element that earned it,
 * gone in 700 ms. Hidden under reduced motion (game.css).
 */
const BURST_COLORS = ["var(--v2-cta)", "var(--v2-brand)", "#f28b14", "var(--v2-surface)"]
// #f28b14 = --v2-done (the stamp's orange) — read here as a literal so the particle palette stays one line
export function GameBurst({ at }: { at: number }) {
  const [shown, setShown] = useState(0)
  useEffect(() => {
    if (!at) return
    setShown(at)
    const t = window.setTimeout(() => setShown(0), 700)
    return () => window.clearTimeout(t)
  }, [at])
  if (!shown) return null
  return (
    <span aria-hidden className="game-burst">
      {Array.from({ length: 16 }, (_, i) => (
        <i
          key={i}
          style={{ "--a": `${i * 22.5}deg`, "--d": `-${54 + (i % 3) * 16}px`, background: BURST_COLORS[i % 4] } as CSSProperties}
        />
      ))}
    </span>
  )
}

/** A shake for a wrong answer or a locked round: `[className, trigger]`. */
export function useGameShake(): [string, () => void] {
  const [at, setAt] = useState(0)
  useEffect(() => {
    if (!at) return
    const t = window.setTimeout(() => setAt(0), 320)
    return () => window.clearTimeout(t)
  }, [at])
  return [at ? "motion-safe:animate-[game-shake_320ms_ease-in-out]" : "", () => setAt(Date.now())]
}

/**
 * A bottom sheet INSIDE the phone screen (a portal would escape the frame).
 *  - iOS: inset 8 pt from the edges, all corners round (following the display),
 *    a 36 × 5 grabber, « سكّر » on the leading edge, 40 % dim.
 *  - Android: attached to the bottom, 28 dp top corners, a 32 × 4 handle in a
 *    48 dp hit area, no header buttons (the actions are a row at the bottom), 32 % scrim.
 * Closable by the scrim and Esc.
 */
export function GameSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ios = useGamePlatform() === "ios"
  const ui = usePlatformUi()
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="absolute inset-0 z-40">
      <button
        type="button"
        aria-label="سكّر"
        data-uisfx="close"
        onClick={onClose}
        className={cn("absolute inset-0 motion-safe:animate-[game-fade_200ms_ease-out]", ios ? "bg-black/40" : "bg-black/32")}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "absolute mx-auto w-[min(520px,calc(100%-2*var(--gs-left)))] bg-v2-surface motion-safe:animate-[game-sheet-up_400ms_cubic-bezier(.2,.8,.2,1)]",
          ios
            ? "inset-x-0 bottom-2 rounded-[34px] px-5 pt-2 pb-[max(12px,var(--gs-bottom))]"
            : "inset-x-0 bottom-0 rounded-t-[28px] px-6 pb-[calc(var(--gs-bottom)+8px)] shadow-[0_-8px_30px_rgb(0_0_0/.18)]",
        )}
      >
        <div className={cn("flex justify-center", ios ? "h-4 items-start" : "h-6 items-center")}>
          <span className={cn("rounded-full bg-v2-ink/25", ios ? "h-[5px] w-9" : "h-1 w-8")} aria-hidden />
        </div>
        {ios && (
          <div className="-mt-1 flex items-center">
            <button type="button" data-uisfx="close" onClick={onClose} className={cn(ui.link, "text-[calc(10px*var(--ts))]")}>
              سكّر
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

/** A small tag (level, section, matière) for summaries. */
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border-2 border-v2-ink/10 bg-v2-surface px-2.5 py-0.5 text-[calc(7.1px*var(--ts))] font-bold text-v2-ink", className)}>
      {children}
    </span>
  )
}
