// Charge le fichier .env et place son contenu dans process.env.
// Cet import doit venir EN PREMIER : tout code lisant une variable
// d'environnement avant cette ligne ne trouverait rien.
import 'dotenv/config';

import { creerApplication } from './app';

/**
 * Le port d'ecoute vient de l'environnement, avec 3000 comme valeur de repli.
 *
 * process.env ne contient que du TEXTE : « 3000 » et non 3000. Number() fait
 * la conversion, et le || rattrape le cas ou la variable est absente ou
 * illisible (Number('abc') donne NaN, qui est considere comme faux).
 *
 * Cette souplesse est indispensable au deploiement de l'etape 14 : l'hebergeur
 * impose lui-meme le port, via cette variable.
 */
const PORT = Number(process.env['PORT']) || 3000;

const app = creerApplication();

app.listen(PORT, () => {
  console.log(`API démarrée sur http://localhost:${PORT}`);
  console.log(`Vérification : http://localhost:${PORT}/api/sante`);
});
