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
    name: "Chaleureux",
    hint: "Actuel · vert-teal-navy + or",
    swatch: ["#0f8079", "#1a9e6e", "#173f6d", "#c98a00"],
  },
  {
    id: "azure",
    name: "Azure",
    hint: "Froid · navy royal + azur + pervenche",
    swatch: ["#1e88e5", "#2aa795", "#101f5c", "#5b6ad8"],
  },
  {
    id: "azure2",
    name: "Azure v2",
    hint: "Dégradé bleu-cyan dominant (sans plongée navy)",
    swatch: ["#25cbe8", "#1e88e5", "#2a5bd0", "#5b6ad8"],
  },
  {
    id: "medina",
    name: "Médina",
    hint: "Chaud · terre cuite, olivier & safran",
    swatch: ["#c25a38", "#7f8a3d", "#1f5f5a", "#d98e15"],
  },
  {
    id: "crepuscule",
    name: "Crépuscule",
    hint: "Bijou · violet, sarcelle & rose",
    swatch: ["#7b50de", "#17b3a3", "#34206b", "#ef5f8f"],
  },
  {
    id: "cyan",
    name: "Cyan",
    hint: "Frais · turquoise électrique, menthe & corail",
    swatch: ["#069fbe", "#10b981", "#103c52", "#f97362"],
  },
  {
    id: "cyan2",
    name: "Cyan v2",
    hint: "Dégradé menthe-aqua dominant (sans plongée deep teal)",
    swatch: ["#2ad9b0", "#10b981", "#103c52", "#f97362"],
  },
  {
    id: "cyan3",
    name: "Cyan v3",
    hint: "Dégradé menthe printemps lumineux (encore plus clair/vert que v2)",
    swatch: ["#33e2b4", "#10b981", "#103c52", "#f97362"],
  },
  {
    id: "cyan4",
    name: "Cyan v4",
    hint: "Menthe↔cyan 50/50 · palette complète accordée (calendrier, fonds, icônes)",
    swatch: ["#0aa6c2", "#15c29a", "#1c4a7a", "#f97362"],
  },
  {
    id: "sarcelle",
    name: "Sarcelle",
    hint: "Serein · sarcelle profond, or antique & crème",
    swatch: ["#147e7d", "#17a07d", "#123e42", "#c19a3f"],
  },
  {
    id: "recif",
    name: "Récif",
    hint: "Éditorial · sarcelle pétrole, corail & crème",
    swatch: ["#187a87", "#159c86", "#123f47", "#ef8a72"],
  },
  {
    id: "tonique",
    name: "Tonique",
    hint: "Vif · cobalt, ambre & corail sur blanc",
    swatch: ["#2f6db5", "#3a9b5c", "#1c3f75", "#f5b62c"],
  },
  {
    id: "lagon",
    name: "Lagon",
    hint: "Aérien · turquoise doux, menthe & orange",
    swatch: ["#1fa298", "#17b78d", "#14524e", "#f2953f"],
  },
  {
    id: "aigue",
    name: "Aigue-marine",
    hint: "Fusion Azure/Cyan/Lagon · vert-bleu vif, sans être vert",
    swatch: ["#08a6a0", "#14b98c", "#123f4a", "#f58450"],
  },
]

// TEMP: forced to Tonique while the palette switcher is hidden. Restore to
// "warm" (and re-enable <PaletteDock/> in providers.tsx) when done demoing.
export const DEFAULT_PALETTE: PaletteId = "tonique"
