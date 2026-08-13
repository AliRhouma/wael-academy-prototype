import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { Link } from "react-router-dom"
import {
  ArrowLeft,
  BookOpen,
  Brain,
  CalendarClock,
  CalendarDays,
  Camera,
  Check,
  ClipboardCheck,
  Clock,
  CreditCard,
  Download,
  FileText,
  Gift,
  GraduationCap,
  Heart,
  Languages,
  LifeBuoy,
  Lock,
  MessageCircle,
  Play,
  Radio,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  Video,
} from "lucide-react"
import "./landing.css"

/* ------------------------------------------------------------------ */
/* Motion: scroll-reveal wrapper (IntersectionObserver → .is-in)       */
/* ------------------------------------------------------------------ */

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`lp-reveal ${inView ? "is-in" : ""} ${className}`}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Small shared pieces                                                 */
/* ------------------------------------------------------------------ */

function Kicker({ children }: { children: ReactNode }) {
  return (
    <p className="font-display text-[calc(11px*var(--ts))] font-bold uppercase tracking-[.16em] text-accent2-600">
      {children}
    </p>
  )
}

function BrandMark({ size = "size-9" }: { size?: string }) {
  return (
    <span className={`grid ${size} place-items-center rounded-[11px] bg-grad text-ink-inverted shadow-brand`}>
      <GraduationCap className="size-5" />
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Navbar                                                              */
/* ------------------------------------------------------------------ */

function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 pt-safe backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1220px] items-center gap-3 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <BrandMark />
          <span className="leading-tight">
            <span className="block font-display text-[calc(15px*var(--ts))] font-bold text-ink">Wael Academy</span>
            <span className="block text-[calc(10px*var(--ts))] font-medium uppercase tracking-[.14em] text-accent2-600">
              أكاديمية
            </span>
          </span>
        </Link>

        <nav className="ms-auto hidden items-center gap-1 md:flex">
          {[
            ["#fonctionnalites", "المميّزات"],
            ["#ia", "ذكاء اصطناعي تعليمي"],
            ["#offres", "العروض"],
          ].map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="rounded-md px-3.5 py-2 text-[calc(13.5px*var(--ts))] font-medium text-ink-subtle transition hover:bg-brand-50 hover:text-brand-600"
            >
              {label}
            </a>
          ))}
        </nav>

        <Link
          to="/roles"
          className="ms-auto inline-flex h-10 items-center gap-2 rounded-md bg-grad px-4 text-[calc(13.5px*var(--ts))] font-medium text-ink-inverted shadow-brand transition hover:brightness-105 md:ms-3"
        >
          جرّب الديمو <ArrowLeft className="size-4" />
        </Link>
      </div>
    </header>
  )
}

/* ------------------------------------------------------------------ */
/* Hero + its interface mockup                                         */
/* ------------------------------------------------------------------ */

