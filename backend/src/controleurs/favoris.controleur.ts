import { NextFunction, Request, Response } from 'express';
import { ajouterFavori, listerEquipesSuivies, retirerFavori } from '../depots/favoris.depot';
import { idUtilisateurConnecte, lireParametre } from './outils';

/*
 * Etape 9 : les favoris de la personne connectee.
 *
 * Remarque ce qui est ABSENT des adresses : l'identifiant de l'utilisateur.
 * On n'ecrit pas /api/utilisateurs/:id/favoris, mais /api/moi/favoris.
 *
 * Si l'identifiant etait dans l'adresse, il faudrait verifier a chaque
 * requete qu'il correspond bien a la personne connectee -- et le premier
 * oubli permettrait de modifier les favoris de quelqu'un d'autre en changeant
 * un chiffre dans l'URL. C'est une faille si repandue qu'elle porte un nom :
 * l'IDOR (Insecure Direct Object Reference). Ici, l'identifiant vient du
 * JETON, verifie par authentifier() : impossible de parler au nom d'un autre.
 */

/** GET /api/moi/favoris  ->  les equipes suivies. */
export async function obtenirFavoris(
  requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    reponse.json(await listerEquipesSuivies(idUtilisateurConnecte(requete)));
  } catch (erreur) {
    suivant(erreur);
  }
}

/**
 * PUT /api/moi/favoris/:equipeId  ->  suit une equipe.
 *
 * PUT et non POST : on ne « cree » pas une ressource nouvelle a chaque appel,
 * on fixe un etat -- « cette equipe est suivie ». Rejouer la requete ne change
 * rien, ce qui est la definition d'une operation idempotente (etape 7).
 */
export async function suivreEquipe(
  requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    const equipeId = lireParametre(requete, 'equipeId');
    const resultat = await ajouterFavori(idUtilisateurConnecte(requete), equipeId);

    if (resultat === 'equipe-inconnue') {
      reponse.status(404).json({ erreur: 'Équipe introuvable', id: equipeId });
      return;
    }

    reponse.status(204).end();
  } catch (erreur) {
    suivant(erreur);
  }
}

/** DELETE /api/moi/favoris/:equipeId  ->  ne suit plus une equipe. */
export async function nePlusSuivreEquipe(
  requete: Request,
  reponse: Response,
  suivant: NextFunction,
): Promise<void> {
  try {
    await retirerFavori(idUtilisateurConnecte(requete), lireParametre(requete, 'equipeId'));

    // 204 meme si l'equipe n'etait pas suivie : l'etat demande -- « cette
    // equipe n'est pas suivie » -- est atteint dans tous les cas.
    reponse.status(204).end();
  } catch (erreur) {
    suivant(erreur);
  }
}
