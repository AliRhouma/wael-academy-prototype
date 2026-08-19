/**
 * Palette registry for the experimentation phase.
 *
 * Each entry is a candidate color system. `warm` is the built-in default that
 * lives in src/styles/index.css; every other id maps to a `[data-palette="<id>"]`
 * block in src/styles/palettes.css. The PaletteDock reads this list to render
 * the switcher, and <Providers> writes the chosen id to `data-palette` on <html>.
 *
 * ADD A PALETTE: add its token blocks to palettes.css, then add a row here.
 * `swatch` is just the dock preview (brand · green · deep · accent) — order it
 * so the four dots read as the palette at a glance.
 */
export type PaletteId = "warm" | "azure" | "azure2" | "medina" | "crepuscule" | "cyan" | "cyan2" | "cyan3" | "cyan4" | "sarcelle" | "recif" | "tonique" | "lagon" | "aigue"

export interface PaletteMeta {
  id: PaletteId
  name: string
  hint: string
  swatch: [string, string, string, string]
}

export const PALETTES: PaletteMeta[] = [
  {
    id: "warm",
    name: "دافي",
    hint: "الحالي · أخضر-تركوازي-كحلي + ذهبي",
    swatch: ["#0f8079", "#1a9e6e", "#173f6d", "#c98a00"],
  },
  {
    id: "azure",
    name: "أزور",
    hint: "بارد · كحلي ملكي + أزور + بنفسجي فاتح",
    swatch: ["#1e88e5", "#2aa795", "#101f5c", "#5b6ad8"],
  },
  {
    id: "azure2",
    name: "أزور v2",
    hint: "تدرّج أزرق-سماوي غالب (بلا نزول للكحلي)",
    swatch: ["#25cbe8", "#1e88e5", "#2a5bd0", "#5b6ad8"],
  },
  {
    id: "medina",
    name: "مدينة",
    hint: "سخون · فخّار، زيتوني وزعفران",
    swatch: ["#c25a38", "#7f8a3d", "#1f5f5a", "#d98e15"],
  },
  {
    id: "crepuscule",
    name: "غروب",
    hint: "جوهرة · بنفسجي، أزرق مخضرّ ووردي",
    swatch: ["#7b50de", "#17b3a3", "#34206b", "#ef5f8f"],
  },
  {
    id: "cyan",
    name: "سماوي",
    hint: "بارد · تركوازي قوي، نعناع ومرجاني",
    swatch: ["#069fbe", "#10b981", "#103c52", "#f97362"],
  },
  {
    id: "cyan2",
    name: "سماوي v2",
    hint: "تدرّج نعناع-مائي غالب (بلا نزول للتركوازي الغامق)",
    swatch: ["#2ad9b0", "#10b981", "#103c52", "#f97362"],
  },
  {
    id: "cyan3",
    name: "سماوي v3",
    hint: "تدرّج نعناع ربيعي مضوّي (أفتح وأخضر من v2)",
    swatch: ["#33e2b4", "#10b981", "#103c52", "#f97362"],
  },
  {
    id: "cyan4",
    name: "سماوي v4",
    hint: "نعناع↔سماوي 50/50 · لوحة كاملة متناسقة (روزنامة، خلفيات، أيقونات)",
    swatch: ["#0aa6c2", "#15c29a", "#1c4a7a", "#f97362"],
  },
  {
    id: "sarcelle",
    name: "أزرق مخضرّ",
    hint: "هادي · أزرق مخضرّ غامق، ذهب عتيق وكريمي",
    swatch: ["#147e7d", "#17a07d", "#123e42", "#c19a3f"],
  },
  {
    id: "recif",
    name: "شعاب",
    hint: "تحريري · أزرق بترولي، مرجاني وكريمي",
    swatch: ["#187a87", "#159c86", "#123f47", "#ef8a72"],
  },
  {
    id: "tonique",
    name: "منعش",
    hint: "حيّ · كوبالت، عنبري ومرجاني على أبيض",
    swatch: ["#2f6db5", "#3a9b5c", "#1c3f75", "#f5b62c"],
  },
  {
    id: "lagon",
    name: "لاڤون",
    hint: "هوائي · تركوازي ناعم، نعناع وبرتقالي",
    swatch: ["#1fa298", "#17b78d", "#14524e", "#f2953f"],
  },
  {
    id: "aigue",
    name: "زبرجد",
    hint: "مزيج أزور/سماوي/لاڤون · أخضر-أزرق حيّ، بلا ما يولّي أخضر",
    swatch: ["#08a6a0", "#14b98c", "#123f4a", "#f58450"],
  },
]

/** The palette a fresh visitor gets (saved choices in localStorage win). */
export const DEFAULT_PALETTE: PaletteId = "azure"
