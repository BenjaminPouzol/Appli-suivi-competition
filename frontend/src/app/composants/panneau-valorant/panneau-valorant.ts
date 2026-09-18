import { Component, computed, input, linkedSignal } from '@angular/core';
import { CarteValorant, Cote, DetailsValorant } from '../../modeles/details';
import { Equipe } from '../../modeles/equipe';
import { Match } from '../../modeles/match';
import { formaterEcart, formaterPourcentage } from '../../outils/statistiques';

/** La carte a montrer par defaut : celle qui se joue, sinon la derniere jouee. */
function carteParDefaut(cartes: CarteValorant[]): number | null {
  const enCours = cartes.find((carte) => carte.vainqueur === null);
  return (enCours ?? cartes.at(-1))?.numero ?? null;
}

/**
 * Etape 10 : le panneau d'un match de Valorant.
 *
 * Meme organisation que le panneau de League of Legends : un choix de carte,
 * puis, pour la carte choisie, les rounds de chaque equipe et la ligne de
 * chaque joueur. Voir PanneauLol pour linkedSignal.
 */
@Component({
  selector: 'app-panneau-valorant',
  styleUrl: './panneau-valorant.css',
  templateUrl: './panneau-valorant.html',
})
export class PanneauValorant {
  readonly details = input.required<DetailsValorant>();
  readonly match = input.required<Match>();

  readonly cotes: readonly Cote[] = ['domicile', 'exterieur'];

  readonly numeroChoisi = linkedSignal<CarteValorant[], number | null>({
    source: () => this.details().cartes,
    computation: (cartes, precedent) => {
      if (precedent !== undefined && cartes.some((carte) => carte.numero === precedent.value)) {
        return precedent.value;
      }
      return carteParDefaut(cartes);
    },
  });

  readonly carte = computed(
    () => this.details().cartes.find((carte) => carte.numero === this.numeroChoisi()) ?? null,
  );

  equipe(cote: Cote): Equipe {
    return cote === 'domicile' ? this.match().domicile : this.match().exterieur;
  }

  /** Kills moins morts, signe compris : « +5 », « −3 ». */
  ecart(kills: number, morts: number): string {
    return formaterEcart(kills - morts);
  }

  pourcentage(valeur: number): string {
    return formaterPourcentage(valeur);
  }
}
