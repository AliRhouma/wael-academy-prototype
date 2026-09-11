// Validates every sound cue used in the élève space against the uisfx catalogue.
//
//   npm run check:sounds
//
// uisfx IGNORES an unknown cue name silently (a typo in `data-uisfx="sned"`
// just plays nothing), so this is the only thing that catches one. It reads:
//   data-uisfx="cue"            data-uisfx={cond ? "a" : "b"}
//   sound="cue"                 sound={cond ? "a" : "b"}     (wrapper props)
//   sfx("cue")
// and prints how often each cue is used. Exit code 1 on any unknown name.
// See docs/sound-effects.md.
import { cueNames } from "uisfx"
import { readFileSync, readdirSync, statSync } from "node:fs"
import { join } from "node:path"

const ROOTS = ["src/features/student-v2", "src/features/auth"]
const valid = new Set(cueNames)

const walk = (dir) =>
  readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(f) ? [p] : []
  })

const PATTERNS = [
  /(?:data-uisfx|sound)="([^"]+)"/g, // literal attribute / prop
  /(?:data-uisfx|sound)=\{([^}]*)\}/g, // expression — every "quoted" word inside
  /\bsfx\("([^"]+)"\)/g, // programmatic
]

const used = new Map()
let bad = 0
for (const file of ROOTS.flatMap(walk)) {
  const src = readFileSync(file, "utf8")
  for (const re of PATTERNS) {
    for (const m of src.matchAll(re)) {
      const names = m[1].includes('"') || re === PATTERNS[1] ? [...m[1].matchAll(/"([a-z-]+)"/g)].map((x) => x[1]) : [m[1]]
      for (const name of names) {
        used.set(name, (used.get(name) ?? 0) + 1)
        if (!valid.has(name)) {
          bad++
          console.error(`✗ unknown cue "${name}" in ${file}`)
        }
      }
    }
  }
}

console.log(
  "cues in use:",
  [...used.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k}×${v}`)
    .join("  "),
)
if (bad) {
  console.error(`\n${bad} unknown cue name(s). Valid names: see docs/sound-effects.md § "All 78 cues".`)
  process.exit(1)
}
console.log("✓ every cue name is valid")
