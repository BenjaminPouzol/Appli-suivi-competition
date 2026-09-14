import express, { Express } from 'express';
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

  // Traduit automatiquement un corps de requete JSON en objet JavaScript.
  // Inutile tant qu'on ne fait que des GET, mais indispensable des l'etape 7,
  // quand le frontend enverra des donnees a enregistrer.
  app.use(express.json());

  // Toutes les routes de l'API sont prefixees par /api. Ce prefixe distingue
  // les appels de donnees du reste : a l'etape 14, le meme serveur pourra
  // servir les fichiers du frontend sur les autres adresses.
  app.use('/api', routeurApi);

  // L'ORDRE COMPTE. Ces deux middlewares sont declares en dernier, donc
  // consultes en dernier : ils n'interviennent que si aucune route n'a repondu.
  app.use(routeIntrouvable);
  app.use(gestionnaireErreurs);

  return app;
}
