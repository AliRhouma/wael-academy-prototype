import { createContext, useContext, useLayoutEffect, useMemo, useState, type ReactNode } from "react"
import { Outlet, useLocation } from "react-router-dom"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import townIsland from "@/assets/splash/town_island.webp"
import { Wael3D, type WaelPose } from "@/features/game/shared/Wael3D"
import "./world.css"

/**
 * The first launch as ONE world — docs/video-research (16 videos) and
 * docs/3d/3d-characters-and-ui-effects.md § 7.
 *
 * Welcome → level → subject → the 3 questions → result → account all live in
 * this stage, mounted once. Only the step's content changes; everything that
 * makes it a game stays put:
 *  - the sky (the splash's deep teal, chapter gradient, the brand's grid),
 *  - the floating town — its « camera » moves per step (wide on the welcome,
 *    close on the school for the level, the whole island for the subject,
 *    inside a building for the questions),
 *  - وائل in 3D, standing on the end side, with his line in a dialogue card,
 *  - the quest path: four stones that light up instead of an app progress bar.
 *
 * Step changes run as View Transitions (React Router `viewTransition`): the
 * town and وائل glide (named layers), the content slides along one axis —
 * forward enters from the start side's opposite (left in RTL), back reverses
 * (`html[data-nav]`, set by MobileGameLayout). Without the API, the town's
 * camera still moves with a CSS transition. Under reduced motion: crossfades.
 */

type Say = { say: ReactNode; tone: "calm" | "yay"; pose: WaelPose; poses?: readonly WaelPose[] }

const WorldCtx = createContext<{
  setWael: (s: Say) => void
  setStep: (n: number) => void
} | null>(null)

/** Where the town's camera is, per step: a CSS transform on the island. */
const CAMERA: Record<string, { t: string; dim?: boolean; blur?: boolean }> = {
  bienvenue: { t: "translate(-18%, 14%) scale(.82)" },
  niveau: { t: "translate(4%, 34%) scale(2.15)" }, // close on the school, at the top of the island
  matiere: { t: "translate(-4%, 6%) scale(1.12)" }, // the whole island: the buildings ARE the subjects
  defi: { t: "translate(2%, 22%) scale(2.6)", dim: true, blur: true }, // inside a building
  resultat: { t: "translate(-8%, 6%) scale(1.06)" },
  inscription: { t: "translate(-14%, 12%) scale(.86)", dim: true },
}

/** The four stones of the quest path, and which one each step lights. */
const STONES = ["الترحيب", "المستوى", "المادة", "التحدّي"]

