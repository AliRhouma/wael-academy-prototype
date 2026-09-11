import { Link, NavLink, Outlet, useNavigate } from "react-router-dom"
import { LogOut, Settings, Volume2, VolumeX } from "lucide-react"
import { studentV2Nav } from "@/app/nav/studentV2"
import { useAuth } from "@/stores/useAuth"
import { cn } from "@/lib/utils"
import lockup from "@/assets/v2/logo-lockup.png"
import mark from "@/assets/v2/logo-mark.png"
import { BASE } from "./lib"
import { V2GradientDefs, iconBtnClass } from "./ui"
import { setSoundEnabled, useSound } from "./sound"
import { SearchBox } from "./header/SearchBox"
import { NotificationsMenu } from "./header/NotificationsMenu"
import { ProfileMenu } from "./header/ProfileMenu"

/**
 * The new space's frame, as drawn at 1920:
 *   - a 70 %-white rail on the START edge (the right, in Arabic) — the logo,
 *     six links with ramp-stroked glyphs, « خروج » pinned to the bottom;
 *   - a top bar that is NOT a bar: the greeting, the search pill, then bell ·
 *     gear · avatar at the end, all sitting straight on the canvas.
 * Below `lg` the rail becomes a bottom tab bar (all six fit at 390px) and the
 * greeting + search stack above the page.
 */
export function V2Shell() {
  return (
    // `data-gaze="follow"`: Wael's eyes keep tracking over a hovered card here
    // (see `Eyes.tsx`) — these cards are big enough that locking them froze
    // the very face being looked at.
    // The two old tokens the shared kit pieces used here still read (the video
    // stage's play badge and timeline) are re-pointed at this space's ramp.
    <div
      data-gaze="follow"
      className="min-h-dvh bg-v2-canvas text-v2-ink"
      style={{ ["--grad" as string]: "var(--v2-grad)", ["--brand-400" as string]: "var(--v2-cta)" }}
    >
      <V2GradientDefs />
      <Rail />
      <div className="lg:ps-60 xl:ps-[16.5rem] 2xl:ps-[17.5rem]">
        <TopBar />
        <main className="px-4 pb-32 pt-5 sm:px-6 md:px-8 lg:pb-14 lg:pt-8 xl:px-12 2xl:px-14">
          <Outlet />
        </main>
      </div>
      <BottomBar />
    </div>
  )
}

function Logo({ compact = false }: { compact?: boolean }) {
  const src = compact ? mark : lockup
  return (
    <span
      role="img"
      aria-label="Wael Academy"
      className={cn("v2-mask block", compact ? "h-9 w-11" : "h-[5.75rem] w-[8.75rem]")}
      style={{ maskImage: `url(${src})`, WebkitMaskImage: `url(${src})` }}
    />
  )
}

