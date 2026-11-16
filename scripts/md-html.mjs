// Generic Markdown → readable HTML page, for research docs (docs/onboarding/*.md…).
// Run: node scripts/md-html.mjs <file.md> [out.html]   (default: same name, .html)
// Also a module: scripts/build-hub.mjs imports renderMarkdown() and htmlPage()
// to turn every doc and skill into a page of the project hub (/hub/).
//
// No dependency. Supports: headings, paragraphs, > blockquotes, lists (one
// nesting level), tables, **bold**, _italic_, `code`, [links](url), ```fenced
// code```, --- rules, images ![alt](src "caption") rendered as figures — several
// image lines in a row become a gallery grid — and raw HTML blocks: a line that
// starts with "<" passes through untouched until the next blank line (keep
// inline <svg>/<figure> mockups free of blank lines).
import { readFileSync, writeFileSync } from "node:fs"
import { basename, resolve } from "node:path"
import { fileURLToPath } from "node:url"

export const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
const attr = (s) => esc(s).replace(/"/g, "&quot;")
const slug = (s) => s.toLowerCase().replace(/<[^>]+>/g, "").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "")

/** Default link: open in a new tab. A `link(href)` resolver returns
 *  { href, external } — or null, which prints the label as code (a path with no page). */
const newTab = (href) => ({ href, external: true })
const anchor = (label, href, link) => {
  const to = link(href.replace(/&amp;/g, "&"))
  if (!to) return `<code>${label}</code>`
  return `<a href="${attr(to.href)}"${to.external ? ' target="_blank" rel="noopener"' : ""}>${label}</a>`
}

function inline(text, link = newTab) {
  const codes = []
  let s = esc(text).replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(c) - 1}\u0000`)
  s = s
    .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;[^)]*&quot;|\s+"[^)]*")?\)/g, '<img src="$2" alt="$1" loading="lazy">')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => anchor(label, href, link))
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[\s(])\*([^*\s][^*]*?)\*(?=[\s).,;:]|$)/g, "$1<em>$2</em>")
    .replace(/(^|[\s(])_([^_]+)_(?=[\s).,;:]|$)/g, "$1<em>$2</em>")
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[i]}</code>`)
}

const IMG = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\s*$/
const figure = (m, il) =>
  `<figure><a href="${attr(m[2])}" target="_blank" rel="noopener"><img src="${attr(m[2])}" alt="${attr(m[1])}" loading="lazy" onerror="this.closest('figure').classList.add('broken')"></a>${m[3] || m[1] ? `<figcaption>${il(m[3] || m[1])}</figcaption>` : ""}</figure>`

