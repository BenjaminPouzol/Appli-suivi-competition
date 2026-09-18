import {
  Cote,
  DonneesBut,
  DonneesCarteValorant,
  DonneesFeuilleFootball,
  DonneesJoueurCarteValorant,
  DonneesJoueurPartieLol,
  DonneesPartieLol,
  ObjectifsLol,
  PosteLol,
  StatistiquesFootball,
  TypeBut,
  TypeDragon,
} from '../modeles/details';
import { CORPS_ABSENT, ErreurChamp, ResultatValidation, estObjet, lireTexte } from './validation';

/**
 * Etape 10 : la validation des statistiques detaillees.
 *
 * La difficulte nouvelle est l'IMBRICATION. Un corps de partie contient des
 * objets (« equipes »), qui contiennent des listes (« joueurs.domicile »), qui
 * contiennent des objets. Une erreur doit dire precisement OU elle se trouve :
 *
 *   { "champ": "joueurs.exterieur[3].niveau", "message": "Entier entre 1 et 18 attendu." }
 *
 * Chaque fonction ci-dessous recoit donc un CHEMIN : l'adresse, dans le
 * corps, de l'objet qu'elle lit. Elle le prolonge pour ses propres erreurs.
 *
 * Le principe de l'etape 7 est inchange : toutes les erreurs sont collectees
 * (pas d'arret a la premiere), et l'objet renvoye est reconstruit champ par
 * champ -- une liste blanche.
 */

export const COTES: readonly Cote[] = ['domicile', 'exterieur'];
const TYPES_BUT: readonly TypeBut[] = ['normal', 'penalty', 'csc'];
const POSTES_LOL: readonly PosteLol[] = ['top', 'jungle', 'mid', 'adc', 'support'];
const TYPES_DRAGON: readonly TypeDragon[] = [
  'infernal',
  'ocean',
  'montagne',
  'nuage',
  'hextech',
  'chemtech',
  'ancestral',
];

/** Cinq joueurs par equipe, en League of Legends comme en Valorant. */
const JOUEURS_PAR_EQUIPE = 5;

/** Les minutes auxquelles une periode de jeu peut se prolonger. */
const FINS_DE_PERIODE = [45, 90, 105, 120];

/*
 * ---------------------------------------------------------------------------
 * Outils de lecture
 * ---------------------------------------------------------------------------
 */

/** « joueurs.domicile[2] » + « kills » -> « joueurs.domicile[2].kills ». */
function sousChamp(chemin: string, cle: string): string {
  return chemin === '' ? cle : `${chemin}.${cle}`;
}

/** Lit un entier compris entre deux bornes (incluses). */
function lireEntier(
  objet: Record<string, unknown>,
  cle: string,
  chemin: string,
  min: number,
  max: number,
  erreurs: ErreurChamp[],
): number {
  const valeur = objet[cle];

  // Number.isInteger refuse a la fois le texte « 2 », la valeur 2.5 et NaN.
  if (!Number.isInteger(valeur) || (valeur as number) < min || (valeur as number) > max) {
    erreurs.push({ champ: sousChamp(chemin, cle), message: `Entier entre ${min} et ${max} attendu.` });
    return min;
  }
  return valeur as number;
}

/**
 * Lit une valeur parmi une liste fermee (un cote, un poste, un type de but).
 *
 * « <T extends string> » : la fonction marche pour n'importe quelle union de
 * textes, et renvoie une valeur de CE type -- lireChoix(..., POSTES_LOL, ...)
 * renvoie un PosteLol, pas un simple string.
 */
function lireChoix<T extends string>(
  objet: Record<string, unknown>,
  cle: string,
  chemin: string,
  valides: readonly T[],
  erreurs: ErreurChamp[],
): T {
  const valeur = objet[cle];
  if (typeof valeur !== 'string' || !valides.includes(valeur as T)) {
    erreurs.push({ champ: sousChamp(chemin, cle), message: `Valeur attendue : ${valides.join(', ')}.` });
    return valides[0];
  }
  return valeur as T;
}

