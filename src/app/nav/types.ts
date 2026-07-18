import type { LucideIcon } from "lucide-react"

/** One navigation entry. Roles differ only by their list of these. */
export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}
