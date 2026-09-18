import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormField,
  FormRoot,
  disabled,
  form,
  hidden,
  max,
  min,
  required,
  validate,
} from '@angular/forms/signals';
import { firstValueFrom, forkJoin, of } from 'rxjs';
import { ErreursChamp, erreursVisibles } from '../../composants/erreurs-champ/erreurs-champ';
import { Competition } from '../../modeles/competition';
import { Equipe } from '../../modeles/equipe';
import { DonneesMatch, Match, StatutMatch } from '../../modeles/match';
import { CompetitionService } from '../../services/competition';
import { EquipeService } from '../../services/equipe';
import { MatchService } from '../../services/match';
import { depuisChampDateHeure, versChampDateHeure } from '../../outils/dates';
import { aLeStatut, messageErreurApi } from '../../outils/erreurs-api';

/**
 * Les valeurs des champs, TELLES QUE LE FORMULAIRE LES MANIPULE.
 *
 * Ce n'est pas encore un DonneesMatch : la date y est le texte du champ
 * (« 2026-09-15T18:00 »), et une valeur vide ('') signifie « pas encore
 * choisi ». La conversion vers DonneesMatch n'a lieu qu'a l'envoi.
 */
interface ChampsMatch {
  competitionId: string;
  domicileId: string;
  exterieurId: string;
  date: string;
  statut: StatutMatch;
  scoreDomicile: number | null;
  scoreExterieur: number | null;
}

const CHAMPS_VIDES: ChampsMatch = {
  competitionId: '',
  domicileId: '',
  exterieurId: '',
  date: '',
  statut: 'a-venir',
  scoreDomicile: null,
  scoreExterieur: null,
};

/** Les choix proposes pour le statut, avec leur libelle affiche. */
const STATUTS: { valeur: StatutMatch; libelle: string }[] = [
  { valeur: 'a-venir', libelle: 'À venir' },
  { valeur: 'en-direct', libelle: 'En direct' },
  { valeur: 'termine', libelle: 'Terminé' },
];

/**
 * Etape 7 : le formulaire de match, en creation ET en modification.
 *
 * Un seul composant sert deux adresses :
 *   /matchs/nouveau          -> formulaire vide, envoi en POST
 *   /matchs/:id/modifier     -> formulaire pre-rempli, envoi en PUT
 *
 * Les deux cas partagent tous leurs champs et toutes leurs regles. Ecrire
 * deux composants reviendrait a maintenir deux copies qui finiraient par
 * diverger.
 */
@Component({
  imports: [RouterLink, FormRoot, FormField, ErreursChamp],
  selector: 'app-match-formulaire',
  styleUrl: './match-formulaire.css',
  templateUrl: './match-formulaire.html',
})
export class MatchFormulaire {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly matchService = inject(MatchService);
  private readonly competitionService = inject(CompetitionService);
  private readonly equipeService = inject(EquipeService);

  /**
   * L'identifiant lu dans l'adresse, ou null sur /matchs/nouveau.
   *
   * « snapshot » est une photographie de la route au moment ou le composant
   * est cree. Elle suffit ici : pour passer d'un match a un autre, on repasse
   * toujours par la liste, ce qui recree le composant.
   */
  readonly idMatch = this.route.snapshot.paramMap.get('id');
  readonly enModification = this.idMatch !== null;

  readonly statuts = STATUTS;
  readonly erreursVisibles = erreursVisibles;

  readonly chargement = signal(true);
  readonly erreurChargement = signal<string | null>(null);
  readonly erreurEnregistrement = signal<string | null>(null);

  readonly competitions = signal<Competition[]>([]);
  readonly equipes = signal<Equipe[]>([]);

  /**
   * Etape 10 : le match a-t-il des statistiques detaillees ? Si oui, sa
   * competition, ses equipes et son score en decoulent, et se figent.
   */
  readonly detailsVerrouilles = signal(false);

  /**
   * Le MODELE du formulaire : un simple signal contenant les valeurs.
   *
   * C'est la grande idee des Signal Forms. Le formulaire ne garde pas sa
   * propre copie des donnees : quand on tape dans un champ, c'est ce signal
   * qui change. Et quand on change ce signal (au chargement d'un match a
   * modifier), les champs se mettent a jour tout seuls.
   */
  private readonly champs = signal<ChampsMatch>(CHAMPS_VIDES);

