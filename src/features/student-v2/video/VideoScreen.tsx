import { useMemo, useState, type ReactNode } from "react"
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom"
import { ArrowLeft, ArrowRight, Check, FolderOpen, MonitorPlay, Play, SkipBack, SkipForward } from "lucide-react"
import type { VideoRefKind } from "@/data/types"
import { VideoStage } from "@/components/kit/VideoStage"
import { videoSrc, youtubeId } from "@/data/media"
import { usePlayerSource } from "@/features/student/player/source"
import { durationLabel } from "@/features/student/seances/replays"
import { useMediaQuery } from "@/lib/hooks"
import { useYouTubePlayer } from "@/lib/youtube"
import { useData } from "@/stores/useData"
import { cn } from "@/lib/utils"
import { useDemoStates } from "../demoStates"
import { useDownloads } from "../downloads"
import { BASE, MONTHS, frenchName, inV2, parseDay, useLookups, useSessionDocs } from "../lib"
import { CtaLink, Panel, PanelEmpty, ctaClass } from "../ui"
import { V2CommentsPanel } from "./CommentsPanel"
import { PlaylistPanel, type PlaylistMode, type PlaylistRow } from "./PlaylistPanel"

const ORDINAL = ["الأوّل", "الثاني", "الثالث"]

/** « هبطت 20 أوت 2026 » — when the replay went online (else the séance's day). */
function publishedLabel(iso: string): string {
  const d = parseDay(iso.slice(0, 10))
  return `هبطت ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/**
 * The three widths, as grid tracks — the list holds the START column.
 *
 * The list's track is ALWAYS a length-percentage (%, rem) and the player's is
 * always the same `minmax(0,1fr)`: only then can the browser interpolate
 * `grid-template-columns` and slide between them. Mixing an `fr` list track
 * with a `rem` one (as the first cut did) is not interpolable — the width
 * simply snapped.
 */
const COLS: Record<PlaylistMode, string> = {
  split: "lg:grid-cols-[44%_minmax(0,1fr)]",
  list: "lg:grid-cols-[62%_minmax(0,1fr)]",
  video: "lg:grid-cols-[5.5rem_minmax(0,1fr)]",
}

/**
 * The video page — the frame « Main Pgae - Calendar months (5) ».
 *
 * As drawn at 1920: the playlist on the start side (groupe pills, the
 * trimester, numbered rows with the playing one on the teal plate), and the
 * player column — the stage, « السابق · 1/6 · الجاي », the title, the date it
 * went up, the documents, the comments.
 *
 * Asked on top of the frame: the list is EXPANDABLE, and the reverse. Three
 * widths (see `PlaylistPanel`): split as drawn; the list expanded to two
 * columns of fuller rows while the player narrows; and the list folded to a
 * rail of numbers so the video takes the page. The grid tracks animate between
 * them, and the player keeps playing through every change — it is the same
 * element, only its column moves.
 *
 * The data is the old player's (`usePlayerSource`): same playlist, same groupe
 * tabs, same trimester — its links are just re-rooted into this space.
 */
export default function V2VideoScreen() {
  const { kind: rawKind, id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const demo = useDemoStates()
  const wide = useMediaQuery("(min-width: 1024px)")
  const sessions = useData((s) => s.sessions)
  const { subjectById, teacherName } = useLookups()

  const valid = rawKind === "lesson" || rawKind === "exam" || rawKind === "seance"
  const kind = (valid ? rawKind : "seance") as VideoRefKind
  const source = usePlayerSource(kind, id ?? "")

  const [mode, setMode] = useState<PlaylistMode>("split")
  const [started, setStarted] = useState(false)
  const videoId = useMemo(() => (source ? youtubeId(videoSrc(source.active.videoUrl)) : undefined), [source])
  const player = useYouTubePlayer(videoId)

  const session = kind === "seance" ? (sessions.find((s) => s.id === id) ?? null) : null
  const docs = useSessionDocs(session, true)
  const { has, download } = useDownloads()

  const rows = useMemo<PlaylistRow[]>(() => {
    if (!source) return []
    const base = source.rail.map((video) => {
      const s = sessions.find((x) => x.id === video.id)
      return {
        video: { ...video, to: inV2(video.to) },
        published: s ? publishedLabel(s.publishedAt ?? s.date) : (video.context ?? ""),
        detail: s ? [durationLabel(s.startTime, s.endTime), teacherName(s.teacherId)].filter(Boolean).join(" · ") : video.meta,
      }
    })
    if (demo.playlist !== "many" || base.length === 0) return base
    // « برشا » — a long programme, cloned from the real rows so every one
    // still opens a video (the old player's « 1 » demo, same idea).
    const out = [...base]
    for (let i = 0; out.length < 18; i++) {
      const seed = base[i % base.length]
      out.push({ ...seed, video: { ...seed.video, id: `${seed.video.id}--${i}`, title: `${seed.video.title} — Partie ${Math.floor(i / base.length) + 2}` } })
    }
    return out
  }, [source, sessions, demo.playlist, teacherName])

  if (!valid || !source) {
    return (
      <div className="rounded-3xl border border-v2-ink/15 bg-v2-surface p-6">
        <PanelEmpty
          icon={MonitorPlay}
          title="الفيديو هذا ما تلقاش"
          body="ما عادش موجود، ولّا مازال ما تنشرش."
          action={<CtaLink data-uisfx="back" to={`${BASE}/seances`}>رجوع للتسجيلات</CtaLink>}
        />
      </div>
    )
  }

  const { active } = source
  const index = source.rail.findIndex((v) => v.id === active.id)
  const prev = index > 0 ? source.rail[index - 1] : undefined
  const next = index >= 0 && index < source.rail.length - 1 ? source.rail[index + 1] : undefined
  const go = (to?: string) => (to ? () => navigate(inV2(to), { replace: true }) : undefined)

  const subjectId = params.get("matiere") ?? session?.subjectIds[0]
  const subject = subjectById(subjectId ?? "")
  const backTo = kind === "seance" && subjectId ? `${BASE}/seances/${subjectId}` : `${BASE}/seances`
  const semester = source.railLabel.match(/\d/)?.[0]
  const label = semester ? `الثلاثي ${ORDINAL[Number(semester) - 1] ?? semester}` : source.railLabel

  const playlist = (
    <PlaylistPanel
      rows={rows}
      activeId={active.id}
      label={label}
      groups={source.groups && { ...source.groups, list: source.groups.list.map((g) => ({ ...g, to: inV2(g.to) })) }}
      mode={mode}
      onMode={setMode}
      wide={wide}
    />
  )

  return (
    <div className="flex flex-col gap-4">
      <Link data-uisfx="back"
        to={backTo}
        className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full pe-3 text-[calc(9.5px*var(--ts))] font-medium text-v2-ink/75 transition hover:text-v2-brand"
      >
        <ArrowRight className="size-5" />
        تسجيلات{subject ? ` · ${frenchName(subject.name)}` : ""}
      </Link>

      {/* One grid, explicit placement at lg: the list spans the start column,
          the player column's three blocks stack in the other. Below lg the DOM
          order IS the reading order — player, list, documents, comments — so
          the list isn't buried under the wall on a phone. */}
      <div
        className={cn(
          // 500ms = `WIDTH_MS`; a long, soft ease-out so the move settles rather than stops.
          "grid gap-6 motion-safe:transition-[grid-template-columns] motion-safe:duration-500 motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)] lg:grid-rows-[auto_auto_1fr] 2xl:gap-8",
          COLS[mode],
          // Folding waits for the list to finish fading out (PlaylistPanel);
          // opening starts at once, and the list fades in behind it.
          mode === "video" && "motion-safe:delay-[110ms]",
        )}
      >
        {/* ---- Stage, steps, title ---- */}
        <div className="min-w-0 lg:col-start-2 lg:row-start-1">
          <div className="relative overflow-hidden rounded-3xl border border-v2-ink/15 bg-v2-surface">
            <VideoStage
              player={player}
              title={active.title}
              kindLabel={active.kindLabel}
              context={active.context}
              position={{ index: Math.max(index, 0), total: source.rail.length }}
              onPrev={go(prev?.to)}
              onNext={go(next?.to)}
            />
            {/* The frame's poster: a clean card and the one obvious action.
                Gone for good once the élève has pressed play — stepping to the
                next video keeps playing, it doesn't ask again. */}
            {!started && (
              <button
                type="button"
                data-uisfx="play" onClick={() => {
                  setStarted(true)
                  if (player.ready) player.toggle()
                }}
                aria-label="شغّل الفيديو"
                className="group absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-v2-surface"
              >
                <span className="grid size-24 place-items-center rounded-full bg-v2-cta/45 transition group-hover:scale-105 md:size-28">
                  <span className="grid size-[4.5rem] place-items-center rounded-full bg-v2-grad text-white shadow-lg shadow-v2-brand/30 md:size-20">
                    <Play className="size-8 translate-x-0.5 fill-current" />
                  </span>
                </span>
                {session && (
                  <span className="text-[calc(8px*var(--ts))] text-v2-ink/50">
                    {frenchName(subject?.name)} · <bdi>{durationLabel(session.startTime, session.endTime)}</bdi>
                  </span>
                )}
              </button>
            )}
          </div>

          {/* « السابق · 1/6 · الجاي » — previous on the start side, as read. */}
          <div className="mt-3 flex items-center justify-between">
            <StepButton label="السابق" sound="skip-previous" onClick={go(prev?.to)} icon={<SkipForward className="size-4" />} />
            <span className="text-[calc(8.5px*var(--ts))] tabular-nums text-v2-ink/70" dir="ltr">
              {Math.max(index, 0) + 1}/{source.rail.length}
            </span>
            <StepButton label="الجاي" sound="skip-next" onClick={go(next?.to)} icon={<SkipBack className="size-4" />} end />
          </div>

          <div className="mt-4">
            {subject && <p className="text-[calc(8px*var(--ts))] font-medium uppercase tracking-wide text-v2-ink/55">{frenchName(subject.name)}</p>}
            <h1 dir="auto" className="text-[calc(14px*var(--ts))] font-bold leading-snug text-v2-ink md:text-[calc(17px*var(--ts))]">
              {active.title}
            </h1>
            <p className="mt-1 text-[calc(8.5px*var(--ts))] text-v2-ink/60">
              {session ? publishedLabel(session.publishedAt ?? session.date) : active.context}
              {session && teacherName(session.teacherId) && ` · ${teacherName(session.teacherId)}`}
            </p>
          </div>
        </div>

        {/* ---- The list ---- */}
        <aside className="min-w-0 lg:col-start-1 lg:row-span-3 lg:row-start-1">
          <div className="lg:sticky lg:top-6">{playlist}</div>
        </aside>

        {/* ---- Documents ---- */}
        <div className="min-w-0 lg:col-start-2 lg:row-start-2">
          <Panel title="الوثائق" meta={docs.length ? `${docs.length} ${docs.length === 1 ? "ملف" : "ملفّات"}` : undefined}>
            {docs.length === 0 ? (
              <PanelEmpty icon={FolderOpen} title="ما فمّا حتّى وثيقة للفيديو هذا" body="كي ينزّل الأستاذ الكور ولّا تمرين، يظهرلك هوني." />
            ) : (
              <ul className={cn("grid gap-4", mode !== "list" && "sm:grid-cols-2")}>
                {docs.map((doc) => {
                  const taken = has(doc.id)
                  return (
                    <li key={doc.id}>
                      <div
                        className={cn(
                          "flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-3 py-5 text-center transition",
                          taken ? "border-v2-ink/25 bg-v2-ink/[0.03]" : "border-v2-brand bg-v2-brand/[0.08]",
                        )}
                      >
                        <span className="grid size-14 place-items-center rounded-full bg-v2-surface">
                          <FolderOpen className="size-7 stroke-v2-grad" strokeWidth={1.6} />
                        </span>
                        <p dir="auto" className="line-clamp-2 text-[calc(9px*var(--ts))] font-medium leading-snug text-v2-ink">
                          {doc.pdf.name}
                        </p>
                        <p className="text-[calc(7.5px*var(--ts))] text-v2-ink/55">{doc.kind === "cours" ? "كور الحصّة" : "تمرين"}</p>
                        <button
                          type="button"
                          onClick={() => download(doc.id, doc.pdf.name)}
                          className={cn(ctaClass, "mt-1 min-h-10 px-4", taken && "border border-v2-ink/20 bg-transparent hover:shadow-none")}
                        >
                          {taken ? (
                            <>
                              تحمّل <Check className="size-4" />
                            </>
                          ) : (
                            <>
                              اضغط للتحميل <ArrowLeft className="size-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </Panel>
        </div>

        {/* ---- Comments ---- */}
        <div className="min-w-0 lg:col-start-2 lg:row-start-3">
          <V2CommentsPanel key={active.id} kind={kind} videoId={active.id} demoEmpty={demo.comments === "empty"} />
        </div>
      </div>
    </div>
  )
}

function StepButton({
  label,
  sound,
  onClick,
  icon,
  end = false,
}: {
  label: string
  sound: string
  onClick?: () => void
  icon: ReactNode
  end?: boolean
}) {
  return (
    <button
      type="button"
      data-uisfx={sound}
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[calc(8.5px*var(--ts))] font-medium text-v2-ink transition hover:bg-v2-ink/[0.05] disabled:pointer-events-none disabled:opacity-35",
        end && "flex-row-reverse",
      )}
    >
      {icon}
      {label}
    </button>
  )
}
