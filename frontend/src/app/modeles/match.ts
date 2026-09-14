import { Equipe } from './equipe';

/** Ou en est une rencontre. */
export type StatutMatch = 'a-venir' | 'en-direct' | 'termine';

/** Une rencontre entre deux equipes. */
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
