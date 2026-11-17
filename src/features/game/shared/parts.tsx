import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { AlertCircle, Construction, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/stores/useAuth"
import { mountSound, sfx } from "@/features/student-v2/sound"
import { DEMO_ACCOUNT, signIn } from "@/features/auth/auth"
import lockup from "@/assets/v2/logo-lockup.png"
import { gCta, gInput } from "./ui"
import "./game.css"

/**
 * The game apps speak the élève space's language: Arabic (derja), RTL, and the
 * same sound grammar. Each layout calls this once.
 */
export function useGameDocument(title: string) {
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute("dir", "rtl")
    html.setAttribute("lang", "ar-TN")
    const before = document.title
    document.title = title
    return () => {
      document.title = before
    }
  }, [title])
  useEffect(() => mountSound(), [])
}

/** The Wael lockup, painted through a mask so its ink comes from a token. */
export function GameLogo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <span
      role="img"
      aria-label="Wael Academy"
      className={cn("block shrink-0", light ? "bg-white" : "bg-v2-ink", className)}
      style={{
        maskImage: `url(${lockup})`,
        WebkitMaskImage: `url(${lockup})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  )
}

/**
 * The sign-in form both game apps share — the real door's flow (phone or
 * email + password, `features/auth/auth.ts`), sized by `compact` for the
 * 390px-tall landscape phone. The demo account can be filled in one tap.
 */
/** Per-platform overrides for the form (the phone app passes its iOS / Android set). */
export interface FormUi {
  input: string
  inputText: string
  link: string
  cta: string
  target: string
}

const DEMO_EVENT = "wael:demo-fill"

/** « تجريبي · عمّرهم » outside the form (the phone app puts it beside Wael). */
export function DemoFillButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      data-uisfx="select"
      onClick={() => window.dispatchEvent(new Event(DEMO_EVENT))}
      className={cn(
        "rounded-full border-2 border-dashed px-3 font-semibold transition",
        className,
      )}
    >
      تجريبي: <bdi dir="ltr">{DEMO_ACCOUNT.phone}</bdi> · عمّرهم
    </button>
  )
}

export function GameLoginForm({
  compact = false,
  onSuccess,
  forgotTo,
  registerTo,
  ui,
  showDemo = true,
  demoWhenEmpty = false,
}: {
  compact?: boolean
  /** Prototype shortcut: submitting with both fields empty signs in the demo student. */
  demoWhenEmpty?: boolean
  onSuccess: () => void
  forgotTo: string
  registerTo: string
  ui?: FormUi
  showDemo?: boolean
}) {
  const signInAs = useAuth((s) => s.signInAs)
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [shown, setShown] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const idA = useId()
  const idB = useId()

  function submit(e: FormEvent) {
    e.preventDefault()
    const empty = !identifier.trim() && !password
    const res = demoWhenEmpty && empty ? signIn(DEMO_ACCOUNT.phone, DEMO_ACCOUNT.password) : signIn(identifier, password)
    if (!res.ok) {
      setError(res.error)
      sfx("error")
      return
    }
    setError(null)
    sfx("connect")
    signInAs(res.user)
    onSuccess()
  }

  function fillDemo() {
    setIdentifier(DEMO_ACCOUNT.phone)
    setPassword(DEMO_ACCOUNT.password)
    setError(null)
  }
  useEffect(() => {
    window.addEventListener(DEMO_EVENT, fillDemo)
    return () => window.removeEventListener(DEMO_EVENT, fillDemo)
  }, [])

  const h = ui ? cn(ui.input, ui.inputText) : compact ? "h-11" : "h-12 md:h-13"
  const label = cn(ui ? "mb-1" : "mb-1.5", "block font-bold text-v2-ink", compact ? "text-[calc(8px*var(--ts))]" : "text-[calc(9.5px*var(--ts))]")
  const text = ui ? "" : compact ? "text-[calc(8.5px*var(--ts))]" : "text-[calc(10px*var(--ts))]"
  const small = compact ? "text-[calc(7.5px*var(--ts))]" : "text-[calc(9px*var(--ts))]"
  // The phone app keeps « نسيت كلمة السر » under the button (one row with
  // « أعمل كونط »), so the platform's 48 dp link targets fit in 384 px.
  const forgotInRow = !!ui
  const forgot = (
    <Link to={forgotTo} data-uisfx="forward" className={cn(ui ? ui.link : "font-semibold text-v2-brand-text hover:underline", small)}>
      نسيت كلمة السر؟
    </Link>
  )

  return (
    <form onSubmit={submit} noValidate className={cn("w-full", compact ? (ui ? "space-y-2" : "space-y-2.5") : "space-y-4")}>
      <div>
        <label htmlFor={idA} className={label}>
          رقم الهاتف ولّا الإيميل
        </label>
        <input
          id={idA}
          type="text"
          inputMode="email"
          autoComplete="username"
          placeholder="مثال 20123456"
          className={cn(gInput, h, text)}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
      </div>
      <div>
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor={idB} className={label}>
            كلمة السر
          </label>
          {!forgotInRow && forgot}
        </div>
        <div className="relative">
          <input
            id={idB}
            type={shown ? "text" : "password"}
            autoComplete="current-password"
            placeholder="كلمة السر"
            className={cn(gInput, h, text, "pe-12")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            data-uisfx={shown ? "toggle-off" : "toggle-on"}
            aria-label={shown ? "أخفي كلمة السر" : "ورّي كلمة السر"}
            onClick={() => setShown((s) => !s)}
            className="absolute inset-y-0 end-0 grid w-12 place-items-center text-v2-ink-2 hover:text-v2-ink"
          >
            {shown ? <EyeOff className="size-5" strokeWidth={1.9} /> : <Eye className="size-5" strokeWidth={1.9} />}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className={cn("flex items-start gap-2 rounded-2xl bg-v2-live-soft px-3 py-2 font-semibold text-v2-live-strong", text || small)}>
          <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
          {error}
        </p>
      )}

      <button
        type="submit"
        data-uisfx="connect"
        className={cn(ui ? ui.cta : gCta, "w-full", ui ? "text-[calc(10px*var(--ts))]" : compact ? "h-12 text-[calc(10px*var(--ts))]" : "h-14 text-[calc(11px*var(--ts))]")}
      >
        ادخل لمدينتك
      </button>

      <div className={cn("flex flex-wrap items-center justify-between gap-x-2 text-v2-ink-2", small, !ui && "gap-y-2")}>
        <span className={cn("inline-flex items-center gap-1", ui?.target)}>
          ما عندكش كونط؟
          <Link
            to={registerTo}
            data-uisfx="forward"
            className={cn("inline-flex items-center font-bold text-v2-ink underline decoration-v2-brand decoration-2 underline-offset-4", ui?.target)}
          >
            أعمل كونط
          </Link>
        </span>
        {forgotInRow && forgot}
        {showDemo && (
          <DemoFillButton className={cn("border-v2-ink/25 py-1 text-v2-ink-2 hover:border-v2-brand hover:text-v2-brand-text", ui?.target)} />
        )}
      </div>
    </form>
  )
}

/** A screen that isn't built yet — never a dead button. */
export function GameSoon({
  title,
  body,
  actions,
  dark = false,
}: {
  title: string
  body: ReactNode
  actions: ReactNode
  dark?: boolean
}) {
  return (
    <div className="grid h-full place-items-center p-6 text-center">
      <div className="max-w-md">
        <span
          className={cn(
            "mx-auto grid size-14 place-items-center rounded-2xl border-2",
            dark ? "border-white/25 bg-white/10 text-white" : "border-v2-ink/10 bg-v2-surface text-v2-brand",
          )}
        >
          <Construction className="size-7" strokeWidth={1.9} />
        </span>
        <h1 className={cn("mt-4 font-extrabold text-[calc(14px*var(--ts))]", dark ? "text-white" : "text-v2-ink")}>{title}</h1>
        <p className={cn("mt-2 text-[calc(9px*var(--ts))] leading-relaxed", dark ? "text-white/75" : "text-v2-ink-2")}>{body}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">{actions}</div>
      </div>
    </div>
  )
}
