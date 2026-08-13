import { useMemo, useState, type ReactNode } from "react"
import { useNavigate } from "react-router-dom"
import {
  BookOpen,
  ChevronLeft,
  Copy,
  GraduationCap,
  Layers,
  Library,
  Pencil,
  Plus,
  School,
  Trash2,
  type LucideIcon,
} from "lucide-react"
import { PageHeader } from "@/components/kit/PageHeader"
import { EmptyState } from "@/components/kit/EmptyState"
import { OverflowMenu } from "@/components/kit/OverflowMenu"
import { FormSheet } from "@/components/kit/FormSheet"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { useToast } from "@/components/kit/Toast"
import { useData } from "@/stores/useData"
import type { Cycle, Year } from "@/data/types"
import {
  CYCLES,
  cycleDef,
  groupYearsByCycle,
  sectionsFor,
  yearLabel,
  yearName,
  yearOrder,
} from "@/data/curriculum"
import { copyName, duplicateYear } from "./duplicate"
import { DuplicateSheet } from "./DuplicateSheet"

/** Per-cycle display: its icon and the tone of its icon chip. */
const CYCLE_STYLE: Record<Cycle, { icon: LucideIcon; chip: string }> = {
  college: { icon: School, chip: "bg-brand-50 text-brand-600" },
  secondaire: { icon: Library, chip: "bg-info-50 text-info-600" },
  bac: { icon: GraduationCap, chip: "bg-accent2-50 text-accent2-700" },
}

/** A chip used to pick the cycle, the niveau and the section in the form. */
function Choice({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex min-h-9 items-center rounded-full border px-3 py-1 text-sm font-medium transition " +
        (active
          ? "border-transparent bg-grad text-ink-inverted shadow-brand"
          : "border-border-strong bg-surface text-ink-subtle hover:border-brand-200 hover:text-brand-600")
      }
    >
      {children}
    </button>
  )
}

