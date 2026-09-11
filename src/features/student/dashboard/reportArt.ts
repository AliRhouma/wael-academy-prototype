import todayRaw from "../../../../svg icons/Today seance.svg?raw"
import homeworkRaw from "../../../../svg icons/Homework.svg?raw"
import seancesRaw from "../../../../svg icons/Seances.svg?raw"

/**
 * The three برنامج اليوم drawings, repainted in the live theme.
 *
 * The delivered files are greyscale stock with a green kicker. Rather than keep
 * recoloured copies of them — a second source of truth that goes stale the next
 * time the art is redelivered — the originals are imported RAW and repainted
 * here, once at module load. Edit a ramp, every drawing follows.
 *
 * They map onto a semantic RAMP, not fixed hexes, so the drawings re-tint with
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
 *
 * Two cuts ship: the BRAND one the برنامج اليوم tiles wear, and an ALERT one for
 * the خدمة mark on a séance card — same drawing, different ramp, one source.
 */
/**
 * Where each ink of the delivered art lands on a semantic RAMP: [stock, shading,
 * kicker, line]. Both ramps run pale→deep in light mode and flip in dark, so the
 * drawings stay legible on either surface without a second copy.
 */
type Ramp = { stock: string; shade: string; kicker: string; line: string }

const BRAND: Ramp = {
  stock: "var(--brand-100)",
  shade: "var(--brand-300)",
  kicker: "var(--brand-500)",
  // The line work. A deep step of the ramp rather than the delivered near-black:
  // at 44px a black outline is most of what you see, and it kept the drawings
  // grey-looking however the fills were tinted.
  line: "var(--brand-800)",
}

/**
 * The alert cut, for the خدمة mark riding a séance card in the calendar.
 *
 * There the drawing replaces a red dot, and it has to be spotted across a grid
 * of cards whose rails are already brand-coloured — a teal drawing among teal
 * rails is decoration. Red is this system's « il y a quelque chose à faire »,
 * so the mark keeps it. The ramp is thin (50/500/700), hence the mixed shade.
 */
const ALERT: Ramp = {
  stock: "var(--danger-50)",
  shade: "color-mix(in oklab, var(--danger-500) 40%, var(--danger-50))",
  kicker: "var(--danger-500)",
  line: "var(--danger-700)",
}

function rules(r: Ramp): [RegExp, string][] {
  return [
    // The stock the drawings are built from — the palest step in the ramp.
    [/#D9D9D9/gi, r.stock],
    [/#D8D9D8/gi, r.stock],
    // Shading on the stock (the screen's bezel, the cap's underside).
    [/#909090/gi, r.shade],
    // The two kickers the artist used — the green and the cyan — onto the spine.
    [/#6CAD79/gi, r.kicker],
    [/#64BBC3/gi, r.kicker],
    [/#141514/gi, r.line],
  ]
}

function repaint(raw: string, ramp: Ramp = BRAND): string {
  const end = raw.indexOf(">") + 1
  // Drop the root's fixed px size so the drawing scales to whatever box it is
  // given. The viewBox stays, so it still fits like `object-contain` would.
  const head = raw.slice(0, end).replace(/\s(width|height)="[^"]*"/g, "")
  let out = head + raw.slice(end)
  for (const [from, to] of rules(ramp)) out = out.replace(from, to)
  return out
}

export const reportArt = {
  todaySeance: repaint(todayRaw),
  homework: repaint(homeworkRaw),
  seances: repaint(seancesRaw),
  /** Same drawing, alert cut — the mark on a séance card. */
  homeworkAlert: repaint(homeworkRaw, ALERT),
} as const

