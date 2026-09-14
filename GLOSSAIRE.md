# Glossaire

Tous les termes techniques rencontrés au fil du projet, définis simplement et illustrés par un exemple tiré du projet lui-même.

Les termes sont classés par ordre alphabétique — les noms de fichiers commençant par un point sont rangés à leur première lettre (`.env` à la lettre E). L'étape à laquelle chaque terme a été introduit est indiquée entre crochets, pour retrouver le contexte dans [DOCUMENT-APPRENTISSAGE.md](DOCUMENT-APPRENTISSAGE.md).

---

### Angular *[étape 0]*

**Framework** (voir ce terme) de développement web créé par Google, qui sert à construire la partie visible d'une application — celle qui s'affiche dans le navigateur. Il fournit une structure toute faite pour découper une page en morceaux réutilisables et pour gérer l'affichage des données.

*Dans le projet :* c'est avec Angular que sont construites la page d'accueil, la barre de navigation et, plus tard, le tableau de bord.

### Angular CLI *[étape 0]*

Outil en ligne de commande (voir **CLI**) fourni avec Angular. Il automatise les tâches répétitives : créer un nouveau projet, générer un composant, lancer un serveur de test local.

*Dans le projet :* `ng new` a créé la structure complète du projet, et `ng generate component` a créé chacun des quatre composants de l'étape 1.

### API *[étape 0]*

Sigle de *Application Programming Interface*, en français « interface de programmation ». C'est une **porte d'entrée officielle** qu'un service met à disposition pour que d'autres programmes puissent lui demander des données ou des actions, sans passer par un écran humain.

Une analogie : un restaurant a une salle (pour les humains) et un guichet « commandes à emporter » réservé aux livreurs, avec un menu précis et des règles précises. L'API, c'est ce guichet.

*Dans le projet :* l'API de Riot Games permettra de récupérer les résultats de matchs de League of Legends sans avoir à lire le site de Riot à la main.

### Branche *[étape 0]*

Ligne de développement parallèle à l'intérieur d'un dépôt Git. Créer une branche revient à faire une copie de travail de l'historique, sur laquelle on peut avancer librement sans toucher à la version de référence.

*Dans le projet :* chaque étape a sa branche (`etape-00-setup`, `etape-01-angular-decouverte`, …), ce qui permet de revenir à n'importe quelle étape validée en cas de blocage.

### Build (compilation) *[étape 1]*

Opération qui transforme le code source — écrit pour être lisible par un humain — en fichiers optimisés que le navigateur sait exécuter. Le TypeScript est converti en JavaScript, les fichiers sont regroupés, compressés et renommés.

*Dans le projet :* `npm run build` produit le dossier `frontend/dist/`. Ce dossier n'est pas versionné : il est entièrement reconstructible à partir du code source.

### Bundle *[étape 1]*

Fichier unique produit par le build, qui regroupe plusieurs fichiers source. L'intérêt est de réduire le nombre d'allers-retours entre le navigateur et le serveur : un gros fichier se télécharge plus vite que cinquante petits.

*Dans le projet :* le build de l'étape 1 produit un bundle `main-<code>.js` d'environ 228 ko. La suite de caractères dans le nom change à chaque build, ce qui force le navigateur à retélécharger le fichier au lieu de servir une version périmée depuis son cache.

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

*Dans le projet :* la règle est « un commit = une étape terminée et fonctionnelle ».

### Composant *[étape 1]*

Brique de base d'une application Angular. Un composant réunit **un morceau d'écran et le code qui le fait vivre** : son affichage (HTML), son apparence (CSS) et son comportement (TypeScript).

Son intérêt est de rendre l'interface modulaire : plutôt qu'un seul fichier HTML géant, la page est assemblée à partir de composants indépendants, chacun responsable d'une zone, réutilisable et modifiable sans risque pour les autres.

*Dans le projet :* `Header` (la barre de navigation), `Accueil`, `Competitions` et `APropos` sont quatre composants distincts.

### Décorateur *[étape 1]*

