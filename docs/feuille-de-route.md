# Feuille de route

| Phase | Contenu | État |
|---|---|---|
| 1 | Audit de l'existant, dossier de recherche, socle technique (monorepo, Compose, site FR/AR, Search Service `/health`, CI) | ✅ livré — inventaire MongoDB bloqué (cluster Atlas introuvable) |
| 2 | Spécifications produit, sitemap validé, parcours, maquettes des gabarits | à venir |
| 3 | Modèle de contenu Directus (schéma versionné), rôles et workflow, données FICTIF, outil d'import | à venir |
| 4 | Gabarits éditoriaux (article, auteur, ouvrage, passage, vidéo, événement), lecteur parallèle | à venir |
| 5 | Indexation Elasticsearch (FR, AR, translittération), API `/v1/search`, `/v1/suggest` | à venir |
| 6 | Page de résultats, commentaires contextuels (survol / toucher) | à venir |
| 7 | Tests E2E, accessibilité, SEO (JSON-LD, hreflang), sécurité, déploiement | à venir |
| 8 | Préparation recherche hybride / RAG | à venir |

## Reste à faire après la phase 1

- [ ] Fournir un accès au corpus MongoDB existant (URI valide ou `mongodump`) → `tools/inventory-mongo`
- [ ] Réponses de la Jamah aux questions du dossier biographique (§5)
- [ ] Relecture de la traduction arabe de l'interface (`apps/web/src/i18n/dictionaries/ar.ts`), en particulier les graphies arabes des noms
- [ ] Démarrer Docker Desktop et valider `docker compose up` de bout en bout
- [ ] Photothèque de la Jamah (avec autorisations) pour remplacer les emplacements « photo à fournir » : portrait officiel de Cheikh Ousmane Mbow, Gamou de Boubacar, ḥaḍra, dars
- [ ] Vérifier les droits de la photographie d'archive de Cheikh Ibrāhīm Niasse (Wikimedia Commons, `File:Ibrahim_Niyass.jpg`, licence CC BY-SA 4.0 déclarée par la personne qui l'a mise en ligne, auteur original inconnu) ou la remplacer par une photo fournie par la Jamah
- [ ] Image propre à Cheikh Ould Khayri / Boubacar (actuellement : dunes du Trarza)
- [ ] Vidéos YouTube officielles (identifiants des chaînes et vidéos autorisées)
- [ ] Texte arabe original de la citation du premier discours de Cheikh Ould Khayri (25/08/1978)
- [ ] Coordonnées de contact (e-mail, WhatsApp, adresse des assemblées)
