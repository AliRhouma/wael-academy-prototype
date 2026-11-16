# Rapport — « الدروس » (les matières du bac et leur contenu)

**Dépôt :** `AliRhouma/wael-academy-v2` · branche `main`
**Commit :** `b17b229` — *feat(الدروس) : le programme du bac, repris du catalogue de la clé*
**Routes :** `/student-v2/matieres` et `/student-v2/matieres/:subjectId`
**Date :** 18 septembre 2026

---

## 1. En une phrase

Le programme du bac ne vient plus d'un jeu de données inventé : il est repris du
catalogue **« Chapitres par Bac »** que l'académie tient sur sa clé USB, et la
page qui l'affiche a été refaite autour de ce que l'élève vient y chercher —
regarder une vidéo, prendre un document.

**Aucun fichier n'est servi par le prototype.** Chaque vidéo et chaque document
est *désigné* par une référence, jamais copié. Le chapitre 5 dit exactement où
sont les fichiers et comment remonter de la référence au fichier réel.

---

## 2. Ce qui a changé sur la page

### La liste des matières — `/student-v2/matieres`

| Avant | Maintenant |
|---|---|
| Titre « موادك », les matières de la filière de l'élève | Titre **« الدروس »**, **les six bacs**, un par section |
| — | La filière de l'élève ouvre la page, porte **« شعبتك »** et est la **seule section dépliée** ; les cinq autres sont un titre cliquable tant qu'on ne les demande pas |
| Deux puces `الكل` / `فيها محتوى` sur une filière | Les mêmes, mais **elles traversent les six bacs** et déplient d'office les sections qu'elles gardent |
| Carte : nom complet + nom français dessous | Carte : **la matière seule** (« SVT », pas « Bac Sciences - SVT » — la filière est déjà le titre de la section), sans sous-titre français |
| `2 فصول · 22 محتوى` | **`2 محاور · 20 فيديو`** — le nombre de contenus qui portent réellement un replay |
| `مازال ما فمّاش محتوى` | **`يهبط غدوة · السبت 19/09`** — date calculée (`dropDay()`), jamais écrite en dur |

### La page d'une matière — `/student-v2/matieres/:subjectId`

| Avant | Maintenant |
|---|---|
| Trois onglets de tête : `خطوة بخطوة` · `الدروس` · `إمتحانات` | **Supprimés.** La page EST la liste des chapitres. Les parcours et les examens restent dans le store et dans l'ancien espace `/student` — seule cette page a cessé de les proposer |
| Sous-titre français sous le nom de la matière | Supprimé |
| Cinq puces dans un chapitre : cours · exercice · série · résumé · quiz | **Deux : `دروس` et `تمارين`.** Chaque genre tombe du côté auquel il appartient — le **résumé** avec les cours, la **série** et le **quiz** avec les exercices. Rien n'est caché : chaque carte garde son propre ruban (`SÉRIE`, `RÉSUMÉ`, `QUIZ`) |
| `4 محتوى، 0 كويز` sous le titre du chapitre | **`4 فيديو · 1 تمرين`** — vidéos réellement présentes, et tout ce que le bouton `تمارين` rassemble |
| Ouvrir/fermer : deux arbres React qui se remplaçaient | **Un seul élément** qui se transitionne (fond, texte, chevron) ; le corps est dans une grille `grid-rows-[0fr]` → `[1fr]`, seule façon d'animer vers une hauteur *automatique*. `motion-safe:` partout, et le corps replié porte **`inert`** |
| Carte d'un contenu : seul le mot « فيديو » était cliquable | **Toute la carte** mène au lecteur (`<Link className="absolute inset-0">`, le bouton « وثائق » repasse au-dessus en `z-20`). Sans vidéo, la carte ouvre ses documents |
| — | Chaque contenu porte **son rang dans le chapitre** (`1`, `2`, `3`) dans un disque, au début de la ligne |

### Le lecteur — `/student-v2/video/lesson/:id`

Le panneau « الوثائق » ne lisait que les documents d'une **séance**
(`useSessionDocs`), donc l'ouverture d'une leçon affichait toujours
« ما فمّا حتّى وثيقة » alors que **457 contenus sur 469** portent un document.
Il lit maintenant selon le type du replay : séance → ses fichiers, leçon → ses
`pdfs`, examen → les siens.

---

## 3. Où est le code

