import { useAuth } from "@/stores/useAuth"

/**
 * The dashboard's top line — a gold kicker, and the élève by name.
 *
 * The page used to open cold, straight into the grid of panels: five plates and
 * no floor under them. A header is what tells you whose screen this is before
 * you read a single number, and it gives the row of panels a top edge to hang
 * from.
 *
 * NO DATE HERE, deliberately: وائل's message already carries the long date
 * under its title, two panels down and 40px away, and the same Thursday printed
 * twice in one eyeful is how a page starts looking generated. The kicker says
 * where you are instead — which is what the system spends its gold on.
 *
 * A gold « kèmmelt heṣṣ el-yûm » seal used to sit at the end of this line on a
 * day with every séance attended. It is gone: the report panel one row down
 * already counts the day's séances done out of total, so the seal was the same
 * fact a second time, and it put a congratulation above the fold on a page whose
 * job is to say what is LEFT to do.
 *
 * Referenced for type scale & density: the kit's PageHeader (display title over
 * a muted line), WaelMessage (panel title row).
 */
function greetingFor(now: Date): string {
  const h = now.getHours()
  if (h < 12) return "صباح الخير"
  if (h < 17) return "نهارك زين"
  return "مسا الخير"
}

export function DayHeader({ now }: { now: Date }) {
  const currentUser = useAuth((s) => s.currentUser)
  const firstName = currentUser?.name?.trim().split(/\s+/)[0] ?? ""

  return (
    <header className="min-w-0">
      <p
        className="font-display text-[calc(11.5px*var(--ts))] font-bold leading-none tracking-[.14em]"
        style={{ color: "var(--accent-500)" }}
      >
        لوحة القيادة
      </p>
      <h1
        dir="auto"
        className="mt-1.5 font-display text-[calc(23px*var(--ts))] font-bold leading-tight text-ink md:text-[calc(26px*var(--ts))]"
      >
        {firstName ? `${greetingFor(now)}، ${firstName}` : greetingFor(now)}
      </h1>
    </header>
  )
}
