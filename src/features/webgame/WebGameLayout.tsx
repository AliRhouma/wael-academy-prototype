import { useState } from "react"
import { Link, NavLink, Outlet } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/stores/useAuth"
import { GameLogo, useGameDocument } from "@/features/game/shared/parts"
import { gBtn, gCta } from "@/features/game/shared/ui"

/**
 * `/webgame` — the game's web version: one responsive codebase, phone-first.
 * The header is the site's (a 1200 column, the lockup on the reading start)
 * with the game's two doors on the end; under md the anchors fold into a menu.
 */
export const wContainer = "mx-auto w-full max-w-[75rem] px-4 sm:px-6 lg:px-8"

const ANCHORS = [
  ["#kifech", "كيفاش تخدم"],
  ["#medina", "المدينة"],
  ["#jma3a", "مع صحابك"],
  ["#app", "التطبيق"],
] as const

export default function WebGameLayout() {
  useGameDocument("مدينة وائل — الويب")
  return <Outlet />
}

export function WebHeader({ minimal = false }: { minimal?: boolean }) {
  const user = useAuth((s) => s.currentUser)
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b-2 border-v2-ink/5 bg-v2-surface/85 backdrop-blur-md">
      <div className={cn(wContainer, "flex h-16 items-center gap-4 md:h-20")}>
        <Link to="/webgame" data-uisfx="back" aria-label="مدينة وائل — الرئيسية">
          <GameLogo className="h-10 w-[4.6rem] md:h-12 md:w-[5.4rem]" />
        </Link>
        {!minimal && (
          <nav className="hidden items-center gap-1 md:flex" aria-label="أقسام الصفحة">
            {ANCHORS.map(([href, label]) => (
              <a key={href} href={href} className="rounded-xl px-3 py-2 text-[calc(9.5px*var(--ts))] font-semibold text-v2-ink-2 transition hover:bg-v2-brand/10 hover:text-v2-ink">
                {label}
              </a>
            ))}
          </nav>
        )}
        <div className="ms-auto flex items-center gap-2 md:gap-3">
          {user ? (
            <NavLink to="/webgame/app" data-uisfx="open" className={cn(gCta, "h-11 px-5 text-[calc(9.5px*var(--ts))]")}>
              مدينتي
            </NavLink>
          ) : (
            <>
              <Link to="/webgame/connexion" data-uisfx="forward" className={cn(gBtn, "h-11 px-4 text-[calc(9.5px*var(--ts))] md:px-5")}>
                ادخل
              </Link>
              <Link to="/webgame/inscription" data-uisfx="forward" className={cn(gCta, "hidden h-11 px-5 text-[calc(9.5px*var(--ts))] sm:inline-flex")}>
                ابدا ببلاش
              </Link>
            </>
          )}
          {!minimal && (
            <button
              type="button"
              data-uisfx={open ? "collapse" : "expand"}
              aria-label={open ? "سكّر القائمة" : "القائمة"}
              aria-expanded={open}
              onClick={() => setOpen((o) => !o)}
              className="grid size-11 place-items-center rounded-xl border-2 border-v2-ink/10 text-v2-ink md:hidden"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          )}
        </div>
      </div>
      {!minimal && open && (
        <nav className={cn(wContainer, "grid gap-1 pb-4 md:hidden")} aria-label="أقسام الصفحة">
          {ANCHORS.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)} className="flex min-h-11 items-center rounded-xl px-3 text-[calc(10px*var(--ts))] font-semibold text-v2-ink hover:bg-v2-brand/10">
              {label}
            </a>
          ))}
        </nav>
      )}
    </header>
  )
}
