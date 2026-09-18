import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PanneauValorant } from './panneau-valorant';
import { CarteValorant, DetailsValorant } from '../../modeles/details';
import { Match } from '../../modeles/match';
import { carteValorant, matchApi } from '../../../testing/details-de-test';

const MATCH: Match = { ...matchApi('en-direct'), date: new Date('2026-09-14T17:00:00.000Z') };

describe('PanneauValorant (etape 10)', () => {
  let fixture: ComponentFixture<PanneauValorant>;
  let composant: PanneauValorant;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PanneauValorant] }).compileComponents();
    fixture = TestBed.createComponent(PanneauValorant);
    composant = fixture.componentInstance;
  });

  async function afficher(cartes: CarteValorant[]): Promise<void> {
    const details: DetailsValorant = { discipline: 'valorant', cartes };
    fixture.componentRef.setInput('details', details);
    fixture.componentRef.setInput('match', MATCH);
    await fixture.whenStable();
  }

  function page(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('montre la carte en cours, avec les rounds de chaque equipe', async () => {
    await afficher([carteValorant(1, 'Haven', 'domicile'), carteValorant(2, 'Sunset', null)]);

    expect(composant.numeroChoisi()).toBe(2);
    const etat = page().querySelector('.manche-etat')?.textContent ?? '';
    expect(etat).toContain('Sunset : 13 – 9');
    expect(etat).toContain('carte en cours');
  });

  it('calcule l\'ecart kills - morts, avec un vrai signe moins', async () => {
    await afficher([carteValorant(1, 'Haven', 'domicile')]);

    // 22 kills, 13 morts -> +9 ; 13 kills, 16 morts -> −3.
    const texte = page().textContent ?? '';
    expect(texte).toContain('+9');
    expect(texte).toContain('−3');
  });

  it('explique les abreviations des colonnes', async () => {
    await afficher([carteValorant(1, 'Haven', 'domicile')]);

    const acs = page().querySelector('abbr[title="Score de combat moyen par round"]');
    expect(acs?.textContent).toBe('ACS');
    expect(page().querySelector('.tableau-legende')?.textContent).toContain('ADR');
  });
});
