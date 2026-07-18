import type { ReactElement } from "react"
import { createBrowserRouter, Link } from "react-router-dom"
import { ChevronRight, GraduationCap, Palette } from "lucide-react"
import type { Role } from "@/data/types"
import type { NavItem } from "@/app/nav/types"
import WorkspaceLayout from "@/features/workspace/WorkspaceLayout"
import DesignSystemPage from "@/features/styleguide/DesignSystemPage"
import { RoleSwitcher } from "@/features/switcher/RoleSwitcher"
import { RoleLayout } from "@/app/RoleLayout"
import { ComingSoon } from "@/features/shared/ComingSoon"
import { adminNav } from "@/app/nav/admin"
import { teacherNav } from "@/app/nav/teacher"
import { parentNav } from "@/app/nav/parent"
import { studentNav } from "@/app/nav/student"
import AdminDashboard from "@/features/admin/Dashboard"
import TeacherDashboard from "@/features/teacher/Dashboard"
import ParentDashboard from "@/features/parent/Dashboard"
import StudentDashboard from "@/features/student/Dashboard"
import { useData } from "@/stores/useData"

/** Standalone list of the shared courses; links into the /courses/:id workspace. */
function CoursesList() {
  const courses = useData((s) => s.courses)
  return (
    <div className="min-h-dvh bg-canvas">
      <div className="mx-auto w-full max-w-[880px] px-4 py-10 sm:px-6">
        <header className="mb-6 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-[11px] bg-grad text-ink-inverted shadow-brand">
            <GraduationCap className="size-6" />
          </span>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[.12em] text-accent2-600">Wael Academy</p>
            <h1 className="font-display text-[26px] font-bold text-ink">Cours</h1>
          </div>
          <Link
            to="/design-system"
            aria-label="Design system"
            className="ms-auto inline-flex h-11 items-center gap-2 rounded-md border border-border-strong bg-surface px-3 text-[13px] font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600 sm:h-9 sm:px-3.5"
          >
            <Palette className="size-4" /> <span className="hidden sm:inline">Design system</span>
          </Link>
        </header>

        <ul className="grid gap-3">
          {courses.map((c) => (
            <li key={c.id}>
              <Link
                to={`/courses/${c.id}`}
                className="group flex items-center gap-4 rounded-lg border border-border bg-surface p-[18px] shadow-sm transition hover:border-brand-200 hover:shadow-md motion-safe:hover:-translate-y-0.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-[15px] font-bold text-ink">{c.name}</p>
                  <p className="text-[12px] text-ink-muted">{c.level}</p>
                </div>
                <ChevronRight className="size-5 shrink-0 text-ink-muted transition group-hover:text-brand-600" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** Placeholder shown inside each workspace tab. */
function SectionPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-brand-50 text-brand-600">
        <GraduationCap className="size-5" />
      </span>
      <h2 className="mt-4 font-display text-lg font-bold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-ink-muted">Écran à construire — le cadre et la navigation sont prêts.</p>
    </div>
  )
}

function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-canvas px-4 text-center">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Page introuvable</h1>
        <p className="mt-2 text-sm text-ink-muted">Cette page n’existe pas encore.</p>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-brand-600 hover:underline">
          Retour à l’accueil
        </Link>
      </div>
    </div>
  )
}

/** Build a role's route: RoleLayout + dashboard index + "coming soon" children. */
function roleRoute(base: string, role: Role, nav: NavItem[], dashboard: ReactElement) {
  return {
    path: base,
    element: <RoleLayout role={role} nav={nav} />,
    children: [
      { index: true, element: dashboard },
      ...nav.slice(1).map((item) => ({
        path: item.path.slice(base.length + 1),
        element: <ComingSoon title={item.label} />,
      })),
    ],
  }
}

export const router = createBrowserRouter([
  { path: "/", element: <RoleSwitcher /> },
  roleRoute("/admin", "admin", adminNav, <AdminDashboard />),
  roleRoute("/teacher", "teacher", teacherNav, <TeacherDashboard />),
  roleRoute("/parent", "parent", parentNav, <ParentDashboard />),
  roleRoute("/student", "student", studentNav, <StudentDashboard />),
  { path: "/courses", element: <CoursesList /> },
  {
    path: "/courses/:id",
    element: <WorkspaceLayout />,
    children: [
      { index: true, element: <SectionPlaceholder title="Aperçu du cours" /> },
      { path: "planning", element: <SectionPlaceholder title="Planning des séances" /> },
      { path: "students", element: <SectionPlaceholder title="Élèves inscrits" /> },
      { path: "grades", element: <SectionPlaceholder title="Notes & évaluations" /> },
    ],
  },
  { path: "/design-system", element: <DesignSystemPage /> },
  { path: "*", element: <NotFound /> },
])
