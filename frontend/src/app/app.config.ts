import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),

    // Rend HttpClient disponible dans toute l'application.
    // Sans cette ligne, un inject(HttpClient) echouerait au demarrage.
    provideHttpClient(),
  ],
};
