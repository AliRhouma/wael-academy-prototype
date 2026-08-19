import type { SubjectCategory } from "@/data/types"
import { badgeFor, portraitFor, type PortraitId } from "@/components/icons/subjects"
import { subjectTheme } from "@/features/student/subjectTheme"

/**
 * The colour a matière's own drawing carries, turned into the surfaces around it.
 *
 * WHY RAW HEX HERE (the one place the token rule bends): these values are not a
 * palette choice, they are MEASUREMENTS. Each one is the dominant colour of that
 * matière's illustration — sampled off the rasterised SVG, not eyeballed — so the
 * card behind a drawing carries the drawing's own light. No token can express
 * "whatever colour this particular artwork happens to be".
 *
 * A matière with no supplied art falls back to its category token, so the rest of
 * the system stays token-driven.
 */

/** Dominant colour of each PORTRAIT, with its share of the drawing. Keyed by the
 *  drawing, not the matière — a matière that borrows a portrait (see
 *  `portraitFor`) has to borrow that portrait's colour with it, or the card
 *  stops matching what's on it. */
const ART_COLOR: Record<PortraitId, string> = {
  math2: "#cce4cc", // Math 2.svg — green disc (44 % of the drawing)
  physics: "#d4e4f4", // physics.svg — blue disc (50 %)
  french: "#f4cccc", // Frensh.svg — the rose half of its disc (22 %)
  english: "#c4ccdc", // english.svg — lavender-grey disc (36 %)
  // Math.svg has NO disc (line art on nothing), so its identity is the navy of
  // the compass and the grid rather than a backdrop.
  math: "#444c7c",
}

/**
 * Dominant colour of each BADGE — measured the same way, but sampled from the
 * DISC BACKDROP rather than the whole canvas: a badge is mostly character, and
 * the character is the same person on every card, so his skin and jacket would
 * flatten sixteen different drawings into one beige. What distinguishes a badge
 * is the scene behind him (the chalkboard, the ward, the workshop), so that is
 * what the card answers to.
 *
 * Sampled specifically in the two UPPER FLANKS of the disc — his head takes the
 * top centre and his shoulders the bottom, so the flanks are where the scene is
 * widest open. The percentages below are how much of that band the winning
 * colour held; where none is quoted the drawing is genuinely mixed and the value
 * is the mode of a close field.
 *
 * These are the RAW measurements. `subjectTint` keeps only the hue and pins
 * lightness itself, so a dark backdrop (#3c4854, the accountant's office) still
 * yields a card you can read a title on.
 */
const BADGE_COLOR: Record<string, string> = {
  "رياضيات": "#486c54",              // mathematiques — the chalkboard green (54 %)
  "خوارزميات": "#d8b4a8",            // algorithmique — the warm studio wall (51 %)
  "إعلامية": "#b4d8d8",              // informatique — pale teal screens
  "علوم فيزيائية": "#ccb4b4",        // physique — the lab's warm grey wall (43 %)
  "علوم الحياة والأرض": "#d8f0fc",   // sciences — the clinical blue ward (34 %)
  "فرنسية": "#c0d8f0",               // francais — the Paris sky behind the tower
  "أنڤليزية": "#ccccd8",            // anglais — the grey London sky (54 %)
  "عربية": "#fccc84",                // arabe — desert sand (29 %)
  "الأدب العربي": "#fccc84",
  "تربية إسلامية": "#e4d8cc",        // islamique — the cream stucco of the riad
  "تفكير إسلامي": "#e4d8cc",
  "الحضارة العربية والإسلامية": "#e4d8cc",
  "تاريخ وجغرافيا": "#ccb4a8",       // geographie — warm stone colonnade
  "اقتصاد": "#8484a8",               // economie — the dusk city outside the office
  "تصرّف": "#78a8d8",                // gestion — the blue office (57 %)
  "ميكانيك": "#5478a8",              // mecanique — the workshop blue
  "تكنولوجيا": "#5478a8",
  "كهرباء": "#ccd8f0",               // electricite — pale plant-room blue
  "ألمانية": "#cce4f0",              // allemand — the sky over the Brandenburg Gate
  "إسبانية": "#a87860",              // espagnol — terracotta (31 %)
  "فلسفة": "#9cd8f0",                // philosophie — the sky above the Parthenon
}

/** #rrggbb → [hue, saturation, lightness], s/l in 0..1. */
function hsl(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h =
    max === r ? ((g - b) / d + (g < b ? 6 : 0)) : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h * 60, s, l]
}

