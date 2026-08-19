/**
 * SVGO settings for the delivered artwork — the badges above all.
 *
 * This file is REQUIRED, not a convenience: a bare `npx svgo` falls back to
 * preset-default, and preset-default quietly breaks two things the app depends
 * on. It went missing once; the badges in `svg icons/subjects/` were optimised
 * with it, and the next delivery run without it would have shipped art the eye
 * generator can no longer read.
 *
 * WHAT IS TURNED OFF, and why (see `.claude/skills/wael-subject-eyes`):
 *
 * - `removeViewBox` — the eyes are an overlay SVG drawn on the badge's own
 *   viewBox. Strip it and the overlay has no coordinate system to pin to.
 * - `mergePaths` — it welds both eyes' whites into a single path, and the
 *   left/right split the generator does on document order then collapses.
 *
 * THE PRECISION SPLIT is the subtle one. The size of a badge is its path data:
 * ~700 paths on a 2118 × 2015 canvas. Rounding those coordinates to whole
 * units takes HALF the file off, and one unit there is 0.05 % of the width —
 * about 0.09px at the largest size a badge is ever drawn.
 *
 * But `-p N` on the command line sets `floatPrecision` for every plugin at
 * once, and that is a trap: the designer flags each eye shape with
 * `fill-opacity="0.99"`, `cleanupNumericValues` rounds .99 → 1 at any precision
 * below 2, and `removeUselessStrokeAndFill` then drops the attribute as
 * redundant. The flags vanish, the art looks identical, and the next run of
 * `scripts/extract-eyes.mjs` finds no eyes at all.
 *
 * So precision is set on `convertPathData` ALONE — coordinates round, attribute
 * values keep their decimals. Measured over the 18 badges: 2,010 kB → 989 kB,
 * with the flag count and the viewBox byte-identical in every file.
 *
 * Verify after any run, before trusting it: same flag count, same fills, same
 * viewBox.
 */
export default {
  multipass: true,
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          removeViewBox: false,
          mergePaths: false,
          convertPathData: { floatPrecision: 0 },
          cleanupNumericValues: { floatPrecision: 3 },
        },
      },
    },
  ],
}
