import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import wave from "@/assets/characters/web/wael_wave.webp"
import waveBlink from "@/assets/characters/web/wael_wave_blink.webp"
import present from "@/assets/characters/web/wael_present.webp"
import presentBlink from "@/assets/characters/web/wael_present_blink.webp"
import curious from "@/assets/characters/web/wael_curious.webp"
import curiousBlink from "@/assets/characters/web/wael_curious_blink.webp"
import nod from "@/assets/characters/web/wael_nod.webp"
import nodBlink from "@/assets/characters/web/wael_nod_blink.webp"
import think from "@/assets/characters/web/wael_think.webp"
import thinkBlink from "@/assets/characters/web/wael_think_blink.webp"
import cheer from "@/assets/characters/web/wael_cheer.webp"
import cheerBlink from "@/assets/characters/web/wael_cheer_blink.webp"
import hmm from "@/assets/characters/web/wael_hmm.webp"
import hmmBlink from "@/assets/characters/web/wael_hmm_blink.webp"
import proud from "@/assets/characters/web/wael_proud.webp"
import proudBlink from "@/assets/characters/web/wael_proud_blink.webp"
import celebrate from "@/assets/characters/web/wael_celebrate.webp"
import celebrateBlink from "@/assets/characters/web/wael_celebrate_blink.webp"

/**
 * وائل in 3D — the pose set of docs/3d/3d-characters-and-ui-effects.md § 3.
 *
 * Every pose is a Scenario render on ONE shared canvas (512 × 768, feet centre
 * on 256, 744, same body height — made by scripts/town-art/blink.py), so every
 * pose draws in the same box and a swap never jumps. Each pose carries a blink
 * patch (eyes only). Poses facing a side face the RIGHT of the image: in the
 * RTL layouts Wael stands on the end side, so he looks at the content.
 *
 * - Only the poses a screen can show are mounted (`poses`), all pre-mounted,
 *   swapped by opacity (never by changing `src`, which can blank a frame);
 *   a swap is a 120 ms crossfade, instant under reduced motion.
 * - Blink: 90 ms every 4–7 s while the page is visible; none under reduced
 *   motion or when `blink` is false.
 * - A soft contact shadow tinted with the deep teal sits under the feet.
 */
export const WAEL_POSES = {
  wave: { src: wave, blink: waveBlink, label: "وائل يسلّم عليك" },
  present: { src: present, blink: presentBlink, label: "وائل يوريك" },
  curious: { src: curious, blink: curiousBlink, label: "وائل يتساءل" },
  nod: { src: nod, blink: nodBlink, label: "وائل موافق" },
  think: { src: think, blink: thinkBlink, label: "وائل يخمّم" },
  cheer: { src: cheer, blink: cheerBlink, label: "وائل فرحان" },
  hmm: { src: hmm, blink: hmmBlink, label: "وائل يطمّنك" },
  proud: { src: proud, blink: proudBlink, label: "وائل فخور بيك" },
  celebrate: { src: celebrate, blink: celebrateBlink, label: "وائل يحتفل" },
} as const
export type WaelPose = keyof typeof WAEL_POSES

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

/** 90 ms blinks every 4–7 s while visible; off under reduced motion. */
export function useBlink(enabled = true) {
  const [closed, setClosed] = useState(false)
  useEffect(() => {
    if (!enabled || reducedMotion()) return
    let t = 0
    let alive = true
    const schedule = () => {
      t = window.setTimeout(() => {
        if (!alive) return
        if (document.hidden) return schedule()
        setClosed(true)
        t = window.setTimeout(() => {
          setClosed(false)
          if (alive) schedule()
        }, 90)
      }, 4000 + Math.random() * 3000)
    }
    schedule()
    return () => {
      alive = false
      clearTimeout(t)
      setClosed(false)
    }
  }, [enabled])
  return closed
}

export function Wael3D({
  pose,
  poses,
  blink = true,
  shadow = true,
  className,
  imgClassName,
}: {
  pose: WaelPose
  /** Every pose this instance may switch to (pre-mounted). Defaults to `[pose]`. */
  poses?: readonly WaelPose[]
  blink?: boolean
  shadow?: boolean
  /** Size and place the 2:3 box (give it a height or a width). */
  className?: string
  imgClassName?: string
}) {
  const closed = useBlink(blink)
  const list = poses && poses.includes(pose) ? poses : [...(poses ?? []), pose]
  return (
    // the caller positions this box with logical classes (start/end, rtl:) — so the page's
    // direction must apply to it; only the inside is physical (dir=ltr) for the shadow maths
    <div className={cn("relative aspect-[2/3]", className)}>
      <div className="absolute inset-0" dir="ltr">
      {shadow && (
        <div
          aria-hidden
          className="absolute left-[27%] top-[93.5%] h-[6%] w-[46%] rounded-[50%]"
          style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--v2-deep) 62%, black), transparent)" }}
        />
      )}
      {[...new Set(list)].map((p) => {
        const on = p === pose
        return (
          <div key={p} className="absolute inset-0 motion-safe:transition-opacity motion-safe:duration-[120ms]" style={{ opacity: on ? 1 : 0 }}>
            <img
              src={WAEL_POSES[p].src}
              alt={on ? WAEL_POSES[p].label : ""}
              aria-hidden={!on}
              className={cn("absolute inset-0 h-full w-full select-none", imgClassName)}
              draggable={false}
            />
            <img
              src={WAEL_POSES[p].blink}
              alt=""
              aria-hidden
              className="absolute inset-0 h-full w-full select-none"
              style={{ opacity: on && closed ? 1 : 0 }}
              draggable={false}
            />
          </div>
        )
      })}
      </div>
    </div>
  )
}
