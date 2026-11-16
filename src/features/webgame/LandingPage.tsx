import { Link } from "react-router-dom"
import {
  ArrowLeft,
  BookOpen,
  Camera,
  Castle,
  Coins,
  Gamepad2,
  Medal,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  Trophy,
  Zap,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { GameLogo } from "@/features/game/shared/parts"
import { TownArt } from "@/features/game/shared/TownArt"
import { gBtn, gCta, gPanel, gPlate } from "@/features/game/shared/ui"
import { WebHeader, wContainer } from "./WebGameLayout"

/**
 * `/webgame` — the landing page of the game version. One job: make a student
 * (and the parent next to them) understand « you study → you earn points →
 * your town grows » in one scroll, then press « ابدا ببلاش ». Everything else
 * is quieter: the town, playing with friends, the phone app, the promise to
 * parents that points can't be bought.
 */
export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-v2-canvas-base text-v2-ink">
      <WebHeader />
      <Hero />
      <Steps />
      <Town />
      <Together />
      <Promise />
      <AppBand />
      <Footer />
    </div>
  )
}

const h2 = "text-[calc(18px*var(--ts))] font-black leading-tight md:text-[calc(24px*var(--ts))]"
const lead = "mt-3 text-[calc(10px*var(--ts))] leading-relaxed text-v2-ink-2 md:text-[calc(11px*var(--ts))]"

function Kicker({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-v2-ink/10 bg-v2-surface px-3 py-1 text-[calc(8px*var(--ts))] font-extrabold text-v2-brand-text">
      <Icon className="size-4" strokeWidth={2.2} /> {children}
    </span>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-v2-mint-grid">
      <div className={cn(wContainer, "grid items-center gap-10 py-12 md:grid-cols-[1.05fr_1fr] md:py-20")}>
        <div className="motion-safe:animate-[game-rise_.5s_cubic-bezier(.22,1,.36,1)_both]">
          <Kicker icon={Gamepad2}>جديد · وضع اللعب</Kicker>
          <h1 className="mt-4 text-[calc(26px*var(--ts))] font-black leading-[1.12] md:text-[calc(38px*var(--ts))]">
            تقرا…
            <span className="text-v2-grad block pb-1">ومدينتك تكبر معاك</span>
          </h1>
          <p className={cn(lead, "max-w-[46ch]")}>
            كل تمرين تحلّو، كل فيديو تكمّلو وكل حصّة تحضرها تجيبلك نقاط في المادّة متاعها. بالنقاط تبني مدينتك، تطلع في الدوري
            وتتحدّى صحابك.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link to="/webgame/inscription" data-uisfx="forward" className={cn(gCta, "h-14 px-8 text-[calc(11px*var(--ts))]")}>
              ابدا ببلاش <ArrowLeft className="size-5" strokeWidth={2.4} />
            </Link>
            <Link to="/webgame/connexion" data-uisfx="forward" className={cn(gBtn, "h-14 px-6 text-[calc(10px*var(--ts))]")}>
              عندي كونط
            </Link>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[calc(8.5px*var(--ts))] font-semibold text-v2-ink-2">
            <li className="flex items-center gap-1.5"><Castle className="size-4 text-v2-brand" /> 6 بنايات، مادّة لكل وحدة</li>
            <li className="flex items-center gap-1.5"><Trophy className="size-4 text-v2-done" /> دوري يتعاود كل جمعة</li>
            <li className="flex items-center gap-1.5"><Zap className="size-4 text-v2-live" /> تحدّيات مباشرة</li>
          </ul>
        </div>

        <div className="relative">
          <div className={cn(gPanel, "relative overflow-hidden p-3 md:p-5")}>
            <div aria-hidden className="absolute inset-0 bg-v2-canvas" />
            <TownArt className="relative w-full" />
          </div>
          <Floating className="-top-4 start-3 md:-start-6" delay=".3s">
            <Sparkles className="size-4 text-v2-brand" strokeWidth={2.4} /> <bdi dir="ltr">+30</bdi> نقطة · حضرت المباشر
          </Floating>
          <Floating className="-bottom-4 end-3 md:-end-6" delay=".55s">
            <Trophy className="size-4 text-v2-done" strokeWidth={2.4} /> مستوى <bdi dir="ltr">12</bdi> · الدوري الفضّي
          </Floating>
        </div>
      </div>
    </section>
  )
}

function Floating({ className, delay, children }: { className?: string; delay: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "absolute inline-flex items-center gap-1.5 rounded-2xl border-2 border-v2-ink bg-v2-surface px-3 py-2 text-[calc(8px*var(--ts))] font-extrabold shadow-[0_3px_0_var(--v2-ink)]",
        "motion-safe:animate-[game-rise_.6s_cubic-bezier(.22,1,.36,1)_both]",
        className,
      )}
      style={{ animationDelay: delay }}
    >
      {children}
    </span>
  )
}

