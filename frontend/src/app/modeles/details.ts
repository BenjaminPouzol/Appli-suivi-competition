import { Competition } from './competition';
import { Match, MatchApi } from './match';

/**
 * Etape 10 : le detail d'un match, tel que l'API le renvoie
 * (GET /api/matchs/:id/details).
 *
 * Ces types recopient ceux du backend (backend/src/modeles/details.ts), pour
 * la raison donnee a l'etape 4 : c'est le JSON echange qui fait le contrat.
 * Le frontend n'ecrit pas le detail -- l'administration passe par l'API --,
 * il n'a donc besoin que des types de LECTURE.
 */

/** L'un des deux cotes d'un match. */
export type Cote = 'domicile' | 'exterieur';

/** Un joueur, tel qu'il apparait dans une ligne de statistiques. */
export interface JoueurResume {
  id: string;
  nom: string;
}

// --- Football ---------------------------------------------------------------

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
  tempsAdditionnel: number | null;
  type: TypeBut;
}

export interface DetailsFootball {
  discipline: 'football';
  /** { domicile: ..., exterieur: ... }, ou null si rien n'a ete saisi. */
  statistiques: Record<Cote, StatistiquesFootball> | null;
  buts: But[];
}

// --- League of Legends ------------------------------------------------------

export type PosteLol = 'top' | 'jungle' | 'mid' | 'adc' | 'support';

export type TypeDragon =
  | 'infernal'
  | 'ocean'
  | 'montagne'
  | 'nuage'
  | 'hextech'
  | 'chemtech'
  | 'ancestral';

export interface EquipePartieLol {
  /** Calcule par le serveur : somme des kills des joueurs. */
  kills: number;
  /** Calcule par le serveur : somme du gold des joueurs. */
  gold: number;
  tours: number;
  inhibiteurs: number;
  barons: number;
  herauts: number;
  larves: number;
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
  joueurs: Record<Cote, JoueurPartieLol[]>;
}

export interface DetailsLol {
  discipline: 'lol';
  parties: PartieLol[];
}

// --- Valorant ---------------------------------------------------------------

export interface EquipeCarteValorant {
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
  joueurs: Record<Cote, JoueurCarteValorant[]>;
}

export interface DetailsValorant {
  discipline: 'valorant';
  cartes: CarteValorant[];
}

// --- Le tout ----------------------------------------------------------------

/**
 * Une UNION DISCRIMINEE (etape 7) : « discipline » dit laquelle des trois
 * formes on a entre les mains.
 */
export type DetailsParDiscipline = DetailsFootball | DetailsLol | DetailsValorant;

/** Le detail, avec le match et sa competition. */
export type DetailsMatch = { match: Match; competition: Competition } & DetailsParDiscipline;

/** La meme chose telle qu'elle arrive sur le reseau : la date du match est du texte. */
export type DetailsMatchApi = { match: MatchApi; competition: Competition } & DetailsParDiscipline;