Instruction placée juste au-dessus d'une classe TypeScript, reconnaissable à son `@`, qui ajoute des informations sur cette classe sans en modifier le contenu.

*Dans le projet :* `@Component({ ... })` est ce qui dit à Angular « cette classe n'est pas une classe ordinaire, c'est un composant ; voici son sélecteur, son gabarit et sa feuille de style ». Sans ce décorateur, la classe ne serait qu'un objet TypeScript sans lien avec l'affichage.

### Dépendance *[étape 1]*

Bibliothèque externe dont un projet a besoin pour fonctionner. Les dépendances sont listées dans `package.json` et installées dans `node_modules/`.

On distingue deux catégories : les **dependencies**, nécessaires au fonctionnement de l'application une fois publiée (Angular lui-même), et les **devDependencies**, utiles uniquement pendant le développement (Angular CLI, Prettier, les outils de test).

*Dans le projet :* `@angular/router` est une dépendance ; `prettier` est une dépendance de développement.

### Dépôt (*repository*) *[étape 0]*

Dossier de projet suivi par Git. Il contient les fichiers du projet **et** l'intégralité de leur historique de modifications, rangé dans un sous-dossier caché nommé `.git`.

*Dans le projet :* le dossier `Appli-suivi-competition` est le dépôt. Il existe en deux exemplaires synchronisés : un **local** sur le PC, un **distant** sur GitHub.

### Encapsulation des styles *[étape 1]*

Mécanisme par lequel Angular **limite automatiquement la portée du CSS d'un composant à ce seul composant**.

Sans lui, une règle `.carte { ... }` écrite pour une page s'appliquerait à toutes les `.carte` de l'application, y compris celles écrites par quelqu'un d'autre pour un usage différent. Angular évite ce problème en ajoutant en coulisses un attribut unique à chaque élément du composant, et en modifiant les sélecteurs CSS pour ne cibler que lui.

*Dans le projet :* la classe `.note-chantier` est définie séparément dans `accueil.css` et dans `competitions.css`. Les deux définitions coexistent sans se gêner, alors qu'elles portent le même nom.

### .env *[étape 0]*

Fichier texte qui contient les **variables d'environnement** (voir ce terme) propres à une machine : mots de passe, clés d'API, adresse de la base de données. Il n'est jamais envoyé sur GitHub — il est exclu par le `.gitignore`.

*Dans le projet :* il contiendra le mot de passe PostgreSQL et les clés Riot / football-data.org.

### .env.example *[étape 0]*

Modèle du fichier `.env`, envoyé lui sur GitHub. Il liste **les noms** des variables nécessaires au projet, mais avec des valeurs vides ou factices.

Son rôle : quand quelqu'un récupère le projet, il sait immédiatement quelles variables il doit renseigner, sans qu'aucun secret n'ait circulé.

### Framework *[étape 0]*

Ensemble d'outils et de règles qui fournit une **structure de départ** pour construire un logiciel. Plutôt que de tout écrire de zéro, on remplit les emplacements prévus par le framework, qui se charge de l'assemblage.

La différence avec une simple bibliothèque : avec une bibliothèque, votre code appelle l'outil ; avec un framework, c'est le framework qui appelle votre code.

*Dans le projet :* Angular (côté navigateur) et Express (côté serveur) sont les deux frameworks retenus.

### Git *[étape 0]*

Logiciel de **gestion de versions** : il enregistre l'historique complet des modifications d'un projet, permet de revenir à un état antérieur, et de travailler sur plusieurs versions en parallèle grâce aux branches.

Git fonctionne entièrement sur l'ordinateur local — il n'a pas besoin d'Internet pour enregistrer l'historique.

### GitHub *[étape 0]*

Service en ligne qui héberge des dépôts Git. Il ajoute autour de Git une interface web, la sauvegarde à distance et des outils de collaboration.

Git et GitHub sont deux choses distinctes : Git est le logiciel qui gère l'historique, GitHub est un hébergeur qui stocke une copie de cet historique.

