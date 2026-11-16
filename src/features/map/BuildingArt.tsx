import type { ReactNode } from "react"
import { diamond, HALF_W, iso, poly, round, type Footprint } from "./iso"
import { C, LINE, shade } from "./palette"
import { Box, Dome, Door, Flag, Gable, LeftFace, Pole, Pyramid, RightFace, Sign, Windows, faceWidth } from "./shapes"
import type { Building } from "./townLayout"

/**
 * The ONE place a building is drawn, keyed by `kind`. Every kind is built from
 * the iso primitives in `shapes.tsx`, in world coordinates, standing on its
 * footprint. Heights grow a little with the level so an upgrade shows.
 *
 * `BuildingVisual` is what the map renders: the code-drawn art, or — when the
 * building carries a `sprite` — that image instead (see `SpriteBuilding`).
 */
export function BuildingVisual({ b }: { b: Building }) {
  return b.sprite ? <SpriteBuilding b={b} /> : <BuildingArt b={b} />
}

/** A real asset, bottom-anchored on the footprint's bottom corner. */
export function SpriteBuilding({ b }: { b: Building }) {
  const left = iso(b.x, b.y + b.h)
  const right = iso(b.x + b.w, b.y)
  const bottom = iso(b.x + b.w, b.y + b.h)
  const width = (right.x - left.x) * (b.spriteScale ?? 1)
  const height = width * 2 // tall box; the image keeps its own ratio inside it
  const cx = (left.x + right.x) / 2
  return (
    <image
      href={b.sprite}
      x={round(cx - width / 2)}
      y={round(bottom.y + (b.spriteOffsetY ?? 0) - height)}
      width={round(width)}
      height={round(height)}
      preserveAspectRatio="xMidYMax meet"
    />
  )
}

/** Wall height (to the eaves) of a building at its current level. */
export function wallHeight(b: Building): number {
  const L = b.level
  switch (b.kind) {
    case "school":
      return 44 + L * 4
    case "library":
      return 36 + L * 4
    case "lab":
      return 34 + L * 4
    case "mathTower":
      return 62 + L * 12
    case "music":
      return 30 + L * 3
    case "stadium":
      return 10 + L * 2
    case "greenhouse":
      return 20 + L * 2
    case "cafe":
      return 26
    case "arena":
      return L > 0 ? 12 + L * 2 : 4
    case "house":
      return 20 + L * 4
    case "shop":
      return 34
  }
}

/** The highest point of the art — where the label and level badge sit. */
export function topHeight(b: Building): number {
  const H = wallHeight(b)
  switch (b.kind) {
    case "school":
      return H + 64
    case "library":
      return H + Math.min(b.level + 1, 6) * 7 + 4
    case "lab":
      return H + 30
    case "mathTower":
      return H + 22 + 26
    case "music":
      return H + 24
    case "stadium":
      return 46
    case "greenhouse":
      return H + 20
    case "cafe":
      return H + 16
    case "arena":
      return b.level > 0 ? H + 22 : 40
    case "house":
      return H + 22
    case "shop":
      return H + 3 + shopUpperH(b) + 2 + 18 + 3
  }
}

const fp = (b: Building): Footprint => ({ x: b.x, y: b.y, w: b.w, h: b.h })
const inset = (f: Footprint, d: number): Footprint => ({ x: f.x + d, y: f.y + d, w: f.w - 2 * d, h: f.h - 2 * d })

/** A light stone plinth under a building's walls. */
function Plinth({ f }: { f: Footprint }) {
  return <Box f={inset(f, 0.04)} H={3} color={C.stone} />
}

export function BuildingArt({ b }: { b: Building }) {
  const f = fp(b)
  switch (b.kind) {
    case "school":
      return <School b={b} f={f} />
    case "library":
      return <Library b={b} f={f} />
    case "lab":
      return <Lab b={b} f={f} />
    case "mathTower":
      return <MathTower b={b} f={f} />
    case "music":
      return <Music b={b} f={f} />
    case "stadium":
      return <Stadium b={b} f={f} />
    case "greenhouse":
      return <Greenhouse b={b} f={f} />
    case "cafe":
      return <Cafe b={b} f={f} />
    case "arena":
      return <Arena b={b} f={f} />
    case "house":
      return <House b={b} f={f} />
    case "shop":
      return <Shop b={b} f={f} />
  }
}

type ArtProps = { b: Building; f: Footprint }

