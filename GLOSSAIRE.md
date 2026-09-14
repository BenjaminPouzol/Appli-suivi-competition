# Glossaire

Tous les termes techniques rencontrés au fil du projet, définis simplement et illustrés par un exemple tiré du projet lui-même.

Les termes sont classés par ordre alphabétique. L'étape à laquelle chaque terme a été introduit est indiquée entre crochets, pour pouvoir retrouver le contexte dans [DOCUMENT-APPRENTISSAGE.md](DOCUMENT-APPRENTISSAGE.md).

---

### Angular *[étape 0]*

**Framework** (voir ce terme) de développement web créé par Google, qui sert à construire la partie visible d'une application — celle qui s'affiche dans le navigateur. Il fournit une structure toute faite pour découper une page en morceaux réutilisables et pour gérer l'affichage des données.

*Dans le projet :* c'est avec Angular que seront construites la page d'accueil, la liste des matchs et le tableau de bord.

### Angular CLI *[étape 0]*

Outil en ligne de commande (voir **CLI**) fourni avec Angular. Il automatise les tâches répétitives : créer un nouveau projet, générer un composant, lancer un serveur de test local.

*Dans le projet :* la commande `ng new` créera la structure complète du projet Angular à l'étape 1, au lieu de créer des dizaines de fichiers à la main.

### API *[étape 0]*

Sigle de *Application Programming Interface*, en français « interface de programmation ». C'est une **porte d'entrée officielle** qu'un service met à disposition pour que d'autres programmes puissent lui demander des données ou des actions, sans passer par un écran humain.

Une analogie : un restaurant a une salle (pour les humains) et un guichet « commandes à emporter » réservé aux livreurs, avec un menu précis et des règles précises. L'API, c'est ce guichet.

*Dans le projet :* l'API de Riot Games permettra de récupérer les résultats de matchs de League of Legends sans avoir à lire le site de Riot à la main.

### Clé d'API *[étape 0]*

Mot de passe personnel fourni par un service pour identifier **qui** appelle son API. Elle permet au service de compter les appels, d'appliquer des limites, et de couper l'accès en cas d'abus.

Une clé d'API est un **secret** : quiconque la possède peut s'en servir à votre place, et les conséquences (blocage du compte, facturation) retombent sur vous.

*Dans le projet :* les clés Riot Games et football-data.org seront stockées dans le fichier `.env`, jamais écrites directement dans le code, jamais envoyées sur GitHub.

### CLI *[étape 0]*

Sigle de *Command Line Interface*, en français « interface en ligne de commande ». Désigne un programme qu'on utilise en tapant des commandes texte dans un terminal, plutôt qu'en cliquant dans des fenêtres.

*Dans le projet :* `git`, `npm` et `ng` (Angular CLI) sont tous des CLI. Taper `ng version` affiche la version installée d'Angular.

### Commit *[étape 0]*

Un « point de sauvegarde » enregistré dans l'historique de Git. Un commit fige l'état de l'ensemble des fichiers à un instant donné et y attache un message expliquant ce qui a changé et pourquoi.

Contrairement à une sauvegarde classique qui écrase la version précédente, un commit **s'ajoute** à l'historique : toutes les versions antérieures restent consultables et restaurables.

*Dans le projet :* la règle est « un commit = une étape terminée et fonctionnelle ». Le commit de l'étape 0 fige le dépôt structuré avec ses documents de suivi.

### Dépôt (*repository*) *[étape 0]*

Dossier de projet suivi par Git. Il contient les fichiers du projet **et** l'intégralité de leur historique de modifications, rangé dans un sous-dossier caché nommé `.git`.

*Dans le projet :* le dossier `Appli-suivi-competition` est le dépôt. Il existe en deux exemplaires synchronisés : un **local** sur le PC, un **distant** sur GitHub.

### Branche *[étape 0]*

Ligne de développement parallèle à l'intérieur d'un dépôt Git. Créer une branche revient à faire une copie de travail de l'historique, sur laquelle on peut avancer librement sans toucher à la version de référence.

*Dans le projet :* chaque étape a sa branche (`etape-00-setup`, `etape-01-angular-decouverte`, …), ce qui permet de revenir à n'importe quelle étape validée en cas de blocage.

### `.env` *[étape 0]*

Fichier texte qui contient les **variables d'environnement** (voir ce terme) propres à une machine : mots de passe, clés d'API, adresse de la base de données. Il n'est jamais envoyé sur GitHub — il est exclu par le `.gitignore`.

*Dans le projet :* il contiendra le mot de passe PostgreSQL et les clés Riot / football-data.org.

### `.env.example` *[étape 0]*

