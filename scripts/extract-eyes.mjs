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
 * and within each eye TWO FIXED INKS say which parts hold still:
 *
 *   #FDFDFD  the white — the ring the iris sits in. Static, drawn UNDER.
 *   #0F090A  the arc — the dark lid shadow capping the eye. Static, drawn OVER,
 *            so the iris slides beneath it the way it does under a real lid.
 *   anything else — iris, pupil, shading, catchlight — is the part that MOVES.
 *
 * Two inks rather than "the white is whatever encloses the rest" because the arc
 * broke that heuristic: it is dark, it is not the white, and it must not move.
 * `EXPECT_WHITE` is now matched outright; the enclosing-box guess survives only
 * as a fallback for art that shipped without it, and it warns when it fires.
 *
 * NOTE the white is a RING, not a disc: the designer draws it *around* the iris,
 * so the two are complementary and neither is a complete eye on its own. That is
 * why the overlay repaints and clips against `sclera ∪ over ∪ iris` — see
 * `Eyes.tsx`. Clipping to the white alone leaves a hole exactly where the iris
 * has to move, and only the sliver crossing the ring stays visible.
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

const SVG_DIR = "svg icons/subjects"
const OUT = "src/components/icons/subjects/eyeGeometry.ts"
/** The white of the eye: static, drawn under the iris. */
const EXPECT_WHITE = "#FDFDFD"
/** The dark arc over the eye: static, drawn on top so the iris passes under it.
 *  Optional — a badge without one is simply an eye with no lid shadow. */
const EXPECT_ARC = "#0F090A"
/** Least of its own white a correctly flagged iris covers — see `fills`. */
const MIN_FILL = 0.5
/**
 * How much of an eye an UNFLAGGED shape has to cover before it is taken as part
 * of the iris anyway — see the recovery in `eye()`.
 *
 * The two populations are nowhere near each other: the iris bodies that shipped
 * unflagged measure 9–51 % of their eye, and every other unflagged shape inside
 * an eye is a 2×2-unit Figma crumb at 0 %. 3 % sits in an empty gap between them.
 */
const MIN_ADOPT = 0.03

/**
 * Badge file (basename, no extension) → the matière name it is seeded under.
 *
 * One entry per DRAWING, not per matière: where two matières share a badge (see
 * `BADGE_BY_NAME` in `icons/subjects.tsx`) the geometry is looked up by the name
 * listed here, and `SubjectIcon` passes that name through.
 */