/** A coloured band along the bottom of both walls. */
function Band({ f, z = 0, h, color }: { f: Footprint; z?: number; h: number; color: string }) {
  return (
    <>
      <LeftFace f={f} z={z}>
        <rect x={0} y={-h} width={faceWidth(f, "left")} height={h} fill={color} />
      </LeftFace>
      <RightFace f={f} z={z}>
        <rect x={0} y={-h} width={faceWidth(f, "right")} height={h} fill={shade(color, -0.16)} />
      </RightFace>
    </>
  )
}

/* ---------------------------------------------------------------- school */
function School({ b, f }: ArtProps) {
  const body = inset(f, 0.15)
  const H = wallHeight(b)
  const tower: Footprint = { x: body.x + body.w / 2 - 0.4, y: body.y + body.h / 2 - 0.4, w: 0.8, h: 0.8 }
  const tH = 40
  const tc = { gx: tower.x + 0.4, gy: tower.y + 0.4 }
  const clock = iso(tower.x + 0.4, tower.y + tower.h, H + tH - 12)
  return (
    <g>
      <Plinth f={inset(f, 0.08)} />
      <Box f={body} z={3} H={H} color={C.wall} />
      <Band f={body} z={3} h={9} color={C.brand} />
      <Windows f={body} side="left" z={3} rows={2} cols={6} bottom={15} floor={17} skip={(r, c) => r === 0 && (c === 2 || c === 3)} />
      <Windows f={body} side="right" z={3} rows={2} cols={6} bottom={15} floor={17} />
      <Door f={body} at={0.5} w={14} h={20} arch />
      {b.sign && <Sign f={body} z={3} y={-H + 9} text={b.sign} size={8.5} color={C.doneLine} />}
      <Gable f={body} z={H + 3} rise={26} color={C.brand} ridge="x" />
      {/* bell tower on the ridge */}
      <Box f={tower} z={H + 3} H={tH} color={C.wall} />
      <Pyramid f={{ x: tower.x - 0.06, y: tower.y - 0.06, w: tower.w + 0.12, h: tower.h + 0.12 }} z={H + 3 + tH} rise={14} color={C.deep} />
      <g transform={`matrix(1 0.5 0 1 ${clock.x} ${clock.y})`}>
        <circle cx={0} cy={0} r={5} fill="#fff" stroke={C.ink} strokeOpacity={0.6} strokeWidth={1} />
        <path d="M0 0V-3.2M0 0h2.4" stroke={C.ink} strokeWidth={1} strokeLinecap="round" />
      </g>
      <Flag gx={tc.gx} gy={tc.gy} z={H + 3 + tH + 14} H={14} color={C.cta} />
    </g>
  )
}

/* --------------------------------------------------------------- library */
function Library({ b, f }: ArtProps) {
  const body = inset(f, 0.12)
  const H = wallHeight(b)
  const books = Math.min(b.level + 1, 6)
  const cols = [C.violetDeep, C.done, C.brand, C.blue, C.cta, C.ink]
  const parapet = inset(body, 0.1)
  return (
    <g>
      <Plinth f={inset(f, 0.06)} />
      <Box f={body} z={3} H={H} color={C.cream} />
      <Band f={body} z={3} h={7} color={C.violetDeep} />
      {/* tall windows like columns */}
      <Windows f={body} side="left" z={3} rows={1} cols={4} bottom={12} ww={6} wh={H - 26} skip={(_, c) => c === 1} />
      <Windows f={body} side="right" z={3} rows={1} cols={5} bottom={12} ww={6} wh={H - 26} />
      <Door f={body} at={0.375} w={11} h={17} color={C.violetDeep} arch />
      {b.sign && <Sign f={body} z={3} y={-H + 8} text={b.sign} color={C.violetDeep} ink="#fff" at={0.6} />}
      <polygon points={diamond(parapet.x, parapet.y, parapet.w, parapet.h, H + 1)} fill={shade(C.cream, -0.08)} {...LINE} />
      {/* the pile of books grows with the level */}
      {Array.from({ length: books }, (_, i) => {
        const wob = i % 2 ? 0.08 : -0.06
        const bf: Footprint = { x: body.x + 0.25 + wob, y: body.y + 0.55 - wob, w: 1.05, h: 1.45 }
        return <Box key={i} f={bf} z={H + 3 + i * 7} H={7} color={cols[i % cols.length]} top={shade(cols[i % cols.length], 0.35)} />
      })}
    </g>
  )
}

