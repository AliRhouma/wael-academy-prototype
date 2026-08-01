import { useCallback, useEffect, useRef, useState } from "react"

/**
 * A thin wrapper over the YouTube IFrame API.
 *
 * The élève's player needs its OWN control bar — a timeline plus vidéo
 * précédente / suivante that stay visible in fullscreen, which a plain
 * `<iframe>` can never expose. So the iframe is created through the IFrame API
 * (`controls: 0`) and we drive it: play/pause, real currentTime & duration,
 * seek, mute. No extra dependency — the API is a script tag YouTube serves.
 */

/** The slice of the YT.Player surface we actually use. */
export interface YTPlayer {
  playVideo(): void
  pauseVideo(): void
  seekTo(seconds: number, allowSeekAhead: boolean): void
  getCurrentTime(): number
  getDuration(): number
  mute(): void
  unMute(): void
  isMuted(): boolean
  loadVideoById(id: string): void
  destroy(): void
}

interface YTNamespace {
  Player: new (el: HTMLElement, config: unknown) => YTPlayer
}

interface YTWindow extends Window {
  YT?: YTNamespace
  onYouTubeIframeAPIReady?: () => void
}

let apiPromise: Promise<YTNamespace> | null = null

/** Loads (once) the IFrame API script and resolves with the `YT` namespace. */
function loadYouTubeApi(): Promise<YTNamespace> {
  if (apiPromise) return apiPromise
  apiPromise = new Promise<YTNamespace>((resolve) => {
    const w = window as YTWindow
    if (w.YT?.Player) {
      resolve(w.YT)
      return
    }
    const previous = w.onYouTubeIframeAPIReady
    w.onYouTubeIframeAPIReady = () => {
      previous?.()
      if (w.YT) resolve(w.YT)
    }
    if (!document.getElementById("yt-iframe-api")) {
      const script = document.createElement("script")
      script.id = "yt-iframe-api"
      script.src = "https://www.youtube.com/iframe_api"
      document.head.appendChild(script)
    }
  })
  return apiPromise
}

export interface YouTubeController {
  /** Attach this to an empty div — the iframe is mounted inside it. */
  hostRef: React.RefObject<HTMLDivElement | null>
  ready: boolean
  playing: boolean
  /** Seconds — polled while playing, updated immediately on seek. */
  time: number
  duration: number
  muted: boolean
  toggle: () => void
  seek: (seconds: number) => void
  /** Relative jump, clamped to [0, duration]. */
  nudge: (seconds: number) => void
  toggleMute: () => void
}

/**
 * Creates a player for `videoId` inside `hostRef` and keeps React in sync with
 * it. Changing `videoId` swaps the clip in place (no remount, no flash).
 */
export function useYouTubePlayer(videoId: string | undefined): YouTubeController {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  /** The clip the hook WANTS to be on — updated the moment `videoId` changes. */
  const loadedIdRef = useRef<string | undefined>(videoId)
  /** The clip the iframe was actually constructed with. */
  const createdIdRef = useRef<string | undefined>(videoId)

  /**
   * `new YT.Player()` returns an object whose methods only appear once the
   * iframe has booted (onReady). Touching it before that throws
   * "loadVideoById is not a function" — which is exactly what a fast click on
   * the next video does. So every caller goes through here.
   */
  const api = (): YTPlayer | null => {
    const p = playerRef.current
    return p && typeof p.loadVideoById === "function" ? p : null
  }

  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [muted, setMuted] = useState(false)

  // Create once. The API REPLACES the element it's given with the iframe, so it
  // gets a detached div we append ourselves — never a React-managed child.
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let cancelled = false

    const mount = document.createElement("div")
    mount.style.width = "100%"
    mount.style.height = "100%"
    host.appendChild(mount)

    loadYouTubeApi().then((YT) => {
      if (cancelled) return
      createdIdRef.current = loadedIdRef.current
      playerRef.current = new YT.Player(mount, {
        videoId: loadedIdRef.current,
        playerVars: {
          controls: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          iv_load_policy: 3,
          fs: 0,
        },
        events: {
          onReady: (e: { target: YTPlayer }) => {
            if (cancelled) return
            setReady(true)
            // Picked another video while this one was still booting: the swap
            // effect couldn't run then, so honour it now.
            const wanted = loadedIdRef.current
            if (wanted && wanted !== createdIdRef.current) {
              createdIdRef.current = wanted
              e.target.loadVideoById(wanted)
              setTime(0)
              setDuration(0)
              return
            }
            setDuration(e.target.getDuration())
            setMuted(e.target.isMuted())
          },
          onStateChange: (e: { data: number; target: YTPlayer }) => {
            if (cancelled) return
            setPlaying(e.data === 1)
            const d = e.target.getDuration()
            if (d) setDuration(d)
          },
        },
      })
    })

    return () => {
      cancelled = true
      playerRef.current?.destroy()
      playerRef.current = null
      host.replaceChildren()
    }
  }, [])

  // Swap the clip when the élève picks another video from the list.
  useEffect(() => {
    if (!videoId || videoId === loadedIdRef.current) return
    loadedIdRef.current = videoId
    const p = api()
    // Still booting — onReady picks the pending id up.
    if (!p) return
    createdIdRef.current = videoId
    p.loadVideoById(videoId)
    setTime(0)
    setDuration(0)
  }, [videoId])

  // Poll the head position — the API has no timeupdate event.
  useEffect(() => {
    if (!ready || !playing) return
    const id = window.setInterval(() => {
      const p = api()
      if (!p) return
      setTime(p.getCurrentTime())
      const d = p.getDuration()
      if (d) setDuration(d)
    }, 250)
    return () => window.clearInterval(id)
  }, [ready, playing])

  const toggle = useCallback(() => {
    const p = api()
    if (!p) return
    if (playing) p.pauseVideo()
    else p.playVideo()
  }, [playing])

  const seek = useCallback((seconds: number) => {
    const p = api()
    if (!p) return
    p.seekTo(seconds, true)
    setTime(seconds)
  }, [])

  const nudge = useCallback(
    (delta: number) => {
      const p = api()
      if (!p) return
      const next = Math.min(Math.max(p.getCurrentTime() + delta, 0), duration || Infinity)
      p.seekTo(next, true)
      setTime(next)
    },
    [duration],
  )

  const toggleMute = useCallback(() => {
    const p = api()
    if (!p) return
    if (p.isMuted()) p.unMute()
    else p.mute()
    setMuted(p.isMuted())
  }, [])

  return { hostRef, ready, playing, time, duration, muted, toggle, seek, nudge, toggleMute }
}

/**
 * Fullscreen state for one element, driven by the real Fullscreen API so the
 * browser chrome disappears too (our overlay controls then own the surface).
 */
export function useFullscreen(ref: React.RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === ref.current)
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [ref])

  const toggle = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
      return
    }
    const el = ref.current
    // Older Safari has no requestFullscreen on the element — degrade silently
    // rather than throw; the windowed player keeps every control anyway.
    if (el?.requestFullscreen) void el.requestFullscreen().catch(() => undefined)
  }, [ref])

  return { isFullscreen, toggle }
}
