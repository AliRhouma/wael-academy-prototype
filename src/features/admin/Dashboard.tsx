import { Link } from "react-router-dom"
import { ArrowRight, BookOpen, CalendarDays, GraduationCap, Palette, Users } from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { StatTile } from "@/features/shared/StatTile"
import { useData } from "@/stores/useData"

/** Admin sees EVERYTHING — high-level counts over the whole shared dataset. */
export default function AdminDashboard() {
  const { students, teachers, courses, sessions } = useData()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Tableau de bord" subtitle="Vue d’ensemble de l’académie" />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={GraduationCap} label="Élèves" value={students.length} />
        <StatTile icon={Users} label="Enseignants" value={teachers.length} />
        <StatTile icon={BookOpen} label="Cours" value={courses.length} to="/courses" />
        <StatTile icon={CalendarDays} label="Séances" value={sessions.length} />
      </div>

      <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <h2 className="font-display text-base font-bold text-ink">Raccourcis</h2>
        <div className="mt-3 flex flex-col gap-2">
          <Link
            to="/courses"
            className="flex min-h-[44px] items-center gap-3 rounded-md border border-border px-4 text-sm font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"
          >
            <BookOpen className="size-4" /> Liste des cours <ArrowRight className="ms-auto size-4" />
          </Link>
          <Link
            to="/design-system"
            className="flex min-h-[44px] items-center gap-3 rounded-md border border-border px-4 text-sm font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"
          >
            <Palette className="size-4" /> Design system <ArrowRight className="ms-auto size-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
