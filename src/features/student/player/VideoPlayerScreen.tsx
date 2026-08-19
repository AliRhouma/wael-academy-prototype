import { useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowRight, ChevronLeft, MonitorPlay } from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { PdfModal } from "@/components/kit/PdfModal"
import { VideoStage } from "@/components/kit/VideoStage"
import { videoSrc, youtubeId } from "@/data/media"
import { useDemoToggle } from "@/lib/demoToggle"
import { useMeasuredHeight } from "@/lib/hooks"
import { useYouTubePlayer } from "@/lib/youtube"
import type { VideoRefKind } from "@/data/types"
import type { PdfRequest } from "@/features/student/matiere/types"
import { CommentsPanel } from "./CommentsPanel"
import { ContentsPanel } from "./ContentsPanel"
import { DescriptionCard } from "./DescriptionCard"
import { ReactionBar } from "./ReactionBar"
import { usePlayerSource } from "./source"
import type { PlayerVideo } from "./types"

/**
 * Élève — the video PAGE (`/student/video/:kind/:id`).
 *
 * Laid out the way every élève already knows a video page: the player, then the
 * title, then the actions (j'aime / je n'aime pas), then the description with
 * the documents, then the commentaires. The contenus of the chapitre hold the
 * START column on desktop — the right-hand one, the app being `dir="rtl"` — and
 * slide under the description on mobile, with a chapitre switcher on top, so the
 * whole programme is reachable without going back to the matière.
 *
 * Stepping through the column REPLACES the history entry, so the back arrow
 * always returns to the list the élève came from, never through six videos.
 *
 * Referenced for spacing & density: SeanceSubjectScreen (breadcrumb, cards),
 * ChapitresTab (drawers), SubjectPicker (the chapitre dropdown).
 */
