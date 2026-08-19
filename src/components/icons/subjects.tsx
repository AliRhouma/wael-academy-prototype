/**
 * Matière art for the élève's screens.
 *
 * 0. BADGE (`svg icons/wael subject new/*.png`) — the NEWEST generation and the
 *    one the product leads with: a circular medallion, character inside a
 *    navy-ringed disc that carries its own backdrop, head breaking out over the
 *    top. Delivered as PNG (~2100px, transparent surround) despite the folder
 *    name. It supersedes both layers below wherever a matière has one.
 *
 *    (A SCENE layer sat here once — full-bleed 4:3 drawings for Maths and
 *    Philosophie. Both matières have badges now, so it was unreachable and its
 *    two ~400 KB files came out of the bundle with it.)
 *
 * 2. PORTRAIT (`svg icons/illustrations/`) — the Wael illustration, at rest.
 *    One per matière that actually depicts it; the rest borrow one (see
 *    `portraitFor`). TWO edits were made to these files: the full-canvas white
 *    backdrop path was dropped, and the viewBox was tightened to the drawing so
 *    Wael isn't swimming in margin. No path was touched. The card is tinted with
 *    the portrait's own dominant colour (see `subjectTint`).
 *
 * 3. GLYPH (`icons/subjects/*Icon.tsx`) — the flat gradient icon, converted from
 *    `svg icons/` to the Wael tokens, so it follows the active palette. It is
 *    the HOVER art: the card fills with it (see SubjectsScreen).
 *
 * 4. STROKE FALLBACKS (below) — hand-drawn `currentColor` glyphs, kept only as a
 *    safety net now that every matière resolves to a portrait.
 *
 * Badges and portraits both render as <img>, not inline SVG: a matière grid shows a dozen at
 * once, so the browser rasterises each drawing once per size and the DOM stays
 * at one node per icon. As separate documents they also can't collide — the
 * files reuse class names, which would repaint each other if they were inlined.
 * The glyphs are inline because they're token-driven, and their gradient ids are
 * already namespaced per instance.
 */
import { useCallback, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Eyes } from "./subjects/Eyes"
import { SubjectsIcon } from "./SubjectsIcon"

// The designer's folders, one level above `src`. Imported as urls by Vite — the
// files are used byte for byte, exactly as delivered.
import anglaisPortrait from "../../../svg icons/illustrations/english not hover.svg"
import anglaisPortraitHover from "../../../svg icons/illustrations/english on hover.svg"
import francaisPortrait from "../../../svg icons/illustrations/Frensh.svg"
import mathPortrait from "../../../svg icons/illustrations/Math.svg"
import mathAltPortrait from "../../../svg icons/illustrations/Math 2.svg"
import physiquePortrait from "../../../svg icons/illustrations/physics.svg"

// BADGES — `svg icons/subjects`, the delivered SVGs from `svg icons/New Subject
// svg` run through SVGO (see `svgo.config.mjs`; ~34 % off, eye flags intact) and
// renamed for the matière they draw. The whole set is SVG now, and every file
// carries its eye shapes flagged — see `subjects/eyeGeometry.ts`.
import algoBadge from "../../../svg icons/subjects/algorithmique.svg"
import anglaisBadge from "../../../svg icons/subjects/anglais.svg"
import allemandBadge from "../../../svg icons/subjects/allemand.svg"
import arabicBadge from "../../../svg icons/subjects/arabe.svg"
import economieBadge from "../../../svg icons/subjects/economie.svg"
import electriqueBadge from "../../../svg icons/subjects/electricite.svg"
import espagnolBadge from "../../../svg icons/subjects/espagnol.svg"
import francaisBadge from "../../../svg icons/subjects/francais.svg"
import geoBadge from "../../../svg icons/subjects/geographie.svg"
import gestionBadge from "../../../svg icons/subjects/gestion.svg"
import infoBadge from "../../../svg icons/subjects/informatique.svg"
import islamicBadge from "../../../svg icons/subjects/islamique.svg"
import mathBadge from "../../../svg icons/subjects/mathematiques.svg"
import mecaniqueBadge from "../../../svg icons/subjects/mecanique.svg"
import philoBadge from "../../../svg icons/subjects/philosophie.svg"
import physiqueBadge from "../../../svg icons/subjects/physique.svg"
import sciencesBadge from "../../../svg icons/subjects/sciences.svg"

