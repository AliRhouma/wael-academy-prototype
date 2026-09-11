import { useEffect, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { mountSound } from "@/features/student-v2/sound"
import lockup from "@/assets/v2/logo-lockup.png"
import fx from "../../../svg icons/doodles/auth-fx.svg"
import globe from "../../../svg icons/doodles/auth-globe.svg"
import ruler from "../../../svg icons/doodles/auth-ruler.svg"
import book from "../../../svg icons/doodles/auth-book.svg"

/**
 * « Log In » — the Figma frame every auth screen is cut from.
 *
 * Its geometry, read off the 1440 × 1425 export and kept as RATIOS at half the
 * drawn scale — the artboard is zoomed (a 1200-wide card, 84px boxes, a 68px
 * title), so reproduced literally it comes out twice the size of every other
 * surface here. Halved, the frame's proportions survive and the page reads at
 * 100 %:
 *   ground   white under the teal → lime ramp at 20 %, i.e. the landing's mint,
 *            same 80px graph paper (`bg-v2-mint-grid`)
 *   chrome   the back chip at x 120, the lockup at x 1178 — one 1200 column,
 *            the same one the card and the site's `container` use
 *   card     1200 × 1052 → 600 wide, 16px corners, white, flat, centred
   chrome   the header keeps the site's own 1200 column and its lockup, so the
            door and the landing wear the same hat
 *   doodles  four line drawings at ink 10 %, one per corner, framing the card
 *
 * The three screens differ only by what goes inside the card.
 */

/** A corner drawing. Painted through a mask so the ink comes from the token. */
function Doodle({ src, className, style }: { src: string; className?: string; style?: React.CSSProperties }) {
  return (
    <span
      aria-hidden
      className={cn("pointer-events-none absolute bg-v2-ink/10", className)}
      style={{
        ...style,
        maskImage: `url("${src}")`,
        WebkitMaskImage: `url("${src}")`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}
    />
  )
}

export function AuthFrame({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl")
    document.documentElement.setAttribute("lang", "ar-TN")
  }, [])

  // The élève space's sound, already here at the door: the `data-uisfx`
  // binding lives on the document, so these screens have to mount it too.
  useEffect(() => mountSound(), [])

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-v2-mint-grid">
      {/* The four corner drawings, at the frame's own positions as percentages
          of the 1440 × 1425 canvas. Too tight to read on a phone — they start
          at md, and the two that sit closest to the card wait for lg. */}
      <Doodle src={fx} className="hidden md:block" style={{ left: "3.5%", top: "15%", width: "7.6%", aspectRatio: "110 / 186" }} />
      <Doodle src={globe} className="hidden lg:block" style={{ right: "2%", top: "29%", width: "9.7%", aspectRatio: "139 / 238" }} />
      <Doodle src={ruler} className="hidden lg:block" style={{ left: "2.8%", bottom: "6%", width: "9.9%", aspectRatio: "143 / 174" }} />
      <Doodle src={book} className="hidden md:block" style={{ right: "2.8%", bottom: "-1.5%", width: "15%", aspectRatio: "216 / 258" }} />

      <div className="relative mx-auto flex w-full max-w-[75rem] flex-1 flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4">
          {/* Logo first, so RTL puts it on the right and the back link on the
              left — the frame's own arrangement. */}
          <Link
            to="/"
            data-uisfx="back"
            aria-label="Wael Academy — الصفحة الرئيسية"
            className="block h-[3.25rem] w-[5rem] shrink-0 bg-v2-ink transition hover:opacity-80 md:h-[4.25rem] md:w-[6.4rem]"
            style={{
              maskImage: `url(${lockup})`,
              WebkitMaskImage: `url(${lockup})`,
              maskSize: "contain",
              WebkitMaskSize: "contain",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              maskPosition: "center",
              WebkitMaskPosition: "center",
            }}
          />
          <Link
            to="/"
            data-uisfx="back"
            className="group inline-flex items-center gap-2.5 text-[calc(10px*var(--ts))] font-semibold text-v2-ink transition hover:text-v2-brand md:text-[calc(10.5px*var(--ts))]"
          >
            <span className="hidden sm:inline">الرجوع إلى الصفحة الرئيسية</span>
            <span className="sm:hidden">الرئيسية</span>
            <span className="grid size-8 shrink-0 place-items-center rounded-full border border-v2-ink/60 transition group-hover:border-v2-brand group-hover:bg-v2-brand group-hover:text-white md:size-9">
              <ChevronLeft className="size-4" strokeWidth={2} />
            </span>
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center py-6 md:py-10">
          <div className="w-full max-w-[37.5rem] rounded-2xl bg-v2-surface px-5 py-8 shadow-[0_18px_50px_-34px_rgb(23_46_91/0.45)] sm:px-[26px] md:py-[54px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

/**
 * The card's head — « مرحبا بيك في أكاديمية وائل » in the brand ramp, the
 * screen's name under it in navy. 43px / 68px in the frame.
 */
export function AuthHead({ title, kicker = "مرحبا بيك في أكاديمية وائل", note }: { title: string; kicker?: string; note?: ReactNode }) {
  return (
    <div className="text-center">
      <p className="text-v2-grad text-[calc(12px*var(--ts))] font-bold md:text-[calc(14.5px*var(--ts))]">
        {kicker}
      </p>
      <h1 className="mt-1.5 text-[calc(19px*var(--ts))] font-extrabold leading-tight text-v2-ink md:mt-[13px] md:text-[calc(22.5px*var(--ts))]">
        {title}
      </h1>
      {note && (
        <p className="mx-auto mt-2.5 max-w-[46ch] text-[calc(9px*var(--ts))] leading-relaxed text-v2-ink/60 md:text-[calc(10px*var(--ts))]">
          {note}
        </p>
      )}
    </div>
  )
}
