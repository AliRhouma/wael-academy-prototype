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
 * Same card as the login, one column like the frame: at half scale five boxes
 * stack into an ordinary page height, so there is nothing to pair up.
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

      <form onSubmit={submit} className="mx-auto mt-7 w-full md:mt-[30px]" noValidate>
        <div className={stackGap}>
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
          ) : null}

          <div>
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
          <div className="mt-5 md:mt-6">
            <FormError>
              <AlertCircle className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
              {error}
            </FormError>
          </div>
        )}

        <div className="mt-7 md:mt-9">
          <button type="submit" className={authCta}>
            أعمل كونط
          </button>
        </div>

        <p className={`${footLine} mt-5 md:mt-[17px]`}>
          عندك كونط؟{" "}
          <Link to="/connexion" data-uisfx="back" className={footLink}>
            تسجيل الدخول
          </Link>
        </p>
      </form>
    </AuthFrame>
  )
}