```
src/features/student-v2/matieres/
  SubjectsScreen.tsx   la grille, les sections par bac, le pliage
  SubjectScreen.tsx    une matière : chapitres, ItemCard, l'accordéon
  matieres.ts          useSubjectBundle · useSubjectSections · FAMILIES · chapterMeta
  parts.tsx            Ribbon · Disc · ItemDisc · Chip · FilesSheet
src/features/student-v2/
  lib.ts               dropDay() — le jour de livraison annoncé
  PortraitStage.tsx    les doodles derrière le badge
  video/VideoScreen.tsx  le panneau « الوثائق »
src/data/matiere.ts    matiereOf() / matiereKey()      ← NOUVEAU
src/styles/v2.css      --v2-chapter, --v2-kind-*
src/app/nav/studentV2.ts  le libellé de l'onglet
```

### `src/data/matiere.ts` — à connaître avant de toucher aux matières

Les matières du bac s'appellent maintenant **« Bac X - Y »**
(`Bac Math - SVT`, `Bac Lettres - عربية`). Or **tout ce qui DESSINE une matière
est indexé par son seul nom** : son badge, ses doodles, la teinte de sa carte,
son libellé français. Ce module retire le préfixe et réconcilie l'orthographe du
catalogue (`SVT`, `Maths`, `Physique`) avec celle du seed (`علوم الحياة والأرض`,
`رياضيات`, `علوم فيزيائية`).

**Toute nouvelle table indexée par nom de matière doit passer par `matiereKey()`,
sinon la matière perd son dessin en silence.** Cinq tables l'utilisent déjà :
`BADGE_BY_NAME`, `PORTRAIT_BY_NAME`, `FALLBACK_BY_NAME` (`subjects.tsx`),
`BADGE_COLOR` (`subjectTint.ts`), `DOODLE_BY_NAME` (`PortraitStage.tsx`),
`FRENCH_NAME` (`lib.ts`).

---

## 4. Les données

`src/data/seed/` — inchangé comme mécanique, rempli autrement.

| | |
|---|---|
| Matières du bac | **116** (les 6 filières × leurs matières, optionnelles comprises) |
| dont avec un programme | **26** |
| Chapitres | **72** |
| Contenus | **469** — 290 `cours`, 179 `exercice` |
| Vidéos référencées | **469** (169 codes distincts) |
| Documents référencés | **505** |

Conventions à respecter en ajoutant des lignes :

- **Identifiants lisibles et stables.** `subj-bac-<filière>-<matière>` ·
  `ch-bac-<filière>-<tag>-<n>` · `les-bac-<filière>-<tag>-<n>-<nn>`.
  Les anciens identifiants ont été **conservés** (`subj-bac-sci-sciences-physiques`
  s'appelle maintenant « Bac Sciences - Physique » mais garde son id), pour que
  les séances, devoirs, lives et accès qui les désignent continuent de marcher.
  **Aucune référence pendante dans le seed.**
- L'identifiant d'un contenu dit **de quel item du catalogue il vient** — c'est
  ce qui permet de retrouver la référence de ses fichiers (chapitre 5). Il ne
  suit pas toujours le numéro de son chapitre (les chapitres SVT ont été
  redécoupés) : **ne pas renuméroter les identifiants**.
- Une matière enseignée dans plusieurs filières a **une copie par filière**
  (chapitres et contenus dupliqués, ids propres), pas un chapitre partagé — un
  bac peut donc faire évoluer son programme sans toucher aux autres.

---

## 5. Où sont les documents et les vidéos

### Dans le prototype : une référence, jamais un fichier

```json
{
  "id": "les-bac-sci-phys-7-02",
  "title": "Vitesse d'une réaction chimique",
  "kind": "cours",
  "videoUrl": "wael-media:MAHDI-PHYS-022",
  "pdfs": [{ "name": "pdf Cinétique chimique - Chapitre 1 - Cours et Exercices" }],
  "chapterId": "ch-bac-sci-phys-7"
}
```

- **`videoUrl`** porte le **code du fichier**, préfixé `wael-media:`. Ce code est
  celui imprimé entre crochets en tête du nom du fichier sur la clé —
  `[MAHDI-PHYS-022] vitesse d'une réaction chimique.mp4`.
- **`pdfs[].name`** ne porte, lui, **que le titre du document** : son code n'est
  pas encore écrit dans le seed. `ResourceLink` a déjà le champ pour le recevoir
  (`{ name, url? }`) ; voir « Ce qui reste à faire ».

### Ce qui se joue réellement

`src/data/media.ts` :

- `videoSrc()` — un vrai lien YouTube se joue ; **toute référence
  `wael-media:` retombe sur `DEMO_VIDEO_URL`**, donc un lecteur n'est jamais mort.
- `pdfSrc()` — renvoie **toujours** `DEMO_PDF_URL` (`/docs/correction-concours-reo.pdf`).

C'est le seul endroit à changer le jour où les fichiers seront servis :
`wael-media:<code>` → une URL réelle.

### Les fichiers réels — trois endroits

| Où | Quoi |
|---|---|
| **`E:\BAC\<professeur>\…`** (clé USB) | les fichiers eux-mêmes, nommés `[CODE] titre.ext`. 14 dossiers de professeurs, 773 fichiers |
| **`E:\Chapitres par Bac\bac-chapitres.html`** | le catalogue : la médiathèque complète (code → titre, type, dossier) **écrite à l'intérieur du fichier**, plus les six bacs et leurs matières |
| **`E:\Chapitres par Bac\chapitres-data.js`** | ce que le professeur a saisi : chapitres, leçons, exercices, et **la liste exacte des codes de chaque leçon** |

### Bunny Stream — les vidéos sont déjà en ligne

Bibliothèque **`main-library`** (id `512369`), **3 396 vidéos**. Le code du
fichier est repris dans le **titre** de la vidéo : `[MAHDI-PHYS-080] dipole RL
etude théorique.mp4`.

**Les 169 codes référencés par le prototype sont tous présents dans Bunny — zéro
manquant.** Environ 130 vidéos en ligne ne sont référencées nulle part : ce sont
des matières dont le catalogue n'a pas encore de chapitres (43 Anglais, 33
عربية, 25 Mécanique, 19 Maths, 8 Économie).

