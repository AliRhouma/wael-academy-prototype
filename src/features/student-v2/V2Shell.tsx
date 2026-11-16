import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { ChevronRight, LogOut, Settings, Volume2, VolumeX } from "lucide-react"
import { studentV2Nav, studentV2Tabs } from "@/app/nav/studentV2"
import { usePlatform } from "@/app/platform"
import { useAuth } from "@/stores/useAuth"
import { useScrollingDown } from "@/lib/hooks"
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
 * Below `lg` the rail becomes a bottom tab bar — five tabs, in the idiom of
 * the phone it is on (`BottomBar`) — and the greeting + search stack above
 * the page.
 */
export function V2Shell() {
  return (
    // `data-gaze="follow"`: Wael's eyes keep tracking over a hovered card here
    // (see `Eyes.tsx`) — these cards are big enough that locking them froze
    // the very face being looked at.
    // `data-space="v2"`: what the platform skins (src/styles/platform) and the
    // gamified skin scope themselves to, so nothing outside the space moves.
    // The two old tokens the shared kit pieces used here still read (the video
    // stage's play badge and timeline) are re-pointed at this space's ramp.
    <div
      data-gaze="follow"
      data-space="v2"
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
      {enabled ? <Volume2 className="size-6" strokeWidth={1.6} /> : <VolumeX className="size-6 text-v2-ink-2" strokeWidth={1.6} />}
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

/** Where « back » goes from a screen that has an obvious parent. */
const PARENTS: { match: RegExp; to: string; label: string }[] = [
  { match: /^\/student-v2\/matieres\/[^/]+/, to: `${BASE}/matieres`, label: "الدروس" },
  { match: /^\/student-v2\/seances\/[^/]+/, to: `${BASE}/seances`, label: "تسجيلات" },
]

/**
 * The phone header's leading corner. On a tab's own screen it is the mark,
 * home. On anything pushed past the tabs (a matière, a recording, the player,
 * a séance, a page from the avatar menu) it is BACK: a 44 pt button with the
 * chevron pointing right — the leading edge in Arabic — named for where it
 * goes. It used to be a link inside each page, below the greeting and the
 * search, which scrolled away (docs/mobile/apple-design-audit.md, I2).
 * In-app history first, so the player returns to the list it came from; a
 * deep link with no history falls back to the parent, then home.
 */
function PhoneBack() {
  const { pathname, key } = useLocation()
  const navigate = useNavigate()
  const isTab = studentV2Tabs.some((t) => t.path === pathname)
  if (isTab) {
    return (
      <Link to={BASE} data-uisfx="back" className="rounded-lg p-1">
        <Logo compact />
      </Link>
    )
  }
  const parent = PARENTS.find((p) => p.match.test(pathname))
  const hasHistory = key !== "default"
  return (
    <button
      type="button"
      data-uisfx="back"
      onClick={() => (hasHistory ? navigate(-1) : navigate(parent?.to ?? BASE))}
      className="-ms-2 inline-flex min-h-11 items-center gap-0.5 rounded-full pe-3 ps-1 text-[calc(10.6px*var(--ts))] font-semibold text-v2-brand-text transition active:bg-v2-ink/[0.05]"
    >
      <ChevronRight aria-hidden className="size-7 shrink-0" strokeWidth={2.25} />
      {parent && !hasHistory ? parent.label : "رجوع"}
    </button>
  )
}

function TopBar() {
  const platform = usePlatform()
  return (
    <header className="px-4 pt-[max(1rem,var(--sai-top))] sm:px-6 md:px-8 lg:pt-10 xl:px-12 2xl:px-14">
      {/* Phone / tablet: mark + actions, then the greeting, then the search.
          The greeting is the screen's title, set at the platform's own size:
          iOS's large title (34 pt), Material's headline-medium (28 sp). */}
      <div className="flex flex-col gap-4 lg:hidden">
        <div className="flex items-center gap-2">
          <PhoneBack />
          <div className="ms-auto flex items-center gap-1">
            <SoundToggle />
            <NotificationsMenu />
            <ProfileMenu compact />
          </div>
        </div>
        <Greeting
          className={cn(
            platform === "ios" && "text-[calc(21px*var(--ts))] leading-[1.2]",
            platform === "android" && "text-[calc(18px*var(--ts))]",
            platform === "web" && "text-[calc(17px*var(--ts))]",
          )}
        />
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

/**
 * The phone's tab bar, in the idiom of the phone it is on (src/app/platform.ts):
 *   - iOS — a floating Liquid Glass capsule, inset from the edges and sitting
 *     above the home indicator; the tint colour on the selected tab only;
 *   - Android — Material's 80 dp navigation bar on a tonal surface, the
 *     selected destination in a 64 × 32 pill, a ripple on press;
 *   - web (a desktop browser made narrow) — the frame's own strip.
 * Five tabs on all three (`studentV2Tabs`): both platforms stop at five.
 */
function BottomBar() {
  const platform = usePlatform()
  if (platform === "ios") return <IosTabBar />
  if (platform === "android") return <AndroidNavBar />
  return <WebTabBar />
}

/**
 * iOS 26's floating tab bar: a 64 pt glass capsule, 16 pt in from the sides,
 * 8 pt above the home indicator, labels always shown. It does NOT minimise on
 * scroll: Apple keeps that for bars with an attached accessory (Music's
 * MiniPlayer) and we have none — and the minimised state left five unnamed
 * links for VoiceOver (docs/mobile/apple-design-audit.md, C5). The tint marks
 * the selected tab alone, as a 12 % capsule under a heavier stroke, its label
 * in the text-safe teal (`brand-text`, 5.4 : 1 on the tint).
 */
function IosTabBar() {
  return (
    <nav
      aria-label="القائمة"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-30 px-4 pb-[calc(var(--sai-bottom)+8px)] lg:hidden"
    >
      {/* Clear glass (our iOS default). If the labels get hard to read over busy
          content, add a touch of fill: [--glass-alpha:15%]. */}
      <ul className="ios-glass pointer-events-auto mx-auto grid max-w-md grid-cols-5 rounded-full p-1.5">
        {studentV2Tabs.map(({ label, path, icon: Icon }) => (
          <li key={path} className="min-w-0">
            <NavLink
              to={path}
              end={path === BASE}
              data-uisfx="select"
              className={({ isActive }) =>
                cn(
                  "flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-full px-1 text-[calc(6.9px*var(--ts))] transition-colors duration-200 ease-out",
                  isActive
                    ? "bg-v2-brand/[0.12] font-semibold text-v2-brand-text"
                    : "font-medium text-v2-ink-2 active:bg-v2-ink/[0.04]",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon aria-hidden className="size-[26px] shrink-0" strokeWidth={isActive ? 2.25 : 1.75} />
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

/**
 * Material 3 Expressive's FLEXIBLE navigation bar: 64 dp on a tonal
 * `surface-container`, the selected destination in a 56 × 32 pill, labels
 * always visible at label-medium and never bolded — the pill carries the
 * selection, not the type. The pill is lime-tinted (`secondary-container`
 * derived from the CTA), because in this palette lime is the one selected
 * thing and orange means « ended ». A ripple answers the press. Heading down
 * into the content the bar slides away and any scroll back up returns it.
 */
function AndroidNavBar() {
  const hidden = useScrollingDown()
  return (
    <nav
      aria-label="القائمة"
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 bg-m3-surface-container pb-[var(--sai-bottom)] transition-transform duration-250 ease-[cubic-bezier(.2,0,0,1)] motion-reduce:transition-none lg:hidden",
        hidden && "translate-y-full motion-reduce:translate-y-0",
      )}
    >
      <ul className="grid h-16 grid-cols-5">
        {studentV2Tabs.map(({ label, path, icon: Icon }) => (
          <li key={path} className="min-w-0">
            <NavLink
              to={path}
              end={path === BASE}
              data-uisfx="select"
              className={({ isActive }) =>
                cn(
                  "m3-ripple flex h-full flex-col items-center justify-center gap-1 px-0.5 py-1.5 text-[calc(7.5px*var(--ts))] font-medium transition-colors",
                  isActive ? "text-v2-ink" : "text-v2-ink-2",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "grid h-8 w-14 place-items-center rounded-full transition-colors duration-200",
                      isActive && "bg-m3-secondary-container text-m3-on-secondary-container",
                    )}
                  >
                    <Icon className="size-6" strokeWidth={isActive ? 2.4 : 2} />
                  </span>
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

function WebTabBar() {
  return (
    <nav
      aria-label="القائمة"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-v2-ink/10 bg-v2-surface/95 pb-safe backdrop-blur-xl lg:hidden"
    >
      <ul className="grid grid-cols-5">
        {studentV2Tabs.map(({ label, path, icon: Icon }) => (
          <li key={path} className="min-w-0">
            <NavLink
              to={path}
              end={path === BASE}
              data-uisfx="select"
              className={({ isActive }) =>
                cn(
                  "relative flex min-h-16 flex-col items-center justify-center gap-1 px-0.5 text-[calc(7px*var(--ts))] transition",
                  isActive ? "font-bold text-v2-ink" : "font-medium text-v2-ink-2",
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
