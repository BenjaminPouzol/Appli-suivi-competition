import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { forkJoin } from 'rxjs';
import { MatchService } from '../../services/match';
import { CompetitionService } from '../../services/competition';
import { Match, StatutMatch } from '../../modeles/match';
import { Competition } from '../../modeles/competition';
import { Equipe } from '../../modeles/equipe';
import { FavorisService } from '../../services/favoris';

@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-matchs',
  styleUrl: './matchs.css',
  templateUrl: './matchs.html',
})
export class Matchs {
  /** Etape 8 : le gabarit n'affiche les actions d'edition qu'aux administrateurs. */
  protected readonly auth = inject(AuthService);

  /** Etape 9 : les equipes suivies, pour le filtre et les etoiles. */
  protected readonly favoris = inject(FavorisService);

  private readonly matchService = inject(MatchService);
  private readonly competitionService = inject(CompetitionService);

  readonly chargement = signal(true);
  readonly erreur = signal<string | null>(null);

  private readonly matchs = signal<Match[]>([]);
  private readonly competitions = signal<Competition[]>([]);

  /** Etape 9 : afficher tous les matchs, ou seulement ceux des equipes suivies. */
  readonly filtre = signal<'tous' | 'mes-equipes'>('tous');

  /**
   * Etape 9 : le filtre n'a de sens que pour une personne qui suit au moins
   * une equipe. Sinon, « Mes equipes » n'afficherait qu'une page vide.
   */
  readonly filtreDisponible = computed(() => this.favoris.equipesSuivies().length > 0);

  /**
   * Etape 9 : les matchs a afficher, selon le filtre.
   *
   * Un computed() de plus dans la chaine : matchs -> matchsAffiches ->
   * matchsEnDirect. Changer le filtre, suivre une equipe, ou recevoir les
   * matchs recalcule automatiquement tout ce qui en depend -- et rien d'autre.
   */
  private readonly matchsAffiches = computed(() => {
    if (this.filtre() === 'tous' || !this.filtreDisponible()) {
      return this.matchs();
    }
    const suivies = this.favoris.idsSuivis();
    return this.matchs().filter(
      (match) => suivies.has(match.domicile.id) || suivies.has(match.exterieur.id),
    );
  });

  readonly matchsEnDirect = computed(() => this.parStatut('en-direct'));
  readonly matchsAVenir = computed(() => this.parStatut('a-venir'));
  readonly matchsTermines = computed(() => this.parStatut('termine'));

  constructor() {
    /*
     * Cette page a besoin de DEUX ressources : les matchs, et les competitions
     * pour traduire leurs identifiants en noms lisibles.
     *
     * forkJoin lance les deux requetes EN MEME TEMPS et n'appelle « next »
     * qu'une fois les deux arrivees. Les enchainer l'une apres l'autre serait
     * deux fois plus lent pour rien, puisqu'elles sont independantes.
     *
     * Si l'une des deux echoue, « error » est appele : on ne veut pas d'une
     * page a moitie remplie ou chaque match afficherait « Competition
     * inconnue ».
     */
    forkJoin({
      matchs: this.matchService.listerTous(),
      competitions: this.competitionService.listerToutes(),
    }).subscribe({
      next: ({ matchs, competitions }) => {
        this.matchs.set(matchs);
        this.competitions.set(competitions);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set("Impossible de charger les matchs. Vérifie que l'API est démarrée.");
        this.chargement.set(false);
      },
    });
  }

  /** Traduit un identifiant de competition en nom lisible. */
  nomCompetition(competitionId: string): string {
    const competition = this.competitions().find(
      (candidate) => candidate.id === competitionId,
    );
    return competition?.nom ?? 'Compétition inconnue';
  }

  /** Etape 9 : l'equipe fait-elle partie des favoris ? */
  estSuivie(equipe: Equipe): boolean {
    return this.favoris.idsSuivis().has(equipe.id);
  }

  /** Les matchs d'un statut donne, ranges par ordre chronologique. */
  private parStatut(statut: StatutMatch): Match[] {
    // Etape 9 : on part des matchs FILTRES, et non plus de tous les matchs.
    return this.matchsAffiches()
      .filter((match) => match.statut === statut)
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}
