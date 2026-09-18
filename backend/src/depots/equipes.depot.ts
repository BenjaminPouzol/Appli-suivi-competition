import { prisma } from '../prisma';
import { Equipe } from '../modeles/equipe';
import { Joueur } from '../modeles/joueur';

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

/**
 * Etape 10 : les joueurs actuels d'une equipe, ou null si elle n'existe pas.
 *
 * La requete part de l'EQUIPE et rapporte ses joueurs avec « include » : une
 * equipe inconnue donne null, une equipe sans joueur une liste vide. Partir
 * des joueurs (« findMany where equipeId ») ne ferait pas la difference.
 */
export async function listerJoueurs(equipeId: string): Promise<Joueur[] | null> {
  const equipe = await prisma.equipe.findUnique({
    where: { id: equipeId },
    include: { joueurs: { orderBy: [{ discipline: 'asc' }, { nom: 'asc' }] } },
  });
  return equipe === null ? null : equipe.joueurs;
}
