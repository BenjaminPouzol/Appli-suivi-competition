import { Component, computed, inject, signal } from '@angular/core';
import { CompetitionService } from '../../services/competition';
import { Competition } from '../../modeles/competition';

@Component({
  imports: [],
  selector: 'app-competitions',
  styleUrl: './competitions.css',
  templateUrl: './competitions.html',
})
export class Competitions {
  private readonly competitionService = inject(CompetitionService);

  /*
   * Trois signaux pour trois etats possibles.
   *
   * A l'etape 3, les donnees etaient simplement la. Maintenant qu'elles
   * viennent du reseau, il existe trois situations distinctes : on attend,
   * ca a echoue, ou on a recu quelque chose. Chacune doit etre representee,
   * sinon l'interface ne saura pas quoi afficher pendant l'attente.
   */
  readonly chargement = signal(true);
  readonly erreur = signal<string | null>(null);
  private readonly competitions = signal<Competition[]>([]);

  /*
   * computed() cree une valeur DERIVEE d'autres signaux : elle se recalcule
   * toute seule quand ceux-ci changent, et jamais autrement.
   *
   * Le tri par univers se fait donc cote frontend, a partir d'une seule
   * requete -- plutot que d'appeler deux fois l'API avec ?univers=.
   */
  readonly competitionsEsport = computed(() =>
    this.competitions().filter((competition) => competition.univers === 'esport'),
  );

  readonly competitionsFootball = computed(() =>
    this.competitions().filter((competition) => competition.univers === 'football'),
  );

  constructor() {
    this.competitionService.listerToutes().subscribe({
      // Appele si le serveur repond correctement.
      next: (competitions) => {
        this.competitions.set(competitions);
        this.chargement.set(false);
      },
      // Appele si quoi que ce soit echoue : serveur eteint, reseau coupe,
      // reponse en erreur. Ne JAMAIS laisser ce cas vide : sans lui, la page
      // resterait bloquee sur « Chargement… » indefiniment.
      error: () => {
        this.erreur.set(
          "Impossible de charger les compétitions. Vérifie que l'API est démarrée.",
        );
        this.chargement.set(false);
      },
    });
  }
}
