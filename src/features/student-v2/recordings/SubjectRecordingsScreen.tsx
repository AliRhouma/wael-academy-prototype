import { useMemo, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import { ArrowRight, CalendarDays, ChevronDown, Clock, Lock, MonitorPlay, Play, UserRound, Users } from "lucide-react"
import type { Session } from "@/data/types"
import { SubjectIcon } from "@/components/icons/subjects"
import { addDays, dateKey, useNow } from "@/features/student/calendar/schedule"
import {
  academicYearsOf,
  durationLabel,
  semesterOf,
  shortGroupLabel,
  useMyPastSessions,
  yearFromSlug,
  yearSlug,
} from "@/features/student/seances/replays"
import { RECENT_DAYS } from "@/features/student/dashboard/dashboard"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"
import { cn } from "@/lib/utils"
import { useDemoStates } from "../demoStates"
import { BASE, MONTHS, frenchName, parseDay, useLookups, v2VideoPath } from "../lib"
import { CtaLink, PanelEmpty } from "../ui"
import { recordingCount } from "./recordings"

/** How long a séance may show « التسجيل يوصل قريب » before it drops out. */
const PENDING_DAYS = 14

const TRIMESTERS = [
  { n: 1, title: "الثلاثية الأولى", range: "جويلية — ديسمبر" },
  { n: 2, title: "الثلاثية الثانية", range: "جانفي — مارس" },
  { n: 3, title: "الثلاثية الثالثة", range: "أفريل — جوان" },
] as const

/** "10 سبتمبر 2026" */
function longDay(key: string): string {
  const d = parseDay(key)
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

/**
 * One matière's replays — where a تسجيلات card lands, laid out as the
 * reference screen: the portrait and the matière, « تسجيلات · 2026/2027 »
 * and the counts; the groupes as chips; then the year's three trimesters as
 * numbered cards that open onto their recordings. A trimester with nothing in
 * it says so (« ما فماش حصص في الثلاثي هذا ») instead of vanishing, so the
 * year always reads as a year.
 *
 * Année and groupe live in the URL (`?annee=2026-2027&groupe=…`), so a view
 * is a link. Without an active subscription (the states dock « بلا اشتراك »),
 * every recording is locked and points at the offers — « اشترك الآن ».
 */
export default function V2SubjectRecordingsScreen() {
  const { subjectId = "" } = useParams()
  const [params, setParams] = useSearchParams()
  const now = useNow()
  const user = useAuth((s) => s.currentUser)
  const subject = useData((s) => s.subjects.find((x) => x.id === subjectId))
  const groups = useData((s) => s.groups)
  const subscriptions = useData((s) => s.subscriptions)
  const pool = useMyPastSessions()
  const { teacherName } = useLookups()
  const demo = useDemoStates()

  const locked =
    demo.offers === "none" || !subscriptions.some((s) => s.userId === user?.id && s.state === "active")

  // Published replays, plus the last fortnight's séances still waiting for theirs.
  const since = dateKey(addDays(now, -PENDING_DAYS))
  const scope = useMemo(
    () => pool.filter((s) => s.subjectIds.includes(subjectId) && (s.recordingUrl || s.date >= since)),
    [pool, subjectId, since],
  )

  const years = useMemo(() => academicYearsOf(scope), [scope])
  const askedYear = params.get("annee")
  const year = (askedYear && years.find((y) => y === yearFromSlug(askedYear))) || years[0] || ""
  const inYear = useMemo(() => scope.filter((s) => s.academicYear === year), [scope, year])

  /** The groupes that have this matière this year — the élève's own first. */
  const groupTabs = useMemo(() => {
    const myYears = new Set(user?.yearIds ?? [])
    return groups
      .filter((g) => inYear.some((s) => s.groupIds.includes(g.id)) && (!g.yearId || myYears.has(g.yearId)))
      .map((g) => ({
        id: g.id,
        label: shortGroupLabel(g.title),
        title: g.title,
        mine: !!user && g.studentIds.includes(user.id),
        count: inYear.filter((s) => s.groupIds.includes(g.id) && s.recordingUrl).length,
      }))
      .sort((a, b) => Number(b.mine) - Number(a.mine) || b.count - a.count)
  }, [groups, inYear, user])

  const askedGroup = params.get("groupe")
  const groupId = (askedGroup && groupTabs.find((g) => g.id === askedGroup)?.id) || groupTabs[0]?.id
  const group = groupTabs.find((g) => g.id === groupId)
  const list = inYear
    .filter((s) => !groupId || s.groupIds.includes(groupId))
    .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime))
  const recorded = inYear.filter((s) => s.recordingUrl).length

  const setParam = (key: "annee" | "groupe", value: string) => {
    const p = new URLSearchParams(params)
    p.set(key, value)
    if (key === "annee") p.delete("groupe")
    setParams(p, { replace: true })
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 md:gap-6">
      <Link data-uisfx="back"
        to={`${BASE}/seances`}
        className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full pe-3 text-[calc(9.5px*var(--ts))] font-medium text-v2-ink/75 transition hover:text-v2-brand"
      >
        <ArrowRight className="size-5" />
        تسجيلات
      </Link>

      {/* Header: the portrait on the start edge, the matière beside it. */}
      <header className="group flex items-center gap-4 md:gap-6">
        <span className="grid size-20 shrink-0 place-items-center rounded-full bg-v2-surface shadow-md shadow-v2-ink/10 md:size-28">
          <SubjectIcon name={subject?.name ?? ""} className="aspect-square w-[92%]" />
        </span>
        <div className="min-w-0">
          <p className="text-[calc(8px*var(--ts))] font-semibold text-v2-brand">
            تسجيلات{year && <> · <bdi>{year}</bdi></>}
          </p>
          <h1 className="text-[calc(18px*var(--ts))] font-bold leading-tight text-v2-ink md:text-[calc(22px*var(--ts))]">
            {frenchName(subject?.name)}
          </h1>
          <p className="mt-0.5 text-[calc(8.5px*var(--ts))] text-v2-ink/60">
            {recorded === 0 ? "مازال ما فمّاش تسجيلات" : recordingCount(recorded)} · {groupTabs.length}{" "}
            {groupTabs.length === 1 || groupTabs.length > 10 ? "مجموعة" : "مجموعات"}
          </p>
        </div>
      </header>

      {scope.length === 0 ? (
        <div className="rounded-3xl border border-v2-ink/15 bg-v2-surface p-4 md:p-6">
          <PanelEmpty
            icon={MonitorPlay}
            title={`مازال ما تنشر حتّى تسجيل في ${subject?.name ?? "المادّة هذي"}`}
            body="كي يكمّل الأستاذ حصّة وينزّل التسجيل متاعها، يظهرلك هوني."
            action={<CtaLink data-uisfx="back" to={`${BASE}/seances`}>رجوع للتسجيلات</CtaLink>}
          />
        </div>
      ) : (
        <>
          {/* Groupes (and, when there is more than one, the année) */}
          <div className="flex flex-wrap items-center gap-2">
            {groupTabs.map((g) => {
              const active = g.id === groupId
              return (
                <button
                  key={g.id}
                  type="button"
                  data-uisfx="select" onClick={() => setParam("groupe", g.id)}
                  aria-pressed={active}
                  title={g.title}
                  className={cn(
                    "inline-flex min-h-10 items-center gap-2 rounded-full border ps-3 pe-1.5 text-[calc(8.5px*var(--ts))] font-semibold transition",
                    active
                      ? "border-transparent bg-v2-brand text-white shadow-md shadow-v2-brand/25"
                      : "border-v2-ink/15 bg-v2-surface text-v2-ink hover:border-v2-brand/50",
                  )}
                >
                  <Users className="size-4" strokeWidth={2} />
                  <bdi>{g.label}</bdi>
                  {g.mine && <span className={cn("text-[calc(7px*var(--ts))] font-normal", active ? "text-white/75" : "text-v2-ink/50")}>· مجموعتي</span>}
                  <span
                    className={cn(
                      "grid size-6 place-items-center rounded-full text-[calc(7.5px*var(--ts))] font-bold tabular-nums",
                      active ? "bg-white text-v2-brand" : "bg-v2-ink/[0.07] text-v2-ink/70",
                    )}
                  >
                    {g.count}
                  </span>
                </button>
              )
            })}
            {years.length > 1 && (
              <div className="ms-auto flex rounded-full border border-v2-ink/15 bg-v2-surface p-0.5" role="tablist" aria-label="العام الدراسي">
                {years.map((y) => (
                  <button
                    key={y}
                    type="button"
                    role="tab"
                    aria-selected={y === year}
                    data-uisfx="toggle-on" onClick={() => setParam("annee", yearSlug(y))}
                    className={cn(
                      "min-h-9 rounded-full px-3 text-[calc(7.5px*var(--ts))] font-semibold tabular-nums transition",
                      y === year ? "bg-v2-ink text-white" : "text-v2-ink/60 hover:text-v2-ink",
                    )}
                  >
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Trimesters
            key={`${year}|${groupId}`}
            list={list}
            now={now}
            locked={locked}
            groupId={groupId}
            groupLabel={group?.label}
            subjectName={frenchName(subject?.name)}
            teacherName={teacherName}
          />
        </>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */

function Trimesters({
  list,
  now,
  locked,
  groupId,
  groupLabel,
  subjectName,
  teacherName,
}: {
  list: Session[]
  now: Date
  locked: boolean
  groupId?: string
  groupLabel?: string
  subjectName: string
  teacherName: (id?: string) => string | undefined
}) {
  const byTri = TRIMESTERS.map((t) => ({ ...t, items: list.filter((s) => semesterOf(s) === t.n) }))
  // Open on the trimester the newest recording is in — where the élève left off.
  const [open, setOpen] = useState<Set<number>>(() => new Set(list[0] ? [semesterOf(list[0])] : []))
  const toggle = (n: number) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(n)) next.delete(n)
      else next.add(n)
      return next
    })

  return (
    <ol className="flex flex-col gap-3 md:gap-4">
      {byTri.map((t) => {
        const has = t.items.length > 0
        const on = has && open.has(t.n)
        const ready = t.items.filter((s) => s.recordingUrl).length
        return (
          <li
            key={t.n}
            className={cn(
              "rise overflow-hidden rounded-2xl border bg-v2-surface transition-colors",
              on ? "border-v2-brand/60 shadow-lg shadow-v2-brand/10" : "border-v2-ink/12",
            )}
            style={{ ["--i" as string]: t.n }}
          >
            <button
              type="button"
              data-uisfx={has ? (on ? "collapse" : "expand") : "blocked"} onClick={() => has && toggle(t.n)}
              disabled={!has}
              aria-expanded={on}
              className={cn("flex w-full items-center gap-3 p-4 text-start md:p-5", on && "bg-v2-brand/[0.06]", !has && "cursor-default")}
            >
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-full text-[calc(9px*var(--ts))] font-bold",
                  has ? "bg-v2-grad text-white" : "bg-v2-ink/[0.07] text-v2-ink/45",
                )}
              >
                {t.n}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[calc(10.5px*var(--ts))] font-bold text-v2-ink md:text-[calc(11.5px*var(--ts))]">
                  {t.title} <span className="ms-1 text-[calc(8px*var(--ts))] font-normal text-v2-ink/50">{t.range}</span>
                </span>
                <span className={cn("mt-0.5 flex items-center gap-1.5 text-[calc(8px*var(--ts))]", has ? "font-semibold text-v2-ink/70" : "font-bold text-v2-ink/45")}>
                  {has ? (
                    <>
                      <Play className="size-3 fill-current text-v2-brand" />
                      {ready === 0 ? "التسجيلات جايين" : recordingCount(ready)}
                    </>
                  ) : (
                    "ما فماش حصص في الثلاثي هذا"
                  )}
                </span>
              </span>
              {has && <ChevronDown className={cn("size-5 shrink-0 text-v2-ink/50 transition-transform", on && "rotate-180")} />}
            </button>

            {has && (
              <div className={cn("grid transition-[grid-template-rows] duration-300", on ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                <div className="min-h-0 overflow-hidden">
                  <ul className="grid gap-3 p-3 pt-1 md:p-4 md:pt-1 lg:grid-cols-2">
                    {t.items.map((s) => (
                      <li key={s.id}>
                        <RecordingRow
                          session={s}
                          now={now}
                          locked={locked}
                          groupId={groupId}
                          groupLabel={groupLabel}
                          subjectName={subjectName}
                          teacher={teacherName(s.teacherId)}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}

function RecordingRow({
  session,
  now,
  locked,
  groupId,
  groupLabel,
  subjectName,
  teacher,
}: {
  session: Session
  now: Date
  locked: boolean
  groupId?: string
  groupLabel?: string
  subjectName: string
  teacher?: string
}) {
  const ready = !!session.recordingUrl
  const fresh =
    ready && !!session.publishedAt && new Date(session.publishedAt).getTime() >= new Date(now).setHours(0, 0, 0, 0) - (RECENT_DAYS - 1) * 86_400_000
  const title = [subjectName, session.title, groupLabel].filter(Boolean).join(" | ")

  const status = locked ? (
    <span className="inline-flex items-center gap-1.5 text-v2-ink/55">
      <Lock className="size-3.5" /> اشترك الآن
    </span>
  ) : !ready ? (
    <span className="inline-flex items-center gap-1.5 text-v2-ink/50">
      <Clock className="size-3.5" /> التسجيل يوصل قريب
    </span>
  ) : fresh ? (
    <span className="rounded-full bg-v2-grad px-2 text-[calc(6.5px*var(--ts))] font-bold leading-5 text-white">NEW</span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-v2-brand">
      <Play className="size-3 fill-current" /> شوف التسجيل
    </span>
  )

  const body = (
    <>
      <span className="flex items-center justify-between gap-2 text-[calc(7.5px*var(--ts))] font-semibold">
        {status}
        {ready && !locked && (
          <span className="grid size-9 shrink-0 place-items-center rounded-full border-[1.5px] border-v2-brand text-v2-brand transition group-hover:border-transparent group-hover:bg-v2-grad group-hover:text-white">
            <Play className="size-3.5 translate-x-[-1px] fill-current" />
          </span>
        )}
      </span>
      {/* Two lines, not an ellipsis: « matière | séance | groupe » is long, and
          a one-line clip ate its start on a phone. LTR so the bars and dashes
          keep their order; right-aligned like the Arabic around it. */}
      <span dir="ltr" className={cn("mt-1.5 line-clamp-2 block text-right text-[calc(9.5px*var(--ts))] font-bold leading-snug", ready ? "text-v2-ink" : "text-v2-ink/55")}>
        {title}
      </span>
      <span className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[calc(7.5px*var(--ts))] text-v2-ink/55">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-3.5" /> {longDay(session.date)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5" /> <bdi>{durationLabel(session.startTime, session.endTime)}</bdi>
        </span>
        {teacher && (
          <span className="inline-flex items-center gap-1.5">
            <UserRound className="size-3.5" /> {teacher}
          </span>
        )}
      </span>
    </>
  )

  const shell = "group block rounded-2xl border p-4 transition"
  if (locked) {
    return (
      <Link data-uisfx="blocked" to={`${BASE}/offres`} className={cn(shell, "border-v2-ink/10 bg-v2-ink/[0.025] hover:border-v2-brand/40")}>
        {body}
      </Link>
    )
  }
  if (!ready) return <div className={cn(shell, "border-dashed border-v2-ink/15 bg-v2-surface/60")}>{body}</div>
  return (
    <Link data-uisfx="play"
      to={v2VideoPath(session.id, { subjectId: session.subjectIds[0], groupId })}
      className={cn(shell, "border-v2-ink/10 bg-v2-ink/[0.025] hover:border-v2-brand/40 hover:bg-v2-surface hover:shadow-lg hover:shadow-v2-ink/[0.06]")}
    >
      {body}
    </Link>
  )
}
