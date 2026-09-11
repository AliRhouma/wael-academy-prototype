import { useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, BookOpen, Check, FlaskConical, Globe, Lightbulb, Minus, Plus, Quote, Radical, Triangle } from "lucide-react"
import { SubjectIcon } from "@/components/icons/subjects"
import { useToast } from "@/components/kit/Toast"
import { useData } from "@/stores/useData"
import { cn } from "@/lib/utils"
import character from "../../../svg icons/Caracter.png"
import heroPoster from "@/assets/site/hero-poster.webp"
import platform from "@/assets/site/platform.webp"
import teacherAtef from "@/assets/site/teacher-atef.webp"
import teacherJawher from "@/assets/site/teacher-jawher.webp"
import teacherKholoud from "@/assets/site/teacher-kholoud.webp"
import { PortraitStage } from "@/features/student-v2/PortraitStage"
import { ARTICLES, FAQ, LEVELS, OFFER_TABS, STEPS, TEACHERS, TESTIMONIALS } from "./content"
import {
  FloatBadge,
  PlayOrb,
  RailArrows,
  Rating,
  SectionTitle,
  StatsSection,
  btnLime,
  btnOutline,
  container,
  useRail,
  useVideo,
} from "./parts"
import { OFFERS, SIGN_UP } from "./SiteLayout"

const PHOTOS = { atef: teacherAtef, jawher: teacherJawher, kholoud: teacherKholoud }

/**
 * الصفحة الرئيسية — « Page D'acceuil - Menu with Background », top to bottom:
 * hero · numbers · the Wael Documents story · pick your level · 3 steps ·
 * teachers · popular offers · success stories · pricing · FAQ · blog · CTA.
 *
 * The frames' grey boxes are placeholders; each one here is given something
 * true to show — the academy's clip, the real student dashboard, Wael dressed
 * for the matière with his eyes following the cursor — and every play button
 * plays.
 */
export default function HomePage() {
  const video = useVideo()
  return (
    <>
      <Hero onPlay={video.play} />
      <StatsSection />
      <Story onPlay={video.play} />
      <Levels />
      <Steps onPlay={video.play} />
      <Teachers />
      <Offers onPlay={video.play} />
      <Stories onPlay={video.play} />
      <Pricing />
      <Faq />
      <Blog />
      <Cta />
      {video.dialog}
    </>
  )
}

/* ------------------------------------------------------------------ */

/** Faint line drawings on the mint, as in the frame. */
const HERO_DOODLES = [
  { Icon: Radical, cls: "top-[18%] end-[74%] size-12 -rotate-12" },
  { Icon: Triangle, cls: "top-[22%] end-[93%] size-14 rotate-12" },
  { Icon: Lightbulb, cls: "top-[16%] start-[25%] size-12" },
  { Icon: BookOpen, cls: "top-[31%] start-[3%] size-14 rotate-12" },
  { Icon: Globe, cls: "top-[55%] end-[92%] size-14 -rotate-12" },
  { Icon: FlaskConical, cls: "top-[56%] start-[4%] size-12 rotate-12" },
]

