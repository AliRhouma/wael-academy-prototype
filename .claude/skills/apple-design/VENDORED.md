# Vendored third-party skill

- **Source:** https://github.com/dickwu/apple-design-skill
- **Commit:** `ff4ebddf0488598723a82bfdce1afb04de0b1c44` (2026-10-28 HIG refresh)
- **Installed:** 2026-11-03, from the reel that recommended it
- **Kept:** `SKILL.md`, `README.md`, `references/` (123 HIG pages + the curated guides)
- **Left out:** `scripts/pull-hig.mjs` (re-downloads Apple's site), `.cursorrules`,
  `AGENTS.md`, `GEMINI.md`, `.github/`

## Its role here

A **reviewer**, not a builder. It audits a design against Apple's own wording and cites
`file.md › Heading`. Building iPhone screens in this codebase stays with `wael-mobile-ios`
(our tokens, RTL, the `play` skin, the device frame); fix what this skill finds through that
skill. When the two disagree, `wael-mobile-ios` records the decisions we took on purpose
(e.g. lime as the single selected colour, five tabs, the gamified content look) — treat a
finding against one of those as "decided, not a bug" unless it is an accessibility failure.

## Licence

The repo has no open-source licence file. The guideline text belongs to Apple Inc. and is
reproduced from the public Human Interface Guidelines "for AI-assisted design review". Use it
internally; do not ship these files inside the product.

## Updating

Re-clone the repo at a newer commit into a scratch folder, read the diff of `SKILL.md`, then
replace `references/` and `SKILL.md` here and update the commit above.
