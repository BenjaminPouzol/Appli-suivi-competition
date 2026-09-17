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
 *     npm run captures -- etape-08                     (toutes les pages)
 *     npm run captures -- etape-08 matchs connexion    (seulement celles-ci)
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
 * « session » (etape 8) simule une personne connectee avec ce role.
 */
const PAGES = [
  { nom: 'accueil', route: '/' },
  { nom: 'matchs', route: '/matchs' },
  { nom: 'competitions', route: '/competitions' },
  { nom: 'a-propos', route: '/a-propos' },

  // Etape 7 : les formulaires (reserves aux administrateurs depuis l'etape 8).
  { nom: 'match-nouveau', route: '/matchs/nouveau', session: 'administrateur' },
  {
    nom: 'match-nouveau-erreurs',
    route: '/matchs/nouveau',
    session: 'administrateur',
    // Soumettre le formulaire vide fait apparaitre toutes les erreurs.
    preparer: (page) => page.getByRole('button', { name: 'Enregistrer' }).click(),
  },
  {
    nom: 'match-modifier',
    route: '/matchs/m2/modifier',
    session: 'administrateur',
    pleinePage: true,
  },
  {
    nom: 'match-suppression',
    route: '/matchs/m2/modifier',
    session: 'administrateur',
    pleinePage: true,
    // Premier clic seulement : la confirmation s'affiche, rien n'est supprime.
    preparer: (page) => page.getByRole('button', { name: 'Supprimer…' }).click(),
  },
  {
    nom: 'competition-modifier',
    route: '/competitions/lol/modifier',
    session: 'administrateur',
    pleinePage: true,
  },

  // Etape 8 : l'authentification.
  { nom: 'connexion', route: '/connexion' },
  {
    nom: 'inscription-erreurs',
    route: '/inscription',
    preparer: async (page) => {
      await page.getByLabel('Pseudo').fill('Benjamin');
      await page.getByLabel('Adresse email').fill('benjamin@exemple');
      await page.getByLabel('Mot de passe', { exact: true }).fill('court');
      await page.getByLabel('Confirmation du mot de passe').fill('courte');
      await page.getByRole('button', { name: 'Créer mon compte' }).click();
    },
  },
  { nom: 'matchs-administrateur', route: '/matchs', session: 'administrateur' },
  { nom: 'acces-refuse', route: '/matchs/nouveau', session: 'utilisateur' },
];

const THEMES = ['clair', 'sombre'];

const [prefixe, ...pagesDemandees] = process.argv.slice(2);
if (!prefixe) {
  console.error('Usage : npm run captures -- <prefixe> [pages...]   (exemple : etape-08)');
  process.exit(1);
}

const pagesACapturer =
  pagesDemandees.length === 0 ? PAGES : PAGES.filter(({ nom }) => pagesDemandees.includes(nom));

/**
 * Etape 8 : fabrique un jeton FACTICE, a la signature bidon.
 *
 * C'est suffisant pour une capture : le frontend lit le contenu du jeton pour
 * afficher le pseudo et ouvrir les pages reservees, mais ne verifie jamais
 * sa signature. L'API, elle, le refuserait -- et aucune capture n'envoie de
 * requete d'ecriture. C'est d'ailleurs une illustration de la lecon de
 * l'etape 8 : les gardes du frontend sont du confort, pas de la securite.
 */
function jetonFactice(role) {
  const encoder = (objet) => Buffer.from(JSON.stringify(objet)).toString('base64url');
  const contenu = { sub: 'captures', pseudo: 'Benjamin', role, exp: Math.floor(Date.now() / 1000) + 3600 };
  return `${encoder({ alg: 'HS256', typ: 'JWT' })}.${encoder(contenu)}.signature-factice`;
}

const ici = dirname(fileURLToPath(import.meta.url));
const dossierSortie = join(ici, '..', '..', 'docs', 'images');
await mkdir(dossierSortie, { recursive: true });

// channel: 'msedge' utilise l'Edge installe sur la machine, au lieu de
// telecharger un navigateur supplementaire de plusieurs centaines de Mo.
const navigateur = await chromium.launch({ channel: 'msedge' });

for (const theme of THEMES) {
  for (const { nom, route, preparer, pleinePage = false, session } of pagesACapturer) {
    // Un contexte neuf par capture : aucune session ni aucun etat ne passe
    // d'une page a l'autre.
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

    // addInitScript s'execute AVANT le code de la page. Le theme (et le jeton)
    // sont donc deja dans le stockage quand l'application demarre.
    await contexte.addInitScript(
      ({ valeurTheme, jeton }) => {
        try {
          localStorage.setItem('theme', valeurTheme);
          if (jeton) {
            localStorage.setItem('jeton', jeton);
          }
        } catch {
          /* stockage indisponible : la preference systeme prend le relais */
        }
      },
      { valeurTheme: theme, jeton: session ? jetonFactice(session) : null },
    );

    const page = await contexte.newPage();
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });

    if (preparer) {
      await preparer(page);
      // Laisse le temps a Angular de mettre la page a jour.
      await page.waitForTimeout(300);
    }

    const fichier = join(dossierSortie, `${prefixe}-${theme}-${nom}.png`);
    await page.screenshot({ path: fichier, fullPage: pleinePage });
    console.log(`OK  ${prefixe}-${theme}-${nom}.png`);

    await contexte.close();
  }
}

await navigateur.close();
console.log('\nCaptures enregistrees dans docs/images/');
