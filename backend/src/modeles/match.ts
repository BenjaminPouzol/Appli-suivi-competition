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
  /**
   * Etape 10 : true si le score est calcule a partir du detail du match
   * (buts, parties, cartes). La competition, les equipes et le score ne se
   * modifient alors plus depuis le formulaire.
   */
  scoreCalcule: boolean;
}

/**
 * Etape 7 : ce qu'un client ENVOIE pour creer ou modifier un match.
 *
 * La difference avec Match est instructive. En lecture, l'API renvoie les
 * equipes completes (nom, trigramme) pour que le frontend puisse les
 * afficher. En ecriture, le client n'envoie que leurs identifiants : c'est
 * la base qui connait les equipes, pas le client. Accepter un nom d'equipe
 * envoye par le client reviendrait a le laisser renommer une equipe au
 * passage.
 *
 * L'identifiant du match est absent : a la creation, c'est la base qui le
 * genere ; a la modification, il figure dans l'adresse.
 */
export interface DonneesMatch {
  competitionId: string;
  domicileId: string;
  exterieurId: string;
  scoreDomicile: number | null;
  scoreExterieur: number | null;
  date: string;
  statut: StatutMatch;
}
