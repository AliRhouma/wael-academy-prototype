import { memo } from "react"
import { hash, round } from "./iso"
import { C } from "./palette"
import { PLANET_PX } from "./Ground"
import { WORLDS } from "./TownMap"
import type { TownShape } from "./townLayout"

/**
 * The space the town floats in: a finite field of stars, a few soft nebulae,
 * three small planets and a glow around the town — under the island, or as an
 * atmosphere hugging the round planet. It lives in world pixels, in the same
 * wrapper as the town, so it pans and zooms with it; the camera
 * (`useCamera`'s `space`) stops at its edge — the end of the world.
 *
 * Everything is deterministic (`hash`), so the sky is the same on every load.
 * Colours are palette values (`C`) on the dark backdrop set in `map.css`.
 */

type Rect = { minX: number; minY: number; maxX: number; maxY: number }

/** The finite area around the town the camera may roam (px). */
function spaceAround(world: Rect): Rect {
  const W = world.maxX - world.minX
  const H = world.maxY - world.minY
  return { minX: world.minX - W * 1.1, maxX: world.maxX + W * 1.1, minY: world.minY - H * 1.3, maxY: world.maxY + H * 1.3 }
}
export const SPACES: Record<TownShape, Rect> = { island: spaceAround(WORLDS.island), planet: spaceAround(WORLDS.planet) }

type Star = { x: number; y: number; r: number; o: number; tint: string }
type Sparkle = { x: number; y: number; r: number; delay: number }

const TINTS = ["#ffffff", "#ffffff", "#ffffff", C.sky, C.doneLine, C.blue] // mostly white, a few tinted

function makeSky(space: Rect) {
  const SW = space.maxX - space.minX
  const SH = space.maxY - space.minY
  const stars: Star[] = []
  for (let i = 0; i < 900; i++) {
    const c = hash(i, 37, 3)
    stars.push({
      x: space.minX + hash(i, 11, 1) * SW,
      y: space.minY + hash(i, 23, 2) * SH,
      // sizes skew small: many faint dots, a few bright ones
      r: 2.6 + Math.pow(c, 3) * 5,
      o: 0.35 + hash(i, 41, 4) * 0.6,
      tint: TINTS[Math.floor(hash(i, 53, 5) * TINTS.length)],
    })
  }
  const sparkles: Sparkle[] = []
  for (let i = 0; i < 40; i++) {
    sparkles.push({
      x: space.minX + hash(i, 61, 6) * SW,
      y: space.minY + hash(i, 67, 7) * SH,
      r: 7 + hash(i, 71, 8) * 9,
      delay: hash(i, 73, 9) * 4,
    })
  }
  return { stars, sparkles }
}
const SKIES = { island: makeSky(SPACES.island), planet: makeSky(SPACES.planet) }

/** A four-point sparkle, centred on (0, 0). */
const sparklePath = (r: number) => {
  const k = r * 0.22
  return `M0 ${-r}Q${k} ${-k} ${r} 0Q${k} ${k} 0 ${r}Q${-k} ${k} ${-r} 0Q${-k} ${-k} 0 ${-r}z`
}

