/**
 * Wael's eyes, following the cursor.
 *
 * The portraits render as flat `<img>` (see `icons/subjects.tsx` for why), so
 * nothing inside them can be animated. This draws a TINY overlay SVG — four
 * paths — on the same viewBox, pinned over the portrait's own eyes, and moves
 * the pupils in it.
 *
 * Two facts about the supplied art drive the whole implementation:
 *
 * 1. The white is a CRESCENT, not a disc. The designer drew the sclera *around*
 *    the pupil, so the two shapes are complementary and neither is complete on
 *    its own. Translating the pupil alone would open a hole in the eye. So the
 *    overlay first repaints the FULL white — sclera ∪ pupil, both filled white —
 *    which covers the portrait's static eye, then draws the moving pupil on top.
 *
 * 2. The eyes are the SAME drawing in all six portraits — identical absolute
 *    coordinates, same head reused — so one geometry serves every matière. Only
 *    the viewBox and the two inks differ per file, and those are tabulated
 *    below, sampled from the files so the overlay is seamless against the art.
 *
 * The gaze has two poses:
 *
 * - FRONT — pupils centred in their own whites, which reads as looking straight
 *   out of the screen at you. This is the rest pose, and the pose the eyes LOCK
 *   to while the card is hovered: come near and Wael stops tracking the pointer
 *   and looks at the person holding it.
 * - TRACKING — front, plus a deflection toward the cursor that saturates almost
 *   at once (see REACH), so any real movement swings the pupils to the far edge
 *   of the white rather than nudging them.
 *
 * Containment ("never outside the white") is guaranteed structurally, not by
 * arithmetic: each pupil lives in a `<clipPath>` of its OWN eye. The travel
 * budget is then set to the exact room left over from centre, so in practice the
 * pupil kisses the edge without ever being trimmed — the clip is the hard floor.
 *
 * The overlay only mounts for a real cursor that wants motion — see `Eyes`.
 * Everywhere else (touch, reduced motion) it renders nothing at all and the
 * untouched portrait shows through, so the feature can only ever add.
 */
import { useEffect, useRef } from "react"
import { useMediaQuery } from "@/lib/hooks"
import type { PortraitId } from "../subjects"

/* ------------------------------------------------------------------ *
 * Geometry — lifted verbatim from `svg icons/illustrations/`.
 * ------------------------------------------------------------------ */

/**
 * Each portrait's frame, straight off the file. The overlay has to land on the
 * same pixels the `<img>` does, and that is NOT always just the viewBox:
 *
 * The English pair ships with `width="2120" height="2016"` — an aspect the
 * viewBox (1479 × 1704) doesn't share. So the browser sizes the image from
 * width/height and the file's OWN `preserveAspectRatio` letterboxes the drawing
 * inside it, all before `object-contain` gets a look in. The four Illustrator
 * exports carry no width/height, so for them the viewBox is the whole story.
 *
 * `size` records that intrinsic box where the file declares one; `frame()` below
 * folds it back into a single viewBox that reproduces the same fit.
 */
const VIEW: Record<PortraitId, { box: [number, number, number, number]; size?: [number, number] }> = {
  math: { box: [340, 126, 1484, 1702] },
  math2: { box: [342, 124, 1480, 1704] },
  physics: { box: [342, 124, 1482, 1702] },
  french: { box: [343, 126, 1528, 1700] },
  english: { box: [342, 124, 1479, 1704], size: [2120, 2016] },
}

/**
 * The viewBox to draw on so the overlay sits exactly where the `<img>` puts the
 * art — the declared one, widened to the file's intrinsic aspect where that
 * differs, which is precisely the padding the browser adds.
 */
function frame(portrait: PortraitId): string {
  const { box, size } = VIEW[portrait]
  const [x, y, w, h] = box
  if (!size) return box.join(" ")
  // The file's own meet-fit, undone: how much user space its viewport covers.
  const scale = Math.min(size[0] / w, size[1] / h)
  const vw = size[0] / scale
  const vh = size[1] / scale
  return [x - (vw - w) / 2, y - (vh - h) / 2, vw, vh].join(" ")
}

