import { Router } from 'express';
import {
  creerMatch,
  modifierMatch,
  obtenirMatch,
  obtenirMatchs,
  supprimerMatch,
} from '../controleurs/matchs.controleur';

export const routeurMatchs = Router();

routeurMatchs.get('/', obtenirMatchs);
routeurMatchs.post('/', creerMatch);
routeurMatchs.get('/:id', obtenirMatch);
routeurMatchs.put('/:id', modifierMatch);
routeurMatchs.delete('/:id', supprimerMatch);