export interface SubjectTint {
  /**
   * Panel behind the drawing — a soft tint the ink still reads on. Mixed into
   * `--surface` at `--tint-strength` like every other tinted surface here, so a
   * dark page gets a dark plate carrying the hue instead of a white hole.
   */
  panel: string
  /** Blurred glow under the drawing — same hue, denser, semi-transparent. */
  halo: string
  /**
   * The matière as ONE solid colour, for the places too small to draw it: the
   * month grid marks a séance with a dot of this. Same measured hue as every
   * surface above, but opaque and pinned mid-lightness so it reads as a colour
   * on both a pale panel and a dark page — the pastel `panel` would vanish at
   * 6px, and `halo` is semi-transparent.
   */
  dot: string
  /** The hover flood: the same hue a few steps deeper. Close enough to `panel`
   *  that the card looks like it warmed up, not like it changed colour. */
  fill: string
  /** Concentric rings radiating out from under the drawing — a ready-made
   *  `background-image`. Same hue as the panel, stepped in hard rings that fade
   *  outward, so the art looks like it's sitting in its own ripple instead of on
   *  a flat swatch. */
  rings: string
  /** The card's own two-tone wash — a ready-made `background-image` for the
   *  WHOLE card. One measured hue swung ~45° across the diagonal: lighter and
   *  cooler where the eye enters, deeper and warmer where it leaves. Already
   *  mixed into `--surface` at `--tint-strength`, so it stays a wash in dark
   *  exactly like `panel` does — set it and nothing else. */
  gradient: string
  /** The same wash, several steps deeper — the hover flood. A card that warms
   *  up keeps its duotone instead of flattening to one colour. */
  gradientDeep: string
}

/**
 * Mix a stop into the page surface the way a flat panel is mixed, so a gradient
 * card obeys `--tint-strength` (and therefore dark mode) like every other tinted
 * surface. `amount` is the CSS var itself, not a number — the ramp differs per
 * theme and has to resolve at paint.
 */
function wash(color: string, amount: string): string {
  return `color-mix(in srgb, ${color} ${amount}, var(--surface))`
}

/**
 * The ripple behind a drawing: concentric rings of ONE colour, each step weaker
 * than the last, built as a single `background-image`.
 *
 * `closest-side` pins 100 % of the ray to the picture box's half-HEIGHT, which
 * is exactly the radius a badge medallion fills. That's what the stop ladder is
 * tuned around: the first three steps sit UNDER the drawing (they only show on a
 * cut-out portrait, which doesn't fill its box), and three more ripple past the
 * medallion into the sides and corners — the band a badge card actually shows.
 * The corner of a 4:3 box is at 167 %, so the ladder ends just past it.
 *
 * The 0.5 % gaps between steps are deliberate: a stop shared by two colours
 * renders as a hard, aliased circle edge, and a half-percent ramp is enough to
 * read as a clean line at any card size.
 */
function ringsFrom(color: string): string {
  const step = (pct: number) => `color-mix(in srgb, ${color} ${pct}%, transparent)`
  return (
    `radial-gradient(circle closest-side at 50% 50%,` +
    ` ${step(58)} 0 45.5%, ${step(44)} 46% 71.5%,` +
    ` ${step(33)} 72% 99.5%, ${step(24)} 100% 121.5%,` +
    ` ${step(14)} 122% 145.5%, ${step(6)} 146% 171.5%, transparent 172%)`
  )
}

/** Keyed by the measured SOURCE colour, so scenes and portraits share one cache
 *  — same hex in, same three surfaces out, computed once. */
const cache = new Map<string, SubjectTint>()

/**
 * The surfaces a matière's icon sits on, taken from the portrait it shows.
 * An unnamed matière (no name at all) keeps its category token, so nothing
 * regresses to a hardcoded colour for the sake of it.
 *
 * Saturation is capped — a drawing's disc can be vivid, and a card is a
 * backdrop, not an accent.
 */
