import { NextFunction, Request, Response } from 'express';
import { listerCompetitions, trouverCompetition } from '../depots/competitions.depot';

/**
 * Les controleurs sont desormais « async ».
 *
 * La raison est la meme que celle des Observables cote frontend a l'etape 5 :
 * interroger une base prend du temps et peut echouer. « await » met le
 * traitement en pause jusqu'a la reponse, sans bloquer le serveur, qui
 * continue de traiter les autres requetes pendant ce temps.
 *
 * Chacun recoit aussi « suivant » (next) : c'est par la qu'une erreur est
 * transmise au gestionnaire d'erreurs declare dans app.ts.
 */

/** GET /api/competitions  ->  toutes les competitions, ou celles d'un univers. */
export async function obtenirCompetitions(
  requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    const univers = requete.query['univers'];

    // On ne fait confiance a rien de ce qui vient du client : « univers »
    // peut etre absent, mal orthographie, ou meme etre un tableau.
    const filtre = univers === 'esport' || univers === 'football' ? univers : undefined;

    reponse.json(await listerCompetitions(filtre));
  } catch (erreur) {
    // Sans ce try/catch, une base injoignable ferait planter la requete sans
    // reponse : le client resterait suspendu jusqu'a expiration du delai.
    suivant(erreur);
  }
}

/** GET /api/competitions/:id  ->  une competition precise. */
export async function obtenirCompetition(
  requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    // Express peut renvoyer un tableau si le parametre apparait plusieurs
    // fois dans l'URL. Une fois de plus : on verifie ce qui vient du client.
    const brut = requete.params['id'];
    const identifiant = typeof brut === 'string' ? brut : '';
    const competition = await trouverCompetition(identifiant);

    if (competition === null) {
      // 404 = « je n'ai rien a cette adresse ». Renvoyer un 200 avec un corps
      // vide serait un mensonge : le client croirait que tout va bien.
      reponse.status(404).json({
        erreur: 'Compétition introuvable',
        id: identifiant,
      });
      return;
    }

    reponse.json(competition);
  } catch (erreur) {
    suivant(erreur);
  }
}
