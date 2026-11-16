import { memo, type ReactNode } from "react"
import { diamond, HALF_H, HALF_W, hash, iso, poly, round, TILE_W } from "./iso"
import { C, shade } from "./palette"
import { roadMask, roadShape, sidePoint, SIDES, type Side } from "./roads"
import { PLANET, planetDist, type Ground as GroundKind, type TownShape } from "./townLayout"

/**
 * The ground, in one of two shapes (`TownShape`), with the same tiles on top —
 * grass, forest floor, plaza paving and auto-tiled roads with curbs, lane
 * dashes and zebra crossings:
 *  - `island`: the map's slab, a diorama block with a grass lip and soil sides;
 *  - `planet`: a small round planet — a rounded underside (grass lip, soil
 *    strata, stones), the disc of tiles clipped to its rim, and a soft sphere
 *    shading over the disc so it reads as curved.
 * Static — memoised once per shape.
 */
const SLAB = 26

/**
 * The planet in world px. A circle of radius r tiles on the grid projects to
 * an axis-aligned ellipse: rx = r·√2·HALF_W, ry = r·√2·HALF_H.
 */
const c0 = iso(PLANET.gx, PLANET.gy)
export const PLANET_PX = {
  cx: c0.x,
  cy: c0.y,
  rx: PLANET.r * Math.SQRT2 * HALF_W,
  ry: PLANET.r * Math.SQRT2 * HALF_H,
  lip: 9, // the grass edge seen under the rim
  /** how far the round underside hangs below the rim's front edge — rx·0.92 − ry makes it nearly a half-circle, so the whole outline reads as a sphere */
  depth: PLANET.r * Math.SQRT2 * HALF_W * 0.92 - PLANET.r * Math.SQRT2 * HALF_H,
}

export const GroundLayer = memo(function GroundLayer({ ground, shape }: { ground: GroundKind[][]; shape: TownShape }) {
  const n = ground.length
  const tiles: ReactNode[] = []
  const marks: ReactNode[] = []
  for (let gy = 0; gy < n; gy++)
    for (let gx = 0; gx < n; gx++) {
      if (shape === "planet" && planetDist(gx + 0.5, gy + 0.5) > PLANET.r + 0.75) continue // wholly off the planet
      const g = ground[gy][gx]
      const key = `${gx}-${gy}`
      const pts = diamond(gx, gy)
      if (g === "road") {
        tiles.push(<polygon key={key} points={pts} fill={C.asphalt} stroke={C.asphalt} strokeWidth={0.6} />)
        marks.push(<RoadMarks key={key} ground={ground} gx={gx} gy={gy} />)
      } else if (g === "plaza") {
        tiles.push(<polygon key={key} points={pts} fill={C.stone} stroke={C.stone} strokeWidth={0.6} />)
        marks.push(
          <g key={key} fill="none" stroke={C.stoneLine} strokeWidth={1}>
            <polygon points={diamond(gx + 0.06, gy + 0.06, 0.88, 0.88)} />
            <polyline points={poly([[gx + 0.5, gy + 0.06], [gx + 0.5, gy + 0.94]])} />
            <polyline points={poly([[gx + 0.06, gy + 0.5], [gx + 0.94, gy + 0.5]])} />
          </g>,
        )
      } else {
        const r = hash(gx, gy, 7)
        const fill = g === "forest" ? (r > 0.5 ? C.forest : shade(C.forest, -0.04)) : r > 0.55 ? C.grassAlt : C.grass
        tiles.push(<polygon key={key} points={pts} fill={fill} stroke={fill} strokeWidth={0.6} />)
        if (g === "grass" && r < 0.18) {
          const c = iso(gx + 0.3 + r, gy + 0.5)
          marks.push(<path key={key} d={`M${round(c.x)} ${round(c.y)}l-2 -5M${round(c.x + 3)} ${round(c.y)}l0 -6M${round(c.x + 6)} ${round(c.y)}l2 -5`} stroke={C.grassDeep} strokeWidth={1.4} strokeLinecap="round" />)
        }
      }
    }

  if (shape === "island") {
    const L = iso(0, n)
    const B = iso(n, n)
    const R = iso(n, 0)
    return (
      <g>
        {/* the slab's soft shadow, then its two visible sides */}
        <ellipse cx={0} cy={B.y * 0.62 + 60} rx={n * 30} ry={n * 12} fill="rgb(21 58 45 / 0.10)" filter="url(#map-blur-lg)" />
        <polygon points={`${L.x},${L.y} ${B.x},${B.y} ${B.x},${B.y + SLAB} ${L.x},${L.y + SLAB}`} fill={C.soil} />
        <polygon points={`${B.x},${B.y} ${R.x},${R.y} ${R.x},${R.y + SLAB} ${B.x},${B.y + SLAB}`} fill={shade(C.soil, -0.14)} />
        <polygon points={`${L.x},${L.y} ${B.x},${B.y} ${B.x},${B.y + 7} ${L.x},${L.y + 7}`} fill={C.grassDeep} />
        <polygon points={`${B.x},${B.y} ${R.x},${R.y} ${R.x},${R.y + 7} ${B.x},${B.y + 7}`} fill={shade(C.grassDeep, -0.12)} />
        <polyline points={`${L.x},${L.y + SLAB} ${B.x},${B.y + SLAB} ${R.x},${R.y + SLAB}`} fill="none" stroke={C.ink} strokeOpacity={0.2} strokeWidth={1.5} />
        {/* an under-layer the tiles sit on, so no seam ever shows */}
        <polygon points={diamond(0, 0, n, n)} fill={C.grass} />
        {tiles}
        {marks}
      </g>
    )
  }

  return (
    <g>
      <PlanetBody />
      <defs>
        <clipPath id="map-planet-disc">
          <ellipse cx={PLANET_PX.cx} cy={PLANET_PX.cy} rx={PLANET_PX.rx} ry={PLANET_PX.ry} />
        </clipPath>
        {/* light from the top-left: a bright cap, the far rim sinking into shade */}
        <radialGradient id="map-planet-shade" cx="0.4" cy="0.32" r="0.72">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.85" stopColor={C.deep} stopOpacity="0.1" />
          <stop offset="1" stopColor={C.deep} stopOpacity="0.28" />
        </radialGradient>
      </defs>
      <g clipPath="url(#map-planet-disc)">
        {/* an under-layer the tiles sit on, so no seam ever shows */}
        <polygon points={diamond(0, 0, n, n)} fill={C.grass} />
        {tiles}
        {marks}
      </g>
      <ellipse cx={PLANET_PX.cx} cy={PLANET_PX.cy} rx={PLANET_PX.rx} ry={PLANET_PX.ry} fill="url(#map-planet-shade)" pointerEvents="none" />
      <ellipse cx={PLANET_PX.cx} cy={PLANET_PX.cy} rx={PLANET_PX.rx} ry={PLANET_PX.ry} fill="none" stroke={C.ink} strokeOpacity={0.18} strokeWidth={1.5} />
    </g>
  )
})

