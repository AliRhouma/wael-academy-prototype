import { Link } from "react-router-dom"
import { BookOpen, CalendarDays, ChevronRight } from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { StatTile } from "@/features/shared/StatTile"
import { SessionList } from "@/features/shared/SessionList"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"
import { nowStamp, sessionStamp } from "@/lib/utils"

/** Scoped to the current student: their courses + schedule. */
export default function StudentDashboard() {
  const user = useAuth((s) => s.currentUser)
  const { students, courses, sessions, groups } = useData()

  const me = students.find((s) => s.id === user?.studentId)
  const myCourseIds = new Set(me?.courseIds ?? [])
  const myCourses = courses.filter((c) => myCourseIds.has(c.id))

  // My séances: those of a group I'm in, or scheduled for my year.
  const myGroupIds = new Set(
    groups.filter((g) => user && g.studentIds.includes(user.id)).map((g) => g.id),
  )
  const now = nowStamp()
  const mySessions = sessions
    .filter(
      (s) =>
        sessionStamp(s) >= now &&
        (s.groupIds.some((id) => myGroupIds.has(id)) ||
          (user?.yearIds?.some((id) => s.yearIds.includes(id)) ?? false)),
    )
    .sort((a, b) => sessionStamp(a).localeCompare(sessionStamp(b)))
  const firstName = user?.name.split(" ")[0] ?? ""

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`Bonjour, ${firstName}`} subtitle="Vos cours et votre emploi du temps" />

      <div className="grid grid-cols-2 gap-3">
        <StatTile icon={BookOpen} label="Mes cours" value={myCourses.length} />
        <StatTile icon={CalendarDays} label="Séances à venir" value={mySessions.length} />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-display text-base font-bold text-ink">Emploi du temps</h2>
          <Link
            to="/student/calendrier"
            className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-brand-600 transition hover:text-brand-700"
          >
            Voir le calendrier <ChevronRight className="size-4" />
          </Link>
        </div>
        <SessionList sessions={mySessions} empty="Aucune séance programmée" />
      </section>
    </div>
  )
}
