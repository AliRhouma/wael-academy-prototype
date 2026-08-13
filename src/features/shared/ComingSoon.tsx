import { Clock } from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"

/** Placeholder for nav items not yet built — shared across all roles. */
export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} />
      <div className="rounded-lg border border-dashed border-border bg-surface">
        <EmptyState
          icon={Clock}
          title="قريب"
          description="الشاشة هذي مازالت ما تبناتش في النموذج."
        />
      </div>
    </div>
  )
}
