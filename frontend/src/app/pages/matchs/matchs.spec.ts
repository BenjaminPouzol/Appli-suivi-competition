import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Matchs } from './matchs';

describe('Matchs', () => {
  let component: Matchs;
  let fixture: ComponentFixture<Matchs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Matchs],
    }).compileComponents();

    fixture = TestBed.createComponent(Matchs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('affiche tous les matchs du service', () => {
    const lignes = (fixture.nativeElement as HTMLElement).querySelectorAll('.match');
    expect(lignes.length).toBe(8);
  });

  it('met en evidence les matchs en cours', () => {
    const enDirect = (fixture.nativeElement as HTMLElement).querySelectorAll('.match--direct');
    expect(enDirect.length).toBe(component.matchsEnDirect.length);
  });

  it('traduit un identifiant de competition en nom lisible', () => {
    expect(component.nomCompetition('ligue1')).toBe('Ligue 1');
  });

  it('ne laisse pas passer un identifiant inconnu', () => {
    expect(component.nomCompetition('inexistant')).toBe('Compétition inconnue');
  });
});
