import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Competition, DonneesCompetition } from '../modeles/competition';

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

  /*
   * Etape 7 : une methode par operation. Chacune correspond a une methode
   * HTTP, et donc a une route du backend :
   *
   *   trouver    GET     /api/competitions/:id
   *   creer      POST    /api/competitions
   *   modifier   PUT     /api/competitions/:id
   *   supprimer  DELETE  /api/competitions/:id
   */

  /** GET /api/competitions/:id -- pour pre-remplir le formulaire de modification. */
  trouver(id: string): Observable<Competition> {
    return this.http.get<Competition>(this.adresse(id));
  }

  /**
   * POST /api/competitions
   *
   * Le deuxieme argument de post() est le CORPS de la requete. HttpClient le
   * convertit en JSON et ajoute lui-meme l'en-tete
   * « Content-Type: application/json » -- sans lequel express.json() ne lirait
   * rien cote serveur.
   */
  creer(competition: Competition): Observable<Competition> {
    return this.http.post<Competition>(this.url, competition);
  }

  /** PUT /api/competitions/:id -- le serveur renvoie la competition a jour. */
  modifier(id: string, donnees: DonneesCompetition): Observable<Competition> {
    return this.http.put<Competition>(this.adresse(id), donnees);
  }

  /**
   * DELETE /api/competitions/:id
   *
   * Le serveur repond 204, sans corps : il n'y a rien a lire. Observable<void>
   * le dit explicitement -- on attend seulement de savoir si ca a reussi.
   */
  supprimer(id: string): Observable<void> {
    return this.http.delete<void>(this.adresse(id));
  }

  /**
   * Construit l'adresse d'une competition precise.
   *
   * encodeURIComponent protege l'adresse : un identifiant contenant « / » ou
   * « ? » en changerait sinon le sens. Le backend refuse deja ces caracteres,
   * mais le frontend ne doit pas dependre de cette regle pour rester correct.
   */
  private adresse(id: string): string {
    return `${this.url}/${encodeURIComponent(id)}`;
  }
}
