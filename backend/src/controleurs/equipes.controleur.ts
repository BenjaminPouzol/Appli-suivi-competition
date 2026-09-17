import { NextFunction, Request, Response } from 'express';
import { listerEquipes } from '../depots/equipes.depot';

/** Etape 7 -- GET /api/equipes  ->  toutes les equipes, par ordre alphabetique. */
export async function obtenirEquipes(
  _requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    reponse.json(await listerEquipes());
  } catch (erreur) {
    suivant(erreur);
  }
}
