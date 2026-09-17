import { Equipe } from './equipe';

/** Ou en est une rencontre. */
export type StatutMatch = 'a-venir' | 'en-direct' | 'termine';

/** Une rencontre entre deux equipes, telle que l'application la manipule. */
export interface Match {
  id: string;
  /** Renvoie vers l'identifiant d'une Competition. */
  competitionId: string;
  domicile: Equipe;
  exterieur: Equipe;
  /**
   * Le score vaut null tant que le match n'a pas commence.
   *
   * « number | null » oblige a traiter explicitement ce cas avant
   * d'afficher la valeur : TypeScript refuse qu'on l'ignore.
   */
  scoreDomicile: number | null;
  scoreExterieur: number | null;
  date: Date;
  statut: StatutMatch;
}

/**
 * La MEME rencontre, telle qu'elle arrive sur le reseau.
 *
 * La seule difference est la date : le JSON ne connait pas ce type, donc
 * elle voyage sous forme de texte (« 2026-09-14T17:00:00.000Z »). Il faut la
 * reconvertir a l'arrivee, sinon un appel comme .getTime() echouerait.
 *
 * « Omit<Match, 'date'> » se lit : « tout ce que contient Match, sauf date ».
 * Ecrire les deux interfaces separement ferait courir le risque qu'elles
 * divergent le jour ou un champ est ajoute.
 */
export interface MatchApi extends Omit<Match, 'date'> {
  date: string;
}

/**
 * Etape 7 : ce que l'application ENVOIE pour creer ou modifier un match.
 *
 * Les equipes n'y figurent que par leur identifiant. Le nom et le trigramme
 * appartiennent a l'equipe, pas au match : c'est la base qui les connait,
 * et le client n'a pas a les renvoyer.
 *
 * L'identifiant du match est absent : a la creation, c'est le serveur qui le
 * genere ; a la modification, il figure dans l'adresse.
 */
export interface DonneesMatch {
  competitionId: string;
  domicileId: string;
  exterieurId: string;
  scoreDomicile: number | null;
  scoreExterieur: number | null;
  date: Date;
  statut: StatutMatch;
}
