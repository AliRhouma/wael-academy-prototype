import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import {
  AtSign,
  Check,
  ChevronDown,
  GraduationCap,
  MapPin,
  Pencil,
  Phone,
  School,
  Sparkles,
  UserRound,
} from "lucide-react"
import { Avatar } from "@/components/kit/Avatar"
import { Badge, type BadgeTone } from "@/components/kit/Badge"
import { FormSheet } from "@/components/kit/FormSheet"
import { useToast } from "@/components/kit/Toast"
import { useAuth } from "@/stores/useAuth"
import { useData } from "@/stores/useData"
import type { Role, User, UserFieldChange } from "@/data/types"

const INPUT =
  "h-11 w-full rounded-md border border-input bg-input-bg px-3.5 text-ink placeholder:text-ink-muted focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-ring/20"

const ROLE: Record<Role, { label: string; tone: BadgeTone }> = {
  admin: { label: "أدمين", tone: "info" },
  teacher: { label: "أستاذ", tone: "brand" },
  parent: { label: "ولي", tone: "warning" },
  student: { label: "تلميذ", tone: "neutral" },
}

/** Field → French label, used to write the history summary of an edit. */
const FIELD_LABEL: Record<string, string> = {
  name: "الاسم",
  phone: "التليفون",
  email: "الإيميل",
  yearIds: "السنوات",
  city: "المدينة",
  town: "المنطقة",
  school: "المدرسة",
  moyenneGenerale: "المعدّل العام",
}

const LONG_DAY = new Intl.DateTimeFormat("ar-TN-u-nu-latn", {
  day: "numeric",
  month: "long",
  year: "numeric",
})

/** One read-only line of the profile: icon + label above, value below. */
function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound
  label: string
  value?: ReactNode
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1.5 text-[calc(12px*var(--ts))] font-medium uppercase tracking-[.08em] text-ink-muted">
        <Icon className="size-3.5 shrink-0" /> {label}
      </p>
      <p className="mt-1 truncate text-[calc(15px*var(--ts))] text-ink" dir="auto">
        {value != null && value !== "" ? value : <span className="text-ink-muted">ما تعمّرش</span>}
      </p>
    </div>
  )
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-sm md:p-6">
      <h2 className="font-display text-base font-bold text-ink">{title}</h2>
      <div className="mt-4 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  )
}

/**
 * "Mon profil" — the signed-in user's own record: a read-only view of every
 * detail, with one "بدّل" action that opens the same FormSheet the admin
 * uses. Shared across roles (reached from the avatar menu in the shell); the
 * student-only fields (année, école, moyenne) show only for élèves.
 */
