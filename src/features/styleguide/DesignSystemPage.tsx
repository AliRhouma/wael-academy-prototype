import { useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowRight,
  Bell,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Clock,
  Droplet,
  Inbox,
  Layers,
  LayoutGrid,
  List,
  Moon,
  Palette,
  PanelRight,
  Pencil,
  Plus,
  Search,
  Smartphone,
  Sparkles,
  Square,
  Sun,
  Table,
  Tag,
  Trash2,
  Type,
  UserPlus,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useTheme } from "@/app/providers"
import { useIsMobile } from "@/lib/hooks"
import { fakeDelay } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/kit/PageHeader"
import { Badge } from "@/components/kit/Badge"
import { Avatar } from "@/components/kit/Avatar"
import { EmptyState } from "@/components/kit/EmptyState"
import { DataTable, type Column } from "@/components/kit/DataTable"
import { ConfirmDialog } from "@/components/kit/ConfirmDialog"
import { FormSheet } from "@/components/kit/FormSheet"
import type { OverflowAction } from "@/components/kit/OverflowMenu"

/* ------------------------------------------------------------------ helpers */

function Section({
  id,
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  id: string
  icon: LucideIcon
  title: string
  subtitle?: string
  children: ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-6">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="grid size-7 place-items-center rounded-[9px] bg-brand-50 text-brand-600">
          <Icon className="size-3.5" />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold leading-tight text-ink">{title}</h2>
          {subtitle && <p className="text-[calc(12px*var(--ts))] text-ink-muted">{subtitle}</p>}
        </div>
      </div>
      <div className="rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-6">{children}</div>
    </section>
  )
}

function Swatch({ cls, label }: { cls: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={cn("size-12 rounded-md border border-border shadow-xs", cls)} />
      <span className="text-[calc(10px*var(--ts))] text-ink-muted">{label}</span>
    </div>
  )
}

function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[calc(11px*var(--ts))] font-medium text-ink-muted">{label}</span>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ data */

const BRAND = [
  "bg-brand-50", "bg-brand-100", "bg-brand-200", "bg-brand-300", "bg-brand-400",
  "bg-brand-500", "bg-brand-600", "bg-brand-700", "bg-brand-800", "bg-brand-900",
]
const NEUTRAL = [
  "bg-neutral-50", "bg-neutral-100", "bg-neutral-200", "bg-neutral-300", "bg-neutral-400",
  "bg-neutral-500", "bg-neutral-600", "bg-neutral-700", "bg-neutral-800", "bg-neutral-900",
]
const SUPPORT = [
  { cls: "bg-emerald-500", label: "emerald" },
  { cls: "bg-navy-500", label: "navy" },
  { cls: "bg-accent2-500", label: "gold" },
  { cls: "bg-accent2-100", label: "cream" },
]
const STATUS = [
  { cls: "bg-success-500", label: "success" },
  { cls: "bg-warning-500", label: "warning" },
  { cls: "bg-danger-500", label: "danger" },
  { cls: "bg-info-500", label: "info" },
]
const SURFACES = [
  { cls: "bg-surface", label: "surface" },
  { cls: "bg-surface-muted", label: "muted" },
  { cls: "bg-surface-cream", label: "cream" },
  { cls: "bg-surface-subtle", label: "subtle" },
]
const SHADOWS = [
  { cls: "shadow-xs", label: "xs" },
  { cls: "shadow-sm", label: "sm" },
  { cls: "shadow-md", label: "md" },
  { cls: "shadow-lg", label: "lg" },
  { cls: "shadow-xl", label: "xl" },
]
const RADII = [
  { cls: "rounded-sm", label: "sm · chips" },
  { cls: "rounded-md", label: "md · buttons" },
  { cls: "rounded-lg", label: "lg · cards" },
  { cls: "rounded-xl", label: "xl · shell" },
  { cls: "rounded-full", label: "full · pills" },
]

const CHIP: Record<string, string> = {
  teal: "border-s-brand-500 bg-brand-50 [--ct:var(--brand-700)]",
  green: "border-s-emerald-500 bg-emerald-50 [--ct:var(--emerald-700)]",
  gold: "border-s-accent2-500 bg-accent2-50 [--ct:var(--accent2-700)]",
  red: "border-s-danger-500 bg-danger-50 [--ct:var(--danger-700)]",
  navy: "border-s-navy-500 bg-navy-50 [--ct:var(--navy-700)]",
}

