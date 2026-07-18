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
          title="Bientôt disponible"
          description="Cet écran n’est pas encore construit dans le prototype."
        />
      </div>
    </div>
  )
}
