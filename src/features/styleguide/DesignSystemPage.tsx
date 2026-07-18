import { useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
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
          {subtitle && <p className="text-[12px] text-ink-muted">{subtitle}</p>}
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
      <span className="text-[10px] text-ink-muted">{label}</span>
    </div>
  )
}

function Tile({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[11px] font-medium text-ink-muted">{label}</span>
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
  teal: "border-l-brand-500 bg-brand-50 [--ct:var(--brand-700)]",
  green: "border-l-emerald-500 bg-emerald-50 [--ct:var(--emerald-700)]",
  gold: "border-l-accent2-500 bg-accent2-50 [--ct:var(--accent2-700)]",
  red: "border-l-danger-500 bg-danger-50 [--ct:var(--danger-700)]",
  navy: "border-l-navy-500 bg-navy-50 [--ct:var(--navy-700)]",
}

const PRINCIPLES = [
  "Chaleur dans les neutres, pas dans les accents — canevas sage, encre vert-noir, ombres vert-forêt (jamais noires).",
  "Le dégradé est l’ADN de la marque, utilisé avec parcimonie : action principale, nav active, avatar.",
  "Chaque accent a un seul sens — or = récompense, rouge = alerte, émeraude = positif, navy = information.",
  "Cause en display uniquement, toujours en 700 ; Rubik pour toute l’interface.",
  "Doux, aéré, arrondi — rayons généreux, marges confortables, élévation légère.",
  "Le mouvement est une montée douce ; désactivé sous prefers-reduced-motion.",
]

type DemoStudent = { id: string; name: string; group: string; status: "Actif" | "En retard" | "Terminé" }
const DEMO_ROWS: DemoStudent[] = [
  { id: "1", name: "Mohamed Ben Salah", group: "Bac Sciences", status: "Actif" },
  { id: "2", name: "Ines Trabelsi", group: "Terminale", status: "En retard" },
  { id: "3", name: "Youssef Gharbi", group: "Collège A2", status: "Terminé" },
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
    toast.success("Élément supprimé")
  }

  async function handleSave() {
    setSaving(true)
    await fakeDelay(700)
    setSaving(false)
    setSheetOpen(false)
    toast.success("Modifications enregistrées")
  }

  const columns: Column<DemoStudent>[] = [
    {
      key: "name",
      header: "Élève",
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar name={r.name} size="sm" />
          <span className="font-medium text-ink">{r.name}</span>
        </div>
      ),
    },
    { key: "group", header: "Groupe" },
    {
      key: "status",
      header: "Statut",
      render: (r) => (
        <Badge tone={r.status === "Actif" ? "success" : r.status === "En retard" ? "danger" : "neutral"} dot>
          {r.status}
        </Badge>
      ),
    },
  ]

  const rowActions = (r: DemoStudent): OverflowAction[] => [
    { label: "Modifier", icon: Pencil, onClick: () => toast(`Modifier ${r.name}`) },
    { label: "Supprimer", icon: Trash2, tone: "danger", onClick: () => toast.success(`${r.name} supprimé`) },
  ]

  const toc: [string, string][] = [
    ["principes", "Principes"], ["couleurs", "Couleurs"], ["degrade", "Dégradé"],
    ["typographie", "Typographie"], ["elevation", "Élévation"], ["rayons", "Rayons"],
    ["boutons", "Boutons"], ["badges", "Badges & chips"], ["avatars", "Avatars"],
    ["cartes", "Cartes"], ["champs", "Champs"], ["vide", "État vide"],
    ["tableau", "Tableau"], ["overlays", "Superpositions"], ["responsive", "Responsive"],
  ]

  return (
    <div className="min-h-screen bg-canvas">
      <div className="mx-auto w-full max-w-[1000px] px-4 py-8 sm:px-6 sm:py-10">
        {/* Header */}
        <div className="mb-6 flex items-start gap-4">
          <Link
            to="/courses"
            aria-label="Retour"
            className="mt-1 grid size-9 shrink-0 place-items-center rounded-md border border-border bg-surface-muted text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <PageHeader
            className="flex-1"
            title="Design System"
            subtitle="Wael Academy — le système soft : règles, jetons et composants réutilisables."
            action={
              <button
                type="button"
                onClick={toggle}
                className={btnSecondary}
                aria-label={theme === "dark" ? "Thème clair" : "Thème sombre"}
              >
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                {theme === "dark" ? "Clair" : "Sombre"}
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
              className="rounded-full border border-border bg-surface px-3 py-1 text-[12px] font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-8">
          {/* Principles */}
          <Section id="principes" icon={Sparkles} title="Principes" subtitle="Ce qui garde le produit doux et on-brand.">
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
          <Section id="couleurs" icon={Palette} title="Couleurs" subtitle="Des rôles, pas de la décoration.">
            <div className="flex flex-col gap-5">
              <Tile label="Brand (teal) — la colonne vertébrale">
                {BRAND.map((c) => (
                  <Swatch key={c} cls={c} label={c.replace("bg-brand-", "")} />
                ))}
              </Tile>
              <Tile label="Verts d’appui, or & crème">
                {SUPPORT.map((s) => (
                  <Swatch key={s.label} cls={s.cls} label={s.label} />
                ))}
              </Tile>
              <Tile label="Statut">
                {STATUS.map((s) => (
                  <Swatch key={s.label} cls={s.cls} label={s.label} />
                ))}
              </Tile>
              <Tile label="Neutres (gris chauds, vert-teintés)">
                {NEUTRAL.map((c) => (
                  <Swatch key={c} cls={c} label={c.replace("bg-neutral-", "")} />
                ))}
              </Tile>
              <Tile label="Surfaces">
                {SURFACES.map((s) => (
                  <Swatch key={s.label} cls={s.cls} label={s.label} />
                ))}
              </Tile>
            </div>
          </Section>

          {/* Gradient */}
          <Section id="degrade" icon={Droplet} title="Dégradé" subtitle="L’ADN de la marque — dépensé sur quelques surfaces par vue.">
            <div className="flex flex-col gap-3">
              <div className="grid h-24 place-items-center rounded-lg bg-grad text-ink-inverted shadow-brand">
                <span className="font-display text-lg font-bold">bg-grad</span>
              </div>
              <p className="text-[12px] text-ink-muted">
                Action principale, nav active, avatar, marque. Jamais en fond de panneau ni derrière du petit texte.
              </p>
            </div>
          </Section>

          {/* Typography */}
          <Section id="typographie" icon={Type} title="Typographie" subtitle="Deux polices, rôles stricts.">
            <div className="flex flex-col gap-4">
              <div className="border-b border-border pb-4">
                <p className="mb-2 text-[11px] font-medium text-ink-muted">Cause — display (700 uniquement)</p>
                <p className="font-display text-3xl font-bold text-ink">Bonjour, Wael Academy</p>
                <p className="font-display text-xl font-bold text-ink">Titre de section</p>
              </div>
              <div>
                <p className="mb-2 text-[11px] font-medium text-ink-muted">Rubik — interface</p>
                <p className="text-base text-ink">Corps de texte principal en Rubik 500.</p>
                <p className="text-sm text-ink-subtle">Texte secondaire — text-ink-subtle.</p>
                <p className="text-xs text-ink-muted">Libellé / placeholder — text-ink-muted.</p>
              </div>
            </div>
          </Section>

          {/* Elevation */}
          <Section id="elevation" icon={Layers} title="Élévation" subtitle="Ombres douces, vert-teintées — jamais noires.">
            <div className="flex flex-wrap gap-5">
              {SHADOWS.map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-2">
                  <div className={cn("grid size-16 place-items-center rounded-lg bg-surface", s.cls)}>
                    <span className="text-[11px] font-medium text-ink-subtle">{s.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Radii */}
          <Section id="rayons" icon={Square} title="Rayons" subtitle="Coins doux et généreux.">
            <div className="flex flex-wrap gap-5">
              {RADII.map((r) => (
                <div key={r.label} className="flex flex-col items-center gap-2">
                  <div className={cn("size-16 border border-border bg-brand-50", r.cls)} />
                  <span className="text-[10px] text-ink-muted">{r.label}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Buttons */}
          <Section id="boutons" icon={Plus} title="Boutons" subtitle="Le dégradé pour l’action héro ; le reste reste discret.">
            <div className="flex flex-col gap-5">
              <Tile label="Variantes">
                <button className="inline-flex h-10 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105">
                  <Plus className="size-4" /> Ajouter
                </button>
                <button className={btnSecondary}>Modifier</button>
                <button className="inline-flex items-center gap-2 rounded-md px-3 py-2 font-medium text-danger-600 transition hover:bg-danger-50">
                  <Trash2 className="size-4" /> Supprimer
                </button>
                <button className="grid size-9 place-items-center rounded-md text-ink-muted transition hover:bg-surface-muted hover:text-ink">
                  <Bell className="size-4" />
                </button>
              </Tile>
              <Tile label="Steppers (nudge)">
                <button className="grid size-[30px] place-items-center rounded-[9px] border border-border bg-surface-muted text-ink-subtle transition hover:border-brand-200 hover:text-brand-600">
                  <ChevronLeft className="size-3.5" />
                </button>
                <button className="grid size-[30px] place-items-center rounded-[9px] bg-grad text-ink-inverted shadow-brand">
                  <ChevronRight className="size-3.5" />
                </button>
              </Tile>
              <Tile label="CTA héro">
                <button className="group relative flex w-full max-w-xs items-center gap-3 overflow-hidden rounded-lg bg-grad p-4 text-left text-ink-inverted shadow-brand transition-transform duration-200 motion-safe:hover:-translate-y-0.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-white/20">
                    <Plus className="size-[18px]" />
                  </span>
                  <span>
                    <b className="block font-display text-[14px] font-bold">Ajouter une séance</b>
                    <span className="text-[11px] text-white/80">Cours, correction ou export</span>
                  </span>
                </button>
              </Tile>
            </div>
          </Section>

          {/* Badges & chips */}
          <Section id="badges" icon={Tag} title="Badges & chips" subtitle="Badge kit (§2) + chips de séance.">
            <div className="flex flex-col gap-5">
              <Tile label="Badges (kit)">
                <Badge tone="brand">Brand</Badge>
                <Badge tone="success" dot>Actif</Badge>
                <Badge tone="warning">À rendre</Badge>
                <Badge tone="danger" dot>Aujourd’hui</Badge>
                <Badge tone="info">Info</Badge>
                <Badge tone="neutral">Terminé</Badge>
              </Tile>
              <Tile label="Chips de séance">
                {(["teal", "green", "gold", "red", "navy"] as const).map((v) => (
                  <div
                    key={v}
                    className={cn("w-44 rounded-sm border-l-4 p-[9px_10px_8px] shadow-sm", CHIP[v])}
                  >
                    <span className="font-display text-[10.5px] font-bold leading-[1.45] text-[color:var(--ct)]">
                      Anatomie — cœur
                    </span>
                    <span className="mt-1.5 flex items-center gap-1.5 text-[9.5px] text-ink-muted">
                      <Clock className="size-2.5 opacity-75" /> 09:00 – 10:30
                    </span>
                  </div>
                ))}
              </Tile>
            </div>
          </Section>

          {/* Avatars */}
          <Section id="avatars" icon={Users} title="Avatars & icon chips" subtitle="Initiales teintées déterministes.">
            <div className="flex flex-col gap-5">
              <Tile label="Avatars (kit)">
                <Avatar name="Mohamed Ben Salah" size="lg" />
                <Avatar name="Ines Trabelsi" />
                <Avatar name="Youssef Gharbi" />
                <Avatar name="Sarra Khelifi" size="sm" />
                <div className="grid size-9 place-items-center rounded-full bg-grad font-display text-sm font-bold text-ink-inverted shadow-[0_0_0_2.5px_var(--surface),0_0_0_4px_var(--brand-100)]">
                  W
                </div>
              </Tile>
              <Tile label="Icon chips">
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
          <Section id="cartes" icon={LayoutGrid} title="Cartes" subtitle="Contenu, statistique, promo.">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-surface p-[18px] shadow-md">
                <p className="font-display text-[14px] font-bold text-ink">Carte contenu</p>
                <p className="mt-1 text-[12px] text-ink-muted">Blanc, bord discret, ombre douce.</p>
              </div>
              <div className="relative overflow-hidden rounded-md bg-surface p-[14px_12px] shadow-md">
                <span className="pointer-events-none absolute -right-3.5 -bottom-3.5 size-[52px] rounded-full border-[5px] border-accent2-50" />
                <b className="block font-display text-[14.5px] font-bold text-ink">Juin</b>
                <span className="text-[11px] text-ink-muted">96 h de cours</span>
              </div>
              <div className="rounded-md bg-grad p-[14px_12px] text-ink-inverted shadow-brand">
                <b className="block font-display text-[14.5px] font-bold">Actif</b>
                <span className="text-[11px] text-white/80">Variante dégradé</span>
              </div>
            </div>
          </Section>

          {/* Inputs */}
          <Section id="champs" icon={Search} title="Champs" subtitle="Recherche, champ, select, toggle, segments.">
            <div className="flex flex-col gap-5">
              <Tile label="Recherche">
                <div className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-border bg-surface-muted p-[5px_5px_5px_14px] transition focus-within:border-brand-200 focus-within:ring-4 focus-within:ring-brand-500/10">
                  <input
                    placeholder="Rechercher un étudiant…"
                    className="min-w-0 flex-1 bg-transparent text-[13px] font-normal text-ink placeholder:text-ink-muted focus:outline-none"
                  />
                  <button className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-grad text-ink-inverted">
                    <Search className="size-[15px]" />
                  </button>
                </div>
              </Tile>
              <Tile label="Champ & select">
                <label className="block w-full max-w-xs">
                  <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Titre</span>
                  <input className="h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20" />
                </label>
                <button className="flex h-11 items-center gap-5 self-end rounded-md border border-border-strong bg-surface px-3 text-[12.5px] font-medium text-ink-subtle">
                  Mois <ChevronDown className="size-3" />
                </button>
              </Tile>
              <Tile label="Toggle & segments">
                <button
                  role="switch"
                  aria-checked={switchOn}
                  onClick={() => setSwitchOn((v) => !v)}
                  className={cn("relative h-6 w-11 rounded-full transition", switchOn ? "bg-brand-500" : "bg-neutral-300")}
                >
                  <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition", switchOn ? "left-[22px]" : "left-0.5")} />
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
          <Section id="vide" icon={Inbox} title="État vide" subtitle="Chip neutre + texte discret (kit).">
            <div className="rounded-lg border border-dashed border-border">
              <EmptyState
                icon={Inbox}
                title="Aucune séance ce mois-ci"
                description="Ajoutez une première séance pour remplir le planning."
                action={
                  <button className="inline-flex h-10 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105">
                    <Plus className="size-4" /> Ajouter
                  </button>
                }
              />
            </div>
          </Section>

          {/* Data table */}
          <Section id="tableau" icon={Table} title="Tableau de données" subtitle="Générique typé, avec états chargement + vide (kit).">
            <div className="flex flex-col gap-5">
              <Tile label="Avec données">
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
                <Tile label="Chargement">
                  <div className="w-full">
                    <DataTable columns={columns} rows={[]} rowKey={(r) => r.id} loading loadingRows={3} />
                  </div>
                </Tile>
                <Tile label="Vide">
                  <div className="w-full">
                    <DataTable columns={columns} rows={[]} rowKey={(r) => r.id} />
                  </div>
                </Tile>
              </div>
            </div>
          </Section>

          {/* Overlays */}
          <Section id="overlays" icon={PanelRight} title="Superpositions" subtitle="Bottom sheet sur mobile, dialog sur bureau — essayez-les.">
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
          <Section id="responsive" icon={Smartphone} title="Responsive & app-ready" subtitle="Une seule base, mobile-first. Réduisez la fenêtre sous 768px.">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-ink-muted">Mode actuel :</span>
                <Badge tone={isMobile ? "brand" : "neutral"} dot>
                  {isMobile ? "Mobile" : "Bureau"}
                </Badge>
              </div>
              <ul className="grid gap-2 text-sm text-ink-subtle sm:grid-cols-2">
                <li>Tableaux → cartes empilées sous md.</li>
                <li>Modales/formulaires → bottom sheets sous md.</li>
                <li>Navigation → barre d’onglets en bas sur mobile.</li>
                <li>Actions de ligne derrière un menu « … » (jamais au survol).</li>
                <li>Cibles tactiles ≥ 44px.</li>
                <li>Zones sûres (encoche / barre) respectées.</li>
              </ul>
              <p className="text-[12px] text-ink-muted">
                Le tableau et les superpositions ci-dessus basculent automatiquement — le menu « … » de chaque ligne fonctionne au toucher.
              </p>
            </div>
          </Section>
        </div>

        <p className="mt-10 text-center text-[12px] text-ink-muted">
          Source : <code className="text-ink-subtle">.claude/skills/wael-design-system-soft</code> · jetons dans{" "}
          <code className="text-ink-subtle">src/styles/index.css</code>
        </p>
      </div>

      {/* Interactive demos */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Supprimer cet élément ?"
        description="Cette action est irréversible dans une vraie app."
        onConfirm={handleConfirm}
        loading={confirmLoading}
      />
      <FormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title="Nouvel étudiant"
        description="Exemple de formulaire dans un sheet."
        onSubmit={handleSave}
        submitting={saving}
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Nom complet</span>
          <input className="h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20" placeholder="Ex. Ines Trabelsi" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">Groupe</span>
          <input className="h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20" placeholder="Ex. Bac Sciences" />
        </label>
      </FormSheet>
    </div>
  )
}
