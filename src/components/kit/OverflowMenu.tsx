import { MoreVertical } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { cn } from "@/lib/utils"

export interface OverflowAction {
  label: string
  icon?: LucideIcon
  onClick: () => void
  tone?: "default" | "danger"
}

/**
 * A visible "…" menu for row / item actions — replaces hover-reveal so actions
 * stay reachable on touch. Radix handles tap, click-outside, focus, keyboard.
 * Trigger is 44px on mobile / 36px desktop; menu rows are ≥44px. Styled per the
 * design system dropdown recipe (components.md §12); opens toward the end edge.
 */
export function OverflowMenu({
  actions,
  label = "Actions",
}: {
  actions: OverflowAction[]
  label?: string
}) {
  if (actions.length === 0) return null

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={label}
          className="grid size-11 shrink-0 place-items-center rounded-md text-ink-muted transition hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:size-9"
        >
          <MoreVertical className="size-[18px]" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={6}
          className="z-50 min-w-[12rem] rounded-lg border border-border bg-surface-raised p-1.5 shadow-lg"
        >
          {actions.map((action, i) => {
            const Icon = action.icon
            return (
              <DropdownMenu.Item
                key={i}
                onSelect={action.onClick}
                className={cn(
                  "flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-md px-3 text-sm outline-none transition",
                  action.tone === "danger"
                    ? "text-danger-600 data-[highlighted]:bg-danger-50"
                    : "text-ink data-[highlighted]:bg-surface-muted",
                )}
              >
                {Icon && <Icon className="size-4 shrink-0" />}
                {action.label}
              </DropdownMenu.Item>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
