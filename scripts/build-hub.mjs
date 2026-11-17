// Builds the project hub — public/hub/ — one page that links to EVERYTHING in
// the project: every app screen, every design-system skill, every doc.
// Run: npm run hub   (also runs before `npm run dev` and `npm run build`)
//
// Served at /hub/ on every host — localhost, mobile.localhost, the deployed
// domain and any of its subdomains — because it is a static file in public/.
//
// What it reads (so the hub never needs editing by hand):
//   src/app/router.tsx + src/app/nav/*.ts   → the app pages, built or « à venir »
//   docs/**                                 → .md become pages, .html / images / pdf are copied
//   .claude/skills/*                        → each SKILL.md + references/*.md become pages
//   docs/FEATURES.md (§1 Surfaces)          → the status mark of each surface
//   CLAUDE.md                               → « Règles du projet »
// The vendored apple-design skill is NOT copied (third-party HIG text, licence
// unclear — see its VENDORED.md); the hub only describes it.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs"
import { dirname, extname, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"
import { esc, htmlPage, renderMarkdown } from "./md-html.mjs"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const OUT = join(ROOT, "public", "hub")
const read = (p) => readFileSync(p, "utf8").replace(/\r\n/g, "\n")
const rel = (p) => relative(ROOT, p).split(sep).join("/")
const attr = (s) => esc(String(s)).replace(/"/g, "&quot;")
const day = (p) => new Date(statSync(p).mtime).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = join(dir, d.name)
    return d.isDirectory() ? walk(p) : [p]
  })
}

/* ── 1. Collect the documents ─────────────────────────────────────────────── */

/** Every source file that gets a hub page or a hub copy: abs path → hub url. */
const hubUrl = new Map()
/** The .md → .html pages to render, and the .html pages to copy. */
const mdPages = []
const htmlPages = []
const assets = []

const DOCS = join(ROOT, "docs")
const SKIP_EXT = new Set([".js", ".mjs", ".ts"])
for (const file of walk(DOCS)) {
  const ext = extname(file).toLowerCase()
  const url = "/hub/" + rel(file)
  if (ext === ".md") {
    // A doc that already has its own designed .html (onboarding, town-assets,
    // FEATURES → features.html) keeps that page; the .md links to it.
    const twin = file.slice(0, -3) + ".html"
    const featuresTwin = rel(file) === "docs/FEATURES.md" ? join(DOCS, "features.html") : null
    const html = [twin, featuresTwin].find((p) => p && existsSync(p))
    if (html) hubUrl.set(file, "/hub/" + rel(html))
    else {
      hubUrl.set(file, url.slice(0, -3) + ".html")
      mdPages.push({ src: file, out: join(OUT, rel(file).slice(0, -3) + ".html") })
    }
  } else if (ext === ".html") {
    hubUrl.set(file, url)
    htmlPages.push({ src: file, out: join(OUT, rel(file)) })
  } else if (!SKIP_EXT.has(ext)) {
    hubUrl.set(file, url)
    assets.push({ src: file, out: join(OUT, rel(file)) })
  }
}

const SKILLS = join(ROOT, ".claude", "skills")
const VENDORED = "apple-design"
const skillDirs = readdirSync(SKILLS, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
for (const name of skillDirs) {
  const dir = join(SKILLS, name)
  const files = name === VENDORED ? [join(dir, "VENDORED.md")] : walk(dir)
  for (const file of files) {
    const r = relative(dir, file).split(sep).join("/")
    const outRel = `skills/${name}/` + (r === "SKILL.md" || (name === VENDORED && r === "VENDORED.md") ? "index.html" : r.replace(/\.md$/i, ".html"))
    hubUrl.set(file, "/hub/" + outRel)
    if (file.endsWith(".md")) mdPages.push({ src: file, out: join(OUT, outRel), skill: name })
    else assets.push({ src: file, out: join(OUT, outRel) })
  }
}

const CLAUDE_MD = join(ROOT, "CLAUDE.md")
hubUrl.set(CLAUDE_MD, "/hub/projet/regles.html")
mdPages.push({ src: CLAUDE_MD, out: join(OUT, "projet", "regles.html") })

/* ── 2. Links between pages ───────────────────────────────────────────────── */

/** A link inside a doc → its hub page, an app route, the web — or null (a path
 *  to source code, which has no page: printed as code instead). */
function linker(srcFile) {
  return (href) => {
    if (/^(https?:|mailto:)/.test(href)) return { href, external: true }
    if (href.startsWith("#")) return { href, external: false }
    const [path, hash = ""] = href.split("#")
    const tail = hash ? "#" + hash : ""
    for (const base of [dirname(srcFile), ROOT, DOCS]) {
      const abs = resolve(base, decodeURI(path))
      if (hubUrl.has(abs)) return { href: hubUrl.get(abs) + tail, external: false }
    }
    // "/student-v2/calendrier" style links are app routes.
    if (/^\/[a-z]/i.test(path) && !extname(path)) return { href, external: false }
    return null
  }
}

/* ── 3. Titles and one-line descriptions ──────────────────────────────────── */

function frontmatter(md) {
  const m = md.match(/^---\n([\s\S]*?)\n---\n/)
  if (!m) return { meta: {}, body: md }
  const meta = {}
  let key = null
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/)
    if (kv) { key = kv[1]; meta[key] = kv[2] === ">" || kv[2] === "|" ? "" : kv[2] }
    else if (key && /^\s+/.test(line)) meta[key] += (meta[key] ? " " : "") + line.trim()
  }
  return { meta, body: md.slice(m[0].length) }
}

const plain = (s) =>
  s.replace(/<[^>]+>/g, "").replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#|]/g, "").replace(/\s+/g, " ").trim()
