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
import { Discipline } from '../../modeles/competition';
import { CompetitionService } from '../../services/competition';
import { aLeStatut, messageErreurApi } from '../../outils/erreurs-api';

/**
 * Les valeurs des champs. La discipline peut valoir '' : tant qu'aucun
 * bouton radio n'est coche, aucune discipline n'est choisie -- et il ne faut
 * pas en choisir une a la place de la personne.
 *
 * Etape 10 : la discipline remplace l'univers, que le serveur en deduit.
 */
interface ChampsCompetition {
  id: string;
  nom: string;
  organisateur: string;
  discipline: Discipline | '';
  description: string;
}

const CHAMPS_VIDES: ChampsCompetition = {
  id: '',
  nom: '',
  organisateur: '',
  discipline: '',
  description: '',
};

/** Les choix proposes pour la discipline, avec leur libelle affiche. */
const DISCIPLINES: { valeur: Discipline; libelle: string }[] = [
  { valeur: 'football', libelle: 'Football' },
  { valeur: 'lol', libelle: 'League of Legends' },
  { valeur: 'valorant', libelle: 'Valorant' },
];

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

  readonly disciplines = DISCIPLINES;
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

      // Etape 10 : figee en modification, comme l'identifiant -- les
      // statistiques des matchs en dependent.
      disabled(chemin.discipline, () => this.enModification);
      required(chemin.discipline, { message: 'Choisis une discipline.' });

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
        // Liste blanche, ici aussi : l'univers recu n'a pas de champ dans le
        // formulaire, on ne le recopie pas.
        this.champs.set({
          id: competition.id,
          nom: competition.nom,
          organisateur: competition.organisateur,
          discipline: competition.discipline,
          description: competition.description,
        });
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

    const { id, nom, organisateur, discipline, description } = this.champs();

    try {
      if (this.idCompetition === null) {
        // required() garantit qu'une discipline a ete choisie : on le dit a TypeScript.
        const competition = { id, nom, organisateur, discipline: discipline as Discipline, description };
        await firstValueFrom(this.competitionService.creer(competition));
      } else {
        // Etape 10 : en modification, seuls ces trois champs partent. Le
        // serveur ignorerait de toute facon une discipline envoyee.
        await firstValueFrom(
          this.competitionService.modifier(this.idCompetition, { nom, organisateur, description }),
        );
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