*Dans le projet :* le dépôt est hébergé sur `github.com/BenjaminPouzol/Appli-suivi-competition`.

### .gitignore *[étape 0]*

Fichier qui liste ce que Git doit **délibérément ignorer** : fichiers de secrets, dossiers générés automatiquement, fichiers temporaires. Tout ce qui y figure ne sera jamais enregistré dans un commit, même par accident.

*Dans le projet :* il y en a deux — un à la racine (qui exclut `.env`) et un dans `frontend/` créé par Angular (qui exclut `node_modules/` et `dist/`). Les deux s'appliquent, chacun à son niveau.

### Installation globale (`-g`) *[étape 0]*

Option de npm qui installe un paquet **sur toute la machine** plutôt que dans un projet précis. Le programme installé devient alors utilisable comme une commande depuis n'importe quel dossier.

*Dans le projet :* `npm install -g @angular/cli` a rendu la commande `ng` disponible partout, ce qui est nécessaire puisqu'elle sert justement à créer le projet — donc avant que le projet existe.

### Locale *[étape 0]*

Réglage qui définit les conventions régionales d'un système : langue, format des dates, ordre alphabétique et traitement des caractères accentués.

*Dans le projet :* la locale `DEFAULT` choisie à l'installation de PostgreSQL reprend les paramètres français de Windows, pour que les tris sur des noms d'équipes accentués se comportent correctement.

### Markdown *[étape 0]*

Langage de mise en forme de texte très simple, reconnaissable à sa syntaxe légère (`#` pour un titre, `**gras**`, `- ` pour une puce). Les fichiers portent l'extension `.md`.

Son intérêt : le fichier reste lisible tel quel dans un éditeur de texte, tout en s'affichant proprement mis en forme sur GitHub.

### Mermaid *[étape 0]*

Outil qui transforme du **texte** en **schéma**. On décrit le diagramme avec quelques lignes de syntaxe, et l'affichage dessine automatiquement les cases et les flèches.

Son intérêt ici : comme un schéma Mermaid est du texte, Git le suit exactement comme du code — on voit l'historique de ses modifications, ce qui serait impossible avec une image dessinée à la main.

### Node.js *[étape 0]*

Programme qui permet d'exécuter du **JavaScript en dehors d'un navigateur**, directement sur un ordinateur ou un serveur.

Historiquement, JavaScript ne tournait que dans les pages web. Node.js a sorti le langage du navigateur, ce qui permet d'écrire aussi la partie serveur d'une application en JavaScript.

*Dans le projet :* c'est Node.js qui exécutera le backend Express, et c'est aussi lui qui fait tourner les outils de développement comme Angular CLI.

### node_modules/ *[étape 0]*

Dossier créé automatiquement par npm, qui contient le code de toutes les bibliothèques téléchargées pour un projet. Il peut peser plusieurs centaines de mégaoctets et contenir des dizaines de milliers de fichiers.

Il n'est jamais envoyé sur GitHub : il est entièrement reconstructible à partir de `package.json`, avec une seule commande `npm install`.

### npm *[étape 0]*

Sigle de *Node Package Manager*, le **gestionnaire de paquets** installé automatiquement avec Node.js. Il télécharge les bibliothèques dont un projet a besoin et tient à jour la liste de ces dépendances.

### package.json *[étape 1]*

Carte d'identité d'un projet Node.js. Il contient son nom, sa version, la liste de ses **dépendances** et la liste de ses **scripts** — des raccourcis vers des commandes plus longues.

*Dans le projet :* `frontend/package.json` définit le script `start`, ce qui permet d'écrire `npm start` au lieu de `ng serve`. C'est aussi ce fichier qui permet à `npm install` de reconstruire `node_modules/` à l'identique sur une autre machine.

### Paquet (*package*) *[étape 0]*

Bibliothèque de code réutilisable, publiée par quelqu'un d'autre et installable en une commande. Utiliser un paquet évite de réécrire une fonctionnalité que d'autres ont déjà résolue et éprouvée.

*Dans le projet :* `@angular/cli` est un paquet ; Express et Prisma en seront d'autres.

