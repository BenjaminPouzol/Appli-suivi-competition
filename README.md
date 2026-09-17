# Appli-suivi-competition

Plateforme web de suivi de l'actualité et des résultats de plusieurs univers eSport et sportifs :

- League of Legends *(Riot Games)*
- Valorant *(Riot Games)*
- Ligue 1 *(football)*
- Ligue des Champions *(football)*

Ce dépôt est autant un **projet d'apprentissage** qu'un livrable : il couvre volontairement toute la chaîne du développement web — frontend, backend, base de données, authentification, consommation d'APIs externes, sécurité et déploiement — en quinze étapes progressives.

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | Angular |
| Backend | Node.js + Express + TypeScript |
| Base de données | PostgreSQL |
| ORM | Prisma |
| Authentification | JWT |
| APIs externes | Riot Games API, football-data.org |

## Documents du dépôt

| Fichier | Contenu |
|---|---|
| [CONTEXTE.md](CONTEXTE.md) | Cadre du projet : règles de travail, stack, découpage des étapes |
| [DOCUMENT-APPRENTISSAGE.md](DOCUMENT-APPRENTISSAGE.md) | Le cours — une section détaillée par étape |
| [GLOSSAIRE.md](GLOSSAIRE.md) | Tous les termes techniques rencontrés, définis simplement |
| [.env.example](.env.example) | Modèle des variables d'environnement à renseigner |
| [docs/images/](docs/images/) | Captures d'écran illustrant le document d'apprentissage |
| [frontend/scripts/captures.mjs](frontend/scripts/captures.mjs) | Régénère ces captures automatiquement (`npm run captures -- etape-XX`) |

## Organisation des branches

`main` est réservée au projet terminé. Chaque étape du parcours vit sur sa propre branche, nommée `etape-XX-nom-court`, et contient un état du projet complet et fonctionnel.

| # | Étape | Branche |
|---|---|---|
| 0 | Mise en place de l'environnement | `etape-00-setup` |
| 1 | Découverte d'Angular | `etape-01-angular-decouverte` |
| 2 | Charte graphique & thèmes clair/sombre | `etape-02-theme` |
| 3 | Données mockées | `etape-03-donnees-mockees` |
| 4 | Backend Express — bases | `etape-04-backend-bases` |
| 5 | Connexion frontend/backend | `etape-05-connexion-front-back` |
| 6 | Base de données | `etape-06-base-de-donnees` |
| 7 | CRUD complet | `etape-07-crud` |
| 8 | Authentification | `etape-08-authentification` |
| 9 | Favoris utilisateur | `etape-09-favoris` |
| 10 | API externe — Riot Games | `etape-10-api-riot` |
| 11 | API externe — Football & résilience | `etape-11-api-football` |
| 12 | Dashboard unifié | `etape-12-dashboard` |
| 13 | Refactoring | `etape-13-refactoring` |
| 14 | Déploiement | `etape-14-deploiement` |
| 15 | Finalisation | `main` |

## Démarrage

Les outils à installer et la procédure de vérification sont détaillés dans l'[étape 0 du document d'apprentissage](DOCUMENT-APPRENTISSAGE.md#étape-0--mise-en-place-de-lenvironnement).

Le projet est composé de deux programmes indépendants, chacun avec ses propres dépendances.

**Frontend** — l'interface, dans le navigateur :

```
cd frontend
npm install     # uniquement la première fois
npm start       # application servie sur http://localhost:4200
```

Autres commandes depuis `frontend/` : `npm test` (tests automatiques), `npm run build` (version optimisée), `npm run captures -- etape-XX [pages…]` (captures d'écran du cours).

**Backend** — l'API, sur le serveur :

```
cd backend
npm install              # uniquement la première fois
cp ../.env.example .env  # puis renseigner DATABASE_URL et JWT_SECRET
npm run bdd:migrer       # crée la base et ses tables
npm run bdd:peupler      # insère les données de départ
npm run dev              # API servie sur http://localhost:3000
```

Autres commandes depuis `backend/` :

| Commande | Rôle |
|---|---|
| `npm run verifier` | Vérification des types |
| `npm run build` | Compilation vers `dist/` |
| `npm run bdd:generer` | Régénère le client Prisma après modification du schéma |
| `npm run bdd:explorer` | Ouvre Prisma Studio pour voir les données |
| `npm run utilisateur:promouvoir -- email` | Donne le rôle administrateur à un compte existant |

> PostgreSQL doit être installé et son service démarré. La base `suivi_competition` est créée automatiquement par la première migration.

Vérifier que l'API répond : [http://localhost:3000/api/sante](http://localhost:3000/api/sante)

## Endpoints de l'API

| Méthode | Adresse | Accès | Rôle |
|---|---|---|---|
| `GET` | `/api/sante` | public | L'API répond-elle ? |
| `GET` | `/api/competitions` | public | Liste des compétitions (filtre facultatif `?univers=esport`) |
| `POST` | `/api/competitions` | administrateur | Créer une compétition |
| `GET` | `/api/competitions/:id` | public | Une compétition |
| `PUT` | `/api/competitions/:id` | administrateur | Modifier une compétition |
| `DELETE` | `/api/competitions/:id` | administrateur | Supprimer une compétition (refusé si elle contient des matchs) |
| `GET` | `/api/matchs` | public | Liste des matchs (filtre facultatif `?statut=en-direct`) |
| `POST` | `/api/matchs` | administrateur | Créer un match |
| `GET` | `/api/matchs/:id` | public | Un match |
| `PUT` | `/api/matchs/:id` | administrateur | Modifier un match |
| `DELETE` | `/api/matchs/:id` | administrateur | Supprimer un match |
| `GET` | `/api/equipes` | public | Liste des équipes |
| `POST` | `/api/auth/inscription` | public, limité | Créer un compte (renvoie un jeton) |
| `POST` | `/api/auth/connexion` | public, limité | Se connecter (renvoie un jeton) |
| `GET` | `/api/auth/moi` | connecté | Le compte de la personne connectée |

Les routes « connecté » et « administrateur » attendent l'en-tête `Authorization: Bearer <jeton>`. « Limité » : 10 échecs par quart d'heure par adresse IP.

**Devenir administrateur** : créer un compte depuis l'application, puis, depuis `backend/` :

```
npm run utilisateur:promouvoir -- adresse@exemple.fr
```

> **Sécurité :** aucun secret (mot de passe, clé d'API) ne doit figurer dans le code ou être commité. Tout passe par un fichier `.env` local, exclu du dépôt par le `.gitignore`.
