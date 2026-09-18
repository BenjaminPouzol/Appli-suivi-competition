import { NextFunction, Request, Response } from 'express';
import { listerEquipes, listerJoueurs } from '../depots/equipes.depot';
import { lireIdentifiant } from './outils';

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

/** Etape 10 -- GET /api/equipes/:id/joueurs  ->  l'effectif actuel d'une equipe. */
export async function obtenirJoueurs(
  requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    const identifiant = lireIdentifiant(requete);
    const joueurs = await listerJoueurs(identifiant);

    // Une liste vide et une equipe inconnue sont deux reponses differentes :
    // 200 [] pour une equipe sans joueur, 404 pour une equipe qui n'existe pas.
    if (joueurs === null) {
      reponse.status(404).json({ erreur: 'Équipe introuvable', id: identifiant });
      return;
    }

    reponse.json(joueurs);
  } catch (erreur) {
    suivant(erreur);
  }
}
