import { useMemo, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  Clock3,
  Hourglass,
  MapPin,
  MonitorPlay,
  Play,
  UserRound,
  UsersRound,
} from "lucide-react"
import { Badge } from "@/components/kit/Badge"
import { EmptyState } from "@/components/kit/EmptyState"
import { ShellHeaderPortal } from "@/components/AppShell"
import { SubjectIcon } from "@/components/icons/subjects"
import { subjectTint } from "@/features/student/subjectTint"
import { SubjectPicker } from "@/features/student/matiere/SubjectPicker"
import { SubjectSwitcher } from "@/features/student/matiere/SubjectSwitcher"
import { useSessionLabels } from "@/features/shared/session/sessionLabels"
import { seanceVideoPath } from "@/features/student/player/links"
import {
  SEMESTERS,
  type Semester,
  durationLabel,
  semesterOf,
  shortGroupLabel,
  useMyPastSessions,
  yearFromSlug,
  yearSlug,
} from "@/features/student/seances/replays"
import { videoSrc, youtubeId } from "@/data/media"
import { useStuck } from "@/lib/hooks"
import { cn } from "@/lib/utils"
import type { Session } from "@/data/types"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"

/** "4 oct. 2025" — a replay is often months old, so the year earns its place. */
function dayLabel(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("ar-TN-u-nu-latn", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

/** Semester open in the accordion — "auto" follows the data, "none" is closed. */
type OpenState = Semester | "auto" | "none"

/**
 * Élève — the replays of ONE matière, for one année scolaire.
 *
 * Three nested choices, each one row: the matière rail (same control as the
 * matière page, pointed at this section), then the groupe — a séance belongs to
 * a groupe, and the same chapter is taught twice at two different paces, so the
 * groupe is what makes a replay the right one — then the semestre, as a
 * one-open-at-a-time accordion. Only one list of séances is ever on screen.
 *
 * A séance opens on its own page (`/student/video/seance/…`), where its notes
 * and the avis of the groupe live beside the player.
 *
 * Referenced for spacing & density: StudentSubjectDetailScreen (identity block,
 * matière rail, segmented tabs), ChapitresTab (accordion + video card idiom).
 */
export default function StudentSeanceSubjectScreen() {
  const { subjectId } = useParams()
  const [params, setParams] = useSearchParams()

  const subjects = useData((s) => s.subjects)
  const groups = useData((s) => s.groups)
  const user = useAuth((s) => s.currentUser)
  const { teacherName } = useSessionLabels()

  const pool = useMyPastSessions()
  const subject = subjects.find((s) => s.id === subjectId)
  const tint = subjectTint(subject?.name ?? "", subject?.category)

  /** Sibling matières — the rail, kept identical to the matière page. */
  const siblings = useMemo(
    () =>
      subject
        ? subjects
            .filter((s) => s.yearId === subject.yearId)
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        : [],
    [subjects, subject],
  )

  /** Every past séance of this matière, whatever the année. */
  const ofSubject = useMemo(
    () => (subject ? pool.filter((s) => s.subjectIds.includes(subject.id)) : []),
    [pool, subject],
  )

  const askedYear = params.get("annee")
  const activeYear =
    (askedYear && yearFromSlug(askedYear)) ||
    ofSubject[0]?.academicYear ||
    pool[0]?.academicYear ||
    ""

  const ofYear = useMemo(
    () => ofSubject.filter((s) => s.academicYear === activeYear),
    [ofSubject, activeYear],
  )

  /**
   * The groupes this matière ran with that année — the tab row. A séance shared
   * with another filière (a contrôle blanc, say) also carries THAT filière's
   * groupe; those stay out, they aren't the élève's to browse.
   */
  const groupTabs = useMemo(() => {
    const ids = new Set(ofYear.flatMap((s) => s.groupIds))
    const myYearIds = user?.yearIds ?? []
    return groups
      .filter((g) => ids.has(g.id) && (!g.yearId || myYearIds.includes(g.yearId)))
      .map((g) => ({
        group: g,
        mine: Boolean(user && g.studentIds.includes(user.id)),
        count: ofYear.filter((s) => s.groupIds.includes(g.id) && s.recordingUrl).length,
      }))
      // My own groupe first — it's the one the élève actually attended.
      .sort((a, b) => Number(b.mine) - Number(a.mine))
  }, [ofYear, groups, user])

  const askedGroup = params.get("groupe")
  const activeGroupId =
    groupTabs.find((t) => t.group.id === askedGroup)?.group.id ?? groupTabs[0]?.group.id ?? ""

  function setGroup(id: string) {
    const p = new URLSearchParams(params)
    p.set("groupe", id)
    setParams(p, { replace: true })
  }

  /** The open groupe's séances, split by semestre, in teaching order. */
  const bySemester = useMemo(() => {
    const m = new Map<Semester, Session[]>()
    for (const s of SEMESTERS) m.set(s, [])
    for (const session of ofYear) {
      if (!session.groupIds.includes(activeGroupId)) continue
      m.get(semesterOf(session))!.push(session)
    }
    for (const list of m.values()) list.sort((a, b) => a.date.localeCompare(b.date))
    return m
  }, [ofYear, activeGroupId])

  const [sentinelRef, stuck] = useStuck()
  const [openState, setOpenState] = useState<OpenState>("auto")

  const firstFilled = SEMESTERS.find((s) => (bySemester.get(s)?.length ?? 0) > 0) ?? null
  const open: Semester | null =
    openState === "auto"
      ? firstFilled
      : openState === "none"
        ? null
        : ((bySemester.get(openState)?.length ?? 0) > 0 ? openState : firstFilled)

  function toggle(semester: Semester) {
    setOpenState((current) => (current === semester || (current === "auto" && open === semester) ? "none" : semester))
  }

  if (!subject) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-surface">
        <EmptyState
          icon={MonitorPlay}
          title="المادّة ما تلقاتش"
          description="المادّة هذي ما موجودةش ولا ما عادتش في برنامجك."
          action={
            <Link
              to="/student/seances"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105"
            >
              ارجع للحصص
            </Link>
          }
        />
      </div>
    )
  }

  const recorded = ofYear.filter((s) => s.recordingUrl).length

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb */}
      <nav aria-label="مسار التنقّل" className="flex items-center gap-1.5 text-[calc(13px*var(--ts))] text-ink-muted">
        <Link to="/student" className="transition hover:text-brand-600">
          الرئيسية
        </Link>
        <ChevronLeft className="size-3.5 shrink-0" />
        <Link
          to={`/student/seances?annee=${yearSlug(activeYear)}`}
          className="transition hover:text-brand-600"
        >
          الحصص المسجّلة
        </Link>
        <ChevronLeft className="size-3.5 shrink-0" />
        <span dir="auto" className="truncate font-medium text-brand-600">
          {subject.name}
        </span>
      </nav>

      {/* Identity */}
      <div className="flex items-center gap-3.5">
        <span
          className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg md:size-[72px]"
          style={{ backgroundImage: tint.gradient }}
        >
          <span
            className="absolute size-14 rounded-full blur-2xl"
            style={{ backgroundColor: tint.halo }}
          />
          <SubjectIcon name={subject.name} className="relative size-[54px] md:size-[62px]" />
        </span>
        <div className="min-w-0">
          <p className="text-[calc(11px*var(--ts))] font-medium uppercase tracking-[.12em] text-accent2-600">
            الحصص المسجّلة · <span className="tabular-nums">{activeYear}</span>
          </p>
          <h1
            dir="auto"
            className="truncate font-display text-[calc(24px*var(--ts))] font-bold leading-tight text-ink md:text-[calc(26px*var(--ts))]"
          >
            {subject.name}
          </h1>
          <p className="mt-0.5 text-[calc(13px*var(--ts))] text-ink-muted">
            {recorded === 0
              ? "ما فماش تسجيلات في العام هذا"
              : `${recorded} تسجيل · ${groupTabs.length} فوج`}
          </p>
        </div>
      </div>

      {/* Switch to another matière — the same rail as the matière page */}
      <SubjectSwitcher
        subjects={siblings}
        activeId={subject.id}
        hrefFor={(s) => `/student/seances/${s.id}?annee=${yearSlug(activeYear)}`}
      />

      {groupTabs.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={MonitorPlay}
            title="ما فماش شيء مسجّل للمادّة هذي"
            description={`مازال ما تعملت حتّى حصّة في ${subject.name} على ${activeYear}. جرّب سنة دراسية أخرى ولا مادّة أخرى.`}
            action={
              <Link
                to="/student/seances"
                className="inline-flex h-11 items-center gap-2 rounded-md border border-border-strong bg-surface px-4 text-sm font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"
              >
                بدّل السنة الدراسية
              </Link>
            }
          />
        </div>
      ) : (
        <>
          {/* Marks the moment the groupe tabs below leave the viewport. */}
          <div ref={sentinelRef} aria-hidden="true" className="-mt-px h-px" />

          {/* ---- Groupes ---- */}
          <div
            role="tablist"
            aria-label="فوج"
            className="flex gap-1 overflow-x-auto scroll-touch rounded-lg border border-border bg-surface-muted p-1 [scrollbar-width:none] md:w-fit [&::-webkit-scrollbar]:hidden"
          >
            {groupTabs.map(({ group, mine, count }) => {
              const active = group.id === activeGroupId
              return (
                <button
                  key={group.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setGroup(group.id)}
                  className={cn(
                    "inline-flex h-11 shrink-0 items-center gap-2 rounded-md px-3 text-[calc(13px*var(--ts))] font-medium transition md:h-10 md:px-3.5",
                    active ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink-subtle",
                  )}
                >
                  <UsersRound className={cn("size-4 shrink-0", active && "text-brand-600")} />
                  <span dir="auto" className="max-w-[11rem] truncate">
                    {group.title}
                  </span>
                  {mine && (
                    <span
                      className={cn(
                        "rounded-full px-1.5 text-[calc(10px*var(--ts))] font-medium uppercase tracking-wide",
                        active ? "bg-accent2-50 text-accent2-700" : "bg-neutral-100 text-ink-muted",
                      )}
                    >
                      mon groupe
                    </span>
                  )}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[calc(11px*var(--ts))] tabular-nums",
                      active ? "bg-brand-50 text-brand-700" : "bg-neutral-100 text-ink-muted",
                    )}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/*
            Once the groupe tabs scroll away, their condensed twin appears as a
            SECOND ROW OF THE SHELL HEADER (via portal) — same card, same
            background — with the matière rail folded into its picker chip. Deep
            inside a semestre, changing matière or groupe stays one tap away and
            nothing floats over the séances. Same idiom as the matière page.
          */}
          {stuck && (
            <ShellHeaderPortal>
              <div className="flex items-center gap-2 px-4 py-2 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200 md:px-8">
                <SubjectPicker
                  subjects={siblings}
                  active={subject}
                  hrefFor={(s) => `/student/seances/${s.id}?annee=${yearSlug(activeYear)}`}
                />
                <span aria-hidden="true" className="h-6 w-px shrink-0 bg-border" />
                <div
                  role="tablist"
                  aria-label="فوج"
                  className="flex min-w-0 flex-1 gap-1 overflow-x-auto scroll-touch [scrollbar-width:none] md:flex-none [&::-webkit-scrollbar]:hidden"
                >
                  {groupTabs.map(({ group, mine }) => {
                    const active = group.id === activeGroupId
                    return (
                      <button
                        key={group.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setGroup(group.id)}
                        title={group.title}
                        className={cn(
                          "inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md px-2 text-[calc(13px*var(--ts))] font-medium transition md:flex-none md:px-3.5",
                          active ? "bg-brand-50 text-brand-700" : "text-ink-muted hover:text-ink-subtle",
                        )}
                      >
                        {/* My own groupe keeps a marker even condensed. */}
                        {mine && (
                          <span
                            aria-hidden="true"
                            className={cn(
                              "size-1.5 shrink-0 rounded-full",
                              active ? "bg-accent2-500" : "bg-neutral-300",
                            )}
                          />
                        )}
                        <span dir="auto" className="truncate">
                          {shortGroupLabel(group.title)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </ShellHeaderPortal>
          )}

          {/* ---- Semestres ---- */}
          <ul className="flex flex-col gap-3">
            {SEMESTERS.map((semester) => {
              const list = bySemester.get(semester) ?? []
              const playable = list.filter((s) => s.recordingUrl).length
              const isOpen = open === semester
              const empty = list.length === 0

              return (
                <li
                  key={semester}
                  className={cn(
                    "overflow-hidden rounded-lg border bg-surface shadow-sm transition",
                    empty
                      ? "border-dashed border-border shadow-none"
                      : isOpen
                        ? "border-brand-200 shadow-md"
                        : "border-border hover:border-brand-200",
                  )}
                >
                  <h2>
                    <button
                      type="button"
                      disabled={empty}
                      onClick={() => toggle(semester)}
                      aria-expanded={isOpen}
                      aria-controls={`semestre-${semester}`}
                      className="flex w-full items-center gap-3 p-4 text-start disabled:cursor-default"
                    >
                      <span
                        className={cn(
                          "grid size-10 shrink-0 place-items-center rounded-md font-display text-[calc(15px*var(--ts))] font-bold tabular-nums transition",
                          empty
                            ? "bg-neutral-100 text-ink-muted"
                            : isOpen
                              ? "bg-grad text-ink-inverted shadow-brand"
                              : "bg-brand-50 text-brand-600",
                        )}
                      >
                        {semester}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block font-display text-[calc(15px*var(--ts))] font-bold leading-snug",
                            empty ? "text-ink-muted" : isOpen ? "text-brand-700" : "text-ink",
                          )}
                        >
                          Semestre {semester}
                        </span>
                        <span className="mt-0.5 block text-[calc(12px*var(--ts))] text-ink-muted">
                          {empty
                            ? "ما فماش حصص في الثلاثي هذا"
                            : `${list.length} حصّة · ${playable} تسجيل`}
                        </span>
                      </span>
                      {!empty && (
                        <ChevronDown
                          className={cn(
                            "size-5 shrink-0 text-ink-muted transition-transform duration-200",
                            isOpen && "rotate-180 text-brand-600",
                          )}
                        />
                      )}
                    </button>
                  </h2>

                  {isOpen && !empty && (
                    <div
                      id={`semestre-${semester}`}
                      className="border-t border-border bg-surface-muted/60 p-4 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-2 motion-safe:duration-200"
                    >
                      <ul className="grid gap-2.5">
                        {list.map((session) => (
                          <li key={session.id}>
                            <SeanceCard
                              session={session}
                              teacher={teacherName(session.teacherId)}
                              to={seanceVideoPath(session.id, {
                                subjectId: subject.id,
                                groupId: activeGroupId,
                              })}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </>
      )}

    </div>
  )
}

/* ------------------------------------------------------------------------- */

/**
 * One séance in the list. A published replay is a button with a thumbnail; one
 * still being edited stays in place, visibly waiting — hiding it would make the
 * semestre look incomplete, and the élève knows the séance happened.
 */
function SeanceCard({
  session,
  teacher,
  to,
}: {
  session: Session
  teacher?: string
  /** The séance's video page — a real link, so it opens in a tab too. */
  to: string
}) {
  const ready = Boolean(session.recordingUrl)
  const thumbId = ready ? youtubeId(videoSrc(session.recordingUrl)) : undefined
  const duration = durationLabel(session.startTime, session.endTime)

  const meta = (
    <span className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[calc(12px*var(--ts))] text-ink-muted">
      <span className="inline-flex items-center gap-1">
        <CalendarDays className="size-3.5" />
        <span className="tabular-nums">{dayLabel(session.date)}</span>
      </span>
      {duration && (
        <>
          <span>·</span>
          <span className="inline-flex items-center gap-1 tabular-nums">
            <Clock3 className="size-3.5" />
            {duration}
          </span>
        </>
      )}
      {teacher && (
        <>
          <span>·</span>
          <span dir="auto" className="inline-flex items-center gap-1">
            <UserRound className="size-3.5" />
            {teacher}
          </span>
        </>
      )}
      {/* The salle is a nice-to-know on a replay — it goes first when space is short. */}
      {session.room && (
        <>
          <span className="hidden md:inline">·</span>
          <span dir="auto" className="hidden items-center gap-1 md:inline-flex">
            <MapPin className="size-3.5" />
            {session.room}
          </span>
        </>
      )}
    </span>
  )

  const body = (
    <span className="min-w-0 flex-1">
      {ready ? (
        <Badge tone="brand">التسجيل</Badge>
      ) : (
        <Badge tone="neutral">قريب</Badge>
      )}
      <span
        dir="auto"
        className="mt-1.5 block text-[calc(14px*var(--ts))] font-semibold leading-snug text-ink line-clamp-2"
      >
        {session.title}
      </span>
      {meta}
      {session.description && (
        <span dir="auto" className="mt-1 block text-[calc(12px*var(--ts))] text-ink-subtle line-clamp-2">
          {session.description}
        </span>
      )}
    </span>
  )

  const thumb = (
    <span className="relative block aspect-video w-28 shrink-0 overflow-hidden rounded-md bg-neutral-200 md:w-36">
      {thumbId && (
        <img
          src={`https://i.ytimg.com/vi/${thumbId}/mqdefault.jpg`}
          alt=""
          loading="lazy"
          className="size-full object-cover"
        />
      )}
      {ready ? (
        <span className="absolute inset-0 grid place-items-center bg-neutral-900/25 transition group-hover:bg-neutral-900/40">
          <span className="grid size-9 place-items-center rounded-full bg-white/95 text-brand-600 shadow-md transition motion-safe:group-hover:scale-110">
            <Play className="size-4 translate-x-px fill-current" />
          </span>
        </span>
      ) : (
        <span className="absolute inset-0 grid place-items-center bg-neutral-100 text-ink-muted">
          <Hourglass className="size-5" />
        </span>
      )}
    </span>
  )

  if (!ready) {
    return (
      <div className="flex w-full items-center gap-3 rounded-lg border border-dashed border-border bg-surface p-2.5 text-start md:gap-4 md:p-3">
        {thumb}
        {body}
      </div>
    )
  }

  return (
    <Link
      to={to}
      className="group flex w-full items-center gap-3 rounded-lg border border-border bg-surface p-2.5 text-start shadow-sm transition hover:border-brand-200 hover:shadow-md md:gap-4 md:p-3"
    >
      {thumb}
      {body}
    </Link>
  )
}
