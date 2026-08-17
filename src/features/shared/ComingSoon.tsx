import { Clock } from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { useLocale } from "@/i18n/locale"

/** Placeholder for nav items not yet built — shared across all roles. */
export function ComingSoon({ title }: { title: string }) {
  const locale = useLocale()
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title={title} />
      <div className="rounded-lg border border-dashed border-border bg-surface">
        <EmptyState
          icon={Clock}
          title={locale === "ar" ? "قريب" : "Bientôt"}
          description={
            locale === "ar"
              ? "الشاشة هذي مازالت ما تبناتش في النموذج."
              : "Cet écran n'est pas encore construit dans la maquette."
          }
        />
      </div>
    </div>
  )
}
