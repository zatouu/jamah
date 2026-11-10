# Feuille de route

Feuille de route validée (prompt directeur, novembre 2026). Chaque phase se termine par un bilan avant la suivante.

| Phase | Contenu | État |
|---|---|---|
| 0 | Socle : monorepo, site FR/AR, dossier biographique v0, CI, déploiement de préproduction | ✅ |
| 1 | Consolidation : plan du site conforme au prompt, navigation, gabarits de rubrique et de personne, accueil (parcours, Cheikh Ould Khayri, Cheikh Ousmane Mbow), recherche honnête, SEO/sécurité | ✅ livré (voir bilan) |
| 2 | Bibliothèque et catalogue YouTube : modèles documents/vidéos, CMS Directus, import YouTube (chaîne SAYROUL ABAD `UCaUPqk9qgC9tkh16mZF6OCQ`), pages vidéo, administration ; **recherche hybride v1 (Elasticsearch)** | en cours |
| 3 | Gestion documentaire avancée : textes AR/FR, traductions, translittérations, commentaires, références, transcriptions, chapitrage, validation ; **migration ponctuelle du corpus utile de sufi-knowledge** | à venir |
| 4 | Recherche avancée : filtres, renvois Coran / hadith / écrits des saints, transcriptions wolof, lecteur comparatif et apprentissage des poèmes (portés de sufi-knowledge) | à venir |
| 5 | Intelligence documentaire : RAG sourcé sur les passages publiés, recommandations validées | à venir |

## Décision (10/11/2026) : recherche sur Elasticsearch, sufi-knowledge comme source

- Nom confirmé : **Jamah Sayroul Abad** (graphie arabe à confirmer).
- Nouvelle rubrique **Awliyâ’** (الأولياء) pour les saints et savants hors des grandes figures du site.
- La recherche est servie par `services/search` (FastAPI) sur **Elasticsearch**, sans dépendance à MongoDB Atlas :
  - mot à mot : analyseurs arabe / français (ICU), tolérance aux fautes, expression exacte entre guillemets ;
  - sémantique : vecteurs multilingues calculés localement (fastembed, aucune API externe) ;
  - fusion des deux classements par RRF ; seuls les contenus `published` sont indexés et cherchables.
- **sufi-knowledge** n'est plus un service à raccorder : c'est une **source** dont on migre une fois les données utiles
  (après réactivation du cluster Atlas et inventaire `tools/inventory-mongo`) et dont on porte des modules
  (normalisation arabe — déjà reprise —, citations, découpage, lecteur comparatif, apprentissage des poèmes).
- Directus est la source de vérité du contenu ; il alimente l'index via `POST /v1/documents` (jeton `SEARCH_INDEX_TOKEN`).
- Le RAG (phase 5) ne répondra qu'à partir de passages publiés, toujours avec ses références.

## Bilan de la phase 1

Fait :
- plan du site (`src/lib/navigation.ts`) : 8 rubriques, sous-rubriques conformes au prompt ; Cheikh Ould Khayri et Cheikh Ousmane Mbow au premier niveau ;
  redirections 308 des anciennes adresses (`next.config.ts`) ;
- en-tête : menus déroulants (survol et clavier), tiroir mobile (fermeture au clic, à la navigation et sur Échap), rubrique active ;
- gabarits : vue d'ensemble de rubrique (image, sous-rubriques, contenus attendus) et sous-rubrique (sous-navigation, précédent/suivant) ;
  légende « nature des informations » (fait documenté, témoignage, récit de la communauté, interprétation spirituelle, position de la Jamah) ;
- cahier des charges éditorial par rubrique (`src/content/editorial-spec.ts`) ;
- modèle vidéo et lecteur YouTube léger (`src/content/videos.ts`, `src/components/youtube-lite.tsx`) : registre vide, sections masquées tant qu'aucune vidéo n'est publiée ;
- accueil : parcours en 6 étapes, chaîne de transmission, mise en avant de Cheikh Ould Khayri et de Cheikh Ousmane Mbow ;
- page de recherche qui conserve la requête et annonce l'état du service ;
- SEO/sécurité : JSON-LD Organization + WebSite, image Open Graph, CSP, HSTS, sitemap (accueil + crédits) ; contrastes relevés sur fond sombre ;
- tests : cohérence du sitemap et des dictionnaires (structure FR = AR), validité de tous les liens internes, modèle vidéo.

Reste à faire / à fournir :
- [ ] Chaîne(s) YouTube officielle(s) de Cheikh Ousmane Mbow et clé YouTube Data API (phase 2)
- [ ] Choix d'hébergement pour la base et l'administration (VM dédiée recommandée)
- [ ] Relecture de l'arabe : `apps/web/src/i18n/dictionaries/ar.ts`, notamment les graphies ولد خيري, سير العبيد, عثمان امبو et les intitulés des sous-rubriques
- [ ] Réponses de la Jamah aux questions du dossier biographique (§5)
- [ ] Photothèque de la Jamah (avec autorisations) : portrait de Cheikh Ousmane Mbow, Gamou de Boubacar, ḥaḍra, dars
- [ ] Vérifier les droits de la photographie d'archive de Cheikh Ibrāhīm Niasse (`File:Ibrahim_Niyass.jpg`) ou la remplacer
- [ ] Texte arabe original de la citation du premier discours de Cheikh Ould Khayri (25/08/1978)
- [ ] Coordonnées de contact et nom de domaine définitif
