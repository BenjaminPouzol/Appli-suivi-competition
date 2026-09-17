import { Router } from 'express';
import {
  nePlusSuivreEquipe,
  obtenirFavoris,
  suivreEquipe,
} from '../controleurs/favoris.controleur';
import { authentifier } from '../middlewares/authentification';

/**
 * Etape 9 : tout ce qui concerne la personne connectee.
 *
 * Branche sur /api/moi dans routes/index.ts.
 */
export const routeurMoi = Router();

/*
 * router.use() place le middleware devant TOUTES les routes de ce routeur,
 * celles declarees ci-dessous comme celles qui s'ajouteront plus tard.
 * Impossible d'oublier authentifier() sur une nouvelle route « moi » : il
 * n'y a nulle part ou l'oublier.
 */
routeurMoi.use(authentifier);

routeurMoi.get('/favoris', obtenirFavoris);
routeurMoi.put('/favoris/:equipeId', suivreEquipe);
routeurMoi.delete('/favoris/:equipeId', nePlusSuivreEquipe);
