import { Router } from 'express';
import { obtenirEquipes, obtenirJoueurs } from '../controleurs/equipes.controleur';

/** Etape 7 : lecture seule, pour alimenter les listes deroulantes du formulaire de match. */
export const routeurEquipes = Router();

routeurEquipes.get('/', obtenirEquipes);

// Etape 10 : l'effectif d'une equipe -- pour retrouver l'identifiant d'un
// joueur avant d'ecrire le detail d'un match.
routeurEquipes.get('/:id/joueurs', obtenirJoueurs);
