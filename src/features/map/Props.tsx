import { memo } from "react"
import { MASTER_TILE_W, propFile, TEMPLATES, useArtLibrary } from "./art"
import { HALF_W, iso, round } from "./iso"
import { C, LINE, shade } from "./palette"
import { FOUNTAIN, type Prop } from "./townLayout"

/**
 * The small things: trees, shrubs, flowers, rocks, lamps, benches, parasols and
 * the fountain. Each is drawn around its tile's centre (plus jitter).
 */
const LEAVES = [C.leaf, C.leafLight, C.leafDark]
const OL = { stroke: C.ink, strokeOpacity: 0.4, strokeWidth: 1 }

export const PropArt = memo(function PropArt({ p }: { p: Prop }) {
  // delivered art first (`prop_<kind>_<nn>.png`, a variant per prop), else the code drawing
  const lib = useArtLibrary()
  const file = propFile(lib, p.kind, p.variant)
  if (file) return <PropSprite p={p} url={lib.get(file)!} />
  return <PropDrawing p={p} />
})

/** A delivered prop on the template's anchor (512, 832), 1/16 per tile — the fountain covers 2 × 2. */
function PropSprite({ p, url }: { p: Prop; url: string }) {
  const t = TEMPLATES.prop
  const big = p.kind === "fountain"
  const c = big ? iso(FOUNTAIN.x + FOUNTAIN.w / 2, FOUNTAIN.y + FOUNTAIN.h / 2) : iso(p.gx + 0.5 + p.dx, p.gy + 0.5 + p.dy)
  const k = (((big ? FOUNTAIN.w + FOUNTAIN.h : 2) * HALF_W) / MASTER_TILE_W) * p.scale
  return <image href={url} x={round(c.x - t.ax! * k)} y={round(c.y - t.ay! * k)} width={round(t.w * k)} height={round(t.h * k)} preserveAspectRatio="none" pointerEvents="none" />
}

export const PropDrawing = memo(function PropDrawing({ p }: { p: Prop }) {
  const c = iso(p.gx + 0.5 + p.dx, p.gy + 0.5 + p.dy)
  const s = p.scale
  const at = `translate(${round(c.x)} ${round(c.y)}) scale(${s})`
  switch (p.kind) {
    case "tree": {
      const leaf = LEAVES[p.variant % 3]
      return (
        <g transform={at}>
          <rect x={-2.5} y={-12} width={5} height={13} rx={2} fill={C.wood} {...OL} />
          <circle cy={-24} r={13} fill={leaf} {...OL} />
          <path d="M-12 -20a13 13 0 0 0 24 0a13 9 0 0 1 -24 0z" fill={shade(leaf, -0.15)} />
          <circle cx={-4.5} cy={-29} r={4} fill="#fff" opacity={0.3} />
        </g>
      )
    }
    case "pine": {
      const leaf = p.variant === 1 ? C.leafDark : C.leaf
      return (
        <g transform={at}>
          <rect x={-2} y={-8} width={4} height={9} rx={1.5} fill={C.wood} {...OL} />
          <path d="M0 -42L11 -18H-11z" fill={shade(leaf, 0.08)} {...OL} strokeLinejoin="round" />
          <path d="M0 -32L13 -6H-13z" fill={leaf} {...OL} strokeLinejoin="round" />
          <path d="M0 -32L13 -6H4z" fill={shade(leaf, -0.18)} />
        </g>
      )
    }
    case "bush":
      return (
        <g transform={at}>
          <circle cx={-5} cy={-5} r={6} fill={C.leafLight} {...OL} />
          <circle cx={4} cy={-6} r={7} fill={C.leaf} {...OL} />
          <circle cx={1} cy={-11} r={2} fill="#fff" opacity={0.3} />
        </g>
      )
    case "flowers": {
      const dots: [number, number, string][] = [
        [-8, -2, C.doneLine],
        [-3, 3, "#fff"],
        [4, -3, C.violet],
        [9, 2, C.doneLine],
        [1, 6, "#fff"],
        [-10, 5, C.violet],
        [7, 7, "#fff"],
      ]
      return (
        <g transform={at}>
          {dots.map(([x, y, col], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={2.6} fill={col} stroke={C.ink} strokeOpacity={0.3} strokeWidth={0.6} />
              <circle cx={x} cy={y} r={0.9} fill={C.done} />
            </g>
          ))}
        </g>
      )
    }
    case "rocks":
      return (
        <g transform={at}>
          <path d="M-12 2l-2-7 5-6 8 1 3 7-4 6z" fill={C.rock} {...OL} strokeLinejoin="round" />
          <path d="M-9 -9l8 1 3 7-6-2z" fill={shade(C.rock, 0.3)} />
          <path d="M3 5l1-6 5-3 6 3 0 5-5 3z" fill={shade(C.rock, -0.08)} {...OL} strokeLinejoin="round" />
        </g>
      )
    case "lamp":
      return (
        <g transform={at}>
          <ellipse rx={4} ry={2} fill={C.ink} opacity={0.25} />
          <line x1={0} y1={0} x2={0} y2={-28} stroke={C.ink} strokeWidth={1.8} strokeLinecap="round" />
          <circle cy={-30} r={7} fill={C.doneLine} opacity={0.28} />
          <rect x={-3.5} y={-34} width={7} height={6} rx={2} fill={C.doneLine} stroke={C.ink} strokeOpacity={0.6} strokeWidth={1} />
        </g>
      )
    case "bench":
      return (
        <g transform={at}>
          <path d="M-9 -2l9 4.5" stroke={C.ink} strokeOpacity={0.5} strokeWidth={1.2} />
          <path d="M-10 -6l10 5 0 3-10-5z" fill={C.wood} {...OL} strokeLinejoin="round" />
          <path d="M-10 -6l10 5 2-1-10-5z" fill={shade(C.wood, 0.3)} {...OL} strokeLinejoin="round" />
          <path d="M-12 -7l10 5v-6l-10-5z" fill={shade(C.wood, 0.12)} {...OL} strokeLinejoin="round" />
        </g>
      )
    case "parasol":
      return (
        <g transform={at}>
          <ellipse rx={7} ry={3.5} fill={C.ink} opacity={0.12} />
          <ellipse cy={-8} rx={6} ry={3} fill="#fff" {...OL} />
          <line x1={0} y1={-8} x2={0} y2={-24} stroke={C.ink} strokeWidth={1.4} />
          <path d="M-14 -22Q0 -34 14 -22z" fill={C.done} {...OL} strokeLinejoin="round" />
          <path d="M-5 -24Q0 -32 5 -24z" fill="#fff" />
        </g>
      )
    case "fountain":
      return <Fountain />
  }
})