const PRINCIPLES = [
  "الدفا في الحياديات، موش في اللمسات — قماشة مريمية، حبر أخضر-كحل، وظلال خضر غابة (عمرها ما تكون كحلة).",
  "التدرّج هو الـ ADN متاع العلامة، يتستعمل بالقطرة: الحركة الرئيسية، التنقّل النشط، الأفاتار.",
  "كل لمسة عندها معنى واحد — ذهبي = مكافأة، أحمر = تنبيه، زمرّدي = إيجابي، كحلي = معلومة.",
  "خطّ واحد للكل — Playpen Sans Arabic؛ العناوين 700 والمتن 400/500.",
  "ناعم، مفتوح، مدوّر — انحناءات كريمة، هوامش مريحة وارتفاع خفيف.",
  "الحركة طلوع ناعم؛ تتوقّف تحت prefers-reduced-motion.",
]

type DemoStudent = { id: string; name: string; group: string; status: "فعّال" | "متأخّر" | "سالا" }
const DEMO_ROWS: DemoStudent[] = [
  { id: "1", name: "محمد بن صالح", group: "باك علوم", status: "فعّال" },
  { id: "2", name: "إيناس الطرابلسي", group: "سنة باك", status: "متأخّر" },
  { id: "3", name: "يوسف الغربي", group: "إعدادي A2", status: "سالا" },
]

/* ------------------------------------------------------------------ page */

const btnSecondary =
  "inline-flex items-center gap-2 rounded-md border border-border-strong bg-surface px-4 h-10 font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"

