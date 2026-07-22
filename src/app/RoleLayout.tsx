import { useEffect } from "react"
import { AppShell } from "@/components/AppShell"
import { ChatWidget } from "@/features/student/ChatWidget"
import { useAuth } from "@/stores/useAuth"
import type { Role } from "@/data/types"
import type { NavItem } from "@/app/nav/types"

/**
 * Reads the role from the route and ensures the auth store matches it (so a
 * direct deep-link to /teacher works too), then renders the ONE shared AppShell
 * with that role's nav. Renders nothing during the one sync frame — every role
 * has a seeded demo user, so it resolves immediately.
 */
export function RoleLayout({ role, nav }: { role: Role; nav: NavItem[] }) {
  const currentRole = useAuth((s) => s.currentRole)
  const currentUser = useAuth((s) => s.currentUser)
  const setRole = useAuth((s) => s.setRole)

  useEffect(() => {
    if (currentRole !== role) setRole(role)
  }, [role, currentRole, setRole])

  if (currentRole !== role || !currentUser) return null

  return (
    <>
      <AppShell nav={nav} />
      {/* Students carry the floating messagerie bubble on every screen. */}
      {role === "student" && <ChatWidget />}
    </>
  )
}
