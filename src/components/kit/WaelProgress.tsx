/**
 * WaelProgress — a progress bar with Wael's face riding the leading edge of the
 * fill, so "how far you've got" is a person moving along a track, not a number.
 *
 * The drawing comes from the designer's "wael running" art. That file ships TWO
 * figures on one canvas (the physics portrait and the runner) over a white
 * background rect; `svg icons/wael-face.svg` is his HEAD lifted out of it on a
 * tight viewBox — same paths, no background — so it drops in at any size.
 * The head is drawn looking left, so the <img> is mirrored: he faces the finish.
 * (`svg icons/wael-running-crop.svg` is the full running figure, same treatment,
 * if the whole body is ever wanted here instead.)
 *
 * Rendered as <img> for the same reason as the matière art (see icons/subjects.tsx):
 * a grid shows a dozen at once, the browser rasterises the document once per size,
 * and the file's `.cls-*` class names can't collide with anything on the page.
 *
 * Referenced for density & idiom: finance/parts.tsx ProgressBar (track + fill),
 * Avatar (the round, ringed face chip), SubjectsScreen cards (where it lands).
 */
import faceArt from "../../../svg icons/wael-face.svg"
import { cn } from "@/lib/utils"

type WaelProgressSize = "sm" | "md"

/**
 * `half` = half the chip's width, used to keep the face inside the track at 0%
 * and 100% instead of hanging off the rounded ends. The padding is what lets the
 * tint breathe around the head — the chip grew to pay for it, so the face stays
 * the same size on screen.
 */
const SIZES: Record<WaelProgressSize, { track: string; chip: string; half: number }> = {
  sm: { track: "h-1.5", chip: "size-[26px] p-[3px]", half: 13 },
  md: { track: "h-2", chip: "size-8 p-[4px]", half: 16 },
}

export function WaelProgress({
  pct,
  size = "sm",
  barClassName = "bg-grad",
  chipClassName = "bg-brand-100 border-brand-400",
  className,
  label,
}: {
  /** 0–100. Clamped — a derived ratio should never blow past the track. */
  pct: number
  size?: WaelProgressSize
  /** The fill colour; matières pass their bucket token (e.g. `bg-brand-500`). */
  barClassName?: string
  /** Fill + border of the face chip; matières pass their bucket's `chip`. */
  chipClassName?: string
  className?: string
  /** Accessible name, e.g. "Progression Mathématiques". */
  label?: string
}) {
  const p = Math.max(0, Math.min(100, Math.round(pct)))
  const s = SIZES[size]

  return (
    <div
      className={cn("relative", className)}
      role="progressbar"
      aria-valuenow={p}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={cn("w-full overflow-hidden rounded-full bg-neutral-200", s.track)}>
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", barClassName)}
          style={{ width: `${p}%` }}
        >
          {/* Diagonal stripes drifting forward — the only decoration on the fill,
              and it dies under prefers-reduced-motion. */}
          <span className="block size-full rounded-full bg-stripes" />
        </div>
      </div>

      {/* The face chip straddles the track like an avatar marker, tinted in the
          matière's own colour so the marker belongs to its bar. Green-tinted
          shadow keeps it lifted off both the fill and the empty track. */}
      <span
        className={cn(
          "pointer-events-none absolute top-1/2 start-0 block overflow-hidden rounded-full",
          "border-2 shadow-[0_1px_3px_rgb(21_58_45/0.22)] transition-[inset-inline-start] duration-500",
          s.chip,
          chipClassName,
        )}
        style={{
          insetInlineStart: `clamp(${s.half}px, ${p}%, calc(100% - ${s.half}px))`,
          /* RTL: the offset runs from the right edge, so the chip centres on its
             mark by shifting +50% (the mirror of the LTR -50%). */
          transform: "translate(50%, -50%)",
        }}
      >
        <img
          src={faceArt}
          alt=""
          aria-hidden="true"
          /* contain, not cover: the art is taller than wide, and cover ate his
             beard. The whole head has to fit inside the chip's padding. */
          className="size-full object-contain object-center"
          /* The finish line is on the LEFT in RTL, and the art already faces
             that way — no mirroring here (the LTR build needed scaleX(-1)). */
        />
      </span>
    </div>
  )
}
