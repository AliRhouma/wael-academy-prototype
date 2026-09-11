/**
 * Wael's eyes, following the cursor.
 *
 * Every drawing renders as a flat `<img>` (see `icons/subjects.tsx` for why), so
 * nothing inside it can be animated. This draws a TINY overlay SVG on the same
 * viewBox, pinned over the drawing's own eyes: it repaints each eye whole, then
 * slides a copy of the iris inside a clip of that eye's white.
 *
 * The repaint is only sound because NOTHING in the art is painted over the eyes
 * — the overlay would erase it. For badges that is verified per file by
 * `scripts/extract-eyes.mjs`, which warns when a shape covers them.
 *
 * TWO SOURCES feed one renderer:
 *
 * - BADGES — geometry generated from the SVG, where the designer flags every eye
 *   shape with `fill-opacity="0.99"` (see `eyeGeometry.ts`). Each badge poses the
 *   face differently, so each carries its own numbers, and each eye keeps its own
 *   multi-part make-up — iris, pupil, shading, catchlight — at its own fills.
 * - PORTRAITS — the five older illustrations, which reuse ONE head at identical
 *   coordinates, so a single hand-measured geometry serves all of them.
 *
 * BOTH generations draw the white as a RING around the iris, never as a filled
 * disc, so neither shape is a complete eye on its own. Everything below therefore
 * works on `sclera ∪ arc ∪ iris`:
 *
 * - the REPAINT lays all three down in the white's ink, covering the drawn iris.
 *   Using the ring alone leaves the original iris showing, pinned where it was
 *   drawn.
 * - the MASK is all three too. Masking to the ring alone punches a hole exactly
 *   where the iris needs to travel, so only the sliver crossing the ring stays
 *   visible.
 *
 * A MASK, not a `<clipPath>`, and the difference is not cosmetic. A clipPath's
 * children are combined into ONE path and the winding rule is applied across the
 * lot, so two overlapping children wound in opposite directions CANCEL instead
 * of uniting. The white ring and the iris overlap by construction and the art
 * winds them opposite, so a clip quietly bites a hole out of the iris exactly
 * where the ring passes under it — the iris renders as a crescent and it reads
 * as a travel or geometry fault, which is neither. A mask composites luminance
 * instead of resolving windings, so white over white is simply white.
 *
 * `under` and `over` are the dark arc of lid shadow capping the eye. It is static
 * like the white, and it is repainted at its own ink on WHICHEVER SIDE of the
 * iris the file drew it — taken from the document order, never assumed. Painting
 * it on top of a badge that drew the iris over it bites a chunk out of the iris,
 * which looks like a travel or clipping fault and is neither. Older art has no
 * arc at all and carries two empty lists, which costs nothing.
 *
 * Art sometimes keeps a piece of BOTH eyes in a SINGLE path (anglais does). Such
 * a shape is eye body, so it has to repaint and mask like the rest or it leaves a
 * hole — which means handing the same path to both eyes. What keeps that honest
 * is the mask's REGION: each eye's mask paints only inside its own box, so each
 * copy keeps its near half and the far half simply is not there.
 *
 * The gaze has two poses:
 *
 * - FRONT — iris centred in its own white, which reads as looking straight out of
 *   the screen at you. The rest pose, and the pose the eyes LOCK to while the
 *   card is hovered: come near and Wael stops tracking the pointer and looks at
 *   the person holding it.
 * - TRACKING — front, plus a deflection toward the cursor that saturates almost
 *   at once (see REACH), so any real movement swings the iris to the far edge of
 *   the white rather than nudging it.
 *
 * Containment ("never outside the white") is structural, not arithmetic: each
 * iris lives in a mask of its OWN eye. Travel is then budgeted to the room
 * actually left over from centre, so the iris kisses the edge without being
 * trimmed — the mask is the hard floor, the budget is the intent.
 *
 * The overlay only mounts for a real cursor that wants motion, and only while
 * the gaze is switched on — see `Eyes` and `app/gaze.ts`, where S toggles it.
 * Everywhere else (touch, reduced motion, switched off) it renders nothing at
 * all and the untouched drawing shows through, so the feature can only ever add.
 */
