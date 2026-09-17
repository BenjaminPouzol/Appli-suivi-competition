import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

/**
 * Etape 8 : page affichee quand une personne connectee demande une page
 * reservee aux administrateurs.
 *
 * C'est l'equivalent, cote interface, du code HTTP 403 : « je sais qui tu es,
 * et tu n'as pas le droit ». Pour « je ne sais pas qui tu es » (401), la garde
 * renvoie plutot vers la page de connexion.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-acces-refuse',
  template: `
    <h1 class="page-titre">Accès réservé</h1>
    <p class="page-intro">Cette page est réservée aux administrateurs.</p>
    @if (auth.utilisateur(); as utilisateur) {
      <p class="page-intro">
        Tu es connecté avec le compte <strong>{{ utilisateur.pseudo }}</strong>, qui n'a pas ce
        rôle.
      </p>
    }
    <a class="bouton bouton--principal" routerLink="/matchs">Retour aux matchs</a>
  `,
  styles: `
    .page-titre {
      margin: 0 0 0.75rem;
      font-size: 2rem;
      letter-spacing: -0.02em;
      color: var(--couleur-texte);
    }

    .page-intro {
      margin: 0 0 1.75rem;
      max-width: 62ch;
      color: var(--couleur-texte-doux);
    }
  `,
})
export class AccesRefuse {
  protected readonly auth = inject(AuthService);
}
