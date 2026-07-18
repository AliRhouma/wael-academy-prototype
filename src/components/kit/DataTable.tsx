import type { ReactNode } from "react"
import { Inbox } from "lucide-react"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/kit/EmptyState"

export interface Column<T> {
  key: string
  header: ReactNode
  /** Cell renderer. If omitted, `row[key]` is rendered as-is. */
  render?: (row: T) => ReactNode
  align?: "left" | "center" | "right"
  className?: string
  headerClassName?: string
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string
  /** Show skeleton rows instead of data. */
  loading?: boolean
  loadingRows?: number
  /** Custom empty state; defaults to a neutral "Aucune donnée" state. */
  empty?: ReactNode
  onRowClick?: (row: T) => void
  className?: string
}

const ALIGN = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const

/**
 * Generic, typed data table in a soft white card (design system → patterns.md
 * "List / table"). Loading and empty states are built in so every list handles
 * them the same way.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  loadingRows = 5,
  empty,
  onRowClick,
  className,
}: DataTableProps<T>) {
  const isEmpty = !loading && rows.length === 0

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-surface shadow-sm",
        className,
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-muted">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-xs font-medium uppercase tracking-wide text-ink-muted",
                    ALIGN[col.align ?? "left"],
                    col.headerClassName,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading &&
              Array.from({ length: loadingRows }).map((_, r) => (
                <tr key={`skeleton-${r}`}>
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-4">
                      <div className="h-4 w-full max-w-[140px] animate-pulse rounded bg-neutral-100" />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading &&
              rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "transition hover:bg-neutral-50",
                    onRowClick && "cursor-pointer",
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-4 text-ink-subtle",
                        ALIGN[col.align ?? "left"],
                        col.className,
                      )}
                    >
                      {col.render
                        ? col.render(row)
                        : (row as unknown as Record<string, ReactNode>)[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {isEmpty &&
        (empty ?? (
          <EmptyState
            icon={Inbox}
            title="Aucune donnée"
            description="Rien à afficher pour le moment."
          />
        ))}
    </div>
  )
}