import { useEffect, useRef } from "react"
import { useGazeMode } from "@/app/gaze"
import { useMediaQuery } from "@/lib/hooks"
import type { PortraitId } from "../subjects"
import { EYES, type EyeGeometry } from "./eyeGeometry"

/* ------------------------------------------------------------------ *
 * Portrait geometry — hand-measured, lifted from `svg icons/illustrations/`.
 * ------------------------------------------------------------------ */

// The white crescents. Filled white they cover the portrait's eye; used as a
// clip they are the box that eye's pupil may never leave.
const SCLERA_L =
  "M1016 440.001C1044.75 459.691 1051.07 484.571 1045.99 518.991C1042.15 545.031 1035.91 536.581 1020 532.001C1040.9 521.921 1038.91 473.731 1018.1 466.901C993.12 458.691 1008.03 473.381 1001.78 482.801C997.11 489.841 986.55 487.391 986.01 488.011C984.87 489.321 986.81 515.151 986 520.001C952.02 512.711 932.15 533.231 942.14 477.141C944.81 462.131 965.78 443.631 980 440.001C991.75 436.991 1004.28 437.811 1016 440.001Z"
const SCLERA_R =
  "M1192 438C1211.94 453.35 1227.36 457.31 1231.43 485.57C1238.17 532.44 1221.42 514.14 1188 520C1191.37 503.82 1192.32 472.5 1172.05 466.95C1148.4 460.48 1164.76 472.28 1157.78 482.8C1153.11 489.84 1142.55 487.39 1142.01 488.01C1139.74 490.62 1140.19 526.98 1152 530C1125.14 555.42 1126.09 499.94 1128 485C1130.87 462.63 1142.81 455.59 1156 440C1166.78 437.98 1180.93 437.78 1192 438Z"

// The pupils as drawn — sitting low and turned in toward the nose, because in
// every portrait Wael is looking down at the book he's holding.
const PUPIL_L =
  "M1020 532.001C1009.29 528.921 996.728 522.301 985.998 520.001C986.818 515.151 984.868 489.321 986.008 488.011C986.558 487.381 997.109 489.831 1001.78 482.801C1008.03 473.381 993.118 458.691 1018.1 466.901C1038.9 473.741 1040.89 521.921 1020 532.001Z"
const PUPIL_R =
  "M1188 520.002C1179.1 521.562 1161.31 532.372 1152 530.002C1140.19 526.992 1139.75 490.622 1142.01 488.012C1142.56 487.382 1153.11 489.832 1157.78 482.802C1164.76 472.282 1148.4 460.482 1172.05 466.952C1192.32 472.502 1191.37 503.822 1188 520.002Z"

/**
 * Each portrait's frame and inks, straight off the file.
 *
 * The English pair ships `width="2120" height="2016"` — an aspect its viewBox
 * (1479 × 1704) doesn't share — so the browser sizes from width/height and the
 * file's own `preserveAspectRatio` letterboxes the drawing before
 * `object-contain` gets a look in. `size` records that; `frame()` folds it back
 * into one viewBox reproducing the same fit. The Illustrator exports carry no
 * width/height, so for them the viewBox is the whole story.
 */
const PORTRAIT_VIEW: Record<PortraitId, { box: [number, number, number, number]; size?: [number, number] }> = {
  math: { box: [340, 126, 1484, 1702] },
  math2: { box: [342, 124, 1480, 1704] },
  physics: { box: [342, 124, 1482, 1702] },
  french: { box: [343, 126, 1528, 1700] },
  english: { box: [342, 124, 1479, 1704], size: [2120, 2016] },
}

