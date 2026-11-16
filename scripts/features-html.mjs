// Builds docs/features.html — the readable copy of docs/FEATURES.md.
// Run: npm run features:html   (after every update to FEATURES.md)
//
// A small Markdown subset, enough for that file: headings, paragraphs,
// blockquotes, lists (one nesting level), tables, **bold**, _italic_, `code`
// and [links](url). No dependency. Status marks (✅ 🟡 🔲 💡 ⛔) become
// coloured badges, and the page gets a contents list and status totals.
import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const src = join(root, "docs", "FEATURES.md")
const out = join(root, "docs", "features.html")
const md = readFileSync(src, "utf8").replace(/\r\n/g, "\n")

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
const STATUS = { "✅": ["done", "Built"], "🟡": ["wip", "In progress"], "🔲": ["todo", "Planned"], "💡": ["idea", "Idea"], "⛔": ["drop", "Dropped"] }
const slug = (s) => s.toLowerCase().replace(/<[^>]+>/g, "").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "")

function inline(text) {
  const codes = []
  let s = esc(text).replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(c) - 1}\u0000`)
  s = s
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])_([^_]+)_(?=[\s).,;:]|$)/g, "$1<em>$2</em>")
  for (const [mark, [cls, label]] of Object.entries(STATUS)) {
    s = s.split(mark).join(`<span class="st st-${cls}" title="${label}">${mark}</span>`)
  }
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[i]}</code>`)
}

