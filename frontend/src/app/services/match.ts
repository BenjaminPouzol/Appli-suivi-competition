import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { DonneesMatch, Match, MatchApi } from '../modeles/match';

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

  /** Etape 7 -- GET /api/matchs/:id */
  trouver(id: string): Observable<Match> {
    return this.http.get<MatchApi>(this.adresse(id)).pipe(map((match) => this.convertir(match)));
  }

  /**
   * Etape 7 -- POST /api/matchs
   *
   * La frontiere fonctionne dans les deux sens. A l'aller, la date Date
   * redevient du texte ; au retour, le match cree repasse par convertir().
   */
  creer(donnees: DonneesMatch): Observable<Match> {
    return this.http
      .post<MatchApi>(this.url, this.versApi(donnees))
      .pipe(map((match) => this.convertir(match)));
  }

  /** Etape 7 -- PUT /api/matchs/:id */
  modifier(id: string, donnees: DonneesMatch): Observable<Match> {
    return this.http
      .put<MatchApi>(this.adresse(id), this.versApi(donnees))
      .pipe(map((match) => this.convertir(match)));
  }

  /** Etape 7 -- DELETE /api/matchs/:id (reponse 204, sans corps). */
  supprimer(id: string): Observable<void> {
    return this.http.delete<void>(this.adresse(id));
  }

  /** Transforme une rencontre venue du reseau en rencontre exploitable. */
  private convertir(match: MatchApi): Match {
    return { ...match, date: new Date(match.date) };
  }

  /**
   * Etape 7 : le chemin inverse, avant d'envoyer.
   *
   * toISOString() produit toujours de l'UTC avec le suffixe « Z » :
   * « 2026-09-15T16:00:00.000Z ». Le backend exige ce fuseau explicite, et
   * c'est exactement ce qu'il recoit -- quel que soit le fuseau du navigateur.
   */
  private versApi(donnees: DonneesMatch) {
    return { ...donnees, date: donnees.date.toISOString() };
  }

  private adresse(id: string): string {
    return `${this.url}/${encodeURIComponent(id)}`;
  }
}