export default function StudentVideoPlayerScreen() {
  const { kind: rawKind, id } = useParams()
  const navigate = useNavigate()

  const valid = rawKind === "lesson" || rawKind === "exam" || rawKind === "seance"
  const kind = (valid ? rawKind : "lesson") as VideoRefKind
  const source = usePlayerSource(kind, id ?? "")

  const videoId = useMemo(
    () => (source ? youtubeId(videoSrc(source.active.videoUrl)) : undefined),
    [source],
  )
  const player = useYouTubePlayer(videoId)
  const [pdf, setPdf] = useState<PdfRequest | null>(null)

  /**
   * The contenus column is cut to the PLAYER'S OWN HEIGHT on desktop, measured
   * rather than guessed: the stage is `aspect-video`, so its height is whatever
   * the wide column's width happens to be — a `vh` cap would only line up at
   * one window size. Bottoms flush, whether the list holds two contenus or
   * thirty; short lists keep the room instead of leaving a ragged column, long
   * ones scroll inside it instead of running past the video.
   */
  const { ref: stageRef, height: stageHeight } = useMeasuredHeight<HTMLDivElement>()

  /**
   * DEMO — « 1 » stuffs the column with a long programme (see `useDemoToggle`).
   * A real chapitre in the seed holds two or three contenus, which never shows
   * what the column does when a matière has thirty: the list scrolls inside the
   * player's height and the drawer counts climb. Clones of the real contenus,
   * numbered as parts, so every row still opens something.
   */
  const crowded = useDemoToggle(["Digit1", "Numpad1"], false)
  const contentsList = useMemo(
    () => (source ? (crowded ? crowd(source.contents) : source.contents) : []),
    [source, crowded],
  )

  const index = source ? source.rail.findIndex((v) => v.id === source.active.id) : -1
  const prev = index > 0 ? source?.rail[index - 1] : undefined
  const next = source && index < source.rail.length - 1 ? source.rail[index + 1] : undefined

  if (!valid || !source) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface">
        <EmptyState
          icon={MonitorPlay}
          title="الفيديو ما تلقاش"
          description="الفيديو هذا ما موجودش ولا ما عادش في برنامجك."
          action={
            <Link
              to="/student/matieres"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105"
            >
              ارجع للموادّ
            </Link>
          }
        />
      </div>
    )
  }

  const { active } = source
  const step = (to?: string) => (to ? () => navigate(to, { replace: true }) : undefined)

  /** A résumé / série of the column has no video — it opens the viewer here. */
  function openPdf(item: PlayerVideo) {
    setPdf({
      title: item.title,
      kindLabel: item.kindLabel ?? "وثيقة",
      tone: item.tone ?? "brand",
      context: item.context,
      pdfs: item.pdfs ?? [],
    })
  }

  /** `height` only on the desktop copy — see the aside below. */
  const contentsPanel = (height?: number) => (
    <ContentsPanel
      contents={contentsList}
      activeId={active.id}
      label={source.railLabel}
      chapters={source.chapters}
      groups={source.groups}
      onOpenPdf={openPdf}
      height={height}
    />
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Back arrow + breadcrumb — the only navigation above the player. */}
      <div className="flex min-w-0 items-center gap-2">
        <Link
          to={source.back.to}
          aria-label={`ارجع — ${source.back.label}`}
          title={`ارجع — ${source.back.label}`}
          className="grid size-9 shrink-0 place-items-center rounded-full border border-border-strong bg-surface text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"
        >
          <ArrowRight className="size-4" />
        </Link>
        <nav
          aria-label="مسار التنقّل"
          className="flex min-w-0 flex-wrap items-center gap-1.5 text-[calc(13px*var(--ts))] text-ink-muted"
        >
          {source.crumbs.map((crumb, i) => (
            <span key={i} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && <ChevronLeft className="size-3.5 shrink-0" />}
              {crumb.to ? (
                <Link to={crumb.to} className="truncate transition hover:text-brand-600">
                  {crumb.label}
                </Link>
              ) : (
                <span dir="auto" className="truncate font-medium text-brand-600">
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* THE COLUMN OF CONTENUS HOLDS THE START EDGE — physical RIGHT, since the
          élève's app is `dir="rtl"`. It is the page's navigation, and navigation
          belongs where the eye lands first; parked on the far edge it was the
          last thing read on a page whose whole point is « what do I watch next ».
          The track order does the move, not the DOM order: the player stays the
          first child, so below `lg` the page still stacks player → description →
          contenus → commentaires, and a screen reader still meets them that way. */}
      <div className="grid min-w-0 gap-5 lg:grid-cols-[360px_minmax(0,1fr)] xl:grid-cols-[400px_minmax(0,1fr)]">
        {/* ---- The wide column: player, title, actions, description, commentaires ---- */}
        <div className="flex min-w-0 flex-col gap-4 lg:col-start-2 lg:row-start-1">
          {/* Wrapped so the column beside it can be measured against the stage
              — `VideoStage` takes no ref, and the box is what matters anyway. */}
          <div ref={stageRef}>
            <VideoStage
              player={player}
              title={active.title}
              kindLabel={active.kindLabel}
              context={active.context}
              position={{ index: Math.max(index, 0), total: source.rail.length }}
              onPrev={step(prev?.to)}
              onNext={step(next?.to)}
              className="overflow-hidden rounded-xl border border-border shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1
                dir="auto"
                className="font-display text-[calc(22px*var(--ts))] font-bold leading-snug text-ink md:text-[calc(24px*var(--ts))]"
              >
                {active.title}
              </h1>
              {/* No « Cours » / « Exercice » badge: the contenus column stopped
                  sorting by kind, and a French category chip under an Arabic
                  title was the last thing on the page still saying it. What is
                  left is where the contenu SITS — the درس it belongs to. */}
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {active.context && (
                  <span dir="auto" className="text-[calc(12px*var(--ts))] text-ink-muted">
                    {active.context}
                  </span>
                )}
              </div>
            </div>
            <ReactionBar kind={kind} videoId={active.id} />
          </div>

          <DescriptionCard video={active} />

          {/* On mobile the contenus sit between the description and the
              commentaires: navigation shouldn't be buried under the wall. */}
          <div className="lg:hidden">{contentsPanel()}</div>

          <CommentsPanel key={active.id} kind={kind} videoId={active.id} />
        </div>

        {/* ---- The start column: the contenus of the chapitre ---- */}
        <aside className="hidden lg:col-start-1 lg:row-start-1 lg:block">
          {/* The measurement is only meaningful here: on mobile the column sits
              in the page's flow, under the description, where cutting it to the
              player's height would just hide contenus behind a second scroller. */}
          <div className="sticky top-0">{contentsPanel(stageHeight || undefined)}</div>
        </aside>
      </div>

      {pdf && (
        <PdfModal
          open
          onOpenChange={(open) => !open && setPdf(null)}
          title={pdf.title}
          kindLabel={pdf.kindLabel}
          tone={pdf.tone}
          context={pdf.context}
          pdfs={pdf.pdfs}
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------------- */

/** How many contenus the « 1 » demo state fills the column with. */
const CROWD_TARGET = 24

/**
 * Pad a chapitre out to `CROWD_TARGET` contenus by repeating the real ones as
 * numbered parts — the demo state behind « 1 ». Clones keep their drawer and
 * their destination, so the tabs count them and every row still opens a video;
 * only the id and the title are new, the id because React keys on it and the
 * title because two identical rows read as a rendering bug rather than as a
 * long programme.
 */
function crowd(contents: PlayerVideo[]): PlayerVideo[] {
  const seeds = contents.filter((c) => c.playable)
  if (seeds.length === 0 || contents.length >= CROWD_TARGET) return contents
  const out = [...contents]
  for (let i = 0; out.length < CROWD_TARGET; i++) {
    const seed = seeds[i % seeds.length]
    out.push({
      ...seed,
      id: `${seed.id}--crowd-${i}`,
      title: `${seed.title} — الجزء ${Math.floor(i / seeds.length) + 2}`,
    })
  }
  return out
}
