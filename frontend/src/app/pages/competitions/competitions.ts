import { Component, inject } from '@angular/core';
import { CompetitionService } from '../../services/competition';

@Component({
  imports: [],
  selector: 'app-competitions',
  styleUrl: './competitions.css',
  templateUrl: './competitions.html',
})
export class Competitions {
  /**
   * inject() demande a Angular de fournir le service.
   * Le composant ne le construit pas lui-meme : il declare en avoir besoin.
   */
  private readonly competitionService = inject(CompetitionService);

  readonly competitionsEsport = this.competitionService.listerParUnivers('esport');
  readonly competitionsFootball = this.competitionService.listerParUnivers('football');
}
