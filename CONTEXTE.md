# Contexte projet — Plateforme de suivi eSport (projet pédagogique)

Ce document sert de contexte de référence pour Claude Code. Il définit le cadre, la progression et les règles à respecter tout au long du développement de ce projet. **Ce document doit être lu et respecté à chaque nouvelle session de travail.**

---

## 1. Profil de l'apprenant

- Débutant quasi complet : peu ou pas d'expérience de code avant ce projet.
- Rien n'est installé sur sa machine au départ — tout doit être expliqué depuis zéro (installation d'outils, création de comptes, premières commandes).
- Le projet est un objet d'apprentissage avant d'être un livrable : la pédagogie prime sur la vitesse d'exécution.
- Objectif à moyen terme : travailler dans le développement de jeux vidéo. Les choix techniques et les parallèles pédagogiques peuvent s'appuyer sur cet objectif quand c'est pertinent.

## 2. Objectif du projet

Développer une plateforme web qui centralise le suivi de l'actualité et des résultats de plusieurs univers eSport et sportif :
- League of Legends (Riot Games)
- Valorant (Riot Games)
- Ligue 1 (football)
- Ligue des Champions (football)

Le projet doit couvrir, sur toute sa durée, l'ensemble de la chaîne de développement web : frontend, backend, base de données, authentification, consommation d'API externes, sécurité, et déploiement.

## 3. Posture attendue de Claude Code pendant le projet

- **Rôle de formateur, pas d'exécutant silencieux.** Chaque bout de code généré doit être accompagné d'une explication compréhensible par un débutant : à quoi il sert, pourquoi cette approche, quelles alternatives existent.
- **Ne jamais sauter d'étape.** Respecter le découpage de la section 6, dans l'ordre, sans anticiper des notions non encore introduites.
- **Vérifier avant d'avancer.** À la fin de chaque étape, s'assurer avec Benjamin que le livrable fonctionne et est compris avant de passer à la suite.
- **Un commit = une étape terminée et fonctionnelle**, poussé sur la branche dédiée (voir section 4). Ne jamais laisser une branche d'étape dans un état cassé.
- **Alimenter le glossaire** (`GLOSSAIRE.md` à la racine du dépôt) à chaque nouveau terme technique introduit : définition simple + exemple tiré du projet.
- **Sécurité dès le premier jour** : toute clé d'API ou secret doit passer par des variables d'environnement (`.env`), jamais en dur dans le code, jamais commité (voir `.gitignore`).
- **Langage clair, sans jargon non expliqué.** Si un terme anglais ou technique est utilisé, il est défini au moins une fois.

## 4. Organisation du dépôt GitHub

- **`main`** : réservée exclusivement au projet terminé et fonctionnel, plus deux documents finaux :
  - le document d'apprentissage complet (toutes les étapes, outils, concepts vus)
  - le document expliquant comment le projet a été pensé et construit (choix techniques, alternatives envisagées, difficultés rencontrées)
- **Une branche par étape**, nommée `etape-XX-nom-court` (voir liste en section 6). Chaque branche contient le code **complet et fonctionnel** de l'étape correspondante — jamais de code intermédiaire cassé.
- **Règle de retour arrière** : en cas d'erreur ou de blocage, on peut toujours repartir de la dernière branche d'étape validée avec `git checkout etape-XX-nom-court`.
- Chaque étape du document d'apprentissage doit indiquer explicitement : *"Pars de la branche `etape-XX`"* et *"À la fin de cette étape, ton code doit être poussé sur `etape-XX+1`"*.

## 5. Stack technique retenue

| Couche | Choix | Raison |
|---|---|---|
| Frontend | Angular | Déjà entamé par Benjamin sur un projet précédent (carnet-contact) |
| Backend | Node.js + Express + TypeScript | Un seul langage sur toute la stack, réduit la charge cognitive pour un débutant |
| Base de données | PostgreSQL | Base relationnelle, adaptée aux données du projet (équipes, matchs, compétitions, utilisateurs) et pédagogiquement utile (apprentissage du SQL et des relations) |
| ORM | Prisma | Bonne intégration TypeScript, migrations claires, bon outil pédagogique pour comprendre le lien code/BDD |
| Authentification | JWT (JSON Web Token) | Approche standard, stateless, bon support pédagogique pour comprendre les sessions web modernes |
| APIs externes | Riot Games API (LoL + Valorant), football-data.org (Ligue 1 + Ligue des Champions) | APIs officielles avec clé gratuite |