const lines = md.split("\n")
const html = []
const toc = []
let title = "Feature reference"
let i = 0
while (i < lines.length) {
  const line = lines[i]
  if (!line.trim()) { i++; continue }

  const h = line.match(/^(#{1,4})\s+(.*)$/)
  if (h) {
    const level = h[1].length
    const text = inline(h[2])
    if (level === 1) { title = h[2]; html.push(`<h1>${text}</h1>`) }
    else {
      const id = slug(h[2])
      if (level === 2) toc.push({ id, text })
      html.push(`<h${level} id="${id}">${text}</h${level}>`)
    }
    i++; continue
  }

  if (line.startsWith(">")) {
    const buf = []
    while (i < lines.length && lines[i].startsWith(">")) buf.push(lines[i++].replace(/^>\s?/, ""))
    html.push(`<blockquote>${buf.map(inline).join("<br>")}</blockquote>`)
    continue
  }

  if (line.startsWith("|")) {
    const rows = []
    while (i < lines.length && lines[i].startsWith("|")) rows.push(lines[i++])
    const cells = (r) => r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim())
    const head = cells(rows[0])
    const body = rows.slice(2).map(cells)
    html.push(
      `<div class="table"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>` +
        body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("") +
        `</tbody></table></div>`,
    )
    continue
  }

  if (/^(\s*)([-*]|\d+\.)\s+/.test(line)) {
    const ordered = /^\s*\d+\./.test(line)
    const items = []
    while (i < lines.length && /^(\s*)([-*]|\d+\.)\s+/.test(lines[i])) {
      const m = lines[i].match(/^(\s*)(?:[-*]|\d+\.)\s+(.*)$/)
      const depth = m[1].length >= 2 ? 1 : 0
      if (depth === 1 && items.length) items[items.length - 1].sub.push(m[2])
      else items.push({ text: m[2], sub: [] })
      i++
    }
    const tag = ordered ? "ol" : "ul"
    html.push(
      `<${tag}>${items.map((it) => `<li>${inline(it.text)}${it.sub.length ? `<ul>${it.sub.map((s) => `<li>${inline(s)}</li>`).join("")}</ul>` : ""}</li>`).join("")}</${tag}>`,
    )
    continue
  }

  const buf = []
  while (i < lines.length && lines[i].trim() && !/^(#|>|\||\s*([-*]|\d+\.)\s)/.test(lines[i])) buf.push(lines[i++])
  html.push(`<p>${inline(buf.join(" "))}</p>`)
}

// Status totals, counted in the feature tables (sections 2 and 3), one per row.
const totals = Object.fromEntries(Object.keys(STATUS).map((k) => [k, 0]))
let inFeatures = false
for (const l of lines) {
  if (/^## /.test(l)) inFeatures = /^## [23]\./.test(l)
  if (!inFeatures || !l.startsWith("|") || /^\|[-\s|]+\|$/.test(l)) continue
  for (const k of Object.keys(STATUS)) totals[k] += l.split(k).length - 1
}
const updated = (md.match(/\*\*Last updated:\*\*\s*([^\n]+)/) || [])[1] || ""

const page = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Wael Academy — Features</title>
<!-- Generated from docs/FEATURES.md by scripts/features-html.mjs — edit the .md, then run npm run features:html -->
<style>
:root{--ink:#172e5b;--ink2:#586989;--teal:#0491a5;--teal-text:#036b7a;--lime:#8aff6b;--live:#c8191c;--done:#f28b14;--bg:#f3f7f9;--panel:#fff;--line:rgb(23 46 91/.12);color-scheme:light}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--ink:#e6edfb;--ink2:#a6aec1;--teal:#29b8cc;--teal-text:#29b8cc;--bg:#0a1428;--panel:#111d38;--line:rgb(255 255 255/.12);color-scheme:dark}}
:root[data-theme="dark"]{--ink:#e6edfb;--ink2:#a6aec1;--teal:#29b8cc;--teal-text:#29b8cc;--bg:#0a1428;--panel:#111d38;--line:rgb(255 255 255/.12);color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,"Cairo",sans-serif}
.wrap{max-width:1180px;margin:0 auto;padding:24px 16px 64px;display:grid;gap:28px}
@media(min-width:960px){.wrap{grid-template-columns:240px 1fr;padding:40px 24px 80px}}
nav.toc{position:sticky;top:16px;align-self:start;background:var(--panel);border:2px solid var(--line);border-radius:18px;padding:14px}
nav.toc b{display:block;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink2);margin-bottom:6px}
nav.toc a{display:block;padding:7px 10px;border-radius:10px;color:var(--ink);text-decoration:none;font-size:14px}
nav.toc a:hover{background:rgb(4 145 165/.1);color:var(--teal-text)}
@media(max-width:959px){nav.toc{position:static}}
main{min-width:0}
h1{font-size:30px;line-height:1.2;margin:0 0 12px}
h2{font-size:21px;margin:40px 0 12px;padding-top:8px;border-top:2px solid var(--line)}
h3{font-size:17px;margin:26px 0 10px;color:var(--teal-text)}
p{margin:10px 0}
a{color:var(--teal-text)}
code{font:13px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;background:rgb(23 46 91/.07);padding:1px 6px;border-radius:6px;word-break:break-word}
blockquote{margin:12px 0;padding:14px 16px;border-inline-start:4px solid var(--teal);background:var(--panel);border-radius:12px}
ul,ol{padding-inline-start:22px}
li{margin:4px 0}
.table{overflow-x:auto;background:var(--panel);border:2px solid var(--line);border-radius:16px;margin:12px 0}
table{border-collapse:collapse;width:100%;font-size:14px}
th,td{padding:10px 12px;text-align:start;vertical-align:top;border-bottom:1px solid var(--line)}
th{font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:var(--ink2);background:rgb(4 145 165/.06);white-space:nowrap}
tr:last-child td{border-bottom:0}
td:first-child{min-width:220px;font-weight:600}
td:has(.st:only-child){text-align:center;white-space:nowrap}
.st{display:inline-grid;place-items:center;min-width:28px;height:24px;padding:0 6px;border-radius:999px;font-size:13px}
.st-done{background:rgb(138 255 107/.35)}.st-wip{background:rgb(242 139 20/.18)}.st-todo{background:rgb(23 46 91/.07)}.st-idea{background:rgb(161 121 255/.18)}.st-drop{background:rgb(255 59 62/.14)}
.meta{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 18px}
.pill{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:999px;background:var(--panel);border:2px solid var(--line);font-size:13px;font-weight:600}
</style>
</head>
<body>
<div class="wrap">
<nav class="toc" aria-label="Contents"><b>Contents</b>${toc.map((t) => `<a href="#${t.id}">${t.text}</a>`).join("")}</nav>
<main>
<div class="meta">${updated ? `<span class="pill">Last updated ${esc(updated)}</span>` : ""}${Object.entries(totals).map(([k, n]) => `<span class="pill"><span class="st st-${STATUS[k][0]}">${k}</span>${n} ${STATUS[k][1].toLowerCase()}</span>`).join("")}</div>
${html.join("\n")}
</main>
</div>
</body>
</html>
`
writeFileSync(out, page)
console.log(`features.html written — ${toc.length} sections, ${Object.entries(totals).map(([k, n]) => `${k} ${n}`).join(" · ")}`)
