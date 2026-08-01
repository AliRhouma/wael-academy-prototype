import { useMemo } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { CalendarRange, ChevronRight, MonitorPlay } from "lucide-react"
import { EmptyState } from "@/components/kit/EmptyState"
import { SubjectIcon, hasSubjectArt } from "@/components/icons/subjects"
import { subjectTheme } from "@/features/student/subjectTheme"
import {
  academicYearsOf,
  useMyPastSessions,
  yearFromSlug,
  yearSlug,
} from "@/features/student/seances/replays"
import { cn } from "@/lib/utils"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"

/** Stable empty array so the memos below don't see a new dep every render. */
const NO_YEARS: string[] = []

/**
 * Élève — « Séances enregistrées », the replay library.
 *
 * The année scolaire comes FIRST because it is what makes an archive an
 * archive: the élève either wants this year's séance again, or last year's
 * revision. It opens on the most recent année, lives in the URL
 * (`?annee=2025-2026`) so a link survives a refresh, and everything below it
 * — the matière grid — is that année's slice.
 *
 * The grid deliberately repeats the Matières page card: same glyph, same halo,
 * same rhythm. An élève should recognise "my matières" instantly and only then
 * notice that the number underneath counts enregistrements, not chapitres.
 *
 * Referenced for spacing & density: StudentSubjectsScreen (card + halo + grid),
 * StudentCalendarScreen (week strip → segmented navigation idiom).
 */