/* ------------------------------------------------------------------- lab */
function Lab({ b, f }: ArtProps) {
  const body = inset(f, 0.12)
  const H = wallHeight(b)
  const top = H + 3
  const chim = { x: body.x + 0.2, y: body.y + 0.25, w: 0.3, h: 0.3 }
  const smoke = iso(chim.x + 0.15, chim.y + 0.15, top + 22)
  return (
    <g>
      <Plinth f={inset(f, 0.06)} />
      <Box f={body} z={3} H={H} color={C.physics} />
      <Windows f={body} side="left" z={3} rows={2} cols={3} bottom={12} floor={15} ww={9} wh={8} skip={(r, c) => r === 0 && c === 1} />
      <Windows f={body} side="right" z={3} rows={2} cols={3} bottom={12} floor={15} ww={9} wh={8} />
      <Door f={body} at={0.5} w={11} h={16} color={C.ink} />
      {b.sign && <Sign f={body} z={3} y={-H + 6} text={b.sign} color="#fff" />}
      <Box f={chim} z={top} H={22} color={C.wall} />
      <Dome gx={body.x + body.w * 0.6} gy={body.y + body.h * 0.6} z={top} rx={20} h={22} color={C.glass} />
      {/* bubbles from the chimney — one more per level */}
      {Array.from({ length: Math.min(b.level + 1, 5) }, (_, i) => (
        <circle key={i} className="map-bubble" style={{ animationDelay: `${i * -0.7}s` }} cx={smoke.x + (i % 2 ? 4 : -3)} cy={smoke.y - 6 - i * 7} r={3.2 - i * 0.3} fill={i % 2 ? C.violet : C.cta} stroke={C.ink} strokeOpacity={0.35} strokeWidth={0.8} />
      ))}
    </g>
  )
}

/* ------------------------------------------------------------ math tower */
function MathTower({ b, f }: ArtProps) {
  const body = inset(f, 0.22)
  const H = wallHeight(b)
  const crown = inset(body, 0.14)
  const bands = Math.floor(H / 24)
  const tc = { gx: crown.x + crown.w / 2, gy: crown.y + crown.h / 2 }
  const scope = iso(tc.gx, tc.gy, H + 3 + 22 + 18)
  return (
    <g>
      <Plinth f={inset(f, 0.12)} />
      <Box f={body} z={3} H={H} color={C.wall} />
      {Array.from({ length: bands }, (_, i) => (
        <Band key={i} f={body} z={3 + 18 + i * 24} h={5} color={C.leaf} />
      ))}
      <Windows f={body} side="left" z={3} rows={bands} cols={2} bottom={27} floor={24} ww={6} wh={9} />
      <Windows f={body} side="right" z={3} rows={bands} cols={2} bottom={27} floor={24} ww={6} wh={9} />
      <Door f={body} at={0.5} w={10} h={14} color={C.leaf} arch />
      {b.sign && (
        <LeftFace f={body} z={3}>
          <text x={faceWidth(body, "left") / 2} y={-H + 10} textAnchor="middle" fontSize={15} fontWeight={900} fill={C.leaf} fontFamily="Georgia, serif">
            {b.sign}
          </text>
        </LeftFace>
      )}
      <Box f={crown} z={H + 3} H={22} color={C.leaf} />
      <Windows f={crown} side="left" z={H + 3} rows={1} cols={3} bottom={6} ww={5} wh={8} color={C.cta} />
      <Windows f={crown} side="right" z={H + 3} rows={1} cols={3} bottom={6} ww={5} wh={8} color={C.cta} />
      {/* the observatory */}
      <Dome gx={tc.gx} gy={tc.gy} z={H + 3 + 22} rx={19} h={20} color={C.sky} />
      <g transform={`rotate(-34 ${scope.x} ${scope.y})`}>
        <rect x={scope.x - 3} y={scope.y - 22} width={6} height={22} rx={2} fill={C.ink} />
        <rect x={scope.x - 4.5} y={scope.y - 25} width={9} height={5} rx={1.5} fill={C.cta} stroke={C.ink} strokeOpacity={0.6} strokeWidth={0.8} />
      </g>
    </g>
  )
}