/**
 * The planet's rounded underside: the grass lip under the front rim, then
 * soil and rock strata that follow the rim's curve into a deep, round bottom,
 * a few embedded stones, and a sideways light (lit left, shaded right).
 */
function PlanetBody() {
  const { cx, cy, rx, ry, lip, depth } = PLANET_PX
  const L = cx - rx
  const R = cx + rx
  const rb = ry + depth // vertical radius of the round underside, from the rim's centre line
  // the lower half of an ellipse centred on the axis, from left to right (via the front)
  const arc = (y: number, w: number, h: number) => `M${round(cx - w)} ${round(y)}A${round(w)} ${round(h)} 0 0 0 ${round(cx + w)} ${round(y)}`
  // from the rim, around the round bottom, and back
  const body = `${arc(cy, rx, ry)}A${round(rx)} ${round(rb)} 0 0 1 ${round(L)} ${round(cy)}Z`
  // where the bowl's edge is at height y below the rim's centre line
  const halfWidth = (y: number) => rx * Math.sqrt(Math.max(0, 1 - Math.pow((y - cy) / rb, 2)))
  // strata: arcs parallel to the rim, each starting where it meets the bowl's edge
  const strata = [
    { off: 46, color: shade(C.soil, -0.08) },
    { off: 120, color: shade(C.soil, -0.2) },
    { off: 210, color: shade(C.wood, 0.12) },
    { off: 310, color: shade(C.wood, -0.18) },
    { off: 400, color: shade(C.wood, -0.42) }, // the dark core
  ]
  const band = (off: number) => {
    const y = cy + off
    const w = halfWidth(y)
    return `${arc(y, w, ry * (w / rx))}L${round(R + 40)} ${round(cy + rb + 40)}L${round(L - 40)} ${round(cy + rb + 40)}Z`
  }
  // stones, scattered between the rim and the bottom
  const stones: ReactNode[] = []
  for (let i = 0; i < 30; i++) {
    const u = (hash(i, 5, 31) * 2 - 1) * 0.82
    const t = hash(i, 9, 37)
    const x = cx + u * rx
    const k = Math.sqrt(Math.max(0, 1 - u * u))
    const yTop = cy + ry * k + lip + 14
    const yBot = cy + rb * k - 26
    if (yBot <= yTop) continue
    const y = yTop + t * (yBot - yTop)
    const r = 5 + hash(i, 13, 41) * 10
    stones.push(<ellipse key={i} cx={round(x)} cy={round(y)} rx={round(r)} ry={round(r * 0.7)} fill={shade(C.rock, t > 0.5 ? -0.6 : -0.3)} stroke={C.ink} strokeOpacity={0.2} strokeWidth={1} />)
  }
  return (
    <g>
      <defs>
        <clipPath id="map-planet-body">
          <path d={body} />
        </clipPath>
        {/* a sphere's light: bright upper-left, deep shade lower-right */}
        <radialGradient id="map-planet-side" cx="0.3" cy="0.15" r="0.95">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.2" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor={C.deep} stopOpacity="0.55" />
        </radialGradient>
      </defs>
      <g clipPath="url(#map-planet-body)">
        <rect x={L - 10} y={cy - 10} width={rx * 2 + 20} height={rb + 60} fill={C.soil} />
        {strata.map((st) => (
          <path key={st.off} d={band(st.off)} fill={st.color} />
        ))}
        {stones}
        {/* the grass lip just under the rim */}
        <path d={`${arc(cy, rx, ry)}L${round(R)} ${round(cy + lip)}A${round(rx)} ${round(ry)} 0 0 1 ${round(L)} ${round(cy + lip)}Z`} fill={C.grassDeep} />
        <rect x={L - 10} y={cy - 10} width={rx * 2 + 20} height={rb + 60} fill="url(#map-planet-side)" />
      </g>
      <path d={body} fill="none" stroke={C.ink} strokeOpacity={0.22} strokeWidth={1.5} />
    </g>
  )
}

