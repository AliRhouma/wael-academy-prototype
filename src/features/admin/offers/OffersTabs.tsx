import { NavLink } from "react-router-dom"
import { KeyRound, Tag, TicketPercent } from "lucide-react"

/**
 * Segmented sub-navigation of the Offres section — the offers list and the
 * reusable access rules are two routes under one nav entry. Route-driven (not
 * local tab state) so each view keeps its own URL.
 */
export function OffersTabs() {
  const base =
    "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition"
  const active = "border-transparent bg-brand-600 text-ink-inverted"
  const idle =
    "border-border-strong bg-surface text-ink-subtle hover:border-brand-200 hover:text-brand-600"
  return (
    <div className="flex gap-2">
      <NavLink to="/admin/offers" end className={({ isActive }) => `${base} ${isActive ? active : idle}`}>
        <Tag className="size-4" /> Offres
      </NavLink>
      <NavLink
        to="/admin/offers/access"
        end
        className={({ isActive }) => `${base} ${isActive ? active : idle}`}
      >
        <KeyRound className="size-4" /> Accès
      </NavLink>
      <NavLink
        to="/admin/offers/promos"
        end
        className={({ isActive }) => `${base} ${isActive ? active : idle}`}
      >
        <TicketPercent className="size-4" /> Codes promo
      </NavLink>
    </div>
  )
}