  /**
   * Le formulaire lui-meme, construit autour du modele.
   *
   * form() recoit trois choses :
   *   1. le modele ;
   *   2. le SCHEMA : une fonction qui declare les regles, champ par champ ;
   *   3. les options, dont l'action a lancer quand on soumet un formulaire valide.
   *
   * « chemin » designe chaque champ par son nom : chemin.competitionId,
   * chemin.date... TypeScript connait la forme de ChampsMatch, et refuserait
   * une regle posee sur un champ qui n'existe pas.
   */
  readonly formulaire = form(
    this.champs,
    (chemin) => {
      required(chemin.competitionId, { message: 'Choisis une compétition.' });
      required(chemin.domicileId, { message: "Choisis l'équipe qui reçoit." });
      required(chemin.exterieurId, { message: "Choisis l'équipe qui se déplace." });
      required(chemin.date, { message: 'Indique la date et l’heure du match.' });

      // Une regle qui compare DEUX champs. valueOf() lit la valeur d'un autre
      // champ ; comme tout est signal, la regle est reevaluee quand l'un ou
      // l'autre change.
      validate(chemin.exterieurId, ({ value, valueOf }) =>
        value() !== '' && value() === valueOf(chemin.domicileId)
          ? { kind: 'equipes-identiques', message: 'Une équipe ne peut pas se rencontrer elle-même.' }
          : undefined,
      );

      // Les memes regles s'appliquent aux deux scores : une boucle evite de
      // les ecrire deux fois.
      for (const score of [chemin.scoreDomicile, chemin.scoreExterieur]) {
        // Un match a venir n'a pas de score : le champ est MASQUE. Signal
        // Forms ignore les regles d'un champ masque -- sans quoi un -1 tape
        // avant de repasser en « A venir » bloquerait l'envoi, sur un champ
        // devenu invisible.
        hidden(score, ({ valueOf }) => valueOf(chemin.statut) === 'a-venir');

        required(score, { message: 'Score obligatoire pour un match en cours ou terminé.' });
        min(score, 0, { message: 'Un score ne peut pas être négatif.' });
        max(score, 999, { message: '999 au maximum.' });
        validate(score, ({ value }) =>
          value() !== null && !Number.isInteger(value())
            ? { kind: 'entier', message: 'Nombre entier attendu.' }
            : undefined,
        );
      }

      // Etape 10 : un match detaille fige cinq champs. Ils restent affiches,
      // et leurs valeurs -- inchangees -- partent avec le reste : c'est ce que
      // le serveur verifie avant d'accepter la modification. Comme pour
      // l'identifiant d'une competition, un champ desactive n'est pas valide :
      // ses regles ne bloquent pas l'envoi.
      const verrouille = () => this.detailsVerrouilles();
      disabled(chemin.competitionId, verrouille);
      disabled(chemin.domicileId, verrouille);
      disabled(chemin.exterieurId, verrouille);
      disabled(chemin.scoreDomicile, verrouille);
      disabled(chemin.scoreExterieur, verrouille);
    },
    {
      submission: {
        // Appelee UNIQUEMENT si toutes les regles ci-dessus sont respectees.
        // Sinon, Signal Forms marque tous les champs comme touches, et leurs
        // erreurs s'affichent.
        action: () => this.enregistrer(),
      },
    },
  );

  /**
   * Faut-il afficher les champs de score ? On relit la regle hidden() du
   * schema au lieu de la reecrire : elle n'existe ainsi qu'a un seul endroit.
   */
  readonly scoresVisibles = computed(() => !this.formulaire.scoreDomicile().hidden());

  /*
   * La suppression se fait en deux temps : un premier clic demande
   * confirmation, un second supprime. Une suppression est definitive ; un
   * clic malencontreux ne doit pas suffire.
   */
  readonly confirmationSuppression = signal(false);
  readonly suppressionEnCours = signal(false);
  readonly erreurSuppression = signal<string | null>(null);