/** Un cote, ou null (absent) : le vainqueur d'une manche encore en cours. */
function lireVainqueur(objet: Record<string, unknown>, erreurs: ErreurChamp[]): Cote | null {
  const valeur = objet['vainqueur'];
  if (valeur === undefined || valeur === null) {
    return null;
  }
  return lireChoix(objet, 'vainqueur', '', COTES, erreurs);
}

/** Lit une liste d'au plus « max » elements. */
function lireListe(
  objet: Record<string, unknown>,
  cle: string,
  chemin: string,
  max: number,
  erreurs: ErreurChamp[],
): unknown[] | null {
  const valeur = objet[cle];
  // Array.isArray : le seul moyen fiable de reconnaitre un tableau, puisque
  // typeof [] vaut « object », comme typeof {}.
  if (!Array.isArray(valeur) || valeur.length > max) {
    erreurs.push({ champ: sousChamp(chemin, cle), message: `Liste de ${max} éléments au plus attendue.` });
    return null;
  }
  return valeur;
}

/**
 * Lit chaque element d'une liste avec la fonction « lire », en lui donnant
 * son chemin : « buts[0] », « buts[1] »...
 *
 * « lire » est une FONCTION passee en parametre : lireElements sait parcourir
 * une liste, mais ne sait pas ce que contient chaque element. C'est
 * l'appelant qui le lui dit.
 */
function lireElements<T>(
  liste: unknown[],
  chemin: string,
  erreurs: ErreurChamp[],
  lire: (element: Record<string, unknown>, cheminElement: string) => T,
): T[] {
  const resultats: T[] = [];
  liste.forEach((element, index) => {
    const cheminElement = `${chemin}[${index}]`;
    if (estObjet(element)) {
      resultats.push(lire(element, cheminElement));
    } else {
      erreurs.push({ champ: cheminElement, message: 'Objet attendu.' });
    }
  });
  return resultats;
}

/** Lit un objet de la forme { domicile: {...}, exterieur: {...} }. */
function lireObjetsParCote(
  valeur: unknown,
  chemin: string,
  erreurs: ErreurChamp[],
): Record<Cote, Record<string, unknown>> | null {
  if (!estObjet(valeur)) {
    erreurs.push({ champ: chemin, message: 'Objet { domicile, exterieur } attendu.' });
    return null;
  }
  const domicile = valeur['domicile'];
  const exterieur = valeur['exterieur'];
  if (!estObjet(domicile) || !estObjet(exterieur)) {
    erreurs.push({ champ: chemin, message: 'Objet { domicile, exterieur } attendu.' });
    return null;
  }
  return { domicile, exterieur };
}

/**
 * Lit les joueurs d'une manche : { domicile: [...], exterieur: [...] }, cinq
 * joueurs au plus de chaque cote, et aucun joueur present deux fois.
 */
function lireJoueursParCote<T extends { joueurId: string }>(
  valeur: unknown,
  erreurs: ErreurChamp[],
  lire: (element: Record<string, unknown>, cheminElement: string) => T,
): Record<Cote, T[]> | null {
  if (!estObjet(valeur)) {
    erreurs.push({ champ: 'joueurs', message: 'Objet { domicile, exterieur } attendu.' });
    return null;
  }

  const listeDomicile = lireListe(valeur, 'domicile', 'joueurs', JOUEURS_PAR_EQUIPE, erreurs);
  const listeExterieur = lireListe(valeur, 'exterieur', 'joueurs', JOUEURS_PAR_EQUIPE, erreurs);
  if (listeDomicile === null || listeExterieur === null) {
    return null;
  }

  const joueurs = {
    domicile: lireElements(listeDomicile, 'joueurs.domicile', erreurs, lire),
    exterieur: lireElements(listeExterieur, 'joueurs.exterieur', erreurs, lire),
  };

  // Un Set ne garde pas les doublons (etape 9) : s'il est plus petit que la
  // liste, c'est qu'un identifiant y figurait deux fois.
  const ids = [...joueurs.domicile, ...joueurs.exterieur].map((joueur) => joueur.joueurId);
  if (new Set(ids).size !== ids.length) {
    erreurs.push({ champ: 'joueurs', message: 'Un même joueur apparaît deux fois.' });
  }

  return joueurs;
}

