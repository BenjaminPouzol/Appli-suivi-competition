import { Router } from 'express';
import { listerCompetitions, obtenirCompetition } from '../controleurs/competitions.controleur';

/**
 * Un ROUTEUR associe des chemins d'URL a des controleurs.
 *
 * Les chemins ecrits ici sont RELATIFS : ce routeur sera branche sur
 * « /api/competitions » dans routes/index.ts, donc « / » devient en realite
 * « /api/competitions ». Cela permet de changer le prefixe a un seul endroit.
 */
export const routeurCompetitions = Router();

routeurCompetitions.get('/', listerCompetitions);

// Les deux-points marquent un PARAMETRE : « :id » accepte n'importe quelle
// valeur, recuperee ensuite par requete.params['id'].
routeurCompetitions.get('/:id', obtenirCompetition);