/** Markdown → { title, toc, body }. `name` is the fallback title (the file name). */
export function renderMarkdown(md, { name = "", link = newTab } = {}) {
  const il = (t) => inline(t, link)
  const lines = md.split("\n")
  const html = []
  const toc = []
  let title = name
  let i = 0
  const isBlockStart = (l) => /^(#{1,4}\s|>|\||```|---\s*$|<|!\[|\s*([-*]|\d+\.)\s)/.test(l)
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) { i++; continue }

    if (line.startsWith("```")) {
      const buf = []
      i++
      while (i < lines.length && !lines[i].startsWith("```")) buf.push(lines[i++])
      i++
      html.push(`<pre><code>${esc(buf.join("\n"))}</code></pre>`)
      continue
    }

    if (/^---\s*$/.test(line)) { html.push("<hr>"); i++; continue }

    if (line.startsWith("<")) {
      const buf = []
      while (i < lines.length && lines[i].trim()) buf.push(lines[i++])
      html.push(buf.join("\n"))
      continue
    }

    if (IMG.test(line)) {
      const figs = []
      while (i < lines.length && IMG.test(lines[i])) figs.push(figure(lines[i++].match(IMG), il))
      html.push(figs.length > 1 ? `<div class="gallery">${figs.join("")}</div>` : figs[0])
      continue
    }

    const h = line.match(/^(#{1,4})\s+(.*)$/)
    if (h) {
      const level = h[1].length
      const text = il(h[2])
      if (level === 1 && title === name) { title = h[2]; html.push(`<h1>${text}</h1>`) }
      else {
        const id = slug(h[2])
        if (level === 2) toc.push({ id, text })
        html.push(`<h${Math.max(level, 2)} id="${id}">${text}</h${Math.max(level, 2)}>`)
      }
      i++; continue
    }

    if (line.startsWith(">")) {
      const buf = []
      while (i < lines.length && lines[i].startsWith(">")) buf.push(lines[i++].replace(/^>\s?/, ""))
      html.push(`<blockquote>${buf.map((b) => il(b)).join("<br>")}</blockquote>`)
      continue
    }

    if (line.startsWith("|")) {
      const rows = []
      while (i < lines.length && lines[i].startsWith("|")) rows.push(lines[i++])
      const cells = (r) => r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim())
      const head = cells(rows[0])
      const body = rows.slice(2).map(cells)
      html.push(
        `<div class="table"><table><thead><tr>${head.map((c) => `<th>${il(c)}</th>`).join("")}</tr></thead><tbody>` +
          body.map((r) => `<tr>${r.map((c) => `<td>${il(c)}</td>`).join("")}</tr>`).join("") +
          `</tbody></table></div>`,
      )
      continue
    }

    if (/^(\s*)([-*]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line)
      const items = []
      while (i < lines.length && /^(\s*)([-*]|\d+\.)\s+|^\s{2,}\S/.test(lines[i])) {
        // An indented line that is not a new item continues the previous one.
        if (!/^(\s*)([-*]|\d+\.)\s+/.test(lines[i])) {
          const last = items[items.length - 1]
          if (last.sub.length) last.sub[last.sub.length - 1] += " " + lines[i].trim()
          else last.text += " " + lines[i].trim()
          i++; continue
        }
        const m = lines[i].match(/^(\s*)(?:[-*]|\d+\.)\s+(.*)$/)
        const depth = m[1].length >= 2 ? 1 : 0
        if (depth === 1 && items.length) items[items.length - 1].sub.push(m[2])
        else items.push({ text: m[2], sub: [] })
        i++
      }
      const tag = ordered ? "ol" : "ul"
      html.push(
        `<${tag}>${items.map((it) => `<li>${il(it.text)}${it.sub.length ? `<ul>${it.sub.map((s) => `<li>${il(s)}</li>`).join("")}</ul>` : ""}</li>`).join("")}</${tag}>`,
      )
      continue
    }

    const buf = []
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) buf.push(lines[i++])
    if (!buf.length) buf.push(lines[i++])
    html.push(`<p>${il(buf.join(" "))}</p>`)
  }
  return { title, toc, body: html.join("\n") }
}

/** The page around a rendered doc. `topbar` (HTML) sits above the layout —
 *  the hub's « back to the map » bar; `source` is quoted in the generator note. */