const SUBJECT_BY_FILE = {
  algorithmique: "خوارزميات",
  anglais: "أنڤليزية",
  allemand: "ألمانية",
  arabe: "عربية",
  economie: "اقتصاد",
  electricite: "كهرباء",
  espagnol: "إسبانية",
  francais: "فرنسية",
  geographie: "تاريخ وجغرافيا",
  gestion: "تصرّف",
  informatique: "إعلامية",
  islamique: "تربية إسلامية",
  mathematiques: "رياضيات",
  mecanique: "ميكانيك",
  philosophie: "فلسفة",
  physique: "علوم فيزيائية",
  sciences: "علوم الحياة والأرض",
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

  const geo = await page.evaluate(({ expectWhite, expectArc, minAdopt }) => {
    const root = document.querySelector("svg")
    const all = [...root.querySelectorAll("path")]
    // Compared as a NUMBER, not a string: svgo strips the leading zero, so the
    // optimised files carry `fill-opacity=".99"` while the delivered ones carry
    // `fill-opacity="0.99"`. Both are the designer's marker.
    const marked = all.filter((e) => {
      const v = e.getAttribute("fill-opacity")
      return v !== null && Math.abs(parseFloat(v) - 0.99) < 1e-6
    })
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

    const lastEye = Math.max(...marked.map((e) => all.indexOf(e)))
    const eyes = union(marked)
    const mid = eyes.x + eyes.w / 2
    const side = (el) => (box(el).cx < mid ? "l" : "r")
    /**
     * A flagged shape that STRADDLES the face, with real width either side of
     * the midpoint: anglais keeps a piece of both irises in one path, so it can
     * belong to neither eye alone. Assigned to one eye it makes that iris three
     * times as wide as its white and the travel budget comes out NEGATIVE.
     *
     * The fix follows from what a mask does: the shape is rendered in BOTH eyes
     * and each eye's mask keeps only the half that falls inside it, so each half
     * travels with the eye it belongs to. It is left out of the MEASUREMENT
     * though — front and travel describe one eye, and a shape spanning both
     * describes neither.
     */
    const straddles = (el) => {
      const b = box(el)
      const lip = b.w * 0.15
      return b.x < mid - lip && b.x + b.w > mid + lip
    }
    const shared = marked.filter(straddles)
    const shape = (el) => ({ d: el.getAttribute("d"), fill: el.getAttribute("fill") })

    const firstMarked = Math.min(...marked.map((e) => all.indexOf(e)))
    /** Every shape recovered into an iris, so the check below does not then
     *  report it as art painted over the eye. It is the eye. */
    const recovered = []

    const eye = (which) => {
      const mine = marked.filter((e) => side(e) === which && !shared.includes(e))
      if (mine.length < 2) return null
      /**
       * RECOVERY. Two badges shipped with an eye's green body simply not flagged
       * — physique's right eye, both of islamique's — leaving a pupil that would
       * slide out of an iris pinned where it was drawn. Rather than drop those
       * badges, an unflagged shape is taken as iris when it is drawn among the
       * eye's own shapes, sits wholly inside that eye, and is BIG (see
       * MIN_ADOPT). Nothing else in a drawing satisfies all three, and the size
       * floor is what separates a real iris from the 2-unit crumbs Figma leaves
       * behind. It is reported, never silent: the art still wants fixing.
       */
      const box = union(mine)
      const adopted = all.filter((el) => {
        if (marked.includes(el)) return false
        // No upper bound on the index: physique draws one piece of its right iris
        // AFTER every flagged shape, and drawn-last inside an eye still means
        // part of that eye. Containment plus size is what makes this safe.
        if (all.indexOf(el) < firstMarked) return false
        const b = el.getBBox()
        if (b.width <= 0) return false
        const inside =
          b.x >= box.x && b.x + b.width <= box.x + box.w &&
          b.y >= box.y && b.y + b.height <= box.y + box.h
        return inside && b.width * b.height >= minAdopt * box.w * box.h
      })
      const byFill = new Map()
      for (const el of mine) {
        const f = (el.getAttribute("fill") || "").toUpperCase()
        byFill.set(f, [...(byFill.get(f) ?? []), el])
      }
      // The convention is that the white is always EXPECT_WHITE and that nothing
      // else in the marked set uses it, so match it outright when it is there.
      let whiteFill = byFill.has(expectWhite) ? expectWhite : null
      let guessed = false
      if (!whiteFill) {
        // Fallback for art that broke the convention: the group with the largest
        // union box, arc excluded. The white wins that because it is a ring drawn
        // AROUND the iris, so it encloses everything else in the eye.
        guessed = true
        let best = -1
        for (const [f, els] of byFill) {
          if (f === expectArc) continue
          const u = union(els)
          if (u.w * u.h > best) { best = u.w * u.h; whiteFill = f }
        }
      }
      const sclera = byFill.get(whiteFill) ?? []
      const arcs = byFill.get(expectArc) ?? []
      // Recovered shapes take their real place in the stack, so a badge that
      // needed them paints in the order the artist drew.
      recovered.push(...adopted)
      const own = [...mine.filter((e) => !sclera.includes(e) && !arcs.includes(e)), ...adopted]
      // A straddling shape is eye BODY, not decoration — leave it out of the
      // repaint and the mask and the eye is left with a hole where its half of
      // the shape should be. So it goes in with the rest, and `region` below is
      // what discards the half belonging to the other eye.
      const iris = [...own, ...shared].sort((a, b) => all.indexOf(a) - all.indexOf(b))
      if (!sclera.length || !own.length) return null
      // WHICH SIDE of the iris the arc is drawn on is the file's own business,
      // and it differs between badges — sometimes between the two eyes of one
      // badge. Assuming it always sits on top paints it over an iris the artist
      // drew on top of IT, which eats a bite out of the iris that no amount of
      // travel tuning explains. So it is read from the document order, per eye.
      const firstIris = Math.min(...iris.map((e) => all.indexOf(e)))
      const under = arcs.filter((e) => all.indexOf(e) < firstIris)
      const over = arcs.filter((e) => all.indexOf(e) > firstIris)
      // Measured against the WHITE alone, never the arc: the arc caps the eye
      // from outside, so folding it in would centre the iris up under the lid.
      const s = union(sclera)
      // Measured from this eye's OWN shapes: a shape spanning both eyes is
      // three times the width of one iris and would make travel come out
      // negative.
      const p = union(own)
      return {
        // This eye's own extent — used to spot parts of it left unmarked.
        box: union(mine),
        adopted: adopted.length,
        // The window the mask is allowed to paint in, and the whole reason a
        // shape spanning both eyes can be handed to both: outside this box the
        // mask is empty, so the far half is simply not there. Padded by a third
        // of the eye, which clears the iris at full deflection and still stops
        // well short of the other eye.
        region: [
          +(box.x - box.w / 3).toFixed(2),
          +(box.y - box.h / 3).toFixed(2),
          +((box.w * 5) / 3).toFixed(2),
          +((box.h * 5) / 3).toFixed(2),
        ],
        sclera: sclera.map(shape),
        under: under.map(shape),
        over: over.map(shape),
        iris: iris.map(shape),
        // The ink the repaint lays down over the drawn eye. Taken from the
        // white's own fill so the patch is invisible against the art.
        white: sclera[0].getAttribute("fill"),
        guessed,
        // FRONT: the shift that centres the iris in its own white — i.e. eyes
        // forward, looking out of the screen. The drawn pose usually converges
        // slightly on whatever Wael is holding, so the two differ and mirror.
        front: { x: +(s.cx - p.cx).toFixed(2), y: +(s.cy - p.cy).toFixed(2) },
        // Room left over from centred, per axis. The tighter eye of the pair
        // sets the shared travel budget below.
        room: { x: +((s.w - p.w) / 2).toFixed(2), y: +((s.h - p.h) / 2).toFixed(2) },
        // How much of its own white the marked iris actually fills. The designer
        // draws the iris nearly edge to edge, so this is ~1 in every correct
        // file; well under says part of the iris was never flagged.
        fills: +((p.w * p.h) / (s.w * s.h)).toFixed(2),
        centre: { x: +s.cx.toFixed(2), y: +s.cy.toFixed(2) },
      }
    }

    const l = eye("l")
    const r = eye("r")
    const straddling = shared.length
    if (!l || !r) return { error: "could not split the marked shapes into two eyes" }

    // Anything painted AFTER the eyes would be erased by the overlay's repaint.
    // The overlay is only sound while this is empty — so it is checked, not assumed.
    const covering = all.filter((el, i) => {
      if (i <= lastEye || recovered.includes(el)) return false
      const b = el.getBBox()
      if (!(b.x < eyes.x + eyes.w && b.x + b.width > eyes.x && b.y < eyes.y + eyes.h && b.y + b.height > eyes.y))
        return false
      // Figma leaves 2-unit crumbs behind. On a ~2100-unit canvas those are a
      // fraction of a pixel at any size a badge renders, so erasing one is not
      // worth a warning; anything that could actually be SEEN over an eye — a
      // lens glare, a lash — is orders of magnitude bigger than this floor.
      if (b.width * b.height < 0.01 * eyes.w * eyes.h) return false
      // And ignore the other extreme. Boxes are rectangles but drawings are not:
      // physique's lab coat is a 663×598 shape well below the face whose bounding
      // box still reaches up past the eyes. Anything several times the size of
      // the eyes is body or background art, not something painted ON them.
      return b.width * b.height <= 3 * eyes.w * eyes.h
    }).length

    return {
      viewBox: root.getAttribute("viewBox"),
      width: root.getAttribute("width"),
      height: root.getAttribute("height"),
      covering,
      straddling,
      marked: marked.length,
      l,
      r,
      face: { x: +((l.centre.x + r.centre.x) / 2).toFixed(2), y: +((l.centre.y + r.centre.y) / 2).toFixed(2) },
      travel: { x: +Math.min(l.room.x, r.room.x).toFixed(2), y: +Math.min(l.room.y, r.room.y).toFixed(2) },
    }
  }, { expectWhite: EXPECT_WHITE, expectArc: EXPECT_ARC, minAdopt: MIN_ADOPT })

  if (geo.error) {
    console.error(`✗ ${file}: ${geo.error}`)
    continue
  }
  for (const [which, e] of [["left", geo.l], ["right", geo.r]]) {
    if (e.guessed)
      console.warn(
        `! ${file}: ${which} eye has no ${EXPECT_WHITE} shape. Guessed the white as ` +
          `${e.white} from the largest shape — VERIFY this eye by hand, and prefer ` +
          `fixing the art so the white is ${EXPECT_WHITE}.`,
      )
  }
  if (geo.straddling) {
    console.warn(
      `! ${file}: ${geo.straddling} flagged shape(s) span BOTH eyes in one path. Each eye ` +
        `renders and masks its own half, so the gaze is right, but splitting them per eye ` +
        `in the art would be cleaner.`,
    )
  }
  const adopted = geo.l.adopted + geo.r.adopted
  if (adopted) {
    console.warn(
      `! ${file}: ${adopted} unflagged shape(s) inside the eyes were RECOVERED as iris. ` +
        `The gaze works, but the art should still be re-exported with them flagged ` +
        `fill-opacity="0.99" — recovery is a safety net, not the contract.`,
    )
  }
  for (const [which, e] of [["left", geo.l], ["right", geo.r]]) {
    if (e.fills < MIN_FILL)
      console.warn(
        `! ${file}: the ${which} iris fills only ${Math.round(e.fills * 100)} % of its ` +
          `white. The designer draws it nearly edge to edge, so this almost always ` +
          `means part of the iris was never flagged — it will hold still while the ` +
          `rest swings. Check for eye shapes without fill-opacity="0.99".`,
      )
  }
  const arcCount = (e) => e.under.length + e.over.length
  if (!arcCount(geo.l) !== !arcCount(geo.r)) {
    console.warn(
      `! ${file}: only one eye has a ${EXPECT_ARC} arc. The pair is normally ` +
        `symmetric — check the other eye's arc did not ship at some other ink, ` +
        `because it would then MOVE with the iris.`,
    )
  }
  if (geo.covering) {
    console.warn(
      `! ${file}: ${geo.covering} path(s) paint over the eyes. The overlay repaints the eye, ` +
        `so those would be erased — mark them too, or the gaze will punch a hole in the art.`,
    )
  }
  out[subject] = geo
  const nUnder = geo.l.under.length + geo.r.under.length
  const nOver = geo.l.over.length + geo.r.over.length
  console.log(
    `✓ ${file} → ${subject}  (${geo.marked} shapes, arc ${nUnder} under / ${nOver} over, ` +
      `travel ${geo.travel.x}×${geo.travel.y})`,
  )
}

