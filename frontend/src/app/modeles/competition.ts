/**
 * Les deux univers couverts par la plateforme.
 *
 * Ecrire « 'esport' | 'football' » plutot que « string » est volontaire :
 * c'est un type union, qui n'autorise QUE ces deux valeurs exactes. Une
 * faute de frappe comme 'footbal' devient une erreur signalee dans
 * l'editeur, au lieu d'un bug silencieux.
 */
export type Univers = 'esport' | 'football';

/** Une competition suivie par la plateforme. */
export interface Competition {
  id: string;
  nom: string;
  organisateur: string;
  univers: Univers;
  description: string;
}

/**
 * Etape 7 : ce qu'on peut MODIFIER sur une competition.
 *
 * Tout, sauf l'identifiant : il figure dans l'adresse de la requete
 * (PUT /api/competitions/lol) et les matchs s'en servent comme reference.
 */
export type DonneesCompetition = Omit<Competition, 'id'>;
