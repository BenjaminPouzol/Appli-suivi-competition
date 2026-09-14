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

> **Sécurité :** aucun secret (mot de passe, clé d'API) ne doit figurer dans le code ou être commité. Tout passe par un fichier `.env` local, exclu du dépôt par le `.gitignore`.
