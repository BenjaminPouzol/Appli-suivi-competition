import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from '../services/auth';

/**
 * Etape 8 : joint le jeton a chaque requete vers NOTRE API.
 *
 * Un INTERCEPTEUR s'intercale entre le code qui envoie une requete et le
 * reseau. Toutes les requetes de HttpClient passent par lui, dans les deux
 * sens : il peut modifier la requete au depart, et reagir a la reponse au
 * retour.
 *
 * Sans lui, chaque methode de chaque service devrait ajouter l'en-tete
 * Authorization a la main -- et la premiere oubliee provoquerait un 401
 * incomprehensible.
 */
export const intercepteurAuthentification: HttpInterceptorFn = (requete, suivant) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const jeton = auth.jeton();

  /*
   * Le jeton ne part QUE vers notre API.
   *
   * A partir de l'etape 10, l'application appellera d'autres serveurs. Leur
   * envoyer le jeton reviendrait a leur confier la cle de nos comptes : un
   * jeton « Bearer » appartient a quiconque le porte.
   */
  if (jeton === null || !requete.url.startsWith(environment.urlApi)) {
    return suivant(requete);
  }

  // Une requete HttpClient est IMMUABLE : on ne la modifie pas, on en cree une
  // copie modifiee avec clone().
  const requeteAvecJeton = requete.clone({
    setHeaders: { Authorization: `Bearer ${jeton}` },
  });

  return suivant(requeteAvecJeton).pipe(
    catchError((erreur: unknown) => {
      /*
       * On a envoye un jeton, et le serveur repond 401 : il ne le reconnait
       * plus -- expire, ou signe avec un secret qui a change. La session
       * locale est donc perimee : on la ferme, et on propose de se reconnecter
       * en revenant ensuite a la page en cours.
       */
      if (erreur instanceof HttpErrorResponse && erreur.status === 401) {
        auth.deconnecter();

        // Deja sur la page de connexion : inutile d'y renvoyer, et
        // « retour=/connexion » ferait tourner en rond.
        if (!router.url.startsWith('/connexion')) {
          void router.navigate(['/connexion'], {
            queryParams: { raison: 'session-expiree', retour: router.url },
          });
        }
      }

      // L'erreur continue son chemin : le composant qui a lance la requete
      // doit toujours pouvoir y reagir.
      return throwError(() => erreur);
    }),
  );
};
