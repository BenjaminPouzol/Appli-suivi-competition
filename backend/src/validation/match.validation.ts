import { DonneesMatch, StatutMatch } from '../modeles/match';
import { CORPS_ABSENT, ErreurChamp, ResultatValidation, estObjet, lireTexte } from './validation';

/**
 * Les trois seules valeurs acceptees pour un statut.
 *
 * Etape 7 : ces deux elements vivaient dans matchs.controleur.ts. Ils servent
 * desormais a deux endroits -- le filtre ?statut= et la validation d'un match
 * envoye par le client --, d'ou leur demenagement ici.
 */
export const STATUTS_VALIDES: StatutMatch[] = ['a-venir', 'en-direct', 'termine'];

/**
 * Verifie qu'une valeur venue du client est bien un statut connu.
 *
 * Le « valeur is StatutMatch » du type de retour est une particularite de
 * TypeScript : il ne dit pas seulement que la fonction renvoie un booleen,
 * il dit qu'APRES un appel qui renvoie true, la valeur peut etre traitee
 * comme un StatutMatch.
 */
export function estStatutValide(valeur: unknown): valeur is StatutMatch {
  return typeof valeur === 'string' && STATUTS_VALIDES.includes(valeur as StatutMatch);
}

/**
 * Date au format ISO 8601 AVEC fuseau horaire : « Z » (UTC) ou « +02:00 ».
 *
 * Le fuseau est exige, et c'est la lecon de l'etape 5 : « 2026-09-15T18:00 »
 * sans fuseau serait interprete dans le fuseau de la MACHINE qui le lit. Le
 * meme texte designerait 18h a Paris sur un serveur francais, et 18h UTC
 * (20h a Paris) sur un serveur heberge ailleurs. On refuse l'ambiguite plutot
 * que de deviner.
 */
const FORMAT_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

/** Score maximal accepte : largement au-dessus de tout score reel. */
const SCORE_MAX = 999;

/**
 * Lit un score : absent, ou entier positif.
 *
 * « Absent » accepte deux ecritures : la propriete manquante (undefined) et
 * la valeur null explicite. Les deux sont ramenees a null, la seule forme que
 * connaissent la base et le reste du code.
 */
function lireScore(corps: Record<string, unknown>, champ: string, erreurs: ErreurChamp[]): number | null {
  const valeur = corps[champ];

  if (valeur === undefined || valeur === null) {
    return null;
  }

  // Number.isInteger refuse a la fois le texte « 2 », la valeur 2.5 et NaN.
  if (!Number.isInteger(valeur) || (valeur as number) < 0 || (valeur as number) > SCORE_MAX) {
    erreurs.push({ champ, message: `Entier entre 0 et ${SCORE_MAX} attendu.` });
    return null;
  }

  return valeur as number;
}

/** Valide ce qu'un client envoie pour creer (POST) ou modifier (PUT) un match. */
export function validerDonneesMatch(corps: unknown): ResultatValidation<DonneesMatch> {
  if (!estObjet(corps)) {
    return { valide: false, erreurs: [CORPS_ABSENT] };
  }

  const erreurs: ErreurChamp[] = [];

  // --- 1. Chaque champ, pris isolement -------------------------------------

  const competitionId = lireTexte(corps, 'competitionId', 50, erreurs);
  const domicileId = lireTexte(corps, 'domicileId', 50, erreurs);
  const exterieurId = lireTexte(corps, 'exterieurId', 50, erreurs);

  const date = corps['date'];
  const dateValide =
    typeof date === 'string' && FORMAT_DATE.test(date) && !Number.isNaN(new Date(date).getTime());
  if (!dateValide) {
    erreurs.push({
      champ: 'date',
      message: 'Date ISO 8601 avec fuseau attendue (exemple : 2026-09-15T18:00:00.000Z).',
    });
  }

  const statut = corps['statut'];
  if (!estStatutValide(statut)) {
    erreurs.push({ champ: 'statut', message: `Statut attendu : ${STATUTS_VALIDES.join(', ')}.` });
  }

  const scoreDomicile = lireScore(corps, 'scoreDomicile', erreurs);
  const scoreExterieur = lireScore(corps, 'scoreExterieur', erreurs);

  // --- 2. Les regles qui portent sur PLUSIEURS champs a la fois ------------
  //
  // Chaque champ peut etre correct isolement et l'ensemble incoherent. Ces
  // regles-la ne se voient qu'en regardant les champs ensemble.

  if (domicileId !== '' && domicileId === exterieurId) {
    erreurs.push({ champ: 'exterieurId', message: 'Une équipe ne peut pas se rencontrer elle-même.' });
  }

  if (statut === 'a-venir' && (scoreDomicile !== null || scoreExterieur !== null)) {
    erreurs.push({ champ: 'statut', message: "Un match à venir n'a pas encore de score." });
  }

  if ((statut === 'en-direct' || statut === 'termine') && (scoreDomicile === null || scoreExterieur === null)) {
    erreurs.push({ champ: 'statut', message: 'Un match en cours ou terminé doit avoir ses deux scores.' });
  }

  if (erreurs.length > 0 || !estStatutValide(statut)) {
    return { valide: false, erreurs };
  }

  return {
    valide: true,
    donnees: {
      competitionId,
      domicileId,
      exterieurId,
      scoreDomicile,
      scoreExterieur,
      date: date as string,
      statut,
    },
  };
}