export const SpaceLayer = memo(function SpaceLayer({ shape }: { shape: TownShape }) {
  const world = WORLDS[shape]
  const space = SPACES[shape]
  const sky = SKIES[shape]
  const W = world.maxX - world.minX
  const H = world.maxY - world.minY
  const SW = space.maxX - space.minX
  const SH = space.maxY - space.minY
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute block"
      style={{ left: space.minX - world.minX, top: space.minY - world.minY, direction: "ltr" }}
      width={SW}
      height={SH}
      viewBox={`${space.minX} ${space.minY} ${SW} ${SH}`}
    >
      <defs>
        <radialGradient id="space-neb-teal">
          <stop offset="0" stopColor={C.brand} stopOpacity="0.38" />
          <stop offset="1" stopColor={C.brand} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="space-neb-violet">
          <stop offset="0" stopColor={C.violet} stopOpacity="0.32" />
          <stop offset="1" stopColor={C.violet} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="space-glow">
          <stop offset="0" stopColor={C.cta} stopOpacity="0.28" />
          <stop offset="0.55" stopColor={C.brand} stopOpacity="0.16" />
          <stop offset="1" stopColor={C.brand} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="space-planet-violet" cx="0.35" cy="0.3">
          <stop offset="0" stopColor={C.violet} />
          <stop offset="1" stopColor={C.violetDeep} />
        </radialGradient>
        <radialGradient id="space-planet-orange" cx="0.35" cy="0.3">
          <stop offset="0" stopColor={C.doneLine} />
          <stop offset="1" stopColor={C.done} />
        </radialGradient>
        <radialGradient id="space-planet-teal" cx="0.35" cy="0.3">
          <stop offset="0" stopColor={C.sky} />
          <stop offset="1" stopColor={C.brand} />
        </radialGradient>
      </defs>

      {/* nebulae: big soft clouds, far from each other */}
      <ellipse cx={space.minX + SW * 0.2} cy={space.minY + SH * 0.25} rx={W * 0.9} ry={H * 0.7} fill="url(#space-neb-violet)" />
      <ellipse cx={space.minX + SW * 0.82} cy={space.minY + SH * 0.7} rx={W * 1.0} ry={H * 0.8} fill="url(#space-neb-teal)" />
      <ellipse cx={space.minX + SW * 0.7} cy={space.minY + SH * 0.12} rx={W * 0.6} ry={H * 0.45} fill="url(#space-neb-teal)" />
      <ellipse cx={space.minX + SW * 0.15} cy={space.minY + SH * 0.85} rx={W * 0.7} ry={H * 0.5} fill="url(#space-neb-violet)" />

      {/* stars */}
      <g>
        {sky.stars.map((s, i) => (
          <circle key={i} cx={round(s.x)} cy={round(s.y)} r={round(s.r)} fill={s.tint} opacity={round(s.o)} />
        ))}
      </g>
      <g className="space-sparkles">
        {sky.sparkles.map((s, i) => (
          <g key={i} transform={`translate(${round(s.x)} ${round(s.y)})`}>
            {/* the CSS twinkle scales the path around its own centre, inside the translate */}
            <path d={sparklePath(s.r)} fill="#ffffff" style={{ animationDelay: `${round(s.delay)}s` }} />
          </g>
        ))}
      </g>

      {/* planets */}
      <g>
        {/* ringed violet planet, top left */}
        <g transform={`translate(${round(world.minX - W * 0.55)} ${round(world.minY - H * 0.55)})`}>
          <ellipse rx={150} ry={34} fill="none" stroke={C.doneLine} strokeOpacity={0.55} strokeWidth={10} transform="rotate(-18)" />
          <circle r={88} fill="url(#space-planet-violet)" />
          <path d="M-150 0A150 34 0 0 0 150 0" fill="none" stroke={C.doneLine} strokeOpacity={0.85} strokeWidth={10} transform="rotate(-18)" />
        </g>
        {/* small orange planet, bottom right */}
        <g transform={`translate(${round(world.maxX + W * 0.45)} ${round(world.maxY + H * 0.6)})`}>
          <circle r={62} fill="url(#space-planet-orange)" />
          <circle cx={-18} cy={10} r={11} fill={C.done} opacity={0.5} />
          <circle cx={20} cy={-16} r={7} fill={C.done} opacity={0.45} />
        </g>
        {/* teal moon, right */}
        <g transform={`translate(${round(world.maxX + W * 0.7)} ${round(world.minY - H * 0.2)})`}>
          <circle r={38} fill="url(#space-planet-teal)" />
        </g>
      </g>

      {shape === "planet" ? <PlanetAtmosphere /> : <IslandGlow world={world} />}
    </svg>
  )
})

/** The soft glow under the floating island. */
function IslandGlow({ world }: { world: Rect }) {
  const W = world.maxX - world.minX
  const H = world.maxY - world.minY
  return <ellipse cx={(world.minX + world.maxX) / 2} cy={(world.minY + world.maxY) / 2 + H * 0.12} rx={W * 0.7} ry={H * 0.75} fill="url(#space-glow)" />
}

/** The round planet's atmosphere: a soft halo and a thin ring hugging its silhouette. */
function PlanetAtmosphere() {
  const { cx, rx } = PLANET_PX
  const pTop = PLANET_PX.cy - PLANET_PX.ry
  const pBottom = PLANET_PX.cy + PLANET_PX.ry + PLANET_PX.depth
  const pcy = (pTop + pBottom) / 2
  const pry = (pBottom - pTop) / 2
  return (
    <>
      <ellipse cx={cx} cy={pcy} rx={rx * 1.45} ry={pry * 1.45} fill="url(#space-glow)" />
      <ellipse cx={cx} cy={pcy} rx={rx + 14} ry={pry + 14} fill="none" stroke={C.sky} strokeOpacity={0.22} strokeWidth={10} />
    </>
  )
}
