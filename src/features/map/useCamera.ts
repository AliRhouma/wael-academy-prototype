import { useCallback, useEffect, useRef } from "react"

/**
 * The map camera — pan & zoom with no library.
 *
 * screen = world × s + (x, y). The camera lives in a ref and is written
 * straight to the world wrapper's `transform` on the next animation frame, so
 * a drag never re-renders React. It handles:
 *  - mouse drag / one-finger drag to pan, with a little inertia on release;
 *  - wheel (and trackpad pinch, which arrives as ctrl + wheel) zooming toward
 *    the cursor;
 *  - two-finger pinch zooming around the fingers' midpoint;
 *  - clamped zoom and bounds: the town stays on screen, or — with `space` —
 *    the screen stays inside a finite space around it (`onView` says when the
 *    town has left the screen, so the page can offer the way home);
 *  - eased `animateTo` for the + / − / recentre buttons and focusing a building;
 *  - tap vs drag: a press that moved less than a few px is a TAP, reported
 *    with the element it started on; anything more is a pan and selects nothing.
 * The CSS variable `--iz` (= 1 / zoom, clamped) lets labels stay readable, and
 * `data-far` on the world marks a zoom where labels fold to their badge.
 */
export interface Cam {
  x: number
  y: number
  s: number
}
export interface Bounds {
  minX: number
  minY: number
  maxX: number
  maxY: number
}
export interface CameraOptions {
  bounds: Bounds
  maxScale?: number
  /** The first view, given the viewport size. */
  initial: (vw: number, vh: number, minScale: number) => { cx: number; cy: number; s: number }
  onTap?: (target: EventTarget | null) => void
  onHover?: (target: EventTarget | null) => void
  /**
   * A bigger, still finite area the camera may roam (the space around the
   * town). Without it the camera keeps the town itself on screen.
   */
  space?: Bounds
  /** How far out the zoom goes, as a share of "the whole town fits" (default 0.92). */
  minFit?: number
  /**
   * Told when the town leaves / comes back on screen. While it is away,
   * `angle` (radians, screen space) points from the screen centre to the town.
   */
  onView?: (v: { townVisible: boolean; angle: number }) => void
}

const TAP_SLOP = { mouse: 4, touch: 9 }

