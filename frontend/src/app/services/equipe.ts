import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Equipe } from '../modeles/equipe';

/**
 * Etape 7 : les equipes, en lecture seule.
 *
 * Le formulaire de match en a besoin pour proposer une liste de choix, au
 * lieu de faire saisir un identifiant a la main -- ce qui serait a la fois
 * penible et source de fautes de frappe.
 */
@Service()
export class EquipeService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.urlApi}/equipes`;

  /** GET /api/equipes -- deja triees par nom par le serveur. */
  listerToutes(): Observable<Equipe[]> {
    return this.http.get<Equipe[]>(this.url);
  }
}