export default function DesignSystemPage() {
  const { theme, toggle } = useTheme()
  const isMobile = useIsMobile()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [switchOn, setSwitchOn] = useState(true)
  const [seg, setSeg] = useState("grille")

  async function handleConfirm() {
    setConfirmLoading(true)
    await fakeDelay(700)
    setConfirmLoading(false)
    setConfirmOpen(false)
    toast.success("العنصر تمسح")
  }

  async function handleSave() {
    setSaving(true)
    await fakeDelay(700)
    setSaving(false)
    setSheetOpen(false)
    toast.success("التبديلات تسجّلت")
  }

  const columns: Column<DemoStudent>[] = [
    {
      key: "name",
      header: "تلميذ",
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.name} size="sm" />
          <span className="font-medium text-ink">{r.name}</span>
        </div>
      ),
    },
    { key: "group", header: "فوج" },
    {
      key: "status",
      header: "الحالة",
      render: (r) => (
        <Badge tone={r.status === "فعّال" ? "success" : r.status === "متأخّر" ? "danger" : "neutral"} dot>
          {r.status}
        </Badge>
      ),
    },
  ]

  const rowActions = (r: DemoStudent): OverflowAction[] => [
    { label: "بدّل", icon: Pencil, onClick: () => toast(`بدّل ${r.name}`) },
    { label: "امسح", icon: Trash2, tone: "danger", onClick: () => toast.success(`${r.name} تمسح`) },
  ]

  const toc: [string, string][] = [
    ["principes", "المبادئ"], ["couleurs", "الألوان"], ["degrade", "التدرّج"],
    ["typographie", "الخطّ"], ["elevation", "الارتفاع"], ["rayons", "الانحناءات"],
    ["boutons", "الأزرار"], ["badges", "الشارات والرقائق"], ["avatars", "الأفاتارات"],
    ["cartes", "البطاقات"], ["champs", "الحقول"], ["vide", "حالة فارغة"],
    ["tableau", "الجدول"], ["overlays", "الطبقات"], ["responsive", "متجاوب"],
  ]

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto w-full max-w-[1000px] px-4 py-8 sm:px-6 sm:py-10">
        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          <Link
            to="/courses"
            aria-label="ارجع"
            className="mt-1 grid size-9 shrink-0 place-items-center rounded-md border border-border bg-surface-muted text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"
          >
            <ArrowRight className="size-4" />
          </Link>
          <PageHeader
            className="flex-1"
            title="نظام التصميم"
            subtitle="وائل أكاديمي — النظام الناعم: قواعد، توكنات ومكوّنات تتعاود."
            action={
              <button
                type="button"
                onClick={toggle}
                className={btnSecondary}
                aria-label={theme === "dark" ? "ثيم فاتح" : "ثيم غامق"}
              >
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                {theme === "dark" ? "فاتح" : "غامق"}
              </button>
            }
          />
        </div>

        {/* Table of contents */}
        <nav className="mb-8 flex flex-wrap gap-1.5">
          {toc.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className="rounded-full border border-border bg-surface px-3 py-1 text-[calc(12px*var(--ts))] font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-8">
          {/* Principles */}
          <Section id="principes" icon={Sparkles} title="المبادئ" subtitle="هذا اللي يخلّي المنتج ناعم ومتماشي مع العلامة.">
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {PRINCIPLES.map((p, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-ink-subtle">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand-500" />
                  {p}
                </li>
              ))}
            </ul>
          </Section>

          {/* Colours */}
          <Section id="couleurs" icon={Palette} title="الألوان" subtitle="أدوار، موش زوقة.">
            <div className="flex flex-col gap-5">
              <Tile label="العلامة (تركوازي) — العمود الفقري">
                {BRAND.map((c) => (
                  <Swatch key={c} cls={c} label={c.replace("bg-brand-", "")} />
                ))}
              </Tile>
              <Tile label="خضر مساندة، ذهبي وكريمي">
                {SUPPORT.map((s) => (
                  <Swatch key={s.label} cls={s.cls} label={s.label} />
                ))}
              </Tile>
              <Tile label="الحالة">
                {STATUS.map((s) => (
                  <Swatch key={s.label} cls={s.cls} label={s.label} />
                ))}
              </Tile>
              <Tile label="الحياديات (رمادي دافي، مشوب بالأخضر)">
                {NEUTRAL.map((c) => (
                  <Swatch key={c} cls={c} label={c.replace("bg-neutral-", "")} />
                ))}
              </Tile>
              <Tile label="الأسطح">
                {SURFACES.map((s) => (
                  <Swatch key={s.label} cls={s.cls} label={s.label} />
                ))}
              </Tile>
            </div>
          </Section>

          {/* Gradient */}
          <Section id="degrade" icon={Droplet} title="التدرّج" subtitle="الـ ADN متاع العلامة — يتصرف على كم سطح في كل شاشة.">
            <div className="flex flex-col gap-3">
              <div className="grid h-24 place-items-center rounded-lg bg-grad text-ink-inverted shadow-brand">
                <span className="font-display text-lg font-bold">bg-grad</span>
              </div>
              <p className="text-[calc(12px*var(--ts))] text-ink-muted">
                الحركة الرئيسية، التنقّل النشط، الأفاتار، العلامة. عمرو ما يكون خلفية لوحة ولا وراء نصّ صغير.
              </p>
            </div>
          </Section>

          {/* Typography */}
          <Section id="typographie" icon={Type} title="الخطّ" subtitle="خطّ واحد، أدوار واضحة.">
            <div className="flex flex-col gap-4">
              <div className="border-b border-border pb-4">
                <p className="mb-2 text-[calc(11px*var(--ts))] font-medium text-ink-muted">Playpen Sans Arabic — العرض (700)</p>
                <p className="font-display text-3xl font-bold text-ink">أهلا وائل أكاديمي</p>
                <p className="font-display text-xl font-bold text-ink">عنوان قسم</p>
              </div>
              <div>
                <p className="mb-2 text-[calc(11px*var(--ts))] font-medium text-ink-muted">Playpen Sans Arabic — الواجهة</p>
                <p className="text-base text-ink">نصّ المتن الرئيسي بـ 500.</p>
                <p className="text-sm text-ink-subtle">نصّ ثانوي — text-ink-subtle.</p>
                <p className="text-xs text-ink-muted">التسمية / النصّ النائب — text-ink-muted.</p>
              </div>
            </div>
          </Section>

          {/* Elevation */}
          <Section id="elevation" icon={Layers} title="الارتفاع" subtitle="ظلال ناعمة مشوبة بالأخضر — عمرها ما تكون كحلة.">
            <div className="flex flex-wrap gap-5">
              {SHADOWS.map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-2">
                  <div className={cn("grid size-16 place-items-center rounded-lg bg-surface", s.cls)}>
                    <span className="text-[calc(11px*var(--ts))] font-medium text-ink-subtle">{s.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Radii */}
          <Section id="rayons" icon={Square} title="الانحناءات" subtitle="زوايا ناعمة وكريمة.">
            <div className="flex flex-wrap gap-5">
              {RADII.map((r) => (
                <div key={r.label} className="flex flex-col items-center gap-2">
                  <div className={cn("size-16 border border-border bg-brand-50", r.cls)} />
                  <span className="text-[calc(10px*var(--ts))] text-ink-muted">{r.label}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Buttons */}
          <Section id="boutons" icon={Plus} title="الأزرار" subtitle="التدرّج للحركة الرئيسية؛ والباقي يقعد هادي.">
            <div className="flex flex-col gap-5">
              <Tile label="الأشكال">
                <button className="inline-flex h-10 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105">
                  <Plus className="size-4" /> زيد
                </button>
                <button className={btnSecondary}>بدّل</button>
                <button className="inline-flex items-center gap-2 rounded-md px-3 py-2 font-medium text-danger-600 transition hover:bg-danger-50">
                  <Trash2 className="size-4" /> امسح
                </button>
                <button className="grid size-9 place-items-center rounded-md text-ink-muted transition hover:bg-surface-muted hover:text-ink">
                  <Bell className="size-4" />
                </button>
              </Tile>
              <Tile label="المعدّلات (الخطوة)">
                <button className="grid size-[30px] place-items-center rounded-[9px] border border-border bg-surface-muted text-ink-subtle transition hover:border-brand-200 hover:text-brand-600">
                  <ChevronRight className="size-3.5" />
                </button>
                <button className="grid size-[30px] place-items-center rounded-[9px] bg-grad text-ink-inverted shadow-brand">
                  <ChevronLeft className="size-3.5" />
                </button>
              </Tile>
              <Tile label="زرّ الحدث الرئيسي">
                <button className="group relative flex w-full max-w-xs items-center gap-3 overflow-hidden rounded-lg bg-grad p-4 text-start text-ink-inverted shadow-brand transition-transform duration-200 motion-safe:hover:-translate-y-0.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-white/20">
                    <Plus className="size-[18px]" />
                  </span>
                  <span>
                    <b className="block font-display text-[calc(14px*var(--ts))] font-bold">زيد حصّة</b>
                    <span className="text-[calc(11px*var(--ts))] text-white/80">درس، إصلاح ولا تصدير</span>
                  </span>
                </button>
              </Tile>
            </div>
          </Section>

          {/* Badges & chips */}
          <Section id="badges" icon={Tag} title="الشارات والرقائق" subtitle="شارة الكيت (§2) + رقائق الحصّة.">
            <div className="flex flex-col gap-5">
              <Tile label="الشارات (الكيت)">
                <Badge tone="brand">العلامة</Badge>
                <Badge tone="success" dot>فعّال</Badge>
                <Badge tone="warning">للتسليم</Badge>
                <Badge tone="danger" dot>اليوم</Badge>
                <Badge tone="info">معلومة</Badge>
                <Badge tone="neutral">سالا</Badge>
              </Tile>
              <Tile label="رقائق الحصّة">
                {(["teal", "green", "gold", "red", "navy"] as const).map((v) => (
                  <div
                    key={v}
                    className={cn("w-44 rounded-sm border-s-4 p-[9px_10px_8px] shadow-sm", CHIP[v])}
                  >
                    <span className="font-display text-[calc(10.5px*var(--ts))] font-bold leading-[1.45] text-[color:var(--ct)]">
                      التشريح — القلب
                    </span>
                    <span className="mt-1.5 flex items-center gap-1.5 text-[calc(9.5px*var(--ts))] text-ink-muted">
                      <Clock className="size-2.5 opacity-75" /> 09:00 – 10:30
                    </span>
                  </div>
                ))}
              </Tile>
            </div>
          </Section>

          {/* Avatars */}
          <Section id="avatars" icon={Users} title="الأفاتارات ورقائق الأيقونات" subtitle="أحرف أولى ملوّنة بشكل ثابت.">
            <div className="flex flex-col gap-5">
              <Tile label="الأفاتارات (الكيت)">
                <Avatar name="محمد بن صالح" size="lg" />
                <Avatar name="إيناس الطرابلسي" />
                <Avatar name="يوسف الغربي" />
                <Avatar name="سارة الخليفي" size="sm" />
                <div className="grid size-9 place-items-center rounded-full bg-grad font-display text-sm font-bold text-ink-inverted shadow-[0_0_0_2.5px_var(--surface),0_0_0_4px_var(--brand-100)]">
                  W
                </div>
              </Tile>
              <Tile label="رقائق الأيقونات">
                <span className="grid size-7 place-items-center rounded-[9px] bg-brand-50 text-brand-600">
                  <Bell className="size-3.5" />
                </span>
                <span className="grid size-7 place-items-center rounded-[9px] bg-accent2-50 text-accent2-500">
                  <Pencil className="size-3.5" />
                </span>
              </Tile>
            </div>
          </Section>

          {/* Cards */}
          <Section id="cartes" icon={LayoutGrid} title="البطاقات" subtitle="محتوى، إحصائية، ترويج.">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-surface p-[18px] shadow-md">
                <p className="font-display text-[calc(14px*var(--ts))] font-bold text-ink">بطاقة محتوى</p>
                <p className="mt-1 text-[calc(12px*var(--ts))] text-ink-muted">أبيض، حافة هادية وظلّ ناعم.</p>
              </div>
              <div className="relative overflow-hidden rounded-md bg-surface p-[14px_12px] shadow-md">
                <span className="pointer-events-none absolute -end-3.5 -bottom-3.5 size-[52px] rounded-full border-[5px] border-accent2-50" />
                <b className="block font-display text-[calc(14.5px*var(--ts))] font-bold text-ink">جوان</b>
                <span className="text-[calc(11px*var(--ts))] text-ink-muted">96 ساعة درس</span>
              </div>
              <div className="rounded-md bg-grad p-[14px_12px] text-ink-inverted shadow-brand">
                <b className="block font-display text-[calc(14.5px*var(--ts))] font-bold">فعّال</b>
                <span className="text-[calc(11px*var(--ts))] text-white/80">شكل بالتدرّج</span>
              </div>
            </div>
          </Section>

          {/* Inputs */}
          <Section id="champs" icon={Search} title="الحقول" subtitle="بحث، حقل، اختيار، مفتاح، مقاطع.">
            <div className="flex flex-col gap-5">
              <Tile label="بحث">
                <div className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-border bg-surface-muted p-[5px_5px_5px_14px] transition focus-within:border-brand-200 focus-within:ring-4 focus-within:ring-brand-500/10">
                  <input
                    placeholder="لوّج على تلميذ…"
                    className="min-w-0 flex-1 bg-transparent text-[calc(13px*var(--ts))] font-normal text-ink placeholder:text-ink-muted focus:outline-none"
                  />
                  <button className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-grad text-ink-inverted">
                    <Search className="size-[15px]" />
                  </button>
                </div>
              </Tile>
              <Tile label="حقل واختيار">
                <label className="block w-full max-w-xs">
                  <span className="mb-1.5 block text-sm font-medium text-ink-subtle">العنوان</span>
                  <input className="h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20" />
                </label>
                <button className="flex h-11 items-center gap-5 self-end rounded-md border border-border-strong bg-surface px-3 text-[calc(12.5px*var(--ts))] font-medium text-ink-subtle">
                  الشهر <ChevronDown className="size-3" />
                </button>
              </Tile>
              <Tile label="المفاتيح والمقاطع">
                <button
                  role="switch"
                  aria-checked={switchOn}
                  onClick={() => setSwitchOn((v) => !v)}
                  className={cn("relative h-6 w-11 rounded-full transition", switchOn ? "bg-brand-500" : "bg-neutral-300")}
                >
                  <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition", switchOn ? "start-[22px]" : "start-0.5")} />
                </button>
                <div className="inline-flex gap-1 rounded-[11px] border border-border bg-surface-muted p-1">
                  {([["grille", LayoutGrid], ["liste", List]] as const).map(([id, Icon]) => (
                    <button
                      key={id}
                      onClick={() => setSeg(id)}
                      aria-pressed={seg === id}
                      className={cn(
                        "grid h-[26px] w-8 place-items-center rounded-[7px] transition",
                        seg === id ? "bg-surface text-brand-600 shadow-sm" : "text-ink-muted",
                      )}
                    >
                      <Icon className="size-[15px]" />
                    </button>
                  ))}
                </div>
              </Tile>
            </div>
          </Section>

          {/* Empty state */}
          <Section id="vide" icon={Inbox} title="حالة فارغة" subtitle="رقاقة حيادية + نصّ هادي (الكيت).">
            <div className="rounded-lg border border-dashed border-border">
              <EmptyState
                icon={Inbox}
                title="ما فماش حصص الشهر هذا"
                description="زيد أوّل حصّة باش تعمّر الروزنامة."
                action={
                  <button className="inline-flex h-10 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105">
                    <Plus className="size-4" /> زيد
                  </button>
                }
              />
            </div>
          </Section>

          {/* Data table */}
          <Section id="tableau" icon={Table} title="جدول معطيات" subtitle="مكوّن عام مصنّف، مع حالتَي التحميل والفراغ (الكيت).">
            <div className="flex flex-col gap-5">
              <Tile label="بمعطيات">
                <div className="w-full">
                  <DataTable
                    columns={columns}
                    rows={DEMO_ROWS}
                    rowKey={(r) => r.id}
                    rowActions={rowActions}
                    onRowClick={(r) => toast(r.name)}
                  />
                </div>
              </Tile>
              <div className="grid gap-5 lg:grid-cols-2">
                <Tile label="قاعد يشارجي">
                  <div className="w-full">
                    <DataTable columns={columns} rows={[]} rowKey={(r) => r.id} loading loadingRows={3} />
                  </div>
                </Tile>
                <Tile label="فارغ">
                  <div className="w-full">
                    <DataTable columns={columns} rows={[]} rowKey={(r) => r.id} />
                  </div>
                </Tile>
              </div>
            </div>
          </Section>

          {/* Overlays */}
          <Section id="overlays" icon={PanelRight} title="الطبقات" subtitle="شيت تحتاني على الموبايل، ديالوڤ على المكتب — جرّبهم.">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setConfirmOpen(true)}
                className="inline-flex h-11 items-center gap-2 rounded-md bg-danger-500 px-4 font-medium text-danger-foreground shadow-sm transition hover:bg-danger-600"
              >
                <Trash2 className="size-4" /> Confirmation
              </button>
              <button
                onClick={() => setSheetOpen(true)}
                className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105"
              >
                <UserPlus className="size-4" /> Formulaire
              </button>
            </div>
          </Section>

          {/* Responsive */}
          <Section id="responsive" icon={Smartphone} title="متجاوب وجاهز كتطبيق" subtitle="قاعدة وحدة، الموبايل أوّلا. صغّر النافذة تحت 768px.">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-ink-muted">النمط الحالي:</span>
                <Badge tone={isMobile ? "brand" : "neutral"} dot>
                  {isMobile ? "موبايل" : "مكتب"}
                </Badge>
              </div>
              <ul className="grid gap-2 text-sm text-ink-subtle sm:grid-cols-2">
                <li>الجداول ← بطاقات مركّبة تحت md.</li>
                <li>النوافذ والفورمات ← شيتات تحتانية تحت md.</li>
                <li>التنقّل ← بار تابات في الأسفل على الموبايل.</li>
                <li>حركات السطر وراء قائمة «…» (عمرها ما تكون على الهوفر).</li>
                <li>أهداف اللمس ≥ 44px.</li>
                <li>المناطق الآمنة (النوتش / البار) محترمة.</li>
              </ul>
              <p className="text-[calc(12px*var(--ts))] text-ink-muted">
                الجدول والطبقات اللي فوق يتبدّلو وحدهم — قائمة «…» متاع كل سطر تخدم باللمس.
              </p>
            </div>
          </Section>
        </div>

        <p className="mt-10 text-center text-[calc(12px*var(--ts))] text-ink-muted">
          المصدر: <code className="text-ink-subtle">.claude/skills/wael-design-system-soft</code> · التوكنات في{" "}
          <code className="text-ink-subtle">src/styles/index.css</code>
        </p>
      </div>

      {/* Interactive demos */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="تحبّ تمسح العنصر هذا؟"
        description="العملية هذي ما تترجّعش في تطبيق حقيقي."
        onConfirm={handleConfirm}
        loading={confirmLoading}
      />
      <FormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="تلميذ جديد"
        description="مثال فورم داخل شيت."
        onSubmit={handleSave}
        submitting={saving}
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">الاسم الكامل</span>
          <input className="h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20" placeholder="مثال: إيناس الطرابلسي" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">فوج</span>
          <input className="h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20" placeholder="مثال: باك علوم" />
        </label>
      </FormSheet>
    </div>
  )
}
