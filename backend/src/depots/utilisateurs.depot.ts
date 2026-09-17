import { prisma } from '../prisma';
import { Utilisateur as LigneUtilisateur } from '../generated/prisma/client';
import { Utilisateur } from '../modeles/utilisateur';
import { CODE_PRISMA, aLeCodePrisma } from './erreurs-prisma';

/**
 * Etape 8 : les utilisateurs en base.
 *
 * Deux types portent le meme nom, d'ou le renommage a l'import :
 *   - LigneUtilisateur : la ligne complete de la table, empreinte comprise ;
 *   - Utilisateur      : ce que l'API a le droit de montrer.
 *
 * La traduction de l'un a l'autre se fait ICI, et nulle part ailleurs.
 */

/**
 * Ligne de la base -> utilisateur expose par l'API : l'empreinte reste ici.
 *
 * Exportee pour le controleur de connexion, qui recoit une ligne complete
 * (il en a besoin pour verifier le mot de passe) et doit la renvoyer sans
 * son empreinte.
 */
export function sansEmpreinte(ligne: LigneUtilisateur): Utilisateur {
  return {
    id: ligne.id,
    email: ligne.email,
    pseudo: ligne.pseudo,
    role: ligne.role,
    creeLe: ligne.creeLe.toISOString(),
  };
}

/** INSERT : cree un compte. Le mot de passe arrive DEJA hache. */
export async function insererUtilisateur(donnees: {
  email: string;
  pseudo: string;
  motDePasseHache: string;
}): Promise<Utilisateur | 'email-pris'> {
  try {
    // Aucun « role » transmis : la base applique @default(utilisateur).
    return sansEmpreinte(await prisma.utilisateur.create({ data: donnees }));
  } catch (erreur) {
    // L'index unique sur email refuse le doublon (voir le schema).
    if (aLeCodePrisma(erreur, CODE_PRISMA.valeurDejaPrise)) {
      return 'email-pris';
    }
    throw erreur;
  }
}

/**
 * Cherche un compte par son email, AVEC l'empreinte du mot de passe.
 *
 * C'est la seule fonction qui laisse sortir l'empreinte du depot, et elle
 * n'a qu'un usage : verifier un mot de passe a la connexion. Le type de
 * retour le rend visible -- LigneUtilisateur et non Utilisateur.
 */
export async function trouverPourConnexion(email: string): Promise<LigneUtilisateur | null> {
  return prisma.utilisateur.findUnique({ where: { email } });
}

/** Un compte par son identifiant, tel que l'API peut le montrer. */
export async function trouverUtilisateur(id: string): Promise<Utilisateur | null> {
  const ligne = await prisma.utilisateur.findUnique({ where: { id } });
  return ligne === null ? null : sansEmpreinte(ligne);
}