export function WorldStage() {
  const seg = useLocation().pathname.split("/")[2] ?? "bienvenue"
  const cam = CAMERA[seg] ?? CAMERA.bienvenue
  const [wael, setWael] = useState<Say>({ say: "", tone: "calm", pose: "wave" })
  const [step, setStep] = useState(1)
  const ctx = useMemo(() => ({ setWael, setStep }), [])
  // 1 welcome · 2 level · 3 subject · 4–6 questions · 7 result (STEPS in parts.tsx)
  const done = step >= 7 ? 4 : step >= 4 ? 3 : step - 1
  return (
    <WorldCtx.Provider value={ctx}>
      <div className="world relative h-full w-full overflow-clip bg-v2-deep text-white">
        {/* L1 — the sky: the same layers as the splash, so the door and the flow are one place */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-v2-chapter" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[.07]"
          style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
        {/* L3 — the town, its camera set by the step */}
        <div aria-hidden className="pointer-events-none absolute inset-0" dir="ltr">
          <div className={cn("world-island absolute left-[2%] top-[14%] w-[54%]", cam.dim && "is-dim", cam.blur && "is-blur")} style={{ transform: cam.t }}>
            <img src={townIsland} alt="" className="w-full select-none" draggable={false} />
          </div>
          {/* a soft vignette keeps the words readable over the town */}
          <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_85%_55%,color-mix(in_oklab,var(--v2-deep)_78%,transparent),transparent_70%)]" />
        </div>

        {/* the safe area: everything you read or tap */}
        <div
          className="relative h-full"
          style={{ paddingTop: "var(--gs-top)", paddingLeft: "var(--gs-left)", paddingRight: "var(--gs-right)", paddingBottom: "var(--gs-bottom)" }}
        >
          {/* the quest path — four stones, lit as the student goes */}
          <ol aria-label="التقدّم" className="world-quest pointer-events-none absolute inset-x-0 top-[calc(var(--gs-top)+12px)] z-20 mx-auto flex w-max items-center gap-1.5">
            {STONES.map((label, k) => {
              const lit = k < done
              const current = k === done && done < 4
              return (
                <li key={label} className="flex items-center gap-1.5">
                  {k > 0 && <span aria-hidden className={cn("h-[3px] w-6 rounded-full", k <= done ? "bg-v2-cta" : "bg-white/20")} />}
                  <span
                    className={cn(
                      "flex items-center gap-1 rounded-full border-2 px-2 py-0.5 text-[calc(6.8px*var(--ts))] font-extrabold",
                      lit ? "border-[#5bcd3f] bg-v2-cta text-v2-on-cta" : current ? "border-v2-cta bg-white/10 text-white world-stone-now" : "border-white/20 bg-white/5 text-white/55",
                    )}
                    // #5bcd3f = the lime's own edge (play skin), read as a literal outside the play scope
                  >
                    {lit ? <Check className="size-3" strokeWidth={3.5} /> : <bdi dir="ltr" className="tabular-nums">{k + 1}</bdi>}
                    {label}
                  </span>
                </li>
              )
            })}
          </ol>

          {/* وائل — on the end side, the same spot on every step; his line above him */}
          <WaelLine say={wael.say} tone={wael.tone} />
          <Wael3D
            pose={wael.pose}
            poses={wael.poses}
            className="world-wael pointer-events-none absolute bottom-[calc(var(--gs-bottom)+2px)] end-[calc(var(--gs-left)+1%)] z-10 h-[64%]"
          />

          <Outlet />
        </div>
      </div>
    </WorldCtx.Provider>
  )
}

/** وائل's line — a game dialogue card with his name tag; it pops when the line changes. */
function WaelLine({ say, tone }: { say: ReactNode; tone: "calm" | "yay" }) {
  const key = typeof say === "string" ? say : ""
  if (!say) return null
  return (
    <div className="world-say absolute end-[calc(var(--gs-left)+1%)] top-[calc(var(--gs-top)+46px)] z-20 w-[27%]">
      <div
        key={key}
        aria-live="polite"
        className={cn(
          "relative rounded-2xl rounded-ee-sm border-2 bg-[#0b2d3a]/90 px-3 pb-2 pt-3 text-[calc(7.6px*var(--ts))] font-bold leading-snug text-white shadow-[0_8px_20px_rgb(0_0_0/.25)] motion-safe:animate-[game-pop_320ms_cubic-bezier(.34,1.56,.64,1)_both]",
          tone === "yay" ? "border-v2-cta" : "border-white/25",
        )}
        // #0b2d3a — the deep teal darkened for a dialogue card over the town (no token is that dark)
      >
        <span className="absolute -top-2.5 start-3 rounded-full bg-v2-cta px-2 py-px text-[calc(6.4px*var(--ts))] font-black text-v2-on-cta">وائل</span>
        {say}
      </div>
    </div>
  )
}

/** A step tells the stage what وائل says and does (WaelAside calls this). */
export function useWorldWael(s: Say) {
  const ctx = useContext(WorldCtx)
  const posesKey = s.poses?.join(",") ?? ""
  const sayKey = typeof s.say === "string" ? s.say : String(Boolean(s.say))
  useLayoutEffect(() => {
    ctx?.setWael(s)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx, sayKey, s.tone, s.pose, posesKey])
}

/** A step tells the stage how far along the quest the student is. */
export function useWorldStep(n: number) {
  const ctx = useContext(WorldCtx)
  useLayoutEffect(() => {
    ctx?.setStep(n)
  }, [ctx, n])
}

export const useInWorld = () => useContext(WorldCtx) != null
