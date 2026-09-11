import { SubjectIcon } from "@/components/icons/subjects"
import { cn } from "@/lib/utils"
import algorithmique from "../../../svg icons/doodles/algorithmique.svg"
import allemand from "../../../svg icons/doodles/allemand.svg"
import anglais from "../../../svg icons/doodles/anglais.svg"
import arabe from "../../../svg icons/doodles/arabe.svg"
import economie from "../../../svg icons/doodles/economie.svg"
import electricite from "../../../svg icons/doodles/electricite.svg"
import espagnol from "../../../svg icons/doodles/espagnol.svg"
import francais from "../../../svg icons/doodles/francais.svg"
import geographie from "../../../svg icons/doodles/geographie.svg"
import gestion from "../../../svg icons/doodles/gestion.svg"
import informatique from "../../../svg icons/doodles/informatique.svg"
import islamique from "../../../svg icons/doodles/islamique.svg"
import mathematiques from "../../../svg icons/doodles/mathematiques.svg"
import mecanique from "../../../svg icons/doodles/mecanique.svg"
import philosophie from "../../../svg icons/doodles/philosophie.svg"
import physique from "../../../svg icons/doodles/physique.svg"
import sciences from "../../../svg icons/doodles/sciences.svg"

/**
 * The line drawings round each portrait, lifted out of the Figma frames
 * (« Recording » for twelve matières, « Group 7 » for the other five): every
 * path in a card's top zone at ink 15–16 %, re-anchored on the portrait's
 * centre and top so they sit where the designer put them whatever card they
 * came from (the Recording cards drift between 354 and 400 wide). One file per
 * badge in `svg icons/doodles/`, flattened to black and painted through a mask
 * here, so the ink — and its hover — come from the tokens.
 *
 * Keyed like `BADGE_BY_NAME`: matières that share a drawing share its doodles.
 */
const DOODLE_BY_NAME: Record<string, string> = {
  "رياضيات": mathematiques,
  "خوارزميات": algorithmique,
  "إعلامية": informatique,
  "علوم فيزيائية": physique,
  "علوم الحياة والأرض": sciences,
  "فرنسية": francais,
  "أنڤليزية": anglais,
  "عربية": arabe,
  "الأدب العربي": arabe,
  "تربية إسلامية": islamique,
  "تفكير إسلامي": islamique,
  "الحضارة العربية والإسلامية": islamique,
  "تاريخ وجغرافيا": geographie,
  "اقتصاد": economie,
  "تصرّف": gestion,
  "ميكانيك": mecanique,
  "تكنولوجيا": mecanique,
  "كهرباء": electricite,
  "ألمانية": allemand,
  "إسبانية": espagnol,
  "فلسفة": philosophie,
}

/**
 * The top of a subject card, in the frame's own geometry: a 354 × 240 stage
 * the full width of the card, doodles across it, the badge in the middle.
 *
 * The badge box is NOT the 188 × 201 rect Figma shows — that rect is a clip.
 * The image fill behind it is drawn at 129 % of the rect's width and shifted
 * so the canvas margins fall outside, which is why the disc reads bigger in
 * the frame than a `contain` inside the rect would give. Placing the whole
 * canvas box (243.7 × 231.8 at 45.9, 9.5) reproduces it without clipping the
 * head that breaks over the ring.
 *
 * The badge is the SVG with its eyes flagged, so the gaze overlay rides along;
 * the card around it must carry `group` for the hover-to-front snap.
 */
export function PortraitStage({ name, className }: { name: string; className?: string }) {
  const doodle = DOODLE_BY_NAME[name]
  return (
    <div className={cn("relative aspect-[354/240] w-full", className)}>
      {doodle && (
        <span
          aria-hidden
          className="absolute inset-0 bg-v2-ink/15 transition-colors duration-500 group-hover:bg-v2-brand/35"
          style={{
            maskImage: `url("${doodle}")`,
            WebkitMaskImage: `url("${doodle}")`,
            maskSize: "100% 100%",
            WebkitMaskSize: "100% 100%",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
          }}
        />
      )}
      <SubjectIcon
        name={name}
        className="absolute inset-x-[12.97%] top-[3.96%] h-[96.6%] transition duration-500 group-hover:scale-[1.04]"
      />
    </div>
  )
}
