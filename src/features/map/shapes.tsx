import type { ReactNode } from "react"
import { diamond, HALF_W, iso, leftFaceMatrix, poly, rightFaceMatrix, round, type Footprint } from "./iso"
import { C, faces, LINE, shade } from "./palette"

/**
 * Isometric drawing primitives — boxes, roofs, domes and the "face" frames
 * that let windows / doors / signs be drawn as flat rects on a wall.
 */

/** An iso box: left wall, right wall, top. */
export function Box({ f, z = 0, H, color, top, opacity }: { f: Footprint; z?: number; H: number; color: string; top?: string; opacity?: number }) {
  const c = faces(color)
  const { x, y, w, h } = f
  return (
    <g opacity={opacity}>
      <polygon points={poly([[x, y + h, z], [x + w, y + h, z], [x + w, y + h, z + H], [x, y + h, z + H]])} fill={c.left} {...LINE} />
      <polygon points={poly([[x + w, y + h, z], [x + w, y, z], [x + w, y, z + H], [x + w, y + h, z + H]])} fill={c.right} {...LINE} />
      <polygon points={diamond(x, y, w, h, z + H)} fill={top ?? c.top} {...LINE} />
    </g>
  )
}

/** Draw on the LEFT wall in flat coords: X 0 → w·32 along the wall, Y = 0 ground, −H top. */
export function LeftFace({ f, z = 0, children }: { f: Footprint; z?: number; children: ReactNode }) {
  return <g transform={leftFaceMatrix(f, z)}>{children}</g>
}
/** Draw on the RIGHT wall: X 0 → h·32 from the front corner toward the back. */
export function RightFace({ f, z = 0, children }: { f: Footprint; z?: number; children: ReactNode }) {
  return <g transform={rightFaceMatrix(f, z)}>{children}</g>
}

export const faceWidth = (f: Footprint, side: "left" | "right") => (side === "left" ? f.w : f.h) * HALF_W

/** A grid of windows on one wall. `skip(row, col)` leaves a gap (for a door). */
export function Windows({
  f,
  side,
  z = 0,
  rows,
  cols,
  bottom = 8,
  floor = 16,
  ww = 7,
  wh = 9,
  color = C.glass,
  skip,
}: {
  f: Footprint
  side: "left" | "right"
  z?: number
  rows: number
  cols: number
  bottom?: number
  floor?: number
  ww?: number
  wh?: number
  color?: string
  skip?: (r: number, c: number) => boolean
}) {
  const W = faceWidth(f, side)
  const fill = side === "right" ? shade(color, -0.12) : color
  const items: ReactNode[] = []
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (skip?.(r, c)) continue
      const cx = ((c + 0.5) / cols) * W
      const yb = -(bottom + r * floor)
      items.push(
        <g key={`${r}-${c}`}>
          <rect x={round(cx - ww / 2)} y={round(yb - wh)} width={ww} height={wh} rx={1.5} fill={fill} stroke={C.ink} strokeOpacity={0.5} strokeWidth={1} />
          <rect x={round(cx - ww / 2 + 1.2)} y={round(yb - wh + 1.2)} width={2} height={wh - 2.4} rx={1} fill="#fff" opacity={0.55} />
        </g>,
      )
    }
  const Face = side === "left" ? LeftFace : RightFace
  return (
    <Face f={f} z={z}>
      {items}
    </Face>
  )
}

/** A door on a wall, `at` = 0..1 along it. */
export function Door({ f, side = "left", z = 3, at = 0.5, w = 10, h = 15, color = C.deep, arch = false }: { f: Footprint; side?: "left" | "right"; z?: number; at?: number; w?: number; h?: number; color?: string; arch?: boolean }) {
  const W = faceWidth(f, side)
  const x = W * at - w / 2
  const Face = side === "left" ? LeftFace : RightFace
  return (
    <Face f={f} z={z}>
      {arch ? (
        <path d={`M${round(x)} 0V${-h + w / 2}a${w / 2} ${w / 2} 0 0 1 ${w} 0V0z`} fill={color} stroke={C.ink} strokeOpacity={0.5} strokeWidth={1} />
      ) : (
        <rect x={round(x)} y={-h} width={w} height={h} rx={1.5} fill={color} stroke={C.ink} strokeOpacity={0.5} strokeWidth={1} />
      )}
      <circle cx={round(x + w * 0.78)} cy={-h * 0.45} r={0.9} fill={C.doneLine} />
    </Face>
  )
}

/** A coloured sign plate with its text, painted on a wall. */
export function Sign({ f, side = "left", z = 0, y, text, color = C.doneLine, ink = C.ink, size = 8, at = 0.5, minW = 18, font }: { f: Footprint; side?: "left" | "right"; z?: number; y: number; text: string; color?: string; ink?: string; size?: number; at?: number; minW?: number; font?: string }) {
  const W = faceWidth(f, side)
  const pw = Math.min(W - 6, Math.max(minW, text.length * size * 0.56 + 10))
  const cx = W * at
  const Face = side === "left" ? LeftFace : RightFace
  return (
    <Face f={f} z={z}>
      <rect x={round(cx - pw / 2)} y={y - size - 2} width={round(pw)} height={size + 6} rx={3} fill={color} stroke={C.ink} strokeOpacity={0.55} strokeWidth={1} />
      <text x={round(cx)} y={y + 1.5} textAnchor="middle" fontSize={size} fontWeight={800} fill={ink} fontFamily={font} direction="rtl">
        {text}
      </text>
    </Face>
  )
}

