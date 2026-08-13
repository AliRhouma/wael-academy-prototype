/**
 * Generates the eye geometry the badge gaze overlay runs on.
 *
 *     npm i -D playwright && node scripts/extract-eyes.mjs
 *     (playwright is only needed to RUN this; nothing ships with it)
 *
 * ── How a badge marks its eyes ──────────────────────────────────────────────
 * The designer flags every eye shape with `fill-opacity="0.99"`. It is visually
 * a no-op — 99 % of a flat fill is the same pixel — but it survives every export
 * and needs no layer naming, so it is the one marker that reliably makes the
 * round trip out of the drawing tool.
 *
 * Within the marked set, left and right split by x either side of the midpoint,
 * and within each eye the white is DETECTED rather than assumed: shapes are
 * grouped by fill, and the group whose combined bounding box is largest is the
 * white. It always wins because the white is a ring drawn AROUND the iris, so it
 * encloses everything else in that eye. Everything not in that group — iris,
 * pupil, shading, catchlight — is the part that MOVES.
 *
 * Detecting beats hardcoding `#FDFDFD` because a redelivery only has to keep the
 * eye's STRUCTURE, not its exact hex. `EXPECT_WHITE` below is a sanity check, not
 * a filter: a mismatch is reported and the run continues.
 *
 * NOTE the white is a RING, not a disc: the designer draws it *around* the iris,
 * so the two are complementary and neither is a complete eye on its own. That is
 * why the overlay repaints and clips against `sclera ∪ iris` — see `Eyes.tsx`.
 * Clipping to the white alone leaves a hole exactly where the iris has to move,
 * and only the sliver crossing the ring stays visible.
 *
 * ── Why a script and not hand-measured constants ────────────────────────────
 * The five old portraits reused one head at one set of coordinates, so a single
 * hardcoded geometry served all of them. Every badge poses Wael differently, so
 * each needs its own numbers. Measuring 15 files by hand — and re-measuring them
 * on every redelivery — is exactly the kind of work that should not be manual.
 *
 * Bounding boxes come from a real `getBBox()` in a headless browser: path data
 * is full of curve control points that lie outside the drawn shape, so parsing
 * the `d` attribute for min/max gives boxes that are simply wrong.
 */
import { chromium } from "playwright"
import fs from "node:fs"
import path from "node:path"

const SVG_DIR = "svg icons"
const OUT = "src/components/icons/subjects/eyeGeometry.ts"
/** What the white normally is. Only used to flag a surprise — see above. */
const EXPECT_WHITE = "#FDFDFD"

/** Badge file (basename, no extension) → the matière name it is seeded under. */
const SUBJECT_BY_FILE = {
  "Group 60": "فلسفة",
}

const files = fs
  .readdirSync(SVG_DIR)
  .filter((f) => f.toLowerCase().endsWith(".svg"))
  .filter((f) => path.basename(f, ".svg") in SUBJECT_BY_FILE)

if (!files.length) {
  console.error("No marked badge SVGs found. Add them to SUBJECT_BY_FILE above.")
  process.exit(1)
}

const browser = await chromium.launch()
const page = await browser.newPage()
const out = {}