/**
 * BADGES, by matière name exactly as seeded — the art the product leads with now.
 *
 * A badge is a self-contained circular medallion: the character stands inside a
 * navy-ringed disc that carries its own backdrop, and his head breaks out over
 * the top of the ring. That shape decides how it renders — see `SubjectIcon`:
 *  - `contain`, never `cover`, or the ring gets cropped;
 *  - NO halo behind it (the disc already is one — a blur would peek out);
 *  - the gaze overlay only where the badge shipped as SVG with its eye shapes
 *    flagged (Philosophie so far). Each badge poses the face differently, so it
 *    needs its OWN measured geometry — see `subjects/eyeGeometry.ts`, generated
 *    by `scripts/extract-eyes.mjs`. A flat PNG badge keeps its drawn gaze.
 *
 * Keyed by name like scenes, not borrowed like portraits: a badge draws its own
 * matière. Two pairs legitimately SHARE one drawing — تفكير إسلامي with تربية
 * إسلامية, and الحضارة with them — because the same illustration depicts them.
 * A matière with no badge falls through to a scene, then to a portrait, so the
 * grid stays whole while the set fills in.
 */
const BADGE_BY_NAME: Record<string, string> = {
  "رياضيات": mathBadge,
  "خوارزميات": algoBadge,
  "إعلامية": infoBadge,
  "علوم فيزيائية": physiqueBadge,
  "علوم الحياة والأرض": sciencesBadge,
  "فرنسية": francaisBadge,
  "أنڤليزية": anglaisBadge,
  "عربية": arabicBadge,
  "الأدب العربي": arabicBadge,
  "تربية إسلامية": islamicBadge,
  "تفكير إسلامي": islamicBadge,
  "الحضارة العربية والإسلامية": islamicBadge,
  "تاريخ وجغرافيا": geoBadge,
  "اقتصاد": economieBadge,
  "تصرّف": gestionBadge,
  "ميكانيك": mecaniqueBadge,
  "تكنولوجيا": mecaniqueBadge,
  "كهرباء": electriqueBadge,
  "ألمانية": allemandBadge,
  "إسبانية": espagnolBadge,
  "فلسفة": philoBadge,
}

/**
 * Where two matières share a drawing, they share its measured gaze: the geometry
 * belongs to the PICTURE, not to the matière, and `eyeGeometry.ts` stores one
 * entry per file under the first name it was generated for. Without this the
 * borrower renders the badge with dead eyes beside a twin whose eyes follow.
 */
const BADGE_GAZE_OWNER: Record<string, string> = {
  "الأدب العربي": "عربية",
  "تكنولوجيا": "ميكانيك",
  "تفكير إسلامي": "تربية إسلامية",
  "الحضارة العربية والإسلامية": "تربية إسلامية",
}

/** The badge a matière owns, or undefined — the caller then tries a scene. */
export function badgeFor(name: string): string | undefined {
  return BADGE_BY_NAME[name]
}

/**
 * SCENES, by matière name exactly as seeded. Keyed by NAME, not by a shared id:
 * a scene draws its own matière and is never borrowed the way a portrait is —
 * Wael reading Descartes can't stand in for Économie. A matière with no scene
 * yet falls back to a portrait, so the grid stays whole while the set fills in.
 */

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
  "رياضيات": "math",
  "خوارزميات": "math2",
  "علوم فيزيائية": "physics",
  "فرنسية": "french",
  "أنڤليزية": "english",
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
  | "algorithmique" | "adab" | "hadara"

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

const FALLBACKS: Record<FallbackKey, ReactNode> = {
  islamique: Islamique,
  histoireGeo: HistoireGeo,
  economie: Economie,
  gestion: Gestion,
  algorithmique: Algorithmique,
  adab: Adab,
  hadara: Hadara,
}

const FALLBACK_BY_NAME: Record<string, FallbackKey> = {
  "تربية إسلامية": "islamique",
  "تفكير إسلامي": "islamique",
  "تاريخ وجغرافيا": "histoireGeo",
  "اقتصاد": "economie",
  "تصرّف": "gestion",
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
/**
 * Tracks whether THIS drawing has actually landed, so it can be faded in
 * rather than appearing mid-page like a dropped tile.
 *
 * A badge is 60–90 KB of vector and a matière grid mounts twenty of them: they
 * arrive over hundreds of milliseconds, in whatever order the network returns
 * them, and each one pops into an empty box the instant it decodes. One image
 * doing that is unnoticeable; twenty is a page that looks like it is failing.
 *
 * Two ways in, and BOTH are needed. `onLoad` covers the fetch. `complete` on
 * the ref covers the cache: a drawing already decoded paints on the first frame
 * and its load event fired long before this component existed, so waiting for
 * `onLoad` alone would leave a cached badge invisible forever.
 *
 * State holds the SRC, not a boolean, so switching a drawing (the hover swap on
 * the matières screen) re-arms the fade instead of showing the new one over the
 * old one's flag. It is compared against the `src` this hook closed over, never
 * against `img.src` — the DOM resolves that to an absolute URL and the module
 * URL would never match it.
 */
function useLanded(src: string) {
  const [landed, setLanded] = useState<string | null>(null)
  const ref = useCallback(
    (node: HTMLImageElement | null) => {
      if (node?.complete) setLanded(src)
    },
    [src],
  )
  return { landed: landed === src, ref, onLoad: () => setLanded(src) }
}

/**
 * What stands in the drawing's place while it travels.
 *
 * Deliberately almost nothing: a disc of ink at 5 %, breathing. The badges ARE
 * discs, so the shape is honest at any size, and at 5 % it reads as a slot
 * waiting to be filled rather than as a grey blob claiming to be content.
 * `inset-[14%]` is the medallion's own footprint in its canvas.
 */
function ArtPlaceholder({ round = true }: { round?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute bg-ink/[0.05] motion-safe:animate-pulse",
        round ? "inset-[14%] rounded-full" : "inset-[10%] rounded-[22%]",
      )}
    />
  )
}