> Remarque : Call of Duty a été écarté du périmètre du projet — il n'existe pas d'API officielle stable pour les statistiques joueurs, et son intégration aurait ajouté de la complexité sans réel apport pédagogique supplémentaire par rapport aux deux autres intégrations API déjà prévues.

## 6. Outils à installer / comptes à créer (étape 0)

| Outil | Usage |
|---|---|
| Node.js + npm | Exécuter le backend et les outils Angular/npm |
| Angular CLI (`npm install -g @angular/cli`) | Générer et servir le projet Angular |
| Visual Studio Code | Éditeur de code principal |
| Extensions VS Code recommandées | Angular Language Service, ESLint, Prettier, GitLens, DotENV, Thunder Client (tester les API depuis VS Code) |
| Git | Gestion de versions |
| Compte GitHub | Hébergement du dépôt, gestion des branches |
| PostgreSQL | Base de données locale |
| DBeaver ou pgAdmin | Visualiser et explorer la base de données |
| Compte Riot Developer Portal | Obtenir une clé API LoL/Valorant |
| Compte football-data.org | Obtenir une clé API football |
| Postman ou Thunder Client | Tester les endpoints backend indépendamment du frontend |

Chaque installation doit être expliquée pas à pas dans le document d'apprentissage, avec vérification que l'outil fonctionne (ex : `node -v`, `ng version`, `git --version`) avant de continuer.

## 7. Format à respecter pour chaque étape du document d'apprentissage

### 7.1 Niveau de détail attendu

Le document d'apprentissage doit systématiquement partir du principe que Benjamin **ne connaît quasiment rien** du concept abordé, même si une notion proche a déjà été vue à une étape précédente (dans ce cas, rappeler brièvement plutôt que supposer acquis). Concrètement :
- Ne jamais introduire un terme, une commande ou une syntaxe sans l'expliquer au moment où il apparaît.
- Préférer une explication trop détaillée à une explication trop rapide — la densité du cours prime sur sa concision.
- Chaque notion nouvelle doit être justifiée : pourquoi elle existe, quel problème elle résout, ce qui se passerait sans elle.

### 7.2 Alternance paragraphes / supports visuels

Benjamin retient mieux avec des supports visuels qu'avec du texte seul, mais les paragraphes explicatifs restent indispensables pour le "pourquoi" et le "comment". Le document doit donc combiner systématiquement les deux, et pas l'un à la place de l'autre :

- **Paragraphes explicatifs** : pour tout ce qui relève du raisonnement — pourquoi cette approche, comment les éléments s'articulent, quelles sont les alternatives et leurs compromis.
- **Supports visuels** (schémas, diagrammes, graphes, tableaux comparatifs) : chaque fois qu'une notion peut se représenter visuellement — flux de données, architecture, cycle de vie d'une requête, relations entre tables, arborescence de fichiers, étapes d'un processus, etc. Ne pas se limiter aux étapes "techniques" : même un concept plus abstrait doit être schématisé s'il existe une représentation visuelle pertinente.
- **Exigence de justesse** : un schéma doit représenter fidèlement la notion enseignée, pas juste illustrer vaguement le sujet. Avant d'inclure un schéma, vérifier qu'il ne simplifie pas au point de donner une idée fausse du fonctionnement réel, et qu'il n'introduit pas d'éléments qui n'ont pas encore été expliqués dans le texte.
- Le texte et le schéma doivent se compléter : le paragraphe explique, le schéma résume et fixe visuellement la structure de ce qui vient d'être expliqué — jamais l'un sans l'autre quand une représentation visuelle est possible.

### 7.3 Format technique des schémas