function YearCard({
  label,
  count,
  onOpen,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  /** What the card leads with — the section, or the niveau when there is none. */
  label: string
  count: number
  onOpen: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  return (
    <div
      onClick={onOpen}
      className="group flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm transition hover:border-brand-200 hover:shadow-md motion-safe:hover:-translate-y-0.5"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-brand-50 text-brand-600">
        <BookOpen className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p dir="auto" className="truncate font-display text-[calc(15px*var(--ts))] font-bold text-ink">
          {label}
        </p>
        <p className="mt-0.5 text-[calc(12px*var(--ts))] text-ink-muted">
          {count > 0 ? `${count} مادّة` : "ما فماش موادّ"}
        </p>
      </div>
      <ChevronLeft className="size-5 shrink-0 text-ink-muted transition group-hover:text-brand-600" />
      <div onClick={(e) => e.stopPropagation()}>
        <OverflowMenu
          actions={[
            { label: "بدّل", icon: Pencil, onClick: onEdit },
            { label: "اعمل نسخة", icon: Copy, onClick: onDuplicate },
            { label: "امسح", icon: Trash2, tone: "danger", onClick: onDelete },
          ]}
        />
      </div>
    </div>
  )
}

/** Admin — the programme: three cycles (collège · secondaire · bac), their
 * niveaux and, from the 2ème année on, their sections. */
export default function AdminYearsScreen() {
  const navigate = useNavigate()
  const years = useData((s) => s.years)
  const subjects = useData((s) => s.subjects)
  const addYear = useData((s) => s.addYear)
  const updateYear = useData((s) => s.updateYear)
  const removeYear = useData((s) => s.removeYear)
  const { show, toast } = useToast()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Year | null>(null)
  const [cycle, setCycle] = useState<Cycle>("college")
  const [level, setLevel] = useState("")
  const [section, setSection] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<Year | null>(null)

  // Duplicating a classe = choosing the cycle / niveau / section it lands in.
  const [dupTarget, setDupTarget] = useState<Year | null>(null)
  const [dupName, setDupName] = useState("")
  const [dupNamed, setDupNamed] = useState(false)
  const [dupCycle, setDupCycle] = useState<Cycle>("college")
  const [dupLevel, setDupLevel] = useState("")
  const [dupSection, setDupSection] = useState("")

  const countByYear = useMemo(() => {
    const m = new Map<string, number>()
    for (const s of subjects) m.set(s.yearId, (m.get(s.yearId) ?? 0) + 1)
    return m
  }, [subjects])

  const groups = useMemo(() => groupYearsByCycle(years), [years])

  const countFor = (y: Year) => countByYear.get(y.id) ?? 0

  const levels = cycleDef(cycle).levels
  const sections = sectionsFor(cycle, level)

  function openAdd(preset: Cycle = "college") {
    const first = cycleDef(preset).levels[0]
    setEditing(null)
    setCycle(preset)
    setLevel(first?.name ?? "")
    setSection("")
    setFormOpen(true)
  }

  function openEdit(year: Year) {
    setEditing(year)
    setCycle(year.cycle)
    setLevel(year.level)
    setSection(year.section ?? "")
    setFormOpen(true)
  }

  function pickCycle(next: Cycle) {
    setCycle(next)
    setLevel(cycleDef(next).levels[0]?.name ?? "")
    setSection("")
  }

  function pickLevel(next: string) {
    setLevel(next)
    setSection("")
  }

  function submit() {
    if (!level) return
    // A niveau with filières needs one — the class isn't identified without it.
    if (sections.length > 0 && !section) return
    const patch = {
      name: yearName(level, section || undefined),
      cycle,
      level,
      section: section || undefined,
      order: yearOrder(cycle, level, section || undefined),
    }
    if (editing) {
      updateYear(editing.id, patch)
      show("القسم تبدّل")
    } else {
      addYear(patch)
      show("القسم تزاد")
    }
    setFormOpen(false)
  }

  const dupSections = sectionsFor(dupCycle, dupLevel)
  /** True while the copy would land in the exact slot of its original. */
  const dupSameSlot =
    !!dupTarget &&
    dupCycle === dupTarget.cycle &&
    dupLevel === dupTarget.level &&
    (dupSection || undefined) === dupTarget.section

  function openDuplicate(year: Year) {
    setDupTarget(year)
    setDupCycle(year.cycle)
    setDupLevel(year.level)
    setDupSection(year.section ?? "")
    setDupName(copyName(year.name))
    setDupNamed(false)
  }

  /** Keeps the name in step with the chosen slot until the user types their own. */
  function syncDupName(source: Year | null, c: Cycle, l: string, sec: string) {
    if (dupNamed || !source || !l) return
    const same = c === source.cycle && l === source.level && (sec || undefined) === source.section
    const base = yearName(l, sec || undefined)
    setDupName(same ? copyName(base) : base)
  }

  function pickDupCycle(next: Cycle) {
    const first = cycleDef(next).levels[0]?.name ?? ""
    setDupCycle(next)
    setDupLevel(first)
    setDupSection("")
    syncDupName(dupTarget, next, first, "")
  }

  function pickDupLevel(next: string) {
    setDupLevel(next)
    setDupSection("")
    syncDupName(dupTarget, dupCycle, next, "")
  }

  function pickDupSection(next: string) {
    setDupSection(next)
    syncDupName(dupTarget, dupCycle, dupLevel, next)
  }

  function submitDuplicate() {
    if (!dupTarget || !dupLevel) return
    if (dupSections.length > 0 && !dupSection) return
    const copy = duplicateYear(dupTarget, {
      name: dupName.trim(),
      cycle: dupCycle,
      level: dupLevel,
      section: dupSection || undefined,
      // Same slot → sits right after the original; elsewhere → its own slot.
      order: dupSameSlot ? undefined : yearOrder(dupCycle, dupLevel, dupSection || undefined),
    })
    show(`«${copy.name}» تعملت بموادّ «${dupTarget.name}»`)
    setDupTarget(null)
  }

  function confirmDelete() {
    if (!deleteTarget) return
    removeYear(deleteTarget.id)
    show("القسم تمسح")
    setDeleteTarget(null)
  }

  const isEmpty = years.length === 0
  const addButton = (
    <button
      type="button"
      onClick={() => openAdd()}
      className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
    >
      <Plus className="size-4" /> زيد قسم
    </button>
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="البرنامج"
        subtitle="إعدادي وثانوي وباك — كل قسم يجمع موادّو."
        action={!isEmpty ? addButton : undefined}
      />

      {isEmpty ? (
        <div className="rounded-lg border border-dashed border-border bg-surface">
          <EmptyState
            icon={Layers}
            title="ما فماش أقسام"
            description="ابدا بإنشاء قسم من البرنامج (مثال: سابعة أساسي، باك — رياضيات)."
            action={addButton}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {groups.map(({ cycle: def, years: cycleYears, levels: levelGroups }) => {
            const style = CYCLE_STYLE[def.key]
            const Icon = style.icon
            return (
              <section key={def.key} className="flex flex-col gap-4">
                <div className="flex items-center gap-3 border-b border-border pb-3">
                  <span className={`grid size-9 shrink-0 place-items-center rounded-md ${style.chip}`}>
                    <Icon className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-display text-[calc(17px*var(--ts))] font-bold leading-tight text-ink">
                      {def.label}
                    </h2>
                    <p className="mt-0.5 truncate text-[calc(12px*var(--ts))] text-ink-muted">{def.hint}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-neutral-100 px-2.5 py-1 text-[calc(12px*var(--ts))] font-medium tabular-nums text-ink-muted">
                    {cycleYears.length} قسم
                  </span>
                  <button
                    type="button"
                    onClick={() => openAdd(def.key)}
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[calc(13px*var(--ts))] font-medium text-brand-600 transition hover:bg-brand-50"
                  >
                    <Plus className="size-4" />
                    <span className="hidden sm:inline">قسم</span>
                  </button>
                </div>

                {levelGroups.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-5 text-sm text-ink-muted">
                    ما فماش أقسام في المرحلة هذي — زيد واحد.
                  </p>
                ) : (
                  <div className="flex flex-col gap-5">
                    {levelGroups.map((lg) => (
                      <div key={lg.level} className="flex flex-col gap-2.5">
                        {lg.sectioned && (
                          <p
                            dir="auto"
                            className="text-[calc(11px*var(--ts))] font-medium uppercase tracking-[.12em] text-accent2-600"
                          >
                            {lg.level}
                            <span className="ms-2 font-normal normal-case tracking-normal text-ink-muted">
                              {lg.years.length} شعبة
                            </span>
                          </p>
                        )}
                        <div className="grid gap-3 sm:grid-cols-2">
                          {lg.years.map((y) => (
                            <YearCard
                              key={y.id}
                              label={yearLabel(y)}
                              count={countFor(y)}
                              onOpen={() => navigate(y.id)}
                              onEdit={() => openEdit(y)}
                              onDuplicate={() => openDuplicate(y)}
                              onDelete={() => setDeleteTarget(y)}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}

      <FormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? "بدّل القسم" : "قسم جديد"}
        description={
          editing
            ? undefined
            : "اختار المرحلة، وبعد المستوى — والشعبة من الثانية ثانوي."
        }
        submitLabel={editing ? "سجّل" : "زيد"}
        onSubmit={submit}
      >
        <div>
          <span className="mb-2 block text-sm font-medium text-ink-subtle">المرحلة</span>
          <div className="grid grid-cols-3 gap-2">
            {CYCLES.map((c) => {
              const Icon = CYCLE_STYLE[c.key].icon
              const active = cycle === c.key
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => pickCycle(c.key)}
                  className={
                    "inline-flex h-11 items-center justify-center gap-2 rounded-md border px-2 text-sm font-medium transition " +
                    (active
                      ? "border-transparent bg-grad text-ink-inverted shadow-brand"
                      : "border-border-strong bg-surface text-ink-subtle hover:border-brand-200 hover:text-brand-600")
                  }
                >
                  <Icon className="size-4 shrink-0" /> {c.label}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium text-ink-subtle">المستوى</span>
          <div className="flex flex-wrap gap-2">
            {levels.map((l) => (
              <Choice key={l.name} active={level === l.name} onClick={() => pickLevel(l.name)}>
                <span dir="auto">{l.name}</span>
              </Choice>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium text-ink-subtle">
            Section{" "}
            <span className="font-normal text-ink-muted">
              {sections.length > 0 ? "(إجباري)" : "(ما فماش في المستوى هذا)"}
            </span>
          </span>
          {sections.length === 0 ? (
            <p className="rounded-md border border-dashed border-border bg-surface-muted px-3 py-3 text-sm text-ink-muted">
              {level || "المستوى هذا"} ما عندوش شعب — القسم يحمل المستوى برك.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {sections.map((s) => (
                <Choice key={s} active={section === s} onClick={() => setSection(s)}>
                  <span dir="auto">{s}</span>
                </Choice>
              ))}
            </div>
          )}
        </div>

        <p className="rounded-md border border-border bg-surface-muted px-3 py-2.5 text-sm text-ink-subtle">
          اسم القسم:{" "}
          <span dir="auto" className="font-display font-bold text-ink">
            {level ? yearName(level, section || undefined) : "—"}
          </span>
        </p>
      </FormSheet>

      <DuplicateSheet
        open={dupTarget !== null}
        onOpenChange={(o) => !o && setDupTarget(null)}
        title="اعمل نسخة من القسم"
        nameLabel="اسم النسخة"
        name={dupName}
        onNameChange={(v) => {
          setDupName(v)
          setDupNamed(true)
        }}
        note="موادّ القسم الكل — والمحتوى متاعهم — ينتسخو."
        blocker={
          dupSections.length > 0 && !dupSection
            ? "اختار الشعبة اللي باش تنسخ ليها."
            : undefined
        }
        onSubmit={submitDuplicate}
      >
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface-muted p-3.5">
          <p className="text-[calc(11px*var(--ts))] font-medium uppercase tracking-[.12em] text-accent2-600">
            Destination
          </p>

          <div>
            <span className="mb-2 block text-sm font-medium text-ink-subtle">المرحلة</span>
            <div className="grid grid-cols-3 gap-2">
              {CYCLES.map((c) => {
                const Icon = CYCLE_STYLE[c.key].icon
                const active = dupCycle === c.key
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => pickDupCycle(c.key)}
                    className={
                      "inline-flex h-11 items-center justify-center gap-2 rounded-md border px-2 text-sm font-medium transition " +
                      (active
                        ? "border-transparent bg-grad text-ink-inverted shadow-brand"
                        : "border-border-strong bg-surface text-ink-subtle hover:border-brand-200 hover:text-brand-600")
                    }
                  >
                    <Icon className="size-4 shrink-0" /> {c.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-ink-subtle">المستوى</span>
            <div className="flex flex-wrap gap-2">
              {cycleDef(dupCycle).levels.map((l) => (
                <Choice
                  key={l.name}
                  active={dupLevel === l.name}
                  onClick={() => pickDupLevel(l.name)}
                >
                  <span dir="auto">{l.name}</span>
                </Choice>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-ink-subtle">الشعبة</span>
            {dupSections.length === 0 ? (
              <p className="rounded-md border border-dashed border-border bg-surface px-3 py-2.5 text-sm text-ink-muted">
                {dupLevel || "المستوى هذا"} ما عندوش شعب.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {dupSections.map((s) => (
                  <Choice key={s} active={dupSection === s} onClick={() => pickDupSection(s)}>
                    <span dir="auto">{s}</span>
                  </Choice>
                ))}
              </div>
            )}
          </div>
        </div>
      </DuplicateSheet>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="تحبّ تمسح القسم هذا؟"
        description={
          deleteTarget
            ? `«${deleteTarget.name}» و${countFor(deleteTarget)} مادّة متاعو باش يتمسحو. العملية هاذي نهائية.`
            : undefined
        }
        onConfirm={confirmDelete}
      />

      {toast}
    </div>
  )
}
