import { useMemo, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { ChevronRight, FileCheck2, FileText, Library, PlayCircle, Route, Timer } from "lucide-react"
import { SubjectIcon } from "@/components/icons/subjects"
import { cn } from "@/lib/utils"
import type { Path } from "@/data/types"
import { lessonVideoPath } from "@/features/student/player/links"
import { useData } from "@/stores/useData"
import { BASE, frenchName, inV2 } from "../lib"
import { PanelEmpty } from "../ui"
import { Chip, Disc, FilesSheet, Ribbon } from "./parts"
import { KINDS, chapterMeta, examPath, kindOf, useSubjectBundle, type ChapterBundle, type ChapterItem, type ItemKind } from "./matieres"

type Tab = "parcours" | "chapitres" | "examens"

const TABS: { key: Tab; label: string; icon: typeof Route }[] = [
  { key: "parcours", label: "خطوة بخطوة", icon: Route },
  { key: "chapitres", label: "الدروس", icon: Library },
  { key: "examens", label: "إمتحانات", icon: FileCheck2 },
]

/**
 * « موادي » — one matière, the frame « Main Pgae - Calendar months (7) ».
 *
 * The page is the chapitre list and nothing else: a numbered card each, shut
 * by default, and the one you open swells into a tinted panel carrying its own
 * filter chips and its contenus. The three head tabs swap that list for the
 * matière's parcours or its examens — the same three the old space had, so the
 * data behind them is unchanged.
 *
 * Two things the frame decides and the code keeps:
 *   — a chapitre with nothing published is NOT a disabled row; it keeps its
 *     card and wears « قريباً » in the corner. Most of the curriculum is in
 *     that state, and pretending otherwise would make the page a lie.
 *   — the corner flag and the numbered disc are physical-left and
 *     reading-start respectively; the frame draws them that way in RTL.
 *
 * Referenced for density: SubjectRecordingsScreen (trimester accordion, locked
 * rows) and DocsPanel (file rows).
 */
export default function V2SubjectScreen() {
  const { subjectId } = useParams()
  const [params, setParams] = useSearchParams()
  const { subject, chapters, paths, exams, counts } = useSubjectBundle(subjectId)

  const raw = params.get("tab")
  const tab: Tab = TABS.some((t) => t.key === raw) ? (raw as Tab) : "chapitres"

  function setTab(next: Tab) {
    const p = new URLSearchParams(params)
    if (next === "chapitres") p.delete("tab")
    else p.set("tab", next)
    setParams(p, { replace: true })
  }

  if (!subject) {
    return (
      <PanelEmpty
        icon={Library}
        title="المادة ما تلقاتش"
        body="يمكن تبدّلت. أرجع لموادك واختار وحدة أخرى."
        action={
          <Link to={`${BASE}/matieres`} data-uisfx="back" className="font-semibold text-v2-brand hover:underline">
            موادي
          </Link>
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-5 md:gap-7 2xl:gap-9">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
        <div className="flex min-w-0 items-center gap-3 md:gap-4 2xl:gap-6">
          <span className="grid size-16 shrink-0 place-items-center md:size-20 2xl:size-[138px]">
            <SubjectIcon name={subject.name} className="size-full" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-[calc(17px*var(--ts))] font-extrabold leading-tight text-v2-ink md:text-[calc(22px*var(--ts))] 2xl:text-[calc(27px*var(--ts))]">
              {subject.name}
            </h1>
            <p className="truncate text-[calc(8.5px*var(--ts))] text-v2-ink/55 md:text-[calc(10px*var(--ts))]" dir="ltr">
              {frenchName(subject.name) ?? ""}
            </p>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="محتوى المادة"
          className="-mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0 2xl:gap-4"
        >
          {TABS.map((t) => (
            <Chip
              key={t.key}
              active={tab === t.key}
              icon={t.icon}
              label={t.label}
              count={counts[t.key]}
              onClick={() => setTab(t.key)}
              className="2xl:min-w-[216px]"
            />
          ))}
        </div>
      </header>

      {tab === "chapitres" && <ChapterList chapters={chapters} />}
      {tab === "parcours" && <PathList paths={paths} />}
      {tab === "examens" && <ExamList subjectId={subject.id} exams={exams} />}
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * الدروس — the chapitres
 * ------------------------------------------------------------------ */

function ChapterList({ chapters }: { chapters: ChapterBundle[] }) {
  // The frame opens on the first chapitre that actually has something in it —
  // arriving on a matière, an élève wants to be shown where the content starts.
  const first = useMemo(() => chapters.find((c) => !c.empty)?.chapter.id ?? null, [chapters])
  const [open, setOpen] = useState<string | null>(first)

  if (chapters.length === 0) {
    return (
      <PanelEmpty
        icon={Library}
        title="ما فمّاش دروس مازال"
        body="الدروس متع المادة هاذي مازالوا ما تنشروش. كي يوصلوا، تلقاهم هوني مرتّبين بالفصول."
      />
    )
  }

  return (
    <ul className="flex flex-col gap-4 2xl:gap-8">
      {chapters.map((b, i) => (
        <li key={b.chapter.id} className="rise" style={{ ["--i" as string]: Math.min(i, 12) }}>
          <ChapterCard
            bundle={b}
            n={i + 1}
            open={open === b.chapter.id}
            onToggle={() => setOpen((cur) => (cur === b.chapter.id ? null : b.chapter.id))}
          />
        </li>
      ))}
    </ul>
  )
}

function ChapterCard({
  bundle,
  n,
  open,
  onToggle,
}: {
  bundle: ChapterBundle
  n: number
  open: boolean
  onToggle: () => void
}) {
  const { chapter, items, byKind, empty } = bundle
  // The first kind that has something, so opening never lands on an empty list.
  const [kind, setKind] = useState<ItemKind>(() => KINDS.find((k) => byKind[k.key] > 0)?.key ?? "cours")
  const [files, setFiles] = useState<{ title: string; files: { name: string }[] } | null>(null)

  const shown = items.filter((i) => i.kind === kind)

  const head = (
    <>
      <Disc n={n} open={open} />
      <div className="min-w-0 flex-1 text-start">
        <p
          className={cn(
            "truncate font-bold text-v2-ink",
            "text-[calc(13px*var(--ts))] md:text-[calc(16px*var(--ts))] 2xl:text-[calc(20.5px*var(--ts))]",
          )}
          dir="auto"
        >
          {chapter.name}
        </p>
        <p className="truncate text-[calc(9px*var(--ts))] text-v2-ink/60 md:text-[calc(10.5px*var(--ts))] 2xl:text-[calc(11.7px*var(--ts))]">
          {chapterMeta(bundle)}
        </p>
      </div>
    </>
  )

  if (empty) {
    // Not a button: there is nothing to open. The corner says why.
    return (
      <div className="relative flex min-h-[5rem] items-center gap-3 overflow-hidden rounded-2xl border border-v2-ink/50 bg-v2-surface py-4 ps-4 pe-[5.25rem] md:pe-[7rem] 2xl:pe-[130px] md:min-h-[108px] md:gap-5 md:ps-6 2xl:min-h-[136px] 2xl:gap-5 2xl:ps-6">
        <Ribbon>قريباً</Ribbon>
        <div className="flex w-full items-center gap-3 md:gap-5">{head}</div>
      </div>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        data-uisfx="expand"
        onClick={onToggle}
        aria-expanded={false}
        className="group relative flex min-h-[5rem] w-full items-center gap-3 rounded-2xl border border-v2-ink/50 bg-v2-surface px-4 py-4 text-start transition hover:border-v2-ink/70 hover:shadow-md md:min-h-[108px] md:gap-5 md:px-6 2xl:min-h-[136px] 2xl:px-6"
      >
        {head}
        <ChevronRight className="size-5 shrink-0 rotate-90 text-v2-ink/40 transition group-hover:text-v2-ink md:size-6" strokeWidth={2} />
      </button>
    )
  }

  return (
    <section className="rounded-2xl bg-v2-chapter p-3 md:p-5 2xl:p-6">
      <button
        type="button"
        data-uisfx="collapse"
        onClick={onToggle}
        aria-expanded
        className="flex w-full items-center gap-3 rounded-2xl px-1 text-start md:gap-5 2xl:gap-5"
      >
        <Disc n={n} open />
        <div className="min-w-0 flex-1 text-start">
          <p
            className="truncate font-bold text-v2-ink text-[calc(14px*var(--ts))] md:text-[calc(17px*var(--ts))] 2xl:text-[calc(21px*var(--ts))]"
            dir="auto"
          >
            {chapter.name}
          </p>
          <p className="truncate text-[calc(9px*var(--ts))] text-v2-ink/70 md:text-[calc(10.5px*var(--ts))] 2xl:text-[calc(11.7px*var(--ts))]">
            {chapterMeta(bundle)}
          </p>
        </div>
        <ChevronRight className="size-5 shrink-0 -rotate-90 text-v2-ink/50 md:size-6" strokeWidth={2} />
      </button>

      <div
        role="tablist"
        aria-label="نوع المحتوى"
        className="-mx-3 mt-4 flex justify-start gap-2 overflow-x-auto px-3 pb-1 md:mx-0 md:mt-5 md:px-0 2xl:mt-6 2xl:gap-[21px]"
      >
        {KINDS.map((k) => (
          <Chip
            key={k.key}
            tone="brand"
            active={kind === k.key}
            icon={k.icon}
            label={k.label}
            onClick={() => setKind(k.key)}
            className="h-10 md:h-11 2xl:h-[46px]"
          />
        ))}
      </div>

      <ul className="mt-3 flex flex-col gap-3 md:mt-4 2xl:mt-5 2xl:gap-6">
        {shown.length === 0 ? (
          <li>
            <div className="rounded-2xl border border-white/50 bg-v2-surface/70 px-5 py-6 text-center">
              <p className="text-[calc(10px*var(--ts))] font-semibold text-v2-ink md:text-[calc(12px*var(--ts))]">
                ما فمّاش {kindOf(kind).label} في الفصل هذا
              </p>
              <p className="mt-1 text-[calc(9px*var(--ts))] text-v2-ink/60 md:text-[calc(10px*var(--ts))]">
                جرّب نوع آخر من فوق — {KINDS.filter((k) => byKind[k.key] > 0).map((k) => k.label).join("، ") || "مازال ما فمّاش محتوى"}.
              </p>
            </div>
          </li>
        ) : (
          shown.map((item) => (
            <li key={item.id}>
              <ItemCard item={item} onFiles={() => setFiles({ title: item.title, files: item.files })} />
            </li>
          ))
        )}
      </ul>

      <FilesSheet
        title={files?.title ?? ""}
        subtitle={chapter.name}
        files={files?.files ?? null}
        onOpenChange={(o) => !o && setFiles(null)}
      />
    </section>
  )
}

function ItemCard({ item, onFiles }: { item: ChapterItem; onFiles: () => void }) {
  const meta = kindOf(item.kind)
  return (
    <article className="relative flex min-h-[6rem] items-center gap-3 overflow-hidden rounded-2xl border border-v2-ink/50 bg-v2-surface py-4 ps-4 pe-[5.25rem] md:pe-[7rem] 2xl:pe-[130px] transition hover:shadow-md md:min-h-[120px] md:ps-6 2xl:min-h-[152px] 2xl:ps-7">
      <Ribbon>{meta.ribbon}</Ribbon>
      <div className="min-w-0 flex-1">
        <h3
          className="truncate font-bold text-v2-ink text-[calc(12px*var(--ts))] md:text-[calc(15px*var(--ts))] 2xl:text-[calc(19.3px*var(--ts))]"
          dir="auto"
        >
          {item.title}
        </h3>
        <div className="mt-2 flex items-center justify-start gap-4 md:mt-3 md:gap-6 2xl:gap-8">
          {item.videoPath ? (
            <Link
              to={item.videoPath}
              data-uisfx="play"
              className="inline-flex items-center gap-2 text-v2-ink/60 transition hover:text-v2-brand"
            >
              <PlayCircle className="size-5 shrink-0 text-v2-brand md:size-6 2xl:size-7" strokeWidth={1.75} />
              <span className="text-[calc(10px*var(--ts))] font-medium md:text-[calc(13px*var(--ts))] 2xl:text-[calc(16px*var(--ts))]">
                فيديو
              </span>
            </Link>
          ) : item.kind === "quiz" ? (
            <span className="inline-flex items-center gap-2 text-v2-ink/60">
              <Timer className="size-5 shrink-0 text-v2-brand md:size-6 2xl:size-7" strokeWidth={1.75} />
              <span className="text-[calc(10px*var(--ts))] font-medium md:text-[calc(13px*var(--ts))] 2xl:text-[calc(16px*var(--ts))]">
                {item.questionCount} أسئلة · {item.durationMin} دق
              </span>
            </span>
          ) : null}

          {item.files.length > 0 && (
            <button
              type="button"
              data-uisfx="open"
              onClick={onFiles}
              className="inline-flex items-center gap-2 text-v2-ink/60 transition hover:text-v2-brand"
            >
              <FileText className="size-5 shrink-0 text-v2-brand md:size-6 2xl:size-7" strokeWidth={1.75} />
              <span className="text-[calc(10px*var(--ts))] font-medium md:text-[calc(13px*var(--ts))] 2xl:text-[calc(16px*var(--ts))]">
                {item.files.length > 1 ? `${item.files.length} وثائق` : "وثيقة"}
              </span>
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

/* ------------------------------------------------------------------ *
 * خطوة بخطوة · إمتحانات — the same card, different cargo
 * ------------------------------------------------------------------ */

function PathList({ paths }: { paths: Path[] }) {
  const lessons = useData((s) => s.lessons)
  const quizzes = useData((s) => s.quizzes)
  const [open, setOpen] = useState<string | null>(paths[0]?.id ?? null)

  if (paths.length === 0) {
    return (
      <PanelEmpty
        icon={Route}
        title="ما فمّاش مسار مازال"
        body="المسار يعطيك الطريق: درس، تمارين، وبعد كويز. كي نحضّروه للمادة هاذي، يظهرلك هوني."
      />
    )
  }

  return (
    <ul className="flex flex-col gap-4 2xl:gap-8">
      {paths.map((p, i) => {
        const shown = open === p.id
        return (
          <li key={p.id} className="rise" style={{ ["--i" as string]: Math.min(i, 12) }}>
            <section className={cn("rounded-2xl", shown ? "bg-v2-chapter p-3 md:p-5 2xl:p-6" : "")}>
              <button
                type="button"
                data-uisfx={shown ? "collapse" : "expand"}
                onClick={() => setOpen((cur) => (cur === p.id ? null : p.id))}
                aria-expanded={shown}
                className={cn(
                  "relative flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-start transition md:gap-5 md:px-6",
                  shown ? "px-1 md:px-1" : "min-h-[5rem] border border-v2-ink/50 bg-v2-surface hover:border-v2-ink/70 hover:shadow-md md:min-h-[108px] 2xl:min-h-[136px]",
                )}
              >
                <Disc n={i + 1} open={shown} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-v2-ink text-[calc(13px*var(--ts))] md:text-[calc(16px*var(--ts))] 2xl:text-[calc(20.5px*var(--ts))]" dir="auto">
                    {p.title}
                  </p>
                  <p className="line-clamp-1 text-[calc(9px*var(--ts))] text-v2-ink/60 md:text-[calc(10.5px*var(--ts))] 2xl:text-[calc(11.7px*var(--ts))]">
                    {p.items.length} مرحلة · {p.description ?? ""}
                  </p>
                </div>
                <ChevronRight
                  className={cn("size-5 shrink-0 text-v2-ink/40 transition md:size-6", shown ? "-rotate-90" : "rotate-90")}
                  strokeWidth={2}
                />
              </button>

              {shown && (
                <ol className="mt-3 flex flex-col gap-3 md:mt-4 2xl:mt-5 2xl:gap-6">
                  {p.items.map((step, k) => {
                    const lesson = step.refType === "lesson" ? lessons.find((l) => l.id === step.refId) : undefined
                    const quiz = step.refType === "quiz" ? quizzes.find((q) => q.id === step.refId) : undefined
                    const title = lesson?.title ?? quiz?.title ?? "محتوى"
                    const to = lesson?.videoUrl ? inV2(lessonVideoPath(lesson.id, p.subjectId)) : undefined
                    const rowClass = cn(
                      "relative flex min-h-[4.5rem] items-center gap-3 overflow-hidden rounded-2xl border border-v2-ink/50 bg-v2-surface py-4 ps-4 pe-[5.25rem] md:pe-[7rem] 2xl:pe-[130px] md:min-h-[96px] md:ps-6",
                      to && "transition hover:shadow-md",
                    )
                    const inner = (
                      <>
                        <Ribbon>{quiz ? "QUIZ" : "ÉTAPE"}</Ribbon>
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-v2-grad-25 text-[calc(9px*var(--ts))] font-bold text-v2-ink md:size-10 md:text-[calc(10px*var(--ts))]">
                            {k + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-bold text-v2-ink text-[calc(12px*var(--ts))] md:text-[calc(14px*var(--ts))] 2xl:text-[calc(17px*var(--ts))]" dir="auto">
                              {title}
                            </span>
                            <span className="mt-1 flex items-center gap-2 text-v2-ink/60">
                              {to ? (
                                <PlayCircle className="size-5 shrink-0 text-v2-brand" strokeWidth={1.75} />
                              ) : (
                                <Timer className="size-5 shrink-0 text-v2-brand" strokeWidth={1.75} />
                              )}
                              <span className="text-[calc(9.5px*var(--ts))] font-medium md:text-[calc(11px*var(--ts))]">
                                {quiz ? `${quiz.questions?.length ?? 0} أسئلة · ${quiz.durationMin} دق` : to ? "فيديو" : "وثائق برك"}
                              </span>
                            </span>
                          </span>
                      </>
                    )
                    return (
                      <li key={step.id}>
                        {to ? (
                          <Link to={to} data-uisfx="play" className={rowClass}>
                            {inner}
                          </Link>
                        ) : (
                          <div className={rowClass}>{inner}</div>
                        )}
                      </li>
                    )
                  })}
                </ol>
              )}
            </section>
          </li>
        )
      })}
    </ul>
  )
}

function ExamList({
  subjectId,
  exams,
}: {
  subjectId: string
  exams: { id: string; title: string; videoUrl?: string; pdfs?: { name: string }[] }[]
}) {
  const [files, setFiles] = useState<{ title: string; files: { name: string }[] } | null>(null)

  if (exams.length === 0) {
    return (
      <PanelEmpty
        icon={FileCheck2}
        title="ما فمّاش إمتحانات مازال"
        body="الفروض والإمتحانات مع الإصلاح يتزادوا طول السنة. كي يوصلوا، تلقاهم هوني."
      />
    )
  }

  return (
    <>
      <ul className="flex flex-col gap-4 2xl:gap-6">
        {exams.map((e, i) => (
          <li key={e.id} className="rise" style={{ ["--i" as string]: Math.min(i, 12) }}>
            <article className="relative flex min-h-[5rem] items-center gap-3 overflow-hidden rounded-2xl border border-v2-ink/50 bg-v2-surface py-4 ps-4 pe-[5.25rem] md:pe-[7rem] 2xl:pe-[130px] md:min-h-[108px] md:gap-5 md:ps-6 2xl:min-h-[136px]">
              <Ribbon>EXAMEN</Ribbon>
              <Disc n={i + 1} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-v2-ink text-[calc(13px*var(--ts))] md:text-[calc(16px*var(--ts))] 2xl:text-[calc(20.5px*var(--ts))]" dir="auto">
                  {e.title}
                </p>
                <div className="mt-2 flex items-center justify-start gap-4 md:gap-6">
                  {examPath(e as never, subjectId) && (
                    <Link
                      to={examPath(e as never, subjectId)!}
                      data-uisfx="play"
                      className="inline-flex items-center gap-2 text-v2-ink/60 transition hover:text-v2-brand"
                    >
                      <PlayCircle className="size-5 shrink-0 text-v2-brand md:size-6" strokeWidth={1.75} />
                      <span className="text-[calc(10px*var(--ts))] font-medium md:text-[calc(12px*var(--ts))]">الإصلاح بالفيديو</span>
                    </Link>
                  )}
                  {!!e.pdfs?.length && (
                    <button
                      type="button"
                      data-uisfx="open"
                      onClick={() => setFiles({ title: e.title, files: e.pdfs ?? [] })}
                      className="inline-flex items-center gap-2 text-v2-ink/60 transition hover:text-v2-brand"
                    >
                      <FileText className="size-5 shrink-0 text-v2-brand md:size-6" strokeWidth={1.75} />
                      <span className="text-[calc(10px*var(--ts))] font-medium md:text-[calc(12px*var(--ts))]">
                        {e.pdfs.length} وثائق
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
      <FilesSheet
        title={files?.title ?? ""}
        files={files?.files ?? null}
        onOpenChange={(o) => !o && setFiles(null)}
      />
    </>
  )
}