/*
 * ---------------------------------------------------------------------------
 * Football
 * ---------------------------------------------------------------------------
 */

function lireStatistiquesFootball(
  objet: Record<string, unknown>,
  chemin: string,
  erreurs: ErreurChamp[],
): StatistiquesFootball {
  // Une petite fonction locale, pour ne pas repeter quatre arguments onze
  // fois. Elle « se souvient » d'objet, chemin et erreurs : c'est une
  // fermeture (etape 8).
  const entier = (cle: string, max: number) => lireEntier(objet, cle, chemin, 0, max, erreurs);

  const statistiques: StatistiquesFootball = {
    possession: entier('possession', 100),
    tirs: entier('tirs', 99),
    tirsCadres: entier('tirsCadres', 99),
    corners: entier('corners', 99),
    fautes: entier('fautes', 99),
    horsJeu: entier('horsJeu', 99),
    cartonsJaunes: entier('cartonsJaunes', 20),
    // Au-dela de cinq exclusions, une equipe n'a plus assez de joueurs : le
    // match est arrete.
    cartonsRouges: entier('cartonsRouges', 5),
    passes: entier('passes', 2000),
    passesReussies: entier('passesReussies', 2000),
    arrets: entier('arrets', 99),
  };

  if (statistiques.tirsCadres > statistiques.tirs) {
    erreurs.push({ champ: sousChamp(chemin, 'tirsCadres'), message: 'Pas plus de tirs cadrés que de tirs.' });
  }
  if (statistiques.passesReussies > statistiques.passes) {
    erreurs.push({
      champ: sousChamp(chemin, 'passesReussies'),
      message: 'Pas plus de passes réussies que de passes.',
    });
  }

  return statistiques;
}

function lireBut(objet: Record<string, unknown>, chemin: string, erreurs: ErreurChamp[]): DonneesBut {
  const minute = lireEntier(objet, 'minute', chemin, 1, 120, erreurs);

  let tempsAdditionnel: number | null = null;
  if (objet['tempsAdditionnel'] !== undefined && objet['tempsAdditionnel'] !== null) {
    tempsAdditionnel = lireEntier(objet, 'tempsAdditionnel', chemin, 1, 30, erreurs);
    if (!FINS_DE_PERIODE.includes(minute)) {
      erreurs.push({
        champ: sousChamp(chemin, 'tempsAdditionnel'),
        message: 'Temps additionnel possible seulement à la 45e, 90e, 105e ou 120e minute.',
      });
    }
  }

  return {
    cote: lireChoix(objet, 'cote', chemin, COTES, erreurs),
    buteurId: lireTexte(objet, 'buteurId', 50, erreurs, sousChamp(chemin, 'buteurId')),
    minute,
    tempsAdditionnel,
    type: lireChoix(objet, 'type', chemin, TYPES_BUT, erreurs),
  };
}

/** PUT /api/matchs/:id/feuille-football */
export function validerFeuilleFootball(corps: unknown): ResultatValidation<DonneesFeuilleFootball> {
  if (!estObjet(corps)) {
    return { valide: false, erreurs: [CORPS_ABSENT] };
  }

  const erreurs: ErreurChamp[] = [];

  // Les statistiques sont facultatives : on peut saisir les buts d'abord.
  let statistiques: DonneesFeuilleFootball['statistiques'] = null;
  if (corps['statistiques'] !== undefined && corps['statistiques'] !== null) {
    const parCote = lireObjetsParCote(corps['statistiques'], 'statistiques', erreurs);
    if (parCote !== null) {
      statistiques = {
        domicile: lireStatistiquesFootball(parCote.domicile, 'statistiques.domicile', erreurs),
        exterieur: lireStatistiquesFootball(parCote.exterieur, 'statistiques.exterieur', erreurs),
      };

      // Une regle qui porte sur les DEUX equipes : chacune, prise seule, peut
      // etre correcte, et l'ensemble impossible.
      if (statistiques.domicile.possession + statistiques.exterieur.possession !== 100) {
        erreurs.push({ champ: 'statistiques', message: 'Les deux possessions doivent totaliser 100 %.' });
      }
    }
  }

  // Trente buts : bien au-dela de tout score reel, mais une limite quand meme.
  const liste = lireListe(corps, 'buts', '', 30, erreurs);
  const buts = liste === null ? [] : lireElements(liste, 'buts', erreurs, (but, chemin) => lireBut(but, chemin, erreurs));

  if (erreurs.length > 0) {
    return { valide: false, erreurs };
  }

  return { valide: true, donnees: { statistiques, buts } };
}