export default function StudentSeancesScreen() {
  const [params, setParams] = useSearchParams()
  const user = useAuth((s) => s.currentUser)
  const subjects = useData((s) => s.subjects)
  const groups = useData((s) => s.groups)

  const pool = useMyPastSessions()
  const academicYears = useMemo(() => academicYearsOf(pool), [pool])

  const asked = params.get("annee")
  const activeYear =
    (asked && academicYears.find((y) => y === yearFromSlug(asked))) ?? academicYears[0] ?? ""

  function setYear(next: string) {
    const p = new URLSearchParams(params)
    p.set("annee", yearSlug(next))
    setParams(p, { replace: true })
  }

  const myYearIds = user?.yearIds ?? NO_YEARS

  /** Séance counts per année scolaire — the badge on each tab. */
  const perYear = useMemo(() => {
    const m = new Map<string, number>()
    for (const s of pool) {
      if (!s.recordingUrl) continue
      m.set(s.academicYear, (m.get(s.academicYear) ?? 0) + 1)
    }
    return m
  }, [pool])

  /** My matières + what the active année holds for each of them. */
  const cards = useMemo(() => {
    const inYear = pool.filter((s) => s.academicYear === activeYear)
    // A séance shared with another filière carries that filière's groupe too —
    // count only the groupes that belong to the élève's année.
    const relevant = new Set(
      groups.filter((g) => !g.yearId || myYearIds.includes(g.yearId)).map((g) => g.id),
    )
    return subjects
      .filter((s) => myYearIds.includes(s.yearId))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((subject) => {
        const mine = inYear.filter((s) => s.subjectIds.includes(subject.id))
        return {
          subject,
          recorded: mine.filter((s) => s.recordingUrl).length,
          groups: new Set(mine.flatMap((s) => s.groupIds).filter((id) => relevant.has(id))).size,
        }
      })
  }, [pool, subjects, groups, myYearIds, activeYear])

  const totals = useMemo(() => {
    const recorded = cards.reduce((n, c) => n + c.recorded, 0)
    const withContent = cards.filter((c) => c.recorded > 0).length
    const myGroups = groups.filter(
      (g) => g.academicYear === activeYear && user && g.studentIds.includes(user.id),
    )
    return { recorded, withContent, myGroups }
  }, [cards, groups, activeYear, user])

  return (
    <div className="flex flex-col gap-5">
      {/* Breadcrumb */}
      <nav aria-label="Fil d’Ariane" className="flex items-center gap-1.5 text-[13px] text-ink-muted">
        <Link to="/student" className="transition hover:text-brand-600">
          Accueil
        </Link>
        <ChevronRight className="size-3.5 shrink-0" />
        <span className="font-medium text-brand-600">Séances enregistrées</span>
      </nav>

      <div>
        <h1 className="font-display text-[26px] font-bold leading-tight text-ink">
          Séances enregistrées
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-muted">
          Toutes les séances déjà données, gardées année après année. Choisis l’année scolaire, puis
          la matière — tu retrouves ensuite ton groupe et le semestre.
        </p>
      </div>

      {academicYears.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface">
          <EmptyState
            icon={MonitorPlay}
            title="Aucune séance enregistrée"
            description="Dès qu’une séance de ton année aura eu lieu, son enregistrement apparaîtra ici."
          />
        </div>
      ) : (
        <>
          {/* ---- Année scolaire : the archive's first choice ---- */}
          <section className="flex flex-col gap-2.5">
            <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[.12em] text-accent2-600">
              <CalendarRange className="size-3.5" />
              Année scolaire
            </div>

            <div
              role="tablist"
              aria-label="Année scolaire"
              className="flex gap-1 overflow-x-auto scroll-touch rounded-lg border border-border bg-surface-muted p-1 [scrollbar-width:none] md:w-fit [&::-webkit-scrollbar]:hidden"
            >
              {academicYears.map((year, i) => {
                const active = year === activeYear
                const count = perYear.get(year) ?? 0
                return (
                  <button
                    key={year}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setYear(year)}
                    className={cn(
                      "inline-flex h-11 shrink-0 items-center gap-2 rounded-md px-3.5 text-[13px] font-semibold transition md:h-10 md:text-sm",
                      active ? "bg-surface text-ink shadow-sm" : "text-ink-muted hover:text-ink-subtle",
                    )}
                  >
                    <span className="tabular-nums">{year}</span>
                    {/* The newest année is the one in progress — say so once. */}
                    {i === 0 && (
                      <span
                        className={cn(
                          "rounded-full px-1.5 text-[10px] font-medium uppercase tracking-wide",
                          active ? "bg-brand-50 text-brand-700" : "bg-neutral-100 text-ink-muted",
                        )}
                      >
                        en cours
                      </span>
                    )}
                    <span
                      className={cn(
                        "rounded-full px-1.5 text-[11px] tabular-nums",
                        active ? "bg-brand-50 text-brand-700" : "bg-neutral-100 text-ink-muted",
                      )}
                    >
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            <p className="text-[13px] text-ink-muted">
              {totals.recorded === 0
                ? "Aucun enregistrement publié sur cette année."
                : `${totals.recorded} enregistrement${totals.recorded > 1 ? "s" : ""} · ${totals.withContent} matière${totals.withContent > 1 ? "s" : ""}`}
              {totals.myGroups.length > 0 && (
                <>
                  {" · "}
                  <span dir="auto" className="text-ink-subtle">
                    {totals.myGroups.map((g) => g.title).join(", ")}
                  </span>
                </>
              )}
            </p>
          </section>

          {/* ---- Matières of that année ---- */}
          <section className="rounded-xl border border-border bg-surface p-4 shadow-sm md:p-5">
            {cards.length === 0 ? (
              <EmptyState
                className="py-10"
                icon={MonitorPlay}
                title="Aucune matière à ton programme"
                description="Ton programme n’est pas encore rattaché à une année. Contacte l’assistance et on s’en occupe."
              />
            ) : (
              <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {cards.map(({ subject, recorded, groups: groupCount }) => {
                  const c = subjectTheme(subject.category)
                  return (
                    <li key={subject.id}>
                      <Link
                        to={`/student/seances/${subject.id}?annee=${yearSlug(activeYear)}`}
                        className={cn(
                          "group flex h-full flex-col rounded-lg border border-border bg-surface p-3 shadow-sm transition hover:border-brand-200 hover:shadow-md motion-safe:hover:-translate-y-0.5",
                          recorded === 0 && "opacity-70 hover:opacity-100",
                        )}
                      >
                        <div
                          className={cn(
                            "relative grid h-24 place-items-center overflow-hidden rounded-md md:h-28",
                            c.panel,
                          )}
                        >
                          <span
                            className={cn(
                              "absolute size-20 rounded-full blur-2xl transition-transform motion-safe:group-hover:scale-110",
                              c.halo,
                            )}
                          />
                          <SubjectIcon
                            name={subject.name}
                            className={cn(
                              "relative size-12 md:size-14",
                              !hasSubjectArt(subject.name) && c.icon,
                            )}
                          />
                          {recorded > 0 && (
                            <span className="absolute bottom-1.5 end-1.5 inline-flex items-center gap-1 rounded-full bg-surface/95 px-2 py-0.5 text-[11px] font-semibold text-ink-subtle shadow-sm">
                              <MonitorPlay className="size-3 text-brand-600" />
                              <span className="tabular-nums">{recorded}</span>
                            </span>
                          )}
                        </div>

                        <p
                          className={cn(
                            "mt-2.5 line-clamp-2 text-center font-display text-[13px] font-bold leading-snug md:text-sm",
                            c.name,
                          )}
                        >
                          {subject.name}
                        </p>

                        <p className="mt-auto pt-2 text-center text-[11px] text-ink-muted">
                          {recorded === 0
                            ? "Aucun enregistrement"
                            : `${recorded} séance${recorded > 1 ? "s" : ""} · ${groupCount} groupe${groupCount > 1 ? "s" : ""}`}
                        </p>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
