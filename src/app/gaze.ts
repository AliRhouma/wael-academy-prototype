import { useCallback, useEffect, useSyncExternalStore } from "react"

/**
 * The master switch for Wael's cursor-following eyes, and the S key that flips it.
 *
 * The gaze is the one thing in the prototype that moves on its own. That is the
 * point of it, and it is also why it needs an off switch: it draws the eye while
 * someone is trying to talk over the screen, it is the wrong note in a
 * screenshot, and on a slow machine a grid of a dozen faces all tracking at once
 * is the only animation heavy enough to be felt. One key press and every face on
 * every screen goes back to its drawn gaze.
 *
 * OFF means the overlay is not there — `Eyes` renders nothing, the pointer
 * listener unsubscribes with the last instance, and what shows is the delivered
 * artwork untouched. It is not a paused animation; there is no overlay left.
 *
 * The state lives at module scope rather than in a context: every subject icon
 * on screen reads it, they are scattered across the tree, and none of them
 * belongs to a provider that would naturally own it. `useSyncExternalStore`
 * keeps them all in step off a single boolean.
 */
const KEY = "wael-gaze"

/**
 * Three settings, not two:
 *   on      the default — tracks, unless the system asks for reduced motion;
 *   off     silenced (S, or the new space's states dock);
 *   always  tracks EVEN under reduced motion. Only ever an explicit choice (the
 *           states dock offers it when it sees the system setting is what is
 *           holding the eyes still), never a default: honouring the setting is
 *           right until the person in front of the screen says otherwise.
 */
export type GazeMode = "on" | "off" | "always"

/** Off survives a refresh: someone who silenced the eyes to record a demo should
 *  not have them start moving again at the next reload. */
function initial(): GazeMode {
  try {
    const saved = localStorage.getItem(KEY)
    return saved === "off" || saved === "always" ? saved : "on"
  } catch {
    // Private-mode Safari throws on localStorage. The eyes are not worth a crash.
    return "on"
  }
}

let mode: GazeMode = initial()
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function subscribe(l: () => void): () => void {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function setGazeMode(next: GazeMode): void {
  if (next === mode) return
  mode = next
  try {
    localStorage.setItem(KEY, next)
  } catch {
    // Not being able to remember the choice is fine; honouring it now is not.
  }
  emit()
}

/** On/off, for callers that don't care about the reduced-motion override. */
export function setGaze(next: boolean): void {
  setGazeMode(next ? "on" : "off")
}

/** The full setting. `"off"` on the server, where the eyes never track. */
export function useGazeMode(): GazeMode {
  return useSyncExternalStore(
    subscribe,
    () => mode,
    () => "off",
  )
}

/** Whether the eyes should track at all (either "on" or "always"). */
export function useGaze(): boolean {
  return useGazeMode() !== "off"
}

/**
 * Binds S to the switch, once, at the app root.
 *
 * Keyed off `event.code`, not `event.key`, so it stays the PHYSICAL S whatever
 * layout is active — on an Arabic keyboard that key types س, and matching the
 * character would put the shortcut out of reach of exactly the people this app
 * is written for. Ignored while typing and under any modifier, so it can never
 * eat a letter or collide with a browser shortcut (⌘S / Ctrl+S above all).
 */
export function useGazeHotkey(): void {
  const toggle = useCallback(() => setGaze(mode === "off"), [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "KeyS") return
      if (event.altKey || event.ctrlKey || event.metaKey) return
      const target = event.target as HTMLElement | null
      if (target?.isContentEditable || target?.closest("input, textarea, select")) return
      event.preventDefault()
      toggle()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [toggle])
}