/** The fountain on the plaza — a stone basin, water, a jet and slow ripples. */
function Fountain() {
  const c = iso(FOUNTAIN.x + FOUNTAIN.w / 2, FOUNTAIN.y + FOUNTAIN.h / 2)
  const rx = 46
  const ry = 23
  return (
    <g>
      <ellipse cx={c.x} cy={c.y + 5} rx={rx} ry={ry} fill={shade(C.stone, -0.18)} {...LINE} />
      <path d={`M${c.x - rx} ${c.y + 5}v-7a${rx} ${ry} 0 0 0 ${rx * 2} 0v7`} fill={shade(C.stone, -0.1)} />
      <ellipse cx={c.x} cy={c.y - 2} rx={rx} ry={ry} fill={C.stone} {...LINE} />
      <ellipse cx={c.x} cy={c.y - 1} rx={rx - 7} ry={ry - 4} fill={C.water} stroke={C.brand} strokeOpacity={0.5} strokeWidth={1} />
      <ellipse className="map-ripple" cx={c.x} cy={c.y - 1} rx={rx - 16} ry={ry - 9} fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth={1.2} />
      <ellipse className="map-ripple b" cx={c.x} cy={c.y - 1} rx={rx - 16} ry={ry - 9} fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth={1.2} />
      {/* the pedestal and its jet */}
      <path d={`M${c.x - 6} ${c.y}v-14a6 3 0 0 1 12 0v14a6 3 0 0 1 -12 0z`} fill={C.stone} {...LINE} />
      <ellipse cx={c.x} cy={c.y - 14} rx={10} ry={4.5} fill={C.water} stroke={C.ink} strokeOpacity={0.4} strokeWidth={1} />
      <path className="map-jet" d={`M${c.x} ${c.y - 15}c0 -16 -2 -22 0 -26c2 4 0 10 0 26z`} fill="#fff" opacity={0.9} />
      <path d={`M${c.x} ${c.y - 36}q-12 4 -14 20M${c.x} ${c.y - 36}q12 4 14 20`} fill="none" stroke="#fff" strokeOpacity={0.85} strokeWidth={2} strokeLinecap="round" />
    </g>
  )
}

/** A soft ground shadow for a prop (drawn in the shadow layer). */
export function propShadow(p: Prop) {
  if (p.kind === "fountain" || p.kind === "flowers") return null
  const c = iso(p.gx + 0.5 + p.dx, p.gy + 0.5 + p.dy)
  const big = p.kind === "tree" || p.kind === "pine"
  const rx = (big ? 13 : 7) * p.scale
  return <ellipse key={p.id} cx={round(c.x + rx * 0.35)} cy={round(c.y + 1)} rx={round(rx)} ry={round(rx * 0.5)} />
}