const clip = (s, n = 190) => (s.length > n ? s.slice(0, n).replace(/\s+\S*$/, "") + "…" : s)

/** Title = first "# " heading; summary = the first paragraph or quote after it. */
function mdInfo(md) {
  const { body } = frontmatter(md)
  const lines = body.split("\n")
  const h1 = lines.find((l) => /^#\s/.test(l))
  let summary = ""
  for (let i = h1 ? lines.indexOf(h1) + 1 : 0; i < lines.length && !summary; i++) {
    const l = lines[i].trim()
    if (!l || /^(#|\||```|---|!\[|<)/.test(l)) continue
    const buf = []
    while (i < lines.length && lines[i].trim() && !/^(#|\||```)/.test(lines[i].trim())) buf.push(lines[i++])
    summary = plain(buf.join(" "))
  }
  return { title: h1 ? plain(h1.replace(/^#\s+/, "")) : "", summary: clip(summary) }
}

function htmlInfo(html) {
  const title = (html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim()
  const desc = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1]
  const p = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)?.[1]
  return { title: plain(title), summary: clip(plain(desc || p || "")) }
}

/* ── 4. Render and copy ───────────────────────────────────────────────────── */

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

const info = new Map() // abs src → { title, summary, updated }
const SECTION_OF = (src) =>
  src === CLAUDE_MD ? "Règles du projet" : src.startsWith(SKILLS) ? "Systèmes de design" : "Documentation"

for (const page of mdPages) {
  const md = read(page.src)
  const { meta, body } = frontmatter(md)
  // A skill's "when to use" line (its frontmatter) goes under its title.
  const lead = meta.description && page.skill ? `$1\n\n> **Quand ce skill s'applique —** ${meta.description}\n` : "$1"
  const doc = renderMarkdown(body.replace(/^(#\s.*)$/m, lead), { name: meta.name || rel(page.src), link: linker(page.src) })
  const facts = { ...mdInfo(md), updated: day(page.src) }
  if (!facts.title) facts.title = meta.name || rel(page.src)
  info.set(page.src, facts)
  const topbar = `<header class="hubbar"><a class="back" href="/hub/">← Plan du projet</a><span class="crumb">${esc(SECTION_OF(page.src))} · <code>${esc(rel(page.src))}</code></span><span class="meta">Mis à jour le ${esc(facts.updated)}</span></header>\n`
  mkdirSync(dirname(page.out), { recursive: true })
  writeFileSync(page.out, htmlPage({ ...doc, source: rel(page.src), topbar }))
}

/** Copied .html pages get a floating « Plan du projet » button, and their links
 *  to .md files point at the rendered page. */
const HOME_PILL = `<a href="/hub/" data-hub-home style="position:fixed;inset-block-end:16px;inset-inline-start:16px;z-index:2147483000;display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 16px;border-radius:999px;background:#172e5b;color:#fff;font:600 14px/1 system-ui,sans-serif;text-decoration:none;box-shadow:0 6px 20px rgb(23 46 91/.35)">← Plan du projet</a>`
for (const page of htmlPages) {
  let html = read(page.src)
  info.set(page.src, { ...htmlInfo(html), updated: day(page.src) })
  html = html.replace(/href="([^"#:$]+\.md)(#[^"]*)?"/g, (m, p, hash = "") => {
    const abs = resolve(dirname(page.src), p)
    return hubUrl.has(abs) ? `href="${hubUrl.get(abs)}${hash}"` : m
  })
  html = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, `${HOME_PILL}\n</body>`) : html + HOME_PILL
  mkdirSync(dirname(page.out), { recursive: true })
  writeFileSync(page.out, html)
}
for (const a of assets) {
  mkdirSync(dirname(a.out), { recursive: true })
  cpSync(a.src, a.out)
}

/* ── 5. The app pages, read from the router ───────────────────────────────── */

const router = read(join(ROOT, "src", "app", "router.tsx"))

/** The nav items of a role: [{ label, path }] in menu order. */
function nav(file) {
  return [...read(join(ROOT, "src", "app", "nav", file)).matchAll(/label:\s*"([^"]+)",\s*path:\s*"([^"]+)"/g)].map((m) => ({ label: m[1], path: m[2] }))
}

/** The relative paths that have a real screen in a roleRoute(base, …) call. */
function builtScreens(base) {
  const start = router.indexOf(`"${base}",`, router.indexOf("export const router"))
  const next = router.indexOf("roleRoute(", start)
  const block = router.slice(start, next > 0 ? next : router.indexOf('path: "/student-v2"', start))
  return new Set([...block.matchAll(/(?:^|[\s{,])"?([a-z][\w-]*)"?:\s*</gm)].map((m) => m[1]))
}

/** Children of a nested route: [{ path, component, title }], params and "*" left out. */
function children(base) {
  const start = router.indexOf(`path: "${base}"`)
  const end = router.indexOf("\n  },", start)
  const block = router.slice(start, end)
  return [...block.matchAll(/\{\s*(?:index:\s*true|path:\s*"([^"]+)"),\s*element:\s*<(\w+)(?:\s+title="([^"]+)")?/g)]
    .map((m) => ({ path: m[1] ? `${base}/${m[1]}` : base, component: m[2], title: m[3] }))
    .filter((c) => !c.path.includes(":") && !c.path.endsWith("*"))
}

/** Status marks from FEATURES.md §1, keyed by every `/url` in the URL column. */
const statusOf = new Map()
{
  const features = read(join(DOCS, "FEATURES.md"))
  const surfaces = features.slice(features.indexOf("## 1."), features.indexOf("\n## 2."))
  for (const row of surfaces.split("\n").filter((l) => l.startsWith("|"))) {
    const cells = row.split("|").map((c) => c.trim())
    const mark = cells.find((c) => /^(✅|🟡|🔲|💡|⛔)$/.test(c))
    if (mark) for (const m of (cells[2] ?? "").matchAll(/`(\/[^`?\s]*)/g)) statusOf.set(m[1].replace(/\/$/, "") || "/", mark)
  }
}

const page = (path, label, note = "", state = "built", extra = {}) => ({ path, label, note, state, ...extra })

function rolePages(file, base) {
  const built = builtScreens(base)
  return nav(file).map((it, i) => {
    const r = it.path.slice(base.length + 1)
    return page(it.path, it.label, "", i === 0 || built.has(r) ? "built" : "soon")
  })
}

const V2_LABELS = Object.fromEntries(nav("studentV2.ts").map((n) => [n.path, n.label]))
const v2 = children("/student-v2").map((c) =>
  page(c.path, V2_LABELS[c.path] || c.title || "الرئيسية", c.path === "/student-v2" ? "Tableau de bord" : "", c.component === "V2Placeholder" ? "soon" : "built"),
)

const GAME_LABELS = {
  MobileSplash: "Écran de lancement", MobileWelcome: "Bienvenue", MobileLevel: "Choix du niveau", MobileSubject: "Choix de la matière",
  MobileQuiz: "Le défi (3 questions)", MobileResult: "Résultat", MobileRegister: "Inscription", MobileLogin: "Connexion", MobileHome: "Accueil (la ville)", MobileTown: "La ville (après le login)",
  WebGameLanding: "Page d'accueil", WebGameLogin: "Connexion", WebHome: "L'application",
}
const game = (base) => children(base).map((c) => page(c.path, GAME_LABELS[c.component] || c.component))

const APP = [
  {
    id: "site", title: "Site public & connexion", status: statusOf.get("/site"),
    intro: "Ce que voit un visiteur : la page d'accueil du Figma, « À propos », puis la porte d'entrée.",
    pages: [
      page("/site", "Page d'accueil", "Landing du Figma"),
      page("/site/a-propos", "À propos"),
      page("/connexion", "Connexion", "Compte démo 29340118 · wael1234"),
      page("/inscription", "Inscription"),
      page("/mot-de-passe-oublie", "Mot de passe oublié", "Code de démo 123456"),
      page("/landing-ancien", "Ancienne landing", "Gardée pour comparaison", "old"),
    ],
  },
  {
    id: "eleve", title: "Espace élève — nouveau (student-v2)", status: statusOf.get("/student-v2"),
    intro: "La refonte Figma de l'espace élève : arabe RTL, skin gamifié « play ». Les pages « à venir » montrent un écran d'attente.",
    pages: v2,
    variants: [
      ["/student-v2?platform=ios&insets=47,34", "Habillage iOS"],
      ["/student-v2?platform=android&insets=36,24", "Habillage Android"],
      ["/student-v2?skin=soft", "Sans gamification (skin soft)"],
    ],
  },
  {
    id: "jeu", title: "Le jeu — téléphone en paysage et web", status: statusOf.get("/mobilegame"),
    intro: "La version « jeu » : sur téléphone tenu en paysage (iPhone 13 Pro Max ou Galaxy A55), wael en 3D accueille l'élève, un défi de 3 questions, le compte, puis la ville isométrique ; et la même chose en web. Astuce : à la connexion du jeu, « ادخل لمدينتك » sans rien remplir ouvre la ville avec le compte démo.",
    pages: [
      ...game("/mobilegame").map((p) => ({ ...p, group: "Jeu — téléphone (paysage)" })),
      ...game("/webgame").map((p) => ({ ...p, group: "Jeu — web" })),
      page("/map", "La ville — île", "Page de test", "test"),
      page("/map/planete", "La ville — planète", "Page de test", "test"),
      page("/map/atelier", "Atelier des assets", "Vérifie les PNG de l'artiste contre le guide", "test"),
    ],
    variants: [
      ["/mobilegame", "Jeu sur iPhone"],
      ["/mobilegame?device=galaxy", "Jeu sur Galaxy A55"],
      ["/mobilegame/connexion", "Connexion → la ville"],
    ],
  },
  {
    id: "mobile", title: "Les deux téléphones", status: statusOf.get("/mobile"),
    intro: "L'espace élève dans un iPhone 13 Pro Max et un Galaxy A55, côte à côte.",
    pages: [page("/mobile", "Galerie des deux téléphones", "Aussi à la racine de mobile.<domaine>")],
  },
  {
    id: "roles", title: "Espaces par rôle", status: statusOf.get("/admin"),
    intro: "Quatre vues filtrées sur les mêmes données. On choisit son rôle sur /roles ; « Changer de rôle » reste dans chaque menu.",
    pages: [page("/roles", "Choisir un rôle", "Le sélecteur des quatre rôles")],
    roles: [
      ["Administration", rolePages("admin.ts", "/admin")],
      ["Professeur", rolePages("teacher.ts", "/teacher")],
      ["Parent", rolePages("parent.ts", "/parent")],
      ["Élève — ancien espace", rolePages("student.ts", "/student")],
    ],
  },
  {
    id: "outils", title: "Outils & pages annexes",
    intro: "Pages de travail : le guide visuel du système de design soft, la liste des cours et les documents de la prochaine mise à jour.",
    pages: [
      page("/design-system", "Système de design (soft) — page vivante", "Couleurs, typo et composants rendus en vrai"),
      page("/courses", "Liste des cours", "Avec l'espace de travail /courses/:id"),
      page("/next-update/", "Prochaine mise à jour (version publiée)", "Copie publique de docs/next-update"),
    ],
  },
]

/* ── 6. Design systems and documentation, grouped ─────────────────────────── */

const SKILL_CARDS = {
  "wael-gamified": { tag: "Espace élève", tone: "lime", summary: "Le skin « play » : boutons pressables avec un rebord, contours de 2 px, un seul moment citron par écran, couleur = état, anneaux, tampons, une seule explosion méritée. Le contenu de l'espace élève.", research: ["docs/mobile/gamification-design.md"] },
  "wael-mobile-ios": { tag: "iPhone", tone: "teal", summary: "Les conventions iOS 26/27 (Liquid Glass, HIG) par-dessus la marque : barre d'onglets en verre, bouton retour, feuilles, Dynamic Type, cibles de 44 pt.", research: ["docs/mobile/ios-patterns.md", "docs/mobile/glass-research.md", "docs/mobile/apple-design-audit.md"] },
  "wael-mobile-android": { tag: "Android", tone: "teal", summary: "Material 3 Expressive tel que One UI l'affiche sur un Galaxy : barre de navigation avec la pastille citron, rôles de couleur tonals, feuilles de 28 dp, ripple, cibles de 48 dp.", research: ["docs/mobile/android-patterns.md", "docs/mobile/device-specs.md"] },
  "wael-design-system-soft": { tag: "Marque · espaces rôles", tone: "navy", summary: "La marque Wael « soft » (vert, sarcelle, marine, or) utilisée par les espaces admin, prof et parent. Sa page vivante : /design-system.", research: [], live: "/design-system" },
  "wael-subject-eyes": { tag: "Illustrations", tone: "navy", summary: "Intégrer un nouveau badge de matière et faire suivre le curseur par ses yeux : convention de marquage, générateur, vérifications.", research: [] },
  [VENDORED]: { tag: "Relecteur HIG · tiers", tone: "muted", summary: "Skill tiers (dickwu/apple-design-skill) qui audite un écran contre les 123 pages des Human Interface Guidelines d'Apple. On construit avec wael-mobile-ios, on audite avec lui. Ses pages HIG restent en local (licence).", research: ["docs/mobile/apple-design-audit.md"] },
}
const SKILL_ORDER = ["wael-gamified", "wael-mobile-ios", "wael-mobile-android", "wael-design-system-soft", "wael-subject-eyes", VENDORED]

const DOC_GROUPS = [
  { id: "reference", title: "Référence produit", intro: "Où en est le projet, et ce qu'on pourrait construire ensuite.", match: (r) => /^docs\/(FEATURES\.md|features(-catalog)?\.html|sound-effects\.md)$/.test(r) },
  { id: "recherche-mobile", title: "Recherche mobile & gamification", intro: "La recherche derrière les skins iOS, Android et « play ».", match: (r) => r.startsWith("docs/mobile/") },
  { id: "3d", title: "3D — personnages et effets", intro: "La base de connaissance pour wael en 3D et les effets 3D de l'interface (splash, poses, animation).", match: (r) => r.startsWith("docs/3d/") },
  { id: "onboarding", title: "Onboarding — recherche", intro: "Comment les meilleures apps accueillent un nouvel élève.", match: (r) => r.startsWith("docs/onboarding/") },
  { id: "next-update", title: "Prochaine mise à jour", intro: "Critique, prototypes HTML et cahiers des charges (client et développeurs).", match: (r) => r.startsWith("docs/next-update/") },
  { id: "autres", title: "Autres documents", intro: "Contenu pédagogique et ressources graphiques.", match: () => true },
]

/** One card per document. A .md with its own designed .html (onboarding,
 *  town-assets, FEATURES → features.html) is one card: the .html page, with
 *  the .md's title and summary. */
const docCards = []
const docFiles = [...mdPages.map((p) => p.src), ...htmlPages.map((p) => p.src), ...assets.map((a) => a.src).filter((f) => /\.(pdf|csv)$/i.test(f))]
for (const src of docFiles.filter((f) => f.startsWith(DOCS))) {
  const r = rel(src)
  const ext = extname(src).toLowerCase()
  const twin = r === "docs/features.html" ? "docs/FEATURES.md" : r.replace(/\.html$/, ".md")
  const hasTwin = ext === ".html" && existsSync(join(ROOT, twin))
  const facts = hasTwin ? { ...info.get(src), ...mdInfo(read(join(ROOT, twin))) } : info.get(src) ?? { title: r.split("/").pop(), summary: "", updated: day(src) }
  const kind = ext === ".md" || hasTwin ? "Doc" : ext === ".html" ? "Page HTML" : ext.slice(1).toUpperCase()
  docCards.push({ src: r, url: hubUrl.get(src), kind, also: hasTwin ? twin : null, ...facts })
}
const grouped = DOC_GROUPS.map((g) => ({ ...g, cards: [] }))
for (const c of docCards.sort((a, b) => a.src.localeCompare(b.src))) grouped.find((g) => g.match(c.src)).cards.push(c)

/* ── 7. The page ──────────────────────────────────────────────────────────── */

const STATE = { built: ["Écran", "ok"], soon: ["À venir", "soon"], test: ["Test", "test"], old: ["Ancien", "old"] }
const MARK = { "✅": "Construit", "🟡": "En cours", "🔲": "Prévu", "💡": "Idée", "⛔": "Abandonné" }
const statusPill = (mark) => (mark ? `<span class="status" title="Statut dans docs/FEATURES.md">${mark} ${MARK[mark]}</span>` : "")

const pageRow = (p) => {
  const [label, cls] = STATE[p.state]
  return `<li data-search="${attr(`${p.label} ${p.path} ${p.note} ${p.group ?? ""}`)}"><a class="row" href="${attr(p.path)}">
  <span class="row-main"><span class="row-title"><bdi>${esc(p.label)}</bdi></span>${p.note ? `<span class="row-note">${esc(p.note)}</span>` : ""}</span>
  <code class="row-path">${esc(p.path)}</code><span class="state state-${cls}">${label}</span></a></li>`
}
const rowsBlock = (pages) => {
  const groups = [...new Set(pages.map((p) => p.group ?? ""))]
  return groups.map((g) => `${g ? `<h4 class="sub">${esc(g)}</h4>` : ""}<ul class="rows">${pages.filter((p) => (p.group ?? "") === g).map(pageRow).join("")}</ul>`).join("")
}

const appCount = APP.reduce((n, g) => n + g.pages.length + (g.roles ?? []).reduce((m, [, ps]) => m + ps.length, 0), 0)
const appHtml = APP.map((g) => `
<section class="group" id="app-${g.id}" data-group>
  <header class="group-head"><h3>${esc(g.title)}</h3>${statusPill(g.status)}</header>
  <p class="group-intro">${esc(g.intro)}</p>
  ${rowsBlock(g.pages)}
  ${(g.roles ?? []).map(([title, ps]) => `<details class="role" data-group><summary><span>${esc(title)}</span><span class="count">${ps.filter((p) => p.state === "built").length}/${ps.length} écrans</span></summary>${rowsBlock(ps)}</details>`).join("")}
  ${g.variants ? `<div class="variants"><span>Variantes :</span>${g.variants.map(([href, label]) => `<a class="chip" href="${attr(href)}" data-search="${attr(label + " " + href)}">${esc(label)}</a>`).join("")}</div>` : ""}
</section>`).join("")

const skillCount = SKILL_ORDER.filter((n) => skillDirs.includes(n)).length + skillDirs.filter((n) => !SKILL_ORDER.includes(n)).length
const skillHtml = [...SKILL_ORDER.filter((n) => skillDirs.includes(n)), ...skillDirs.filter((n) => !SKILL_ORDER.includes(n))].map((name) => {
  const card = SKILL_CARDS[name] ?? { tag: "Skill", tone: "navy", summary: frontmatter(read(join(SKILLS, name, "SKILL.md"))).meta.description ?? "", research: [] }
  const skillFile = join(SKILLS, name, "SKILL.md")
  const title = name === VENDORED ? "Apple Design (relecteur HIG)" : info.get(skillFile)?.title || name
  const refs = mdPages.filter((p) => p.skill === name && !p.src.endsWith("SKILL.md") && !(name === VENDORED))
  const links = [
    `<a class="btn" href="/hub/skills/${name}/">${name === VENDORED ? "Fiche du skill" : "Lire le skill"}</a>`,
    ...refs.map((p) => `<a class="chip" href="${attr(hubUrl.get(p.src))}">${esc(info.get(p.src)?.title || rel(p.src).split("/").pop())}</a>`),
    ...card.research.filter((r) => hubUrl.has(join(ROOT, r))).map((r) => `<a class="chip chip-doc" href="${attr(hubUrl.get(join(ROOT, r)))}">Recherche · ${esc(info.get(join(ROOT, r))?.title || r)}</a>`),
    card.live ? `<a class="chip chip-live" href="${attr(card.live)}">Page vivante ${esc(card.live)}</a>` : "",
  ].join("")
  return `<article class="skill tone-${card.tone}" data-search="${attr(`${name} ${title} ${card.tag} ${card.summary}`)}">
  <span class="tag">${esc(card.tag)}</span>
  <h3>${esc(title)}</h3>
  <code class="skill-id">.claude/skills/${esc(name)}</code>
  <p>${esc(card.summary)}</p>
  <div class="links">${links}</div>
</article>`
}).join("")

const docCount = docCards.length
const docHtml = grouped.filter((g) => g.cards.length).map((g) => `
<section class="group" id="doc-${g.id}" data-group>
  <header class="group-head"><h3>${esc(g.title)}</h3><span class="count">${g.cards.length}</span></header>
  <p class="group-intro">${esc(g.intro)}</p>
  <ul class="cards">${g.cards.map((c) => `<li data-search="${attr(`${c.title} ${c.summary} ${c.src}`)}"><a class="card" href="${attr(c.url)}">
    <span class="card-top"><span class="kind">${esc(c.kind)}</span><span class="date">${esc(c.updated)}</span></span>
    <span class="card-title" dir="auto">${esc(c.title || c.src)}</span>
    ${c.summary ? `<span class="card-text" dir="auto">${esc(c.summary)}</span>` : ""}
    <code class="card-src">${esc(c.also ?? c.src)}</code></a></li>`).join("")}</ul>
</section>`).join("")

const rules = info.get(CLAUDE_MD)
const generated = new Date().toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short" })

const hub = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Plan du projet</title>
<meta name="description" content="Wael Academy — toutes les pages de l'application, les systèmes de design et la documentation du prototype.">
<link rel="icon" href="/favicon.svg">
<!-- Generated by scripts/build-hub.mjs (npm run hub) — never edit by hand. -->
<style>
:root{--ink:#172e5b;--ink2:#586989;--teal:#0491a5;--teal-text:#036b7a;--lime:#8aff6b;--on-lime:#172e5b;--bg:#f3f7f9;--panel:#fff;--panel2:#f7fafb;--line:rgb(23 46 91/.12);--line2:rgb(23 46 91/.2);--soon:#8a5a00;--soon-bg:#fff3d6;--ok-bg:#e3f7ee;--ok:#0c6b45;--old-bg:#eceff4;color-scheme:light}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--ink:#e6edfb;--ink2:#a6aec1;--teal:#29b8cc;--teal-text:#29b8cc;--bg:#0a1428;--panel:#111d38;--panel2:#0e1a33;--line:rgb(255 255 255/.1);--line2:rgb(255 255 255/.18);--soon:#ffd27a;--soon-bg:rgb(255 200 90/.12);--ok-bg:rgb(70 210 150/.12);--ok:#7fe0b4;--old-bg:rgb(255 255 255/.06);color-scheme:dark}}
:root[data-theme="dark"]{--ink:#e6edfb;--ink2:#a6aec1;--teal:#29b8cc;--teal-text:#29b8cc;--bg:#0a1428;--panel:#111d38;--panel2:#0e1a33;--line:rgb(255 255 255/.1);--line2:rgb(255 255 255/.18);--soon:#ffd27a;--soon-bg:rgb(255 200 90/.12);--ok-bg:rgb(70 210 150/.12);--ok:#7fe0b4;--old-bg:rgb(255 255 255/.06);color-scheme:dark}
*{box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:84px}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,"Cairo",sans-serif}
a{color:inherit}
:focus-visible{outline:3px solid var(--teal);outline-offset:2px;border-radius:12px}
code{font:12.5px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
.top{position:sticky;top:0;z-index:10;background:color-mix(in srgb,var(--bg) 88%,transparent);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--line);padding:max(10px,env(safe-area-inset-top)) 16px 10px}
.top-in{max-width:1200px;margin:0 auto;display:flex;align-items:center;gap:10px}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;font-weight:800;white-space:nowrap}
.brand img{width:32px;height:32px}
.brand small{display:block;font-weight:600;color:var(--ink2);font-size:12px}
@media(max-width:560px){.brand span{display:none}}
.search{flex:1;min-width:0;display:flex;align-items:center;gap:8px;min-height:44px;padding:0 14px;border:2px solid var(--line2);border-radius:999px;background:var(--panel)}
.search:focus-within{border-color:var(--teal)}
.search input{flex:1;min-width:0;border:0;background:none;color:inherit;font:inherit;outline:none}
.icon-btn{display:grid;place-items:center;width:44px;height:44px;flex:none;border:2px solid var(--line2);border-radius:999px;background:var(--panel);color:inherit;cursor:pointer;font-size:18px}
.icon-btn:hover{border-color:var(--teal)}
.layout{max-width:1200px;margin:0 auto;padding:24px 16px 80px;display:grid;gap:28px}
@media(min-width:1000px){.layout{grid-template-columns:220px minmax(0,1fr);padding-top:32px}}
.side{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none}
.side a{flex:none;display:inline-flex;align-items:center;min-height:40px;padding:0 14px;border-radius:999px;border:2px solid var(--line);background:var(--panel);text-decoration:none;font-weight:600;font-size:14px;white-space:nowrap}
.side a:hover,.side a.on{border-color:var(--teal);color:var(--teal-text)}
@media(min-width:1000px){.side{position:sticky;top:96px;align-self:start;flex-direction:column;overflow:visible}.side a{border-radius:12px;border-color:transparent;background:none}.side a.on{background:var(--panel);border-color:var(--line)}.side .sub-link{padding-inline-start:28px;font-weight:500;color:var(--ink2);min-height:34px}}
@media(max-width:999px){.side .sub-link{display:none}}
.hero{display:grid;gap:18px}
.hero h1{margin:0;font-size:clamp(28px,5vw,40px);line-height:1.1;letter-spacing:-.01em}
.hero p{margin:0;max-width:62ch;color:var(--ink2);font-size:16px}
.hero p.host{font-size:13px}
.host b{color:var(--ink)}
.stats{display:flex;flex-wrap:wrap;gap:8px}
.stat{padding:8px 14px;border-radius:14px;background:var(--panel);border:2px solid var(--line);font-size:14px}
.stat b{font-size:18px;margin-inline-end:4px}
.starts{display:grid;gap:12px;grid-template-columns:repeat(auto-fill,minmax(220px,1fr))}
.start{display:grid;gap:4px;padding:16px;border-radius:20px;background:var(--panel);border:2px solid var(--line);border-bottom-width:5px;text-decoration:none;transition:transform .12s,border-color .12s}
.start:hover{border-color:var(--teal);transform:translateY(-2px)}
.start:active{transform:translateY(1px);border-bottom-width:3px}
.start.primary{background:var(--lime);color:var(--on-lime);border-color:#5fd640}
.start .ico{font-size:24px}
.start b{font-size:17px}
.start span{font-size:13px;color:var(--ink2)}
.start.primary span{color:var(--on-lime);opacity:.8}
h2.section{display:flex;align-items:baseline;gap:10px;margin:44px 0 6px;font-size:24px}
h2.section .count{font-size:14px}
.section-intro{margin:0 0 16px;color:var(--ink2);max-width:70ch}
.group{margin:0 0 18px;padding:18px;border-radius:22px;background:var(--panel);border:2px solid var(--line)}
.group-head{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px}
.group h3{margin:0;font-size:18px}
.group-intro{margin:6px 0 12px;color:var(--ink2);font-size:14px}
.count{color:var(--ink2);font-weight:600;font-size:13px}
.status{font-size:12px;font-weight:700;padding:3px 10px;border-radius:999px;background:var(--panel2);border:1px solid var(--line2)}
h4.sub{margin:16px 0 6px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:var(--ink2)}
.rows,.cards{list-style:none;margin:0;padding:0}
.rows{display:grid;gap:6px}
.row{display:grid;grid-template-columns:1fr auto;grid-template-areas:"main state" "path path";gap:2px 10px;align-items:center;min-height:52px;padding:10px 14px;border-radius:14px;border:2px solid var(--line);background:var(--panel2);text-decoration:none}
@media(min-width:720px){.row{grid-template-columns:minmax(0,1fr) auto auto;grid-template-areas:"main path state"}}
.row:hover{border-color:var(--teal)}
.row-main{grid-area:main;display:flex;flex-direction:column;min-width:0}
.row-title{font-weight:700}
.row-note{font-size:13px;color:var(--ink2)}
.row-path{grid-area:path;color:var(--teal-text);overflow-wrap:anywhere}
.state{grid-area:state;justify-self:end;font-size:12px;font-weight:700;padding:3px 10px;border-radius:999px;white-space:nowrap}
.state-ok{background:var(--ok-bg);color:var(--ok)}
.state-soon{background:var(--soon-bg);color:var(--soon)}
.state-test,.state-old{background:var(--old-bg);color:var(--ink2)}
details.role{margin-top:12px;border-top:2px dashed var(--line);padding-top:10px}
details.role summary{display:flex;justify-content:space-between;align-items:center;min-height:44px;cursor:pointer;font-weight:700;list-style:none}
details.role summary::-webkit-details-marker{display:none}
details.role summary::after{content:"▾";margin-inline-start:8px;color:var(--ink2)}
details.role:not([open]) summary::after{content:"▸"}
details.role summary .count{margin-inline-start:auto}
.variants{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:12px;font-size:13px;color:var(--ink2)}
.chip{display:inline-flex;align-items:center;min-height:36px;padding:0 12px;border-radius:999px;border:2px solid var(--line2);background:var(--panel);text-decoration:none;font-size:13px;font-weight:600;color:var(--ink)}
.chip:hover{border-color:var(--teal);color:var(--teal-text)}
.chip-doc{border-style:dashed}
.chip-live{border-color:var(--teal);color:var(--teal-text)}
.skills{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}
.skill{display:flex;flex-direction:column;gap:8px;padding:18px;border-radius:22px;background:var(--panel);border:2px solid var(--line);border-top:6px solid var(--ink)}
.skill.tone-lime{border-top-color:#5fd640}.skill.tone-teal{border-top-color:var(--teal)}.skill.tone-muted{border-top-color:var(--line2)}
.skill h3{margin:0;font-size:18px}
.skill p{margin:0;font-size:14px;color:var(--ink2)}
.skill .tag{align-self:flex-start;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--teal-text)}
.skill-id{color:var(--ink2);font-size:12px}
.links{display:flex;flex-wrap:wrap;gap:8px;margin-top:auto;padding-top:6px}
.btn{display:inline-flex;align-items:center;min-height:44px;padding:0 16px;border-radius:999px;background:var(--ink);color:var(--bg);text-decoration:none;font-weight:700;font-size:14px}
.btn:hover{background:var(--teal-text)}
.cards{display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}
.card{display:flex;flex-direction:column;gap:6px;height:100%;padding:14px;border-radius:16px;border:2px solid var(--line);background:var(--panel2);text-decoration:none}
.card:hover{border-color:var(--teal)}
.card-top{display:flex;justify-content:space-between;gap:8px;font-size:12px;color:var(--ink2)}
.kind{font-weight:700;color:var(--teal-text)}
.card-title{font-weight:700;line-height:1.3}
.card-text{font-size:13px;color:var(--ink2);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.card-src{margin-top:auto;font-size:11.5px;color:var(--ink2);overflow-wrap:anywhere}
.rules{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px}
.rules p{margin:0;color:var(--ink2);max-width:70ch;font-size:14px}
.empty{display:none;padding:28px;text-align:center;border:2px dashed var(--line2);border-radius:22px;color:var(--ink2)}
.empty.show{display:block}
[hidden]{display:none!important}
footer{margin-top:48px;padding-top:18px;border-top:2px solid var(--line);font-size:13px;color:var(--ink2)}
</style>
</head>
<body>
<div class="top"><div class="top-in">
  <a class="brand" href="/hub/"><img src="/favicon.svg" alt=""><span>Wael Academy<small>Plan du projet</small></span></a>
  <label class="search"><span aria-hidden="true">⌕</span><input id="q" type="search" placeholder="Chercher une page, un doc, un skill…" aria-label="Chercher dans le plan du projet" autocomplete="off"></label>
  <button class="icon-btn" id="theme" type="button" aria-label="Changer de thème">◐</button>
</div></div>

<div class="layout">
<nav class="side" aria-label="Sections">
  <a href="#demarrer">Démarrer</a>
  <a href="#application">Application</a>
  ${APP.map((g) => `<a class="sub-link" href="#app-${g.id}">${esc(g.title.split(" — ")[0])}</a>`).join("")}
  <a href="#design">Systèmes de design</a>
  <a href="#documentation">Documentation</a>
  ${grouped.filter((g) => g.cards.length).map((g) => `<a class="sub-link" href="#doc-${g.id}">${esc(g.title)}</a>`).join("")}
  <a href="#regles">Règles du projet</a>
</nav>

<main>
<section class="hero" id="demarrer">
  <h1>Tout le projet, en une page</h1>
  <p>Wael Academy est un prototype cliquable de l'académie : un site public, un espace élève gamifié en arabe, ses versions iPhone et Android, des espaces admin, prof et parent, et une version « jeu ». Chaque écran, chaque système de design et chaque document est ici, à un clic.</p>
  <div class="stats"><span class="stat"><b>${appCount}</b>pages d'application</span><span class="stat"><b>${skillCount}</b>systèmes de design</span><span class="stat"><b>${docCount}</b>documents</span></div>
  <p class="host" id="host"></p>
  <div class="starts">
    <a class="start primary" href="/student-v2"><span class="ico" aria-hidden="true">🎓</span><b>Espace élève</b><span>Le cœur du produit, refonte Figma</span></a>
    <a class="start" href="/mobilegame"><span class="ico" aria-hidden="true">🎮</span><b>Le jeu — téléphone</b><span>En paysage, wael en 3D, le défi puis la ville</span></a>
    <a class="start" href="/webgame"><span class="ico" aria-hidden="true">🕹️</span><b>Le jeu — web</b><span>La même aventure dans le navigateur</span></a>
    <a class="start" href="/mobile"><span class="ico" aria-hidden="true">📱</span><b>Les deux téléphones</b><span>iPhone 13 Pro Max et Galaxy A55</span></a>
    <a class="start" href="/roles"><span class="ico" aria-hidden="true">👥</span><b>Choisir un rôle</b><span>Admin, prof, parent, élève</span></a>
    <a class="start" href="${attr(hubUrl.get(join(DOCS, "FEATURES.md")) ?? "#documentation")}"><span class="ico" aria-hidden="true">🧭</span><b>Où en est le projet</b><span>La référence des fonctionnalités</span></a>
  </div>
</section>

<h2 class="section" id="application">Application <span class="count">${appCount} pages</span></h2>
<p class="section-intro">Chaque ligne ouvre l'écran dans l'application. <b>Écran</b> : construit. <b>À venir</b> : la page existe mais affiche un écran d'attente. Les pages de détail (une matière, une séance, une vidéo) s'ouvrent depuis leurs listes.</p>
${appHtml}

<h2 class="section" id="design">Systèmes de design <span class="count">${skillCount} skills</span></h2>
<p class="section-intro">Une marque, des habillages par plateforme. Le skin « play » donne le contenu de l'espace élève ; les skills iOS et Android n'ajoutent que la peau de chaque téléphone. Chaque carte ouvre le skill, ses recettes et la recherche qui le justifie.</p>
<div class="skills" data-group>${skillHtml}</div>

<h2 class="section" id="documentation">Documentation <span class="count">${docCount} documents</span></h2>
<p class="section-intro">Tous les fichiers de <code>docs/</code>. Les .md sont convertis en pages lisibles ; les pages HTML conçues à part sont ouvertes telles quelles.</p>
${docHtml}

<h2 class="section" id="regles">Règles du projet</h2>
<section class="group rules" data-group><p data-search="regles claude.md conventions">${esc(rules?.summary || "Les conventions du prototype : design d'abord, données en mémoire, tout navigue, mobile d'abord, quatre rôles sur un seul jeu de données.")}</p><a class="btn" href="/hub/projet/regles.html">Lire CLAUDE.md</a></section>

<div class="empty" id="empty">Rien ne correspond à cette recherche.</div>

<footer>Généré le ${esc(generated)} par <code>scripts/build-hub.mjs</code> (<code>npm run hub</code>, lancé aussi avant <code>npm run dev</code> et <code>npm run build</code>). Ne pas modifier à la main : la page relit le routeur, les menus, <code>docs/</code> et <code>.claude/skills/</code>.</footer>
</main>
</div>

<script>
(function () {
  // "/" opens this page — except on mobile.<domaine>, where "/" is the phone gallery.
  var mobile = /^mobile\\./i.test(location.hostname)
  document.getElementById("host").innerHTML = "Vous êtes sur <b>" + location.host + "</b>. " + (mobile
    ? "Ici « / » ouvre la galerie des téléphones ; ce plan reste à <b>/hub/</b>."
    : "Ce plan s'ouvre à « / » et à <b>/hub/</b> — aussi sur <b>mobile." + location.host + "/hub/</b>.")

  // Theme: follows the device until a choice is made here.
  var root = document.documentElement, key = "wael-hub-theme"
  try { var saved = localStorage.getItem(key); if (saved) root.dataset.theme = saved } catch (e) {}
  document.getElementById("theme").addEventListener("click", function () {
    var dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches
    root.dataset.theme = dark ? "light" : "dark"
    try { localStorage.setItem(key, root.dataset.theme) } catch (e) {}
  })

  // Search: filters every row, card and skill; hides groups left empty.
  var q = document.getElementById("q"), empty = document.getElementById("empty")
  var norm = function (s) { return s.toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "") }
  var items = [].slice.call(document.querySelectorAll("[data-search]"))
  items.forEach(function (el) { el._text = norm(el.dataset.search + " " + el.textContent) })
  q.addEventListener("input", function () {
    var words = norm(q.value).split(/\\s+/).filter(Boolean), shown = 0
    items.forEach(function (el) {
      var hit = words.every(function (w) { return el._text.indexOf(w) >= 0 })
      el.hidden = !hit; if (hit) shown++
    })
    document.querySelectorAll("[data-group]").forEach(function (g) {
      g.hidden = words.length > 0 && !g.querySelector("[data-search]:not([hidden])")
      if (words.length && g.tagName === "DETAILS") g.open = true
    })
    document.querySelectorAll("h4.sub").forEach(function (h) {
      var list = h.nextElementSibling
      h.hidden = !!list && !list.querySelector("[data-search]:not([hidden])")
    })
    document.querySelectorAll("h2.section, .section-intro").forEach(function (el) { el.hidden = words.length > 0 })
    empty.classList.toggle("show", words.length > 0 && shown === 0)
  })
  addEventListener("keydown", function (e) { if (e.key === "/" && document.activeElement !== q) { e.preventDefault(); q.focus() } })

  // Highlight the section in view.
  var links = [].slice.call(document.querySelectorAll(".side a"))
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return
      links.forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + en.target.id) })
    })
  }, { rootMargin: "-30% 0px -60% 0px" })
  links.forEach(function (a) { var t = document.querySelector(a.getAttribute("href")); if (t) io.observe(t) })
})()
</script>
</body>
</html>
`
writeFileSync(join(OUT, "index.html"), hub)
console.log(`hub: ${appCount} app pages · ${skillCount} skills · ${docCount} docs · ${mdPages.length} md → html · ${htmlPages.length} html + ${assets.length} files copied → public/hub/`)
