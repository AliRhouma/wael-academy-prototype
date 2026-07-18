import { CalendarDays, CreditCard, LayoutDashboard, Users } from "lucide-react"
import type { NavItem } from "./types"

export const parentNav: NavItem[] = [
  { label: "Tableau de bord", path: "/parent", icon: LayoutDashboard },
  { label: "Mes enfants", path: "/parent/children", icon: Users },
  { label: "Séances", path: "/parent/sessions", icon: CalendarDays },
  { label: "Paiements", path: "/parent/payments", icon: CreditCard },
]
