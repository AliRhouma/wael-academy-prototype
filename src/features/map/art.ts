import { useEffect, useState, useSyncExternalStore } from "react"

/**
 * Delivered art for the town — the app side of the artist's guide
 * (`village-art-guide.md`, art.zip, 2026-11-16).
 *
 *  - Files follow the guide's names: `building_<name>[_l<level>].png`,
 *    `prop_<name>_<nn>.png`, `ground_<kind>_<nn>.png`, `<name>_<part>.png`.
 *  - Bundled files live in `src/assets/town/`; the atelier (`/map/atelier`)
 *    can add more for the session (in memory — a refresh forgets them).
 *  - Each canvas has a fixed size and anchor (guide §3). In masters, one tile
 *    is 1024 px wide; on the map a tile is 64 px, so a 1-tile master is drawn
 *    at 1/16 — and a bigger footprint scales by its diamond's width.
 *  - Nothing delivered for an asset → the map keeps its code-drawn art.
 */

/* ------------------------------------------------------------- templates */

export type TemplateKind = "building" | "prop" | "villager" | "character" | "ground"

export interface Template {
  kind: TemplateKind
  label: string
  w: number
  h: number
  /** the anchor pixel (footprint centre for objects, between the feet for characters) */
  ax?: number
  ay?: number
  /** objects: the 1-tile diamond (1024 × 512) is centred on the anchor */
  tile?: boolean
}

export const TEMPLATES: Record<TemplateKind, Template> = {
  building: { kind: "building", label: "Bâtiment (1 case)", w: 1536, h: 2048, ax: 768, ay: 1728, tile: true },
  prop: { kind: "prop", label: "Petit objet", w: 1024, h: 1024, ax: 512, ay: 832, tile: true },
  villager: { kind: "villager", label: "Petit personnage (1 image)", w: 512, h: 512, ax: 256, ay: 480 },
  character: { kind: "character", label: "Grand personnage (calque)", w: 1024, h: 1536, ax: 512, ay: 1472 },
  ground: { kind: "ground", label: "Texture de sol", w: 1024, h: 1024 },
}

/** Master pixels per map pixel: a master tile is 1024 px wide, a map tile 64. */
export const MASTER_TILE_W = 1024

/* ----------------------------------------------------------------- names */

export interface ArtName {
  file: string
  /** e.g. "building_library" — the asset this file belongs to, level stripped */
  asset: string
  kind: TemplateKind
  name: string
  level?: number
  index?: number
  part?: string
}

const CHARACTER_PARTS = /^(base|eyes_half|eyes_closed|mouth_(rest|a|e|o|u|f))$/

/** Read a file name against the guide's patterns (§9). `null` = not a valid name. */
export function parseArtName(file: string): ArtName | null {
  const m = /^([a-z0-9_]+)\.png$/.exec(file)
  if (!m) return null
  const stem = m[1]
  let r: RegExpExecArray | null
  if ((r = /^building_([a-z0-9]+(?:_[a-z0-9]+)*?)(?:_l(\d+))?$/.exec(stem)))
    return { file, asset: `building_${r[1]}`, kind: "building", name: r[1], level: r[2] !== undefined ? Number(r[2]) : undefined }
  if ((r = /^prop_([a-z0-9]+(?:_[a-z0-9]+)*?)_(\d{2})$/.exec(stem))) return { file, asset: `prop_${r[1]}`, kind: "prop", name: r[1], index: Number(r[2]) }
  if ((r = /^ground_([a-z0-9]+(?:_[a-z0-9]+)*?)_(\d{2})$/.exec(stem))) return { file, asset: `ground_${r[1]}`, kind: "ground", name: r[1], index: Number(r[2]) }
  if ((r = /^(villager_[a-z0-9]+)_([a-z0-9_]+)$/.exec(stem))) return { file, asset: r[1], kind: "villager", name: r[1], part: r[2] }
  if ((r = /^([a-z0-9]+)_([a-z_]+)$/.exec(stem)) && CHARACTER_PARTS.test(r[2])) return { file, asset: r[1], kind: "character", name: r[1], part: r[2] }
  return null
}

/* --------------------------------------------------------------- library */

// files shipped with the app
const bundled = import.meta.glob("/src/assets/town/*.png", { eager: true, query: "?url", import: "default" }) as Record<string, string>
const BUNDLED = new Map(Object.entries(bundled).map(([path, url]) => [path.split("/").pop()!, url]))

// files added in the atelier for this session
let overrides = new Map<string, string>()
const listeners = new Set<() => void>()
let snapshot = new Map([...BUNDLED, ...overrides])

