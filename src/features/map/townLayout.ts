import { hash } from "./iso"

/**
 * « مدينتي » — the town's layout, as data.
 *
 * The ground is a 24 × 24 picture you can edit by eye (one character per tile,
 * row = gy, column = gx). Buildings are listed separately with their footprint;
 * they stand on grass or plaza tiles. Roads are only marked `#` — the shape of
 * each road tile (straight, corner, T, crossroads, dead end) is derived from
 * its neighbours in `roads.ts`.
 *
 *   F forest (trees on dark grass)   . grass          # road
 *   P plaza paving                   T tree           s shrub
 *   f flowers                        r rocks
 *   L lamp (grass)   l lamp (plaza)  B bench (grass)  b bench (plaza)
 *   u café parasol (plaza)
 */
export const MAP_N = 24

/**
 * Two shapes for the same town: `island` — the square diorama block floating
 * in space (`/map`); `planet` — a small round planet (`/map/planete`), where
 * only the disc of tiles within `r` of the centre is ground (see `Ground.tsx`).
 */
export type TownShape = "island" | "planet"

export const PLANET = { gx: MAP_N / 2, gy: MAP_N / 2, r: 11.7 }
/** Distance (in tiles) from the planet's centre to a grid point. */
export const planetDist = (gx: number, gy: number) => Math.hypot(gx - PLANET.gx, gy - PLANET.gy)

// prettier-ignore
const ROWS = [
  "FFFFFFFFFFFFFFFFFFFFFFFF", // 0
  "FFFFFFFFFFFFFFFFFFFFFFFF", // 1
  "FFF..T.s..FF.....T..FFFF", // 2
  "FF..r..f.....s......TFFF", // 3
  "FF.T..L.....L.......T.FF", // 4
  "FF...###############..FF", // 5
  "FF...#T....P#PPPPPP#..FF", // 6
  "FF...#.....P#PbPPbP#..FF", // 7
  "FF...#.....P#PPPPPl#..FF", // 8
  "FF...#f....P#PPPPPP#..FF", // 9
  "FF.T.#PPPPPP#uPbPPP#.TFF", // 10
  "FFF..#PPlPPP#lPPPPP#..FF", // 11
  "########################", // 12 — the avenue, leaving town both ways
  "FF...#.....L#L..#..#..FF", // 13
  "FF.r.#T.....#...#..#.TFF", // 14
  "FF.rr#......#...#..#r.FF", // 15 — (16,15) is the dead end of the spur
  "FF...#...T..#s.....#..FF", // 16
  "FFF..#.T...T#..T..T#..FF", // 17
  "FF...###############..FF", // 18
  "FF.T......B.#.......s.FF", // 19
  "FFF..f......#.......TFFF", // 20
  "FFFF.T.....F#F.....T.FFF", // 21
  "FFFFFFFFFFFF#FFFFFFFFFFF", // 22
  "FFFFFFFFFFFF#FFFFFFFFFFF", // 23 — the road south, out through the forest
]

export type Ground = "grass" | "forest" | "road" | "plaza"

export type PropKind = "tree" | "pine" | "bush" | "flowers" | "rocks" | "lamp" | "bench" | "parasol" | "fountain"

export interface Prop {
  id: string
  kind: PropKind
  gx: number
  gy: number
  /** jitter inside the tile, in tile units */
  dx: number
  dy: number
  scale: number
  variant: number
}

/** The fountain: a 2 × 2 basin in the middle of the plaza. */
export const FOUNTAIN = { x: 15, y: 8, w: 2, h: 2 }

export type BuildingKind =
  | "school"
  | "library"
  | "lab"
  | "mathTower"
  | "music"
  | "stadium"
  | "greenhouse"
  | "cafe"
  | "arena"
  | "house"
  | "shop"

export interface Building {
  id: string
  kind: BuildingKind
  name: { ar: string; fr: string }
  /** Short text painted on the façade sign (defaults to none). */
  sign?: string
  /** Top corner tile and footprint, in tiles. */
  x: number
  y: number
  w: number
  h: number
  level: number
  maxLevel: number
  /** The school level this building needs before it can be built (level 0 → 1). */
  unlockAt?: number
  subjects: string[]
  blurb: string
  /** Base colour for kinds that vary (houses). */
  color?: string
  /**
   * The asset name of its delivered art (`building_<art>[_l<level>].png`, see
   * `art.ts`). Defaults to its kind's name (`ART_OF_KIND` in `BuildingArt.tsx`).
   */
  art?: string
}

export const SCHOOL_ID = "ecole"

