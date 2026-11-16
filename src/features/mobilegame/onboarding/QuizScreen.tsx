import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { sfx } from "@/features/student-v2/sound"
import { matiereKey } from "@/data/matiere"
import { SubjectIcon } from "@/components/icons/subjects"
import { usePlatformUi } from "../platformUi"
import { FlowScreen, STEPS, WaelAside, useGameShake, usePlatformCorners } from "./parts"
import { quizFor, useOnboarding } from "./flow"

/**
 * « التحدّي » — 3 questions from the student's programme, one at a time.
 * Built to be won: the first is easy, there's no timer, no lives, no game
 * over. Tapping an answer commits it; the answer lights on the same frame as
 * its sound (right: lime + tick + `success`; wrong: grey + shake + `error`,
 * and the right one lights lime so the student leaves knowing it). The bottom
 * row then explains in one line and carries the one lime « الجاية » — the
 * student sets the pace.
 *
 * Sciences are asked in French, as Tunisian lycées teach them; the question
 * block takes the question's own direction inside the Arabic screen.
 */
const LETTERS = ["A", "B", "C", "D"]
const LETTERS_AR = ["أ", "ب", "ج", "د"]

export default function QuizScreen() {
  const navigate = useNavigate()
  const ui = usePlatformUi()
  const { card } = usePlatformCorners()
  const { yearId, subject, answers, answer, finish, round } = useOnboarding()
  const questions = quizFor(yearId, subject, round)
  // Resume where the student left (back from the result keeps their answers).
  const [i, setI] = useState(() => {
    const first = answers.findIndex((a) => a == null)
    return first === -1 ? 2 : first
  })
  const [shake, triggerShake] = useGameShake()

  useEffect(() => {
    if (questions.length !== 3) navigate(yearId ? "/mobilegame/matiere" : "/mobilegame/niveau", { replace: true })
  }, [questions.length, yearId, navigate])
  if (questions.length !== 3) return null

  const q = questions[i]
  const picked = answers[i]
  const done = picked != null
  const right = done && picked === q.answer
  const dir = q.lang === "ar" ? "rtl" : "ltr"
  const last = i === 2

  function choose(c: number) {
    if (done) return
    answer(i, c)
    if (c === q.answer) sfx("success")
    else {
      sfx("error")
      triggerShake()
    }
  }

  function next() {
    if (last) {
      finish()
      navigate("/mobilegame/resultat")
    } else setI(i + 1)
  }

  const say = !done
    ? i === 0
      ? "الأولى ساهلة. خذ وقتك، ما فماش وقت محدود."
      : i === 1
        ? "باهي! الثانية."
        : "الأخيرة، وهي أصعب شويّة."
    : right
      ? "برافو! جواب صحيح."
      : "قريب! شوف الجواب الصحيح بالأخضر."

  return (
    <FlowScreen
      step={STEPS.q1 + i + (done ? 1 : 0)}
      back="/mobilegame/matiere"
      backLabel="رجوع للمواد"
      end={
        <span className="inline-flex items-center gap-1.5 text-[calc(8px*var(--ts))] font-extrabold text-v2-ink">
          <SubjectIcon name={subject ?? ""} className="size-7" />
          {round > 1 && (
            <span>
              الجولة <bdi dir="ltr">{round}</bdi> ·
            </span>
          )}
          <bdi dir="ltr" className="tabular-nums">
            {i + 1} / 3
          </bdi>
        </span>
      }
      aside={<WaelAside say={say} tone={done && right ? "yay" : "calm"} />}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-2 ps-2">
        {/* the question — flat: it informs, it doesn't take a tap */}
        <section
          key={`q-${i}`}
          className={cn("shrink-0 border-2 border-v2-ink/10 bg-v2-surface px-3.5 py-2.5 motion-safe:animate-[game-rise_240ms_ease-out_both]", card)}
        >
          <p className="text-[calc(7.1px*var(--ts))] font-bold text-v2-brand-text">
            {matiereKey(subject ?? "")} · من البرنامج: <span dir="auto">{q.chapter}</span>
          </p>
          <p dir={dir} lang={q.lang} className="mt-0.5 text-start text-[calc(10px*var(--ts))] font-extrabold leading-snug text-v2-ink">
            {q.q}
          </p>
        </section>

        <div role="radiogroup" aria-label="الأجوبة" dir={dir} className={cn("grid min-h-0 flex-1 grid-cols-2 auto-rows-fr gap-2", shake)}>
          {q.choices.map((c, k) => {
            const isRight = done && k === q.answer
            const isWrongPick = done && k === picked && !right
            return (
              <button
                key={`${i}-${k}`}
                type="button"
                role="radio"
                aria-checked={k === picked}
                aria-disabled={done}
                onClick={() => choose(k)}
                dir={dir}
                lang={q.lang}
                className={cn(
                  "relative flex min-h-12 items-center gap-2.5 border-2 px-3 text-start text-[calc(8.8px*var(--ts))] font-bold leading-tight transition-[translate,box-shadow,background-color,border-color,opacity] duration-200 ease-[cubic-bezier(.34,1.56,.64,1)]",
                  "focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-v2-brand",
                  card,
                  !done &&
                    "border-v2-ink/15 bg-v2-surface text-v2-ink shadow-[0_3px_0_var(--v2-edge-tile,rgb(23_46_91/.14))] hover:border-v2-brand/40 active:translate-y-[3px] active:shadow-none active:duration-75",
                  isRight && "border-[#5bcd3f] bg-v2-cta text-v2-on-cta shadow-[0_4px_0_var(--v2-edge-cta,#5bcd3f)]",
                  isWrongPick && "border-dashed border-v2-ink/35 bg-v2-ink/[0.06] text-v2-ink-2",
                  done && !isRight && !isWrongPick && "border-v2-ink/10 bg-v2-surface text-v2-ink-2 opacity-60",
                )}
              >
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-lg text-[calc(7.5px*var(--ts))] font-black",
                    isRight ? "bg-v2-surface text-v2-ink motion-safe:animate-[game-pop_320ms_cubic-bezier(.34,1.56,.64,1)_both]" : isWrongPick ? "bg-v2-ink/10 text-v2-ink-2" : "bg-v2-ink/[0.06] text-v2-ink-2",
                  )}
                >
                  {isRight ? <Check className="size-4" strokeWidth={3} /> : isWrongPick ? <X className="size-4" strokeWidth={3} /> : (q.lang === "ar" ? LETTERS_AR : LETTERS)[k]}
                </span>
                <span className="min-w-0 flex-1">{c}</span>
              </button>
            )
          })}
        </div>

        {/* the bottom row: a hint while choosing, the why + « الجاية » once answered */}
        <div className={cn("flex h-[60px] shrink-0 items-center gap-3 border-2 px-3", card, done ? (right ? "border-[#5bcd3f] bg-v2-cta/20" : "border-v2-ink/10 bg-v2-surface") : "border-transparent")}>
          {done ? (
            <>
              <p className="min-w-0 flex-1 text-[calc(7.5px*var(--ts))] leading-snug text-v2-ink">
                <b className="font-extrabold">{right ? "صحيح · " : "الجواب: "}</b>
                <bdi dir={dir} lang={q.lang}>
                  {right ? q.explain : `${q.choices[q.answer]} — ${q.explain}`}
                </bdi>
              </p>
              <button type="button" data-uisfx="forward" onClick={next} className={cn(ui.cta, "shrink-0 text-[calc(9.5px*var(--ts))]")}>
                {last ? "شوف نتيجتك" : "الجاية"}
              </button>
            </>
          ) : (
            <p className="text-[calc(7.5px*var(--ts))] text-v2-ink-2">اختار جواب واحد — ما فماش وقت محدود.</p>
          )}
        </div>
      </div>
    </FlowScreen>
  )
}
