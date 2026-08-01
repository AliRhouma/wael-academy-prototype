/**
 * Matière glyphs for the élève's "Vos matières" grid.
 *
 * TWO TIERS, on purpose:
 *
 * 1. SUPPLIED ART (`./subjects/*.tsx`) — the real icons from `svg icons/`,
 *    converted to token-driven components (blues → brand ramp, lavenders →
 *    accent, outlines → neutral, warm/pink details → warning & danger). These
 *    carry their own gradients, so they do NOT tint per category; the card's
 *    panel, title and progress bar still carry the bucket colour, which is how
 *    the reference reads too.
 *
 * 2. STROKE FALLBACKS (below) — hand-drawn `currentColor` glyphs for the
 *    matières we have no art for yet. They DO inherit the category tint. Drop a
 *    matching SVG into `svg icons/` and it graduates to tier 1.
 *
 * Still needing real art: Histoire-Géographie, Économie, Gestion, Éducation /
 * Pensée islamique, Algorithmique, الأدب العربي, الحضارة العربية والإسلامية —
 * and a proper SVT (see BY_NAME note).
 */
import type { ComponentType, ReactNode } from "react"
import { MathIcon } from "./subjects/MathIcon"
import { PhysiqueIcon } from "./subjects/PhysiqueIcon"
import { ChimieIcon } from "./subjects/ChimieIcon"
import { ElectriqueIcon } from "./subjects/ElectriqueIcon"
import { FrancaisIcon } from "./subjects/FrancaisIcon"
import { AnglaisIcon } from "./subjects/AnglaisIcon"
import { ArabeIcon } from "./subjects/ArabeIcon"
import { InfoIcon } from "./subjects/InfoIcon"
import { MecaniqueIcon } from "./subjects/MecaniqueIcon"
import { PhiloIcon } from "./subjects/PhiloIcon"

/** Re-exported so the converted art is reachable (Électrique has no matière in
 *  the current seed — it's ready for when one appears). */
export {
  MathIcon, PhysiqueIcon, ChimieIcon, ElectriqueIcon, FrancaisIcon,
  AnglaisIcon, ArabeIcon, InfoIcon, MecaniqueIcon, PhiloIcon,
}

type IconComponent = ComponentType<{ className?: string }>

/**
 * Matière name (exactly as seeded) → supplied art.
 *
 * NOTE — "Sciences de la vie et de la terre" is borrowing ChimieIcon (fiole +
 * tube à essai) so the élève's grid stays one visual family. It's a stand-in:
 * a flask reads "sciences expérimentales" but not specifically SVT. Drop an
 * SVT.svg in `svg icons/` and this line changes to point at it.
 */
const BY_NAME: Record<string, IconComponent> = {
  "Mathématiques": MathIcon,
  "Sciences physiques": PhysiqueIcon,
  "Sciences de la vie et de la terre": ChimieIcon,
  "Français": FrancaisIcon,
  "Anglais": AnglaisIcon,
  "Arabe": ArabeIcon,
  "Informatique": InfoIcon,
  "Technologie": MecaniqueIcon,
  "Philosophie": PhiloIcon,
}

/* ------------------------------------------------------------------ *
 * Stroke fallbacks — only for matières with no supplied art yet.
 * ------------------------------------------------------------------ */