/** Curbs, lane dashes and crossings for one road tile, from its neighbours. */
function RoadMarks({ ground, gx, gy }: { ground: GroundKind[][]; gx: number; gy: number }) {
  const mask = roadMask(ground, gx, gy)
  const shape = roadShape(mask)
  const out: ReactNode[] = []
  const at = (side: Side, u: number, v: number) => {
    const [x, y] = sidePoint(side, gx, gy, u, v)
    return iso(x, y)
  }
  const pts = (side: Side, list: [number, number][]) => list.map(([u, v]) => at(side, u, v)).map((q) => `${round(q.x)},${round(q.y)}`).join(" ")

  // curbs on every side that does not continue as road
  for (const side of SIDES) {
    if (mask & side) continue
    out.push(<polygon key={`c${side}`} points={pts(side, [[0, 0], [1, 0], [1, 0.13], [0, 0.13]])} fill={C.curb} stroke={shade(C.asphalt, -0.1)} strokeOpacity={0.4} strokeWidth={0.8} />)
  }

  // dashes sized so they line up from tile to tile
  const seg = Math.hypot(TILE_W / 2, TILE_W / 4) / 6
  const dash = { fill: "none", stroke: "#fff", strokeOpacity: 0.85, strokeWidth: 1.6, strokeDasharray: `${round(seg)} ${round(seg)}`, strokeDashoffset: round(seg / 2), strokeLinecap: "butt" as const }
  const center = iso(gx + 0.5, gy + 0.5)
  const mid = (side: Side) => at(side, 0.5, 0)
  const connected = SIDES.filter((s) => mask & s)

  if (shape === "straight") {
    const [a, b] = connected
    const A = mid(a)
    const Bp = mid(b)
    out.push(<line key="d" x1={A.x} y1={A.y} x2={Bp.x} y2={Bp.y} {...dash} />)
  } else if (shape === "corner") {
    const [a, b] = connected
    const A = mid(a)
    const Bp = mid(b)
    out.push(<path key="d" d={`M${round(A.x)} ${round(A.y)}Q${round(center.x)} ${round(center.y)} ${round(Bp.x)} ${round(Bp.y)}`} {...dash} />)
  } else if (shape === "end") {
    const A = mid(connected[0])
    out.push(<line key="d" x1={A.x} y1={A.y} x2={center.x} y2={center.y} {...dash} />)
    out.push(<circle key="e" cx={center.x} cy={center.y} r={3} fill={C.curb} opacity={0.8} />)
  } else if (shape === "tee" || shape === "cross") {
    // zebra crossings on each arm of the junction
    for (const side of connected) {
      for (let i = 0; i < 5; i++) {
        const u = 0.2 + i * 0.15
        out.push(<polygon key={`z${side}-${i}`} points={pts(side, [[u - 0.04, 0.06], [u + 0.04, 0.06], [u + 0.04, 0.24], [u - 0.04, 0.24]])} fill="#fff" opacity={0.85} />)
      }
    }
  }
  return <g>{out}</g>
}
