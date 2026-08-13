import { Link, useNavigate } from "react-router-dom"
import { BookOpen, GraduationCap, Shield, Users } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { WaelLockup } from "@/components/icons/WaelLogo"
import { useAuth } from "@/stores/useAuth"
import type { Role } from "@/data/types"

const ROLES: { role: Role; label: string; desc: string; icon: LucideIcon }[] = [
  { role: "admin", label: "الإدارة", desc: "سيّر الأكاديمية والمستعملين والخلاص.", icon: Shield },
  { role: "teacher", label: "أستاذ", desc: "دروسك وحصصك وتلامذتك.", icon: GraduationCap },
  { role: "parent", label: "ولي", desc: "تابع ولادك وحصصهم.", icon: Users },
  { role: "student", label: "تلميذ", desc: "دروسك وجدول أوقاتك وأعدادك.", icon: BookOpen },
]

/** Demo entry ("/roles"): pick one of four filtered views over the same academy. */
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
          {/* THE FULL LOCKUP, not the chip — this is the app's front door, the
              one screen with room for the whole mark and the only place its
              draw-on animation gets to play. It replaces a lucide mortarboard
              and a typeset "Wael Academy" kicker, both of which were standing in
              for a logo the academy already has.

              On the gradient plaque because the delivered art is white: one
              treatment that holds in light and dark, and the same brand fill the
              shell's mark wears two clicks later. */}
          <span className="mx-auto grid w-[min(15rem,80%)] place-items-center rounded-2xl bg-grad px-6 py-5 shadow-brand">
            <WaelLockup className="w-full" />
          </span>
          <h1 className="mt-5 font-display text-[calc(26px*var(--ts))] font-bold text-ink">اختار فضاءك</h1>
          <p className="mt-1 text-sm text-ink-muted">أربع نظرات على نفس الأكاديمية.</p>
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
                <span className="block font-display text-[calc(15px*var(--ts))] font-bold text-ink">{label}</span>
                <span className="block text-[calc(12px*var(--ts))] text-ink-muted">{desc}</span>
              </span>
            </button>
          ))}
        </div>

        <p className="mt-8 flex items-center justify-center gap-4 text-center text-[calc(12px*var(--ts))] text-ink-muted">
          <Link to="/" className="font-medium text-brand-600 hover:underline">
            → الصفحة الرئيسية
          </Link>
          <Link to="/design-system" className="font-medium text-brand-600 hover:underline">
            نظام التصميم
          </Link>
        </p>
      </div>
    </div>
  )
}