> La clé d'API est sur la clé USB (`E:\api bunny key.txt`). **Elle n'est pas dans
> le dépôt et ne doit pas y entrer.** C'est une clé de compte : elle ouvre
> l'API `api.bunny.net` et, de là, la clé propre à la bibliothèque.

### Bunny Storage — les documents y sont aussi

Les PDF ne sont **pas** dans Bunny Stream (qui ne prend que de la vidéo) mais
dans une **zone de stockage**. Le compte en a trois :

| Zone | Région | Fichiers | Contenu |
|---|---|---|---|
| **`wael-academy-files`** | DE | 765 | **les documents du bac** |
| `wa-default-storage` | DE | 270 | — |
| `wael-doc` | DE | 13 | — |

Dans `wael-academy-files`, les documents suivent exactement la même convention
que la clé : `BAC/<professeur>/[CODE] titre.pdf`.

```
BAC/eline bac/[ELINE-ECO-006] PDF V01.pdf
BAC/Raouedha erguez FRANCAIS/[RAOUEDHA-FR-013] La cause et la conséquence.pdf
BAC/mahdi BAC/[MAHDI-PHYS-020] pdf Cinétique chimique - Chapitre 1 - Cours et Exercices.pdf
```

**198 documents y portent un code, et les 120 codes de documents dont le
prototype a besoin y sont tous — zéro manquant.**

Lister ou télécharger (la clé de la zone se lit dans la réponse de
`GET https://api.bunny.net/storagezone`, champ `Password`) :

```bash
# lister un dossier
curl -H "AccessKey: <mot de passe de la zone>"      "https://storage.bunnycdn.com/wael-academy-files/BAC/eline%20bac/"

# télécharger un document
curl -H "AccessKey: <mot de passe de la zone>" -o doc.pdf      "https://storage.bunnycdn.com/wael-academy-files/BAC/eline%20bac/%5BELINE-ECO-006%5D%20PDF%20V01.pdf"
```

> **Aucune pull zone n'est branchée sur ces zones aujourd'hui.** Les documents ne
> sont donc pas lisibles par une URL publique : il faudra soit créer une pull
> zone (et servir `https://<pull-zone>/BAC/…`), soit passer par un proxy côté
> serveur qui garde la clé. Ne jamais mettre la clé de zone dans le client.

### Retrouver un fichier à partir de ce que montre l'écran

1. **La vidéo** — le contenu porte déjà son code : `videoUrl` =
   `wael-media:MAHDI-PHYS-022`.
   **Le document** — le seed n'a que son titre ; son code se lit dans
   `docs/medias-prototype.csv`, à la ligne dont `Id du contenu` vaut l'id de la
   leçon (`les-bac-sci-phys-7-02`) et `Média` vaut `document`.
