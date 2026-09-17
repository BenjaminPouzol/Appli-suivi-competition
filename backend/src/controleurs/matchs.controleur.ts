import { NextFunction, Request, Response } from 'express';
import {
  effacerMatch,
  insererMatch,
  listerMatchs,
  mettreAJourMatch,
  trouverMatch,
} from '../depots/matchs.depot';
import {
  STATUTS_VALIDES,
  estStatutValide,
  validerDonneesMatch,
} from '../validation/match.validation';
import { lireIdentifiant, repondreDonneesInvalides } from './outils';

/** Message commun aux deux cas ou une reference envoyee n'existe pas. */
const REFERENCE_INCONNUE = {
  erreur: "La compétition ou l'une des équipes indiquées n'existe pas",
};

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

/** Etape 7 -- GET /api/matchs/:id  ->  un match precis (pour le formulaire de modification). */
export async function obtenirMatch(
  requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    const identifiant = lireIdentifiant(requete);
    const match = await trouverMatch(identifiant);

    if (match === null) {
      reponse.status(404).json({ erreur: 'Match introuvable', id: identifiant });
      return;
    }

    reponse.json(match);
  } catch (erreur) {
    suivant(erreur);
  }
}

/** Etape 7 -- POST /api/matchs  ->  cree un match. */
export async function creerMatch(
  requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    const validation = validerDonneesMatch(requete.body);

    if (!validation.valide) {
      repondreDonneesInvalides(reponse, validation.erreurs);
      return;
    }

    const resultat = await insererMatch(validation.donnees);

    if (resultat === 'reference-inconnue') {
      // 400 et non 404 : l'adresse /api/matchs existe bel et bien. C'est le
      // CONTENU de la requete qui designe quelque chose d'inexistant.
      reponse.status(400).json(REFERENCE_INCONNUE);
      return;
    }

    reponse.status(201).location(`/api/matchs/${resultat.id}`).json(resultat);
  } catch (erreur) {
    suivant(erreur);
  }
}

/** Etape 7 -- PUT /api/matchs/:id  ->  remplace les informations d'un match. */
export async function modifierMatch(
  requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    const identifiant = lireIdentifiant(requete);
    const validation = validerDonneesMatch(requete.body);

    if (!validation.valide) {
      repondreDonneesInvalides(reponse, validation.erreurs);
      return;
    }

    const resultat = await mettreAJourMatch(identifiant, validation.donnees);

    if (resultat === 'introuvable') {
      reponse.status(404).json({ erreur: 'Match introuvable', id: identifiant });
      return;
    }

    if (resultat === 'reference-inconnue') {
      reponse.status(400).json(REFERENCE_INCONNUE);
      return;
    }

    reponse.json(resultat);
  } catch (erreur) {
    suivant(erreur);
  }
}

/** Etape 7 -- DELETE /api/matchs/:id  ->  supprime un match. */
export async function supprimerMatch(
  requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    const identifiant = lireIdentifiant(requete);

    if ((await effacerMatch(identifiant)) === 'introuvable') {
      reponse.status(404).json({ erreur: 'Match introuvable', id: identifiant });
      return;
    }

    reponse.status(204).end();
  } catch (erreur) {
    suivant(erreur);
  }
}
