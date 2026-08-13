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
 */
function PanelTail({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="545 70 47.7 96" aria-hidden className={className} style={style}>
      {/* Covers the panel's own edge where the tail meets it, so the bubble and
          the tail share one continuous outline. */}
      <rect x="545" y="76" width="6" height="84" fill={cream.fill} />
      <path
        fill={cream.fill}
        stroke={cream.edge}
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
  /** Padding etc. for the content layer. */
  bodyClassName?: string
  children?: ReactNode
}

export function CreamPanel({ tail, notch, className, bodyClassName, children }: CreamPanelProps) {
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
  // The inner box already starts one edge in on both axes, so the notch it has
  // to cut is one edge smaller in each direction.
  const inner = notch ? `polygon(${clip(notch[0] - EDGE, notch[1] - EDGE)})` : undefined

  return (
    <div
      // `h-full` so a panel fills the row it shares: as a flex item its column
      // already stretches, but the panel inside it sized to its own content and
      // two panels side by side ended up different heights.
      className={cn("relative h-full", className)}
      style={{ borderRadius: RADIUS, background: cream.edge, clipPath: outer }}
    >
      <div
        className="absolute"
        style={{
          inset: EDGE,
          borderRadius: RADIUS - EDGE,
          background: cream.fill,
          clipPath: inner,
        }}
      />
      {tail !== undefined && (
        <PanelTail
          className="pointer-events-none absolute z-10 hidden md:block"
          // Sits astride the edge: 43.3 of its 47.7 units hang outside, the rest
          // laps back over the panel to hide the edge behind it.
          style={{ right: -43.3, top: `calc(${tail * 100}% - 48px)`, width: 47.7, height: 96 }}
        />
      )}
      <div className={cn("relative flex h-full flex-col", bodyClassName)}>{children}</div>
    </div>
  )
}
