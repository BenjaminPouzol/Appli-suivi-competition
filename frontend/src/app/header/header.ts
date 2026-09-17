import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth';

/** Les deux seules valeurs possibles pour le theme. */
export type Theme = 'clair' | 'sombre';

/** Nom sous lequel le choix est range dans le stockage du navigateur. */
const CLE_STOCKAGE = 'theme';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  /**
   * Etape 8 : « protected » et non « private » -- le gabarit lit
   * auth.utilisateur(). Un membre prive ne serait pas accessible au gabarit ;
   * protected le rend visible au gabarit sans l'exposer au reste du code.
   */
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /**
   * Le theme actuellement affiche.
   *
   * C'est un « signal » : une valeur qui previent Angular quand elle change,
   * pour qu'il mette a jour l'affichage tout seul. On lit sa valeur avec des
   * parentheses -- theme() -- et on la modifie avec .set().
   */
  readonly theme = signal<Theme>(this.themeApplique());

  /** Passe d'un theme a l'autre, et retient le choix pour la prochaine visite. */
  basculerTheme(): void {
    const nouveauTheme: Theme = this.theme() === 'clair' ? 'sombre' : 'clair';

    this.theme.set(nouveauTheme);
    document.documentElement.dataset['theme'] = nouveauTheme;

    try {
      localStorage.setItem(CLE_STOCKAGE, nouveauTheme);
    } catch {
      // Stockage indisponible : le theme fonctionne quand meme, il ne sera
      // simplement pas retenu au prochain chargement.
    }
  }

  /**
   * Etape 8 : ferme la session et revient a l'accueil.
   *
   * Sans ce retour, une personne deconnectee depuis un formulaire reserve
   * resterait devant une page qu'elle n'a plus le droit d'utiliser.
   */
  deconnecter(): void {
    this.auth.deconnecter();
    void this.router.navigateByUrl('/');
  }

  /**
   * Lit le theme deja pose sur la balise <html> par le script de index.html.
   * On ne relit pas localStorage ici : ce serait dupliquer une decision
   * (choix enregistre ou preference du systeme) deja prise au chargement.
   */
  private themeApplique(): Theme {
    return document.documentElement.dataset['theme'] === 'sombre' ? 'sombre' : 'clair';
  }
}