function Rail() {
  const navigate = useNavigate()
  const logout = useAuth((s) => s.logout)

  return (
    <aside className="fixed inset-y-0 start-0 z-30 hidden w-60 flex-col border-e border-v2-ink/[0.05] bg-v2-rail pt-safe backdrop-blur-xl lg:flex xl:w-[16.5rem] 2xl:w-[17.5rem]">
      <Link
        to={BASE}
        data-uisfx="back"
        className="mx-auto mb-10 mt-10 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-v2-brand xl:mb-14 xl:mt-14"
      >
        <Logo />
      </Link>

      <nav aria-label="القائمة" className="flex flex-col gap-1 px-4 xl:px-6">
        {studentV2Nav.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === BASE}
            data-uisfx="select"
            className={({ isActive }) =>
              cn(
                "group relative flex min-h-12 items-center gap-3.5 rounded-2xl px-4 text-[calc(13.5px*var(--ts))] transition 2xl:min-h-14 2xl:text-[calc(15px*var(--ts))] focus-visible:outline-2 focus-visible:outline-v2-brand",
                isActive ? "font-bold text-v2-ink" : "font-medium text-v2-ink/80 hover:bg-v2-ink/[0.04] hover:text-v2-ink",
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* The frame marks the page in bold alone; the ramp tick at the
                    rail's edge makes it findable at a glance, not just legible. */}
                <span
                  aria-hidden
                  className={cn(
                    "absolute inset-y-3 -start-4 w-1 rounded-e-full bg-v2-grad transition-opacity xl:-start-6",
                    isActive ? "opacity-100" : "opacity-0",
                  )}
                />
                <Icon className="size-6 shrink-0 stroke-v2-grad transition group-hover:scale-110 2xl:size-7" strokeWidth={1.75} />
                <span className="truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        data-uisfx="disconnect"
        onClick={() => {
          logout()
          navigate("/connexion")
        }}
        className="group mx-4 mb-8 mt-auto flex min-h-12 items-center gap-3.5 rounded-2xl px-4 text-[calc(11px*var(--ts))] font-medium text-v2-ink/85 transition hover:bg-v2-live/[0.07] hover:text-v2-live-strong xl:mx-6"
      >
        <LogOut className="size-5 shrink-0 stroke-v2-grad group-hover:[&_*]:stroke-current" strokeWidth={1.75} />
        خروج
      </button>
    </aside>
  )
}

/**
 * The speaker — sound on / off, remembered. Turning it on answers with a
 * sound, so the élève hears that it worked; off is silent by definition.
 */
function SoundToggle() {
  const { enabled } = useSound()
  return (
    <button
      type="button"
      onClick={() => setSoundEnabled(!enabled)}
      aria-pressed={enabled}
      aria-label={enabled ? "سكّر الأصوات" : "شعّل الأصوات"}
      title={enabled ? "سكّر الأصوات" : "شعّل الأصوات"}
      className={iconBtnClass}
    >
      {enabled ? <Volume2 className="size-6" strokeWidth={1.6} /> : <VolumeX className="size-6 text-v2-ink/45" strokeWidth={1.6} />}
    </button>
  )
}

function Greeting({ className }: { className?: string }) {
  const user = useAuth((s) => s.currentUser)
  const first = user?.name.split(" ")[0] ?? ""
  return (
    <h1 className={cn("font-bold leading-tight text-v2-ink", className)}>
      نهارك زين {first}،{" "}
      <span aria-hidden className="inline-block">
        👋
      </span>
    </h1>
  )
}

function TopBar() {
  return (
    <header className="px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 md:px-8 lg:pt-10 xl:px-12 2xl:px-14">
      {/* Phone / tablet: mark + actions, then the greeting, then the search. */}
      <div className="flex flex-col gap-4 lg:hidden">
        <div className="flex items-center gap-2">
          <Link to={BASE} data-uisfx="back" className="rounded-lg p-1">
            <Logo compact />
          </Link>
          <div className="ms-auto flex items-center gap-1">
            <SoundToggle />
            <NotificationsMenu />
            <ProfileMenu compact />
          </div>
        </div>
        <Greeting className="text-[calc(17px*var(--ts))]" />
        <SearchBox />
      </div>

      {/* Desktop: one line, as in the frame. */}
      <div className="hidden items-center gap-6 lg:flex">
        <Greeting className="shrink-0 text-[calc(19px*var(--ts))] xl:text-[calc(23px*var(--ts))] 2xl:text-[calc(26px*var(--ts))]" />
        <SearchBox className="mx-auto w-full max-w-[36rem] flex-1 2xl:max-w-[38rem]" />
        <div className="flex shrink-0 items-center gap-2">
          <SoundToggle />
          <NotificationsMenu />
          <span aria-hidden className="h-9 w-px bg-v2-ink/20" />
          <Link to={`${BASE}/parametres`} aria-label="الإعدادات" data-uisfx="press" className={iconBtnClass}>
            <Settings className="size-6" strokeWidth={1.6} />
          </Link>
          <span aria-hidden className="h-9 w-px bg-v2-ink/20" />
          <ProfileMenu />
        </div>
      </div>
    </header>
  )
}

function BottomBar() {
  return (
    <nav
      aria-label="القائمة"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-v2-ink/10 bg-v2-surface/95 pb-safe backdrop-blur-xl lg:hidden"
    >
      <ul className="grid grid-cols-6">
        {studentV2Nav.map(({ label, path, icon: Icon }) => (
          <li key={path} className="min-w-0">
            <NavLink
              to={path}
              end={path === BASE}
              data-uisfx="select"
              className={({ isActive }) =>
                cn(
                  "relative flex min-h-16 flex-col items-center justify-center gap-1 px-0.5 text-[calc(7px*var(--ts))] transition",
                  isActive ? "font-bold text-v2-ink" : "font-medium text-v2-ink/55",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-0 h-1 w-9 rounded-b-full bg-v2-grad transition-opacity",
                      isActive ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <Icon className={cn("size-6", isActive && "stroke-v2-grad")} strokeWidth={1.75} />
                  <span className="max-w-full truncate">{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