/* ----------------------------------------------------------------- music */
function Music({ b, f }: ArtProps) {
  const body = inset(f, 0.14)
  const H = wallHeight(b)
  const wallC = shade(C.violet, 0.45)
  const note = iso(body.x + body.w / 2, body.y + body.h, H + 3 + 12)
  return (
    <g>
      <Plinth f={inset(f, 0.08)} />
      <Box f={body} z={3} H={H} color={wallC} />
      <Windows f={body} side="right" z={3} rows={1} cols={3} bottom={10} ww={7} wh={11} color={C.glass} />
      <Windows f={body} side="left" z={3} rows={1} cols={4} bottom={10} ww={6} wh={11} skip={(_, c) => c === 1 || c === 2} />
      <Door f={body} at={0.5} w={12} h={17} color={C.violetDeep} arch />
      {b.sign && <Sign f={body} z={3} y={-H + 6} text={b.sign} color={C.doneLine} />}
      <Gable f={body} z={H + 3} rise={24} color={C.violetDeep} ridge="y" />
      {/* a round window with a note, in the gable */}
      <g transform={`matrix(1 0.5 0 1 ${note.x} ${note.y})`}>
        <circle r={6} fill="#fff" stroke={C.ink} strokeOpacity={0.6} strokeWidth={1} />
        <text y={3.5} textAnchor="middle" fontSize={10} fontWeight={900} fill={C.violetDeep}>
          ♪
        </text>
      </g>
    </g>
  )
}

/* --------------------------------------------------------------- stadium */
function Stadium({ b, f }: ArtProps) {
  const field = inset(f, 0.12)
  const standH = wallHeight(b)
  const stripes: ReactNode[] = []
  const n = 8
  for (let i = 0; i < n; i++) {
    const y0 = field.y + (i / n) * field.h
    stripes.push(<polygon key={i} points={diamond(field.x, y0, field.w, field.h / n, 0.5)} fill={i % 2 ? C.grassDeep : shade(C.grassDeep, 0.14)} />)
  }
  const line = { fill: "none", stroke: "#fff", strokeWidth: 1.4, strokeOpacity: 0.95 } as const
  const lf = inset(field, 0.12)
  const mid = lf.y + lf.h / 2
  const cc = iso(lf.x + lf.w / 2, mid, 0.5)
  const standBack: Footprint = { x: f.x, y: f.y - 0.02, w: f.w, h: 0.32 }
  const standSide: Footprint = { x: f.x - 0.02, y: f.y + 0.3, w: 0.32, h: f.h - 0.3 }
  return (
    <g>
      <polygon points={diamond(f.x, f.y, f.w, f.h, 0.5)} fill={C.curb} {...LINE} />
      {stripes}
      <polygon points={diamond(lf.x, lf.y, lf.w, lf.h, 0.5)} {...line} />
      <polyline points={poly([[lf.x, mid, 0.5], [lf.x + lf.w, mid, 0.5]])} {...line} />
      <ellipse cx={cc.x} cy={cc.y} rx={12} ry={6} {...line} />
      <polygon points={diamond(lf.x + lf.w * 0.25, lf.y, lf.w * 0.5, 0.35, 0.5)} {...line} />
      <polygon points={diamond(lf.x + lf.w * 0.25, lf.y + lf.h - 0.35, lf.w * 0.5, 0.35, 0.5)} {...line} />
      {/* stands on the two back edges, taller with the level */}
      <Box f={standBack} H={standH} color={C.brand} />
      <Box f={standSide} H={standH} color={C.brand} />
      {Array.from({ length: 3 }, (_, i) => (
        <polyline key={i} points={poly([[standSide.x + standSide.w, standSide.y, standH * (i + 1) / 4], [standSide.x + standSide.w, standSide.y + standSide.h, standH * (i + 1) / 4]])} fill="none" stroke="#fff" strokeOpacity={0.5} strokeWidth={1} />
      ))}
      {/* floodlights */}
      {[
        [f.x + f.w - 0.1, f.y + 0.1],
        [f.x + 0.1, f.y + f.h - 0.1],
      ].map(([gx, gy], i) => {
        const head = iso(gx, gy, 44)
        return (
          <g key={i}>
            <Pole gx={gx} gy={gy} H={42} color={C.ink} width={1.8} />
            <rect x={head.x - 6} y={head.y - 4} width={12} height={6} rx={1.5} fill={C.doneLine} stroke={C.ink} strokeOpacity={0.6} strokeWidth={1} />
          </g>
        )
      })}
    </g>
  )
}

