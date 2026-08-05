/**
 * Matière art for the élève's screens. Every matière has TWO drawings, and the
 * card uses both:
 *
 * 1. PORTRAIT (`svg icons/illustrations/`) — the Wael illustration, at rest.
 *    One per matière that actually depicts it; the rest borrow one (see
 *    `portraitFor`). TWO edits were made to these files: the full-canvas white
 *    backdrop path was dropped, and the viewBox was tightened to the drawing so
 *    Wael isn't swimming in margin. No path was touched. The card is tinted with
 *    the portrait's own dominant colour (see `subjectTint`).
 *
 * 2. GLYPH (`icons/subjects/*Icon.tsx`) — the flat gradient icon, converted from
 *    `svg icons/` to the Wael tokens, so it follows the active palette. It is
 *    the HOVER art: the card fills with it (see SubjectsScreen).
 *
 * 3. STROKE FALLBACKS (below) — hand-drawn `currentColor` glyphs, kept only as a
 *    safety net now that every matière resolves to a portrait.
 *
 * Portraits render as <img>, not inline SVG: a matière grid shows a dozen at
 * once, so the browser rasterises each drawing once per size and the DOM stays
 * at one node per icon. As separate documents they also can't collide — the
 * files reuse class names, which would repaint each other if they were inlined.
 * The glyphs are inline because they're token-driven, and their gradient ids are
 * already namespaced per instance.
 */
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Eyes } from "./subjects/Eyes"

// The designer's folders, one level above `src`. Imported as urls by Vite — the
// files are used byte for byte, exactly as delivered.
import anglaisPortrait from "../../../svg icons/illustrations/english not hover.svg"
import anglaisPortraitHover from "../../../svg icons/illustrations/english on hover.svg"
import francaisPortrait from "../../../svg icons/illustrations/Frensh.svg"
import mathPortrait from "../../../svg icons/illustrations/Math.svg"
import mathAltPortrait from "../../../svg icons/illustrations/Math 2.svg"
import physiquePortrait from "../../../svg icons/illustrations/physics.svg"

/** The five portraits, by id. `subjectTint` colours a card from the same id. */
export type PortraitId = "math" | "math2" | "physics" | "french" | "english"

export const PORTRAIT: Record<PortraitId, string> = {
  math: mathPortrait,
  math2: mathAltPortrait,
  physics: physiquePortrait,
  french: francaisPortrait,
  english: anglaisPortrait,
}

/** Deterministic order for the spread below — new ids go at the END, or every
 *  unmapped matière silently changes drawing. */
const POOL: PortraitId[] = ["math", "math2", "physics", "french", "english"]

/**
 * Matière name (exactly as seeded) → the portrait that actually depicts it.
 * Everything else draws from the pool (see `portraitFor`), so Wael is on every
 * card instead of half the grid being flat glyphs.
 *
 * "Algorithmique" takes the SECOND math portrait — it's the closest matière to
 * the two supplied maths. Move the line if you'd rather spend that drawing
 * elsewhere.
 */
const PORTRAIT_BY_NAME: Record<string, PortraitId> = {
  "Mathématiques": "math",
  "Algorithmique": "math2",
  "Sciences physiques": "physics",
  "Français": "french",
  "Anglais": "english",
}

/**
 * A cheap, STABLE spread over the pool: same matière, same portrait on every
 * render and every reload — no randomness that could flicker mid-demo.
 *
 * The multiplier is 7 because it's the one that spread the SEEDED matières best
 * (SVT lands on the green math2 disc, which nothing else in a filière claims, so
 * the grid doesn't go all-blue). Change it and every borrowed drawing moves.
 */
function hash(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 7 + name.charCodeAt(i)) >>> 0
  return h
}

/** The portrait a matière shows: its own where one exists, else one of the five. */
export function portraitFor(name: string): PortraitId {
  return PORTRAIT_BY_NAME[name] ?? POOL[hash(name) % POOL.length]
}

/**
 * The HAPPY variant of a portrait, for the hover state.
 *
 * The designer delivers these as a matched pair on the same canvas — "english
 * not hover" (neutral) and "english on hover" (smiling) share a viewBox and a
 * content box to the pixel. Stacked and cross-faded they read as ONE drawing
 * changing expression, which is the whole point: nothing should slide, jump or
 * pop. Any new pair has to keep that registration.
 */
const PORTRAIT_HOVER: Partial<Record<PortraitId, string>> = {
  english: anglaisPortraitHover,
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
  "الأدب العربي": "adab",
  "الحضارة العربية والإسلامية": "hadara",
}

/**
 * The portrait for a matière. Every matière has one now, so this always draws
 * supplied art — the stroke fallbacks below stay only as a safety net.
 *
 * Where a happy variant exists, BOTH drawings render, stacked in the same box,
 * and cross-fade under `group-hover` (the card is the `group`). Same frame, same
 * size, same position — only the expression changes, so hovering doesn't read as
 * one icon leaving and another arriving. Both are always in the DOM, so the
 * smile is decoded before the pointer ever lands and the swap can't flash.
 *
 * `Eyes` sits on top of the stack and repaints the pupils so they follow the
 * cursor. It's the LAST layer for a reason: the eyes are identical in every
 * portrait — including both English expressions — so one overlay covers whatever
 * is showing underneath and the gaze survives the cross-fade. On touch, or under
 * reduced motion, it renders nothing and the portrait is untouched.
 */
export function SubjectIcon({ name, className }: { name: string; className?: string }) {
  const id = portraitFor(name)
  const art = PORTRAIT[id]
  const happy = PORTRAIT_HOVER[id]

  if (art) {
    // The portraits aren't square (the tightened viewBoxes are ~1480×1700) and
    // callers size these with square utilities — `contain` keeps every drawing
    // undistorted. The overlay shares the box and fits it the same way.
    const layer = "absolute inset-0 size-full object-contain"
    return (
      <span className={cn("relative block", className)} aria-hidden="true">
        <img
          src={art}
          alt=""
          draggable={false}
          className={cn(
            "size-full object-contain",
            happy && "transition-opacity duration-300 ease-out group-hover:opacity-0",
          )}
        />
        {happy && (
          <img
            src={happy}
            alt=""
            draggable={false}
            className={cn(layer, "opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100")}
          />
        )}
        <Eyes portrait={id} className={layer} />
      </span>
    )
  }
  return (
    <Glyph className={cn("text-brand-500", className)}>
      {FALLBACKS[FALLBACK_BY_NAME[name] ?? "livre"]}
    </Glyph>
  )
}