/**
 * A pitched roof on a box top at height z. `ridge: "x"` runs the ridge along gx
 * (the gable end shows on the right wall); `"y"` along gy (gable on the left).
 */
export function Gable({ f, z, rise, color, ridge = "x", overhang = 0.08 }: { f: Footprint; z: number; rise: number; color: string; ridge?: "x" | "y"; overhang?: number }) {
  const o = overhang
  const x0 = f.x - o
  const y0 = f.y - o
  const x1 = f.x + f.w + o
  const y1 = f.y + f.h + o
  const lit = shade(color, 0.12)
  const dark = shade(color, -0.18)
  const wall = faces(C.wall)
  if (ridge === "x") {
    const ym = (y0 + y1) / 2
    return (
      <g>
        <polygon points={poly([[x0, y0, z], [x1, y0, z], [x1, ym, z + rise], [x0, ym, z + rise]])} fill={dark} {...LINE} />
        {/* gable end on the right wall */}
        <polygon points={poly([[f.x + f.w, f.y, z], [f.x + f.w, f.y + f.h, z], [f.x + f.w, (f.y + f.y + f.h) / 2, z + rise * 0.92]])} fill={wall.right} {...LINE} />
        <polygon points={poly([[x0, y1, z], [x1, y1, z], [x1, ym, z + rise], [x0, ym, z + rise]])} fill={lit} {...LINE} />
        <polyline points={poly([[x1, y1, z], [x1, ym, z + rise], [x1, y0, z]])} fill="none" {...LINE} />
      </g>
    )
  }
  const xm = (x0 + x1) / 2
  return (
    <g>
      <polygon points={poly([[x0, y0, z], [x0, y1, z], [xm, y1, z + rise], [xm, y0, z + rise]])} fill={lit} {...LINE} />
      {/* gable end on the left wall */}
      <polygon points={poly([[f.x, f.y + f.h, z], [f.x + f.w, f.y + f.h, z], [(f.x + f.x + f.w) / 2, f.y + f.h, z + rise * 0.92]])} fill={wall.left} {...LINE} />
      <polygon points={poly([[x1, y0, z], [x1, y1, z], [xm, y1, z + rise], [xm, y0, z + rise]])} fill={dark} {...LINE} />
    </g>
  )
}

/** A four-sided pyramid roof. */
export function Pyramid({ f, z, rise, color }: { f: Footprint; z: number; rise: number; color: string }) {
  const ax = f.x + f.w / 2
  const ay = f.y + f.h / 2
  return (
    <g>
      <polygon points={poly([[f.x, f.y + f.h, z], [f.x + f.w, f.y + f.h, z], [ax, ay, z + rise]])} fill={shade(color, 0.1)} {...LINE} />
      <polygon points={poly([[f.x + f.w, f.y + f.h, z], [f.x + f.w, f.y, z], [ax, ay, z + rise]])} fill={shade(color, -0.18)} {...LINE} />
    </g>
  )
}

/** A dome centred on (gx, gy) at height z: a half-ellipse over its base ellipse. */
export function Dome({ gx, gy, z, rx, h, color }: { gx: number; gy: number; z: number; rx: number; h: number; color: string }) {
  const c = iso(gx, gy, z)
  const ry = rx / 2
  return (
    <g>
      <path
        d={`M${round(c.x - rx)} ${round(c.y)} A${rx} ${h} 0 0 1 ${round(c.x + rx)} ${round(c.y)} A${rx} ${ry} 0 0 1 ${round(c.x - rx)} ${round(c.y)}z`}
        fill={color}
        {...LINE}
      />
      <path d={`M${round(c.x - rx * 0.55)} ${round(c.y - h * 0.45)} q${round(rx * 0.25)} ${round(-h * 0.45)} ${round(rx * 0.6)} ${round(-h * 0.5)}`} fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth={2.2} strokeLinecap="round" />
    </g>
  )
}

/** A vertical pole from a ground point. */
export function Pole({ gx, gy, z = 0, H, color = C.ink, width = 1.6 }: { gx: number; gy: number; z?: number; H: number; color?: string; width?: number }) {
  const a = iso(gx, gy, z)
  return <line x1={a.x} y1={a.y} x2={a.x} y2={a.y - H} stroke={color} strokeWidth={width} strokeLinecap="round" />
}

/** A small flag on top of a pole. */
export function Flag({ gx, gy, z, H = 16, color = C.cta }: { gx: number; gy: number; z: number; H?: number; color?: string }) {
  const a = iso(gx, gy, z + H)
  return (
    <g>
      <Pole gx={gx} gy={gy} z={z} H={H} width={1.4} />
      <path className="map-flag" d={`M${a.x} ${a.y}l11 3-11 4z`} fill={color} stroke={C.ink} strokeOpacity={0.6} strokeWidth={1} strokeLinejoin="round" />
    </g>
  )
}
