import type { BadgeTone } from "@/components/kit/Badge"
import type { LessonKind, ResourceLink, VideoRefKind } from "@/data/types"

/** One item of the "contenus" column — a video, or a document-only contenu. */
export interface PlayerVideo {
  id: string
  title: string
  /** Stored link — resolved through `videoSrc()` in this prototype. */
  videoUrl?: string
  kindLabel?: string
  tone?: BadgeTone
  /** Which drawer it belongs to — drives the tabs of the contenus column. */
  lessonKind?: LessonKind
  /** false for a résumé / série: it opens the document viewer, not a page. */
  playable: boolean
  /** Where it sits — the chapitre, the matière, the date of the séance… */
  context?: string
  /** Small meta line under the title (durée, enseignant, salle…). */
  meta?: string
  /** Documents attached to it. */
  pdfs?: ResourceLink[]
  /** This video's own page — the contenus column is a list of real links. */
  to: string
}

/** One chapitre in the chapter switcher of the contenus column. */
export interface ChapterLink {
  id: string
  name: string
  /** Its first playable contenu — absent when the chapitre has no video yet. */
  to?: string
  count: number
}

/** One groupe in the groupe tabs of a séance's contenus column. */
export interface GroupTab {
  id: string
  /** Short label for the tab ("Renforcement"); `title` is the full one. */
  label: string
  title: string
  /** true when the élève belongs to it. */
  mine: boolean
  count: number
  /** Where switching to it lands — the same séance if it's shared, else its first. */
  to: string
}

/** Everything the player page needs, resolved from the route. */
export interface PlayerSource {
  kind: VideoRefKind
  active: PlayerVideo
  /** Ordered playable videos — what the prev / next buttons step through. */
  rail: PlayerVideo[]
  railLabel: string
  /** Every contenu of the list, playable or not (a lesson's four drawers). */
  contents: PlayerVideo[]
  /** lesson only: the chapitres of the matière, to jump between them. */
  chapters?: { activeId: string; list: ChapterLink[] }
  /** seance only: the groupes that ran this matière, to switch between them. */
  groups?: { activeId: string; list: GroupTab[] }
  /** Where the back arrow goes — the list the élève came from. */
  back: { to: string; label: string }
  /** Breadcrumb, in order; the last entry is the current page (no link). */
  crumbs: { to?: string; label: string }[]
}
