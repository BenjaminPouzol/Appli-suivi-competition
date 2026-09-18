import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PanneauLol } from './panneau-lol';
import { DetailsLol, PartieLol } from '../../modeles/details';
import { Match } from '../../modeles/match';
import { matchApi, partieLol } from '../../../testing/details-de-test';

/** Le panneau recoit un Match (date convertie), comme dans l'application. */
const MATCH: Match = { ...matchApi('en-direct'), date: new Date('2026-09-14T15:00:00.000Z') };

describe('PanneauLol (etape 10)', () => {
  let fixture: ComponentFixture<PanneauLol>;
  let composant: PanneauLol;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PanneauLol] }).compileComponents();
    fixture = TestBed.createComponent(PanneauLol);
    composant = fixture.componentInstance;
  });

  /**
   * Donne au composant ses deux entrees, comme le ferait la page de detail.
   * setInput() est la facon de remplir un input() depuis un test.
   */
  async function afficher(parties: PartieLol[]): Promise<void> {
    const details: DetailsLol = { discipline: 'lol', parties };
    fixture.componentRef.setInput('details', details);
    fixture.componentRef.setInput('match', MATCH);
    await fixture.whenStable();
  }

  function page(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it("montre d'abord la partie en cours", async () => {
    await afficher([partieLol(1, 'domicile'), partieLol(2, null)]);

    expect(composant.numeroChoisi()).toBe(2);
    expect(page().querySelector('.manche-etat')?.textContent).toContain('partie en cours');
  });

  it('a defaut, montre la derniere partie jouee', async () => {
    await afficher([partieLol(1, 'domicile'), partieLol(2, 'exterieur')]);

    expect(composant.numeroChoisi()).toBe(2);
    expect(page().querySelector('.manche-etat')?.textContent).toContain('victoire de G2 Esports');
  });

  it('garde la partie choisie quand le detail est recharge (linkedSignal)', async () => {
    await afficher([partieLol(1, 'domicile'), partieLol(2, null)]);

    // La personne clique sur « Partie 1 »...
    page().querySelector<HTMLButtonElement>('.filtre')?.click();
    await fixture.whenStable();
    expect(composant.numeroChoisi()).toBe(1);

    // ... puis la page recharge le detail : de NOUVEAUX objets arrivent.
    await afficher([partieLol(1, 'domicile'), partieLol(2, null)]);

    // Le choix a survecu au rechargement.
    expect(composant.numeroChoisi()).toBe(1);
    expect(page().querySelector('.filtre')?.getAttribute('aria-pressed')).toBe('true');
  });

  it('affiche les totaux calcules par le serveur, le gold en milliers', async () => {
    await afficher([partieLol(1, null)]);

    const texte = page().textContent ?? '';
    expect(texte).toContain('33:05');
    // 16 990 gold -> « 17,0 k » (espace fine insecable avant le k).
    expect(texte).toContain('17,0 k');
    expect(texte).toContain('Dragons : Océan');
    // Une ligne de tableau par joueur, dans deux tableaux.
    expect(page().querySelectorAll('tbody tr').length).toBe(2);
  });

  it('signale une serie qui n\'a pas encore commence', async () => {
    await afficher([]);

    expect(composant.numeroChoisi()).toBeNull();
    expect(page().textContent).toContain('Aucune partie commencée');
  });
});
