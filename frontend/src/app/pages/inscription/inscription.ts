import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormField,
  FormRoot,
  TreeValidationResult,
  form,
  maxLength,
  minLength,
  pattern,
  required,
  validate,
} from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { ErreursChamp, erreursVisibles } from '../../composants/erreurs-champ/erreurs-champ';
import { AuthService } from '../../services/auth';
import { aLeStatut, messageErreurApi } from '../../outils/erreurs-api';

/** Memes regles que le backend (validation/auth.validation.ts). */
const FORMAT_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOT_DE_PASSE_MIN = 12;
const MOT_DE_PASSE_MAX = 128;

/** Etape 8 : la page de creation de compte. */
@Component({
  imports: [RouterLink, FormRoot, FormField, ErreursChamp],
  selector: 'app-inscription',
  styleUrl: './inscription.css',
  templateUrl: './inscription.html',
})
export class Inscription {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly erreursVisibles = erreursVisibles;
  readonly motDePasseMin = MOT_DE_PASSE_MIN;

  readonly erreurInscription = signal<string | null>(null);

  private readonly champs = signal({
    pseudo: '',
    email: '',
    motDePasse: '',
    confirmation: '',
  });

  readonly formulaire = form(
    this.champs,
    (chemin) => {
      required(chemin.pseudo, { message: 'Choisis un pseudo.' });
      minLength(chemin.pseudo, 2, { message: '2 caractères minimum.' });
      maxLength(chemin.pseudo, 30, { message: '30 caractères maximum.' });

      required(chemin.email, { message: 'Indique ton adresse email.' });
      // Pourquoi pas la regle toute faite email() de Signal Forms ? Elle suit
      // la norme HTML, qui accepte « benjamin@exemple » (sans point) -- une
      // adresse que le backend refuse. Un formulaire plus tolerant que l'API
      // laisserait passer une saisie... pour afficher une erreur serveur juste
      // apres. On reprend donc exactement la regle du backend.
      pattern(chemin.email, FORMAT_EMAIL, { message: 'Adresse email invalide.' });

      required(chemin.motDePasse, { message: 'Choisis un mot de passe.' });
      minLength(chemin.motDePasse, MOT_DE_PASSE_MIN, {
        message: `${MOT_DE_PASSE_MIN} caractères minimum.`,
      });
      maxLength(chemin.motDePasse, MOT_DE_PASSE_MAX, {
        message: `${MOT_DE_PASSE_MAX} caractères maximum.`,
      });

      // La confirmation n'existe que dans le formulaire : elle n'est jamais
      // envoyee au serveur. Elle protege d'une faute de frappe invisible,
      // puisque les caracteres sont masques.
      validate(chemin.confirmation, ({ value, valueOf }) =>
        value() !== valueOf(chemin.motDePasse)
          ? { kind: 'confirmation', message: 'Les deux mots de passe ne correspondent pas.' }
          : undefined,
      );
    },
    { submission: { action: () => this.creerCompte() } },
  );

  private async creerCompte(): Promise<TreeValidationResult> {
    this.erreurInscription.set(null);

    // La confirmation est laissee de cote : le serveur n'en a que faire.
    const { pseudo, email: adresse, motDePasse } = this.champs();

    try {
      await firstValueFrom(this.auth.inscrire({ pseudo, email: adresse, motDePasse }));
    } catch (erreur) {
      if (aLeStatut(erreur, 409)) {
        // Comme pour l'identifiant d'une competition (etape 7) : seul le
        // serveur sait que l'adresse est prise, et l'erreur va sous le champ.
        return {
          fieldTree: this.formulaire.email,
          kind: 'email-pris',
          message: 'Un compte existe déjà avec cette adresse. Connecte-toi plutôt.',
        };
      }
      this.erreurInscription.set(messageErreurApi(erreur, "L'inscription a échoué."));
      return undefined;
    }

    // Le compte est cree et la session ouverte : direction l'accueil.
    await this.router.navigateByUrl('/');
    return undefined;
  }
}
