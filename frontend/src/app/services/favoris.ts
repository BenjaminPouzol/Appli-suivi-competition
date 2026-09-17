import { Service, computed, effect, inject, signal } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Equipe } from '../modeles/equipe';
import { AuthService } from './auth';
import { REDIRIGER_SI_SESSION_EXPIREE } from '../intercepteurs/authentification';
import { messageErreurApi } from '../outils/erreurs-api';

/**
 * Etape 9 : les equipes suivies par la personne connectee.
 *
 * Plusieurs pages en ont besoin -- la page Equipes pour les boutons, la page
 * Matchs pour le filtre et les etoiles. Le service les charge UNE fois, a la
 * connexion, et toutes les pages lisent les memes signaux : cliquer sur une
 * etoile dans une page met a jour les autres instantanement.
 */
@Service()
export class FavorisService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);
  private readonly url = `${environment.urlApi}/moi/favoris`;

  private readonly equipes = signal<Equipe[]>([]);

  /** Les equipes suivies, triees par nom. */
  readonly equipesSuivies = this.equipes.asReadonly();

  /**
   * Les identifiants des equipes suivies, dans un Set.
   *
   * Un Set repond a « contient-il kc ? » immediatement, quelle que soit sa
   * taille -- la ou un tableau devrait etre parcouru. La page Matchs pose
   * cette question pour chaque equipe de chaque match.
   */
  readonly idsSuivis = computed(() => new Set(this.equipes().map((equipe) => equipe.id)));

  /** Les equipes dont une requete est en cours (bouton desactive). */
  readonly enCours = signal<ReadonlySet<string>>(new Set());

  /** Le dernier echec d'une action, a afficher. */
  readonly erreur = signal<string | null>(null);

  /**
   * L'identifiant de la personne connectee, ou null.
   *
   * computed() ne previent ses lecteurs que si la VALEUR change. Deux jetons
   * successifs de la meme personne donnent le meme identifiant : les favoris
   * ne sont pas recharges pour rien.
   */
  private readonly idUtilisateur = computed(() => this.auth.utilisateur()?.id ?? null);

  constructor() {
    /*
     * effect() execute une fonction a chaque fois que les signaux qu'elle LIT
     * changent -- ici, idUtilisateur. C'est l'outil pour relier un signal a
     * une action exterieure : une requete HTTP, le stockage du navigateur...
     *
     * Connexion -> on charge. Deconnexion -> on oublie. Changement de compte
     * -> on recharge : les favoris d'une autre personne ne doivent jamais
     * rester affiches.
     */
    effect(() => {
      const id = this.idUtilisateur();
      this.erreur.set(null);

      if (id === null) {
        this.equipes.set([]);
      } else {
        this.charger(id);
      }
    });
  }

  /** Suit l'equipe si elle ne l'est pas, et inversement. */
  basculer(equipe: Equipe): void {
    if (this.idsSuivis().has(equipe.id)) {
      this.modifier(equipe, 'retirer');
    } else {
      this.modifier(equipe, 'ajouter');
    }
  }

  private charger(idUtilisateur: string): void {
    this.http
      .get<Equipe[]>(this.url, {
        context: new HttpContext().set(REDIRIGER_SI_SESSION_EXPIREE, false),
      })
      .subscribe({
        next: (equipes) => {
          // La personne a pu se deconnecter pendant le chargement : on ne range
          // pas ses favoris sous le nom de quelqu'un d'autre.
          if (this.idUtilisateur() === idUtilisateur) {
            this.equipes.set(equipes);
          }
        },
        error: (erreur) => {
          this.erreur.set(messageErreurApi(erreur, 'Impossible de charger tes équipes suivies.'));
        },
      });
  }

  /**
   * Ajoute ou retire un favori, de facon OPTIMISTE.
   *
   * L'affichage change IMMEDIATEMENT, avant la reponse du serveur. Si le
   * serveur refuse ou ne repond pas, on revient en arriere et on explique.
   *
   * C'est ce que font les jeux en ligne sous le nom de « prediction cote
   * client » : le personnage bouge des l'appui sur la touche, sans attendre
   * le serveur, et se fait corriger dans les rares cas ou celui-ci n'est pas
   * d'accord. L'interface parait instantanee, alors que le reseau ne l'est pas.
   */
  private modifier(equipe: Equipe, action: 'ajouter' | 'retirer'): void {
    // Un clic pendant qu'une requete sur la meme equipe est en cours est
    // ignore. Sans cela, un double clic enverrait PUT puis DELETE, et si les
    // reponses arrivaient dans le desordre, l'ecran et la base ne diraient
    // plus la meme chose.
    if (this.enCours().has(equipe.id)) {
      return;
    }

    this.erreur.set(null);
    this.appliquer(equipe, action);
    this.marquerEnCours(equipe.id, true);

    const adresse = `${this.url}/${encodeURIComponent(equipe.id)}`;
    const requete =
      action === 'ajouter' ? this.http.put<void>(adresse, null) : this.http.delete<void>(adresse);

    requete.subscribe({
      next: () => this.marquerEnCours(equipe.id, false),
      error: (erreur) => {
        // Retour en arriere : on applique l'action INVERSE sur cette seule
        // equipe. Restaurer une copie de toute la liste effacerait les autres
        // favoris modifies entre-temps.
        this.appliquer(equipe, action === 'ajouter' ? 'retirer' : 'ajouter');
        this.marquerEnCours(equipe.id, false);
        this.erreur.set(messageErreurApi(erreur, `Impossible de modifier le suivi de ${equipe.nom}.`));
      },
    });
  }

  private appliquer(equipe: Equipe, action: 'ajouter' | 'retirer'): void {
    this.equipes.update((equipes) => {
      const autres = equipes.filter((existante) => existante.id !== equipe.id);
      if (action === 'retirer') {
        return autres;
      }
      // localeCompare trie en tenant compte des accents et de la langue :
      // « Équipe » se range avec les E, et non apres le Z.
      return [...autres, equipe].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));
    });
  }

  private marquerEnCours(equipeId: string, enCours: boolean): void {
    this.enCours.update((ensemble) => {
      // Un signal ne detecte un changement que si la VALEUR change : modifier
      // le Set existant ne suffirait pas. On en cree un nouveau.
      const copie = new Set(ensemble);
      if (enCours) {
        copie.add(equipeId);
      } else {
        copie.delete(equipeId);
      }
      return copie;
    });
  }
}
