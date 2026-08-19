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

/** Off survives a refresh: someone who silenced the eyes to record a demo should
 *  not have them start moving again at the next reload. */
function initial(): boolean {
  try {
    return localStorage.getItem(KEY) !== "off"
  } catch {
    // Private-mode Safari throws on localStorage. The eyes are not worth a crash.
    return true
  }
}

let on = initial()
const listeners = new Set<() => void>()

function emit() {
  for (const l of listeners) l()
}

function subscribe(l: () => void): () => void {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function setGaze(next: boolean): void {
  if (next === on) return
  on = next
  try {
    localStorage.setItem(KEY, next ? "on" : "off")
  } catch {
    // Not being able to remember the choice is fine; honouring it now is not.
  }
  emit()
}

/** Whether the eyes should track. `false` on the server, where they never do. */
export function useGaze(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => on,
    () => false,
  )
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
  const toggle = useCallback(() => setGaze(!on), [])

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
