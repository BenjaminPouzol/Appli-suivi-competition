import { Component, computed, input } from '@angular/core';
import { But, Cote, DetailsFootball, StatistiquesFootball } from '../../modeles/details';
import { Equipe } from '../../modeles/equipe';
import { Match } from '../../modeles/match';
import {
  formaterMinute,
  formaterPourcentage,
  parts,
  pourcentage,
} from '../../outils/statistiques';

/** Une ligne du comparatif : un intitule, et comment lire la valeur d'une equipe. */
interface DefinitionLigne {
  libelle: string;
  valeur: (statistiques: StatistiquesFootball) => number;
  enPourcentage?: boolean;
}

/**
 * Les lignes du comparatif, dans l'ordre d'affichage.
 *
 * « Precision des passes » n'est pas stockee : elle se calcule a partir des
 * passes et des passes reussies. Meme principe qu'en base -- ce qui se
 * calcule ne se stocke pas.
 */
const LIGNES: DefinitionLigne[] = [
  { libelle: 'Possession', valeur: (s) => s.possession, enPourcentage: true },
  { libelle: 'Tirs', valeur: (s) => s.tirs },
  { libelle: 'Tirs cadrés', valeur: (s) => s.tirsCadres },
  { libelle: 'Corners', valeur: (s) => s.corners },
  { libelle: 'Fautes', valeur: (s) => s.fautes },
  { libelle: 'Hors-jeu', valeur: (s) => s.horsJeu },
  { libelle: 'Cartons jaunes', valeur: (s) => s.cartonsJaunes },
  { libelle: 'Cartons rouges', valeur: (s) => s.cartonsRouges },
  { libelle: 'Passes', valeur: (s) => s.passes },
  {
    libelle: 'Précision des passes',
    valeur: (s) => pourcentage(s.passesReussies, s.passes),
    enPourcentage: true,
  },
  { libelle: 'Arrêts du gardien', valeur: (s) => s.arrets },
];

const LIBELLES_TYPE_BUT: Record<But['type'], string> = {
  normal: '',
  penalty: 'penalty',
  csc: 'contre son camp',
};

/**
 * Etape 10 : le panneau d'un match de football -- les buts, puis le
 * comparatif des statistiques des deux equipes.
 *
 * Un composant qui ne fait qu'AFFICHER ce qu'on lui donne (etape 7, voir
 * ErreursChamp) : il ne charge rien, ne modifie rien. C'est la page de
 * detail qui charge les donnees et les lui transmet.
 */
@Component({
  selector: 'app-panneau-football',
  styleUrl: './panneau-football.css',
  templateUrl: './panneau-football.html',
})
export class PanneauFootball {
  readonly details = input.required<DetailsFootball>();
  readonly match = input.required<Match>();

  /** Le comparatif, pret a afficher. Vide tant qu'aucune statistique n'est saisie. */
  readonly lignes = computed(() => {
    const statistiques = this.details().statistiques;
    if (statistiques === null) {
      return [];
    }

    return LIGNES.map(({ libelle, valeur, enPourcentage = false }) => {
      const domicile = valeur(statistiques.domicile);
      const exterieur = valeur(statistiques.exterieur);
      const formater = (nombre: number) => (enPourcentage ? formaterPourcentage(nombre) : String(nombre));

      return {
        libelle,
        domicile: formater(domicile),
        exterieur: formater(exterieur),
        parts: parts(domicile, exterieur),
      };
    });
  });

  equipe(cote: Cote): Equipe {
    return cote === 'domicile' ? this.match().domicile : this.match().exterieur;
  }

  minute(but: But): string {
    return formaterMinute(but.minute, but.tempsAdditionnel);
  }

  typeBut(but: But): string {
    return LIBELLES_TYPE_BUT[but.type];
  }
}
