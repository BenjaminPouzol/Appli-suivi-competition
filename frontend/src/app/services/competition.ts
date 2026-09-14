import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Competition } from '../modeles/competition';

/**
 * Va chercher les competitions aupres de l'API.
 *
 * Comparee a l'etape 3, la difference est profonde : les methodes ne
 * renvoient plus un tableau, mais un OBSERVABLE de tableau.
 *
 * La raison est le temps. Lire un tableau en memoire est instantane ;
 * interroger un serveur prend des dizaines de millisecondes, parfois
 * beaucoup plus, et peut echouer. Le type doit dire cette verite : « la
 * reponse arrivera plus tard, ou pas du tout » -- ce qu'un Competition[]
 * ne pouvait pas exprimer.
 */
@Service()
export class CompetitionService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.urlApi}/competitions`;

  /**
   * GET /api/competitions
   *
   * Le <Competition[]> indique a TypeScript la forme attendue de la reponse.
   * Attention : c'est une PROMESSE, pas une verification. Angular ne controle
   * pas que le serveur a bien renvoye ca -- il fait confiance. Si l'API
   * changeait de format, l'erreur n'apparaitrait qu'a l'execution.
   */
  listerToutes(): Observable<Competition[]> {
    return this.http.get<Competition[]>(this.url);
  }
}
