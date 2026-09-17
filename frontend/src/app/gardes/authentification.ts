import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

/**
 * Etape 8 : reserve une page aux administrateurs.
 *
 * Une GARDE (« guard ») est une fonction que le routeur consulte AVANT
 * d'afficher une page. Elle repond :
 *   - true          -> la page s'affiche ;
 *   - une UrlTree   -> le routeur va a cette autre adresse a la place.
 *
 * Attention a ce que la garde protege VRAIMENT. Elle evite a une personne
 * non autorisee de tomber sur un formulaire qui echouerait a l'envoi : c'est
 * du CONFORT. Le code du frontend s'execute dans le navigateur, que chacun
 * peut modifier a sa guise ; contourner une garde prend dix secondes. La
 * SECURITE est assuree par le backend, qui repond 401 ou 403 quoi qu'il
 * arrive.
 */
export const administrateurRequis: CanActivateFn = (_route, etat) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.estConnecte()) {
    // On memorise la page demandee : apres la connexion, on y reviendra.
    return router.createUrlTree(['/connexion'], { queryParams: { retour: etat.url } });
  }

  if (!auth.estAdministrateur()) {
    return router.createUrlTree(['/acces-refuse']);
  }

  return true;
};
