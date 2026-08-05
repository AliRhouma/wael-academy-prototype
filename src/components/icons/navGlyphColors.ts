/**
 * Hard-coded colour set for the sidebar glyphs.
 *
 * DELIBERATE EXCEPTION to the "prefer tokens over hex" rule. Every other surface
 * in the app rides `var(--brand-*)` / `var(--accent-*)` and therefore re-colours
 * with `data-palette` and `data-theme`. The rail glyphs must NOT: they are a
 * fixed illustration set — blue bodies with gold and red kickers — and their
 * whole charm is that the rail reads multi-coloured rather than one flat ramp.
 * Under a periwinkle-accent palette the golds turned blue and the rail went
 * monochrome, which is exactly what this file prevents.
 *
 * So: literal hex, identical in every palette and in dark mode. Change a value
 * here and every glyph that uses it follows.
 *
 * (The active nav pill still forces `[&_path]:fill-white` over all of this —
 * that's the shell's job and it is unaffected.)
 */
export const navGlyph = {
  /** Base ramp — the blue that carries most bodies. */
  blue50: "#e9f2fe",
  blue100: "#d0e4fd",
  blue200: "#a6ccfa",
  blue300: "#6fb0f5",
  blue400: "#3896ec",
  blue500: "#1e88e5",
  blue600: "#1570c9",
  blue700: "#115aa3",

  /** Warm kicker — stars, coins, sparkles, the folder, the replay card. */
  gold100: "#fbeecb",
  gold500: "#f0a91d",
  gold600: "#d99400",
  gold700: "#b87c00",

  /** Alert red — the "on air" dot and the shopfront awning. */
  red500: "#e5484d",
  red600: "#cc3b40",
} as const
