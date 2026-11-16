/**
 * The matière inside a subject name.
 *
 * A Subject row is scoped to its année, so two rows can carry the same matière
 * ("رياضيات" in باك رياضيات and in باك علوم). The BAC rows now say which filière
 * they belong to in their own name — « Bac Math - SVT », « Bac Lettres - عربية »
 * — because that is how the catalogue on the clé names them and how the admin
 * reads a flat list of matières.
 *
 * Everything that DRAWS a matière is keyed by the matière alone: its badge, the
 * doodles behind it, the colour its card is tinted with, its French label. That
 * art belongs to the matière, not to the filière — SVT is the same drawing in
 * every bac — so those maps must never see the « Bac X - » prefix. This module
 * is the single place that takes it off, and the single place that says which
 * catalogue spelling means which seeded matière.
 */

/**
 * The matière part of a subject name: « Bac Sciences - SVT » → « SVT ».
 * A name without the prefix (every collège / secondaire row) comes back whole.
 */
export function matiereOf(name: string): string {
  if (!name.startsWith("Bac ")) return name
  const i = name.indexOf(" - ")
  return i > 0 ? name.slice(i + 3) : name
}

/**
 * Catalogue spelling → the name the art maps are keyed by.
 *
 * The clé writes its matières the way the professeurs do — French for the
 * scientific ones, Arabic for the others — while the seed writes them all in
 * Arabic. Same matière, two spellings; this reconciles them so a renamed bac
 * subject keeps the drawing it always had.
 *
 * Programmation takes the informatique badge and Algorithmique the algo one:
 * Bac Info carries both, and giving them one drawing would make the two cards
 * twins. What is genuinely undrawn (Chinois, Dessin, Musique, Portugais, Russe,
 * Turc, Italien, STI, مع وائل) stays unmapped and falls through to a portrait.
 */
const SEED_NAME: Record<string, string> = {
  Maths: "رياضيات",
  Physique: "علوم فيزيائية",
  SVT: "علوم الحياة والأرض",
  Français: "فرنسية",
  Anglais: "أنڤليزية",
  Arabe: "عربية",
  Informatique: "إعلامية",
  Programmation: "إعلامية",
  Algorithmique: "خوارزميات",
  Économie: "اقتصاد",
  Gestion: "تصرّف",
  Mécanique: "ميكانيك",
  Electrique: "كهرباء",
  STI: "تكنولوجيا",
  Allemand: "ألمانية",
  Espagnol: "إسبانية",
  // The seed teaches history and geography as one matière; the clé splits them,
  // and both point at the same globe.
  "تاريخ": "تاريخ وجغرافيا",
  "جغرافيا": "تاريخ وجغرافيا",
  // The clé drops the hamza the seed writes.
  "تفكير اسلامي": "تفكير إسلامي",
}

/**
 * The key a matière's art is filed under — the prefix removed and the spelling
 * normalised. Anything already written the seed's way comes back untouched, so
 * the collège and secondaire matières resolve exactly as before.
 */
export function matiereKey(name: string): string {
  const m = matiereOf(name)
  return SEED_NAME[m] ?? m
}
