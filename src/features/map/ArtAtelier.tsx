import { useEffect, useMemo, useRef, useState, type DragEvent } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { Link, useNavigate } from "react-router-dom"
import { AlertTriangle, CheckCircle2, ChevronLeft, ImagePlus, Layers, Pause, Play, Sparkles, Trash2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { mountSound, sfx } from "@/features/student-v2/sound"
import { gBtn, gCta, gPanel } from "@/features/game/shared/ui"
import { measureAlpha, parseArtName, setSessionArt, clearSessionArt, sessionArtCount, TEMPLATES, type AlphaInfo, type ArtName, type Template, type TemplateKind } from "./art"
import { artNameOf, BuildingArt, spriteFrame } from "./BuildingArt"
import { iso } from "./iso"
import { PropDrawing } from "./Props"
import { BUILDINGS, type Building, type PropKind } from "./townLayout"
import "./map.css"

/**
 * `/map/atelier` — check the artist's files before they go into the town.
 *
 * Drop PNGs (or load samples drawn from the town's own code art): each file is
 * read against the guide (`village-art-guide.md`) — name, canvas size,
 * transparency, nothing touching the edge, footprint near the anchor — and
 * shown on its template with the tile diamond and the anchor cross, at fit /
 * 200 % / 64 px, over dark, light or a checkerboard. Levels of one asset get
 * the flip test; character layers get the toggle test. « Essayer dans la
 * ville » hands the valid files to the town for this session (in memory).
 */

type Item = {
  id: string
  name: string
  url: string
  parsed: ArtName | null
  info: AlphaInfo | null
  sample?: boolean
}

type Zoom = "fit" | "200" | "64"
type Bg = "checker" | "dark" | "light"

export default function ArtAtelier() {
  const navigate = useNavigate()
  useEffect(() => mountSound(), [])
  useEffect(() => {
    const before = document.title
    document.title = "Atelier des assets — Wael Academy"
    return () => {
      document.title = before
    }
  }, [])

  const [items, setItems] = useState<Item[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [zoom, setZoom] = useState<Zoom>("fit")
  const [bg, setBg] = useState<Bg>("checker")
  const [guides, setGuides] = useState(true)
  const [dragOver, setDragOver] = useState(false)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  /* ---- adding files */
  const add = async (files: { name: string; url: string; sample?: boolean }[]) => {
    if (!files.length) return
    const next: Item[] = await Promise.all(
      files.map(async (f) => ({
        id: crypto.randomUUID(),
        name: f.name,
        url: f.url,
        parsed: parseArtName(f.name),
        info: await measureAlpha(f.url).catch(() => null),
        sample: f.sample,
      })),
    )
    setItems((list) => {
      // a file with the same name replaces the older one
      const names = new Set(next.map((n) => n.name))
      return [...list.filter((i) => !names.has(i.name)), ...next].sort((a, z) => a.name.localeCompare(z.name))
    })
    setSelectedId(next[0].id)
  }
  const addFiles = (list: FileList | null) => {
    const files = [...(list ?? [])].filter((f) => f.type === "image/png" || /\.png$/i.test(f.name) || f.type.startsWith("image/"))
    if (!files.length) return
    sfx("drop")
    void add(files.map((f) => ({ name: f.name, url: URL.createObjectURL(f) })))
  }
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    addFiles(e.dataTransfer.files)
  }
  const loadSamples = async () => {
    setBusy(true)
    try {
      await add(await makeSamples())
      setToast("Exemples chargés : dessinés depuis la ville, aux formats du guide")
    } finally {
      setBusy(false)
    }
  }
  const remove = (id: string) => {
    setItems((list) => list.filter((i) => i.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const selected = items.find((i) => i.id === selectedId) ?? items[0] ?? null
  const template = selected ? templateOf(selected) : TEMPLATES.building
  const family = useMemo(() => (selected?.parsed ? items.filter((i) => i.parsed?.asset === selected.parsed!.asset) : []), [items, selected])

  /* ---- flip test: cycle through the files of one asset (levels / variants) */
  const flipSet = useMemo(() => family.filter((i) => i.parsed?.kind !== "character" || i.parsed.part === "base"), [family])
  const [flipping, setFlipping] = useState(false)
  const [onion, setOnion] = useState(false)
  useEffect(() => {
    if (!flipping || flipSet.length < 2) return
    const t = setInterval(() => {
      setSelectedId((cur) => {
        const i = flipSet.findIndex((f) => f.id === cur)
        return flipSet[(i + 1) % flipSet.length].id
      })
    }, 650)
    return () => clearInterval(t)
  }, [flipping, flipSet])
  const prevInFlip = flipSet.length > 1 && selected ? flipSet[(flipSet.findIndex((f) => f.id === selected.id) - 1 + flipSet.length) % flipSet.length] : null

  /* ---- toggle test: character patches over the base */
  const isCharacter = selected?.parsed?.kind === "character"
  const base = isCharacter ? family.find((i) => i.parsed?.part === "base") ?? null : null
  const patches = useMemo(() => (isCharacter ? family.filter((i) => i.parsed?.part !== "base") : []), [isCharacter, family])
  const [onPatches, setOnPatches] = useState<Set<string>>(new Set())
  const [blink, setBlink] = useState(false)
  useEffect(() => {
    if (!blink) return
    const eyes = patches.find((p) => p.parsed?.part === "eyes_closed")
    if (!eyes) return
    const t = setInterval(() => {
      setOnPatches((s) => {
        const n = new Set(s)
        if (n.has(eyes.id)) n.delete(eyes.id)
        else n.add(eyes.id)
        return n
      })
    }, 450)
    return () => clearInterval(t)
  }, [blink, patches])

  /* ---- try in town */
  const usable = items.filter((i) => i.parsed && (i.parsed.kind === "building" || i.parsed.kind === "prop"))
  const tryInTown = () => {
    if (!usable.length) {
      sfx("blocked")
      setToast("Aucun fichier bâtiment ou objet à essayer (noms building_… ou prop_…)")
      return
    }
    setSessionArt(usable.map((i) => ({ name: i.name, url: i.url })))
    sfx("success")
    navigate("/map")
  }
  const [sessionCount, setSessionCount] = useState(sessionArtCount())

  return (
    <div
      lang="fr"
      dir="ltr"
      className="min-h-dvh w-full"
      style={{ background: "var(--v2-canvas), var(--v2-canvas-base)" }}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={(e) => {
        if (e.currentTarget === e.target) setDragOver(false)
      }}
      onDrop={onDrop}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-[max(6rem,calc(var(--sai-bottom)+6rem))] pt-[max(1rem,var(--sai-top))] md:px-6 md:pb-10 md:pt-6">
        {/* header */}
        <header className="flex items-center gap-3">
          <Link to="/map" data-uisfx="back" aria-label="Retour à la ville" className={cn(gBtn, "size-12 shrink-0 rounded-full p-0")}>
            <ChevronLeft className="size-6" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate font-display text-[calc(14px*var(--ts))] font-bold text-v2-ink">Atelier des assets</h1>
            <p className="truncate text-[calc(8.5px*var(--ts))] font-semibold text-v2-ink-2">Vérifie les fichiers de l'artiste avant de les mettre dans la ville</p>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          {/* files */}
          <section className={cn(gPanel, "flex flex-col gap-3 p-4")} aria-label="Fichiers">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              data-uisfx="open"
              className={cn(
                "flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-5 text-center transition",
                dragOver ? "border-v2-brand bg-v2-brand/10" : "border-v2-ink/20 hover:border-v2-brand/50 hover:bg-v2-brand/5",
              )}
            >
              <ImagePlus className="size-7 text-v2-brand" />
              <span className="text-[calc(9.5px*var(--ts))] font-bold text-v2-ink">Dépose des PNG ici</span>
              <span className="text-[calc(8px*var(--ts))] font-semibold text-v2-ink-2">ou touche pour choisir · rien n'est envoyé, tout reste sur cet appareil</span>
            </button>
            <input ref={inputRef} type="file" accept="image/png" multiple hidden onChange={(e) => (addFiles(e.target.files), (e.target.value = ""))} />
            <button type="button" onClick={loadSamples} disabled={busy} data-uisfx="press" className={cn(gBtn, "h-11 px-4 text-[calc(9px*var(--ts))]")}>
              <Sparkles className="size-4 text-v2-brand" /> {busy ? "Préparation…" : "Charger des exemples"}
            </button>

            {items.length === 0 ? (
              <p className="rounded-2xl bg-v2-ink/[0.04] px-4 py-5 text-center text-[calc(8.5px*var(--ts))] font-semibold leading-relaxed text-v2-ink-2">
                Aucun fichier pour l'instant. Les noms suivent le guide : <code className="font-mono text-v2-ink">building_library_l2.png</code>, <code className="font-mono text-v2-ink">prop_tree_01.png</code>…
              </p>
            ) : (
              <ul className="-mx-1 flex max-h-[46vh] flex-col gap-1 overflow-y-auto px-1 md:max-h-[60vh]">
                {items.map((i) => {
                  const fails = checksOf(i).filter((c) => c.state === "fail").length
                  const warns = checksOf(i).filter((c) => c.state === "warn").length
                  const active = i.id === selected?.id
                  return (
                    <li key={i.id} className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => (setSelectedId(i.id), setFlipping(false))}
                        data-uisfx="select"
                        aria-pressed={active}
                        className={cn(
                          "flex min-h-12 min-w-0 flex-1 items-center gap-2.5 rounded-xl border-2 px-2 py-1.5 text-start transition",
                          active ? "border-v2-brand bg-v2-brand/10" : "border-transparent hover:bg-v2-ink/[0.04]",
                        )}
                      >
                        <img src={i.url} alt="" className="size-9 shrink-0 rounded-lg bg-v2-ink/[0.06] object-contain" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-mono text-[calc(8px*var(--ts))] font-semibold text-v2-ink">{i.name}</span>
                          <span className="block truncate text-[calc(7.5px*var(--ts))] font-semibold text-v2-ink-2">
                            {templateOf(i).label}
                            {i.sample ? " · exemple" : ""}
                          </span>
                        </span>
                        <StatusDot fails={fails} warns={warns} />
                      </button>
                      <button type="button" onClick={() => remove(i.id)} data-uisfx="delete" aria-label={`Retirer ${i.name}`} className="grid size-11 shrink-0 place-items-center rounded-xl text-v2-ink-2 hover:bg-v2-live/10 hover:text-v2-live">
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}

            {sessionCount > 0 && (
              <div className="flex items-center justify-between gap-2 rounded-2xl bg-v2-brand/10 px-3 py-2 text-[calc(8px*var(--ts))] font-semibold text-v2-ink">
                <span>{sessionCount} fichier{sessionCount > 1 ? "s" : ""} déjà dans la ville (cette session)</span>
                <button
                  type="button"
                  data-uisfx="undo"
                  onClick={() => {
                    clearSessionArt()
                    setSessionCount(0)
                    setToast("La ville reprend ses dessins d'origine")
                  }}
                  className="min-h-11 rounded-xl px-2 font-bold text-v2-brand-text hover:bg-v2-brand/10"
                >
                  Retirer
                </button>
              </div>
            )}
          </section>

          {/* stage */}
          {/* phones: once files are in, the preview comes first — checking is the job here */}
          <section className={cn(gPanel, "flex min-w-0 flex-col gap-3 p-3 md:order-none md:p-4", items.length > 0 && "order-first")} aria-label="Aperçu">
            <div className="flex flex-wrap items-center gap-2">
              <span className="me-auto rounded-full bg-v2-ink/[0.06] px-3 py-1.5 text-[calc(8px*var(--ts))] font-bold text-v2-ink">
                {template.label} · {template.w} × {template.h}
                {template.ax !== undefined && ` · ancre ${template.ax}, ${template.ay}`}
              </span>
              <Segmented
                label="Zoom"
                value={zoom}
                onChange={setZoom}
                options={[
                  ["fit", "Ajusté"],
                  ["200", "200 %"],
                  ["64", "64 px"],
                ]}
              />
              <Segmented
                label="Fond"
                value={bg}
                onChange={setBg}
                options={[
                  ["checker", "Damier"],
                  ["dark", "Sombre"],
                  ["light", "Clair"],
                ]}
              />
              <button
                type="button"
                onClick={() => setGuides((g) => !g)}
                data-uisfx={guides ? "toggle-off" : "toggle-on"}
                aria-pressed={guides}
                className={cn(gBtn, "h-11 px-3 text-[calc(8px*var(--ts))]", guides && "border-v2-brand/50 bg-v2-brand/10")}
              >
                <Layers className="size-4" /> Repères
              </button>
            </div>

            <Stage
              template={template}
              zoom={zoom}
              bg={bg}
              guides={guides}
              layers={
                isCharacter && base
                  ? [base.url, ...patches.filter((p) => onPatches.has(p.id)).map((p) => p.url)]
                  : selected
                    ? [...(onion && prevInFlip && prevInFlip.id !== selected.id ? [prevInFlip.url] : []), selected.url]
                    : []
              }
              onionFirst={!isCharacter && onion && !!prevInFlip && prevInFlip.id !== selected?.id}
              ground={template.kind === "ground"}
              empty={!selected}
            />

            {/* tests on a family of files */}
            {flipSet.length > 1 && !isCharacter && (
              <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-v2-ink/[0.04] p-2">
                <span className="me-auto ps-1 text-[calc(8.5px*var(--ts))] font-bold text-v2-ink">
                  Test de bascule · {flipSet.length} versions de <span className="font-mono">{selected?.parsed?.asset}</span>
                </span>
                <button type="button" onClick={() => setOnion((o) => !o)} data-uisfx={onion ? "toggle-off" : "toggle-on"} aria-pressed={onion} className={cn(gBtn, "h-11 px-3 text-[calc(8px*var(--ts))]", onion && "border-v2-brand/50 bg-v2-brand/10")}>
                  Pelure d'oignon
                </button>
                <button type="button" onClick={() => setFlipping((f) => !f)} data-uisfx={flipping ? "toggle-off" : "play"} className={cn(gCta, "h-11 px-4 text-[calc(8.5px*var(--ts))]")}>
                  {flipping ? <Pause className="size-4" /> : <Play className="size-4" />} {flipping ? "Arrêter" : "Basculer"}
                </button>
              </div>
            )}
            {isCharacter && (
              <div className="flex flex-col gap-2 rounded-2xl bg-v2-ink/[0.04] p-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="me-auto ps-1 text-[calc(8.5px*var(--ts))] font-bold text-v2-ink">Test des calques · {base ? `sur ${base.name}` : "il manque le fichier _base"}</span>
                  {patches.some((p) => p.parsed?.part === "eyes_closed") && (
                    <button type="button" onClick={() => setBlink((b) => !b)} data-uisfx={blink ? "toggle-off" : "play"} className={cn(gCta, "h-11 px-4 text-[calc(8.5px*var(--ts))]")}>
                      {blink ? <Pause className="size-4" /> : <Play className="size-4" />} Clignement
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {patches.map((p) => {
                    const on = onPatches.has(p.id)
                    return (
                      <button
                        key={p.id}
                        type="button"
                        aria-pressed={on}
                        data-uisfx={on ? "toggle-off" : "toggle-on"}
                        onClick={() =>
                          setOnPatches((s) => {
                            const n = new Set(s)
                            if (on) n.delete(p.id)
                            else n.add(p.id)
                            return n
                          })
                        }
                        className={cn("min-h-11 rounded-full border-2 px-3 font-mono text-[calc(7.5px*var(--ts))] font-semibold", on ? "border-v2-brand bg-v2-brand/10 text-v2-ink" : "border-v2-ink/15 text-v2-ink-2")}
                      >
                        {p.parsed?.part}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* checks */}
            {selected && (
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <h2 className="mb-1.5 text-[calc(8px*var(--ts))] font-bold uppercase tracking-[.08em] text-v2-ink-2">Vérifié automatiquement</h2>
                  <ul className="flex flex-col gap-1">
                    {checksOf(selected).map((c) => (
                      <CheckRow key={c.label} state={c.state} label={c.label} detail={c.detail} />
                    ))}
                  </ul>
                  <TownMatch item={selected} />
                </div>
                <div>
                  <h2 className="mb-1.5 text-[calc(8px*var(--ts))] font-bold uppercase tracking-[.08em] text-v2-ink-2">À vérifier à l'œil</h2>
                  <ManualChecks key={selected.id} />
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* the one action: try the files in the town */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(1rem,calc(var(--sai-bottom)+0.5rem))] md:static md:mx-auto md:max-w-6xl md:justify-end md:px-6 md:pb-8">
        <button type="button" onClick={tryInTown} className={cn(gCta, "h-12 w-full max-w-md px-6 text-[calc(9.5px*var(--ts))] md:w-auto")}>
          Essayer dans la ville{usable.length ? ` · ${usable.length} fichier${usable.length > 1 ? "s" : ""}` : ""}
        </button>
      </div>

      {toast && (
        <div role="status" className="pointer-events-none fixed inset-x-0 top-[max(1rem,var(--sai-top))] z-[70] flex justify-center px-4">
          <div className="flex max-w-md items-center gap-2.5 rounded-full border-2 border-v2-ink/10 bg-v2-surface px-4 py-2.5 text-[calc(8.5px*var(--ts))] font-semibold text-v2-ink shadow-[0_8px_24px_rgb(21_58_45/0.16)] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-3">
            <CheckCircle2 className="size-5 shrink-0 text-[var(--v2-edge-cta,#5bcd3f)]" />
            {toast}
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- stage */

function Stage({ template: t, zoom, bg, guides, layers, onionFirst, ground, empty }: { template: Template; zoom: Zoom; bg: Bg; guides: boolean; layers: string[]; onionFirst: boolean; ground: boolean; empty: boolean }) {
  const bgClass = bg === "dark" ? "bg-[#0f2147]" : bg === "light" ? "bg-white" : "atelier-checker" // #0f2147: the map's night sky (map.css)
  const svg = (w?: number) => (
    <svg viewBox={`0 0 ${t.w} ${t.h}`} width={w} className={cn("block", w ? "" : "h-full max-h-[56vh] w-full")} style={{ direction: "ltr" }} aria-hidden>
      {ground && layers.length ? (
        // seamless check: 2 × 2 copies
        <g>
          {[0, 1].flatMap((r) => [0, 1].map((c) => <image key={`${r}${c}`} href={layers[layers.length - 1]} x={(c * t.w) / 2} y={(r * t.h) / 2} width={t.w / 2} height={t.h / 2} preserveAspectRatio="none" />))}
        </g>
      ) : (
        layers.map((url, i) => <image key={url + i} href={url} x={0} y={0} width={t.w} height={t.h} preserveAspectRatio="none" opacity={onionFirst && i === 0 ? 0.4 : 1} />)
      )}
      {guides && !(w && w < 100) && <Guides t={t} ground={ground} />}
    </svg>
  )
  return (
    <div className="flex flex-col gap-2 md:flex-row">
      <div className={cn("relative min-h-[260px] flex-1 overflow-auto rounded-2xl border-2 border-v2-ink/10", bgClass, zoom === "fit" && "grid place-items-center p-2")}>
        {zoom === "fit" && svg()}
        {zoom === "200" && <div className="p-2">{svg(t.w * 2 / (window.devicePixelRatio || 1))}</div>}
        {zoom === "64" && <div className="grid min-h-[260px] place-items-center">{svg(64)}</div>}
        {empty && (
          <p className="pointer-events-none absolute inset-x-4 bottom-4 rounded-xl bg-v2-surface/90 px-3 py-2 text-center text-[calc(8px*var(--ts))] font-semibold text-v2-ink-2">
            Le gabarit du guide, prêt à recevoir un fichier
          </p>
        )}
      </div>
      {/* always-on silhouette check at 64 px */}
      <div className="flex shrink-0 items-center gap-2 md:w-24 md:flex-col md:justify-start">
        <div className={cn("grid size-20 place-items-center rounded-xl border-2 border-v2-ink/10", bgClass)}>{svg(64)}</div>
        <span className="text-[calc(7.5px*var(--ts))] font-semibold text-v2-ink-2 md:text-center">Silhouette à 64 px : elle doit rester lisible</span>
      </div>
    </div>
  )
}

/** The template's guides: canvas edge, tile diamond and the red anchor cross. */
function Guides({ t, ground }: { t: Template; ground: boolean }) {
  const sw = t.w / 300
  return (
    <g pointerEvents="none" fill="none">
      <rect x={sw / 2} y={sw / 2} width={t.w - sw} height={t.h - sw} stroke="#0491a5" strokeWidth={sw} strokeDasharray={`${sw * 4} ${sw * 3}`} opacity={0.7} />
      {ground && <path d={`M${t.w / 2} 0V${t.h}M0 ${t.h / 2}H${t.w}`} stroke="#0491a5" strokeWidth={sw} strokeDasharray={`${sw * 4} ${sw * 3}`} opacity={0.6} />}
      {t.tile && t.ax !== undefined && (
        <polygon points={`${t.ax},${t.ay! - 256} ${t.ax + 512},${t.ay} ${t.ax},${t.ay! + 256} ${t.ax - 512},${t.ay}`} fill="rgb(138 255 107 / 0.12)" stroke="#5bcd3f" strokeWidth={sw * 1.2} />
      )}
      {!t.tile && t.ax !== undefined && <line x1={t.ax - t.w * 0.3} y1={t.ay} x2={t.ax + t.w * 0.3} y2={t.ay} stroke="#5bcd3f" strokeWidth={sw * 1.2} strokeDasharray={`${sw * 3} ${sw * 2}`} />}
      {t.ax !== undefined && (
        <g stroke="#ff3b3e" strokeWidth={sw * 1.4} strokeLinecap="round">
          {/* the anchor: same pixel in every variant, level and frame */}
          <line x1={t.ax - sw * 8} y1={t.ay} x2={t.ax + sw * 8} y2={t.ay} />
          <line x1={t.ax} y1={t.ay! - sw * 8} x2={t.ax} y2={t.ay! + sw * 8} />
        </g>
      )}
    </g>
  )
}

/* --------------------------------------------------------------- checks */

type CheckState = "ok" | "warn" | "fail"
type Check = { state: CheckState; label: string; detail?: string }

function templateOf(i: Item): Template {
  const kind: TemplateKind = i.parsed?.kind ?? guessKind(i)
  return TEMPLATES[kind]
}
/** A file with a wrong name still gets a template: the one its size matches. */
function guessKind(i: Item): TemplateKind {
  const w = i.info?.w
  const h = i.info?.h
  const hit = (Object.values(TEMPLATES) as Template[]).find((t) => t.w === w && t.h === h && t.kind !== "ground")
  return hit?.kind ?? "building"
}

function checksOf(i: Item): Check[] {
  const t = templateOf(i)
  const out: Check[] = []
  out.push(
    i.parsed
      ? { state: "ok", label: "Nom conforme (§ 9)", detail: describe(i.parsed) }
      : { state: "fail", label: "Nom conforme (§ 9)", detail: "minuscules et _ : building_<nom>_l<niveau>.png, prop_<nom>_<nn>.png, ground_<type>_<nn>.png, <nom>_<partie>.png" },
  )
  if (!i.info) {
    out.push({ state: "fail", label: "Image lisible", detail: "le fichier n'a pas pu être ouvert" })
    return out
  }
  out.push(
    i.info.w === t.w && i.info.h === t.h
      ? { state: "ok", label: "Taille du canvas (§ 3)", detail: `${t.w} × ${t.h}` }
      : { state: "fail", label: "Taille du canvas (§ 3)", detail: `${i.info.w} × ${i.info.h} au lieu de ${t.w} × ${t.h}` },
  )
  if (t.kind === "ground") {
    out.push(i.info.hasTransparency ? { state: "warn", label: "Texture pleine (§ 5)", detail: "une texture de sol ne devrait pas avoir de trous" } : { state: "ok", label: "Texture pleine (§ 5)" })
    return out
  }
  out.push(i.info.hasTransparency ? { state: "ok", label: "Fond transparent (§ 9)" } : { state: "fail", label: "Fond transparent (§ 9)", detail: "aucun pixel transparent : PNG-32 avec fond transparent" })
  out.push(i.info.touchesEdge ? { state: "fail", label: "Rien ne touche le bord (§ 1.8)", detail: "des pixels visibles touchent le bord du canvas" } : { state: "ok", label: "Rien ne touche le bord (§ 1.8)" })
  const box = i.info.box
  if (box && t.ay !== undefined && i.info.w === t.w && i.info.h === t.h) {
    if (t.tile) {
      // the footprint sits in the tile diamond: the art's lowest pixels near its bottom half
      const low = t.ay + 256
      const ok = box.bottom >= t.ay && box.bottom <= low + 24
      out.push({ state: ok ? "ok" : "warn", label: "Emprise sur la case (§ 3)", detail: ok ? `bas de l'objet à ${Math.round(low - box.bottom)} px du bas de la case` : `bas de l'objet à ${Math.round(box.bottom)} px — la case va de ${t.ay} à ${low}` })
    } else {
      const ok = Math.abs(box.bottom - t.ay) <= 24
      out.push({ state: ok ? "ok" : "warn", label: "Pieds sur l'ancre (§ 3)", detail: `bas du personnage à ${Math.round(box.bottom - t.ay)} px de l'ancre` })
    }
  }
  return out
}

function describe(p: ArtName) {
  if (p.kind === "building") return `bâtiment « ${p.name} »${p.level !== undefined ? ` · niveau ${p.level}` : ""}`
  if (p.kind === "prop") return `objet « ${p.name} » · variante ${p.index}`
  if (p.kind === "ground") return `sol « ${p.name} » · variante ${p.index}`
  return `« ${p.name} » · calque ${p.part}`
}

/** Which building of the town this file would dress, if any. */
function TownMatch({ item }: { item: Item }) {
  const p = item.parsed
  if (!p || p.kind !== "building") return null
  const matches = BUILDINGS.filter((b) => artNameOf(b) === p.name)
  return (
    <p className={cn("mt-2 rounded-xl px-3 py-2 text-[calc(8px*var(--ts))] font-semibold", matches.length ? "bg-v2-cta/25 text-v2-ink" : "bg-v2-done/15 text-v2-ink")}>
      {matches.length ? (
        <>
          Dans la ville : {matches.map((b) => b.name.fr).join(", ")}
          {p.level !== undefined ? ` (niveau ${p.level})` : " (tous les niveaux sans fichier propre)"}
        </>
      ) : (
        <>Aucun bâtiment de la ville ne s'appelle « {p.name} ». Noms attendus : {[...new Set(BUILDINGS.map(artNameOf))].join(", ")}</>
      )}
    </p>
  )
}

const MANUAL = ["Isométrique 2:1, sans perspective, coin avant vers le bas", "Lumière en haut à gauche", "Net à 200 % : pas de bavures ni de bruit d'IA", "Aucun texte, lettre, logo ni filigrane", "Bords propres sur fond sombre et clair"]
function ManualChecks() {
  const [done, setDone] = useState<Set<number>>(new Set())
  return (
    <ul className="flex flex-col gap-1">
      {MANUAL.map((m, i) => {
        const on = done.has(i)
        return (
          <li key={m}>
            <button
              type="button"
              aria-pressed={on}
              data-uisfx={on ? "toggle-off" : "check"}
              onClick={() =>
                setDone((s) => {
                  const n = new Set(s)
                  if (on) n.delete(i)
                  else n.add(i)
                  return n
                })
              }
              className="flex min-h-11 w-full items-center gap-2.5 rounded-xl px-2 text-start hover:bg-v2-ink/[0.04]"
            >
              <span className={cn("grid size-5 shrink-0 place-items-center rounded-md border-2", on ? "border-[var(--v2-edge-cta,#5bcd3f)] bg-v2-cta" : "border-v2-ink/25")}>{on && <CheckCircle2 className="size-3.5 text-v2-on-cta" />}</span>
              <span className={cn("text-[calc(8.5px*var(--ts))] font-semibold", on ? "text-v2-ink-2 line-through" : "text-v2-ink")}>{m}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function CheckRow({ state, label, detail }: Check) {
  const Icon = state === "ok" ? CheckCircle2 : state === "warn" ? AlertTriangle : XCircle
  return (
    <li className="flex gap-2.5 rounded-xl px-2 py-1.5">
      <Icon className={cn("mt-0.5 size-5 shrink-0", state === "ok" ? "text-[var(--v2-edge-cta,#5bcd3f)]" : state === "warn" ? "text-v2-done" : "text-v2-live")} />
      <span className="min-w-0">
        <span className="block text-[calc(8.5px*var(--ts))] font-bold text-v2-ink">{label}</span>
        {detail && <span className="block break-words text-[calc(7.5px*var(--ts))] font-semibold text-v2-ink-2">{detail}</span>}
      </span>
    </li>
  )
}

function StatusDot({ fails, warns }: { fails: number; warns: number }) {
  const label = fails ? `${fails} problème${fails > 1 ? "s" : ""}` : warns ? `${warns} à vérifier` : "conforme"
  return <span title={label} aria-label={label} className={cn("size-3 shrink-0 rounded-full", fails ? "bg-v2-live" : warns ? "bg-v2-done" : "bg-[var(--v2-edge-cta,#5bcd3f)]")} />
}

function Segmented<T extends string>({ label, value, onChange, options }: { label: string; value: T; onChange: (v: T) => void; options: [T, string][] }) {
  return (
    <div role="group" aria-label={label} className="flex rounded-2xl border-2 border-v2-ink/15 bg-v2-surface p-0.5">
      {options.map(([v, text]) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          data-uisfx="select"
          onClick={() => onChange(v)}
          className={cn("min-h-10 rounded-xl px-2.5 text-[calc(8px*var(--ts))] font-bold transition", value === v ? "bg-v2-ink text-white" : "text-v2-ink-2 hover:text-v2-ink")}
        >
          {text}
        </button>
      ))}
    </div>
  )
}

/* -------------------------------------------------------------- samples */

/**
 * Sample files drawn from the town's own code art, exported exactly as the
 * guide asks (canvas, anchor, transparent PNG) — so the whole path can be
 * tried before the first real asset arrives. (They carry the code art's
 * painted signs, which real art must not: § 1.7.)
 */
async function makeSamples(): Promise<{ name: string; url: string; sample: true }[]> {
  const school = BUILDINGS.find((b) => b.kind === "school")!
  const shop = BUILDINGS.find((b) => b.kind === "shop")!
  const jobs: { name: string; svg: string; w: number; h: number }[] = []
  for (const [b, levels] of [
    [school, [1, 2, 3]],
    [shop, [1, 3]],
  ] as [Building, number[]][]) {
    for (const level of levels) {
      const bl = { ...b, level }
      const f = spriteFrame(bl)
      const t = TEMPLATES.building
      jobs.push({
        name: `building_${artNameOf(b)}_l${level}.png`,
        w: t.w,
        h: t.h,
        svg: renderToStaticMarkup(
          <svg xmlns="http://www.w3.org/2000/svg" width={t.w} height={t.h} viewBox={`${f.x} ${f.y} ${f.w} ${f.h}`}>
            <BuildingArt b={bl} />
          </svg>,
        ),
      })
    }
  }
  const tp = TEMPLATES.prop
  ;(["tree", "pine"] as PropKind[]).forEach((kind, k) =>
    [0, 1].forEach((variant) => {
      const c = iso(0.5, 0.5)
      const s = 64 / 1024
      jobs.push({
        name: `prop_${kind}_0${variant + 1}.png`,
        w: tp.w,
        h: tp.h,
        svg: renderToStaticMarkup(
          <svg xmlns="http://www.w3.org/2000/svg" width={tp.w} height={tp.h} viewBox={`${c.x - tp.ax! * s} ${c.y - tp.ay! * s} ${tp.w * s} ${tp.h * s}`}>
            <PropDrawing p={{ id: "sample", kind, gx: 0, gy: 0, dx: 0, dy: 0, scale: 1, variant: variant + k }} />
          </svg>,
        ),
      })
    }),
  )
  return Promise.all(jobs.map(async (j) => ({ name: j.name, url: await svgToPng(j.svg, j.w, j.h), sample: true as const })))
}

function svgToPng(svg: string, w: number, h: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const src = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }))
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext("2d")
      if (!ctx) return reject(new Error("no 2d context"))
      ctx.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(src)
      canvas.toBlob((blob) => (blob ? resolve(URL.createObjectURL(blob)) : reject(new Error("toBlob failed"))), "image/png")
    }
    img.onerror = () => reject(new Error("svg render failed"))
    img.src = src
  })
}

