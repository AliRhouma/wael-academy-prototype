import { useId, useState, type ReactNode } from "react"
import { Eye, EyeOff, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * The frame's form parts — its proportions at HALF its scale.
 *
 * « Log In » is drawn zoomed: a 1200-wide card with 84px boxes and a 68px
 * title, which at 100 % on a real screen is roughly twice the size of every
 * other surface here. So the ratios are the frame's and the scale is halved:
 *   label   bold navy, colon-suffixed, on the reading start — 38 → 19px
 *   input   full width × 84 → 48, 1px navy at 50 %, placeholder at 40 %
 *   button  lime, navy text, centred — 72 % of the field width, 81 → 48 tall
 */

const fieldText = "text-[calc(10px*var(--ts))] md:text-[calc(10.5px*var(--ts))]"

export const inputClass = cn(
  "block h-12 w-full rounded-xl border border-v2-ink/50 bg-transparent px-4 text-v2-ink outline-none transition md:px-5",
  "placeholder:text-v2-ink/40 hover:border-v2-ink/70 focus:border-v2-brand focus:ring-2 focus:ring-v2-brand/25",
  fieldText,
)

export const labelClass =
  "mb-2 block text-[calc(11px*var(--ts))] font-bold text-v2-ink md:mb-[11px] md:text-[calc(12.5px*var(--ts))]"

/** The lime call to action — one per card, centred, 72 % of the field width. */
export const authCta = cn(
  "mx-auto flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-v2-cta font-bold text-v2-on-cta transition md:w-[72%]",
  "hover:shadow-lg hover:shadow-v2-cta/50 hover:brightness-[.97] active:scale-[.99]",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v2-brand",
  "disabled:pointer-events-none disabled:opacity-50",
  "text-[calc(10.5px*var(--ts))] md:text-[calc(11px*var(--ts))]",
)

/** The quiet line under the card — « ما عندكش كونط؟ أعمل كونط ». */
export const footLine =
  "text-center text-[calc(10px*var(--ts))] text-v2-ink/70 md:text-[calc(10.75px*var(--ts))]"

export const footLink =
  "font-bold text-v2-ink underline decoration-v2-brand decoration-2 underline-offset-4 transition hover:text-v2-brand"

/** The rhythm between two field groups — 50px in the frame, 25 here. */
export const stackGap = "space-y-5 md:space-y-[25px]"

export function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: (id: string) => ReactNode
  hint?: ReactNode
}) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      {children(id)}
      {hint && <p className="mt-2 text-[calc(8.5px*var(--ts))] text-v2-ink/55 md:text-[calc(9.5px*var(--ts))]">{hint}</p>}
    </div>
  )
}

/**
 * A password box with the reveal eye. The frame puts the eye on the physical
 * left, i.e. the logical END of an RTL line — where the value runs out.
 */
export function PasswordField({
  label,
  placeholder,
  value,
  onChange,
  autoComplete,
}: {
  label: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
}) {
  const [shown, setShown] = useState(false)
  return (
    <Field label={label}>
      {(id) => (
        <div className="relative">
          <input
            id={id}
            type={shown ? "text" : "password"}
            className={cn(inputClass, "pe-14")}
            placeholder={placeholder}
            value={value}
            autoComplete={autoComplete}
            onChange={(e) => onChange(e.target.value)}
            required
          />
          <button
            type="button"
            tabIndex={-1}
            data-uisfx={shown ? "toggle-off" : "toggle-on"}
            aria-label={shown ? "أخفي كلمة السر" : "ورّي كلمة السر"}
            onClick={() => setShown((s) => !s)}
            className="absolute inset-y-0 end-0 grid w-14 place-items-center rounded-e-xl text-v2-ink/55 transition hover:text-v2-ink"
          >
            {shown ? <EyeOff className="size-5" strokeWidth={1.75} /> : <Eye className="size-5" strokeWidth={1.75} />}
          </button>
        </div>
      )}
    </Field>
  )
}

/** A native select dressed as one of the frame's boxes. */
export function SelectField({
  label,
  value,
  onChange,
  placeholder,
  options,
  icon: Chevron,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder: string
  options: { id: string; name: string }[]
  icon: LucideIcon
  required?: boolean
}) {
  return (
    <Field label={label}>
      {(id) => (
        <div className="relative">
          <select
            id={id}
            className={cn(inputClass, "appearance-none pe-12", value ? "text-v2-ink" : "text-v2-ink/40")}
            value={value}
            required={required}
            data-uisfx="select"
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">{placeholder}</option>
            {options.map((o) => (
              <option key={o.id} value={o.id} className="text-v2-ink">
                {o.name}
              </option>
            ))}
          </select>
          <Chevron
            aria-hidden
            className="pointer-events-none absolute end-4 top-1/2 size-5 -translate-y-1/2 text-v2-ink/55"
            strokeWidth={2}
          />
        </div>
      )}
    </Field>
  )
}

/** A refusal — red, under the field that caused it. `role="alert"` reads it. */
export function FormError({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="flex items-start gap-2 rounded-xl bg-v2-live/10 px-4 py-2.5 text-[calc(9.5px*var(--ts))] font-semibold text-v2-live-strong md:text-[calc(10.5px*var(--ts))]"
    >
      {children}
    </p>
  )
}

/** Something went right — same box, brand ink. */
export function FormNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-xl bg-v2-brand/10 px-4 py-2.5 text-[calc(9.5px*var(--ts))] font-semibold text-v2-brand md:text-[calc(10.5px*var(--ts))]">
      {children}
    </p>
  )
}

/**
 * The prototype speaking, not the product: what to type, or the code the SMS
 * would have carried. Dashed so nobody mistakes it for a real message.
 */
export function DemoHint({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-v2-ink/30 px-4 py-2.5 text-center text-[calc(8.5px*var(--ts))] leading-relaxed text-v2-ink/65 md:text-[calc(9.5px*var(--ts))]">
      {children}
    </p>
  )
}
