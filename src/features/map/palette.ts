/**
 * The town's illustration palette.
 *
 * Why hex and not tokens: the map's faces are SHADED in JS (a lit left wall, a
 * darker right wall, a lighter roof) from one base colour per material, and
 * SVG shading needs concrete values to mix. Every value below is either the
 * élève-space token it names (`src/styles/v2.css`, light theme) or an
 * illustration-only shade that already exists in the game art
 * (`features/game/shared/TownArt.tsx`: grass, wood, glass). No new hue.
 */
export const C = {
  // v2 tokens (light values)
  ink: "#172e5b", // --v2-ink
  ink2: "#586989", // --v2-ink-2
  brand: "#0491a5", // --v2-brand
  deep: "#08434b", // --v2-deep
  cta: "#8aff6b", // --v2-cta
  ctaEdge: "#5bcd3f", // --v2-edge-cta (play skin)
  live: "#ff3b3e", // --v2-live
  done: "#f28b14", // --v2-done
  doneLine: "#f9b86c", // --v2-done-line
  blue: "#8eb1ff", // --v2-chip-live
  violet: "#a179ff", // --v2-chip-docs
  violetDeep: "#7b4ddb", // --v2-kind-resume
  // illustration-only (TownArt.tsx)
  grass: "#bfeeaa", // between TownArt's #d3f8c2 meadow and #5bcd3f lip
  grassAlt: "#b3e89c",
  grassDeep: "#8fd479",
  forest: "#79c46a",
  leaf: "#3f9a5c",
  leafLight: "#57b26f",
  leafDark: "#2f8050",
  wood: "#8a5a2b",
  glass: "#d4eef1",
  sky: "#bfe9f0",
  physics: "#4a7fd4",
  wall: "#f4fbff",
  cream: "#fbf3e4",
  peach: "#ffd9b8",
  // ground materials, derived from the ink (asphalt) and cream (stone)
  asphalt: "#5f6f8f",
  curb: "#e8ecf3",
  stone: "#efe7d6",
  stoneLine: "#e2d6bd",
  soil: "#c79a6b",
  rock: "#a9b4c7",
  water: "#7fd3e0",
} as const

/** Mix a hex colour toward white (t > 0) or the town's ink-black (t < 0). */
export function shade(hex: string, t: number): string {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  // darken toward a deep green-navy, never pure black (design system: no #000)
  const [tr, tg, tb] = t >= 0 ? [255, 255, 255] : [12, 30, 40]
  const k = Math.abs(t)
  const mix = (a: number, c: number) => Math.round(a + (c - a) * k)
  return `#${((1 << 24) | (mix(r, tr) << 16) | (mix(g, tg) << 8) | mix(b, tb)).toString(16).slice(1)}`
}

/** The three faces of a material: top (lit), left wall, right wall (shade). */
export function faces(base: string) {
  return { top: shade(base, 0.22), left: base, right: shade(base, -0.16) }
}

/** The outline every drawn thing carries — the brand's navy, softened. */
export const LINE = { stroke: C.ink, strokeOpacity: 0.45, strokeWidth: 1.2, strokeLinejoin: "round" as const }

/** The soft green-tinted shadow of the design system (rgb(21 58 45)). */
export const SHADOW = "rgb(21 58 45 / 0.24)"
