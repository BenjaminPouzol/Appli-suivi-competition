import { prisma } from '../prisma';
import { Equipe } from '../modeles/equipe';

/**
 * Etape 7 : les equipes, en lecture seule.
 *
 * Le formulaire de match a besoin de la liste des equipes pour proposer un
 * choix, plutot que de laisser saisir un identifiant a la main. La creation
 * et la modification d'equipes suivraient exactement le meme schema que
 * celles des competitions : c'est l'exercice propose en fin d'etape.
 */
export async function listerEquipes(): Promise<Equipe[]> {
  return prisma.equipe.findMany({ orderBy: { nom: 'asc' } });
}
