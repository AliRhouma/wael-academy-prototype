import { useEffect, useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/stores/useAuth"
import { sfx } from "@/features/student-v2/sound"
import { AuthFrame, AuthHead } from "./AuthFrame"
import { DEMO_CODE, MIN_PASSWORD, RESEND_AFTER_S, normalizePhone, resetPassword, sendResetCode } from "./auth"
import {
  DemoHint,
  Field,
  FormError,
  FormNote,
  PasswordField,
  authCta,
  footLine,
  inputClass,
  labelClass,
  stackGap,
} from "./fields"

/**
 * « نسيت كلمة السر » — the real reset, both steps on one screen as the site
 * does it: the phone, then the code that arrived with a new password. The
 * copy is the site's, word for word, down to « ما وصلنيش الكود » and the
 * request it files with the office when the SMS never lands.
 *
 * The code is not sent anywhere here — the prototype prints it instead.
 */
export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const signInAs = useAuth((s) => s.signInAs)
  const [step, setStep] = useState<"phone" | "code">("phone")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const [wait, setWait] = useState(0)
  // The escape hatch: « ما وصلنيش الكود » → ask the office to call back.
  const [assist, setAssist] = useState(false)
  const [assistName, setAssistName] = useState("")
  const [assistSent, setAssistSent] = useState(false)

  useEffect(() => {
    if (wait <= 0) return
    const t = setInterval(() => setWait((w) => (w <= 1 ? 0 : w - 1)), 1000)
    return () => clearInterval(t)
  }, [wait])

  function send(e?: FormEvent) {
    e?.preventDefault()
    const res = sendResetCode(phone)
    if (!res.ok) {
      setError(res.error)
      setNote(null)
      sfx("error")
      return
    }
    setError(null)
    setNote(res.message)
    setWait(RESEND_AFTER_S)
    setStep("code")
    sfx("send")
  }

  function reset(e: FormEvent) {
    e.preventDefault()
    const res = resetPassword(phone, code, password)
    if (!res.ok) {
      setError(res.error)
      setNote(null)
      sfx("error")
      return
    }
    setError(null)
    sfx("success")
    signInAs(res.user)
    navigate("/student-v2")
  }

  function fileAssist() {
    if (assistName.trim().length < 3) return
    setAssistSent(true)
    sfx("send")
  }

  return (
    <AuthFrame>
      <AuthHead
        kicker="ما تقلقش"
        title="نسيت كلمة السر"
        note={step === "phone" ? "أكتب نومروك: نبعثولك كود في رسالة." : "أكتب الكود اللي وصلك واختار كلمة سر جديدة."}
      />

      <div className="mx-auto mt-8 w-full md:mt-12 lg:mt-[60px] lg:w-[72%]">
        {step === "phone" ? (
          <form onSubmit={send} className={stackGap} noValidate>
            <Field label="رقم الهاتف:">
              {(id) => (
                <input
                  id={id}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  className={inputClass}
                  placeholder="التليفون (مثال 20123456)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoFocus
                  required
                />
              )}
            </Field>

            {error && (
              <FormError>
                <AlertCircle className="mt-0.5 size-4 shrink-0 lg:size-5" strokeWidth={2} />
                {error}
              </FormError>
            )}

            <button type="submit" className={authCta}>
              ابعث الكود
            </button>
          </form>
        ) : (
          <form onSubmit={reset} className={stackGap} noValidate>
            <div>
              <label htmlFor="otp" className={labelClass}>
                الكود:
              </label>
              <input
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                dir="ltr"
                className={`${inputClass} text-center tracking-[0.4em]`}
                placeholder="_ _ _ _ _ _"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                autoFocus
              />
            </div>

            <PasswordField
              label="كلمة سر جديدة:"
              placeholder={`كلمة سر جديدة (${MIN_PASSWORD} حروف على الأقل)`}
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
            />

            {error ? (
              <FormError>
                <AlertCircle className="mt-0.5 size-4 shrink-0 lg:size-5" strokeWidth={2} />
                {error}
              </FormError>
            ) : (
              note && (
                <FormNote>
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 lg:size-5" strokeWidth={2} />
                  {note}
                </FormNote>
              )
            )}

            <button type="submit" disabled={code.length < 4 || password.length < MIN_PASSWORD} className={authCta}>
              سجّل كلمة السر الجديدة
            </button>

            <div className="!mt-6 space-y-4 text-center lg:!mt-8">
              <button
                type="button"
                disabled={wait > 0}
                data-uisfx="send"
                onClick={() => send()}
                className="text-[calc(11px*var(--ts))] font-bold text-v2-brand transition hover:underline disabled:text-v2-ink/40 disabled:no-underline md:text-[calc(13px*var(--ts))] lg:text-[calc(17px*var(--ts))]"
              >
                {wait > 0 ? `أرجع ابعث الكود (${wait}s)` : "أرجع ابعث الكود"}
              </button>

              {assist ? (
                <div className="rounded-2xl border border-v2-ink/15 bg-v2-ink/[0.03] p-4 text-start lg:p-6">
                  {assistSent ? (
                    <p className="flex items-center gap-2 text-[calc(11px*var(--ts))] font-bold text-v2-brand md:text-[calc(13px*var(--ts))] lg:text-[calc(17px*var(--ts))]">
                      <CheckCircle2 className="size-5 shrink-0" strokeWidth={2} />
                      وصل طلبك للإدارة — بش يتصلو بيك.
                    </p>
                  ) : (
                    <>
                      <p className="text-[calc(11px*var(--ts))] font-bold text-v2-ink md:text-[calc(13.5px*var(--ts))] lg:text-[calc(18px*var(--ts))]">
                        اطلب من الإدارة كلمة سر جديدة
                      </p>
                      <p className="mb-3 mt-1 text-[calc(9.5px*var(--ts))] leading-relaxed text-v2-ink/60 md:text-[calc(11.5px*var(--ts))] lg:text-[calc(14px*var(--ts))]">
                        أكتب اسمك ولقبك، والإدارة تتصل بيك على{" "}
                        <bdi dir="ltr" className="font-bold text-v2-ink">
                          {normalizePhone(phone)}
                        </bdi>{" "}
                        وتعطيك كلمة سر جديدة.
                      </p>
                      <input
                        className={inputClass}
                        placeholder="الاسم واللقب"
                        value={assistName}
                        onChange={(e) => setAssistName(e.target.value)}
                      />
                      <button
                        type="button"
                        disabled={assistName.trim().length < 3}
                        onClick={fileAssist}
                        className={`${authCta} mt-4 lg:w-full`}
                      >
                        ابعث الطلب
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  data-uisfx="expand"
                  onClick={() => setAssist(true)}
                  className="block w-full text-[calc(10.5px*var(--ts))] font-medium text-v2-ink/60 transition hover:text-v2-ink hover:underline md:text-[calc(12.5px*var(--ts))] lg:text-[calc(15px*var(--ts))]"
                >
                  ما وصلنيش الكود
                </button>
              )}
            </div>

            <DemoHint>
              نسخة تجريبية — ما فما حتى رسالة. الكود هو{" "}
              <bdi dir="ltr" className="font-bold tracking-[0.2em] text-v2-ink">
                {DEMO_CODE}
              </bdi>
            </DemoHint>
          </form>
        )}

        <p className={`${footLine} mt-8 lg:mt-10`}>
          <Link
            to="/connexion"
            data-uisfx="back"
            className="inline-flex items-center gap-2 font-semibold transition hover:text-v2-ink"
          >
            <ArrowRight className="size-4 lg:size-5" strokeWidth={2} />
            أرجع للدخول
          </Link>
        </p>
      </div>
    </AuthFrame>
  )
}
