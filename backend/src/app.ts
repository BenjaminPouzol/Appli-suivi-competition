import express, { Express } from 'express';
import cors from 'cors';
import { ORIGINE_FRONTEND } from './config';
import { routeurApi } from './routes';
import { gestionnaireErreurs, routeIntrouvable } from './middlewares/erreurs';

/**
 * Construit l'application Express, sans la demarrer.
 *
 * Separer la CONSTRUCTION (ici) du DEMARRAGE (server.ts) n'est pas une
 * coquetterie : cela permettra plus tard de creer une application dans un
 * test, de lui envoyer des requetes et de verifier ses reponses, sans jamais
 * ouvrir de port reseau.
 */
export function creerApplication(): Express {
  const app = express();

  /*
   * CORS : autorise le frontend a appeler cette API depuis une autre origine.
   *
   * Le navigateur interdit par defaut qu'une page servie par
   * http://localhost:4200 lise la reponse de http://localhost:3000 -- ce sont
   * deux origines differentes (le port suffit a les distinguer).
   *
   * On nomme explicitement l'origine autorisee plutot que d'ecrire « * ».
   * Le joker ouvrirait l'API a n'importe quel site, ce qui deviendra
   * dangereux des l'etape 8, quand les requetes porteront une identite.
   */
  app.use(cors({ origin: ORIGINE_FRONTEND }));

  // Traduit automatiquement un corps de requete JSON en objet JavaScript.
  // Inutile tant qu'on ne fait que des GET, mais indispensable des l'etape 7.
  app.use(express.json());

  // Toutes les routes de l'API sont prefixees par /api.
  app.use('/api', routeurApi);

  // L'ORDRE COMPTE. Ces deux middlewares sont declares en dernier, donc
  // consultes en dernier : ils n'interviennent que si aucune route n'a repondu.
  app.use(routeIntrouvable);
  app.use(gestionnaireErreurs);

  return app;
}
