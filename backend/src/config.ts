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
