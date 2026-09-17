import { NextFunction, Request, Response } from 'express';
import {
  effacerCompetition,
  insererCompetition,
  listerCompetitions,
  mettreAJourCompetition,
  trouverCompetition,
} from '../depots/competitions.depot';
import {
  validerDonneesCompetition,
  validerNouvelleCompetition,
} from '../validation/competition.validation';
import { lireIdentifiant, repondreDonneesInvalides } from './outils';

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
    const identifiant = lireIdentifiant(requete);
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

/*
 * ---------------------------------------------------------------------------
 * Etape 7 : les ecritures
 * ---------------------------------------------------------------------------
 *
 * Les trois controleurs suivent le meme deroule, dans le meme ordre :
 *
 *   1. VALIDER le corps de la requete         -> 400 si refuse
 *   2. ECRIRE en base, via le depot
 *   3. TRADUIRE le resultat en code HTTP      -> 201, 200, 204, 404 ou 409
 *
 * L'ordre compte : on ne sollicite jamais la base avec des donnees qu'on n'a
 * pas verifiees.
 */

/** POST /api/competitions  ->  cree une competition. */
export async function creerCompetition(
  requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    const validation = validerNouvelleCompetition(requete.body);

    if (!validation.valide) {
      repondreDonneesInvalides(reponse, validation.erreurs);
      return;
    }

    const resultat = await insererCompetition(validation.donnees);

    if (resultat === 'identifiant-pris') {
      // 409 = « conflit avec l'etat actuel des donnees ». La requete est
      // bien formee -- c'est la situation qui l'empeche d'aboutir.
      reponse.status(409).json({
        erreur: 'Cet identifiant est déjà utilisé',
        id: validation.donnees.id,
      });
      return;
    }

    // 201 = « cree ». L'en-tete Location indique l'adresse de la nouvelle
    // ressource : une convention REST, qui evite au client de la deviner.
    reponse.status(201).location(`/api/competitions/${resultat.id}`).json(resultat);
  } catch (erreur) {
    suivant(erreur);
  }
}

/** PUT /api/competitions/:id  ->  remplace les informations d'une competition. */
export async function modifierCompetition(
  requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    const identifiant = lireIdentifiant(requete);
    const validation = validerDonneesCompetition(requete.body);

    if (!validation.valide) {
      repondreDonneesInvalides(reponse, validation.erreurs);
      return;
    }

    const resultat = await mettreAJourCompetition(identifiant, validation.donnees);

    if (resultat === 'introuvable') {
      reponse.status(404).json({ erreur: 'Compétition introuvable', id: identifiant });
      return;
    }

    // Apres le test ci-dessus, TypeScript sait que « resultat » ne peut plus
    // etre qu'une Competition : c'est le retrecissement de type.
    reponse.json(resultat);
  } catch (erreur) {
    suivant(erreur);
  }
}

/** DELETE /api/competitions/:id  ->  supprime une competition. */
export async function supprimerCompetition(
  requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    const identifiant = lireIdentifiant(requete);
    const resultat = await effacerCompetition(identifiant);

    if (resultat === 'introuvable') {
      reponse.status(404).json({ erreur: 'Compétition introuvable', id: identifiant });
      return;
    }

    if (resultat === 'utilisee') {
      reponse.status(409).json({
        erreur: 'Cette compétition contient encore des matchs. Supprime-les d’abord.',
        id: identifiant,
      });
      return;
    }

    // 204 = « fait, et je n'ai rien a te renvoyer ». La competition n'existe
    // plus : il n'y a rien a decrire. « end() » termine la reponse sans corps.
    reponse.status(204).end();
  } catch (erreur) {
    suivant(erreur);
  }
}
