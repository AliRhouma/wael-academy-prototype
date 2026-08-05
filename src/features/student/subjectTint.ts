import type { SubjectCategory } from "@/data/types"
import { portraitFor, type PortraitId } from "@/components/icons/subjects"
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
  /** Panel behind the drawing — a soft tint the ink still reads on. */
  panel: string
  /** Blurred glow under the drawing — same hue, denser, semi-transparent. */
  halo: string
  /** The hover flood: the same hue a few steps deeper. Close enough to `panel`
   *  that the card looks like it warmed up, not like it changed colour. */
  fill: string
}

const cache = new Map<PortraitId, SubjectTint>()

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
    return { panel: theme.panelVar, halo: theme.haloVar, fill: theme.panelVar }
  }
  const id = portraitFor(name)
  const source = ART_COLOR[id]
  const hit = cache.get(id)
  if (hit) return hit
  const [h, s] = hsl(source)
  const hue = h.toFixed(0)
  const tint: SubjectTint = {
    panel: `hsl(${hue} ${(Math.min(s, 0.45) * 100).toFixed(0)}% 93%)`,
    halo: `hsl(${hue} ${(Math.min(s, 0.6) * 100).toFixed(0)}% 78% / 0.55)`,
    fill: `hsl(${hue} ${(Math.min(s, 0.55) * 100).toFixed(0)}% 87%)`,
  }
  cache.set(id, tint)
  return tint
}
