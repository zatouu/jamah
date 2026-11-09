# Feuille de route

Feuille de route validée (prompt directeur, novembre 2026). Chaque phase se termine par un bilan avant la suivante.

| Phase | Contenu | État |
|---|---|---|
| 0 | Socle : monorepo, site FR/AR, dossier biographique v0, CI, déploiement de préproduction | ✅ |
| 1 | Consolidation : plan du site conforme au prompt, navigation, gabarits de rubrique et de personne, accueil (parcours, Cheikh Ould Khayri, Cheikh Ousmane Mbow), recherche honnête, SEO/sécurité | ✅ livré (voir bilan) |
| 2 | Bibliothèque et catalogue YouTube : modèles documents/vidéos, CMS, import YouTube Data API, catégorisation, pages vidéo, associations, administration ; **raccordement de la recherche à sufi-knowledge** | à venir |
| 3 | Gestion documentaire avancée : textes AR/FR, traductions, translittérations, commentaires, références, transcriptions, chapitrage, validation | à venir |
| 4 | Recherche : amélioration du moteur de sufi-knowledge (normalisation arabe, bilingue, filtres, transcriptions), Elasticsearch si nécessaire | à venir |
| 5 | Intelligence documentaire : recherche hybride, RAG sourcé (sufi-knowledge), recommandations validées | à venir |

## Décision : recherche et RAG

La recherche du site s'appuiera sur **sufi-knowledge** (recherche hybride texte + vecteurs, chat RAG avec citations),
à améliorer. Le site n'appellera ce moteur que par une API stable (proxy côté serveur), afin de pouvoir le faire évoluer
sans réécrire le frontend. `services/search` (FastAPI) reste en attente : à conserver comme façade ou à retirer en phase 2.

Points à traiter avant raccordement (constatés à l'audit de sufi-knowledge) :
- la base MongoDB Atlas configurée n'existe plus (DNS introuvable) : nouvelle base ou dump à fournir ;
- la route de recherche (1 564 lignes) doit être isolée derrière une API documentée (paramètres, format des résultats, citations) ;
- le corpus doit porter statut de validation, nature des sources et droits, comme le modèle du site ;
- le RAG ne doit répondre qu'à partir de documents publiés et toujours afficher ses références.

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
