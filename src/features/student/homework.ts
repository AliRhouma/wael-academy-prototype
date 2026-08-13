import type { Teacher } from "@/data/types"

/**
 * "مسيو مراد" — how the élève actually names their prof.
 *
 * The honorific is gendered off the teacher's `civility`, and the first name
 * alone is what anyone says out loud; the family name would only cost the width
 * a card doesn't have. Shared by every surface that shows a خدمة (the dashboard
 * rail, the séance sheet) so the prof is named the same way everywhere.
 */
export function profName(teacher?: Teacher): string {
  if (!teacher) return "البروف"
  const first = teacher.name.split(" ")[0]
  return `${teacher.civility === "f" ? "مدام" : "مسيو"} ${first}`
}
