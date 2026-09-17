import { Router } from 'express';
import { routeurAuth } from './auth.routes';
import { routeurCompetitions } from './competitions.routes';
import { routeurEquipes } from './equipes.routes';
import { routeurMatchs } from './matchs.routes';
import { routeurMoi } from './moi.routes';

/** Regroupe toutes les routes de l'API sous un seul routeur. */
export const routeurApi = Router();

/**
 * GET /api/sante
 *
 * Route de « sante » (health check) : elle ne sert a rien pour l'application,
 * mais elle permet de verifier d'un coup d'oeil que le serveur repond. Les
 * hebergeurs s'en servent aussi pour savoir si l'application est vivante --
 * on la retrouvera a l'etape 14, au deploiement.
 */
routeurApi.get('/sante', (_requete, reponse) => {
  reponse.json({
    statut: 'ok',
    horodatage: new Date().toISOString(),
  });
});

routeurApi.use('/competitions', routeurCompetitions);
routeurApi.use('/matchs', routeurMatchs);
routeurApi.use('/equipes', routeurEquipes);
routeurApi.use('/auth', routeurAuth);
routeurApi.use('/moi', routeurMoi);
