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

export interface Competition {
  id: string;
  nom: string;
  organisateur: string;
  univers: Univers;
  description: string;
}

/**
 * Etape 7 : ce qu'un client peut MODIFIER sur une competition.
 *
 * Tout, sauf l'identifiant. Celui-ci figure dans l'adresse
 * (PUT /api/competitions/lol) et sert de reference aux matchs : le changer
 * reviendrait a creer une autre competition.
 *
 * « Omit<Competition, 'id'> » se lit : « tout ce que contient Competition,
 * sauf id » -- le meme outil que MatchApi cote frontend a l'etape 5.
 */
export type DonneesCompetition = Omit<Competition, 'id'>;