/** Shared frame for the fallbacks — colour inherited via currentColor. */
function Glyph({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

type FallbackKey =
  | "islamique" | "histoireGeo" | "economie" | "gestion"
  | "algorithmique" | "adab" | "hadara" | "livre"

/** Crescent + star — Éducation / Pensée islamique. */
const Islamique = (
  <>
    <path d="M21.5 6.5 A10.5 10.5 0 1 0 21.5 25.5 A8.2 8.2 0 1 1 21.5 6.5 Z" />
    <path d="M25.5 6 L26.6 8.6 L29.2 9.2 L26.6 9.8 L25.5 12.4 L24.4 9.8 L21.8 9.2 L24.4 8.6 Z" fill="currentColor" stroke="none" />
  </>
)

/** Globe — Histoire-Géographie. */
const HistoireGeo = (
  <>
    <circle cx="16" cy="16" r="11" />
    <ellipse cx="16" cy="16" rx="4.6" ry="11" />
    <path d="M5 16 H27" />
  </>
)

/** Rising curve — Économie. */
const Economie = (
  <>
    <path d="M6 5.5 V26 H27" />
    <path d="M10 21 L14.5 15.5 L18.5 18.5 L25 10" />
    <path d="M21 10 H25 V14" />
  </>
)

/** Briefcase — Gestion. */
const Gestion = (
  <>
    <path d="M4.5 13 A2 2 0 0 1 6.5 11 H25.5 A2 2 0 0 1 27.5 13 V24 A2 2 0 0 1 25.5 26 H6.5 A2 2 0 0 1 4.5 24 Z" />
    <path d="M12 11 V8.5 A2 2 0 0 1 14 6.5 H18 A2 2 0 0 1 20 8.5 V11" />
    <path d="M4.5 18 H27.5" />
  </>
)

/** Flowchart — Algorithmique. */
const Algorithmique = (
  <>
    <path d="M12 5 H20 A1.6 1.6 0 0 1 21.6 6.6 V9.4 A1.6 1.6 0 0 1 20 11 H12 A1.6 1.6 0 0 1 10.4 9.4 V6.6 A1.6 1.6 0 0 1 12 5 Z" />
    <path d="M4.6 22 H10.4 A1.6 1.6 0 0 1 12 23.6 V26.4 A1.6 1.6 0 0 1 10.4 28 H4.6 A1.6 1.6 0 0 1 3 26.4 V23.6 A1.6 1.6 0 0 1 4.6 22 Z" />
    <path d="M21.6 22 H27.4 A1.6 1.6 0 0 1 29 23.6 V26.4 A1.6 1.6 0 0 1 27.4 28 H21.6 A1.6 1.6 0 0 1 20 26.4 V23.6 A1.6 1.6 0 0 1 21.6 22 Z" />
    <path d="M16 11 V16" />
    <path d="M7.5 22 V16 H24.5 V22" />
  </>
)

/** Open book — الأدب العربي. */
const Adab = (
  <>
    <path d="M16 10 C13 7.2 8.5 6.8 5 8 V23.5 C8.5 22.3 13 22.7 16 25.5 C19 22.7 23.5 22.3 27 23.5 V8 C23.5 6.8 19 7.2 16 10 Z" />
    <path d="M16 10 V25.5" />
  </>
)

/** Arch — الحضارة العربية والإسلامية. */
const Hadara = (
  <>
    <path d="M7 27 V15.5 A9 9 0 0 1 25 15.5 V27" />
    <path d="M12.2 27 V16.8 A3.8 3.8 0 0 1 19.8 16.8 V27" />
    <path d="M4 27 H28" />
  </>
)

/** Closed book — last-resort fallback for any unmapped matière. */
const Livre = (
  <>
    <path d="M7 8 A2.5 2.5 0 0 1 9.5 5.5 H25 V26.5 H9.5 A2.5 2.5 0 0 1 7 24 Z" />
    <path d="M7 24 A2.5 2.5 0 0 1 9.5 21.5 H25" />
  </>
)

const FALLBACKS: Record<FallbackKey, ReactNode> = {
  islamique: Islamique,
  histoireGeo: HistoireGeo,
  economie: Economie,
  gestion: Gestion,
  algorithmique: Algorithmique,
  adab: Adab,
  hadara: Hadara,
  livre: Livre,
}

const FALLBACK_BY_NAME: Record<string, FallbackKey> = {
  "Éducation islamique": "islamique",
  "Pensée islamique": "islamique",
  "Histoire-Géographie": "histoireGeo",
  "Économie": "economie",
  "Gestion": "gestion",
  "Algorithmique": "algorithmique",
  "الأدب العربي": "adab",
  "الحضارة العربية والإسلامية": "hadara",
}

/** True when the matière renders supplied art (which carries its own colours)
 *  rather than a tintable stroke fallback. */
export function hasSubjectArt(name: string): boolean {
  return name in BY_NAME
}

/** The glyph for a matière, picked from its name. */
export function SubjectIcon({ name, className }: { name: string; className?: string }) {
  const Art = BY_NAME[name]
  if (Art) return <Art className={className} />
  return <Glyph className={className}>{FALLBACKS[FALLBACK_BY_NAME[name] ?? "livre"]}</Glyph>
}
