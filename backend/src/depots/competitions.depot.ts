import { prisma } from '../prisma';
import { Competition, Univers } from '../modeles/competition';

/**
 * Un DEPOT (« repository ») est la seule porte d'entree vers la base pour un
 * type de donnee. Il remplace le dossier « donnees/ » de l'etape 4.
 *
 * Les controleurs ne connaissent donc jamais Prisma : ils appellent ces
 * fonctions. Si la base changeait un jour, seul ce dossier serait a reecrire.
 */

/** Toutes les competitions, ou celles d'un univers donne. */
export async function listerCompetitions(univers?: Univers): Promise<Competition[]> {
  return prisma.competition.findMany({
    // Si « univers » est absent, on ne filtre pas. Prisma ignore les
    // proprietes valant undefined, ce qui evite d'ecrire deux requetes.
    where: { univers },
    orderBy: { nom: 'asc' },
  });
}

/** Une competition precise, ou null si elle n'existe pas. */
export async function trouverCompetition(id: string): Promise<Competition | null> {
  return prisma.competition.findUnique({ where: { id } });
}
