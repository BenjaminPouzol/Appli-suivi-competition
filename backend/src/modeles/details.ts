import { Competition } from './competition';
import { JoueurResume } from './joueur';
import { Match } from './match';

/**
 * Etape 10 : le detail d'un match -- ses statistiques.
 *
 * Chaque discipline a les siennes. Le type DetailsMatch, tout en bas, les
 * reunit en une UNION DISCRIMINEE (etape 7) : la propriete « discipline »
 * dit laquelle des trois formes on a entre les mains.
 *
 * Deux familles de types coexistent ici :
 *   - ce que l'API RENVOIE (lecture), enrichi de valeurs calculees ;
 *   - ce que l'API RECOIT (ecriture), prefixe « Donnees », qui ne contient
 *     que ce qu'un administrateur a le droit d'ecrire.
 */

/** L'un des deux cotes d'un match. */
export type Cote = 'domicile' | 'exterieur';

/*
 * ---------------------------------------------------------------------------
 * Football
 * ---------------------------------------------------------------------------
 */

export interface StatistiquesFootball {
  /** En pourcentage. */
  possession: number;
  tirs: number;
  tirsCadres: number;
  corners: number;
  fautes: number;
  horsJeu: number;
  cartonsJaunes: number;
  cartonsRouges: number;
  passes: number;
  passesReussies: number;
  /** Arrets du gardien de cette equipe. */
  arrets: number;
}

export type TypeBut = 'normal' | 'penalty' | 'csc';

export interface But {
  /** Le cote qui BENEFICIE du but. */
  cote: Cote;
  buteur: JoueurResume;
  minute: number;
  /** 2 pour un but a la « 45+2 » ; null sinon. */
  tempsAdditionnel: number | null;
  type: TypeBut;
}

export interface DetailsFootball {
  discipline: 'football';
  /**
   * « Record<Cote, X> » se lit : « un objet dont les cles sont les valeurs
   * de Cote, et les valeurs des X » -- soit { domicile: X; exterieur: X }.
   * null tant qu'aucune statistique n'a ete saisie.
   */
  statistiques: Record<Cote, StatistiquesFootball> | null;
  /** Dans l'ordre chronologique. */
  buts: But[];
}

/*
 * ---------------------------------------------------------------------------
 * League of Legends
 * ---------------------------------------------------------------------------
 */

export type PosteLol = 'top' | 'jungle' | 'mid' | 'adc' | 'support';

export type TypeDragon =
  | 'infernal'
  | 'ocean'
  | 'montagne'
  | 'nuage'
  | 'hextech'
  | 'chemtech'
  | 'ancestral';

/** Les objectifs d'une equipe, tels qu'ils sont stockes. */
export interface ObjectifsLol {
  tours: number;
  inhibiteurs: number;
  barons: number;
  herauts: number;
  larves: number;
}

/** Une equipe dans une partie : ses objectifs, plus ce qui se CALCULE. */
export interface EquipePartieLol extends ObjectifsLol {
  /** Somme des kills de ses joueurs. */
  kills: number;
  /** Somme du gold de ses joueurs. */
  gold: number;
  /** Les dragons tues, dans l'ordre. */
  dragons: TypeDragon[];
}

export interface JoueurPartieLol {
  joueur: JoueurResume;
  poste: PosteLol;
  champion: string;
  kills: number;
  morts: number;
  assistances: number;
  sbires: number;
  gold: number;
  niveau: number;
  objets: string[];
}

export interface PartieLol {
  numero: number;
  /** En secondes. */
  duree: number;
  coteBleu: Cote;
  /** null tant que la partie est en cours. */
  vainqueur: Cote | null;
  equipes: Record<Cote, EquipePartieLol>;
  /** Tries par poste, de top a support. */
  joueurs: Record<Cote, JoueurPartieLol[]>;
}

export interface DetailsLol {
  discipline: 'lol';
  parties: PartieLol[];
}

/*
 * ---------------------------------------------------------------------------
 * Valorant
 * ---------------------------------------------------------------------------
 */

export interface EquipeCarteValorant {
  /** Calcule : attaque + defense. */
  rounds: number;
  roundsAttaque: number;
  roundsDefense: number;
}

export interface JoueurCarteValorant {
  joueur: JoueurResume;
  agent: string;
  kills: number;
  morts: number;
  assistances: number;
  acs: number;
  adr: number;
  tirsTete: number;
  premiersKills: number;
  premieresMorts: number;
}

export interface CarteValorant {
  numero: number;
  nom: string;
  vainqueur: Cote | null;
  equipes: Record<Cote, EquipeCarteValorant>;
  /** Tries par ACS decroissant, comme sur les sites de resultats. */
  joueurs: Record<Cote, JoueurCarteValorant[]>;
}

export interface DetailsValorant {
  discipline: 'valorant';
  cartes: CarteValorant[];
}

/*
 * ---------------------------------------------------------------------------
 * Le tout
 * ---------------------------------------------------------------------------
 */

export type DetailsParDiscipline = DetailsFootball | DetailsLol | DetailsValorant;

/**
 * GET /api/matchs/:id/details
 *
 * Le match et sa competition sont joints au detail : la page de detail a
 * besoin des trois, et les rafraichit ensemble quand le match est en direct.
 */
export type DetailsMatch = { match: Match; competition: Competition } & DetailsParDiscipline;

/*
 * ---------------------------------------------------------------------------
 * Ce que l'API RECOIT
 * ---------------------------------------------------------------------------
 *
 * Les joueurs n'y figurent que par leur identifiant, comme les equipes dans
 * DonneesMatch (etape 7). Et les valeurs calculees (kills d'equipe, total de
 * rounds...) n'y figurent pas du tout : le serveur les calcule.
 */

export interface DonneesBut {
  cote: Cote;
  buteurId: string;
  minute: number;
  tempsAdditionnel: number | null;
  type: TypeBut;
}

/** PUT /api/matchs/:id/feuille-football : remplace TOUT le detail du match. */
export interface DonneesFeuilleFootball {
  statistiques: Record<Cote, StatistiquesFootball> | null;
  buts: DonneesBut[];
}

export interface DonneesJoueurPartieLol extends Omit<JoueurPartieLol, 'joueur'> {
  joueurId: string;
}

/** PUT /api/matchs/:id/parties/:numero */
export interface DonneesPartieLol {
  duree: number;
  coteBleu: Cote;
  vainqueur: Cote | null;
  equipes: Record<Cote, ObjectifsLol>;
  joueurs: Record<Cote, DonneesJoueurPartieLol[]>;
  /** Tous les dragons de la partie, dans l'ordre ou ils ont ete tues. */
  dragons: { cote: Cote; type: TypeDragon }[];
}

export interface DonneesJoueurCarteValorant extends Omit<JoueurCarteValorant, 'joueur'> {
  joueurId: string;
}

/** PUT /api/matchs/:id/cartes/:numero */
export interface DonneesCarteValorant {
  nom: string;
  vainqueur: Cote | null;
  equipes: Record<Cote, Omit<EquipeCarteValorant, 'rounds'>>;
  joueurs: Record<Cote, DonneesJoueurCarteValorant[]>;
}