  constructor() {
    /*
     * Le formulaire a besoin de trois ressources, chargees en parallele comme
     * a l'etape 5 : les competitions et les equipes (pour les listes de
     * choix) et, en modification seulement, le match a pre-remplir.
     *
     * of(null) est un Observable qui emet immediatement null : il tient la
     * place de la troisieme requete quand il n'y a rien a charger.
     */
    forkJoin({
      competitions: this.competitionService.listerToutes(),
      equipes: this.equipeService.listerToutes(),
      match: this.idMatch === null ? of(null) : this.matchService.trouver(this.idMatch),
    }).subscribe({
      next: ({ competitions, equipes, match }) => {
        this.competitions.set(competitions);
        this.equipes.set(equipes);
        if (match !== null) {
          this.champs.set(this.versChamps(match));
          this.detailsVerrouilles.set(match.scoreCalcule);
        }
        this.chargement.set(false);
      },
      error: (erreur) => {
        this.erreurChargement.set(
          aLeStatut(erreur, 404)
            ? "Ce match n'existe pas, ou a été supprimé."
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
    if (this.idMatch === null) {
      return;
    }

    this.suppressionEnCours.set(true);

    this.matchService.supprimer(this.idMatch).subscribe({
      // Router.navigate() change de page depuis le code, la ou routerLink
      // le fait depuis un lien du gabarit.
      next: () => void this.router.navigate(['/matchs']),
      error: (erreur) => {
        this.erreurSuppression.set(messageErreurApi(erreur, 'La suppression a échoué.'));
        this.suppressionEnCours.set(false);
        this.confirmationSuppression.set(false);
      },
    });
  }

  /**
   * Envoie le formulaire au serveur.
   *
   * Signal Forms attend de l'action une PROMESSE (Promise), et non un
   * Observable : c'est ce qui lui permet de savoir quand l'envoi est termine,
   * et donc de gerer tout seul l'etat submitting() -- qui desactive le bouton
   * pendant l'envoi.
   *
   * firstValueFrom() fait le pont : il transforme l'Observable de HttpClient
   * en Promise, qu'on peut alors attendre avec await -- exactement comme les
   * controleurs du backend attendent la base depuis l'etape 6.
   */
  private async enregistrer(): Promise<void> {
    this.erreurEnregistrement.set(null);

    const donnees = this.versDonnees(this.champs());
    const requete =
      this.idMatch === null
        ? this.matchService.creer(donnees)
        : this.matchService.modifier(this.idMatch, donnees);

    try {
      await firstValueFrom(requete);
    } catch (erreur) {
      // Le serveur a refuse, ou n'a pas repondu. On l'affiche au-dessus des
      // boutons : la personne garde sa saisie et peut reessayer.
      this.erreurEnregistrement.set(messageErreurApi(erreur, "L'enregistrement a échoué."));
      return;
    }

    // Hors du try : si le changement de page echouait, ce ne serait pas un
    // echec de l'enregistrement -- qui, lui, a bien eu lieu.
    await this.router.navigate(['/matchs']);
  }

  /** Match recu de l'API -> valeurs des champs. */
  private versChamps(match: Match): ChampsMatch {
    return {
      competitionId: match.competitionId,
      domicileId: match.domicile.id,
      exterieurId: match.exterieur.id,
      date: versChampDateHeure(match.date),
      statut: match.statut,
      scoreDomicile: match.scoreDomicile,
      scoreExterieur: match.scoreExterieur,
    };
  }

  /** Valeurs des champs -> donnees a envoyer a l'API. */
  private versDonnees(champs: ChampsMatch): DonneesMatch {
    // Un match a venir n'a pas de score, meme si l'on en avait tape un avant
    // de changer le statut : les champs masques ne doivent rien envoyer.
    const aVenir = champs.statut === 'a-venir';

    return {
      competitionId: champs.competitionId,
      domicileId: champs.domicileId,
      exterieurId: champs.exterieurId,
      date: depuisChampDateHeure(champs.date),
      statut: champs.statut,
      scoreDomicile: aVenir ? null : champs.scoreDomicile,
      scoreExterieur: aVenir ? null : champs.scoreExterieur,
    };
  }
}
