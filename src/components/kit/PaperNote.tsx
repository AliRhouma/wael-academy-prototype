import type { CSSProperties, ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * « PaperNote » — the pinned sheet of paper from `svg icons/Card updated.svg`,
 * rebuilt as a container that any content can live inside.
 *
 * The delivered file is one fixed-size drawing; a card in a rail has to stretch
 * to its content at every width. So the sheet itself is CSS (cream fill, brown
 * outline, the folded corner cut out with `clip-path`) and only the two pieces
 * that must keep their shape — the pin and the folded flap — stay vector, drawn
 * from the original paths at their original coordinates. That way the outline
 * never distorts and the fold never skews, whatever the card grows to.
 *
 * The pin colour cycles per card (see `PIN_CYCLE`), the way a real corkboard
 * looks: same paper, a different pin each time.
 *
 * Referenced for spacing & density: HomeworkCard, RecentSeances (rail cards).
 */

/**
 * The paper's inks — THEMED, mapped off the ramp rather than the delivered file.
 *
 * `Card updated.svg` is cream paper with brown ink, and this used to hold those
 * hexes verbatim. It doesn't any more: a note is one more container on a page
 * whose every other container takes the palette, and left cream it was the one
 * warm thing on a blue-green page.
 *
 * Every value below is a STEP OF THE SAME RAMP, so the drawing keeps its
 * internal relationships whatever palette is on: the sheet is the panel's own
 * fill, the outline is a deep step, the fold and the needle sit between them.
 * That is what makes it still read as a drawing rather than a recoloured card —
 * the ranking of light-to-dark is what the art encodes, not the hues.
 *
 * All of it resolves because both the fold and the pin are INLINE SVG (see
 * `PaperFold`, `PaperPin`); as `<img>` a `var()` would resolve against nothing.
 * Content on the paper still reads `--paper-ink` / `--paper-ink-muted` from the
 * sheet — now the theme's ink, so it flips correctly in dark instead of staying
 * brown.
 */
export const paper = {
  /** The sheet — the same fill the section panels wear, so they read as kin. */
  sheet: "color-mix(in srgb, var(--brand-50) 30%, var(--surface))",
  /** A step above the sheet — the play chip on a note tints from it. */
  sheetLit: "var(--surface)",
  outline: "var(--brand-800)",
  fold: "var(--brand-200)",
  /** The steel needle, and the shadow the dog-ear drops on the sheet. */
  shade: "var(--brand-300)",
  ink: "var(--ink)",
  inkMuted: "var(--ink-muted)",
  /**
   * The cast shadow: a hard-edged offset (no blur), which is what makes the note
   * read as cut paper on a board rather than a CSS card floating in space.
   *
   * The one value NOT off the ramp. A shadow is dark in every theme — bound to
   * `--brand-900` it would inherit the inversion and turn into a pale halo under
   * the card in dark mode. Neutral, warm, and low enough not to fight the tint.
   */
  cast: "rgb(20 26 26 / 0.55)",
} as const

/** The six pins on the board — the reference row, left to right. */
export const PIN = {
  rose: "#d15a7f",
  sky: "#4a87c4",
  leaf: "#6ba34e",
  plum: "#ab5a93", // the pin as delivered
  gold: "#d3a324",
  amber: "#d4682f",
} as const

export type PinColor = keyof typeof PIN

export const PIN_CYCLE: PinColor[] = ["rose", "sky", "leaf", "plum", "gold", "amber"]

/** Pin n° i on the board — cycles so a rail never shows two of a colour in a row. */
export function pinAt(index: number): PinColor {
  return PIN_CYCLE[((index % PIN_CYCLE.length) + PIN_CYCLE.length) % PIN_CYCLE.length]
}

/**
 * Where the pin sits, all derived from the delivered file so the drawing is
 * reproduced as-is rather than approximated.
 *
 * The file gives the pin no outline of its own: the brown rim around it is the
 * CARD's silhouette showing through — the dark card layer bulges up around the
 * head (`SILHOUETTE_ABOVE`), and the cream sheet painted over it is notched out
 * around the collar and needle (`SILHOUETTE_BELOW`), so the dark layer shows in
 * the gap. Drawing the pin without those two shapes is what left it looking
 * hollowed out. They're part of the pin component now, and they only line up if
 * the seam between them lands exactly on the sheet's brown rim — hence the
 * fractions below and `PAPER_BORDER`, which IS the rim, measured off the art.
 */
const PIN_BOX = "375.28 0 125.94 177.01"
const PIN_ASPECT = 177.01 / 125.94
/** Pin width in px. Fixed, not a % of the card: the seam must not drift. */
const PIN_W = 36
const PIN_H = PIN_W * PIN_ASPECT
/** Height fractions of the pin box where the card's dark top edge / cream start. */
const CARD_TOP = 0.3993
const CREAM_TOP = 0.4559
/** How far the head hangs above the sheet — the art's own overhang, to the px. */
const PIN_RISE = CARD_TOP * PIN_H
/** The brown rim: 10 units in the file, at the scale the pin is drawn. */
const PAPER_BORDER = (CREAM_TOP - CARD_TOP) * PIN_H
/** The pin sits a hair right of centre in the file (3.65% of the card). */
const PIN_X = "53.65%"
/**
 * How far the note pops on hover (px) — `-translate-y-0.5`, kept as a number so
 * the box can reserve it. The head is the topmost ink in the note, so without
 * this strip of headroom the lift pushes it past the top of its own box and any
 * scrolling ancestor shaves it flat: a rail is `overflow-x-auto`, which forces
 * `overflow-y` to `auto`, and it clips at the padding edge whatever the reason.
 */
const LIFT = 2
/**
 * How far the needle and its rim reach INTO the sheet (px). Content has to start
 * below this or the first line runs through the pin — `sheetClassName` on a note
 * wants at least `pt-8`.
 */
export const PIN_DEPTH = (1 - CARD_TOP) * PIN_H

/**
 * The push-pin, traced from the delivered file. Original coordinates kept so the
 * head/needle/highlight relationship is exactly the drawing's; only the body
 * colour is swapped (`currentColor`).
 */
export function PaperPin({
  color = PIN.plum,
  className,
  style,
}: {
  color?: string
  className?: string
  style?: CSSProperties
}) {
  return (
    <svg viewBox={PIN_BOX} aria-hidden className={className} style={{ color, ...style }}>
      {/*
       * The card silhouette the pin is set into — the brown rim, see PIN_BOX.
       *
       * In the file these two close flat against the paper's top edge, one from
       * above and one from below, because there they are one path. Here they are
       * two, so each is extended across the rim to meet the other (`L`s at 70.68
       * / 80.70, the dark edge and the cream edge). Butted end to end they leave
       * a hairline that sub-pixel rounding opens into a cream stripe cutting
       * clean through the pin; overlapped they cannot. The extension is invisible
       * either way — it lies inside the rim, which is this exact brown.
       */}
      <g fill={paper.outline}>
        <path d="M387.292 70.6803C388.112 70.6803 398.172 64.4303 401.842 63.2403C410.462 60.4403 423.572 63.1803 424.122 51.7203C424.602 41.5603 415.942 38.2803 423.472 20.8803C446.012 -31.1897 533.982 25.0503 488.222 70.6803L488.222 80.7014L387.292 80.7014Z" />
        <path d="M378.295 80.7014C375.805 92.7514 373.265 98.1414 377.725 110.281C380.525 117.901 394.045 132.731 394.355 135.761C395.315 145.031 371.285 165.401 385.505 174.481C404.685 186.731 408.655 150.741 414.585 147.021C417.365 145.281 434.185 149.351 441.095 148.521C464.565 145.691 475.155 128.601 472.075 105.861C471.275 99.9314 462.185 85.2814 469.555 82.9914L469.555 70.6803L378.295 70.6803Z" />
      </g>
      {/* the coloured head + collar */}
      <g fill="currentColor">
        <path d="M414.272 66.7031C410.612 76.6231 405.552 77.7131 406.152 89.7431C407.102 108.893 437.662 120.763 452.212 109.653C456.202 106.603 456.252 103.063 458.572 100.013C466.452 89.6631 468.882 111.333 467.362 118.793C458.572 162.073 377.562 142.573 382.212 91.5931C383.772 74.4731 398.902 68.3631 414.262 66.7031H414.272Z" />
        <path d="M447.741 7.18028C495.611 -0.77972 519.291 71.5503 460.121 57.8303C437.711 52.6303 414.401 12.7203 447.741 7.18028Z" />
        <path d="M426.284 62.6918C426.764 62.1318 426.464 59.0618 428.174 57.6318C432.614 53.9418 431.714 58.9918 433.754 60.6418C438.304 64.3118 443.364 67.1017 448.434 69.9017C441.254 84.8617 443.204 123.272 419.604 102.372C403.184 87.8317 413.834 77.4417 424.284 64.6817C423.444 73.1117 414.204 80.1917 414.314 88.6817C415.904 90.7917 430.474 69.2218 431.464 66.8618C433.994 60.8018 430.064 62.8217 426.284 62.6817V62.6918Z" />
        <path d="M462.254 64.7231C462.914 69.5631 461.914 69.1931 457.684 68.3031C442.564 65.0931 424.664 49.6031 426.304 32.7031L440.254 51.7131C447.214 56.6131 453.454 63.2531 462.254 64.7231Z" />
      </g>
      {/* the steel needle + its two paper-cream glints */}
      <path
        fill={paper.shade}
        d="M404.295 140.691C406.695 141.481 410.765 141.211 410.085 145.431C405.915 148.121 397.515 169.741 396.275 170.681C394.245 172.211 391.545 169.211 390.305 168.691L404.295 140.691Z"
      />
      <g fill={paper.sheet}>
        <path d="M426.283 62.691C430.063 62.831 433.993 60.811 431.463 66.871C430.473 69.231 415.903 90.811 414.313 88.691C414.203 80.201 423.443 73.121 424.283 64.691C424.883 63.961 425.683 63.401 426.283 62.691Z" />
        <path d="M404.292 140.69L390.302 168.69C389.342 168.29 386.702 169.17 386.312 168.68C385.252 167.35 398.992 139.59 401.622 138.82C403.362 138.31 404.012 140.6 404.292 140.69Z" />
      </g>
    </svg>
  )
}

/** The dog-eared corner: the flap, its cast shadow, and the brown fold line. */
function PaperFold({ size }: { size: number }) {
  return (
    <svg
      viewBox="0.97 733.69 249.43 225"
      aria-hidden
      className="pointer-events-none absolute bottom-0 left-0"
      style={{ width: size * 1.109, height: size }}
    >
      {/* shadow the lifted corner drops back onto the sheet */}
      <path
        fill={paper.shade}
        opacity={0.55}
        d="M208.422 796.693L250.382 794.703L231.362 870.643L222.412 936.683C205.862 901.313 204.592 835.923 208.422 796.683V796.693Z"
      />
      {/*
       * The crease. In the file the flap has no outline either — it's the card's
       * dark layer again, showing in the 10-unit gap between the flap and the
       * cream's own cut, which curls with it. Reproduced by stroking the flap 10
       * units proud and filling it on top, so the rim lands outside the tan
       * rather than eating into it. The half that falls outside the sheet's
       * diagonal is clipped off by the note's own `clip-path`, which is right:
       * there the crease IS the paper's edge.
       */}
      <path
        fill={paper.outline}
        stroke={paper.outline}
        strokeWidth={20}
        strokeLinejoin="round"
        d="M204.435 764.711C190.875 821.861 197.485 880.381 211.455 936.651L28.5547 752.711C85.9647 766.391 145.595 773.561 204.435 764.711Z"
      />
      <path
        fill={paper.fold}
        d="M204.435 764.711C190.875 821.861 197.485 880.381 211.455 936.651L28.5547 752.711C85.9647 766.391 145.595 773.561 204.435 764.711Z"
      />
    </svg>
  )
}

export function PaperNote({
  pin = "plum",
  fold = 44,
  className,
  sheetClassName,
  children,
}: {
  /** Which pin holds this note up. */
  pin?: PinColor
  /**
   * Side of the square dog-ear at the bottom-left, in px. The default is sized
   * off the art, where the curl takes about a quarter of the sheet's height —
   * anything much smaller reads as a chipped corner rather than folded paper.
   */
  fold?: number
  className?: string
  sheetClassName?: string
  children: ReactNode
}) {
  // The wrapper reserves the strip the head hangs into, so a scrolling rail
  // never clips it. Not a free choice: the pin carries the brown rim that wraps
  // it, so it has to sit at exactly the height the file draws it at or the rim
  // stops meeting the sheet's own rim.
  const cut = (size: number) =>
    `polygon(0 0, 100% 0, 100% 100%, ${size}px 100%, 0 calc(100% - ${size}px))`

  return (
    <div
      className={cn("relative flex flex-col", className)}
      style={
        {
          paddingTop: PIN_RISE + LIFT,
          "--paper-ink": paper.ink,
          "--paper-ink-muted": paper.inkMuted,
        } as CSSProperties
      }
    >
      <div className="relative flex flex-1 flex-col">
        {/*
         * The cast shadow is its own clipped plate, not a `drop-shadow` filter:
         * clipping happens AFTER filtering, so a filter on the sheet gets shaved
         * off by the very `clip-path` that gives the note its dog-ear and only a
         * hairline survives. A plate is also what the source file draws.
         */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-[11px] translate-x-[5px] translate-y-[5px] transition-transform duration-200 motion-safe:group-hover:translate-x-[7px] motion-safe:group-hover:translate-y-[9px]"
          style={{ background: paper.cast, clipPath: cut(fold) }}
        />
        <div
          className={cn(
            "relative flex flex-1 flex-col rounded-[11px] transition-transform duration-200",
            "motion-safe:group-hover:-translate-y-0.5",
          )}
          style={{ background: paper.outline, clipPath: cut(fold) }}
        >
          {/* the sheet itself, one rim inside the outline */}
          <div
            className="absolute rounded-[9px]"
            style={{
              inset: PAPER_BORDER,
              // Flat. It used to carry two radial washes — a lit corner and a
              // shaded one — which read as paper grain while the sheet was
              // cream. On the themed fill the same washes read as a colour
              // gradient across the card, which is a different thing entirely.
              background: paper.sheet,
              // The cut, re-struck one rim further in. The inner box is already
              // inset by the rim on both axes, so the leg loses 2 + √2 per px of
              // rim — not 1 + √2, which left the diagonal edge a third as thick
              // as the rest of the outline.
              clipPath: cut(Math.max(fold - PAPER_BORDER * 3.414, 0)),
            }}
          />
          <div className={cn("relative flex flex-1 flex-col", sheetClassName)}>{children}</div>
          <PaperFold size={fold} />
        </div>
      </div>

      {/*
       * The pin keeps a fixed size whatever the note grows to, and lifts on the
       * exact same curve as the sheet — it carries the brown rim that wraps it,
       * so a hover that moved one and not the other would tear the seam open.
       */}
      <PaperPin
        color={PIN[pin]}
        className={cn(
          "pointer-events-none absolute -translate-x-1/2",
          "transition-transform duration-200 motion-safe:group-hover:-translate-y-0.5",
        )}
        style={{ width: PIN_W, height: PIN_H, left: PIN_X, top: LIFT }}
      />
    </div>
  )
}
