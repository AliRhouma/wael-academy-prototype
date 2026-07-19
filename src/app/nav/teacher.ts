import { BookOpen, CalendarDays, GraduationCap } from "lucide-react"
import { DashboardIcon } from "@/components/icons/DashboardIcon"
import type { NavItem } from "./types"

export const teacherNav: NavItem[] = [
  { label: "Tableau de bord", path: "/teacher", icon: DashboardIcon, colored: true },
  { label: "Mes cours", path: "/teacher/courses", icon: BookOpen },
  { label: "Mes séances", path: "/teacher/sessions", icon: CalendarDays },
  { label: "Mes élèves", path: "/teacher/students", icon: GraduationCap },
]
