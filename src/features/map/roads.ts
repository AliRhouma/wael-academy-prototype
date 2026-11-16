import type { Ground } from "./townLayout"

/**
 * Road auto-tiling: a road tile's shape comes from which of its four
 * neighbours are roads. Bits follow the grid axes:
 *   N = (gx, gy − 1)   E = (gx + 1, gy)   S = (gx, gy + 1)   W = (gx − 1, gy)
 * A road on the map's border counts as connected toward the outside, so the
 * avenue visibly leaves town through the forest.
 */
export const N = 1
export const E = 2
export const S = 4
export const W = 8
export const SIDES = [N, E, S, W] as const
export type Side = (typeof SIDES)[number]

export type RoadShape = "isolated" | "end" | "straight" | "corner" | "tee" | "cross"

export function roadMask(ground: Ground[][], gx: number, gy: number): number {
  const n = ground.length
  const isRoad = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= n || y >= n) return true // off the map: the road goes on
    return ground[y][x] === "road"
  }
  return (isRoad(gx, gy - 1) ? N : 0) | (isRoad(gx + 1, gy) ? E : 0) | (isRoad(gx, gy + 1) ? S : 0) | (isRoad(gx - 1, gy) ? W : 0)
}

export function roadShape(mask: number): RoadShape {
  const count = [N, E, S, W].filter((b) => mask & b).length
  if (count === 0) return "isolated"
  if (count === 1) return "end"
  if (count === 3) return "tee"
  if (count === 4) return "cross"
  return mask === (N | S) || mask === (E | W) ? "straight" : "corner"
}

/**
 * Local coordinates on one side of a tile: `u` runs along the edge (0 → 1),
 * `v` goes inward from it (0 at the edge, 1 at the opposite edge). Returns
 * grid coordinates — feed them to `iso()`.
 */
export function sidePoint(side: Side, gx: number, gy: number, u: number, v: number): [number, number] {
  switch (side) {
    case N:
      return [gx + u, gy + v]
    case S:
      return [gx + u, gy + 1 - v]
    case W:
      return [gx + v, gy + u]
    case E:
      return [gx + 1 - v, gy + u]
  }
}
