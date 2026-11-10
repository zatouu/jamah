# Audit du dépôt `sufi-knowledge` (Ma'rifa) — Phase 1

> Dépôt audité : `D:\sufi-knowledge` (Next.js 16.1.3, React 19, MongoDB, BullMQ/Redis, Gemini/LLM local).
> Objectif : décider ce qui peut servir au site de la Jamah Sayroul Abad.
> Décision : **nouveau dépôt `jamah-site`**, avec portage ciblé de modules de l'existant.

## 1. État constaté

| Élément | Constat |
|---|---|
| Taille | ~69 000 lignes TS/TSX ; 67 routes API ; 38 composants de lecteur |
| Qualité | 35 fichiers de tests / 157 tests verts (`test_output.txt`) ; lint : 0 erreur, 17 avertissements |
| Outillage | CI GitHub (lint, types, tests, build, Playwright), Lighthouse CI, Docker, nginx, guide EC2 |
| Git | 3 commits ; **217 modifications non commitées** au moment de l'audit |
| Base de données | MongoDB Atlas — **le cluster configuré n'existe plus** (DNS NXDOMAIN au 27/10/2026) |
| Secrets | `.env.local` correctement ignoré par git |

## 2. Pourquoi ne pas le réutiliser tel quel

1. **Autre produit** : application communautaire (profils, follow, feed, avis, collections, chat IA, profils d'apprentissage) ; la Jamah a besoin d'un site **éditorial** avec corpus contrôlé.
2. **Modèle de contenu centré fichier** : `KnowledgeDocument` (un fichier téléversé) → `KnowledgePassage` (découpage). Pas d'entités *ouvrage / édition / traduction / provenance / droits* ; `workId` est une simple chaîne. Le commentaire (`Commentary`) n'a qu'un `passageId` optionnel : pas de relation N–N qualifiée.
3. **Pas de CMS** : saisie par upload/collage, aucun workflow éditorial complet (seule une file `pending / validated / dismissed` existe pour 3 cas).
4. **Complexité du lecteur** : `document-detail-client.tsx` = 5 209 lignes, 8 modes de lecture (constat déjà formulé dans `AUDIT-Kimi`).
5. **i18n non indexable** : langue stockée côté client (`localStorage` + contexte React), pas de routes `/fr` `/ar`, donc pas de `hreflang`.
6. **Recherche** : MongoDB `$text` + regex + Damerau-Levenshtein en JS + `$vectorSearch` Atlas, dans une route Next de 1 564 lignes. Pas d'analyseur arabe, pas de surlignage natif, pas de facettes performantes, pas d'API stable séparée.
7. **Dépendances lourdes pour un site public** : tesseract.js, @xenova/transformers, BullMQ, Keycloak, OpenAI + Gemini.

## 3. Modules à porter (phases 4–5)

| Source (`sufi-knowledge/src/…`) | Cible `jamah-site` | Phase | Remarque |
|---|---|---|---|
| `lib/search/fuzzy.ts` → `normalizeArabic…` | règles d'analyse ES + normalisation requête (Python) | 5 | Tashkīl, alif/hamza, tāʾ marbūṭa, alif maqṣūra |
| `lib/knowledge/citation.ts` (+ tests) | `passage.anchor` stable | 3–4 | Identifiants de citation et liens profonds |
| `lib/knowledge/reader-text.ts`, `chunk.ts` (+ tests) | outil d'import (hors site) | 3 | Reconstruction des paragraphes OCR |
| `lib/knowledge/alignment.ts`, `parallel-reader.ts` | lecteur parallèle original / traduction | 4 | Alignement par progression |
| `lib/knowledge/extract/*`, `scripts/ocr_local_pdf.py` | `tools/import` | 3 | PyMuPDF + PaddleOCR, local d'abord |
| `lib/media/links.ts`, `MediaItem.linkedPassages` | `commentary_passage`, timecodes | 3 | Le concept média → passage précis est déjà là |
| `scripts/*-corpus.json` (`licenseStatus`, `sourceUrl`, `license`) | entités `provenance` / `rights` | 3 | Généraliser à tout contenu |
| `app/api/admin/validation-queue` | workflow Directus | 3 | Remplacé par statuts + permissions |
| `lib/text/rtl.ts`, polices Amiri | design system | 1 ✅ | Repris (Amiri pour textes vocalisés) |
| `e2e/`, `lighthouserc.json`, `.github/workflows/ci.yml` | CI `jamah-site` | 1 ✅ / 7 | CI reprise et adaptée au monorepo |
| `docs/UX_REDESIGN_STRATEGY.md` | principes de lecture | 4 | Colonne 600–720 px, corps 18 px, interligne 1,75 |

**Abandonnés pour le MVP** : social (follow, feed, avis, likes, collections), chat RAG, profils d'apprentissage, modes adaptatifs, Keycloak, BullMQ côté site.

## 4. Corpus existant connu (manifestes du dépôt)

L'inventaire de la base MongoDB n'a pas pu être réalisé (cluster Atlas introuvable). Le script
`tools/inventory-mongo` est prêt (lecture seule) dès qu'une base accessible ou un dump est fourni.
Corpus déclaré dans `sufi-knowledge/scripts/` :

| Manifeste | Contenu | Langue | Statut licence déclaré | Remarque pour la Jamah |
|---|---|---|---|---|
| `public-sufi-corpus.json` | Al-Ghazali, *Confessions* (Field, 1909) | en | approved (Gutenberg) | Hors périmètre prioritaire ; anglais |
| `public-sufi-corpus.json` | Al-Ghazali, *Religious and Moral Teachings* (1921) | en | approved (Gutenberg) | Idem |
| `public-sufi-corpus.json` | Ibn ʿArabī, *Tarjumān al-ashwāq* (Nicholson, 1911) | en | review_required, désactivé | Ne pas migrer en l'état |
| `quran-corpus.json` | Coran arabe + translittération + traduction française | ar-fr | **review_required** | Droits de la traduction française à établir avant toute diffusion |
| `hadith-corpus.json` | Recueils de hadiths (fawazahmed0/hadith-api) | ar-fr | approved (déclaré) | À revérifier : le jeu de données est libre, mais les **traductions** qu'il contient ont leurs propres droits |

**Aucun texte de Cheikh Ibrāhīm Niasse, de Cheikh Ould Khayri ni de Cheikh Ousmane Mbow n'est déclaré dans les manifestes.** Le corpus prioritaire de la Jamah reste donc à constituer.

## 5. Recommandations

1. Ne rien migrer automatiquement. Le texte arabe du Coran pourra être réimporté depuis une source à licence claire (ex. Tanzil, à vérifier) en phase 3.
2. Commiter ou archiver les 217 modifications de `sufi-knowledge` pour ne pas perdre de travail.
3. Si la base Atlas existe encore sous un autre cluster, fournir l'URI (ou un `mongodump`) pour compléter l'inventaire.
