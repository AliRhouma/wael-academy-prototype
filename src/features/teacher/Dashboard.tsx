import { BookOpen, CalendarDays } from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { StatTile } from "@/features/shared/StatTile"
import { SessionList } from "@/features/shared/SessionList"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"
import { nowStamp, sessionStamp } from "@/lib/utils"

/** Scoped to the current teacher: their courses + upcoming sessions. */
export default function TeacherDashboard() {
  const user = useAuth((s) => s.currentUser)
  const { courses, sessions } = useData()

  const myCourses = courses.filter((c) => c.teacherId === user?.teacherId)
  const now = nowStamp()
  const mySessions = sessions
    .filter((s) => s.teacherId && s.teacherId === user?.teacherId && sessionStamp(s) >= now)
    .sort((a, b) => sessionStamp(a).localeCompare(sessionStamp(b)))
  const firstName = user?.name.split(" ")[0] ?? ""

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={`Bonjour, ${firstName}`} subtitle="Vos cours et vos prochaines séances" />

      <div className="grid grid-cols-2 gap-3">
        <StatTile icon={BookOpen} label="Mes cours" value={myCourses.length} />
        <StatTile icon={CalendarDays} label="Séances à venir" value={mySessions.length} />
      </div>

      <section>
        <h2 className="mb-3 font-display text-base font-bold text-ink">Prochaines séances</h2>
        <SessionList sessions={mySessions} empty="Aucune séance programmée" />
      </section>
    </div>
  )
}
