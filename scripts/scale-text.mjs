/**
 * Rewrite every arbitrary Tailwind text size so it follows `--ts`:
 *   text-[13px]  ->  text-[calc(13px*var(--ts))]
 *
 * Idempotent: a class already carrying calc() is skipped. Run from the repo
 * root; pass --revert to put the plain px values back.
 */
import fs from "node:fs"
import path from "node:path"

const revert = process.argv.includes("--revert")
const roots = ["src"]
const files = []

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p)
    else if (/\.(tsx|ts)$/.test(e.name)) files.push(p)
  }
}
roots.forEach(walk)

const TO_SCALED = /text-\[(\d+(?:\.\d+)?)px\]/g
const TO_PLAIN = /text-\[calc\((\d+(?:\.\d+)?)px\*var\(--ts\)\)\]/g

let touched = 0
let count = 0
for (const f of files) {
  const src = fs.readFileSync(f, "utf8")
  const out = revert
    ? src.replace(TO_PLAIN, (_, n) => (count++, `text-[${n}px]`))
    : src.replace(TO_SCALED, (_, n) => (count++, `text-[calc(${n}px*var(--ts))]`))
  if (out !== src) {
    fs.writeFileSync(f, out)
    touched++
  }
}
console.log(`${revert ? "reverted" : "scaled"} ${count} class(es) across ${touched} file(s)`)
