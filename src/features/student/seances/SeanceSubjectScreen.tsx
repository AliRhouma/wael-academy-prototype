import { useMemo, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router-dom"
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  Clock3,
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
          الصفحة الرئيسية
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
        {/* No plate under the drawing — it carries its own disc, and a tinted
            square behind a circular badge is just a second card showing round
            the edges of the first. What stays is the halo: a blur has no edge,
            so it reads as the artwork's own colour bleeding onto the page
            rather than as something the artwork is sitting on. Same identity
            block as the matière page. */}
        <span className="relative grid size-16 shrink-0 place-items-center md:size-[72px]">
          <span
            className="absolute size-14 rounded-full blur-2xl"
            style={{ backgroundColor: tint.halo }}
          />
          <SubjectIcon name={subject.name} className="relative size-[62px] md:size-[72px]" />
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
              : `${recorded} تسجيل · ${groupTabs.length} مجموعة`}
          </p>
        </div>
      </div>

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
          {/* EACH GROUPE ITS OWN BUTTON. They used to share one bordered track,
              which draws the ROW as the object and leaves the chips inside it
              looking like segments of a caption; separated and each given its
              own edge, every one of them reads as a thing to press. The two
              states are told apart by fill, not by presence of an edge — the
              border stays on both so nothing resizes when the choice moves. */}
          <div
            role="tablist"
            aria-label="المجموعة"
            className="flex gap-2 overflow-x-auto scroll-touch pb-1 [scrollbar-width:none] md:w-fit [&::-webkit-scrollbar]:hidden"
          >
            {groupTabs.map(({ group, count }) => {
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
                    "inline-flex h-11 shrink-0 items-center gap-2 rounded-[12px] border-2 px-3.5 text-[calc(13px*var(--ts))] font-medium transition md:h-11",
                    active
                      ? "border-brand-600 bg-grad text-white shadow-brand"
                      : "border-brand-200 bg-surface text-ink-subtle shadow-sm hover:border-brand-600 hover:text-brand-600",
                  )}
                >
                  <UsersRound className="size-4 shrink-0" />
                  {/* The LEVEL only — « Élite », « Rattrapage ». The class in
                      front of it (« Bac Sciences ») is the page you are
                      already on, so printing it on every tab said nothing and
                      cost the row its width. The full title rides the tooltip. */}
                  <span dir="auto" className="max-w-[11rem] truncate">
                    {shortGroupLabel(group.title)}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[calc(11px*var(--ts))] tabular-nums",
                      active ? "bg-white/20 text-white" : "bg-neutral-100 text-ink-muted",
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
                  aria-label="المجموعة"
                  className="flex min-w-0 flex-1 gap-1 overflow-x-auto scroll-touch [scrollbar-width:none] md:flex-none [&::-webkit-scrollbar]:hidden"
                >
                  {groupTabs.map(({ group }) => {
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
                        {/* The RECORDINGS, not the séances. This page is the
                            library — a séance with nothing online is a row the
                            élève cannot open, so counting it here promised more
                            than the semestre holds.
                            The play mark rides HERE, once for the whole
                            semestre, instead of on each of its rows. */}
                        <span className="mt-0.5 flex items-center gap-1 text-[calc(12px*var(--ts))] text-ink-muted">
                          {empty ? (
                            "ما فماش حصص في الثلاثي هذا"
                          ) : (
                            <>
                              <Play className="size-3 shrink-0 fill-current" />
                              <span className="tabular-nums">{playable} تسجيل</span>
                            </>
                          )}
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
 *
 * The card carries the title and three facts — date, length, enseignant. The
 * salle and the séance's description used to ride along too: a room number is
 * meaningless once the séance is a video, and the description repeated the
 * title in longer words. Both were paid for in the height of every row.
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
    </span>
  )

  const body = (
    <span className="min-w-0 flex-1">
      {/* Only the séance that is NOT yet online wears a badge. « التسجيل » sat
          on every published card, which is every card the élève can press —
          a label that never varies carries nothing, and the play button on the
          thumbnail already says the same thing. « قريب » stays: it is the one
          case where the card behaves differently from its neighbours. */}
      {!ready && (
        <span className="mb-1.5 block">
          <Badge tone="neutral">قريب</Badge>
        </span>
      )}
      <span
        dir="auto"
        className="block text-[calc(14px*var(--ts))] font-semibold leading-snug text-ink line-clamp-2"
      >
        {session.title}
      </span>
      {meta}
    </span>
  )

  // No still, and no play tile in its place. Every seeded replay points at the
  // same video, so the thumbnails came out as a column of the identical grey
  // rectangle — and swapping that for one identical icon would only have made
  // the repetition tidier. What tells these rows apart is the title and the
  // date; the semestre header above says the whole list plays. The two states
  // stay legible without either: « قريب » wears a dashed edge and a badge, a
  // published one is a pressable card that lifts.
  if (!ready) {
    return (
      <div className="w-full rounded-lg border border-dashed border-border bg-surface p-3 text-start">
        {body}
      </div>
    )
  }

  return (
    <Link
      to={to}
      className="group block w-full rounded-lg border border-border bg-surface p-3 text-start shadow-sm transition hover:border-brand-200 hover:shadow-md"
    >
      {body}
    </Link>
  )
}
