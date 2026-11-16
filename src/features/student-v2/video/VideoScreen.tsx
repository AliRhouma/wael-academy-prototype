import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
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
import { sfx } from "../sound"
import { Burst, CtaLink, Panel, PanelEmpty, ctaClass, ctaGhostClass, tileClass } from "../ui"
import { V2CommentsPanel } from "./CommentsPanel"
import { PlaylistPanel, type PlaylistMode, type PlaylistRow } from "./PlaylistPanel"

const ORDINAL = ["الأوّل", "الثاني", "الثالث"]

/** Les genres de contenu qui sont de l'entraînement, pas du cours. */
const PRACTICE = new Set(["exercice", "serie"])

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
  const lessons = useData((s) => s.lessons)
  const exams = useData((s) => s.exams)
  const { subjectById, teacherName } = useLookups()

  const valid = rawKind === "lesson" || rawKind === "exam" || rawKind === "seance"
  const kind = (valid ? rawKind : "seance") as VideoRefKind
  const source = usePlayerSource(kind, id ?? "")

  const [mode, setMode] = useState<PlaylistMode>("split")
  const [started, setStarted] = useState(false)
  const videoId = useMemo(() => (source ? youtubeId(videoSrc(source.active.videoUrl)) : undefined), [source])
  const player = useYouTubePlayer(videoId)

  /**
   * « كمّلت الحصّة » — the one celebration this page has, on the REAL end
   * of the video. The controller exposes no `ended` flag, so it is read off
   * what it does expose: the head sits within a second of the duration and
   * playback has stopped (YouTube reports ended as "not playing", and the
   * polled head stops at the end). Once per video per session — `fired`
   * is component memory, not the store, like the ticks in the playlist.
   */
  const ended = player.ready && player.duration > 0 && !player.playing && player.time >= player.duration - 1
  const activeVideoId = source?.active.id
  const fired = useRef<Set<string>>(new Set())
  const [finish, setFinish] = useState<{ id: string; at: number } | null>(null)
  useEffect(() => {
    if (!ended || !activeVideoId || fired.current.has(activeVideoId)) return
    fired.current.add(activeVideoId)
    sfx("achievement")
    setFinish({ id: activeVideoId, at: Date.now() })
    // Gone in 1.2 s — the next action must never wait on a celebration.
    const t = window.setTimeout(() => setFinish(null), 1200)
    return () => window.clearTimeout(t)
  }, [ended, activeVideoId])
  const dismissFinish = () => {
    if (!finish) return
    sfx("close")
    setFinish(null)
  }

  const session = kind === "seance" ? (sessions.find((s) => s.id === id) ?? null) : null
  const sessionDocs = useSessionDocs(session, true)
  const { has, download } = useDownloads()

  /**
   * Les documents de CE replay.
   *
   * Une séance apporte les siens (le cours de la séance, les exercices que le
   * prof a envoyés). Un contenu de matière — un cours, un exercice — porte ses
   * propres PDF, et ce sont eux qu'il faut ici : arriver sur le lecteur d'une
   * leçon et lire « ما فمّا حتّى وثيقة » alors que la carte d'où l'on vient
   * annonçait une vidéo ET une vothèque, c'était la page qui perdait la moitié
   * de la leçon en chemin. Même panneau, même bouton de téléchargement ; seule
   * la provenance change.
   */
  const docs = useMemo<{ id: string; name: string; label: string }[]>(() => {
    if (kind === "seance")
      return sessionDocs.map((d) => ({
        id: d.id,
        name: d.pdf.name,
        label: d.kind === "cours" ? "كور الحصّة" : "تمرين",
      }))
    if (kind === "lesson") {
      const lesson = lessons.find((l) => l.id === id)
      const label = lesson && PRACTICE.has(lesson.kind) ? "تمرين" : "كور الدرس"
      return (lesson?.pdfs ?? []).map((pdf, i) => ({ id: `${lesson!.id}#${i}`, name: pdf.name, label }))
    }
    const exam = exams.find((e) => e.id === id)
    return (exam?.pdfs ?? []).map((pdf, i) => ({ id: `${exam!.id}#${i}`, name: pdf.name, label: "إمتحان" }))
  }, [kind, id, sessionDocs, lessons, exams])

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
        className="hidden min-h-11 w-fit items-center gap-2 rounded-full pe-3 lg:inline-flex text-[calc(9.5px*var(--ts))] font-medium text-v2-ink/75 transition hover:text-v2-brand"
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
          {/* `v2-stage`: the play skin re-dresses the shared stage's timeline
              from here (12 px bar, chunky scrubber) — the kit stays untouched. */}
          <div className="v2-stage relative overflow-hidden rounded-3xl border border-v2-ink/15 bg-v2-surface">
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
                  <span className="v2-play-badge grid size-[4.5rem] place-items-center rounded-full bg-v2-cta text-v2-on-cta shadow-lg shadow-v2-cta/40 md:size-20">
                    <Play className="size-8 translate-x-0.5 fill-current" />
                  </span>
                </span>
                {session && (
                  <span className="text-[calc(8px*var(--ts))] text-v2-ink-2">
                    {frenchName(subject?.name)} · <bdi>{durationLabel(session.startTime, session.endTime)}</bdi>
                  </span>
                )}
              </button>
            )}

            {/* The finish: a stamp over the stage, the burst, and the way on.
                Tapping anywhere dismisses it (a `close`); the « الجاي » inside
                stops the tap and steps on instead. Reduced motion keeps the
                stamp and drops the rest (CSS). */}
            {finish && finish.id === active.id && (
              <div
                role="presentation"
                onClick={dismissFinish}
                className="v2-finish absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-v2-ink/70 p-4 text-center"
              >
                <span className="relative">
                  <span className="v2-stamp inline-flex rounded-xl border-2 border-v2-cta bg-v2-surface px-4 py-1.5 text-[calc(14px*var(--ts))] font-extrabold text-v2-ink" data-tone="cta">
                    كمّلت الحصّة! الجاية؟
                  </span>
                  <Burst at={finish.at} />
                </span>
                {next && (
                  <button
                    type="button"
                    data-uisfx="skip-next"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFinish(null)
                      go(next.to)?.()
                    }}
                    className={ctaClass}
                  >
                    <SkipBack className="size-4" />
                    الجاي
                  </button>
                )}
              </div>
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
            {subject && <p className="text-[calc(8px*var(--ts))] font-medium uppercase tracking-wide text-v2-ink-2">{frenchName(subject.name)}</p>}
            <h1 dir="auto" className="text-[calc(14px*var(--ts))] font-bold leading-snug text-v2-ink md:text-[calc(17px*var(--ts))]">
              {active.title}
            </h1>
            <p className="mt-1 text-[calc(8.5px*var(--ts))] text-v2-ink-2">
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
                    // The same collectible as the dashboard's: a tile with a
                    // lip until taken, then the tick.
                    <li key={doc.id} className={cn(tileClass, "rounded-2xl border border-transparent")} data-taken={taken}>
                      <div
                        className={cn(
                          "v2-doc-inner flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-3 py-5 text-center transition",
                          taken ? "border-v2-ink/25 bg-v2-ink/[0.03]" : "border-v2-brand bg-v2-brand/[0.08]",
                        )}
                      >
                        <span className="v2-doc-plate relative grid size-14 place-items-center rounded-full bg-v2-surface" data-kind={doc.label === "تمرين" ? "exercice" : "cours"}>
                          <FolderOpen className="size-7 stroke-v2-grad" strokeWidth={1.6} />
                          {taken && (
                            <span className="v2-tick absolute -bottom-0.5 -end-0.5 grid size-5 place-items-center rounded-full bg-v2-brand text-white ring-2 ring-v2-surface">
                              <Check className="size-3" strokeWidth={3} />
                            </span>
                          )}
                        </span>
                        <p dir="auto" className="line-clamp-2 text-[calc(9px*var(--ts))] font-medium leading-snug text-v2-ink">
                          {doc.name}
                        </p>
                        <p className="text-[calc(7.5px*var(--ts))] text-v2-ink-2">{doc.label}</p>
                        <button
                          type="button"
                          onClick={() => download(doc.id, doc.name)}
                          className={cn(ctaClass, "mt-1 min-h-11 px-4", taken && ctaGhostClass)}
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
        // A chunky secondary under the play skin (`v2-btn`); quiet text here.
        "v2-btn inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[calc(8.5px*var(--ts))] font-medium text-v2-ink transition hover:bg-v2-ink/[0.05] disabled:pointer-events-none disabled:opacity-35",
        end && "flex-row-reverse",
      )}
    >
      {icon}
      {label}
    </button>
  )
}