/** The two inks, sampled per file so the repaint is invisible against the art. */
const PORTRAIT_INK: Record<PortraitId, { white: string; pupil: string }> = {
  math: { white: "#fbfbfb", pupil: "#615452" },
  math2: { white: "#fefefe", pupil: "#5b4e4c" },
  physics: { white: "#fefefe", pupil: "#5a4c4a" },
  french: { white: "#fdfdfc", pupil: "#574d49" },
  english: { white: "#FCFAF8", pupil: "#564D49" },
}

/**
 * FRONT for the portraits, measured from the rendered bounding boxes:
 *
 *   left   sclera [940,438 → 1048,537]  pupil [986,464 → 1035,532]
 *   right  sclera [1127,438 → 1233,537] pupil [1141,465 → 1190,530]
 *
 * The two differ — and mirror each other — because the drawn pupils converge on
 * the book. That is exactly why each eye needs its own transform: one shared
 * translate can move the pair, but it can never UNCROSS them.
 */
const PORTRAIT_FRONT = { l: { x: -16.5, y: -10.5 }, r: { x: 14.5, y: -10 } }

/** Room left from centre: the ~49-wide pupil has 29.5 / 28.5 of white either
 *  side, the ~67-tall one has 15.5 / 17 above and below. Tighter eye wins. */
const PORTRAIT_TRAVEL = { x: 28, y: 15 }

/** Midpoint between the two portrait eyes — where the gaze is measured from. */
const PORTRAIT_FACE = { x: 1086, y: 488 }

/** The portraits, expressed in the generated badge format so one renderer serves
 *  both. `sclera` carries crescent + pupil because that union is the whole eye. */
function portraitGeometry(portrait: PortraitId): EyeGeometry {
  const { box, size } = PORTRAIT_VIEW[portrait]
  const ink = PORTRAIT_INK[portrait]
  const side = (sclera: string, pupil: string, front: { x: number; y: number }) => ({
    sclera: [{ d: sclera, fill: ink.white }],
    // The portraits draw no lid shadow inside the eye, so nothing paints back
    // either side of the pupil.
    under: [],
    over: [],
    region: [box[0], box[1], box[2], box[3]] as [number, number, number, number],
    iris: [{ d: pupil, fill: ink.pupil }],
    white: ink.white,
    front,
  })
  return {
    viewBox: box.join(" "),
    size,
    face: PORTRAIT_FACE,
    travel: PORTRAIT_TRAVEL,
    l: side(SCLERA_L, PUPIL_L, PORTRAIT_FRONT.l),
    r: side(SCLERA_R, PUPIL_R, PORTRAIT_FRONT.r),
  }
}

/**
 * The viewBox to draw on so the overlay sits exactly where the `<img>` puts the
 * art — the declared one, widened to the file's intrinsic aspect where that
 * differs, which is precisely the padding the browser adds.
 */
function frame(geo: EyeGeometry): string {
  const [x, y, w, h] = geo.viewBox.split(/[\s,]+/).map(Number)
  if (!geo.size) return geo.viewBox
  const scale = Math.min(geo.size[0] / w, geo.size[1] / h)
  const vw = geo.size[0] / scale
  const vh = geo.size[1] / scale
  return [x - (vw - w) / 2, y - (vh - h) / 2, vw, vh].join(" ")
}

/**
 * Distance at which the gaze is fully deflected, as a multiple of the icon's own
 * width. Deliberately tiny: a fifth of an icon's width is a couple of dozen
 * pixels, so the pupils are already pinned wherever the cursor realistically is.
 * The gaze then reads as a snap to the extreme of whatever direction you moved
 * in, never as a proportional drift toward you.
 */
const REACH = 0.2

/**
 * How far past the measured room the iris is allowed to push, as a multiple.
 *
 * The room is where the iris stops touching the white's edge; a real cartoon
 * looking hard sideways puts the iris PAST that, cropped by the eye. Going over
 * is safe because containment is the clip's job, not this number's — the worst
 * an overshoot can do is flatten the iris against the corner of the eye, which
 * is exactly the look being asked for.
 */
const OVERSHOOT = 1.45

