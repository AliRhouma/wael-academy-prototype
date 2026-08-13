/**
 * Typeface registry for the experimentation phase.
 *
 * Each entry is a candidate type system. `cairo` is the built-in default that
 * lives on :root in src/styles/fonts.css; every other id maps to a
 * `[data-font="<id>"]` block in that same file. The FontDock reads this list to
 * render the switcher, and <Providers> writes the chosen id to `data-font` on
 * <html>.
 *
 * ADD A FACE: @font-face it (if local) and add its `[data-font]` block to
 * fonts.css, then add a row here. `preview` is the dock's specimen — it renders
 * in the face itself, which is the only honest way to compare typefaces.
 */
export type FontId = "cairo" | "roboto" | "tarif-all" | "tarif" | "playpen" | "lemon" | "cause"

export interface FontMeta {
  id: FontId
  name: string
  hint: string
  /** The stack to render this row's specimen in — mirrors its fonts.css block. */
  preview: string
  /** Shown as a warning chip in the dock (licensing, legibility…). */
  caveat?: string
}

const CAIRO = '"Cairo", system-ui, sans-serif'
const TARIF = '"Tarif Arabic", "Cairo", system-ui, sans-serif'

export const FONTS: FontMeta[] = [
  {
    id: "cairo",
    name: "Cairo",
    hint: "الحالي · عربي ولاتيني، أوزان حقيقية 200–1000",
    preview: CAIRO,
  },
  {
    id: "roboto",
    name: "Roboto + Noto Sans Arabic",
    hint: "Roboto ما فيهش عربي — اللاتيني والأرقام منّو، والعربي من Noto",
    preview: '"Roboto", "Noto Sans Arabic", system-ui, sans-serif',
    caveat: "بلا عربي",
  },
  {
    id: "tarif-all",
    name: "Tarif Arabic — الكل",
    hint: "إكسترابولد في كل بلاصة · الأرقام من Cairo",
    preview: TARIF,
    caveat: "وزن وحيد",
  },
  {
    id: "tarif",
    name: "Tarif Arabic — العناوين",
    hint: "عناوين Tarif + متن Cairo — أخفّ على الشاشات المليانة",
    preview: TARIF,
  },
  {
    id: "playpen",
    name: "Playpen Sans Arabic",
    hint: "مكتوب باليدّ، دافي ومدوّر · أوزان حقيقية 400–800",
    preview: '"Playpen Sans Arabic", system-ui, sans-serif',
  },
  {
    id: "lemon",
    name: "Lemon Brush — العناوين",
    hint: "خطّ فرشاة للعناوين + متن Cairo",
    preview: '"Lemon Brush Arabic", "Lemon Brush Texture", "Cairo", system-ui, sans-serif',
    caveat: "استعمال شخصي برك",
  },
  {
    id: "cause",
    name: "Cause + Rubik",
    hint: "النظام الأصلي — Cause للاتيني، Tajawal للعربي",
    preview: '"Cause", "Tajawal", system-ui, sans-serif',
  },
]

/** The face a fresh visitor gets (saved choices in localStorage win). */
export const DEFAULT_FONT: FontId = "cairo"