/* ------------------------------------------------------------ greenhouse */
function Greenhouse({ b, f }: ArtProps) {
  const body = inset(f, 0.14)
  const H = wallHeight(b)
  const plants = Math.min(2 + b.level * 2, 9)
  const mullions = (side: "left" | "right") => {
    const W = faceWidth(body, side)
    const n = Math.round(W / 11)
    const Face = side === "left" ? LeftFace : RightFace
    return (
      <Face f={body} z={3}>
        {Array.from({ length: n - 1 }, (_, i) => (
          <line key={i} x1={((i + 1) * W) / n} y1={0} x2={((i + 1) * W) / n} y2={-H} stroke="#fff" strokeWidth={1.2} opacity={0.9} />
        ))}
        <line x1={0} y1={-H / 2} x2={W} y2={-H / 2} stroke="#fff" strokeWidth={1.2} opacity={0.9} />
      </Face>
    )
  }
  return (
    <g>
      <Plinth f={inset(f, 0.08)} />
      {/* plants first — the glass is see-through */}
      {Array.from({ length: plants }, (_, i) => {
        const gx = body.x + 0.25 + (i % 3) * 0.55
        const gy = body.y + 0.3 + Math.floor(i / 3) * 0.5
        const c = iso(gx, gy, 3)
        return <circle key={i} cx={c.x} cy={c.y - 7} r={6 + (i % 2) * 2} fill={i % 2 ? C.leaf : C.leafLight} stroke={C.ink} strokeOpacity={0.35} strokeWidth={1} />
      })}
      <Box f={body} z={3} H={H} color={C.sky} opacity={0.72} />
      {mullions("left")}
      {mullions("right")}
      <g opacity={0.8}>
        <Gable f={body} z={H + 3} rise={20} color={C.glass} ridge="x" overhang={0.02} />
      </g>
      <Door f={body} at={0.5} w={10} h={14} color={C.leaf} />
    </g>
  )
}

/* ------------------------------------------------------------------ café */
function Cafe({ b, f }: ArtProps) {
  const body = inset(f, 0.1)
  const H = wallHeight(b)
  const segs = 6
  const awning: ReactNode[] = []
  for (let i = 0; i < segs; i++) {
    const x0 = body.x + (i / segs) * body.w
    const x1 = body.x + ((i + 1) / segs) * body.w
    const y = body.y + body.h
    awning.push(<polygon key={i} points={poly([[x0, y, H - 4], [x1, y, H - 4], [x1, y + 0.3, H - 13], [x0, y + 0.3, H - 13]])} fill={i % 2 ? "#fff" : C.done} stroke={C.ink} strokeOpacity={0.4} strokeWidth={0.8} />)
  }
  const W = faceWidth(body, "left")
  return (
    <g>
      <Plinth f={inset(f, 0.04)} />
      <Box f={body} z={3} H={H} color={C.peach} />
      <LeftFace f={body} z={3}>
        <rect x={W * 0.12} y={-17} width={W * 0.42} height={12} rx={1.5} fill={C.glass} stroke={C.ink} strokeOpacity={0.5} strokeWidth={1} />
      </LeftFace>
      <Door f={body} at={0.75} w={10} h={15} color={C.deep} />
      <Windows f={body} side="right" z={3} rows={1} cols={1} bottom={6} ww={9} wh={10} />
      {awning}
      {b.sign && (
        <LeftFace f={body} z={H + 3}>
          <rect x={W / 2 - 18} y={-14} width={36} height={13} rx={3} fill={C.deep} stroke={C.ink} strokeOpacity={0.6} strokeWidth={1} />
          <text x={W / 2} y={-4.5} textAnchor="middle" fontSize={8.5} fontWeight={800} fill={C.doneLine} direction="rtl">
            {b.sign}
          </text>
        </LeftFace>
      )}
    </g>
  )
}

