import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Check, Lock, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { sfx } from "@/features/student-v2/sound"
import { useAuth } from "@/stores/useAuth"
import { matiereKey } from "@/data/matiere"
import { Subject3D } from "./art3d"
import { useGamePlatform } from "../MobileGameLayout"
import { usePlatformUi } from "../platformUi"
import { FlowScreen, GameBurst, GameSheet, STEPS, WaelAside, useGameShake, usePlatformCorners } from "./parts"
import { useOnboarding, useScore, yearById, yearLabel } from "./flow"

/**
 * « نتيجتك » — the high point, then the door to the account.
 *
 * One big score, the three answers as marks, the points the town will get,
 * and a stamp. 2/3 or better earns the one burst (+ `achievement`) from the
 * score — never on a replayed visit. Below, the rounds as a ladder: round 1
 * done, round 2 locked « بعد الكونط ». The account is offered as KEEPING what
 * was just made (« احفظ نتيجتك »), and « عاود العب » — the user's rule — asks
 * for it in a sheet over the result, with a quiet « مبعد » that closes it:
 * no guilt copy, the result stays.
 */
function waelLine(right: number) {
  if (right === 3) return "ممتاز، 3 من 3! نحضّرلك جولة أصعب؟"
  if (right === 2) return "برافو، 2 من 3! الجولة الجاية تستنّى فيك."
  if (right === 1) return "بداية باهية! نعاودو ونطلعو بالنتيجة."
  return "ماشي مشكل، هكّا نتعلّمو. الأجوبة الصحيحة عندك توّا."
}

