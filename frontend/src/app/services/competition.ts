import { Service } from '@angular/core';
import { Competition, Univers } from '../modeles/competition';

/**
 * Fournit la liste des competitions suivies.
 *
 * Les donnees sont pour l'instant ecrites en dur ici : on parle de donnees
 * « mockees », c'est-a-dire simulees. A l'etape 5, seul l'interieur de ce
 * fichier changera pour aller chercher les vraies donnees sur le backend.
 * Les composants qui l'utilisent, eux, n'auront pas a bouger.
 */
@Service()
export class CompetitionService {
  private readonly competitions: Competition[] = [
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

  /** Toutes les competitions, tous univers confondus. */
  listerToutes(): Competition[] {
    return this.competitions;
  }

  /** Les competitions d'un univers donne (eSport ou football). */
  listerParUnivers(univers: Univers): Competition[] {
    return this.competitions.filter((competition) => competition.univers === univers);
  }

  /**
   * Retrouve une competition par son identifiant.
   * Renvoie undefined si aucune ne correspond -- d'ou le « | undefined »,
   * qui oblige l'appelant a prevoir ce cas.
   */
  trouverParId(id: string): Competition | undefined {
    return this.competitions.find((competition) => competition.id === id);
  }
}
