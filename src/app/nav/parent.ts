import { CalendarDays, CreditCard, Users } from "lucide-react"
import { DashboardIcon } from "@/components/icons/DashboardIcon"
import type { NavItem } from "./types"

export const parentNav: NavItem[] = [
  { label: "Tableau de bord", path: "/parent", icon: DashboardIcon, colored: true },
  { label: "Mes enfants", path: "/parent/children", icon: Users },
  { label: "Séances", path: "/parent/sessions", icon: CalendarDays },
  { label: "Paiements", path: "/parent/payments", icon: CreditCard },
]