export default function ResultScreen() {
  const navigate = useNavigate()
  const ui = usePlatformUi()
  const ios = useGamePlatform() === "ios"
  const { card, panel } = usePlatformCorners()
  const user = useAuth((s) => s.currentUser)
  const { yearId, subject, answers, finished, replay, round } = useOnboarding()
  const { right, total, points, questions } = useScore()
  const [burstAt, setBurstAt] = useState(0)
  const [gate, setGate] = useState(false)
  const [shake, triggerShake] = useGameShake()
  const celebrated = useRef(false)

  useEffect(() => {
    if (!finished) navigate(subject ? "/mobilegame/defi" : "/mobilegame/niveau", { replace: true })
  }, [finished, subject, navigate])

  // The one celebration, once per finished run (the ref survives StrictMode's double effect).
  useEffect(() => {
    if (!finished || celebrated.current || right < 2) return
    celebrated.current = true
    const t = window.setTimeout(() => {
      setBurstAt(Date.now())
      sfx("achievement")
    }, 380)
    return () => window.clearTimeout(t)
  }, [finished, right])

  // وائل celebrates on the burst's frame (one celebration: the burst, the cue and his pose together), then stands proud
  const [cheering, setCheering] = useState(false)
  useEffect(() => {
    if (!burstAt) return
    setCheering(true)
    const t = window.setTimeout(() => setCheering(false), 1600)
    return () => window.clearTimeout(t)
  }, [burstAt])

  if (!finished) return null
  const year = yearById(yearId)

  function playAgain() {
    if (user) {
      replay()
      navigate("/mobilegame/defi", { viewTransition: true })
    } else setGate(true)
  }

  function locked() {
    triggerShake()
    sfx("blocked")
    window.setTimeout(() => setGate(true), 320)
  }

  return (
    <FlowScreen
      step={STEPS.result}
      back="/mobilegame/defi"
      backLabel="رجوع للأسئلة"
      end={
        !user && (
          <Link viewTransition to="/mobilegame/connexion" data-uisfx="forward" className={cn(ui.link, "text-[calc(8px*var(--ts))] text-v2-cta!")}>
            عندي كونط
          </Link>
        )
      }
      aside={<WaelAside say={waelLine(right)} tone={right >= 2 ? "yay" : "calm"} pose={cheering ? "celebrate" : "proud"} poses={["proud", "celebrate"]} />}
      overlay={
        <GameSheet open={gate} onClose={() => setGate(false)} title="اعمل كونط باش تعاود تلعب">
          <div className="flex items-center gap-4 pt-1">
            <Subject3D name={subject ?? ""} className="size-16 shrink-0" />
            <div className="min-w-0">
              <h2 className="text-[calc(11px*var(--ts))] font-extrabold leading-tight text-v2-ink">باش تعاود تلعب، اعمل كونط</h2>
              <p className="mt-1 text-[calc(8px*var(--ts))] leading-snug text-v2-ink-2">
                نتيجتك <bdi dir="ltr">{right}/{total}</bdi> ونقاطك <bdi dir="ltr">+{points}</bdi> يتسجّلو في الكونط متاعك، والجولة الثانية تتحلّ. نومرو تليفونك يكفي.
              </p>
            </div>
          </div>
          <div className={cn("mt-3 flex items-center gap-2.5", !ios && "justify-end")}>
            {!ios && (
              <button type="button" data-uisfx="close" onClick={() => setGate(false)} className={cn(ui.link, "me-auto text-[calc(9px*var(--ts))]")}>
                مبعد
              </button>
            )}
            <Link viewTransition to="/mobilegame/connexion" data-uisfx="forward" className={cn(ui.secondary, "text-[calc(9px*var(--ts))]")}>
              عندي كونط
            </Link>
            <Link viewTransition to="/mobilegame/inscription" data-uisfx="forward" className={cn(ui.cta, "text-[calc(9.5px*var(--ts))]", ios && "flex-1")}>
              اعمل كونط
            </Link>
          </div>
        </GameSheet>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-2 ps-2">
        {/* the score — flat card, one big number */}
        <section className={cn("relative flex flex-1 items-center gap-4 overflow-hidden border-2 border-v2-ink/25 bg-[#fbf3e4] px-4 py-2 shadow-[0_5px_0_rgb(23_46_91/.45)] motion-safe:animate-[game-pop_380ms_cubic-bezier(.34,1.56,.64,1)_both]", panel)}>
          <div className="relative grid shrink-0 place-items-center">
            <p className="text-[calc(7.5px*var(--ts))] font-bold text-v2-ink-2">نتيجتك</p>
            <bdi dir="ltr" className="text-[calc(30px*var(--ts))] font-black leading-none tabular-nums text-v2-ink">
              {right}
              <span className="text-[calc(16px*var(--ts))] text-v2-ink/30">/{total}</span>
            </bdi>
            <GameBurst at={burstAt} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[calc(8.5px*var(--ts))] font-extrabold text-v2-ink">
              {matiereKey(subject ?? "")} · {yearLabel(year)}
            </p>
            <ol aria-label="الأجوبة" className="mt-2 flex gap-1.5">
              {questions.map((q, k) => {
                const ok = answers[k] === q.answer
                return (
                  <li
                    key={k}
                    aria-label={`السؤال ${k + 1}: ${ok ? "صحيح" : "غالط"}`}
                    className={cn(
                      "grid size-8 place-items-center rounded-xl border-2 motion-safe:animate-[game-pop_320ms_cubic-bezier(.34,1.56,.64,1)_both]",
                      ok ? "border-[#5bcd3f] bg-v2-cta text-v2-on-cta" : "border-dashed border-v2-ink/30 text-v2-ink-2",
                    )}
                    style={{ animationDelay: `${120 + k * 90}ms` }}
                  >
                    {ok ? <Check className="size-4" strokeWidth={3} /> : <X className="size-4" strokeWidth={3} />}
                  </li>
                )
              })}
            </ol>
            <p className="mt-2 inline-flex items-center gap-1 rounded-xl border-2 border-v2-ink bg-v2-surface px-2 py-0.5 text-[calc(7.5px*var(--ts))] font-extrabold text-v2-ink shadow-[0_2px_0_var(--v2-ink)]">
              <Sparkles className="size-3.5 text-v2-brand" strokeWidth={2.4} /> <bdi dir="ltr">+{points}</bdi> نقطة لمدينتك
            </p>
          </div>
          {/* the matière's badge — the thing the account keeps */}
          <Subject3D name={subject ?? ""} className="mt-5 size-24 shrink-0" />
          <span
            className="absolute end-3 top-3 rounded-[10px] border-2 border-[#f28b14] px-2 py-0.5 text-[calc(7.5px*var(--ts))] font-extrabold text-[#b9680b] motion-safe:animate-[game-stamp_420ms_cubic-bezier(.34,1.56,.64,1)_both] [transform:rotate(-6deg)]"
            // #f28b14 / #b9680b = --v2-done and --v2-edge-done (the play stamp), literal outside the play scope
          >
            كمّلت التحدّي
          </span>
        </section>

        {/* the rounds — 1 done, 2 and 3 behind the account */}
        <ol className={cn("flex shrink-0 items-center gap-2", shake)} aria-label="الجولات">
          {[1, 2, 3].map((n) =>
            n <= round ? (
              <li key={n} className={cn("flex h-11 flex-1 items-center justify-center gap-1.5 border-2 border-[#5bcd3f] bg-v2-cta text-[calc(7.5px*var(--ts))] font-extrabold text-v2-on-cta", card)}>
                <Check className="size-4" strokeWidth={3} /> الجولة <bdi dir="ltr">{n}</bdi>
              </li>
            ) : user ? (
              <li key={n} className={cn("flex h-11 flex-1 items-center justify-center gap-1.5 border-2 border-white/20 bg-white/10 text-[calc(7.5px*var(--ts))] font-bold text-white", card)}>
                الجولة <bdi dir="ltr">{n}</bdi>
              </li>
            ) : (
              <li key={n} className="flex flex-1">
                <button
                  type="button"
                  onClick={locked}
                  aria-label={`الجولة ${n} — مسكّرة، تتحلّ بالكونط`}
                  className={cn("flex h-11 w-full items-center justify-center gap-1.5 border-2 border-dashed border-white/35 bg-white/5 text-[calc(7.5px*var(--ts))] font-bold text-white/75", card)}
                >
                  <Lock className="size-3.5" strokeWidth={2.4} /> الجولة <bdi dir="ltr">{n}</bdi> · بالكونط
                </button>
              </li>
            ),
          )}
        </ol>

        <div className="flex shrink-0 items-center gap-2.5">
          {user ? (
            <Link viewTransition to="/mobilegame/accueil" data-uisfx="open" className={cn(ui.cta, "flex-1 text-[calc(9.5px*var(--ts))]")}>
              ادخل لمدينتك
            </Link>
          ) : (
            <Link viewTransition to="/mobilegame/inscription" data-uisfx="forward" className={cn(ui.cta, "flex-1 text-[calc(9.5px*var(--ts))]")}>
              احفظ نتيجتك
            </Link>
          )}
          <button type="button" data-uisfx={user ? "retry" : "open"} onClick={playAgain} className={cn(ui.secondary, "text-[calc(9px*var(--ts))]")}>
            عاود العب
          </button>
        </div>
      </div>
    </FlowScreen>
  )
}
