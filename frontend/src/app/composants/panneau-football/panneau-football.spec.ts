import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PanneauFootball } from './panneau-football';
import { DetailsFootball, StatistiquesFootball } from '../../modeles/details';
import { Match } from '../../modeles/match';
import { OM, PSG, matchApi } from '../../../testing/details-de-test';

const MATCH: Match = { ...matchApi('en-direct', PSG, OM, [2, 1]), date: new Date('2026-09-14T15:45:00.000Z') };

function statistiques(possession: number, passes: number, passesReussies: number): StatistiquesFootball {
  return {
    possession,
    tirs: 10,
    tirsCadres: 4,
    corners: 5,
    fautes: 8,
    horsJeu: 1,
    cartonsJaunes: 2,
    cartonsRouges: 0,
    passes,
    passesReussies,
    arrets: 2,
  };
}

const DETAILS: DetailsFootball = {
  discipline: 'football',
  statistiques: { domicile: statistiques(58, 402, 356), exterieur: statistiques(42, 291, 238) },
  buts: [
    { cote: 'domicile', buteur: { id: 'b1', nom: 'L. Marchand' }, minute: 12, tempsAdditionnel: null, type: 'normal' },
    { cote: 'exterieur', buteur: { id: 'b2', nom: 'T. Bernard' }, minute: 38, tempsAdditionnel: null, type: 'normal' },
    { cote: 'domicile', buteur: { id: 'b1', nom: 'L. Marchand' }, minute: 45, tempsAdditionnel: 2, type: 'penalty' },
  ],
};

describe('PanneauFootball (etape 10)', () => {
  let fixture: ComponentFixture<PanneauFootball>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PanneauFootball] }).compileComponents();
    fixture = TestBed.createComponent(PanneauFootball);
  });

  async function afficher(details: DetailsFootball): Promise<void> {
    fixture.componentRef.setInput('details', details);
    fixture.componentRef.setInput('match', MATCH);
    await fixture.whenStable();
  }

  function page(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  it('liste les buts dans l\'ordre, temps additionnel et penalty compris', async () => {
    await afficher(DETAILS);

    const buts = page().querySelectorAll('.but');
    expect(buts.length).toBe(3);
    expect(buts[2].textContent).toContain('45+2’');
    expect(buts[2].textContent).toContain('(penalty)');
    // Le but de l'equipe qui se deplace est range a droite.
    expect(buts[1].classList).toContain('but--exterieur');
  });

  it('calcule la precision des passes, qui n\'est pas stockee', async () => {
    await afficher(DETAILS);

    // 356 passes reussies sur 402 : 89 %.
    const texte = page().textContent ?? '';
    expect(texte).toContain('Précision des passes');
    expect(texte).toContain('89 %');
  });

  it('decrit chaque ligne en toutes lettres pour les lecteurs d\'ecran', async () => {
    await afficher(DETAILS);

    const phrase = page().querySelector('.comparaison-ligne .visuellement-masque')?.textContent ?? '';
    expect(phrase).toContain('Possession');
    expect(phrase).toContain('Paris Saint-Germain 58 %');
  });

  it('previent quand rien n\'a encore ete saisi', async () => {
    await afficher({ discipline: 'football', statistiques: null, buts: [] });

    expect(page().textContent).toContain('Aucun but pour l\'instant.');
    expect(page().textContent).toContain('Pas encore de statistiques pour ce match.');
  });
});
