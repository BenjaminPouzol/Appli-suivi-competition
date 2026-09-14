import { Request, Response } from 'express';
import { matchs } from '../donnees/matchs';
import { StatutMatch } from '../modeles/match';

/** Les trois seules valeurs acceptees pour le filtre ?statut=. */
const STATUTS_VALIDES: StatutMatch[] = ['a-venir', 'en-direct', 'termine'];

/**
 * Verifie qu'une valeur venue du client est bien un statut connu.
 *
 * Le « valeur is StatutMatch » du type de retour est une particularite de
 * TypeScript : il ne dit pas seulement que la fonction renvoie un booleen,
 * il dit qu'APRES un appel qui renvoie true, la valeur peut etre traitee
 * comme un StatutMatch. Le reste du code est alors verifie en consequence.
 */
function estStatutValide(valeur: unknown): valeur is StatutMatch {
  return typeof valeur === 'string' && STATUTS_VALIDES.includes(valeur as StatutMatch);
}

/** GET /api/matchs  ->  tous les matchs, ou ceux d'un statut donne. */
export function listerMatchs(requete: Request, reponse: Response): void {
  const statut = requete.query['statut'];

  // Un filtre absent est legitime : on renvoie tout.
  if (statut === undefined) {
    reponse.json(trierParDate(matchs));
    return;
  }

  // Un filtre present mais invalide est une erreur du client : on le dit
  // clairement plutot que de renvoyer une liste vide, qui laisserait croire
  // qu'aucun match ne correspond.
  if (!estStatutValide(statut)) {
    reponse.status(400).json({
      erreur: 'Statut inconnu',
      recu: statut,
      attendu: STATUTS_VALIDES,
    });
    return;
  }

  reponse.json(trierParDate(matchs.filter((match) => match.statut === statut)));
}

/** Range les matchs du plus ancien au plus recent. */
function trierParDate(liste: typeof matchs): typeof matchs {
  return [...liste].sort((a, b) => a.date.localeCompare(b.date));
}
