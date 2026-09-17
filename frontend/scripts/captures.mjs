/**
 * Genere les captures d'ecran qui illustrent le document d'apprentissage.
 *
 * Le script pilote le Microsoft Edge deja installe sur la machine, en mode
 * « headless » (sans fenetre visible). Pour chaque theme et chaque page, il
 * charge l'application et enregistre une image dans docs/images/.
 *
 * Prerequis : les deux serveurs doivent tourner (npm start et, dans backend/,
 * npm run dev).
 *
 * Utilisation, depuis le dossier frontend/ :
 *     npm run captures -- etape-07                     (toutes les pages)
 *     npm run captures -- etape-07 matchs match-nouveau (seulement celles-ci)
 *
 * Aucune capture ne MODIFIE les donnees : les formulaires sont montres
 * remplis ou en erreur, mais jamais envoyes.
 */
import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const BASE_URL = 'http://localhost:4200';

/**
 * Les pages a capturer.
 *
 * « preparer » (facultatif) agit sur la page avant la photo : cliquer sur un
 * bouton pour montrer un etat qui n'existe qu'apres une interaction.
 * « pleinePage » capture toute la hauteur, au-dela de la zone visible.
 */
const PAGES = [
  { nom: 'accueil', route: '/' },
  { nom: 'matchs', route: '/matchs' },
  { nom: 'competitions', route: '/competitions' },
  { nom: 'a-propos', route: '/a-propos' },

  // Etape 7 : les formulaires.
  { nom: 'match-nouveau', route: '/matchs/nouveau' },
  {
    nom: 'match-nouveau-erreurs',
    route: '/matchs/nouveau',
    // Soumettre le formulaire vide fait apparaitre toutes les erreurs.
    preparer: (page) => page.getByRole('button', { name: 'Enregistrer' }).click(),
  },
  { nom: 'match-modifier', route: '/matchs/m2/modifier', pleinePage: true },
  {
    nom: 'match-suppression',
    route: '/matchs/m2/modifier',
    pleinePage: true,
    // Premier clic seulement : la confirmation s'affiche, rien n'est supprime.
    preparer: (page) => page.getByRole('button', { name: 'Supprimer…' }).click(),
  },
  { nom: 'competition-modifier', route: '/competitions/lol/modifier', pleinePage: true },
];

const THEMES = ['clair', 'sombre'];

const [prefixe, ...pagesDemandees] = process.argv.slice(2);
if (!prefixe) {
  console.error('Usage : npm run captures -- <prefixe> [pages...]   (exemple : etape-07)');
  process.exit(1);
}

const pagesACapturer =
  pagesDemandees.length === 0 ? PAGES : PAGES.filter(({ nom }) => pagesDemandees.includes(nom));

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
    // Fixe le fuseau horaire : les heures affichees ne dependent pas de la
    // machine qui genere les captures.
    timezoneId: 'Europe/Paris',
    locale: 'fr-FR',
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

  for (const { nom, route, preparer, pleinePage = false } of pagesACapturer) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });

    if (preparer) {
      await preparer(page);
      // Laisse le temps a Angular de mettre la page a jour.
      await page.waitForTimeout(300);
    }

    const fichier = join(dossierSortie, `${prefixe}-${theme}-${nom}.png`);
    await page.screenshot({ path: fichier, fullPage: pleinePage });
    console.log(`OK  ${prefixe}-${theme}-${nom}.png`);
  }

  await contexte.close();
}

await navigateur.close();
console.log('\nCaptures enregistrees dans docs/images/');
