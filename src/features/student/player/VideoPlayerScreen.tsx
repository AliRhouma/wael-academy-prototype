import { useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, ChevronRight, MonitorPlay } from "lucide-react"
import { Badge } from "@/components/kit/Badge"
import { EmptyState } from "@/components/kit/EmptyState"
import { PdfModal } from "@/components/kit/PdfModal"
import { VideoStage } from "@/components/kit/VideoStage"
import { videoSrc, youtubeId } from "@/data/media"
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
 * the documents, then the commentaires. The contenus of the chapitre sit in the
 * right column on desktop and slide under the description on mobile — with a
 * chapitre switcher on top, so the whole programme is reachable without going
 * back to the matière.
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

  const index = source ? source.rail.findIndex((v) => v.id === source.active.id) : -1
  const prev = index > 0 ? source?.rail[index - 1] : undefined
  const next = source && index < source.rail.length - 1 ? source.rail[index + 1] : undefined

  if (!valid || !source) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface">
        <EmptyState
          icon={MonitorPlay}
          title="Vidéo introuvable"
          description="Cette vidéo n’existe pas ou n’est plus à ton programme."
          action={
            <Link
              to="/student/matieres"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105"
            >
              Revenir aux matières
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
      kindLabel: item.kindLabel ?? "Document",
      tone: item.tone ?? "brand",
      context: item.context,
      pdfs: item.pdfs ?? [],
    })
  }

  const contents = (
    <ContentsPanel
      contents={source.contents}
      activeId={active.id}
      label={source.railLabel}
      chapters={source.chapters}
      groups={source.groups}
      onOpenPdf={openPdf}
    />
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Back arrow + breadcrumb — the only navigation above the player. */}
      <div className="flex min-w-0 items-center gap-2">
        <Link
          to={source.back.to}
          aria-label={`Retour — ${source.back.label}`}
          title={`Retour — ${source.back.label}`}
          className="grid size-9 shrink-0 place-items-center rounded-full border border-border-strong bg-surface text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <nav
          aria-label="Fil d’Ariane"
          className="flex min-w-0 flex-wrap items-center gap-1.5 text-[13px] text-ink-muted"
        >
          {source.crumbs.map((crumb, i) => (
            <span key={i} className="flex min-w-0 items-center gap-1.5">
              {i > 0 && <ChevronRight className="size-3.5 shrink-0" />}
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

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
        {/* ---- Left: player, title, actions, description, commentaires ---- */}
        <div className="flex min-w-0 flex-col gap-4">
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

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1
                dir="auto"
                className="font-display text-[22px] font-bold leading-snug text-ink md:text-[24px]"
              >
                {active.title}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {active.kindLabel && <Badge tone={active.tone ?? "brand"}>{active.kindLabel}</Badge>}
                {active.context && (
                  <span dir="auto" className="text-[12px] text-ink-muted">
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
          <div className="lg:hidden">{contents}</div>

          <CommentsPanel key={active.id} kind={kind} videoId={active.id} />
        </div>

        {/* ---- Right: the contenus of the chapitre ---- */}
        <aside className="hidden lg:block">
          <div className="sticky top-0">{contents}</div>
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
