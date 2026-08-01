import { useEffect, useState, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import {
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  GraduationCap,
  LogOut,
  MoreHorizontal,
  Repeat,
  UserRound,
} from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Avatar } from "@/components/kit/Avatar"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"
import { cn } from "@/lib/utils"
import type { Role } from "@/data/types"
import type { NavItem } from "@/app/nav/types"

const ROLE_LABEL: Record<Role, string> = {
  admin: "Administration",
  teacher: "Enseignant",
  parent: "Parent",
  student: "Élève",
}

const MAX_BAR = 5 // items shown in the mobile bottom bar before overflowing to "More"

const HEADER_SLOT_ID = "shell-header-slot"

/**
 * Renders its children as a second row INSIDE the shell header card — same
 * surface, divided by a border-t, zero gap. For page-level nav that must stay
 * reachable while the content scrolls (the header never scrolls): portal into
 * it when needed, unmount to give the row back. React context (router, stores)
 * is preserved across the portal.
 */
export function ShellHeaderPortal({ children }: { children: ReactNode }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null)
  // Looked up in an effect: the shell (and the slot div) is guaranteed mounted
  // by then, and SSR-safety costs nothing.
  useEffect(() => setSlot(document.getElementById(HEADER_SLOT_ID)), [])
  return slot ? createPortal(children, slot) : null
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
          "flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-md text-[11px] font-medium transition",
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
 * Desktop: left sidebar. Mobile: top app bar + fixed bottom tab bar (overflow
 * items in a "More" sheet). "Switch role" is reachable in every shell. Safe-area
 * padded; content scrolls internally. Renders <Outlet/>.
 */
