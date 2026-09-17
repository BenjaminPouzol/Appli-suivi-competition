import { Router } from 'express';
import {
  creerCompetition,
  modifierCompetition,
  obtenirCompetition,
  obtenirCompetitions,
  supprimerCompetition,
} from '../controleurs/competitions.controleur';
import { reserveAuxAdministrateurs } from '../middlewares/authentification';

/**
 * Un ROUTEUR associe des chemins d'URL a des controleurs.
 *
 * Les chemins ecrits ici sont RELATIFS : ce routeur sera branche sur
 * « /api/competitions » dans routes/index.ts, donc « / » devient en realite
 * « /api/competitions ». Cela permet de changer le prefixe a un seul endroit.
 *
 * Etape 7 : la meme adresse peut desormais mener a des controleurs
 * differents. Ce qui les distingue, c'est la METHODE HTTP -- le verbe --
 * de la requete. L'adresse designe QUOI, la methode dit QUOI EN FAIRE.
 *
 * Etape 8 : la lecture reste ouverte a tous ; l'ecriture est reservee aux
 * administrateurs. Les gardiens s'intercalent entre l'adresse et le
 * controleur, qui n'a pas eu a changer d'une ligne.
 */
export const routeurCompetitions = Router();

routeurCompetitions.get('/', obtenirCompetitions); //      lire la liste
routeurCompetitions.post('/', reserveAuxAdministrateurs, creerCompetition); // ajouter

// Les deux-points marquent un PARAMETRE : « :id » accepte n'importe quelle
// valeur, recuperee ensuite par requete.params['id'].
routeurCompetitions.get('/:id', obtenirCompetition); //    lire un element
routeurCompetitions.put('/:id', reserveAuxAdministrateurs, modifierCompetition); // remplacer
routeurCompetitions.delete('/:id', reserveAuxAdministrateurs, supprimerCompetition); // supprimer
