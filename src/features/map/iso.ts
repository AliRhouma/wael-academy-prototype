/**
 * Isometric projection — 2:1 diamond tiles.
 *
 * Grid coordinates (gx, gy) are tile units: gx grows toward the screen's
 * bottom-right, gy toward the bottom-left. The TOP corner of tile (gx, gy)
 * sits at world pixel `iso(gx, gy)`; a point `z` px above the ground is
 * drawn `z` px higher on screen. World pixels are what the SVG viewBox and the
 * camera speak.
 */
export const TILE_W = 64
export const TILE_H = 32
export const HALF_W = TILE_W / 2
export const HALF_H = TILE_H / 2

export interface Pt {
  x: number
  y: number
}

export function iso(gx: number, gy: number, z = 0): Pt {
  return { x: (gx - gy) * HALF_W, y: (gx + gy) * HALF_H - z }
}

/** "x,y" for an SVG `points` list. */
export function p(gx: number, gy: number, z = 0): string {
  const q = iso(gx, gy, z)
  return `${round(q.x)},${round(q.y)}`
}

/** A list of [gx, gy, z?] corners → SVG `points`. */
export function poly(corners: ReadonlyArray<readonly [number, number, number?]>): string {
  return corners.map(([gx, gy, z]) => p(gx, gy, z ?? 0)).join(" ")
}

/** The diamond of a w × h footprint whose top corner is (gx, gy), at height z. */
export function diamond(gx: number, gy: number, w = 1, h = 1, z = 0): string {
  return poly([
    [gx, gy, z],
    [gx + w, gy, z],
    [gx + w, gy + h, z],
    [gx, gy + h, z],
  ])
}

/** Screen-pixel → grid (inverse of `iso` at z = 0). */
export function toGrid(x: number, y: number): Pt {
  return { x: (x / HALF_W + y / HALF_H) / 2, y: (y / HALF_H - x / HALF_W) / 2 }
}

export const round = (n: number) => Math.round(n * 10) / 10

/**
 * A footprint: the rectangle of tiles an object stands on.
 * Visible faces of a box on it: the LEFT face runs along gx at gy = y + h
 * (from the left corner to the bottom corner), the RIGHT face along gy at
 * gx = x + w (from the bottom corner to the right corner).
 */
export interface Footprint {
  x: number
  y: number
  w: number
  h: number
}

/**
 * SVG matrices that turn a flat drawing into a face of a box. Inside, X runs
 * along the face in screen px (0 → face width) and Y points down, with Y = 0
 * on the ground and Y = −H at the top of a wall of height H. Windows, doors
 * and signs are then plain rects — the matrix skews them onto the wall.
 */
export function leftFaceMatrix(f: Footprint, z = 0): string {
  const o = iso(f.x, f.y + f.h, z)
  return `matrix(1 0.5 0 1 ${round(o.x)} ${round(o.y)})`
}
export function rightFaceMatrix(f: Footprint, z = 0): string {
  const o = iso(f.x + f.w, f.y + f.h, z)
  return `matrix(1 -0.5 0 1 ${round(o.x)} ${round(o.y)})`
}

/** Deterministic 0..1 noise for a tile — the same town on every load. */
export function hash(gx: number, gy: number, salt = 0): number {
  let h = (gx * 374761393 + gy * 668265263 + salt * 2147483647) | 0
  h = (h ^ (h >>> 13)) * 1274126177
  h = h ^ (h >>> 16)
  return ((h >>> 0) % 10000) / 10000
}
