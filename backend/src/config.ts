/**
 * Regroupe en un seul endroit toutes les valeurs qui viennent de
 * l'environnement, avec leurs valeurs de repli.
 *
 * L'interet de centraliser : on voit d'un coup d'oeil ce que le projet attend
 * de son environnement, et aucun autre fichier n'a besoin de connaitre
 * process.env.
 */

/** Port d'ecoute du serveur. En production, l'hebergeur impose cette valeur. */
export const PORT = Number(process.env['PORT']) || 3000;

/**
 * Adresse exacte du frontend autorise a appeler cette API.
 *
 * Volontairement une adresse precise, et non « * » (tout le monde) : voir
 * l'explication du CORS dans le document d'apprentissage.
 */
export const ORIGINE_FRONTEND = process.env['ORIGINE_FRONTEND'] ?? 'http://localhost:4200';

/**
 * Etape 8 : longueur minimale acceptee pour le secret des jetons.
 *
 * Un secret court se devine par force brute : un attaquant qui possede un
 * seul jeton peut essayer des milliards de secrets par seconde, hors ligne,
 * jusqu'a trouver celui qui reproduit la signature.
 */
const LONGUEUR_MINIMALE_SECRET = 32;

/**
 * Etape 8 : format d'une duree, tel que l'attend la bibliotheque jsonwebtoken :
 * un nombre suivi d'une unite (s, m, h ou d). Exemples : 30m, 8h, 7d.
 */
type Duree = `${number}${'s' | 'm' | 'h' | 'd'}`;

/**
 * Etape 8 : le secret qui signe les jetons de connexion.
 *
 * Contrairement a PORT, il n'a PAS de valeur de repli. Un secret par defaut
 * ecrit dans le code serait public -- il est sur GitHub -- et n'importe qui
 * pourrait fabriquer des jetons valides. Mieux vaut un serveur qui refuse de
 * demarrer qu'un serveur qui demarre sans protection : c'est le principe
 * « echouer tot » (fail fast).
 */
export const SECRET_JWT = lireSecretJwt();

/** Etape 8 : duree de validite d'un jeton (8 heures par defaut). */
export const DUREE_JWT = lireDureeJwt();

function lireSecretJwt(): string {
  const secret = process.env['JWT_SECRET'];

  if (secret === undefined || secret.length < LONGUEUR_MINIMALE_SECRET) {
    throw new Error(
      `JWT_SECRET absent ou trop court (${LONGUEUR_MINIMALE_SECRET} caractères minimum). ` +
        'Voir .env.example pour générer une valeur.',
    );
  }

  return secret;
}

function lireDureeJwt(): Duree {
  const duree = process.env['JWT_DUREE'] ?? '8h';

  if (!/^\d+[smhd]$/.test(duree)) {
    throw new Error(`JWT_DUREE invalide : « ${duree} ». Exemples attendus : 30m, 8h, 7d.`);
  }

  // La verification ci-dessus garantit le format : on peut le dire a TypeScript.
  return duree as Duree;
}
