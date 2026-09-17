import { NextFunction, Request, RequestHandler, Response } from 'express';
import { lireJeton } from '../securite/jetons';
import { Role } from '../modeles/utilisateur';

/**
 * Etape 8 : les deux gardiens de l'API.
 *
 * Ils se placent DEVANT les controleurs a proteger, dans les routes :
 *
 *   routeur.post('/', authentifier, exigerRole('administrateur'), creerMatch);
 *
 * Express les appelle dans l'ordre. Chacun peut arreter la requete en
 * repondant lui-meme, ou la laisser passer au suivant en appelant suivant().
 */

/**
 * Exige un jeton valide, et range la personne connectee dans la requete.
 *
 * Le jeton voyage dans l'en-tete HTTP « Authorization », precede du mot
 * « Bearer » (« porteur ») : quiconque PORTE ce jeton est considere comme
 * son proprietaire. D'ou l'importance de ne jamais le laisser fuir.
 */
export function authentifier(requete: Request, reponse: Response, suivant: NextFunction): void {
  const entete = requete.headers.authorization;

  if (entete === undefined || !entete.startsWith('Bearer ')) {
    refuserSansIdentite(reponse, 'Authentification requise');
    return;
  }

  // « Bearer eyJhbGci... » : on retire les 7 caracteres de « Bearer ».
  const utilisateur = lireJeton(entete.slice('Bearer '.length));

  if (utilisateur === null) {
    refuserSansIdentite(reponse, 'Session invalide ou expirée');
    return;
  }

  // Les middlewares et controleurs suivants sauront qui fait la requete.
  requete.utilisateur = utilisateur;
  suivant();
}

/**
 * Exige un role precis. S'utilise TOUJOURS apres authentifier().
 *
 * exigerRole n'est pas un middleware : c'est une FONCTION QUI FABRIQUE un
 * middleware. exigerRole('administrateur') renvoie une nouvelle fonction,
 * qui se souvient du role demande. On peut ainsi ecrire une seule fois la
 * logique, et l'utiliser pour n'importe quel role.
 */
export function exigerRole(role: Role): RequestHandler {
  return (requete, reponse, suivant) => {
    if (requete.utilisateur?.role !== role) {
      // 403 = « je sais qui tu es, et tu n'as pas le droit ».
      // A ne pas confondre avec 401 = « je ne sais pas qui tu es ».
      reponse.status(403).json({ erreur: 'Droits insuffisants' });
      return;
    }
    suivant();
  };
}

/**
 * Les deux gardiens, dans l'ordre, pour toutes les routes d'ecriture.
 *
 * Express accepte un TABLEAU de middlewares a la place d'un seul : ecrire
 * cette combinaison une fois evite de la recopier sur six routes -- et
 * d'oublier exigerRole() sur l'une d'elles.
 */
export const reserveAuxAdministrateurs: RequestHandler[] = [
  authentifier,
  exigerRole('administrateur'),
];

/**
 * Repond 401. La norme HTTP demande d'y joindre l'en-tete WWW-Authenticate,
 * qui indique au client COMMENT s'authentifier -- ici, avec un jeton Bearer.
 */
function refuserSansIdentite(reponse: Response, message: string): void {
  reponse.status(401).set('WWW-Authenticate', 'Bearer').json({ erreur: message });
}