export function useCamera(opts: CameraOptions) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const cam = useRef<Cam>({ x: 0, y: 0, s: 1 })
  const size = useRef({ w: 0, h: 0 })
  const optsRef = useRef(opts)
  optsRef.current = opts
  const frame = useRef(0)
  const anim = useRef(0)
  const idleTimer = useRef(0)

  const minScale = () => {
    const { bounds, space, minFit = 0.92 } = optsRef.current
    const { w, h } = size.current
    const town = Math.min(w / (bounds.maxX - bounds.minX), h / (bounds.maxY - bounds.minY)) * minFit
    // with a space, never zoom out past the point where it stops covering the screen
    return space ? Math.max(town, w / (space.maxX - space.minX), h / (space.maxY - space.minY)) : town
  }
  const maxScale = () => optsRef.current.maxScale ?? 2.6

  /**
   * Keep the zoom in range. With a `space`, the screen stays inside it (its
   * edge is the end of the world); without, the town stays on screen with a
   * quarter-screen of slack.
   */
  const clamp = useCallback((c: Cam): Cam => {
    const { bounds, space } = optsRef.current
    const { w, h } = size.current
    const s = Math.min(maxScale(), Math.max(minScale(), c.s))
    if (space) {
      const inside = (pos: number, lo: number, hi: number, view: number) => {
        const span = (hi - lo) * s
        if (span <= view) return (view - span) / 2 - lo * s
        return Math.min(-lo * s, Math.max(view - hi * s, pos))
      }
      return { s, x: inside(c.x, space.minX, space.maxX, w), y: inside(c.y, space.minY, space.maxY, h) }
    }
    const fit = (pos: number, lo: number, hi: number, view: number) => {
      const span = (hi - lo) * s
      const pad = view * 0.25
      // smaller than the screen: it may drift, but stays (almost) entirely visible
      if (span <= view) return Math.min(view - hi * s + pad * 1.4, Math.max(-lo * s - pad * 1.4, pos))
      return Math.min(pad - lo * s, Math.max(view - pad - hi * s, pos))
    }
    return { s, x: fit(c.x, bounds.minX, bounds.maxX, w), y: fit(c.y, bounds.minY, bounds.maxY, h) }
  }, [])

  const write = useCallback(() => {
    frame.current = 0
    const el = worldRef.current
    if (!el) return
    const { x, y, s } = cam.current
    const { bounds } = optsRef.current
    el.style.transform = `translate3d(${x + bounds.minX * s}px, ${y + bounds.minY * s}px, 0) scale(${s})`
    el.style.setProperty("--iz", String(Math.min(1.5, Math.max(0.7, 1 / s))))
    // far out, labels fold to their level badge (see map.css)
    const far = s < 0.62
    if ((el.dataset.far === "true") !== far) {
      if (far) el.dataset.far = "true"
      else delete el.dataset.far
    }
    reportView()
  }, [])

  /** Is the town still on screen? Reported only when that (or, while away, the direction) changes. */
  const lastView = useRef({ townVisible: true, angle: 0 })
  const reportView = () => {
    const { bounds, onView } = optsRef.current
    if (!onView) return
    const { x, y, s } = cam.current
    const { w, h } = size.current
    if (!w || !h) return
    const l = bounds.minX * s + x
    const r = bounds.maxX * s + x
    const t = bounds.minY * s + y
    const b = bounds.maxY * s + y
    const overlap = Math.max(0, Math.min(r, w) - Math.max(l, 0)) * Math.max(0, Math.min(b, h) - Math.max(t, 0))
    // "away" once less than 12 % of the screen (or of the town, if smaller) still shows the town
    const townVisible = overlap / Math.min(w * h, (r - l) * (b - t)) > 0.12
    const angle = Math.atan2((t + b) / 2 - h / 2, (l + r) / 2 - w / 2)
    const prev = lastView.current
    if (townVisible === prev.townVisible && (townVisible || Math.abs(angle - prev.angle) < 0.05)) return
    lastView.current = { townVisible, angle }
    onView({ townVisible, angle })
  }

  /** Set the camera (clamped) and paint on the next frame. */
  const set = useCallback(
    (c: Cam) => {
      cam.current = clamp(c)
      if (!frame.current) frame.current = requestAnimationFrame(write)
      // while moving, let the browser composite; at rest, drop the hint so it re-rasters crisp
      const el = worldRef.current
      if (el) {
        el.style.willChange = "transform"
        clearTimeout(idleTimer.current)
        idleTimer.current = window.setTimeout(() => {
          if (worldRef.current) worldRef.current.style.willChange = ""
        }, 180)
      }
    },
    [clamp, write],
  )

  const stop = () => {
    cancelAnimationFrame(anim.current)
    anim.current = 0
  }

  const animateTo = useCallback(
    (target: Cam, ms = 320) => {
      stop()
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      const from = { ...cam.current }
      const to = clamp(target)
      if (reduce || ms <= 0) return set(to)
      const t0 = performance.now()
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / ms)
        const e = 1 - Math.pow(1 - t, 3)
        // zoom interpolates geometrically, so it feels even
        const s = from.s * Math.pow(to.s / from.s, e)
        set({ s, x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e })
        anim.current = t < 1 ? requestAnimationFrame(step) : 0
      }
      anim.current = requestAnimationFrame(step)
    },
    [clamp, set],
  )

  /** A camera that puts world point (wx, wy) at screen point (sx, sy) at zoom s. */
  const centredOn = (wx: number, wy: number, s: number, sx: number, sy: number): Cam => ({ s, x: sx - wx * s, y: sy - wy * s })

  const zoomAt = useCallback(
    (factor: number, sx: number, sy: number, animate = false) => {
      const c = cam.current
      const s = Math.min(maxScale(), Math.max(minScale(), c.s * factor))
      const wx = (sx - c.x) / c.s
      const wy = (sy - c.y) / c.s
      const next = centredOn(wx, wy, s, sx, sy)
      if (animate) animateTo(next, 240)
      else {
        stop()
        set(next)
      }
    },
    [animateTo, set],
  )

  const zoomIn = useCallback(() => zoomAt(1.4, size.current.w / 2, size.current.h / 2, true), [zoomAt])
  const zoomOut = useCallback(() => zoomAt(1 / 1.4, size.current.w / 2, size.current.h / 2, true), [zoomAt])

  const initialCam = useCallback((): Cam => {
    const { w, h } = size.current
    const v = optsRef.current.initial(w, h, minScale())
    return centredOn(v.cx, v.cy, v.s, w / 2, h / 2)
  }, [])

  const recenter = useCallback(() => animateTo(initialCam(), 420), [animateTo, initialCam])

  /**
   * Bring world point (wx, wy) to the middle of a screen region (e.g. the part
   * of the map a sheet does not cover). Only moves if the point is outside the
   * region's inner 70 %; never zooms out, zooms in to `minS` if below it.
   */
  const focus = useCallback(
    (wx: number, wy: number, region: { x: number; y: number; w: number; h: number }, minS = 0) => {
      const c = cam.current
      const s = Math.max(c.s, minS)
      const sx = wx * c.s + c.x
      const sy = wy * c.s + c.y
      const inside =
        s === c.s &&
        sx > region.x + region.w * 0.15 &&
        sx < region.x + region.w * 0.85 &&
        sy > region.y + region.h * 0.15 &&
        sy < region.y + region.h * 0.85
      if (inside) return
      animateTo(centredOn(wx, wy, s, region.x + region.w / 2, region.y + region.h / 2), 360)
    },
    [animateTo],
  )

  useEffect(() => {
    const vp = viewportRef.current
    if (!vp) return

    /* size: first measure sets the initial view; later ones keep the centre */
    let ready = false
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (!width || !height) return
      const prev = { ...size.current }
      size.current = { w: width, h: height }
      if (!ready) {
        ready = true
        set(initialCam())
      } else {
        const c = cam.current
        set({ ...c, x: c.x + (width - prev.w) / 2, y: c.y + (height - prev.h) / 2 })
      }
    })
    ro.observe(vp)

    /* ---------- pointers ---------- */
    const pts = new Map<number, { x: number; y: number }>()
    type G = {
      mode: "idle" | "pending" | "pan" | "pinch"
      sx: number
      sy: number
      start: Cam
      target: EventTarget | null
      type: string
      dist: number
      world: { x: number; y: number }
      samples: { t: number; x: number; y: number }[]
    }
    let g: G = { mode: "idle", sx: 0, sy: 0, start: cam.current, target: null, type: "mouse", dist: 1, world: { x: 0, y: 0 }, samples: [] }
    let inertia = 0

    const local = (e: PointerEvent | WheelEvent) => {
      const r = vp.getBoundingClientRect()
      return { x: e.clientX - r.left, y: e.clientY - r.top }
    }
    const two = () => {
      const [a, b] = [...pts.values()]
      return { mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, dist: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)) }
    }
    const beginPan = (x: number, y: number, mode: G["mode"]) => {
      g.mode = mode
      g.sx = x
      g.sy = y
      g.start = { ...cam.current }
      g.samples = [{ t: performance.now(), x, y }]
    }

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return
      stop()
      cancelAnimationFrame(inertia)
      const q = local(e)
      pts.set(e.pointerId, q)
      if (pts.size === 1) {
        g.target = e.target
        g.type = e.pointerType
        beginPan(q.x, q.y, "pending")
      } else if (pts.size === 2) {
        const { mid, dist } = two()
        g.mode = "pinch"
        g.dist = dist
        g.start = { ...cam.current }
        g.world = { x: (mid.x - cam.current.x) / cam.current.s, y: (mid.y - cam.current.y) / cam.current.s }
        for (const id of pts.keys()) {
          try {
            vp.setPointerCapture(id)
          } catch {
            /* pointer already gone */
          }
        }
        optsRef.current.onHover?.(null)
      }
    }

    const onMove = (e: PointerEvent) => {
      if (!pts.has(e.pointerId)) {
        if (e.pointerType === "mouse" && g.mode === "idle") optsRef.current.onHover?.(e.target)
        return
      }
      const q = local(e)
      pts.set(e.pointerId, q)
      if (g.mode === "pinch" && pts.size >= 2) {
        const { mid, dist } = two()
        const s = g.start.s * (dist / g.dist)
        set(centredOn(g.world.x, g.world.y, s, mid.x, mid.y))
        return
      }
      if (g.mode === "pending" || g.mode === "pan") {
        const dx = q.x - g.sx
        const dy = q.y - g.sy
        if (g.mode === "pending") {
          const slop = g.type === "mouse" ? TAP_SLOP.mouse : TAP_SLOP.touch
          if (Math.hypot(dx, dy) < slop) return
          g.mode = "pan"
          try {
            vp.setPointerCapture(e.pointerId)
          } catch {
            /* synthetic or already-released pointer */
          }
          vp.dataset.dragging = "true"
          optsRef.current.onHover?.(null)
        }
        set({ s: g.start.s, x: g.start.x + dx, y: g.start.y + dy })
        const now = performance.now()
        g.samples.push({ t: now, x: q.x, y: q.y })
        while (g.samples.length > 2 && now - g.samples[0].t > 90) g.samples.shift()
      }
    }

    const fling = () => {
      const s = g.samples
      if (s.length < 2) return
      const a = s[0]
      const b = s[s.length - 1]
      const dt = b.t - a.t
      if (dt <= 0 || performance.now() - b.t > 60) return
      let vx = (b.x - a.x) / dt
      let vy = (b.y - a.y) / dt
      if (Math.hypot(vx, vy) < 0.25 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
      let last = performance.now()
      const step = (now: number) => {
        const t = now - last
        last = now
        const c = cam.current
        set({ ...c, x: c.x + vx * t, y: c.y + vy * t })
        const decay = Math.pow(0.93, t / 16)
        vx *= decay
        vy *= decay
        inertia = Math.hypot(vx, vy) > 0.02 ? requestAnimationFrame(step) : 0
      }
      inertia = requestAnimationFrame(step)
    }

    const onUp = (e: PointerEvent, cancelled = false) => {
      if (!pts.has(e.pointerId)) return
      const wasTap = !cancelled && g.mode === "pending" && pts.size === 1
      pts.delete(e.pointerId)
      if (wasTap) optsRef.current.onTap?.(g.target)
      if (g.mode === "pinch") {
        if (pts.size === 1) {
          const [rest] = [...pts.values()]
          beginPan(rest.x, rest.y, "pan") // keep panning with the finger left — never a tap
        }
        if (pts.size === 0) g.mode = "idle"
        return
      }
      if (pts.size === 0) {
        if (g.mode === "pan" && !cancelled) fling()
        g.mode = "idle"
        delete vp.dataset.dragging
      }
    }
    const onUpEv = (e: PointerEvent) => onUp(e)
    const onCancel = (e: PointerEvent) => onUp(e, true)
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && g.mode === "idle") optsRef.current.onHover?.(null)
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      stop()
      cancelAnimationFrame(inertia)
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? size.current.h : 1
      const k = e.ctrlKey ? 0.01 : 0.0018 // ctrl + wheel = trackpad pinch: finer deltas
      const factor = Math.exp(-e.deltaY * unit * k)
      const q = local(e)
      zoomAt(Math.min(1.5, Math.max(1 / 1.5, factor)), q.x, q.y)
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const c = cam.current
      const step = 80
      if (e.key === "+" || e.key === "=") zoomIn()
      else if (e.key === "-" || e.key === "_") zoomOut()
      else if (e.key === "ArrowLeft") animateTo({ ...c, x: c.x + step }, 160)
      else if (e.key === "ArrowRight") animateTo({ ...c, x: c.x - step }, 160)
      else if (e.key === "ArrowUp") animateTo({ ...c, y: c.y + step }, 160)
      else if (e.key === "ArrowDown") animateTo({ ...c, y: c.y - step }, 160)
      else return
      e.preventDefault()
    }

    vp.addEventListener("pointerdown", onDown)
    vp.addEventListener("pointermove", onMove)
    vp.addEventListener("pointerup", onUpEv)
    vp.addEventListener("pointercancel", onCancel)
    vp.addEventListener("pointerleave", onLeave)
    vp.addEventListener("wheel", onWheel, { passive: false })
    vp.addEventListener("keydown", onKey)
    return () => {
      ro.disconnect()
      vp.removeEventListener("pointerdown", onDown)
      vp.removeEventListener("pointermove", onMove)
      vp.removeEventListener("pointerup", onUpEv)
      vp.removeEventListener("pointercancel", onCancel)
      vp.removeEventListener("pointerleave", onLeave)
      vp.removeEventListener("wheel", onWheel)
      vp.removeEventListener("keydown", onKey)
      cancelAnimationFrame(inertia)
      cancelAnimationFrame(frame.current)
      stop()
      clearTimeout(idleTimer.current)
    }
  }, [animateTo, initialCam, set, zoomAt, zoomIn, zoomOut])

  return { viewportRef, worldRef, zoomIn, zoomOut, recenter, focus, getCam: () => cam.current, getSize: () => size.current }
}