/* ----------------------------------------------------------------- arena */
function Arena({ b, f }: ArtProps) {
  if (b.level > 0) {
    const c = iso(f.x + f.w / 2, f.y + f.h / 2)
    const H = wallHeight(b)
    const rx = ((f.w + f.h) * HALF_W) / 2 - 8
    const ry = rx / 2
    return (
      <g>
        <ellipse cx={c.x} cy={c.y} rx={rx} ry={ry} fill={shade(C.doneLine, -0.2)} {...LINE} />
        <path d={`M${c.x - rx} ${c.y}v${-H}a${rx} ${ry} 0 0 1 ${rx * 2} 0v${H}a${rx} ${ry} 0 0 1 ${-rx * 2} 0z`} fill={C.doneLine} {...LINE} />
        <ellipse cx={c.x} cy={c.y - H} rx={rx} ry={ry} fill={shade(C.doneLine, 0.3)} {...LINE} />
        <ellipse cx={c.x} cy={c.y - H + 2} rx={rx * 0.68} ry={ry * 0.68} fill={C.cta} {...LINE} />
        <Flag gx={f.x + 0.3} gy={f.y + f.h / 2} z={H} H={18} color={C.brand} />
        <Flag gx={f.x + f.w - 0.3} gy={f.y + f.h / 2} z={H} H={18} color={C.live} />
      </g>
    )
  }
  // level 0 — the chantier: a slab, scaffolding, a « soon » board, cones
  const slab = inset(f, 0.1)
  const sH = 34
  const corners: [number, number][] = [
    [slab.x + 0.1, slab.y + 0.1],
    [slab.x + slab.w - 0.1, slab.y + 0.1],
    [slab.x + slab.w - 0.1, slab.y + slab.h - 0.1],
    [slab.x + 0.1, slab.y + slab.h - 0.1],
  ]
  const bar = { stroke: C.done, strokeWidth: 2.2, strokeLinecap: "round" as const }
  const W = faceWidth(slab, "left")
  return (
    <g>
      <Box f={slab} H={4} color={C.stone} />
      <polygon points={diamond(slab.x + 0.15, slab.y + 0.15, slab.w - 0.3, slab.h - 0.3, 4.2)} fill="none" stroke={C.ink} strokeOpacity={0.25} strokeDasharray="4 4" strokeWidth={1.2} />
      {corners.map(([gx, gy], i) => (
        <Pole key={i} gx={gx} gy={gy} z={4} H={sH} color={C.done} width={2.4} />
      ))}
      {[sH * 0.5, sH].map((z) => (
        <polygon key={z} points={poly(corners.map(([gx, gy]) => [gx, gy, 4 + z] as const))} fill="none" {...bar} />
      ))}
      <LeftFace f={{ ...slab, x: slab.x + 0.1, w: slab.w - 0.2, y: slab.y - 0.1 }} z={4}>
        <line x1={0} y1={0} x2={W * 0.5} y2={-sH * 0.5} {...bar} strokeWidth={1.6} />
        <line x1={W * 0.5} y1={0} x2={W} y2={-sH * 0.5} {...bar} strokeWidth={1.6} />
      </LeftFace>
      {b.sign && <Sign f={slab} z={4} y={-8} text={b.sign} color={C.doneLine} at={0.3} size={8} />}
      {[0.55, 0.8].map((u, i) => {
        const c = iso(slab.x + slab.w * u, slab.y + slab.h + 0.12)
        return <path key={i} d={`M${c.x - 3.5} ${c.y}L${c.x} ${c.y - 10}L${c.x + 3.5} ${c.y}z`} fill={C.done} stroke={C.ink} strokeOpacity={0.5} strokeWidth={0.8} />
      })}
    </g>
  )
}

/* ----------------------------------------------------------------- house */
const ROOFS = [C.done, C.violetDeep, C.brand, C.deep]
function House({ b, f }: ArtProps) {
  const body = inset(f, 0.16)
  const H = wallHeight(b)
  const roof = ROOFS[b.id.length % ROOFS.length]
  const ridge = f.w >= f.h ? "x" : "y"
  const chim: Footprint = { x: body.x + body.w * 0.62, y: body.y + 0.12, w: 0.18, h: 0.18 }
  return (
    <g>
      <Plinth f={inset(f, 0.1)} />
      <Box f={body} z={3} H={H} color={b.color ?? C.cream} />
      <Windows f={body} side="left" z={3} rows={Math.max(1, Math.floor(H / 16))} cols={f.w * 2} bottom={8} floor={14} ww={6} wh={7} skip={(r, c) => r === 0 && c === 0} />
      <Windows f={body} side="right" z={3} rows={Math.max(1, Math.floor(H / 16))} cols={f.h * 2} bottom={8} floor={14} ww={6} wh={7} />
      <Door f={body} at={0.25 / f.w} w={8} h={12} color={roof} />
      <Box f={chim} z={H + 3} H={18} color={shade(C.peach, -0.25)} />
      <Gable f={body} z={H + 3} rise={18} color={roof} ridge={ridge} />
    </g>
  )
}

