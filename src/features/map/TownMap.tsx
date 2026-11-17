import { memo, useMemo, type KeyboardEvent } from "react"
import { BuildingVisual, spriteTop, topHeight, useBuildingSprite, wallHeight } from "./BuildingArt"
import { useAlpha } from "./art"
import { GroundLayer, PLANET_PX } from "./Ground"
import { diamond, HALF_W, iso, round, TILE_H } from "./iso"
import { C, SHADOW } from "./palette"
import { PropArt, propShadow } from "./Props"
import { FOUNTAIN, MAP_N, TOWNS, type Building, type Prop, type TownShape } from "./townLayout"

/**
 * The town, as one SVG in world pixels. Layers, back to front:
 *   ground (memoised) → soft shadows → selection / hover rings →
 *   every building and prop depth-sorted by x + y → labels (always on top,
 *   counter-scaled by the camera through `--iz` so they stay readable).
 */

/** The town's rectangle (px) per shape — what the camera fits and calls "the town". */
export const WORLDS: Record<TownShape, { minX: number; maxX: number; minY: number; maxY: number }> = {
  // the square block, with room above for tall buildings
  island: {
    minX: -MAP_N * HALF_W - 24,
    maxX: MAP_N * HALF_W + 24,
    minY: -90,
    maxY: MAP_N * TILE_H + 48,
  },
  // the round planet, its underside, and room above for tall buildings
  planet: {
    minX: Math.floor(PLANET_PX.cx - PLANET_PX.rx - 40),
    maxX: Math.ceil(PLANET_PX.cx + PLANET_PX.rx + 40),
    minY: Math.floor(PLANET_PX.cy - PLANET_PX.ry - 150),
    maxY: Math.ceil(PLANET_PX.cy + PLANET_PX.ry + PLANET_PX.depth + 30),
  },
}

/** Screen anchor of a building (its footprint centre, lifted to mid-height). */
export function buildingAnchor(b: Building) {
  return iso(b.x + b.w / 2, b.y + b.h / 2, topHeight(b) * 0.45)
}

type Drawable = { key: number; tie: number; id: string; b?: Building; p?: Prop }

export function TownMap({
  shape,
  buildings,
  selectedId,
  hoveredId,
  onKeySelect,
}: {
  shape: TownShape
  buildings: Building[]
  selectedId: string | null
  hoveredId: string | null
  onKeySelect: (id: string) => void
}) {
  const town = TOWNS[shape]
  const world = WORLDS[shape]
  const worldW = world.maxX - world.minX
  const worldH = world.maxY - world.minY
  const drawables = useMemo(() => {
    const list: Drawable[] = [
      ...town.props.map((p) => {
        const big = p.kind === "fountain"
        const cx = big ? FOUNTAIN.x + FOUNTAIN.w / 2 : p.gx + 0.5 + p.dx
        const cy = big ? FOUNTAIN.y + FOUNTAIN.h / 2 : p.gy + 0.5 + p.dy
        return { key: cx + cy, tie: cx, id: p.id, p }
      }),
      ...buildings.map((b) => ({ key: b.x + b.w / 2 + b.y + b.h / 2, tie: b.x + b.w / 2, id: b.id, b })),
    ]
    return list.sort((a, z) => a.key - z.key || a.tie - z.tie)
  }, [buildings, town])

  return (
    <svg
      viewBox={`${world.minX} ${world.minY} ${worldW} ${worldH}`}
      width={worldW}
      height={worldH}
      className="relative block overflow-visible" /* positioned, so it paints above the (positioned) space layer */
      role="group"
      aria-label="Carte de la ville"
      style={{ direction: "ltr" }}
    >
      <defs>
        <filter id="map-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>
        <filter id="map-blur-lg" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>

      <GroundLayer ground={town.ground} shape={shape} />
      <Shadows buildings={buildings} props={town.props} />

      {/* rings sit on the ground under the selected / hovered building */}
      {buildings.map((b) =>
        b.id === selectedId || b.id === hoveredId ? (
          <polygon
            key={`ring-${b.id}`}
            className={b.id === selectedId ? "map-ring is-selected" : "map-ring"}
            points={diamond(b.x - 0.12, b.y - 0.12, b.w + 0.24, b.h + 0.24)}
          />
        ) : null,
      )}

      {drawables.map((d) =>
        d.b ? (
          <BuildingNode key={d.id} b={d.b} selected={d.b.id === selectedId} hovered={d.b.id === hoveredId} onKeySelect={onKeySelect} />
        ) : (
          <PropArt key={d.id} p={d.p!} />
        ),
      )}

      {buildings.map((b) => (
        <Label key={`label-${b.id}`} b={b} active={b.id === selectedId || b.id === hoveredId} />
      ))}
    </svg>
  )
}

