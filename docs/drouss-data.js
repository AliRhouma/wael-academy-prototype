/* Structure de « الدروس » — 19/09/2026 06:52:16
   Le programme du prototype, emboîté et mis en forme comme chapitres-data.js :
   bac → matière → chapitre → item. Un item porte les codes de ses fichiers,
   la vidéo d'abord. ENGENDRÉ par « npm run drouss:data » — ne pas l'éditer.

   116 matières (26 avec un programme) · 72 chapitres · 469 items · 294 fichiers distincts */
window.DROUSS_DATA = {
 "stamp": "2026-09-19T05:52:16.838Z",
 "bacs": [
  {
   "id": "y-bac-math",
   "name": "باك — رياضيات",
   "matieres": [
    {
     "id": "subj-bac-math-mathematiques",
     "name": "Bac Math - Maths",
     "chapitres": []
    },
    {
     "id": "subj-bac-math-sciences-physiques",
     "name": "Bac Math - Physique",
     "chapitres": [
      {
       "id": "ch-bac-math-phys-1",
       "name": "Le condensateur",
       "items": [
        {
         "id": "les-bac-math-phys-1-01",
         "type": "cours",
         "title": "Étude expérimentale",
         "refs": [
          "MAHDI-PHYS-026",
          "MAHDI-PHYS-023"
         ]
        },
        {
         "id": "les-bac-math-phys-1-02",
         "type": "cours",
         "title": "Étude théorique",
         "refs": [
          "MAHDI-PHYS-029",
          "MAHDI-PHYS-023"
         ]
        },
        {
         "id": "les-bac-math-phys-1-03",
         "type": "exercice",
         "title": "Exercice 1",
         "refs": [
          "MAHDI-PHYS-024",
          "MAHDI-PHYS-030"
         ]
        },
        {
         "id": "les-bac-math-phys-1-04",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "MAHDI-PHYS-025",
          "MAHDI-PHYS-030"
         ]
        },
        {
         "id": "les-bac-math-phys-1-05",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "MAHDI-PHYS-027",
          "MAHDI-PHYS-030"
         ]
        },
        {
         "id": "les-bac-math-phys-1-06",
         "type": "exercice",
         "title": "Exercice 4",
         "refs": [
          "MAHDI-PHYS-028",
          "MAHDI-PHYS-030"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-math-phys-2",
       "name": "RC",
       "items": [
        {
         "id": "les-bac-math-phys-2-01",
         "type": "cours",
         "title": "Dipôle RC : étude expérimentale",
         "refs": [
          "MAHDI-PHYS-066",
          "MAHDI-PHYS-063",
          "MAHDI-PHYS-064"
         ]
        },
        {
         "id": "les-bac-math-phys-2-02",
         "type": "cours",
         "title": "Dipôle RC : étude théorique",
         "refs": [
          "MAHDI-PHYS-065",
          "MAHDI-PHYS-063",
          "MAHDI-PHYS-064"
         ]
        },
        {
         "id": "les-bac-math-phys-2-03",
         "type": "exercice",
         "title": "Exercice 1",
         "refs": [
          "MAHDI-PHYS-057",
          "MAHDI-PHYS-069"
         ]
        },
        {
         "id": "les-bac-math-phys-2-04",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "MAHDI-PHYS-058",
          "MAHDI-PHYS-069"
         ]
        },
        {
         "id": "les-bac-math-phys-2-05",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "MAHDI-PHYS-059",
          "MAHDI-PHYS-067"
         ]
        },
        {
         "id": "les-bac-math-phys-2-06",
         "type": "exercice",
         "title": "Exercice 4",
         "refs": [
          "MAHDI-PHYS-060",
          "MAHDI-PHYS-067"
         ]
        },
        {
         "id": "les-bac-math-phys-2-07",
         "type": "exercice",
         "title": "Exercice 5",
         "refs": [
          "MAHDI-PHYS-061",
          "MAHDI-PHYS-068"
         ]
        },
        {
         "id": "les-bac-math-phys-2-08",
         "type": "exercice",
         "title": "Exercice 6",
         "refs": [
          "MAHDI-PHYS-062",
          "MAHDI-PHYS-068"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-math-phys-3",
       "name": "La bobine",
       "items": [
        {
         "id": "les-bac-math-phys-3-01",
         "type": "cours",
         "title": "Bobine",
         "refs": [
          "MAHDI-PHYS-009",
          "MAHDI-PHYS-005",
          "MAHDI-PHYS-006"
         ]
        },
        {
         "id": "les-bac-math-phys-3-02",
         "type": "exercice",
         "title": "Exercice 1",
         "refs": [
          "MAHDI-PHYS-007",
          "MAHDI-PHYS-003"
         ]
        },
        {
         "id": "les-bac-math-phys-3-03",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "MAHDI-PHYS-008",
          "MAHDI-PHYS-003"
         ]
        },
        {
         "id": "les-bac-math-phys-3-04",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "MAHDI-PHYS-002",
          "MAHDI-PHYS-004"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-math-phys-4",
       "name": "RL",
       "items": [
        {
         "id": "les-bac-math-phys-4-01",
         "type": "cours",
         "title": "Dipôle RL : étude expérimentale",
         "refs": [
          "MAHDI-PHYS-081",
          "MAHDI-PHYS-084"
         ]
        },
        {
         "id": "les-bac-math-phys-4-02",
         "type": "cours",
         "title": "Dipôle RL : étude théorique",
         "refs": [
          "MAHDI-PHYS-080",
          "MAHDI-PHYS-084"
         ]
        },
        {
         "id": "les-bac-math-phys-4-03",
         "type": "exercice",
         "title": "Exercice 1",
         "refs": [
          "MAHDI-PHYS-075",
          "MAHDI-PHYS-073"
         ]
        },
        {
         "id": "les-bac-math-phys-4-04",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "MAHDI-PHYS-074",
          "MAHDI-PHYS-073"
         ]
        },
        {
         "id": "les-bac-math-phys-4-05",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "MAHDI-PHYS-076",
          "MAHDI-PHYS-070"
         ]
        },
        {
         "id": "les-bac-math-phys-4-06",
         "type": "exercice",
         "title": "Exercice 4",
         "refs": [
          "MAHDI-PHYS-077",
          "MAHDI-PHYS-071"
         ]
        },
        {
         "id": "les-bac-math-phys-4-07",
         "type": "exercice",
         "title": "Exercice 5",
         "refs": [
          "MAHDI-PHYS-078",
          "MAHDI-PHYS-072"
         ]
        },
        {
         "id": "les-bac-math-phys-4-08",
         "type": "exercice",
         "title": "Exercice 6",
         "refs": [
          "MAHDI-PHYS-079",
          "MAHDI-PHYS-072"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-math-phys-5",
       "name": "Oscillations libres amorties",
       "items": [
        {
         "id": "les-bac-math-phys-5-01",
         "type": "cours",
         "title": "Oscillations amorties libres : étude expérimentale",
         "refs": [
          "MAHDI-PHYS-033",
          "MAHDI-PHYS-038"
         ]
        },
        {
         "id": "les-bac-math-phys-5-02",
         "type": "cours",
         "title": "Oscillations amorties libres : étude théorique",
         "refs": [
          "MAHDI-PHYS-037",
          "MAHDI-PHYS-038"
         ]
        },
        {
         "id": "les-bac-math-phys-5-03",
         "type": "exercice",
         "title": "Exercice 1",
         "refs": [
          "MAHDI-PHYS-034",
          "MAHDI-PHYS-031"
         ]
        },
        {
         "id": "les-bac-math-phys-5-04",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "MAHDI-PHYS-035",
          "MAHDI-PHYS-032"
         ]
        },
        {
         "id": "les-bac-math-phys-5-05",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "MAHDI-PHYS-036",
          "MAHDI-PHYS-032"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-math-phys-6",
       "name": "Oscillations électriques libres non amorties",
       "items": [
        {
         "id": "les-bac-math-phys-6-01",
         "type": "cours",
         "title": "Oscillations non amorties : étude expérimentale",
         "refs": [
          "MAHDI-PHYS-054",
          "MAHDI-PHYS-039"
         ]
        },
        {
         "id": "les-bac-math-phys-6-02",
         "type": "cours",
         "title": "Oscillations non amorties : étude théorique (partie 1)",
         "refs": [
          "MAHDI-PHYS-050",
          "MAHDI-PHYS-039"
         ]
        },
        {
         "id": "les-bac-math-phys-6-03",
         "type": "cours",
         "title": "Oscillations non amorties : étude théorique (partie 2)",
         "refs": [
          "MAHDI-PHYS-053",
          "MAHDI-PHYS-039"
         ]
        },
        {
         "id": "les-bac-math-phys-6-04",
         "type": "exercice",
         "title": "Exercice 1",
         "refs": [
          "MAHDI-PHYS-051",
          "MAHDI-PHYS-040"
         ]
        },
        {
         "id": "les-bac-math-phys-6-05",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "MAHDI-PHYS-055",
          "MAHDI-PHYS-040"
         ]
        },
        {
         "id": "les-bac-math-phys-6-06",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "MAHDI-PHYS-052",
          "MAHDI-PHYS-041"
         ]
        },
        {
         "id": "les-bac-math-phys-6-07",
         "type": "exercice",
         "title": "Exercice 4",
         "refs": [
          "MAHDI-PHYS-043",
          "MAHDI-PHYS-041"
         ]
        },
        {
         "id": "les-bac-math-phys-6-08",
         "type": "exercice",
         "title": "Exercice 5",
         "refs": [
          "MAHDI-PHYS-044",
          "MAHDI-PHYS-042"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-math-phys-7",
       "name": "Cinétique chimique",
       "items": [
        {
         "id": "les-bac-math-phys-7-01",
         "type": "cours",
         "title": "Avancement d'une réaction chimique",
         "refs": [
          "MAHDI-PHYS-010",
          "MAHDI-PHYS-020"
         ]
        },
        {
         "id": "les-bac-math-phys-7-02",
         "type": "cours",
         "title": "Vitesse d'une réaction chimique",
         "refs": [
          "MAHDI-PHYS-022",
          "MAHDI-PHYS-020"
         ]
        },
        {
         "id": "les-bac-math-phys-7-03",
         "type": "cours",
         "title": "Notion d'équilibre chimique et estérification",
         "refs": [
          "MAHDI-PHYS-019",
          "MAHDI-PHYS-021"
         ]
        },
        {
         "id": "les-bac-math-phys-7-04",
         "type": "cours",
         "title": "Loi d'action de masse",
         "refs": [
          "MAHDI-PHYS-018",
          "MAHDI-PHYS-021"
         ]
        },
        {
         "id": "les-bac-math-phys-7-05",
         "type": "exercice",
         "title": "Exercice 1 : cinétique chimique",
         "refs": [
          "MAHDI-PHYS-014",
          "MAHDI-PHYS-020"
         ]
        },
        {
         "id": "les-bac-math-phys-7-06",
         "type": "exercice",
         "title": "Exercice 2 : cinétique chimique",
         "refs": [
          "MAHDI-PHYS-012",
          "MAHDI-PHYS-020"
         ]
        },
        {
         "id": "les-bac-math-phys-7-07",
         "type": "exercice",
         "title": "Exercice 3 : cinétique chimique",
         "refs": [
          "MAHDI-PHYS-011",
          "MAHDI-PHYS-020"
         ]
        },
        {
         "id": "les-bac-math-phys-7-08",
         "type": "exercice",
         "title": "Exercice 4 : cinétique chimique",
         "refs": [
          "MAHDI-PHYS-013",
          "MAHDI-PHYS-020"
         ]
        },
        {
         "id": "les-bac-math-phys-7-09",
         "type": "exercice",
         "title": "Exercice 1 : équilibre chimique",
         "refs": [
          "MAHDI-PHYS-015",
          "MAHDI-PHYS-021"
         ]
        },
        {
         "id": "les-bac-math-phys-7-10",
         "type": "exercice",
         "title": "Exercice 2 : équilibre chimique",
         "refs": [
          "MAHDI-PHYS-016",
          "MAHDI-PHYS-021"
         ]
        },
        {
         "id": "les-bac-math-phys-7-11",
         "type": "exercice",
         "title": "Exercice 3 : équilibre chimique",
         "refs": [
          "MAHDI-PHYS-017",
          "MAHDI-PHYS-021"
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "subj-bac-math-sciences-de-la-vie-et-de-la-terre",
     "name": "Bac Math - SVT",
     "chapitres": [
      {
       "id": "ch-bac-math-svt-1",
       "name": "Chapitre 1 : La fonction reproductrice chez l'homme",
       "items": [
        {
         "id": "les-bac-math-svt-1-01",
         "type": "cours",
         "title": "La fonction reproductrice chez l'homme",
         "refs": [
          "MOHSSEN-SVT-018",
          "cours 1/cours 1 la fonction reproductrice chez  l_homme.pdf"
         ]
        },
        {
         "id": "les-bac-math-svt-1-02",
         "type": "cours",
         "title": "Fonctions des testicules",
         "refs": [
          "MOHSSEN-SVT-024",
          "MOHSSEN-SVT-023"
         ]
        },
        {
         "id": "les-bac-math-svt-1-03",
         "type": "cours",
         "title": "Contrôle de l'activité testiculaire",
         "refs": [
          "MOHSSEN-SVT-025",
          "MOHSSEN-SVT-026"
         ]
        },
        {
         "id": "les-bac-math-svt-1-04",
         "type": "exercice",
         "title": "Exercice typique homme",
         "refs": [
          "MOHSSEN-SVT-001",
          "MOHSSEN-SVT-002"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-math-svt-2",
       "name": "Chapitre 2 : La fonction reproductrice chez la femme",
       "items": [
        {
         "id": "les-bac-math-svt-1-05",
         "type": "cours",
         "title": "La fonction reproductrice chez la femme",
         "refs": [
          "MOHSSEN-SVT-027",
          "MOHSSEN-SVT-028"
         ]
        },
        {
         "id": "les-bac-math-svt-1-06",
         "type": "cours",
         "title": "L'appareil reproducteur de la femme",
         "refs": [
          "MOHSSEN-SVT-029",
          "cours 5/la fonction reproductrice chez la femme .pdf"
         ]
        },
        {
         "id": "les-bac-math-svt-1-07",
         "type": "cours",
         "title": "Cycles sexuels",
         "refs": [
          "MOHSSEN-SVT-032",
          "MOHSSEN-SVT-031"
         ]
        },
        {
         "id": "les-bac-math-svt-1-08",
         "type": "cours",
         "title": "Cycle ovarien hormonal",
         "refs": [
          "MOHSSEN-SVT-034",
          "MOHSSEN-SVT-033"
         ]
        },
        {
         "id": "les-bac-math-svt-1-09",
         "type": "exercice",
         "title": "Exercice typique femme",
         "refs": [
          "MOHSSEN-SVT-003",
          "MOHSSEN-SVT-004"
         ]
        },
        {
         "id": "les-bac-math-svt-1-10",
         "type": "cours",
         "title": "Régulation du cycle sexuel",
         "refs": [
          "MOHSSEN-SVT-036",
          "cours 8/L8 regulation du cycle sexul.pdf"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-math-svt-3",
       "name": "Chapitre 3 : La procréation",
       "items": [
        {
         "id": "les-bac-math-svt-1-11",
         "type": "cours",
         "title": "La procréation",
         "refs": [
          "MOHSSEN-SVT-038",
          "MOHSSEN-SVT-037"
         ]
        },
        {
         "id": "les-bac-math-svt-1-12",
         "type": "cours",
         "title": "Nidation et rôle du placenta",
         "refs": [
          "MOHSSEN-SVT-019",
          "cours 10/nidation et role du placenta .pdf"
         ]
        },
        {
         "id": "les-bac-math-svt-1-13",
         "type": "cours",
         "title": "Maîtrise de la procréation",
         "refs": [
          "MOHSSEN-SVT-022",
          "cours 11/L 11 maitrise de la procréation.pdf"
         ]
        },
        {
         "id": "les-bac-math-svt-1-14",
         "type": "exercice",
         "title": "Exercice typique procréation",
         "refs": [
          "MOHSSEN-SVT-005",
          "MOHSSEN-SVT-006"
         ]
        },
        {
         "id": "les-bac-math-svt-1-15",
         "type": "exercice",
         "title": "QCM : reproduction humaine et santé",
         "refs": [
          "MOHSSEN-SVT-008",
          "MOHSSEN-SVT-007"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-math-svt-4",
       "name": "Chapitre 4 : La génétique",
       "items": [
        {
         "id": "les-bac-math-svt-2-01",
         "type": "cours",
         "title": "Brassage de l'information génétique au cours de la reproduction sexuée",
         "refs": [
          "MOHSSEN-SVT-051",
          "MOHSSEN-SVT-050"
         ]
        },
        {
         "id": "les-bac-math-svt-2-02",
         "type": "cours",
         "title": "Rappels de génétique formelle et monohybridisme",
         "refs": [
          "MOHSSEN-SVT-041"
         ]
        },
        {
         "id": "les-bac-math-svt-2-03",
         "type": "cours",
         "title": "Deux gènes indépendants avec dominance absolue",
         "refs": [
          "MOHSSEN-SVT-044",
          "MOHSSEN-SVT-042",
          "MOHSSEN-SVT-043"
         ]
        },
        {
         "id": "les-bac-math-svt-2-04",
         "type": "cours",
         "title": "Deux gènes liés liaison partielle",
         "refs": [
          "MOHSSEN-SVT-046",
          "MOHSSEN-SVT-045",
          "MOHSSEN-SVT-047"
         ]
        },
        {
         "id": "les-bac-math-svt-2-05",
         "type": "cours",
         "title": "Deux gènes liés liaison totale",
         "refs": [
          "MOHSSEN-SVT-048",
          "MOHSSEN-SVT-049"
         ]
        },
        {
         "id": "les-bac-math-svt-2-06",
         "type": "exercice",
         "title": "Exercice : génétique des diploïdes",
         "refs": [
          "MOHSSEN-SVT-013",
          "MOHSSEN-SVT-014"
         ]
        },
        {
         "id": "les-bac-math-svt-2-07",
         "type": "exercice",
         "title": "Méthodologie génétique des diploïdes",
         "refs": [
          "MOHSSEN-SVT-015",
          "MOHSSEN-SVT-016"
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "subj-bac-math-philosophie",
     "name": "Bac Math - فلسفة",
     "chapitres": [
      {
       "id": "ch-bac-math-philo-1",
       "name": "محور الانية و الغيرية",
       "items": [
        {
         "id": "les-bac-math-philo-1-01",
         "type": "cours",
         "title": "تمهيد محور الإنية و الغيرية",
         "refs": [
          "WALID-PHILO-009",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-math-philo-1-02",
         "type": "cours",
         "title": "تعالي الانية على الغيرية",
         "refs": [
          "WALID-PHILO-008",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-math-philo-1-03",
         "type": "cours",
         "title": "الانية بما هي ذات واعية (ديكارت)",
         "refs": [
          "WALID-PHILO-001",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-math-philo-1-04",
         "type": "cours",
         "title": "في جدلية الانية و الغيرية",
         "refs": [
          "WALID-PHILO-011",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-math-philo-1-05",
         "type": "cours",
         "title": "الذات المتجسدة",
         "refs": [
          "WALID-PHILO-003",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-math-philo-1-06",
         "type": "cours",
         "title": "تاسيس انطولوجيا جديدة للجسد",
         "refs": [
          "WALID-PHILO-007",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-math-philo-1-07",
         "type": "cours",
         "title": "الوعي بما هو تشكل تاريخي",
         "refs": [
          "WALID-PHILO-005",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-math-philo-1-08",
         "type": "cours",
         "title": "الوعي بناء تاريخي (ماركس)",
         "refs": [
          "WALID-PHILO-006",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-math-philo-1-09",
         "type": "cours",
         "title": "جدلية الوعي و اللاوعي",
         "refs": [
          "WALID-PHILO-010",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-math-philo-1-10",
         "type": "cours",
         "title": "التكامل بين الوعي و الاوعي",
         "refs": [
          "WALID-PHILO-002",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-math-philo-1-11",
         "type": "cours",
         "title": "الغيرية كامنة في الذات",
         "refs": [
          "WALID-PHILO-004",
          "WALID-PHILO-012"
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "subj-bac-math-francais",
     "name": "Bac Math - Français",
     "chapitres": [
      {
       "id": "ch-bac-math-fr-1",
       "name": "Module 1 : Souvenirs et nostalgie",
       "items": [
        {
         "id": "les-bac-math-fr-1-01",
         "type": "cours",
         "title": "Vocabulaire",
         "refs": [
          "RAOUEDHA-FR-017",
          "RAOUEDHA-FR-018"
         ]
        },
        {
         "id": "les-bac-math-fr-1-02",
         "type": "cours",
         "title": "La cause et la conséquence",
         "refs": [
          "RAOUEDHA-FR-012",
          "RAOUEDHA-FR-013"
         ]
        },
        {
         "id": "les-bac-math-fr-1-03",
         "type": "exercice",
         "title": "Exercice cause et conséquence",
         "refs": [
          "RAOUEDHA-FR-010",
          "RAOUEDHA-FR-011"
         ]
        },
        {
         "id": "les-bac-math-fr-1-04",
         "type": "cours",
         "title": "Texte explicatif, texte argumentatif : quelle différence ?",
         "refs": [
          "RAOUEDHA-FR-019",
          "RAOUEDHA-FR-014"
         ]
        },
        {
         "id": "les-bac-math-fr-1-05",
         "type": "cours",
         "title": "Expression écrite : texte explicatif",
         "refs": [
          "RAOUEDHA-FR-020",
          "RAOUEDHA-FR-021"
         ]
        },
        {
         "id": "les-bac-math-fr-1-06",
         "type": "cours",
         "title": "Expression écrite : texte explicatif (application)",
         "refs": [
          "RAOUEDHA-FR-022",
          "RAOUEDHA-FR-023"
         ]
        },
        {
         "id": "les-bac-math-fr-1-07",
         "type": "cours",
         "title": "Étude de texte : lire et comprendre une question de compréhension",
         "refs": [
          "RAOUEDHA-FR-025",
          "RAOUEDHA-FR-024"
         ]
        },
        {
         "id": "les-bac-math-fr-1-08",
         "type": "cours",
         "title": "Répondre à une question portant sur les procédés d'écriture (application)",
         "refs": [
          "RAOUEDHA-FR-016",
          "RAOUEDHA-FR-015"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-math-fr-2",
       "name": "Module 2 : Histoire d'amour",
       "items": [
        {
         "id": "les-bac-math-fr-2-01",
         "type": "cours",
         "title": "Le but",
         "refs": [
          "RAOUEDHA-FR-007",
          "RAOUEDHA-FR-001"
         ]
        },
        {
         "id": "les-bac-math-fr-2-02",
         "type": "exercice",
         "title": "Le but : exercices",
         "refs": [
          "RAOUEDHA-FR-005",
          "RAOUEDHA-FR-006"
         ]
        },
        {
         "id": "les-bac-math-fr-2-03",
         "type": "cours",
         "title": "Étude de texte : répondre aux questions de compréhension",
         "refs": [
          "RAOUEDHA-FR-008",
          "RAOUEDHA-FR-009"
         ]
        },
        {
         "id": "les-bac-math-fr-2-04",
         "type": "cours",
         "title": "Expression écrite : le point de vue absolu",
         "refs": [
          "RAOUEDHA-FR-003",
          "RAOUEDHA-FR-002"
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "subj-bac-math-arabe",
     "name": "Bac Math - عربية",
     "chapitres": [
      {
       "id": "ch-bac-math-ar-1",
       "name": "محور 1 في التفكير العلمي",
       "items": [
        {
         "id": "les-bac-math-ar-1-01",
         "type": "cours",
         "title": "العوامل التي ساعدت العرب على الإبداع",
         "refs": [
          "NAJEH-AR-045"
         ]
        },
        {
         "id": "les-bac-math-ar-1-02",
         "type": "cours",
         "title": "المناهج العلمية وصفات العالم المسلم",
         "refs": [
          "NAJEH-AR-047"
         ]
        },
        {
         "id": "les-bac-math-ar-1-03",
         "type": "cours",
         "title": "العلوم العربية",
         "refs": [
          "NAJEH-AR-043"
         ]
        },
        {
         "id": "les-bac-math-ar-1-04",
         "type": "exercice",
         "title": "التدرب على فقرة حجاجية",
         "refs": [
          "NAJEH-AR-044"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-math-ar-2",
       "name": "محور 2 في الأدب والفن",
       "items": [
        {
         "id": "les-bac-math-ar-2-01",
         "type": "cours",
         "title": "الأدب والشعر",
         "refs": [
          "NAJEH-AR-048"
         ]
        },
        {
         "id": "les-bac-math-ar-2-02",
         "type": "cours",
         "title": "الأدب نثرا ونقدا",
         "refs": [
          "NAJEH-AR-049"
         ]
        },
        {
         "id": "les-bac-math-ar-2-03",
         "type": "cours",
         "title": "الفن",
         "refs": [
          "NAJEH-AR-050"
         ]
        },
        {
         "id": "les-bac-math-ar-2-04",
         "type": "cours",
         "title": "الاجابة على أهم الأسئلة",
         "refs": [
          "NAJEH-AR-051"
         ]
        },
        {
         "id": "les-bac-math-ar-2-05",
         "type": "exercice",
         "title": "اصلاح فرض حول محور الأدب والفن",
         "refs": [
          "NAJEH-AR-052"
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "subj-bac-math-anglais",
     "name": "Bac Math - Anglais",
     "chapitres": []
    },
    {
     "id": "subj-bac-math-italien",
     "name": "Bac Math - Italien",
     "chapitres": []
    },
    {
     "id": "subj-bac-math-informatique",
     "name": "Bac Math - Informatique",
     "chapitres": []
    },
    {
     "id": "subj-bac-math-chinois",
     "name": "Bac Math - Chinois",
     "chapitres": []
    },
    {
     "id": "subj-bac-math-dessin",
     "name": "Bac Math - Dessin",
     "chapitres": []
    },
    {
     "id": "subj-bac-math-musique",
     "name": "Bac Math - Musique",
     "chapitres": []
    },
    {
     "id": "subj-bac-math-portugais",
     "name": "Bac Math - Portugais",
     "chapitres": []
    },
    {
     "id": "subj-bac-math-russe",
     "name": "Bac Math - Russe",
     "chapitres": []
    },
    {
     "id": "subj-bac-math-turc",
     "name": "Bac Math - Turc",
     "chapitres": []
    },
    {
     "id": "subj-bac-math-allemand",
     "name": "Bac Math - Allemand",
     "chapitres": []
    },
    {
     "id": "subj-bac-math-espagnol",
     "name": "Bac Math - Espagnol",
     "chapitres": []
    },
    {
     "id": "subj-bac-math-mae-wael",
     "name": "Bac Math - مع وائل",
     "chapitres": []
    }
   ]
  },
  {
   "id": "y-bac-sci",
   "name": "باك — علوم تجريبية",
   "matieres": [
    {
     "id": "subj-bac-sci-sciences-de-la-vie-et-de-la-terre",
     "name": "Bac Sciences - SVT",
     "chapitres": [
      {
       "id": "ch-bac-sci-svt-1",
       "name": "Chapitre 1 : La fonction reproductrice chez l'homme",
       "items": [
        {
         "id": "les-bac-sci-svt-1-01",
         "type": "cours",
         "title": "La fonction reproductrice chez l'homme",
         "refs": [
          "MOHSSEN-SVT-018",
          "cours 1/cours 1 la fonction reproductrice chez  l_homme.pdf"
         ]
        },
        {
         "id": "les-bac-sci-svt-1-02",
         "type": "cours",
         "title": "Fonctions des testicules",
         "refs": [
          "MOHSSEN-SVT-024",
          "MOHSSEN-SVT-023"
         ]
        },
        {
         "id": "les-bac-sci-svt-1-03",
         "type": "cours",
         "title": "Contrôle de l'activité testiculaire",
         "refs": [
          "MOHSSEN-SVT-025",
          "MOHSSEN-SVT-026"
         ]
        },
        {
         "id": "les-bac-sci-svt-1-04",
         "type": "exercice",
         "title": "Exercice typique homme",
         "refs": [
          "MOHSSEN-SVT-001",
          "MOHSSEN-SVT-002"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-sci-svt-2",
       "name": "Chapitre 2 : La fonction reproductrice chez la femme",
       "items": [
        {
         "id": "les-bac-sci-svt-1-05",
         "type": "cours",
         "title": "La fonction reproductrice chez la femme",
         "refs": [
          "MOHSSEN-SVT-027",
          "MOHSSEN-SVT-028"
         ]
        },
        {
         "id": "les-bac-sci-svt-1-06",
         "type": "cours",
         "title": "L'appareil reproducteur de la femme",
         "refs": [
          "MOHSSEN-SVT-029",
          "cours 5/la fonction reproductrice chez la femme .pdf"
         ]
        },
        {
         "id": "les-bac-sci-svt-1-07",
         "type": "cours",
         "title": "Cycles sexuels",
         "refs": [
          "MOHSSEN-SVT-032",
          "MOHSSEN-SVT-031"
         ]
        },
        {
         "id": "les-bac-sci-svt-1-08",
         "type": "cours",
         "title": "Cycle ovarien hormonal",
         "refs": [
          "MOHSSEN-SVT-034",
          "MOHSSEN-SVT-033"
         ]
        },
        {
         "id": "les-bac-sci-svt-1-09",
         "type": "exercice",
         "title": "Exercice typique femme",
         "refs": [
          "MOHSSEN-SVT-003",
          "MOHSSEN-SVT-004"
         ]
        },
        {
         "id": "les-bac-sci-svt-1-10",
         "type": "cours",
         "title": "Régulation du cycle sexuel",
         "refs": [
          "MOHSSEN-SVT-036",
          "cours 8/L8 regulation du cycle sexul.pdf"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-sci-svt-3",
       "name": "Chapitre 3 : La procréation",
       "items": [
        {
         "id": "les-bac-sci-svt-1-11",
         "type": "cours",
         "title": "La procréation",
         "refs": [
          "MOHSSEN-SVT-038",
          "MOHSSEN-SVT-037"
         ]
        },
        {
         "id": "les-bac-sci-svt-1-12",
         "type": "cours",
         "title": "Nidation et rôle du placenta",
         "refs": [
          "MOHSSEN-SVT-019",
          "cours 10/nidation et role du placenta .pdf"
         ]
        },
        {
         "id": "les-bac-sci-svt-1-13",
         "type": "cours",
         "title": "Maîtrise de la procréation",
         "refs": [
          "MOHSSEN-SVT-022",
          "cours 11/L 11 maitrise de la procréation.pdf"
         ]
        },
        {
         "id": "les-bac-sci-svt-1-14",
         "type": "exercice",
         "title": "Exercice typique procréation",
         "refs": [
          "MOHSSEN-SVT-005",
          "MOHSSEN-SVT-006"
         ]
        },
        {
         "id": "les-bac-sci-svt-1-15",
         "type": "exercice",
         "title": "QCM : reproduction humaine et santé",
         "refs": [
          "MOHSSEN-SVT-008",
          "MOHSSEN-SVT-007"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-sci-svt-4",
       "name": "Chapitre 4 : La génétique",
       "items": [
        {
         "id": "les-bac-sci-svt-2-01",
         "type": "cours",
         "title": "Brassage de l'information génétique au cours de la reproduction sexuée",
         "refs": [
          "MOHSSEN-SVT-051",
          "MOHSSEN-SVT-050"
         ]
        },
        {
         "id": "les-bac-sci-svt-2-02",
         "type": "cours",
         "title": "Rappels de génétique formelle et monohybridisme",
         "refs": [
          "MOHSSEN-SVT-041"
         ]
        },
        {
         "id": "les-bac-sci-svt-2-03",
         "type": "cours",
         "title": "Deux gènes indépendants avec dominance absolue",
         "refs": [
          "MOHSSEN-SVT-044",
          "MOHSSEN-SVT-042",
          "MOHSSEN-SVT-043"
         ]
        },
        {
         "id": "les-bac-sci-svt-2-04",
         "type": "cours",
         "title": "Deux gènes liés liaison partielle",
         "refs": [
          "MOHSSEN-SVT-046",
          "MOHSSEN-SVT-045",
          "MOHSSEN-SVT-047"
         ]
        },
        {
         "id": "les-bac-sci-svt-2-05",
         "type": "cours",
         "title": "Deux gènes liés liaison totale",
         "refs": [
          "MOHSSEN-SVT-048",
          "MOHSSEN-SVT-049"
         ]
        },
        {
         "id": "les-bac-sci-svt-2-06",
         "type": "exercice",
         "title": "Exercice : génétique des diploïdes",
         "refs": [
          "MOHSSEN-SVT-013",
          "MOHSSEN-SVT-014"
         ]
        },
        {
         "id": "les-bac-sci-svt-2-07",
         "type": "exercice",
         "title": "Méthodologie génétique des diploïdes",
         "refs": [
          "MOHSSEN-SVT-015",
          "MOHSSEN-SVT-016"
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "subj-bac-sci-sciences-physiques",
     "name": "Bac Sciences - Physique",
     "chapitres": [
      {
       "id": "ch-bac-sci-phys-1",
       "name": "Le condensateur",
       "items": [
        {
         "id": "les-bac-sci-phys-1-01",
         "type": "cours",
         "title": "Étude expérimentale",
         "refs": [
          "MAHDI-PHYS-026",
          "MAHDI-PHYS-023"
         ]
        },
        {
         "id": "les-bac-sci-phys-1-02",
         "type": "cours",
         "title": "Étude théorique",
         "refs": [
          "MAHDI-PHYS-029",
          "MAHDI-PHYS-023"
         ]
        },
        {
         "id": "les-bac-sci-phys-1-03",
         "type": "exercice",
         "title": "Exercice 1",
         "refs": [
          "MAHDI-PHYS-024",
          "MAHDI-PHYS-030"
         ]
        },
        {
         "id": "les-bac-sci-phys-1-04",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "MAHDI-PHYS-025",
          "MAHDI-PHYS-030"
         ]
        },
        {
         "id": "les-bac-sci-phys-1-05",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "MAHDI-PHYS-027",
          "MAHDI-PHYS-030"
         ]
        },
        {
         "id": "les-bac-sci-phys-1-06",
         "type": "exercice",
         "title": "Exercice 4",
         "refs": [
          "MAHDI-PHYS-028",
          "MAHDI-PHYS-030"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-sci-phys-2",
       "name": "RC",
       "items": [
        {
         "id": "les-bac-sci-phys-2-01",
         "type": "cours",
         "title": "Dipôle RC : étude expérimentale",
         "refs": [
          "MAHDI-PHYS-066",
          "MAHDI-PHYS-063",
          "MAHDI-PHYS-064"
         ]
        },
        {
         "id": "les-bac-sci-phys-2-02",
         "type": "cours",
         "title": "Dipôle RC : étude théorique",
         "refs": [
          "MAHDI-PHYS-065",
          "MAHDI-PHYS-063",
          "MAHDI-PHYS-064"
         ]
        },
        {
         "id": "les-bac-sci-phys-2-03",
         "type": "exercice",
         "title": "Exercice 1",
         "refs": [
          "MAHDI-PHYS-057",
          "MAHDI-PHYS-069"
         ]
        },
        {
         "id": "les-bac-sci-phys-2-04",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "MAHDI-PHYS-058",
          "MAHDI-PHYS-069"
         ]
        },
        {
         "id": "les-bac-sci-phys-2-05",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "MAHDI-PHYS-059",
          "MAHDI-PHYS-067"
         ]
        },
        {
         "id": "les-bac-sci-phys-2-06",
         "type": "exercice",
         "title": "Exercice 4",
         "refs": [
          "MAHDI-PHYS-060",
          "MAHDI-PHYS-067"
         ]
        },
        {
         "id": "les-bac-sci-phys-2-07",
         "type": "exercice",
         "title": "Exercice 5",
         "refs": [
          "MAHDI-PHYS-061",
          "MAHDI-PHYS-068"
         ]
        },
        {
         "id": "les-bac-sci-phys-2-08",
         "type": "exercice",
         "title": "Exercice 6",
         "refs": [
          "MAHDI-PHYS-062",
          "MAHDI-PHYS-068"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-sci-phys-3",
       "name": "La bobine",
       "items": [
        {
         "id": "les-bac-sci-phys-3-01",
         "type": "cours",
         "title": "Bobine",
         "refs": [
          "MAHDI-PHYS-009",
          "MAHDI-PHYS-005",
          "MAHDI-PHYS-006"
         ]
        },
        {
         "id": "les-bac-sci-phys-3-02",
         "type": "exercice",
         "title": "Exercice 1",
         "refs": [
          "MAHDI-PHYS-007",
          "MAHDI-PHYS-003"
         ]
        },
        {
         "id": "les-bac-sci-phys-3-03",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "MAHDI-PHYS-008",
          "MAHDI-PHYS-003"
         ]
        },
        {
         "id": "les-bac-sci-phys-3-04",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "MAHDI-PHYS-002",
          "MAHDI-PHYS-004"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-sci-phys-4",
       "name": "RL",
       "items": [
        {
         "id": "les-bac-sci-phys-4-01",
         "type": "cours",
         "title": "Dipôle RL : étude expérimentale",
         "refs": [
          "MAHDI-PHYS-081",
          "MAHDI-PHYS-084"
         ]
        },
        {
         "id": "les-bac-sci-phys-4-02",
         "type": "cours",
         "title": "Dipôle RL : étude théorique",
         "refs": [
          "MAHDI-PHYS-080",
          "MAHDI-PHYS-084"
         ]
        },
        {
         "id": "les-bac-sci-phys-4-03",
         "type": "exercice",
         "title": "Exercice 1",
         "refs": [
          "MAHDI-PHYS-075",
          "MAHDI-PHYS-073"
         ]
        },
        {
         "id": "les-bac-sci-phys-4-04",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "MAHDI-PHYS-074",
          "MAHDI-PHYS-073"
         ]
        },
        {
         "id": "les-bac-sci-phys-4-05",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "MAHDI-PHYS-076",
          "MAHDI-PHYS-070"
         ]
        },
        {
         "id": "les-bac-sci-phys-4-06",
         "type": "exercice",
         "title": "Exercice 4",
         "refs": [
          "MAHDI-PHYS-077",
          "MAHDI-PHYS-071"
         ]
        },
        {
         "id": "les-bac-sci-phys-4-07",
         "type": "exercice",
         "title": "Exercice 5",
         "refs": [
          "MAHDI-PHYS-078",
          "MAHDI-PHYS-072"
         ]
        },
        {
         "id": "les-bac-sci-phys-4-08",
         "type": "exercice",
         "title": "Exercice 6",
         "refs": [
          "MAHDI-PHYS-079",
          "MAHDI-PHYS-072"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-sci-phys-5",
       "name": "Oscillations libres amorties",
       "items": [
        {
         "id": "les-bac-sci-phys-5-01",
         "type": "cours",
         "title": "Oscillations amorties libres : étude expérimentale",
         "refs": [
          "MAHDI-PHYS-033",
          "MAHDI-PHYS-038"
         ]
        },
        {
         "id": "les-bac-sci-phys-5-02",
         "type": "cours",
         "title": "Oscillations amorties libres : étude théorique",
         "refs": [
          "MAHDI-PHYS-037",
          "MAHDI-PHYS-038"
         ]
        },
        {
         "id": "les-bac-sci-phys-5-03",
         "type": "exercice",
         "title": "Exercice 1",
         "refs": [
          "MAHDI-PHYS-034",
          "MAHDI-PHYS-031"
         ]
        },
        {
         "id": "les-bac-sci-phys-5-04",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "MAHDI-PHYS-035",
          "MAHDI-PHYS-032"
         ]
        },
        {
         "id": "les-bac-sci-phys-5-05",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "MAHDI-PHYS-036",
          "MAHDI-PHYS-032"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-sci-phys-6",
       "name": "Oscillations électriques libres non amorties",
       "items": [
        {
         "id": "les-bac-sci-phys-6-01",
         "type": "cours",
         "title": "Oscillations non amorties : étude expérimentale",
         "refs": [
          "MAHDI-PHYS-054",
          "MAHDI-PHYS-039"
         ]
        },
        {
         "id": "les-bac-sci-phys-6-02",
         "type": "cours",
         "title": "Oscillations non amorties : étude théorique (partie 1)",
         "refs": [
          "MAHDI-PHYS-050",
          "MAHDI-PHYS-039"
         ]
        },
        {
         "id": "les-bac-sci-phys-6-03",
         "type": "cours",
         "title": "Oscillations non amorties : étude théorique (partie 2)",
         "refs": [
          "MAHDI-PHYS-053",
          "MAHDI-PHYS-039"
         ]
        },
        {
         "id": "les-bac-sci-phys-6-04",
         "type": "exercice",
         "title": "Exercice 1",
         "refs": [
          "MAHDI-PHYS-051",
          "MAHDI-PHYS-040"
         ]
        },
        {
         "id": "les-bac-sci-phys-6-05",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "MAHDI-PHYS-055",
          "MAHDI-PHYS-040"
         ]
        },
        {
         "id": "les-bac-sci-phys-6-06",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "MAHDI-PHYS-052",
          "MAHDI-PHYS-041"
         ]
        },
        {
         "id": "les-bac-sci-phys-6-07",
         "type": "exercice",
         "title": "Exercice 4",
         "refs": [
          "MAHDI-PHYS-043",
          "MAHDI-PHYS-041"
         ]
        },
        {
         "id": "les-bac-sci-phys-6-08",
         "type": "exercice",
         "title": "Exercice 5",
         "refs": [
          "MAHDI-PHYS-044",
          "MAHDI-PHYS-042"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-sci-phys-7",
       "name": "Cinétique chimique",
       "items": [
        {
         "id": "les-bac-sci-phys-7-01",
         "type": "cours",
         "title": "Avancement d'une réaction chimique",
         "refs": [
          "MAHDI-PHYS-010",
          "MAHDI-PHYS-020"
         ]
        },
        {
         "id": "les-bac-sci-phys-7-02",
         "type": "cours",
         "title": "Vitesse d'une réaction chimique",
         "refs": [
          "MAHDI-PHYS-022",
          "MAHDI-PHYS-020"
         ]
        },
        {
         "id": "les-bac-sci-phys-7-03",
         "type": "cours",
         "title": "Notion d'équilibre chimique et estérification",
         "refs": [
          "MAHDI-PHYS-019",
          "MAHDI-PHYS-021"
         ]
        },
        {
         "id": "les-bac-sci-phys-7-04",
         "type": "cours",
         "title": "Loi d'action de masse",
         "refs": [
          "MAHDI-PHYS-018",
          "MAHDI-PHYS-021"
         ]
        },
        {
         "id": "les-bac-sci-phys-7-05",
         "type": "exercice",
         "title": "Exercice 1 : cinétique chimique",
         "refs": [
          "MAHDI-PHYS-014",
          "MAHDI-PHYS-020"
         ]
        },
        {
         "id": "les-bac-sci-phys-7-06",
         "type": "exercice",
         "title": "Exercice 2 : cinétique chimique",
         "refs": [
          "MAHDI-PHYS-012",
          "MAHDI-PHYS-020"
         ]
        },
        {
         "id": "les-bac-sci-phys-7-07",
         "type": "exercice",
         "title": "Exercice 3 : cinétique chimique",
         "refs": [
          "MAHDI-PHYS-011",
          "MAHDI-PHYS-020"
         ]
        },
        {
         "id": "les-bac-sci-phys-7-08",
         "type": "exercice",
         "title": "Exercice 4 : cinétique chimique",
         "refs": [
          "MAHDI-PHYS-013",
          "MAHDI-PHYS-020"
         ]
        },
        {
         "id": "les-bac-sci-phys-7-09",
         "type": "exercice",
         "title": "Exercice 1 : équilibre chimique",
         "refs": [
          "MAHDI-PHYS-015",
          "MAHDI-PHYS-021"
         ]
        },
        {
         "id": "les-bac-sci-phys-7-10",
         "type": "exercice",
         "title": "Exercice 2 : équilibre chimique",
         "refs": [
          "MAHDI-PHYS-016",
          "MAHDI-PHYS-021"
         ]
        },
        {
         "id": "les-bac-sci-phys-7-11",
         "type": "exercice",
         "title": "Exercice 3 : équilibre chimique",
         "refs": [
          "MAHDI-PHYS-017",
          "MAHDI-PHYS-021"
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "subj-bac-sci-mathematiques",
     "name": "Bac Sciences - Maths",
     "chapitres": []
    },
    {
     "id": "subj-bac-sci-philosophie",
     "name": "Bac Sciences - فلسفة",
     "chapitres": [
      {
       "id": "ch-bac-sci-philo-1",
       "name": "محور الانية و الغيرية",
       "items": [
        {
         "id": "les-bac-sci-philo-1-01",
         "type": "cours",
         "title": "تمهيد محور الإنية و الغيرية",
         "refs": [
          "WALID-PHILO-009",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-sci-philo-1-02",
         "type": "cours",
         "title": "تعالي الانية على الغيرية",
         "refs": [
          "WALID-PHILO-008",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-sci-philo-1-03",
         "type": "cours",
         "title": "الانية بما هي ذات واعية (ديكارت)",
         "refs": [
          "WALID-PHILO-001",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-sci-philo-1-04",
         "type": "cours",
         "title": "في جدلية الانية و الغيرية",
         "refs": [
          "WALID-PHILO-011",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-sci-philo-1-05",
         "type": "cours",
         "title": "الذات المتجسدة",
         "refs": [
          "WALID-PHILO-003",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-sci-philo-1-06",
         "type": "cours",
         "title": "تاسيس انطولوجيا جديدة للجسد",
         "refs": [
          "WALID-PHILO-007",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-sci-philo-1-07",
         "type": "cours",
         "title": "الوعي بما هو تشكل تاريخي",
         "refs": [
          "WALID-PHILO-005",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-sci-philo-1-08",
         "type": "cours",
         "title": "الوعي بناء تاريخي (ماركس)",
         "refs": [
          "WALID-PHILO-006",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-sci-philo-1-09",
         "type": "cours",
         "title": "جدلية الوعي و اللاوعي",
         "refs": [
          "WALID-PHILO-010",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-sci-philo-1-10",
         "type": "cours",
         "title": "التكامل بين الوعي و الاوعي",
         "refs": [
          "WALID-PHILO-002",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-sci-philo-1-11",
         "type": "cours",
         "title": "الغيرية كامنة في الذات",
         "refs": [
          "WALID-PHILO-004",
          "WALID-PHILO-012"
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "subj-bac-sci-francais",
     "name": "Bac Sciences - Français",
     "chapitres": [
      {
       "id": "ch-bac-sci-fr-1",
       "name": "Module 1 : Souvenirs et nostalgie",
       "items": [
        {
         "id": "les-bac-sci-fr-1-01",
         "type": "cours",
         "title": "Vocabulaire",
         "refs": [
          "RAOUEDHA-FR-017",
          "RAOUEDHA-FR-018"
         ]
        },
        {
         "id": "les-bac-sci-fr-1-02",
         "type": "cours",
         "title": "La cause et la conséquence",
         "refs": [
          "RAOUEDHA-FR-012",
          "RAOUEDHA-FR-013"
         ]
        },
        {
         "id": "les-bac-sci-fr-1-03",
         "type": "exercice",
         "title": "Exercice cause et conséquence",
         "refs": [
          "RAOUEDHA-FR-010",
          "RAOUEDHA-FR-011"
         ]
        },
        {
         "id": "les-bac-sci-fr-1-04",
         "type": "cours",
         "title": "Texte explicatif, texte argumentatif : quelle différence ?",
         "refs": [
          "RAOUEDHA-FR-019",
          "RAOUEDHA-FR-014"
         ]
        },
        {
         "id": "les-bac-sci-fr-1-05",
         "type": "cours",
         "title": "Expression écrite : texte explicatif",
         "refs": [
          "RAOUEDHA-FR-020",
          "RAOUEDHA-FR-021"
         ]
        },
        {
         "id": "les-bac-sci-fr-1-06",
         "type": "cours",
         "title": "Expression écrite : texte explicatif (application)",
         "refs": [
          "RAOUEDHA-FR-022",
          "RAOUEDHA-FR-023"
         ]
        },
        {
         "id": "les-bac-sci-fr-1-07",
         "type": "cours",
         "title": "Étude de texte : lire et comprendre une question de compréhension",
         "refs": [
          "RAOUEDHA-FR-025",
          "RAOUEDHA-FR-024"
         ]
        },
        {
         "id": "les-bac-sci-fr-1-08",
         "type": "cours",
         "title": "Répondre à une question portant sur les procédés d'écriture (application)",
         "refs": [
          "RAOUEDHA-FR-016",
          "RAOUEDHA-FR-015"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-sci-fr-2",
       "name": "Module 2 : Histoire d'amour",
       "items": [
        {
         "id": "les-bac-sci-fr-2-01",
         "type": "cours",
         "title": "Le but",
         "refs": [
          "RAOUEDHA-FR-007",
          "RAOUEDHA-FR-001"
         ]
        },
        {
         "id": "les-bac-sci-fr-2-02",
         "type": "exercice",
         "title": "Le but : exercices",
         "refs": [
          "RAOUEDHA-FR-005",
          "RAOUEDHA-FR-006"
         ]
        },
        {
         "id": "les-bac-sci-fr-2-03",
         "type": "cours",
         "title": "Étude de texte : répondre aux questions de compréhension",
         "refs": [
          "RAOUEDHA-FR-008",
          "RAOUEDHA-FR-009"
         ]
        },
        {
         "id": "les-bac-sci-fr-2-04",
         "type": "cours",
         "title": "Expression écrite : le point de vue absolu",
         "refs": [
          "RAOUEDHA-FR-003",
          "RAOUEDHA-FR-002"
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "subj-bac-sci-arabe",
     "name": "Bac Sciences - عربية",
     "chapitres": [
      {
       "id": "ch-bac-sci-ar-1",
       "name": "محور 1 في التفكير العلمي",
       "items": [
        {
         "id": "les-bac-sci-ar-1-01",
         "type": "cours",
         "title": "العوامل التي ساعدت العرب على الإبداع",
         "refs": [
          "NAJEH-AR-045",
          "NAJEH-AR-046"
         ]
        },
        {
         "id": "les-bac-sci-ar-1-02",
         "type": "cours",
         "title": "المناهج العلمية وصفات العالم المسلم",
         "refs": [
          "NAJEH-AR-047",
          "NAJEH-AR-046"
         ]
        },
        {
         "id": "les-bac-sci-ar-1-03",
         "type": "cours",
         "title": "العلوم العربية",
         "refs": [
          "NAJEH-AR-043",
          "NAJEH-AR-046"
         ]
        },
        {
         "id": "les-bac-sci-ar-1-04",
         "type": "exercice",
         "title": "التدرب على فقرة حجاجية",
         "refs": [
          "NAJEH-AR-044",
          "NAJEH-AR-046"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-sci-ar-2",
       "name": "محور 2 في الأدب والفن",
       "items": [
        {
         "id": "les-bac-sci-ar-2-01",
         "type": "cours",
         "title": "الأدب والشعر",
         "refs": [
          "NAJEH-AR-048",
          "NAJEH-AR-053"
         ]
        },
        {
         "id": "les-bac-sci-ar-2-02",
         "type": "cours",
         "title": "الأدب نثرا ونقدا",
         "refs": [
          "NAJEH-AR-049",
          "NAJEH-AR-053"
         ]
        },
        {
         "id": "les-bac-sci-ar-2-03",
         "type": "cours",
         "title": "الفن",
         "refs": [
          "NAJEH-AR-050",
          "NAJEH-AR-053"
         ]
        },
        {
         "id": "les-bac-sci-ar-2-04",
         "type": "cours",
         "title": "الاجابة على أهم الأسئلة",
         "refs": [
          "NAJEH-AR-051",
          "NAJEH-AR-053"
         ]
        },
        {
         "id": "les-bac-sci-ar-2-05",
         "type": "exercice",
         "title": "اصلاح فرض حول محور الأدب والفن",
         "refs": [
          "NAJEH-AR-052",
          "NAJEH-AR-053"
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "subj-bac-sci-anglais",
     "name": "Bac Sciences - Anglais",
     "chapitres": []
    },
    {
     "id": "subj-bac-sci-informatique",
     "name": "Bac Sciences - Informatique",
     "chapitres": []
    },
    {
     "id": "subj-bac-sci-espagnol",
     "name": "Bac Sciences - Espagnol",
     "chapitres": []
    },
    {
     "id": "subj-bac-sci-chinois",
     "name": "Bac Sciences - Chinois",
     "chapitres": []
    },
    {
     "id": "subj-bac-sci-dessin",
     "name": "Bac Sciences - Dessin",
     "chapitres": []
    },
    {
     "id": "subj-bac-sci-musique",
     "name": "Bac Sciences - Musique",
     "chapitres": []
    },
    {
     "id": "subj-bac-sci-portugais",
     "name": "Bac Sciences - Portugais",
     "chapitres": []
    },
    {
     "id": "subj-bac-sci-russe",
     "name": "Bac Sciences - Russe",
     "chapitres": []
    },
    {
     "id": "subj-bac-sci-turc",
     "name": "Bac Sciences - Turc",
     "chapitres": []
    },
    {
     "id": "subj-bac-sci-allemand",
     "name": "Bac Sciences - Allemand",
     "chapitres": []
    },
    {
     "id": "subj-bac-sci-italien",
     "name": "Bac Sciences - Italien",
     "chapitres": []
    },
    {
     "id": "subj-bac-sci-mae-wael",
     "name": "Bac Sciences - مع وائل",
     "chapitres": []
    }
   ]
  },
  {
   "id": "y-bac-eco",
   "name": "باك — اقتصاد وتصرّف",
   "matieres": [
    {
     "id": "subj-bac-eco-economie",
     "name": "Bac Éco - Économie",
     "chapitres": [
      {
       "id": "ch-bac-eco-eco-1",
       "name": "Le comportement et l'équilibre du consommateur",
       "items": [
        {
         "id": "les-bac-eco-eco-1-01",
         "type": "cours",
         "title": "L'utilité totale et l'utilité marginale",
         "refs": [
          "ELINE-ECO-009",
          "ELINE-ECO-006"
         ]
        },
        {
         "id": "les-bac-eco-eco-1-02",
         "type": "cours",
         "title": "La contrainte budgétaire",
         "refs": [
          "ELINE-ECO-010",
          "ELINE-ECO-007"
         ]
        },
        {
         "id": "les-bac-eco-eco-1-03",
         "type": "cours",
         "title": "L'équilibre du consommateur",
         "refs": [
          "ELINE-ECO-003",
          "ELINE-ECO-002"
         ]
        },
        {
         "id": "les-bac-eco-eco-1-04",
         "type": "cours",
         "title": "Fonction de la demande",
         "refs": [
          "ELINE-ECO-031",
          "ELINE-ECO-030"
         ]
        },
        {
         "id": "les-bac-eco-eco-1-05",
         "type": "cours",
         "title": "Choix citoyen du consommateur",
         "refs": [
          "ELINE-ECO-001",
          "ELINE-ECO-008"
         ]
        },
        {
         "id": "les-bac-eco-eco-1-06",
         "type": "cours",
         "title": "Méthodologie de la dissertation économique",
         "refs": [
          "ELINE-ECO-005",
          "ELINE-ECO-004"
         ]
        },
        {
         "id": "les-bac-eco-eco-1-07",
         "type": "exercice",
         "title": "Problème (partie 1)",
         "refs": [
          "ELINE-ECO-038",
          "ELINE-ECO-024"
         ]
        },
        {
         "id": "les-bac-eco-eco-1-08",
         "type": "exercice",
         "title": "Problème (partie 2)",
         "refs": [
          "ELINE-ECO-035"
         ]
        },
        {
         "id": "les-bac-eco-eco-1-09",
         "type": "exercice",
         "title": "Problème (partie 3)",
         "refs": [
          "ELINE-ECO-036",
          "ELINE-ECO-023"
         ]
        },
        {
         "id": "les-bac-eco-eco-1-10",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "ELINE-ECO-027",
          "ELINE-ECO-025"
         ]
        },
        {
         "id": "les-bac-eco-eco-1-11",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "ELINE-ECO-028",
          "ELINE-ECO-029",
          "ELINE-ECO-032"
         ]
        },
        {
         "id": "les-bac-eco-eco-1-12",
         "type": "exercice",
         "title": "Exercice 4",
         "refs": [
          "ELINE-ECO-020",
          "ELINE-ECO-021"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-eco-eco-2",
       "name": "Le comportement et l'équilibre du producteur",
       "items": [
        {
         "id": "les-bac-eco-eco-2-01",
         "type": "cours",
         "title": "La fonction de production (partie 1)",
         "refs": [
          "ELINE-ECO-018",
          "ELINE-ECO-015"
         ]
        },
        {
         "id": "les-bac-eco-eco-2-02",
         "type": "cours",
         "title": "La fonction de production (partie 2)",
         "refs": [
          "ELINE-ECO-017",
          "ELINE-ECO-016"
         ]
        },
        {
         "id": "les-bac-eco-eco-2-03",
         "type": "cours",
         "title": "Contrainte budgétaire du producteur",
         "refs": [
          "ELINE-ECO-013",
          "ELINE-ECO-014"
         ]
        },
        {
         "id": "les-bac-eco-eco-2-04",
         "type": "cours",
         "title": "Le choix citoyen du producteur",
         "refs": [
          "ELINE-ECO-012",
          "ELINE-ECO-019"
         ]
        },
        {
         "id": "les-bac-eco-eco-2-05",
         "type": "exercice",
         "title": "Exercice 1",
         "refs": [
          "ELINE-ECO-039",
          "ELINE-ECO-044"
         ]
        },
        {
         "id": "les-bac-eco-eco-2-06",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "ELINE-ECO-049",
          "ELINE-ECO-047",
          "ELINE-ECO-055"
         ]
        },
        {
         "id": "les-bac-eco-eco-2-07",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "ELINE-ECO-054",
          "ELINE-ECO-053"
         ]
        },
        {
         "id": "les-bac-eco-eco-2-08",
         "type": "exercice",
         "title": "Exercice 4",
         "refs": [
          "ELINE-ECO-040",
          "ELINE-ECO-043"
         ]
        },
        {
         "id": "les-bac-eco-eco-2-09",
         "type": "exercice",
         "title": "Exercice 5",
         "refs": [
          "ELINE-ECO-041",
          "ELINE-ECO-042"
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "subj-bac-eco-gestion",
     "name": "Bac Éco - Gestion",
     "chapitres": []
    },
    {
     "id": "subj-bac-eco-mathematiques",
     "name": "Bac Éco - Maths",
     "chapitres": []
    },
    {
     "id": "subj-bac-eco-philosophie",
     "name": "Bac Éco - فلسفة",
     "chapitres": [
      {
       "id": "ch-bac-eco-philo-1",
       "name": "محور الانية و الغيرية",
       "items": [
        {
         "id": "les-bac-eco-philo-1-01",
         "type": "cours",
         "title": "تمهيد محور الإنية و الغيرية",
         "refs": [
          "WALID-PHILO-009",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-eco-philo-1-02",
         "type": "cours",
         "title": "تعالي الانية على الغيرية",
         "refs": [
          "WALID-PHILO-008",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-eco-philo-1-03",
         "type": "cours",
         "title": "الانية بما هي ذات واعية (ديكارت)",
         "refs": [
          "WALID-PHILO-001",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-eco-philo-1-04",
         "type": "cours",
         "title": "في جدلية الانية و الغيرية",
         "refs": [
          "WALID-PHILO-011",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-eco-philo-1-05",
         "type": "cours",
         "title": "الذات المتجسدة",
         "refs": [
          "WALID-PHILO-003",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-eco-philo-1-06",
         "type": "cours",
         "title": "تاسيس انطولوجيا جديدة للجسد",
         "refs": [
          "WALID-PHILO-007",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-eco-philo-1-07",
         "type": "cours",
         "title": "الوعي بما هو تشكل تاريخي",
         "refs": [
          "WALID-PHILO-005",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-eco-philo-1-08",
         "type": "cours",
         "title": "الوعي بناء تاريخي (ماركس)",
         "refs": [
          "WALID-PHILO-006",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-eco-philo-1-09",
         "type": "cours",
         "title": "جدلية الوعي و اللاوعي",
         "refs": [
          "WALID-PHILO-010",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-eco-philo-1-10",
         "type": "cours",
         "title": "التكامل بين الوعي و الاوعي",
         "refs": [
          "WALID-PHILO-002",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-eco-philo-1-11",
         "type": "cours",
         "title": "الغيرية كامنة في الذات",
         "refs": [
          "WALID-PHILO-004",
          "WALID-PHILO-012"
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "subj-bac-eco-histoire",
     "name": "Bac Éco - تاريخ",
     "chapitres": []
    },
    {
     "id": "subj-bac-eco-francais",
     "name": "Bac Éco - Français",
     "chapitres": [
      {
       "id": "ch-bac-eco-fr-1",
       "name": "Module 1 : Souvenirs et nostalgie",
       "items": [
        {
         "id": "les-bac-eco-fr-1-01",
         "type": "cours",
         "title": "Vocabulaire",
         "refs": [
          "RAOUEDHA-FR-017",
          "RAOUEDHA-FR-018"
         ]
        },
        {
         "id": "les-bac-eco-fr-1-02",
         "type": "cours",
         "title": "La cause et la conséquence",
         "refs": [
          "RAOUEDHA-FR-012",
          "RAOUEDHA-FR-013"
         ]
        },
        {
         "id": "les-bac-eco-fr-1-03",
         "type": "exercice",
         "title": "Exercice cause et conséquence",
         "refs": [
          "RAOUEDHA-FR-010",
          "RAOUEDHA-FR-011"
         ]
        },
        {
         "id": "les-bac-eco-fr-1-04",
         "type": "cours",
         "title": "Texte explicatif, texte argumentatif : quelle différence ?",
         "refs": [
          "RAOUEDHA-FR-019",
          "RAOUEDHA-FR-014"
         ]
        },
        {
         "id": "les-bac-eco-fr-1-05",
         "type": "cours",
         "title": "Expression écrite : texte explicatif",
         "refs": [
          "RAOUEDHA-FR-020",
          "RAOUEDHA-FR-021"
         ]
        },
        {
         "id": "les-bac-eco-fr-1-06",
         "type": "cours",
         "title": "Expression écrite : texte explicatif (application)",
         "refs": [
          "RAOUEDHA-FR-022",
          "RAOUEDHA-FR-023"
         ]
        },
        {
         "id": "les-bac-eco-fr-1-07",
         "type": "cours",
         "title": "Étude de texte : lire et comprendre une question de compréhension",
         "refs": [
          "RAOUEDHA-FR-025",
          "RAOUEDHA-FR-024"
         ]
        },
        {
         "id": "les-bac-eco-fr-1-08",
         "type": "cours",
         "title": "Répondre à une question portant sur les procédés d'écriture (application)",
         "refs": [
          "RAOUEDHA-FR-016",
          "RAOUEDHA-FR-015"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-eco-fr-2",
       "name": "Module 2 : Histoire d'amour",
       "items": [
        {
         "id": "les-bac-eco-fr-2-01",
         "type": "cours",
         "title": "Le but",
         "refs": [
          "RAOUEDHA-FR-007",
          "RAOUEDHA-FR-001"
         ]
        },
        {
         "id": "les-bac-eco-fr-2-02",
         "type": "exercice",
         "title": "Le but : exercices",
         "refs": [
          "RAOUEDHA-FR-005",
          "RAOUEDHA-FR-006"
         ]
        },
        {
         "id": "les-bac-eco-fr-2-03",
         "type": "cours",
         "title": "Étude de texte : répondre aux questions de compréhension",
         "refs": [
          "RAOUEDHA-FR-008",
          "RAOUEDHA-FR-009"
         ]
        },
        {
         "id": "les-bac-eco-fr-2-04",
         "type": "cours",
         "title": "Expression écrite : le point de vue absolu",
         "refs": [
          "RAOUEDHA-FR-003",
          "RAOUEDHA-FR-002"
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "subj-bac-eco-arabe",
     "name": "Bac Éco - عربية",
     "chapitres": [
      {
       "id": "ch-bac-eco-ar-1",
       "name": "محور 1 في التفكير العلمي",
       "items": [
        {
         "id": "les-bac-eco-ar-1-01",
         "type": "cours",
         "title": "العوامل التي ساعدت العرب على الإبداع",
         "refs": [
          "NAJEH-AR-045"
         ]
        },
        {
         "id": "les-bac-eco-ar-1-02",
         "type": "cours",
         "title": "المناهج العلمية وصفات العالم المسلم",
         "refs": [
          "NAJEH-AR-047"
         ]
        },
        {
         "id": "les-bac-eco-ar-1-03",
         "type": "cours",
         "title": "العلوم العربية",
         "refs": [
          "NAJEH-AR-043"
         ]
        },
        {
         "id": "les-bac-eco-ar-1-04",
         "type": "exercice",
         "title": "التدرب على فقرة حجاجية",
         "refs": [
          "NAJEH-AR-044"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-eco-ar-2",
       "name": "محور 2 في الأدب والفن",
       "items": [
        {
         "id": "les-bac-eco-ar-2-01",
         "type": "cours",
         "title": "الأدب والشعر",
         "refs": [
          "NAJEH-AR-048"
         ]
        },
        {
         "id": "les-bac-eco-ar-2-02",
         "type": "cours",
         "title": "الأدب نثرا ونقدا",
         "refs": [
          "NAJEH-AR-049"
         ]
        },
        {
         "id": "les-bac-eco-ar-2-03",
         "type": "cours",
         "title": "الفن",
         "refs": [
          "NAJEH-AR-050"
         ]
        },
        {
         "id": "les-bac-eco-ar-2-04",
         "type": "cours",
         "title": "الاجابة على أهم الأسئلة",
         "refs": [
          "NAJEH-AR-051"
         ]
        },
        {
         "id": "les-bac-eco-ar-2-05",
         "type": "exercice",
         "title": "اصلاح فرض حول محور الأدب والفن",
         "refs": [
          "NAJEH-AR-052"
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "subj-bac-eco-anglais",
     "name": "Bac Éco - Anglais",
     "chapitres": []
    },
    {
     "id": "subj-bac-eco-geographie",
     "name": "Bac Éco - جغرافيا",
     "chapitres": []
    },
    {
     "id": "subj-bac-eco-chinois",
     "name": "Bac Éco - Chinois",
     "chapitres": []
    },
    {
     "id": "subj-bac-eco-dessin",
     "name": "Bac Éco - Dessin",
     "chapitres": []
    },
    {
     "id": "subj-bac-eco-musique",
     "name": "Bac Éco - Musique",
     "chapitres": []
    },
    {
     "id": "subj-bac-eco-portugais",
     "name": "Bac Éco - Portugais",
     "chapitres": []
    },
    {
     "id": "subj-bac-eco-russe",
     "name": "Bac Éco - Russe",
     "chapitres": []
    },
    {
     "id": "subj-bac-eco-sciences-de-la-vie-et-de-la-terre",
     "name": "Bac Éco - SVT",
     "chapitres": []
    },
    {
     "id": "subj-bac-eco-turc",
     "name": "Bac Éco - Turc",
     "chapitres": []
    },
    {
     "id": "subj-bac-eco-allemand",
     "name": "Bac Éco - Allemand",
     "chapitres": []
    },
    {
     "id": "subj-bac-eco-espagnol",
     "name": "Bac Éco - Espagnol",
     "chapitres": []
    },
    {
     "id": "subj-bac-eco-informatique",
     "name": "Bac Éco - Informatique",
     "chapitres": []
    },
    {
     "id": "subj-bac-eco-italien",
     "name": "Bac Éco - Italien",
     "chapitres": []
    },
    {
     "id": "subj-bac-eco-mae-wael",
     "name": "Bac Éco - مع وائل",
     "chapitres": []
    }
   ]
  },
  {
   "id": "y-bac-lettres",
   "name": "باك — آداب",
   "matieres": [
    {
     "id": "subj-bac-lettres-arabe",
     "name": "Bac Lettres - عربية",
     "chapitres": [
      {
       "id": "ch-bac-lettres-ar-1",
       "name": "محور الحماسة",
       "items": [
        {
         "id": "les-bac-lettres-ar-1-01",
         "type": "cours",
         "title": "الايقاع",
         "refs": [
          "NAJEH-AR-029",
          "NAJEH-AR-030"
         ]
        },
        {
         "id": "les-bac-lettres-ar-1-02",
         "type": "cours",
         "title": "المعجم",
         "refs": [
          "NAJEH-AR-032",
          "NAJEH-AR-030"
         ]
        },
        {
         "id": "les-bac-lettres-ar-1-03",
         "type": "cours",
         "title": "الصورة الشعرية",
         "refs": [
          "NAJEH-AR-031",
          "NAJEH-AR-030"
         ]
        },
        {
         "id": "les-bac-lettres-ar-1-04",
         "type": "cours",
         "title": "المعاني الحماسية",
         "refs": [
          "NAJEH-AR-033",
          "NAJEH-AR-030"
         ]
        },
        {
         "id": "les-bac-lettres-ar-1-05",
         "type": "cours",
         "title": "النقاش",
         "refs": [
          "NAJEH-AR-034",
          "NAJEH-AR-030"
         ]
        },
        {
         "id": "les-bac-lettres-ar-1-06",
         "type": "exercice",
         "title": "تدريب على موضوع حماسي",
         "refs": [
          "NAJEH-AR-035",
          "NAJEH-AR-030"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-lettres-ar-2",
       "name": "محور 2 المنزع العقلي عند الجاحظ",
       "items": [
        {
         "id": "les-bac-lettres-ar-2-01",
         "type": "cours",
         "title": "مقدمة محور الجاحظ",
         "refs": [
          "NAJEH-AR-001",
          "NAJEH-AR-002"
         ]
        },
        {
         "id": "les-bac-lettres-ar-2-02",
         "type": "cours",
         "title": "المنهج العلمي",
         "refs": [
          "NAJEH-AR-005",
          "NAJEH-AR-002"
         ]
        },
        {
         "id": "les-bac-lettres-ar-2-03",
         "type": "cours",
         "title": "المنزع العقلي في الفكر الاعتزالي",
         "refs": [
          "NAJEH-AR-004",
          "NAJEH-AR-002"
         ]
        },
        {
         "id": "les-bac-lettres-ar-2-04",
         "type": "cours",
         "title": "المنزع العقلي في الاسلوب الحجاجي",
         "refs": [
          "NAJEH-AR-003",
          "NAJEH-AR-002"
         ]
        },
        {
         "id": "les-bac-lettres-ar-2-05",
         "type": "cours",
         "title": "موضوع محور الجاحظ",
         "refs": [
          "NAJEH-AR-006",
          "NAJEH-AR-002"
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "subj-bac-lettres-francais",
     "name": "Bac Lettres - Français",
     "chapitres": []
    },
    {
     "id": "subj-bac-lettres-anglais",
     "name": "Bac Lettres - Anglais",
     "chapitres": []
    },
    {
     "id": "subj-bac-lettres-philosophie",
     "name": "Bac Lettres - فلسفة",
     "chapitres": [
      {
       "id": "ch-bac-lettres-philo-1",
       "name": "محور الانية و الغيرية",
       "items": [
        {
         "id": "les-bac-lettres-philo-1-01",
         "type": "cours",
         "title": "تمهيد محور الإنية و الغيرية",
         "refs": [
          "WALID-PHILO-009",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-lettres-philo-1-02",
         "type": "cours",
         "title": "تعالي الانية على الغيرية",
         "refs": [
          "WALID-PHILO-008",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-lettres-philo-1-03",
         "type": "cours",
         "title": "الانية بما هي ذات واعية (ديكارت)",
         "refs": [
          "WALID-PHILO-001",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-lettres-philo-1-04",
         "type": "cours",
         "title": "في جدلية الانية و الغيرية",
         "refs": [
          "WALID-PHILO-011",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-lettres-philo-1-05",
         "type": "cours",
         "title": "الذات المتجسدة",
         "refs": [
          "WALID-PHILO-003",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-lettres-philo-1-06",
         "type": "cours",
         "title": "تاسيس انطولوجيا جديدة للجسد",
         "refs": [
          "WALID-PHILO-007",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-lettres-philo-1-07",
         "type": "cours",
         "title": "الوعي بما هو تشكل تاريخي",
         "refs": [
          "WALID-PHILO-005",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-lettres-philo-1-08",
         "type": "cours",
         "title": "الوعي بناء تاريخي (ماركس)",
         "refs": [
          "WALID-PHILO-006",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-lettres-philo-1-09",
         "type": "cours",
         "title": "جدلية الوعي و اللاوعي",
         "refs": [
          "WALID-PHILO-010",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-lettres-philo-1-10",
         "type": "cours",
         "title": "التكامل بين الوعي و الاوعي",
         "refs": [
          "WALID-PHILO-002",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-lettres-philo-1-11",
         "type": "cours",
         "title": "الغيرية كامنة في الذات",
         "refs": [
          "WALID-PHILO-004",
          "WALID-PHILO-012"
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "subj-bac-lettres-histoire",
     "name": "Bac Lettres - تاريخ",
     "chapitres": []
    },
    {
     "id": "subj-bac-lettres-informatique",
     "name": "Bac Lettres - Informatique",
     "chapitres": []
    },
    {
     "id": "subj-bac-lettres-pensee-islamique",
     "name": "Bac Lettres - تفكير اسلامي",
     "chapitres": []
    },
    {
     "id": "subj-bac-lettres-geographie",
     "name": "Bac Lettres - جغرافيا",
     "chapitres": []
    },
    {
     "id": "subj-bac-lettres-allemand",
     "name": "Bac Lettres - Allemand",
     "chapitres": []
    },
    {
     "id": "subj-bac-lettres-chinois",
     "name": "Bac Lettres - Chinois",
     "chapitres": []
    },
    {
     "id": "subj-bac-lettres-dessin",
     "name": "Bac Lettres - Dessin",
     "chapitres": []
    },
    {
     "id": "subj-bac-lettres-musique",
     "name": "Bac Lettres - Musique",
     "chapitres": []
    },
    {
     "id": "subj-bac-lettres-portugais",
     "name": "Bac Lettres - Portugais",
     "chapitres": []
    },
    {
     "id": "subj-bac-lettres-russe",
     "name": "Bac Lettres - Russe",
     "chapitres": []
    },
    {
     "id": "subj-bac-lettres-turc",
     "name": "Bac Lettres - Turc",
     "chapitres": []
    },
    {
     "id": "subj-bac-lettres-espagnol",
     "name": "Bac Lettres - Espagnol",
     "chapitres": []
    },
    {
     "id": "subj-bac-lettres-italien",
     "name": "Bac Lettres - Italien",
     "chapitres": []
    },
    {
     "id": "subj-bac-lettres-sciences-de-la-vie-et-de-la-terre",
     "name": "Bac Lettres - SVT",
     "chapitres": []
    },
    {
     "id": "subj-bac-lettres-mae-wael",
     "name": "Bac Lettres - مع وائل",
     "chapitres": []
    }
   ]
  },
  {
   "id": "y-bac-tech",
   "name": "باك — علوم تقنية",
   "matieres": [
    {
     "id": "subj-bac-tech-electrique",
     "name": "Bac Technique - Electrique",
     "chapitres": [
      {
       "id": "ch-bac-tech-elec-1",
       "name": "Microcontrôleur",
       "items": [
        {
         "id": "les-bac-tech-elec-1-01",
         "type": "cours",
         "title": "MikroC 1 : interruption",
         "refs": [
          "ATEF-ELEC-001",
          "ATEF-ELEC-002"
         ]
        },
        {
         "id": "les-bac-tech-elec-1-02",
         "type": "cours",
         "title": "MikroC 2 : convertisseur",
         "refs": [
          "ATEF-ELEC-005",
          "ATEF-ELEC-006"
         ]
        },
        {
         "id": "les-bac-tech-elec-1-03",
         "type": "cours",
         "title": "MikroC 3 : timer",
         "refs": [
          "ATEF-ELEC-008",
          "ATEF-ELEC-007"
         ]
        },
        {
         "id": "les-bac-tech-elec-1-04",
         "type": "exercice",
         "title": "Série : micro-conversion",
         "refs": [
          "ATEF-ELEC-030",
          "ATEF-ELEC-028",
          "ATEF-ELEC-029"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-tech-elec-2",
       "name": "Circuit combinatoire",
       "items": [
        {
         "id": "les-bac-tech-elec-2-01",
         "type": "cours",
         "title": "Circuit combinatoire : additionneur binaire et BCD",
         "refs": [
          "ATEF-ELEC-009",
          "ATEF-ELEC-010"
         ]
        },
        {
         "id": "les-bac-tech-elec-2-02",
         "type": "cours",
         "title": "Circuit combinatoire : soustracteur",
         "refs": [
          "ATEF-ELEC-012",
          "ATEF-ELEC-011"
         ]
        },
        {
         "id": "les-bac-tech-elec-2-03",
         "type": "cours",
         "title": "Circuit combinatoire : comparateur",
         "refs": [
          "ATEF-ELEC-014",
          "ATEF-ELEC-013"
         ]
        },
        {
         "id": "les-bac-tech-elec-2-04",
         "type": "cours",
         "title": "Circuit combinatoire : MUX et DMUX",
         "refs": [
          "ATEF-ELEC-016",
          "ATEF-ELEC-015"
         ]
        },
        {
         "id": "les-bac-tech-elec-2-05",
         "type": "cours",
         "title": "Circuit combinatoire : UAL",
         "refs": [
          "ATEF-ELEC-018",
          "ATEF-ELEC-017"
         ]
        },
        {
         "id": "les-bac-tech-elec-2-06",
         "type": "cours",
         "title": "Série : circuit combinatoire",
         "refs": [
          "ATEF-ELEC-022",
          "ATEF-ELEC-021",
          "ATEF-ELEC-023"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-tech-elec-3",
       "name": "Logique séquentielle",
       "items": [
        {
         "id": "les-bac-tech-elec-3-01",
         "type": "cours",
         "title": "Logique séquentielle : compteur",
         "refs": [
          "ATEF-ELEC-019",
          "ATEF-ELEC-020"
         ]
        },
        {
         "id": "les-bac-tech-elec-3-02",
         "type": "cours",
         "title": "Logique séquentielle : GRAFCET synchronisé",
         "refs": [
          "ATEF-ELEC-003",
          "ATEF-ELEC-004"
         ]
        },
        {
         "id": "les-bac-tech-elec-3-03",
         "type": "exercice",
         "title": "Série : interruption",
         "refs": [
          "ATEF-ELEC-026",
          "ATEF-ELEC-024",
          "ATEF-ELEC-025"
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "subj-bac-tech-mathematiques",
     "name": "Bac Technique - Maths",
     "chapitres": []
    },
    {
     "id": "subj-bac-tech-sciences-physiques",
     "name": "Bac Technique - Physique",
     "chapitres": [
      {
       "id": "ch-bac-tech-phys-1",
       "name": "Le condensateur",
       "items": [
        {
         "id": "les-bac-tech-phys-1-01",
         "type": "cours",
         "title": "Étude expérimentale",
         "refs": [
          "MAHDI-PHYS-026",
          "MAHDI-PHYS-023"
         ]
        },
        {
         "id": "les-bac-tech-phys-1-02",
         "type": "cours",
         "title": "Étude théorique",
         "refs": [
          "MAHDI-PHYS-029",
          "MAHDI-PHYS-023"
         ]
        },
        {
         "id": "les-bac-tech-phys-1-03",
         "type": "exercice",
         "title": "Exercice 1",
         "refs": [
          "MAHDI-PHYS-024",
          "MAHDI-PHYS-030"
         ]
        },
        {
         "id": "les-bac-tech-phys-1-04",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "MAHDI-PHYS-025",
          "MAHDI-PHYS-030"
         ]
        },
        {
         "id": "les-bac-tech-phys-1-05",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "MAHDI-PHYS-027",
          "MAHDI-PHYS-030"
         ]
        },
        {
         "id": "les-bac-tech-phys-1-06",
         "type": "exercice",
         "title": "Exercice 4",
         "refs": [
          "MAHDI-PHYS-028",
          "MAHDI-PHYS-030"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-tech-phys-2",
       "name": "RC",
       "items": [
        {
         "id": "les-bac-tech-phys-2-01",
         "type": "cours",
         "title": "Dipôle RC : étude expérimentale",
         "refs": [
          "MAHDI-PHYS-066",
          "MAHDI-PHYS-063",
          "MAHDI-PHYS-064"
         ]
        },
        {
         "id": "les-bac-tech-phys-2-02",
         "type": "cours",
         "title": "Dipôle RC : étude théorique",
         "refs": [
          "MAHDI-PHYS-065",
          "MAHDI-PHYS-063",
          "MAHDI-PHYS-064"
         ]
        },
        {
         "id": "les-bac-tech-phys-2-03",
         "type": "exercice",
         "title": "Exercice 1",
         "refs": [
          "MAHDI-PHYS-057",
          "MAHDI-PHYS-069"
         ]
        },
        {
         "id": "les-bac-tech-phys-2-04",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "MAHDI-PHYS-058",
          "MAHDI-PHYS-069"
         ]
        },
        {
         "id": "les-bac-tech-phys-2-05",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "MAHDI-PHYS-059",
          "MAHDI-PHYS-067"
         ]
        },
        {
         "id": "les-bac-tech-phys-2-06",
         "type": "exercice",
         "title": "Exercice 4",
         "refs": [
          "MAHDI-PHYS-060",
          "MAHDI-PHYS-067"
         ]
        },
        {
         "id": "les-bac-tech-phys-2-07",
         "type": "exercice",
         "title": "Exercice 5",
         "refs": [
          "MAHDI-PHYS-061",
          "MAHDI-PHYS-068"
         ]
        },
        {
         "id": "les-bac-tech-phys-2-08",
         "type": "exercice",
         "title": "Exercice 6",
         "refs": [
          "MAHDI-PHYS-062",
          "MAHDI-PHYS-068"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-tech-phys-3",
       "name": "La bobine",
       "items": [
        {
         "id": "les-bac-tech-phys-3-01",
         "type": "cours",
         "title": "Bobine",
         "refs": [
          "MAHDI-PHYS-009",
          "MAHDI-PHYS-005",
          "MAHDI-PHYS-006"
         ]
        },
        {
         "id": "les-bac-tech-phys-3-02",
         "type": "exercice",
         "title": "Exercice 1",
         "refs": [
          "MAHDI-PHYS-007",
          "MAHDI-PHYS-003"
         ]
        },
        {
         "id": "les-bac-tech-phys-3-03",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "MAHDI-PHYS-008",
          "MAHDI-PHYS-003"
         ]
        },
        {
         "id": "les-bac-tech-phys-3-04",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "MAHDI-PHYS-002",
          "MAHDI-PHYS-004"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-tech-phys-4",
       "name": "RL",
       "items": [
        {
         "id": "les-bac-tech-phys-4-01",
         "type": "cours",
         "title": "Dipôle RL : étude expérimentale",
         "refs": [
          "MAHDI-PHYS-081",
          "MAHDI-PHYS-084"
         ]
        },
        {
         "id": "les-bac-tech-phys-4-02",
         "type": "cours",
         "title": "Dipôle RL : étude théorique",
         "refs": [
          "MAHDI-PHYS-080",
          "MAHDI-PHYS-084"
         ]
        },
        {
         "id": "les-bac-tech-phys-4-03",
         "type": "exercice",
         "title": "Exercice 1",
         "refs": [
          "MAHDI-PHYS-075",
          "MAHDI-PHYS-073"
         ]
        },
        {
         "id": "les-bac-tech-phys-4-04",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "MAHDI-PHYS-074",
          "MAHDI-PHYS-073"
         ]
        },
        {
         "id": "les-bac-tech-phys-4-05",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "MAHDI-PHYS-076",
          "MAHDI-PHYS-070"
         ]
        },
        {
         "id": "les-bac-tech-phys-4-06",
         "type": "exercice",
         "title": "Exercice 4",
         "refs": [
          "MAHDI-PHYS-077",
          "MAHDI-PHYS-071"
         ]
        },
        {
         "id": "les-bac-tech-phys-4-07",
         "type": "exercice",
         "title": "Exercice 5",
         "refs": [
          "MAHDI-PHYS-078",
          "MAHDI-PHYS-072"
         ]
        },
        {
         "id": "les-bac-tech-phys-4-08",
         "type": "exercice",
         "title": "Exercice 6",
         "refs": [
          "MAHDI-PHYS-079",
          "MAHDI-PHYS-072"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-tech-phys-5",
       "name": "Oscillations libres amorties",
       "items": [
        {
         "id": "les-bac-tech-phys-5-01",
         "type": "cours",
         "title": "Oscillations amorties libres : étude expérimentale",
         "refs": [
          "MAHDI-PHYS-033",
          "MAHDI-PHYS-038"
         ]
        },
        {
         "id": "les-bac-tech-phys-5-02",
         "type": "cours",
         "title": "Oscillations amorties libres : étude théorique",
         "refs": [
          "MAHDI-PHYS-037",
          "MAHDI-PHYS-038"
         ]
        },
        {
         "id": "les-bac-tech-phys-5-03",
         "type": "exercice",
         "title": "Exercice 1",
         "refs": [
          "MAHDI-PHYS-034",
          "MAHDI-PHYS-031"
         ]
        },
        {
         "id": "les-bac-tech-phys-5-04",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "MAHDI-PHYS-035",
          "MAHDI-PHYS-032"
         ]
        },
        {
         "id": "les-bac-tech-phys-5-05",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "MAHDI-PHYS-036",
          "MAHDI-PHYS-032"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-tech-phys-6",
       "name": "Oscillations électriques libres non amorties",
       "items": [
        {
         "id": "les-bac-tech-phys-6-01",
         "type": "cours",
         "title": "Oscillations non amorties : étude expérimentale",
         "refs": [
          "MAHDI-PHYS-054",
          "MAHDI-PHYS-039"
         ]
        },
        {
         "id": "les-bac-tech-phys-6-02",
         "type": "cours",
         "title": "Oscillations non amorties : étude théorique (partie 1)",
         "refs": [
          "MAHDI-PHYS-050",
          "MAHDI-PHYS-039"
         ]
        },
        {
         "id": "les-bac-tech-phys-6-03",
         "type": "cours",
         "title": "Oscillations non amorties : étude théorique (partie 2)",
         "refs": [
          "MAHDI-PHYS-053",
          "MAHDI-PHYS-039"
         ]
        },
        {
         "id": "les-bac-tech-phys-6-04",
         "type": "exercice",
         "title": "Exercice 1",
         "refs": [
          "MAHDI-PHYS-051",
          "MAHDI-PHYS-040"
         ]
        },
        {
         "id": "les-bac-tech-phys-6-05",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "MAHDI-PHYS-055",
          "MAHDI-PHYS-040"
         ]
        },
        {
         "id": "les-bac-tech-phys-6-06",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "MAHDI-PHYS-052",
          "MAHDI-PHYS-041"
         ]
        },
        {
         "id": "les-bac-tech-phys-6-07",
         "type": "exercice",
         "title": "Exercice 4",
         "refs": [
          "MAHDI-PHYS-043",
          "MAHDI-PHYS-041"
         ]
        },
        {
         "id": "les-bac-tech-phys-6-08",
         "type": "exercice",
         "title": "Exercice 5",
         "refs": [
          "MAHDI-PHYS-044",
          "MAHDI-PHYS-042"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-tech-phys-7",
       "name": "Cinétique chimique",
       "items": [
        {
         "id": "les-bac-tech-phys-7-01",
         "type": "cours",
         "title": "Avancement d'une réaction chimique",
         "refs": [
          "MAHDI-PHYS-010",
          "MAHDI-PHYS-020"
         ]
        },
        {
         "id": "les-bac-tech-phys-7-02",
         "type": "cours",
         "title": "Vitesse d'une réaction chimique",
         "refs": [
          "MAHDI-PHYS-022",
          "MAHDI-PHYS-020"
         ]
        },
        {
         "id": "les-bac-tech-phys-7-03",
         "type": "cours",
         "title": "Notion d'équilibre chimique et estérification",
         "refs": [
          "MAHDI-PHYS-019",
          "MAHDI-PHYS-021"
         ]
        },
        {
         "id": "les-bac-tech-phys-7-04",
         "type": "cours",
         "title": "Loi d'action de masse",
         "refs": [
          "MAHDI-PHYS-018",
          "MAHDI-PHYS-021"
         ]
        },
        {
         "id": "les-bac-tech-phys-7-05",
         "type": "exercice",
         "title": "Exercice 1 : cinétique chimique",
         "refs": [
          "MAHDI-PHYS-014",
          "MAHDI-PHYS-020"
         ]
        },
        {
         "id": "les-bac-tech-phys-7-06",
         "type": "exercice",
         "title": "Exercice 2 : cinétique chimique",
         "refs": [
          "MAHDI-PHYS-012",
          "MAHDI-PHYS-020"
         ]
        },
        {
         "id": "les-bac-tech-phys-7-07",
         "type": "exercice",
         "title": "Exercice 3 : cinétique chimique",
         "refs": [
          "MAHDI-PHYS-011",
          "MAHDI-PHYS-020"
         ]
        },
        {
         "id": "les-bac-tech-phys-7-08",
         "type": "exercice",
         "title": "Exercice 4 : cinétique chimique",
         "refs": [
          "MAHDI-PHYS-013",
          "MAHDI-PHYS-020"
         ]
        },
        {
         "id": "les-bac-tech-phys-7-09",
         "type": "exercice",
         "title": "Exercice 1 : équilibre chimique",
         "refs": [
          "MAHDI-PHYS-015",
          "MAHDI-PHYS-021"
         ]
        },
        {
         "id": "les-bac-tech-phys-7-10",
         "type": "exercice",
         "title": "Exercice 2 : équilibre chimique",
         "refs": [
          "MAHDI-PHYS-016",
          "MAHDI-PHYS-021"
         ]
        },
        {
         "id": "les-bac-tech-phys-7-11",
         "type": "exercice",
         "title": "Exercice 3 : équilibre chimique",
         "refs": [
          "MAHDI-PHYS-017",
          "MAHDI-PHYS-021"
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "subj-bac-tech-philosophie",
     "name": "Bac Technique - فلسفة",
     "chapitres": [
      {
       "id": "ch-bac-tech-philo-1",
       "name": "محور الانية و الغيرية",
       "items": [
        {
         "id": "les-bac-tech-philo-1-01",
         "type": "cours",
         "title": "تمهيد محور الإنية و الغيرية",
         "refs": [
          "WALID-PHILO-009",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-tech-philo-1-02",
         "type": "cours",
         "title": "تعالي الانية على الغيرية",
         "refs": [
          "WALID-PHILO-008",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-tech-philo-1-03",
         "type": "cours",
         "title": "الانية بما هي ذات واعية (ديكارت)",
         "refs": [
          "WALID-PHILO-001",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-tech-philo-1-04",
         "type": "cours",
         "title": "في جدلية الانية و الغيرية",
         "refs": [
          "WALID-PHILO-011",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-tech-philo-1-05",
         "type": "cours",
         "title": "الذات المتجسدة",
         "refs": [
          "WALID-PHILO-003",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-tech-philo-1-06",
         "type": "cours",
         "title": "تاسيس انطولوجيا جديدة للجسد",
         "refs": [
          "WALID-PHILO-007",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-tech-philo-1-07",
         "type": "cours",
         "title": "الوعي بما هو تشكل تاريخي",
         "refs": [
          "WALID-PHILO-005",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-tech-philo-1-08",
         "type": "cours",
         "title": "الوعي بناء تاريخي (ماركس)",
         "refs": [
          "WALID-PHILO-006",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-tech-philo-1-09",
         "type": "cours",
         "title": "جدلية الوعي و اللاوعي",
         "refs": [
          "WALID-PHILO-010",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-tech-philo-1-10",
         "type": "cours",
         "title": "التكامل بين الوعي و الاوعي",
         "refs": [
          "WALID-PHILO-002",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-tech-philo-1-11",
         "type": "cours",
         "title": "الغيرية كامنة في الذات",
         "refs": [
          "WALID-PHILO-004",
          "WALID-PHILO-012"
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "subj-bac-tech-francais",
     "name": "Bac Technique - Français",
     "chapitres": [
      {
       "id": "ch-bac-tech-fr-1",
       "name": "Module 1 : Souvenirs et nostalgie",
       "items": [
        {
         "id": "les-bac-tech-fr-1-01",
         "type": "cours",
         "title": "Vocabulaire",
         "refs": [
          "RAOUEDHA-FR-017",
          "RAOUEDHA-FR-018"
         ]
        },
        {
         "id": "les-bac-tech-fr-1-02",
         "type": "cours",
         "title": "La cause et la conséquence",
         "refs": [
          "RAOUEDHA-FR-012",
          "RAOUEDHA-FR-013"
         ]
        },
        {
         "id": "les-bac-tech-fr-1-03",
         "type": "exercice",
         "title": "Exercice cause et conséquence",
         "refs": [
          "RAOUEDHA-FR-010",
          "RAOUEDHA-FR-011"
         ]
        },
        {
         "id": "les-bac-tech-fr-1-04",
         "type": "cours",
         "title": "Texte explicatif, texte argumentatif : quelle différence ?",
         "refs": [
          "RAOUEDHA-FR-019",
          "RAOUEDHA-FR-014"
         ]
        },
        {
         "id": "les-bac-tech-fr-1-05",
         "type": "cours",
         "title": "Expression écrite : texte explicatif",
         "refs": [
          "RAOUEDHA-FR-020",
          "RAOUEDHA-FR-021"
         ]
        },
        {
         "id": "les-bac-tech-fr-1-06",
         "type": "cours",
         "title": "Expression écrite : texte explicatif (application)",
         "refs": [
          "RAOUEDHA-FR-022",
          "RAOUEDHA-FR-023"
         ]
        },
        {
         "id": "les-bac-tech-fr-1-07",
         "type": "cours",
         "title": "Étude de texte : lire et comprendre une question de compréhension",
         "refs": [
          "RAOUEDHA-FR-025",
          "RAOUEDHA-FR-024"
         ]
        },
        {
         "id": "les-bac-tech-fr-1-08",
         "type": "cours",
         "title": "Répondre à une question portant sur les procédés d'écriture (application)",
         "refs": [
          "RAOUEDHA-FR-016",
          "RAOUEDHA-FR-015"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-tech-fr-2",
       "name": "Module 2 : Histoire d'amour",
       "items": [
        {
         "id": "les-bac-tech-fr-2-01",
         "type": "cours",
         "title": "Le but",
         "refs": [
          "RAOUEDHA-FR-007",
          "RAOUEDHA-FR-001"
         ]
        },
        {
         "id": "les-bac-tech-fr-2-02",
         "type": "exercice",
         "title": "Le but : exercices",
         "refs": [
          "RAOUEDHA-FR-005",
          "RAOUEDHA-FR-006"
         ]
        },
        {
         "id": "les-bac-tech-fr-2-03",
         "type": "cours",
         "title": "Étude de texte : répondre aux questions de compréhension",
         "refs": [
          "RAOUEDHA-FR-008",
          "RAOUEDHA-FR-009"
         ]
        },
        {
         "id": "les-bac-tech-fr-2-04",
         "type": "cours",
         "title": "Expression écrite : le point de vue absolu",
         "refs": [
          "RAOUEDHA-FR-003",
          "RAOUEDHA-FR-002"
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "subj-bac-tech-arabe",
     "name": "Bac Technique - عربية",
     "chapitres": [
      {
       "id": "ch-bac-tech-ar-1",
       "name": "محور 1 في التفكير العلمي",
       "items": [
        {
         "id": "les-bac-tech-ar-1-01",
         "type": "cours",
         "title": "العوامل التي ساعدت العرب على الإبداع",
         "refs": [
          "NAJEH-AR-045"
         ]
        },
        {
         "id": "les-bac-tech-ar-1-02",
         "type": "cours",
         "title": "المناهج العلمية وصفات العالم المسلم",
         "refs": [
          "NAJEH-AR-047"
         ]
        },
        {
         "id": "les-bac-tech-ar-1-03",
         "type": "cours",
         "title": "العلوم العربية",
         "refs": [
          "NAJEH-AR-043"
         ]
        },
        {
         "id": "les-bac-tech-ar-1-04",
         "type": "exercice",
         "title": "التدرب على فقرة حجاجية",
         "refs": [
          "NAJEH-AR-044"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-tech-ar-2",
       "name": "محور 2 في الأدب والفن",
       "items": [
        {
         "id": "les-bac-tech-ar-2-01",
         "type": "cours",
         "title": "الأدب والشعر",
         "refs": [
          "NAJEH-AR-048"
         ]
        },
        {
         "id": "les-bac-tech-ar-2-02",
         "type": "cours",
         "title": "الأدب نثرا ونقدا",
         "refs": [
          "NAJEH-AR-049"
         ]
        },
        {
         "id": "les-bac-tech-ar-2-03",
         "type": "cours",
         "title": "الفن",
         "refs": [
          "NAJEH-AR-050"
         ]
        },
        {
         "id": "les-bac-tech-ar-2-04",
         "type": "cours",
         "title": "الاجابة على أهم الأسئلة",
         "refs": [
          "NAJEH-AR-051"
         ]
        },
        {
         "id": "les-bac-tech-ar-2-05",
         "type": "exercice",
         "title": "اصلاح فرض حول محور الأدب والفن",
         "refs": [
          "NAJEH-AR-052"
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "subj-bac-tech-anglais",
     "name": "Bac Technique - Anglais",
     "chapitres": []
    },
    {
     "id": "subj-bac-tech-mecanique",
     "name": "Bac Technique - Mécanique",
     "chapitres": [
      {
       "id": "ch-bac-tech-meca-1",
       "name": "FAST",
       "items": [
        {
         "id": "les-bac-tech-meca-1-01",
         "type": "cours",
         "title": "Application 1",
         "refs": [
          "AMMAR-MECA-054",
          "AMMAR-MECA-043",
          "AMMAR-MECA-044"
         ]
        },
        {
         "id": "les-bac-tech-meca-1-02",
         "type": "cours",
         "title": "Application 2",
         "refs": [
          "AMMAR-MECA-055",
          "AMMAR-MECA-045",
          "AMMAR-MECA-046"
         ]
        },
        {
         "id": "les-bac-tech-meca-1-03",
         "type": "cours",
         "title": "Application 3",
         "refs": [
          "AMMAR-MECA-056",
          "AMMAR-MECA-047",
          "AMMAR-MECA-048"
         ]
        },
        {
         "id": "les-bac-tech-meca-1-04",
         "type": "cours",
         "title": "Application 4",
         "refs": [
          "AMMAR-MECA-057",
          "AMMAR-MECA-049",
          "AMMAR-MECA-050"
         ]
        },
        {
         "id": "les-bac-tech-meca-1-05",
         "type": "cours",
         "title": "Application 5",
         "refs": [
          "AMMAR-MECA-058",
          "AMMAR-MECA-051",
          "AMMAR-MECA-052",
          "AMMAR-MECA-053"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-tech-meca-2",
       "name": "Cotation fonctionnelle",
       "items": [
        {
         "id": "les-bac-tech-meca-2-01",
         "type": "cours",
         "title": "Application 1",
         "refs": [
          "AMMAR-MECA-001",
          "AMMAR-MECA-007",
          "AMMAR-MECA-008"
         ]
        },
        {
         "id": "les-bac-tech-meca-2-02",
         "type": "cours",
         "title": "Application 2",
         "refs": [
          "AMMAR-MECA-002",
          "AMMAR-MECA-007",
          "AMMAR-MECA-008"
         ]
        },
        {
         "id": "les-bac-tech-meca-2-03",
         "type": "cours",
         "title": "Application 3",
         "refs": [
          "AMMAR-MECA-003",
          "AMMAR-MECA-007",
          "AMMAR-MECA-008"
         ]
        },
        {
         "id": "les-bac-tech-meca-2-04",
         "type": "cours",
         "title": "Application 4",
         "refs": [
          "AMMAR-MECA-004",
          "AMMAR-MECA-007",
          "AMMAR-MECA-008"
         ]
        },
        {
         "id": "les-bac-tech-meca-2-05",
         "type": "cours",
         "title": "Application 5",
         "refs": [
          "AMMAR-MECA-005",
          "AMMAR-MECA-007",
          "AMMAR-MECA-008"
         ]
        },
        {
         "id": "les-bac-tech-meca-2-06",
         "type": "cours",
         "title": "Application 6",
         "refs": [
          "AMMAR-MECA-006",
          "AMMAR-MECA-007",
          "AMMAR-MECA-008"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-tech-meca-3",
       "name": "Dessin de définition",
       "items": [
        {
         "id": "les-bac-tech-meca-3-01",
         "type": "cours",
         "title": "Application 1",
         "refs": [
          "AMMAR-MECA-010",
          "AMMAR-MECA-009",
          "AMMAR-MECA-011"
         ]
        },
        {
         "id": "les-bac-tech-meca-3-02",
         "type": "cours",
         "title": "Application 2",
         "refs": [
          "AMMAR-MECA-013",
          "AMMAR-MECA-012",
          "AMMAR-MECA-014"
         ]
        },
        {
         "id": "les-bac-tech-meca-3-03",
         "type": "cours",
         "title": "Application 3",
         "refs": [
          "AMMAR-MECA-016",
          "AMMAR-MECA-015",
          "AMMAR-MECA-017"
         ]
        },
        {
         "id": "les-bac-tech-meca-3-04",
         "type": "cours",
         "title": "Application 4",
         "refs": [
          "AMMAR-MECA-019",
          "AMMAR-MECA-018",
          "AMMAR-MECA-020"
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "subj-bac-tech-informatique",
     "name": "Bac Technique - Informatique",
     "chapitres": []
    },
    {
     "id": "subj-bac-tech-chinois",
     "name": "Bac Technique - Chinois",
     "chapitres": []
    },
    {
     "id": "subj-bac-tech-dessin",
     "name": "Bac Technique - Dessin",
     "chapitres": []
    },
    {
     "id": "subj-bac-tech-musique",
     "name": "Bac Technique - Musique",
     "chapitres": []
    },
    {
     "id": "subj-bac-tech-portugais",
     "name": "Bac Technique - Portugais",
     "chapitres": []
    },
    {
     "id": "subj-bac-tech-russe",
     "name": "Bac Technique - Russe",
     "chapitres": []
    },
    {
     "id": "subj-bac-tech-sciences-de-la-vie-et-de-la-terre",
     "name": "Bac Technique - SVT",
     "chapitres": []
    },
    {
     "id": "subj-bac-tech-turc",
     "name": "Bac Technique - Turc",
     "chapitres": []
    },
    {
     "id": "subj-bac-tech-allemand",
     "name": "Bac Technique - Allemand",
     "chapitres": []
    },
    {
     "id": "subj-bac-tech-espagnol",
     "name": "Bac Technique - Espagnol",
     "chapitres": []
    },
    {
     "id": "subj-bac-tech-italien",
     "name": "Bac Technique - Italien",
     "chapitres": []
    },
    {
     "id": "subj-bac-tech-mae-wael",
     "name": "Bac Technique - مع وائل",
     "chapitres": []
    }
   ]
  },
  {
   "id": "y-bac-info",
   "name": "باك — علوم إعلامية",
   "matieres": [
    {
     "id": "subj-bac-info-programmation",
     "name": "Bac Info - Programmation",
     "chapitres": []
    },
    {
     "id": "subj-bac-info-algorithmique",
     "name": "Bac Info - Algorithmique",
     "chapitres": []
    },
    {
     "id": "subj-bac-info-mathematiques",
     "name": "Bac Info - Maths",
     "chapitres": []
    },
    {
     "id": "subj-bac-info-sciences-physiques",
     "name": "Bac Info - Physique",
     "chapitres": [
      {
       "id": "ch-bac-info-phys-1",
       "name": "Le condensateur",
       "items": [
        {
         "id": "les-bac-info-phys-1-01",
         "type": "cours",
         "title": "Étude expérimentale",
         "refs": [
          "MAHDI-PHYS-026",
          "MAHDI-PHYS-023"
         ]
        },
        {
         "id": "les-bac-info-phys-1-02",
         "type": "cours",
         "title": "Étude théorique",
         "refs": [
          "MAHDI-PHYS-029",
          "MAHDI-PHYS-023"
         ]
        },
        {
         "id": "les-bac-info-phys-1-03",
         "type": "exercice",
         "title": "Exercice 1",
         "refs": [
          "MAHDI-PHYS-024",
          "MAHDI-PHYS-030"
         ]
        },
        {
         "id": "les-bac-info-phys-1-04",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "MAHDI-PHYS-025",
          "MAHDI-PHYS-030"
         ]
        },
        {
         "id": "les-bac-info-phys-1-05",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "MAHDI-PHYS-027",
          "MAHDI-PHYS-030"
         ]
        },
        {
         "id": "les-bac-info-phys-1-06",
         "type": "exercice",
         "title": "Exercice 4",
         "refs": [
          "MAHDI-PHYS-028",
          "MAHDI-PHYS-030"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-info-phys-2",
       "name": "RC",
       "items": [
        {
         "id": "les-bac-info-phys-2-01",
         "type": "cours",
         "title": "Dipôle RC : étude expérimentale",
         "refs": [
          "MAHDI-PHYS-066",
          "MAHDI-PHYS-063",
          "MAHDI-PHYS-064"
         ]
        },
        {
         "id": "les-bac-info-phys-2-02",
         "type": "cours",
         "title": "Dipôle RC : étude théorique",
         "refs": [
          "MAHDI-PHYS-065",
          "MAHDI-PHYS-063",
          "MAHDI-PHYS-064"
         ]
        },
        {
         "id": "les-bac-info-phys-2-03",
         "type": "exercice",
         "title": "Exercice 1",
         "refs": [
          "MAHDI-PHYS-057",
          "MAHDI-PHYS-069"
         ]
        },
        {
         "id": "les-bac-info-phys-2-04",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "MAHDI-PHYS-058",
          "MAHDI-PHYS-069"
         ]
        },
        {
         "id": "les-bac-info-phys-2-05",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "MAHDI-PHYS-059",
          "MAHDI-PHYS-067"
         ]
        },
        {
         "id": "les-bac-info-phys-2-06",
         "type": "exercice",
         "title": "Exercice 4",
         "refs": [
          "MAHDI-PHYS-060",
          "MAHDI-PHYS-067"
         ]
        },
        {
         "id": "les-bac-info-phys-2-07",
         "type": "exercice",
         "title": "Exercice 5",
         "refs": [
          "MAHDI-PHYS-061",
          "MAHDI-PHYS-068"
         ]
        },
        {
         "id": "les-bac-info-phys-2-08",
         "type": "exercice",
         "title": "Exercice 6",
         "refs": [
          "MAHDI-PHYS-062",
          "MAHDI-PHYS-068"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-info-phys-3",
       "name": "La bobine",
       "items": [
        {
         "id": "les-bac-info-phys-3-01",
         "type": "cours",
         "title": "Bobine",
         "refs": [
          "MAHDI-PHYS-009",
          "MAHDI-PHYS-005",
          "MAHDI-PHYS-006"
         ]
        },
        {
         "id": "les-bac-info-phys-3-02",
         "type": "exercice",
         "title": "Exercice 1",
         "refs": [
          "MAHDI-PHYS-007",
          "MAHDI-PHYS-003"
         ]
        },
        {
         "id": "les-bac-info-phys-3-03",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "MAHDI-PHYS-008",
          "MAHDI-PHYS-003"
         ]
        },
        {
         "id": "les-bac-info-phys-3-04",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "MAHDI-PHYS-002",
          "MAHDI-PHYS-004"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-info-phys-4",
       "name": "RL",
       "items": [
        {
         "id": "les-bac-info-phys-4-01",
         "type": "cours",
         "title": "Dipôle RL : étude expérimentale",
         "refs": [
          "MAHDI-PHYS-081",
          "MAHDI-PHYS-084"
         ]
        },
        {
         "id": "les-bac-info-phys-4-02",
         "type": "cours",
         "title": "Dipôle RL : étude théorique",
         "refs": [
          "MAHDI-PHYS-080",
          "MAHDI-PHYS-084"
         ]
        },
        {
         "id": "les-bac-info-phys-4-03",
         "type": "exercice",
         "title": "Exercice 1",
         "refs": [
          "MAHDI-PHYS-075",
          "MAHDI-PHYS-073"
         ]
        },
        {
         "id": "les-bac-info-phys-4-04",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "MAHDI-PHYS-074",
          "MAHDI-PHYS-073"
         ]
        },
        {
         "id": "les-bac-info-phys-4-05",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "MAHDI-PHYS-076",
          "MAHDI-PHYS-070"
         ]
        },
        {
         "id": "les-bac-info-phys-4-06",
         "type": "exercice",
         "title": "Exercice 4",
         "refs": [
          "MAHDI-PHYS-077",
          "MAHDI-PHYS-071"
         ]
        },
        {
         "id": "les-bac-info-phys-4-07",
         "type": "exercice",
         "title": "Exercice 5",
         "refs": [
          "MAHDI-PHYS-078",
          "MAHDI-PHYS-072"
         ]
        },
        {
         "id": "les-bac-info-phys-4-08",
         "type": "exercice",
         "title": "Exercice 6",
         "refs": [
          "MAHDI-PHYS-079",
          "MAHDI-PHYS-072"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-info-phys-5",
       "name": "Oscillations libres amorties",
       "items": [
        {
         "id": "les-bac-info-phys-5-01",
         "type": "cours",
         "title": "Oscillations amorties libres : étude expérimentale",
         "refs": [
          "MAHDI-PHYS-033",
          "MAHDI-PHYS-038"
         ]
        },
        {
         "id": "les-bac-info-phys-5-02",
         "type": "cours",
         "title": "Oscillations amorties libres : étude théorique",
         "refs": [
          "MAHDI-PHYS-037",
          "MAHDI-PHYS-038"
         ]
        },
        {
         "id": "les-bac-info-phys-5-03",
         "type": "exercice",
         "title": "Exercice 1",
         "refs": [
          "MAHDI-PHYS-034",
          "MAHDI-PHYS-031"
         ]
        },
        {
         "id": "les-bac-info-phys-5-04",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "MAHDI-PHYS-035",
          "MAHDI-PHYS-032"
         ]
        },
        {
         "id": "les-bac-info-phys-5-05",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "MAHDI-PHYS-036",
          "MAHDI-PHYS-032"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-info-phys-6",
       "name": "Oscillations électriques libres non amorties",
       "items": [
        {
         "id": "les-bac-info-phys-6-01",
         "type": "cours",
         "title": "Oscillations non amorties : étude expérimentale",
         "refs": [
          "MAHDI-PHYS-054",
          "MAHDI-PHYS-039"
         ]
        },
        {
         "id": "les-bac-info-phys-6-02",
         "type": "cours",
         "title": "Oscillations non amorties : étude théorique (partie 1)",
         "refs": [
          "MAHDI-PHYS-050",
          "MAHDI-PHYS-039"
         ]
        },
        {
         "id": "les-bac-info-phys-6-03",
         "type": "cours",
         "title": "Oscillations non amorties : étude théorique (partie 2)",
         "refs": [
          "MAHDI-PHYS-053",
          "MAHDI-PHYS-039"
         ]
        },
        {
         "id": "les-bac-info-phys-6-04",
         "type": "exercice",
         "title": "Exercice 1",
         "refs": [
          "MAHDI-PHYS-051",
          "MAHDI-PHYS-040"
         ]
        },
        {
         "id": "les-bac-info-phys-6-05",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "MAHDI-PHYS-055",
          "MAHDI-PHYS-040"
         ]
        },
        {
         "id": "les-bac-info-phys-6-06",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "MAHDI-PHYS-052",
          "MAHDI-PHYS-041"
         ]
        },
        {
         "id": "les-bac-info-phys-6-07",
         "type": "exercice",
         "title": "Exercice 4",
         "refs": [
          "MAHDI-PHYS-043",
          "MAHDI-PHYS-041"
         ]
        },
        {
         "id": "les-bac-info-phys-6-08",
         "type": "exercice",
         "title": "Exercice 5",
         "refs": [
          "MAHDI-PHYS-044",
          "MAHDI-PHYS-042"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-info-phys-8",
       "name": "Oscillations électriques entretenues",
       "items": [
        {
         "id": "les-bac-info-phys-8-01",
         "type": "cours",
         "title": "Oscillations entretenues",
         "refs": [
          "MAHDI-PHYS-049",
          "MAHDI-PHYS-056"
         ]
        },
        {
         "id": "les-bac-info-phys-8-02",
         "type": "exercice",
         "title": "Exercice 1",
         "refs": [
          "MAHDI-PHYS-046",
          "MAHDI-PHYS-056"
         ]
        },
        {
         "id": "les-bac-info-phys-8-03",
         "type": "exercice",
         "title": "Exercice 2",
         "refs": [
          "MAHDI-PHYS-047",
          "MAHDI-PHYS-056"
         ]
        },
        {
         "id": "les-bac-info-phys-8-04",
         "type": "exercice",
         "title": "Exercice 3",
         "refs": [
          "MAHDI-PHYS-045",
          "MAHDI-PHYS-056"
         ]
        },
        {
         "id": "les-bac-info-phys-8-05",
         "type": "exercice",
         "title": "Exercice 4",
         "refs": [
          "MAHDI-PHYS-048",
          "MAHDI-PHYS-056"
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "subj-bac-info-francais",
     "name": "Bac Info - Français",
     "chapitres": [
      {
       "id": "ch-bac-info-fr-1",
       "name": "Module 1 : Souvenirs et nostalgie",
       "items": [
        {
         "id": "les-bac-info-fr-1-01",
         "type": "cours",
         "title": "Vocabulaire",
         "refs": [
          "RAOUEDHA-FR-017",
          "RAOUEDHA-FR-018"
         ]
        },
        {
         "id": "les-bac-info-fr-1-02",
         "type": "cours",
         "title": "La cause et la conséquence",
         "refs": [
          "RAOUEDHA-FR-012",
          "RAOUEDHA-FR-013"
         ]
        },
        {
         "id": "les-bac-info-fr-1-03",
         "type": "exercice",
         "title": "Exercice cause et conséquence",
         "refs": [
          "RAOUEDHA-FR-010",
          "RAOUEDHA-FR-011"
         ]
        },
        {
         "id": "les-bac-info-fr-1-04",
         "type": "cours",
         "title": "Texte explicatif, texte argumentatif : quelle différence ?",
         "refs": [
          "RAOUEDHA-FR-019",
          "RAOUEDHA-FR-014"
         ]
        },
        {
         "id": "les-bac-info-fr-1-05",
         "type": "cours",
         "title": "Expression écrite : texte explicatif",
         "refs": [
          "RAOUEDHA-FR-020",
          "RAOUEDHA-FR-021"
         ]
        },
        {
         "id": "les-bac-info-fr-1-06",
         "type": "cours",
         "title": "Expression écrite : texte explicatif (application)",
         "refs": [
          "RAOUEDHA-FR-022",
          "RAOUEDHA-FR-023"
         ]
        },
        {
         "id": "les-bac-info-fr-1-07",
         "type": "cours",
         "title": "Étude de texte : lire et comprendre une question de compréhension",
         "refs": [
          "RAOUEDHA-FR-025",
          "RAOUEDHA-FR-024"
         ]
        },
        {
         "id": "les-bac-info-fr-1-08",
         "type": "cours",
         "title": "Répondre à une question portant sur les procédés d'écriture (application)",
         "refs": [
          "RAOUEDHA-FR-016",
          "RAOUEDHA-FR-015"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-info-fr-2",
       "name": "Module 2 : Histoire d'amour",
       "items": [
        {
         "id": "les-bac-info-fr-2-01",
         "type": "cours",
         "title": "Le but",
         "refs": [
          "RAOUEDHA-FR-007",
          "RAOUEDHA-FR-001"
         ]
        },
        {
         "id": "les-bac-info-fr-2-02",
         "type": "exercice",
         "title": "Le but : exercices",
         "refs": [
          "RAOUEDHA-FR-005",
          "RAOUEDHA-FR-006"
         ]
        },
        {
         "id": "les-bac-info-fr-2-03",
         "type": "cours",
         "title": "Étude de texte : répondre aux questions de compréhension",
         "refs": [
          "RAOUEDHA-FR-008",
          "RAOUEDHA-FR-009"
         ]
        },
        {
         "id": "les-bac-info-fr-2-04",
         "type": "cours",
         "title": "Expression écrite : le point de vue absolu",
         "refs": [
          "RAOUEDHA-FR-003",
          "RAOUEDHA-FR-002"
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "subj-bac-info-arabe",
     "name": "Bac Info - Arabe",
     "chapitres": [
      {
       "id": "ch-bac-info-ar-1",
       "name": "محور 1 في التفكير العلمي",
       "items": [
        {
         "id": "les-bac-info-ar-1-01",
         "type": "cours",
         "title": "العوامل التي ساعدت العرب على الإبداع",
         "refs": [
          "NAJEH-AR-045"
         ]
        },
        {
         "id": "les-bac-info-ar-1-02",
         "type": "cours",
         "title": "المناهج العلمية وصفات العالم المسلم",
         "refs": [
          "NAJEH-AR-047"
         ]
        },
        {
         "id": "les-bac-info-ar-1-03",
         "type": "cours",
         "title": "العلوم العربية",
         "refs": [
          "NAJEH-AR-043"
         ]
        },
        {
         "id": "les-bac-info-ar-1-04",
         "type": "exercice",
         "title": "التدرب على فقرة حجاجية",
         "refs": [
          "NAJEH-AR-044"
         ]
        }
       ]
      },
      {
       "id": "ch-bac-info-ar-2",
       "name": "محور 2 في الأدب والفن",
       "items": [
        {
         "id": "les-bac-info-ar-2-01",
         "type": "cours",
         "title": "الأدب والشعر",
         "refs": [
          "NAJEH-AR-048"
         ]
        },
        {
         "id": "les-bac-info-ar-2-02",
         "type": "cours",
         "title": "الأدب نثرا ونقدا",
         "refs": [
          "NAJEH-AR-049"
         ]
        },
        {
         "id": "les-bac-info-ar-2-03",
         "type": "cours",
         "title": "الفن",
         "refs": [
          "NAJEH-AR-050"
         ]
        },
        {
         "id": "les-bac-info-ar-2-04",
         "type": "cours",
         "title": "الاجابة على أهم الأسئلة",
         "refs": [
          "NAJEH-AR-051"
         ]
        },
        {
         "id": "les-bac-info-ar-2-05",
         "type": "exercice",
         "title": "اصلاح فرض حول محور الأدب والفن",
         "refs": [
          "NAJEH-AR-052"
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "subj-bac-info-anglais",
     "name": "Bac Info - Anglais",
     "chapitres": []
    },
    {
     "id": "subj-bac-info-philosophie",
     "name": "Bac Info - فلسفة",
     "chapitres": [
      {
       "id": "ch-bac-info-philo-1",
       "name": "محور الانية و الغيرية",
       "items": [
        {
         "id": "les-bac-info-philo-1-01",
         "type": "cours",
         "title": "تمهيد محور الإنية و الغيرية",
         "refs": [
          "WALID-PHILO-009",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-info-philo-1-02",
         "type": "cours",
         "title": "تعالي الانية على الغيرية",
         "refs": [
          "WALID-PHILO-008",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-info-philo-1-03",
         "type": "cours",
         "title": "الانية بما هي ذات واعية (ديكارت)",
         "refs": [
          "WALID-PHILO-001",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-info-philo-1-04",
         "type": "cours",
         "title": "في جدلية الانية و الغيرية",
         "refs": [
          "WALID-PHILO-011",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-info-philo-1-05",
         "type": "cours",
         "title": "الذات المتجسدة",
         "refs": [
          "WALID-PHILO-003",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-info-philo-1-06",
         "type": "cours",
         "title": "تاسيس انطولوجيا جديدة للجسد",
         "refs": [
          "WALID-PHILO-007",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-info-philo-1-07",
         "type": "cours",
         "title": "الوعي بما هو تشكل تاريخي",
         "refs": [
          "WALID-PHILO-005",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-info-philo-1-08",
         "type": "cours",
         "title": "الوعي بناء تاريخي (ماركس)",
         "refs": [
          "WALID-PHILO-006",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-info-philo-1-09",
         "type": "cours",
         "title": "جدلية الوعي و اللاوعي",
         "refs": [
          "WALID-PHILO-010",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-info-philo-1-10",
         "type": "cours",
         "title": "التكامل بين الوعي و الاوعي",
         "refs": [
          "WALID-PHILO-002",
          "WALID-PHILO-012"
         ]
        },
        {
         "id": "les-bac-info-philo-1-11",
         "type": "cours",
         "title": "الغيرية كامنة في الذات",
         "refs": [
          "WALID-PHILO-004",
          "WALID-PHILO-012"
         ]
        }
       ]
      }
     ]
    },
    {
     "id": "subj-bac-info-sti",
     "name": "Bac Info - STI",
     "chapitres": []
    },
    {
     "id": "subj-bac-info-chinois",
     "name": "Bac Info - Chinois",
     "chapitres": []
    },
    {
     "id": "subj-bac-info-dessin",
     "name": "Bac Info - Dessin",
     "chapitres": []
    },
    {
     "id": "subj-bac-info-musique",
     "name": "Bac Info - Musique",
     "chapitres": []
    },
    {
     "id": "subj-bac-info-portugais",
     "name": "Bac Info - Portugais",
     "chapitres": []
    },
    {
     "id": "subj-bac-info-russe",
     "name": "Bac Info - Russe",
     "chapitres": []
    },
    {
     "id": "subj-bac-info-sciences-de-la-vie-et-de-la-terre",
     "name": "Bac Info - SVT",
     "chapitres": []
    },
    {
     "id": "subj-bac-info-turc",
     "name": "Bac Info - Turc",
     "chapitres": []
    },
    {
     "id": "subj-bac-info-allemand",
     "name": "Bac Info - Allemand",
     "chapitres": []
    },
    {
     "id": "subj-bac-info-espagnol",
     "name": "Bac Info - Espagnol",
     "chapitres": []
    },
    {
     "id": "subj-bac-info-italien",
     "name": "Bac Info - Italien",
     "chapitres": []
    },
    {
     "id": "subj-bac-info-mae-wael",
     "name": "Bac Info - مع وائل",
     "chapitres": []
    }
   ]
  }
 ]
};
