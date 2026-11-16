import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AlertCircle, Eye, EyeOff, MessageSquareText, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { sfx } from "@/features/student-v2/sound"
import { useAuth } from "@/stores/useAuth"
import { matiereKey } from "@/data/matiere"
import { SubjectIcon } from "@/components/icons/subjects"
import { DEMO_CODE, LEVELS, MIN_PASSWORD, RESEND_AFTER_S, normalizePhone, phoneTaken, register } from "@/features/auth/auth"
import { gInput } from "@/features/game/shared/ui"
import character from "../../../svg icons/Caracter.png"
import { useGamePlatform } from "./MobileGameLayout"
import { usePlatformUi } from "./platformUi"
import { FlowScreen, STEPS, Tag, useGameShake, usePlatformCorners } from "./onboarding/parts"
import { useOnboarding, useScore, yearById, yearLabel } from "./onboarding/flow"

/**
 * « أعمل كونط » — the account that KEEPS what the student just made.
 *
 * The end side shows what's being saved (Wael, the matière, the score, the
 * points, the level) so the form reads as « save », not « register ». The
 * start side asks the least, one small step at a time (landscape: ~300 px):
 *   1. name + phone (+216 fixed, grouped « 29 340 118 » as you type)
 *   2. the 6-digit SMS code — one real input drawn as six boxes that stay
 *      left-to-right; the "SMS" arrives as a banner at the top of the phone
 *      (tap it to fill, as the system's code suggestion would); paste fills
 *      all six; a wrong code shakes and clears; « أرجع ابعث الكود » after 60 s
 *   3. a password (the app signs in with it, like /connexion) and, under 18,
 *      a parent's number — consent is the law's ask (docs/onboarding/ux-best-practices.md)
 * The level comes from the game; asked only when the student skipped it.
 */
type Step = "phone" | "code" | "finish"
const STEP_N: Record<Step, number> = { phone: 1, code: 2, finish: 3 }

/** « 29340118 » → « 29 340 118 ». */
function groupPhone(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 8)
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 8)].filter(Boolean).join(" ")
}