/** The two inks, sampled per file so the repaint is invisible against the art. */
const INK: Record<PortraitId, { white: string; pupil: string }> = {
  math: { white: "#fbfbfb", pupil: "#615452" },
  math2: { white: "#fefefe", pupil: "#5b4e4c" },
  physics: { white: "#fefefe", pupil: "#5a4c4a" },
  french: { white: "#fdfdfc", pupil: "#574d49" },
  english: { white: "#FCFAF8", pupil: "#564D49" },
}

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
 * FRONT — the shift that centres each pupil in its own white, i.e. eyes forward,
 * looking out of the screen. Measured as (sclera centre − pupil centre) from the
 * rendered bounding boxes:
 *
 *   left   sclera [940,438 → 1048,537]  pupil [986,464 → 1035,532]
 *   right  sclera [1127,438 → 1233,537] pupil [1141,465 → 1190,530]
 *
 * The two differ — and mirror each other — because the drawn pupils converge on
 * the book. That is exactly why each eye needs its own transform: one shared
 * translate can move the pair, but it can never UNCROSS them.
 */
const FRONT_L = { x: -16.5, y: -10.5 }
const FRONT_R = { x: 14.5, y: -10 }

/** Midpoint between the two eyes, in user units — the point the gaze is measured from. */
const FACE = { x: 1086, y: 488 }

/**
 * How far a pupil may slide from FRONT, in user units.
 *
 * These are the room that's actually left: centred, the ~49-wide pupil has 29.5
 * (left eye) / 28.5 (right) of white either side, and the ~67-tall pupil has
 * 15.5 / 17 above and below. Taking the tighter eye of each pair means a pupil
 * reaches the very edge of the white at full deflection and is never trimmed —
 * the most extreme look the art physically allows.
 */
const TRAVEL = { x: 28, y: 15 }

/**
 * Distance at which the gaze is fully deflected, as a multiple of the icon's own
 * width. Deliberately short: past a little over half an icon the eyes are
 * already at their limit, so a cursor anywhere else on the page pins them to the
 * extreme and every movement reads as a decisive flick rather than a drift.
 */
const REACH = 0.6

/* ------------------------------------------------------------------ *
 * One pointer listener for the whole app.
 * ------------------------------------------------------------------ */

/**
 * A matière grid shows a dozen faces and every one of them looks at the SAME
 * cursor, so they share one `pointermove` listener and one animation frame
 * instead of a dozen each. Subscribers are called once per frame with the
 * latest position; each then measures itself and writes its own transform.
 */
type Listener = (clientX: number, clientY: number) => void

const listeners = new Set<Listener>()
let pointerX = 0
let pointerY = 0
let rafId = 0
/** Until the pointer has actually moved, (0,0) is a lie — everyone stays FRONT. */
let seen = false

function broadcast() {
  rafId = 0
  for (const listener of listeners) listener(pointerX, pointerY)
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
  if (seen) listener(pointerX, pointerY)

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
 * pins this over the portrait with `absolute inset-0`).
 *
 * Renders NOTHING unless the device has a real cursor and the user hasn't asked
 * for less motion — no listener, no extra DOM, portrait untouched.
 */
export function Eyes({ portrait, className }: { portrait: PortraitId; className?: string }) {
  const fine = useMediaQuery("(pointer: fine)")
  const wants = useMediaQuery("(prefers-reduced-motion: no-preference)")
  if (!fine || !wants) return null
  return <TrackingEyes portrait={portrait} className={className} />
}