await browser.close()

const body = Object.entries(out)
  .map(([subject, g]) => {
    const list = (name, shapes) =>
      shapes.length
        ? `      ${name}: [\n${shapes.map((s) => `        { d: ${JSON.stringify(s.d)}, fill: ${JSON.stringify(s.fill)} },`).join("\n")}\n      ],\n`
        : `      ${name}: [],\n`
    const eye = (e) =>
      `      region: [${e.region.join(", ")}],
` +
      list("sclera", e.sclera) +
      list("under", e.under) +
      list("over", e.over) +
      list("iris", e.iris) +
      `      white: ${JSON.stringify(e.white)},\n` +
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
   *  it is only part of the eye. Union it with \`over\` + \`iris\` for the whole.
   *  Static, drawn UNDER the moving iris. */
  sclera: EyeShape[]
  /** The dark arc capping the eye (the lid's shadow), where the file draws it
   *  BENEATH the iris: repainted at its own ink before the iris moves over it.
   *  Which side of the iris the arc belongs on varies by badge, and sometimes
   *  between the two eyes of one badge, so it is taken from the document order
   *  rather than assumed. */
  under: EyeShape[]
  /** The same arc where the file draws it ON TOP of the iris, so the iris slides
   *  beneath it. Both lists are empty when a badge draws no lid shadow. */
  over: EyeShape[]
  /** Everything that moves: iris, pupil, shading, catchlight — each keeping its
   *  own fill, so a multi-part eye survives intact. */
  iris: EyeShape[]
  /** \`[x, y, w, h]\` the mask may paint in. Art sometimes keeps a piece of BOTH
   *  eyes in ONE path (anglais does); such a shape is given to both eyes, and
   *  this window is what discards each one's far half. */
  region: [number, number, number, number]
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
