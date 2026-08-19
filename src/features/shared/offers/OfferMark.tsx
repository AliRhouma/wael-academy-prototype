import { Tag } from "lucide-react"
import type { Offer } from "@/data/types"

/**
 * The offer's mark. There is no icon logo yet, so the mark is TYPE-SET: the
 * name itself, tightened into a square tile — «TURBO» over a quiet «PRO MAX»,
 * «خطوة» over «بخطوة». The moment an offer gets a real `logoUrl`, the image
 * takes the same box and nothing else on the card has to move.
 */

type MarkSize = "sm" | "md" | "lg"

const BOX: Record<MarkSize, string> = {
  sm: "size-10 rounded-md",
  md: "size-12 rounded-lg",
  lg: "size-14 rounded-lg",
}

/** Arabic is written joined — letter-spacing would tear the word apart. */
const isArabic = (text: string) => /[؀-ۿ]/.test(text)

const SCALE: Record<MarkSize, number> = { sm: 0.82, md: 1, lg: 1.16 }

/** Cairo runs wide — the longer the wordmark, the smaller it has to sit. */
function mainSize(text: string, size: MarkSize): string {
  const base = text.length <= 4 ? 15 : text.length <= 6 ? 12 : 9.5
  return `${(base * SCALE[size]).toFixed(1)}px`
}

/** Arabic needs more body than a Latin all-caps kicker to stay readable. */
function subSize(text: string, size: MarkSize): string {
  return `${((isArabic(text) ? 9.5 : 7) * SCALE[size]).toFixed(1)}px`
}

export function OfferMark({
  offer,
  size = "md",
  /** On a gradient/dark band the tile goes translucent white instead of paper. */
  inverted = false,
  className = "",
}: {
  offer?: Offer
  size?: MarkSize
  inverted?: boolean
  className?: string
}) {
  const box = BOX[size]

  if (offer?.logoUrl) {
    return (
      <img
        src={offer.logoUrl}
        alt=""
        className={`${box} shrink-0 border border-border bg-surface object-contain p-1 ${className}`}
      />
    )
  }

  const skin = inverted
    ? "border-white/30 bg-white/15 text-ink-inverted"
    : "border-border bg-surface text-ink shadow-xs"
  const tile = `${box} grid shrink-0 place-items-center overflow-hidden border px-1 text-center ${skin} ${className}`

  if (!offer?.logoText) {
    return (
      <span className={tile}>
        <Tag className={size === "lg" ? "size-6" : "size-5"} />
      </span>
    )
  }

  return (
    <span className={tile} aria-hidden>
      <span className="flex flex-col items-center gap-[0.15em] leading-none">
        <b
          dir="auto"
          className={
            "font-display font-bold leading-none " +
            (isArabic(offer.logoText) ? "" : "tracking-[-0.02em]")
          }
          style={{ fontSize: mainSize(offer.logoText, size) }}
        >
          {offer.logoText}
        </b>
        {offer.logoSub && (
          <span
            dir="auto"
            className={
              "font-display font-bold leading-none " +
              (isArabic(offer.logoSub) ? "" : "tracking-[.1em] ") +
              (inverted ? "text-white/75" : "text-ink-muted")
            }
            style={{ fontSize: subSize(offer.logoSub, size) }}
          >
            {offer.logoSub}
          </span>
        )}
      </span>
    </span>
  )
}
