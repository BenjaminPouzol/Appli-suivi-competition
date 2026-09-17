import { Router } from 'express';
import {
  creerMatch,
  modifierMatch,
  obtenirMatch,
  obtenirMatchs,
  supprimerMatch,
} from '../controleurs/matchs.controleur';
import { reserveAuxAdministrateurs } from '../middlewares/authentification';

export const routeurMatchs = Router();

routeurMatchs.get('/', obtenirMatchs);
routeurMatchs.post('/', reserveAuxAdministrateurs, creerMatch);
routeurMatchs.get('/:id', obtenirMatch);
routeurMatchs.put('/:id', reserveAuxAdministrateurs, modifierMatch);
routeurMatchs.delete('/:id', reserveAuxAdministrateurs, supprimerMatch);
