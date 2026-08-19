import { useState } from "react"
import { Link } from "react-router-dom"
import { Check, ChevronDown } from "lucide-react"
import { DropdownMenu } from "radix-ui"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { SubjectIcon } from "@/components/icons/subjects"
import { subjectTheme } from "@/features/student/subjectTheme"
import { useIsMobile } from "@/lib/hooks"
import { cn } from "@/lib/utils"
import type { Subject } from "@/data/types"

/**
 * The compact matière control of the condensed sticky bar — the horizontal rail
 * folded into one chip once it has scrolled away.
 *
 * Desktop opens a dropdown (Radix owns click-outside, focus and keyboard);
 * mobile opens a bottom sheet, per the shell's own idiom. Rows are ≥44px and
 * the open matière carries a check, so the élève always sees where they are.
 */
export function SubjectPicker({
  subjects,
  active,
  hrefFor = (subject) => `/student/matieres/${subject.id}`,
}: {
  subjects: Subject[]
  active: Subject
  /** Same escape hatch as SubjectSwitcher — reuse the control on another route. */
  hrefFor?: (subject: Subject) => string
}) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)
  const theme = subjectTheme(active.category)

  /** Radix injects its own handlers via `asChild`; the sheet passes one in. */
  const trigger = (onClick?: () => void) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={`المادّة: ${active.name}. بدّل المادّة`}
      className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-md border border-border-strong bg-surface ps-1.5 pe-2 transition hover:border-brand-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* The drawing, straight on the control. A badge is ALREADY a card — a
          navy-ringed disc with its own backdrop — so the tinted rounded plate
          that used to sit under it read as a second card behind the first, at
          24px, where the two edges are a millimetre apart. Same rule the
          matière grid and the page's own identity block already follow. */}
      <SubjectIcon name={active.name} className="size-7 shrink-0" />
      <span
        dir="auto"
        className={cn(
          "max-w-[4.5rem] truncate text-[calc(13px*var(--ts))] font-semibold sm:max-w-[9rem]",
          theme.name,
        )}
      >
        {active.name}
      </span>
      <ChevronDown className="size-4 shrink-0 text-ink-muted" />
    </button>
  )

  /** One matière row — same content in the dropdown and in the sheet. */
  function row(subject: Subject, onNavigate: () => void) {
    const isActive = subject.id === active.id
    const rowTheme = subjectTheme(subject.category)
    return (
      <Link
        to={hrefFor(subject)}
        onClick={onNavigate}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex min-h-[44px] items-center gap-2.5 rounded-md px-2 outline-none transition",
          isActive ? "bg-brand-50" : "hover:bg-surface-muted data-[highlighted]:bg-surface-muted",
        )}
      >
        <SubjectIcon name={subject.name} className="size-8 shrink-0" />
        <span
          dir="auto"
          className={cn(
            "min-w-0 flex-1 truncate text-sm",
            isActive ? cn("font-semibold", rowTheme.name) : "text-ink-subtle",
          )}
        >
          {subject.name}
        </span>
        {isActive && <Check className="size-4 shrink-0 text-brand-600" />}
      </Link>
    )
  }

  if (isMobile) {
    return (
      <>
        {trigger(() => setOpen(true))}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="bottom"
            className="max-h-[80dvh] gap-0 rounded-t-xl border-border bg-surface-raised p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
          >
            <SheetTitle className="px-3 py-2 font-display text-base font-bold text-ink">
              بدّل المادّة
            </SheetTitle>
            <div className="flex flex-col gap-0.5 overflow-y-auto scroll-touch">
              {subjects.map((subject) => (
                <div key={subject.id}>{row(subject, () => setOpen(false))}</div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </>
    )
  }

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>{trigger()}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className="z-50 max-h-[70dvh] w-[17rem] overflow-y-auto scroll-touch rounded-lg border border-border bg-surface-raised p-1.5 shadow-lg"
        >
          {subjects.map((subject) => (
            <DropdownMenu.Item key={subject.id} asChild className="cursor-pointer">
              {row(subject, () => setOpen(false))}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
