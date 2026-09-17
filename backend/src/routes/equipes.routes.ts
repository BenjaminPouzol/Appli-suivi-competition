import { Router } from 'express';
import { obtenirEquipes } from '../controleurs/equipes.controleur';

/** Etape 7 : lecture seule, pour alimenter les listes deroulantes du formulaire de match. */
export const routeurEquipes = Router();

routeurEquipes.get('/', obtenirEquipes);
