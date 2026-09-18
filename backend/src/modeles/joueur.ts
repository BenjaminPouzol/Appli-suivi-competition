import { Discipline } from './competition';

/** Etape 10 : un joueur, tel que l'API le decrit. */
export interface Joueur {
  id: string;
  /** Pseudo en esport, nom en football. */
  nom: string;
  discipline: Discipline;
  /** L'equipe ACTUELLE du joueur. */
  equipeId: string;
}

/**
 * Ce qu'il faut savoir d'un joueur pour afficher une ligne de statistiques.
 * Son equipe n'y figure pas : c'est le cote de la ligne qui la donne.
 */
export type JoueurResume = Pick<Joueur, 'id' | 'nom'>;
