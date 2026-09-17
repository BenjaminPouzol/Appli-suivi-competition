import jwt from 'jsonwebtoken';
import { DUREE_JWT, SECRET_JWT } from '../config';
import { Role, UtilisateurConnecte } from '../modeles/utilisateur';

/**
 * Etape 8 : fabriquer et lire les jetons de connexion (JWT).
 *
 * HTTP ne se souvient de rien d'une requete a l'autre (etape 4). Apres une
 * connexion reussie, le serveur remet donc au client un JETON, que celui-ci
 * joint a chaque requete suivante pour prouver qui il est.
 *
 * Un JWT est fait de trois parties separees par des points :
 *
 *   eyJhbGciOiJIUzI1NiJ9 . eyJzdWIiOiI0Zj...In0 . Xk3Pq8...
 *   en-tete                contenu               signature
 *
 * Les deux premieres sont du JSON encode en base64url : LISIBLES PAR TOUS,
 * sans aucun secret. La troisieme est une signature calculee avec
 * SECRET_JWT. Modifier une seule lettre du contenu -- par exemple remplacer
 * « utilisateur » par « administrateur » -- rend la signature fausse, et le
 * jeton est refuse.
 *
 * Un JWT est donc SIGNE, pas CHIFFRE : on ne peut pas le falsifier, mais on
 * peut le lire. Rien de secret ne doit y etre range.
 */

/**
 * HS256 : signature par HMAC-SHA256, avec un secret partage.
 *
 * Suffisant quand un seul serveur fabrique ET verifie les jetons, ce qui est
 * notre cas. Quand plusieurs services doivent verifier sans pouvoir en
 * fabriquer, on passe a une paire de cles (RS256, ES256).
 */
const ALGORITHME = 'HS256';

const ROLES: Role[] = ['utilisateur', 'administrateur'];

/** Fabrique un jeton pour une personne qui vient de prouver son identite. */
export function creerJeton(utilisateur: UtilisateurConnecte): string {
  return jwt.sign(
    // Le contenu (« payload ») : le strict necessaire pour les middlewares.
    { pseudo: utilisateur.pseudo, role: utilisateur.role },
    SECRET_JWT,
    {
      algorithm: ALGORITHME,
      // « sub » (subject) : la norme JWT prevoit ce champ pour designer a
      // qui appartient le jeton. On y range l'identifiant.
      subject: utilisateur.id,
      // « exp » : au-dela, le jeton est refuse. Un jeton vole ne sert donc
      // que pendant un temps limite.
      expiresIn: DUREE_JWT,
    },
  );
}

/**
 * Verifie un jeton et en extrait la personne connectee.
 *
 * Renvoie null si le jeton est expire, mal forme, ou si sa signature ne
 * correspond pas -- le detail n'a pas a etre donne au client.
 */
export function lireJeton(jeton: string): UtilisateurConnecte | null {
  try {
    const contenu = jwt.verify(jeton, SECRET_JWT, {
      // On impose l'algorithme attendu. Sans cette option, certaines
      // bibliotheques ont accepte par le passe des jetons annoncant
      // « alg: none » -- sans signature du tout. Ne jamais laisser le jeton
      // choisir comment il doit etre verifie.
      algorithms: [ALGORITHME],
    });

    // La signature est bonne : le contenu vient bien de nous. On verifie
    // tout de meme sa forme avant de s'en servir, par principe.
    if (
      typeof contenu === 'string' ||
      typeof contenu.sub !== 'string' ||
      typeof contenu['pseudo'] !== 'string' ||
      !ROLES.includes(contenu['role'])
    ) {
      return null;
    }

    return { id: contenu.sub, pseudo: contenu['pseudo'], role: contenu['role'] };
  } catch {
    // jwt.verify leve une erreur pour tout jeton invalide ou expire.
    return null;
  }
}