export default function ProfileScreen() {
  const authUser = useAuth((s) => s.currentUser)
  const users = useData((s) => s.users)
  const years = useData((s) => s.years)
  const updateUser = useData((s) => s.updateUser)
  const { show, toast } = useToast()

  // Read the live row from the store, not the auth snapshot, so a save is
  // reflected here (and in the shell header) immediately.
  const user = users.find((u) => u.id === authUser?.id) ?? authUser

  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [email, setEmail] = useState("")
  const [yearIds, setYearIds] = useState<string[]>([])
  const [city, setCity] = useState("")
  const [town, setTown] = useState("")
  const [school, setSchool] = useState("")
  const [moyenne, setMoyenne] = useState("")

  const yearName = useMemo(() => {
    const m = new Map<string, string>()
    for (const y of years) m.set(y.id, y.name)
    return m
  }, [years])

  const sortedYears = useMemo(
    () => [...years].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [years],
  )

  if (!user) return null

  const isStudent = user.role === "student"
  const showYears = user.role !== "admin"
  const yearLabel =
    user.yearIds && user.yearIds.length > 0
      ? user.yearIds.map((id) => yearName.get(id) ?? "—").join(" · ")
      : undefined

  function openEdit() {
    if (!user) return
    setName(user.name)
    setPhone(user.phone)
    setPhoneError("")
    setEmail(user.email ?? "")
    setYearIds(user.yearIds ?? [])
    setCity(user.city ?? "")
    setTown(user.town ?? "")
    setSchool(user.school ?? "")
    setMoyenne(user.moyenneGenerale != null ? String(user.moyenneGenerale) : "")
    setOpen(true)
  }

  function toggleYear(id: string) {
    setYearIds((ids) => (ids.includes(id) ? ids.filter((y) => y !== id) : [...ids, id]))
  }

  function submit() {
    if (!user) return
    const trimmedName = name.trim()
    const trimmedPhone = phone.trim()
    if (!trimmedName || !trimmedPhone) return

    // Phone is the unique identifier across the academy — refuse a duplicate.
    if (users.some((u) => u.phone.trim() === trimmedPhone && u.id !== user.id)) {
      setPhoneError("الرقم هذا مستعمل من قبل في حساب آخر.")
      return
    }

    const parsedMoyenne = moyenne.trim() === "" ? undefined : Number(moyenne.replace(",", "."))
    const patch = {
      name: trimmedName,
      phone: trimmedPhone,
      email: email.trim() || undefined,
      // Cardinality by role: student ≤ 1, teacher/parent 0..*, admin none.
      yearIds: user.role === "admin" ? undefined : isStudent ? yearIds.slice(0, 1) : yearIds,
      city: city.trim() || undefined,
      town: town.trim() || undefined,
      school: isStudent ? school.trim() || undefined : undefined,
      moyenneGenerale:
        isStudent && parsedMoyenne != null && !Number.isNaN(parsedMoyenne) ? parsedMoyenne : undefined,
    }

    // Diff field by field so the audit history shows before → after.
    const fmt = (k: keyof typeof patch, v: unknown): string | undefined => {
      if (v == null || v === "") return undefined
      if (k === "yearIds") {
        const ids = v as string[]
        return ids.length > 0 ? ids.map((id) => yearName.get(id) ?? "—").join(" · ") : undefined
      }
      if (k === "moyenneGenerale") return `${(v as number).toFixed(2).replace(".", ",")} / 20`
      return String(v)
    }
    const changes: UserFieldChange[] = (Object.keys(patch) as (keyof typeof patch)[])
      .filter((k) =>
        k === "yearIds"
          ? [...(patch.yearIds ?? [])].sort().join() !== [...(user.yearIds ?? [])].sort().join()
          : patch[k] !== user[k as keyof User],
      )
      .map((k) => ({ field: FIELD_LABEL[k], before: fmt(k, user[k as keyof User]), after: fmt(k, patch[k]) }))
      .filter((c) => c.before !== c.after)

    if (changes.length === 0) {
      setOpen(false)
      show("ما فماش تبديل")
      return
    }

    updateUser(user.id, patch, changes)
    setOpen(false)
    show("البروفايل تحدّث")
  }

  const editButton = (
    <button
      type="button"
      onClick={openEdit}
      className="inline-flex h-11 items-center gap-2 rounded-md bg-grad px-4 font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:h-10"
    >
      <Pencil className="size-4" /> بدّل
    </button>
  )

  return (
    <div className="mx-auto flex w-full max-w-[880px] flex-col gap-5">
      {/* Identity — the one thing you came to check, with the one action. */}
      <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-sm">
        <div className="h-20 bg-grad md:h-24" />
        <div className="px-5 pb-5 md:px-6 md:pb-6">
          <div className="-mt-10 flex flex-wrap items-end gap-4">
            <Avatar
              name={user.name}
              size="lg"
              className="size-20 text-2xl ring-4 ring-surface md:size-[88px] md:text-[calc(26px*var(--ts))]"
            />
            <div className="min-w-0 flex-1 pb-0.5">
              <h1 dir="auto" className="truncate font-display text-[calc(22px*var(--ts))] font-bold leading-tight text-ink md:text-[calc(26px*var(--ts))]">
                {user.name}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <Badge tone={ROLE[user.role].tone} dot>
                  {ROLE[user.role].label}
                </Badge>
                {yearLabel && <Badge tone="brand">{yearLabel}</Badge>}
              </div>
            </div>
            <div className="shrink-0 pb-0.5">{editButton}</div>
          </div>

          {isStudent && user.moyenneGenerale != null && (
            <div className="mt-5 flex items-center gap-3 rounded-md bg-accent2-50 px-4 py-3">
              <Sparkles className="size-[18px] shrink-0 text-accent2-600" />
              <p className="text-sm text-accent2-700">
                المعدّل العام{" "}
                <span className="font-display text-base font-bold tabular-nums">
                  {user.moyenneGenerale.toFixed(2).replace(".", ",")}
                </span>{" "}
                / 20
              </p>
            </div>
          )}
        </div>
      </section>

      <Card title="المعلومات الشخصية">
        <Field icon={UserRound} label="الاسم الكامل" value={user.name} />
        <Field
          icon={Phone}
          label="الرقم"
          value={
            <span dir="ltr" className="tabular-nums">
              {user.phone}
            </span>
          }
        />
        <Field icon={AtSign} label="الإيميل" value={user.email} />
        {showYears && <Field icon={GraduationCap} label="العام" value={yearLabel} />}
        {isStudent && <Field icon={School} label="المدرسة" value={user.school} />}
        <Field icon={MapPin} label="المدينة" value={user.city} />
        <Field icon={MapPin} label="المنطقة" value={user.town} />
      </Card>

      <Card title="الحساب">
        <Field icon={UserRound} label="الدور" value={ROLE[user.role].label} />
        <Field icon={GraduationCap} label="منخرط من" value={LONG_DAY.format(new Date(user.createdAt))} />
        <Field
          icon={Pencil}
          label="آخر تبديل"
          value={
            user.updatedAt === user.createdAt
              ? "البروفايل عمرو ما تبدّل"
              : LONG_DAY.format(new Date(user.updatedAt))
          }
        />
      </Card>

      <FormSheet
        open={open}
        onOpenChange={setOpen}
        title="بدّل البروفايل"
        description="معلوماتك تشوفها إدارة الأكاديمية."
        onSubmit={submit}
        submitLabel="حدّث"
      >
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">الاسم الكامل</span>
          <input
            className={INPUT}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="مثال: محمد بن صالح"
            autoFocus
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
            الرقم <span className="font-normal text-ink-muted">(وحيد)</span>
          </span>
          <input
            className={
              INPUT +
              (phoneError ? " border-danger-600 focus:border-danger-600 focus:ring-danger-600/20" : "")
            }
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value)
              if (phoneError) setPhoneError("")
            }}
            placeholder="مثال: +216 29 340 118"
            type="tel"
            dir="ltr"
          />
          {phoneError && <span className="mt-1.5 block text-sm text-danger-600">{phoneError}</span>}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
            الإيميل <span className="font-normal text-ink-muted">(اختياري)</span>
          </span>
          <input
            className={INPUT}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="مثال: mohamed@exemple.tn"
            type="email"
            dir="ltr"
          />
        </label>

        {showYears && isStudent && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">العام</span>
            <div className="relative">
              <select
                className={INPUT + " appearance-none pe-10"}
                value={yearIds[0] ?? ""}
                onChange={(e) => setYearIds(e.target.value ? [e.target.value] : [])}
              >
                <option value="">— اختار عام —</option>
                {sortedYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
            </div>
          </label>
        )}

        {showYears && !isStudent && (
          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">السنوات</span>
            <div className="flex flex-wrap gap-2">
              {sortedYears.map((y) => {
                const on = yearIds.includes(y.id)
                return (
                  <button
                    key={y.id}
                    type="button"
                    onClick={() => toggleYear(y.id)}
                    className={
                      "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition " +
                      (on
                        ? "border-transparent bg-brand-600 text-ink-inverted"
                        : "border-border-strong bg-surface text-ink-subtle hover:border-brand-200 hover:text-brand-600")
                    }
                  >
                    {on && <Check className="size-3.5" />}
                    {y.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
              المدينة <span className="font-normal text-ink-muted">(اخت.)</span>
            </span>
            <input
              className={INPUT}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="مثال: تونس"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
              المنطقة <span className="font-normal text-ink-muted">(اخت.)</span>
            </span>
            <input
              className={INPUT}
              value={town}
              onChange={(e) => setTown(e.target.value)}
              placeholder="مثال: العمران"
            />
          </label>
        </div>

        {isStudent && (
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
                المدرسة <span className="font-normal text-ink-muted">(اخت.)</span>
              </span>
              <input
                className={INPUT}
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="مثال: معهد بورقيبة"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-ink-subtle">
                المعدّل <span className="font-normal text-ink-muted">/ 20 (اخت.)</span>
              </span>
              <input
                className={INPUT}
                value={moyenne}
                onChange={(e) => setMoyenne(e.target.value)}
                placeholder="مثال: 14,50"
                type="number"
                min={0}
                max={20}
                step={0.01}
                dir="ltr"
              />
            </label>
          </div>
        )}
      </FormSheet>

      {toast}
    </div>
  )
}