### pgAdmin *[étape 0]*

Application graphique livrée avec PostgreSQL, qui permet d'explorer une base de données à la souris : voir les tables, leur contenu, et écrire des requêtes SQL sans passer par le terminal.

*Dans le projet :* servira à partir de l'étape 6. **DBeaver** est une alternative équivalente.

### Port *[étape 0]*

Numéro qui identifie **un programme précis** sur une machine, parmi tous ceux qui écoutent le réseau. L'adresse IP désigne la machine ; le port désigne le service à l'intérieur de cette machine.

Analogie : l'adresse IP est l'adresse d'un immeuble, le port est le numéro d'appartement.

*Dans le projet :* PostgreSQL écoute sur le port `5432`, le serveur de développement Angular sur le `4200`, et le backend Express utilisera le `3000`.

### PostgreSQL *[étape 0]*

**SGBD** (voir ce terme) relationnel, gratuit et open source. Il stocke les données dans des tables liées entre elles, et se pilote avec le langage SQL.

*Dans le projet :* il stockera les équipes, les matchs, les compétitions, les utilisateurs et leurs favoris.

### Routage (*routing*) *[étape 1]*

Mécanisme qui associe une **adresse** (l'URL affichée dans la barre du navigateur) à un **contenu** (le composant à afficher).

*Dans le projet :* le routage est configuré dans `app.routes.ts`. Il fait correspondre `/competitions` au composant `Competitions`.

### Route *[étape 1]*

Une entrée de la configuration du routage : la correspondance entre un chemin d'URL et le composant à afficher.

*Dans le projet :* `{ path: 'a-propos', component: APropos }` est une route. La route `{ path: '**', redirectTo: '' }` est particulière : `**` signifie « n'importe quelle autre adresse », et sert à renvoyer vers l'accueil quand l'utilisateur tape une URL qui n'existe pas.

### router-outlet *[étape 1]*

Balise Angular qui marque, dans un gabarit, **l'emplacement où le contenu de la page courante doit s'insérer**.

Tout ce qui est écrit autour d'elle reste affiché en permanence ; seul ce qu'elle contient change lors d'une navigation.

*Dans le projet :* dans `app.html`, la barre de navigation est placée au-dessus du `<router-outlet />`. C'est pour ça qu'elle ne disparaît jamais quand on change de page.

### routerLink *[étape 1]*

Attribut Angular qui remplace le `href` d'un lien classique. Il déclenche une navigation **interne** : le routeur change le contenu affiché sans recharger la page.

*Dans le projet :* `<a routerLink="/competitions">` navigue instantanément, là où `<a href="/competitions">` provoquerait un rechargement complet de l'application.

Son compagnon `routerLinkActive` applique automatiquement une classe CSS au lien correspondant à la page affichée — c'est ce qui met en surbrillance l'onglet courant dans la barre de navigation.

### Secret *[étape 0]*

Toute information qui donne un accès et qui ne doit jamais être rendue publique : mot de passe, clé d'API, jeton d'authentification.

Règle absolue du projet : un secret ne s'écrit jamais dans le code et ne part jamais sur GitHub. Un secret publié par erreur doit être considéré comme compromis et régénéré — le supprimer dans un commit ultérieur ne suffit pas, puisqu'il reste consultable dans l'historique.

### Sélecteur (*selector*) *[étape 1]*

Nom de la balise HTML sous laquelle un composant s'utilise dans un gabarit.

*Dans le projet :* le composant `Header` déclare `selector: 'app-header'`, ce qui permet de l'insérer en écrivant `<app-header />`. Le préfixe `app-` évite toute collision avec une balise HTML existante ou avec une bibliothèque tierce.

### Serveur de développement *[étape 1]*

Petit serveur web local, lancé par `ng serve`, qui sert l'application pendant qu'on la construit. Il surveille les fichiers et, à chaque sauvegarde, recompile et rafraîchit automatiquement le navigateur — c'est le **rechargement à chaud** (*hot reload*).

Il n'est destiné qu'au développement : il privilégie la vitesse de recompilation sur l'optimisation, et ne doit jamais servir à publier une application.

*Dans le projet :* il tourne sur `http://localhost:4200`.

### SGBD *[étape 0]*

Sigle de « Système de Gestion de Base de Données ». Programme spécialisé dans le stockage, l'organisation et la restitution de grandes quantités de données, qui garantit en plus leur cohérence et gère plusieurs accès simultanés.

### SPA (application monopage) *[étape 1]*

Sigle de *Single Page Application*. Type d'application web dans lequel le navigateur ne charge **qu'une seule vraie page HTML**, au tout début. Les changements d'écran sont ensuite produits par du JavaScript qui réécrit le contenu, sans jamais redemander une page complète au serveur.

L'avantage est la fluidité : pas d'écran blanc, pas de rechargement. L'inconvénient est que le premier chargement est plus lourd, puisqu'il embarque tout le code de l'application.

*Dans le projet :* c'est le mode de fonctionnement d'Angular. Le fichier `index.html` est la seule page réellement servie.

### Standalone (composant autonome) *[étape 1]*

Se dit d'un composant Angular qui déclare lui-même tout ce dont il a besoin, dans son propre tableau `imports`.

Cette approche est le comportement par défaut depuis les versions récentes d'Angular. Elle en remplace une plus ancienne, fondée sur des « modules » (`NgModule`) qui déclaraient les dépendances pour un groupe de composants. Beaucoup de tutoriels en ligne montrent encore l'ancienne façon de faire — c'est une source fréquente de confusion.

*Dans le projet :* `Header` importe `RouterLink` directement dans son décorateur, parce que son gabarit en a besoin.

### Template (gabarit) *[étape 1]*

Fichier HTML d'un composant : il décrit ce que le composant affiche. Ce n'est pas du HTML ordinaire — Angular y reconnaît une syntaxe supplémentaire (`routerLink`, `[propriete]`, et plus tard les boucles et conditions).

*Dans le projet :* `header.html` est le gabarit du composant `Header`.

### Terminal *[étape 0]*

Fenêtre dans laquelle on tape des commandes texte pour piloter l'ordinateur, par opposition à l'interface graphique où l'on clique.

*Dans le projet :* toutes les commandes `git`, `npm` et `ng` s'y exécutent. VS Code en intègre un, accessible par le menu *Terminal → Nouveau terminal*.

### TypeScript *[étape 1]*

Langage de programmation qui **ajoute les types au JavaScript**. Un type indique la nature d'une valeur : texte, nombre, liste d'équipes…

Son intérêt : les erreurs de nature (passer un texte là où un nombre est attendu) sont signalées **pendant l'écriture du code**, dans l'éditeur, au lieu de provoquer un bug au moment de l'exécution. L'éditeur peut aussi proposer une autocomplétion bien plus précise.

Le navigateur ne comprend pas TypeScript : le build le convertit en JavaScript avant exécution.

*Dans le projet :* tout le code Angular et, plus tard, tout le backend sont écrits en TypeScript — c'est ce qui permet d'utiliser un seul langage sur toute la stack.

### Variable d'environnement *[étape 0]*

Valeur nommée, fournie à un programme **depuis l'extérieur** de son code, au moment où il démarre.

Son intérêt est double : le même code peut fonctionner sur plusieurs machines avec des réglages différents (adresse de base de données locale ou de production), et les secrets restent séparés du code, donc absents de GitHub.

*Dans le projet :* `DATABASE_URL` et `RIOT_API_KEY` seront des variables d'environnement, définies dans `.env`.

### VS Code (Visual Studio Code) *[étape 0]*

Éditeur de code gratuit développé par Microsoft. Au-delà de l'écriture de texte, il apporte la coloration syntaxique, la détection d'erreurs à la frappe, l'intégration de Git et un terminal intégré.

*Dans le projet :* éditeur principal, complété par des extensions (Angular Language Service, ESLint, Prettier, GitLens, DotENV, Thunder Client).
