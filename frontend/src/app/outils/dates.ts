/**
 * Etape 7 : passer d'une Date a un champ de formulaire, et inversement.
 *
 * Le champ <input type="datetime-local"> manipule du texte de la forme
 * « 2026-09-15T18:00 » -- SANS fuseau horaire, et en heure LOCALE : l'heure
 * que la personne lit sur sa montre.
 *
 * Le piege classique est d'utiliser toISOString() pour remplir le champ :
 * cette methode renvoie de l'UTC. A Paris en septembre (UTC+2), un match a
 * 18h s'afficherait « 16:00 » dans le formulaire -- puis serait enregistre a
 * 16h si l'on validait sans rien toucher. Le bug de deux heures de l'etape 5,
 * sous une nouvelle forme.
 */

/** Ajoute un zero devant les nombres a un chiffre : 7 -> « 07 ». */
function deuxChiffres(nombre: number): string {
  return String(nombre).padStart(2, '0');
}

/**
 * Date -> texte du champ, en heure locale.
 *
 * On assemble le texte a la main avec les methodes « locales » de Date
 * (getHours, et non getUTCHours). Attention a getMonth() : il compte les mois
 * a partir de ZERO (janvier = 0), d'ou le « + 1 ».
 */
export function versChampDateHeure(date: Date): string {
  const jour = `${date.getFullYear()}-${deuxChiffres(date.getMonth() + 1)}-${deuxChiffres(date.getDate())}`;
  const heure = `${deuxChiffres(date.getHours())}:${deuxChiffres(date.getMinutes())}`;
  return `${jour}T${heure}`;
}

/**
 * Texte du champ -> Date.
 *
 * La norme JavaScript prevoit qu'une date AVEC heure mais SANS fuseau est lue
 * en heure locale. new Date('2026-09-15T18:00') designe donc bien 18h pour la
 * personne qui a rempli le formulaire. L'objet Date obtenu, lui, represente un
 * instant precis : il sera envoye en UTC par toISOString().
 */
export function depuisChampDateHeure(texte: string): Date {
  return new Date(texte);
}
