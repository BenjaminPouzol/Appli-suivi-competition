/**
 * Configuration utilisee pendant le DEVELOPPEMENT.
 *
 * Le backend tourne sur un autre port que le frontend : c'est ce qui rend le
 * CORS necessaire cote serveur.
 */
export const environment = {
  production: false,
  urlApi: 'http://localhost:3000/api',
};