/* ------------------------------------------------------------------ shop */
/**
 * La boutique: a grey ground floor with two cross-barred windows, a red door
 * with a porthole and a drainpipe; a red & white striped awning wrapping the
 * two visible walls; an upper storey with portholes between striped fabric
 * wings; a grey brick block on top. Colours come from the palette (live red,
 * rock grey, wood trim, peach), shaded — no new hue. "#ffffff" is the white of
 * the stripes, as in the café awning.
 */
function shopUpperH(b: Building) {
  return 14 + b.level * 2
}

function Shop({ b, f }: ArtProps) {
  const body = inset(f, 0.12)
  const H1 = wallHeight(b)
  const H2 = shopUpperH(b)
  const upper = inset(body, 0.14)
  const brick = inset(upper, 0.04)
  const H3 = 18
  const red = C.live
  const redDark = shade(red, -0.14)
  const white = "#ffffff" // six digits: shade() parses 6-digit hex only
  const whiteDark = shade(white, -0.1)
  const wallLo = shade(C.rock, 0.5)
  const wallHi = shade(C.peach, 0.45)
  const trim = C.wood
  const pipe = shade(C.rock, -0.5)
  const Wl = faceWidth(body, "left")
  const Wr = faceWidth(body, "right")
  const zU = 3 + H1 // upper storey floor
  const stripe = (i: number, dark: boolean) => (i % 2 ? (dark ? whiteDark : white) : dark ? redDark : red)

  // the wrap-around awning: sloped stripes on both walls, mitred at the corner
  const d = 0.28 // how far it reaches out, in tiles
  const zT = 3 + H1 - 1 // where it meets the wall
  const zB = zT - 6 // its outer edge — high enough to leave the door and windows in view
  const n = 7
  const Y = body.y + body.h
  const X = body.x + body.w
  const awningLine = { stroke: C.ink, strokeOpacity: 0.35, strokeWidth: 0.8 }
  const leftAwning: ReactNode[] = []
  const rightAwning: ReactNode[] = []
  for (let i = 0; i < n; i++) {
    const t0 = i / n
    const t1 = (i + 1) / n
    leftAwning.push(
      <polygon
        key={i}
        points={poly([[body.x + t0 * body.w, Y, zT], [body.x + t1 * body.w, Y, zT], [body.x + t1 * (body.w + d), Y + d, zB], [body.x + t0 * (body.w + d), Y + d, zB]])}
        fill={stripe(i, false)}
        {...awningLine}
      />,
    )
    rightAwning.push(
      <polygon
        key={i}
        points={poly([[X, body.y + t0 * body.h, zT], [X, body.y + t1 * body.h, zT], [X + d, body.y + t1 * (body.h + d), zB], [X + d, body.y + t0 * (body.h + d), zB]])}
        fill={stripe(i, true)}
        {...awningLine}
      />,
    )
  }
  // the scalloped valance hanging from the awning's outer edge
  const outer: Footprint = { x: body.x, y: body.y, w: body.w + d, h: body.h + d }
  const valance = (len: number, reverse: boolean, dark: boolean) => {
    const seg = len / n
    const r = seg / 2
    return Array.from({ length: n }, (_, i) => {
      const x0 = i * seg
      const x1 = x0 + seg
      return (
        <path
          key={i}
          d={`M${round(x0)} 0H${round(x1)}V3A${round(r)} ${round(r * 0.75)} 0 0 1 ${round(x0)} 3z`}
          fill={stripe(reverse ? n - 1 - i : i, dark)}
          {...awningLine}
        />
      )
    })
  }

  // bricks: staggered courses painted on the top block's walls
  const bricks = (W: number, dark: boolean) => {
    const out: ReactNode[] = []
    const rowH = 4.5
    const bw = 9
    for (let r = 0; r * rowH < H3 - 1; r++) {
      const y = -(r + 1) * rowH
      out.push(<line key={`h${r}`} x1={0} y1={round(y)} x2={round(W)} y2={round(y)} />)
      for (let x = r % 2 ? bw / 2 : bw; x < W; x += bw) out.push(<line key={`v${r}-${x}`} x1={round(x)} y1={round(y)} x2={round(x)} y2={round(y + rowH)} />)
    }
    return (
      <g stroke={shade(C.rock, dark ? -0.5 : -0.38)} strokeOpacity={0.55} strokeWidth={0.8}>
        {out}
      </g>
    )
  }

  // a porthole window with its cross bars
  const porthole = (cx: number, cy: number, r: number) => {
    const k = r * 0.7
    return (
      <g key={cx}>
        <circle cx={round(cx)} cy={round(cy)} r={r} fill={shade(C.brand, 0.45)} stroke={trim} strokeWidth={1.4} />
        <path d={`M${round(cx - k)} ${round(cy - k)}L${round(cx + k)} ${round(cy + k)}M${round(cx + k)} ${round(cy - k)}L${round(cx - k)} ${round(cy + k)}`} stroke={C.ink} strokeOpacity={0.6} strokeWidth={0.9} />
      </g>
    )
  }

  // a square window with a cross mullion
  const crossWindow = (x: number, w: number, h: number, bottom: number, dark: boolean) => (
    <g key={x}>
      <rect x={round(x)} y={-(bottom + h)} width={w} height={h} rx={1} fill={dark ? shade(C.glass, -0.12) : C.glass} stroke={trim} strokeWidth={1.3} />
      <path d={`M${round(x + w / 2)} ${-(bottom + h)}V${-bottom}M${round(x)} ${-(bottom + h / 2)}H${round(x + w)}`} stroke={trim} strokeWidth={1} />
    </g>
  )

  // striped fabric painted on the upper storey's walls
  const Wul = faceWidth(upper, "left")
  const Wur = faceWidth(upper, "right")
  const wing = 0.2 // share of the upper front taken by each fabric wing
  const fabric = (x0: number, x1: number, dark: boolean, key: string) => {
    const m = 4
    const w = (x1 - x0) / m
    return Array.from({ length: m }, (_, i) => <rect key={`${key}${i}`} x={round(x0 + i * w)} y={-H2} width={round(w)} height={H2} fill={stripe(i, dark)} />)
  }

  return (
    <g>
      <Plinth f={inset(f, 0.05)} />

      {/* ground floor */}
      <Box f={body} z={3} H={H1} color={wallLo} />
      <Band f={body} z={3 + H1} h={2.5} color={trim} />
      <LeftFace f={body} z={3}>
        {crossWindow(Wl * 0.1, 11, 10, 5, false)}
        {crossWindow(Wl * 0.34, 11, 10, 5, false)}
        <rect x={round(Wl * 0.64)} y={-16} width={12} height={16} rx={1.5} fill={red} stroke={C.ink} strokeOpacity={0.5} strokeWidth={1} />
        <circle cx={round(Wl * 0.64 + 6)} cy={-11.5} r={2.6} fill={C.glass} stroke={trim} strokeWidth={0.9} />
        <circle cx={round(Wl * 0.64 + 9.6)} cy={-6} r={0.9} fill={C.doneLine} />
        <path d={`M3 0V${-(H1 - 1)}l3 -2`} fill="none" stroke={pipe} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      </LeftFace>
      <RightFace f={body} z={3}>
        {crossWindow(Wr * 0.5 - 5.5, 11, 10, 5, true)}
      </RightFace>

      {/* upper storey: portholes between striped fabric wings */}
      <Box f={upper} z={zU} H={H2} color={wallHi} />
      <LeftFace f={upper} z={zU}>
        {fabric(0, Wul * wing, false, "l")}
        {fabric(Wul * (1 - wing), Wul, false, "r")}
        {[0.36, 0.5, 0.64].map((u) => porthole(Wul * u, -H2 / 2, Math.min(4, H2 / 2 - 2)))}
      </LeftFace>
      <RightFace f={upper} z={zU}>
        {fabric(0, Wur, true, "s")}
      </RightFace>
      <Band f={upper} z={zU + H2} h={2} color={trim} />

      {/* grey brick block on top, with its darker cap */}
      <Box f={brick} z={zU + H2} H={H3} color={shade(C.rock, -0.05)} />
      <LeftFace f={brick} z={zU + H2}>
        {bricks(faceWidth(brick, "left"), false)}
      </LeftFace>
      <RightFace f={brick} z={zU + H2}>
        {bricks(faceWidth(brick, "right"), true)}
      </RightFace>
      <Box f={inset(brick, -0.03)} z={zU + H2 + H3} H={2.5} color={shade(C.rock, -0.3)} />

      {/* the awning goes last: it hangs in front of the ground-floor walls */}
      {rightAwning}
      <RightFace f={outer} z={zB}>
        {valance(faceWidth(outer, "right"), true, true)}
      </RightFace>
      {leftAwning}
      <LeftFace f={outer} z={zB}>
        {valance(faceWidth(outer, "left"), false, false)}
      </LeftFace>
    </g>
  )
}
