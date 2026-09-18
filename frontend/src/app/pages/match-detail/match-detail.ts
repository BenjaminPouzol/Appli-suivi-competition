import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, catchError, exhaustMap, takeWhile, timer } from 'rxjs';
import { DetailsMatch } from '../../modeles/details';
import { MatchService } from '../../services/match';
import { aLeStatut, messageErreurApi } from '../../outils/erreurs-api';
import { PanneauFootball } from '../../composants/panneau-football/panneau-football';
import { PanneauLol } from '../../composants/panneau-lol/panneau-lol';
import { PanneauValorant } from '../../composants/panneau-valorant/panneau-valorant';

/** Etape 10 : un match en direct est recharge toutes les 30 secondes. */
export const INTERVALLE_ACTUALISATION_MS = 30_000;

/**
 * Etape 10 : la page de detail d'un match -- /matchs/:id.
 *
 * Elle affiche l'en-tete du match (equipes, score, statut), puis le panneau
 * de statistiques de sa discipline. Tant que le match est en direct, elle se
 * recharge toute seule (voir le constructeur).
 */
@Component({
  imports: [DatePipe, RouterLink, PanneauFootball, PanneauLol, PanneauValorant],
  selector: 'app-match-detail',
  styleUrl: './match-detail.css',
  templateUrl: './match-detail.html',
})
export class MatchDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly matchService = inject(MatchService);

  /** Voir MatchFormulaire pour « snapshot ». */
  private readonly idMatch = this.route.snapshot.paramMap.get('id') ?? '';

  readonly intervalleSecondes = INTERVALLE_ACTUALISATION_MS / 1000;

  readonly details = signal<DetailsMatch | null>(null);
  readonly erreur = signal<string | null>(null);
  readonly introuvable = signal(false);
  readonly derniereMiseAJour = signal<Date | null>(null);

  readonly enDirect = computed(() => this.details()?.match.statut === 'en-direct');

  /*
   * Un computed() par discipline. Chacun renvoie le detail s'il est de SA
   * discipline, null sinon. C'est dans ce code TypeScript -- et non dans le
   * gabarit -- que le test sur « discipline » retrecit le type : le gabarit
   * n'a plus qu'a ecrire @if (lol(); as detail) pour recevoir un DetailsLol.
   */
  readonly football = computed(() => {
    const details = this.details();
    return details?.discipline === 'football' ? details : null;
  });

  readonly lol = computed(() => {
    const details = this.details();
    return details?.discipline === 'lol' ? details : null;
  });

  readonly valorant = computed(() => {
    const details = this.details();
    return details?.discipline === 'valorant' ? details : null;
  });

  constructor() {
    /*
     * L'INTERROGATION PERIODIQUE (« polling »), en quatre operateurs :
     *
     *   timer(0, 30 000)      emet tout de suite, puis toutes les 30 secondes ;
     *   takeWhile(...)        s'arrete des qu'il n'y a plus rien a actualiser
     *                         (match termine, ou introuvable) ;
     *   exhaustMap(...)       transforme chaque « tic » en requete -- et IGNORE
     *                         les tics qui arrivent pendant qu'une requete est
     *                         encore en cours, au lieu de les empiler ;
     *   takeUntilDestroyed()  arrete tout quand on quitte la page.
     *
     * Sans ce dernier, le minuteur continuerait de tourner apres le depart
     * de la page, et d'envoyer des requetes pour un ecran qui n'existe plus.
     */
    timer(0, INTERVALLE_ACTUALISATION_MS)
      .pipe(
        takeWhile(() => this.doitActualiser()),
        exhaustMap(() =>
          this.matchService.details(this.idMatch).pipe(
            // Une erreur ne doit pas arreter l'actualisation : on la signale,
            // puis EMPTY (un Observable qui se termine sans rien emettre)
            // laisse le minuteur continuer. La requete suivante reessaiera.
            catchError((erreur: unknown) => {
              this.signalerErreur(erreur);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((details) => {
        this.details.set(details);
        this.erreur.set(null);
        this.derniereMiseAJour.set(new Date());
      });
  }

  /**
   * Faut-il (encore) interroger l'API ? Oui au premier chargement, et tant
   * que le match est en direct. Non si le match n'existe pas.
   */
  private doitActualiser(): boolean {
    if (this.introuvable()) {
      return false;
    }
    const details = this.details();
    return details === null || details.match.statut === 'en-direct';
  }

  private signalerErreur(erreur: unknown): void {
    if (aLeStatut(erreur, 404)) {
      this.introuvable.set(true);
      return;
    }
    // Si des donnees sont deja affichees, on les garde : le message dit
    // seulement que la derniere actualisation a echoue.
    this.erreur.set(
      this.details() === null
        ? messageErreurApi(erreur, 'Impossible de charger ce match.')
        : "La dernière actualisation a échoué. Les chiffres affichés peuvent être en retard ; nouvel essai dans 30 secondes.",
    );
  }
}
