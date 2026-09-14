import { NextFunction, Request, Response } from 'express';
import { listerMatchs } from '../depots/matchs.depot';
import { StatutMatch } from '../modeles/match';

/** Les trois seules valeurs acceptees pour le filtre ?statut=. */
const STATUTS_VALIDES: StatutMatch[] = ['a-venir', 'en-direct', 'termine'];

/**
 * Verifie qu'une valeur venue du client est bien un statut connu.
 *
 * Le « valeur is StatutMatch » du type de retour est une particularite de
 * TypeScript : il ne dit pas seulement que la fonction renvoie un booleen,
 * il dit qu'APRES un appel qui renvoie true, la valeur peut etre traitee
 * comme un StatutMatch.
 */
function estStatutValide(valeur: unknown): valeur is StatutMatch {
  return typeof valeur === 'string' && STATUTS_VALIDES.includes(valeur as StatutMatch);
}

/** GET /api/matchs  ->  tous les matchs, ou ceux d'un statut donne. */
export async function obtenirMatchs(
  requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    const statut = requete.query['statut'];

    // Un filtre absent est legitime : on renvoie tout.
    if (statut === undefined) {
      reponse.json(await listerMatchs());
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

    reponse.json(await listerMatchs(statut));
  } catch (erreur) {
    suivant(erreur);
  }
}
