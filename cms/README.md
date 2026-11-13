# CMS - Directus

Directus gère tout le contenu du site : textes de l'accueil, coordonnées, pages de rubriques (FR/AR), images et
crédits, galerie, rendez-vous, vidéos, documents. Les données sont dans PostgreSQL.

- Interface : http://localhost:8055 (identifiants : `DIRECTUS_ADMIN_EMAIL` / `DIRECTUS_ADMIN_PASSWORD` du `.env`).
- `extensions/` : extensions Directus éventuelles (montées dans le conteneur).
- `scripts/` : initialisation du modèle et import des contenus actuels du site.

## Mise en place (une fois, puis à chaque évolution du modèle)

```sh
cp .env.example .env            # renseigner les secrets, dont REVALIDATE_TOKEN (openssl rand -hex 32)
docker compose up -d postgres directus web
docker compose run --rm cms-setup
```

`cms-setup` lance `bootstrap.mjs` puis `seed.mjs`. Les deux sont idempotents : relancer ne remplace rien.

- `bootstrap.mjs` : collections et champs, champs de crédit sur les fichiers, droits du rôle Public (lecture des seules
  fiches publiées et des seuls fichiers « Visible sur le site »), rôles Rédacteur et Relecteur, flow « Mise à jour du site ».
- `seed.mjs` : importe les textes et images actuels du site dans les champs et collections encore vides.
  Les 78 pages de rubrique sont créées en brouillon, sans corps.

Hors Docker : Node 22.18 minimum, `DIRECTUS_URL`, et `DIRECTUS_TOKEN` (ou e-mail / mot de passe administrateur).

## Rôles et circuit de validation

| Rôle | Droits |
|---|---|
| Rédacteur | crée et modifie en `draft` ou `in_review` ; ne publie pas, ne supprime pas |
| Relecteur | tous droits sur le contenu ; publie (`published`) |
| Administrateur | modèle, utilisateurs, réglages |

Un contenu n'apparaît sur le site que s'il est `published`. Une image n'apparaît que si « Visible sur le site » est coché.
Pour chaque image, renseigner l'auteur, la licence et la source : la page Crédits est générée à partir de ces champs.

## Règles de saisie

- Chaque texte a deux champs : `_fr` et `_ar`. Un champ vide garde le texte par défaut du site (rien ne casse).
- Une page de rubrique devient visible par les moteurs de recherche et entre dans le sitemap dès que son corps est
  publié dans la langue concernée. Sans corps, elle reste « en préparation » (noindex).
- Corps en Markdown simple : titres `##`, listes, **gras**, *italique*, liens, citations `>`. Le HTML n'est pas interprété.
- Ne jamais inventer citations, dates ni références : renseigner les sources et la nature du contenu.

## Délai d'affichage

Le site relit Directus toutes les 5 minutes. Le flow « Mise à jour du site » (déclenché à l'enregistrement) force la
mise à jour immédiate via `POST /api/revalidate` du site (jeton `REVALIDATE_TOKEN`). Si Directus est indisponible,
le site continue de servir la dernière version connue.
