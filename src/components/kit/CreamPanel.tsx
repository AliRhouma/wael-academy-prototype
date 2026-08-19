import type { CSSProperties, ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * « CreamPanel » — the section frame from `svg icons/Section 1.svg` and
 * `Section 2.svg`: cream paper, a 3px tan edge, generously rounded.
 *
 * The two delivered files are the same frame with two different bites taken out
 * of it — one has a speech tail, one has a corner notched for the character to
 * stand in — so they are one component with two options rather than two shapes.
 *
 * Both bites are drawn, not exported: the files are fixed-size Figma frames and
 * a page section has to grow with its content. The tail keeps the delivered path
 * at its delivered size (a speech tail that stretches stops looking like one),
 * and the notch is struck in CSS at whatever size the character needs.
 */

/**
 * The frame's surface, edge and inks — all THEMED.
 *
 * These were the delivered cream and tan, fixed under every palette. They now
 * ride the tokens, so a panel takes the colour of whatever is selected: زبرجد
 * makes it blue-green, crépuscule violet, and dark mode flips the lot. (The
 * name is historical — the delivered files are cream. It is the only thing
 * about them that still is.)
 *
 * The fill is a WHISPER of the hue over the surface, not `--brand-50` itself:
 * that is the page ground under this panel (`.bg-tint`), and a panel painted
 * the same colour as the page it sits on is not a panel. Mixing toward
 * `--surface` keeps a step of separation at both ends — near-white on light,
 * a shade above the ground on dark.
 */
export const cream = {
  fill: "color-mix(in srgb, var(--brand-50) 30%, var(--surface))",
  edge: "var(--brand-200)",
  ink: "var(--ink)",
  inkMuted: "var(--ink-muted)",
} as const

/** The tan edge, in px. The delivered frames are stroked 3. */
const EDGE = 3
/** Corner radius. The files round the body 30 and the notch's corners 20. */
const RADIUS = 28
const NOTCH_R = 14

/**
 * The speech tail, lifted from `Section 1.svg` and closed along the panel's own
 * edge. Deliberately NOT closed with a `Z`: an open subpath still fills as if it
 * were, but the stroke skips the closing segment — which is the segment that
 * runs down the panel's edge, where a line would read as the tail being a
 * separate sticker rather than part of the same bubble.
 *
 * The whole trick is the SEAM: the tail's two open ends have to land on the
 * panel's border, dead centre, or the bubble comes apart into two shapes that
 * nearly meet. The path's ends are both butt-capped and both leave vertically,
 * so a 3px stroke centred on the seam ends flat across exactly the 3px the
 * panel's own border occupies — line continues into line, no step. That only
 * holds if the SVG is placed by the seam rather than by its box, which is what
 * `TAIL_SEAM` below is for. Placing it by the box (the tail's art has ~1.8px of
 * slack between its ends and the frame edge it was drawn against) is what put a
 * visible jog at the top and bottom of the mouth.
 */
/** Width and height of the delivered art, drawn 1:1 — viewBox units are px. */
const TAIL_W = 47.7
const TAIL_H = 96
/**
 * Distance from the SVG's start edge to the mouth's centreline, in px — the
 * mean of the path's two endpoints (549.34 and 549.997) less the viewBox's
 * 545 origin. They differ by 0.66px in the delivered art; splitting it leaves
 * each end a third of a pixel out, which is nothing, where favouring either
 * end leaves the other visibly proud.
 */
const TAIL_SEAM = 4.67
function PanelTail({
  edge,
  fill,
  className,
  style,
}: {
  edge: string
  fill: string
  className?: string
  style?: CSSProperties
}) {
  return (
    <svg viewBox={`545 70 ${TAIL_W} ${TAIL_H}`} aria-hidden className={className} style={style}>
      {/* The mouth: erases the panel's own border between the tail's two ends,
          so the bubble and the tail share one continuous outline instead of
          having a bar across the opening. It stops EXACTLY at the seam ends
          (73.585 and 162) and EXACTLY at the panel's outer edge — one pixel
          further in any direction and it either leaves a tan stub poking into
          the mouth or paints a cream nub outside the shape, where the tail is
          still too thin to cover it. Drawn before the path, so the outline
          paints over it. */}
      <rect x={545} y={73.585} width={TAIL_SEAM + EDGE / 2} height={162 - 73.585} fill={fill} />
      <path
        fill={fill}
        stroke={edge}
        strokeWidth={EDGE}
        d="M549.34 73.585C549.34 82.6339 553.699 91.1286 561.05 96.4053L564.926 99.1875C566.022 99.9744 567.029 100.827 567.951 101.732C568.369 101.878 568.764 102.075 569.121 102.323L590.581 117.276C592.53 118.634 592.527 120.97 590.575 122.325L568.543 137.629C568.034 137.982 567.447 138.229 566.83 138.373C565.581 139.458 564.199 140.443 562.681 141.305L561.739 141.839C554.482 145.956 549.997 153.656 549.997 162"
      />
    </svg>
  )
}

export interface CreamPanelProps {
  /**
   * Hang a speech tail off the panel's start edge, at this fraction of its
   * height. Physical right, like the art — the character it points at stands on
   * that side of an RTL page.
   */
  tail?: number
  /**
   * Bite a notch out of the top start corner, `[width, height]` in px, for the
   * character to stand in. Physical top-right, again as delivered.
   */
  notch?: [number, number]
  className?: string
  /**
   * Recolour the frame's 3px edge. Defaults to the themed tan. A panel in an
   * ALERT state (a live séance running) paints it `--danger-500` so the frame
   * itself carries the state — the shape is clipped, so a ring or an outline
   * would be cut away by the notch.
   */
  edge?: string
  /**
   * Repaint the panel's body. Defaults to the themed cream. A panel in an ALERT
   * state washes it with a few percent of the alert colour — enough that the
   * panel reads as hot from across the page, far below the level where body
   * text stops being comfortable on it.
   */
  fill?: string
  /**
   * Elevation, as a `filter` value (NOT a box-shadow — see `--shadow-panel`).
   *
   * OFF by default, and that is the point: a page of five panels all floating
   * says nothing about which of them matters. Only the live panel lights up —
   * `--shadow-panel` when it holds a séance, a red halo while one is actually
   * running — so the one panel with a deadline on it is the one that leaves the
   * page. Everything else is a flat plate on its 3px edge.
   */
  shadow?: string
  /** Padding etc. for the content layer. */
  bodyClassName?: string
  children?: ReactNode
}

export function CreamPanel({
  tail,
  notch,
  edge = cream.edge,
  fill = cream.fill,
  shadow,
  className,
  bodyClassName,
  children,
}: CreamPanelProps) {
  // The notch has to be cut out of the fill AND the edge, so the frame is two
  // layers clipped alike (the PaperNote trick): a tan plate, and the cream inset
  // by one edge on top of it. A CSS `border` would not follow the cut — it is
  // painted on the border-box rectangle, so the notch's own edges would come out
  // bare. The corners are chamfered rather than rounded: `polygon()` has no arcs,
  // and at 14px a chamfer reads as a soft corner next to a 28px radius.
  const clip = (w: number, h: number) =>
    [
      "0 0",
      `calc(100% - ${w + NOTCH_R}px) 0`,
      `calc(100% - ${w}px) ${NOTCH_R}px`,
      `calc(100% - ${w}px) ${h - NOTCH_R}px`,
      `calc(100% - ${w - NOTCH_R}px) ${h}px`,
      `calc(100% - ${NOTCH_R}px) ${h}px`,
      `100% ${h + NOTCH_R}px`,
      "100% 100%",
      "0 100%",
    ].join(", ")

  const outer = notch ? `polygon(${clip(notch[0], notch[1])})` : undefined
  // The SAME numbers cut the inner layer, and that is what draws the edge along
  // the notch: the inner box is already inset by one edge on every side, so a
  // `100% - w` measured against a box 2·EDGE narrower lands its wall EDGE
  // further in, and `h` measured from a top EDGE lower lands its floor EDGE
  // lower. The cream stops one edge short of the cut on both, so the tan plate
  // shows through as a continuous outline round the bite instead of the notch
  // coming out bare. (Subtracting EDGE here — the intuitive move — cancels the
  // inset exactly and is what left it bare.)
  const inner = outer

  return (
    // TWO boxes, and they have to stay two WHEREVER a shadow is passed: it
    // rides the OUTER one and the clip the inner. On one element the clip wins
    // — `clip-path` is applied to the filtered result, so the panel's shadow
    // gets cut off at its own edge and the elevation disappears. Split, the
    // drop-shadow traces whatever shape the clip left behind, notch and speech
    // tail included, which is why this is a filter and not a box-shadow.
    // `h-full` on both so a panel fills the row it shares: as a flex item its
    // column already stretches, but the panel inside it sized to its own
    // content and two panels side by side ended up different heights.
    <div className={cn("relative h-full", className)} style={{ filter: shadow }}>
      <div
        className="relative h-full"
        style={{ borderRadius: RADIUS, background: edge, clipPath: outer }}
      >
        <div
          className="absolute"
          style={{
            inset: EDGE,
            borderRadius: RADIUS - EDGE,
            background: fill,
            clipPath: inner,
          }}
        />
        {tail !== undefined && (
          <PanelTail
            edge={edge}
            fill={fill}
            // xl, not md: the tail points at the character, and he is only drawn
            // once the layout is wide enough to give him a column of his own. A
            // tail pointing at empty canvas is worse than no tail.
            className="pointer-events-none absolute z-10 hidden xl:block"
            // Placed by the SEAM, not by the box: the mouth's centreline is
            // pulled onto the border's centreline (half an edge in from the
            // panel's outer edge), and whatever is left of the art hangs outside.
            style={{
              right: -(TAIL_W - TAIL_SEAM - EDGE / 2),
              top: `calc(${tail * 100}% - ${TAIL_H / 2}px)`,
              width: TAIL_W,
              height: TAIL_H,
            }}
          />
        )}
        <div className={cn("relative flex h-full flex-col", bodyClassName)}>{children}</div>
      </div>
    </div>
  )
}
