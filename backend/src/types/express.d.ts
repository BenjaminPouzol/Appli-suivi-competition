import { UtilisateurConnecte } from '../modeles/utilisateur';

/**
 * Etape 8 : ajoute une propriete « utilisateur » a l'objet Request d'Express.
 *
 * Le middleware authentifier() y range la personne connectee, pour que les
 * controleurs qui suivent sachent qui fait la requete. Mais le type Request
 * vient de la bibliotheque Express, qui ignore tout de nos utilisateurs :
 * sans ce fichier, TypeScript refuserait « requete.utilisateur ».
 *
 * Ce mecanisme s'appelle l'AUGMENTATION DE MODULE. On ne modifie pas le code
 * d'Express : on complete la description de son type. « declare global » et
 * « namespace Express » designent l'endroit exact ou Express declare Request.
 *
 * Un fichier .d.ts ne contient que des types : il ne produit aucun code.
 */
declare global {
  namespace Express {
    interface Request {
      /** Present uniquement apres le middleware authentifier(). */
      utilisateur?: UtilisateurConnecte;
    }
  }
}
