import { Prisma } from '../generated/prisma/client';

/**
 * Les codes d'erreur Prisma que les depots savent interpreter.
 *
 * Quand PostgreSQL refuse une operation, Prisma leve une erreur portant un
 * code stable, de la forme « P2xxx ». Les trois ci-dessous ont ete observes
 * sur la vraie base du projet (voir le document d'apprentissage, etape 7).
 *
 * Liste complete : https://pris.ly/d/prisma-error-codes
 */
export const CODE_PRISMA = {
  /** Une valeur qui doit etre unique existe deja (ici : l'identifiant). */
  valeurDejaPrise: 'P2002',

  /**
   * Une cle etrangere n'est pas respectee. Deux situations produisent ce code :
   *   - creer un match dont la competition n'existe pas ;
   *   - supprimer une competition dont des matchs dependent encore.
   */
  cleEtrangere: 'P2003',

  /** La ligne a modifier ou a supprimer n'existe pas. */
  introuvable: 'P2025',
} as const;

/**
 * L'erreur recue est-elle une erreur Prisma portant ce code ?
 *
 * « instanceof » verifie de quelle CLASSE un objet est issu. Une erreur peut
 * venir de n'importe ou -- reseau coupe, bug dans notre code -- et seules les
 * erreurs connues de Prisma portent un code a interpreter.
 */
export function aLeCodePrisma(erreur: unknown, code: string): boolean {
  return erreur instanceof Prisma.PrismaClientKnownRequestError && erreur.code === code;
}
