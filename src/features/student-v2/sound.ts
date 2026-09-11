import { useSyncExternalStore } from "react"
import { bindUISFX, createUISFX, type CueName, type PackName, type UISFXPlayer } from "uisfx"

/**
 * Sound for the new élève space — UI SFX (`uisfx`): 78 semantic cues ×
 * 12 interchangeable « feels », synthesized in the browser from recipes (no
 * audio files fetched), MIT code, CC0 sounds.
 *
 * Every action names its MEANING, not a file: `select`, `expand`, `success`,
 * `achievement`… so the whole space can change personality from the states
 * dock (`setSoundPack`) without touching a component.
 *
 * Two ways to fire a cue:
 *  - declaratively: `data-uisfx="select"` on the clickable element — the
 *    document-level binding (`useSoundBinding`, mounted by V2Layout) plays it
 *    on click, dialogs and menus included (they portal to <body>);
 *  - in code, for outcomes that depend on state: `sfx("achievement")`.
 *
 * Sound only ever REINFORCES what the screen already shows, starts only after
 * a real click or key, and the élève can mute it (top bar) — the choice is
 * remembered.
 */

/** The default feel — the library's own pick for gamified learning. */
export const DEFAULT_PACK: PackName = "arcade"

const PREF_KEY = "wael-v2:sound"

let player: UISFXPlayer | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function soundPlayer(): UISFXPlayer {
  if (!player) {
    player = createUISFX({ pack: DEFAULT_PACK, volume: 0.6, preferences: { key: PREF_KEY } })
  }
  return player
}

/** Play a cue from code. Never throws — sound is a garnish, not a feature. */
export function sfx(cue: CueName) {
  try {
    soundPlayer().play(cue)
  } catch {
    /* no Web Audio here — the screen already said it */
  }
}

export function setSoundEnabled(on: boolean) {
  soundPlayer().setEnabled(on)
  emit()
  if (on) sfx("toggle-on")
}

export function setSoundPack(pack: PackName) {
  soundPlayer().setPack(pack)
  emit()
  // Let the élève hear what they picked.
  sfx("success")
}

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

/** `[enabled, pack]`, kept in step across every component that shows them. */
export function useSound(): { enabled: boolean; pack: PackName } {
  const enabled = useSyncExternalStore(subscribe, () => soundPlayer().isEnabled(), () => false)
  const pack = useSyncExternalStore(subscribe, () => soundPlayer().getPack(), () => DEFAULT_PACK)
  return { enabled, pack }
}

/**
 * Mount once, for as long as the space is on screen: binds `data-uisfx` on the
 * whole document, and unlocks Web Audio on the first real pointer or key (the
 * browser refuses to start audio before one).
 */
export function mountSound(): () => void {
  const { unbind } = bindUISFX(document, { player: soundPlayer() })
  const unlock = () => {
    void soundPlayer().unlock()
    window.removeEventListener("pointerdown", unlock, true)
    window.removeEventListener("keydown", unlock, true)
  }
  window.addEventListener("pointerdown", unlock, true)
  window.addEventListener("keydown", unlock, true)
  return () => {
    unbind()
    soundPlayer().stopAll()
    window.removeEventListener("pointerdown", unlock, true)
    window.removeEventListener("keydown", unlock, true)
  }
}

/** The packs as the dock lists them, with a word on each feel. */
export const PACK_LABELS: { pack: PackName; label: string; hint: string }[] = [
  { pack: "arcade", label: "Arcade", hint: "ألعاب، سلاسل، تعلّم بالنقاط" },
  { pack: "rubber", label: "Rubber", hint: "لعب، مرح، ترتدّ" },
  { pack: "soft", label: "Soft", hint: "دافي ومطمّن" },
  { pack: "organic", label: "Organic", hint: "خشب وماء — تعليم" },
  { pack: "glass", label: "Glass", hint: "بلّوري ولامع" },
  { pack: "dreamy", label: "Dreamy", hint: "خفيف وحالم" },
  { pack: "zen", label: "Zen", hint: "هادي، للتركيز" },
  { pack: "minimal", label: "Minimal", hint: "ناشف وخفيف برشا" },
  { pack: "scifi", label: "Sci-fi", hint: "هولوغرام وديجيتال" },
  { pack: "mechanical", label: "Mechanical", hint: "أزرار ومفاتيح" },
  { pack: "studio", label: "Studio", hint: "دقيق ودافي" },
  { pack: "cinematic", label: "Cinematic", hint: "ضربات عميقة" },
]
