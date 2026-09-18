/**
 * Les deux univers couverts par la plateforme.
 *
 * Ecrire « 'esport' | 'football' » plutot que « string » est volontaire :
 * c'est un type union, qui n'autorise QUE ces deux valeurs exactes. Une
 * faute de frappe comme 'footbal' devient une erreur signalee dans
 * l'editeur, au lieu d'un bug silencieux.
 */
export type Univers = 'esport' | 'football';

/**
 * Etape 10 : le jeu -- ou le sport -- d'une competition. C'est elle qui dit
 * quelles statistiques decrivent ses matchs. L'univers s'en deduit.
 */
export type Discipline = 'football' | 'lol' | 'valorant';

/** Une competition suivie par la plateforme. */
export interface Competition {
  id: string;
  nom: string;
  organisateur: string;
  univers: Univers;
  /** Etape 10. */
  discipline: Discipline;
  description: string;
}

/**
 * Etape 7 : ce qu'on peut MODIFIER sur une competition.
 *
 * Etape 10 : ni l'identifiant (dans l'adresse, et reference des matchs), ni
 * la discipline (dont dependent les statistiques des matchs), ni l'univers
 * (que le serveur deduit de la discipline). « Pick » ne garde que les champs
 * cites -- le contraire d'« Omit ».
 */
export type DonneesCompetition = Pick<Competition, 'nom' | 'organisateur' | 'description'>;

/** Etape 10 : ce qu'on envoie pour CREER une competition. Tout, sauf l'univers. */
export type NouvelleCompetition = Omit<Competition, 'univers'>;
