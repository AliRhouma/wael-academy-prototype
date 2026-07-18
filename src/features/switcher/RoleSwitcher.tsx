import { Link, useNavigate } from "react-router-dom"
import { BookOpen, GraduationCap, Shield, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useAuth } from "@/stores/useAuth"
import type { Role } from "@/data/types"

const ROLES: { role: Role; label: string; desc: string; icon: LucideIcon }[] = [
  { role: "admin", label: "Administration", desc: "Gérer l’académie, les utilisateurs et les paiements.", icon: Shield },
  { role: "teacher", label: "Enseignant", desc: "Vos cours, vos séances et vos élèves.", icon: GraduationCap },
  { role: "parent", label: "Parent", desc: "Suivre vos enfants et leurs séances.", icon: Users },
  { role: "student", label: "Élève", desc: "Vos cours, votre emploi du temps et vos notes.", icon: BookOpen },
]

/** App entry ("/"): pick one of four filtered views over the same academy. */
export function RoleSwitcher() {
  const navigate = useNavigate()
  const setRole = useAuth((s) => s.setRole)

  const choose = (role: Role) => {
    setRole(role)
    navigate(`/${role}`)
  }

  return (
    <div className="min-h-dvh bg-canvas">
      <div className="mx-auto flex min-h-dvh w-full max-w-[720px] flex-col justify-center px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))] sm:px-6">
        <header className="mb-8 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-[16px] bg-grad text-ink-inverted shadow-brand">
            <GraduationCap className="size-7" />
          </span>
          <p className="mt-4 text-[11px] font-medium uppercase tracking-[.14em] text-accent2-600">Wael Academy</p>
          <h1 className="mt-1 font-display text-[26px] font-bold text-ink">Choisissez votre espace</h1>
          <p className="mt-1 text-sm text-ink-muted">Quatre vues sur une même académie.</p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          {ROLES.map(({ role, label, desc, icon: Icon }) => (
            <button
              key={role}
              type="button"
              onClick={() => choose(role)}
              className="group flex min-h-[44px] items-center gap-4 rounded-lg border border-border bg-surface p-4 text-start shadow-sm transition hover:border-brand-200 hover:shadow-md motion-safe:hover:-translate-y-0.5"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-600 transition group-hover:bg-grad group-hover:text-ink-inverted">
                <Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block font-display text-[15px] font-bold text-ink">{label}</span>
                <span className="block text-[12px] text-ink-muted">{desc}</span>
              </span>
            </button>
          ))}
        </div>

        <p className="mt-8 text-center text-[12px] text-ink-muted">
          <Link to="/design-system" className="font-medium text-brand-600 hover:underline">
            Design system
          </Link>
        </p>
      </div>
    </div>
  )
}
