import { useMemo, useState, type FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AlertCircle, ChevronDown } from "lucide-react"
import { useAuth } from "@/stores/useAuth"
import { sfx } from "@/features/student-v2/sound"
import { AuthFrame, AuthHead } from "./AuthFrame"
import { LEVELS, MIN_PASSWORD, optionalSubjects, register } from "./auth"
import {
  Field,
  FormError,
  PasswordField,
  SelectField,
  authCta,
  footLine,
  footLink,
  inputClass,
  stackGap,
} from "./fields"

/**
 * « أعمل كونط » — the real sign-up, field for field: full name, phone, level,
 * the level's optional matière when it has one, password. The account is made
 * and the élève walks straight into the space, exactly as the site does it.
 *
 * Same card as the login, one departure: five boxes stacked in a 1200-wide
 * card would make it twice as tall as the frame, so they pair up in two
 * columns from `lg` — the card keeps the frame's height instead of its column
 * count, which is what makes it read as the same screen.
 */
export default function RegisterPage() {
  const navigate = useNavigate()
  const signInAs = useAuth((s) => s.signInAs)
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [levelId, setLevelId] = useState("")
  const [optionalId, setOptionalId] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const options = useMemo(() => (levelId ? optionalSubjects(levelId) : []), [levelId])

  function submit(e: FormEvent) {
    e.preventDefault()
    const res = register({ fullName, phone, levelId, optionalSubjectId: optionalId || undefined, password })
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
      <AuthHead title="أعمل كونط" note="دقيقة وحدة وتولّي عندك فضاءك: الحصص المباشرة، التسجيلات، والتمارين." />

      <form onSubmit={submit} className="mx-auto mt-8 w-full md:mt-12 lg:mt-[60px]" noValidate>
        <div className={`${stackGap} lg:grid lg:grid-cols-2 lg:gap-x-12 lg:gap-y-[42px] lg:space-y-0`}>
          <Field label="الاسم الكامل:">
            {(id) => (
              <input
                id={id}
                type="text"
                dir="auto"
                autoComplete="name"
                className={inputClass}
                placeholder="الاسم واللقب"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoFocus
                required
                minLength={2}
              />
            )}
          </Field>

          <Field label="رقم الهاتف:">
            {(id) => (
              <input
                id={id}
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                className={inputClass}
                placeholder="رقم الهاتف (مثال 20123456)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            )}
          </Field>

          <SelectField
            label="المستوى:"
            value={levelId}
            onChange={(v) => {
              setLevelId(v)
              setOptionalId("")
            }}
            placeholder="اختار المستوى…"
            options={LEVELS}
            icon={ChevronDown}
            required
          />

          {/* Only the levels that actually have one ask for it — same rule as
              the real form, which hides the box when the list comes back empty. */}
          {options.length > 0 ? (
            <SelectField
              label="المادة الاختيارية:"
              value={optionalId}
              onChange={setOptionalId}
              placeholder="اختار المادة…"
              options={options}
              icon={ChevronDown}
            />
          ) : (
            <div aria-hidden className="hidden lg:block" />
          )}

          <div className="lg:col-span-2 lg:mx-auto lg:w-[calc(50%-1.5rem)]">
            <PasswordField
              label="كلمة السر:"
              placeholder={`كلمة السر (${MIN_PASSWORD} حروف على الأقل)`}
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
            />
          </div>
        </div>

        {error && (
          <div className="mt-6 lg:mt-10">
            <FormError>
              <AlertCircle className="mt-0.5 size-4 shrink-0 lg:size-5" strokeWidth={2} />
              {error}
            </FormError>
          </div>
        )}

        <div className="mt-8 md:mt-10 lg:mt-[56px]">
          <button type="submit" className={authCta}>
            أعمل كونط
          </button>
        </div>

        <p className={`${footLine} mt-6 md:mt-8 lg:mt-[34px]`}>
          عندك كونط؟{" "}
          <Link to="/connexion" data-uisfx="back" className={footLink}>
            تسجيل الدخول
          </Link>
        </p>
      </form>
    </AuthFrame>
  )
}
