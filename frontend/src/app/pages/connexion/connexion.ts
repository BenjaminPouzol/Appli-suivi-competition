import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormField, FormRoot, form, required } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { ErreursChamp, erreursVisibles } from '../../composants/erreurs-champ/erreurs-champ';
import { AuthService } from '../../services/auth';
import { adresseDeRetour } from '../../outils/adresse-retour';
import { aLeStatut, messageErreurApi } from '../../outils/erreurs-api';

/**
 * Etape 8 : la page de connexion.
 *
 * Meme construction que les formulaires de l'etape 7 : un modele, un schema,
 * une action de soumission.
 */
@Component({
  imports: [RouterLink, FormRoot, FormField, ErreursChamp],
  selector: 'app-connexion',
  styleUrl: './connexion.css',
  templateUrl: './connexion.html',
})
export class Connexion {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly parametres = inject(ActivatedRoute).snapshot.queryParamMap;

  readonly erreursVisibles = erreursVisibles;

  /** Page ou revenir apres la connexion, verifiee (voir adresse-retour.ts). */
  private readonly retour = adresseDeRetour(this.parametres.get('retour'));

  /** Arrive-t-on ici parce que l'API a refuse un jeton perime ? */
  readonly sessionExpiree = this.parametres.get('raison') === 'session-expiree';

  readonly erreurConnexion = signal<string | null>(null);

  private readonly champs = signal({ email: '', motDePasse: '' });

  /*
   * Volontairement peu de regles : on verifie seulement que les champs sont
   * remplis. Imposer ici les 12 caracteres de l'inscription donnerait un
   * indice a qui essaie de deviner un mot de passe -- et bloquerait les
   * comptes crees avant un eventuel durcissement des regles.
   */
  readonly formulaire = form(
    this.champs,
    (chemin) => {
      required(chemin.email, { message: 'Indique ton adresse email.' });
      required(chemin.motDePasse, { message: 'Indique ton mot de passe.' });
    },
    { submission: { action: () => this.seConnecter() } },
  );

  private async seConnecter(): Promise<void> {
    this.erreurConnexion.set(null);

    try {
      await firstValueFrom(this.auth.connecter(this.champs()));
    } catch (erreur) {
      this.erreurConnexion.set(
        aLeStatut(erreur, 401)
          ? 'Email ou mot de passe incorrect.'
          : messageErreurApi(erreur, 'La connexion a échoué.'),
      );
      return;
    }

    // navigateByUrl, et non navigate : « retour » est deja une adresse
    // complete, avec ses eventuels parametres (« /matchs/m2/modifier »).
    await this.router.navigateByUrl(this.retour);
  }
}
