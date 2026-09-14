import { Request, Response } from 'express';
import { competitions } from '../donnees/competitions';

/**
 * Un CONTROLEUR est la fonction qui repond a une requete.
 *
 * Il recoit deux objets :
 *   - requete : ce que le client demande (parametres, filtres, corps)
 *   - reponse : ce qu'on lui renvoie (code de statut, contenu)
 *
 * Il ne contient QUE la logique de la reponse. Il ne sait pas a quelle URL
 * il est branche : c'est le role du fichier de routes.
 */

/** GET /api/competitions  ->  toutes les competitions, ou celles d'un univers. */
export function listerCompetitions(requete: Request, reponse: Response): void {
  const univers = requete.query['univers'];

  // On ne fait confiance a rien de ce qui vient du client : « univers » peut
  // etre absent, mal orthographie, ou meme etre un tableau si quelqu'un
  // appelle /api/competitions?univers=a&univers=b. On verifie donc la valeur
  // exacte plutot que de la transmettre telle quelle.
  if (univers === 'esport' || univers === 'football') {
    reponse.json(competitions.filter((competition) => competition.univers === univers));
    return;
  }

  reponse.json(competitions);
}

/** GET /api/competitions/:id  ->  une competition precise. */
export function obtenirCompetition(requete: Request, reponse: Response): void {
  const competition = competitions.find(
    (candidate) => candidate.id === requete.params['id'],
  );

  if (competition === undefined) {
    // 404 = « je n'ai rien a cette adresse ». Renvoyer un 200 avec un corps
    // vide serait un mensonge : le client croirait que tout va bien.
    reponse.status(404).json({
      erreur: 'Compétition introuvable',
      id: requete.params['id'],
    });
    return;
  }

  reponse.json(competition);
}
