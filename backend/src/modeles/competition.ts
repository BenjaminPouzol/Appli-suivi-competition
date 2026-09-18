/**
 * Les modeles du backend decrivent les MEMES donnees que ceux du frontend.
 *
 * Ils sont volontairement dupliques pour l'instant : les deux projets sont
 * independants, chacun avec ses propres dependances. Mettre en commun du code
 * entre eux demande une mise en place (monorepo, paquet partage) qui
 * n'apporterait rien a ce stade -- et masquerait le point important :
 * c'est le format JSON echange sur le reseau qui fait le contrat entre les
 * deux, pas le fait de partager un fichier.
 */
export type Univers = 'esport' | 'football';

/**
 * Etape 10 : le jeu -- ou le sport -- d'une competition. C'est elle qui dit
 * quelles statistiques decrivent le detail de ses matchs.
 *
 * Les valeurs sont les memes en base et dans l'API : aucune traduction a
 * faire dans les depots, contrairement aux statuts de match (etape 6).
 */
export type Discipline = 'football' | 'lol' | 'valorant';

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
 * Etape 10 : l'univers se DEDUIT de la discipline.
 *
 * Le client n'envoie plus l'univers : il ne pourrait qu'envoyer une valeur
 * qui contredise la discipline. Ce qui se calcule ne se demande pas.
 */
export function universDe(discipline: Discipline): Univers {
  return discipline === 'football' ? 'football' : 'esport';
}

/**
 * Etape 7 : ce qu'un client peut MODIFIER sur une competition.
 *
 * Etape 10 : ni l'identifiant (qui figure dans l'adresse et sert de
 * reference aux matchs), ni la discipline (dont dependent les statistiques
 * des matchs), ni l'univers (qui se deduit de la discipline).
 *
 * « Pick » est le contraire d'« Omit » : il ne GARDE que les champs cites.
 */
export type DonneesCompetition = Pick<Competition, 'nom' | 'organisateur' | 'description'>;