function Hero({ onPlay }: { onPlay: () => void }) {
  return (
    <section className="relative overflow-hidden pt-28 md:pt-40">
      {/* The mint + grid stops two-thirds down the video, which then sits over
          the white — the frame's overlap. */}
      <div aria-hidden className="absolute inset-x-0 top-0 bottom-[22%] bg-v2-mint-grid md:bottom-[30%]" />
      {HERO_DOODLES.map(({ Icon, cls }, i) => (
        <Icon key={i} aria-hidden strokeWidth={1.1} className={cn("pointer-events-none absolute hidden text-v2-ink/15 md:block", cls)} />
      ))}

      <div className={cn(container, "relative")}>
        {/* The two top badges need the width beside the title — from sm up only. */}
        <FloatBadge className="hidden sm:block sm:start-0 sm:top-2 md:start-[4%] md:top-0" delay={0} tilt={-10}>
          <Rating />
        </FloatBadge>
        <FloatBadge className="hidden sm:block sm:end-0 sm:top-24 md:end-[2%] md:top-28" delay={1.2} tilt={-12}>
          <span className="block text-[calc(15px*var(--ts))] font-black md:text-[calc(22px*var(--ts))]" dir="ltr">
            10+
          </span>
          <span className="block text-[calc(7px*var(--ts))] text-v2-ink/70 md:text-[calc(9px*var(--ts))]">حصص يومياً</span>
        </FloatBadge>

        <div className="relative z-10 mx-auto max-w-3xl pb-10 pt-6 text-center sm:pt-24 md:pb-14 md:pt-6">
          <h1 className="font-bold leading-[1.15] text-v2-ink">
            <span className="block text-[calc(22px*var(--ts))] md:text-[calc(32px*var(--ts))]">منصتك الأولى</span>
            <span className="relative inline-block">
              {/* The frame's little pen strokes round the gradient line. */}
              <svg aria-hidden viewBox="0 0 40 40" className="absolute -start-7 -top-4 size-8 text-v2-ink md:-start-10 md:size-10" fill="none">
                <path d="M26 4l3 11M36 16l-9 4M14 8l6 9" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
              <span className="text-v2-grad block pb-1 text-[calc(30px*var(--ts))] md:text-[calc(44px*var(--ts))]">للنجاح والتفوق</span>
              <svg aria-hidden viewBox="0 0 40 40" className="absolute -bottom-2 -end-8 size-8 text-v2-ink md:-end-11 md:size-10" fill="none">
                <path d="M6 28l12-2M10 16l8 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </span>
            <span className="block text-[calc(22px*var(--ts))] md:text-[calc(32px*var(--ts))]">في تونس</span>
          </h1>

          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4 md:mt-10">
            <Link to={SIGN_UP} className={cn(btnLime, "md:min-h-16 md:px-12")}>
              سجل الآن
            </Link>
            <a href="#mnassa" className={cn(btnOutline, "md:min-h-16 md:px-10")}>
              اكتشف كيف نعمل
            </a>
            {/* The hand-drawn arrow from the rating down to the button. */}
            <svg aria-hidden viewBox="0 0 90 120" className="absolute -top-24 start-[8%] hidden h-28 w-20 text-v2-ink md:block" fill="none">
              <path d="M78 4C84 40 64 86 14 104" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="M26 92 12 106l20 3" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* The film. */}
        <div className="relative mx-auto max-w-[62rem]">
          <FloatBadge className="-top-10 start-[-2%] md:-top-14 md:start-[-6%]" delay={0.6} tilt={10}>
            <span className="block text-[calc(10px*var(--ts))] font-black md:text-[calc(13px*var(--ts))]">سلسلة كتب</span>
            <span className="block text-[calc(8px*var(--ts))] text-v2-ink/75 md:text-[calc(10px*var(--ts))]" dir="ltr">
              Wael Documents
            </span>
          </FloatBadge>
          <FloatBadge className="-bottom-10 end-[-2%] md:bottom-16 md:end-[-8%]" delay={1.8} tilt={12}>
            <span className="block text-[calc(15px*var(--ts))] font-black md:text-[calc(20px*var(--ts))]">7 سنوات</span>
            <span className="block text-[calc(7px*var(--ts))] text-v2-ink/70 md:text-[calc(9px*var(--ts))]">من الخبرة</span>
          </FloatBadge>
          <button
            type="button"
            onClick={onPlay}
            aria-label="شغّل فيديو التقديم"
            className="group relative block aspect-[996/662] w-full overflow-hidden rounded-[1.25rem] shadow-2xl shadow-v2-ink/20 md:rounded-[1.875rem]"
          >
            <img src={heroPoster} alt="" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.03]" />
            <span className="absolute inset-0 bg-v2-ink/35 transition group-hover:bg-v2-ink/25" />
            <PlayOrb size="lg" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
          </button>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

