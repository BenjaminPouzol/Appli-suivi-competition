import { Service, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  DonneesConnexion,
  DonneesInscription,
  ReponseAuthentification,
  Utilisateur,
} from '../modeles/utilisateur';
import { lireContenuJeton } from '../outils/jetons';

/** Nom sous lequel le jeton est range dans le stockage du navigateur. */
const CLE_JETON = 'jeton';

/**
 * Etape 8 : la session de la personne connectee.
 *
 * Ce service est la SEULE source de verite sur « qui est connecte ». Le
 * bandeau, les pages, l'intercepteur et les gardes le consultent tous : un
 * seul endroit a mettre a jour quand on se connecte ou se deconnecte.
 *
 * Tout repose sur un signal contenant le jeton. Le reste -- la personne, son
 * role -- en est DERIVE avec computed() : impossible que le pseudo affiche
 * et le jeton envoye au serveur racontent deux histoires differentes.
 */
@Service()
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.urlApi}/auth`;

  private readonly jetonStocke = signal<string | null>(this.lireStockage());

  /** Le jeton actuel, en lecture seule pour le reste de l'application. */
  readonly jeton = this.jetonStocke.asReadonly();

  /** La personne connectee, lue dans le jeton -- ou null. */
  readonly utilisateur = computed(() => {
    const jeton = this.jetonStocke();
    return jeton === null ? null : lireContenuJeton(jeton);
  });

  readonly estConnecte = computed(() => this.utilisateur() !== null);

  readonly estAdministrateur = computed(() => this.utilisateur()?.role === 'administrateur');

  /** POST /api/auth/inscription -- cree le compte ET ouvre la session. */
  inscrire(donnees: DonneesInscription): Observable<Utilisateur> {
    return this.http
      .post<ReponseAuthentification>(`${this.url}/inscription`, donnees)
      .pipe(map((reponse) => this.ouvrirSession(reponse)));
  }

  /** POST /api/auth/connexion */
  connecter(donnees: DonneesConnexion): Observable<Utilisateur> {
    return this.http
      .post<ReponseAuthentification>(`${this.url}/connexion`, donnees)
      .pipe(map((reponse) => this.ouvrirSession(reponse)));
  }

  /**
   * Ferme la session.
   *
   * Remarque : il n'y a AUCUN appel au serveur. Un JWT n'est enregistre nulle
   * part cote serveur -- c'est tout l'interet d'une authentification « sans
   * etat » (stateless). Se deconnecter, c'est simplement oublier le jeton.
   * Contrepartie : un jeton vole reste valable jusqu'a son expiration.
   */
  deconnecter(): void {
    this.jetonStocke.set(null);
    try {
      localStorage.removeItem(CLE_JETON);
    } catch {
      // Stockage indisponible : le jeton n'y etait de toute facon pas.
    }
  }

  private ouvrirSession(reponse: ReponseAuthentification): Utilisateur {
    this.jetonStocke.set(reponse.jeton);
    try {
      // Sans ce stockage, recharger la page (F5) deconnecterait la personne.
      localStorage.setItem(CLE_JETON, reponse.jeton);
    } catch {
      // Stockage indisponible (navigation privee stricte) : la session
      // fonctionne, elle ne survivra simplement pas au rechargement.
    }
    return reponse.utilisateur;
  }

  /**
   * Relit le jeton laisse par une visite precedente.
   *
   * Un jeton expire ou illisible est efface tout de suite, plutot que d'etre
   * envoye au serveur pour s'y faire refuser.
   */
  private lireStockage(): string | null {
    try {
      const jeton = localStorage.getItem(CLE_JETON);
      if (jeton !== null && lireContenuJeton(jeton) === null) {
        localStorage.removeItem(CLE_JETON);
        return null;
      }
      return jeton;
    } catch {
      return null;
    }
  }
}