/**
 * Vertical travel floor, in user units.
 *
 * A badge's iris can fill its eye almost edge to edge — Philosophie leaves 2.9
 * units of room — and honouring that exactly makes the gaze read as purely
 * horizontal. The clip is the real guarantee, so more is safe: the iris tucks
 * under the lid instead of stopping short, which is how a drawn eye behaves
 * anyway.
 */
const MIN_TRAVEL_Y = 11

/* ------------------------------------------------------------------ *
 * One pointer listener for the whole app.
 * ------------------------------------------------------------------ */

/**
 * A matière grid shows a dozen faces and every one of them looks at the SAME
 * cursor, so they share one `pointermove` listener and one animation frame
 * instead of a dozen each.
 *
 * The frame runs in TWO PASSES, and that split is a performance contract rather
 * than a style: a subscriber MEASURES when it is called and returns a closure
 * that WRITES. Measuring means `getBoundingClientRect` / `getScreenCTM`, both of
 * which force the browser to flush pending layout; writing a transform is what
 * makes layout pending again. Interleaved — measure, write, measure, write —
 * twenty icons cost twenty forced synchronous layouts every frame over a grid of
 * heavy drawings, which is the kind of jank that reads as "the eyes are
 * expensive" when it is really "the loop is". Batched, the first read flushes
 * once and the other nineteen are free.
 */
type Listener = (clientX: number, clientY: number) => (() => void) | void

const listeners = new Set<Listener>()
/** Reused across frames — this runs 60× a second and need not allocate. */
const writes: (() => void)[] = []
let pointerX = 0
let pointerY = 0
let rafId = 0
/** Until the pointer has actually moved, (0,0) is a lie — everyone stays FRONT. */
let seen = false

function broadcast() {
  rafId = 0
  for (const listener of listeners) {
    const write = listener(pointerX, pointerY)
    if (write) writes.push(write)
  }
  for (const write of writes) write()
  writes.length = 0
}

function onPointerMove(event: PointerEvent) {
  pointerX = event.clientX
  pointerY = event.clientY
  seen = true
  if (!rafId) rafId = requestAnimationFrame(broadcast)
}

function subscribe(listener: Listener): () => void {
  if (!listeners.size) window.addEventListener("pointermove", onPointerMove, { passive: true })
  listeners.add(listener)
  // Catch up immediately, so an icon mounting under a resting cursor doesn't
  // sit staring the wrong way until the pointer next moves.
  if (seen) listener(pointerX, pointerY)?.()

  return () => {
    listeners.delete(listener)
    if (!listeners.size) {
      window.removeEventListener("pointermove", onPointerMove)
      if (rafId) {
        cancelAnimationFrame(rafId)
        rafId = 0
      }
    }
  }
}

/* ------------------------------------------------------------------ *
 * The overlay.
 * ------------------------------------------------------------------ */

let uid = 0

/**
 * Pupils that track the cursor, sized and positioned by the caller (the parent
 * pins this over the drawing with `absolute inset-0`).
 *
 * `subject` selects a generated badge geometry and wins where one exists;
 * `portrait` is the older hand-measured fallback. Renders NOTHING unless the
 * device has a real cursor and the user hasn't asked for less motion — no
 * listener, no extra DOM, drawing untouched.
 */
export function Eyes({
  portrait,
  subject,
  className,
}: {
  portrait?: PortraitId
  subject?: string
  className?: string
}) {
  // ANY fine pointer, not the primary one: on a Windows touchscreen laptop the
  // primary pointer reports as touch (`pointer: coarse`) even with a mouse or a
  // trackpad right there, and the eyes silently never mounted on exactly the
  // machines people demo on.
  const fine = useMediaQuery("(any-pointer: fine)")
  const wants = useMediaQuery("(prefers-reduced-motion: no-preference)")
  // The S key, app-wide. Off here means the overlay is absent, not paused;
  // "always" is the explicit override of the reduced-motion setting.
  const gaze = useGazeMode()
  const geo = (subject && EYES[subject]) || (portrait && portraitGeometry(portrait)) || null
  if (!fine || gaze === "off" || (!wants && gaze !== "always") || !geo) return null
  return <TrackingEyes geo={geo} className={className} />
}

