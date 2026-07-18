import { Link, NavLink, Outlet, useParams } from "react-router-dom"
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  LayoutGrid,
  Moon,
  Sun,
  Users,
} from "lucide-react"
import { useTheme } from "@/app/providers"
import { cn } from "@/lib/utils"

/** Section tabs for a course workspace; each links to a child route of /courses/:id. */
const TABS = [
  { seg: "", label: "Aperçu", icon: LayoutGrid },
  { seg: "planning", label: "Planning", icon: CalendarDays },
  { seg: "students", label: "Élèves", icon: Users },
  { seg: "grades", label: "Notes", icon: ClipboardList },
] as const

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const Icon = theme === "dark" ? Sun : Moon
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Passer en clair" : "Passer en sombre"}
      className="grid size-9 place-items-center rounded-md text-ink-muted transition hover:bg-surface-muted hover:text-ink"
    >
      <Icon className="size-[18px]" />
    </button>
  )
}

export default function WorkspaceLayout() {
  const { id = "" } = useParams()

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto w-full max-w-[1120px] px-4 py-8 sm:px-6 sm:py-10">
        <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
          {/* Header — back, title, actions */}
          <header className="flex items-center gap-4 border-b border-border p-5 sm:px-7">
            <Link
              to="/courses"
              aria-label="Retour aux cours"
              className="grid size-9 shrink-0 place-items-center rounded-md border border-border bg-surface-muted text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-[.12em] text-accent2-600">
                Espace de travail
              </p>
              <h1 className="truncate font-display text-[22px] font-bold leading-tight text-ink">
                Cours · {id}
              </h1>
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <ThemeToggle />
              {/* Avatar — gradient fill, cream ring (design system §10) */}
              <div className="grid size-9 place-items-center rounded-full bg-grad font-display text-sm font-bold text-ink-inverted shadow-[0_0_0_2.5px_var(--surface),0_0_0_4px_var(--brand-100)]">
                W
              </div>
            </div>
          </header>

          {/* Section tabs */}
          <nav className="flex gap-1 overflow-x-auto border-b border-border p-2 sm:px-5">
            {TABS.map((tab) => {
              const to = `/courses/${id}${tab.seg ? `/${tab.seg}` : ""}`
              const Icon = tab.icon
              return (
                <NavLink
                  key={tab.seg || "index"}
                  to={to}
                  end={tab.seg === ""}
                  className={({ isActive }) =>
                    cn(
                      "inline-flex shrink-0 items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition",
                      isActive
                        ? "bg-brand-50 text-brand-700"
                        : "text-ink-subtle hover:bg-brand-50/60 hover:text-brand-600",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={cn(
                          "size-4",
                          isActive ? "text-brand-600" : "text-ink-muted",
                        )}
                      />
                      {tab.label}
                    </>
                  )}
                </NavLink>
              )
            })}
          </nav>

          {/* Active section content */}
          <main className="p-5 sm:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
