import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Match, MatchApi } from '../modeles/match';

/** Va chercher les rencontres aupres de l'API. */
@Service()
export class MatchService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.urlApi}/matchs`;

  /**
   * GET /api/matchs
   *
   * Les matchs arrivent avec une date sous forme de texte : on la reconvertit
   * en objet Date avant de les laisser entrer dans l'application.
   *
   * Ce nettoyage a sa place ICI, a la frontiere avec le reseau. Le faire plus
   * loin obligerait chaque composant a se souvenir que la date n'en est pas
   * vraiment une -- et le premier qui l'oublierait provoquerait un bug.
   */
  listerTous(): Observable<Match[]> {
    return this.http
      .get<MatchApi[]>(this.url)
      .pipe(map((matchs) => matchs.map((match) => this.convertir(match))));
  }

  /** Transforme une rencontre venue du reseau en rencontre exploitable. */
  private convertir(match: MatchApi): Match {
    return { ...match, date: new Date(match.date) };
  }
}