/** How the art settles in: a fade, and the last hair of a scale. */
const REVEAL = "transition-[opacity,transform] duration-500 ease-out"

export function SubjectIcon({ name, className }: { name: string; className?: string }) {
  const badge = badgeFor(name)
  const id = portraitFor(name)
  const art = PORTRAIT[id]
  const happy = PORTRAIT_HOVER[id]

  // A badge is finished art — it needs no expression swap and no gaze overlay
  // (see BADGE_BY_NAME), so it renders as one plain, undistorted image.
  if (badge) {
    return <BadgeArt name={name} src={badge} className={className} />
  }

  if (art) {
    // The portraits aren't square (the tightened viewBoxes are ~1480×1700) and
    // callers size these with square utilities — `contain` keeps every drawing
    // undistorted. The overlay shares the box and fits it the same way.
    return <PortraitArt id={id} src={art} hover={happy} className={className} />
  }
  const fallback = FALLBACK_BY_NAME[name]
  // No art AND no hand-drawn stand-in: the delivered subjects book is the
  // generic matière mark now — it replaces the stroke "livre" that used to be
  // the last resort, so an unmapped matière still lands on the real icon set.
  if (!fallback) return <SubjectsIcon className={className} />
  return <Glyph className={cn("text-brand-500", className)}>{FALLBACKS[fallback]}</Glyph>
}

/**
 * A badge, revealed as it lands.
 *
 * The GAZE travels with the drawing and not on its own clock: the overlay
 * repaints the eyes of art that isn't there yet, so shown early it is two
 * floating eyes on an empty disc — which is exactly the thing this component
 * exists to prevent.
 */
function BadgeArt({ name, src, className }: { name: string; src: string; className?: string }) {
  const { landed, ref, onLoad } = useLanded(src)

  return (
    <span className={cn("relative block", className)} aria-hidden="true">
      {!landed && <ArtPlaceholder />}
      {/* The badges are 60–90 KB of vector each and a grid mounts twenty:
          `async` keeps their decode off the main thread, so the page stays
          responsive while they land instead of stalling on them. */}
      <img
        ref={ref}
        src={src}
        alt=""
        draggable={false}
        decoding="async"
        onLoad={onLoad}
        className={cn(
          "size-full object-contain",
          REVEAL,
          landed ? "opacity-100" : "opacity-0 motion-safe:scale-95",
        )}
      />
      {/* Renders only where a measured geometry exists; a badge without one
          (تربية إسلامية, until its iris is flagged) shows the drawn gaze
          untouched, which is why the overlay can only ever add. */}
      <Eyes
        subject={BADGE_GAZE_OWNER[name] ?? name}
        className={cn(
          "absolute inset-0 size-full object-contain",
          REVEAL,
          landed ? "opacity-100" : "opacity-0",
        )}
      />
    </span>
  )
}

/** A portrait and its hover twin, same reveal — the resting drawing gates it. */
function PortraitArt({
  id,
  src,
  hover,
  className,
}: {
  id: PortraitId
  src: string
  hover?: string
  className?: string
}) {
  const { landed, ref, onLoad } = useLanded(src)
  // The portraits aren't square (the tightened viewBoxes are ~1480×1700) and
  // callers size these with square utilities — `contain` keeps every drawing
  // undistorted. The overlay shares the box and fits it the same way.
  const layer = "absolute inset-0 size-full object-contain"

  return (
    <span className={cn("relative block", className)} aria-hidden="true">
      {!landed && <ArtPlaceholder round={false} />}
      <img
        ref={ref}
        src={src}
        alt=""
        draggable={false}
        decoding="async"
        onLoad={onLoad}
        className={cn(
          "size-full object-contain",
          REVEAL,
          landed ? "opacity-100" : "opacity-0 motion-safe:scale-95",
          // The hover swap keeps its own, faster curve — that one is an
          // interaction, not an arrival.
          landed && hover && "duration-300 group-hover:opacity-0",
        )}
      />
      {hover && (
        <img
          src={hover}
          alt=""
          draggable={false}
          decoding="async"
          className={cn(
            layer,
            "opacity-0 transition-opacity duration-300 ease-out",
            landed && "group-hover:opacity-100",
          )}
        />
      )}
      <Eyes
        portrait={id}
        className={cn(layer, REVEAL, landed ? "opacity-100" : "opacity-0")}
      />
    </span>
  )
}
