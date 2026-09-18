import { Component, computed, input, linkedSignal } from '@angular/core';
import { Cote, DetailsLol, PartieLol, PosteLol, TypeDragon } from '../../modeles/details';
import { Equipe } from '../../modeles/equipe';
import { Match } from '../../modeles/match';
import { formaterDuree, formaterMilliers } from '../../outils/statistiques';

const LIBELLES_POSTE: Record<PosteLol, string> = {
  top: 'Top',
  jungle: 'Jungle',
  mid: 'Mid',
  adc: 'ADC',
  support: 'Support',
};

const LIBELLES_DRAGON: Record<TypeDragon, string> = {
  infernal: 'Infernal',
  ocean: 'Océan',
  montagne: 'Montagne',
  nuage: 'Nuage',
  hextech: 'Hextech',
  chemtech: 'Chemtech',
  ancestral: 'Ancestral',
};

/**
 * La partie a montrer quand on arrive sur la page : celle qui se joue, ou a
 * defaut la derniere jouee.
 */
function partieParDefaut(parties: PartieLol[]): number | null {
  const enCours = parties.find((partie) => partie.vainqueur === null);
  return (enCours ?? parties.at(-1))?.numero ?? null;
}

/**
 * Etape 10 : le panneau d'un match de League of Legends.
 *
 * Une serie se joue en plusieurs parties : des boutons permettent de choisir
 * celle a afficher. Pour la partie choisie : les objectifs de chaque equipe,
 * puis la ligne de chaque joueur.
 */
@Component({
  selector: 'app-panneau-lol',
  styleUrl: './panneau-lol.css',
  templateUrl: './panneau-lol.html',
})
export class PanneauLol {
  readonly details = input.required<DetailsLol>();
  readonly match = input.required<Match>();

  readonly cotes: readonly Cote[] = ['domicile', 'exterieur'];

  /**
   * Le numero de la partie affichee.
   *
   * Un signal ordinaire ne conviendrait pas : la page recharge le detail
   * toutes les 30 secondes, et il faut alors choisir une partie par defaut
   * -- sauf si la personne en a deja choisi une, qu'on garde.
   *
   * linkedSignal() fait exactement cela. Il se RECALCULE quand sa source (les
   * parties) change, mais peut aussi etre modifie a la main avec set(), comme
   * un signal ordinaire. Sa fonction de calcul recoit la valeur PRECEDENTE :
   * si la partie choisie existe toujours, on la garde.
   */
  readonly numeroChoisi = linkedSignal<PartieLol[], number | null>({
    source: () => this.details().parties,
    computation: (parties, precedent) => {
      if (precedent !== undefined && parties.some((partie) => partie.numero === precedent.value)) {
        return precedent.value;
      }
      return partieParDefaut(parties);
    },
  });

  readonly partie = computed(
    () => this.details().parties.find((partie) => partie.numero === this.numeroChoisi()) ?? null,
  );

  equipe(cote: Cote): Equipe {
    return cote === 'domicile' ? this.match().domicile : this.match().exterieur;
  }

  duree(secondes: number): string {
    return formaterDuree(secondes);
  }

  milliers(valeur: number): string {
    return formaterMilliers(valeur);
  }

  poste(poste: PosteLol): string {
    return LIBELLES_POSTE[poste];
  }

  dragons(types: TypeDragon[]): string {
    return types.map((type) => LIBELLES_DRAGON[type]).join(', ');
  }
}
