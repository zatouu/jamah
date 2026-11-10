# AGENTS.md — jamah-site

## Vérifications
- Site : `cd apps/web && npm run lint && npm run typecheck && npm test && npm run build`
- Search Service : `cd services/search && .venv/Scripts/python -m pytest -q` (Windows ; `py` = Python 3.13 local)
- Compose : `docker compose --env-file .env.example config --quiet`

## Conventions
- Next.js 16 : `src/proxy.ts` (ex-middleware) redirige vers `/fr` ou `/ar` ; `params` est une Promise.
- Langues : `src/i18n/config.ts` ; libellés dans `src/i18n/dictionaries/{fr,ar}.ts` (fr = type de référence).
- Sitemap applicatif : `src/lib/navigation.ts` (slugs = clés des dictionnaires, testé).
- Styles : Tailwind v4, tokens dans `src/app/globals.css` ; propriétés logiques (`ms-`, `ps-`, `start-`) pour le RTL.
- Rubriques : `[...slug]/page.tsx` (vue d'ensemble + sous-rubrique), contenus attendus dans `src/content/editorial-spec.ts`.
  Toute nouvelle rubrique = slug dans `navigation.ts` + libellés FR **et** AR (le test exige des dictionnaires de même structure).
- Liens internes des dictionnaires : vérifiés par `navigation.test.ts` (`isKnownPath`). Anciennes URL → `redirects()` de `next.config.ts`.
- Vidéos : `src/content/videos.ts` (champs `youtube` synchronisés / `editorial` jamais écrasés) ; seules `published` + `public` sont affichées.
- Recherche : `services/search` (FastAPI + Elasticsearch, plugin ICU). Mot à mot (analyseurs `jamah_ar` / `jamah_fr` / `jamah_exact`,
  fuzziness, phrase exacte entre guillemets) + sémantique locale (fastembed, `SEARCH_EMBEDDING_MODEL`, vide = lexical seul),
  fusion RRF calculée en Python (pas le `retriever: rrf` d'ES, soumis à licence). Filtre `status=published` toujours appliqué.
  Le site appelle `SEARCH_API_URL` côté serveur (`src/lib/search.ts`) ; surlignage par marqueurs `\ue000`/`\ue001`, jamais de HTML.
  Ne jamais appeler Elasticsearch ni Mongo depuis le site. Ne pas dépendre de MongoDB Atlas.
- sufi-knowledge (`D:\sufi-knowledge`, Atlas en pause) : **source** de données et de modules à porter, pas un service à raccorder.
- Déploiement : `cd apps/web && ./deploy/deploy.sh` (VM partagée avec itvision, conteneur `jamah-web` limité à 300 Mo).
  `SEARCH_API_URL` optionnel (vide = la page de recherche annonce « bientôt »).
- Versions de dépendances épinglées. Pas de nouvelle dépendance npm sans mettre à jour `package-lock.json` (la CI fait `npm ci`).

## Règles éditoriales
- Ne jamais inventer citations, dates, biographies, références. Démo = « FICTIF ».
- Pages provisoires : `noindex`, hors sitemap.
- Nom : **Jamah Sayroul Abad** (confirmé). Graphie arabe encore « سير العبيد » : à confirmer par la Jamah avant de la changer.
- Chaîne YouTube officielle : SAYROUL ABAD, `UCaUPqk9qgC9tkh16mZF6OCQ` (flux RSS sans clé : 15 dernières vidéos).
  Vidéos polémiques (débats) : publication uniquement après validation de la Jamah.

## État au 10/11/2026 (reprise)

Commit `4155974` (transféré par `jamah.bundle` faute d'accès GitHub sur le poste d'origine, sans Node ni Docker).
Fait :
- rubrique **Awliyâ’** (`awliya`, 6 sous-rubriques) ajoutée au menu, FR/AR, spec éditoriale, image `manuscrit` ;
- renommage Sayroul Eubeud → Sayroul Abad ; relecture : pluriels du compte à rebours (`Intl.PluralRules`, mêmes clés FR/AR),
  suppression de « † » (→ « m. 1975 » / « ت 1975م »), « la Fayḍa » au féminin, phrase arabe des Gamouwaat ;
- design : `--radius-card` 1.5rem, `rounded-panel`, `shadow-soft`, sections de l'accueil en panneaux arrondis, titres en sans-serif ;
- `services/search` : `normalize.py`, `fusion.py`, `index_schema.py`, `embeddings.py`, `engine.py`, `models.py`, API
  `/v1/search`, `/v1/suggest`, `/v1/admin/setup`, `POST|DELETE /v1/documents` (Bearer `SEARCH_INDEX_TOKEN`) — 11 tests verts ;
- page `bibliotheque/recherche` branchée sur le service (`src/lib/search.ts` + `search.test.ts`) ;
- `docs/feuille-de-route.md` mis à jour (décision du 10/11/2026).

**Non vérifié** (pas de Node sur le poste d'origine) : lint, typecheck, vitest, build, rendu visuel. À faire en premier :
1. `cd apps/web && npm ci && npm run lint && npm run typecheck && npm test && npm run build` ; corriger ce qui casse.
2. Vérifier à l'écran : menu desktop à 8 entrées (1280 px, FR et AR), tiroir mobile, nouveau style arrondi.
3. `cp .env.example .env && docker compose up -d postgres directus elasticsearch search`, puis
   `curl -X POST -H "Authorization: Bearer $SEARCH_INDEX_TOKEN" localhost:8000/v1/admin/setup` et un essai d'indexation.

Suite (dans l'ordre) :
1. **Directus** (local, VM dédiée prévue dans la semaine) : collections `pages` (chemin de rubrique, statut, nature, sources,
   corps Markdown FR/AR), `media` (auteur, licence, consentement), `documents` (écrits de Cheikh Ousmane Mbow : fichier, langue,
   type, droits), `videos` (champs YouTube + éditoriaux) ; rôles rédacteur / relecteur / admin ; rôle Public en lecture
   filtrée `status = published` ; script d'amorçage idempotent (`cms/scripts/`) ; flow Directus → `POST /v1/documents`.
2. Site : lire les pages publiées depuis Directus (`CMS_URL`, ISR) ; rendu Markdown **sans** HTML brut (pas de nouvelle
   dépendance sans lockfile) ; page indexable + sitemap dès qu'un contenu est publié ; images Directus (`remotePatterns`, CSP `img-src`).
3. Import YouTube : flux RSS de la chaîne → vidéos en `draft` ; clé YouTube Data API plus tard pour l'historique complet.
4. sufi-knowledge : réactiver le cluster Atlas, commiter ses 217 modifications, `tools/inventory-mongo`, migration ponctuelle
   des documents utiles en `draft` (droits vérifiés) ; porter citations, découpage, lecteur comparatif, apprentissage des poèmes.
5. Déploiement : site sur la VM partagée (`SEARCH_API_URL` vers la VM dédiée) ; Directus + Postgres + Elasticsearch + search
   sur la VM dédiée (4 Go conseillés avec Elasticsearch et le modèle sémantique).
6. Retirer `feed.tmp.xml` de la racine (fichier temporaire commité par erreur).

À obtenir de la Jamah : graphie arabe du nom, présentation de la Jamah, contact, présentation validée de Cheikh Ousmane Mbow
et portrait (avec accord), réponses au dossier biographique §5, photos (auteur, date, accord), premiers écrits de Cheikh
Ousmane Mbow (Word d'origine + droits), choix des vidéos publiables, nom de domaine.
