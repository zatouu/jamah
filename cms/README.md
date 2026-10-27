# CMS — Directus

Directus administre le contenu éditorial (auteurs, ouvrages, passages, commentaires, vidéos, articles, événements) sur PostgreSQL.

- Interface : http://localhost:8055 (identifiants : `DIRECTUS_ADMIN_EMAIL` / `DIRECTUS_ADMIN_PASSWORD` du `.env`)
- `extensions/` : extensions Directus éventuelles (montées dans le conteneur)
- `schema/` (phase 3) : snapshot du schéma versionné, appliqué via `npx directus schema apply`

Le modèle de contenu et le workflow éditorial (brouillon → en vérification → validé → publié → corrigé/retiré) sont définis en phase 3.
