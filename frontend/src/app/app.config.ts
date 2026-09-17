import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { intercepteurAuthentification } from './intercepteurs/authentification';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    // Rend HttpClient disponible dans toute l'application.
    // Sans cette ligne, un inject(HttpClient) echouerait au demarrage.
    //
    // Etape 8 : withInterceptors() branche l'intercepteur sur TOUTES les
    // requetes de HttpClient. Aucun service n'a eu a changer.
    provideHttpClient(withInterceptors([intercepteurAuthentification])),
  ],
};
