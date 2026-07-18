import type { ReactNode } from "react"
import { Inbox } from "lucide-react"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/kit/EmptyState"
import { OverflowMenu, type OverflowAction } from "@/components/kit/OverflowMenu"

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
  loading?: boolean
  loadingRows?: number
  empty?: ReactNode
  onRowClick?: (row: T) => void
  /** Per-row actions — shown behind a visible "…" overflow menu (touch-safe). */
  rowActions?: (row: T) => OverflowAction[]
  className?: string
}

const ALIGN = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const

function cell<T>(col: Column<T>, row: T): ReactNode {
  return col.render ? col.render(row) : (row as unknown as Record<string, ReactNode>)[col.key]
}

/**
 * Generic, typed data table. Mobile-first: below `md` each row is a stacked
 * card (label: value pairs); at `md+` it's a real table. One data source, two
 * renderers (Tailwind show/hide). Loading + empty states are built in, and row
 * actions live behind a visible "…" menu — never a hover reveal.
 */
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  loadingRows = 5,
  empty,
  onRowClick,
  rowActions,
  className,
}: DataTableProps<T>) {
  const isEmpty = !loading && rows.length === 0
  const skeletons = Array.from({ length: loadingRows })
  const [head, ...rest] = columns

  return (
    <div className={cn("w-full", className)}>
      {!isEmpty && (
        <>
          {/* -------- Desktop: real table (md+) -------- */}
          <div className="hidden overflow-hidden rounded-lg border border-border bg-surface shadow-sm md:block">
            <div className="overflow-x-auto scroll-touch">
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
                    {rowActions && <th className="w-12 px-2 py-3" />}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading &&
                    skeletons.map((_, r) => (
                      <tr key={`sk-${r}`}>
                        {columns.map((col) => (
                          <td key={col.key} className="px-4 py-4">
                            <div className="h-4 w-full max-w-[140px] animate-pulse rounded bg-neutral-100" />
                          </td>
                        ))}
                        {rowActions && <td className="px-2 py-4" />}
                      </tr>
                    ))}

                  {!loading &&
                    rows.map((row) => (
                      <tr
                        key={rowKey(row)}
                        onClick={onRowClick ? () => onRowClick(row) : undefined}
                        className={cn("transition hover:bg-neutral-50", onRowClick && "cursor-pointer")}
                      >
                        {columns.map((col) => (
                          <td
                            key={col.key}
                            className={cn("px-4 py-4 text-ink-subtle", ALIGN[col.align ?? "left"], col.className)}
                          >
                            {cell(col, row)}
                          </td>
                        ))}
                        {rowActions && (
                          <td className="px-2 py-2 text-end" onClick={(e) => e.stopPropagation()}>
                            <OverflowMenu actions={rowActions(row)} />
                          </td>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* -------- Mobile: stacked cards (below md) -------- */}
          <div className="flex flex-col gap-3 md:hidden">
            {loading &&
              skeletons.map((_, r) => (
                <div key={`skm-${r}`} className="rounded-lg border border-border bg-surface p-4 shadow-sm">
                  <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-100" />
                  <div className="mt-3 h-3 w-2/3 animate-pulse rounded bg-neutral-100" />
                </div>
              ))}

            {!loading &&
              rows.map((row) => (
                <div
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(
                    "rounded-lg border border-border bg-surface p-4 shadow-sm transition",
                    onRowClick && "cursor-pointer active:bg-neutral-50",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">{head && cell(head, row)}</div>
                    {rowActions && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <OverflowMenu actions={rowActions(row)} />
                      </div>
                    )}
                  </div>
                  {rest.length > 0 && (
                    <dl className="mt-3 space-y-1.5">
                      {rest.map((col) => (
                        <div key={col.key} className="flex items-center justify-between gap-3 text-sm">
                          <dt className="shrink-0 text-ink-muted">{col.header}</dt>
                          <dd className="min-w-0 text-end text-ink">{cell(col, row)}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              ))}
          </div>
        </>
      )}

      {/* -------- Shared empty state -------- */}
      {isEmpty &&
        (empty ?? (
          <div className="rounded-lg border border-border bg-surface shadow-sm">
            <EmptyState icon={Inbox} title="Aucune donnée" description="Rien à afficher pour le moment." />
          </div>
        ))}
    </div>
  )
}