/*
 * ---------------------------------------------------------------------------
 * League of Legends
 * ---------------------------------------------------------------------------
 */

function lireObjectifsLol(objet: Record<string, unknown>, chemin: string, erreurs: ErreurChamp[]): ObjectifsLol {
  const entier = (cle: string, max: number) => lireEntier(objet, cle, chemin, 0, max, erreurs);
  return {
    // Onze tours par equipe sur la carte.
    tours: entier('tours', 11),
    // Un inhibiteur reapparait apres quelques minutes : il peut etre detruit
    // plusieurs fois. Les limites suivantes sont donc larges.
    inhibiteurs: entier('inhibiteurs', 20),
    barons: entier('barons', 10),
    herauts: entier('herauts', 5),
    larves: entier('larves', 10),
  };
}

/** Les objets d'un joueur : au plus sept noms (six emplacements et une balise). */
function lireObjets(objet: Record<string, unknown>, chemin: string, erreurs: ErreurChamp[]): string[] {
  const liste = lireListe(objet, 'objets', chemin, 7, erreurs);
  if (liste === null) {
    return [];
  }

  const objets: string[] = [];
  liste.forEach((valeur, index) => {
    if (typeof valeur !== 'string' || valeur.trim() === '' || valeur.trim().length > 60) {
      erreurs.push({
        champ: `${sousChamp(chemin, 'objets')}[${index}]`,
        message: "Nom d'objet de 1 à 60 caractères attendu.",
      });
      return;
    }
    objets.push(valeur.trim());
  });
  return objets;
}

function lireJoueurLol(
  objet: Record<string, unknown>,
  chemin: string,
  erreurs: ErreurChamp[],
): DonneesJoueurPartieLol {
  const entier = (cle: string, min: number, max: number) => lireEntier(objet, cle, chemin, min, max, erreurs);
  return {
    joueurId: lireTexte(objet, 'joueurId', 50, erreurs, sousChamp(chemin, 'joueurId')),
    poste: lireChoix(objet, 'poste', chemin, POSTES_LOL, erreurs),
    champion: lireTexte(objet, 'champion', 40, erreurs, sousChamp(chemin, 'champion')),
    kills: entier('kills', 0, 99),
    morts: entier('morts', 0, 99),
    assistances: entier('assistances', 0, 99),
    sbires: entier('sbires', 0, 2000),
    gold: entier('gold', 0, 100000),
    niveau: entier('niveau', 1, 18),
    objets: lireObjets(objet, chemin, erreurs),
  };
}

/** PUT /api/matchs/:id/parties/:numero */
export function validerPartieLol(corps: unknown): ResultatValidation<DonneesPartieLol> {
  if (!estObjet(corps)) {
    return { valide: false, erreurs: [CORPS_ABSENT] };
  }

  const erreurs: ErreurChamp[] = [];

  // Trois heures : aucune partie professionnelle n'a jamais dure si longtemps.
  const duree = lireEntier(corps, 'duree', '', 0, 3 * 60 * 60, erreurs);
  const coteBleu = lireChoix(corps, 'coteBleu', '', COTES, erreurs);
  const vainqueur = lireVainqueur(corps, erreurs);

  const objectifs = lireObjetsParCote(corps['equipes'], 'equipes', erreurs);
  const equipes = objectifs && {
    domicile: lireObjectifsLol(objectifs.domicile, 'equipes.domicile', erreurs),
    exterieur: lireObjectifsLol(objectifs.exterieur, 'equipes.exterieur', erreurs),
  };

  const joueurs = lireJoueursParCote(corps['joueurs'], erreurs, (joueur, chemin) =>
    lireJoueurLol(joueur, chemin, erreurs),
  );

  // Une equipe n'a qu'un joueur par poste.
  for (const cote of COTES) {
    const postes = joueurs?.[cote].map((joueur) => joueur.poste) ?? [];
    if (new Set(postes).size !== postes.length) {
      erreurs.push({ champ: `joueurs.${cote}`, message: 'Deux joueurs occupent le même poste.' });
    }
  }

  const liste = lireListe(corps, 'dragons', '', 20, erreurs);
  const dragons =
    liste === null
      ? []
      : lireElements(liste, 'dragons', erreurs, (dragon, chemin) => ({
          cote: lireChoix(dragon, 'cote', chemin, COTES, erreurs),
          type: lireChoix(dragon, 'type', chemin, TYPES_DRAGON, erreurs),
        }));

  if (erreurs.length > 0 || equipes === null || joueurs === null) {
    return { valide: false, erreurs };
  }

  return { valide: true, donnees: { duree, coteBleu, vainqueur, equipes, joueurs, dragons } };
}

