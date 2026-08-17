import { useLocale, type Locale } from "@/i18n/locale"

/**
 * The strings that live in components rendered in BOTH spaces — the kit's
 * defaults and the screens under features/shared/. Everything else is written
 * inline in its own language: the élève screens in Arabic, the back-office
 * screens in French, because each of those only ever renders in one.
 *
 * Keep this small. It is a dictionary for the overlap, not a translation
 * framework for the whole app.
 */
const DICT = {
  ar: {
    save: "سجّل",
    cancel: "إلغاء",
    confirm: "تأكيد",
    details: "التفاصيل",
    actions: "خيارات",
    search: "لوّج…",
    nothingYet: "ما فماش حتّى حاجة",
    noResults: "ما فماش نتائج",
    close: "سكّر",
    edit: "بدّل",
    remove: "نحّي",
    copy: "انسخ",
    copied: "تنسخ",
    all: "الكل",
    of: "من",

    // « كوداتي » — the one screen both spaces share.
    myCodes: "كوداتي",
    myCodesSubtitleStudent: (n: string) => `الكودات اللي تعطيهم لصحابك وشنوّة ربّحتلك، ${n}.`,
    myCodesSubtitleTeacher: (n: string) => `كوداتك وشنوّة ربّحتلك، ${n}.`,
    myCodesSubtitleParent: (n: string) => `الكودات اللي تعطيهم وشنوّة رجّعولك، ${n}.`,
    earned: "ربحت",
    usedBy: "استعملوه",
    myCodesCount: "كوداتي",
    savedForOthers: "ربّحت لصحابك",
    theCodes: "الكودات متاعي",
    whoUsedThem: "شكون استعملهم",
    codesIUsed: "كودات استعملتهم",
    who: "شكون",
    offer: "العرض",
    yourCut: "ربحك",
    theCode: "الكود",
    youSaved: "ربحت",
    uses: "استعمال",
    left: "باقي",
    friendPays: "صاحبك يخلّص",
    youTake: "تاخو",
    noCodesTitle: "ما عندكش كودات",
    noCodesBody: "كي تعطيك الإدارة كود، تلقاه هنا مع شكون استعملو وشنوّة ربّحتلك.",
    noUsesTitle: "مازال حتّى حد ما استعملو",
    noUsesBody: "ابعث الكود لصحابك — كل استعمال يزيدلك في الربح.",
    removedUser: "مستعمل تنحّى",
    removedOffer: "عرض تنحّى",
    theAcademy: "الأكاديمية",
    arrangement: "ترتيب",

    // App shell + profile — chrome every role sees.
    roleAdmin: "الإدارة",
    roleTeacher: "أستاذ",
    roleParent: "ولي",
    roleStudent: "تلميذ",
    more: "زيادة",
    myProfile: "بروفايلي",
    signOut: "اخرج",
    switchRole: "بدّل الدور",
    collapseMenu: "صغّر القائمة",
    expandMenu: "كبّر القائمة",
    myAccount: "حسابي",
    comingSoonTitle: "قريب",
  },
  fr: {
    save: "Enregistrer",
    cancel: "Annuler",
    confirm: "Confirmer",
    details: "Détails",
    actions: "Options",
    search: "Rechercher…",
    nothingYet: "Rien pour l'instant",
    noResults: "Aucun résultat",
    close: "Fermer",
    edit: "Modifier",
    remove: "Supprimer",
    copy: "Copier",
    copied: "Copié",
    all: "Tout",
    of: "sur",

    myCodes: "Mes codes",
    myCodesSubtitleStudent: (n: string) => `Les codes que tu partages et ce qu'ils t'ont rapporté, ${n}.`,
    myCodesSubtitleTeacher: (n: string) => `Vos codes et ce qu'ils vous ont rapporté, ${n}.`,
    myCodesSubtitleParent: (n: string) => `Les codes que vous partagez et ce qu'ils vous ont rapporté, ${n}.`,
    earned: "Gagné",
    usedBy: "Utilisations",
    myCodesCount: "Mes codes",
    savedForOthers: "Économisé pour eux",
    theCodes: "Mes codes",
    whoUsedThem: "Qui les a utilisés",
    codesIUsed: "Codes utilisés",
    who: "Qui",
    offer: "Offre",
    yourCut: "Votre part",
    theCode: "Code",
    youSaved: "Économisé",
    uses: "utilisations",
    left: "restant",
    friendPays: "Il paie",
    youTake: "vous prenez",
    noCodesTitle: "Aucun code",
    noCodesBody: "Dès que l'administration vous attribue un code, il apparaît ici avec ses utilisations.",
    noUsesTitle: "Personne ne l'a encore utilisé",
    noUsesBody: "Partagez le code — chaque utilisation augmente votre part.",
    removedUser: "Utilisateur supprimé",
    removedOffer: "Offre supprimée",
    theAcademy: "L'académie",
    arrangement: "Formule",

    roleAdmin: "Administration",
    roleTeacher: "Enseignant",
    roleParent: "Parent",
    roleStudent: "Élève",
    more: "Plus",
    myProfile: "Mon profil",
    signOut: "Déconnexion",
    switchRole: "Changer de rôle",
    collapseMenu: "Réduire le menu",
    expandMenu: "Agrandir le menu",
    myAccount: "Mon compte",
    comingSoonTitle: "Bientôt",
  },
} as const

export type Strings = (typeof DICT)["ar"]

export const stringsFor = (locale: Locale): Strings => DICT[locale] as Strings

/** The shared strings for whichever space is on screen. */
export function useT(): Strings {
  return stringsFor(useLocale())
}
