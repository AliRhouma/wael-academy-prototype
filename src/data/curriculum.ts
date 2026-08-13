/**
 * The shape of the programme: three cycles (collège · secondaire · bac), the
 * niveaux inside each, and the sections (filières) a niveau may split into.
 * This is the catalogue the "البرنامج" screen groups by and its form picks
 * from — a Year stores `cycle` + `level` + optional `section`.
 */
import type { Cycle, Year } from "./types"

/** Filières of the 2ème année. */
const SECTIONS_2EME = [
  "علوم",
  "آداب",
  "اقتصاد وخدمات",
  "إعلامية",
  "رياضة",
]

/** Filières of the 3ème année and of the Bac — the same list. */
const SECTIONS_TERMINALES = [
  "رياضيات",
  "علوم تجريبية",
  "اقتصاد وتصرّف",
  "آداب",
  "علوم تقنية",
  "علوم إعلامية",
  "رياضة",
]

export interface LevelDef {
  /** Display name — also the stored `level` of a Year. */
  name: string
  /** Filières under this niveau — empty means the niveau IS the class. */
  sections: string[]
}

export interface CycleDef {
  key: Cycle
  label: string
  /** One-line hint shown under the cycle heading. */
  hint: string
  levels: LevelDef[]
}

/** The three parts of the programme, in the order they're taught. */
export const CYCLES: CycleDef[] = [
  {
    key: "college",
    label: "إعدادي",
    hint: "سابعة · ثامنة · تاسعة أساسي",
    levels: [
      { name: "سابعة أساسي", sections: [] },
      { name: "ثامنة أساسي", sections: [] },
      { name: "تاسعة أساسي", sections: [] },
    ],
  },
  {
    key: "secondaire",
    label: "ثانوي",
    hint: "أولى · ثانية · ثالثة ثانوي — الشعب تبدا من الثانية",
    levels: [
      { name: "أولى ثانوي", sections: [] },
      { name: "ثانية ثانوي", sections: SECTIONS_2EME },
      { name: "ثالثة ثانوي", sections: SECTIONS_TERMINALES },
    ],
  },
  {
    key: "bac",
    label: "باك",
    hint: "عام البكالوريا، شعبة بشعبة",
    levels: [{ name: "باك", sections: SECTIONS_TERMINALES }],
  },
]

/** Look up a cycle definition by its key. */
export function cycleDef(cycle: Cycle): CycleDef {
  return CYCLES.find((c) => c.key === cycle) ?? CYCLES[0]
}

/** Look up a niveau inside a cycle (undefined for a level not in the catalogue). */
export function levelDef(cycle: Cycle, level: string): LevelDef | undefined {
  return cycleDef(cycle).levels.find((l) => l.name === level)
}

/** The filières available for a niveau — empty when it has none. */
export function sectionsFor(cycle: Cycle, level: string): string[] {
  return levelDef(cycle, level)?.sections ?? []
}

/** The display label of a class: "ثالثة ثانوي — رياضيات" or "ثامنة أساسي". */
export function yearName(level: string, section?: string): string {
  return section ? `${level} — ${section}` : level
}

/**
 * What a class card leads with under its niveau heading — the section alone
 * ("Mathématiques"), or the whole name when there's none. Derived from `name`
 * rather than `section` so a copy stays tellable apart ("Mathématiques (copie)").
 */
export function yearLabel(year: Year): string {
  const prefix = `${year.level} — `
  return year.name.startsWith(prefix) ? year.name.slice(prefix.length) : year.name
}

/** Sort key so a new class lands in its cycle → niveau → section slot. */
export function yearOrder(cycle: Cycle, level: string, section?: string): number {
  const ci = Math.max(CYCLES.findIndex((c) => c.key === cycle), 0)
  const levels = cycleDef(cycle).levels
  const li = Math.max(levels.findIndex((l) => l.name === level), 0)
  const sections = sectionsFor(cycle, level)
  const si = section ? Math.max(sections.indexOf(section), 0) : 0
  return ci * 1000 + li * 100 + si
}

export interface LevelGroup {
  level: string
  /** True when the classes of this niveau are filières (2ème, 3ème, Bac). */
  sectioned: boolean
  years: Year[]
}

export interface CycleGroup {
  cycle: CycleDef
  years: Year[]
  levels: LevelGroup[]
}

const byOrder = (a: Year, b: Year) =>
  (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name, "ar")

/**
 * Groups the flat year list into cycle → niveau → classes, following the
 * catalogue order and appending anything unknown (a hand-made class) at the end
 * of its cycle. Every cycle is returned, even empty ones — the screen shows
 * them so the programme's three parts always read the same.
 */
export function groupYearsByCycle(years: Year[]): CycleGroup[] {
  return CYCLES.map((cycle) => {
    const mine = years.filter((y) => y.cycle === cycle.key).sort(byOrder)
    const known = cycle.levels.map((l) => l.name)
    const extras = [...new Set(mine.map((y) => y.level))].filter((l) => !known.includes(l))
    const levels: LevelGroup[] = [...known, ...extras]
      .map((level) => {
        const ys = mine.filter((y) => y.level === level)
        return {
          level,
          sectioned: ys.some((y) => !!y.section) || sectionsFor(cycle.key, level).length > 0,
          years: ys,
        }
      })
      .filter((g) => g.years.length > 0)
    return { cycle, years: mine, levels }
  })
}
