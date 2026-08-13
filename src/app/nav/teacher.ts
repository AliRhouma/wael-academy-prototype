import { BookOpen, CalendarDays, GraduationCap } from "lucide-react"
import { DashboardIcon } from "@/components/icons/DashboardIcon"
import type { NavItem } from "./types"

export const teacherNav: NavItem[] = [
  { label: "لوحة القيادة", path: "/teacher", icon: DashboardIcon, colored: true },
  { label: "دروسي", path: "/teacher/courses", icon: BookOpen },
  { label: "حصصي", path: "/teacher/sessions", icon: CalendarDays },
  { label: "تلامذتي", path: "/teacher/students", icon: GraduationCap },
]