Modèle du fichier `.env`, envoyé lui sur GitHub. Il liste **les noms** des variables nécessaires au projet, mais avec des valeurs vides ou factices.

Son rôle : quand quelqu'un récupère le projet, il sait immédiatement quelles variables il doit renseigner, sans qu'aucun secret n'ait circulé.

*Dans le projet :* il est créé dès l'étape 0 et complété à chaque fois qu'une nouvelle variable apparaît.

### `.gitignore` *[étape 0]*

Fichier qui liste ce que Git doit **délibérément ignorer** : fichiers de secrets, dossiers générés automatiquement, fichiers temporaires. Tout ce qui y figure ne sera jamais enregistré dans un commit, même par accident.

*Dans le projet :* il exclut `.env` (pour la sécurité) et `node_modules/` (dossier de dépendances, très volumineux et reconstructible à tout moment avec `npm install`).

### Git *[étape 0]*

Logiciel de **gestion de versions** : il enregistre l'historique complet des modifications d'un projet, permet de revenir à un état antérieur, et de travailler sur plusieurs versions en parallèle grâce aux branches.

Git fonctionne entièrement sur l'ordinateur local — il n'a pas besoin d'Internet pour enregistrer l'historique.

*Dans le projet :* toutes les étapes sont versionnées avec Git, ce qui rend possible la règle de retour arrière du cadre projet.

### GitHub *[étape 0]*

Service en ligne qui héberge des dépôts Git. Il ajoute autour de Git une interface web, la sauvegarde à distance et des outils de collaboration.

Git et GitHub sont deux choses distinctes : Git est le logiciel qui gère l'historique, GitHub est un hébergeur qui stocke une copie de cet historique.

*Dans le projet :* le dépôt est hébergé sur `github.com/BenjaminPouzol/Appli-suivi-competition`.

### Framework *[étape 0]*

Ensemble d'outils et de règles qui fournit une **structure de départ** pour construire un logiciel. Plutôt que de tout écrire de zéro, on remplit les emplacements prévus par le framework, qui se charge de l'assemblage.

La différence avec une simple bibliothèque : avec une bibliothèque, votre code appelle l'outil ; avec un framework, c'est le framework qui appelle votre code.

*Dans le projet :* Angular (côté navigateur) et Express (côté serveur) sont les deux frameworks retenus.

### Installation globale (`-g`) *[étape 0]*

Option de npm qui installe un paquet **sur toute la machine** plutôt que dans un projet précis. Le programme installé devient alors utilisable comme une commande depuis n'importe quel dossier.

*Dans le projet :* `npm install -g @angular/cli` a rendu la commande `ng` disponible partout, ce qui est nécessaire puisqu'elle sert justement à créer le projet — donc avant que le projet existe.

### Locale *[étape 0]*

Réglage qui définit les conventions régionales d'un système : langue, format des dates, ordre alphabétique et traitement des caractères accentués.

*Dans le projet :* la locale `DEFAULT` choisie à l'installation de PostgreSQL reprend les paramètres français de Windows, pour que les tris sur des noms d'équipes accentués se comportent correctement.

### Markdown *[étape 0]*

Langage de mise en forme de texte très simple, reconnaissable à sa syntaxe légère (`#` pour un titre, `**gras**`, `- ` pour une puce). Les fichiers portent l'extension `.md`.

Son intérêt : le fichier reste lisible tel quel dans un éditeur de texte, tout en s'affichant proprement mis en forme sur GitHub.

*Dans le projet :* `CONTEXTE.md`, `GLOSSAIRE.md` et `DOCUMENT-APPRENTISSAGE.md` sont écrits en Markdown.

### Mermaid *[étape 0]*

Outil qui transforme du **texte** en **schéma**. On décrit le diagramme avec quelques lignes de syntaxe, et l'affichage dessine automatiquement les cases et les flèches.

Son intérêt ici : comme un schéma Mermaid est du texte, Git le suit exactement comme du code — on voit l'historique de ses modifications, ce qui serait impossible avec une image dessinée à la main.