export function htmlPage({ title, toc, body, source, topbar = "", lang = "fr" }) {
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title.replace(/<[^>]+>/g, ""))}</title>
<!-- Generated from ${esc(source)} by scripts/md-html.mjs — edit the .md, then re-run -->
<style>
:root{--ink:#172e5b;--ink2:#586989;--teal:#0491a5;--teal-text:#036b7a;--lime:#8aff6b;--bg:#f3f7f9;--panel:#fff;--line:rgb(23 46 91/.12);color-scheme:light}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--ink:#e6edfb;--ink2:#a6aec1;--teal:#29b8cc;--teal-text:#29b8cc;--bg:#0a1428;--panel:#111d38;--line:rgb(255 255 255/.12);color-scheme:dark}}
:root[data-theme="dark"]{--ink:#e6edfb;--ink2:#a6aec1;--teal:#29b8cc;--teal-text:#29b8cc;--bg:#0a1428;--panel:#111d38;--line:rgb(255 255 255/.12);color-scheme:dark}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.65 system-ui,-apple-system,"Segoe UI",Roboto,"Cairo",sans-serif}
.wrap{max-width:1180px;margin:0 auto;padding:24px 16px 64px;display:grid;gap:28px}
@media(min-width:960px){.wrap{grid-template-columns:240px 1fr;padding:40px 24px 80px}}
nav.toc{position:sticky;top:16px;align-self:start;background:var(--panel);border:2px solid var(--line);border-radius:18px;padding:14px;max-height:calc(100vh - 32px);overflow:auto}
nav.toc b{display:block;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink2);margin-bottom:6px}
nav.toc a{display:block;padding:7px 10px;border-radius:10px;color:var(--ink);text-decoration:none;font-size:14px}
nav.toc a:hover{background:rgb(4 145 165/.1);color:var(--teal-text)}
@media(max-width:959px){nav.toc{position:static;max-height:none}}
main{min-width:0}
h1{font-size:30px;line-height:1.2;margin:0 0 12px}
h2{font-size:21px;margin:40px 0 12px;padding-top:8px;border-top:2px solid var(--line)}
h3{font-size:17px;margin:26px 0 10px;color:var(--teal-text)}
h4{font-size:15px;margin:20px 0 8px}
p{margin:10px 0}
a{color:var(--teal-text)}
hr{border:0;border-top:2px dashed var(--line);margin:28px 0}
code{font:13px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;background:rgb(23 46 91/.07);padding:1px 6px;border-radius:6px;word-break:break-word}
pre{background:var(--panel);border:2px solid var(--line);border-radius:14px;padding:14px;overflow-x:auto}
pre code{background:none;padding:0}
blockquote{margin:12px 0;padding:14px 16px;border-inline-start:4px solid var(--teal);background:var(--panel);border-radius:12px}
ul,ol{padding-inline-start:22px}
li{margin:4px 0}
img,svg{max-width:100%;height:auto}
figure{margin:16px 0;background:var(--panel);border:2px solid var(--line);border-radius:16px;overflow:hidden}
figure img{display:block;width:100%;max-height:560px;object-fit:contain;background:rgb(23 46 91/.04)}
figcaption{padding:10px 14px;font-size:13px;color:var(--ink2)}
figure.broken img{display:none}
figure.broken figcaption::before{content:"Image indisponible — ";font-weight:600}
.gallery{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));margin:16px 0}
.gallery figure{margin:0}
.gallery figure img{height:260px;object-fit:cover;object-position:top}
.table{overflow-x:auto;background:var(--panel);border:2px solid var(--line);border-radius:16px;margin:12px 0}
table{border-collapse:collapse;width:100%;font-size:14px}
th,td{padding:10px 12px;text-align:start;vertical-align:top;border-bottom:1px solid var(--line)}
th{font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:var(--ink2);background:rgb(4 145 165/.06)}
tr:last-child td{border-bottom:0}
.hubbar{position:sticky;top:0;z-index:5;display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;padding:10px 16px;background:var(--panel);border-bottom:2px solid var(--line)}
.hubbar a.back{display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 14px;border-radius:999px;background:var(--ink);color:var(--bg);font-weight:700;text-decoration:none}
.hubbar .crumb{color:var(--ink2);font-size:13px}
.hubbar .crumb code{font-size:12px}
.hubbar .meta{margin-inline-start:auto;font-size:12px;color:var(--ink2)}
</style>
</head>
<body>
${topbar}<div class="wrap">
<nav class="toc" aria-label="Sommaire"><b>Sommaire</b>${toc.map((t) => `<a href="#${t.id}">${t.text}</a>`).join("")}</nav>
<main>
${body}
</main>
</div>
</body>
</html>
`
}

// CLI: node scripts/md-html.mjs <file.md> [out.html]
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [src, outArg] = process.argv.slice(2)
  if (!src) { console.error("usage: node scripts/md-html.mjs <file.md> [out.html]"); process.exit(1) }
  const out = outArg || src.replace(/\.md$/i, "") + ".html"
  const md = readFileSync(src, "utf8").replace(/\r\n/g, "\n")
  const doc = renderMarkdown(md, { name: basename(src, ".md") })
  writeFileSync(out, htmlPage({ ...doc, source: basename(src) }))
  console.log(`${basename(out)} written — ${doc.toc.length} sections`)
}