export const BUILDINGS: Building[] = [
  {
    id: SCHOOL_ID,
    kind: "school",
    name: { ar: "مدرسة وائل", fr: "École de Wael" },
    sign: "مدرسة وائل",
    x: 7, y: 7, w: 3, h: 3,
    level: 3, maxLevel: 10,
    subjects: ["Toutes les matières"],
    blurb: "Le cœur de la ville. Son niveau plafonne celui de tous les autres bâtiments.",
  },
  {
    id: "bibliotheque",
    kind: "library",
    name: { ar: "المكتبة", fr: "Bibliothèque" },
    sign: "مكتبة",
    x: 7, y: 13, w: 2, h: 3,
    level: 3, maxLevel: 10,
    subjects: ["Arabe", "Français", "Anglais", "Philosophie"],
    blurb: "Plus tu lis, plus la pile de livres monte sur le toit.",
  },
  {
    id: "labo",
    kind: "lab",
    name: { ar: "مخبر العلوم", fr: "Labo des sciences" },
    sign: "مخبر",
    x: 13, y: 14, w: 2, h: 2,
    level: 2, maxLevel: 10,
    subjects: ["Physique", "Chimie"],
    blurb: "Grandit avec tes exercices, vidéos et séances de physique-chimie.",
  },
  {
    id: "maths",
    kind: "mathTower",
    name: { ar: "برج الرياضيات", fr: "Tour des maths" },
    sign: "π",
    x: 17, y: 14, w: 2, h: 2,
    level: 2, maxLevel: 10,
    subjects: ["Mathématiques", "Informatique"],
    blurb: "Chaque niveau ajoute un étage. Tout en haut, l'observatoire.",
  },
  {
    id: "musique",
    kind: "music",
    name: { ar: "دار الموسيقى", fr: "Maison de la musique" },
    sign: "موسيقى",
    x: 10, y: 15, w: 2, h: 2,
    level: 1, maxLevel: 10,
    subjects: ["Éducation musicale", "Arts plastiques"],
    blurb: "Les matières artistiques — on y répète, on y expose.",
  },
  {
    id: "stade",
    kind: "stadium",
    name: { ar: "الملعب", fr: "Terrain de sport" },
    x: 20, y: 6, w: 2, h: 4,
    level: 2, maxLevel: 10,
    subjects: ["Éducation physique"],
    blurb: "Les tribunes s'agrandissent à chaque niveau.",
  },
  {
    id: "serre",
    kind: "greenhouse",
    name: { ar: "البيت الأخضر", fr: "La serre" },
    x: 2, y: 7, w: 2, h: 2,
    level: 1, maxLevel: 10,
    subjects: ["Sciences de la vie et de la Terre"],
    blurb: "Une serre de verre qui se remplit de plantes avec tes points SVT.",
  },
  {
    id: "cafe",
    kind: "cafe",
    name: { ar: "قهوة المراجعة", fr: "Café des révisions" },
    sign: "قهوة",
    x: 17, y: 10, w: 2, h: 1,
    level: 1, maxLevel: 5,
    subjects: ["Révisions en groupe"],
    blurb: "Le coin où ton groupe se retrouve pour réviser ensemble.",
  },
  {
    id: "boutique",
    kind: "shop",
    name: { ar: "متجر وائل", fr: "Boutique Wael" },
    x: 10, y: 3, w: 2, h: 2,
    level: 1, maxLevel: 5,
    subjects: ["Fournitures", "Livres", "Kits de révision"],
    blurb: "La boutique de la Wael Library : cahiers, livres et kits, payés avec tes pièces.",
  },
  {
    id: "arene",
    kind: "arena",
    name: { ar: "ساحة التحدّيات", fr: "Arène des défis" },
    sign: "قريباً",
    x: 14, y: 19, w: 3, h: 2,
    level: 0, maxLevel: 5, unlockAt: 4,
    subjects: ["Défis en direct"],
    blurb: "Organise des défis en direct avec ton groupe. Le chantier attend l'école au niveau 4.",
  },
  {
    id: "dar-sarra",
    kind: "house",
    name: { ar: "دار سارة", fr: "Maison de Sarra" },
    x: 8, y: 3, w: 1, h: 1,
    level: 2, maxLevel: 5,
    subjects: [],
    blurb: "Sarra est dans ta classe. Passe voir où elle en est.",
    color: "#ffd9b8",
  },
  {
    id: "dar-yassine",
    kind: "house",
    name: { ar: "دار ياسين", fr: "Maison de Yassine" },
    x: 15, y: 3, w: 2, h: 1,
    level: 3, maxLevel: 5,
    subjects: [],
    blurb: "Yassine prépare le bac avec toi.",
    color: "#f4fbff",
  },
  {
    id: "dar-meriem",
    kind: "house",
    name: { ar: "دار مريم", fr: "Maison de Meriem" },
    x: 8, y: 20, w: 1, h: 1,
    level: 1, maxLevel: 5,
    subjects: [],
    blurb: "Meriem vient d'arriver dans ton groupe.",
    color: "#d4eef1",
  },
  {
    id: "dar-omar",
    kind: "house",
    name: { ar: "دار عمر", fr: "Maison d'Omar" },
    x: 18, y: 20, w: 1, h: 1,
    level: 2, maxLevel: 5,
    subjects: [],
    blurb: "Omar t'a invité à son groupe de maths.",
    color: "#fbf3e4",
  },
]