export default function RegisterScreen() {
  const navigate = useNavigate()
  const ui = usePlatformUi()
  const ios = useGamePlatform() === "ios"
  const { card, panel } = usePlatformCorners()
  const signInAs = useAuth((s) => s.signInAs)
  const { yearId, subject, finished } = useOnboarding()
  const { right, total, points } = useScore()
  const year = yearById(yearId)

  const [step, setStep] = useState<Step>("phone")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [shown, setShown] = useState(false)
  const [minor, setMinor] = useState(false)
  const [parent, setParent] = useState("")
  const [levelId, setLevelId] = useState(yearId ?? "")
  const [error, setError] = useState<string | null>(null)
  const [sms, setSms] = useState(false)
  const [left, setLeft] = useState(RESEND_AFTER_S)
  const [shake, triggerShake] = useGameShake()
  const codeRef = useRef<HTMLInputElement>(null)
  const ids = { name: useId(), phone: useId(), code: useId(), pw: useId(), parent: useId(), level: useId() }

  // The resend countdown, while on the code step.
  useEffect(() => {
    if (step !== "code" || left <= 0) return
    const t = window.setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => window.clearTimeout(t)
  }, [step, left])

  function fail(msg: string) {
    setError(msg)
    sfx("error")
    triggerShake()
  }

  function sendCode(e?: FormEvent) {
    e?.preventDefault()
    if (name.trim().length < 2) return fail("أكتب اسمك.")
    if (normalizePhone(phone).length !== 8) return fail("نومرو التليفون فيه 8 أرقام.")
    if (phoneTaken(phone)) return fail("النومرو هذا عندو كونط. أدخل بيه.")
    setError(null)
    sfx("send")
    setStep("code")
    setCode("")
    setLeft(RESEND_AFTER_S)
    // The SMS lands a beat after the tap, as a real one would.
    window.setTimeout(() => {
      setSms(true)
      sfx("receive")
    }, 900)
    window.setTimeout(() => codeRef.current?.focus(), 50)
  }

  function typeCode(raw: string) {
    const d = raw.replace(/\D/g, "").slice(0, 6)
    setCode(d)
    setError(null)
    if (d.length < 6) return
    if (d === DEMO_CODE) {
      sfx("success")
      setSms(false)
      setStep("finish")
    } else {
      fail("الكود غالط. ثبّت في الميساج وعاود.")
      setCode("")
    }
  }

  function create(e: FormEvent) {
    e.preventDefault()
    if (minor && normalizePhone(parent).length !== 8) return fail("أكتب نومرو وليّك (8 أرقام).")
    const res = register({ fullName: name, phone, levelId, password })
    if (!res.ok) return fail(res.error)
    sfx("connect")
    signInAs(res.user)
    navigate("/mobilegame/accueil")
  }

  const label = "mb-1 block text-[calc(8px*var(--ts))] font-bold text-v2-ink"
  const field = cn(gInput, ui.input, ui.inputText)
  const titles: Record<Step, [string, ReactNode]> = {
    phone: ["احفظ نتيجتك", "اسمك ونومرو تليفونك، وبرّا."],
    code: [
      "ثبّت النومرو",
      <>
        بعثنالك كود بـ <bdi dir="ltr">6</bdi> أرقام على <bdi dir="ltr" className="font-bold">+216 {groupPhone(phone)}</bdi>
      </>,
    ],
    finish: ["آخر حاجة", "كلمة سر باش تدخل بيها من أي تليفون."],
  }

  return (
    <FlowScreen
      step={STEPS.result}
      progress={(STEP_N[step] - 0.5) / 3}
      back={step === "phone" ? (finished ? "/mobilegame/resultat" : "/mobilegame") : undefined}
      backLabel="رجوع"
      end={
        step === "phone" ? (
          <Link to="/mobilegame/connexion" data-uisfx="forward" className={cn(ui.link, "text-[calc(8px*var(--ts))]")}>
            عندي كونط
          </Link>
        ) : (
          <button
            type="button"
            data-uisfx="back"
            onClick={() => {
              setStep(step === "finish" ? "code" : "phone")
              setSms(false)
              setError(null)
            }}
            className={cn(ui.link, "text-[calc(8px*var(--ts))]")}
          >
            {step === "code" ? "بدّل النومرو" : "رجوع"}
          </button>
        )
      }
      aside={
        <aside className={cn("relative min-h-0 overflow-hidden border-2 border-[#052a30] bg-v2-chapter p-2.5", panel)}>
          {/* #052a30 = --v2-edge-deep, the chapter's own edge */}
          <img src={character} alt="" aria-hidden className="absolute -bottom-1 end-0 h-[62%] object-contain drop-shadow-[0_8px_16px_rgb(0_0_0/.35)]" />
          <div className={cn("relative border-2 border-v2-ink bg-v2-surface p-2.5 shadow-[0_3px_0_var(--v2-ink)]", card)}>
            <p className="text-[calc(7.1px*var(--ts))] font-bold text-v2-ink-2">تتسجّل في الكونط</p>
            {finished && subject ? (
              <>
                <p className="mt-1 flex items-center gap-1.5 text-[calc(8px*var(--ts))] font-extrabold text-v2-ink">
                  <SubjectIcon name={subject} className="size-8 shrink-0" />
                  <span className="min-w-0">
                    <span className="block truncate">{matiereKey(subject)}</span>
                    <bdi dir="ltr" className="text-[calc(11px*var(--ts))] font-black tabular-nums">
                      {right}/{total}
                    </bdi>
                  </span>
                </p>
                <p className="mt-1.5 inline-flex items-center gap-1 text-[calc(7.1px*var(--ts))] font-extrabold text-v2-brand-text">
                  <Sparkles className="size-3.5" strokeWidth={2.4} /> <bdi dir="ltr">+{points}</bdi> نقطة
                </p>
              </>
            ) : (
              <p className="mt-1 text-[calc(7.5px*var(--ts))] font-bold leading-snug text-v2-ink">مدينتك، نقاطك والدوري.</p>
            )}
            {year && <Tag className="mt-1.5">{yearLabel(year)}</Tag>}
          </div>
        </aside>
      }
      overlay={
        sms && (
          <button
            type="button"
            data-uisfx="paste"
            onClick={() => typeCode(DEMO_CODE)}
            className={cn(
              "absolute inset-x-0 top-2 z-30 mx-auto flex w-[min(420px,70%)] items-center gap-3 px-3 py-2.5 text-start motion-safe:animate-[game-banner-in_400ms_cubic-bezier(.2,.8,.2,1)]",
              // iOS: a notification banner — frosted, 22 pt corners; Android: a heads-up card on the tonal surface.
              ios
                ? "rounded-[22px] bg-v2-surface/90 shadow-[0_8px_22px_-8px_rgb(0_0_0/.35)] backdrop-blur-xl backdrop-saturate-150"
                : "m3-ripple rounded-[20px] bg-v2-surface shadow-[0_6px_24px_rgb(0_0_0/.22)]",
            )}
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-v2-brand text-white">
              <MessageSquareText className="size-5" strokeWidth={2} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between text-[calc(7.1px*var(--ts))] font-bold text-v2-ink-2">
                <bdi dir="ltr">Wael Academy</bdi> <span>توّا</span>
              </span>
              <span className="block text-[calc(8px*var(--ts))] font-semibold leading-snug text-v2-ink">
                الكود متاعك: <bdi dir="ltr" className="font-black tracking-wider">{DEMO_CODE}</bdi> — اضغط هنا باش تعمّرو
              </span>
            </span>
          </button>
        )
      }
    >
      <div className={cn("min-h-0 flex-1 overflow-y-auto ps-2 pe-1 pb-2", shake)}>
        <h1 className="text-[calc(12.5px*var(--ts))] font-black leading-tight text-v2-ink">{titles[step][0]}</h1>
        <p className="mb-2 text-[calc(7.5px*var(--ts))] text-v2-ink-2">{titles[step][1]}</p>

        {step === "phone" && (
          <form onSubmit={sendCode} noValidate className="grid grid-cols-2 gap-x-3 gap-y-2">
            <div>
              <label htmlFor={ids.name} className={label}>
                اسمك
              </label>
              <input id={ids.name} autoComplete="name" placeholder="مثال: ياسمين" className={field} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label htmlFor={ids.phone} className={label}>
                نومرو التليفون
              </label>
              <div dir="ltr" className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[max(16px,calc(10px*var(--ts)))] font-bold text-v2-ink-2">+216</span>
                <input
                  id={ids.phone}
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="29 340 118"
                  className={cn(field, "ps-16 tabular-nums")}
                  value={groupPhone(phone)}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))}
                />
              </div>
            </div>
            {error && <ErrorLine text={error} className="col-span-2" />}
            <div className="col-span-2 flex items-center gap-3">
              <button type="submit" className={cn(ui.cta, "text-[calc(9.5px*var(--ts))]")}>
                ابعثلي الكود
              </button>
              <span className="text-[calc(7.1px*var(--ts))] text-v2-ink-2">بلا إيميل. النومرو ما يتنشرش.</span>
            </div>
          </form>
        )}

        {step === "code" && (
          <div>
            <label htmlFor={ids.code} className="sr-only">
              كود التأكيد
            </label>
            <div dir="ltr" className="relative flex w-fit gap-2" onClick={() => codeRef.current?.focus()}>
              {Array.from({ length: 6 }, (_, k) => {
                const active = k === Math.min(code.length, 5)
                return (
                  <span
                    key={k}
                    aria-hidden
                    className={cn(
                      "grid size-12 place-items-center border-2 bg-v2-surface text-[calc(12px*var(--ts))] font-black tabular-nums text-v2-ink transition-colors",
                      card,
                      code[k] ? "border-v2-ink/40" : active ? "border-v2-brand ring-4 ring-v2-brand/15" : "border-v2-ink/15",
                    )}
                  >
                    {code[k] ?? ""}
                  </span>
                )
              })}
              <input
                ref={codeRef}
                id={ids.code}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(e) => typeCode(e.target.value)}
                className="absolute inset-0 cursor-text text-transparent caret-transparent opacity-0"
              />
            </div>
            {error && <ErrorLine text={error} className="mt-2" />}
            <p className="mt-3 text-[calc(7.5px*var(--ts))] text-v2-ink-2">
              {left > 0 ? (
                <>
                  ما وصلكش؟ تنجم تطلب واحد جديد بعد <bdi dir="ltr" className="font-bold tabular-nums">{left}</bdi> ثانية.
                </>
              ) : (
                <button type="button" data-uisfx="send" onClick={() => sendCode()} className={cn(ui.link, "text-[calc(8px*var(--ts))]")}>
                  أرجع ابعث الكود
                </button>
              )}
            </p>
          </div>
        )}

        {step === "finish" && (
          <form onSubmit={create} noValidate className="grid grid-cols-2 gap-x-3 gap-y-2">
            <div className={cn(!yearId && "col-span-1", yearId && "col-span-2 max-w-[60%]")}>
              <label htmlFor={ids.pw} className={label}>
                كلمة السر
              </label>
              <div className="relative">
                <input
                  id={ids.pw}
                  type={shown ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder={`${MIN_PASSWORD} حروف على الأقل`}
                  className={cn(field, "pe-12")}
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
            {!yearId && (
              <div>
                <label htmlFor={ids.level} className={label}>
                  المستوى
                </label>
                <select id={ids.level} className={field} value={levelId} onChange={(e) => setLevelId(e.target.value)}>
                  <option value="">اختار</option>
                  {LEVELS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="col-span-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                aria-pressed={minor}
                data-uisfx={minor ? "toggle-off" : "toggle-on"}
                onClick={() => setMinor((m) => !m)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border-2 px-3 text-[calc(7.5px*var(--ts))] font-bold transition-colors",
                  ui.target,
                  minor ? "border-[#5bcd3f] bg-v2-cta text-v2-on-cta" : "border-v2-ink/15 bg-v2-surface text-v2-ink",
                )}
              >
                عمري أقل من 18
              </button>
              {minor && (
                <div className="min-w-[180px] flex-1">
                  <label htmlFor={ids.parent} className="sr-only">
                    نومرو الولي
                  </label>
                  <input
                    id={ids.parent}
                    dir="ltr"
                    type="tel"
                    inputMode="numeric"
                    placeholder="نومرو الولي"
                    className={cn(field, "tabular-nums")}
                    value={groupPhone(parent)}
                    onChange={(e) => setParent(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  />
                </div>
              )}
            </div>
            {minor && <p className="col-span-2 -mt-1 text-[calc(7.1px*var(--ts))] text-v2-ink-2">نبعثو لوليّك ميساج باش يوافق. تنجم تلعب من توّا.</p>}
            {error && <ErrorLine text={error} className="col-span-2" />}
            <div className="col-span-2">
              <button type="submit" className={cn(ui.cta, "text-[calc(9.5px*var(--ts))]")}>
                اعمل الكونط
              </button>
            </div>
          </form>
        )}
      </div>
    </FlowScreen>
  )
}

function ErrorLine({ text, className }: { text: string; className?: string }) {
  return (
    <p role="alert" className={cn("flex items-start gap-2 rounded-2xl bg-v2-live-soft px-3 py-2 text-[calc(7.5px*var(--ts))] font-semibold text-v2-live-strong", className)}>
      <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
      {text}
    </p>
  )
}