const STEPS: { icon: LucideIcon; color: string; title: string; body: string }[] = [
  { icon: BookOpen, color: "bg-v2-brand", title: "تقرا وتتمرّن", body: "دروس، تمارين بنمط المراجعة، كويزات وحصص مباشرة مع أساتذة وائل." },
  { icon: Sparkles, color: "bg-v2-deep", title: "تربح نقاط", body: "نقاط عامّة ونقاط لكل مادّة — على الأجوبة الصحيحة، موش على الوقت." },
  { icon: Castle, color: "bg-v2-ink", title: "تبني مدينتك", body: "كل بناية تكبر بنقاط مادّتها: المرصد بالرياضيات، المخبر بالفيزياء…" },
]

function Steps() {
  return (
    <section id="kifech" className="scroll-mt-24 py-16 md:py-24">
      <div className={wContainer}>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className={h2}>كيفاش تخدم؟ ثلاثة خطوات</h2>
          <p className={lead}>القراية هي اللعبة: ما فما حتّى نقطة تتشرى، كل نقطة تجي من حاجة قريتها.</p>
        </div>
        <ol className="mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
          {STEPS.map((s, i) => (
            <li key={s.title} className={cn(gPanel, "relative p-6")}>
              <span className="absolute end-5 top-5 text-[calc(22px*var(--ts))] font-black leading-none text-v2-ink/[.07]">
                <bdi dir="ltr">{i + 1}</bdi>
              </span>
              <span className={cn(gPlate, "size-12", s.color)}>
                <s.icon className="size-6" strokeWidth={2} />
              </span>
              <h3 className="mt-4 text-[calc(12px*var(--ts))] font-extrabold">{s.title}</h3>
              <p className="mt-1.5 text-[calc(9.5px*var(--ts))] leading-relaxed text-v2-ink-2">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* Demo levels for the town preview — illustrative, not a student's data. */
const BUILDINGS = [
  { name: "مرصد الرياضيات", subject: "رياضيات", color: "#3f9a5c", lvl: 4 },
  { name: "مخبر الفيزياء", subject: "علوم فيزيائية", color: "#4a7fd4", lvl: 3 },
  { name: "البيت الأخضر", subject: "علوم الحياة والأرض", color: "#1fa3b8", lvl: 2 },
  { name: "جناح اللغات", subject: "عربية · فرنسية · أنڤليزية", color: "#d9902b", lvl: 2 },
]
// The four hexes are the subject hues of `student/subjectTint.ts` (no v2 token per matière).

function Town() {
  return (
    <section id="medina" className="scroll-mt-24 bg-v2-canvas py-16 md:py-24">
      <div className={cn(wContainer, "grid items-center gap-10 md:grid-cols-2")}>
        <div className="order-2 md:order-1">
          <div className={cn(gPanel, "p-3 md:p-6")}>
            <TownArt labels className="w-full" />
          </div>
        </div>
        <div className="order-1 md:order-2">
          <Kicker icon={Castle}>المدينة</Kicker>
          <h2 className={cn(h2, "mt-3")}>كل بناية تكبر بنقاط مادّتها</h2>
          <p className={lead}>
            تشوف بعينيك وين قويّ ووين لازمك تخدم أكثر. ودار وائل في الوسط هي سقف المدينة: كل ما تطلّعها، تنجم تطلّع البقية.
          </p>
          <ul className="mt-6 space-y-3">
            {BUILDINGS.map((b) => (
              <li key={b.name} className="flex items-center gap-3">
                <span className="size-3 shrink-0 rounded-full" style={{ background: b.color }} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[calc(9.5px*var(--ts))] font-bold">{b.name}</span>
                    <span className="text-[calc(8px*var(--ts))] text-v2-ink-2">
                      مستوى <bdi dir="ltr">{b.lvl}</bdi> / <bdi dir="ltr">10</bdi>
                    </span>
                  </div>
                  <div className="mt-1 h-3 overflow-hidden rounded-full bg-v2-ink/10">
                    <div className="h-full rounded-full bg-v2-cta" style={{ width: `${b.lvl * 10}%` }} />
                  </div>
                  <span className="text-[calc(7.5px*var(--ts))] text-v2-ink-3">{b.subject}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

const TOGETHER: { icon: LucideIcon; color: string; title: string; body: string }[] = [
  { icon: Trophy, color: "bg-v2-done", title: "الدوري", body: "مجموعة صغيرة من تلامذة في مستواك، تتعاود كل جمعة. تشوف شكون قدّامك بقدّاش، موش رقمك في تونس الكل." },
  { icon: Zap, color: "bg-v2-live", title: "تحدّيات مباشرة", body: "مع مجموعتك: سؤال بسؤال، الإجابة الصحيحة تبان للكل، والشات بجنبكم." },
  { icon: Medal, color: "bg-[#7b4ddb]", title: "البطولات", body: "أحداث تنظّمها وائل في المواد، بترتيب وجوائز قطع." },
  { icon: Coins, color: "bg-v2-brand", title: "القطع ومكتبة وائل", body: "تربح قطع بالمهام والدعوات، وتفتح بيها درس لمدّة ولا تاخو كتب من المكتبة." },
  { icon: Camera, color: "bg-v2-ink", title: "المساعد الذكي", body: "صوّر حلّك على الورقة، يقلّك شنوّة صحيح ووين غلطت — والأستاذ يراجع." },
  { icon: Target, color: "bg-v2-deep", title: "أهدافي", body: "هدف الجمعة، مهام اليوم وبرنامج بسيط — باش تعرف شنوّة تقرا توّا." },
]
// #7b4ddb = the résumé violet (--v2-kind-resume), which has no bg- utility of its own.

function Together() {
  return (
    <section id="jma3a" className="scroll-mt-24 py-16 md:py-24">
      <div className={wContainer}>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className={h2}>تقرا وحدك، وتلعب مع صحابك</h2>
          <p className={lead}>كل شي في بلاصة وحدة، مربوط بالقراية متاعك.</p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOGETHER.map((f) => (
            <article key={f.title} className={cn(gPanel, "flex gap-4 p-5 md:p-6")}>
              <span className={cn(gPlate, "size-12", f.color)}>
                <f.icon className="size-6" strokeWidth={2} />
              </span>
              <div>
                <h3 className="text-[calc(11px*var(--ts))] font-extrabold">{f.title}</h3>
                <p className="mt-1 text-[calc(9px*var(--ts))] leading-relaxed text-v2-ink-2">{f.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Promise() {
  return (
    <section className="pb-16 md:pb-24">
      <div className={wContainer}>
        <div className="flex flex-col items-start gap-4 rounded-3xl border-2 border-v2-done-line bg-[#fff7ec] p-6 md:flex-row md:items-center md:p-8">
          {/* #fff7ec: the cream of the reward colour (--v2-done) at 8 %, no token */}
          <span className={cn(gPlate, "size-14 bg-v2-done")}>
            <ShieldCheck className="size-7" strokeWidth={2} />
          </span>
          <div className="flex-1">
            <h2 className="text-[calc(13px*var(--ts))] font-extrabold">للأولياء: النقاط ما تتشراش</h2>
            <p className="mt-1 text-[calc(9.5px*var(--ts))] leading-relaxed text-v2-ink-2">
              النقاط تقيس القراية برك، والقطع ما تطلّعش حدّ في الترتيب. اللي تشوفو في المدينة هو اللي صار بالحق.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function AppBand() {
  return (
    <section id="app" className="scroll-mt-24 pb-16 md:pb-24">
      <div className={wContainer}>
        <div className="grid items-center gap-8 overflow-hidden rounded-[32px] bg-v2-chapter p-6 text-white md:grid-cols-[1fr_1.15fr] md:p-12">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[calc(8px*var(--ts))] font-extrabold">
              <Smartphone className="size-4" strokeWidth={2.2} /> iOS · Android
            </span>
            <h2 className={cn(h2, "mt-3 text-white")}>العب من التلفون، بالعرض</h2>
            <p className="mt-3 text-[calc(10px*var(--ts))] leading-relaxed text-white/80">
              التطبيق مصنوع كيما اللعب: المدينة في الوسط والأزرار تحت صوابعك. نفس الكونط، نفس النقاط.
            </p>
            <Link to="/mobilegame" data-uisfx="open" className={cn(gCta, "mt-6 h-13 px-7 py-3 text-[calc(10px*var(--ts))]")}>
              جرّب التطبيق <ArrowLeft className="size-5" strokeWidth={2.4} />
            </Link>
          </div>
          <div dir="ltr" className="mx-auto w-full max-w-[34rem] rounded-[30px] bg-[#0b0f14] p-2.5 shadow-[0_30px_60px_-30px_rgb(0_0_0/.7)]">
            {/* #0b0f14: the phone's glass — hardware, no token */}
            <div className="relative aspect-[844/390] overflow-hidden rounded-[22px] bg-v2-mint-grid">
              <TownArt className="absolute inset-0 m-auto h-[92%]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t-2 border-v2-ink/5 py-8">
      <div className={cn(wContainer, "flex flex-col items-center justify-between gap-4 text-[calc(8.5px*var(--ts))] text-v2-ink-2 sm:flex-row")}>
        <GameLogo className="h-9 w-[4.2rem]" />
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link to="/" className="hover:text-v2-ink">الموقع</Link>
          <Link to="/student-v2" className="hover:text-v2-ink">فضاء التلميذ</Link>
          <Link to="/mobilegame" className="hover:text-v2-ink">التطبيق</Link>
          <Link to="/webgame/connexion" className="hover:text-v2-ink">ادخل</Link>
        </nav>
        <span>نسخة تجريبية</span>
      </div>
    </footer>
  )
}
