/**
 * Écrit `docs/drouss-data.js` : le programme du prototype, emboîté et mis en
 * forme comme « chapitres-data.js » de la clé.
 *
 *     bac → matière → chapitre → item {id, type, title, refs}
 *
 * Même forme d'item que le catalogue, pour qu'on puisse lire les deux fichiers
 * côte à côte : un identifiant, un genre, un titre, et la liste des codes de
 * fichiers. Les codes des VIDÉOS sont dans le seed ; ceux des DOCUMENTS n'y
 * sont pas encore, ils sont repris de `docs/medias-prototype.csv`.
 *
 *     npm run drouss:data
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const PROJ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const SEED = path.join(PROJ, "src/data/seed")
const OUT = path.join(PROJ, "docs/drouss-data.js")
const read = (f) => JSON.parse(fs.readFileSync(path.join(SEED, f), "utf8"))

const years = read("years.json")
const subjects = read("subjects.json")
const chapters = read("chapters.json")
const lessons = read("lessons.json")

/* ---------- les codes des documents, repris du CSV ---------- */
const csv = fs.readFileSync(path.join(PROJ, "docs/medias-prototype.csv"), "utf8")
const docRefs = new Map() // id du contenu → [codes]
for (const line of csv.split(/\r?\n/).slice(1)) {
  if (!line.trim()) continue
  // Un champ peut être entre guillemets et contenir le point-virgule.
  const cells = line.match(/(?:^|;)("(?:[^"]|"")*"|[^;]*)/g).map((c) => {
    const v = c.replace(/^;/, "")
    return v.startsWith('"') ? v.slice(1, -1).replace(/""/g, '"') : v
  })
  const [, , , , , , media, ref, , , , lessonId] = cells
  if (!lessonId || media !== "document" || ref === "—" || !ref) continue
  docRefs.set(lessonId, [...(docRefs.get(lessonId) ?? []), ref])
}

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0)

const bacs = years
  .filter((y) => y.cycle === "bac")
  .sort(byOrder)
  .map((year) => ({
    id: year.id,
    name: year.name,
    matieres: subjects
      .filter((s) => s.yearId === year.id)
      .sort(byOrder)
      .map((subject) => ({
        id: subject.id,
        name: subject.name,
        chapitres: chapters
          .filter((c) => c.subjectIds.includes(subject.id))
          .sort(byOrder)
          .map((chapter) => ({
            id: chapter.id,
            name: chapter.name,
            items: lessons
              .filter((l) => l.chapterId === chapter.id)
              .sort(byOrder)
              .map((l) => ({
                id: l.id,
                type: l.kind, // cours · exercice · serie · resume
                title: l.title,
                // La vidéo d'abord, ses documents ensuite — l'ordre dans lequel
                // l'écran les présente.
                refs: [
                  ...(l.videoUrl ? [l.videoUrl.replace(/^wael-media:/, "")] : []),
                  ...(docRefs.get(l.id) ?? []),
                ],
              })),
          })),
      })),
  }))

/* ---------- quelques nombres pour l'en-tête ---------- */
const all = bacs.flatMap((b) => b.matieres)
const chaps = all.flatMap((m) => m.chapitres)
const items = chaps.flatMap((c) => c.items)
const n = {
  matieres: all.length,
  remplies: all.filter((m) => m.chapitres.length).length,
  chapitres: chaps.length,
  items: items.length,
  refs: new Set(items.flatMap((i) => i.refs)).size,
}

const now = new Date()
const header = `/* Structure de « الدروس » — ${now.toLocaleString("fr-FR")}
   Le programme du prototype, emboîté et mis en forme comme chapitres-data.js :
   bac → matière → chapitre → item. Un item porte les codes de ses fichiers,
   la vidéo d'abord. ENGENDRÉ par « npm run drouss:data » — ne pas l'éditer.

   ${n.matieres} matières (${n.remplies} avec un programme) · ${n.chapitres} chapitres · ${n.items} items · ${n.refs} fichiers distincts */
window.DROUSS_DATA = `

fs.writeFileSync(
  OUT,
  header + JSON.stringify({ stamp: now.toISOString(), bacs }, null, 1) + ";\n",
  "utf8",
)

console.log("→", OUT)
console.log(`${n.matieres} matières · ${n.chapitres} chapitres · ${n.items} items · ${n.refs} fichiers`)
for (const b of bacs) {
  const c = b.matieres.flatMap((m) => m.chapitres)
  console.log(
    `  ${b.name.padEnd(22)} ${String(b.matieres.length).padStart(2)} matières · ` +
      `${String(c.length).padStart(2)} chapitres · ${String(c.flatMap((x) => x.items).length).padStart(3)} items`,
  )
}