const BuildingNode = memo(function BuildingNode({
  b,
  selected,
  hovered,
  onKeySelect,
}: {
  b: Building
  selected: boolean
  hovered: boolean
  onKeySelect: (id: string) => void
}) {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onKeySelect(b.id)
    }
  }
  return (
    <g
      data-bid={b.id}
      className="map-bld"
      data-selected={selected || undefined}
      data-hover={hovered || undefined}
      role="button"
      tabIndex={0}
      aria-label={`${b.name.fr} — ${b.name.ar}, niveau ${b.level}`}
      aria-pressed={selected}
      onKeyDown={onKeyDown}
    >
      {/* an invisible hit area over the footprint, so gaps in the art still select */}
      <polygon points={diamond(b.x, b.y, b.w, b.h)} fill="transparent" />
      <g className="map-bld-body">
        <BuildingVisual b={b} />
      </g>
    </g>
  )
})

/** Soft, blurred, green-tinted shadows cast to the right (light from the top-left). */
const Shadows = memo(function Shadows({ buildings, props }: { buildings: Building[]; props: Prop[] }) {
  return (
    <g fill={SHADOW} filter="url(#map-blur)">
      {buildings.map((b) => {
        const H = b.kind === "stadium" ? 14 : wallHeight(b) + 12
        const ox = H / 46
        const oy = -H / 150
        const T = iso(b.x + 0.1, b.y + 0.1)
        const Rr = iso(b.x + b.w - 0.1, b.y + 0.1)
        const Bb = iso(b.x + b.w - 0.1, b.y + b.h - 0.1)
        const Ll = iso(b.x + 0.1, b.y + b.h - 0.1)
        const sh = (q: { x: number; y: number }) => {
          const d = iso(ox, oy)
          return `${round(q.x + d.x)},${round(q.y + d.y)}`
        }
        return <polygon key={b.id} points={`${Ll.x},${Ll.y} ${T.x},${T.y} ${sh(T)} ${sh(Rr)} ${sh(Bb)} ${Bb.x},${Bb.y}`} />
      })}
      <g fill="rgb(21 58 45 / 0.16)">{props.map(propShadow)}</g>
    </g>
  )
})

/**
 * The floating level badge — no name on the map (the name lives in the
 * building card). Main buildings always show theirs; houses only when hovered
 * or selected. The active one gets a lime ring. Counter-scaled around its
 * bottom centre by `--iz`.
 */
const Label = memo(function Label({ b, active }: { b: Building; active: boolean }) {
  // over delivered art, the badge sits on the image's visible top
  const sprite = useBuildingSprite(b)
  const alpha = useAlpha(sprite?.url ?? null)
  if (b.kind === "house" && !active) return null
  const h = sprite && alpha?.box ? spriteTop(b, alpha.box.top) : topHeight(b)
  const top = iso(b.x + b.w / 2, b.y + b.h / 2, h + 6)
  const locked = b.level === 0
  return (
    <g transform={`translate(${round(top.x)} ${round(top.y)})`} className="map-label-anchor" data-bid={b.id}>
      <g className={active ? "map-label is-active" : "map-label"} aria-hidden="true">
        {active && <circle cx={0} cy={-11} r={12} fill={C.cta} stroke={C.ctaEdge} strokeWidth={2} />}
        <circle cx={0} cy={-11} r={9} fill={locked ? C.rock : C.ink} stroke="#fff" strokeWidth={2} />
        <text x={0} y={-7.3} textAnchor="middle" fontSize={10.5} fontWeight={800} fill="#fff">
          {locked ? "–" : b.level}
        </text>
      </g>
    </g>
  )
})
