import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormField,
  FormRoot,
  TreeValidationResult,
  disabled,
  form,
  maxLength,
  pattern,
  required,
} from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { ErreursChamp, erreursVisibles } from '../../composants/erreurs-champ/erreurs-champ';
import { Competition, Univers } from '../../modeles/competition';
import { CompetitionService } from '../../services/competition';
import { aLeStatut, messageErreurApi } from '../../outils/erreurs-api';

/**
 * Les valeurs des champs. L'univers peut valoir '' : tant qu'aucun bouton
 * radio n'est coche, aucun univers n'est choisi -- et il ne faut pas en
 * choisir un a la place de la personne.
 */
interface ChampsCompetition {
  id: string;
  nom: string;
  organisateur: string;
  univers: Univers | '';
  description: string;
}

const CHAMPS_VIDES: ChampsCompetition = {
  id: '',
  nom: '',
  organisateur: '',
  univers: '',
  description: '',
};

/** Memes regles que le backend : minuscules, chiffres, tirets. */
const FORMAT_IDENTIFIANT = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Etape 7 : le formulaire de competition, en creation et en modification.
 *
 * Il suit exactement le schema du formulaire de match. Deux differences
 * meritent l'attention : l'identifiant, choisi a la creation puis fige, et le
 * conflit (409) quand cet identifiant est deja pris.
 */
@Component({
  imports: [RouterLink, FormRoot, FormField, ErreursChamp],
  selector: 'app-competition-formulaire',
  styleUrl: './competition-formulaire.css',
  templateUrl: './competition-formulaire.html',
})
export class CompetitionFormulaire {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly competitionService = inject(CompetitionService);

  readonly idCompetition = this.route.snapshot.paramMap.get('id');
  readonly enModification = this.idCompetition !== null;

  readonly erreursVisibles = erreursVisibles;

  // En creation, il n'y a rien a charger : on part directement du formulaire vide.
  readonly chargement = signal(this.enModification);
  readonly erreurChargement = signal<string | null>(null);
  readonly erreurEnregistrement = signal<string | null>(null);

  readonly confirmationSuppression = signal(false);
  readonly suppressionEnCours = signal(false);
  readonly erreurSuppression = signal<string | null>(null);

  private readonly champs = signal<ChampsCompetition>(CHAMPS_VIDES);

  readonly formulaire = form(
    this.champs,
    (chemin) => {
      // L'identifiant est fige en modification. Un champ desactive n'est pas
      // valide par Signal Forms : ses regles ne bloquent donc pas l'envoi.
      disabled(chemin.id, () => this.enModification);

      required(chemin.id, { message: 'Choisis un identifiant court.' });
      maxLength(chemin.id, 30, { message: '30 caractères maximum.' });
      pattern(chemin.id, FORMAT_IDENTIFIANT, {
        message: 'Minuscules, chiffres et tirets uniquement (exemple : coupe-de-france).',
      });

      required(chemin.nom, { message: 'Indique le nom de la compétition.' });
      maxLength(chemin.nom, 80, { message: '80 caractères maximum.' });

      required(chemin.organisateur, { message: "Indique l'organisateur." });
      maxLength(chemin.organisateur, 80, { message: '80 caractères maximum.' });

      required(chemin.univers, { message: 'Choisis un univers.' });

      required(chemin.description, { message: 'Décris la compétition en une ou deux phrases.' });
      maxLength(chemin.description, 500, { message: '500 caractères maximum.' });
    },
    {
      submission: {
        action: () => this.enregistrer(),
      },
    },
  );

  constructor() {
    if (this.idCompetition === null) {
      return;
    }

    this.competitionService.trouver(this.idCompetition).subscribe({
      next: (competition) => {
        this.champs.set({ ...competition });
        this.chargement.set(false);
      },
      error: (erreur) => {
        this.erreurChargement.set(
          aLeStatut(erreur, 404)
            ? "Cette compétition n'existe pas, ou a été supprimée."
            : messageErreurApi(erreur, 'Impossible de charger le formulaire.'),
        );
        this.chargement.set(false);
      },
    });
  }

  demanderSuppression(): void {
    this.erreurSuppression.set(null);
    this.confirmationSuppression.set(true);
  }

  annulerSuppression(): void {
    this.confirmationSuppression.set(false);
  }

  supprimer(): void {
    if (this.idCompetition === null) {
      return;
    }

    this.suppressionEnCours.set(true);

    this.competitionService.supprimer(this.idCompetition).subscribe({
      next: () => void this.router.navigate(['/competitions']),
      error: (erreur) => {
        // Un 409 arrive ici si des matchs dependent encore de la competition :
        // le message du serveur l'explique mieux qu'un texte generique.
        this.erreurSuppression.set(messageErreurApi(erreur, 'La suppression a échoué.'));
        this.suppressionEnCours.set(false);
        this.confirmationSuppression.set(false);
      },
    });
  }

  /**
   * Envoie le formulaire. Voir MatchFormulaire pour firstValueFrom.
   *
   * La nouveaute est la VALEUR DE RETOUR. Si le serveur repond 409
   * (identifiant deja pris), on renvoie une erreur rattachee au champ
   * « id » : Signal Forms l'affiche sous ce champ, comme une erreur de
   * saisie ordinaire, et l'efface des que l'identifiant est modifie.
   *
   * Seul le serveur pouvait detecter ce cas : le navigateur ne connait pas
   * la liste des identifiants deja utilises.
   */
  private async enregistrer(): Promise<TreeValidationResult> {
    this.erreurEnregistrement.set(null);

    const { id, univers, ...reste } = this.champs();
    // required() garantit qu'un univers a ete choisi : on le dit a TypeScript.
    const donnees = { ...reste, univers: univers as Univers };

    try {
      if (this.idCompetition === null) {
        const competition: Competition = { id, ...donnees };
        await firstValueFrom(this.competitionService.creer(competition));
      } else {
        await firstValueFrom(this.competitionService.modifier(this.idCompetition, donnees));
      }
    } catch (erreur) {
      if (aLeStatut(erreur, 409)) {
        return {
          fieldTree: this.formulaire.id,
          kind: 'identifiant-pris',
          message: 'Cet identifiant est déjà utilisé par une autre compétition.',
        };
      }
      this.erreurEnregistrement.set(messageErreurApi(erreur, "L'enregistrement a échoué."));
      return undefined;
    }

    await this.router.navigate(['/competitions']);
    return undefined;
  }
}
