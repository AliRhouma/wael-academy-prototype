import { useAuth } from "@/stores/useAuth"
import type { Role } from "@/data/types"

/**
 * The app is BILINGUAL by role, not by preference.
 *
 * The élève space is the product's public face and stays in Tunisian Arabic —
 * that is who it is written for. The back-office (الإدارة, أستاذ, ولي) runs in
 * French, which is what the academy's staff and parents actually work in. So
 * the language is a property of the ROLE, decided here once, and everything
 * downstream reads it rather than guessing.
 *
 * Direction follows language: Arabic RTL, French LTR. `RoleLayout` stamps both
 * on <html> when the role resolves.
 */
export type Locale = "ar" | "fr"

const BY_ROLE: Record<Role, Locale> = {
  student: "ar",
  admin: "fr",
  teacher: "fr",
  parent: "fr",
}

export const localeOf = (role: Role | null): Locale => (role ? BY_ROLE[role] : "ar")

export const dirOf = (locale: Locale) => (locale === "ar" ? "rtl" : "ltr")

/** BCP-47 tag used for dates and number formatting. */
export const tagOf = (locale: Locale) => (locale === "ar" ? "ar-TN-u-nu-latn" : "fr-TN")

/**
 * The locale of the space currently on screen. Shared components (the kit, the
 * shared/ screens) call this instead of hardcoding Arabic, because several of
 * them — « كوداتي » / « Mes codes » above all — render in BOTH spaces.
 */
export function useLocale(): Locale {
  return localeOf(useAuth((s) => s.currentRole))
}
