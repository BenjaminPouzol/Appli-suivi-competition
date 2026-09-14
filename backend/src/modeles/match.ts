import { Equipe } from './equipe';

export type StatutMatch = 'a-venir' | 'en-direct' | 'termine';

export interface Match {
  id: string;
  competitionId: string;
  domicile: Equipe;
  exterieur: Equipe;
  scoreDomicile: number | null;
  scoreExterieur: number | null;
  /**
   * Cote backend la date est une CHAINE au format ISO 8601, et non un objet
   * Date comme cote frontend.
   *
   * La raison est simple : le JSON ne connait pas le type Date. Une date qui
   * traverse le reseau devient forcement du texte. Autant la stocker deja
   * sous cette forme ici, plutot que de convertir a chaque reponse.
   */
  date: string;
  statut: StatutMatch;
}
