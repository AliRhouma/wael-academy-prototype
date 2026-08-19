import { useState } from "react"
import { FileText } from "lucide-react"
import { PdfModal } from "@/components/kit/PdfModal"
import { cn } from "@/lib/utils"
import type { Homework } from "@/data/types"

/**
 * TWO LABELS, one for each side of the séance.
 *
 * Before it runs, the documents are an INSTRUCTION — « les exercices que tu dois
 * faire » — and the card asks for them in red. Once the séance has been given,
 * the very same files are just what was handed out that day: nothing is being
 * asked any more, so the button stops asking and becomes a shelf.
 *
 * The compact shape wears whichever applies as its accessible name.
 */
const LABEL_TODO = "تمارين لازم تخدمهم"
const LABEL_PAST = "وثائق الحصة"

export interface HomeworkDocsButtonProps {
  /** The خدمة hanging on one séance. No documents → nothing renders. */
  homeworks: Homework[]
  /**
   * Shrink to the icon alone, sized to sit on a title's line.
   *
   * For rows that have no room for four words next to what they are already
   * saying — the dashboard's agenda, where the séance title takes the line and
   * the panel is ~250px wide. The label stays in `aria-label` and in the native
   * tooltip, and the red says the rest: it is the only red thing on the row.
   *
   * It is a FILLED chip, and it carries the number of documents once there is
   * more than one. An outlined pen at 17px on a cream panel was a smudge — two
   * words of a séance title away from it, nothing said « there is a file for
   * you here » — and the count is what turns an icon into a quantity the élève
   * can plan around without opening the sheet.
   */
  compact?: boolean
  /**
   * The séance has already been given.
   *
   * Flips the label to « وثائق الحصة » and drops the red with it: red is what
   * the app uses for something the élève still has to DO, and a séance behind
   * them is not asking. Same documents, same sheet — a different sentence.
   */
  past?: boolean
  /**
   * CONTROLLED open state, for the callers that can open the sheet by another
   * road — the calendar card is pressable over its whole surface, and « les
   * documents » is what pressing it means once the séance is behind the élève.
   * Leave both out and the button keeps its own state, which is all a plain row
   * needs.
   */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Width and spacing — the caller owns those, the button owns its look. */
  className?: string
}

/**
 * « تمارين لازم تخدمهم » — the exercises attached to a séance, and the sheet
 * that hands them over.
 *
 * ONE component for the button AND its modal, because the two are never useful
 * apart: wherever a séance shows up with work on it — the calendar's day panel,
 * the dashboard's agenda — the élève should meet the same button, in the same
 * words, opening the same « تمارين تابعة الحصة ». It was written inline on the
 * calendar card first; the moment the dashboard wanted it too, a copy would have
 * been two buttons drifting apart.
 *
 * Which words depends on WHEN: see `past`.
 *
 * It owns its own `open` state so a caller only has to drop it in a row. The
 * dialog exists in the DOM only while it is open, so a list of ten séances
 * doesn't carry ten sleeping modals.
 *
 * Renders NOTHING when the خدمة carries no document: with nothing to hand over,
 * the button would open an empty sheet, and a dead button is worse than a quiet
 * card. (Nothing in the seed is like this — the shape allows it.)
 */
export function HomeworkDocsButton({
  homeworks,
  compact,
  past,
  open: openProp,
  onOpenChange,
  className,
}: HomeworkDocsButtonProps) {
  const [openSelf, setOpenSelf] = useState(false)
  const open = openProp ?? openSelf
  const setOpen = (next: boolean) => {
    setOpenSelf(next)
    onOpenChange?.(next)
  }
  const pdfs = homeworks.flatMap((h) => h.pdfs)
  const label = past ? LABEL_PAST : LABEL_TODO

  if (pdfs.length === 0) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={compact ? label : undefined}
        title={compact ? label : undefined}
        className={cn(
          "inline-flex items-center justify-center gap-1 rounded-[12px] border-2",
          "text-[calc(12px*var(--ts))] font-bold transition duration-150",
          /*
           * COLOURS AS CLASSES, borders included — an inline `borderColor`
           * outranks every `hover:` rule, which is why this button could change
           * its fill under the pointer and nothing else.
           *
           * The quiet variant answers in BRAND rather than going a shade
           * greyer: « وثائق الحصة » is a door, and grey-on-grey is how a control
           * says it is disabled. The red one deepens into its own colour — it is
           * already saying « à faire », it just says it louder.
           */
          past
            ? "border-[var(--border-strong)] text-ink-subtle hover:border-[var(--brand-400)] hover:text-[var(--brand-700)]"
            : "border-[color-mix(in_srgb,var(--danger-500)_35%,transparent)] text-danger-700 hover:border-[var(--danger-500)]",
          // The same half-step the séance card and the month cells rise by, so
          // nothing on this page moves in its own way.
          "hover:shadow-sm motion-safe:hover:-translate-y-px motion-safe:active:translate-y-0",
          compact
            ? // 44px under the thumb, 32px under a pointer: the dashboard row it
              // rides is one line of title, and a full touch target there would
              // be taller than everything it sits beside. `min-w` rather than
              // `size`, so the count can widen the chip without pushing the
              // icon off its centre.
              cn(
                "h-11 min-w-11 shrink-0 rounded-[10px] px-1.5 sm:h-8 sm:min-w-8",
                past
                  ? "bg-surface-muted hover:bg-[color-mix(in_srgb,var(--brand-500)_10%,transparent)]"
                  : "bg-danger-50 hover:brightness-95",
              )
            : cn(
                "min-h-11 px-3",
                past
                  ? "hover:bg-[color-mix(in_srgb,var(--brand-500)_8%,transparent)]"
                  : "hover:bg-danger-50",
              ),
          className,
        )}
      >
        <FileText className={cn("shrink-0", compact ? "size-[17px]" : "size-4")} />
        {compact ? pdfs.length > 1 && <span className="tabular-nums">{pdfs.length}</span> : label}
      </button>

      {/* NO kicker line. `PdfModal` can wear a type badge and a context above
          its title — a résumé shows « ملخّص · الفصل 3 » — but here both said
          what the title already says: the badge repeated « تمارين » one line
          above « تمارين تابعة الحصة », and the matière was the matière of the
          séance the élève opened this from. Two labels, no new information. */}
      <PdfModal open={open} onOpenChange={setOpen} title="تمارين تابعة الحصة" pdfs={pdfs} />
    </>
  )
}