/** Miniature student dashboard — pure divs, decoration only. */
function HeroMock() {
  return (
    <div aria-hidden className="pointer-events-none relative select-none">
      {/* Floating window */}
      <div className="lp-rise overflow-hidden rounded-xl border border-border bg-surface shadow-xl" style={{ "--d": ".25s" } as CSSProperties}>
        <div className="grid grid-cols-[52px_1fr]">
          {/* mini rail */}
          <aside className="flex flex-col items-center gap-3 border-e border-border bg-surface-muted py-4">
            <span className="grid size-8 place-items-center rounded-[9px] bg-grad text-ink-inverted shadow-brand">
              <GraduationCap className="size-4" />
            </span>
            <span className="mt-2 grid size-8 place-items-center rounded-[9px] bg-grad text-ink-inverted">
              <BookOpen className="size-4" />
            </span>
            <span className="grid size-8 place-items-center rounded-[9px] text-ink-muted">
              <CalendarDays className="size-4" />
            </span>
            <span className="grid size-8 place-items-center rounded-[9px] text-ink-muted">
              <ClipboardCheck className="size-4" />
            </span>
            <span className="grid size-8 place-items-center rounded-[9px] text-ink-muted">
              <MessageCircle className="size-4" />
            </span>
          </aside>

          {/* stage */}
          <div className="flex flex-col gap-3.5 p-4">
            <div className="flex items-center gap-3">
              <div>
                <p className="font-display text-[calc(14.5px*var(--ts))] font-bold text-ink">أهلا ياسمين</p>
                <p className="text-[calc(10.5px*var(--ts))] text-ink-muted">سنة باك · علوم تجريبية</p>
              </div>
              <div className="ms-auto grid size-8 place-items-center rounded-full bg-grad font-display text-[calc(12px*var(--ts))] font-bold text-ink-inverted shadow-[0_0_0_2px_var(--surface),0_0_0_3.5px_var(--brand-100)]">
                Y
              </div>
            </div>

            {/* resume-course card */}
            <div className="rounded-md border border-border bg-surface p-3 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-navy-50 text-navy-500">
                  <Play className="size-4" />
                </span>
                <span className="min-w-0">
                  <b className="block truncate font-display text-[calc(11.5px*var(--ts))] font-bold text-ink">
                    رياضيات — النهايات والاتّصال
                  </b>
                  <span className="text-[calc(9.5px*var(--ts))] text-ink-muted">كمّل من 12:34 · الفصل 3</span>
                </span>
                <span className="ms-auto font-display text-[calc(11px*var(--ts))] font-bold text-brand-600">62%</span>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-neutral-100">
                <div className="lp-bar h-full rounded-full bg-grad" style={{ "--w": "62%" } as CSSProperties} />
              </div>
            </div>

            {/* next live chip */}
            <div className="rounded-sm border-s-4 border-s-danger-500 bg-danger-50 p-[9px_10px_8px] shadow-sm">
              <span className="font-display text-[calc(10.5px*var(--ts))] font-bold text-danger-700">
                حصّة مباشرة · فيزياء — الموجات
              </span>
              <span className="mt-1 flex items-center gap-1.5 text-[calc(9.5px*var(--ts))] text-ink-muted">
                <Clock className="size-2.5 opacity-75" /> اليوم · 18:00 — التذكير مفعّل
              </span>
            </div>

            {/* two stat tiles */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-md bg-surface-muted p-2.5">
                <p className="text-[calc(9px*var(--ts))] text-ink-muted">وقت المراجعة · الجمعة</p>
                <b className="num font-display text-[calc(13px*var(--ts))] font-bold text-ink">6 س 40</b>
              </div>
              <div className="rounded-md bg-grad p-2.5 text-ink-inverted shadow-brand">
                <p className="text-[calc(9px*var(--ts))] text-white/80">فيديوهات كمّلت</p>
                <b className="num font-display text-[calc(13px*var(--ts))] font-bold">24 / 31</b>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* floating badges */}
      <div
        className="lp-rise lp-float absolute -top-4 -end-3 flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 shadow-lg sm:-end-6"
        style={{ "--d": ".55s" } as CSSProperties}
      >
        <span className="grid size-7 place-items-center rounded-[9px] bg-success-50 text-success-600">
          <ClipboardCheck className="size-3.5" />
        </span>
        <span className="text-[calc(11px*var(--ts))] font-medium text-ink">
          كويز تصلّح · <b className="num font-display font-bold text-success-600">18/20</b>
        </span>
      </div>

      <div
        className="lp-rise lp-float absolute -bottom-5 -start-3 flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 shadow-lg sm:-start-6"
        style={{ "--d": ".7s" } as CSSProperties}
      >
        <span className="grid size-7 place-items-center rounded-[9px] bg-accent2-50 text-accent2-500">
          <Sparkles className="size-3.5" />
        </span>
        <span className="text-[calc(11px*var(--ts))] font-medium text-ink">ذكاء اصطناعي · 3 مفاهيم تعاودها الخميس</span>
      </div>

      <div
        className="lp-rise lp-float absolute -end-2 bottom-16 flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 shadow-lg sm:-end-8"
        style={{ "--d": ".85s" } as CSSProperties}
      >
        <span className="lp-pulse size-2 rounded-full bg-danger-500" />
        <span className="text-[calc(11px*var(--ts))] font-medium text-ink">مباشر بعد 15 دقيقة</span>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid w-full max-w-[1220px] items-center gap-12 px-4 pb-20 pt-14 sm:px-6 md:pb-24 md:pt-20 lg:grid-cols-2 lg:gap-10">
        <div>
          <div className="lp-rise" style={{ "--d": "0s" } as CSSProperties}>
            <Kicker>منصّة تعليمية · تونس</Kicker>
          </div>
          <h1
            className="lp-rise mt-3 font-display text-[calc(32px*var(--ts))] font-bold leading-[1.14] text-ink sm:text-[calc(40px*var(--ts))] lg:text-[calc(44px*var(--ts))]"
            style={{ "--d": ".08s" } as CSSProperties}
          >
            اقرا وراجع وتقدّم —{" "}
            {/* inline clip: the .bg-grad shorthand resets background-clip, so set both here */}
            <span
              className="text-transparent"
              style={{ backgroundImage: "var(--grad)", WebkitBackgroundClip: "text", backgroundClip: "text" }}
            >
              في نفس البلاصة.
            </span>
          </h1>
          <p
            className="lp-rise mt-4 max-w-[520px] text-[calc(15.5px*var(--ts))] leading-relaxed text-ink-subtle"
            style={{ "--d": ".16s" } as CSSProperties}
          >
            دروس بالفيديو، حصص مباشرة مع أساتذتك، كويزات تتصلّح وحدها، وذكاء اصطناعي يعرف
            نقاط قوّتك ونقاط ضعفك. الباك متاعك الكل، في جيبك.
          </p>

          <div className="lp-rise mt-7 flex flex-wrap items-center gap-3" style={{ "--d": ".24s" } as CSSProperties}>
            <Link
              to="/student"
              className="inline-flex h-12 items-center gap-2 rounded-md bg-grad px-6 font-medium text-ink-inverted shadow-brand transition hover:-translate-y-0.5 hover:brightness-105"
            >
              اكتشف فضاء التلميذ <ArrowLeft className="size-4" />
            </Link>
            <a
              href="#offres"
              className="inline-flex h-12 items-center gap-2 rounded-md border border-border-strong bg-surface px-5 font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"
            >
              شوف العروض
            </a>
          </div>

          <div className="lp-rise mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[calc(12.5px*var(--ts))] text-ink-muted" style={{ "--d": ".32s" } as CSSProperties}>
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-success-600" /> الفرنسية والعربية
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-success-600" /> الخلاص بالدينار (ClicToPay)
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="size-3.5 text-success-600" /> ويب وموبايل وتابلات
            </span>
          </div>
        </div>

        <HeroMock />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Stats strip                                                         */
/* ------------------------------------------------------------------ */

function StatsStrip() {
  const stats = [
    { value: "8+", label: "موادّ مغطّاة" },
    { value: "500+", label: "دروس بالفيديو" },
    { value: "3 مرّات/جمعة", label: "حصص مباشرة حسب المادّة" },
    { value: "24/7", label: "مساعد ذكاء اصطناعي متوفّر" },
  ]
  return (
    <section className="mx-auto w-full max-w-[1220px] px-4 sm:px-6">
      <Reveal>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border shadow-sm md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-surface px-5 py-6 text-center">
              <b className="block font-display text-[calc(24px*var(--ts))] font-bold text-brand-600">{s.value}</b>
              <span className="mt-1 block text-[calc(12.5px*var(--ts))] text-ink-muted">{s.label}</span>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Feature showcases (ordered per cahier des charges §4)               */
/* ------------------------------------------------------------------ */

/** Mock 1 — secure video player + attached resources. */
function VideoMock() {
  return (
    <div aria-hidden className="pointer-events-none select-none rounded-lg border border-border bg-surface p-4 shadow-md">
      <p className="mb-3 flex items-center gap-1 text-[calc(10px*var(--ts))] text-ink-muted">
        رياضيات <span className="text-neutral-300">/</span> سنة باك{" "}
        <span className="text-neutral-300">/</span> الفصل 3 <span className="text-neutral-300">/</span>{" "}
        <span className="font-medium text-brand-600">الدرس 2</span>
      </p>
      {/* player */}
      <div className="relative overflow-hidden rounded-md bg-neutral-800">
        <div className="grid aspect-[16/8.5] place-items-center">
          <span className="grid size-12 place-items-center rounded-full bg-white/15 text-white backdrop-blur-sm">
            <Play className="size-5 translate-x-px" />
          </span>
        </div>
        <span className="absolute end-2.5 top-2.5 rounded-full bg-black/40 px-2 py-0.5 text-[calc(9px*var(--ts))] font-medium text-white/85">
          قارئ مؤمّن
        </span>
        <div className="absolute inset-x-3 bottom-2.5">
          <div className="h-1 overflow-hidden rounded-full bg-white/25">
            <div className="lp-bar h-full rounded-full bg-grad" style={{ "--w": "38%" } as CSSProperties} />
          </div>
          <p className="mt-1.5 text-[calc(9px*var(--ts))] text-white/70">كمّل من 12:34 · النهايات والاتّصال</p>
        </div>
      </div>
      {/* resources */}
      <div className="mt-3 flex flex-col">
        {[
          { name: "النصّ — سلسلة تمارين عدد 3", meta: "PDF · 1,2 م.ب", canDownload: true },
          { name: "إصلاح مفصّل للسلسلة", meta: "PDF · 2,8 م.ب", canDownload: false },
        ].map((r) => (
          <div key={r.name} className="flex items-center gap-3 border-t border-border py-2.5 first:border-t-0">
            <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-navy-50 text-navy-500">
              <FileText className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <p className="truncate text-[calc(11.5px*var(--ts))] font-medium text-ink">{r.name}</p>
              <span className="text-[calc(9.5px*var(--ts))] text-ink-muted">{r.meta}</span>
            </span>
            {r.canDownload ? (
              <span className="grid size-7 place-items-center rounded-[9px] bg-brand-50 text-brand-600">
                <Download className="size-3.5" />
              </span>
            ) : (
              <span className="grid size-7 place-items-center rounded-[9px] bg-neutral-100 text-ink-muted">
                <Lock className="size-3.5" />
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Mock 2 — live calendar + join + replays. */
function LiveMock() {
  const days = ["L", "M", "M", "J", "V", "S", "D"]
  return (
    <div aria-hidden className="pointer-events-none select-none rounded-lg border border-border bg-surface p-4 shadow-md">
      {/* mini calendar */}
      <div className="grid grid-cols-7 gap-y-0.5 text-center">
        {days.map((d, i) => (
          <div key={i} className={`pb-2 font-display text-[calc(10.5px*var(--ts))] font-bold ${i > 4 ? "text-accent2-500" : "text-brand-500"}`}>
            {d}
          </div>
        ))}
        {[14, 15, 16, 17, 18, 19, 20].map((n) => (
          <span
            key={n}
            className={`relative mx-auto grid h-[29px] w-full max-w-[38px] place-items-center rounded-[9px] text-[calc(11.5px*var(--ts))] font-medium ${
              n === 17
                ? "bg-danger-500 font-bold text-white shadow-[0_5px_12px_-4px_rgb(222_0_0/.55)]"
                : n === 19
                  ? "bg-grad font-bold text-ink-inverted shadow-brand"
                  : "text-ink-subtle"
            }`}
          >
            {n}
            {(n === 15 || n === 18) && (
              <i className="absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-brand-500" />
            )}
          </span>
        ))}
      </div>

      {/* live now */}
      <div className="mt-4 rounded-md border border-border bg-surface p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-danger-50 text-danger-600">
            <Radio className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <b className="block truncate font-display text-[calc(11.5px*var(--ts))] font-bold text-ink">
              فيزياء — الموجات الميكانيكية
            </b>
            <span className="flex items-center gap-1.5 text-[calc(9.5px*var(--ts))] text-ink-muted">
              <span className="lp-pulse size-1.5 rounded-full bg-danger-500" /> مباشر · الأستاذة الطرابلسي · الحضور متابع
            </span>
          </span>
          <span className="rounded-md bg-grad px-3 py-1.5 text-[calc(10.5px*var(--ts))] font-medium text-ink-inverted shadow-brand">
            Rejoindre
          </span>
        </div>
      </div>

      {/* replays */}
      <div className="mt-3 flex flex-col">
        {[
          { title: "تسجيل · كيمياء عضوية", meta: "العام الحالي · 1 سا 42 د" },
          { title: "تسجيل · مراجعة باك تجريبي", meta: "عام 2025 · 2 سا 10 د" },
        ].map((r) => (
          <div key={r.title} className="flex items-center gap-3 border-t border-border py-2.5 first:border-t-0">
            <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-brand-50 text-brand-600">
              <Video className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <p className="truncate text-[calc(11.5px*var(--ts))] font-medium text-ink">{r.title}</p>
              <span className="text-[calc(9.5px*var(--ts))] text-ink-muted">{r.meta}</span>
            </span>
            <Play className="size-3.5 text-ink-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}

/** Mock 3 — auto-corrected quiz. */
function QuizMock() {
  return (
    <div aria-hidden className="pointer-events-none select-none rounded-lg border border-border bg-surface p-4 shadow-md">
      <div className="flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-[9px] bg-brand-50 text-brand-600">
          <ClipboardCheck className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <b className="block font-display text-[calc(12px*var(--ts))] font-bold text-ink">كويز — النهايات والاتّصال</b>
          <span className="text-[calc(9.5px*var(--ts))] text-ink-muted">السؤال <span className="num">3 / 10</span> · مربوط بالدرس 2</span>
        </span>
        <span className="num rounded-full bg-success-50 px-2.5 py-0.5 font-display text-[calc(11px*var(--ts))] font-bold text-success-700">
          18/20
        </span>
      </div>

      <p className="mt-4 text-[calc(12px*var(--ts))] font-medium text-ink">
        نهاية (sin x)/x كي x تقرّب لـ 0 تساوي:
      </p>
      <div className="mt-2.5 flex flex-col gap-2">
        {[
          { label: "0", state: "idle" },
          { label: "1", state: "correct" },
          { label: "+∞", state: "wrong" },
        ].map((o) => (
          <div
            key={o.label}
            className={`flex items-center gap-2.5 rounded-md border px-3 py-2 text-[calc(11.5px*var(--ts))] font-medium ${
              o.state === "correct"
                ? "border-success-500/40 bg-success-50 text-success-700"
                : o.state === "wrong"
                  ? "border-danger-500/30 bg-danger-50 text-danger-700 line-through"
                  : "border-border bg-surface-muted text-ink-subtle"
            }`}
          >
            <span
              className={`grid size-5 place-items-center rounded-full border text-[calc(9px*var(--ts))] ${
                o.state === "correct"
                  ? "border-success-500 bg-success-500 text-white"
                  : o.state === "wrong"
                    ? "border-danger-500 text-danger-500"
                    : "border-border-strong text-ink-muted"
              }`}
            >
              {o.state === "correct" ? <Check className="size-3" /> : ""}
            </span>
            {o.label}
          </div>
        ))}
      </div>

      <div className="mt-3.5 flex items-center gap-2 rounded-md bg-surface-cream px-3 py-2.5 text-[calc(10.5px*var(--ts))] text-accent2-700">
        <Sparkles className="size-3.5 shrink-0" />
        إصلاح أوتوماتيك — إجابتك تعمّر بروفايل الذكاء الاصطناعي ومراجعاتك.
      </div>
    </div>
  )
}

interface Showcase {
  id: string
  kicker: string
  title: string
  desc: string
  bullets: string[]
  mock: ReactNode
}

const SHOWCASES: Showcase[] = [
  {
    id: "cours",
    kicker: "01 · دروس بالفيديو",
    title: "البرنامج الكل، بفيديو مؤمّن",
    desc: "كل درس مرتّب حسب المادّة والمستوى والفصل، ومعاه الموارد متاعو: نصوص وإصلاحات وبطاقات في PDF.",
    bullets: [
      "قارئ مؤمّن يرجّعك للبلاصة اللي وقفت فيها",
      "وثائق PDF مربوطة بكل فيديو",
      "التحميل كي يكون مسموح",
    ],
    mock: <VideoMock />,
  },
  {
    id: "live",
    kicker: "02 · حصص مباشرة",
    title: "حصص مباشرة مع أساتذتك",
    desc: "ادخل لحصص Zoom متاعك في وقتها، توصلك تذكيرة قبل كل درس، وتلقى التسجيلات الكل — حتّى متاع السنوات اللي فاتت.",
    bullets: [
      "روزنامة الحصص + تنبيهات تذكير",
      "تسجيلات أوتوماتيك، مرتّبة حسب العام",
      "الحضور ووقت المشاركة متابعين",
    ],
    mock: <LiveMock />,
  },
  {
    id: "quiz",
    kicker: "03 · كويزات وتقييمات",
    title: "كويزات تتصلّح في الحين",
    desc: "بعد كل فيديو، جرّب روحك: نتيجة في الحين، إصلاح مفصّل، تاريخ محاولاتك — وكل سؤال مربوط بالفيديو متاعو.",
    bullets: [
      "اختيار من متعدّد، صح/غالط وإجابات قصيرة",
      "النتيجة والإصلاح أوتوماتيك",
      "كل سؤال يوجّهك للفيديو اللي تعاودو",
    ],
    mock: <QuizMock />,
  },
]

function FeatureShowcases() {
  return (
    <section id="fonctionnalites" className="mx-auto w-full max-w-[1220px] scroll-mt-20 px-4 pt-24 sm:px-6">
      <Reveal className="mx-auto max-w-[620px] text-center">
        <Kicker>فضاء التلميذ</Kicker>
        <h2 className="mt-2 font-display text-[calc(26px*var(--ts))] font-bold text-ink sm:text-[calc(32px*var(--ts))]">
          كل اللي تحتاجو باش تنجح
        </h2>
        <p className="mt-3 text-[calc(14.5px*var(--ts))] leading-relaxed text-ink-subtle">
          المميّزات الأساسية متاع المنصّة، بالترتيب اللي باش تعيشو: تقرا، تشارك،
          تجرّب روحك — وتخلّي الذكاء الاصطناعي يوجّه مراجعاتك.
        </p>
      </Reveal>

      <div className="mt-14 flex flex-col gap-20">
        {SHOWCASES.map((f, i) => (
          <div key={f.id} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
            <Reveal className={i % 2 === 1 ? "lg:order-2" : ""}>
              <Kicker>{f.kicker}</Kicker>
              <h3 className="mt-2 font-display text-[calc(22px*var(--ts))] font-bold text-ink sm:text-[calc(26px*var(--ts))]">{f.title}</h3>
              <p className="mt-3 max-w-[460px] text-[calc(14.5px*var(--ts))] leading-relaxed text-ink-subtle">{f.desc}</p>
              <ul className="mt-5 flex flex-col gap-2.5">
                {f.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-[calc(13.5px*var(--ts))] text-ink">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success-50 text-success-600">
                      <Check className="size-3" />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={120} className={i % 2 === 1 ? "lg:order-1" : ""}>
              {f.mock}
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* AI section                                                          */
/* ------------------------------------------------------------------ */

/** Mock — the conversational AI assistant. */
function ChatMock() {
  return (
    <div aria-hidden className="pointer-events-none select-none rounded-lg border border-border bg-surface p-4 shadow-md">
      <div className="flex items-center gap-2.5 border-b border-border pb-3">
        <span className="grid size-8 place-items-center rounded-[9px] bg-grad text-ink-inverted shadow-brand">
          <Sparkles className="size-4" />
        </span>
        <span>
          <b className="block font-display text-[calc(12px*var(--ts))] font-bold text-ink">مساعد وائل</b>
          <span className="flex items-center gap-1 text-[calc(9.5px*var(--ts))] text-ink-muted">
            <span className="size-1.5 rounded-full bg-success-500" /> يعرف بروفايل كفاءاتك
          </span>
        </span>
      </div>

      <div className="mt-3.5 flex flex-col gap-2.5">
        <div className="ms-auto max-w-[80%] rounded-md rounded-ee-xs bg-grad px-3.5 py-2.5 text-[calc(11.5px*var(--ts))] text-ink-inverted">
          شنوّة نقاط ضعفي في الرياضيات؟
        </div>
        <div className="me-auto max-w-[88%] rounded-md rounded-es-xs bg-surface-muted px-3.5 py-2.5 text-[calc(11.5px*var(--ts))] leading-relaxed text-ink">
          إنت متحكّم مليح في <b className="text-success-600">النهايات</b> و{" "}
          <b className="text-success-600">الاتّصال</b> 💪. لازمك تقوّي: {" "}
          <b className="text-danger-600">التكامل بالتجزئة</b> — 3 غلطات في آخر زوز كويزات.
          زدتلك 2 فيديوهات في روزنامة المراجعة متاع الخميس.
        </div>
        <div className="me-auto flex max-w-[88%] flex-wrap gap-1.5">
          {["عاود الدرس 4", "عاود السلسلة عدد 6", "خطّة مراجعة"].map((c) => (
            <span key={c} className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-[calc(10px*var(--ts))] font-medium text-brand-700">
              {c}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-surface-muted p-[5px_5px_5px_14px]">
        <span className="flex-1 text-[calc(11px*var(--ts))] text-ink-muted">اسأل سؤالك…</span>
        <span className="grid size-7 place-items-center rounded-[8px] bg-grad text-ink-inverted">
          <ArrowLeft className="size-3.5" />
        </span>
      </div>
    </div>
  )
}

function AiSection() {
  const cards = [
    {
      icon: Camera,
      title: "مصلّح التمارين بالتصويرة",
      desc: "صوّر التمرين اللي حلّيتو: الذكاء الاصطناعي يلقى غلطاتك، يشرحهملك، ويقترح عليك مقاطع الفيديو اللي تعاودها.",
    },
    {
      icon: Brain,
      title: "بروفايل الكفاءات",
      desc: "كل كويز وكل تمرين يعمّر بروفايلك: نقاط قوّتك ونقاط ضعفك، متابعين مع الوقت.",
    },
    {
      icon: CalendarClock,
      title: "روزنامة مراجعة ذكية",
      desc: "كل نهار، المنصّة تقترح عليك شنوّة تراجع بالأولوية — مباشرة في روزنامتك.",
    },
  ]
  return (
    <section id="ia" className="mx-auto w-full max-w-[1220px] scroll-mt-20 px-4 pt-24 sm:px-6">
      <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
        <div>
          <Reveal>
            <Kicker>04 · الذكاء الاصطناعي</Kicker>
            <h2 className="mt-2 font-display text-[calc(26px*var(--ts))] font-bold text-ink sm:text-[calc(32px*var(--ts))]">
              ذكاء اصطناعي يراجع معاك
            </h2>
            <p className="mt-3 max-w-[520px] text-[calc(14.5px*var(--ts))] leading-relaxed text-ink-subtle">
              موش لعبة: كوتش حقيقي. الذكاء الاصطناعي يتّبع إجاباتك، يبني بروفايلك، يصلّح
              تمارينك بالتصويرة وينظّملك مراجعاتك.
            </p>
          </Reveal>
          <div className="mt-7 flex flex-col gap-3.5">
            {cards.map((c, i) => (
              <Reveal key={c.title} delay={i * 90}>
                <div className="group flex items-start gap-4 rounded-lg border border-border bg-surface p-[18px] shadow-sm transition hover:border-brand-200 hover:shadow-md motion-safe:hover:-translate-y-0.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-md bg-accent2-50 text-accent2-500 transition group-hover:bg-grad group-hover:text-ink-inverted">
                    <c.icon className="size-5" />
                  </span>
                  <span>
                    <b className="block font-display text-[calc(14.5px*var(--ts))] font-bold text-ink">{c.title}</b>
                    <span className="mt-1 block text-[calc(13px*var(--ts))] leading-relaxed text-ink-subtle">{c.desc}</span>
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={150}>
          <ChatMock />
        </Reveal>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* "وزادة" grid                                                     */
/* ------------------------------------------------------------------ */

function MoreGrid() {
  const items = [
    { icon: TrendingUp, title: "متابعة التقدّم", desc: "فيديوهات تشافت، كويزات تعملت، وقت المراجعة والحضور في الحصص." },
    { icon: Users, title: "منتدى وفضاءات الأساتذة", desc: "تحدّث مع أساتذتك وصحابك واكتشف محتوياتهم." },
    { icon: Search, title: "بحث وفلاتر", desc: "لوّج على محتوى حسب المادّة ولا المستوى ولا الفصل ولا الأستاذ." },
    { icon: Heart, title: "مفضّلات «باش نعاودها»", desc: "خلّي تحت يدّك الفيديوهات والتمارين اللي تحبّ تعاودهم." },
    { icon: Languages, title: "الفرنسية والعربية", desc: "واجهة كاملة بالزوز لغات، مع تبديل RTL." },
    { icon: LifeBuoy, title: "مساعدة مباشرة", desc: "زرّ شات مساعدة، ديما في أسفل الشاشة." },
  ]
  return (
    <section className="mx-auto w-full max-w-[1220px] px-4 pt-24 sm:px-6">
      <Reveal className="mx-auto max-w-[560px] text-center">
        <Kicker>وزادة</Kicker>
        <h2 className="mt-2 font-display text-[calc(24px*var(--ts))] font-bold text-ink sm:text-[calc(28px*var(--ts))]">
          التفاصيل الصغيرة اللي تبدّل الكل
        </h2>
      </Reveal>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, i) => (
          <Reveal key={it.title} delay={(i % 3) * 90}>
            <div className="h-full rounded-lg border border-border bg-surface p-[18px] shadow-sm transition hover:border-brand-200 hover:shadow-md motion-safe:hover:-translate-y-0.5">
              <span className="grid size-9 place-items-center rounded-[9px] bg-brand-50 text-brand-600">
                <it.icon className="size-4.5" />
              </span>
              <b className="mt-3.5 block font-display text-[calc(14px*var(--ts))] font-bold text-ink">{it.title}</b>
              <span className="mt-1 block text-[calc(12.5px*var(--ts))] leading-relaxed text-ink-subtle">{it.desc}</span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Offers + referral                                                   */
/* ------------------------------------------------------------------ */

function Pricing() {
  const plans = [
    {
      name: "Bronze",
      price: "39",
      desc: "باش تكتشف المنصّة.",
      features: ["فيديوهات مادّة على اختيارك", "كويزات تتصلّح وحدها", "منتدى التلامذة"],
      featured: false,
    },
    {
      name: "Silver",
      price: "59",
      desc: "خيار أغلب التلامذة.",
      features: [
        "الموادّ الكل بالفيديو",
        "حصص مباشرة + تسجيلات العام",
        "الذكاء الاصطناعي: كويز، بروفايل ومساعد",
        "وثائق PDF مربوطة",
      ],
      featured: true,
    },
    {
      name: "Gold",
      price: "89",
      desc: "التجربة الكاملة، بلا حدود.",
      features: [
        "كل Silver، وزيد:",
        "تسجيلات السنوات اللي فاتت",
        "مصلّح بالتصويرة بلا حدّ",
        "روزنامة مراجعة ذكية",
      ],
      featured: false,
    },
  ]
  return (
    <section id="offres" className="mx-auto w-full max-w-[1220px] scroll-mt-20 px-4 pt-24 sm:px-6">
      <Reveal className="mx-auto max-w-[560px] text-center">
        <Kicker>العروض</Kicker>
        <h2 className="mt-2 font-display text-[calc(26px*var(--ts))] font-bold text-ink sm:text-[calc(32px*var(--ts))]">
          عرض لكل طموح
        </h2>
        <p className="mt-3 text-[calc(14.5px*var(--ts))] text-ink-subtle">
          خلاص مؤمّن أونلاين عبر <b className="text-ink">ClicToPay</b>، بالدينار التونسي.
          الفواتير وتاريخ الشراءات داخلين.
        </p>
      </Reveal>

      <div className="mt-10 grid items-stretch gap-4 md:grid-cols-3">
        {plans.map((p, i) => (
          <Reveal key={p.name} delay={i * 100} className="h-full">
            <div
              className={`relative flex h-full flex-col rounded-lg border bg-surface p-6 transition motion-safe:hover:-translate-y-0.5 ${
                p.featured
                  ? "border-brand-300 shadow-lg ring-4 ring-brand-500/10"
                  : "border-border shadow-sm hover:shadow-md"
              }`}
            >
              {p.featured && (
                <span className="absolute -top-3 start-6 rounded-full bg-grad px-3 py-1 font-display text-[calc(10px*var(--ts))] font-bold uppercase tracking-[.1em] text-ink-inverted shadow-brand">
                  Populaire
                </span>
              )}
              <b className="font-display text-[calc(16px*var(--ts))] font-bold text-ink">{p.name}</b>
              <p className="mt-0.5 text-[calc(12px*var(--ts))] text-ink-muted">{p.desc}</p>
              <p className="mt-4">
                <span className="font-display text-[calc(34px*var(--ts))] font-bold text-ink">{p.price}</span>
                <span className="ms-1 text-[calc(13px*var(--ts))] text-ink-muted">د.ت / شهر</span>
              </p>
              <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[calc(13px*var(--ts))] text-ink-subtle">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-success-600" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                to="/roles"
                className={`mt-6 inline-flex h-11 items-center justify-center rounded-md font-medium transition ${
                  p.featured
                    ? "bg-grad text-ink-inverted shadow-brand hover:brightness-105"
                    : "border border-border-strong bg-surface text-ink-subtle hover:border-brand-200 hover:text-brand-600"
                }`}
              >
                اختار {p.name}
              </Link>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={120}>
        <div className="mt-6 flex flex-col items-start gap-4 rounded-lg border border-accent2-100 bg-surface-cream p-6 sm:flex-row sm:items-center">
          <span className="grid size-11 shrink-0 place-items-center rounded-md bg-accent2-100 text-accent2-600">
            <Gift className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <b className="font-display text-[calc(15px*var(--ts))] font-bold text-ink">ادعُ صحابك واربح نقاط</b>
            <p className="mt-0.5 text-[calc(13px*var(--ts))] text-accent2-700">
              كود الدعوة متاعك يعطي تخفيض لصحابك — ويجيبلك نقاط تبدّلها
              بامتيازات.
            </p>
          </div>
          <span className="flex items-center gap-2 rounded-md border border-dashed border-accent2-500/50 bg-surface px-3.5 py-2 font-display text-[calc(13px*var(--ts))] font-bold tracking-wide text-accent2-600">
            YASMINE-2026
          </span>
        </div>
      </Reveal>

      <Reveal delay={180}>
        <p className="mt-4 flex items-center justify-center gap-2 text-center text-[calc(12px*var(--ts))] text-ink-muted">
          <CreditCard className="size-3.5" /> أكواد التخفيض مقبولة وقت الشراء · التصرّف في
          الاسترجاعات من الأكاديمية
        </p>
      </Reveal>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Final CTA + footer                                                  */
/* ------------------------------------------------------------------ */

function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-[1220px] px-4 pt-24 sm:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-10 text-center shadow-xl sm:p-14">
          {/* faint dotted texture, masked to the corner */}
          <span className="pointer-events-none absolute inset-y-0 end-0 w-[220px] opacity-60 [background:radial-gradient(var(--brand-100)_1.2px,transparent_1.2px)] [background-size:12px_12px] [mask-image:linear-gradient(270deg,#000,transparent_80%)]" />
          <span className="pointer-events-none absolute inset-y-0 start-0 w-[220px] opacity-60 [background:radial-gradient(var(--accent-100)_1.2px,transparent_1.2px)] [background-size:12px_12px] [mask-image:linear-gradient(90deg,#000,transparent_80%)]" />
          <Kicker>حاضر تبدا؟</Kicker>
          <h2 className="mx-auto mt-2 max-w-[540px] font-display text-[calc(26px*var(--ts))] font-bold text-ink sm:text-[calc(32px*var(--ts))]">
            انضمّ لوائل أكاديمي وحضّر عامك بكل ارتياح
          </h2>
          <p className="mx-auto mt-3 max-w-[460px] text-[calc(14.5px*var(--ts))] text-ink-subtle">
            اكتشف الديمو: فضاء التلميذ والحصص المباشرة والكويزات ومساعد الذكاء الاصطناعي يستنّاو فيك.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/student"
              className="inline-flex h-12 items-center gap-2 rounded-md bg-grad px-6 font-medium text-ink-inverted shadow-brand transition hover:-translate-y-0.5 hover:brightness-105"
            >
              جرّب فضاء التلميذ <ArrowLeft className="size-4" />
            </Link>
            <Link
              to="/roles"
              className="inline-flex h-12 items-center rounded-md border border-border-strong bg-surface px-5 font-medium text-ink-subtle transition hover:border-brand-200 hover:text-brand-600"
            >
              اختار فضاء آخر
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  )
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface/60">
      <div className="mx-auto flex w-full max-w-[1220px] flex-col items-center gap-4 px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))] text-center sm:flex-row sm:justify-between sm:text-start">
        <div className="flex items-center gap-2.5">
          <BrandMark size="size-8" />
          <span className="text-[calc(13px*var(--ts))] font-medium text-ink">
            Wael Academy <span className="text-ink-muted">· أكاديمية وائل</span>
          </span>
        </div>
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[calc(12.5px*var(--ts))] text-ink-muted">
          <a href="#fonctionnalites" className="transition hover:text-brand-600">المميّزات</a>
          <a href="#ia" className="transition hover:text-brand-600">IA</a>
          <a href="#offres" className="transition hover:text-brand-600">العروض</a>
          <Link to="/roles" className="transition hover:text-brand-600">المسافات</Link>
          <Link to="/design-system" className="transition hover:text-brand-600">نظام التصميم</Link>
        </nav>
        <p className="text-[calc(12px*var(--ts))] text-ink-muted">© 2026 وائل أكاديمي · تونس</p>
      </div>
    </footer>
  )
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

/** Public landing ("/") — the student-facing pitch for the platform. */
export default function LandingPage() {
  return (
    <div className="lp-root min-h-dvh bg-canvas">
      <Navbar />
      <main>
        <Hero />
        <StatsStrip />
        <FeatureShowcases />
        <AiSection />
        <MoreGrid />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </div>
  )
}
