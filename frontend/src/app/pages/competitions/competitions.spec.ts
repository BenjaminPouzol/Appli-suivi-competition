import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Competitions } from './competitions';

describe('Competitions', () => {
  let component: Competitions;
  let fixture: ComponentFixture<Competitions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Competitions],
    }).compileComponents();

    fixture = TestBed.createComponent(Competitions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('affiche une carte par competition', () => {
    const cartes = (fixture.nativeElement as HTMLElement).querySelectorAll('.carte');
    expect(cartes.length).toBe(4);
  });

  it('affiche le nom des competitions issues du service', () => {
    const texte = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(texte).toContain('League of Legends');
    expect(texte).toContain('Ligue des Champions');
  });
});