export function subjectTint(name: string, category?: SubjectCategory): SubjectTint {
  if (!name) {
    const theme = subjectTheme(category)
    return {
      panel: theme.panelVar,
      halo: theme.haloVar,
      dot: theme.barVar,
      fill: theme.panelVar,
      rings: ringsFrom(theme.haloVar),
      // No measured hue to swing, so the token pair IS the gradient: the
      // category's panel into its own halo. Still token-driven.
      gradient: `linear-gradient(155deg, ${wash(theme.panelVar, "var(--tint-strength)")} 0%, ${wash(theme.haloVar, "var(--tint-strength)")} 100%)`,
      gradientDeep: `linear-gradient(155deg, ${wash(theme.panelVar, "var(--tint-fill-strength)")} 0%, ${wash(theme.haloVar, "var(--tint-fill-strength)")} 100%)`,
    }
  }
  // Precedence follows what is actually ON SCREEN — badge, then portrait — so
  // the card always answers to the drawing it is showing and not to one it has
  // stopped showing. An unmeasured badge falls through to the portrait colour:
  // registering art and measuring it are two separate edits, and the state in
  // between must not be a blank card.
  const source = (badgeFor(name) ? BADGE_COLOR[name] : undefined) ?? ART_COLOR[portraitFor(name)]
  const hit = cache.get(source)
  if (hit) return hit
  const [h, s] = hsl(source)
  const hue = h.toFixed(0)
  /** The measured hue swung `d` degrees, wrapped into 0..360. */
  const swung = (d: number) => ((((h + d) % 360) + 360) % 360).toFixed(0)
  /**
   * Saturation for a gradient stop. Capped, as everywhere here — but FLOORED
   * too: half the badges are measured off beige studio walls (#ccb4a8 and
   * friends) at 20 % saturation, and two beiges 8 lightness apart is not a
   * gradient, it's a smudge. The floor is what makes those cards read.
   *
   * `--tint-sat` then scales the whole ladder at PAINT time, which is how a
   * palette can ask for bold plates without a second set of measurements: the
   * measured hue is kept, only its intensity is dialled (see the azure2-dark
   * `.wael-subject-card` block in palettes.css).
   */
  const sat = (cap: number) =>
    `calc(${(Math.max(0.42, Math.min(s, cap)) * 100).toFixed(0)}% * var(--tint-sat, 1))`
  /**
   * The duotone: three stops down the 155° diagonal (under `dir="rtl"` that
   * puts the light corner at the top-START, where the eye enters). The hue
   * swings ±32° across the card — far enough that the two ends are visibly
   * different colours (the reference's blue→lilac plates), close enough that
   * the card still says the matière's own colour. Saturation and depth both
   * climb with the ramp, so the far corner has real body instead of being the
   * same pastel one shade down.
   *
   * The three LIGHTNESSES are CSS vars, not constants, for the same reason as
   * `--tint-sat`: the pastel ramp below is right on a white page and wrong on a
   * dark one, where a plate has to go DEEP and saturated to read as colour
   * instead of as fog. Defaults keep the light-mode ramp verbatim.
   */
  const duo = (amount: string, l: [string, string, string]) =>
    `linear-gradient(155deg,` +
    ` ${wash(`hsl(${swung(-32)} ${sat(0.6)} ${l[0]})`, amount)} 0%,` +
    ` ${wash(`hsl(${hue} ${sat(0.75)} ${l[1]})`, amount)} 46%,` +
    ` ${wash(`hsl(${swung(32)} ${sat(0.92)} ${l[2]})`, amount)} 100%)`
  /** A lightness stop as an overridable var, in percent. */
  const lv = (name: string, fallback: number) => `calc(var(${name}, ${fallback}) * 1%)`
  const tint: SubjectTint = {
    // `wash` is a no-op in light mode (--tint-strength is 100 %), so the pastel
    // ramp below is unchanged there; it only bites on a dark page.
    panel: wash(`hsl(${hue} ${(Math.min(s, 0.45) * 100).toFixed(0)}% 93%)`, "var(--tint-strength)"),
    halo: `hsl(${hue} ${(Math.min(s, 0.6) * 100).toFixed(0)}% 78% / 0.55)`,
    // Saturation FLOORED as well as capped, same reason as the gradient's: half
    // the badges are measured off beige studio walls, and six beige dots in a
    // row say nothing. 52 % lightness is the one value that holds on the cream
    // panel and on a dark page without a second measurement.
    dot: `hsl(${hue} ${(Math.max(0.5, Math.min(s, 0.72)) * 100).toFixed(0)}% 52%)`,
    fill: wash(
      `hsl(${hue} ${(Math.min(s, 0.55) * 100).toFixed(0)}% 87%)`,
      "var(--tint-fill-strength)",
    ),
    // Rings ride the same hue as `panel` but a good deal deeper, or the steps
    // vanish into the card they're drawn on.
    rings: ringsFrom(`hsl(${hue} ${(Math.min(s, 0.55) * 100).toFixed(0)}% 70%)`),
    // Straddles `panel` (93 %) rather than sitting under it — but WIDE: a
    // 97→84 ramp disappeared under the ring ladder drawn on top of it. 22
    // points of lightness is what it takes for the card to read as a plate.
    gradient: duo("var(--tint-strength)", [
      lv("--tint-l1", 92),
      lv("--tint-l2", 81),
      lv("--tint-l3", 66),
    ]),
    gradientDeep: duo("var(--tint-fill-strength)", [
      lv("--tint-fill-l1", 85),
      lv("--tint-fill-l2", 73),
      lv("--tint-fill-l3", 57),
    ]),
  }
  cache.set(source, tint)
  return tint
}