/*
 * ---------------------------------------------------------------------------
 * Valorant
 * ---------------------------------------------------------------------------
 */

function lireJoueurValorant(
  objet: Record<string, unknown>,
  chemin: string,
  erreurs: ErreurChamp[],
): DonneesJoueurCarteValorant {
  const entier = (cle: string, max: number) => lireEntier(objet, cle, chemin, 0, max, erreurs);
  return {
    joueurId: lireTexte(objet, 'joueurId', 50, erreurs, sousChamp(chemin, 'joueurId')),
    agent: lireTexte(objet, 'agent', 30, erreurs, sousChamp(chemin, 'agent')),
    kills: entier('kills', 150),
    morts: entier('morts', 150),
    assistances: entier('assistances', 150),
    acs: entier('acs', 999),
    adr: entier('adr', 999),
    tirsTete: entier('tirsTete', 100),
    premiersKills: entier('premiersKills', 99),
    premieresMorts: entier('premieresMorts', 99),
  };
}

/** PUT /api/matchs/:id/cartes/:numero */
export function validerCarteValorant(corps: unknown): ResultatValidation<DonneesCarteValorant> {
  if (!estObjet(corps)) {
    return { valide: false, erreurs: [CORPS_ABSENT] };
  }

  const erreurs: ErreurChamp[] = [];

  const nom = lireTexte(corps, 'nom', 30, erreurs);
  const vainqueur = lireVainqueur(corps, erreurs);

  const rounds = lireObjetsParCote(corps['equipes'], 'equipes', erreurs);
  const lireRounds = (objet: Record<string, unknown>, chemin: string) => ({
    // Les prolongations peuvent durer : 99 laisse de la marge.
    roundsAttaque: lireEntier(objet, 'roundsAttaque', chemin, 0, 99, erreurs),
    roundsDefense: lireEntier(objet, 'roundsDefense', chemin, 0, 99, erreurs),
  });
  const equipes = rounds && {
    domicile: lireRounds(rounds.domicile, 'equipes.domicile'),
    exterieur: lireRounds(rounds.exterieur, 'equipes.exterieur'),
  };

  const joueurs = lireJoueursParCote(corps['joueurs'], erreurs, (joueur, chemin) =>
    lireJoueurValorant(joueur, chemin, erreurs),
  );

  // Le vainqueur d'une carte est l'equipe qui a gagne le plus de rounds.
  if (equipes !== null && vainqueur !== null) {
    const perdant: Cote = vainqueur === 'domicile' ? 'exterieur' : 'domicile';
    const total = (cote: Cote) => equipes[cote].roundsAttaque + equipes[cote].roundsDefense;
    if (total(vainqueur) <= total(perdant)) {
      erreurs.push({ champ: 'vainqueur', message: 'Le vainqueur doit avoir gagné plus de rounds.' });
    }
  }

  if (erreurs.length > 0 || equipes === null || joueurs === null) {
    return { valide: false, erreurs };
  }

  return { valide: true, donnees: { nom, vainqueur, equipes, joueurs } };
}