function Story({ onPlay }: { onPlay: () => void }) {
  return (
    <section className={cn(container, "grid items-center gap-12 py-12 md:py-20 lg:grid-cols-2 lg:gap-16")}>
      <div className="text-start">
        <h2 className="text-[calc(20px*var(--ts))] font-bold leading-snug text-v2-ink md:text-[calc(28px*var(--ts))]">
          من صناع "وائل دوكيمون".. منصتكم التعليمية الأقوى في تونس
        </h2>
        <p className="mt-6 text-[calc(10px*var(--ts))] leading-loose text-v2-ink/80 md:text-[calc(11.5px*var(--ts))]">
          على مدار 7 سنوات، كانت كتب "وائل دوكيمون" السلاح الأول لآلاف التلاميذ للنجاح والتميز في الباكالوريا. اليوم،
          أخذنا هذه الخبرة ونقلناها إلى العالم الرقمي عبر "وائل أكاديمي". نحن لا نقدم مجرد دروس، بل ندمج جودة مصادرنا
          المطبوعة (رقم 1 في تونس) مع قوة التعليم التفاعلي المباشر، لنرافقك "خطوة بخطوة" نحو الـ Mention.
        </p>
        <a href="#prix" className={cn(btnLime, "mt-8 md:min-h-16 md:px-16")}>
          اختر الآن
        </a>
      </div>

      {/* The frame's grey box, given its subject: Wael, and the matières he wears. */}
      <div className="relative lg:order-first">
        <FloatBadge className="-top-10 end-[10%]" delay={0.4} tilt={-6}>
          <span className="block text-[calc(15px*var(--ts))] font-black md:text-[calc(19px*var(--ts))]">رقم 1</span>
          <span className="block text-[calc(7px*var(--ts))] text-v2-ink/70 md:text-[calc(8.5px*var(--ts))]">الأكثر مبيعاً</span>
        </FloatBadge>
        <FloatBadge className="-bottom-8 -start-4 md:-start-10" delay={1.4} tilt={8}>
          <span className="block text-[calc(15px*var(--ts))] font-black md:text-[calc(19px*var(--ts))]">7 سنوات</span>
          <span className="block text-[calc(7px*var(--ts))] text-v2-ink/70 md:text-[calc(8.5px*var(--ts))]">من الخبرة</span>
        </FloatBadge>
        <button
          type="button"
          onClick={onPlay}
          aria-label="شغّل الفيديو"
          className="group relative block aspect-[4/5] w-full overflow-hidden rounded-3xl bg-v2-grad-deep sm:aspect-[5/4] lg:aspect-[4/5]"
        >
          <div aria-hidden className="absolute inset-0 opacity-60 bg-v2-footer" />
          <SubjectIcon name="رياضيات" className="absolute start-[6%] top-[10%] aspect-square w-[34%] -rotate-6 transition duration-500 group-hover:-rotate-3" />
          <SubjectIcon name="علوم فيزيائية" className="absolute end-[6%] top-[14%] aspect-square w-[30%] rotate-6 transition duration-500 group-hover:rotate-3" />
          <img src={character} alt="" className="absolute bottom-0 left-1/2 h-[68%] -translate-x-1/2 drop-shadow-2xl" />
          <PlayOrb className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2" />
        </button>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

function Levels() {
  const [active, setActive] = useState(0)
  const n = LEVELS.length
  const at = (k: number) => LEVELS[(active + k + n) % n]
  const card = (level: (typeof LEVELS)[number], role: "main" | "side", k: number) => (
    <article
      key={`${level.id}-${role}`}
      onClick={role === "side" ? () => setActive((active + k + n) % n) : undefined}
      className={cn(
        "flex flex-col items-center text-center transition-all duration-500",
        role === "main"
          ? "relative z-10 rounded-2xl bg-v2-grad-deep px-6 py-12 text-white shadow-2xl shadow-v2-deep/30 md:px-10 md:py-16"
          : "hidden cursor-pointer rounded-2xl bg-white px-6 py-8 text-v2-ink shadow-[0_6px_24px_-8px_rgb(23_46_91/0.25)] hover:-translate-y-1 md:flex",
      )}
    >
      <h3 className={cn("font-bold", role === "main" ? "text-[calc(22px*var(--ts))] md:text-[calc(28px*var(--ts))]" : "text-[calc(13px*var(--ts))]")}>
        {level.title}
      </h3>
      <p className={cn("mt-1", role === "main" ? "text-[calc(12px*var(--ts))] text-white/85" : "text-[calc(10px*var(--ts))] text-v2-ink/75")}>
        {level.sub}
      </p>
      <p className={cn("mt-4 leading-relaxed", role === "main" ? "text-[calc(12px*var(--ts))]" : "max-w-[14rem] text-[calc(9px*var(--ts))] text-v2-ink/70")}>
        {level.text}
      </p>
      <Link
        to={OFFERS}
        onClick={(e) => e.stopPropagation()}
        className={cn(role === "main" ? cn(btnLime, "mt-6") : "mt-5 inline-flex min-h-11 items-center rounded-xl border border-v2-ink px-8 text-[calc(9px*var(--ts))] font-bold transition hover:bg-v2-ink hover:text-white")}
      >
        اختر الآن
      </Link>
    </article>
  )

  return (
    <section className={cn(container, "py-12 md:py-20")}>
      <SectionTitle title="اختر مستواك الدراسي" sub="ابدأ من هنا.. اختر مستواك الدراسي" />
      <div className="mt-10 grid items-center md:mt-14 md:grid-cols-[1fr_1.5fr_1fr]">
        {/* Side cards tuck in UNDER the main one, as in the frame. */}
        <div className="md:-me-8">{card(at(-1), "side", -1)}</div>
        {card(at(0), "main", 0)}
        <div className="md:-ms-8">{card(at(1), "side", 1)}</div>
      </div>
      <div className="mt-10 flex flex-col items-center gap-4">
        <RailArrows onPrev={() => setActive((active - 1 + n) % n)} onNext={() => setActive((active + 1) % n)} canPrev canNext />
        <div className="flex gap-2" aria-hidden>
          {LEVELS.map((l, i) => (
            <span key={l.id} className={cn("h-1.5 rounded-full transition-all", i === active ? "w-8 bg-v2-grad" : "w-1.5 bg-v2-ink/20")} />
          ))}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

function Steps({ onPlay }: { onPlay: () => void }) {
  const [hot, setHot] = useState(0)
  return (
    <section id="mnassa" className={cn(container, "scroll-mt-24 py-12 md:py-20")}>
      <SectionTitle title="طريقك للنجاح في 3 خطوات بسيطة" sub="(ثلاث خطوات بسيطة توضح سهولة استخدام المنصة)" />
      <div className="mt-10 grid items-center gap-8 md:mt-14 lg:grid-cols-[1fr_1.4fr]">
        <ol className="flex flex-col gap-5">
          {STEPS.map((s, i) => (
            <li key={s.n}>
              <button
                type="button"
                onMouseEnter={() => setHot(i)}
                onFocus={() => setHot(i)}
                onClick={() => setHot(i)}
                className={cn(
                  "w-full rounded-2xl bg-white p-5 text-start shadow-[0_6px_24px_-8px_rgb(23_46_91/0.25)] transition md:p-6",
                  hot === i && "ring-2 ring-v2-cta",
                )}
              >
                <span className="flex items-center gap-4">
                  <span dir="ltr" className="grid size-12 shrink-0 place-items-center rounded-full bg-v2-grad text-[calc(10px*var(--ts))] font-bold text-white">
                    {s.n}
                  </span>
                  <span className="text-[calc(13px*var(--ts))] font-bold text-v2-ink md:text-[calc(16px*var(--ts))]">{s.title}</span>
                </span>
                <span className="mt-3 block text-[calc(9px*var(--ts))] leading-relaxed text-v2-ink/75 md:text-[calc(10.5px*var(--ts))]">{s.text}</span>
              </button>
            </li>
          ))}
        </ol>
        {/* The frame's grey box: the real student dashboard, in a browser frame. */}
        <button
          type="button"
          onClick={onPlay}
          aria-label="شوف كيفاش تخدم المنصة"
          className="group relative block overflow-hidden rounded-3xl bg-white shadow-2xl shadow-v2-ink/15 lg:order-first"
        >
          <span className="flex items-center gap-1.5 border-b border-v2-ink/10 bg-v2-ink/[0.03] px-4 py-3" dir="ltr">
            <span className="size-3 rounded-full bg-v2-live/70" />
            <span className="size-3 rounded-full bg-v2-done/70" />
            <span className="size-3 rounded-full bg-v2-cta" />
            <span className="ms-3 truncate rounded-full bg-white px-4 py-1 text-[calc(7px*var(--ts))] text-v2-ink/50">waelacademy.com/eleve</span>
          </span>
          <img src={platform} alt="لوحة التلميذ في منصة وائل أكاديمي" className="block w-full transition duration-700 group-hover:scale-[1.02]" />
          <span className="absolute inset-0 bg-v2-ink/10 transition group-hover:bg-v2-ink/0" />
          <PlayOrb size="lg" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        </button>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

function Teachers() {
  const rail = useRail<HTMLUListElement>()
  return (
    <section id="asatidha" className="scroll-mt-24 bg-v2-aqua-grid py-14 md:py-24">
      <div className={container}>
        <SectionTitle title="تعلم مع أقوى الأساتذة في تونس" sub="كفاءات وخبرات طويلة وضعناها بين يديك لتبسيط أصعب الدروس ومرافقتك نحو الامتياز." align="start">
          <RailArrows onPrev={() => rail.step(-1)} onNext={() => rail.step(1)} canPrev={rail.canPrev} canNext={rail.canNext} />
        </SectionTitle>
        <ul ref={rail.ref} className="-mx-4 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:mt-14 md:px-0">
          {TEACHERS.map((t) => (
            <li key={t.name} className="group w-[78%] shrink-0 snap-start sm:w-[45%] md:w-[calc((100%-2.5rem)/3)]">
              <div className="overflow-hidden rounded-2xl bg-[#EEFDEA]">
                {/* #EEFDEA: the frame's pale mint behind each portrait — a one-off tint between the ramp's ends. */}
                <img src={PHOTOS[t.photo]} alt={t.name} className="mx-auto block aspect-[4/5] w-full object-cover object-top transition duration-700 group-hover:scale-[1.04]" />
              </div>
              <p className="mt-4 text-center text-[calc(13px*var(--ts))] font-bold text-v2-ink">{t.name}</p>
              <p className="text-center text-[calc(9.5px*var(--ts))] text-v2-ink/70">{t.subject}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

function Offers({ onPlay }: { onPlay: () => void }) {
  const [tab, setTab] = useState(0)
  const offer = OFFER_TABS[tab]
  return (
    <section id="offres" className={cn(container, "scroll-mt-24 py-14 md:py-24")}>
      <SectionTitle title="اكتشف العروض الأكثر إقبالاً" sub="الدروس والعروض الأكثر طلباً" />
      <div role="tablist" className="mt-10 grid grid-cols-2 gap-3 md:mt-14 md:gap-6 lg:grid-cols-4">
        {OFFER_TABS.map((o, i) => (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={tab === i}
            onClick={() => setTab(i)}
            className={cn(
              "min-h-16 rounded-2xl px-3 text-[calc(9px*var(--ts))] font-medium transition md:text-[calc(11px*var(--ts))]",
              tab === i ? "bg-v2-grad font-bold text-white shadow-lg shadow-v2-brand/25" : "bg-white text-v2-ink shadow-[0_6px_24px_-8px_rgb(23_46_91/0.25)] hover:-translate-y-0.5",
            )}
          >
            {o.tab}
          </button>
        ))}
      </div>

      <div key={offer.id} className="mt-8 grid items-center gap-8 overflow-hidden rounded-3xl bg-v2-grad-deep p-6 text-white animate-in fade-in-0 duration-500 md:mt-12 md:p-14 lg:grid-cols-2 lg:gap-12">
        <div>
          <h3 className="text-[calc(18px*var(--ts))] font-bold md:text-[calc(24px*var(--ts))]">{offer.title}</h3>
          <p className="mt-4 text-[calc(15px*var(--ts))] font-light leading-snug md:text-[calc(22px*var(--ts))]">
            {offer.body} <span className="font-bold text-v2-cta">{offer.highlight}</span>
          </p>
          <Link to={OFFERS} className={cn(btnLime, "mt-8")}>
            اختر الآن
          </Link>
        </div>
        <button
          type="button"
          onClick={onPlay}
          aria-label="شوف الفيديو"
          className="group relative block overflow-hidden rounded-3xl bg-white lg:order-first"
        >
          <PortraitStage name={offer.subject} />
          <span className="absolute bottom-4 start-4 inline-flex items-center gap-2 rounded-full bg-v2-ink/80 px-4 py-2 text-[calc(8px*var(--ts))] font-semibold text-white backdrop-blur">
            <PlayOrb className="size-8 bg-white/30 [&>span]:size-6 [&_svg]:size-3" /> شوف الفيديو
          </span>
        </button>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

function Stories({ onPlay }: { onPlay: () => void }) {
  const rail = useRail<HTMLUListElement>()
  return (
    <section className={cn(container, "py-12 md:py-20")}>
      <SectionTitle title="قصص نجاح بدأت من هنا" sub="اسمع تجارب تلامذتنا كيفاش حققوا طموحاتهم وتفوقوا مع وائل أكاديمي" align="start">
        <RailArrows onPrev={() => rail.step(-1)} onNext={() => rail.step(1)} canPrev={rail.canPrev} canNext={rail.canNext} />
      </SectionTitle>
      <ul ref={rail.ref} className="-mx-4 mt-10 flex snap-x snap-mandatory items-center gap-5 overflow-x-auto px-4 py-4 [scrollbar-width:none] md:mx-0 md:mt-14 md:px-1">
        {TESTIMONIALS.map((t) => (
          <li key={t.name} className="w-[80%] shrink-0 snap-center sm:w-[45%] md:w-[calc((100%-2.5rem)/3)]">
            {t.video ? (
              <button
                type="button"
                onClick={onPlay}
                className="group relative flex aspect-[4/5] w-full flex-col items-center justify-end overflow-hidden rounded-3xl bg-v2-grad-deep p-6 text-white"
              >
                <img src={heroPoster} alt="" className="absolute inset-0 size-full object-cover opacity-40 mix-blend-luminosity transition duration-700 group-hover:scale-105" />
                <PlayOrb className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2" />
                <span className="relative text-[calc(12px*var(--ts))] font-bold">{t.name}</span>
                <span className="relative text-[calc(8.5px*var(--ts))] text-white/80" dir="auto">{t.meta}</span>
              </button>
            ) : (
              <figure className="flex aspect-[4/5] flex-col justify-between rounded-3xl bg-white p-6 shadow-[0_6px_24px_-8px_rgb(23_46_91/0.25)] md:p-8">
                <Quote className="size-10 text-v2-cta" />
                <blockquote className="text-[calc(11px*var(--ts))] leading-relaxed text-v2-ink md:text-[calc(12px*var(--ts))]">{t.quote}</blockquote>
                <figcaption className="flex items-center gap-3">
                  <span className="grid size-12 place-items-center rounded-full bg-v2-grad text-[calc(9px*var(--ts))] font-bold text-white">
                    {t.name.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                  </span>
                  <span>
                    <span className="block text-[calc(10px*var(--ts))] font-bold text-v2-ink">{t.name}</span>
                    <span className="block text-[calc(8px*var(--ts))] text-v2-ink/60" dir="auto">{t.meta}</span>
                  </span>
                </figcaption>
              </figure>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ------------------------------------------------------------------ */

/**
 * The pricing card, as drawn — tabs over a list of radio rows, the chosen one
 * opened in white with a dashed lime edge. The rows are the academy's REAL
 * offers from the store (the frame's 60 / 120 / 60 were placeholders), so the
 * landing and the élève's offers page can never disagree on a price.
 */
function Pricing() {
  const offers = useData((s) => s.offers)
  const [pick, setPick] = useState(offers[0]?.id ?? "")
  return (
    <section id="prix" className={cn(container, "scroll-mt-24 py-12 md:py-20")}>
      <SectionTitle title={<>استثمر في نجاحك.. اختر <br className="hidden md:block" />العرض الذي يناسبك</>} />
      <div className="mx-auto mt-10 max-w-[50rem] rounded-3xl bg-v2-grad-deep p-5 md:mt-14 md:p-14">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
          <h3 className="text-[calc(16px*var(--ts))] font-bold text-white md:text-[calc(20px*var(--ts))]">اختر العرض</h3>
          <div role="tablist" className="flex flex-wrap gap-x-6 gap-y-2">
            {offers.map((o) => (
              <button
                key={o.id}
                type="button"
                role="tab"
                aria-selected={pick === o.id}
                onClick={() => setPick(o.id)}
                className={cn(
                  "border-b-2 pb-1 text-[calc(9.5px*var(--ts))] transition",
                  pick === o.id ? "border-v2-cta font-bold text-v2-ink" : "border-transparent text-white/75 hover:text-white",
                )}
                dir="auto"
              >
                {o.name}
              </button>
            ))}
          </div>
        </div>

        <div role="radiogroup" className="mt-8 flex flex-col gap-4">
          {offers.map((o) => {
            const on = pick === o.id
            return (
              <div
                key={o.id}
                role="radio"
                aria-checked={on}
                tabIndex={0}
                onClick={() => setPick(o.id)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setPick(o.id)}
                className={cn(
                  "cursor-pointer rounded-2xl p-5 transition-all duration-300 md:px-6",
                  on ? "border-2 border-dashed border-v2-cta bg-white" : "bg-white/60 hover:bg-white/75",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn("grid size-5 shrink-0 place-items-center rounded-full border-2 border-v2-cta", on && "bg-v2-cta")}>
                    {on && <Check className="size-3 text-v2-on-cta" strokeWidth={3} />}
                  </span>
                  <span className="text-[calc(12px*var(--ts))] font-bold text-v2-ink md:text-[calc(15px*var(--ts))]" dir="auto">
                    {o.name}
                  </span>
                  <span className="ms-auto flex items-baseline gap-1.5 text-v2-ink" dir="ltr">
                    {o.promoPrice && <span className="text-[calc(9px*var(--ts))] tabular-nums text-v2-live line-through decoration-2">{o.price}</span>}
                    <span className={cn("font-black tabular-nums", on ? "text-[calc(26px*var(--ts))]" : "text-[calc(20px*var(--ts))]")}>{o.promoPrice ?? o.price}</span>
                    <span className="text-[calc(8px*var(--ts))]">Dt</span>
                  </span>
                </div>
                {on && (
                  <div className="mt-3 animate-in fade-in-0 slide-in-from-top-1 duration-300 ps-8">
                    <p className="text-[calc(9px*var(--ts))] text-v2-ink/70">{o.audience ?? o.period}</p>
                    <p className="mt-2 text-[calc(9.5px*var(--ts))] leading-relaxed text-v2-ink/80">{o.description}</p>
                    <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                      {(o.features ?? []).slice(0, 8).map((f) => (
                        <li key={f} className="flex items-start gap-2 text-[calc(9px*var(--ts))] text-v2-ink">
                          <Check className="mt-1 size-4 shrink-0 text-v2-brand" strokeWidth={2.5} />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link to={OFFERS} className={cn(btnLime, "mt-5")}>
                      اشترك في {o.name}
                      <ArrowLeft className="size-5" />
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

function Faq() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className={cn(container, "py-12 md:py-20")}>
      <SectionTitle title="الأسئلة الشائعة" sub="الأسئلة المتكررة حول المنصّة التعليمية" />
      <div className="mt-10 grid items-start gap-5 md:mt-14 md:grid-cols-2">
        {FAQ.map((f, i) => {
          const on = open === i
          return (
            <div key={f.q} className="rounded-2xl bg-white shadow-[0_6px_24px_-8px_rgb(23_46_91/0.25)]">
              <button
                type="button"
                aria-expanded={on}
                onClick={() => setOpen(on ? null : i)}
                className="flex min-h-16 w-full items-center gap-4 p-5 text-start md:px-6"
              >
                <span className="flex-1 text-[calc(11.5px*var(--ts))] font-bold text-v2-ink md:text-[calc(14px*var(--ts))]">{f.q}</span>
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-v2-grad text-white transition">
                  {on ? <Minus className="size-5" /> : <Plus className="size-5" />}
                </span>
              </button>
              <div className={cn("grid transition-[grid-template-rows] duration-300", on ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                <p className="overflow-hidden px-5 text-[calc(9.5px*var(--ts))] leading-relaxed text-v2-ink/75 md:px-6">
                  <span className="block pb-5">{f.a}</span>
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */

function Blog() {
  const rail = useRail<HTMLUListElement>()
  const { toast, show } = useToast()
  return (
    <section className={cn(container, "py-12 md:py-20")}>
      <SectionTitle title="آخر ما كتبنا" sub="مقالات قصيرة وعمليّة من فريق وائل أكاديمي" align="start">
        <RailArrows onPrev={() => rail.step(-1)} onNext={() => rail.step(1)} canPrev={rail.canPrev} canNext={rail.canNext} />
      </SectionTitle>
      <ul ref={rail.ref} className="-mx-4 mt-10 grid snap-x snap-mandatory auto-cols-[85%] grid-flow-col gap-5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:mx-0 md:mt-14 md:auto-cols-auto md:grid-flow-row md:grid-cols-2 md:overflow-visible md:px-0">
        {ARTICLES.map((a) => (
          <li key={a.title} className="snap-start">
            <article className="group flex h-full gap-4 rounded-2xl bg-white p-4 shadow-[0_6px_24px_-8px_rgb(23_46_91/0.25)] transition hover:-translate-y-1 md:p-5">
              <div className="min-w-0 flex-1">
                <p className="text-[calc(8px*var(--ts))] text-v2-ink/60">{a.date}</p>
                <h3 className="mt-2 text-[calc(11.5px*var(--ts))] font-bold leading-snug text-v2-ink md:text-[calc(13px*var(--ts))]">{a.title}</h3>
                <p className="mt-2 line-clamp-2 text-[calc(8.5px*var(--ts))] leading-relaxed text-v2-ink/70">{a.excerpt}</p>
                <button
                  type="button"
                  onClick={() => show("المقال ينشر قريب في المدوّنة")}
                  className="mt-3 inline-block border-b-2 border-v2-cta pb-0.5 text-[calc(9px*var(--ts))] font-bold text-v2-ink transition hover:text-v2-brand"
                >
                  إقرأ المزيد
                </button>
              </div>
              {/* The frame's grey thumbnail: the matière, drawn — with its gaze. */}
              <div className="grid aspect-square w-28 shrink-0 place-items-center rounded-2xl bg-v2-brand/[0.08] md:w-36">
                <SubjectIcon name={a.subject} className="aspect-square w-[88%] transition duration-500 group-hover:scale-105" />
              </div>
            </article>
          </li>
        ))}
      </ul>
      {toast}
    </section>
  )
}

/* ------------------------------------------------------------------ */

function Cta() {
  return (
    <section className={cn(container, "py-12 md:py-20")}>
      <div className="relative grid items-center gap-10 overflow-hidden rounded-3xl bg-v2-grad-deep px-6 py-12 md:px-16 md:py-16 lg:grid-cols-[1.2fr_1fr]">
        <FlaskConical aria-hidden className="pointer-events-none absolute bottom-[18%] end-[28%] size-14 rotate-12 text-white/15" strokeWidth={1.1} />
        <BookOpen aria-hidden className="pointer-events-none absolute end-[4%] top-[4%] size-16 -rotate-12 text-white/15" strokeWidth={1.1} />
        <div className="relative text-white">
          <h2 className="text-[calc(18px*var(--ts))] font-light leading-snug md:text-[calc(24px*var(--ts))]">
            مستقبل ولدك يبدأ بخطوة اليوم.
            <br />
            هل أنت مستعد؟
          </h2>
          <div className="mt-6 flex items-center gap-4">
            <svg aria-hidden viewBox="0 0 100 80" className="hidden h-16 w-20 text-white md:block" fill="none">
              <path d="M8 6c4 30 26 56 78 62" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              <path d="M74 56l13 12-17 4" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <Link to={SIGN_UP} className={btnLime}>
              سجل الآن وانضم لعائلتنا
            </Link>
          </div>
        </div>
        <div className="relative mx-auto w-full max-w-sm">
          <FloatBadge className="-top-10 end-[-6%]" delay={0.3} tilt={-8}>
            <Rating />
          </FloatBadge>
          <FloatBadge className="-bottom-10 start-[-8%]" delay={1.1} tilt={8}>
            <span className="block text-[calc(15px*var(--ts))] font-black md:text-[calc(20px*var(--ts))]" dir="ltr">
              10+
            </span>
            <span className="block text-[calc(7px*var(--ts))] text-v2-ink/70 md:text-[calc(9px*var(--ts))]">حصص يومياً</span>
          </FloatBadge>
          <div className="relative flex aspect-[4/3] items-end justify-center overflow-hidden rounded-2xl bg-white">
            <SubjectIcon name="فلسفة" className="absolute start-[6%] top-[8%] aspect-square w-[32%] -rotate-6" />
            <SubjectIcon name="أنڤليزية" className="absolute end-[6%] top-[10%] aspect-square w-[30%] rotate-6" />
            <img src={character} alt="" className="relative h-[88%] drop-shadow-xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
