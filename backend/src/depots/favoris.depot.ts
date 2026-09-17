import { prisma } from '../prisma';
import { Equipe } from '../modeles/equipe';
import { CODE_PRISMA, aLeCodePrisma } from './erreurs-prisma';

/**
 * Etape 9 : les equipes suivies par un utilisateur.
 *
 * Trois operations seulement : lister, suivre, ne plus suivre. Aucune
 * « modification » : un favori existe ou n'existe pas.
 */

/**
 * Les equipes suivies par un utilisateur, par ordre alphabetique.
 *
 * La requete part des EQUIPES et filtre sur la relation : « les equipes dont
 * au moins un favori appartient a cet utilisateur ». C'est le role de
 * « some » -- il existe au moins une ligne liee qui verifie la condition.
 *
 * En SQL, Prisma produit une jointure avec la table favoris : on obtient les
 * equipes directement, sans passer par une liste d'identifiants intermediaire.
 */
export async function listerEquipesSuivies(utilisateurId: string): Promise<Equipe[]> {
  return prisma.equipe.findMany({
    where: { favoris: { some: { utilisateurId } } },
    orderBy: { nom: 'asc' },
  });
}

/**
 * Suit une equipe. Sans effet si elle l'est deja.
 *
 * upsert = « cree si absent, sinon mets a jour ». Ici, la mise a jour est
 * vide : si le favori existe deja, il n'y a rien a changer. Suivre deux fois
 * la meme equipe laisse donc les donnees dans le meme etat qu'une seule
 * fois -- l'operation est IDEMPOTENTE, comme l'exige la methode PUT.
 */
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

/**
 * Ne suit plus une equipe. Sans effet si elle ne l'etait pas.
 *
 * deleteMany plutot que delete : delete leve une erreur (P2025) quand la
 * ligne n'existe pas, deleteMany renvoie simplement « 0 ligne supprimee ».
 * Ne plus suivre une equipe qu'on ne suivait pas n'est pas un echec : le
 * resultat voulu est atteint.
 */
export async function retirerFavori(utilisateurId: string, equipeId: string): Promise<void> {
  await prisma.favori.deleteMany({ where: { utilisateurId, equipeId } });
}
