import { Role, UtilisateurConnecte } from '../modeles/utilisateur';

/**
 * Etape 8 : lire le contenu d'un jeton JWT, cote navigateur.
 *
 * Un JWT est SIGNE, pas CHIFFRE : ses deux premieres parties sont du JSON
 * simplement encode, lisible sans aucun secret. Le frontend peut donc y lire
 * le pseudo, le role et la date d'expiration pour adapter l'affichage.
 *
 * Mais il ne peut PAS verifier la signature -- il faudrait le secret, qui ne
 * doit jamais quitter le serveur. Ce que lit le frontend sert donc
 * uniquement au CONFORT (afficher ou masquer un bouton). La SECURITE reste
 * au serveur, qui verifie la signature a chaque requete.
 */

const ROLES: Role[] = ['utilisateur', 'administrateur'];

/**
 * Decode une partie « base64url » d'un jeton en texte.
 *
 * base64url est une variante de base64 adaptee aux adresses web : « - » et
 * « _ » y remplacent « + » et « / ». atob() ne connait que base64 : on
 * retablit donc les caracteres d'origine avant de decoder.
 *
 * atob() produit des OCTETS, pas du texte : un pseudo accentue (« Élodie »)
 * occupe plusieurs octets en UTF-8. TextDecoder les reassemble correctement.
 */
function base64UrlVersTexte(morceau: string): string {
  const base64 = morceau.replace(/-/g, '+').replace(/_/g, '/');
  const octets = Uint8Array.from(atob(base64), (caractere) => caractere.charCodeAt(0));
  return new TextDecoder().decode(octets);
}

/**
 * Extrait la personne connectee d'un jeton, ou null si le jeton est
 * illisible, incomplet ou deja expire.
 *
 * « maintenant » est un parametre, et non un appel a Date.now() cache dans la
 * fonction : les tests peuvent ainsi fixer l'heure et verifier l'expiration.
 */
export function lireContenuJeton(jeton: string, maintenant = new Date()): UtilisateurConnecte | null {
  try {
    const contenu: unknown = JSON.parse(base64UrlVersTexte(jeton.split('.')[1] ?? ''));

    if (
      typeof contenu !== 'object' ||
      contenu === null ||
      !('sub' in contenu) ||
      !('pseudo' in contenu) ||
      !('role' in contenu) ||
      !('exp' in contenu) ||
      typeof contenu.sub !== 'string' ||
      typeof contenu.pseudo !== 'string' ||
      !ROLES.includes(contenu.role as Role) ||
      typeof contenu.exp !== 'number'
    ) {
      return null;
    }

    // « exp » est exprime en SECONDES depuis le 1er janvier 1970 ; les dates
    // JavaScript comptent en MILLISECONDES.
    const expiration = new Date(contenu.exp * 1000);

    if (expiration <= maintenant) {
      return null;
    }

    return { id: contenu.sub, pseudo: contenu.pseudo, role: contenu.role as Role, expiration };
  } catch {
    // Jeton tronque, base64 invalide, JSON illisible : on ne s'en sert pas.
    return null;
  }
}
