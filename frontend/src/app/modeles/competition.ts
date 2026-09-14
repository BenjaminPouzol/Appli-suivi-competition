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
