import { useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { ChevronRight, FileText, Library, PlayCircle, Timer } from "lucide-react"
import { SubjectIcon } from "@/components/icons/subjects"
import { cn } from "@/lib/utils"
import { useDownloads } from "../downloads"
import { BASE, dropDay } from "../lib"
import { PanelEmpty, tileClass, useShake } from "../ui"
import { Chip, Disc, FilesSheet, ItemDisc, Ribbon, fileId } from "./parts"
import {
  FAMILIES,
  chapterMeta,
  familyCount,
  familyOf,
  kindOf,
  useSubjectBundle,
  type ChapterBundle,
  type ChapterItem,
  type KindFamily,
} from "./matieres"

/**
 * « موادي » — one matière, the frame « Main Pgae - Calendar months (7) ».
 *
 * The page is the chapitre list and NOTHING else: a numbered card each, shut
 * by default, and the one you open swells into a tinted panel carrying its own
 * filter chips and its contenus.
 *
 * It used to open on three head tabs — parcours · الدروس · examens — with the
 * chapitres on the middle one. Two of the three were empty in almost every
 * matière, so the page greeted the élève with a choice between one real list
 * and two empty ones. The chapitres ARE the matière; they no longer have to be
 * selected. (The parcours and the examens still exist in the store and in the
 * old space — nothing was deleted, only this page stopped asking.)
 *
 * Two things the frame decides and the code keeps:
 *   — a chapitre with nothing published is NOT a disabled row; it keeps its
 *     card and wears « قريباً » in the corner. Most of the curriculum is in
 *     that state, and pretending otherwise would make the page a lie.
 *   — the corner flag and the numbered disc are physical-left and
 *     reading-start respectively; the frame draws them that way in RTL.
 *
 * What the frame got wrong and this does not: it painted the open chapitre
 * with the brand ramp at 25 % and every corner flag with the same ramp at
 * full — over a page that is already that ramp at 10 %. Everything came out
 * the one dim colour, and nothing in the list looked more important than
 * anything else. The page now has THREE registers, told apart across a room:
 *   — the chapitre you have open is a solid deep panel, white contenus on it;
 *   — a chapitre you can open is a white card, crisp, brand-numbered;
 *   — a chapitre that is « soon » recedes: flat tint, no colour, no shout.
 * And a flag's colour now carries the KIND (teal cours · navy exercice ·
 * petrol série · violet résumé · lime quiz) instead of repeating the brand.
 *
 * Under the play skin the list is a LADDER: a rail links the discs, a shut
 * chapitre is a tile you can press, a locked one shakes, the open one sits on
 * a deep lip, and each contenu tile wears its kind in its border and lip.
 * The states are read off the data that exists — there is no completion
 * record, so the only « done » is the session's own downloads (see `Disc`).
 *
 * Referenced for density: SubjectRecordingsScreen (trimester accordion, locked
 * rows) and DocsPanel (file rows); for card weight, SubjectsScreen — its
 * matière cards are `border-v2-ink/15`, and this page was the only surface in
 * the space outlining everything at /50.
 */
export default function V2SubjectScreen() {
  const { subjectId } = useParams()
  const { subject, chapters } = useSubjectBundle(subjectId)

  if (!subject) {
    return (
      <PanelEmpty
        icon={Library}
        title="المادة ما تلقاتش"
        body="يمكن تبدّلت. أرجع للدروس واختار وحدة أخرى."
        action={
          <Link to={`${BASE}/matieres`} data-uisfx="back" className="font-semibold text-v2-brand hover:underline">
            الدروس
          </Link>
        }
      />
    )
  }

  return (
    <div className="flex flex-col gap-5 md:gap-7 2xl:gap-9">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
        <div className="flex min-w-0 items-center gap-3 md:gap-4 2xl:gap-6">
          <span className="grid size-16 shrink-0 place-items-center md:size-20 2xl:size-[138px]">
            <SubjectIcon name={subject.name} className="size-full" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-[calc(17px*var(--ts))] font-extrabold leading-tight text-v2-ink md:text-[calc(22px*var(--ts))] 2xl:text-[calc(27px*var(--ts))]">
              {subject.name}
            </h1>
          </div>
        </div>

      </header>

      <ChapterList chapters={chapters} subjectName={subject.name} />
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * الدروس — the chapitres
 * ------------------------------------------------------------------ */

function ChapterList({ chapters, subjectName }: { chapters: ChapterBundle[]; subjectName: string }) {
  // The frame opens on the first chapitre that actually has something in it —
  // arriving on a matière, an élève wants to be shown where the content starts.
  const first = useMemo(() => chapters.find((c) => !c.empty)?.chapter.id ?? null, [chapters])
  const [open, setOpen] = useState<string | null>(first)

  if (chapters.length === 0) {
    return (
      <PanelEmpty
        icon={Library}
        character={subjectName}
        title="محتوى المادة يهبط قريب"
        body={`دروس المادة هاذي يهبطو غدوة ولا بعد غدوة — ${dropDay(new Date(), true)}. كي يوصلو، تلقاهم هوني مرتّبين بالمحاور.`}
      />
    )
  }

  return (
    <ul className="v2-ladder flex flex-col gap-4 2xl:gap-8">
      {chapters.map((b, i) => {
        const isOpen = open === b.chapter.id
        return (
          <li
            key={b.chapter.id}
            className="v2-ladder-step rise"
            data-state={b.empty ? "locked" : isOpen ? "current" : "open"}
            style={{ ["--i" as string]: Math.min(i, 12) }}
          >
            <ChapterCard
              bundle={b}
              n={i + 1}
              open={isOpen}
              onToggle={() => setOpen((cur) => (cur === b.chapter.id ? null : b.chapter.id))}
            />
          </li>
        )
      })}
    </ul>
  )
}

function ChapterCard({
  bundle,
  n,
  open,
  onToggle,
}: {
  bundle: ChapterBundle
  n: number
  open: boolean
  onToggle: () => void
}) {
  const { chapter, items, byKind, empty } = bundle
  // The first family that has something, so opening never lands on an empty list.
  const [family, setFamily] = useState<KindFamily["key"]>(
    () => FAMILIES.find((f) => familyCount(f, byKind) > 0)?.key ?? "cours",
  )
  const [files, setFiles] = useState<{ title: string; files: { name: string }[] } | null>(null)
  const { has } = useDownloads()
  const [shake, doShake] = useShake()

  const kinds = familyOf(family).kinds
  const shown = items.filter((i) => kinds.includes(i.kind))
  /** The other button, when it is the one actually holding this chapitre's content. */
  const other = FAMILIES.find((f) => f.key !== family && familyCount(f, byKind) > 0)

  // The ONE honest « done »: every file of every contenu taken, this session.
  // A chapitre of videos alone has no files to take and is never « done » —
  // the store keeps no watch history, and the disc must not pretend one.
  const withFiles = items.filter((i) => i.files.length > 0)
  const done = withFiles.length > 0 && withFiles.every((i) => i.files.every((f) => has(fileId(i.title, f.name))))

  const head = (
    <>
      <Disc n={n} open={open} muted={empty} done={done} />
      <div className="min-w-0 flex-1 text-start">
        <p
          className={cn(
            "truncate font-bold",
            empty ? "text-v2-ink-2" : "text-v2-ink",
            "text-[calc(13px*var(--ts))] md:text-[calc(16px*var(--ts))] 2xl:text-[calc(20.5px*var(--ts))]",
          )}
          dir="auto"
        >
          {chapter.name}
        </p>
        <p
          className={cn(
            "truncate text-[calc(9px*var(--ts))] md:text-[calc(10.5px*var(--ts))] 2xl:text-[calc(11.7px*var(--ts))]",
            empty ? "text-v2-ink/40" : "text-v2-ink-2",
          )}
        >
          {chapterMeta(bundle)}
        </p>
      </div>
    </>
  )

  if (empty) {
    // Nothing to open — so it is not a door, it is a LOCKED one: the tap is
    // answered (a shake, the `blocked` cue) and the corner says why. Flat,
    // dashed, no lip: depth would promise a press that leads somewhere.
    return (
      <button
        type="button"
        data-uisfx="blocked"
        onClick={doShake}
        aria-label={`${chapter.name} — مسكّر توّا`}
        data-locked="true"
        className={cn(
          tileClass,
          shake,
          "relative flex min-h-[5rem] w-full items-center gap-3 overflow-hidden rounded-2xl border border-v2-ink/10 bg-v2-surface/55 py-4 ps-4 pe-[5.25rem] text-start md:pe-[7rem] 2xl:pe-[130px] md:min-h-[108px] md:gap-5 md:ps-6 2xl:min-h-[136px] 2xl:gap-5 2xl:ps-6",
        )}
      >
        <Ribbon tone="soon">قريباً</Ribbon>
        <div className="flex w-full items-center gap-3 md:gap-5">{head}</div>
      </button>
    )
  }

  /**
   * UN SEUL élément, ouvert ou fermé.
   *
   * Avant, la carte fermée (un bouton blanc) et le chapitre ouvert (un panneau
   * profond) étaient deux arbres différents : ouvrir démontait l'un et montait
   * l'autre, et la liste sautait d'une hauteur à l'autre d'une image sur
   * l'autre. C'est la même section maintenant ; seules ses classes changent, et
   * elles se transitionnent — le fond passe du blanc au dégradé, le texte suit.
   *
   * Le corps est enfermé dans une grille dont la rangée va de `0fr` à `1fr` :
   * c'est la seule façon d'animer vers une hauteur AUTOMATIQUE sans la mesurer
   * en JavaScript ni plafonner un `max-height` au jugé. `overflow-hidden` fait
   * le reste, et `motion-safe:` laisse la bascule instantanée à qui a demandé
   * moins d'animation.
   *
   * Sous le skin play : fermée, la section est une tuile (`v2-tile`, bord 2 px,
   * lèvre 3 px) ; ouverte, le panneau profond pose sur une lèvre de 4 px
   * (`v2-chapter-open`) à la place de son ombre floue.
   */
  return (
    <section
      className={cn(
        "rounded-2xl motion-safe:transition-[background-color,padding,box-shadow] motion-safe:duration-300 motion-safe:ease-out",
        open
          ? "v2-chapter-open bg-v2-chapter p-3 shadow-v2-panel md:p-5 2xl:p-6"
          : cn(tileClass, "border border-v2-ink/10 bg-v2-surface p-0 shadow-v2-card hover:border-v2-brand/30 hover:shadow-v2-lift"),
      )}
    >
      <button
        type="button"
        data-uisfx={open ? "collapse" : "expand"}
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          "group flex w-full items-center gap-3 rounded-2xl text-start md:gap-5",
          open
            ? "px-1"
            : "min-h-[5rem] px-4 py-4 motion-safe:transition-transform md:min-h-[108px] md:px-6 2xl:min-h-[136px] 2xl:px-6",
        )}
      >
        <Disc n={n} open={open} done={done} />
        <div className="min-w-0 flex-1 text-start">
          <p
            className={cn(
              "truncate font-bold motion-safe:transition-colors",
              open
                ? "text-v2-on-chapter text-[calc(14px*var(--ts))] md:text-[calc(17px*var(--ts))] 2xl:text-[calc(21px*var(--ts))]"
                : "text-v2-ink text-[calc(13px*var(--ts))] md:text-[calc(16px*var(--ts))] 2xl:text-[calc(20.5px*var(--ts))]",
            )}
            dir="auto"
          >
            {chapter.name}
          </p>
          <p
            className={cn(
              "truncate text-[calc(9px*var(--ts))] motion-safe:transition-colors md:text-[calc(10.5px*var(--ts))] 2xl:text-[calc(11.7px*var(--ts))]",
              open ? "text-v2-on-chapter/70" : "text-v2-ink-2",
            )}
          >
            {chapterMeta(bundle)}
          </p>
        </div>
        <ChevronRight
          className={cn(
            "size-5 shrink-0 md:size-6 motion-safe:transition-transform motion-safe:duration-300",
            open ? "-rotate-90 text-v2-on-chapter/70" : "rotate-90 text-v2-ink/35 group-hover:text-v2-brand",
          )}
          strokeWidth={2}
        />
      </button>

      <div
        className={cn(
          "grid motion-safe:transition-[grid-template-rows,opacity] motion-safe:duration-300 motion-safe:ease-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        {/* Fermé, le corps reste dans le DOM pour pouvoir s'animer — mais il
            n'existe plus pour personne : `inert` le retire du clavier, du
            pointeur et des lecteurs d'écran d'un coup. */}
        <div className="overflow-hidden" inert={!open}>
      <div
        role="tablist"
        aria-label="نوع المحتوى"
        className="-mx-3 mt-4 flex justify-start gap-2 overflow-x-auto px-3 pb-1 md:mx-0 md:mt-5 md:px-0 2xl:mt-6 2xl:gap-[21px]"
      >
        {FAMILIES.map((f) => (
          <Chip
            key={f.key}
            tone="deep"
            active={family === f.key}
            icon={f.icon}
            label={f.label}
            onClick={() => setFamily(f.key)}
            className="h-11 2xl:h-[46px]"
          />
        ))}
      </div>

      <ul className="v2-contents mt-3 flex flex-col gap-3 md:mt-4 2xl:mt-5 2xl:gap-6">
        {shown.length === 0 ? (
          <li>
            <div className="rounded-2xl border border-dashed border-v2-chapter-line bg-white/[0.07] px-5 py-8 text-center">
              <p className="text-[calc(10px*var(--ts))] font-semibold text-v2-on-chapter md:text-[calc(12px*var(--ts))]">
                ما فمّاش {familyOf(family).label} في الفصل هذا
              </p>
              <p className="mt-1 text-[calc(9px*var(--ts))] text-v2-on-chapter/65 md:text-[calc(10px*var(--ts))]">
                {/* With two buttons the advice is exact: a chapitre that opens
                    has content, so if this side is empty the other one holds it. */}
                {other ? `الفصل هذا فيه ${other.label} برك — إضغط عليهم من فوق.` : "مازال ما فمّاش محتوى في الفصل هذا."}
              </p>
            </div>
          </li>
        ) : (
          shown.map((item, i) => (
            <li key={item.id}>
              <ItemCard
                item={item}
                n={i + 1}
                onFiles={() => setFiles({ title: item.title, files: item.files })}
              />
            </li>
          ))
        )}
      </ul>

      <FilesSheet
        title={files?.title ?? ""}
        subtitle={chapter.name}
        files={files?.files ?? null}
        onOpenChange={(o) => !o && setFiles(null)}
      />
        </div>
      </div>
    </section>
  )
}

/**
 * Un contenu. LA CARTE ENTIÈRE emmène au lecteur.
 *
 * Le lien était le mot « فيديو », haut de quinze pixels, au milieu d'une carte
 * de cent vingt : tout le reste — le titre, le ruban, l'espace autour —
 * ressemblait à un bouton et ne répondait pas. Le lien couvre maintenant la
 * carte (`absolute inset-0`), et la rangée d'actions repasse au-dessus de lui
 * pour que « وثائق » reste cliquable à côté ; un bouton dans un lien serait du
 * HTML invalide, cette superposition est la façon correcte de donner deux
 * gestes à une même carte.
 *
 * Sans vidéo (une série, un résumé), c'est la fiche des documents qui s'ouvre :
 * une carte se clique toujours, elle ne promet jamais rien qui n'arrive pas.
 *
 * Sous le skin play la carte porte son GENRE : bord et lèvre dans la couleur du
 * ruban (`v2-kind-*`), et une plaque de 40 px avec le glyphe du genre à côté
 * du numéro (md+ ; sur un téléphone le ruban suffit, la place manque).
 */
function ItemCard({ item, n, onFiles }: { item: ChapterItem; n: number; onFiles: () => void }) {
  const meta = kindOf(item.kind)
  const Glyph = meta.icon
  const wholeCardOpensFiles = !item.videoPath && item.files.length > 0
  return (
    <article
      className={cn(
        tileClass,
        `v2-kind-${item.kind}`,
        "group relative flex min-h-[6rem] items-center gap-3 overflow-hidden rounded-2xl border border-v2-ink/10 bg-v2-surface py-4 ps-4 pe-[5.25rem] md:pe-[7rem] 2xl:pe-[130px] shadow-v2-card transition hover:-translate-y-0.5 hover:border-v2-brand/30 hover:shadow-v2-lift md:min-h-[120px] md:ps-6 2xl:min-h-[152px] 2xl:ps-7",
      )}
    >
      <Ribbon tone={item.kind}>{meta.ribbon}</Ribbon>

      {/* La surface cliquable, sous le contenu : elle prend tout ce que la
          rangée d'actions ne réclame pas. */}
      {item.videoPath ? (
        <Link
          to={item.videoPath}
          data-uisfx="play"
          aria-label={`${item.title} — فيديو`}
          className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v2-brand"
        />
      ) : wholeCardOpensFiles ? (
        <button
          type="button"
          data-uisfx="open"
          onClick={onFiles}
          aria-label={`${item.title} — وثائق`}
          className="absolute inset-0 z-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-v2-brand"
        />
      ) : null}

      <div className="pointer-events-none relative z-10 flex min-w-0 flex-1 items-center gap-3 md:gap-5">
        <ItemDisc n={n} />
        <span aria-hidden className={cn("v2-play v2-plate", `v2-kind-${item.kind}`)}>
          <Glyph strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <h3
            className="truncate font-bold text-v2-ink text-[calc(12px*var(--ts))] md:text-[calc(15px*var(--ts))] 2xl:text-[calc(19.3px*var(--ts))]"
            dir="auto"
          >
            {item.title}
          </h3>
          <div className="mt-2 flex items-center justify-start gap-4 md:mt-3 md:gap-6 2xl:gap-8">
            {item.videoPath ? (
              <span className="inline-flex items-center gap-2 text-v2-ink-2 transition group-hover:text-v2-brand">
                <PlayCircle className="size-5 shrink-0 text-v2-brand md:size-6 2xl:size-7" strokeWidth={1.75} />
                <span className="text-[calc(10px*var(--ts))] font-medium md:text-[calc(13px*var(--ts))] 2xl:text-[calc(16px*var(--ts))]">
                  فيديو
                </span>
              </span>
            ) : item.kind === "quiz" ? (
              <span className="inline-flex items-center gap-2 text-v2-ink-2">
                <Timer className="size-5 shrink-0 text-v2-brand md:size-6 2xl:size-7" strokeWidth={1.75} />
                <span className="text-[calc(10px*var(--ts))] font-medium md:text-[calc(13px*var(--ts))] 2xl:text-[calc(16px*var(--ts))]">
                  {item.questionCount} أسئلة · {item.durationMin} دق
                </span>
              </span>
            ) : null}

            {item.files.length > 0 && (
              <button
                type="button"
                data-uisfx="open"
                onClick={onFiles}
                // A 44 pt pill, not the bare label (26 pt): it sits on top of
                // the row's own link to the video, so a slightly-off tap used
                // to play the video instead of opening the files.
                className="pointer-events-auto relative z-20 -mx-3 -my-2 inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-v2-ink-2 transition hover:bg-v2-brand/[0.08] hover:text-v2-brand-text"
              >
                <FileText className="size-5 shrink-0 text-v2-brand md:size-6 2xl:size-7" strokeWidth={1.75} />
                <span className="text-[calc(10px*var(--ts))] font-medium md:text-[calc(13px*var(--ts))] 2xl:text-[calc(16px*var(--ts))]">
                  {item.files.length > 1 ? `${item.files.length} وثائق` : "وثيقة"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