/* ------------------------------------------------------------------------ */

const GROUND_OF: Record<string, Ground> = {
  F: "forest",
  "#": "road",
  P: "plaza",
  l: "plaza",
  b: "plaza",
  u: "plaza",
}

const PROP_OF: Record<string, PropKind> = {
  T: "tree",
  s: "bush",
  f: "flowers",
  r: "rocks",
  L: "lamp",
  l: "lamp",
  B: "bench",
  b: "bench",
  u: "parasol",
}

export interface TownLayout {
  ground: Ground[][] // [gy][gx]
  props: Prop[]
}

function build(shape: TownShape): TownLayout {
  const onPlanet = (gx: number, gy: number, margin: number) => shape !== "planet" || planetDist(gx, gy) <= PLANET.r - margin
  const ground: Ground[][] = ROWS.map((row) => [...row].map((ch) => GROUND_OF[ch] ?? "grass"))
  const props: Prop[] = []
  ROWS.forEach((row, gy) =>
    [...row].forEach((ch, gx) => {
      const r1 = hash(gx, gy, 1)
      const r2 = hash(gx, gy, 2)
      if (ch === "F") {
        // the forest edge: one tree per tile, a few pines, the odd pair
        const kind: PropKind = r1 < 0.32 ? "pine" : "tree"
        const dx = (r2 - 0.5) * 0.4
        const dy = (hash(gx, gy, 3) - 0.5) * 0.4
        if (!onPlanet(gx + 0.5 + dx, gy + 0.5 + dy, 0.55)) return // past the planet's rim
        props.push({ id: `f-${gx}-${gy}`, kind, gx, gy, dx, dy, scale: 0.9 + r1 * 0.35, variant: Math.floor(r2 * 3) })
        if (r2 > 0.78) props.push({ id: `f2-${gx}-${gy}`, kind: "bush", gx, gy, dx: 0.32, dy: 0.3, scale: 0.8, variant: 1 })
        return
      }
      const kind = PROP_OF[ch]
      if (kind && !onPlanet(gx + 0.5, gy + 0.5, 0.4)) return // past the planet's rim
      if (kind) props.push({ id: `${kind}-${gx}-${gy}`, kind, gx, gy, dx: 0, dy: 0, scale: kind === "tree" ? 0.95 + r1 * 0.2 : 1, variant: Math.floor(r2 * 3) })
    }),
  )
  props.push({ id: "fountain", kind: "fountain", gx: FOUNTAIN.x, gy: FOUNTAIN.y, dx: 0, dy: 0, scale: 1, variant: 0 })
  return { ground, props }
}

export const TOWNS: Record<TownShape, TownLayout> = { island: build("island"), planet: build("planet") }
const TOWN = TOWNS.island

/* Dev check: footprints must sit on free, non-road tiles. */
if (import.meta.env.DEV) {
  const taken = new Map<string, string>()
  TOWN.props.forEach((p) => {
    if (p.kind !== "fountain") taken.set(`${p.gx},${p.gy}`, p.id)
  })
  for (let y = FOUNTAIN.y; y < FOUNTAIN.y + FOUNTAIN.h; y++)
    for (let x = FOUNTAIN.x; x < FOUNTAIN.x + FOUNTAIN.w; x++) taken.set(`${x},${y}`, "fountain")
  for (const b of BUILDINGS)
    for (let y = b.y; y < b.y + b.h; y++)
      for (let x = b.x; x < b.x + b.w; x++) {
        const k = `${x},${y}`
        if (TOWN.ground[y]?.[x] === "road" || TOWN.ground[y]?.[x] === "forest" || taken.has(k))
          console.warn(`[map] ${b.id} overlaps ${taken.get(k) ?? TOWN.ground[y]?.[x]} at ${k}`)
        taken.set(k, b.id)
      }
}
