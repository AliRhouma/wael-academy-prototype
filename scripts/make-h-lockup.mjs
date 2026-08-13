import { readFileSync, writeFileSync } from "node:fs"

const SRC = "svg icons/wael-logo-draw.svg"
const OUT = "svg icons/wael-logo-draw-h.svg"

const src = readFileSync(SRC, "utf8")

// Measured bboxes (scratchpad/bbox.mjs — cubics sampled, not control-point hulls)
const BB = {
  emblem: { x: 385.39, y: 0, w: 702.28, h: 496.28 },
  word: { x: 0.1, y: 682.77, w: 1470, h: 204.32 },
  script: { x: 0, y: 919.89, w: 1467.8, h: 175.64 },
}

// --- target layout (units: wordmark width = 1000) -------------------------
const WORD_W = 1000
const wordH = (BB.word.h / BB.word.w) * WORD_W // 139.0
const tagH = (BB.script.h / BB.script.w) * WORD_W // 119.7
// same proportional gap the delivered art puts between the two lines
const LINE_GAP = ((919.89 - 887.09) / BB.word.h) * wordH
const textH = wordH + LINE_GAP + tagH
const emblemH = textH * 1.15 // the mark stays the dominant element
const emblemW = (BB.emblem.w / BB.emblem.h) * emblemH
const MARK_GAP = 90
const H = emblemH
const W = emblemW + MARK_GAP + WORD_W
const textTop = (H - textH) / 2 // text block optically centred on the mark

const place = (bb, x, y, w) => {
  const s = w / bb.w
  return `translate(${+(x - s * bb.x).toFixed(3)} ${+(y - s * bb.y).toFixed(3)}) scale(${+s.toFixed(6)})`
}

// RTL ORDER: the mark leads, and in an `dir="rtl"` app the start edge is the
// RIGHT one — so the mark sits at the far right and the two text lines run to
// its left. (The Latin wordmark still reads left-to-right inside its own box;
// only the block order flips.)
const T = {
  emblem: place(BB.emblem, WORD_W + MARK_GAP, 0, emblemW),
  word: place(BB.word, 0, textTop, WORD_W),
  script: place(BB.script, 0, textTop + wordH + LINE_GAP, WORD_W),
}

// --- rebuild ---------------------------------------------------------------
const paths = { emblem: [], word: [], script: [] }
const re = /<path class="p (\w+)"[^>]*>/g
let m
while ((m = re.exec(src))) paths[m[1]].push(m[0])

const style = src.match(/<style>[\s\S]*?<\/style>/)[0]
  // strokes are scaled down by the group transform; pre-divide so the draw-on
  // phase keeps the weight it was drawn with
  .replace("stroke-width:2.4", "stroke-width:3.5")

const out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${+W.toFixed(2)} ${+H.toFixed(2)}" role="img" aria-label="wael academy">
<!-- HORIZONTAL LOCKUP — generated from wael-logo-draw.svg, not redrawn.
     The delivered art stacks mark / wordmark / tagline; this file regroups the
     SAME paths into the standard side-by-side lockup: mark, then the wordmark
     with the tagline under it. Only <g transform> wrappers were added.
     Regenerate with scripts/make-h-lockup.mjs after any redelivery. -->
${style}
<g transform="${T.emblem}">
${paths.emblem.join("\n")}
</g>
<g transform="${T.word}">
${paths.word.join("\n")}
</g>
<g transform="${T.script}">
${paths.script.join("\n")}
</g>
</svg>
`

writeFileSync(OUT, out)
console.log(`${OUT}  viewBox 0 0 ${W.toFixed(2)} ${H.toFixed(2)}  ratio ${(W / H).toFixed(3)}`)
console.log({ wordH, tagH, LINE_GAP, textH, emblemH, emblemW, textTop })