function emit() {
  snapshot = new Map([...BUNDLED, ...overrides])
  listeners.forEach((l) => l())
}

/** Add (or replace) files for this session — e.g. from the atelier. */
export function setSessionArt(files: { name: string; url: string }[]) {
  overrides = new Map(overrides)
  for (const f of files) overrides.set(f.name, f.url)
  emit()
}
export function clearSessionArt() {
  overrides = new Map()
  emit()
}
export function sessionArtCount() {
  return overrides.size
}

/** Every file the town can use right now (file name → URL). Re-renders on change. */
export function useArtLibrary(): Map<string, string> {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => snapshot,
  )
}

/* ------------------------------------------------------------- resolving */

/**
 * The file for a building at a level: that level's file, else the highest
 * lower level that exists, else the un-levelled file. Level 0 (not built yet)
 * only uses an explicit `_l0` file — never the finished building.
 */
export function buildingFile(lib: Map<string, string>, art: string, level: number): string | null {
  const base = `building_${art}`
  if (lib.has(`${base}_l${level}.png`)) return `${base}_l${level}.png`
  if (level === 0) return null
  for (let l = level - 1; l >= 1; l--) if (lib.has(`${base}_l${l}.png`)) return `${base}_l${l}.png`
  return lib.has(`${base}.png`) ? `${base}.png` : null
}

/** One of the delivered variants of a repeated prop (`prop_tree_01`, `_02`…), picked by `variant`. */
export function propFile(lib: Map<string, string>, name: string, variant: number): string | null {
  const prefix = `prop_${name}_`
  const all = [...lib.keys()].filter((f) => f.startsWith(prefix) && parseArtName(f)?.kind === "prop").sort()
  return all.length ? all[variant % all.length] : null
}

/* ------------------------------------------------------------ alpha box */

export interface AlphaInfo {
  w: number
  h: number
  /** bounding box of the visible pixels (alpha > 8), in canvas px; null if empty */
  box: { left: number; top: number; right: number; bottom: number } | null
  /** some pixels are transparent */
  hasTransparency: boolean
  /** visible pixels touch the canvas edge (guide §1.8: keep shadows inside) */
  touchesEdge: boolean
}

const alphaCache = new Map<string, Promise<AlphaInfo>>()

/** Measure an image's visible area (cached per URL). */
export function measureAlpha(url: string): Promise<AlphaInfo> {
  let p = alphaCache.get(url)
  if (!p) {
    p = new Promise<AlphaInfo>((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const w = img.naturalWidth
        const h = img.naturalHeight
        // measure on a reduced copy — plenty for a bounding box, cheap on 2K masters
        const k = Math.min(1, 512 / Math.max(w, h))
        const cw = Math.max(1, Math.round(w * k))
        const ch = Math.max(1, Math.round(h * k))
        const canvas = document.createElement("canvas")
        canvas.width = cw
        canvas.height = ch
        const ctx = canvas.getContext("2d", { willReadFrequently: true })
        if (!ctx) return reject(new Error("no 2d context"))
        ctx.drawImage(img, 0, 0, cw, ch)
        const data = ctx.getImageData(0, 0, cw, ch).data
        let left = cw
        let top = ch
        let right = -1
        let bottom = -1
        let transparent = false
        for (let y = 0; y < ch; y++)
          for (let x = 0; x < cw; x++) {
            const a = data[(y * cw + x) * 4 + 3]
            if (a < 250) transparent = true
            if (a > 8) {
              if (x < left) left = x
              if (x > right) right = x
              if (y < top) top = y
              if (y > bottom) bottom = y
            }
          }
        const box = right < 0 ? null : { left: left / k, top: top / k, right: (right + 1) / k, bottom: (bottom + 1) / k }
        const touchesEdge = !!box && (left === 0 || top === 0 || right === cw - 1 || bottom === ch - 1)
        resolve({ w, h, box, hasTransparency: transparent, touchesEdge })
      }
      img.onerror = () => reject(new Error(`could not load ${url}`))
      img.src = url
    })
    alphaCache.set(url, p)
  }
  return p
}

/** `measureAlpha` as a hook: null until measured. */
export function useAlpha(url: string | null): AlphaInfo | null {
  const [info, setInfo] = useState<{ url: string; info: AlphaInfo } | null>(null)
  useEffect(() => {
    if (!url) return
    let live = true
    measureAlpha(url).then(
      (i) => live && setInfo({ url, info: i }),
      () => {},
    )
    return () => {
      live = false
    }
  }, [url])
  return url && info?.url === url ? info.info : null
}
