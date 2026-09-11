import usersSeed from "@/data/seed/users.json"
import yearsSeed from "@/data/seed/years.json"
import subjectsSeed from "@/data/seed/subjects.json"
import type { Subject, User, Year } from "@/data/types"

/**
 * The élève's front door — « تسجيل دخول », « أعمل كونط », « نسيت كلمة السر ».
 *
 * The FLOW is the real one (student.waelacademy.com, walked step by step):
 * identifier + password, a registration that asks name / phone / level /
 * optional subject / password and signs you in straight away, and a password
 * reset in two steps — phone, then a 6-digit code + a new password, with a
 * « ما وصلنيش الكود » escape hatch that files a request with the office.
 * Its wording is kept where we could read it verbatim.
 *
 * The BACKEND is not: this is the prototype, so accounts live in memory on top
 * of `users.json` and the SMS is printed on screen instead of sent. Nothing is
 * persisted — a refresh puts the seed back, as everywhere else here.
 */

const USERS = usersSeed as unknown as User[]
const YEARS = yearsSeed as unknown as Year[]
const SUBJECTS = subjectsSeed as unknown as Subject[]

/** The one account the demo ships with — the élève every other screen shows. */
export const DEMO_ACCOUNT = {
  phone: "29340118",
  password: "wael1234",
}

/** The 6 digits the fake SMS always carries, so the reset can be walked through. */
export const DEMO_CODE = "123456"

/** Seconds before « أرجع ابعث الكود » lights up again — the real API's value. */
export const RESEND_AFTER_S = 60

export const MIN_PASSWORD = 8

/** The levels the sign-up list offers, in the order the curriculum runs. */
export const LEVELS: Year[] = [...YEARS].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

/** The « مادة اختيارية » of a level — empty for the levels that have none. */
export function optionalSubjects(yearId: string): Subject[] {
  return SUBJECTS.filter((s) => s.yearId === yearId && s.category === "optionnelle")
}

/** « +216 29 340 118 », « 29 340 118 », « 29340118 » — all the same number. */
export function normalizePhone(raw: string): string {
  return raw.replace(/[\s\-().]/g, "").replace(/^(\+?216)/, "")
}

/** Accounts added during the session, on top of the seed. */
const created: { phone: string; password: string; user: User }[] = []

function findByIdentifier(raw: string): User | undefined {
  const id = raw.trim()
  const phone = normalizePhone(id)
  const made = created.find((a) => a.phone === phone)
  if (made) return made.user
  return USERS.find(
    (u) =>
      u.role === "student" &&
      ((u.phone && normalizePhone(u.phone) === phone) || (!!u.email && u.email.toLowerCase() === id.toLowerCase())),
  )
}

/** Does this number already have an account? (sign-up + reset both ask.) */
export function phoneTaken(raw: string): boolean {
  return !!findByIdentifier(raw)
}

export type Result = { ok: true; user: User } | { ok: false; error: string }

/**
 * The demo's password rule: the seeded élève has the one password printed on
 * the login card; an account made during the session keeps what it was given.
 */
export function signIn(identifier: string, password: string): Result {
  if (!identifier.trim()) return { ok: false, error: "أكتب نومرو تليفونك ولا الإيميل متاعك." }
  if (!password) return { ok: false, error: "أكتب كلمة السر." }
  const user = findByIdentifier(identifier)
  if (!user) return { ok: false, error: "ما لقيناش كونط بالمعطيات هاذي." }
  const made = created.find((a) => a.user.id === user.id)
  const expected = made ? made.password : DEMO_ACCOUNT.password
  if (password !== expected) return { ok: false, error: "كلمة السر ماهيش صحيحة." }
  return { ok: true, user }
}

export function register(input: {
  fullName: string
  phone: string
  levelId: string
  optionalSubjectId?: string
  password: string
}): Result {
  const fullName = input.fullName.trim()
  const phone = normalizePhone(input.phone)
  if (fullName.length < 2) return { ok: false, error: "أكتب اسمك الكامل." }
  if (phone.length < 8) return { ok: false, error: "أكتب نومرو تليفونك." }
  if (!input.levelId) return { ok: false, error: "اختار المستوى متاعك." }
  if (input.password.length < MIN_PASSWORD) {
    return { ok: false, error: `كلمة السر لازمها ${MIN_PASSWORD} حروف على الأقل.` }
  }
  if (phoneTaken(phone)) return { ok: false, error: "النومرو هذا عندو كونط. أدخل بيه." }

  const user: User = {
    id: crypto.randomUUID(),
    name: fullName,
    role: "student",
    phone: `+216 ${phone}`,
    yearIds: [input.levelId],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: [],
  }
  created.push({ phone, password: input.password, user })
  return { ok: true, user }
}

export type SendResult = { ok: true; message: string } | { ok: false; error: string }

/** Step one of the reset — the real screen's own checks and wording. */
export function sendResetCode(phone: string): SendResult {
  if (phone.trim().length < 6) return { ok: false, error: "أكتب نومرو تليفونك." }
  if (!phoneTaken(phone)) return { ok: false, error: "الرقم هذا ما عندوش حساب." }
  return { ok: true, message: `بعثنالك كود في رسالة على ${normalizePhone(phone)}.` }
}

/** Step two — the code, then the new password. */
export function resetPassword(phone: string, code: string, password: string): Result {
  if (code !== DEMO_CODE) return { ok: false, error: "الكود ماهوش صحيح ولا فات وقتو. أطلب كود جديد." }
  if (password.length < MIN_PASSWORD) {
    return { ok: false, error: `كلمة السر لازمها ${MIN_PASSWORD} حروف على الأقل.` }
  }
  const user = findByIdentifier(phone)
  if (!user) return { ok: false, error: "ما نجّمناش نبدّلو كلمة السر." }
  const made = created.find((a) => a.user.id === user.id)
  if (made) made.password = password
  else created.push({ phone: normalizePhone(phone), password, user })
  return { ok: true, user }
}
