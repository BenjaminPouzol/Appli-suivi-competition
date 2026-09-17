import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatchService } from '../../services/match';
import { CompetitionService } from '../../services/competition';
import { Match, StatutMatch } from '../../modeles/match';
import { Competition } from '../../modeles/competition';

@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-matchs',
  styleUrl: './matchs.css',
  templateUrl: './matchs.html',
})
export class Matchs {
  private readonly matchService = inject(MatchService);
  private readonly competitionService = inject(CompetitionService);

  readonly chargement = signal(true);
  readonly erreur = signal<string | null>(null);

  private readonly matchs = signal<Match[]>([]);
  private readonly competitions = signal<Competition[]>([]);

  readonly matchsEnDirect = computed(() => this.parStatut('en-direct'));
  readonly matchsAVenir = computed(() => this.parStatut('a-venir'));
  readonly matchsTermines = computed(() => this.parStatut('termine'));

  constructor() {
    /*
     * Cette page a besoin de DEUX ressources : les matchs, et les competitions
     * pour traduire leurs identifiants en noms lisibles.
     *
     * forkJoin lance les deux requetes EN MEME TEMPS et n'appelle « next »
     * qu'une fois les deux arrivees. Les enchainer l'une apres l'autre serait
     * deux fois plus lent pour rien, puisqu'elles sont independantes.
     *
     * Si l'une des deux echoue, « error » est appele : on ne veut pas d'une
     * page a moitie remplie ou chaque match afficherait « Competition
     * inconnue ».
     */
    forkJoin({
      matchs: this.matchService.listerTous(),
      competitions: this.competitionService.listerToutes(),
    }).subscribe({
      next: ({ matchs, competitions }) => {
        this.matchs.set(matchs);
        this.competitions.set(competitions);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set("Impossible de charger les matchs. Vérifie que l'API est démarrée.");
        this.chargement.set(false);
      },
    });
  }

  /** Traduit un identifiant de competition en nom lisible. */
  nomCompetition(competitionId: string): string {
    const competition = this.competitions().find(
      (candidate) => candidate.id === competitionId,
    );
    return competition?.nom ?? 'Compétition inconnue';
  }

  /** Les matchs d'un statut donne, ranges par ordre chronologique. */
  private parStatut(statut: StatutMatch): Match[] {
    return this.matchs()
      .filter((match) => match.statut === statut)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}
