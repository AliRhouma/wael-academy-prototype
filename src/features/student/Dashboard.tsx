import { BookOpen, CalendarDays } from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { StatTile } from "@/features/shared/StatTile"
import { SessionList } from "@/features/shared/SessionList"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"

/** Scoped to the current student: their courses + schedule. */
export default function StudentDashboard() {
  const user = useAuth((s) => s.currentUser)
  const { students, courses, sessions } = useData()

  const me = students.find((s) => s.id === user?.studentId)
  const myCourseIds = new Set(me?.courseIds ?? [])
  const myCourses = courses.filter((c) => myCourseIds.has(c.id))
  const mySessions = sessions
    .filter((s) => myCourseIds.has(s.courseId))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
  const firstName = user?.name.split(" ")[0] ?? ""

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`Bonjour, ${firstName}`} subtitle="Vos cours et votre emploi du temps" />

      <div className="grid grid-cols-2 gap-3">
        <StatTile icon={BookOpen} label="Mes cours" value={myCourses.length} />
        <StatTile icon={CalendarDays} label="Séances à venir" value={mySessions.length} />
      </div>

      <section>
        <h2 className="mb-3 font-display text-base font-bold text-ink">Emploi du temps</h2>
        <SessionList sessions={mySessions} courses={courses} empty="Aucune séance programmée" />
      </section>
    </div>
  )
}
