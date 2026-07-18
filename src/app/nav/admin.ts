import { BookOpen, CalendarDays, CreditCard, LayoutDashboard, Settings, Users } from "lucide-react"
import type { NavItem } from "./types"

export const adminNav: NavItem[] = [
  { label: "Tableau de bord", path: "/admin", icon: LayoutDashboard },
  { label: "Utilisateurs", path: "/admin/users", icon: Users },
  { label: "Cours", path: "/admin/courses", icon: BookOpen },
  { label: "Séances", path: "/admin/sessions", icon: CalendarDays },
  { label: "Paiements", path: "/admin/payments", icon: CreditCard },
  { label: "Réglages", path: "/admin/settings", icon: Settings },
]