export function AppShell({ nav }: { nav: NavItem[] }) {
  const navigate = useNavigate()
  const { currentRole, currentUser, logout } = useAuth()
  // The live row from the store, so a profile edit renames the header at once.
  const currentUserId = currentUser?.id
  const user = useData((s) => s.users.find((u) => u.id === currentUserId)) ?? currentUser
  const [moreOpen, setMoreOpen] = useState(false)
  const [expanded, setExpanded] = useState(true)

  const overflow = nav.length > MAX_BAR
  const barItems = overflow ? nav.slice(0, MAX_BAR - 1) : nav
  const moreItems = overflow ? nav.slice(MAX_BAR - 1) : []

  const roleLabel = currentRole ? ROLE_LABEL[currentRole] : ""
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
          "z-20 m-3 hidden shrink-0 flex-col rounded-xl border border-border bg-surface shadow-lg transition-[width] duration-300 ease-out md:flex",
          expanded ? "md:w-60" : "md:w-[76px]",
        )}
      >
        {/* Brand + collapse toggle */}
        {expanded ? (
          <div className="flex items-center justify-between gap-2 px-4 py-4">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-grad text-ink-inverted shadow-brand">
                <GraduationCap className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="font-display text-[15px] font-bold leading-tight text-ink">Wael Academy</p>
                <p className="truncate text-[11px] text-ink-muted">{roleLabel}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-label="Réduire le menu"
              className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-surface text-ink-subtle shadow-sm transition hover:border-brand-200 hover:text-brand-600"
            >
              <ChevronsLeft className="size-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-2 py-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-grad text-ink-inverted shadow-brand">
              <GraduationCap className="size-5" />
            </span>
            <button
              type="button"
              onClick={() => setExpanded(true)}
              aria-label="Développer le menu"
              className="grid size-8 shrink-0 place-items-center rounded-full border border-border bg-surface text-ink-subtle shadow-sm transition hover:border-brand-200 hover:text-brand-600"
            >
              <ChevronsRight className="size-4" />
            </button>
          </div>
        )}

        <nav className={cn("flex flex-1 flex-col gap-1 overflow-y-auto scroll-touch py-2", expanded ? "px-3" : "px-2")}>
          {nav.map((item) => (
            <SideNavItem key={item.path} item={item} expanded={expanded} />
          ))}
        </nav>

        <div className={cn("border-t border-border p-3", !expanded && "px-2")}>
          <button
            type="button"
            onClick={switchRole}
            title={expanded ? undefined : "Changer de rôle"}
            className={cn(
              "flex w-full items-center rounded-md text-sm font-medium text-ink-subtle transition hover:bg-brand-50 hover:text-brand-600",
              expanded ? "gap-2.5 px-3.5 py-3" : "justify-center py-3",
            )}
          >
            <Repeat className="size-[18px] shrink-0 text-ink-muted" /> {expanded && "Changer de rôle"}
          </button>
        </div>
      </aside>

      {/* Right column: top bar + scrolling content */}
      <div className="flex h-full min-w-0 flex-1 flex-col">
        {/* The header card. Row 1 is the identity bar; row 2 is an empty slot a
            page can portal secondary nav into (ShellHeaderPortal) — it then
            reads as the header growing a row, not as a bar over the content. */}
        <header className="z-20 border-b border-border bg-surface md:mt-3 md:me-3 md:overflow-hidden md:rounded-lg md:border md:shadow-sm">
          <div className="flex items-center gap-3 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:px-8 md:pb-4 md:pt-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-grad text-ink-inverted shadow-brand md:hidden">
              <GraduationCap className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium uppercase tracking-[.12em] text-accent2-600">{roleLabel}</p>
              <h1 className="truncate font-display text-lg font-bold leading-tight text-ink md:text-xl">
                {user?.name ?? "Wael Academy"}
              </h1>
            </div>
            <button
              type="button"
              onClick={switchRole}
              aria-label="Changer de rôle"
              className="inline-flex h-11 items-center gap-2 rounded-md border border-border-strong bg-surface px-3 text-[13px] font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600 md:h-9"
            >
              <Repeat className="size-4" /> <span className="hidden sm:inline">Changer de rôle</span>
            </button>
            {user && currentRole && (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  {/* The chevron is what makes the avatar read as a control. */}
                  <button
                    type="button"
                    aria-label="Mon compte"
                    className="group inline-flex h-11 shrink-0 items-center gap-1 rounded-full border border-transparent pe-1.5 ps-0.5 transition hover:border-border-strong hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-10"
                  >
                    <Avatar name={user.name} />
                    <ChevronDown className="size-4 text-ink-muted transition group-hover:text-brand-600 group-data-[state=open]:rotate-180" />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={8}
                    className="z-50 min-w-[15rem] rounded-lg border border-border bg-surface-raised p-1.5 shadow-lg"
                  >
                    <div className="flex items-center gap-3 px-2.5 py-2">
                      <Avatar name={user.name} size="sm" />
                      <div className="min-w-0">
                        <p dir="auto" className="truncate font-display text-[14px] font-bold text-ink">
                          {user.name}
                        </p>
                        <p className="truncate text-[12px] text-ink-muted">{user.email ?? user.phone}</p>
                      </div>
                    </div>
                    <div className="my-1 h-px bg-border" />
                    <DropdownMenu.Item
                      onSelect={() => navigate(`/${currentRole}/profil`)}
                      className="flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-md px-3 text-sm text-ink outline-none transition data-[highlighted]:bg-surface-muted"
                    >
                      <UserRound className="size-4 shrink-0" /> Mon profil
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={signOut}
                      className="flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-md px-3 text-sm text-danger-600 outline-none transition data-[highlighted]:bg-danger-50"
                    >
                      <LogOut className="size-4 shrink-0" /> Se déconnecter
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            )}
          </div>
          <div id={HEADER_SLOT_ID} className="border-t border-border empty:hidden" />
        </header>

        <main className="flex-1 overflow-y-auto scroll-touch p-4 pb-24 md:px-8 md:pb-8 md:pt-5">
          <Outlet />
        </main>
      </div>

      {/* Bottom tab bar (mobile) */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface md:hidden">
        <div className="flex items-stretch justify-around px-1 py-1">
          {barItems.map((item) => (
            <BottomNavItem key={item.path} item={item} />
          ))}
          {moreItems.length > 0 && (
            <button
              type="button"
              onClick={() => setMoreOpen(true)}
              className="flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-md text-[11px] font-medium text-ink-muted"
            >
              <MoreHorizontal className="size-[22px]" />
              <span>Plus</span>
            </button>
          )}
        </div>
      </nav>

      {/* Overflow "More" sheet (mobile only) */}
      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="gap-0 rounded-t-xl border-border bg-surface-raised p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <SheetTitle className="px-3 py-2 font-display text-base font-bold text-ink">Plus</SheetTitle>
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
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
