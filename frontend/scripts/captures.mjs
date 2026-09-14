/**
 * Genere les captures d'ecran qui illustrent le document d'apprentissage.
 *
 * Le script pilote le Microsoft Edge deja installe sur la machine, en mode
 * « headless » (sans fenetre visible). Pour chaque theme et chaque page, il
 * charge l'application et enregistre une image dans docs/images/.
 *
 * Prerequis : le serveur de developpement doit tourner (npm start).
 *
 * Utilisation, depuis le dossier frontend/ :
 *     npm run captures -- etape-02
 */
import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const BASE_URL = 'http://localhost:4200';

const PAGES = [
  { nom: 'accueil', route: '/' },
  { nom: 'matchs', route: '/matchs' },
  { nom: 'competitions', route: '/competitions' },
  { nom: 'a-propos', route: '/a-propos' },
];

const THEMES = ['clair', 'sombre'];

const prefixe = process.argv[2];
if (!prefixe) {
  console.error('Usage : npm run captures -- <prefixe>   (exemple : etape-02)');
  process.exit(1);
}

const ici = dirname(fileURLToPath(import.meta.url));
const dossierSortie = join(ici, '..', '..', 'docs', 'images');
await mkdir(dossierSortie, { recursive: true });

// channel: 'msedge' utilise l'Edge installe sur la machine, au lieu de
// telecharger un navigateur supplementaire de plusieurs centaines de Mo.
const navigateur = await chromium.launch({ channel: 'msedge' });

for (const theme of THEMES) {
  const contexte = await navigateur.newContext({
    viewport: { width: 1280, height: 860 },
    // Simule la preference systeme, qui sert de valeur par defaut
    // quand aucun choix n'a encore ete enregistre.
    colorScheme: theme === 'sombre' ? 'dark' : 'light',
  });

  // addInitScript s'execute AVANT le code de la page. Le choix est donc
  // deja dans le stockage quand le script de index.html vient le lire.
  await contexte.addInitScript((valeur) => {
    try {
      localStorage.setItem('theme', valeur);
    } catch {
      /* stockage indisponible : la preference systeme ci-dessus prend le relais */
    }
  }, theme);

  const page = await contexte.newPage();

  for (const { nom, route } of PAGES) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });

    const fichier = join(dossierSortie, `${prefixe}-${theme}-${nom}.png`);
    await page.screenshot({ path: fichier });
    console.log(`OK  ${prefixe}-${theme}-${nom}.png`);
  }

  await contexte.close();
}

await navigateur.close();
console.log('\nCaptures enregistrees dans docs/images/');