function TrackingEyes({ geo, className }: { geo: EyeGeometry; className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const leftRef = useRef<SVGGElement>(null)
  const rightRef = useRef<SVGGElement>(null)
  // Namespaced per instance: a grid mounts many of these and duplicate ids
  // would make every eye clip against whichever one rendered last.
  const uniq = useRef(uid++).current
  const maskL = `eye-mask-l-${uniq}`
  const maskR = `eye-mask-r-${uniq}`

  useEffect(() => {
    const svg = svgRef.current
    const left = leftRef.current
    const right = rightRef.current
    if (!svg || !left || !right) return

    // What counts as "hovered": the card, where there is one (the same `.group`
    // the colour flood already keys off, so the eyes settle at the exact moment
    // the rest of the card reacts), else the icon's own box.
    //
    // Unless an ancestor says `data-gaze="follow"`: the new élève space draws
    // its cards big enough to fill the page, so the cursor is nearly always on
    // SOME card — and locking the hovered one front froze exactly the face the
    // élève was moving toward. There the eyes never lock; over the face they
    // simply look at the pointer.
    const follow = svg.closest('[data-gaze="follow"]')
    const host = follow ? null : (svg.closest(".group") ?? svg.parentElement)
    const travelX = geo.travel.x * OVERSHOOT
    const travelY = Math.max(geo.travel.y * OVERSHOOT, MIN_TRAVEL_Y)

    const place = (gx: number, gy: number) => {
      left.style.transform = `translate(${(geo.l.front.x + gx).toFixed(2)}px, ${(geo.l.front.y + gy).toFixed(2)}px)`
      right.style.transform = `translate(${(geo.r.front.x + gx).toFixed(2)}px, ${(geo.r.front.y + gy).toFixed(2)}px)`
    }

    /**
     * Eyes nobody can see cost exactly what eyes somebody can — the same two
     * layout reads and the same masked repaint, every frame — and a full
     * matière grid keeps most of itself below the fold. So an icon that has
     * scrolled out drops out of the frame loop and parks FRONT, which is the
     * pose it should be wearing when it scrolls back in anyway.
     * `IntersectionObserver` rather than a rect test, because asking each icon
     * where it is IS the measurement being avoided.
     */
    let visible = true
    const watcher = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (!visible) place(0, 0)
      },
      // A margin, so a card entering from the bottom is already tracking by the
      // time anyone looks at it.
      { rootMargin: "120px" },
    )
    watcher.observe(svg)

    const unsubscribe = subscribe((clientX, clientY) => {
      if (!visible) return

      // Hovered: stop tracking and look straight out at whoever is pointing.
      if (host?.matches(":hover")) return () => place(0, 0)

      const box = svg.getBoundingClientRect()
      if (!box.width) return

      // Where the face actually is on screen. `getScreenCTM` maps user units
      // through the letterboxing AND through any CSS transform on the card, so
      // the gaze stays true while the icon swells on hover.
      const ctm = svg.getScreenCTM()
      if (!ctm) return
      const face = new DOMPoint(geo.face.x, geo.face.y).matrixTransform(ctm)

      const dx = clientX - face.x
      const dy = clientY - face.y
      const distance = Math.hypot(dx, dy)
      if (!distance) return

      // Direction × how far away — but saturating fast, so this is at the limit
      // for almost anywhere the cursor actually is.
      const amount = Math.min(1, distance / (box.width * REACH))
      // px in an SVG transform IS a user unit, so this is viewBox space — the
      // travel budget above holds at every rendered size. Handed back instead of
      // written here: see the note on `Listener`.
      const gx = (dx / distance) * amount * travelX
      const gy = (dy / distance) * amount * travelY
      return () => place(gx, gy)
    })

    return () => {
      watcher.disconnect()
      unsubscribe()
    }
  }, [geo])

  const view = frame(geo)

  // Front is also the first-paint pose, so the eyes never flash the drawn
  // book-ward look before the first frame lands.
  const rest = (f: { x: number; y: number }) => ({
    transform: `translate(${f.x}px, ${f.y}px)`,
    // Short, so the eyes feel attached to the cursor rather than dragged behind
    // it, but long enough to smooth the per-frame steps and to make the settle
    // to front on hover read as a decision. Kept brisk to match how fast the
    // deflection saturates — a slow ease would blunt the snap.
    transition: "transform 90ms ease-out",
  })

  /** `flood` drops each shape's own fill so the parent `fill` wins — that is what
   *  turns the eye's parts into one flat patch for the repaint and the clip. */
  const paths = (shapes: { d: string; fill: string }[], keyed: string, flood = false) =>
    shapes.map((s, i) => (
      <path key={`${keyed}-${i}`} d={s.d} fill={flood ? undefined : s.fill} />
    ))

  /** Every part of one eye — the extent to repaint and to mask against. */
  const whole = (e: EyeGeometry["l"]) => [...e.sclera, ...e.under, ...e.over, ...e.iris]

  return (
    <svg
      ref={svgRef}
      viewBox={view}
      className={className}
      aria-hidden="true"
      // Matches the drawing's `object-contain`, so overlay and art fit their
      // shared box identically and the eyes land on the drawn ones.
      preserveAspectRatio="xMidYMid meet"
      style={{ pointerEvents: "none" }}
    >
      <defs>
        {/* ring ∪ arc ∪ iris = one complete eye, which is the area the iris may
            move in. Per eye, so it can never stray into its neighbour's white
            however far the travel is pushed. The arc is in here too, so the iris
            may travel up UNDER the lid rather than stopping at it.

            The region is pinned to the whole frame in user space: the default is
            120 % of the MASKED content's box, which is the iris — far too tight
            once it travels. */}
        {[
          [maskL, geo.l],
          [maskR, geo.r],
        ].map(([id, eye]) => (
          <mask
            key={id as string}
            id={id as string}
            maskUnits="userSpaceOnUse"
            x={(eye as EyeGeometry["l"]).region[0]}
            y={(eye as EyeGeometry["l"]).region[1]}
            width={(eye as EyeGeometry["l"]).region[2]}
            height={(eye as EyeGeometry["l"]).region[3]}
          >
            <g fill="#fff">{paths(whole(eye as EyeGeometry["l"]), `m${id}`, true)}</g>
          </mask>
        ))}
      </defs>

      {/* The repaint: the same union, flooded in the white's own ink, so the
          drawn iris underneath is gone and only the moving copy shows. */}
      <g>
        <g fill={geo.l.white}>{paths(whole(geo.l), "sl", true)}</g>
        <g fill={geo.r.white}>{paths(whole(geo.r), "sr", true)}</g>
      </g>

      {/* The lid shadow that the art drew BENEATH the iris, back at its own ink:
          the repaint above flattened it, and the iris has to pass over it. */}
      <g>
        {paths(geo.l.under, "ul")}
        {paths(geo.r.under, "ur")}
      </g>

      {/* The moving iris — every part of it, each at its own fill, so a stack of
          iris + pupil + shading + catchlight travels intact. */}
      <g ref={leftRef} mask={`url(#${maskL})`} style={rest(geo.l.front)}>
        {paths(geo.l.iris, "il")}
      </g>
      <g ref={rightRef} mask={`url(#${maskR})`} style={rest(geo.r.front)}>
        {paths(geo.r.iris, "ir")}
      </g>

      {/* And the lid shadow the art drew ON TOP of the iris, painted back last,
          so the iris passes beneath it. Most badges use one side or the other;
          a few use both, one per eye. */}
      <g>
        {paths(geo.l.over, "ol")}
        {paths(geo.r.over, "or")}
      </g>
    </svg>
  )
}
