import { hash, verify } from 'argon2';

/**
 * Etape 8 : tout ce qui touche aux mots de passe.
 *
 * Un mot de passe n'est JAMAIS stocke. On stocke son EMPREINTE : le resultat
 * d'une fonction de hachage, calculable dans un sens seulement. A partir du
 * mot de passe, on retrouve toujours la meme empreinte ; a partir de
 * l'empreinte, impossible de remonter au mot de passe.
 *
 * Pour verifier une connexion, on recalcule l'empreinte du mot de passe saisi
 * et on la compare a celle enregistree.
 *
 * Argon2 est concu specialement pour cet usage : il est volontairement LENT
 * (quelques dizaines de millisecondes) et gourmand en MEMOIRE (64 Mo par
 * calcul). Imperceptible pour une personne qui se connecte, ces couts
 * rendent tres cheres les attaques qui essaient des milliards de mots de
 * passe sur une base volee. C'est l'algorithme recommande en premier par
 * l'OWASP, la reference de la securite web.
 */

/**
 * Calcule l'empreinte d'un mot de passe.
 *
 * Le resultat ressemble a :
 *   $argon2id$v=19$m=65536,p=4,t=3$<sel>$<empreinte>
 *
 * Tout ce qu'il faut pour verifier plus tard y est range : la variante
 * (argon2id), les reglages de cout, et le SEL -- une valeur aleatoire tiree
 * a chaque appel. Grace au sel, deux personnes qui choisissent le meme mot
 * de passe obtiennent deux empreintes differentes, et une table
 * d'empreintes precalculees ne sert a rien.
 */
export function hacherMotDePasse(motDePasse: string): Promise<string> {
  return hash(motDePasse);
}

/** Le mot de passe saisi correspond-il a l'empreinte enregistree ? */
export function verifierMotDePasse(empreinte: string, motDePasse: string): Promise<boolean> {
  return verify(empreinte, motDePasse);
}

/**
 * Empreinte d'un mot de passe que personne ne connait, calculee une seule
 * fois au premier besoin.
 */
let empreinteFactice: Promise<string> | undefined;

/**
 * Fait le meme travail qu'une verification, pour rien.
 *
 * Pourquoi ? Quand l'adresse email n'existe pas, le serveur pourrait
 * repondre immediatement -- alors qu'une vraie verification Argon2 prend
 * plusieurs dizaines de millisecondes. En chronometrant les reponses, un
 * attaquant saurait quelles adresses ont un compte, sans jamais connaitre un
 * seul mot de passe. Cette fonction egalise les temps de reponse.
 */
export async function simulerVerification(motDePasse: string): Promise<void> {
  empreinteFactice ??= hash('mot-de-passe-factice-que-personne-ne-connait');
  await verify(await empreinteFactice, motDePasse);
}
