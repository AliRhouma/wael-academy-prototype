import { useEffect, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import {
  ChevronDown,
  ChevronsRight,
  ChevronsLeft,
  LogOut,
  MoreHorizontal,
  Repeat,
  UserRound,
} from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { WaelEmblem, WaelLockupH } from "@/components/icons/WaelLogo"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Avatar } from "@/components/kit/Avatar"
import { useAuth } from "@/stores/useAuth"
import { useT } from "@/i18n/strings"
import { useData } from "@/stores/useData"
import { cn } from "@/lib/utils"
import type { Role } from "@/data/types"
import type { NavItem } from "@/app/nav/types"

const ROLE_KEY: Record<Role, "roleAdmin" | "roleTeacher" | "roleParent" | "roleStudent"> = {
  admin: "roleAdmin",
  teacher: "roleTeacher",
  parent: "roleParent",
  student: "roleStudent",
}

const MAX_BAR = 5 // items shown in the mobile bottom bar before overflowing to the "زيادة" sheet

const HEADER_SLOT_ID = "shell-header-slot"

/**
 * Pages that stand on the theme's own ground instead of the cool canvas — the
 * ones built out of panels (see `CreamPanel`). Colour only; the dot lattice runs
 * on both. Drop a path from this set and the page goes back to the canvas.
 */
const TINTED_PAGES = new Set(["/student"])

/**
 * Renders its children as a bar STUCK to the top of the scroll area, above the
 * page. For page-level nav that must stay reachable while the content scrolls
 * (a matière picker, tabs): portal into it when needed, unmount to give the room
 * back — nothing is drawn when no page fills it. React context (router, stores)
 * is preserved across the portal.
 *
 * It used to be a second row inside the shell's identity bar. That bar is gone;
 * this is the half of it worth keeping.
 */
export function ShellHeaderPortal({ children }: { children: ReactNode }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null)
  // Looked up in an effect: the shell (and the slot div) is guaranteed mounted
  // by then, and SSR-safety costs nothing.
  useEffect(() => setSlot(document.getElementById(HEADER_SLOT_ID)), [])
  return slot ? createPortal(children, slot) : null
}

/**
 * The app mark — the ACADEMY'S OWN emblem on the brand gradient plate.
 *
 * It used to be the subjects book, which was a stand-in: a book says "school",
 * the emblem says "Wael Academy". The two interlocking loops come out of the
 * delivered lockup (see `WaelEmblem`), so the shell now wears the real mark.
 *
 * It stays on the gradient plate rather than sitting bare, for two reasons: the
 * delivered logo is white art with no theme awareness, and the plate is already
 * the app's brand fill — the same one under the active nav pill. `text-white`
 * feeds the emblem's `currentColor`.
 *
 * It heads the COLLAPSED rail and the mobile top bar — the two places where the
 * full lockup can't go: at 36px the wordmark is a smudge and the tagline a grey
 * line. The open sidebar wears the whole lockup instead (see below); same brand
 * gradient under both, so the shell says the same thing at every width.
 */
function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-[11px] bg-grad text-white shadow-brand",
        className,
      )}
    >
      {/* Wider than tall (the bbox is ~1.4:1), so it's sized on WIDTH and left
          to find its own height — a square box would have shrunk it to fit. */}
      <WaelEmblem className="w-[22px]" />
    </span>
  )
}

function SideNavItem({ item, expanded }: { item: NavItem; expanded: boolean }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.path}
      end
      title={expanded ? undefined : item.label}
      className={({ isActive }) =>
        cn(
          "group flex items-center rounded-md text-sm font-medium transition",
          expanded ? "gap-3 px-3.5 py-3" : "justify-center px-0 py-3",
          isActive
            ? "bg-grad text-ink-inverted shadow-brand"
            : "text-ink-subtle hover:bg-brand-50 hover:text-brand-600",
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              "size-[21px] shrink-0",
              item.colored
                ? isActive && "[&_path]:fill-white" // gradient glyph → force white on the active pill
                : isActive
                  ? "text-white"
                  : "text-ink-muted group-hover:text-brand-600",
            )}
          />
          {expanded && <span className="truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  )
}

