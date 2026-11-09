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
- Recherche : sera raccordée au moteur de `D:\sufi-knowledge` (hybride + RAG) via une API stable ; ne pas appeler Mongo depuis le site.
- Déploiement : `cd apps/web && ./deploy/deploy.sh` (VM partagée avec itvision, conteneur `jamah-web` limité à 300 Mo).
- Versions de dépendances épinglées (identiques à `D:\sufi-knowledge` quand possible).

## Règles éditoriales
- Ne jamais inventer citations, dates, biographies, références. Démo = « FICTIF ».
- Pages provisoires : `noindex`, hors sitemap.
