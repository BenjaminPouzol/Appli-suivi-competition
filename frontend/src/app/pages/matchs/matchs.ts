import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatchService } from '../../services/match';
import { CompetitionService } from '../../services/competition';

@Component({
  imports: [DatePipe],
  selector: 'app-matchs',
  styleUrl: './matchs.css',
  templateUrl: './matchs.html',
})
export class Matchs {
  private readonly matchService = inject(MatchService);
  private readonly competitionService = inject(CompetitionService);

  readonly matchsEnDirect = this.matchService.listerParStatut('en-direct');
  readonly matchsAVenir = this.matchService.listerParStatut('a-venir');
  readonly matchsTermines = this.matchService.listerParStatut('termine');

  /**
   * Un match ne stocke que l'identifiant de sa competition, pas son nom.
   * Cette methode fait le lien pour l'affichage.
   *
   * Le « ?? » signifie « si la valeur de gauche est absente, prends celle de
   * droite ». trouverParId peut ne rien trouver : sans ce garde-fou, la page
   * afficherait « undefined ».
   */
  nomCompetition(competitionId: string): string {
    return this.competitionService.trouverParId(competitionId)?.nom ?? 'Compétition inconnue';
  }
}
