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
import type { LucideIcon } from "lucide-react"
import { useTheme } from "@/app/providers"
import { cn } from "@/lib/utils"

/** Primary sections; each links to a child route of /courses/:id. (≤5 fit the
 *  mobile bottom bar; beyond that, move extras into a "More" sheet.) */
const TABS: { seg: string; label: string; icon: LucideIcon }[] = [
  { seg: "", label: "Aperçu", icon: LayoutGrid },
  { seg: "planning", label: "Planning", icon: CalendarDays },
  { seg: "students", label: "Élèves", icon: Users },
  { seg: "grades", label: "Notes", icon: ClipboardList },
]

function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const Icon = theme === "dark" ? Sun : Moon
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Passer en clair" : "Passer en sombre"}
      className="grid size-11 shrink-0 place-items-center rounded-md text-ink-muted transition hover:bg-surface-muted hover:text-ink md:size-9"
    >
      <Icon className="size-[18px]" />
    </button>
  )
}

export default function WorkspaceLayout() {
  const { id = "" } = useParams()
  const tabTo = (seg: string) => `/courses/${id}${seg ? `/${seg}` : ""}`

  return (
    <div className="min-h-dvh bg-canvas md:py-8">
      {/* Full-bleed on mobile; a floating window on md+ */}
      <div className="mx-auto flex h-dvh w-full max-w-[1120px] flex-col overflow-hidden bg-surface md:h-[calc(100dvh-4rem)] md:rounded-xl md:border md:border-border md:shadow-xl">
        {/* Header — mobile: top app bar (safe-area padded); desktop: static header */}
        <header className="z-20 flex items-center gap-3 border-b border-border bg-surface px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:gap-4 md:px-7 md:pb-5 md:pt-5">
          <Link
            to="/courses"
            aria-label="Retour aux cours"
            className="grid size-11 shrink-0 place-items-center rounded-md border border-border bg-surface-muted text-ink-subtle transition hover:border-brand-200 hover:text-brand-600 md:size-9"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium uppercase tracking-[.12em] text-accent2-600">
              Espace de travail
            </p>
            <h1 className="truncate font-display text-lg font-bold leading-tight text-ink md:text-[22px]">
              Cours · {id}
            </h1>
          </div>
          <ThemeToggle />
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-grad font-display text-sm font-bold text-ink-inverted shadow-[0_0_0_2.5px_var(--surface),0_0_0_4px_var(--brand-100)]">
            W
          </div>
        </header>

        {/* Desktop tabs (mobile uses the bottom bar instead) */}
        <nav className="hidden gap-1 overflow-x-auto border-b border-border p-2 md:flex md:px-5">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <NavLink
                key={tab.seg || "index"}
                to={tabTo(tab.seg)}
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
                    <Icon className={cn("size-4", isActive ? "text-brand-600" : "text-ink-muted")} />
                    {tab.label}
                  </>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* Content scrolls internally; pb-24 on mobile clears the fixed bottom bar */}
        <main className="flex-1 overflow-y-auto scroll-touch p-4 pb-24 md:p-8 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tab bar — fixed, safe-area padded, hidden on desktop */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface md:hidden">
        <div className="flex items-stretch justify-around px-1 py-1">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <NavLink
                key={tab.seg || "index"}
                to={tabTo(tab.seg)}
                end={tab.seg === ""}
                className={({ isActive }) =>
                  cn(
                    "flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-md text-[11px] font-medium transition",
                    isActive ? "text-brand-600" : "text-ink-muted",
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={cn("size-[22px]", isActive ? "text-brand-600" : "text-ink-muted")} />
                    <span>{tab.label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
