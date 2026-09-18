import { Router } from 'express';
import {
  creerMatch,
  modifierMatch,
  obtenirMatch,
  obtenirMatchs,
  supprimerMatch,
} from '../controleurs/matchs.controleur';
import {
  modifierCarte,
  modifierFeuilleFootball,
  modifierPartie,
  obtenirDetails,
  supprimerCarte,
  supprimerPartie,
} from '../controleurs/details.controleur';
import { reserveAuxAdministrateurs } from '../middlewares/authentification';

export const routeurMatchs = Router();

routeurMatchs.get('/', obtenirMatchs);
routeurMatchs.post('/', reserveAuxAdministrateurs, creerMatch);
routeurMatchs.get('/:id', obtenirMatch);
routeurMatchs.put('/:id', reserveAuxAdministrateurs, modifierMatch);
routeurMatchs.delete('/:id', reserveAuxAdministrateurs, supprimerMatch);

/*
 * Etape 10 : le detail d'un match. Les adresses s'imbriquent sous celle du
 * match : /api/matchs/m1/parties/2 se lit « la partie 2 du match m1 ».
 * La lecture est publique ; l'ecriture, reservee aux administrateurs.
 */
routeurMatchs.get('/:id/details', obtenirDetails);
routeurMatchs.put('/:id/feuille-football', reserveAuxAdministrateurs, modifierFeuilleFootball);
routeurMatchs.put('/:id/parties/:numero', reserveAuxAdministrateurs, modifierPartie);
routeurMatchs.delete('/:id/parties/:numero', reserveAuxAdministrateurs, supprimerPartie);
routeurMatchs.put('/:id/cartes/:numero', reserveAuxAdministrateurs, modifierCarte);
routeurMatchs.delete('/:id/cartes/:numero', reserveAuxAdministrateurs, supprimerCarte);
