import { BookOpen, CalendarDays, GraduationCap, LayoutDashboard } from "lucide-react"
import type { NavItem } from "./types"

export const teacherNav: NavItem[] = [
  { label: "Tableau de bord", path: "/teacher", icon: LayoutDashboard },
  { label: "Mes cours", path: "/teacher/courses", icon: BookOpen },
  { label: "Mes séances", path: "/teacher/sessions", icon: CalendarDays },
  { label: "Mes élèves", path: "/teacher/students", icon: GraduationCap },
]
