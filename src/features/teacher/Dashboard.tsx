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
      <PageHeader title={`أهلا ${firstName}`} subtitle="دروسك والحصص الجايّة" />

      <div className="grid grid-cols-2 gap-3">
        <StatTile icon={BookOpen} label="دروسي" value={myCourses.length} />
        <StatTile icon={CalendarDays} label="الحصص الجايّة" value={mySessions.length} />
      </div>

      <section>
        <h2 className="mb-3 font-display text-base font-bold text-ink">الحصص الجايّة</h2>
        <SessionList sessions={mySessions} empty="ما فماش حصص مبرمجة" />
      </section>
    </div>
  )
}
