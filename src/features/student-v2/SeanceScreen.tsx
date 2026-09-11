import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, ArrowRight, Check, CirclePlay, Clock, Download, FileText, FolderOpen, Video } from "lucide-react"
import { SubjectIcon } from "@/components/icons/subjects"
import { useMySessions } from "@/features/student/dashboard/dashboard"
import { formatAway, sessionStart, useNow } from "@/features/student/calendar/schedule"
import { cn, formatTimeRange } from "@/lib/utils"
import { useDownloads } from "./downloads"
import { BASE, dayLabel, frenchName, useLiveState, useLookups, useSessionDocs, v2VideoPath } from "./lib"
import { CtaLink, Panel, PanelEmpty, ctaClass, liveOutlineClass } from "./ui"
import { V2Placeholder } from "./V2Placeholder"

/**
 * One séance — where every card, countdown and « أدخل للمباشر » on the
 * dashboard lands. Not in the Figma yet; composed from the dashboard's own
 * parts (the portrait card, the state chips, the documents list) so it reads
 * as the same family. The replay itself still plays in the old player.
 */
export default function V2SeanceScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const now = useNow()
  const mine = useMySessions()
  const { subjectOf, teacherName } = useLookups()
  const session = mine.find((s) => s.id === id) ?? null

  const { stateFor } = useLiveState(now)
  const state = session ? stateFor(session) : "prevue"
  const docs = useSessionDocs(session, state === "en-cours" || state === "terminee")
  const { has, download, notify } = useDownloads()

  if (!session) {
    return <V2Placeholder title="الحصّة" note="الحصّة هذي ما لقيناهاش في برنامجك." />
  }

  const subject = subjectOf(session)?.name ?? ""
  const teacher = teacherName(session.teacherId)

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        data-uisfx="back" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate(BASE))}
        className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full pe-3 text-[calc(10px*var(--ts))] font-medium text-v2-ink transition hover:text-v2-brand"
      >
        <ArrowRight className="size-5" />
        رجوع
      </button>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <section className="flex flex-col items-center rounded-3xl border border-v2-ink/15 bg-v2-surface p-6 text-center md:p-8">
          <SubjectIcon name={subject} className="aspect-square w-[55%] max-w-[15rem]" />
          <p className="mt-4 text-[calc(8px*var(--ts))] font-medium uppercase tracking-wide text-v2-ink/55">{frenchName(subject)}</p>
          <h1 className="mt-1 text-[calc(15px*var(--ts))] font-bold leading-snug text-v2-ink">
            <bdi>{session.title}</bdi>
          </h1>
          <p className="mt-2 text-[calc(9px*var(--ts))] text-v2-ink/70">
            {dayLabel(session.date)} · {formatTimeRange(session.startTime, session.endTime)}
            {teacher && ` · ${teacher}`}
          </p>
          {session.description && (
            <p className="mt-3 max-w-md text-[calc(8.5px*var(--ts))] leading-relaxed text-v2-ink/60">{session.description}</p>
          )}

          <div className="mt-6 flex w-full max-w-sm flex-col gap-3">
            {state === "en-cours" && (
              <button
                type="button"
                data-uisfx="connect" onClick={() => notify("نحلّولك zoom… (نموذج — ما فمّاش رابط حقيقي)")}
                className={cn(liveOutlineClass, "bg-v2-live text-white hover:bg-v2-live/90")}
              >
                <Video className="size-5" />
                أدخل للمباشر في zoom
              </button>
            )}
            {state === "prevue" && (
              <p className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-v2-brand/10 px-5 text-[calc(9.5px*var(--ts))] font-semibold text-v2-brand">
                <Clock className="size-5" />
                تبدا {formatAway(sessionStart(session).getTime() - now.getTime())}
              </p>
            )}
            {state === "terminee" &&
              (session.recordingUrl ? (
                <Link data-uisfx="play" to={v2VideoPath(session.id, { subjectId: session.subjectIds[0] })} className={liveOutlineClass}>
                  <CirclePlay className="size-5" />
                  شوف التسجيل
                </Link>
              ) : (
                <p className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-dashed border-v2-ink/25 px-5 text-[calc(9px*var(--ts))] text-v2-ink/55">
                  <Clock className="size-4" />
                  التسجيل يوصل قريب
                </p>
              ))}
            {state === "reportee" && (
              <p className="rounded-2xl bg-v2-ink/[0.05] px-4 py-3 text-[calc(9px*var(--ts))] text-v2-ink/65">
                الحصّة هذي تأجّلت — الموعد الجديد يوصلك في إشعار.
              </p>
            )}
          </div>
        </section>

        <Panel icon={FileText} chip="bg-v2-chip-docs" title="وثائق الحصّة" meta={docs.length ? `${docs.length} ملف` : undefined}>
          {docs.length === 0 ? (
            <PanelEmpty
              icon={FolderOpen}
              title="ما فمّا حتّى وثيقة مازال"
              body="الأستاذ ينزّل الكور نهار الحصّة. كي يوصل، يظهرلك هوني."
              action={
                <CtaLink data-uisfx="back" to={BASE}>
                  رجوع للرئيسية <ArrowLeft className="size-4" />
                </CtaLink>
              }
            />
          ) : (
            <ul className="flex flex-col gap-3">
              {docs.map((doc) => {
                const taken = has(doc.id)
                return (
                  <li key={doc.id} className="flex items-center gap-3 rounded-2xl border border-v2-ink/15 p-3 md:p-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-v2-brand/10">
                      <FileText className="size-6 stroke-v2-grad" strokeWidth={1.6} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p dir="auto" className="truncate text-right text-[calc(9.5px*var(--ts))] font-semibold text-v2-ink">
                        {doc.pdf.name}
                      </p>
                      <p className="truncate text-[calc(7.5px*var(--ts))] text-v2-ink/55">
                        {doc.kind === "cours" ? "كور الحصّة" : doc.homework?.note ?? "تمرين"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => download(doc.id, doc.pdf.name)}
                      className={cn(ctaClass, "min-h-10 shrink-0 px-4", taken && "border border-v2-ink/20 bg-transparent hover:shadow-none")}
                    >
                      {taken ? <Check className="size-4" /> : <Download className="size-4" />}
                      {taken ? "تحمّل" : "حمّل"}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}