function TrackingEyes({ portrait, className }: { portrait: PortraitId; className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const leftRef = useRef<SVGGElement>(null)
  const rightRef = useRef<SVGGElement>(null)
  // Namespaced per instance: a grid mounts many of these and duplicate ids
  // would make every eye clip against whichever one rendered last.
  const uniq = useRef(uid++).current
  const clipL = `eye-clip-l-${uniq}`
  const clipR = `eye-clip-r-${uniq}`

  useEffect(() => {
    const svg = svgRef.current
    const left = leftRef.current
    const right = rightRef.current
    if (!svg || !left || !right) return

    // What counts as "hovered": the card, where there is one (the same `.group`
    // the smile and the colour flood already key off, so the eyes settle at the
    // exact moment the rest of the card reacts), else the icon's own box.
    const host = svg.closest(".group") ?? svg.parentElement

    const place = (gx: number, gy: number) => {
      left.style.transform = `translate(${(FRONT_L.x + gx).toFixed(2)}px, ${(FRONT_L.y + gy).toFixed(2)}px)`
      right.style.transform = `translate(${(FRONT_R.x + gx).toFixed(2)}px, ${(FRONT_R.y + gy).toFixed(2)}px)`
    }

    return subscribe((clientX, clientY) => {
      // Hovered: stop tracking and look straight out at whoever is pointing.
      if (host?.matches(":hover")) return place(0, 0)

      const box = svg.getBoundingClientRect()
      if (!box.width) return

      // Where the face actually is on screen. `getScreenCTM` maps user units
      // through the letterboxing AND through any CSS transform on the card, so
      // the gaze stays true while the icon swells on hover.
      const ctm = svg.getScreenCTM()
      if (!ctm) return
      const face = new DOMPoint(FACE.x, FACE.y).matrixTransform(ctm)

      const dx = clientX - face.x
      const dy = clientY - face.y
      const distance = Math.hypot(dx, dy)
      if (!distance) return

      // Direction × how far away — but saturating fast, so this is at the limit
      // for almost anywhere the cursor actually is.
      const amount = Math.min(1, distance / (box.width * REACH))
      // px in an SVG transform IS a user unit, so this is viewBox space — the
      // travel budget above holds at every rendered size.
      place((dx / distance) * amount * TRAVEL.x, (dy / distance) * amount * TRAVEL.y)
    })
  }, [])

  const ink = INK[portrait]
  // Front is also the server/first-paint pose, so the eyes never flash the
  // drawn book-ward look before the first frame lands.
  const rest = (f: { x: number; y: number }) => ({
    transform: `translate(${f.x}px, ${f.y}px)`,
    // Short, so the eyes feel attached to the cursor rather than dragged behind
    // it, but long enough to smooth the per-frame steps and to make the settle
    // to front on hover read as a decision.
    transition: "transform 120ms ease-out",
  })

  return (
    <svg
      ref={svgRef}
      viewBox={frame(portrait)}
      className={className}
      aria-hidden="true"
      // Matches the portrait's `object-contain`, so overlay and art fit their
      // shared box identically and the eyes land on the drawn ones.
      preserveAspectRatio="xMidYMid meet"
      style={{ pointerEvents: "none" }}
    >
      <defs>
        {/* Sclera ∪ pupil = one complete eye. Per eye, so a pupil can never
            stray into its neighbour's white however far the travel is pushed. */}
        <clipPath id={clipL}>
          <path d={SCLERA_L} />
          <path d={PUPIL_L} />
        </clipPath>
        <clipPath id={clipR}>
          <path d={SCLERA_R} />
          <path d={PUPIL_R} />
        </clipPath>
      </defs>

      {/* The repaint: a full white eye, hiding the portrait's fixed pupils. */}
      <g fill={ink.white}>
        <path d={SCLERA_L} />
        <path d={PUPIL_L} />
        <path d={SCLERA_R} />
        <path d={PUPIL_R} />
      </g>

      <g ref={leftRef} clipPath={`url(#${clipL})`} fill={ink.pupil} style={rest(FRONT_L)}>
        <path d={PUPIL_L} />
      </g>
      <g ref={rightRef} clipPath={`url(#${clipR})`} fill={ink.pupil} style={rest(FRONT_R)}>
        <path d={PUPIL_R} />
      </g>
    </svg>
  )
}