function BottomNavItem({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.path}
      end
      className={({ isActive }) =>
        cn(
          "flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-md text-[calc(11px*var(--ts))] font-medium transition",
          isActive ? "text-brand-600" : "text-ink-muted",
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              "size-[22px]",
              // A gradient glyph (`colored`) carries its own fills, so a text
              // colour is a no-op on it — and there's no gradient pill down here
              // to force it white against. Those keep their own colours and the
              // label carries the active state; only mono icons tint.
              !item.colored && (isActive ? "text-brand-600" : "text-ink-muted"),
            )}
          />
          <span className="max-w-[68px] truncate">{item.label}</span>
        </>
      )}
    </NavLink>
  )
}

/**
 * ONE responsive app shell driven by a nav config (never four shell files).
 * Desktop: left sidebar. Mobile: fixed bottom tab bar (overflow items in a
 * "More" sheet). Safe-area padded; content scrolls internally. Renders <Outlet/>.
 *
 * There is NO top bar. Everything it used to carry has a home: the user, the
 * role and the role switch sit at the foot of the rail on desktop and in the
 * «زيادة» sheet on mobile — which is why that sheet now opens on every role,
 * overflow items or not; it is the only door to the account on a phone.
 */
export function AppShell({ nav }: { nav: NavItem[] }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { currentRole, currentUser, logout } = useAuth()
  // The live row from the store, so a profile edit renames the header at once.
  const currentUserId = currentUser?.id
  const user = useData((s) => s.users.find((u) => u.id === currentUserId)) ?? currentUser
  const [moreOpen, setMoreOpen] = useState(false)
  const [expanded, setExpanded] = useState(true)
  const t = useT()

  const overflow = nav.length > MAX_BAR
  const barItems = overflow ? nav.slice(0, MAX_BAR - 1) : nav
  const moreItems = overflow ? nav.slice(MAX_BAR - 1) : []

  const roleLabel = currentRole ? t[ROLE_KEY[currentRole]] : ""
  const switchRole = () => navigate("/roles")

  function signOut() {
    logout()
    navigate("/")
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-canvas md:flex-row">
      {/* Sidebar (desktop) — floating, expandable rail */}
      <aside
        className={cn(
          // OUTLINE, NO FILL. The rail is a bordered frame the page shows
          // through — so the canvas and its glows run edge to edge behind the
          // whole shell instead of being interrupted by two opaque slabs.
          // The shadow goes with the fill: a drop shadow under a transparent
          // panel is a smudge cast by nothing.
          "z-20 m-3 hidden shrink-0 flex-col rounded-xl border border-border transition-[width] duration-300 ease-out md:flex",
          expanded ? "md:w-60" : "md:w-[76px]",
        )}
      >
        {/* Brand + collapse toggle */}
        {expanded ? (
          /* THE FULL LOCKUP heads the open rail — in the HORIZONTAL arrangement
             every brand uses in a bar: the emblem on the start edge (the right,
             this being RTL), the wordmark beside it and the tagline «في قرايتك..
             خطوة بخطوة» tucked under the name. Same delivered paths as the
             stacked art, regrouped (see WaelLockupH), so the file's own draw-on
             still runs each time the rail opens.
             Horizontal because the rail is a NARROW COLUMN: stacked, the lockup
             ate a third of the sidebar's height before a single nav item, and
             the tagline had to be read as a caption under a picture. Side by
             side it's one line of brand that leaves the height to the nav.
             It sits on the brand GRADIENT because it has to — the delivered art
             is white with no theme awareness (see WaelLockup), and the gradient
             is the fill the active nav pill and the CTAs already wear, so the
             brand block reads as part of the same system rather than a pasted
             logo. */
          <div className="px-3 pb-3 pt-3">
            <div className="rounded-xl bg-grad px-3.5 pb-2.5 pt-3.5 shadow-brand">
              {/* Full-bleed now: at ~4.8:1 the lockup wants every pixel of the
                  rail's width, or the tagline under the wordmark goes to mush. */}
              <WaelLockupH className="block w-full" />
              {/* A hairline of the plate's own light, then the utility line: the
                  role — the one thing the lockup can't say — and the collapse
                  control, which used to float over the stacked art's empty
                  corner and now has an actual row to live on. */}
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/20 pt-1.5">
                <p className="truncate text-[calc(11px*var(--ts))] font-medium text-white/80">{roleLabel}</p>
                {/* Translucent white rather than a surface pill — a light-grey
                    button on a saturated gradient reads as a chip someone forgot
                    to style. */}
                <button
                  type="button"
                  onClick={() => setExpanded(false)}
                  aria-label={t.collapseMenu}
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-white/15 text-white/80 backdrop-blur-sm transition hover:bg-white/25 hover:text-white"
                >
                  <ChevronsRight className="size-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-2 py-4">
            <BrandMark />
            <button
              type="button"
              onClick={() => setExpanded(true)}
              aria-label={t.expandMenu}
              className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-surface text-ink-subtle shadow-sm transition hover:border-brand-200 hover:text-brand-600"
            >
              <ChevronsLeft className="size-4" />
            </button>
          </div>
        )}

        <nav className={cn("flex flex-1 flex-col gap-1 overflow-y-auto scroll-touch py-2", expanded ? "px-3" : "px-2")}>
          {nav.map((item) => (
            <SideNavItem key={item.path} item={item} expanded={expanded} />
          ))}
        </nav>

        {/* The rail's foot is the account. With no identity bar, this is where
            desktop learns who it is looking at — so the row states the name and
            the role, and opens the same menu the avatar used to. */}
        <div className={cn("border-t border-border p-3", !expanded && "px-2")}>
          {user && currentRole && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  aria-label={t.myAccount}
                  title={expanded ? undefined : user.name}
                  className={cn(
                    "group mb-1 flex w-full items-center rounded-md transition hover:bg-brand-50",
                    expanded ? "gap-2.5 p-2" : "justify-center py-2",
                  )}
                >
                  <Avatar name={user.name} size="sm" />
                  {expanded && (
                    <>
                      <span className="min-w-0 flex-1 text-start">
                        <span
                          dir="auto"
                          className="block truncate font-display text-[calc(13px*var(--ts))] font-bold leading-tight text-ink"
                        >
                          {user.name}
                        </span>
                        <span className="block truncate text-[calc(11px*var(--ts))] text-ink-muted">
                          {roleLabel}
                        </span>
                      </span>
                      <ChevronDown className="size-4 shrink-0 text-ink-muted transition group-data-[state=open]:rotate-180" />
                    </>
                  )}
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  side="top"
                  align="start"
                  sideOffset={8}
                  className="z-50 min-w-[14rem] rounded-lg border border-border bg-surface-raised p-1.5 shadow-lg"
                >
                  <div className="flex items-center gap-3 px-2.5 py-2">
                    <Avatar name={user.name} size="sm" />
                    <div className="min-w-0">
                      <p dir="auto" className="truncate font-display text-[calc(14px*var(--ts))] font-bold text-ink">
                        {user.name}
                      </p>
                      <p className="truncate text-[calc(12px*var(--ts))] text-ink-muted">{user.email ?? user.phone}</p>
                    </div>
                  </div>
                  <div className="my-1 h-px bg-border" />
                  <DropdownMenu.Item
                    onSelect={() => navigate(`/${currentRole}/profil`)}
                    className="flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-md px-3 text-sm text-ink outline-none transition data-[highlighted]:bg-surface-muted"
                  >
                    <UserRound className="size-4 shrink-0" /> {t.myProfile}
                  </DropdownMenu.Item>
                  <DropdownMenu.Item
                    onSelect={signOut}
                    className="flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-md px-3 text-sm text-danger-600 outline-none transition data-[highlighted]:bg-danger-50"
                  >
                    <LogOut className="size-4 shrink-0" /> {t.signOut}
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )}
          <button
            type="button"
            onClick={switchRole}
            title={expanded ? undefined : t.switchRole}
            className={cn(
              "flex w-full items-center rounded-md text-sm font-medium text-ink-subtle transition hover:bg-brand-50 hover:text-brand-600",
              expanded ? "gap-2.5 px-3.5 py-3" : "justify-center py-3",
            )}
          >
            <Repeat className="size-[18px] shrink-0 text-ink-muted" /> {expanded && t.switchRole}
          </button>
        </div>
      </aside>

      {/* Right column: the scrolling content, and nothing above it. */}
      <div className="flex h-full min-w-0 flex-1 flex-col">
        {/* The identity bar is GONE — the rail carries the user, the role and
            the role switch on desktop, and the «زيادة» sheet does on mobile.
            What it also carried has to survive it: pages portal their own nav
            (matière picker, tabs) into `HEADER_SLOT_ID`, so the slot moves here,
            sticky to the top of the scroll area. Same job — reachable while the
            content scrolls — without a bar sitting there when no page fills it
            (`empty:hidden`). It keeps its light surface: pages style that nav
            against the ink tokens. */}
        <main
          className={cn(
            "bg-paper flex-1 overflow-y-auto scroll-touch pb-24 md:pb-8",
            TINTED_PAGES.has(pathname.replace(/\/$/, "")) && "bg-tint",
          )}
        >
          <div
            id={HEADER_SLOT_ID}
            className="sticky top-0 z-20 border-b border-border bg-surface pt-safe empty:hidden md:pt-0"
          />
          <div className="p-4 pt-[max(1rem,env(safe-area-inset-top))] md:px-8 md:pt-5">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom tab bar (mobile) */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface md:hidden">
        <div className="flex items-stretch justify-around px-1 py-1">
          {barItems.map((item) => (
            <BottomNavItem key={item.path} item={item} />
          ))}
          {/* Always shown, even when nothing overflowed: with the top bar gone
              this button is the account. */}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-md text-[calc(11px*var(--ts))] font-medium text-ink-muted"
          >
            <MoreHorizontal className="size-[22px]" />
            <span>{t.more}</span>
          </button>
        </div>
      </nav>

      {/* Overflow "More" sheet (mobile only) */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="gap-0 rounded-t-xl border-border bg-surface-raised p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <SheetTitle className="px-3 py-2 font-display text-base font-bold text-ink">{t.more}</SheetTitle>

          {/* Who you are, and the two things you can do about it. On a phone
              there is no rail and no bar, so this sheet is the whole account. */}
          {user && currentRole && (
            <>
              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false)
                  navigate(`/${currentRole}/profil`)
                }}
                className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-start transition hover:bg-surface-muted"
              >
                <Avatar name={user.name} size="sm" />
                <span className="min-w-0 flex-1">
                  <span
                    dir="auto"
                    className="block truncate font-display text-[calc(14px*var(--ts))] font-bold leading-tight text-ink"
                  >
                    {user.name}
                  </span>
                  <span className="block truncate text-[calc(12px*var(--ts))] text-ink-muted">{roleLabel}</span>
                </span>
                <UserRound className="size-4 shrink-0 text-ink-muted" />
              </button>
              <div className="my-1.5 h-px bg-border" />
            </>
          )}

          <div className="flex flex-col gap-1">
            {moreItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end
                  onClick={() => setMoreOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex min-h-[48px] items-center gap-3 rounded-md px-3 text-sm font-medium transition",
                      isActive ? "bg-brand-50 text-brand-700" : "text-ink-subtle hover:bg-surface-muted",
                    )
                  }
                >
                  <Icon className="size-5" /> {item.label}
                </NavLink>
              )
            })}
            {moreItems.length > 0 && <div className="my-0.5 h-px bg-border" />}
            <button
              type="button"
              onClick={() => {
                setMoreOpen(false)
                switchRole()
              }}
              className="flex min-h-[48px] items-center gap-3 rounded-md px-3 text-sm font-medium text-ink-subtle transition hover:bg-surface-muted"
            >
              <Repeat className="size-5" /> {t.switchRole}
            </button>
            <button
              type="button"
              onClick={signOut}
              className="flex min-h-[48px] items-center gap-3 rounded-md px-3 text-sm font-medium text-danger-600 transition hover:bg-danger-50"
            >
              <LogOut className="size-5" /> {t.signOut}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
