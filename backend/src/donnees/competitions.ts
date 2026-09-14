import { Competition } from '../modeles/competition';

/**
 * Donnees simulees, en attendant la vraie base de donnees de l'etape 6.
 *
 * Ce fichier est le seul endroit ou elles existent. A l'etape 6, il sera
 * remplace par des requetes PostgreSQL -- et les controleurs qui l'utilisent
 * n'auront pas a changer.
 */
export const competitions: Competition[] = [
  {
    id: 'lol',
    nom: 'League of Legends',
    organisateur: 'Riot Games',
    univers: 'esport',
    description:
      "Jeu d'arène de bataille en ligne à cinq contre cinq. Les données proviendront de l'API officielle de Riot Games.",
  },
  {
    id: 'valorant',
    nom: 'Valorant',
    organisateur: 'Riot Games',
    univers: 'esport',
    description:
      "Jeu de tir tactique à cinq contre cinq. Les données proviendront également de l'API officielle de Riot Games.",
  },
  {
    id: 'ligue1',
    nom: 'Ligue 1',
    organisateur: 'Championnat de France',
    univers: 'football',
    description:
      "Première division du football français. Les données proviendront de l'API football-data.org.",
  },
  {
    id: 'ldc',
    nom: 'Ligue des Champions',
    organisateur: 'Compétition européenne',
    univers: 'football',
    description:
      'Compétition annuelle entre les meilleurs clubs européens. Les données proviendront également de football-data.org.',
  },
];