*Dans le projet :* tous les schémas du document d'apprentissage sont écrits en Mermaid, à l'intérieur de blocs de code ` ```mermaid `.

### Node.js *[étape 0]*

Programme qui permet d'exécuter du **JavaScript en dehors d'un navigateur**, directement sur un ordinateur ou un serveur.

Historiquement, JavaScript ne tournait que dans les pages web. Node.js a sorti le langage du navigateur, ce qui permet d'écrire aussi la partie serveur d'une application en JavaScript.

*Dans le projet :* c'est Node.js qui exécutera le backend Express, et c'est aussi lui qui fait tourner les outils de développement comme Angular CLI.

### npm *[étape 0]*

Sigle de *Node Package Manager*, le **gestionnaire de paquets** installé automatiquement avec Node.js. Il télécharge les bibliothèques dont un projet a besoin et tient à jour la liste de ces dépendances.

*Dans le projet :* `npm install -g @angular/cli` a servi à installer Angular CLI.

### `node_modules/` *[étape 0]*

Dossier créé automatiquement par npm, qui contient le code de toutes les bibliothèques téléchargées pour un projet. Il peut peser plusieurs centaines de mégaoctets et contenir des dizaines de milliers de fichiers.

Il n'est jamais envoyé sur GitHub : il est entièrement reconstructible à partir de la liste des dépendances, avec une seule commande `npm install`.

*Dans le projet :* il est exclu par le `.gitignore` dès l'étape 0.

### Paquet (*package*) *[étape 0]*

Bibliothèque de code réutilisable, publiée par quelqu'un d'autre et installable en une commande. Utiliser un paquet évite de réécrire une fonctionnalité que d'autres ont déjà résolue et éprouvée.

*Dans le projet :* `@angular/cli` est un paquet ; Express et Prisma en seront d'autres.

### pgAdmin *[étape 0]*

Application graphique livrée avec PostgreSQL, qui permet d'explorer une base de données à la souris : voir les tables, leur contenu, et écrire des requêtes SQL sans passer par le terminal.

*Dans le projet :* servira à partir de l'étape 6 pour vérifier visuellement que les données sont bien enregistrées. **DBeaver** est une alternative équivalente.

### Port *[étape 0]*

Numéro qui identifie **un programme précis** sur une machine, parmi tous ceux qui écoutent le réseau. L'adresse IP désigne la machine ; le port désigne le service à l'intérieur de cette machine.

Analogie : l'adresse IP est l'adresse d'un immeuble, le port est le numéro d'appartement.

*Dans le projet :* PostgreSQL écoute sur le port `5432` (sa valeur standard). Angular utilisera `4200` et le backend Express `3000` — trois programmes sur la même machine, distingués par leur port.

### PostgreSQL *[étape 0]*

**SGBD** (voir ce terme) relationnel, gratuit et open source. Il stocke les données dans des tables liées entre elles, et se pilote avec le langage SQL.

*Dans le projet :* il stockera les équipes, les matchs, les compétitions, les utilisateurs et leurs favoris.

### Secret *[étape 0]*

Toute information qui donne un accès et qui ne doit jamais être rendue publique : mot de passe, clé d'API, jeton d'authentification.

Règle absolue du projet : un secret ne s'écrit jamais dans le code et ne part jamais sur GitHub. Un secret publié par erreur doit être considéré comme compromis et régénéré — le supprimer dans un commit ultérieur ne suffit pas, puisqu'il reste consultable dans l'historique.

*Dans le projet :* le mot de passe PostgreSQL et les deux clés d'API sont des secrets, stockés dans `.env`.

### SGBD *[étape 0]*

Sigle de « Système de Gestion de Base de Données ». Programme spécialisé dans le stockage, l'organisation et la restitution de grandes quantités de données, qui garantit en plus leur cohérence et gère plusieurs accès simultanés.

*Dans le projet :* PostgreSQL est le SGBD retenu ; la base de données du projet est ce qu'il contiendra.

### Terminal *[étape 0]*

Fenêtre dans laquelle on tape des commandes texte pour piloter l'ordinateur, par opposition à l'interface graphique où l'on clique.

*Dans le projet :* toutes les commandes `git`, `npm` et `ng` s'y exécutent. VS Code en intègre un directement, accessible par le menu *Terminal → Nouveau terminal*.

### Variable d'environnement *[étape 0]*

Valeur nommée, fournie à un programme **depuis l'extérieur** de son code, au moment où il démarre.

Son intérêt est double : le même code peut fonctionner sur plusieurs machines avec des réglages différents (adresse de base de données locale ou de production), et les secrets restent séparés du code, donc absents de GitHub.

*Dans le projet :* `DATABASE_URL` et `RIOT_API_KEY` seront des variables d'environnement, définies dans `.env`.

### VS Code (Visual Studio Code) *[étape 0]*

Éditeur de code gratuit développé par Microsoft. Au-delà de l'écriture de texte, il apporte la coloration syntaxique, la détection d'erreurs à la frappe, l'intégration de Git et un terminal intégré.

*Dans le projet :* éditeur principal, complété par des extensions (Angular Language Service, ESLint, Prettier, GitLens, DotENV, Thunder Client).
