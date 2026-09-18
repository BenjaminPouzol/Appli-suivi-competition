# Document d'apprentissage — Plateforme de suivi eSport

Ce document est le cours du projet. Il est rempli au fur et à mesure, une section par étape, et suit toujours la même structure : objectifs, concepts, prérequis, déroulé, livrable, checklist, branche d'arrivée.

Il part systématiquement du principe qu'aucune notion n'est acquise : chaque terme est défini au moment où il apparaît, et repris dans le [glossaire](GLOSSAIRE.md).

## Sommaire

- [Étape 0 — Mise en place de l'environnement](#étape-0--mise-en-place-de-lenvironnement)
- [Étape 1 — Découverte d'Angular](#étape-1--découverte-dangular)
- [Étape 2 — Charte graphique et thèmes clair/sombre](#étape-2--charte-graphique-et-thèmes-clairsombre)
- [Étape 3 — Données mockées](#étape-3--données-mockées)
- [Étape 4 — Backend Express : les bases](#étape-4--backend-express--les-bases)
- [Étape 5 — Connexion frontend / backend](#étape-5--connexion-frontend--backend)
- [Étape 6 — Base de données](#étape-6--base-de-données)
- [Étape 7 — CRUD complet](#étape-7--crud-complet)
- [Étape 8 — Authentification](#étape-8--authentification)
- [Étape 9 — Favoris utilisateur](#étape-9--favoris-utilisateur)
- [Étape 10 — Statistiques détaillées des matchs](#étape-10--statistiques-détaillées-des-matchs)

---

# Étape 0 — Mise en place de l'environnement

## 1. Objectifs

À la fin de cette étape, tu dois savoir :

- expliquer **à quoi sert chacun des outils installés** et à quel moment du projet il intervient ;
- vérifier dans un terminal qu'un outil est bien installé et lire le numéro de version qu'il affiche ;
- expliquer la différence entre **Git** et **GitHub**, et ce que contient un dépôt ;
- expliquer pourquoi le projet utilise **une branche par étape**, et comment revenir à une étape antérieure ;
- expliquer pourquoi un mot de passe ou une clé d'API ne doit **jamais** être écrit dans le code, et par quoi on le remplace.

## 2. Concepts abordés

### 2.1 L'architecture générale de ce qu'on va construire

Avant d'installer quoi que ce soit, il faut comprendre **ce que chaque outil vient occuper comme place** dans l'application finale. Sans cette vue d'ensemble, une liste d'installations n'est qu'une suite de clics sans signification.

Une application web moderne est presque toujours découpée en trois morceaux distincts, qui tournent séparément et se parlent par le réseau.

Le premier est le **frontend** (littéralement « la façade »). C'est la seule partie que l'utilisateur voit : elle s'exécute **dans son navigateur**, sur sa machine à lui. Elle affiche les pages, réagit aux clics, mais ne détient aucune donnée en propre — elle doit les demander. C'est le rôle d'**Angular** ici.

Le deuxième est le **backend** (« l'arrière-boutique »). Il s'exécute sur un serveur, jamais chez l'utilisateur. Il reçoit les demandes du frontend, décide si elles sont légitimes, va chercher les données et les renvoie. C'est lui, et lui seul, qui détient les secrets : mot de passe de la base, clés d'API. C'est le rôle d'**Express**, exécuté par **Node.js**.

Le troisième est la **base de données**, qui conserve durablement les informations. Elle n'est accessible que par le backend. C'est le rôle de **PostgreSQL**.

S'ajoutent enfin les **APIs externes** — Riot Games et football-data.org — qui sont des services appartenant à d'autres entreprises, interrogés par le backend pour récupérer les vrais résultats de matchs.

```mermaid
flowchart LR
    U["Utilisateur<br/>(navigateur)"]
    F["Frontend<br/>Angular"]
    B["Backend<br/>Node.js + Express"]
    D[("Base de données<br/>PostgreSQL")]
    R["API Riot Games<br/>(externe)"]
    FB["API football-data.org<br/>(externe)"]

    U -->|"voit et clique"| F
    F -->|"demande des données"| B
    B -->|"répond en JSON"| F
    B -->|"lit et écrit"| D
    B -->|"interroge"| R
    B -->|"interroge"| FB

    style F fill:#1e5fa8,color:#fff
    style B fill:#1e5fa8,color:#fff
    style D fill:#1e5fa8,color:#fff
    style R fill:#8a8a8a,color:#fff
    style FB fill:#8a8a8a,color:#fff
```

Le point important, sur ce schéma : **le frontend ne parle jamais directement ni à la base de données, ni aux APIs externes.** Tout passe par le backend. Ce n'est pas une contrainte technique arbitraire, c'est une question de sécurité — on y revient en 2.4.

### 2.2 Git, GitHub, et pourquoi les deux ne sont pas la même chose

**Git** est un logiciel installé sur ta machine. Son travail est d'enregistrer l'historique complet des modifications du projet. Chaque fois que tu fais un **commit**, Git fige l'état de tous les fichiers à cet instant et l'ajoute à l'historique, avec un message qui explique le changement.

La différence avec une sauvegarde classique est fondamentale : une sauvegarde écrase la version précédente, un commit **s'ajoute**. Rien n'est jamais perdu, et on peut revenir à n'importe quel point du passé.

**GitHub** est un service web qui héberge une copie de ce dépôt sur Internet. Git fonctionne très bien sans GitHub — l'historique est complet en local. GitHub apporte trois choses : une sauvegarde hors de ta machine, une interface web pour consulter le code, et la possibilité de collaborer.

Le passage du travail en cours jusqu'à GitHub se fait en trois temps, qu'il faut bien distinguer :

```mermaid
flowchart LR
    W["Répertoire de travail<br/>(tes fichiers modifiés)"]
    S["Zone d'index<br/>(staging)"]
    L["Dépôt local<br/>(historique .git)"]
    R["Dépôt distant<br/>(GitHub)"]

    W -->|"git add<br/><i>je choisis ce qui compte</i>"| S
    S -->|"git commit<br/><i>je fige et je documente</i>"| L
    L -->|"git push<br/><i>j'envoie sur Internet</i>"| R
    R -->|"git pull<br/><i>je récupère</i>"| L

    style W fill:#c94040,color:#fff
    style S fill:#d98030,color:#fff
    style L fill:#1e5fa8,color:#fff
    style R fill:#2a2a2a,color:#fff
```

L'étape intermédiaire — la **zone d'index**, ou *staging* — surprend souvent au début. Pourquoi ne pas commiter directement tout ce qui a changé ? Parce qu'elle permet de **choisir** : si tu as modifié cinq fichiers pour deux raisons différentes, tu peux faire deux commits séparés, chacun cohérent et correctement décrit. Un historique lisible vaut beaucoup mieux qu'un historique exhaustif mais confus.

### 2.3 Pourquoi une branche par étape

Une **branche** est une ligne de développement parallèle dans le dépôt. Créer une branche revient à poser un marque-page dans l'historique et à continuer à écrire à partir de là, sans toucher à ce qui précède.

Le cadre du projet impose une branche par étape, nommée `etape-XX-nom-court`. Cette règle a un but précis : **chaque branche est un état du projet connu comme fonctionnel.** Si l'étape 7 part en vrac et devient impossible à déboguer, il reste toujours possible de repartir de l'étape 6 intacte, sans avoir à défaire les modifications une par une.

```mermaid
gitGraph
    commit id: "Initial commit"
    commit id: "Ajout du contexte"
    branch etape-00-setup
    commit id: "Étape 0 : docs de suivi"
    branch etape-01-angular-decouverte
    commit id: "Étape 1 : projet Angular"
    branch etape-02-theme
    commit id: "Étape 2 : thème clair/sombre"
```

Chaque branche part de la précédente et contient donc tout son contenu, plus le sien. `main` reste de côté jusqu'à la toute fin : elle est réservée au projet terminé et aux deux documents finaux.

### 2.4 Les secrets, et pourquoi ils ne vivent pas dans le code

C'est le concept le plus important de cette étape, et le seul dont une erreur est **définitive**.

Le projet manipulera des **secrets** : le mot de passe de PostgreSQL, la clé d'API Riot Games, la clé football-data.org. Un secret est une information qui donne un accès — quiconque la possède peut agir à ta place.

Le réflexe naturel du débutant est d'écrire la clé directement dans le code, parce que c'est ce qui fonctionne le plus vite. Le problème n'apparaît qu'au moment du `git push` : le code part sur GitHub, et le secret avec lui. Et comme Git conserve **tout l'historique**, le supprimer dans un commit ultérieur ne le retire pas — il reste consultable dans les commits précédents. Un secret publié une fois doit être considéré comme perdu et régénéré.

La solution est de sortir le secret du code et de le placer dans un fichier `.env`, que le `.gitignore` empêche d'être commité :

```mermaid
flowchart TB
    subgraph machine ["Ta machine"]
        ENV["<b>.env</b><br/>RIOT_API_KEY=RGAPI-vraie-cle<br/><i>valeurs réelles</i>"]
        CODE["<b>Code source</b><br/>lit process.env.RIOT_API_KEY<br/><i>aucune valeur en dur</i>"]
        EX["<b>.env.example</b><br/>RIOT_API_KEY=<br/><i>noms seuls, sans valeur</i>"]
        GI["<b>.gitignore</b><br/>contient la ligne .env"]
    end

    GH["<b>GitHub</b><br/>dépôt public"]

    ENV -.->|"fournit la valeur<br/>au démarrage"| CODE
    GI ==>|"BLOQUE"| ENV
    CODE -->|"git push"| GH
    EX -->|"git push"| GH
    ENV -->|"jamais"| GH

    linkStyle 1 stroke:#c94040,stroke-width:3px
    linkStyle 4 stroke:#c94040,stroke-width:2px,stroke-dasharray: 5 5

    style ENV fill:#c94040,color:#fff
    style EX fill:#1e5fa8,color:#fff
    style CODE fill:#1e5fa8,color:#fff
    style GI fill:#d98030,color:#fff
    style GH fill:#2a2a2a,color:#fff
```

Le fichier `.env.example`, lui, part bien sur GitHub. Il ne contient que les **noms** des variables, sans les valeurs. Son rôle est documentaire : il indique à quiconque récupère le projet quelles variables il doit renseigner, sans qu'aucun secret n'ait circulé.

C'est aussi ce qui explique le point relevé en 2.1 : le frontend s'exécute dans le navigateur de l'utilisateur, donc **tout ce qu'il contient est lisible par cet utilisateur**. Une clé d'API placée dans le frontend est une clé publique. C'est pour ça qu'elle reste côté backend, qui tourne sur un serveur auquel personne n'a accès.

### 2.5 Les ports

Plusieurs programmes vont tourner en même temps sur ta machine et communiquer par le réseau. Le **port** est le numéro qui permet de les distinguer : l'adresse identifie la machine, le port identifie le programme à l'intérieur.

```mermaid
flowchart TB
    M["<b>localhost</b><br/>(ta machine)"]
    A["Port <b>4200</b><br/>Frontend Angular"]
    E["Port <b>3000</b><br/>Backend Express"]
    P["Port <b>5432</b><br/>PostgreSQL"]

    M --- A
    M --- E
    M --- P

    style M fill:#2a2a2a,color:#fff
    style A fill:#1e5fa8,color:#fff
    style E fill:#1e5fa8,color:#fff
    style P fill:#1e5fa8,color:#fff
```

`localhost` est le nom réservé qui désigne toujours « la machine sur laquelle je suis ». Ouvrir `http://localhost:4200` dans le navigateur signifie donc : « contacte le programme qui écoute sur le port 4200 de cette machine », c'est-à-dire le serveur de développement Angular.

Les valeurs `4200`, `3000` et `5432` sont des conventions, pas des obligations. `5432` est le port historique de PostgreSQL, et le conserver évite d'avoir à le préciser dans chaque outil de connexion.

## 3. Prérequis

Pars de la branche **`main`**.

```
git checkout main
```

Aucune connaissance préalable n'est nécessaire pour cette étape.

## 4. Déroulé détaillé

### 4.1 Installer les outils

Sept outils sont nécessaires pour démarrer. Voici ce que chacun apporte et comment vérifier qu'il fonctionne.

| Outil | Rôle dans le projet | Commande de vérification |
|---|---|---|
| **Node.js** | Exécute le JavaScript hors navigateur — fait tourner le backend et les outils de développement | `node -v` |
| **npm** | Installe les bibliothèques ; livré avec Node.js | `npm -v` |
| **Angular CLI** | Crée et sert le projet Angular | `ng version` |
| **Git** | Gère l'historique des versions | `git --version` |
| **VS Code** | Éditeur de code | `code -v` |
| **PostgreSQL** | Base de données | via pgAdmin |
| **pgAdmin** *(ou DBeaver)* | Explorer la base à la souris | ouvrir l'application |

La vérification n'est pas une formalité. Une commande qui répond `command not found` signifie que le programme n'est pas installé **ou** que le système ne sait pas où le trouver — dans les deux cas, il faut régler le problème avant d'avancer, sinon l'erreur ressurgira plus tard sous une forme plus difficile à diagnostiquer.

Angular CLI s'installe avec npm, en mode **global** :

```
npm install -g @angular/cli
```

L'option `-g` (*global*) installe le paquet pour toute la machine plutôt que dans un projet. C'est indispensable ici : la commande `ng` sert justement à **créer** le projet Angular, donc elle doit exister avant lui.

À l'installation de PostgreSQL, deux écrans demandent un choix :

- le **port** : conserver `5432`, la valeur standard ;
- la **locale** : conserver `DEFAULT`, qui reprend les réglages régionaux français de Windows — utile pour que les tris sur des noms accentués se comportent correctement.

L'assistant **Stack Builder** proposé en fin d'installation peut être annulé : il sert à ajouter des composants optionnels dont le projet n'a pas besoin.

Le mot de passe choisi pour l'utilisateur `postgres` pendant l'installation est un **secret** : il sera nécessaire à l'étape 6 et devra être placé dans `.env`.

### 4.2 Installer les extensions VS Code

| Extension | Ce qu'elle apporte |
|---|---|
| Angular Language Service | Autocomplétion et détection d'erreurs dans les fichiers Angular |
| ESLint | Signale les erreurs et les mauvaises pratiques pendant la frappe |
| Prettier | Met en forme le code automatiquement à la sauvegarde |
| GitLens | Affiche qui a modifié chaque ligne et quand |
| DotENV | Colore les fichiers `.env` pour les rendre lisibles |
| Thunder Client | Teste les routes du backend sans passer par le frontend |
| Markdown Preview Mermaid Support | Affiche les schémas Mermaid dans l'aperçu Markdown de VS Code |

La dernière mérite une explication : sans elle, les blocs ` ```mermaid ` de ce document s'affichent comme du texte brut dans VS Code. Ils se rendent correctement sur GitHub dans tous les cas, mais l'extension évite d'avoir à ouvrir le navigateur pour relire un schéma.

### 4.3 Structurer le dépôt

Le dépôt existe déjà sur GitHub. Il s'agit maintenant d'y créer la branche de l'étape et les documents que le projet impose de tenir à jour.

```
git checkout -b etape-00-setup
```

`checkout -b` fait deux choses : `-b` crée la branche, `checkout` bascule dessus. Toute modification faite ensuite appartiendra à cette branche, pas à `main`.

Quatre fichiers constituent le socle documentaire du projet :

| Fichier | Rôle |
|---|---|
| `CONTEXTE.md` | Cadre du projet — règles, stack, découpage des étapes. Fait foi en cas de doute. |
| `GLOSSAIRE.md` | Tous les termes techniques rencontrés, définis simplement |
| `DOCUMENT-APPRENTISSAGE.md` | Ce document — le cours, une section par étape |
| `.env.example` | Liste des variables d'environnement nécessaires, sans les valeurs |

### 4.4 Vérifier le `.gitignore`

Le `.gitignore` est déjà en place. Deux lignes sont critiques et méritent d'être vérifiées à l'œil :

```
node_modules/
.env
```

La première évite d'envoyer sur GitHub un dossier de plusieurs centaines de mégaoctets, entièrement reconstructible par `npm install`. La seconde est la protection décrite en 2.4 — c'est elle qui empêche les secrets de partir.

### 4.5 Enregistrer le travail

```
git add .
git commit -m "Etape 0 : structuration du depot et documents de suivi"
git push -u origin etape-00-setup
```

`git add .` place tous les fichiers modifiés dans la zone d'index. `git commit -m` fige cet ensemble avec un message. `git push -u origin etape-00-setup` envoie la branche sur GitHub ; l'option `-u` établit le lien entre la branche locale et sa jumelle distante, ce qui permettra d'écrire simplement `git push` les fois suivantes.

## 5. Livrable attendu

- Les sept outils sont installés et répondent à leur commande de vérification.
- Les extensions VS Code sont installées.
- La branche `etape-00-setup` existe en local et sur GitHub.
- Elle contient `CONTEXTE.md`, `GLOSSAIRE.md`, `DOCUMENT-APPRENTISSAGE.md`, `.env.example`, `.gitignore` et `README.md`.
- Aucun secret ne figure dans le dépôt.

## 6. Checklist d'auto-vérification

Réponds sans relire le document — si une réponse ne vient pas, la notion mérite une relecture. Sous chaque question, la ligne *À relire* indique la partie du cours où se trouve la réponse.

1. Quelle est la différence entre Git et GitHub ? Lequel des deux fonctionne sans connexion Internet ?
   - *À relire :* § 2.2 « Git, GitHub, et pourquoi les deux ne sont pas la même chose »
2. Que se passe-t-il si tu écris ta clé d'API Riot directement dans le code et que tu fais `git push` ? Pourquoi la supprimer dans un commit suivant ne règle-t-il pas le problème ?
   - *À relire :* § 2.4 « Les secrets, et pourquoi ils ne vivent pas dans le code »
3. Pourquoi le fichier `node_modules/` est-il exclu du dépôt alors qu'il est indispensable pour faire tourner le projet ?
   - *À relire :* § 4.4 « Vérifier le `.gitignore` »
4. Le frontend pourrait techniquement appeler l'API Riot directement, sans passer par le backend. Pourquoi ne fait-on pas ça ?
   - *À relire :* § 2.1 « L'architecture générale de ce qu'on va construire », puis fin du § 2.4 « Les secrets, et pourquoi ils ne vivent pas dans le code »
5. Si l'étape 7 devient impossible à déboguer, comment reviens-tu à un état fonctionnel ?
   - *À relire :* § 2.3 « Pourquoi une branche par étape »
6. Que signifie le `-g` dans `npm install -g @angular/cli`, et pourquoi est-il nécessaire ici ?
   - *À relire :* § 4.1 « Installer les outils »

## 7. Branche d'arrivée

À la fin de cette étape, ton code doit être poussé sur **`etape-00-setup`**.

L'étape suivante partira de cette branche pour créer `etape-01-angular-decouverte`.

---

# Étape 1 — Découverte d'Angular

## 1. Objectifs

À la fin de cette étape, tu dois savoir :

- expliquer ce qu'est un **composant** Angular et pourquoi une interface se découpe en composants ;
- reconnaître les quatre fichiers qui forment un composant et dire à quoi sert chacun ;
- retrouver ton chemin dans l'arborescence d'un projet Angular ;
- expliquer ce qui se passe entre l'ouverture de `index.html` et l'affichage de la page ;
- expliquer ce qu'est une **application monopage** et en quoi le routage Angular diffère d'un lien HTML classique ;
- créer un composant, lui associer une route, et naviguer vers lui.

## 2. Concepts abordés

### 2.1 Le composant, brique de base

Une page web construite « à l'ancienne » est un seul fichier HTML. Tant qu'elle est petite, ça tient. Passé quelques centaines de lignes, trois problèmes apparaissent : on ne retrouve plus rien, le moindre changement risque d'en casser un autre ailleurs, et tout ce qui se répète doit être copié-collé — puis corrigé à dix endroits le jour où il change.

Angular répond à ça avec le **composant** : un morceau d'écran autonome, qui embarque *avec lui* tout ce qui le concerne — son HTML, son CSS et sa logique. La page n'est plus un bloc, c'est un assemblage.

Voici ce qu'on obtient à la fin de cette étape — la page d'accueil de l'application :

![Page d'accueil de l'application à l'étape 1](docs/images/etape-01-accueil.png)

Cet écran n'est pas un bloc unique. Il est assemblé à partir de deux composants distincts : la **barre sombre du haut** est le composant `Header`, et **tout ce qui est en dessous** est le composant `Accueil`. Ce sont deux fichiers séparés, développés indépendamment l'un de l'autre.

Concrètement, notre application est un emboîtement de composants :

```mermaid
flowchart TB
    APP["<b>App</b><br/><i>la coquille de l'application</i>"]
    HEAD["<b>Header</b><br/><i>barre de navigation</i><br/>toujours visible"]
    OUT{{"router-outlet<br/><i>emplacement variable</i>"}}
    ACC["<b>Accueil</b>"]
    COMP["<b>Competitions</b>"]
    PROP["<b>APropos</b>"]

    APP --> HEAD
    APP --> OUT
    OUT -.->|"si l'URL est /"| ACC
    OUT -.->|"si l'URL est /competitions"| COMP
    OUT -.->|"si l'URL est /a-propos"| PROP

    style APP fill:#12203a,color:#fff
    style HEAD fill:#2563b0,color:#fff
    style OUT fill:#d23b3b,color:#fff
    style ACC fill:#eaf0f8,color:#12203a
    style COMP fill:#eaf0f8,color:#12203a
    style PROP fill:#eaf0f8,color:#12203a
```

Ce schéma explique une chose qu'on observe directement dans le navigateur : quand tu cliques sur un onglet, **la barre de navigation ne clignote pas**. Elle n'est pas rechargée, parce qu'elle ne fait pas partie de la zone qui change. Seul le contenu du `router-outlet` est remplacé.

### 2.2 Anatomie d'un composant : quatre fichiers

Chaque composant généré par Angular CLI produit quatre fichiers qui portent le même nom :

| Fichier | Rôle | Analogie |
|---|---|---|
| `header.ts` | La logique : les données et le comportement | Le cerveau |
| `header.html` | Le **gabarit** : ce qui est affiché | Le corps |
| `header.css` | L'apparence, appliquée à ce composant seul | Les vêtements |
| `header.spec.ts` | Les tests automatiques | Le contrôle qualité |

Le fichier `.ts` est le point d'entrée. Voici celui de notre barre de navigation, ligne par ligne :

```ts
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {}
```

Les deux lignes `import` vont chercher des outils dans Angular — comme on sortirait deux outils d'une boîte avant de commencer.

`@Component({ ... })` est un **décorateur** : une étiquette posée sur la classe qui suit, qui dit à Angular « ceci n'est pas une classe ordinaire, c'est un composant ». Sans lui, la classe `Header` ne serait qu'un objet TypeScript sans aucun lien avec l'affichage.

À l'intérieur, quatre réglages :

- `selector: 'app-header'` — le **nom de balise** sous lequel ce composant s'utilise ailleurs. C'est ce qui permet d'écrire `<app-header />` dans un autre gabarit. Le préfixe `app-` évite toute confusion avec une vraie balise HTML.
- `templateUrl` et `styleUrl` — les chemins vers le HTML et le CSS du composant.
- `imports: [RouterLink, RouterLinkActive]` — la liste de ce dont **le gabarit** a besoin. C'est le point le plus contre-intuitif au début : si `header.html` utilise `routerLink`, il faut que `header.ts` l'ait importé, sinon Angular ne reconnaît pas l'attribut et l'ignore silencieusement.

Ce tableau `imports` est la marque des composants dits **standalone** (« autonomes ») : chaque composant déclare lui-même ses besoins. C'est le fonctionnement par défaut d'Angular aujourd'hui. Attention en cherchant de l'aide en ligne : une grande partie des tutoriels décrit encore l'ancienne approche, à base de `NgModule`, où les dépendances étaient déclarées en bloc pour un groupe de composants. Si un exemple trouvé sur Internet parle de `declarations` ou de `@NgModule`, il est antérieur à ce qu'on utilise ici.

Enfin, `export class Header {}` : la classe est vide pour l'instant parce que la barre de navigation n'a aucune donnée ni aucun comportement — elle se contente d'afficher des liens fixes. C'est ici que viendront les variables et les fonctions à partir de l'étape 2.

### 2.3 L'arborescence du projet

Le projet Angular a été créé dans un sous-dossier `frontend/`, et non à la racine du dépôt. C'est un choix d'anticipation : à l'étape 4, un dossier `backend/` viendra à côté. Les deux resteront ainsi nettement séparés, chacun avec ses propres dépendances.

```
Appli-suivi-competition/          <- le depot Git
├── CONTEXTE.md                    <- cadre du projet
├── DOCUMENT-APPRENTISSAGE.md      <- ce document
├── GLOSSAIRE.md
├── .env.example
└── frontend/                      <- le projet Angular
    ├── package.json               <- dependances et scripts
    ├── angular.json               <- configuration de l'outil Angular
    ├── tsconfig.json              <- configuration de TypeScript
    ├── node_modules/              <- bibliotheques (jamais versionne)
    ├── public/
    │   └── favicon.ico            <- icone de l'onglet
    └── src/                       <- TOUT le code ecrit a la main
        ├── index.html             <- la seule vraie page HTML
        ├── main.ts                <- point de demarrage
        ├── styles.css             <- styles globaux
        └── app/
            ├── app.ts             <- composant racine
            ├── app.html
            ├── app.css
            ├── app.config.ts      <- configuration de l'application
            ├── app.routes.ts      <- table des routes
            ├── header/            <- composant barre de navigation
            │   ├── header.ts
            │   ├── header.html
            │   ├── header.css
            │   └── header.spec.ts
            └── pages/             <- un dossier par page
                ├── accueil/
                ├── competitions/
                └── a-propos/
```

La règle à retenir : **tout ce que tu écris à la main vit dans `src/`.** Le reste est soit de la configuration, soit généré automatiquement.

### 2.4 La chaîne de démarrage

Comprendre comment Angular démarre évite de considérer l'affichage comme de la magie. Cinq fichiers se passent le relais :

```mermaid
flowchart TB
    A["<b>index.html</b><br/>contient &lt;app-root&gt;&lt;/app-root&gt;<br/><i>une coquille vide</i>"]
    B["<b>main.ts</b><br/>bootstrapApplication(App, appConfig)<br/><i>« demarre l'application »</i>"]
    C["<b>app.config.ts</b><br/>provideRouter(routes)<br/><i>active le routeur</i>"]
    D["<b>app.ts</b><br/>le composant racine"]
    E["<b>app.html</b><br/>&lt;app-header /&gt;<br/>&lt;router-outlet /&gt;"]
    F["<b>Page affichee</b>"]

    A -->|"le navigateur charge le JS"| B
    B -->|"lit la configuration"| C
    B -->|"instancie le composant racine"| D
    D -->|"affiche son gabarit"| E
    E -->|"remplit &lt;app-root&gt;"| F

    style A fill:#2a2a2a,color:#fff
    style B fill:#2563b0,color:#fff
    style C fill:#2563b0,color:#fff
    style D fill:#2563b0,color:#fff
    style E fill:#2563b0,color:#fff
    style F fill:#d23b3b,color:#fff
```

Le point important est le tout début. Si tu ouvres `src/index.html`, tu ne trouveras **aucun** des textes affichés à l'écran — juste une balise `<app-root></app-root>` vide. C'est normal : cette balise est un emplacement réservé. Tout le contenu visible est produit par JavaScript au moment de l'exécution, et vient le remplir.

### 2.5 Application monopage et routage

Sur un site classique, chaque lien déclenche un aller-retour complet avec le serveur : le navigateur jette la page courante, en redemande une autre, et la réaffiche. D'où le bref écran blanc entre deux pages.

Angular fonctionne autrement. C'est une **application monopage** (*SPA*) : le navigateur charge une seule fois `index.html` et tout le code JavaScript, puis se débrouille seul pour changer d'écran.

```mermaid
flowchart TB
    subgraph classique ["Site classique — 1 clic = 1 aller-retour"]
        direction LR
        C1["Clic sur<br/>un lien"] --> C2["Requete<br/>au serveur"] --> C3["Page HTML<br/>complete"] --> C4["Rechargement<br/><i>ecran blanc</i>"]
    end

    subgraph spa ["Application monopage — 1 clic = 0 aller-retour"]
        direction LR
        S1["Clic sur<br/>un routerLink"] --> S2["Le routeur<br/>intercepte"] --> S3["Remplace le contenu<br/>du router-outlet"] --> S4["Affichage instantane<br/><i>aucun rechargement</i>"]
    end

    style C4 fill:#c94040,color:#fff
    style S4 fill:#1e5fa8,color:#fff
    style C2 fill:#e8e8e8,color:#333
    style S2 fill:#e8e8e8,color:#333
```

C'est précisément le rôle de `routerLink`. Un `<a href="/competitions">` ordinaire quitterait l'application et la rechargerait entièrement — plusieurs centaines de millisecondes perdues, et tout l'état en mémoire remis à zéro. Un `<a routerLink="/competitions">` est intercepté par Angular avant que le navigateur n'agisse.

Le détail de ce qui se passe au clic :

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant H as Header
    participant R as Routeur Angular
    participant T as Table des routes
    participant O as router-outlet

    U->>H: clique sur « Compétitions »
    H->>R: routerLink="/competitions"
    Note over R: empeche le rechargement<br/>de la page par le navigateur
    R->>T: quel composant pour ce chemin ?
    T-->>R: le composant Competitions
    R->>O: retire Accueil, insere Competitions
    R->>U: met a jour l'URL et le titre de l'onglet
    Note over U: la barre de navigation<br/>n'a jamais ete rechargee
```

La table des routes, elle, est une simple liste de correspondances dans `app.routes.ts` :

```ts
export const routes: Routes = [
  { path: '', component: Accueil, title: 'Accueil — Suivi Compétition' },
  { path: 'competitions', component: Competitions, title: '…' },
  { path: 'a-propos', component: APropos, title: '…' },
  { path: '**', redirectTo: '' },
];
```

Trois remarques sur ce bloc. `path: ''` correspond à la racine du site, c'est-à-dire la page d'accueil. La propriété `title` met à jour le titre de l'onglet du navigateur à chaque navigation — un détail d'accessibilité souvent oublié dans les SPA. Enfin, `path: '**'` signifie « n'importe quelle autre adresse » : c'est le filet de sécurité qui renvoie vers l'accueil si l'utilisateur tape une URL inexistante. **Il doit impérativement rester en dernier**, car Angular parcourt la liste dans l'ordre et s'arrête à la première correspondance — placé en premier, il capturerait tout.

### 2.6 L'encapsulation des styles

Une difficulté classique du CSS est qu'il est global : une règle `.carte { ... }` écrite pour une page s'applique à **toutes** les `.carte` du site, y compris celles qu'on n'avait pas en tête.

Angular supprime ce problème : le CSS d'un composant ne s'applique qu'à ce composant. En coulisses, il ajoute un attribut unique à chaque élément et réécrit les sélecteurs pour ne cibler que lui.

C'est directement observable dans notre code : la classe `.note-chantier` est définie **deux fois**, dans `accueil.css` et dans `competitions.css`, sans que les deux se gênent.

La conséquence pratique à retenir :

| Où écrire du CSS | Portée |
|---|---|
| `src/styles.css` | Toute l'application — police, couleur de fond, remise à zéro des marges |
| `mon-composant.css` | Ce composant uniquement |

En cas de doute, le CSS va dans le composant. On ne remonte une règle dans `styles.css` que lorsqu'elle concerne réellement toute l'application.

## 3. Prérequis

Pars de la branche **`etape-00-setup`**.

```
git checkout etape-00-setup
git checkout -b etape-01-angular-decouverte
```

## 4. Déroulé détaillé

### 4.1 Créer le projet Angular

Depuis la racine du dépôt :

```
ng new suivi-competition --directory frontend --routing --style css --ssr false --zoneless --skip-git --package-manager npm --defaults
```

Chaque option compte :

| Option | Effet et raison |
|---|---|
| `--directory frontend` | Crée le projet dans `frontend/` plutôt qu'à la racine, pour laisser la place au `backend/` de l'étape 4 |
| `--routing` | Met en place le routage dès le départ — on en a besoin immédiatement |
| `--style css` | CSS simple, sans préprocesseur supplémentaire à apprendre |
| `--ssr false` | Pas de rendu côté serveur : une notion avancée, inutile ici |
| `--zoneless` | Mode moderne de détection des changements ; sera expliqué à l'étape 2, quand une donnée changera vraiment |
| `--skip-git` | **Essentiel** : le dépôt Git existe déjà. Sans cette option, Angular en créerait un second, imbriqué dans le premier, ce qui empêcherait le suivi des fichiers |
| `--defaults` | Accepte les valeurs par défaut au lieu de poser des questions |

L'installation des dépendances prend une à deux minutes : npm télécharge plusieurs centaines de paquets dans `node_modules/`.

### 4.2 Générer les composants

Depuis `frontend/` :

```
ng generate component header
ng generate component pages/accueil
ng generate component pages/competitions
ng generate component pages/a-propos
```

Chaque commande crée un dossier avec ses quatre fichiers, correctement nommés et déjà reliés entre eux. On pourrait les écrire à la main, mais la commande évite les fautes de frappe dans les chemins — une source d'erreurs pénible car silencieuse.

Le chemin `pages/accueil` range le composant dans un sous-dossier `pages/`. Ce n'est pas une obligation d'Angular, juste une convention utile : elle distingue d'un coup d'œil les composants qui sont des **pages entières** de ceux qui sont des **morceaux réutilisables**, comme `header`.

Attention au nom de la classe générée : Angular convertit `a-propos` en `APropos`. C'est ce nom-là qu'il faudra importer dans `app.routes.ts`.

### 4.3 Déclarer les routes

Fichier complet — `src/app/app.routes.ts` :

```ts
import { Routes } from '@angular/router';
import { Accueil } from './pages/accueil/accueil';
import { Competitions } from './pages/competitions/competitions';
import { APropos } from './pages/a-propos/a-propos';

export const routes: Routes = [
  { path: '', component: Accueil, title: 'Accueil — Suivi Compétition' },
  { path: 'competitions', component: Competitions, title: 'Compétitions — Suivi Compétition' },
  { path: 'a-propos', component: APropos, title: 'À propos — Suivi Compétition' },
  { path: '**', redirectTo: '' },
];
```

Les trois `import` du haut vont chercher les classes des composants dans leurs fichiers respectifs. Le chemin `'./pages/accueil/accueil'` s'écrit **sans l'extension `.ts`** — c'est une convention de TypeScript, qui l'ajoute tout seul.

`Routes` est un **type** : en écrivant `routes: Routes`, on annonce à TypeScript que cette variable est une liste de routes. Si tu écris `compnent` au lieu de `component`, l'éditeur souligne l'erreur immédiatement, au lieu de te laisser découvrir le problème dans le navigateur. C'est tout l'intérêt des types, expliqué au glossaire.

Rappel du piège vu en 2.5 : `path: '**'` doit rester **la dernière ligne**. Angular lit la liste de haut en bas et s'arrête à la première correspondance.

### 4.4 Construire la coquille

`src/app/app.html` devient volontairement très court :

```html
<app-header />

<main class="contenu">
  <router-outlet />
</main>
```

Tout est dit en quatre lignes : la barre de navigation en haut, puis la zone variable. `<app-header />` utilise le sélecteur déclaré par le composant `Header` ; `<router-outlet />` est l'emplacement que le routeur remplira.

Pour que ces deux balises soient reconnues, `app.ts` doit les importer :

```ts
@Component({
  imports: [RouterOutlet, Header],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
```

C'est l'application concrète de la règle vue en 2.2 : ce que le gabarit utilise, le fichier `.ts` doit l'importer.

Le CSS de la coquille tient en quelques lignes — `src/app/app.css` :

```css
.contenu {
  max-width: 1100px;   /* la ligne de texte ne s'etire pas a l'infini */
  margin: 0 auto;      /* centre le bloc horizontalement */
  padding: 2.5rem 1.25rem 4rem;
}
```

`max-width` mérite un mot : sur un écran large, un paragraphe qui occupe toute la largeur devient pénible à lire, parce que l'œil perd la ligne en revenant à gauche. Limiter la largeur du contenu est une règle de lisibilité de base.

Deux fichiers complètent le démarrage, et il est utile de les avoir lus au moins une fois même si on n'y touchera pas avant longtemps.

`src/main.ts` — le tout premier code exécuté :

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
```

Il dit une seule chose : « démarre l'application à partir du composant `App`, avec cette configuration ». Le `.catch(...)` affiche l'erreur dans la console du navigateur si le démarrage échoue.

`src/app/app.config.ts` — la configuration :

```ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
```

Le tableau `providers` liste les services activés dans toute l'application. `provideRouter(routes)` est celui qui nous intéresse : **c'est lui qui branche le routeur** et lui donne la table des routes écrite en 4.3. Sans cette ligne, `routerLink` et `<router-outlet />` ne fonctionneraient pas.

### 4.5 La barre de navigation

Fichier complet — `src/app/header/header.html` :

```html
<header class="barre">
  <div class="barre-interieur">
    <a class="marque" routerLink="/">
      <span class="marque-pastille"></span>
      <span class="marque-texte">Suivi Compétition</span>
    </a>

    <nav class="navigation">
      <a routerLink="/" routerLinkActive="actif" [routerLinkActiveOptions]="{ exact: true }">
        Accueil
      </a>
      <a routerLink="/competitions" routerLinkActive="actif">Compétitions</a>
      <a routerLink="/a-propos" routerLinkActive="actif">À propos</a>
    </nav>
  </div>
</header>
```

Les balises `<header>` et `<nav>` ne sont pas décoratives : ce sont des balises **sémantiques**, qui indiquent la nature du contenu. Un lecteur d'écran, utilisé par une personne malvoyante, s'en sert pour annoncer « navigation » et permettre d'y sauter directement. Un `<div>` ne dit rien de tel. À apparence identique, la version sémantique est accessible ; l'autre ne l'est pas.

Chaque onglet est un lien `routerLink` accompagné de `routerLinkActive` :

```html
<a routerLink="/competitions" routerLinkActive="actif">Compétitions</a>
```

`routerLinkActive="actif"` ajoute automatiquement la classe CSS `actif` au lien **lorsque la page correspondante est affichée**. C'est ce qui met l'onglet courant en surbrillance, sans écrire la moindre ligne de logique.

Le lien vers l'accueil demande une précaution supplémentaire :

```html
<a routerLink="/" routerLinkActive="actif" [routerLinkActiveOptions]="{ exact: true }">
```

Sans `exact: true`, le lien `/` serait considéré comme actif en permanence — car `/competitions` et `/a-propos` *commencent* par `/`. Les trois onglets apparaîtraient alors allumés en même temps. Les crochets autour de `[routerLinkActiveOptions]` signalent à Angular que ce qui suit est du **code** à évaluer, et non du texte brut.

Côté apparence, voici les règles essentielles de `header.css` :

```css
.barre {
  background-color: #12203a;         /* bleu tres sombre */
  border-bottom: 1px solid #22345a;
}

.barre-interieur {
  max-width: 1100px;
  margin: 0 auto;
  height: 64px;
  display: flex;                     /* aligne les enfants sur une ligne */
  align-items: center;               /* les centre verticalement */
  justify-content: space-between;    /* marque a gauche, navigation a droite */
}

.navigation a {
  color: #b6c4dd;                    /* gris-bleu clair : lien au repos */
  text-decoration: none;             /* retire le soulignement par defaut */
  padding: 0.5rem 0.85rem;
  border-radius: 6px;
}

.navigation a:hover {
  color: #ffffff;                    /* au survol de la souris */
  background-color: #1d3157;
}

.navigation a.actif {
  color: #ffffff;                    /* page actuellement affichee */
  background-color: #2563b0;
}
```

Trois points à retenir ici.

`display: flex` place les éléments enfants sur une même ligne, et `justify-content: space-between` les pousse aux extrémités : c'est ce qui met la marque à gauche et les onglets à droite, sans aucun calcul de position.

Les trois règles `.navigation a`, `:hover` et `.actif` décrivent **trois états d'un même lien** : au repos, sous la souris, et correspondant à la page affichée. Donner un retour visuel à chacun de ces états n'est pas cosmétique — c'est ce qui permet à l'utilisateur de savoir où il est et ce qui est cliquable.

Enfin, `.actif` n'est jamais écrit dans le HTML. C'est `routerLinkActive="actif"` qui l'ajoute et le retire automatiquement selon l'URL. Le CSS se contente de décrire à quoi ressemble cet état.

### 4.6 Rédiger les pages

Les trois pages sont du HTML statique — aucune donnée, aucune logique. C'est volontaire : l'objectif de l'étape est la **structure**, pas le contenu dynamique.

**La page d'accueil** (`pages/accueil/accueil.html`) s'ouvre sur un bloc de présentation :

```html
<section class="hero">
  <p class="hero-surtitre">Plateforme de suivi</p>
  <h1 class="hero-titre">Tous tes résultats, au même endroit</h1>
  <p class="hero-texte">
    League of Legends, Valorant, Ligue 1 et Ligue des Champions : quatre univers, quatre sources
    d'information différentes. Cette plateforme les rassemble sur un seul tableau de bord.
  </p>
  <a class="bouton-principal" routerLink="/competitions">Voir les compétitions suivies</a>
</section>
```

Le bouton est un `<a routerLink>`, pas un `<button>`. La règle est simple et vaut la peine d'être retenue : **un élément qui emmène ailleurs est un lien ; un élément qui déclenche une action sur place est un bouton.** Ici on navigue, donc c'est un lien — même s'il est habillé en bouton par le CSS.

Comme ce gabarit utilise `routerLink`, le fichier `accueil.ts` doit l'importer — exactement la règle vue en 2.2 :

```ts
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-accueil',
  styleUrl: './accueil.css',
  templateUrl: './accueil.html',
})
export class Accueil {}
```

![Page d'accueil](docs/images/etape-01-accueil.png)

**La page Compétitions** (`pages/competitions/competitions.html`) est la plus instructive, parce qu'elle est volontairement mal écrite. Voici une carte :

```html
<article class="carte">
  <div class="carte-bandeau carte-bandeau--lol"></div>
  <div class="carte-corps">
    <h3>League of Legends</h3>
    <p class="carte-editeur">Riot Games</p>
    <p class="carte-texte">
      Jeu d'arène de bataille en ligne à cinq contre cinq. Les données proviendront de l'API
      officielle de Riot Games.
    </p>
  </div>
</article>
```

Ce bloc est répété **quatre fois** dans le fichier, en ne changeant que le titre, l'éditeur, le texte et la couleur du bandeau. C'est du copier-coller assumé, et c'est un problème réel : ajouter une cinquième compétition demande de dupliquer encore ; corriger une faute de frappe présente dans les quatre demande quatre corrections ; et rien ne garantit qu'on ne va pas en oublier une.

Retiens cette sensation : **l'étape 3 remplacera ces quatre blocs par un seul, parcouru automatiquement sur une liste de données.** Une boucle est beaucoup plus facile à comprendre quand on a d'abord ressenti ce qu'elle évite.

![Page Compétitions](docs/images/etape-01-competitions.png)

**La page À propos** (`pages/a-propos/a-propos.html`) utilise une balise moins connue, la **liste de définitions** :

```html
<dl class="stack">
  <div class="stack-ligne">
    <dt>Frontend</dt>
    <dd>Angular — la partie visible, exécutée dans le navigateur</dd>
  </div>
  <div class="stack-ligne">
    <dt>Backend</dt>
    <dd>Node.js, Express et TypeScript — le serveur qui répond aux demandes</dd>
  </div>
</dl>
```

`<dl>` (*definition list*) associe des termes à leurs définitions : `<dt>` est le terme, `<dd>` sa description. On aurait pu obtenir le même rendu avec des `<div>`, mais la version sémantique exprime la **relation** entre les deux colonnes — ce qu'un tableau de `<div>` ne fait pas.

![Page À propos](docs/images/etape-01-a-propos.png)

**Les styles globaux**, enfin, dans `src/styles.css` :

```css
* {
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #1c2433;
  background-color: #f4f6f9;
}
```

`box-sizing: border-box` appliqué à tout (`*`) corrige un comportement historique du CSS déroutant : par défaut, un élément de `width: 200px` auquel on ajoute du `padding` mesure **plus** de 200 pixels au final. Avec `border-box`, la largeur annoncée est la largeur réelle, marges intérieures comprises. C'est la première ligne de presque toutes les feuilles de style modernes.

`font-family: system-ui` demande au navigateur d'utiliser la police par défaut du système — Segoe UI sur Windows, San Francisco sur Mac. L'application paraît ainsi « native » sur chaque plateforme, et aucune police n'a besoin d'être téléchargée.

Ces règles sont dans `styles.css` et non dans un composant parce qu'elles concernent **toute** l'application. C'est l'application directe de l'arbitrage vu en 2.6.

Dernier rappel sur les couleurs : elles sont écrites en dur (`#2563b0`, `#d23b3b`, `#12203a`) dans chaque fichier CSS, et donc **répétées d'un fichier à l'autre**. Le bleu `#2563b0` apparaît déjà dans quatre fichiers différents. L'étape 2 les remplacera par des variables CSS — et le passage au thème sombre montrera immédiatement pourquoi les écrire en dur était un problème.

### 4.7 Lancer et vérifier

```
npm start
```

Ce raccourci, défini dans `package.json`, exécute `ng serve`. L'application devient accessible sur **http://localhost:4200**.

Le serveur reste actif et surveille les fichiers : chaque sauvegarde déclenche une recompilation et un rafraîchissement automatique du navigateur. Pour l'arrêter, `Ctrl + C` dans le terminal.

Deux autres commandes utiles :

```
npm test          # execute les tests automatiques
npm run build     # produit la version optimisee dans dist/
```

Les captures d'écran qui illustrent ce document sont produites automatiquement, pendant que le serveur tourne, depuis la racine du dépôt :

```
bash scripts/captures.sh etape-01
```

Le script pilote Microsoft Edge en mode « headless » — c'est-à-dire sans fenêtre visible — pour charger chaque page et l'enregistrer dans `docs/images/`. L'intérêt d'automatiser ça plutôt que de faire des captures à la main : quand l'interface changera à l'étape suivante, une seule commande régénérera toutes les illustrations d'un coup, sans risque d'en oublier une.

## 5. Livrable attendu

- L'application démarre sur `http://localhost:4200` sans erreur.
- La barre de navigation affiche trois onglets : Accueil, Compétitions, À propos.
- Cliquer sur un onglet change le contenu **sans rechargement** de la page, et l'URL se met à jour.
- L'onglet correspondant à la page affichée est mis en surbrillance.
- La page *Compétitions* présente les quatre compétitions du projet.
- Une URL inexistante (`http://localhost:4200/nimportequoi`) renvoie vers l'accueil.
- `npm test` et `npm run build` s'exécutent sans erreur.

## 6. Checklist d'auto-vérification

1. Quels sont les quatre fichiers d'un composant, et que contient chacun ?
   - *À relire :* § 2.2 « Anatomie d'un composant : quatre fichiers »
2. Le gabarit `header.html` utilise `routerLink`. Que faut-il faire dans `header.ts` pour que ça fonctionne, et que se passe-t-il si on l'oublie ?
   - *À relire :* § 2.2 « Anatomie d'un composant : quatre fichiers » (réglage `imports`)
3. Pourquoi la barre de navigation ne disparaît-elle pas quand on change de page ?
   - *À relire :* § 2.1 « Le composant, brique de base » et § 2.5 « Application monopage et routage »
4. Quelle différence concrète entre `<a href="/competitions">` et `<a routerLink="/competitions">` ?
   - *À relire :* § 2.5 « Application monopage et routage »
5. Pourquoi la route `{ path: '**' }` doit-elle être écrite en dernier ?
   - *À relire :* § 2.5 « Application monopage et routage » (rappelé en § 4.3 « Déclarer les routes »)
6. La classe `.note-chantier` est définie dans deux fichiers CSS différents. Pourquoi les deux ne se contredisent-elles pas ?
   - *À relire :* § 2.6 « L'encapsulation des styles »
7. Si tu ouvres `src/index.html`, tu n'y trouves aucun des textes affichés à l'écran. D'où viennent-ils ?
   - *À relire :* § 2.4 « La chaîne de démarrage »

## 7. Branche d'arrivée

À la fin de cette étape, ton code doit être poussé sur **`etape-01-angular-decouverte`**.

L'étape suivante partira de cette branche pour créer `etape-02-theme`, qui remplacera les couleurs en dur par des variables CSS et ajoutera la bascule entre thème clair et thème sombre.

---

# Étape 2 — Charte graphique et thèmes clair/sombre

## 1. Objectifs

À la fin de cette étape, tu dois savoir :

- expliquer pourquoi écrire une couleur en dur dans plusieurs fichiers est un problème, et ce qu'une **variable CSS** y change ;
- définir deux jeux de couleurs et basculer de l'un à l'autre sans dupliquer une seule règle de style ;
- expliquer ce qu'est un **signal** et pourquoi Angular en a besoin pour mettre l'affichage à jour ;
- retenir un choix utilisateur d'une visite à l'autre avec `localStorage`, en gérant le cas où il est indisponible ;
- expliquer pourquoi un script placé dans `index.html` évite un éclair de lumière au chargement ;
- vérifier qu'un contraste texte/fond reste lisible, et corriger quand il ne l'est pas.

## 2. Concepts abordés

### 2.1 Le problème qu'on vient résoudre

À la fin de l'étape 1, l'application fonctionnait. Mais le bleu `#2563b0` était écrit **dans quatre fichiers différents** : `header.css`, `accueil.css`, `competitions.css` et `a-propos.css`.

Tant qu'on n'y touche pas, ça marche. Les ennuis commencent dès qu'il faut changer quelque chose :

```mermaid
flowchart TB
    subgraph avant ["AVANT — couleur ecrite en dur"]
        direction TB
        A1["Changer le bleu<br/>de l'application"]
        A2["header.css<br/>#2563b0"]
        A3["accueil.css<br/>#2563b0"]
        A4["competitions.css<br/>#2563b0"]
        A5["a-propos.css<br/>#2563b0"]
        A6["4 modifications<br/><i>et si on en oublie une ?</i>"]
        A1 --> A2 & A3 & A4 & A5 --> A6
    end

    subgraph apres ["APRES — variable CSS"]
        direction TB
        B1["Changer le bleu<br/>de l'application"]
        B2["styles.css<br/>--couleur-primaire"]
        B3["1 seule modification<br/><i>tous les composants suivent</i>"]
        B1 --> B2 --> B3
    end

    style A6 fill:#c94040,color:#fff
    style B3 fill:#1e5fa8,color:#fff
    style B2 fill:#2563b0,color:#fff
```

Le vrai problème n'est pas le nombre de modifications — c'est le **risque d'en oublier une**. Une seule occurrence oubliée, et l'application se retrouve avec deux bleus légèrement différents, sans que personne ne le remarque avant longtemps.

Et le thème sombre rend cette approche carrément impossible : il faudrait écrire **deux fois** chaque règle de style, une par thème. Le fichier doublerait de taille, et chaque modification future devrait être faite en double.

### 2.2 La variable CSS

Une **variable CSS** est une valeur nommée, définie une fois et réutilisée partout. Son nom commence obligatoirement par deux tirets :

```css
:root {
  --couleur-primaire: #2563b0;      /* on definit */
}

.bouton {
  background-color: var(--couleur-primaire);   /* on utilise */
}
```

`:root` désigne l'élément racine du document, c'est-à-dire la balise `<html>`. Définir une variable là revient à la rendre disponible partout dans la page, puisque tout le reste est à l'intérieur.

`var(--couleur-primaire)` va chercher la valeur. Si elle change, tout ce qui l'utilise change avec elle — automatiquement, sans que le navigateur ait besoin de recharger quoi que ce soit.

Attention à ne pas confondre avec les **variables d'environnement** vues à l'étape 0 : rien à voir. Une variable CSS vit dans la feuille de style, est lisible par tout le monde, et sert à organiser des valeurs d'apparence. Une variable d'environnement vit hors du code et sert à protéger des secrets.

### 2.3 Deux jeux de valeurs

C'est ici que le mécanisme devient réellement puissant. Une variable peut être **redéfinie** dans un contexte plus précis, et tout ce qui l'utilise suit sans être modifié.

```mermaid
flowchart TB
    R[":root<br/><b>THEME CLAIR</b><br/>--couleur-fond: #f4f6f9<br/>--couleur-texte: #1c2433<br/>--couleur-primaire: #2563b0"]
    D[":root[data-theme='sombre']<br/><b>THEME SOMBRE</b><br/>--couleur-fond: #0f1623<br/>--couleur-texte: #e6ecf5<br/>--couleur-primaire: #5b9bdd"]

    H["header.css<br/>var(--couleur-primaire)"]
    A["accueil.css<br/>var(--couleur-primaire)"]
    C["competitions.css<br/>var(--couleur-primaire)"]
    P["a-propos.css<br/>var(--couleur-primaire)"]

    R -->|"valeurs par defaut"| H & A & C & P
    D -.->|"remplace, si data-theme='sombre'<br/>est present sur &lt;html&gt;"| R

    style R fill:#eaf0f8,color:#12203a
    style D fill:#12203a,color:#fff
    style H fill:#2563b0,color:#fff
    style A fill:#2563b0,color:#fff
    style C fill:#2563b0,color:#fff
    style P fill:#2563b0,color:#fff
```

Le point essentiel : **les quatre fichiers de composants ne sont jamais modifiés.** Ils demandent `var(--couleur-primaire)` et se moquent complètement de savoir laquelle des deux définitions leur répond. Toute la bascule se joue sur un seul attribut, posé sur une seule balise.

C'est exactement ce que fait le bouton : il écrit `data-theme="sombre"` sur `<html>`, et le navigateur recalcule toutes les couleurs.

### 2.4 Le signal : une donnée qui prévient Angular

Le bouton doit changer d'icône : une lune en thème clair (« passer en sombre »), un soleil en thème sombre.

Pour ça, le composant doit retenir le thème courant. On pourrait écrire une variable ordinaire :

```ts
theme = 'clair';   // NE FONCTIONNERAIT PAS
```

Le problème est qu'Angular n'a **aucun moyen de savoir** que cette variable a changé. Rien ne le prévient, donc il ne redessine rien, et l'icône resterait figée.

La solution est le **signal** : une valeur qui prévient Angular quand elle change.

```ts
readonly theme = signal<Theme>('clair');   // creation

theme();                                    // lecture  -> avec des parentheses
theme.set('sombre');                        // ecriture
```

Les parenthèses à la lecture déroutent au début. Elles sont pourtant logiques : lire un signal n'est pas consulter une case mémoire, c'est **lui demander sa valeur** — et c'est à ce moment précis qu'Angular note « ce bout d'affichage dépend de ce signal ». Plus tard, quand `.set()` est appelé, il sait exactement quoi rafraîchir : ce bout-là, et rien d'autre.

Voici ce qui se passe au clic, de bout en bout :

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant B as Bouton
    participant C as Composant Header
    participant H as Balise &lt;html&gt;
    participant N as Moteur CSS
    participant S as localStorage

    U->>B: clic
    B->>C: (click)="basculerTheme()"
    C->>C: theme.set('sombre')
    Note over C: le signal previent Angular :<br/>l'icone passe de la lune au soleil
    C->>H: dataset.theme = 'sombre'
    H->>N: l'attribut a change
    N->>N: :root[data-theme='sombre']<br/>remplace les variables
    N-->>U: toutes les couleurs basculent
    C->>S: setItem('theme', 'sombre')
    Note over S: le choix survivra<br/>a la fermeture du navigateur
```

Remarque la répartition des rôles : **Angular ne gère que l'icône.** Le changement de toutes les couleurs de l'application est entièrement pris en charge par le moteur CSS du navigateur, à partir d'un seul attribut modifié. C'est beaucoup plus efficace que de faire recalculer des styles par du JavaScript.

### 2.5 Retenir le choix

Un thème qu'il faut re-sélectionner à chaque visite n'a aucun intérêt. Il faut donc stocker le choix quelque part qui survive à la fermeture du navigateur : c'est le rôle de `localStorage`.

```ts
localStorage.setItem('theme', 'sombre');   // ecrire
localStorage.getItem('theme');             // lire  -> 'sombre'
```

C'est un petit espace de rangement que le navigateur réserve à chaque site, sous forme de paires nom/valeur. Trois limites à connaître dès maintenant :

- il ne stocke que du **texte** ;
- il est propre à **un navigateur et une machine** — un choix fait sur le PC ne suivra pas sur le téléphone ;
- il peut être **indisponible** : navigation privée, nettoyage, ou politique d'entreprise qui bloque le stockage.

Ce dernier point explique un détail du code. Chaque accès est entouré d'un `try / catch` :

```ts
try {
  localStorage.setItem(CLE_STOCKAGE, nouveauTheme);
} catch {
  // Stockage indisponible : le theme fonctionne quand meme,
  // il ne sera simplement pas retenu au prochain chargement.
}
```

`try / catch` signifie « essaie ceci ; si ça échoue, fais cela plutôt que de tout arrêter ». Sans lui, un navigateur en mode privé pourrait faire planter la bascule de thème entièrement. Avec lui, la fonctionnalité se dégrade proprement : le thème change, il n'est simplement pas mémorisé.

C'est un principe qui vaut bien au-delà de cet exemple : **une fonctionnalité annexe qui échoue ne doit jamais casser la fonctionnalité principale.** On le retrouvera à l'étape 12, quand une API externe sera indisponible.

### 2.6 L'éclair blanc, et pourquoi un script dans `index.html`

Il reste un problème de chronologie, invisible dans le code mais très visible à l'écran.

```mermaid
flowchart TB
    subgraph sans ["SANS le script dans index.html"]
        direction LR
        S1["Le navigateur<br/>affiche la page"] --> S2["Theme clair<br/><i>valeur par defaut du CSS</i>"] --> S3["Angular demarre<br/><i>~200 ms plus tard</i>"] --> S4["Bascule en sombre"]
    end

    subgraph avec ["AVEC le script dans index.html"]
        direction LR
        A1["Le script lit<br/>le choix enregistre"] --> A2["data-theme pose<br/>sur &lt;html&gt;"] --> A3["Le navigateur<br/>affiche la page"] --> A4["Directement en sombre"]
    end

    style S2 fill:#ffffff,color:#333
    style S4 fill:#c94040,color:#fff
    style A4 fill:#1e5fa8,color:#fff
```

Sans précaution, un utilisateur qui a choisi le thème sombre voit d'abord la page en **clair** pendant une fraction de seconde, le temps qu'Angular démarre — puis elle bascule. C'est bref, mais très désagréable : un éclair blanc en pleine nuit.

La cause est simple : Angular est du JavaScript, qui doit être téléchargé puis exécuté. Le navigateur, lui, affiche la page dès qu'il le peut, sans attendre.

La solution est de poser le thème **avant** que quoi que ce soit ne s'affiche, avec un petit script placé directement dans le `<head>` de `index.html`. C'est le seul JavaScript écrit en dur dans cette page, et c'est justifié : il doit s'exécuter avant tout le reste.

Ce script gère aussi le cas de la **première visite**, où `localStorage` est encore vide. Plutôt que d'imposer arbitrairement le thème clair, il consulte la préférence réglée dans le système d'exploitation, via `prefers-color-scheme`. Quelqu'un qui a configuré son Windows en sombre arrive donc directement sur une application sombre.

### 2.7 Le contraste, et une erreur qu'il a fallu corriger

Le cadre du projet demande de vérifier les contrastes dans les deux thèmes. Ce n'est pas une formalité — cette étape en donne une démonstration concrète.

Le **contraste** est l'écart de luminosité entre un texte et son fond, exprimé par un rapport. Les règles d'accessibilité fixent un minimum de **4,5:1** pour du texte de taille normale.

En thème clair, le bouton « Voir les compétitions suivies » est en texte blanc sur le bleu `#2563b0` : **5,9:1**. Confortable.

Mais en thème sombre, le bleu est éclairci pour rester visible sur fond foncé — il devient `#5b9bdd`. Et là, le même texte blanc tombe à **2,9:1**, nettement sous le seuil. Le bouton devient pénible à lire.

La première version du code faisait exactement cette erreur, parce que la couleur du texte était figée :

```css
.bouton-principal {
  background-color: var(--couleur-primaire);
  color: #ffffff;              /* fige en blanc -> illisible en theme sombre */
}
```

La correction consiste à faire de cette couleur une variable elle aussi :

```css
.bouton-principal {
  background-color: var(--couleur-primaire);
  color: var(--couleur-sur-primaire);
}
```

Avec `--couleur-sur-primaire` valant `#ffffff` en thème clair et `#0b111c` — un bleu presque noir — en thème sombre, qui remonte le contraste à **6,3:1**.

La leçon est plus générale que ce cas précis : **dès qu'une couleur de fond change avec le thème, la couleur du texte posé dessus doit changer avec elle.** Les deux forment une paire indissociable.

## 3. Prérequis

Pars de la branche **`etape-01-angular-decouverte`**.

```
git checkout etape-01-angular-decouverte
git checkout -b etape-02-theme
```

## 4. Déroulé détaillé

### 4.1 Définir la palette

Tout se passe dans `src/styles.css`, qui devient le fichier de référence de la charte graphique.

Le choix des couleurs suit la règle du projet : **le bleu domine, le rouge accentue**. Le bleu structure la navigation, les boutons d'action et les liens ; le rouge est réservé à ce qui doit attirer l'œil — l'étiquette « en construction », et plus tard les indicateurs de match en direct. C'est une règle de design classique : si tout est mis en valeur, plus rien ne l'est.

Voici le jeu du thème clair :

```css
:root {
  /* --- Fonds et surfaces --- */
  --couleur-fond: #f4f6f9;
  --couleur-surface: #ffffff;
  --couleur-bordure: #dfe5ee;
  --couleur-bordure-douce: #eef1f6;

  /* --- Textes --- */
  --couleur-texte: #1c2433;
  --couleur-texte-doux: #4a5568;
  --couleur-texte-discret: #8592a8;

  /* --- Bleu : couleur dominante --- */
  --couleur-primaire: #2563b0;
  --couleur-primaire-forte: #1d4f8f;
  --couleur-primaire-claire: #3a7bd0;
  --couleur-primaire-profonde: #12203a;

  /* --- Rouge : couleur d'accent, utilisee avec parcimonie --- */
  --couleur-accent: #cc3333;
  --couleur-accent-fond: #fdf3f3;
  --couleur-accent-bordure: #f2d4d4;
  --couleur-accent-texte: #6b4545;

  /* --- Couleurs de texte POSEES SUR le bleu et sur le rouge --- */
  --couleur-sur-primaire: #ffffff;
  --couleur-sur-accent: #ffffff;

  color-scheme: light;
}
```

Deux remarques sur ce bloc.

Les noms décrivent un **rôle**, pas une apparence : `--couleur-surface` et non `--blanc`. C'est délibéré — en thème sombre, cette même variable vaudra un bleu très foncé. Une variable nommée `--blanc` qui contient du bleu nuit serait un piège permanent.

`color-scheme: light` n'est pas une variable mais une propriété standard. Elle prévient le navigateur de la nature du thème, pour qu'il adapte les éléments **qu'il dessine lui-même** : barres de défilement, listes déroulantes, champs de formulaire. Sans elle, on se retrouve avec une barre de défilement blanche éclatante au bord d'une page sombre.

Le thème sombre ne redéfinit que les valeurs — aucune règle de style n'est réécrite :

```css
:root[data-theme='sombre'] {
  --couleur-fond: #0f1623;
  --couleur-surface: #172233;
  --couleur-bordure: #26344a;
  --couleur-bordure-douce: #1e2b3d;

  --couleur-texte: #e6ecf5;
  --couleur-texte-doux: #a9b6ca;
  --couleur-texte-discret: #7686a0;

  /* Le bleu est eclairci et legerement desature : le meme #2563b0 que sur
     fond clair deviendrait trop sombre pour rester lisible ici. */
  --couleur-primaire: #5b9bdd;
  --couleur-primaire-forte: #7db3e8;
  --couleur-primaire-claire: #4a8acc;
  --couleur-primaire-profonde: #0b111c;

  /* Le rouge est adouci : un rouge vif sur fond sombre « vibre » et fatigue
     l'oeil, tout en restant reconnaissable comme la couleur d'accent. */
  --couleur-accent: #e56a6a;
  --couleur-accent-fond: #2a1a1d;
  --couleur-accent-bordure: #4a2a2e;
  --couleur-accent-texte: #e0b4b4;

  /* Sur ces bleus et rouges eclaircis, c'est un texte TRES SOMBRE qui
     redevient lisible (voir 2.7). */
  --couleur-sur-primaire: #0b111c;
  --couleur-sur-accent: #0b111c;

  color-scheme: dark;
}
```

Les couleurs ne sont pas simplement inversées. Le bleu est **éclairci**, parce qu'un bleu moyen devient illisible sur fond foncé. Le rouge est **adouci**, parce qu'un rouge saturé sur fond sombre semble vibrer et fatigue l'œil. Les deux restent pourtant reconnaissables comme le bleu et le rouge de la charte : c'est l'identité visuelle qui compte, pas la valeur exacte.

Enfin, le `body` gagne une transition, pour que la bascule soit un fondu plutôt qu'un à-coup :

```css
body {
  color: var(--couleur-texte);
  background-color: var(--couleur-fond);
  transition: background-color 0.2s ease, color 0.2s ease;
}
```

### 4.2 Adapter les composants

Le travail est mécanique : dans les quatre fichiers CSS de composants, chaque couleur en dur est remplacée par la variable correspondante.

```css
/* AVANT */
.carte {
  background-color: #ffffff;
  border: 1px solid #dfe5ee;
}

/* APRES */
.carte {
  background-color: var(--couleur-surface);
  border: 1px solid var(--couleur-bordure);
}
```

Une fois l'opération terminée, **plus aucun code couleur ne doit subsister dans un fichier de composant**. C'est facile à vérifier : une recherche de `#` dans `src/app/` ne doit plus rien renvoyer.

### 4.3 Le bouton de bascule

Le gabarit du bouton, dans `header.html` :

```html
<button
  type="button"
  class="bascule-theme"
  (click)="basculerTheme()"
  [attr.aria-label]="
    theme() === 'clair' ? 'Activer le thème sombre' : 'Activer le thème clair'
  "
>
  @if (theme() === 'clair') {
    <svg …><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
  } @else {
    <svg …><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2…" /></svg>
  }
</button>
```

Quatre notions nouvelles ici.

`(click)="basculerTheme()"` est une **liaison d'événement**. Les parenthèses signifient « quand cet événement se produit, exécute cette méthode ». C'est l'équivalent Angular du `onclick` du HTML classique.

`[attr.aria-label]="…"` est une **liaison de propriété**. Les crochets indiquent que ce qui suit est du **code à évaluer**, pas du texte. Sans eux, l'attribut contiendrait littéralement la chaîne `theme() === 'clair' ? …`. La règle mnémotechnique : les crochets vont vers l'écran, les parenthèses viennent de l'utilisateur.

`aria-label` donne un nom au bouton pour les lecteurs d'écran. Sans lui, le bouton ne contient qu'un dessin — une personne malvoyante entendrait « bouton », sans savoir à quoi il sert. Ici elle entend « Activer le thème sombre ».

`@if (…) { … } @else { … }` affiche un bloc ou l'autre selon la condition. Ce n'est pas du HTML : c'est de la syntaxe Angular, traduite au moment du build. Les anciens tutoriels utilisent `*ngIf`, qui fait la même chose en plus lourd.

Les icônes sont des **SVG écrits à la main** plutôt qu'une bibliothèque d'icônes. Deux raisons : aucune dépendance supplémentaire à installer, et l'attribut `stroke="currentColor"` fait automatiquement prendre au dessin la couleur du texte environnant — donc il s'adapte au thème sans effort.

### 4.4 La logique du composant

Fichier complet — `src/app/header/header.ts` :

```ts
import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/** Les deux seules valeurs possibles pour le theme. */
export type Theme = 'clair' | 'sombre';

/** Nom sous lequel le choix est range dans le stockage du navigateur. */
const CLE_STOCKAGE = 'theme';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  readonly theme = signal<Theme>(this.themeApplique());

  basculerTheme(): void {
    const nouveauTheme: Theme = this.theme() === 'clair' ? 'sombre' : 'clair';

    this.theme.set(nouveauTheme);
    document.documentElement.dataset['theme'] = nouveauTheme;

    try {
      localStorage.setItem(CLE_STOCKAGE, nouveauTheme);
    } catch {
      // Stockage indisponible : le theme fonctionne quand meme.
    }
  }

  private themeApplique(): Theme {
    return document.documentElement.dataset['theme'] === 'sombre' ? 'sombre' : 'clair';
  }
}
```

`type Theme = 'clair' | 'sombre'` est une notion TypeScript très utile : un **type union**. Il déclare que la seule chose acceptable est le texte `'clair'` ou le texte `'sombre'`. Écrire `theme.set('sombre ')` avec une espace en trop devient une erreur signalée dans l'éditeur, au lieu d'un bug silencieux découvert trois semaines plus tard. C'est bien plus précis que de dire « c'est du texte ».

`document.documentElement` désigne la balise `<html>`, et `.dataset['theme']` écrit l'attribut `data-theme` dessus. C'est la ligne qui déclenche le changement de toutes les couleurs.

`private themeApplique()` mérite une explication. Le `private` signifie que cette méthode n'est utilisable qu'à l'intérieur de la classe. Elle lit le thème **déjà posé sur la balise `<html>`** par le script de `index.html` — plutôt que de relire `localStorage`. C'est volontaire : la décision (choix enregistré, ou préférence du système) a déjà été prise au chargement, et la reprendre ici reviendrait à dupliquer cette logique, avec le risque que les deux versions divergent un jour.

### 4.5 Le script anti-éclair

Dans le `<head>` de `src/index.html`, avant tout le reste :

```html
<script>
  (function () {
    var choix = null;

    // localStorage peut lever une erreur (navigation privee, cookies
    // bloques par une politique d'entreprise).
    try {
      choix = localStorage.getItem('theme');
    } catch (e) {
      choix = null;
    }

    // Aucun choix enregistre : on suit la preference du systeme
    // d'exploitation plutot que d'imposer le theme clair.
    if (choix !== 'clair' && choix !== 'sombre') {
      choix = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'sombre' : 'clair';
    }

    document.documentElement.dataset.theme = choix;
  })();
</script>
```

Le test `choix !== 'clair' && choix !== 'sombre'` couvre d'un coup trois situations : rien n'a jamais été enregistré, le stockage a échoué, ou la valeur stockée a été corrompue. Dans les trois cas on retombe sur la préférence du système, ce qui est toujours un choix raisonnable.

Le code est enveloppé dans `(function () { … })()` — une fonction définie et appelée immédiatement. L'intérêt : la variable `choix` n'existe qu'à l'intérieur et disparaît ensuite, au lieu de traîner dans l'espace global de la page où elle pourrait entrer en collision avec autre chose.

### 4.6 Les tests

Deux tests sont ajoutés dans `header.spec.ts` :

```ts
it('bascule du theme clair vers le theme sombre au clic', async () => {
  const bouton = (fixture.nativeElement as HTMLElement).querySelector(
    '.bascule-theme',
  ) as HTMLButtonElement;

  expect(component.theme()).toBe('clair');

  bouton.click();
  await fixture.whenStable();

  expect(component.theme()).toBe('sombre');
  expect(document.documentElement.dataset['theme']).toBe('sombre');
});

it('retient le choix du theme dans le stockage du navigateur', () => {
  component.basculerTheme();
  expect(localStorage.getItem('theme')).toBe('sombre');

  component.basculerTheme();
  expect(localStorage.getItem('theme')).toBe('clair');
});
```

Un détail important dans la préparation des tests :

```ts
beforeEach(async () => {
  document.documentElement.dataset['theme'] = 'clair';
  localStorage.clear();
  …
});
```

`beforeEach` s'exécute avant **chaque** test. Sans cette remise à zéro, le premier test laisserait le thème en sombre et le second démarrerait dans un état imprévisible : il passerait ou échouerait selon l'ordre d'exécution. Un test doit toujours partir d'un état connu — c'est une règle générale, pas une particularité d'Angular.

### 4.7 Les captures d'écran

Le script de captures de l'étape 1 ne savait produire qu'un seul thème. Il a été remplacé par une version Node qui pilote le navigateur plus finement :

```
npm run captures -- etape-02
```

Il produit six images — trois pages × deux thèmes. Pour forcer le thème, il pré-remplit `localStorage` **avant** que la page ne se charge, ce qui revient exactement à simuler un utilisateur ayant déjà fait son choix.

## 5. Livrable attendu

Le thème clair, inchangé par rapport à l'étape 1 — au bouton près :

![Accueil en thème clair](docs/images/etape-02-clair-accueil.png)

Le même écran en thème sombre :

![Accueil en thème sombre](docs/images/etape-02-sombre-accueil.png)

La page Compétitions dans les deux thèmes :

![Compétitions en thème clair](docs/images/etape-02-clair-competitions.png)

![Compétitions en thème sombre](docs/images/etape-02-sombre-competitions.png)

La page À propos dans les deux thèmes :

![À propos en thème clair](docs/images/etape-02-clair-a-propos.png)

![À propos en thème sombre](docs/images/etape-02-sombre-a-propos.png)

Ce qui doit fonctionner :

- le bouton de la barre de navigation bascule entre les deux thèmes ;
- son icône change (lune ↔ soleil) ;
- le choix survit à un rafraîchissement de la page **et** à la fermeture du navigateur ;
- à la première visite, l'application suit la préférence du système d'exploitation ;
- aucun éclair blanc au chargement quand le thème sombre est actif ;
- plus aucun code couleur en dur dans `src/app/` ;
- `npm test` passe — 9 tests.

## 6. Checklist d'auto-vérification

1. Le bleu apparaissait dans quatre fichiers CSS à l'étape 1. Quel était le risque concret, au-delà d'avoir quatre modifications à faire ?
   - *À relire :* § 2.1 « Le problème qu'on vient résoudre »
2. Quand on passe en thème sombre, combien de fichiers CSS de composants sont modifiés ? Pourquoi ?
   - *À relire :* § 2.3 « Deux jeux de valeurs »
3. Pourquoi une variable ordinaire (`theme = 'clair'`) ne suffirait-elle pas, là où un signal fonctionne ?
   - *À relire :* § 2.4 « Le signal : une donnée qui prévient Angular »
4. Pourquoi lit-on un signal avec des parenthèses — `theme()` — et pas simplement `theme` ?
   - *À relire :* § 2.4 « Le signal : une donnée qui prévient Angular »
5. Pourquoi les appels à `localStorage` sont-ils entourés d'un `try / catch` ? Que se passerait-il sans ?
   - *À relire :* § 2.5 « Retenir le choix »
6. Pourquoi le script de thème est-il écrit dans `index.html` plutôt que dans un composant Angular ?
   - *À relire :* § 2.6 « L'éclair blanc, et pourquoi un script dans `index.html` »
7. Du texte blanc sur le bleu passe en thème clair mais échoue en thème sombre. Pourquoi, et comment le projet le corrige-t-il ?
   - *À relire :* § 2.7 « Le contraste, et une erreur qu'il a fallu corriger »
8. Pourquoi la variable s'appelle-t-elle `--couleur-surface` et non `--blanc` ?
   - *À relire :* § 4.1 « Définir la palette »

## 7. Branche d'arrivée

À la fin de cette étape, ton code doit être poussé sur **`etape-02-theme`**.

L'étape suivante partira de cette branche pour créer `etape-03-donnees-mockees`, qui remplacera les blocs HTML répétés de la page Compétitions par une liste de données parcourue automatiquement.

---

# Étape 3 — Données mockées

## 1. Objectifs

À la fin de cette étape, tu dois savoir :

- décrire la forme d'une donnée avec une **interface** TypeScript, et dire à quoi ça sert concrètement ;
- expliquer ce qu'est un **service** et pourquoi les données ne vivent pas dans les composants ;
- demander un service à Angular avec `inject()` plutôt que de le construire toi-même ;
- afficher une liste avec `@for`, et expliquer à quoi sert `track` ;
- gérer proprement les cas particuliers : liste vide, valeur absente, score pas encore connu ;
- expliquer pourquoi on écrit des données simulées au lieu d'attendre le vrai backend.

## 2. Concepts abordés

### 2.1 Le problème qu'on vient résoudre

À la fin de l'étape 1, la page Compétitions contenait quatre blocs HTML quasi identiques, recopiés à la main. C'était volontaire — et il est temps de payer la dette.

Trois défauts, par ordre de gravité croissante :

```mermaid
flowchart TB
    P["<b>Quatre blocs HTML recopies</b>"]
    D1["Ajouter une competition<br/>= dupliquer un bloc de 12 lignes"]
    D2["Corriger une faute presente<br/>dans les quatre = 4 corrections"]
    D3["<b>Les donnees sont prisonnieres<br/>de l'affichage</b><br/><i>la page Matchs ne peut pas<br/>les reutiliser</i>"]

    P --> D1 --> D2 --> D3

    style P fill:#c94040,color:#fff
    style D3 fill:#c94040,color:#fff
    style D1 fill:#f2d4d4,color:#333
    style D2 fill:#f2d4d4,color:#333
```

Le troisième est le vrai problème. Tant que « League of Legends » n'existe que sous forme de texte dans un fichier HTML, **aucune autre page ne peut s'en servir**. La page Matchs a besoin du nom de la compétition de chaque rencontre : sans séparation, il faudrait le recopier encore.

La solution tient en une phrase : **séparer ce qui est affiché de la façon dont c'est affiché.**

```mermaid
flowchart LR
    M["<b>Modeles</b><br/>modeles/competition.ts<br/><i>quelle FORME ont les donnees</i>"]
    S["<b>Services</b><br/>services/competition.ts<br/><i>QUELLES donnees existent</i>"]
    C1["<b>Page Competitions</b><br/><i>COMMENT on les affiche</i>"]
    C2["<b>Page Matchs</b><br/><i>COMMENT on les affiche</i>"]

    M -->|"decrit"| S
    S -->|"fournit"| C1
    S -->|"fournit"| C2

    style M fill:#12203a,color:#fff
    style S fill:#2563b0,color:#fff
    style C1 fill:#eaf0f8,color:#12203a
    style C2 fill:#eaf0f8,color:#12203a
```

### 2.2 L'interface : décrire la forme d'une donnée

Une **interface** TypeScript décrit les champs qu'un objet doit contenir, et de quel type est chacun.

```ts
export type Univers = 'esport' | 'football';

export interface Competition {
  id: string;
  nom: string;
  organisateur: string;
  univers: Univers;
  description: string;
}
```

Le point le plus déroutant au début : **une interface ne produit aucun code**. Elle disparaît entièrement au moment du build — le JavaScript envoyé au navigateur n'en contient aucune trace.

Son rôle est ailleurs. Elle sert pendant l'**écriture** : oublier un champ obligatoire, écrire `nom: 42`, ou taper `competition.non` au lieu de `competition.nom` devient une erreur soulignée dans l'éditeur, avant même d'avoir lancé quoi que ce soit. Sans elle, ces trois fautes produiraient une page silencieusement cassée.

Elle sert aussi de documentation : lire l'interface suffit à savoir ce que contient une compétition.

`Univers` mérite un mot à part. C'est un **type union** : il n'accepte que les deux textes exacts `'esport'` et `'football'`. On aurait pu écrire `univers: string`, mais alors `'footbal'` passerait sans broncher — et la compétition n'apparaîtrait dans aucune des deux sections, sans le moindre message d'erreur. Un bug particulièrement pénible, parce que rien ne signale qu'il existe.

Le modèle `Match` introduit une autre notion :

```ts
export interface Match {
  competitionId: string;
  domicile: Equipe;
  exterieur: Equipe;
  scoreDomicile: number | null;
  scoreExterieur: number | null;
  date: Date;
  statut: StatutMatch;
}
```

`number | null` dit : « un nombre, **ou** rien du tout ». C'est la façon honnête de représenter le score d'un match qui n'a pas encore commencé. Écrire `scoreDomicile: number` obligerait à inventer une valeur — `0` par exemple — et l'affichage montrerait alors un match à venir avec un score de 0-0, ce qui est faux.

Remarque aussi `competitionId: string` plutôt qu'un objet `Competition` complet. Un match ne contient que l'**identifiant** de sa compétition. C'est exactement ainsi que fonctionnera la base de données à l'étape 6 : les tables se référencent par identifiant, pas en s'imbriquant. Adopter cette forme dès maintenant évitera une refonte plus tard.

### 2.3 Le service : où vivent les données

Un **service** est une classe qui regroupe des données et de la logique, en dehors de tout composant. La règle de partage des rôles :

| Rôle | Qui s'en occupe |
|---|---|
| **Quelles** données existent | le service |
| **Comment** elles sont affichées | le composant |

```ts
@Service()
export class CompetitionService {
  private readonly competitions: Competition[] = [ /* … */ ];

  listerToutes(): Competition[] {
    return this.competitions;
  }

  listerParUnivers(univers: Univers): Competition[] {
    return this.competitions.filter((competition) => competition.univers === univers);
  }
}
```

`@Service()` est le décorateur qui signale à Angular « cette classe est un service ». Attention en cherchant de l'aide en ligne : c'est une écriture récente, arrivée avec Angular 22. La quasi-totalité des tutoriels montre encore `@Injectable({ providedIn: 'root' })`, qui fait exactement la même chose.

Le mot `private` devant `competitions` est important. Il signifie que le tableau n'est accessible **que depuis l'intérieur de la classe**. Les composants ne peuvent pas y toucher directement : ils passent obligatoirement par les méthodes. Cette discipline paie à l'étape 5, quand les données ne seront plus un tableau mais le résultat d'un appel réseau — seul l'intérieur du service changera.

### 2.4 L'injection de dépendances

Un composant qui a besoin d'un service ne le construit pas. Il le **demande** :

```ts
export class Competitions {
  private readonly competitionService = inject(CompetitionService);

  readonly competitionsEsport = this.competitionService.listerParUnivers('esport');
  readonly competitionsFootball = this.competitionService.listerParUnivers('football');
}
```

Nulle part on n'écrit `new CompetitionService()`. On appelle `inject()`, et Angular fournit l'instance. Ce mécanisme s'appelle l'**injection de dépendances**.

```mermaid
sequenceDiagram
    participant A as Angular
    participant C as Page Competitions
    participant M as Page Matchs
    participant S as CompetitionService

    Note over A: au demarrage de l'application
    C->>A: inject(CompetitionService)
    A->>S: cree l'instance (la premiere fois)
    A-->>C: voici le service

    Note over M: plus tard, sur une autre page
    M->>A: inject(CompetitionService)
    A-->>M: voici LE MEME service
    Note over A,S: une seule instance partagee<br/>par toute l'application
```

Deux bénéfices concrets.

**Une seule instance pour toute l'application** — un *singleton*. Les deux pages voient exactement les mêmes données. Si chacune construisait son propre service, on aurait deux copies indépendantes, et un ajout dans l'une n'apparaîtrait pas dans l'autre.

**Le remplacement devient possible.** Dans un test, on peut demander à Angular de fournir une version de remplacement du service, avec des données fabriquées pour l'occasion. C'est impossible si le composant construit lui-même sa dépendance — on serait coincé avec la vraie.

### 2.5 La boucle `@for`

Côté gabarit, le bloc `@for` répète un morceau de HTML pour chaque élément d'une liste :

```html
@for (competition of competitionsEsport; track competition.id) {
  <article class="carte">
    <h3>{{ competition.nom }}</h3>
    <p class="carte-editeur">{{ competition.organisateur }}</p>
  </article>
} @empty {
  <p class="vide">Aucune compétition eSport suivie pour le moment.</p>
}
```

Quatre blocs deviennent un seul. Ajouter une cinquième compétition ne demande plus de toucher au HTML — une ligne de données suffit.

**`track` est obligatoire**, et ce n'est pas une contrainte arbitraire. Il indique à Angular ce qui identifie chaque élément de façon unique.

Sans repère, quand une liste change, Angular ne peut pas savoir si un élément a été déplacé, modifié ou remplacé : il détruirait et reconstruirait tout. Avec `track competition.id`, il sait exactement quel élément est lequel, et ne touche qu'à ce qui a réellement bougé. Sur une liste de matchs qui se rafraîchit toutes les trente secondes, la différence est très visible.

**`@empty`** couvre le cas de la liste vide. Sans lui, une liste vide ne produit rien — une zone blanche, sans explication, que l'utilisateur interprète comme un bug. Prévoir ce cas dès l'écriture coûte deux lignes ; le découvrir en production coûte beaucoup plus.

### 2.6 Les pipes

Les dates sont stockées comme de vrais objets `Date`, pas comme du texte. C'est indispensable pour pouvoir les **comparer** et **trier** les matchs par ordre chronologique.

Mais un objet `Date` affiché tel quel donne `Mon Sep 14 2026 17:00:00 GMT+0200 (heure d'été d'Europe centrale)` — illisible.

Un **pipe** met la valeur en forme au moment de l'affichage, et seulement là :

```html
{{ match.date | date: 'dd/MM/yyyy' }}     <!-- 14/09/2026 -->
{{ match.date | date: 'HH:mm' }}          <!-- 17:00 -->
```

La barre verticale `|` se lit « passe cette valeur à travers ». Le principe à retenir : **la donnée reste brute dans le code, et n'est transformée en texte qu'au dernier moment, pour l'écran.** Formater la date dès le stockage rendrait le tri impossible.

## 3. Prérequis

Pars de la branche **`etape-02-theme`**.

```
git checkout etape-02-theme
git checkout -b etape-03-donnees-mockees
```

## 4. Déroulé détaillé

### 4.1 Créer les modèles

Trois fichiers dans un nouveau dossier `src/app/modeles/`. Ils ne contiennent que des descriptions de formes — aucune donnée, aucune logique.

`modeles/equipe.ts` :

```ts
export interface Equipe {
  id: string;
  nom: string;
  /** Abreviation de trois lettres affichee dans les listes : « PSG », « KC ». */
  trigramme: string;
}
```

`modeles/competition.ts` et `modeles/match.ts` suivent le même principe (voir le code en 2.2).

Le dossier s'appelle `modeles` et non `models` : le projet est en français, autant s'y tenir partout. La cohérence compte plus que la langue choisie.

### 4.2 Créer les services

La CLI génère la structure :

```
ng generate service services/competition
ng generate service services/match
```

Puis on remplit. Voici `services/competition.ts`, en entier :

```ts
import { Service } from '@angular/core';
import { Competition, Univers } from '../modeles/competition';

@Service()
export class CompetitionService {
  private readonly competitions: Competition[] = [
    {
      id: 'lol',
      nom: 'League of Legends',
      organisateur: 'Riot Games',
      univers: 'esport',
      description: "Jeu d'arène de bataille en ligne à cinq contre cinq. …",
    },
    // … trois autres competitions
  ];

  listerToutes(): Competition[] {
    return this.competitions;
  }

  listerParUnivers(univers: Univers): Competition[] {
    return this.competitions.filter((competition) => competition.univers === univers);
  }

  trouverParId(id: string): Competition | undefined {
    return this.competitions.find((competition) => competition.id === id);
  }
}
```

`filter` et `find` sont deux méthodes standard des tableaux JavaScript, pas des inventions d'Angular. `filter` garde **tous** les éléments qui satisfont une condition et renvoie un nouveau tableau ; `find` renvoie **le premier** qui convient, ou `undefined` s'il n'y en a aucun.

C'est ce `undefined` qui explique le type de retour `Competition | undefined`. TypeScript force alors l'appelant à prévoir le cas — on y revient en 4.4.

Dans `services/match.ts`, les équipes sont déclarées à part avant d'être utilisées :

```ts
const KC: Equipe = { id: 'kc', nom: 'Karmine Corp', trigramme: 'KC' };
const G2: Equipe = { id: 'g2', nom: 'G2 Esports', trigramme: 'G2' };
// …

private readonly matchs: Match[] = [
  {
    id: 'm1',
    competitionId: 'lol',
    domicile: KC,
    exterieur: G2,
    scoreDomicile: 1,
    scoreExterieur: 0,
    date: new Date('2026-09-14T17:00:00'),
    statut: 'en-direct',
  },
  // …
];
```

Écrire « Karmine Corp » une seule fois, puis réutiliser `KC`, n'est pas qu'une économie de frappe : c'est une garantie. Recopié à la main dans chaque match, le nom finirait par diverger — « Karmine Corp » ici, « Karmine corp » là — et le programme y verrait deux équipes différentes.

Le service expose une méthode qui filtre **et** trie :

```ts
listerParStatut(statut: StatutMatch): Match[] {
  return this.matchs
    .filter((match) => match.statut === statut)
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}
```

`.getTime()` convertit une date en nombre de millisecondes, ce qui permet de les soustraire. `sort` attend une fonction qui renvoie un nombre négatif, nul ou positif selon l'ordre souhaité — ici, du plus ancien au plus récent.

### 4.3 Brancher la page Compétitions

Le composant se réduit à trois lignes utiles :

```ts
import { Component, inject } from '@angular/core';
import { CompetitionService } from '../../services/competition';

@Component({
  imports: [],
  selector: 'app-competitions',
  styleUrl: './competitions.css',
  templateUrl: './competitions.html',
})
export class Competitions {
  private readonly competitionService = inject(CompetitionService);

  readonly competitionsEsport = this.competitionService.listerParUnivers('esport');
  readonly competitionsFootball = this.competitionService.listerParUnivers('football');
}
```

Et le gabarit perd les trois quarts de son volume (voir 2.5).

Un détail de style intéressant. À l'étape 1, chaque carte avait une classe CSS différente pour son bandeau coloré : `carte-bandeau--lol`, `carte-bandeau--valorant`… Avec une boucle, ça ne tient plus — le HTML est écrit une seule fois pour toutes les compétitions.

La solution réutilise un mécanisme déjà vu à l'étape 2, celui du `data-theme` :

```html
<div class="carte-bandeau" [attr.data-competition]="competition.id"></div>
```

```css
.carte-bandeau[data-competition='lol'] {
  background-color: var(--couleur-primaire);
}

.carte-bandeau[data-competition='valorant'] {
  background-color: var(--couleur-accent);
}
```

L'identifiant de la donnée est posé sur l'élément, et le CSS réagit à sa valeur — exactement comme le thème.

### 4.4 La page Matchs

C'est la nouveauté de l'étape. Elle utilise **deux** services à la fois :

```ts
export class Matchs {
  private readonly matchService = inject(MatchService);
  private readonly competitionService = inject(CompetitionService);

  readonly matchsEnDirect = this.matchService.listerParStatut('en-direct');
  readonly matchsAVenir = this.matchService.listerParStatut('a-venir');
  readonly matchsTermines = this.matchService.listerParStatut('termine');

  nomCompetition(competitionId: string): string {
    return this.competitionService.trouverParId(competitionId)?.nom ?? 'Compétition inconnue';
  }
}
```

La méthode `nomCompetition` mérite qu'on s'y arrête. Un match ne stocke que `competitionId: 'lol'` ; il faut retrouver le nom lisible. Mais `trouverParId` peut ne rien trouver, et TypeScript **refuse** qu'on ignore ce cas.

Deux opérateurs s'en chargent :

- `?.` — « si ce qui précède existe, continue ; sinon arrête-toi et renvoie `undefined` ». Sans lui, un identifiant inconnu ferait planter la page.
- `??` — « si la valeur de gauche est absente, prends celle de droite ».

Écrit sans eux, ça donnerait :

```ts
const competition = this.competitionService.trouverParId(competitionId);
if (competition === undefined) {
  return 'Compétition inconnue';
}
return competition.nom;
```

Cinq lignes pour la même chose. Les deux opérateurs ne sont pas de la coquetterie : ils rendent le traitement du cas absent si court qu'on ne se dit plus « je le ferai plus tard ».

Le gabarit affiche trois sections. La première n'apparaît que s'il y a effectivement des matchs en cours :

```html
@if (matchsEnDirect.length > 0) {
  <section class="bloc">
    <h2 class="section-titre">
      <span class="pastille-direct" aria-hidden="true"></span>
      En direct
    </h2>
    …
  </section>
}
```

Sans ce `@if`, un titre « En direct » resterait affiché au-dessus du vide les trois quarts du temps.

`aria-hidden="true"` sur la pastille rouge indique aux lecteurs d'écran de l'ignorer : c'est une décoration, et l'information « en direct » est déjà donnée par le texte juste à côté. Sans cet attribut, la personne entendrait une annonce parasite.

C'est enfin ici que le **rouge de la charte** prend tout son sens. Le cadre du projet le réserve à ce qui doit attirer l'œil — un match en cours est précisément ce cas :

```css
.pastille-direct {
  background-color: var(--couleur-accent);
  animation: pulsation 1.8s ease-in-out infinite;
}

@keyframes pulsation {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.35; }
}

/* Respecte le reglage systeme des personnes sensibles au mouvement. */
@media (prefers-reduced-motion: reduce) {
  .pastille-direct {
    animation: none;
  }
}
```

`prefers-reduced-motion` fonctionne comme le `prefers-color-scheme` de l'étape 2 : c'est un réglage du système d'exploitation. Certaines personnes — troubles vestibulaires, migraines, épilepsie — le règlent sur « réduire ». Une animation qui l'ignore peut réellement les rendre malades. Trois lignes suffisent à en tenir compte.

### 4.5 Les tests

Les services se testent sans interface, ce qui les rend particulièrement simples à vérifier :

```ts
it('separe les competitions par univers', () => {
  const esport = service.listerParUnivers('esport');
  const football = service.listerParUnivers('football');

  expect(esport.length).toBe(2);
  expect(football.length).toBe(2);
  expect(esport.every((competition) => competition.univers === 'esport')).toBe(true);
});

it('renvoie undefined pour un identifiant inconnu', () => {
  expect(service.trouverParId('echecs')).toBeUndefined();
});
```

Le second test vérifie un **cas d'échec**, et c'est au moins aussi important que le premier. Un test qui ne contrôle que le cas où tout va bien laisse passer exactement les bugs qui arrivent en vrai.

Côté composants, on vérifie que la boucle produit bien ce qu'on attend :

```ts
it('affiche une carte par competition', () => {
  const cartes = (fixture.nativeElement as HTMLElement).querySelectorAll('.carte');
  expect(cartes.length).toBe(4);
});
```

L'étape se termine avec **25 tests** répartis sur 8 fichiers.

## 5. Livrable attendu

La nouvelle page Matchs, avec ses trois sections :

![Page Matchs en thème clair](docs/images/etape-03-clair-matchs.png)

La même en thème sombre — le rouge du direct reste lisible sans agresser l'œil :

![Page Matchs en thème sombre](docs/images/etape-03-sombre-matchs.png)

La page Compétitions, visuellement identique à l'étape 2, mais dont le HTML a fondu :

![Page Compétitions en thème clair](docs/images/etape-03-clair-competitions.png)

Ce qui doit fonctionner :

- la barre de navigation compte quatre onglets, dont le nouveau « Matchs » ;
- les compétitions et les matchs proviennent de services, plus du HTML ;
- les matchs en cours sont signalés en rouge, avec une pastille clignotante ;
- les matchs à venir affichent une date et une heure, pas un score ;
- les deux thèmes fonctionnent toujours sur toutes les pages ;
- `npm test` passe — 25 tests.

## 6. Checklist d'auto-vérification

1. Une interface TypeScript ne produit aucun code une fois l'application construite. À quoi sert-elle, alors ?
   - *À relire :* § 2.2 « L'interface : décrire la forme d'une donnée »
2. Pourquoi `univers: Univers` plutôt que `univers: string` ? Quel bug précis le premier évite-t-il ?
   - *À relire :* § 2.2 « L'interface : décrire la forme d'une donnée » (type `Univers`)
3. Pourquoi le score est-il `number | null` et non `number` initialisé à zéro ?
   - *À relire :* § 2.2 « L'interface : décrire la forme d'une donnée » (modèle `Match`)
4. Un match stocke `competitionId: 'lol'` et non l'objet `Competition` entier. Pourquoi ce choix, et avec quelle étape future est-il cohérent ?
   - *À relire :* § 2.2 « L'interface : décrire la forme d'une donnée » (fin de la partie)
5. Que se passerait-il si chaque composant faisait `new CompetitionService()` au lieu d'utiliser `inject()` ?
   - *À relire :* § 2.4 « L'injection de dépendances »
6. À quoi sert `track` dans un bloc `@for` ? Que ferait Angular sans cette information ?
   - *À relire :* § 2.5 « La boucle `@for` »
7. Pourquoi stocker les dates comme objets `Date` plutôt que comme texte déjà formaté ?
   - *À relire :* § 2.6 « Les pipes »
8. Que signifie `?.` et que signifie `??` dans `trouverParId(id)?.nom ?? 'Compétition inconnue'` ?
   - *À relire :* § 4.4 « La page Matchs »

## 7. Branche d'arrivée

À la fin de cette étape, ton code doit être poussé sur **`etape-03-donnees-mockees`**.

L'étape suivante partira de cette branche pour créer `etape-04-backend-bases`, qui construira le serveur Express destiné à fournir ces données pour de vrai.

---

# Étape 4 — Backend Express : les bases

## 1. Objectifs

À la fin de cette étape, tu dois savoir :

- expliquer ce qu'est un **serveur** et ce qui le distingue du code qui tourne dans le navigateur ;
- décrire le trajet complet d'une requête HTTP, de son arrivée jusqu'à la réponse ;
- distinguer les rôles d'une **route**, d'un **contrôleur** et d'un **middleware** ;
- renvoyer le bon **code de statut** selon la situation, et dire pourquoi ça compte ;
- tester une API sans frontend, avec Thunder Client ou `curl` ;
- expliquer pourquoi les données venues du client ne doivent jamais être utilisées telles quelles.

## 2. Concepts abordés

### 2.1 Ce qu'on construit, et ce qui ne change pas

Attention à une attente naturelle mais fausse : **à la fin de cette étape, l'application ne changera pas d'un pixel.**

On construit un deuxième programme, indépendant, qui tourne à côté du premier. Les deux ne se parlent pas encore — c'est le sujet de l'étape 5.

```mermaid
flowchart TB
    subgraph nav ["Navigateur — port 4200"]
        F["<b>Frontend Angular</b><br/>affiche des donnees<br/><i>simulees, etape 3</i>"]
    end

    subgraph srv ["Serveur — port 3000"]
        B["<b>Backend Express</b><br/>sert des donnees<br/><i>simulees aussi, etape 4</i>"]
    end

    F -.->|"PAS ENCORE BRANCHES<br/>(etape 5)"| B

    style F fill:#2563b0,color:#fff
    style B fill:#2563b0,color:#fff
    linkStyle 0 stroke:#c94040,stroke-width:2px,stroke-dasharray: 6 4
```

Ce découpage est volontaire. Brancher les deux en même temps qu'on découvre Express mélangerait deux sources d'erreurs : « mon serveur répond-il mal ? » et « mon frontend appelle-t-il mal ? ». En les séparant, chaque problème est diagnosticable seul.

D'où l'importance de **Thunder Client** : il permet d'interroger le backend directement, sans frontend. Si le serveur répond correctement là, on sait que le problème vient d'ailleurs.

### 2.2 Qu'est-ce qu'un serveur, concrètement

Le mot intimide. Techniquement, un serveur est simplement **un programme qui attend des demandes sur un port et y répond**. Pas de matériel spécial, pas de salle climatisée : `npm run dev` lance un serveur sur ta machine.

La différence avec le frontend est ailleurs, et elle est fondamentale :

| | Frontend | Backend |
|---|---|---|
| S'exécute | dans le navigateur de l'utilisateur | sur une machine que tu contrôles |
| Code visible par l'utilisateur | **oui, entièrement** | non |
| Peut détenir des secrets | **jamais** | oui |
| Nombre d'exemplaires | un par visiteur | un seul, partagé |

La deuxième ligne est celle qui justifie toute l'architecture. Tout ce qui part vers le navigateur est lisible : n'importe qui peut ouvrir les outils de développement et lire le code. Une clé d'API placée là est publique.

C'est pour ça que les clés Riot Games et football-data.org vivront dans le backend, aux étapes 11 et 12. Le frontend demandera « donne-moi les matchs » ; le backend, lui, saura avec quelle clé aller les chercher.

### 2.3 HTTP : la conversation client/serveur

Les deux programmes se parlent avec **HTTP**, le protocole du web. Le principe tient en deux temps : le client envoie une **requête**, le serveur renvoie une **réponse**.

Une requête, c'est une **méthode** (l'intention) et une **adresse** (la cible) :

| Méthode | Intention |
|---|---|
| `GET` | Lire, sans rien modifier |
| `POST` | Créer |
| `PUT` / `PATCH` | Modifier |
| `DELETE` | Supprimer |

Cette étape n'utilise que `GET`. Les autres arrivent à l'étape 7.

Une réponse contient un **code de statut** — un nombre à trois chiffres qui dit comment ça s'est passé — et généralement un contenu.

| Famille | Sens | Exemples |
|---|---|---|
| `2xx` | Succès | `200` OK |
| `4xx` | Le **client** s'est trompé | `400` invalide, `404` introuvable |
| `5xx` | Le **serveur** a échoué | `500` erreur interne |

La distinction `4xx` / `5xx` est celle qui compte : elle dit de quel côté chercher le problème.

Et renvoyer le bon code n'est pas une politesse. Une API qui répond `200` avec un corps vide quand elle n'a rien trouvé **ment à son client** : celui-ci croit que tout va bien, et affiche une page vide sans explication. C'est le genre de bug qu'on passe des heures à chercher.

Dernier point, essentiel pour la suite : **HTTP est sans mémoire.** Chaque requête est traitée indépendamment, et le serveur ne se souvient de rien entre deux appels. C'est exactement le problème que devra résoudre l'authentification de l'étape 8.

### 2.4 Le trajet d'une requête

Voici ce qui se passe entre le moment où une requête arrive et celui où la réponse repart :

```mermaid
sequenceDiagram
    participant C as Client<br/>(Thunder Client)
    participant E as Express
    participant R as Routeur
    participant K as Controleur
    participant D as Donnees

    C->>E: GET /api/competitions/lol
    E->>E: middleware express.json()
    E->>R: le chemin commence par /api
    R->>R: /competitions -> routeurCompetitions
    R->>K: /:id -> obtenirCompetition
    K->>D: chercher l'id « lol »
    D-->>K: la competition
    K-->>C: 200 + JSON

    Note over E,K: si aucune route ne correspond,<br/>la requete poursuit jusqu'au<br/>middleware « routeIntrouvable » -> 404
```

Chaque étage a une responsabilité unique, et c'est ce découpage qui rend le code maintenable :

```mermaid
flowchart LR
    A["<b>routes/</b><br/><i>QUELLE adresse</i>"]
    B["<b>controleurs/</b><br/><i>QUOI repondre</i>"]
    C["<b>donnees/</b><br/><i>OU sont les donnees</i>"]

    A --> B --> C

    style A fill:#12203a,color:#fff
    style B fill:#2563b0,color:#fff
    style C fill:#3a7bd0,color:#fff
```

L'intérêt est très concret. Changer `/api/competitions` en `/api/v2/competitions` ne touche qu'au dossier `routes/`. Remplacer les données simulées par PostgreSQL à l'étape 6 ne touchera qu'au dossier `donnees/`. Sans ce découpage, chaque changement se propagerait partout.

### 2.5 Les middlewares, et pourquoi leur ordre est piégeux

Un **middleware** est une fonction placée sur le trajet de la requête. Elle peut l'inspecter, la modifier, l'arrêter, ou la laisser continuer.

```mermaid
flowchart LR
    R["Requete"] --> M1["express.json()<br/><i>lit le corps JSON</i>"]
    M1 --> M2["routeur /api<br/><i>les vraies routes</i>"]
    M2 --> M3["routeIntrouvable<br/><i>404</i>"]
    M3 --> M4["gestionnaireErreurs<br/><i>500</i>"]

    M2 -.->|"si une route repond"| REP["Reponse"]
    M3 -.-> REP
    M4 -.-> REP

    style M1 fill:#eaf0f8,color:#12203a
    style M2 fill:#2563b0,color:#fff
    style M3 fill:#d98030,color:#fff
    style M4 fill:#c94040,color:#fff
```

**L'ordre de déclaration est l'ordre d'exécution.** C'est l'erreur la plus fréquente avec Express : un middleware « route introuvable » déclaré *avant* les routes répondrait `404` à absolument tout, y compris aux adresses valides — et le message d'erreur ne donnerait aucun indice sur la cause.

Le gestionnaire d'erreurs a une particularité à retenir : Express le reconnaît **au fait qu'il prend quatre paramètres**, le premier étant l'erreur. Avec trois paramètres, il serait traité comme un middleware ordinaire et ne recevrait jamais les erreurs. C'est une convention du framework, invisible dans le code, qui déroute la première fois.

### 2.6 Ne jamais faire confiance au client

Principe de sécurité fondamental, à intégrer dès maintenant : **tout ce qui vient du client est suspect.**

Pas parce que l'utilisateur est malveillant — le plus souvent il ne l'est pas — mais parce qu'une requête HTTP peut être fabriquée à la main. Rien n'oblige à passer par l'interface qu'on a prévue.

Prenons le filtre `?statut=`. Le code naïf serait :

```ts
// NE FAIS PAS CA
const statut = requete.query['statut'];
reponse.json(matchs.filter((match) => match.statut === statut));
```

Trois façons de le mettre en défaut :

- `?statut=nimportequoi` → renvoie une liste vide. Le client croit qu'aucun match ne correspond, alors qu'il a simplement fait une faute de frappe.
- `?statut=a&statut=b` → Express fournit alors un **tableau**, pas une chaîne. La comparaison échoue silencieusement.
- rien du tout → `undefined`, comparé à chaque statut, liste vide là aussi.

La version du projet valide explicitement :

```ts
const STATUTS_VALIDES: StatutMatch[] = ['a-venir', 'en-direct', 'termine'];

function estStatutValide(valeur: unknown): valeur is StatutMatch {
  return typeof valeur === 'string' && STATUTS_VALIDES.includes(valeur as StatutMatch);
}
```

Le type de retour `valeur is StatutMatch` est une **garde de type**. Il ne dit pas seulement « cette fonction renvoie un booléen » : il dit « si elle renvoie `true`, alors la valeur **est** un `StatutMatch` ». Après un `if (estStatutValide(statut))`, TypeScript traite la valeur comme un statut valide dans tout le bloc.

C'est le mécanisme qui permet de faire entrer proprement des données venues de l'extérieur dans le monde typé — au lieu de mentir au compilateur avec un `as`.

## 3. Prérequis

Pars de la branche **`etape-03-donnees-mockees`**.

```
git checkout etape-03-donnees-mockees
git checkout -b etape-04-backend-bases
```

## 4. Déroulé détaillé

### 4.1 Créer le projet backend

Depuis la racine du dépôt :

```
mkdir backend
cd backend
npm init -y
npm install express dotenv
npm install --save-dev typescript tsx @types/express @types/node
```

Ce que chaque paquet apporte :

| Paquet | Rôle |
|---|---|
| `express` | Le framework web : routes, requêtes, réponses |
| `dotenv` | Charge le fichier `.env` dans les variables d'environnement |
| `typescript` | Le compilateur |
| `tsx` | Exécute directement du TypeScript, sans étape de compilation manuelle |
| `@types/express`, `@types/node` | Les **descriptions de types** d'Express et de Node |

Les deux derniers méritent un mot. Express et Node sont écrits en JavaScript, qui n'a pas de types. Les paquets `@types/…` fournissent séparément la description de ce que ces bibliothèques attendent et renvoient. Sans eux, TypeScript ne saurait rien de `requete` ni de `reponse`, et l'autocomplétion serait muette.

`tsx` évite une gymnastique pénible : sans lui, il faudrait compiler le TypeScript en JavaScript avant chaque exécution. Avec lui, `tsx watch src/server.ts` relance le serveur à chaque sauvegarde.

Les scripts, dans `package.json` :

```json
"scripts": {
  "dev": "tsx watch src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "verifier": "tsc --noEmit"
}
```

`verifier` mérite une explication. `tsx` **ne vérifie pas les types** — il les retire simplement pour aller vite. C'est excellent pour la vitesse de développement, mais ça veut dire qu'une erreur de type ne bloque pas l'exécution. `tsc --noEmit` fait la vérification complète sans rien produire. À lancer avant chaque commit.

### 4.2 Configurer TypeScript

`tsconfig.json` règle le comportement du compilateur. Les options qui comptent :

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "rootDir": "./src",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "sourceMap": true
  },
  "include": ["src/**/*"]
}
```

`"strict": true` est la plus importante. Elle active toutes les vérifications de TypeScript — notamment l'obligation de traiter les valeurs potentiellement absentes. C'est elle qui a forcé le `if (competition === undefined)` du contrôleur. Sans elle, on découvrirait le problème en production.

`"sourceMap": true` relie le code compilé au code source : une erreur affichée pointe vers le fichier `.ts` d'origine, pas vers le `.js` généré, qui est illisible.

> **Piège rencontré.** La configuration écrite au départ contenait `"moduleResolution": "node"`, la valeur qu'on trouve dans presque tous les tutoriels. TypeScript 7 l'a supprimée, et la compilation échouait avec `error TS5108`. La valeur actuelle est `"nodenext"`, qui laisse TypeScript suivre les règles de Node. C'est un bon exemple de ce qui arrive en suivant un tutoriel un peu ancien — et une bonne raison de lire les messages d'erreur, qui disaient ici exactement quoi faire.

### 4.3 La structure des fichiers

```
backend/
├── package.json
├── tsconfig.json
├── .gitignore
└── src/
    ├── server.ts              <- demarre le serveur
    ├── app.ts                 <- construit l'application
    ├── modeles/               <- la FORME des donnees
    │   ├── competition.ts
    │   ├── equipe.ts
    │   └── match.ts
    ├── donnees/               <- les donnees simulees
    │   ├── competitions.ts
    │   └── matchs.ts
    ├── routes/                <- QUELLE adresse
    │   ├── index.ts
    │   ├── competitions.routes.ts
    │   └── matchs.routes.ts
    ├── controleurs/           <- QUOI repondre
    │   ├── competitions.controleur.ts
    │   └── matchs.controleur.ts
    └── middlewares/           <- filets de securite
        └── erreurs.ts
```

Les modèles sont **volontairement dupliqués** depuis le frontend. Les deux projets sont indépendants, chacun avec ses dépendances. Les mettre en commun demanderait une mise en place (monorepo, paquet partagé) qui n'apporterait rien ici — et masquerait le point important : **le contrat entre les deux, c'est le format JSON échangé sur le réseau**, pas le partage d'un fichier.

Une différence entre les deux versions du modèle `Match` :

```ts
// frontend : un objet Date, comparable et triable
date: Date;

// backend : une chaine ISO
date: string;
```

Ce n'est pas une incohérence. **JSON ne connaît pas les dates** — il n'a que des textes, des nombres, des booléens, des listes, des objets et `null`. Une date qui traverse le réseau devient forcément du texte. Autant la stocker déjà sous cette forme côté serveur.

### 4.4 Démarrage et construction séparés

Deux fichiers, deux responsabilités.

`src/app.ts` **construit** l'application, sans la démarrer :

```ts
import express, { Express } from 'express';
import { routeurApi } from './routes';
import { gestionnaireErreurs, routeIntrouvable } from './middlewares/erreurs';

export function creerApplication(): Express {
  const app = express();

  app.use(express.json());
  app.use('/api', routeurApi);

  // L'ORDRE COMPTE : declares en dernier, donc consultes en dernier.
  app.use(routeIntrouvable);
  app.use(gestionnaireErreurs);

  return app;
}
```

`src/server.ts` la **démarre** :

```ts
import 'dotenv/config';
import { creerApplication } from './app';

const PORT = Number(process.env['PORT']) || 3000;

const app = creerApplication();

app.listen(PORT, () => {
  console.log(`API démarrée sur http://localhost:${PORT}`);
});
```

Pourquoi séparer ? Parce qu'à l'étape 14, on voudra créer une application dans un test, lui envoyer des requêtes et vérifier ses réponses — **sans jamais ouvrir de port réseau**. C'est impossible si construire et démarrer sont la même opération.

Trois détails dans `server.ts`.

`import 'dotenv/config'` doit venir **en premier**. Il charge le fichier `.env` dans `process.env` ; tout code qui lirait une variable avant cette ligne ne trouverait rien.

`Number(process.env['PORT'])` fait une conversion nécessaire : `process.env` ne contient que du **texte**. La variable vaut `'3000'`, pas `3000`.

`|| 3000` rattrape le cas où la variable est absente ou illisible — `Number('abc')` donne `NaN`, considéré comme faux. Cette souplesse est indispensable au déploiement de l'étape 15 : c'est l'hébergeur qui imposera le port.

### 4.5 Routes et contrôleurs

Le fichier de routes ne contient **aucune logique** — uniquement des associations :

```ts
import { Router } from 'express';
import { listerCompetitions, obtenirCompetition } from '../controleurs/competitions.controleur';

export const routeurCompetitions = Router();

routeurCompetitions.get('/', listerCompetitions);
routeurCompetitions.get('/:id', obtenirCompetition);
```

Les chemins sont **relatifs**. Ce routeur est branché sur `/api/competitions` dans `routes/index.ts`, donc `'/'` devient en réalité `/api/competitions`. Le préfixe se change ainsi à un seul endroit.

Les deux-points marquent un **paramètre** : `/:id` accepte n'importe quelle valeur, récupérée ensuite par `requete.params['id']`.

Le contrôleur, lui, ne sait pas à quelle adresse il est branché :

```ts
export function obtenirCompetition(requete: Request, reponse: Response): void {
  const competition = competitions.find(
    (candidate) => candidate.id === requete.params['id'],
  );

  if (competition === undefined) {
    reponse.status(404).json({
      erreur: 'Compétition introuvable',
      id: requete.params['id'],
    });
    return;
  }

  reponse.json(competition);
}
```

Le `return` après le `404` est indispensable. Sans lui, l'exécution continuerait et tenterait d'envoyer une **seconde** réponse — ce qui provoque une erreur, car les en-têtes HTTP ont déjà été transmis.

`reponse.json(...)` fait deux choses d'un coup : convertir l'objet JavaScript en texte JSON, et positionner l'en-tête `Content-Type: application/json` pour que le client sache l'interpréter.

### 4.6 Tester l'API

Le serveur démarre avec :

```
cd backend
npm run dev
```

Il écoute sur **http://localhost:3000**. Rien ne s'affiche dans un navigateur à la racine — c'est normal, il n'y a pas de page, seulement des adresses en `/api`.

Deux façons de l'interroger.

**Thunder Client**, dans VS Code : l'icône éclair dans la barre latérale, puis *New Request*, méthode `GET`, adresse `http://localhost:3000/api/competitions`. L'avantage est de garder les requêtes sous la main et de voir la réponse mise en forme.

**`curl`**, dans le terminal, pratique pour vérifier vite :

```
curl http://localhost:3000/api/sante
```

Voici les réponses réelles de l'API, y compris les cas d'erreur — c'est là que le travail de l'étape se voit le mieux :

```
GET /api/sante
{"statut":"ok","horodatage":"2026-09-14T19:06:14.270Z"}

GET /api/competitions?univers=esport
-> League of Legends, Valorant

GET /api/competitions/ligue1
{"id":"ligue1","nom":"Ligue 1","organisateur":"Championnat de France", …}

GET /api/competitions/echecs                    [HTTP 404]
{"erreur":"Compétition introuvable","id":"echecs"}

GET /api/matchs?statut=en-direct
-> 2 matchs : KC vs G2, PSG vs OM

GET /api/matchs?statut=nimportequoi             [HTTP 400]
{"erreur":"Statut inconnu","recu":"nimportequoi","attendu":["a-venir","en-direct","termine"]}

GET /api/nimportequoi                           [HTTP 404]
{"erreur":"Route introuvable","chemin":"/api/nimportequoi"}
```

Les trois dernières lignes sont les plus importantes à vérifier. Une API qui ne gère que les cas où tout va bien est une API qui n'est pas finie — et les erreurs qu'elle renvoie mal seront exactement celles qui feront perdre du temps à l'étape 5.

### 4.7 La route de santé

`GET /api/sante` ne sert à rien pour l'application. Elle est pourtant la première à écrire.

Son utilité est de **répondre à une question simple** : est-ce que le serveur est vivant ? Quand rien ne marche, savoir si le problème vient du serveur lui-même ou de ce qu'on lui demande fait gagner beaucoup de temps.

Les hébergeurs s'en servent aussi pour surveiller une application et la redémarrer si elle ne répond plus. On la retrouvera à l'étape 15.

## 5. Livrable attendu

Il n'y a **pas de capture d'écran** pour cette étape, et c'est normal : l'interface n'a pas changé d'un pixel. Le livrable est un serveur qui répond correctement.

- `cd backend && npm run dev` démarre le serveur sur le port 3000 ;
- `npm run verifier` ne signale aucune erreur de type ;
- les quatre endpoints répondent :
  - `GET /api/sante`
  - `GET /api/competitions` (avec filtre optionnel `?univers=`)
  - `GET /api/competitions/:id`
  - `GET /api/matchs` (avec filtre optionnel `?statut=`)
- un identifiant inconnu renvoie `404`, pas une réponse vide ;
- un filtre invalide renvoie `400` avec la liste des valeurs attendues ;
- une adresse inexistante renvoie `404` ;
- le frontend continue de fonctionner exactement comme avant, avec ses données simulées.

## 6. Checklist d'auto-vérification

1. Pourquoi une clé d'API ne doit-elle jamais se trouver dans le frontend, alors qu'elle peut vivre dans le backend ?
   - *À relire :* § 2.2 « Qu'est-ce qu'un serveur, concrètement » (et Étape 0, § 2.4)
2. Quelle est la différence de rôle entre un fichier de `routes/` et un fichier de `controleurs/` ?
   - *À relire :* § 2.4 « Le trajet d'une requête » et § 4.5 « Routes et contrôleurs »
3. Que se passerait-il si le middleware `routeIntrouvable` était déclaré **avant** `app.use('/api', routeurApi)` ?
   - *À relire :* § 2.5 « Les middlewares, et pourquoi leur ordre est piégeux »
4. À quoi Express reconnaît-il un middleware de gestion d'erreurs, et que se passe-t-il si on l'écrit avec trois paramètres ?
   - *À relire :* § 2.5 « Les middlewares, et pourquoi leur ordre est piégeux »
5. Pourquoi renvoyer `404` plutôt qu'un `200` avec une réponse vide quand une compétition n'existe pas ?
   - *À relire :* § 2.3 « HTTP : la conversation client/serveur »
6. Pourquoi le champ `date` est-il un objet `Date` côté frontend et une chaîne côté backend ?
   - *À relire :* § 4.3 « La structure des fichiers »
7. `tsx` exécute le TypeScript sans vérifier les types. Quelle commande fait la vérification, et quand faut-il la lancer ?
   - *À relire :* § 4.1 « Créer le projet backend » (script `verifier`)
8. Trois façons de mettre en défaut un filtre `?statut=` non validé — lesquelles ?
   - *À relire :* § 2.6 « Ne jamais faire confiance au client »

## 7. Branche d'arrivée

À la fin de cette étape, ton code doit être poussé sur **`etape-04-backend-bases`**.

L'étape suivante partira de cette branche pour créer `etape-05-connexion-front-back`, qui branchera enfin les deux programmes l'un sur l'autre.

---

# Étape 5 — Connexion frontend / backend

## 1. Objectifs

À la fin de cette étape, tu dois savoir :

- expliquer ce qu'est un **Observable** et pourquoi une donnée qui vient du réseau ne se manipule pas comme un tableau ;
- appeler une API avec `HttpClient` et traiter les deux issues possibles : succès et échec ;
- représenter les **trois états** d'une page qui charge des données ;
- expliquer ce qu'est le **CORS**, pourquoi le navigateur bloque, et de quel côté ça se règle ;
- séparer la configuration du code avec les fichiers d'environnement ;
- expliquer pourquoi une date se stocke en UTC et se convertit à l'affichage.

## 2. Concepts abordés

### 2.1 Ce qui change

Jusqu'ici, les deux programmes s'ignoraient. Le frontend affichait ses propres données simulées, le backend servait les siennes dans le vide.

```mermaid
flowchart LR
    subgraph avant ["AVANT — etape 4"]
        direction TB
        F1["Frontend<br/><i>ses donnees simulees</i>"]
        B1["Backend<br/><i>ses donnees simulees</i>"]
        F1 -.-x B1
    end

    subgraph apres ["APRES — etape 5"]
        direction TB
        F2["Frontend<br/><i>affiche ce qu'il recoit</i>"]
        B2["Backend<br/><i>seule source de donnees</i>"]
        F2 -->|"HTTP + JSON"| B2
    end

    style F1 fill:#8a8a8a,color:#fff
    style B1 fill:#8a8a8a,color:#fff
    style F2 fill:#2563b0,color:#fff
    style B2 fill:#2563b0,color:#fff
```

Le frontend n'a plus **aucune** donnée en propre. C'est un changement de nature : il devient un afficheur, dépendant de quelqu'un d'autre — avec tout ce que ça implique d'attente et d'échecs possibles.

### 2.2 Le temps entre en scène

C'est le vrai sujet de cette étape, et il se lit dans les types :

```ts
// Etape 3 : les donnees sont DEJA la
listerToutes(): Competition[]

// Etape 5 : les donnees ARRIVERONT, ou pas
listerToutes(): Observable<Competition[]>
```

Lire un tableau en mémoire est instantané et ne peut pas échouer. Interroger un serveur prend des dizaines de millisecondes — parfois beaucoup plus — et peut échouer de mille façons : serveur éteint, réseau coupé, erreur interne.

Un `Competition[]` ne pouvait pas exprimer ça. Un **Observable** le dit : « cette valeur arrivera plus tard, ou pas du tout ».

Conséquence directe sur l'interface : une page ne connaît plus un seul état, mais trois.

```mermaid
stateDiagram-v2
    [*] --> Chargement: la page s'ouvre
    Chargement --> Donnees: next — le serveur a repondu
    Chargement --> Erreur: error — quelque chose a echoue
    Donnees --> [*]
    Erreur --> [*]

    note right of Chargement
        « Chargement des matchs… »
    end note
    note right of Erreur
        « Impossible de charger.
        Verifie que l'API est demarree. »
    end note
```

**Oublier un de ces trois états est l'erreur la plus courante.** Sans état de chargement, l'utilisateur voit une page vide et croit qu'il n'y a rien. Sans état d'erreur, il reste bloqué sur « Chargement… » pour toujours, sans la moindre explication.

### 2.3 Observable et souscription

Un Observable ne fait **rien** tant qu'on ne s'y abonne pas. C'est `subscribe()` qui déclenche réellement la requête :

```ts
this.competitionService.listerToutes().subscribe({
  next: (competitions) => {
    this.competitions.set(competitions);
    this.chargement.set(false);
  },
  error: () => {
    this.erreur.set("Impossible de charger les compétitions.");
    this.chargement.set(false);
  },
});
```

`next` est appelé si le serveur répond correctement, `error` si quoi que ce soit échoue.

Remarque que `this.chargement.set(false)` apparaît **dans les deux**. C'est facile à oublier dans le `error`, et l'oubli produit exactement le symptôme décrit plus haut : une page bloquée sur « Chargement… ».

Les Observables viennent de **RxJS**, une bibliothèque réputée difficile — à cause de sa centaine d'opérateurs. En pratique, quatre suffisent pour un projet comme celui-ci : `map`, `forkJoin`, `catchError` et `switchMap`. Cette étape en utilise deux.

### 2.4 Observable et signal : deux outils, deux rôles

Le projet utilise maintenant les deux, et la distinction mérite d'être claire :

| | Signal *(étape 2)* | Observable *(étape 5)* |
|---|---|---|
| Répond à | « quelle est la valeur **maintenant** ? » | « quelles valeurs vont **arriver** ? » |
| A toujours une valeur | oui | non |
| Peut échouer | non | oui |
| Sert à | l'affichage | le réseau |

Le schéma de circulation dans ce projet :

```mermaid
flowchart LR
    A["<b>API</b>"] -->|"HTTP"| B["<b>Observable</b><br/><i>service</i>"]
    B -->|"subscribe"| C["<b>signal</b><br/><i>composant</i>"]
    C -->|"computed"| D["<b>signal derive</b><br/><i>par univers, par statut</i>"]
    D --> E["<b>Gabarit</b>"]

    style A fill:#12203a,color:#fff
    style B fill:#2563b0,color:#fff
    style C fill:#3a7bd0,color:#fff
    style D fill:#3a7bd0,color:#fff
    style E fill:#eaf0f8,color:#12203a
```

L'Observable sert au transport, le signal à l'affichage. `computed()` produit les valeurs dérivées — la répartition par univers ou par statut — qui se recalculent toutes seules quand les données arrivent.

La règle qui évite beaucoup d'ennuis : **une donnée qu'on reçoit est un `signal`, une donnée qu'on calcule à partir d'elle est un `computed`.** Ne jamais stocker dans un signal ce qui peut être dérivé — sinon les deux finissent par se contredire.

### 2.5 Le CORS

C'est l'obstacle que tout le monde rencontre en branchant un frontend sur un backend, et il est déroutant parce que **le serveur répond parfaitement** — c'est le navigateur qui refuse de laisser lire la réponse.

Une **origine**, c'est le trio protocole + domaine + port. Il suffit qu'un seul diffère :

```
http://localhost:4200   (frontend)
http://localhost:3000   (backend)
        ^^^^^^ meme domaine, mais port different -> origines DIFFERENTES
```

Par défaut, le navigateur interdit à une page d'une origine de lire la réponse d'une autre.

```mermaid
sequenceDiagram
    participant P as Page<br/>(localhost:4200)
    participant N as Navigateur
    participant S as API<br/>(localhost:3000)

    P->>N: fetch /api/competitions
    N->>S: la requete PART quand meme
    S-->>N: 200 + JSON + en-tetes

    alt En-tete Access-Control-Allow-Origin correspond
        N-->>P: voici la reponse
    else En-tete absent ou different
        N--xP: BLOQUE
        Note over N,P: le serveur a pourtant<br/>bien traite la requete
    end
```

Le point contre-intuitif : **la requête part et est traitée dans tous les cas.** Le blocage est en aval, à la lecture. C'est pour ça qu'on voit la requête réussir côté serveur tout en ayant une erreur côté navigateur.

À quoi sert cette règle ? À protéger l'utilisateur. Sans elle, un site malveillant pourrait, en arrière-plan, interroger l'API de votre banque **avec vos cookies** et lire la réponse.

L'autorisation vient du **serveur**, via un en-tête :

```
Access-Control-Allow-Origin: http://localhost:4200
```

Deux conséquences à retenir :

- une erreur CORS ne se corrige **jamais** dans le frontend, toujours côté serveur ;
- `curl` et Thunder Client ne rencontrent jamais ce problème, car la règle n'existe que dans les navigateurs. Une API qui marche dans Thunder Client peut très bien être bloquée depuis une page web.

### 2.6 Les dates, JSON et les fuseaux

**JSON ne connaît pas les dates.** Il n'a que des textes, des nombres, des booléens, des listes, des objets et `null`. Une date qui traverse le réseau devient forcément du texte.

D'où deux formes du même modèle :

```ts
// Ce que l'application manipule
export interface Match {
  date: Date;
}

// Ce qui arrive du reseau
export interface MatchApi extends Omit<Match, 'date'> {
  date: string;
}
```

`Omit<Match, 'date'>` se lit « tout ce que contient `Match`, sauf `date` ». Écrire les deux interfaces séparément ferait courir le risque qu'elles divergent le jour où un champ est ajouté.

La conversion se fait dans le service, **à la frontière avec le réseau** :

```ts
listerTous(): Observable<Match[]> {
  return this.http
    .get<MatchApi[]>(this.url)
    .pipe(map((matchs) => matchs.map((match) => this.convertir(match))));
}

private convertir(match: MatchApi): Match {
  return { ...match, date: new Date(match.date) };
}
```

Faire ce nettoyage plus loin obligerait chaque composant à se souvenir que la date n'en est pas vraiment une — et le premier qui l'oublierait provoquerait un bug en appelant `.getTime()` sur du texte.

> **Bug rencontré, et corrigé.** En comparant les captures d'écran de l'étape 3 et de l'étape 5, un match affiché « 15/09 à 18:00 » était devenu « 15/09 à 20:00 ». Deux heures d'écart, apparues sans qu'on touche à l'affichage.
>
> La cause : le backend envoyait `'2026-09-15T18:00:00.000Z'`. Le `Z` final signifie **UTC**, le temps de référence universel. Or la France est à UTC+2 en septembre. Le frontend convertissait donc correctement 18:00 UTC en 20:00 heure de Paris — le bug n'était pas dans la conversion, mais dans la donnée : le match de 18h00 à Paris devait s'écrire `16:00:00.000Z`.
>
> La règle : **stocker en UTC, convertir à l'affichage.** Enregistrer une heure locale sans préciser le fuseau est ambigu, et le même match s'afficherait à des heures différentes selon le pays du visiteur.
>
> Le piège voisin : `new Date('2026-09-15T18:00:00')` **sans** le `Z` est interprété comme une heure *locale*, donc donne un résultat différent selon la machine qui exécute le code.

## 3. Prérequis

Pars de la branche **`etape-04-backend-bases`**.

```
git checkout etape-04-backend-bases
git checkout -b etape-05-connexion-front-back
```

Les deux serveurs doivent tourner en même temps, dans **deux terminaux distincts** :

```
# terminal 1
cd backend && npm run dev

# terminal 2
cd frontend && npm start
```

## 4. Déroulé détaillé

### 4.1 Autoriser le frontend, côté backend

```
cd backend
npm install cors
npm install --save-dev @types/cors
```

Dans `src/app.ts`, **avant** les routes :

```ts
app.use(cors({ origin: ORIGINE_FRONTEND }));
```

On nomme explicitement l'origine autorisée plutôt que d'écrire `origin: '*'`. Le joker ouvrirait l'API à n'importe quel site — acceptable pour une API totalement publique, dangereux dès l'étape 8, quand les requêtes porteront une identité.

L'adresse est rangée dans `src/config.ts`, qui centralise tout ce qui vient de l'environnement :

```ts
export const PORT = Number(process.env['PORT']) || 3000;
export const ORIGINE_FRONTEND = process.env['ORIGINE_FRONTEND'] ?? 'http://localhost:4200';
```

L'intérêt de centraliser : on voit d'un coup d'œil ce que le projet attend de son environnement, et aucun autre fichier n'a besoin de connaître `process.env`.

Vérification immédiate, sans navigateur :

```
curl -I -H "Origin: http://localhost:4200" http://localhost:3000/api/sante
-> Access-Control-Allow-Origin: http://localhost:4200
```

### 4.2 Séparer la configuration du code

L'adresse de l'API ne doit pas être écrite en dur : elle changera au déploiement.

```
cd frontend
ng generate environments
```

Deux fichiers apparaissent. En développement :

```ts
export const environment = {
  production: false,
  urlApi: 'http://localhost:3000/api',
};
```

Le code importe toujours `environment` et ignore lequel il reçoit : Angular remplace le fichier au moment du build, selon la configuration d'`angular.json`.

> **Piège rencontré.** `ng generate environments` modifie `angular.json`. Or le serveur de développement lit ce fichier **au démarrage** : tant qu'il n'est pas redémarré, il continue de compiler sans le remplacement, et l'application utilise l'adresse de production. Résultat : toutes les requêtes échouaient alors que la configuration était juste. **Après toute modification d'`angular.json`, il faut redémarrer `ng serve`** — le rechargement automatique ne suffit pas.

**Ces fichiers ne sont pas un endroit pour des secrets.** Ils partent dans le navigateur, donc leur contenu est public — contrairement au `.env` du backend. On y met des adresses, jamais des clés.

### 4.3 Activer HttpClient

Dans `src/app/app.config.ts` :

```ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
  ],
};
```

Sans cette ligne, `inject(HttpClient)` échoue au démarrage.

### 4.4 Réécrire les services

Le service de compétitions perd ses données et gagne une adresse :

```ts
@Service()
export class CompetitionService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.urlApi}/competitions`;

  listerToutes(): Observable<Competition[]> {
    return this.http.get<Competition[]>(this.url);
  }
}
```

Le `<Competition[]>` mérite un avertissement : c'est une **promesse faite à TypeScript, pas une vérification**. Angular ne contrôle pas que le serveur a bien renvoyé ça — il fait confiance. Si l'API changeait de format, l'erreur n'apparaîtrait qu'à l'exécution, sous une forme déroutante.

C'est ici que se voit le bénéfice du découpage de l'étape 3 : **seul l'intérieur du service a changé.** Les composants demandent toujours la même chose au même endroit.

### 4.5 Les trois états dans le composant

```ts
export class Competitions {
  private readonly competitionService = inject(CompetitionService);

  readonly chargement = signal(true);
  readonly erreur = signal<string | null>(null);
  private readonly competitions = signal<Competition[]>([]);

  readonly competitionsEsport = computed(() =>
    this.competitions().filter((competition) => competition.univers === 'esport'),
  );

  constructor() {
    this.competitionService.listerToutes().subscribe({
      next: (competitions) => {
        this.competitions.set(competitions);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set("Impossible de charger les compétitions. Vérifie que l'API est démarrée.");
        this.chargement.set(false);
      },
    });
  }
}
```

Le gabarit couvre les trois cas :

```html
@if (chargement()) {
  <p class="etat-chargement">Chargement des compétitions…</p>
} @else if (erreur()) {
  <p class="etat-erreur">{{ erreur() }}</p>
} @else {
  <!-- les cartes -->
}
```

Note le message d'erreur : il dit **quoi faire** (« vérifie que l'API est démarrée »), pas seulement que ça a raté. Un message qui n'aide pas l'utilisateur ne sert à rien.

Les styles `.etat-chargement` et `.etat-erreur` vont dans `src/styles.css`, et non dans un composant — ils servent à l'identique sur plusieurs pages. C'est l'exception à la règle de l'étape 1, et elle est légitime : ces styles concernent réellement toute l'application.

### 4.6 Deux requêtes en parallèle

La page Matchs a besoin de deux ressources : les matchs, et les compétitions pour traduire leurs identifiants.

```ts
forkJoin({
  matchs: this.matchService.listerTous(),
  competitions: this.competitionService.listerToutes(),
}).subscribe({
  next: ({ matchs, competitions }) => {
    this.matchs.set(matchs);
    this.competitions.set(competitions);
    this.chargement.set(false);
  },
  error: () => {
    this.erreur.set("Impossible de charger les matchs. Vérifie que l'API est démarrée.");
    this.chargement.set(false);
  },
});
```

`forkJoin` lance les deux requêtes **en même temps** et n'appelle `next` qu'une fois les deux arrivées. Les enchaîner serait deux fois plus lent pour rien, puisqu'elles sont indépendantes.

Si l'une échoue, `error` est appelé et les résultats de l'autre sont perdus. C'est voulu ici : mieux vaut un message clair qu'une page où chaque match afficherait « Compétition inconnue ».

### 4.7 Tester sans serveur

Un test ne doit **jamais** appeler la vraie API : il échouerait dès que le serveur est éteint, et serait lent. `HttpTestingController` intercepte les requêtes et permet de décider soi-même ce que « le serveur » répond.

```ts
TestBed.configureTestingModule({
  providers: [provideHttpClient(), provideHttpClientTesting()],
});
```

Un test de succès :

```ts
it('appelle la bonne adresse et renvoie les competitions', () => {
  let recues: Competition[] | undefined;

  service.listerToutes().subscribe((competitions) => (recues = competitions));

  const requete = httpMock.expectOne('http://localhost:3000/api/competitions');
  expect(requete.request.method).toBe('GET');

  requete.flush(competitionsSimulees);   // « le serveur repond ceci »

  expect(recues).toEqual(competitionsSimulees);
});
```

Un test d'échec, tout aussi important :

```ts
it('affiche un message si l\'API ne repond pas', async () => {
  httpMock
    .expectOne('http://localhost:3000/api/competitions')
    .flush('Indisponible', { status: 500, statusText: 'Erreur interne' });
  await fixture.whenStable();

  expect(component.erreur()).not.toBeNull();
});
```

Simuler une panne est trivial ici, alors que ce serait pénible à reproduire à la main. C'est un des grands intérêts des tests automatiques : ils rendent les cas rares aussi faciles à vérifier que les cas courants.

`httpMock.verify()` dans un `afterEach` fait échouer le test si une requête a été envoyée sans être traitée — ce qui attrape les appels involontaires.

## 5. Livrable attendu

L'interface est identique à l'étape 3 — mais toutes les données viennent maintenant du serveur :

![Matchs en thème clair, données issues de l'API](docs/images/etape-05-clair-matchs.png)

![Matchs en thème sombre](docs/images/etape-05-sombre-matchs.png)

![Compétitions en thème clair](docs/images/etape-05-clair-competitions.png)

Ce qui doit fonctionner :

- les deux serveurs tournent en parallèle (ports 3000 et 4200) ;
- les pages Matchs et Compétitions affichent les données de l'API ;
- **en arrêtant le backend**, les deux pages affichent un message d'erreur clair au lieu de rester bloquées ;
- les heures affichées correspondent à l'heure locale ;
- `npm test` passe côté frontend — 23 tests ;
- `npm run verifier` passe côté backend.

Le test le plus instructif est le troisième : coupe le backend (`Ctrl + C`), recharge la page, et vérifie que l'application se comporte correctement plutôt que de rester figée.

## 6. Checklist d'auto-vérification

1. Pourquoi `listerToutes()` renvoie-t-il maintenant un `Observable<Competition[]>` et non plus un `Competition[]` ?
   - *À relire :* § 2.2 « Le temps entre en scène »
2. Que se passe-t-il si on oublie `this.chargement.set(false)` dans le bloc `error` ?
   - *À relire :* § 2.3 « Observable et souscription » (et les trois états du § 2.2)
3. Quelles sont les trois choses qui définissent une **origine** ? Pourquoi `localhost:4200` et `localhost:3000` sont-elles différentes ?
   - *À relire :* § 2.5 « Le CORS »
4. Une erreur CORS se corrige-t-elle côté frontend ou côté backend ? Pourquoi Thunder Client ne la rencontre-t-il jamais ?
   - *À relire :* § 2.5 « Le CORS »
5. Pourquoi faut-il convertir la date en objet `Date` dans le service plutôt que dans le composant ?
   - *À relire :* § 2.6 « Les dates, JSON et les fuseaux »
6. Que signifie le `Z` à la fin de `2026-09-15T16:00:00.000Z`, et pourquoi ce match s'affiche-t-il « 18:00 » en France ?
   - *À relire :* § 2.6 « Les dates, JSON et les fuseaux » (encadré « Bug rencontré, et corrigé »)
7. Quelle différence entre un `signal` et un `computed` ? Dans quel cas utilise-t-on l'un plutôt que l'autre ?
   - *À relire :* § 2.4 « Observable et signal : deux outils, deux rôles »
8. Pourquoi `forkJoin` plutôt que deux `subscribe` enchaînés sur la page Matchs ?
   - *À relire :* § 4.6 « Deux requêtes en parallèle »

## 7. Branche d'arrivée

À la fin de cette étape, ton code doit être poussé sur **`etape-05-connexion-front-back`**.

L'étape suivante partira de cette branche pour créer `etape-06-base-de-donnees`, qui remplacera les données simulées du backend par une vraie base PostgreSQL.

---

# Étape 6 — Base de données

## 1. Objectifs

À la fin de cette étape, tu dois savoir :

- expliquer ce qu'apporte une base de données qu'un tableau en mémoire ne peut pas apporter ;
- modéliser des données en tables, avec des **clés primaires** et des **clés étrangères** ;
- décrire une relation dans un schéma Prisma, y compris quand deux relations relient les mêmes tables ;
- expliquer ce qu'est une **migration** et pourquoi on ne modifie jamais une migration déjà appliquée ;
- écrire un script de **peuplement** relançable sans danger ;
- expliquer ce que font `async` et `await`, et pourquoi les contrôleurs en ont besoin.

## 2. Concepts abordés

### 2.1 Pourquoi une base de données

Jusqu'ici, les données du backend étaient un tableau TypeScript. Ça marchait — et ça ne pouvait pas durer.

Un tableau en mémoire **disparaît à chaque redémarrage du serveur**. Ajouter une compétition à l'étape 7 n'aurait donc aucun effet durable : elle s'évaporerait au premier `Ctrl + C`.

Mais la persistance n'est que la raison la plus évidente. Une base apporte trois choses de plus :

| Ce qu'apporte une base | Ce qu'un tableau ne sait pas faire |
|---|---|
| **Persistance** | les données survivent au redémarrage |
| **Recherche efficace** | trouver parmi un million de lignes sans tout parcourir |
| **Cohérence garantie** | refuser un match dont la compétition n'existe pas |
| **Accès simultané** | plusieurs utilisateurs qui écrivent en même temps sans se corrompre |

La troisième mérite qu'on s'y arrête, parce qu'elle est contre-intuitive : **la base refuse elle-même les données incohérentes**, quelle que soit l'erreur commise dans le code qui l'alimente. C'est une garantie qu'aucune quantité de vérifications applicatives ne peut égaler.

### 2.2 Modéliser : des tables et des liens

Une base relationnelle range les données en **tables** — des tableaux à colonnes fixes — reliées entre elles.

```mermaid
erDiagram
    COMPETITIONS ||--o{ MATCHS : "accueille"
    EQUIPES ||--o{ MATCHS : "joue a domicile"
    EQUIPES ||--o{ MATCHS : "joue a l'exterieur"

    COMPETITIONS {
        string id PK
        string nom
        string organisateur
        enum univers
        string description
    }

    EQUIPES {
        string id PK
        string nom
        string trigramme
    }

    MATCHS {
        string id PK
        string competition_id FK
        string domicile_id FK
        string exterieur_id FK
        int score_domicile "peut etre NULL"
        int score_exterieur "peut etre NULL"
        datetime date
        enum statut
    }
```

`PK` signifie **clé primaire** : la colonne qui identifie de façon unique chaque ligne. `FK` signifie **clé étrangère** : une colonne qui contient la clé primaire d'une autre table, et crée ainsi le lien.

Le symbole `||--o{` se lit « un vers plusieurs » : une compétition accueille plusieurs matchs, un match appartient à une seule compétition.

Remarque que la table `matchs` porte **trois** clés étrangères, dont deux pointent vers la même table `equipes` — une pour l'équipe à domicile, une pour celle à l'extérieur.

Cette modélisation n'est pas une surprise : c'est exactement la forme adoptée à l'étape 3, quand un match stockait `competitionId: 'lol'` plutôt qu'un objet imbriqué. Ce choix d'alors évite aujourd'hui toute refonte.

### 2.3 L'ORM, et ce qu'il fait à notre place

On pourrait écrire du SQL à la main :

```sql
SELECT * FROM matchs WHERE statut = 'en_direct' ORDER BY date ASC;
```

Le projet utilise plutôt un **ORM** — un outil qui traduit entre les tables de la base et les objets du langage :

```ts
prisma.match.findMany({
  where: { statut: 'en_direct' },
  orderBy: { date: 'asc' },
});
```

Trois bénéfices concrets. Le code est **vérifié à l'écriture** : une faute de frappe sur un nom de colonne devient une erreur soulignée dans l'éditeur, au lieu d'un plantage à l'exécution. Les résultats arrivent **déjà typés**. Et les valeurs sont **échappées automatiquement**, ce qui élimine les injections SQL — la faille par laquelle un utilisateur glisse du SQL dans un champ de formulaire.

Le prix à payer : une couche de plus à apprendre, et certaines requêtes complexes plus simples à écrire directement en SQL. **L'ORM ne remplace pas la connaissance du SQL**, il la complète.

### 2.4 Le schéma comme source de vérité

La particularité de Prisma est de tout faire découler d'un seul fichier :

```mermaid
flowchart TB
    S["<b>prisma/schema.prisma</b><br/><i>ce qu'on ecrit</i>"]
    M["<b>migrations SQL</b><br/>prisma migrate dev<br/><i>font evoluer la vraie base</i>"]
    C["<b>client TypeScript</b><br/>prisma generate<br/><i>rend les requetes verifiees</i>"]
    B[("<b>PostgreSQL</b>")]
    A["<b>Code du backend</b>"]

    S --> M --> B
    S --> C --> A
    A -->|"requetes"| B

    style S fill:#12203a,color:#fff
    style M fill:#2563b0,color:#fff
    style C fill:#2563b0,color:#fff
    style B fill:#3a7bd0,color:#fff
    style A fill:#eaf0f8,color:#12203a
```

Le schéma est modifié ; tout le reste est **généré**. C'est ce qui garantit que le code et la base ne peuvent pas diverger — une source d'erreurs classique quand les deux sont maintenus à la main.

> **Piège de Prisma 7.** `migrate dev` ne régénère **pas** le client. Après toute modification du schéma, il faut lancer `prisma generate`, sinon le code continue de voir l'ancienne structure et échoue à l'exécution sur des champs pourtant bien présents en base.

### 2.5 Les migrations

Une **migration** est un fichier SQL qui décrit une modification de la structure : créer une table, ajouter une colonne, poser un index.

```
prisma/migrations/
  20260914195450_creation_initiale/
    migration.sql
```

Le nom commence par un horodatage, ce qui fixe l'ordre. Ces fichiers sont versionnés dans Git au même titre que le code.

Leur intérêt est double. **Reproduire la même base partout** : la machine d'un collègue, celle de l'intégration continue, le serveur de production — chacune rejoue la même suite et obtient exactement la même structure. Et **garder la trace** de l'évolution du schéma.

La règle à retenir : **une migration déjà appliquée ailleurs ne se modifie jamais.** On en écrit une nouvelle qui corrige. Modifier l'ancienne créerait des bases divergentes selon qu'elles l'ont jouée avant ou après — un problème très pénible à diagnostiquer.

### 2.6 `async` et `await`

Lire un tableau en mémoire est instantané. Interroger une base prend du temps et peut échouer. C'est exactement la leçon de l'étape 5, mais côté serveur :

```ts
// Etape 4 : instantane
export function obtenirCompetitions(requete, reponse) {
  reponse.json(competitions);
}

// Etape 6 : prend du temps, peut echouer
export async function obtenirCompetitions(requete, reponse, suivant) {
  try {
    reponse.json(await listerCompetitions());
  } catch (erreur) {
    suivant(erreur);
  }
}
```

`await` met en pause **cette requête-là** jusqu'à la réponse de la base. Le serveur, lui, continue de traiter les autres pendant ce temps — sans quoi une seule requête lente figerait toute l'application.

Le `try / catch` n'est pas décoratif : sans lui, une base injoignable laisserait la requête **sans réponse**, et le client suspendu jusqu'à expiration du délai. `suivant(erreur)` transmet le problème au gestionnaire d'erreurs déclaré dans `app.ts` à l'étape 4 — qui renvoie un `500` propre sans exposer le détail interne.

Le parallèle avec l'étape 5 mérite d'être fait explicitement :

| | Frontend *(étape 5)* | Backend *(étape 6)* |
|---|---|---|
| Ce qui prend du temps | l'appel réseau | la requête en base |
| L'outil | `Observable` + `subscribe` | `Promise` + `await` |
| Le traitement d'erreur | `error:` | `try / catch` |

Les deux disent la même chose : **une valeur qui arrive plus tard ne se manipule pas comme une valeur déjà là.**

### 2.7 La frontière entre la base et l'API

Deux différences de représentation apparaissent entre ce que stocke la base et ce qu'expose l'API.

PostgreSQL n'accepte pas de tiret dans le nom d'une valeur d'énumération : la base stocke donc `en_direct`. Mais l'API expose `en-direct` depuis l'étape 4, et le frontend s'en sert.

Il aurait été plus simple de changer l'API. C'est justement ce qu'il ne faut pas faire : **une API est un contrat**, et le frontend s'appuie dessus. Casser ce contrat pour arranger la base ferait remonter la contrainte technique du stockage jusqu'à l'écran.

La traduction se fait donc dans le dépôt, à la frontière :

```ts
const VERS_L_API: Record<StatutEnBase, StatutMatch> = {
  a_venir: 'a-venir',
  en_direct: 'en-direct',
  termine: 'termine',
};
```

Même logique pour les dates : la base renvoie un objet `Date`, l'API expose du texte ISO — puisque le JSON ne connaît pas les dates (étape 5).

C'est le rôle d'un **dépôt** : absorber ces différences pour que le reste du code n'ait pas à les connaître.

## 3. Prérequis

Pars de la branche **`etape-05-connexion-front-back`**.

```
git checkout etape-05-connexion-front-back
git checkout -b etape-06-base-de-donnees
```

PostgreSQL doit être installé et son service démarré (voir étape 0).

## 4. Déroulé détaillé

### 4.1 Installer Prisma

```
cd backend
npm install --save-dev prisma@7.10.0
npm install @prisma/client@7.10.0 @prisma/adapter-pg
```

> **Pourquoi une version précise ?** `npm install prisma` installe la version marquée `latest`, qui était au moment de l'écriture une **release candidate** (8.0.0-rc.15) — une version non finalisée. Un projet d'apprentissage n'a pas à essuyer ces plâtres. `npm view prisma dist-tags` montre les versions disponibles ; `prev` pointait sur 7.10.0, la dernière stable.

```
npx prisma init --datasource-provider postgresql --output ../src/generated/prisma
```

Cette commande crée `prisma/schema.prisma`, `prisma7.config.ts` et un fichier `.env`.

> **Nettoyage.** `prisma init` dépose aussi 477 Ko de documentation destinée aux outils d'IA (`.agents/`, `.claude/`, `.windsurf/`). Ces fichiers sont légitimes mais sans rapport avec le projet : ils sont ajoutés au `.gitignore` plutôt que supprimés — utiles localement, absents du dépôt.

### 4.2 Écrire le schéma

Les énumérations d'abord. Un `enum` crée un type dont les valeurs possibles sont fixées — l'équivalent en base du type union TypeScript de l'étape 3, à ceci près que **la base elle-même** refusera une valeur non prévue :

```prisma
enum Univers {
  esport
  football
}

enum StatutMatch {
  a_venir
  en_direct
  termine
}
```

Puis les tables :

```prisma
model Competition {
  id           String  @id
  nom          String
  organisateur String
  univers      Univers
  description  String

  /// Ce champ n'existe PAS comme colonne : c'est Prisma qui le reconstitue
  /// a partir de la cle etrangere portee par Match.
  matchs Match[]

  @@map("competitions")
}
```

`@id` désigne la clé primaire. `@@map("competitions")` fixe le nom réel de la table : les modèles Prisma s'écrivent au singulier avec une majuscule, les tables SQL au pluriel en minuscules — chaque monde garde ses conventions.

Le modèle `Match` est le plus instructif :

```prisma
model Match {
  id String @id

  /// Le « ? » autorise l'absence de valeur -- c'est le NULL du SQL,
  /// et l'equivalent du « number | null » de TypeScript.
  scoreDomicile  Int? @map("score_domicile")
  scoreExterieur Int? @map("score_exterieur")

  date   DateTime
  statut StatutMatch

  competitionId String      @map("competition_id")
  competition   Competition @relation(fields: [competitionId], references: [id])

  domicileId String @map("domicile_id")
  domicile   Equipe @relation("EquipeDomicile", fields: [domicileId], references: [id])

  exterieurId String @map("exterieur_id")
  exterieur   Equipe @relation("EquipeExterieur", fields: [exterieurId], references: [id])

  @@index([statut])
  @@index([competitionId])
  @@index([date])
  @@map("matchs")
}
```

Chaque relation s'écrit **en deux parties** : la colonne qui contient l'identifiant (`competitionId`), et le champ d'objet que Prisma reconstitue (`competition`). Seule la première existe réellement en base.

Les **noms de relation** (`"EquipeDomicile"`, `"EquipeExterieur"`) sont obligatoires ici : deux relations relient `Match` et `Equipe`, et sans ces noms Prisma ne saurait pas laquelle des deux clés étrangères correspond à quel champ.

Les **index** portent sur les colonnes qui servent à filtrer (`statut`, `competitionId`) ou à trier (`date`). Sans eux, PostgreSQL parcourt toute la table à chaque requête. Sur huit lignes c'est sans effet ; sur des dizaines de milliers, c'est la différence entre une réponse instantanée et plusieurs secondes.

Vérification avant d'aller plus loin :

```
npx prisma validate
```

### 4.3 Configurer la connexion

Dans `backend/.env` — **jamais** commité :

```
DATABASE_URL="postgresql://postgres:MOT_DE_PASSE@localhost:5432/suivi_competition?schema=public"
```

La forme de cette adresse : `postgresql://UTILISATEUR:MOT_DE_PASSE@MACHINE:PORT/BASE`. Le mot de passe est celui choisi à l'installation de PostgreSQL. La base n'a pas besoin d'exister — Prisma la créera.

Le modèle correspondant, sans la valeur, va dans `.env.example` à la racine. C'est la discipline posée à l'étape 0 : **les noms sont publics, les valeurs jamais**.

> **Nouveauté de Prisma 7 :** l'outil ne lit plus le `.env` tout seul. C'est l'`import 'dotenv/config'` en tête de `prisma7.config.ts` qui s'en charge.

### 4.4 Créer la base

```
npx prisma migrate dev --name creation_initiale
```

Sortie réelle de la commande :

```
Datasource "db": PostgreSQL database "suivi_competition", schema "public" at "localhost:5432"

PostgreSQL database suivi_competition created at localhost:5432

Applying migration `20260914195450_creation_initiale`

prisma/migrations/
  └─ 20260914195450_creation_initiale/
    └─ migration.sql

Your database is now in sync with your schema.
```

**Ouvre le fichier `migration.sql` produit.** C'est le SQL que Prisma a écrit à ta place : les `CREATE TYPE` pour les énumérations, les `CREATE TABLE`, les `CREATE INDEX` et les `ALTER TABLE … ADD CONSTRAINT … FOREIGN KEY`. Le lire est le meilleur moyen de comprendre ce que le schéma Prisma signifie réellement.

### 4.5 Peupler la base

Le script `prisma/seed.ts` insère les données de départ. Deux points méritent attention.

**L'ordre.** Un match référence une compétition et deux équipes ; PostgreSQL refuse une ligne dont la clé étrangère pointe vers une ligne inexistante. On crée donc les références avant ce qui s'y rattache.

**La relançabilité.** Le script utilise `upsert` plutôt que `create` :

```ts
await prisma.competition.upsert({
  where: { id: competition.id },
  update: competition,
  create: competition,
});
```

`upsert` signifie « mets à jour si ça existe, crée sinon ». Avec un simple `create`, une seconde exécution échouerait sur un identifiant déjà pris — et il faudrait vider la base à la main avant chaque essai.

La commande est déclarée dans `prisma7.config.ts` :

```ts
migrations: {
  seed: 'npx tsx prisma/seed.ts',
}
```

Puis :

```
npx prisma db seed
->   4 compétitions
     14 équipes
     8 matchs
```

### 4.6 Remplacer `donnees/` par `depots/`

C'est ici que le découpage de l'étape 4 paie. Le dossier `src/donnees/` disparaît, remplacé par `src/depots/` :

```ts
import { prisma } from '../prisma';

export async function listerCompetitions(univers?: Univers): Promise<Competition[]> {
  return prisma.competition.findMany({
    // Si « univers » est absent, on ne filtre pas : Prisma ignore les
    // proprietes valant undefined, ce qui evite d'ecrire deux requetes.
    where: { univers },
    orderBy: { nom: 'asc' },
  });
}
```

Le client Prisma est créé **une seule fois**, dans `src/prisma.ts`, et partagé :

```ts
const adaptateur = new PrismaPg({ connectionString: process.env['DATABASE_URL'] });
export const prisma = new PrismaClient({ adapter: adaptateur });
```

Chaque client ouvre un pool de connexions vers PostgreSQL, et une base n'en accepte qu'un nombre limité — en créer un par requête épuiserait ce budget en quelques secondes.

Pour les matchs, `include` demande à Prisma de rapporter aussi les lignes liées :

```ts
const lignes = await prisma.match.findMany({
  where: statut ? { statut: VERS_LA_BASE[statut] } : {},
  include: { domicile: true, exterieur: true },
  orderBy: { date: 'asc' },
});
```

Sans `include`, on n'obtiendrait que `domicileId` et `exterieurId`, et il faudrait une requête supplémentaire **par match** pour récupérer les noms. Sur une liste de cent matchs, cela ferait deux cent une requêtes au lieu d'une — un problème si courant qu'il porte un nom : la requête N+1.

### 4.7 Vérifier

Les endpoints n'ont pas changé d'adresse. Résultats réels :

```
GET /api/competitions
-> 4 : League of Legends, Ligue 1, Ligue des Champions, Valorant

GET /api/competitions?univers=football
-> Ligue 1, Ligue des Champions

GET /api/matchs?statut=en-direct
-> Karmine Corp 1-0 G2 Esports        [en-direct]  2026-09-14T15:00:00.000Z
   Paris Saint-Germain 2-1 Olympique de Marseille  [en-direct]  2026-09-14T15:45:00.000Z

GET /api/competitions/echecs          [HTTP 404]
GET /api/matchs?statut=xxx            [HTTP 400]
```

Note que `statut` vaut bien `en-direct` avec un tiret, alors que la base stocke `en_direct` : le contrat de l'API est préservé.

Pour voir la base directement, deux outils :

```
npx prisma studio       # interface web fournie par Prisma
```

ou **pgAdmin** / **DBeaver**, installés à l'étape 0. Ouvrir la table `matchs` et retrouver les huit lignes, avec leurs colonnes `competition_id`, `domicile_id` et `exterieur_id`, rend le schéma beaucoup plus concret que sa lecture.

## 5. Livrable attendu

L'interface est identique à l'étape 5 — et c'est bon signe : changer la source des données ne devait rien casser côté écran.

![Matchs en thème clair, données issues de PostgreSQL](docs/images/etape-06-clair-matchs.png)

![Matchs en thème sombre](docs/images/etape-06-sombre-matchs.png)

Ce qui doit fonctionner :

- `npx prisma migrate dev` crée la base et les trois tables ;
- `npx prisma db seed` insère 4 compétitions, 14 équipes et 8 matchs ;
- l'API sert ces données, filtres et cas d'erreur compris ;
- **les données survivent au redémarrage du serveur** — c'était tout l'objet de l'étape ;
- `npm run verifier` passe ;
- `npx prisma studio` permet de voir les tables.

Le test le plus parlant : arrête le backend, relance-le, et constate que les données sont toujours là. À l'étape 5, elles étaient reconstruites à chaque démarrage.

## 6. Checklist d'auto-vérification

1. Trois choses qu'une base apporte et qu'un tableau en mémoire ne sait pas faire ?
   - *À relire :* § 2.1 « Pourquoi une base de données »
2. Que se passe-t-il si on essaie d'insérer un match dont `competition_id` ne correspond à aucune compétition ? Qui refuse : le code ou la base ?
   - *À relire :* § 2.1 « Pourquoi une base de données » (cohérence garantie) et § 4.5 « Peupler la base » (l'ordre)
3. Pourquoi les relations entre `Match` et `Equipe` doivent-elles être nommées, alors que celle vers `Competition` n'en a pas besoin ?
   - *À relire :* § 4.2 « Écrire le schéma » (noms de relation)
4. Dans `model Competition`, le champ `matchs Match[]` correspond-il à une colonne de la table ? Sinon, d'où vient-il ?
   - *À relire :* § 4.2 « Écrire le schéma » (une relation s'écrit en deux parties)
5. Pourquoi le script de peuplement utilise-t-il `upsert` plutôt que `create` ?
   - *À relire :* § 4.5 « Peupler la base »
6. Pourquoi les contrôleurs sont-ils devenus `async` ? Quel est le rapport avec les Observables de l'étape 5 ?
   - *À relire :* § 2.6 « `async` et `await` »
7. La base stocke `en_direct`, l'API expose `en-direct`. Pourquoi ne pas avoir aligné l'API sur la base, ce qui aurait été plus simple ?
   - *À relire :* § 2.7 « La frontière entre la base et l'API »
8. À quoi sert `include: { domicile: true }` ? Que se passerait-il sans, sur une liste de cent matchs ?
   - *À relire :* § 4.6 « Remplacer `donnees/` par `depots/` »

## 7. Branche d'arrivée

À la fin de cette étape, ton code doit être poussé sur **`etape-06-base-de-donnees`**.

L'étape suivante partira de cette branche pour créer `etape-07-crud`, qui ajoutera la création, la modification et la suppression de données — les trois opérations qu'une base rend enfin possibles.

---

# Étape 7 — CRUD complet

## 1. Objectifs

À la fin de cette étape, tu dois savoir :

- expliquer ce que recouvre le sigle **CRUD**, et relier chaque opération à sa méthode HTTP, à son code de statut, à sa requête Prisma et à son instruction SQL ;
- **valider** le corps d'une requête côté serveur, et expliquer pourquoi la validation du formulaire ne suffit jamais ;
- distinguer un **échec prévisible** (compétition introuvable, identifiant déjà pris) d'une **erreur inattendue**, et traduire chacun en code HTTP ;
- écrire une **migration à la main** pour poser une règle que Prisma ne sait pas exprimer ;
- construire un formulaire avec **Signal Forms** : modèle, règles de validation, soumission ;
- éviter le piège du fuseau horaire dans un champ date/heure.

## 2. Concepts abordés

### 2.1 CRUD : quatre opérations sur une même ressource

Jusqu'ici, l'application ne savait que **lire**. Les données arrivaient de la base, traversaient l'API et s'affichaient — mais rien ne permettait de les changer depuis l'écran. Ajouter une compétition exigeait de modifier le script de peuplement et de le relancer.

**CRUD** est l'acronyme anglais des quatre opérations qu'on peut faire sur une donnée stockée : *Create* (créer), *Read* (lire), *Update* (modifier), *Delete* (supprimer). Presque toutes les applications de gestion — un carnet de contacts, un inventaire de jeu, un back-office de boutique — se ramènent à ces quatre gestes appliqués à différentes ressources.

L'intérêt de ce découpage est qu'il se retrouve **à chaque couche** du projet, avec un vocabulaire différent à chaque fois. Le tableau suivant est la carte de toute l'étape :

| CRUD | Méthode HTTP | Adresse | Contrôleur | Dépôt | Prisma | SQL | Succès |
|---|---|---|---|---|---|---|---|
| **Create** | `POST` | `/api/competitions` | `creerCompetition` | `insererCompetition` | `create` | `INSERT` | `201` |
| **Read** | `GET` | `/api/competitions/lol` | `obtenirCompetition` | `trouverCompetition` | `findUnique` | `SELECT` | `200` |
| **Update** | `PUT` | `/api/competitions/lol` | `modifierCompetition` | `mettreAJourCompetition` | `update` | `UPDATE` | `200` |
| **Delete** | `DELETE` | `/api/competitions/lol` | `supprimerCompetition` | `effacerCompetition` | `delete` | `DELETE` | `204` |

Les noms ont été choisis pour que chaque couche parle **sa propre langue** : le contrôleur répond à une intention HTTP (*créer*, *modifier*), le dépôt décrit une opération sur la base (*insérer*, *mettre à jour*, *effacer*). Deux mots différents pour deux responsabilités différentes — et, accessoirement, aucun conflit de nom quand le contrôleur importe le dépôt.

Voici le trajet complet d'une création, du clic jusqu'à la base :

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant F as Formulaire Angular
    participant A as API Express
    participant V as Validation
    participant D as Depot
    participant B as PostgreSQL

    U->>F: clique sur Enregistrer
    F->>F: verifie les regles du schema
    alt une regle n'est pas respectee
        F-->>U: erreurs sous les champs, rien n'est envoye
    else tout est correct
        F->>A: POST /api/matchs avec le corps JSON
        A->>V: validerDonneesMatch(corps)
        alt corps refuse
            V-->>A: liste des erreurs
            A-->>F: 400 et le detail par champ
        else corps accepte
            V-->>A: donnees propres
            A->>D: insererMatch(donnees)
            D->>B: INSERT INTO matchs
            B-->>D: ligne creee, ou refus de la cle etrangere
            D-->>A: le Match, ou reference-inconnue
            A-->>F: 201 Created
            F->>F: navigation vers /matchs
        end
    end
```

Remarque que la validation apparaît **deux fois** : dans le formulaire, puis dans l'API. Ce n'est pas un doublon — c'est l'objet du § 2.3.

### 2.2 Les méthodes HTTP qui écrivent

Une requête `GET` ne transporte qu'une adresse. Les requêtes d'écriture transportent en plus un **corps** (*body*) : les données à enregistrer, écrites en JSON.

```
POST /api/competitions HTTP/1.1
Content-Type: application/json

{"id":"coupe-de-france","nom":"Coupe de France","organisateur":"FFF","univers":"football","description":"..."}
```

L'en-tête `Content-Type: application/json` annonce la nature du corps. C'est lui que `express.json()` — installé dès l'étape 4 — regarde avant de lire le corps et de le ranger dans `requete.body`. Sans cet en-tête, `requete.body` vaut `undefined`.

Trois méthodes servent à écrire, et la différence entre les deux dernières est souvent mal comprise :

| Méthode | Intention | Rejouée deux fois… |
|---|---|---|
| `POST` | **créer** une nouvelle ressource dans une collection | crée **deux** ressources |
| `PUT` | **remplacer** entièrement une ressource existante | donne le **même** résultat |
| `PATCH` | **modifier une partie** d'une ressource | dépend de la modification |
| `DELETE` | **supprimer** une ressource | la seconde répond `404`, mais l'état final est le même |

La dernière colonne décrit une propriété qui porte un nom : l'**idempotence**. Une opération est idempotente si l'exécuter une ou plusieurs fois laisse les données dans le même état. `PUT` l'est : envoyer deux fois « le match m2 est en direct, 2 à 1 » laisse le match en direct, 2 à 1. `POST` ne l'est pas : envoyer deux fois « crée ce match » en crée deux.

Ce n'est pas de la théorie. Sur un réseau instable, un navigateur ou un intermédiaire peut rejouer une requête dont il n'a pas reçu la réponse. Pour un `PUT`, c'est sans conséquence ; pour un `POST`, c'est un doublon. C'est aussi pourquoi le bouton « Enregistrer » est désactivé pendant l'envoi (§ 4.9).

**Le projet utilise `PUT`**, parce que les formulaires renvoient **tous** les champs de la ressource, pas seulement ceux qui ont changé. `PATCH` serait le bon choix pour une action ciblée, comme un bouton « +1 but » qui ne toucherait qu'au score.

Les écritures introduisent aussi de nouveaux **codes de statut** :

| Code | Nom | Quand le projet le renvoie |
|---|---|---|
| `201` | *Created* | une compétition ou un match vient d'être créé ; l'en-tête `Location` donne son adresse |
| `204` | *No Content* | une suppression a réussi ; il n'y a plus rien à décrire, donc aucun corps |
| `400` | *Bad Request* | le corps est invalide, n'est pas du JSON, ou désigne une équipe qui n'existe pas |
| `404` | *Not Found* | la compétition ou le match à modifier n'existe pas |
| `409` | *Conflict* | l'identifiant est déjà pris, ou la compétition contient encore des matchs |
| `413` | *Payload Too Large* | le corps dépasse 100 Ko |

La nuance entre `400` et `409` mérite d'être retenue. Un `400` dit « ta requête est mal écrite, inutile de la renvoyer telle quelle ». Un `409` dit « ta requête est correcte, mais **l'état actuel des données** l'empêche d'aboutir » : la même requête réussirait si l'identifiant se libérait ou si les matchs étaient supprimés.

### 2.3 Ne jamais faire confiance au corps d'une requête

Le formulaire Angular vérifie déjà que l'identifiant est bien formé, que le nom n'est pas vide, que les deux équipes sont différentes. Pourquoi l'API vérifie-t-elle **encore tout** ?

Parce que **le formulaire n'est pas le seul client de l'API**. N'importe qui peut lui envoyer n'importe quoi, sans jamais ouvrir l'application :

```
curl -X POST http://localhost:3000/api/matchs \
  -H "Content-Type: application/json" \
  -d '{"competitionId":"lol","domicileId":"kc","exterieurId":"kc","scoreDomicile":-5}'
```

Thunder Client, un script, ou l'onglet *Réseau* des outils de développement du navigateur permettent la même chose en quelques secondes. La règle posée à l'étape 4 pour les paramètres d'URL s'applique donc ici avec encore plus de force.

Chaque couche a un rôle distinct, et aucune ne remplace les autres :

```mermaid
flowchart LR
    S(["Saisie"])
    F["<b>1. Formulaire</b><br/>Signal Forms<br/><i>confort : reponse immediate</i><br/><i>contournable</i>"]
    A["<b>2. API</b><br/>dossier validation/<br/><i>securite : refuse tout client</i><br/><i>repond 400</i>"]
    B[("<b>3. Base</b><br/>cles etrangeres, CHECK<br/><i>dernier filet</i>")]
    X["curl, Thunder Client,<br/>script"]

    S --> F --> A --> B
    X -.->|"contourne le formulaire"| A

    style F fill:#eaf0f8,color:#12203a
    style A fill:#2563b0,color:#fff
    style B fill:#12203a,color:#fff
    style X fill:#fdf3f3,color:#6b4545
```

- Le **formulaire** apporte le **confort** : l'erreur s'affiche avant même l'envoi. Mais il est contournable, donc il ne protège rien.
- L'**API** apporte la **sécurité** : c'est le seul point de passage obligé. Elle doit tout revérifier.
- La **base** apporte la **garantie finale** : même un bug dans la validation de l'API, ou une requête lancée depuis DBeaver, ne passera pas ses contraintes.

Ce principe de protections superposées, dont chacune couvre les failles possibles des autres, s'appelle la **défense en profondeur**.

**La liste blanche.** Valider les champs attendus ne suffit pas : il faut aussi **ignorer les autres**. Imagine ce contrôleur, plus court que celui du projet :

```ts
// A NE PAS FAIRE
await prisma.competition.update({ where: { id }, data: requete.body });
```

Il transmet à la base **tout** ce que le client a envoyé. Un client qui ajoute `"id": "pirate"` au corps renomme la compétition — et casse les matchs qui y font référence. À l'étape 8, quand la table des utilisateurs aura une colonne `role`, le même raccourci permettrait à n'importe qui de s'envoyer `"role": "admin"`. Cette faille est si courante qu'elle porte un nom : l'**affectation de masse** (*mass assignment*).

La validation du projet **reconstruit** donc un objet neuf, champ par champ, au lieu de renvoyer le corps reçu. Tout champ absent de cette liste — une **liste blanche** — est ignoré. Le test du § 4.7 le vérifie : un `"role": "admin"` glissé dans le corps n'atteint jamais la base.

### 2.4 Échec prévisible ou erreur inattendue

Une écriture peut échouer pour deux sortes de raisons, qui n'appellent pas du tout la même réponse.

Les **échecs prévisibles** ne sont pas des bugs : un identifiant déjà pris, une compétition supprimée par quelqu'un d'autre entre-temps, une suppression refusée parce que des matchs en dépendent. L'application doit s'y attendre et répondre précisément — `404`, `409` — avec un message utile.

Les **erreurs inattendues** sont tout le reste : base injoignable, bug dans le code. On ne peut rien y faire sur le moment, sinon les consigner dans les journaux et répondre `500` sans rien révéler (étape 4).

**Comment Prisma signale un refus.** Quand PostgreSQL refuse une opération, Prisma lève une erreur portant un code stable de la forme `P2xxx`. Plutôt que de se fier à la documentation, le projet a observé ces codes **sur la vraie base**, avec un petit script lancé avant d'écrire le moindre dépôt. Résultats réels :

| Opération tentée | Code | Détail renvoyé par PostgreSQL |
|---|---|---|
| Supprimer la compétition `lol`, qui a des matchs | `P2003` | *violates RESTRICT setting of foreign key constraint "matchs_competition_id_fkey"* |
| Modifier une compétition `zzz` inexistante | `P2025` | *operation: an update* |
| Supprimer un match `zzz` inexistant | `P2025` | *operation: a delete* |
| Créer une seconde compétition `lol` | `P2002` | *la valeur d'une clé dupliquée rompt la contrainte unique « competitions_pkey »* |
| Créer un match dans une compétition `zzz` | `P2003` | *viole la contrainte de clé étrangère « matchs_competition_id_fkey »* |

**Comment le dépôt le dit au contrôleur.** Chaque fonction d'écriture renvoie soit le résultat, soit **un mot qui nomme la raison de l'échec**. Le type de retour les énumère tous :

```ts
insererCompetition(competition): Promise<Competition | 'identifiant-pris'>
mettreAJourCompetition(id, donnees): Promise<Competition | 'introuvable'>
effacerCompetition(id): Promise<'effacee' | 'introuvable' | 'utilisee'>
```

C'est un **type union**, déjà rencontré à l'étape 3 avec `'esport' | 'football'`. Son intérêt ici est que TypeScript **oblige** le contrôleur à traiter les échecs avant d'utiliser le résultat :

```ts
const resultat = await mettreAJourCompetition(identifiant, validation.donnees);

// Ici, « resultat » peut etre une Competition OU le texte 'introuvable'.
// Ecrire resultat.nom serait refuse par TypeScript.

if (resultat === 'introuvable') {
  reponse.status(404).json({ erreur: 'Compétition introuvable', id: identifiant });
  return;
}

// Ici, TypeScript sait que 'introuvable' a ete ecarte : resultat est une Competition.
reponse.json(resultat);
```

Ce mécanisme, par lequel TypeScript **restreint** le type possible d'une valeur après un test, s'appelle le **rétrécissement de type** (*narrowing*). C'est le même que celui de la garde de type de l'étape 4.

Pourquoi pas `null`, comme `trouverCompetition` depuis l'étape 6 ? Parce que `null` ne dit pas **pourquoi** l'opération a échoué — et une suppression peut échouer pour deux raisons différentes, qui appellent deux codes HTTP différents.

**Pourquoi ne pas vérifier avant d'écrire ?** Il serait tentant de chercher l'identifiant avec `findUnique`, puis de créer la compétition seulement s'il est libre. Le problème apparaît quand deux requêtes arrivent presque en même temps :

```mermaid
sequenceDiagram
    participant A as Requete A
    participant B as Requete B
    participant P as PostgreSQL

    A->>P: coupe-de-france existe-t-il ?
    P-->>A: non
    B->>P: coupe-de-france existe-t-il ?
    P-->>B: non
    A->>P: INSERT coupe-de-france
    P-->>A: ligne creee
    B->>P: INSERT coupe-de-france
    P-->>B: refus, cle primaire deja prise
    Note over A,B: la verification prealable n'a rien garanti
```

Entre la vérification et l'écriture, le monde a changé. Ce genre de bug, qui dépend de l'ordre d'arrivée de requêtes simultanées, s'appelle une **situation de concurrence** (*race condition*) : rare, donc presque impossible à reproduire, et d'autant plus pénible à corriger. La seule source fiable est la base elle-même, qui voit passer **toutes** les écritures. Le projet la laisse donc trancher, et interprète son refus.

### 2.5 Une règle que Prisma ne sait pas écrire

« Un match oppose deux équipes différentes » et « un score n'est jamais négatif » sont des règles que la base devrait garantir, au même titre qu'elle garantit les clés étrangères. PostgreSQL le permet avec une **contrainte `CHECK`** : une condition que chaque ligne doit respecter, sous peine d'être refusée.

```sql
ALTER TABLE "matchs"
  ADD CONSTRAINT "matchs_equipes_differentes"
  CHECK ("domicile_id" <> "exterieur_id");
```

`<>` signifie « différent de » en SQL.

Le schéma Prisma n'a aucune syntaxe pour cela. La solution est prévue par l'outil : créer une migration **vide**, puis y écrire soi-même le SQL avant de l'appliquer. C'est l'option `--create-only` (§ 4.2).

Une subtilité du SQL rend la seconde règle plus élégante qu'il n'y paraît :

```sql
CHECK ("score_domicile" >= 0 AND "score_exterieur" >= 0)
```

Que se passe-t-il pour un match à venir, dont les scores valent `NULL` ? En SQL, une comparaison avec `NULL` ne vaut ni vrai ni faux : elle vaut « inconnu ». Et une contrainte `CHECK` ne refuse une ligne que si la condition vaut **faux**. `NULL >= 0` laisse donc passer la ligne — exactement le comportement voulu pour un match pas encore joué — tandis que `-1 >= 0` la bloque.

Résultat réel, en tentant de contourner l'API pour insérer directement un match incohérent :

```
memes equipes  -> P2039  la nouvelle ligne de la relation « matchs » viole la contrainte
                         de vérification « matchs_equipes_differentes »
score negatif  -> P2039  la nouvelle ligne de la relation « matchs » viole la contrainte
                         de vérification « matchs_scores_positifs »
```

Le dépôt ne traduit volontairement **pas** ce code `P2039`. Si une ligne arrive jusqu'à la base en violant ces règles, c'est que la validation de l'API a laissé passer quelque chose : c'est un bug, et le `500` qui en résulte est la réponse honnête.

### 2.6 Signal Forms : un formulaire construit sur un signal

Un formulaire web doit gérer beaucoup de choses : la valeur de chaque champ, ses règles, ses erreurs, le fait qu'il ait été touché ou non, l'état d'envoi. Angular propose plusieurs outils pour cela ; le projet utilise le plus récent, **Signal Forms**, stable depuis Angular 22. Son intérêt pédagogique est qu'il repose entièrement sur les **signaux** découverts à l'étape 2.

Tout part d'un **modèle** : un signal ordinaire qui contient les valeurs.

```ts
private readonly champs = signal<ChampsMatch>({
  competitionId: '',
  domicileId: '',
  exterieurId: '',
  date: '',
  statut: 'a-venir',
  scoreDomicile: null,
  scoreExterieur: null,
});
```

La fonction `form()` construit le formulaire **autour** de ce signal, et un **schéma** y déclare les règles :

```ts
readonly formulaire = form(this.champs, (chemin) => {
  required(chemin.competitionId, { message: 'Choisis une compétition.' });
  // ...
});
```

Dans le gabarit, l'attribut `[formField]` relie un champ HTML à un champ du modèle, **dans les deux sens** :

```html
<select id="match-competition" [formField]="formulaire.competitionId">
```

Choisir une option met à jour le signal ; changer le signal — par exemple en chargeant le match à modifier — met à jour la liste déroulante. Le formulaire ne garde **aucune copie** des données : c'est le signal qui fait foi.

```mermaid
flowchart TB
    M["<b>Modele</b><br/>signal champs"]
    H["<b>Champs HTML</b><br/>formField"]
    S["<b>Schema</b><br/>required, min, validate, hidden"]
    E["<b>Etat de chaque champ</b><br/>value, touched, invalid, errors"]
    R["<b>Soumission</b><br/>formRoot puis action"]
    API[("API")]

    M <-->|"saisie et pre-remplissage"| H
    M --> S --> E
    E -->|"messages sous les champs"| H
    E -->|"bloque si une regle echoue"| R
    R -->|"seulement si tout est valide"| API

    style M fill:#12203a,color:#fff
    style S fill:#2563b0,color:#fff
    style E fill:#2563b0,color:#fff
    style H fill:#eaf0f8,color:#12203a
    style R fill:#eaf0f8,color:#12203a
```

Chaque champ expose un **état**, qu'on lit en appelant le champ comme une fonction — `formulaire.nom()` — puis la propriété voulue, elle-même un signal :

| Lecture | Signification |
|---|---|
| `formulaire.nom().value()` | la valeur actuelle |
| `formulaire.nom().touched()` | la personne a quitté ce champ au moins une fois |
| `formulaire.nom().invalid()` | au moins une règle n'est pas respectée |
| `formulaire.nom().errors()` | la liste des erreurs, avec leur message |
| `formulaire().submitting()` | un envoi est en cours (sur le formulaire entier) |

Deux règles particulières méritent d'être connues, parce qu'elles **retirent un champ de la validation** :

- `hidden()` masque un champ selon une condition. Les scores d'un match à venir sont masqués — et leurs règles ne bloquent plus l'envoi. Sans cela, un `-1` tapé puis masqué en repassant le statut à « À venir » empêcherait d'enregistrer, à cause d'un champ devenu invisible.
- `disabled()` désactive un champ. L'identifiant d'une compétition est désactivé en modification : il ne se change plus, et ses règles ne s'appliquent plus.

**Et les autres approches ?** Angular propose aussi les *formulaires réactifs* (`FormGroup`, `FormControl`), très répandus dans les projets existants et dans les tutoriels, et les *formulaires pilotés par le gabarit* (`ngModel`), plus anciens. Les trois résolvent le même problème. Signal Forms est recommandé pour un nouveau projet depuis Angular 22 ; les formulaires réactifs restent à connaître, car tu les croiseras dans presque tout code Angular écrit avant 2026.

### 2.7 Le fuseau horaire, encore

Le champ `<input type="datetime-local">` manipule du texte de la forme `2026-09-20T21:00` — **sans fuseau**, et en **heure locale** : l'heure que la personne lit sur sa montre.

La base, elle, stocke de l'UTC (étape 5). Il faut donc convertir dans les deux sens, et le piège est symétrique :

```mermaid
flowchart LR
    A["Champ<br/>2026-09-20T21:00<br/><i>heure de Paris</i>"]
    B["Date<br/><i>un instant precis</i>"]
    C["JSON envoye<br/>...T19:00:00.000Z"]
    D[("Base<br/>19:00 UTC")]
    E["JSON recu<br/>...T19:00:00.000Z"]
    F["Date"]
    G["Champ<br/>2026-09-20T21:00"]

    A -->|"new Date(texte)"| B -->|"toISOString()"| C -->|"POST"| D
    D -->|"GET"| E -->|"new Date(texte)"| F -->|"versChampDateHeure()"| G

    style D fill:#12203a,color:#fff
```

À l'aller, tout va bien : la norme JavaScript prévoit qu'un texte date + heure **sans** fuseau est lu en heure locale, et `toISOString()` produit toujours de l'UTC avec son `Z`.

Au retour, l'erreur classique serait de remplir le champ avec `toISOString().slice(0, 16)`, qui donne `2026-09-20T19:00`. Le formulaire afficherait **19h** pour un match à 21h — et, si l'on validait sans rien toucher, l'enregistrerait à 19h heure de Paris, soit 17h UTC. Deux heures perdues à chaque enregistrement : le bug de l'étape 5, sous une nouvelle forme.

La fonction `versChampDateHeure()` assemble donc le texte à la main avec les méthodes **locales** de `Date` — `getHours()`, et non `getUTCHours()`. Un test vérifie l'aller-retour complet (§ 4.13).

Côté serveur, la validation **exige** un fuseau explicite (`Z` ou `+02:00`). Un texte comme `2026-09-20T21:00` serait lu dans le fuseau **de la machine** qui l'interprète : 21h à Paris sur un serveur français, 21h UTC sur un serveur hébergé ailleurs. Plutôt que de deviner, l'API refuse l'ambiguïté.

## 3. Prérequis

Pars de la branche **`etape-06-base-de-donnees`**.

```
git checkout etape-06-base-de-donnees
git checkout -b etape-07-crud
```

PostgreSQL doit être démarré, et la base de l'étape 6 créée et peuplée.

Si tu récupères directement la branche `etape-07-crud`, une seule commande applique la nouvelle migration :

```
cd backend
npm run bdd:migrer
```

## 4. Déroulé détaillé

L'étape se construit de bas en haut : la base d'abord, puis l'API, et enfin l'interface. Chaque couche est vérifiée avant de passer à la suivante — c'est ce qui permet, quand quelque chose ne marche pas, de savoir où chercher.

```mermaid
flowchart LR
    subgraph BACK["backend/"]
        direction TB
        P["prisma/<br/>schema + migration"]
        VA["src/validation/<br/><i>nouveau</i>"]
        DE["src/depots/<br/>ecritures"]
        CO["src/controleurs/<br/>POST, PUT, DELETE"]
    end
    subgraph FRONT["frontend/src/app/"]
        direction TB
        SE["services/<br/>creer, modifier, supprimer"]
        OU["outils/<br/><i>nouveau</i>"]
        CP["composants/erreurs-champ/<br/><i>nouveau</i>"]
        PA["pages/match-formulaire/<br/>pages/competition-formulaire/<br/><i>nouveaux</i>"]
    end
    P --> DE --> CO
    VA --> CO
    CO -->|"HTTP"| SE --> PA
    OU --> PA
    CP --> PA
```

### 4.1 Générer les identifiants de match

Une compétition a un identifiant naturel, choisi par la personne qui la crée : `lol`, `ligue1`. Un match n'en a pas — personne ne devrait avoir à inventer `m9` en le saisissant. Le schéma confie donc cette tâche à Prisma :

```prisma
model Match {
  /// Etape 7 : l'identifiant d'un nouveau match est genere automatiquement.
  /// uuid() produit une valeur comme « 3f2b8c1e-9a4d-4e6b-8f0a-2c7d5e9b1a43 ».
  id String @id @default(uuid())
  // ...
}
```

Un **UUID** (*Universally Unique Identifier*) est un identifiant de 36 caractères tiré au hasard dans un espace si vaste que deux tirages identiques sont, en pratique, impossibles. Les matchs existants gardent leurs identifiants `m1` à `m8` : la colonne reste un simple texte.

`@default(uuid())` est calculé **par Prisma**, pas par PostgreSQL. Il ne change donc rien à la structure de la base, mais il change le **client TypeScript** : `id` devient facultatif à la création. D'où le rappel de l'étape 6 :

```
npx prisma generate
```

### 4.2 Écrire une migration à la main

Les contraintes `CHECK` du § 2.5 exigent une migration. On la crée **sans l'appliquer** :

```
npx prisma migrate dev --create-only --name contraintes_matchs
```

Prisma compare le schéma à la base, ne trouve aucune différence de structure (le `uuid()` du § 4.1 ne touche pas la base), et produit un fichier au contenu éloquent :

```sql
-- This is an empty migration.
```

On le remplace par le SQL voulu — dans `prisma/migrations/20260917163241_contraintes_matchs/migration.sql` :

```sql
-- Etape 7 : regles de coherence posees directement dans la base.
--
-- Cette migration a ete creee VIDE avec « prisma migrate dev --create-only »,
-- puis completee a la main : le schema Prisma ne sait pas exprimer une
-- contrainte CHECK. C'est le cas d'usage prevu de --create-only -- ecrire soi-
-- meme le SQL d'une migration avant de l'appliquer.
--
-- L'API verifie deja ces deux regles. Les repeter ici n'est pas un doublon
-- inutile : c'est le dernier filet. Un script de peuplement mal ecrit, une
-- requete lancee depuis DBeaver ou un bug futur dans la validation ne
-- passeront pas non plus.

-- Un match oppose deux equipes DIFFERENTES.
ALTER TABLE "matchs"
  ADD CONSTRAINT "matchs_equipes_differentes"
  CHECK ("domicile_id" <> "exterieur_id");

-- Un score est absent (NULL) ou positif. En SQL, une comparaison avec NULL
-- ne vaut ni vrai ni faux : une contrainte CHECK laisse donc passer NULL, ce
-- qui est exactement le comportement voulu pour un match pas encore joue.
ALTER TABLE "matchs"
  ADD CONSTRAINT "matchs_scores_positifs"
  CHECK ("score_domicile" >= 0 AND "score_exterieur" >= 0);
```

Puis on l'applique, et on régénère le client pour le § 4.1 :

```
npx prisma migrate dev
npx prisma generate
```

Sortie réelle :

```
Applying migration `20260917163241_contraintes_matchs`

The following migration(s) have been applied:

migrations/
  └─ 20260917163241_contraintes_matchs/
    └─ migration.sql

Your database is now in sync with your schema.
```

Une vérification s'impose : Prisma ne connaît pas ces contraintes, va-t-il vouloir les **supprimer** à la prochaine migration, pour « réaligner » la base sur le schéma ? Relancer la commande répond à la question :

```
npx prisma migrate dev
-> Already in sync, no schema change or pending migration was found.
```

Prisma ignore les contraintes `CHECK` qu'il ne gère pas : elles sont là pour de bon.

> **Rappel de l'étape 6.** Cette migration est désormais appliquée et versionnée. Si une erreur y était découverte plus tard, on écrirait une **nouvelle** migration corrective — jamais on ne modifierait celle-ci.

### 4.3 Valider le corps des requêtes

Un nouveau dossier, `backend/src/validation/`, regroupe tout ce qui vérifie les données entrantes. Il commence par les outils communs, dans `validation.ts` :

```ts
/** Une erreur rattachee a un champ precis, pour pouvoir l'afficher a cote. */
export interface ErreurChamp {
  champ: string;
  message: string;
}

/**
 * Le resultat d'une validation : SOIT des donnees propres, SOIT des erreurs.
 *
 * Le « <T> » est un parametre de type -- une case vide, remplie au moment de
 * l'utilisation : ResultatValidation<Competition>, ResultatValidation<DonneesMatch>.
 * Le meme principe que dans Promise<Competition[]> ou Observable<Match[]>.
 *
 * La barre verticale fait de ce type une UNION DISCRIMINEE : la propriete
 * « valide » indique laquelle des deux formes on a entre les mains. Apres un
 * « if (resultat.valide) », TypeScript sait que « donnees » existe ; dans le
 * « else », il sait que c'est « erreurs ». Impossible d'utiliser des donnees
 * sans avoir d'abord verifie qu'elles sont valides.
 */
export type ResultatValidation<T> =
  | { valide: true; donnees: T }
  | { valide: false; erreurs: ErreurChamp[] };
```

Deux notions nouvelles se cachent dans ces quelques lignes.

Le **type générique** `ResultatValidation<T>` est un type à trou. Le `T` sera remplacé par un vrai type à chaque utilisation. Tu en utilises depuis l'étape 5 sans les avoir nommés : `Observable<Competition[]>` est un `Observable` dont le trou a été rempli par `Competition[]`.

L'**union discriminée** est une union dont chaque forme porte une propriété commune — ici `valide` — avec une valeur différente. Tester cette propriété suffit à TypeScript pour savoir de quelle forme il s'agit :

```ts
const validation = validerNouvelleCompetition(requete.body);

if (!validation.valide) {
  // Ici, TypeScript sait que validation.erreurs existe...
  repondreDonneesInvalides(reponse, validation.erreurs);
  return;
}

// ... et ici, que validation.donnees existe.
await insererCompetition(validation.donnees);
```

Vient ensuite la lecture d'un texte obligatoire :

```ts
export function lireTexte(
  corps: Record<string, unknown>,
  champ: string,
  longueurMax: number,
  erreurs: ErreurChamp[],
): string {
  const valeur = corps[champ];

  // « typeof » d'abord : une valeur 42 ou null n'a pas de methode trim(),
  // et l'appeler ferait planter la requete.
  if (typeof valeur !== 'string' || valeur.trim() === '') {
    erreurs.push({ champ, message: 'Ce champ est obligatoire.' });
    return '';
  }

  const nettoyee = valeur.trim();

  // Une limite de longueur n'est pas une coquetterie : sans elle, un client
  // pourrait envoyer un nom de plusieurs megaoctets et remplir la base.
  if (nettoyee.length > longueurMax) {
    erreurs.push({ champ, message: `${longueurMax} caractères maximum.` });
  }

  return nettoyee;
}
```

Remarque que la fonction **ne s'arrête pas** à la première erreur : elle l'ajoute à la liste et continue. Un formulaire qui contient trois fautes reçoit les trois messages d'un coup, au lieu de les découvrir une par une à chaque nouvel essai.

La validation d'une compétition, dans `competition.validation.ts`, montre la **liste blanche** du § 2.3 :

```ts
const FORMAT_IDENTIFIANT = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const UNIVERS_VALIDES: Univers[] = ['esport', 'football'];

export function validerDonneesCompetition(corps: unknown): ResultatValidation<DonneesCompetition> {
  if (!estObjet(corps)) {
    return { valide: false, erreurs: [CORPS_ABSENT] };
  }

  const erreurs: ErreurChamp[] = [];

  const nom = lireTexte(corps, 'nom', 80, erreurs);
  const organisateur = lireTexte(corps, 'organisateur', 80, erreurs);
  const description = lireTexte(corps, 'description', 500, erreurs);

  const univers = corps['univers'];
  if (!UNIVERS_VALIDES.includes(univers as Univers)) {
    erreurs.push({ champ: 'univers', message: 'Univers attendu : esport ou football.' });
  }

  if (erreurs.length > 0) {
    return { valide: false, erreurs };
  }

  return {
    valide: true,
    // L'objet est RECONSTRUIT champ par champ : tout ce que le client aurait
    // ajoute d'autre (« id », « role »...) reste a la porte.
    donnees: { nom, organisateur, univers: univers as Univers, description },
  };
}
```

`FORMAT_IDENTIFIANT` est une **expression régulière** : un motif décrivant la forme d'un texte. Elle se lit ainsi :

| Morceau | Sens |
|---|---|
| `^` … `$` | du tout début à la toute fin du texte — rien avant, rien après |
| `[a-z0-9]+` | une ou plusieurs minuscules ou chiffres |
| `(-[a-z0-9]+)*` | puis, zéro ou plusieurs fois : un tiret suivi de minuscules ou chiffres |

`coupe-de-france` passe ; `Coupe De France`, `-lol` et `lol-` sont refusés. Cette rigueur a une raison : l'identifiant apparaît dans les adresses (`/api/competitions/ligue1`) et dans le CSS du frontend (`[data-competition='lol']`), où un espace ou un accent causerait des problèmes difficiles à comprendre.

La validation d'un match, dans `match.validation.ts`, ajoute les règles qui portent sur **plusieurs champs à la fois** — chaque champ peut être correct pris isolément, et l'ensemble incohérent :

```ts
/**
 * Date au format ISO 8601 AVEC fuseau horaire : « Z » (UTC) ou « +02:00 ».
 */
const FORMAT_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

// --- 2. Les regles qui portent sur PLUSIEURS champs a la fois -----------

if (domicileId !== '' && domicileId === exterieurId) {
  erreurs.push({ champ: 'exterieurId', message: 'Une équipe ne peut pas se rencontrer elle-même.' });
}

if (statut === 'a-venir' && (scoreDomicile !== null || scoreExterieur !== null)) {
  erreurs.push({ champ: 'statut', message: "Un match à venir n'a pas encore de score." });
}

if ((statut === 'en-direct' || statut === 'termine') && (scoreDomicile === null || scoreExterieur === null)) {
  erreurs.push({ champ: 'statut', message: 'Un match en cours ou terminé doit avoir ses deux scores.' });
}
```

Dans `FORMAT_DATE`, `\d{4}` signifie « exactement quatre chiffres », et la fin `(Z|[+-]\d{2}:\d{2})` impose le fuseau : soit la lettre `Z`, soit un signe suivi de `hh:mm`.

Un score se lit avec `Number.isInteger`, qui refuse d'un seul coup le texte `"2"`, la valeur `2.5` et `NaN` :

```ts
function lireScore(corps: Record<string, unknown>, champ: string, erreurs: ErreurChamp[]): number | null {
  const valeur = corps[champ];

  if (valeur === undefined || valeur === null) {
    return null;
  }

  if (!Number.isInteger(valeur) || (valeur as number) < 0 || (valeur as number) > SCORE_MAX) {
    erreurs.push({ champ, message: `Entier entre 0 et ${SCORE_MAX} attendu.` });
    return null;
  }

  return valeur as number;
}
```

`STATUTS_VALIDES` et `estStatutValide`, écrits dans le contrôleur des matchs à l'étape 4, ont déménagé dans ce fichier : ils servent désormais à deux endroits, le filtre `?statut=` et la validation d'un match.

> **Et les bibliothèques de validation ?** Des outils comme **Zod** permettent de décrire ces règles de façon plus compacte, et sont très utilisés en production. Le projet écrit la validation à la main à cette étape pour que chaque vérification soit visible et comprise. L'étape 14 (refactoring) sera l'occasion de se demander si un tel outil apporterait quelque chose.

### 4.4 Les écritures dans les dépôts

Le petit fichier `depots/erreurs-prisma.ts` rassemble les codes observés au § 2.4 :

```ts
import { Prisma } from '../generated/prisma/client';

export const CODE_PRISMA = {
  /** Une valeur qui doit etre unique existe deja (ici : l'identifiant). */
  valeurDejaPrise: 'P2002',

  /**
   * Une cle etrangere n'est pas respectee. Deux situations produisent ce code :
   *   - creer un match dont la competition n'existe pas ;
   *   - supprimer une competition dont des matchs dependent encore.
   */
  cleEtrangere: 'P2003',

  /** La ligne a modifier ou a supprimer n'existe pas. */
  introuvable: 'P2025',
} as const;

/**
 * L'erreur recue est-elle une erreur Prisma portant ce code ?
 *
 * « instanceof » verifie de quelle CLASSE un objet est issu. Une erreur peut
 * venir de n'importe ou -- reseau coupe, bug dans notre code -- et seules les
 * erreurs connues de Prisma portent un code a interpreter.
 */
export function aLeCodePrisma(erreur: unknown, code: string): boolean {
  return erreur instanceof Prisma.PrismaClientKnownRequestError && erreur.code === code;
}
```

Écrire `CODE_PRISMA.introuvable` plutôt que `'P2025'` dans les dépôts rend le code lisible sans documentation à côté.

Les trois écritures de `competitions.depot.ts` suivent toutes le même moule — essayer, interpréter un refus prévisible, relancer le reste :

```ts
/** INSERT : cree une competition. */
export async function insererCompetition(
  competition: Competition,
): Promise<Competition | 'identifiant-pris'> {
  try {
    // Le « await » n'est pas superflu. Sans lui, la fonction renverrait la
    // promesse AVANT qu'elle n'echoue, en sortant du bloc try : l'erreur
    // surviendrait ensuite, hors de portee du catch ci-dessous.
    return await prisma.competition.create({ data: competition });
  } catch (erreur) {
    // On ne verifie PAS l'existence avant de creer (« findUnique puis
    // create ») : entre les deux requetes, quelqu'un d'autre pourrait creer
    // le meme identifiant. C'est la base, seule a voir toutes les ecritures,
    // qui tranche -- et on interprete son refus.
    if (aLeCodePrisma(erreur, CODE_PRISMA.valeurDejaPrise)) {
      return 'identifiant-pris';
    }
    throw erreur;
  }
}

/** DELETE : supprime une competition. */
export async function effacerCompetition(id: string): Promise<'effacee' | 'introuvable' | 'utilisee'> {
  try {
    await prisma.competition.delete({ where: { id } });
    return 'effacee';
  } catch (erreur) {
    if (aLeCodePrisma(erreur, CODE_PRISMA.introuvable)) {
      return 'introuvable';
    }
    // La cle etrangere de matchs.competition_id est en « ON DELETE RESTRICT »
    // (voir la migration de l'etape 6) : PostgreSQL refuse de supprimer une
    // competition tant que des matchs y font reference.
    if (aLeCodePrisma(erreur, CODE_PRISMA.cleEtrangere)) {
      return 'utilisee';
    }
    throw erreur;
  }
}
```

Le commentaire sur `return await` décrit un piège réel. Une fonction `async` qui écrit `return prisma.competition.create(...)` **sans** `await` renvoie la promesse encore en cours, et quitte le bloc `try` immédiatement. Quand la base refuse, quelques millisecondes plus tard, le `catch` n'est plus là pour l'attraper : l'erreur remonte telle quelle jusqu'au gestionnaire d'erreurs, qui répond `500` au lieu de `409`.

Le `throw erreur` final **relance** toute erreur non reconnue. L'avaler en silence serait pire que tout : une base injoignable ressemblerait à une réussite.

**Pourquoi refuser la suppression plutôt que supprimer en cascade ?** La clé étrangère de l'étape 6 est en `ON DELETE RESTRICT`. L'alternative, `ON DELETE CASCADE`, supprimerait automatiquement tous les matchs de la compétition. C'est parfois le bon choix — supprimer un compte utilisateur supprime souvent ses préférences — mais ici, un clic malheureux effacerait tout l'historique d'une compétition. Le projet préfère obliger à supprimer les matchs d'abord : une action destructrice ne doit pas en entraîner d'autres en silence.

Dans `matchs.depot.ts`, quatre fonctions renvoient désormais un match. La traduction de l'étape 6, qui vivait dans `listerMatchs`, est donc isolée dans une fonction, avec son chemin inverse :

```ts
const AVEC_EQUIPES = { domicile: true, exterieur: true } as const;

/** Une ligne de la table matchs, accompagnee de ses deux equipes. */
type LigneMatch = Prisma.MatchGetPayload<{ include: typeof AVEC_EQUIPES }>;

/** Traduit une ligne de la base en match tel que l'API l'expose. */
function versApi(ligne: LigneMatch): Match {
  return {
    id: ligne.id,
    competitionId: ligne.competitionId,
    domicile: ligne.domicile,
    exterieur: ligne.exterieur,
    scoreDomicile: ligne.scoreDomicile,
    scoreExterieur: ligne.scoreExterieur,
    date: ligne.date.toISOString(),
    statut: VERS_L_API[ligne.statut],
  };
}

/** Le chemin inverse : des donnees validees vers les colonnes de la base. */
function versLaBase(donnees: DonneesMatch) {
  return {
    competitionId: donnees.competitionId,
    domicileId: donnees.domicileId,
    exterieurId: donnees.exterieurId,
    scoreDomicile: donnees.scoreDomicile,
    scoreExterieur: donnees.scoreExterieur,
    date: new Date(donnees.date),
    statut: VERS_LA_BASE[donnees.statut],
  };
}
```

`Prisma.MatchGetPayload<…>` demande à Prisma : « quel est le type exact d'un match lu **avec** cet `include` ? ». Plutôt que de décrire ce type à la main — et de devoir le corriger à chaque changement du schéma —, on le laisse le calculer.

La création utilise les deux traductions :

```ts
export async function insererMatch(donnees: DonneesMatch): Promise<Match | 'reference-inconnue'> {
  try {
    const ligne = await prisma.match.create({
      data: versLaBase(donnees),
      // include fonctionne aussi a l'ecriture : Prisma renvoie le match cree
      // AVEC ses equipes, sans seconde requete.
      include: AVEC_EQUIPES,
    });
    return versApi(ligne);
  } catch (erreur) {
    if (aLeCodePrisma(erreur, CODE_PRISMA.cleEtrangere)) {
      return 'reference-inconnue';
    }
    throw erreur;
  }
}
```

Enfin, `equipes.depot.ts` expose la liste des équipes, **en lecture seule** : le formulaire de match en a besoin pour proposer un choix plutôt que de faire saisir un identifiant.

### 4.5 Les contrôleurs et les routes

Les trois contrôleurs d'écriture suivent le même déroulé, toujours dans le même ordre :

```mermaid
flowchart LR
    R(["Requete"]) --> V{"1. Valider<br/>le corps"}
    V -->|"refuse"| E400["400"]
    V -->|"accepte"| D["2. Ecrire<br/>via le depot"]
    D --> T{"3. Traduire<br/>le resultat"}
    T -->|"introuvable"| E404["404"]
    T -->|"conflit"| E409["409"]
    T -->|"reussite"| OK["201 / 200 / 204"]

    style E400 fill:#fdf3f3,color:#6b4545
    style E404 fill:#fdf3f3,color:#6b4545
    style E409 fill:#fdf3f3,color:#6b4545
    style OK fill:#2563b0,color:#fff
```

L'ordre compte : on ne sollicite jamais la base avec des données qu'on n'a pas vérifiées.

Le contrôleur de création, dans `competitions.controleur.ts` :

```ts
/** POST /api/competitions  ->  cree une competition. */
export async function creerCompetition(
  requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    const validation = validerNouvelleCompetition(requete.body);

    if (!validation.valide) {
      repondreDonneesInvalides(reponse, validation.erreurs);
      return;
    }

    const resultat = await insererCompetition(validation.donnees);

    if (resultat === 'identifiant-pris') {
      // 409 = « conflit avec l'etat actuel des donnees ». La requete est
      // bien formee -- c'est la situation qui l'empeche d'aboutir.
      reponse.status(409).json({
        erreur: 'Cet identifiant est déjà utilisé',
        id: validation.donnees.id,
      });
      return;
    }

    // 201 = « cree ». L'en-tete Location indique l'adresse de la nouvelle
    // ressource : une convention REST, qui evite au client de la deviner.
    reponse.status(201).location(`/api/competitions/${resultat.id}`).json(resultat);
  } catch (erreur) {
    suivant(erreur);
  }
}
```

Et celui de suppression, qui distingue les deux échecs possibles :

```ts
/** DELETE /api/competitions/:id  ->  supprime une competition. */
export async function supprimerCompetition(
  requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    const identifiant = lireIdentifiant(requete);
    const resultat = await effacerCompetition(identifiant);

    if (resultat === 'introuvable') {
      reponse.status(404).json({ erreur: 'Compétition introuvable', id: identifiant });
      return;
    }

    if (resultat === 'utilisee') {
      reponse.status(409).json({
        erreur: 'Cette compétition contient encore des matchs. Supprime-les d’abord.',
        id: identifiant,
      });
      return;
    }

    // 204 = « fait, et je n'ai rien a te renvoyer ». La competition n'existe
    // plus : il n'y a rien a decrire. « end() » termine la reponse sans corps.
    reponse.status(204).end();
  } catch (erreur) {
    suivant(erreur);
  }
}
```

Sept contrôleurs lisent désormais un `:id` dans l'adresse, et quatre renvoient des erreurs de validation. Ces deux gestes répétés sont regroupés dans `controleurs/outils.ts` :

```ts
export function lireIdentifiant(requete: Request): string {
  const brut = requete.params['id'];
  return typeof brut === 'string' ? brut : '';
}

export function repondreDonneesInvalides(reponse: Response, erreurs: ErreurChamp[]): void {
  reponse.status(400).json({
    erreur: 'Données invalides',
    details: erreurs,
  });
}
```

Côté routes, **la même adresse** mène désormais à plusieurs contrôleurs. C'est la méthode HTTP qui les départage — l'adresse désigne *quoi*, la méthode dit *quoi en faire* :

```ts
export const routeurCompetitions = Router();

routeurCompetitions.get('/', obtenirCompetitions); //      lire la liste
routeurCompetitions.post('/', creerCompetition); //        ajouter a la liste

routeurCompetitions.get('/:id', obtenirCompetition); //    lire un element
routeurCompetitions.put('/:id', modifierCompetition); //   remplacer un element
routeurCompetitions.delete('/:id', supprimerCompetition); // supprimer un element
```

`matchs.routes.ts` suit le même schéma, et `routes/index.ts` branche le nouveau routeur des équipes :

```ts
routeurApi.use('/competitions', routeurCompetitions);
routeurApi.use('/matchs', routeurMatchs);
routeurApi.use('/equipes', routeurEquipes);
```

### 4.6 Le JSON mal formé

Les écritures font apparaître un défaut hérité de l'étape 4. Un corps qui n'est pas du JSON valide — une virgule en trop suffit — aboutissait au gestionnaire d'erreurs générique, et donc à un `500 Erreur interne du serveur`. C'est faux : le serveur va très bien, c'est la **requête** qui est mal écrite.

L'explication : `express.json()` échoue **avant** d'atteindre nos contrôleurs, et transmet son erreur directement au gestionnaire d'erreurs. Celui-ci la traite désormais à part, dans `middlewares/erreurs.ts` :

```ts
  /*
   * Etape 7 : un cas particulier qui n'est PAS une erreur du serveur.
   *
   * Si un client envoie un corps qui n'est pas du JSON valide (une virgule en
   * trop, un guillemet oublie), express.json() echoue avant meme d'atteindre
   * nos controleurs, et transmet son erreur ici. Sans ce test, le client
   * recevrait un 500 -- « le serveur a un probleme » --, ce qui est faux :
   * c'est la requete qui est mal ecrite. Le bon code est 400.
   *
   * express.json() signale ce cas en posant type = 'entity.parse.failed'.
   */
  if ('type' in erreur && erreur.type === 'entity.parse.failed') {
    reponse.status(400).json({
      erreur: "Le corps de la requête n'est pas du JSON valide",
    });
    return;
  }

  // Meme logique pour un corps qui depasse la limite fixee dans app.ts.
  // 413 = « contenu trop volumineux ».
  if ('type' in erreur && erreur.type === 'entity.too.large') {
    reponse.status(413).json({
      erreur: 'Le corps de la requête est trop volumineux',
    });
    return;
  }
```

La limite elle-même est rendue visible dans `app.ts` :

```ts
  // « limit » plafonne la taille d'un corps. 100 Ko est deja la valeur par
  // defaut : l'ecrire la rend visible, au lieu de dependre d'un reglage
  // cache.
  app.use(express.json({ limit: '100kb' }));
```

### 4.7 Tester l'API

Avant d'écrire la moindre ligne d'interface, l'API est testée seule — avec `curl` ou **Thunder Client**. Si un formulaire ne fonctionne pas plus tard, on saura que le problème n'est pas côté serveur.

Pour une requête d'écriture dans Thunder Client : choisir la méthode (`POST`, `PUT`, `DELETE`) dans la liste à gauche de l'adresse, puis ouvrir l'onglet **Body**, sélectionner **JSON** et y coller le corps. Thunder Client ajoute lui-même l'en-tête `Content-Type`.

> **Piège rencontré sous Windows.** Avec `curl` lancé depuis Git Bash, les accents passés dans `-d '{"nom":"Fédération"}'` arrivent corrompus au serveur (`F�d�ration`) : le terminal les transmet dans un autre encodage que l'UTF-8. La solution est d'écrire le corps dans un fichier et de l'envoyer avec `--data-binary @corps.json` — ou d'utiliser Thunder Client, qui n'a pas ce problème.

Résultats réels, dans l'ordre où ils ont été joués — le scénario crée des données, les modifie, puis les supprime, et la base termine dans son état de départ :

```
POST /api/competitions   {"id":"coupe-de-france", ..., "role":"admin"}
-> 201 Created   Location: /api/competitions/coupe-de-france
   (le champ « role » n'apparait nulle part dans la reponse : liste blanche)

POST /api/competitions   meme identifiant
-> 409 {"erreur":"Cet identifiant est déjà utilisé","id":"coupe-de-france"}

POST /api/competitions   {"id":"Coupe De France","nom":"","univers":"basket","description":"x"}
-> 400 {"erreur":"Données invalides","details":[
         {"champ":"id","message":"Minuscules, chiffres et tirets uniquement (exemple : coupe-de-france)."},
         {"champ":"nom","message":"Ce champ est obligatoire."},
         {"champ":"organisateur","message":"Ce champ est obligatoire."},
         {"champ":"univers","message":"Univers attendu : esport ou football."}]}

POST /api/competitions   sans corps
-> 400 {"erreur":"Données invalides","details":[
         {"champ":"corps","message":"Le corps de la requête doit être un objet JSON."}]}

POST /api/competitions   {"id": "x",}
-> 400 {"erreur":"Le corps de la requête n'est pas du JSON valide"}

POST /api/competitions   corps de 200 Ko
-> 413 {"erreur":"Le corps de la requête est trop volumineux"}

PUT /api/competitions/coupe-de-france   {"id":"pirate","nom":"Coupe de France", ...}
-> 200 {"id":"coupe-de-france","nom":"Coupe de France","organisateur":"Fédération française de football", ...}
   (l'identifiant n'a pas bougé : « id » ne fait pas partie de la liste blanche)

PUT /api/competitions/zzz
-> 404 {"erreur":"Compétition introuvable","id":"zzz"}

DELETE /api/competitions/lol
-> 409 {"erreur":"Cette compétition contient encore des matchs. Supprime-les d’abord.","id":"lol"}

GET /api/equipes
-> 200 [{"id":"asm","nom":"AS Monaco","trigramme":"ASM"},{"id":"fcb","nom":"Bayern Munich", ...}]  (14 equipes)

POST /api/matchs   {"competitionId":"coupe-de-france","domicileId":"psg","exterieurId":"ol",
                    "date":"2026-09-20T19:00:00.000Z","statut":"a-venir"}
-> 201 Created   Location: /api/matchs/8700ad21-6d5a-4bb8-bf70-0d713f075b37
   {"id":"8700ad21-6d5a-4bb8-bf70-0d713f075b37", ...,"domicile":{"id":"psg","nom":"Paris Saint-Germain", ...}}

POST /api/matchs   {"competitionId":"lol","domicileId":"kc","exterieurId":"kc",
                    "date":"2026-09-20T19:00","statut":"termine","scoreDomicile":2.5}
-> 400 {"erreur":"Données invalides","details":[
         {"champ":"date","message":"Date ISO 8601 avec fuseau attendue (exemple : 2026-09-15T18:00:00.000Z)."},
         {"champ":"scoreDomicile","message":"Entier entre 0 et 999 attendu."},
         {"champ":"exterieurId","message":"Une équipe ne peut pas se rencontrer elle-même."},
         {"champ":"statut","message":"Un match en cours ou terminé doit avoir ses deux scores."}]}

POST /api/matchs   {"competitionId":"echecs", ...}
-> 400 {"erreur":"La compétition ou l'une des équipes indiquées n'existe pas"}

PUT /api/matchs/8700ad21-…   statut en-direct, 1 - 0
-> 200 {..."scoreDomicile":1,"scoreExterieur":0,..."statut":"en-direct"}

DELETE /api/competitions/coupe-de-france      (le match existe encore)
-> 409

DELETE /api/matchs/8700ad21-…                 -> 204 No Content
DELETE /api/matchs/8700ad21-…   (de nouveau)  -> 404 {"erreur":"Match introuvable", ...}
DELETE /api/competitions/coupe-de-france      -> 204 No Content
```

La requête de match incohérent illustre l'intérêt de collecter **toutes** les erreurs : quatre problèmes, quatre messages, en une seule réponse.

**Le CORS et la requête de pré-vérification.** Un navigateur ne se contente pas d'envoyer un `PUT` ou un `DELETE` vers une autre origine : il demande d'abord la permission, avec une requête `OPTIONS` dite de **pré-vérification** (*preflight*). Le paquet `cors` de l'étape 5 y répond déjà :

```
OPTIONS /api/matchs/m1
Origin: http://localhost:4200
Access-Control-Request-Method: PUT

-> 204 No Content
   Access-Control-Allow-Origin: http://localhost:4200
   Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
```

> **Ce que le CORS ne protège pas.** Toutes les requêtes ci-dessus ont été envoyées avec `curl`, qui ignore complètement le CORS — c'est une règle des navigateurs uniquement (étape 5). **N'importe qui peut donc, en ce moment, supprimer des matchs de l'API.** C'est une faille connue et assumée à cette étape : l'authentification de l'étape 8 la comblera.

### 4.8 Les services Angular

Chaque opération devient une méthode du service, qui correspond à une route du backend. Dans `services/competition.ts` :

```ts
  /*
   * Etape 7 : une methode par operation. Chacune correspond a une methode
   * HTTP, et donc a une route du backend :
   *
   *   trouver    GET     /api/competitions/:id
   *   creer      POST    /api/competitions
   *   modifier   PUT     /api/competitions/:id
   *   supprimer  DELETE  /api/competitions/:id
   */

  /** GET /api/competitions/:id -- pour pre-remplir le formulaire de modification. */
  trouver(id: string): Observable<Competition> {
    return this.http.get<Competition>(this.adresse(id));
  }

  /**
   * POST /api/competitions
   *
   * Le deuxieme argument de post() est le CORPS de la requete. HttpClient le
   * convertit en JSON et ajoute lui-meme l'en-tete
   * « Content-Type: application/json » -- sans lequel express.json() ne lirait
   * rien cote serveur.
   */
  creer(competition: Competition): Observable<Competition> {
    return this.http.post<Competition>(this.url, competition);
  }

  /** PUT /api/competitions/:id -- le serveur renvoie la competition a jour. */
  modifier(id: string, donnees: DonneesCompetition): Observable<Competition> {
    return this.http.put<Competition>(this.adresse(id), donnees);
  }

  /**
   * DELETE /api/competitions/:id
   *
   * Le serveur repond 204, sans corps : il n'y a rien a lire. Observable<void>
   * le dit explicitement -- on attend seulement de savoir si ca a reussi.
   */
  supprimer(id: string): Observable<void> {
    return this.http.delete<void>(this.adresse(id));
  }

  /**
   * encodeURIComponent protege l'adresse : un identifiant contenant « / » ou
   * « ? » en changerait sinon le sens.
   */
  private adresse(id: string): string {
    return `${this.url}/${encodeURIComponent(id)}`;
  }
```

`DonneesCompetition` est défini dans le modèle comme `Omit<Competition, 'id'>` : tout sauf l'identifiant, qui figure déjà dans l'adresse.

Le service des matchs applique la leçon de l'étape 5 **dans les deux sens**. À l'aller, la `Date` redevient du texte ; au retour, le match créé repasse par `convertir()` :

```ts
  creer(donnees: DonneesMatch): Observable<Match> {
    return this.http
      .post<MatchApi>(this.url, this.versApi(donnees))
      .pipe(map((match) => this.convertir(match)));
  }

  /**
   * toISOString() produit toujours de l'UTC avec le suffixe « Z » :
   * « 2026-09-15T16:00:00.000Z ». Le backend exige ce fuseau explicite, et
   * c'est exactement ce qu'il recoit -- quel que soit le fuseau du navigateur.
   */
  private versApi(donnees: DonneesMatch) {
    return { ...donnees, date: donnees.date.toISOString() };
  }
```

Un nouveau service, `EquipeService`, se contente de `GET /api/equipes`.

### 4.9 Le formulaire de match

Le composant `pages/match-formulaire/` sert **deux adresses** : `/matchs/nouveau` (formulaire vide, envoi en `POST`) et `/matchs/:id/modifier` (formulaire pré-rempli, envoi en `PUT`). Les deux cas partagent tous leurs champs et toutes leurs règles ; deux composants reviendraient à maintenir deux copies qui finiraient par diverger.

**Savoir dans quel mode on est.** Le composant lit l'adresse au moment où il est créé :

```ts
  private readonly route = inject(ActivatedRoute);

  /**
   * L'identifiant lu dans l'adresse, ou null sur /matchs/nouveau.
   *
   * « snapshot » est une photographie de la route au moment ou le composant
   * est cree. Elle suffit ici : pour passer d'un match a un autre, on repasse
   * toujours par la liste, ce qui recree le composant.
   */
  readonly idMatch = this.route.snapshot.paramMap.get('id');
  readonly enModification = this.idMatch !== null;
```

**Le modèle et le schéma.** Le modèle ne contient pas encore un `DonneesMatch` : ce sont les valeurs **telles que les champs les manipulent**. La date y est le texte du champ, et `''` signifie « pas encore choisi ».

```ts
interface ChampsMatch {
  competitionId: string;
  domicileId: string;
  exterieurId: string;
  date: string;
  statut: StatutMatch;
  scoreDomicile: number | null;
  scoreExterieur: number | null;
}
```

Le schéma déclare les règles, qui reprennent celles du backend :

```ts
  readonly formulaire = form(
    this.champs,
    (chemin) => {
      required(chemin.competitionId, { message: 'Choisis une compétition.' });
      required(chemin.domicileId, { message: "Choisis l'équipe qui reçoit." });
      required(chemin.exterieurId, { message: "Choisis l'équipe qui se déplace." });
      required(chemin.date, { message: 'Indique la date et l’heure du match.' });

      // Une regle qui compare DEUX champs. valueOf() lit la valeur d'un autre
      // champ ; comme tout est signal, la regle est reevaluee quand l'un ou
      // l'autre change.
      validate(chemin.exterieurId, ({ value, valueOf }) =>
        value() !== '' && value() === valueOf(chemin.domicileId)
          ? { kind: 'equipes-identiques', message: 'Une équipe ne peut pas se rencontrer elle-même.' }
          : undefined,
      );

      // Les memes regles s'appliquent aux deux scores : une boucle evite de
      // les ecrire deux fois.
      for (const score of [chemin.scoreDomicile, chemin.scoreExterieur]) {
        // Un match a venir n'a pas de score : le champ est MASQUE. Signal
        // Forms ignore les regles d'un champ masque -- sans quoi un -1 tape
        // avant de repasser en « A venir » bloquerait l'envoi, sur un champ
        // devenu invisible.
        hidden(score, ({ valueOf }) => valueOf(chemin.statut) === 'a-venir');

        required(score, { message: 'Score obligatoire pour un match en cours ou terminé.' });
        min(score, 0, { message: 'Un score ne peut pas être négatif.' });
        max(score, 999, { message: '999 au maximum.' });
        validate(score, ({ value }) =>
          value() !== null && !Number.isInteger(value())
            ? { kind: 'entier', message: 'Nombre entier attendu.' }
            : undefined,
        );
      }
    },
    {
      submission: {
        // Appelee UNIQUEMENT si toutes les regles ci-dessus sont respectees.
        // Sinon, Signal Forms marque tous les champs comme touches, et leurs
        // erreurs s'affichent.
        action: () => this.enregistrer(),
      },
    },
  );
```

`required`, `min` et `max` sont des règles toutes faites. `validate` permet d'écrire les siennes : la fonction reçoit le contexte du champ, et renvoie soit une erreur — un objet avec un `kind` (un nom de code) et un `message` —, soit `undefined` si tout va bien.

Le gabarit relit la règle `hidden()` plutôt que de la réécrire :

```ts
  readonly scoresVisibles = computed(() => !this.formulaire.scoreDomicile().hidden());
```

**Le chargement.** Le formulaire a besoin de trois ressources en parallèle — `forkJoin`, comme à l'étape 5 :

```ts
    forkJoin({
      competitions: this.competitionService.listerToutes(),
      equipes: this.equipeService.listerToutes(),
      match: this.idMatch === null ? of(null) : this.matchService.trouver(this.idMatch),
    }).subscribe({
      next: ({ competitions, equipes, match }) => {
        this.competitions.set(competitions);
        this.equipes.set(equipes);
        if (match !== null) {
          this.champs.set(this.versChamps(match));
        }
        this.chargement.set(false);
      },
      // ...
    });
```

`of(null)` est un Observable qui émet `null` immédiatement : il tient la place de la troisième requête quand il n'y a rien à charger. Et `this.champs.set(...)` suffit à pré-remplir **tous** les champs d'un coup, puisqu'ils sont reliés au signal.

**La soumission.** Signal Forms attend de l'action une **Promise**, pas un Observable : c'est ainsi qu'il sait quand l'envoi se termine, et qu'il gère seul l'état `submitting()`.

```ts
  private async enregistrer(): Promise<void> {
    this.erreurEnregistrement.set(null);

    const donnees = this.versDonnees(this.champs());
    const requete =
      this.idMatch === null
        ? this.matchService.creer(donnees)
        : this.matchService.modifier(this.idMatch, donnees);

    try {
      await firstValueFrom(requete);
    } catch (erreur) {
      // Le serveur a refuse, ou n'a pas repondu. On l'affiche au-dessus des
      // boutons : la personne garde sa saisie et peut reessayer.
      this.erreurEnregistrement.set(messageErreurApi(erreur, "L'enregistrement a échoué."));
      return;
    }

    // Hors du try : si le changement de page echouait, ce ne serait pas un
    // echec de l'enregistrement -- qui, lui, a bien eu lieu.
    await this.router.navigate(['/matchs']);
  }
```

`firstValueFrom()` fait le pont entre les deux mondes : il transforme l'Observable de `HttpClient` en Promise, qu'on attend avec `await` — exactement comme les contrôleurs du backend attendent la base depuis l'étape 6.

`router.navigate(['/matchs'])` change de page **depuis le code**, là où `routerLink` le fait depuis un lien du gabarit.

La conversion vers les données envoyées rattrape un dernier cas :

```ts
  private versDonnees(champs: ChampsMatch): DonneesMatch {
    // Un match a venir n'a pas de score, meme si l'on en avait tape un avant
    // de changer le statut : les champs masques ne doivent rien envoyer.
    const aVenir = champs.statut === 'a-venir';

    return {
      competitionId: champs.competitionId,
      domicileId: champs.domicileId,
      exterieurId: champs.exterieurId,
      date: depuisChampDateHeure(champs.date),
      statut: champs.statut,
      scoreDomicile: aVenir ? null : champs.scoreDomicile,
      scoreExterieur: aVenir ? null : champs.scoreExterieur,
    };
  }
```

**Le gabarit.** Un champ complet ressemble à ceci :

```html
<div class="champ">
  <label class="champ-libelle" for="match-competition">Compétition</label>
  <select
    id="match-competition"
    class="champ-saisie"
    [formField]="formulaire.competitionId"
    aria-describedby="match-competition-erreurs"
    [attr.aria-invalid]="erreursVisibles(formulaire.competitionId())"
  >
    <option value="">— Choisir une compétition —</option>
    @for (competition of competitions(); track competition.id) {
      <option [value]="competition.id">{{ competition.nom }}</option>
    }
  </select>
  <app-erreurs-champ
    [etat]="formulaire.competitionId()"
    identifiant="match-competition-erreurs"
  />
</div>
```

Le `for` du `<label>` reprend l'`id` du champ : cliquer sur le libellé place le curseur dans le champ, et un lecteur d'écran annonce le libellé en arrivant sur le champ. Les attributs `aria-*` sont détaillés au § 4.14.

Le statut utilise des **boutons radio** : trois choix seulement, tous visibles d'un coup d'œil. `<fieldset>` et `<legend>` les regroupent sous un même intitulé :

```html
<fieldset class="champ">
  <legend class="champ-libelle">Statut</legend>
  <div class="choix-groupe">
    @for (statut of statuts; track statut.valeur) {
      <label class="choix">
        <input type="radio" [value]="statut.valeur" [formField]="formulaire.statut" />
        {{ statut.libelle }}
      </label>
    }
  </div>
</fieldset>
```

La balise `<form>` et le bouton d'envoi :

```html
<form class="formulaire" [formRoot]="formulaire">
  <!-- ... les champs ... -->

  <div class="formulaire-actions">
    <button type="submit" class="bouton bouton--principal" [disabled]="formulaire().submitting()">
      {{ formulaire().submitting() ? 'Enregistrement…' : 'Enregistrer' }}
    </button>
    <a class="bouton bouton--secondaire" routerLink="/matchs">Annuler</a>
  </div>
</form>
```

`[formRoot]` empêche le comportement par défaut d'un formulaire HTML — recharger la page en envoyant les champs — et lance l'action à la place. Le bouton est désactivé pendant l'envoi : un double clic impatient ne créera pas deux matchs (§ 2.2, l'idempotence).

**La suppression en deux temps.** Une suppression est définitive : un clic malencontreux ne doit pas suffire.

```html
@if (!confirmationSuppression()) {
  <p class="zone-suppression-texte">La suppression est définitive.</p>
  <!-- type="button" : sans lui, un bouton place dans un formulaire le soumettrait. -->
  <button type="button" class="bouton bouton--danger" (click)="demanderSuppression()">
    Supprimer…
  </button>
} @else {
  <p class="zone-suppression-texte" role="alert">
    Supprimer définitivement ce match ? Cette action ne peut pas être annulée.
  </p>
  <div class="formulaire-actions">
    <button type="button" class="bouton bouton--danger" (click)="supprimer()" [disabled]="suppressionEnCours()">
      {{ suppressionEnCours() ? 'Suppression…' : 'Oui, supprimer' }}
    </button>
    <button type="button" class="bouton bouton--secondaire" (click)="annulerSuppression()">
      Non, conserver
    </button>
  </div>
}
```

Un signal, `confirmationSuppression`, suffit à basculer entre les deux états. Les points de suspension de « Supprimer… » sont une convention d'interface : ils annoncent qu'une étape supplémentaire suivra le clic.

`window.confirm()` aurait été plus court, mais il ouvre une boîte de dialogue du navigateur impossible à styliser, qui bloque toute la page — et que les tests automatiques ne savent pas manipuler.

### 4.10 Un composant qui reçoit des données : `ErreursChamp`

Sous chacun des onze champs des deux formulaires, le même bloc affiche les erreurs. Plutôt que de le recopier onze fois, il devient un petit composant, `composants/erreurs-champ/erreurs-champ.ts` — le premier du projet qui reçoit des données de son **parent** :

```ts
export function erreursVisibles(etat: ReadonlyFieldState<unknown>): boolean {
  return etat.touched() && etat.invalid();
}

@Component({
  selector: 'app-erreurs-champ',
  template: `
    <div [id]="identifiant()" class="champ-erreurs">
      @if (visibles()) {
        @for (erreur of etat().errors(); track $index) {
          <p class="champ-erreur">{{ erreur.message }}</p>
        }
      }
    </div>
  `,
})
export class ErreursChamp {
  /**
   * input.required() rend l'entree OBLIGATOIRE : oublier [etat] dans le
   * parent devient une erreur de compilation, et non un composant qui
   * n'affiche silencieusement rien.
   */
  readonly etat = input.required<ReadonlyFieldState<unknown>>();

  readonly identifiant = input.required<string>();

  readonly visibles = computed(() => erreursVisibles(this.etat()));
}
```

`input()` déclare une **entrée** du composant. Le parent la remplit comme un attribut :

```html
<app-erreurs-champ [etat]="formulaire.competitionId()" identifiant="match-competition-erreurs" />
```

Les crochets `[etat]` évaluent une expression TypeScript ; `identifiant` sans crochets transmet un simple texte. Côté enfant, une entrée se lit comme un signal : `this.etat()`.

```mermaid
flowchart LR
    P["<b>MatchFormulaire</b><br/>parent"]
    E["<b>ErreursChamp</b><br/>enfant"]
    P -->|"[etat] = etat du champ<br/>identifiant = texte"| E
    E -->|"affiche les messages<br/>si touche et invalide"| H["HTML"]

    style P fill:#12203a,color:#fff
    style E fill:#2563b0,color:#fff
```

Le gabarit est écrit **dans** le fichier TypeScript (`template:`) plutôt que dans un `.html` séparé : pour quelques lignes, un second fichier compliquerait la lecture.

Pourquoi n'afficher les erreurs qu'une fois le champ **touché** ? Parce qu'un formulaire vierge s'ouvrirait sinon couvert de « Ce champ est obligatoire », avant même qu'on ait tapé quoi que ce soit — désagréable, et vaguement culpabilisant. La soumission marque tous les champs comme touchés : c'est à ce moment que toutes les erreurs restantes apparaissent.

### 4.11 Le formulaire de compétition : identifiant figé et conflit

Le formulaire de compétition suit le même moule. Deux différences méritent l'attention.

**L'identifiant est figé en modification** — les matchs s'en servent comme référence :

```ts
      // L'identifiant est fige en modification. Un champ desactive n'est pas
      // valide par Signal Forms : ses regles ne bloquent donc pas l'envoi.
      disabled(chemin.id, () => this.enModification);

      required(chemin.id, { message: 'Choisis un identifiant court.' });
      maxLength(chemin.id, 30, { message: '30 caractères maximum.' });
      pattern(chemin.id, FORMAT_IDENTIFIANT, {
        message: 'Minuscules, chiffres et tirets uniquement (exemple : coupe-de-france).',
      });
```

`[formField]` pose de lui-même l'attribut `disabled` sur le champ HTML. Côté serveur, même si quelqu'un le réactivait dans les outils de développement, la liste blanche du § 2.3 ignorerait l'identifiant envoyé.

**Le conflit `409` s'affiche sous le champ concerné.** Seul le serveur peut savoir qu'un identifiant est déjà pris : le navigateur ne connaît pas la liste des compétitions existantes. L'action de soumission peut **renvoyer** une erreur rattachée à un champ :

```ts
  private async enregistrer(): Promise<TreeValidationResult> {
    this.erreurEnregistrement.set(null);

    const { id, univers, ...reste } = this.champs();
    // required() garantit qu'un univers a ete choisi : on le dit a TypeScript.
    const donnees = { ...reste, univers: univers as Univers };

    try {
      if (this.idCompetition === null) {
        const competition: Competition = { id, ...donnees };
        await firstValueFrom(this.competitionService.creer(competition));
      } else {
        await firstValueFrom(this.competitionService.modifier(this.idCompetition, donnees));
      }
    } catch (erreur) {
      if (aLeStatut(erreur, 409)) {
        return {
          fieldTree: this.formulaire.id,
          kind: 'identifiant-pris',
          message: 'Cet identifiant est déjà utilisé par une autre compétition.',
        };
      }
      this.erreurEnregistrement.set(messageErreurApi(erreur, "L'enregistrement a échoué."));
      return undefined;
    }

    await this.router.navigate(['/competitions']);
    return undefined;
  }
```

La première ligne du `try` utilise une **décomposition avec reste** : `const { id, univers, ...reste } = this.champs()` extrait `id` et `univers` dans deux variables, et range **tous les autres** champs dans l'objet `reste`. C'est la façon compacte d'écrire « tout sauf l'identifiant ».

L'erreur renvoyée s'affiche sous le champ identifiant comme une erreur de saisie ordinaire — et Signal Forms l'**efface d'elle-même** dès que la valeur du champ change. Pourquoi, alors, ne pas renvoyer aussi les autres échecs (API éteinte, par exemple) de cette façon ? Parce qu'une erreur attachée au formulaire le rend invalide **jusqu'à la prochaine modification** : la personne ne pourrait pas simplement réessayer une fois l'API redémarrée. Ces échecs-là passent donc par le signal `erreurEnregistrement`.

Le message affiché vient de l'outil `outils/erreurs-api.ts`, qui préfère le texte rédigé par le serveur à un message générique :

```ts
export function messageErreurApi(erreur: unknown, messageParDefaut: string): string {
  if (!(erreur instanceof HttpErrorResponse)) {
    return messageParDefaut;
  }

  // Statut 0 : aucune reponse n'est arrivee. Le serveur est eteint, le reseau
  // coupe, ou le navigateur a bloque la requete (CORS).
  if (erreur.status === 0) {
    return "L'API ne répond pas. Vérifie qu'elle est démarrée.";
  }

  const corps = erreur.error as CorpsErreurApi | null;
  // ...
  return corps?.erreur ?? messageParDefaut;
}
```

### 4.12 Brancher les listes et les routes

Les quatre nouvelles adresses sont déclarées dans `app.routes.ts` :

```ts
  { path: 'matchs', component: Matchs, title: 'Matchs — Suivi Compétition' },

  // Etape 7 : le meme composant sert deux adresses. Il distingue les deux
  // cas en regardant si l'adresse contient un « :id ».
  {
    path: 'matchs/nouveau',
    component: MatchFormulaire,
    title: 'Nouveau match — Suivi Compétition',
  },
  {
    path: 'matchs/:id/modifier',
    component: MatchFormulaire,
    title: 'Modifier un match — Suivi Compétition',
  },
```

Sur la page des matchs, un bouton mène au formulaire vide, et chaque ligne reçoit un lien « Modifier » :

```html
<a
  class="lien-modifier"
  [routerLink]="['/matchs', match.id, 'modifier']"
  [attr.aria-label]="'Modifier le match ' + match.domicile.nom + ' contre ' + match.exterieur.nom"
>
  Modifier
</a>
```

`routerLink` accepte un **tableau** de morceaux, qu'Angular assemble en `/matchs/m2/modifier` — en encodant correctement chaque morceau. C'est plus sûr que de coller les textes soi-même.

L'`aria-label` règle un problème invisible à l'écran : huit liens « Modifier » identiques sur une même page. Un lecteur d'écran qui liste les liens de la page annoncerait « Modifier, Modifier, Modifier… » sans dire lequel mène où. L'étiquette complète commence par le texte visible, « Modifier », pour que les personnes qui pilotent leur ordinateur à la voix puissent toujours dire « clique sur Modifier ».

Remarque : le lien a dû être ajouté **trois fois** dans `matchs.html`, une fois par liste (en direct, à venir, terminés). Le bloc d'un match y est recopié depuis l'étape 3. Ce doublon grossit ; l'étape 14 (refactoring) l'extraira dans un composant, sur le modèle d'`ErreursChamp`.

Les boutons et les champs partagent des styles globaux, ajoutés à `styles.css` pour la même raison que les états de chargement de l'étape 5 : ils servent à l'identique à plusieurs composants — et serviront aux formulaires de connexion de l'étape 8.

```css
/* La classe .bouton porte la forme ; une seconde classe (.bouton--principal,
   --secondaire, --danger) porte le role. Les deux tirets signalent une
   VARIANTE de la classe de base. */

/* Rouge : une action destructrice est exactement le cas ou la couleur
   d'accent doit attirer l'oeil. Elle reste en contour tant qu'on n'a pas
   survole, pour ne pas concurrencer le bouton principal. */
.bouton--danger {
  background-color: transparent;
  border-color: var(--couleur-accent);
  color: var(--couleur-accent);
}
```

C'est l'application directe de la charte de l'étape 2 : le **bleu** pour l'action attendue (« Enregistrer », « Nouveau match »), le **rouge** réservé à ce qui doit attirer l'attention — ici, une action irréversible.

### 4.13 Les tests

Les services sont testés comme à l'étape 5, en vérifiant les trois éléments du contrat avec le backend — la **méthode**, l'**adresse** et le **corps** :

```ts
    it("reconvertit la date en texte UTC avant de l'envoyer", () => {
      service.creer(donnees).subscribe();

      const requete = httpMock.expectOne('http://localhost:3000/api/matchs');
      expect(requete.request.method).toBe('POST');
      // Le corps contient du TEXTE, avec le « Z » que le backend exige.
      expect(requete.request.body.date).toBe('2026-09-15T16:00:00.000Z');
      expect(requete.request.body.domicileId).toBe('kc');
      requete.flush(matchsApi[0], { status: 201, statusText: 'Created' });
    });
```

Les conversions de dates ont leur propre fichier de test, qui vérifie l'aller-retour du § 2.7 :

```ts
  it("fait l'aller-retour sans decaler l'heure", () => {
    const origine = new Date('2026-09-15T16:00:00.000Z');

    const relue = depuisChampDateHeure(versChampDateHeure(origine));

    expect(relue.getTime()).toBe(origine.getTime());
  });
```

Les formulaires demandent un outil de plus : **`RouterTestingHarness`**, qui navigue **réellement** vers une adresse. C'est ce qui permet de tester les deux modes du composant, et de vérifier qu'il redirige bien vers la liste après l'enregistrement :

```ts
  async function ouvrir(adresse: string): Promise<void> {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'matchs', children: [] },
          { path: 'matchs/nouveau', component: MatchFormulaire },
          { path: 'matchs/:id/modifier', component: MatchFormulaire },
        ]),
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    harnais = await RouterTestingHarness.create();
    composant = await harnais.navigateByUrl(adresse, MatchFormulaire);
  }
```

Deux tests en particulier vérifient ce que le formulaire **ne fait pas** :

```ts
    it("n'envoie rien si le formulaire est vide, et affiche les erreurs", async () => {
      await soumettre();

      httpMock.expectNone(`${API}/matchs`);
      expect(page().textContent).toContain('Choisis une compétition.');
      expect(page().textContent).toContain('Indique la date');
    });

    it('demande une confirmation avant de supprimer', async () => {
      const bouton = page().querySelector('.zone-suppression .bouton--danger') as HTMLButtonElement;
      bouton.click();
      await attendre();

      // Premier clic : rien n'est parti, on demande seulement confirmation.
      httpMock.expectNone(`${API}/matchs/m1`);
      expect(page().textContent).toContain('Supprimer définitivement ce match ?');
      // ...
    });
```

`expectNone()` échoue si une requête **a** été envoyée. Tester l'absence d'une action est aussi important que tester sa présence : c'est ce qui garantit qu'une suppression ne part pas au premier clic.

**Un piège de synchronisation rencontré.** Les premiers essais échouaient sur quatre tests : juste après la réponse simulée du serveur, la page affichait encore « Enregistrement… ». La réponse (`flush`) résout bien la promesse de `firstValueFrom` — mais la suite du code (navigation, message d'erreur) ne s'exécute qu'au **tour suivant** de la boucle d'événements de JavaScript. Le test vérifiait trop tôt. D'où cet utilitaire :

```ts
  async function attendre(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve));
    await harnais.fixture.whenStable();
  }
```

`setTimeout` laisse passer ce tour ; `whenStable()` attend ensuite qu'Angular ait fini de mettre à jour la page et la navigation.

Résultat : **50 tests**, tous au vert (contre 23 à l'étape 6).

```
npx ng test --watch=false
 Test Files  12 passed (12)
      Tests  50 passed (50)
```

**Au-delà des tests unitaires**, le scénario complet a été joué dans un vrai navigateur (Edge piloté par Playwright), contre la vraie API et la vraie base : création d'une compétition par le formulaire, refus d'un identifiant en double affiché sous le champ, création d'un match à 21h heure de Paris — enregistré `19:00:00.000Z` —, refus de supprimer la compétition tant que le match existe, modification du match (pré-rempli à `21:00`), puis suppression des deux. La base a terminé dans son état de départ : 4 compétitions, 8 matchs.

### 4.14 Accessibilité

Un formulaire est l'endroit où l'accessibilité se voit le plus vite — ou manque le plus cruellement. Quatre gestes ont été appliqués.

**Relier chaque erreur à son champ.** Un message rouge sous un champ est évident à l'œil, invisible pour un lecteur d'écran. Deux attributs font le lien :

```html
<select
  id="match-competition"
  aria-describedby="match-competition-erreurs"
  [attr.aria-invalid]="erreursVisibles(formulaire.competitionId())"
>
```

- `aria-describedby` désigne, par son `id`, l'élément qui **décrit** le champ : le bloc d'erreurs d'`ErreursChamp`. Le lecteur d'écran lit ce texte en arrivant sur le champ.
- `aria-invalid="true"` annonce que la valeur est refusée. Le **même attribut** sert au style : `.champ-saisie[aria-invalid='true']` colore la bordure en rouge. Une seule source de vérité pour l'œil et pour l'oreille.

**Signaler les messages importants.** `role="alert"` sur l'erreur d'enregistrement et sur la demande de confirmation les fait **lire immédiatement**, sans que la personne ait à les chercher.

**Regrouper les boutons radio** dans un `<fieldset>` avec sa `<legend>` : sans cela, un lecteur d'écran annoncerait « À venir, bouton radio » sans dire à quelle question il répond.

**Mesurer les contrastes** — la leçon de l'étape 2. Les nouveaux couples de couleurs ont été calculés :

| Élément | Thème clair | Thème sombre |
|---|---|---|
| Message d'erreur (rouge sur surface) | 5,14:1 | 5,03:1 |
| Bouton « Supprimer » (rouge sur fond rosé) | 4,72:1 | 5,22:1 |
| Lien « Modifier » (bleu sur surface) | 6,02:1 | 5,47:1 |
| Aide sous un champ, en gris « discret » | **3,15:1** | **4,33:1** |
| Aide sous un champ, en gris « doux » | 7,53:1 | 7,79:1 |

Le texte d'aide était d'abord écrit en `--couleur-texte-discret`. La mesure l'a recalé : sous le minimum de **4,5:1** exigé pour un petit texte, dans les deux thèmes. Il utilise désormais `--couleur-texte-doux`.

Ce gris « discret » est encore utilisé pour quelques petits textes des étapes précédentes (l'éditeur sur les cartes de compétitions, le message de chargement). Ils seront revus à l'étape 14, avec les autres points de relecture.

## 5. Livrable attendu

La liste des matchs propose désormais de créer et de modifier :

![Matchs en thème clair, avec le bouton « Nouveau match » et les liens « Modifier »](docs/images/etape-07-clair-matchs.png)

Un formulaire soumis vide affiche toutes ses erreurs, sans rien envoyer au serveur :

![Formulaire de nouveau match, soumis vide : chaque champ obligatoire affiche son message](docs/images/etape-07-clair-match-nouveau-erreurs.png)

En modification, le formulaire est pré-rempli — et l'heure est bien celle de Paris (le match est stocké à 15:45 UTC) :

![Formulaire de modification du match PSG – OM, pré-rempli, avec la zone de suppression](docs/images/etape-07-clair-match-modifier.png)

La suppression demande une confirmation :

![Zone de suppression en thème sombre, après un premier clic : confirmation demandée](docs/images/etape-07-sombre-match-suppression.png)

Le formulaire de compétition fige l'identifiant en modification :

![Formulaire de modification de League of Legends en thème sombre, identifiant désactivé](docs/images/etape-07-sombre-competition-modifier.png)

Ce qui doit fonctionner :

- `npm run bdd:migrer` applique la migration `contraintes_matchs` ;
- l'API accepte `POST`, `PUT` et `DELETE` sur `/api/competitions` et `/api/matchs`, et `GET` sur `/api/matchs/:id` et `/api/equipes` ;
- chaque cas d'erreur du § 4.7 renvoie le bon code (`400`, `404`, `409`, `413`) ;
- depuis l'application : créer, modifier et supprimer une compétition et un match ;
- un identifiant déjà pris s'affiche sous le champ identifiant ;
- supprimer une compétition qui contient des matchs est refusé avec une explication ;
- `npm run verifier` (backend) et `npx ng test --watch=false` (frontend) passent.

Le test le plus parlant : crée un match à 21h, redémarre le backend, rouvre le match en modification. Il est toujours là, et toujours à 21h.

### Exercice facultatif : le CRUD des équipes

Les équipes ne sont qu'en lecture seule. Leur ajouter la création, la modification et la suppression est un excellent entraînement : tout le chemin a déjà été tracé par les compétitions.

1. **Validation** — `validation/equipe.validation.ts` : un identifiant (même format que les compétitions), un nom (80 caractères), un trigramme. Pour le trigramme, écris toi-même l'expression régulière : deux à quatre lettres majuscules.
2. **Dépôt** — `insererEquipe`, `mettreAJourEquipe`, `effacerEquipe`. Question à se poser : supprimer une équipe qui a joué des matchs doit-il être refusé ? Quel code Prisma le signalera ?
3. **Contrôleur et routes** — calqués sur `competitions.controleur.ts`.
4. **Frontend** — une page `/equipes` listant les équipes, et un formulaire sur le modèle de `CompetitionFormulaire`.

Teste l'API avec Thunder Client **avant** d'écrire le formulaire.

## 6. Checklist d'auto-vérification

1. Le formulaire vérifie déjà chaque champ. Pourquoi l'API revérifie-t-elle tout ? Comment contourner le formulaire en une commande ?
   - *À relire :* § 2.3 « Ne jamais faire confiance au corps d'une requête »
2. Que risquerait-on en écrivant `prisma.competition.update({ where: { id }, data: requete.body })` ? Quel nom porte cette faille, et quelle serait sa conséquence à l'étape 8 ?
   - *À relire :* § 2.3 (la liste blanche) et § 4.3 « Valider le corps des requêtes »
3. Donne un cas du projet pour chacun des codes `400`, `404` et `409`. Qu'est-ce qui distingue un `400` d'un `409` ?
   - *À relire :* § 2.2 « Les méthodes HTTP qui écrivent » et § 4.7 « Tester l'API »
4. Pourquoi ne pas vérifier qu'un identifiant est libre avant de créer la compétition ? Qui tranche, et comment le dépôt l'apprend-il ?
   - *À relire :* § 2.4 « Échec prévisible ou erreur inattendue »
5. Dans `insererCompetition`, que se passerait-il si l'on écrivait `return prisma.competition.create(...)` sans `await` ?
   - *À relire :* § 4.4 « Les écritures dans les dépôts »
6. La règle « deux équipes différentes » est écrite à trois endroits. Lesquels, et que protège chacun ? Comment l'a-t-on posée en base, alors que Prisma ne sait pas l'écrire ?
   - *À relire :* § 2.3 (défense en profondeur), § 2.5 « Une règle que Prisma ne sait pas écrire » et § 4.2 « Écrire une migration à la main »
7. Dans un formulaire Signal Forms, où vivent les valeurs saisies ? Que fait `[formField]`, et pourquoi `this.champs.set(...)` suffit-il à pré-remplir tout le formulaire ?
   - *À relire :* § 2.6 « Signal Forms » et § 4.9 « Le formulaire de match »
8. Pourquoi remplir un champ `datetime-local` avec `toISOString()` est-il un bug ? Quel décalage produirait-il à Paris en septembre ?
   - *À relire :* § 2.7 « Le fuseau horaire, encore »

## 7. Branche d'arrivée

À la fin de cette étape, ton code doit être poussé sur **`etape-07-crud`**.

L'étape suivante partira de cette branche pour créer `etape-08-authentification`. Elle comblera la faille laissée ouverte ici : aujourd'hui, n'importe qui peut modifier les données — demain, il faudra être connecté.

---

# Étape 8 — Authentification

## 1. Objectifs

À la fin de cette étape, tu dois savoir :

- distinguer **authentification** (« qui es-tu ? ») et **autorisation** (« as-tu le droit ? »), et les codes `401` et `403` qui leur correspondent ;
- expliquer pourquoi un mot de passe ne se stocke **jamais**, et ce que font une fonction de hachage, un **sel** et Argon2 ;
- décrire la structure d'un **JWT**, et expliquer pourquoi il est *signé* mais pas *chiffré* ;
- protéger des routes Express avec des **middlewares** d'authentification et de rôle ;
- joindre automatiquement un jeton aux requêtes avec un **intercepteur** Angular, et protéger des pages avec une **garde** ;
- expliquer pourquoi masquer un bouton ou protéger une page côté frontend **ne sécurise rien**.

## 2. Concepts abordés

### 2.1 Authentification et autorisation

L'étape 7 s'est terminée sur une faille assumée : n'importe qui pouvait supprimer un match, avec une simple commande `curl`. La combler demande de répondre à deux questions distinctes, qu'on confond facilement.

**L'authentification** répond à « **qui es-tu ?** ». C'est le moment où une personne prouve son identité — ici, en donnant un email et un mot de passe que seule elle est censée connaître.

**L'autorisation** répond à « **as-tu le droit de faire ça ?** ». Elle suppose l'identité déjà établie, et la compare à une règle — ici, « seuls les administrateurs peuvent modifier les données ».

Les deux échecs ont chacun leur code HTTP :

| Code | Nom | Sens | Réaction attendue du client |
|---|---|---|---|
| `401` | *Unauthorized* | « je ne sais pas qui tu es » : pas de jeton, ou jeton invalide | proposer de se connecter |
| `403` | *Forbidden* | « je sais qui tu es, et tu n'as pas le droit » | se connecter ne changera rien |

Le nom anglais de `401` est trompeur — *Unauthorized* — alors qu'il signale bien un problème d'**authentification**. C'est une erreur historique de la norme HTTP, que tout le monde a appris à contourner.

```mermaid
flowchart LR
    R(["Requete<br/>PUT /api/matchs/m2"]) --> A{"Jeton present<br/>et valide ?"}
    A -->|"non"| E401["401<br/><i>qui es-tu ?</i>"]
    A -->|"oui"| B{"Role<br/>administrateur ?"}
    B -->|"non"| E403["403<br/><i>pas le droit</i>"]
    B -->|"oui"| C["Controleur<br/>modifierMatch"]

    style E401 fill:#fdf3f3,color:#6b4545
    style E403 fill:#fdf3f3,color:#6b4545
    style C fill:#2563b0,color:#fff
```

Le projet distingue deux **rôles**. Un `utilisateur` peut consulter les données — et, à l'étape 9, suivre ses équipes. Un `administrateur` peut en plus créer, modifier et supprimer compétitions et matchs. La lecture, elle, reste ouverte à tous, connectés ou non.

### 2.2 Un mot de passe ne se stocke jamais

La base de données sera un jour copiée par quelqu'un qui n'aurait pas dû : une sauvegarde oubliée, une faille, un disque recyclé. Ce n'est pas une hypothèse pessimiste — les fuites de bases de données se comptent par milliers chaque année. Et la plupart des gens réutilisent leur mot de passe sur plusieurs sites : un mot de passe lisible dans **notre** base ouvre aussi leur messagerie.

On ne stocke donc pas le mot de passe, mais son **empreinte** : le résultat d'une **fonction de hachage**. Une telle fonction a deux propriétés :

- elle est **déterministe** : le même mot de passe donne toujours la même empreinte ;
- elle est **à sens unique** : à partir de l'empreinte, impossible de retrouver le mot de passe.

Pour vérifier une connexion, on n'a donc jamais besoin de connaître le mot de passe enregistré : on calcule l'empreinte de celui qui vient d'être saisi, et on compare.

```mermaid
flowchart TB
    subgraph INS["Inscription"]
        direction LR
        M1["trois chats sur un toit"] -->|"Argon2 + sel aleatoire"| E1["$argon2id$...$sel$empreinte"]
        E1 --> B[("utilisateurs<br/>mot_de_passe_hache")]
    end
    subgraph CNX["Connexion"]
        direction LR
        M2["mot de passe saisi"] -->|"Argon2 + MEME sel"| E2["empreinte calculee"]
        E2 --> C{"identique ?"}
    end
    B -.->|"lit le sel et l'empreinte"| C

    style B fill:#12203a,color:#fff
```

**Pourquoi pas une fonction de hachage ordinaire ?** SHA-256, par exemple, est une excellente fonction de hachage… et une très mauvaise pour les mots de passe, parce qu'elle est **rapide**. Un attaquant qui a volé la base peut calculer des milliards d'empreintes SHA-256 par seconde avec une carte graphique, et tester ainsi tous les mots de passe courants en quelques minutes.

**Argon2** est conçu pour l'inverse : il est volontairement **lent** (plusieurs dizaines de millisecondes) et gourmand en **mémoire** (64 Mo par calcul avec les réglages par défaut). Pour une personne qui se connecte, c'est imperceptible. Pour un attaquant qui veut en tester des milliards, cela devient ruineux — la mémoire, en particulier, empêche de paralléliser massivement sur une carte graphique. C'est l'algorithme recommandé en premier par l'**OWASP**, l'organisation de référence en sécurité web ; bcrypt et scrypt sont les alternatives acceptées.

**Le sel.** Sans précaution, deux personnes qui choisissent `azerty123` auraient la même empreinte — et un attaquant pourrait précalculer une fois pour toutes les empreintes des mots de passe courants. Argon2 tire donc un **sel** — une valeur aléatoire — à chaque hachage, et le mélange au mot de passe. Deux empreintes du même mot de passe sont ainsi différentes, et toute table précalculée devient inutile. Le sel n'est pas secret : il est rangé en clair dans l'empreinte elle-même, avec les réglages de coût.

```
$argon2id$v=19$m=65536,p=4,t=3$j74jdYb9T...$...
 variante  version  memoire, parallelisme, iterations  sel   empreinte
```

### 2.3 Le jeton JWT

HTTP est **sans mémoire** (étape 4) : chaque requête arrive seule, et le serveur ne sait pas qu'elle vient de la personne qui s'est connectée trente secondes plus tôt. Redemander le mot de passe à chaque requête serait absurde — et forcerait à le garder quelque part dans le navigateur.

Après une connexion réussie, le serveur remet donc au client un **jeton** (*token*), que le client joint à chaque requête suivante pour prouver son identité. Le projet utilise le format **JWT** (*JSON Web Token*).

Un JWT est une chaîne en trois parties séparées par des points. Voici le début d'un vrai jeton émis par l'API pendant les tests, et ses deux premières parties décodées :

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 . eyJwc2V1ZG8iOiJFc3NhaSIsInJvbGUi… . (signature)
en-tete                               contenu (payload)                   signature

en-tete decode : {"alg":"HS256","typ":"JWT"}
contenu decode : {"pseudo":"Essai","role":"utilisateur","iat":1789664808,"exp":1789693608,
                  "sub":"df2147a3-59ad-4f8f-b867-9eb336e853d7"}
```

| Champ | Sens |
|---|---|
| `sub` | *subject* : à qui appartient le jeton (l'identifiant du compte) |
| `iat` | *issued at* : date de fabrication, en secondes depuis 1970 |
| `exp` | *expiration* : au-delà, le jeton est refusé (ici 8 heures après `iat`) |
| `pseudo`, `role` | ajoutés par le projet, pour éviter une requête en base à chaque vérification |

Les deux premières parties sont simplement **encodées** en *base64url* — pas chiffrées. N'importe qui peut les lire, comme ci-dessus, sans aucun secret. **Un JWT est signé, pas chiffré** : on ne doit jamais y ranger quelque chose de confidentiel. C'est pourquoi l'email n'y figure pas.

La troisième partie est une **signature**, calculée à partir des deux premières et d'un **secret** que seul le serveur connaît (`JWT_SECRET`). Modifier une seule lettre du contenu — remplacer `utilisateur` par `administrateur`, par exemple — rend la signature fausse. Et fabriquer une nouvelle signature correcte exige le secret.

```mermaid
sequenceDiagram
    participant N as Navigateur
    participant A as API
    participant B as PostgreSQL

    N->>A: POST /api/auth/connexion avec email et mot de passe
    A->>B: cherche le compte par email
    B-->>A: empreinte Argon2 et role
    A->>A: verifie le mot de passe
    A->>A: signe un jeton avec JWT_SECRET
    A-->>N: 200 avec le jeton
    N->>N: range le jeton

    Note over N,A: plus tard, sans redonner le mot de passe
    N->>A: PUT /api/matchs/m2 avec Authorization Bearer et le jeton
    A->>A: verifie la signature et l'expiration
    A->>B: UPDATE matchs
    A-->>N: 200
```

Remarque que la seconde requête **ne touche pas** à la table des utilisateurs : la signature suffit à prouver que le jeton a été émis par le serveur, et le contenu dit qui l'utilise et avec quel rôle. On dit que l'authentification est **sans état** (*stateless*) : le serveur ne garde aucune liste des sessions ouvertes.

C'est rapide et simple, mais cela a un prix, qu'il faut connaître :

- **Un jeton ne se révoque pas.** Se déconnecter, c'est simplement oublier le jeton dans le navigateur. Un jeton volé reste valable jusqu'à son expiration — d'où une durée courte (8 heures ici).
- **Le rôle peut être périmé.** Promouvoir un compte administrateur ne change pas le rôle écrit dans les jetons déjà émis : il faut se reconnecter. Le test du § 4.12 le montre.

L'alternative, la **session côté serveur**, range un identifiant de session aléatoire dans un cookie, et garde en base la liste des sessions ouvertes. Elle permet de révoquer instantanément, au prix d'une lecture en base à chaque requête. Les deux approches sont répandues ; le JWT est celui retenu dans `CONTEXTE.md`.

### 2.4 Où ranger le jeton dans le navigateur

Le jeton doit survivre à un rechargement de page, donc être rangé quelque part. Deux options dominent, et aucune n'est parfaite :

| | `localStorage` + en-tête `Authorization` | Cookie `HttpOnly` |
|---|---|---|
| Lisible par le JavaScript de la page | **oui** | non |
| Envoyé automatiquement par le navigateur | non : le code l'ajoute | **oui**, à chaque requête vers le serveur |
| Risque principal | **XSS** : un script injecté peut le voler | **CSRF** : un autre site peut déclencher une requête avec le cookie |
| Parade | ne jamais injecter de HTML non maîtrisé | attribut `SameSite`, jeton anti-CSRF |
| Complexité avec deux adresses (4200 / 3000) | simple | réglages CORS et cookies supplémentaires |

Une **faille XSS** (*Cross-Site Scripting*) consiste à faire exécuter un script malveillant dans la page d'un site — par exemple en glissant `<script>` dans un pseudo, que le site afficherait tel quel. Ce script a alors accès à tout ce que la page peut lire, `localStorage` compris.

Le projet choisit `localStorage` et l'en-tête `Authorization`, pour trois raisons : c'est la façon la plus visible de comprendre ce qu'est un jeton (on le voit passer, on peut le décoder), elle reste simple avec deux serveurs sur deux ports, et **Angular protège nativement contre la XSS** — toute valeur affichée avec `{{ }}` est échappée, si bien qu'un pseudo `<script>alert(1)</script>` s'affiche comme du texte au lieu de s'exécuter. Ce choix sera rediscuté au déploiement (étape 15) et consigné dans le document de construction du projet.

### 2.5 Les attaques qu'on anticipe

Une authentification ne se juge pas au cas où tout se passe bien, mais à ce qu'elle oppose à quelqu'un de mal intentionné. Chaque mesure de cette étape répond à une attaque précise :

| Attaque | Principe | Parade dans le projet |
|---|---|---|
| **Vol de la base** | lire les mots de passe dans une sauvegarde volée | empreintes Argon2 salées (§ 2.2) |
| **Force brute** | essayer des milliers de mots de passe sur un compte | 10 échecs par quart d'heure, puis `429` (§ 4.10) |
| **Énumération de comptes** | découvrir quelles adresses ont un compte | même message **et même durée** pour « email inconnu » et « mot de passe faux » (§ 4.8) |
| **Falsification de jeton** | modifier le rôle écrit dans le jeton | signature HMAC vérifiée à chaque requête (§ 4.5) |
| **Jeton `alg: none`** | présenter un jeton qui annonce ne pas être signé | algorithme imposé à la vérification (§ 4.5) |
| **Jeton volé** | réutiliser le jeton de quelqu'un d'autre | expiration après 8 heures |
| **Affectation de masse** | s'inscrire en envoyant `"role": "administrateur"` | liste blanche de la validation (étape 7) |
| **Redirection ouverte** | détourner la page de connexion vers un faux site | adresse de retour limitée au site lui-même (§ 4.16) |
| **Secret faible ou oublié** | deviner `JWT_SECRET`, ou le trouver dans le code | 32 caractères minimum, jamais de valeur par défaut (§ 4.3) |

Le § 4.12 rejoue chacune de ces attaques contre la vraie API.

### 2.6 Le frontend adapte, le backend protège

Le frontend va masquer les boutons « Modifier » aux personnes qui ne sont pas administrateurs, et refuser d'ouvrir les pages de formulaire. Il est tentant d'y voir une protection. **Ce n'en est pas une.**

Le code du frontend s'exécute dans le navigateur de la personne — sur **sa** machine. Elle peut le lire, le modifier, désactiver une garde depuis les outils de développement, ou ignorer complètement l'interface et appeler l'API avec `curl`. Tout ce que fait le frontend est une question de **confort** : ne pas montrer une action qui échouerait.

```mermaid
flowchart LR
    subgraph NAV["Navigateur : controle par la personne"]
        direction TB
        G["Garde de route<br/><i>n'ouvre pas la page</i>"]
        H["Bouton masque<br/><i>n'affiche pas l'action</i>"]
    end
    subgraph SRV["Serveur : controle par nous"]
        direction TB
        MW["authentifier + exigerRole<br/><i>401 / 403</i>"]
    end
    NAV -->|"contournable en 10 secondes"| SRV
    X["curl, Thunder Client"] -->|"ignore le frontend"| SRV

    style NAV fill:#eaf0f8,color:#12203a
    style SRV fill:#12203a,color:#fff
```

La **sécurité** est entièrement du côté du serveur, qui vérifie le jeton et le rôle à **chaque** requête, quelle que soit sa provenance. Le parcours du § 4.18 le démontre : avec un jeton falsifié, le frontend ouvre bien le formulaire — et l'API refuse l'enregistrement.

## 3. Prérequis

Pars de la branche **`etape-07-crud`**.

```
git checkout etape-07-crud
git checkout -b etape-08-authentification
```

PostgreSQL doit être démarré.

Si tu récupères directement la branche `etape-08-authentification`, trois gestes sont nécessaires dans `backend/` :

```
npm install            # nouveaux paquets
npm run bdd:migrer     # cree la table utilisateurs
```

puis ajouter `JWT_SECRET` à ton fichier `backend/.env` (§ 4.3) — sans quoi le serveur refusera de démarrer, et c'est voulu.

## 4. Déroulé détaillé

Comme à l'étape 7, on construit de bas en haut, et chaque couche est vérifiée avant la suivante.

```mermaid
flowchart LR
    subgraph BACK["backend/"]
        direction TB
        S["prisma/<br/>table utilisateurs, script promouvoir"]
        SEC["src/securite/<br/><i>nouveau</i> : mots de passe, jetons"]
        MW["src/middlewares/<br/>authentification, limitation"]
        AUTH["routes et controleur auth"]
    end
    subgraph FRONT["frontend/src/app/"]
        direction TB
        SV["services/auth.ts<br/><i>la session</i>"]
        IC["intercepteurs/<br/><i>nouveau</i>"]
        GA["gardes/<br/><i>nouveau</i>"]
        PG["pages connexion, inscription,<br/>acces-refuse"]
    end
    S --> AUTH
    SEC --> AUTH
    SEC --> MW
    AUTH -->|"HTTP"| SV
    SV --> IC
    SV --> GA
    SV --> PG
```

### 4.1 Installer les paquets

```
cd backend
npm install argon2 jsonwebtoken express-rate-limit
npm install --save-dev @types/jsonwebtoken
```

| Paquet | Rôle |
|---|---|
| `argon2` | calcule et vérifie les empreintes de mots de passe |
| `jsonwebtoken` | fabrique et vérifie les JWT |
| `express-rate-limit` | limite le nombre de tentatives par adresse IP |
| `@types/jsonwebtoken` | décrit les types de `jsonwebtoken` pour TypeScript |

`argon2` n'est pas écrit en JavaScript : c'est du code C compilé pour chaque système. Le paquet fournit une version déjà compilée pour Windows, d'où une installation sans outil supplémentaire. Un essai immédiat le confirme :

```
node -e "require('argon2').hash('essai-de-mot-de-passe').then(console.log)"
-> $argon2id$v=19$m=65536,p=4,t=3$j74jdYb9T...   (sortie tronquee)
```

> **À propos de `npm audit`.** L'installation signale quatre vulnérabilités « high ». Elles existaient déjà à l'étape 7 : elles concernent `deepmerge-ts` et `mysql2`, des dépendances de l'**outil en ligne de commande** Prisma, qui ne tourne jamais en production. `npm audit fix --force` les « corrigerait » en changeant la version de Prisma — celle-là même qui a été figée à l'étape 6 pour éviter une version non finalisée. Lire le détail d'un audit avant d'appliquer une correction automatique fait partie du métier.

### 4.2 La table des utilisateurs

Dans `prisma/schema.prisma` :

```prisma
/// Etape 8 : ce qu'une personne connectee a le droit de faire.
enum Role {
  /// Consulter les donnees (et, a l'etape 9, suivre ses equipes).
  utilisateur
  /// Creer, modifier et supprimer competitions et matchs.
  administrateur
}

/// Etape 8 : une personne inscrite sur la plateforme.
model Utilisateur {
  id String @id @default(uuid())

  /// L'adresse sert d'identifiant de connexion : deux comptes ne peuvent pas
  /// la partager. « @unique » cree un index unique -- c'est la BASE qui
  /// refusera un doublon, meme si deux inscriptions arrivent en meme temps.
  email String @unique

  /// Nom affiche dans l'interface.
  pseudo String

  /// JAMAIS le mot de passe lui-meme : seulement son empreinte Argon2, a
  /// partir de laquelle il est impossible de retrouver le mot de passe.
  motDePasseHache String @map("mot_de_passe_hache")

  /// Toute nouvelle inscription est un simple utilisateur. Devenir
  /// administrateur passe par un script lance sur le serveur, jamais par
  /// l'API (voir prisma/promouvoir.ts).
  role Role @default(utilisateur)

  /// Rempli automatiquement par la base a la creation de la ligne.
  creeLe DateTime @default(now()) @map("cree_le")

  @@map("utilisateurs")
}
```

Deux nouveautés du schéma. `@unique` pose un **index unique** : c'est la base qui refusera un second compte avec la même adresse — la leçon de la situation de concurrence de l'étape 7. Et `@default(...)` laisse la **base** remplir la colonne quand on ne précise rien : le rôle vaut `utilisateur`, la date d'inscription vaut l'instant présent.

```
npx prisma migrate dev --name utilisateurs
```

Le SQL produit, dans `migrations/20260917170221_utilisateurs/migration.sql` :

```sql
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('utilisateur', 'administrateur');

-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "pseudo" TEXT NOT NULL,
    "mot_de_passe_hache" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'utilisateur',
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");
```

Rassurant : cette migration automatique n'a pas touché aux contraintes `CHECK` écrites à la main à l'étape 7.

### 4.3 Le secret et la configuration

Le secret qui signe les jetons est le plus sensible du projet : quiconque le connaît peut fabriquer un jeton **administrateur** au nom de n'importe qui. Il se génère aléatoirement, depuis `backend/` :

```
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

48 octets aléatoires donnent 64 caractères. La valeur obtenue va dans `backend/.env` — et **nulle part ailleurs** :

```
JWT_SECRET=<la valeur generee>
```

`.env.example` documente la variable, sans sa valeur :

```
# OBLIGATOIRE, 32 caracteres minimum : le serveur refuse de demarrer sans.
# Pour en generer un, depuis le dossier backend/ :
#   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
JWT_SECRET=A_GENERER_AVEC_LA_COMMANDE_CI_DESSUS

# Duree de validite d'un jeton. Facultatif : 8h par defaut.
JWT_DUREE=8h
```

Dans `src/config.ts`, le secret n'a **pas** de valeur de repli, contrairement au port :

```ts
/**
 * Etape 8 : le secret qui signe les jetons de connexion.
 *
 * Contrairement a PORT, il n'a PAS de valeur de repli. Un secret par defaut
 * ecrit dans le code serait public -- il est sur GitHub -- et n'importe qui
 * pourrait fabriquer des jetons valides. Mieux vaut un serveur qui refuse de
 * demarrer qu'un serveur qui demarre sans protection : c'est le principe
 * « echouer tot » (fail fast).
 */
export const SECRET_JWT = lireSecretJwt();

function lireSecretJwt(): string {
  const secret = process.env['JWT_SECRET'];

  if (secret === undefined || secret.length < LONGUEUR_MINIMALE_SECRET) {
    throw new Error(
      `JWT_SECRET absent ou trop court (${LONGUEUR_MINIMALE_SECRET} caractères minimum). ` +
        'Voir .env.example pour générer une valeur.',
    );
  }

  return secret;
}
```

Vérification, en lançant le serveur avec une variable vide :

```
JWT_SECRET= npx tsx src/server.ts
-> Error: JWT_SECRET absent ou trop court (32 caractères minimum). Voir .env.example pour générer une valeur.
```

**Échouer tôt** est un principe précieux : une erreur de configuration découverte au démarrage, avec un message clair, coûte une minute. La même erreur découverte en production, sous la forme d'une faille, peut coûter tout le reste.

La durée des jetons est lue au même endroit, et son format vérifié :

```ts
type Duree = `${number}${'s' | 'm' | 'h' | 'd'}`;
```

Ce type s'appelle un **type littéral de gabarit** (*template literal type*) : il décrit la **forme** d'un texte — un nombre suivi de `s`, `m`, `h` ou `d`. `jsonwebtoken` exige ce genre de valeur, et refuserait un simple `string`.

### 4.4 Hacher les mots de passe

`src/securite/mots-de-passe.ts` enveloppe `argon2` :

```ts
import { hash, verify } from 'argon2';

export function hacherMotDePasse(motDePasse: string): Promise<string> {
  return hash(motDePasse);
}

/** Le mot de passe saisi correspond-il a l'empreinte enregistree ? */
export function verifierMotDePasse(empreinte: string, motDePasse: string): Promise<boolean> {
  return verify(empreinte, motDePasse);
}
```

Les réglages par défaut du paquet — la variante **argon2id**, 64 Mo de mémoire, 3 itérations — dépassent les minimums recommandés par l'OWASP : on ne les modifie pas.

La troisième fonction répond à une attaque plus subtile :

```ts
/**
 * Fait le meme travail qu'une verification, pour rien.
 *
 * Pourquoi ? Quand l'adresse email n'existe pas, le serveur pourrait
 * repondre immediatement -- alors qu'une vraie verification Argon2 prend
 * plusieurs dizaines de millisecondes. En chronometrant les reponses, un
 * attaquant saurait quelles adresses ont un compte, sans jamais connaitre un
 * seul mot de passe. Cette fonction egalise les temps de reponse.
 */
export async function simulerVerification(motDePasse: string): Promise<void> {
  empreinteFactice ??= hash('mot-de-passe-factice-que-personne-ne-connait');
  await verify(await empreinteFactice, motDePasse);
}
```

Ce genre d'attaque, qui déduit une information du **temps** que met un système à répondre, s'appelle une **attaque temporelle** (*timing attack*). Le test du § 4.12 mesure l'effet de cette fonction : 70 ms pour un mot de passe faux, 74 ms pour une adresse inconnue.

`??=` est l'**affectation de coalescence** : « si `empreinteFactice` vaut `null` ou `undefined`, lui donner cette valeur ». L'empreinte factice n'est calculée qu'une fois, au premier besoin.

### 4.5 Fabriquer et vérifier les jetons

`src/securite/jetons.ts` :

```ts
const ALGORITHME = 'HS256';

/** Fabrique un jeton pour une personne qui vient de prouver son identite. */
export function creerJeton(utilisateur: UtilisateurConnecte): string {
  return jwt.sign(
    // Le contenu (« payload ») : le strict necessaire pour les middlewares.
    { pseudo: utilisateur.pseudo, role: utilisateur.role },
    SECRET_JWT,
    {
      algorithm: ALGORITHME,
      // « sub » (subject) : la norme JWT prevoit ce champ pour designer a
      // qui appartient le jeton. On y range l'identifiant.
      subject: utilisateur.id,
      // « exp » : au-dela, le jeton est refuse. Un jeton vole ne sert donc
      // que pendant un temps limite.
      expiresIn: DUREE_JWT,
    },
  );
}
```

**HS256** signe avec **HMAC-SHA256** et un secret partagé. C'est adapté quand un seul serveur fabrique **et** vérifie les jetons. Quand plusieurs services doivent vérifier sans pouvoir fabriquer, on utilise une paire de clés publique/privée (RS256, ES256).

La vérification :

```ts
export function lireJeton(jeton: string): UtilisateurConnecte | null {
  try {
    const contenu = jwt.verify(jeton, SECRET_JWT, {
      // On impose l'algorithme attendu. Sans cette option, certaines
      // bibliotheques ont accepte par le passe des jetons annoncant
      // « alg: none » -- sans signature du tout. Ne jamais laisser le jeton
      // choisir comment il doit etre verifie.
      algorithms: [ALGORITHME],
    });

    // La signature est bonne : le contenu vient bien de nous. On verifie
    // tout de meme sa forme avant de s'en servir, par principe.
    if (
      typeof contenu === 'string' ||
      typeof contenu.sub !== 'string' ||
      typeof contenu['pseudo'] !== 'string' ||
      !ROLES.includes(contenu['role'])
    ) {
      return null;
    }

    return { id: contenu.sub, pseudo: contenu['pseudo'], role: contenu['role'] };
  } catch {
    // jwt.verify leve une erreur pour tout jeton invalide ou expire.
    return null;
  }
}
```

L'option `algorithms` mérite qu'on s'y arrête. L'en-tête d'un JWT **annonce** l'algorithme qui l'a signé : `{"alg":"HS256"}`. Or cet en-tête est écrit par… celui qui présente le jeton. Un attaquant peut donc y écrire `{"alg":"none"}` — « ce jeton n'est pas signé » — et espérer que le serveur le croie. Des bibliothèques réelles ont été vulnérables à ce piège. La règle : **le serveur décide de l'algorithme, jamais le jeton.**

### 4.6 Valider l'inscription et la connexion

`src/validation/auth.validation.ts` suit le moule de l'étape 7. Trois détails lui sont propres :

```ts
/** Lit une adresse email, ramenee en minuscules. */
function lireEmail(corps: Record<string, unknown>, erreurs: ErreurChamp[]): string {
  // 254 caracteres : la longueur maximale d'une adresse email valide.
  const email = lireTexte(corps, 'email', 254, erreurs).toLowerCase();

  if (email !== '' && !FORMAT_EMAIL.test(email)) {
    erreurs.push({ champ: 'email', message: 'Adresse email invalide.' });
  }

  // Les minuscules evitent qu'« Alice@exemple.fr » et « alice@exemple.fr »
  // deviennent deux comptes differents -- ou qu'on ne puisse plus se
  // connecter pour avoir tape une majuscule.
  return email;
}
```

```ts
  // Le mot de passe n'est PAS nettoye avec trim() : un espace au debut ou a
  // la fin fait partie du mot de passe choisi. Le retirer en silence
  // empecherait ensuite la connexion.
  const motDePasse = corps['motDePasse'];
  if (typeof motDePasse !== 'string' || motDePasse.length < MOT_DE_PASSE_MIN) {
    erreurs.push({ champ: 'motDePasse', message: `${MOT_DE_PASSE_MIN} caractères minimum.` });
  } else if (motDePasse.length > MOT_DE_PASSE_MAX) {
    erreurs.push({ champ: 'motDePasse', message: `${MOT_DE_PASSE_MAX} caractères maximum.` });
  }
```

**12 caractères minimum** : la longueur est ce qui rend un mot de passe difficile à deviner, bien plus que les chiffres ou symboles imposés. Une phrase comme « trois chats sur un toit » est à la fois longue et mémorisable. **128 maximum** : Argon2 est gourmand, et un mot de passe de plusieurs mégaoctets pourrait épuiser le serveur.

Enfin, la validation de la **connexion** ne vérifie que la **présence** des champs, pas leur longueur : si la règle se durcit un jour, les comptes créés avant doivent toujours pouvoir se connecter.

### 4.7 Le dépôt des utilisateurs

`src/depots/utilisateurs.depot.ts` manipule deux types au même nom, d'où un renommage à l'import :

```ts
import { Utilisateur as LigneUtilisateur } from '../generated/prisma/client';
import { Utilisateur } from '../modeles/utilisateur';

/**
 * Ligne de la base -> utilisateur expose par l'API : l'empreinte reste ici.
 */
export function sansEmpreinte(ligne: LigneUtilisateur): Utilisateur {
  return {
    id: ligne.id,
    email: ligne.email,
    pseudo: ligne.pseudo,
    role: ligne.role,
    creeLe: ligne.creeLe.toISOString(),
  };
}
```

L'interface `Utilisateur` du modèle **ne contient pas** l'empreinte : c'est la liste blanche de ce qui peut sortir du serveur. Même une empreinte Argon2 ne doit jamais quitter la base — elle permettrait de tester des mots de passe hors ligne, sans limite de tentatives.

Une seule fonction laisse sortir l'empreinte, et son type de retour le rend visible :

```ts
/**
 * Cherche un compte par son email, AVEC l'empreinte du mot de passe.
 *
 * C'est la seule fonction qui laisse sortir l'empreinte du depot, et elle
 * n'a qu'un usage : verifier un mot de passe a la connexion.
 */
export async function trouverPourConnexion(email: string): Promise<LigneUtilisateur | null> {
  return prisma.utilisateur.findUnique({ where: { email } });
}
```

### 4.8 Les contrôleurs d'authentification

L'inscription, dans `src/controleurs/auth.controleur.ts` :

```ts
    const { email, pseudo, motDePasse } = validation.donnees;

    const resultat = await insererUtilisateur({
      email,
      pseudo,
      // Le mot de passe en clair ne va pas plus loin que cette ligne.
      motDePasseHache: await hacherMotDePasse(motDePasse),
    });

    if (resultat === 'email-pris') {
      reponse.status(409).json({ erreur: 'Un compte existe déjà avec cette adresse email' });
      return;
    }

    const corps: ReponseAuthentification = { utilisateur: resultat, jeton: creerJeton(resultat) };
    reponse.status(201).json(corps);
```

L'inscription renvoie directement un jeton : la personne qui vient de créer son compte n'a pas à se reconnecter dans la foulée.

La connexion est l'endroit où l'énumération de comptes se joue :

```ts
/**
 * Message unique pour un email inconnu ET pour un mot de passe faux.
 *
 * Deux messages differents (« compte introuvable » / « mot de passe
 * incorrect ») diraient a un attaquant quelles adresses ont un compte : il
 * n'aurait plus qu'a s'acharner sur celles-la. C'est l'ENUMERATION DE
 * COMPTES.
 */
const IDENTIFIANTS_INCORRECTS = { erreur: 'Email ou mot de passe incorrect' };
```

```ts
    const { email, motDePasse } = validation.donnees;
    const ligne = await trouverPourConnexion(email);

    if (ligne === null) {
      // Meme travail, meme duree, meme message qu'un mot de passe faux :
      // rien ne distingue une adresse inconnue d'une adresse existante.
      await simulerVerification(motDePasse);
      reponse.status(401).json(IDENTIFIANTS_INCORRECTS);
      return;
    }

    if (!(await verifierMotDePasse(ligne.motDePasseHache, motDePasse))) {
      reponse.status(401).json(IDENTIFIANTS_INCORRECTS);
      return;
    }

    const utilisateur = sansEmpreinte(ligne);
    const corps: ReponseAuthentification = { utilisateur, jeton: creerJeton(utilisateur) };
    reponse.json(corps);
```

Une limite honnête : à l'**inscription**, l'énumération est inévitable. Pour aider quelqu'un à créer son compte, il faut bien lui dire que l'adresse est déjà utilisée. La limitation des tentatives (§ 4.10) freine l'abus de cette réponse.

`GET /api/auth/moi` renvoie le compte de la personne connectée, **relu en base** — utile pour afficher un rôle à jour, contrairement à celui figé dans le jeton.

### 4.9 Les gardiens de l'API

`src/middlewares/authentification.ts` contient les deux middlewares du § 2.1.

```ts
export function authentifier(requete: Request, reponse: Response, suivant: NextFunction): void {
  const entete = requete.headers.authorization;

  if (entete === undefined || !entete.startsWith('Bearer ')) {
    refuserSansIdentite(reponse, 'Authentification requise');
    return;
  }

  // « Bearer eyJhbGci... » : on retire les 7 caracteres de « Bearer ».
  const utilisateur = lireJeton(entete.slice('Bearer '.length));

  if (utilisateur === null) {
    refuserSansIdentite(reponse, 'Session invalide ou expirée');
    return;
  }

  // Les middlewares et controleurs suivants sauront qui fait la requete.
  requete.utilisateur = utilisateur;
  suivant();
}
```

Le jeton voyage dans l'en-tête HTTP `Authorization`, précédé du mot **`Bearer`** — « porteur ». Le terme est éloquent : **quiconque porte ce jeton** est considéré comme son propriétaire. Il se protège donc comme un mot de passe.

`requete.utilisateur` n'existe pas dans le type `Request` d'Express. Le fichier `src/types/express.d.ts` le lui ajoute :

```ts
declare global {
  namespace Express {
    interface Request {
      /** Present uniquement apres le middleware authentifier(). */
      utilisateur?: UtilisateurConnecte;
    }
  }
}
```

C'est une **augmentation de module** : on ne modifie pas le code d'Express, on **complète la description** de son type. Un fichier `.d.ts` ne contient que des types et ne produit aucun code.

Le second middleware vérifie le rôle :

```ts
/**
 * exigerRole n'est pas un middleware : c'est une FONCTION QUI FABRIQUE un
 * middleware. exigerRole('administrateur') renvoie une nouvelle fonction,
 * qui se souvient du role demande.
 */
export function exigerRole(role: Role): RequestHandler {
  return (requete, reponse, suivant) => {
    if (requete.utilisateur?.role !== role) {
      // 403 = « je sais qui tu es, et tu n'as pas le droit ».
      // A ne pas confondre avec 401 = « je ne sais pas qui tu es ».
      reponse.status(403).json({ erreur: 'Droits insuffisants' });
      return;
    }
    suivant();
  };
}
```

La fonction renvoyée « se souvient » du paramètre `role`, alors même que `exigerRole` a fini de s'exécuter. Ce mécanisme s'appelle une **fermeture** (*closure*) : une fonction emporte avec elle les variables de l'endroit où elle a été créée. On l'utilise ici pour écrire une seule fois une logique paramétrable.

Les deux gardiens sont regroupés, pour ne jamais en oublier un :

```ts
export const reserveAuxAdministrateurs: RequestHandler[] = [
  authentifier,
  exigerRole('administrateur'),
];
```

Et placés **devant** les contrôleurs d'écriture, dans les routes :

```ts
routeurCompetitions.get('/', obtenirCompetitions); //      lire la liste
routeurCompetitions.post('/', reserveAuxAdministrateurs, creerCompetition); // ajouter

routeurCompetitions.get('/:id', obtenirCompetition); //    lire un element
routeurCompetitions.put('/:id', reserveAuxAdministrateurs, modifierCompetition); // remplacer
routeurCompetitions.delete('/:id', reserveAuxAdministrateurs, supprimerCompetition); // supprimer
```

Remarque ce qui **n'a pas** changé : pas une ligne des contrôleurs de l'étape 7. C'est tout l'intérêt des middlewares — ajouter une règle transversale sans toucher au code métier.

Enfin, un `401` s'accompagne de l'en-tête que la norme HTTP exige, et qui indique **comment** s'authentifier :

```ts
function refuserSansIdentite(reponse: Response, message: string): void {
  reponse.status(401).set('WWW-Authenticate', 'Bearer').json({ erreur: message });
}
```

### 4.10 Limiter les tentatives

`src/middlewares/limitation.ts` :

```ts
import { rateLimit } from 'express-rate-limit';

export const limiterTentatives = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  // Seules les reponses en erreur (code 400 ou plus) sont comptees.
  skipSuccessfulRequests: true,
  // Envoie les en-tetes normalises RateLimit-* : le client peut savoir
  // combien de tentatives il lui reste, et quand le compteur se remet a zero.
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { erreur: 'Trop de tentatives. Réessaie dans quelques minutes.' },
});
```

Au-delà de **10 échecs en 15 minutes** depuis la même adresse IP, le serveur répond `429` (*Too Many Requests*) sans même regarder le mot de passe. Une attaque par **force brute** qui essayait des milliers de mots de passe par minute n'en essaie plus que 40 par heure.

`skipSuccessfulRequests` a été ajouté après un premier essai : sans lui, les connexions **réussies** étaient comptées aussi, et une personne qui se reconnecte souvent aurait pu se bloquer elle-même.

Placé **avant** le contrôleur dans les routes, le limiteur refuse la requête avant tout calcul Argon2 :

```ts
routeurAuth.post('/inscription', limiterTentatives, inscrire);
routeurAuth.post('/connexion', limiterTentatives, connecter);

routeurAuth.get('/moi', authentifier, obtenirMoi);
```

Limite connue : le compteur vit dans la mémoire du serveur. Il repart de zéro à chaque redémarrage, et ne serait pas partagé entre plusieurs serveurs. Une application à fort trafic le rangerait dans un stockage partagé, comme Redis.

### 4.11 Devenir administrateur

Il faut bien un premier administrateur. Le projet l'obtient avec un script, `prisma/promouvoir.ts`, lancé **sur le serveur** :

```
npm run utilisateur:promouvoir -- adresse@exemple.fr
```

```ts
const resultat = await prisma.utilisateur.updateMany({
  where: { email: adresse },
  data: { role: 'administrateur' },
});

if (resultat.count === 0) {
  console.error(`Aucun compte avec l'adresse ${adresse}. Inscris-toi d'abord depuis l'application.`);
  process.exitCode = 1;
  return;
}

console.log(`${adresse} est maintenant administrateur.`);
console.log('Déconnecte-toi puis reconnecte-toi : ton jeton actuel porte encore l’ancien rôle.');
```

Pourquoi un script plutôt qu'une route d'API ? Parce qu'une route de promotion devrait elle-même être réservée aux administrateurs — et il n'en existe encore aucun. Un script lancé sur la machine règle la question : seule une personne qui a accès au serveur et à son `.env` peut l'exécuter. **Aucune porte n'est ouverte sur Internet.**

Les alternatives courantes ont chacune un défaut sérieux :

| Approche | Défaut |
|---|---|
| « Le premier inscrit devient administrateur » | sur un serveur tout juste déployé, **quiconque s'inscrit avant toi** prend le contrôle |
| Un compte administrateur créé par le peuplement | son mot de passe devrait être écrit quelque part : dans le code, ou dans `.env` |
| Une route de promotion ouverte | évident |

### 4.12 Tester l'API — et l'attaquer

Le scénario suivant a été joué contre la vraie API, avec un script Node.js qui chronomètre les réponses. Résultats réels :

```
Inscription invalide
-> 400 {"erreur":"Données invalides","details":[
         {"champ":"email","message":"Adresse email invalide."},
         {"champ":"pseudo","message":"2 caractères minimum."},
         {"champ":"motDePasse","message":"12 caractères minimum."}]}

Inscription valide, avec "role":"administrateur" glisse dans le corps
-> 201 {"utilisateur":{"id":"df2147a3-...","email":"essai.etape8@exemple.fr","pseudo":"Essai",
         "role":"utilisateur","creeLe":"2026-09-17T17:06:48.019Z"},"jeton":"eyJhbGciOiJIUzI1NiIs…"}
   (role « utilisateur » : la liste blanche a ignore la tentative ; aucune empreinte dans la reponse)

Inscription, meme adresse avec des majuscules
-> 409 {"erreur":"Un compte existe déjà avec cette adresse email"}

Connexion, mot de passe faux      -> 401 {"erreur":"Email ou mot de passe incorrect"}   (70 ms)
Connexion, adresse inconnue       -> 401 {"erreur":"Email ou mot de passe incorrect"}   (74 ms)
Connexion correcte (ESSAI.etape8@exemple.fr)
-> 200 {"utilisateur":{...,"role":"utilisateur"},"jeton":"eyJhbGciOiJIUzI1NiIs…"}

GET /api/auth/moi sans jeton      -> 401 {"erreur":"Authentification requise"}   WWW-Authenticate: Bearer
GET /api/auth/moi avec jeton      -> 200 {"id":"df2147a3-...","pseudo":"Essai","role":"utilisateur",...}

POST /api/competitions sans jeton         -> 401 {"erreur":"Authentification requise"}
POST /api/competitions jeton utilisateur  -> 403 {"erreur":"Droits insuffisants"}
```

Puis les attaques :

```
Jeton falsifie : role remplace par « administrateur », signature d'origine conservee
-> 401 {"erreur":"Session invalide ou expirée"}

Jeton « alg: none » : aucun secret, aucune signature
-> 401 {"erreur":"Session invalide ou expirée"}

Jeton authentique, signe avec le vrai secret, role administrateur... mais expire
-> 401 {"erreur":"Session invalide ou expirée"}
```

La promotion, et ce qu'elle montre du caractère *sans état* des jetons :

```
npm run utilisateur:promouvoir -- essai.etape8@exemple.fr
   essai.etape8@exemple.fr est maintenant administrateur.

POST /api/competitions avec l'ANCIEN jeton  -> 403 {"erreur":"Droits insuffisants"}
   (le jeton porte encore « utilisateur »)

Reconnexion : nouveau contenu {"pseudo":"Essai","role":"administrateur",...}
POST /api/competitions avec le nouveau jeton   -> 201
DELETE /api/competitions/essai-etape-8         -> 204
GET /api/competitions sans jeton                -> 200   (la lecture reste publique)
```

Et la force brute :

```
Connexions successives avec de mauvais mots de passe
-> 401 401 401 401 401 401 401 401 401 429
   (un echec avait deja ete compte juste avant : 9 + 1 = 10, puis blocage)
   429 {"erreur":"Trop de tentatives. Réessaie dans quelques minutes."}
   RateLimit: "10-in-15min"; r=0; t=792

Meme le BON mot de passe, pendant le blocage -> 429
```

Le dernier résultat est voulu : si le bon mot de passe passait pendant le blocage, l'attaquant saurait qu'il l'a trouvé.

Enfin, le démarrage sans secret :

```
JWT_SECRET= npx tsx src/server.ts
-> Error: JWT_SECRET absent ou trop court (32 caractères minimum). Voir .env.example pour générer une valeur.
```

Les comptes de test ont été supprimés de la base à la fin du scénario.

### 4.13 La session côté Angular

Tout le frontend doit savoir « qui est connecté » : le bandeau, les listes, les gardes, l'intercepteur. Un seul service, `services/auth.ts`, détient cette information :

```ts
@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.urlApi}/auth`;

  private readonly jetonStocke = signal<string | null>(this.lireStockage());

  /** Le jeton actuel, en lecture seule pour le reste de l'application. */
  readonly jeton = this.jetonStocke.asReadonly();

  /** La personne connectee, lue dans le jeton -- ou null. */
  readonly utilisateur = computed(() => {
    const jeton = this.jetonStocke();
    return jeton === null ? null : lireContenuJeton(jeton);
  });

  readonly estConnecte = computed(() => this.utilisateur() !== null);

  readonly estAdministrateur = computed(() => this.utilisateur()?.role === 'administrateur');
```

Tout repose sur **un** signal : le jeton. La personne connectée, son rôle, le fait d'être administrateur en sont **dérivés** avec `computed()`. Impossible, ainsi, que le pseudo affiché et le jeton envoyé au serveur racontent deux histoires différentes.

`asReadonly()` expose le signal **en lecture seule** : le reste de l'application peut lire le jeton, mais seul le service peut le changer.

Se connecter range le jeton ; se déconnecter l'oublie :

```ts
  connecter(donnees: DonneesConnexion): Observable<Utilisateur> {
    return this.http
      .post<ReponseAuthentification>(`${this.url}/connexion`, donnees)
      .pipe(map((reponse) => this.ouvrirSession(reponse)));
  }

  /**
   * Ferme la session.
   *
   * Remarque : il n'y a AUCUN appel au serveur. Un JWT n'est enregistre nulle
   * part cote serveur -- c'est tout l'interet d'une authentification « sans
   * etat » (stateless). Se deconnecter, c'est simplement oublier le jeton.
   * Contrepartie : un jeton vole reste valable jusqu'a son expiration.
   */
  deconnecter(): void {
    this.jetonStocke.set(null);
    try {
      localStorage.removeItem(CLE_JETON);
    } catch {
      // Stockage indisponible : le jeton n'y etait de toute facon pas.
    }
  }
```

Pour afficher le pseudo et le rôle, le frontend **lit** le contenu du jeton, dans `outils/jetons.ts` :

```ts
function base64UrlVersTexte(morceau: string): string {
  const base64 = morceau.replace(/-/g, '+').replace(/_/g, '/');
  const octets = Uint8Array.from(atob(base64), (caractere) => caractere.charCodeAt(0));
  return new TextDecoder().decode(octets);
}
```

`atob()` décode du base64, mais produit des **octets**, pas du texte. Un pseudo accentué comme « Élodie » occupe plusieurs octets en UTF-8 : `TextDecoder` les réassemble. Un test vérifie exactement ce cas.

La fonction `lireContenuJeton` vérifie ensuite la forme du contenu et l'expiration :

```ts
    // « exp » est exprime en SECONDES depuis le 1er janvier 1970 ; les dates
    // JavaScript comptent en MILLISECONDES.
    const expiration = new Date(contenu.exp * 1000);

    if (expiration <= maintenant) {
      return null;
    }
```

Un point essentiel : le frontend **ne vérifie pas la signature** — il faudrait le secret, qui ne doit jamais quitter le serveur. Ce qu'il lit dans le jeton sert au confort d'affichage, jamais à la sécurité (§ 2.6).

### 4.14 L'intercepteur

Chaque requête vers une route protégée doit porter l'en-tête `Authorization`. Plutôt que de l'ajouter dans chaque méthode de chaque service, un **intercepteur** s'en charge pour toutes : c'est une fonction qui s'intercale entre le code qui envoie une requête et le réseau, dans les deux sens.

```mermaid
sequenceDiagram
    participant C as Composant
    participant S as MatchService
    participant I as Intercepteur
    participant A as API

    C->>S: modifier(m2, donnees)
    S->>I: PUT /api/matchs/m2
    I->>I: ajoute Authorization Bearer
    I->>A: PUT avec le jeton
    alt jeton accepte
        A-->>I: 200
        I-->>C: le match modifie
    else jeton refuse
        A-->>I: 401
        I->>I: ferme la session, va a /connexion
        I-->>C: l'erreur, transmise
    end
```

`intercepteurs/authentification.ts` :

```ts
export const intercepteurAuthentification: HttpInterceptorFn = (requete, suivant) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const jeton = auth.jeton();

  /*
   * Le jeton ne part QUE vers notre API.
   *
   * A partir de l'etape 11, l'application appellera d'autres serveurs. Leur
   * envoyer le jeton reviendrait a leur confier la cle de nos comptes : un
   * jeton « Bearer » appartient a quiconque le porte.
   */
  if (jeton === null || !requete.url.startsWith(environment.urlApi)) {
    return suivant(requete);
  }

  // Une requete HttpClient est IMMUABLE : on ne la modifie pas, on en cree une
  // copie modifiee avec clone().
  const requeteAvecJeton = requete.clone({
    setHeaders: { Authorization: `Bearer ${jeton}` },
  });

  return suivant(requeteAvecJeton).pipe(
    catchError((erreur: unknown) => {
      if (erreur instanceof HttpErrorResponse && erreur.status === 401) {
        auth.deconnecter();

        // Deja sur la page de connexion : inutile d'y renvoyer, et
        // « retour=/connexion » ferait tourner en rond.
        if (!router.url.startsWith('/connexion')) {
          void router.navigate(['/connexion'], {
            queryParams: { raison: 'session-expiree', retour: router.url },
          });
        }
      }

      // L'erreur continue son chemin : le composant qui a lance la requete
      // doit toujours pouvoir y reagir.
      return throwError(() => erreur);
    }),
  );
};
```

Trois points à retenir :

- Le test de l'adresse est une mesure de **sécurité** : un jeton envoyé à un serveur tiers serait un jeton donné.
- `catchError` intercepte l'erreur **au retour**. Un `401` sur une requête qui portait un jeton signifie que la session est périmée : on la ferme, et on propose de se reconnecter en revenant ensuite à la page en cours. Un `403`, lui, ne ferme **pas** la session — le jeton est valide, c'est le rôle qui manque.
- `throwError(() => erreur)` **relance** l'erreur. L'avaler laisserait le composant attendre une réponse qui ne viendra jamais.

L'intercepteur est branché une fois pour toutes, dans `app.config.ts` :

```ts
    provideHttpClient(withInterceptors([intercepteurAuthentification])),
```

Aucun service n'a eu à changer.

### 4.15 La garde

`gardes/authentification.ts` empêche d'ouvrir les formulaires sans être administrateur :

```ts
export const administrateurRequis: CanActivateFn = (_route, etat) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.estConnecte()) {
    // On memorise la page demandee : apres la connexion, on y reviendra.
    return router.createUrlTree(['/connexion'], { queryParams: { retour: etat.url } });
  }

  if (!auth.estAdministrateur()) {
    return router.createUrlTree(['/acces-refuse']);
  }

  return true;
};
```

Une **garde** est une fonction que le routeur consulte **avant** d'afficher une page. Elle répond `true` pour laisser passer, ou une `UrlTree` — une adresse — pour rediriger. Les deux cas d'échec reprennent la distinction du § 2.1 : **anonyme** → page de connexion ; **connecté sans le rôle** → page « accès réservé ».

Elle s'applique route par route :

```ts
  {
    path: 'matchs/nouveau',
    component: MatchFormulaire,
    canActivate: [administrateurRequis],
    title: 'Nouveau match — Suivi Compétition',
  },
```

### 4.16 Les pages de connexion et d'inscription

Les deux pages reprennent la construction Signal Forms de l'étape 7. Quelques détails leur sont propres.

**Aider les gestionnaires de mots de passe.** L'attribut `autocomplete` dit au navigateur ce que contient chaque champ :

```html
<input id="connexion-email" type="email" autocomplete="email" ... />
<input id="connexion-mot-de-passe" type="password" autocomplete="current-password" ... />
```

À l'inscription, `autocomplete="new-password"` invite le gestionnaire à **proposer** un mot de passe généré. Ce n'est pas un détail : un gestionnaire bien renseigné, c'est un mot de passe long et unique qu'on n'a pas besoin de retenir — la meilleure protection possible.

**La confirmation reste dans le navigateur.** Elle protège d'une faute de frappe invisible — les caractères sont masqués — mais n'est jamais envoyée :

```ts
      validate(chemin.confirmation, ({ value, valueOf }) =>
        value() !== valueOf(chemin.motDePasse)
          ? { kind: 'confirmation', message: 'Les deux mots de passe ne correspondent pas.' }
          : undefined,
      );
```

```ts
    // La confirmation est laissee de cote : le serveur n'en a que faire.
    const { pseudo, email: adresse, motDePasse } = this.champs();
```

**Un écart trouvé grâce aux captures.** La première version du formulaire utilisait la règle toute faite `email()` de Signal Forms. La capture d'écran d'un formulaire rempli de fautes a révélé que `benjamin@exemple` n'affichait **aucune** erreur. `email()` suit la norme HTML, qui accepte une adresse sans point — alors que le backend la refuse. Le formulaire aurait laissé passer la saisie, pour afficher une erreur serveur juste après. Il reprend désormais **exactement** la règle du backend :

```ts
/** Memes regles que le backend (validation/auth.validation.ts). */
const FORMAT_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      pattern(chemin.email, FORMAT_EMAIL, { message: 'Adresse email invalide.' });
```

La leçon dépasse l'email : **le formulaire et l'API doivent appliquer les mêmes règles.** Plus strict, le formulaire refuserait des saisies que l'API accepte ; plus tolérant, il promettrait un succès que l'API refusera.

**L'adresse de retour.** La page de connexion reçoit dans son adresse la page où revenir : `/connexion?retour=/matchs/nouveau`. Or tout ce qui est dans une adresse peut être fabriqué. Un attaquant pourrait envoyer à sa victime un lien vers la **vraie** page de connexion du site, avec `retour=https://site-pirate.example`. La victime vérifie l'adresse, voit le bon site, se connecte… et atterrit sur une copie qui lui redemande son mot de passe. C'est une **redirection ouverte**.

`outils/adresse-retour.ts` n'accepte qu'un chemin **interne** :

```ts
export function adresseDeRetour(retour: string | null | undefined): string {
  if (
    typeof retour !== 'string' ||
    // Doit commencer par une seule barre oblique : « /matchs ».
    !retour.startsWith('/') ||
    // « //site-pirate.example » designe un AUTRE site pour le navigateur.
    retour.startsWith('//') ||
    // « /\site-pirate.example » aussi, pour certains navigateurs.
    retour.startsWith('/\\')
  ) {
    return '/';
  }

  return retour;
}
```

La deuxième condition est la plus surprenante : pour un navigateur, `//site-pirate.example` n'est pas un chemin, mais une adresse **sans protocole**, qui mène vers un autre site.

### 4.17 Le bandeau et les actions réservées

Le bandeau affiche la session, entre la navigation et le bouton de thème :

```html
<div class="session">
  @if (auth.utilisateur(); as utilisateur) {
    <span class="session-pseudo">
      {{ utilisateur.pseudo }}
      @if (auth.estAdministrateur()) {
        <span class="session-role">admin</span>
      }
    </span>
    <button type="button" class="session-bouton" (click)="deconnecter()">Déconnexion</button>
  } @else {
    <a class="session-bouton" routerLink="/connexion">Connexion</a>
  }
</div>
```

`@if (… ; as utilisateur)` range le résultat du test dans une variable locale au bloc : on écrit `utilisateur.pseudo` au lieu de rappeler `auth.utilisateur()` à chaque usage.

Dans le composant, le service est déclaré `protected` :

```ts
  protected readonly auth = inject(AuthService);
```

Un membre `private` ne serait pas accessible au gabarit ; `protected` le rend visible au gabarit sans l'exposer au reste du code.

Sur les pages Matchs et Compétitions, les actions d'édition ne s'affichent qu'aux administrateurs :

```html
  <!-- Etape 8 : reserve aux administrateurs. Masquer le bouton est du CONFORT ;
       la SECURITE, c'est le backend qui refuse la requete (401 / 403). -->
  @if (auth.estAdministrateur()) {
    <a class="bouton bouton--principal" routerLink="/matchs/nouveau">Nouveau match</a>
  }
```

### 4.18 Les tests

**86 tests**, tous au vert (contre 50 à l'étape 7). Les nouveaux couvrent chaque pièce de l'authentification. Quelques-uns méritent d'être lus.

L'intercepteur ne doit **jamais** envoyer le jeton ailleurs :

```ts
  it("n'envoie JAMAIS le jeton a un autre serveur", () => {
    preparer(fabriquerJeton());

    http.get('https://api.autre-service.example/donnees').subscribe();

    const requete = httpMock.expectOne('https://api.autre-service.example/donnees');
    expect(requete.request.headers.has('Authorization')).toBe(false);
    requete.flush({});
  });
```

La garde renvoie chaque profil au bon endroit :

```ts
  it('renvoie une personne anonyme vers la connexion, en retenant la page demandee', async () => {
    expect(await tenterDOuvrir(null)).toBe('/connexion?retour=%2Fmatchs%2Fnouveau');
  });

  it('renvoie un simple utilisateur vers la page « acces reserve »', async () => {
    expect(await tenterDOuvrir('utilisateur')).toBe('/acces-refuse');
  });

  it('laisse passer un administrateur', async () => {
    expect(await tenterDOuvrir('administrateur')).toBe('/matchs/nouveau');
  });
```

La redirection ouverte est refusée sous toutes ses formes :

```ts
  it('refuse toute adresse qui sortirait du site', () => {
    expect(adresseDeRetour('https://site-pirate.example')).toBe('/');
    expect(adresseDeRetour('//site-pirate.example')).toBe('/');
    expect(adresseDeRetour('/\\site-pirate.example')).toBe('/');
    expect(adresseDeRetour('javascript:alert(1)')).toBe('/');
  });
```

Pour simuler une session, les tests fabriquent un **faux jeton**, dans `src/testing/jetons-de-test.ts`, avec une signature bidon. C'est possible précisément parce que le frontend ne vérifie jamais la signature — et c'est une démonstration de plus que ses vérifications ne sont que du confort.

**Le parcours complet dans un vrai navigateur.** Comme à l'étape 7, un scénario a été joué dans Edge contre la vraie API. Résultats réels :

```
- anonyme /matchs : bouton Nouveau match = 0, liens Modifier = 0
- anonyme /matchs/nouveau -> /connexion?retour=/matchs/nouveau
- inscription -> /, bandeau : « Visiteur Déconnexion »
- utilisateur /matchs/nouveau -> /acces-refuse
- deconnexion -> bandeau : « Connexion », jeton stocke : null
- mot de passe faux : « Email ou mot de passe incorrect. » (reste sur /connexion)
- admin connecte -> /matchs/nouveau, titre : Nouveau match, bandeau : « Essai ADMIN Déconnexion »
- admin /matchs : bouton Nouveau match = 1, liens Modifier = 8
- faux jeton : le frontend ouvre quand meme le formulaire (garde = confort) -> /competitions/lol/modifier
- enregistrement refuse par l'API -> /connexion?raison=session-expiree&retour=/competitions/lol/modifier
- message : « Ta session a expiré. Reconnecte-toi pour continuer. », jeton stocke : null
```

Les deux dernières lignes sont la démonstration du § 2.6. Le jeton a été remplacé dans le stockage par une version à la signature falsifiée : le frontend, qui ne sait pas vérifier une signature, ouvre le formulaire. L'API, elle, refuse l'enregistrement — et l'intercepteur ramène proprement à la connexion.

## 5. Livrable attendu

Une personne anonyme voit la page de connexion depuis le bandeau :

![Page de connexion en thème clair](docs/images/etape-08-clair-connexion.png)

Le formulaire d'inscription applique les mêmes règles que l'API :

![Formulaire d'inscription avec une adresse sans point, un mot de passe trop court et une confirmation différente](docs/images/etape-08-clair-inscription-erreurs.png)

Un administrateur retrouve les actions d'édition, et son rôle dans le bandeau :

![Page Matchs en thème sombre, connecté en administrateur : badge ADMIN, bouton Nouveau match et liens Modifier](docs/images/etape-08-sombre-matchs-administrateur.png)

Une personne connectée sans ce rôle est arrêtée par la garde :

![Page « Accès réservé » en thème clair](docs/images/etape-08-clair-acces-refuse.png)

Ce qui doit fonctionner :

- le serveur **refuse de démarrer** sans `JWT_SECRET` ;
- `POST /api/auth/inscription` crée un compte `utilisateur` et renvoie un jeton ;
- `POST /api/auth/connexion` renvoie un jeton, ou `401` avec le même message pour une adresse inconnue et un mot de passe faux ;
- les écritures sur compétitions et matchs répondent `401` sans jeton, `403` pour un utilisateur, et fonctionnent pour un administrateur ;
- un jeton falsifié, `alg: none` ou expiré est refusé ;
- 10 échecs de connexion en 15 minutes déclenchent un `429` ;
- côté interface : inscription, connexion, déconnexion, retour à la page demandée, actions d'édition visibles des seuls administrateurs ;
- `npm run verifier` (backend) et `npx ng test --watch=false` (frontend) passent.

**À faire toi-même, pour devenir administrateur :**

1. démarre le backend et le frontend ;
2. crée ton compte depuis la page **Créer un compte** ;
3. dans un terminal, depuis `backend/` : `npm run utilisateur:promouvoir -- ton-adresse@exemple.fr` ;
4. déconnecte-toi, puis reconnecte-toi : le badge **ADMIN** apparaît.

## 6. Checklist d'auto-vérification

1. Quelle est la différence entre authentification et autorisation ? Donne, pour chacune, le code HTTP d'échec et un cas du projet.
   - *À relire :* § 2.1 « Authentification et autorisation »
2. Pourquoi ne pas stocker les mots de passe, même chiffrés ? Pourquoi Argon2 plutôt que SHA-256, et à quoi sert le sel ?
   - *À relire :* § 2.2 « Un mot de passe ne se stocke jamais »
3. Décode mentalement un JWT : que contiennent ses trois parties ? Pourquoi peut-on le lire sans secret, et pourquoi ne peut-on pas le modifier ?
   - *À relire :* § 2.3 « Le jeton JWT » et § 4.5 « Fabriquer et vérifier les jetons »
4. Après avoir été promu administrateur, pourquoi faut-il se reconnecter ? Quel défaut général des jetons « sans état » cela illustre-t-il ?
   - *À relire :* § 2.3 (le prix du sans état) et § 4.12 « Tester l'API — et l'attaquer »
5. Pourquoi la connexion renvoie-t-elle le même message — et met-elle le même temps — pour une adresse inconnue et un mot de passe faux ?
   - *À relire :* § 4.4 « Hacher les mots de passe » (attaque temporelle) et § 4.8 « Les contrôleurs d'authentification »
6. La garde `administrateurRequis` et le bouton masqué empêchent-ils un utilisateur de supprimer un match ? Qu'est-ce qui l'en empêche réellement ?
   - *À relire :* § 2.6 « Le frontend adapte, le backend protège » et § 4.18 « Les tests »
7. Que fait l'intercepteur à l'aller, et au retour ? Pourquoi vérifie-t-il l'adresse de la requête avant d'ajouter le jeton ?
   - *À relire :* § 4.14 « L'intercepteur »
8. Pourquoi l'adresse `/connexion?retour=//site-pirate.example` est-elle dangereuse, et comment le projet s'en protège-t-il ?
   - *À relire :* § 4.16 « Les pages de connexion et d'inscription » (l'adresse de retour)

## 7. Branche d'arrivée

À la fin de cette étape, ton code doit être poussé sur **`etape-08-authentification`**.

L'étape suivante partira de cette branche pour créer `etape-09-favoris`. Maintenant que chaque personne a un compte, elle pourra y attacher ses équipes favorites — une relation « plusieurs à plusieurs » entre utilisateurs et équipes.

---

# Étape 9 — Favoris utilisateur

## 1. Objectifs

À la fin de cette étape, tu dois savoir :

- modéliser une relation **« plusieurs à plusieurs »** avec une **table de liaison** et une **clé primaire composée** ;
- choisir entre **refuser** et **supprimer en cascade** quand une ligne référencée disparaît ;
- concevoir des adresses d'API qui empêchent de parler au nom de quelqu'un d'autre (`/api/moi/...`) ;
- rendre une action **idempotente** côté serveur, et expliquer pourquoi c'est utile ;
- mettre à jour une interface **de façon optimiste**, avec retour en arrière en cas d'échec ;
- relier un signal à une action extérieure avec **`effect()`**.

## 2. Concepts abordés

### 2.1 La relation « plusieurs à plusieurs »

Jusqu'ici, toutes les relations du projet étaient **« un à plusieurs »** : une compétition accueille plusieurs matchs, un match appartient à une seule compétition. La clé étrangère se range naturellement du côté « plusieurs » : la table `matchs` porte une colonne `competition_id`.

Les favoris ne rentrent pas dans ce moule. **Une personne suit plusieurs équipes, et une équipe est suivie par plusieurs personnes.** Où ranger la clé étrangère ?

- Dans `utilisateurs`, une colonne `equipe_id` ne permettrait de suivre qu'**une** équipe.
- Dans `equipes`, une colonne `utilisateur_id` ne permettrait qu'à **une** personne de la suivre.
- Une colonne contenant une liste d'identifiants (`"kc,psg,fnc"`) casserait tout ce qu'apporte une base : plus de clé étrangère pour garantir que les équipes existent, plus d'index, plus de requête simple.

La solution est une troisième table, dite **table de liaison**, dont chaque ligne dit simplement « **cette personne suit cette équipe** » :

```mermaid
erDiagram
    UTILISATEURS ||--o{ FAVORIS : "choisit"
    EQUIPES ||--o{ FAVORIS : "est choisie dans"

    UTILISATEURS {
        string id PK
        string email
        string pseudo
    }

    FAVORIS {
        string utilisateur_id PK,FK
        string equipe_id PK,FK
        datetime cree_le
    }

    EQUIPES {
        string id PK
        string nom
        string trigramme
    }
```

Une relation « plusieurs à plusieurs » n'existe donc pas vraiment en base : c'est **deux relations « un à plusieurs »** qui se rejoignent dans la table du milieu. Si Alice suit KC et PSG, et Bob suit OM, la table contient trois lignes :

| utilisateur_id | equipe_id | cree_le |
|---|---|---|
| *(id d'Alice)* | `kc` | 2026-09-17 17:26 |
| *(id d'Alice)* | `psg` | 2026-09-17 17:26 |
| *(id de Bob)* | `om` | 2026-09-17 17:26 |

Prisma sait créer cette table **tout seul** : il suffit d'écrire `equipes Equipe[]` d'un côté et `utilisateurs Utilisateur[]` de l'autre — c'est la relation « implicite ». Le projet l'écrit plutôt **explicitement**, pour deux raisons : la voir, plutôt que de laisser une table apparaître par magie ; et pouvoir y ranger une information propre au **lien** — ici, la date à laquelle l'équipe a été suivie.

### 2.2 La clé primaire composée

Quelle est la clé primaire d'une ligne de `favoris` ? Aucune des deux colonnes ne suffit seule : Alice apparaît plusieurs fois, KC aussi. C'est le **couple** qui est unique.

```prisma
@@id([utilisateurId, equipeId])
```

Une **clé primaire composée** est faite de plusieurs colonnes. Elle apporte deux garanties d'un coup : chaque ligne est identifiable, et **la même personne ne peut pas suivre deux fois la même équipe** — c'est la base qui le refuse, pas le code.

Une clé primaire crée aussi un **index**, et l'ordre des colonnes compte. Un index sur `(utilisateur_id, equipe_id)` fonctionne comme un annuaire trié par nom puis par prénom : il permet de trouver très vite « toutes les lignes d'Alice », mais pas « toutes les lignes de KC ». Pour cette seconde question, un index supplémentaire est posé sur `equipe_id`.

### 2.3 Refuser, ou supprimer en cascade ?

Que doit-il se passer quand on supprime un compte qui a des favoris ? Les clés étrangères de l'étape 6 étaient en `ON DELETE RESTRICT` : la base **refuse** de supprimer une compétition tant que des matchs y font référence (étape 7).

Pour les favoris, le choix inverse s'impose : `ON DELETE CASCADE`, qui **supprime automatiquement** les lignes qui dépendent de celle qu'on efface.

| | Compétition → matchs | Utilisateur → favoris |
|---|---|---|
| Règle | `RESTRICT` : refuser | `CASCADE` : supprimer aussi |
| Les lignes dépendantes ont-elles une valeur seules ? | **oui** : l'historique des matchs | **non** : un favori sans personne ne sert à rien |
| Risque d'une suppression en cascade | effacer des dizaines de matchs par un clic | aucun |

La question à se poser n'est pas technique : **les données dépendantes ont-elles encore un sens sans leur parent ?** Si oui, on protège ; sinon, on nettoie. Le § 4.4 vérifie la cascade sur la vraie base.

### 2.4 Des adresses qui ne disent pas « qui »

Une façon intuitive de concevoir l'API serait :

```
GET  /api/utilisateurs/df2147a3-.../favoris
PUT  /api/utilisateurs/df2147a3-.../favoris/kc
```

Le problème : l'identifiant de l'utilisateur est dans l'**adresse**, c'est-à-dire entre les mains du client. Il faudrait vérifier, sur **chaque** route, qu'il correspond bien à la personne du jeton. Le premier oubli permettrait de modifier les favoris de n'importe qui en changeant quelques caractères dans l'URL.

Cette faille est l'une des plus répandues sur le web. Elle porte un nom : **IDOR** (*Insecure Direct Object Reference*, référence directe non sécurisée à un objet).

Le projet l'élimine par construction :

```
GET    /api/moi/favoris
PUT    /api/moi/favoris/kc
DELETE /api/moi/favoris/kc
```

« Moi », c'est la personne du **jeton**, vérifié par `authentifier()`. Il n'y a aucun identifiant d'utilisateur à falsifier, donc aucune vérification à oublier.

### 2.5 Suivre deux fois la même équipe

Que doit répondre l'API si l'on demande de suivre une équipe déjà suivie ? Ou de ne plus suivre une équipe qu'on ne suivait pas ?

On pourrait répondre `409` dans le premier cas et `404` dans le second. Mais la demande exprime en réalité un **état voulu** — « cette équipe est suivie », « cette équipe ne l'est pas » — et cet état est atteint. Le projet répond donc `204` dans tous les cas.

C'est l'**idempotence** de l'étape 7 : rejouer la requête ne change rien. Elle a ici une conséquence très concrète. Si un réseau instable fait renvoyer une requête, ou si deux onglets ouverts envoient la même, rien ne casse et aucun message d'erreur absurde n'apparaît.

C'est aussi ce qui justifie le choix des méthodes : **`PUT`** pour suivre (fixer un état, idempotent) plutôt que `POST` (créer quelque chose de nouveau à chaque appel), et **`DELETE`** pour ne plus suivre.

### 2.6 La mise à jour optimiste

Quand on clique sur l'étoile d'une équipe, deux façons de faire sont possibles.

**Pessimiste** : envoyer la requête, attendre la réponse, puis changer l'affichage. C'est sûr, mais l'interface paraît lente : sur une connexion mobile, plusieurs centaines de millisecondes s'écoulent entre le clic et l'étoile qui se remplit.

**Optimiste** : changer l'affichage **tout de suite**, envoyer la requête, et **revenir en arrière** dans le cas rare où le serveur refuse.

```mermaid
sequenceDiagram
    actor U as Utilisateur
    participant I as Interface
    participant A as API

    U->>I: clique sur Favori KC
    I->>I: etoile remplie immediatement
    I->>A: PUT /api/moi/favoris/kc
    alt le serveur accepte (cas normal)
        A-->>I: 204
        Note over I: rien a faire, l'affichage etait deja juste
    else le serveur refuse ou ne repond pas
        A-->>I: 500 ou erreur reseau
        I->>I: etoile videe a nouveau
        I-->>U: message d'erreur
    end
```

Les jeux vidéo en ligne font exactement cela, sous le nom de **prédiction côté client** : ton personnage avance dès que tu appuies sur la touche, sans attendre la confirmation du serveur — qui corrige sa position dans les rares cas où il n'est pas d'accord. Sans cette technique, chaque mouvement aurait le retard du réseau.

La mise à jour optimiste convient quand **l'échec est rare** et **le retour en arrière sans gravité**. Elle ne conviendrait pas à un paiement : afficher « commande validée » avant la réponse de la banque serait un mensonge.

Elle impose une précaution. Si l'on clique deux fois très vite, l'interface envoie un `PUT` puis un `DELETE`. Rien ne garantit que les réponses reviennent dans cet ordre : l'écran et la base pourraient finir par dire deux choses différentes. Le projet **ignore donc un clic** sur une équipe tant que la requête précédente pour cette même équipe n'est pas terminée.

### 2.7 `effect()` : quand un signal doit agir sur le monde extérieur

`computed()`, rencontré à l'étape 5, calcule une **valeur** à partir d'autres signaux. Mais charger les favoris quand une personne se connecte n'est pas un calcul : c'est une **action** — une requête HTTP.

`effect()` exécute une fonction **à chaque fois que les signaux qu'elle lit changent** :

```ts
effect(() => {
  const id = this.idUtilisateur(); // signal lu : l'effet se relancera s'il change

  if (id === null) {
    this.equipes.set([]);
  } else {
    this.charger(id);
  }
});
```

| | `computed()` | `effect()` |
|---|---|---|
| Sert à | calculer une valeur dérivée | déclencher une action |
| Renvoie | un signal en lecture seule | rien |
| Exemples du projet | `estAdministrateur`, `matchsEnDirect` | charger ou oublier les favoris |

`effect()` est puissant, et à utiliser avec parcimonie : une valeur qui **se calcule** doit rester un `computed()`. On réserve `effect()` aux liens avec l'extérieur — le réseau, le stockage du navigateur.

## 3. Prérequis

Pars de la branche **`etape-08-authentification`**.

```
git checkout etape-08-authentification
git checkout -b etape-09-favoris
```

PostgreSQL doit être démarré, et `JWT_SECRET` renseigné (étape 8). Si tu récupères directement la branche `etape-09-favoris`, applique la nouvelle migration depuis `backend/` :

```
npm run bdd:migrer
```

## 4. Déroulé détaillé

### 4.1 Le schéma et la migration

Dans `prisma/schema.prisma`, le nouveau modèle :

```prisma
/// Etape 9 : une equipe suivie par un utilisateur.
model Favori {
  utilisateurId String      @map("utilisateur_id")
  /// onDelete: Cascade -- supprimer un compte supprime ses favoris.
  /// Le contraire de l'etape 7 (RESTRICT pour les matchs d'une competition) :
  /// un favori n'a aucune valeur sans la personne qui l'a choisi.
  utilisateur   Utilisateur @relation(fields: [utilisateurId], references: [id], onDelete: Cascade)

  equipeId String @map("equipe_id")
  equipe   Equipe @relation(fields: [equipeId], references: [id], onDelete: Cascade)

  creeLe DateTime @default(now()) @map("cree_le")

  /// Cle primaire COMPOSEE des deux colonnes : un utilisateur ne peut suivre
  /// la meme equipe qu'une seule fois. C'est la base qui le garantit.
  @@id([utilisateurId, equipeId])

  /// La cle primaire sert deja d'index pour « les equipes d'un utilisateur »
  /// (utilisateur_id en premier). Cet index-ci sert la question inverse :
  /// « qui suit cette equipe ? ».
  @@index([equipeId])

  @@map("favoris")
}
```

Et, de chaque côté de la relation, le champ qui permet de la parcourir :

```prisma
model Utilisateur {
  // ...
  /// Etape 9 : les equipes que cette personne suit.
  favoris Favori[]
}

model Equipe {
  // ...
  /// Etape 9 : les personnes qui suivent cette equipe (voir le modele Favori).
  favoris Favori[]
}
```

```
npx prisma migrate dev --name favoris
npx prisma generate
```

Le SQL produit :

```sql
CREATE TABLE "favoris" (
    "utilisateur_id" TEXT NOT NULL,
    "equipe_id" TEXT NOT NULL,
    "cree_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favoris_pkey" PRIMARY KEY ("utilisateur_id","equipe_id")
);

CREATE INDEX "favoris_equipe_id_idx" ON "favoris"("equipe_id");

ALTER TABLE "favoris" ADD CONSTRAINT "favoris_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id")
  REFERENCES "utilisateurs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "favoris" ADD CONSTRAINT "favoris_equipe_id_fkey" FOREIGN KEY ("equipe_id")
  REFERENCES "equipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

Remarque `PRIMARY KEY ("utilisateur_id","equipe_id")` : une seule contrainte, sur deux colonnes. Et `ON DELETE CASCADE`, là où la migration de l'étape 6 écrivait `ON DELETE RESTRICT`.

### 4.2 Le dépôt

`src/depots/favoris.depot.ts` contient trois fonctions. La lecture interroge la relation :

```ts
export async function listerEquipesSuivies(utilisateurId: string): Promise<Equipe[]> {
  return prisma.equipe.findMany({
    where: { favoris: { some: { utilisateurId } } },
    orderBy: { nom: 'asc' },
  });
}
```

La requête part des **équipes**, et filtre sur la relation : « les équipes dont **au moins un** favori appartient à cette personne ». C'est le sens de `some`. Prisma en fait une jointure SQL avec la table `favoris` : on obtient les équipes directement, sans passer par une liste d'identifiants intermédiaire. Deux cousins existent : `every` (toutes les lignes liées vérifient la condition) et `none` (aucune).

Suivre une équipe :

```ts
export async function ajouterFavori(
  utilisateurId: string,
  equipeId: string,
): Promise<'ajoute' | 'equipe-inconnue'> {
  try {
    await prisma.favori.upsert({
      // La cle primaire composee se designe par le nom que Prisma lui donne :
      // les deux champs, relies par un tiret bas.
      where: { utilisateurId_equipeId: { utilisateurId, equipeId } },
      create: { utilisateurId, equipeId },
      update: {},
    });
    return 'ajoute';
  } catch (erreur) {
    // Deux requetes simultanees pour le meme favori : la seconde se heurte a
    // la cle primaire. Le resultat voulu -- l'equipe est suivie -- est
    // atteint : ce n'est pas une erreur.
    if (aLeCodePrisma(erreur, CODE_PRISMA.valeurDejaPrise)) {
      return 'ajoute';
    }
    // La cle etrangere vers equipes est refusee : l'equipe n'existe pas.
    if (aLeCodePrisma(erreur, CODE_PRISMA.cleEtrangere)) {
      return 'equipe-inconnue';
    }
    throw erreur;
  }
}
```

`upsert` avec une mise à jour **vide** signifie « crée si absent, sinon ne touche à rien » : l'idempotence du § 2.5, écrite en une instruction. Et la situation de concurrence de l'étape 7 — deux requêtes identiques au même instant — est traitée comme ce qu'elle est : le résultat voulu, atteint.

Ne plus suivre :

```ts
export async function retirerFavori(utilisateurId: string, equipeId: string): Promise<void> {
  await prisma.favori.deleteMany({ where: { utilisateurId, equipeId } });
}
```

`deleteMany` plutôt que `delete` : `delete` lève une erreur (`P2025`) quand la ligne n'existe pas, `deleteMany` renvoie simplement « 0 ligne supprimée ». Ne plus suivre une équipe qu'on ne suivait pas n'est pas un échec.

### 4.3 Les contrôleurs et le routeur `/moi`

`src/controleurs/favoris.controleur.ts` :

```ts
/** PUT /api/moi/favoris/:equipeId  ->  suit une equipe. */
export async function suivreEquipe(
  requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    const equipeId = lireParametre(requete, 'equipeId');
    const resultat = await ajouterFavori(idUtilisateurConnecte(requete), equipeId);

    if (resultat === 'equipe-inconnue') {
      reponse.status(404).json({ erreur: 'Équipe introuvable', id: equipeId });
      return;
    }

    reponse.status(204).end();
  } catch (erreur) {
    suivant(erreur);
  }
}
```

L'identifiant de la personne vient toujours du **jeton**, par un petit outil ajouté à `controleurs/outils.ts` :

```ts
/**
 * A utiliser uniquement dans une route protegee par authentifier(), qui
 * range la personne dans requete.utilisateur. Si elle est absente, ce n'est
 * pas la faute du client : la route a ete declaree sans le middleware. C'est
 * un bug du serveur, d'ou une erreur -- qui deviendra un 500 -- plutot qu'un
 * 401 qui masquerait l'oubli.
 */
export function idUtilisateurConnecte(requete: Request): string {
  if (requete.utilisateur === undefined) {
    throw new Error('Route protégée déclarée sans le middleware authentifier()');
  }
  return requete.utilisateur.id;
}
```

Le nouveau routeur, `src/routes/moi.routes.ts`, protège **toutes** ses routes d'un coup :

```ts
export const routeurMoi = Router();

/*
 * router.use() place le middleware devant TOUTES les routes de ce routeur,
 * celles declarees ci-dessous comme celles qui s'ajouteront plus tard.
 * Impossible d'oublier authentifier() sur une nouvelle route « moi » : il
 * n'y a nulle part ou l'oublier.
 */
routeurMoi.use(authentifier);

routeurMoi.get('/favoris', obtenirFavoris);
routeurMoi.put('/favoris/:equipeId', suivreEquipe);
routeurMoi.delete('/favoris/:equipeId', nePlusSuivreEquipe);
```

À l'étape 8, les gardiens étaient placés route par route. Ici, **toutes** les routes « moi » concernent la personne connectée : un middleware au niveau du routeur exprime cette règle une seule fois.

### 4.4 Tester l'API

Scénario joué contre la vraie API, avec deux comptes de test, Alice et Bob. Résultats réels :

```
GET /moi/favoris sans jeton                        -> 401 {"erreur":"Authentification requise"}
GET /moi/favoris (Alice, au depart)                -> 200 []
PUT /moi/favoris/kc (Alice)                        -> 204
PUT /moi/favoris/kc (Alice, une seconde fois)      -> 204      (idempotent)
PUT /moi/favoris/psg (Alice)                       -> 204
PUT /moi/favoris/fnc (Alice)                       -> 204
PUT /moi/favoris/echecs (equipe inexistante)       -> 404 {"erreur":"Équipe introuvable","id":"echecs"}
GET /moi/favoris (Alice)                           -> 200 FNC, KC, PSG   (tries par nom)
PUT /moi/favoris/om (Bob)                          -> 204
GET /moi/favoris (Bob)                             -> 200 OM             (chacun ses favoris)
DELETE /moi/favoris/psg (Alice)                    -> 204
DELETE /moi/favoris/psg (Alice, une seconde fois)  -> 204      (idempotent)
GET /moi/favoris (Alice)                           -> 200 FNC, KC
```

Puis, directement dans la base, la vérification de la cascade :

```
table favoris : Bob -> om | Alice -> fnc | Alice -> kc
compte Alice supprime ; favoris restants pour Alice : 0 | lignes favoris au total : 1
compte Bob supprime ; lignes favoris au total : 0 | utilisateurs : 0 | equipes : 14
```

Supprimer Alice a supprimé ses deux favoris, et seulement les siens. Les quatorze équipes, elles, sont intactes : la cascade ne remonte pas vers la table parente.

### 4.5 Le service de favoris

Côté Angular, `services/favoris.ts` est partagé par la page Équipes et la page Matchs. Cliquer sur une étoile dans l'une met à jour l'autre instantanément, puisque toutes deux lisent les mêmes signaux.

```ts
  private readonly equipes = signal<Equipe[]>([]);

  /** Les equipes suivies, triees par nom. */
  readonly equipesSuivies = this.equipes.asReadonly();

  /**
   * Les identifiants des equipes suivies, dans un Set.
   *
   * Un Set repond a « contient-il kc ? » immediatement, quelle que soit sa
   * taille -- la ou un tableau devrait etre parcouru. La page Matchs pose
   * cette question pour chaque equipe de chaque match.
   */
  readonly idsSuivis = computed(() => new Set(this.equipes().map((equipe) => equipe.id)));

  /** Les equipes dont une requete est en cours (bouton desactive). */
  readonly enCours = signal<ReadonlySet<string>>(new Set());
```

Un **`Set`** est une collection sans doublon, optimisée pour une question : « cet élément est-il dedans ? ». Avec un tableau, `includes('kc')` parcourt les éléments un à un ; avec un `Set`, `has('kc')` répond immédiatement, quelle que soit sa taille.

Le chargement suit la session, avec l'`effect()` du § 2.7 :

```ts
  /**
   * computed() ne previent ses lecteurs que si la VALEUR change. Deux jetons
   * successifs de la meme personne donnent le meme identifiant : les favoris
   * ne sont pas recharges pour rien.
   */
  private readonly idUtilisateur = computed(() => this.auth.utilisateur()?.id ?? null);

  constructor() {
    effect(() => {
      const id = this.idUtilisateur();
      this.erreur.set(null);

      if (id === null) {
        this.equipes.set([]);
      } else {
        this.charger(id);
      }
    });
  }
```

L'effet dépend de l'**identifiant**, et non de `estConnecte()`. Pourquoi ? Si quelqu'un se connecte avec un autre compte sans s'être déconnecté, `estConnecte()` reste `true` d'un bout à l'autre : l'effet ne se relancerait pas, et les favoris du compte précédent resteraient affichés.

Le chargement se protège d'un dernier piège :

```ts
        next: (equipes) => {
          // La personne a pu se deconnecter pendant le chargement : on ne range
          // pas ses favoris sous le nom de quelqu'un d'autre.
          if (this.idUtilisateur() === idUtilisateur) {
            this.equipes.set(equipes);
          }
        },
```

Puis la mise à jour optimiste du § 2.6 :

```ts
  private modifier(equipe: Equipe, action: 'ajouter' | 'retirer'): void {
    // Un clic pendant qu'une requete sur la meme equipe est en cours est
    // ignore. Sans cela, un double clic enverrait PUT puis DELETE, et si les
    // reponses arrivaient dans le desordre, l'ecran et la base ne diraient
    // plus la meme chose.
    if (this.enCours().has(equipe.id)) {
      return;
    }

    this.erreur.set(null);
    this.appliquer(equipe, action);
    this.marquerEnCours(equipe.id, true);

    const adresse = `${this.url}/${encodeURIComponent(equipe.id)}`;
    const requete =
      action === 'ajouter' ? this.http.put<void>(adresse, null) : this.http.delete<void>(adresse);

    requete.subscribe({
      next: () => this.marquerEnCours(equipe.id, false),
      error: (erreur) => {
        // Retour en arriere : on applique l'action INVERSE sur cette seule
        // equipe. Restaurer une copie de toute la liste effacerait les autres
        // favoris modifies entre-temps.
        this.appliquer(equipe, action === 'ajouter' ? 'retirer' : 'ajouter');
        this.marquerEnCours(equipe.id, false);
        this.erreur.set(messageErreurApi(erreur, `Impossible de modifier le suivi de ${equipe.nom}.`));
      },
    });
  }
```

L'ordre des trois premières lignes est tout le principe : on **applique** (l'écran change), on **marque en cours** (les clics suivants sont ignorés), et seulement ensuite on **envoie**.

Le retour en arrière mérite qu'on s'y arrête. La solution naïve serait de garder une copie de la liste avant le clic, et de la restaurer en cas d'échec. Mais pendant la requête, la personne a pu cliquer sur **une autre** équipe : restaurer l'ancienne copie annulerait aussi ce second changement, qui lui a réussi. Le projet applique donc l'action **inverse**, sur cette seule équipe.

Un détail sur les signaux, enfin :

```ts
  private marquerEnCours(equipeId: string, enCours: boolean): void {
    this.enCours.update((ensemble) => {
      // Un signal ne detecte un changement que si la VALEUR change : modifier
      // le Set existant ne suffirait pas. On en cree un nouveau.
      const copie = new Set(ensemble);
      if (enCours) {
        copie.add(equipeId);
      } else {
        copie.delete(equipeId);
      }
      return copie;
    });
  }
```

`update()` reçoit la valeur actuelle et renvoie la nouvelle. Ajouter un élément au `Set` **existant** ne changerait pas la valeur du signal — c'est toujours le même objet — et Angular ne mettrait pas l'écran à jour. On en crée donc un nouveau. C'est ce qu'on appelle traiter les données comme **immuables**.

### 4.6 Ne pas rediriger pour un chargement en arrière-plan

L'intercepteur de l'étape 8 renvoie vers la page de connexion quand le serveur refuse un jeton. C'est le bon comportement quand la personne vient d'**agir** — enregistrer un match, par exemple.

Mais les favoris se chargent **en arrière-plan**, sur n'importe quelle page. Une personne dont le jeton serait périmé, et qui lirait tranquillement la page d'accueil, se retrouverait soudain sur la page de connexion sans avoir rien demandé. Déroutant.

Angular permet d'attacher une étiquette à une requête, qu'un intercepteur peut lire : c'est le **contexte** d'une requête. Dans `intercepteurs/authentification.ts` :

```ts
export const REDIRIGER_SI_SESSION_EXPIREE = new HttpContextToken<boolean>(() => true);
```

Un `HttpContextToken` est une étiquette avec une valeur par défaut — ici `true`, qui s'applique à toutes les requêtes qui ne précisent rien. L'intercepteur en tient compte :

```ts
        if (
          requete.context.get(REDIRIGER_SI_SESSION_EXPIREE) &&
          !router.url.startsWith('/connexion')
        ) {
          void router.navigate(['/connexion'], { /* ... */ });
        }
```

Et le chargement des favoris la désactive :

```ts
    this.http
      .get<Equipe[]>(this.url, {
        context: new HttpContext().set(REDIRIGER_SI_SESSION_EXPIREE, false),
      })
```

La session est toujours fermée ; seule la redirection est évitée. Aucune autre requête du projet n'a eu à changer, grâce à la valeur par défaut.

### 4.7 La page Équipes

`pages/equipes/` liste les quatorze équipes. La liste est publique ; les boutons n'apparaissent qu'aux personnes connectées.

Le compteur utilise un nouveau bloc de contrôle, **`@switch`**, qui choisit un contenu selon une valeur :

```html
<p class="compteur">
  @switch (favoris.equipesSuivies().length) {
    @case (0) {
      Tu ne suis encore aucune équipe.
    }
    @case (1) {
      Tu suis <strong>1 équipe</strong>.
    }
    @default {
      Tu suis <strong>{{ favoris.equipesSuivies().length }} équipes</strong>.
    }
  }
</p>
```

`@switch` est plus lisible qu'une suite de `@if / @else if` quand on compare **une même valeur** à plusieurs cas. `@default` couvre tout le reste. Ici, il évite le classique « 1 équipes ».

Chaque carte :

```html
@for (equipe of equipes(); track equipe.id) {
  @let suivie = favoris.idsSuivis().has(equipe.id);

  <li class="carte" [class.carte--suivie]="suivie">
    <span class="carte-trigramme">{{ equipe.trigramme }}</span>
    <span class="carte-nom">{{ equipe.nom }}</span>

    @if (auth.estConnecte()) {
      <button
        type="button"
        class="bouton-favori"
        [attr.aria-pressed]="suivie"
        [disabled]="favoris.enCours().has(equipe.id)"
        (click)="favoris.basculer(equipe)"
      >
        <svg ... [attr.fill]="suivie ? 'currentColor' : 'none'" aria-hidden="true">...</svg>
        Favori<span class="visuellement-masque"> {{ equipe.nom }}</span>
      </button>
    }
  </li>
}
```

Trois nouveautés :

- **`@let`** donne un nom à une valeur, le temps du bloc. Sans lui, `favoris.idsSuivis().has(equipe.id)` serait recopié quatre fois.
- **`[class.carte--suivie]="suivie"`** ajoute ou retire une classe CSS selon une condition.
- **Le bouton bascule.** `aria-pressed` annonce son état aux lecteurs d'écran : « Favori Karmine Corp, bouton bascule, enfoncé ». Son libellé, lui, **ne change pas** — c'est la règle pour ce type de bouton : si le texte passait de « Suivre » à « Suivie » en même temps que l'état, on ne saurait plus si l'annonce décrit l'action ou l'état.

Le style réagit au même attribut que le lecteur d'écran, si bien que l'apparence ne peut pas diverger de ce qui est annoncé :

```css
.bouton-favori[aria-pressed='true'] {
  border-color: var(--couleur-primaire);
  background-color: var(--couleur-primaire);
  color: var(--couleur-sur-primaire);
}
```

Quatorze boutons « Favori » identiques seraient indiscernables pour un lecteur d'écran. Le nom de l'équipe est donc ajouté au libellé, mais **masqué à l'écran** avec une classe utilitaire globale :

```css
/* Texte invisible a l'ecran, mais lu par les lecteurs d'ecran.
   « display: none » ne convient pas : il masque aussi le texte pour eux.
   Cette recette le reduit a un pixel, hors de vue, sans le retirer. */
.visuellement-masque {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
```

Le lien « Équipes » rejoint la barre de navigation, entre « Compétitions » et « À propos ».

### 4.8 Le filtre de la page Matchs

Pour une personne qui suit au moins une équipe, la page Matchs propose deux filtres. Dans `pages/matchs/matchs.ts` :

```ts
  /** Etape 9 : afficher tous les matchs, ou seulement ceux des equipes suivies. */
  readonly filtre = signal<'tous' | 'mes-equipes'>('tous');

  readonly filtreDisponible = computed(() => this.favoris.equipesSuivies().length > 0);

  private readonly matchsAffiches = computed(() => {
    if (this.filtre() === 'tous' || !this.filtreDisponible()) {
      return this.matchs();
    }
    const suivies = this.favoris.idsSuivis();
    return this.matchs().filter(
      (match) => suivies.has(match.domicile.id) || suivies.has(match.exterieur.id),
    );
  });
```

Et la méthode `parStatut`, qui partait jusqu'ici de `this.matchs()`, part désormais de `this.matchsAffiches()`. Le reste de la page n'a pas changé.

C'est une chaîne de `computed()` :

```mermaid
flowchart LR
    M["matchs<br/><i>recus de l'API</i>"] --> A["matchsAffiches"]
    F["filtre<br/><i>tous / mes-equipes</i>"] --> A
    S["favoris.idsSuivis"] --> A
    A --> D["matchsEnDirect"]
    A --> V["matchsAVenir"]
    A --> T["matchsTermines"]

    style M fill:#12203a,color:#fff
    style F fill:#12203a,color:#fff
    style S fill:#12203a,color:#fff
    style A fill:#2563b0,color:#fff
```

Changer le filtre, suivre une équipe depuis une autre page, ou recevoir les matchs : chacun des trois signaux sombres de gauche suffit à tout recalculer — et **rien d'autre** n'est recalculé. C'est la force des signaux : décrire **ce qui dépend de quoi**, et laisser Angular s'occuper du **quand**.

Le filtre lui-même est fait de deux boutons bascules :

```html
@if (filtreDisponible()) {
  <div class="filtres" role="group" aria-label="Filtrer les matchs">
    <button type="button" class="filtre" [attr.aria-pressed]="filtre() === 'tous'" (click)="filtre.set('tous')">
      Tous les matchs
    </button>
    <button type="button" class="filtre" [attr.aria-pressed]="filtre() === 'mes-equipes'" (click)="filtre.set('mes-equipes')">
      Mes équipes ({{ favoris.equipesSuivies().length }})
    </button>
  </div>
}
```

`role="group"` et son `aria-label` annoncent que les deux boutons forment un ensemble.

Enfin, une étoile marque les équipes suivies dans chaque match :

```html
<span class="equipe-trigramme">{{ match.domicile.trigramme }}</span>
@if (estSuivie(match.domicile)) {
  <span class="etoile" title="Équipe suivie"><span aria-hidden="true">★</span><span class="visuellement-masque">(équipe suivie)</span></span>
}
```

Le caractère ★ est masqué aux lecteurs d'écran — il serait lu « étoile noire » —, et remplacé pour eux par « (équipe suivie) ».

Ce bloc a dû être ajouté **six fois** : deux équipes par match, dans trois listes recopiées depuis l'étape 3. Le coût de ce doublon, signalé à l'étape 7, grandit à chaque étape — il sera traité à l'étape 14.

### 4.9 Des captures sans compte réel

Les captures d'écran simulent une session avec un jeton factice (étape 8). Mais désormais, toute session déclenche `GET /api/moi/favoris`, que la vraie API refuserait : l'intercepteur fermerait la session, et la capture montrerait une personne déconnectée.

Le script `scripts/captures.mjs` **intercepte** donc cette requête dans le navigateur piloté, et y répond lui-même :

```js
    if (session) {
      await contexte.route('**/api/moi/favoris', (requete) =>
        requete.fulfill({ json: favoris.map((id) => EQUIPES[id]) }),
      );
    }
```

La base n'est ni lue ni modifiée, et les captures sont identiques à chaque génération.

### 4.10 Les tests

**98 tests**, tous au vert (contre 86 à l'étape 8). Le test de la mise à jour optimiste vérifie l'affichage **pendant** que la requête est en cours :

```ts
    it("met l'affichage a jour AVANT la reponse du serveur (optimiste)", () => {
      service.basculer(PSG);

      // La requete n'a pas encore de reponse... et l'equipe est deja suivie.
      const requete = httpMock.expectOne(`${URL}/psg`);
      expect(requete.request.method).toBe('PUT');
      expect(service.idsSuivis().has('psg')).toBe(true);
      expect(service.enCours().has('psg')).toBe(true);

      requete.flush(null, { status: 204, statusText: 'No Content' });
      expect(service.enCours().has('psg')).toBe(false);
    });

    it('revient en arriere et explique si le serveur refuse', () => {
      service.basculer(KC);

      const requete = httpMock.expectOne(`${URL}/kc`);
      expect(requete.request.method).toBe('DELETE');
      expect(service.idsSuivis().has('kc')).toBe(false);

      requete.flush({ erreur: 'Erreur interne du serveur' }, { status: 500, statusText: 'Erreur' });

      expect(service.idsSuivis().has('kc')).toBe(true);
      expect(service.erreur()).not.toBeNull();
    });

    it('ignore un second clic tant que la premiere requete est en cours', () => {
      service.basculer(PSG);
      service.basculer(PSG);

      // Une seule requete : le second clic aurait envoye un DELETE.
      httpMock.expectOne(`${URL}/psg`).flush(null, { status: 204, statusText: 'No Content' });
      expect(service.idsSuivis().has('psg')).toBe(true);
    });
```

Les `effect()` ne s'exécutent pas immédiatement : Angular les regroupe et les lance au moment opportun. Dans un test, **`TestBed.tick()`** les fait tourner sur demande :

```ts
    service = TestBed.inject(FavorisService);
    httpMock = TestBed.inject(HttpTestingController);
    TestBed.tick();
```

**Le parcours dans un vrai navigateur**, contre la vraie API, avec un compte de test. Résultats réels :

```
- anonyme /equipes : 14 equipes, 0 boutons
- connectee, retour sur /equipes : 14 boutons, « Tu ne suis encore aucune équipe. »
- apres deux clics : « Tu suis 2 équipes. », KC aria-pressed=true
- filtre « Mes équipes » -> KC ★ (équipe suivie) Karmine Corp 1 – 0 G2 G2 Esports
                          | PSG ★ (équipe suivie) Paris Saint-Germain 2 – 1 OM Olympique de Marseille
                          | TH Team Heretics vs KC ★ (équipe suivie) Karmine Corp
- apres rechargement (F5) : 3 etoiles, filtre visible : true
- apres retrait de PSG, la base contient : KC
- deconnectee /matchs : 0 etoiles, filtre visible : false
- erreurs console : []
```

Le texte extrait par le script contient « (équipe suivie) » : c'est le texte **visuellement masqué** du § 4.8. Invisible à l'écran, il est bien présent dans la page — exactement ce que lira un lecteur d'écran.

Puis, avec KC seul en favori : 8 matchs, 2 avec le filtre « Mes équipes », 8 de nouveau avec « Tous les matchs ». Le compte de test a été supprimé à la fin — et ses favoris avec lui, par la cascade.

## 5. Livrable attendu

Une personne connectée choisit ses équipes :

![Page Équipes en thème clair, connecté, trois équipes suivies](docs/images/etape-09-clair-equipes-connecte.png)

Une personne anonyme voit la liste, et une invitation à se connecter :

![Page Équipes en thème sombre, sans connexion](docs/images/etape-09-sombre-equipes.png)

La page Matchs, filtrée sur les équipes suivies :

![Page Matchs en thème sombre, filtre « Mes équipes » actif, étoiles sur les équipes suivies](docs/images/etape-09-sombre-matchs-mes-equipes.png)

Ce qui doit fonctionner :

- `npm run bdd:migrer` crée la table `favoris` ;
- `GET`, `PUT` et `DELETE` sur `/api/moi/favoris` répondent `401` sans jeton ;
- suivre ou ne plus suivre deux fois de suite répond `204` les deux fois ;
- chacun ne voit que ses propres favoris ;
- supprimer un compte supprime ses favoris ;
- côté interface : le bouton Favori réagit instantanément, les favoris survivent au rechargement, le filtre « Mes équipes » et les étoiles apparaissent sur la page Matchs ;
- `npm run verifier` (backend) et `npx ng test --watch=false` (frontend) passent.

## 6. Checklist d'auto-vérification

1. Pourquoi une relation « plusieurs à plusieurs » ne peut-elle pas se ranger dans une colonne de `utilisateurs` ou de `equipes` ? Que contient une ligne de la table de liaison ?
   - *À relire :* § 2.1 « La relation plusieurs à plusieurs »
2. Quelle est la clé primaire de `favoris` ? Que garantit-elle, et pourquoi faut-il un index supplémentaire sur `equipe_id` ?
   - *À relire :* § 2.2 « La clé primaire composée »
3. Pourquoi `ON DELETE CASCADE` pour les favoris, alors que les matchs d'une compétition sont en `RESTRICT` ? Quelle question se poser pour choisir ?
   - *À relire :* § 2.3 « Refuser, ou supprimer en cascade ? »
4. Qu'est-ce qu'une faille IDOR ? Comment l'adresse `/api/moi/favoris` l'empêche-t-elle ?
   - *À relire :* § 2.4 « Des adresses qui ne disent pas qui »
5. Suivre une équipe déjà suivie répond `204` et non `409`. Pourquoi ? Quel outil Prisma rend cette opération idempotente ?
   - *À relire :* § 2.5 « Suivre deux fois la même équipe » et § 4.2 « Le dépôt »
6. Qu'est-ce qu'une mise à jour optimiste ? Pourquoi le retour en arrière applique-t-il l'action inverse plutôt que de restaurer une copie de la liste ?
   - *À relire :* § 2.6 « La mise à jour optimiste » et § 4.5 « Le service de favoris »
7. Quelle différence entre `computed()` et `effect()` ? Pourquoi l'effet des favoris dépend-il de l'identifiant, et non de `estConnecte()` ?
   - *À relire :* § 2.7 « effect() » et § 4.5 « Le service de favoris »
8. Pourquoi le libellé du bouton « Favori » ne change-t-il pas quand on clique, et comment un lecteur d'écran connaît-il son état ?
   - *À relire :* § 4.7 « La page Équipes »

## 7. Branche d'arrivée

À la fin de cette étape, ton code doit être poussé sur **`etape-09-favoris`**.

L'étape suivante partira de cette branche pour créer `etape-10-statistiques`, qui ajoutera à chaque match ses statistiques détaillées.

---

# Étape 10 — Statistiques détaillées des matchs

> **Une étape ajoutée en cours de route.** Le découpage initial passait directement des favoris (étape 9) aux API externes. Cette étape a été insérée à ta demande, et les suivantes ont été décalées d'un rang : l'API Riot Games devient l'étape 11, le football l'étape 12, et ainsi de suite jusqu'à la finalisation, désormais l'étape 16 (voir `CONTEXTE.md`, section 8).

## 1. Objectifs

À la fin de cette étape, tu dois savoir :

- modéliser des données dont la **forme dépend d'une catégorie** — ici, la discipline d'une compétition — et justifier ce choix face aux alternatives ;
- rendre une incohérence **impossible à écrire**, plutôt que de la vérifier après coup ;
- distinguer une donnée qu'on **stocke** d'une donnée qu'on **calcule**, et savoir quand stocker malgré tout une donnée calculée ;
- regrouper plusieurs écritures dans une **transaction**, et l'annuler quand une règle échoue ;
- écrire une **migration de données**, qui transforme des lignes déjà présentes ;
- valider un corps de requête **imbriqué**, en disant précisément où se trouve chaque erreur ;
- actualiser une page **en direct** par interrogation périodique, sans fuite ni requêtes empilées ;
- conserver un choix de l'utilisateur à travers les rechargements avec **`linkedSignal()`**.

## 2. Concepts abordés

### 2.1 Un score ne raconte pas un match

Jusqu'ici, un match se résumait à deux équipes et deux nombres. C'est assez pour un résultat, pas pour suivre une rencontre : qui a marqué ? Qui a dominé ? Où en est la partie en cours ?

La difficulté nouvelle, c'est que **chaque discipline a ses propres statistiques**, sans presque rien en commun :

| | Football | League of Legends | Valorant |
|---|---|---|---|
| Un match se joue en | un seul temps de jeu | plusieurs **parties** | plusieurs **cartes** |
| Le score compte | les buts | les parties gagnées | les cartes gagnées |
| Chiffres d'une équipe | possession, tirs, tirs cadrés, corners, fautes, hors-jeu, cartons, passes, arrêts | tours, inhibiteurs, dragons, barons, hérauts, larves du Néant | rounds gagnés en attaque et en défense |
| Chiffres d'un joueur | ses buts | champion, K/M/A, sbires, gold, niveau, objets | agent, K/M/A, ACS, ADR, tirs à la tête, premiers kills et premières morts |

Le vocabulaire de l'esport, au passage :

| Terme | Sens |
|---|---|
| Série, « BO3 », « BO5 » | *best of three / five* : le match se gagne en remportant 2 parties sur 3, ou 3 sur 5 |
| **Manche** | dans ce cours, le mot commun pour « une partie de LoL » ou « une carte de Valorant » |
| K/M/A | *kills* (adversaires éliminés), morts, assistances (participations au kill d'un coéquipier) |
| Sbires (*CS*, *creep score*) | petits monstres tués, principale source de gold |
| Gold | la monnaie d'une partie de LoL, qui sert à acheter des objets |
| Côté bleu / côté rouge | les deux moitiés de la carte de LoL |
| Dragons, barons, hérauts, larves du Néant | monstres neutres qui donnent un avantage à l'équipe qui les tue. Le **quatrième dragon** d'une équipe lui donne une « âme » |
| Round | une courte manche de Valorant ; la première équipe à 13 rounds gagne la carte |
| Attaque / défense | les deux rôles de Valorant, échangés à la mi-temps |
| ACS (*Average Combat Score*) | score de combat moyen par round, la note globale d'un joueur |
| ADR (*Average Damage per Round*) | dégâts moyens infligés par round |
| Premier kill / première mort | le joueur qui ouvre un round en éliminant, ou en étant éliminé, le premier |

Tant que les API externes (étapes 11 et 12) ne sont pas branchées, ces statistiques arrivent par deux chemins : le **script de peuplement**, qui remplit la base avec des données de démonstration, et de nouvelles **routes d'écriture** de l'API, réservées aux administrateurs. Il n'y a pas de formulaire Angular pour les saisir : dix lignes de joueurs par partie, avec dix chiffres chacune, feraient un formulaire énorme — qui serait jeté dès que l'API de Riot fournira ces chiffres.

### 2.2 Modéliser des données qui changent de forme

Où ranger des statistiques dont la forme dépend de la discipline ? Trois réponses sont courantes.

**A. Des tables typées, une famille par discipline.** Chaque statistique devient une vraie colonne, avec son type : `tirs_cadres INTEGER`, `poste "PosteLol"`, `agent TEXT`.

**B. Une colonne JSON.** Une seule colonne `statistiques`, de type `JSONB` (un type PostgreSQL qui stocke un objet JSON quelconque), contient un objet libre dont la forme change selon la discipline.

**C. Une table « clé / valeur ».** Une table unique, `statistiques(match_id, joueur_id, nom, valeur)`, avec une ligne par chiffre : `('m1', 'kc-vesper', 'kills', 6)`.

| | A. Tables typées | B. Colonne JSON | C. Clé / valeur |
|---|---|---|---|
| Nombre de tables | élevé | très faible | une seule |
| La base refuse une valeur absurde | **oui** (types, `CHECK`) | non | non |
| Prisma connaît le type de chaque champ | **oui** | non (`JsonValue`) | non (tout est un nombre) |
| Chercher « les joueurs à plus de 10 kills » | une requête simple | possible, mais pénible | très pénible |
| Ajouter une statistique | une migration | rien à faire | rien à faire |

Le projet choisit **A**. Depuis l'étape 6, le fil rouge du projet est que **la base est la gardienne des données** : elle refuse un match sans compétition, un score négatif, un utilisateur en double. B et C lui retireraient ce rôle, et reporteraient toute la vérification sur le code. Leur seul avantage — ajouter une statistique sans migration — ne pèse pas lourd : les statistiques d'un match de football n'ont pas changé depuis des décennies.

Un choix préalable s'impose pour que cette organisation fonctionne : **savoir quelle discipline joue une compétition**. Jusqu'ici, une compétition n'avait qu'un `univers` (`esport` ou `football`) : rien ne distinguait une compétition de League of Legends d'une compétition de Valorant. Une colonne `discipline` (`football`, `lol` ou `valorant`) est donc ajoutée. L'univers s'en **déduit** — il n'est plus demandé au client (§ 2.4).

Voici les tables du football :

```mermaid
erDiagram
    MATCHS ||--o{ STATISTIQUES_FOOTBALL : "zero ou deux lignes"
    MATCHS ||--o{ BUTS : "une ligne par but"
    JOUEURS ||--o{ BUTS : "marque"
    EQUIPES ||--o{ JOUEURS : "effectif actuel"

    STATISTIQUES_FOOTBALL {
        string match_id PK,FK
        Cote cote PK
        int possession
        int tirs
        int tirs_cadres
        int corners
        int fautes
        int hors_jeu
        int cartons_jaunes
        int cartons_rouges
        int passes
        int passes_reussies
        int arrets
    }

    BUTS {
        string id PK
        string match_id FK
        Cote cote "qui beneficie du but"
        string buteur_id FK
        int minute
        int temps_additionnel "NULL si aucun"
        TypeBut type "normal, penalty, csc"
    }

    JOUEURS {
        string id PK
        string nom
        Discipline discipline
        string equipe_id FK
    }
```

Et celles de League of Legends et de Valorant, qui suivent le même plan : un match se joue en **manches**, chaque manche a deux lignes d'équipe et jusqu'à dix lignes de joueurs.

```mermaid
erDiagram
    MATCHS ||--o{ PARTIES_LOL : "se joue en"
    PARTIES_LOL ||--|{ STATISTIQUES_EQUIPE_LOL : "une ligne par cote"
    PARTIES_LOL ||--o{ STATISTIQUES_JOUEUR_LOL : "dix lignes au plus"
    PARTIES_LOL ||--o{ DRAGONS_LOL : "dans l'ordre"
    MATCHS ||--o{ CARTES_VALORANT : "se joue en"
    CARTES_VALORANT ||--|{ STATISTIQUES_EQUIPE_VALORANT : "une ligne par cote"
    CARTES_VALORANT ||--o{ STATISTIQUES_JOUEUR_VALORANT : "dix lignes au plus"

    PARTIES_LOL {
        string id PK
        string match_id FK
        int numero "1 a 5"
        int duree "en secondes"
        Cote cote_bleu
        Cote vainqueur "NULL si en cours"
    }

    STATISTIQUES_JOUEUR_LOL {
        string partie_id PK,FK
        string joueur_id PK,FK
        Cote cote
        PosteLol poste
        string champion
        int kills
        int morts
        int assistances
        int sbires
        int gold
        int niveau
        liste objets "TEXT[]"
    }

    CARTES_VALORANT {
        string id PK
        string match_id FK
        int numero
        string nom "Ascent, Haven..."
        Cote vainqueur "NULL si en cours"
    }
```

Deux relations de plus relient les lignes de joueurs à la table `joueurs` (non dessinées, pour garder le schéma lisible). Au total : **dix nouvelles tables**, et cinq nouvelles énumérations (`Discipline`, `Cote`, `TypeBut`, `PosteLol`, `TypeDragon`).

### 2.3 Rendre l'incohérence impossible à écrire

À l'étape 7, on a appris à **vérifier** qu'une donnée est cohérente : deux équipes différentes, un score positif. Il existe une façon plus radicale de se protéger d'une erreur : **faire en sorte qu'elle ne puisse pas s'écrire**.

L'exemple central de cette étape est la façon de désigner une équipe. L'idée naturelle serait une colonne `equipe_id` dans chaque ligne de statistiques. Mais alors, rien n'empêcherait d'écrire les statistiques de l'OM dans le match PSG – Lyon : la clé étrangère vérifie que l'OM **existe**, pas qu'il **joue ce match**. Il faudrait le contrôler à chaque écriture, sans jamais l'oublier.

Le projet désigne donc l'équipe par son **côté** : `domicile` ou `exterieur`. L'équipe elle-même se lit dans le match. Une troisième équipe n'a tout simplement **aucun moyen d'être écrite**.

| Désigner l'équipe par… | `equipe_id` | `cote` |
|---|---|---|
| Une équipe qui ne joue pas le match | possible, à vérifier partout | **impossible** |
| Trois lignes d'équipe pour un match | possible | **impossible** (la clé primaire est `(match_id, cote)`) |
| Retrouver l'équipe | directement | en passant par le match |

Le même principe revient plusieurs fois :

- **Une partie n'a pas de colonne `statut`.** Elle est en cours tant que `vainqueur` est vide (`NULL`). Une colonne de plus pourrait dire « terminée » alors qu'il n'y a pas de vainqueur ; une seule colonne ne peut pas se contredire.
- **Clés et index uniques.** `(partie_id, joueur_id)` : un joueur n'apparaît qu'une fois par partie. `(partie_id, cote, poste)` : une équipe n'a qu'un seul mid. `(match_id, numero)` : un match n'a qu'une seule « partie 2 ».
- **Contraintes `CHECK`** (étape 7) : tirs cadrés ≤ tirs, possession entre 0 et 100, niveau entre 1 et 18, au plus 7 objets…

Certaines règles, enfin, portent sur **plusieurs lignes** ou sur **d'autres tables** : la base ne sait pas les exprimer en `CHECK`. C'est l'API qui les vérifie :

| Règle | Qui la garantit |
|---|---|
| Les tirs cadrés ne dépassent pas les tirs | la base (`CHECK`) **et** l'API |
| Les deux possessions totalisent 100 % | l'API (deux lignes différentes) |
| Les joueurs cités pratiquent la discipline du match | l'API (autre table) |
| Une seule manche en cours par match | l'API, dans une transaction (§ 2.5) |
| Le vainqueur d'une carte a gagné plus de rounds | l'API |

### 2.4 Ce qui se calcule ne se stocke pas… sauf exception

Une **donnée dérivée** est une valeur qui se calcule à partir d'autres : un total, un pourcentage. La règle par défaut est de **ne pas la stocker**. Si les kills d'une équipe étaient enregistrés à côté des kills de ses joueurs, il suffirait d'une mise à jour qui oublie l'un des deux pour que la page affiche « 22 kills » au-dessus de joueurs qui en totalisent 21.

Le projet ne stocke donc pas :

- les **kills** et le **gold** d'une équipe de LoL — la somme de ceux de ses joueurs ;
- les **dragons** d'une équipe — le compte des lignes de `dragons_lol` ;
- le **total de rounds** Valorant — attaque + défense ;
- la **précision des passes** — passes réussies ÷ passes ;
- le **statut** d'une manche — la présence d'un vainqueur ;
- l'**univers** d'une compétition, à la saisie — il se déduit de la discipline.

Pour ce dernier, la colonne `univers` existe pourtant toujours : elle date de l'étape 6 et seize fichiers s'en servent. La supprimer relèverait du refactoring (étape 14). En attendant, le client ne l'envoie plus, le serveur la calcule, et une contrainte `CHECK` garantit que les deux colonnes ne se contredisent jamais.

**L'exception : le score du match.** Il se déduit du détail — buts, parties ou cartes gagnées —, et pourtant il reste stocké dans la table `matchs`. Pourquoi ? Parce que la liste des matchs l'affiche **à chaque visite**, pour chaque match : le recalculer imposerait de lire le détail de tous les matchs à chaque affichage de la page, pour une valeur qui ne change que lorsqu'un administrateur écrit un détail. Stocker une donnée dérivée pour la lire plus vite s'appelle **dénormaliser**.

C'est légitime à une condition absolue : **la recalculer à chaque écriture de ce dont elle dépend, dans la même transaction.** C'est ce que fait le serveur (§ 2.5).

Une colonne booléenne, `score_calcule`, indique si le score d'un match vient du détail :

| `score_calcule` | Le score… | Dans le formulaire de match |
|---|---|---|
| `false` (par défaut) | est saisi à la main, comme depuis l'étape 7 | tout est modifiable |
| `true` (dès qu'un détail est écrit) | est recalculé à chaque écriture du détail | compétition, équipes et score sont **figés** |

Pourquoi figer aussi la compétition et les équipes ? Parce que les statistiques désignent une équipe par son **côté** : changer l'équipe qui reçoit attribuerait d'un coup tous les buts et tous les tirs à une autre équipe.

### 2.5 La transaction : tout ou rien

Écrire une partie de League of Legends, c'est une dizaine d'instructions : supprimer l'ancienne version, créer la partie, ses deux lignes d'équipe, ses dix joueurs, ses dragons, puis mettre à jour le score du match. Que se passe-t-il si le serveur s'arrête au milieu ? La base garde une partie sans joueurs, ou un score qui ne correspond plus aux parties.

Une **transaction** regroupe des opérations qui s'exécutent **en tout ou rien**. Soit toutes réussissent, et elles sont enregistrées ensemble (*commit*) ; soit l'une échoue, et **aucune** ne l'est : la base revient exactement à son état d'avant (*rollback*, « retour en arrière »).

Les jeux en ligne en font un usage constant. Quand deux joueurs échangent des objets, le serveur retire l'objet du premier et le donne au second **dans une seule transaction** : sans elle, une coupure au mauvais moment ferait disparaître l'objet — ou pire, le dupliquerait.

La transaction sert ici à une seconde chose : **vérifier une règle après avoir écrit**. « Une seule manche en cours par match » porte sur toutes les parties du match, y compris celle qu'on vient d'écrire. On l'écrit donc, on compte, et si la règle est violée, on **annule** — la partie écrite disparaît avec le reste :

```mermaid
sequenceDiagram
    participant C as Controleur
    participant D as Depot
    participant B as PostgreSQL

    C->>D: ecrirePartieLol(m1, 3, donnees)
    D->>B: BEGIN
    D->>B: le match existe-t-il, est-il de LoL, a-t-il commence ?
    D->>B: les joueurs cites sont-ils des joueurs de LoL ?
    D->>B: DELETE partie 3 (ses statistiques suivent, en cascade)
    D->>B: INSERT partie 3, ses equipes, ses joueurs, ses dragons
    D->>B: combien de parties sans vainqueur ?
    alt une seule
        D->>B: UPDATE matchs, score = parties gagnees
        D->>B: COMMIT
        D-->>C: enregistre
    else deux (la partie 2 est encore en cours)
        D->>B: ROLLBACK, la partie 3 n'a jamais existe
        D-->>C: deux-manches-en-cours
    end
```

Avec Prisma, une transaction s'écrit `prisma.$transaction(async (tx) => { ... })`. Toutes les requêtes passées par **`tx`** en font partie. **Lever une erreur** à l'intérieur l'annule.

### 2.6 L'historique ne dépend pas du présent

Un joueur change d'équipe à chaque saison. La table `joueurs` retient son équipe **actuelle** — pratique pour lister un effectif. Mais si les statistiques d'une ancienne partie se contentaient de pointer vers le joueur, son transfert réécrirait le passé : ses anciens kills passeraient d'un coup dans sa nouvelle équipe.

Chaque ligne de statistiques retient donc le **côté** pour lequel le joueur a joué **ce jour-là**. Et l'API vérifie qu'un joueur cité pratique la bonne **discipline** — pas qu'il appartient **aujourd'hui** à l'équipe : sinon, il deviendrait impossible d'enregistrer le détail d'un match joué avant son transfert.

C'est aussi pour cela qu'un joueur a une discipline. Karmine Corp aligne une équipe de League of Legends **et** une équipe de Valorant : deux effectifs différents sous le même nom. Citer un joueur de Valorant dans une partie de LoL est refusé.

### 2.7 Une migration qui transforme des données

Jusqu'ici, les migrations ne changeaient que la **structure** : créer une table, ajouter une colonne facultative. Ajouter la colonne **obligatoire** `discipline` à une table qui contient déjà quatre compétitions pose un problème nouveau : ces quatre lignes n'auraient aucune valeur, ce que `NOT NULL` interdit. PostgreSQL refuse, et Prisma le signale dès la génération de la migration.

La solution est une **migration de données**, en trois temps :

```mermaid
flowchart LR
    A["1. ajouter la colonne<br/><i>vide autorisee</i>"] --> B["2. la remplir<br/><i>UPDATE ... d'apres l'univers</i>"]
    B --> C["3. l'interdire vide<br/><i>SET NOT NULL</i>"]

    style A fill:#12203a,color:#fff
    style B fill:#2563b0,color:#fff
    style C fill:#12203a,color:#fff
```

Le résultat final est exactement celui que décrit le schéma Prisma. Seul le chemin pour y arriver a été écrit à la main.

### 2.8 Une page qui se met à jour toute seule

Pendant un match en direct, les chiffres changent. Deux façons existent de les tenir à jour dans le navigateur :

| | Interrogation périodique (*polling*) | Notification du serveur (*push*) |
|---|---|---|
| Principe | le client redemande toutes les N secondes | le serveur prévient le client à chaque changement |
| Outils | une requête HTTP ordinaire | *WebSocket*, *Server-Sent Events* : une connexion qui reste ouverte |
| Côté serveur | rien à ajouter | un mécanisme de diffusion à construire et à héberger |
| Retard d'affichage | jusqu'à N secondes | quasi nul |
| Requêtes inutiles | oui, quand rien n'a changé | non |

Le projet choisit l'**interrogation périodique**, toutes les 30 secondes : elle ne demande rien au serveur, et un retard de 30 secondes est acceptable pour des statistiques — ce n'est pas un jeu en temps réel. Le *push* sera à reconsidérer si le projet grandit.

Côté Angular, l'interrogation est une chaîne de quatre opérateurs RxJS :

```mermaid
flowchart LR
    T["timer(0, 30 s)<br/><i>un tic tout de suite,<br/>puis toutes les 30 s</i>"] --> W{"takeWhile<br/>encore a actualiser ?"}
    W -- non --> F["fin : plus aucune requete"]
    W -- oui --> E{"exhaustMap<br/>une requete deja en cours ?"}
    E -- oui --> I["tic ignore"]
    E -- non --> R["GET /api/matchs/m1/details"]
    R -- reussite --> S["details.set()"]
    R -- echec --> C["catchError : message,<br/>on continue"]

    style T fill:#12203a,color:#fff
    style R fill:#2563b0,color:#fff
```

Et un cinquième, **`takeUntilDestroyed()`**, arrête tout quand on quitte la page. Une requête HTTP se termine d'elle-même ; un minuteur, **jamais**. Sans lui, le minuteur continuerait d'interroger l'API pour une page fermée depuis longtemps — et chaque visite en ajouterait un de plus. C'est une **fuite**.

Le choix d'`exhaustMap` mérite un mot. Trois opérateurs transforment une valeur en requête ; ils diffèrent par ce qu'ils font quand un tic arrive **alors que la requête précédente n'a pas encore répondu** :

| Opérateur | Réaction | Conséquence pour l'actualisation |
|---|---|---|
| `mergeMap` | lance une requête de plus | un serveur lent reçoit des requêtes qui s'empilent |
| `switchMap` | annule la requête en cours, en lance une autre | un serveur qui répond en plus de 30 s ne répond… jamais |
| `exhaustMap` | ignore le tic | la requête en cours va au bout ; la suivante partira au tic d'après |

### 2.9 Un choix qui survit aux rechargements : `linkedSignal()`

Sur la page d'un match de LoL, des boutons permettent de choisir la partie à afficher. Par défaut, c'est la partie **en cours** ; si la personne clique sur « Partie 1 », c'est la partie 1.

Mais toutes les 30 secondes, le détail est rechargé. Que devient le choix ?

- Avec un `computed()`, il serait **recalculé** à chaque rechargement : impossible de le modifier au clic, et il reviendrait toujours à la partie en cours.
- Avec un `signal()` ordinaire, il ne **suivrait pas** les données : à l'arrivée sur la page, il faudrait l'initialiser à la main, et une nouvelle partie qui commence ne serait jamais proposée par défaut.

**`linkedSignal()`** combine les deux : il se recalcule quand sa **source** change, **et** peut être modifié avec `set()`. Surtout, sa fonction de calcul reçoit la **valeur précédente** : si la partie choisie existe toujours, on la garde.

| | `computed()` | `signal()` | `linkedSignal()` |
|---|---|---|---|
| Se recalcule quand sa source change | oui | non | oui |
| Modifiable avec `set()` | non | oui | oui |
| Exemple du projet | `enDirect` | `erreur` | `numeroChoisi` |

## 3. Prérequis

Pars de la branche **`etape-09-favoris`**.

```
git checkout etape-09-favoris
git checkout -b etape-10-statistiques
```

PostgreSQL doit être démarré, et `backend/.env` renseigné (étapes 6 et 8). Si tu récupères directement la branche `etape-10-statistiques`, applique la nouvelle migration puis remplis la base, depuis `backend/` :

```
npm run bdd:migrer
npm run bdd:peupler
```

> **Une étape à vérifier sur ton PC.** Elle a été rédigée sur un poste où ni PostgreSQL ni les dépendances du projet ne sont installés : rien n'a pu y être exécuté. Les résultats donnés aux § 4.10 et 4.16 sont donc ceux **attendus**. Les obtenir réellement, sur ton PC, fait partie de l'étape.

## 4. Déroulé détaillé

### 4.1 La discipline des compétitions

Dans `prisma/schema.prisma`, une énumération et une colonne :

```prisma
enum Discipline {
  football
  lol
  valorant
}

model Competition {
  // ...
  /// Etape 10 : fixee a la creation, puis figee -- les statistiques des
  /// matchs en dependent.
  discipline Discipline
}
```

Les valeurs sont **les mêmes en base et dans l'API** : contrairement aux statuts de match (`en_direct` en base, `en-direct` dans l'API, étape 6), aucune traduction n'est nécessaire.

L'univers se déduit, dans `src/modeles/competition.ts` :

```ts
export function universDe(discipline: Discipline): Univers {
  return discipline === 'football' ? 'football' : 'esport';
}
```

La validation (`src/validation/competition.validation.ts`) change en conséquence :

- **à la création** (`POST`), le client envoie l'identifiant, la **discipline**, le nom, l'organisateur et la description. Le serveur ajoute l'univers avec `universDe()` ;
- **à la modification** (`PUT`), il n'envoie plus que le nom, l'organisateur et la description. Comme l'identifiant depuis l'étape 7, la discipline est **figée** : la liste blanche ne la recopie pas, et un client qui l'enverrait quand même ne changerait rien.

Le type des données modifiables se décrit avec **`Pick`**, le contraire d'`Omit` : il ne **garde** que les champs cités.

```ts
export type DonneesCompetition = Pick<Competition, 'nom' | 'organisateur' | 'description'>;
```

Côté Angular, les deux boutons radio « eSport / Football » du formulaire de compétition deviennent trois boutons de discipline, générés par une boucle `@for`. En modification, ils sont désactivés, avec une ligne d'aide qui explique pourquoi :

```ts
      disabled(chemin.discipline, () => this.enModification);
      required(chemin.discipline, { message: 'Choisis une discipline.' });
```

### 4.2 Le schéma des statistiques

Le fichier `prisma/schema.prisma` gagne cinq énumérations et dix modèles, tous commentés. Trois extraits suffisent à en comprendre l'organisation.

Le côté d'un match, qui remplace partout l'identifiant d'équipe (§ 2.3) :

```prisma
enum Cote {
  domicile
  exterieur
}
```

Les statistiques d'une équipe de football — une ligne par côté, grâce à la clé primaire composée de l'étape 9 :

```prisma
model StatistiquesFootball {
  matchId String @map("match_id")
  match   Match  @relation(fields: [matchId], references: [id], onDelete: Cascade)
  cote    Cote

  possession     Int
  tirs           Int
  tirsCadres     Int @map("tirs_cadres")
  // ... huit autres compteurs

  @@id([matchId, cote])
  @@map("statistiques_football")
}
```

Une partie de League of Legends, et la ligne d'un joueur :

```prisma
model PartieLol {
  id      String @id @default(uuid())
  matchId String @map("match_id")
  match   Match  @relation(fields: [matchId], references: [id], onDelete: Cascade)

  numero    Int
  duree     Int
  coteBleu  Cote  @map("cote_bleu")
  /// Vide (NULL) tant que la partie est en cours.
  vainqueur Cote?

  equipes StatistiquesEquipeLol[]
  joueurs StatistiquesJoueurLol[]
  dragons DragonLol[]

  @@unique([matchId, numero])
  @@map("parties_lol")
}

model StatistiquesJoueurLol {
  // ... partie, joueur, cote, poste, champion, compteurs
  objets String[]

  @@id([partieId, joueurId])
  @@unique([partieId, cote, poste])
  @@map("statistiques_joueur_lol")
}
```

Trois points à remarquer :

- **`onDelete: Cascade`** vers le match, sur toutes les tables de détail : supprimer un match supprime ses statistiques. C'est la question de l'étape 9 — « les données dépendantes ont-elles un sens sans leur parent ? » — et la réponse est clairement non. Les liens vers `joueurs` restent, eux, en `RESTRICT` : un joueur qui a des statistiques ne peut pas disparaître.
- **`numero` sert d'adresse.** L'API désigne une partie par `/api/matchs/m1/parties/2`, pas par son identifiant technique : c'est ainsi qu'on parle d'une série.
- **`objets String[]`** est une **colonne tableau** (`TEXT[]` en SQL) : une liste de textes dans une seule cellule. L'étape 9 mettait en garde contre `"kc,psg,fnc"` dans une colonne. La différence : ces objets **appartiennent entièrement** à la ligne du joueur, ne sont jamais cherchés seuls et ne référencent aucune autre table. Une table `objets_joueur_lol` n'apporterait rien, qu'une jointure de plus.

Le modèle `Match`, enfin, gagne la colonne `scoreCalcule` et quatre listes de détail :

```prisma
  scoreCalcule Boolean @default(false) @map("score_calcule")

  statistiquesFootball StatistiquesFootball[]
  buts                 But[]
  partiesLol           PartieLol[]
  cartesValorant       CarteValorant[]
```

### 4.3 La migration, écrite en partie à la main

On génère la migration **sans l'appliquer**, comme à l'étape 7 :

```
npx prisma migrate dev --create-only --name statistiques
```

Prisma prévient, dans le terminal et en tête du fichier généré, par un avertissement de ce genre :

```
Added the required column `discipline` to the `competitions` table without a default value.
There are 4 rows in this table, it is not possible to execute this step.
```

C'est le cas du § 2.7. Dans `prisma/migrations/20260918120000_statistiques/migration.sql`, la ligne générée est remplacée par les trois temps de la migration de données :

```sql
ALTER TABLE "competitions" ADD COLUMN "discipline" "Discipline";

UPDATE "competitions" SET "discipline" = 'football' WHERE "univers" = 'football';
UPDATE "competitions" SET "discipline" = 'valorant' WHERE "univers" = 'esport' AND "id" = 'valorant';
UPDATE "competitions" SET "discipline" = 'lol' WHERE "discipline" IS NULL;

ALTER TABLE "competitions" ALTER COLUMN "discipline" SET NOT NULL;
```

Puis on ajoute, en fin de fichier, les contraintes `CHECK` que le schéma Prisma ne sait pas exprimer. Deux exemples :

```sql
-- Une competition est de football dans les deux colonnes, ou dans aucune.
ALTER TABLE "competitions"
  ADD CONSTRAINT "competitions_discipline_coherente"
  CHECK (("discipline" = 'football') = ("univers" = 'football'));

-- Un champion va du niveau 1 au niveau 18, et porte au plus sept objets.
ALTER TABLE "statistiques_joueur_lol"
  ADD CONSTRAINT "statistiques_joueur_lol_valeurs"
  CHECK (
    "kills" >= 0 AND "morts" >= 0 AND "assistances" >= 0
    AND "sbires" >= 0 AND "gold" >= 0
    AND "niveau" BETWEEN 1 AND 18
    AND cardinality("objets") <= 7
  );
```

La première compare deux **booléens** : « la discipline est football » doit valoir la même chose que « l'univers est football ». `cardinality()`, dans la seconde, compte les éléments d'un tableau PostgreSQL.

Il ne reste qu'à appliquer la migration et à régénérer le client :

```
npx prisma migrate dev
npx prisma generate
```

### 4.4 Les données de démonstration

Le script `prisma/seed.ts` remplit désormais :

- **32 joueurs**, tous **fictifs** : dix pour la série de LoL Karmine Corp – G2, quinze pour les trois équipes de Valorant, sept buteurs de football. Les vrais effectifs changent à chaque saison et arriveront avec les API ; en attendant, aucune performance n'est attribuée à une personne réelle ;
- **trois feuilles de match** de football (m2 en direct, m6 et m8 terminés), avec leurs buts, dont un penalty, un contre son camp et deux buts dans le temps additionnel ;
- **deux parties** pour m1 (la première gagnée par Karmine Corp, la seconde en cours) ;
- **quatre cartes** de Valorant : deux pour m7 (terminé), deux pour **m9**, un nouveau match G2 – Fnatic en direct.

Les identifiants de joueurs sont **lisibles** (`kc-vesper`, `g2-zephyr`) plutôt que des UUID : on les tape à la main dans Thunder Client au § 4.10.

Les chiffres sont inventés mais **cohérents entre eux**, pour que la page ne raconte rien d'impossible : les kills d'une équipe égalent les morts de l'autre, les tirs cadrés d'une équipe égalent ses buts plus les arrêts du gardien adverse, les premiers kills des deux équipes d'une carte totalisent son nombre de rounds.

Pour rester relançable sans danger, le script **supprime** le détail de chaque match avant de le recréer. La cascade fait le reste : supprimer une partie supprime ses joueurs, ses équipes et ses dragons. La création utilise une **écriture imbriquée** : la partie et tout ce qui s'y rattache, en une seule instruction.

```ts
    await prisma.partieLol.create({
      data: {
        matchId: partie.matchId,
        numero: partie.numero,
        // ...
        equipes: { create: [ { cote: 'domicile', ...partie.equipes.domicile }, /* ... */ ] },
        joueurs: { create: avecCote(partie.joueurs) },
        dragons: { create: partie.dragons.map((dragon, index) => ({ ordre: index + 1, ...dragon })) },
      },
    });
```

Prisma crée la partie, puis remplit lui-même `partie_id` dans chaque ligne liée.

Dernier détail : le script écrit les scores **à la main** dans la table `matchs`, sans passer par l'API qui les recalcule. Il termine donc par une vérification, `verifierScores()`, qui recompte buts et manches gagnées et **s'arrête en erreur** au moindre écart. Une faute de frappe dans les données de démonstration ne peut pas produire une base incohérente.

### 4.5 Lire le détail d'un match

`src/depots/details.depot.ts` commence par la lecture. La fonction principale réutilise les dépôts existants, puis choisit selon la discipline :

```ts
export async function trouverDetails(matchId: string): Promise<DetailsMatch | null> {
  const match = await trouverMatch(matchId);
  if (match === null) {
    return null;
  }

  const competition = await trouverCompetition(match.competitionId);
  if (competition === null) {
    throw new Error(`Compétition ${match.competitionId} introuvable pour le match ${matchId}`);
  }

  switch (competition.discipline) {
    case 'football':
      return { match, competition, ...(await detailsFootball(matchId)) };
    case 'lol':
      return { match, competition, ...(await detailsLol(matchId)) };
    case 'valorant':
      return { match, competition, ...(await detailsValorant(matchId)) };
  }
}
```

Deux remarques. La compétition introuvable lève une **erreur** (500), pas un `null` (404) : c'est impossible — la clé étrangère l'interdit — et si cela arrivait, ce serait un bug à signaler, pas un match inexistant. Et le `switch` n'a pas de `default` : ses trois `case` couvrent toutes les valeurs de `Discipline`, TypeScript le sait, et n'exige pas de `return` après.

Le football lance ses deux requêtes **en parallèle** avec **`Promise.all`**, l'équivalent côté serveur du `forkJoin` de l'étape 5 :

```ts
  const [statistiques, buts] = await Promise.all([
    prisma.statistiquesFootball.findMany({ where: { matchId } }),
    prisma.but.findMany({
      where: { matchId },
      include: { buteur: JOUEUR_RESUME },
      orderBy: [{ minute: 'asc' }, { tempsAdditionnel: { sort: 'asc', nulls: 'first' } }],
    }),
  ]);
```

Le tri mérite l'attention : à minute égale, un but **sans** temps additionnel (`NULL`) passe avant. C'est ce qui range « 90’ » avant « 90+3’ », et « 45+2’ » avant « 46’ ».

League of Legends lit ses parties avec un **`include` imbriqué** — la partie, ses joueurs, et pour chaque joueur, son nom :

```ts
const AVEC_DETAIL_PARTIE = {
  equipes: true,
  joueurs: { include: { joueur: JOUEUR_RESUME }, orderBy: { poste: 'asc' } },
  dragons: { orderBy: { ordre: 'asc' } },
} as const;
```

Trier par poste range les joueurs de top à support : une énumération PostgreSQL se trie dans **l'ordre de sa déclaration**, pas dans l'ordre alphabétique.

C'est à la traduction vers l'API que se **calculent** les données dérivées du § 2.4 :

```ts
  const equipe = (cote: Cote) => {
    const objectifs = partie.equipes.find((ligne) => ligne.cote === cote);
    return {
      kills: somme(joueurs[cote].map((joueur) => joueur.kills)),
      gold: somme(joueurs[cote].map((joueur) => joueur.gold)),
      tours: objectifs?.tours ?? 0,
      // ...
      dragons: partie.dragons.filter((dragon) => dragon.cote === cote).map((dragon) => dragon.type),
    };
  };
```

La réponse de `GET /api/matchs/m1/details`, abrégée :

```json
{
  "match": { "id": "m1", "scoreDomicile": 1, "scoreExterieur": 0, "statut": "en-direct", "scoreCalcule": true, "...": "..." },
  "competition": { "id": "lol", "nom": "League of Legends", "discipline": "lol", "...": "..." },
  "discipline": "lol",
  "parties": [
    {
      "numero": 1, "duree": 1985, "coteBleu": "domicile", "vainqueur": "domicile",
      "equipes": {
        "domicile": { "kills": 22, "gold": 65710, "tours": 9, "dragons": ["ocean", "montagne", "montagne", "montagne"], "...": "..." },
        "exterieur": { "kills": 9, "gold": 51560, "tours": 3, "dragons": ["infernal"], "...": "..." }
      },
      "joueurs": { "domicile": [ { "joueur": { "id": "kc-tarka", "nom": "Tarka" }, "poste": "top", "...": "..." } ], "exterieur": [] }
    },
    { "numero": 2, "vainqueur": null, "...": "..." }
  ]
}
```

La propriété `discipline` est le **discriminant** d'une union discriminée (étape 7) : le frontend sait, en la lisant, quelle forme a le reste de l'objet.

### 4.6 Valider un corps imbriqué

`src/validation/details.validation.ts` applique les principes de l'étape 7 — tout collecter, puis reconstruire champ par champ — à des corps **imbriqués**. Une erreur doit dire précisément où elle se trouve :

```json
{
  "erreur": "Données invalides",
  "details": [
    { "champ": "joueurs.domicile[0].niveau", "message": "Entier entre 1 et 18 attendu." },
    { "champ": "statistiques", "message": "Les deux possessions doivent totaliser 100 %." }
  ]
}
```

Chaque fonction reçoit donc un **chemin** — l'adresse, dans le corps, de l'objet qu'elle lit — et le prolonge pour ses propres erreurs :

```ts
function sousChamp(chemin: string, cle: string): string {
  return chemin === '' ? cle : `${chemin}.${cle}`;
}
```

`lireTexte`, écrite à l'étape 7, reçoit pour cela un cinquième paramètre **facultatif**, `libelle`, qui vaut par défaut le nom du champ. Les appels existants n'ont pas eu à changer.

Deux outils méritent l'attention. D'abord, une lecture de valeur parmi une liste fermée, **générique** :

```ts
function lireChoix<T extends string>(
  objet: Record<string, unknown>,
  cle: string,
  chemin: string,
  valides: readonly T[],
  erreurs: ErreurChamp[],
): T {
```

`<T extends string>` : la fonction accepte n'importe quelle union de textes, et **renvoie une valeur de ce type**. `lireChoix(joueur, 'poste', chemin, POSTES_LOL, erreurs)` renvoie un `PosteLol`, pas un simple `string` — une seule fonction pour les côtés, les postes, les types de but et de dragon.

Ensuite, la lecture d'une liste :

```ts
function lireElements<T>(
  liste: unknown[],
  chemin: string,
  erreurs: ErreurChamp[],
  lire: (element: Record<string, unknown>, cheminElement: string) => T,
): T[] {
```

Son dernier paramètre, `lire`, est une **fonction**. `lireElements` sait parcourir une liste et numéroter les chemins (`buts[0]`, `buts[1]`…), mais ne sait pas ce que contient chaque élément : c'est l'appelant qui le lui dit, en lui passant `lireBut`, `lireJoueurLol` ou `lireJoueurValorant`.

Les règles qui portent sur **plusieurs éléments** viennent après la lecture. Un joueur présent deux fois, par exemple, se détecte avec le `Set` de l'étape 9 :

```ts
  const ids = [...joueurs.domicile, ...joueurs.exterieur].map((joueur) => joueur.joueurId);
  if (new Set(ids).size !== ids.length) {
    erreurs.push({ champ: 'joueurs', message: 'Un même joueur apparaît deux fois.' });
  }
```

### 4.7 Écrire dans une transaction

Toutes les écritures de détail passent par une même fonction du dépôt, qui porte le cadre commun :

```ts
async function ecrireDansUnMatch(
  matchId: string,
  discipline: Discipline,
  joueurIds: string[],
  ecrire: (tx: Transaction) => Promise<void>,
): Promise<'enregistre' | RefusDetail> {
  try {
    await prisma.$transaction(async (tx) => {
      const match = await tx.match.findUnique({
        where: { id: matchId },
        select: { statut: true, competition: { select: { discipline: true } } },
      });

      if (match === null) {
        throw new Refus('match-introuvable');
      }
      if (match.competition.discipline !== discipline) {
        throw new Refus('mauvaise-discipline');
      }
      if (match.statut === 'a_venir') {
        throw new Refus('match-a-venir');
      }

      await verifierJoueurs(tx, joueurIds, discipline);
      await ecrire(tx);
      await recalculerScore(tx, matchId, discipline);
    });
    return 'enregistre';
  } catch (erreur) {
    if (erreur instanceof Refus) {
      return erreur.raison;
    }
    // ...
    throw erreur;
  }
}
```

Le principe de l'étape 7 est conservé : le dépôt renvoie soit le résultat, soit un **mot** qui nomme la raison d'un échec prévisible. Mais à l'intérieur d'une transaction, un simple `return 'match-introuvable'` ne suffirait pas toujours : pour **annuler** ce qui a déjà été écrit, il faut **lever une erreur**. D'où la classe `Refus`, une erreur qui transporte sa raison :

```ts
class Refus extends Error {
  readonly raison: RefusDetail;

  constructor(raison: RefusDetail) {
    super(`Écriture refusée : ${raison}`);
    this.raison = raison;
  }
}
```

**`extends Error`** crée une nouvelle sorte d'erreur, qui hérite de tout ce qu'a une erreur ordinaire, avec un champ en plus. Le `catch` la reconnaît avec `instanceof` (étape 7) et la retraduit en mot ; toute autre erreur — base injoignable… — est relancée, et finira en 500.

Le score est recalculé **dans la même transaction**, en comptant buts ou manches gagnées :

```ts
async function recalculerScore(tx: Transaction, matchId: string, discipline: Discipline): Promise<void> {
  const points = async (cote: Cote): Promise<number> => {
    switch (discipline) {
      case 'football':
        return tx.but.count({ where: { matchId, cote } });
      case 'lol':
        return tx.partieLol.count({ where: { matchId, vainqueur: cote } });
      case 'valorant':
        return tx.carteValorant.count({ where: { matchId, vainqueur: cote } });
    }
  };

  await tx.match.update({
    where: { id: matchId },
    data: { scoreDomicile: await points('domicile'), scoreExterieur: await points('exterieur'), scoreCalcule: true },
  });
}
```

Chaque écriture n'a plus qu'à fournir **sa** partie. Pour une partie de LoL :

```ts
    async (tx) => {
      await tx.partieLol.deleteMany({ where: { matchId, numero } });

      await tx.partieLol.create({
        data: {
          matchId,
          numero,
          duree: donnees.duree,
          coteBleu: donnees.coteBleu,
          vainqueur: donnees.vainqueur,
          equipes: { create: COTES.map((cote) => ({ cote, ...donnees.equipes[cote] })) },
          joueurs: { create: joueurs },
          dragons: { create: donnees.dragons.map((dragon, index) => ({ ordre: index + 1, ...dragon })) },
        },
      });

      await refuserDeuxManchesEnCours(tx.partieLol.count({ where: { matchId, vainqueur: null } }));
    },
```

**Remplacer plutôt que comparer** : l'ancienne version de la partie est supprimée — ses statistiques suivent par cascade —, la nouvelle est créée. Comparer l'ancienne et la nouvelle pour ne modifier que les différences serait bien plus complexe, pour un résultat identique. La transaction garantit qu'aucun visiteur ne verra jamais l'instant où la partie n'existe plus.

La dernière ligne est la règle du § 2.5 : si, une fois la partie écrite, **deux** manches du match sont sans vainqueur, `refuserDeuxManchesEnCours` lève un `Refus`, et la partie tout juste écrite est annulée avec le reste.

### 4.8 Verrouiller un match détaillé

Dernier morceau du backend : empêcher le formulaire de match de modifier la compétition, les équipes ou le score d'un match détaillé (§ 2.4). Dans `src/depots/matchs.depot.ts`, `mettreAJourMatch` commence désormais ainsi :

```ts
    const { count } = await prisma.match.updateMany({
      where: { id, scoreCalcule: false },
      data: versLaBase(donnees),
    });
```

La condition `scoreCalcule: false` fait **partie de la requête** : `UPDATE ... WHERE id = 'm1' AND score_calcule = false`. C'est la base qui la vérifie, **au moment précis** de l'écriture. Lire le match d'abord, puis écrire s'il n'est pas détaillé, laisserait une fenêtre entre les deux : la situation de concurrence de l'étape 7.

`updateMany` et non `update` : `update` exige un critère **unique** (l'identifiant seul), `updateMany` accepte n'importe quelle condition et renvoie le **nombre** de lignes modifiées.

Si ce nombre vaut zéro, le match n'existe pas, ou il est détaillé. Dans le second cas, la requête est acceptée **seulement** si la compétition, les équipes et le score envoyés sont identiques aux valeurs actuelles — c'est ce qu'envoie le formulaire, qui les affiche sans permettre de les changer. Seuls la date et le statut sont alors écrits. Sinon, le contrôleur répond `409`.

### 4.9 Les routes

Dans `src/routes/matchs.routes.ts`, les adresses du détail s'imbriquent sous celle du match : `/api/matchs/m1/parties/2` se lit « la partie 2 du match m1 ».

| Méthode et adresse | Accès | Succès | Refus prévus |
|---|---|---|---|
| `GET /api/matchs/:id/details` | public | `200` | `404` |
| `PUT /api/matchs/:id/feuille-football` | administrateur | `200` + détail à jour | `400`, `404`, `409` |
| `PUT /api/matchs/:id/parties/:numero` | administrateur | `200` + détail à jour | `400`, `404`, `409` |
| `DELETE /api/matchs/:id/parties/:numero` | administrateur | `204` | `400`, `404`, `409` |
| `PUT /api/matchs/:id/cartes/:numero` | administrateur | `200` + détail à jour | `400`, `404`, `409` |
| `DELETE /api/matchs/:id/cartes/:numero` | administrateur | `204` | `400`, `404`, `409` |
| `GET /api/equipes/:id/joueurs` | public | `200` | `404` |

Les `PUT` sont **idempotents** (étape 7) : ils créent la manche si elle n'existe pas, la remplacent sinon, et rejouer la même requête laisse la base dans le même état. Ils répondent avec le détail complet, pour que le client voie immédiatement le **score recalculé**.

Les six raisons de refus sont traduites en code HTTP dans un seul tableau, `REPONSES_AUX_REFUS`, dans `src/controleurs/details.controleur.ts` :

```ts
const REPONSES_AUX_REFUS: Record<RefusDetail, { statut: number; erreur: string }> = {
  'match-introuvable': { statut: 404, erreur: 'Match introuvable' },
  'mauvaise-discipline': { statut: 409, erreur: "Ce détail ne correspond pas à la discipline de la compétition du match." },
  'match-a-venir': { statut: 409, erreur: "Ce match n'a pas encore commencé : passe-le d'abord « en direct »." },
  // ...
};
```

**`Record<RefusDetail, ...>`** exige une entrée pour **chaque** valeur de `RefusDetail`. Le jour où une septième raison de refus sera ajoutée au dépôt, TypeScript refusera de compiler tant qu'elle n'aura pas sa réponse ici : impossible de l'oublier.

Le numéro de manche est lu dans l'adresse et vérifié comme tout ce qui vient du client : `Number('deux')` vaut `NaN`, `Number('')` vaut `0`, et seuls les entiers de 1 à 5 sont acceptés.

### 4.10 Tester l'API

Avec Thunder Client, et le jeton d'un compte administrateur (étape 8). Le corps d'un `PUT /api/matchs/m1/parties/2`, réduit à un joueur par équipe pour rester lisible — dans un vrai match, il y en a cinq de chaque côté :

```json
{
  "duree": 1310,
  "coteBleu": "exterieur",
  "vainqueur": null,
  "equipes": {
    "domicile": { "tours": 3, "inhibiteurs": 0, "barons": 0, "herauts": 1, "larves": 3 },
    "exterieur": { "tours": 4, "inhibiteurs": 0, "barons": 0, "herauts": 0, "larves": 3 }
  },
  "joueurs": {
    "domicile": [
      { "joueurId": "kc-vesper", "poste": "mid", "champion": "Ahri", "kills": 3, "morts": 1,
        "assistances": 2, "sbires": 201, "gold": 8410, "niveau": 14,
        "objets": ["Luden's Companion", "Sorcerer's Shoes"] }
    ],
    "exterieur": [
      { "joueurId": "g2-zephyr", "poste": "mid", "champion": "Syndra", "kills": 1, "morts": 3,
        "assistances": 1, "sbires": 188, "gold": 7020, "niveau": 13,
        "objets": ["Luden's Companion"] }
    ]
  },
  "dragons": [
    { "cote": "exterieur", "type": "hextech" },
    { "cote": "domicile", "type": "nuage" }
  ]
}
```

Le scénario à jouer, avec les réponses **attendues** :

```
GET    /matchs/m1/details                                  -> 200, discipline "lol", 2 parties, score 1-0
PUT    /matchs/m1/parties/2 sans jeton                     -> 401
PUT    /matchs/m1/parties/2 (corps ci-dessus)              -> 200, partie 2 remplacee, score 1-0
PUT    /matchs/m1/parties/2 avec "niveau": 19              -> 400, champ "joueurs.domicile[0].niveau"
PUT    /matchs/m1/parties/2 avec "joueurId": "fnc-ardent"  -> 400, joueur de Valorant
PUT    /matchs/m1/parties/3 avec "vainqueur": null         -> 409, une autre manche est en cours
GET    /matchs/m1/details                                  -> toujours 2 parties : la partie 3 a ete annulee
PUT    /matchs/m1/parties/2 avec "vainqueur": "domicile"   -> 200, score 2-0
PUT    /matchs/m1/parties/6                                -> 400, numero invalide
PUT    /matchs/m2/parties/1                                -> 409, m2 est un match de football
PUT    /matchs/m3/parties/1                                -> 409, m3 n'a pas commence
PUT    /matchs/m2/feuille-football, possessions 60 et 45   -> 400, champ "statistiques"
PUT    /matchs/m1 en changeant l'equipe qui recoit         -> 409, statistiques detaillees
PUT    /matchs/m1 en changeant seulement le statut         -> 200
DELETE /matchs/m1/parties/2                                -> 204, score 1-0
GET    /equipes/kc/joueurs                                 -> 200, 5 joueurs de LoL (Karmine Corp)
```

La septième ligne est la plus importante : elle **prouve le rollback**. Le serveur a bien écrit la partie 3 avant de compter les manches en cours — et elle n'existe pas.

Pour repartir des données de démonstration après ces essais :

```
npm run bdd:peupler
```

Enfin, supprimer un match détaillé depuis Prisma Studio (`npm run bdd:explorer`) — sur une copie, ou avant de relancer le peuplement — doit faire disparaître ses parties et ses statistiques : c'est la cascade.

### 4.11 Côté Angular : le modèle et le service

`src/app/modeles/details.ts` recopie les types de **lecture** du backend, pour la raison donnée à l'étape 4 : c'est le JSON échangé qui fait le contrat. Le frontend n'écrit pas le détail ; il n'a pas besoin des types d'écriture.

La réponse complète est une union discriminée, jointe au match et à sa compétition :

```ts
export type DetailsParDiscipline = DetailsFootball | DetailsLol | DetailsValorant;

export type DetailsMatch = { match: Match; competition: Competition } & DetailsParDiscipline;
```

Le **`&`** (intersection) se lit « et » : un `DetailsMatch` a un match, une compétition, **et** la forme de l'une des trois disciplines.

Le service ajoute une méthode, qui passe le match joint par la frontière de l'étape 5 — sa date redevient un objet `Date` :

```ts
  details(id: string): Observable<DetailsMatch> {
    return this.http
      .get<DetailsMatchApi>(`${this.adresse(id)}/details`)
      .pipe(map((details) => ({ ...details, match: this.convertir(details.match) })));
  }
```

### 4.12 La page de détail et son actualisation

La route, dans `app.routes.ts` :

```ts
  { path: 'matchs/:id', component: MatchDetail, title: 'Détail du match — Suivi Compétition' },
```

Elle est déclarée **après** `matchs/nouveau` : le routeur essaie les routes dans l'ordre, et `:id` accepterait aussi le mot « nouveau ».

Dans `pages/match-detail/match-detail.ts`, le chargement et l'actualisation tiennent en une chaîne, construite dans le constructeur :

```ts
    timer(0, INTERVALLE_ACTUALISATION_MS)
      .pipe(
        takeWhile(() => this.doitActualiser()),
        exhaustMap(() =>
          this.matchService.details(this.idMatch).pipe(
            catchError((erreur: unknown) => {
              this.signalerErreur(erreur);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((details) => {
        this.details.set(details);
        this.erreur.set(null);
        this.derniereMiseAJour.set(new Date());
      });
```

Le schéma du § 2.8, ligne par ligne. Un détail de plus : le `catchError` est placé **à l'intérieur** de `exhaustMap`, sur la requête, et non sur la chaîne entière. Une erreur non rattrapée **termine** un Observable : placée dehors, la première panne réseau aurait arrêté définitivement l'actualisation. `EMPTY` est un Observable qui se termine sans rien émettre : la requête échouée ne produit rien, et le minuteur continue.

`doitActualiser()` dit quand s'arrêter : au premier chargement, toujours ; ensuite, tant que le match est en direct ; jamais pour un match introuvable (`404`). Une autre erreur — l'API éteinte, par exemple — n'arrête rien : la requête suivante réessaiera. Et si des données sont déjà affichées, elles restent à l'écran, avec un message qui prévient qu'elles peuvent être en retard.

Pour afficher le bon panneau, la page expose un `computed()` par discipline :

```ts
  readonly lol = computed(() => {
    const details = this.details();
    return details?.discipline === 'lol' ? details : null;
  });
```

Le test sur `discipline` **rétrécit le type** (étape 7) dans ce code TypeScript : `lol()` est un détail de LoL, ou `null`. Le gabarit n'a plus qu'à écrire :

```html
    @if (lol(); as detailLol) {
      <app-panneau-lol [details]="detailLol" [match]="detailLol.match" />
    }
```

L'en-tête de la page rappelle la compétition, les équipes, le score et le statut. Le score est dans le titre `<h1>`, qui se lit d'une traite : « Karmine Corp 1 – 0 G2 Esports ». Pour un match en direct, une ligne indique l'heure de la dernière actualisation.

Dans la liste des matchs, enfin, chaque match en direct ou terminé reçoit un lien « Statistiques ». Son `aria-label` nomme le match : sans lui, un lecteur d'écran entendrait une suite de liens « Statistiques » impossibles à distinguer — le même problème que les boutons « Favori » de l'étape 9.

### 4.13 Les trois panneaux

`composants/panneau-football`, `panneau-lol` et `panneau-valorant` sont des composants **d'affichage**, comme `ErreursChamp` (étape 7) : ils reçoivent leurs données par des entrées, ne chargent rien et ne modifient rien.

```ts
  readonly details = input.required<DetailsLol>();
  readonly match = input.required<Match>();
```

**`input.required`** : l'entrée est obligatoire. Un `<app-panneau-lol>` sans `[details]` est une erreur de compilation.

**Le football** affiche les buts dans une liste **ordonnée** (`<ol>`), à gauche pour l'équipe qui reçoit, à droite pour l'autre, puis un comparatif : pour chaque statistique, deux valeurs et deux barres proportionnelles. La précision des passes y est **calculée**, comme le veut le § 2.4.

Les barres ne disent rien à un lecteur d'écran — et trois nombres alignés sans contexte (« 58 %, Possession, 42 % ») ne valent guère mieux. Chaque ligne contient donc une phrase complète, **visuellement masquée** (étape 9), et la partie visuelle est masquée aux lecteurs d'écran avec `aria-hidden="true"` :

```html
        <li class="comparaison-ligne">
          <span class="visuellement-masque">
            {{ ligne.libelle }} : {{ match().domicile.nom }} {{ ligne.domicile }},
            {{ match().exterieur.nom }} {{ ligne.exterieur }}.
          </span>
          <span class="valeur" aria-hidden="true">{{ ligne.domicile }}</span>
          <!-- ... libelle, valeur, barres, tous en aria-hidden -->
        </li>
```

**League of Legends** propose un bouton par partie — les boutons bascules à `aria-pressed` de l'étape 9 —, puis, pour la partie choisie, deux cartes d'objectifs (bordure bleue ou rouge selon le côté de la carte) et un tableau par équipe. Le numéro de la partie affichée est le `linkedSignal()` du § 2.9 :

```ts
  readonly numeroChoisi = linkedSignal<PartieLol[], number | null>({
    source: () => this.details().parties,
    computation: (parties, precedent) => {
      if (precedent !== undefined && parties.some((partie) => partie.numero === precedent.value)) {
        return precedent.value;
      }
      return partieParDefaut(parties);
    },
  });
```

`precedent` vaut `undefined` au premier calcul. Ensuite, il contient la valeur précédente — celle qu'a choisie la personne, ou le choix par défaut. Le bouton n'a qu'à écrire `numeroChoisi.set(p.numero)`.

**Valorant** suit le même plan, avec les cartes et leurs rounds.

Les tableaux de joueurs suivent les règles d'accessibilité d'un tableau de données :

- une **légende** `<caption>` (le nom de l'équipe) ;
- des **en-têtes de colonne** `<th scope="col">`, et le nom du joueur en **en-tête de ligne** `<th scope="row">` : un lecteur d'écran annonce « Vesper, Gold, 14,8 k » plutôt qu'un chiffre isolé ;
- des abréviations expliquées avec **`<abbr title="...">`** — et, pour Valorant, une légende en clair sous le tableau, pour qui ne peut pas survoler les en-têtes ;
- un **cadre défilant** : sur un téléphone, un tableau de onze colonnes ne tient pas. Il défile dans son cadre (`overflow-x: auto`) au lieu d'élargir toute la page. Le cadre reçoit `tabindex="0"`, un rôle `region` et un nom : on peut ainsi le faire défiler **au clavier**.

### 4.14 Les formulaires

Le formulaire de compétition a été présenté au § 4.1.

Dans le formulaire de match, un signal retient si le match est détaillé, et cinq champs se désactivent en conséquence :

```ts
      const verrouille = () => this.detailsVerrouilles();
      disabled(chemin.competitionId, verrouille);
      disabled(chemin.domicileId, verrouille);
      disabled(chemin.exterieurId, verrouille);
      disabled(chemin.scoreDomicile, verrouille);
      disabled(chemin.scoreExterieur, verrouille);
```

Les champs restent affichés, et leurs valeurs **inchangées partent quand même** avec le reste : c'est justement ce que le serveur vérifie avant d'accepter (§ 4.8). Un message en tête du formulaire explique pourquoi — le serveur refuserait de toute façon, mais le dire **avant** évite une saisie inutile. C'est le principe de l'étape 8 : le frontend adapte, le backend protège.

### 4.15 Les styles partagés, et une limite de taille

Les panneaux réutilisent des styles communs : tableaux, cartes d'équipe, pastille « en direct ». Or les styles d'un composant sont **encapsulés** (étape 1) : une classe définie dans le CSS de la page de détail ne s'applique **pas** à l'intérieur d'un panneau. Ce qui est partagé rejoint donc `styles.css`, dans une section « Étape 10 ». La pastille « en direct », jusqu'ici dans `matchs.css`, y déménage : deux pages s'en servent désormais.

Une seconde raison pousse dans ce sens. `angular.json` fixe un **budget** : le CSS d'un composant ne doit pas dépasser 4 Ko (avertissement), ni 8 Ko (échec de la construction). Un budget est un garde-fou contre le poids d'une application qui grossit sans qu'on s'en aperçoive. Chaque composant de l'étape garde un CSS court.

### 4.16 Les tests

Cinq fichiers de test sont nouveaux (la page de détail, les trois panneaux, les outils de mise en forme), et six ont été complétés ou mis à jour pour les nouveaux champs `discipline` et `scoreCalcule`. **127 tests** sont attendus (98 à l'étape 9, plus 29).

Les données de détail servent à quatre fichiers : elles sont fabriquées une seule fois, dans `src/testing/details-de-test.ts`, sur le modèle de `jetons-de-test.ts` (étape 8).

**Tester une page qui attend 30 secondes.** Attendre vraiment rendrait les tests interminables. `vi.useFakeTimers()` remplace l'horloge par une horloge **simulée**, que le test fait avancer à la main :

```ts
  it('se recharge toutes les 30 secondes tant que le match est en direct, puis s\'arrete', () => {
    premierTic();
    httpMock.expectOne(URL).flush(LOL_EN_DIRECT);

    // 30 secondes plus tard : nouvelle requete. Le match s'est termine entre-temps.
    ticSuivant();
    httpMock.expectOne(URL).flush(LOL_TERMINE);
    expect(composant.details()?.match.scoreDomicile).toBe(2);

    // Le match est termine : plus rien ne part.
    ticSuivant();
    ticSuivant();
    httpMock.expectNone(URL);
  });
```

`ticSuivant()` appelle `vi.advanceTimersByTime(30_000)` : trente secondes passent instantanément. L'horloge simulée doit être installée **avant** la création du composant, puisque c'est à ce moment que le minuteur démarre.

Le choix d'`exhaustMap` a son propre test : deux tics sans réponse du serveur doivent laisser **une seule** requête en attente. `expectOne` échoue s'il en trouve deux — ce qui arriverait avec `mergeMap` (une requête de plus) comme avec `switchMap` (une requête annulée, une nouvelle lancée).

**Tester `linkedSignal()`** : afficher deux parties, cliquer sur « Partie 1 », puis donner au composant de **nouveaux objets**, comme le ferait un rechargement. Le choix doit avoir survécu :

```ts
    await afficher([partieLol(1, 'domicile'), partieLol(2, null)]);

    page().querySelector<HTMLButtonElement>('.filtre')?.click();
    await fixture.whenStable();
    expect(composant.numeroChoisi()).toBe(1);

    await afficher([partieLol(1, 'domicile'), partieLol(2, null)]);
    expect(composant.numeroChoisi()).toBe(1);
```

Un composant à entrées se teste en les remplissant avec **`fixture.componentRef.setInput('details', ...)`**.

Les fonctions de mise en forme (`outils/statistiques.ts` : durée, milliers, pourcentages, minute d'un but, écart) sont des **fonctions pures** : leur résultat ne dépend que de leurs arguments. Elles se testent sans aucune simulation — une entrée, une sortie.

Les commandes :

```
cd backend
npm run verifier            # types du backend

cd ../frontend
npx ng test --watch=false   # 127 tests attendus
npx ng build                # verifie aussi les budgets de CSS
```

Puis le parcours dans le navigateur, les deux serveurs démarrés :

1. `/matchs` : un lien « Statistiques » sur chaque match en direct ou terminé, aucun sur les matchs à venir ;
2. `/matchs/m1` : la partie 2 est affichée par défaut, avec une pastille rouge ; cliquer « Partie 1 » affiche la victoire de Karmine Corp, et **le choix tient** au-delà de 30 secondes ;
3. pendant ce temps, modifier la partie 2 dans Thunder Client : la page affiche les nouveaux chiffres au plus tard 30 secondes après, sans rechargement ;
4. `/matchs/m2` : les trois buts (dont « 45+2’ » et le penalty), le comparatif ; `/matchs/m6` : le contre son camp ;
5. `/matchs/m9` : la carte Sunset en cours, 7 – 5 ;
6. `/matchs/m1/modifier` en administrateur : compétition, équipes et score grisés, le message d'explication ;
7. éteindre l'API sur une page en direct : les chiffres restent, un message prévient ; la rallumer : il disparaît à l'actualisation suivante ;
8. au clavier : le cadre d'un tableau se fait défiler avec les flèches après y être arrivé par Tab ;
9. dans les outils de développement (onglet Réseau), quitter la page d'un match en direct : plus aucune requête vers `/details`.

Enfin, les captures d'écran du cours :

```
npm run captures -- etape-10 match-football match-lol match-lol-partie-1 match-valorant match-modifier-verrouille competition-nouvelle
```

## 5. Livrable attendu

Les captures ci-dessous sont produites par la commande de fin du § 4.16.

Le détail d'un match de League of Legends en direct, sur la partie en cours :

![Page de détail du match Karmine Corp – G2 en thème clair, partie 2 en cours](docs/images/etape-10-clair-match-lol.png)

Un match de football, avec ses buts et son comparatif :

![Page de détail du match PSG – OM en thème sombre](docs/images/etape-10-sombre-match-football.png)

Une carte de Valorant en cours :

![Page de détail du match G2 – Fnatic en thème clair, carte Sunset en cours](docs/images/etape-10-clair-match-valorant.png)

Le formulaire d'un match détaillé, champs figés :

![Formulaire de modification du match m1 en thème sombre, compétition, équipes et score désactivés](docs/images/etape-10-sombre-match-modifier-verrouille.png)

Ce qui doit fonctionner :

- `npm run bdd:migrer` applique la migration `statistiques`, et les quatre compétitions existantes reçoivent la bonne discipline ;
- `npm run bdd:peupler` se termine par « 6 scores vérifiés », et peut être relancé sans erreur ;
- `GET /api/matchs/:id/details` renvoie le détail de chaque discipline, et `404` pour un match inconnu ;
- chaque écriture de détail recalcule le score du match ; une écriture refusée ne laisse **aucune** trace (le scénario du § 4.10) ;
- supprimer un match supprime son détail ;
- le formulaire de match fige compétition, équipes et score d'un match détaillé, et le serveur refuse (`409`) de les changer ;
- une compétition se crée avec sa discipline, qui ne se modifie plus ensuite ;
- la page d'un match en direct s'actualise toute seule, et arrête d'interroger l'API quand on la quitte ;
- `npm run verifier` (backend), `npx ng test --watch=false` et `npx ng build` (frontend) passent.

## 6. Checklist d'auto-vérification

1. Pourquoi des tables typées plutôt qu'une colonne JSON ou une table clé/valeur ? Qu'est-ce que le projet perd, et qu'est-ce qu'il gagne ?
   - *À relire :* § 2.2 « Modéliser des données qui changent de forme »
2. Pourquoi désigner une équipe par son côté plutôt que par son identifiant ? Quelle erreur devient impossible à écrire ?
   - *À relire :* § 2.3 « Rendre l'incohérence impossible à écrire »
3. Pourquoi les kills d'une équipe ne sont-ils pas stockés, alors que le score du match l'est ? À quelle condition peut-on stocker une donnée dérivée ?
   - *À relire :* § 2.4 « Ce qui se calcule ne se stocke pas… sauf exception »
4. Qu'est-ce qu'une transaction ? Pourquoi la règle « une seule manche en cours » se vérifie-t-elle **après** l'écriture, et comment l'écriture est-elle annulée si la règle échoue ?
   - *À relire :* § 2.5 « La transaction » et § 4.7 « Écrire dans une transaction »
5. Pourquoi ajouter une colonne obligatoire à une table non vide demande-t-il trois instructions au lieu d'une ?
   - *À relire :* § 2.7 « Une migration qui transforme des données » et § 4.3
6. Pourquoi `exhaustMap` plutôt que `switchMap` pour l'actualisation ? Que se passerait-il sans `takeUntilDestroyed()` ? Et si `catchError` était placé sur la chaîne entière ?
   - *À relire :* § 2.8 « Une page qui se met à jour toute seule » et § 4.12
7. Pourquoi ni `computed()` ni `signal()` ne conviennent-ils pour retenir la partie affichée ? Que reçoit la fonction de calcul d'un `linkedSignal()` ?
   - *À relire :* § 2.9 « linkedSignal » et § 4.13 « Les trois panneaux »
8. Pourquoi la vérification d'un match détaillé utilise-t-elle `updateMany` avec une condition, plutôt qu'une lecture suivie d'une écriture ?
   - *À relire :* § 4.8 « Verrouiller un match détaillé »

## 7. Branche d'arrivée

À la fin de cette étape, ton code doit être poussé sur **`etape-10-statistiques`**.

L'étape suivante partira de cette branche pour créer `etape-11-api-riot`, qui remplacera les matchs saisis à la main par les vrais résultats de League of Legends et de Valorant.

> **À faire avant l'étape 11.** Crée un compte sur le **Riot Developer Portal** (developer.riotgames.com) avec ton compte Riot Games. Une clé d'API de développement y est générée automatiquement. Ne la colle **nulle part** dans la conversation ni dans le code : elle ira dans `backend/.env`, comme `JWT_SECRET`.
>
> **Un point à vérifier en ouvrant l'étape 11.** L'API officielle de Riot Games est conçue pour les parties des joueurs (classées, normales), pas pour les compétitions professionnelles : les matchs de la LEC ou du VCT n'y figurent probablement pas, et leurs statistiques détaillées encore moins. Il faudra examiner ce que la clé donne réellement avant de décider comment alimenter les tables de cette étape.
