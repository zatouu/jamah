# Guide de rédaction — site de la Jamah Sayroul Abad

Pour toutes les personnes qui écrivent, traduisent, relisent ou publient sur le site.
Aucune connaissance technique n'est nécessaire.

| | Adresse |
|---|---|
| Site public | https://jamah.35-180-202-239.sslip.io (adresse provisoire, en attendant le nom de domaine) |
| Espace de rédaction (Directus) | https://cms.35-180-202-239.sslip.io |

> Ce guide évolue avec le site. La section [Fonctionnalités à venir](#10-fonctionnalités-à-venir) liste ce qui
> n'existe pas encore ; le [journal des mises à jour](#journal-des-mises-à-jour) en fin de document indique ce qui a changé.

## Sommaire

1. [Comment fonctionne le site](#1-comment-fonctionne-le-site)
2. [Rôles et circuit de validation](#2-rôles-et-circuit-de-validation)
3. [Découvrir l'interface Directus](#3-découvrir-linterface-directus)
4. [Règles communes de saisie](#4-règles-communes-de-saisie)
5. [Les collections, une par une](#5-les-collections-une-par-une)
6. [Images et fichiers](#6-images-et-fichiers)
7. [Ajouter une vidéo](#7-ajouter-une-vidéo)
8. [Transcrire et traduire une vidéo](#8-transcrire-et-traduire-une-vidéo)
9. [Traduire et corriger un texte](#9-traduire-et-corriger-un-texte)
10. [Fonctionnalités à venir](#10-fonctionnalités-à-venir)
11. [Questions fréquentes et dépannage](#11-questions-fréquentes-et-dépannage)
12. [Annexe : la technique en bref](#12-annexe--la-technique-en-bref)

---

## 1. Comment fonctionne le site

Le site est en deux parties :

- **Directus** est l'espace de rédaction. On y écrit les textes, on y dépose les images et on y prépare les
  traductions. Tout est enregistré dans une base de données.
- **Le site public** lit ce qui a été **publié** dans Directus et l'affiche aux visiteurs, en français, en arabe et en
  anglais. Il ne lit jamais les brouillons.

```
  Rédacteur ──écrit──▶ Directus ──« Publié »──▶ Site public ──▶ Visiteurs
                          │
                          └─ brouillons, relectures, notes internes : jamais visibles du public
```

**Délai d'affichage.** À chaque enregistrement, Directus demande au site de se mettre à jour : la modification est
visible **en quelques secondes**. À défaut, le site relit Directus toutes les 5 minutes. Si Directus est en panne, le
site continue d'afficher la dernière version connue.

**Textes par défaut.** Le site a été livré avec des textes et des images de départ. Tant qu'un champ est vide dans
Directus, c'est le texte de départ qui s'affiche : **vider un champ ne casse jamais une page**, cela ramène le texte
d'origine. Dès qu'un champ est rempli, c'est le texte de Directus qui l'emporte.

**Ce qui ne se modifie pas depuis Directus** (demande à l'équipe technique) : la mise en page, les couleurs, l'ordre des
sections de l'accueil, la liste des rubriques du menu et leurs adresses, les langues du site, les libellés des boutons
et de l'interface, l'ajout d'un nouveau type de contenu ou d'un nouveau champ.

---

## 2. Rôles et circuit de validation

### Les rôles

| Rôle | Ce qu'il peut faire | Ce qu'il ne peut pas faire |
|---|---|---|
| **Rédacteur** | Créer et modifier des fiches en *Brouillon* ou *En relecture* ; déposer des images et fichiers ; lire tout le contenu | Publier, valider, archiver, supprimer ; modifier une fiche déjà *Validée* ou *Publiée* ; modifier l'Accueil, les Réglages du site et les sections de l'accueil |
| **Relecteur** | Tout ce que fait le rédacteur, plus : valider, publier, archiver, supprimer ; modifier l'Accueil, les Réglages et les sections | Gérer les utilisateurs et le modèle de contenu |
| **Administrateur** | Tout, y compris créer les comptes et attribuer les rôles | — |

Pour obtenir un compte, s'adresser à un administrateur (menu **Utilisateurs** › bouton **+**, puis choix du rôle).

### Les statuts d'une fiche

Chaque fiche de contenu porte un **Statut** (pastille de couleur dans les listes) :

| Statut | Couleur | Signification | Visible sur le site ? |
|---|---|---|---|
| Brouillon | gris-bleu | En cours d'écriture | Non |
| En relecture | orange | Le rédacteur a terminé et demande une relecture | Non |
| Validé | bleu | Le relecteur a vérifié le fond (sources, traduction) ; prêt à publier | Non |
| Publié | vert | En ligne | **Oui** |
| Archivé | gris foncé | Retiré du site, conservé dans Directus | Non |

### Le circuit conseillé

1. Le **rédacteur** crée la fiche (elle naît en *Brouillon*), écrit, enregistre souvent.
2. Quand c'est prêt, il passe le statut à **En relecture** et enregistre. Il peut laisser un commentaire pour le
   relecteur (voir § 3.4).
3. Le **relecteur** vérifie : exactitude, sources, orthographe, traduction. Il corrige lui-même ou renvoie en
   *Brouillon* avec un commentaire.
4. Il passe en **Validé**, puis en **Publié** au moment voulu.
5. Pour retirer un contenu du site sans le perdre : **Archivé**.

> **Exception importante : l'Accueil, les Réglages du site et les sections de l'accueil n'ont pas de statut.**
> Une modification enregistrée sur ces fiches est **en ligne immédiatement**. Seuls les relecteurs et administrateurs
> peuvent les modifier.

---

## 3. Découvrir l'interface Directus

### 3.1 Se connecter

1. Ouvrir https://cms.35-180-202-239.sslip.io et saisir son courriel et son mot de passe.
2. Première fois : cliquer sur son avatar (en bas à gauche) pour vérifier la **langue de l'interface** (français) et
   changer son mot de passe.

### 3.2 La barre de modules (colonne d'icônes à gauche)

| Icône / module | Usage |
|---|---|
| **Contenu** (cube) | Toutes les collections du site : c'est là qu'on travaille au quotidien |
| **Bibliothèque de fichiers** (dossier) | Images, PDF, vidéos et sons déposés, avec leurs crédits |
| **Utilisateurs** (personnes) | Comptes et rôles (administrateurs) |
| **Insights** (graphique) | Tableaux de bord (non utilisé pour l'instant) |
| **Paramètres** (engrenage) | Modèle de contenu, rôles, automatisations (administrateurs uniquement) |
| **Notifications** (cloche) et **Activité** | Mentions dans les commentaires ; historique de qui a fait quoi |

### 3.3 Une liste de fiches

Dans **Contenu**, cliquer sur une collection (ex. *Pages des rubriques*) affiche la liste de ses fiches :

- **Recherche** (loupe en haut) : filtrer par mot.
- **Filtre** : par exemple « Statut = En relecture » pour voir ce qui attend une relecture.
- **Bouton +** (en haut à droite) : créer une fiche.
- Cliquer sur une ligne ouvre la fiche.

### 3.4 Une fiche ouverte

- **Le formulaire** au centre : un champ par information. Les champs de texte existent en trois versions :
  *(français)*, *(arabe)*, *(anglais)*.
- **Enregistrer** : bouton coché en haut à droite. Sa petite flèche propose aussi « Enregistrer et rester »,
  « Enregistrer et créer une nouvelle fiche », « Enregistrer comme copie ».
  **Directus n'enregistre pas automatiquement** : quitter la page sans enregistrer perd les modifications
  (un avertissement s'affiche).
- **Le panneau de droite** (s'ouvre avec les icônes à droite) :
  - **Informations** : création, dernière modification et auteur ;
  - **Révisions** : toutes les versions précédentes de la fiche, avec ce qui a changé ; on peut **revenir à une
    version antérieure** ;
  - **Commentaires** : échanger entre rédacteur et relecteur ; taper `@` suivi d'un nom pour notifier quelqu'un.
- **Supprimer** (corbeille, relecteurs uniquement) : définitif. Préférer **Archivé**.

> **Une seule personne à la fois par fiche.** Directus ne gère pas l'écriture simultanée : si deux personnes modifient la
> même fiche, le dernier enregistrement efface l'autre. Se coordonner, et en cas d'accident, récupérer le texte dans
> **Révisions**.

---

## 4. Règles communes de saisie

### 4.1 Langues

- Trois champs par texte : **français**, **arabe**, **anglais**. Le champ arabe s'écrit de droite à gauche.
- Un champ vide garde le texte par défaut du site dans cette langue.
- Exception : dans les **listes** (cartes de l'accueil, rendez-vous), un champ **anglais** vide affiche le **français**.
- La version anglaise est récente : la relire en priorité.

### 4.2 Mise en forme des textes longs (Markdown)

Le champ **Texte** des pages a une barre d'outils (titre, gras, italique, listes, citation, lien, séparateur). On peut
aussi taper directement :

| Écrire | Résultat |
|---|---|
| `## Titre de partie` | Titre de partie (ne pas utiliser un seul `#` : le titre de la page existe déjà) |
| `**mot**` | **gras** |
| `*mot*` | *italique* |
| `- élément` | liste à puces |
| `1. élément` | liste numérotée |
| `> citation` | citation mise en retrait |
| `[texte](https://adresse)` | lien |
| ligne vide | nouveau paragraphe |

Le HTML n'est pas interprété (par sécurité).

### 4.3 Règles éditoriales (non négociables)

- **Ne jamais inventer** une citation, une date, une biographie ou une référence. En cas de doute, ne pas publier et
  noter la question en commentaire.
- **Toujours citer ses sources** (champ *Sources* des pages, champs *source* des rendez-vous, crédits des images).
- Distinguer le **texte original**, sa **traduction**, une **paraphrase** et un **commentaire**.
- Indiquer la **nature de l'information** d'une page : *Documenté*, *Témoignage*, *Tradition de la communauté*,
  *Interprétation* ou *Position de la Jamah*.
- Les **vidéos de débat** ne se publient qu'après validation de la Jamah.
- Les images de personnes : uniquement avec leur accord (ou celui de la famille) et des droits clairs.

---

## 5. Les collections, une par une

Toutes se trouvent dans **Contenu**.

### 5.1 Réglages du site *(relecteurs)*

Une fiche unique. Nom du site, titre et description pour les moteurs de recherche (Google), présentation et mention
éditoriale du pied de page, adresse, courriel, téléphone, liens YouTube, Facebook, WhatsApp.
En ligne dès l'enregistrement. Les liens doivent commencer par `https://`.

### 5.2 Accueil *(relecteurs)*

Une fiche unique : le haut de la page d'accueil.

- **Image du bandeau** : la grande image du haut (voir § 6 pour les crédits).
- **Salutation**, **Titre**, **Introduction**, **Bouton principal**, **Bouton secondaire**.
- **Citation** et son **Auteur**, **Contexte**, **Libellé de la source**, **Lien de la source**, **Note**.

En ligne dès l'enregistrement.

### 5.3 Accueil : sections *(relecteurs)*

Une fiche par section de l'accueil : *Les maîtres, Parcours, Cheikh Ould Khayri, Cheikh Ousmane Mbow, Vidéos, Vie de la
Jamah, Rendez-vous, Bibliothèque, Galerie, Rejoindre*. Pour chacune : surtitre (petit texte au-dessus du titre), titre,
texte, note, libellé du lien, et une image pour les sections *Cheikh Ould Khayri*, *Rendez-vous* et *Bibliothèque*.
Ne pas créer de nouvelle fiche : les 10 sections existent déjà. En ligne dès l'enregistrement.

### 5.4 Accueil : cartes

Les petites cartes des groupes **Les maîtres**, **Parcours** et **Vie de la Jamah**.

- **Groupe**, **Page liée** (la rubrique vers laquelle la carte renvoie), **Titre** (pour un maître : son nom), **Texte**,
  **Mention** (dates, lieu), **Image**.
- L'ordre se règle par glisser-déposer dans la liste (poignée à gauche des lignes).
- **Attention** : dès qu'**une** carte d'un groupe est publiée, les cartes publiées **remplacent toutes** les cartes par
  défaut de ce groupe. Publier donc toutes les cartes d'un groupe en même temps.

### 5.5 Rendez-vous

Les rencontres de la Jamah (Gamou, ziarra…).

- **Date**, **Revient chaque année** (le compte à rebours vise la prochaine occurrence du jour et du mois).
- **Mis en avant** : alimente le **compte à rebours** de l'accueil (le plus proche est affiché).
- **Afficher sur l'accueil** : apparaît dans la liste des rendez-vous de l'accueil.
- **Titre**, **Libellé du compte à rebours**, **Lieu**, **Description**, **Source** (libellé et lien), **Image**.

### 5.6 Galerie (accueil)

Les images de la galerie de l'accueil, dans l'ordre choisi (glisser-déposer). **Taille** : *Normale*, *Large* (deux
colonnes) ou *Grande*. Une galerie publiée remplace la galerie par défaut.

### 5.7 Pages des rubriques — le cœur du site

Une fiche par rubrique et sous-rubrique (78 fiches déjà créées, en *Brouillon* et sans texte). Le site compte
9 rubriques : *Comprendre l'islam, Tijâniyya, Fayḍa, Cheikh Ould Khayri, Cheikh Ousmane Mbow, Awliyâ', la Jamah,
Bibliothèque, Actualités*.

| Champ | Rôle |
|---|---|
| **Statut** | voir § 2 |
| **Rubrique** | l'adresse de la page (ex. `/cheikh-ould-khayri/biographie`). Déjà remplie : ne pas changer |
| **Nature de l'information** | Documenté, Témoignage, Tradition, Interprétation, Position de la Jamah (badge affiché sur la page) |
| **Titre de la page** | titre affiché en haut de la page |
| **Libellé dans les menus** | nom court dans le menu et le fil d'Ariane |
| **Résumé** | chapeau sous le titre ; pour une rubrique principale, c'est aussi son introduction |
| **Texte** | le corps de la page, en Markdown (§ 4.2) |
| **Image d'en-tête** | image du haut de la page |
| **Sources** | liste de références (bouton *Ajouter*) : référence complète, lien facultatif |

**Pas à pas : publier une page**

1. **Contenu** › **Pages des rubriques**, rechercher la rubrique (ex. « biographie ») et l'ouvrir.
2. Remplir au moins le **Texte (français)**, la **Nature de l'information** et les **Sources**.
3. Enregistrer, passer **En relecture**, enregistrer.
4. Le relecteur vérifie puis passe **Publié** et enregistre.
5. Ouvrir la page sur le site pour vérifier (quelques secondes plus tard).

**Ce qui se passe sur le site.** Tant qu'une page n'a pas de texte publié dans une langue, elle s'affiche « en
préparation » (avec la liste des contenus attendus) et n'est pas proposée aux moteurs de recherche. Dès que son texte
est publié dans une langue, elle devient une vraie page, indexée par Google et ajoutée au plan du site, **dans cette
langue seulement**.

### 5.8 Documents

Les documents à télécharger, rattachés à une rubrique (ils s'affichent en bas de la page de cette rubrique).

- **Rubrique**, **Titre**, **Résumé**, **Auteur**, **Langue**, **Type** (manuscrit, livre, article…),
  **Date** (`AAAA` ou `AAAA-MM-JJ`), **Fichier**, **Droits et autorisation de diffusion**.
- Le fichier doit être coché **Visible sur le site** (§ 6), sinon il n'est pas téléchargeable.
- Ne publier un document que si les droits de diffusion sont établis (le noter dans *Droits*).

### 5.9 Vidéos, Transcriptions, Traductions de textes

Voir les chapitres 7, 8 et 9.

---

## 6. Images et fichiers

### 6.1 Déposer un fichier

- Depuis un champ image d'une fiche : cliquer dans le champ, puis *Téléverser depuis l'appareil* (ou choisir un fichier
  existant de la bibliothèque).
- Ou directement dans **Bibliothèque de fichiers** › bouton **+**.

Préférer des images de bonne qualité (au moins 1600 px de large pour un bandeau), en JPEG ou WebP. Le site les
redimensionne lui-même.

### 6.2 Renseigner la fiche du fichier (obligatoire pour l'affichage)

Ouvrir le fichier (clic dans la bibliothèque, ou sur l'image dans la fiche puis *Modifier*) et remplir :

| Champ | Pourquoi |
|---|---|
| **Visible sur le site** | **Sans cette case, le fichier n'est jamais affiché ni téléchargeable**, même si la fiche qui l'utilise est publiée |
| **Texte alternatif** (FR / AR / EN) | description de l'image pour les personnes malvoyantes et pour Google |
| **Auteur / crédit** | photographe ou source |
| **Licence** et **Lien de la licence** | ex. « CC BY-SA 4.0 », « Droits réservés — autorisation de la Jamah » |
| **Source** | page d'origine de l'image |
| **Cadrage** | partie à garder visible quand l'image est recadrée : centre, haut, bas, gauche, droite, visage |

La page **Crédits** du site est générée automatiquement à partir de ces champs.

> Les fichiers de travail (enregistrement à transcrire, PDF original à traduire) doivent **rester non cochés** : ils ne
> sont alors jamais exposés au public.

---

## 7. Ajouter une vidéo

Les vidéos sont **référencées depuis YouTube**, jamais réhébergées sur le site. Elles apparaissent dans la section
*Cheikh Ousmane Mbow* de l'accueil et dans les vidéothèques (*Cheikh Ousmane Mbow › Vidéothèque*,
*Bibliothèque › Vidéos*). Tant qu'aucune vidéo n'est publiée, ces emplacements restent masqués.

1. **Contenu** › **Vidéos** › **+**.
2. **Identifiant YouTube** : les 11 caractères après `v=` dans l'adresse.
   Exemple : `https://www.youtube.com/watch?v=dQw4w9WgXcQ` → `dQw4w9WgXcQ`.
3. **Disponibilité** : *Publique* (seules les vidéos publiques s'affichent), *Privée* ou *Supprimée* si elle a disparu
   de YouTube.
4. Recopier le **Titre YouTube**, la **Description** et la date **Publiée le** (elle sert au tri, des plus récentes aux
   plus anciennes) ; **Durée** en secondes si connue.
5. Classer : **Type** (enseignement, explication de texte, conférence, réponse, débat, témoignage), **Langue**,
   **Thèmes** et **Intervenants** (étiquettes : taper puis Entrée).
6. **Résumé** (FR / AR / EN) : quelques lignes rédigées par la Jamah.
7. **Chapitres** (facultatif) : *Ajouter*, puis début (`12:30` ou `1:02:03`) et titre. Les 4 premiers s'affichent sous
   la vidéo, en liens qui ouvrent YouTube au bon moment.
8. **Transcription disponible** : à cocher quand une transcription existe.
9. Enregistrer, relecture, publication.

**Vidéo hors YouTube** (enregistrement privé à transcrire) : laisser l'identifiant vide et joindre le fichier dans
**Fichier vidéo ou audio**, sans cocher « Visible sur le site ». Une telle vidéo sert à la transcription ; elle n'est pas
affichée sur le site.

---

## 8. Transcrire et traduire une vidéo

Collection **Transcriptions** : une fiche par vidéo. L'écran montre **le lecteur à gauche** et **les segments à
droite** (sur un écran étroit, le lecteur passe au-dessus).

### 8.1 Préparer

1. La vidéo doit exister dans **Vidéos** (§ 7).
2. **Contenu** › **Transcriptions** › **+**, choisir la **Vidéo** : le lecteur apparaît.
3. **Langue parlée** : wolof par défaut, ou français, arabe, anglais, plusieurs langues.

### 8.2 Découper en segments

Un segment = une phrase ou une idée, avec un début et une fin.

1. Lancer la lecture.
2. À chaque début de phrase, appuyer sur **Ctrl + Entrée** (ou le bouton **Nouveau segment ici**) : le segment
   précédent se ferme et un nouveau s'ouvre au temps de lecture, curseur prêt à écrire.
3. Saisir la **Transcription (langue parlée)** telle qu'elle est prononcée.

### 8.3 Raccourcis et commandes

| Commande | Effet |
|---|---|
| **Ctrl + Entrée** | nouveau segment au temps de lecture |
| **Ctrl + Espace** | lecture / pause |
| **Alt + ←** / **Alt + →** | reculer / avancer de 5 secondes |
| **−5 s / Lecture / +5 s** | mêmes commandes à la souris |
| **× 0.5 à × 1.25** | vitesse de lecture (ralentir pour transcrire) |
| **Début ici** / **Fin ici** | caler le début ou la fin d'un segment sur le temps de lecture |
| **Écouter** | rejouer ce segment seul, puis s'arrêter |
| Champs de temps | saisie directe : `75`, `1:15` ou `1:02:03.5` |
| **Supprimer** | supprime le segment (confirmation si du texte y est écrit) |

Le segment en cours de lecture est encadré en couleur.

### 8.4 Traduire

- Chaque segment a un champ **Traduction française**.
- Cocher **Afficher la traduction arabe** et/ou **Afficher la traduction anglaise** (sous le lecteur) pour ajouter ces
  colonnes.
- Le champ **Remarque** sert à signaler un terme incertain, un contexte, une référence citée (sourate, hadith, ouvrage).
- **Notes de traduction (internes)** (sous l'outil) : remarques générales, jamais publiées.

### 8.5 Terminer

Enregistrer souvent (bouton en haut à droite), puis *En relecture* ; un relecteur publie.
**Le site n'affiche pas encore les transcriptions** (voir § 10) : le travail publié sera affiché dès que la page de
lecture sera prête.

---

## 9. Traduire et corriger un texte

Collection **Traductions de textes** : une fiche par texte (poème, discours, lettre, chapitre…). Chaque paragraphe de
l'original est aligné avec ses traductions ; le document original (PDF ou image) peut s'afficher à côté pour
vérifier la saisie.

### 9.1 Créer la fiche

1. **Contenu** › **Traductions de textes** › **+**.
2. **Titre**, **Langue de l'original** (arabe par défaut ; l'arabe s'affiche de droite à gauche).
3. Joindre le **Fichier original** (PDF ou image, non coché « Visible sur le site »), **ou** choisir un **Document de la
   bibliothèque** déjà enregistré (§ 5.8) : son fichier s'affiche alors à gauche.

### 9.2 Importer l'original

1. **Importer un texte**, coller le texte original. **Une ligne vide sépare deux paragraphes.**
2. Le bouton indique le nombre de paragraphes détectés : **Ajouter N paragraphe(s)**.
3. Corriger le découpage : **Fusionner avec le suivant**, **Insérer après** (paragraphe vide), **Supprimer**.

### 9.3 Traduire

- La barre du haut permet d'afficher ou masquer chaque langue (**Français**, **Arabe**, **Anglais**) et le
  **Document original**.
- Écrire (ou coller une traduction existante) dans la colonne de la langue, paragraphe par paragraphe.
- **Remarque** : terme incertain, référence, variante de lecture.

### 9.4 Corriger et marquer « Relu »

1. Le traducteur qualifié relit chaque paragraphe, corrige directement, puis coche **Relu (français)** (ou arabe,
   anglais).
2. **Toute modification ultérieure d'une traduction relue retire la coche** : la relecture reste fiable.
3. **Non relus seulement** n'affiche que ce qui reste à relire ; le compteur (« Français : 12 / 30 relus ») donne
   l'avancement. Un paragraphe entièrement relu est encadré en vert.

### 9.5 Terminer

Enregistrer souvent, *En relecture*, puis publication par un relecteur. **Le site n'affiche pas encore ces
traductions** (voir § 10).

---

## 10. Fonctionnalités à venir

Ordre prévu (susceptible d'évoluer). Ce guide sera complété à chaque mise en service.

| Fonctionnalité | Ce que cela changera pour la rédaction | État |
|---|---|---|
| **Lecteur public des transcriptions et traductions** | Les transcriptions et traductions publiées s'afficheront sur le site, texte original et traduction côte à côte, synchronisés avec la vidéo | À venir |
| **Extraits commentés** | Nouvelle collection : choisir une vidéo, un début et une fin, et rédiger un commentaire FR / AR / EN | À venir |
| **Import automatique des vidéos YouTube** | Les nouvelles vidéos de la chaîne arriveront seules en *Brouillon* dans **Vidéos** ; il restera à les classer, résumer et publier | À venir |
| **Recherche dans le site** | Recherche plein texte (français, arabe, et anglais) dans les pages, documents et transcriptions publiés ; rien à faire de plus que publier | 2e partie |
| **Reprise du corpus existant** (sufi-knowledge) | Des citations et documents déjà rassemblés arriveront en *Brouillon* pour vérification des droits et relecture | À venir |
| **Nom de domaine définitif** | Nouvelles adresses du site et de Directus (mêmes identifiants) | En attente |

---

## 11. Questions fréquentes et dépannage

**J'ai enregistré mais je ne vois rien sur le site.**
1. La fiche est-elle **Publiée** ? (Sauf Accueil, Réglages et sections, qui n'ont pas de statut.)
2. L'image est-elle cochée **Visible sur le site** ?
3. Le texte est-il rempli **dans la langue** de la page consultée (`/fr`, `/ar`, `/en`) ?
4. Recharger la page du site après quelques secondes ; au pire, attendre 5 minutes.
5. Toujours rien : prévenir l'équipe technique (en indiquant la fiche et l'heure).

**Je ne peux plus modifier ma fiche.** Elle est *Validée* ou *Publiée* : seul un relecteur peut la modifier. Lui
demander de la repasser en *Brouillon*, ou de faire la correction.

**J'ai effacé un texte par erreur.** Ouvrir la fiche › panneau de droite › **Révisions**, choisir la version voulue et
la restaurer.

**Quelqu'un a écrasé mon travail.** Même chose : **Révisions**. Pour l'éviter, une seule personne par fiche à la fois.

**Le lecteur vidéo reste noir dans Transcriptions.** Vérifier l'identifiant YouTube de la fiche vidéo (11 caractères).
Une vidéo privée ou supprimée de YouTube ne se lit pas : joindre le fichier à la place.

**Puis-je supprimer une fiche ?** Préférer **Archivé** (réversible). La suppression est définitive et réservée aux
relecteurs.

---

## 12. Annexe : la technique en bref

```
                 Visiteurs                                Rédacteurs
                     │ https                                   │ https
                     ▼                                         ▼
 ┌──────────────────────────────── VM AWS (Paris, 4 Go) ───────────────────────────────┐
 │  Caddy : HTTPS automatique (certificats Let's Encrypt)                                │
 │     │                                         │                                       │
 │     ▼                                         ▼                                       │
 │  Site (Next.js) ──lecture publique──▶  Directus (CMS) ──▶ PostgreSQL (base de données)│
 │     ▲                                         │                                       │
 │     └──────── « mets-toi à jour » ────────────┘  (à chaque enregistrement)            │
 └───────────────────────────────────────────────────────────────────────────────────────┘
        ▲
        │ déploiement automatique : GitHub Actions (tests → image → mise à jour de la VM)
   Code sur GitHub
```

| Brique | Rôle |
|---|---|
| **Next.js** (site public) | Fabrique les pages en français, arabe (de droite à gauche) et anglais. Les pages sont préparées à l'avance puis régénérées quand le contenu change : le site reste rapide même si Directus est lent ou en panne |
| **Directus** (espace de rédaction) | Interface d'écriture, rôles, statuts, historique des versions, fichiers. Deux outils sur mesure : transcription de vidéos et traduction côte à côte |
| **PostgreSQL** | Base de données où Directus enregistre tout ; sauvegardée chaque nuit (14 jours conservés) |
| **Caddy** | Porte d'entrée HTTPS du site et de Directus |
| **GitHub Actions** | À chaque modification du code : vérifications automatiques, puis mise à jour du serveur sans intervention |
| **Recherche** (2e partie) | Service dédié (Elasticsearch) qui indexera les contenus publiés |

**Sécurité, en résumé.** Le site ne voit que les contenus *Publiés* et les fichiers *Visibles sur le site* ; les notes
internes et fichiers de travail ne sont jamais exposés. Les mots de passe des services sont gardés dans GitHub et sur le
serveur, jamais dans le code.

Documentation technique : `cms/README.md` (installation de Directus), `AGENTS.md` (déploiement), `docs/feuille-de-route.md`.

---

## Journal des mises à jour

| Date | Changement |
|---|---|
| 15/11/2026 | Première version : rôles, statuts, interface, collections, images, vidéos, transcription, traduction de textes, fonctionnalités à venir, architecture |
