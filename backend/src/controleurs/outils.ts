import { Request, Response } from 'express';
import { ErreurChamp } from '../validation/validation';

/**
 * Petits outils partages par tous les controleurs.
 *
 * Etape 7 : sept controleurs lisent desormais un « :id » dans l'adresse, et
 * quatre renvoient des erreurs de validation. Recopier ces lignes a chaque
 * fois, c'est s'exposer a ce qu'une copie soit corrigee et pas les autres.
 */

/**
 * Lit le parametre « :id » de l'adresse.
 *
 * Express peut renvoyer un tableau si le parametre apparait plusieurs
 * fois dans l'URL. Une fois de plus : on verifie ce qui vient du client.
 */
export function lireIdentifiant(requete: Request): string {
  const brut = requete.params['id'];
  return typeof brut === 'string' ? brut : '';
}

/**
 * Repond 400 avec le detail de chaque champ refuse.
 *
 * 400 = « ta requete est mal formee, inutile de la renvoyer telle quelle ».
 * Le detail par champ permet au frontend d'afficher chaque message a cote du
 * champ concerne, au lieu d'un vague « quelque chose ne va pas ».
 */
export function repondreDonneesInvalides(reponse: Response, erreurs: ErreurChamp[]): void {
  reponse.status(400).json({
    erreur: 'Données invalides',
    details: erreurs,
  });
}