Les schémas doivent être réalisés en **Mermaid**, directement intégrés dans les fichiers Markdown du dépôt (blocs de code ```` ```mermaid ````). Avantages pour ce projet :
- versionnés comme du texte, donc suivis par Git au même titre que le reste du code ;
- rendus automatiquement dans l'aperçu Markdown de GitHub, sans outil externe ;
- modifiables facilement si une notion évolue, sans repartir d'un outil de dessin.

Types de diagrammes à utiliser selon la notion représentée : `graph`/`flowchart` pour les flux et architectures, `sequenceDiagram` pour les échanges entre frontend/backend/base de données ou API externe, `erDiagram` pour les relations entre tables, `classDiagram` si utile pour représenter des interfaces TypeScript liées.

Si Claude Code identifie qu'un plugin ou une extension permettrait un meilleur rendu (par exemple l'extension VS Code *Markdown Preview Mermaid Support* pour prévisualiser localement les schémas pendant la rédaction), il doit le signaler explicitement à Benjamin avec le nom exact et l'usage, plutôt que de supposer que l'installation n'est pas possible — Benjamin est en mesure de l'installer lui-même sur demande.

### 7.4 Structure fixe de chaque étape

1. **Objectifs** — ce que Benjamin doit savoir faire à la fin de l'étape
2. **Concepts abordés** — notions théoriques introduites (renvoi vers le glossaire), avec pour chacune un paragraphe explicatif et, quand c'est pertinent, un schéma associé (voir 7.2)
3. **Prérequis** — branche GitHub de départ
4. **Déroulé détaillé** — instructions pas à pas, sans présupposer de connaissance non acquise, illustrées de schémas quand une action a un effet structurel ou visuel (arborescence, flux, architecture)
5. **Livrable attendu** — ce qui doit fonctionner concrètement à la fin
6. **Checklist d'auto-vérification** — 3 à 6 points pour que Benjamin valide lui-même sa compréhension
7. **Branche d'arrivée** — nom de la branche sur laquelle pousser le code une fois l'étape validée

## 8. Découpage des étapes

| # | Nom de l'étape | Branche | Contenu principal |
|---|---|---|---|
| 0 | Mise en place de l'environnement | `etape-00-setup` | Installation des outils (section 6), création du dépôt GitHub, premier commit |
| 1 | Découverte d'Angular | `etape-01-angular-decouverte` | Structure d'un projet Angular, composants, page d'accueil statique, navigation |
| 2 | Charte graphique & thèmes clair/sombre | `etape-02-theme` | Variables CSS, palette bleu/rouge (section 11), bascule clair/sombre, persistance du choix (`localStorage`) |
| 3 | Données mockées | `etape-03-donnees-mockees` | Interfaces TypeScript, services Angular, `*ngFor`, affichage d'une liste de matchs en dur |
| 4 | Backend Express — bases | `etape-04-backend-bases` | Structure d'un projet Express/TypeScript, routes, contrôleurs, API qui renvoie du JSON |
| 5 | Connexion frontend/backend | `etape-05-connexion-front-back` | `HttpClient`, RxJS de base, CORS, remplacement des données mockées par un appel API |
| 6 | Base de données | `etape-06-base-de-donnees` | PostgreSQL, modélisation (équipes, matchs, compétitions), Prisma, migrations |
| 7 | CRUD complet | `etape-07-crud` | Créer/modifier/supprimer des données depuis l'application |
| 8 | Authentification | `etape-08-authentification` | Inscription/connexion, JWT, routes protégées, guards Angular |
| 9 | Favoris utilisateur | `etape-09-favoris` | Relation many-to-many utilisateur/équipes suivies |
| 10 | Statistiques détaillées des matchs | `etape-10-statistiques` | Statistiques par discipline (football, parties LoL, cartes Valorant), joueurs, transactions, score calculé, page de détail actualisée en direct |
| 11 | API externe — Riot Games | `etape-11-api-riot` | Intégration LoL + Valorant, gestion de clé secrète côté backend |
| 12 | API externe — Football & résilience | `etape-12-api-football` | Intégration Ligue 1 + Ligue des Champions, gestion des erreurs et de l'indisponibilité d'un service externe |
| 13 | Dashboard unifié | `etape-13-dashboard` | Tableau de bord regroupant toutes les sources, filtres, responsive design |
| 14 | Refactoring | `etape-14-refactoring` | Relecture critique, organisation du code, tests unitaires de base |
| 15 | Déploiement | `etape-15-deploiement` | Hébergement frontend/backend/BDD (ex : Vercel, Render) |
| 16 | Finalisation (sur `main`) | `main` | Rédaction des deux documents finaux (apprentissage complet + explication de la construction du projet) |

> L'étape 10 a été ajoutée en cours de projet, à la demande de Benjamin, après l'étape 9 : les étapes suivantes ont été décalées d'un rang. Les branches déjà créées gardent leur nom.

## 9. Documents à maintenir en continu

- `GLOSSAIRE.md` : tous les termes techniques rencontrés, définis simplement.
- `DOCUMENT-APPRENTISSAGE.md` : rempli au fur et à mesure, suit le format de la section 7.
- `.env.example` : liste des variables d'environnement nécessaires, sans les valeurs réelles.
- `.gitignore` : doit exclure `.env`, `node_modules`, et tout fichier de build dès l'étape 0.

## 10. Document final (étape 16, sur `main`)

En plus du document d'apprentissage complet, produire un second document expliquant la construction du projet, structuré par décision technique :
- problème rencontré
- options envisagées
- choix retenu et justification
- difficultés rencontrées et leçons tirées

Ce document sert de trace de la réflexion technique, réutilisable par exemple dans un contexte d'entretien.

## 11. Charte graphique de l'application

### 11.1 Palette de couleurs

L'identité visuelle du projet repose sur deux couleurs principales : le **bleu** et le **rouge**. Elles doivent structurer la hiérarchie visuelle plutôt que d'être utilisées de façon interchangeable :
- **Bleu** : couleur dominante — navigation, structure générale, boutons d'action principaux, liens, éléments de confiance/neutres.
- **Rouge** : couleur d'accent — utilisée avec parcimonie pour attirer l'attention (indicateur "en direct" sur un match, alertes, notifications, éléments à forte valeur d'attention). Ne doit pas être utilisée comme couleur de fond dominante pour rester lisible et ne pas fatiguer l'œil.

Ce choix doit être expliqué dans le document d'apprentissage à l'étape où le thème est mis en place (probablement lors de l'étape 1 ou 2, dès les premiers composants visuels) : pourquoi séparer couleur dominante et couleur d'accent, et pourquoi c'est une bonne pratique de design d'interface.

### 11.2 Mode clair / mode sombre

L'application doit proposer les deux modes, avec un bouton de bascule accessible depuis l'interface (par exemple dans la barre de navigation). Recommandations techniques pour l'implémentation :
- Définir les couleurs via des **variables CSS** (`:root { --color-primary: ...; }`), jamais en dur dans les composants, pour permettre le changement de thème sans dupliquer les styles.
- Définir deux jeux de variables (un pour le mode clair, un pour le mode sombre), activés via une classe sur l'élément racine (ex. `body.dark-theme`) ou l'attribut `data-theme`.
- Le bleu et le rouge doivent être adaptés entre les deux modes (nuances plus douces/désaturées en mode sombre pour éviter l'éblouissement), tout en restant reconnaissables comme les couleurs de la charte.
- Vérifier les contrastes texte/fond dans les deux modes pour garder une bonne lisibilité (accessibilité).
- Le choix de thème doit être mémorisé (ex. `localStorage`) pour persister d'une session à l'autre.

Cette fonctionnalité doit être traitée comme une étape à part entière du parcours pédagogique (variables CSS, gestion d'état simple côté frontend, persistance locale), et donc positionnée explicitement dans le découpage de la section 8 plutôt que traitée en une fois à la fin du projet.

### 11.3 Logo

Le site aura besoin d'un logo, mais ce n'est **pas une priorité**. Il ne doit pas bloquer l'avancement des étapes techniques : à traiter plus tard, par exemple lors de l'étape "Dashboard unifié" ou en finition avant le déploiement, quand l'identité visuelle (section 11.1) est déjà en place et que le logo peut s'appuyer dessus (couleurs bleu/rouge).
