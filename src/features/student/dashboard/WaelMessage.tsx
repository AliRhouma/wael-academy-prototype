import { CreamPanel, cream } from "@/components/kit/CreamPanel"
import { WaelEmblem } from "@/components/icons/WaelLogo"
import { dateKey } from "@/features/student/calendar/schedule"

/**
 * Section 1 — « رسالة وائل ليك »: the word from the academy's owner, one a day.
 *
 * It is the panel with the speech tail (see `CreamPanel`), and the tail points
 * at the character standing beside it — so the section reads as Wael talking to
 * this élève rather than as a notice board. That is the whole reason it sits
 * top-of-page: it is the one thing here addressed to the élève by a person.
 *
 * The messages are a fixed rotation rather than store rows. Nothing in the
 * prototype writes them — no admin screen sends a message of the day — and a
 * store entity nobody mutates is a table pretending to be a feature. Picked by
 * date so it is stable through a session and turns over at midnight; when the
 * admin side grows a "message of the day" composer, this becomes a store read
 * and nothing else changes.
 */
const MESSAGES = [
  "الصباح رَبح. ابدا بالحاجة الصعيبة كي مُخّك مازال طازج — الباقي يولّي ساهل.",
  "ما تقارنش روحك بالآخرين، قارن روحك بيك تاع الجمعة اللي فاتت. تڤدّمت؟ برافو.",
  "ساعة تركيز بلا تليفون تسوى ثلاثة ساعات وانت تشوف فيه. جرّب اليوم.",
  "الغلطة في تمرين اليوم خير من الغلطة في الباك. حلّ، غالط، وافهم علاش.",
  "ما فهمتش الدرس؟ عادي. أرجع للفيديو مرّة أخرى وحبس عند البلاصة اللي ضاعت فيها.",
  "الراحة جزء من القراية. نام بكري الليلة، غدوة عندك نهار كبير.",
  "كل تمرين تحلّه اليوم هو سؤال أقلّ تخاف منه في الامتحان.",
]

/** The same message all day, a new one tomorrow — no randomness to re-roll. */
function messageFor(now: Date): string {
  const days = Math.floor(new Date(now).setHours(0, 0, 0, 0) / 86_400_000)
  return MESSAGES[((days % MESSAGES.length) + MESSAGES.length) % MESSAGES.length]
}

export function WaelMessage({ now }: { now: Date }) {
  const today = new Date(`${dateKey(now)}T00:00:00`).toLocaleDateString("ar-TN-u-nu-latn", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  return (
    <CreamPanel tail={0.42} className="min-h-[11rem]" bodyClassName="gap-2.5 p-4 md:p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-[13px] bg-grad text-white shadow-brand">
          <WaelEmblem className="w-[22px]" />
        </span>
        <div className="min-w-0">
          <h2
            className="font-display text-[calc(17px*var(--ts))] font-bold leading-tight"
            style={{ color: cream.ink }}
          >
            رسالة وائل ليك
          </h2>
          <p className="truncate text-[calc(12px*var(--ts))]" style={{ color: cream.inkMuted }}>
            {today}
          </p>
        </div>
      </div>

      {/* The message is the section. It gets display type and room to breathe —
          anything smaller and it reads as a caption on the header above it. */}
      <p
        dir="auto"
        className="font-display text-[calc(16px*var(--ts))] font-semibold leading-[1.7] md:text-[calc(17.5px*var(--ts))]"
        style={{ color: cream.ink }}
      >
        {messageFor(now)}
      </p>

      <p className="mt-auto text-[calc(12.5px*var(--ts))] font-medium" style={{ color: cream.inkMuted }}>
        — وائل
      </p>
    </CreamPanel>
  )
}