for (const file of files) {
  const subject = SUBJECT_BY_FILE[path.basename(file, ".svg")]
  const svg = fs.readFileSync(path.join(SVG_DIR, file), "utf8")
  await page.setContent(`<body>${svg}</body>`)

  const geo = await page.evaluate(() => {
    const root = document.querySelector("svg")
    const all = [...root.querySelectorAll("path")]
    const marked = all.filter((e) => e.getAttribute("fill-opacity") === "0.99")
    if (!marked.length) return { error: "no fill-opacity=0.99 shapes" }

    const box = (el) => {
      const b = el.getBBox()
      return { x: b.x, y: b.y, w: b.width, h: b.height, cx: b.x + b.width / 2, cy: b.y + b.height / 2 }
    }
    const union = (els) => {
      const bs = els.map(box)
      const x0 = Math.min(...bs.map((b) => b.x))
      const y0 = Math.min(...bs.map((b) => b.y))
      const x1 = Math.max(...bs.map((b) => b.x + b.w))
      const y1 = Math.max(...bs.map((b) => b.y + b.h))
      return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }
    }

    // Anything painted AFTER the eyes would be erased by the overlay's repaint.
    // The overlay is only sound while this is empty — so it is checked, not assumed.
    const lastEye = Math.max(...marked.map((e) => all.indexOf(e)))
    const eyes = union(marked)
    const covering = all.filter((el, i) => {
      if (i <= lastEye) return false
      const b = el.getBBox()
      return b.x < eyes.x + eyes.w && b.x + b.width > eyes.x && b.y < eyes.y + eyes.h && b.y + b.height > eyes.y
    }).length

    const mid = eyes.x + eyes.w / 2
    const side = (el) => (box(el).cx < mid ? "l" : "r")
    const shape = (el) => ({ d: el.getAttribute("d"), fill: el.getAttribute("fill") })

    const eye = (which) => {
      const mine = marked.filter((e) => side(e) === which)
      if (mine.length < 2) return null
      // Group by fill; the group with the largest union box is the white ring.
      const byFill = new Map()
      for (const el of mine) {
        const f = (el.getAttribute("fill") || "").toUpperCase()
        byFill.set(f, [...(byFill.get(f) ?? []), el])
      }
      let whiteFill = null
      let best = -1
      for (const [f, els] of byFill) {
        const u = union(els)
        if (u.w * u.h > best) { best = u.w * u.h; whiteFill = f }
      }
      const sclera = byFill.get(whiteFill)
      const iris = mine.filter((e) => !sclera.includes(e))
      if (!sclera.length || !iris.length) return null
      const s = union(sclera)
      const p = union(iris)
      return {
        sclera: sclera.map(shape),
        iris: iris.map(shape),
        // The ink the repaint lays down over the drawn eye. Taken from the
        // white's own fill so the patch is invisible against the art.
        white: sclera[0].getAttribute("fill"),
        // FRONT: the shift that centres the iris in its own white — i.e. eyes
        // forward, looking out of the screen. The drawn pose usually converges
        // slightly on whatever Wael is holding, so the two differ and mirror.
        front: { x: +(s.cx - p.cx).toFixed(2), y: +(s.cy - p.cy).toFixed(2) },
        // Room left over from centred, per axis. The tighter eye of the pair
        // sets the shared travel budget below.
        room: { x: +((s.w - p.w) / 2).toFixed(2), y: +((s.h - p.h) / 2).toFixed(2) },
        centre: { x: +s.cx.toFixed(2), y: +s.cy.toFixed(2) },
      }
    }

    const l = eye("l")
    const r = eye("r")
    if (!l || !r) return { error: "could not split the marked shapes into two eyes" }

    return {
      viewBox: root.getAttribute("viewBox"),
      width: root.getAttribute("width"),
      height: root.getAttribute("height"),
      covering,
      marked: marked.length,
      l,
      r,
      face: { x: +((l.centre.x + r.centre.x) / 2).toFixed(2), y: +((l.centre.y + r.centre.y) / 2).toFixed(2) },
      travel: { x: +Math.min(l.room.x, r.room.x).toFixed(2), y: +Math.min(l.room.y, r.room.y).toFixed(2) },
    }
  })

  if (geo.error) {
    console.error(`✗ ${file}: ${geo.error}`)
    continue
  }
  for (const [which, e] of [["left", geo.l], ["right", geo.r]]) {
    if (e.white.toUpperCase() !== EXPECT_WHITE)
      console.warn(`! ${file}: ${which} eye's white detected as ${e.white}, not ${EXPECT_WHITE}. ` +
        `Fine if the art changed — check the eye still looks right.`)
  }
  if (geo.covering) {
    console.warn(
      `! ${file}: ${geo.covering} path(s) paint over the eyes. The overlay repaints the eye, ` +
        `so those would be erased — mark them too, or the gaze will punch a hole in the art.`,
    )
  }
  out[subject] = geo
  console.log(
    `✓ ${file} → ${subject}  (${geo.marked} shapes, travel ${geo.travel.x}×${geo.travel.y})`,
  )
}

await browser.close()

const body = Object.entries(out)
  .map(([subject, g]) => {
    const eye = (e) =>
      `      sclera: [\n${e.sclera.map((s) => `        { d: ${JSON.stringify(s.d)}, fill: ${JSON.stringify(s.fill)} },`).join("\n")}\n      ],\n` +
      `      iris: [\n${e.iris.map((s) => `        { d: ${JSON.stringify(s.d)}, fill: ${JSON.stringify(s.fill)} },`).join("\n")}\n      ],\n` +
      `      white: ${JSON.stringify(e.white)},
` +
      `      front: { x: ${e.front.x}, y: ${e.front.y} },`
    return (
      `  ${JSON.stringify(subject)}: {\n` +
      `    viewBox: ${JSON.stringify(g.viewBox)},\n` +
      (g.width && g.height ? `    size: [${g.width}, ${g.height}],\n` : "") +
      `    face: { x: ${g.face.x}, y: ${g.face.y} },\n` +
      `    travel: { x: ${g.travel.x}, y: ${g.travel.y} },\n` +
      `    l: {\n${eye(g.l)}\n    },\n` +
      `    r: {\n${eye(g.r)}\n    },\n` +
      `  },`
    )
  })
  .join("\n")

fs.writeFileSync(
  OUT,
  `/* GENERATED by scripts/extract-eyes.mjs — do not edit by hand.
 * Re-run it whenever a badge SVG is redelivered. Geometry is measured off the
 * shapes the designer flagged with fill-opacity="0.99"; see the script header.
 */

export interface EyeShape {
  d: string
  fill: string
}

export interface EyeSide {
  /** The white of the eye — a RING drawn around the iris, not a filled disc, so
   *  it is only half of the eye. Union it with \`iris\` for the whole. */
  sclera: EyeShape[]
  /** Everything that moves: iris, pupil, shading, catchlight — each keeping its
   *  own fill, so a multi-part eye survives intact. */
  iris: EyeShape[]
  /** The white's own ink, for the repaint that hides the drawn iris. */
  white: string
  /** Shift that centres this iris in its own white (eyes forward). */
  front: { x: number; y: number }
}

export interface EyeGeometry {
  viewBox: string
  /** Intrinsic box where the file declares one — the fit has to be reproduced. */
  size?: [number, number]
  /** Midpoint between the eyes; the gaze is measured from here. */
  face: { x: number; y: number }
  /** Room a pupil may travel from front, per axis, in user units. */
  travel: { x: number; y: number }
  l: EyeSide
  r: EyeSide
}

export const EYES: Record<string, EyeGeometry> = {
${body}
}
`,
  "utf8",
)
console.log(`\nwrote ${OUT}`)
