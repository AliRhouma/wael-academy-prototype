import { useEffect, useState } from "react"
import { Link, NavLink, Outlet, useLocation } from "react-router-dom"
import { Mail, Menu, Phone } from "lucide-react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { useToast } from "@/components/kit/Toast"
import { cn } from "@/lib/utils"
import lockup from "@/assets/v2/logo-lockup.png"
import { NAV } from "./content"
import { Facebook, Instagram, TikTok, btnLime, btnOutline, container } from "./parts"

/** Where the site's two calls to action lead in the prototype. */
export const SIGN_UP = "/inscription"
export const SIGN_IN = "/connexion"
/** The offers, as the élève space shows them — where every « اختر الآن » lands. */
export const OFFERS = "/student-v2/offres"

function Logo({ tone = "ink", className }: { tone?: "ink" | "white"; className?: string }) {
  return (
    <span
      role="img"
      aria-label="Wael Academy"
      className={cn("block h-[4.25rem] w-[6.4rem] md:h-[5.75rem] md:w-[8.6rem]", tone === "ink" ? "bg-v2-ink" : "bg-white", className)}
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
  )
}

/**
 * The public site — « Page D'acceuil » and « About us Page ». One header and
 * one footer, the pages in between.
 *
 * The header floats: transparent over the hero's mint (as drawn), and it
 * takes a frosted white ground once the page moves, so the links stay
 * readable over whatever section passes under them.
 */
export default function SiteLayout() {
  const { pathname, hash } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)

  useEffect(() => {
    document.documentElement.setAttribute("dir", "rtl")
    document.documentElement.setAttribute("lang", "ar-TN")
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // `/#offres` lands ON the section, under the fixed header; a new page
  // starts at its top.
  useEffect(() => {
    setMenu(false)
    if (hash) {
      const t = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" }), 60)
      return () => window.clearTimeout(t)
    }
    window.scrollTo({ top: 0 })
  }, [pathname, hash])

  const isActive = (to: string) => (to.startsWith("/#") ? pathname === "/" && hash === to.slice(1) : pathname === to)

  return (
    <div className="min-h-dvh bg-white text-v2-ink">
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 pt-safe transition-[background-color,box-shadow,backdrop-filter] duration-300",
          scrolled ? "bg-white/85 shadow-[0_1px_0_rgb(23_46_91/0.08)] backdrop-blur-xl" : "bg-transparent",
        )}
      >
        <div className={cn(container, "flex items-center gap-6 transition-[padding] duration-300", scrolled ? "py-2" : "py-4 md:py-8")}>
          <Link to="/" className="shrink-0 rounded-lg focus-visible:outline-2 focus-visible:outline-v2-brand">
            <Logo className={cn("transition-[height,width] duration-300", scrolled && "md:h-[4.25rem] md:w-[6.4rem]")} />
          </Link>

          <nav aria-label="القائمة" className="hidden flex-1 items-center justify-center gap-8 lg:flex xl:gap-14">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "relative py-2 text-[calc(11px*var(--ts))] font-medium transition hover:text-v2-brand xl:text-[calc(12.5px*var(--ts))]",
                  isActive(item.to) ? "font-bold text-v2-brand" : "text-v2-ink",
                )}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ms-auto hidden items-center gap-3 lg:flex">
            <Link to={SIGN_UP} className={cn(btnOutline, "md:min-h-[3.25rem]")}>
              سجل بلاش
            </Link>
            <Link to={SIGN_IN} className={cn(btnLime, "md:min-h-[3.25rem]")}>
              تسجيل دخول
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenu(true)}
            aria-label="القائمة"
            className="ms-auto grid size-12 place-items-center rounded-xl border border-v2-ink/15 bg-white/70 lg:hidden"
          >
            <Menu className="size-6" />
          </button>
        </div>
      </header>

      <Sheet open={menu} onOpenChange={setMenu}>
        <SheetContent side="right" className="w-[min(20rem,85vw)] gap-0 bg-white p-6 text-v2-ink">
          <SheetTitle className="sr-only">القائمة</SheetTitle>
          <Logo className="mb-8 mt-2" />
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-h-12 items-center rounded-xl px-3 text-[calc(11px*var(--ts))] font-medium transition hover:bg-v2-brand/[0.07]",
                  isActive(item.to) && "font-bold text-v2-brand",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 flex flex-col gap-3">
            <Link to={SIGN_IN} className={btnLime}>
              تسجيل دخول
            </Link>
            <Link to={SIGN_UP} className={btnOutline}>
              سجل بلاش
            </Link>
          </div>
        </SheetContent>
      </Sheet>

      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

function Footer() {
  const { toast, show } = useToast()
  const social = [
    { label: "TikTok", icon: TikTok },
    { label: "Facebook", icon: Facebook },
    { label: "Instagram", icon: Instagram },
  ]
  return (
    <footer className="bg-v2-footer text-white">
      <div className={cn(container, "flex flex-col items-center gap-8 py-14 text-center md:py-16")}>
        <Link to="/" aria-label="Wael Academy">
          <Logo tone="white" />
        </Link>
        <nav className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} className="text-[calc(12px*var(--ts))] font-light text-white/90 transition hover:text-v2-cta">
              {item.label}
            </Link>
          ))}
        </nav>
        <p className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[calc(10px*var(--ts))] font-light">
          <a href="tel:+21650404343" className="inline-flex items-center gap-2 transition hover:text-v2-cta" dir="ltr">
            <Phone className="size-4" /> +216 50 40 43
          </a>
          <span aria-hidden className="text-white/50">|</span>
          <a href="mailto:contact@waelacademy.com" className="inline-flex items-center gap-2 transition hover:text-v2-cta" dir="ltr">
            <Mail className="size-4" /> contact@waelacademy.com
          </a>
        </p>
        <div className="flex items-center gap-4">
          {social.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              aria-label={label}
              onClick={() => show(`${label} — رابط تجريبي في النموذج`)}
              className="grid size-14 place-items-center rounded-full bg-white/20 transition hover:bg-v2-cta hover:text-v2-on-cta"
            >
              <Icon className="size-6" />
            </button>
          ))}
        </div>
      </div>
      <div className="border-t border-white/15">
        <p className={cn(container, "py-7 text-center text-[calc(9px*var(--ts))] font-light text-white/90")}>
          © 2026 وائل أكاديمي. جميع الحقوق محفوظة. شروط الاستخدام | سياسة الخصوصية.
        </p>
      </div>
      {toast}
    </footer>
  )
}
