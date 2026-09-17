import { Component, computed, input } from '@angular/core';
import { ReadonlyFieldState } from '@angular/forms/signals';

/**
 * Faut-il signaler les erreurs de ce champ ?
 *
 * Seulement une fois le champ TOUCHE (quitte au moins une fois, ou formulaire
 * soumis). Sinon, un formulaire vierge s'ouvrirait couvert de « Ce champ est
 * obligatoire » avant qu'on ait tape quoi que ce soit.
 *
 * La regle est exportee : les formulaires s'en servent aussi pour poser
 * aria-invalid sur le champ, et elle ne doit exister qu'a un seul endroit.
 */
export function erreursVisibles(etat: ReadonlyFieldState<unknown>): boolean {
  return etat.touched() && etat.invalid();
}

/**
 * Etape 7 : affiche les messages d'erreur d'un champ de formulaire.
 *
 * C'est le premier composant du projet qui recoit des donnees de son PARENT.
 * Le formulaire l'utilise ainsi :
 *
 *     <app-erreurs-champ [etat]="formulaire.nom()" identifiant="competition-nom-erreurs" />
 *
 * Chaque attribut remplit une ENTREE (« input ») declaree ci-dessous. Sans ce
 * composant, le meme bloc @if / @for serait recopie sous chacun des champs
 * des deux formulaires.
 *
 * Le gabarit est ecrit directement ici (« template ») plutot que dans un
 * fichier .html separe : pour quelques lignes, un second fichier compliquerait
 * la lecture au lieu de la simplifier.
 */
@Component({
  selector: 'app-erreurs-champ',
  template: `
    <div [id]="identifiant()" class="champ-erreurs">
      @if (visibles()) {
        @for (erreur of etat().errors(); track $index) {
          <p class="champ-erreur">{{ erreur.message }}</p>
        }
      }
    </div>
  `,
})
export class ErreursChamp {
  /**
   * L'etat du champ a surveiller : sa valeur, ses erreurs, s'il a ete touche.
   *
   * input.required() rend l'entree OBLIGATOIRE : oublier [etat] dans le
   * parent devient une erreur de compilation, et non un composant qui
   * n'affiche silencieusement rien.
   */
  readonly etat = input.required<ReadonlyFieldState<unknown>>();

  /**
   * Identifiant HTML du bloc, repris par l'attribut aria-describedby du champ.
   * C'est ce lien qui permet a un lecteur d'ecran d'annoncer l'erreur quand
   * la personne arrive sur le champ.
   */
  readonly identifiant = input.required<string>();

  readonly visibles = computed(() => erreursVisibles(this.etat()));
}
