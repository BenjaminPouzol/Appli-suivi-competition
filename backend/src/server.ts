// Charge le fichier .env et place son contenu dans process.env.
// Cet import doit venir EN PREMIER : tout code lisant une variable
// d'environnement avant cette ligne ne trouverait rien.
import 'dotenv/config';

import { creerApplication } from './app';
import { ORIGINE_FRONTEND, PORT } from './config';

const app = creerApplication();

app.listen(PORT, () => {
  console.log(`API démarrée sur http://localhost:${PORT}`);
  console.log(`Vérification : http://localhost:${PORT}/api/sante`);
  console.log(`Frontend autorisé : ${ORIGINE_FRONTEND}`);
});
