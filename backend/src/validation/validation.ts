/**
 * Outils communs a toutes les validations.
 *
 * VALIDER, c'est verifier qu'une donnee venue de l'exterieur a bien la forme
 * attendue AVANT de s'en servir. Le corps d'une requete POST ou PUT est la
 * donnee la moins fiable qui soit : n'importe qui peut envoyer n'importe quoi
 * a l'API, avec Thunder Client, curl ou un script, sans jamais passer par le
 * formulaire du frontend.
 *
 * La regle posee a l'etape 4 pour les parametres d'URL s'applique donc ici,
 * avec encore plus de force : on ne fait confiance a rien.
 */

/** Une erreur rattachee a un champ precis, pour pouvoir l'afficher a cote. */
export interface ErreurChamp {
  champ: string;
  message: string;
}

/**
 * Le resultat d'une validation : SOIT des donnees propres, SOIT des erreurs.
 *
 * Le « <T> » est un parametre de type -- une case vide, remplie au moment de
 * l'utilisation : ResultatValidation<Competition>, ResultatValidation<DonneesMatch>.
 * Le meme principe que dans Promise<Competition[]> ou Observable<Match[]>.
 *
 * La barre verticale fait de ce type une UNION DISCRIMINEE : la propriete
 * « valide » indique laquelle des deux formes on a entre les mains. Apres un
 * « if (resultat.valide) », TypeScript sait que « donnees » existe ; dans le
 * « else », il sait que c'est « erreurs ». Impossible d'utiliser des donnees
 * sans avoir d'abord verifie qu'elles sont valides.
 */
export type ResultatValidation<T> =
  | { valide: true; donnees: T }
  | { valide: false; erreurs: ErreurChamp[] };

/**
 * Le corps est-il un objet JSON (et pas un tableau, un nombre, ou rien) ?
 *
 * Sans en-tete « Content-Type: application/json », express.json() ne lit pas
 * le corps et requete.body vaut undefined. Il faut s'y attendre.
 */
export function estObjet(valeur: unknown): valeur is Record<string, unknown> {
  return typeof valeur === 'object' && valeur !== null && !Array.isArray(valeur);
}

/** Erreur a renvoyer quand le corps n'est meme pas un objet. */
export const CORPS_ABSENT: ErreurChamp = {
  champ: 'corps',
  message: 'Le corps de la requête doit être un objet JSON.',
};

/**
 * Lit un texte obligatoire, en retirant les espaces aux extremites.
 *
 * La fonction ne s'arrete pas a la premiere erreur : elle l'AJOUTE a la liste
 * et renvoie une valeur de remplacement. Ainsi, un formulaire qui contient
 * trois fautes recoit les trois messages d'un coup, au lieu de les decouvrir
 * une par une a chaque nouvel essai.
 */
export function lireTexte(
  corps: Record<string, unknown>,
  champ: string,
  longueurMax: number,
  erreurs: ErreurChamp[],
): string {
  const valeur = corps[champ];

  // « typeof » d'abord : une valeur 42 ou null n'a pas de methode trim(),
  // et l'appeler ferait planter la requete.
  if (typeof valeur !== 'string' || valeur.trim() === '') {
    erreurs.push({ champ, message: 'Ce champ est obligatoire.' });
    return '';
  }

  const nettoyee = valeur.trim();

  // Une limite de longueur n'est pas une coquetterie : sans elle, un client
  // pourrait envoyer un nom de plusieurs megaoctets et remplir la base.
  if (nettoyee.length > longueurMax) {
    erreurs.push({ champ, message: `${longueurMax} caractères maximum.` });
  }

  return nettoyee;
}
