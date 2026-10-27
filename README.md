# Jamah Sayroul Eubeud — site officiel

Plateforme éditoriale, pédagogique et documentaire : Coran et Sunna, Tijâniyya, Fayḍa Ibrahimiyya,
héritage de Cheikh Ould Khayri et enseignements de Cheikh Ousmane Mbow. Français et arabe (wolof prévu).

## Architecture

```
apps/web          Next.js 16 (App Router, SSG, routes /fr et /ar, RTL) — site public
services/search   FastAPI — API de recherche stable (/v1), seule porte d'accès à Elasticsearch
cms/              Directus 11 (sur PostgreSQL) — administration et workflow éditorial
infra/            Images personnalisées (Elasticsearch + plugin ICU)
tools/            Outils hors site (inventaire du corpus existant, import en phase 3)
docs/             Audit, recherche documentaire, décisions
```

Flux : éditeurs → Directus → PostgreSQL ; publication → webhook → Search Service → Elasticsearch ;
visiteurs → Next.js → (CMS en lecture, Search Service `/v1`).

## Démarrage

### Tout en Docker

```bash
cp .env.example .env        # puis remplacer toutes les valeurs « change-me »
docker compose up -d --build
```

| Service | URL |
|---|---|
| Site | http://localhost:3000 |
| Directus | http://localhost:8055 |
| Search Service | http://localhost:8000/health · http://localhost:8000/docs |
| Elasticsearch | http://localhost:9200 |

### Développement du site seul

```bash
cd apps/web
npm install
npm run dev          # http://localhost:3000
npm run lint && npm run typecheck && npm test && npm run build
```

### Search Service seul

```bash
cd services/search
python -m venv .venv && .venv/Scripts/pip install -r requirements-dev.txt   # Windows (bin/ sous Linux)
.venv/Scripts/python -m pytest -q
.venv/Scripts/uvicorn app.main:app --reload
```

## Variables d'environnement

Voir `.env.example` (aucune valeur réelle n'est versionnée).

| Variable | Rôle |
|---|---|
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Base du CMS |
| `DIRECTUS_SECRET`, `DIRECTUS_ADMIN_EMAIL`, `DIRECTUS_ADMIN_PASSWORD`, `DIRECTUS_PUBLIC_URL` | CMS |
| `ES_JAVA_OPTS` | Mémoire Elasticsearch |
| `SEARCH_ES_URL`, `SEARCH_INDEX_PREFIX`, `SEARCH_INDEX_TOKEN` | Search Service |
| `NEXT_PUBLIC_SITE_URL`, `SEARCH_API_URL`, `CMS_URL` | Site public |

## Principes éditoriaux

- Aucun contenu religieux, citation, date ou référence n'est inventé. Les contenus de démonstration sont marqués **FICTIF**.
- Texte original, traduction, translittération, paraphrase et commentaire sont toujours distingués.
- Workflow : brouillon → en vérification → validé → publié → corrigé/retiré.
- Les rubriques non rédigées sont des pages provisoires `noindex`, exclues du sitemap.
- Images : registre unique `apps/web/src/content/media.ts` (auteur, licence, source), affiché sur `/[lang]/credits`.
  Aucun faux portrait : les photos manquantes sont des emplacements « photo à fournir » (`PhotoSlot`).

## Documentation

- `docs/audit-sufi-knowledge.md` — audit du projet existant et modules à porter
- `docs/recherche/dossier-biographique.md` — dossier de recherche (non publiable)
- `docs/feuille-de-route.md` — phases et état d'avancement
