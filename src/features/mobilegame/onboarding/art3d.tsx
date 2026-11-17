import { cn } from "@/lib/utils"
import { matiereKey } from "@/data/matiere"
import { SubjectIcon } from "@/components/icons/subjects"

/**
 * The first launch's 3D art (Scenario, the town's style — see FEATURES.md):
 *  - src/assets/flow3d/level_*.webp, sec_*.webp — levels and sections as 3D collectibles
 *  - src/assets/subjects3d/<key>.webp — وائل in 3D dressed for each matière
 * Read with a glob so a file that isn't delivered yet simply falls back to the
 * existing 2D art (no broken import).
 */
const files = import.meta.glob(["/src/assets/flow3d/*.webp", "/src/assets/subjects3d/*.webp"], { eager: true, query: "?url", import: "default" }) as Record<
  string,
  string
>
const url = (dir: string, key: string) => files[`/src/assets/${dir}/${key}.webp`]

/** The level tiles: « 1 », « 2 », « 3 », « Bac » → their 3D icon. */
export const levelArt = (mark: string) => url("flow3d", `level_${mark === "Bac" ? "bac" : mark}`)

const SECTION_KEY: Record<string, string> = {
  "رياضيات": "sec_math",
  "علوم": "sec_sciences",
  "علوم تجريبية": "sec_experimentales",
  "علوم تقنية": "sec_techniques",
  "إعلامية": "sec_informatique",
  "علوم إعلامية": "sec_informatique",
  "اقتصاد وتصرّف": "sec_eco_gestion",
  "اقتصاد وخدمات": "sec_eco_services",
  "آداب": "sec_lettres",
}
export const sectionArt = (section: string | null | undefined) => (section ? url("flow3d", SECTION_KEY[section] ?? "") : undefined)

const SUBJECT_KEY: Record<string, string> = {
  "رياضيات": "math",
  "خوارزميات": "algo",
  "إعلامية": "info",
  "علوم فيزيائية": "physique",
  "علوم الحياة والأرض": "svt",
  "فرنسية": "francais",
  "أنڤليزية": "anglais",
  "عربية": "arabe",
  "الأدب العربي": "arabe",
  "تربية إسلامية": "islamique",
  "تفكير إسلامي": "islamique",
  "الحضارة العربية والإسلامية": "islamique",
  "تاريخ وجغرافيا": "histgeo",
  "اقتصاد": "economie",
  "تصرّف": "gestion",
  "ميكانيك": "mecanique",
  "تكنولوجيا": "mecanique",
  "كهرباء": "electricite",
  "ألمانية": "allemand",
  "إسبانية": "espagnol",
  "فلسفة": "philo",
}

/** A matière's badge: وائل in 3D when delivered, else the existing 2D badge. */
export function Subject3D({ name, className }: { name: string; className?: string }) {
  const src = url("subjects3d", SUBJECT_KEY[matiereKey(name)] ?? "")
  if (!src) return <SubjectIcon name={name} className={className} />
  return <img src={src} alt="" aria-hidden className={cn("select-none object-contain drop-shadow-[0_6px_8px_rgb(0_0_0/.25)]", className)} draggable={false} />
}