2. **Le code dit où est le fichier.** Son préfixe est le professeur
   (`MAHDI-PHYS` → *mahdi BAC*, `ELINE-ECO` → *eline bac*, `RAOUEDHA-FR` →
   *Raouedha erguez FRANCAIS*…), et les colonnes `Fichier` / `Dossier` du CSV
   donnent le nom et l'emplacement exacts.
3. **Aller le chercher :**
   - **une vidéo** → Bunny Stream, bibliothèque `main-library` (`512369`) ;
     le code est dans le **titre** de la vidéo, donc
     `GET /library/512369/videos?search=MAHDI-PHYS-022` la retrouve, et son
     `guid` donne l'iframe `https://iframe.mediadelivery.net/embed/512369/<guid>` ;
   - **un document** → Bunny Storage, zone `wael-academy-files`, chemin
     `BAC/<professeur>/[CODE] titre.pdf` ;
   - **hors ligne** → la clé USB, `E:\BAC\<professeur>\`, même nom de fichier.

### La table de correspondance : `docs/medias-prototype.csv`

**C'est le document à ouvrir pour retrouver un fichier.** 999 lignes, une par
fichier, UTF-8 avec BOM et séparateur `;` (Excel l'ouvre directement) :

```
Bac ; Matière ; Chapitre ; Contenu ; Titre au catalogue ; Type ; Média ;
Référence ; Fichier ; Dossier ; Source ; Id du contenu
```

Une ligne :

```
باك — علوم تجريبية ; Bac Sciences - Physique ; Cinétique chimique ;
Vitesse d'une réaction chimique ; Vitesse d'une réaction chimique (sc +math) ;
cours ; document ; MAHDI-PHYS-020 ;
pdf Cinétique chimique - Chapitre 1 - Cours et Exercices.pdf ;
mahdi BAC/cinétique chimique dpx ; médiathèque ; les-bac-sci-phys-7-02
```

- **`Référence`** — le code, **y compris pour les documents**, que le seed ne
  porte pas encore. Il n'a pas été deviné par rapprochement de titres :
  `chapitres-data.js` enregistre les codes item par item, et l'id du contenu dit
  de quel item il s'agit. Les 33 références dont **le titre** était ambigu
  (`APPLICATION 1` désigne deux fichiers chez AMMAR-MECA) sont donc exactes.
- **`Fichier`** / **`Dossier`** — le nom et l'emplacement réels sous `E:\BAC\`.
- **`Titre au catalogue`** — rempli **uniquement** quand le titre affiché diffère
  de celui de la clé (9 lignes renommées à la demande de l'académie), pour
  qu'aucun écart ne soit silencieux.
- **938 lignes sur 999 portent une référence.** Les 61 autres sont les documents
  de l'ancien jeu de démonstration (collège, examens), qui n'en ont jamais eu.

Le fichier est **régénéré** en relisant la clé ; il n'est pas maintenu à la main.

---

## 6. Ce qui reste à faire

1. **Écrire le code des documents dans le seed.** Les 505 références de documents
   n'existent aujourd'hui que dans le CSV. Cible :
   `{"name": "…", "url": "wael-media:MAHDI-PHYS-020"}` — symétrique de la vidéo,
   et `pdfSrc()` pourra les résoudre comme `videoSrc()`.
2. **Servir les vrais médias.** Tout est déjà en ligne : les vidéos dans Bunny
   Stream, les documents dans `wael-academy-files`. Il manque une **pull zone**
   (ou un proxy) sur la zone de stockage, puis `media.ts` traduit
   `wael-media:<code>` en URL au lieu de retomber sur la démo.
3. **Le catalogue a avancé depuis l'import.** `chapitres-data.js` est daté du
   18/09 14:29 et contient un programme de **Maths pour le bac sciences**
   (Étude de fonction 24 · Suites réelles 8 · Nombre complexe 16) que le
   prototype n'a pas encore.
4. **Deux chapitres de test** (`tt`, `ss`, sous Bac Info) sont dans le catalogue
   et ont été écartés volontairement.

---

## 7. Vérifications

```
npx tsc -b             # types
npm run build          # build de production
npm run check:sounds   # chaque action de /student-v2 porte une intention sonore
```

Les trois passent sur `b17b229`. Toute action ajoutée dans `/student-v2` doit
porter son `data-uisfx` — voir `docs/sound-effects.md`.
