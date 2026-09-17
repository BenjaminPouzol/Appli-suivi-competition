import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Equipe } from '../../modeles/equipe';
import { AuthService } from '../../services/auth';
import { EquipeService } from '../../services/equipe';
import { FavorisService } from '../../services/favoris';

/**
 * Etape 9 : la liste des equipes, avec un bouton pour suivre chacune.
 *
 * La liste elle-meme est publique ; les boutons n'apparaissent qu'aux
 * personnes connectees.
 */
@Component({
  imports: [RouterLink],
  selector: 'app-equipes',
  styleUrl: './equipes.css',
  templateUrl: './equipes.html',
})
export class Equipes {
  protected readonly auth = inject(AuthService);
  protected readonly favoris = inject(FavorisService);
  private readonly equipeService = inject(EquipeService);

  readonly chargement = signal(true);
  readonly erreur = signal<string | null>(null);
  readonly equipes = signal<Equipe[]>([]);

  constructor() {
    this.equipeService.listerToutes().subscribe({
      next: (equipes) => {
        this.equipes.set(equipes);
        this.chargement.set(false);
      },
      error: () => {
        this.erreur.set("Impossible de charger les équipes. Vérifie que l'API est démarrée.");
        this.chargement.set(false);
      },
    });
  }
}
