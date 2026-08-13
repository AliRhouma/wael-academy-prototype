import todayRaw from "../../../../svg icons/Today seance.svg?raw"
import homeworkRaw from "../../../../svg icons/Homework.svg?raw"
import seancesRaw from "../../../../svg icons/Seances.svg?raw"

/**
 * The three تقرير اليوم drawings, repainted in the live theme.
 *
 * The delivered files are greyscale stock with a green kicker. Rather than keep
 * recoloured copies of them — a second source of truth that goes stale the next
 * time the art is redelivered — the originals are imported RAW and repainted
 * here, once at module load. Edit the map, every drawing follows.
 *
 * They map onto the brand RAMP, not fixed hexes, so the drawings re-tint with
 * `data-palette` and with dark mode along with everything else: pick زبرجد and
 * they take its blue-green, pick crépuscule and they take its violet. That only
 * works because the SVG is INLINED into the document (see `TodayReport`) — as an
 * `<img>` the file is its own document and a `var()` inside it resolves against
 * nothing, so the drawings would come out black.
 *
 * (This is the opposite call to `navGlyphColors.ts`, deliberately. The rail
 * glyphs are a fixed multi-coloured set whose charm is that they DON'T follow
 * the palette; these three are monochrome studies of one hue, and a hue that
 * disagrees with the theme around it just looks stale.)
 */
const REPAINT: [RegExp, string][] = [
  // The stock the drawings are built from — the palest step in the ramp.
  [/#D9D9D9/gi, "var(--brand-100)"],
  [/#D8D9D8/gi, "var(--brand-100)"],
  // Shading on the stock (the screen's bezel, the cap's underside).
  [/#909090/gi, "var(--brand-300)"],
  // The two kickers the artist used — the green and the cyan — onto the spine.
  [/#6CAD79/gi, "var(--brand-500)"],
  [/#64BBC3/gi, "var(--brand-400)"],
  // The line work. A deep step of the ramp rather than the delivered near-black:
  // at 44px a black outline is most of what you see, and it kept the drawings
  // grey-looking however the fills were tinted.
  [/#141514/gi, "var(--brand-800)"],
]

function repaint(raw: string): string {
  const end = raw.indexOf(">") + 1
  // Drop the root's fixed px size so the drawing scales to whatever box it is
  // given. The viewBox stays, so it still fits like `object-contain` would.
  const head = raw.slice(0, end).replace(/\s(width|height)="[^"]*"/g, "")
  let out = head + raw.slice(end)
  for (const [from, to] of REPAINT) out = out.replace(from, to)
  return out
}

export const reportArt = {
  todaySeance: repaint(todayRaw),
  homework: repaint(homeworkRaw),
  seances: repaint(seancesRaw),
} as const
