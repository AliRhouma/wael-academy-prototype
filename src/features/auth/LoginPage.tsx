import { useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AlertCircle } from "lucide-react"
import { useAuth } from "@/stores/useAuth"
import { sfx } from "@/features/student-v2/sound"
import { AuthFrame, AuthHead } from "./AuthFrame"
import { DEMO_ACCOUNT, signIn } from "./auth"
import { DemoHint, Field, FormError, PasswordField, authCta, footLine, footLink, inputClass, stackGap } from "./fields"
import arrow from "../../../svg icons/doodles/auth-arrow.svg"

/**
 * « تسجيل دخول » — the frame as drawn: the welcome in the brand ramp, two
 * boxes, the reset link hugging the end of the second one, the lime button,
 * and the switch to sign-up under it. The hand-drawn arrow between the link
 * and the button is the designer's, kept where it was put.
 *
 * The field takes what the real login takes — a phone number OR an email —
 * so the label names both instead of the frame's « البريد الإلكتروني ».
 */
export default function LoginPage() {
  const navigate = useNavigate()
  const signInAs = useAuth((s) => s.signInAs)
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  function submit(e: FormEvent) {
    e.preventDefault()
    const res = signIn(identifier, password)
    if (!res.ok) {
      setError(res.error)
      sfx("error")
      return
    }
    setError(null)
    sfx("connect")
    signInAs(res.user)
    navigate("/student-v2")
  }

  return (
    <AuthFrame>
      <AuthHead title="تسجيل دخول" />

      <form onSubmit={submit} className="mx-auto mt-7 w-full md:mt-[45px]" noValidate>
        <div className={stackGap}>
          <Field label="رقم الهاتف ولّا الإيميل:">
            {(id) => (
              <input
                id={id}
                type="text"
                inputMode="email"
                autoComplete="username"
                className={inputClass}
                placeholder="رقم الهاتف (مثال 20123456)"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoFocus
                required
              />
            )}
          </Field>

          <div>
            <PasswordField
              label="كلمة السر:"
              placeholder="كلمة السر"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
            />
            <div className="relative mt-3 md:mt-[23px]">
              <Link
                to="/mot-de-passe-oublie"
                data-uisfx="forward"
                className="block text-start text-[calc(10px*var(--ts))] font-semibold text-v2-ink transition hover:text-v2-brand md:text-[calc(10.75px*var(--ts))]"
              >
                نسيت كلمة السر؟
              </Link>
              {/* The frame's pen mark — it leans off the link toward the
                  button. Decoration only, and only where there's room. */}
              <span
                aria-hidden
                className="pointer-events-none absolute hidden bg-v2-ink md:block"
                style={{
                  // Physical, not logical: the pen mark is drawn at x 1139 of
                  // the 1097-wide field column, i.e. hard against its right.
                  right: "4.7%",
                  top: "120%",
                  width: "7.1%",
                  aspectRatio: "78 / 112",
                  maskImage: `url("${arrow}")`,
                  WebkitMaskImage: `url("${arrow}")`,
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                }}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-5 md:mt-6">
            <FormError>
              <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
              {error}
            </FormError>
          </div>
        )}

        <div className="mt-7 md:mt-9">
          <button type="submit" className={authCta}>
            تسجيل دخول
          </button>
        </div>

        <p className={`${footLine} mt-5 md:mt-[17px]`}>
          ما عندكش كونط؟{" "}
          <Link to="/inscription" data-uisfx="forward" className={footLink}>
            أعمل كونط
          </Link>
        </p>

        <div className="mx-auto mt-7 max-w-[26rem]">
          <DemoHint>
            نسخة تجريبية — أدخل بـ <bdi dir="ltr" className="font-bold text-v2-ink">{DEMO_ACCOUNT.phone}</bdi> وكلمة السر{" "}
            <bdi dir="ltr" className="font-bold text-v2-ink">{DEMO_ACCOUNT.password}</bdi>
          </DemoHint>
        </div>
      </form>
    </AuthFrame>
  )
}
